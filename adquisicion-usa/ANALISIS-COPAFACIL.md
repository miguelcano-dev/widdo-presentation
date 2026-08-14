# CopaFacil — teardown y cómo llegar a sus organizadores

Fecha: 28 julio 2026. Para Miguel (Widdo).

Cómo leer este documento: cada dato lleva etiqueta.

- **[VERIFICADO]** = registro oficial, la propia web de la empresa, o una fuente primaria que se pudo abrir y leer.
- **[PROBABLE]** = varias señales apuntan a lo mismo, pero no hay lectura directa de la fuente.
- **[SIN CONFIRMAR]** = no se pudo comprobar. Trátalo como hipótesis.

Aviso de honestidad antes de empezar: **CopaFacil es mejor que Widdo en varias cosas**, y están dichas sin adornos en este documento. Distribución, profundidad de formatos de torneo, precio y años de iteración. Si lees esto buscando confirmación de que Widdo gana, no la vas a encontrar. Lo que sí vas a encontrar es dónde CopaFacil no juega, que es donde puedes ganar.

---

## 1. Qué es, de dónde es, desde cuándo

### Lo verificado

**CopaFacil es brasileña. Confirmado por doble fuente independiente.**

| Dato | Valor | Estado |
|---|---|---|
| Razón social | JOSE AUGUSTO N COSTA LTDA | [VERIFICADO] |
| Nombre fantasía | COPA FACIL | [VERIFICADO] |
| CNPJ | 34.843.209/0001-39 | [VERIFICADO] |
| Domicilio | Rua Coronel Murilo Otávio de Barros 397, bairro Gruta de Lourdes, Maceió, Alagoas, CEP 57.052-401 | [VERIFICADO] |
| Apertura de la empresa | 12 de septiembre de 2019 | [VERIFICADO] |
| Porte | MICRO EMPRESA, régimen Simples Nacional | [VERIFICADO] |
| Naturaleza jurídica | 206-2, Sociedade Empresária Limitada | [VERIFICADO] |
| Capital social | R$ 15.000 (unos 2.700 dólares) | [VERIFICADO] |
| CNAE principal | 62.03-1-00, desarrollo y licenciamiento de software no personalizable | [VERIFICADO] |
| Situación | ATIVA, sin motivo de baja | [VERIFICADO] |

Cómo se verificó: el propio pie de página de copafacil.com publica la razón social y el CNPJ. Ese CNPJ se consultó contra la Receita Federal por dos vías distintas (receitaws.com.br/v1/cnpj/34843209000139 y brasilapi.com.br/api/cnpj/v1/34843209000139) y ambas devuelven razón social, nombre fantasía y dirección idénticos. Además, el vendedor legal de la app en la App Store figura como "JOSE AUGUSTO N COSTA LTDA".

### El fundador: una sola persona

El cuadro societario público (QSA) tiene **un único elemento**: José Augusto Neves Costa, Sócio-Administrador, franja de edad 31 a 40 años. No hay segundo socio, ni holding, ni fondo. [VERIFICADO: QSA de Receita Federal]

Confirmación cruzada: el whois de copafacil.com.br declara como titular a "Jose Augusto Neves Costa" con un fragmento de CPF (***.040.624-**) que coincide exactamente con el del QSA. Dominio y empresa son la misma persona. [VERIFICADO]

**Esto reencuadra toda la competencia.** No compites contra una startup brasileña con equipo. Compites contra otro fundador solo, igual que tú, solo que con siete años y medio de ventaja en distribución.

### El producto es anterior a la empresa

- copafacil.com registrado el 13 de febrero de 2018 en GoDaddy [VERIFICADO: whois]
- copafacil.com.br registrado el 28 de febrero de 2018 [VERIFICADO: whois]
- App iOS publicada el 15 de diciembre de 2018 [VERIFICADO: iTunes Lookup API, id 1444543396]
- Empresa formalizada el 12 de septiembre de 2019 [VERIFICADO: Receita Federal]

Es decir: construyó el producto gratis, lo validó durante año y medio, y solo abrió CNPJ cuando tuvo que facturar. La edad real del producto es **febrero de 2018**, no septiembre de 2019.

**Trampa a evitar en cualquier pitch o análisis:** en archive.org hay capturas de copafacil.com.br de 2013 y 2014. **No son de esta empresa.** Son de un directorio de comercios de Rio de Janeiro (Shopping Leblon, Pizza Hut Copacabana). El dominio caducó y José Augusto lo re-registró en 2018. [VERIFICADO: lectura directa del snapshot 20130925053313]

### Tamaño real

- **Google Play: 5.000.000+ descargas, unas 158.000 reseñas, 4,9 estrellas.** Distribución: 5★=143.003, 4★=8.727, 3★=2.349, 2★=602, 1★=1.879. [VERIFICADO: parseo del HTML de play.google.com/store/apps/details?id=com.copafacil]
- **App Store Brasil: 4,88 estrellas con 37.628 valoraciones.** [VERIFICADO: iTunes Lookup API]
- Versión 3.91, publicada el 14 de julio de 2026. **El producto está vivo y mantenido**, no abandonado. [VERIFICADO]

Nota sobre discrepancias: circulan cifras de "1 millón" y de "6 millones" de instalaciones según la fuente y la fecha de la consulta. La lectura directa de Google Play da **5M+**, y esa es la que hay que usar. Cualquier otra es de agregador. [VERIFICADO con salvedad]

### No es solo Brasil. Ya está dentro de tus mercados

Valoraciones de iOS por tienda nacional. Como cada tienda es de un país, esto es un proxy directo de usuarios reales, no de tráfico web. [VERIFICADO: iTunes Lookup API consultada storefront por storefront]

| País | Valoraciones iOS |
|---|---|
| Brasil | 37.628 |
| México | 7.249 |
| Estados Unidos | 4.771 |
| Argentina | 4.572 |
| **Colombia** | **3.281** |
| Chile | 2.881 |
| España | 2.347 |
| Perú | 362 |

**El dato incómodo: CopaFacil ya está en Colombia y ya está en Estados Unidos.** No es un competidor brasileño que algún día vendrá. Ya llegó. Y en México y Argentina es más fuerte que en Estados Unidos.

Matiz importante que sale de la prospección: buscando huella específica en Estados Unidos (site:copafacil.com liga Texas Florida Miami Houston) **no aparece prácticamente nada**. Las 4.771 valoraciones de la tienda de USA probablemente son diáspora latina y brasileña, no ligas locales organizadas con CopaFacil. Así que en Florida y Texas **CopaFacil no es tu competidor real hoy** — es una fuente de leads. [VERIFICADO por ausencia en buscador]

### Multi-idioma desde 2019

Cinco idiomas: portugués, español, inglés, francés e italiano. Ya estaban en abril de 2019. Tiene sitio completo en español en copafacil.com/es y la app se llama "Easy Tournament" en la tienda de Estados Unidos. [VERIFICADO: snapshot Wayback 20190408163944 + languageCodesISO2A de iTunes]

**Consecuencia dura para ti: "bilingüe ES/EN" no es un diferenciador frente a CopaFacil.** Ellos tienen cinco idiomas desde hace siete años. Tu memoria de proyecto ya decía "bilingüe = feature, no filtro". Estaba en lo cierto.

### Inversión: cero

No hay ronda, ni aceleradora, ni adquisición, ni prensa. Búsquedas en portugués sobre inversión y aceleradoras no devuelven ni un resultado. linkedin.com/company/copafacil y /company/copa-facil devuelven ambos error 404. El capital social de R$15.000 es el mínimo simbólico: prueba dura de que nunca entró dinero externo. [VERIFICADO por ausencia + estructura societaria]

Descartada expresamente una hipótesis: mwm.ai aparece en búsquedas listando la app, pero su propio aviso legal dice que no es página oficial del desarrollador. Es un agregador de analítica, **no un comprador**.

### Estructura técnica y de equipo

La web corre sobre Firebase con Express detrás del CDN Fastly. Existe el host copafacil-web.firebaseapp.com. [VERIFICADO: cabeceras HTTP y DNS]

Arquitectura serverless barata, coherente con servir millones de descargas sin equipo de infraestructura. Sus costes marginales son casi cero, y por eso puede sostener precios de 39 dólares al año indefinidamente. **En estructura de costes no le vas a ganar.**

Número de empleados: **[PROBABLE] una sola persona.** Convergen el QSA de un socio, la ausencia de página de empresa en LinkedIn, el soporte por WhatsApp y email, y una dirección fiscal residencial. Un CNPJ no publica nómina, así que no se puede descartar que trabaje con freelances. [SIN CONFIRMAR el número exacto]

### Línea lateral: apps de marca blanca

