# Estado de las imágenes del blog — 13-sep-2026

Esta carpeta la produjo una sesión distinta a la que rehízo las portadas y el
contenido el mismo día. Se cruzan, así que conviene leer esto antes de usar
cualquiera de las dos cosas.

## Hay dos direcciones de arte, y son incompatibles

**La que está publicada ahora mismo:** 23 tarjetas tipográficas sobre fondo
oscuro, una por post y por idioma, cada una con su esquema (filas de cobro,
burbujas, una línea que cae, barras, escalones, checklist). Se generan con
`../blog-seo/posts/generate-covers.js` y están en producción en los 33 posts.

**La que propone esta carpeta:** fotografía real con producto dentro, distinta
por post, con el gancho escrito en la imagen. Hay **una sola generada** como
muestra (`imagenes/es/adios-caos-whatsapp-…-v1.png`) y **28 prompts** listos
para el resto.

La muestra es mejor para lo que se pidió — una imagen, no un fondo con texto.
Pero solo existe una de 28, y las dos direcciones no pueden convivir: media
rejilla oscura y media clara se ve peor que cualquiera de las dos entera.

**Decisión pendiente de Miguel:** generar las 28 y sustituir, o quedarse con las
tarjetas. No es una decisión técnica.

## El paquete va desfasado respecto al blog

El manifiesto se construyó sobre una foto del blog de **28 posts** (16 ES, 6 EN,
6 PT). Ese mismo día el blog pasó a **33** y cuatro posts en español cambiaron
de contenido. Concretamente:

### Cinco posts sin prompt

- `control-de-asistencia-clubes-deportivos-que-si-se-usa` (ES, nuevo)
- `lista-de-inscripcion-temporada-club-deportivo` (ES, nuevo)
- `checklist-de-matricula-temporada-clube-esportivo` (PT, nuevo)
- `o-que-automatizar-primeiro-no-clube-esportivo` (PT, nuevo)
- `what-to-automate-first-youth-sports-club` (EN, existía pero con
  `published_at` el 22-sep, así que no salía en el inventario público)

### Un prompt que ya no describe su post

`automatizar-club-deportivo-tareas-manuales` lleva el gancho *«Menos tareas.
Más deporte»* y un alt de «cinco procesos administrativos organizados». Eso
describía el post viejo, *«5 errores / 5 tareas que no deberías hacer
manualmente»*. El contenido de hoy trata de **en qué orden** automatizar, y
dedica un apartado entero a lo que **no** se debe automatizar. Hay que
reescribir el prompt antes de generar esa imagen.

Los otros tres reemplazados (`adios-caos-whatsapp…`, `reducir-morosidad…`,
`razones-abandono…`) siguen encajando; se comprobaron uno a uno.

## Detalles del paquete que no se ven abriendo la carpeta

- `pendientes-locales.json` lista 10 posts de `BlogSEOPostsSeeder.php` que **no
  existen en producción**. Están marcados `auto_generate: false` a propósito: no
  hay que generarles nada mientras no se publiquen.
- `alt_status: must_verify_against_generated_image` en cada item significa lo
  que dice — el texto alternativo es una propuesta escrita **antes** de ver la
  imagen. Hay que confirmarlo contra la imagen real, o el alt describirá algo
  que no está.
- La auditoría propone maestros de 1600×900 WebP. Las portadas publicadas son
  2400×1260 JPEG. La landing recorta a 16:9 con `object-cover`, así que las
  actuales pierden algo arriba y abajo.
- **El `.zip` no está versionado**: es el mismo contenido que `prompts/`, y un
  binario en git no se puede diferenciar. Si hace falta para un traspaso, se
  regenera comprimiendo esa carpeta.

## Si se elige la dirección fotográfica

Los prompts de esta carpeta mandan sobre `../blog-seo/posts/PROMPTS-PORTADAS.md`,
que se escribió antes y es más genérico (nueve prompts de fondo, sin producto
dentro ni gancho por post). El requisito que sigue valiendo de aquel documento
es el único que se incumple siempre: **la mitad donde va el texto tiene que
quedar limpia**, o el titular no se lee.
