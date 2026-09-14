from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse
import subprocess, json, hashlib, datetime, tempfile

OUT=Path(__file__).resolve().parent
EXPECTED=json.loads((OUT.parent/'entrega-imagenes-blog-2026-09-14/manifest.json').read_text())['items']
BYKEY={x['asset_key']:x for x in EXPECTED}
BYHASH={x['sha256']:x['asset_key'] for x in EXPECTED}
UA='Mozilla/5.0'

def fetch(url):
    with tempfile.NamedTemporaryFile(prefix='widdo-audit-headers-') as f:
        r=subprocess.run(['curl','-sS','-L','--max-time','40','--retry','1','-A',UA,'-D',f.name,url],capture_output=True)
        headers=Path(f.name).read_text(errors='replace')
        status=None; keep={}
        for line in headers.splitlines():
            if line.startswith('HTTP/'):
                status=int(line.split()[1]);keep={}
            elif ':' in line:
                k,v=line.split(':',1)
                if k.lower() in ['content-type','cache-control','age','x-vercel-cache','x-nextjs-cache','cf-cache-status','location','etag','last-modified','date']:
                    keep[k.lower()]=v.strip()
        return {'status':status,'headers':keep,'body':r.stdout,'curl_error':r.stderr.decode() if r.returncode else None}

def inventory(locale):
    result=[];pages=[];page=1
    while True:
        url=f'https://api.widdo.co/api/blog?locale={locale}&page={page}'
        r=fetch(url)
        assert r['status']==200,(url,r['status'])
        d=json.loads(r['body'])['data'];p=d['posts']
        pages.append({'page':page,'total':p['total'],'last_page':p['last_page'],'available_locales':d.get('available_locales'),'headers':r['headers']})
        for x in p['data']:
            fields=['id','title','slug','locale','featured_image','featured_image_alt','og_image','updated_at','published_at']
            result.append({k:x.get(k) for k in fields})
        if page>=p['last_page']:break
        page+=1
    return {'locale':locale,'posts':result,'pages':pages}

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__();self.images=[];self.meta={};self.links=[];self.ld=[];self.anchor=[];self.inld=False;self.txt=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='a':self.anchor.append(a.get('href'))
        if tag=='img':self.images.append({**a,'parent_link':self.anchor[-1] if self.anchor else None})
        if tag=='meta':
            k=a.get('property',a.get('name'))
            if k:self.meta[k]=a.get('content')
        if tag=='link' and a.get('rel') in ['canonical','alternate']:self.links.append(a)
        if tag=='script' and a.get('type')=='application/ld+json':self.inld=True;self.txt=[]
    def handle_endtag(self,tag):
        if tag=='a' and self.anchor:self.anchor.pop()
        if tag=='script' and self.inld:
            try:self.ld.append(json.loads(''.join(self.txt)))
            except:pass
            self.inld=False
    def handle_data(self,data):
        if self.inld:self.txt.append(data)

def get_page(url):
    r=fetch(url);p=PageParser();p.feed(r['body'].decode(errors='replace'))
    return {'url':url,'status':r['status'],'headers':r['headers'],'images':p.images,'meta':p.meta,'links':p.links,'json_ld':p.ld}

