# Document Review v2 — Plan de Implementación

> ## 🟡 PARCIAL — código en el producto, plan nunca cerrado (estado al 13-ago-2026)
>
> **Revisa la vigencia de este plan antes de continuarlo.** Son 72 KB de tareas sin marcar
> y **sin spec de diseño que lo respalde**, pero parte del código ya existe y está cableado:
> `frontend/src/pages/dashboard/Documents/DocumentReviewPage.jsx` cuelga de la ruta
> `document-review` (`routes/dashboardRoutes.jsx:225`), con
> `components/documents/DocumentReviewModal.jsx` y
> `components/documents/review/{DocumentReviewQueue,DocumentReviewLegend,DocumentReviewPagination}.jsx`.
>
> ⚠️ No hay controlador ni servicio `DocumentReview*` en `saas_sport/app`: la parte de
> backend está sin identificar. **Los `- [ ]` no distinguen lo hecho de lo pendiente** —
> antes de ejecutar nada, contrasta tarea por tarea contra el código.


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir `/home/document-review` en una cola de revisión documento-a-documento (aprobar/rechazar con motivo, descarga, atajos de teclado, badge de calidad IA), arreglando de raíz los bugs que hoy dejan el preview en blanco y ocultan documentos.

**Architecture:** Backend Laravel agrega estado de rechazo + endpoint `reject` + notificación, y corrige `reviewDashboard` (calidad IA serializada, sin 350 llamadas a Spaces, sin descartar tipos huérfanos). La inscripción pública pasa a escribir `document_side`, el tipo configurado del club y la foto como documento. Frontend agrega una cola de revisión pantalla-completa sobre los datos del dashboard, y la vista actual queda como overview con tabs por acción (patrón `/home/collections`).

**Tech Stack:** Laravel 12 + PHPUnit (saas_sport) · React 18 + Vite + Radix/Tailwind + React Query (frontend) · i18n es/en/pt-BR.

## Global Constraints

- **Dos repos, dos ramas:** `saas_sport/` y `frontend/` son repos git separados. Crear en cada uno la rama `feature/document-review-v2` desde `main`. **NUNCA trabajar en `main`.**
- **NUNCA push.** Push a `main` de cualquiera de los dos repos = deploy a producción. Commits locales solamente; push solo cuando Miguel lo pida.
- **Commits saas_sport:** limpios, sin `🤖 Generated with Claude Code` ni `Co-Authored-By: Claude` (regla de `saas_sport/CLAUDE.md`, aplica igual en frontend).
- **i18n:** default INGLÉS en `defaultValue`, claves obligatorias en es/en/pt-BR. NO hardcodear español en JSX ni en strings de backend nuevos (usar `__()` con archivos lang es/en/pt_BR).
- **Estilo Widdo:** verde tenue = `bg-green-50 dark:bg-green-950/30` + `text-green-700 dark:text-green-300`. NO emerald. Botón primario verde `bg-green-600 hover:bg-green-700`.
- **Tests backend:** `docker compose exec saas_sport_app php artisan test --filter=<Test>`. Si hay otra suite corriendo en paralelo, usar `-e TEST_DB_DATABASE=db_testing_b`.
- **Lint frontend:** `npm run lint` con `--max-warnings 0`; no subir el límite.
- **NO resetear/dropear nada** (BD, tablas, contenedores). Migraciones solo aditivas.
- **DatePicker:** nunca `<Input type="date"/>`; usar `SimpleDatePicker`/`FormDatePicker` si hiciera falta.
- Servicios API frontend van en `src/services/`, nunca fetch directo en componentes. Logging con `SecureLogger`, no `console.log`.

---

## Contexto mínimo (léelo antes de cualquier task)

Bugs diagnosticados (2026-07-29):

1. `DocumentReviewModal.jsx:339-344` empareja caras por `document_side === 'front'/'back'`; la inscripción pública guarda ambas caras con `document_side = null` (la cara va en el `name`: "(frente)"/"(reverso)") → `sortedDocs` vacío → tarjeta sin preview ni botones.
2. `PlaPlayerDocument::getUrlAttribute()` (modelo, línea 176) pisa SIEMPRE cualquier URL firmada asignada al atributo `url`. Las 4 asignaciones del controlador son código muerto.
3. `PlayerDocumentController::reviewDashboard()` (línea 974-978) descarta documentos cuyo `document_type` no está en los requisitos configurados del club. Inscripción pública hardcodea `'cedula'`; un club US usa `id_card` → documentos invisibles.
4. El dashboard llama `getTemporaryUrl()` por documento y por foto (~350 requests a Spaces por página de 50 jugadores). El frontend ni usa esas URLs (descarga blobs por `/download?inline=1`).
5. `qualityCheck` se carga (`:912`) pero no se serializa; además la relación anidada no quita `ClubScope` → llega vacía si `current_club_id` difiere.
6. Policy `verify` solo permite `Propietario del Club` y `Super Admin`; el rol `Administrador` recibe 403.
7. No existe estado "rechazado" ni motivo; `is_verified` es booleano.
8. La foto de inscripción va a `users.profile_photo_path` y nunca se crea documento tipo `foto` → requisito "Fotografía" siempre "Sin subir".
9. `file_type` inconsistente: inscripción guarda MIME (`image/jpeg`), panel guarda extensión (`jpg`).

Archivos pivote:

- Backend: `app/Http/Controllers/PlayerDocumentController.php`, `app/Http/Controllers/PublicEnrollmentController.php` (subida docs: 890-1000), `app/Models/PlaPlayerDocument.php`, `app/Models/PlaClubDocumentRequirement.php`, `app/Policies/PlayerDocumentPolicy.php`, `routes/api.php:798-819`, `app/Models/PlaNotification.php` (campos de creación: ver `MyTournamentsController.php:182-198`).
- Frontend: `src/pages/dashboard/Documents/DocumentReviewPage.jsx`, `src/components/documents/DocumentReviewModal.jsx`, `src/services/documentApiService.js`, `src/hooks/documents/useDocumentReviewDashboard.js`, `src/hooks/documents/useClubDocumentRequirements.js`, `src/components/documents/manager/utils/documentHelpers.js` (`detectDocumentSide`, `isPdfFile`, `getMimeType`), `src/components/documents/DocumentQualityBadge.jsx`.

---

## FASE A — Backend (`saas_sport/`, rama `feature/document-review-v2`)

### Task 1: Estado de rechazo en el modelo

**Files:**
- Create: `database/migrations/2026_07_29_000001_add_rejection_to_player_documents.php`
- Modify: `app/Models/PlaPlayerDocument.php`
- Test: `tests/Feature/PlayerDocumentRejectionTest.php`

**Interfaces:**
- Produces: columnas `rejection_reason` (string 500 null), `rejected_by` (FK users null), `rejected_at` (timestamp null); accessor `review_status` → `'expired' | 'verified' | 'rejected' | 'pending'`, incluido en `$appends`.

- [ ] **Step 1: Revisar patrón de setup de tests existente**

Abrir un test de feature reciente (p. ej. `tests/Feature/PlanModulesAlignmentTest.php` o cualquiera en `tests/Feature/` que cree club+usuario) y copiar su patrón de creación de club, usuario y autenticación (factories vs. creates directos). Usar ese mismo patrón en los tests de este plan; si existe `PlaPlayerDocument` factory en `database/factories/`, usarla; si no, crear registros con `PlaPlayerDocument::create([...])` con los campos mínimos del fillable.

- [ ] **Step 2: Escribir test que falla**

```php
<?php

namespace Tests\Feature;

use App\Models\PlaPlayerDocument;
use Tests\TestCase;

class PlayerDocumentRejectionTest extends TestCase
{
    public function test_review_status_reflects_rejection_lifecycle(): void
    {
        // setup: usar el patrón del Step 1 para tener $club y $player válidos
        $doc = PlaPlayerDocument::withoutGlobalScopes()->create([
            'player_id' => $player->id,
            'club_id' => $club->id,
            'document_type' => 'cedula',
            'name' => 'Cédula (frente)',
            'file_path' => 'clubs/1/player-documents/x.jpg',
            'file_type' => 'jpg',
            'file_size' => 1000,
            'is_verified' => false,
        ]);

        $this->assertSame('pending', $doc->review_status);

        $doc->update(['rejection_reason' => 'Foto borrosa', 'rejected_by' => $user->id, 'rejected_at' => now()]);
        $this->assertSame('rejected', $doc->fresh()->review_status);

        $doc->update(['is_verified' => true, 'rejection_reason' => null, 'rejected_by' => null, 'rejected_at' => null]);
        $this->assertSame('verified', $doc->fresh()->review_status);

        $doc->update(['expiration_date' => now()->subDay()]);
        $this->assertSame('expired', $doc->fresh()->review_status);

        $this->assertArrayHasKey('review_status', $doc->fresh()->toArray());
    }
}
```

