# MESSAGING.md — Messaging House de Widdo

**Fuente única de verdad de QUÉ se dice.** Toda pieza de marketing (post, card, video, blog,
one-pager) se escribe desde este archivo y se audita contra este archivo. Si un claim no está
aquí, no se publica. Jerarquía de verdad: `../metrics.json` y los hechos canónicos de
`../CLAUDE.md` mandan sobre este archivo; este archivo manda sobre cualquier pieza.

Actualizado: 19-ago-2026. Cada claim de la tabla fue verificado contra producción o código.

---

## 1. Posicionamiento (vigente, publicado)

- **Categoría:** The AI-native operating system for youth sports clubs.
- **Eslogan LinkedIn:** `The AI-native operating system for youth sports clubs — it chases the dues so you can coach.`
- **Claim de portada:** `Run your club without chasing parents for money.`
- **Pilar y puerta:** youth sports es EL pilar (se nombra siempre); la puerta queda abierta:
  "built for youth clubs first — and it runs adult teams and leagues just as well".
- **Regla de altitud:** el About/bio de cada red dice RESULTADOS y AUDIENCIAS (patrón
  ServiceTitan/Brightwheel). El DETALLE fino (75+ acciones, 6 formatos, precios exactos) va en
  posts del feed, una idea por post.

## 2. Audiencias

| Audiencia | Qué le duele | Qué le decimos |
|---|---|---|
| **Dueño/director de club** (compra) | Perseguir pagos, planillas, el mes sin cerrar | "It chases the dues so you can coach" |
| **Entrenador** (usa) | Asistencia, comunicación con padres | Asistencia en segundos, QR, app |
| **Padre/familia** (paga) | No saber qué debe, cuándo, dónde | Paga, firma y se entera desde el teléfono, EN/ES |
| **Tournament director** (2ª audiencia, ver §6) | Brackets en papel, entry fees por Venmo, waivers en carpeta, la fila del check-in | Torneo entero desde el teléfono; "cleared to play" |

## 3. Fact sheet — los ÚNICOS claims usables

| Claim | Redacción base | Verificación |
|---|---|---|
| 0% platform fee | Families' money lands straight in the club's own Stripe account. We never take a cut of dues, registrations, or tournament entries | Código: no se envía `application_fee_amount` |
| AI-native | One assistant, 75+ actions across every module, 8 roles. Autonomous collections, attendance flags, daily morning brief. **Always: "You approve; it executes"** | `ai-agent.md`; tool `approveCollectionReminders` en prod |
| Onboarding | A new club gets set up by **chatting** with the platform — categories, schedules, fees in one chat conversation. **Chat de texto — NO hay voz; jamás micrófonos en diseños** | Agente de onboarding en prod (13 tools) |
| Deportes | 33 sports live today — basketball, baseball, volleyball, flag football, cheer, lacrosse, swimming… Youth first; adult teams too | `GET api.widdo.co/api/sports` → 33 activos, 30 `popular_us` |
| Torneos | Registrations, brackets (6 formats), live scoring, online entry payments, QR check-in | Motor en prod, 224 tests |
| Waivers / eligibility | Organizers set required liability waivers; parents sign digitally; the organizer sees per team who's **cleared to play**; QR check-in verifies eligibility at the gate | `getTournamentWaiverStatus`, `RosterCheckInService.verifyPlayer`, `teamsProgress` |
| Payment board (clubes) | One screen: green = paid, yellow = due soon, red = overdue. Regla de producto: quien ya pagó NUNCA se muestra en rojo | Vista `/home/collections` en prod |
| Bilingüe | Every parent uses the app in English or Spanish. Ningún incumbente lo ofrece | i18n en prod; vacío de mercado documentado |
| Precios | $99 / $249 / $499 al mes por cantidad de jugadores (80/200/500). Todo incluido en todos los planes. Anual = paga 12, recibe 13 (**8%**, no 17%) | BD de producción, 12-sep-2026: `bas_subscription_plan_prices` para US |
| Móvil | Native app (iOS/Android) for parents, players, coaches | TestFlight |
| Sin anuncios | Families are never shown ads | Producto |
| Datos de industria | 73% de clubes US sin software pago · 300.000+ organizaciones · padres gastan 37 min/día coordinando (Aspen, n=1.848) · basketball 29,7M / baseball 16,7M / soccer 14,1M participantes (SFIA 2025) | `negocio/SFIA-MARKET-DATA.md`, `adquisicion-usa/TAREAS-REPETITIVAS-RESEARCH.md` |
| Citas de dolor (públicas, Reddit) | "I hate collecting money" · "chasing payments is hands down the worst" · "2 or 3 parents who just refused to pay" | `TAREAS-REPETITIVAS-RESEARCH.md` apéndice |

