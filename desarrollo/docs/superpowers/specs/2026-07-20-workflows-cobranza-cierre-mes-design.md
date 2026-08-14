# Spec: Workflows end-to-end — Ciclo de Cobranza + Cierre de Mes (Widdo AI)

> ## ✅ EN PRODUCCIÓN (estado al 13-ago-2026) — Frente 4 del plan AI-first
>
> Verificado contra el código. Backend: `app/Http/Controllers/Api/CollectionCycleController.php`,
> `app/Jobs/ProcessCollectionCycles.php`, `app/Services/Workflows/MonthCloseService.php`,
> `app/Services/Assistant/Tools/WorkflowTools.php`, `app/Models/PlaClubTeamCollectionCycle.php`.
> Frontend: `components/payments/collections/CollectionCyclePanel.jsx`, `StartCycleDialog.jsx`,
> `hooks/payments/useCollectionCycle.js`, `services/collectionCycleApiService.js` y la
> vista de cobranza `/home/collections`.
>
> Cerrado junto con los otros 3 frentes — ver `2026-07-21-ai-first-master-plan.md`.


**Fecha:** 2026-07-20
**Frente:** Workflows del agente IA (post-"autonomy slider")
**Repos:** `desarrollo/saas_sport` (Laravel 12) + `desarrollo/frontend` (React)
**Regla de ramas:** implementar en `feature/ai-collection-workflows` (backend) y `feature/ai-collection-workflows` (frontend). NUNCA en `main`. NUNCA commit/push automático.

---

## 0. Contexto y hallazgos del código (leer antes de implementar)

Hechos verificados en el código que condicionan todo el diseño:

1. **`sendPaymentReminder` del agente NO envía emails.** `WriteTools::sendPaymentReminder()` (`app/Services/Assistant/Tools/WriteTools.php:609`) solo inserta filas en `PlaNotification` (in-app). El envío de emails de recordatorio vive en el job nocturno `App\Jobs\SendPaymentReminders` (07:30, `routes/console.php:59`), que usa Resend vía `PaymentReminderMail` + `ThrottlesEmails` y registra en `NotificationLog`.
2. **El job nocturno solo recuerda pagos `PEN`** y solo en 3 fechas puntuales (X días antes, día del vencimiento, X días después según config del club: `charge_reminder_days_before/after`, `send_reminder_on_due_date`). Un pago `OVD` con 20 días de mora **nunca más recibe recordatorio**. Ahí está el hueco que el ciclo de cobranza llena.
3. **Estados de pago** (`PlaClubTeamPayment`): `PEN`, `PAR`, `COM`, `OVD`, `PEV`, `CXL` + flag `is_canceled`. Deuda viva = `status IN (PEN, PAR, OVD)` y `is_canceled = false`. `remaining_amount` es el saldo.
4. **Canales disponibles**: `email` (Resend), `in_app`, `push` (WebPush) vía `NotificationManager` + `PreferenceResolver`. **WhatsApp NO existe** — queda fuera de alcance; el modelo de datos deja el campo `channel` extensible.
5. **Bug Resend conocido** (memoria `email-reminders-bug-may2026`): la BD marca `sent` pero a veces no llegan. El diseño NO puede asumir entrega confiable de email (ver §9).
6. **Loop de tools limitado a 5 iteraciones** en `ClubAssistantService::chat()` y `chatStreamDirect()`.
7. **Multi-tenant**: tablas `pla_club_teams_*` con `club_id` + trait de aislamiento (`HasClubIsolation`/`ProtectedModel`). Idioma del club se resuelve por país (`SystemPromptBuilder::resolveLanguage()`).
8. **Guards existentes de email de pagos**: `emails_payment_enabled` (bloqueo por club), `emails_payment_test_address` (redirección de prueba), preferencias por usuario (`notificationPreferences`), placeholders `@placeholder.widdo.co` (menores sin email real). El ciclo DEBE respetar los cuatro.

### Dependencia del frente "autonomy slider" (se consume, no se redefine)

Se asume que al iniciar este frente ya existen (nombres a ajustar a lo que el slider entregue):

- **Config de autonomía por categoría y club** — algo como `AgentAutonomyConfig::level(int $clubId, string $category): int` con niveles `0 = solo sugerir`, `1 = ejecutar con confirmación`, `2 = ejecutar solo y reportar`. Categoría relevante aquí: `payments.reminders` (y `reports` para cierre de mes).
- **Log de acciones autónomas** — servicio para registrar toda acción ejecutada sin humano en el loop (aquí: cada envío de recordatorio del ciclo).
- **Job nocturno de recordatorios del slider** — si el slider ya montó un job que envía recordatorios autónomos, ESTE frente lo reemplaza/absorbe para deudores en ciclo (ver §9.1, dueño único del envío).

Si algún nombre difiere, el implementador adapta las llamadas; las interfaces conceptuales son esas tres.

---

## 1. Decisión arquitectónica