with ThreadPoolExecutor(max_workers=3) as ex: inv=list(ex.map(inventory,['es','en','pt']))
posts=[p for x in inv for p in x['posts']]
(OUT/'inventory.json').write_text(json.dumps({'observed_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'locales':inv},ensure_ascii=False,indent=2))
print(json.dumps({'inventory':{x['locale']:len(x['posts']) for x in inv},'new_posts':[{k:p[k] for k in ['locale','slug','title','featured_image']} for p in posts if f"{p['locale']}:{p['slug']}" not in BYKEY]},ensure_ascii=False),flush=True)
urls=[f"https://widdo.co/{p['locale']}/blog/{p['slug']}" for p in posts]
urls += [f"https://widdo.co/{x['locale']}/blog"+(f"?page={p['page']}" if p['page']>1 else '') for x in inv for p in x['pages']]
pages={}
with ThreadPoolExecutor(max_workers=4) as ex:
    futures={ex.submit(get_page,u):u for u in urls}
    for f in as_completed(futures):
        u=futures[f]
        try:pages[u]=f.result()
        except Exception as e:pages[u]={'url':u,'error':str(e)}
(OUT/'pages.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2))
image_urls={p['featured_image'] for p in posts if p.get('featured_image')}
image_urls.update(p['og_image'] for p in posts if p.get('og_image'))
for page in pages.values():
    for i in page.get('images',[]):
        u=i.get('src','')
        if '/blog/' in u or 'unsplash' in u:image_urls.add(urljoin(page['url'],u))
    for key in ['og:image','twitter:image']:
        if page.get('meta',{}).get(key):image_urls.add(urljoin(page['url'],page['meta'][key]))

def get_image(u):
    r=fetch(u);sha=hashlib.sha256(r['body']).hexdigest()
    return {'url':u,'status':r['status'],'headers':r['headers'],'bytes':len(r['body']),'sha256':sha,'matches_delivered_asset':BYHASH.get(sha)}
images={}
with ThreadPoolExecutor(max_workers=4) as ex:
    futures={ex.submit(get_image,u):u for u in image_urls}
    for f in as_completed(futures):
        u=futures[f]
        try:images[u]=f.result()
        except Exception as e:images[u]={'url':u,'error':str(e)}
(OUT/'image-checks.json').write_text(json.dumps(images,ensure_ascii=False,indent=2))
rows=[]
for p in posts:
    key=f"{p['locale']}:{p['slug']}";expected=BYKEY.get(key)
    url=f"https://widdo.co/{p['locale']}/blog/{p['slug']}"
    page=pages.get(url,{})
    hero=[i for i in page.get('images',[]) if '/storage/blog/' in i.get('src','') or 'unsplash' in i.get('src','') or '/images/blog/' in i.get('src','')]
    hero=hero[0] if hero else None
    cards=[]
    for pageurl,lp in pages.items():
        if pageurl.split('?')[0]==f"https://widdo.co/{p['locale']}/blog":
            for i in lp.get('images',[]):
                if i.get('parent_link','')==f"/{p['locale']}/blog/{p['slug']}":cards.append({'page_url':pageurl,**i})
    img=images.get(p['featured_image'],{})
    row={'asset_key':key,'post':p,'post_url':url,'in_delivery':bool(expected),'expected_image_file':expected['image_file'] if expected else None,'api_image_check':img,'page_status':page.get('status'),'page_headers':page.get('headers'),'hero':hero,'cards':cards,'og_image':page.get('meta',{}).get('og:image'),'twitter_image':page.get('meta',{}).get('twitter:image'),'expected_alt_matches_api':p['featured_image_alt']==expected['featured_image_alt'] if expected else None}
    row['api_status']='ENTREGADA_CORRECTA' if img.get('matches_delivered_asset')==key else ('OTRA_IMAGEN_DEL_PAQUETE' if img.get('matches_delivered_asset') else ('FUERA_DEL_PAQUETE' if not expected else 'CONTENIDO_DISTINTO_REVISAR'))
    row['hero_matches_api']=bool(hero and urljoin(url,hero.get('src',''))==p['featured_image'])
    row['cards_match_api']=all(urljoin(c['page_url'],c['src'])==p['featured_image'] for c in cards) if cards else None
    rows.append(row)
(OUT/'results.json').write_text(json.dumps({'observed_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rows':rows},ensure_ascii=False,indent=2))
for r in rows:
    print(json.dumps({'key':r['asset_key'],'api':r['api_status'],'page_status':r['page_status'],'hero_matches_api':r['hero_matches_api'],'cards':len(r['cards']),'cards_match_api':r['cards_match_api'],'og_matches_api':r['og_image']==r['post']['featured_image'],'alt':r['expected_alt_matches_api']},ensure_ascii=False),flush=True)
