# Torneos — pendientes de performance (lo único que sigue abierto del gate)

> Nota corta, 13-ago-2026. Extraída de `_archivo/torneos/OPTIMIZACION-STATUS.md` y `_archivo/torneos/REPORTE-P0-TESTS.md`,
> que se archivaron porque el QA **ya se ejecutó**. Lo que sigue vivo es esto: la **correctitud está verificada,
> la velocidad no**. Esta nota es la referencia a citar cuando alguien pregunte "¿hasta dónde se puede vender?".

## Estado en una línea

El scheduler es **funcionalmente correcto** (`SchedulingServiceTest` 10/10, 583 aserciones) pero **sigue siendo cuadrático**.
La optimización que se intentó **no resolvió la velocidad**.

## El número que manda

Round-robin de 32 equipos = 496 fixtures → `generateSchedule` tardó **~7,5 minutos síncrono dentro del request**.

Benchmark tras el intento de optimización (10-jul, verificado en Docker `saas_sport-saas_sport_app-1`):

| Fixtures | Tiempo |
|---|---|
| 28 | 2,1 s |
| 91 | 8,0 s |
| 190 | 19,2 s |

El trabajo crece 6,8× y el tiempo crece 9,2× → **superlineal**. Y `optimizeSchedule` hace ~3,4 queries por partido:
**el N+1 sigue presente** (patrón en `SchedulingService.php:296,309,320`).

## Qué se puede prometer HOY (y qué no)

- **Vendible con honestidad hasta ~250-500 equipos por torneo**, en eliminación directa o grupos, que es como se
  reparten los torneos reales (categorías de 16-64, pocos partidos por bracket) y ahí va rápido.
- **No prometer round-robins grandes.** En una demo, enseñar eliminación directa o grupos.
- **Ballenas de 1.000+ equipos (Weston, iFlag, Super6, USSSA, Florida Premier) siguen bloqueadas.** No es un
  problema de research ni de contactos: es un problema de producto. Se desbloquean con el fix de colas, no antes.

## Definición de "terminado" para el próximo intento

1. Reescribir `optimizeSchedule` para que las queries sean ~constantes (que no crezcan con el nº de partidos).
2. Hacer `generateSchedule` ~lineal (índices en memoria reales).
3. Mover la generación a **colas (async)**: hoy bloquea el request.
4. **Los tests de perf deben REESCRIBIRSE para asertar rapidez/near-linear y PASAR.** Hoy asertan el problema, así
   que pasan *porque* el problema sigue ahí — si alguien los ve verdes, se cree que está arreglado.
5. `SchedulingServiceTest` sigue 10/10.
6. Correr en Docker: `docker exec saas_sport-saas_sport_app-1 php artisan test tests/Feature/SchedulingServiceTest.php` + el de perf.
7. Ejecutar en **worktree aislado** (el intento anterior mezcló cambios sin commitear con WIP del usuario y tocó
   archivos fuera de scope: `ToolDefinitions.php`, un `PublicTournamentController.php` nuevo).

## Cabos sueltos menores

- Escala 32/64/128 para **todos** los formatos: falta la corrida limpia. Candidatos a rojo: Swiss 128 (no-repeat-pairing)
  y balance de grupos snake.
- Conteo duro de queries de `optimizeSchedule` como evidencia del N+1.
- Infra de test: MySQL + `RefreshDatabase` no soporta suites en paralelo sobre la misma BD. Para el nightly de
  escala/perf hace falta una BD por worker.
