# Paquete de generación de portadas Widdo

Listo para pasar a otra IA. Contiene 28 prompts autónomos (16 ES, 6 EN, 6 PT), uno por post publicado observado en la auditoría. No contiene las imágenes finales ni ejecuta publicaciones.

## Cómo usarlo

1. Copia este mensaje a la IA generadora y adjunta el ZIP: «Lee PROMPT-MAESTRO.md y manifest.json. Genera las imágenes UNA POR UNA siguiendo cada archivo de prompts/. Empieza por es:adios-caos-whatsapp-escuela-deportiva. Respeta exactamente el idioma, contexto deportivo y nombres de salida. Entrega por concepto portada limpia, variante con gancho y OG limpio, más el sidecar de metadatos. No publiques ni asignes nada al CMS. Marca como pendiente cualquier exportación o medición que no puedas hacer».
2. Cada archivo de prompts/ incluye todas las reglas: se puede enviar por separado sin necesitar el historial de esta conversación.
3. La prueba anterior de WhatsApp era una referencia de estilo, no un asset final del paquete: era PNG 1672×941 con fútbol y headline. El nuevo prompt para ese artículo prescribe básquet y tres entregables. No renombrar la prueba para fingir que cumple.
4. Consulta asignacion.csv para revisión humana o manifest.json para asignación automatizada. No hay nombres genéricos ni emparejamiento por parecido visual.

## Formatos elegidos

Portada limpia 1600×900 WebP; variante con gancho 1600×900 WebP; OG limpio 1200×630 JPEG; maestro PNG opcional. Son decisiones de producción para la landing y redes, no dimensiones obligatorias de SEO. Los tres derivados comparten concepto. La versión limpia mantiene compatibilidad con la landing actual, que también usa featured_image en metadatos.

## Multidioma y multideporte

ES: portada / gancho. EN: cover / hook. PT: capa / chamada. Los slugs se conservan en su idioma; en la variante escrita, hook y wordmark son el único texto. Alt localizado y revisado después de generar. No imponer soccer a USA; los contextos EN incluyen básquet, béisbol, voleibol, hockey y softball. Son elecciones editoriales, no un ranking de audiencia. Reservar fútbol para posts que lo tratan expresamente o un contexto deliberadamente indicado.

## SEO y accesibilidad

Nombres descriptivos, extensión coincidente con MIME, peso razonable, alt útil sin listas de keywords, imagen pertinente e indexable mediante img/src y URL pública estable. Para OG y datos estructurados se entrega versión sin texto siguiendo la guía actual de Google. No prometer ranking por un formato o filename. Fuente: https://developers.google.com/search/docs/appearance/google-images

## Pendientes locales fuera de este lote

Los 10 artículos SEO de BlogSEOPostsSeeder.php no aparecieron en el inventario público. Se incluyen solo como backlog en pendientes-locales.json, sin IDs inventados ni asignación automática. No generarlos ni publicarlos con el lote de 28 salvo ampliación expresa del encargo.
