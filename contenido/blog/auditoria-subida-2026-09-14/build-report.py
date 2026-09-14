from pathlib import Path
from urllib.parse import urljoin
from zoneinfo import ZoneInfo
import csv,datetime,hashlib,json

ROOT=Path(__file__).resolve().parent
raw=json.loads((ROOT/'results.json').read_text())
rows=raw['rows']
pages=json.loads((ROOT/'pages-final.json').read_text())
images=json.loads((ROOT/'image-checks.json').read_text())
by_slug={r['post']['slug']:r['post']['locale'] for r in rows}
expected=json.loads((ROOT.parent/'entrega-imagenes-blog-2026-09-14/manifest.json').read_text())['items']
expected_keys={r['asset_key'] for r in expected}
cross=[]
for url,page in pages.items():
    locale=url.split('/')[3]
    for im in page.get('images',[]):
        target=(im.get('parent_link') or '').strip('/').split('/')
        if len(target)==3 and target[1]=='blog' and target[2] in by_slug and by_slug[target[2]]!=locale:
            cross.append({'page_url':url,'page_locale':locale,'target_slug':target[2],'target_locale':by_slug[target[2]],'rendered_link':im['parent_link'],'image_url':im.get('src')})
out=[]
pending=[]
for r in rows:
    page=pages[r['post_url']]
    primary=next((i for i in page.get('images',[]) if '/storage/blog/' in i.get('src','') or 'unsplash' in i.get('src','')),None)
    current=primary.get('src') if primary else None
    matches=images.get(current,{}).get('matches_delivered_asset')==r['asset_key']
    mixed=[c for c in cross if c['page_url']==r['post_url']]
    initial_old=r['in_delivery'] and not r['hero_matches_api']
    status='NUEVA_CORRECTA' if matches else 'PORTADA_ANTERIOR_FUERA_DEL_ZIP'
    item={'asset_key':r['asset_key'],'locale':r['post']['locale'],'post_title':r['post']['title'],'post_url':r['post_url'],'post_slug':r['post']['slug'],'post_id':r['post']['id'],'in_original_delivery':r['in_delivery'],'status':status,'current_image_url':current,'current_image_sha256':images.get(current,{}).get('sha256'),'api_matches_delivery':r['api_status']=='ENTREGADA_CORRECTA','hero_matches_delivery':matches,'list_cards_match_api':r['cards_match_api'],'og_matches_primary':page['meta'].get('og:image')==current,'twitter_matches_primary':page['meta'].get('twitter:image')==current,'alt_matches_delivery':r['expected_alt_matches_api'],'initial_stale_then_revalidated':initial_old,'cross_language_related_count':len(mixed),'cross_language_related':mixed}
    if not r['in_delivery']:
        local=ROOT.parent.parent/'blog-seo/posts/covers'/f"{r['post']['slug']}.jpg"
        assert hashlib.sha256(local.read_bytes()).hexdigest()==item['current_image_sha256']
        item['verified_old_local_source']=str(local)
        suffix={'es':'portada','pt':'capa','en':'cover'}[item['locale']]
        pending.append({'match_by':{'locale':item['locale'],'slug':item['post_slug']},'post_id_observed':item['post_id'],'post_title':item['post_title'],'post_url':item['post_url'],'current_featured_image':current,'suggested_new_filename':f"{item['post_slug']}-{item['locale']}-{suffix}.webp",'action_required':'Generar portada editorial localizada 1600x900 WebP y asignarla a este post; no existe en el ZIP original de 28 portadas.','generation_status':'pending','upload_status':'not_changed_by_audit'})
    out.append(item)
observed=datetime.datetime.now(ZoneInfo('America/Bogota')).isoformat()
summary={locale:{'posts':sum(x['locale']==locale for x in out),'new_correct':sum(x['locale']==locale and x['hero_matches_delivery'] for x in out),'old_outside_zip':sum(x['locale']==locale and not x['in_original_delivery'] for x in out),'pages_with_cross_language_related':sum(x['locale']==locale and x['cross_language_related_count']>0 for x in out)} for locale in ['es','en','pt']}
(ROOT/'FINAL.json').write_text(json.dumps({'observed_at_bogota':observed,'summary':summary,'rows':out,'method':'Live public API, HTML img/meta attributes and downloaded image SHA-256; no CMS writes and no browser rendering claimed.'},ensure_ascii=False,indent=2))
(ROOT/'pendientes-4-portadas.json').write_text(json.dumps({'items':pending},ensure_ascii=False,indent=2))
(ROOT/'cross-language-related-final.json').write_text(json.dumps(cross,ensure_ascii=False,indent=2))
with (ROOT/'revision-post-a-post.csv').open('w',encoding='utf-8-sig',newline='') as f:
    fields=['locale','post_title','post_slug','post_url','status','current_image_url','hero_matches_delivery','list_cards_match_api','og_matches_primary','alt_matches_delivery','initial_stale_then_revalidated','cross_language_related_count']
    w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');w.writeheader();w.writerows(out)
