# Auditoría de imágenes publicadas del blog de Widdo

Comprobación terminada: 2026-09-14T08:12:02.699934-05:00 (America/Bogota).

Se revisaron los 32 posts publicados de los tres idiomas disponibles: API paginada, tarjetas del listado, portada del artículo, Open Graph y Twitter. Las 28 imágenes entregadas coinciden byte por byte (SHA-256) con sus archivos del ZIP y están asignadas al post correcto. Los 4 restantes conservan portadas anteriores verdes de texto. Sus bytes coinciden con los archivos locales de contenido/blog-seo/posts/covers; no se deduce su antigüedad solo por la extensión JPG.

| Idioma | Posts publicados | Portadas nuevas correctas | Portadas anteriores fuera del ZIP | Páginas con relacionados de otro idioma |
|---|---:|---:|---:|---:|
| ES | 18 | 16 | 2 | 4 |
| EN | 6 | 6 | 0 | 6 |
| PT | 8 | 6 | 2 | 2 |

## Las cuatro portadas pendientes

- **ES — [La lista de inscripción de temporada para clubes juveniles](https://widdo.co/es/blog/lista-de-inscripcion-temporada-club-deportivo)**. Sigue con el diseño anterior verde de texto. Archivo propuesto: `lista-de-inscripcion-temporada-club-deportivo-es-portada.webp`.
- **ES — [Control de asistencia que los entrenadores sí van a usar](https://widdo.co/es/blog/control-de-asistencia-clubes-deportivos-que-si-se-usa)**. Sigue con el diseño anterior verde de texto. Archivo propuesto: `control-de-asistencia-clubes-deportivos-que-si-se-usa-es-portada.webp`.
- **PT — [O checklist de matrícula de temporada para clubes de base](https://widdo.co/pt/blog/checklist-de-matricula-temporada-clube-esportivo)**. Sigue con el diseño anterior verde de texto. Archivo propuesto: `checklist-de-matricula-temporada-clube-esportivo-pt-capa.webp`.
- **PT — [O que automatizar primeiro num clube esportivo](https://widdo.co/pt/blog/o-que-automatizar-primeiro-no-clube-esportivo)**. Sigue con el diseño anterior verde de texto. Archivo propuesto: `o-que-automatizar-primeiro-no-clube-esportivo-pt-capa.webp`.

Estos cuatro artículos no estaban en el manifiesto de 28 portadas del inventario anterior. Para completar el blog actual hacen falta cuatro imágenes adicionales. Esta auditoría no las genera ni modifica las asignaciones.

## Dos respuestas antiguas que se actualizaron al volver a consultar

En la primera lectura, Morosidad servía una foto de Unsplash y Caos del WhatsApp servía su JPG anterior. Sus tarjetas y la API ya apuntaban al WebP nuevo. En la segunda y tercera lectura ambas páginas mostraron la URL nueva en portada y metadatos. Las imágenes relacionadas antiguas de esas respuestas también cambiaron. Este comportamiento es compatible con una revalidación de caché; no se atribuye a una subida fallida. El código local configura `next: { revalidate: 300 }` para lista y detalle en desarrollo/landing/src/lib/api.ts:24 y :36. No se purgó la caché ni se publicó código.

## Revisión post a post

“Nueva correcta” significa hash exacto del archivo entregado y portada HTML correcta. Las tarjetas coinciden con la API y Open Graph/Twitter con la portada en las 32 páginas. “Mezcla de idiomas” corresponde a imágenes de otros posts en Artículos relacionados, no a la portada principal.

### Español

| Artículo | Portada principal | Observación |
|---|---|---|
| [Widdo: Tu Identidad Deportiva Digital que Te Acompaña en Todos tus Roles](https://widdo.co/es/blog/widdo-identidad-deportiva-digital) | Nueva correcta | Sin discrepancias detectadas |
| [La lista de inscripción de temporada para clubes juveniles](https://widdo.co/es/blog/lista-de-inscripcion-temporada-club-deportivo) | **Anterior: falta generar** | Sin discrepancias detectadas |
| [Control de asistencia que los entrenadores sí van a usar](https://widdo.co/es/blog/control-de-asistencia-clubes-deportivos-que-si-se-usa) | **Anterior: falta generar** | Sin discrepancias detectadas |
| [Tendencias de Escuelas Deportivas para 2026: Lo que Viene](https://widdo.co/es/blog/tendencias-escuelas-deportivas-2026) | Nueva correcta | Sin discrepancias detectadas |
| [Qué automatizar primero en un club deportivo](https://widdo.co/es/blog/automatizar-club-deportivo-tareas-manuales) | Nueva correcta | Relacionados: 1 portada(s) de otro idioma |
| [Grupos de Facebook: El Arma Secreta para Comunidades Deportivas](https://widdo.co/es/blog/grupos-facebook-comunidades-deportivas) | Nueva correcta | Sin discrepancias detectadas |
| [Cómo Definir los Precios de tu Escuela Deportiva (Sin Subvalorarte)](https://widdo.co/es/blog/definir-precios-escuela-deportiva-colombia) | Nueva correcta | Sin discrepancias detectadas |
| [Cómo Organizar Eventos Gratuitos que Atraigan Nuevos Alumnos](https://widdo.co/es/blog/organizar-eventos-gratuitos-atraer-alumnos) | Nueva correcta | Sin discrepancias detectadas |
| [Una Cuenta, Múltiples Roles: Cómo Widdo Simplifica tu Vida Deportiva](https://widdo.co/es/blog/widdo-cuenta-multiples-roles-deportivos) | Nueva correcta | Sin discrepancias detectadas |
| [Calendario de Contenidos para Clubes: Qué Publicar Cada Mes del Año](https://widdo.co/es/blog/calendario-contenidos-clubes-deportivos) | Nueva correcta | Sin discrepancias detectadas |
| [Cómo Transformar Padres en Aliados (No en Clientes que Solo Pagan)](https://widdo.co/es/blog/transformar-padres-aliados-escuela-deportiva) | Nueva correcta | Sin discrepancias detectadas |
| [Cómo Crear un Programa de Referidos que Duplique tus Inscripciones](https://widdo.co/es/blog/programa-referidos-duplicar-inscripciones) | Nueva correcta | Sin discrepancias detectadas |
| [TikTok para Escuelas Deportivas: Ideas de Contenido que Atraen Alumnos](https://widdo.co/es/blog/tiktok-escuelas-deportivas-ideas-contenido) | Nueva correcta | Sin discrepancias detectadas |
| [Las señales de que un jugador está a punto de dejar tu club](https://widdo.co/es/blog/razones-abandono-alumnos-escuela-deportiva) | Nueva correcta | Relacionados: 1 portada(s) de otro idioma |
| [Por qué falla el cobro de mensualidades en los clubes deportivos](https://widdo.co/es/blog/reducir-morosidad-club-deportivo-cobros) | Nueva correcta | Respuesta antigua inicial; nueva al reconsultar; Relacionados: 2 portada(s) de otro idioma |
| [Guía Completa de Instagram para Clubes Deportivos: Del Cero al Engagement](https://widdo.co/es/blog/guia-instagram-clubes-deportivos) | Nueva correcta | Sin discrepancias detectadas |
| [7 Estrategias de Marketing que Funcionan para Escuelas de Fútbol en Colombia](https://widdo.co/es/blog/estrategias-marketing-escuelas-futbol-colombia) | Nueva correcta | Sin discrepancias detectadas |
| [Adiós al caos del WhatsApp: el grupo no es un sistema de comunicación](https://widdo.co/es/blog/adios-caos-whatsapp-escuela-deportiva) | Nueva correcta | Respuesta antigua inicial; nueva al reconsultar; Relacionados: 1 portada(s) de otro idioma |

### English

| Artículo | Portada principal | Observación |
|---|---|---|
| [What Per-Player Pricing Actually Costs a Growing Club](https://widdo.co/en/blog/per-player-pricing-youth-sports-software) | Nueva correcta | Relacionados: 1 portada(s) de otro idioma |
| [Why Dues Collection Breaks Down in Youth Sports Clubs](https://widdo.co/en/blog/why-dues-collection-breaks-down) | Nueva correcta | Relacionados: 1 portada(s) de otro idioma |
| [Attendance Tracking Coaches Will Actually Use](https://widdo.co/en/blog/attendance-tracking-youth-sports-clubs) | Nueva correcta | Relacionados: 2 portada(s) de otro idioma |
| [The Signals a Player Is About to Leave Your Club](https://widdo.co/en/blog/signals-player-about-to-leave-club) | Nueva correcta | Relacionados: 1 portada(s) de otro idioma |
| [The Registration Season Checklist for Youth Clubs](https://widdo.co/en/blog/registration-season-checklist-youth-sports) | Nueva correcta | Relacionados: 2 portada(s) de otro idioma |
| [The Group Text Is Not a Communication System](https://widdo.co/en/blog/parent-communication-sports-club) | Nueva correcta | Relacionados: 2 portada(s) de otro idioma |

### Português

| Artículo | Portada principal | Observación |
|---|---|---|
| [O checklist de matrícula de temporada para clubes de base](https://widdo.co/pt/blog/checklist-de-matricula-temporada-clube-esportivo) | **Anterior: falta generar** | Relacionados: 2 portada(s) de otro idioma |
| [O que automatizar primeiro num clube esportivo](https://widdo.co/pt/blog/o-que-automatizar-primeiro-no-clube-esportivo) | **Anterior: falta generar** | Relacionados: 2 portada(s) de otro idioma |
| [Como reduzir a inadimplência de mensalidades na sua escolinha](https://widdo.co/pt/blog/reduzir-inadimplencia-mensalidades-escolinha) | Nueva correcta | Sin discrepancias detectadas |
| [Pix, boleto ou cartão: como receber as mensalidades do clube](https://widdo.co/pt/blog/pix-boleto-cartao-mensalidades-clube-esportivo) | Nueva correcta | Sin discrepancias detectadas |
| [Evasão de alunos: os sinais que aparecem semanas antes da desistência](https://widdo.co/pt/blog/evasao-de-alunos-escolinha-sinais) | Nueva correcta | Sin discrepancias detectadas |
| [Como captar novos alunos para a escolinha sem depender só da indicação](https://widdo.co/pt/blog/captar-novos-alunos-escolinha-futebol) | Nueva correcta | Sin discrepancias detectadas |
| [Grupo de WhatsApp com os pais: como organizar sem enlouquecer](https://widdo.co/pt/blog/grupo-whatsapp-pais-escolinha) | Nueva correcta | Sin discrepancias detectadas |
| [Categorias de base: chamada, atestado e documentação em dia](https://widdo.co/pt/blog/gestao-categorias-de-base-documentacao) | Nueva correcta | Sin discrepancias detectadas |

## Mezcla de idiomas en artículos relacionados

Detectada en 12 páginas, con 18 tarjetas. Ejemplo: una página EN enlaza a un slug ES y muestra su imagen española. Los enlaces también usan el prefijo del idioma de la página, aunque el post destino tiene otro idioma.

| Página | Idioma de la página | Post recomendado | Idioma real del recomendado |
|---|---|---|
| [automatizar-club-deportivo-tareas-manuales](https://widdo.co/es/blog/automatizar-club-deportivo-tareas-manuales) | es | attendance-tracking-youth-sports-clubs | en |
| [reducir-morosidad-club-deportivo-cobros](https://widdo.co/es/blog/reducir-morosidad-club-deportivo-cobros) | es | why-dues-collection-breaks-down | en |
| [reducir-morosidad-club-deportivo-cobros](https://widdo.co/es/blog/reducir-morosidad-club-deportivo-cobros) | es | per-player-pricing-youth-sports-software | en |
| [razones-abandono-alumnos-escuela-deportiva](https://widdo.co/es/blog/razones-abandono-alumnos-escuela-deportiva) | es | signals-player-about-to-leave-club | en |
| [adios-caos-whatsapp-escuela-deportiva](https://widdo.co/es/blog/adios-caos-whatsapp-escuela-deportiva) | es | attendance-tracking-youth-sports-clubs | en |
| [per-player-pricing-youth-sports-software](https://widdo.co/en/blog/per-player-pricing-youth-sports-software) | en | reducir-morosidad-club-deportivo-cobros | es |
| [why-dues-collection-breaks-down](https://widdo.co/en/blog/why-dues-collection-breaks-down) | en | reducir-morosidad-club-deportivo-cobros | es |
| [attendance-tracking-youth-sports-clubs](https://widdo.co/en/blog/attendance-tracking-youth-sports-clubs) | en | adios-caos-whatsapp-escuela-deportiva | es |
| [attendance-tracking-youth-sports-clubs](https://widdo.co/en/blog/attendance-tracking-youth-sports-clubs) | en | automatizar-club-deportivo-tareas-manuales | es |
| [signals-player-about-to-leave-club](https://widdo.co/en/blog/signals-player-about-to-leave-club) | en | razones-abandono-alumnos-escuela-deportiva | es |
| [registration-season-checklist-youth-sports](https://widdo.co/en/blog/registration-season-checklist-youth-sports) | en | adios-caos-whatsapp-escuela-deportiva | es |
| [registration-season-checklist-youth-sports](https://widdo.co/en/blog/registration-season-checklist-youth-sports) | en | automatizar-club-deportivo-tareas-manuales | es |
| [parent-communication-sports-club](https://widdo.co/en/blog/parent-communication-sports-club) | en | adios-caos-whatsapp-escuela-deportiva | es |
| [parent-communication-sports-club](https://widdo.co/en/blog/parent-communication-sports-club) | en | automatizar-club-deportivo-tareas-manuales | es |
| [o-que-automatizar-primeiro-no-clube-esportivo](https://widdo.co/pt/blog/o-que-automatizar-primeiro-no-clube-esportivo) | pt | adios-caos-whatsapp-escuela-deportiva | es |
| [o-que-automatizar-primeiro-no-clube-esportivo](https://widdo.co/pt/blog/o-que-automatizar-primeiro-no-clube-esportivo) | pt | automatizar-club-deportivo-tareas-manuales | es |
| [checklist-de-matricula-temporada-clube-esportivo](https://widdo.co/pt/blog/checklist-de-matricula-temporada-clube-esportivo) | pt | adios-caos-whatsapp-escuela-deportiva | es |
| [checklist-de-matricula-temporada-clube-esportivo](https://widdo.co/pt/blog/checklist-de-matricula-temporada-clube-esportivo) | pt | automatizar-club-deportivo-tareas-manuales | es |

Corrección recomendada: filtrar las recomendaciones por locale del post actual. Si se desea ofrecer contenido de otro idioma, indicar ese idioma y construir el enlace con el locale real del post recomendado.

## Evidencias y archivos para continuar

- `revision-post-a-post.csv`: tabla completa de los 32 posts.
- `FINAL.json`: resultados finales, URLs y hashes.
- `pendientes-4-portadas.json`: identificación exacta de las cuatro portadas por generar.
- `inventory.json`: inventario vivo filtrado a campos editoriales.
- `pages.json`: primera observación de las páginas; `pages-final.json`: incorpora la recomprobación de las dos respuestas antiguas.
- `image-checks.json`: estado HTTP, MIME y hash de las imágenes consultadas. Todas respondieron HTTP 200.
- `recheck.json`: comprobación independiente de los dos artículos y su API de detalle.

Alcance: revisión de URLs y bytes servidos en la consulta actual. No implica que todas las cachés de todos los visitantes o regiones estén sincronizadas. No se subieron imágenes, editaron posts ni desplegaron cambios.
