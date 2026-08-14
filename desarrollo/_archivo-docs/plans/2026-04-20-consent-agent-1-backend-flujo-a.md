<!-- ARCHIVADO 13-ago-2026 — plan EJECUTADO y en produccion; se archiva para que sus 'checkboxes sin marcar' no se confundan con trabajo pendiente. Verificado contra el codigo. -->

# Agente #1 — Backend Flujo A (Consentimiento Anual del Club)

> ## ✅ EJECUTADO — plan cerrado, en producción (archivado 13-ago-2026)
>
> Los 4 planes `2026-04-20-consent-agent-*` se implementaron. Verificado contra el código:
> `DataConsent`, `PlaClubConsentTemplate`, `PlaClubTeamConsentForm`,
> `PlaClubTeamSignedConsent`, `PlaClubTeamExternalConsentDoc` +
> `PlaClubTeamExternalConsentSignature`, `BasCountryConsentConfig`, los seeders
> `ConsentConfigCOSeeder` / `ConsentConfigUSSeeder` / `ConsentPermissionsSeeder` y el
> middleware `check-consent` cableado en `routes/api.php`.
>
> **Los `- [ ]` de abajo NO son pendientes**: son el formato del plan, que nunca se fue
> marcando. No los ejecutes.
>
> Diseño de referencia: `docs/superpowers/specs/2026-04-19-consentimiento-informado-design.md`.
> ⚠️ Conviven **seis** sistemas de consentimiento en el producto; este plan cubre uno.


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking. Follow existing patterns — reference `CertificationController`, `CertificationPdfService`, `CertificationTemplatePage` as patterns to mirror.

**Goal:** Entregar el backend completo del Flujo A: plantillas de consentimiento anual editables por club (TipTap) + firma digital del padre/acudiente + PDF firmado con hash de verificación.

**Architecture:** Laravel 12 + Eloquent + Spatie permissions + Gotenberg (via HTTP) + FileStorageService (DO Spaces). Reutiliza patrón del módulo Certificado: template con variables → reemplazo dinámico → Blade → Gotenberg → PDF → snapshot inmutable en DB.

**Tech Stack:** Laravel 12, PHPUnit, Gotenberg 8, Spatie Permissions, Spatie Query Builder. Sigue patrones existentes en `app/Http/Controllers/CertificationController.php` y `app/Services/CertificationPdfService.php`.

**Rama:** `feature/consent-forms` en repo `saas_sport`. Worktree aislado en `/tmp/widdo-consent-1-backend-a`.

**Spec referencia:** `/Users/miguelcano/Desktop/todo/Widdo/desarrollo/docs/superpowers/specs/2026-04-19-consentimiento-informado-design.md`

---

## File Structure

**Crear:**

```
database/migrations/
├── 2026_04_20_100000_extend_bas_country_consent_configs.php
├── 2026_04_20_100001_create_pla_club_teams_consent_forms_table.php
└── 2026_04_20_100002_create_pla_club_teams_signed_consents_table.php

database/seeders/
├── ConsentConfigCOSeeder.php
└── ConsentConfigUSSeeder.php

app/Models/
├── BasCountryConsentConfig.php        # si no existe, crear; si existe, extender
├── PlaClubTeamConsentForm.php
└── PlaClubTeamSignedConsent.php

app/Http/Controllers/
├── ConsentFormController.php           # admin CRUD
└── ConsentSignatureController.php      # público + revoke + verify

app/Http/Requests/
├── StoreConsentFormRequest.php
├── UpdateConsentFormRequest.php
└── SignConsentFormRequest.php

app/Services/
├── ConsentFormService.php              # CRUD lógica + duplicar
├── ConsentSignatureService.php         # captura firma + PDF + hash
├── ConsentVariableResolver.php         # reemplazo variables
└── ConsentTokenService.php             # HMAC signed tokens

app/Policies/
├── ConsentFormPolicy.php
└── ConsentSignaturePolicy.php

resources/views/pdf/
└── consent-form.blade.php

routes/api.php — agregar bloque

tests/Feature/
├── ConsentFormCrudTest.php
├── ConsentFormPublishTest.php
├── ConsentSignatureTest.php
├── ConsentMultiChildTest.php
├── ConsentFamilySignTest.php
├── ConsentRevocationTest.php
├── ConsentVerificationTest.php
└── ConsentVariableResolverTest.php
```

---

## Task 1: Migración extender `bas_country_consent_configs`

**Files:**
- Create: `database/migrations/2026_04_20_100000_extend_bas_country_consent_configs.php`

- [ ] **Step 1: Verificar si la tabla existe**

Run: `docker compose exec -T saas_sport_app php artisan tinker --execute="var_dump(\Schema::hasTable('bas_country_consent_configs'));"`

Si NO existe, crearla primero con migration `create_bas_country_consent_configs_table.php` incluyendo columnas base. Si existe, continuar.

- [ ] **Step 2: Escribir migración de extensión**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bas_country_consent_configs', function (Blueprint $table) {
            if (!Schema::hasColumn('bas_country_consent_configs', 'country_code')) {
                $table->string('country_code', 2)->after('id')->index();
            }
            if (!Schema::hasColumn('bas_country_consent_configs', 'language')) {
                $table->string('language', 5)->default('es')->after('country_code');
            }
            if (!Schema::hasColumn('bas_country_consent_configs', 'jurisdiction_law')) {
                $table->string('jurisdiction_law', 255)->nullable();
                $table->string('data_authority_name', 255)->nullable();
                $table->longText('base_template_content')->nullable();
                $table->json('suggested_clauses')->nullable();
                $table->integer('minor_age_threshold')->default(18);
                $table->boolean('requires_parent_for_minor')->default(true);
                $table->boolean('requires_minor_co_signature')->default(false);
                $table->string('template_version', 20)->default('1.0.0');
                $table->timestamp('law_last_reviewed_at')->nullable();
            }
        });

        // Unique constraint si no existe
        try {
            Schema::table('bas_country_consent_configs', function (Blueprint $table) {
                $table->unique(['country_code', 'language'], 'bas_country_consent_unique');
            });
        } catch (\Throwable $e) {
            // ignore if already exists
        }
    }

    public function down(): void
    {
        Schema::table('bas_country_consent_configs', function (Blueprint $table) {
            $table->dropUnique('bas_country_consent_unique');
            $table->dropColumn([
                'country_code', 'language', 'jurisdiction_law', 'data_authority_name',
                'base_template_content', 'suggested_clauses', 'minor_age_threshold',
                'requires_parent_for_minor', 'requires_minor_co_signature',
                'template_version', 'law_last_reviewed_at',
            ]);
        });
    }
};
```

- [ ] **Step 3: Correr migración**

```bash
docker compose exec saas_sport_app php artisan migrate
```

Expected: `INFO  Running migrations.` + migración corrida OK.

- [ ] **Step 4: Commit**

```bash
git add database/migrations/2026_04_20_100000_extend_bas_country_consent_configs.php
git commit -m "feat(consent): extend bas_country_consent_configs for multi-country templates"
```

---

## Task 2: Migración `pla_club_teams_consent_forms`

**Files:**
- Create: `database/migrations/2026_04_20_100001_create_pla_club_teams_consent_forms_table.php`

- [ ] **Step 1: Escribir migración**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pla_club_teams_consent_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('club_id')->constrained('pla_club_teams')->cascadeOnDelete();
            $table->string('name', 255);
            $table->string('slug', 100);
            $table->enum('document_type', ['annual_club', 'one_time'])->default('annual_club');
            $table->integer('year_valid')->nullable();
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->string('language', 5)->default('es');
            $table->string('country_code', 2);
            $table->longText('content');
            $table->foreignId('based_on_config_id')->nullable()
                ->constrained('bas_country_consent_configs')->nullOnDelete();
            $table->string('based_on_config_version', 20)->nullable();
            $table->boolean('needs_review')->default(false);
            $table->timestamp('flagged_for_review_at')->nullable();
            $table->json('signers_required');
            $table->enum('gate_mode', ['soft', 'hard'])->default('soft');
            $table->boolean('is_active')->default(false);
            $table->foreignId('created_by_user_id')->constrained('users');
            $table->timestamp('published_at')->nullable();
            $table->integer('version')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['club_id', 'slug']);
            $table->index(['club_id', 'year_valid', 'is_active']);
        });
    }

    public function down(): void { Schema::dropIfExists('pla_club_teams_consent_forms'); }
};
```

