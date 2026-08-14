# Plan de Reparación del Sistema de Suscripciones + Eliminación de dLocal

> **Para agentes ejecutores:** REQUIRED SUB-SKILL: usar `superpowers:subagent-driven-development` (recomendado) o `superpowers:executing-plans` para implementar tarea por tarea. Los pasos usan checkboxes (`- [ ]`).
> Origen: auditoría profunda del 13-jul-2026 (5 agentes + verificación manual). Ver memoria `subscription-system-audit-jul2026`.

**Goal:** Dejar el sistema de suscripciones de clubes listo para cobrar en producción: webhooks funcionando, dLocal eliminado (solo Stripe a futuro; Wompi/MercadoPago se conservan), módulos de planes alineados con el middleware, dunning mínimo, bypasses de expiración cerrados, portal de Stripe accesible desde la UI y funnel landing→app sin pérdida del plan elegido.

**Architecture:** Backend Laravel 12 (`saas_sport/`, repo git propio) + frontend React/Vite (`frontend/`, repo git propio) + landing Next.js (`landing/`, repo git propio). La fuente de verdad de la suscripción es la BD local (`PlaSubscription`), sincronizada por webhooks de Stripe/Wompi/MercadoPago. El gating vive en `CheckModuleAccess` (middleware `module.access:*`) + trait `ChecksSubscriptionLimits`.

**Tech Stack:** Laravel 12, Sanctum, stripe/stripe-php, MySQL, React 18 + Vite, react-i18next, Next.js (landing).

## Global Constraints (leer antes de cualquier tarea)

- **Ramas:** NUNCA trabajar en `main` (un push a `main` de `saas_sport` **despliega a producción automáticamente**). En `saas_sport` y `frontend` YA está checked out la rama `feature/subscription-ux` (vacía, = main): trabajar AHÍ, **no cambiar de rama ni crear otra** (hay worktrees y otras sesiones activas). En `landing`: si está en main, crear `feature/subscription-ux`. NUNCA hacer `git push` — los commits quedan locales; Miguel decide cuándo pushear.
- **⚠️ Árbol de trabajo compartido:** ambos repos tienen archivos modificados SIN commitear de OTRA sesión (torneos: `PublicTournamentController.php`, `BracketGeneratorService.php`, `PublicBracketView.jsx`, `organizer.json`, etc.). PROHIBIDO `git add -A`, `git add .`, `git stash` o `git checkout -- .`: stagear SIEMPRE rutas explícitas de los archivos propios de cada tarea.
- **Tests con otra sesión activa:** correr SIEMPRE con BD aislada: `TEST_DB_DATABASE=db_testing_b php artisan test --filter=...` (soportado en `tests/CreatesApplication.php`; `db_testing_b` ya existe). Si el runner es Docker: `docker compose exec -e TEST_DB_DATABASE=db_testing_b saas_sport_app php artisan test ...`
- **Commits limpios:** SIN "Generated with Claude Code" ni "Co-Authored-By: Claude". Mensajes concisos en inglés (convención del repo).
- **BD:** prohibido `migrate:fresh`/`db:seed` destructivo fuera de `db_testing`. Si hay otra sesión Claude corriendo tests, aislarse: `docker compose exec -e TEST_DB_DATABASE=db_testing_b saas_sport_app php artisan test`.
- **i18n:** todo texto nuevo de UI en inglés por defecto + claves EN/ES/PT. NO hardcodear español.
- **No tocar** Wompi ni MercadoPago (siguen activas para CO/LATAM). Solo se elimina dLocal.
- **Tests:** cada tarea backend corre `php artisan test --filter=<Test>` y al final de cada fase la suite completa (`php artisan test`). Frontend: `npm run lint` + `npm run build` al final de cada fase que lo toque.
- Comandos backend: desde `desarrollo/saas_sport/`. Si el entorno usa Docker: prefijo `docker compose exec saas_sport_app`.

### Decisiones ya tomadas (no re-preguntar)

| Decisión | Valor |
|---|---|
| Pasarela futura | Solo Stripe; Wompi/MP se mantienen como están; dLocal se elimina |
| Plan anual | Modelo "paga 12, recibe 13 meses" → `price_yearly = 12 × mensual`, `yearly_discount_percent = 8`. Coincide con `activateSubscription()` (addMonths(13)) y STRIPE-SETUP.md |
| Matriz de módulos | Ver Tarea 7 (Básico: operación núcleo + cobros; Pro: + documentos/reportes/torneos; Enterprise: + api/compliance/ncaa). Miguel puede ajustar las listas en un solo lugar (migración + seeder) |
| Sin suscripción (clubes legacy) | Sigue permitiendo todo (retrocompat). Lo que se cierra es el caso EXPIRADA |
| Precios USA | Sembrar USD: Básico $99 / Pro $199 / Enterprise $349 mensual (valores de STRIPE-SETUP.md y del fallback actual de la landing). Brasil queda pendiente (no sembrar BRL) |

---

# FASE 0 — Preparación (una sola vez)

### Task 0: Ramas de trabajo

**Files:** ninguno (git).

- [ ] **Step 0.1:** En `saas_sport/` y `frontend/`: verificar con `git branch --show-current` que la rama activa es `feature/subscription-ux`. Si es así, NO tocar nada de git (trabajar ahí). Si NO lo es, DETENERSE y reportar — otra sesión pudo haber cambiado el estado.
- [ ] **Step 0.2:** En `landing/`: `git branch --show-current`; si es `main`, crear `git checkout -b feature/subscription-ux`; si ya es una feature branch, trabajar ahí.

---

# FASE 1 — Reparar el pipeline de webhooks (CRÍTICO — sin esto no se puede cobrar)

**Contexto del bug (verificado):** la tabla `pla_club_teams_webhook_events` tiene columnas `gateway_id` (FK NOT NULL a `bas_payment_gateways`) y `gateway_event_id` (migración `2025_12_30_010007_create_pla_webhook_events_table.php`), pero `PaymentService::processWebhook` consulta/inserta `gateway`, `external_event_id`, `transaction_id`, `reference` (inexistentes) en `PaymentService.php:236-265`, FUERA del try/catch → **todo webhook lanza QueryException y responde 500**. Además la factura se busca por columna inexistente `gateway_reference` (`PaymentService.php:292`, `WebhookController.php:407`) cuando lo correcto es el scope `byReference` (`PlaSubscriptionInvoice.php:151`, busca en JSON `notes`). El índice único `webhook_idempotency_idx (gateway_id, gateway_event_id)` existe (migración `2026_01_25_100002`) pero nunca se escribe `gateway_event_id`.

### Task 1: Test de regresión del webhook (persistencia + idempotencia)

**Files:**
- Create: `saas_sport/tests/Feature/SubscriptionWebhookTest.php`

**Interfaces:**
- Produces: test `SubscriptionWebhookTest` que las Tareas 2-4 deben poner en verde. Usa mock de `PaymentGatewayFactory` para no depender de credenciales Stripe.

- [ ] **Step 1.1: Escribir el test que falla**

```php
<?php

namespace Tests\Feature;

use App\Models\BasPaymentGateway;
use App\Models\PlaWebhookEvent;
use App\Services\Payments\PaymentGatewayFactory;
use App\Services\Payments\PaymentGatewayInterface;
use App\Services\Payments\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class SubscriptionWebhookTest extends TestCase
{
    use RefreshDatabase;

    private function fakeGateway(array $eventData): PaymentGatewayInterface
    {
        $gateway = Mockery::mock(PaymentGatewayInterface::class);
        $gateway->shouldReceive('verifyWebhookSignature')->andReturn(true);
        $gateway->shouldReceive('processWebhookEvent')->andReturn($eventData);

        return $gateway;
    }

    private function paymentServiceWithFakeGateway(array $eventData): PaymentService
    {
        $factory = Mockery::mock(PaymentGatewayFactory::class);
        $factory->shouldReceive('getGateway')->andReturn($this->fakeGateway($eventData));
        $this->app->instance(PaymentGatewayFactory::class, $factory);

        return $this->app->make(PaymentService::class);
    }

    public function test_stripe_webhook_event_is_persisted_with_real_columns(): void
    {
        $stripeGw = BasPaymentGateway::firstOrCreate(
            ['slug' => 'stripe'],
            ['name' => 'Stripe', 'is_active' => true]
        );

        $payload = [
            'id' => 'evt_test_001',
            'type' => 'invoice.paid',
            'data' => ['object' => []],
        ];

        $service = $this->paymentServiceWithFakeGateway([
            'event_type' => 'invoice.paid',
            'subscription_id' => null,
        ]);

        $result = $service->processWebhook($payload, 'stripe', 'US', 'sig');

        $this->assertTrue($result['success'], 'processWebhook no debe lanzar QueryException');
        $this->assertDatabaseHas('pla_club_teams_webhook_events', [
            'gateway_id' => $stripeGw->id,
            'gateway_event_id' => 'evt_test_001',
            'event_type' => 'invoice.paid',
            'status' => PlaWebhookEvent::STATUS_PROCESSED,
        ]);
    }

    public function test_duplicate_webhook_event_is_ignored(): void
    {
        BasPaymentGateway::firstOrCreate(['slug' => 'stripe'], ['name' => 'Stripe', 'is_active' => true]);

        $payload = ['id' => 'evt_dup_001', 'type' => 'invoice.paid', 'data' => ['object' => []]];
        $eventData = ['event_type' => 'invoice.paid', 'subscription_id' => null];

        $service = $this->paymentServiceWithFakeGateway($eventData);
        $first = $service->processWebhook($payload, 'stripe', 'US', 'sig');
        $second = $service->processWebhook($payload, 'stripe', 'US', 'sig');

        $this->assertTrue($first['success']);
        $this->assertFalse($second['success']);
        $this->assertSame('duplicate', $second['error_type']);
        $this->assertSame(1, PlaWebhookEvent::where('gateway_event_id', 'evt_dup_001')->count());
    }

    public function test_failed_webhook_event_can_be_retried(): void
    {
        $gw = BasPaymentGateway::firstOrCreate(['slug' => 'stripe'], ['name' => 'Stripe', 'is_active' => true]);

        // Evento previo fallido con el mismo gateway_event_id
        PlaWebhookEvent::create([
            'gateway_id' => $gw->id,
            'gateway_event_id' => 'evt_retry_001',
            'event_type' => 'invoice.paid',
            'payload' => [],
            'status' => PlaWebhookEvent::STATUS_FAILED,
        ]);

        $payload = ['id' => 'evt_retry_001', 'type' => 'invoice.paid', 'data' => ['object' => []]];
        $service = $this->paymentServiceWithFakeGateway(['event_type' => 'invoice.paid', 'subscription_id' => null]);

        $result = $service->processWebhook($payload, 'stripe', 'US', 'sig');

        $this->assertTrue($result['success'], 'Un evento fallido debe poder reintentarse');
        $this->assertSame(1, PlaWebhookEvent::where('gateway_event_id', 'evt_retry_001')->count());
        $this->assertSame(
            PlaWebhookEvent::STATUS_PROCESSED,
            PlaWebhookEvent::where('gateway_event_id', 'evt_retry_001')->value('status')
        );
    }
}
```

