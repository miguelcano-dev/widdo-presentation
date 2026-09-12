# Glosario de Startup & Levantamiento de Capital — Widdo

Referencia rapida de todos los terminos que un fundador debe dominar al presentar ante inversores.

---

## 1. METRICAS DE REVENUE (Ingresos)

| Termino | Significado | Ejemplo Widdo |
|---------|-------------|---------------|
| **MRR** (Monthly Recurring Revenue) | Ingreso mensual recurrente. Solo cuenta suscripciones activas, no pagos unicos. | 3 clubs × $34 = $101 MRR |
| **ARR** (Annual Recurring Revenue) | MRR × 12. Es como los inversores comparan startups SaaS. | $101 × 12 = $1,212 ARR |
| **ARPC** (Average Revenue Per Club) | Ingreso promedio por cliente al mes. Se calcula dividiendo MRR / numero de clientes. | $34 USD (MRR $101 / 3 clubes pagando) |
| **Revenue** | Ingreso total. En Widdo hoy es **solo suscripciones**: no se cobra comision sobre los pagos de las familias. | Revenue = MRR. No hay segunda fuente |
| **GMV** (Gross Merchandise Volume) | Volumen total de dinero que pasa por tu plataforma (pagos de padres a clubes). No es tu ingreso, pero muestra traccion. | Si 50 clubs procesan $10K/mes cada uno = $500K GMV |
| **NRR** (Net Revenue Retention) | % de ingreso de los mismos clientes del mes anterior. >100% = estan pagando mas (upgrades). <100% = estan cancelando o bajando plan. | Meta: >110% (clubs que crecen upgraden de plan) |
| **GRR** (Gross Revenue Retention) | Como NRR pero sin contar upgrades. Mide solo cancelaciones y downgrades. Nunca puede ser >100%. | Meta: >95% |
| **Payment Processing Fee** | Comision que una plataforma se queda de cada pago de un padre al club. **Widdo cobra 0%**: el dinero va directo a la cuenta del club via Stripe. Es la practica que mas quejas genera contra LeagueApps (~5% por transaccion) y SportsEngine. | Club procesa $10K/mes → Widdo gana $0 extra, y ese es el argumento de venta |

---

## 2. METRICAS DE CRECIMIENTO

| Termino | Significado | Ejemplo Widdo |
|---------|-------------|---------------|
| **MoM Growth** (Month over Month) | Crecimiento porcentual de MRR mes a mes. Inversores quieren ver 15-20% MoM en early stage. | De $101 a $120 = 19% MoM |
| **Churn** (Tasa de cancelacion) | % de clientes que cancelan por mes. En SaaS B2B, <5% mensual es aceptable, <2% es excelente. | Sin dato defendible todavia: 3 clubes pagando y pocos meses de historia. NUNCA presentarlo como "0% churn" |
| **Logo Churn** | % de clientes (logos/marcas) que se van. Diferente de Revenue Churn porque un cliente grande pesa mas. | 1 club de 50 cancela = 2% logo churn |
| **Revenue Churn** | % de ingreso perdido por cancelaciones. Un club de $99 que cancela duele mas que uno de $29. | Club de $99 cancela de $3,000 MRR = 3.3% revenue churn |
| **Cohort Retention** | Cuantos clientes del mes X siguen activos despues de 3, 6, 12 meses. Se presenta como grafico de cohortes. | "90% de clubs del mes 1 siguen activos en mes 6" |
| **CAGR** (Compound Annual Growth Rate) | Tasa de crecimiento anual compuesta. Se usa para describir el crecimiento del mercado, no de tu startup. | Sports tech market: 11.29% CAGR |

---

## 3. METRICAS DE COSTOS Y EFICIENCIA

