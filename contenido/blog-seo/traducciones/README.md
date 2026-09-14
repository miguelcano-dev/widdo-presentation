# Traducciones del blog

El contenido de los posts vive en la base de datos de producción, no en el
repositorio. Estos archivos son la **fuente de la que salió**: sin ellos, los
ocho posts de esta tanda existirían únicamente en MySQL.

## Qué hay aquí

| Archivo | Qué es |
|---|---|
| `PLAN.md` | Qué se tradujo, qué no, y por qué. Léelo antes de tocar nada |
| `<id-en>-<idioma>.json` | Un post: título, extracto, meta, palabras clave y contenido |
| `aplicar.php` | Lo que los mete en la base |

El número del nombre es el **id del post en inglés** del que salió la versión.
`38-es.json` es la versión española del post 38.

## Cómo se aplica

```bash
# 1. empaquetar
python3 -c "import json,pathlib; \
  print(json.dumps([json.loads(f.read_text('utf-8')) \
  for f in sorted(pathlib.Path('.').glob('[0-9]*.json'))], ensure_ascii=False))" > /tmp/paquete.json

# 2. subir los dos archivos al servidor
scp /tmp/paquete.json aplicar.php root@167.71.88.31:/tmp/

# 3. ejecutar
ssh root@167.71.88.31 "cd /var/www/widdo && php artisan tinker /tmp/aplicar.php"
```

Es idempotente: se puede volver a correr. Antes de sobrescribir nada deja una
copia de seguridad en `/tmp/blog-backup-<fecha>.json` del servidor.

## Dos cosas que no se deben cambiar sin pensarlo

**El `slug` de un post que reemplaza a otro es el del post viejo, no una
traducción del título nuevo.** Esa es la URL que Google ya tiene indexada;
cambiarla tira el historial. Por eso `38-es.json` vive en
`/adios-caos-whatsapp-escuela-deportiva` aunque su título ya no diga eso: ese
post es el único del blog con tráfico real.

**`translation_group` es lo que produce el hreflang.** El cableado ya existía en
`BlogController` y en el `generateMetadata` de la landing, y llevaba tiempo
leyendo una columna vacía. Si creas una versión nueva de un post existente,
añádela a `$temas` en `aplicar.php` o nacerá desconectada de sus hermanas.

## Las portadas van aparte

Se generan con `../posts/generate-covers.js` y se suben por `scp` a
`/var/www/widdo/storage/app/public/blog/images/`. La URL lleva `?v=N` porque
Cloudflare cachea `/storage` con `immutable` siete días: sobrescribir el archivo
no cambia lo que ve nadie. Al cambiar una portada hay que subir el número.
