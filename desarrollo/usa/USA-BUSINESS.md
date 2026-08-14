# Widdo USA — Negocio, Mercado y Ventas

> **Mercado:** $54B youth sports USA, 55M atletas, 73% sin software
> **Pilotos:** The Academy CFL + SEPA (Orlando, FL)
> **Pricing:** $99 / $199 / $349 USD/mes — el plan se elige por **cantidad de jugadores**, no por modulos
> **⚠️ Gate 0 abierto:** Stripe esta integrado pero produccion sigue en `sandbox`.
> Hasta cerrar Gate 0 (llaves live) **no se puede cobrar un dolar real** a ningun club.
> **Ventana de onboarding de clubes: enero 2027.**

---

## Target customer

Athletic Directors, owners y fundadores de organizaciones deportivas:

| Tipo | Ejemplo | Atletas | Cobra por atleta | Precio Widdo |
|------|---------|---------|-----------------|-------------|
| Club deportivo | Club de basketball, soccer, baseball | 50-300 | $100-$300/mes | $99-$199/mes |
| Entrenador personal | Trainer que prepara jugadores para college | 10-30 | $50-$200/hora | $99/mes |
| Travel team / AAU | AAU basketball team | 12-50 | $1,500-$5K/temporada | $99/mes |
| Prep academy | SEPA, The Academy CFL | 100-500 | $5K-$50K/año | $199-$349/mes |
| Rec league | Liga municipal | 50-200 | $100-$300/temporada | $99/mes |
| Multi-sport facility | Complejo con 3+ deportes | 200-1000+ | Varia | $349/mes |
| School athletic dept | High school athletics | Varsity + JV + Freshman | $199/mes |

**Cualquier deporte, cualquier edad, individual o colectivo.**

Un trainer se registra como "club" de 1 persona. Cobra $50-$200/hora. 20 clientes = $8K-$15K/mes. $99/mes de Widdo es nada. NCAA tracker es su killer feature.

---

## ¿Que usan hoy?

| Herramienta | Para que | Problema |
|-------------|----------|----------|
| Google Forms | Registro de atletas | No conecta con nada |
| Excel / Google Sheets | Rosters, pagos, tracking | Manual, se pierde |
| Venmo / Zelle / checks | Cobrar | Sin tracking, padres dicen "ya pague" |
| GroupMe / iMessage | Comunicacion | Caotico, se pierde info |
| Carpetas fisicas | Physicals, waivers, background checks | Se vencen sin aviso |
| Notas del telefono | Evaluaciones, recruiting notes | No compartible |

**Resultado:** 10+ horas/semana en tareas administrativas.

---

## Pain points principales

1. **Cobrar mensualidades** — perseguir padres, tracking manual, metodos fragmentados
2. **Compliance** — physicals vencidos sin aviso, coaches sin background check, panico si hay auditoria
3. **Registration** — Google Forms → copiar a Excel → copiar a otro Excel. Triple data entry
4. **Comunicacion** — padres preguntando lo mismo 50 veces por email
5. **NCAA/recruiting** — GPA, core courses, universidades interesadas... todo en la cabeza del coach
6. **Tryouts** — evento mas importante del año, todo en papel y email

---

## ¿Que les da Widdo?

| Pain point | Widdo | Hoy | Ahorro |
|------------|-------|-----|--------|
| Cobrar | Cobros automaticos, Stripe Connect, status en tiempo real, recibos | Venmo + Excel | 5+ hrs/semana |
| Compliance | Semaforo verde/amarillo/rojo por atleta, alertas automaticas 30 y 7 dias | Carpetas fisicas | Cero multas |
| Registration | Link publico → registro digital + firma de waivers + datos centralizados | Google Forms | Triple entry → cero |
| Comunicacion | Notificaciones, emails automaticos, AI assistant | GroupMe + email | Padres no preguntan |
| NCAA | GPA, 16 core courses, regla 10/7, college interests | Cabeza del coach | Pitch a padres |
| Tryouts | Publicar, registrar, evaluar, comunicar, convertir | Papel + email | 100% digital |
| Asistencia | Control por sesion, reportes, % por atleta | Lista en papel | Data real |
| Calendario | Eventos, practicas, juegos, visible para padres | iMessage | Padres ven todo |
| Rosters | Perfiles completos, datos medicos, emergency contacts | Excel | Info al instante |
| Finanzas | P&L, ingresos vs gastos, cobros vencidos | Excel manual | Visibilidad real |

