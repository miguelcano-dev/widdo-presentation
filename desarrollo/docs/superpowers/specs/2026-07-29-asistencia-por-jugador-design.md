# Diseño: Tab "Por Jugador" en Reportes de Asistencia

> ## ✅ EJECUTADO Y EN PRODUCCIÓN, UI INCLUIDA (estado al 13-ago-2026)
>
> Verificado contra el código: la pestaña existe y está cableada —
> `frontend/src/pages/dashboard/Attendance/components/PlayersAttendanceTab.jsx`,
> `PlayersAttendanceToolbar.jsx`, `PlayerAttendanceRow.jsx`, `PlayerMonthBreakdown.jsx`,
> con los hooks `usePlayersAttendance.js` y `usePlayerAttendanceDetail.js`, colgando de
> `AttendanceReportsPage.jsx`. En backend, 39 archivos tocan asistencia por jugador.
>
> El alcance del entrenador lo fija `TrainerScope` — ver
> `2026-08-03-alcance-entrenador-asistencia-design.md`.


**Fecha:** 2026-07-29
**Estado:** Aprobado por Miguel (conversación 29-jul)
**Repos:** `desarrollo/frontend/` (React) + `desarrollo/saas_sport/` (Laravel)
**Pantalla:** `/home/attendance-reports`

## Problema

Ver la asistencia de **un jugador** en un periodo hoy cuesta 4 pasos y solo funciona mes a mes:

1. Elegir año y **mes concreto** en los filtros de arriba.
2. Ir al tab "Por Categoría".
3. Click en la categoría a la que pertenece el jugador (hay que saberla).
4. Buscar el nombre en la caja de búsqueda de la matriz.

Además, si el filtro dice "Todo el año", la matriz **cae al mes actual en silencio**: el backend
valida `month` como requerido (`AttendanceController.php:522`) y el frontend rellena con el mes de
hoy (`AttendanceReportsPage.jsx:151`). No hay forma de ver el año completo de un jugador.

Existe un endpoint que ya responde justo eso — `GET .../attendance-player/{playerId}`, que con `year`
y sin `month` devuelve el año entero (`SessionAttendanceController.php:208-214`) — y un método en
`sessionService.js:231` que lo llama. **Ningún componente lo usa.** Falta la UI.

## Decisiones tomadas

| Tema | Decisión |
|------|----------|
| Forma | Tab nuevo **"Por Jugador"**, tabla estilo `/home/collections`. **Es el tab por defecto.** |
| Tab Ranking | **Se elimina** (frontend + payload backend). Queda cubierto por ordenar la tabla nueva. |
| Detalle expandido | Resumen por mes; click en un mes despliega la tira de días. Una fila abierta a la vez. |
| Cobertura | Salen **todos** los jugadores activos, incluidos los que tienen 0 registros. |
| Export | Botón "Exportar Excel": exporta **todo el resultado filtrado**, no solo la página visible. |
| Badge de pagos | Se conserva `PaymentBadge` (pendientes/vencidos) junto al nombre. |
| Estado `excused` | Alineado con el spec de incapacidades del mismo día: `excused` **fuera del denominador**. |
| i18n | EN/ES/PT completo, default inglés, sin hardcodear español. |

## Alineación con el spec de incapacidades

`2026-07-29-incapacidades-asistencia-mobile-design.md` (aprobado el mismo día) agrega la columna
`status` (`present|absent|late|excused`) a `pla_club_teams_sessions_attendances` y fija que un
jugador incapacitado **no baja su % ni el del equipo**. Este tab adopta la misma regla desde el
principio:

```
rate = (present + late) / (present + late + absent)      // excused NO entra
```

- Lectura del estado: usar la columna `status` cuando exista; si esta pantalla se implementa antes
  de esa migración, derivarlo igual que hoy (`attended && notes === 'Llegó tarde'` → `late`;
  `attended` → `present`; resto → `absent`) y dejar el punto de lectura **en un solo sitio** para
  que el cambio sea de una línea.
- La columna de incapacidades se muestra solo si el club tiene alguna: evita una columna de ceros.

## UI

Esqueleto calcado de `/home/collections`: toolbar en su propia `Card`, `Card` con `Table`, fila
expandible (una a la vez), paginación al pie.