- [ ] **Step 2: Correr + commit**

```bash
docker compose exec saas_sport_app php artisan migrate
git add database/migrations/2026_04_20_100001_create_pla_club_teams_consent_forms_table.php
git commit -m "feat(consent): add consent_forms table"
```

---

## Task 3: Migración `pla_club_teams_signed_consents`

**Files:**
- Create: `database/migrations/2026_04_20_100002_create_pla_club_teams_signed_consents_table.php`

- [ ] **Step 1: Escribir migración**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pla_club_teams_signed_consents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('club_id')->constrained('pla_club_teams')->cascadeOnDelete();
            $table->foreignId('consent_form_id')->constrained('pla_club_teams_consent_forms');
            $table->foreignId('player_id')->constrained('pla_club_team_players');

            $table->foreignId('signer_user_id')->nullable()->constrained('users');
            $table->enum('signer_role', ['parent','guardian','player_adult','player_minor']);
            $table->string('signer_name', 255);
            $table->string('signer_document_type', 20)->nullable();
            $table->string('signer_document_number', 50);
            $table->string('signer_relationship', 50)->nullable();
            $table->string('signer_email', 255)->nullable();
            $table->string('signer_phone', 30)->nullable();
            $table->longText('signature_data');
            $table->enum('signature_method', ['digital_canvas','physical_scan','verbal']);

            $table->longText('cosigner_signature_data')->nullable();
            $table->string('cosigner_name', 255)->nullable();
            $table->string('cosigner_document_number', 50)->nullable();

            $table->timestamp('signed_at');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('snapshot_content');
            $table->string('terms_hash', 64);
            $table->string('verification_hash', 64)->unique();

            $table->string('pdf_path', 500)->nullable();

            $table->enum('status', ['signed','revoked','superseded'])->default('signed');
            $table->timestamp('revoked_at')->nullable();
            $table->string('revoked_reason', 500)->nullable();
            $table->foreignId('revoked_by_user_id')->nullable()->constrained('users');

            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index(['club_id', 'status']);
            $table->index(['signed_at']);
            $table->index(['consent_form_id', 'player_id', 'status'], 'idx_active_sig_per_player');
        });
    }

    public function down(): void { Schema::dropIfExists('pla_club_teams_signed_consents'); }
};
```

- [ ] **Step 2: Correr + commit**

```bash
docker compose exec saas_sport_app php artisan migrate
git add database/migrations/2026_04_20_100002_create_pla_club_teams_signed_consents_table.php
git commit -m "feat(consent): add signed_consents table"
```

---

## Task 4: Modelos Eloquent

**Files:**
- Create: `app/Models/BasCountryConsentConfig.php` (si no existe)
- Create: `app/Models/PlaClubTeamConsentForm.php`
- Create: `app/Models/PlaClubTeamSignedConsent.php`

- [ ] **Step 1: `BasCountryConsentConfig`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BasCountryConsentConfig extends Model
{
    protected $table = 'bas_country_consent_configs';

    protected $fillable = [
        'country_code', 'language', 'jurisdiction_law', 'data_authority_name',
        'base_template_content', 'suggested_clauses', 'minor_age_threshold',
        'requires_parent_for_minor', 'requires_minor_co_signature',
        'template_version', 'law_last_reviewed_at',
    ];

    protected $casts = [
        'suggested_clauses' => 'array',
        'requires_parent_for_minor' => 'boolean',
        'requires_minor_co_signature' => 'boolean',
        'law_last_reviewed_at' => 'datetime',
    ];

    public static function forCountry(string $countryCode, string $language = 'es'): ?self
    {
        return self::where('country_code', $countryCode)
            ->where('language', $language)
            ->first();
    }
}
```

- [ ] **Step 2: `PlaClubTeamConsentForm`**

```php
<?php

namespace App\Models;

use App\Models\Scopes\ClubScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PlaClubTeamConsentForm extends Model
{
    use SoftDeletes;

    protected $table = 'pla_club_teams_consent_forms';

    protected $fillable = [
        'club_id', 'name', 'slug', 'document_type', 'year_valid',
        'valid_from', 'valid_until', 'language', 'country_code',
        'content', 'based_on_config_id', 'based_on_config_version',
        'needs_review', 'flagged_for_review_at',
        'signers_required', 'gate_mode', 'is_active',
        'created_by_user_id', 'published_at', 'version',
    ];

    protected $casts = [
        'signers_required' => 'array',
        'is_active' => 'boolean',
        'needs_review' => 'boolean',
        'year_valid' => 'integer',
        'valid_from' => 'date',
        'valid_until' => 'date',
        'published_at' => 'datetime',
        'flagged_for_review_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::addGlobalScope(new ClubScope);
    }

    public function club(): BelongsTo
    {
        return $this->belongsTo(PlaClubTeam::class, 'club_id');
    }

    public function basedOnConfig(): BelongsTo
    {
        return $this->belongsTo(BasCountryConsentConfig::class, 'based_on_config_id');
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function signatures(): HasMany
    {
        return $this->hasMany(PlaClubTeamSignedConsent::class, 'consent_form_id');
    }

    public function activeSignatures(): HasMany
    {
        return $this->signatures()->where('status', 'signed');
    }

    public function isActiveForYear(int $year): bool
    {
        return $this->is_active && $this->year_valid === $year;
    }
}
```

- [ ] **Step 3: `PlaClubTeamSignedConsent`**

```php
<?php

namespace App\Models;

use App\Models\Scopes\ClubScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlaClubTeamSignedConsent extends Model
{
    protected $table = 'pla_club_teams_signed_consents';

    protected $fillable = [
        'club_id', 'consent_form_id', 'player_id',
        'signer_user_id', 'signer_role', 'signer_name',
        'signer_document_type', 'signer_document_number',
        'signer_relationship', 'signer_email', 'signer_phone',
        'signature_data', 'signature_method',
        'cosigner_signature_data', 'cosigner_name', 'cosigner_document_number',
        'signed_at', 'ip_address', 'user_agent',
        'snapshot_content', 'terms_hash', 'verification_hash',
        'pdf_path', 'status', 'revoked_at', 'revoked_reason', 'revoked_by_user_id',
        'metadata',
    ];

    protected $casts = [
        'signed_at' => 'datetime',
        'revoked_at' => 'datetime',
        'metadata' => 'array',
    ];

    protected static function booted()
    {
        static::addGlobalScope(new ClubScope);
    }

    public function club(): BelongsTo
    {
        return $this->belongsTo(PlaClubTeam::class, 'club_id');
    }

    public function consentForm(): BelongsTo
    {
        return $this->belongsTo(PlaClubTeamConsentForm::class, 'consent_form_id');
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(PlaClubTeamPlayer::class, 'player_id');
    }

    public function signerUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'signer_user_id');
    }

    public function isValid(): bool
    {
        return $this->status === 'signed';
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add app/Models/BasCountryConsentConfig.php app/Models/PlaClubTeamConsentForm.php app/Models/PlaClubTeamSignedConsent.php
git commit -m "feat(consent): add Eloquent models for consent forms and signatures"
```

