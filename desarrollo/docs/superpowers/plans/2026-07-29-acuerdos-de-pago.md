# Acuerdos de Pago — Implementation Plan

> ## ✅ IMPLEMENTADO — 🔴 con fallos vistos en QA (estado al 13-ago-2026)
>
> Verificado contra el código: `app/Models/PlaClubTeamPaymentAgreement.php`,
> `app/Policies/PlaClubTeamPaymentAgreementPolicy.php` registrado en `AuthServiceProvider`,
> y el enganche en `PlaClubTeamPayment` / `PlaClubTeamCharge`.
>
> **Los `- [ ]` de abajo NO son pendientes**: el plan nunca se fue marcando.
>
> 🔴 **Pregunta a Miguel antes de tocar este módulo.** Vio fallos en QA sobre acuerdos de
> pago y no está cerrado como sano (memoria `acuerdos-de-pago-jul2026`).
>
> Diseño: `docs/superpowers/specs/2026-07-29-acuerdos-de-pago-design.md`.


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que un admin de club tome uno o varios cobros pendientes de un jugador y los reemplace por un acuerdo de pago con valor libre y una o varias cuotas, de forma que los cobros originales dejen de contar como deuda en toda la aplicación.

**Architecture:** Entidad nueva `PlaClubTeamPaymentAgreement` + un status nuevo `AGR` en `pla_club_teams_payments` para los cobros suplidos. Las cuotas del acuerdo son filas normales de `pla_club_teams_payments` contra un cobro oculto sintético por club, lo que reutiliza comprobantes, aprobación, recibos, recordatorios y la vista del padre sin código nuevo. `AGR` no pertenece a `DEBT_STATUSES`, así que sale automáticamente de los scopes `owed()/overdue()/chaseable()` y de sus ~25 consumidores; los sitios que hardcodean listas de estados se corrigen uno a uno.

**Tech Stack:** Laravel 12 (PHP 8.2), PHPUnit, React 18 + Vite, React Query, Radix UI + Tailwind, react-hook-form, i18next.

**Spec:** `docs/superpowers/specs/2026-07-29-acuerdos-de-pago-design.md`

## Global Constraints

- **Repos separados.** Backend en `saas_sport/`, frontend en `frontend/`. Commits independientes por repo. Nunca `git add -A`.
- **NUNCA commit/push automático.** Todo queda local. Los pasos de commit del plan se ejecutan solo si Miguel lo pide.
- **Mensajes de commit sin referencias a IA.** Prohibido `🤖 Generated with Claude Code` y `Co-Authored-By: Claude`.
- **NUNCA resetear/dropear/recrear** BD, tablas, contenedores ni cachés, ni en local.
- **Tests backend:** `docker compose exec saas_sport_app php artisan test --filter=X`. Si corren dos suites a la vez, la segunda usa `-e TEST_DB_DATABASE=db_testing_b`.
- **Formato PHP:** `docker compose exec saas_sport_app ./vendor/bin/pint` antes de cada commit.
- **i18n:** default inglés, obligatorio `en`, `es` y `pt-BR`. Cero strings hardcodeados en componentes nuevos.
- **Multi-tenancy:** todo modelo con `club_id` usa el trait `ProtectedModel` y `club_id` debe estar en `$fillable`, o `ClubScope` no se aplica y hay fuga cross-tenant.
- **Lint frontend:** `npm run lint` con `--max-warnings 0`. No introducir warnings de `exhaustive-deps`.
- **Nombre del cobro sintético:** exactamente `__payment_agreement__` (unique es `[club_id, name]`).
- **Código de status nuevo:** exactamente `AGR`, tres caracteres.

---

## File Structure

**Backend (`saas_sport/`):**

| Archivo | Responsabilidad |
|---|---|
| `database/migrations/2026_07_29_140000_create_pla_club_teams_payment_agreements_table.php` | Tabla del acuerdo |
| `database/migrations/2026_07_29_140100_add_agreement_fields_to_payments_table.php` | `agreement_id`, `agreement_role`, `pre_agreement_status` |
| `app/Models/PlaClubTeamPaymentAgreement.php` | Modelo + relaciones + estados |
| `database/factories/PlaClubTeamPaymentAgreementFactory.php` | Factory para tests |
| `app/Models/PlaClubTeamPayment.php` (modificar) | Constante `AGR`, `ACTIVE_STATUSES`, guardas |
| `app/Services/PaymentAgreementService.php` | Toda la escritura: crear, anular, cobro sintético |
| `app/Http/Controllers/PlaClubTeamPaymentAgreementController.php` | Endpoints |
| `app/Http/Requests/StorePaymentAgreementRequest.php` | Validación de entrada |
| `app/Policies/PlaClubTeamPaymentAgreementPolicy.php` | Autorización |
| `app/Services/Assistant/Tools/PaymentAgreementTools.php` | Tools del asistente |
| Varios (ver Task 6) | Correcciones de doble conteo |

**Frontend (`frontend/`):**

| Archivo | Responsabilidad |
|---|---|
| `src/helpers/paymentStatusConfig.js` (modificar) | Status `AGR` |
| `src/services/paymentAgreementApiService.js` | Llamadas HTTP |
| `src/hooks/payments/usePaymentAgreements.js` | Queries + mutaciones |
| `src/components/payments/agreements/PaymentAgreementWizardModal.jsx` | Shell del wizard |
| `src/components/payments/agreements/hooks/usePaymentAgreementWizard.jsx` | Estado y validación |
| `src/components/payments/agreements/WizardStepSelectCharges.jsx` | Paso 1 |
| `src/components/payments/agreements/WizardStepAgreementTerms.jsx` | Paso 2 |
| `src/components/payments/agreements/WizardStepInstallments.jsx` | Paso 3 |
| `src/components/payments/agreements/PaymentAgreementDetailDialog.jsx` | Detalle + anular |
| `src/components/payments/agreements/AgreementsTab.jsx` | Listado en la página de pagos |
| `src/i18n/locales/{en,es,pt-BR}/payments.json` (modificar) | `payment_agreements.*` |
| `src/i18n/locales/{en,es,pt-BR}/status.json` (modificar) | `payment.agreed` |

---

## Task 1: Migraciones, modelo y factory del acuerdo

**Files:**
- Create: `saas_sport/database/migrations/2026_07_29_140000_create_pla_club_teams_payment_agreements_table.php`
- Create: `saas_sport/database/migrations/2026_07_29_140100_add_agreement_fields_to_payments_table.php`
- Create: `saas_sport/app/Models/PlaClubTeamPaymentAgreement.php`
- Create: `saas_sport/database/factories/PlaClubTeamPaymentAgreementFactory.php`
- Test: `saas_sport/tests/Feature/PaymentAgreementModelTest.php`

**Interfaces:**
- Produces: modelo `PlaClubTeamPaymentAgreement` con constantes `STATUS_ACTIVE='active'`, `STATUS_COMPLETED='completed'`, `STATUS_CANCELLED='cancelled'`; relaciones `club()`, `player()`, `creator()`, `coveredPayments()`, `installmentPayments()`; columnas nuevas en `pla_club_teams_payments`: `agreement_id`, `agreement_role`, `pre_agreement_status`.

- [ ] **Step 1: Escribir el test que falla**

`saas_sport/tests/Feature/PaymentAgreementModelTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\PlaClubTeamCharge;
use App\Models\PlaClubTeamPayment;
use App\Models\PlaClubTeamPaymentAgreement;
use App\Models\PlaClubTeamPlayer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesClubWithRoles;
use Tests\Traits\SeedsBaseData;

class PaymentAgreementModelTest extends TestCase
{
    use CreatesClubWithRoles, RefreshDatabase, SeedsBaseData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedBaseData();
        $this->createClubWithOwner();
    }

    public function test_agreement_relates_covered_payments_and_installments(): void
    {
        $player = PlaClubTeamPlayer::factory()->create(['club_id' => $this->club->id]);
        $charge = PlaClubTeamCharge::factory()->create(['club_id' => $this->club->id, 'amount' => 100000]);

        $agreement = PlaClubTeamPaymentAgreement::create([
            'club_id' => $this->club->id,
            'player_id' => $player->id,
            'agreement_date' => now()->toDateString(),
            'total_amount' => 150000,
            'original_debt_amount' => 200000,
            'description' => 'Acuerdo por dos mensualidades',
            'installments_count' => 2,
            'created_by' => $this->owner->id,
        ]);

        $covered = PlaClubTeamPayment::factory()->create([
            'club_id' => $this->club->id,
            'player_id' => $player->id,
            'charge_id' => $charge->id,
            'status' => PlaClubTeamPayment::STATUS_AGREED,
            'agreement_id' => $agreement->id,
            'agreement_role' => PlaClubTeamPayment::AGREEMENT_ROLE_COVERED,
            'pre_agreement_status' => PlaClubTeamPayment::STATUS_PENDING,
        ]);

        $installment = PlaClubTeamPayment::factory()->create([
            'club_id' => $this->club->id,
            'player_id' => $player->id,
            'charge_id' => $charge->id,
            'status' => PlaClubTeamPayment::STATUS_PENDING,
            'agreement_id' => $agreement->id,
            'agreement_role' => PlaClubTeamPayment::AGREEMENT_ROLE_INSTALLMENT,
        ]);

        $this->assertSame(PlaClubTeamPaymentAgreement::STATUS_ACTIVE, $agreement->fresh()->status);
        $this->assertEquals([$covered->id], $agreement->coveredPayments()->pluck('id')->all());
        $this->assertEquals([$installment->id], $agreement->installmentPayments()->pluck('id')->all());
    }

    public function test_agreement_is_scoped_to_its_club(): void
    {
        $this->assertContains('club_id', (new PlaClubTeamPaymentAgreement)->getFillable());
    }
}
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd saas_sport && docker compose exec saas_sport_app php artisan test --filter=PaymentAgreementModelTest`
Expected: FAIL con `Class "App\Models\PlaClubTeamPaymentAgreement" not found`.

- [ ] **Step 3: Crear la migración de la tabla**

`database/migrations/2026_07_29_140000_create_pla_club_teams_payment_agreements_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pla_club_teams_payment_agreements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('club_id')->constrained('pla_club_teams')->cascadeOnDelete();
            $table->foreignId('player_id')->constrained('pla_club_teams_players')->cascadeOnDelete();
            $table->date('agreement_date')->comment('Fecha en que se pacta el acuerdo');
            $table->decimal('total_amount', 12, 2)->comment('Valor pactado, libre');
            $table->decimal('original_debt_amount', 12, 2)->comment('Suma de remaining_amount de los cobros suplidos al crear');
            $table->text('description')->comment('Detalle del acuerdo');
            $table->string('status', 20)->default('active')->comment('active|completed|cancelled');
            $table->unsignedTinyInteger('installments_count')->default(1);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['club_id', 'player_id', 'status'], 'agreements_club_player_status_idx');
            $table->index(['club_id', 'status'], 'agreements_club_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pla_club_teams_payment_agreements');
    }
};
```

- [ ] **Step 4: Crear la migración de columnas en payments**

`database/migrations/2026_07_29_140100_add_agreement_fields_to_payments_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pla_club_teams_payments', function (Blueprint $table) {
            $table->foreignId('agreement_id')
                ->nullable()
                ->after('charge_id')
                ->constrained('pla_club_teams_payment_agreements')
                ->nullOnDelete()
                ->comment('Acuerdo que suplió este cobro o al que pertenece esta cuota');
            $table->string('agreement_role', 12)->nullable()->after('agreement_id')
                ->comment('covered = cobro original suplido | installment = cuota del acuerdo');
            $table->char('pre_agreement_status', 3)->nullable()->after('agreement_role')
                ->comment('Status previo del cobro suplido, para poder anular el acuerdo');

            $table->index(['agreement_id', 'agreement_role'], 'payments_agreement_role_idx');
        });
    }

    public function down(): void
    {
        Schema::table('pla_club_teams_payments', function (Blueprint $table) {
            $table->dropIndex('payments_agreement_role_idx');
            $table->dropConstrainedForeignId('agreement_id');
            $table->dropColumn(['agreement_role', 'pre_agreement_status']);
        });
    }
};
```

- [ ] **Step 5: Crear el modelo**

`app/Models/PlaClubTeamPaymentAgreement.php`:

```php
<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Traits\ProtectedModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

/**
 * Acuerdo de pago: reemplaza uno o varios cobros pendientes de un jugador por
 * un valor pactado que se paga en una o varias cuotas.
 *
 * Los cobros suplidos quedan en status AGR (fuera de DEBT_STATUSES, o sea fuera
 * de la deuda) y las cuotas son pagos normales contra un cobro oculto sintetico.
 */
class PlaClubTeamPaymentAgreement extends Model implements AuditableContract
{
    use Auditable, HasFactory, ProtectedModel, SoftDeletes;

    public const STATUS_ACTIVE = 'active';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_CANCELLED = 'cancelled';

    protected $table = 'pla_club_teams_payment_agreements';

    protected $fillable = [
        'club_id',
        'player_id',
        'agreement_date',
        'total_amount',
        'original_debt_amount',
        'description',
        'status',
        'installments_count',
        'created_by',
        'cancelled_by',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected $casts = [
        'agreement_date' => 'date',
        'total_amount' => 'decimal:2',
        'original_debt_amount' => 'decimal:2',
        'installments_count' => 'integer',
        'cancelled_at' => 'datetime',
    ];

    public function club()
    {
        return $this->belongsTo(PlaClubTeam::class, 'club_id');
    }

    public function player()
    {
        return $this->belongsTo(PlaClubTeamPlayer::class, 'player_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function payments()
    {
        return $this->hasMany(PlaClubTeamPayment::class, 'agreement_id');
    }

    /**
     * Cobros originales que el acuerdo dejo sin efecto.
     */
    public function coveredPayments()
    {
        return $this->payments()->where('agreement_role', PlaClubTeamPayment::AGREEMENT_ROLE_COVERED);
    }

    /**
     * Cuotas pactadas. Son pagos normales y se cobran como tales.
     */
    public function installmentPayments()
    {
        return $this->payments()->where('agreement_role', PlaClubTeamPayment::AGREEMENT_ROLE_INSTALLMENT);
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Diferencia entre lo pactado y lo que se debia. Negativa = el club condona.
     */
    public function getDifferenceAttribute(): float
    {
        return (float) $this->total_amount - (float) $this->original_debt_amount;
    }
}
```

- [ ] **Step 6: Crear el factory**

`database/factories/PlaClubTeamPaymentAgreementFactory.php`:

```php
<?php

namespace Database\Factories;

use App\Models\PlaClubTeamPaymentAgreement;
use Illuminate\Database\Eloquent\Factories\Factory;

class PlaClubTeamPaymentAgreementFactory extends Factory
{
    protected $model = PlaClubTeamPaymentAgreement::class;

    public function definition(): array
    {
        return [
            'agreement_date' => now()->toDateString(),
            'total_amount' => 150000,
            'original_debt_amount' => 200000,
            'description' => $this->faker->sentence(),
            'status' => PlaClubTeamPaymentAgreement::STATUS_ACTIVE,
            'installments_count' => 1,
        ];
    }

    public function cancelled(): static
    {
        return $this->state(fn () => ['status' => PlaClubTeamPaymentAgreement::STATUS_CANCELLED]);
    }

    public function completed(): static
    {
        return $this->state(fn () => ['status' => PlaClubTeamPaymentAgreement::STATUS_COMPLETED]);
    }
}
```

- [ ] **Step 7: Añadir los campos nuevos al `$fillable` de `PlaClubTeamPayment`**

En `app/Models/PlaClubTeamPayment.php`, dentro del array `$fillable` (empieza en la línea 150), añadir tras `'charge_id'`:

```php
        'agreement_id',
        'agreement_role',
        'pre_agreement_status',
```

Y añadir la relación al final de la sección de relaciones del modelo:

```php
    public function agreement()
    {
        return $this->belongsTo(PlaClubTeamPaymentAgreement::class, 'agreement_id');
    }
```

- [ ] **Step 8: Correr el test y verificar que pasa**