text=['# Auditoría de imágenes publicadas del blog de Widdo','',f'Comprobación terminada: {observed} (America/Bogota).','',
'Se revisaron los 32 posts publicados de los tres idiomas disponibles: API paginada, tarjetas del listado, portada del artículo, Open Graph y Twitter. Las 28 imágenes entregadas coinciden byte por byte (SHA-256) con sus archivos del ZIP y están asignadas al post correcto. Los 4 restantes conservan portadas anteriores verdes de texto. Sus bytes coinciden con los archivos locales de contenido/blog-seo/posts/covers; no se deduce su antigüedad solo por la extensión JPG.','',
'| Idioma | Posts publicados | Portadas nuevas correctas | Portadas anteriores fuera del ZIP | Páginas con relacionados de otro idioma |','|---|---:|---:|---:|---:|']
for l,v in summary.items():text.append(f"| {l.upper()} | {v['posts']} | {v['new_correct']} | {v['old_outside_zip']} | {v['pages_with_cross_language_related']} |")
text+=['','## Las cuatro portadas pendientes','']
for x in pending:
    text += [f"- **{x['match_by']['locale'].upper()} — [{x['post_title']}]({x['post_url']})**. Sigue con el diseño anterior verde de texto. Archivo propuesto: `{x['suggested_new_filename']}`."]
text += ['','Estos cuatro artículos no estaban en el manifiesto de 28 portadas del inventario anterior. Para completar el blog actual hacen falta cuatro imágenes adicionales. Esta auditoría no las genera ni modifica las asignaciones.','',
'## Dos respuestas antiguas que se actualizaron al volver a consultar','',
'En la primera lectura, Morosidad servía una foto de Unsplash y Caos del WhatsApp servía su JPG anterior. Sus tarjetas y la API ya apuntaban al WebP nuevo. En la segunda y tercera lectura ambas páginas mostraron la URL nueva en portada y metadatos. Las imágenes relacionadas antiguas de esas respuestas también cambiaron. Este comportamiento es compatible con una revalidación de caché; no se atribuye a una subida fallida. El código local configura `next: { revalidate: 300 }` para lista y detalle en desarrollo/landing/src/lib/api.ts:24 y :36. No se purgó la caché ni se publicó código.','',
'## Revisión post a post','',
'“Nueva correcta” significa hash exacto del archivo entregado y portada HTML correcta. Las tarjetas coinciden con la API y Open Graph/Twitter con la portada en las 32 páginas. “Mezcla de idiomas” corresponde a imágenes de otros posts en Artículos relacionados, no a la portada principal.','']
for locale,label in [('es','Español'),('en','English'),('pt','Português')]:
    text += [f'### {label}','','| Artículo | Portada principal | Observación |','|---|---|---|']
    for x in out:
        if x['locale']!=locale:continue
        notes=[]
        if x['initial_stale_then_revalidated']:notes.append('Respuesta antigua inicial; nueva al reconsultar')
        if x['cross_language_related_count']:notes.append(f"Relacionados: {x['cross_language_related_count']} portada(s) de otro idioma")
        state='Nueva correcta' if x['hero_matches_delivery'] else '**Anterior: falta generar**'
        text.append(f"| [{x['post_title']}]({x['post_url']}) | {state} | {'; '.join(notes) or 'Sin discrepancias detectadas'} |")
    text.append('')
text+=['## Mezcla de idiomas en artículos relacionados','',f"Detectada en {len({x['page_url'] for x in cross})} páginas, con {len(cross)} tarjetas. Ejemplo: una página EN enlaza a un slug ES y muestra su imagen española. Los enlaces también usan el prefijo del idioma de la página, aunque el post destino tiene otro idioma.",'','| Página | Idioma de la página | Post recomendado | Idioma real del recomendado |','|---|---|---|']
for x in cross:text.append(f"| [{x['page_url'].rsplit('/',1)[1]}]({x['page_url']}) | {x['page_locale']} | {x['target_slug']} | {x['target_locale']} |")
text+=['','Corrección recomendada: filtrar las recomendaciones por locale del post actual. Si se desea ofrecer contenido de otro idioma, indicar ese idioma y construir el enlace con el locale real del post recomendado.','',
'## Evidencias y archivos para continuar','',
'- `revision-post-a-post.csv`: tabla completa de los 32 posts.','- `FINAL.json`: resultados finales, URLs y hashes.','- `pendientes-4-portadas.json`: identificación exacta de las cuatro portadas por generar.','- `inventory.json`: inventario vivo filtrado a campos editoriales.','- `pages.json`: primera observación de las páginas; `pages-final.json`: incorpora la recomprobación de las dos respuestas antiguas.','- `image-checks.json`: estado HTTP, MIME y hash de las imágenes consultadas. Todas respondieron HTTP 200.','- `recheck.json`: comprobación independiente de los dos artículos y su API de detalle.','',
'Alcance: revisión de URLs y bytes servidos en la consulta actual. No implica que todas las cachés de todos los visitantes o regiones estén sincronizadas. No se subieron imágenes, editaron posts ni desplegaron cambios.']
(ROOT/'INFORME.md').write_text('\n'.join(text)+'\n')
assert sum(x['hero_matches_delivery'] for x in out)==28
assert len(pending)==4
assert all(x['list_cards_match_api'] and x['og_matches_primary'] and x['twitter_matches_primary'] for x in out)
print(json.dumps({'summary':summary,'cross_language_pages':len({x['page_url'] for x in cross}),'cross_language_cards':len(cross),'report':str(ROOT/'INFORME.md')},ensure_ascii=False,indent=2))
