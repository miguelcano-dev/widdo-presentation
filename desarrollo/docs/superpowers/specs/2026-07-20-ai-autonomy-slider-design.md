# SPEC — Autonomy Slider para Widdo AI (niveles de autonomía por categoría de acción)

> ## ✅ EN PRODUCCIÓN (estado al 13-ago-2026) — Frente 3 del plan AI-first
>
> Verificado contra el código: `app/Services/Assistant/AutonomyService.php`,
> `app/Models/AIAutonomySetting.php`, `app/Http/Requests/UpdateAutonomyRequest.php`,
> `app/Jobs/SendAutonomousPaymentReminders.php` y
> `app/Services/Assistant/Autonomy/PaymentReminderComposer.php`; en el frontend, la
> autonomía se refleja en `AgentActivitySection.jsx`, `DailyBriefCard.jsx` y
> `StartCycleDialog.jsx`.
>
> Cerrado junto con los otros 3 frentes — ver `2026-07-21-ai-first-master-plan.md`.


> Frente 3 del plan AI-first (playbook YC / Karpathy: partial autonomy). Autor: agente plan-slider, jul 20 2026. Verificado contra código real.
>
> **Repo:** `saas_sport` (Laravel 12) + `frontend` (React). Rama sugerida: `feature/ai-autonomy-slider`.
> **Niveles:** 0 = solo sugerir · 1 = borrador + confirmación (comportamiento actual) · 2 = ejecutar y notificar después. **Default universal: nivel 1 — cero cambio de comportamiento sin opt-in.**

Hallazgos de código que condicionaron el diseño: (1) la ejecución de tools está centralizada en `ClubAssistantToolExecutor::execute()` — chat y streaming pasan por ahí, el enforcement es un solo punto; (2) `AIConfig::getEffective()` tiene fallback a fila global → NO extender esa tabla (tabla nueva); (3) bug de email confirmado: `NotificationLog::markAsDelivered()` existe pero NO hay webhook de Resend montado — `delivered_at` nunca se llena, "sent" solo significa que Resend aceptó la petición. La tool `sendPaymentReminder` actual es 100% in-app (PlaNotification) → el caso 1 esquiva el canal roto. El job nocturno es determinístico (sin LLM): costo cero, sin no-determinismo.

## 0. Contexto de código verificado

| Qué | Dónde | Estado actual |
|---|---|---|
| Punto único de ejecución de tools | `app/Services/ClubAssistantToolExecutor.php:49` (`execute()`) | Ambos flujos (`chat()` y `chatStreamDirect()` en `ClubAssistantService.php:181,312`) llaman aquí. Enforcement va aquí, no en el prompt. |
| Patrón confirmed | Handlers en `app/Services/Assistant/Tools/*` leen `$input['confirmed'] ?? false` | Es el LLM quien pasa `confirmed`; hoy NO hay enforcement server-side. El slider lo formaliza. |
| CONFIRMATION PROTOCOL | `app/Services/Assistant/SystemPromptBuilder.php:316-320` | Bloque estático; pasa a ser dinámico. |
| Definiciones de tools | `app/Services/Assistant/ToolDefinitions.php` | Parámetro `confirmed` con descripción "Always start with false". |
| Config IA por club | `app/Models/AIConfig.php` → `pla_ai_config`, `getEffective()` con fallback global | NO extender (§1.1). |
| Daily brief | `app/Services/Assistant/DailyBriefService.php` + `ClubAssistantController@dailyBrief` + `routes/api.php:1479` | Reporte matutino = nuevo tipo de item. |
| Recordatorios existentes | `app/Jobs/SendPaymentReminders.php`, en `routes/console.php` 07:30 hora del servidor (sin TZ por club) | Emails vía `ThrottlesEmails` (Resend 2 req/s). Loggea `NotificationLog::markAsSent()`. |
| Bug entrega email | `app/Models/NotificationLog.php:109-124` | `markAsDelivered()` sin webhook que lo llame. `sent` ≠ entregado. |
| Timezone por club | `PlaClubTeam::getTimezone()` (`app/Models/PlaClubTeam.php:337`) | Patrón "job horario + hora local" probado por `app:generate-monthly-payments`. |
| Tool sendPaymentReminder | `app/Services/Assistant/Tools/WriteTools.php:611` | Pagos `PEN/OVD/PAR`, dedup, padres vía `parent_child_relationships`. Canal: **solo in-app**. |