**Decisión: orquestación server-side determinista.** Dos services nuevos (`CollectionCycleService`, `MonthCloseService`) que llaman la misma lógica de datos que hoy usan las tools, con estado persistente en BD, avanzados por el scheduler. El agente los invoca mediante tools compuestas (`runCollectionCycle`, `runMonthClose`, …) que son wrappers delgados.

**Por qué NO cadena de tool-calls del LLM:**

- La cobranza es **multi-día** (día 0 → +5 → +10 → +15). Un chat abierto no sobrevive días; el estado tiene que vivir en BD y avanzar por cron, no por conversación.
- El escalamiento debe ser **determinista y auditable**: mismo deudor, misma etapa, mismo mensaje. Un LLM encadenando 8 tools introduce variabilidad justo donde se necesita cero (dinero + comunicaciones a familias).
- Coste y latencia: un cierre de mes vía LLM serían 6-8 round-trips de tools; server-side es 1 tool call que devuelve el paquete completo y el LLM solo **narra** el resultado (eso sí lo hace bien).
- Es exactamente el patrón "agent-wrapped deterministic tools": lo determinista en código, el agente como interfaz conversacional y capa de interpretación.

**Límite de iteraciones:** se mantiene en 5. Con tools compuestas, el ciclo completo y el cierre de mes son 1 iteración cada uno. Cambio opcional barato (no requerido): extraer `5` a la constante `ClubAssistantService::MAX_TOOL_ITERATIONS = 5` para legibilidad. NO subir el límite como mecanismo de workflow — sería pagar tokens por determinismo que ya tenemos gratis en PHP.

**División LLM vs. código:**

| Responsabilidad | Dónde vive |
|---|---|
| Detectar/clasificar deudores, decidir etapa, elegir canal, enviar, registrar, calcular recuperado | `CollectionCycleService` (determinista) |
| Redactar variaciones de mensaje | NO — plantillas fijas por etapa/idioma (`lang/`), auditable y sin riesgo de tono. El agente puede proponer texto custom solo en modo manual (§6) |
| Explicar el estado del ciclo, narrar el cierre de mes, sugerir iniciar/parar | LLM (chat + daily brief) |

---

## 2. Modelo de datos

Tres tablas nuevas, prefijo estándar `pla_club_teams_*`, todas con `club_id` + trait de aislamiento. Modelos: `PlaClubTeamCollectionCycle`, `PlaClubTeamCollectionCase`, `PlaClubTeamCollectionEvent` (en `app/Models/`).

### Migración `2026_07_XX_000001_create_collection_cycle_tables.php`

```php
Schema::create('pla_club_teams_collection_cycles', function (Blueprint $table) {
    $table->id();
    $table->foreignId('club_id')->constrained('pla_club_teams');
    $table->string('status', 20)->default('active'); // active | completed | stopped
    $table->foreignId('started_by')->constrained('users'); // quién lo inició (owner o agente en su nombre)
    $table->unsignedTinyInteger('autonomy_level'); // snapshot del nivel de payments.reminders al iniciar
    $table->json('config'); // etapas, días, canales, filtros de entrada (ver defaults §3)
    $table->decimal('debt_at_start', 12, 2)->default(0);   // deuda total de los casos al entrar
    $table->decimal('recovered_amount', 12, 2)->default(0); // atribuido (ver §4)
    $table->decimal('collected_amount', 12, 2)->default(0); // total cobrado a familias en ciclo (sin atribución)
    $table->timestamp('started_at');
    $table->timestamp('ended_at')->nullable();
    $table->timestamps();
    $table->index(['club_id', 'status']);
});

Schema::create('pla_club_teams_collection_cases', function (Blueprint $table) {
    $table->id();
    $table->foreignId('cycle_id')->constrained('pla_club_teams_collection_cycles')->cascadeOnDelete();
    $table->foreignId('club_id')->constrained('pla_club_teams'); // redundante a propósito: aislamiento + queries directas
    $table->foreignId('player_id')->constrained('pla_club_teams_players');
    $table->foreignId('guardian_user_id')->nullable()->constrained('users'); // acudiente principal si es menor
    $table->string('status', 20)->default('active'); // active | pending_approval | paid | excluded | escalated | stopped
    $table->unsignedTinyInteger('stage')->default(0);  // 0..3 (ver §3)
    $table->decimal('debt_at_entry', 12, 2);
    $table->decimal('current_debt', 12, 2);             // refrescado por el reconciliador
    $table->decimal('recovered_amount', 12, 2)->default(0);
    $table->json('payment_ids');                        // pagos PEN/PAR/OVD que componen la deuda al entrar
    $table->timestamp('stage_entered_at');
    $table->timestamp('last_contact_at')->nullable();
    $table->string('last_channel', 20)->nullable();     // email | in_app | push
    $table->timestamp('next_action_at')->nullable();    // cuándo toca la siguiente etapa
    $table->string('exit_reason', 50)->nullable();      // paid | partial_then_paid | owner_excluded | cycle_stopped | no_contactable
    $table->timestamps();
    $table->unique(['cycle_id', 'player_id']);
    $table->index(['club_id', 'status', 'next_action_at']); // query del job diario
});

Schema::create('pla_club_teams_collection_events', function (Blueprint $table) {
    $table->id();
    $table->foreignId('case_id')->constrained('pla_club_teams_collection_cases')->cascadeOnDelete();
    $table->foreignId('club_id')->constrained('pla_club_teams');
    $table->string('type', 40); // case_opened | reminder_sent | stage_advanced | approval_requested | approved | payment_detected | case_closed | owner_alerted | send_failed
    $table->unsignedTinyInteger('stage')->nullable();
    $table->string('channel', 20)->nullable();
    $table->foreignId('notification_log_id')->nullable()->constrained('notification_logs');
    $table->json('metadata')->nullable(); // monto detectado, payment_id, error de envío, etc.
    $table->timestamp('created_at');
    $table->index(['case_id', 'type']);
    $table->index(['club_id', 'created_at']);
});
```