Bajo el mismo CNPJ hay cuatro apps más, casi todas para clientes hispanohablantes: [VERIFICADO: iTunes Lookup del developer id 1444543395]

- **Santa Teresita Cup** (com.santateresitacup, feb 2019, 365 valoraciones en Argentina)
- **Copa Nacional de Campeones** (com.copanacionaldecampeones, abr 2019, 487 valoraciones en Argentina)
- **Semilleros** (app.semilleros, sep 2023, 80 valoraciones en Argentina)
- **FutPlay** (bundle pe.com.tuarbitro, mar 2022, 627 valoraciones en **Perú**, actualizada en abril de 2026)

Los identificadores de paquete son de cliente ("pe.com.tuarbitro" apunta a un cliente peruano llamado TuArbitro), lo que indica desarrollo a medida para terceros, no marcas propias.

Doble lectura. Amenaza: ya vende apps de marca blanca a organizadores en Argentina y Perú, un movimiento que tú podrías querer hacer en Colombia. Oportunidad: "Semilleros" y "Copa Nacional de Campeones" son vocabulario de fútbol formativo latinoamericano. Están tocando tu segmento base. [SIN CONFIRMAR si son contratos pagados o un add-on del plan Profesional; no hay página comercial que lo anuncie]

---

## 2. Qué hace y cómo gana dinero

### La respuesta directa: NO cobra las inscripciones. Cero. Ni comisión.

Esta es la conclusión más importante del documento entero.

**CopaFacil no toca el dinero de los participantes.** No hay pasarela de pago para inscripciones, no hay reparto de fondos, no hay comisión por transacción. Su único ingreso es la suscripción que el organizador le paga a él.

Cuatro pruebas convergentes, todas [VERIFICADO]:

1. **Su propia web lo dice**: "Você pode começar a usar imediatamente, sem a necessidade de cadastrar seus dados financeiros" (puedes empezar a usarlo sin registrar tus datos financieros). Esa frase es incompatible con procesar cobros.
2. **La lista de funciones dice "Formulário de inscrição das equipes"** — un formulario, no un cobro. La palabra que falta en todo el sitio es "pagamento", "cobrança", "Pix", "Mercado Pago" o "Stripe" aplicado a terceros.
3. **Las compras dentro de la app en la App Store son exclusivamente suscripciones** (Small, Medium, Big, en mensual, trimestral y semestral). No hay ningún producto de tipo "tasa de inscripción".
4. **Prueba de campo**: el reglamento del "1° Torneio dos Órgãos COP Planaltina", alojado en CopaFacil, instruye a los equipos a pagar los R$250 de inscripción "por meio de PIX ou em dinheiro, com recibo de comprovante de pagamento entregue ao responsável da equipe", con castigo de derrota administrativa si no pagan en 72 horas. Es texto plano de reglamento. No hay botón de pago. Igual en la LIGA INDEPENDENTE COOP LEAGUE de Japeri (Rio de Janeiro): "A taxa de inscrição será de 500 reais + 2 packs de Brahma latão", pagadera en dos plazos, sin checkout.

**Traducción a lenguaje de venta:** el organizador que usa CopaFacil está persiguiendo pagos por Pix y en efectivo, entregando recibos de papel, y amenazando con W.O. a los que no pagan. Ese es exactamente el dolor de Widdo. El guion de venta se escribe solo.

### Lo que sí cobra: la suscripción del organizador

Precios en Brasil [VERIFICADO: copafacil.com/plans]:

| Plan | Mes | Trimestre | Semestre | Año | Límite |
|---|---|---|---|---|---|
| Pequeños | R$25 | R$67 | R$120 | R$210 | 300 jugadores, 3 patrocinadores |
| Intermedios | R$32 | R$85 | R$150 | R$268 | 600 jugadores, 6 patrocinadores |
| Grandes | R$40 | R$105 | R$190 | R$336 | 900 jugadores, 12 patrocinadores |
| Organizador Profesional | R$55 | R$148 | R$264 | R$462 | Sin límite + embed HTML + API JSON |

Precios internacionales en el sitio en español [VERIFICADO: copafacil.com/es/plans]: 4,70 / 6,00 / 7,50 / 10,30 al mes, o **39,00 / 50,00 / 62,90 / 86,50 al año**.

Hay además un **plan gratuito con publicidad**. Todos los planes de pago listan "Campeonatos sem propagandas" como beneficio, de lo que se deduce que el gratis muestra anuncios. [PROBABLE — los límites exactos del plan gratuito no están publicados en ninguna página accesible]

Incoherencia detectada: los precios de compra dentro de la app en iOS no coinciden con los del sitio (van de R$20,90 a R$122,90, con nombres distintos). Y en el HTML de la portada queda comentado un plan antiguo, "campeonatos GRANDE R$29,90/Mês", que hoy cuesta R$40. **Han subido precios y tienen desorden entre canales.** Típico de fundador solo. [VERIFICADO]

### Sobre el precio: la comparación original estaba mal planteada (corregido 28-jul-2026)

**La versión anterior de esta sección decía "eres entre 2,3 y 5 veces más caro". Miguel lo desafió con razón y hay que matizarlo.**

No se estaban comparando las mismas unidades:
- **Widdo cobra ~200 $/año a un CLUB** por gestionarlo todo el año: inscripciones, cuotas mensuales, documentación, convocatorias y torneos.
- **CopaFacil cobra 39-86,50 $/año a un ORGANIZADOR** por gestionar torneos, con cupo de jugadores (300/600/900/ilimitado).

Un club que necesita cobrar cuotas cada mes **no puede usar CopaFacil a ningún precio**: el producto no tiene el concepto de club con socios que pagan. No son sustitutos, así que "más caro" es una comparación inválida.

**Pero el riesgo comercial sí es real, y es de posicionamiento, no de precio.** Si un organizador que solo quiere montar un torneo pone las dos pestañas al lado, ve 200 $ contra 39 $ y no lee la letra pequeña. No pierdes porque seas caro: pierdes porque te dejaste comparar en la categoría equivocada.

La conclusión práctica no cambia de dirección, pero sí de motivo: **nunca te vendas como "plataforma de torneos"**. Ahí siempre habrá alguien a 39 $. Véndete como la plataforma que cobra el dinero del club todo el año y responde por la documentación de los menores. Ahí CopaFacil no compite, y Torneo by Sofascore tampoco.

**Y para USA la lectura se invierte**: 200 $/año es barato. GotSport cobra 3-5 $ por jugador y año, repercutido al padre, y todos los incumbentes viven del 2,9-3,25% por transacción, no de la licencia. Estás caro para Brasil y regalado para Florida. Eso pide dos precios, no uno.

### Funciones que SÍ tiene (lista completa y verificada)

Generador automático de partidos. Formatos de liga, eliminatoria, grupos y mixto. Clasificaciones, goleadores y rankings calculados automáticamente. Ranking de jugadores personalizable. Fotos, vídeos y noticias. Impresión de acta (súmula) para fútbol, futsal, baloncesto, balonmano y voleibol. Estadísticas de partido. Formulario de inscripción de equipos. Múltiples categorías por edad y sexo, fases y rondas. Moderadores. Banners de patrocinadores. Encuestas y votaciones. Adjuntar documentos. Mensajes a los equipos. Registro de castigos y suspensiones. URL personalizada. Incrustación HTML y API JSON, solo en el plan Profesional.

Deportes: fútbol, futsal, balonmano, baloncesto, voleibol, tenis, tenis de mesa y **eSports** (MOBA y battle royale). [VERIFICADO: copafacil.com, /funcionalidades y ficha de Google Play]

