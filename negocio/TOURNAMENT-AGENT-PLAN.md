# Plan de Implementacion con Agentes IA — Captacion de Organizadores USA

> Creado: 2026-05-20 | Complementa: TOURNAMENT-ACQUISITION-STRATEGY.md

## Vision General

Usar agentes IA para automatizar las partes repetitivas del proceso de ventas,
dejando que Alwin (y Miguel) se enfoquen en lo que solo humanos pueden hacer:
relaciones, demos en persona, y cerrar tratos.

```
AGENTES automatizan:        HUMANOS hacen:
- Prospecting/research      - Demo calls
- Scraping directorios      - Visitas presenciales
- Personalizacion mensajes  - Negociacion
- Follow-ups                - Relacion personal
- Tracking pipeline         - Cerrar tratos
- Analisis competencia      - Decision estrategica
```

---

## FASE 0: Infraestructura (1-2 dias)

### 0.1 — CRM Minimo (Google Sheets o Notion)

Crear un spreadsheet/board con estas columnas:

| Campo | Ejemplo |
|---|---|
| Organizador | Prospect Wire |
| Contacto | Matt Bomeisl |
| Email | matt@prospectwire.com |
| Instagram | @prospectwirebaseball |
| Deporte | Baseball |
| Ubicacion | Sanford, FL |
| Tamano estimado | 10+ estados, mid-size |
| Proximo torneo | Jun 15, 2026 |
| Status | Nuevo / Contactado / Demo / Piloto / Activo |
| Ultimo contacto | 2026-05-20 |
| Notas | Data showcases, ideal para NIL |

### 0.2 — Email de Outreach Profesional

- Usar dominio widdo.co (alwin@widdo.co o tournaments@widdo.co)
- Firma con logo, titulo, telefono USA
- NO usar gmail/hotmail para cold outreach

---

## FASE 1: Agente de Prospecting (semana 1)

### Que hace el agente:

**Agente: "Tournament Prospector"**

Tarea: Scrappear directorios y armar la lista de 50+ organizadores.

**Fuentes a scrappear:**

1. **Exposure Events** — Ir a basketball.exposureevents.com, baseball.exposureevents.com, etc.
   Filtrar por Florida. Extraer: nombre del evento, organizador, fechas, ubicacion.

2. **BaseballConnected** — baseballconnected.com/baseball-tournament-organizations/florida/
   Extraer: nombre, direccion, email, redes sociales, descripcion.

3. **GotSport** — home.gotsport.com
   Buscar torneos en FL. Extraer organizadores.

4. **Instagram** — Buscar hashtags: #youthbaseball #youthsoccer #collegeshowcase
   + Florida/Orlando/Miami. Identificar cuentas de organizadores.

5. **LinkedIn** — Buscar "Tournament Director" + Florida, etc.
   Extraer: nombre, empresa, ubicacion, perfil URL.

**Output esperado:**
- Spreadsheet con 50-100 organizadores
- Clasificados por: deporte, tamano, tipo (recreational vs showcase), ubicacion
- Priorizado: showcases FL primero, luego recreational FL, luego fuera de FL

### Como ejecutarlo:

**Opcion A — Claude Code como agente manual:**
Darle a Claude la lista de URLs y pedirle que investigue cada organizador.
Uno por uno o en batch. Output en formato tabla/CSV.

**Opcion B — Script de scraping + Claude:**
```
1. Script Node.js con Puppeteer para scrappear las paginas
2. Claude analiza el output crudo y estructura la data
3. Se exporta a Google Sheets via API
```

**Opcion C — Agente con herramientas web (Recomendado):**
Usar Claude con WebSearch + WebFetch para:
1. Buscar cada directorio
2. Extraer datos relevantes
3. Enriquecer con LinkedIn/Instagram
4. Estructurar en spreadsheet

---

## FASE 2: Agente de Research por Prospect (semana 1-2)

### Que hace el agente:

**Agente: "Prospect Researcher"**

Para CADA organizador en el top 20 de la lista:

1. **Buscar su web** — que software usan? (Exposure, SportsEngine, manual?)
2. **Buscar su Instagram** — cuantos seguidores? que publican? tienen torneos proximos?
3. **Buscar su LinkedIn** — quien es el fundador/director? background?
4. **Buscar reviews** — quejas de padres/coaches sobre sus torneos?
5. **Buscar proximos eventos** — tienen torneo en las proximas 4-8 semanas?
6. **Pain points** — que problemas son visibles desde afuera?