Nota: si `BasPaymentGateway` exige más columnas NOT NULL al crear (revisar su migración `bas_payment_gateways`), añadir esos campos mínimos al `firstOrCreate` — no cambiar el test en lo demás.

- [ ] **Step 1.2: Verificar que falla**

Run: `php artisan test --filter=SubscriptionWebhookTest`
Expected: FAIL (QueryException por columna `gateway` inexistente, o `success=false`).

- [ ] **Step 1.3: Commit del test (rojo)**

```bash
git add tests/Feature/SubscriptionWebhookTest.php
git commit -m "test: add failing regression tests for subscription webhook pipeline"
```

### Task 2: Corregir `PaymentService::processWebhook` (columnas reales + idempotencia real + retry)

**Files:**
- Modify: `saas_sport/app/Services/Payments/PaymentService.php:224-265` (bloque desde el comentario "Verificar idempotencia" hasta el `create`, inclusive)
- Modify: import: añadir `use App\Models\BasPaymentGateway;` si no existe en el archivo

**Interfaces:**
- Consumes: `PlaWebhookEvent` (Task 4 limpia su modelo), índice único `webhook_idempotency_idx (gateway_id, gateway_event_id)`.
- Produces: `processWebhook(array $payload, string $gatewaySlug, string $countryCode, ?string $signature)` con el mismo contrato de retorno (`success`, `error`, `error_type`).

- [ ] **Step 2.1: Reemplazar el bloque roto**

Sustituir TODO el bloque actual entre la línea `// Verificar idempotencia: si ya procesamos este evento, retornar inmediatamente` y el cierre del `PlaWebhookEvent::create([...]);` (líneas ~234-265) por:

```php
        // Resolver la pasarela (la tabla usa FK gateway_id, no slug)
        $gatewayModel = BasPaymentGateway::where('slug', $gatewaySlug)->first();

        if (! $gatewayModel) {
            Log::error('Webhook de pasarela desconocida', ['gateway' => $gatewaySlug]);

            return [
                'success' => false,
                'error' => 'Unknown gateway',
                'error_type' => 'unknown_gateway',
            ];
        }

        $eventType = $gatewaySlug === 'stripe'
            ? ($payload['type'] ?? 'unknown')
            : ($payload['event'] ?? 'unknown');

        // Idempotencia: buscar evento previo con el mismo ID externo
        $webhookEvent = null;

        if ($externalEventId) {
            $existingEvent = PlaWebhookEvent::where('gateway_id', $gatewayModel->id)
                ->where('gateway_event_id', $externalEventId)
                ->first();

            if ($existingEvent && $existingEvent->status === PlaWebhookEvent::STATUS_PROCESSED) {
                Log::info('Webhook duplicado detectado, ignorando', [
                    'gateway' => $gatewaySlug,
                    'gateway_event_id' => $externalEventId,
                    'original_processed_at' => $existingEvent->processed_at,
                ]);

                return [
                    'success' => false,
                    'error' => 'Evento duplicado',
                    'error_type' => 'duplicate',
                ];
            }

            // Evento previo fallido/recibido: reutilizar la fila para reintentar
            if ($existingEvent) {
                $existingEvent->update([
                    'status' => PlaWebhookEvent::STATUS_RECEIVED,
                    'payload' => $payload,
                    'retry_count' => $existingEvent->retry_count + 1,
                ]);
                $webhookEvent = $existingEvent;
            }
        }

        // Registrar evento nuevo. El índice único (gateway_id, gateway_event_id)
        // corta la carrera entre webhooks concurrentes con el mismo evento.
        if (! $webhookEvent) {
            try {
                $webhookEvent = PlaWebhookEvent::create([
                    'gateway_id' => $gatewayModel->id,
                    'gateway_event_id' => $externalEventId,
                    'event_type' => $eventType,
                    'payload' => $payload,
                    'status' => PlaWebhookEvent::STATUS_RECEIVED,
                    'processing_result' => [
                        'transaction_id' => $transactionId,
                        'reference' => $reference,
                    ],
                ]);
            } catch (\Illuminate\Database\QueryException $e) {
                // 1062 = duplicate entry (otro proceso insertó el mismo evento primero)
                if (($e->errorInfo[1] ?? null) === 1062) {
                    return [
                        'success' => false,
                        'error' => 'Evento duplicado',
                        'error_type' => 'duplicate',
                    ];
                }
                throw $e;
            }
        }
```

- [ ] **Step 2.1b: Cast necesario en el modelo** — en `app/Models/PlaWebhookEvent.php`, añadir a `$casts` (sin este cast, el `create` del paso anterior falla al guardar el array):

```php
        'processing_result' => 'array',
```

- [ ] **Step 2.2: Buscar factura con el scope correcto**

En `PaymentService.php` (línea ~292, dentro del try), reemplazar:

```php
$invoice = PlaSubscriptionInvoice::where('gateway_reference', $eventReference)->first();
```

por:

```php
$invoice = PlaSubscriptionInvoice::byReference($eventReference)->first();
```

- [ ] **Step 2.3: Correr los tests**

Run: `php artisan test --filter=SubscriptionWebhookTest`
Expected: PASS los 3 tests.

- [ ] **Step 2.4: Commit**

```bash
git add app/Services/Payments/PaymentService.php
git commit -m "fix: webhook pipeline used nonexistent columns, breaking all subscription activations"
```

### Task 3: Corregir `WebhookController` (búsqueda por referencia)

**Files:**
- Modify: `saas_sport/app/Http/Controllers/Api/WebhookController.php:407` (dentro de `resolveStripeCountry`, Strategy 2)

- [ ] **Step 3.1:** Reemplazar en la línea ~407:

```php
$invoice = PlaSubscriptionInvoice::where('gateway_reference', $reference)->first();
```

por:

```php
$invoice = PlaSubscriptionInvoice::byReference($reference)->first();
```

- [ ] **Step 3.2:** Run: `php artisan test --filter=SubscriptionWebhookTest` → PASS. Luego `grep -rn "gateway_reference" app/` → los únicos resultados deben estar en `PlaSubscriptionInvoice.php` (accessor y scope) y en los `notes` JSON escritos.
- [ ] **Step 3.3: Commit**

```bash
git add app/Http/Controllers/Api/WebhookController.php
git commit -m "fix: resolve invoice by notes reference scope in Stripe country resolver"
```

### Task 4: Limpiar el modelo `PlaWebhookEvent`

**Files:**
- Modify: `saas_sport/app/Models/PlaWebhookEvent.php`

- [ ] **Step 4.1:** Quitar del `$fillable` las columnas fantasma `external_event_id`, `transaction_id`, `reference` (líneas 15-17). (El cast de `processing_result` ya se añadió en Task 2.)
- [ ] **Step 4.2:** Corregir `scopeByGateway` (líneas 79-82):

```php
    /**
     * Scope por pasarela (por slug)
     */
    public function scopeByGateway($query, string $gatewaySlug)
    {
        return $query->whereHas('gateway', fn ($q) => $q->where('slug', $gatewaySlug));
    }

    public function gateway()
    {
        return $this->belongsTo(BasPaymentGateway::class, 'gateway_id');
    }
```

(añadir `use App\Models\BasPaymentGateway;` no es necesario — mismo namespace).

- [ ] **Step 4.3:** Run: `php artisan test --filter=SubscriptionWebhookTest` → PASS. Después suite completa: `php artisan test` → sin regresiones nuevas.
- [ ] **Step 4.4: Commit**

```bash
git add app/Models/PlaWebhookEvent.php
git commit -m "fix: align PlaWebhookEvent fillable and gateway scope with real schema"
```

---

# FASE 2 — Eliminar dLocal (solo Stripe a futuro; Wompi/MP intactas)

**Inventario verificado de referencias dLocal:** `app/Services/Payments/DLocalGateway.php` (archivo completo), `PaymentGatewayFactory.php:23`, `WebhookController.php:10` (import) y `:443-510` (`handleDLocal`, que además llama `processWebhook` con la firma equivocada — TypeError), `routes/api.php:558`, `SubscriptionController.php:226` (validación `in:`), `PaymentService::extractExternalEventId` (rama `dlocal`), `DLocalGateway.php:190` (URL webhook interna, muere con el archivo), frontend `SubscriptionPage.jsx:255` (comentario) y `:719-720` (descripción del gateway). No hay referencias en seeders ni en `docs/`.

### Task 5: Eliminar dLocal del backend

**Files:**
- Delete: `saas_sport/app/Services/Payments/DLocalGateway.php`
- Modify: `saas_sport/app/Services/Payments/PaymentGatewayFactory.php:23` y su import de `DLocalGateway`
- Modify: `saas_sport/app/Http/Controllers/Api/WebhookController.php` (import línea 10 + método `handleDLocal` completo, líneas ~443-512)
- Modify: `saas_sport/routes/api.php:558`
- Modify: `saas_sport/app/Http/Controllers/Api/SubscriptionController.php:226`
- Modify: `saas_sport/app/Services/Payments/PaymentService.php` (rama dlocal de `extractExternalEventId`)