> ## ⛔ CORRECCIÓN IMPORTANTE (28-jul-2026) — esta sección estaba equivocada
>
> La versión original decía: *"en brackets, tabla y resultados, CopaFacil está a la par o por delante de Widdo"* y *"si Widdo no tiene módulo de patrocinadores, está perdiendo una palanca"*. **Miguel lo desafió y tenía razón en los dos puntos.** Se auditó el código real de Widdo (Laravel + React) y se contrastó con las fuentes oficiales de CopaFacil. Resultado:
>
> **BRACKETS → REFUTADO, y no es de cerca.** Widdo tiene **6 formatos implementados de verdad** (no solo declarados): eliminación simple, **doble eliminación**, fase de grupos, todos contra todos, **sistema suizo** y grupos+eliminación. Evidencia: `BracketGeneratorService.php` con `generateSingleElimination:99`, `generateDoubleElimination:220`, `generateGroupStage:423`, `generateRoundRobin:479`, `generateSwiss:542`, `generateGroupsThenElimination:709`. Más cuadro de perdedores (`loser_next_match_id`), consolación, tercer puesto y seeding configurable. **CopaFacil tiene 4 formatos y le faltan justo los dos más difíciles de construir: doble eliminación y suizo.** Un organizador de béisbol o softball en USA, o de e-sports, necesita doble eliminación y **no puede usar CopaFacil**.
>
> **RESULTADOS EN VIVO → REFUTADO.** CopaFacil publica resultados **a mano** y no tiene app de mesa ni de árbitro (su desarrollador solo publica 3 apps, ninguna de arbitraje). Widdo tiene `LiveScoringController` con eventos de partido, deshacer la última acción, marcador por periodos y sets, penaltis, **sincronización sin conexión** para canchas sin cobertura, y difusión por WebSocket a espectadores sin login. ⚠️ **Caveat que hay que resolver:** en el `.env` local `VITE_REVERB_ENABLED=false`, así que cae a consulta por intervalos. Hay que confirmar cómo está en producción — si está apagado, Widdo tiene tiempo real en el código pero no en la calle.
>
> **TABLA DE CLASIFICACIÓN → confirmado, es empate.** Los dos calculan clasificación y goleadores solos. Aquí sí era correcta la afirmación. Widdo tiene un hueco pequeño y barato de tapar: el desempate es solo Puntos → Diferencia de goles → Goles a favor, **sin enfrentamiento directo**, y la columna `tiebreaker_data` está creada sin usar.
>
> **PATROCINADORES → el informe se equivocó. Widdo SÍ lo tiene, y completo.** Niveles title/gold/silver/bronze/supporter, logo, banner, web, orden configurable, API y pantalla de gestión (`create_pla_tournament_sponsors_table.php`, `TournamentSponsorController`, `SponsorsPage.jsx`). Detalle a favor: **CopaFacil raciona los patrocinadores por plan (3/6/12); Widdo no pone cupo.** Eso es argumento de venta, no empate.
>
> **IA → Widdo sí, CopaFacil no, y no es un chatbot de adorno.** Widdo tiene proveedores LLM intercambiables (`AnthropicProvider.php`, `OpenAIProvider.php`) y una capa de herramientas donde **la IA opera el torneo**: `generateBracket`, `generateSchedule`, `recordMatchResult`, `getStandings`, `advanceGroupWinners`, `notifyScheduleToTeams`. Hay un test de ciclo completo (`test_full_tournament_lifecycle_driven_by_assistant_tools`) que va de crear el torneo a coronar campeón por lenguaje natural. **CopaFacil no menciona IA en ninguna parte: ni en su web, ni en funcionalidades, ni en las fichas de tienda.** Es la ventaja más difícil de copiar y la más fácil de enseñar en una demo.
>
> **Donde el informe SÍ acertaba, y hay que aceptarlo:** CopaFacil gana en kilómetros recorridos. 5 millones de instalaciones y 4,9 estrellas frente a un motor de torneos de mayo de 2026 sin ningún evento grande ejecutado. Y tus propios documentos registran que `generateSchedule` tarda **7,5 minutos con 496 fixtures** y que la optimización quedó **incompleta**. Widdo gana en el papel; CopaFacil gana en carretera. El error del informe fue afirmar paridad **funcional**, que es medible y es falsa.
>
> **Los tres huecos reales de Widdo frente a CopaFacil** (los tres baratos de tapar, semanas no meses): **(1) no hay URL personalizada por torneo** — Widdo usa `/t/:idNumérico` y el slug del directorio es un `LIKE %nombre%` que puede colisionar, mientras CopaFacil da URL propia en todos sus planes de pago y el organizador la imprime en camisetas y carteles; **(2) no hay incrustación HTML** — las ligas que ya tienen web quieren meter la tabla en su página y hoy no pueden; **(3) el rendimiento del generador de calendario** a escala.

Lista original de funciones de CopaFacil, que sigue siendo correcta como inventario de lo que ELLOS tienen. Léela como "lo que hay que igualar", no como "lo que nos gana".

### Funciones que NO tiene, una por una

1. **Cobro de inscripciones o cualquier flujo de dinero de terceros.**
2. **Mensualidades o cuotas de club.** El producto no tiene concepto de club con socios que pagan cada mes. Su unidad es el torneo.
3. **Validación de documentación de jugadores.** Tiene "anexar documentos", que es subir un PDF. No hay estado, ni aprobación, ni rechazo, ni auditoría.
4. **Carnets o credenciales digitales.**
5. **Convocatorias.**
6. **Transmisión o streaming.**
7. **App dedicada al jugador.** Hay una sola app; el jugador entra en modo seguidor.
8. **Resultados en vivo automáticos.** La publicación de resultados es manual, la hace el organizador o un moderador.

Prueba especialmente fuerte del punto 3: la página copafacil.com/registro-de-atleta-aje sirve a una organización que necesita registrar atletas, y su botón "Registre-se como Atleta em nossa Plataforma!" **enlaza hacia fuera**, a organizacaoaje.com.br. Es decir, un cliente real de CopaFacil tuvo que montarse un sistema externo para registrar y documentar atletas. [VERIFICADO]

### Un fallo que te conviene entender bien

**El checkout de CopaFacil está roto y no acepta Pix. En Brasil.** Reseña textual en Google Play de Kim Ramone, 1 estrella:

> "Devem consertar com urgência a forma de pagamento, tanto no cartão de crédito ou débito só dá erro. Adicionem a opção pagar com Pix. Vai facilitar demais ou então dêem um jeito nesses erros."

Esto no es una anécdota, es estratégico. Si CopaFacil no consigue cobrarse **a sí mismo** de forma fiable, ni integrar el medio de pago dominante de su propio país, la probabilidad de que construya cobro de inscripciones con reparto de fondos a corto plazo es baja. Tu foso por el lado del dinero es más profundo de lo que parece.

**Salvedad honesta:** esto es una lectura razonada, no un hecho declarado por la empresa. Podrían integrar un proveedor de pagos brasileño y cerrar la brecha en un trimestre si decidieran hacerlo.

---

## 3. CopaFacil vs Sofascore/Torneo vs Widdo

### La tabla en tres ejes

| | CopaFacil | Torneo by Sofascore | Widdo |
|---|---|---|---|
| **Eje 1 — Audiencia pública y resultados en vivo** | A medias. Páginas públicas de torneo, marcador para pantalla, incrustación HTML y API JSON solo en plan alto. Audiencia limitada a quien tiene el enlace, sin red de descubrimiento. | **Dominante.** Publicación automática en la app de Sofascore (unos 40 millones de usuarios al mes), widgets web en vivo. | A medias. Resultados en vivo sí, audiencia externa no. |
| **Eje 2 — Gestión operativa (inscripción, brackets, calendario)** | **Muy completo.** Ocho deportes más eSports, todos los formatos, multi-categoría, moderadores, actas, estadísticas. | **Completo y gratis.** Fixtures, brackets con doble eliminación y round-robin, alineaciones, seis niveles de permisos, informes PDF, gestión de sanciones. | Completo. Inscripciones, brackets, calendario, convocatorias. |
| **Eje 3 — Dinero y cumplimiento** | **NO.** Ni cobros, ni cuotas, ni validación documental. | **NO.** Su única "verificación" es probar que la competición existe, para publicarla. Es control editorial, no elegibilidad de jugador. | **SÍ.** Cobro de inscripciones, mensualidades recurrentes, validación documental. |
| **Precio** | 39 a 86,50 dólares al año | Gratis | Unos 200 dólares al año |
| **Idiomas** | 5 (pt, es, en, fr, it) | 7 en Torneo; 40 en la app de Sofascore | 2 (es, en) |

Las celdas de CopaFacil y Torneo son [VERIFICADO] contra fuentes primarias. **Las celdas de Widdo son [SIN CONFIRMAR por fuente externa]**: vienen de tu descripción, no se pudieron auditar porque Widdo prácticamente no tiene huella pública indexada.

### La conclusión: cuál es competencia real y cuál no

**Torneo by Sofascore es el peligro estructural, no CopaFacil.**

Torneo es completamente gratis, sin planes ni monetización declarada. Cita textual de su FAQ oficial: "Torneo by Sofascore is a completely free tournament management tool anyone can use to create and manage competitions". No existe página de precios. Y han movido el producto a dominio propio (torneo.sofascore.com redirige a torneo.com), señal de que lo tratan como producto, no como microsite. [VERIFICADO]

Un competidor gratis, respaldado por un negocio adyacente rentable, que además te regala audiencia, es el peor tipo de competidor en los ejes 1 y 2. **Widdo no puede vender "brackets y resultados en vivo" como valor principal.** Sofascore lo regala.