**Output por prospect:**
```
## Prospect Wire (Matt Bomeisl)
- Software actual: Exposure Events + manual
- Instagram: @prospectwirebaseball (X seguidores)
- Proximo torneo: [fecha, ubicacion]
- Pain points visibles: [inscripcion manual, scheduling complejo]
- Angulo de entrada: "Tu data showcase necesita perfiles verificados NIL"
- Dificultad estimada: Media (mid-size, fundador accesible)
- Prioridad: ALTA
```

### Como ejecutarlo:

Darle a Claude el nombre + URL de cada prospect.
Claude hace la investigacion completa y genera el brief.
Un prospect = 3-5 minutos de investigacion.
Top 20 = ~1.5 horas total.

---

## FASE 3: Agente de Outreach Personalizado (semana 2)

### Que hace el agente:

**Agente: "Outreach Writer"**

Usando el brief de Fase 2, genera mensajes personalizados para cada prospect.

**Tipos de mensaje:**

### 3.1 — Email Frio (primer contacto)

Template base que el agente personaliza:

```
Subject: Free tournament platform for [Nombre Torneo] — interested in being first?

Hi [Nombre],

I saw [detalle especifico: "your upcoming Data Showcase in June" / 
"your 21st Annual College Showcase" / "your FL Power Series"].

We're building Widdo Tournaments — a free platform for tournament organizers 
that handles registration, brackets, live scoring, and payments. 
No fees, no catch — we monetize through payment processing only.

We're looking for ONE organizer in Florida to be our launch partner. 
You'd get early access + direct input on the product + our full support 
at your next event.

[Si es showcase]: What makes us different: we turn your event's player data 
into verified athlete profiles that college coaches can discover — 
with NIL compliance built in.

Would you be open to a 15-minute demo this week?

Best,
Alwin [Apellido]
Co-Founder, Widdo
[telefono USA]
widdo.co
```

### 3.2 — Instagram DM (mas casual)

```
Hey [nombre]! Saw your [torneo/showcase] in [ciudad] — looks like a 
great event. We built a free tournament platform (registration, brackets, 
live scores, payments) and we're looking for a partner organizer in Florida 
to be the first to use it. Zero cost to you. Would love to show you a quick 
demo if you're interested. 🏀⚽
```

### 3.3 — Follow-up (si no responde en 5 dias)

```
Hi [nombre], just following up. I know tournament season is hectic. 
Here's a 2-min video of what Widdo looks like: [link].
No pressure — just wanted to make sure you saw it. Would love to 
chat whenever you have a minute.
```

### Reglas del agente:
- SIEMPRE incluir un detalle especifico del prospect (no se puede sentir generico)
- Tono casual-profesional, NO corporate
- Maximo 100 palabras en DMs, 150 en emails
- El agente genera 3 variantes por prospect, Alwin elige la mejor

---

## FASE 4: Agente de Follow-Up y Pipeline (semana 2-4)

### Que hace el agente:

**Agente: "Pipeline Manager"**

Revisa el CRM diariamente y:

1. **Alerta si alguien no ha sido contactado en 7+ dias**
2. **Sugiere follow-ups** basados en la interaccion previa
3. **Actualiza status** (Nuevo → Contactado → Demo → Piloto → Activo)
4. **Reporta metricas semanales:**
   - Prospectos nuevos agregados
   - Emails enviados vs respondidos
   - DMs enviados vs respondidos
   - Demos agendadas
   - Conversion rate por canal (email vs IG vs LinkedIn)

### Como ejecutarlo:

- Si usan Google Sheets: Claude lee el sheet via API y genera reporte
- Si usan Notion: similar via Notion API
- Reporte semanal = 1 prompt a Claude con el estado del pipeline

---

## FASE 5: Agente de Contenido (paralelo, semana 1-4)

### Que hace el agente:

**Agente: "Content Creator"**

Genera contenido para posicionar a Widdo como thought leader en tournaments:

1. **Posts de LinkedIn (Alwin):**
   - "What I learned attending 10 youth tournaments in Florida"
   - "Why tournament organizers still use paper brackets in 2026"
   - "NIL compliance is coming to youth sports — are you ready?"
   - 2 posts por semana, 200-300 palabras