---

## Task 5: Service `ConsentVariableResolver`

**Files:**
- Create: `app/Services/ConsentVariableResolver.php`
- Test: `tests/Feature/ConsentVariableResolverTest.php`

- [ ] **Step 1: Test primero (TDD)**

```php
<?php

namespace Tests\Feature;

use App\Models\BasCountryConsentConfig;
use App\Models\PlaClubTeam;
use App\Models\PlaClubTeamConsentForm;
use App\Models\PlaClubTeamPlayer;
use App\Models\User;
use App\Services\ConsentVariableResolver;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ConsentVariableResolverTest extends TestCase
{
    use RefreshDatabase;

    public function test_replaces_universal_variables(): void
    {
        $club = PlaClubTeam::factory()->create(['name' => 'Club Widdo', 'country_code' => 'CO']);
        $player = PlaClubTeamPlayer::factory()->create([
            'club_id' => $club->id,
            'name' => 'Juan David',
            'last_name' => 'Pérez',
            'document_number' => '1234567890',
        ]);
        $form = PlaClubTeamConsentForm::factory()->create([
            'club_id' => $club->id,
            'content' => 'Yo [NOMBRE_ACUDIENTE] autorizo a [NOMBRE_MENOR] con documento [DOCUMENTO_MENOR]',
            'year_valid' => 2026,
            'country_code' => 'CO',
        ]);
        $signer = User::factory()->create(['name' => 'María López']);

        $resolver = app(ConsentVariableResolver::class);
        $result = $resolver->resolve($form, $player, $signer, [
            'signer_document_number' => '79123456',
            'signer_relationship' => 'madre',
        ]);

        $this->assertStringContainsString('María López', $result);
        $this->assertStringContainsString('Juan David Pérez', $result);
        $this->assertStringContainsString('1234567890', $result);
    }

    public function test_replaces_country_variables_from_config(): void
    {
        BasCountryConsentConfig::factory()->create([
            'country_code' => 'CO',
            'language' => 'es',
            'jurisdiction_law' => 'Ley 1581 de 2012',
            'data_authority_name' => 'SIC',
        ]);

        $club = PlaClubTeam::factory()->create(['country_code' => 'CO']);
        $player = PlaClubTeamPlayer::factory()->create(['club_id' => $club->id]);
        $form = PlaClubTeamConsentForm::factory()->create([
            'club_id' => $club->id,
            'content' => 'Según [LEY_REFERENCIA], ante [AUTORIDAD_DATOS]',
            'country_code' => 'CO',
            'language' => 'es',
        ]);

        $resolver = app(ConsentVariableResolver::class);
        $result = $resolver->resolve($form, $player, User::factory()->create());

        $this->assertStringContainsString('Ley 1581 de 2012', $result);
        $this->assertStringContainsString('SIC', $result);
    }
}
```

- [ ] **Step 2: Correr test — debe FALLAR**

```bash
docker compose exec saas_sport_app php artisan test --filter=ConsentVariableResolverTest
```

- [ ] **Step 3: Implementar service**

```php
<?php

namespace App\Services;

use App\Models\BasCountryConsentConfig;
use App\Models\PlaClubTeamConsentForm;
use App\Models\PlaClubTeamPlayer;
use App\Models\User;
use Carbon\Carbon;

class ConsentVariableResolver
{
    public function resolve(
        PlaClubTeamConsentForm $form,
        PlaClubTeamPlayer $player,
        User $signer,
        array $extraContext = []
    ): string {
        $club = $form->club;
        $config = BasCountryConsentConfig::forCountry($form->country_code, $form->language);

        $playerFullName = trim($player->name . ' ' . ($player->last_name ?? ''));
        $clubFullName = $club->name ?? '';
        $today = Carbon::now()->format('d/m/Y');

        $replacements = [
            '[NOMBRE_CLUB]'        => $clubFullName,
            '[NIT_CLUB]'           => $club->nit ?? $club->tax_id ?? '',
            '[DEPORTE]'            => $club->sport?->name ?? '',
            '[CIUDAD_CLUB]'        => $club->city?->name ?? '',
            '[NOMBRE_MENOR]'       => $playerFullName,
            '[DOCUMENTO_MENOR]'    => $player->document_number ?? '',
            '[TIPO_DOC_MENOR]'     => $player->document_type ?? '',
            '[FECHA_NACIMIENTO_MENOR]' => $player->birth_date?->format('d/m/Y') ?? '',
            '[EDAD_MENOR]'         => $player->birth_date ? (string) $player->birth_date->age : '',
            '[NOMBRE_ACUDIENTE]'   => $extraContext['signer_name'] ?? $signer->name,
            '[DOCUMENTO_ACUDIENTE]'=> $extraContext['signer_document_number'] ?? '',
            '[PARENTESCO]'         => $extraContext['signer_relationship'] ?? '',
            '[EMAIL_ACUDIENTE]'    => $extraContext['signer_email'] ?? $signer->email,
            '[TELEFONO_ACUDIENTE]' => $extraContext['signer_phone'] ?? ($signer->phone ?? ''),
            '[FECHA_HOY]'          => $today,
            '[AÑO_VIGENCIA]'       => (string) ($form->year_valid ?? Carbon::now()->year),
            '[CATEGORIA]'          => $player->category?->name ?? '',
            '[LEY_REFERENCIA]'     => $config?->jurisdiction_law ?? '',
            '[AUTORIDAD_DATOS]'    => $config?->data_authority_name ?? '',
            '[EDAD_MAYORIA]'       => (string) ($config?->minor_age_threshold ?? 18),
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $form->content);
    }
}
```

- [ ] **Step 4: Correr test — debe PASAR**

```bash
docker compose exec saas_sport_app php artisan test --filter=ConsentVariableResolverTest
```

- [ ] **Step 5: Commit**

```bash
git add app/Services/ConsentVariableResolver.php tests/Feature/ConsentVariableResolverTest.php
git commit -m "feat(consent): add variable resolver for template placeholders"
```

---

## Task 6: Service `ConsentTokenService` (HMAC tokens)

**Files:**
- Create: `app/Services/ConsentTokenService.php`
- Test: `tests/Feature/ConsentTokenServiceTest.php`

- [ ] **Step 1: Test**

```php
<?php

namespace Tests\Feature;

use App\Services\ConsentTokenService;
use Tests\TestCase;
use Carbon\Carbon;

class ConsentTokenServiceTest extends TestCase
{
    public function test_generates_and_validates_token(): void
    {
        $svc = app(ConsentTokenService::class);
        $token = $svc->generate(['form_id' => 1, 'player_id' => 2], 30);

        $claims = $svc->validate($token);

        $this->assertEquals(1, $claims['form_id']);
        $this->assertEquals(2, $claims['player_id']);
    }

    public function test_rejects_expired_token(): void
    {
        $svc = app(ConsentTokenService::class);
        Carbon::setTestNow(Carbon::now()->subDays(31));
        $token = $svc->generate(['form_id' => 1], 30);
        Carbon::setTestNow();

        $this->expectException(\App\Exceptions\InvalidConsentTokenException::class);
        $svc->validate($token);
    }

    public function test_rejects_tampered_token(): void
    {
        $svc = app(ConsentTokenService::class);
        $token = $svc->generate(['form_id' => 1], 30);
        $tampered = substr($token, 0, -3) . 'XXX';

        $this->expectException(\App\Exceptions\InvalidConsentTokenException::class);
        $svc->validate($tampered);
    }
}
```

- [ ] **Step 2: Implementar**

