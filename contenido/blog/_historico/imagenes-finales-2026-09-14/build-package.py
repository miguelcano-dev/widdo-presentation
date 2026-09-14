#!/usr/bin/env python3
"""Export approved/generated sources to one WebP per locale+post and build handoff ZIP."""
from pathlib import Path
import csv, hashlib, html, json, struct, subprocess, zipfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent / 'entrega-imagenes-blog-2026-09-14'
PLAN = json.loads((HERE / 'production-plan.json').read_text())['items']
SOURCES = json.loads((HERE / 'source-map.json').read_text())
assert len(PLAN) == len(SOURCES) == 28
ROOT.mkdir(exist_ok=True)
items = []

def webp_dimensions(path):
    b = path.read_bytes()
    assert b[:4] == b'RIFF' and b[8:12] == b'WEBP', path
    off = 12
    while off + 8 <= len(b):
        tag = b[off:off+4]
        size = struct.unpack_from('<I', b, off+4)[0]
        data = b[off+8:off+8+size]
        if tag == b'VP8X':
            return (1+int.from_bytes(data[4:7], 'little'), 1+int.from_bytes(data[7:10], 'little'))
        if tag == b'VP8 ':
            assert data[3:6] == b'\x9d\x01\x2a'
            return (int.from_bytes(data[6:8], 'little') & 0x3fff, int.from_bytes(data[8:10], 'little') & 0x3fff)
        off += 8 + size + (size % 2)
    raise ValueError('Missing WebP dimensions')

for source, x in zip(SOURCES, PLAN):
    assert source['asset_key'] == x['asset_key']
    src = Path(source['source'])
    assert src.is_file(), src
    locale, slug = x['locale'], x['post_slug']
    suffix = {'es':'portada', 'en':'cover', 'pt':'capa'}[locale]
    rel = f'images/{locale}/{slug}-{locale}-{suffix}.webp'
    out = ROOT / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(['cwebp', '-quiet', '-q', '86', '-m', '6', '-resize', '1600', '900', '-metadata', 'none', str(src), '-o', str(out)], check=True)
    assert webp_dimensions(out) == (1600,900)
    digest = hashlib.sha256(out.read_bytes()).hexdigest()
    item = {
        'asset_key': x['asset_key'],
        'match_by': {'locale': locale, 'slug': slug},
        'post_id_observed': x['post_id_observed'],
        'post_title': x['post_title'], 'post_url': x['post_url'],
        'locale': locale, 'post_slug': slug,
        'image_file': rel, 'filename': out.name,
        'mime_type': 'image/webp', 'width': 1600, 'height': 900,
        'bytes': out.stat().st_size, 'sha256': digest,
        'featured_image_alt': x['alt_text'],
        'visual_style': x['visual_style'],
        'image_role': 'featured_image',
        'generation_status': 'generated', 'assignment_status': 'not_uploaded',
        'featured_image_previous_snapshot': x['featured_image_previous'],
        'content_type': 'AI-generated editorial illustration; not a product screenshot',
        'cms_fields': {'featured_image': 'REPLACE_WITH_RETURNED_UPLOAD_URL', 'featured_image_alt': x['alt_text']},
    }
    if locale == 'pt' and 'pix-boleto' in slug:
        item['editorial_note'] = 'Comparação editorial de meios de pagamento. A imagem não afirma que a Widdo integra Pix ou boleto.'
    meta_rel = f'metadata/{locale}/{slug}-{locale}.json'
    item['metadata_file'] = meta_rel
    (ROOT / meta_rel).parent.mkdir(parents=True,exist_ok=True)
    (ROOT / meta_rel).write_text(json.dumps(item,ensure_ascii=False,indent=2)+'\n')
    prompt_rel = f'prompts/{locale}/{slug}-{locale}.txt'
    (ROOT / prompt_rel).parent.mkdir(parents=True,exist_ok=True)
    (ROOT / prompt_rel).write_text(x['prompt']+'\n')
    items.append(item)

