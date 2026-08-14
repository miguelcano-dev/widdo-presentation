# Plan de reposición de cobros — Club ABA

**Para:** la dirección del club ABA
**De:** Widdo
**Fecha del documento:** 4 de agosto de 2026
**Estado:** propuesta. **No se ha ejecutado nada.** Cero cobros creados.

---

## En una frase

Hay jugadores de ABA a los que el sistema nunca les generó su mensualidad. Podemos
reponer esas mensualidades faltantes en bloque, pero antes hace falta que ustedes
decidan **a quién sí y a quién no**, porque hay familias que pagan por trimestre y el
sistema todavía no sabe con certeza qué meses les cubre cada trimestre pagado.

Este documento explica qué se crearía, qué podría salir mal, cómo se deshace, y qué
preguntas necesitamos que respondan antes de tocar nada.

---

## 1. Qué se le crearía, y a quién

### El origen del problema

Cuando se movía a un jugador de categoría, el sistema lo vinculaba a la nueva categoría
**sin generarle su cobro**. Como la generación automática solo corre el día 1 de cada mes,
quien se movía después perdía el mes completo. Eso se fue acumulando.

**Ese fallo ya está corregido y en producción.** No se están perdiendo cobros nuevos. Lo
que queda pendiente es decidir qué hacer con los meses que ya se perdieron.

### La última medición que tenemos

La última vez que se corrió el cálculo **en modo revisión, sin crear nada**, fue el
**30 de julio de 2026**, y dio esto:

| Concepto | Cifra |
|---|---|
| Cobros que se crearían | 99 |
| Jugadores afectados | 70 |
| Importe total | $12.503.700 COP |
| Jugadores descartados por pagar trimestre | 8 |

> ### ⚠️ Estas cuatro cifras NO son un compromiso
>
> **Ninguna está validada con el club.** Salen de lo que el sistema calculó por su
> cuenta el 30 de julio, y el propio equipo las marcó como cifra preliminar sin validar.
>
> Además han pasado cinco semanas: han corrido dos ciclos de facturación más (agosto),
> y el cálculo de hoy **daría números distintos**. Cuántos exactamente, **no lo sabemos**,
> porque para saberlo habría que volver a correr la revisión contra los datos reales del
> club, y eso no se ha hecho y no se hará sin su autorización.
>
> Cuando ustedes den luz verde, el primer paso es **volver a correr la revisión en modo
> lectura** y presentarles la lista actual, jugador por jugador, con nombre y monto.
> Solo después se decide si se ejecuta.

### Qué reglas sigue el cálculo (esto sí es estable)

El sistema **no inventa meses**. Solo repone un mes si se cumple todo esto:

1. **El club sí facturó ese mes.** Un mes cuenta como facturado solo si esa mensualidad
   llegó a **3 o más jugadores** en ese mes. Por debajo de eso se considera un cobro
   suelto, no una corrida normal, y no se toma como referencia.
2. **El jugador ya había ingresado.** Nunca se cobran meses anteriores a su fecha de
   ingreso al club.
3. **El jugador no tiene ya ese mes.** Si existe cualquier cobro de ese mes —pagado,
   pendiente, anulado o incluso borrado— ese mes no se repone.
4. **El jugador está activo** y pertenece a la categoría de esa mensualidad.

### Quiénes quedan fuera automáticamente

El cálculo descarta, y los lista uno por uno al final para que ustedes los vean:

- Quien **paga con otra cuota** (trimestre o semestre) en lugar de por mes.
- Quien está **excluido** expresamente de ese cobro.
- Quien tiene una **exoneración** activa.
- Quien **paga por sesión** en vez de por mes.
- Quien **no tiene categoría** asignada.

### Tres casos con nombre propio que ya conocemos

Detectados el 30 de julio. Son ejemplos de las tres situaciones distintas que hay:

| Jugadora | Situación | Qué hay que decidir |
|---|---|---|
| **Maria Fernanda (290)** | Tiene mensualidad **y** trimestre de febrero: $780.000. Uno de los dos sobra | Cuál de los dos se queda. Esto es una **corrección**, no una reposición |
| **Helen (210)** | Le borraron las mensualidades para pasarla a trimestre, pero nunca le crearon el trimestre. **Sin cobrar desde marzo** | Qué se le cobra y desde cuándo |
| **Antonia (746)** | Entró el 23 de marzo. Solo tiene matrícula. **Cuatro meses sin ningún cobro** | Si se le repone todo o desde qué mes |