```php
<?php

namespace App\Services;

use App\Exceptions\InvalidConsentTokenException;
use Carbon\Carbon;
use Illuminate\Support\Facades\Config;

class ConsentTokenService
{
    public function generate(array $claims, int $validDays = 30): string
    {
        $payload = array_merge($claims, [
            'exp' => Carbon::now()->addDays($validDays)->timestamp,
            'iat' => Carbon::now()->timestamp,
        ]);

        $json = json_encode($payload);
        $b64 = rtrim(strtr(base64_encode($json), '+/', '-_'), '=');
        $sig = hash_hmac('sha256', $b64, Config::get('app.key'));

        return $b64 . '.' . $sig;
    }

    public function validate(string $token): array
    {
        if (!str_contains($token, '.')) {
            throw new InvalidConsentTokenException('Invalid token format');
        }

        [$b64, $sig] = explode('.', $token, 2);
        $expected = hash_hmac('sha256', $b64, Config::get('app.key'));

        if (!hash_equals($expected, $sig)) {
            throw new InvalidConsentTokenException('Invalid signature');
        }

        $json = base64_decode(strtr($b64, '-_', '+/'));
        $claims = json_decode($json, true);

        if (!is_array($claims) || !isset($claims['exp'])) {
            throw new InvalidConsentTokenException('Invalid payload');
        }

        if ($claims['exp'] < Carbon::now()->timestamp) {
            throw new InvalidConsentTokenException('Token expired');
        }

        return $claims;
    }
}
```

Crear también `app/Exceptions/InvalidConsentTokenException.php`:

```php
<?php namespace App\Exceptions;
class InvalidConsentTokenException extends \RuntimeException {}
```

- [ ] **Step 3: Run tests + commit**

```bash
docker compose exec saas_sport_app php artisan test --filter=ConsentTokenServiceTest
git add app/Services/ConsentTokenService.php app/Exceptions/InvalidConsentTokenException.php tests/Feature/ConsentTokenServiceTest.php
git commit -m "feat(consent): add HMAC token service for public sign links"
```

---

## Task 7: Service `ConsentFormService` (CRUD + duplicate)

**Files:**
- Create: `app/Services/ConsentFormService.php`

- [ ] **Step 1: Implementar**

```php
<?php

namespace App\Services;

use App\Models\PlaClubTeam;
use App\Models\PlaClubTeamConsentForm;
use App\Models\User;
use App\Models\BasCountryConsentConfig;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ConsentFormService
{
    public function create(PlaClubTeam $club, User $user, array $data): PlaClubTeamConsentForm
    {
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $data['country_code'] = $club->country_code ?? 'CO';
        $data['language'] = $data['language'] ?? 'es';
        $data['created_by_user_id'] = $user->id;

        if (($data['document_type'] ?? 'annual_club') === 'annual_club' && !empty($data['year_valid'])) {
            $this->ensureNoActiveDuplicateForYear($club->id, $data['year_valid'], null);
        }

        if (!empty($data['based_on_config_id'])) {
            $config = BasCountryConsentConfig::find($data['based_on_config_id']);
            $data['based_on_config_version'] = $config?->template_version;
        }

        return PlaClubTeamConsentForm::create($data + ['club_id' => $club->id]);
    }

    public function update(PlaClubTeamConsentForm $form, array $data): PlaClubTeamConsentForm
    {
        if ($form->is_active && isset($data['content']) && $data['content'] !== $form->content) {
            $data['version'] = $form->version + 1;
        }
        $form->update($data);
        return $form->fresh();
    }

    public function duplicate(PlaClubTeamConsentForm $source, ?int $newYearValid = null): PlaClubTeamConsentForm
    {
        $newYear = $newYearValid ?? (($source->year_valid ?? now()->year) + 1);

        $this->ensureNoActiveDuplicateForYear($source->club_id, $newYear, null);

        $copy = $source->replicate(['published_at']);
        $copy->name = "Consentimiento Informado {$newYear}";
        $copy->slug = Str::slug($copy->name) . '-' . Str::random(4);
        $copy->year_valid = $newYear;
        $copy->is_active = false;
        $copy->version = 1;
        $copy->save();

        return $copy;
    }

    public function publish(PlaClubTeamConsentForm $form): PlaClubTeamConsentForm
    {
        if ($form->document_type === 'annual_club' && $form->year_valid) {
            $this->ensureNoActiveDuplicateForYear($form->club_id, $form->year_valid, $form->id);
        }

        $form->update([
            'is_active' => true,
            'published_at' => now(),
        ]);

        return $form->fresh();
    }

    protected function ensureNoActiveDuplicateForYear(int $clubId, int $year, ?int $ignoreId): void
    {
        $q = PlaClubTeamConsentForm::withoutGlobalScopes()
            ->where('club_id', $clubId)
            ->where('document_type', 'annual_club')
            ->where('year_valid', $year)
            ->where('is_active', true);

        if ($ignoreId) $q->where('id', '!=', $ignoreId);

        if ($q->exists()) {
            throw ValidationException::withMessages([
                'year_valid' => "Ya existe una plantilla anual activa para el año {$year}.",
            ]);
        }
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/Services/ConsentFormService.php
git commit -m "feat(consent): add service for CRUD + duplicate + publish logic"
```

---

## Task 8: Service `ConsentSignatureService` (captura + PDF + hash)

**Files:**
- Create: `app/Services/ConsentSignatureService.php`
- Create: `resources/views/pdf/consent-form.blade.php`

- [ ] **Step 1: Implementar service**

```php
<?php

namespace App\Services;

use App\Events\ConsentSigned;
use App\Models\PlaClubTeamConsentForm;
use App\Models\PlaClubTeamPlayer;
use App\Models\PlaClubTeamSignedConsent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ConsentSignatureService
{
    public function __construct(
        protected ConsentVariableResolver $resolver,
        protected CertificationPdfService $pdfService, // reutilizamos Gotenberg wrapper
    ) {}

    public function sign(
        PlaClubTeamConsentForm $form,
        PlaClubTeamPlayer $player,
        array $signerData,
        ?User $signerUser = null,
        ?Request $request = null,
        ?string $multiChildBatchId = null
    ): PlaClubTeamSignedConsent {
        $snapshot = $this->resolver->resolve($form, $player, $signerUser ?? $this->buildGhostUser($signerData), $signerData);
        $termsHash = hash('sha256', $snapshot);
        $verificationHash = (string) Str::uuid();

        $signature = PlaClubTeamSignedConsent::create([
            'club_id'                   => $form->club_id,
            'consent_form_id'           => $form->id,
            'player_id'                 => $player->id,
            'signer_user_id'            => $signerUser?->id,
            'signer_role'               => $signerData['signer_role'],
            'signer_name'               => $signerData['signer_name'],
            'signer_document_type'      => $signerData['signer_document_type'] ?? null,
            'signer_document_number'    => $signerData['signer_document_number'],
            'signer_relationship'       => $signerData['signer_relationship'] ?? null,
            'signer_email'              => $signerData['signer_email'] ?? null,
            'signer_phone'              => $signerData['signer_phone'] ?? null,
            'signature_data'            => $signerData['signature_data'],
            'signature_method'          => $signerData['signature_method'] ?? 'digital_canvas',
            'cosigner_signature_data'   => $signerData['cosigner_signature_data'] ?? null,
            'cosigner_name'             => $signerData['cosigner_name'] ?? null,
            'cosigner_document_number'  => $signerData['cosigner_document_number'] ?? null,
            'signed_at'                 => now(),
            'ip_address'                => $request?->ip(),
            'user_agent'                => $request?->userAgent(),
            'snapshot_content'          => $snapshot,
            'terms_hash'                => $termsHash,
            'verification_hash'         => $verificationHash,
            'status'                    => 'signed',
            'metadata'                  => $multiChildBatchId ? ['multi_child_batch_id' => $multiChildBatchId] : null,
        ]);

        $pdfPath = $this->generatePdf($signature);
        $signature->update(['pdf_path' => $pdfPath]);

        event(new ConsentSigned($signature));

        return $signature->fresh();
    }

    public function revoke(PlaClubTeamSignedConsent $signature, User $actor, string $reason): PlaClubTeamSignedConsent
    {
        $signature->update([
            'status' => 'revoked',
            'revoked_at' => now(),
            'revoked_reason' => $reason,
            'revoked_by_user_id' => $actor->id,
        ]);
        return $signature;
    }

    protected function generatePdf(PlaClubTeamSignedConsent $signature): string
    {
        $html = view('pdf.consent-form', [
            'signature' => $signature,
            'form' => $signature->consentForm,
            'player' => $signature->player,
            'verificationUrl' => config('app.url') . '/verify/consent/' . $signature->verification_hash,
        ])->render();

        $pdfBytes = $this->pdfService->htmlToPdf($html);

        $year = $signature->consentForm->year_valid ?? now()->year;
        $path = "clubs/{$signature->club_id}/consents/{$year}/{$signature->player_id}-{$signature->verification_hash}.pdf";
        Storage::disk(config('filesystems.default'))->put($path, $pdfBytes);

        return $path;
    }

    protected function buildGhostUser(array $data): User
    {
        $u = new User();
        $u->name = $data['signer_name'] ?? 'Signer';
        $u->email = $data['signer_email'] ?? null;
        return $u;
    }
}
```

