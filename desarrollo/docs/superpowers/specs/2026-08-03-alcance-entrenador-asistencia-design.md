# Qué ve un entrenador: alcance único y reemplazos por un día

> ## ✅ EJECUTADO Y EN PRODUCCIÓN (estado al 13-ago-2026)
>
> Verificado contra el código: `TrainerScope` aparece en 10 archivos de `saas_sport/app` y
> es hoy la **fuente única** de «las categorías del entrenador». Las tres definiciones
> divergentes que describe §«El problema» ya no existen.
>
> **Decisión: dejarlo así.** No reintroduzcas cálculos de alcance en controladores ni en
> `SessionAttendanceService` (memoria `alcance-entrenador-trainerscope-ago2026`).


**Fecha:** 2026-08-03
**Origen:** Lucman Pineda (Club Siempre Fuertes, prod) veía en Asistencia una categoría que no es suya y no veía las tres que sí lo son.

## El problema

El backend tenía **tres** definiciones de "las categorías del entrenador", y no coincidían:

| Dónde | Fuente | Correcta |
|---|---|---|
| `PlaClubTeamSessionController::getCategoryIdsForTrainer` | pivot `pla_club_teams_category_trainer` | sí |
| `SessionAttendanceController::getTrainerCategoryIds` | pivot | sí |
| `SessionAttendanceService::getTrainerCategoryIds` | `sessions.trainer_id` | **no** |

La tercera manda en el módulo de Asistencia, y `sessions.trainer_id` casi nunca se llena. De ahí dos fallos:

1. **Fail-open.** Con la lista vacía, el filtro se saltaba entero (`count($ids) > 0`) y el entrenador veía la asistencia de **todo el club**. Medido en producción el 2026-08-03: **15 de 22 entrenadores activos** estaban así.
2. **Categoría ajena.** A Lucman (ficha de entrenador 11) lo habían puesto como `trainer_id` de la sesión 127, de categoría 113 "U-15 Preparatorio Tye". El módulo dedujo que esa era *su* categoría: veía 5 ocurrencias de julio de una categoría ajena y ninguna de las suyas (55, 57, 73).

## La regla, una sola

> Un entrenador ve una sesión si **la categoría está asignada a él**, o si **él es el entrenador de esa sesión ese día**.

Lo segundo es lo que modela un reemplazo. Ya existían los dos canales, sin usarse para visibilidad:

- `pla_club_teams_session_exceptions.new_trainer_id` — reemplazo de **un día** concreto. Lo escribe `modifyOccurrence`, y el modal `EditOccurrenceModal` del calendario ya lo expone.
- `sessions.trainer_id` — una sesión suelta a su nombre.

`SessionRecurrenceService::formatOccurrence()` ya resuelve el entrenador efectivo de cada ocurrencia con esa precedencia (excepción del día > `trainer_id` de la sesión > primer entrenador de la categoría), así que el reemplazo no necesita lógica nueva: basta con mirar `occurrence.trainer_id`.

**Fail-closed:** entrenador sin categorías asignadas y sin nada que cubrir ve cero. Nunca "ve todo".

**Propietario, Admin y Contador** no filtran, aunque tengan ficha de entrenador.

**El titular no pierde nada.** Delegar un día no le quita la sesión de la vista: la categoría sigue siendo suya y necesita ver qué se registró.

## Implementación

`app/Services/TrainerScope.php` — fuente única:

| Método | Devuelve |
|---|---|
| `trainerRecord($clubId, $userId)` | Ficha con la que filtrar; `null` = ve todo (rol privilegiado o no entrena aquí) |
| `assignedCategoryIdsFor($trainer)` | Categorías del pivot |
| `coversOccurrence($occ, $assigned, $trainerId)` | La regla, aplicada a una ocurrencia |
| `coveredSessionIds($clubId, $trainer)` | Sesiones que cubre sin ser suya la categoría |
| `visibleCategoryIds($clubId, $trainer)` | Asignadas + cubiertas, para poblar filtros |

Consumidores:

- `SessionAttendanceService::getAttendanceOccurrences()` — filtra por ocurrencia, siempre que haya ficha.
- `SessionAttendanceService::getFilterCategories()` — `visibleCategoryIds`, fail-closed.
- `SessionAttendanceController::getTrainerCategoryIds()` — delega (reportes y `resolveCategoryFilter`).
- `PlaClubTeamSessionController::index()` — categorías asignadas `OR` sesiones cubiertas.
- `PlaClubTeamSessionController::occurrences()` — la regla por ocurrencia, igual que asistencia.

Padres y jugadores siguen por `getAllowedCategoryIds()`, sin cambios.

Granularidad, a propósito distinta según la pantalla: el **calendario y la asistencia** filtran día a día (un reemplazo ve solo el día que cubre); el **listado plano de sesiones** filtra por sesión, porque no tiene eje de fechas.

## Permisos de la planilla

No se tocan. `authorizeAttendanceSheetAccess` ya exige rol de staff del club sin mirar categoría, así que el reemplazo puede registrar la asistencia del día que cubre en cuanto la ve. Apretarlo a "solo mis categorías" rompería a propietarios y administradores, que no tienen ninguna.

## Tests

`tests/Feature/AttendanceTrainerScopeTest.php` (10 casos): solo lo asignado; sin categorías ve cero; `trainer_id` de una sesión suelta da esa sesión y no la categoría entera; el propietario sigue viendo todo; el reemplazo ve el día que cubre y solo ese; el titular conserva la sesión delegada; la categoría cubierta aparece en el filtro; listado y calendario cuentan lo mismo.

## Dato sucio en producción

La sesión 127 lleva `trainer_id = 11` (Lucman) en una categoría que no es suya. Miguel confirma que él solo debe dar clase en sus categorías asignadas. Con la regla nueva esa sesión le seguiría apareciendo **como reemplazo**, así que hay que limpiar el dato aparte:

```sql
UPDATE pla_club_teams_sessions SET trainer_id = NULL WHERE id = 127;
```

Pendiente de confirmación de Miguel antes de ejecutarlo.