## 1. Modelo de datos

### 1.1 Tabla nueva, NO extender `pla_ai_config`
(1) `getEffective()` cae a fila global → meter autonomía obligaría a duplicar provider/model por club; (2) la autonomía necesita auditoría propia; (3) granularidad por categoría = filas, no JSON.

### 1.2 Migración 1 — `pla_ai_autonomy_settings`
`database/migrations/2026_07_21_000001_create_pla_ai_autonomy_settings_table.php`

```php
Schema::create('pla_ai_autonomy_settings', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('club_id');
    $table->string('category', 50);
    $table->unsignedTinyInteger('level');    // 0 | 1 | 2
    $table->json('config')->nullable();      // {"schedule_hour": 20, "min_days_between": 3}
    $table->unsignedBigInteger('updated_by');
    $table->timestamps();
    $table->foreign('club_id')->references('id')->on('pla_club_teams')->onDelete('cascade');
    $table->foreign('updated_by')->references('id')->on('users');
    $table->unique(['club_id', 'category']);
});
```
**Semántica: ausencia de fila = nivel 1.** Sin seeder de defaults.

### 1.3 Migración 2 — `pla_ai_autonomous_actions` (log de auditoría)
`database/migrations/2026_07_21_000002_create_pla_ai_autonomous_actions_table.php`

```php
Schema::create('pla_ai_autonomous_actions', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('club_id');
    $table->string('category', 50);
    $table->string('tool_name', 100);         // 'sendPaymentReminder' o 'job:nightly_payment_reminders'
    $table->string('source', 30);             // 'chat' | 'scheduled_job'
    $table->unsignedBigInteger('triggered_by')->nullable();
    $table->json('input')->nullable();
    $table->json('result')->nullable();
    $table->string('status', 20);             // 'executed' | 'failed' | 'skipped'
    $table->boolean('reversible')->default(false);
    $table->timestamp('executed_at');
    $table->timestamp('reported_at')->nullable();
    $table->timestamps();
    $table->foreign('club_id')->references('id')->on('pla_club_teams')->onDelete('cascade');
    $table->index(['club_id', 'executed_at']);
    $table->index(['club_id', 'category', 'executed_at']);
});
```
Modelos nuevos: `app/Models/AIAutonomySetting.php`, `app/Models/AIAutonomousAction.php`.

### 1.4 Categorías y mapeo tool → categoría (COMPLETO)

| Categoría | Tools (handler) | max_level | Tope por tool |
|---|---|---|---|
| `payment_reminders` | `sendPaymentReminder` (WriteTools) | **2** | — |
| `notifications` | `sendNotification` (WriteTools), `notifyScheduleToTeams` (TournamentCompetitionTools) | **2** | — |
| `finances` | `createCharge`, `updateCharge`, `registerPayment`, `cancelPayment`, `createDiscount`, `createExpense`, `bulkAction` (WriteTools) | **1 — PROHIBIDO 2** | — |
| `players` | `createPlayer`, `editPlayer`, `togglePlayerStatus`, `assignPlayerCategory` (PlayerTools) | 1 | — |
| `sessions` | `createSession`, `editSession`, `recordAttendance` (WriteTools), `markSessionAttendance` (CheckInTools) | 1 | — |
| `events` | `createEvent` (WriteTools) | 1 | — |
| `club_settings` | `editClubSettings`, `createLocation`, `createEnrollmentLink` (AdvancedTools), `createCategory`, `inviteTrainer` (WriteTools) | 1 | — |
| `tournaments` | tools de TournamentTools + TournamentCompetitionTools + CheckInTools de torneo | 1 | `deleteTournament`, `cancelTournament`, `closeTournament`, `resetBracket`: **max 1 SIEMPRE** |

**Fuera del slider:** read tools; `saveMemory`/`forgetMemory`/`getMemories`; `exportReport`; SuperAdminTools. Tool no listada = no gateada.

