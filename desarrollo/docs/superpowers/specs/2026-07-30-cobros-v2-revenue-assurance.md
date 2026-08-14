# Spec: Cobros v2 — Revenue Assurance

## 📍 Progreso de ejecución

Se actualiza al cerrar cada tarea. `⏳` en curso · `✅` hecho y commiteado · `⬜` pendiente ·
`🚫` bloqueado. Nada se pushea a `main` sin visto bueno de Miguel.

### Fase 0 — Bugs inmediatos
| # | Tarea | Rama / worktree | Estado |
|---|---|---|---|
| 0.1 | Cron ignora `excluded_player_ids` | `fix/f0-cron-excluded-players` · `.worktrees/f0-cron` | ✅ 5 tests verdes, commit `ca70afc`, sin push |
| 0.2 | i18n reportes financieros en crudo | `fix/f0-i18n-reportes` · `.worktrees/f0-i18n` | ✅ commits `939a3441` + `7167c339`, lint 0 warnings, sin push |
| 0.3 | Flujo de caja: mes duplicado, falta febrero | `fix/f0-cashflow-meses` · `.worktrees/f0-cashflow` | ✅ 5 tests verdes, commit `57d5570`, sin push |
| 0.4 | Desbordamiento de fecha en **7 sitios** + semestral duplicado + anomalía del brief muerta | `fix/f0-desbordamiento-meses` · `.worktrees/f0-fechas` | ✅ 80 tests, commit `78a9ead` |
| 0.5 | Aislamiento de BD de test por worktree | `fix/f0-aislamiento-bd-test` · `.worktrees/f0-testdb` | ✅ 14 tests, commit `a36a4f8` · degradado hasta aplicar el grant |

**✅ FASE 0 EN PRODUCCIÓN** — backend `c968417`, frontend `7167c339`. Suite completa verde:
**1539 pasados, 0 fallos.**

Hallazgos no previstos que salieron de preguntar *"¿esto está en más sitios?"*:
- 🔴 **Cobro semestral duplicado en producción**: `getExistingPayment` perdía un mes de ventana,
  no encontraba el pago de febrero y lo regeneraba.
- 🔴 **Anomalía de caída de recaudo del daily brief nunca disparaba**: comparaba el mes contra
  sí mismo (`now()->subMonth()` un día 31 devuelve el mes en curso).
- 🟡 Segundo bug de i18n: toasts de enlaces de inscripción en crudo (19 claves).
- ⚠️ El mismo desbordamiento estaba en `PlayerService::periodWindow`, código escrito y pusheado
  ESTE MISMO DÍA en el fix de `bulkAssignPlayers`.

**Sitio nº 9 encontrado al verificar antes del push:** `AdminAnalyticsController` calculaba las
métricas del "mes pasado" del panel de Super Admin con el mismo desbordamiento. Más 3 tests
(`MonthCloseServiceTest`, `MonthlyBudgetCapTest`, `CollectionsListTest`) que tenían el bug dentro
y por eso la suite se ponía roja unos días al mes y volvía sola a verde.

**Total del desbordamiento de fecha: 9 sitios de producción + 4 tests.** Empezó como
"el gráfico repite un mes".

**Lección de arnés de pruebas:** `GOTENBERG_URL`, `MAIL_*`, `FRONTEND_URL` y `APP_URL` viven en
`docker-compose.yml` como variables del **servicio**, no en `.env`. Un contenedor efímero
(`docker run`) que solo monta `.env` NO las hereda, y 7 tests fallan por razones falsas
(PDF, correo). Pasarlas explícitamente. Documentar en `saas_sport/CLAUDE.md`.

**Pendiente de Miguel:** grant MySQL
`GRANT ALL PRIVILEGES ON \`db_testing\_%\`.* TO 'user'@'%'` para activar el aislamiento real
de BD por worktree (hoy degrada a `db_testing` compartida, con aviso).

**Causa raíz de 0.2:** NO era build viejo de Netlify (mi hipótesis era falsa). `FinancialReportsPage`
usa `useTranslation(['menu','dashboard'])` → namespace default `menu`, pero las 40 claves
`financial.*` viven en `payments` y se llamaban sin prefijo. Sin `fallbackNS` no hay red. El título
sí traducía porque usa prefijo explícito `menu:` — ese contraste era la pista. Al barrer el repo
buscando el mismo patrón apareció un **segundo bug**: los toasts de enlaces de inscripción
(`useEnrollmentLinks`, 19 claves en `common` llamadas desde el namespace `enrollment`).

**Causa raíz de 0.3 y 0.4:** `now()->subMonths($i)` desborda cuando hoy es día 29-31 y el mes
destino es más corto (30 jul − 5 meses = "30 feb" → 2 mar). Duplica un mes y borra otro. Solo
se manifiesta 3 días al mes. Fix: partir de `now()->startOfMonth()` antes de restar.

**⚠️ Falso incidente de entorno — lección de diagnóstico.** Creí que `db_testing` se había
corrompido (235 → 100 tablas) y me culpé de un `migrate --force`. **Falso en ambas cosas.**
51 de 198 archivos de test usan `RefreshDatabase`, que borra y re-migra la base al arrancar
la corrida. Lo que medí era una **foto a media reconstrucción**. Se comprobó porque el "daño"
se movió de base al volver a medir: `db_testing` sana, `db_testing_c` a medio migrar (la que
estaba en uso en ese momento). Ninguna base estuvo corrupta nunca — tampoco `db_testing_b`,
que llevo etiquetando mal toda la sesión.

**Causa real:** solo hay 3 bases de test y Miguel corre varias sesiones en paralelo. Dos
procesos sobre la misma base = uno la borra mientras el otro lee. El propio
`tests/CreatesApplication.php` lo anticipa en sus comentarios, pero con 3 bases fijas.
Origina la tarea 0.5.

**Regla de diagnóstico:** una base de test a medio migrar es indistinguible de una corrupta.
Volver a medir a los 30 s antes de concluir daño. Y nunca correr `migrate` a mano sobre una
base de test: `RefreshDatabase` la reconstruye sola.

### Fase 0.6 — Hallazgos del módulo de pagos (revisión 31-jul, sin ejecutar)
| # | Grav. | Hallazgo | Dónde |
|---|---|---|---|
| 0.6.1 | 🔴 | **Selección masiva por índice de fila, no por id.** `rowSelection` guarda posiciones; nada la limpia al cambiar filtro, al refetch (`refetchOnMount:'always'`) ni al aprobar. Seleccionar 5 → cambiar filtro → "Cancelar" **cancela otros cinco**. Y el toast usa `cancelled_count \|\| pendingPayments.length`: si el backend rechaza todo, igual anuncia éxito | `usePaymentBulkActions.js:33-45`, `:268`, `:337`; `PaymentsTable.jsx:83` |
| 0.6.2 | 🔴 | **11 becados pintados como morosos vencidos, hoy en producción.** `calculatePaymentAmount` descarta `amount_due` cuando vale 0 y cae a `charge.amount`: tarjeta con Total $140.000, saldo $0, badge "Pendiente" + "Vencido Nd" y botón "Marcar como pagado". Verificado: Jeronimo y Wilmar (club 4), descuento 14 al 100%. Los de jun/jul tienen `discount_amount=0`, así que ni el badge de descuento aparece | `helpers/paymentCalculations.js:13-31`; `PaymentCard.jsx:89-90`, `:187-192` |
| 0.6.3 | 🔴 | **Borrar pagos desde la UI** (masivo e individual), con texto "cannot be undone". Backend hace soft-delete → hueco de consecutivo sin explicación | `PaymentsTable.jsx:331-346`, `:1056-1156`; backend `:1730-1800` |
| 0.6.4 | 🔴 | **El "periodo" de un pago es `created_at` y se edita reescribiéndolo** (`timestamps=false`), sin auditoría. Sustituto artesanal de `covers_from/to`; mover el periodo mueve el pago de mes en toda la página | `PaymentDetailInfo.jsx:49-68`; backend `:1052-1093` |
| 0.6.5 | 🔴 | **Cabecera mezcla 3 bases sin rotular**: Recaudado = caja del mes · Por Cobrar = deuda acumulada de **toda la historia** sin filtro · Total pagos = conteo de la lista filtrada en cliente. Y no pasa `charge_id` a `/payment-stats` aunque el backend lo acepta | `PaymentStatsHeader.jsx:24-81`; `PaymentStatsService.php:56-121` |
| 0.6.6 | 🟠 | Filtro "Cancelado" **muerto**: el backend excluye `CXL` siempre. Con R4 la operación que sustituye al borrado sería invisible | `paymentStatusConfig.js:416-426`; backend `:182-184` |
| 0.6.7 | 🟠 | UI ofrece cancelar pagos **parciales**; el backend los frena y devuelve `errors[]` que **el frontend nunca lee** | `usePaymentBulkActions.js:232-234`; backend `:1594-1603` |
| 0.6.8 | 🟠 | `bulkMarkPaid` manda `payment_method:'cash'` **fijo**: todo pago masivo entra al libro como efectivo | `usePaymentBulkActions.js:395` |
| 0.6.9 | 🟠 | Permisos desalineados en "cambiar periodo": front pide `payments.update`, backend exige owner/admin → contador ve el botón y recibe 403 | `usePaymentDetail.js:788` vs backend `:1067-1077` |
| 0.6.10 | 🟠 | Sin paginación: `->get()` de todos los pagos del mes con 7 relaciones; el filtrado real es en cliente | backend `:220` |
| 0.6.11 | 🟡 | `PaymentFiltersSheet.jsx` (322 líneas) **no está importado en ninguna parte**; el filtro por categoría existe en el hook y es inalcanzable | `components/PaymentFiltersSheet.jsx` |
| 0.6.12 | 🟡 | i18n en duro (cabecera, barra masiva, "No hay pagos") y `locale:'es'` cableado en card, Excel y selector de periodo | varios |