Helen y Antonia son **plata que el club no está facturando hoy**, independientemente de
lo que se decida sobre el pasado.

---

## 2. El caso que más preocupa: la familia que pagó por adelantado

> **La preocupación, tal cual:** una familia paga el trimestre marzo–abril–mayo por
> adelantado. Si el sistema le hace aparecer un cobro de febrero, esa familia abre la app
> y ve una deuda que no tiene. Eso no se arregla con una explicación después.

### Qué hay hoy para evitarlo

Hay **dos capas**, y es importante entender que **solo una de las dos está funcionando**.

#### Capa A — la que sí está activa: exclusión completa del jugador

El comando de reposición mira, para cada jugador, si tiene algún pago vivo de una cuota
**que no sea mensual y no sea matrícula**. Si lo encuentra, **descarta a ese jugador
entero**: no le repone ningún mes, ni febrero ni ninguno.

Es una red basta pero eficaz: en la corrida de julio descartó a 8 jugadores por esta vía.
Y fue exactamente lo que salvó el caso de **Lauren Sofia**, que tenía su trimestre de
julio pagado ($360.000) y el cálculo original le iba a añadir $140.000 encima.

**Lo que esta capa hace bien:** peca de prudente. Ante la duda, no cobra.

**Lo que esta capa hace mal:** peca de prudente **también cuando no debería**. Si una
familia pagó un trimestre en marzo pero estuvo en mensualidad de enero a febrero, esos dos
meses tampoco se le reponen. No genera cobros de más; genera cobros de menos.

#### Capa B — la que existe pero **no está conectada a este comando**

Widdo tiene desde este mes un mecanismo nuevo que compara **periodos cubiertos**: cada
pago sabe desde qué fecha hasta qué fecha cubre, y hay una regla (llamada R1 internamente)
que impide crear un cobro que se solape con un periodo ya cubierto — **incluso si ese
periodo ya está pagado**, que es justo el caso que duele.

Ese mecanismo está funcionando en los caminos normales: la generación mensual automática,
la pantalla de crear cobros, el cambio de modalidad de un jugador.

> ### 🔴 **Hallazgo 1 — el comando de reposición NO usa ese mecanismo**
>
> El comando de reposición sigue funcionando con la lógica de julio. **No consulta la
> regla R1, ni la modalidad de pago del jugador, ni el cierre contable, ni los meses en
> que el club no cobra.** Lo verificamos leyendo el código: no hay una sola llamada.
>
> Es decir: **las mejoras que supuestamente desbloquearon este backfill protegen todo lo
> demás menos este backfill.** Hoy la única defensa real es la Capa A.

### Y hay un segundo problema, más de fondo

> ### 🔴 **Hallazgo 2 — aunque se conectara, R1 no protegería este caso concreto**
>
> Los trimestres de ABA están registrados en el sistema como **"Pago Único"**, no como una
> cuota trimestral de verdad (la modalidad trimestral existía en el catálogo pero no
> estaba conectada a nada, así que en su momento se registró así).
>
> La consecuencia: **el sistema no sabe qué meses cubre cada uno de esos trimestres.** Son
> 12 pagos en total, y los tiene marcados literalmente como "periodo desconocido".
>
> Y la regla R1 está escrita para **no bloquear** ante un periodo desconocido — a
> propósito, porque no se puede demostrar un solape contra un periodo que nadie conoce.
> Lo que hace es devolverlos como *"indeterminado"* para que alguien los mire.
>
> **Traducido:** si mañana se conectara R1 al comando sin arreglar antes esos 12
> trimestres, el sistema respondería *"no hay cruce"* con total seguridad sobre una
> pregunta que en realidad nunca pudo examinar. Sería peor que no tener el mecanismo,
> porque parecería que protege.

### Un tercer detalle que hay que verificar antes de ejecutar

