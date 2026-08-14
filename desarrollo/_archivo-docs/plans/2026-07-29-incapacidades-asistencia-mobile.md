<!-- ARCHIVADO 13-ago-2026 — plan EJECUTADO y en produccion; se archiva para que sus 'checkboxes sin marcar' no se confundan con trabajo pendiente. Verificado contra el codigo. -->

# Incapacidades de Jugadores + Asistencia Móvil — Implementation Plan

> ## ✅ EJECUTADO — plan cerrado, en producción (archivado 13-ago-2026)
>
> Verificado contra el código: 54 archivos tocan incapacidades.
> Backend `app/Services/IncapacityAdjustmentService.php`; frontend
> `components/payments/detail/PaymentDetailIncapacity.jsx`,
> `components/payments/IncapacityAdjustmentDialog.jsx`, `IncapacityOverlapNote.jsx`.
>
> **Los `- [ ]` de abajo NO son pendientes**: el plan nunca se fue marcando. No lo ejecutes.
>
> Diseño: `docs/superpowers/specs/2026-07-29-incapacidades-asistencia-mobile-design.md` y
> el ajuste económico en `2026-07-30-cobros-por-incapacidad-design.md`.


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Incapacidades médicas de jugadores (rango de fechas, descripción, certificado) que auto-excluyen de ausencias y cargos per-attendance, más arreglo del drawer de asistencia en móvil (foto de jugador con lightbox, layout que sobrevive rotación en Android/iOS).

**Architecture:** Backend Laravel agrega columna `status` real a la asistencia de sesiones (mata el hack `notes='Llegó tarde'`), nueva tabla `pla_player_incapacities` con CRUD protegido multi-tenant, notificación push+in-app a acudientes y 2 tools del agente IA. Frontend extrae el lightbox de foto a componente compartido, rehace el layout del drawer con `dvh`/safe-area y agrega form de incapacidad accesible desde asistencia y jugadores.

**Tech Stack:** Laravel 12 (Sanctum, Spatie, Reverb), React 18 + Vite + Tailwind + Radix, Playwright.

**Spec:** `docs/superpowers/specs/2026-07-29-incapacidades-asistencia-mobile-design.md`

## Global Constraints

- **Ramas:** NUNCA implementar en `main`. Backend: rama `feature/player-incapacities` en `saas_sport/`. Frontend: rama `feature/attendance-mobile-incapacities` en `frontend/`. Son 2 repos git separados.
- **NO `git push`** en ningún momento. Commits locales sí (parte del plan). Push solo cuando Miguel lo pida (push a main frontend = deploy prod).
- **NUNCA `git add -A`** — add por archivo (sesiones paralelas comparten working tree).
- **NO resetear/dropear/recrear** BD, tablas ni contenedores. Migraciones solo `php artisan migrate`.
- **i18n:** default INGLÉS, obligatorio EN/ES/PT-BR. NO hardcodear español en código nuevo (los textos backend de notificación van por `lang/`).
- **`authorize()` explícito** en todo endpoint nuevo (FormRequest con `ValidatesClubAccess`).
- **Tests backend:** `docker compose exec saas_sport_app php artisan test --filter=<Test>` (sin Docker: `php artisan test`). NUNCA dos suites en paralelo sobre la misma BD.
- **Frontend:** `SecureLogger` (no `console.log`), DatePickers del catálogo (`SimpleDatePicker`, NUNCA `<Input type="date">`), lint `--max-warnings 0`.
- **Fechas:** usar `dateUtils.js` helpers en frontend para evitar el bug de pérdida de 1 día.
- **Commits:** mensaje convencional (`feat:`/`fix:`), terminar con las líneas Co-Authored-By/Claude-Session del harness.

---

## FASE BACKEND (repo `saas_sport/`, rama `feature/player-incapacities`)

### Task 0: Crear rama backend

**Files:** ninguno (git)

- [ ] **Step 1:** `cd /Users/miguelcano/Desktop/todo/Widdo/desarrollo/saas_sport && git status` — verificar working tree. Si hay cambios ajenos, NO tocarlos.
- [ ] **Step 2:** `git checkout -b feature/player-incapacities main`

---

### Task 1: Columna `status` en asistencia de sesiones (present|absent|late|excused)

**Files:**
- Create: `database/migrations/2026_07_29_200000_add_status_to_pla_club_teams_sessions_attendances_table.php`
- Modify: `app/Models/PlaClubTeamSessionAttendance.php`
- Modify: `app/Http/Controllers/PlaClubTeamSessionController.php` (`storeAttendance` ~línea 1050, `normalizedAttendanceStatus` ~1170, `getAttendance` ~1185)
- Test: `tests/Feature/SessionAttendanceStatusTest.php`

**Interfaces:**
- Produces: columna `status` en `pla_club_teams_sessions_attendances`; `storeAttendance` acepta `status: excused` (guarda `attended=false`, `status='excused'`); `getAttendance` devuelve `status` leído de la columna (fallback legado attended+notes). Constantes `PlaClubTeamSessionAttendance::STATUS_PRESENT|ABSENT|LATE|EXCUSED`.

- [ ] **Step 1: Test que falla** — crear `tests/Feature/SessionAttendanceStatusTest.php` clonando el setup de `tests/Feature/SessionAttendanceStoreTest.php` (usa `CreatesClubWithRoles`, `SeedsBaseData`, `Sanctum::actingAs`):

```php
public function test_excused_status_is_persisted_and_returned(): void
{
    Sanctum::actingAs($this->owner);
    $this->postJson("/api/pla_club_teams/{$this->club->id}/sessions/{$this->session->id}/attendance", [
        'attendance_date' => now()->toDateString(),
        'attendance' => [['player_id' => $this->player->id, 'status' => 'excused']],
    ])->assertOk();

    $this->assertDatabaseHas('pla_club_teams_sessions_attendances', [
        'session_id' => $this->session->id,
        'player_id' => $this->player->id,
        'status' => 'excused',
        'attended' => false,
    ]);

    $response = $this->getJson("/api/pla_club_teams/{$this->club->id}/sessions/{$this->session->id}/attendance?attendance_date=" . now()->toDateString());
    $response->assertOk();
    $this->assertSame('excused', collect($response->json('data.attendance'))->firstWhere('player_id', $this->player->id)['status']);
}

public function test_late_status_no_longer_depends_on_notes_hack(): void
{
    Sanctum::actingAs($this->owner);
    $this->postJson("/api/pla_club_teams/{$this->club->id}/sessions/{$this->session->id}/attendance", [
        'attendance_date' => now()->toDateString(),
        'attendance' => [['player_id' => $this->player->id, 'status' => 'late']],
    ])->assertOk();

    $this->assertDatabaseHas('pla_club_teams_sessions_attendances', [
        'player_id' => $this->player->id, 'status' => 'late', 'attended' => true,
    ]);
}
```