Reglas:
- **Un solo ciclo `active` por club** (validado en el service; no constraint de BD porque `status` muta).
- `payment_ids` es snapshot de entrada; la deuda viva se recalcula contra `pla_club_teams_payments` en cada corrida (fuente de verdad = tabla de pagos, nunca el snapshot).
- El **caso es por jugador** (no por pago): la familia recibe UN mensaje con su deuda consolidada, igual que agrupa `getDebtorsSummary`. `guardian_user_id` se resuelve con la misma query de `parent_child_relationships … authorization_status = 'authorized'` que ya usa `getDebtorsSummary` (`ReadTools.php:1641`).

---

## 3. Ciclo de cobranza: etapas, reglas y autonomía

### 3.1 Config por defecto (columna `config` del ciclo, override por club al iniciar)

```json
{
  "entry": { "min_days_overdue": 3, "min_debt_amount": 0, "exclude_player_ids": [] },
  "stages": [
    { "stage": 0, "day_offset": 0,  "tone": "soft",   "channels": ["email", "in_app"] },
    { "stage": 1, "day_offset": 5,  "tone": "firm",   "channels": ["email", "in_app", "push"] },
    { "stage": 2, "day_offset": 10, "tone": "direct", "channels": ["email", "in_app", "push"], "target": "guardian_first" },
    { "stage": 3, "day_offset": 15, "tone": null,     "channels": [], "action": "alert_owner" }
  ],
  "min_days_between_contacts": 4,
  "max_messages_per_case": 3
}
```

### 3.2 Etapas

| Etapa | Cuándo | Qué hace | Tono |
|---|---|---|---|
| **0 — Recordatorio suave** | Al entrar al ciclo | Email + in-app a jugador (y acudiente si es menor) con deuda consolidada y cómo pagar | Amable, asume olvido: "te recordamos…" |
| **1 — Recordatorio firme** | +5 días sin pago | Email + in-app + push. Menciona días de mora y monto | Directo, sin amenaza: "tu pago sigue pendiente hace N días…" |
| **2 — Mensaje directo al acudiente** | +10 días | Prioriza al acudiente (`guardian_first`); menciona consecuencias operativas REALES del club si existen (mora configurada / política del club), nunca amenazas legales | Serio y respetuoso |
| **3 — Escalamiento humano** | +15 días | NO contacta a la familia. Notifica al owner (in-app + push + item en daily brief): "N familias requieren gestión personal, deuda total $X" y marca casos `escalated` | Interno |

### 3.3 Reglas de salida y transición (evaluadas por el reconciliador diario ANTES de enviar nada)

- **Pagó todo** (`current_debt == 0`): caso → `paid`, se envía **mensaje de agradecimiento** (1 solo, canal in-app + email), evento `case_closed`, se acumula `recovered_amount`.
- **Pago parcial**: se agradece el abono (solo in-app, no email), el caso **permanece en su etapa actual** y `next_action_at` se pospone `min_days_between_contacts` días. NO se reinicia a etapa 0 (evita loops de "abono chiquito → reset eterno") y NO se escala el mismo día que pagó algo.
- **Pago/cobro cancelado** (`is_canceled` o `CXL`): la deuda se recalcula; si queda en 0 → `excluded` con `exit_reason = 'no_debt'` (sin agradecimiento).
- **Pago en `PEV`** (comprobante subido, por verificar): se CONGELA el caso (no enviar nada) hasta que se apruebe o rechace. Recordarle a alguien que ya subió comprobante es el error más ofensivo posible.
- **Owner excluye** (desde UI o vía tool): → `excluded`, `exit_reason = 'owner_excluded'`.
- **Sin canal viable** (email placeholder + sin acudiente con email + sin push): → `escalated` inmediato con `exit_reason = 'no_contactable'` (aparece en la alerta al owner desde el día 0, no se pierde en silencio).
- **Ciclo detenido**: todos los casos activos → `stopped`.

### 3.4 Autonomía (consume el nivel del slider para `payments.reminders`)

El nivel se snapshotea en `autonomy_level` al crear el ciclo (cambiarlo a mitad de ciclo aplica a partir del día siguiente vía re-lectura; el snapshot es informativo/auditoría).

