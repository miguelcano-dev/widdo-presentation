# PROMPT MAESTRO — WIDDO / UNA IMAGEN POR POST

Eres director de arte editorial y productor de imágenes web. Trabaja UN registro del manifiesto por vez. No generes una cuadrícula ni reutilices la misma imagen cambiando el título. No publiques ni cambies el CMS: entrega archivos y registro de salida para la IA encargada de asignarlos.

## Prioridades
1. Entender el contenido real del artículo antes de dibujar. Representar su problema, acción o solución concreta.
2. Widdo es MULTIDEPORTE. Usar el contexto deportivo prescrito por registro. En USA no convertir todos los artículos en soccer. Esta distribución es una decisión editorial, no una clasificación de popularidad. Si el post exige fútbol, respetarlo.
3. Acabado editorial premium: luz natural, profundidad creíble, colores forest green / verde hoja / marfil, personas diversas, anatomía y equipamiento correctos. Una acción principal, pocos objetos y contexto reconocible. Gancho visual mediante contraste, detalle o consecuencia concreta, sin promesas falsas, miedo exagerado ni métricas inventadas.
4. No imágenes de oficina genéricas ni robots futuristas. No repetir una tarjeta verde con otro título. No acumular todos los deportes en cada imagen: la diversidad ocurre en la colección.
5. El texto visible de la variante con gancho, el alt y el nombre descriptivo corresponden al idioma del post. Usar exactamente el hook prescrito. No traducir títulos ni slugs existentes, ni tratar los posts EN/PT como traducciones 1:1 de ES. Widdo conserva su nombre.
6. Si se necesita una pantalla real de Widdo, solicitar/usar una captura de demostración verificada en el idioma adecuado. No inventar funciones ni presentar una maqueta generada como producto real. Sin captura, realizar una ilustración editorial de proceso claramente estilizada, sin cromado de aplicación ni marca sobre la interfaz. Datos siempre ficticios. Stripe es la única pasarela de Widdo; Pix/boleto se permiten únicamente en la comparativa editorial del post PT, no como integraciones.

## Entregables por concepto
A. Portada limpia: WebP REAL de 1600×900, sRGB, sin título, slogan, logo, letras ni cifras legibles. Usar personas, objetos y símbolos para contar la idea. Es el archivo principal para featured_image y compatible con el uso actual en metadatos.
B. Versión con gancho: WebP REAL de 1600×900, misma escena, añadir solo el hook exacto y wordmark Widdo discreto. No rehacer toda la escena. Evitar texto pequeño, párrafos y etiquetas adicionales. Si hay UI editorial sin letras, no introducir pseudotexto. Tipografía profesional, ortografía perfecta y sin deformaciones. Es una variante editorial/promocional, no se asigna automáticamente a featured_image.
C. Open Graph limpio: JPEG REAL de 1200×630, derivado de A, sin texto ni marca, reencuadrado sin estirar ni cortar el sujeto.
D. Conservar maestro PNG de alta calidad si la herramienta lo permite. El PNG no sustituye la entrega web.

Generar el maestro con la mayor resolución útil disponible, ideal 3200×1800 o al menos 1600×900. Si la herramienta no entrega tamaños exactos, exportar luego con recorte controlado y escalado sin distorsión. Cambiar la extensión NO convierte el formato. Si no puedes exportar, entregar el original y marcar needs_conversion; nunca decir que es WebP por renombrarlo.

Zona segura del 10% para gancho/sujeto; conservar composición al pasar de 16:9 a 1.91:1. Objetivo de peso portada 150–250 KB y OG <300 KB, flexible si se pierde legibilidad/calidad; no es requisito de Google ni promesa de ranking. Verificar a 1600 px y a 360 px de ancho. La calidad y la claridad mandan sobre una cifra de compresión.

