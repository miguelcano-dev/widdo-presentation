# Plan corregido (13-sep-2026)

Descubierto al auditar: ES y PT YA tenían posts sobre cuatro de los seis temas.
Publicar traducciones al lado habría creado dos posts por idioma compitiendo
por la misma búsqueda. Se cambia "traducir todo" por "reemplazar el flojo,
crear solo lo que falta".

## Español

| Acción | Post | Por qué |
|---|---|---|
| REEMPLAZAR contenido, MANTENER slug | 18 Adiós al caos de WhatsApp (273 pal, **1.253 visitas**) | Es el único post del blog con tráfico real. Se conserva su URL y se sube a 1.125 palabras |
| REEMPLAZAR contenido, MANTENER slug | 21 Reducir la morosidad (295 pal) | mismo tema que EN 34 |
| REEMPLAZAR contenido, MANTENER slug | 22 5 razones de abandono (303 pal) | mismo tema que EN 36 |
| REEMPLAZAR contenido, MANTENER slug | 31 Automatiza tu club (286 pal) | mismo tema que EN 45 |
| CREAR | asistencia (EN 35) | no existe en ES |
| CREAR | inscripción (EN 37) | no existe en ES |

Los otros 12 posts en español se quedan como están. Son los que traen visitas
de Argentina, México y Colombia, y no tienen equivalente en inglés.

## Portugués

Ya están bien (769-859 palabras). Solo falta:

| Acción | Post | Por qué |
|---|---|---|
| CREAR | qué automatizar (EN 45) | único tema sin cubrir en PT |
| PORTADAS | los 6 existentes | los 6 están sin `featured_image` |

## Los tres idiomas

- `translation_group`: HOY ESTÁ VACÍO EN LOS 29 POSTS. Sin él, Google no sabe
  que una es la versión de la otra. Se rellena por tema.
- `meta_title` y `meta_description`: mismo significado en los tres idiomas.

## Lo que NO se hace, y por qué

- **No se traduce el post de per-player pricing.** Discute contra TeamSnap y
  SportsEngine; en Colombia y Brasil ese no es el rival y el lector no los
  conoce.
- **No se traducen los 12 posts de español al inglés.** Tienen 250-330
  palabras: no posicionan en inglés. El ángulo de captación (referidos,
  eventos de puertas abiertas, grupos de Facebook) SÍ vale para USA, pero
  como posts nuevos escritos largos, no como traducción.
