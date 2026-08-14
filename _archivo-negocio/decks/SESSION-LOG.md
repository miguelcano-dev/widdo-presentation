<!-- ARCHIVADO 13-ago-2026 — bitacora de decisiones de feb-2026: cifras y decisiones superadas — sustituido por decks/README.md + git log -->
# Session Log — Investor Decks Widdo

## Fecha: 19 de Febrero 2026

---

## 1. CAMBIOS AL DECK USA (`deck-usa-widdo.html`)

### 1.1 Correccion: Widdo NO es solo para jovenes

Widdo es para clubes de **cualquier deporte y cualquier edad**. El deck original decia "youth sports" en muchos lugares, lo cual subestimaba el mercado.

**Cambios realizados:**

| Slide | Antes | Despues |
|-------|-------|---------|
| 2 (Problem) titulo | "Youth sports has no unified data layer" | "Organized sports has no unified data layer" |
| 2 (Problem) texto | "60 million kids play organized sports" | "150 million Americans play organized sports across all ages" |
| 2 (Problem) cards | "60M Youth athletes in USA" | "150M+ Athletes in organized sports" |
| 3 (Landscape) titulo | "8.3M high school athletes. 60M youth players" | "150M+ Americans play organized sports. Every club, every age, every sport" |
| 3 (Landscape) subtitulo | Solo high school | "From youth leagues to adult recreational, from high school to senior clubs" |
| 3 (Ice hockey) | "Youth ice hockey" | "Ice hockey (all ages)" |
| 4 (Cheer) | "Youth to Open" | "Beginner to elite" |
| 7 (Market) titulo | "A $40B+ industry running on spreadsheets" | "A $40B+ industry — all ages, all sports — running on spreadsheets" |
| 7 (Market) SAM texto | "200K+ youth sports organizations" | "300K+ sports organizations across all ages and sports" |
| 7 (Market) tabla titulo | "USA Youth Sports by the Numbers" | "USA Organized Sports by the Numbers" |
| 7 (Market) tabla filas | Solo youth (60M, 65% ages 6-17) | 150M+ total, 60M youth, 55M+ adult rec, 300K+ clubs |
| 7 (Market) SOM | $120M / 10,000 clubs | $180M / 15,000 clubs |
| 10 (Traction) texto | "Ready for the US market" | "Ready to scale" |
| 11 (Why Widdo) card | "200K+ Youth sports orgs" | "300K+ Sports orgs (all ages)" |
| 21 (Closing) card | "200K+ Sports orgs" | "300K+ Sports orgs" |

### 1.2 Actualizacion de datos verificados

| Dato | Antes | Despues | Fuente |
|------|-------|---------|--------|
| SAM | $3.8B (37.5%) | $3.7B (36.2%) | Coherent Market Insights 2025 |
| TeamSnap pricing (tabla comparativa) | $80-500 | $10-500 | ITQlick/Capterra |
| TeamSnap pricing (texto) | "$80-500/mo" | "$10-500/mo (org plans $80+)" | Verificado Feb 2026 |
| NA market share | 37.5% | 36.2% | Coherent Market Insights |

### 1.3 Fix visual: Timeline dots en Roadmap (Slide 16)

Los dots activos ("NOW" y "IN PROGRESS") tenian un `box-shadow: 0 0 12px` que se renderizaba como un cuadrado verde en el PDF.

**Antes:** `box-shadow: 0 0 12px rgba(22, 163, 74, 0.5)` — blur diffuso, se veia cuadrado
**Despues:** `box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.25)` — anillo sutil alrededor del dot

### 1.4 Font sizes (sesion anterior, registrado para referencia)

Todas las h2 inline se aumentaron +6px para igualar mas al deck en espanol (que usa 48px):
- 28px → 34px (Sports Landscape, Cheerleading, Competition, Unit Economics)
- 30px → 36px (Problem, Market Size, Tech Stack)
- 32px → 38px (Competition vs, Business Model, Tech detail, Roadmap, GTM)
- 34px → 40px (Product, Pyramid, Traction, Why Widdo, Products, Team, Ask)
- Global h2: 36px → 42px

