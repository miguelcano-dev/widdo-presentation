# Acuerdos de pago — Diseño

> ## ✅ IMPLEMENTADO Y EN PRODUCCIÓN — 🔴 con fallos vistos en QA (estado al 13-ago-2026)
>
> Verificado contra el código: `app/Models/PlaClubTeamPaymentAgreement.php`,
> `app/Policies/PlaClubTeamPaymentAgreementPolicy.php` y su registro en
> `AuthServiceProvider`, más el enganche en `PlaClubTeamPayment` y `PlaClubTeamCharge`.
>
> 🔴 **Antes de tocar nada aquí, pregunta a Miguel.** Vio fallos en QA sobre este módulo
> (memoria `acuerdos-de-pago-jul2026`) y no está cerrado como «sano». El plan de ejecución
> largo está en `docs/superpowers/plans/2026-07-29-acuerdos-de-pago.md`.


**Fecha:** 2026-07-29
**Estado:** aprobado (Enfoque A)
**Módulo:** `payments` (backend `saas_sport`, frontend `frontend`)

---

## 1. Problema

Un club acuerda con una familia morosa una forma distinta de pagar lo que debe:
"tienes 3 mensualidades vencidas por 450.000, págame 300.000 en dos cuotas y
quedamos a paz y salvo". Hoy no hay forma de registrar eso. El admin solo puede
cancelar los cobros (perdiendo la trazabilidad de la deuda) o dejarlos abiertos
(y entonces la deuda del club queda inflada y el ciclo de cobranza sigue
persiguiendo a una familia que ya pactó).

## 2. Qué construimos

Un **acuerdo de pago**: el admin selecciona uno o varios pagos pendientes de un
jugador, fija un valor total libre, una descripción y una o varias cuotas con sus
fechas. Los pagos originales quedan **suplidos**: dejan de contar como deuda en
totales, sumatorias, reportes, cobranza y recordatorios. En su lugar cuentan las
cuotas del acuerdo, que son pagos normales — con comprobante, aprobación, recibo
y vista del padre.

### Fuera de alcance (explícito)

- Pago online de las cuotas por pasarela. Hoy ningún cobro de jugador se paga
  online; el flujo es transferencia + comprobante. El acuerdo no cambia eso.
- Reversa automática por incumplimiento. Si la familia no paga, las cuotas
  simplemente vencen y entran a cobranza como cualquier otro cobro.
- Mora automática sobre las cuotas (ver §5.4).
- Firma digital del acuerdo por la familia.

---

## 3. Decisiones de diseño

**(13-ago-2026, Miguel) Una cuota con abono parcial (`PAR`) SÍ entra en un acuerdo,
por su SALDO pendiente.** El abono ya registrado no se toca; se pacta lo que falta.
El diseño original la excluía; se decidió lo contrario porque el moroso real casi
siempre tiene abonos sueltos y excluirlas dejaría los acuerdos inservibles justo
para quien más los necesita. (La cuota con comprobante EN VERIFICACIÓN sí queda
fuera: ahí la familia ya reportó un pago que nadie ha revisado.)


| Decisión | Elección | Razón |
|---|---|---|
| Valor del acuerdo | Libre | El club condona o recarga a criterio propio. La UI muestra la diferencia contra la deuda original. |
| Cuotas | 1 o N, cada una con fecha | Con N cuotas, cada una es un pago independiente con su comprobante. |
| Cuotas como entidad | Filas de `pla_club_teams_payments` | Reusa comprobantes, aprobación, recibos, recordatorios, vista del padre y app móvil sin escribir nada nuevo. |
| Cobros originales | Status nuevo `AGR` | `AGR` no está en `DEBT_STATUSES`, así que sale solo de deuda, cobranza y recordatorios. |
| Incumplimiento | Sin reversa automática | Las cuotas vencen como cualquier cobro. |
| Anulación | Manual, solo si ninguna cuota tiene abonos | Escape para errores de captura sin lógica de redistribución de dinero. |

---

## 4. Modelo de datos

### 4.1 Tabla nueva `pla_club_teams_payment_agreements`

