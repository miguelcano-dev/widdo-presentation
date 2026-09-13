# CLAUDE.md - Widdo Desarrollo

## Documentacion del Proyecto

| Archivo | Proposito |
|---------|-----------|
| `ARCHITECTURE.md` | Vision general del sistema |
| `saas_sport/docs/PAYMENTS-STRIPE.md` | Pagos: Stripe, credenciales, webhooks, Connect |
| `.claude/context.md` | Estado actual del proyecto |
| `.claude/decisions.md` | Decisiones arquitectonicas |

### Documentacion USA

| Archivo | Audiencia | Contenido |
|---------|-----------|-----------|
| `usa/README.md` | Todos | Indice y guia de navegacion |
| `usa/USA-TECHNICAL.md` | Developers / Claude Code agents | Arquitectura, Ronda 0 (Suscripciones) + 11 fases, migraciones, endpoints |
| `usa/USA-BUSINESS.md` | Co-founder / inversores / ventas | Mercado, pricing, competencia, pilotos |
| `usa/USA-COMPLIANCE.md` | Ambas audiencias | Leyes Florida, NCAA, NIL, SafeSport |
| `usa/USA-PROGRESS.md` | Tracking de ejecucion | Checkboxes por tarea, log de ejecucion |

---

## Repositorios Git

- **Frontend:** `frontend/` (React + Vite)
- **Backend:** `saas_sport/` (Laravel 12 + Reverb)

El directorio `desarrollo/` NO es un repo git.

**Movil:** `mobile_flutter/` contiene las **specs** del cliente movil (Flutter). El codigo vive
en un repo aparte, `widdo-mobile-flutter`. El directorio de React Native quedo abandonado y esta
archivado como `_archivo-mobile-rn/`.

---

## Reglas operativas

Tres cosas que no se ven leyendo el codigo y que cambian como trabajas:

**1. Los tests se corren en LOCAL; el deploy es directo con push.**
No se gatea nada con CI. `.github/workflows/tests.yml` esta en `workflow_dispatch` (manual, no
corre en push). El unico gate vivo es `api-contract.yml`. Push a `saas_sport/main` = **deploy a
produccion**; push a `frontend/main` = **deploy a Netlify**. Corre la suite antes de pushear,
porque despues ya es tarde. No propongas volver a gatear con CI: es una decision tomada.

**2. Stripe sigue en MODO DE PRUEBA en produccion** (verificado 12-sep-2026).
Ningun cobro real entra hasta cerrar el **Gate 0** del lanzamiento USA. Ojo: la columna
`environment` de `bas_country_payment_config` es un selector manual del admin, no se deduce de
la llave, asi que no sirve como prueba por si sola. Estado punto por punto, y como saber si
alguien intento pagar: `saas_sport/docs/PAYMENTS-STRIPE.md`.

**3. Falta `REVERB_PUBLIC_HOST` en produccion.**
Sin esa variable el cliente movil apaga el tiempo real. Pendiente conocido.

---

## Laravel Reverb (WebSockets en Tiempo Real)

Configurado y en uso. Definiciones: `config/reverb.php`, `routes/channels.php`,
`app/Events/*`, `frontend/src/services/echo.js`, `hooks/useClubRealtimeEvents.js`.
Variables de entorno: ver `.env.example` de cada repo.
Los eventos se invalidan automaticamente en React Query via `PrivateLayout.jsx`.

### Canales Disponibles

| Canal | Permisos | Eventos |
|-------|----------|---------|
| `notifications.{userId}` | Solo el usuario | notification.created, notification.read |
| `club.{clubId}` | Miembros activos del club | Eventos generales |
| `club.{clubId}.payments` | Owner, Admin, Accountant | charge.created, payment.registered |
| `club.{clubId}.sessions` | Todos los miembros | session.updated |

Arrancar el servidor: `docker compose exec saas_sport_app php artisan reverb:start`
(sin Docker: `php artisan reverb:start`).

---

## Usuarios de Prueba (Tests E2E)

| Rol | Email | Password | Club |
|-----|-------|----------|------|
| Owner | director@bogotafc.co | Password123! | 1 |
| Trainer | diego.sanchez@bogotafc.co | Password123! | 1 |
| Player | alejandro.alvarez10@player.co | Password123! | 1 |
| Parent | luzm@h.com | Password123! | 7 |
| Accountant | contador@bogotafc.co | Password123! | 1 |
| Super Admin | admin@sportsclub.co | AdminPassword123! | - |

