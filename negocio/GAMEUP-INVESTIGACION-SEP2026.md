# GameUp — Investigacion completa (verificado al 2-sep-2026)

Competidor potencial: plataforma de baloncesto juvenil cofundada por Cole Anthony (NBA) y su madre
Crystal McCrary McGuire. Lanzada el 10-sep-2023 en Harlem, NYC.

**Identidad confirmada:** sitio `www.gameup.fyi` (espejo `game-up.us`), Instagram `@gameup.nyc`,
LinkedIn `company/joingameup`, X `@gameup_nyc`, contacto `admin@gameup.fyi`. Fundada 2023.

**Homonimos descartados** (NO son esta empresa): `gameup.app` (app de gaming/ranking),
`linkedin.com/company/gameup-inc` (Salt Lake City, 2017, software, Thomas Haug),
`facebook.com/officialgameup` (gaming), GameUp Nutrition, GameUp Brasil.

**Metodo:** 40+ busquedas web, fetch directo del sitio, analisis del bundle JavaScript
(`/static/js/main.e956b431.js`, 1,5 MB) y consulta de sus APIs publicas sin autenticacion.

---

## 1. Sigue activa?

Si, pero con un patron dividido: **redes muy vivas, producto congelado**.

| Senal | Dato | Fuente |
|---|---|---|
| Despliegue del sitio | `last-modified: 6-jul-2026 17:59:38 GMT` (HTML y bundle JS) | cabeceras HTTP, consultadas 2-sep-2026 |
| Footer | `(c) 2026 GameUp. All rights reserved.` | string en el bundle JS |
| Infraestructura | React SPA sobre AWS S3 + CloudFront | `server: AmazonS3`, `via: cloudfront.net` |
| **App iOS** | **NO EXISTE** | iTunes Search API, `term=gameup` y `term=game up basketball`, pais US, 2-sep-2026: cero resultados suyos |
| **App Android** | **NO EXISTE** | Google Play search "GameUp youth basketball", 2-sep-2026 |
| Rating / n.o resenas | **No aplica** — no hay ficha de tienda | — |

> **Dato central:** pese a que TODA la prensa la llama "app", GameUp es una **web app (SPA)**,
> nunca publicada en App Store ni en Google Play. No hay app nativa que descargar.

### Ultimo post y frecuencia por red

| Red | Ultimo post verificado | Seguidores | Frecuencia |
|---|---|---|---|
| Instagram `@gameup.nyc` | **28-ago-2026** (`/p/Dcl9h_FEQ_8/`) | **25.800** | **Casi diaria** — posts el 24, 25, 26, 27 y 28 de agosto de 2026 |
| LinkedIn `joingameup` | **~1-sep-2026** ("hace 1 dia") | **699** | ~2-3 por semana |
| X `@gameup_nyc` | Fecha no encontrada; 80 tweets totales | **85** | Abandonada: bio aun dice *"Launching Summer 2023"* |
| Facebook `id=61557750935893` | No encontrado (muro de login) | No encontrado | — |
| TikTok | **No encontrado** — probablemente no existe | — | — |

Cuenta de X creada el 5-abr-2023 13:29:39 UTC (via API publica de fxtwitter, 2-sep-2026).

---

## 2. Que publican en redes

**Es contenido de medios sobre el ecosistema, no operaciones propias.**

Instagram (lectura del perfil, 2-sep-2026):

- **24-ago-2026** — Reel de un ex profesional: los minutos de juego importan mas que perseguir
  circuitos ("Go where you're celebrated, not where you're tolerated"). `/reel/Dcb_LwHPHuY/`
- **~25-ago-2026** — Tee Morant (padre de Ja Morant) sobre su filosofia de crianza.
  **1.800 likes, 25 comentarios.** `/p/DcebasfjzBM/`
- **26, 27 y 28-ago-2026** — carruseles + reel de un director grassroots sobre carreras mas alla
  de jugar. `/p/DchV93gkdrl/`, `/p/DcjT5ROke8e/`, `/p/Dcl9h_FEQ_8/`
- **25-nov-2025** — Instalaciones juveniles en Brooklyn, Baltimore y Filadelfia.
  **Solo 10 likes.** `/p/DRfqdesEaAZ/`

Bio de Instagram: *"Parent & Player resource for navigating the youth basketball landscape across
North America / Founded by @crystalmccrary & @the_cole.anthony"*. Enlace: `linktr.ee/gameupny`.

