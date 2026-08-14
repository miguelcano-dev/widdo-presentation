<!-- ARCHIVADO 13-ago-2026 — QA de torneos YA EJECUTADO; el doc era plan/instrucción de ejecución — pendientes vivos extraídos a torneos/PENDIENTES-PERFORMANCE.md -->
> ⚠️ **ARCHIVADO (13-ago-2026).** El QA del módulo de torneos **ya se ejecutó**; este documento era el plan/instrucción para ejecutarlo.
> **Lo único que sigue abierto (performance del scheduling) está extraído en `../../torneos/PENDIENTES-PERFORMANCE.md`.** Los escenarios de prueba siguen vivos en `../../torneos/GUIA-PRUEBAS-TORNEOS.md`.

# Plan de Tests — Competition Engine (módulo de torneos)

> Hecho por `widdo-tech` (solo lectura). Documento para revisar ANTES de escribir tests. Objetivo: garantizar funcionamiento real hasta ~500 equipos, rápido y con best-practices. **No E2E por cada combinación** — invariantes + pirámide.

## Hallazgo que cambia el enfoque
El motor de brackets es **sport-agnóstico**: opera sobre `home_score`/`away_score` enteros, no ramifica por deporte. Lo que varía por deporte vive fuera (`PlaTournamentSportConfig`: scoring, duración, OT, tiebreaks — columnas JSON). **Consecuencia:** no hace falta matriz "deporte × formato" completa; el deporte se prueba en (a) standings/scoring y (b) scheduling (duración→slots). La matriz densa es **formato × tamaño × opciones**.

⚠️ **Honestidad crítica:** varias cosas están a medias en el engine — se documentan como gaps, no se inventa cobertura:
- `scoring_system`/`overtime_rules`/`tiebreaker_rules` **no los consume** el engine (solo usa win/draw/loss_points del bracket).
- **Sets de volleyball NO modelados.**
- `SEEDING_RATING` = igual que manual; `SEEDING_SNAKE` = aleatorio hoy (`BracketGeneratorService.php:56-57`) → **no vender como features.**
- Empate en formato de eliminación no tiene resolución (OT/tiebreak) modelada.

## Inventario a cubrir
**Deportes:** soccer (empates, 3-1-0, GD/GF), basketball (sin empates, OT), volleyball (sets — gap), baseball/softball (innings), flag football (duración corta→más slots).
**Formatos (todos completos en engine):** single elim, double elim, round-robin, group stage, Swiss, groups→elimination.
**Opciones:** seeding (manual/random; rating/snake sin implementar), byes (nextPow2), 3er puesto, tamaños de grupo, Swiss rounds, puntos custom, scheduling multi-cancha + 8 tipos de constraint.

## Estado actual (`TournamentEngineMatrixTest.php`, 372 líneas)
**Cubre:** SE/DE/RR/Group/Groups→elim/Swiss jugados a fin con scores sembrados, invariantes reales (campeón único, n-1 partidos, pairings únicos) — **pero tope 16 equipos.**
**NO cubre:** escala >16, seeding correctness, **scheduling (0%)**, variación de deporte, flujo API, paginación, performance.

---

## Plan por capas (pirámide)

### CAPA 1 — Matrix/Property tests (núcleo, mayor esfuerzo)
PHPUnit `#[DataProvider]` + generador de combos. Formato×{2..64} funcional, {128,256,512} en `@group scale`. **Invariantes a afirmar:**
- Eliminación resuelve a **1 campeón**; todo equipo en ≥1 match; nº matches = `(nextPow2(n)-1)+3erPuesto`.
- **Byes** = `nextPow2(n)-n`; bye-winner avanza; linkage `next_match_id` es un árbol que converge a la final; `resolveDeadSlots` converge (0 deadlocks).
- DE: grand-final-reset correcto; todo eliminado con 2 derrotas.
- RR = todos-vs-todos (`n(n-1)/2`, cada par 1 vez); cada equipo n-1 partidos.
- Grupos: fixtures = Σ gᵢ(gᵢ-1)/2; snake reparte equitativo (|max-min|≤1).
- Standings: W+D+L=played; points=win·W+draw·D+loss·L (**probar con puntos no-default**); ΣGF=ΣGA; rank permutación sin huecos.
- **Seeding (nuevo):** con seeds sembrados, seed1 vs seed2 solo en final; snake en grupos; **test que documenta rating/snake no implementados.**
- Swiss: sin repetir pairing; **ningún equipo con dos byes** (property nueva).
- Groups→elim: avanzan exactamente groups×advance_count, y son el top por **rank** (no solo el conteo).
- **Deporte (nuevo):** draw_points=0 + empate forzado no rompe; empate en eliminación **debe resolverse** (verificar/documentar OT inexistente).