- [ ] **Step 2: Blade template PDF**

```blade
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>{{ $form->name }}</title>
<style>
body { font-family: 'Helvetica', sans-serif; font-size: 11pt; color: #222; margin: 40px; line-height: 1.5; }
.header { border-bottom: 2px solid #00C853; padding-bottom: 15px; margin-bottom: 25px; }
.header h1 { color: #00C853; margin: 0 0 5px; font-size: 18pt; }
.content { text-align: justify; margin-bottom: 30px; }
.sig-block { margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 6px; }
.sig-block img { max-height: 100px; max-width: 300px; display: block; margin: 10px 0; }
.sig-row { margin: 5px 0; }
.sig-label { font-weight: bold; display: inline-block; min-width: 180px; }
.footer { margin-top: 50px; font-size: 9pt; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
.footer .hash { font-family: monospace; word-break: break-all; }
</style>
</head>
<body>

<div class="header">
  <h1>{{ $form->name }}</h1>
  <div>Club: <strong>{{ $form->club->name ?? '' }}</strong></div>
  <div>Año de vigencia: <strong>{{ $form->year_valid ?? '—' }}</strong></div>
</div>

<div class="content">
  {!! $signature->snapshot_content !!}
</div>

<div class="sig-block">
  <div class="sig-row"><span class="sig-label">Firmante:</span> {{ $signature->signer_name }}</div>
  <div class="sig-row"><span class="sig-label">Documento:</span> {{ $signature->signer_document_type }} {{ $signature->signer_document_number }}</div>
  @if($signature->signer_relationship)
  <div class="sig-row"><span class="sig-label">Parentesco:</span> {{ $signature->signer_relationship }}</div>
  @endif
  <div class="sig-row"><span class="sig-label">Email:</span> {{ $signature->signer_email ?? '—' }}</div>
  <div class="sig-row"><span class="sig-label">Fecha de firma:</span> {{ $signature->signed_at->format('d/m/Y H:i') }}</div>
  <div class="sig-row"><span class="sig-label">Firma:</span></div>
  <img src="{{ $signature->signature_data }}" alt="Firma">
  @if($signature->cosigner_signature_data)
  <div class="sig-row"><span class="sig-label">Co-firmante:</span> {{ $signature->cosigner_name }} ({{ $signature->cosigner_document_number }})</div>
  <img src="{{ $signature->cosigner_signature_data }}" alt="Firma co-firmante">
  @endif
</div>

<div class="footer">
  <div class="sig-row"><span class="sig-label">Hash del contenido:</span> <span class="hash">{{ $signature->terms_hash }}</span></div>
  <div class="sig-row"><span class="sig-label">ID de verificación:</span> <span class="hash">{{ $signature->verification_hash }}</span></div>
  <div class="sig-row"><span class="sig-label">IP:</span> {{ $signature->ip_address ?? '—' }}</div>
  <div class="sig-row">Verifique la autenticidad de este documento en: <br>{{ $verificationUrl }}</div>
</div>

</body>
</html>
```

- [ ] **Step 3: Evento `ConsentSigned`**

Crear `app/Events/ConsentSigned.php`:

```php
<?php

namespace App\Events;

use App\Models\PlaClubTeamSignedConsent;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class ConsentSigned implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public PlaClubTeamSignedConsent $signature) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("club.{$this->signature->club_id}.consents")];
    }

    public function broadcastAs(): string { return 'consent.signed'; }
}
```

- [ ] **Step 4: Commit**

```bash
git add app/Services/ConsentSignatureService.php app/Events/ConsentSigned.php resources/views/pdf/consent-form.blade.php
git commit -m "feat(consent): add signature service + PDF generation + broadcast event"
```

---

## Task 9: Policies + Spatie permissions

**Files:**
- Create: `app/Policies/ConsentFormPolicy.php`
- Create: `app/Policies/ConsentSignaturePolicy.php`
- Modify: `app/Providers/AuthServiceProvider.php` (registrar policies)
- Create: seeder de permisos o agregar a `PermissionsSeeder` existente

- [ ] **Step 1: Permissions**

Agregar en `database/seeders/PermissionsSeeder.php` (o crear uno nuevo):

```php
$permissions = [
    'consent-forms.view', 'consent-forms.create', 'consent-forms.edit',
    'consent-forms.publish', 'consent-forms.delete',
    'consent-signatures.view', 'consent-signatures.revoke',
    'consent-signatures.upload-physical',
];

foreach ($permissions as $p) {
    Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
}

// Asignar a roles
Role::findByName('owner')?->givePermissionTo($permissions);
Role::findByName('admin')?->givePermissionTo(array_filter($permissions, fn($p) => $p !== 'consent-forms.delete'));
Role::findByName('accountant')?->givePermissionTo(['consent-forms.view', 'consent-signatures.view']);
Role::findByName('trainer')?->givePermissionTo(['consent-signatures.view']);
```

- [ ] **Step 2: `ConsentFormPolicy`**

```php
<?php

namespace App\Policies;

use App\Models\PlaClubTeamConsentForm;
use App\Models\User;

class ConsentFormPolicy
{
    public function viewAny(User $user): bool { return $user->can('consent-forms.view'); }
    public function view(User $user, PlaClubTeamConsentForm $form): bool
    {
        return $user->belongsToClub($form->club_id) && $user->can('consent-forms.view');
    }
    public function create(User $user): bool { return $user->can('consent-forms.create'); }
    public function update(User $user, PlaClubTeamConsentForm $form): bool
    {
        return $user->belongsToClub($form->club_id) && $user->can('consent-forms.edit');
    }
    public function publish(User $user, PlaClubTeamConsentForm $form): bool
    {
        return $user->belongsToClub($form->club_id) && $user->can('consent-forms.publish');
    }
    public function delete(User $user, PlaClubTeamConsentForm $form): bool
    {
        return $user->belongsToClub($form->club_id) && $user->can('consent-forms.delete');
    }
}
```

(Similar para `ConsentSignaturePolicy` con métodos `view`, `revoke`, `uploadPhysical`.)

- [ ] **Step 3: Registrar en `AuthServiceProvider`**