Highlights fijados (lineas historicas): Resources, **Youth Basketball Summit**, Founder Features,
Podcasts, Exclusives, **City Assist**.

LinkedIn, mismo patron editorial: cancha Blackstone/Paige Bueckers (~1-sep-2026), regreso del ABCD
Camp de Tracy McGrady (~27-ago-2026), KLUTCH Sports + Prudential sobre educacion financiera
(~26-ago-2026), Young Family Athletic Center de Oklahoma (~26-ago-2026), alianza con GirlDads
(~19-ago-2026), los medios en el deporte de preparatoria (~19-ago-2026), NIL como cambio
estructural, inversion comunitaria de los Houston Rockets (**28 reacciones**, su mejor post),
trabajo de Kyrie Irving en baloncesto juvenil.

Ciudades mencionadas en ese contenido: Brooklyn, Baltimore, Filadelfia, Oklahoma, Houston,
Indianapolis. **Son temas de reportaje, no mercados donde operen.**

> **Senal de tendencia:** el engagement paso de 10 likes (nov-2025) a 1.800 likes (ago-2026).
> Cambiaron el eje a contenido editorial y les esta funcionando.

**Eventos propios en 2025-2026: cero encontrados.** No hay clinicas, ferias, combines ni torneos
anunciados por ellos.

---

## 3. Cobertura geografica y deportes

Consulte su API publica de busqueda (`d31fjbwxgm7wix.cloudfront.net/search?query=...`, sin
autenticacion, la misma que llama su propia web) con 24 consultas variadas y recogi
**151 registros unicos**.

### Distribucion geografica

| Estado / provincia | Registros |
|---|---|
| NY | 83 |
| NJ | 18 |
| CT | 14 |
| Ontario (Canada) | 9 |
| MA | 8 |
| Quebec | 4 |
| VA | 4 |
| BC | 3 |
| DC | 2 |
| AB, NS, VT, MD, PA | 1 cada uno |
| **FL, CA, TX, IL** | **0** |

Ciudades dominantes: Manhattan (21), Bronx (12), Toronto (8), Brooklyn (5), New York (5),
Queens (5), New Rochelle (3), Holmdel (3), Albany (3).

### Deportes

**Solo baloncesto.** En las descripciones de los 151 registros: **83 menciones a "basketball" y
CERO** a baseball, soccer, football, volleyball, tennis, softball, lacrosse o hockey. Consultas
explicitas por "baseball program" y "soccer club" devuelven equipos de baloncesto.

Su propia web sigue prometiendo desde 2023: *"Starting with basketball, we will be rolling out
guides for baseball, soccer, tennis, and other sports in the near future."* **Tres anos despues,
sin cumplir.**

### Nada en Florida

**Cero registros en Florida**, pese a que Cole Anthony jugaba en Orlando. La consulta
"A AAU team from Orlando for 12 year olds" devuelve equipos de Nueva York, porque la busqueda
semantica opera sobre un corpus que solo tiene el area tri-estatal.

### El hallazgo mas duro: base de datos congelada

Los **151 registros tienen `createdAt` identico: 2025-11-02**, con `_version: 0` y
`_lastChangedAt: 2025-11-02T21:48:09.426Z`.

> El indice se sembro el **2 de noviembre de 2025** y **no ha recibido una sola alta ni una sola
> edicion en 10 meses**.

En agosto de 2024 Crystal McCrary declaro: *"We will be ready to expand across the US by fourth
quarter 2024"* (Local Hoops, 16-ago-2024). **Esa expansion nacional no ocurrio.**

El discurso publico si cambio: la bio de Instagram paso de "tri-state" a **"across North America"**,
coherente con los registros canadienses (Toronto, Vancouver, Montreal), no con presencia real en
Estados Unidos mas alla del noreste.

---

## 4. Modelo de negocio y precios

**No hay precios publicados en ninguna parte.**

Revise el bundle JS completo: la unica cifra en dolares (`$200/Month`) es un **placeholder** del
campo "Team Cost" del formulario de alta de equipos, es decir, lo que cobra el equipo al padre,
**no lo que cobra GameUp**.

Lo verificado:

- **Registro gratuito** para padres, equipos, programas y entrenadores.
  Formulario de alta activo: `form.jotform.com/251117629371052` ("Team / Program Submission Form").
  El prefijo `251` del ID indica creacion en 2025.
- **Basketball Concierge:** consulta 1-a-1 con personal de GameUp. Se agenda por Calendly
  (`calendly.com/game-up-team/game-up-call`). La nota de prensa de ago-2023 mencionaba una
  consulta inicial gratuita de 45 minutos; **hoy la web no publica ningun precio** para el servicio.
- **Chatbot "Terry"**, asistente de IA, gratuito.
- **Monetizacion real** (comision, suscripcion, cobro a entrenadores o programas):
  **no encontrado en ninguna fuente**, ni en la web, ni en prensa, ni en entrevistas.
- **Google Ads instalado** (`AW-11349119664`) con evento de conversion disparado en el submit del
  formulario. Es decir, **si invierten dinero en captacion de leads**.

Copy verificado del Basketball Concierge (extraido del bundle):

> *"Schedule a call with one of our knowledgeable basketball concierges, who will take the time to
> discuss your child's needs... Based on the consultation, our concierge will present you with a
> curated list of teams, programs, and trainers that match your child's requirements... We'll then
> connect you with the chosen team, program, or trainer."*

Es decir: **modelo de intermediacion/matching, sin monetizacion declarada.**

---

## 5. Equipo

**8 personas** segun el contador de LinkedIn. Banda declarada: **2-10 empleados**.
Industria listada: **"Community Services"** (no "Software" ni "Technology"). Fundada 2023.
Sede (HQ) en LinkedIn: no encontrada. Seguidores del LinkedIn: 699.

| Persona | Cargo | Fuente |
|---|---|---|
| Crystal McCrary McGuire | Founder | pagina About de gameup.fyi |
| Cole Anthony | Co-Founder | idem |
| **Kelvin Gardner** | **Chief Operating Officer** | About + `linkedin.com/in/kelvingardner/`. Perfil: estrategia y desarrollo de negocio en Universal Pictures, antes Lionsgate Entertainment |
| Kenton Blacutt | Technical Advisor | About. Fundador y CEO de Vax Pass y Kikt, Cloud App Developer en AWS |
| Bristol Fales-Hill | Senior Design Team Strategist | About. *"Currently studying Computer Science and Economics"*, practicas previas en Dartmouth y Emblematic Group — **perfil de estudiante** |
| Vasja Pandza | Senior Analyst, Strategy & Business | `linkedin.com/in/vasja-pandza/`. Brooklyn, MBA Sport & Entertainment Management (Seattle University), ex jugador D1. Actividad ligada a GameUp desde 10-ene-2025 |
| Janayshia Brown | Cargo no encontrado | listada entre empleados en LinkedIn |
| 1 perfil mas | No publico | contador de LinkedIn = 8 |

**CEO operativo: NO ENCONTRADO.** El cargo ejecutivo mas alto identificable es el COO.

### Tecnologia y proveedor

**La construyeron sobre AWS, sin proveedor externo identificado.** Stack verificado en el bundle:

- React SPA (Create React App)
- **AWS Amplify** (bucket de staging: `amplify-gameupdev-staging-212044-deployment`)
- **AWS Cognito** (autenticacion) + **AppSync GraphQL** (`a5o4dtgdzfhhdiwga4wvodj6ea.appsync-api`)
- **API Gateway + Lambda** (5 endpoints distintos) y **Lambda Function URLs** para el chatbot
- **S3 + CloudFront** (hosting estatico)
- Google Maps API, Calendly, Elfsight, Jotform, Google Ads

Kenton Blacutt (Cloud App Developer en AWS, Technical Advisor) encaja exactamente con ese stack.
**No encontre agencia ni estudio de desarrollo contratado.** Todo apunta a construccion interna
con un asesor tecnico de AWS.

**Ofertas de empleo: cero.** No hay vacantes en LinkedIn Jobs, Indeed ni ZipRecruiter.

> **La pagina About esta desactualizada:** aun describe a Cole Anthony como
> *"Point Guard Orlando Magic"*, cuando salio de Orlando en junio de 2025 y hoy juega en Australia.

---

## 6. Financiacion

**Ninguna ronda encontrada.** Sin ficha localizable en Crunchbase ni PitchBook, sin inversores
anunciados, sin valoracion publica, sin nota de prensa de levantamiento.

