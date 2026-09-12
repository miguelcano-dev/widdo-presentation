# La Máquina de Growth de Widdo

Análisis 19-ago-2026, en lenguaje llano.

**Widdo necesita reuniones con quienes pagan la suscripción: dueños de clubes,
organizadores de torneos y dueños de equipos/academias. Todo lo demás existe para
producir eso.** Se mide UNA cosa cada viernes: ¿cuántas reuniones agendamos esta semana?
Likes, seguidores y views: señales, jamás objetivos.

## Quién es quién (para no confundirse nunca)

| Rol | Quién | Relación con Widdo |
|---|---|---|
| **Cliente** (paga la suscripción) | Dueño de club · organizador de torneo · dueño de equipo/academia | Con ÉL es la reunión |
| **Usuarios** (usan la app) | El dueño, sus entrenadores, los padres y jugadores | Los padres pagan al CLUB (0% para Widdo), no a Widdo |

## El diagnóstico que ordena todo

1. **El cuello de botella NO es awareness — es ejecución.** El motor de outbound está
   construido (`MOTOR/`: 54 emails, Brevo verificado, runbook, secuencia) y **52 de 54
   emails nunca se enviaron**. Ningún canal nuevo rinde más que encender este.
2. **Gate 0 abierto = growth sin caja.** Stripe sigue en sandbox: ni clubes USA ni torneos
   son facturables. Todo lead que se genere hoy se vende como **founding organizer para
   enero 2027** (decisión del 13-ago) — y Gate 0 debe cerrarse antes de esa cohorte.
3. Con 2 personas, la máquina se construye por CAPAS SECUENCIADAS, no en paralelo.

## Las 4 capas (orden = ROI por hora invertida)

### Capa 1 — CONVERSIÓN (outbound) · encender YA, semanas 0-4
- **Recalendarizar y enviar** el motor: 18/día, framing enero-2027, orden ya definido en
  `MOTOR/calendario-envio.md`. Los 🟡 se verifican antes de enviar (regla existente).
- Escalar con el pipeline ya montado: `research-ligas` → `enrich-prospecto` →
  `draft-outreach` (las 3 skills existen). Meta: **30-40 emails verificados/semana**.
- **Facebook Groups**: presencia del founder en 5-8 grupos (playbook #2 — "los compradores
  están ahí HOY"). Aportar, no vender; Widdo solo cuando preguntan.
- 📏 Métrica: respuestas/semana → demos agendadas → show-rate.
- Matemática honesta (cold B2B, emails verificados, 5-10% de respuesta): para ~25-30 demos
  hacia enero se necesitan ~500-800 emails bien dirigidos en 5 meses = el ritmo de arriba.
  Los 54 actuales producirán ~3-5 respuestas: son el arranque, no la meta.

### Capa 2 — CAPTURA DE INTENCIÓN (inbound perpetuo) · semanas 2-8
- **Comparison SEO**: una página por keyword ("TeamSnap alternative", "GotSport
  alternative"…). Brief listo en `BRIEF-LANDING.md`; carpeta `contenido/blog-seo/`.
  Única excepción a no-nombrar competidores. Cada página rankea por años.
- **Reddit evergreen**: 1 h/semana, comentarios útiles en hilos que ya rankean en Google.
- 📏 Métrica: leads inbound/mes (form fills, clicks a demo). Posiciones = secundaria.

### Capa 3 — AWARENESS COMPUESTA (contenido) · semanas 4+, con colchón
- **Motor de video corto**: 1 master vertical → TikTok + IG Reels + YT Shorts. Abrir
  cuenta SOLO con 8-10 masters en banco (TikTok castiga la inconstancia). Banco de ideas
  en `contenido/tiktok/README.md`. Fuentes baratas: screen-recordings del producto EN
  (`grabar-demo-widdo`), piezas Ajedrez animadas, el reel USA (12 frames aprobados).
- **LinkedIn**: 2-3/semana página + 1/semana perfil founder (credibilidad para capas 1-2:
  el que recibe el email te googlea). Ya operativo.
- **Instagram**: archivar intros viejas, publicar el tablero Ajedrez, bilingüe EN+ES.
- 📏 Métrica: DMs/comentarios de admins y organizadores REALES.

### Capa 4 — EL PRODUCTO SE VENDE SOLO · cuando haya clubes activos
- **Un torneo pone a Widdo frente a 20-30 DUEÑOS de equipos a la vez** — cada uno es un
  cliente potencial. Ese es el multiplicador real (y por eso torneos es el caballo de Troya).
- Los links públicos de inscripción y el "powered by Widdo" dan visibilidad de marca ante
  las familias — refuerzan, pero el objetivo siempre son los dueños/organizadores.
- Esta capa es la única que crece sola — pero necesita clubes y torneos activos, por eso es la 4ª.
- 📏 Métrica: dueños/organizadores que llegan referidos por otro club o por un torneo.

## Ritmo semanal de operación (2 personas + agentes)

| Día | Qué |
|---|---|
| Lunes | mk-estratega: piezas de la semana · widdo-ventas: lote de prospectos nuevo |
| Mar-Jue | Envíos (18/día) · publicar LinkedIn · 1 h Facebook Groups |
| Jueves | Producción de contenido (mk-copy + mk-diseno + brand-qa) |
| Viernes | Tablero de métricas: respuestas, demos, inbound. Lo aprendido → MESSAGING/calendario |

## Qué NO hacer (decisiones ya tomadas)
- No outbound por DMs de LinkedIn (riesgo de cuenta; LinkedIn = credibilidad).
- No abrir TikTok sin colchón de masters.
- No `widdo_latam`: una cuenta por red, idioma por RED (ver `contenido/MARKETING-OS.md`).
- No métricas internas ni claims fuera del fact sheet (`contenido/MESSAGING.md`).