2. **Instagram stories/reels:**
   - Alwin en un torneo mostrando el problema (papel, caos, Google Forms)
   - "Before vs After" con Widdo
   - Quick demo del producto en 30 segundos

3. **Email newsletter:**
   - "The Tournament Organizer's Weekly" — tips + industria
   - Build list con los 50+ prospectos
   - Establece autoridad antes del pitch

### Como ejecutarlo:

Claude genera los drafts. Alwin revisa, ajusta voz, publica.
30 minutos/semana de Alwin para revisar y publicar.

---

## FASE 6: Agente de Competitive Intelligence (continuo)

### Que hace el agente:

**Agente: "Competitive Monitor"**

Monitorea que hacen los competidores semanalmente:

1. **Exposure Events** — cambios de pricing, features nuevas, quejas de usuarios
2. **SportsEngine** — movimientos en el mercado, partnerships
3. **GotSport** — expansiones, nuevos deportes
4. **Cualquier startup nueva** — buscar en Product Hunt, YC, Crunchbase

**Output:** Brief semanal de 5 lineas con lo relevante.

---

## FASE 7: Agente de Demo Prep (antes de cada demo)

### Que hace el agente:

**Agente: "Demo Prep"**

30 minutos antes de cada demo call:

1. Recopilar todo lo investigado del prospect
2. Identificar sus pain points especificos
3. Preparar guion de demo personalizado:
   - Que features mostrar primero (las que resuelven SU problema)
   - Que preguntas hacer
   - Posibles objeciones y respuestas
4. Si organizan showcases: preparar angulo NIL con datos

---

## Cronograma de Implementacion

```
Semana 1:
├── Dia 1-2: Fase 0 (CRM + email setup)
├── Dia 2-3: Fase 1 (Agente Prospector → lista de 50+)
└── Dia 3-5: Fase 2 (Research top 20 prospects)

Semana 2:
├── Dia 1-2: Fase 3 (Generar outreach personalizado)
├── Dia 2-5: Alwin envia 10-15 mensajes (email + IG)
└── Paralelo: Fase 5 comienza (contenido LinkedIn)

Semana 3:
├── Follow-ups a no-respondidos
├── Primeras demos (target: 3-5 demos)
├── Fase 4 activa (pipeline tracking)
└── Fase 7 para cada demo

Semana 4:
├── Cerrar primer piloto
├── Alwin va al torneo presencialmente
├── Documentar case study (video + fotos)
└── Reportar a Erica + next batch de outreach
```

---

## Metricas de Exito

| Metrica | Target Semana 1 | Target Semana 4 |
|---|---|---|
| Prospectos en lista | 50+ | 100+ |
| Outreach enviado | 0 | 30-40 |
| Respuestas | 0 | 8-12 (20-30% rate) |
| Demos | 0 | 3-5 |
| Pilotos cerrados | 0 | 1-2 |
| Contenido publicado | 0 | 6-8 posts |

---

## Herramientas Necesarias

| Herramienta | Uso | Costo |
|---|---|---|
| Google Sheets | CRM minimo | Gratis |
| Claude Code/API | Agentes de prospecting, research, outreach | Ya tienen |
| Widdo email (alwin@widdo.co) | Outreach profesional | Ya tienen (Workspace) |
| Calendly o Cal.com | Agendar demos | Gratis tier |
| Loom | Videos de demo cortos | Gratis tier |
| Canva | Quick visuals para IG/LinkedIn | Gratis tier |

---

## Notas Importantes

1. **NO automatizar el envio de mensajes.** Los agentes GENERAN, Alwin ENVIA manualmente.
   El outreach automatizado masivo destruye deliverability y reputacion.

2. **Calidad > Cantidad.** 10 mensajes personalizados > 100 genericos.

3. **El presencial gana.** Alwin yendo a un torneo en persona vale mas que 50 emails.

4. **Academy CFL sigue siendo backup.** Si el cold outreach no funciona en 2 semanas,
   activar Academy CFL como design partner (warm intro, cierre casi garantizado).

5. **NIL es el hook para showcases, no para recreational.** Adaptar el pitch segun
   tipo de organizador.