Run: `docker compose exec saas_sport_app php artisan migrate && docker compose exec saas_sport_app php artisan test --filter=PaymentAgreementModelTest`
Expected: PASS los 2 tests. (Este test depende de la Task 2 para las constantes `STATUS_AGREED` y `AGREEMENT_ROLE_*`; si se ejecuta antes, hacer la Task 2 primero y volver.)

- [ ] **Step 9: Formato y commit**

```bash
cd saas_sport
./vendor/bin/pint app/Models/PlaClubTeamPaymentAgreement.php database/factories/PlaClubTeamPaymentAgreementFactory.php
git add database/migrations/2026_07_29_1400*.php app/Models/PlaClubTeamPaymentAgreement.php app/Models/PlaClubTeamPayment.php database/factories/PlaClubTeamPaymentAgreementFactory.php tests/Feature/PaymentAgreementModelTest.php
git commit -m "feat: modelo y esquema de acuerdos de pago"
```

---

## Task 2: Status `AGR` en el modelo de pagos

**Files:**
- Modify: `saas_sport/app/Models/PlaClubTeamPayment.php`
- Test: `saas_sport/tests/Feature/PaymentAgreedStatusTest.php`

**Interfaces:**
- Consumes: columnas de la Task 1.
- Produces: `PlaClubTeamPayment::STATUS_AGREED = 'AGR'`, `AGREEMENT_ROLE_COVERED = 'covered'`, `AGREEMENT_ROLE_INSTALLMENT = 'installment'`. `AGR` dentro de `ACTIVE_STATUSES` y fuera de `DEBT_STATUSES`.

- [ ] **Step 1: Escribir el test que falla**

`saas_sport/tests/Feature/PaymentAgreedStatusTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\PlaClubTeamCharge;
use App\Models\PlaClubTeamPayment;
use App\Models\PlaClubTeamPaymentInstallment;
use App\Models\PlaClubTeamPlayer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesClubWithRoles;
use Tests\Traits\SeedsBaseData;

class PaymentAgreedStatusTest extends TestCase
{
    use CreatesClubWithRoles, RefreshDatabase, SeedsBaseData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedBaseData();
        $this->createClubWithOwner();
    }

    private function agreedPayment(): PlaClubTeamPayment
    {
        $player = PlaClubTeamPlayer::factory()->create(['club_id' => $this->club->id]);
        $charge = PlaClubTeamCharge::factory()->create(['club_id' => $this->club->id, 'amount' => 100000]);

        return PlaClubTeamPayment::factory()->create([
            'club_id' => $this->club->id,
            'player_id' => $player->id,
            'charge_id' => $charge->id,
            'status' => PlaClubTeamPayment::STATUS_AGREED,
            'amount_due' => 100000,
            'remaining_amount' => 100000,
            'due_date' => now()->subMonth(),
        ]);
    }

    public function test_agreed_is_active_but_is_not_debt(): void
    {
        $this->assertContains('AGR', PlaClubTeamPayment::ACTIVE_STATUSES);
        $this->assertNotContains('AGR', PlaClubTeamPayment::DEBT_STATUSES);
        $this->assertArrayHasKey('AGR', PlaClubTeamPayment::getStatusLabels());
    }

    public function test_agreed_payment_is_excluded_from_debt_scopes(): void
    {
        $payment = $this->agreedPayment();

        $this->assertSame(0, PlaClubTeamPayment::withoutGlobalScopes()
            ->where('club_id', $this->club->id)->owed()->count());
        $this->assertSame(0, PlaClubTeamPayment::withoutGlobalScopes()
            ->where('club_id', $this->club->id)->overdue()->count());
        $this->assertSame(0, PlaClubTeamPayment::withoutGlobalScopes()
            ->where('club_id', $this->club->id)->chaseable()->count());
        $this->assertSame('AGR', $payment->fresh()->status);
    }

    public function test_update_payment_status_does_not_take_a_payment_out_of_its_agreement(): void
    {
        $payment = $this->agreedPayment();

        PlaClubTeamPaymentInstallment::factory()->approved()->create([
            'payment_id' => $payment->id,
            'amount_paid' => 100000,
        ]);

        $payment->updatePaymentStatus();

        $this->assertSame('AGR', $payment->fresh()->status);
    }

    public function test_an_agreed_payment_cannot_be_cancelled_directly(): void
    {
        $payment = $this->agreedPayment();

        $this->expectException(\RuntimeException::class);
        $payment->cancelPayment();
    }
}
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `docker compose exec saas_sport_app php artisan test --filter=PaymentAgreedStatusTest`
Expected: FAIL con `Undefined constant App\Models\PlaClubTeamPayment::STATUS_AGREED`.

- [ ] **Step 3: Añadir constantes y etiqueta**

En `app/Models/PlaClubTeamPayment.php`, tras la constante `STATUS_PENDING_VERIFICATION` (línea 74):

```php
    /**
     * Estado: En acuerdo - El cobro fue suplido por un acuerdo de pago y ya no
     * es deuda. La deuda viva son las cuotas del acuerdo.
     */
    public const STATUS_AGREED = 'AGR';

    /**
     * Rol de un pago dentro de un acuerdo de pago.
     */
    public const AGREEMENT_ROLE_COVERED = 'covered';

    public const AGREEMENT_ROLE_INSTALLMENT = 'installment';
```

Cambiar `ACTIVE_STATUSES` (línea 79) a:

```php
    /**
     * Estados que indican un pago "activo" (no debe generarse otro para el mismo jugador+cobro).
     *
     * AGR entra aqui a proposito: un cobro suplido por un acuerdo sigue ocupando
     * su lugar. Sin el, GenerateMonthlyPayments volveria a generar el mismo cobro
     * del mismo mes que el acuerdo acaba de reemplazar.
     */
    public const ACTIVE_STATUSES = ['PEN', 'PAR', 'COM', 'OVD', 'PEV', 'AGR'];
```

`DEBT_STATUSES` **no se toca**. Añadir a `getStatusLabels()`:

```php
            self::STATUS_AGREED => 'En Acuerdo',
```

- [ ] **Step 4: Blindar `updatePaymentStatus()` y `cancelPayment()`**

En `updatePaymentStatus()` (alrededor de la línea 305), como primera instrucción del método:

```php
        // Un cobro suplido por un acuerdo no cambia de estado por abonos: la
        // deuda viva son las cuotas del acuerdo, no esta fila.
        if ($this->status === self::STATUS_AGREED) {
            return;
        }
```

En `cancelPayment()` (alrededor de la línea 341), como primera instrucción:

```php
        if ($this->status === self::STATUS_AGREED) {
            throw new \RuntimeException('No se puede cancelar un cobro suplido por un acuerdo de pago. Anula el acuerdo.');
        }
```

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `docker compose exec saas_sport_app php artisan test --filter=PaymentAgreedStatusTest`
Expected: PASS los 4 tests.

- [ ] **Step 6: Correr la suite de pagos para detectar regresiones**

Run: `docker compose exec saas_sport_app php artisan test --filter="Payment|Collection|Dashboard|Charge"`
Expected: PASS. Si algo falla por `ACTIVE_STATUSES`, revisar que el test no enumere la constante a mano.

- [ ] **Step 7: Formato y commit**

```bash
cd saas_sport
./vendor/bin/pint app/Models/PlaClubTeamPayment.php
git add app/Models/PlaClubTeamPayment.php tests/Feature/PaymentAgreedStatusTest.php
git commit -m "feat: estado AGR para cobros suplidos por acuerdo"
```

---

## Task 3: `PaymentAgreementService::create()`

**Files:**
- Create: `saas_sport/app/Services/PaymentAgreementService.php`
- Test: `saas_sport/tests/Feature/PaymentAgreementCreationTest.php`

**Interfaces:**
- Consumes: Tasks 1 y 2.
- Produces:
  - `syntheticCharge(int $clubId): PlaClubTeamCharge`
  - `eligiblePayments(int $clubId, int $playerId): \Illuminate\Support\Collection`
  - `create(int $clubId, int $playerId, array $data, ?int $userId): PlaClubTeamPaymentAgreement` donde `$data` = `['agreement_date' => 'Y-m-d', 'total_amount' => float, 'description' => string, 'payment_ids' => int[], 'installments' => [['amount' => float, 'due_date' => 'Y-m-d'], ...]]`. Lanza `\InvalidArgumentException` si la validación de dominio falla.

- [ ] **Step 1: Escribir el test que falla**

`saas_sport/tests/Feature/PaymentAgreementCreationTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\PlaClubTeamCharge;
use App\Models\PlaClubTeamPayment;
use App\Models\PlaClubTeamPaymentAgreement;
use App\Models\PlaClubTeamPlayer;
use App\Services\PaymentAgreementService;
use App\Services\PaymentStatsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesClubWithRoles;
use Tests\Traits\SeedsBaseData;

class PaymentAgreementCreationTest extends TestCase
{
    use CreatesClubWithRoles, RefreshDatabase, SeedsBaseData;

    private PaymentAgreementService $service;

    private PlaClubTeamPlayer $player;

    private PlaClubTeamCharge $charge;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedBaseData();
        $this->createClubWithOwner();
        $this->service = app(PaymentAgreementService::class);
        $this->player = PlaClubTeamPlayer::factory()->create(['club_id' => $this->club->id]);
        $this->charge = PlaClubTeamCharge::factory()->create(['club_id' => $this->club->id, 'amount' => 100000]);
    }

    private function debt(float $amount, string $dueDate): PlaClubTeamPayment
    {
        return PlaClubTeamPayment::factory()->create([
            'club_id' => $this->club->id,
            'player_id' => $this->player->id,
            'charge_id' => $this->charge->id,
            'status' => PlaClubTeamPayment::STATUS_PENDING,
            'amount_due' => $amount,
            'amount_paid' => 0,
            'remaining_amount' => $amount,
            'due_date' => $dueDate,
        ]);
    }

    private function payload(array $paymentIds, array $overrides = []): array
    {
        return array_merge([
            'agreement_date' => now()->toDateString(),
            'total_amount' => 150000,
            'description' => 'Acuerdo por dos mensualidades atrasadas',
            'payment_ids' => $paymentIds,
            'installments' => [
                ['amount' => 75000, 'due_date' => now()->addDays(15)->toDateString()],
                ['amount' => 75000, 'due_date' => now()->addDays(30)->toDateString()],
            ],
        ], $overrides);
    }

    public function test_it_covers_the_original_charges_and_creates_the_installments(): void
    {
        $a = $this->debt(100000, now()->subMonths(2)->toDateString());
        $b = $this->debt(100000, now()->subMonth()->toDateString());

        $agreement = $this->service->create($this->club->id, $this->player->id, $this->payload([$a->id, $b->id]), $this->owner->id);

        $this->assertSame(200000.0, (float) $agreement->original_debt_amount);
        $this->assertSame(150000.0, (float) $agreement->total_amount);
        $this->assertSame(2, $agreement->installments_count);

        foreach ([$a, $b] as $covered) {
            $covered->refresh();
            $this->assertSame(PlaClubTeamPayment::STATUS_AGREED, $covered->status);
            $this->assertSame(PlaClubTeamPayment::AGREEMENT_ROLE_COVERED, $covered->agreement_role);
            $this->assertSame(PlaClubTeamPayment::STATUS_PENDING, $covered->pre_agreement_status);
            $this->assertSame($agreement->id, $covered->agreement_id);
        }

        $installments = $agreement->installmentPayments()->orderBy('due_date')->get();
        $this->assertCount(2, $installments);
        $this->assertSame(75000.0, (float) $installments[0]->amount_due);
        $this->assertSame(75000.0, (float) $installments[0]->remaining_amount);
        $this->assertSame(PlaClubTeamPayment::STATUS_PENDING, $installments[0]->status);
        $this->assertSame(now()->addDays(15)->toDateString(), $installments[0]->due_date->toDateString());
    }

    public function test_club_debt_drops_by_the_original_amount_and_rises_by_the_agreed_one(): void
    {
        $a = $this->debt(100000, now()->subMonths(2)->toDateString());
        $b = $this->debt(100000, now()->subMonth()->toDateString());

        $stats = app(PaymentStatsService::class);
        $this->assertSame(200000.0, $stats->getPendingAmount($this->club->id));

        $this->service->create($this->club->id, $this->player->id, $this->payload([$a->id, $b->id]), $this->owner->id);

        $this->assertSame(150000.0, $stats->getPendingAmount($this->club->id));
    }

    public function test_the_synthetic_charge_is_hidden_and_created_once_per_club(): void
    {
        $a = $this->debt(100000, now()->subMonth()->toDateString());
        $b = $this->debt(100000, now()->subMonths(2)->toDateString());

        $this->service->create($this->club->id, $this->player->id, $this->payload([$a->id]), $this->owner->id);
        $this->service->create($this->club->id, $this->player->id, $this->payload([$b->id]), $this->owner->id);

        $charges = PlaClubTeamCharge::withoutGlobalScopes()
            ->where('club_id', $this->club->id)
            ->where('name', '__payment_agreement__')
            ->get();

        $this->assertCount(1, $charges);
        $this->assertTrue((bool) $charges->first()->is_hidden);
        $this->assertNull($charges->first()->frequency_id);
    }

    public function test_two_installments_in_the_same_month_are_allowed(): void
    {
        $a = $this->debt(200000, now()->subMonth()->toDateString());

        $agreement = $this->service->create($this->club->id, $this->player->id, $this->payload([$a->id], [
            'installments' => [
                ['amount' => 75000, 'due_date' => now()->addDays(2)->toDateString()],
                ['amount' => 75000, 'due_date' => now()->addDays(5)->toDateString()],
            ],
        ]), $this->owner->id);

        $this->assertCount(2, $agreement->installmentPayments()->get());
    }

    public function test_it_rejects_a_payment_that_is_already_covered(): void
    {
        $a = $this->debt(100000, now()->subMonth()->toDateString());
        $this->service->create($this->club->id, $this->player->id, $this->payload([$a->id], [
            'total_amount' => 100000,
            'installments' => [['amount' => 100000, 'due_date' => now()->addDays(10)->toDateString()]],
        ]), $this->owner->id);

        $this->expectException(\InvalidArgumentException::class);
        $this->service->create($this->club->id, $this->player->id, $this->payload([$a->id]), $this->owner->id);
    }

    public function test_it_rejects_payments_from_another_club(): void
    {
        $other = $this->createClubWithOwner();
        $otherPlayer = PlaClubTeamPlayer::factory()->create(['club_id' => $other->id]);
        $otherCharge = PlaClubTeamCharge::factory()->create(['club_id' => $other->id, 'amount' => 50000]);
        $foreign = PlaClubTeamPayment::factory()->create([
            'club_id' => $other->id,
            'player_id' => $otherPlayer->id,
            'charge_id' => $otherCharge->id,
            'status' => PlaClubTeamPayment::STATUS_PENDING,
            'remaining_amount' => 50000,
        ]);

        $this->expectException(\InvalidArgumentException::class);
        $this->service->create($this->club->id, $this->player->id, $this->payload([$foreign->id]), $this->owner->id);
    }

    public function test_it_rejects_installments_that_do_not_add_up_to_the_total(): void
    {
        $a = $this->debt(100000, now()->subMonth()->toDateString());

        $this->expectException(\InvalidArgumentException::class);
        $this->service->create($this->club->id, $this->player->id, $this->payload([$a->id], [
            'total_amount' => 150000,
            'installments' => [['amount' => 80000, 'due_date' => now()->addDays(10)->toDateString()]],
        ]), $this->owner->id);
    }

    public function test_paying_every_installment_completes_the_agreement(): void
    {
        $a = $this->debt(200000, now()->subMonth()->toDateString());
        $agreement = $this->service->create($this->club->id, $this->player->id, $this->payload([$a->id]), $this->owner->id);

        foreach ($agreement->installmentPayments()->get() as $installment) {
            $installment->update([
                'status' => PlaClubTeamPayment::STATUS_COMPLETED,
                'amount_paid' => $installment->amount_due,
                'remaining_amount' => 0,
            ]);
        }

        $this->service->refreshStatus($agreement->fresh());

        $this->assertSame(PlaClubTeamPaymentAgreement::STATUS_COMPLETED, $agreement->fresh()->status);
    }
}
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `docker compose exec saas_sport_app php artisan test --filter=PaymentAgreementCreationTest`
Expected: FAIL con `Target class [App\Services\PaymentAgreementService] does not exist`.