> ### 🟠 **Hallazgo 3 — la Capa A depende de cómo esté registrado el trimestre**
>
> La exclusión de la Capa A solo reconoce un trimestre si está registrado **como cobro
> por categoría**. Sabemos que al menos uno de los dos trimestres de ABA lo está
> (*Trimestre Sub 13-18*, que apunta a 104 jugadores aunque solo 6 lo paguen).
>
> **De los demás no lo sabemos**, y no lo vamos a averiguar consultando la base de datos
> del club sin permiso. Si algún trimestre se registró como cobro individual —lo cual
> sería una forma perfectamente razonable de resolverlo, dado que solo 6 de 104 lo pagan—
> **la Capa A no lo vería, y ese jugador sí recibiría mensualidades encima de su
> trimestre.** Es el escenario exacto que preocupa.
>
> → Esto se verifica en 5 minutos con acceso, antes de ejecutar. Está en la lista de
> comprobaciones previas de la sección 6.

### Un cuarto: los becados

> ### 🟠 **Hallazgo 4 — un jugador con beca del 100% no recibe nada**
>
> El comando descarta cualquier línea cuyo importe quede en cero. Un becado al 100% queda
> en cero, así que **no se le crea el cobro**.
>
> El problema no es la plata (son $0), es que **un becado sin cobro se ve exactamente
> igual que un jugador al que nadie le está cobrando**. Después de este backfill, el
> informe de cobertura seguiría señalando a los becados como "sin cobrar". Está
> documentado como defecto conocido y sigue sin corregirse.

---

## 3. Qué pasa con los pagos borrados y los anulados

Regla general: **lo que ya existió, aunque esté borrado o anulado, cuenta como que ese mes
ya se atendió, y no se repone.**

| Situación | Qué hace el backfill | Por qué |
|---|---|---|
| El club **borró** una mensualidad a mano | **No la recrea.** Ese mes se da por resuelto | Si el club la borró fue una decisión suya (típicamente al pasar a alguien a trimestre). El sistema no revierte decisiones del club |
| El pago está **anulado** (`CXL`) | **No repone ese mes** | Existió, tiene su numeración y su historia. El mes está documentado |
| El pago está **pagado, pendiente o vencido** | **No repone ese mes** | Obvio: ya está |
| El pago está cubierto por un **acuerdo de pago** o **exonerado** | **No repone ese mes** | Ese mes está resuelto por otra vía. Volver a generarlo sería cobrar lo que el club acaba de perdonar |

**Lo que sí es distinto:** para decidir si *el club facturó ese mes* (la referencia del
punto 1.1), los pagos borrados **sí cuentan**. Es decir: si el club facturó marzo a 40
jugadores y luego borró 10, marzo sigue contando como un mes facturado.

**Los anulados no protegen en un caso:** si a un jugador se le anuló su trimestre, ese
trimestre anulado **ya no lo excluye** de recibir mensualidades. Es correcto —un trimestre
anulado no cubre nada— pero conviene saberlo por si hubo anulaciones administrativas.

---

## 4. Cómo se deshace si sale mal

> ### 🔴 **La vuelta atrás no es limpia. Hay que decirlo con esas palabras.**

Cada cobro creado por el backfill lleva una marca oculta en sus comentarios
(`[backfill:bulk-assign]`) que permite identificarlos y tratarlos todos juntos. Eso es lo
bueno. El problema es qué se hace con ellos.

**Hay dos formas de deshacerlo, y ninguna es gratis:**

### Opción A — borrarlos

Es lo que el comando sugiere hoy. **Es la opción que recomendamos NO usar**, y contradice
la propia regla de Widdo sobre operaciones de dinero.

Motivo: cada cobro creado consume un **número consecutivo** del club. Si después se
borran, quedan **huecos en la numeración**. Para una contadora, un hueco en un consecutivo
es una bandera roja de auditoría — y siendo ABA una corporación legalmente constituida,
eso es un costo real, no una molestia estética.

### Opción B — anularlos

Se marcan como anulados con motivo y responsable, conservando su número. Es lo correcto
contablemente, pero:

- **Las familias los verán.** Aparecerán como cobros anulados en su historial. No
  desaparecen.
- **Si alguna familia ya pagó uno**, no se puede anular automáticamente. Queda marcado
  como *"requiere decisión"* y alguien del club tiene que resolver caso por caso: se
  queda, se aplica como crédito, o se devuelve.

### La conclusión honesta

**La ventana para deshacerlo limpiamente se cierra en cuanto la primera familia paga.**
Antes de eso, anular es incómodo pero manejable. Después, cada pago recibido es una
conversación individual con una familia.

Por eso la recomendación es: **revisar la lista completa antes, no después.**

### Un dato que juega a favor

