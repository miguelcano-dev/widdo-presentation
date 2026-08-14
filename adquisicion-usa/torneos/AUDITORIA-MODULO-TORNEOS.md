# Auditoría — Módulo de Torneos de Widdo

> ⚠️ **El gate NO está cerrado del todo (nota del 13-ago-2026).** El QA se ejecutó y la **correctitud** está
> verificada, pero la **performance del scheduling sigue pendiente** (el algoritmo es cuadrático).
> Lo que se puede prometer y lo que no: **`PENDIENTES-PERFORMANCE.md`**. Leerlo antes de cotizar tamaños.

> Hecha por el agente `widdo-tech` sobre el codebase (`desarrollo/saas_sport/` backend Laravel + `desarrollo/frontend/` React). Solo lectura. Responde: **¿hasta qué escala se puede vender torneos con honestidad HOY?**

## TL;DR
**El módulo existe, es real y sorprendentemente completo.** Se puede vender con honestidad hasta **~250-500 equipos por torneo** (sweet-spot + borde inferior de ballenas). **Weston Cup (1,200+) NO todavía** — necesita colas + optimización + load testing primero (semanas, no meses; no es reescritura).

## Qué hay (confirmado en código)
Coexisten **2 sistemas**:
1. **"Convocatorias"** (ene 2026) — para que un club gestione a *sus* jugadores que van a un torneo externo (rosters, waivers, cobros). Maduro.
2. **"Competition Engine"** (may 2026) — **el motor real de torneos**: 60+ migraciones, ~55 modelos, ~35 controllers, 7 services. Rutas activas tras `module.access:tournaments`. Frontend real (Wizard, BracketsPage, LiveTournamentPage). Tests de invariantes que juegan torneos completos. **No es scaffolding vacío.**

## Capacidades (feature → estado)
| Capacidad | Estado |
|---|---|
| Inscripción de equipos (approve/waitlist/withdraw) | ✅ Sí |
| Brackets (single/double elim, round-robin, grupos, Swiss, grupos→elim; seeding, byes, 3er puesto) | ✅ Sí, fuerte |
| Standings en vivo | ✅ Sí |
| Scheduling multi-cancha (venues/courts/slots, constraints) | 🟡 Parcial-Sí |
| Pagos de inscripción (Stripe Connect) | ✅ Sí |
| Check-in día de evento (+ offline sync, gate tickets) | ✅ Sí |
| Resultados en vivo / tiempo real (Reverb WebSockets, live scoring) | ✅ Sí |
| Comunicación con equipos (notis, alerts, mails) | ✅ Sí |
| Extras (disputes, sponsors, volunteers, awards, rankings, weather) | ✅ Sí |

Cobertura **más amplia** que un competidor típico en papel.

## Límite de escala honesto (con evidencia)
**Clave:** los brackets se generan **por categoría** (~16-64 equipos), no por torneo entero → generar un bracket NO es el cuello de botella.

**Dónde SÍ se rompe a nivel torneo-completo de miles:**
1. **Scheduling — riesgo #1:** `SchedulingService::generateSchedule` es greedy y corre **síncrono en el request, sin cola**. `optimizeSchedule` es **cuadrático con N+1** (query a BD por slot, recargando todo tras cada swap). Miles de matches → timeout.
2. **Endpoints sin paginación:** `RegistrationController::index` y `BracketController::index` hacen `->get()` sin límite con eager-load → a 1,200 inscripciones, JSON de megabytes.
3. **Sin colas** para trabajo pesado (todo síncrono).
4. **Índices de BD: buenos** — el riesgo es algorítmico, no de queries.
5. **Tests: correctos pero solo a escala pequeña** (máx 16 equipos). Rendimiento a 100/500/1,000 **no probado**.

**Veredicto de escala:**
- **≤500 equipos/torneo (repartidos en categorías):** aguanta con confianza.
- **1,000+ (ballena):** el modelo de datos aguanta, pero scheduling síncrono/cuadrático + endpoints sin paginar se degradan. No probado ni optimizado.

## Riesgos día del evento
- Tiempo real bien encaminado (Reverb + offline sync).
- **Carga concurrente no probada** (sin load testing).
- Re-optimizar calendario en vivo con miles de matches → se cuelga.
- Producto joven (may 2026), sin historial de eventos grandes → primer ballena = alto riesgo operativo.

## Camino mínimo 500 → 1,000+ (semanas)
1. Mover scheduling/generación pesada a **colas** (Jobs + Reverb para progreso).
2. Reescribir `optimizeSchedule` (quitar N+1/cuadrático).
3. **Paginar** los `index` (forzar filtro por categoría).
4. **Bulk-insert** de matches (no create-en-loop).
5. **Load testing** con 1,000-1,500 equipos sintéticos.
6. **Piloto** a ~250-300 equipos antes de Weston.

Ninguno es reescritura estructural — el modelo y la lógica ya están.

## Veredicto en 1 línea
> Vendible hoy con honestidad hasta ~250-500 equipos (**HTX 275, SMC/Texas Gold Cup 251-295 alcanzables con piloto cuidadoso**); **Weston (1,200+) no aún** — colas + optimización + load testing primero.