**Alineación con Cobros v2 — lo que hay que rehacer:**
- El filtro mes/año usa `created_at`; debe pasar a `due_date` y luego a `covers_from/covers_to`.
- La card **no muestra concepto ni temporada**: con versionado, "Mensualidad Tipo 2 · 2026" y "· 2027" se ven **idénticas** (nombre + mes sin año), y el desplegable de cobros etiqueta por `name` → dos entradas con texto igual. Requiere `season` como etiqueta explícita en card, filtro y export.
- El periodo que muestra la card es una **inferencia** del `due_date` (`frequency_id !== 1` → un mes): para un trimestral escribe un solo mes y engaña. Sustituir por `covers_from/to`.
- Faltan filtros por concepto, modalidad del jugador, periodo cubierto y temporada.

### Fase 0.7 — Hallazgos del BACKEND de pagos (revisión 31-jul, sin ejecutar)

**🔴 Tres bloqueantes que condicionan Fase 1 y 2:**

| # | Bloqueante | Evidencia medida en prod | Consecuencia |
|---|---|---|---|
| B1 | **Dos nociones de "anulado" que discrepan** | **58 pagos** con `status='CXL'` y `is_canceled=0` | `getTotalBilled` filtra por `status` (los saca de facturado), `getReceivedAmount` filtra por `is_canceled` (los deja en recaudado) → **recaudado > facturado por construcción**. **I2 ya está roto con datos reales.** Decidir cuál manda ANTES de escribir la consulta canónica (1.3), o los invariantes nacen descuadrados |
| B2 | **`ApplyLateFees` muerto desde Carbon 3** | **0 pagos** con `late_fee_applied_at` en toda la historia · **586 `PEN` vencidos** hoy | `(int) $today->diffInDays($payment->due_date)` da **negativo** con fecha pasada (`ApplyLateFees.php:104`) y `:106` descarta todo. Mismo patrón ya documentado en `SimpleDashboardController:990`. **Arreglar solo el diff enciende la mora sobre 586 vencidos**: el fix de Carbon y el guard R2 van en el MISMO commit |
| B3 | **FK `onDelete('cascade')`** | `2024_08_26_224809_…payments_table.php:44-45` | `forceDelete()` de un cobro o jugador **arrasa sus pagos en MySQL, por debajo de la aplicación**. Hace de V3 ("un cobro que generó pagos nunca se elimina") una promesa que la BD puede romper sola. Quitar la cascada antes de prometer V3 |

**🔴 Consecutivos: 968 perdidos, no 139.**

```
club 4 (ABA):  max 1817 · 865 filas · PERDIDOS 952 · recuperables (soft) 20 · 144 rangos rotos
club 14:       max 1096 · 1080 filas · perdidos 16 · recuperables 119
```
Solo los soft-deletes vuelven. ~930 se borraron **en duro** (seeder o cascada) y no se recuperan.
139 soft-deleted suman **$10.420.000** en `amount_due`; uno tiene `amount_paid > 0` (dinero cobrado
que no aparece en ningún reporte). Tres puertas al borrado duro: la cascada de FK (B3),
`CleanDeletedPayments.php:49-51` (`forceDelete()` a 30 días, fuera del scheduler pero a un tecleo),
y `RealisticFinancialDataSeeder.php:54`.

**🔴 Otros conflictos con las reglas:**

| Regla | archivo:línea | Qué pasa |
|---|---|---|
| R7/R5 | `PlaClubTeamChargeController.php:194-212`, `:260-283` | Cambiar monto o descuentos del cobro **recalcula `amount_due` de todos los `PEN`, incluidos meses pasados**, ignorando `amount_is_manual`. Reescribe facturación ya emitida. (0 filas con `amount_is_manual=1` hoy: daño potencial) |
| R7/R10 | `ApplyLateFees.php:136`, `:159-165` | La mora escalonada usa `charge->amount` como base y reescribe `remaining_amount` → **resucita el importe sin descuento**. Un becado al 100% pasaría de $0 a cuota completa con recargo |
| R3/I2 | `PlaClubTeamPaymentController.php:1521-1532` | Reembolso total pone `CXL` **sin `is_canceled`** → sale de facturado, sigue en recaudado. Y `updatePaymentStatus()` posterior deshace el reembolso |
| R4 | `PlaClubTeamChargeController.php:369-377` | Desactivar un cobro cancela `PEN`/`OVD` por query builder: **sin eventos de modelo → sin auditoría**, sin actor, sin `is_canceled`, sin mirar `amount_paid` |
| R4 | `PlaClubTeamPaymentController.php:1035` | `consecutive_number` **editable por el cliente**; sin él en el PATCH queda **null** |
| R4 | `:1339-1391`, `:1730-1808` | Borrado real; el `reason` solo va a `Log::info`, no a BD |
| R3 | `PlaClubTeamCharge.php:161-173`, `CancelHiddenChargePendingPayments:139-165`, `WriteTools:1193-1196` (la IA), `AttendancePaymentService:146-158` | Cancelan `PEN` en lote sin mirar `amount_paid` ni comprobantes `PEV`. Hoy 0 filas afectadas: agujero abierto, aún no pisado |
| R1 | `ChargeService:175-178` vs `GenerateMonthlyPayments::getExistingPayment` vs `PaymentController::store:254-266` | **Tres definiciones** de "ya existe pago de este periodo". Cero detección de solape entre cobros distintos: **R1 no existe hoy** |
| R5 | `:1052-1093` | `updateBillingPeriod` reescribe `created_at` (`timestamps=false`) a cualquier mes 2024-2030 — y ése es el campo por el que `index` filtra el periodo |
| R10 | `ChargeService.php:223-229` | Descarta el pago si `final_amount <= 0` → **la beca del 100% no genera fila** y es indistinguible de "nadie le cobra" |
| — | `:995-1045` | `update()` **resucita cancelados**: recalcula el estado sin mirar el previo. Un `CXL` vuelve a la vida con un PATCH |

**🟠 Consultas que miden lo mismo distinto (lo que I1-I7 vienen a prohibir):**
- **"Recaudado" tiene 3 definiciones vivas**: `PaymentStatsService` (por `reviewed_at`, excluye anulados) · `FinancialReportController::incomeByCharge` (por `paid_at`, **no** excluye) · `PlaClubTeamController` (por `payment_date`). Efecto: en Reportes Financieros el total por concepto **no cuadra con el ingreso del mes de la misma pantalla**. `incomeByCharge` además no filtra `is_hidden` y muestra el cobro interno `__payment_agreement__` como un concepto más.
- **"Deudores" dos veces**: `PaymentStatsService::debtorsSummary:256-274` **no filtra `deleted_at`** (los $10,4M borrados cuentan como deuda); `FinancialReportController::playerBalances:443-448` sí. Dos cifras de deuda del mismo club el mismo día.
- **"El mes de un pago" tres veces**: `index` por `created_at` · el generador por `due_date` · las stats por `reviewed_at`.
- **`discount_amount`**: `ChargeService` y el dispatch lo guardan; **el cron no** (solo `discount_id`). `updateDiscount` usa `amount_due + discount_amount` como base → sobre un pago del cron la base sale mal.
- **Consecutivo: 5 generadores, 4 sin lock correcto.** Solo `GenerateMonthlyPayments` reintenta ante `Duplicate entry`. `PlaTournamentController:3543` **se traga la excepción**: la cuota del torneo no se crea y solo queda un `Log::warning`.

