# Auditoría de imágenes del blog de Widdo

Fecha de consulta: 13 de septiembre de 2026 (America/Bogota). Revisión de lectura, sin modificar posts ni publicar imágenes.

## Resultado

28 posts publicados en la API pública: 16 ES, 6 EN y 6 PT. Los 16 ES tienen stock de Unsplash: 9 con relación temática débil y 7 con relación parcial. Los 6 EN tienen imágenes cargadas, pero son tarjetas de título repetidas. Los 6 PT no tienen featured_image: la landing muestra un degradado y la categoría. No se detectaron fallos de carga al inspeccionar las portadas publicadas. Ninguno de los 28 contenidos devueltos por la API incluye etiquetas img dentro del cuerpo.

La pertinencia es una valoración editorial: una imagen puede aludir a Instagram o a familias y seguir siendo insuficiente para explicar el tema específico.

## Origen local y comportamiento

- `desarrollo/landing/src/lib/api.ts`: obtiene posts de https://api.widdo.co/api/blog y los revalida cada 300 segundos. El contenido no se genera en la landing.
- `desarrollo/landing/src/app/[locale]/blog/page.tsx:332`: pinta featured_image en las tarjetas; si falta, muestra categoría sobre degradado.
- `desarrollo/landing/src/app/[locale]/blog/[slug]/page.tsx:124`: usa el mismo campo para la portada del artículo. También lo utiliza en Open Graph y Twitter.
- `desarrollo/saas_sport/database/seeders/BlogPostsSeeder1.php` y `BlogPostsSeeder2.php`: contienen los 16 posts ES y sus URLs de stock, coincidentes con las publicadas.
- `desarrollo/saas_sport/database/seeders/BlogEnglishSeeder.php` y `BlogPortugueseSeeder.php`: contienen los artículos EN/PT originales. Los títulos EN publicados han cambiado respecto al seeder; el inventario público manda. No se encontró en la landing un generador de las seis tarjetas EN actuales.
- Las portadas EN se sirven desde `https://api.widdo.co/storage/blog/images/` y miden 2400×1260. Las ES usan URLs de 800×400.
- Tanto tarjetas como cabecera usan proporción 16:9 y object-cover: sus fuentes actuales se recortan lateralmente. Los 16 posts ES no tienen alt propio; se usa el título como respaldo.
- `BlogSEOPostsSeeder.php` contiene 10 artículos adicionales cuyos slugs no aparecen en el inventario público consultado. No se verificó si existen como borradores en una base local.

## Criterio de diseño común

Crear una portada distinta por idea, comprensible sin el título. Para operación del producto, capturas reales con datos demo; para procesos, diagramas editoriales; para comunidad, fotografía contextual de entrenamiento y familias. Una imagen editorial no debe aparentar ser una función ya disponible.

Para el encuadre actual: maestro 1600×900, WebP, objetivo de 150–250 KB cuando la legibilidad lo permita, zona segura del 10% y comprobación a tamaño de tarjeta móvil. Usar título breve opcional, no repetir el H1 entero. Conservar verde y marca Widdo discretos, sin imponer el mismo fondo a todo. Alt descriptivo de lo que se ve y en el idioma del post. Si se prepara una versión social 1200×630 aparte, hará falta conectar ese campo en los metadatos: actualmente consumen featured_image.

## Propuesta para cada post publicado

### Español

#### Widdo: Tu Identidad Deportiva Digital que Te Acompaña en Todos tus Roles