| Columna | Tipo | Nota |
|---|---|---|
| `id` | bigint PK | |
| `club_id` | FK `pla_club_teams` | cascade. Obligatorio en `$fillable` para que `ProtectedModel` aplique `ClubScope`. |
| `player_id` | FK `pla_club_teams_players` | cascade |
| `agreement_date` | date | Fecha en que se pacta. Default hoy. |
| `total_amount` | decimal(12,2) | Valor pactado, libre. |
| `original_debt_amount` | decimal(12,2) | Snapshot de la suma de `remaining_amount` de los pagos suplidos al momento de crear. |
| `description` | text | Detalle del acuerdo. Obligatorio. |
| `status` | varchar(20) | `active` \| `completed` \| `cancelled`. Default `active`. |
| `installments_count` | unsigned tinyint | Cuántas cuotas se pactaron. |
| `created_by` | FK `users` nullable | `onDelete('set null')` |
| `cancelled_by`, `cancelled_at`, `cancellation_reason` | nullable | |
| timestamps + softDeletes | | |

Índices: `['club_id','player_id','status']`, `['club_id','status']`.

Modelo `app/Models/PlaClubTeamPaymentAgreement.php`: `use HasFactory, ProtectedModel;`
más `Auditable` (mismo patrón que `PlaClubTeamPayment`). Relaciones `club`,
`player`, `creator`, `coveredPayments()`, `installmentPayments()`.

`status = completed` se calcula: cuando todas las cuotas quedan en `COM`.

### 4.2 Columnas nuevas en `pla_club_teams_payments`

| Columna | Tipo | Para qué |
|---|---|---|
| `agreement_id` | FK nullable a la tabla anterior | Enlaza tanto los pagos suplidos como las cuotas. |
| `agreement_role` | varchar(12) nullable | `covered` (pago original suplido) \| `installment` (cuota del acuerdo). |
| `pre_agreement_status` | char(3) nullable | Status que tenía el pago suplido antes de pasar a `AGR`. Permite anular el acuerdo. |

`payments.status` ya es `char(3)` sin constraint: **`AGR` no necesita migración de
columna**, solo código.

### 4.3 Cobro sintético por club

Las cuotas necesitan un `charge_id` (FK no nula). Se crea, perezosamente al crear
el primer acuerdo del club, un `PlaClubTeamCharge` con:

- `name` = `'__payment_agreement__'` (clave estable; unique es `[club_id, name]`)
- `is_hidden = true`, `frequency_id = null`, `status = 'ACT'`, `amount = 0`

`is_hidden` ya lo respetan `GenerateMonthlyPayments` (no genera mensualidades),
`ApplyLateFees` (no aplica mora), `getChargesForNewPlayer` y
`ChargeService::getAvailableChargesForNewPlayer`. Precedente idéntico:
`PlaTournamentController` ya crea cobros ocultos para torneos.

El nombre visible de cada cuota no sale del cobro sino de `payments.description`,
que se rellena con `"Acuerdo de pago — cuota N/M"` más la descripción del acuerdo.

---

## 5. Backend

### 5.1 Servicio `app/Services/PaymentAgreementService.php`

Toda la escritura pasa por aquí. **No se usa `PlaClubTeamPaymentController::store()`**
porque su guarda anti-duplicado (mismo jugador + mismo cobro + mismo mes) impide
crear dos cuotas del cobro sintético en el mismo mes.

```
create(int $clubId, int $playerId, array $data): PlaClubTeamPaymentAgreement
```

Dentro de una transacción:

1. Valida que cada `payment_id` recibido pertenece al club y al jugador, y que su
   status está en `DEBT_STATUSES` (no se puede suplir un pago ya completado ni
   uno ya suplido por otro acuerdo).
2. Calcula `original_debt_amount` = suma de `remaining_amount` de esos pagos.
3. Crea el acuerdo.
4. Marca los pagos suplidos: guarda `pre_agreement_status`, pone `status = 'AGR'`,
   `agreement_id`, `agreement_role = 'covered'`.