La unica declaracion publica sobre capital: Anthony y McCrary McGuire **la capitalizaron con dinero
propio** ("financially seeded GameUp themselves"), segun Boardroom, 12-sep-2023.

No hay ninguna noticia posterior que lo contradiga ni que anuncie capital externo.
**Conclusion: autofinanciada (self-funded), sin evidencia de capital institucional.**

---

## 7. Partnerships anunciados

**Todos los partnerships documentados son de 2023.**

- **10-sep-2023 — "City Assist"**, en el Police Athletic League Harlem Center
  (441 Manhattan Ave, NY 10026). Organizado por **Empire Invitational + GameUp +
  50 Ways Foundation**, con la **PAL de NYC** como sede.
  Programa: Youth Basketball Fair abierto al publico, clinicas de habilidades gratuitas, juegos de
  exhibicion de secundaria con livestream, becas.
  Niveles de patrocinio publicados: Service $5.000 (2 becas) / Community $10.000 (4) /
  Liberty $25.000 (9) / Scholar $50.000 (16) / **Champion $100.000 (32 becas, Title Sponsor)**.
  Contacto de patrocinios: Terry Wilson. Fuente: cityassistnyc.com

- **24-jun-2025 — Paley Center for Media**, panel *"Game Changers: The Evolving Business of Youth
  Sports"*. Crystal McCrary **modero**, acreditada como Co-Founder de GameUp, junto a Rachel Baker
  (GM de baloncesto masculino de Duke), Rich Kleiman (CEO/cofundador de Boardroom) y Amber Sabathia
  (agente de CAA Baseball). Tema: la industria de $40.000 millones del deporte juvenil, NIL,
  circuitos de torneos. **No es un partnership, es una aparicion.**

- **~19-ago-2026 — GirlDads Care**, mencionado en un post de LinkedIn de GameUp:
  *"GameUp, along with other leading sports companies, partnered with Girldads..."*, sobre eventos
  de baloncesto padre-hija.
  **NO CORROBORADO:** los socios publicos de GirlDads Care son Indiana Fever, NBA 2K, New Era,
  Catch the Stars Foundation, Jr. WNBA y Girls Inc. of Greater Indianapolis. **GameUp no aparece.**
  Queda como afirmacion unilateral de GameUp.

**NO ENCONTRADO:** Jr. NBA, AAU como organizacion, marcas, ligas, ni renovacion con PAL NYC o
Empire Invitational despues de 2023.

### City Assist no se repitio

El sitio `cityassistnyc.com` sigue en linea y **sigue diciendo literalmente
"CITY ASSIST 2023 IS BROUGHT TO YOU BY"**.

Los snapshots de Wayback (6-sep-2023, 26-feb-2024, 18-abr-2024, 27-may-2024, 11-jun-2024,
9-dic-2024, 16-mar-2025, 11-abr-2025, 16-abr-2025, 19-jun-2025, 6-oct-2025, **14-ene-2026,
12-abr-2026**) muestran la pagina viva (WordPress/Divi) pero **congelada en la edicion de 2023**.
Ninguna version anuncia una edicion posterior.

Ademas, la pagina de iniciativas de 50 Ways Foundation **no menciona City Assist en absoluto**.

---

## 8. Traccion y senales de problema

**Cifras autodeclaradas de usuarios, descargas o ingresos: ninguna, nunca.**
En tres anos no han publicado un solo numero.

### Lo que si pude medir directamente en sus APIs publicas

| Metrica | Valor | Endpoint |
|---|---|---|
| Equipos registrados por si mismos | **30** (26 en NY; 1 en NH, NC, VA, NJ) | `1h3m5ddhnl.../prod/teams` |
| Entrenadores registrados | **26** (13 NY, 4 NJ, 2 GA, 2 PA, 1 FL, RI, AL, AZ, NC) | `nmtqx9534b.../prod/trainers` |
| Registros en el indice de busqueda | 151 unicos descubiertos, **todos con fecha 2-nov-2025** | `d31fjbwxgm7wix.../search` |
| Campo `isApproved` en equipos | mayoria en `false` | `/prod/teams` |

> 30 equipos y 26 entrenadores autorregistrados en tres anos de operacion.

### La curva de prensa lo dice todo