[Post publicado](https://widdo.co/es/blog/widdo-identidad-deportiva-digital)

**Estado actual:** Poco pertinente: persona pateando un balón.

**Cómo debería quedar:** Un perfil central conectado a cuatro roles: director, entrenador, padre y jugador. Mostrar el selector real de roles de Widdo y los clubes asociados, con datos de demostración. Diferenciar este concepto de identidad del artículo práctico sobre cambiar de rol.

[Imagen actual](https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=400&fit=crop)

**Nombre propuesto:** `widdo-identidad-deportiva-digital-cover.webp`

#### Tendencias de Escuelas Deportivas para 2026: Lo que Viene

[Post publicado](https://widdo.co/es/blog/tendencias-escuelas-deportivas-2026)

**Estado actual:** Poco pertinente: balón y piernas sobre césped.

**Cómo debería quedar:** Entrenamiento juvenil real con un entrenador usando una tablet; tres elementos secundarios representan inscripción digital, seguimiento individual y comunidad familiar. Sin estética futurista ni robot.

[Imagen actual](https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop)

**Nombre propuesto:** `tendencias-escuelas-deportivas-2026-cover.webp`

#### Automatiza tu Club: 5 Tareas que No Deberías Hacer Manualmente

[Post publicado](https://widdo.co/es/blog/automatizar-club-deportivo-tareas-manuales)

**Estado actual:** Relación parcial: dashboard de analítica web, ajeno a la operación del club.

**Cómo debería quedar:** Una composición con cinco tareas reconocibles: recordatorio de pago, comunicado, asistencia, inscripción y reporte. Usar fragmentos reales de Widdo cuando existan y un flujo editorial para explicar la automatización.

[Imagen actual](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop)

**Nombre propuesto:** `automatizar-club-deportivo-tareas-manuales-cover.webp`

#### Grupos de Facebook: El Arma Secreta para Comunidades Deportivas

[Post publicado](https://widdo.co/es/blog/grupos-facebook-comunidades-deportivas)

**Estado actual:** Poco pertinente: mesa de trabajo con papeles y un teléfono.

**Cómo debería quedar:** Vista demostrativa de un grupo privado de Facebook de un club: entrenamiento, aviso fijado y comentarios de familias. El grupo y su comunidad deben ser reconocibles, no solo el logo de Facebook.

[Imagen actual](https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=400&fit=crop)

**Nombre propuesto:** `grupos-facebook-comunidades-deportivas-cover.webp`

#### Cómo Definir los Precios de tu Escuela Deportiva (Sin Subvalorarte)

[Post publicado](https://widdo.co/es/blog/definir-precios-escuela-deportiva-colombia)

**Estado actual:** Relación parcial: persona firmando documentos.

**Cómo debería quedar:** Desglose visual de cancha, entrenadores, material y margen que desemboca en una mensualidad por alumno. Añadir calculadora y contexto de escuela deportiva; cualquier cifra debe etiquetarse como ejemplo.

[Imagen actual](https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop)

**Nombre propuesto:** `definir-precios-escuela-deportiva-colombia-cover.webp`

#### Cómo Organizar Eventos Gratuitos que Atraigan Nuevos Alumnos

[Post publicado](https://widdo.co/es/blog/organizar-eventos-gratuitos-atraer-alumnos)

**Estado actual:** Poco pertinente: pelotón de ciclismo.

**Cómo debería quedar:** Jornada de puertas abiertas: entrenador recibiendo a una familia, niños participando en una clase de prueba y mesa de inscripción. Debe comunicar captación mediante una experiencia gratuita.

[Imagen actual](https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=400&fit=crop)

**Nombre propuesto:** `organizar-eventos-gratuitos-atraer-alumnos-cover.webp`

#### Una Cuenta, Múltiples Roles: Cómo Widdo Simplifica tu Vida Deportiva

[Post publicado](https://widdo.co/es/blog/widdo-cuenta-multiples-roles-deportivos)

**Estado actual:** Poco pertinente: corredores a contraluz.

**Cómo debería quedar:** Secuencia de tres vistas reales: abrir el selector, elegir rol y entrar al espacio correspondiente. Misma persona y misma cuenta, con etiquetas Entrenador, Padre y Jugador.

[Imagen actual](https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=400&fit=crop)

**Nombre propuesto:** `widdo-cuenta-multiples-roles-deportivos-cover.webp`

#### Calendario de Contenidos para Clubes: Qué Publicar Cada Mes del Año

[Post publicado](https://widdo.co/es/blog/calendario-contenidos-clubes-deportivos)

**Estado actual:** Relación parcial: calendario de papel con taza.

**Cómo debería quedar:** Calendario editorial mensual legible con miniaturas de entrenamiento, testimonio, inscripción y torneo, más una pequeña franja de meses del año. Debe verse qué publicar, no solamente fechas.

[Imagen actual](https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=400&fit=crop)

**Nombre propuesto:** `calendario-contenidos-clubes-deportivos-cover.webp`

#### Cómo Transformar Padres en Aliados (No en Clientes que Solo Pagan)

[Post publicado](https://widdo.co/es/blog/transformar-padres-aliados-escuela-deportiva)

**Estado actual:** Relación parcial: padre con niños fuera del contexto deportivo.

**Cómo debería quedar:** Entrenador y padres revisando el progreso del niño junto a la cancha, o colaborando en una jornada del club. El foco es la participación y la alianza familia-entrenador.

[Imagen actual](https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&h=400&fit=crop)

**Nombre propuesto:** `transformar-padres-aliados-escuela-deportiva-cover.webp`

#### Cómo Crear un Programa de Referidos que Duplique tus Inscripciones

[Post publicado](https://widdo.co/es/blog/programa-referidos-duplicar-inscripciones)

**Estado actual:** Poco pertinente: reunión de oficina con portátiles.

**Cómo debería quedar:** Una familia del club presenta a otra al entrenador; complementar con el recorrido Invitar → Clase de prueba → Inscripción y beneficio para ambas familias, sin prometer duplicación garantizada.

[Imagen actual](https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=400&fit=crop)

**Nombre propuesto:** `programa-referidos-duplicar-inscripciones-cover.webp`

#### TikTok para Escuelas Deportivas: Ideas de Contenido que Atraen Alumnos

[Post publicado](https://widdo.co/es/blog/tiktok-escuelas-deportivas-ideas-contenido)

**Estado actual:** Poco pertinente: pantalla de inicio de un teléfono con varias apps.

**Cómo debería quedar:** Un móvil vertical grabando un ejercicio deportivo corto, con entrenador y jugadores visibles en su pantalla. Añadir una referencia discreta a TikTok y a la edición del clip.

[Imagen actual](https://images.unsplash.com/photo-1596558450268-9c27524ba856?w=800&h=400&fit=crop)

**Nombre propuesto:** `tiktok-escuelas-deportivas-ideas-contenido-cover.webp`

#### 5 Razones por las que los Alumnos Abandonan tu Escuela (y Cómo Evitarlo)

[Post publicado](https://widdo.co/es/blog/razones-abandono-alumnos-escuela-deportiva)

**Estado actual:** Poco pertinente: grupo de amigos adultos de espaldas.

**Cómo debería quedar:** Entrenador conversando con un alumno al margen del entrenamiento y una secuencia visual de ausencias. Transmitir detección y acompañamiento, evitando dramatizar o culpabilizar al menor.

[Imagen actual](https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop)

**Nombre propuesto:** `razones-abandono-alumnos-escuela-deportiva-cover.webp`

#### Cómo Reducir la Morosidad en tu Club Deportivo: Guía Práctica de Cobros

[Post publicado](https://widdo.co/es/blog/reducir-morosidad-club-deportivo-cobros)

**Estado actual:** Relación parcial: formularios fiscales y calculadora.

**Cómo debería quedar:** Tabla de mensualidades con estados Pagado, Pendiente y Vencido, junto a un recordatorio claro en un teléfono. Contexto del club y nombres ficticios; evitar papeles de impuestos.

[Imagen actual](https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop)

**Nombre propuesto:** `reducir-morosidad-club-deportivo-cobros-cover.webp`

#### Guía Completa de Instagram para Clubes Deportivos: Del Cero al Engagement

[Post publicado](https://widdo.co/es/blog/guia-instagram-clubes-deportivos)

**Estado actual:** Relación parcial: logo de Instagram.

**Cómo debería quedar:** Perfil demostrativo de una escuela deportiva con bio, destacados y una cuadrícula que muestre entrenamientos, logros y testimonios. Mantener el logo como apoyo, no como imagen completa.

[Imagen actual](https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=400&fit=crop)

**Nombre propuesto:** `guia-instagram-clubes-deportivos-cover.webp`

#### 7 Estrategias de Marketing que Funcionan para Escuelas de Fútbol en Colombia

[Post publicado](https://widdo.co/es/blog/estrategias-marketing-escuelas-futbol-colombia)

**Estado actual:** Poco pertinente: partido nocturno.

**Cómo debería quedar:** Escena de clase de prueba en una escuela de fútbol de barrio, familias y entrenador; acompañar con tres canales reconocibles: colegio aliado, redes locales y referidos. No intentar meter siete escenas diminutas.

[Imagen actual](https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=400&fit=crop)

**Nombre propuesto:** `estrategias-marketing-escuelas-futbol-colombia-cover.webp`

#### Adiós al Caos del WhatsApp: Cómo Organizar la Comunicación de tu Escuela Deportiva

[Post publicado](https://widdo.co/es/blog/adios-caos-whatsapp-escuela-deportiva)

**Estado actual:** Relación parcial: carpeta de apps de mensajería.

**Cómo debería quedar:** Composición antes/después: chat con mensajes mezclados frente a avisos ordenados por equipo, calendario y pagos. Usar mensajes ficticios de un club; el contraste debe entenderse sin leer el título.

[Imagen actual](https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&h=400&fit=crop)

**Nombre propuesto:** `adios-caos-whatsapp-escuela-deportiva-cover.webp`

### Inglés

#### What Per-Player Pricing Actually Costs a Growing Club

[Post publicado](https://widdo.co/en/blog/per-player-pricing-youth-sports-software)

**Estado actual:** Tarjeta tipográfica: título y categoría sobre fondo verde oscuro; no hay explicación visual del tema.

**Cómo debería quedar:** Gráfico de coste mensual frente a número de jugadores. Representar el ejemplo del artículo de 40 y 180 jugadores a $3 por jugador como ejemplo hipotético. Si se compara con Widdo, dibujar sus tramos vigentes de capacidad, no una tarifa plana ilimitada.

[Imagen actual](https://api.widdo.co/storage/blog/images/per-player-pricing-youth-sports-software.jpg)

**Nombre propuesto:** `per-player-pricing-youth-sports-software-cover.webp`

#### Why Dues Collection Breaks Down in Youth Sports Clubs

[Post publicado](https://widdo.co/en/blog/why-dues-collection-breaks-down)

**Estado actual:** Tarjeta tipográfica con el mismo fondo; solo cambia el texto.

**Cómo debería quedar:** Mostrar el recorrido desde un cobro disperso en chats y hojas hasta un registro único: importe, vencimiento, recordatorio y estado de pago. Una lista de cuotas reconocible debe dominar la composición.

[Imagen actual](https://api.widdo.co/storage/blog/images/why-dues-collection-breaks-down.jpg)

**Nombre propuesto:** `why-dues-collection-breaks-down-cover.webp`

#### Attendance Tracking Coaches Will Actually Use

[Post publicado](https://widdo.co/en/blog/attendance-tracking-youth-sports-clubs)

**Estado actual:** Tarjeta tipográfica con el mismo fondo; solo cambia el texto.

**Cómo debería quedar:** Primer plano de un entrenador usando la lista de asistencia en un móvil al borde de la cancha. Mostrar presentes/ausentes y pocas acciones; usar una captura real que corresponda al flujo disponible.

[Imagen actual](https://api.widdo.co/storage/blog/images/attendance-tracking-youth-sports-clubs.jpg)

**Nombre propuesto:** `attendance-tracking-youth-sports-clubs-cover.webp`

#### The Signals a Player Is About to Leave Your Club

[Post publicado](https://widdo.co/en/blog/signals-player-about-to-leave-club)

**Estado actual:** Tarjeta tipográfica con el mismo fondo; solo cambia el texto.

**Cómo debería quedar:** Línea temporal de varias semanas de un jugador ficticio: menos asistencias, pago tardío y menor comunicación. Terminar en contacto del entrenador con la familia, no en una predicción garantizada.

[Imagen actual](https://api.widdo.co/storage/blog/images/signals-player-about-to-leave-club.jpg)

**Nombre propuesto:** `signals-player-about-to-leave-club-cover.webp`

#### The Registration Season Checklist for Youth Clubs

[Post publicado](https://widdo.co/en/blog/registration-season-checklist-youth-sports)

**Estado actual:** Tarjeta tipográfica con el mismo fondo; solo cambia el texto.

**Cómo debería quedar:** Checklist de temporada en tres fases Before / During / After, con formulario de inscripción, autorización y pago. Un padre completando el proceso en el móvil refuerza el contexto.

[Imagen actual](https://api.widdo.co/storage/blog/images/registration-season-checklist-youth-sports.jpg)

**Nombre propuesto:** `registration-season-checklist-youth-sports-cover.webp`

#### The Group Text Is Not a Communication System

[Post publicado](https://widdo.co/en/blog/parent-communication-sports-club)

**Estado actual:** Tarjeta tipográfica con el mismo fondo; solo cambia el texto.

**Cómo debería quedar:** Comparativa de mensajes mezclados frente a un aviso de cambio de cancha dirigido a un equipo, con fecha, hora y confirmación de lectura ilustrativa. Distinguir esquema editorial de captura del producto.

[Imagen actual](https://api.widdo.co/storage/blog/images/parent-communication-sports-club.jpg)

**Nombre propuesto:** `parent-communication-sports-club-cover.webp`

### Portugués

#### Como reduzir a inadimplência de mensalidades na sua escolinha

[Post publicado](https://widdo.co/pt/blog/reduzir-inadimplencia-mensalidades-escolinha)

**Estado actual:** Sin imagen: aparece un degradado verde con el nombre de la categoría.

**Cómo debería quedar:** Mensalidade de un alumno ficticio con vencimiento, recordatorio y estado Em aberto / Pago en un teléfono; acompañar con la revisión del coordinador. Textos en portugués.

**Nombre propuesto:** `reduzir-inadimplencia-mensalidades-escolinha-cover.webp`

#### Pix, boleto ou cartão: como receber as mensalidades do clube

[Post publicado](https://widdo.co/pt/blog/pix-boleto-cartao-mensalidades-clube-esportivo)

**Estado actual:** Sin imagen: aparece un degradado verde con el nombre de la categoría.

**Cómo debería quedar:** Comparación editorial de tres métodos: QR ilustrativo de Pix, código de barras de boleto y tarjeta recurrente. Separar claramente los tres, sin presentarlos como integraciones disponibles de Widdo.

**Nombre propuesto:** `pix-boleto-cartao-mensalidades-clube-esportivo-cover.webp`

#### Evasão de alunos: os sinais que aparecem semanas antes da desistência

[Post publicado](https://widdo.co/pt/blog/evasao-de-alunos-escolinha-sinais)

**Estado actual:** Sin imagen: aparece un degradado verde con el nombre de la categoría.

**Cómo debería quedar:** Calendario de faltas consecutivas y señales de menor participación de un alumno ficticio, junto a una conversación del profesor con la familia. Centrar el gráfico en semanas previas a la salida.

**Nombre propuesto:** `evasao-de-alunos-escolinha-sinais-cover.webp`

#### Como captar novos alunos para a escolinha sem depender só da indicação

[Post publicado](https://widdo.co/pt/blog/captar-novos-alunos-escolinha-futebol)

**Estado actual:** Sin imagen: aparece un degradado verde con el nombre de la categoría.

**Cómo debería quedar:** Mapa del barrio conectado a Aula experimental → Comparecimento → Matrícula; escena de bienvenida a una familia en la cancha. Representar captación local y seguimiento, no crecimiento abstracto.

**Nombre propuesto:** `captar-novos-alunos-escolinha-futebol-cover.webp`

#### Grupo de WhatsApp com os pais: como organizar sem enlouquecer

[Post publicado](https://widdo.co/pt/blog/grupo-whatsapp-pais-escolinha)

**Estado actual:** Sin imagen: aparece un degradado verde con el nombre de la categoría.

**Cómo debería quedar:** Dos espacios separados: Avisos da turma y Conversas. Mostrar un aviso fijado con fecha/hora y un grupo social aparte; textos en portugués y mensajes ficticios.

**Nombre propuesto:** `grupo-whatsapp-pais-escolinha-cover.webp`

#### Categorias de base: chamada, atestado e documentação em dia

[Post publicado](https://widdo.co/pt/blog/gestao-categorias-de-base-documentacao)

**Estado actual:** Sin imagen: aparece un degradado verde con el nombre de la categoría.

**Cómo debería quedar:** Ficha demostrativa del alumno con Chamada, Contato de emergência, Atestado y Autorização, estados vigentes/pendientes y fecha de revisión. Añadir al profesor en la cancha; documentos e información ficticios.

**Nombre propuesto:** `gestao-categorias-de-base-documentacao-cover.webp`

## Artículos adicionales encontrados en el código local

Fuente: `desarrollo/saas_sport/database/seeders/BlogSEOPostsSeeder.php`. No forman parte de los 28 publicados. Se distingue la inspección visual de imágenes reutilizadas de las URLs nuevas que solo se localizaron en código.

### Cómo Cobrar Mensualidades en tu Escuela de Fútbol [Guía 2026]

Slug: `como-cobrar-mensualidades-escuela-futbol`

Pantalla de mensualidades de una escuela de fútbol, vencimiento y recordatorio al padre. La foto de una patada al balón no explica el cobro.

[Imagen asignada en el seeder](https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=400&fit=crop)

### 5 Errores Fatales al Administrar un Club Deportivo (y Cómo Evitarlos)

Slug: `errores-administrar-club-deportivo`

Cinco fallos operativos reconocibles: pago sin conciliar, asistencia en papel, mensaje perdido, registro duplicado y tarea sin responsable. La reunión de oficina compartida con Referidos no explica esos errores.

[Imagen asignada en el seeder](https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=400&fit=crop)

### Control de Asistencia para Deportistas: Guía Completa 2026

Slug: `control-asistencia-deportistas-guia`

Entrenador marcando asistencia en el móvil y lista del equipo en primer plano. La URL de stock está asignada localmente, pero su imagen no se inspeccionó visualmente en esta auditoría.

[Imagen asignada en el seeder](https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=400&fit=crop)

### Cuánto Cobrar de Mensualidad en Escuela de Fútbol Colombia 2026

Slug: `cuanto-cobrar-mensualidad-escuela-futbol-colombia`

Desglose de costes y mensualidad por alumno, contextualizado en Colombia. La foto fiscal reutilizada no representa cómo fijar una cuota deportiva.

[Imagen asignada en el seeder](https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop)

### Los 5 Mejores Software para Clubes Deportivos Colombia 2026 [Comparativa]

Slug: `software-clubes-deportivos-comparativa`

Matriz editorial de comparación de cinco herramientas, con criterios del artículo y datos revisados antes de diseñar. La URL de stock está asignada, pero no se inspeccionó visualmente.

[Imagen asignada en el seeder](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop)

### Cómo Comunicarse con Padres de Jugadores de Forma Efectiva

Slug: `comunicacion-padres-jugadores`

Entrenador y familia junto a un aviso claro con fecha, horario y acción. El grupo de amigos adultos reutilizado no representa comunicación deportiva con padres.

[Imagen asignada en el seeder](https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop)

### Plantilla Excel para Control de Pagos en Clubes [Descarga Gratis]

Slug: `plantilla-excel-control-pagos-club`

Captura de la plantilla Excel que realmente se entrega: alumno, mes, importe, vencimiento, pagado y saldo. Usar datos ficticios. La URL de stock existe en el seeder; no se inspeccionó visualmente.

[Imagen asignada en el seeder](https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop)

### Cómo Organizar un Torneo de Fútbol Infantil: Guía Paso a Paso

Slug: `como-organizar-torneo-futbol-infantil`

Bracket legible de un torneo infantil junto a un calendario de partidos y niños jugando. La foto genérica del balón solo indica fútbol.

[Imagen asignada en el seeder](https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop)

### Requisitos para Abrir una Escuela de Fútbol en Colombia 2026

Slug: `requisitos-abrir-escuela-futbol-colombia`

Checklist de apertura y plano sencillo de cancha con materiales y organización. Validar los requisitos del artículo antes de convertirlos en texto visual. La foto asignada no se inspeccionó visualmente.

[Imagen asignada en el seeder](https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=400&fit=crop)

### Cómo Retener Jugadores en tu Academia Deportiva: 7 Estrategias

Slug: `como-retener-jugadores-academia-deportiva`

Seguimiento de asistencia y progreso con conversación entrenador-jugador. El pelotón de ciclismo reutilizado no representa retención de alumnos.

[Imagen asignada en el seeder](https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=400&fit=crop)

## Orden recomendado

1. EN: sustituir las seis tarjetas tipográficas por portadas explicativas; es el idioma del mercado objetivo actual.
2. ES: corregir las nueve asociaciones más débiles, empezando por Identidad, Multirol, Referidos, Eventos y TikTok.
3. ES: mejorar las siete portadas parcialmente pertinentes.
4. PT: crear las seis faltantes si se mantiene esta publicación; Pix/boleto debe ser una comparación editorial, sin prometer integraciones de Widdo.
5. Artículos locales: preparar las imágenes antes de cualquier futura publicación.

## Fuentes públicas

[Blog ES](https://widdo.co/es/blog) · [ES página 2](https://widdo.co/es/blog?page=2) · [Blog EN](https://widdo.co/en/blog) · [Blog PT](https://widdo.co/pt/blog). Inventario y contenido: API pública `/api/blog?locale=es`, `en`, `pt`, incluyendo la segunda página ES.