---

## Diferenciadores (lo que NADIE mas tiene)

### 1. AI Agent operativo
No es solo un chat que responde preguntas. Es un agente que ayuda a gestionar la operacion:
- resume estado del club en tiempo real (pagos, asistencia, compliance)
- propone y ejecuta acciones de seguimiento administrativo
- acelera trabajo operativo del owner/director sin depender de procesos manuales

**No existe esta combinacion de gestion + accion asistida por IA en competidores tradicionales.**

### 2. Compliance Dashboard completo
Todos los requisitos en UN semaforo por atleta. El owner configura cuales aplican a su club. Ver `USA-COMPLIANCE.md` para detalle legal.

### 3. Stripe Connect Marketplace
- Cada club recibe pagos directamente en su cuenta Stripe (Connected Account)
- Widdo cobra `application_fee` por transaccion (configurable por plan)
- Zero friction: el cobro del club entra directo a Stripe Connected Account → Widdo toma comision automatica
- Club ve sus payouts en dashboard de Widdo
- Modelo marketplace genera revenue adicional sobre cada transaccion
- Para el club: estructura clara de cobro y liquidacion desde Stripe, sin capas operativas extra
- Los competidores cobran fees adicionales sobre cada transaccion (TeamSnap 3.25% + $1.50, SportsEngine ~3.25% + fees)

> **⚠️ Ojo al vender esto:** Stripe Connect esta implementado y probado, pero
> produccion corre en `sandbox`. **Hasta cerrar Gate 0 (llaves live) no entra dinero
> real ni se cobra application fee.** Se puede demostrar; no se puede facturar.

### 4. Tres verticales integradas
- **Widdo Clubs** — gestion del club (lo que se vende primero)
- **Widdo Tournaments** — torneos, inscripciones, brackets, resultados
- **Widdo Academy** — capacitacion para coaches y staff

Un club inscribe equipos en torneos y sus coaches se capacitan, todo dentro de Widdo.

> **⚠️ Tournaments todavia no es facturable.** El motor de torneos existe, pero
> las inscripciones y los pagos de torneo dependen de la misma pasarela: **hasta
> cerrar Gate 0 (Stripe live) no se factura nada de Tournaments.** Va en el plan Pro
> como valor incluido, no como linea de ingreso activa.

### 5. Multi-sport
PlayMetrics = solo soccer. GameChanger = solo baseball/softball. TeamSnap = generico pero basico.
**Widdo sirve para cualquier deporte** con la misma profundidad.

### 6. Multi-country desde el dia 1
Mismo producto sirve CO, US, BR. No es un producto USA transplantado a LATAM.

---

## Mercado USA — Datos verificados (Feb 2026)

| Metrica | Valor | Fuente |
|---------|-------|--------|
| Mercado youth sports USA | $54B anuales | YSBR 2025 |
| Atletas juveniles organizados | 55M | Project Play / SFIA 2024 |
| Software gestion deportiva | $1.36B en 2025, CAGR 12.5% | Industry reports |
| Proyeccion software 2034 | $3.93B | Industry reports |
| Ligas sin software especializado | 73% | Market research |
| Gasto promedio por familia | $1,016/año por hijo (+46% desde 2019) | Aspen Institute |
| Fee promedio de registro | $197/temporada | Project Play |

---

## Competencia — Pricing real verificado

| Plataforma | Fee mensual | Transaction fees | Costo REAL ($5K/mes procesados) |
|------------|------------|-----------------|-------------------------------|
| TeamSnap | $50+ | 3.25% + $1.50/tx | **~$227+** |
| SportsEngine | $79-$129 | ~3.25% + fees | **~$275-310** |
| Jersey Watch | $29-$79 | 3.5% + $1.00/tx | **~$264** |
| **Widdo** | **$99** | **$0 (solo Stripe Connect 2.9%)** | **$244** |

Con $10K/mes procesados la diferencia es aun mayor — competidores cobran $400+, Widdo sigue en $389.

### Eventos de mercado
- **PlayMetrics + Stack Sports** se fusionaron (junio 2025, Genstar Capital) — hueco en mid-market
- **Arbiter compro rSchool** (enero 2025) y lo cierra 2026-2027 — miles de schools migrando
- **TeamSnap** muestra ADS a los padres — los padres lo odian
- **SportsEngine** cobra transaction fees altisimos — los clubes se quejan

