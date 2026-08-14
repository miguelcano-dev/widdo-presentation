# Deck de ventas para organizadores de torneos USA — Diseño

**Fecha:** 2026-07-29
**Estado:** aprobado por Miguel (pricing gratis+0%, cross-sell 1 línea). PENDIENTE DE CONSTRUIR.
**Audiencia:** organizadores de torneos juveniles en USA (multideporte; el outreach activo es Florida, ver `adquisicion-usa/torneos-fl-target-list-outreach.md`)

---

## 1. Objetivo

PDF único, doble uso (leave-behind + guion de demo), que venda **Widdo Tournaments a organizadores**. No es el deck de partnership (`decks/usa/deck-tournaments-partnership.html`) ni un deck de inversores.

Ejecutar siguiendo el skill **`Widdo/.claude/skills/deck-ventas/`** (sistema visual, generador, pipeline de capturas). Este spec solo fija contenido y decisiones.

## 2. Decisiones tomadas

| Decisión | Valor |
|---|---|
| Pricing (slide 13) | **"Free for organizers. 0% platform fee. You keep 100%."** Sin tabla de planes. Es la realidad del código (`TournamentPaymentService.php:80`) y la tesis de adquisición: cada torneo trae clubes |
| Cross-sell Clubs | 1 línea al cierre del mapa de capacidades: "And your teams' clubs run on Widdo too" |
| Idioma | Inglés americano |
| Correo de cierre | `hey@widdo.co` |
| Archivo | `decks/torneos/deck-widdo-tournaments-usa.html` + `generate-deck-tournaments-usa.js` + registro en `update-metrics.js` y `decks/README.md` |

## 3. Inventario verificado (29-jul-2026) — lo que SÍ se puede vender

- **6 formatos de bracket** (verificado en `app/Services/Tournaments/`): `single_elimination`, `double_elimination`, `round_robin`, `group_stage`, `groups_then_elimination`, `swiss`
- **Auto-scheduling** con restricciones: `SchedulingService` + `ConstraintCheckerService`
- **0% comisión**: `TournamentPaymentService.php:80` — sin `application_fee_amount`, Stripe Connect Express, el dinero va directo a la cuenta del organizador (evita Money Transmitter License, ver `widdo-marketplace-payment-architecture.md`)
- **Página pública** `/t/:id` + inscripción `/t/:id/register` + credencial QR
- **Check-in de rosters + waivers propios de torneo** (`RosterCheckInService` — distinto del de clubes)
- **Live scoring, standings, head-to-head, rankings** (`MatchResultService`, `RankingService`, `HeadToHeadService`)
- **Series y plantillas** (`SeriesService`, `TemplateService`) — torneo recurrente = clonar
- **27 tools de IA de torneo** para el rol organizer (`TOURNAMENT_TOOL_NAMES`, contadas)
- Extras reales: `GateTicketService` (tickets de entrada), `TournamentPdfService`, `WeatherService`, `SmsNotificationService`, `StatsAggregationService`
- `/organizer/stripe-connect` tiene ruta (`organizerRoutes.jsx:152`) — el 404 histórico está resuelto
- Respaldo: 216 tests backend de torneos verdes, E2E 12/12

## 4. Lo que el deck NO debe prometer

- **Fechas ni "charge today"**: Stripe live keys sin configurar (Gate 0)
- Deuda viva conocida (`tournaments-tests-y-bugs-jul2026`): `max_players` ambiguo, enlace del correo sin ruta, organizador sin validar elegibilidad, branding de Connect pendiente
- PayPal (`PayPalService` existe pero no está validado como flujo vendible — verificar antes de mencionarlo)
- Nada de Academy. Clubs solo la línea de cross-sell

## 5. Estructura — 14 slides