### 1.5 Prohibiciones de nivel 2 — hard-coded (ningún endpoint puede subirlas)
- **`finances` — max 1.** Mueve dinero/estado contable; error autónomo = pérdida de confianza + efecto legal/contable, sin reversión limpia.
- **`players` — max 1.** PII de menores y acceso; `createPlayer` crea usuarios.
- **`sessions`, `events`, `club_settings`, `tournaments` — max 1.** Sin caso de uso autónomo aún. Tools destructivas de torneo capadas a 1 permanentemente.
- **Candidatas iniciales a nivel 2: SOLO `payment_reminders` y `notifications`** — mensajes, no mutaciones; peor caso = molestia (mitigada §4), no pérdida de dinero/datos.

## 2. Backend — enforcement

### 2.1 Nuevo `app/Services/Assistant/AutonomyService.php`
```php
class AutonomyService
{
    public const CATEGORIES = [...];               // §1.4 — única fuente de verdad
    public const CATEGORY_MAX_LEVEL = [
        'payment_reminders' => 2, 'notifications' => 2,
        'finances' => 1, 'players' => 1, 'sessions' => 1,
        'events' => 1, 'club_settings' => 1, 'tournaments' => 1,
    ];
    public const TOOL_MAX_LEVEL = [
        'deleteTournament' => 1, 'cancelTournament' => 1,
        'closeTournament' => 1, 'resetBracket' => 1,
    ];
    public const DEFAULT_LEVEL = 1;

    public function categoryFor(string $toolName): ?string;
    public function levelFor(int $clubId, string $toolName): int;
    // min( nivel guardado ?? 1, CATEGORY_MAX_LEVEL[cat], TOOL_MAX_LEVEL[tool] ?? 2 )
    // Cache::remember("ai_autonomy_{$clubId}", 300) con flush al guardar
    public function getSettings(int $clubId): array;
    public function updateSettings(int $clubId, array $levels, int $userId): array; // 422 si excede max
    public function logAutonomousAction(...): AIAutonomousAction;
}
```

### 2.2 Gate en `ClubAssistantToolExecutor::execute()` (~25 líneas, único cambio en ese archivo)
Antes del loop de handlers: `$gate = $this->autonomy->gate($toolName, $input, $clubId); if ($gate !== null) return $gate;`
Aplica solo si `categoryFor()` no es null y hay `$clubId` (organizer/super admin sin club → sin gating):
- **Nivel 0:** `confirmed=true` → bloquear con `['success'=>false,'data'=>['autonomy_blocked'=>true,...],'message'=>...]` (presenta sugerencia, indica ejecutar manual o subir nivel). `confirmed=false` permitido (preview ES la sugerencia).
- **Nivel 1:** pasa sin tocar nada.
- **Nivel 2:** pasa; si `confirmed===true` y success → registrar en `pla_ai_autonomous_actions` (source=`chat`) y añadir `'autonomous'=>true` al result (badge frontend).

Límite conocido (anotar): en nivel 1 la confirmación sigue mediada por el LLM, igual que hoy. El valor server-side real: techo del nivel 0 + log del nivel 2.

### 2.3 Endpoints
`routes/api.php`, prefijo `v1/assistant` (~línea 1471):
```php
Route::get('/autonomy', [ClubAssistantController::class, 'getAutonomy']);
Route::put('/autonomy', [ClubAssistantController::class, 'updateAutonomy']);
```
`UpdateAutonomyRequest`: `levels` (categoría→0|1|2, solo enum), `config.payment_reminders.schedule_hour` (0-23, default 20), `config.payment_reminders.min_days_between` (1-30, default 3). GET devuelve `max_levels` + `updated_by`/`updated_at`.

### 2.4 Roles: **solo `owner` escribe (y Super Admin); `admin` solo lectura**
Nivel 2 = la plataforma actúa ante las familias en nombre del club → decisión de responsabilidad del dueño. PUT → 403 si rol ≠ owner (patrón de `SystemPromptBuilder.php:70-74`); GET owner+admin.

## 3. System prompt
Reemplazar bloque estático `## CONFIRMATION PROTOCOL` (316-320) por bloque generado desde `AutonomyService::getSettings($clubId)`: default 2-step igual al actual + overrides "SUGGEST-ONLY (level 0)" (NEVER confirmed=true aunque el usuario insista) y "AUTONOMOUS (level 2)" (puede ejecutar directo si la intención es inequívoca; SIEMPRE declarar lo ejecutado; ambigüedad → preview). Sin overrides el bloque es semánticamente idéntico al actual — sin regresión. El prompt es UX; el enforcement duro es §2.2.

