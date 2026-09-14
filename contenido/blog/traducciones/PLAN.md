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


---

## Corrección posterior: las metas en portugués

Al verificar la paridad se vio que inglés y español coincidían en los seis
temas, pero **portugués divergía en cuatro**: esos posts ya existían y solo se
les había puesto el grupo y la portada.

Tres eran solo redacción y se alinearon (`metas-pt.php`). El del WhatsApp era
el peor: su meta prometía *«como organizar o grupo»* cuando inglés y español
dicen *«el grupo no es un sistema, sustitúyelo»* — consejo opuesto. El
contenido sí sostenía la tesis correcta (su primer apartado es «O erro central:
um canal para duas funções»), así que lo desalineado era solo la promesa del
resultado de búsqueda.

El cuarto no se tocó, y es la decisión que importa:
**`gestao-categorias-de-base-documentacao` se sacó del grupo de asistencia.**
Cubre presencia *más* certificado médico, documentación y calendario anual; el
post en inglés es solo presencia. El hreflang afirma «esta es la misma página
en otro idioma», y no lo es: declararlo manda a un lector portugués a un
artículo con otro alcance y le da a Google una equivalencia falsa. Forzar la
meta para que encajara la habría hecho mentir sobre el artículo.

Queda sin grupo hasta que exista una versión portuguesa del artículo de
asistencia — que hoy canibalizaría a éste.