---

## 2. OPTIMIZACION DE PDF

### Problema
El PDF original usaba vectores CSS complejos que el visor re-renderizaba en cada scroll, causando lentitud.

### Culpables identificados

| Elemento CSS | Problema | Impacto |
|--------------|----------|---------|
| `filter: blur(120px)` en bg-blur-1/2/3 | Puppeteer rasteriza cada blur como imagen enorme | Alto |
| `bg-grid` con linear-gradient repeating | ~288 lineas vectoriales por slide × 21 slides | Alto |
| Multiples gradientes por slide | Calculo complejo en cada render | Medio |

### Solucion aplicada

**Blur circles → Radial gradients:**
```css
/* ANTES (pesado) */
.bg-blur-1 { ... filter: blur(120px); }

/* DESPUES (ligero, mismo efecto) */
.bg-blur-1 { ... background: radial-gradient(circle, rgba(22,163,74,0.22) 0%, transparent 70%); }
```

Se subio la opacidad para que los verdes se vean un poco mas:
- bg-blur-1: 0.18 → 0.22
- bg-blur-2: 0.12 → 0.18
- bg-blur-3: 0.06 → 0.10

**Grid CSS → Grid PNG tile:**
- Se creo `grid-tile.png` (278 bytes) con node-canvas
- Reemplaza ~6,000 vectores por una imagen repetida
- Grid spacing: 80px × 80px

**Generacion de PDF rasterizado:**
- Cada slide se captura como screenshot a 2x resolucion (2560×1440)
- Se comprime a JPEG 90% (balance calidad/peso)
- Se arma un PDF con imagenes planas → scroll instantaneo

### Resultado

| Version | Tamano | Calidad | Scroll |
|---------|--------|---------|--------|
| Original (vectores CSS) | 3.3MB | Perfecta | Lento (re-render) |
| Sin blurs (solo gradients) | 1.9MB | Buena | Mejor |
| Con grid PNG + radial gradients | 2.0MB | Buena | Mejor |
| Rasterizado 1x | 3.8MB | Borrosa | Rapido |
| **Rasterizado 2x JPEG 90%** | **5.3MB** | **Nitida** | **Rapido** |

### Script final (`generate-deck-usa.js`)
- `deviceScaleFactor: 2` para capturas a doble resolucion
- `type: 'jpeg', quality: 90` para comprimir sin perder calidad visible
- Cada slide se captura individualmente con `slide.screenshot()`
- Se arma un HTML temporal con las imagenes base64 y se exporta a PDF

---

## 3. MODO PRESENTACION HTML

Se agrego JavaScript al final de `deck-usa-widdo.html` para presentar directamente desde el browser:

| Tecla | Accion |
|-------|--------|
| **F** | Entrar fullscreen + modo presentacion |
| **→** / **Space** | Siguiente slide |
| **←** / **Backspace** | Slide anterior |
| **Home** | Primer slide |
| **End** | Ultimo slide |
| **H** / **?** | Mostrar ayuda |
| **Esc** | Salir de modo presentacion |

**Recomendacion:** Presentar siempre desde el HTML en Chrome/Safari. El PDF es solo para compartir por email/WhatsApp.

---

## 4. DECK LATAM/BRAZIL (`deck-latam-widdo.html`)

Creado como copia del deck USA con adaptaciones para el mercado LATAM:

### Diferencias clave vs deck USA