- [ ] **Step 3: Correr y ver que falla** — `php artisan test --filter=PlayerDocumentRejectionTest` → FAIL (columna inexistente).

- [ ] **Step 4: Migración**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pla_club_teams_player_documents', function (Blueprint $table) {
            $table->string('rejection_reason', 500)->nullable()->after('is_verified');
            $table->foreignId('rejected_by')->nullable()->after('rejection_reason')
                ->constrained('users')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable()->after('rejected_by');
        });
    }

    public function down(): void
    {
        Schema::table('pla_club_teams_player_documents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('rejected_by');
            $table->dropColumn(['rejection_reason', 'rejected_at']);
        });
    }
};
```

- [ ] **Step 5: Modelo** — en `PlaPlayerDocument`: agregar `'rejection_reason', 'rejected_by', 'rejected_at'` al `$fillable`; `'rejected_at' => 'datetime'` a `$casts`; `'review_status'` a `$appends`; y el accessor + relación:

```php
public function getReviewStatusAttribute(): string
{
    if ($this->isExpired()) {
        return 'expired';
    }
    if ($this->is_verified) {
        return 'verified';
    }
    if ($this->rejected_at) {
        return 'rejected';
    }
    return 'pending';
}

public function rejecter()
{
    return $this->belongsTo(User::class, 'rejected_by');
}
```

- [ ] **Step 6: Migrar y correr test** — `php artisan migrate` y `php artisan test --filter=PlayerDocumentRejectionTest` → PASS.
- [ ] **Step 7: Commit** — `git add -p` (NUNCA `git add -A`) → `feat: rejection state on player documents`

### Task 2: Endpoint reject + notificación + policy

**Files:**
- Modify: `app/Http/Controllers/PlayerDocumentController.php` (métodos `verify` :735, `batchVerify` :790; nuevo `reject`)
- Modify: `app/Policies/PlayerDocumentPolicy.php:231`
- Modify: `routes/api.php` (bloque 810-819)
- Create: `lang/en/documents.php`, `lang/es/documents.php`, `lang/pt_BR/documents.php` (si no existen; si existen, agregar claves)
- Test: `tests/Feature/PlayerDocumentRejectionTest.php` (ampliar)

**Interfaces:**
- Produces: `POST /api/pla_club_teams/{club}/player-documents/{id}/reject` body `{reason: string ≤500}` → 200 `{message, document}`. Aprobar (verify/batchVerify con `is_verified=true`) limpia los campos de rechazo. Notificación `type='document_rejected'` al `uploaded_by`.

- [ ] **Step 1: Tests que fallan** (agregar a la clase existente)

```php
public function test_reject_sets_state_and_notifies_uploader(): void
{
    // $owner autenticado con rol 'Propietario del Club' en $club; $doc pendiente con uploaded_by = $parentUser->id
    $response = $this->actingAs($owner)->postJson(
        "/api/pla_club_teams/{$club->id}/player-documents/{$doc->id}/reject",
        ['reason' => 'Blurry photo']
    );

    $response->assertOk();
    $fresh = $doc->fresh();
    $this->assertSame('rejected', $fresh->review_status);
    $this->assertSame('Blurry photo', $fresh->rejection_reason);
    $this->assertFalse((bool) $fresh->is_verified);
    $this->assertDatabaseHas('pla_notifications', [
        'user_id' => $parentUser->id,
        'type' => 'document_rejected',
    ]);
}

public function test_approve_clears_rejection(): void
{
    // $doc previamente rechazado
    $this->actingAs($owner)->postJson(
        "/api/pla_club_teams/{$club->id}/player-documents/{$doc->id}/verify",
        ['is_verified' => true]
    )->assertOk();

    $fresh = $doc->fresh();
    $this->assertSame('verified', $fresh->review_status);
    $this->assertNull($fresh->rejection_reason);
}

public function test_admin_role_can_verify(): void
{
    // usuario con rol 'Administrador' en el club
    $this->actingAs($admin)->postJson(
        "/api/pla_club_teams/{$club->id}/player-documents/{$doc->id}/verify",
        ['is_verified' => true]
    )->assertOk();
}

public function test_reject_requires_reason(): void
{
    $this->actingAs($owner)->postJson(
        "/api/pla_club_teams/{$club->id}/player-documents/{$doc->id}/reject",
        []
    )->assertStatus(422);
}
```

Nota tabla: confirmar el nombre real de la tabla de notificaciones con `(new \App\Models\PlaNotification)->getTable()` y usarlo en `assertDatabaseHas`.

- [ ] **Step 2: Correr → FAIL** (404 ruta).

- [ ] **Step 3: Policy** — `PlayerDocumentPolicy.php:231`:

```php
// Only owners and admins can verify documents
return $user->hasRole(['Propietario del Club', 'Administrador', 'Super Admin']);
```

- [ ] **Step 4: Ruta** — junto a `verify` en `routes/api.php` (~línea 815):

```php
Route::post('player-documents/{documentId}/reject', [PlayerDocumentController::class, 'reject']);
```

- [ ] **Step 5: Lang files** — claves nuevas (misma estructura en los 3 idiomas):

```php
// lang/en/documents.php
return [
    'rejected_title' => 'Document rejected',
    'rejected_message' => 'The document ":name" of :player was rejected: :reason',
];
// lang/es/documents.php → 'Documento rechazado' / 'El documento ":name" de :player fue rechazado: :reason'
// lang/pt_BR/documents.php → 'Documento rejeitado' / 'O documento ":name" de :player foi rejeitado: :reason'
```

- [ ] **Step 6: Controlador** — nuevo método `reject` (después de `verify`), y limpieza de rechazo en `verify`/`batchVerify`:

```php
public function reject(Request $request, PlaClubTeam $pla_club_team, $documentId)
{
    try {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $document = PlaPlayerDocument::where('id', $documentId)
            ->where('club_id', $pla_club_team->id)
            ->firstOrFail();

        $this->authorize('verify', $document);

        $document->update([
            'is_verified' => false,
            'verified_by' => null,
            'verified_at' => null,
            'rejection_reason' => $validated['reason'],
            'rejected_by' => $request->user()->id,
            'rejected_at' => now(),
        ]);

        if ($document->uploaded_by) {
            $document->load('player.user');
            $playerName = $document->player?->user
                ? trim($document->player->user->name.' '.$document->player->user->lastname)
                : '';
            PlaNotification::create([
                'user_id' => $document->uploaded_by,
                'club_id' => $document->club_id,
                'type' => 'document_rejected',
                'title' => __('documents.rejected_title'),
                'message' => __('documents.rejected_message', [
                    'name' => $document->name,
                    'player' => $playerName,
                    'reason' => $validated['reason'],
                ]),
                'data' => [
                    'document_id' => $document->id,
                    'player_id' => $document->player_id,
                    'document_type' => $document->document_type,
                ],
                'priority' => 'high',
                'related_id' => $document->id,
                'related_type' => PlaPlayerDocument::class,
            ]);
        }

        return response()->json([
            'message' => 'Documento rechazado',
            'document' => $document->fresh(),
        ]);
    } catch (ModelNotFoundException $e) {
        return response()->json(['message' => 'Documento no encontrado'], 404);
    }
}
```

En `verify` (:748) y `batchVerify` (:819), cuando `$isVerified === true` agregar al `update`: `'rejection_reason' => null, 'rejected_by' => null, 'rejected_at' => null`. Importar `PlaNotification` arriba del archivo.

- [ ] **Step 7: Correr tests → PASS.** `php artisan test --filter=PlayerDocumentRejectionTest`
- [ ] **Step 8: Pint + commit** — `./vendor/bin/pint app/Http/Controllers/PlayerDocumentController.php app/Policies/PlayerDocumentPolicy.php` → `feat: reject endpoint with reason and notification`

### Task 3: reviewDashboard v2 (calidad IA, sin Spaces, sin descartes, rechazo)

**Files:**
- Modify: `app/Http/Controllers/PlayerDocumentController.php` (`reviewDashboard` :894-1119; asignaciones muertas `$doc->url`/`$document->url` en :104, :236, :280, :346; `Log::info('DEBUG...')` en :96-100 y :454-458)
- Test: `tests/Feature/DocumentReviewDashboardTest.php`

**Interfaces:**
- Produces (por documento en `documents.{key}[]`): `{id, document_type, document_side, name, is_verified, review_status, rejection_reason, file_type, created_at, is_expired, quality}` — **sin `url`**. `quality = {status, requires_manual_review, summary, issues, checked_at} | null`.
- Produces (por requisito en `document_types[]`): agrega `accepted_formats`, `max_file_size_mb`. Clave sintética `_unmatched` ("otros documentos subidos") cuando existan documentos con tipo no configurado y sin alias.
- Filtro nuevo: `verification_status=rejected`. Summary agrega `pending_documents` y `rejected_documents` (conteo de documentos, no jugadores).

- [ ] **Step 1: Test que falla**

```php
<?php