```php
protected $policies = [
    // ...existentes...
    \App\Models\PlaClubTeamConsentForm::class => \App\Policies\ConsentFormPolicy::class,
    \App\Models\PlaClubTeamSignedConsent::class => \App\Policies\ConsentSignaturePolicy::class,
];
```

- [ ] **Step 4: Seed + commit**

```bash
docker compose exec saas_sport_app php artisan db:seed --class=PermissionsSeeder
git add app/Policies/ConsentFormPolicy.php app/Policies/ConsentSignaturePolicy.php app/Providers/AuthServiceProvider.php database/seeders/PermissionsSeeder.php
git commit -m "feat(consent): add policies + Spatie permissions"
```

---

## Task 10: Controllers + routes

**Files:**
- Create: `app/Http/Controllers/ConsentFormController.php`
- Create: `app/Http/Controllers/ConsentSignatureController.php`
- Create: `app/Http/Requests/StoreConsentFormRequest.php`
- Create: `app/Http/Requests/UpdateConsentFormRequest.php`
- Create: `app/Http/Requests/SignConsentFormRequest.php`
- Modify: `routes/api.php`

- [ ] **Step 1: Request classes**

`StoreConsentFormRequest`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConsentFormRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'document_type' => 'required|in:annual_club,one_time',
            'year_valid' => 'nullable|integer|between:2020,2100',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:valid_from',
            'language' => 'nullable|string|size:2',
            'content' => 'required|string',
            'based_on_config_id' => 'nullable|exists:bas_country_consent_configs,id',
            'signers_required' => 'required|array|min:1',
            'signers_required.*' => 'in:parent,guardian,player_adult,player_minor',
            'gate_mode' => 'nullable|in:soft,hard',
        ];
    }
}
```

(Similar para Update — mismas reglas pero todas `sometimes`.)

`SignConsentFormRequest`:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SignConsentFormRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'signer_role' => 'required|in:parent,guardian,player_adult,player_minor',
            'signer_name' => 'required|string|max:255',
            'signer_document_type' => 'nullable|string|max:20',
            'signer_document_number' => 'required|string|max:50',
            'signer_relationship' => 'nullable|string|max:50',
            'signer_email' => 'nullable|email|max:255',
            'signer_phone' => 'nullable|string|max:30',
            'signature_data' => 'required|string|starts_with:data:image/',
            'cosigner_signature_data' => 'nullable|string|starts_with:data:image/',
            'cosigner_name' => 'nullable|string|max:255',
            'cosigner_document_number' => 'nullable|string|max:50',
            'accepted_terms' => 'required|accepted',
        ];
    }
}
```

- [ ] **Step 2: `ConsentFormController`**

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreConsentFormRequest;
use App\Http\Requests\UpdateConsentFormRequest;
use App\Models\PlaClubTeam;
use App\Models\PlaClubTeamConsentForm;
use App\Models\PlaClubTeamPlayer;
use App\Services\ConsentFormService;
use App\Services\ConsentSignatureService;
use App\Services\HtmlSanitizer;
use Illuminate\Http\Request;

class ConsentFormController extends Controller
{
    public function __construct(
        protected ConsentFormService $service,
        protected ConsentSignatureService $signatureService,
        protected HtmlSanitizer $sanitizer,
    ) {}

    public function index(Request $request, int $clubId)
    {
        $club = PlaClubTeam::findOrFail($clubId);
        $this->authorize('viewAny', PlaClubTeamConsentForm::class);

        $forms = PlaClubTeamConsentForm::where('club_id', $clubId)
            ->withCount(['signatures as signed_count' => fn ($q) => $q->where('status', 'signed')])
            ->orderByDesc('year_valid')
            ->get();

        return response()->json(['data' => $forms]);
    }

    public function store(StoreConsentFormRequest $request, int $clubId)
    {
        $club = PlaClubTeam::findOrFail($clubId);
        $this->authorize('create', PlaClubTeamConsentForm::class);

        $data = $request->validated();
        $data['content'] = $this->sanitizer->sanitize($data['content']);

        $form = $this->service->create($club, $request->user(), $data);
        return response()->json(['data' => $form], 201);
    }

    public function show(int $clubId, PlaClubTeamConsentForm $consentForm)
    {
        $this->authorize('view', $consentForm);
        return response()->json(['data' => $consentForm->load('basedOnConfig', 'createdByUser')]);
    }

    public function update(UpdateConsentFormRequest $request, int $clubId, PlaClubTeamConsentForm $consentForm)
    {
        $this->authorize('update', $consentForm);
        $data = $request->validated();
        if (isset($data['content'])) $data['content'] = $this->sanitizer->sanitize($data['content']);
        $form = $this->service->update($consentForm, $data);
        return response()->json(['data' => $form]);
    }

    public function duplicate(int $clubId, PlaClubTeamConsentForm $consentForm, Request $request)
    {
        $this->authorize('create', PlaClubTeamConsentForm::class);
        $year = $request->input('year_valid');
        $copy = $this->service->duplicate($consentForm, $year);
        return response()->json(['data' => $copy], 201);
    }

    public function publish(int $clubId, PlaClubTeamConsentForm $consentForm)
    {
        $this->authorize('publish', $consentForm);
        $form = $this->service->publish($consentForm);
        // TODO en task 11: disparar notificaciones a padres
        return response()->json(['data' => $form]);
    }

    public function destroy(int $clubId, PlaClubTeamConsentForm $consentForm)
    {
        $this->authorize('delete', $consentForm);
        $consentForm->delete();
        return response()->noContent();
    }

