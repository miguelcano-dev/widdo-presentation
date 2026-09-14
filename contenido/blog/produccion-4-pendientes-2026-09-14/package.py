from pathlib import Path
import csv,hashlib,html,json,struct,subprocess,zipfile

HERE=Path(__file__).resolve().parent
OUT=HERE.parent/'entrega-4-portadas-pendientes-2026-09-14'
plan=json.loads((HERE/'plan.json').read_text())['items']
sources=json.loads((HERE/'sources.json').read_text())
OUT.mkdir(exist_ok=True)
items=[]
for x,s in zip(plan,sources):
    assert x['asset_key']==s['asset_key']
    locale=x['match_by']['locale'];slug=x['match_by']['slug']
    rel=f"images/{locale}/{x['suggested_new_filename']}"
    dest=OUT/rel;dest.parent.mkdir(parents=True,exist_ok=True)
    subprocess.run(['cwebp','-quiet','-q','86','-m','6','-resize','1600','900','-metadata','none',s['source'],'-o',str(dest)],check=True)
    subprocess.run(['dwebp','-quiet',str(dest),'-o','/dev/null'],check=True,capture_output=True)
    b=dest.read_bytes();assert b[:4]==b'RIFF' and b[8:12]==b'WEBP'
    off=12;dimensions=None
    while off+8<=len(b):
        tag=b[off:off+4];length=struct.unpack_from('<I',b,off+4)[0];data=b[off+8:off+8+length]
        if tag==b'VP8 ':dimensions=(int.from_bytes(data[6:8],'little')&0x3fff,int.from_bytes(data[8:10],'little')&0x3fff);break
        if tag==b'VP8X':dimensions=(int.from_bytes(data[4:7],'little')+1,int.from_bytes(data[7:10],'little')+1);break
        off+=8+length+(length%2)
    assert dimensions==(1600,900)
    item={'asset_key':x['asset_key'],'match_by':x['match_by'],'locale':locale,'post_slug':slug,'post_id_observed':x['post_id_observed'],'post_title':x['post_title'],'post_url':x['post_url'],'image_file':rel,'filename':dest.name,'featured_image_alt':x['featured_image_alt'],'hook_text':x['hook_text'],'width':1600,'height':900,'mime_type':'image/webp','bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'previous_image_at_audit':x['current_featured_image'],'generation_status':'generated','upload_status':'not_uploaded','cms_fields':{'featured_image':'USE_THE_URL_RETURNED_BY_UPLOAD','featured_image_alt':x['featured_image_alt']}}
    items.append(item)
    m=OUT/'metadata'/locale/(slug+'.json');m.parent.mkdir(parents=True,exist_ok=True);m.write_text(json.dumps(item,ensure_ascii=False,indent=2)+'\n')
    p=OUT/'prompts'/locale/(slug+'.txt');p.parent.mkdir(parents=True,exist_ok=True);p.write_text(x['prompt']+'\n')
assert len(items)==4 and len({x['sha256'] for x in items})==4
(OUT/'manifest.json').write_text(json.dumps({'schema_version':2,'created_at':'2026-09-14','scope':'Four supplemental covers only: 2 es, 2 pt. Complements the earlier 28-cover package.','generation_tool':'Built-in image_gen; cwebp for WebP export.','assignment_key':['locale','post_slug'],'items':items},ensure_ascii=False,indent=2)+'\n')
with (OUT/'asignacion.csv').open('w',encoding='utf-8-sig',newline='') as f:
    fields=['locale','post_slug','post_id_observed','post_title','post_url','image_file','featured_image_alt','width','height','sha256']
    w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');w.writeheader();w.writerows(items)
readme='''# Cuatro portadas pendientes de Widdo

Entrega complementaria al ZIP anterior de 28 portadas. Contiene únicamente las cuatro que faltaban: dos en español y dos en portugués. Todas son WebP 1600 × 900, con textos en su idioma. Generadas con la herramienta integrada image_gen y exportadas con cwebp.

## Para la IA que las suba

1. Leer manifest.json o asignacion.csv. Buscar cada artículo por la coincidencia exacta locale + post_slug. Los ID son referencias del entorno auditado, no sustituyen esa comprobación.
2. Guardar los valores actuales de featured_image, featured_image_alt y, si se modifica, og_image. La URL anterior del manifiesto es una observación histórica, no un respaldo actual.
3. Subir únicamente las cuatro imágenes de images/. Conservar sus nombres descriptivos. Usar como featured_image la URL real que devuelva la subida y copiar featured_image_alt del manifiesto en el mismo idioma. No guardar rutas locales ni el marcador USE_THE_URL_RETURNED_BY_UPLOAD.
4. No asignar estas portadas a los equivalentes de otros idiomas. No modificar las otras 28 imágenes, ni títulos, slugs o contenidos.
5. La landing auditada genera Open Graph/Twitter a partir de featured_image. No hace falta otra variante para redes. Si otro consumidor utiliza og_image, mantenerlo coherente usando la URL de la portada subida, sin inventar una URL JPG inexistente.
6. Revalidar los datos del blog y las páginas de listado y detalle mediante el mecanismo que tenga el proyecto. Comprobar nuevamente portada, tarjetas, alt y metadatos. El código auditado usa revalidate: 300: la primera respuesta puede ser anterior mientras se renueva la caché. No basta comprobar solo la respuesta de la API.
7. Confirmar HTTP 200, MIME image/webp, dimensiones 1600 × 900 y correspondencia exacta idioma + slug. Registrar URL final y resultado para cada post.

Estas imágenes son ilustraciones editoriales. Los documentos, listas y pantallas son representaciones conceptuales, no capturas reales de funcionalidades del producto.

Esta entrega no modifica el sitio ni corrige el problema detectado de recomendaciones en otros idiomas. La tarea técnica pendiente es filtrar Artículos relacionados por el idioma del post y construir los enlaces con el idioma real del recomendado.

## Correspondencias exactas

'''
for x in items:
    readme+=f"- **{x['locale'].upper()} — {x['post_title']}**\n  - Archivo: `{x['filename']}`\n  - Post: {x['post_url']}\n\n"
(OUT/'LEEME.md').write_text(readme)
cards=[]
for x in items:
    cards.append(f"<article><a href='{x['image_file']}'><img src='{x['image_file']}' width='1600' height='900' alt='{html.escape(x['featured_image_alt'],quote=True)}'></a><div><b>{x['locale'].upper()}</b><h2>{html.escape(x['post_title'])}</h2><p>{html.escape(x['filename'])}</p><a href='{x['post_url']}'>Ver artículo</a></div></article>")
(OUT/'GALERIA.html').write_text("<!doctype html><html lang='es'><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>Widdo · Cuatro portadas pendientes</title><style>body{background:#111e2c;color:#f4ecd9;font:16px/1.5 system-ui;margin:32px}h1{font-size:32px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:28px}article{background:#203145;border:1px solid #40546a;border-radius:8px;overflow:hidden}img{width:100%;height:auto;display:block}article div{padding:20px}h2{font-size:20px}p{overflow-wrap:anywhere;font-size:13px}a,b{color:#efbb81}</style><h1>Las cuatro portadas pendientes</h1><p>Dos en español · Dos en portugués · WebP 1600 × 900</p><main>"+''.join(cards)+"</main></html>")
archive=HERE.parent/'widdo-4-portadas-pendientes-2026-09-14.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for file in sorted(OUT.rglob('*')):
        if file.is_file():z.write(file,Path(OUT.name)/file.relative_to(OUT))
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert sum(p.endswith('.webp') for p in z.namelist())==4
    for x in items:assert hashlib.sha256(z.read(OUT.name+'/'+x['image_file'])).hexdigest()==x['sha256']
print(json.dumps({'zip':str(archive),'zip_bytes':archive.stat().st_size,'items':[{k:x[k] for k in ['locale','filename','bytes']} for x in items],'checks':'4 WebP decoded; dimensions 1600x900; hashes, unique assets and ZIP CRC passed.'},ensure_ascii=False,indent=2))
