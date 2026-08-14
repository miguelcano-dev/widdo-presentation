# Spec: Pagos v2 — alineación con Cobros v2

**Fecha:** 2026-07-31 · **Cerrado:** 2026-08-03
**Estado:** ✅ **EJECUTADO Y EN PRODUCCIÓN.** No requiere sesión propia — ver §7 para el cierre,
los commits y lo que se traspasa a la Fase 1 del spec de cobros.
**Spec hermano:** `2026-07-30-cobros-v2-revenue-assurance.md`
**Por qué separado (decisión de Miguel, 31-jul):** poder revertir el módulo de pagos a su versión
actual sin arrastrar los cambios de cobros. Son dos riesgos de despliegue distintos: cobros toca
creación, **pagos toca dinero ya registrado**.

---

## 0. Regla de este spec

> **El inventario funcional (§1) es un contrato.** Nada de lo que hay hoy desaparece sin decisión
> explícita de Miguel. Cada cambio propuesto en §3 declara qué toca y qué deja intacto.

Origen: revisión del 31-jul con tres agentes en paralelo sobre 53 archivos / ~15.800 líneas
(lista y filtros · backend y servicios · acuerdos e installments).

---

## 1. Inventario funcional actual — EL CONTRATO

Levantado el 31-jul sobre el código. **Nada de lo listado aquí desaparece sin decisión explícita.**

### 1.1 Pantallas

| Pantalla | Ruta / Guard | Quién la ve | Fuente de datos |
|---|---|---|---|
| **Pagos del club** | `/home/payments` · `FinancialRouteGuard` | owner, admin, contador, super admin, impersonación. **NO** entrenador/padre/jugador | `GET payments` + `GET payment-stats` (este último por `useEffect`, no React Query) |
| **Mis pagos** (familias) | `/home/my-payments` · `PlayerOrParentGuard` | jugador y padre. `/home/payment-history` redirige aquí | **No usa los endpoints de pagos**: usa `fetchParentDashboard()`/`fetchPlayerDashboard()` + `payment-methods` |

Todo el grupo cae si el plan no incluye `module.access:payments`.

**4 pestañas** en la pantalla admin: *Todos los pagos* · *Por verificar* (installments PEV, badge contador, solo recarga al entrar) · *Cobranza* (`CollectionCyclePanel`) · *Acuerdos de pago*.
Query param `?tab=verification` abre directo la segunda.

**Superficies secundarias que muestran pagos:** dashboards de owner/padre/jugador, `PaymentVerificationDecisionCard` (Home), `/home/collections`, `PlayerDebtsModal`, y `PlayerPaymentsSummaryDialog` en la ficha del jugador — **único punto donde se CREA un acuerdo de pago**.

### 1.2 Filtros

**Cableados (10):**

| Filtro | Campo | Dónde | Nota |
|---|---|---|---|
| Mes · Año | `whereMonth/Year('created_at')` | **Servidor** | Default = mes y año actuales. "Limpiar filtros" NO los resetea |
| Facturación | `installments.external_invoice_code` | Servidor | Solo se renderiza si `club.invoicing_enabled` |
| # Pago | `consecutive_number` (substring) | Cliente | |
| Buscar | cobro, jugador (nombre/email/documento), método, deporte | Cliente | Normaliza acentos; exige que **todos** los términos aparezcan |
| Cobros | `charge.id` | Cliente | Los borrados salen con sufijo "(Eliminado)" |
| Estado | `payment.status` | Cliente | El hook soporta multi-select; **la UI solo deja elegir uno** |
| Método de pago | `payment_method.id` | Cliente | Solo si hay >1 método. Mismo degradado |
| Desde · Hasta | `payment_date` | Cliente | **Descarta los pagos sin `payment_date`** |

**Código muerto (existe, no llega al usuario):**
- **Filtro por categoría del jugador** — lógica completa en el hook, sin UI. Viene del commit `07fff88 "Add category filter to payments page"`
- Filtro de factura multi-select en cliente (duplica el de servidor)
- `paymentCounts.byCategory/byStatus/byMethod` — se calculan en cada render, nadie los consume
- `advancedFilterCount`, `handleClearAdvancedFilters`
- **`PaymentFiltersSheet.jsx` (322 líneas)** — ningún archivo lo importa. Es la UI de filtros avanzados con chips y contadores, abandonada al pasar a la barra actual

**Filtros de la pantalla de familias:** búsqueda · hijo (solo padres) · estado · tarjetas-stat clicables · chips por hijo con total adeudado.

### 1.3 Acciones sobre un pago

Ver detalle · **aprobar comprobante** (rápido desde la card, si PEV) · registrar pago · **cancelar** · **eliminar** · ver recibo PDF en modal · descargar recibo · reenviar recibo por email · **reembolsar** · cambiar cobro · **cambiar periodo de facturación** · aplicar descuento · quitar descuento · corregir monto del abono (PEV) · corrección administrativa (COM/APR) · rechazar comprobante · reemplazar comprobante · subir comprobante · **vincular comprobante de otro pago** · guardar código de factura externa (solo si `club.uses_accounting_software`) · **ajuste por incapacidad médica** (descuento/exoneración) · cargar nuevo comprobante tras rechazo · zoom del comprobante.

**Acciones masivas:** exportar · marcar como pagado · cancelar · eliminar · seleccionar todos.

⚠️ **Hay DOS barras de acciones masivas simultáneas** con permisos distintos: la inline azul **no comprueba permiso** para "marcar pagado" ni "cancelar"; la sticky oscura sí exige `canCreate`/`canDelete`.

**Acuerdos:** listar · ver detalle · anular (motivo obligatorio 3-500). **Crear NO está en el módulo de pagos** — solo desde la ficha del jugador.

**Familias:** reportar pago/subir comprobante · ver comprobante · descargar recibo · ver detalle · reenviar tras rechazo. **Nunca aprueban, rechazan, cancelan, borran ni reembolsan**; todo entra como `PEV`.

### 1.4 Datos que se muestran