5. Crea una fila de `pla_club_teams_payments` por cuota, con `charge_id` del cobro
   sintético, `amount_due` = valor de la cuota, `remaining_amount` = igual,
   `due_date` = fecha pactada, `status = 'PEN'`, `agreement_role = 'installment'`.
6. Devuelve el acuerdo con sus relaciones.

```
cancel(PlaClubTeamPaymentAgreement $a, int $userId, string $reason): void
```

Solo si **ninguna cuota tiene installments aprobados o en verificación**. Revierte
cada pago suplido a su `pre_agreement_status`, cancela las cuotas (`CXL`), marca
el acuerdo `cancelled`.

Validación de montos: la suma de las cuotas debe ser exactamente `total_amount`
(tolerancia de 1 unidad monetaria por redondeo al repartir). La UI reparte
automáticamente y el backend revalida.

### 5.2 Controlador y rutas

`app/Http/Controllers/PlaClubTeamPaymentAgreementController.php`, bajo el bloque
`Route::middleware('module.access:payments')` de `routes/api.php`:

| Método | Ruta | Autorización |
|---|---|---|
| GET | `payment-agreements` | owner \| admin \| accountant |
| GET | `payment-agreements/{agreement}` | idem |
| POST | `payment-agreements` | idem |
| POST | `payment-agreements/{agreement}/cancel` | owner \| accountant |
| GET | `players/{player}/agreement-eligible-payments` | idem |

Autorización con el mismo patrón privado del controlador de pagos
(`assertCanManagePayments` / `assertCanDeletePayments`), más una
`PlaClubTeamPaymentAgreementPolicy` registrada para consistencia.

`agreement-eligible-payments` devuelve los pagos del jugador en `DEBT_STATUSES`
sin `agreement_id`, con su cobro, periodo y `remaining_amount` — es lo que
alimenta el paso 1 del wizard. Se apoya en la forma de datos que ya devuelve
`playerChargesSummary`.

### 5.3 Cambios en el modelo `PlaClubTeamPayment`

- `STATUS_AGREED = 'AGR'` y etiqueta en `getStatusLabels()`.
- `AGR` **entra** en `ACTIVE_STATUSES`. Es imprescindible: esa constante alimenta
  las guardas anti-duplicado, y sin ella `GenerateMonthlyPayments` volvería a
  generar el cobro que el acuerdo acaba de suplir.
- `AGR` **no entra** en `DEBT_STATUSES`. De ahí sale gratis toda la exclusión de
  deuda: `scopeOwed`, `scopeOverdue`, `scopeChaseable` y sus ~25 consumidores.
- `updatePaymentStatus()` retorna temprano si el status es `AGR`, para que un
  abono tardío no saque al pago del acuerdo.
- `cancelPayment()` rechaza pagos `AGR` (hay que anular el acuerdo, no el pago).

### 5.4 Puntos que hay que corregir a mano

Estos no se arreglan solos porque hardcodean listas de estados o solo excluyen `CXL`:

| Archivo | Qué cambia |
|---|---|
| `PaymentStatsService::getTotalBilled()` | Excluir `AGR`, si no lo facturado cuenta doble (original + cuotas). |
| `PaymentStatsService::getCollectionRate()` | Excluir `AGR` del denominador. |
| `PaymentStatsService::debtorsSummary()` | Sustituir `['PEN','PAR','OVD']` por `DEBT_STATUSES`. |
| `Services/Workflows/CollectionCycleService::findEligibleDebtors()` | Igual. |
| `Api/SimpleDashboardController` (`getPlayerDebtsDetail`, `accountantDashboard`) | Igual. |
| `ParentChildController` buckets y labels | `AGR` no puede caer en el bucket "pendiente" de la vista del padre; va a historial con etiqueta propia. |
| `Api/FinancialReportController::incomeByCharge()` y `yearComparison()` | Agregan por installments aprobados sin mirar `payments.status`; excluir los de pagos `AGR` (un pago suplido no debería tener abonos, pero se blinda). |
| `PlaClubTeamChargeController::index()` | Filtrar `is_hidden` para que el cobro sintético no aparezca en la pantalla de Cobros. |
| `Assistant/ToolDefinitions.php` enum de status | Añadir `AGR`. |
| `Assistant/Tools/FamilyTools`, `PlayerTools`, `AdvancedTools`, `SystemPromptBuilder` | Etiquetas y SQL crudo: verificar que `AGR` queda fuera de deuda y con etiqueta. |

