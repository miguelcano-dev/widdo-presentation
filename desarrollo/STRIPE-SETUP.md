# Stripe Setup — Widdo

## Prerequisitos

- [ ] EIN de C Corp activo (Stripe Atlas)
- [ ] Cuenta Stripe verificada con datos bancarios (Mercury)
- [ ] Node.js y Composer disponibles

---

## 1. Stripe Dashboard (hacer primero, 30 min)

### 1.1 Crear Products

Ir a https://dashboard.stripe.com/products → Create Product:

| Product | Description |
|---------|-------------|
| **Widdo Starter** | For small clubs up to 80 members |
| **Widdo Pro** | For growing clubs up to 200 members |
| **Widdo Enterprise** | For large clubs, leagues, and federations |

### 1.2 Crear Prices (por cada product)

Cada producto necesita prices por pais y ciclo. Usar `currency_options` o crear prices separados:

**Widdo Starter:**
| Ciclo | USD | COP | MXN |
|-------|-----|-----|-----|
| Mensual | $99 | $69,000 | $1,499 |
| Anual (x12, 13 meses) | $1,188 | $828,000 | $17,988 |

**Widdo Pro:**
| Ciclo | USD | COP | MXN |
|-------|-----|-----|-----|
| Mensual | $199 | $129,000 | $2,999 |
| Anual (x12, 13 meses) | $2,388 | $1,548,000 | $35,988 |

**Widdo Enterprise:**
| Ciclo | USD | COP | MXN |
|-------|-----|-----|-----|
| Mensual | $349 | $299,000 | $5,499 |
| Anual (x12, 13 meses) | $4,188 | $3,588,000 | $65,988 |

**IMPORTANTE:** Precios anuales = mensual x 12 (no descuento). El mes 13 se da como cortesia (no como precio rebajado).

Anotar los `price_id` de cada uno (ej: `price_1Qxxx...`).

### 1.3 Configurar Webhook

Dashboard → Developers → Webhooks → Add Endpoint:

- **URL:** `https://api.widdo.co/api/webhooks/stripe`
- **Eventos a escuchar:**
  - `checkout.session.completed`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- **Anotar:** Webhook Signing Secret (`whsec_xxx`)

### 1.4 Activar metodos de pago locales

Dashboard → Settings → Payment Methods:

- [x] Cards (global)
- [ ] OXXO (Mexico) — activar
- [ ] SPEI (Mexico) — activar
- [ ] Boleto (Brasil) — activar si hay demanda

### 1.5 Configurar Customer Portal

Dashboard → Settings → Billing → Customer Portal:

- [x] Permitir cancelar suscripcion
- [x] Permitir cambiar de plan (upgrade/downgrade)
- [x] Permitir actualizar metodo de pago
- [ ] NO permitir pausar (no lo soportamos aun)

### 1.6 Configurar Stripe Tax (opcional)

Dashboard → Settings → Tax → Activar Stripe Tax:

- Aplica IVA automaticamente por pais
- CO: 19% | MX: 16% | US: sales tax por estado
- Requiere activar "Stripe Tax" en la suscripcion

---

## 2. Variables de Entorno

### Backend (`.env` produccion)
```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx

# Price IDs (anotar de Stripe Dashboard)
STRIPE_PRICE_STARTER_MONTHLY_USD=price_xxx
STRIPE_PRICE_STARTER_YEARLY_USD=price_xxx
STRIPE_PRICE_PRO_MONTHLY_USD=price_xxx
STRIPE_PRICE_PRO_YEARLY_USD=price_xxx
STRIPE_PRICE_ENTERPRISE_MONTHLY_USD=price_xxx
STRIPE_PRICE_ENTERPRISE_YEARLY_USD=price_xxx

# COP prices (opcional — se pueden crear via API)
STRIPE_PRICE_STARTER_MONTHLY_COP=price_xxx
STRIPE_PRICE_PRO_MONTHLY_COP=price_xxx
STRIPE_PRICE_ENTERPRISE_MONTHLY_COP=price_xxx
```

### Frontend (`.env`)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
```

### Landing (`.env.local`)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
```

---

## 3. Backend — Tareas de implementacion

### 3.1 Instalar SDK
```bash
cd saas_sport
composer require stripe/stripe-php
```

### 3.2 Crear StripeGateway
**Archivo:** `app/Services/Payments/StripeGateway.php`

Implementa `PaymentGatewayInterface`. Metodos clave:
- `createCheckoutSession()` — crea Stripe Checkout Session con price_id
- `createCustomer()` — crea Stripe Customer (email, name, club_id como metadata)
- `createBillingPortalSession()` — genera URL para que club gestione suscripcion
- `handleWebhook()` — procesa eventos de Stripe

### 3.3 Registrar en Factory
**Archivo:** `app/Services/Payments/PaymentGatewayFactory.php`
```php
'stripe' => StripeGateway::class
```