| Aspecto | USA Deck | LATAM Deck |
|---------|----------|------------|
| Cover | "USA + LATAM + Global" | "LATAM + Brazil + Global" |
| Problema | 150M athletes, spreadsheets | 150M athletes, WhatsApp/notebooks |
| Deportes | HS sports (football, basketball, etc.) | Brazil (futebol, futsal, volleyball) + Spanish LATAM |
| Spotlight | Cheerleading ($2B) | Futsal ($1.5B, 12M athletes) |
| Market size | TAM $10.2B, SAM $3.7B, SOM $180M | TAM $10.2B, SAM $2.8B, SOM $60M |
| Competencia | TeamSnap, SportsEngine, LeagueApps | Generic CRMs, WhatsApp, Local Apps |
| Pricing | $29/$59/$99 | $15/$29/$59 |
| Pasarelas pago | Stripe | MercadoPago + PIX + Stripe |
| Idiomas | Bilingual EN/ES | Trilingual ES/PT/EN |
| ARPC | $59 | $29 |
| LTV | $1,416 | $696 |
| Break-even | ~60 clubs | ~40 clubs |
| GTM | Florida, Texas, California | Scale Colombia → Enter Brazil |
| Roadmap | USA Launch (Stripe + English) | Brazil Launch (PIX + Portuguese) |
| Milestones | USA clubs | CO+BR+MX+AR+CL |

---

## 5. INVESTIGACION DE MERCADO

Documento completo guardado en: `MARKET-RESEARCH-USA.md`

### Fuentes principales verificadas (Feb 2026)

| Fuente | Dato clave | Link |
|--------|-----------|------|
| NFHS 2024-25 | 8.3M HS athletes (record) | nfhs.org |
| SFIA 2025 Topline | 247.1M Americans activos | sfia.org |
| NCYS | 60M youth registrados | ncys.org |
| Aspen Institute | +46% costos, 65% participation rate | projectplay.org |
| Mordor Intelligence | TAM $10.2B, CAGR 11.29% | mordorintelligence.com |
| Coherent Market Insights | NA share 36.2% | coherentmarketinsights.com |
| ITQlick/Capterra | TeamSnap $10-500, SportsEngine $79+ | itqlick.com, capterra.com |
| US Census | 62M+ hispanos en USA | census.gov |

### Datos estimados (defensibles pero no verificables con fuente unica)

- 150M+ en deportes organizados (conservador vs 247M total SFIA)
- 300K+ organizaciones deportivas (combinando youth ~200K + adult rec ~100K+)
- 55M+ adultos en ligas recreativas
- 3.8M cheerleaders total
- $2B industria del cheer

---

## 6. DISCUSION DE PARTNERSHIP E INVERSION

### Estructura recomendada para socios (BD Partners)

| Concepto | Valor |
|----------|-------|
| Equity total | 10-12% combinado (5-6% cada uno) |
| Vesting | 4 anos, cliff 12 meses |
| Inversion entrada | $5,000-$10,000 USD entre los dos |
| Rol | PR & Business Development USA |
| Miguel retiene | 88-90% + control total |

### Metricas del cliff (12 meses, cumplir 2 de 4)

1. 15 clubes en USA pagando
2. $3,000 USD en MRR internacional
3. 1 celebrity deal cerrado (jugador NBA o similar)
4. $15,000 USD en capital levantado

### Celebrity deal (jugador NBA)

| Opcion | Que recibe | Que hace |
|--------|-----------|----------|
| A — Solo imagen | Fee $10K-25K/ano | Nombre + 2-4 posts/trimestre |
| B — Advisory + equity | 3-5% equity | Imagen + advisory board |
| C — Inversor + imagen | 5-8% equity por $25K-$100K | Todo lo anterior + capital |

### Cap table proyectada

| Etapa | Miguel | Socios | Celebrity | Inversor |
|-------|--------|--------|-----------|----------|
| Post-socios | 88% | 12% | — | — |
| + Celebrity (Opcion B) | 83-85% | 12% | 3-5% | — |
| + Pre-Seed $100K@$750K | ~73% | ~10% | ~2.6% | ~12% |

### Los $10K de inversion

- **Siempre van a la empresa**, nunca a cuenta personal
- Opcion A: Inversion a riesgo (pierden si no pasan cliff) — mas estandar
- Opcion B: Con devolucion si no pasan cliff — mas amigable

### Script / Talking Points para socios