| Nivel | Etapa 0 | Etapa 1 | Etapa 2 | Etapa 3 (alerta interna) | Iniciar ciclo |
|---|---|---|---|---|---|
| **0 — sugerir** | confirmación por lote | confirmación por lote | confirmación por lote | auto (es interna) | siempre con `confirmed=true` del usuario |
| **1 — semi** | **auto** | **auto** | confirmación por lote | auto | `confirmed=true` |
| **2 — auto** | auto | auto | **auto** | auto | el agente puede iniciarlo proactivamente y reportar |

- "Confirmación por lote" = el job deja los casos del día en `pending_approval` y publica UNA solicitud agregada ("Hay 6 recordatorios de etapa 2 listos: [lista]. ¿Envío?") vía daily brief + notificación in-app al owner. Al aprobar (chat `approveCollectionStage` implícito en `runCollectionCycle`/UI), se envían en la siguiente pasada (o inline si se aprueba por chat).
- La etapa 3 nunca envía nada a familias → siempre automática.
- **Todo envío automático se registra en el log de acciones autónomas del slider** además de `collection_events`.

### 3.5 Plantillas de mensaje e idioma

- Idioma del **club** (misma lógica `resolveLanguage` por país; extraerla a un helper compartido `App\Support\ClubLocale::resolve(PlaClubTeam $club): string` para no duplicar — hoy está encerrada en `SystemPromptBuilder`).
- Plantillas en `lang/es/collection.php`, `lang/en/collection.php`, `lang/pt/collection.php`: claves `stage0.subject/body`, `stage1.*`, `stage2.*`, `thanks.*`, `owner_alert.*`, con placeholders `:player`, `:club`, `:amount`, `:days`, `:oldest_due`.
- Email se envía con un mailable nuevo `CollectionReminderMail` (misma plantilla visual que `PaymentReminderMail`), in-app/push vía `NotificationManager` con `notification_type = 'payment_reminder'`/`'payment_overdue'` (tipos ya existentes → respetan preferencias y el bloqueo `emails_payment_enabled` sin código nuevo).

### 3.6 Job diario

`App\Jobs\ProcessCollectionCycles` — scheduler `dailyAt('08:15')` (`routes/console.php`), `withoutOverlapping()->onOneServer()`. Por cada ciclo `active`:

1. **Reconciliar** (ver §4): detectar pagos, cerrar casos, recalcular deudas.
2. **Incorporar deudores nuevos** que cumplan `entry` y no tengan caso en el ciclo (entran en etapa 0).
3. **Avanzar etapas**: casos con `next_action_at <= now()` → según autonomía, enviar (y fijar siguiente `next_action_at`) o marcar `pending_approval`.
4. **Enviar** con los mismos guards del job existente: `emails_payment_enabled`, `emails_payment_test_address`, placeholder emails, `canReceiveNotification` (reusar extrayendo esos helpers de `SendPaymentReminders` a un trait `ValidatesReminderRecipients` compartido).
5. Registrar `collection_events` + log de autonomía. Fallos de envío → evento `send_failed` con el error; el caso NO avanza de etapa si ningún canal salió (reintenta al día siguiente).

Zona horaria: 08:15 hora del servidor en V1 (igual que los demás jobs de recordatorio existentes salvo `generate-monthly-payments`). Mejora futura: por-timezone como `GenerateMonthlyPayments`.

---

## 4. Métrica "plata recuperada" (definición honesta)

**Definición:** suma de `amount_paid` de pagos (o cuotas aprobadas) que cumplen TODAS:

1. El pago pertenece a un **caso activo/escalado** del ciclo (estaba en `payment_ids` o es deuda del jugador detectada al entrar).
2. El pago pasó a `COM`/`PAR` (o cuota aprobada) **después** de `case.created_at`.
3. El pago se registró **dentro de los 7 días** posteriores al último `reminder_sent` del caso (ventana de atribución).

**Doble contador anti-inflado** (ambos se guardan en el ciclo):
- `recovered_amount` — cumple 1+2+3. Es lo que se presenta como "Widdo te recuperó $X".
- `collected_amount` — cumple 1+2 solamente (todo lo que pagaron las familias en ciclo). Se muestra como contexto ("cobrado de deudores en gestión: $Y"), nunca como mérito del agente.

Reglas anti-inflado explícitas:
- Pagos hechos ANTES del primer recordatorio del caso: cuentan solo en `collected_amount` (el agente aún no había hecho nada).
- Casos `escalated` que pagan tras la llamada humana del owner: `collected_amount`, NO `recovered_amount` (lo recuperó el humano).
- Un ciclo detenido deja de atribuir desde `ended_at`.

**Cálculo:** en el paso "reconciliar" del job diario. Query: pagos de los jugadores con caso activo cuyo `status` cambió a `COM`/`PAR` — detectado comparando `remaining_amount` actual vs. `current_debt` del caso, y leyendo cuotas (`pla_club_teams_payment_installments` aprobadas) con `updated_at > last_reconciled`. Se persiste el desglose en `collection_events.metadata` (`payment_id`, `amount`, `attributed: bool`) para poder auditar el número ante un cliente.

