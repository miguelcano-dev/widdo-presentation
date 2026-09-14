# Blog de Widdo

Todo lo del blog vive aquí. Antes estaba repartido entre `blog/` y `blog-seo/`
y nueve carpetas del mismo día que se solapaban; si encuentras una referencia a
`contenido/blog-seo/`, es de antes del 14-sep-2026.

**El contenido de los posts vive en la base de datos de producción, no aquí.**
Esta carpeta guarda de dónde salió y con qué se regenera.

---

## Qué hay

| Carpeta | Qué es |
|---|---|
| `textos/` | Los borradores HTML de los 7 posts en inglés, el plan de publicación y los prompts de portada |
| `traducciones/` | Los 8 posts en español y portugués, en JSON, más el script que los mete en la base |
| `portadas/` | Las imágenes publicadas y lo que las genera |
| `_historico/` | Entregas y auditorías ya superadas. No se borra, no se usa |

---

## Las portadas: cuál manda

Los 33 posts tienen portada. Salen de **dos sitios distintos**, y conviene
saber cuál es cuál antes de tocar nada:

| Origen | Cuántas | Qué son |
|---|---|---|
| `portadas/publicadas/entrega-28/` | 28 | Ilustraciones generadas por IA (otra sesión, 14-sep) |
| `portadas/publicadas/entrega-4/` | 2 de 4 | Las de asistencia (ES) y automatizar (PT) |
| `portadas/generadores/en-automatizar/` | 1 | Composición HTML, inglés |
| `portadas/generadores/listas-inscripcion/` | 2 | Composiciones HTML, ES y PT |

Las otras 2 de `entrega-4` —inscripción ES y matrícula PT— **están
superadas**: decían «Todo listo para empezar» con los cuatro puntos marcados,
cuando el artículo trata de lo que hay que hacer **antes** de abrir. Se
rehicieron en `generadores/listas-inscripcion/`. Los archivos siguen ahí porque
el resto de la entrega sí vale, pero no son lo que está publicado.

### La diferencia que importa

Las 30 de las entregas son **ilustraciones fotorrealistas generadas por IA**.
Las 3 de `generadores/` son **composiciones HTML→WebP**, hechas porque no había
generador de imágenes disponible. Comparten paleta y estructura a propósito
—se midió el color sobre las entregadas— pero no son el mismo medio. Si algún
día se regeneran las tres como ilustración, mejor.

### `tarjetas-tipograficas.js` no está publicado

Genera las 23 tarjetas oscuras con esquemas que estuvieron publicadas entre el
13 y el 14 de septiembre. **Ya no lo están**, las sustituyó la entrega
fotográfica. Se conserva porque funciona y porque acepta una foto de fondo en
`generadores/fondos/`, que es la vía si se vuelve a esa dirección.

---

## Cómo se publica una portada nueva

1. Deja el `.webp` de 1600×900 donde corresponda.
2. Genera el gemelo JPEG: la landing usa `og_image` para compartir, y
   **WhatsApp y algunos rastreadores de LinkedIn no renderizan WebP**.
   ```bash
   sips -s format jpeg -s formatOptions 82 -Z 1200 portada.webp --out portada.jpg
   ```
3. Sube los dos a `/var/www/widdo/storage/app/public/blog/images/` y deja el
   dueño en `www-data`.
4. Asigna con `portadas/asignar-portadas.php` (necesita un manifiesto con
   `locale` + `post_slug` + `image_file`), o a mano.
5. **Sube el número de versión de la URL.** Cloudflare cachea `/storage` con
   `immutable` siete días: sobrescribir el fichero no cambia lo que ve nadie.
   Hoy va por `?v4`.

`portadas/respaldo-anterior.json` guarda `featured_image`, `og_image` y el
texto alternativo de los 33 posts antes de la entrega del 14-sep. Es la vuelta
atrás.

---

## Tres cosas que no se ven mirando los archivos

**El slug de un post que reemplaza a otro es el del post viejo.** Esa es la URL
que Google ya indexó. Por eso el de WhatsApp en español vive en
`/adios-caos-whatsapp-escuela-deportiva` aunque su título ya no diga eso: es el
único post del blog con tráfico real.

**`translation_group` es lo que produce el hreflang.** El cableado ya existía
en `BlogController` y en la landing, leyendo una columna que estuvo vacía
meses. Si creas una versión nueva de un post, añádela a `$temas` en
`traducciones/aplicar.php` o nacerá desconectada de sus hermanas.

**Los títulos tienen 60 caracteres, no más.** La landing ya no añade « - Widdo»
—la plantilla se quitó el 14-sep porque dejaba 16 de 19 páginas cortadas— así
que lo que escribas es lo que sale. La palabra por la que se busca va siempre
delante: es lo primero que se pierde si Google recorta.