Se discutio crear un "Partner Playbook" de 1 pagina con:
- Elevator pitch de 30 segundos
- Tabla de preguntas frecuentes con respuestas correctas
- Reglas de oro (nunca prometer equity, nunca hablar de valoracion, siempre cerrar con "schedule a call with our founder")
- **Pendiente: crear el documento formal**

### Payment Processing Fee (explicacion)

Revenue stream complementario (~20% del revenue). Widdo cobra un pequeno % (2-3%) sobre cada pago que un padre hace al club a traves de la plataforma. Es adicional a la suscripcion mensual y escala con el volumen de pagos del club.

---

## 7. ARCHIVOS CREADOS/MODIFICADOS EN ESTA SESION

### Creados
- `MARKET-RESEARCH-USA.md` — Investigacion de mercado completa
- `grid-tile.png` — Tile PNG de 278 bytes para el grid del deck
- `decks/README.md` — Indice del directorio de decks
- `decks/SESSION-LOG.md` — Este archivo
- `decks/DECK-GUIDE.md` — Guia tecnica

### Modificados
- `deck-usa-widdo.html` — Cambios de "youth" → "all ages", datos actualizados, optimizacion CSS, modo presentacion
- `generate-deck-usa.js` — Reescrito para generar PDF rasterizado 2x JPEG 90%
- `deck-usa-widdo.pdf` — Regenerado con optimizaciones

### No modificados (referencia)
- `deck-latam-widdo.html` — Creado en sesion anterior, no tocado hoy
- `PARTNERSHIP-STRATEGY.md` — Documento existente, usado como referencia

---

## 8. CAMBIOS ADICIONALES (Sesion continuada)

### 8.1 Slide 4: Cheerleading Spotlight → Multi-Sport Spotlight

El slide 4 estaba dedicado 100% a cheerleading. Se reemplazo completamente con un spotlight multi-deporte.

**Antes:** "The Cheerleading Opportunity" — datos solo de cheer ($2B industry, 3.8M athletes)
**Despues:** "Sports That Power America" — 6 cards con deportes principales:

| Deporte | Dato |
|---------|------|
| Basketball | 29.7M players, fastest-growing |
| Soccer | 14.1M players, youth & adult |
| Football | 5.5M players, 16K+ programs |
| Volleyball | 7.3M players, indoor & beach |
| Swimming | 27.9M participants, year-round |
| Adult Rec Leagues | 55M+ adults, fastest-growing segment |

### 8.2 Slide 3: Cards de Cheerleading → Multi-Sport

Los 4 cards inferiores del Slide 3 (Sports Landscape) destacaban cheerleading. Se reemplazaron:

| Antes | Despues |
|-------|---------|
| Cheerleaders 3.8M (green highlight) | Basketball 29.7M |
| Ice hockey (all ages) | Soccer 14.1M |
| Flag football +60% | Flag football +60% (se mantuvo) |
| Gymnastics 5M+ | 20/24 team sports growing |

Tambien se quito el highlight verde de la fila "Competitive Cheer" en la tabla.

### 8.3 Slide 13: Revenue Projection — Trimestres completos

La proyeccion de revenue solo mostraba Q2 y Q4, saltando Q1 y Q3, lo cual era confuso.

**Antes (semestral):**
| Periodo | Clubs | Revenue |
|---------|-------|---------|
| Q2 2026 | 50 | $3,000/mo |
| Q4 2026 | 200 | $12,000/mo |
| Q2 2027 | 500 | $30,000/mo |
| Q4 2027 | 1,500 | $90,000/mo |
| 2028 | 5,000 | $300,000/mo |

**Despues (trimestral 2026, luego anual):**
| Periodo | Clubs | Revenue |
|---------|-------|---------|
| Q1 2026 | 15 | $900/mo |
| Q2 2026 | 50 | $3,000/mo |
| Q3 2026 | 120 | $7,000/mo |
| Q4 2026 | 200 | $12,000/mo |
| 2027 | 1,500 | $90,000/mo |
| 2028 | 5,000 | $300,000/mo |