namespace Tests\Feature;

use App\Models\PlaPlayerDocument;
use App\Models\PlaPlayerMediaCheck;
use Tests\TestCase;

class DocumentReviewDashboardTest extends TestCase
{
    public function test_dashboard_serializes_quality_rejection_and_keeps_unmatched_types(): void
    {
        // setup: $club con requisitos activos SOLO ['id_card' (has_sides), 'photo'] (simula club USA),
        // $player activo, $owner autenticado.
        $doc = PlaPlayerDocument::withoutGlobalScopes()->create([
            'player_id' => $player->id, 'club_id' => $club->id,
            'document_type' => 'cedula', // tipo huérfano: NO está configurado
            'name' => 'Cédula (frente)', 'file_path' => 'x/front.jpg',
            'file_type' => 'image/jpeg', 'file_size' => 1000, 'is_verified' => false,
            'rejection_reason' => 'Blurry', 'rejected_by' => $owner->id, 'rejected_at' => now(),
        ]);
        PlaPlayerMediaCheck::withoutGlobalScopes()->create([
            'club_id' => $club->id, 'document_id' => $doc->id,
            'kind' => PlaPlayerMediaCheck::KIND_DOCUMENT_FRONT,
            'status' => 'warning', 'requires_manual_review' => true,
            'summary' => 'Low sharpness',
            // completar campos obligatorios según la migración 2026_07_27_120000
        ]);

        $response = $this->actingAs($owner)
            ->getJson("/api/pla_club_teams/{$club->id}/player-documents/review-dashboard")
            ->assertOk();

        $playerRow = collect($response->json('data'))->firstWhere('id', $player->id);

        // El doc huérfano 'cedula' se mapea al requisito identidad 'id_card' (alias), no desaparece
        $docJson = $playerRow['documents']['id_card'][0];
        $this->assertSame('rejected', $docJson['review_status']);
        $this->assertSame('Blurry', $docJson['rejection_reason']);
        $this->assertSame('warning', $docJson['quality']['status']);
        $this->assertTrue($docJson['quality']['requires_manual_review']);
        $this->assertArrayNotHasKey('url', $docJson);

        $this->assertSame(1, $response->json('summary.rejected_documents'));
    }
}
```

- [ ] **Step 2: Correr → FAIL.**
- [ ] **Step 3: Implementar en `reviewDashboard`:**

(a) Relación quality sin scope (reemplaza `:908-913`):

```php
'documents' => function ($q) use ($clubId) {
    $q->withoutGlobalScope(ClubScope::class)
        ->where('club_id', $clubId)
        ->whereNotIn('document_type', ['otro', 'autorizacion_datos'])
        ->with(['qualityCheck' => fn ($qq) => $qq->withoutGlobalScope(ClubScope::class)]);
},
```

(b) Alias + bucket `_unmatched` (reemplaza el `continue` de :974-978):

```php
$identityAliases = ['cedula', 'id_card', 'documento_identidade', 'identificacion'];
$identityKey = collect($allTypes)->first(fn ($t) => in_array($t, $identityAliases));
$hasUnmatched = false;
```

y dentro del `foreach ($player->documents as $doc)`:

```php
$key = $doc->document_type;
if (! isset($docsByType[$key])) {
    if ($identityKey && in_array($key, $identityAliases)) {
        $key = $identityKey;
    } else {
        $key = '_unmatched';
        $hasUnmatched = true;
        $docsByType['_unmatched'] ??= [];
    }
}
```

(c) Serialización del documento (reemplaza :979-988) — quitar `'url' => getTemporaryUrl(...)`:

```php
$docsByType[$key][] = [
    'id' => $doc->id,
    'document_type' => $doc->document_type,
    'document_side' => $doc->document_side,
    'name' => $doc->name,
    'is_verified' => $doc->is_verified,
    'review_status' => $doc->review_status,
    'rejection_reason' => $doc->rejection_reason,
    'file_type' => $doc->file_type,
    'created_at' => $doc->created_at,
    'is_expired' => $doc->isExpired(),
    'quality' => $doc->qualityCheck ? [
        'status' => $doc->qualityCheck->status,
        'requires_manual_review' => (bool) $doc->qualityCheck->requires_manual_review,
        'summary' => $doc->qualityCheck->summary,
        'issues' => $doc->qualityCheck->issues,
        'checked_at' => $doc->qualityCheck->checked_at,
    ] : null,
];
```

(d) Contadores summary: acumular `$pendingDocuments` / `$rejectedDocuments` dentro del map (documentos con `review_status === 'pending'` / `'rejected'`) y añadirlos a `summary`. Filtro `verification_status === 'rejected'` → jugadores con ≥1 doc rechazado.

(e) `document_types`: en el map de `$clubRequirements` (:1067-1077) agregar `'accepted_formats' => $req->accepted_formats, 'max_file_size_mb' => $req->max_file_size_mb`; y si `$hasUnmatched`, hacer append de `['key' => '_unmatched', 'label' => 'other_uploaded', 'required' => false]` (el frontend traduce por clave).

(f) Limpieza: borrar las asignaciones muertas `$document->url = ...` / `$doc->url = ...` de `index`/`store`/`show`/`update` (:104, :236, :280, :346) y los bloques `Log::info('DEBUG ...')` de `index` (:96-100) y `download` (:454-458). La foto de perfil (`profile_photo_url`, :1019-1022) SE MANTIENE con URL firmada.

- [ ] **Step 4: Correr test nuevo + suite de documentos → PASS.** También `php artisan test --filter=PlayerDocument` para regresiones.
- [ ] **Step 5: Pint + commit** — `feat: review dashboard v2 (quality, rejection, no per-doc signed urls)`

### Task 4: Inscripción pública escribe metadata correcta

**Files:**
- Modify: `app/Models/PlaClubDocumentRequirement.php`
- Modify: `app/Http/Controllers/PublicEnrollmentController.php` (:890-972 y la zona donde se guarda `$photoPath`)
- Test: `tests/Feature/PublicEnrollmentDocumentMetadataTest.php`

**Interfaces:**
- Produces: `PlaClubDocumentRequirement::IDENTITY_KEYS`, `PlaClubDocumentRequirement::identityKeyForClub(int $clubId): string`, `PlaClubDocumentRequirement::photoKeyForClub(int $clubId): ?string`. Documentos de inscripción con `document_type` = clave configurada del club, `document_side` `'front'|'back'`, `file_type` = extensión, y fila de documento para la foto.

- [ ] **Step 1: Test que falla**

```php
public function test_enrollment_documents_use_club_configured_keys_and_sides(): void
{
    // setup: club con requisitos ['id_card' (has_sides=true), 'photo'], enlace de inscripción activo,
    // POST al endpoint público de enrollment con document_front, document_back y photo (UploadedFile::fake()->image(...)).
    // (Copiar el setup del test existente de enrollment si lo hay; si no, montar el request mínimo válido
    //  siguiendo las validaciones del método submit de PublicEnrollmentController.)

    $docs = PlaPlayerDocument::withoutGlobalScopes()->where('club_id', $club->id)->get();

    $front = $docs->firstWhere('document_side', 'front');
    $back = $docs->firstWhere('document_side', 'back');
    $this->assertNotNull($front);
    $this->assertNotNull($back);
    $this->assertSame('id_card', $front->document_type);   // clave del club, no 'cedula'
    $this->assertSame('jpg', $front->file_type);            // extensión, no MIME

    $photo = $docs->firstWhere('document_type', 'photo');   // la foto ahora es documento
    $this->assertNotNull($photo);
}
```

- [ ] **Step 2: Correr → FAIL.**
- [ ] **Step 3: Helpers en el modelo**

```php
public const IDENTITY_KEYS = ['cedula', 'id_card', 'documento_identidade', 'identificacion'];

public const PHOTO_KEYS = ['foto', 'photo'];

public static function identityKeyForClub(int $clubId): string
{
    $reqs = static::withoutGlobalScope(\App\Scopes\ClubScope::class)
        ->where('club_id', $clubId)->where('is_active', true)
        ->orderBy('sort_order')->get();

    $byAlias = $reqs->first(fn ($r) => in_array($r->document_key, self::IDENTITY_KEYS));
    if ($byAlias) {
        return $byAlias->document_key;
    }

    return $reqs->firstWhere('has_sides', true)?->document_key ?? 'cedula';
}