**Card:** nº consecutivo (`#0001`) · jugador · nombre del cobro (limpio de `_deleted_<ts>`) · **mes derivado del `due_date`** (solo si `frequency_id ≠ 1`) · badge de descuento · fecha (`payment_date → paid_at → due_date → created_at`, con prefijo "Vence") · badge "Vencido Nd" · nota de incapacidad · Total · Total tachado si hay descuento · Saldo · badges de recibo con descargar/reenviar · badge de estado · barra de acento por estado.

**Cabecera (4 tarjetas):** Total pagos (conteo **cliente**) · Recaudado (**backend, por `reviewed_at`**) · Por Cobrar (**backend, deuda acumulada sin filtro de fecha**) · Pendiente + badge "N por verificar".
⚠️ Recaudado y Por Cobrar **no respetan los filtros de cliente**: filtrar por jugador o cobro cambia "Total pagos" pero no los montos.

**Detalle:** header · información (jugador + documento, **acudiente con `tel:`/`mailto:`**, cobro editable, sesiones/mes si es per-attendance, método, periodo editable, vencimiento + días de mora, referencia de transacción, nota) · financiero (Total/Pagado/Saldo, badges de descuento y mora) · incapacidad · comprobante (imagen o PDF embebido) · historial de abonos · rechazo con motivo · comprobantes (recibo, factura externa) · reembolso.

**Export Excel** (12 columnas fijas, `pagos_<fecha>.xlsx`): consecutivo · jugador · email del jugador · **email de contacto** (≥18 → el suyo; si no, el del contacto primario) · documento · concepto + mes · método · monto · pagado · saldo · fecha de pago · estado.
⚠️ `AGR`, `OVD` y `EXO` **no están en el mapa de traducción** → salen como código crudo. Los encabezados mezclan inglés fijo y claves traducidas: al cambiar idioma cambian solo 5 de 12.

### 1.5 Estados

| Código | Etiqueta | Color | Habilita | Bloquea |
|---|---|---|---|---|
| `PEN` | Pendiente | naranja | registrar, cancelar, eliminar, cambiar cobro, descuento | aprobar, reembolsar |
| `PEV` | Por verificar | amarillo | aprobar, rechazar, cancelar, eliminar, corregir monto, reemplazar/vincular comprobante | registrar, descuento, reembolso |
| `PAR` | Parcial | azul | agregar abono, cancelar, eliminar, reembolsar, descuento | aprobar |
| `COM` / `APR` | Completado / Aprobado | verde | recibo, corrección administrativa, reembolsar | cancelar, eliminar, cambiar cobro, descuento |
| `CXL` | Cancelado | gris | nada | todo |
| `REJ` | Rechazado | rojo | cargar nuevo comprobante, eliminar | — |
| `OVD` | Vencido | rojo | bulk-cancel/delete/mark-paid, cambiar cobro, descuento | ⚠️ `isPaymentPending('OVD')` es **false** en el front → **la card de un vencido no muestra registrar-pago ni cancelar** |
| `AGR` | Acordado | índigo | ver | registrar, eliminar |
| `EXO` | Exento | verde tenue | ver | no es deuda ni ingreso |

Estado desconocido → cae a `PEN`. Agrupaciones del filtro: `COM` trae `COM`+`APR`; `PEN` trae `PEN`+`OVD`.
**Para familias** se simplifica a 5 (pending/verification/completed/rejected/exempt); `AGR` se mapea a **completed**.

### 1.6 Endpoints

31 endpoints bajo `/api/pla_club_teams/{club}`, todos con `module.access:payments`. Los principales:
`GET|POST payments` · `GET|PUT|DELETE payments/{id}` · `cancel` · `change-charge` · `discount` ·
`incapacity-adjustment` · `billing-period` · `refund` · `validate-linked` · `calculate-amount` ·
`bulk-cancel` · `bulk-mark-paid` · `bulk-delete` · `payments/{id}/installments` · `payment-stats` ·
`pending-verification` · `upload-proof` · installments: `approve`, `reject`, `correct`,
`receipt/download|view|resend`, `proof-image`, `replace-proof`, `external-invoice` ·
`payment-agreements` (index/store/show/cancel) · `agreement-eligible-payments`.

**Permisos por rol** (`ROLE_BASE_PERMISSIONS`): owner view/create/update/delete · admin view/create/update (**sin delete**) · contador view/create/update/delete · jugador view · padre view/create · **entrenador nada**.

⚠️ **La acción `verify` NO existe en `ROLE_BASE_PERMISSIONS`** — solo en `ClubRolePermission`. Si `/role-permissions/my-permissions` falla, el fallback global no la tiene → **admin y contador pierden los botones Aprobar/Rechazar** aunque el backend se los permita. Y `ClubRolePermission` marca `delete:false` para el contador, contradiciendo `assertCanDeletePayments` que sí se lo permite.

⚠️ `PUT/PATCH payments/{id}` **no llama a `assertCanManagePayments`**.

### 1.7 Integraciones — 80 archivos del backend tocan pagos

**Escriben:** `GenerateMonthlyPayments` · `ApplyLateFees` · `AttendancePaymentService` ·
`PaymentAgreementService` · `IncapacityAdjustmentService` · `CollectionCycleService` ·
`PublicEnrollmentController` · **`WriteTools` y `PaymentAgreementTools` (el agente IA)** ·
observers de activación y de jugador · 9 comandos de mantenimiento.

**Leen:** reportes financieros · dashboards por rol (**y son la fuente de `MyPaymentsPage`**) ·
tools del chat IA (`ReadTools`, `FamilyTools`, `PlayerTools`, `SuperAdminTools`) · brief diario ·
recordatorios autónomos · `PaymentStatsService` (cabecera **y** `monthlyTrend`/`debtorsSummary`
que consumen `MonthCloseService` y el asistente) · export del club · auditoría.

**Correos/PDF:** `PaymentReceiptService` (Gotenberg) · `PaymentConfirmationMail`,
`InstallmentApprovedMail`, `PaymentRejectedMail`, `PaymentProofUploadedMail`, `ChargeCancelledMail` ·
recordatorios y reporte semanal.