**Razon:** El primer ano es el mas importante para un inversor. Mostrar todos los trimestres da una progresion mas creible y demuestra un plan de crecimiento realista. Los anos 2027-2028 se muestran como metas anuales.

### 8.4 Explicacion: Unit Economics (Slide 13 — lado izquierdo)

| Seccion | Que muestra | Por que importa al inversor |
|---------|-------------|---------------------------|
| Per-Club Metrics | ARPC $59, costo $4, margen 93%, CAC $0/$50, LTV $1,416, LTV/CAC 28x | Margen SaaS excelente, crecimiento organico actual |
| Infrastructure cost | DigitalOcean + MySQL $32/mo, Email $0/mo | Operacion ultra-eficiente |
| Break-even ~60 clubs | Punto de equilibrio con equipo de 3 | Riesgo bajo para inversor |

### 8.5 Calculo del Gross Margin (93%)

```
Gross Margin = (Revenue - Costo) / Revenue
Gross Margin = ($59 - $4) / $59
Gross Margin = $55 / $59
Gross Margin = 93.2%
```

**De donde sale el $4 por club:**
- Infraestructura total: $32/mes (DigitalOcean + MySQL + Storage + Email)
- Dividido entre ~8 clubes iniciales: $32 / 8 = $4 por club

**Nota importante:** Este costo **baja** con escala porque $32/mes se divide entre mas clubes:
- 8 clubes → $4/club (93% margen)
- 50 clubes → $0.64/club (98.9% margen)
- 200 clubes → $0.16/club (99.7% margen)

El $4 es conservador (peor caso). El margen real mejora rapidamente con el crecimiento. Es una ventaja clave del modelo SaaS: los costos de infraestructura no crecen linealmente con los clientes.

**Definiciones de las metricas:**
| Metrica | Significado | Valor | Calculo |
|---------|-------------|-------|---------|
| ARPC | Average Revenue Per Club (ingreso promedio por club al mes) | $59 | Precio plan medio ponderado |
| Cost to serve | Costo de infraestructura por club | $4 | $32 infra / 8 clubs |
| Gross Margin | Porcentaje de ganancia bruta | 93% | ($59-$4)/$59 |
| CAC | Customer Acquisition Cost (costo de adquirir 1 club) | $0 actual / $50 proyectado | Actual: organico. Proyectado: con marketing |
| LTV | Lifetime Value (valor total de un club en su vida util) | $1,416 | $59 × 24 meses × 0% churn |
| LTV/CAC | Ratio de retorno por cada dolar invertido en adquisicion | 28x | $1,416 / $50 |
| Break-even | Clubes necesarios para cubrir todos los costos (infra + equipo de 3) | ~60 clubs | Costos totales / $59 ARPC |

---

## 9. DOCUMENTOS DE SOPORTE CREADOS

### SFIA-MARKET-DATA.md
Datos detallados de participacion deportiva en USA basados en SFIA 2025:
- 247.1M americanos activos en deportes
- Desglose por deporte (basketball 29.7M, soccer 14.1M, etc.)
- Adult rec: 19% adultos juegan, 47% Gen Z quiere unirse a ligas
- 250K-350K+ organizaciones deportivas
- Sports tech funding +320% YoY

### TERM-SHEET-PARTNERSHIP.md
Term sheet legal completo con 26 secciones:
- Equity 12% (6% + 6%), vesting 4 anos, cliff 12 meses
- Metricas del cliff, good/bad leaver provisions
- Non-compete, IP protection, confidencialidad
- Celebrity deal structure, ESOP 5%
- Cap table proyectada, recomendacion Delaware C-Corp