| Termino | Significado | Ejemplo Widdo |
|---------|-------------|---------------|
| **CAC** (Customer Acquisition Cost) | Cuanto cuesta adquirir 1 cliente nuevo. Incluye marketing, ventas, demos, etc. | $0 actual (organico) / $50 proyectado |
| **LTV** (Lifetime Value) | Valor total que genera un cliente durante toda su vida util. | $34 × 24 meses = $816 |
| **LTV/CAC** | Ratio clave: cuanto ganas por cada dolar invertido en adquisicion. >3x es bueno, >10x es excelente. | $816 / $50 = 16x (excelente) |
| **Payback Period** | Meses para recuperar el CAC de un cliente. <12 meses es bueno, <3 meses es excelente. | $50 / $30 margen = <2 meses |
| **Gross Margin** | (Revenue - Costo de servir) / Revenue. En SaaS, >80% es esperado, >90% es excelente. | ($34 - $4) / $34 = 88% |
| **Burn Rate** | Cuanto gastas al mes para operar. Incluye infra, salarios, marketing, todo. | Hoy: ~$32/mes de infra (sin salarios). Con la ronda: **$14,200/mes** con el vendedor en nomina, $10,600 sin el |
| **Runway** | Meses que puedes sobrevivir con el dinero que tienes, sin ingresos nuevos. Runway = Cash / Burn Rate. | Con la ronda: **18 meses** ($255K comprometidos ÷ $14,200/mes) + $95K de reserva = ~6 meses mas |
| **Break-even** | Punto donde ingresos = gastos. Despues de esto, cada club nuevo es ganancia neta. | ~60 clubs (con equipo de 3 personas) |
| **Cost to Serve** | Costo de infraestructura para servir a 1 cliente. Baja con escala en SaaS. | $4/club (9 clubs) → $0.16/club (200 clubs) |
| **Unit Economics** | El conjunto de metricas por unidad (por club): ARPC, costo, margen, CAC, LTV. Responde "¿el negocio es rentable por cada cliente?" | Slide 13 del deck |

---

## 4. MERCADO (TAM/SAM/SOM)

| Termino | Significado | Ejemplo Widdo |
|---------|-------------|---------------|
| **TAM** (Total Addressable Market) | Mercado total global si vendieras a todos. Es el numero mas grande y mas teorico. | Top-down: $10.2B (software deportivo global, Mordor). Bottom-up USA: 300,000 orgs × $184/mes × 12 = **$662M ARR** |
| **SAM** (Serviceable Addressable Market) | Porcion del TAM que puedes alcanzar con tu producto y geografia. | Top-down: $3.7B (Norteamerica, 36.2% del TAM). Bottom-up: ~100,000 orgs alcanzables × $184/mes × 12 = **$221M ARR** |
| **SOM** (Serviceable Obtainable Market) | Lo que realistamente puedes capturar en 3-5 anos. Es lo que el inversor realmente mira. | **15,000 clubes × $184/mes × 12 = $33.1M ARR** (ver la cadena completa mas abajo) |
| **Market Size** | Tamano del mercado. Se puede medir top-down (TAM→SAM→SOM) o bottom-up (clubs × precio). | Bottom-up al precio de entrada: 300,000 orgs × $99 × 12 = $356M. Con mezcla de planes: $662M |
| **CAGR** | Tasa compuesta de crecimiento anual del mercado. | 11.29% (Mordor Intelligence) |
| **Market Share** | Tu % del mercado. En early stage es minusculo, pero el inversor quiere ver el potencial. | SOM $33.1M / SAM bottom-up $221M = 15%. Sobre la SAM top-down de $3.7B = 0.89% |

### La cadena TAM → SAM → SOM, con la aritmetica al lado

**Regla de este documento: ningun numero de mercado va sin su cuenta.** Si un inversor
no puede reproducir la multiplicacion en una servilleta, el numero no sirve.

**Paso 0 — el ARPC de mezcla ($184/mes).** No todos los clubes pagan lo mismo. El precio va por
**cantidad de jugadores**, no por modulos. Mezcla asumida:

| Plan | Limite de jugadores | Precio | % de la base asumido | Aporte al ARPC |
|------|---------------------|--------|----------------------|----------------|
| Starter | 80 | $99/mes | 60% | $59.40 |
| Pro | 200 | $249/mes | 30% | $74.70 |
| Enterprise (Club+) | 500 | $499/mes | 10% | $49.90 |
| **ARPC de mezcla** | | | **100%** | **$184.00/mes** |

Cuenta: 0.60 × 99 + 0.30 × 249 + 0.10 × 499 = 59.40 + 74.70 + 49.90 = **184.00**.

> **Cambio de precios (2-sep-2026):** Pro paso de $199 a $249 y Enterprise de $349 a $499, por
> feedback de nuestra primera inversora. Starter se queda en $99 a proposito: es la puerta de
> entrada a Florida. Los primeros 25 clubes de Florida entran como **founding clubs**, con precio
> congelado 12 meses. Con los precios viejos el ARPC de mezcla era $154 y el SOM $27.7M; si ves
> esos numeros en material anterior al 2-sep-2026, estan desactualizados.

**Paso 1 — TAM bottom-up:** 300,000 organizaciones deportivas juveniles en USA × $184/mes × 12 = **$662M ARR**.
Si todas pagaran solo el plan de entrada: 300,000 × $99 × 12 = $356M.

**Paso 2 — SAM:** de esas 300,000, no todas son abordables. El ICP son clubes de 50-500 miembros
que hoy no tienen plataforma o usan Google Forms y hojas de calculo. Asumimos ~100,000 (un tercio):
100,000 × $184/mes × 12 = **$221M ARR**.