- [ ] **Step 3: Escribir el servicio**

`app/Services/PaymentAgreementService.php`:

```php
<?php

namespace App\Services;

use App\Models\PlaClubTeamCharge;
use App\Models\PlaClubTeamPayment;
use App\Models\PlaClubTeamPaymentAgreement;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Escritura de acuerdos de pago.
 *
 * No pasa por PlaClubTeamPaymentController::store() a proposito: esa guarda
 * bloquea dos pagos activos del mismo jugador+cobro dentro del mismo mes, y un
 * acuerdo puede tener varias cuotas del cobro sintetico en el mismo mes.
 */
class PaymentAgreementService
{
    /**
     * Nombre del cobro oculto contra el que cuelgan todas las cuotas del club.
     * El unique de charges es [club_id, name], asi que hay uno por club.
     */
    public const SYNTHETIC_CHARGE_NAME = '__payment_agreement__';

    /**
     * Tolerancia al comparar la suma de cuotas contra el total pactado.
     * Absorbe el redondeo del reparto automatico de la UI.
     */
    private const AMOUNT_TOLERANCE = 1.0;

    /**
     * Cobro oculto del club, creandolo la primera vez que hace falta.
     *
     * is_hidden lo mantiene fuera de GenerateMonthlyPayments, ApplyLateFees y
     * de los cobros que se asignan a un jugador nuevo.
     */
    public function syntheticCharge(int $clubId): PlaClubTeamCharge
    {
        $charge = PlaClubTeamCharge::withoutGlobalScopes()
            ->where('club_id', $clubId)
            ->where('name', self::SYNTHETIC_CHARGE_NAME)
            ->first();

        if ($charge) {
            return $charge;
        }

        return PlaClubTeamCharge::withoutGlobalScopes()->create([
            'club_id' => $clubId,
            'name' => self::SYNTHETIC_CHARGE_NAME,
            'amount' => 0,
            'frequency_id' => null,
            'status' => 'ACT',
            'is_hidden' => true,
            'notes' => 'Cobro interno: cuotas de acuerdos de pago. No editar.',
        ]);
    }

    /**
     * Pagos del jugador que pueden entrar en un acuerdo: deuda viva que no
     * pertenece ya a otro acuerdo.
     */
    public function eligiblePayments(int $clubId, int $playerId): Collection
    {
        return PlaClubTeamPayment::withoutGlobalScopes()
            ->with('charge:id,name')
            ->where('club_id', $clubId)
            ->where('player_id', $playerId)
            ->whereNull('agreement_id')
            ->owed()
            ->orderBy('due_date')
            ->get();
    }

    /**
     * @param  array{agreement_date:string,total_amount:float|string,description:string,payment_ids:array<int>,installments:array<int,array{amount:float|string,due_date:string}>}  $data
     *
     * @throws \InvalidArgumentException
     */
    public function create(int $clubId, int $playerId, array $data, ?int $userId = null): PlaClubTeamPaymentAgreement
    {
        $paymentIds = array_values(array_unique(array_map('intval', $data['payment_ids'] ?? [])));
        $installments = $data['installments'] ?? [];
        $totalAmount = round((float) $data['total_amount'], 2);

        if (empty($paymentIds)) {
            throw new \InvalidArgumentException('Selecciona al menos un cobro para el acuerdo.');
        }

        if (empty($installments)) {
            throw new \InvalidArgumentException('El acuerdo necesita al menos una cuota.');
        }

        if ($totalAmount <= 0) {
            throw new \InvalidArgumentException('El valor del acuerdo debe ser mayor que cero.');
        }

        $installmentsTotal = round(array_sum(array_map(
            fn (array $i) => (float) $i['amount'],
            $installments
        )), 2);

        if (abs($installmentsTotal - $totalAmount) > self::AMOUNT_TOLERANCE) {
            throw new \InvalidArgumentException('La suma de las cuotas no coincide con el valor del acuerdo.');
        }

        return DB::transaction(function () use ($clubId, $playerId, $data, $paymentIds, $installments, $totalAmount, $userId) {
            $payments = PlaClubTeamPayment::withoutGlobalScopes()
                ->where('club_id', $clubId)
                ->where('player_id', $playerId)
                ->whereIn('id', $paymentIds)
                ->whereNull('agreement_id')
                ->whereIn('status', PlaClubTeamPayment::DEBT_STATUSES)
                ->lockForUpdate()
                ->get();

            if ($payments->count() !== count($paymentIds)) {
                throw new \InvalidArgumentException('Alguno de los cobros seleccionados ya no esta disponible para un acuerdo.');
            }

            $originalDebt = round((float) $payments->sum('remaining_amount'), 2);

            $agreement = PlaClubTeamPaymentAgreement::withoutGlobalScopes()->create([
                'club_id' => $clubId,
                'player_id' => $playerId,
                'agreement_date' => $data['agreement_date'],
                'total_amount' => $totalAmount,
                'original_debt_amount' => $originalDebt,
                'description' => $data['description'],
                'status' => PlaClubTeamPaymentAgreement::STATUS_ACTIVE,
                'installments_count' => count($installments),
                'created_by' => $userId,
            ]);

            foreach ($payments as $payment) {
                $payment->update([
                    'agreement_id' => $agreement->id,
                    'agreement_role' => PlaClubTeamPayment::AGREEMENT_ROLE_COVERED,
                    'pre_agreement_status' => $payment->status,
                    'status' => PlaClubTeamPayment::STATUS_AGREED,
                ]);
            }

            $charge = $this->syntheticCharge($clubId);
            $total = count($installments);

            foreach (array_values($installments) as $index => $installment) {
                $amount = round((float) $installment['amount'], 2);
                $number = $index + 1;

                PlaClubTeamPayment::withoutGlobalScopes()->create([
                    'club_id' => $clubId,
                    'player_id' => $playerId,
                    'charge_id' => $charge->id,
                    'agreement_id' => $agreement->id,
                    'agreement_role' => PlaClubTeamPayment::AGREEMENT_ROLE_INSTALLMENT,
                    'amount_due' => $amount,
                    'amount_paid' => 0,
                    'remaining_amount' => $amount,
                    'status' => PlaClubTeamPayment::STATUS_PENDING,
                    'due_date' => Carbon::parse($installment['due_date'])->toDateString(),
                    'payment_date' => Carbon::parse($installment['due_date'])->toDateString(),
                    'currency' => $payments->first()->currency,
                    'description' => "Acuerdo de pago - cuota {$number}/{$total}",
                    'is_canceled' => false,
                ]);
            }

            return $agreement->load(['coveredPayments.charge', 'installmentPayments']);
        });
    }

    /**
     * Marca el acuerdo como completado cuando todas sus cuotas estan pagadas.
     */
    public function refreshStatus(PlaClubTeamPaymentAgreement $agreement): void
    {
        if (! $agreement->isActive()) {
            return;
        }

        $pending = $agreement->installmentPayments()
            ->whereIn('status', PlaClubTeamPayment::DEBT_STATUSES)
            ->exists();

        if (! $pending) {
            $agreement->update(['status' => PlaClubTeamPaymentAgreement::STATUS_COMPLETED]);
        }
    }
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `docker compose exec saas_sport_app php artisan test --filter=PaymentAgreementCreationTest`
Expected: PASS los 8 tests.

- [ ] **Step 5: Enganchar `refreshStatus` a la aprobación de abonos**

En `app/Models/PlaClubTeamPayment.php`, al final de `updatePaymentStatus()` (después de guardar el nuevo status), añadir:

```php
        // Si esta fila es una cuota de un acuerdo, el acuerdo puede haber quedado saldado.
        if ($this->agreement_id && $this->agreement_role === self::AGREEMENT_ROLE_INSTALLMENT) {
            app(\App\Services\PaymentAgreementService::class)->refreshStatus($this->agreement()->first());
        }
```

- [ ] **Step 6: Escribir el test del enganche**

Añadir a `tests/Feature/PaymentAgreementCreationTest.php`:

```php
    public function test_approving_the_last_installment_completes_the_agreement(): void
    {
        $a = $this->debt(200000, now()->subMonth()->toDateString());
        $agreement = $this->service->create($this->club->id, $this->player->id, $this->payload([$a->id], [
            'total_amount' => 150000,
            'installments' => [['amount' => 150000, 'due_date' => now()->addDays(10)->toDateString()]],
        ]), $this->owner->id);

        $installment = $agreement->installmentPayments()->first();

        \App\Models\PlaClubTeamPaymentInstallment::factory()->approved()->create([
            'payment_id' => $installment->id,
            'amount_paid' => 150000,
        ]);

        $installment->updatePaymentStatus();

        $this->assertSame(PlaClubTeamPaymentAgreement::STATUS_COMPLETED, $agreement->fresh()->status);
    }
```

- [ ] **Step 7: Correr el test y verificar que pasa**

Run: `docker compose exec saas_sport_app php artisan test --filter=PaymentAgreementCreationTest`
Expected: PASS los 9 tests.

- [ ] **Step 8: Formato y commit**

```bash
cd saas_sport
./vendor/bin/pint app/Services/PaymentAgreementService.php app/Models/PlaClubTeamPayment.php
git add app/Services/PaymentAgreementService.php app/Models/PlaClubTeamPayment.php tests/Feature/PaymentAgreementCreationTest.php
git commit -m "feat: servicio de creacion de acuerdos de pago"
```

---

## Task 4: Anulación de acuerdos

**Files:**
- Modify: `saas_sport/app/Services/PaymentAgreementService.php`
- Test: `saas_sport/tests/Feature/PaymentAgreementCancellationTest.php`

**Interfaces:**
- Produces: `cancel(PlaClubTeamPaymentAgreement $agreement, int $userId, string $reason): void` y `canBeCancelled(PlaClubTeamPaymentAgreement $agreement): bool`.

- [ ] **Step 1: Escribir el test que falla**

`saas_sport/tests/Feature/PaymentAgreementCancellationTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\PlaClubTeamCharge;
use App\Models\PlaClubTeamPayment;
use App\Models\PlaClubTeamPaymentAgreement;
use App\Models\PlaClubTeamPaymentInstallment;
use App\Models\PlaClubTeamPlayer;
use App\Services\PaymentAgreementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesClubWithRoles;
use Tests\Traits\SeedsBaseData;

class PaymentAgreementCancellationTest extends TestCase
{
    use CreatesClubWithRoles, RefreshDatabase, SeedsBaseData;

    private PaymentAgreementService $service;

    private PlaClubTeamPlayer $player;

    private PlaClubTeamPayment $original;

    private PlaClubTeamPaymentAgreement $agreement;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedBaseData();
        $this->createClubWithOwner();
        $this->service = app(PaymentAgreementService::class);
        $this->player = PlaClubTeamPlayer::factory()->create(['club_id' => $this->club->id]);
        $charge = PlaClubTeamCharge::factory()->create(['club_id' => $this->club->id, 'amount' => 200000]);

        $this->original = PlaClubTeamPayment::factory()->create([
            'club_id' => $this->club->id,
            'player_id' => $this->player->id,
            'charge_id' => $charge->id,
            'status' => PlaClubTeamPayment::STATUS_PENDING,
            'amount_due' => 200000,
            'remaining_amount' => 200000,
            'due_date' => now()->subMonth(),
        ]);

        $this->agreement = $this->service->create($this->club->id, $this->player->id, [
            'agreement_date' => now()->toDateString(),
            'total_amount' => 150000,
            'description' => 'Acuerdo de prueba',
            'payment_ids' => [$this->original->id],
            'installments' => [['amount' => 150000, 'due_date' => now()->addDays(10)->toDateString()]],
        ], $this->owner->id);
    }

    public function test_cancelling_restores_the_original_charge_and_voids_the_installments(): void
    {
        $this->service->cancel($this->agreement, $this->owner->id, 'Error de captura');

        $this->original->refresh();
        $this->assertSame(PlaClubTeamPayment::STATUS_PENDING, $this->original->status);
        $this->assertNull($this->original->agreement_id);
        $this->assertNull($this->original->agreement_role);
        $this->assertNull($this->original->pre_agreement_status);

        $installment = $this->agreement->installmentPayments()->withTrashed()->first();
        $this->assertSame(PlaClubTeamPayment::STATUS_CANCELLED, $installment->status);
        $this->assertTrue((bool) $installment->is_canceled);

        $this->agreement->refresh();
        $this->assertSame(PlaClubTeamPaymentAgreement::STATUS_CANCELLED, $this->agreement->status);
        $this->assertSame($this->owner->id, $this->agreement->cancelled_by);
        $this->assertNotNull($this->agreement->cancelled_at);
    }

    public function test_the_debt_goes_back_to_the_original_amount(): void
    {
        $stats = app(\App\Services\PaymentStatsService::class);
        $this->assertSame(150000.0, $stats->getPendingAmount($this->club->id));

        $this->service->cancel($this->agreement, $this->owner->id, 'Error de captura');

        $this->assertSame(200000.0, $stats->getPendingAmount($this->club->id));
    }

    public function test_it_refuses_to_cancel_when_an_installment_already_has_money(): void
    {
        $installment = $this->agreement->installmentPayments()->first();

        PlaClubTeamPaymentInstallment::factory()->approved()->create([
            'payment_id' => $installment->id,
            'amount_paid' => 50000,
        ]);

        $this->assertFalse($this->service->canBeCancelled($this->agreement->fresh()));

        $this->expectException(\InvalidArgumentException::class);
        $this->service->cancel($this->agreement->fresh(), $this->owner->id, 'Ya no');
    }

    public function test_it_refuses_to_cancel_when_a_proof_is_waiting_for_review(): void
    {
        $installment = $this->agreement->installmentPayments()->first();

        PlaClubTeamPaymentInstallment::factory()->pendingVerification()->create([
            'payment_id' => $installment->id,
            'amount_paid' => 50000,
        ]);

        $this->assertFalse($this->service->canBeCancelled($this->agreement->fresh()));
    }
}
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `docker compose exec saas_sport_app php artisan test --filter=PaymentAgreementCancellationTest`
Expected: FAIL con `Call to undefined method App\Services\PaymentAgreementService::cancel()`.

- [ ] **Step 3: Implementar `canBeCancelled()` y `cancel()`**

Añadir a `app/Services/PaymentAgreementService.php`:

```php
    /**
     * Un acuerdo solo se puede deshacer mientras no haya entrado dinero contra
     * sus cuotas. Con abonos de por medio habria que decidir a que cobro
     * original imputarlos, y eso no es reversible de forma automatica.
     */
    public function canBeCancelled(PlaClubTeamPaymentAgreement $agreement): bool
    {
        if (! $agreement->isActive()) {
            return false;
        }

        return ! \App\Models\PlaClubTeamPaymentInstallment::whereIn(
            'payment_id',
            $agreement->installmentPayments()->pluck('id')
        )->whereIn('status', [
            \App\Models\PlaClubTeamPaymentInstallment::STATUS_APPROVED,
            \App\Models\PlaClubTeamPaymentInstallment::STATUS_PENDING_VERIFICATION,
        ])->exists();
    }

    /**
     * @throws \InvalidArgumentException
     */
    public function cancel(PlaClubTeamPaymentAgreement $agreement, int $userId, string $reason): void
    {
        if (! $this->canBeCancelled($agreement)) {
            throw new \InvalidArgumentException('No se puede anular un acuerdo que ya tiene pagos reportados o aprobados.');
        }

        DB::transaction(function () use ($agreement, $userId, $reason) {
            foreach ($agreement->coveredPayments()->lockForUpdate()->get() as $payment) {
                $payment->update([
                    'status' => $payment->pre_agreement_status ?: PlaClubTeamPayment::STATUS_PENDING,
                    'agreement_id' => null,
                    'agreement_role' => null,
                    'pre_agreement_status' => null,
                ]);
            }

            foreach ($agreement->installmentPayments()->lockForUpdate()->get() as $installment) {
                $installment->update([
                    'status' => PlaClubTeamPayment::STATUS_CANCELLED,
                    'is_canceled' => true,
                    'remaining_amount' => 0,
                    'comments' => trim(($installment->comments ?? '')." Anulado con el acuerdo #{$agreement->id}."),
                ]);
            }

            $agreement->update([
                'status' => PlaClubTeamPaymentAgreement::STATUS_CANCELLED,
                'cancelled_by' => $userId,
                'cancelled_at' => now(),
                'cancellation_reason' => $reason,
            ]);
        });
    }
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `docker compose exec saas_sport_app php artisan test --filter=PaymentAgreementCancellationTest`
Expected: PASS los 4 tests.

- [ ] **Step 5: Formato y commit**

```bash
cd saas_sport
./vendor/bin/pint app/Services/PaymentAgreementService.php
git add app/Services/PaymentAgreementService.php tests/Feature/PaymentAgreementCancellationTest.php
git commit -m "feat: anulacion de acuerdos de pago"
```

---

## Task 5: Endpoints HTTP

**Files:**
- Create: `saas_sport/app/Http/Controllers/PlaClubTeamPaymentAgreementController.php`
- Create: `saas_sport/app/Http/Requests/StorePaymentAgreementRequest.php`
- Create: `saas_sport/app/Policies/PlaClubTeamPaymentAgreementPolicy.php`
- Modify: `saas_sport/routes/api.php`
- Test: `saas_sport/tests/Feature/PaymentAgreementApiTest.php`

**Interfaces:**
- Consumes: `PaymentAgreementService` de las Tasks 3 y 4.
- Produces: rutas bajo `/api/pla_club_teams/{club}/`:
  - `GET payment-agreements` → `{data: [...], meta: {...}}`
  - `GET payment-agreements/{agreement}`
  - `POST payment-agreements`
  - `POST payment-agreements/{agreement}/cancel`
  - `GET players/{player}/agreement-eligible-payments`

- [ ] **Step 1: Escribir el test que falla**

`saas_sport/tests/Feature/PaymentAgreementApiTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\PlaClubTeamCharge;
use App\Models\PlaClubTeamPayment;
use App\Models\PlaClubTeamPlayer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Tests\Traits\CreatesClubWithRoles;
use Tests\Traits\SeedsBaseData;

class PaymentAgreementApiTest extends TestCase
{
    use CreatesClubWithRoles, RefreshDatabase, SeedsBaseData;

    private PlaClubTeamPlayer $player;

    private PlaClubTeamPayment $debt;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedBaseData();
        $this->createClubWithOwner();
        $this->createAllRoles();
        $this->createTrialSubscription($this->club);

        $this->player = PlaClubTeamPlayer::factory()->create(['club_id' => $this->club->id]);
        $charge = PlaClubTeamCharge::factory()->create(['club_id' => $this->club->id, 'amount' => 200000]);
        $this->debt = PlaClubTeamPayment::factory()->create([
            'club_id' => $this->club->id,
            'player_id' => $this->player->id,
            'charge_id' => $charge->id,
            'status' => PlaClubTeamPayment::STATUS_PENDING,
            'amount_due' => 200000,
            'remaining_amount' => 200000,
            'due_date' => now()->subMonth(),
        ]);
    }

    private function payload(): array
    {
        return [
            'player_id' => $this->player->id,
            'agreement_date' => now()->toDateString(),
            'total_amount' => 150000,
            'description' => 'Acuerdo por mensualidad atrasada',
            'payment_ids' => [$this->debt->id],
            'installments' => [
                ['amount' => 75000, 'due_date' => now()->addDays(10)->toDateString()],
                ['amount' => 75000, 'due_date' => now()->addDays(25)->toDateString()],
            ],
        ];
    }

    public function test_owner_can_create_an_agreement(): void
    {
        Sanctum::actingAs($this->owner);

        $this->postJson("/api/pla_club_teams/{$this->club->id}/payment-agreements", $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.total_amount', '150000.00')
            ->assertJsonPath('data.installments_count', 2)
            ->assertJsonCount(2, 'data.installment_payments');
    }

    public function test_eligible_payments_lists_only_live_debt(): void
    {
        Sanctum::actingAs($this->owner);

        $this->getJson("/api/pla_club_teams/{$this->club->id}/players/{$this->player->id}/agreement-eligible-payments")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $this->debt->id);
    }

    public function test_index_lists_agreements_of_the_club(): void
    {
        Sanctum::actingAs($this->owner);
        $this->postJson("/api/pla_club_teams/{$this->club->id}/payment-agreements", $this->payload())->assertCreated();

        $this->getJson("/api/pla_club_teams/{$this->club->id}/payment-agreements")
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_owner_can_cancel_an_agreement(): void
    {
        Sanctum::actingAs($this->owner);
        $id = $this->postJson("/api/pla_club_teams/{$this->club->id}/payment-agreements", $this->payload())
            ->json('data.id');

        $this->postJson("/api/pla_club_teams/{$this->club->id}/payment-agreements/{$id}/cancel", [
            'reason' => 'Error de captura',
        ])->assertOk();

        $this->assertSame(PlaClubTeamPayment::STATUS_PENDING, $this->debt->fresh()->status);
    }

    public function test_trainer_cannot_create_an_agreement(): void
    {
        Sanctum::actingAs($this->trainerUser);

        $this->postJson("/api/pla_club_teams/{$this->club->id}/payment-agreements", $this->payload())
            ->assertForbidden();
    }

    public function test_parent_cannot_list_agreements(): void
    {
        Sanctum::actingAs($this->parentUser);

        $this->getJson("/api/pla_club_teams/{$this->club->id}/payment-agreements")
            ->assertForbidden();
    }

    public function test_installments_that_do_not_add_up_are_rejected(): void
    {
        Sanctum::actingAs($this->owner);

        $payload = $this->payload();
        $payload['installments'] = [['amount' => 10000, 'due_date' => now()->addDays(10)->toDateString()]];

        $this->postJson("/api/pla_club_teams/{$this->club->id}/payment-agreements", $payload)
            ->assertStatus(422);
    }
}
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `docker compose exec saas_sport_app php artisan test --filter=PaymentAgreementApiTest`
Expected: FAIL con 404 en todas las rutas.

- [ ] **Step 3: Crear el Form Request**

`app/Http/Requests/StorePaymentAgreementRequest.php`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentAgreementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // El controlador aplica assertCanManageAgreements()
    }

    public function rules(): array
    {
        return [
            'player_id' => ['required', 'integer', 'exists:pla_club_teams_players,id'],
            'agreement_date' => ['required', 'date'],
            'total_amount' => ['required', 'numeric', 'min:1'],
            'description' => ['required', 'string', 'min:5', 'max:2000'],
            'payment_ids' => ['required', 'array', 'min:1'],
            'payment_ids.*' => ['integer', 'distinct'],
            'installments' => ['required', 'array', 'min:1', 'max:36'],
            'installments.*.amount' => ['required', 'numeric', 'min:1'],
            'installments.*.due_date' => ['required', 'date'],
        ];
    }
}
```

- [ ] **Step 4: Crear la Policy**

`app/Policies/PlaClubTeamPaymentAgreementPolicy.php`:

```php
<?php

namespace App\Policies;

use App\Models\PlaClubTeam;
use App\Models\User;

class PlaClubTeamPaymentAgreementPolicy
{
    public function viewAny(User $user, PlaClubTeam $club): bool
    {
        return $user->can('payments.view', $club);
    }

    public function create(User $user, PlaClubTeam $club): bool
    {
        return $user->can('payments.create', $club);
    }

    public function cancel(User $user, PlaClubTeam $club): bool
    {
        return $user->can('payments.delete', $club);
    }
}
```

- [ ] **Step 5: Crear el controlador**

`app/Http/Controllers/PlaClubTeamPaymentAgreementController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentAgreementRequest;
use App\Models\PlaClubTeamPaymentAgreement;
use App\Services\PaymentAgreementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlaClubTeamPaymentAgreementController extends Controller
{
    public function __construct(private readonly PaymentAgreementService $service) {}

    /**
     * Gestionar acuerdos es una accion financiera: los mismos roles que
     * gestionan pagos. Se valida aqui, igual que en el controlador de pagos,
     * porque el middleware module.access solo mira el plan del club.
     */
    private function assertCanManageAgreements(int $clubId): void
    {
        $user = auth()->user();

        if ($user->isSuperAdmin() || $user->hasAnyRoleInClub(['owner', 'admin', 'accountant'], $clubId)) {
            return;
        }

        abort(403, 'No tienes permisos para gestionar acuerdos de pago.');
    }

    private function assertCanCancelAgreements(int $clubId): void
    {
        $user = auth()->user();

        if ($user->isSuperAdmin() || $user->hasAnyRoleInClub(['owner', 'accountant'], $clubId)) {
            return;
        }

        abort(403, 'Solo el propietario o el contador pueden anular un acuerdo.');
    }

    public function index(Request $request, int $clubId): JsonResponse
    {
        $this->assertCanManageAgreements($clubId);

        $query = PlaClubTeamPaymentAgreement::withoutGlobalScopes()
            ->with(['player:id,name,lastname', 'creator:id,name'])
            ->withCount([
                'installmentPayments as installments_paid_count' => fn ($q) => $q->where('status', 'COM'),
            ])
            ->where('club_id', $clubId)
            ->orderByDesc('agreement_date');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($playerId = $request->query('player_id')) {
            $query->where('player_id', $playerId);
        }

        $agreements = $query->paginate((int) $request->query('per_page', 20));

        return response()->json([
            'data' => $agreements->items(),
            'meta' => [
                'current_page' => $agreements->currentPage(),
                'last_page' => $agreements->lastPage(),
                'total' => $agreements->total(),
            ],
        ]);
    }

    public function show(int $clubId, int $agreementId): JsonResponse
    {
        $this->assertCanManageAgreements($clubId);

        $agreement = PlaClubTeamPaymentAgreement::withoutGlobalScopes()
            ->with(['player:id,name,lastname', 'creator:id,name', 'coveredPayments.charge:id,name', 'installmentPayments'])
            ->where('club_id', $clubId)
            ->findOrFail($agreementId);

        return response()->json([
            'data' => array_merge($agreement->toArray(), [
                'can_be_cancelled' => $this->service->canBeCancelled($agreement),
            ]),
        ]);
    }

    public function eligiblePayments(int $clubId, int $playerId): JsonResponse
    {
        $this->assertCanManageAgreements($clubId);

        return response()->json([
            'data' => $this->service->eligiblePayments($clubId, $playerId)->map(fn ($payment) => [
                'id' => $payment->id,
                'charge_id' => $payment->charge_id,
                'charge_name' => $payment->charge?->name,
                'description' => $payment->description,
                'due_date' => optional($payment->due_date)->toDateString(),
                'amount_due' => (float) $payment->amount_due,
                'remaining_amount' => (float) $payment->remaining_amount,
                'status' => $payment->status,
                'is_overdue' => $payment->due_date && $payment->due_date->isPast(),
                'currency' => $payment->currency,
            ])->values(),
        ]);
    }

    public function store(StorePaymentAgreementRequest $request, int $clubId): JsonResponse
    {
        $this->assertCanManageAgreements($clubId);

        try {
            $agreement = $this->service->create(
                $clubId,
                (int) $request->input('player_id'),
                $request->validated(),
                auth()->id()
            );
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $agreement->toArray()], 201);
    }

    public function cancel(Request $request, int $clubId, int $agreementId): JsonResponse
    {
        $this->assertCanCancelAgreements($clubId);

        $request->validate(['reason' => ['required', 'string', 'min:3', 'max:500']]);

        $agreement = PlaClubTeamPaymentAgreement::withoutGlobalScopes()
            ->where('club_id', $clubId)
            ->findOrFail($agreementId);

        try {
            $this->service->cancel($agreement, auth()->id(), $request->input('reason'));
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'Acuerdo anulado.']);
    }
}
```

- [ ] **Step 6: Registrar las rutas**

En `routes/api.php`, dentro del bloque `Route::middleware('module.access:payments')` que ya envuelve `apiResource('payments')` (alrededor de la línea 913), añadir:

```php
        Route::get('payment-agreements', [PlaClubTeamPaymentAgreementController::class, 'index']);
        Route::get('payment-agreements/{agreement}', [PlaClubTeamPaymentAgreementController::class, 'show']);
        Route::post('payment-agreements', [PlaClubTeamPaymentAgreementController::class, 'store']);
        Route::post('payment-agreements/{agreement}/cancel', [PlaClubTeamPaymentAgreementController::class, 'cancel']);
        Route::get('players/{player}/agreement-eligible-payments', [PlaClubTeamPaymentAgreementController::class, 'eligiblePayments']);
```

y el `use App\Http\Controllers\PlaClubTeamPaymentAgreementController;` en la cabecera del archivo.

- [ ] **Step 7: Registrar la Policy**

En `app/Providers/AuthServiceProvider.php` (o donde el proyecto registre el mapa `$policies`), añadir:

```php
        \App\Models\PlaClubTeamPaymentAgreement::class => \App\Policies\PlaClubTeamPaymentAgreementPolicy::class,
```

- [ ] **Step 8: Correr el test y verificar que pasa**

Run: `docker compose exec saas_sport_app php artisan test --filter=PaymentAgreementApiTest`
Expected: PASS los 7 tests.

- [ ] **Step 9: Formato y commit**

```bash
cd saas_sport
./vendor/bin/pint app/Http/Controllers/PlaClubTeamPaymentAgreementController.php app/Http/Requests/StorePaymentAgreementRequest.php app/Policies/PlaClubTeamPaymentAgreementPolicy.php
git add app/Http/Controllers/PlaClubTeamPaymentAgreementController.php app/Http/Requests/StorePaymentAgreementRequest.php app/Policies/PlaClubTeamPaymentAgreementPolicy.php app/Providers/AuthServiceProvider.php routes/api.php tests/Feature/PaymentAgreementApiTest.php
git commit -m "feat: endpoints de acuerdos de pago"
```

---

## Task 6: Cerrar el doble conteo en métricas, cobranza y vista del padre

**Files:**
- Modify: `saas_sport/app/Services/PaymentStatsService.php`
- Modify: `saas_sport/app/Services/Workflows/CollectionCycleService.php`
- Modify: `saas_sport/app/Http/Controllers/Api/SimpleDashboardController.php`
- Modify: `saas_sport/app/Http/Controllers/ParentChildController.php`
- Modify: `saas_sport/app/Http/Controllers/Api/FinancialReportController.php`
- Modify: `saas_sport/app/Http/Controllers/PlaClubTeamChargeController.php`
- Test: `saas_sport/tests/Feature/PaymentAgreementNoDoubleCountingTest.php`

**Interfaces:**
- Consumes: `STATUS_AGREED` y el servicio de las Tasks 2-4.

- [ ] **Step 1: Escribir el test que falla**

`saas_sport/tests/Feature/PaymentAgreementNoDoubleCountingTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\PlaClubTeamCharge;
use App\Models\PlaClubTeamPayment;
use App\Models\PlaClubTeamPlayer;
use App\Services\PaymentAgreementService;
use App\Services\PaymentStatsService;
use App\Services\Workflows\CollectionCycleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Tests\Traits\CreatesClubWithRoles;
use Tests\Traits\SeedsBaseData;

class PaymentAgreementNoDoubleCountingTest extends TestCase
{
    use CreatesClubWithRoles, RefreshDatabase, SeedsBaseData;

    private PlaClubTeamPlayer $player;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedBaseData();
        $this->createClubWithOwner();
        $this->createAllRoles();
        $this->createTrialSubscription($this->club);

        $this->player = PlaClubTeamPlayer::factory()->create(['club_id' => $this->club->id]);
        $charge = PlaClubTeamCharge::factory()->create(['club_id' => $this->club->id, 'amount' => 200000]);
        $debt = PlaClubTeamPayment::factory()->create([
            'club_id' => $this->club->id,
            'player_id' => $this->player->id,
            'charge_id' => $charge->id,
            'status' => PlaClubTeamPayment::STATUS_PENDING,
            'amount_due' => 200000,
            'remaining_amount' => 200000,
            'due_date' => now()->subMonths(2),
        ]);