```
[ Por Jugador ] [ Resumen ] [ Por Categoría ] [ Tendencia ]
      ^ por defecto

Año 2026  ‹ ›        [Todo el año v]  [Todas las categorías v]   ← filtro global, ya existe

┌──────────────────────────────────────────────────────────────┐
│ 🔍 Buscar jugador                    [Peor % v]  [⬇ Excel]   │  ← toolbar del tab
└──────────────────────────────────────────────────────────────┘

    Jugador                    Asistencias  Ausencias    %
 ●  Carlos Ruiz  💲2                   5        17      23%   ›
    Sub-15
 ●  María Gómez                       12        10      55%   ⌄
    Sub-13
      ├ Enero      8 ✓  1 ✗   89%  ›
      ├ Febrero    6 ✓  3 ✗   67%  ›
      └ Marzo      1 ✓  8 ✗   11%  ⌄
           03/03 ✗   05/03 ✗   10/03 ✓   12/03 ✗
 ●  Andrés Mora                        0        0        —    ›
    Sub-11 · sin registros

               25 de 137          < Página 1 de 6 >
```

### Reglas de la fila

- **Punto de color = solo el %.** Verde `≥80`, ámbar `60-79`, rojo `<60`, gris si no hay registros.
  Nada más pinta la fila (misma disciplina que collections: el semáforo significa una cosa sola).
- Nombre en negrita; debajo, en gris pequeño, las categorías del jugador.
- `PaymentBadge` (el de `AttendanceReportsPage.jsx:216-234`) junto al nombre, sin cambios de lógica.
- Jugador con 0 registros: fila con `—` en `%`, leyenda "sin registros", **siempre al final del
  orden** (no se cuela como 0% cuando ordenas por peor asistencia).

### Filtros

El filtro global de arriba (año / mes / categoría) sigue mandando sobre este tab, igual que sobre
los demás. La toolbar del tab añade solo lo suyo:

| Control | Valores |
|---------|---------|
| Buscar jugador | texto libre, debounce 300 ms |
| Categoría | reutiliza el select global; en la toolbar no se duplica |
| Ordenar | Peor asistencia primero (**default**) · Mejor asistencia · Más ausencias · Nombre A-Z |

### Detalle expandido

- **Con "Todo el año"**: una fila por mes con `presentes ✓ / ausencias ✗ / %`. Click en el mes
  despliega la tira de días de ese mes.
- **Con un mes concreto en el filtro global**: se salta el nivel de meses y abre directo la tira de
  días.
- Tira de días: `dd/MM` + ✓ / ✗ / — (sin registro), con `title` = nombre y hora de la sesión.
- Solo una fila de jugador abierta a la vez (`expandedPlayer`, patrón de
  `CollectionsManagementPage.jsx:70`).

## Backend (Laravel)

### Endpoint nuevo

`GET /api/pla_club_teams/{club}/attendance-players` → `SessionAttendanceController::playersList`,
nombre de ruta `attendance.players`, junto a `attendance.stats` (`routes/api.php:892`).

**Parámetros**

| Param | Reglas |
|-------|--------|
| `year` | `required|integer|min:2020|max:2030` |
| `month` | `nullable|integer|between:1,12` (ausente = año completo) |
| `category_id` | `nullable|integer` |
| `search` | `nullable|string|max:100` |
| `sort` | `nullable|in:worst_rate,best_rate,most_absences,name_asc` (default `worst_rate`) |
| `page` | `nullable|integer|min:1` |
| `per_page` | `nullable|integer|between:1,100` (default 25) |
| `all` | `nullable|boolean` — para el export; ignora paginación con **tope duro de 1000 filas** |

**Autorización.** `authorize()` explícito (regla post-auditoría RBAC) + el filtro de entrenador que
ya existe en `stats` (`SessionAttendanceController.php:107-120`): un Trainer solo ve sus categorías
asignadas, y pedir una ajena devuelve 403. Se extrae a un método privado y lo usan ambos.

**Respuesta**

```json
{
  "rows": [
    {
      "player_id": 42,
      "name": "Carlos Ruiz",
      "categories": ["Sub-15"],
      "present": 5, "late": 0, "absent": 17, "excused": 0,
      "registered": 22,
      "rate": 23,
      "has_records": true,
      "pending_count": 2, "overdue_count": 1
    }
  ],
  "meta": { "current_page": 1, "last_page": 6, "per_page": 25, "total": 137 }
}
```

- `rate` es `null` cuando `has_records` es `false` (denominador 0). El frontend pinta `—`.
- `pending_count` / `overdue_count` salen del helper de pagos que ya existe
  (`SessionAttendanceController.php:736`), invocado **una vez por página** con los ids de esa página.

### Refactor: fundir top/bottom en la query paginada

`getTopAttendees` y `getBottomAttendees` (usados en `SessionAttendanceController.php:146-147`) hacen
exactamente la agregación por jugador que necesita `playersList`, con `limit 5` y orden fijo. Se
funden en **un** método privado con orden, límite y offset parametrizables. Resultado: una query
agregada en vez de tres casi idénticas.

