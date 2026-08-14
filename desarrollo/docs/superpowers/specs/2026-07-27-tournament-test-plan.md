# Plan de pruebas: ciclo completo de torneos (contexto USA)

> ## 🟡 PARCIAL (estado al 13-ago-2026) — falta el blindaje del checkout
>
> Los sets A-G están hechos (224 tests en verde) y el **SET H ya tiene su E2E**:
> `frontend/tests/e2e/tournaments/05-payment.spec.js`, junto con `00-full-journey`,
> `01-organizer-create`, `02-club-registers`, `03-player-view` y `04-scheduling`.
>
> 🔴 **Lo que sigue abierto es el SET I:**
> - **I-1 (doble cobro en el checkout de torneos):** el middleware `EnsureIdempotency`
>   existe y está registrado como alias `idempotent` en `bootstrap/app.php`, pero en
>   `routes/api.php` solo protege **pagos de club** (4 usos: `upload-proof`,
>   `installments`, …). **Ninguna ruta de checkout de torneo lo lleva.** Bloquea Gate 0.
> - **I-2 (reanudar pago abandonado):** sin implementar — 0 coincidencias en el código.
>
> El resto del archivo describe bien el plan; la línea «EJECUTADO salvo el SET H» de abajo
> se quedó corta: también falta el SET I.


**Fecha:** 2026-07-27 · **Estado:** EJECUTADO salvo el SET H (actualizado 2026-07-28)

> ## ⚠️ Antes de tocar nada: casi todo esto YA ESTÁ HECHO
>
> Los sets A, B, C, D y E se implementaron el 27-28 de julio: **64 tests nuevos**, con la
> suite de torneos en **224 tests / 3324 aserciones** en verde y desplegada. Los sets F y G
> ya estaban cubiertos de antes. **No los rehagas.**
>
> Commits: `5a49123` (los cinco sets), `cb5811a` (pagos), `d2d9cfd` (invitaciones),
> `bab1026` (roster).
>
> **Pendiente del plan: SET H** (E2E Playwright del camino de pago) **y SET I** (blindaje del
> checkout + reanudar pago — agregado 28-jul al descubrir que el checkout permite doble cobro).
>
> Fixtures compartidas: `tests/Traits/CreatesUsTournament.php`.
>
> De paso, los tests destaparon **9 bugs de producción, todos ya corregidos** — entre ellos
> un pago cobrado que figuraba impago, un agujero por el que cualquiera con un token metía su
> club en un torneo ajeno, y el borrado de jugador del roster que devolvía 404 siempre.
> Detalle en la memoria del proyecto: `tournaments-tests-y-bugs-jul2026`.
>
> **Deuda viva que este plan NO cubre** (decisiones de producto, no bugs a arreglar a ciegas):
> `category.max_players` significa equipos en un camino y jugadores en otro; el correo de
> invitación enlaza a `/t/{id}?invitation={token}`, ruta que **no existe** en el frontend; y
> `RegistrationService::addPlayers` (camino organizador) sigue sin validar edad ni género.

**Objetivo:** cubrir el recorrido que genera ingresos — organizador crea torneo → lo publica → invita clubes → el club se registra y paga → jugadores al roster → check-in — antes de encender Stripe live para Florida (Gate 0).

## Principio

No se reescribe lo que ya está verde. Cada set marca su cobertura actual (auditada contra `tests/Feature/` y `frontend/tests/e2e/` el 27-jul) y solo se construye el hueco. Los sets están ordenados por riesgo: primero el dinero, después lo que bloquea a un club, al final lo cosmético.

**Convenciones para todos los sets nuevos:**
- Backend: PHPUnit Feature, BD por sesión (`TEST_DB_DATABASE=db_testing_b|_c`), `Queue::fake()`, `Storage::fake()`, `Mail::fake()`.
- Stripe **simulado siempre**: nunca la API real. Para webhooks, generar la firma con el secret de test (`Webhook::constructEvent` la valida igual); para checkout, mockear el cliente de Stripe en el contenedor.
- Contexto USA por defecto en los sets nuevos: club con país `US`, moneda USD — es el mercado del lanzamiento y hoy casi todo se prueba con el club colombiano sembrado.
- Traits existentes: `SeedsBaseData`, `CreatesClubWithRoles`.

---

## SET A — Pagos de inscripción ✅ HECHO (6 tests, TournamentPaymentWebhookTest)