Mora: las cuotas no acumulan mora automática porque `ApplyLateFees` ignora los
cobros ocultos. Es el comportamiento deseado — el valor pactado es el valor
pactado. Queda documentado, no es un bug.

### 5.5 Auditoría

`PlaClubTeamPayment` ya implementa `Auditable` (paquete `owen-it/laravel-auditing`),
así que el paso de status a `AGR` queda registrado en la tabla `audits` sin código
extra. El acuerdo también implementa `Auditable`.

---

## 6. Frontend

Mantiene la UI Widdo existente: mismos componentes `ui/`, mismo stepper, mismos
estilos de estado, misma paleta.

### 6.1 Wizard de creación

`src/components/payments/agreements/PaymentAgreementWizardModal.jsx` +
`hooks/usePaymentAgreementWizard.jsx`, calcados de `ChargeWizardModal` +
`useChargeWizard` (stepper con check verde, validación por paso con firma dual
`validateStepN(showErrors)`, `currentStepRef` espejo, error de paso en caja roja).

Tres pasos:

1. **Cobros a suplir.** Lista con el mismo estilo de fila que
   `PlayerPaymentsSummaryDialog` (borde ámbar pendiente / rojo vencido, monto a la
   derecha). Selección múltiple. Muestra el total seleccionado.
2. **Acuerdo.** Valor total (input de moneda con el patrón de
   `PaymentAmountSection`: estado crudo, formateo solo al perder el foco),
   fecha del acuerdo (`SimpleDatePicker`), descripción obligatoria. Debajo, la
   diferencia contra la deuda seleccionada, en verde si el club condona y en
   ámbar si recarga.
3. **Cuotas.** Número de cuotas; el importe se reparte automáticamente y es
   editable por fila; una fecha por cuota (`SimpleDatePicker`). Resumen final con
   los cobros que quedarán suplidos.

### 6.2 Resto de la UI

- Status `AGR` en `src/helpers/paymentStatusConfig.js` (los 6 puntos: `PAYMENT_STATUS`,
  `PAYMENT_STATUS_CONFIG`, simple status y `mapToSimpleStatus`, `getAdminStatusOptions`,
  predicados) y traducción en `locales/{en,es,pt-BR}/status.json`.
- Pestaña **Acuerdos** en `PaymentsTable.jsx`, junto a las que ya existen (todos /
  verificación / cobranza). Lista los acuerdos del club con jugador, fecha, valor,
  cuotas pagadas y estado. Evita crear una ruta y una entrada de menú nuevas.
- `PaymentAgreementDetailDialog`: cabecera del acuerdo, lista de cobros suplidos,
  lista de cuotas con su estado, botón Anular (solo owner/accountant, deshabilitado
  con tooltip si alguna cuota ya tiene abonos).
- Punto de entrada: botón "Crear acuerdo" en `PlayerPaymentsSummaryDialog` cuando
  el jugador tiene deuda.
- Servicio en `src/services/paymentApiService.js` con `validateClubId`/`validateId`.
  Hook `src/hooks/payments/usePaymentAgreements.js` con el patrón de toasts del
  proyecto (`bg-green-300` 2000ms / `bg-red-300` 3000ms). Clave
  `PAYMENT_AGREEMENTS` en `queryKeys.js`, enganchada dentro de
  `invalidatePaymentQueries` para que registrar un pago refresque el acuerdo.
- i18n bajo `payments.json` con prefijo `payment_agreements.*`, en los tres
  idiomas. No hace falta tocar `src/i18n/index.js`.

### 6.3 Vista del padre