Crear estos cobros **no dispara correos automáticos a las familias.** El sistema de
recordatorios solo empareja fechas exactas (3 días antes del vencimiento, el día, y 5 días
después), y unos vencimientos de hace meses nunca vuelven a caer en esa ventana.

**Pero sí aparecen de inmediato en la app.** Si una familia entra a mirar, los ve. No hay
período de gracia silencioso.

---

## 5. Qué NO cubre este backfill

Todo esto sigue siendo trabajo manual del club, antes o después de ejecutar:

| Queda fuera | Por qué | Quién lo resuelve |
|---|---|---|
| **Los trimestres vencidos sin renovar** | Están registrados como "Pago Único": el sistema los genera una vez y nunca más. La renovación es 100% manual | El club, uno por uno |
| **Los duplicados que ya existen** (Maria Fernanda) | El backfill solo *crea* lo que falta. No borra ni corrige lo que ya está mal | Decisión del club, caso por caso |
| **Los becados al 100%** | Se descartan por quedar en cero (Hallazgo 4) | Pendiente de corrección en Widdo |
| **Saber qué meses cubre cada trimestre pagado** | El dato no existe en ningún sitio. Solo lo sabe quien lo cobró | **Solo ustedes** |
| **Quién paga trimestral y quién mensual** | Widdo ya tiene el campo desde este mes, pero **no sabemos si está relleno para los jugadores de ABA**, y el backfill no lo consulta de todos modos | El club lo declara; Widdo lo carga |
| **Los meses en que ABA no cobra** (vacaciones) | El backfill no consulta esa configuración | Verificar antes de ejecutar |
| **El cierre contable** | Si la contadora ya cerró meses, el backfill los reabriría. No consulta el cierre | **Decisión de la sección 6** |
| **Cobrar a quien nunca ha pagado nada** | "No tiene cobro generado" y "tiene cobros y no paga" son problemas distintos | Gestión de cobranza, no backfill |

---

## 6. Lo que necesitamos que ustedes decidan

Esta es la parte importante. **Sin estas respuestas no se ejecuta nada.**

### D1 · ¿Se cobra el pasado, o solo se ordena de aquí en adelante?

Es la pregunta de fondo. Tres caminos:

- **(a) Reponer todo** lo que falta desde febrero, y cobrarlo.
- **(b) Reponer todo, pero sin cobrarlo**: dejarlo registrado como exonerado o como
  histórico, para que las cuentas del club cuadren sin pedirle plata a nadie.
- **(c) No tocar el pasado.** Empezar limpio desde el mes que ustedes digan.

Las tres son legítimas. **(c) es la más segura con las familias; (a) es la única que
recupera plata; (b) es la que arregla los números sin arriesgar la relación.**

### D2 · ¿Desde qué mes?

Si la respuesta a D1 es (a) o (b): ¿desde febrero, o hay un mes a partir del cual tiene
sentido y antes no?

### D3 · ¿Con qué fecha aparecen los cobros?

Dos opciones, y afecta directamente a la contadora:

- **Con la fecha del mes al que corresponden** (febrero aparece fechado en febrero). Es lo
  que hace el comando hoy. **Reabre meses que la contadora pudo haber cerrado ya.**
- **Con la fecha de este mes, indicando a qué mes corresponden** (aparece en agosto, dice
  "corresponde a febrero"). No toca lo cerrado. **Esta opción todavía no está construida
  en el comando** — es trabajo adicional, no mucho, pero hay que hacerlo antes.

**Pregunta concreta para la contadora: ¿hasta qué mes está cerrado el libro?**

### D4 · La lista de quién paga trimestre

Necesitamos, por escrito y jugador por jugador:

1. **Quién paga por trimestre** hoy (sabemos que son unos 6, pero no sabemos cuáles con
   certeza).
2. **Qué meses cubre cada trimestre que ya pagaron.** Este es el dato que **no existe en
   ningún sitio del sistema** y sin el cual todo lo demás es conjetura.
3. **Desde cuándo** cada uno está en trimestre.

> Sin el punto 2, la única protección posible es la exclusión completa de esos jugadores
> (la Capa A), que es prudente pero también significa que si alguno de ellos tiene meses
> mensuales realmente sin cobrar, **no se le repondrán**.

### D5 · Los tres casos con nombre

- **Maria Fernanda (290):** tiene mensualidad y trimestre de febrero. ¿Cuál se queda?
- **Helen (210):** sin cobrar desde marzo. ¿Se le repone? ¿mensual o trimestre?
- **Antonia (746):** entró el 23 de marzo, solo tiene matrícula. ¿Se le reponen los cuatro
  meses? ¿desde cuál?