## 4. Caso 1 — Recordatorios de pago nocturnos autónomos

### 4.1 Canal: **in-app (`PlaNotification`), NO email en fase 1** (esquiva bug Resend; email gateado a §7 fila 1)

### 4.2 Job `app/Jobs/SendAutonomousPaymentReminders.php`
`routes/console.php`: `Schedule::job(...)->hourly()->withoutOverlapping()->onOneServer()->appendOutputTo(storage_path('logs/ai-autonomy.log'));`

1. Clubs elegibles: `payment_reminders` nivel 2 + club `ACT`.
2. Ejecutar solo si `now($club->getTimezone())->hour === schedule_hour` (default 20) + suscripción activa (check del paywall) — suspendido = `skipped` logueado.
3. **Idempotencia:** skip si ya hay fila `executed` con `tool_name='job:nightly_payment_reminders'` ese día local.
4. Selección: **extraer lógica de `WriteTools::sendPaymentReminder`** a `app/Services/Assistant/Autonomy/PaymentReminderComposer.php` (tool y job la comparten). Filtro extra del job: solo **OVD, days_overdue >= 1** (pre-due lo cubre `SendPaymentReminders` email).
5. **Anti-spam (por destinatario, cross-source):** excluir `user_id` con `PlaNotification` `type='payment_reminder'` en el club en los últimos `min_days_between` días (default 3), venga de tool manual u otro run. Techo: 100 destinatarios/club/noche.
6. Crear `PlaNotification` (formato de la tool, `data.source='ai_autonomous'`, `created_by=null`).
7. UNA fila resumen en `pla_ai_autonomous_actions`: `source='scheduled_job'`, `result={reminders_sent, users_notified, families, total_amount, skipped_antispam}`.

### 4.3 Reporte matutino — daily brief
En `DailyBriefService::getDailyBrief()`: query `AIAutonomousAction` últimas 24h `executed` con `reported_at` null → item `type='autonomous_report'` ("anoche envié {sent} recordatorios a {families} familias" / EN equivalente) + `suggestion` "¿Quieres ver el detalle?". Marcar `reported_at` ANTES de cachear (brief 15 min) para no duplicar. Detalle vía read tools existentes.

## 5. Frontend (i18n default INGLÉS, en/es/pt-BR `assistant.json`)

### 5.1 `src/pages/settings/assistant/AIAutonomyPage.jsx` (nueva)
- Editable solo owner; admin read-only con nota.
- Card por categoría: nombre + tools cubiertas + segmented 3 posiciones: `0 — Suggest only` / `1 — Ask before acting (default)` / `2 — Act & report` + línea explicativa.
- Nivel 2 deshabilitado según `max_levels` del GET (la UI nunca hardcodea).
- Subir a 2 → `AlertDialog` de advertencia obligatorio.
- `payment_reminders` nivel 2: inputs `schedule_hour` (select 18-22) y `min_days_between` (default 3).
- Zod: `z.object({ levels: z.record(z.enum([...CATEGORIES]), z.number().int().min(0).max(2)), config: {...} })` + refine contra `max_levels`.
- `assistantService.js` → `getAutonomy()`, `updateAutonomy()`; hook `useAutonomySettings` (React Query `['assistant','autonomy',clubId]`).

### 5.2 Reporte matutino: `UnifiedAssistantPanel.jsx` (consume daily-brief) → render item `autonomous_report` con icono; clic inserta "Muéstrame el detalle de los recordatorios de anoche".

### 5.3 Badge: `tool_results` con `data.autonomous===true` → chip `⚡ executedAutomatically`. Claves `assistant.autonomy.*` ×3 locales.