- [ ] **Step 5.1:** `rm app/Services/Payments/DLocalGateway.php`
- [ ] **Step 5.2:** En `PaymentGatewayFactory.php`: eliminar la línea `'dlocal' => DLocalGateway::class,` y el `use App\Services\Payments\DLocalGateway;` (o el import equivalente).
- [ ] **Step 5.3:** En `WebhookController.php`: eliminar `use App\Services\Payments\DLocalGateway;` (línea 10) y el método `handleDLocal` completo con su docblock (líneas ~443-512).
- [ ] **Step 5.4:** En `routes/api.php`: eliminar la línea 558 `Route::post('/dlocal', [WebhookController::class, 'handleDLocal']);`
- [ ] **Step 5.5:** En `SubscriptionController.php:226`: cambiar `'gateway' => 'nullable|string|in:stripe,wompi,dlocal,mercadopago',` por `'gateway' => 'nullable|string|in:stripe,wompi,mercadopago',`
- [ ] **Step 5.6:** En `PaymentService.php`, dentro de `extractExternalEventId`, eliminar el bloque:

```php
        // dLocal usa el ID del pago como identificador único
        if ($gateway === 'dlocal') {
            return $payload['id']
                ?? $payload['payment_id']
                ?? $payload['event_id']
                ?? null;
        }
```

- [ ] **Step 5.7:** Verificar cero referencias: `grep -rni "dlocal" app/ routes/ config/ database/ tests/` → sin resultados. Si aparece alguna fila `dlocal` en `bas_payment_gateways` de BD local, NO borrarla por SQL (solo código); anotar en el resumen final que en prod se desactiva desde el panel Pasarelas.
- [ ] **Step 5.8:** Run: `php artisan test` → verde (o mismos fallos preexistentes que antes de la fase).
- [ ] **Step 5.9: Commit**

```bash
git add app/Services/Payments/DLocalGateway.php app/Services/Payments/PaymentGatewayFactory.php app/Http/Controllers/Api/WebhookController.php routes/api.php app/Http/Controllers/Api/SubscriptionController.php app/Services/Payments/PaymentService.php
git commit -m "refactor: remove dLocal gateway (Stripe-only strategy going forward)"
```

### Task 6: Eliminar dLocal del frontend

**Files:**
- Modify: `frontend/src/pages/dashboard/SubscriptionPage.jsx:255` y `:719-720`

- [ ] **Step 6.1:** Línea 255: cambiar el comentario `// Stripe Checkout / MercadoPago / dLocal: redirect flow` por `// Stripe Checkout / MercadoPago: redirect flow`
- [ ] **Step 6.2:** Eliminar las dos líneas de la descripción del selector de pasarela (~719-720):

```jsx
                                        {gw.slug === 'dlocal' &&
                                          'PIX, OXXO, PSE, Rapipago, Boleto'}
```

- [ ] **Step 6.3:** `grep -rni "dlocal" src/` → sin resultados. Run: `npm run lint` (sin errores nuevos) y `npm run build` → OK.
- [ ] **Step 6.4: Commit** (en `frontend/`)

```bash
git add src/pages/dashboard/SubscriptionPage.jsx
git commit -m "refactor: remove dLocal references from subscription checkout"
```

---

# FASE 3 — Alinear módulos de los planes con el middleware (CRÍTICO para cobrar sin romper al cliente)

**Contexto:** las rutas gatean `charges, discounts, documents, inventory, tournaments, compliance, ncaa, payments, reports` (`routes/api.php`, grupos `module.access:*`), pero los planes solo incluyen `players, trainers, categories, payments, calendar, sessions, reports, api` (`SubscriptionPlansSeeder.php:42,61,80`). Un club Básico pagado fuera de trial recibiría 403 en cobros/documentos/torneos. Además el menú frontend mapea `/home/sessions`→`sessions` y `/home/attendance`→`sessions` (`MenuList.jsx`, `routeToModuleMap`) mientras el backend no gatea sessions → inconsistencia.

**Matriz objetivo (ajustable por Miguel editando SOLO la migración y el seeder):**

| Módulo | basico | pro | enterprise |
|---|---|---|---|
| players, trainers, categories, sessions, attendance, calendar, payments, charges, notifications | ✅ | ✅ | ✅ |
| discounts, documents, reports, tournaments, inventory, locations, file_vault | ❌ | ✅ | ✅ |
| api, compliance, ncaa | ❌ | ❌ | ✅ |

### Task 7: Migración de datos + seeder con la matriz alineada

**Files:**
- Create: `saas_sport/database/migrations/2026_07_14_000001_align_plan_enabled_modules.php`
- Modify: `saas_sport/database/seeders/SubscriptionPlansSeeder.php:42,61,80`
- Test: `saas_sport/tests/Feature/PlanModulesAlignmentTest.php` (create)

- [ ] **Step 7.1: Test que falla** — crear `tests/Feature/PlanModulesAlignmentTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\BasSubscriptionPlan;
use Database\Seeders\SubscriptionPlansSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlanModulesAlignmentTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Toda clave exigida por module.access en routes/api.php debe estar
     * incluida en al menos un plan; y el plan pagado más barato debe
     * incluir los módulos de operación diaria.
     */
    public function test_paid_plans_include_the_module_keys_gated_by_routes(): void
    {
        $this->seed(SubscriptionPlansSeeder::class);

        $basico = BasSubscriptionPlan::where('slug', 'basico')->firstOrFail();
        $pro = BasSubscriptionPlan::where('slug', 'pro')->firstOrFail();
        $enterprise = BasSubscriptionPlan::where('slug', 'enterprise')->firstOrFail();

        foreach (['payments', 'charges', 'sessions', 'attendance', 'notifications'] as $core) {
            $this->assertContains($core, $basico->enabled_modules, "basico debe incluir {$core}");
        }

        foreach (['discounts', 'documents', 'reports', 'tournaments', 'inventory', 'locations', 'file_vault'] as $mod) {
            $this->assertContains($mod, $pro->enabled_modules, "pro debe incluir {$mod}");
        }

        foreach (['api', 'compliance', 'ncaa'] as $mod) {
            $this->assertContains($mod, $enterprise->enabled_modules, "enterprise debe incluir {$mod}");
        }

        // Ninguna clave gateada en rutas puede quedar fuera de todos los planes
        $routesFile = file_get_contents(base_path('routes/api.php'));
        preg_match_all("/module\.access:([a-z_]+)/", $routesFile, $matches);
        $gatedKeys = array_unique($matches[1]);
        $allPlanModules = array_unique(array_merge(
            $basico->enabled_modules, $pro->enabled_modules, $enterprise->enabled_modules
        ));

        foreach ($gatedKeys as $key) {
            $this->assertContains($key, $allPlanModules, "La clave '{$key}' está gateada en rutas pero no existe en ningún plan");
        }
    }
}
```

- [ ] **Step 7.2:** Run: `php artisan test --filter=PlanModulesAlignmentTest` → FAIL.
- [ ] **Step 7.3: Actualizar el seeder** — en `SubscriptionPlansSeeder.php` reemplazar las 3 líneas `'enabled_modules' => [...]`:

```php
// basico (línea ~42):
'enabled_modules' => ['players', 'trainers', 'categories', 'sessions', 'attendance', 'calendar', 'payments', 'charges', 'notifications'],
// pro (línea ~61):
'enabled_modules' => ['players', 'trainers', 'categories', 'sessions', 'attendance', 'calendar', 'payments', 'charges', 'notifications', 'discounts', 'documents', 'reports', 'tournaments', 'inventory', 'locations', 'file_vault'],
// enterprise (línea ~80):
'enabled_modules' => ['players', 'trainers', 'categories', 'sessions', 'attendance', 'calendar', 'payments', 'charges', 'notifications', 'discounts', 'documents', 'reports', 'tournaments', 'inventory', 'locations', 'file_vault', 'api', 'compliance', 'ncaa'],
```

- [ ] **Step 7.4: Migración de datos** (para prod, donde no se corre el seeder) — crear `database/migrations/2026_07_14_000001_align_plan_enabled_modules.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Alinea enabled_modules de los planes existentes con las claves
 * que exige el middleware module.access. Sin esto, un club pagado
 * fuera de trial recibe 403 en cobros/documentos/torneos.
 */
return new class extends Migration
{
    private const MODULES = [
        'basico' => ['players', 'trainers', 'categories', 'sessions', 'attendance', 'calendar', 'payments', 'charges', 'notifications'],
        'pro' => ['players', 'trainers', 'categories', 'sessions', 'attendance', 'calendar', 'payments', 'charges', 'notifications', 'discounts', 'documents', 'reports', 'tournaments', 'inventory', 'locations', 'file_vault'],
        'enterprise' => ['players', 'trainers', 'categories', 'sessions', 'attendance', 'calendar', 'payments', 'charges', 'notifications', 'discounts', 'documents', 'reports', 'tournaments', 'inventory', 'locations', 'file_vault', 'api', 'compliance', 'ncaa'],
    ];

    public function up(): void
    {
        foreach (self::MODULES as $slug => $modules) {
            DB::table('bas_subscription_plans')
                ->where('slug', $slug)
                ->update(['enabled_modules' => json_encode($modules)]);
        }
    }

    public function down(): void
    {
        // Sin rollback de datos: los valores previos eran incorrectos.
    }
};
```

- [ ] **Step 7.5:** Run: `php artisan migrate` (BD local) y `php artisan test --filter=PlanModulesAlignmentTest` → PASS.
- [ ] **Step 7.6: Commit**

```bash
git add database/ tests/Feature/PlanModulesAlignmentTest.php
git commit -m "fix: align plan enabled_modules with module.access route keys"
```

### Task 8: Cerrar los módulos sin gating en backend y sincronizar el menú

**Files:**
- Modify: `saas_sport/routes/api.php` — grupos de sessions (~839-843), categories (~748-752), import-export (~993-1000), payment-config (~963-965)
- Modify: `frontend/src/layouts/MenuList.jsx` — `routeToModuleMap` (~línea 61+)