**CopaFacil es competidor parcial y asimétrico.** Compite de frente en el eje 2, donde es mejor que Widdo en profundidad de formatos y muy superior en distribución. Compite en el eje 1 a nivel parecido. **No compite en el eje 3.**

En sustitución real: un organizador que solo quiere tabla y resultados elige CopaFacil o Torneo, y Widdo ni entra en la conversación. Un club que necesita cobrar cuotas todos los meses no lo resuelve con ninguno de los dos.

> **Nota (28-jul-2026):** el veredicto de abajo se escribió ANTES de auditar el código de Widdo. Sigue siendo válido en lo de "bilingüe ya no diferencia", pero **queda desfasado en lo demás**: la auditoría confirmó que Widdo también gana en doble eliminación, sistema suizo, resultados en vivo con sincronización sin conexión, y **IA que ejecuta el torneo** (CopaFacil tiene cero IA). Los diferenciadores de Widdo no son uno, son cuatro. Ver la corrección de la sección 2.

### El veredicto sobre tus tres diferenciadores

**1. Mensualidades recurrentes de club.** CONFIRMADO frente a CopaFacil y Torneo: ninguno lo hace, ni parcialmente. DESMENTIDO como diferenciador frente al mercado de Estados Unidos, donde SportsEngine, LeagueApps, TeamSnap y Centro sí lo hacen.

**2. Validación documental.** CONFIRMADO frente a CopaFacil (solo adjunta), CONFIRMADO frente a Torneo (verifica la competición, no al jugador), y [PROBABLE] confirmado frente a Centro, que habla de "document management", que es gestión y no verificación. **Es tu diferenciador más limpio de los tres, y el peor comunicado.**

**3. Bilingüe ES/EN.** DESMENTIDO como diferenciador. CopaFacil tiene cinco idiomas. Torneo tiene siete. Centro nació nativamente bilingüe en Miami. **El español es requisito de entrada, no ventaja.** Sácalo del pitch de diferenciación y déjalo en el de accesibilidad.

### La alerta que no pediste: Centro

El hueco frente a CopaFacil y Sofascore es real y ancho. **El hueco frente al mercado que dices atacar lo está cerrando otro ahora mismo.**

Centro (withcentro.com), fundado por Oscar Castellanos, Homestead/Miami, Florida. **Lanzado el 31 de marzo de 2026.** 25 dólares al mes, plano, sin tarifa por jugador, sin contrato, 14 días de prueba. Hace registro, facturación y pagos con Stripe (2% de plataforma más el 2,9% + 0,30 de Stripe; efectivo, Zelle y cheque gratis), gestión de equipos, calendario, comunicación, informes financieros, gestión documental, constructor de web bilingüe y tienda. Se posiciona literalmente como "la primera plataforma de fútbol juvenil diseñada nativamente en inglés y español", "Native English & Spanish, not just translated". [VERIFICADO: withcentro.com/pricing, withcentro.com, pr.com/press-release/964484]

Lo que Centro **no** hace, según sus propias fuentes: torneos, brackets, resultados en vivo, validación de elegibilidad. Y está anclado en **fútbol juvenil**. [VERIFICADO por ausencia]

Además ya rankea con SEO local: páginas por ciudad tipo /clubs/florida/tampa y guías estacionales de inscripción para el sur de Florida. **Widdo no aparece en ninguna búsqueda.** Dos búsquedas independientes en español sobre gestión deportiva de clubes devolvieron Competize, Playoff, Clubsportmanager, Clupik y SportEasy. Ningún resultado de Widdo. [VERIFICADO por ausencia]

[SIN CONFIRMAR] si Centro tiene tracción real o es solo lanzamiento con buen SEO. Cuatro meses de vida, notas de prensa en cables de pago, sin información de financiación. Merece su propia investigación antes de decidir el posicionamiento en Florida.

### El hueco defendible de Widdo, sin adornos

No existe hueco defendible por función aislada. Cada capacidad de Widdo la tiene alguien mejor, más grande o más barato.

El único hueco real es de **combinación y de segmento**: torneo competitivo de verdad (brackets, resultados en vivo, convocatorias, validación documental de elegibilidad) **junto con** dinero recurrente y por inscripción, en español nativo, a precio latinoamericano, para **ligas y torneos hispanos adultos y amateur de cualquier deporte**.

CopaFacil y Torneo cubren la mitad de competición y cero de dinero. Centro cubre la mitad de dinero y cero de competición, y además está en juvenil. SportsEngine y LeagueApps cubren dinero pero son caros (de 69 a 400 dólares al mes) y no documentan soporte en español. [PROBABLE — los precios de los incumbentes vienen de comparadores terceros, no de sus páginas oficiales; verifícalos antes de usarlos en material de venta]

Ese cuadrante existe. Es estrecho. **Y no tiene foso tecnológico**: cualquiera de los cuatro puede construir lo que le falta en seis o doce meses. El único foso posible es distribución (estar dentro de las ligas hispanas antes que ellos) y estructura de costes.

---

## 4. Cómo encontrar a los organizadores que ya la usan

Ordenados por relación esfuerzo-resultado. El método 1 es la mina; el 5 es casi inútil para leads.

### Método 1 — El directorio público paginado (LA MINA) [VERIFICADO]

CopaFacil tiene un índice público renderizado en servidor, en HTML plano, pensado para que Google lo indexe.

URL exacta: `https://copafacil.com.br/list/N`, con N de 0 a 169.

Comprobado: /list/1 devuelve 30 torneos con enlaces "Previous" y "Next". Barrido binario: /list/160 devuelve 30, /list/169 devuelve 8, /list/170 y superiores devuelven 0. **La última página es la 169.** Total: unos 5.078 torneos públicos.

Cada fila es `<a href="https://copafacil.com/{slug}/info">NOMBRE DEL TORNEO</a>`.

Comando para volcarlo entero:

```bash
for p in $(seq 0 169); do curl -s "https://copafacil.com.br/list/$p"; done > all.html
grep -oE '<a href="(https://copafacil.com/[^"]+)/info"[^>]*>([^<]*)' all.html
```

No hay buscador ni filtro por ciudad, deporte o país. Hay que traerlo todo y filtrar en local: por "2025"/"2026" en el nombre para quedarte con los activos, y por "LIGA"/"TORNEO" frente a "COPA"/"CAMPEONATO" para separar hispanohablante de Brasil.

**Ojo, el orden no es cronológico.** /list/1 tiene torneos de 2019 a 2022, /list/100 tiene de 2026, y /list/165 a 169 es basura de prueba ("z142", "VPN", "PRUEBA").

Rendimiento medido, no estimado: en una muestra de 8 páginas (270 torneos), 93 llevaban 2025 o 2026 en el nombre. Eso es un 34%. Extrapolado: **unos 1.700 torneos recientes**. Muchos organizadores repiten torneo con slugs distintos, así que tras deduplicar quedan **entre 800 y 1.200 organizadores activos únicos**. Dos o tres horas de trabajo para tener el CSV completo.

**Legalidad — riesgo bajo.** Comprobado: robots.txt de ambos dominios contiene solo "User-agent: Google-adstxt / Disallow:". No bloquea a ningún otro rastreador ni ninguna ruta. El /list/ existe precisamente para ser indexado. Los nombres de torneos y equipos no son datos personales bajo la LGPD brasileña ni el GDPR. [SIN CONFIRMAR] si los Términos de Uso prohíben acceso automatizado; la política de privacidad está alojada en iubenda y no se pudo extraer. Recomendación: limita a 2-4 peticiones por segundo y usa un User-Agent identificable.

### Método 2 — Scrapear la ficha de cada torneo en el espejo .com.br [VERIFICADO]

Hallazgo clave: **copafacil.com es una app Flutter Web** (bundle main.dart.js), así que el HTML crudo viene vacío. **Pero el dominio espejo copafacil.com.br sí devuelve la ficha renderizada en servidor** para la ruta /info.

URL exacta: `https://copafacil.com.br/{slug}/info`

Lo que devuelve (comprobado en unas 215 fichas descargadas):

- Nombre del torneo y subtítulo, que a menudo lleva **ciudad y deporte** (ejemplo: slug "-jnkys" → "COPA AGUASCALIENTES ESTATAL 2026 / FUTBOL 7 / RINCON DE ROMOS")
- Bloque "About" con la descripción del organizador
- **"Tournament Rules" — aquí está el oro.** Reglamentos completos que suelen nombrar responsables, cuotas de inscripción y cómo se paga
- "Awards", premios en metálico (ejemplo, Lima: 3000 / 1500 / 1000)
- **Lista completa de equipos participantes**
- Galería y noticias, con enlaces salientes a Instagram y YouTube del organizador

Regex útiles sobre el HTML descargado:

```
href="(https?://[^"]*(instagram|facebook|youtube|youtu\.be|wa\.me|whatsapp|t\.me|tiktok)[^"]*)"
[\w\.\-]+@[\w\.\-]+\.\w{2,}
\b(?:\+?\d{2,3}[\s\-]?)?\(?\d{2,3}\)?[\s\-]?\d{4,5}[\s\-]?\d{4}\b
```

**Tasa de acierto medida:** en 120 slugs autogenerados (tipo "-mnbaffcdpg12lbg0_df"), 2 de 120 dan contacto directo (2%). En 90 slugs personalizados (tipo "copaplmegared2026"), 4 de 90 (4%). **Los slugs con nombre propio indican organizador más invertido. Prioriza esos.**

El truco: aunque solo el 4% da contacto directo, **el 100% te da nombre del torneo, ciudad y lista de equipos**. Con eso buscas al organizador en Google o Instagram. El enriquecimiento manual es donde está el volumen real.

**Legalidad — riesgo medio.** Descargar las fichas es tan defendible como el método 1. El riesgo sube al extraer datos personales: emails y teléfonos de personas físicas **sí** son datos personales bajo la LGPD brasileña y el GDPR (hay torneos en España e Italia). Base legal posible: interés legítimo para prospección entre empresas (LGPD art. 7 IX), pero obliga a identificarte, decir de dónde sacaste el dato y honrar la baja inmediatamente. **Los nombres de árbitros y tesoreros que aparecen en los reglamentos: no los metas en un CRM.** Úsalos solo para saber a quién preguntar. Nada de correo masivo automatizado a esas direcciones.

### Método 3 — Buscadores, con consultas exactas probadas [VERIFICADO]

Clave: **Google sí renderiza la app Flutter**, así que indexa contenido que tu scraper no ve. Ejemplo comprobado: copafacil.com/k0fr devuelve HTML vacío por curl, pero Google lo indexa como "Torneo Regional de Fútbol 2026, Santa María, Córdoba, Argentina". Google ve más que tú.

Consultas que funcionaron:

```
site:copafacil.com liga
site:copafacil.com liga Texas Florida Miami Houston soccer league
"copafacil.com" torneo inscripciones 2026 liga futbol
"copafacil.com" instagram torneo inscripciones liga
copafacil.com torneio inscricoes campeonato
```

Para segmentar:

```
site:copafacil.com "liga" "2026"
site:copafacil.com "torneo" colombia
site:copafacil.com "futbol rapido"          (el formato mexicano)
site:copafacil.com "inscripcion" "cuota"    (organizadores QUE YA COBRAN)
site:copafacil.com "categoria" "sub"        (torneos formativos)
site:copafacil.com.br "info" "liga"
"Easy Tournament" liga torneo inscripciones (el nombre en inglés)
```

**No pierdas tiempo con "powered by copafacil" ni buscando subdominios.** Comprobado: no existe huella de marca blanca en la web y toda la arquitectura es copafacil.com/{slug}, un solo dominio.

El valor de este método no es volumen (3 a 8 organizadores por consulta, muy solapado con el método 1). **El valor es cualificación**: la consulta con "inscripcion" y "cuota" te aísla a los que **ya cobran dinero**, que son los únicos que te van a pagar 200 dólares al año.

**Legalidad — riesgo nulo a mano.** Si automatizas consultas a Google, eso viola los términos de Google (no los de CopaFacil). Para volumen, usa una API legítima como SerpAPI o Bing Web Search.

### Método 4 — Instagram y Facebook [PARCIALMENTE VERIFICADO]

Dos direcciones. La segunda es mejor.

**A) De CopaFacil hacia la red** (verificado): las fichas /info incluyen enlaces salientes al Instagram y YouTube del organizador. Ejemplo real extraído de copafacil.com.br/copaplmegared2026/info: `instagram.com/zarumatv_` y `youtube.com/@zarumatv26`. Regex sobre las 5.000 fichas del método 2.

**B) De la red hacia CopaFacil** (la mejor lista que existe): **los seguidores de las cuentas oficiales de una herramienta de nicho son sus usuarios.** Cuentas confirmadas: @copafacil (español) y @copafacil_pt (portugués, unos 1.000 seguidores). Revisa quién las sigue y quién comenta.

Búsquedas de apoyo: `site:instagram.com "copafacil"` y `instagram "copafacil" tabla clasificacion torneo link bio`. En Facebook, grupos de organizadores: busca "liga futbol aficionado" más tu ciudad objetivo.

[SIN CONFIRMAR] No existe un hashtag oficial consolidado con volumen real. No inviertas ahí.

**Legalidad — riesgo medio-alto si automatizas.** Instagram y Facebook prohíben explícitamente el scraping automatizado y Meta ha demandado por ello. Ver la lista de seguidores a mano en la app: permitido. Scrapearla con bot: violación de términos y riesgo de bloqueo de cuenta. Los mensajes directos masivos automatizados son bloqueo casi seguro. **Hazlo manualmente**, que además encaja con tu regla dura de IG y WhatsApp manual.

### Método 5 — YouTube de retransmisión [VERIFICADO]

Los torneos amateur de Latinoamérica retransmiten en YouTube y Facebook Live, y esos canales son del organizador o de su socio de medios. Rastros comprobados: `copafacil.com.br/tacaacoriana2026/info` enlaza a `youtube.com/@conexaomostardas`; `copafacil.com.br/copaplmegared2026/info` enlaza a `youtube.com/@zarumatv26`.

En la descripción de esos vídeos suele estar el enlace de CopaFacil **y el WhatsApp del organizador** — el contacto que la ficha no da.

Volumen realista: 50 a 100 canales. Pocos, pero **los mejor cualificados**: quien paga una retransmisión tiene presupuesto y ya monetiza.

**Legalidad — riesgo bajo.** Usa la YouTube Data API oficial, que es gratis con cuota, en vez de scrapear.

### Método 6 — Reseñas de las tiendas de apps [VERIFICADO, pero flojo para leads]

Filtra Google Play por "Más recientes" y por idioma (es-MX, es-AR, es-CO, pt-BR) y busca reseñas donde el usuario se autoidentifica ("organizo la liga X", "mi torneo").

**Rendimiento real: de cada 100 reseñas, quizá 2 a 5 identifican una organización.** Es el método más flojo para prospectar.

**Su valor real es inteligencia competitiva**, no leads. Las reseñas de una y dos estrellas te dan el guion de venta gratis (ver sección 6).

Endpoint reutilizable que quedó de esta investigación: el RPC público de Google Play (`batchexecute` con `rpcids=UsvDTd`) sirve para sacar reseñas de **cualquier** competidor. Es el activo técnico más aprovechable del trabajo.

**Legalidad — riesgo bajo leyendo a mano.** Apple y Google prohíben el scraping automatizado de sus tiendas. Los nombres de los reseñadores son datos personales: úsalos para investigar, no para un CRM. Los datos de la empresa (razón social, dirección, CNPJ) son públicos por obligación legal, riesgo cero.

### Vías cerradas — no pierdas tiempo