## 4. Prohibiciones duras

- ❌ **Métricas internas**: nº de clubes, usuarios, MRR, churn, CAC, revenue. NUNCA en público.
- ⚠️ **Colombia, LATAM, portugués** (matizado el 12-sep-2026 por Miguel). El **mercado** es USA y
  ahí va toda la inversión comercial: nada de precios en pesos, casos de Colombia ni "líderes en
  LATAM". Pero **no se bloquea el descubrimiento**: nos han encontrado desde Argentina, México y
  Colombia, y quien busque desde cualquier país debe dar con Widdo como la mejor operación
  AI-native para deporte. La regla practica: **el posicionamiento es USA-first y global-findable**.
  El bilingüe se sigue contando EN INGLÉS como feature.
- ❌ **Estrategia de crecimiento**: flywheel de torneos, playbook de adquisición, listas de prospectos.
- ❌ **"Widdo se queda 2-3% de los pagos"** — FALSO. Es 0%. (Este claim falso vivió meses en 5 docs; se limpió el 18-ago.)
- ❌ **Cifras sin validar**: "$12.5M recovered", "$71M debt", "21 clubs", "0% churn".
- ❌ **Nombrar competidores en material PÚBLICO** (TeamSnap, SportsEngine, LeagueApps, GotSport,
  Exposure, Crossbar, Jersey Watch…). Decir "legacy platforms" / "the big registration
  platforms". Las citas de reviews se usan SIN marca. **En docs internos y outreach 1:1 SÍ se
  nombran** — ahí es munición correcta.
- ❌ **Nombrar GameUp** en cualquier rol (partnership en curso).
- ❌ "We're excited to announce…", pedir likes/shares, engagement bait.
- ❌ Emoji como iconos en diseños — iconos SVG reales.

## 5. Reglas de idioma y vocabulario USA

- Todo el material público en **inglés**.
- Edades: **14U, 12U** (número primero). NUNCA U15/U14 (notación de fútbol europeo).
- Elegibilidad de torneos: **"waivers", "eligibility", "roster compliance", "cleared to play"**.
  NUNCA "semaphore/traffic light" como nombre de feature.
- Onboarding: **"chatting"**, nunca "talking" (no hay interfaz de voz).
- Deportes ancla: **basketball primero** (#1 USA, 29,7M), luego baseball/volleyball/cheer.
  Soccer existe pero no abre frases (#3). Lacrosse solo como ejemplo de amplitud.
- Voz: directa, concreta, un poco seca. Founder-built. Frases cortas. UNA idea por pieza.
  Cierre con afirmación o pregunta genuina. 3-5 hashtags: #sportstech #youthsports
  #clubmanagement #saas #startup.

## 6. Torneos — caballo de Troya (INTERNO, jamás decirlo en público)

Los posts de torneos atienden al **tournament director** como audiencia de primera clase
(≥1 de cada 4 posts). Se le sirve a ÉL: caos del fin de semana, brackets, waivers, check-in.
**Nunca explicar en público por qué los torneos importan estratégicamente** — ni "flywheel",
ni "cada torneo nos trae clubes". El caballo funciona solo si nadie ve el caballo.
⚠️ Facturación de torneos aún en sandbox (Gate 0): afirmar capacidad, nunca cobro real.

## 7. Frase de costura con GameUp (solo para reuniones)

"GameUp helps families find the program; Widdo runs the program." No usar en material público.