### 3.4 Migracion — campos Stripe
```bash
php artisan make:migration add_stripe_fields_to_clubs
```
```php
$table->string('stripe_customer_id')->nullable();
$table->string('stripe_subscription_id')->nullable();
```

### 3.5 Webhook handler
**Archivo:** `app/Http/Controllers/Api/WebhookController.php`

Agregar `handleStripe()`:
```php
// checkout.session.completed → activar suscripcion
// invoice.paid → renovar suscripcion
// invoice.payment_failed → marcar como fallida, notificar
// customer.subscription.deleted → cancelar suscripcion
```

### 3.6 Rutas
```php
Route::post('/webhooks/stripe', [WebhookController::class, 'handleStripe']);
```

### 3.7 Actualizar SubscriptionController
- `initiatePayment()` → crear Checkout Session en vez de Wompi widget
- `getCurrentSubscription()` → incluir info de Stripe
- Nuevo: `createBillingPortal()` → retorna URL del portal Stripe

### 3.8 Price resolver
Crear servicio que mapea plan + pais + ciclo → Stripe price_id:
```php
class StripePriceResolver {
    public function resolve(string $planSlug, string $countryCode, string $cycle): string {
        // Busca en config o BD el price_id correcto
    }
}
```

---

## 4. Frontend — Tareas de implementacion

### 4.1 SubscriptionPage.jsx
- Cuando `checkout_type === 'stripe_checkout'` → redirect a `session.url`
- No se usa widget (como Wompi) — redirect completo a Stripe

### 4.2 Callback pages
- `/subscription/success` → verificar estado, mostrar confirmacion
- `/subscription/cancel` → mostrar mensaje, boton para reintentar

### 4.3 Billing Portal
- Boton "Gestionar suscripcion" → llama API → abre URL del portal Stripe
- Portal permite: cambiar plan, actualizar tarjeta, cancelar, ver facturas

---

## 5. Flujo completo

```
1. Club selecciona plan en /home/subscription
2. Click "Suscribirse" → POST /api/subscriptions/initiate-payment
3. Backend:
   a. Crea Stripe Customer (si no existe)
   b. Crea Checkout Session con price_id del plan+pais+ciclo
   c. Retorna session.url
4. Frontend redirect a checkout.stripe.com
5. Club paga (tarjeta, OXXO, SPEI, etc.)
6. Stripe redirect a /subscription/success?session_id=xxx
7. Webhook llega: checkout.session.completed
8. Backend activa suscripcion en BD
9. Cada mes: Stripe cobra automatico
10. Webhook: invoice.paid → renueva en BD
11. Si falla: Stripe reintenta 3 veces → invoice.payment_failed → notifica
12. Si cancela: customer.subscription.deleted → desactiva modulos
```

---

## 6. Versionado de precios (grandfathering)

Para que clubes existentes mantengan su precio cuando suban los precios:

- Stripe maneja esto nativamente — cada suscripcion tiene su `price_id`
- Si creas nuevos prices, los existentes mantienen el precio viejo
- Para migrar un club al nuevo precio: actualizar `subscription.items` via API
- Super Admin puede ver y cambiar el price de cada club desde el panel

---

## 7. Testing (Stripe Test Mode)

```bash
# Tarjeta de prueba exitosa
4242 4242 4242 4242 | MM/YY futuro | CVC cualquiera

# Tarjeta que requiere 3D Secure
4000 0025 0000 3155

# Tarjeta que falla
4000 0000 0000 0002

# Webhook testing local
stripe listen --forward-to localhost:8010/api/webhooks/stripe
```

### CLI de Stripe (instalar)
```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:8010/api/webhooks/stripe
```

---

## 8. Costos por transaccion

| Tipo | Fee |
|------|-----|
| Tarjeta domestica USA | 2.9% + $0.30 |
| Tarjeta internacional | 2.9% + $0.30 + 1.5% |
| Conversion moneda | +1% |
| Stripe Billing (recurrente) | +0.5% |
| **Total tipico LATAM** | **~4.9% + $0.30** |
| OXXO (MX) | 3% + $10 MXN |
| SPEI (MX) | $7 MXN flat |

### Ejemplo Pro Plan Colombia ($129,000 COP ≈ $26 USD)
- Fee: ~$1.57 (4.9% + $0.30)
- Neto: ~$24.43 USD
- Anual: ~$293 USD por club

---

## 9. Orden de ejecucion recomendado

1. **Dashboard Stripe** — Products, Prices, Webhook, Portal (30 min)
2. **Backend** — SDK + StripeGateway + migracion + webhook (2-3 horas)
3. **Frontend** — Checkout redirect + callback + portal (1-2 horas)
4. **Probar en test mode** — crear suscripcion, renovar, cancelar (1 hora)
5. **Activar en produccion** — cambiar keys live, probar con tarjeta real
