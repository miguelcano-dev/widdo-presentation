# Estado de las imágenes del blog

**Última actualización: 14-sep-2026, después de subir la entrega fotográfica.**

## Lo que está publicado ahora

**28 de los 33 posts** llevan las portadas fotográficas de
`entrega-imagenes-blog-2026-09-14/`: WebP de 1600×900, una por post y por
idioma, con texto en el idioma del artículo y su propio texto alternativo.
Asignadas por coincidencia exacta de `locale` + `slug`, sin ambigüedades.

**Los 5 restantes conservan la tarjeta tipográfica oscura anterior**, así que
ahora mismo la rejilla mezcla dos direcciones de arte. Cuáles y por qué, más
abajo.

| Dónde | Qué se ve |
|---|---|
| `/es/blog` | 16 fotográficas + 2 tarjetas oscuras |
| `/en/blog` | 6 fotográficas (la 7ª tiene fecha futura, no sale) |
| `/pt/blog` | 6 fotográficas + 2 tarjetas oscuras |

Revertir es un comando: `respaldo-anterior.json` guarda el valor de
`featured_image`, `og_image` y `featured_image_alt` de los 33 posts antes de
tocarlos.

## Los 5 sin portada de la entrega

La entrega se construyó sobre una foto del blog de **28 posts**. Ese mismo día
el blog pasó a 33.

| Post | Por qué faltaba |
|---|---|
| `en/what-to-automate-first-youth-sports-club` | Existía, pero con `published_at` el 22-sep: no salía en el inventario público |
| `es/control-de-asistencia-clubes-deportivos-que-si-se-usa` | Creado el 13-sep |
| `es/lista-de-inscripcion-temporada-club-deportivo` | Creado el 13-sep |
| `pt/checklist-de-matricula-temporada-clube-esportivo` | Creado el 13-sep |
| `pt/o-que-automatizar-primeiro-no-clube-esportivo` | Creado el 13-sep |

**Ya tienen prompt escrito** en `entrega-imagenes-blog-2026-09-14/prompts/`,
con la misma cabecera y dirección de arte que los otros 28, y su ficha en
`PENDIENTES-5.json`. Generar las imágenes, dejarlas en `images/<idioma>/` con
el nombre que indica la ficha, y volver a correr `asignar-portadas.php`.

## La ausencia de verde es deliberada

Se midió: **las 28 tienen esencialmente cero verde de marca** (ninguna llega al
0,2 % de píxeles en el rango verde). La paleta es azul marino, coral, granate y
ámbar.

No es un descuido. El prompt maestro de la entrega lo pide explícitamente:
*«rejects white backgrounds, black headlines, generic AI stock people,
**excessive green**»*.

Lo que sí choca es `../BRAND-GUIDE.md`, que para marketing oscuro fija fondo
`#0A1410` y acento `#00C853`. Son dos criterios en conflicto y gana el que
decida Miguel; queda escrito aquí para que no se descubra por sorpresa cuando
alguien compare el blog con los decks.

## Un prompt que ya no describe su post

`automatizar-club-deportivo-tareas-manuales` (ES) tiene el gancho *«Menos
tareas. Más deporte»* y cinco tarjetas de proceso. Eso describía el post
**viejo**, *«5 tareas que no deberías hacer manualmente»*. El contenido actual
trata de **en qué orden** automatizar y dedica un apartado entero a lo que
**no** se debe automatizar. La imagen está publicada y no miente sobre el
producto, pero no es la idea del artículo. Si se regenera, el prompt nuevo
del post equivalente en inglés y portugués (`…-en.txt`, `…-pt.txt`) ya tiene la
dirección correcta: secuencia numerada con una tarjeta apartada y apagada.

Los otros tres posts reemplazados el 13-sep (`adios-caos-whatsapp…`,
`reducir-morosidad…`, `razones-abandono…`) se comprobaron uno a uno: sus
imágenes siguen encajando con el contenido nuevo.

## Detalles de implementación que ahorran re-diagnóstico

- **La landing ignora `og_image`.** Usa `featured_image` para la tarjeta, el
  artículo, Open Graph, Twitter y el schema `BlogPosting`
  (`landing/src/app/[locale]/blog/[slug]/page.tsx:70,77,80`). Se subió igual un
  gemelo JPEG de cada portada y se guardó en `og_image`, porque **WhatsApp y
  algunos rastreadores de LinkedIn no renderizan WebP en la vista previa**. El
  arreglo es un cambio de dos líneas en la landing para preferir `og_image`
  cuando exista; hasta entonces el JPEG está subido pero no se usa.
- **Las URLs llevan `?v3`.** Cloudflare cachea `/storage` con `immutable` siete
  días: sobrescribir el fichero no cambia lo que ve nadie. Al cambiar una
  portada hay que subir el número. La `v2` fue la de las tarjetas oscuras.
- **La landing revalida cada 300 s, y por página.** El español apareció primero
  y el inglés y el portugués varios minutos después. No es un fallo.
- `alt_status: must_verify_against_generated_image` en el manifiesto significa
  lo que dice: los textos alternativos se escribieron antes de ver la imagen.
  Se guardaron tal cual; conviene repasarlos contra la imagen real.
- `pendientes-locales.json` del paquete anterior lista 10 posts de seeders que
  **no existen en producción**. Van marcados `auto_generate: false` a propósito.

## Las tarjetas tipográficas siguen disponibles

`../blog-seo/posts/generate-covers.js` genera las 23 tarjetas oscuras por post
e idioma, y acepta una foto de fondo en `fondos/<slug>.jpg`. Si se vuelve a esa
dirección, es un comando. No se ha borrado nada.