---

## Pilotos Orlando

### The Academy CFL
- 5 deportes (basketball, baseball, soccer, volleyball, tennis)
- Fundadores puertorriquenos (Dalmau)
- 60+ atletas en universidades
- **Usan Google Forms** — pain point perfecto

**Argumento:** "Reemplacen Google Forms, cobren con tarjeta, vean compliance en un semaforo, y tengan un AI assistant — por $99/mes y $0 de transaction fees."

### SEPA — Southeastern Preparatory Academy
- 6 deportes, Pre-K a 12
- CEO: Hank Waters (Super Fan #1 Orlando Magic, courtside seats)
- $1.5M revenue
- Anthony Black (Magic guard) tiene hermano ahi

**Argumento:** "Manejen 6 deportes, 500 atletas, compliance de Florida, y NCAA tracking para jugadores que van a college — todo en una sola app."

### Para un trainer independiente
"Muestrale a cada padre el GPA de su hijo, las core courses que le faltan, y el perfil de recruiting — todo desde tu celular por $99/mes."

---

## Pricing USA

**La palanca del precio es la CANTIDAD DE JUGADORES (`max_members`), no los modulos.**
Todos los planes abren practicamente todo el producto; lo que cambia es cuantos
atletas caben. No vender "desbloquea el modulo X pagando mas".

| Plan | Precio | Tope de jugadores | Para quien |
|------|--------|-------------------|-----------|
| Starter (`basico`) | $99/mes | 80 | Clubs pequeños, trainers, travel teams |
| Pro | $199/mes | 200 | Clubs medianos, incluye AI + Tournaments |
| Enterprise | $349/mes | 500 (tope self-serve; >500 → plan a medida) | Academias grandes, ligas |

Verificado en `saas_sport/database/seeders/SubscriptionPlansSeeder.php`
(9900 / 19900 / 34900 centavos USD; `max_members` 80 / 200 / 500).

**Anual: paga 12 meses, recibe 13** (~8% de descuento efectivo, `yearly_discount_percent = 8`).

### Por que estos precios y no menos
- **$99 Starter:** bajo $100 psicologico, mas barato que cualquier competidor en costo real
- **$199 Pro:** incluye IA + Tournaments. 10x mas producto que SportsEngine. Para clubs con $10K+/mes procesados, total cost es similar
- **$349 Enterprise:** hasta 500 atletas. Mas barato que TeamSnap custom ($400-600)

> **⚠️ Nada de esto se cobra todavia.** El cobro de la suscripcion pasa por Stripe y
> produccion sigue en `sandbox`. **Gate 0 (llaves live) es condicion previa a
> facturar el primer plan.**

---

## Argumentos de venta por tipo de org

| Tipo | Argumento principal |
|------|-------------------|
| Club deportivo | "Todo en uno: cobros, roster, asistencia, calendario, compliance — $99/mes, $0 transaction fees" |
| Trainer | "NCAA tracker para tus atletas + cobra con tarjeta — por $99/mes" |
| Travel team | "Roster, pagos de $1,500+ por temporada, compliance — sin perseguir padres" |
| Prep academy | "6 deportes, 500 atletas, compliance FL, NCAA tracking — una sola app" |
| Rec league | "Registro online, cobro automatico, bye Google Forms — mas simple que TeamSnap" |

---

## Proximos pasos (GTM)

**Ventana de onboarding de clubes: enero 2027.** (Antes se apuntaba a julio 2026;
esa fecha ya paso y quedo desplazada.)

0. **Gate 0 — Stripe live.** Bloqueante duro: sin llaves live no hay cobro de
   suscripcion ni de torneos. Todo lo de abajo cuelga de esto.
1. Fases 1-10 implementadas (ver `USA-PROGRESS.md`); Fase 11 sigue abierta
2. Demo con The Academy CFL
3. Feedback → ajustes → onboarding SEPA
4. Primeras referencias USA → escalar en Florida
5. Publicar caso de exito → credibilidad para otros ADs
6. Background check law de Florida: **vigente desde el 1-jul-2026**, ya no es
   "va a entrar" sino "los clubes ya estan fuera de norma si no la cumplen" →
   argumento de urgencia real, mas fuerte que antes. Ver `USA-COMPLIANCE.md`