**Paso 3 — SOM:** lo que se puede capturar en 3-5 anos con un equipo de ventas pequeno:
**15,000 clubes × $184/mes × 12 = $33.1M ARR**. Eso es el 15% de la SAM bottom-up.

> **De donde salia el "$180M" que aparecia antes como SOM (corregido el 13-ago-2026):**
> la fuente es `negocio/MARKET-RESEARCH-USA.md`, que lo justificaba asi:
> "15,000 clubs underserved × $100/mo promedio × 12 meses = $180M". Esa multiplicacion
> da **$18M**, no $180M — sobraba un cero. Un error de un orden de magnitud que se
> propago al deck USA, al pitch script y a este glosario. Corregido en los cuatro sitios.
> Si aparece un "$180M" en material antiguo, esta mal: no es SAM ni SOM, es aritmetica rota.

**Por que la cadena bottom-up ($662M) y la top-down ($10.2B) no coinciden:** son mercados
distintos. El $10.2B de Mordor incluye deporte profesional, gestion de instalaciones,
ticketing y contratos enterprise. El bottom-up cuenta solo lo que Widdo vende: suscripcion
de club juvenil. Al presentar, usar la cadena bottom-up — es la defendible.

---

## 5. LEVANTAMIENTO DE CAPITAL (Fundraising)

| Termino | Significado | Ejemplo Widdo |
|---------|-------------|---------------|
| **Pre-Seed** | Primera ronda de inversion, antes de tener product-market fit claro. Montos: $50K-$500K. | Ronda vigente: **$350K**, primer cierre desde $250K |
| **Seed** | Segunda ronda. Ya tienes traccion, MRR creciendo. Montos: $500K-$3M. | Despues de 200+ clubs |
| **Series A** | Ronda grande para escalar. Ya tienes modelo probado. Montos: $3M-$15M. | Despues de 1,500+ clubs |
| **Valuation (Pre-money)** | Cuanto "vale" tu empresa ANTES de recibir la inversion. | **No aplica a esta ronda.** Widdo levanta con SAFE, que no fija valuacion: fija un cap |
| **Valuation (Post-money)** | Pre-money + la inversion. Es el valor despues de que entra el dinero. | Con SAFE post-money el cap YA es el post-money: los $3M incluyen el dinero que entra |
| **Cap post-money** (Valuation Cap) | El **techo de valoracion** al que un SAFE convierte en acciones. "Post-money" significa que el cap ya incluye el dinero de la ronda, asi que la dilucion se calcula directo: monto ÷ cap. Es el estandar de Y Combinator desde 2018 y es el que usa Widdo. | $350K ÷ $3M = **11,7%** para los inversores. Sin ambiguedad: el fundador sabe cuanto se diluye el dia que firma |
| **MFN** (Most Favored Nation) | Clausula que le da a un inversor el derecho de adoptar los terminos de cualquier SAFE posterior que sea mejor. Protege a quien entra primero. | Todos los SAFEs de esta ronda llevan MFN |
| **Discount** | Descuento sobre el precio de la siguiente ronda. Es la alternativa al cap, o se combina con el. | Widdo **no da descuento**: solo cap. Un SAFE con cap y sin descuento es mas simple y mas favorable al fundador |
| **First Close** (primer cierre) | Cerrar y recibir el dinero de los primeros inversores sin esperar a llenar la ronda entera. | Widdo cierra desde **$250K**; el resto entra en un segundo cierre con los mismos terminos |
| **Dilution** | % que pierde cada socio existente cuando entra inversion nueva. Es inevitable y normal. | Inversores: 8,3% a $250K / 11,7% a $350K. Miguel: 70% → 64,2% ($250K) o 61,8% ($350K). Cuentas completas en la seccion 10 |
| **Term Sheet** | Documento que resume los terminos de la inversion antes de firmar el contrato legal completo. | Un SAFE es tan corto que hace de term sheet y de contrato a la vez. El ejemplo viejo de socios BD esta en `_archivo-negocio/legales/TERM-SHEET-PARTNERSHIP.md` (SUPERSEDED) |
| **Due Diligence** | Proceso donde el inversor investiga todo de tu empresa antes de invertir (finanzas, legal, tech, equipo). | Tener todo documentado acelera esto |
| **Cap Table** | Tabla que muestra quien tiene que % de la empresa. Debe estar siempre actualizada. | Hoy: Miguel 70%, Alwin 30%, sobre 9,000,000 acciones. ESOP del 10% reservado pero **no creado** |
| **Equity** | Porcentaje de propiedad de la empresa. | 6% por socio |
| **Vesting** | Periodo gradual para ganar equity. Protege a la empresa si un socio se va temprano. | 4 anos para socios |
| **Cliff** | Periodo minimo antes de recibir cualquier equity. Si te vas antes del cliff, no recibes nada. | 12 meses |
| **Good Leaver** | Socio que se va por razones justificadas (enfermedad, despido sin causa). Conserva el equity vesteado. | Definido en TERM-SHEET |
| **Bad Leaver** | Socio que se va voluntariamente o por incumplimiento. Pierde todo o la mayoria del equity. | Definido en TERM-SHEET |
| **ESOP** (Employee Stock Option Pool) | % de equity reservado para futuros empleados clave. Se crea antes de levantar capital. | **10% reservado**, todavia sin crear (escenario B de la seccion 10) |
| **Convertible Note / SAFE** | Instrumento de inversion que se convierte en equity en la siguiente ronda. Comun en pre-seed. | **El instrumento de esta ronda**: SAFE post-money estandar de Y Combinator, cap $3M, MFN, sin descuento |
| **Angel Investor** | Persona individual que invierte su propio dinero en startups early-stage. | Los socios BD + posible celebrity |
| **VC** (Venture Capital) | Fondo de inversion que invierte dinero de terceros en startups. Buscan 10x-100x retorno. | Para Series A en adelante |
| **Pitch Deck** | Presentacion de 15-20 slides para convencer inversores. | deck-usa-widdo.html |