**Cobertura actual: casi nula.** `TournamentPaymentTest` solo prueba torneo gratis y degradación sin Stripe; `PublicTournamentApiTest` solo `payment_not_required` y un 404. **Nadie prueba un pago que sale bien.** El E2E harness de jul-20 validó un pago real una vez, manualmente — no protege regresiones.

| # | Caso | Endpoint | Por qué importa |
|---|------|----------|-----------------|
| A1 | Checkout con Stripe Connect configurado crea sesión y devuelve URL | `POST /public/tournaments/{t}/registrations/{r}/checkout` | Primer eslabón del cobro; hoy solo se prueba su ausencia |
| A2 | `payment_intent.succeeded` marca el pago `completed` y la inscripción como pagada | `POST /webhooks/stripe-connect` | **El crítico.** Si falla, un club paga y queda fuera del torneo |
| A3 | `payment_intent.payment_failed` marca el pago fallido sin tocar la inscripción | webhook | El club debe poder reintentar |
| A4 | Firma inválida → 400 y no se escribe nada | webhook | Seguridad: el endpoint es público |
| A5 | Webhook duplicado (mismo event id) es idempotente | webhook | Stripe reintenta; sin esto, dobles confirmaciones |
| A6 | Webhook de un `payment_intent` que no existe en BD → 200 sin efectos (no 500) | webhook | Stripe hace retry sobre 5xx: un 500 aquí genera tormenta de reintentos |
| A7 | Monto del checkout = fee de la categoría en USD (centavos correctos) | checkout | Error clásico de x100 en centavos |
| A8 | Registro en torneo pago queda `pending_payment` hasta que llega el webhook, no antes | register + webhook | Estado intermedio visible para el organizador |

## SET B — Invitación de clubes ✅ HECHO (20 tests, TournamentInvitationFlowTest)

**Cobertura actual: ninguna.** No existe ningún test que toque `TournamentInvitationController`.

| # | Caso | Endpoint |
|---|------|----------|
| B1 | Organizador invita a un club por email; se crea la invitación y sale el correo | `POST /organizer/tournaments/{t}/invitations` |
| B2 | Club acepta con el token → queda registrado/vinculado al torneo | `POST /tournaments/invitations/{token}/accept` |
| B3 | Club rechaza → estado `declined`, no puede aceptar después | `POST /tournaments/invitations/{token}/decline` |
| B4 | Token inválido o ya usado → error claro, no 500 | accept/decline |
| B5 | Reenviar regenera el token viejo e invalida el anterior | `POST /invitations/{id}/resend` |
| B6 | La invitación no cruza torneos: token de torneo A no sirve en torneo B | accept |
| B7 | Listado del organizador muestra estado de cada invitación | `GET /organizer/tournaments/{t}/invitations` |

## SET C — Creación y publicación ✅ HECHO (19 tests, TournamentFlyerAndSetupTest)

**Ya cubierto:** wizard de creación, index, update, validación de nombre, contexto de organizador (`TournamentOrganizerCrudTest`); ciclo completo hasta campeón (`TournamentLifecycleTest`).
**Huecos:**

| # | Caso | Endpoint |
|---|------|----------|
| C1 | **Subir flyer**: imagen válida se guarda y sale en la página pública; >límite o tipo inválido → 422 | `POST /pla_club_teams/{c}/tournaments/{t}/flyer` |
| C2 | Documentos requeridos: agregar/quitar y que el registro los exija | `POST/DELETE .../required-documents` |
| C3 | Campos requeridos configurables se reflejan en el formulario de registro | `POST .../required-fields` |
| C4 | Draft → published: el draft es 404 público (ya cubierto) y al publicar aparece | update + `GET /public/tournaments/{t}` |
| C5 | Sport config (sets, puntos, empates) se aplica al motor | `POST .../sport-config` |

## SET D — Página pública ✅ HECHO (7 tests, PublicTournamentUsPageTest)

**Ya cubierto:** show/404 de draft y cancelado, brackets con standings, matches filtrables, availability, registro público happy path, deadline vencido, equipo duplicado, categoría llena, emails de confirmación/aprobación/rechazo (`PublicTournamentApiTest`, 15 tests).
**Huecos:**

| # | Caso |
|---|------|
| D1 | El flyer subido en C1 sale en la respuesta pública con URL accesible |
| D2 | Torneo en USA: la página pública muestra USD y fechas coherentes con el timezone del torneo |

## SET E — Roster y elegibilidad ✅ HECHO (12 tests, TournamentRosterEligibilityTest)