        app(PaymentAgreementService::class)->create($this->club->id, $this->player->id, [
            'agreement_date' => now()->toDateString(),
            'total_amount' => 150000,
            'description' => 'Acuerdo por mensualidad atrasada',
            'payment_ids' => [$debt->id],
            'installments' => [['amount' => 150000, 'due_date' => now()->addDays(20)->toDateString()]],
        ], $this->owner->id);
    }

    public function test_total_billed_counts_the_agreement_once(): void
    {
        // 200.000 originales + 150.000 de la cuota seria doble conteo: solo cuenta la cuota.
        $this->assertSame(150000.0, app(PaymentStatsService::class)->getTotalBilled($this->club->id));
    }

    public function test_collection_rate_ignores_covered_charges(): void
    {
        $rate = app(PaymentStatsService::class)->getCollectionRate($this->club->id);

        // Una sola obligacion viva (la cuota), sin pagar.
        $this->assertSame(0.0, $rate);
    }

    public function test_the_player_leaves_the_collection_cycle(): void
    {
        $debtors = app(CollectionCycleService::class)->findEligibleDebtors($this->club->id);

        $this->assertEmpty(collect($debtors)->where('player_id', $this->player->id));
    }

    public function test_collections_list_shows_the_agreed_amount_not_the_original(): void
    {
        Sanctum::actingAs($this->owner);

        $response = $this->getJson('/api/dashboard/collections?club_id='.$this->club->id)->assertOk();
        $row = collect($response->json('data'))->firstWhere('player_id', $this->player->id);

        // El acuerdo aun no esta vencido, asi que el jugador no deberia salir en cobranza.
        $this->assertNull($row);
    }

    public function test_the_parent_does_not_see_the_covered_charge_as_pending(): void
    {
        Sanctum::actingAs($this->parentUser);

        $response = $this->getJson("/api/pla_club_teams/{$this->club->id}/children-payments")->assertOk();
        $statuses = collect($response->json('data.children.*.pending_payments.*.status'))->flatten();

        $this->assertNotContains(PlaClubTeamPayment::STATUS_AGREED, $statuses);
    }

    public function test_the_synthetic_charge_is_not_listed_in_the_charges_screen(): void
    {
        Sanctum::actingAs($this->owner);

        $names = collect($this->getJson("/api/pla_club_teams/{$this->club->id}/charges")->assertOk()->json('data'))
            ->pluck('name');

        $this->assertNotContains(PaymentAgreementService::SYNTHETIC_CHARGE_NAME, $names);
    }
}
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `docker compose exec saas_sport_app php artisan test --filter=PaymentAgreementNoDoubleCountingTest`
Expected: FAIL en `test_total_billed_counts_the_agreement_once` (devuelve 350000.0) y en el test del cobro sintético.

- [ ] **Step 3: Excluir `AGR` de lo facturado y de la tasa de recaudo**

En `app/Services/PaymentStatsService.php`, en `getTotalBilled()` (línea 150) cambiar:

```php
            ->whereNotIn('status', [PlaClubTeamPayment::STATUS_CANCELLED]);
```

por:

```php
            // AGR fuera: el cobro suplido y la cuota del acuerdo son la misma
            // obligacion contada dos veces.
            ->whereNotIn('status', [PlaClubTeamPayment::STATUS_CANCELLED, PlaClubTeamPayment::STATUS_AGREED]);
```

Aplicar el mismo cambio en `getCollectionRate()` (línea 169).

- [ ] **Step 4: Sustituir listas hardcodeadas por `DEBT_STATUSES`**

Reemplazar cada aparición literal de `['PEN', 'PAR', 'OVD']` (en cualquier orden y formato) por `PlaClubTeamPayment::DEBT_STATUSES` en:

- `app/Services/PaymentStatsService.php` → `debtorsSummary()` (~línea 236)
- `app/Services/Workflows/CollectionCycleService.php` → `findEligibleDebtors()` (~línea 439)
- `app/Http/Controllers/Api/SimpleDashboardController.php` → `getPlayerDebtsDetail()` (~línea 911) y `accountantDashboard()` (~línea 2517)
- `app/Http/Controllers/PlaClubTeamPaymentController.php` → `changeCharge()` (~línea 1067)

En los que usan SQL crudo (`status IN ('PEN','PAR','OVD')`), construir la lista con
`"'".implode("','", PlaClubTeamPayment::DEBT_STATUSES)."'"` o convertir a query builder.
Importar el modelo donde falte.

- [ ] **Step 5: Sacar `AGR` de la vista del padre**

En `app/Http/Controllers/ParentChildController.php`:

- En la query de pagos (~línea 631) que hoy excluye solo `CXL`, excluir también `PlaClubTeamPayment::STATUS_AGREED` del bucket de pendientes.
- En el mapa de buckets (~líneas 659-662) y en el de etiquetas (~líneas 731-735), añadir `AGR` con la etiqueta `'En acuerdo'` y clasificarlo en el bucket de historial, nunca en `pending`.
- En el orden (~línea 765), colocar `AGR` al final.

- [ ] **Step 6: Blindar los reportes financieros**

En `app/Http/Controllers/Api/FinancialReportController.php`, en `incomeByCharge()` (~línea 210) y `yearComparison()` (~línea 334), añadir a la query sobre `payments` (alias `pay` o el que use cada join):

```php
            ->where('pay.status', '!=', \App\Models\PlaClubTeamPayment::STATUS_AGREED)
```

- [ ] **Step 7: Ocultar el cobro sintético de la pantalla de cobros**

En `app/Http/Controllers/PlaClubTeamChargeController.php`, en `index()` (~línea 50), añadir a la query:

```php
        // Los cobros ocultos son internos (cuotas de acuerdos, torneos): no son
        // conceptos que el club administre desde esta pantalla.
        if (! $request->boolean('include_hidden')) {
            $query->where('is_hidden', false);
        }
```

- [ ] **Step 8: Correr el test y verificar que pasa**

Run: `docker compose exec saas_sport_app php artisan test --filter=PaymentAgreementNoDoubleCountingTest`
Expected: PASS los 6 tests.

- [ ] **Step 9: Correr toda la suite financiera para detectar regresiones**

Run: `docker compose exec saas_sport_app php artisan test --filter="Payment|Collection|Dashboard|Charge|Financial|Reminder"`
Expected: PASS. Cualquier fallo aquí es una regresión real de este task, no un test frágil: revisarlo antes de continuar.

- [ ] **Step 10: Formato y commit**

```bash
cd saas_sport
./vendor/bin/pint
git add app/Services/PaymentStatsService.php app/Services/Workflows/CollectionCycleService.php app/Http/Controllers/Api/SimpleDashboardController.php app/Http/Controllers/ParentChildController.php app/Http/Controllers/Api/FinancialReportController.php app/Http/Controllers/PlaClubTeamChargeController.php app/Http/Controllers/PlaClubTeamPaymentController.php tests/Feature/PaymentAgreementNoDoubleCountingTest.php
git commit -m "fix: evitar doble conteo de deuda con acuerdos de pago"
```

---

## Task 7: Tools del asistente IA

**Files:**
- Create: `saas_sport/app/Services/Assistant/Tools/PaymentAgreementTools.php`
- Modify: `saas_sport/app/Services/ClubAssistantToolExecutor.php`
- Modify: `saas_sport/app/Services/Assistant/ToolDefinitions.php`
- Modify: `saas_sport/app/Services/Assistant/AutonomyService.php`
- Modify: `saas_sport/app/Services/Assistant/SystemPromptBuilder.php`
- Modify: `saas_sport/tests/Feature/AssistantRoleToolFilteringTest.php`
- Create: `saas_sport/tests/Feature/AssistantPaymentAgreementToolsTest.php`
- Create: `saas_sport/tests/Evals/cases/payment_agreements.yaml`

**Interfaces:**
- Produces: tools `getPaymentAgreements` (lectura) y `createPaymentAgreement` (escritura con `confirmed`).

- [ ] **Step 1: Escribir el test que falla**

`saas_sport/tests/Feature/AssistantPaymentAgreementToolsTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\PlaClubTeamCharge;
use App\Models\PlaClubTeamPayment;
use App\Models\PlaClubTeamPlayer;
use App\Services\Assistant\ToolDefinitions;
use App\Services\ClubAssistantToolExecutor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\CreatesClubWithRoles;
use Tests\Traits\SeedsBaseData;

class AssistantPaymentAgreementToolsTest extends TestCase
{
    use CreatesClubWithRoles, RefreshDatabase, SeedsBaseData;

    private PlaClubTeamPlayer $player;

    private PlaClubTeamPayment $debt;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seedBaseData();
        $this->createClubWithOwner();
        $this->createAllRoles();

        $this->player = PlaClubTeamPlayer::factory()->create([
            'club_id' => $this->club->id,
            'name' => 'Mateo',
            'lastname' => 'Restrepo',
        ]);
        $charge = PlaClubTeamCharge::factory()->create(['club_id' => $this->club->id, 'amount' => 200000]);
        $this->debt = PlaClubTeamPayment::factory()->create([
            'club_id' => $this->club->id,
            'player_id' => $this->player->id,
            'charge_id' => $charge->id,
            'status' => PlaClubTeamPayment::STATUS_PENDING,
            'amount_due' => 200000,
            'remaining_amount' => 200000,
            'due_date' => now()->subMonth(),
        ]);
    }

    private function callTool(string $tool, array $input): array
    {
        return app(ClubAssistantToolExecutor::class)
            ->execute($tool, $input, $this->club->id, $this->owner->id);
    }

    public function test_create_preview_does_not_write(): void
    {
        $result = $this->callTool('createPaymentAgreement', [
            'player_id' => $this->player->id,
            'total_amount' => 150000,
            'description' => 'Acuerdo por mensualidad atrasada',
            'payment_ids' => [$this->debt->id],
            'installments' => [['amount' => 150000, 'due_date' => now()->addDays(15)->toDateString()]],
            'confirmed' => false,
        ]);

        $this->assertTrue($result['success']);
        $this->assertTrue($result['data']['preview']);
        $this->assertDatabaseCount('pla_club_teams_payment_agreements', 0);
        $this->assertSame(PlaClubTeamPayment::STATUS_PENDING, $this->debt->fresh()->status);
    }

    public function test_create_confirmed_writes(): void
    {
        $result = $this->callTool('createPaymentAgreement', [
            'player_id' => $this->player->id,
            'total_amount' => 150000,
            'description' => 'Acuerdo por mensualidad atrasada',
            'payment_ids' => [$this->debt->id],
            'installments' => [['amount' => 150000, 'due_date' => now()->addDays(15)->toDateString()]],
            'confirmed' => true,
        ]);

        $this->assertTrue($result['success']);
        $this->assertDatabaseCount('pla_club_teams_payment_agreements', 1);
        $this->assertSame(PlaClubTeamPayment::STATUS_AGREED, $this->debt->fresh()->status);
    }

    public function test_read_tool_lists_agreements(): void
    {
        $this->callTool('createPaymentAgreement', [
            'player_id' => $this->player->id,
            'total_amount' => 150000,
            'description' => 'Acuerdo por mensualidad atrasada',
            'payment_ids' => [$this->debt->id],
            'installments' => [['amount' => 150000, 'due_date' => now()->addDays(15)->toDateString()]],
            'confirmed' => true,
        ]);

        $result = $this->callTool('getPaymentAgreements', []);

        $this->assertTrue($result['success']);
        $this->assertCount(1, $result['data']['agreements']);
    }

    public function test_trainer_cannot_reach_the_write_tool(): void
    {
        $result = app(ClubAssistantToolExecutor::class)
            ->execute('createPaymentAgreement', ['confirmed' => true], $this->club->id, $this->trainerUser->id);

        $this->assertFalse($result['success']);
    }

    public function test_accountant_sees_both_tools(): void
    {
        $names = collect(ToolDefinitions::get('accountant'))->pluck('name');

        $this->assertContains('getPaymentAgreements', $names);
        $this->assertContains('createPaymentAgreement', $names);
    }
}
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `docker compose exec saas_sport_app php artisan test --filter=AssistantPaymentAgreementToolsTest`
Expected: FAIL — el executor no reconoce las tools.

- [ ] **Step 3: Crear el handler**

`app/Services/Assistant/Tools/PaymentAgreementTools.php`:

```php
<?php

namespace App\Services\Assistant\Tools;

use App\Models\PlaClubTeamPaymentAgreement;
use App\Models\PlaClubTeamPlayer;
use App\Services\PaymentAgreementService;

/**
 * Tools de acuerdos de pago para el asistente del club.
 *
 * Un acuerdo saca de la deuda los cobros que supla y los reemplaza por cuotas,
 * asi que la escritura siempre pasa por el par preview/confirmado.
 */
class PaymentAgreementTools extends BaseToolHandler
{
    public function __construct(private readonly PaymentAgreementService $service) {}

    public function getToolMap(): array
    {
        return [
            'getPaymentAgreements' => 'getPaymentAgreements',
            'createPaymentAgreement' => 'createPaymentAgreement',
        ];
    }

    protected function getPaymentAgreements(array $input, int $clubId, ?int $userId = null): array
    {
        $query = PlaClubTeamPaymentAgreement::withoutGlobalScopes()
            ->with('player:id,name,lastname')
            ->where('club_id', $clubId)
            ->orderByDesc('agreement_date');

        if (! empty($input['status'])) {
            $query->where('status', $input['status']);
        }

        if (! empty($input['player_name'])) {
            $name = trim($input['player_name']);
            $query->whereHas('player', function ($q) use ($name) {
                foreach (preg_split('/\s+/', $name) as $term) {
                    $q->where(function ($inner) use ($term) {
                        $inner->where('name', 'like', "%{$term}%")
                            ->orWhere('lastname', 'like', "%{$term}%");
                    });
                }
            });
        }

        $symbol = $this->getCurrencySymbol($clubId);

        $agreements = $query->limit(min((int) ($input['limit'] ?? 15), 30))->get()->map(fn ($a) => [
            'id' => $a->id,
            'player' => trim(($a->player?->name ?? '').' '.($a->player?->lastname ?? '')),
            'agreement_date' => $a->agreement_date?->toDateString(),
            'total_amount' => $symbol.number_format((float) $a->total_amount, 0, ',', '.'),
            'original_debt' => $symbol.number_format((float) $a->original_debt_amount, 0, ',', '.'),
            'installments' => $a->installments_count,
            'status' => $a->status,
            'description' => $a->description,
        ]);

        return [
            'success' => true,
            'data' => [
                'agreements' => $agreements->all(),
                '_note' => 'Los cobros suplidos por un acuerdo activo ya NO son deuda. La deuda viva son las cuotas.',
            ],
            'message' => $agreements->count().' acuerdo(s) encontrado(s).',
        ];
    }