    public function previewPdf(int $clubId, PlaClubTeamConsentForm $consentForm, Request $request)
    {
        $this->authorize('view', $consentForm);
        $player = PlaClubTeamPlayer::findOrFail($request->query('player_id'));

        // Firma dummy para preview
        $tmpSig = new \App\Models\PlaClubTeamSignedConsent([
            'consent_form_id' => $consentForm->id,
            'player_id' => $player->id,
            'signer_name' => 'PREVIEW',
            'signer_document_number' => '—',
            'signature_data' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
            'signed_at' => now(),
            'snapshot_content' => app(\App\Services\ConsentVariableResolver::class)
                ->resolve($consentForm, $player, $request->user()),
            'terms_hash' => '—',
            'verification_hash' => 'PREVIEW',
        ]);
        $tmpSig->setRelation('consentForm', $consentForm);
        $tmpSig->setRelation('player', $player);

        $html = view('pdf.consent-form', [
            'signature' => $tmpSig,
            'form' => $consentForm,
            'player' => $player,
            'verificationUrl' => config('app.url') . '/verify/consent/PREVIEW',
        ])->render();

        $bytes = app(\App\Services\CertificationPdfService::class)->htmlToPdf($html);

        return response($bytes)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="preview.pdf"');
    }
}
```

- [ ] **Step 3: `ConsentSignatureController`**

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\SignConsentFormRequest;
use App\Models\PlaClubTeamConsentForm;
use App\Models\PlaClubTeamPlayer;
use App\Models\PlaClubTeamSignedConsent;
use App\Services\ConsentSignatureService;
use App\Services\ConsentTokenService;
use App\Services\ConsentVariableResolver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ConsentSignatureController extends Controller
{
    public function __construct(
        protected ConsentSignatureService $service,
        protected ConsentTokenService $tokens,
        protected ConsentVariableResolver $resolver,
    ) {}

    public function indexSignatures(int $clubId, PlaClubTeamConsentForm $consentForm)
    {
        $this->authorize('view', $consentForm);
        $signatures = $consentForm->signatures()
            ->with('player', 'signerUser')
            ->latest('signed_at')
            ->paginate(50);
        return response()->json($signatures);
    }

    // Público: obtener plantilla + datos del jugador (usa token HMAC)
    public function showByToken(string $token)
    {
        $claims = $this->tokens->validate($token);
        $form = PlaClubTeamConsentForm::withoutGlobalScopes()->findOrFail($claims['form_id']);
        $player = PlaClubTeamPlayer::withoutGlobalScopes()->findOrFail($claims['player_id']);

        // Personalizar el texto con datos reales ya cargados
        $ghost = new \App\Models\User();
        $ghost->name = '';
        $preview = $this->resolver->resolve($form, $player, $ghost);

        return response()->json([
            'form' => ['id' => $form->id, 'name' => $form->name, 'year_valid' => $form->year_valid, 'signers_required' => $form->signers_required],
            'player' => ['id' => $player->id, 'name' => trim($player->name . ' ' . ($player->last_name ?? ''))],
            'personalized_content' => $preview,
            'expires_at' => $claims['exp'],
        ]);
    }

    public function signByToken(SignConsentFormRequest $request, string $token)
    {
        $claims = $this->tokens->validate($token);
        $form = PlaClubTeamConsentForm::withoutGlobalScopes()->findOrFail($claims['form_id']);
        $player = PlaClubTeamPlayer::withoutGlobalScopes()->findOrFail($claims['player_id']);

        $signature = $this->service->sign(
            $form,
            $player,
            $request->validated() + ['signature_method' => 'digital_canvas'],
            $request->user(),
            $request,
            $claims['batch_id'] ?? null,
        );

        return response()->json([
            'data' => [
                'id' => $signature->id,
                'verification_hash' => $signature->verification_hash,
                'pdf_url' => Storage::disk(config('filesystems.default'))->temporaryUrl($signature->pdf_path, now()->addMinutes(15)),
            ],
        ], 201);
    }

    public function revoke(Request $request, PlaClubTeamSignedConsent $signature)
    {
        $this->authorize('revoke', $signature);
        $request->validate(['reason' => 'required|string|max:500']);
        $this->service->revoke($signature, $request->user(), $request->input('reason'));
        return response()->json(['data' => $signature->fresh()]);
    }

    public function verifyPublic(string $hash)
    {
        $sig = PlaClubTeamSignedConsent::withoutGlobalScopes()
            ->where('verification_hash', $hash)
            ->firstOrFail();

        return response()->json([
            'club' => $sig->consentForm->club->name ?? null,
            'form_name' => $sig->consentForm->name,
            'year_valid' => $sig->consentForm->year_valid,
            'signed_at' => $sig->signed_at,
            'signer_name' => $sig->signer_name,
            'status' => $sig->status,
            'terms_hash' => $sig->terms_hash,
        ]);
    }

    public function uploadPhysical(Request $request, int $clubId, PlaClubTeamConsentForm $consentForm, int $playerId)
    {
        $this->authorize('uploadPhysical', \App\Models\PlaClubTeamSignedConsent::class);
        $request->validate([
            'pdf' => 'required|file|mimes:pdf|max:10240',
            'signer_name' => 'required|string|max:255',
            'signer_document_number' => 'required|string|max:50',
            'signed_at' => 'required|date',
        ]);

        $player = PlaClubTeamPlayer::findOrFail($playerId);
        $path = $request->file('pdf')->store("clubs/{$clubId}/consents/physical");

        $sig = PlaClubTeamSignedConsent::create([
            'club_id' => $clubId,
            'consent_form_id' => $consentForm->id,
            'player_id' => $player->id,
            'signer_role' => 'parent',
            'signer_name' => $request->input('signer_name'),
            'signer_document_number' => $request->input('signer_document_number'),
            'signature_data' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
            'signature_method' => 'physical_scan',
            'signed_at' => $request->input('signed_at'),
            'snapshot_content' => $consentForm->content,
            'terms_hash' => hash('sha256', $consentForm->content),
            'verification_hash' => (string) \Str::uuid(),
            'pdf_path' => $path,
            'status' => 'signed',
        ]);

        return response()->json(['data' => $sig], 201);
    }
}
```

- [ ] **Step 4: Rutas**

Agregar en `routes/api.php` (dentro del grupo autenticado existente):

```php
// Admin Flujo A — plantillas
Route::prefix('pla_club_teams/{clubId}/consent-forms')->group(function () {
    Route::get('/', [\App\Http\Controllers\ConsentFormController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\ConsentFormController::class, 'store']);
    Route::get('/{consentForm}', [\App\Http\Controllers\ConsentFormController::class, 'show']);
    Route::put('/{consentForm}', [\App\Http\Controllers\ConsentFormController::class, 'update']);
    Route::post('/{consentForm}/duplicate', [\App\Http\Controllers\ConsentFormController::class, 'duplicate']);
    Route::post('/{consentForm}/publish', [\App\Http\Controllers\ConsentFormController::class, 'publish']);
    Route::delete('/{consentForm}', [\App\Http\Controllers\ConsentFormController::class, 'destroy']);
    Route::get('/{consentForm}/preview-pdf', [\App\Http\Controllers\ConsentFormController::class, 'previewPdf']);
    Route::get('/{consentForm}/signatures', [\App\Http\Controllers\ConsentSignatureController::class, 'indexSignatures']);
    Route::post('/{consentForm}/signatures/{playerId}/upload-physical', [\App\Http\Controllers\ConsentSignatureController::class, 'uploadPhysical']);
});

Route::post('/consent-signatures/{signature}/revoke', [\App\Http\Controllers\ConsentSignatureController::class, 'revoke']);
```

Agregar en el grupo PÚBLICO (sin auth):

