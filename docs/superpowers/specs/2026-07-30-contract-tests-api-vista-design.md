# Tests de contrato entre API y vista — Diseño

**Fecha:** 2026-07-30
**Estado:** spec listo, PENDIENTE DE EJECUTAR en otra sesión
**Origen:** el 30-jul-2026 la página de live scoring de torneos resultó no haber funcionado nunca. Cuatro campos que la vista leía no existían en la respuesta de su propio controlador. Ningún test lo detectó porque no hay ninguno que compare ambas cosas.

---

## 1. El problema, con los datos reales

`LiveScoringPage.jsx` consumía nombres que `TournamentLiveDashboardController` nunca devolvió:

| La vista leía | La API devuelve | Efecto en pantalla |
|---|---|---|
| `court.name` | `court_name` | Nombre de cancha vacío |
| `match.team_a.name` / `score_a` | `home_team` / `home_score` | Marcadores como "TBD 0" |
| `overview.in_progress` | `matches_in_progress.count` | Contador siempre a cero |
| `event.type` / `match_label` / `player_name` / `time` | `event_type` / `home_team`+`away_team` / `team_name` / `minute` | Ticker como lista de "Event -" |

Y en la misma zona, `useCheckInMonitor` asignaba `response.data` cuando la API devuelve `{data:{check_ins:[…]}}`: `ticker.map()` **tiraba la página entera** con el error boundary.

Tres propiedades de estos bugs explican por qué sobrevivieron tanto:

1. **Degradan en silencio.** `undefined` en JSX no lanza: renderiza vacío. Solo el `.map()` sobre un objeto llegó a romper.
2. **El error boundary se los traga.** `ChunkErrorBoundary` muestra "Something went wrong / An unexpected error occurred / Retry / Reload" **sin log en consola**, porque `SecureLogger` lo suprime en build de producción.
3. **Los tests existentes no los ven.** Los de backend afirman sobre la respuesta pero no sobre quién la consume. Los E2E de Playwright navegan y comprueban que la página carga — y una página con campos vacíos carga perfectamente.

## 2. Objetivo

Un test que falle cuando la forma de la respuesta de un endpoint deje de encajar con lo que la vista consume. Barato de mantener, sin duplicar la lógica de la API.

**No** buscamos cobertura total. Buscamos cerrar la clase de fallo: *la vista lee un campo que la API no manda.*

## 3. Enfoque propuesto: contrato declarado, verificado en los dos lados

La idea es que cada pareja endpoint↔vista declare **una sola vez** qué campos usa, y que dos tests distintos verifiquen ese mismo fichero:

```
frontend/src/contracts/
├── live-scoring.contract.js
├── check-in-monitor.contract.js
└── owner-dashboard.contract.js
```

Un contrato es datos, no código:

```js
export default {
  endpoint: 'GET /api/organizer/tournaments/{tournament}/live/courts',
  // Camino desde la raiz de la respuesta hasta la coleccion que consume la vista
  root: 'data[]',
  // Campos que la vista LEE. Si la vista deja de usar uno, se quita de aqui.
  required: ['court_id', 'court_name', 'venue_name'],
  optional: {
    current_match: ['id', 'home_team', 'away_team', 'home_score', 'away_score', 'status'],
    next_match: ['id', 'scheduled_at'],
  },
};
```

**Lado backend (PHPUnit).** Un test por contrato que llama al endpoint real con datos sembrados y afirma que cada campo `required` está presente en la respuesta. Es el test que habría cazado `court_name` vs `court.name`.

**Lado frontend (Vitest, sin navegador).** Un test que renderiza el componente con un mock construido **a partir del contrato** y afirma que la pantalla muestra los valores del mock. Es el que habría cazado "TBD 0": el mock trae `home_team: 'Orlando Force'` y el render no lo pinta.

La clave es que **el mock se derive del contrato**, no se escriba a mano. Si se escribe a mano, se escribe con los nombres que la vista ya usa y el test pasa mientras la app está rota — que es exactamente el agujero actual.

## 4. Alternativas consideradas

| Opción | Por qué no es la primera elección |
|---|---|
| **OpenAPI/Swagger generado + tipos** | Es la solución correcta a largo plazo y elimina la duplicación, pero exige anotar cientos de endpoints antes de dar valor. Proponerlo aquí bloquea el arreglo. Dejar como dirección, no como primer paso |
| **Tests E2E que afirmen sobre texto visible** | Cazan el síntoma, pero son lentos, frágiles y necesitan datos sembrados y navegador. Útiles como red secundaria, no como la principal |
| **Zod/Yup validando en runtime la respuesta** | Falla en producción delante del cliente en vez de en CI. Interesante como complemento (avisar en consola en dev), no como test |
| **Solo tests de backend** | No habría cazado "TBD 0": la API estaba bien, la vista leía mal |

## 5. Alcance de la primera entrega

Tres contratos, elegidos porque son los que ya sabemos que estaban roto o son críticos:

1. `live/courts` ↔ `LiveScoringPage` (canchas y partido actual)
2. `live/overview` + `live/events` ↔ `LiveScoringPage` (contador y ticker)
3. `check-in/ticker` + `check-in/teams` + `check-in/stats` ↔ `CheckInMonitorPage`

Con eso se valida el patrón. Si funciona, extender por valor: dashboard del dueño, cobros, inscripciones.

**Criterio de éxito:** revertir cualquiera de los cinco arreglos del 30-jul debe poner un test en rojo. Ese es el test del test — hacerlo explícitamente, no asumirlo.

## 6. Cosas que quien lo ejecute debe verificar antes de escribir código

- **¿Existe Vitest en el frontend?** `package.json` tiene Playwright para E2E; comprobar si hay runner de unitarios. Si no, montarlo es parte del trabajo y cambia la estimación.
- **Cómo sembrar datos en PHPUnit para torneos.** Hay 216 tests de torneos verdes; mirar cómo montan un torneo con bracket y partidos, y reutilizar esas factories en vez de inventar.
- **`tests/CreatesApplication.php` fija la BD de test.** No tocarlo. Y **nunca** correr la suite sin comprobar antes que `bootstrap/cache/config.php` no existe: con config cacheada, `RefreshDatabase` dropea la BD de **desarrollo**. Ver `tests-dropean-db-dev-jul2026` en memoria.
- **El error boundary oculta errores.** Si al montar los tests de frontend algo "no hace nada", mirar si `ChunkErrorBoundary` lo está capturando.

## 7. Fuera de alcance

Migrar a OpenAPI · tipar el cliente de API · tests de contrato para el agente de IA (sus tools ya tienen evals propias, ver `ai-first-execution-jul2026`) · cualquier cambio de producto.

## 8. Riesgo principal

Que el contrato se convierta en un tercer sitio que mantener y se desincronice de los otros dos. Mitigación: el contrato debe ser **el único sitio** donde se declaran los nombres de campo para esa pantalla, y el mock del test de frontend debe generarse de él. Si alguien escribe un mock a mano en el test, el valor desaparece — dejarlo dicho en el propio fichero de contrato.