    protected function createPaymentAgreement(array $input, int $clubId, ?int $userId = null): array
    {
        $confirmed = $input['confirmed'] ?? false;

        $playerId = $input['player_id'] ?? null;

        if (! $playerId && ! empty($input['player_name'])) {
            $name = trim($input['player_name']);
            $player = PlaClubTeamPlayer::withoutGlobalScopes()
                ->where('club_id', $clubId)
                ->where(function ($q) use ($name) {
                    foreach (preg_split('/\s+/', $name) as $term) {
                        $q->where(function ($inner) use ($term) {
                            $inner->where('name', 'like', "%{$term}%")
                                ->orWhere('lastname', 'like', "%{$term}%");
                        });
                    }
                })->first();

            if (! $player) {
                return ['success' => false, 'data' => [], 'message' => "No encontre al jugador \"{$name}\"."];
            }

            $playerId = $player->id;
        }

        if (! $playerId) {
            return ['success' => false, 'data' => [], 'message' => 'Necesito saber de que jugador es el acuerdo.'];
        }

        $paymentIds = $input['payment_ids'] ?? [];
        $installments = $input['installments'] ?? [];
        $symbol = $this->getCurrencySymbol($clubId);

        if (! $confirmed) {
            $eligible = $this->service->eligiblePayments($clubId, (int) $paymentIds ? $playerId : $playerId);
            $selected = $eligible->whereIn('id', $paymentIds);
            $originalDebt = (float) $selected->sum('remaining_amount');
            $total = (float) ($input['total_amount'] ?? 0);

            return [
                'success' => true,
                'data' => [
                    'preview' => true,
                    'player_id' => $playerId,
                    'covered_payments' => $selected->count(),
                    'original_debt' => $symbol.number_format($originalDebt, 0, ',', '.'),
                    'agreed_amount' => $symbol.number_format($total, 0, ',', '.'),
                    'installments' => count($installments),
                ],
                'message' => 'Se creara un acuerdo de '.$symbol.number_format($total, 0, ',', '.')
                    .' en '.count($installments).' cuota(s), que reemplaza '.$selected->count()
                    .' cobro(s) por '.$symbol.number_format($originalDebt, 0, ',', '.')
                    .'. Esos cobros dejaran de contar como deuda. El usuario debe confirmar.',
            ];
        }

        try {
            $agreement = $this->service->create($clubId, (int) $playerId, [
                'agreement_date' => $input['agreement_date'] ?? now()->toDateString(),
                'total_amount' => $input['total_amount'] ?? 0,
                'description' => $input['description'] ?? 'Acuerdo de pago registrado via asistente IA',
                'payment_ids' => $paymentIds,
                'installments' => $installments,
            ], $userId);
        } catch (\InvalidArgumentException $e) {
            return ['success' => false, 'data' => [], 'message' => $e->getMessage()];
        }

        return [
            'success' => true,
            'data' => ['agreement_id' => $agreement->id],
            'message' => 'Acuerdo creado por '.$symbol.number_format((float) $agreement->total_amount, 0, ',', '.')
                .' en '.$agreement->installments_count.' cuota(s).',
        ];
    }
}
```

- [ ] **Step 4: Registrar el handler en el executor**

En `app/Services/ClubAssistantToolExecutor.php`, añadir el parámetro al constructor
y la entrada al array `$this->handlers` (~líneas 30-58), siguiendo el estilo de los
handlers existentes:

```php
        private readonly \App\Services\Assistant\Tools\PaymentAgreementTools $paymentAgreementTools,
```

```php
            $this->paymentAgreementTools,
```

- [ ] **Step 5: Añadir los schemas al final de `$generalTools`**

En `app/Services/Assistant/ToolDefinitions.php`, justo antes del cierre del array
`$generalTools` (~línea 945) — al final a propósito, para invalidar el mínimo de
prefijo cacheado:

```php
            [
                'name' => 'getPaymentAgreements',
                'description' => 'Lists payment agreements of the club. A payment agreement replaces one or more overdue charges of a player with an agreed amount paid in one or more installments. The charges it replaces STOP counting as debt; the live debt is the installments.',
                'input_schema' => [
                    'type' => 'object',
                    'properties' => [
                        'player_name' => ['type' => 'string', 'description' => 'Filter by player name.'],
                        'status' => ['type' => 'string', 'enum' => ['active', 'completed', 'cancelled'], 'description' => 'Filter by agreement status.'],
                        'limit' => ['type' => 'integer', 'description' => 'Max results (default 15, max 30).'],
                    ],
                ],
            ],
            [
                'name' => 'createPaymentAgreement',
                'description' => 'Creates a payment agreement: takes specific pending payments of a player and replaces them with an agreed total paid in one or more installments. '
                    .'RULES: (1) Call getPendingPayments or getPaymentHistory first to get the payment_ids. '
                    .'(2) The installment amounts MUST add up to total_amount. '
                    .'(3) The agreed total can be lower than the debt (the club forgives) or higher (surcharge) - the admin decides. '
                    .'ALWAYS call with confirmed=false first to preview, then confirmed=true to execute.',
                'input_schema' => [
                    'type' => 'object',
                    'properties' => [
                        'player_id' => ['type' => 'integer', 'description' => 'Player ID. Preferred over player_name.'],
                        'player_name' => ['type' => 'string', 'description' => 'Player name, if the ID is unknown.'],
                        'payment_ids' => ['type' => 'array', 'items' => ['type' => 'integer'], 'description' => 'IDs of the pending payments the agreement replaces.'],
                        'total_amount' => ['type' => 'number', 'description' => 'Agreed total.'],
                        'agreement_date' => ['type' => 'string', 'description' => 'Date the agreement is made, YYYY-MM-DD. Defaults to today.'],
                        'description' => ['type' => 'string', 'description' => 'What was agreed, in the club admin words.'],
                        'installments' => [
                            'type' => 'array',
                            'description' => 'Installments. Their amounts must add up to total_amount.',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'amount' => ['type' => 'number'],
                                    'due_date' => ['type' => 'string', 'description' => 'YYYY-MM-DD'],
                                ],
                            ],
                        ],
                        'confirmed' => ['type' => 'boolean', 'description' => 'false = preview, true = create the agreement.'],
                    ],
                    'required' => ['payment_ids', 'total_amount', 'installments', 'confirmed'],
                ],
            ],
```

Añadir `'AGR'` al enum de status de `getPaymentHistory` (~línea 256).

- [ ] **Step 6: Registrar en la whitelist del contador y en autonomía**

En `ToolDefinitions::allowedNamesForRole()` (~línea 53), añadir a la lista de `accountant`:

```php
            'getPaymentAgreements',
            'createPaymentAgreement',
```

En `app/Services/Assistant/AutonomyService.php`, dentro de `CATEGORIES` en el bloque `finances` (~línea 47):

```php
        'createPaymentAgreement' => 'finances',
```

(`getPaymentAgreements` es de lectura y no lleva `confirmed`, así que no entra en `CATEGORIES`.)

En `tests/Feature/AssistantRoleToolFilteringTest.php`, añadir los dos nombres a la constante `ACCOUNTANT_TOOLS` (~línea 35).

- [ ] **Step 7: Documentar en el system prompt**

En `app/Services/Assistant/SystemPromptBuilder.php`:

- En `### 📖 Read` (~línea 372): `- getPaymentAgreements: payment agreements and their installments`
- En `### ✏️ Write` (~línea 395): `- createPaymentAgreement: replace overdue charges with an agreed amount in installments (preview first)`
- En `## FINANCIAL DATA RULES (CRITICAL)` (~línea 530), añadir un párrafo:

```
A payment agreement moves money between buckets: the charges it covers leave the
debt bucket entirely (status AGR) and are replaced by its installments, which are
normal pending payments. NEVER add a covered charge and its agreement installments
together - that double counts. If a family has an active agreement, the amount they
owe is the sum of the unpaid installments, not the original charges.
```

- En `## COMMON PATTERNS` (~línea 539): `- "le hice un acuerdo a X" / "vamos a refinanciar la deuda de X" -> createPaymentAgreement`

- [ ] **Step 8: Correr los tests y verificar que pasan**

Run: `docker compose exec saas_sport_app php artisan test --filter="AssistantPaymentAgreementToolsTest|AutonomyMappingTest|AssistantRoleToolFilteringTest|PromptCacheStabilityTest"`
Expected: PASS todos.

- [ ] **Step 9: Añadir el caso de eval**

`tests/Evals/cases/payment_agreements.yaml`:

```yaml
- id: agreements-001
  levels: [executor]
  role: owner
  fixture: ClubEsFixture
  input:
    tool_sequence:
      - tool: createPaymentAgreement
        params:
          player_id: "@player_moroso_1.id"
          payment_ids: ["@payment_moroso_1.id"]
          total_amount: 80000
          description: "Acuerdo por mensualidad atrasada"
          installments:
            - { amount: 80000, due_date: "2026-08-15" }
          confirmed: false
  expected:
    type: assertions
    assertions:
      - success: true
      - result_path: { path: "data.preview", equals: true }
      - db_count: { table: pla_club_teams_payment_agreements, count: 0 }
  tags: [write, preview]

- id: agreements-002
  levels: [executor]
  role: owner
  fixture: ClubEsFixture
  input:
    tool_sequence:
      - tool: createPaymentAgreement
        params:
          player_id: "@player_moroso_1.id"
          payment_ids: ["@payment_moroso_1.id"]
          total_amount: 80000
          description: "Acuerdo por mensualidad atrasada"
          installments:
            - { amount: 80000, due_date: "2026-08-15" }
          confirmed: true
  expected:
    type: assertions
    assertions:
      - success: true
      - db_count: { table: pla_club_teams_payment_agreements, count: 1 }
      - db_has: { table: pla_club_teams_payments, where: { status: AGR } }
  tags: [write]
```

Ajustar los `@refs` a los nombres reales del `ClubEsFixture` (leer
`tests/Evals/Fixtures/ClubEsFixture.php` antes de escribirlos).

Además, añadir `createPaymentAgreement` y `getPaymentAgreements` a la lista
`forbidden_tools` del caso de trainer/player/parent en `tests/Evals/cases/adversarial.yaml`
(~línea 263).

- [ ] **Step 10: Correr los evals**

Run: `docker compose exec saas_sport_app php artisan test --filter="DeterministicToolEvalTest|NoPiiInCaseFilesTest"`
Expected: PASS.

- [ ] **Step 11: Formato y commit**

```bash
cd saas_sport
./vendor/bin/pint
git add app/Services/Assistant app/Services/ClubAssistantToolExecutor.php tests/Feature/AssistantPaymentAgreementToolsTest.php tests/Feature/AssistantRoleToolFilteringTest.php tests/Evals/cases/payment_agreements.yaml tests/Evals/cases/adversarial.yaml
git commit -m "feat: tools de acuerdos de pago en el asistente"
```

---

## Task 8: Frontend — status `AGR`, servicio y hooks

**Files:**
- Modify: `frontend/src/helpers/paymentStatusConfig.js`
- Modify: `frontend/src/i18n/locales/{en,es,pt-BR}/status.json`
- Modify: `frontend/src/helpers/queryKeys.js`
- Create: `frontend/src/services/paymentAgreementApiService.js`
- Create: `frontend/src/hooks/payments/usePaymentAgreements.js`

**Interfaces:**
- Produces:
  - `fetchAgreements(clubId, params)`, `fetchAgreement(clubId, id)`, `fetchEligiblePayments(clubId, playerId)`, `createAgreement(clubId, payload)`, `cancelAgreement(clubId, id, reason)`
  - `usePaymentAgreements(clubId, filters)`, `useAgreementEligiblePayments(clubId, playerId, enabled)`, `usePaymentAgreementMutations(clubId)`
  - `QUERY_KEYS.PAYMENT_AGREEMENTS = 'paymentAgreements'`

- [ ] **Step 1: Añadir el status `AGR`**

En `src/helpers/paymentStatusConfig.js`:

1. En `PAYMENT_STATUS` (~línea 18): `AGREED: 'AGR',`
2. En `PAYMENT_STATUS_CONFIG` (~línea 30), una entrada nueva copiando la forma de las existentes:

```js
  [PAYMENT_STATUS.AGREED]: {
    labelKey: 'status:payment.agreed',
    variant: 'outline',
    icon: Handshake,
    accent: 'bg-gradient-to-r from-indigo-400 to-indigo-500',
    colors: {
      bg: 'bg-indigo-50',
      bgDark: 'dark:bg-indigo-950/30',
      iconColor: 'text-indigo-600',
      iconColorDark: 'dark:text-indigo-300',
      textColor: 'text-indigo-700',
      textColorDark: 'dark:text-indigo-300',
      border: 'border-indigo-200',
      borderDark: 'dark:border-indigo-800',
    },
  },
```

Importar `Handshake` de `lucide-react` en la cabecera del archivo.

3. En `mapToSimpleStatus` (~línea 320), mapear `AGR` a `completed` para la vista del padre (el cobro ya no le corresponde pagarlo).
4. En `getAdminStatusOptions` (~línea 340), añadir la opción con `value: 'AGR'`.
5. En `isPaymentPending` (~línea 280) y `canDeletePayment` (~línea 298), excluir `AGR` explícitamente.

- [ ] **Step 2: Traducir el status en los tres idiomas**

`src/i18n/locales/en/status.json` → dentro de `payment`: `"agreed": "In agreement"`
`src/i18n/locales/es/status.json` → `"agreed": "En acuerdo"`
`src/i18n/locales/pt-BR/status.json` → `"agreed": "Em acordo"`

- [ ] **Step 3: Añadir la clave de cache**

En `src/helpers/queryKeys.js`, en `QUERY_KEYS`: `PAYMENT_AGREEMENTS: 'paymentAgreements',`
y dentro de `invalidatePaymentQueries` (~línea 236), añadir:

```js
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PAYMENT_AGREEMENTS, clubId] });
```

- [ ] **Step 4: Crear el servicio**

`src/services/paymentAgreementApiService.js`:

```js
import axiosInstance from '@/services/axiosInstance';
import { validateClubId, validateId } from '@/helpers/validateId';

const base = (clubId) => `/api/pla_club_teams/${validateClubId(clubId)}`;

export const fetchAgreements = async (clubId, params = {}) => {
  const { data } = await axiosInstance.get(`${base(clubId)}/payment-agreements`, {
    params,
    withCredentials: true,
  });
  return data;
};

export const fetchAgreement = async (clubId, agreementId) => {
  const { data } = await axiosInstance.get(
    `${base(clubId)}/payment-agreements/${validateId(agreementId)}`,
    { withCredentials: true },
  );
  return data?.data;
};

export const fetchEligiblePayments = async (clubId, playerId) => {
  const { data } = await axiosInstance.get(
    `${base(clubId)}/players/${validateId(playerId)}/agreement-eligible-payments`,
    { withCredentials: true },
  );
  return data?.data ?? [];
};

export const createAgreement = async (clubId, payload) => {
  const { data } = await axiosInstance.post(`${base(clubId)}/payment-agreements`, payload, {
    withCredentials: true,
  });
  return data?.data;
};

export const cancelAgreement = async (clubId, agreementId, reason) => {
  const { data } = await axiosInstance.post(
    `${base(clubId)}/payment-agreements/${validateId(agreementId)}/cancel`,
    { reason },
    { withCredentials: true },
  );
  return data;
};
```

- [ ] **Step 5: Crear los hooks**

`src/hooks/payments/usePaymentAgreements.js`:

```js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useToast } from '@/components/ui/use-toast';
import { QUERY_KEYS, invalidatePaymentQueries } from '@/helpers/queryKeys';
import {
  cancelAgreement,
  createAgreement,
  fetchAgreement,
  fetchAgreements,
  fetchEligiblePayments,
} from '@/services/paymentAgreementApiService';

export const usePaymentAgreements = (clubId, filters = {}) =>
  useQuery({
    queryKey: [QUERY_KEYS.PAYMENT_AGREEMENTS, clubId, filters],
    queryFn: () => fetchAgreements(clubId, filters),
    enabled: Boolean(clubId),
    staleTime: 60 * 1000,
  });

export const usePaymentAgreement = (clubId, agreementId) =>
  useQuery({
    queryKey: [QUERY_KEYS.PAYMENT_AGREEMENTS, clubId, 'detail', agreementId],
    queryFn: () => fetchAgreement(clubId, agreementId),
    enabled: Boolean(clubId && agreementId),
  });

export const useAgreementEligiblePayments = (clubId, playerId, enabled = true) =>
  useQuery({
    queryKey: [QUERY_KEYS.PAYMENT_AGREEMENTS, clubId, 'eligible', playerId],
    queryFn: () => fetchEligiblePayments(clubId, playerId),
    enabled: Boolean(clubId && playerId && enabled),
    staleTime: 0,
  });

export const usePaymentAgreementMutations = (clubId) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation('payments');

  const invalidate = () => invalidatePaymentQueries(queryClient, clubId, { includeReports: true });

  const create = useMutation({
    mutationFn: (payload) => createAgreement(clubId, payload),
    onSuccess: () => {
      toast({
        title: t('payment_agreements.created'),
        description: t('payment_agreements.created_desc'),
        className: 'bg-green-300',
        duration: 2000,
      });
      invalidate();
    },
    onError: (error) => {
      toast({
        title: t('common:error'),
        description: error.response?.data?.message || t('payment_agreements.create_error'),
        className: 'bg-red-300',
        duration: 3000,
      });
    },
  });

  const cancel = useMutation({
    mutationFn: ({ agreementId, reason }) => cancelAgreement(clubId, agreementId, reason),
    onSuccess: () => {
      toast({
        title: t('payment_agreements.cancelled'),
        description: t('payment_agreements.cancelled_desc'),
        className: 'bg-green-300',
        duration: 2000,
      });
      invalidate();
    },
    onError: (error) => {
      toast({
        title: t('common:error'),
        description: error.response?.data?.message || t('payment_agreements.cancel_error'),
        className: 'bg-red-300',
        duration: 3000,
      });
    },
  });

  return { create, cancel };
};
```