- [ ] **Step 2:** Correr `php artisan test --filter=SessionAttendanceStatusTest` — Expected: FAIL (422 por `in:present,absent,late` y columna inexistente).
- [ ] **Step 3: Migración** (clonar estilo de `2026_07_29_120000_add_manual_amount_to_payments_table.php`):

```php
public function up(): void
{
    Schema::table('pla_club_teams_sessions_attendances', function (Blueprint $table) {
        $table->string('status', 10)->nullable()->after('attended')
            ->comment('present|absent|late|excused. null = registro legado (derivar de attended+notes)');
    });

    DB::statement("
        UPDATE pla_club_teams_sessions_attendances
        SET status = CASE
            WHEN attended = 1 AND notes = 'Llegó tarde' THEN 'late'
            WHEN attended = 1 THEN 'present'
            ELSE 'absent'
        END
        WHERE status IS NULL
    ");
}

public function down(): void
{
    Schema::table('pla_club_teams_sessions_attendances', function (Blueprint $table) {
        $table->dropColumn('status');
    });
}
```

- [ ] **Step 4: Modelo** — en `PlaClubTeamSessionAttendance` agregar `'status'` a `$fillable` y constantes:

```php
public const STATUS_PRESENT = 'present';
public const STATUS_ABSENT = 'absent';
public const STATUS_LATE = 'late';
public const STATUS_EXCUSED = 'excused';
```

- [ ] **Step 5: Controller** — en `storeAttendance`:
  - Validación: `'attendance.*.status' => 'required|in:present,absent,late,excused'`.
  - Reemplazar conversión: `$attended = in_array($record['status'], ['present', 'late']); $notes = null;` (el hack de notes muere; NO escribir `'Llegó tarde'` nunca más) y agregar `'status' => $record['status']` al `fill()`.
  - En `normalizedAttendanceStatus`: `return $attendance->status ?? ($attendance->attended ? ($attendance->notes === 'Llegó tarde' ? 'late' : 'present') : 'absent');`
  - En `getAttendance` (~1185): donde arma cada registro, usar `$this->normalizedAttendanceStatus($attendance)` para el campo `status` (ya existe mapeo — asegurar que lee la columna vía el método).
- [ ] **Step 6:** `php artisan migrate` y correr `php artisan test --filter=SessionAttendanceStatusTest` — Expected: PASS. Correr también la suite existente `php artisan test --filter=SessionAttendance` — Expected: PASS (sin romper tests viejos).
- [ ] **Step 7: Commit**

```bash
git add database/migrations/2026_07_29_200000_add_status_to_pla_club_teams_sessions_attendances_table.php app/Models/PlaClubTeamSessionAttendance.php app/Http/Controllers/PlaClubTeamSessionController.php tests/Feature/SessionAttendanceStatusTest.php
git commit -m "feat: columna status real en asistencia de sesiones (present/absent/late/excused)"
```

---

### Task 2: Tabla + modelo `PlaPlayerIncapacity`

**Files:**
- Create: `database/migrations/2026_07_29_201000_create_pla_player_incapacities_table.php`
- Create: `app/Models/PlaPlayerIncapacity.php`
- Create: `database/factories/PlaPlayerIncapacityFactory.php`
- Test: `tests/Unit/PlaPlayerIncapacityTest.php`

**Interfaces:**
- Produces: modelo `PlaPlayerIncapacity` (trait `ProtectedModel` + `SoftDeletes`), constantes `STATUS_ACTIVE='ACT'`, `STATUS_FINISHED='FIN'`, `STATUS_DELETED='BOR'`, scope `activeOn($query, $date)` (status ACT, `start_date <= $date`, `end_date null o >= $date`), relaciones `player()`, `creator()`.

- [ ] **Step 1: Test que falla** — `tests/Unit/PlaPlayerIncapacityTest.php`:

```php
public function test_active_on_scope_includes_open_ended_and_ranged(): void
{
    $abierta = PlaPlayerIncapacity::factory()->create(['start_date' => '2026-07-01', 'end_date' => null, 'status' => 'ACT']);
    $cerrada = PlaPlayerIncapacity::factory()->create(['start_date' => '2026-07-01', 'end_date' => '2026-07-10', 'status' => 'ACT']);
    $finalizada = PlaPlayerIncapacity::factory()->create(['start_date' => '2026-07-01', 'end_date' => null, 'status' => 'FIN']);

    $activasHoy = PlaPlayerIncapacity::withoutGlobalScopes()->activeOn('2026-07-15')->pluck('id');

    $this->assertTrue($activasHoy->contains($abierta->id));
    $this->assertFalse($activasHoy->contains($cerrada->id)); // rango ya venció
    $this->assertFalse($activasHoy->contains($finalizada->id)); // dada de alta
}
```

- [ ] **Step 2:** `php artisan test --filter=PlaPlayerIncapacityTest` — Expected: FAIL (clase no existe).
- [ ] **Step 3: Migración:**

```php
public function up(): void
{
    Schema::create('pla_player_incapacities', function (Blueprint $table) {
        $table->id();
        $table->foreignId('club_id')->constrained('pla_club_teams');
        $table->foreignId('player_id')->constrained('pla_club_teams_players');
        $table->date('start_date');
        $table->date('end_date')->nullable()->comment('null = hasta nuevo aviso');
        $table->text('description');
        $table->string('document_path')->nullable()->comment('certificado médico en Spaces');
        $table->string('status', 3)->default('ACT')->comment('ACT activa | FIN finalizada (alta) | BOR borrada');
        $table->foreignId('created_by')->constrained('users');
        $table->timestamps();
        $table->softDeletes();
        $table->index(['player_id', 'status']);
    });
}

public function down(): void
{
    Schema::dropIfExists('pla_player_incapacities');
}
```

- [ ] **Step 4: Modelo** (clonar cabecera de `PlaClubTeamSessionAttendance`):

```php
namespace App\Models;

use App\Traits\ProtectedModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PlaPlayerIncapacity extends Model
{
    use HasFactory, ProtectedModel, SoftDeletes;

    public const STATUS_ACTIVE = 'ACT';
    public const STATUS_FINISHED = 'FIN';
    public const STATUS_DELETED = 'BOR';

    protected $table = 'pla_player_incapacities';

    protected $fillable = [
        'club_id', 'player_id', 'start_date', 'end_date',
        'description', 'document_path', 'status', 'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function player()
    {
        return $this->belongsTo(PlaClubTeamPlayer::class, 'player_id')->withTrashed();
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActiveOn($query, $date)
    {
        return $query->where('status', self::STATUS_ACTIVE)
            ->whereDate('start_date', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('end_date')->orWhereDate('end_date', '>=', $date);
            });
    }
}
```

