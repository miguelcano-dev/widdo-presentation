<!-- ARCHIVADO 13-ago-2026 — QA de torneos YA EJECUTADO; el doc era plan/instrucción de ejecución — pendientes vivos extraídos a torneos/PENDIENTES-PERFORMANCE.md -->
> ⚠️ **ARCHIVADO (13-ago-2026).** El QA del módulo de torneos **ya se ejecutó**; este documento era el plan/instrucción para ejecutarlo.
> **Lo único que sigue abierto (performance del scheduling) está extraído en `../../torneos/PENDIENTES-PERFORMANCE.md`.** Los escenarios de prueba siguen vivos en `../../torneos/GUIA-PRUEBAS-TORNEOS.md`.

# Estado de la optimización de scheduling (honesto)

> Verificado por el main-loop dentro de Docker (`saas_sport-saas_sport_app-1`) el 10-jul.

## Qué se hizo
`widdo-tech` modificó `SchedulingService.php` (+451), `BracketGeneratorService.php` (+274), `TournamentRegistrationController.php` (paginación) — y, **fuera de scope**, `ToolDefinitions.php` (+263) y un `PublicTournamentController.php` nuevo. El agente **se cortó por límite de sesión sin reportar ni verificar.**

## Verificación (main-loop)
- **Correctitud:** ✅ `SchedulingServiceTest` **10/10** (583 aserciones). El refactor NO rompió comportamiento.
- **Performance:** ⚠️ **NO resuelto.** Benchmark actual:
  - 28 fixtures → 2,1 s · 91 → 8,0 s · 190 → **19,2 s**
  - Crece 9,2× cuando el trabajo crece 6,8× → **sigue superlineal (cuadrático)**.
  - `optimizeSchedule` → ~3,4 queries/partido → **el N+1 sigue presente**.
- Los tests de perf (que QA escribió para DETECTAR el problema) **siguen pasando** → el problema sigue ahí. Con un fix real, deberían FALLAR (o reescribirse para asertar rapidez).

## Veredicto
Optimización **incompleta/inefectiva**. Correctitud a salvo; velocidad NO lograda.

## Riesgos de higiene del repo (importante)
- Los cambios están **sin commitear y mezclados** con WIP previo del usuario (07-09: auth, PDF, waivers, migración QR, credenciales — NO son del agente).
- El agente tocó archivos **fuera de scope** (ToolDefinitions, PublicTournamentController) que hay que revisar.
- **Lección:** para tareas de escritura en el repo activo, aislar el agente en un **git worktree**.

## Definición de "terminado" para el próximo intento
1. Reescribir `optimizeSchedule` para que las queries sean ~constantes (no crezcan con nº de partidos).
2. Hacer `generateSchedule` ~lineal (índices en memoria reales).
3. **Los tests de perf deben REESCRIBIRSE para asertar rapidez/near-linear y PASAR** (hoy asertan el problema).
4. `SchedulingServiceTest` sigue 10/10.
5. Correr en Docker: `docker exec saas_sport-saas_sport_app-1 php artisan test tests/Feature/SchedulingServiceTest.php` y el perf.
6. Ejecutar en **worktree aislado**; revisar/descartar los cambios fuera de scope.