---

## 6. MODELO SaaS (Software as a Service)

| Termino | Significado | Ejemplo Widdo |
|---------|-------------|---------------|
| **SaaS** | Software que se vende como suscripcion mensual/anual, no como compra unica. | Widdo cobra $99/$249/$499 por mes (el plan lo define la CANTIDAD DE JUGADORES —80/200/500—, no los modulos: todos los planes traen todos los modulos) |
| **B2B** | Business to Business — vendes a empresas (clubes), no a consumidores finales. | Widdo vende a clubes deportivos |
| **B2B2C** | Vendes a empresas que a su vez sirven a consumidores. | Widdo → Clubes → Padres/Atletas |
| **Multi-tenant** | Una sola instancia del software sirve a multiples clientes, cada uno con sus datos aislados. | Todos los clubes usan la misma app pero solo ven sus datos |
| **Freemium** | Modelo donde ofreces un plan gratis basico + planes pagos premium. | No aplica a Widdo (todos los planes son pagos) |
| **Onboarding** | Proceso de llevar a un nuevo cliente desde que se registra hasta que usa activamente el producto. | Setup del club, importar jugadores, primer cobro |
| **Product-Market Fit (PMF)** | Momento donde tu producto resuelve un problema real y los clientes lo validan pagando y quedandose. | Se demuestra con bajo churn + crecimiento organico |
| **Sticky Product** | Producto dificil de abandonar porque el cliente ya tiene datos, procesos y habitos dentro. | Un club con 200 jugadores, pagos e historial NO se va facilmente |
| **Upsell** | Cuando un cliente existente sube de plan o compra mas features. | Club pasa de Starter $99 a Pro $249 al superar los 80 jugadores |
| **Net Dollar Expansion** | Cuando los clientes existentes generan mas revenue con el tiempo (upsells > churn). | Clubs crecen → mas jugadores → upgrade de plan |

---

## 7. METRICAS QUE UN INVERSOR SIEMPRE PREGUNTA

### Las 3 preguntas obligatorias:

1. **"What's your MRR?"** — Tu ingreso mensual recurrente actual
2. **"What's your churn?"** — Cuantos clientes pierdes por mes
3. **"What's your runway?"** — Cuanto tiempo puedes operar sin levantar capital

### Las 5 preguntas que siguen:

4. **"What are your unit economics?"** — ARPC, margen, CAC, LTV, payback
5. **"What's your CAC and how do you acquire customers?"** — Organico vs pagado
6. **"What's your TAM/SAM/SOM?"** — Tamano del mercado
7. **"What's your moat?"** — Que te hace dificil de copiar (datos, network effects, integraciones)
8. **"What's the ask?"** — Cuanto necesitas y para que lo vas a usar

### Como responder cada una (Widdo):