⚠️ **La fuente de verdad para Playwright es `frontend/tests/e2e/fixtures/test-users.js`,
que usa `password123`** (no `Password123!`). Si el login E2E devuelve 401, mira ahí antes
de tocar código: la contraseña depende del seeder que sembró la base.

### Contra qué base corre cada cosa

| Backend | Puerto | BD | Uso |
|---------|--------|----|-----|
| `saas_sport-saas_sport_app-1` | 8010 | `db` | Desarrollo. Default de `playwright.config.js` |
| `saas_sport-saas_sport_e2e-1` | 8020 | `db_e2e` | E2E aislado (`E2E_BACKEND_URL=http://localhost:8020`) |
| PHPUnit | — | `db_testing`, `_b`, `_c` | Tests backend. `db_testing` forzada por `tests/CreatesApplication.php` |

Para comandos de artisan/tests usa **`docker exec saas_sport-saas_sport_app-1`**, NUNCA
`docker compose exec`: si otra sesión levantó un contenedor one-off del mismo proyecto
compose, `compose exec` resuelve a ÉL y ejecutarás contra el worktree y la BD equivocados.

---

## Pagos (Stripe)

**Doc completa:** `saas_sport/docs/PAYMENTS-STRIPE.md`

| Pasarela | Flujo | Paises | Estado |
|----------|-------|--------|--------|
| Stripe | Checkout (suscripciones) + Connect Express (torneos) | US, CA, MX | Integrada; **produccion en modo de prueba** (verificado 12-sep-2026) |
| Wompi | — | — | ❌ Descartada (codigo legacy en el repo) |
| MercadoPago | — | — | ❌ Descartada (codigo legacy en el repo) |

Stripe es la unica pasarela. Wompi y MercadoPago se descartaron por **decision de negocio**, no
por un fallo tecnico; su codigo sigue en `app/Services/Payments/` y en `PaymentGatewayFactory`
porque arrancarlo tocaria el historico de pagos de los clubes colombianos. **No los configures ni
los ofrezcas.**

Las credenciales viven en **dos** lugares distintos, y poner la llave en el sitio equivocado no
da error, simplemente no cobra: Admin UI `/home/admin/payment-gateways` para las suscripciones de
clubes, y variables `.env` del droplet para torneos y Connect. Los webhooks usan un **secret
distinto por endpoint**. Todo el detalle en `saas_sport/docs/PAYMENTS-STRIPE.md`.

**Precios:** USD 99 / 199 / 349 al mes, por **cantidad de jugadores** (`max_members`: 80/200/500),
NO por modulos. Fuente: `SubscriptionPlansSeeder.php`.

**Comision: cero.** Widdo no se queda nada de los pagos de las familias. `config/stripe.php` trae
`application_fee_percent` con default 3, pero es **codigo muerto**: `TournamentPaymentService` no
envia `application_fee_amount`, y la rama de `StripeGateway.php:138` solo corre si alguien pasa
`connected_account_id`, cosa que ningun llamador hace. No la "arregles" para que cobre: el hero de
widdo.co promete `0% platform fee` y todo el outreach lo repite.

---

## Problemas Conocidos (Evitar Re-diagnostico)

| Problema | Solucion | Archivo |
|----------|----------|---------|
| Fechas pierden 1 dia | Usar `dateUtils.js` | `frontend/src/helpers/dateUtils.js` |
| Radix Select loop infinito | Usar `react-select` en dialogs | `patterns.md` |
| Multi-tenancy bypass | Verificar `ProtectedModel` trait | `critical-files.md` |

---

## Referencias Detalladas

Para informacion completa, ver:

- **Roles y permisos** → `ARCHITECTURE.md`
- **Patrones de codigo** → `saas_sport/.claude/patterns.md`, `frontend/.claude/patterns.md`
- **Archivos criticos** → `saas_sport/.claude/critical-files.md`, `frontend/.claude/critical-files.md`
- **Auth y refresh tokens** → `critical-files.md` (AuthController, axiosInstance)
- **Pagos (Stripe)** → `saas_sport/docs/PAYMENTS-STRIPE.md`
- **Migracion Laravel 12** → `.claude/decisions.md`