- **2023 — pico.** Boardroom (12 y 13-sep), Essence, Black Enterprise, Blavity, Afrotech,
  Amsterdam News (6-sep), PIX 11 (19-sep), The Cari Champion Show (22-ago),
  The Big Money Show / Fox Business (30-ago). Todo entre el 22-ago y el 19-sep.
- **2024 — una sola pieza:** la entrevista de Local Hoops del 16-ago-2024.
- **2025 —** el panel del Paley Center (24-jun-2025) y un post de LinkedIn corporativo
  (12-mar-2025, con solo 2 reacciones).
- **2026 —** el podcast de Marketplace *"Betting on Yourself with Crystal McCrary"* del
  **21-may-2026**, que describe GameUp como *"su startup de deportes juveniles convirtiendo
  conocimiento generacional en riqueza seria"*. (La pagina devuelve HTTP 403; dato del resumen
  indexado, no verificado linea a linea.)

> La propia pagina de prensa de la cofundadora, `crystalmccrarymcguire.com/in-the-press/`,
> **no lista NINGUN articulo sobre GameUp en 2024, 2025 ni 2026.** Su ultimo item sobre GameUp es
> del 19-sep-2023.

### Testimonios

Solo dos, genericos y **sin nombre ni foto**:
*"GameUp has taken the guess work out of the youth basketball ecosystem"* y
*"GameUp has made my life much easier as a parent trying to figure out the best way to navigate
this crazy AAU world."*

### Cambios de nombre o pivotes

**No hubo cambio de nombre.** Si hay un **pivote de facto de producto a medios**: el directorio
lleva 10 meses sin tocarse mientras publican contenido editorial casi a diario y el engagement se
multiplico por 180. El "About" de LinkedIn ya se describe como
**"the digital home of youth basketball"** (lenguaje de medios), no como marketplace.

---

## 9. Cole Anthony hoy

### Linea de tiempo 2024-2026

| Fecha | Hecho |
|---|---|
| Temporada 2024-25 | Ultima en Orlando Magic: 67 partidos, 9,4 pts, 3,0 reb, 2,9 ast en 18,4 min |
| **15-jun-2025** | Traspasado a **Memphis Grizzlies** (con Kentavious Caldwell-Pope y varias 1.a ronda) por Desmond Bane |
| 30-jun-2025 | Se reporta que Memphis busca traspasarlo (ya tenian a Ja Morant y Scotty Pippen Jr.) |
| **12-jul-2025** | **Buyout** con Memphis. Renuncia a ~US$2M |
| **16-jul-2025** | Firma con **Milwaukee Bucks**, 1 ano al minimo |
| Temporada 2025-26 | 35 partidos con Bucks: 6,7 pts, 2,5 reb, 3,5 ast, .424/.306/.615 en 15,1 min (**minimo de su carrera**) |
| **5-feb-2026** | Traspasado a **Phoenix Suns** en operacion a 3 bandas |
| **27-feb-2026** | **Cortado (waived) por los Suns sin jugar un solo partido** (Shams Charania) |
| **4-5 ago-2026** | Firma con **Melbourne United** (NBL Australia) |

### Contrato 2026-27

**Firmado, un ano, con Melbourne United**, temporada NBL27. Salario exacto **no publicado**;
ESPN (12-ago-2026) reporta que el acuerdo lo convierte en **el import mejor pagado de la historia
de la NBL**, segun fuentes. La temporada arranca el **19-sep-2026** (165 partidos, 21 jornadas);
Melbourne United abre en John Cain Arena vs. Adelaide 36ers.

Sus palabras (ESPN, 12-ago-2026): *"No fue una jugada por dinero"* y *"Esta es una liga muy
respetada, donde puedo venir y potencialmente labrarme un camino de vuelta a la NBA"*.

### 50 Ways Foundation

Activa, pero con la web desactualizada. Cofundada con **Bryce Council**.

- 26-mar-2024 — 1.er torneo de bowling; donacion de $20.000 a dos organizaciones
- 31-jul-2024 — utiles escolares a 50 jovenes en Ivey Lane Neighborhood Center (Orlando)
- oct-2024 — gana el **NBA Cares Bob Lanier Community Assist Award**; la NBA dona $10.000
- 22-dic-2024 — 2.a fiesta navidena anual para ninos
- **6-abr-2025** — 2.o "50 Ways to 300" Bowling Fundraiser, en **Orlando, Florida**
- 2025 — "Cole Anthony Basketball Camps — Throughout 2025"
- 2026 — Bryce Council lanza el **Pathways Program** (fecha exacta no encontrada)