```php
Route::get('/public/consents/{token}', [\App\Http\Controllers\ConsentSignatureController::class, 'showByToken'])
    ->middleware('throttle:30,1');
Route::post('/public/consents/{token}/sign', [\App\Http\Controllers\ConsentSignatureController::class, 'signByToken'])
    ->middleware('throttle:10,1');
Route::get('/verify/consent/{hash}', [\App\Http\Controllers\ConsentSignatureController::class, 'verifyPublic']);
```

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/ConsentFormController.php app/Http/Controllers/ConsentSignatureController.php app/Http/Requests/*ConsentForm*.php routes/api.php
git commit -m "feat(consent): add controllers + routes for admin + public sign flow"
```

---

## Task 11: Seeders CO + US

**Files:**
- Create: `database/seeders/ConsentConfigCOSeeder.php`
- Create: `database/seeders/ConsentConfigUSSeeder.php`

- [ ] **Step 1: Seeder CO**

```php
<?php

namespace Database\Seeders;

use App\Models\BasCountryConsentConfig;
use Illuminate\Database\Seeder;

class ConsentConfigCOSeeder extends Seeder
{
    public function run(): void
    {
        BasCountryConsentConfig::updateOrCreate(
            ['country_code' => 'CO', 'language' => 'es'],
            [
                'jurisdiction_law' => 'Ley 1581 de 2012 y Decreto 1377 de 2013',
                'data_authority_name' => 'Superintendencia de Industria y Comercio (SIC)',
                'minor_age_threshold' => 18,
                'requires_parent_for_minor' => true,
                'requires_minor_co_signature' => false,
                'template_version' => '1.0.0',
                'law_last_reviewed_at' => now(),
                'base_template_content' => <<<HTML
<h2>Consentimiento Informado para la Práctica Deportiva</h2>
<p>Yo, <strong>[NOMBRE_ACUDIENTE]</strong>, identificado(a) con documento de identidad No. <strong>[DOCUMENTO_ACUDIENTE]</strong>, actuando en calidad de <strong>[PARENTESCO]</strong> del(la) deportista <strong>[NOMBRE_MENOR]</strong>, identificado(a) con <strong>[DOCUMENTO_MENOR]</strong>, en cumplimiento de la [LEY_REFERENCIA], manifiesto lo siguiente:</p>

<h3>1. Declaración de conocimiento</h3>
<p>Conozco y acepto las condiciones de participación en las actividades deportivas organizadas por <strong>[NOMBRE_CLUB]</strong> para el año <strong>[AÑO_VIGENCIA]</strong>, incluyendo entrenamientos, competencias, desplazamientos y demás actividades propias del club.</p>

<h3>2. Conocimiento de riesgos</h3>
<p>Declaro conocer los riesgos inherentes a la práctica deportiva, incluyendo entre otros: caídas, colisiones, lesiones osteomusculares, traumatismos y situaciones derivadas del esfuerzo físico. Manifiesto que el(la) deportista se encuentra en condiciones físicas aptas para la práctica.</p>

<h3>3. Atención médica de urgencia</h3>
<p>Autorizo expresamente al club para que, en caso de accidente o emergencia, se gestione el traslado a centros asistenciales y se autoricen los procedimientos médicos urgentes necesarios. Declaro que el(la) deportista cuenta con afiliación vigente al Sistema de Seguridad Social en Salud.</p>

<h3>4. Tratamiento de datos personales</h3>
<p>En cumplimiento de la [LEY_REFERENCIA], autorizo al club <strong>[NOMBRE_CLUB]</strong> para recolectar, almacenar, usar y actualizar los datos personales del(la) deportista con fines de inscripción, participación deportiva, comunicación institucional y cumplimiento de reglamentos. Conozco mis derechos como titular ante la [AUTORIDAD_DATOS].</p>

<h3>5. Autorización de uso de imagen</h3>
<p>Autorizo al club para captar, reproducir y divulgar fotografías y videos del(la) deportista en el marco de las actividades deportivas, con fines institucionales y promocionales, a través de redes sociales y medios de comunicación, sin compensación económica.</p>

<h3>6. Aceptación del reglamento</h3>
<p>Declaro conocer y aceptar el reglamento general, disciplinario y deportivo del club.</p>

<p><em>Firmado en [CIUDAD_CLUB] el [FECHA_HOY].</em></p>
HTML,
                'suggested_clauses' => [
                    'data' => 'Cláusula específica de tratamiento de datos según Ley 1581 de 2012...',
                    'image' => 'Cláusula de uso de imagen...',
                    'medical' => 'Cláusula de atención médica de urgencia...',
                ],
            ]
        );
    }
}
```

- [ ] **Step 2: Seeder US**

```php
<?php

namespace Database\Seeders;

use App\Models\BasCountryConsentConfig;
use Illuminate\Database\Seeder;

class ConsentConfigUSSeeder extends Seeder
{
    public function run(): void
    {
        BasCountryConsentConfig::updateOrCreate(
            ['country_code' => 'US', 'language' => 'en'],
            [
                'jurisdiction_law' => 'State tort law + ESIGN Act',
                'data_authority_name' => 'Federal Trade Commission (FTC)',
                'minor_age_threshold' => 18,
                'requires_parent_for_minor' => true,
                'requires_minor_co_signature' => false,
                'template_version' => '1.0.0',
                'law_last_reviewed_at' => now(),
                'base_template_content' => <<<HTML
<h2>Informed Consent for Sports Participation</h2>
<p>I, <strong>[NOMBRE_ACUDIENTE]</strong>, with ID <strong>[DOCUMENTO_ACUDIENTE]</strong>, as the <strong>[PARENTESCO]</strong> of <strong>[NOMBRE_MENOR]</strong>, acknowledge and agree to the terms below for the <strong>[AÑO_VIGENCIA]</strong> season at <strong>[NOMBRE_CLUB]</strong>.</p>
<p>[Refer to state-specific waivers for Liability, Medical Release, Photo/Video, Concussion Acknowledgment, and NIL where applicable.]</p>
<p><em>Signed in [CIUDAD_CLUB] on [FECHA_HOY].</em></p>
HTML,
                'suggested_clauses' => [],
            ]
        );
    }
}
```

- [ ] **Step 3: Ejecutar + commit**

```bash
docker compose exec saas_sport_app php artisan db:seed --class=ConsentConfigCOSeeder
docker compose exec saas_sport_app php artisan db:seed --class=ConsentConfigUSSeeder
git add database/seeders/ConsentConfigCOSeeder.php database/seeders/ConsentConfigUSSeeder.php
git commit -m "feat(consent): add base template seeders for CO and US"
```

---

## Task 12: Test end-to-end feature firma

**Files:**
- Create: `tests/Feature/ConsentSignatureTest.php`

- [ ] **Step 1: Test completo**

```php
<?php

namespace Tests\Feature;

use App\Models\BasCountryConsentConfig;
use App\Models\PlaClubTeam;
use App\Models\PlaClubTeamConsentForm;
use App\Models\PlaClubTeamPlayer;
use App\Models\PlaClubTeamSignedConsent;
use App\Models\User;
use App\Services\ConsentTokenService;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

class ConsentSignatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_parent_signs_via_token_and_gets_pdf(): void
    {
        Storage::fake();
        $this->seed(\Database\Seeders\ConsentConfigCOSeeder::class);

        $club = PlaClubTeam::factory()->create(['country_code' => 'CO']);
        $player = PlaClubTeamPlayer::factory()->create(['club_id' => $club->id]);
        $form = PlaClubTeamConsentForm::factory()->create([
            'club_id' => $club->id,
            'country_code' => 'CO',
            'is_active' => true,
            'year_valid' => 2026,
            'signers_required' => ['parent'],
        ]);

        $token = app(ConsentTokenService::class)->generate([
            'form_id' => $form->id,
            'player_id' => $player->id,
        ], 30);

        $response = $this->postJson("/api/public/consents/{$token}/sign", [
            'signer_role' => 'parent',
            'signer_name' => 'Pedro Pérez',
            'signer_document_number' => '79123456',
            'signer_relationship' => 'padre',
            'signer_email' => 'pedro@test.co',
            'signature_data' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
            'accepted_terms' => true,
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure(['data' => ['id', 'verification_hash', 'pdf_url']]);

        $this->assertDatabaseCount('pla_club_teams_signed_consents', 1);
        $sig = PlaClubTeamSignedConsent::withoutGlobalScopes()->first();
        $this->assertEquals('signed', $sig->status);
        $this->assertEquals(64, strlen($sig->terms_hash));
        $this->assertNotNull($sig->pdf_path);
    }
}
```

- [ ] **Step 2: Run + commit**

```bash
docker compose exec saas_sport_app php artisan test --filter=ConsentSignatureTest
git add tests/Feature/ConsentSignatureTest.php
git commit -m "test(consent): add end-to-end signature test via HMAC token"
```

---

## Entrega

Al terminar todas las tareas:

```bash
git log --oneline -n 20
docker compose exec saas_sport_app php artisan test --filter=Consent
```

Push de la rama y abrir PR a `feature/consent-forms`:

```bash
git push -u origin feature/consent-forms
```

**Integración con otros agentes:**
- Agente #2 (backend Flujo B) usa los modelos `PlaClubTeamConsentForm` y `PlaClubTeamSignedConsent` ya creados — NO tocar migrations ni modelos.
- Agente #3 (frontend admin) consume endpoints `/api/pla_club_teams/{clubId}/consent-forms/*`.
- Agente #4 (frontend padre) consume `/api/public/consents/{token}` + `/api/public/consents/{token}/sign` + `/api/verify/consent/{hash}`.

**Métricas de éxito:**
- Todos los tests Feature pasan
- Migration corre clean en DB vacía
- Seed CO + US crea 2 configs
- PDF preview genera con Gotenberg sin error
- Firma completa end-to-end: POST token → signed_consents + PDF en Storage