| Pregunta | Respuesta corta |
|----------|-----------------|
| MRR | "$101 con 3 clubs activos, creciendo organicamente" |
| Churn | "Todavia no hay data suficiente para dar un numero honesto: 3 clubes pagando y pocos meses de historia. Ninguno se ha ido, pero eso no es una tasa de churn" (NUNCA decir "0% churn") |
| Runway | "Hoy el burn de infra son $32/mes. Con la ronda, 18 meses a $14,200/mes de burn, mas $95K de reserva sin comprometer" |
| Unit economics | "88% gross margin, $34 ARPC, $4 cost to serve, LTV/CAC 16x" |
| CAC | "$0 actual — todo es boca a boca y referidos. Proyectamos $50 con marketing" |
| TAM/SAM/SOM | "$662M bottom-up en USA (300K orgs × $184 ARPC × 12), $221M de SAM alcanzable, SOM de $33.1M con 15,000 clubes" |
| Moat | "Multi-sport, multi-language, all-in-one. Data lock-in: clubs con 200+ jugadores no migran" |
| The Ask | "$350K pre-seed en SAFE post-money con cap de $3M, primer cierre desde $250K: 18 meses con el founder full-time, un vendedor en Florida desde el mes 6, y marketing" |

---

## 8. TERMINOS LEGALES

| Termino | Significado |
|---------|-------------|
| **C-Corp** | Tipo de corporacion en USA (Delaware). Es lo que los VCs requieren para invertir. |
| **LLC** | Empresa de responsabilidad limitada. Mas simple pero los VCs no invierten en LLCs. |
| **SAS** | Sociedad por Acciones Simplificada. Equivalente colombiano, util para operar en LATAM. |
| **IP Assignment** | Documento que dice que todo el codigo y propiedad intelectual pertenece a la empresa, no al fundador personalmente. |
| **Non-Compete** | Clausula que impide a socios/empleados crear algo competidor mientras estan en la empresa + X meses despues. |
| **Non-Disclosure (NDA)** | Acuerdo de confidencialidad. Los inversores casi nunca los firman (red flag si insistes mucho). |
| **Drag-Along** | Derecho del fundador mayoritario de forzar a minoritarios a vender si hay una oferta de compra de toda la empresa. |
| **Tag-Along** | Derecho de minoritarios de vender su parte en las mismas condiciones si el mayoritario vende. |
| **Pro-Rata Rights** | Derecho de un inversor a mantener su % en rondas futuras invirtiendo mas. En la ronda de Widdo, solo para tickets de **$50K o mas**. |
| **Anti-Dilution** | Proteccion para inversores si la siguiente ronda es a menor valoracion (down round). |

---

## 9. GO-TO-MARKET (GTM)

| Termino | Significado | Ejemplo Widdo |
|---------|-------------|---------------|
| **GTM** (Go-To-Market) | Estrategia de como vas a llegar a tus clientes y vender. | Florida → Texas → California |
| **PLG** (Product-Led Growth) | Crecimiento donde el producto mismo atrae y convierte clientes (sin equipo de ventas). | Club se registra, prueba, y paga solo |
| **Sales-Led Growth** | Crecimiento donde un equipo de ventas contacta y cierra clientes. | BD partners haciendo demos a clubes |
| **Organic Growth** | Crecimiento sin pagar publicidad (boca a boca, SEO, referidos). | Actual: 100% organico |
| **Paid Acquisition** | Crecimiento pagando publicidad (Google Ads, Facebook Ads, etc.). | Proyectado: $50 CAC |
| **Referral** | Cuando un cliente existente trae nuevos clientes. | Club A recomienda Widdo a Club B |
| **Land and Expand** | Entrar con 1 cliente pequeno y crecer dentro de esa organizacion/liga. | Entrar con 1 club → toda la liga adopta Widdo |
| **ICP** (Ideal Customer Profile) | Descripcion del cliente perfecto. | Club deportivo, 50-500 miembros, sin software actual, en USA/LATAM |

---

## 10. DILUCION EN DETALLE (ronda real: $350K en SAFE post-money con cap de $3M)

> **Ronda vigente, decidida por Miguel el 2-sep-2026.** $350K de pre-seed, con **primer
> cierre desde $250K**, en **SAFE post-money estandar de Y Combinator**: cap de **$3M**, MFN,
> sin descuento, pro-rata solo para tickets de $50K o mas. La aritmetica de abajo esta completa
> y se puede enseñar a un inversor. Lo que sigue abierto: cuanto se llena de verdad la ronda
> (entre $250K y $350K) y si el ESOP se crea antes o despues del cierre.

**Que es un "cap post-money" (definicion, primera vez que aparece).** Un SAFE no fija una
valuacion: fija un **techo** — el cap — al que ese dinero se convierte en acciones cuando llegue
la siguiente ronda de equity. Que sea **post-money** significa que el cap ya incluye el dinero que
entra, y por eso la dilucion se calcula de una sola division: **monto ÷ cap**. Con el SAFE
pre-money antiguo (el de antes de 2018) esa cuenta dependia de cuanto entrara despues, y los
fundadores se llevaban sorpresas. Con el post-money, no hay sorpresa.