**Dónde se muestra:**
- **Daily brief** (`DailyBriefService`): nuevo item `type: 'collection'` cuando hay ciclo activo — "Ciclo de cobranza: $X recuperados, N familias al día, M por aprobar". Es también el vehículo de las solicitudes de aprobación y de la alerta de etapa 3.
- **Cierre de mes** (§5): línea propia "Recuperado por gestión de cobranza: $X de $Y que estaban en mora".
- **UI del ciclo** (§7): card de resumen.
- (Venta: el número mensual agregado por club queda en `pla_club_teams_collection_cycles`, trivial de sumar para el pitch "los clubes recuperaron $X con Widdo".)

---

## 5. Cierre de mes

### 5.1 `MonthCloseService::generate(int $clubId, int $month, int $year): array`

Compone en UNA llamada server-side (reusando services, no tools):

| Sección | Fuente |
|---|---|
| Resumen financiero del mes (recaudado, pendiente acumulado, tasa de recaudo, por cobro) | `PaymentStatsService::getStats` (lo mismo que `getFinancialSummary`) |
| Comparativa vs. mes anterior (recaudo, tasa, gastos, jugadores activos, deltas %) | Segunda llamada a `getStats` + counts |
| Gastos del mes + delta | Query de `pla_club_teams_expenses` (misma que `ReadTools::getExpenses`) |
| Tendencia 6 meses | Reusar la query de `AdvancedTools::queryMonthlyTrend` (extraer a método compartido o duplicar la query — preferible extraer a `PaymentStatsService::monthlyTrend()`) |
| Anomalías | Reusar detecciones de `DailyBriefService` (caída >15% de recaudo, nuevos sin asistir) + nuevas: gastos > ingresos, cobro con recaudo <50% |
| Top deudores | Query de `getDebtorsSummary` (extraer a `PaymentStatsService::debtorsSummary()` para compartir con `ReadTools`) |
| Resultado de cobranza | `recovered_amount` / `collected_amount` del ciclo del mes (si hubo) |

Devuelve JSON estructurado con esas 7 secciones. **El LLM narra** este JSON en el idioma del usuario (eso es lo que el modelo hace bien); el JSON también alimenta el export.

### 5.2 Export "listo para enviar"

`MonthCloseService::export()` genera XLSX vía `ClubExportService` (mismo mecanismo de `exportReport`) con hoja de resumen + hoja de deudores + hoja de gastos, y devuelve URL de descarga temporal. V1: el usuario lo descarga/reenvía él mismo; NO se auto-envía a familias (es información financiera interna del club).

### 5.3 Trigger

- **Manual:** el usuario lo pide en chat → tool `runMonthClose`.
- **Sugerido:** `DailyBriefService` — los días 1-5 del mes, si no se ha generado el cierre del mes anterior (marca en cache/`agent_club_memories` category `follow_up`), agrega suggestion: "¿Genero el cierre de [mes]?" Con autonomía nivel 2 en `reports`, el agente lo genera solo y lo deja listo en el daily brief ("Tu cierre de junio está listo: [resumen de 2 líneas] — pídeme el detalle o el Excel").

---

## 6. Interfaz con el agente

### 6.1 Tools nuevas (nuevo handler `app/Services/Assistant/Tools/WorkflowTools.php`, registrado en `ClubAssistantToolExecutor`)

Definiciones en `ToolDefinitions.php` (visibles para roles `owner`, `admin`, `accountant`; el resto no las ve — mismo patrón de gating por rol del prompt):

1. **`runCollectionCycle`** — inicia el ciclo.
   - Params: `confirmed` (bool, patrón estándar), `min_days_overdue` (int, default 3), `min_debt_amount` (number, default 0), `exclude_players` (string[], nombres).
   - `confirmed=false` → preview determinista: N familias, deuda total, etapas y fechas estimadas, nivel de autonomía vigente y qué ejecutará solo vs. qué pedirá aprobación.
   - `confirmed=true` → crea ciclo + casos y **ejecuta etapa 0 inline** (si autonomía lo permite; si no, la deja `pending_approval`). Error claro si ya hay ciclo activo.
2. **`getCollectionCycleStatus`** — read-only. Devuelve resumen: por etapa (conteo + nombres + deudas), recuperado/cobrado, pendientes de aprobación, escalados. Sin `confirmed`.
3. **`approveCollectionReminders`** — aprueba el lote `pending_approval` (opcionalmente `stage` y `exclude_players`). `confirmed` pattern. Envía inline y reporta.
4. **`stopCollectionCycle`** — detiene el ciclo (`confirmed` pattern; preview = qué casos quedan sin gestionar). Soporta `player_name` para excluir UNA familia sin parar el ciclo.
5. **`runMonthClose`** — genera el cierre. Params: `month`, `year` (defaults: mes anterior), `include_export` (bool). Read-only → sin `confirmed`. Devuelve el JSON de §5.1 (+ URL export) para que el LLM lo narre.

Respuestas siguen el contrato existente `['success' => bool, 'data' => [...], 'message' => string]`.

### 6.2 Cambios al system prompt (`SystemPromptBuilder`)