### STARTUP-GLOSSARY.md (nuevo)
Glosario completo de terminos de startup y levantamiento de capital con 9 secciones:
1. Metricas de Revenue (MRR, ARR, ARPC, NRR, GRR, Payment Processing Fee)
2. Metricas de Crecimiento (MoM, Churn, Cohort Retention, CAGR)
3. Metricas de Costos y Eficiencia (CAC, LTV, LTV/CAC, Payback, Gross Margin, Burn Rate, Runway, Break-even)
4. Mercado (TAM/SAM/SOM, Market Share)
5. Levantamiento de Capital (Pre-Seed, Seed, Series A, Valuation, Dilution, Cap Table, Vesting, Cliff, SAFE, etc.)
6. Modelo SaaS (B2B, B2B2C, Multi-tenant, PMF, Sticky Product, Upsell)
7. Las 8 preguntas que un inversor siempre hace + respuestas preparadas para Widdo
8. Terminos Legales (C-Corp, LLC, SAS, IP Assignment, Non-Compete, Drag/Tag-Along, Pro-Rata, Anti-Dilution)
9. Go-To-Market (PLG, Sales-Led, Organic, Referral, Land and Expand, ICP)

---

## 10. PENDIENTES

- [ ] Crear el "Partner Playbook" (1 pagina con talking points para los socios)
- [ ] Agregar slide de Social Proof (testimonios de 2-3 directores de clubes)
- [ ] Grabar video demo de 2-3 minutos del producto
- [ ] Actualizar slide de Team si se suman socios o advisory board
- [ ] Aplicar los mismos cambios de "youth → all ages" al deck LATAM
- [ ] Aplicar la misma optimizacion de PDF al deck LATAM (rasterizado 2x)
- [ ] Considerar quitar "Confidential" si el deck se va a compartir libremente
- [ ] Comprar SFIA 2025 Topline Report (~$40 USD) para tener fuente primaria

---

## 11. GLOSARIO Y EDUCACION DE FUNDADOR (20 Feb 2026)

Se creo `STARTUP-GLOSSARY.md` con 12 secciones cubriendo todos los terminos de startup, levantamiento de capital, SaaS, y negociacion con socios/inversores.

### Secciones agregadas en esta sesion:

- **Seccion 10: Dilucion en detalle** — Como funciona, por que no importa (valor vs %), cap table proyectada completa, errores comunes
- **Seccion 11: Estructura de equity con socios** — Deal base ($10K + trabajo = 12%), como negociar si quieren mas ($ extra a valuacion $750K), dos contratos separados (sweat vs cash equity)
- **Seccion 12: Como se calcula la valuacion ($750K)** — Metodo Berkus (5 factores = $625K redondeado a $750K), comparables de mercado, tabla de cuando sube la valuacion por hitos de MRR

### Decisiones clave documentadas:

| Tema | Decision |
|------|----------|
| $10K de socios | Es boleto de entrada, NO compra equity extra |
| Si quieren mas del 12% | Deben invertir $ adicional a valuacion $750K |
| Sweat vs Cash equity | Dos contratos separados — sweat se pierde si no pasan cliff, cash se conserva |
| Limite pre-seed | No dar mas del 18-20% total a socios antes de levantar |
| Valuacion $750K | Calculada con Berkus Method + comparables, es conservadora a proposito |

---

## 12. DECISIONES DE MESSAGING Y PRODUCTO (20 Feb 2026)

### NO usar "sistema operativo" como tagline
El fundador no quiere que Widdo se describa como "el sistema operativo para clubes deportivos". Suena demasiado tecnico y frio.

**Taglines aprobados:**
- **"Every club. Every tournament. Every athlete."** — Para investor decks y materiales formales
- **"Built for the game. From academy to arena."** — Para marketing y branding emocional

La vision de Widdo va mas alla de gestion de club: incluye torneos, academia, y una hoja de vida deportiva que el jugador se lleva a donde vaya.

### Payment Processing es SOLO para USA
En LATAM la gente no esta acostumbrada a pagar fees de procesamiento a traves de plataformas. El revenue de payment processing (2-3% fee) solo aplica al mercado USA. En LATAM el modelo es solo suscripcion mensual.

| Mercado | Revenue Streams |
|---------|----------------|
| USA | Suscripcion + Payment Processing Fee (2-3%) |
| LATAM | Solo suscripcion |

---

*Registrado: 19-20 de Febrero 2026*