### D6 · ¿Se avisa a las familias, y cómo?

Si se ejecuta, **los cobros aparecen en la app de inmediato** (no se manda correo, pero se
ven). ¿Prefieren avisar ustedes antes, que Widdo prepare un texto, o no avisar?

Presentarle a una familia 99 cobros de febrero sin contexto es el peor escenario posible
para la relación del club con sus padres. **Esta pregunta importa tanto como las
técnicas.**

### D7 · ¿Y los becados?

Un jugador con beca del 100% no recibiría nada (Hallazgo 4). ¿Prefieren que se le cree el
cobro en $0 —para que quede constancia de que está atendido— o que se quede como está?

---

## Cómo seguiría esto si dan luz verde

En este orden, y con parada obligatoria entre el 3 y el 4:

1. **Comprobaciones previas** (sin escribir nada): verificar cómo están registrados los
   dos trimestres de ABA, si el cierre contable está configurado, si los meses sin cobro
   están declarados, y si la modalidad de pago está cargada para los 6 jugadores de
   trimestre.
2. **Cargar en el sistema** las respuestas de D4 (quién paga trimestre y qué meses cubre
   cada uno) y clasificar los cobros del club para que el sistema sepa distinguir una
   cuota de un uniforme.
3. **Correr la revisión en modo lectura** y entregarles **la lista completa**: nombre,
   mes, monto, motivo. Y también la lista de descartados y por qué — un salto silencioso
   se lee igual que "no le faltaba nada", y no es lo mismo.
4. **⏸️ PARADA. Ustedes aprueban la lista.** Fila por fila si hace falta.
5. **Ejecutar**, con confirmación explícita.
6. **Verificar** contra la lista aprobada: lo creado tiene que ser exactamente lo
   revisado, ni una fila más.

---

<details>
<summary><strong>Anexo técnico</strong> — para el equipo de Widdo, no para la lectura del club</summary>

### Origen de cada cifra citada

| Cifra | Fuente | Fiabilidad |
|---|---|---|
| 99 cobros / 70 jugadores / $12.503.700 / 8 descartados | Corrida en seco del 30-jul-2026, memoria `backfill-cobros-aba-jul2026` | **Sin validar con el club.** R11 del spec la marca explícitamente como preliminar. Desactualizada en ~5 semanas |
| ≥3 pagos para dar un mes por facturado | `BackfillMissingMonthlyCharges.php:52` (`MIN_PAYMENTS_TO_CONSIDER_MONTH_BILLED`) | Código actual |
| 12 trimestres de ABA con periodo desconocido (0,4% de 3.063 pagos vivos) | Docblock de `BackfillPaymentCoveredPeriods.php:24-31` | Medido sobre producción por quien escribió el comando |
| 35 cobros vivos, todos con `concept = NULL` | Migración `2026_08_04_000200:29-31` + docblock de `ChargeGenerationGuards.php:338-344` | Estado al escribir esas líneas; **no reverificado** |
| ch22 "Trimestre Sub 13-18" → 104 jugadores, 6 lo pagan | Memoria `modalidad-pago-jugador-falta-jul2026` | 30-jul |
| Maria Fernanda (290), Helen (210), Antonia (746) | Memoria `backfill-cobros-aba-jul2026` | 30-jul |
| ABA tiene política `full` (mes de ingreso completo) | Comentario en `BackfillMissingMonthlyCharges.php:341-343` | Código actual |

### Los cuatro hallazgos, con ubicación exacta

**H1 — el backfill no usa ninguno de los guards de Fase 2.**
`app/Console/Commands/BackfillMissingMonthlyCharges.php` no referencia
`ChargeGenerationGuards`, `puedeGenerarCuota`, `cruceDeCuota`, `sirveLaModalidad` ni
`ClosedPeriodGuard`. Crea con `PlaClubTeamPayment::create()` directo (línea 471). Su única
defensa es `skipReason()` (líneas 255-305) y la re-comprobación de existencia por
`charge_id` + año/mes de `due_date` (líneas 457-463) — que no ve un cruce entre cobros
distintos, que es exactamente el caso de ABA.