public static function photoKeyForClub(int $clubId): ?string
{
    return static::withoutGlobalScope(\App\Scopes\ClubScope::class)
        ->where('club_id', $clubId)->where('is_active', true)
        ->whereIn('document_key', self::PHOTO_KEYS)
        ->orderBy('sort_order')
        ->value('document_key');
}
```

- [ ] **Step 4: Controlador** — en el bloque :890-972:
  - Antes de guardar: `$identityKey = PlaClubDocumentRequirement::identityKeyForClub($club->id);`
  - En ambos `PlaPlayerDocument::create`: `'document_type' => $identityKey`, agregar `'document_side' => 'front'` / `'back'`, y `'file_type' => strtolower($extension)` en lugar del MIME (mantener el `name` con "(frente)"/"(reverso)" por compatibilidad).
  - Tras guardar la foto de perfil (donde queda `$photoPath`/`$photoDisk` definidos, antes del bloque de media checks :985): si `photoKeyForClub` devuelve clave, copiar el archivo al directorio de documentos y crear la fila:

```php
if ($photoPath && ($photoKey = PlaClubDocumentRequirement::photoKeyForClub($club->id))) {
    $photoExt = strtolower(pathinfo($photoPath, PATHINFO_EXTENSION) ?: 'jpg');
    $photoDocPath = $directory.'/'.sprintf('photo_player_%d_%s.%s', $playerRelation->id, now()->format('Ymd_His'), $photoExt);
    Storage::disk($disk)->put($photoDocPath, Storage::disk($photoDisk)->get($photoPath));

    PlaPlayerDocument::create([
        'player_id' => $playerRelation->id,
        'club_id' => $club->id,
        'document_type' => $photoKey,
        'name' => 'Player photo',
        'file_path' => $photoDocPath,
        'file_type' => $photoExt,
        'file_size' => Storage::disk($disk)->size($photoDocPath),
        'is_verified' => false,
        'uploaded_by' => $playerUser->id,
    ]);
}
```

  Importar `PlaClubDocumentRequirement` y `Storage` si falta.
- [ ] **Step 5: Correr tests → PASS** (incluida la suite existente de enrollment: `php artisan test --filter=Enrollment`).
- [ ] **Step 6: Pint + commit** — `fix: enrollment documents use club keys, sides and photo document`

### Task 5: Comando backfill de metadata (datos existentes en prod)

**Files:**
- Create: `app/Console/Commands/BackfillEnrollmentDocumentMetadata.php`
- Test: `tests/Feature/BackfillEnrollmentDocumentMetadataTest.php`

**Interfaces:**
- Produces: `php artisan documents:backfill-enrollment-metadata` (dry-run por defecto; `--apply` escribe). Corrige: `document_side` null con name "(frente)"/"(reverso)", y `file_type` MIME → extensión. NO toca `document_type` (el alias del dashboard lo resuelve en lectura).

- [ ] **Step 1: Test que falla**

```php
public function test_backfill_sets_sides_and_normalizes_file_type(): void
{
    $doc = PlaPlayerDocument::withoutGlobalScopes()->create([
        'player_id' => $player->id, 'club_id' => $club->id,
        'document_type' => 'cedula', 'name' => 'Tarjeta de Identidad (reverso)',
        'file_path' => 'x/back.jpg', 'file_type' => 'image/jpeg',
        'file_size' => 1000, 'is_verified' => false,
    ]);

    $this->artisan('documents:backfill-enrollment-metadata')->assertExitCode(0); // dry-run
    $this->assertNull($doc->fresh()->document_side); // dry-run no escribe

    $this->artisan('documents:backfill-enrollment-metadata', ['--apply' => true])->assertExitCode(0);
    $fresh = $doc->fresh();
    $this->assertSame('back', $fresh->document_side);
    $this->assertSame('jpg', $fresh->file_type);
}
```

- [ ] **Step 2: Correr → FAIL.**
- [ ] **Step 3: Comando**

```php
<?php

namespace App\Console\Commands;

use App\Models\PlaPlayerDocument;
use Illuminate\Console\Command;

class BackfillEnrollmentDocumentMetadata extends Command
{
    protected $signature = 'documents:backfill-enrollment-metadata {--apply : Write changes (default is dry-run)}';

    protected $description = 'Backfill document_side from name suffix and normalize MIME file_type to extension';