- [ ] **Step 8.1:** En `routes/api.php`, envolver (añadiendo el middleware al grupo existente, siguiendo el patrón exacto de los grupos vecinos que ya usan `module.access:`):
  - Grupo de **sessions** (línea ~839; SOLO las rutas de sesiones de entrenamiento, NO las de attendance si están en grupo aparte) → `->middleware('module.access:sessions')`
  - Grupo de **categories** (línea ~748) → `->middleware('module.access:categories')`
  - Grupo de **import-export** (línea ~993) → `->middleware('module.access:reports')`
  - Grupo de **payment-config** (línea ~963) → `->middleware('module.access:payments')`
  Si sessions y attendance comparten grupo, separar attendance a un grupo sin gating (attendance es core: `CheckModuleAccess::CORE_MODULES` ya la incluye, `CheckModuleAccess.php:60-65`).
- [ ] **Step 8.2:** En `MenuList.jsx` `routeToModuleMap`: cambiar el mapeo de `/home/attendance` para que NO apunte a `'sessions'` (eliminar esa entrada — attendance es core y nunca se bloquea). Mantener `/home/sessions` → `'sessions'` y `/home/categories` → `'categories'` (ahora consistentes: todos los planes las incluyen; solo se bloquean expirados post-gracia).
- [ ] **Step 8.3:** Verificación backend: `php artisan route:list | grep -iE "sessions|categories|import|payment-config"` → los grupos muestran el middleware. Suite: `php artisan test` → si algún test de sessions/categories falla por 403, es porque el club del test no tiene suscripción con el módulo — revisar que el club de test no tenga sub (sin sub = permitido) antes de tocar el test.
- [ ] **Step 8.4: Commits** (uno por repo)

```bash
# saas_sport
git add routes/api.php
git commit -m "fix: gate sessions, categories, import-export and payment-config routes by plan module"
# frontend
git add src/layouts/MenuList.jsx
git commit -m "fix: attendance is a core module, never plan-locked in menu"
```

### Task 9: Eliminar código muerto de gating

**Files:**
- Delete: `saas_sport/app/Http/Middleware/CheckSubscriptionLimits.php` (registrado en `bootstrap/app.php` pero jamás cableado a rutas — el enforcement real es el trait `ChecksSubscriptionLimits`)
- Modify: `saas_sport/bootstrap/app.php:102-103` (quitar el alias `subscription.limits`)
- Delete: `frontend/src/components/guards/ModuleGuard.jsx` y `frontend/src/hooks/useModuleAccess.js` (0 usos verificados; solo se referencian desde `guards/index.js`)
- Modify: `frontend/src/components/guards/index.js` (quitar el export de ModuleGuard)

- [ ] **Step 9.1:** Backend: eliminar archivo + alias. `grep -rn "subscription.limits\|CheckSubscriptionLimits" app/ routes/ bootstrap/` → sin resultados. `php artisan test` → verde.
- [ ] **Step 9.2:** Frontend: eliminar los 2 archivos, limpiar `guards/index.js`. `grep -rn "ModuleGuard\|useModuleAccess" src/` → sin resultados. `npm run build` → OK.
  - NOTA: si se prefiere montarlo en vez de borrarlo, es decisión de Miguel — el default de este plan es BORRAR (el bloqueo real es backend + candados de menú). No implementar ambas cosas.
- [ ] **Step 9.3: Commits**

```bash
# saas_sport
git add app/Http/Middleware/CheckSubscriptionLimits.php bootstrap/app.php && git commit -m "refactor: remove dead CheckSubscriptionLimits middleware (trait is the enforcement point)"
# frontend
git add src/components/guards/ModuleGuard.jsx src/hooks/useModuleAccess.js src/components/guards/index.js && git commit -m "refactor: remove unused ModuleGuard and useModuleAccess dead code"
```

---

# FASE 4 — Cerrar bypasses de expiración y estado expirado visible

### Task 10: Club expirado no puede crear recursos sin límite

**Files:**
- Modify: `saas_sport/app/Http/Controllers/Traits/ChecksSubscriptionLimits.php:33-49`
- Test: `saas_sport/tests/Feature/SubscriptionLimitsExpiredTest.php` (create)

- [ ] **Step 10.1: Test que falla** — el trait hoy permite TODO a un club con sub expirada (cae en la rama "sin suscripción"). Crear `tests/Feature/SubscriptionLimitsExpiredTest.php`. Usar el trait de setup existente `tests/Traits/CreatesClubWithRoles.php` para crear club+owner (leerlo primero para los nombres exactos de sus métodos):

```php
<?php

namespace Tests\Feature;

use App\Models\BasSubscriptionPlan;
use App\Models\PlaSubscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesClubWithRoles;

class SubscriptionLimitsExpiredTest extends TestCase
{
    use CreatesClubWithRoles, RefreshDatabase;

    public function test_expired_subscription_blocks_player_creation(): void
    {
        // setup: club + owner autenticado (usar helpers de CreatesClubWithRoles)
        [$club, $owner] = $this->createClubWithOwner(); // ajustar al nombre real del helper

        $plan = BasSubscriptionPlan::factory()->create(['max_members' => 80]);
        PlaSubscription::withoutGlobalScopes()->create([
            'club_id' => $club->id,
            'plan_id' => $plan->id,
            'status' => PlaSubscription::STATUS_EXPIRED,
            'billing_cycle' => 'monthly',
            'current_period_start' => now()->subMonths(2),
            'current_period_end' => now()->subMonth(), // fuera de gracia (7 días)
        ]);

        $response = $this->actingAs($owner)->postJson(
            "/api/pla_club_teams/{$club->id}/players",
            $this->validPlayerPayload($club) // helper local con payload mínimo válido
        );

        $response->assertStatus(403)
            ->assertJsonPath('error', 'subscription_expired');
    }
}
```

Si `BasSubscriptionPlan` no tiene factory, crear la fila con `BasSubscriptionPlan::create([...])` copiando los campos mínimos del seeder (slug único). El endpoint y payload de creación de jugador: tomarlos de un test existente de players si lo hay (`grep -rn "players" tests/Feature/ | grep -i post`); si no existe ninguno, ejercitar el trait directamente instanciando un controller de test — lo que importa es cubrir `checkSubscriptionLimit` con sub expirada.

- [ ] **Step 10.2:** Run → FAIL (hoy responde 200/201).
- [ ] **Step 10.3: Fix del trait** — en `ChecksSubscriptionLimits.php`, reemplazar el bloque de obtención de la suscripción (líneas 33-49) por:

```php
        // Última suscripción del club, en cualquier estado
        $subscription = PlaSubscription::withoutGlobalScopes()
            ->where('club_id', $club->id)
            ->orderByDesc('current_period_end')
            ->with('plan')
            ->first();

        // Sin suscripción = permitir (retrocompat con clubes legacy)
        if (! $subscription) {
            return;
        }

        // Vencida y fuera del período de gracia → bloquear creación
        $isCurrent = in_array($subscription->status, [PlaSubscription::STATUS_TRIAL, PlaSubscription::STATUS_ACTIVE])
            && $subscription->current_period_end > now();

        if (! $isCurrent && ! $subscription->isInGracePeriod()) {
            abort(response()->json([
                'error' => 'subscription_expired',
                'message' => 'Your subscription has expired. Renew your plan to keep adding resources.',
                'action_required' => 'renew',
                'current_plan' => $subscription->plan?->name,
            ], 403));
        }

        $plan = $subscription->plan;
        if (! $plan) {
            return;
        }
```

(el resto del método — conteos y `allowsMore*` — queda igual: en gracia se siguen aplicando los límites del plan).

- [ ] **Step 10.4:** Run: `php artisan test --filter=SubscriptionLimitsExpiredTest` → PASS. Suite completa → sin regresiones (ojo: tests que crean jugadores en clubes con sub de test activa siguen pasando porque `isCurrent`).
- [ ] **Step 10.5: Commit**

```bash
git add app/Http/Controllers/Traits/ChecksSubscriptionLimits.php tests/Feature/SubscriptionLimitsExpiredTest.php
git commit -m "fix: expired subscriptions could create unlimited resources"
```

### Task 11: Exponer la suscripción expirada al frontend + permitir re-trial legítimo

**Files:**
- Modify: `saas_sport/app/Http/Controllers/Api/SubscriptionController.php` — `getCurrentSubscription` (~línea 163) y `startTrial` (~415)

- [ ] **Step 11.1:** En `getCurrentSubscription`, reemplazar la consulta:

```php
        $subscription = PlaSubscription::withoutGlobalScopes()
            ->where('club_id', $club->id)
            ->whereIn('status', [PlaSubscription::STATUS_ACTIVE, PlaSubscription::STATUS_TRIAL, PlaSubscription::STATUS_PAST_DUE])
            ->with(['plan'])
            ->first();
```

por:

```php
        $subscription = PlaSubscription::withoutGlobalScopes()
            ->where('club_id', $club->id)
            ->whereIn('status', [
                PlaSubscription::STATUS_ACTIVE,
                PlaSubscription::STATUS_TRIAL,
                PlaSubscription::STATUS_PAST_DUE,
                PlaSubscription::STATUS_EXPIRED,
            ])
            ->orderByDesc('current_period_end')
            ->with(['plan'])
            ->first();
```

y añadir al array `subscription` de la respuesta (junto a `is_trial`):

```php
                    'is_in_grace_period' => $subscription->isInGracePeriod(),
                    'grace_period_ends_at' => $subscription->current_period_end?->copy()->addDays(PlaSubscription::GRACE_PERIOD_DAYS)->format('Y-m-d'),
```

- [ ] **Step 11.2:** En `startTrial`, reemplazar el chequeo `exists()` sobre cualquier sub previa por: bloquear solo si hay una sub vigente O si el club ya consumió un trial antes:

```php
        $blockingSubscription = PlaSubscription::withoutGlobalScopes()
            ->where('club_id', $club->id)
            ->where(function ($q) {
                $q->whereIn('status', [
                    PlaSubscription::STATUS_TRIAL,
                    PlaSubscription::STATUS_ACTIVE,
                    PlaSubscription::STATUS_PAST_DUE,
                ])
                    ->orWhereNotNull('trial_ends_at'); // ya usó un trial alguna vez
            })
            ->exists();

        if ($blockingSubscription) {
            return response()->json([
                'success' => false,
                'message' => 'Ya tienes una suscripción o ya usaste tu período de prueba',
            ], 400);
        }
```