**Ya cubierto:** registro autenticado, retiro, aprobar/rechazar/waitlist con emails, roster lock/unlock, jugador removido no hace check-in (`TournamentRegistrationController` vía `PublicTournamentApiTest` + `TournamentRosterCheckInTest`).
**Huecos:**

| # | Caso | Endpoint |
|---|------|----------|
| E1 | `addPlayers` respeta elegibilidad de la categoría (edad/género) | `POST /registrations/{r}/players` |
| E2 | Documentos requeridos del torneo (C2): jugador sin documento aprobado queda marcado | upload + status |
| E3 | Un club no puede agregar jugadores a la inscripción de otro club | addPlayers (tenancy) |
| E4 | Cupo por categoría se respeta también al agregar jugadores, no solo al registrar el equipo | addPlayers |

## SET F — Check-in, credenciales y waivers de torneo (✅ cubierto — no tocar)

18 tests en `TournamentRosterCheckInTest`: QR por jugador, verificación, waiver pendiente, QR cruzado entre torneos 404, check-in idempotente, equipo completo, panel, PDF de credenciales, backfill. **Nada que hacer.**

## SET G — Competencia: brackets, resultados, standings (✅ cubierto — no tocar)

`TournamentEngineMatrixTest` (6 formatos), `TournamentResultIntegrityTest`, `TournamentScaleTest`, `TournamentScheduleShowTest/NotificationTest`, ciclo a campeón en `TournamentLifecycleTest`, E2E organizador (5 flujos: aprobar, bracket, resultado, standings). **Nada que hacer.**

## SET H — E2E Playwright del camino de pago ⏳ PENDIENTE (lo único que falta)

> **REESCRITO 2026-07-28 tras auditar el código.** La versión anterior de este set describía
> un checkout con redirect a `checkout.stripe.com` y "vuelta de Stripe" que **no existe** en
> el producto, y proponía simularlo con `page.route()` devolviendo una URL falsa — inviable.
> No implementar aquello.

**Arquitectura real del pago (verificada en código, no re-descubrir):**
- `PublicRegistrationPage.jsx`: wizard categoría → equipo → **pago embebido** (Stripe Elements
  con `client_secret` + `PaymentElement`) → done. `stripe.confirmPayment({ redirect:
  'if_required' })`: el usuario **nunca sale del dominio**. No hay URL de retorno ni pantalla
  de cancelación.
- Backend `TournamentPaymentService`: crea `PaymentIntent` **real** contra la API de Stripe con
  `transfer_data.destination` = cuenta Connect del organizador. Un `client_secret` inventado
  rompe el widget (Elements lo valida contra `api.stripe.com`) → **la interceptación con
  `page.route()` no sirve para el paso de pago**. El pago se hace de verdad con claves TEST y
  tarjetas de prueba.
- Si el checkout falla o Connect está inactivo, el front degrada con gracia a
  `payment_required: false` y aterriza en la confirmación "pendiente" (offline).
- **Precisión de modelo** (corrige la redacción de A8): `pending_payment` NO es un estado de
  `PlaTournamentRegistration` (sus estados: pending/approved/rejected/waitlisted/withdrawn/
  cancelled). El estado de pago vive en `PlaTournamentPayment` (`pending`/`completed`/…).