- **WORKFLOW PATTERNS (sección 22):** reemplazar los patrones "End of month review" y "Monthly report" y ampliar:
  ```
  **Collection cycle (multi-day, runs itself):** "cobra a los morosos" / "gestiona la cartera" → runCollectionCycle (preview → confirm). It then runs daily on its own. Check progress with getCollectionCycleStatus. NEVER send manual sendPaymentReminder to players already in an active cycle.
  **Month close:** "cierre de mes" / "cómo nos fue en junio" → runMonthClose → narrate: summary, vs-last-month deltas, anomalies, top debtors, recovered by collections. Offer the Excel export.
  ```
- **COMMON PATTERNS:** añadir mapeos "¿cómo va la cobranza?" → `getCollectionCycleStatus`, "para el ciclo" / "no le cobres más a X" → `stopCollectionCycle`, "aprueba los recordatorios" → `approveCollectionReminders`.
- **Regla anti-solapamiento** en FINANCIAL DATA RULES: si hay ciclo activo (inyectar flag en el bloque de contexto: `Active collection cycle: yes/no`), `sendPaymentReminder` manual debe redirigir al ciclo. El flag se añade a la query consolidada de counts (`assistant_counts_{clubId}`).
- El one-off `sendPaymentReminder` **se conserva** para casos puntuales fuera de ciclo (un solo jugador, sin escalamiento).

---

## 7. Frontend (React)

**Decisión: sección dentro de Pagos, no página nueva.** Tab/segmento "Cobranza" en `frontend/src/pages/dashboard/Payments/` (los usuarios ya viven ahí; una página nueva fragmentaría navegación para una feature que se opera principalmente por chat).

Componentes nuevos (`frontend/src/components/payments/collections/`):
- `CollectionCyclePanel.jsx` — vista principal: card de resumen (recuperado, cobrado, familias al día / en gestión / escaladas) + tabla de casos con columnas: familia/jugador, deuda, etapa (badge con color por etapa; verde tenue `bg-green-50 dark:bg-green-950/30` para `paid`), último contacto/canal, próxima acción. Acciones por fila: excluir (dialog de confirmación). Acciones globales: iniciar ciclo (si no hay), detener, aprobar pendientes.
- `StartCycleDialog.jsx` — filtros de entrada (mora mínima, monto mínimo, exclusiones) + preview (mismo endpoint de preview que la tool).
- `PendingApprovalBanner.jsx` — banner cuando hay lote `pending_approval` con CTA "Revisar y aprobar".
- Chat: badge/chip en `assistant` cuando hay ciclo activo (el daily brief ya lo trae como item `collection`; solo renderizar el nuevo tipo en el componente del brief existente).

API service: `frontend/src/services/collectionCycleApiService.js` + hook `frontend/src/hooks/payments/useCollectionCycle.js` (React Query, keys `['collection-cycle', clubId]`; invalidación desde eventos Reverb del canal `club.{id}.payments` existente cuando se registren pagos).

Endpoints REST (controller `CollectionCycleController`, rutas en `routes/api.php` bajo middleware de club + rol owner/admin/accountant):
```
GET    /api/clubs/{club}/collection-cycle           → ciclo activo + casos + resumen
POST   /api/clubs/{club}/collection-cycle           → iniciar (body = filtros; ?preview=1 para preview)
POST   /api/clubs/{club}/collection-cycle/approve   → aprobar lote pendiente
DELETE /api/clubs/{club}/collection-cycle           → detener
POST   /api/clubs/{club}/collection-cycle/cases/{case}/exclude
GET    /api/clubs/{club}/month-close?month&year     → JSON del cierre (para futura vista; V1 opcional)
```

**i18n obligatorio EN/ES/PT** (default inglés, no hardcodear español): nuevo namespace `frontend/src/i18n/locales/{en,es,pt-BR}/collections.json` con TODAS las claves (etapas, estados, tooltips, dialogs, banner). Los textos de los mensajes a familias NO viven en frontend (son del backend, §3.5).

---

## 8. Tests

### Backend (PHPUnit, `tests/Feature/`)

`CollectionCycleServiceTest`:
- inicio: crea casos solo para deudores que cumplen filtros; excluye placeholders sin canal → `escalated/no_contactable`; segundo `start` con ciclo activo → falla.
- escalamiento por tiempo: `travel(+5 days)` → etapa 1 enviada; `+10` → etapa 2; `+15` → etapa 3 alerta al owner y NADA a la familia. Verificar `Mail::fake()`/`NotificationLog` y que cada envío quedó en `collection_events` y en el log de autonomía.
- salida por pago: pago `COM` → caso `paid` + agradecimiento único; pago `PAR` → permanece en etapa, `next_action_at` pospuesto, sin escalar ese día; pago `PEV` → congelado (0 envíos).
- **idempotencia**: correr `ProcessCollectionCycles` dos veces el mismo día → 0 envíos duplicados (clave: `last_contact_at`/`next_action_at`).
- autonomía: nivel 0 → todo `pending_approval`; nivel 1 → etapas 0-1 auto y etapa 2 `pending_approval`; nivel 2 → todo auto. Aprobación de lote envía y limpia.
- **multi-tenant**: dos clubes con ciclos; el job de uno no toca casos del otro; endpoints devuelven 403/404 cross-club; tool con `clubId` A no ve ciclo de B.
- **anti doble envío**: jugador con caso activo → `SendPaymentReminders` (job legacy) lo salta; jugador sin caso → job legacy lo procesa normal.