### Cap table de HOY (antes de la ronda)

| Socio | Acciones | % |
|-------|----------|---|
| Miguel | 6,300,000 | 70% |
| Alwin | 2,700,000 | 30% |
| **Total** | **9,000,000** | **100%** |

El **ESOP del 10% esta reservado pero NO creado**: no hay acciones emitidas para el pool todavia.
Por eso hay dos escenarios abajo.

### Como funciona la dilucion

La dilucion NO te quita acciones — se **emiten acciones nuevas** para el inversor.
Miguel sigue teniendo sus 6,300,000; lo que cambia es el denominador.

Las tres cuentas, en orden:

1. **% del inversor** = monto ÷ cap
2. **Acciones nuevas** = acciones de hoy × ( % ÷ (1 − %) )
3. **Precio por accion** = monto ÷ acciones nuevas

### Escenario A — sin ESOP (el caso base)

**Primer cierre: $250K sobre un cap de $3M**

- Inversores = $250,000 ÷ $3,000,000 = **8,33%**
- Acciones nuevas = 9,000,000 × (0.0833 ÷ 0.9167) = **818,182**
- Total post-ronda = 9,000,000 + 818,182 = **9,818,182**
- Precio por accion = $250,000 ÷ 818,182 = **$0.3056**

**Ronda completa: $350K sobre un cap de $3M**

- Inversores = $350,000 ÷ $3,000,000 = **11,67%**
- Acciones nuevas = 9,000,000 × (0.1167 ÷ 0.8833) = **1,188,679**
- Total post-ronda = 9,000,000 + 1,188,679 = **10,188,679**
- Precio por accion = $350,000 ÷ 1,188,679 = **$0.2944**

> **Por que el precio por accion BAJA cuando entra mas dinero.** Con un cap post-money el techo
> de $3M es fijo e incluye la ronda: si entran $350K en vez de $250K, esos dolares extra compran
> mas acciones dentro del mismo techo, asi que cada accion sale mas barata. Es lo contrario de lo
> que pasa con un pre-money, y es la razon por la que el fundador debe decidir el tamaño de la
> ronda ANTES de firmar el primer SAFE, no despues.

| Socio | Hoy | Post-ronda con $250K | Post-ronda con $350K |
|-------|-----|----------------------|----------------------|
| Miguel | 70% (6,300,000) | **64,2%** | **61,8%** |
| Alwin | 30% (2,700,000) | **27,5%** | **26,5%** |
| Inversores | — | **8,3%** (818,182) | **11,7%** (1,188,679) |
| **Total acciones** | 9,000,000 | 9,818,182 | 10,188,679 |

### Escenario B — con el ESOP del 10% creado sobre el post-money

El pool de opciones se dimensiona como **10% de la empresa despues de la ronda y despues del
pool**. Diluye a todos proporcionalmente, incluidos los inversores del SAFE.

Cuenta con $350K: acciones post-ronda 10,188,679 ÷ 0.90 = 11,320,755 totales, de las cuales
**1,132,076 son el pool**.

| Socio | Con $250K + ESOP | Con $350K + ESOP |
|-------|------------------|------------------|
| Miguel | **57,75%** | **55,65%** |
| Alwin | **24,75%** | **23,85%** |
| ESOP | 10,00% | 10,00% |
| Inversores | **7,50%** | **10,50%** |
| **Total acciones** | 10,909,091 (pool: 1,090,909) | 11,320,755 (pool: 1,132,076) |

> **Ojo con quien paga el pool.** Si el ESOP se crea **antes** de la ronda, lo pagan solo los
> fundadores (es lo que suele pedir un inversor). Si se crea **despues**, como en la tabla de
> arriba, lo pagan todos. Con un SAFE post-money, el estandar de YC es que el pool posterior
> diluya tambien al inversor — pero es negociable, y hay que leerlo en el documento antes de firmar.

**Miguel se queda por encima del 51% en los cuatro escenarios.** Ese es el punto: la ronda es
pequeña y el cap suficiente para no perder el control.

### Por que la dilucion no importa (lo que importa es el VALOR)

| Etapa | Miguel % | Valor de su parte |
|-------|----------|-------------------|
| Hoy | 70% | Sin valuacion externa |
| Post pre-seed con $250K | 64,2% | 64,2% de $3M = **$1.93M** |
| Post pre-seed con $350K | 61,8% | 61,8% de $3M = **$1.85M** |
| Post Seed $1M @ $6M pre | ~53,0% | 53,0% de $7M = **$3.71M** |
| Post Series A $5M @ $25M pre | ~44,2% | 44,2% de $30M = **$13.3M** |