- [ ] **Step 11.3:** Run: `php artisan test` → verde. Verificar manualmente el shape: `php artisan tinker --execute="..."` no es necesario; basta la suite + el uso en Fase 5 frontend.
- [ ] **Step 11.4: Commit**

```bash
git add app/Http/Controllers/Api/SubscriptionController.php
git commit -m "fix: expose expired subscription state and allow resubscribe after non-trial history"
```

---

# FASE 5 — Dunning mínimo + arreglos de notificaciones

### Task 12: Bug de dedup — la renovación debe resetear los avisos de vencimiento

**Files:**
- Modify: `saas_sport/app/Services/Payments/PaymentService.php` — bloque de renovación `invoice.paid` (~línea 630, el `$subscription->update([...])`) y `activateSubscription()` (~línea 415)
- Test: `saas_sport/tests/Feature/SubscriptionNotificationDedupTest.php` (create)

- [ ] **Step 12.1: Test que falla:**

```php
<?php

namespace Tests\Feature;

use App\Models\BasPaymentGateway;
use App\Models\BasSubscriptionPlan;
use App\Models\PlaClubTeam;
use App\Models\PlaSubscription;
use App\Services\Payments\PaymentGatewayFactory;
use App\Services\Payments\PaymentGatewayInterface;
use App\Services\Payments\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class SubscriptionNotificationDedupTest extends TestCase
{
    use RefreshDatabase;

    public function test_renewal_clears_expiring_notification_metadata(): void
    {
        BasPaymentGateway::firstOrCreate(['slug' => 'stripe'], ['name' => 'Stripe', 'is_active' => true]);
        $plan = BasSubscriptionPlan::first() ?? BasSubscriptionPlan::create([
            'name' => 'Pro', 'slug' => 'pro', 'is_active' => true, 'trial_days' => 14,
        ]);
        $club = PlaClubTeam::factory()->create(); // si no hay factory: crear con campos mínimos de un test existente

        $subscription = PlaSubscription::withoutGlobalScopes()->create([
            'club_id' => $club->id,
            'plan_id' => $plan->id,
            'status' => PlaSubscription::STATUS_ACTIVE,
            'billing_cycle' => 'monthly',
            'current_period_start' => now()->subMonth(),
            'current_period_end' => now()->addDays(3),
            'gateway_subscription_id' => 'sub_test_123',
            'metadata' => [
                'expiring_notified_7d_at' => now()->subDays(4)->toISOString(),
                'expiring_notified_3d_at' => now()->toISOString(),
            ],
        ]);

        $gateway = Mockery::mock(PaymentGatewayInterface::class);
        $gateway->shouldReceive('verifyWebhookSignature')->andReturn(true);
        $gateway->shouldReceive('processWebhookEvent')->andReturn([
            'event_type' => 'invoice.paid',
            'subscription_id' => 'sub_test_123',
            'amount_in_cents' => 12900000,
            'transaction_id' => 'in_test_1',
        ]);
        $factory = Mockery::mock(PaymentGatewayFactory::class);
        $factory->shouldReceive('getGateway')->andReturn($gateway);
        $this->app->instance(PaymentGatewayFactory::class, $factory);

        $service = $this->app->make(PaymentService::class);
        $service->processWebhook(
            ['id' => 'evt_renew_1', 'type' => 'invoice.paid', 'data' => ['object' => []]],
            'stripe', 'US', 'sig'
        );

        $metadata = $subscription->fresh()->metadata ?? [];
        $this->assertArrayNotHasKey('expiring_notified_7d_at', $metadata);
        $this->assertArrayNotHasKey('expiring_notified_3d_at', $metadata);
    }
}
```

- [ ] **Step 12.2:** Run → FAIL (las claves siguen presentes).
- [ ] **Step 12.3: Fix** — en `PaymentService`, añadir un helper privado y usarlo en los DOS puntos:

```php
    /**
     * Al renovar/activar, limpiar los marcadores de "aviso de vencimiento enviado"
     * para que el ciclo siguiente vuelva a notificar -7d/-3d.
     */
    protected function clearExpiringNotificationMarkers(PlaSubscription $subscription): array
    {
        return collect($subscription->metadata ?? [])
            ->reject(fn ($v, $k) => str_starts_with($k, 'expiring_notified_'))
            ->toArray();
    }
```

En el bloque de renovación (`invoice.paid`, `$subscription->update([...])` ~línea 630), añadir al array del update:

```php
                            'metadata' => $this->clearExpiringNotificationMarkers($subscription),
```

En `activateSubscription()` esto no aplica (crea una suscripción nueva, sin metadata heredada) — no tocar.

- [ ] **Step 12.4:** Run: `php artisan test --filter=SubscriptionNotificationDedupTest` → PASS.
- [ ] **Step 12.5: Commit**

```bash
git add app/Services/Payments/PaymentService.php tests/Feature/SubscriptionNotificationDedupTest.php
git commit -m "fix: renewal now resets expiring-notification dedup markers"
```

### Task 13: Email de pago fallido (dunning) + recibo de pago

**Files:**
- Create: `saas_sport/app/Mail/SubscriptionPaymentFailedMail.php`
- Create: `saas_sport/app/Mail/SubscriptionPaymentReceiptMail.php`
- Create: vistas blade correspondientes (misma carpeta/estructura que las de `SubscriptionExpiredMail` — **leer primero** `app/Mail/SubscriptionExpiredMail.php` para copiar su estructura exacta de Envelope/Content y la vista que usa como plantilla base)
- Modify: `saas_sport/app/Services/Payments/PaymentService.php` — caso `invoice.payment_failed` (~línea 674) y bloque de renovación + `activateSubscription`