`CollectionRecoveryMetricTest`:
- pago dentro de ventana de 7 días post-recordatorio → suma a `recovered_amount` y `collected_amount`.
- pago ANTES del primer recordatorio → solo `collected_amount`.
- pago a los 8+ días del último recordatorio → solo `collected_amount`.
- pago de jugador escalado → solo `collected_amount`.
- pagos parciales acumulan correctamente; pago cancelado después no descuenta dos veces.

`AssistantWorkflowToolsTest` (patrón de los tests de tools existentes):
- `runCollectionCycle` preview vs confirmed; error con ciclo activo; respeta rol (trainer no tiene la tool).
- `getCollectionCycleStatus`, `approveCollectionReminders`, `stopCollectionCycle` (incl. exclusión individual).
- `runMonthClose` devuelve las 7 secciones con datos sembrados conocidos.

`MonthCloseServiceTest`:
- números cuadran contra seed determinista (recaudo, deltas vs mes anterior, tendencia 6m con meses vacíos = 0, anomalía de caída >15%, top deudores ordenado, recovered del ciclo del mes).

`CollectionCycleApiTest`: CRUD de endpoints + permisos por rol + aislamiento.

### Frontend (Playwright, opcional V1)
- Smoke: tab Cobranza renderiza con ciclo activo mock; iniciar ciclo desde dialog muestra preview. (Suite completa puede ir en el harness UX existente después.)

Nota operativa: si corre en paralelo con otra sesión, usar `TEST_DB_DATABASE=db_testing_b` (regla del repo).

---

## 9. Riesgos y mitigaciones

### 9.1 Doble envío (ciclo vs. job legacy vs. job del slider) — **dueño único del envío**
Regla: **para un jugador con caso activo en un ciclo, el ciclo es el ÚNICO emisor de recordatorios de pago.**
- `SendPaymentReminders::sendReminder()` agrega guard: skip si existe caso `active/pending_approval` para ese `player_id` (una `exists()` barata; extraerla a scope `PlaClubTeamCollectionCase::activeForPlayer()`).
- Si el frente slider montó su propio job de recordatorios autónomos, se le aplica el mismo guard (coordinar: ese job debería directamente delegar en el ciclo cuando exista).
- El prompt instruye no usar `sendPaymentReminder` manual con ciclo activo (§6.2), y la tool misma devuelve error suave con redirección si el jugador está en ciclo (guard en `WriteTools::sendPaymentReminder`).

### 9.2 Bug Resend (BD marca sent, email no llega)
- El ciclo **nunca depende de un solo canal**: etapas 0-2 siempre incluyen in-app, y push cuando hay suscripción. El escalamiento es por tiempo, no por "no abrió el email".
- `collection_events.notification_log_id` enlaza cada envío a `NotificationLog` → si Resend falla en el SDK, queda `send_failed` y el caso reintenta al día siguiente sin avanzar etapa.
- **Tarea previa al rollout (manual, Miguel):** revisar el dashboard de Resend / configurar webhook de delivery antes de activar ciclos en producción. El bug conocido se investiga en Resend ANTES de tocar código (memoria `email-reminders-bug-may2026`). El ciclo no lo arregla ni lo empeora, pero lo hace visible (conteo `send_failed` en la UI).

### 9.3 Familias sin email válido / datos incompletos
- Placeholder + sin acudiente contactable → `no_contactable` → alerta al owner día 0 (§3.3). Nunca se cae en silencio.
- Clubes sin `due_date` en pagos (histórico `FixPaymentsNullDueDate`): `min_days_overdue` se evalúa con `COALESCE(due_date, created_at)`; documentar en el preview cuántos pagos no tienen fecha.
- Club con `emails_payment_enabled = false`: el ciclo funciona solo con in-app/push y el preview lo advierte.

### 9.4 Anti-hostigamiento / tono legal-cultural (CO, US-FL, BR)
- Duros límites en código, no en prompt: máx. `max_messages_per_case = 3` mensajes por familia por ciclo, `min_days_between_contacts = 4`, un solo mensaje por etapa, congelamiento con `PEV`, salida inmediata al pagar.
- Plantillas fijas revisadas (nada generado por LLM hacia familias en V1). Prohibido en plantillas: amenazas legales, mención de "cobranza jurídica", lenguaje de agencia de cobro. En EN (Florida) especial cuidado: es un *payment reminder* del club, NO "debt collection" (evita terreno FDCPA); firmar siempre como el club, con opt-out efectivo (preferencias ya existentes).
- Respeto total de `notificationPreferences` (usuario que apagó `payment_reminders` no recibe email/push; el caso avanza solo con in-app y cuenta como contactado para no escalar más rápido).

