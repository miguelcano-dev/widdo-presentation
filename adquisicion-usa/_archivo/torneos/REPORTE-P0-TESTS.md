<!-- ARCHIVADO 13-ago-2026 — QA de torneos YA EJECUTADO; el doc era plan/instrucción de ejecución — pendientes vivos extraídos a torneos/PENDIENTES-PERFORMANCE.md -->
> ⚠️ **ARCHIVADO (13-ago-2026).** El QA del módulo de torneos **ya se ejecutó**; este documento era el plan/instrucción para ejecutarlo.
> **Lo único que sigue abierto (performance del scheduling) está extraído en `../../torneos/PENDIENTES-PERFORMANCE.md`.** Los escenarios de prueba siguen vivos en `../../torneos/GUIA-PRUEBAS-TORNEOS.md`.

# Reporte P0 — Tests del motor de torneos (widdo-qa)

> Primera tanda de tests reales escritos y corridos sobre el Competition Engine. Honesto: separa lo verificado limpio de lo pendiente.

## Archivos creados (en `desarrollo/saas_sport/`)
- `tests/Feature/TournamentScaleTest.php` — matriz a 32/64/128 (`@group scale`).
- `tests/Feature/SchedulingServiceTest.php` — 10 tests del scheduler (el riesgo #1, antes 0%).
- `tests/Feature/SchedulingPerformanceTest.php` — benchmark (`@group perf`).
- 5 factories nuevas (Venue, Court, Slot, Constraint, Bracket) + `buildTournamentFast()` en el trait.
- **No se tocó `app/`** (solo tests).

## Resultados
| Suite | Estado |
|---|---|
| **SchedulingServiceTest** | ✅ **10/10 PASAN** (583 aserciones), corrida limpia |
| **TournamentScaleTest** (32/64/128) | 🟡 Parcial: Swiss 32 y 64 pasaron limpio; 128 y resto pendiente de re-run limpio |
| **SchedulingPerformanceTest** | 🟡 Wall-time medido; conteo de queries N+1 pendiente |

**Nota de honestidad del agente:** un primer intento de escala quedó inválido porque corrió 2 suites en paralelo sobre la misma BD de test (colisión de migraciones — artefacto de entorno, NO bug del engine). Se está re-corriendo limpio.

## ✅ Lo verificado (bueno)
El **scheduler es funcionalmente correcto**: ninguna cancha doble-agendada, ningún equipo con partidos solapados, constraints hard (max_games_per_day, min_rest, blackout) respetadas, soft penalizan quality_score, edge cases (sin courts/matches/dates) manejados. **Cero bugs de lógica confirmados hasta ahora.**

## 🔴 Hallazgo fuerte: PERFORMANCE del scheduling (cuantificado)
> **Round-robin de 32 equipos = 496 fixtures → `generateSchedule` tardó ~450.395 ms (7,5 MINUTOS) síncrono en el request.**

Confirma con número el "riesgo #1" de la auditoría. El greedy es ~**O(matches² × slots)**. Traducción de negocio:
- **No es solo problema de ballenas.** Una sola categoría round-robin grande ya bloquea el request 7,5 min.
- **Matiz importante:** es un caso extremo (round-robin de 32 en un solo bracket = 496 matches). Los torneos reales se reparten en categorías de 16-64 en eliminación/grupos (pocos matches por bracket), donde es rápido. Pero **prueba que el algoritmo es cuadrático** → un total grande o un round-robin grande choca.
- **Implicación:** el fix de **colas (async) + reescribir `optimizeSchedule`** sube de "nice to have" a **necesario antes de cualquier evento mediano-grande** o de ofrecer round-robins grandes.

## 🟡 Pendiente de confirmar (corridas limpias lanzadas)
- Números finales de escala 32/64/128 para TODOS los formatos (candidatos a rojo: Swiss 128 no-repeat-pairing, balance de grupos snake).
- Conteo real de queries de `optimizeSchedule` (evidencia dura del N+1; el patrón está claro en `SchedulingService.php:296,309,320`).

## Fricciones de esquema documentadas (no bugs)
- `generateSchedule` requiere usuario autenticado (`generated_by` NOT NULL) → tests necesitan `actingAs`.
- Guard "sin dates" es defensivo/inalcanzable vía BD (`start/end_date` NOT NULL).

## Gaps para P1
- Seeding correctness + documentar `rating`/`snake` no implementados.
- Flujo API (inscripción→generar→resultados→standings).
- Regresión de paginación (`index` sin límite).
- **Infra de test:** MySQL + `RefreshDatabase` es lento y no soporta suites en paralelo sobre la misma BD → para nightly de escala/perf, BD por worker o `--parallel` con bases separadas.

## Veredicto actualizado
> El scheduler es **correcto** pero **lento a escala** (cuantificado: 496 fixtures = 7,5 min). Sweet-spot en eliminación/grupos es vendible; antes de eventos medianos-grandes o round-robins grandes, hace falta el fix de colas + optimización. Esto es ahora **evidencia dura para priorizar el trabajo de `widdo-tech`.**