El **fondo de becas 50Ways-GameUp** sigue listado en la web de la fundacion: elimina barreras
economicas para inscribir chicos en programas de baloncesto "en el area tri-estatal y mas alla".
Sin cifras ni fechas de actividad reciente.

> **Senal de desactualizacion:** la home de `50waysfoundation.org` **todavia lo describe como
> jugador del Orlando Magic** y su noticia mas reciente es de **octubre de 2024**.

### Orlando / Florida

Su ultima actividad presencial verificable en Orlando es el **6-abr-2025**. Desde julio de 2025 no
hay confirmacion de residencia en Florida; desde septiembre de 2026 vive en Melbourne, Australia.

### Implicacion en GameUp: nominal

Su bio de Instagram sigue diciendo *"Co-Founder of @gameup.nyc"*, pero **no encontre ni una sola
declaracion, entrevista o post suyo sobre GameUp en 2024, 2025 ni 2026.** Toda su cobertura sobre
GameUp es de ago-sep 2023.

Ya en 2023 el reparto de roles era explicito (Boardroom): *"Anthony prioriza el baloncesto, y con
la temporada NBA a la vuelta de la esquina, GameUp esta en buenas manos: su mama lleva el timon
mientras el esta en la cancha."*

---

## 10. Crystal McCrary McGuire hoy

**Titulo en GameUp: Co-Founder**, consistente en todas las fuentes 2024-2026.
En su propia web se describe como creadora/founder.

### Proyectos 2025-2026

- **Productora ejecutiva de *She Runs the World***, documental sobre Allyson Felix, dirigido por
  Matthew O'Neill y Perri Peltz. **Estreno mundial en el Tribeca Festival, junio de 2025.**
  Coproducen Tory Burch, Tonya Lewis Lee y Sue Bird.
- **Cofundadora de Get To Yes Productions.** En desarrollo: *The Drug in Our Pocket*,
  *Fatherless No More*, y un documental sobre John W. Rogers Jr. y Mellody Hobson.
- **Board of Trustees del Paley Center for Media** (~mar-2025). En la web del Paley su afiliacion
  aparece literalmente como **"GameUp and Get To Yes Productions"**.
- 19-may-2025 — el Paley Center la homenajea como "trailblazer in media and sports".
- **Libro nuevo en 2025-2026: no encontrado.**

### Apariciones donde habla de GameUp

| Fecha | Formato | Detalle |
|---|---|---|
| **16-ago-2024** | Local Hoops, "Hoop Stories" #093 | Dice que GameUp **sigue en beta**, solo tri-state, y promete expansion nacional para **Q4-2024** |
| **24-jun-2025** | Paley Center, panel presencial | **Modera** acreditada como Co-Founder de GameUp |
| **12-ago-2025** | Podcast *HerMoney* | "Reinvention, Resilience, and Raising NBA Star Cole Anthony" |
| **21-may-2026** | Podcast **Marketplace**, *"Betting on Yourself"* | La presentan como **"emprendedora de sports tech"**. Pagina con HTTP 403 |
| Sin fecha | Podcast *She Pivots* (iHeart) | "Lawyer, Author, Documentarian, & GameUp Co-Founder" |

### Afirmaciones sobre crecimiento

Lo describe como activo pero **sin una sola metrica**. Su web dice que GameUp esta **"LIVE"** y
anuncia expansion a otros deportes, sin fecha. Cifras de usuarios: no encontradas.
Financiacion: no encontrada.

### LinkedIn

**Perfil personal no encontrado** en resultados de busqueda, ni actividad de publicaciones suyas.
Su presencia social verificable esta en X (`@crystalmccrary`) e Instagram (`@crystalmccrary`).

> Su web tiene copyright 2026 pero **aun describe a Cole como jugador de los Milwaukee Bucks**,
> dato superado desde febrero de 2026.

---

## (a) Resumen ejecutivo