### 9.5 Solapamiento de jobs / carrera con registro de pagos
- Orden del scheduler: `SendPaymentReminders` 07:30 → `ProcessCollectionCycles` 08:15; ambos `withoutOverlapping()->onOneServer()`. El guard de 9.1 hace el orden irrelevante para duplicados.
- El reconciliador corre SIEMPRE antes de enviar dentro del job (paga hoy a las 7:00 → no le llega recordatorio a las 8:15).

### 9.6 Atribución inflada del "recuperado"
Mitigada por diseño (§4): ventana de 7 días, doble contador, exclusión de escalados y pagos pre-recordatorio, desglose auditable por evento.

---

## 10. Archivos, estimación y solapes con el frente slider

### Crear (backend)
| Archivo | Contenido |
|---|---|
| `database/migrations/2026_07_XX_000001_create_collection_cycle_tables.php` | §2 |
| `app/Models/PlaClubTeamCollectionCycle.php`, `…CollectionCase.php`, `…CollectionEvent.php` | modelos + scopes + aislamiento |
| `app/Services/Workflows/CollectionCycleService.php` | start/preview/reconcile/advance/approve/stop/metrics |
| `app/Services/Workflows/MonthCloseService.php` | §5 |
| `app/Jobs/ProcessCollectionCycles.php` | §3.6 |
| `app/Mail/CollectionReminderMail.php` | mailable por etapa |
| `lang/{es,en,pt}/collection.php` | plantillas §3.5 |
| `app/Support/ClubLocale.php` | idioma por país (extraído de SystemPromptBuilder) |
| `app/Traits/ValidatesReminderRecipients.php` | extraído de SendPaymentReminders |
| `app/Services/Assistant/Tools/WorkflowTools.php` | las 5 tools §6.1 |
| `app/Http/Controllers/Api/CollectionCycleController.php` | endpoints §7 |
| `tests/Feature/CollectionCycleServiceTest.php`, `CollectionRecoveryMetricTest.php`, `AssistantWorkflowToolsTest.php`, `MonthCloseServiceTest.php`, `CollectionCycleApiTest.php` | §8 |

### Modificar (backend)
| Archivo | Cambio | ¿Compartido con slider? |
|---|---|---|
| `app/Services/ClubAssistantToolExecutor.php` | registrar `WorkflowTools` | **SÍ** |
| `app/Services/Assistant/ToolDefinitions.php` | +5 tools | **SÍ** |
| `app/Services/Assistant/SystemPromptBuilder.php` | §6.2 + flag ciclo activo + usar `ClubLocale` | **SÍ** |
| `app/Services/Assistant/DailyBriefService.php` | item `collection` + sugerencia cierre de mes | **SÍ** |
| `app/Jobs/SendPaymentReminders.php` | guard 9.1 + extraer trait | SÍ si el slider lo toca para su job nocturno |
| `routes/console.php` | schedule `ProcessCollectionCycles` | **SÍ** |
| `routes/api.php` | rutas §7 | posible |
| `app/Services/Assistant/Tools/WriteTools.php` | guard en `sendPaymentReminder` (jugador en ciclo) | posible |
| `app/Services/PaymentStatsService.php` | extraer `monthlyTrend()` / `debtorsSummary()` compartidos | no |
| Config/log de autonomía del slider | solo CONSUMIR (nivel + registrar acciones) | **SÍ — no redefinir** |

Con los archivos marcados **SÍ**: coordinar orden de merge (slider primero, este frente rebasea) y no tocar las mismas secciones en paralelo (regla `multi-session-git-collision`).

### Crear (frontend)
`components/payments/collections/{CollectionCyclePanel,StartCycleDialog,PendingApprovalBanner}.jsx`, `services/collectionCycleApiService.js`, `hooks/payments/useCollectionCycle.js`, `i18n/locales/{en,es,pt-BR}/collections.json`; modificar la página `pages/dashboard/Payments` (tab), registro de namespace i18n, render del item `collection` en el daily brief del chat.

### Estimación
| Bloque | Estimado |
|---|---|
| Migración + modelos + `CollectionCycleService` + job + plantillas | 2.5 días |
| Tools + prompt + daily brief + guards anti-doble-envío | 1 día |
| `MonthCloseService` + tool + export | 1 día |
| Endpoints + frontend (tab, dialogs, i18n) | 1.5 días |
| Tests (backend completos) | 1.5 días |
| **Total** | **~7.5 días** de agente implementador, en 3 PRs: (1) motor de cobranza+tests, (2) tools+prompt+brief, (3) cierre de mes+frontend |

### Orden de implementación
1. Migración + modelos + `CollectionCycleService` con tests (sin envíos reales: `Mail::fake`).
2. Job + guards de doble envío + plantillas i18n.
3. Tools + prompt + daily brief.
4. `MonthCloseService` + tool.
5. Endpoints + frontend.
6. Rollout: feature flag por club (columna `config` de AIConfig o módulo del plan — decidir con Miguel si esto es feature Pro), y checklist manual de Resend (§9.2) antes de activar en producción.