(Las dos ultimas filas son proyeccion pura: parten del escenario de $350K sin ESOP y asumen que
no se crea pool nuevo en cada ronda, cosa que en la practica si pasa. Y el valor "al cap" no es
un precio de mercado: el SAFE convierte en la siguiente ronda, que puede ser a mas o a menos.)

**Menos porcentaje, pero de una pizza mucho mas grande.**

**Regla: nunca bajar del 51% antes de Series A.** Con esta ronda no se acerca.

### Errores comunes de fundadores

1. "No quiero diluirme" — Tu 100% vale $0 sin capital. Mejor 55% de $30M.
2. "Voy a dar equity a todos" — El equity es irreversible. Cada % que das se arrastra.
3. "Valoracion alta = mejor" — Un cap demasiado alto en pre-seed te condena a un down round si no creces, con clausulas anti-dilution que destruyen tu cap table.
4. Dar mas del 25% total antes de pre-seed — No queda espacio para inversores.
5. **Firmar SAFEs sueltos sin sumar.** Con cap post-money cada SAFE se lleva monto ÷ cap. Cuatro SAFEs de $100K sobre un cap de $3M son 13,3%, no "$100K, es poquito". Llevar el total de la ronda apuntado y no pasarse de $350K sin recalcular.

---

## 11. ESTRUCTURA DE EQUITY CON SOCIOS (BD Partners)

> ⚠️ **Escenario historico, no la cap table vigente.** Esta seccion modela un deal de
> BD partners al 12% que NO es lo que existe hoy. El cap real es Miguel 70% / Alwin 30%
> sobre 9,000,000 acciones (ver seccion 10). Se conserva porque la mecanica —
> como se cotiza equity extra a cambio de dinero — sigue siendo util si aparece
> un socio operativo nuevo.

### Deal recomendado (paquete unico)

| Concepto | Valor |
|----------|-------|
| Equity total | 12% (6% + 6%) |
| Inversion de entrada | $5K-$10K entre los dos (skin in the game) |
| Trabajo | BD & PR en USA |
| Vesting | 4 anos, cliff 12 meses |
| Metricas del cliff | Cumplir 2 de 4 en 12 meses |

Los $10K son el **boleto de entrada** al deal. No compran equity extra — son requisito para demostrar compromiso. El dinero va a la empresa.

### Si quieren MAS del 12%

Deben invertir dinero ADICIONAL por encima de los $10K. Ese dinero extra entra en las condiciones
de la ronda vigente: SAFE post-money con **cap de $3M**, donde el equity es simplemente
monto ÷ cap:

| Escenario | Inversion | Equity trabajo | Equity $ extra | Total |
|-----------|-----------|----------------|----------------|-------|
| Deal base | $10K | 12% | 0,33% | 12,33% |
| Quieren mas | $10K + $15K | 12% | 0,83% | 12,83% |
| Quieren mas | $10K + $25K | 12% | 1,17% | 13,17% |
| Quieren mas | $10K + $50K | 12% | 2,00% | 14,00% |

**Formula:** Equity extra = $ total invertido ÷ $3M. Ej: $60K ÷ $3M = 2,0%.
Cuanto mas alto el cap, menos equity compra el mismo dinero. Con el cap viejo de $1.5M
esos $60K compraban 4,0%; el cap de $3M es la mitad de equity por el mismo cheque.

### Diferencia clave entre los dos tipos de equity

| Tipo | Si no pasan cliff | Si pasan cliff |
|------|-------------------|----------------|
| Sweat equity (12%) | Se pierde | Se gana gradualmente |
| Cash equity ($ extra) | Se conserva (pusieron dinero real) | Se conserva |

Son **dos contratos separados** para proteger a ambas partes.

### Limite recomendado

No dar mas del **18-20% total** a socios operativos antes de pre-seed. Necesitas espacio para:
- ESOP: 10% (reservado, sin crear)
- Celebrity: 3%
- Pre-Seed inversor: 8,3%-11,7% (la ronda real: $250K-$350K sobre cap de $3M)

---

## 12. COMO SE SOSTIENE EL CAP DE $3M

> **El ask vigente (2-sep-2026) es $350K de pre-seed en SAFE post-money con cap de $3M**,
> primer cierre desde $250K. Un SAFE no fija valuacion — fija el techo al que convierte — pero
> ese techo se defiende con las mismas herramientas que una valuacion, y eso es lo que hay abajo.
> El cap de $3M **no se baja**: es el mismo que vio la junta de la primera inversora en marzo de
> 2026, y moverlo hacia abajo seria revisar a la baja el trato de quien confio primero.