- [ ] **Step 13.1:** Leer `app/Mail/SubscriptionExpiredMail.php` y su blade. Crear `SubscriptionPaymentFailedMail` con la MISMA estructura, constructor `public function __construct(public PlaSubscription $subscription)`, subject `'Action needed: your Widdo payment failed'` y cuerpo (en la vista): aviso de pago fallido, intentos (`$subscription->failed_payment_attempts`), CTA a `https://app.widdo.co/home/subscription`, y nota de que Stripe reintentará automáticamente.
- [ ] **Step 13.2:** Crear `SubscriptionPaymentReceiptMail` igual pero con constructor `public function __construct(public PlaSubscriptionInvoice $invoice)`, subject `'Your Widdo payment receipt'`, cuerpo: plan, monto (`$invoice->total_cents / 100` + `$invoice->currency_code`), número de factura (`invoice_number`), período (`period_start`–`period_end`).
**Estrategia de recibos (decisión 13-jul, tras ver el ejemplo de Anthropic):** para pagos por **Stripe**, el invoice+receipt los envía **Stripe nativo** en un solo email (igual que Anthropic — se activa en el Dashboard, ver pendiente manual #4; branding con logo Widdo en Stripe → Settings → Branding). Por eso el `SubscriptionPaymentReceiptMail` de Widdo se envía **solo para pagos no-Stripe** (Wompi/MercadoPago), para no duplicar. El `SubscriptionPaymentFailedMail` (dunning) sí es de Widdo para TODAS las pasarelas.

- [ ] **Step 13.3:** Despachos en `PaymentService` (añadir helper para el owner, reutilizado en ambos):

```php
    /**
     * Email del owner del club (para notificaciones de suscripción).
     */
    protected function getOwnerEmail(int $clubId): ?string
    {
        return \App\Models\UserClubRole::where('club_id', $clubId)
            ->where('role', 'owner')
            ->where('status', 'ACT')
            ->with('user')
            ->first()?->user?->email;
    }
```

En el caso `invoice.payment_failed` (~línea 674), después del `$subscription->update([...])`:

```php
                        if ($email = $this->getOwnerEmail($subscription->club_id)) {
                            Mail::to($email)->queue(
                                (new \App\Mail\SubscriptionPaymentFailedMail($subscription->fresh()))
                                    ->onQueue('notifications')
                            );
                        }
```

El recibo Widdo va SOLO en la ruta no-Stripe: en `processTransactionStatus` (Wompi/MercadoPago), caso `'approved'`, después de `$this->activateSubscription($invoice);`:

```php
            case 'approved':
                if ($invoice->status !== 'paid') {
                    $this->activateSubscription($invoice);

                    if ($email = $this->getOwnerEmail($invoice->club_id)) {
                        Mail::to($email)->queue(
                            (new \App\Mail\SubscriptionPaymentReceiptMail($invoice->fresh()))
                                ->onQueue('notifications')
                        );
                    }
                }
                break;
```

NO añadir el recibo en `processStripeEvent` ni en `activateSubscription`: los pagos Stripe reciben el invoice+receipt nativo de Stripe (mismo email, dos PDFs, como Anthropic) — ver pendiente manual #4.

Añadir `use Illuminate\Support\Facades\Mail;` si no está importado en `PaymentService.php`.

- [ ] **Step 13.4: Test** — añadir a `SubscriptionNotificationDedupTest` (o archivo nuevo `SubscriptionDunningMailTest.php`) tests con `Mail::fake()`:
  1. Webhook Stripe `invoice.payment_failed` (mismo patrón de mock que Task 12) sobre una sub con owner → `Mail::assertQueued(SubscriptionPaymentFailedMail::class)`.
  2. Webhook Wompi `transaction.updated` con status `approved` sobre factura pendiente (mock del gateway con `event_type => 'transaction.updated'`, `status => 'approved'`, `reference` de la factura) → `Mail::assertQueued(SubscriptionPaymentReceiptMail::class)`.
  3. Renovación Stripe (`invoice.paid`, como en Task 12) → `Mail::assertNotQueued(SubscriptionPaymentReceiptMail::class)` (Stripe envía su propio invoice+receipt nativo).
  Nota: el club debe tener un `UserClubRole` owner con user — crear en el setup.
- [ ] **Step 13.5:** Run: `php artisan test --filter=Dunning` (y `--filter=SubscriptionNotificationDedupTest`) → PASS.
- [ ] **Step 13.6: Commit**

```bash
git add app/Mail/ resources/views/ app/Services/Payments/PaymentService.php tests/
git commit -m "feat: dunning email on failed payment and receipt email on activation/renewal"
```

### Task 13b: PDF de recibo con marca Widdo adjunto al email (solo pagos Wompi/MP)

**Alcance:** este PDF acompaña al `SubscriptionPaymentReceiptMail`, que solo se envía en pagos no-Stripe (ver estrategia en Task 13). Para Stripe, el invoice+receipt PDF los genera y envía Stripe nativo. Mientras Widdo opere solo en USA/Stripe, esta tarea es infraestructura dormida para LATAM — implementarla igual (es barata y completa el sistema), pero si hay que recortar alcance, es la primera candidata a posponer.

**Diseño aprobado (mockup):** hoja blanca imprimible; wordmark "widdo." con punto verde; badge PAID verde; bloques From/Billed to; tabla Description/Period/Amount; totales con regla superior verde `#00A845` y "Total paid"; línea "Paid with Visa •••• 4242 via Stripe on {fecha}"; footer support@widdo.co · widdo.co. Número `INV-2026-XXXXX` y montos en monospace con `tabular-nums`. Tipografía Inter. Idioma del documento = idioma del club (EN default, ES/PT). Mockup de referencia: artifact "Recibo Widdo — diseño propuesto" (13-jul).

**Files:**
- Create: `saas_sport/resources/views/pdf/subscription-receipt.blade.php`
- Create: `saas_sport/app/Services/SubscriptionReceiptPdfService.php`
- Modify: `saas_sport/app/Mail/SubscriptionPaymentReceiptMail.php` (adjuntar PDF)

- [ ] **Step 13b.1:** Leer el servicio Gotenberg existente (`grep -rn "Gotenberg" app/Services/ config/` — hay un patrón de servicio PDF ya montado que reemplazó a dompdf). Crear `SubscriptionReceiptPdfService` siguiendo EXACTAMENTE ese patrón: método `generate(PlaSubscriptionInvoice $invoice): string` que renderiza la blade `pdf.subscription-receipt` y devuelve los bytes del PDF.
- [ ] **Step 13b.2:** Crear la blade con el diseño descrito (HTML/CSS inline, hoja carta, sin assets externos salvo el logo local si existe en `public/`). Datos: `$invoice->invoice_number`, `paid_at`, club (`$invoice->club->name`, email de billing), plan (`notes` JSON → `plan_id` o relación), `period_start`/`period_end`, `subtotal_cents`/`tax_cents`/`total_cents` + `currency_code`, y método de pago si está disponible en `gateway_response` (si no, omitir la línea). Emisor: "Widdo Inc. · Dover, Delaware, United States · billing@widdo.co" (dirección legal exacta: pendiente manual de Miguel, dejar constante en un solo lugar del blade).
- [ ] **Step 13b.3:** En `SubscriptionPaymentReceiptMail`, adjuntar:

```php
    public function attachments(): array
    {
        try {
            $pdf = app(\App\Services\SubscriptionReceiptPdfService::class)->generate($this->invoice);

            return [
                \Illuminate\Mail\Mailables\Attachment::fromData(fn () => $pdf, "receipt-{$this->invoice->invoice_number}.pdf")
                    ->withMime('application/pdf'),
            ];
        } catch (\Throwable $e) {
            \Log::warning('No se pudo generar el PDF del recibo, se envía sin adjunto', ['error' => $e->getMessage()]);

            return []; // el email sale igual sin PDF (Gotenberg caído no debe bloquear el recibo)
        }
    }
```

- [ ] **Step 13b.4: Test** — en el test de Task 13, cuando Gotenberg no esté disponible en el entorno de test, el mail debe encolarse igualmente (assert `Mail::assertQueued` sigue pasando). Si el proyecto ya mockea Gotenberg en otros tests, seguir ese patrón y añadir un assert de que `attachments()` devuelve el PDF.
- [ ] **Step 13b.5:** `php artisan test --filter=Dunning` → PASS. **Commit:**

```bash
git add app/ resources/views/pdf/ tests/
git commit -m "feat: branded PDF receipt attached to subscription payment email"
```

### Task 14: `past_due` sale del limbo + emails de suscripción a la cola correcta

**Files:**
- Modify: `saas_sport/app/Console/Commands/ProcessExpiredSubscriptions.php` (~línea 39, la query)
- Modify: `saas_sport/app/Console/Commands/SendSubscriptionExpiringNotification.php:108` (queue)
- Modify: `saas_sport/app/Console/Commands/ProcessExpiredSubscriptions.php` (~línea 87, queue)

- [ ] **Step 14.1:** En `ProcessExpiredSubscriptions`, reemplazar la query:

```php
        $subscriptions = PlaSubscription::withoutGlobalScopes()
            ->where('current_period_end', '<', now())
            ->whereIn('status', [PlaSubscription::STATUS_ACTIVE, PlaSubscription::STATUS_TRIAL])
            ->with(['club', 'plan'])
            ->get();
```

por:

```php
        $subscriptions = PlaSubscription::withoutGlobalScopes()
            ->where(function ($query) {
                // Activas/trial: expiran al terminar el período
                $query->where(function ($q) {
                    $q->whereIn('status', [PlaSubscription::STATUS_ACTIVE, PlaSubscription::STATUS_TRIAL])
                        ->where('current_period_end', '<', now());
                })
                    // past_due: dar 2x el período de gracia para que Stripe reintente, luego expirar
                    ->orWhere(function ($q) {
                        $q->where('status', PlaSubscription::STATUS_PAST_DUE)
                            ->where('current_period_end', '<', now()->subDays(PlaSubscription::GRACE_PERIOD_DAYS * 2));
                    });
            })
            ->with(['club', 'plan'])
            ->get();
```

- [ ] **Step 14.2:** Cola correcta — el scheduler solo drena `--queue=notifications` (`routes/console.php:109`), pero estos mails van a `default` y pueden no salir nunca. En `SendSubscriptionExpiringNotification.php:108` cambiar:

```php
                    Mail::to($ownerEmail)->queue($mail);
```

por:

```php
                    Mail::to($ownerEmail)->queue($mail->onQueue('notifications'));
```

Y en `ProcessExpiredSubscriptions.php` (~línea 87) cambiar:

```php
                        Mail::to($ownerRole->user->email)
                            ->queue(new SubscriptionExpiredMail($subscription));
```

por:

```php
                        Mail::to($ownerRole->user->email)
                            ->queue((new SubscriptionExpiredMail($subscription))->onQueue('notifications'));
```

- [ ] **Step 14.3: Test** — crear `tests/Feature/ProcessExpiredSubscriptionsTest.php`: sub `past_due` con `current_period_end = now()->subDays(15)` → correr `$this->artisan('subscriptions:process-expired')` → assert status `expired` + `Mail::assertQueued(SubscriptionExpiredMail::class)`. Y una sub `past_due` con `current_period_end = now()->subDays(3)` → NO expira.
- [ ] **Step 14.4:** Run: `php artisan test --filter=ProcessExpiredSubscriptions` → PASS. Suite completa → verde.
- [ ] **Step 14.5: Commit**

```bash
git add app/Console/Commands/ tests/
git commit -m "fix: expire stale past_due subscriptions and route subscription mails to notifications queue"
```

### Task 15: Comisiones de referidos en renovaciones (observer)

**Files:**
- Modify: `saas_sport/app/Observers/SubscriptionInvoiceObserver.php`

- [ ] **Step 15.1:** Leer el archivo. Hoy solo reacciona en `updated()` cuando el status cambia a paid; las facturas de renovación se CREAN ya con `status='paid'` (`PaymentService`, bloque renovación) → la comisión recurrente nunca se dispara por esa ruta.
- [ ] **Step 15.2:** Extraer la lógica de "factura pagada" de `updated()` a un método privado `handlePaidInvoice(PlaSubscriptionInvoice $invoice): void` y añadir:

```php
    public function created(PlaSubscriptionInvoice $invoice): void
    {
        if ($invoice->status === 'paid') {
            $this->handlePaidInvoice($invoice);
        }
    }
```

`updated()` queda llamando al mismo método bajo su condición actual (status cambió a paid).

- [ ] **Step 15.3:** `php artisan test` → verde (si existe test de referidos, debe seguir pasando).
- [ ] **Step 15.4: Commit**

```bash
git add app/Observers/SubscriptionInvoiceObserver.php
git commit -m "fix: trigger referral commission for renewal invoices created as paid"
```

---

# FASE 6 — UI: estado past_due, portal de Stripe, retorno de checkout, i18n

### Task 16: Estado `past_due` visible con CTA (frontend)

**Files:**
- Modify: `frontend/src/context/SubscriptionContext.jsx` (~línea 78-98 y el value del provider)
- Modify: `frontend/src/components/subscription/TrialBannerStrip.jsx` (nueva rama ANTES de la de "vencida", ~línea 82)
- Modify: `frontend/src/locales/en/subscription.json`, `frontend/src/locales/es/subscription.json` (+ `pt-BR` en Task 18)

- [ ] **Step 16.1:** En `SubscriptionContext.jsx`, añadir junto a `isOnTrial`:

```javascript
  // Pago fallido: Stripe está reintentando el cobro
  const isPastDue = useCallback(() => {
    return subscription?.status === 'past_due';
  }, [subscription]);
```

y exponer `isPastDue` en el value del provider (junto a `isOnTrial`, `hasActiveSubscription`, etc.). NO cambiar `hasActiveSubscription` (past_due ≠ activa; el acceso en gracia lo decide el backend).

- [ ] **Step 16.2:** En `TrialBannerStrip.jsx`, obtener `isPastDue` del context e insertar ANTES del bloque `// Suscripcion vencida`:

```jsx
  // Pago fallido (past_due): CTA para actualizar método de pago
  if (isPastDue()) {
    return (
      <div className="bg-red-600 dark:bg-red-700 text-white px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="truncate">
            <strong>{t('subscription:past_due.title')}</strong> —{' '}
            {isOwner
              ? t('subscription:past_due.message_owner')
              : t('subscription:past_due.message_other')}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isOwner && (
            <button
              onClick={() => navigate('/home/subscription')}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs font-medium transition-colors"
            >
              {t('subscription:past_due.cta')}
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="hover:bg-white/20 p-0.5 rounded transition-colors"
            aria-label={t('common:close')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }
```

- [ ] **Step 16.3:** Claves i18n — añadir a `en/subscription.json`:

```json
  "past_due": {
    "title": "Payment failed",
    "message_owner": "We couldn't charge your card. Update your payment method to keep your plan.",
    "message_other": "The club's last payment failed. Ask the club owner to update the payment method.",
    "cta": "Update payment method"
  }
```

y a `es/subscription.json`:

```json
  "past_due": {
    "title": "Pago fallido",
    "message_owner": "No pudimos cobrar tu tarjeta. Actualiza tu método de pago para conservar tu plan.",
    "message_other": "El último pago del club falló. Pide al propietario que actualice el método de pago.",
    "cta": "Actualizar método de pago"
  }
```

- [ ] **Step 16.4:** De paso, arreglar los dos hardcodes existentes del banner: `TrialBannerStrip.jsx:67` `Suscribirme` → `{t('subscription:trial_banner.subscribe_cta')}` y `:101` `Renovar` → `{t('subscription:trial_banner.renew_cta')}`; añadir esas claves en en (`"subscribe_cta": "Subscribe"`, `"renew_cta": "Renew"`) y es (`"Suscribirme"`, `"Renovar"`).
- [ ] **Step 16.5:** `npm run lint && npm run build` → OK.
- [ ] **Step 16.6: Commit**

```bash
git add src/context/SubscriptionContext.jsx src/components/subscription/TrialBannerStrip.jsx src/locales/
git commit -m "feat: distinct past_due banner with update-payment CTA"
```

### Task 17: Botón "Manage subscription" (portal Stripe) + manejo del retorno de checkout

**Files:**
- Modify: `frontend/src/pages/dashboard/SubscriptionPage.jsx` — vista "suscripción actual" (~líneas 371-469) y el useEffect de params (~48-79)

- [ ] **Step 17.1:** Leer `saas_sport/app/Http/Controllers/Api/StripePortalController.php::createPortalSession` para confirmar el nombre exacto del campo de retorno y el shape de la respuesta (se espera `{ success, data: { url } }` y parámetro `return_url`). Ajustar el fetch del paso siguiente si difiere.
- [ ] **Step 17.2:** En `SubscriptionPage.jsx`, añadir estado y handler:

```jsx
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const response = await api.post('/api/subscriptions/billing-portal', {
        return_url: `${window.location.origin}/home/subscription`,
      });
      const url = response.data?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error(t('subscription:portal.error'));
      }
    } catch {
      toast.error(t('subscription:portal.error'));
    } finally {
      setPortalLoading(false);
    }
  };
```

(usar el mismo mecanismo de toasts/notificación ya presente en la página — si usa otro helper en vez de `toast`, replicarlo).

- [ ] **Step 17.3:** En la vista de suscripción actual (bloque ~371-469), añadir un botón junto al de cancelar:

```jsx
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                disabled={portalLoading}
              >
                {portalLoading
                  ? t('common:loading')
                  : t('subscription:portal.manage_button')}
              </Button>
```

Mostrarlo solo cuando la suscripción actual tiene gateway Stripe: condición `subscription?.gateway_subscription_id?.startsWith?.('sub_')` no está en el shape actual — si `getCurrentSubscription` no expone el gateway, mostrar el botón siempre que `status` sea `active` o `past_due` y manejar el error del backend con el toast (el backend responde error si el club no tiene customer de Stripe).

- [ ] **Step 17.4:** Retorno de Stripe Checkout — en el useEffect que hoy solo maneja MercadoPago (~48-79), añadir manejo de `status=callback`:

```jsx
    // Retorno de Stripe Checkout (redirect_url usa ?status=callback)
    if (searchParams.get('status') === 'callback') {
      setVerifyingPayment(true);
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts += 1;
        await refreshSubscription();
        const isActive = subscriptionRef.current?.status === 'active';
        if (isActive || attempts >= 5) {
          clearInterval(poll);
          setVerifyingPayment(false);
          if (isActive) toast.success(t('subscription:checkout.success'));
          setSearchParams({}, { replace: true });
        }
      }, 3000);
      return () => clearInterval(poll);
    }
```

Implementación concreta: usar el patrón que ya exista en la página para leer query params (si usa `window.location.search` en vez de `useSearchParams`, seguir ese patrón) y el `refreshSubscription` del `SubscriptionContext`. `subscriptionRef` = `useRef` sincronizado con el valor del context (o consultar `GET /api/subscriptions/current` directo dentro del intervalo y leer `response.data.data.subscription?.status`, que evita el ref). Mostrar un spinner/overlay simple con `t('subscription:checkout.verifying')` mientras `verifyingPayment`.

- [ ] **Step 17.5:** Claves i18n en/es:

```json
  "portal": {
    "manage_button": "Manage subscription",
    "error": "Could not open the billing portal. Try again or contact support."
  },
  "checkout": {
    "verifying": "Verifying your payment…",
    "success": "Your subscription is now active!"
  }
```

(es: `"Gestionar suscripción"`, `"No pudimos abrir el portal de facturación. Intenta de nuevo o contacta soporte."`, `"Verificando tu pago…"`, `"¡Tu suscripción ya está activa!"`).

- [ ] **Step 17.6:** `npm run lint && npm run build` → OK. Prueba manual opcional si hay entorno: `npm run dev` + visitar `/home/subscription?status=callback`.
- [ ] **Step 17.7: Commit**

```bash
git add src/pages/dashboard/SubscriptionPage.jsx src/locales/
git commit -m "feat: Stripe billing portal button and checkout return handling"
```

### Task 18: i18n de billing completo (PT + hardcodes restantes)

**Files:**
- Create: `frontend/src/locales/pt-BR/subscription.json`
- Modify: `frontend/src/pages/dashboard/SubscriptionPage.jsx:584` (precio hardcodeado), `:686` (fallback), `:715-722` (descripciones de gateways), `:435` (locale de fecha)
- Modify: `frontend/src/components/subscription/SubscriptionLimitAlert.jsx:55,69-92` y `frontend/src/components/subscription/UpgradePrompt.jsx:47-53,65`

- [ ] **Step 18.1:** Crear `pt-BR/subscription.json` traduciendo TODAS las claves de `es/subscription.json` (incluidas las nuevas de Tasks 16-17) al portugués de Brasil.
- [ ] **Step 18.2:** `SubscriptionPage.jsx:584`: el texto `(desde $299.000 / mes)` hardcodea moneda COP — reemplazar por el precio formateado del plan que ya viene del backend (`plan.pricing.monthly.formatted`, mismo shape que usa el resto de la página); si no hay pricing, omitir el paréntesis.
- [ ] **Step 18.3:** `SubscriptionPage.jsx:715-722`: mover las descripciones de gateways a i18n: `t('subscription:gateways.stripe_desc')` = "Credit/debit card, Apple/Google Pay", `gateways.wompi_desc` = "PSE, Nequi, Bancolombia, Card", `gateways.mercadopago_desc` = "Mercado Pago, Card" (en/es/pt).
- [ ] **Step 18.4:** `SubscriptionPage.jsx:435`: reemplazar el locale fijo `'es-CO'` por el idioma activo: `new Date(...).toLocaleDateString(i18n.language)` (obtener `i18n` del hook `useTranslation` ya presente).
- [ ] **Step 18.5:** `SubscriptionLimitAlert.jsx` y `UpgradePrompt.jsx`: mover los strings españoles señalados a claves `subscription:limit_alert.*` y `subscription:upgrade_prompt.*` (en/es/pt). Mantener el diseño intacto.
- [ ] **Step 18.6:** `npm run lint && npm run build` → OK. Verificación: `grep -rn "desde \$299\|Suscribirme\|Renovar\|Contacta al propietario" src/` → sin resultados.
- [ ] **Step 18.7: Commit**

```bash
git add src/
git commit -m "fix: complete billing i18n (pt-BR namespace, currency/locale hardcodes removed)"
```

---

# FASE 7 — Funnel landing → registro → plan correcto

### Task 19: El plan elegido llega al backend (trial con el plan seleccionado)

**Contexto:** la landing pasa `?plan=slug&billing=...` a `/register`; `RegisterPage.jsx:88-95` lo guarda en localStorage y el payload de `/api/register` NO lo incluye. El club se crea después en onboarding (`PlaClubTeamController::store` → `createTrialSubscription`, líneas 169 y 200-239) siempre con trial Enterprise.

**Files:**
- Modify: `saas_sport/app/Http/Controllers/PlaClubTeamController.php` (~líneas 169 y 200-239)
- Modify: frontend — el llamado que crea el club en onboarding (buscar con `grep -rn "pla_club_teams" src/services/ src/pages/onboarding/ | grep -i post` el punto exacto)
- Modify: `frontend/src/pages/dashboard/SubscriptionPage.jsx:108-131` (alias de slug)

- [ ] **Step 19.1: Backend** — en `PlaClubTeamController::store`, pasar el plan solicitado a `createTrialSubscription($club, $request->input('trial_plan_slug'))` y en `createTrialSubscription` (firma nueva: `private function createTrialSubscription(PlaClubTeam $club, ?string $planSlug = null)`):

```php
        $allowedSlugs = ['basico', 'pro', 'enterprise'];
        $plan = null;

        if ($planSlug && in_array($planSlug, $allowedSlugs, true)) {
            $plan = BasSubscriptionPlan::where('slug', $planSlug)->where('is_active', true)->first();
        }

        // Default: Enterprise (trial con todos los módulos, comportamiento actual)
        $plan = $plan ?? BasSubscriptionPlan::where('slug', 'enterprise')->first();
```

(el resto del método sigue igual usando `$plan`). Validación: `'trial_plan_slug' => 'nullable|string|in:basico,pro,enterprise'` en el validate del `store`.

- [ ] **Step 19.2: Frontend** — en el punto donde onboarding hace POST de creación del club, añadir al payload:

```javascript
const SLUG_ALIASES = { starter: 'basico' };
const storedPlan = localStorage.getItem('selectedPlan');
const trialPlanSlug = storedPlan ? (SLUG_ALIASES[storedPlan] || storedPlan) : undefined;
// ...payload existente,
trial_plan_slug: trialPlanSlug,
```

- [ ] **Step 19.3:** En `SubscriptionPage.jsx:108-131` (match de plan preseleccionado por slug), aplicar el mismo alias antes de comparar: `const normalized = SLUG_ALIASES[selectedPlan] || selectedPlan;` (definir el mismo mapa; si se repite en 2 archivos, extraerlo a `src/constants/subscription.js` y exportar `SLUG_ALIASES`).
- [ ] **Step 19.4: Test backend** — en un test nuevo `tests/Feature/ClubTrialPlanTest.php`: crear club vía endpoint con `trial_plan_slug: 'basico'` → assert `PlaSubscription` del club tiene `plan.slug === 'basico'` y status `trialing`; sin el campo → plan `enterprise`. (Seed de planes: `$this->seed(SubscriptionPlansSeeder::class)`.)
- [ ] **Step 19.5:** Run: `php artisan test --filter=ClubTrialPlanTest` → PASS. Frontend: `npm run build` → OK.
- [ ] **Step 19.6: Commits** (backend y frontend por separado)

```bash
# saas_sport
git add app/Http/Controllers/PlaClubTeamController.php tests/Feature/ClubTrialPlanTest.php
git commit -m "feat: honor plan selected on landing when creating club trial"
# frontend
git add src/
git commit -m "feat: send selected plan slug on club creation and normalize starter alias"
```

### Task 20: Precios USD en BD + plan anual unificado (13 meses)

**Files:**
- Modify: `saas_sport/database/seeders/SubscriptionPlansSeeder.php` (precios yearly + bloque de precios por país)
- Create: `saas_sport/database/migrations/2026_07_14_000002_fix_yearly_prices_and_seed_usd.php`

- [ ] **Step 20.1: Seeder** — cambiar los `price_yearly` COP a 12× el mensual y `yearly_discount_percent` a 8 en los 3 planes:
  - basico: `'price_yearly' => 58800000` (12 × 4.900.000), `'yearly_discount_percent' => 8`
  - pro: `'price_yearly' => 154800000`, `'yearly_discount_percent' => 8`
  - enterprise: `'price_yearly' => 358800000`, `'yearly_discount_percent' => 8`
  Actualizar los comentarios: `// paga 12 meses, recibe 13 (activateSubscription añade 13 meses)`.
- [ ] **Step 20.2: Seeder** — después del bloque que crea el precio de Colombia (`$plan->prices()->updateOrCreate([...Colombia...])`), añadir precios USA:

```php
            // Precios USA (USD, en centavos) — Starter/Pro/Enterprise per STRIPE-SETUP.md
            $usa = BasCountry::where('country_short_name', 'US')
                ->orWhere('name', 'like', '%United States%')
                ->orWhere('name', 'like', '%Estados Unidos%')
                ->first();

            if ($usa) {
                $usdMonthly = ['basico' => 9900, 'pro' => 19900, 'enterprise' => 34900][$plan->slug] ?? null;

                if ($usdMonthly) {
                    $plan->prices()->updateOrCreate(
                        ['country_id' => $usa->id],
                        [
                            'price_monthly_cents' => $usdMonthly,
                            'price_yearly_cents' => $usdMonthly * 12, // paga 12, recibe 13
                            'is_active' => true,
                        ]
                    );
                    $this->command->info("  ✓ Precio USD creado para '{$plan->name}'");
                }
            }
```

(verificar el nombre real de la columna corta del país en `bas_countries` — `country_short_name` se usa en `WebhookController::resolveStripeCountry`, así que existe).

- [ ] **Step 20.3: Migración de datos** para BD ya sembradas (local/prod) — `2026_07_14_000002_fix_yearly_prices_and_seed_usd.php`: en `up()`, para cada slug actualizar `yearly_discount_percent = 8` en `bas_subscription_plans` y, en la tabla de precios del plan (ver el nombre real con `grep -rn "class.*Price" app/Models/BasSubscriptionPlanPrice.php` → `protected $table`), poner `price_yearly_cents = price_monthly_cents * 12` para TODAS las filas, e insertar los precios USD si existe el país US y no hay fila (mismos valores del seeder). Escribirla con `DB::table(...)` sin modelos (a prueba de refactors futuros).
- [ ] **Step 20.4:** Run: `php artisan migrate` + `php artisan test` → verde. Verificar: `php artisan tinker --execute="print_r(\App\Models\BasSubscriptionPlan::with('prices')->get()->map(fn(\$p)=>[\$p->slug, \$p->prices->map(fn(\$pr)=>[\$pr->country_id, \$pr->price_monthly_cents, \$pr->price_yearly_cents])])->toArray());"`
- [ ] **Step 20.5: Commit**

```bash
git add database/
git commit -m "feat: seed USD prices and unify yearly pricing to 12x (13th month free)"
```

### Task 21: Landing — borrar código muerto y validar la fuente de precios

**Files:**
- Delete: `landing/src/components/us/PricingUS.tsx` (código muerto verificado; contiene el copy falso "Credit card required to start")
- Verify (sin cambios salvo hallazgo): `landing/src/components/landing/Pricing.tsx`

- [ ] **Step 21.1:** Confirmar que nada importa `PricingUS`: `grep -rn "PricingUS" src/` → solo su propio archivo. Borrarlo.
- [ ] **Step 21.2:** En `Pricing.tsx`, revisar `getFallbackPlans()` (líneas ~52-100): actualizar los slugs del fallback a los reales del backend (`basico`, `pro`, `enterprise`) manteniendo los nombres display ("Starter"/"Pro"/"Enterprise") — así el CTA `?plan=basico` matchea aunque se sirva el fallback. Con los precios USD ya en BD (Task 20), el fallback queda solo como red de seguridad.
- [ ] **Step 21.3:** Verificar el copy anual de la landing: con el modelo "paga 12, recibe 13", el texto "+1 mes gratis"/"Pay 12 months, get 13" es CORRECTO — no tocar. Si algún texto dice "2 meses gratis" o "17%", corregirlo a 1 mes/13 meses.
- [ ] **Step 21.4:** `npm run build` (en `landing/`) → OK.
- [ ] **Step 21.5: Commit** (en `landing/`)

```bash
git add src/components/us/PricingUS.tsx src/components/landing/Pricing.tsx
git commit -m "fix: align pricing fallback slugs with backend and drop dead PricingUS component"
```

---

# FASE 8 — Verificación final y cierre

### Task 22: Verificación integral

- [ ] **Step 22.1:** Backend: `php artisan test` completo → anotar el resultado exacto (pasan/fallan y cuáles). Los fallos preexistentes ajenos a suscripciones (E2E clubes legacy, etc.) se reportan pero no bloquean.
- [ ] **Step 22.2:** Frontend: `npm run lint` + `npm run build`. Landing: `npm run build`.
- [ ] **Step 22.3:** Smoke manual del flujo (entorno local levantado): crear club nuevo → trial con plan de la landing; `/home/subscription` muestra plan; simular webhook con `php artisan tinker` llamando `PaymentService::processWebhook` con el mock NO disponible — alternativa: correr `php artisan test --filter=SubscriptionWebhookTest` como proxy. Con Stripe CLI disponible: `stripe listen --forward-to localhost:8010/api/webhooks/stripe` + `stripe trigger checkout.session.completed` y verificar fila en `pla_club_teams_webhook_events` sin 500.
- [ ] **Step 22.4:** Usar la skill `superpowers:verification-before-completion` antes de declarar terminado.
- [ ] **Step 22.5:** Resumen final para Miguel: lista de commits por repo (`git log --oneline main..feature/subscriptions-fix` en cada repo), tests añadidos, y los 3 pendientes MANUALES que este plan NO cubre:
  1. Configurar llaves reales de Stripe (test y prod) + webhook endpoint en el Dashboard (ver `STRIPE-SETUP.md`).
  2. Desactivar dLocal desde el panel Pasarelas en prod si aparece listado.
  3. Decidir precios definitivos USA (el plan sembró $99/$199/$349 de STRIPE-SETUP; Erica sugirió $150/$250/$500 — sin decisión).
  4. **Activar el invoicing nativo de Stripe** (decisión 13-jul, modelo Anthropic — un solo email con Invoice PDF + Receipt PDF):
     - Settings → Customer emails → activar **"Successful payments"** (recibo).
     - Settings → Billing → Invoices → activar **"Email finalized invoices to customers"** y en el template poner los datos de Widdo Inc. (nombre, dirección legal, email de soporte; memo/footer opcional).
     - Settings → Branding → logo e ícono Widdo + color de acento `#00C853` (esto es lo que hace que el PDF salga con marca Widdo, como el "A\" de Anthropic).
     - El recibo propio de Widdo (Tasks 13/13b) queda SOLO para pagos Wompi/MercadoPago — sin duplicados.
  5. Confirmar la dirección legal del emisor: se usa en el template de invoice de Stripe (punto 4) y en el PDF Widdo de la Task 13b (placeholder actual: "Widdo Inc. · Dover, Delaware").

---

## Fuera de alcance (deliberado, no olvidado)

- Reconciliación Stripe↔BD (comando de sync) — recomendable después de que los webhooks funcionen.
- Eventos `checkout.session.async_payment_succeeded/failed` (solo relevante si se activa OXXO/SPEI).
- Emails de win-back, tarjeta por expirar, y aviso -1 día.
- Montar `PlanUsageTab.jsx` (vista de uso vs límites ya construida) en la página de suscripción.
- Restricción de dominio en `redirect_url` y gating de lectura del historial de pagos a solo-owner (hardening menor).
- Precios BRL / Brasil.
- Pill de plan activo en dashboard del dueño (ya existe plan aparte aprobado: memoria `subscription-mgmt-enddate-plan`).
