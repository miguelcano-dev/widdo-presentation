# Portadas del blog de Widdo — entrega 14 de septiembre de 2026

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