### Metodo usado: Berkus + Comparables

La valuacion pre-seed NO se basa en ingresos (son muy bajos). Se basa en **lo que has construido y el potencial**:

**Metodo Berkus (asigna valor a factores de riesgo; hasta $500K por factor):**

| Factor | Rango tipico | Widdo | Valor asignado |
|--------|-------------|-------|----------------|
| Idea/concepto solido | $0 - $500K | Mercado bottom-up de $662M en USA, problema validado en 9 clubes reales | $450K |
| Prototipo/producto funcional | $0 - $500K | Producto completo en produccion con 282K lineas de codigo: agente de IA, torneos, comunicaciones y app nativa. No es MVP | $500K |
| Equipo fundador | $0 - $500K | Fundador tecnico que construyo todo solo, full-time desde el cierre. Falta el musculo comercial — que es justo lo que compra esta ronda | $400K |
| Relaciones estrategicas | $0 - $500K | Mercado LATAM validado, co-founder con red en Orlando, primera inversora comprometida desde marzo | $300K |
| Producto en el mercado / ventas | $0 - $500K | 3 clubes pagando el ano por adelantado, $101 MRR, 1,476 usuarios, 701 jugadores | $300K |
| **Total** | | | **$1.95M** |

La cuenta: 450 + 500 + 400 + 300 + 300 = **1,950**.

Berkus da $1.95M, por debajo del cap de $3M. Eso es **deliberado y correcto**: Berkus es un piso
de valor construido, no un precio de mercado. El cap de un SAFE se fija arriba de ese piso porque
tambien compra la opcion sobre lo que viene — y porque el mercado de pre-seed con producto live y
revenue paga entre $1M y $3M (tabla de abajo). Widdo esta en el techo de ese rango con el unico
argumento que importa a esta altura: el producto ya existe y ya cobra.

**Validacion con comparables:**

| Startup | Stage | Valuacion | Contexto |
|---------|-------|-----------|----------|
| Pre-seed SaaS promedio USA (2025) | Idea + MVP | $500K - $1M | Solo idea y equipo |
| Pre-seed con producto live | Producto + algo de traccion | $750K - $2M | Producto funcionando |
| Pre-seed con revenue | Producto + MRR | $1M - $3M | Ya tienen ingresos |

Widdo esta en la categoria 3: producto completo en produccion + revenue recurrente cobrado por
adelantado. El cap de $3M es el techo de esa categoria, y se sostiene porque:
- El producto no es una promesa: son 282K lineas en produccion con clubes operando encima
- El riesgo tecnico ya esta pagado; lo que compra la ronda es distribucion, que es riesgo mucho mas barato
- Es el cap que ya vio la primera inversora en marzo. La coherencia con quien confio primero vale mas que optimizar unos puntos de dilucion

### Que pasa segun donde pongas el cap

Con el ask real de **$350K**:

| Cap post-money | Inversores reciben por $350K | Lectura |
|----------------|------------------------------|---------|
| $1.5M | 23,3% | Dilucion inaceptable en pre-seed: no queda espacio para la seed |
| $2M | 17,5% | Todavia demasiado caro para el fundador |
| $2.5M | 14,0% | Aceptable, pero por debajo de lo que el producto ya construido justifica |
| **$3M** | **11,7%** | **El cap vigente.** Dilucion sana y coherente con lo comprometido en marzo |
| $4M | 8,8% | El inversor de pre-seed empieza a no ver suficiente upside |
| $6M | 5,8% | Nadie firma — cap de seed sin metricas de seed |

(Cuenta: % de los inversores = monto ÷ cap. Ej: 350 ÷ 3,000 = 11,7%. Con SAFE post-money no hace
falta sumar nada al denominador: el cap ya incluye la ronda.)

### Cuando sube la valuacion

| Hito | Cap / valuacion razonable |
|------|---------------------------|
| Hoy (9 clubes, 3 pagando, $101 MRR, producto completo) | **$3M cap** (la ronda vigente) |
| 50 clubs, $3K MRR | $4M - $6M |
| 100 clubs, $5K MRR — momento de la seed | $6M - $9M |
| 200 clubs, $12K MRR | $8M - $12M |
| 500 clubs, $30K MRR | $15M - $25M |
| 1,500 clubs, $90K MRR | $40M - $70M |

La valuacion sube con traccion demostrada (MRR creciendo, baja churn, expansion geografica).

---

*Creado: 20 de Febrero 2026*
*Actualizado: 2 de Septiembre 2026*
*Referencia: deck-usa-widdo.html, negocio/legales/para-firmar/founders-agreement.html*