## 6. Tests (`tests/Feature/Assistant/`)
1. `AutonomyLevelsTest` — nivel 0+confirmed=true → bloqueado; nivel 0+false → preview; nivel 1 → regresión idéntica a hoy; nivel 2+true → ejecuta + auditoría `chat`.
2. `AutonomyDefaultsTest` — club sin filas = comportamiento actual; prompt sin overrides equivalente al actual.
3. `AutonomyForbiddenCategoriesTest` — PUT `finances=2` → 422; PUT admin/trainer → 403; owner → 200; `levelFor()` capa `deleteTournament` a 1.
4. `AutonomyMappingTest` — invariante: unión de `CATEGORIES` cubre exactamente las write tools con `confirmed` de los `getToolMap()` — falla si se añade write tool sin categorizar (crítico para cobranza).
5. `SendAutonomousPaymentRemindersTest` — solo nivel 2 + hora local correcta (2 TZ, mock now()); idempotencia; anti-spam (2 días con min 3 = excluido; 4 = incluido); club no-ACT/suspendido = skip; techo 100; fila con contadores.
6. `AutonomyMultiTenantTest` — A nivel 2, B sin config: B pide confirmación; job no toca B; settings de A invisibles desde B.
7. `DailyBriefAutonomousReportTest` — item aparece una sola vez (`reported_at`) respetando cache.

Frontend: página (niveles, disabled por max_levels, dialog, Zod) + badge.

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| **Bug email** (sin webhook Resend, `delivered_at` nunca se llena) | Fase 1 = solo in-app. **Orden obligatorio para email autónomo (fase 2):** (a) webhook `POST /api/webhooks/resend` (`email.delivered`/`email.bounced`) → `markAsDelivered()`/`markAsFailed()`; (b) ≥2 semanas midiendo delivery rate en los recordatorios existentes; (c) solo con delivery ≥95% se añade email al job, distinguiendo "enviados N, entregados M". Nunca reportar "envié" sin distinguir aceptado vs entregado. |
| Timezone/DST | Hora local vía `getTimezone()` + idempotencia por día local. |
| Club suspendido | `status='ACT'` + suscripción en el job; chat hereda paywall. |
| Doble ejecución | `withoutOverlapping` + `onOneServer` + marker en auditoría. |
| LLM alucina confirmed=true en nivel 0 | Enforcement server-side en executor. |
| Escalada vía API | MAX_LEVEL en código + FormRequest + 403 por rol. |
| Spam a familias | `min_days_between` cross-source + techo 100/noche + solo vencidos. |
| Costo LLM del job | Cero: determinístico, no invoca LLM. |

## 8. Archivos y estimación
**Crear (backend):** 2 migraciones · `AIAutonomySetting.php` · `AIAutonomousAction.php` · `Assistant/AutonomyService.php` · `Assistant/Autonomy/PaymentReminderComposer.php` · `Jobs/SendAutonomousPaymentReminders.php` · `Requests/UpdateAutonomyRequest.php` · 7 tests.
**Modificar (backend):** `ClubAssistantToolExecutor.php` (gate ~25 líneas) · `SystemPromptBuilder.php` (bloque 15 dinámico) · `Tools/WriteTools.php` (extraer selección al Composer) · `DailyBriefService.php` · `ClubAssistantController.php` (2 métodos) · `routes/api.php` (2 rutas) · `routes/console.php` (1 schedule).
**Crear (frontend):** `pages/settings/assistant/AIAutonomyPage.jsx` · hook `useAutonomySettings`. **Modificar:** `assistantService.js`, `UnifiedAssistantPanel.jsx`, router/menú settings, `assistant.json` ×3.

**Estimación:** backend core 1.5d · job+brief 1d · endpoints+roles 0.5d · frontend 1.5d · tests 1.5d ≈ **6 días de agente implementador**, 2 PRs (PR1: modelo+gate+settings+UI; PR2: job nocturno+brief).

## 9. Archivos COMPARTIDOS con el frente "workflows e2e de cobranza" (se implementa DESPUÉS)
Interfaz estable que ese frente debe respetar:
- `ClubAssistantToolExecutor.php` — gate como primer paso de `execute()`; workflows DEBEN ejecutar tools vía `execute()` (nunca handlers directo).
- `SystemPromptBuilder.php` — CONFIRMATION PROTOCOL generado desde `AutonomyService`; no reintroducir texto estático.
- `AutonomyService.php` — tools nuevas de cobranza se registran en `CATEGORIES` (`AutonomyMappingTest` lo fuerza).
- `Assistant/Autonomy/PaymentReminderComposer.php` — selección de morosos vive aquí; cobranza extiende, no duplica.
- `Tools/WriteTools.php`, `DailyBriefService.php` — contacto secundario; coordinar merges.

## Decisiones para validar con Miguel
1. Caso 1 solo por in-app en fase 1 (email gateado al webhook de Resend que hoy no existe).
2. Job nocturno determinístico, sin LLM.
