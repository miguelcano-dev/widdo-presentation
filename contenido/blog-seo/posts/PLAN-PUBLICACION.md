# Plan de publicación — blog en inglés (sep-2026)

Escrito el 12-sep-2026, a partir de los datos reales de Search Console (3 meses).

## Por qué estos tres y no otros

El dato que manda: **la portada `/en` se lleva 244 de los 270 clics del trimestre**. Todo el
tráfico útil es de marca. Lo único que genera impresiones no-marca es el blog (~660
impresiones), y las 16 landings por deporte/país no aparecen ni en el top 10 de páginas.

Los temas salen de lo que **ya demostró demanda** en el blog en español, traducido a la realidad
de USA:

| Post en español | Impresiones | Equivalente USA |
|---|---|---|
| adios-caos-whatsapp-escuela-deportiva | 106 | El group text |
| grupos-facebook-comunidades-deportivas | 55 | (mismo tema) |
| automatizar-club-deportivo-tareas-manuales | 43 | Qué automatizar primero |

## El problema real: los 6 posts en inglés son demasiado cortos

Ya existían y ninguno rankea. Medidos el 12-sep:

| Slug | Palabras | Imagen |
|---|---|---|
| per-player-pricing-youth-sports-software | 509 | ❌ |
| why-dues-collection-breaks-down | 471 | ❌ |
| registration-season-checklist-youth-sports | 445 | ❌ |
| signals-player-about-to-leave-club | 442 | ❌ |
| parent-communication-sports-club | 422 | ❌ |
| attendance-tracking-youth-sports-clubs | 387 | ❌ |

400 palabras no compiten por nada. **Ninguno tiene imagen destacada**, que penaliza el CTR en
resultados y deja el compartido en redes sin miniatura.

Por eso dos de estos tres son **reescrituras del slug existente, no posts nuevos**: publicar una
segunda página sobre cobros competiría con la que ya está indexada y las dos perderían.

## Calendario

Uno por semana, martes. Cadencia sostenible y suficiente para ver movimiento en 4-6 semanas.

| Fecha | Archivo | Slug | Acción |
|---|---|---|---|
| **mar 15-sep** | `01-dues-collection.html` | `why-dues-collection-breaks-down` | **Reemplazar** contenido (1.141 palabras) |
| **mar 22-sep** | `02-parent-communication.html` | `parent-communication-sports-club` | **Reemplazar** contenido (1.038 palabras) |
| **mar 29-sep** | `03-what-to-automate-first.html` | `what-to-automate-first-youth-sports-club` | **Crear** nuevo (1.025 palabras) |

Al reemplazar: **conservar el slug y la fecha de publicación original**, y actualizar
`updated_at`. Cambiar el slug tiraría a la basura lo poco que Google ya tiene indexado.

## Cómo publicar

Admin → Blog. Los campos que trae cada archivo en su cabecera comentada: `title`, `meta_title`,
`meta_description`, `meta_keywords`, `locale: en`. El cuerpo es HTML con las mismas etiquetas
que ya usan los posts existentes (`h2`, `h3`, `p`, `ul`, `li`, `strong`).

También se puede por API: `POST/PUT /api/admin/blog/posts` (ver `routes/api.php:1577`).

**`country`: dejar vacío.** Llenarlo con `US` restringiría la distribución sin necesidad.

## Pendiente que no depende de escribir

1. **Imagen destacada para los 9 posts en inglés.** Es el arreglo de mayor retorno por minuto:
   afecta al CTR de cada impresión que ya tienes hoy.
2. **Expandir los otros 4 posts cortos** — mismo tratamiento, uno por semana a partir de octubre.
3. **Medir el 24-oct** (6 semanas): si las landings por deporte siguen en cero impresiones con
   los enlaces internos ya puestos, se archivan.

## Cumplimiento de marca

Auditado contra `../MESSAGING.md`:

- Sin competidores nombrados ("legacy platforms", "whichever platform you use").
- Sin métricas internas, sin Colombia/LATAM, sin precios exactos.
- Edades en notación USA: **12U, 14U**.
- Comisión: 0%, redacción del fact sheet.
- IA: siempre con **"You approve; it executes"**. Sin voz.
- Datos: solo los del fact sheet (73% sin software pago; 37 min/día Aspen n=1.848) y las citas
  públicas de Reddit ya aprobadas.

**Precios:** corregidos el 12-sep en `MESSAGING.md`, `README.md`, el brief de LinkedIn y la
config del perfil — estaban en `$99 / $199 / $349` y la verdad es **`$99 / $249 / $499`**
(80/200/500 jugadores), verificada contra `bas_subscription_plan_prices` en producción. Aun así
estos tres posts no mencionan precio: un post de blog envejece peor que una página de precios,
y la conversión de precio la hace `/pricing`, no el blog.
