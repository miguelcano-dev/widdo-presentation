# Widdo USA — Documentacion

> **Estructura:** Cada archivo tiene una audiencia especifica. No mezclar contenido tecnico con contenido de negocio.

## Archivos

| Archivo | Audiencia | Contenido |
|---------|-----------|-----------|
| `USA-TECHNICAL.md` | Developers / Claude Code agents | Arquitectura, Ronda 0 (Suscripciones) + 11 fases, migraciones, endpoints, checklists |
| `USA-BUSINESS.md` | Co-founder / inversores / ventas | Mercado, pricing, competencia, pilotos, marketplace Stripe Connect, argumentos de venta |
| `USA-COMPLIANCE.md` | Ambas audiencias | Leyes Florida, NCAA, NIL, SafeSport, fuentes verificadas |
| `USA-PROGRESS.md` | Tracking de ejecucion | Checkboxes por tarea, log de ejecucion, progreso por ronda |
| `USA-LAUNCH-PLAN.md` | Ejecucion del lanzamiento | Gates de lanzamiento (Gate 0 = Stripe live) |

> **Contexto obligatorio antes de leer cualquiera de estos (13-ago-2026):**
> Foco **USA-only**. **Stripe es la unica pasarela** (Wompi y MercadoPago descartados):
> esta integrado, pero produccion sigue en `sandbox` — pasar a live es el **Gate 0**
> y **nada es facturable hasta cerrarlo**. Precios **99 / 199 / 349 USD/mes**, por
> **cantidad de jugadores** (`max_members`), no por modulos. Ventana de onboarding
> de clubes: **enero 2027**.

## Para developers / Claude Code agents

1. Empezar por `USA-TECHNICAL.md` — tiene toda la spec de implementacion
2. Consultar `USA-COMPLIANCE.md` para entender el contexto legal que motiva las features
3. NO necesitan leer `USA-BUSINESS.md` (no tiene info tecnica)
4. Actualizar `USA-PROGRESS.md` al completar cada tarea

> **Orden de implementacion:** Ronda 0 (Suscripciones) → Ronda 1 → Ronda 2 → Ronda 3 → Ronda 4. Ronda 0 es blocker para monetizacion y debe completarse antes de las fases USA.

## Para co-founder / inversores

1. Leer `USA-BUSINESS.md` — tiene todo lo que necesitan para vender y presentar
2. Consultar `USA-COMPLIANCE.md` si preguntan por requisitos legales
3. NO necesitan leer `USA-TECHNICAL.md` (solo codigo y migraciones)
4. Version visual: `desarrollo/widdo-usa-overview.html` (abrir en browser)

## Archivos relacionados

| Archivo | Ubicacion |
|---------|-----------|
| Landing USA | `desarrollo/landing/src/app/us/page.tsx` |
| HTML visual para compartir | `desarrollo/widdo-usa-overview.html` |
| Pasarelas de pago (Stripe, config y credenciales) | `saas_sport/docs/PAYMENTS-STRIPE.md` |

> **Nota (13-ago-2026):** este indice apuntaba a un directorio `memoria/` que **no
> existe** (`ls memoria` → No such file or directory). Los tres ficheros que citaba
> (`usa-pilot-academies.md`, `usa-adaptation-mvp.md`, `usa-market-research.md`) si
> existen, pero viven en la memoria de Claude:
> `~/.claude/projects/-Users-miguelcano-Desktop-todo-Widdo/memory/`.
> No son ficheros del repo; no los busques aqui.