    private const MIME_TO_EXT = [
        'application/pdf' => 'pdf',
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    public function handle(): int
    {
        $apply = (bool) $this->option('apply');
        $sides = 0;
        $types = 0;

        PlaPlayerDocument::withoutGlobalScopes()
            ->whereNull('document_side')
            ->where(fn ($q) => $q->where('name', 'like', '%(frente)%')->orWhere('name', 'like', '%(reverso)%'))
            ->chunkById(200, function ($docs) use ($apply, &$sides) {
                foreach ($docs as $doc) {
                    $side = str_contains(mb_strtolower($doc->name), '(frente)') ? 'front' : 'back';
                    $sides++;
                    if ($apply) {
                        $doc->update(['document_side' => $side]);
                    }
                }
            });

        PlaPlayerDocument::withoutGlobalScopes()
            ->whereIn('file_type', array_keys(self::MIME_TO_EXT))
            ->chunkById(200, function ($docs) use ($apply, &$types) {
                foreach ($docs as $doc) {
                    $types++;
                    if ($apply) {
                        $doc->update(['file_type' => self::MIME_TO_EXT[$doc->file_type]]);
                    }
                }
            });

        $mode = $apply ? 'APPLIED' : 'DRY-RUN';
        $this->info("[{$mode}] sides fixed: {$sides}, file_types normalized: {$types}");

        return self::SUCCESS;
    }
}
```

- [ ] **Step 4: Correr → PASS.**
- [ ] **Step 5: Commit** — `feat: backfill command for enrollment document metadata`. **NO ejecutar en prod: lo corre Miguel tras el deploy.**

---

## FASE B — Frontend (`frontend/`, rama `feature/document-review-v2`)

### Task 6: Fix quirúrgico del modal actual

**Files:**
- Modify: `src/components/documents/DocumentReviewModal.jsx` (:225-258 y :339-344, :399-407)

**Interfaces:**
- Consumes: `detectDocumentSide(name, document_side)` e `isPdfFile(fileType)` de `@/components/documents/manager/utils/documentHelpers`.

- [ ] **Step 1: Emparejado tolerante** — reemplazar :339-344:

```jsx
const hasFrontBack = req.has_sides && docs.length >= 2;
const frontDoc = docs.find(
  (d) => detectDocumentSide(d.name, d.document_side) === 'frente'
);
const backDoc = docs.find(
  (d) => detectDocumentSide(d.name, d.document_side) === 'reverso'
);
const sortedDocs =
  hasFrontBack && frontDoc && backDoc ? [frontDoc, backDoc] : docs;
```

y en la etiqueta de cara (:404) usar `detectDocumentSide(doc.name, doc.document_side) === 'frente'`.

- [ ] **Step 2: PDF en iframe + estado de error** — en `renderDocPreview` reemplazar el bloque PDF (`window.open`) por `<iframe src={previewUrl} title={req.name} className="w-full h-[240px]" />` usando `isPdfFile(doc.file_type)`, y cuando `previewUrl` sea `null` tras cargar mostrar texto de error (`t('review.preview_failed', { defaultValue: 'Preview failed to load' })`) en vez de "Cargando preview...". Para distinguir, en `loadPreviews` guardar `newPreviews[doc.id] = null` en el catch (sin fallback a `doc.url`, que ya no existe).
- [ ] **Step 3: Verificar** — `npm run lint` (0 warnings) y prueba manual: jugador con frente+reverso de inscripción pública ahora muestra ambas imágenes.
- [ ] **Step 4: Commit** — `fix: document review modal side pairing and pdf preview`

### Task 7: Servicio reject + config de estados + hook de cola

**Files:**
- Modify: `src/services/documentApiService.js`
- Create: `src/helpers/documentStatusConfig.js`
- Create: `src/hooks/documents/useDocumentReviewQueue.js`

**Interfaces:**
- Produces: `rejectPlayerDocument(clubId, documentId, reason)`; `getDocStatus(docs)` → `'missing'|'pending'|'rejected'|'verified'|'expired'`; `getStatusConfig(t)` (mapa icono/color/label, incluye `rejected`); `buildReviewQueue(players, requirements)` → `[{id, player, requirement, docs}]` (solo docs con `review_status === 'pending'`).

- [ ] **Step 1: Servicio** (en `documentApiService.js`, junto a `verifyPlayerDocument`):

```js
export const rejectPlayerDocument = async (clubId, documentId, reason) => {
  validateClubId(clubId, 'rejectPlayerDocument');
  validateId(documentId, 'documentId', 'rejectPlayerDocument');
  return axiosInstance.post(
    `/api/pla_club_teams/${clubId}/player-documents/${documentId}/reject`,
    { reason }
  );
};
```

Verificar que `src/services/apiService.js` re-exporta este archivo (el modal importa de `@/services/apiService`); si el re-export es explícito, agregar `rejectPlayerDocument`.

- [ ] **Step 2: `documentStatusConfig.js`** — mover ahí `getDocStatus` y `getStatusConfig` de `DocumentReviewPage.jsx:40-73` agregando `rejected`:

```js
import { Circle, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export const getDocStatus = (docs) => {
  if (!docs || docs.length === 0) return 'missing';
  if (docs.some((d) => d.is_expired)) return 'expired';
  if (docs.some((d) => d.review_status === 'rejected')) return 'rejected';
  if (docs.every((d) => d.is_verified)) return 'verified';
  return 'pending';
};

export const getStatusConfig = (t) => ({
  missing: { icon: Circle, color: 'text-gray-400 dark:text-gray-500', bg: '', label: t('documents:status.missing') },
  pending: { icon: Clock, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20', label: t('documents:status.pending') },
  rejected: { icon: XCircle, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/20', label: t('documents:status.rejected', { defaultValue: 'Rejected' }) },
  verified: { icon: CheckCircle2, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/20', label: t('documents:status.verified') },
  expired: { icon: AlertCircle, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/20', label: t('documents:status.expired') },
});
```

- [ ] **Step 3: `useDocumentReviewQueue.js`**

```js
import { useMemo, useState, useCallback } from 'react';

export const buildReviewQueue = (players, requirements) => {
  const items = [];
  (players || []).forEach((player) => {
    (requirements || []).forEach((req) => {
      const key = req.document_key || req.id;
      const docs = player.documents?.[key] || [];
      const pending = docs.filter((d) => d.review_status === 'pending');
      if (pending.length > 0) {
        items.push({ id: `${player.id}-${key}`, player, requirement: req, docs: pending });
      }
    });
    const unmatched = (player.documents?._unmatched || []).filter(
      (d) => d.review_status === 'pending'
    );
    if (unmatched.length > 0) {
      items.push({
        id: `${player.id}-_unmatched`,
        player,
        requirement: { document_key: '_unmatched', name: null, is_required: false },
        docs: unmatched,
      });
    }
  });
  return items;
};

const useDocumentReviewQueue = (players, requirements) => {
  const initialQueue = useMemo(
    () => buildReviewQueue(players, requirements),
    [players, requirements]
  );
  const [resolvedIds, setResolvedIds] = useState(() => new Set());
  const [index, setIndex] = useState(0);

  const queue = useMemo(
    () => initialQueue.filter((item) => !resolvedIds.has(item.id)),
    [initialQueue, resolvedIds]
  );

  const current = queue[Math.min(index, queue.length - 1)] || null;

  const resolveCurrent = useCallback(() => {
    if (!current) return;
    setResolvedIds((prev) => new Set(prev).add(current.id));
    // el índice apunta ya al siguiente porque el actual sale de la lista
    setIndex((i) => Math.min(i, Math.max(queue.length - 2, 0)));
  }, [current, queue.length]);

  const skip = useCallback(
    () => setIndex((i) => (queue.length ? (i + 1) % queue.length : 0)),
    [queue.length]
  );
  const back = useCallback(
    () => setIndex((i) => (queue.length ? (i - 1 + queue.length) % queue.length : 0)),
    [queue.length]
  );
  const jumpTo = useCallback(
    (itemId) => {
      const idx = queue.findIndex((q) => q.id === itemId);
      if (idx >= 0) setIndex(idx);
    },
    [queue]
  );

  return {
    queue,
    current,
    position: queue.length ? queue.findIndex((q) => q.id === current?.id) + 1 : 0,
    total: initialQueue.length,
    resolvedCount: resolvedIds.size,
    resolveCurrent,
    skip,
    back,
    jumpTo,
  };
};

export default useDocumentReviewQueue;
```

- [ ] **Step 4: Lint + commit** — `feat: reject service, status config and review queue hook`

### Task 8: Visor de documento + diálogo de rechazo

**Files:**
- Create: `src/components/documents/review/DocumentBlobViewer.jsx`
- Create: `src/components/documents/review/RejectDocumentDialog.jsx`

**Interfaces:**
- Produces: `<DocumentBlobViewer clubId doc sideLabel />` (carga blob vía `previewPlayerDocument`, cachea por `doc.id`, imagen o iframe PDF, estados loading/error); `<RejectDocumentDialog open onOpenChange onConfirm={(reason) => …} isPending />` con motivos preset + texto libre.

- [ ] **Step 1: `DocumentBlobViewer.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { previewPlayerDocument } from '@/services/apiService';
import { isPdfFile } from '@/components/documents/manager/utils/documentHelpers';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const blobCache = new Map(); // docId -> objectURL (module-level: sobrevive re-mounts de la cola)

const DocumentBlobViewer = ({ clubId, doc, sideLabel }) => {
  const { t } = useTranslation('documents');
  const [url, setUrl] = useState(blobCache.get(doc.id) || null);
  const [status, setStatus] = useState(blobCache.has(doc.id) ? 'ready' : 'loading');

  useEffect(() => {
    let cancelled = false;
    if (blobCache.has(doc.id)) {
      setUrl(blobCache.get(doc.id));
      setStatus('ready');
      return undefined;
    }
    setStatus('loading');
    previewPlayerDocument(clubId, doc.id)
      .then((response) => {
        if (cancelled) return;
        const objectUrl = URL.createObjectURL(response.data);
        blobCache.set(doc.id, objectUrl);
        setUrl(objectUrl);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [clubId, doc.id]);

  return (
    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
      {sideLabel && (
        <p className="text-xs font-medium text-muted-foreground">{sideLabel}</p>
      )}
      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden min-h-[300px] max-h-[60vh]">
        {status === 'loading' && <LoadingSpinner variant="inline" size="md" />}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-2 text-muted-foreground p-6">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <p className="text-sm">
              {t('review.preview_failed', { defaultValue: 'Preview failed to load' })}
            </p>
          </div>
        )}
        {status === 'ready' &&
          (isPdfFile(doc.file_type) ? (
            <iframe src={url} title={doc.name || 'document'} className="w-full h-[60vh]" />
          ) : (
            <img src={url} alt={doc.name || 'document'} className="max-h-[60vh] w-auto object-contain" />
          ))}
      </div>
    </div>
  );
};

export default DocumentBlobViewer;
```

- [ ] **Step 2: `RejectDocumentDialog.jsx`** — motivos preset (claves i18n) + textarea; `onConfirm(reasonText)`:

```jsx
import { useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PRESET_KEYS = ['blurry', 'incomplete', 'wrong_document', 'expired_document', 'unreadable'];

const RejectDocumentDialog = ({ open, onOpenChange, onConfirm, isPending }) => {
  const { t } = useTranslation('documents');
  const [preset, setPreset] = useState(null);
  const [custom, setCustom] = useState('');

  const reason = custom.trim() || (preset ? t(`review.reject_reasons.${preset}`) : '');

  const handleConfirm = () => {
    if (!reason) return;
    onConfirm(reason);
    setPreset(null);
    setCustom('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('review.reject_title', { defaultValue: 'Reject document' })}</DialogTitle>
          <DialogDescription>
            {t('review.reject_description', {
              defaultValue: 'The family will be notified with this reason so they can re-upload.',
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          {PRESET_KEYS.map((key) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={preset === key ? 'default' : 'outline'}
              className={preset === key ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
              onClick={() => setPreset((p) => (p === key ? null : key))}
            >
              {t(`review.reject_reasons.${key}`)}
            </Button>
          ))}
        </div>
        <Textarea
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          maxLength={500}
          placeholder={t('review.reject_custom_placeholder', {
            defaultValue: 'Or write a custom reason…',
          })}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common:cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={!reason || isPending}
            onClick={handleConfirm}
          >
            <XCircle className="h-4 w-4 mr-1" />
            {t('review.actions.reject', { defaultValue: 'Reject' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectDocumentDialog;
```

(Si no existe `components/ui/textarea`, usar el input multiline que ya use el repo — buscar `Textarea` con grep antes de crear nada.)

- [ ] **Step 3: Lint + commit** — `feat: document blob viewer and reject dialog`

### Task 9: Cola de revisión (pantalla completa)

**Files:**
- Create: `src/components/documents/review/DocumentReviewQueue.jsx`

**Interfaces:**
- Consumes: `useDocumentReviewQueue`, `DocumentBlobViewer`, `RejectDocumentDialog`, `batchVerifyPlayerDocuments`, `rejectPlayerDocument`, `downloadPlayerDocument`, `detectDocumentSide`, `DocumentQualityBadge`.
- Produces: `<DocumentReviewQueue open onOpenChange clubId players requirements initialItemId />`. Atajos: `A` aprobar, `R` rechazar, `→` saltar, `←` anterior. Al cerrar invalida `documentReviewDashboard`.

- [ ] **Step 1: Componente** — Dialog `max-w-6xl h-[92vh]`; layout `grid grid-cols-1 lg:grid-cols-[2fr_1fr]`. Puntos clave (esqueleto completo):

```jsx
import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  batchVerifyPlayerDocuments, rejectPlayerDocument, downloadPlayerDocument,
} from '@/services/apiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { ShieldCheck, XCircle, Download, ChevronLeft, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useDocumentReviewQueue from '@/hooks/documents/useDocumentReviewQueue';
import { detectDocumentSide } from '@/components/documents/manager/utils/documentHelpers';
import DocumentBlobViewer from './DocumentBlobViewer';
import RejectDocumentDialog from './RejectDocumentDialog';

const DocumentReviewQueue = ({ open, onOpenChange, clubId, players, requirements, initialItemId }) => {
  const { t } = useTranslation('documents');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectOpen, setRejectOpen] = useState(false);
  const { queue, current, position, total, resolvedCount, resolveCurrent, skip, back, jumpTo } =
    useDocumentReviewQueue(players, requirements);

  useEffect(() => {
    if (open && initialItemId) jumpTo(initialItemId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al abrir
  }, [open, initialItemId]);

  const approveMutation = useMutation({
    mutationFn: () =>
      batchVerifyPlayerDocuments(clubId, current.docs.map((d) => d.id), true),
    onSuccess: () => {
      toast({ title: t('review.document_approved'), className: 'bg-green-300', duration: 1500 });
      resolveCurrent();
    },
    onError: (error) => {
      toast({
        title: t('common:error', { defaultValue: 'Error' }),
        description: error.response?.data?.message,
        className: 'bg-red-300',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (reason) => {
      for (const doc of current.docs) {
        await rejectPlayerDocument(clubId, doc.id, reason);
      }
    },
    onSuccess: () => {
      toast({ title: t('review.document_rejected', { defaultValue: 'Document rejected' }), className: 'bg-red-300', duration: 1500 });
      setRejectOpen(false);
      resolveCurrent();
    },
  });

  const handleClose = useCallback(
    (isOpen) => {
      if (!isOpen) {
        queryClient.invalidateQueries({ queryKey: ['documentReviewDashboard'] });
      }
      onOpenChange(isOpen);
    },
    [onOpenChange, queryClient]
  );

  // Atajos de teclado
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (rejectOpen || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (e.key === 'a' || e.key === 'A') current && approveMutation.mutate();
      if (e.key === 'r' || e.key === 'R') current && setRejectOpen(true);
      if (e.key === 'ArrowRight') skip();
      if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, rejectOpen, current, approveMutation, skip, back]);

  const handleDownload = async (docId) => {
    const response = await downloadPlayerDocument(clubId, docId);
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    const disposition = response.headers['content-disposition'];
    a.download = disposition ? disposition.split('filename=')[1]?.replace(/"/g, '') : 'document';
    a.click();
    URL.revokeObjectURL(url);
  };

  const quality = current?.docs.find((d) => d.quality)?.quality || null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[92vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle>
              {t('review.queue_title', { defaultValue: 'Pending review' })}
            </DialogTitle>
            <div className="flex items-center gap-3 mr-6">
              <Progress value={total ? (resolvedCount / total) * 100 : 0} className="h-2 w-32 [&>div]:bg-green-500" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {t('review.queue_position', { defaultValue: '{{position}} of {{count}}', position, count: queue.length })}
              </span>
            </div>
          </div>
        </DialogHeader>

        {!current ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-lg font-medium">
              {t('review.queue_done', { defaultValue: 'All caught up! No documents pending review.' })}
            </p>
            <Button variant="outline" onClick={() => handleClose(false)}>
              {t('common:close', { defaultValue: 'Close' })}
            </Button>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 overflow-y-auto">
            {/* Visor */}
            <div className="flex gap-3 items-start">
              {current.docs.map((doc) => (
                <DocumentBlobViewer
                  key={doc.id}
                  clubId={clubId}
                  doc={doc}
                  sideLabel={
                    current.requirement.has_sides
                      ? detectDocumentSide(doc.name, doc.document_side) === 'reverso'
                        ? t('review.back', { defaultValue: 'Back' })
                        : t('review.front', { defaultValue: 'Front' })
                      : null
                  }
                />
              ))}
            </div>

            {/* Panel de decisión */}
            <div className="flex flex-col gap-4 border-l pl-4">
              <div className="flex items-center gap-3">
                {current.player.user?.profile_photo_url ? (
                  <img src={current.player.user.profile_photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {current.player.user?.name?.[0]}{current.player.user?.lastname?.[0]}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {current.player.user?.name} {current.player.user?.lastname}
                  </p>
                  {current.player.category && (
                    <span className="text-[11px] text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 px-1.5 py-0.5 rounded">
                      {current.player.category.name}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold">
                  {current.requirement.name ||
                    t('review.other_uploaded', { defaultValue: 'Other uploaded documents' })}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {current.docs[0]?.created_at &&
                    new Date(current.docs[0].created_at).toLocaleDateString()}
                  {' · '}
                  {(current.docs[0]?.file_type || '').toUpperCase()}
                </p>
              </div>

              {/* Calidad IA */}
              {quality && (
                <div
                  className={`rounded-lg border p-3 text-sm ${
                    quality.status === 'ok' && !quality.requires_manual_review
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30'
                      : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30'
                  }`}
                >
                  <p className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="h-4 w-4" />
                    {quality.status === 'ok' && !quality.requires_manual_review
                      ? t('review.ai_looks_good', { defaultValue: 'AI check: looks good' })
                      : t('review.ai_needs_review', { defaultValue: 'AI check: needs your review' })}
                  </p>
                  {quality.summary && (
                    <p className="text-xs text-muted-foreground mt-1">{quality.summary}</p>
                  )}
                </div>
              )}

              {/* Acciones */}
              <div className="flex flex-col gap-2 mt-auto">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  {t('review.actions.approve', { defaultValue: 'Approve' })}
                  <kbd className="ml-auto text-[10px] opacity-70">A</kbd>
                </Button>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={() => setRejectOpen(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {t('review.actions.reject', { defaultValue: 'Reject' })}
                  <kbd className="ml-auto text-[10px] opacity-70">R</kbd>
                </Button>
                <div className="flex gap-2">
                  {current.docs.map((doc) => (
                    <Button key={doc.id} variant="ghost" size="sm" onClick={() => handleDownload(doc.id)}>
                      <Download className="h-3.5 w-3.5 mr-1" />
                      {t('review.actions.download', { defaultValue: 'Download' })}
                    </Button>
                  ))}
                </div>
                <div className="flex justify-between">
                  <Button variant="ghost" size="sm" onClick={back}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('review.actions.previous', { defaultValue: 'Previous' })}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={skip}>
                    {t('review.actions.skip', { defaultValue: 'Skip' })}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <RejectDocumentDialog
          open={rejectOpen}
          onOpenChange={setRejectOpen}
          onConfirm={(reason) => rejectMutation.mutate(reason)}
          isPending={rejectMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DocumentReviewQueue;
```

- [ ] **Step 2: Lint + prueba manual** — abrir la cola con datos reales del club de prueba (Owner `director@bogotafc.co`), aprobar con `A`, rechazar con `R`, verificar auto-avance y que cerrar refresca el overview.
- [ ] **Step 3: Commit** — `feat: document review queue with keyboard shortcuts`

### Task 10: Integración en la página + tabs por acción + fin del fallback colombiano

**Files:**
- Modify: `src/pages/dashboard/Documents/DocumentReviewPage.jsx`
- Modify: `src/hooks/documents/useClubDocumentRequirements.js` (:53-71)
- Modify: `src/components/documents/DocumentReviewModal.jsx` (usar `getDocStatus` compartido si aplica)

**Interfaces:**
- Consumes: `DocumentReviewQueue`, `getDocStatus`/`getStatusConfig` de `@/helpers/documentStatusConfig`, `buildReviewQueue`.

- [ ] **Step 1: CTA principal** — en `headerActions` de la página, botón primario verde con contador (documentos pendientes de la página cargada):

```jsx
const pendingCount = useMemo(
  () => buildReviewQueue(players, uploadableReqs).length,
  [players, uploadableReqs]
);
// headerActions:
<Button
  className="bg-green-600 hover:bg-green-700 text-white"
  size="sm"
  disabled={pendingCount === 0}
  onClick={() => setQueueOpen(true)}
>
  <ShieldCheck className="h-4 w-4 mr-1" />
  {t('review.review_pending_cta', { defaultValue: 'Review pending ({{count}})', count: pendingCount })}
</Button>
```

- [ ] **Step 2: Tabs por acción** (patrón collections) — reemplazar el `<Select>` de `verification_status` por `Tabs` (`components/ui/tabs`) encima de la lista: `all / pending / rejected / verified / no_documents`, mapeando al filtro existente (backend ya soporta `rejected` desde Task 3). Mantener búsqueda y categoría como están.
- [ ] **Step 3: Estado rejected en overview** — importar `getDocStatus`/`getStatusConfig` desde `@/helpers/documentStatusConfig` (borrar las copias locales :40-73). En la fila del checklist, si el status es `rejected`, mostrar el motivo (`docs.find(d => d.rejection_reason)?.rejection_reason`) como texto secundario truncado.
- [ ] **Step 4: Click ancla a la cola** — en la fila del checklist (`onClick` :435), en vez de abrir el modal, si el status es `pending` abrir la cola anclada: `setQueueInitialItem(`${player.id}-${key}`); setQueueOpen(true)`. Para estados no pendientes, conservar el modal por-jugador actual (botón "Revisar documentos" sigue abriendo el modal).
- [ ] **Step 5: Accordion** — cambiar `type="multiple"` (:335) por `type="single" collapsible` (una fila expandida a la vez, como collections).
- [ ] **Step 6: Quitar fallback hardcodeado** — en `useClubDocumentRequirements.js` :53-71, devolver `[]` cuando la API venga vacía (borrar el mapeo de `getUploadableRequirements()` y su import). En la página, si `activeRequirements.length === 0 && !isLoading`, mostrar empty state con CTA a `/home/document-settings`:

```jsx
<div className="text-center py-12 border rounded-lg space-y-3">
  <p className="text-muted-foreground">
    {t('review.no_requirements', { defaultValue: 'This club has no document requirements configured yet.' })}
  </p>
  <Button asChild variant="outline">
    <Link to="/home/document-settings">
      {t('review.configure_requirements', { defaultValue: 'Configure requirements' })}
    </Link>
  </Button>
</div>
```

Verificar con grep qué otros consumidores dependen del fallback (`PlayerDocumentUploadDialog`, manager, etc.) y confirmar que toleran lista vacía sin crashear (render vacío es aceptable en este cambio; los clubes reales tienen config copiada por país al crearse).
- [ ] **Step 7: Lint + prueba manual + commit** — `feat: review page tabs, queue CTA and requirement-driven types`

### Task 11: Rechazo visible para familias + resubida

**Files:**
- Modify: `src/components/documents/manager/components/DocumentSingle.jsx` (badge calidad ya está en :116-118)
- Modify: `src/components/documents/manager/components/DocumentPreviewModal.jsx` (si muestra estado)

**Interfaces:**
- Consumes: `review_status` y `rejection_reason` (ya vienen en `GET .../player-documents` porque el modelo los agrega vía `$appends`/atributos).

- [ ] **Step 1: Badge rechazado** — en `DocumentSingle.jsx`, donde se pinta el estado del documento, agregar el caso `review_status === 'rejected'`: badge rojo (`bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300`) con icono `XCircle` y el texto `t('documents:status.rejected')`; debajo, el `rejection_reason` en `text-xs text-red-600 dark:text-red-400`. Leer el componente antes de editar para ubicar el bloque de badges existente.
- [ ] **Step 2: Resubida** — verificar que el flujo actual de subida (`DocumentRequirementUploadModal` + `useDocumentUpload`) permite resubir sobre un documento rechazado (el `store()` del backend reemplaza por tipo+lado). Al resubir, el documento nuevo nace `pending` sin campos de rechazo — confirmar manualmente con el rol Padre (`luzm@h.com`).
- [ ] **Step 3: Lint + commit** — `feat: rejected state visible to families`

### Task 12: i18n es/en/pt-BR

**Files:**
- Modify: los tres `documents.json` (ubicar con `ls src/i18n` — es/en/pt-BR) y `common.json` si falta `close`/`cancel`.

- [ ] **Step 1: Claves nuevas** (mismo árbol en los 3 idiomas; valores en el idioma correspondiente):

```json
{
  "status": { "rejected": "Rejected" },
  "review": {
    "queue_title": "Pending review",
    "queue_position": "{{position}} of {{count}}",
    "queue_done": "All caught up! No documents pending review.",
    "review_pending_cta": "Review pending ({{count}})",
    "preview_failed": "Preview failed to load",
    "document_rejected": "Document rejected",
    "other_uploaded": "Other uploaded documents",
    "no_requirements": "This club has no document requirements configured yet.",
    "configure_requirements": "Configure requirements",
    "ai_looks_good": "AI check: looks good",
    "ai_needs_review": "AI check: needs your review",
    "reject_title": "Reject document",
    "reject_description": "The family will be notified with this reason so they can re-upload.",
    "reject_custom_placeholder": "Or write a custom reason…",
    "reject_reasons": {
      "blurry": "Photo is blurry",
      "incomplete": "Document is incomplete",
      "wrong_document": "Wrong document",
      "expired_document": "Document is expired",
      "unreadable": "Not readable"
    },
    "actions": {
      "reject": "Reject",
      "download": "Download",
      "previous": "Previous",
      "skip": "Skip"
    }
  }
}
```

- [ ] **Step 2: Verificar paridad** — si existe script/test de paridad de claves i18n en el repo, correrlo; si no, comparar con `jq` que las tres versiones tengan las mismas claves nuevas.
- [ ] **Step 3: Commit** — `feat: i18n keys for document review v2`

---

## FASE C — Agente IA + verificación final

### Task 13: Tools de documentos en el chat IA

**Files:**
- Modify: `app/Services/Assistant/ToolDefinitions.php` (definiciones ~línea 810, listas de rol :48-75, routing)
- Modify: `app/Services/Assistant/Tools/AdvancedTools.php` (`getToolMap()` :22-31 + handlers)
- Modify: `app/Services/Assistant/SystemPromptBuilder.php` (~línea 567, hints de routing)
- Test: `tests/Feature/AssistantDocumentReviewToolsTest.php`

**Interfaces:**
- Produces (read) `getDocumentReviewStatus`: sin parámetros → `{pending_documents, rejected_documents, players_missing_required, by_player: [{player_id, name, missing:[], pending:[], rejected:[{document, reason}]}]}` (top 20 por jugador, indicando si hay más).
- Produces (write) `remindMissingDocuments`: `{player_ids?: int[], confirmed: bool}` → crea `PlaNotification` tipo `documents_missing` a cada familia con documentos faltantes o rechazados. Patrón confirm-first: `confirmed=false` devuelve preview sin escribir.
- Ambas tools SOLO para `super_admin/owner/admin` (el `match` devuelve `null` = todas). NO agregar a `player`/`parent`/`accountant`/`trainer`.

- [ ] **Step 1: Leer patrones antes de escribir** — abrir `tests/Feature/AssistantCheckInToolsTest.php` (setup de club/usuario + invocación de tool) y un handler write con `confirmed` en `AdvancedTools.php` (`editClubSettings`, :107+) para copiar el patrón exacto de confirm-first y el shape de retorno `['success' => bool, 'data' => [...], 'message' => string]`.

- [ ] **Step 2: Tests que fallan**

```php
<?php

namespace Tests\Feature;

use App\Models\PlaPlayerDocument;
use App\Services\Assistant\Tools\AdvancedTools;
use App\Services\Assistant\ToolDefinitions;
use Tests\TestCase;

class AssistantDocumentReviewToolsTest extends TestCase
{
    public function test_get_document_review_status_reports_pending_and_rejected(): void
    {
        // setup (patrón del Step 1): $club con requisitos activos, $player ACT,
        // un documento pendiente y otro rechazado con motivo.
        $tools = app(AdvancedTools::class);
        $result = $tools->execute('getDocumentReviewStatus', [], $club->id, $owner->id);

        $this->assertTrue($result['success']);
        $this->assertSame(1, $result['data']['pending_documents']);
        $this->assertSame(1, $result['data']['rejected_documents']);
        $this->assertNotEmpty($result['data']['by_player']);
    }

    public function test_remind_missing_documents_requires_confirmation(): void
    {
        $tools = app(AdvancedTools::class);

        $preview = $tools->execute('remindMissingDocuments', ['confirmed' => false], $club->id, $owner->id);
        $this->assertTrue($preview['success']);
        $this->assertDatabaseCount((new \App\Models\PlaNotification)->getTable(), 0);

        $applied = $tools->execute('remindMissingDocuments', ['confirmed' => true], $club->id, $owner->id);
        $this->assertTrue($applied['success']);
        $this->assertDatabaseHas((new \App\Models\PlaNotification)->getTable(), [
            'type' => 'documents_missing',
        ]);
    }

    public function test_parents_and_players_never_get_document_review_tools(): void
    {
        foreach (['player', 'parent', 'accountant', 'trainer'] as $role) {
            $allowed = ToolDefinitions::allowedNamesForRole($role);
            $this->assertIsArray($allowed, "Role {$role} must have an explicit allow-list");
            $this->assertNotContains('getDocumentReviewStatus', $allowed);
            $this->assertNotContains('remindMissingDocuments', $allowed);
        }
    }
}
```

Nota: confirmar con grep el nombre real del método público de invocación en `BaseToolHandler` (`execute`, `handle`, o similar) y usarlo; el test debe llamar al mismo método que usa el runtime del asistente.

- [ ] **Step 3: Correr → FAIL.**

- [ ] **Step 4: Definiciones** — en `ToolDefinitions::get()`, junto a `getDocumentRequirements` (~:810):

```php
[
    'name' => 'getDocumentReviewStatus',
    'description' => 'Gets the document review queue status: how many documents are pending approval, how many were rejected and why, and which players are missing required documents. '
        .'Use when the user asks "who is missing documents", "what is pending review", "which documents were rejected". '
        .'This reflects the club\'s CONFIGURED document requirements, not a fixed list.',
    'input_schema' => [
        'type' => 'object',
        'properties' => (object) [],
    ],
],
[
    'name' => 'remindMissingDocuments',
    'description' => 'Notifies families whose players are missing required documents or had a document rejected, so they upload again. '
        .'ALWAYS call with confirmed=false first to preview how many families would be notified, show that to the user, and only call with confirmed=true after they agree.',
    'input_schema' => [
        'type' => 'object',
        'properties' => [
            'player_ids' => ['type' => 'array', 'items' => ['type' => 'integer'], 'description' => 'Optional: only notify these players. Omit to notify everyone with missing or rejected documents.'],
            'confirmed' => ['type' => 'boolean', 'description' => 'false = preview only, true = actually send the notifications.'],
        ],
        'required' => ['confirmed'],
    ],
],
```

No tocar `allowedNamesForRole`: owner/admin/super_admin ya reciben `null` (todas). Los demás roles tienen allow-list explícita y por tanto quedan excluidos automáticamente — eso es lo que verifica el tercer test.

- [ ] **Step 5: Handlers** — en `AdvancedTools::getToolMap()` agregar `'getDocumentReviewStatus' => 'getDocumentReviewStatus'` y `'remindMissingDocuments' => 'remindMissingDocuments'`, e implementar reutilizando lo de Task 3 (mismos alias de identidad y misma noción de `review_status`):

```php
protected function getDocumentReviewStatus(array $input, ?int $clubId, ?int $userId = null): array
{
    $requirements = \App\Models\PlaClubDocumentRequirement::withoutGlobalScope(\App\Scopes\ClubScope::class)
        ->where('club_id', $clubId)->where('is_active', true)->orderBy('sort_order')->get();

    $requiredKeys = $requirements->where('is_required', true)->pluck('document_key');
    $labels = $requirements->pluck('name', 'document_key');

    $players = PlaClubTeamPlayer::withoutGlobalScopes()
        ->where('club_id', $clubId)->whereNull('deleted_at')->where('status', 'ACT')
        ->with(['user:id,name,lastname', 'documents' => fn ($q) => $q
            ->withoutGlobalScope(\App\Scopes\ClubScope::class)->where('club_id', $clubId)])
        ->get();

    $pending = 0;
    $rejected = 0;
    $byPlayer = [];

    foreach ($players as $player) {
        $ownKeys = $player->documents->pluck('document_type');
        $missing = $requiredKeys->reject(fn ($k) => $ownKeys->contains($k))
            ->map(fn ($k) => $labels[$k] ?? $k)->values()->all();

        $playerPending = [];
        $playerRejected = [];
        foreach ($player->documents as $doc) {
            if ($doc->review_status === 'pending') {
                $pending++;
                $playerPending[] = $labels[$doc->document_type] ?? $doc->document_type;
            }
            if ($doc->review_status === 'rejected') {
                $rejected++;
                $playerRejected[] = [
                    'document' => $labels[$doc->document_type] ?? $doc->document_type,
                    'reason' => $doc->rejection_reason,
                ];
            }
        }

        if ($missing || $playerPending || $playerRejected) {
            $byPlayer[] = [
                'player_id' => $player->id,
                'name' => trim(($player->user->name ?? '').' '.($player->user->lastname ?? '')),
                'missing' => $missing,
                'pending' => $playerPending,
                'rejected' => $playerRejected,
            ];
        }
    }

    $shown = array_slice($byPlayer, 0, 20);

    return [
        'success' => true,
        'data' => [
            'pending_documents' => $pending,
            'rejected_documents' => $rejected,
            'players_missing_required' => count(array_filter($byPlayer, fn ($p) => ! empty($p['missing']))),
            'by_player' => $shown,
            'truncated' => count($byPlayer) > count($shown),
        ],
        'message' => "{$pending} documentos pendientes de revisión, {$rejected} rechazados.",
    ];
}

protected function remindMissingDocuments(array $input, ?int $clubId, ?int $userId = null): array
{
    $confirmed = $input['confirmed'] ?? false;
    $status = $this->getDocumentReviewStatus([], $clubId, $userId);

    $targets = collect($status['data']['by_player'])
        ->filter(fn ($p) => ! empty($p['missing']) || ! empty($p['rejected']));

    if (! empty($input['player_ids'])) {
        $targets = $targets->whereIn('player_id', $input['player_ids']);
    }

    if (! $confirmed) {
        return [
            'success' => true,
            'requires_confirmation' => true,
            'data' => ['would_notify' => $targets->count(), 'players' => $targets->pluck('name')->values()->all()],
            'message' => "Se notificaría a {$targets->count()} familias. ¿Confirmas?",
        ];
    }

    $sent = 0;
    foreach ($targets as $target) {
        $player = PlaClubTeamPlayer::withoutGlobalScopes()->with('user')->find($target['player_id']);
        if (! $player?->user_id) {
            continue;
        }
        \App\Models\PlaNotification::create([
            'user_id' => $player->user_id,
            'club_id' => $clubId,
            'type' => 'documents_missing',
            'title' => __('documents.missing_title'),
            'message' => __('documents.missing_message', [
                'documents' => implode(', ', array_merge(
                    $target['missing'],
                    array_column($target['rejected'], 'document')
                )),
            ]),
            'data' => ['player_id' => $player->id],
            'priority' => 'medium',
        ]);
        $sent++;
    }

    return [
        'success' => true,
        'data' => ['notified' => $sent],
        'message' => "{$sent} familias notificadas sobre documentos faltantes.",
    ];
}
```

Agregar a los tres `lang/*/documents.php` (creados en Task 2): `missing_title` ("Documents pending" / "Documentos pendientes" / "Documentos pendentes") y `missing_message` ("Please upload: :documents" / "Por favor sube: :documents" / "Por favor envie: :documents").

- [ ] **Step 6: Routing hints** — en `SystemPromptBuilder.php` cerca de :567, junto a la línea de `getDocumentRequirements`, agregar:

```
- "¿Quién tiene documentos pendientes / rechazados?" → getDocumentReviewStatus
- "Recuérdales que suban los documentos" → remindMissingDocuments (confirmed=false primero)
```

- [ ] **Step 7: Correr tests → PASS.** También `php artisan test --filter=Assistant` completo para no romper el filtrado por rol.
- [ ] **Step 8: Pint + commit** — `feat: assistant tools for document review status and reminders`

### Task 14: Suite completa + QA manual

- [ ] **Step 1: Backend** — `docker compose exec saas_sport_app php artisan test` completo → verde. Si algo ajeno falla, reportarlo sin arreglarlo (no scope creep).
- [ ] **Step 2: Frontend** — `npm run lint` (0 warnings) y `npm run build` sin errores.
- [ ] **Step 3: QA manual con datos sembrados** (Owner `director@bogotafc.co` / `Password123!`):
  1. Overview carga sin las llamadas por-documento a Spaces (verificar en Network que `review-dashboard` responde rápido y sin campos `url` por documento).
  2. Cola: aprobar con `A`, rechazar con `R` + motivo, saltar con `→`, descarga funciona, PDF se ve en iframe, frente/reverso lado a lado.
  3. Rechazo genera notificación al padre y el padre ve badge + motivo y puede resubir.
  4. Rol `Administrador` puede aprobar (antes 403).
  5. Documento de inscripción pública vieja (side null) se ve correctamente (fix modal + backfill).
- [ ] **Step 4: Reporte final a Miguel** — resumen de commits por repo, recordatorio: falta `git push` (deploy) y correr `php artisan documents:backfill-enrollment-metadata --apply` en prod (lo decide Miguel).

---

## Fuera de alcance (siguientes iteraciones, decididas con Miguel)

- **Auto-aprobación IA**: aprobar automáticamente documentos con `quality.status === 'ok'` y número coincidente; hoy solo se muestra la sugerencia.
- **Streaming de descargas / ZIP** (hoy carga el archivo en memoria).
- **Validación de `accepted_formats`/`max_file_size_mb` por requisito en la subida** (backend valida genérico 5MB/extensiones globales).
- **Traducción localizada por usuario de la notificación** (hoy usa el locale de la app).