**Ya existe y está verde — construir ENCIMA, no en paralelo:**
`tests/e2e/tournaments/05-payment.spec.js` (harness jul-20, suite 6/6 sin skips) ya cubre:
wizard completo de torneo con fee ("Demo Volleyball Open", $180, seed
`tournaments:seed-scenarios`), captura de la respuesta del checkout con `waitForResponse`,
**pago real 4242** dentro de los iframes de Stripe (trucos ya resueltos: acordeón "Card",
`dispatchEvent('click')` por el badge easel de dev-tools, país US + ZIP), degradación sin
Connect con skip explícito, y confirmación "you're registered". El H2 original ("el front
llama al checkout") ya está cubierto ahí — **eliminado como caso aparte**.

**Archivos:**
- Extender `tests/e2e/tournaments/05-payment.spec.js` (H1', H4')
- Nuevo `tests/e2e/tournaments/06-payment-visibility.spec.js` (H3', H5, H6)
- Nuevo helper `tests/e2e/helpers/stripeWebhook.js` (firma + POST del webhook)

**Casos (los que de verdad faltan):**

| # | Caso | Cómo | Por qué |
|---|------|------|---------|
| H1' | Página pública `/t/{id}` de torneo pago muestra el fee formateado en **USD** ("$180", no COP) y fechas coherentes con el timezone del torneo | Assert sobre la tabla de categorías (`cat.fee` + `tournament.currency`, `PublicTournamentPage.jsx` ~L242) antes de entrar al wizard. De paso: la página pública arranca en **inglés** por defecto (regla i18n) | El fee en pantalla, no solo en la API; cierra D2 en UI |
| H3' | Webhook `payment_intent.succeeded` firmado → el pago pasa a `completed` y **se ve en pantalla** | Sembrar por tinker un `PlaTournamentPayment` `pending` con `stripe_payment_intent_id` conocido (o usar el del pago del 05); POST firmado a `/webhooks/stripe-connect`; recargar | El estado que ve quien pagó; el webhook real de Stripe no llega a localhost |
| H4' | Tarjeta rechazada `4000 0000 0000 0002`: error rojo visible (`p.text-red-600`), botón de pago rehabilitado, reintento con 4242 completa | Mismo iframe-helper del 05. Reemplaza al inexistente "vuelta con pago cancelado" | El rechazo es el camino no-feliz más común y hoy nadie lo mira en UI |
| H5 | El organizador ve el pago `completed` en **`PaymentsPage`** (`/organizer` → torneo → Payments), NO en RegistrationsPage (esa página no muestra pagos — verificado) | Fixture `organizerPage` (`tests/e2e/fixtures/auth.js` ~L188, sesión en `.auth/organizer.json`); tras disparar H3' | Cierra el círculo: quien cobra tiene que verlo |
| H6 | Torneo **gratis** por el wizard público guest `/t/{id}/register`: no aparece paso de pago ni importes, aterriza en done | Usar "Demo Free Community Cup" del seeder. OJO: `02-club-registers.spec.js` cubre el torneo gratis pero por la ruta **autenticada** `/home/tournaments/{id}/register-team` — el camino guest público NO está cubierto | La rama sin pago no debe arrastrar UI de pago |

**Helper de firma del webhook** (mismo esquema que `TournamentPaymentWebhookTest.php:148`):
```js
// t={ts},v1=HMAC-SHA256(`${ts}.${payload}`, STRIPE_WEBHOOK_SECRET)
```
El secret se lee del `.env` del backend que está corriendo (`STRIPE_WEBHOOK_SECRET`,
`config('stripe.webhook_secret')`). Sin ese secret el endpoint rechaza todo (fail-closed).

**Requisitos de entorno (por esto el set quedó fuera de la tanda del 27-jul):**
1. Correr contra los **contenedores dev normales** (`docker compose exec saas_sport_app`),
   como todo el harness `tests/e2e/tournaments/` — NO contra `./start.sh --e2e`: el entorno
   aislado `db_e2e` no tiene claves Stripe en `docker-compose.e2e.yml`.
2. Claves TEST de Stripe en `saas_sport/.env` (verificado jul-2026) + Connect activo con
   organizador demo onboardeado (ya activo según harness 6/6; si se cae, el 05 hace skip
   explícito y H3'-H5 pueden correr igual sembrando el payment por tinker).
3. ✅ Fix fail-closed del webhook (`218a4c3`): verificado 28-jul que YA está en main y en
   origin/main (la rama `feature/webhook-signature-fail-closed` quedó obsoleta, se puede
   borrar). Requisito cumplido.
4. Seed: `php artisan tournaments:seed-scenarios` (re-runnable, borra los "Demo " previos).

**Fuera de alcance de H:**
- El pago abandonado y la reanudación se gestionan en el **SET I** (abajo) — dejó de ser
  "deuda a decidir" al descubrir que el checkout actual permite pagar dos veces.
- El link del correo de invitación a `/t/{id}?invitation={token}` sigue sin ruta en el front
  (deuda viva ya listada arriba).

## SET I — Blindaje del checkout + reanudar pago ⏳ FEATURE + TESTS (agregado 2026-07-28)

> No es solo deuda de producto. Auditoría del 28-jul encontró que
> `createRegistrationPayment` **no verifica si la inscripción ya está pagada** (segunda
> llamada al checkout = nuevo PaymentIntent = se puede cobrar dos veces), **no reutiliza** el
> PaymentIntent pendiente (cada llamada acumula intents y filas `PlaTournamentPayment`
> huérfanas), y el endpoint público es **enumerable** (ids secuenciales, sin token de
> propiedad). El caso "usuario cierra la pestaña en el paso de pago y no puede volver" es la
> cara visible; el agujero de doble cobro es lo urgente. **Bloquea Gate 0 igual que el SET A.**

**Orden obligatorio: primero blindar (I-1), después reanudar (I-2).** Una ruta de "volver a
pagar" construida sobre el checkout actual amplifica los tres huecos.

### I-1. Blindaje del checkout (backend, sin UI nueva)

| # | Cambio | Test |
|---|--------|------|
| I1 | Inscripción con pago `completed` → checkout responde `payment_required: false, already_paid: true`, **sin** crear PaymentIntent | A9: segunda llamada tras webhook exitoso no crea intent ni fila nueva |
| I2 | Existe pago `pending` con PaymentIntent vigente → checkout **reutiliza** su `client_secret` (Stripe: `PaymentIntent::retrieve`; si el intent está cancelado/expirado, ahí sí crear uno nuevo y marcar el viejo) | A10: dos llamadas seguidas devuelven el mismo intent; solo una fila `pending` |
| I3 | Token de propiedad: al registrar, generar `payment_token` (uuid) en la inscripción; checkout lo exige (`?token=` o body). Sin token o token ajeno → 404. El wizard lo recibe en la respuesta del register y lo pasa al checkout | A11: checkout sin token → 404; con token de otra inscripción → 404; flujo normal intacto |

### I-2. Reanudar pago (feature con UI)

| # | Cambio | Test |
|---|--------|------|
| I4 | Ruta pública `GET /t/{id}/pay/{registrationId}?token={payment_token}`: monta el mismo `PaymentStep` (Elements) llamando al checkout blindado. Ya pagado → pantalla "ya estás al día". Token inválido → 404 | E2E H7: abandonar en el paso de pago, abrir el link, completar con 4242 |
| I5 | El correo de "inscripción recibida" de torneo **pago** incluye el link de reanudación (plantilla única es/en/pt en `lang/*/mail/`, regla i18n; asunto se traduce al enviar) | Feature test: correo contiene la URL con token; torneo gratis NO la incluye |
| I6 | El `DoneStep` con `paymentSkipped` (degradación offline) muestra el mismo link como "paga cuando quieras" en vez de solo "el organizador te contactará" — si Connect estaba caído al registrar pero vuelve, el club puede pagar solo | E2E: registro degradado → visitar link cuando Connect activo → pagar |

**Decisiones tomadas (para no re-discutir):**
- Token uuid por inscripción, no firma HMAC con expiración: el link debe vivir lo que viva la
  deuda, y ya hay precedente de tokens por registro en invitaciones. Sin embargo NO reusar el
  token de invitación: son flujos distintos.
- No exponer "reintentar pago" en el panel del organizador todavía — el organizador ya tiene
  `PaymentsPage`; su herramienta de cobro es reenviar el link (posible I7 futuro).
- Reembolsos siguen fuera (el producto no los implementa).

**Implementación: rama `feature/tournament-checkout-hardening`, NUNCA en main.** I-1 puede
desplegarse solo (es corrección de seguridad de dinero); I-2 detrás, en la misma rama o la
siguiente.

---

## Orden de ejecución propuesto

1. **SET A** (pagos) — es el Gate 0 real. Empezar por A2/A4/A5: el webhook.
2. **SET B** (invitaciones) — cero cobertura sobre feature completa.
3. **SET C1** (flyer) + **D1/D2** — cierran el ciclo "publicar".
4. **SET E** — elegibilidad y tenancy del roster.
5. **SET I-1** — blindaje del checkout (doble cobro + enumeración). Bloquea Gate 0.
6. **SET H** — el E2E visual (A ya está verde; ver el set reescrito: extender el harness
   `tests/e2e/tournaments/`, no crear `flows/tournament-payment-flow.spec.js`).
7. **SET I-2** — reanudar pago (feature; depende de I-1 y reusa el PaymentStep que H valida).

Estimación honesta: A+B son ~15 tests de backend con fixtures compartidas (un trait `CreatesUsTournament` que arme organizador US + torneo pago + categoría). C/D/E suman ~10 más. H es un spec.

## Qué NO incluye este plan (a propósito)

- Re-probar brackets/motor/check-in: verde y estable.
- Stripe Connect onboarding del organizador (KYC): es flujo de Stripe, no nuestro; se valida a mano una vez.
- Reembolsos: el producto aún no los implementa — cuando existan, se agregan al SET A.
- Carga/estrés: `TournamentScaleTest` ya existe.
