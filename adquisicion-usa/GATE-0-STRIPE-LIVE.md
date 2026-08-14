# Gate 0 — Poner Stripe en LIVE (paso a paso)

**Estado:** 🔄 **en curso.** La parte manual de Miguel está en marcha y casi lista.
La **tanda 1 está en envío desde el 13-ago-2026** — el outreach ya no espera a este gate; lo que espera es cobrar.
**Última actualización:** 13 ago 2026

---

## Lo que YA está hecho (no repetir)

| Item | Estado | Dónde |
|---|---|---|
| Fix: secret propio para webhook de Connect | ✅ EN PROD | commit `9a07ddc` en `saas_sport/main`, desplegado automáticamente |
| Ruta SPA `/organizer/stripe-connect` | ✅ existe | `frontend/src/routes/organizerRoutes.jsx:152` |
| Landing con pricing $99/$199/$349 + hero 0% fee | ✅ en prod | — |
| Dirección física Orlando (CAN-SPAM) | ✅ resuelto | — |
| Email `miguel@widdo.co` (Brevo + Gmail Send-As) | ✅ funcionando | — |
| 10 emails de la tanda 1 | ✅ escritos · **EN ENVÍO desde 13-ago-2026** (Brevo) | `adquisicion-usa/emails/` |

### El fix `9a07ddc` — qué arregló y por qué importa

Los dos webhooks (`/api/webhooks/stripe` y `/api/webhooks/stripe-connect`) verificaban
la firma con el **mismo** `STRIPE_WEBHOOK_SECRET`. Stripe genera un signing secret
**distinto por endpoint**, así que con los dos endpoints dados de alta en live, uno de
los dos SIEMPRE habría rechazado con "Invalid signature" — y los pagos de torneo nunca
habrían llegado. En test no se notaba porque solo había un endpoint activo.

Ahora `TournamentWebhookController` lee `config('stripe.connect_webhook_secret')` con
fallback al general. Retrocompatible: si la variable nueva no existe, se comporta como
antes. Archivos: `config/stripe.php`, `app/Http/Controllers/TournamentWebhookController.php`,
`.env.example`. 14 tests verdes.

---

## Lo que FALTA (todo manual de Miguel, ~1-2 h)

### Paso 1 — Dashboard Stripe: activar cuenta live (~45 min)

1. dashboard.stripe.com → perfil de negocio: **Widdo Inc (C-Corp), EIN 35-2952499,
   dirección Orlando**, cuenta de payouts = **Mercury**. Incluye verificación de
   identidad con documento.
2. **Settings → Branding**: logo y colores Widdo (aparece en checkout Y en el
   onboarding de organizadores de torneos).
3. **Settings → Connect**: activar Connect en live + completar platform profile (KYC
   de la plataforma). Copiar el **`ca_…`** (Connect Client ID).
4. **Developers → API keys**, toggle en **Live**: copiar `pk_live_…` y `sk_live_…`.

### Paso 2 — Crear los DOS webhooks (modo Live)

**Endpoint A — suscripciones de clubes**
- URL: `https://api.widdo.co/api/webhooks/stripe`
- Eventos: `checkout.session.completed`, `invoice.*`, `customer.subscription.*`,
  `payment_intent.*`, `charge.refunded`
- Copiar su `whsec_…` → etiquetar **"SUSCRIPCIONES"**

**Endpoint B — torneos (Connect)**
- URL: `https://api.widdo.co/api/webhooks/stripe-connect`
- Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`,
  `charge.refunded`, `account.updated`
- ✅ **Marcar "Listen to events on Connected accounts"** — sin ese check los pagos de
  torneo NUNCA llegan
- Copiar su `whsec_…` → etiquetar **"CONNECT"**

⚠️ Cruzar los dos secrets = "Invalid signature" en logs. Es el error más común de este flujo.

### Paso 3 — Cargar credenciales en LOS DOS LUGARES

Las credenciales viven en dos sitios distintos. Hacer solo uno deja media plataforma en test.

**3A. Suscripciones de clubes → Admin UI** `/home/admin/payment-gateways`
- Editar las filas Stripe de **US, CO y MX** (las tres)
- `pk_live` + `sk_live` + webhook secret de **SUSCRIPCIONES**
- Environment = literal **`production`** (hoy las 3 dicen `sandbox`;
  `BasCountryPaymentConfig::isProduction()` compara esa palabra exacta)

**3B. Torneos/Connect → `.env` del droplet**
```bash
ssh root@167.71.88.31
cd /var/www/widdo
nano .env
```
**EDITAR las líneas que YA existen** (tienen `pk_test_`/`sk_test_`), no añadir duplicados
al final — Laravel toma la primera aparición y las duplicadas se ignoran en silencio:
```
STRIPE_KEY=pk_live_…
STRIPE_SECRET=sk_live_…
STRIPE_WEBHOOK_SECRET=whsec_…          ← el de SUSCRIPCIONES (endpoint A)
```
**AÑADIR** (no existen todavía):
```
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_…  ← el de CONNECT (endpoint B)
STRIPE_CONNECT_CLIENT_ID=ca_…
```
Luego, obligatorio (la app lee config cacheada, no `.env`):
```bash
php artisan config:clear && php artisan config:cache
php artisan queue:restart
```
(o `widdo cache-rebuild`)

> El `git pull` NO hace falta: el fix ya está desplegado en prod.

### Paso 4 — Smoke tests con dinero real

Es el ÚNICO puente entre "la suite está verde" y "podemos cobrar". La suite valida el
código; no valida cuenta activada, KYC de Connect, firma del webhook live, ni dinero
llegando a Mercury.

1. **Club:** suscripción con tarjeta real → Dashboard → Developers → Webhooks →
   endpoint A entrega **200** → reembolsar desde el Dashboard
2. **Torneo:** inscripción con fee vía Connect → endpoint B recibe
   `payment_intent.succeeded` con 200 → dinero rumbo al organizador → reembolsar
3. Logs/Sentry: **cero** "Invalid signature". Si aparece → secrets cruzados, volver al paso 3

### Paso 5 — Cierres

- Abrir `/organizer/stripe-connect` en prod y confirmar que carga
- Vigilar el hueco conocido de **doble cobro en checkout de torneos** durante los
  primeros pagos reales (ver `tournaments-tests-y-bugs-jul2026`)
- Marcar Gate 0 en `adquisicion-usa/LANZAMIENTO-GO-NOGO.html`
- → Arranca **Gate 1**: los 10 emails (reverificar cada prospecto el día del envío) +
  LinkedIn el MISMO día (el prospecto googlea "Miguel Cano Widdo" antes de responder)

---

## Cosas que muerden y ya nos costaron tiempo

1. **Push a `saas_sport/main` = DEPLOY A PRODUCCIÓN AUTOMÁTICO** (`.github/workflows/deploy.yml`).
   No es "subir código": es publicar. Confirmar SIEMPRE antes de pushear, y mirar qué
   más hay en `origin/main` sin desplegar — un push arrastra los commits ajenos que
   estén delante.
2. **Las credenciales viven en 2 lugares** (Admin UI para suscripciones, `.env` para
   Connect). Es el error de configuración más caro de este gate.
3. **Un secret por endpoint**, no uno global. Ya arreglado en código, pero hay que
   cargar los dos valores distintos.
4. **`config:cache` obligatorio** tras tocar `.env`. Sin eso la app sigue en test aunque
   el archivo diga live.
5. **Commits en `saas_sport`: prohibido `Co-Authored-By: Claude`** (regla del CLAUDE.md
   de ese repo). Se coló en `9a07ddc`; no repetir.