No requiere trabajo nuevo: las cuotas llegan a `MyPaymentsPage` como pagos
pendientes normales y el padre sube el comprobante como siempre. El único
requisito es que el backend deje de devolver los pagos `AGR` en el bucket de
pendientes de `ParentChildController` (§5.4), o el padre vería la deuda dos veces.

---

## 7. Asistente IA

Handler nuevo `app/Services/Assistant/Tools/PaymentAgreementTools.php`
(`BaseToolHandler`), registrado en el constructor de `ClubAssistantToolExecutor`.

| Tool | Tipo | Qué hace |
|---|---|---|
| `getPaymentAgreements` | lectura | Acuerdos del club, filtrables por jugador y estado. |
| `createPaymentAgreement` | escritura | Crea el acuerdo. Parámetro `confirmed`: `false` devuelve preview, `true` ejecuta. |

Los schemas se añaden **al final** de `$generalTools` en `ToolDefinitions.php`,
para minimizar la invalidación del prefijo cacheado (el caché de Anthropic hace
match por prefijo y las tools se renderizan antes del system prompt).

Registro obligatorio, cada uno con su test que lo vigila:

- Nombres en la whitelist de `accountant` (`allowedNamesForRole`) y en la constante
  `ACCOUNTANT_TOOLS` de `AssistantRoleToolFilteringTest`.
- `createPaymentAgreement` en `AutonomyService::CATEGORIES` bajo `finances`
  (tope duro nivel 1 → nunca se ejecuta sin confirmación humana). Lo exige
  `AutonomyMappingTest`.
- Documentación en `SystemPromptBuilder`: secciones Read, Write, y sobre todo
  `FINANCIAL DATA RULES`, donde hay que explicar que un acuerdo saca deuda de los
  buckets y la reemplaza por cuotas, o el modelo mezclará las dos cosas.

No se toca el agente de onboarding: es otro executor, otro registry y otra firma.

---

## 8. Pruebas

**Backend (Feature, con `CreatesClubWithRoles` + `SeedsBaseData` + factories):**

- Crear acuerdo: los pagos originales quedan `AGR` con `pre_agreement_status`
  guardado; se crean N cuotas con las fechas pactadas.
- La deuda del jugador y la del club bajan exactamente en `original_debt_amount`
  y suben en `total_amount` (verificado contra `PaymentStatsService` y contra
  `collectionsList`, que es la vista de cobranza).
- `getTotalBilled` y `getCollectionRate` no cuentan dos veces.
- El jugador con acuerdo activo desaparece de `findEligibleDebtors` del ciclo de
  cobranza y de `SendPaymentReminders`.
- Pagar todas las cuotas deja el acuerdo en `completed`.
- Una cuota vencida sí aparece como deuda vencida (el incumplimiento se ve).
- No se puede suplir un pago ya suplido, ni uno de otro club (tenancy).
- `GenerateMonthlyPayments` no regenera un cobro suplido.
- Anular: revierte estados; y falla si una cuota tiene un abono aprobado.
- Autorización: trainer, player y parent reciben 403.

**Asistente:** un test funcional estilo `AssistantRequiredDataToolsTest` con el par
preview/confirmado, un caso en `tests/Evals/cases/payment_agreements.yaml`, y una
entrada en `adversarial.yaml` con `forbidden_tools` para trainer/player/parent.

**Frontend:** el wizard se valida a mano contra los tres idiomas; el harness
`npm run test:ux` cubre el flujo de admin.

---

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| Doble conteo de deuda si algún sitio olvida excluir `AGR` | Test que compara la deuda total antes y después de crear un acuerdo, sobre `PaymentStatsService` y `collectionsList` a la vez. |
| El cobro sintético aparece en pantallas de cobros | Se filtra `is_hidden` en `ChargeController::index()`; hay test. |
| Un abono llega a un pago suplido y lo saca del acuerdo | `updatePaymentStatus()` retorna temprano en `AGR`. |
| Añadir tools invalida el caché del prompt | Inevitable en el deploy; se minimiza añadiéndolas al final del pool. |
| Las cuotas no acumulan mora | Decisión de producto, documentada. |