- [ ] **Step 5: Factory** — `PlaPlayerIncapacityFactory` con `club_id`/`player_id`/`created_by` a factories relacionadas (clonar cómo otras factories del repo referencian club y player; si `PlaClubTeamPlayerFactory` existe, usarla), `start_date => now()->subDays(5)`, `description => fake()->sentence()`, `status => 'ACT'`.
- [ ] **Step 6:** `php artisan migrate && php artisan test --filter=PlaPlayerIncapacityTest` — Expected: PASS.
- [ ] **Step 7: Commit**

```bash
git add database/migrations/2026_07_29_201000_create_pla_player_incapacities_table.php app/Models/PlaPlayerIncapacity.php database/factories/PlaPlayerIncapacityFactory.php tests/Unit/PlaPlayerIncapacityTest.php
git commit -m "feat: modelo y tabla pla_player_incapacities"
```

---

### Task 3: CRUD de incapacidades (endpoints + RBAC + solapamiento + adjunto)

**Files:**
- Create: `app/Http/Controllers/PlaPlayerIncapacityController.php`
- Create: `app/Http/Requests/StorePlayerIncapacityRequest.php`
- Modify: `routes/api.php` (dentro del prefix `pla_club_teams/{pla_club_team}`, junto a las rutas de players ~línea 786)
- Test: `tests/Feature/PlayerIncapacityCrudTest.php`

**Interfaces:**
- Consumes: `PlaPlayerIncapacity` (Task 2), trait `ValidatesClubAccess::authorizeClubAccessWithPermission()`.
- Produces:
  - `GET /api/pla_club_teams/{club}/players/{player}/incapacities` → `{ data: [{id, start_date, end_date, description, document_url, status, created_at}] }`
  - `POST .../incapacities` (multipart: `start_date`, `end_date?`, `description`, `document?`) → 201 con la incapacidad
  - `PATCH .../incapacities/{incapacity}/discharge` → status FIN, `end_date = min(end_date, hoy)` o hoy si null
  - `DELETE .../incapacities/{incapacity}` → soft delete + status BOR
  - Notifica a acudientes vía `PlayerIncapacityNotifier` (stub en esta task, implementación real en Task 5: crear la clase con método `notifyGuardians(PlaPlayerIncapacity $incapacity): void` vacío).

- [ ] **Step 1: Test que falla** — `tests/Feature/PlayerIncapacityCrudTest.php` (setup con `CreatesClubWithRoles` + `SeedsBaseData`, mismo patrón de `SessionAttendanceStoreTest`; el trait expone owner/trainer/parent — verificar nombres de propiedades en el trait y ajustar):

```php
public function test_trainer_can_create_incapacity(): void
{
    Sanctum::actingAs($this->trainer);
    $this->postJson("/api/pla_club_teams/{$this->club->id}/players/{$this->player->id}/incapacities", [
        'start_date' => '2026-08-01', 'end_date' => '2026-08-15', 'description' => 'Esguince de tobillo',
    ])->assertCreated();

    $this->assertDatabaseHas('pla_player_incapacities', [
        'player_id' => $this->player->id, 'club_id' => $this->club->id, 'status' => 'ACT',
    ]);
}

public function test_parent_cannot_create_incapacity(): void
{
    Sanctum::actingAs($this->parent);
    $this->postJson("/api/pla_club_teams/{$this->club->id}/players/{$this->player->id}/incapacities", [
        'start_date' => '2026-08-01', 'description' => 'x',
    ])->assertForbidden();
}

public function test_cross_club_access_denied(): void
{
    [$otherClub, $otherOwner] = $this->createAnotherClubWithOwner(); // usar helper equivalente del trait; si no existe, crear segundo club inline
    Sanctum::actingAs($otherOwner);
    $this->postJson("/api/pla_club_teams/{$this->club->id}/players/{$this->player->id}/incapacities", [
        'start_date' => '2026-08-01', 'description' => 'x',
    ])->assertForbidden();
}

public function test_overlapping_active_incapacity_rejected(): void
{
    PlaPlayerIncapacity::factory()->create([
        'club_id' => $this->club->id, 'player_id' => $this->player->id,
        'start_date' => '2026-08-01', 'end_date' => '2026-08-20', 'status' => 'ACT',
    ]);
    Sanctum::actingAs($this->owner);
    $this->postJson("/api/pla_club_teams/{$this->club->id}/players/{$this->player->id}/incapacities", [
        'start_date' => '2026-08-10', 'description' => 'otra',
    ])->assertUnprocessable();
}

public function test_discharge_sets_fin_and_end_date(): void
{
    $inc = PlaPlayerIncapacity::factory()->create([
        'club_id' => $this->club->id, 'player_id' => $this->player->id,
        'start_date' => now()->subDays(3)->toDateString(), 'end_date' => null, 'status' => 'ACT',
    ]);
    Sanctum::actingAs($this->owner);
    $this->patchJson("/api/pla_club_teams/{$this->club->id}/players/{$this->player->id}/incapacities/{$inc->id}/discharge")
        ->assertOk();
    $this->assertDatabaseHas('pla_player_incapacities', [
        'id' => $inc->id, 'status' => 'FIN', 'end_date' => now()->toDateString() . ' 00:00:00',
    ]);
}
```

- [ ] **Step 2:** `php artisan test --filter=PlayerIncapacityCrudTest` — Expected: FAIL (404 rutas).
- [ ] **Step 3: FormRequest:**

```php
class StorePlayerIncapacityRequest extends FormRequest
{
    use ValidatesClubAccess;

    public function authorize(): bool
    {
        return $this->authorizeClubAccessWithPermission('attendance.create');
    }

    public function rules(): array
    {
        return [
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'description' => 'required|string|max:1000',
            'document' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ];
    }
}
```

  Verificar en `app/Models/UserClubRole.php` (~líneas 61-126) que Owner y Admin también tienen `attendance.create` (Trainer lo tiene). Si Owner/Admin no lo tienen, agregarlo a sus arrays de permisos en ese archivo.
- [ ] **Step 4: Controller** — `PlaPlayerIncapacityController`:
  - `index(PlaClubTeam $plaClubTeam, PlaClubTeamPlayer $player)`: autorización — si el usuario tiene `attendance.view` en el club O es acudiente autorizado del jugador (`parent_child_relationships` con `child_user_id = $player->user_id`, `parent_user_id = auth id`, `authorization_status='authorized'`), devolver historial ordenado `start_date desc` con `document_url` = URL firmada temporal si `document_path` (clonar cómo `User::getProfilePhotoUrlAttribute()` en `app/Models/User.php:226-236` genera la URL firmada de 60 min, mismo disk). Si no autorizado → `abort(403)`.
  - `store(StorePlayerIncapacityRequest $request, ...)`: validar solapamiento antes de crear:

```php
$overlap = PlaPlayerIncapacity::where('player_id', $player->id)
    ->where('status', PlaPlayerIncapacity::STATUS_ACTIVE)
    ->whereDate('start_date', '<=', $request->input('end_date') ?? '9999-12-31')
    ->where(function ($q) use ($request) {
        $q->whereNull('end_date')->orWhereDate('end_date', '>=', $request->input('start_date'));
    })->exists();
if ($overlap) {
    return response()->json(['message' => __('incapacities.overlap_error')], 422);
}
```

  Guardar `document` si viene: `$path = $request->file('document')->store("incapacities/{$plaClubTeam->id}", config('filesystems.default'))` (usar el MISMO disk que fotos de perfil — verificar en el accessor de User). Crear con `club_id => $plaClubTeam->id`, `created_by => $request->user()->id`, `status => ACT`. Llamar `app(PlayerIncapacityNotifier::class)->notifyGuardians($incapacity)` (stub por ahora). Devolver 201.
  - `discharge(...)`: autorizar con el mismo permiso (`Gate` no — reutilizar `authorizeClubAccessWithPermission` vía FormRequest inline o replicar chequeo del trait en el controller con `abort_unless`), set `status = FIN`, `end_date = $inc->end_date && $inc->end_date->lt(today()) ? $inc->end_date : today()`.
  - `destroy(...)`: `status = BOR` + `delete()` (soft).
- [ ] **Step 5: Rutas** en `routes/api.php` junto a players (~786):

```php
Route::get('players/{player}/incapacities', [PlaPlayerIncapacityController::class, 'index'])->scopeBindings();
Route::post('players/{player}/incapacities', [PlaPlayerIncapacityController::class, 'store'])->scopeBindings();
Route::patch('players/{player}/incapacities/{incapacity}/discharge', [PlaPlayerIncapacityController::class, 'discharge'])->scopeBindings();
Route::delete('players/{player}/incapacities/{incapacity}', [PlaPlayerIncapacityController::class, 'destroy'])->scopeBindings();
```

  Crear stub `app/Services/PlayerIncapacityNotifier.php` con `notifyGuardians(PlaPlayerIncapacity $incapacity): void {}` vacío.
- [ ] **Step 6:** Agregar clave `overlap_error` a `lang/en/incapacities.php`, `lang/es/incapacities.php`, `lang/pt_BR/incapacities.php` (verificar carpeta pt exacta que ya existe en `lang/` — usar la misma):

```php
// en/incapacities.php
return ['overlap_error' => 'The player already has an active incapacity overlapping those dates.'];
// es: 'El jugador ya tiene una incapacidad activa que se cruza con esas fechas.'
// pt: 'O jogador já tem uma incapacidade ativa que se sobrepõe a essas datas.'
```

- [ ] **Step 7:** `php artisan test --filter=PlayerIncapacityCrudTest` — Expected: PASS.
- [ ] **Step 8: Commit**

```bash
git add app/Http/Controllers/PlaPlayerIncapacityController.php app/Http/Requests/StorePlayerIncapacityRequest.php app/Services/PlayerIncapacityNotifier.php routes/api.php lang tests/Feature/PlayerIncapacityCrudTest.php
git commit -m "feat: CRUD de incapacidades de jugadores con RBAC y adjunto"
```

---

### Task 4: Integración con asistencia y cargos per-attendance

**Files:**
- Modify: `app/Http/Controllers/PlaClubTeamSessionController.php` (`getSessionPlayers` ~1262)
- Test: `tests/Feature/IncapacityAttendanceIntegrationTest.php`

**Interfaces:**
- Consumes: `PlaPlayerIncapacity::activeOn()`, `AttendancePaymentService::handleAttendanceChange()` (decide por `$attendance->attended`: true genera pago, false cancela — `app/Services/AttendancePaymentService.php:26-137`).
- Produces: `getSessionPlayers` acepta query param `date` (default hoy) y agrega por jugador `active_incapacity: {id, start_date, end_date} | null`.

- [ ] **Step 1: Test que falla:**

```php
public function test_session_players_include_active_incapacity(): void
{
    $inc = PlaPlayerIncapacity::factory()->create([
        'club_id' => $this->club->id, 'player_id' => $this->player->id,
        'start_date' => now()->subDay()->toDateString(), 'end_date' => now()->addDays(10)->toDateString(),
    ]);
    Sanctum::actingAs($this->owner);
    $response = $this->getJson("/api/pla_club_teams/{$this->club->id}/sessions/{$this->session->id}/players?date=" . now()->toDateString());
    $response->assertOk();
    $playerRow = collect($response->json('data.players'))->firstWhere('id', $this->player->id);
    $this->assertSame($inc->id, $playerRow['active_incapacity']['id']);
}

public function test_excused_attendance_does_not_generate_per_attendance_payment(): void
{
    // Crear cargo per-attendance para el club/categoría del jugador,
    // clonando el setup de los tests existentes de AttendancePaymentService
    // (buscar tests que usen PlaClubTeamCharge con periodicidad por asistencia).
    $charge = $this->createPerAttendanceCharge();

    Sanctum::actingAs($this->owner);
    $this->postJson("/api/pla_club_teams/{$this->club->id}/sessions/{$this->session->id}/attendance", [
        'attendance_date' => now()->toDateString(),
        'attendance' => [['player_id' => $this->player->id, 'status' => 'excused']],
    ])->assertOk();

    $this->assertDatabaseMissing('pla_club_teams_payments', [
        'player_id' => $this->player->id, 'charge_id' => $charge->id,
    ]);
}
```

- [ ] **Step 2:** `php artisan test --filter=IncapacityAttendanceIntegrationTest` — Expected: FAIL (falta `active_incapacity`).
- [ ] **Step 3:** En `getSessionPlayers`: leer `$date = $request->query('date', now()->toDateString());`, precargar `PlaPlayerIncapacity::withoutGlobalScopes()->whereIn('player_id', $playerIds)->activeOn($date)->get()->keyBy('player_id')` y agregar al array de cada jugador:

```php
'active_incapacity' => ($inc = $incapacities->get($player->id)) ? [
    'id' => $inc->id,
    'start_date' => $inc->start_date->toDateString(),
    'end_date' => $inc->end_date?->toDateString(),
] : null,
```

  Nota: el pago per-attendance NO necesita cambio — `excused` guarda `attended=false` (Task 1) y `AttendancePaymentService` con `attended=false` cancela/no genera. El test 2 lo demuestra.