GameUp esta **estancada como producto y activa como medio de comunicacion**. El sitio se
redesplego el 6-jul-2026 y publican casi a diario en Instagram, donde tienen 25.800 seguidores y
saltaron de 10 a 1.800 likes por post en nueve meses. Pero su directorio, el producto en si, tiene
151 registros con fecha de alta identica del 2-nov-2025 y **cero altas en diez meses**, mas solo
30 equipos y 26 entrenadores autorregistrados en tres anos. Prometieron expansion nacional para
Q4-2024 y siguen siendo NY tri-state mas algo de Canada: **cero registros en Florida, California,
Texas o Illinois**, y solo baloncesto pese a anunciar beisbol, futbol y tenis desde 2023. No existe
app en App Store ni Google Play, no hay financiacion externa conocida, no hay precios publicados,
no hay vacantes, el equipo son 8 personas sin CEO operativo, y su unico evento propio, City Assist,
no se repite desde 2023. Cole Anthony paso de Orlando a Memphis a Milwaukee, fue cortado por
Phoenix en feb-2026 y desde ago-2026 juega en Australia, sin una sola mencion publica a GameUp
desde 2023.

---

## (b) URLs consultadas

### Propias y APIs (verificacion directa)
- https://www.gameup.fyi/ · /about · /basketball-concierge · /search-landing · /trainer-signup · /joingame · /chatbot · /login · /forgot · /query
- https://www.gameup.fyi/static/js/main.e956b431.js
- https://game-up.us/ -> https://www.game-up.us/
- https://d31fjbwxgm7wix.cloudfront.net/search?query=...
- https://1h3m5ddhnl.execute-api.us-east-1.amazonaws.com/prod/teams
- https://nmtqx9534b.execute-api.us-east-1.amazonaws.com/prod/trainers
- https://gpk3uc64oa.execute-api.us-east-1.amazonaws.com/prod/
- https://mmz49mzmqe.execute-api.us-east-1.amazonaws.com/prod/
- https://d6odwpsicl636h6t6nexto5rjq0saybv.lambda-url.us-east-1.on.aws/
- https://a5o4dtgdzfhhdiwga4wvodj6ea.appsync-api.us-east-1.amazonaws.com/graphql
- https://form.jotform.com/251117629371052
- https://calendly.com/game-up-team/game-up-call
- https://itunes.apple.com/search?term=gameup&country=us&entity=software
- https://play.google.com/store/search?q=GameUp%20youth%20basketball&c=apps

### Redes sociales
- https://www.instagram.com/gameup.nyc/ · /reels/ · /p/DcebasfjzBM/ · /p/Dcl9h_FEQ_8/ · /p/DchV93gkdrl/ · /p/DcjT5ROke8e/ · /reel/Dcb_LwHPHuY/ · /p/DRfqdesEaAZ/
- https://www.linkedin.com/company/joingameup/ · /people/ · /posts/
- https://www.linkedin.com/posts/joingameup_new-york-city-gameup-has-beginner-to-activity-7305588456313741312-Bj5h
- https://www.linkedin.com/in/kelvingardner/ · /in/vasja-pandza/ · /in/bryce-council/
- https://www.linkedin.com/posts/vasja-pandza_what-euroleague-and-imgs-new-deal-means-activity-7283556014640054274-v6Sq
- https://x.com/gameup_nyc · https://api.fxtwitter.com/gameup_nyc
- https://www.facebook.com/profile.php?id=61557750935893 (bloqueado)
- https://www.tiktok.com/@gameup.nyc (sin datos)
- https://linktr.ee/gameupny · https://link.me/gameup.nyc
- https://www.instagram.com/the_cole.anthony/ · /crystalmccrary/ · /50waysfoundation/ · /p/DHL4_waut88/ · /p/DT_pWcuERNZ/

### Eventos y fundacion
- https://cityassistnyc.com/
- http://web.archive.org/web/20251006192022/https://cityassistnyc.com/
- http://web.archive.org/cdx/search/cdx?url=cityassistnyc.com
- http://web.archive.org/cdx/search/cdx?url=gameup.fyi
- https://www.50waysfoundation.org · /events
- https://www.paleycenter.org/industry-events/mc-crystal-mccrary-game-changers
- https://www.paleycenter.org/events/paleyhonors-ny

