# CLAUDE.md — Adquisición USA (Widdo Clubs + Tournaments)

Manual operativo del workstream de **adquisición de clientes en USA**. Léelo antes de trabajar en esta carpeta.

## Lo que hay que saber antes de tocar nada (13-ago-2026)

1. **La tanda 1 está EN ENVÍO.** Ya no es "por enviar". Los 10 emails de `emails/` salen desde el 13-ago.
2. **El canal de envío es Brevo**, con sender `miguel@widdo.co`. La **única fuente correcta** de cómo se opera
   es **`MOTOR/RUNBOOK.md`**. Instantly, Smartlead y el dominio try-widdo.com están **descartados**: si un
   documento te manda montarlos, está en `_archivo/` por eso.
3. **Framing: enero 2027.** Los eventos y temporadas 2026 quedan descartados como puerta de entrada. El
   onboarding de clubes nuevos apunta a **enero 2027**, y el outreach sigue activo AHORA con el ángulo
   *"founding organizer — arrancas en enero 2027"*. **Excepción:** las ofertas de **Fall 2 / otoño ya escritas
   (BNA)** siguen válidas.
4. **Stripe es la única pasarela** (USA, Canadá, México). Wompi y MercadoPago no van en nada de USA.
5. **Gate 0 (Stripe en live):** la parte manual de Miguel está **en curso y casi lista** (`GATE-0-STRIPE-LIVE.md`).
   Bloquea **cobrar**, no escribir.

### Claims PROHIBIDOS

Nunca, en ningún mensaje, deck ni doc:

- ❌ **"0% churn"** y ❌ **"21 clubes"** — datos viejos, no son ciertos.
- ❌ **"50-70% más barato"** / "half the cost" / "~50% más barata que TeamSnap" — sin verificar.

Métricas reales hoy: **9 clubes, 3 pagando**. Y aun así, **mejor no citar cifras en frío**: a un club de Florida
no le ayuda saber cuántos clientes tenemos, y solo abre la puerta a la pregunta que no queremos.

**Lo que sí está verificado y se puede decir:** 0% de comisión, el dinero de inscripciones va **directo a la
cuenta del club vía Stripe**; bilingüe nativo EN/ES; sin anuncios; migración gratis; check-in QR con credencial
por jugador. Y el techo honesto de torneos: **~250-500 equipos por evento**, en eliminación o grupos
(`torneos/PENDIENTES-PERFORMANCE.md`).

### La firma del outreach

Firma **SIEMPRE Miguel**, nunca Alwin:

```
Miguel Cano · Founder, Widdo (former pro basketball player)
miguel@widdo.co · widdo.co
Widdo, Inc. · 420 E Church St, Orlando, FL 32801
If this isn't relevant, just reply "no thanks" and I won't follow up.
```

Alwin se menciona **en el cuerpo** cuando aporta: *"Our co-founder Alwin is based in Orlando — happy to come by
in person"*. La visita en persona **solo** se ofrece en el área de Orlando.

### Reverificar el día del envío

Antes de escribirle a alguien, comprueba **ese mismo día**: qué plataforma usa hoy, si el email sigue vivo, en
qué ciudades opera, si tiene temporada abierta. **Lección BNA (28-jul-2026):** las ligas se habían mudado a otra
marca (*The Experience FL*) y a otras ciudades, y el email publicado era otro. Un gancho con datos viejos es
peor que no escribir.

---

## Objetivo y wedge

Conseguir los **primeros clientes USA** (ligas → clubes/equipos) y cruzar **breakeven (60 clubes)**.
Mercado: **Florida primero**, Texas en segunda fila. LATAM se mantiene, no se persigue.

A quién le vendemos primero: ligas y clubes **hispanos, pequeños, con gestión manual o con un competidor que
odian** (TeamSnap, SportsEngine, LeagueApps). Ventajas a martillar en todo el copy:

1. **Bilingüe nativo EN/ES** — nadie más lo tiene, y 41M de personas hablan español en USA.
2. **0% de comisión**: el dinero va directo a la cuenta del club por Stripe.
3. **Sin anuncios** — los rivales meten publicidad a quien ya paga.
4. **Simple** para clubes pequeños (SportsEngine es complejo y caro).
5. **Torneos + Clubs integrados** = loop que trae clubes gratis.

El ICP se ordena por **capacidad de pago**: torneos/ligas grandes > clubes que ya pagan software > semi >
manual. El bilingüe es un *feature*, no un filtro.

---

## Estructura de esta carpeta

Unos 65 archivos vivos. Estas son las piezas, no el listado completo:

```
adquisicion-usa/
├── CLAUDE.md                       ← este archivo (manual de operación)
├── INDEX.md                        ← índice navegable de todo
├── GATE-0-STRIPE-LIVE.md           ← paso a paso para poner Stripe en live
├── LANZAMIENTO-GO-NOGO.html        ← los 5 gates de lanzamiento (se revisa a diario)
│
├── MOTOR/                          ← ⭐ el motor de outreach. Empezar SIEMPRE aquí
│   ├── RUNBOOK.md                  ← operación diaria. LA fuente correcta del canal de envío
│   ├── calendario-envio.md         ← orden y ritmo de envío (fechas originales vencidas)
│   ├── emails-nuevos.md            ← 30 emails redactados, uno por sección
│   └── brevo-import.csv            ← 🔒 lista de contactos y ESTADO de envío — lo maneja Miguel
│
├── emails/                         ← ⭐ copy canónico de la tanda 1 (10 emails verificados)
│   ├── 01-…10-*.md                 ← uno por prospecto, con sus verificaciones
│   ├── TODOS-LOS-EMAILS.md         ← los 10 juntos
│   └── TRACKING.csv                ← 🔒 estado de envío y respuestas — lo maneja Miguel
│
├── 00-LISTA-MAESTRA-FLORIDA.md     ← 82+ orgs de FL, Tier 1 y Tier 2
├── 03-TIER1-MENSAJES.md            ← 18 mensajes Tier 1 de Florida
├── 06-SECUENCIA-FOLLOWUPS-CLUBES.md← follow-ups (FU2 + break-up) EN/ES
├── texas/                          ← lista maestra de TX (51 orgs) + 18 mensajes Tier 1
├── torneos/                        ← segmento de mayor valor: master de 28 orgs, mensajes,
│                                     auditoría del módulo, límites de tamaño, Widdo Cup
├── nichos/                         ← ligas latinas y pádel: verticales sin plataforma dominante
├── prospectos-raw/                 ← solo queda _enrich_D_pendientes.md (deuda viva)
│
├── ANALISIS-COPAFACIL.md           ← teardowns de competidores/adyacentes
├── ANALISIS-SOFASCORE.md
├── reseñas-teamsnap.md             ← quejas reales de rivales → munición de copy
├── reseñas-sportsengine-leagueapps.md
├── TAREAS-REPETITIVAS-RESEARCH.md  ← qué le duele de verdad al cliente (research de campo)
├── NICHOS-SIN-PLATAFORMA.md        ← dónde no hay un "GotSport del vertical"
├── 05-CRECIMIENTO-ORGANICO.md      ← canales orgánicos
├── PLAN-SEO-LOCAL.md · BRIEF-LANDING.md · PATRONES-CRECIMIENTO-STARTERSTORY.md
├── fuentes/                        ← encuestas fuente (coach, parent)
└── _archivo/                       ← retirados el 13-ago. NO operar con nada de aquí
```

🔒 **`emails/TRACKING.csv` y `MOTOR/brevo-import.csv` no se editan.** Llevan el estado real de envío y lo
mantiene Miguel a mano. Leerlos, sí; escribirlos, nunca.

---

## Reglas duras

1. **Nunca inventar** emails, teléfonos ni nombres. Si no está en una página real → "no encontrado — ver web".
   Contacto vacío es mejor que contacto falso.
2. **CAN-SPAM en todo email frío:** identidad real + dirección física + línea de baja. Ya está en la firma.
3. **Cero prospección manual.** Nada de DMs de Instagram, WhatsApp ni llamadas en frío: solo email
   automatizado y demos ya calificadas. Un prospecto sin email no es un prospecto, es una tarea de enrichment.
4. **Máximo 20-25 emails al día por buzón**, y el calendario nunca pasa de 18.
5. **Máximo dos toques** por prospecto. Un "no" es un no, no una objeción: baja inmediata.
6. **Personalizar siempre:** nombre de la organización + gancho del dolor de SU plataforma actual + idioma
   (español para ligas de base 100% latinas; inglés por defecto, que es donde está el buyer con presupuesto).
7. **La métrica es la tasa de respuesta** (respuestas ÷ enviados; 3-8% es bueno). **Ignora las aperturas**:
   Apple Mail las infla y engañan.

## Flujo de adquisición

Demo y onboarding **no son humanos** en Widdo: la demo es online (self-serve) y el onboarding lo hace el
**agente de IA propio de Widdo**, que lleva al usuario paso a paso. Por eso el embudo es casi todo automatizable:

```
[1 Research prospectos]   → agentes IA (hecho; re-ejecutable)
[2 Enriquecer contactos]  → agentes IA
[3 Copy de quejas rivales]→ agentes IA (hecho)
[4 Personalizar mensajes] → agente IA por lead
        │
   [GATE HUMANO: Miguel aprueba lista + mensajes y reverifica el día del envío]
        │
[5 Envío + secuencia]     → Brevo (ver MOTOR/RUNBOOK.md)
[6 Link a DEMO ONLINE]    → self-serve
[7 ONBOARDING]            → agente de IA de Widdo
[8 Caso de estudio]       → agente IA (borrador)
```

Lo único 100% humano: cerrar deals grandes de ligas y responder objeciones complejas.

## Cómo re-ejecutar el deep research

Pídele a Claude: *"corre el deep research de ligas de [deporte/estado] como en la Lista Maestra, mismo formato
de tabla, sin inventar contactos."* Fuente casi infinita para soccer: **FYSA Club Finder**
(fysa.com/club-finder, 200+ clubes). Filtrar por ciudades hispanas: Hialeah, Kendall, Homestead, Kissimmee,
Orlando.

## Skills disponibles (en `Widdo/.claude/skills/`)

- **`research-ligas`** — lanza el fan-out de agentes por deporte/estado y arma la lista, sin inventar contactos.
- **`enrich-prospecto`** — dado nombre + web, busca el email/decisor que falta y devuelve la fila.
- **`draft-outreach`** — dado un prospecto, genera DM + email EN/ES con el gancho correcto (CAN-SPAM).

## Qué hay en `negocio/` que NO hay que duplicar

- `negocio/sales/KNOWLEDGE-BASE.md` — entrenamiento de ventas (diferenciadores, competidores, pain points).
  ⚠️ Contiene los datos viejos "21 clubes / 0% churn": **no citarlos de ahí**.
- `negocio/sales/CRM.md` — pipeline CRM. `00-LISTA-MAESTRA-FLORIDA.md` lo extiende.
- `negocio/TOURNAMENT-ACQUISITION-STRATEGY.md` — estrategia para organizadores de torneos.
- `negocio/MARKET-RESEARCH-USA.md` / `SFIA-MARKET-DATA.md` — mercado y pricing de competidores.

**El modelo de copy a seguir es `adquisicion-usa/emails/`**, que es el único verificado y con la firma correcta.