**✅ Lo que sí está bien construido** (no tocar sin motivo): `PaymentAgreementService` (guards de anulación, lock, `original_debt_amount`), `IncapacityAdjustmentService:208-265`, y `AGR`/`EXO` fuera de `DEBT_STATUSES` y de `getTotalBilled` — razonado y documentado en el propio código.

### Fase 0.8 — Hallazgos de ACUERDOS DE PAGO (revisión 31-jul, sin ejecutar)

**⚠️ TRAMPA CRÍTICA para quien implemente §8.1 (reporte de cobertura):**

> Un pago cubierto por un acuerdo queda en `status='AGR'`, que está **fuera de `DEBT_STATUSES`**
> pero **dentro de `ACTIVE_STATUSES`**. La cobertura DEBE calcularse con **`ACTIVE_STATUSES`**.
>
> **La mayoría de consultas financieras del repo filtran por `DEBT_STATUSES`** (`PaymentStatsService:112,260`,
> `FinancialReportController:445`, `SimpleDashboardController:745,972,2590`, `CollectionCycleService:439`,
> `FamilyTools:315`). Solo 6 sitios usan `ACTIVE_STATUSES`. **Quien copie el patrón dominante marcará
> como desatendido a todo jugador con acuerdo de pago.** No es hipótesis: es el camino de menor resistencia.

**Matiz contraintuitivo:** el acuerdo salda deuda **pasada**, no es cobertura futura. Un jugador con
acuerdo vigente **debe** seguir apareciendo como no-cubierto si nadie le genera la cuota del mes actual.
Hoy funciona bien por accidente: crear un acuerdo no toca el cobro recurrente, así que el cron sigue generando.

**Qué es un acuerdo (5 líneas):** agrupa **pagos** (no cobros) en `owed()`; los originales pasan a `AGR`
guardando `pre_agreement_status` y `agreement_role='covered'`; la deuda viva pasa a N cuotas `PEN` colgadas
de un cobro oculto sintético por club (`__payment_agreement__`); anular restaura los covered solo si ninguna
cuota tiene abono `APR` ni `PEV`. **0 acuerdos en producción** — nadie lo usa aún.

**🔴 R3 NO es la regla que el código implementa.** Nosotros escribimos "un pago con `amount_paid > 0` jamás
se cancela". El código pregunta por **abonos `APR`**, no por `amount_paid`. No son lo mismo, y hay prueba:

```
#4072 · club 14 · PAR · debía $80.000 · PAGADO $60.000 · BORRADO el 7-jul · abonos: 0
```
Una familia pagó $60.000 y el pago fue eliminado: pasó todos los guards porque no tenía ficha de abono.
**7 pagos parciales más con $525.000 encima** en la misma exposición. Y `destroy()` individual
(`:1367-1378`) ni siquiera tiene el guard de abonos que sí tiene `bulkDelete`.
→ Reescribir R3 como guard único compartido (`$payment->hasMoney()`) sobre `amount_paid`.

**🔴 I2 desfasada en dinero real hoy.** Dos gemelos del club 14, ambos `CXL`, ambos con abono `APR` de
$60.000 pagado de verdad: #2110 (`is_canceled=1`) sale de facturado Y de recaudado, coherente; #2114
(`is_canceled=0`) sale de facturado pero **cuenta como recaudado**. Reconciliación exacta de los 172:

```
vivo · CXL · is_canceled=1  →  114        is_canceled=1 con status≠CXL: 0
vivo · CXL · is_canceled=0  →   27   ← huérfanos (26 del club 14, 1 del 24)
borrado · CXL               →   31
                              ─────
                                172
```
**Culpable localizado:** desactivar un cobro (`PlaClubTeamChargeController.php:373-376`) escribe
`status='CXL'` **sin tocar `is_canceled`** — el único de los 6 puntos de cancelación que no escribe
ambos. Los acuerdos sí escriben los dos siempre (`:238-241`, `:169`).

**🔴 Crear un acuerdo sobre un pago parcial rompe I2 por diseño.** Con el fixture del propio test de la
casa (cobro 100.000, abono APR 40.000, acuerdo por 60.000): `facturado 60.000 ≠ recaudado 40.000 +
por_cobrar 60.000` → desfase de 40.000. Antes del acuerdo el invariante se cumplía.
**Decisión pendiente:** (a) el covered aporta su `amount_paid` al facturado — recomendada, única que
mantiene I2 sin reescribir el pasado; (b) prohibir acuerdos sobre parciales; (c) declarar excepción.

**🔴 `app:cancel-hidden-charge-payments` sin `--charge` vacía TODOS los acuerdos activos del club**
(itera `is_hidden=1` y el sintético lo es): las cuotas se cancelan, los covered quedan en `AGR`, la
deuda desaparece entera y el acuerdo sigue `active`. No está en el scheduler; hay 21 cobros hidden en prod.

**🎯 Probable causa de los fallos de QA que Miguel detectó y no detalló:** la columna **"Jugador" de la
lista de acuerdos sale VACÍA**. El front lee `agreement.player.name` (`AgreementsTab.jsx:73`) pero el
controlador lo devuelve en `player.user.name` (`:24`). El `?? ''` se traga el fallo sin error de consola.

**🟠 Otros:** la condonación (`total_amount < original_debt_amount`) no cae en ningún cubo — ni facturado,
ni cancelado, ni recaudado; el accessor `difference` existe y nadie lo lee · crear acuerdo cambia el
facturado de meses cerrados (R5) · el acuerdo nunca pasa a `completed` si la última cuota se paga con
"marcar pagado masivo" (`bulkMarkPaid` fija `COM` sin llamar `updatePaymentStatus()`) ·
`__payment_agreement__` se le muestra a las familias en correos y en el portal de padres · lo recaudado
vía acuerdo se atribuye al cobro sintético en `income-by-charge`.

**Impacto en piezas ya especificadas:**
- **§7.3 (cambio de modalidad)** se lleva por delante las cuotas del acuerdo: son pagos `PEN` con
  `due_date` futuro. El filtro debe ser `concept='training_fee' AND agreement_role IS NULL`.
  Ninguna de las dos condiciones está hoy en el spec.
- **Versionado**: no rompe nada — el acuerdo apunta a **pagos**, nunca a cobros. Único detalle:
  `syntheticCharge()` busca solo por nombre (`:42-45`); con unicidad `(club_id,name,season)` una segunda
  temporada puede duplicarlo y `->first()` elegiría uno al azar.
- **Concepto propio para el sintético:** `concept='agreement'`, excluido de cobertura, de R1 y del
  catálogo; las cuotas heredan `covers_from/to` del min/max de sus covered.

**✅ Bien construido:** `PaymentAgreementService` (guards de anulación, lock, `original_debt_amount`),
8 tests de no-doble-conteo, y `AGR`/`EXO` fuera de `DEBT_STATUSES` — razonado y documentado en el código.

### Fase 1 — Modelo + detección
| # | Tarea | Estado |
|---|---|---|
| 1.1 | `concept` en cobros + migración de los 35 vivos | ✅ |
| 1.2 | `covers_from`/`covers_to` en pagos + backfill de datos | ✅ |
| 1.3 | Consulta canónica de métricas (servicio único) + invariantes I1-I7 | ✅ |
| 1.4 | Reporte de cobertura con motivos — **⚠️ `ACTIVE_STATUSES`, NUNCA `DEBT_STATUSES`. Ver el recuadro rojo justo debajo: es requisito de aceptación, no una nota** | ✅ |
| 1.5 | Anomalías al daily brief + aviso en inicio | ✅ |