### Prensa GameUp
- https://boardroom.tv/cole-anthony-crystal-mccrary-mcguire-gameup-nba/
- https://local-hoops.com/blogs/hoop-stories/crystal-mccrary-co-founder-of-gameup-and-writer-author-producer-hoop-story-093
- https://www.newswire.com/news/nba-star-cole-anthony-teams-up-with-his-mother-nyt-best-selling-author-22106637
- https://www.accessnewswire.com/774623/
- https://amsterdamnews.com/news/2023/09/06/a-youth-basketball-development/
- https://www.essence.com/entertainment/nba-star-and-mom-launch-game-up/
- https://www.blackenterprise.com/cole-anthony-mom-youth-sports-app/
- https://blavity.com/cole-anthony-mom-crystal-mccrary-launch-app-help-athletes
- https://afrotech.com/nbas-cole-anthony-partners-with-mother-for-gameup-app

### Cole Anthony
- https://www.nba.com/news/magic-grizzlies-trade-bane-caldwell-pope
- https://hoopshype.com/2025/06/30/memphis-trying-to-move-cole-anthony/
- https://www.si.com/nba/bucks/news/new-bucks-guard-gave-up-2-million-to-sign-with-milwaukee-01k0cp88a0ef
- https://www.cbssports.com/nba/news/former-magic-first-round-pick-cole-anthony-plans-to-sign-with-bucks-after-buyout-from-grizzlies-per-report
- https://www.nba.com/news/cole-anthony-nick-richards-bucks-suns-trade-2026
- https://africa.espn.com/nba/story/_/id/48056157/sources-suns-waive-cole-anthony-deadline-acquisition
- https://www.melbourneutd.com.au/news/nba-star-cole-anthony-signs-with-melbourne-united
- https://www.hoopsrumors.com/2026/08/cole-anthony-joining-melbourne-united.html
- https://www.espn.com/nbl/story/_/page/TAB37FY26/nbl-melbourne-united-nba-treading-own-path-cole-anthony-embracing-unprecedented
- https://www.nbl.com.au/news/nbl-unveils-exciting-2026-27-schedule
- https://en.wikipedia.org/wiki/Cole_Anthony
- https://www.rotowire.com/basketball/player/cole-anthony-5232
- https://www.nba.com/magic/news/cole-anthony-hosts-bowling-fundraiser-announces-20k-donation-to-pair-of-charities-20240326
- https://www.nba.com/magic/news/cole-anthony-orlando-magic-help-surprise-youth-with-back-to-school-supplies-20240731
- https://pr.nba.com/magics-cole-anthony-named-nba-cares-bob-lanier-community-assist-award-october-winner/
- https://www.nba.com/magic/news/cole-anthony-and-his-50-ways-foundation-hosts-second-annual-holiday-party-for-kids-20241222
- https://www.nba.com/magic/news/cole-anthony-hosts-second-ever-bowling-fundraiser-to-support-50-ways-foundation-20250406
- https://www.si.com/nba/magic/news/cole-anthony-bowling-fundraiser-is-orlando-magic-guard-latest-passion-project-nba-50-ways-foundation-
- https://orlandomagicdaily.com/cole-anthony-breaks-silence-orlando-magic-departure
- https://orlandomagicdaily.com/posts/cole-anthony-gives-back-to-orlando-his-home

### Crystal McCrary McGuire
- https://crystalmccrarymcguire.com/ · /in-the-press/ · /gameup/ · /gty-productions/ · /filmmaker-producer/
- https://gettoyesproductions.com/
- https://tribecafilm.com/films/she-runs-the-world-2025
- https://deadline.com/2025/06/allyson-felix-she-runs-the-world-interview-1236425080/
- https://variety.com/2025/film/reviews/she-runs-the-world-review-allyson-felix-1236422453/
- https://www.marketplace.org/episode/2026/05/21/betting-on-yourself-with-crystal-mccrary (403)
- https://hermoney.com/earn/careers/crystal-mccrary-mcguire-on-reinvention-resilience-and-raising-nba-star-cole-anthony-podcast/
- https://www.iheart.com/podcast/1119-she-pivots-109642363/episode/crystal-mccrary-mcguire-lawyer-author-documentarian-gameup-co-founder-170374565
- https://en.wikipedia.org/wiki/Crystal_McCrary
- https://www.thehistorymakers.org/biography/crystal-mccrary-mcguire
- https://pacnyc.org/bio/crystal-mccrary/
- https://www.imdb.com/name/nm2168434/

---

*Investigacion realizada el 2-sep-2026. Solo hechos verificados con fecha y fuente; lo no hallado
esta marcado como "no encontrado". Sin recomendaciones de negocio.*