assert len({x['asset_key'] for x in items}) == 28
assert len({x['image_file'] for x in items}) == 28
manifest = {
    'schema_version': 2, 'created_at': '2026-09-14',
    'inventory_observed_at': '2026-09-13',
    'scope': '28 published posts from the audited inventory: 16 es, 6 en, 6 pt; excludes 10 local unpublished entries.',
    'asset_policy': 'One 1600x900 WebP cover per post; no separate hook or OG variants.',
    'assignment_key': ['locale','post_slug'],
    'upload_status': 'not_uploaded', 'items': items,
}
(ROOT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
fields=['asset_key','locale','post_slug','post_title','post_url','image_file','featured_image_alt','post_id_observed','width','height','bytes','sha256']
with (ROOT/'asignacion.csv').open('w',encoding='utf-8-sig',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore')
    writer.writeheader();writer.writerows(items)
md=['# Correspondencia de portadas y artículos','', '| Idioma | Artículo | Archivo |','|---|---|---|']
for x in items:
    md.append(f"| {x['locale'].upper()} | [{x['post_title']}]({x['post_url']}) | [{x['filename']}]({x['image_file']}) |")
(ROOT/'CORRESPONDENCIAS.md').write_text('\n'.join(md)+'\n')
readme='''# Portadas del blog de Widdo — entrega 14 de septiembre de 2026

28 portadas: 16 español, 6 inglés y 6 portugués. Una imagen WebP de 1600 × 900 (16:9) por artículo. Cada portada lleva texto en el idioma de su post. Inventario auditado el 13 de septiembre; comprobar identidad del artículo al importar.

## Revisar la entrega

1. Descomprimir el ZIP conservando las carpetas.
2. Abrir GALERIA.html en el navegador para ver todas las portadas y filtrar por idioma.
3. Consultar CORRESPONDENCIAS.md o asignacion.csv para relacionar cada imagen con su artículo.
4. Para importar con otra IA, usar manifest.json. Los JSON individuales de metadata/ contienen la misma correspondencia por imagen.

## Instrucciones para la IA que suba las imágenes

- Usar SIEMPRE la coincidencia exacta locale + post_slug. No asignar por semejanza de título ni por orden de archivo. post_id_observed es una comprobación adicional; no es una clave fiable entre distintos entornos.
- Si falta el artículo o hay dos coincidencias, registrar el problema y detener solo esa asignación. No crear ni traducir posts automáticamente.
- Conservar una copia de los valores actuales de featured_image y featured_image_alt antes de cambiarlos. La URL anterior incluida aquí procede de la auditoría, no sustituye un respaldo actual.
- Subir el archivo indicado en image_file y conservar su nombre descriptivo si el CMS lo permite. Guardar en featured_image la URL real que devuelve la subida, nunca una ruta local ni el marcador REPLACE_WITH_RETURNED_UPLOAD_URL.
- Guardar featured_image_alt exactamente en el idioma del artículo. Confirmar antes que el endpoint de administración permite y persiste este campo; si no lo permite, informar del requisito de integración en lugar de fingir que quedó guardado.
- No modificar títulos, slugs, idioma, contenido, fechas ni traducciones. No usar la portada española para reemplazar las de inglés o portugués.
- La landing auditada usa featured_image en la tarjeta, el artículo, Open Graph, Twitter y BlogPosting. No hace falta generar ni subir una segunda imagen OG en esta entrega. Mantener proporción 16:9; evitar recortar los titulares.
- Tras subir, verificar respuesta HTTP, MIME image/webp, dimensiones, texto alternativo y visualización en tarjeta y artículo. La API de la landing tiene revalidación de 300 segundos: tener en cuenta la caché al comprobar.
- Registrar las URLs de subida y las asignaciones efectivas. Estas imágenes todavía NO están subidas ni publicadas.

## Contenido y formato

- Son ilustraciones editoriales generadas con IA y composiciones conceptuales. Los documentos, mensajes y pantallas simplificadas no son capturas reales de Widdo ni pruebas de funcionalidades disponibles.
- La comparación Pix/boleto/cartão ilustra el tema del artículo portugués: no anuncia integraciones de Widdo. No reutilizarla como captura de checkout.
- Los nombres localizados, WebP, peso optimizado, dimensiones y textos alternativos facilitan la implementación. Ninguno garantiza por sí mismo posicionamiento SEO.
- Se incluye una sola versión final por post. No subir los JSON, textos de prompts o la galería como portadas.
- Los PNG de trabajo y las variantes descartadas quedan fuera del ZIP para evitar asignaciones equivocadas. Los 10 artículos encontrados solo en seeders locales también quedan fuera del inventario de esta entrega.
- Esta entrega reemplaza la propuesta anterior de tres versiones. Su manifest.json es el que corresponde a estas imágenes finales.
'''
(ROOT/'LEEME.md').write_text(readme)
cards=[]
for n,x in enumerate(items,1):
    esc=html.escape
    cards.append(f'''<article data-locale="{x['locale']}"><a href="{x['image_file']}" target="_blank"><img src="{x['image_file']}" alt="{esc(x['featured_image_alt'],quote=True)}" width="1600" height="900" loading="lazy"></a><div class="info"><span class="tag">{x['locale'].upper()} · {n:02}</span><h2>{esc(x['post_title'])}</h2><p>{esc(x['filename'])}</p><a href="{x['post_url']}" target="_blank" rel="noopener">Ver artículo ↗</a></div></article>''')
gallery='''<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Widdo · 28 portadas del blog</title><style>*{box-sizing:border-box}body{margin:0;background:#111c29;color:#efe8dd;font:16px/1.5 system-ui,sans-serif}header{padding:40px max(24px,4vw) 24px;border-bottom:1px solid #344250}h1{font-size:clamp(26px,4vw,46px);margin:0 0 8px}header p{margin:0;color:#bcc7d2}nav{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}button{border:1px solid #617284;background:transparent;color:inherit;padding:10px 18px;border-radius:5px;cursor:pointer;font:inherit}button[aria-pressed=true]{background:#eadbc0;color:#182535}main{padding:28px max(24px,4vw);display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,370px),1fr));gap:28px}article{background:#1b2a3a;border:1px solid #344250;overflow:hidden;border-radius:7px}article[hidden]{display:none}img{display:block;width:100%;height:auto;aspect-ratio:16/9}.info{padding:20px}h2{font-size:19px;line-height:1.3;margin:10px 0}p{overflow-wrap:anywhere;font-size:13px;color:#bac7d5}a{color:#efbd83}.tag{font-size:12px;letter-spacing:.12em;color:#efbd83}footer{padding:20px max(24px,4vw) 40px;color:#bac7d5}</style><header><h1>28 portadas. Un artículo por imagen.</h1><p>16 español · 6 inglés · 6 portugués · WebP 1600 × 900 · Entrega del 14 de septiembre de 2026</p><nav aria-label="Filtrar por idioma"><button data-filter="all" aria-pressed="true">Todas</button><button data-filter="es" aria-pressed="false">Español</button><button data-filter="en" aria-pressed="false">English</button><button data-filter="pt" aria-pressed="false">Português</button></nav></header><main>'''+''.join(cards)+'''</main><footer>Haz clic en una portada para verla a tamaño completo. Correspondencias e instrucciones: <a href="LEEME.md">LEEME.md</a> · <a href="asignacion.csv">asignacion.csv</a> · <a href="manifest.json">manifest.json</a></footer><script>document.querySelectorAll('button[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('button[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelectorAll('article').forEach(a=>a.hidden=b.dataset.filter!=='all'&&a.dataset.locale!==b.dataset.filter)}));</script></html>'''
(ROOT/'GALERIA.html').write_text(gallery)
checks=['All 28 files exist; unique locale+slug and paths.','All files verified RIFF/WEBP and decoded dimensions 1600x900.','Language counts: es=16, en=6, pt=6.','All 28 metadata files and manifest paths checked.','All image SHA-256 values recorded.','No upload or CMS mutation performed.']
assert {l:sum(x['locale']==l for x in items) for l in ['es','en','pt']} == {'es':16,'en':6,'pt':6}
for x in items:
    assert (ROOT/x['image_file']).is_file()
    assert (ROOT/x['metadata_file']).is_file()
    assert x['featured_image_alt']
(ROOT/'VERIFICACION.json').write_text(json.dumps({'technical_checks':checks,'image_count':28,'total_image_bytes':sum(x['bytes'] for x in items),'width':1600,'height':900,'format':'webp','visual_review':'Images inspected during generation for subject relevance and readable primary text; not a live-site QA audit.'},ensure_ascii=False,indent=2)+'\n')
archive=HERE.parent/'widdo-imagenes-blog-28-posts-2026-09-14.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for file in sorted(ROOT.rglob('*')):
        if file.is_file(): z.write(file,Path(ROOT.name)/file.relative_to(ROOT))
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert sum(n.endswith('.webp') for n in z.namelist()) == 28
print(json.dumps({'zip':str(archive),'zip_bytes':archive.stat().st_size,'images':28,'images_bytes':sum(x['bytes'] for x in items),'min_bytes':min(x['bytes'] for x in items),'max_bytes':max(x['bytes'] for x in items),'gallery':str(ROOT/'GALERIA.html')},ensure_ascii=False,indent=2))
