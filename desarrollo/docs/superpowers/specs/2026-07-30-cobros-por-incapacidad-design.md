# Diseño: ajuste de cobros por incapacidad médica

> ## ✅ EJECUTADO Y EN PRODUCCIÓN (estado al 13-ago-2026)
>
> Verificado contra el código: `app/Services/IncapacityAdjustmentService.php` en backend y
> `frontend/src/components/payments/IncapacityAdjustmentDialog.jsx` +
> `IncapacityOverlapNote.jsx` en la UI de pagos. Se cerró dentro de la ola de Cobros v2
> (5-ago) — ver `2026-07-30-cobros-v2-revenue-assurance.md`.


**Fecha:** 2026-07-30
**Estado:** Aprobado por Miguel (conversación 30-jul)
**Repos:** `desarrollo/saas_sport` (Laravel) + `desarrollo/frontend` (React)
**Contexto previo:** `2026-07-29-incapacidades-asistencia-mobile-design.md` (el módulo de incapacidades ya está en producción)

## Problema

Un jugador con incapacidad médica queda excusado en asistencia y no genera cobro **por asistencia**, pero la **mensualidad** se le sigue cobrando completa. El director del club ni siquiera se entera de que el chico estuvo lesionado cuando mira el cobro, así que la conversación con la familia ocurre sin datos.

## Principio rector

**El sistema propone, el club decide.** Nunca se descuenta ni se exonera automáticamente. Un descuento silencioso descuadra la caja sin que nadie lo autorizara y genera disputas con la familia. Cada club tiene su política (muchos cobran igual porque el cupo queda reservado y el entrenador igual está contratado).

## Lo que YA existe y se reutiliza (no se reinventa)

| Pieza | Dónde | Qué aporta |
|---|---|---|
| Exenciones de cobro | `PlaClubTeamPlayerExemption` (tipos full/scholarship/staff_child/trial/other, `charge_id`, `start_date`, `end_date`, `authorized_by`, `reason`, `is_active`) | **Exonerar ya funciona**: `GenerateMonthlyPayments::isPlayerExempt()` (línea ~399) simplemente NO genera el cobro |
| Prorrateo por sesiones reales | `ChargeService::calculateSessionProration()` + `countSessions(clubId, categoryIds, desde, hasta)` | Cuenta clases reales entre dos fechas, deduplica y excluye sesiones canceladas |
| Convención de periodo | `GenerateMonthlyPayments::getExistingPayment()` | **La convención SÍ existe**: el periodo de un pago es el mes de su `due_date`. Un pago con `due_date` 5-ago es el de agosto aunque se creara el 28-jul |
| Descuentos en el pago | `discount_id`, `discount_amount`, `discount_name` en `pla_club_teams_payments` | Permite bajar el cobro conservando el precio de lista y mostrando el motivo en el recibo |
| Monto manual protegido | `amount_is_manual` | Evita que el recálculo pise un valor fijado por el club |

**Corrección de un supuesto inicial:** el recaudo se calcula sumando **cuotas aprobadas** (`PaymentStatsService::getReceivedAmount`), no por el estado del pago. Por eso un pago exonerado no infla el ingreso. El riesgo real de usar "descuento del 100%" es otro: el pago quedaría en estado completado y la familia vería "pagado" un mes que nadie pagó.

## Decisiones

1. **Exonerar el mes completo = crear una exención**, no un descuento del 100% ni cancelar el pago. Reutiliza el camino existente: no se genera el cobro. Se distingue por un `exemption_type` nuevo, `medical`, y queda ligada a la incapacidad que la motivó.
2. **Cubrimiento parcial = ajuste del monto del pago** con la proporción de **sesiones**, no de días. Una categoría que entrena 2 veces por semana y otra 5 no pueden recibir el mismo descuento por los mismos días de yeso.
3. **Nunca se toca un pago ya pagado.** Si el club quiere compensar, va como saldo a favor del periodo siguiente (fuera del alcance de este spec; se documenta como límite).
4. **La proporción se calcula sobre el periodo del pago**, definido por el mes de su `due_date`.
4-bis. **Para cobros cuenta también la incapacidad dada de alta (`FIN`)**, no solo la vigente. Lo que importa aquí es el rango que la incapacidad efectivamente cubrió, y el alta lo conserva (`discharge()` fija `end_date = hoy`). El cobro de agosto se revisa en septiembre, con el chico ya de alta: si se excluyera `FIN`, el feature no se vería nunca en el caso normal. `BOR` sí se excluye (registro borrado por error, con soft delete). **Es una asimetría deliberada con asistencia**, donde el estado sí decide si hoy se puede marcar ausente.
4-ter. **Puede haber varias incapacidades en un mismo periodo.** Se suman sus ventanas (disjuntas por la validación de solapamiento). El desglose expone `incapacity_ids` con todas e `incapacity_id` con la que más clases explica, que es a la que se liga el ajuste.
5. **No se implementa "congelar"** (no cobrar ahora y correr la vigencia un mes). No existe el concepto en el sistema y agregarlo toca la suscripción del jugador. Se deja anotado como evolución.
6. **No se agrega configuración de política por club.** Con 8 clubes es prematuro: primero se observa qué hacen cuando ven el dato.