- [ ] **Step 6: Verificar lint**

Run: `cd frontend && npm run lint`
Expected: 0 errores, 0 warnings.

- [ ] **Step 7: Commit**

```bash
cd frontend
git add src/helpers/paymentStatusConfig.js src/helpers/queryKeys.js src/services/paymentAgreementApiService.js src/hooks/payments/usePaymentAgreements.js src/i18n/locales/en/status.json src/i18n/locales/es/status.json src/i18n/locales/pt-BR/status.json
git commit -m "feat: estado AGR y capa de datos de acuerdos de pago"
```

---

## Task 9: Frontend — wizard de creación

**Files:**
- Create: `frontend/src/components/payments/agreements/PaymentAgreementWizardModal.jsx`
- Create: `frontend/src/components/payments/agreements/hooks/usePaymentAgreementWizard.jsx`
- Create: `frontend/src/components/payments/agreements/WizardStepSelectCharges.jsx`
- Create: `frontend/src/components/payments/agreements/WizardStepAgreementTerms.jsx`
- Create: `frontend/src/components/payments/agreements/WizardStepInstallments.jsx`
- Modify: `frontend/src/i18n/locales/{en,es,pt-BR}/payments.json`

**Interfaces:**
- Consumes: `useAgreementEligiblePayments`, `usePaymentAgreementMutations` de la Task 8.
- Produces: `<PaymentAgreementWizardModal isOpen onClose clubId player onSuccess />`.

- [ ] **Step 1: Escribir el hook del wizard**

`src/components/payments/agreements/hooks/usePaymentAgreementWizard.jsx`. Debe seguir
el patrón de `src/components/charges/hooks/useChargeWizard.jsx`: `currentStep` con ref
espejo, `validateStepN(showErrors)` de firma dual, y `error` global de paso.

```jsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useAgreementEligiblePayments,
  usePaymentAgreementMutations,
} from '@/hooks/payments/usePaymentAgreements';
import { formatISODate } from '@/helpers/dateUtils';

const todayISO = () => formatISODate(new Date());

/**
 * Reparte un total entre n cuotas en enteros: el resto se suma a la primera
 * para que la suma cuadre exactamente con lo pactado.
 */
export const splitAmount = (total, count) => {
  const amount = Number(total) || 0;
  if (!count) return [];
  const base = Math.floor(amount / count);
  const remainder = amount - base * count;
  return Array.from({ length: count }, (_, i) => (i === 0 ? base + remainder : base));
};

export const usePaymentAgreementWizard = ({ clubId, player, onSuccess, isOpen }) => {
  const { t } = useTranslation('payments');
  const [currentStep, setCurrentStep] = useState(1);
  const currentStepRef = useRef(1);
  const [error, setError] = useState('');

  const [selectedIds, setSelectedIds] = useState([]);
  const [totalAmount, setTotalAmount] = useState('');
  const [agreementDate, setAgreementDate] = useState(todayISO());
  const [description, setDescription] = useState('');
  const [installments, setInstallments] = useState([{ amount: '', due_date: '' }]);

  const { data: eligible = [], isLoading } = useAgreementEligiblePayments(clubId, player?.id, isOpen);
  const { create } = usePaymentAgreementMutations(clubId);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setError('');
      setSelectedIds([]);
      setTotalAmount('');
      setAgreementDate(todayISO());
      setDescription('');
      setInstallments([{ amount: '', due_date: '' }]);
    }
  }, [isOpen]);

  const selectedTotal = useMemo(
    () =>
      eligible
        .filter((p) => selectedIds.includes(p.id))
        .reduce((sum, p) => sum + Number(p.remaining_amount || 0), 0),
    [eligible, selectedIds],
  );

  const installmentsTotal = useMemo(
    () => installments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0),
    [installments],
  );

  const difference = useMemo(
    () => (Number(totalAmount) || 0) - selectedTotal,
    [totalAmount, selectedTotal],
  );

  const togglePayment = useCallback((id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const setInstallmentCount = useCallback(
    (count) => {
      const amounts = splitAmount(Number(totalAmount) || 0, count);
      setInstallments((prev) =>
        Array.from({ length: count }, (_, i) => ({
          amount: String(amounts[i] ?? ''),
          due_date: prev[i]?.due_date ?? '',
        })),
      );
    },
    [totalAmount],
  );

  const updateInstallment = useCallback((index, patch) => {
    setInstallments((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }, []);

  const validateStep1 = useCallback(
    (showErrors) => {
      if (selectedIds.length === 0) {
        if (showErrors) setError(t('payment_agreements.errors.select_at_least_one'));
        return false;
      }
      if (showErrors) setError('');
      return true;
    },
    [selectedIds, t],
  );

  const validateStep2 = useCallback(
    (showErrors) => {
      if (!Number(totalAmount)) {
        if (showErrors) setError(t('payment_agreements.errors.amount_required'));
        return false;
      }
      if (description.trim().length < 5) {
        if (showErrors) setError(t('payment_agreements.errors.description_required'));
        return false;
      }
      if (!agreementDate) {
        if (showErrors) setError(t('payment_agreements.errors.date_required'));
        return false;
      }
      if (showErrors) setError('');
      return true;
    },
    [totalAmount, description, agreementDate, t],
  );

  const validateStep3 = useCallback(
    (showErrors) => {
      if (installments.some((i) => !Number(i.amount) || !i.due_date)) {
        if (showErrors) setError(t('payment_agreements.errors.installments_incomplete'));
        return false;
      }
      if (Math.abs(installmentsTotal - Number(totalAmount)) > 1) {
        if (showErrors) setError(t('payment_agreements.errors.installments_mismatch'));
        return false;
      }
      if (showErrors) setError('');
      return true;
    },
    [installments, installmentsTotal, totalAmount, t],
  );

  const handleNext = useCallback(() => {
    if (currentStep === 1 && validateStep1(true)) {
      setCurrentStep(2);
      return;
    }
    if (currentStep === 2 && validateStep2(true)) {
      setInstallmentCount(installments.length || 1);
      setCurrentStep(3);
    }
  }, [currentStep, validateStep1, validateStep2, setInstallmentCount, installments.length]);

  const handleSubmit = useCallback(() => {
    if (currentStepRef.current < 3) return;
    if (!validateStep1(false)) {
      setCurrentStep(1);
      setTimeout(() => validateStep1(true), 50);
      return;
    }
    if (!validateStep2(false)) {
      setCurrentStep(2);
      setTimeout(() => validateStep2(true), 50);
      return;
    }
    if (!validateStep3(true)) return;

    create.mutate(
      {
        player_id: player.id,
        agreement_date: agreementDate,
        total_amount: Number(totalAmount),
        description: description.trim(),
        payment_ids: selectedIds,
        installments: installments.map((i) => ({
          amount: Number(i.amount),
          due_date: i.due_date,
        })),
      },
      { onSuccess: () => onSuccess?.() },
    );
  }, [
    validateStep1,
    validateStep2,
    validateStep3,
    create,
    player,
    agreementDate,
    totalAmount,
    description,
    selectedIds,
    installments,
    onSuccess,
  ]);

  return {
    currentStep,
    setCurrentStep,
    handleNext,
    handleSubmit,
    isSubmitting: create.isPending,
    error,
    isLoading,
    eligible,
    selectedIds,
    togglePayment,
    selectedTotal,
    totalAmount,
    setTotalAmount,
    agreementDate,
    setAgreementDate,
    description,
    setDescription,
    difference,
    installments,
    installmentsTotal,
    setInstallmentCount,
    updateInstallment,
  };
};
```

- [ ] **Step 2: Escribir el paso 1**

`src/components/payments/agreements/WizardStepSelectCharges.jsx`. Lista las deudas con
el mismo estilo de fila que `PlayerPaymentsSummaryDialog` (borde ámbar pendiente, rojo
vencido) y un `Checkbox` por fila. Muestra abajo el total seleccionado.

```jsx
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import LoadingComponent from '@/components/LoadingComponent';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDisplayDate } from '@/helpers/dateUtils';
import { useCurrency } from '@/hooks/useCurrency';

const WizardStepSelectCharges = ({ wizard }) => {
  const { t } = useTranslation('payments');
  const { formatAmount } = useCurrency();

  if (wizard.isLoading) return <LoadingComponent />;

  if (wizard.eligible.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-6 text-center">
        {t('payment_agreements.no_eligible_charges')}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{t('payment_agreements.select_charges_help')}</p>

      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {wizard.eligible.map((payment) => {
          const selected = wizard.selectedIds.includes(payment.id);
          const tone = payment.is_overdue
            ? 'border-red-200 bg-red-50/50 dark:bg-red-950/10'
            : 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/10';

          return (
            <label
              key={payment.id}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${tone} ${
                selected ? 'ring-2 ring-primary/40' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selected}
                  onCheckedChange={() => wizard.togglePayment(payment.id)}
                />
                <div>
                  <p className="text-sm font-medium">
                    {payment.charge_name || payment.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {payment.due_date ? formatDisplayDate(payment.due_date) : '—'}
                  </p>
                </div>
              </div>
              <span
                className={`text-sm font-bold ${
                  payment.is_overdue ? 'text-red-600' : 'text-amber-600'
                }`}
              >
                {formatAmount(payment.remaining_amount)}
              </span>
            </label>
          );
        })}
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border">
        <span className="text-sm text-gray-500">{t('payment_agreements.selected_total')}</span>
        <span className="text-base font-bold">{formatAmount(wizard.selectedTotal)}</span>
      </div>
    </div>
  );
};

WizardStepSelectCharges.propTypes = { wizard: PropTypes.object.isRequired };

export default WizardStepSelectCharges;
```

- [ ] **Step 3: Escribir el paso 2**

`src/components/payments/agreements/WizardStepAgreementTerms.jsx`. Input de moneda con
el patrón de `PaymentAmountSection` (estado crudo, formateo solo sin foco),
`SimpleDatePicker` para la fecha y `Textarea` para la descripción. Muestra la diferencia
contra la deuda seleccionada: verde si el club condona, ámbar si recarga.

```jsx
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import SimpleDatePicker from '@/components/form/SimpleDatePicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatISODate } from '@/helpers/dateUtils';
import { useCurrency } from '@/hooks/useCurrency';

const WizardStepAgreementTerms = ({ wizard }) => {
  const { t } = useTranslation('payments');
  const { formatAmount } = useCurrency();
  const [amountFocused, setAmountFocused] = useState(false);

  const forgiven = wizard.difference < 0;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="agreement-amount">{t('payment_agreements.total_amount')}</Label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <Input
            id="agreement-amount"
            type="text"
            inputMode="numeric"
            className="pl-7 text-sm h-9"
            placeholder="0"
            onFocus={(e) => {
              setAmountFocused(true);
              const input = e.target;
              setTimeout(() => input.select(), 0);
            }}
            onBlur={() => setAmountFocused(false)}
            value={
              amountFocused
                ? wizard.totalAmount || ''
                : wizard.totalAmount
                  ? new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(
                      Number(wizard.totalAmount),
                    )
                  : ''
            }
            onChange={(e) => wizard.setTotalAmount(e.target.value.replace(/\D/g, ''))}
          />
        </div>
      </div>

      {Boolean(Number(wizard.totalAmount)) && (
        <div
          className={`p-3 rounded-lg border text-sm ${
            forgiven
              ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
          }`}
        >
          {forgiven
            ? t('payment_agreements.forgives', { amount: formatAmount(Math.abs(wizard.difference)) })
            : t('payment_agreements.surcharge', { amount: formatAmount(wizard.difference) })}
        </div>
      )}

      <SimpleDatePicker
        label={t('payment_agreements.agreement_date')}
        value={wizard.agreementDate ? new Date(`${wizard.agreementDate}T00:00:00`) : null}
        onChange={(date) => wizard.setAgreementDate(date ? formatISODate(date) : '')}
      />

      <div>
        <Label htmlFor="agreement-description">{t('payment_agreements.description')}</Label>
        <Textarea
          id="agreement-description"
          className="mt-1"
          rows={3}
          placeholder={t('payment_agreements.description_placeholder')}
          value={wizard.description}
          onChange={(e) => wizard.setDescription(e.target.value)}
        />
      </div>
    </div>
  );
};

WizardStepAgreementTerms.propTypes = { wizard: PropTypes.object.isRequired };

export default WizardStepAgreementTerms;
```

- [ ] **Step 4: Escribir el paso 3**

`src/components/payments/agreements/WizardStepInstallments.jsx`. Selector del número de
cuotas (Radix `Select`, 1 a 12), reparto automático editable y una fecha por cuota.
Cierra con el resumen de lo que quedará suplido.

```jsx
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import SimpleDatePicker from '@/components/form/SimpleDatePicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatISODate } from '@/helpers/dateUtils';
import { useCurrency } from '@/hooks/useCurrency';

const COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const WizardStepInstallments = ({ wizard }) => {
  const { t } = useTranslation('payments');
  const { formatAmount } = useCurrency();

  const mismatch = Math.abs(wizard.installmentsTotal - Number(wizard.totalAmount)) > 1;

  return (
    <div className="space-y-4">
      <div>
        <Label>{t('payment_agreements.installments_count')}</Label>
        <Select
          value={String(wizard.installments.length)}
          onValueChange={(value) => wizard.setInstallmentCount(Number(value))}
        >
          <SelectTrigger className="mt-1 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COUNTS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {t('payment_agreements.installments_option', { count: n })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {wizard.installments.map((installment, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-lg border bg-gray-50 dark:bg-gray-900"
          >
            <div>
              <Label className="text-xs">
                {t('payment_agreements.installment_amount', { number: index + 1 })}
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                className="mt-1 h-9 text-sm"
                value={installment.amount}
                onChange={(e) =>
                  wizard.updateInstallment(index, { amount: e.target.value.replace(/\D/g, '') })
                }
              />
            </div>
            <SimpleDatePicker
              label={t('payment_agreements.installment_due_date')}
              value={installment.due_date ? new Date(`${installment.due_date}T00:00:00`) : null}
              onChange={(date) =>
                wizard.updateInstallment(index, { due_date: date ? formatISODate(date) : '' })
              }
            />
          </div>
        ))}
      </div>

      <div
        className={`flex items-center justify-between p-3 rounded-lg border ${
          mismatch
            ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
            : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
        }`}
      >
        <span className="text-sm">{t('payment_agreements.installments_total')}</span>
        <span
          className={`text-base font-bold ${
            mismatch ? 'text-red-600' : 'text-green-700 dark:text-green-300'
          }`}
        >
          {formatAmount(wizard.installmentsTotal)}
        </span>
      </div>

      <p className="text-xs text-gray-500">
        {t('payment_agreements.covered_summary', { count: wizard.selectedIds.length })}
      </p>
    </div>
  );
};

WizardStepInstallments.propTypes = { wizard: PropTypes.object.isRequired };

export default WizardStepInstallments;
```

- [ ] **Step 5: Escribir el shell del wizard**

`src/components/payments/agreements/PaymentAgreementWizardModal.jsx`, calcado del
stepper de `ChargeWizardModal` (activo `bg-primary/10 text-primary border border-primary/20`,
completado `bg-emerald-500 text-white` con `<Check/>`, conector `w-6 h-px`), pero con
todos los textos traducidos.