| # | Slide | Contenido | Captura |
|---|---|---|---|
| 1 | Cover | "Run the tournament. Skip the spreadsheet weekend." | — |
| 2 | The problem | 4 dolores: inscripciones por Google Forms + Zelle · brackets en Excel a medianoche · "what time do we play?" ×200 · cobrar equipo a equipo | — (velo verde) |
| 3 | Capability map | 6 bloques: Registration · Brackets & Schedule · Game day · Money · Communication · Your public page. Nombres literales de `organizer.json`/`tournaments.json` (i18n EN). Línea final: cross-sell Clubs | — |
| 4 | Public tournament page | Inscripción online, el torneo se ve profesional, equipos se apuntan solos | 📸 `/t/:id` |
| 5 | You keep 100% | Slide estrella. 0% platform fee · Stripe Connect · el dinero NUNCA pasa por Widdo · payout directo | 📸 opcional Connect |
| 6 | Brackets, 6 formats | Generación automática, reseed, avanzar grupos | 📸 bracket |
| 7 | Auto-scheduling | Canchas, horarios y descansos resueltos con restricciones | 📸 schedule |
| 8 | Game day | Check-in QR de rosters + waivers firmados online antes de llegar | 📸 check-in |
| 9 | Live scores & standings | Padres miran el teléfono, no preguntan al organizador | 📸 standings/live |
| 10 | Widdo AI | **27 tournament tools**. Órdenes reales (cada una mapea a una tool): "Publish the tournament" (`publishTournament`) · "Generate the bracket" (`generateBracket`) · "Record 3-1 for the U12 final" (`recordMatchResult`) · "Who hasn't checked in?" (`getTournamentCheckInStatus`) · "Approve the Riverside FC registration" (`approveRegistration`) · "Send the schedule to all teams" (`notifyScheduleToTeams`) | 📸 chat |
| 11 | Before / After | Google Forms + Excel + Zelle vs Widdo | — |
| 12 | Series & templates | Recurrencia: clonar plantilla, rankings de temporada | — |
| 13 | Get started + pricing | 3 pasos (crear torneo → publicar link → equipos se inscriben y pagan) + **Free. 0% platform fee. You keep 100%.** | — (velo verde) |
| 14 | Close | "Your next tournament, without the spreadsheet." + `hey@widdo.co` + widdo.co | — (velo verde) |

## 6. Torneo demo para capturas

Igual que Orlando Force: **todo por la API de la app**, nada de seeders ni SQL directo. Seguir `capturas.md` del skill al pie de la letra (bundle 5176, `widdo_user_lang`, cookie de consent, barrido de español en DOM).

1. Cuenta organizador USA (`activate-organizer` o registro con `account_type: 'organizer'`)
2. Torneo publicado: "Central Florida Winter Cup", soccer, Orlando, ~8 equipos, entry fee en USD ($350–$450 por equipo, típico FL)
3. Equipos: Orlando Force (ya existe) + 7 inventados con nombres de FL (Riverside FC, Winter Park United…)
4. Bracket generado (groups_then_elimination luce más que single elim), schedule generado, resultados parciales cargados para que standings y live no salgan vacíos
5. Check-in parcial (algunos equipos sí, otros no) para que la pantalla de check-in muestre estado real
6. OJO suscripción/gating: verificar qué gating aplica al contexto organizador antes de capturar, para no repetir los `$0`

Riesgo conocido: el agente IA responde en el idioma del país → cuenta organizador con ciudad USA. El arreglo del locale (jul-29, sin commitear) además fuerza el idioma de la UI.

## 7. Verificación antes de entregar

La checklist del skill, más:
- [ ] "27 tools" re-contado si `ToolDefinitions.php` cambió
- [ ] "0% fee" sigue siendo cierto en `TournamentPaymentService`
- [ ] Las 6 órdenes del slide 10 mapean a tools existentes
- [ ] Capturas sin español (barrido DOM), USD, sin banners de gating

## 8. Fuera de alcance

Versión español/portugués · deck de partnership (ya existe) · tickets de entrada y clima como slides propios (mencionables en el mapa, no más) · cualquier cambio de producto.