## Fase 0 — Hacer visible la incapacidad donde se decide la plata

Sin tocar un peso. El club ajusta a mano con lo que ya tiene (monto manual, descuentos, exenciones).

- En el detalle de pagos de un jugador y en la vista de cobranza, mostrar cuando el periodo de un cobro se cruza con una incapacidad: *"Estuvo incapacitado 12 de 16 sesiones de agosto"*.
- Backend: endpoint (o campo en la respuesta existente) que, dado un pago, devuelva `incapacity_overlap`: `{ incapacity_id, start_date, end_date, sessions_incapacitated, sessions_in_period, ratio, covers_full_period }`.
- Solo lectura. Sin escrituras. Sin cambios de contrato destructivos.

**Criterio de éxito:** un director abre el cobro de agosto de Juan y ve, sin buscar en otro lado, que estuvo lesionado la mitad del mes.

## Fase 1 — El cálculo, expuesto y probado

- Servicio `IncapacityBillingService` con un método puro: dada una incapacidad y un pago (o un periodo), devuelve el desglose de arriba reutilizando `countSessions`.
- Casos cubiertos por tests: incapacidad que cubre el periodo completo, parcial, que cruza dos meses (dos pagos, cada uno con su proporción), abierta sin fecha de fin (se calcula solo lo transcurrido), periodo sin sesiones programadas, y jugador con varias categorías.
- Sigue sin escribir nada en la base.

## Fase 2 — El ajuste, de un clic y con aprobación

Sobre el pago, el club ve la propuesta ya calculada y elige:

| Acción | Qué hace | Mecanismo |
|---|---|---|
| Dejar igual | Nada | — |
| Descontar proporcional | Baja el monto del pago | `discount_amount`/`discount_name` en el pago + `amount_is_manual` |
| Exonerar el periodo | El cobro no se genera / se anula | `PlaClubTeamPlayerExemption` tipo `medical`, ligada a la incapacidad |

Reglas:
- La sugerencia por defecto depende del cubrimiento: completo → exonerar; parcial → descuento proporcional.
- Todo ajuste queda ligado a la incapacidad (`incapacity_id`), con quién lo aprobó y cuándo. Es plata que se dejó de cobrar: tiene que ser auditable.
- Si el pago ya está pagado, la acción de ajuste no se ofrece; se muestra por qué.
- Si la incapacidad se da de alta antes de tiempo o se extiende, la propuesta se recalcula; si el ajuste ya se aplicó, se avisa que quedó desactualizado en vez de cambiarlo solo.

**Autorización:** las mismas reglas financieras del resto de cobros (Owner, Admin y Contador según la matriz vigente). El Entrenador reporta la incapacidad pero NO ajusta plata.

## Fuera de alcance

- Congelar/correr la vigencia un mes.
- Saldo a favor / notas de crédito para pagos ya pagados.
- Configuración de política por club.
- Cualquier automatismo que ajuste sin aprobación humana.

## Riesgos

- **Doble descuento:** un jugador con beca (exención parcial existente) más ajuste por incapacidad. El servicio de la Fase 1 devuelve una **proporción, no un monto**; la Fase 2 debe multiplicarla por el monto **ya descontado del pago**, nunca por el precio de lista del cobro.
- **Exención demasiado ancha:** una exención sin `charge_id` aplica a TODOS los cobros del jugador. La de tipo `medical` debe ser siempre por cobro y con rango de fechas acotado al de la incapacidad.
- **El generador corre cada hora:** una exención creada tarde puede llegar después de que el pago ya se generó. En ese caso hay que ajustar el pago existente, no confiar en que no se genere.