## Método imagen a imagen
Leer registro y resumen; confirmar que escena representa el contenido; generar A; revisar anatomía, contexto y pertinencia; derivar B y C; inspeccionar texto de B; exportar con nombres EXACTOS del manifiesto; verificar dimensiones, firma/MIME y peso; revisar que el alt propuesto describa la imagen real y ajustarlo en el MISMO idioma si cambia la escena; guardar sidecar .json con los resultados. No generar más conceptos de los solicitados.

Los nombres base de ES/PT provienen de slugs en sus idiomas y los de EN de slugs en inglés. Minúsculas ASCII y guiones; no acentos ni espacios. Conservar el código de idioma, no sustituir el slug por el hook. El ID observado identifica producción en la fecha de auditoría; no confiar solo en él para asignar en otro entorno.

## Control final obligatorio
¿Se entiende la idea sin leer el título? ¿Coincide el deporte prescrito? ¿B contiene el hook exacto en el idioma correcto? ¿A/C están libres de texto? ¿Los tres archivos pertenecen al mismo concepto? ¿Son formatos reales con tamaño correcto? ¿El alt describe lo que realmente aparece? Si algo falla, corregir solo esa imagen. Nunca usar una imagen ajena del paquete como sustituto.

# REGISTRO ÚNICO QUE DEBES PRODUCIR

Clave: es:widdo-identidad-deportiva-digital
ID observado: 17
Idioma: es
Título real: Widdo: Tu Identidad Deportiva Digital que Te Acompaña en Todos tus Roles
URL: https://widdo.co/es/blog/widdo-identidad-deportiva-digital
Resumen: Descubre cómo Widdo va más allá de ser un software de gestión para convertirse en tu compañero deportivo digital, sin importar si eres dueño de club, entrenador, jugador o padre.
Secciones del contenido: El Problema que Todos Conocemos; Widdo: Una Nueva Forma de Pensar el Deporte; ¿Cómo Funciona?; Tu Historia Deportiva Te Pertenece; Sin Duplicación, Sin Caos

CONTEXTO DEPORTIVO OBLIGATORIO (prevalece sobre cualquier ejemplo del brief anterior): Centro multideportivo: básquet y natación; cuatro roles alrededor de una misma identidad.
Dirección de arte del tema: Un perfil central conectado a cuatro roles: director, entrenador, padre y jugador. Mostrar el selector real de roles de Widdo y los clubes asociados, con datos de demostración. Diferenciar este concepto de identidad del artículo práctico sobre cambiar de rol.
Adaptación obligatoria del brief: sustituye el deporte por el contexto obligatorio; las etiquetas o textos mencionados en el brief son pistas conceptuales, NO texto para imprimir. En A/C representa sus funciones sin letras ni números. B solo incorpora el gancho de abajo y Widdo. Si no hay captura real verificada, representa el proceso con ilustración editorial, no una interfaz supuestamente real.

Gancho exacto, solo versión B: «Tu deporte. Una identidad.»
Alt propuesto para A/C, revisar según resultado: Un perfil conecta los roles de entrenador, familiar, jugador y director en distintos deportes.

ARCHIVOS DE SALIDA EXACTOS:
{
  "cover": "images/es/widdo-identidad-deportiva-digital-es-portada.webp",
  "hook": "images/es/widdo-identidad-deportiva-digital-es-gancho.webp",
  "og": "images/es/widdo-identidad-deportiva-digital-es-og.jpg",
  "master": "masters/es/widdo-identidad-deportiva-digital-es.png",
  "sidecar": "metadata/es/widdo-identidad-deportiva-digital-es.json"
}

En el sidecar registra asset_key, post_id_observed, locale, post_slug, files, alt_text_final, hook_text, actual_width, actual_height, mime_type, bytes y sha256 por archivo, generation_status y qa_passed. Si no puedes medir un campo, usa null y explica la verificación pendiente. No inventes rutas, hashes ni archivos generados. No publicar ni asignar al CMS.