- [ ] **Step 4:** `php artisan test --filter=IncapacityAttendanceIntegrationTest` — Expected: PASS.
- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/PlaClubTeamSessionController.php tests/Feature/IncapacityAttendanceIntegrationTest.php
git commit -m "feat: incapacidad activa en jugadores de sesión y exclusión de cargos por asistencia"
```

---

### Task 5: Notificación push + in-app a acudientes

**Files:**
- Modify: `app/Services/PlayerIncapacityNotifier.php` (implementar el stub)
- Modify: `lang/{en,es,pt_BR}/incapacities.php`
- Test: `tests/Feature/PlayerIncapacityNotificationTest.php`

**Interfaces:**
- Consumes: patrón de acudientes de `SessionNotificationService::getParentsFromPlayerUserIds()` (`app/Services/SessionNotificationService.php:155-170`): `DB::table('parent_child_relationships')->where('child_user_id', ...)->where('authorization_status', 'authorized')->pluck('parent_user_id')`. `NotificationService`, evento `NotificationCreated`, `WebPushService::sendToUser()`.
- Produces: al crear incapacidad, cada acudiente autorizado recibe `PlaNotification` (broadcast `notification.created`) + web push, en su idioma.

- [ ] **Step 1: Test que falla:**

```php
public function test_guardians_get_notification_on_incapacity_created(): void
{
    // $this->parent es acudiente autorizado de $this->player (verificar que el trait
    // CreatesClubWithRoles crea la fila en parent_child_relationships; si no, crearla inline)
    Sanctum::actingAs($this->trainer);
    $this->postJson("/api/pla_club_teams/{$this->club->id}/players/{$this->player->id}/incapacities", [
        'start_date' => now()->toDateString(), 'description' => 'Fractura',
    ])->assertCreated();

    $this->assertDatabaseHas('pla_notifications', [
        'user_id' => $this->parent->id,
        'type' => 'incapacity',
        'club_id' => $this->club->id,
    ]);
}
```

  (Verificar nombre real de la tabla de `PlaNotification` con `php artisan tinker` o el modelo antes de escribir el assert.)
- [ ] **Step 2:** Correr — Expected: FAIL.
- [ ] **Step 3: Implementar `PlayerIncapacityNotifier::notifyGuardians`:**

```php
public function notifyGuardians(PlaPlayerIncapacity $incapacity): void
{
    $incapacity->loadMissing('player.user');
    $childUserId = $incapacity->player?->user_id;
    if (! $childUserId) {
        return;
    }

    $parentIds = DB::table('parent_child_relationships')
        ->where('child_user_id', $childUserId)
        ->where('authorization_status', 'authorized')
        ->pluck('parent_user_id');

    $playerName = trim($incapacity->player->user->name . ' ' . $incapacity->player->user->lastname);

    foreach (User::whereIn('id', $parentIds)->get() as $parent) {
        $locale = $parent->locale ?? config('app.locale'); // verificar campo real de idioma en users
        $title = __('incapacities.notification_title', [], $locale);
        $message = __('incapacities.notification_body', [
            'player' => $playerName,
            'start' => $incapacity->start_date->format('d/m/Y'),
            'end' => $incapacity->end_date?->format('d/m/Y') ?? __('incapacities.until_further_notice', [], $locale),
        ], $locale);

        $notification = app(NotificationService::class)->create([
            'user_id' => $parent->id,
            'club_id' => $incapacity->club_id,
            'type' => 'incapacity',
            'title' => $title,
            'message' => $message,
            'priority' => 'normal',
        ]);
        event(new NotificationCreated($notification));
        app(WebPushService::class)->sendToUser($parent, $title, $message);
    }
}
```

  (Ajustar claves del `create()` a los campos reales de `PlaNotification` — mirar otro caller de `NotificationService::create` y clonar.)
- [ ] **Step 4: Claves lang** agregar a los 3 archivos `incapacities.php`:

```php
// en
'notification_title' => 'Medical leave registered',
'notification_body' => ':player has a medical leave from :start to :end.',
'until_further_notice' => 'until further notice',
// es: 'Incapacidad registrada' / ':player tiene una incapacidad del :start al :end.' / 'hasta nuevo aviso'
// pt: 'Licença médica registrada' / ':player tem uma licença médica de :start até :end.' / 'até novo aviso'
```

- [ ] **Step 5:** `php artisan test --filter=PlayerIncapacityNotificationTest` — Expected: PASS. Correr también `--filter=PlayerIncapacityCrudTest` (el notifier ya no es stub) — PASS.
- [ ] **Step 6: Commit**

```bash
git add app/Services/PlayerIncapacityNotifier.php lang tests/Feature/PlayerIncapacityNotificationTest.php
git commit -m "feat: notificación push e in-app a acudientes al registrar incapacidad"
```

---

### Task 6: Tools del agente IA (chat)

**Files:**
- Modify: `app/Services/Assistant/ToolDefinitions.php` (schemas ~82-178)
- Modify: `app/Services/Assistant/Tools/ReadTools.php` (`getToolMap` línea 22)
- Modify: `app/Services/Assistant/Tools/WriteTools.php` (`getToolMap` línea 34)
- Test: `tests/Feature/AssistantIncapacityToolsTest.php` (clonar el patrón del test existente de tools — buscar `tests/` con `recordAttendance` o `createCharge` para el estilo)

**Interfaces:**
- Consumes: patrón de resolución de jugador por nombre que ya usa `recordAttendance`/`markSessionAttendance` en WriteTools (reutilizar el mismo helper interno), patrón preview/confirm de `createCity` (`WriteTools.php:34-169`), `PlaPlayerIncapacity`, `PlayerIncapacityNotifier`.
- Produces: tool read `getPlayerIncapacities` (input: `player_name` opcional, `only_active` bool default true) y tool write `createPlayerIncapacity` (input: `player_name`, `start_date`, `end_date` opcional, `description`, `confirmed` bool — preview si `!confirmed`).

- [ ] **Step 1: Test que falla** — invocar los tools como lo hace el test existente de assistant tools (ejecución directa del servicio con clubId/userId), asertar: read devuelve incapacidad creada por factory; write con `confirmed=false` devuelve `preview => true` sin crear fila; write con `confirmed=true` crea fila ACT y respeta rol (userId de un Parent → `success => false`).
- [ ] **Step 2:** Correr — Expected: FAIL.
- [ ] **Step 3:** `ToolDefinitions.php` — agregar schemas (clonar formato exacto de `markSessionAttendance` líneas 166-178):

```php
[
    'name' => 'getPlayerIncapacities',
    'description' => 'Consulta incapacidades médicas de un jugador o las activas del club. Úsalo cuando pregunten quién está incapacitado o el historial médico de ausencias justificadas.',
    'input_schema' => [
        'type' => 'object',
        'properties' => [
            'player_name' => ['type' => 'string', 'description' => 'Nombre del jugador. Omitir para listar todas las activas del club.'],
            'only_active' => ['type' => 'boolean', 'description' => 'Solo incapacidades vigentes hoy. Default true.'],
        ],
        'required' => [],
    ],
],
[
    'name' => 'createPlayerIncapacity',
    'description' => 'Registra una incapacidad médica a un jugador (rango de fechas + descripción). Excluye al jugador de ausencias y cargos por asistencia en el rango. Pide confirmación antes de crear.',
    'input_schema' => [
        'type' => 'object',
        'properties' => [
            'player_name' => ['type' => 'string'],
            'start_date' => ['type' => 'string', 'description' => 'YYYY-MM-DD'],
            'end_date' => ['type' => 'string', 'description' => 'YYYY-MM-DD. Omitir = hasta nuevo aviso.'],
            'description' => ['type' => 'string'],
            'confirmed' => ['type' => 'boolean', 'description' => 'false = preview, true = ejecutar'],
        ],
        'required' => ['player_name', 'start_date', 'description'],
    ],
],
```

- [ ] **Step 4:** `ReadTools`: registrar `'getPlayerIncapacities' => 'getPlayerIncapacities'` en `getToolMap()` e implementar el método devolviendo `['success' => true, 'data' => [...]]` con player, fechas, descripción, status. `WriteTools`: registrar `createPlayerIncapacity`, implementar con preview/confirm de `createCity` + misma validación de solapamiento del controller (extraer a método estático `PlaPlayerIncapacity::hasOverlap($playerId, $start, $end): bool` y usarlo en ambos sitios — refactor del controller incluido) + llamar `PlayerIncapacityNotifier`.
- [ ] **Step 5:** Correr test — Expected: PASS.
- [ ] **Step 6: Commit**

```bash
git add app/Services/Assistant/ToolDefinitions.php app/Services/Assistant/Tools/ReadTools.php app/Services/Assistant/Tools/WriteTools.php app/Models/PlaPlayerIncapacity.php app/Http/Controllers/PlaPlayerIncapacityController.php tests/Feature/AssistantIncapacityToolsTest.php
git commit -m "feat: tools de incapacidades para el agente IA (consulta y registro)"
```

---

### Task 7: Suite backend completa

- [ ] **Step 1:** `php artisan test` (suite completa) — Expected: PASS total. Si algo rojo NO relacionado con estas tasks, reportar a Miguel sin arreglar en esta rama.

---

## FASE FRONTEND (repo `frontend/`, rama `feature/attendance-mobile-incapacities`)

### Task 8: Rama + namespace i18n `incapacities`

**Files:**
- Create: `src/i18n/locales/en/incapacities.json`, `src/i18n/locales/es/incapacities.json`, `src/i18n/locales/pt-BR/incapacities.json`
- Modify: `src/i18n/index.js` (imports + resources en los 3 idiomas — los 3 puntos deben coincidir o el namespace no llega al usuario)

- [ ] **Step 1:** `cd /Users/miguelcano/Desktop/todo/Widdo/desarrollo/frontend && git checkout -b feature/attendance-mobile-incapacities main`
- [ ] **Step 2:** Crear los 3 JSON con claves completas (en como fuente):

```json
{
  "title": "Medical leave",
  "report_action": "Report medical leave",
  "start_date": "Start date",
  "end_date": "End date",
  "until_further_notice": "Until further notice",
  "description": "Description",
  "description_placeholder": "E.g. sprained ankle, medical order for 2 weeks",
  "document": "Medical certificate (optional)",
  "document_hint": "Image or PDF, max 10MB",
  "only_this_session": "Only this session",
  "date_range": "Date range",
  "save": "Save medical leave",
  "saving": "Saving...",
  "created_ok": "Medical leave registered",
  "created_ok_desc": "The player will be excused in sessions within the range.",
  "create_error": "Could not register the medical leave",
  "active_badge": "On medical leave",
  "excused_label": "Excused",
  "history_title": "Medical leave history",
  "no_history": "No medical leaves registered",
  "discharge": "Mark as recovered",
  "discharge_confirm_title": "Mark as recovered?",
  "discharge_confirm_desc": "The player will count as available again starting today.",
  "discharged_ok": "Medical leave finished",
  "incapacitated_count": "{{count}} on medical leave",
  "overlap_error": "This player already has an active medical leave in those dates",
  "view_certificate": "View certificate"
}
```

  ES y PT-BR: traducir cada clave (es: "Incapacidad", "Reportar incapacidad", "Hasta nuevo aviso", "Solo esta sesión", "Incapacitado", "Dar de alta", "{{count}} incapacitados"…; pt-BR: "Licença médica", "Reportar licença médica", "Até novo aviso", "Somente esta sessão", "De licença médica", "Dar alta", "{{count}} de licença"…).
- [ ] **Step 3:** En `src/i18n/index.js`: agregar los 3 imports (`enIncapacities`, `esIncapacities`, `ptBRIncapacities`) y las 3 entradas `incapacities:` en `resources` de cada idioma.
- [ ] **Step 4:** `npm run lint` — Expected: 0 warnings.
- [ ] **Step 5: Commit**

```bash
git add src/i18n/locales/en/incapacities.json src/i18n/locales/es/incapacities.json src/i18n/locales/pt-BR/incapacities.json src/i18n/index.js
git commit -m "feat: namespace i18n incapacities (en/es/pt-BR)"
```

---

### Task 9: `PlayerPhotoLightbox` compartido

**Files:**
- Create: `src/components/players/PlayerPhotoLightbox.jsx`
- Modify: `src/pages/dashboard/Players/components/PlayersModals.jsx` (reemplazar bloque inline líneas 298-332)

**Interfaces:**
- Produces: `<PlayerPhotoLightbox player={playerOrNull} onClose={fn} />` — `player` necesita `{profile_photo_url, name, lastname, age?}`; null = cerrado. Overlay `z-[9999]`, cierra con click fuera y botón X.

- [ ] **Step 1:** Crear el componente moviendo el JSX EXACTO de `PlayersModals.jsx:298-332` (overlay `fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm`, `img max-h-[75vh]`, botón X, nombre + edad debajo):

```jsx
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PlayerPhotoLightbox({ player, onClose }) {
  const { t } = useTranslation('players');
  if (!player || !player.profile_photo_url) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-lg max-h-[80vh] p-2">
        <img
          src={player.profile_photo_url}
          alt={`${player.name} ${player.lastname}`}
          className="max-w-full max-h-[75vh] rounded-xl object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="mt-3 text-center text-white">
          <p className="font-semibold text-lg">
            {player.name} {player.lastname}
          </p>
          {player.age && (
            <p className="text-sm text-gray-300">
              {t('grid.years_old', { defaultValue: '{{age}} years', age: player.age })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2:** En `PlayersModals.jsx`: borrar el bloque inline y renderizar `<PlayerPhotoLightbox player={photoModalPlayer} onClose={() => setPhotoModalPlayer(null)} />` (el estado `photoModalPlayer` vive donde vivía — `PlayersGrid.jsx:68` lo pasa como prop; no mover el estado). Quitar import de `X` si queda sin uso.
- [ ] **Step 3:** `npm run lint && npm run build` — Expected: OK. Verificación manual: `npm run dev`, abrir `/home/players`, click en foto de card → lightbox idéntico al de antes.
- [ ] **Step 4: Commit**

```bash
git add src/components/players/PlayerPhotoLightbox.jsx src/pages/dashboard/Players/components/PlayersModals.jsx
git commit -m "refactor: extraer PlayerPhotoLightbox como componente compartido"
```

---

### Task 10: Servicio + form de incapacidad

**Files:**
- Create: `src/services/playerIncapacityService.js`
- Create: `src/components/players/IncapacityFormDialog.jsx`

**Interfaces:**
- Consumes: endpoints de Task 3, `optimizeImage()` de `src/utils/fileOptimizer.js:72-117` (compresión canvas existente — NO escribir compresión nueva), `SimpleDatePicker`, `useToast`.
- Produces:
  - `playerIncapacityService = { list(clubId, playerId), create(clubId, playerId, formData), discharge(clubId, playerId, incapacityId), remove(clubId, playerId, incapacityId) }`
  - `<IncapacityFormDialog open onClose player clubId defaultRange={{start, end}|null} onSuccess />` — si `defaultRange` viene con start=end, preselecciona modo "solo esta sesión".

- [ ] **Step 1: Servicio** (patrón de `sessionService.js`):

```javascript
import api from './api';

const playerIncapacityService = {
  list: async (clubId, playerId) => {
    const response = await api.get(`/api/pla_club_teams/${clubId}/players/${playerId}/incapacities`);
    return response.data;
  },
  create: async (clubId, playerId, formData) => {
    const response = await api.post(
      `/api/pla_club_teams/${clubId}/players/${playerId}/incapacities`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
  discharge: async (clubId, playerId, incapacityId) => {
    const response = await api.patch(
      `/api/pla_club_teams/${clubId}/players/${playerId}/incapacities/${incapacityId}/discharge`
    );
    return response.data;
  },
  remove: async (clubId, playerId, incapacityId) => {
    const response = await api.delete(
      `/api/pla_club_teams/${clubId}/players/${playerId}/incapacities/${incapacityId}`
    );
    return response.data;
  },
};

export default playerIncapacityService;
```

- [ ] **Step 2: Dialog** — `IncapacityFormDialog.jsx` con Radix `Dialog` de `@/components/ui/dialog` (el fix de Select/DatePicker dentro de Dialog ya es global):
  - Estado: `startDate` (default `defaultRange?.start ?? hoy`), `endDate` (default `defaultRange?.end ?? null`), `untilFurtherNotice` bool (checkbox individual, permitido fuera de listas), `description`, `file`.
  - Fechas con `SimpleDatePicker` (NUNCA `<Input type="date">`); ISO `yyyy-MM-dd` vía `dateUtils.js`.
  - Adjunto: `<input type="file" accept="image/jpeg,image/png,application/pdf">`; si es imagen → `await optimizeImage(file)` antes de armar el `FormData`; PDF tal cual. Mostrar `document_hint`.
  - Submit: `FormData` con `start_date`, `end_date` (omitir si `untilFurtherNotice`), `description`, `document` — `playerIncapacityService.create`. Toast éxito `created_ok`/`created_ok_desc`, error 422 → `overlap_error`, otro → `create_error`. `onSuccess?.()` + `onClose()`.
  - Validación cliente: description requerida, endDate >= startDate.
  - Todos los textos con `t('incapacities:...')`.
- [ ] **Step 3:** `npm run lint && npm run build` — Expected: OK.
- [ ] **Step 4: Commit**

```bash
git add src/services/playerIncapacityService.js src/components/players/IncapacityFormDialog.jsx
git commit -m "feat: servicio y formulario de incapacidad de jugador"
```

---

### Task 11: Rework del drawer de asistencia (foto, excused, layout móvil)

**Files:**
- Modify: `src/components/sessions/SessionAttendanceDrawer.jsx`
- Modify: `src/services/sessionService.js` (pasar `date` a `getSessionPlayers`)

**Interfaces:**
- Consumes: `PlayerPhotoLightbox` (Task 9), `IncapacityFormDialog` (Task 10), `active_incapacity` y `profile_photo_url` del backend (Task 4; `profile_photo_url` YA viene en `getSessionPlayers`), status `excused` (Task 1).
- Produces: drawer usable en Android/iOS en ambas orientaciones.

- [ ] **Step 1: Servicio** — `getSessionPlayers: async (clubId, sessionId, date = null)` con `params: date ? { date } : {}`. En el drawer llamarlo con `attendanceDate`.
- [ ] **Step 2: Estado excused** — en `loadPlayersAndAttendance`, default por jugador: `player.active_incapacity ? 'excused' : 'absent'`; registros existentes lo sobreescriben (el backend ya devuelve `excused` en `status`). `toggleAttendance`: si status actual es `'excused'` → pasa a `'present'` (override consciente del entrenador) → siguiente tap vuelve a `'excused'` si tiene `active_incapacity`, a `'absent'` si no. `markAllPresent`/`markAllAbsent`: saltar jugadores con `active_incapacity` (conservan `excused`).
- [ ] **Step 3: Stats** — agregar `excused` al cómputo:

```javascript
const stats = useMemo(() => {
  const values = Object.values(attendance);
  const excused = values.filter((v) => v === 'excused').length;
  return {
    total: players.length,
    present: values.filter((v) => v === 'present').length,
    late: values.filter((v) => v === 'late').length,
    excused,
    absent: values.filter((v) => v === 'absent').length,
  };
}, [attendance, players.length]);
const denominator = stats.total - stats.excused;
const attendancePercentage = denominator > 0
  ? Math.round(((stats.present + stats.late) / denominator) * 100)
  : 0;
```

  Ausentes del header NO incluyen excused. Si `stats.excused > 0`, chip junto a las stats: `t('incapacities:incapacitated_count', { count: stats.excused })` con estilo verde tenue (`bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300`).
- [ ] **Step 4: Fila de jugador** — reemplazar el círculo-checkbox por avatar con foto:

```jsx
<button
  type="button"
  onClick={(e) => { e.stopPropagation(); if (player.profile_photo_url) setLightboxPlayer(player); }}
  className="relative flex-shrink-0"
>
  {player.profile_photo_url ? (
    <img src={player.profile_photo_url} alt="" loading="lazy"
      className="w-10 h-10 rounded-full object-cover" />
  ) : (
    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
      {(player.name?.[0] ?? '') + (player.lastname?.[0] ?? '')}
    </div>
  )}
  <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${isPresent ? 'bg-green-500' : isLate ? 'bg-yellow-500' : isExcused ? 'bg-blue-500' : 'bg-gray-300'}`}>
    {isPresent && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
    {isLate && <Clock className="w-2.5 h-2.5 text-white" />}
  </span>
</button>
```

  - `const [lightboxPlayer, setLightboxPlayer] = useState(null);` + `<PlayerPhotoLightbox player={lightboxPlayer} onClose={() => setLightboxPlayer(null)} />` al final del SheetContent.
  - Nombre: cambiar `truncate` por `line-clamp-2 break-words` (contenedor ya tiene `flex-1 min-w-0`).
  - `isExcused = status === 'excused'`: fila `bg-blue-50 border-blue-200 opacity-75`, badge `t('incapacities:excused_label')` azul, y si `player.active_incapacity` badge extra `t('incapacities:active_badge')`.
  - Menú de acciones por fila: botón `⋯` (`MoreVertical` de lucide) con `DropdownMenu` **`modal={false}`** (regla Radix: DropdownMenu que abre Dialog) → item `t('incapacities:report_action')` que abre `IncapacityFormDialog` con `defaultRange={{start: attendanceDate ?? hoy, end: attendanceDate ?? hoy}}` y opción de cambiar a rango dentro del form; `onSuccess` → recargar `loadPlayersAndAttendance()`.
- [ ] **Step 5: Layout móvil** — en `SheetContent`: `className="w-full sm:max-w-lg flex flex-col p-0 h-[100dvh] max-h-[100dvh]"`. Footer: agregar `pb-[max(1rem,env(safe-area-inset-bottom))]`. Lista: `flex-1 min-h-0 overflow-y-auto p-3 overscroll-contain`. Header y zona de búsqueda: en alturas cortas (landscape móvil) compactar — envolver stats + botón cancelar con `[@media(max-height:520px)]:hidden`, y el bloque de fecha/hora/lugar con `[@media(max-height:520px)]:hidden`. Verificar que `sheet.jsx` no imponga `h-full` conflictivo; si lo hace, el `max-h-[100dvh]` gana igual — probar.
- [ ] **Step 6: Guardar** — `handleSave` ya manda `status` string: `excused` viaja sin cambios. Actualizar el toast de descripción para incluir excused count si > 0.
- [ ] **Step 7: Verificación manual** — `npm run dev` + DevTools device mode (Pixel, iPhone): portrait y landscape — scroll de lista OK, búsqueda filtra en ambas orientaciones, nombres largos en 2 líneas, foto abre lightbox, jugador con incapacidad sale pre-marcado excused. `npm run lint && npm run build` OK.
- [ ] **Step 8: Commit**

```bash
git add src/components/sessions/SessionAttendanceDrawer.jsx src/services/sessionService.js
git commit -m "feat: drawer de asistencia con foto, estado excused y layout móvil dvh"
```

---

### Task 12: Incapacidades en página de jugadores + panel + vista padre

**Files:**
- Modify: `src/pages/dashboard/Players/components/PlayersGrid.jsx` (acción en card)
- Modify: `src/components/players/PlayerSidePanel.jsx` (sección historial + alta)
- Modify: página de hijo del padre (buscar en `src/components/parent-child/` / `src/pages/dashboard` el perfil del hijo que ve el rol Parent y agregar la sección read-only)

**Interfaces:**
- Consumes: `IncapacityFormDialog`, `playerIncapacityService`, `PermissionGuard`.

- [ ] **Step 1: PlayersGrid** — en el menú/acciones de cada card (donde están editar/asignar cobro), agregar item `t('incapacities:report_action')` envuelto en `<PermissionGuard permission="attendance.create">`, abre `IncapacityFormDialog` con `defaultRange={null}` (modo rango libre). Si el jugador tiene incapacidad activa (agregar `active_incapacity` también al endpoint/listado de players SI ya viene; si no viene en ese endpoint, omitir badge en card — YAGNI, el badge vive en asistencia y panel).
- [ ] **Step 2: PlayerSidePanel** — nueva sección `t('incapacities:history_title')`: lista de `playerIncapacityService.list()` con fechas (`d/m/Y`), descripción, badge por status (ACT verde tenue, FIN gris), link `view_certificate` si `document_url`, botón `t('incapacities:discharge')` en las ACT con `AlertDialog` de confirmación (`discharge_confirm_title`/`_desc`) → `playerIncapacityService.discharge()` → toast `discharged_ok` + refetch. Estado vacío: `no_history`.
- [ ] **Step 3: Vista padre** — en el perfil del hijo (rol Parent), sección read-only con incapacidad activa (fechas + descripción, sin botones). Usa el mismo `playerIncapacityService.list()` (el backend autoriza acudientes en Task 3).
- [ ] **Step 4:** `npm run lint && npm run build` — OK. Verificación manual con owner (panel + crear/alta) y padre (`luzm@h.com` / club 7, solo lectura).
- [ ] **Step 5: Commit**

```bash
git add src/pages/dashboard/Players/components/PlayersGrid.jsx src/components/players/PlayerSidePanel.jsx
# + el archivo de vista padre tocado
git commit -m "feat: incapacidades en gestión de jugadores y vista de acudiente"
```

---

### Task 13: E2E Playwright (móvil + rotación)

**Files:**
- Create: `tests/e2e/attendance-incapacity.spec.js` (seguir estructura del skill `frontend-e2e-playwright`: page objects, sesiones `.auth`, perfil trainer `diego.sanchez@bogotafc.co`)

- [ ] **Step 1: Spec:**

```javascript
test.describe('Asistencia móvil + incapacidades', () => {
  test.use({ viewport: { width: 393, height: 851 } }); // portrait Android

  test('drawer usable en portrait y landscape', async ({ page }) => {
    // login trainer, ir a /home/attendance, abrir drawer de una sesión
    // 1. buscar jugador por nombre → lista filtra
    // 2. rotar: await page.setViewportSize({ width: 851, height: 393 })
    // 3. la búsqueda sigue filtrando y la lista scrollea:
    //    await expect(searchInput).toBeVisible();
    //    await list.evaluate(el => el.scrollTo(0, 200)); expect scrollTop > 0
    // 4. botón Guardar visible (footer no desbordado)
  });

  test('reportar incapacidad solo esta sesión', async ({ page }) => {
    // abrir menú ⋯ de un jugador → Reportar incapacidad
    // verificar fechas prellenadas = fecha de la sesión, escribir descripción, guardar
    // esperar toast de éxito, fila del jugador pasa a excused (badge) y
    // el contador de Ausentes NO lo incluye
  });
});
```

  (Rellenar selectores reales usando los page objects existentes; si no hay page object de asistencia, selectores por rol/texto i18n.)
- [ ] **Step 2:** `npm run test:e2e -- attendance-incapacity` — Expected: PASS (backend local corriendo con la rama de Task 0-7).
- [ ] **Step 3: Commit**

```bash
git add tests/e2e/attendance-incapacity.spec.js
git commit -m "test: e2e asistencia móvil e incapacidades"
```

---

### Task 14: Cierre

- [ ] **Step 1:** Backend: `php artisan test` completo verde. Frontend: `npm run lint`, `npm run build`, `npm run test:e2e` verdes.
- [ ] **Step 2:** Reportar a Miguel: ramas listas (`feature/player-incapacities`, `feature/attendance-mobile-incapacities`), SIN push. QA manual sugerido: Android real (Chrome) girando pantalla en el drawer; crear incapacidad desde chat IA; verificar push al padre. Preguntar si mergear/pushear.