> ## 🛑 ALTO — la trampa que arruina la tarea 1.4
>
> **El reporte de cobertura DEBE calcularse con `ACTIVE_STATUSES`. Usar `DEBT_STATUSES`
> lo deja mal, y mal de una forma que NO se nota al probarlo.**
>
> Por qué se cae solo en el error: `DEBT_STATUSES` es el **patrón dominante del repo**
> (decenas de sitios lo usan; solo 6 usan `ACTIVE_STATUSES`). Quien copie el patrón de al
> lado —que es lo natural— escribe el bug.
>
> ```php
> ACTIVE_STATUSES = ['PEN','PAR','COM','OVD','PEV','AGR','EXO']   // ✅ cobertura
> DEBT_STATUSES   = ['PEN','PAR','OVD']                            // ❌ NO para cobertura
> ```
>
> **Qué rompe exactamente.** Un pago cubierto por un acuerdo queda en `AGR`, y uno
> exonerado en `EXO`. Los dos están **fuera** de `DEBT_STATUSES` y **dentro** de
> `ACTIVE_STATUSES`. Con el filtro equivocado, el reporte dice que **nadie les generó el
> cobro del mes** a:
> - todo jugador con **acuerdo de pago** vigente,
> - todo **becado / exonerado**.
>
> Y como el club de pruebas no tiene acuerdos (0 en producción), **el reporte se ve
> perfecto en QA** y falla solo en producción, sobre las familias más delicadas de la
> lista. Ese es el motivo de este recuadro.
>
> **Requisitos de aceptación de 1.4 — sin estos dos, la tarea NO está hecha:**
> 1. Un test con un jugador en `AGR` y otro en `EXO` que **falle** si se usa
>    `DEBT_STATUSES`. Nombre sugerido: `test_un_jugador_con_acuerdo_no_sale_como_descubierto`.
> 2. La consulta canónica de 1.3 es **el único** sitio donde se decide esto. El reporte no
>    arma su propio `whereIn` de estados.
>
> **Matiz contraintuitivo, que no anula lo anterior:** el acuerdo salda deuda **pasada**,
> no es cobertura futura. Un jugador con acuerdo vigente **sí debe** salir como no-cubierto
> si nadie le generó la cuota **del mes actual**. Cubierto se responde por el periodo, no
> por el acuerdo.
>
> Origen: `2026-07-31-pagos-v2-alineacion.md` §4.4.

> ### 📌 Entrada a Fase 1 — lo aprendido el 3-ago, antes de arrancar
>
> El módulo de **pagos quedó cerrado** ese día (anulados visibles → borrado retirado →
> mora revivida → agente IA → `is_canceled` derivado). Ver
> `2026-07-31-pagos-v2-alineacion.md`. De ahí salen tres cosas que condicionan esta fase:
>
> **1. El precio es por FAMILIA, no por categoría — y no está modelado.**
> Medido en Siempre Fuertes: 10 descuentos configurados, 32 jugadores los usan, pero
> **solo en el 71% de sus meses** (108 de 152). Alguien tiene que acordarse cada mes de
> aplicarlos a mano. Es el mismo hueco que la modalidad trimestral de ABA
> (`payment_modality`, Fase 2.1): el club fija condiciones **por jugador** y Widdo solo
> sabe de categorías.
> → **Evaluar subir un `player_discount` persistente a Fase 1**, junto a `payment_modality`.
> Sin él, el reporte de cobertura (1.4) marcará como descubierto a todo becado.
>
> **2. "Descubierto" y "moroso" no son lo mismo, y hay prueba.**
> En Siempre Fuertes hay **70 jugadores con 3+ cobros vencidos y CERO pagos**, 68 de ellos
> marcados ACTIVOS: **$25,6M, el 80% de la "deuda" del club**. Un activo de 4 meses que
> nunca pagó no es moroso — es un registro que no refleja la realidad.
> → El reporte de cobertura (1.4) debe distinguir **"nunca ha pagado"** de "debe este mes".
> Y **"jugador activo con N meses y cero pagos"** es mejor señal para 1.5 que cualquier
> total de deuda: es concreta y accionable.
>
> **3. `covers_from` desbloquea el filtro mes/año, y solo se cambia UNA vez.**
> Hoy el filtro de pagos va por `created_at` (accidente administrativo: ABA genera el 28
> del mes anterior, así que todo julio cae bajo junio). Decidido el 3-ago: **no** hay
> escala intermedia por `due_date` — se salta directo al periodo cubierto, para no mover
> los números del club dos veces. Detalle en el spec de pagos, §4.2 A1.
>
> ⚠️ **Excluir Upss y Sutagaos de toda métrica**: no están usando la plataforma
> (confirmado por Miguel, 3-ago). Sus $6,5M de "deuda" son ruido.

### Fase 2 — Modalidad y guards
| # | Tarea | Estado |
|---|---|---|
| 2.1 | `payment_modality` en jugador + default por club | ✅ |
| 2.2 | Guards R1-R5 en el servicio de generación | ✅ |
| 2.3 | Operación atómica de cambio de modalidad (§7.3) | ✅ |
| 2.4 | `closed_until` + validación de periodo cerrado | ✅ |
| 2.5 | 🔓 Desbloquea backfill ABA (sigue requiriendo validación de la administradora) | 🚫 |

**2.3 estuvo «hecha» un mes sin estarlo.** `PaymentModalityService::switch()` llevaba
una fase entera escrita y probada, y **ningún endpoint la exponía**: el club no podía
cambiar a un jugador de mensual a trimestral por ningún camino. El panel de cruce
ofrecía tres salidas y solo dos eran ejecutables — el frontend descartaba «reemplazar»
a propósito, porque un botón que no hace nada es peor que un botón que no está. Cerrada
el 5-ago con `POST charges/switch-modality` y su cableado. **Noveno caso del mismo
patrón en un día**; ver el detector `app:orphan-check`, que por sí solo NO lo cazó: la
clase se nombra en el código (su constante de auditoría), así que parecía viva.

**2.5 no es una tarea de código.** Está en 🚫 a propósito: el backfill de ABA espera la
decisión de la dueña del club, no una implementación. Lo técnico que lo bloqueaba ya no
lo bloquea. Falta acordar qué se hace con las familias que ya pagaron meses por
adelantado — que a quien pagó marzo, abril y mayo no le aparezca febrero.

### Fase 3 — UX creación
| # | Tarea | Estado |
|---|---|---|
| 3.1 | Wizard v2 por concepto + proyección neta como pie fijo | ✅ |
| 3.2 | Panel de cruce con 3 salidas | ✅ |
| 3.3 | Ficha de cobro con ciclo de vida | ✅ |
| 3.4 | Espejo en "Generar pagos ahora" (total neto, hoy falta) | ✅ |
| 3.5 | Eliminar `ChargesFormDialog` duplicado | ✅ |
| 3.6 | Versionado de cobros (V1-V6) + pantalla de renovación de temporada (M4) | ✅ |
| 3.7 | Migración del índice único `(club_id,name)` → `(club_id,name,season)` — **bloquea 3.6** | ✅ |

**3.1 — cerrado.** `POST charges/preview-dispatch` acepta la DEFINICIÓN del cobro (sin
`id`), construye un cobro **sin guardarlo** y lo pasa por `generatePaymentsForCharge()`
en dry-run: **la misma implementación** que usa el despacho real, con los mismos guards.
No hay segundo camino que pueda divergir — que es como nació el defecto de las dos cifras
contradictorias del 4-ago.

Tres cosas que los tests defienden y conviene no perder:
- `lo_proyectado_es_exactamente_lo_que_se_acaba_creando`: proyecta, crea de verdad y
  compara. Si divergen, el pie miente y es peor que no tenerlo.
- `proyectar_no_crea_ni_una_fila_ni_gasta_un_consecutivo`: nada de crear-y-revertir. MySQL
  no devuelve el autoincremento, y un hueco en la numeración de pagos es lo que una
  contadora lee como manipulación.
- `cero_alcanzados_es_un_cero_medido`: «a nadie le llega» y «no pude calcularlo» son
  respuestas distintas. Confundirlas enseña un 0 tranquilizador cuando nadie lo sabe.

### Fase 4 — Año deportivo
| # | Tarea | Estado |
|---|---|---|
| 4.1 | `season_start/end` + `non_billing_months` + migración ene-dic | ✅ |
| 4.2 | Renovación de matrícula visible con ajuste de precio | ✅ |

### Fase 5 — IA
| # | Tarea | Estado |
|---|---|---|
| 5.1 | Tools de lectura (cobertura, modalidades, proyecciones) | ✅ |
| 5.2 | Escritura con confirmación sobre la operación atómica | ✅ |

**5.2 — autorizada por Miguel el 5-ago**, con la condición de que las cifras fueran
«cobros reales, datos parciales, totales de cobro, súper bien estructurados». Las
cifras salen de `preview-dispatch`, no del modelo. Tres defensas que conviene no
tocar: el token de confirmación es de un solo uso y atado a su club; si las cifras se
movieron entre proyectar y confirmar NO se escribe (quien confirmó miraba un número
que ya no era cierto); y un alcance a medias responde «no lo sé» sin emitir token —
no se puede confirmar lo que nadie calculó. Solo dueño y administrador. Nada que
borre o anule.

---