Los seis sitios que **sí** llaman a los guards: `GenerateMonthlyPayments.php:339`,
`ChargeService.php:183`, `PlaClubTeamChargeController.php:1321` y `:2479`,
`PaymentModalityService.php:378`, `ChargeLifecycleService.php:475`.

**H2 — R1 no bloquearía los trimestres de ABA aunque se cableara.** Doble motivo:
- `ChargeGenerationGuards.php:208-219`: un pago sin `covers_from`/`covers_to` con
  `covers_reason = unknown` va a `indeterminados` y **no bloquea**. Los 12 trimestres de
  ABA están exactamente así (`CoveredPeriodResolver.php:75-77`, rama
  `monthsPerPeriod() === null`).
- Si `concept` sigue NULL en los 35 cobros vivos, el propio pago nuevo nacería sin ventana
  (`CoveredPeriodResolver.php:44-46`, "cobro sin clasificar"), y `cruceDeCuota()` sale
  inmediatamente por `ChargeGenerationGuards.php:122-124` devolviendo `solapa => false`.
  Y los trimestres tampoco entrarían en `$cuotas` (filtro `concept = training_fee`, línea
  157), sino en `$sinClasificar` (líneas 177-203) → `indeterminados`, no bloqueo.

→ Prerrequisito real: correr `charges:classify-concepts --club=4` y
`payments:backfill-covered-periods --club=4`, **y resolver a mano los 12 trimestres**,
antes de que R1 signifique algo aquí.

**H3 — la exclusión de la Capa A depende de `apply_to`.** `skipReason()` líneas 268-276:
exige `apply_to = by_category` **y** `is_enrollment_fee = false` **y** no estar entre las
mensualidades. Un trimestre registrado como `specific_players` o `all` **no excluye a
nadie**. El test que cubre esto (`test_player_paying_a_quarterly_fee_is_skipped`,
`BackfillMissingMonthlyChargesTest.php:309-343`) fabrica el trimestre como `by_category`,
así que **el hueco no está cubierto por ninguna prueba**. Verificable con una consulta de
lectura sobre los cobros de tipo trimestre del club 4.

**H4 — R10 sigue sin cumplirse.** `BackfillMissingMonthlyCharges.php:238-241` descarta
`amount <= 0`. El spec lo señala literalmente en R10 (línea 492) como defecto pendiente.

### Otros incumplimientos del comando frente al spec

- **R5 / `closed_until`**: no se consulta `ClosedPeriodGuard` (existe y expone
  `assertPaymentWritable()`). El comando fecha en el pasado (`dueDateFor()`, líneas
  407-416).
- **Restricción explícita de Miguel** ("generar con fecha del mes actual indicando a qué
  mes corresponde"): **sigue sin existir la opción**. Firma del comando, líneas 32-38.
- **`non_billing_months` (§5.4)**: no se consulta. Riesgo bajo por el ancla de ≥3 pagos,
  pero no es cero si el club declara ahora un mes que históricamente sí facturó.
- **`payment_modality` (Fase 2.1)**: el campo que supuestamente desbloqueó esto no lo lee
  el comando. Se sigue usando la heurística de julio.
- **Reversión**: la línea 131 sugiere borrar. Contradice R4 (spec línea 486). Cada fila
  consume consecutivo (`PlaClubTeamPayment.php:28-30`).

### Lo que juega a favor (ya está bien resuelto)

- **Mora**: los pagos repuestos nacen exentos automáticamente por fecha, sin marca que
  nadie tenga que acordarse de poner. `ApplyLateFees::isExemptByLateCreation()`
  (`app/Jobs/ApplyLateFees.php:155-166`), coherente con
  `ChargeGenerationGuards::naceExentoDeMora()` y con un test que vigila que no se separen.
- **`ClubScope` no interfiere en CLI**: sin usuario autenticado el scope no aplica
  (`app/Scopes/ClubScope.php:26-31`), así que las consultas del comando ven las filas del
  club. No hay riesgo de un guard ciego por esta vía.
- **Dry-run por defecto** + `--execute` + confirmación interactiva + marcador de reversión.
- **21 pruebas** sobre el comando, incluida la no-recreación de borrados y el respeto a la
  fecha de ingreso.

### Confirmación

**No se ejecutó ningún comando de escritura.** Ni backfill, ni migración, ni `tinker`, ni
dry-run. No se estableció conexión con producción. Todo lo anterior sale de leer código,
migraciones, pruebas, el spec y las memorias del proyecto.

</details>
