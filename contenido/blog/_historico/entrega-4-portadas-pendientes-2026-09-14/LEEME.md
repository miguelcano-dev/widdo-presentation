# Cuatro portadas pendientes de Widdo

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

- **ES — La lista de inscripción de temporada para clubes juveniles**
  - Archivo: `lista-de-inscripcion-temporada-club-deportivo-es-portada.webp`
  - Post: https://widdo.co/es/blog/lista-de-inscripcion-temporada-club-deportivo

- **ES — Control de asistencia que los entrenadores sí van a usar**
  - Archivo: `control-de-asistencia-clubes-deportivos-que-si-se-usa-es-portada.webp`
  - Post: https://widdo.co/es/blog/control-de-asistencia-clubes-deportivos-que-si-se-usa

- **PT — O checklist de matrícula de temporada para clubes de base**
  - Archivo: `checklist-de-matricula-temporada-clube-esportivo-pt-capa.webp`
  - Post: https://widdo.co/pt/blog/checklist-de-matricula-temporada-clube-esportivo

- **PT — O que automatizar primeiro num clube esportivo**
  - Archivo: `o-que-automatizar-primeiro-no-clube-esportivo-pt-capa.webp`
  - Post: https://widdo.co/pt/blog/o-que-automatizar-primeiro-no-clube-esportivo

