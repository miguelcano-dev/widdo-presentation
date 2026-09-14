# Instrucciones para la IA que carga y asigna las imágenes

Estas instrucciones describen una tarea futura. Este paquete NO es autorización para publicar; la IA ejecutora debe tener autorización del usuario para modificar el destino.

1. Leer manifest.json y sidecars de imágenes realmente generadas. Procesar solo generation_status=ready y qa_passed=true; los registros iniciales not_generated no son cargables.
2. Resolver cada post por la pareja EXACTA locale + post_slug. Verificar título/contenido y contrastar ID observado; los IDs pueden cambiar entre entornos. Si no coincide, detener solo ese registro. No crear posts, traducir slugs ni emparejar por título parecido.
3. Verificar cada archivo: existencia, MIME real (no solo extensión), dimensiones, peso, sha256, correspondencia visual con tema/deporte y texto correcto. Revisar alt_text_final; no copiar a ciegas el alt propuesto.
4. Leer y guardar valores anteriores de featured_image, featured_image_alt y og_image y la identidad del destino en rollback.json. No eliminar los archivos anteriores. Cargar con la función de media ya existente del CMS; conservar nombre del manifiesto si el backend lo admite, o registrar el nombre/URL reales si los transforma.
5. Usar SIEMPRE la URL pública devuelta por la carga, nunca inventar que el archivo existe en /storage. Destino de featured_image = URL de files.cover; featured_image_alt = alt_text_final. Variante files.hook queda como recurso editorial y no reemplaza automáticamente la portada limpia. og_image = URL de files.og cuando esté soportado.
6. Compatibilidad observada en código: el modelo BlogPost admite featured_image_alt y og_image. En el controlador Admin se vieron validaciones de featured_image y og_image; verificar la persistencia de alt en la ruta exacta utilizada. No asumir que el formulario/API guarda un campo por el solo hecho de existir en el modelo.
7. La landing actual src/app/[locale]/blog/[slug]/page.tsx usa featured_image para Open Graph, Twitter y BlogPosting.image, aunque exista og_image en backend. Cargar og_image solo NO cambia esos metadatos. La portada limpia es el fallback compatible. Si se autoriza conectar la variante OG: exponer og_image en tipos/respuesta si falta y usarlo con fallback a featured_image en metadatos; declarar dimensiones reales y alt. Mantener portada limpia en BlogPosting.image o usar OG limpio de manera coherente. No cambiar títulos/canonical/hreflang.
8. Para la imagen hero: dimensiones explícitas o reserva de proporción, carga prioritaria solo si es LCP. Tarjetas: lazy loading y variantes responsive si el sistema lo soporta. No aplicar lazy loading indiscriminadamente a la portada principal. src público accesible a rastreadores, sin login, URL firmada temporal ni noindex de imagen. Considerar sitemap de imágenes si aporta descubrimiento.
9. Verificar la página pública tras revalidación (el código observado usa 300 s): imagen correcta en lista y artículo, alt correcto, móvil, OG/Twitter y JSON-LD. Registrar URL usada, identidad del post, resultado y fecha. Un upload exitoso no prueba que la asociación ni la caché se hayan actualizado.
10. Guardar assignment-results.json con asset_key, matched_post_id, environment, original_values, uploaded_urls, updated_fields, verification_results y status. Si falla, marcar blocked con motivo; nunca asociar la siguiente imagen como sustituto. Hacer cambios reversibles por post; rollback restaura valores anteriores, no borra imágenes indiscriminadamente.

Plantilla conceptual de campos (sustituir solo por resultados comprobados):
```json
{
  "selector": {"locale": "es", "slug": "adios-caos-whatsapp-escuela-deportiva"},
  "updates": {
    "featured_image": "<URL_REAL_DEVUELTA_PARA_PORTADA_LIMPIA>",
    "featured_image_alt": "<ALT_REVISADO_CONTRA_IMAGEN>",
    "og_image": "<URL_REAL_DEVUELTA_PARA_OG_LIMPIO>"
  }
}
```
No es el contrato literal de una API; verificar método y ruta en el entorno antes de escribir.