```jsx
import { Check, Handshake, ListChecks, Loader2, Receipt } from 'lucide-react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import WizardStepAgreementTerms from './WizardStepAgreementTerms';
import WizardStepInstallments from './WizardStepInstallments';
import WizardStepSelectCharges from './WizardStepSelectCharges';
import { usePaymentAgreementWizard } from './hooks/usePaymentAgreementWizard';

const PaymentAgreementWizardModal = ({ isOpen, onClose, clubId, player, onSuccess }) => {
  const { t } = useTranslation('payments');
  const wizard = usePaymentAgreementWizard({
    clubId,
    player,
    isOpen,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  const steps = [
    { id: 1, title: t('payment_agreements.step_charges'), icon: Receipt },
    { id: 2, title: t('payment_agreements.step_terms'), icon: Handshake },
    { id: 3, title: t('payment_agreements.step_installments'), icon: ListChecks },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('payment_agreements.title')}</DialogTitle>
          <DialogDescription>
            {t('payment_agreements.subtitle', {
              player: `${player?.name ?? ''} ${player?.lastname ?? ''}`.trim(),
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 py-2">
          {steps.map((step, index) => {
            const isActive = wizard.currentStep === step.id;
            const isCompleted = wizard.currentStep > step.id;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!isCompleted}
                  onClick={() => isCompleted && wizard.setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-6 h-px ${isCompleted ? 'bg-emerald-400' : 'bg-border'}`} />
                )}
              </div>
            );
          })}
        </div>

        {wizard.error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-2">
            {wizard.error}
          </div>
        )}

        {wizard.currentStep === 1 && <WizardStepSelectCharges wizard={wizard} />}
        {wizard.currentStep === 2 && <WizardStepAgreementTerms wizard={wizard} />}
        {wizard.currentStep === 3 && <WizardStepInstallments wizard={wizard} />}

        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() =>
              wizard.currentStep === 1 ? onClose() : wizard.setCurrentStep(wizard.currentStep - 1)
            }
          >
            {wizard.currentStep === 1 ? t('common:cancel') : t('common:previous')}
          </Button>

          {wizard.currentStep < 3 ? (
            <Button onClick={wizard.handleNext}>{t('common:next')}</Button>
          ) : (
            <Button onClick={wizard.handleSubmit} disabled={wizard.isSubmitting}>
              {wizard.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('payment_agreements.create')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

PaymentAgreementWizardModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  clubId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  player: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default PaymentAgreementWizardModal;
```

- [ ] **Step 6: Añadir las claves i18n en los tres idiomas**

En `src/i18n/locales/es/payments.json`, bajo la raíz:

```json
  "payment_agreements": {
    "title": "Acuerdo de pago",
    "subtitle": "Reemplaza los cobros pendientes de {{player}} por un valor pactado",
    "step_charges": "Cobros",
    "step_terms": "Acuerdo",
    "step_installments": "Cuotas",
    "select_charges_help": "Selecciona los cobros que reemplaza este acuerdo. Dejaran de contar como deuda.",
    "no_eligible_charges": "Este jugador no tiene cobros pendientes.",
    "selected_total": "Deuda seleccionada",
    "total_amount": "Valor del acuerdo",
    "agreement_date": "Fecha del acuerdo",
    "description": "Detalle",
    "description_placeholder": "Que se acordo y con quien",
    "forgives": "El club condona {{amount}}",
    "surcharge": "El acuerdo recarga {{amount}} sobre la deuda",
    "installments_count": "Numero de cuotas",
    "installments_option": "{{count}} cuota",
    "installments_option_plural": "{{count}} cuotas",
    "installment_amount": "Cuota {{number}}",
    "installment_due_date": "Fecha de pago",
    "installments_total": "Suma de las cuotas",
    "covered_summary": "Se reemplazaran {{count}} cobro(s) pendientes.",
    "create": "Crear acuerdo",
    "created": "Acuerdo creado",
    "created_desc": "Los cobros suplidos ya no cuentan como deuda.",
    "create_error": "No se pudo crear el acuerdo",
    "cancelled": "Acuerdo anulado",
    "cancelled_desc": "Los cobros originales vuelven a estar pendientes.",
    "cancel_error": "No se pudo anular el acuerdo",
    "cancel_title": "Anular acuerdo",
    "cancel_reason": "Motivo",
    "cancel_confirm": "Anular",
    "cancel_blocked": "No se puede anular: ya hay pagos reportados contra las cuotas.",
    "tab_label": "Acuerdos",
    "empty": "Todavia no hay acuerdos de pago.",
    "column_player": "Jugador",
    "column_date": "Fecha",
    "column_amount": "Valor",
    "column_installments": "Cuotas",
    "column_status": "Estado",
    "detail_title": "Detalle del acuerdo",
    "covered_charges": "Cobros suplidos",
    "agreement_installments": "Cuotas",
    "original_debt": "Deuda original",
    "status_active": "Activo",
    "status_completed": "Completado",
    "status_cancelled": "Anulado",
    "create_from_player": "Crear acuerdo",
    "errors": {
      "select_at_least_one": "Selecciona al menos un cobro.",
      "amount_required": "Indica el valor del acuerdo.",
      "description_required": "Escribe un detalle de al menos 5 caracteres.",
      "date_required": "Indica la fecha del acuerdo.",
      "installments_incomplete": "Cada cuota necesita valor y fecha.",
      "installments_mismatch": "La suma de las cuotas no coincide con el valor del acuerdo."
    }
  },
```

Traducir el mismo bloque en `en/payments.json` y `pt-BR/payments.json` con las mismas
claves. Inglés es el fallback, así que no puede faltar ninguna.

- [ ] **Step 7: Verificar lint y build**

Run: `cd frontend && npm run lint && npm run build`
Expected: sin errores.

- [ ] **Step 8: Commit**

```bash
cd frontend
git add src/components/payments/agreements src/i18n/locales/en/payments.json src/i18n/locales/es/payments.json src/i18n/locales/pt-BR/payments.json
git commit -m "feat: wizard de creacion de acuerdos de pago"
```

---

## Task 10: Frontend — listado, detalle y punto de entrada

**Files:**
- Create: `frontend/src/components/payments/agreements/AgreementsTab.jsx`
- Create: `frontend/src/components/payments/agreements/PaymentAgreementDetailDialog.jsx`
- Modify: `frontend/src/pages/dashboard/Payments/PaymentsTable.jsx`
- Modify: `frontend/src/components/payments/PlayerPaymentsSummaryDialog.jsx`

**Interfaces:**
- Consumes: `usePaymentAgreements`, `usePaymentAgreement`, `usePaymentAgreementMutations` (Task 8) y `PaymentAgreementWizardModal` (Task 9).

- [ ] **Step 1: Escribir el diálogo de detalle**

`src/components/payments/agreements/PaymentAgreementDetailDialog.jsx`. Cabecera con
valor pactado y deuda original, lista de cobros suplidos, lista de cuotas con su badge
de estado (`getPaymentStatusConfig`), y botón Anular que abre un campo de motivo. El
botón queda deshabilitado cuando `can_be_cancelled` es `false`, con el texto
`payment_agreements.cancel_blocked` debajo.

```jsx
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import LoadingComponent from '@/components/LoadingComponent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDisplayDate } from '@/helpers/dateUtils';
import { getPaymentStatusConfig } from '@/helpers/paymentStatusConfig';
import {
  usePaymentAgreement,
  usePaymentAgreementMutations,
} from '@/hooks/payments/usePaymentAgreements';
import { useCurrency } from '@/hooks/useCurrency';

const PaymentAgreementDetailDialog = ({ isOpen, onClose, clubId, agreementId, canCancel }) => {
  const { t } = useTranslation('payments');
  const { formatAmount } = useCurrency();
  const { data: agreement, isLoading } = usePaymentAgreement(clubId, isOpen ? agreementId : null);
  const { cancel } = usePaymentAgreementMutations(clubId);
  const [reason, setReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);

  const close = () => {
    setReason('');
    setShowCancel(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('payment_agreements.detail_title')}</DialogTitle>
        </DialogHeader>

        {isLoading || !agreement ? (
          <LoadingComponent />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-900">
                <p className="text-xs text-gray-500">{t('payment_agreements.total_amount')}</p>
                <p className="text-lg font-bold">{formatAmount(agreement.total_amount)}</p>
              </div>
              <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-900">
                <p className="text-xs text-gray-500">{t('payment_agreements.original_debt')}</p>
                <p className="text-lg font-bold">{formatAmount(agreement.original_debt_amount)}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">{agreement.description}</p>

            <div>
              <h4 className="text-sm font-semibold mb-2">
                {t('payment_agreements.covered_charges')}
              </h4>
              <div className="space-y-1">
                {(agreement.covered_payments ?? []).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-2 rounded border text-sm"
                  >
                    <span>{payment.charge?.name || payment.description}</span>
                    <span className="font-medium">{formatAmount(payment.amount_due)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">
                {t('payment_agreements.agreement_installments')}
              </h4>
              <div className="space-y-1">
                {(agreement.installment_payments ?? []).map((payment) => {
                  const config = getPaymentStatusConfig(payment.status);
                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-2 rounded border text-sm"
                    >
                      <div>
                        <p>{payment.description}</p>
                        <p className="text-xs text-gray-500">
                          {payment.due_date ? formatDisplayDate(payment.due_date) : '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${config.colors.bg} ${config.colors.textColor} border-0`}>
                          {t(config.labelKey)}
                        </Badge>
                        <span className="font-medium">{formatAmount(payment.amount_due)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {canCancel && agreement.status === 'active' && (
              <div className="pt-2 border-t">
                {!showCancel ? (
                  <>
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      disabled={!agreement.can_be_cancelled}
                      onClick={() => setShowCancel(true)}
                    >
                      {t('payment_agreements.cancel_title')}
                    </Button>
                    {!agreement.can_be_cancelled && (
                      <p className="text-xs text-gray-500 mt-2">
                        {t('payment_agreements.cancel_blocked')}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="cancel-reason">{t('payment_agreements.cancel_reason')}</Label>
                    <Textarea
                      id="cancel-reason"
                      rows={2}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <Button
                      variant="destructive"
                      disabled={reason.trim().length < 3 || cancel.isPending}
                      onClick={() =>
                        cancel.mutate(
                          { agreementId: agreement.id, reason: reason.trim() },
                          { onSuccess: close },
                        )
                      }
                    >
                      {t('payment_agreements.cancel_confirm')}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

PaymentAgreementDetailDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  clubId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  agreementId: PropTypes.number,
  canCancel: PropTypes.bool,
};

export default PaymentAgreementDetailDialog;
```

- [ ] **Step 2: Escribir la pestaña de listado**

`src/components/payments/agreements/AgreementsTab.jsx`:

```jsx
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import LoadingComponent from '@/components/LoadingComponent';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDisplayDate } from '@/helpers/dateUtils';
import { usePaymentAgreements } from '@/hooks/payments/usePaymentAgreements';
import { useCurrency } from '@/hooks/useCurrency';

import PaymentAgreementDetailDialog from './PaymentAgreementDetailDialog';

const STATUS_TONE = {
  active: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300',
  completed: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
};

const AgreementsTab = ({ clubId, canCancel }) => {
  const { t } = useTranslation('payments');
  const { formatAmount } = useCurrency();
  const { data, isLoading } = usePaymentAgreements(clubId);
  const [selectedId, setSelectedId] = useState(null);

  if (isLoading) return <LoadingComponent />;

  const agreements = data?.data ?? [];

  if (agreements.length === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">{t('payment_agreements.empty')}</p>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('payment_agreements.column_player')}</TableHead>
              <TableHead>{t('payment_agreements.column_date')}</TableHead>
              <TableHead>{t('payment_agreements.column_amount')}</TableHead>
              <TableHead>{t('payment_agreements.column_installments')}</TableHead>
              <TableHead>{t('payment_agreements.column_status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agreements.map((agreement) => (
              <TableRow
                key={agreement.id}
                className="cursor-pointer"
                onClick={() => setSelectedId(agreement.id)}
              >
                <TableCell className="font-medium">
                  {`${agreement.player?.name ?? ''} ${agreement.player?.lastname ?? ''}`.trim()}
                </TableCell>
                <TableCell>{formatDisplayDate(agreement.agreement_date)}</TableCell>
                <TableCell>{formatAmount(agreement.total_amount)}</TableCell>
                <TableCell>
                  {agreement.installments_paid_count ?? 0}/{agreement.installments_count}
                </TableCell>
                <TableCell>
                  <Badge className={`border-0 ${STATUS_TONE[agreement.status] ?? ''}`}>
                    {t(`payment_agreements.status_${agreement.status}`)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaymentAgreementDetailDialog
        isOpen={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        clubId={clubId}
        agreementId={selectedId}
        canCancel={canCancel}
      />
    </>
  );
};

AgreementsTab.propTypes = {
  clubId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  canCancel: PropTypes.bool,
};

export default AgreementsTab;
```

- [ ] **Step 3: Enganchar la pestaña en la página de pagos**

En `src/pages/dashboard/Payments/PaymentsTable.jsx`, en el bloque `Tabs` (~líneas 157-190),
añadir un `TabsTrigger value="agreements"` con `t('payment_agreements.tab_label')` y un
`TabsContent value="agreements"` que renderice
`<AgreementsTab clubId={clubId} canCancel={canCancel} />`, donde `canCancel` es true para
owner y accountant (usar el mismo `activeRole` de `useUserContext` que ya consume la página).

- [ ] **Step 4: Añadir el punto de entrada desde el jugador**

En `src/components/payments/PlayerPaymentsSummaryDialog.jsx`, junto al resumen superior
(~líneas 188-217), añadir un botón visible solo cuando `data?.total_pending > 0`:

```jsx
<Button
  size="sm"
  variant="outline"
  className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
  onClick={() => setAgreementWizardOpen(true)}
>
  {t('payment_agreements.create_from_player')}
</Button>
```

y montar el wizard al final del componente:

```jsx
<PaymentAgreementWizardModal
  isOpen={agreementWizardOpen}
  onClose={() => setAgreementWizardOpen(false)}
  clubId={clubId}
  player={player}
  onSuccess={fetchSummary}
/>
```

usando el `useState` correspondiente y reaprovechando la función que ya recarga el
resumen del jugador.

- [ ] **Step 5: Verificar lint y build**

Run: `cd frontend && npm run lint && npm run build`
Expected: sin errores ni warnings.

- [ ] **Step 6: Prueba manual del flujo completo**

1. `cd saas_sport && docker compose up -d` y `cd frontend && npm run dev`.
2. Entrar como `director@bogotafc.co` / `Password123!`.
3. Ir a un jugador con deuda, abrir su resumen de pagos, pulsar "Crear acuerdo".
4. Seleccionar dos cobros, poner un valor menor a la deuda, 2 cuotas, confirmar.
5. Verificar en `/home/payments` que la deuda del club bajó y que los cobros originales
   aparecen con el badge "En acuerdo".
6. Verificar en la pestaña Acuerdos que el acuerdo aparece con 0/2 cuotas.
7. Entrar como `luzm@h.com` / `Password123!` y verificar en `/home/my-payments` que ve
   las dos cuotas y no ve los cobros originales.
8. Cambiar el idioma a inglés y a portugués y confirmar que no aparece ningún `[texto]`.

- [ ] **Step 7: Commit**

```bash
cd frontend
git add src/components/payments/agreements src/pages/dashboard/Payments/PaymentsTable.jsx src/components/payments/PlayerPaymentsSummaryDialog.jsx
git commit -m "feat: listado, detalle y entrada de acuerdos de pago"
```

---

## Task 11: Verificación final

**Files:** ninguno nuevo.

- [ ] **Step 1: Suite backend completa**

Run: `cd saas_sport && docker compose exec saas_sport_app php artisan test`
Expected: PASS. Cualquier fallo se arregla antes de dar el trabajo por terminado.

- [ ] **Step 2: Lint y build del frontend**

Run: `cd frontend && npm run lint && npm run build`
Expected: sin errores ni warnings.

- [ ] **Step 3: Paridad de claves i18n**

Run: `cd frontend && node -e "const en=require('./src/i18n/locales/en/payments.json').payment_agreements; const es=require('./src/i18n/locales/es/payments.json').payment_agreements; const pt=require('./src/i18n/locales/pt-BR/payments.json').payment_agreements; const k=o=>JSON.stringify(Object.keys(o).sort()); console.log(k(en)===k(es)&&k(en)===k(pt) ? 'OK' : 'MISMATCH');"`
Expected: `OK`.

- [ ] **Step 4: Informe a Miguel**

Resumir: qué quedó en local sin commitear o commiteado según lo que él haya pedido, qué
falta por QA manual, y recordar que el push a `main` de cualquiera de los dos repos es
un deploy a producción.