**Base de la agregación:** jugadores activos del club (`p.status = 'ACT'`, sin `deleted_at`) por
`LEFT JOIN` contra las asistencias del rango — el `LEFT` es lo que hace aparecer a los jugadores con
0 registros.

### Limpieza del Ranking

- `stats` deja de calcular y devolver `top_attendees` / `bottom_attendees`
  (`SessionAttendanceController.php:146-154, 166-167`). Son 2 queries agregadas + un lookup de pagos
  que hoy se pagan en **cada** carga de la pantalla.
- Verificado antes de borrar: el único consumidor es `AttendanceReportsPage.jsx:214-215`. Ni tools
  del agente IA, ni dashboards, ni tests.

## Frontend (React)

Archivos nuevos, siguiendo la estructura de `pages/dashboard/Collections/`:

```
pages/dashboard/Attendance/
├── AttendanceReportsPage.jsx          (modificado)
└── components/
    ├── PlayersAttendanceTab.jsx       tabla + paginación + estados vacío/error
    ├── PlayersAttendanceToolbar.jsx   buscador + ordenar + export
    ├── PlayerAttendanceRow.jsx        fila + expandible
    └── PlayerMonthBreakdown.jsx       meses → tira de días
hooks/attendance/
    ├── usePlayersAttendance.js        React Query, lista paginada
    └── usePlayerAttendanceDetail.js   React Query, detalle (enabled solo al expandir)
```

- **React Query** como en collections (`useCollectionsData`), no `useState` + `useEffect`. El detalle
  se pide solo al expandir (`enabled: isExpanded`) y queda cacheado por jugador+periodo.
- **Cambios en `AttendanceReportsPage.jsx`:** agregar el tab, ponerlo por defecto, borrar el
  `TabsTrigger` de Ranking y su `TabsContent` (líneas 402-408 y 712-813), mover `PaymentBadge` a
  `PlayerAttendanceRow.jsx`, borrar `topAttendees`/`bottomAttendees` (214-215).
- **Export Excel:** mismo `xlsx` que ya usa la matriz (`AttendanceReportsPage.jsx:904-994`). Pide la
  lista con `all=1`, cabecera con club / periodo / filtros aplicados, y una fila por jugador con
  presentes, ausencias, excusadas, total y %. Si el resultado toca el tope de 1000, avisar en el
  toast que el export quedó recortado — nunca truncar en silencio.
- **i18n:** claves nuevas bajo `players_tab.*` en el namespace `sessions` (ya cableado), en es / en /
  pt-BR. Las cadenas nuevas no se hardcodean.

## Testing

**Backend (Pest/PHPUnit)** — `playersList`:

- Jugador con 0 registros aparece, con `rate: null` y al final del orden.
- `excused` no entra en el denominador del `rate`.
- Trainer solo ve sus categorías; pedir una ajena → 403; cross-club → 403 por ClubScope.
- `search` filtra por nombre y apellido.
- Cada valor de `sort` ordena como dice.
- Paginación: `meta` correcta; `all=1` ignora páginas y respeta el tope de 1000.
- `stats` sigue verde tras quitar top/bottom (regresión del refactor de la query compartida).

**Frontend:** unit del agrupado por mes (un año de historial → 12 grupos con totales correctos).

**E2E (Playwright, perfil owner y trainer):** entrar a `/home/attendance-reports` → el tab por
defecto es Por Jugador → buscar un jugador → expandir → desplegar un mes → ver la tira de días.
Con perfil trainer, la lista solo trae jugadores de sus categorías.

## Rendimiento

La agregación va sobre `pla_club_teams_sessions_attendances` filtrada por rango de fechas y club.

**Índice: ya existe.** `attendances_player_date_idx` sobre `(player_id, attendance_date)` se creó en
`database/migrations/2026_01_25_100003_add_performance_indexes.php:36`. No hace falta migración
nueva. Queda pendiente solo medir con el club más grande de producción y confirmar por `EXPLAIN` que
la query lo usa.

## Fuera de alcance (v1)

- Comparar dos jugadores lado a lado.
- Alertas automáticas por caída de asistencia.
- Podio / reconocimiento del jugador con mejor asistencia: la idea vale, pero rinde en la app del
  jugador o del padre ("jugador del mes", racha de asistencia, push), no en una pantalla de análisis
  que solo ve el staff. Por eso el Ranking se retira aquí en vez de mudarse.
- Export en PDF (hoy solo Excel).