**Fecha:** 2026-07-30 · **Estado:** Aprobado por Miguel (alcance) — pendiente maquetas validadas
**Origen:** Incidente club ABA (#4) — ver memoria `backfill-cobros-aba-jul2026`, `modalidad-pago-jugador-falta-jul2026`, `historia-ventas-revenue-assurance-jul2026`
**Maquetas:** `mockups-cobros-v2/M1-wizard.html` (Sheet) · `M2-ficha-cobro.html` ·
`M3-revenue-assurance.html` · `M4-renovacion-temporada.html`

---

## 1. Contexto y motivación

El 30-jul-2026 la administradora de ABA reportó 5 jugadores vinculados a categoría sin cobro.
La investigación destapó que el problema no era un bug puntual sino un **modelo incompleto**:

- `bulkAssignPlayers` no generaba cobros al mover jugadores (corregido en prod: `098e781…f77416e`).
- Widdo no sabe **qué ES un cobro** (mensualidad vs trimestre vs uniforme = solo texto + monto).
- Widdo no sabe **qué periodo cubre un pago** (no existe `cubre_desde/hasta`).
- Widdo no sabe **quién paga con qué modalidad** (ABA cobra trimestre a 6 de 104 jugadores, a mano).
- Nadie detecta a un jugador activo **sin ningún cobro vigente** — se ve idéntico a uno al día.
- Consecuencias medidas en un solo club: hasta ~$12,5M COP sin facturar (cifra preliminar,
  **sin validar** con el club), trimestres vencidos 5-6 meses sin renovar, una jugadora cobrada doble.

**Tesis del producto:** todo software de cobros ve `FACTURADO → RECAUDADO`. El diferenciador
de Widdo es la columna que falta: `DEBERÍA FACTURARSE → FACTURADO → RECAUDADO`.
Eso se llama **revenue assurance** y es el prerequisito del ciclo de cobranza autónomo con IA.

## 2. Objetivos

1. Que el sistema pueda responder: *¿quién debe pagar qué, con qué modalidad, hasta cuándo,
   y a quién NO le estamos cobrando?*
2. Que crear un cobro capture **intención** (concepto) y muestre **consecuencias** (proyección
   neta, cruces, fechas del cron) antes de crear.
3. Que ningún periodo contable cerrado se altere y ninguna operación de dinero se borre.
4. Que la fuga sea visible (reporte + daily brief) antes de que sea recuperable.

## 3. No-objetivos (decisiones de alcance — Miguel, 30-jul)

| Fuera | Decisión |
|---|---|
| Facturación familiar consolidada | **DESCARTADA** (no diferida): "se pierde control". Cobros siempre por jugador |
| DIAN / impuestos USA | Solo cuando un club lo pida. El modelo no debe impedirlo (consecutivos, CXL) |
| IA autónoma creando cobros | Fuera de v1. Escalera: lectura → escritura con confirmación → (algún día) autónomo |
| Notas crédito automáticas | v1 define el concepto; gestión manual |
| Backfill ABA | Congelado hasta: modalidad implementada + validación caso-a-caso de la administradora |
| Temporadas USA (ago-jul) | Config de club lo soporta; el diseño fino de USA va aparte |

---

## 4. Fase 0 — Bugs inmediatos (independientes, van primero)

| # | Bug | Detalle |
|---|---|---|
| 0.1 | Cron ignora `excluded_player_ids` | `GenerateMonthlyPayments::getPlayersForCharge/processPlayerPayment` nunca lo consultan; solo el alta de jugador nuevo lo respeta. Todo club que excluye cree que funciona |
| 0.2 | i18n reportes financieros en crudo | Claves `financial.*` existen en `payments.json` (es/en) y en `origin/main`; la página muestra claves. Sospecha: build Netlify anterior a `f7355dd7`. Verificar deploy antes de tocar código |
| 0.3 | Flujo de caja repite mes | Gráfico muestra "mar. 2026" dos veces con el mismo valor y omite febrero |

## 5. Modelo de datos

### 5.1 `pla_club_teams_charges` + `concept`

```
concept ENUM('training_fee','enrollment','uniform','event','other') NOT NULL
```

- `training_fee` = cuota de entrenamiento (mensualidad / trimestre / semestre). **Excluyentes entre sí.**
- `enrollment` = matrícula (reemplaza semánticamente a `is_enrollment_fee`; el booleano se
  mantiene por compat y la migración los alinea).
- Migración retro de los 35 cobros vivos: `is_enrollment_fee=1 → enrollment`; recurrente
  mensual → `training_fee`; resto → `other` + tarea de clasificación asistida en UI
  (aviso "clasifica tus cobros" hasta que el club los revise).

### 5.2 `pla_club_teams_payments` + periodo cubierto

```
covers_from DATE NULL
covers_to   DATE NULL
```

- Todo pago nuevo de cobro recurrente nace con su ventana (mensual: mes del `due_date`;
  trimestral: 3 meses desde inicio del periodo).
- Backfill de datos: pagos mensuales existentes → mes de su `due_date`. Trimestres viejos de
  ABA: quedan NULL (periodo desconocido — solo la administradora sabe; la UI permite editarlos).
- **Esta es la pieza que desbloquea:** "se venció", "generar el siguiente", alertas, cobertura.

### 5.3 `pla_club_teams_players` + modalidad

```
payment_modality ENUM('monthly','quarterly','semiannual') NULL  -- NULL = default del club
payment_modality_changed_at TIMESTAMP NULL
```

- Regla de generación (concepto `training_fee`): el cobro solo se genera si su frecuencia
  coincide con la modalidad efectiva del jugador (la suya, o el default del club si NULL).
- Cambio de modalidad = **operación atómica** (ver §7.3), nunca edición directa del campo.
- Desbloquea las frecuencias Trimestral/Semestral que existen en `bas_frequencies` y que
  **cero cobros** usan hoy (por eso ABA falsificó trimestres con Pago Único).

### 5.4 `pla_club_teams` + año deportivo y cierre

```
season_start MM-DD NULL      -- default 01-01
season_end   MM-DD NULL      -- default 12-31
non_billing_months JSON NULL -- ej ["12","01"]: meses sin generación de cuotas
closed_until DATE NULL       -- cierre contable: nada backdated entra antes de esta fecha
```

- Migración: todos los clubes → ene-dic (decisión Miguel); cada club ajusta.
- El año deportivo da fecha de fin default a las cuotas y momento de renovación a matrículas.

## 6. Reglas financieras (guards de servicio — la seguridad vive aquí, nunca en UI ni prompts)

| # | Regla |
|---|---|
| R1 | Dos cobros `training_fee` con periodos que solapan sobre el mismo jugador = cruce. La alternativa **no se genera** (prevención), no se borra después (curación) |
| R2 | Cobro generado con `due_date` en el pasado nace **exento de mora** o con vencimiento fresco. `ApplyLateFees` jamás multa errores/correcciones del club |
| R3 | Cobro con `amount_paid > 0` **jamás** se cancela automáticamente: se marca "requiere decisión" y el humano resuelve (queda / crédito manual / devolución) |
| R4 | Operaciones de dinero **nunca borran**: `status=CXL` + motivo + actor. Preserva `consecutive_number` (huecos de numeración = bandera de auditoría para contadoras, descalificante para DIAN futura) |
| R5 | Periodo cerrado (`closed_until`): validación de servicio rechaza crear/mutar pagos con `due_date`/`covers_*` dentro del cierre. Correcciones entran con fecha actual referenciando el periodo original |
| R6 | Toda proyección es **neta**: Σ `calculatePaymentAmount().final_amount` por jugador (descuento del cobro + del jugador + familiar) − exentos − excluidos − ajuste por incapacidad. Nunca `monto × cabezas` |
| R7 | `amount_is_manual` manda sobre cualquier recálculo (regla existente, intocable) |
| R8 | Cada reporte declara su base: **devengo** (`due_date`/`covers`) o **caja** (`payment_date`). Jamás mezclar sin rótulo |
| R9 | Renovación de periodos = **cron determinístico**, nunca decisión de LLM |
| R10 | **Un jugador con descuento del 100% (beca) está CUBIERTO, no desatendido.** Su cuota vale $0 pero existe. Jamás puede aparecer en el reporte de cobertura como "sin cobrar". Hay becas del 100% en 4 clubes. ⚠️ El comando de backfill de Fase 0 hoy descarta importes en cero: trataría a un becado igual que a alguien a quien nadie le cobra. Separar "vale cero por beca" de "no existe cobro" |
| R11 | **Toda cifra declara sobre qué se apoya, o no se muestra.** Ningún número puede parecer un hecho cuando es un supuesto. Aprendido tres veces hoy: (a) los ~$12,5M de ABA sin validar con el club; (b) la proyección del wizard mostrando "98 jugadores" en un paso donde el alcance aún no se había elegido; (c) el total de renovación sumando una cuota mensual con una matrícula anual y asumiendo el plantel de hoy para 2027. En renovación se muestra **el % de subida** (real y comparable) y el importe como estimación rotulada "con los jugadores de HOY" |

## 7. UX

### 7.1 Wizard de creación (maqueta M1)

- **Paso 0 "¿Qué vas a cobrar?"**: tarjetas = concepto. Cada tarjeta configura el flujo:

| Concepto | Pregunta | Pre-resuelve |
|---|---|---|
| Cuota | modalidades que ofrece el club; **¿hasta cuándo?** (default: fin de temporada); meses sin cobro; día de pago | exclusividad, prorrateo según política del club |
| Matrícula | renueva con la temporada; precio ajustable al renovar | nunca prorratea (regla existente en `ChargeService`) |
| Uniforme / Evento | a quiénes; (evento: fecha) | pago único real, sin recurrencia |

- **"¿Hasta cuándo?" es pregunta del paso 1**, no "límite opcional" del paso 3
  (evidencia: 1/35 cobros tiene fin — el campo existía, la UI lo escondía).
- **Proyección como pie fijo** en todo el wizard: `N jugadores · bruto − descuentos − exentos
  = neto · próximas 3 fechas del cron · termina el X`. Con advertencia de cruce inline.
- **Cruce detectado** → panel con 3 salidas: `Excluirlos` (default) / `Reemplazar su cuota
  actual` (operación §7.3) / `Cobrar ambos` (excepción consciente, queda auditada).
- Aviso nombre-periódico: nombre contiene "mensual|trimestre|semestre|quincena" + frecuencia
  Pago Único → "¿seguro?" (el caso ABA literal).
- Un solo formulario: `ChargesFormDialog` (387 líneas duplicadas) muere; queda el wizard.
- Móvil first-class (clubes despachan desde iPhone — verificado en logs nginx).

### 7.1b Contenedor, foco y teclado (decisiones de 31-jul)

**`Sheet` lateral, no modal**, para crear y editar. Razones: el wizard v2 pide más alto que
un `Dialog` centrado; ya es el patrón de la casa para formularios largos (calendario, ficha
de jugador, asistencia, filtros de pagos); y en móvil `side="bottom"` sube a pantalla completa
— no es teórico, el club 14 despacha cobros desde iPhone (verificado en logs nginx).
Verificado que `sheet.jsx` **sí tiene** el fix de `pointer-events` que costó el bug del menú
de asistencia, así que es seguro meterle selects y popovers.

Modal se reserva para: espejo de "Generar pagos ahora", confirmaciones destructivas.
La **ficha de cobro (M2) es página con ruta propia**, no modal: se enlaza desde el reporte de
cobertura, el brief diario y el chat del agente. Un modal no tiene URL que compartir.

**Teclado y foco — requisitos, no adornos:**

| # | Regla | Por qué |
|---|---|---|
| F1 | Los grupos de opciones (concepto, alcance, hasta-cuándo) son **una sola parada de tab**; dentro se navega con flechas | Con 5 paradas por grupo, llegar al botón cuesta 10 tabs de más |
| F2 | `scroll-padding-bottom` en el contenedor de scroll = alto del pie fijo | Sin eso el pie **tapa el elemento enfocado** al tabular. Detectado en la maqueta |
| F3 | Enter en un input **avanza de paso**, nunca envía el formulario | Un formulario de un solo campo se envía solo al dar Enter |
| F4 | Foco automático al cambiar de paso, y al desplegar un sub-campo (fecha, panel de cruce) | |
| F5 | El pie de proyección **no es focusable**; lleva `aria-live="polite"` | Informa el cambio de plata sin robar el foco |
| F6 | Aviso de scroll (degradado + "↓ hay más abajo") cuando queda contenido | El contenido cortado sin señal es invisible |
| F7 | Anillo de foco visible en todo lo interactivo | |

### 7.1c Catálogo completo de campos por concepto

El backend acepta **28 campos**; el wizard actual expone ~15 y esconde los que deciden
comportamiento. Matriz de qué se pregunta según el concepto:

| Campo | Cuota | Matrícula | Uniforme | Evento |
|---|:--:|:--:|:--:|:--:|
| Nombre · valor · moneda · descripción · notas | ✓ | ✓ | ✓ | ✓ |
| **Cómo se paga** (mensual/trimestral/semestral/**por sesión**) | ✓ | — | — | — |
| Día de vencimiento | ✓ | — | — | — |
| Hasta cuándo · meses sin cobro · máx. repeticiones | ✓ | — | — | — |
| Renovación anual + ajuste de precio | — | ✓ | — | — |
| Fecha fija de vencimiento | — | — | ✓ | ✓ |
| Fecha del evento | — | — | — | ✓ |
| Alcance (todos / **por deporte** / categoría / específicos) | ✓ | ✓ | ✓ | ✓ |
| Excluir jugadores · descuentos · método de pago · mora | ✓ | ✓ | ✓ | ✓ |
| Cobrar a jugadores nuevos | ✓ | ✓ | ✓ | — |
| Cuándo generar (ya / programar / solo manual) | ✓ | ✓ | ✓ | ✓ |

**Huecos detectados en el wizard actual:**
- `billing_mode = per_attendance` (**pago por sesión**) se me había caído del diseño. Es una
  cuarta modalidad de cuota, **excluyente**: al elegirla desaparecen día de vencimiento,
  fecha de fin y meses sin cobro. Su proyección es **estimada** (`$X por sesión · ~$Y/mes
  según sesiones programadas`) y debe rotularse como tal. Clubes 12 y 10 lo tienen
  configurado — y con **0 jugadores asignados**, otro caso de cobertura invisible.
- `due_day` no se preguntaba, y hoy solo aparece si ya elegiste fecha específica.
- `by_sport` faltaba (solo visible en clubes multi-deporte).
- `late_fee_*` existen y el job `ApplyLateFees` los usa, pero **cero archivos del wizard los
  exponen**: están vivos e inalcanzables.

**Mora = dos niveles.** Existe `pla_club_teams_late_fee_tiers`: escalas **por club**
(día 6-10 → +$10.000, día 11-15 → +$10.000 más, acumulable; el club 6 ya la usa) que
`late_fee_*` del cobro sobreescribe. En el wizard: *"usar la escala del club"* vs
*"personalizar para este cobro"* vs *"sin recargo"*. No tres campos sueltos.

**Descuentos = un solo catálogo** (`pla_club_teams_discounts`), con dos tipos técnicos:
porcentaje o valor fijo. **NO existe una categoría "descuento familiar"** — "Plan Familiar",
"Plan Padrino", "Plan Referido", "Deportista Antiguo" son nombres que pone cada club. Hay 19
en producción. El wizard elige cuáles aplican al cobro; el jugador los tiene asignados aparte.

**Enlace de inscripción**: un cobro puede mostrarse en el enlace público
(`pla_club_teams_enrollment_link_charges`, 6 vínculos activos). Va en ajustes finos.

**Estructura del wizard:** 3 pasos con lo que decide comportamiento + un plegable de
**ajustes finos** (mora, descuentos, descripción, notas, método de pago, máx. repeticiones,
enlace de inscripción). La diferencia con hoy es que lo que **cambia el dinero** sale a la
superficie; hoy `apply_to_new_players` y los límites de recurrencia viven escondidos en
"Opciones avanzadas" y **1 de 35 cobros tiene fecha de fin**.

### 7.2 Ficha de cobro (maqueta M2)

Reemplaza "editar formulario" como vista principal del cobro:

- Ciclo de vida: generado N veces · último · **próximo** · termina (⚠ si NUNCA).
- Recaudo del cobro: facturado vs recaudado, por generación.
- Quién lo paga (por modalidad) / excluidos / exentos, con motivo.
- Acciones: pausar, editar, **"Generar pagos ahora" siempre con espejo** — modal con
  quién/cuánto/total neto (el total en plata hoy no existe en `DispatchChargeDialog`
  para cobros estándar; el conteo sí).

### 7.3 Operación atómica de cambio de modalidad

`PaymentModalityService::switch(player, toModality, effectiveDate)` — transaccional:

1. Actualiza `payment_modality` del jugador.
2. Cobros pendientes de la modalidad anterior **posteriores** al corte → `CXL`
   "cambio a modalidad X" (los ya vencidos/pagados se quedan — deuda real).
   Pagos parciales → R3 (marca, no cancela).
3. Genera el primer cobro de la nueva modalidad con su `covers_*`.
4. Audita: quién, cuándo, desde-hacia, cobros afectados.

Es exactamente los 4 pasos manuales que la administradora de ABA hace hoy (y donde Helen
quedó a medias: borrada la mensualidad, nunca creado el trimestre). Reversible: `switch` inverso.

### 7.3b Versionado de cobros — nunca editar el precio de un cobro que ya cobró

**Decisión de Miguel (31-jul).** Un cobro con pagos generados NO se edita: se **duplica**.

- Los pagos ya congelan su `amount_due` (histórico a salvo). Pero el **cobro** solo tiene el
  precio actual, así que la ficha diría $160.000 mientras sus pagos de 2026 dicen $140.000, y
  ningún reporte sabría a qué temporada pertenece cada cobro.
- La ventana de vigencia **ya es expresable** con los campos existentes: `scheduled_at`
  (desde) y `recurrence_end_date` (hasta). Renovar = crear una versión con la ventana nueva
  y cerrar la anterior.

```
Mensualidad Tipo 2 · 2026   $140.000   1 feb → 30 nov 2026   [archivado]
Mensualidad Tipo 2 · 2027   $160.000   1 ene → 30 nov 2027   [activo]
```

La versión 2027 **no puede generar pagos de 2026**: su vigencia empieza en enero.
Sirve igual para subidas a mitad de temporada (cerrar en junio, abrir desde julio).

**Reglas:**
| # | Regla |
|---|---|
| V1 | Editar el precio se permite **solo si el cobro no ha generado ningún pago**. Con pagos → duplicar |
| V2 | Corrección de errores (el dedazo real de ABA: $110.000 → $110 → $110.000) permitida con **motivo obligatorio**, registrado en `pla_club_teams_charges_history` (que ya existe: `previous_amount`, `new_amount`, `changed_by`, `reason`) |
| V3 | **Un cobro que alguna vez generó un pago nunca se elimina.** Hoy `destroy()` ya desactiva (`status=BOR`) si hay pagos ACTIVOS; ampliar a "si existió cualquier pago, incluidos cancelados y borrados" — hoy un cobro con todos sus pagos cancelados sí se puede borrar, y ahí se pierde el rastro de por qué se cancelaron |
| V4 | Coste asumido: la lista de cobros crece por temporada (ABA: 9 × 5 años = 45). Se agrupa por temporada con las cerradas plegadas |
| V5 | **El nombre NUNCA carga la temporada.** La temporada es un campo (`season`), la UI la muestra como etiqueta. Si se obliga a escribirla en el nombre, el club acaba con "Mensualidad 2027 v2" y "Mensualidad FINAL" |
| V6 | Los cobros **de una sola vez** (uniforme, evento) no se renuevan por calendario, pero se versionan igual: botón **"Duplicar con nuevo precio"** en su ficha. Mismo mecanismo, distinto disparador |

#### 🔴 Bloqueador de base de datos que el versionado obliga a resolver

```
UNICO: pla_club_teams_charges_club_id_name_unique  →  (club_id, name)
```

Existe un **índice único (club_id, name)**: hoy NO pueden coexistir dos cobros con el mismo
nombre en un club. El versionado se estrella contra el esquema, no contra la UI. Prueba de
lo real que es: `destroy()` tiene que renombrar a `_deleted_<timestamp>` solo para liberar
ese índice — de ahí el "Plan Hermanos_deleted_1773430764" que ABA arrastra en su catálogo
de descuentos.

**Migración requerida:** unicidad pasa a `(club_id, name, season)`. Efecto secundario
bienvenido: desaparece el truco del renombrado al borrar y los nombres dejan de quedar
sucios para siempre. Aplica igual a `pla_club_teams_discounts`, que sufre lo mismo.

Verificado en prod: los 3 cobros borrados que existen ("Purbea", "Prueba", "Asd") tienen
**0 pagos**. Ningún pago huérfano en la plataforma — la protección actual funciona.

### 7.4 Renovación de temporada (maqueta M4)

**Dónde aparece** — tres puntos de contacto, una sola pantalla con ruta propia
(`/charges/renovacion`, no modal: es una decisión con plata que se revisa con calma y se vuelve):

1. **Aviso en el inicio, escalado**: informativo a 30 días del fin de temporada, ámbar a 7,
   y urgente si pasa la fecha sin decidir.
2. **Brief diario**, como una anomalía más (canal ya existente).
3. **Botón permanente** en la página de cobros, para quien se adelante.

**Qué hace:** lista los cobros recurrentes con su precio actual y un campo editable para el
nuevo, con el delta en %. Al confirmar, por cada uno seleccionado: crea la versión nueva
copiando configuración y cierra la anterior. Transaccional y auditado.

Se copia: categorías y alcance · modalidades · descuentos · excluidos · día de vencimiento ·
escala de mora · método de pago · descripción y notas.
No se copia: pagos generados · historial de precios · exenciones individuales.
La modalidad del jugador vive en su ficha, así que se mantiene sola.

**Si nadie renueva:** los cobros terminan en su fecha y el aviso se vuelve urgente
(*"tu temporada terminó hace 5 días, 98 jugadores sin cuota este mes"*). El reporte de
cobertura lo detecta el mismo día. **No** se renueva solo al precio viejo: cobrar sin que
nadie lo haya decidido es justo lo que este spec viene a erradicar.

### 7.5 Renovación de matrícula (visible, nunca silenciosa)

- Hoy: `lastGenerated->year < today->year` → el 1-ene regenera TODO a todos, sin aviso.
- v2: aviso desde el 1-dic — "Matrícula 2027: renovará el 1-ene a N jugadores por $X.
  ¿Mantener precio o ajustar?" con precio editable (decisión Miguel: el club la ajusta
  anualmente o cuando considere). Si el club no actúa: default configurable — renovar
  al precio vigente (status quo) con notificación. Nunca sorpresa.

## 8. Revenue Assurance (maqueta M3)

### 8.1 Reporte de cobertura

Una fila por jugador **activo + sin cuota `training_fee` vigente** en el periodo, con
**motivo** calculado:

> 🔴 **Corregido el 4-ago: NO se puede exigir «con categoría».** Caso real encontrado en ABA:
> Juan Felipe Salazar (jugador #884, alta el 21-jul) tiene matrícula y uniforme pero **ninguna
> categoría**, y los cobros de ABA se aplican `by_category`. Widdo hace lo correcto al no
> generarle cuota — y por eso mismo **el club lleva un mes sin cobrarle y nadie se ha enterado**.
>
> Filtrar por «con categoría» dejaría fuera exactamente al jugador que más dinero pierde: el que
> entró, pagó matrícula y se quedó a medio registrar. Se añade **«sin categoría»** como quinto
> motivo, y es el primero que hay que mirar porque su arreglo es de un clic.

| Motivo | Regla |
|---|---|
| Nunca facturado | cero pagos de `training_fee` en la historia |
| Periodo vencido | último `covers_to` < hoy y no existe el siguiente |
| Cancelado sin reemplazo | pagos CXL/borrados y ninguno vigente |
| Sin modalidad | `payment_modality` NULL y el club no tiene default |
| **Sin categoría** | el jugador no está en ninguna, y los cobros del club aplican `by_category`. **Mirar este primero: se arregla de un clic** |

Excluye: exentos, per-attendance, modalidades cubiertas. Cada fila con acción directa
(generar / cambiar modalidad / marcar exento).

### 8.2 Métricas (por club — y para Widdo)

- **Fuga** = debería − facturado (la métrica estrella, hoy invisible)
- Tasa de recaudo = recaudado / facturado
- DSO = días promedio entre `due_date` y pago
- ARPU por jugador activo

Doble uso: club con recaudo cayendo = early-warning de churn **de Widdo**.

### 8.3 Distribución

- Pestaña en Reportes Financieros (junto a Deudores) — base devengo, rotulada.
- **Aviso en inicio + daily brief** cuando el número sube: "N jugadores sin cuota este mes".
  (A reportes se entra cuando se sospecha; el aviso llega aunque no sospeches — esto habría
  cazado a ABA en marzo, no en julio.)
- Cron de renovación de periodos + aviso de vencimiento al admin (determinístico, R9).

## 9. IA (escalera acordada)

| Nivel | Qué | Cuándo |
|---|---|---|
| Lectura | cobertura, modalidad por jugador, proyecciones, vencimientos; anomalías al daily brief | con la fase de reportes |
| Escritura con confirmación | "pásame a X a trimestral" → IA prepara el espejo (misma proyección), humano aprueba con un tap; usa el patrón de acciones autónomas existente | cuando §7.3 lleve semanas curtida en UI |
| Autónomo | detectar y proponer solamente | fuera de v1 |

Reglas duras: la IA **nunca borra** (CXL con motivo, actor=IA, traza del prompt en auditoría).
Guard en el servicio, no en el prompt. Voz: nada, como siempre.

## 10. Migración y rollout

1. Migraciones de datos con **dry-run y diff revisable** (comando artisan, mismo patrón que
   el backfill: revisión por defecto, `--execute` explícito).
2. Feature flag por club. Orden: Club Prueba (#1) → **ABA con la administradora en el loop**
   (es la design partner: encontró los huecos, valida las maquetas) → resto.
3. El cron no cambia de comportamiento a mitad de mes para clubes sin flag.
4. Conversión de los "Trimestres" de ABA (Pago Único → frecuencia real) solo tras validar
   con ella qué meses cubrió cada pago existente.
5. Reglas CO (matrícula enero) = configuración de club, jamás hardcode.

## 11. Transversales

i18n EN default + ES/PT desde el día uno · tests de contrato (mock generado del contrato,
nunca a mano) · permisos: `charges.create` para crear; contador = solo lectura de fichas y
revenue assurance · Reverb: operaciones nuevas emiten a `club.{id}.payments` · todo auditado
(`Auditable` ya presente en los modelos).

## 12. Fases (ordenadas por plata-en-riesgo, cada una aterriza valor usable)

| Fase | Contenido | Valor que aterriza |
|---|---|---|
| **F0** | Los 3 bugs de §4 | Exclusiones funcionan; reportes legibles |
| **F1** | Modelo (§5.1, §5.2) + migración de datos + **reporte de cobertura** + daily brief | La fuga se VE (detección = valor aunque la corrección siga manual) |
| **F2** | Modalidad (§5.3) + guards R1-R5 + operación atómica (§7.3) + cierre de periodo | Cruces imposibles; ABA deja de operar a mano; backfill ABA se desbloquea |
| **F3** | Wizard v2 + ficha de cobro + espejo en dispatch + morir el form duplicado | Crear cobros deja de producir sorpresas |
| **F4** | Año deportivo + renovación de matrícula visible + meses sin cobro | Diciembre no factura vacaciones; 1-ene deja de ser sorpresa |
| **F5** | IA lectura (con F1 listo se adelanta) → escritura con confirmación tras curtir F2 | El agente habla del embudo; luego opera con firma |

## 12b. Invariantes contables — criterios de aceptación ejecutables

Las maquetas usan datos de utilería; en la plataforma estas igualdades son **obligatorias
y verificadas por código**, no por quien arma la pantalla. Toda cifra visible se deriva de
UNA consulta canónica compartida (servicio de métricas único) — jamás dos pantallas
calculando lo mismo por su cuenta (así se rompió el reporte actual).

**Invariantes (para cualquier club, cualquier periodo):**

```
I1  debería_facturarse = facturado + fuga
I2  facturado          = recaudado + por_cobrar + cancelado_del_periodo
I3  Σ filas de cobertura (esperado) = fuga del tile          — al peso
I4  Σ generaciones de una ficha = totales de la ficha        — al peso
I5  quién_lo_paga: modalidad + otras_modalidades + exentos + excluidos = alcance total
I6  espejo de dispatch: lo previsualizado = lo creado (misma consulta, mismo request)
I7  proyección del wizard = Σ final_amount por jugador (nunca monto × cabezas)
```

**Cómo se garantizan:**

1. **Tests de propiedad** en backend: seeds aleatorios (jugadores, modalidades, descuentos,
   exenciones, parciales, cancelados) → los 7 invariantes se afirman. Si un cambio futuro
   rompe una igualdad, el CI lo caza antes que una contadora.
2. **Tests de contrato** para cada endpoint de métricas (mock generado del contrato).
3. **Self-check en runtime**: el endpoint de revenue assurance calcula I1-I3 sobre su propia
   respuesta; si no cuadra, loggea a Sentry con el club y periodo (nunca mostrar un tablero
   descuadrado en silencio).
4. La tarjeta "Cómo cuadra todo" (maqueta M3) se queda en producción: es la conciliación
   visible que la contadora del club puede verificar a mano.

## 13. Métricas de éxito del proyecto

- Fuga detectada → resuelta (generada o descartada con motivo) por club/mes.
- % de cobros con concepto clasificado; % de cuotas con fecha de fin definida (hoy: 3%).
- Cero pagos borrados (vs CXL) tras F2.
- Incidentes de soporte tipo "no se generó el cobro": hoy = este incidente; meta = 0.

## 13b. Pendientes de diseño (no cubiertos aún)

| # | Qué | Por qué importa |
|---|---|---|
| P1 | **Ficha del jugador**: dónde ve el club su modalidad, historial de cambios, descuentos y exenciones | Es donde aterriza el administrador cuando el reporte de cobertura dice "Antonia no tiene cuota". Sin esa pantalla el enlace del reporte no lleva a ninguna parte |
| P2 | Actualizar maquetas **M2 y M3** con el aviso de scroll y el versionado (M2 debe mostrar "Mensualidad Tipo 2 · 2026 [archivado]" con enlace a la versión 2027) | |
| P3 | Las **162 exenciones** de producción son 160 de ABA + 2 del club 14, todas con el mismo motivo automático ("jugador asignado a cobro alternativo"), 0 por incapacidad. No son 162 decisiones: son 40 jugadores × 4 cobros. Refuerza que sin modalidad por jugador el sistema escribe 160 filas para expresar 40 campos | Es específico de cada club, no un número de plataforma |

## 14. Decisiones tomadas (antes «preguntas abiertas»)

> **Cerradas el 3-ago.** Eran nueve y ninguna era un agujero de diseño: tres ya venían del
> propio spec con propuesta, y cinco de las seis que destapó el reconocimiento eran técnicas.
> Se toman aquí para que la Fase 1 no dependa de una ronda de consultas. **Todas son
> reversibles** — se indica el coste de cambiar cada una.

| # | Decisión | Coste de cambiarla |
|---|---|---|
| **P1** | Modalidad por **club**, con override por jugador. | Bajo — es un default |
| **P2** | `send_immediately`/`scheduled_at` se conservan dentro de "cuándo generar" en el wizard, con el espejo siempre visible. | Bajo — es UI |
| **P3** | En clubes 100% per-attendance (12 y 10), **per-attendance activo cuenta como cobertura**. Si no, los dos clubes salen enteros como descubiertos y el reporte nace inútil para ellos. | Bajo — una condición |
| **P4** | Aviso: badge desde el primer jugador, banner pasado el **5%**. Y **cualquier jugador con 2+ periodos vencidos dispara solo**, sin umbral. Ese escalado por antigüedad es lo que habría cazado a ABA en marzo; el umbral por volumen es lo que evita que el aviso se vuelva ignorable. | Bajo — dos constantes |
| **P5** | Sube **solo la mitad barata**: el cron pasa a persistir `discount_amount`/`discount_name`, como ya hace `ChargeService`. El campo `player_discount` persistente va a Fase 2. Hoy un cobro generado por el cron no sabe decir *por qué* vale menos, y sin eso el reporte marca mal a los becados (regla R10). | Bajo — es un bug, no un diseño |
| **P6** | El reporte de cobertura sale con **3 motivos de 4**, más un cubo rotulado "periodo desconocido". El cuarto necesita `payment_modality`, que arrastra P1 y alarga la fase. | Medio — añadir el motivo después es aditivo |
| **P7** | **Caja es caja**: el dinero cobrado antes de anular o exonerar **sigue contando como recaudado**, y se muestra como línea aparte ("cobrado antes de anular"). Si no, el recaudado de Widdo deja de cuadrar con el extracto del club. ⚠️ **La única con criterio contable de por medio** — ver nota abajo. | Bajo — un test y una condición |
| **P8** | Los cobros que la migración no sepa clasificar quedan en **`NULL`** y el club ve un aviso hasta revisarlos (~5 min por club). Es lo único que distingue "es realmente otro" de "no lo hemos mirado". | Bajo |
| **P9** | El aviso lo ven **owner, admin y contador**. Se cierra de paso que el daily brief no comprueba rol. | Bajo |

> ### ⚠️ Sobre P7 — la única que conviene contrastar
>
> Es la única con implicación contable real, y Miguel tiene contadora. Se implementa **caja es
> caja** porque es lo que hace que el número de Widdo coincida con el banco, que es de lo que
> depende que una administradora confíe en la plataforma. Anular un cobro **no es** devolver
> dinero: para mover plata están el reembolso y la aplicación a otro cobro, que son acciones
> propias y quedan registradas.
>
> Si la contadora prefiere lo contrario, cambia **un test y una condición del servicio**. No
> se rehace nada. Está aislado a propósito en `ClubMetricsService`.

**Ninguna de las nueve bloquea lo ya escrito** (`1.0.a/b/c`, `1.1.a`, `1.1.b`, `1.2.a`, `1.3.a`).
