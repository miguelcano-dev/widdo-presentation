# Widdo — Framework de decisión: "¿lo construyo o no?"

> Úsalo ANTES de codear cualquier idea (feature, cambio, experimento). Toma 5 minutos.
> Si no pasa el gate, no lo construyes todavía. Complemento de `GSTACK-PLAYBOOK-WIDDO.md`.
> Estado (jul 16 2026): **3 clubes pagan anualidad** · ~8 clubes activos · ~3 son cliente ideal (ICP).
> Las 2 métricas que importan HOY: **RETENCIÓN** (que los 3 ideales se queden) y **CONVERSIÓN** (que más paguen).

---

## PASO 1 — El gate (marca las 5 casillas)

Si fallas **2 o más**, PARA. No lo construyas aún.

- [ ] **Cliente** — ¿un cliente real (idealmente de los 3 que pagan) lo pidió o lo sufre?
- [ ] **Métrica** — ¿mueve RETENCIÓN o CONVERSIÓN? Si no mueve ninguna de las 2, es distracción.
- [ ] **1 frase + verificable** — ¿puedo describir el resultado en una frase y probarlo (test/pantalla)?
- [ ] **Trabajo real** — ¿es el trabajo que el cliente necesita hacer, no una feature "bonita"?
- [ ] **Prioridad** — ¿es más importante que hablar con un cliente esta semana?

## PASO 2 — Clasifica el resultado

- 🟢 **CONSTRUIR YA** — pasa el gate y toca retención/revenue directo, alcance claro.
- 🟡 **OFFICE-HOURS PRIMERO** — buena idea pero alcance difuso → `/office-hours` para afilarla.
- 🔴 **NO / DESPUÉS** — no mueve métrica, o es "la feature #97".

---

## ✅ Qué SÍ hacer (siempre verde)

- Hablar con los **3 clientes que pagan** cada semana. Es tu fuente de verdad.
- **Medir antes de construir** — instrumenta la señal, no adivines.
- Cerrar loops que dan/retienen dinero: pago E2E, onboarding sin fricción.
- Arreglar lo que rompe la retención de los ~3 ideales.
- **1 feature a la vez**, shippeada y verificada (`/review` + `/qa`).

## ❌ Qué NO hacer (banderas rojas)

- Construir para los clubes que **NO son ICP** (los que "solo probaron").
- Features nuevas **sin que un cliente las pida**.
- Medir **LOC o "features shippeadas"** como progreso.
- Perseguir **todos** los "gaps" que reporta `/review` → sobre-ingeniería.
- Pasar una semana **sin hablar con un cliente** ni pedir/cobrar.

---

## El orden de marchas (gstack) — cuándo usar cada una

| Marcha | Comando | Cuándo |
|--------|---------|--------|
| **QUÉ** | `/office-hours` | Idea nueva / alcance difuso → te interroga antes de codear |
| **QUÉ** | `/plan-ceo-review` | Reta el alcance de una feature grande |
| **CÓMO** | `/plan-eng-review`, `/plan-design-review` | Arquitectura / UI antes de codear |
| **VERIFICAR** | `/review` | Auditoría de bugs sobre el código escrito |
| **VERIFICAR** | `/qa` | Navegador real: clickea flujos, caza y arregla bugs |
| **SHIP** | `/ship` | Corre tests + abre PR |
| **APRENDER** | `/retro`, `/learn` | Viernes: qué aprendiste, graba patrones/errores |

**Regla:** empieza siempre por la marcha de ARRIBA. El código no es el trabajo; decidir qué construir lo es.

## Cadencia semanal

- **Lunes** → `/office-hours` sobre la métrica de la semana (retención o conversión).
- **Durante la semana** → construir → `/review` → `/qa` → `/ship` (1 feature a la vez).
- **Viernes** → `/retro` + `/learn`. Pregunta: ¿hablé con un cliente? ¿alguien nuevo pagó o se quedó?

---

## 🧪 Ejemplo trabajado — tus 2 ideas de hoy

**Idea A:** sección para ver **cuánto usan Widdo** los clubes (engagement/uso por club).
**Idea B:** sección para ver **cuántos intentan crear club/cuenta y fallan** (embudo de fallo).

Pasándolas por el gate:

| Check | Idea A (uso) | Idea B (fallos) |
|-------|-------------|-----------------|
| Cliente | ✅ tú lo sufres (no sabes quién usa) | ✅ tú lo sufres (no sabes quién se atora) |
| Métrica | ✅ **retención** | ✅ **conversión** |
| 1 frase + verificable | ✅ | ✅ |
| Trabajo real | ✅ decidir en quién invertir tiempo | ✅ arreglar el embudo de entrada |
| Prioridad | ✅ te dice con quién hablar | ✅ te dice qué arreglar para crecer |

**Veredicto: 🟡 AMBAS pasan el gate → van a `/office-hours` PRIMERO.**
Motivo: el alcance está difuso. Antes de construir un dashboard genérico hay que definir la
**señal que te haga ACTUAR**, no vanity metrics:
- Idea A: ¿qué es exactamente "usa Widdo"? ¿login/semana? ¿pagos registrados? ¿asistencia tomada?
  ¿jugadores activos? → elegir 1-2 acciones núcleo que predigan que el club se queda.
- Idea B: ¿qué evento cuenta como "intentó y falló"? ¿registro abandonado? ¿error en crear club?
  ¿validación que traba? → instrumentar el punto exacto de abandono, no "visitas".

Es el caso perfecto para estrenar el framework: **no construyas el dashboard; construye la señal.**

---

## Próximo paso
1. `brew install bun` (instalando).
2. `/office-hours` sobre: *"Quiero medir uso por club (retención) y fallos de creación de cuenta/club
   (conversión). ¿Cuál es la UNA señal de cada uno que me haría actuar, y qué NO debo medir?"*
3. Con el alcance afilado → construir esa señal → `/review` → `/qa` → `/ship`.