- **Firebase**: probado `https://copafacil-web.firebaseio.com/.json?shallow=true` → HTTP 401, "Permission denied". **Está bien cerrado. No hay volcado de base de datos posible.** Y **no insistas**: sondear más allá de esta comprobación podría constituir acceso no autorizado (delito informático en Brasil por la Ley 12.737, y CFAA si hubiera nodo en Estados Unidos). La comprobación ya está hecha, ahí se acaba.
- **Endpoints /api/ y /rest/**: devuelven el HTML de la SPA. No hay API pública documentada.
- **Fuerza bruta de slugs**: los antiguos son push IDs de Firebase, no enumerables de forma útil. Usa el directorio.
- **Sitemap.xml**: devuelve el HTML de la SPA. No sirve.
- **Reddit**: cero discusión sustantiva sobre CopaFacil. Cero. [VERIFICADO por ausencia]

---

## 5. Organizadores concretos ya identificados

Todos con URL comprobable. Los que no se pudieron verificar por lectura directa están marcados.

**Con contacto público directo:**

| Organizador | Deporte | País / ciudad | URL | Contacto |
|---|---|---|---|---|
| Copa Zaruma 2026 / Zaruma TV | Fútbol | Ecuador, Zaruma (El Oro) | copafacil.com.br/copaplmegared2026/info | instagram.com/zarumatv_ y youtube.com/@zarumatv26, enlazados desde la propia ficha |
| Taça Açoriana 2026 / Conexão Mostardas | Fútbol | Brasil, Mostardas (RS) | copafacil.com.br/tacaacoriana2026/info | youtube.com/@conexaomostardas |
| Copa de Futsal Brasil Futuro | Futsal | Brasil | copafacil.com.br/-lkhmcdineyxbr_ts_zi/info | gustavocp.12@hotmail.com (publicado por el propio organizador). Es un email personal: dato bajo LGPD, identifícate y da opción de baja |
| Campeonato da Raia e Copa Charuto | Fútbol | Brasil, [SIN CONFIRMAR] DDD 22 = Norte Fluminense, RJ | copafacil.com.br/-5mlkb/info | (22) 99766-4455, publicado en la ficha. Mismas cautelas |

**Sin contacto directo, pero identificados y cualificables:**

| Organizador | Deporte | País / ciudad | URL | Por qué interesa |
|---|---|---|---|---|
| Liga Inter Champions Tulum | Fútbol rápido | México, Tulum (Q. Roo) | copafacil.com.br/-m-ykxkauazgre9ksrho/info | Liga nocturna de trabajadores, L-S 22:30. **Cobra inscripciones en junta previa** |
| Copa Aguascalientes Estatal 2026 | Fútbol 7 | México, Rincón de Romos | copafacil.com.br/-jnkys/info (y -uenhi, -c2bqf, -wgwa0, -5fry0, -qzlp4) | Aparece con 5+ slugs distintos: operador con varias categorías o sedes. Señal de organizador serio |
| Campeonato C.U.P.Q Sede Lima 2026 | Fútbol | Perú, Lima | copafacil.com.br/-tc3hs/info | **Premios en metálico 3000/1500/1000. Ya mueve dinero** |
| Liga Deportiva Del Sur 2026 (Apertura) | Fútbol | Argentina, sur de Santa Fe | copafacil.com.br/ligadelsur2026apertura/info | 18 clubes listados. Slug personalizado |
| Liga Héroes de Paquisha 2026 | Fútbol | Ecuador, Paquisha (Zamora Chinchipe) | copafacil.com.br/-mwlvn/info | Liga fundada en 1996. 30 años de historia, institución consolidada |
| BTSPORTS — Liga Belém / Copa Integração | Fútbol | Brasil, Belém (Pará) | copafacil.com.br/-llbfyjwi4l21wupysw8/info | Operador multi-competición, "A Liga nº 1 do Pará" |
| Torneo de Fútbol Rápido El Tintal 2026 | Fútbol rápido | [SIN CONFIRMAR] probablemente Bogotá, Colombia (también existe El Tintal en México) | copafacil.com.br/-rtx0v/info | 4ª edición. Torneo recurrente. **El más cercano a tu mercado** |
| Torneo Auquimarca 2026 | Fútbol | Perú, Valle del Mantaro (Junín) | copafacil.com.br/-nou2l/info | Categoría libre, con escuela de fútbol entre los equipos |
| Liga Industrial | Fútbol | Argentina, Burzaco (Buenos Aires) | copafacil.com.br/-lbqtkfmdvsed_afnlzz/info | Torneo de equipos de empresas. Presupuesto corporativo |
| Liga Infantil AFUSA Puerto Santa Cruz 2026 | Fútbol infantil | Argentina, Puerto Santa Cruz | copafacil.com.br/-nd5rn6/info | **Formativo: necesita documentación de menores** |
| Copa Cidade de Buri 2026 Futsal Feminino | Futsal femenino | Brasil, Buri (SP) | copafacil.com.br/copacidadefeminino/info | Slug personalizado |
| Campeonato Regional Metropolitano de Gendarmería | Fútbol | Chile, Región Metropolitana | copafacil.com/-ir7a2/info | Torneo institucional de un cuerpo estatal |
| TORNEOS DIRECABAS | eSports / FIFA | Chile | copafacil.com.br/-lbbsex3q99dzrri7zgi/info | El reglamento nombra a sus tres administradores y la cuota en pesos chilenos. Omito los nombres personales aquí |
| Liga Dominical | Fútbol rápido | México, [SIN CONFIRMAR] probablemente Tulum | copafacil.com.br/-mf5ns7ktqcudpqpjwbm/info | Mismo reglamento que Liga Inter Champions Tulum: probable mismo operador |
| Torneo Bilbao 2026 | Fútbol | España, Bilbao | copafacil.com.br/-ripad/info | 9 equipos listados |
| Copa del Mundo Olesa de Montserrat 2026 | Fútbol base | España, Olesa (Barcelona) | copafacil.com/-1z23u/info y /-xvbw5/info | Categorías Promeses y Alevín. Formativo |
| PBSL | Beach soccer | Sudáfrica, Durban | copafacil.com.br/pbsl/info | 25+ clubes, con divisiones femeninas. Único caso no hispano/luso relevante |

**Identificados en Instagram pero sin ficha verificada** [SIN CONFIRMAR el enlace directo a CopaFacil]: Torneo Tifoncito San Carlos Sud (Argentina, @tifoncitoscs), Liga Marplatense de Fútbol (Mar del Plata, publicación instagram.com/p/C7y5bbbxlS9/), Torneo Regional de Fútbol 2026 (Santa María, Córdoba, copafacil.com/k0fr, dato de ubicación tomado del índice de Google porque el HTML crudo viene vacío).

**Lo que no hay:** ni un solo organizador verificado de CopaFacil en Florida o Texas. La búsqueda dirigida no devolvió nada. Y solo un candidato colombiano, y sin confirmar (El Tintal). **Si quieres organizadores de CopaFacil en Colombia, hay que barrer el directorio completo del método 1 — esta muestra de 215 fichas no basta.**

---

## 6. El mensaje: cómo se le habla a alguien que YA tiene herramienta

### Las quejas reales, citadas

Metodología: RSS público de reseñas de App Store Brasil (77 reseñas), RPC público de Google Play (150 en portugués, 100 en español), y Reclame Aqui vía resultados de búsqueda porque bloquea el acceso directo.

**Aviso de rigor:** hay ruido en las calificaciones bajas. Aparecen reseñas de 1 estrella con texto positivo ("o copa fácil é muito bom obrigado por esse aplicativo"). Esas no cuentan. Solo se citan las coherentes.

**Queja A — Actualizaciones forzadas que rompen el flujo de trabajo. Es la número uno y la más explotable.**

> "parabéns aos responsáveis por essa nova edição de resultados, **não entro mais no app desde que foi mudado o formato** e só vou voltar a usar quando voltar ao modelo antigo" — Google Play, 1★, 24/06/2026

> "Tudo era perfeito, mas depois dessa atualização de animação de processamento, tudo ficou lento. Erros constantes quando você encerra o jogo mostra a mensagem 'algo deu errado' mas não mostra o erro" — Google Play, 1★, 15/03/2026

> "O app tava bom demais. Atualizaram e agora não aparece o resumo da partida, as escalações, os gols, substituições" — App Store

> "O APLICATIVO NÃO ABRE MAIS DEPOIS DESSA ATUALIZAÇÃO E EU PRECISO ORGANIZAR UM CAMPEONATO" — App Store, 2★

Y el caso estrella, en Reclame Aqui: un cliente antiguo iba a demostrar CopaFacil en una reunión con un cliente para una competición internacional. El sistema había cambiado sin aviso y los datos que antes se veían ya no estaban. Pidió volver al modelo anterior. **Respuesta de la empresa: "Não será possível retornar ao sistema anterior."** [VERIFICADO vía extractos indexados; la página devolvió 403 en acceso directo]

Esa frase es oro. Es un incumbente diciéndole a un cliente que su flujo de trabajo no importa.

**Queja B — Publicidad de casas de apuestas delante de menores.** La más cargada moralmente y la más fácil de convertir en conversación.

> "Depois da atualização do app onde incluíram anúncios, o app ficou muito ruim, inclusive com **propagandas de casas de apostas e joguinhos, impróprio para meus filhos verem**, já que eles acompanhavam seus próprios desempenhos pelo app" — App Store, 2★

> "essa atualização que colocou anúncios de 'joguinhos' dentro do aplicativo são um absurdo! **A cada 2 cliques aparece um anúncio de 20 segundos**… até desanima" — App Store, 3★

Esto es letal en fútbol base. Un organizador de categorías infantiles cuyos padres ven anuncios de apuestas en la app del torneo tiene un problema con los padres, no con el software.

**Queja C — Pagos que fallan.**

> "realizei o pagamento de 24,99 via pix, e **até o momento nao liberou a assinatura** do plano contratado, alguem pode me responder?" — Google Play, 2★, 03/06/2026

> "Devem consertar com urgência a forma de pagamento, tanto no cartão de crédito ou débito **só dá erro**. Adicionem a opção pagar com Pix" — Google Play, 1★, 16/03/2026

**Queja D — Pérdida de datos, justo al pagar.**

> "Testei por vários dias e hoje, quando resolvi assinar o pacote mensal completo, o app simplesmente usou o email que cadastrei, **excluiu tudo que fiz e criou uma conta nova** com esse mesmo email. Fora que foi um parto pra conseguir cancelar a assinatura. Acabei perdendo o valor e as coisas que estava fazendo." — Google Play, 2★, Roniel Hoffmann dos Santos

> "Trava o gerenciamento de campeonatos, e **perdi um campeonato** por causa disso" — Google Play, 1★, 04/07/2026

**El momento de máxima fricción de CopaFacil es el momento de conversión a pago.** Ahí es donde tienes que interceptar al organizador.

**Queja E — Errores de lógica deportiva.**

> "tem problemas na hora de criar chaves eliminatorias, realizamos um torneio e **os cabeças de chaves jogaram nas quartas de final e não na semi final**, pra quem é do esporte isso é um erro absurdo" — App Store, 1★

> "Na competição, o goleiro menos vazado é aquele que toma menos gols. No app, parece ser o contrário! **quem tomou mais gols fica em primeiro**" — App Store, 2★

**Queja F — Notificaciones push que no llevan a ningún sitio.** Fallo crónico, lo reportan hasta suscriptores antiguos.

> "recebo as notificações de um jogo que sigo e quando clico simplesmente **ele não leva a lugar algum**! Arrumem isso, ou tira logo de vez." — Paul Gil, 5★, suscriptor desde que la app tenía 1.000 descargas

**Queja G — Usuarios en español desatendidos. Este es tu mercado.**

> "es increíble lo mal hecha que está esta app, promete demasiado y podría ser realmente buena, pero **falla en tantas cosas que da hasta vergüenza**" — Google Play es-419, 1★, 08/07/2026

> "Funcionaba perfecto, hasta que hace unos días al volver a entrar… **no me deja entrar en ninguno** [torneo], al clickear en cada uno no se produce ni una reacción, ya tenía varios torneos" — Google Play es-419, 1★, 12/05/2026

> "sin registro no deja crear, así que desinstalando, no sé por qué se complican tanto" — Google Play es-419, 1★, 18/06/2026

**Soporte:** Reclame Aqui declara tiempo medio de respuesta de 5 días y 21 horas, empresa no verificada, sin sello de confianza. [PROBABLE, vía extractos indexados]

**Contrapeso obligatorio, y es importante:** con más de 5 millones de descargas, CopaFacil tiene **menos de 10 reclamaciones formales evaluadas** en Reclame Aqui, tan pocas que ni le calculan índice de reputación. Y tiene 4,9 estrellas con 158.000 votos. **CopaFacil no es un producto odiado. Es un producto querido con fallos concretos.** No construyas la estrategia sobre "CopaFacil es malo". Es falso y se nota. Constrúyela sobre "CopaFacil no hace lo que a ti te duele: el dinero".

### El momento del año correcto

El fútbol amateur brasileño y latinoamericano no tiene temporada nacional única; cada municipio arma su calendario. [VERIFICADO: varias fuentes municipales 2026 — Jaraguá do Sul arranca 21/03 con inscripciones hasta 03/03; Castilho arranca 29/05 con formularios hasta 22/05; Divinópolis arranca 15/08; Lucas do Rio Verde arranca 29/08 con inscripciones hasta 24/08; Belo Horizonte abre preinscripciones en enero]

Hay **dos oleadas**: arranques de marzo a mayo, y arranques de agosto a septiembre.

**Ventana buena: de 4 a 8 semanas ANTES de que abran inscripciones.** Es el único momento en que el organizador está decidiendo herramientas en vez de usándolas. Es decir: enero y febrero para la primera oleada, junio y julio para la segunda.

**Hoy es 28 de julio. Estás dentro de la ventana de la segunda oleada, y se cierra en semanas.**

**Ventana mala: con el torneo en marcha.** Cero. El organizador está metiendo resultados el domingo por la noche con 40 mensajes de WhatsApp encima. Cambiar de plataforma a mitad de campeonato le destruye el histórico y la audiencia. No responde, y si responde te odia. Peor todavía: la semana de arranque.

Excepción única: si acaba de quejarse públicamente esta semana, se le contacta esta semana. El dolor caduca en 48 a 72 horas.

**La ventana oculta y la mejor de todas: justo después de la final.** El organizador acaba de cerrar cuentas, sabe exactamente quién no pagó, tiene la lista de morosos fresca y está harto de haberla llevado en una hoja de cálculo. Máximo dolor de cobro, mínimo riesgo de migración. Si tuvieras que elegir un solo momento, es ese.

### La cuña de convivencia: no toques el torneo

**Regla dura: el torneo se queda en CopaFacil. Tú entras por el dinero y por los documentos.**

**Cuña 1 — Mensualidades del club. La mejor.** No compite con nada. El organizador que además dirige un club cobra cuotas mensuales a 60 o 200 jugadores en efectivo o transferencia suelta. Ese proceso está roto en todas partes y CopaFacil no lo toca, en ninguno de sus cuatro planes. Coexistencia total: torneo en CopaFacil, plata en Widdo.

**Cuña 2 — Validación documental.** Vive en el momento de la inscripción, antes del torneo, cuando CopaFacil todavía no importa. Un torneo con categorías por edad necesita verificar identidad. Hoy eso son fotos en un grupo de WhatsApp. Extra: quien maneja documentos de menores es exactamente quien no quiere anuncios de casas de apuestas en la app (queja B).

**Cuña 3 — Un torneo suelto de prueba.** La más débil, porque compite de frente. Úsala solo si el prospecto lo pide.

**Por qué esto aguanta a largo plazo:** los datos financieros son pegajosos, los brackets no. Un bracket se migra en una tarde. El histórico de pagos, los recibos y los morosos, no. Si Widdo se queda con el dinero y los documentos, el módulo de torneos entra solo al año siguiente, cuando CopaFacil vuelva a romper el flujo con una actualización. Y romperlo es su patrón documentado.

**Lo que NO debes decir nunca:**

- "Somos mejores que CopaFacil" → defiendes al incumbente
- "Migra tu campeonato" → coste enorme, beneficio invisible
- Comparaciones de precio → pierdes, eres de 2 a 5 veces más caro
- Listas de funcionalidades → CopaFacil tiene más

### Los tres mensajes

Cortos, sin adjetivos, un dato concreto del prospecto, una sola pregunta al final. Los corchetes son variables que **tienes que rellenar de verdad**. Sin eso, el mensaje no funciona.

**(a) Organizador contento con CopaFacil**

Premisa: no atacar. Preguntar por lo que la herramienta no cubre.

> Hola [Nombre], vi que la [Copa X] va por [fase de grupos / fecha N] en CopaFacil.
>
> Pregunta puntual: las inscripciones de los [N] equipos, ¿las recibiste por [Nequi/transferencia] y las controlaste en una hoja de cálculo?
>
> Yo hago Widdo, que se encarga solo del dinero y de los documentos. El torneo se queda en CopaFacil, eso no lo toco.
>
> ¿Cómo llevas hoy quién pagó y quién no?

Versión portugués:

> Oi [Nome], vi que a [Copa X] tá na [fase de grupos / rodada N] no Copa Fácil.
>
> Pergunta específica: a inscrição dos [N] times, você recebeu por Pix na mão e controlou em planilha?
>
> Eu faço o Widdo, que cuida só da parte do dinheiro e dos documentos. O campeonato continua no Copa Fácil, não mexo nisso.
>
> Como você controla hoje quem pagou e quem não pagou?

**(b) Organizador que se quejó públicamente**

Premisa: citar su queja casi literal. Nada de vender. Enviar dentro de las 48-72 horas.

> Hola [Nombre], leí tu comentario del [fecha]: "[pega 6-10 palabras exactas suyas]".
>
> No eres el único. Hay un organizador en Reclame Aqui que pidió volver al formato anterior y le respondieron "no será posible retornar al sistema anterior".
>
> No te voy a pedir que cambies de plataforma con el torneo andando. Solo esto: la inscripción y el dinero de los equipos no tienen por qué vivir en el mismo sitio que la tabla.
>
> ¿Te muestro en 10 minutos cómo queda separado?

Versión portugués para queja de anuncios (usar solo si su queja fue esa):

> Oi [Nome], li seu comentário sobre os anúncios de casa de aposta aparecendo pros seus filhos no app.
>
> Você não é o único, tem outro pai reclamando o mesmo na App Store.
>
> Não vou pedir pra você mudar o campeonato de lugar. Só a parte de cadastro e documento dos atletas, que é onde entram os menores.
>
> Quanto do seu campeonato é categoria de base?

**(c) Organizador que gestiona un club con mensualidades además de torneos**

Premisa: el mejor prospecto. CopaFacil no compite aquí en absoluto. Ir directo al número.

> Hola [Nombre], vi que además de la [Liga X] manejas el [Club Y] con [N] deportistas.
>
> El torneo ya lo tienes resuelto con CopaFacil. La mensualidad de los [N] deportistas no — eso CopaFacil no lo hace, ninguno de sus planes cubre cobro recurrente.
>
> Widdo cobra mensualidades y valida documentos. No toca la tabla del torneo.
>
> ¿Cuántas horas al mes se te van persiguiendo a los que se atrasan?

Versión portugués:

> Oi [Nome], vi que além da [Liga X] você toca o [Clube Y] com [N] atletas.
>
> O campeonato tá resolvido no Copa Fácil. A mensalidade dos [N] atletas não — isso o Copa Fácil não faz, nenhum plano deles cobre cobrança recorrente.
>
> Widdo cobra mensalidade e valida documento. Não toca na tabela.
>
> Quantas horas por mês você gasta cobrando quem atrasou?

---

## 7. Qué haría yo esta semana

Tres acciones. Para una persona sola. En este orden.

**1. Llama a tus 8 clubes que no pagan. Antes de escribirle a un solo desconocido.**

Tienes 11 clubes y 3 pagando. Si la tesis "el cobro de mensualidades es el dolor caro" fuera cierta, ya deberías tener más de 3 pagando. Pregúntales a los 8 por qué no pagan. Si la respuesta no es "el cobro", **este ángulo entero está mal calibrado y es mejor saberlo esta semana** que después de gastar la ventana de julio.

Coste: dos tardes. Valor: decide si todo lo demás tiene sentido.

**2. Vuelca el directorio completo y filtra Colombia, México y Perú.**

```bash
for p in $(seq 0 169); do curl -s "https://copafacil.com.br/list/$p"; sleep 0.3; done > all.html
```

Después, descarga las fichas /info de los que lleven 2026 en el nombre y tengan slug personalizado (no autogenerado). Filtra por país. Prioriza los que en el reglamento mencionen **cuota de inscripción o premio en metálico**: esos ya mueven dinero y son los únicos que pueden pagarte 200 dólares al año.

Coste: media jornada de scraping más una jornada de filtrado. Salida esperada: entre 30 y 60 organizadores cualificados, no 1.200.

**3. Escribe 15 mensajes a mano, hoy, con la cuña de mensualidades.**

Quince, no ciento cincuenta. Con el nombre real del torneo, la ciudad real y el número real de equipos rellenado. Mitad por Instagram, mitad por WhatsApp cuando el número esté publicado. Usa el mensaje (c) con los que además dirigen un club, y el (a) con el resto.

La ventana de la segunda oleada se cierra en semanas. Quince mensajes personalizados esta semana valen más que mil automatizados en septiembre.

**Y una cuarta cosa que no es de esta semana pero es urgente:** Widdo no aparece en ninguna búsqueda. Ni en español, ni en inglés. Centro, con cuatro meses de vida, ya rankea con páginas por ciudad en Florida. Ninguna de tus ventajas importa si el cliente no puede encontrarte.

---

## Fuentes y lo que no se pudo verificar

### Fuentes primarias abiertas y leídas

- copafacil.com — portada, /funcionalidades, /plans, /es, /es/plans, footer con razón social y CNPJ
- copafacil.com.br — /list/0 a /list/169 (directorio) y unas 215 fichas /{slug}/info
- Receita Federal vía receitaws.com.br/v1/cnpj/34843209000139 y brasilapi.com.br/api/cnpj/v1/34843209000139
- whois de copafacil.com y copafacil.com.br
- iTunes Lookup API, app id 1444543396 y developer id 1444543395, consultada por tienda nacional (br, mx, us, ar, co, cl, es, pe)
- play.google.com/store/apps/details?id=com.copafacil — HTML crudo
- RPC público de reseñas de Google Play (batchexecute, rpcids=UsvDTd) para pt-BR, es-MX, es-CO, es-AR
- RSS público de reseñas de App Store Brasil
- Wayback Machine: snapshots 20180806, 20190408163944 de copafacil.com y 20130925053313 de copafacil.com.br
- torneo.com, torneo.com/features, torneo.com/resources
- withcentro.com, withcentro.com/pricing, pr.com/press-release/964484
- robots.txt de ambos dominios de CopaFacil
- Cabeceras HTTP y DNS de copafacil.com

### Datos crudos guardados

Los volcados quedaron en el directorio de trabajo de esta sesión:
`/private/tmp/claude-501/-Users-miguelcano-Desktop-todo-getyoutubechannel/8a4668eb-dd10-4290-9aa7-d005d14a2c4e/scratchpad/`
— `gp.txt` (Google Play Brasil), `gp_MX.txt`, `gp_CO.txt`, `gp_AR.txt` (español), `rv_1.json` a `rv_5.json` (App Store Brasil), más las fichas HTML descargadas.

**Estos ficheros son temporales.** Si los quieres conservar, cópialos a la carpeta del proyecto antes de que se limpie el scratchpad.

### Lo que NO se pudo verificar

1. **Número de empleados.** Un CNPJ no publica nómina y no hay página de empresa en LinkedIn. Todo apunta a una persona, pero podría trabajar con freelances. [SIN CONFIRMAR]

2. **La fecha "data_entrada_sociedade: 2025-02-17" que devuelve BrasilAPI para el socio**, pese a que la empresa abrió en 2019. Lectura más probable: conversión de forma jurídica en febrero de 2025, no entrada de socio nuevo. Requeriría consulta a la Junta Comercial de Alagoas (JUCEAL). [ESPECULACIÓN]

3. **Facturación e ingresos.** Cero visibilidad. "Micro empresa" en Simples Nacional implica un techo de R$360.000 al año, pero es un límite del régimen, no una medida real. No hay forma pública de saber cuántos de los 5 millones de instaladores pagan. **Es perfectamente posible que CopaFacil tenga muchos menos suscriptores de pago de lo que su volumen sugiere.**

4. **No se auditó CopaFacil con cuenta creada.** Todo el análisis de funciones viene de marketing propio, fichas de tienda y reseñas. **La conclusión de "no cobra dinero" es sólida (cuatro pruebas convergentes) pero no está probada desde dentro.** Es la pieza central de tu ángulo competitivo: **crea una cuenta gratuita y recorre el flujo de crear un torneo.** Cierra este punto tú mismo, cuesta 20 minutos.

5. **Reclame Aqui devolvió 403** por WebFetch y por curl. El número exacto de quejas, el índice de solución y el tiempo de respuesta vienen de extractos indexados, no de lectura directa. [PROBABLE]

6. **Los límites exactos del plan gratuito** no están publicados. Que muestra publicidad es inferencia sólida; los topes de jugadores o equipos, no.

7. **La divisa del sitio en español.** Los planes se muestran como "$4,70/Mes" sin indicar moneda, y la empresa es brasileña. Se asume dólar por coherencia con el tipo de cambio, pero es [SIN CONFIRMAR].

8. **Los precios de SportsEngine, LeagueApps, TeamSnap y PlayMetrics** vienen de comparadores terceros (Capterra, GetApp) y de un blog de marketing de un competidor. Varían según la fuente. Trátalos como orden de magnitud y verifícalos antes de usarlos en cualquier material de venta.

9. **Ninguna capacidad de Widdo se verificó por fuente externa.** En particular, no se pudo comprobar que tu "validación documental" sea un flujo de aprobación real y no también un simple adjunto. **Si resultara ser solo adjunto, el hueco defendible se estrecha muchísimo**, porque es justo el diferenciador sobre el que se apoya todo lo demás.

10. **Tracción real de Centro.** Cuatro meses de vida, notas de prensa en cables de pago, sin información de financiación. Podría ser un competidor formidable o un lanzamiento sin clientes. Merece su propia investigación antes de fijar el posicionamiento en Florida.

11. **Cuántos torneos hispanohablantes aloja CopaFacil realmente**, y cuántos son de pago. Las valoraciones por tienda son el mejor proxy disponible, pero sobrerrepresentan iOS y subestiman Android, que es dominante en Latinoamérica.

12. **Si "Semilleros" (la app de marca blanca) tiene clientes colombianos.** Sus valoraciones iOS se concentran en Argentina, pero eso no descarta uso web. "Semilleros" es terminología central del fútbol formativo colombiano. Merece una pasada dedicada.

13. **Competidores brasileños detectados de paso y no investigados**: Webcup, APP Esportivo, Copa Clube. **Alguno de ellos sí podría cobrar inscripciones**, lo que cambiaría el panorama. Es el hilo abierto que yo priorizaría después de este.