### CAPA 2 — Integración/API (Laravel Feature, sin navegador)
Stripe en modo test/mock. Flujos: inscripción→aprobar→**generar bracket**→jugar matches (broadcast log)→standings→**pagos** (Connect, mock)→**check-in**.
**Scheduling (lo más crítico, hoy 0%):** ninguna cancha doble-agendada; ningún equipo con matches solapados; constraints hard respetadas/soft penalizadas; reschedule/swap no viola hard. Edge cases (sin courts/matches/dates).
**Regresión auditoría:** test que afirma paginación en `RegistrationController::index`/`BracketController::index` (hoy `->get()` sin límite → test rojo que guía el fix).

### CAPA 3 — E2E (Playwright, solo 2-3 journeys)
Proyecto `organizer-tournament`. (1) crear torneo→generar→ver bracket; (2) live scoring→ganador avanza en vivo; (3 opc) check-in día de evento. **No E2E por formato/tamaño.**

### CAPA 4 — Load/Performance (suite aparte, no en PR)
`LoadTestSeeder` (1.000-1.500 equipos). Medir: `generateSchedule` con ~1.500 matches; **`optimizeSchedule` N+1/cuadrático** (`SchedulingService.php:320`, con `DB::enableQueryLog`); endpoints sin paginar con 1.200 inscripciones; generación de bracket de 64 (confirmar que NO es cuello). k6/Artillery + benchmark PHPUnit `@group perf`. Métricas: p95, tiempo, nº queries, memoria.

---

## Best practices y velocidad
- **DB de test:** hoy MySQL + `RefreshDatabase` (lento). → SQLite in-memory donde el schema lo permita, o `DatabaseTransactions` en vez de refresh.
- **Seeding determinista** (ya se hace, `mt_srand`). **Faltan factories** para Bracket, SportConfig, Venue/Court/Slot, Constraint.
- **`php artisan test --parallel`** (la matriz es embarrassingly parallel).
- **Grupos** `@group scale|perf|e2e` → PR corre solo lo rápido (**<2-3 min**); escala/perf nightly.
- Poblar datos grandes con `insert()` masivo / `withoutEvents`.

## Priorización y esfuerzo
| # | Trabajo | Capa | Esfuerzo |
|---|---|---|---|
| **P0** | Ampliar matrix a 32/64/128 (invariantes ya existen) | 1 | S (1-2d) |
| **P0** | Tests de `SchedulingService` (riesgo #1, hoy 0%) | 2 | M (2-3d) |
| **P0** | Benchmark scheduling + optimizeSchedule N+1 (1.000-1.500) | 4 | M (2d) |
| **P1** | Seeding correctness + documentar rating/snake no impl. | 1 | S (1d) |
| **P1** | Flujo API inscripción→generar→resultados→standings | 2 | M (2d) |
| **P1** | Regresión paginación | 2/4 | S (0.5d) |
| **P2** | Deporte/scoring (puntos custom, empates, resolución) | 1 | S-M (1-2d) |
| **P2** | Pagos (Stripe mock) + check-in | 2 | M (2d) |
| **P3** | E2E Playwright (2-3 journeys) | 3 | M (2-3d) |
| **P3** | k6/Artillery load | 4 | M (2d) |

**Ruta:** P0 (valida la promesa "hasta 500" y mide el techo real) → P1 → P2 → P3.

## Gaps de cobertura actual (resumen)
1. **Escala:** 0 tests >16 equipos → la promesa de "500" está **NO verificada** hoy.
2. **Scheduling:** 0 tests (mayor riesgo algorítmico).
3. **Seeding:** no probado y parcialmente no implementado (rating/snake).
4. **Deporte:** scoring/OT/tiebreak/sets no consumidos por el engine.
5. **Flujo API:** sin cobertura de competición.
6. **Paginación:** bug conocido sin test de regresión.
7. **Performance:** cero medición, sin baseline.
8. **Infra:** MySQL + RefreshDatabase sin paralelo → migrar antes de escalar la suite.