**Tiempo real:** `PaymentRegistered` → canal `club.{clubId}.payments`.

**Stripe NO toca este flujo.** Los pagos de club son **manuales con comprobante**.

### 1.8 Comportamientos no obvios — lo que un rediseño rompe sin querer

🔴 **Si el club tiene 0 categorías, la página de pagos se sustituye entera** por un cartel de "crea categorías". No se ve ni un pago aunque haya dinero registrado.

**Defaults y filtros implícitos**
1. Arranca siempre con mes y año actuales; "Limpiar filtros" NO los resetea (son estados distintos, y `onClearInvoiceFilters` llega como `_onClearInvoiceFilters` sin usar)
2. El backend **excluye siempre los `CXL`**; el front nunca manda `include_cancelled`
3. Filtra por `created_at`; cambiar el "Periodo" **reescribe `created_at`** y mueve el pago de mes
4. **Sin paginación**: `->get()` de todos los pagos del mes; todo lo demás se filtra en cliente
5. Orden fijo `consecutive_number desc`; no hay ordenación por columnas

**Cálculos implícitos**
6. `calculatePaymentAmount` tiene 3 fallbacks: `amount_due` → `remaining+paid` → `charge.amount`. **El mismo pago muestra montos distintos según qué campos traiga el endpoint**
7. `amount_is_manual` protege el monto fijado a mano… pero **cambiar de cobro lo pone a `false`** y pierde el valor
8. Los descuentos se calculan en servidor y se escriben en `comments` como **texto plano**
9. `due_date` manual sale de `charge.due_day` acotado al último día del mes
10. **`ensureDatetime`: una fecha a medianoche exacta recibe la hora actual.** Un pago fechado ayer a las 00:00 queda con la hora de hoy
11. El consecutivo **reutiliza el hueco si borras el último** (es `max()+1`)

**Efectos secundarios**
12. Aprobar dispara **PDF por email + push + in-app**, fuera de la transacción, fallos solo logueados
13. Cancelar manda `ChargeCancelledMail` al jugador y padres
14. Cancelar, eliminar, reembolsar y corregir **anexan texto al campo `comments`** (`[CANCELADO]…`, `[REEMBOLSO]…`). **El historial de un pago vive en un campo de texto libre**
15. `bulk-mark-paid` crea un installment `APR` por el saldo completo con `payment_method:'cash'` **hardcodeado**, y **dispara la notificación de pago confirmado a cada familia**
16. Un reembolso total pone `CXL` → el pago **desaparece de la lista** (punto 2)
17. Aprobar con `new_charge_id` **no recalcula descuentos** (escribe `amount_due = newCharge.amount` crudo); `change-charge` sí usa `ChargeService`. **Dos caminos, dos resultados**

**Formatos**
18. Todo importe con locale `'es-CO'` **hardcodeado**, sea cual sea la moneda del club
19. Meses con `date-fns` locale `es` fijo
20. `RegisterPaymentDialog` manda `currency:'COP'` **hardcodeado**
21. El regex de `_deleted_<ts>` está **duplicado inline en 3 sitios**
22. El export se llama `pagos_*.xlsx` en español sea cual sea el idioma

**Selección**
23. `rowSelection` se indexa por **posición**; cambiar un filtro con pagos seleccionados hace que la selección apunte a **otros pagos**. No se limpia al filtrar

**Stats**
24. `payment-stats` ignora los filtros de cliente; acepta `charge_id` pero **el front nunca lo manda**
25. "Recaudado" se contabiliza por `reviewed_at` (aprobación), no por la fecha en que la familia dice que pagó
26. "Por Cobrar" es deuda acumulada **sin filtro de fecha**: no cuadra con el mes de arriba
27. `total_billed` y `collection_rate` **excluyen `AGR` y `EXO`** a propósito
28. Si `payment-stats` falla, las tarjetas **caen en silencio** al cálculo de cliente, que da otros números

**Otros**
29. `Log::info` de SQL y todos los IDs en cada carga de la lista, activo en producción
30. `TooltipProvider` anidado
31. `console.log` de depuración activos en `RegisterPaymentDialog`

### 1.9 Código muerto confirmado (~1.465 líneas)

| Archivo | Líneas |
|---|---|
| `PaymentFiltersSheet.jsx` | 322 |
| `PlayerPaymentsManager.jsx` | 360 |
| `PaymentDetailModal.jsx` (raíz; la viva es `detail/`) | ~400 |
| `PaymentReceiptDialog.jsx` + `PaymentReceipt.jsx` | 153+ |
| `StripeCheckout.jsx` | 230 |

**Muerto a nivel de flujo:** `handleViewPaymentDetail` (68 líneas) nunca se llama → el
`PaymentVerificationModal` montado en la página **nunca se abre desde ahí** (sí desde dashboards y
Cobranza) · `editingInvoiceId`/`invoiceInputValue`/`savingInvoice` sin consumidor · props
`_onClearInvoiceFilters` y `_hasActiveInvoiceFilters` ignoradas.

### 1.10 Zonas NO cubiertas por este inventario

Declaradas explícitamente por el agente: interior de `PaymentVerificationModal.jsx` (~1.500 líneas,
usado por dashboards y Cobranza) · `CollectionCyclePanel` y su ciclo (módulo propio en
`/home/collections`) · interior de `IncapacityAdjustmentDialog.jsx` (426 líneas) e
`InstallmentTimeline.jsx` · `uploadProof` del backend (líneas 159-340) · el wizard de creación de
acuerdos. **Todo el inventario sale del código, sin consultar producción.**

---

## 2. Decisiones bloqueantes — antes de escribir código

Ninguna requiere código. Las cuatro condicionan lo demás.

### B1 · ¿Qué es "anulado": `status='CXL'` o `is_canceled`?

Hoy existen los dos y **discrepan**. Reconciliación medida en producción:

```
vivo · CXL · is_canceled=1  →  114
vivo · CXL · is_canceled=0  →   27   ← huérfanos (26 del club 14, 1 del 24)
borrado · CXL               →   31
                              ─────
                                172
is_canceled=1 con status ≠ CXL:  0
```

**Consecuencia con dinero real:** `getTotalBilled` excluye por `status`, `getReceivedAmount` excluye
por `is_canceled`. Cuando discrepan, el pago sale de un lado de la ecuación y no del otro →
**recaudado puede superar a facturado**. Dos gemelos del club 14 (#2110 y #2114), ambos `CXL`, ambos
con abono `APR` de $60.000 realmente pagado: el primero coherente, el segundo cuenta como recaudado
sin estar facturado. **El invariante I2 del spec de cobros ya está roto en $60.000.**

**Culpable localizado:** `PlaClubTeamChargeController.php:373-376` — desactivar un cobro hace un
`update()` masivo que escribe `status='CXL'` **sin tocar `is_canceled`**. Es el único de los 6 puntos
de cancelación que no escribe ambos campos. Encaja con que 26 de 27 huérfanos sean del mismo club.

**Opciones:** (a) `is_canceled` desaparece y manda `status` — recomendada; (b) se garantiza por modelo
con `cancelPayment()` como único camino. Mientras coexistan, cada reporte elige un campo y ninguno
parece equivocado.

### ✅ DECIDIDO (3-ago): manda `status`, el booleano desaparece — en tres tiempos

No de golpe: hay **79 referencias en backend** (12 escriben, 60 leen) y 1 en frontend. Quitar la
columna sería tocar 60 lecturas en un commit, justo el cambio grandote que rompe producción.

1. ✅ **Hecho.** Hook `saving` en `PlaClubTeamPayment`: `is_canceled = ($status === 'CXL')`. Un solo
   sitio; a partir de ahí es imposible descuadrarlas escriba quien escriba. Más la migración
   `2026_08_04_000100` que cuadra las heredadas. Verificado antes: las 12 escrituras de
   `is_canceled => true` ya ponían `status => CXL`, y las de `false` ponen `EXO`/`PEN` — el hook no
   cambia el comportamiento de ninguna.
2. ⏳ Dejar de persistirlo (accessor derivado). Las 60 lecturas siguen sin tocarse.
3. ⏳ Borrar la columna cuando ya nadie la consulte desde SQL crudo.

> 🔴 **La consecuencia "con dinero real" era menor de lo escrito.** Medido el 3-ago: las 27 filas
> huérfanas suman **$0 en `amount_paid`**. No distorsionan el recaudado de nadie — es una
> incoherencia entre consultas, no una descuadre contable. Y el culpable
> (`PlaClubTeamChargeController`) **ya escribe ambas marcas**: no crecían.
>
> El caso de los gemelos #2110/#2114 sigue siendo cierto y es el que motivó la regla; lo que no
> aguanta es generalizarlo a las 27.

**Efecto secundario:** `DashboardDebtorsConsistencyTest` creaba un pago `PEN` + `is_canceled=true`
a la vez. Esa combinación ya no es representable, y en producción nunca existió (0 filas). Fixture
actualizado a `CXL`; las aserciones no cambiaron.

### B2 · La mora está muerta y encenderla sola es peligroso

`ApplyLateFees.php:104` hace `(int) $today->diffInDays($payment->due_date)`. En Carbon 3 el diff
lleva signo: con `due_date` pasado sale **negativo** y `:106` lo descarta. Medido: **0 pagos con
`late_fee_applied_at` en toda la historia de producción**, frente a **586 `PEN` vencidos hoy**.

Mismo patrón ya documentado en el repo (`SimpleDashboardController:990`); éste quedó sin arreglar.

~~**Arreglar solo el diff enciende la mora sobre 586 pagos vencidos de golpe.**~~

> 🔴 **Esa alarma era FALSA. Corregido el 3-ago tras medirlo.**
>
> El job filtra `late_fee_enabled` y `status='ACT'` (`ApplyLateFees:52-53`). En producción
> **solo 2 clubes tienen la mora activada** — el 6 ("Cuenta Desactivada") y el 25 (Lions
> Ibagué, `fixed $3.000` tras 15 días) — y **ninguno de los dos tiene un solo cobro vencido**.
> Los 709 vencidos de hoy ($71M) pertenecen a clubes **sin** mora activada: el job ni los mira.
>
> Impacto retroactivo real de arreglar el diff: **0 pagos**. Se arregló solo (`R2` ya estaba
> puesto de antes). Lions Ibagué llevaba meses pagando por una función que nunca corrió.
>
> **Lección de método:** el spec dio por hecho el alcance a partir del conteo de vencidos, sin
> mirar el filtro del job que los consume. Antes de dar por buena una alarma, medir el alcance
> real de la consulta que la produce.

El guard R2 (*cobro generado con fecha pasada nace exento de mora*) sigue siendo necesario para el
backfill de ABA: sin él, cada fila repuesta nace multada.

Bonus del mismo job (`:136`, `:159-165`): usa `charge->amount` como base y reescribe
`remaining_amount = charge->amount − pagado + mora`, **resucitando el importe sin descuento**. Un
becado al 100% pasaría de $0 a cuota completa con recargo. Viola R7 y R10 a la vez.

### B3 · Las claves foráneas borran en cascada

```php
// 2024_08_26_224809_…payments_table.php:44-45
$table->foreign('charge_id')->references('id')->on('pla_club_teams_charges')->onDelete('cascade');
$table->foreign('player_id')->references('id')->on('pla_club_teams_players')->onDelete('cascade');
```

Un `forceDelete()` de cobro o jugador **arrasa sus pagos en MySQL**, saltándose SoftDeletes, la
auditoría y toda validación del código. Hace de la regla V3 del spec de cobros (*"un cobro que generó
pagos nunca se elimina"*) una promesa que la base puede romper sola.

**Decisión (Miguel, 31-jul): no debería pasar.** Pasa a `restrict`: la BD impide borrar un cobro con
pagos. Misma regla, garantizada abajo, donde nadie la salta.

### B4 · R3 está mal escrita en el spec de cobros

Escribimos *"un pago con `amount_paid > 0` jamás se cancela automáticamente"*. **El código pregunta
por abonos `APR`**, no por `amount_paid` (`:1424`, `:1592`, `:1765`, `PaymentAgreementService:200-213`).
No son lo mismo, y hay prueba en producción: el pago **#4072** tenía `amount_paid = 60.000` y **cero
installments**, así que pasó todos los guards y se borró.

→ Guard único compartido (`$payment->hasMoney()`) que mire `amount_paid`. Va también en `destroy()`
individual (`:1367-1378`), que hoy ni siquiera tiene el guard de abonos que sí tiene `bulkDelete`.

---

## 3. El caso #4072 — por qué borrar no es el enemigo, y qué lo sustituye

Investigado a fondo porque parecía dinero perdido. **No lo era.** Ficha completa de Juan Diego (club 14):

```
mar · Mensualidad              $60.000  pagado ✓
abr · Mensualidad              $60.000  pagado ✓
may · Mensualidad              $60.000  pagado ✓
jun · Mensualidad              $60.000  pagado ✓
jul · Mensualidad Competencia  $80.000  pagó $60.000  → BORRADO 7-jul
jul · Mensualidad              $60.000  pagado ✓        ← lo reemplaza, mismo día
jul · Mensualidad Competencia  $80.000  sin pagar     → BORRADO 15-jul
```

Le generaron el cobro equivocado ($80.000 en vez de los $60.000 que venía pagando). El club **detectó
el error, borró el cobro malo y creó el correcto**. Corrigió bien. El dinero está en el pago #4604.

**Conclusión que ordena todo este spec:**

1. **El club borrando lo suyo es legítimo.** Los borrados sí quedan auditados (`Auditable` registra
   quién y cuándo: usuario 6 → 569 borrados, usuario 442 → 145…). Lo que falta no es el *quién*
   sino el **porqué**: el `reason` solo va a `Log::info`, no a la BD.
2. **Borrar es hoy la única herramienta para deshacer.** Caso real que planteó Miguel: dispersas un
   cobro por error a ~200 jugadores. Cancelar en bloque con motivo resuelve lo mismo, conserva los
   consecutivos y deja la explicación al lado.
3. **Pero cancelar hoy NO sirve como sustituto**, porque los cancelados **son invisibles**: el backend
   los excluye siempre de la respuesta (`:182-184`) y el filtro "Cancelado" del desplegable devuelve
   cero. El club cancela y no los vuelve a ver — ni para revisar ni para revertir.

> **ORDEN OBLIGATORIO: primero hacer visibles los cancelados, después quitar el borrado.**
> Al revés deja al club sin salida y el rediseño se vuelve un estorbo.

### ✅ Ejecutado en ese orden (jul 31 – ago 3)

**Paso 2 — anulados visibles** (`e507eb1` backend + `917ee33f` frontend, en prod).
Anular acepta ya pagos con dinero (motivo obligatorio), se guardan `canceled_at` /
`canceled_by` / `cancellation_reason` en columnas propias, y el filtro "Cancelado"
los devuelve. La vista por defecto no cambió: sigue excluyéndolos.

**Paso 3 — borrado retirado.** Se pudo retirar porque **no aportaba nada**:

| | borrar | anular |
|---|---|---|
| estados que aceptaba (masivo) | PEN, PEV, PAR, OVD | los mismos |
| abonos aprobados | rechazaba | rechazaba |
| pago con dinero (individual) | ❌ bloqueado | ✅ con motivo |
| deja la fila visible | ❌ la escondía | ✅ |

- `destroy` y `bulk-delete` devuelven **410** con el motivo y `use_instead: cancel`.
  Las rutas se conservan: un navegador con la versión vieja cacheada recibe una
  explicación, no un 404 mudo. El permiso se evalúa **antes**, así que a quien nunca
  pudo borrar le sigue saliendo 403.
- **La anulación masiva recoge el hueco**: acepta pagos con dinero, exige motivo
  (mín. 3 caracteres), informa cuántos del lote ya tenían plata y por cuánto, y avisa
  **solo a esas familias**. Sin esto, retirar el borrado dejaba al club atascado justo
  en el caso que lo motivó — un cobro disparado por error a cientos de jugadores con
  parte ya pagada.
- **Bug de permisos corregido de paso:** anular se gateaba en el front por
  `payments.delete` (solo owner y contador) mientras el backend lo permite a
  owner/admin/contador. El **admin no veía el botón**; al quitar el borrado se habría
  quedado sin ninguna salida. Ahora va por `payments.update`.
- El botón desaparece de las 4 puertas vivas (tarjeta, tabla, ficha de pago, masivo) y
  se retiran 2 componentes muertos que aún lo tenían cableado.
- 10 tests nuevos.

**Sobre los consecutivos:** club 4 tiene 865 filas con máximo 1817 → 952 números perdidos en 144
rangos, empezando en el #29 con el club arrancando el 20-ene. Es la operación normal borrando desde
el primer mes, no un desastre puntual. Solo 20 son soft-deletes recuperables.

---

## 4. Cambios propuestos

*(cada uno se referenciará contra el inventario de §1 cuando esté listo)*

### 4.1 Urgentes — ✅ LOS CUATRO HECHOS Y EN PROD (verificado 3-ago contra `origin/main`)

| # | Estado | Dónde quedó |
|---|---|---|
| U1 | ✅ | La selección va por **id de pago** (`visiblePaymentsById`), con limpieza al filtrar/refetch. El toast usa el conteo real del backend |
| U2 | ✅ | `paymentCalculations.js:22` → `amount_due != null && amount_due !== ''`. Un becado del 100% ya no cae a `charge.amount` |
| U3 | ✅ | `AgreementsTab.jsx` lee `player.user` con fallback (`playerName()`), documentado en el propio archivo |
| U4 | ✅ | Anulados visibles (`e507eb1` + `917ee33f`), paso previo al retiro del borrado |

<details><summary>Detalle original del hallazgo (conservado)</summary>

| # | Qué | Evidencia | Toca |
|---|---|---|---|
| U1 | **Selección masiva por índice de fila, no por id.** `rowSelection` guarda posiciones (`usePaymentBulkActions.js:33-45`); nada la limpia al cambiar filtro, al refetch (`refetchOnMount:'always'`) ni al aprobar. Seleccionar 5 → cambiar filtro → "Cancelar" **cancela otros cinco**. Y el toast usa `cancelled_count \|\| pendingPayments.length`: si el backend rechaza todo, anuncia éxito igual | — | `PaymentsTable.jsx:83`, `usePaymentBulkActions.js:33-45`, `:268`, `:337` |
| U2 | **Becados del 100% pintados como morosos vencidos.** `calculatePaymentAmount` descarta `amount_due` cuando vale 0 y cae a `charge.amount`: card con Total $140.000, saldo $0, badge "Pendiente" + "Vencido Nd" y botón "Marcar como pagado" | 11 pagos, Jeronimo y Wilmar (club 4), descuento 14 al 100%. Los de jun/jul con `discount_amount=0`: ni el badge de descuento aparece | `helpers/paymentCalculations.js:13-31`, `PaymentCard.jsx:89-90`, `:187-192` |
| U3 | **Columna "Jugador" vacía en la lista de acuerdos.** Front lee `agreement.player.name`, backend devuelve `player.user.name`. El `?? ''` se traga el fallo sin error de consola | Probable causa de los fallos de QA que Miguel detectó y no detalló | `AgreementsTab.jsx:73` vs `PlaClubTeamPaymentAgreementController.php:24` |
| U4 | **Hacer visibles los cancelados** (prerequisito de quitar el borrado, ver §3) | 172 `CXL` invisibles | `paymentStatusConfig.js:416-426`, backend `:182-184` |

</details>

### 4.2 Alineación con Cobros v2

| # | Qué | Por qué |
|---|---|---|
| A1 | El filtro mes/año pasa **directo** a `covers_from`/`covers_to` — **NO** por `due_date` | Ver la nota de abajo. Hoy el "periodo" de un pago es `created_at`, y `updateBillingPeriod` lo **reescribe** (`timestamps=false`, sin auditoría). Mover el periodo mueve el pago de mes en toda la página |
| A2 | La card muestra **concepto** y **temporada** | Con versionado, "Mensualidad Tipo 2 · 2026" y "· 2027" se ven **idénticas**: nombre + mes sin año. El desplegable de cobros etiqueta por `name` → dos entradas de texto igual, distinguibles solo por un id que el usuario no ve |
| A3 | Sustituir el periodo inferido por `covers_from/to` | Hoy la card deduce el mes del `due_date` (`frequency_id !== 1`): para un trimestral escribe **un solo mes** y engaña |
| A4 | Filtros nuevos: concepto, modalidad del jugador, periodo cubierto, temporada | Hoy se filtra por *instancia* de cobro (`charge_id`), no por *tipo* |
| A5 | Rotular cada tile de la cabecera con su base y su alcance | Mezcla caja del mes (Recaudado), **devengo acumulado de toda la historia sin filtro** (Por Cobrar) y conteo de la lista filtrada en cliente (Total pagos). R8 y R11 |
| A6 | Concepto propio `agreement` para el cobro sintético `__payment_agreement__` | Excluido de cobertura, de R1 y del catálogo; las cuotas heredan `covers_from/to` del min/max de sus covered. Hoy sale como un concepto más en `income-by-charge` y **se le muestra a las familias** en correos y portal |

> **Sobre A1 — decidido el 3-ago: no hay escala intermedia en `due_date`.**
>
> El ancla correcta es **el periodo que cubre el cobro**, porque es lo único que significa lo mismo
> para el club, la contadora y el padre. `created_at` es un accidente administrativo: ABA genera las
> mensualidades el 28 del mes anterior, así que **todo julio cae bajo junio**, y cualquier corrección
> posterior aterriza en el mes de la corrección.
>
> `due_date` es mejor pero tampoco es el periodo: un club que vence el 10 del mes siguiente vería
> julio bajo agosto.
>
> Pasar primero a `due_date` movería los números del club **dos veces en dos meses**, y una
> administradora que cierra julio no podría reproducir sus totales ni una vez. Se cambia **una sola
> vez**, cuando la Fase 1 de cobros entregue `covers_from`/`covers_to`.
>
> Lo único que se puede hacer ya, porque no mueve ninguna cifra: **rotular el filtro en la pantalla**
> para que nadie crea que ve "los cobros de julio" cuando ve "lo registrado en julio".

### 4.3 Consultas que miden lo mismo distinto

Lo que los invariantes I1-I7 vienen a prohibir. **Requisito: una consulta canónica única.**

- **"Recaudado" tiene 3 definiciones vivas**: `PaymentStatsService` (por `reviewed_at`, excluye
  anulados) · `FinancialReportController::incomeByCharge` (por `paid_at`, **no** excluye) ·
  `PlaClubTeamController` (por `payment_date`). Efecto medible: en Reportes Financieros el total por
  concepto **no cuadra con el ingreso del mes de la misma pantalla**.
- ~~**"Deudores" dos veces**~~ ✅ **ARREGLADO 3-ago.** Era peor de lo escrito: no eran dos sitios
  sino **cinco**, y el peor no era una cifra.

  | Sitio | Qué provocaba |
  |---|---|
  | `CollectionCycleService::findEligibleDebtors:458` | **El ciclo de cobranza le reclamaba a las familias cobros que el club ya había borrado** |
  | `DashboardController:439` | El padre veía cobros borrados como pendientes en su panel |
  | `DashboardController:372` | Lo mismo en el panel del jugador |
  | `FinancialReportController:232` | El ingreso por concepto sumaba abonos de pagos borrados |
  | `PaymentStatsService::debtorsSummary:256` | La lista de deudores |

  **La trampa que los escondía:** dos de ellos ya tenían `whereNull('pl.deleted_at')` — que filtra
  el borrado del **jugador**, no el del **pago**. A simple vista la consulta parecía correcta.

  Medido en producción antes del fix: **45 jugadores, $4.355.000** (Corbeaux $2,6M · ABA $1,37M ·
  Siempre Fuertes $365.000). No los $10,4M del texto original.

  Cubierto por `DeletedPaymentsNeverCountTest`, incluido un test que falla si la cobranza vuelve a
  perseguir un cobro borrado. Los 17 sitios equivalentes del asistente se arreglaron en `0840e5a`.

  Quedan **sin filtrar a propósito**: diagnósticos del sistema, gestión de roles y los comandos de
  desarrollo (`ResetClubPayments`, `SetupRealisticData`) — ahí sí se quieren contar todas las filas.
- **"El mes de un pago" tres veces**: `index` por `created_at` · el generador por `due_date` · las
  stats por `reviewed_at`.
- **`discount_amount`**: `ChargeService` y el dispatch lo guardan; **el cron no**. `updateDiscount`
  usa `amount_due + discount_amount` como base → sobre un pago del cron la base sale mal.
- **Consecutivo: 5 generadores, 4 sin lock correcto.** Solo `GenerateMonthlyPayments` reintenta ante
  `Duplicate entry`. `PlaTournamentController:3543` **se traga la excepción**: la cuota del torneo no
  se crea y solo queda un `Log::warning`.

### 4.4 Riesgos de acuerdos de pago

**0 acuerdos en producción** — nadie lo usa aún, así que no hay daño acumulado.

> ⚠️ **TRAMPA para quien implemente el reporte de cobertura (§8.1 del spec de cobros):**
> un pago cubierto queda en `AGR`, **fuera de `DEBT_STATUSES` pero dentro de `ACTIVE_STATUSES`**.
> La cobertura DEBE calcularse con **`ACTIVE_STATUSES`**. La mayoría de consultas del repo usan
> `DEBT_STATUSES` (solo 6 sitios usan la otra): **quien copie el patrón dominante marcará como
> desatendido a todo jugador con acuerdo.**
>
> Matiz contraintuitivo: el acuerdo salda deuda **pasada**, no es cobertura futura. Un jugador con
> acuerdo vigente **debe** aparecer como no-cubierto si nadie le genera la cuota del mes actual.

- **Crear un acuerdo sobre un pago parcial rompe I2 por diseño.** Fixture del propio test de la casa:
  cobro 100.000 con abono APR 40.000 + acuerdo por 60.000 → `facturado 60.000 ≠ recaudado 40.000 +
  por_cobrar 60.000`. Antes del acuerdo el invariante se cumplía. **7 pagos parciales con $525.000
  encima** esperando esta decisión. Opciones: (a) el covered aporta su `amount_paid` al facturado —
  recomendada; (b) prohibir acuerdos sobre parciales; (c) declarar excepción.
- **`app:cancel-hidden-charge-payments` sin `--charge` vacía todos los acuerdos activos del club**
  (itera `is_hidden=1` y el sintético lo es): cuotas canceladas, covered en `AGR`, deuda desaparecida
  y el acuerdo sigue `active`. Fuera del scheduler, pero 21 cobros hidden en prod.
- **La condonación no cae en ningún cubo**: ni facturado, ni cancelado, ni recaudado. El accessor
  `difference` existe y nadie lo lee.
- **§7.3 del spec de cobros se lleva por delante las cuotas del acuerdo** (son pagos `PEN` con
  `due_date` futuro). El filtro debe ser `concept='training_fee' AND agreement_role IS NULL`.
- **`syntheticCharge()` busca solo por nombre** (`:42-45`): con unicidad `(club_id,name,season)`, una
  segunda temporada puede duplicarlo y `->first()` elegiría uno al azar.

### 4.5 Deuda técnica encontrada de paso

| Grav. | Qué | Dónde |
|---|---|---|
| 🟠 | `update()` **resucita cancelados**: recalcula el estado sin mirar el previo. Un `CXL` vuelve a la vida con un PATCH | `:995-1045` |
| 🟠 | `consecutive_number` **editable por el cliente**; sin él en el PATCH queda **null** | `:1035` |
| 🟠 | `bulkMarkPaid` manda `payment_method:'cash'` **fijo**: todo pago masivo entra al libro como efectivo | `usePaymentBulkActions.js:395` |
| 🟠 | UI ofrece cancelar **parciales**; el backend los frena y devuelve `errors[]` que **el front nunca lee** | `usePaymentBulkActions.js:232-234` vs backend `:1594-1603` |
| 🟠 | Permisos desalineados en "cambiar periodo": front pide `payments.update`, backend exige owner/admin → el contador ve el botón y recibe 403 | `usePaymentDetail.js:788` vs `:1067-1077` |
| 🟠 | Cambiar monto o descuentos de un cobro **recalcula `amount_due` de todos los `PEN`, incluidos meses pasados**, ignorando `amount_is_manual` | `PlaClubTeamChargeController.php:194-212`, `:260-283` |
| 🟠 | Sin paginación: `->get()` de todos los pagos del mes con 7 relaciones; el filtrado real es en cliente | backend `:220` |
| 🟠 | Cancelaciones en lote sin mirar dinero: `PlaClubTeamCharge.php:161-173`, `CancelHiddenChargePendingPayments:139-165`, `WriteTools:1193-1196` (la IA), `AttendancePaymentService:146-158` | varios |
| 🟠 | `getNextConsecutive:36-45` usa `lockForUpdate()` **fuera de transacción**: MySQL suelta el lock al acabar la sentencia | `PlaClubTeamPayment.php:36-45` |
| 🟠 | Cuotas de acuerdo con `payment_date` relleno sin estar pagadas → DSO de acuerdos = 0 siempre | `PaymentAgreementService:166` |
| 🟠 | El acuerdo nunca pasa a `completed` si la última cuota se paga con "marcar pagado masivo" | `:1692-1703` |
| 🟡 | `PaymentFiltersSheet.jsx` (322 líneas) **no está importado en ninguna parte**; el filtro por categoría existe en el hook y es inalcanzable | — |
| 🟡 | i18n en duro (cabecera, barra masiva, "No hay pagos") y `locale:'es'` cableado en card, Excel y selector de periodo | varios |
| 🟡 | `index` loguea SQL, bindings y todos los IDs en cada petición | `:150`, `:215`, `:222` |
| 🟡 | Estado `OVD` **muerto**: nadie lo asigna; "vencido" se deriva de `due_date` | `PlaClubTeamPayment.php:151-154` |

### 4.6 Lo que está bien construido — no tocar sin motivo

`PaymentAgreementService` (guards de anulación, lock, `original_debt_amount`, 8 tests de
no-doble-conteo) · `IncapacityAdjustmentService:208-265` (el código más sólido del módulo) ·
`AGR`/`EXO` fuera de `DEBT_STATUSES` y de `getTotalBilled`, razonado y documentado en el propio
código · el flujo de verificación de comprobantes · recibos y PDF · registrar pago y reembolso.

---

### B5 · La papelera se vacía sola cada mes (descubierto 3-ago)

`payments:clean-deleted --days=30` corre el **día 1 a las 04:00** y hace `forceDelete()`
de todo pago con más de 30 días en la papelera. **No mira `amount_paid`, ni status, ni club.**

La corrida del 1-ago destruyó **72 pagos** (papelera 139 → 67), 31 de ellos `CXL` — por eso
los anulados pasaron de 172 a 141. Los **67 que quedan se purgan el 1-sep**, incluido el
**#4072** ($60.000 recibidos), el único con plata.

Sobrevive el rastro en `audits` (6.153 filas de pagos; **1.153 pagos existen ya solo ahí**),
pero no es consultable desde la app. Y como el `forceDelete()` es masivo por query builder,
**no dispara eventos**: la purga no se audita a sí misma.

> ✅ **RESUELTO el 3-ago (`f7d9da9`, en prod).** No esperamos a P1:
> el comando salió del scheduler, y para uso manual quedó con dos candados —nunca borra un
> pago con `amount_paid > 0`, y no borra nada sin `--execute`—, más `Log::warning` con los ids
> (el `forceDelete()` masivo no dispara eventos). 4 tests; uno falla si vuelve al agendado.
> Los 67 de la papelera, #4072 incluido, están a salvo.
>
> Queda una copia muerta del agendado en `app/Console/Kernel.php.bak`: Laravel 12 no lo carga,
> pero restaurar ese `.bak` lo reviviría.

## 5. Orden propuesto

| Fase | Contenido | Depende de |
|---|---|---|
| **P0** | U1-U4 (urgentes) + B1-B5 decididos | — |
| **P1** | Consulta canónica única + invariantes I1-I7 · quitar borrado (tras U4) **+ apagar `clean-deleted`** · cascada a `restrict` · Carbon + R2 juntos | B1, B2, B3, B5 |
| **P2** | Alineación A1-A6 con el modelo de cobros | Fase 1 y 2 del spec de cobros |
| **P3** | Deuda técnica de §4.5 | — |

## 6. Preguntas abiertas

1. ~~¿`is_canceled` desaparece o se garantiza por modelo? (B1)~~ ✅ **RESUELTA 3-ago:** manda
   `status`; el booleano se deriva en el hook `saving` y la columna se retira en 3 tiempos (ver B1).
2. ¿Qué es "facturado" con un pago parcial dentro de un acuerdo? (§4.4, 3 opciones)
3. ¿La condonación necesita cubo propio en los reportes?
4. ¿Se retira o se acota `app:cancel-hidden-charge-payments`?
5. Acuerdos vs `closed_until`: ¿prohibir, entrar con fecha actual, o snapshot del facturado?

---

## 7. Estado de cierre — 3-ago-2026

**El módulo de pagos queda CERRADO.** No necesita sesión propia: lo que falta o bien se hace
dentro de la Fase 1 de cobros, o bien es deuda técnica sin urgencia.

### Ejecutado y en producción

| Bloque | Commits |
|---|---|
| U1-U4 urgentes (§4.1) | varios, verificados contra `origin/main` |
| Paso 2 · anulados visibles + anular con dinero | `e507eb1` · `917ee33f` |
| Paso 3 · borrado retirado + anulación masiva con dinero | `cc5065c` · `b5f7b2d4` |
| Purga mensual de la papelera desactivada | `f7d9da9` |
| Descuento con comprobante subido (`PEV`) | `75b4e4d` · `7cd6494b` |
| Mora revivida · agente IA · `is_canceled` derivado | `0840e5a` |
| Cobros borrados fuera de la deuda en 5 sitios más (§4.3) | `25b24ea` |

Verificado en producción: 0 descuadres (eran 27) · 0 borrados tras el retiro · el job de mora
procesará 0 pagos · **56 cobros borrados ($4.355.000) fuera de la deuda** · 1664 tests con la
línea base intacta.

### Lo que pasa a la Fase 1 de cobros

- **A1** — el filtro mes/año salta de `created_at` **directo** a `covers_from`/`covers_to`.
  Con él va **rotular el filtro en la pantalla**, que hoy sigue sin decir por qué filtra.
- **A2-A6** — concepto, temporada, periodo cubierto, filtros nuevos, tiles rotulados.
- **El precio por familia** (descubierto el 3-ago en Siempre Fuertes) — ver el bloque
  "📌 Entrada a Fase 1" del spec de cobros.

### Deuda técnica que queda suelta (§4.5, sin urgencia)

Código muerto restante · `bulk-mark-paid` con `payment_method:'cash'` fijo y notificación a cada
familia · el permiso `verify` fuera de `ROLE_BASE_PERMISSIONS` · las 3 definiciones de "recaudado" ·
el filtro por categoría del commit `07fff88` sin cablear · la pantalla desaparece si el club no
tiene categorías.
