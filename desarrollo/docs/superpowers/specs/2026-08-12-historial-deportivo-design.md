# Historial Deportivo y Hoja de Vida del Jugador — Spec de diseño

> ## ⚠️ CORRECCIÓN 13-ago-2026 — F1-F2 NO implementadas (checkboxes marcados por error)
>
> **Nada de este spec está implementado.** Las 11 tareas de las fases 1-5 aparecían con `✅`
> en la tabla de progreso; era un error de marcado. Verificado el 13-ago contra el código:
> `pla_player_club_stints`, `pla_player_achievements` y `pla_player_profile_grants` no
> aparecen en **ningún** archivo de `saas_sport/` ni de `frontend/` (0 migraciones, 0 modelos,
> 0 endpoints). `PlayerSportsHistorySection` sigue comentada. Todas se han devuelto a `⬜`.
>
> **Estado real:** diseño APROBADO, ejecución NO INICIADA. Bloqueado en las decisiones
> **D1-D7 (§10)**; 🔴 D6 (revisión legal de menores) sigue siendo bloqueante para la Fase 4.
>
> Antes de reanudar, exigir la §9 (anti-huérfanos): la pieza no cuenta como hecha hasta que
> se llega a ella por una URL, un botón o un cron real.

**Fecha:** 2026-08-12 · **Estado:** APROBADO (matriz de roles decidida por Miguel el
12-ago; D1-D7 adoptan la recomendación salvo veto; 🔴 D6 revisión legal sigue siendo
bloqueante SOLO para la Fase 4)
**Origen:** Auditoría de huérfanos del 9-ago (la sección `PlayerSportsHistorySection`
llevaba comentada con un `TODO` y el backend nunca existió) + decisión de Miguel del
12-ago: «si un jugador sale de un equipo debe quedar que estuvo con ese equipo, su hoja
de vida deportiva para que la puedan ver en otro equipo, y una página pública del
jugador SI el jugador la comparte, por seguridad y privacidad».
**Maqueta:** `mockups-historial-deportivo/M1-hoja-de-vida.html` — las 4 superficies navegables.
**Mercado objetivo:** USA primero (recruiting juvenil, showcase para high school /
college). En Colombia sirve como retención («tu historia vive aquí») pero no es el pitch.

---

## 📍 Progreso de ejecución

### Fase 1 — Trayectoria (stints)
| # | Tarea | Estado |
|---|---|---|
| 1.1 | Tabla `pla_player_club_stints` + modelo + cierre automático al desactivar | ⬜ |
| 1.2 | Backfill desde los jugadores existentes (`start_date`, estado) | ⬜ |
| 1.3 | Pestaña «Trayectoria» en la ficha del jugador (club) y en «Mis hijos» (padre) | ⬜ |
| 1.4 | Tests por el camino real + alcanzabilidad | ⬜ |

### Fase 2 — Logros
| # | Tarea | Estado |
|---|---|---|
| 2.1 | Tabla `pla_player_achievements` (verificado vs declarado) + endpoints | ⬜ |
| 2.2 | Revivir `PlayerSportsHistorySection` (existe comentada) contra el backend real | ⬜ |
| 2.3 | Autoingesta verificada: torneos y asistencia alimentan la hoja | ⬜ |

### Fase 3 — Consulta entre clubes
| # | Tarea | Estado |
|---|---|---|
| 3.1 | Permisos de consulta (`pla_player_profile_grants`) + auditoría de cada vista | ⬜ |
| 3.2 | Pantalla del club consultante (solo lectura, sin export) | ⬜ |

### Fase 4 — Página pública (⚠️ gate legal)
| # | Tarea | Estado |
|---|---|---|
| 4.1 | Enlaces públicos con token + caducidad + revocación | ⬜ |
| 4.2 | Página `/p/{token}` (sin sesión, noindex, rate limit) | ⬜ |
| 4.3 | 🔴 **Revisión legal (menores) ANTES de activar en producción** — feature flag | ⬜ |

### Fase 5 — IA (si D7 lo aprueba)
| # | Tarea | Estado |
|---|---|---|
| 5.1 | Tools de LECTURA para el asistente (trayectoria y logros del propio club) | ⬜ |

---

## 1. Problema

Hoy, cuando un jugador sale de un club, **su paso por ese club desaparece**:

- `pla_club_teams_players` tiene `start_date` pero **no existe fecha de salida**. El
  estado pasa a `BOR` y ya: no queda ni cuándo entró a jugar de verdad ni cuándo se fue.
- No hay tabla, modelo ni endpoint de historial. El frontend tiene una sección de
  logros (`PlayerSportsHistorySection`, tipos: club/torneo/premio/selección/formación)
  **comentada** en `PlayerCreateEditPage.jsx:1231` con «TODO: Habilitar cuando se
  complete la implementación» — se diseñó la cara y nunca el cuerpo.
- Los datos deportivos que SÍ existen (stats de torneos en `PlaTournamentPlayerStat`,
  rankings, % de asistencia) están atados al club y a la vista interna: no componen
  ninguna hoja de vida.

En USA esto es producto vendible: el youth sports vive de que el chico construya un
perfil (recruiting, showcases, high school). Hoy eso se hace con PDFs caseros y
perfiles en plataformas de scouting caras.

## 2. Objetivos

1. Que la trayectoria de un jugador **sobreviva a su salida del club** y viaje con la
   persona.
2. Una **hoja de vida deportiva** componible: trayectoria + logros + estadísticas ya
   existentes, con distinción dura entre **verificado** (lo escribió un club o lo
   calculó el sistema) y **declarado** (lo escribió la familia).
3. **Consulta entre clubes con permiso**, no con copia — misma doctrina que la ficha
   médica portable ([[hoja-deportiva-portable-jul2026]]).
4. **Página pública opcional**, controlada por el jugador adulto o su acudiente, con
   token secreto, caducidad y revocación. Nunca creada por el club.

## 3. No-objetivos (alcance cerrado a propósito)

- **Ficha médica**: NO entra. Tiene su propio pendiente con revisión legal previa.
- **Marketplace/búsqueda de jugadores**: NO. Ningún directorio público ni buscador de
  menores. La página pública solo se alcanza con el enlace.
- **Editar el pasado de otro club**: un club jamás toca los stints ni los logros
  verificados por otro club.
- **Export/PDF de la consulta entre clubes**: la consulta es en pantalla. (Un PDF de la
  PROPIA hoja para la familia puede venir después; no en v1.)
- **Migrar datos de plataformas externas.**

## 4. La decisión de fondo: de quién es el dato

En Widdo «jugador» (`pla_club_teams_players`) es una fila POR CLUB; la persona es el
`user`. Todo lo nuevo cuelga de **`user_id`** (la persona), con `club_id` y `player_id`
como referencias del contexto. Así el historial no muere con la fila del club.

Consecuencia dura: un chico que estuvo en 2 clubes tiene 2 filas de player y UNA
persona. La hoja de vida se arma por `user_id`. Los jugadores sin cuenta de usuario
(menores gestionados 100% por el acudiente) usan el `user_id` del registro del jugador
— verificar en Fase 1 cómo queda el vínculo en los datos reales antes de asumirlo.

## 5. Modelo de datos

### 5.1 `pla_player_club_stints` — pasos por club (Fase 1)

| Campo | Notas |
|---|---|
| `user_id` | La persona. Índice principal de consulta |
| `club_id`, `player_id` | Contexto. SIN `ClubScope` global: se consulta cross-club por diseño, la autorización va en la capa de servicio |
| `joined_at` | Del `start_date` real |
| `left_at` | null = sigue activo |
| `left_reason` | **Catálogo cerrado y NEUTRO**: `transfer`, `moved`, `personal`, `other`. 🔴 NUNCA campos libres ni motivos estigmatizantes («expulsado»): esto puede acabar visto por terceros |
| `sport_id`, snapshot de categorías | Qué jugaba, sin depender de que la categoría siga existiendo |

**Cierre automático**: donde hoy se pone `status = BOR` (hay UN toggle en el modelo,
línea ~36) se cierra el stint con `left_at = hoy`. Reactivación = stint nuevo, no
reabrir el viejo (dos épocas distintas en el mismo club son dos entradas del
historial, que es como lo lee un scout).

**Backfill**: una migración crea stints para TODOS los jugadores existentes:
activos → stint abierto desde `start_date`; `BOR` → stint cerrado con `left_at` =
`updated_at` como mejor aproximación, marcado `approximate = true` para no mentir.

### 5.2 `pla_player_achievements` — logros (Fase 2)

Tipos ya diseñados en la sección comentada: `club`, `tournament`, `award`,
`selection`, `training`. Campos: `user_id`, `type`, `title`, `description`,
`achieved_at`, `club_id` (nullable — un logro puede ser de una selección regional).

**La columna que manda: `verified_by_club_id`** (nullable):
- Lo escribió el staff de un club → verificado por ese club. El club solo verifica lo
  suyo.
- Lo escribió la familia → declarado. Editable/borrable solo por la familia.
- Lo generó el sistema (Fase 2.3: campeón de torneo, asistencia destacada) →
  verificado, `source = system`, no editable.

### 5.3 `pla_player_profile_grants` — consulta entre clubes (Fase 3)

`user_id`, `granted_to_club_id`, `granted_by` (el jugador adulto o el acudiente — el
club receptor SOLICITA, nunca se autoconcede), `scope` (json: qué secciones),
`expires_at` (obligatorio, máx. D4), `revoked_at`. Cada consulta se registra en
`pla_player_profile_views` (quién, cuándo, qué vio) **y la familia puede ver ese
registro**: la transparencia es la mitad del valor.

### 5.4 `pla_player_profile_links` — página pública (Fase 4)

`user_id`, `token` (aleatorio ≥ 40 chars, único, NO derivable), `created_by` (adulto o
acudiente — **el club no puede crear esto**), `expires_at` (obligatorio, máx. D4),
`revoked_at`, `sections` (json), `view_count`. Un solo enlace activo por persona
(crear otro revoca el anterior: menos superficie).

## 6. Reglas duras (la seguridad vive en servicios, nunca en UI)

- **R1** El dato del jugador cuelga de la persona y sobrevive al club.
- **R2** Un club solo escribe su propio stint y sus propios logros verificados.
- **R3** Verificado y declarado se distinguen SIEMPRE, en toda superficie (badge). Un
  logro declarado jamás se pinta como verificado — es la moneda de confianza del módulo.
- **R4** Página pública: solo la crea el jugador adulto o su acudiente; token secreto;
  caducidad obligatoria; revocable al instante; **sin PII** (ni documento, ni
  dirección, ni teléfono, ni correo, ni nada médico); foto solo si el dueño la activa;
  `X-Robots-Tag: noindex` + rate limit + sin listado ni búsqueda.
- **R5** Consulta entre clubes: permiso explícito, temporal, revocable, auditado y
  visible para la familia. **Sin export**.
- **R6** 🔴 La página pública NO se activa en producción sin revisión legal (menores,
  COPPA-adyacente en USA). Feature flag apagado por defecto; todo lo demás del módulo
  funciona sin ella.
- **R7** Borrado/desactivación de la cuenta → revoca enlaces y permisos en cascada.
- **R8** `left_reason` NUNCA aparece en la página pública ni en la consulta entre
  clubes. Es interno del historial de la familia.

## 7. UX (4 superficies)

1. **Ficha del jugador (club)**: pestaña «Trayectoria» — stints + logros con badge.
   El club añade logros verificados desde aquí. Guardián: staff, nunca padres ajenos.
2. **«Mis hijos» / perfil propio (familia)**: la hoja completa, gestionar logros
   declarados, crear/revocar el enlace público, ver quién consultó qué.
3. **Consulta entre clubes (club receptor)**: solo lectura, con la marca de quién
   verificó cada cosa. Sin export, sin copiar.
4. **Página pública `/p/{token}`**: sin sesión. Nombre, foto (si activada), deporte,
   trayectoria (clubes + fechas), logros con su badge, stats seleccionadas. Nada más.

i18n en/es/pt-BR desde el día uno, default inglés. Terminología por decidir en D1.

### 7.1 Matriz rol → qué ve y qué puede hacer

La regla que ordena todo: **el club gestiona lo deportivo; la familia gestiona la
exposición.** Ningún rol de club puede publicar ni compartir la hoja de nadie.

| Rol | Trayectoria y logros | Añadir logros | Enlace público | Permisos a otros clubes |
|---|---|---|---|---|
| **Dueño / Admin** | Ve la hoja completa de sus jugadores (también stints de otros clubes) | Verificados, **solo de su periodo** | ❌ jamás | ❌ (puede SOLICITAR el permiso a la familia, no dárselo) |
| **Entrenador** | Solo sus jugadores (`TrainerScope`, fuente única) | ✅ Verificados, solo su alcance y solo con el jugador ACTIVO (decidido 12-ago) | ❌ | ❌ |
| **Contador** | ❌ no ve la pestaña — es dato deportivo, no financiero | ❌ | ❌ | ❌ |
| **Padre / Acudiente** | Hoja completa de SUS hijos vinculados | Declarados | ✅ crea/revoca | ✅ concede/revoca, ve la auditoría |
| **Jugador ≥ 18** | Su propia hoja | Declarados | ✅ | ✅ |
| **Jugador menor con cuenta** | Su propia hoja, lectura + declarados | Declarados | 🔴 **NO** — solo el acudiente | 🔴 **NO** — solo el acudiente |
| **Club consultante** | Solo con permiso vigente, solo las secciones concedidas, lectura, auditado | ❌ | ❌ | — |
| **Super Admin** | Todo (soporte) | ❌ | ❌ | ❌ |
| **Anónimo** | Solo la página pública por su token | — | — | — |

**Matriz APROBADA por Miguel el 12-ago**, con dos reglas añadidas suyas:
el entrenador alimenta el historial (es quien conoce los méritos) dentro de su
alcance y solo mientras el jugador está en el club; y **al cerrarse un stint el
historial de ese periodo se CONGELA** — ningún club reescribe el pasado
(correcciones excepcionales: solo soporte). El contador queda fuera, confirmado.

Decisiones que esta matriz fija:

- **El menor con cuenta no publica ni comparte.** Ve su hoja y añade logros declarados,
  pero el enlace público y los permisos a clubes son del acudiente. La mayoría de edad
  se evalúa contra la fecha de nacimiento **al momento de la acción**, no al crear la
  cuenta: el día que cumple 18, esos botones aparecen solos.
- **El contador queda fuera.** Mismo criterio que el guardián financiero al revés: cada
  rol ve lo suyo.
- **El entrenador ve por su alcance** (`TrainerScope`), igual que en asistencia — no se
  inventa un mecanismo nuevo.
- Guards del frontend: pestaña del club → `AdminRouteGuard` + visible para trainer;
  vistas de familia → `PlayerOrParentGuard`; página pública → sin guard, por token.
- La cuenta del jugador menor y la del acudiente ven **la misma hoja**: una sola fuente,
  dos niveles de mando.

## 8. Qué alimenta la hoja automáticamente (Fase 2.3)

Ya existe y solo hay que componerlo: `PlaTournamentPlayerStat` (stats por torneo),
rankings (recién conectados), % de asistencia (`AttendanceService`). Regla: lo
calculado por el sistema entra como **verificado, fuente sistema**, no editable.

## 9. Anti-huérfanos — criterios de aceptación NO negociables

El patrón que mató 11 piezas en agosto no puede repetirse aquí. Cada fase termina solo
cuando:

1. **El camino real funciona**: tests por la URL real con el rol real (y la pública
   por su token, sin sesión). Cero tests que monten el componente suelto como única
   evidencia.
2. **Alcanzable**: test de alcanzabilidad de cada pantalla nueva (ruta + menú/pestaña
   real), como `tryoutsReachability.test.mjs`.
3. **`app:orphan-check --check` en verde** al cerrar cada fase.
4. **Autorización explícita en cada endpoint desde el primer commit** — Tryouts se
   construyó sin permisos y quedó abierto; aquí los datos son de menores y
   cross-club, no hay margen.
5. Cuidado con las trampas conocidas: `Route::bind` entrega MODELO (tipar
   `PlaClubTeam $pla_club_team`); tests con ids de catálogo reales (el autoincremento
   no se revierte); fechas con `SimpleDatePicker`, jamás `<Input type="date">`.

## 10. Decisiones de Miguel ANTES de implementar

| # | Decisión | Recomendación |
|---|---|---|
| **D1** | Nombre visible | ✅ DECIDIDO 12-ago (Miguel): la pestaña se llama **«Historial»** (EN «History», PT «Histórico») y contiene TODO — pasos, logros, torneos. «Hoja de vida deportiva» para el conjunto exportable |
| **D2** | ¿Módulo por plan (`enabled_modules`) o para todos? | Trayectoria y logros para TODOS (retención); consulta entre clubes y página pública como diferenciador de plan alto |
| **D3** | ¿Qué stats entran en la página pública? | Solo torneos y logros verificados; la asistencia es interna (un 38% público perjudica al chico) |
| **D4** | Caducidad máxima de enlaces y permisos | Enlace público 90 días; permiso entre clubes 30 días. Renovables con un clic |
| **D5** | ¿`left_reason` se pide siempre al desactivar, o es opcional? | Opcional con catálogo neutro. Obligarlo genera datos basura |
| **D6** | Revisión legal de la página pública: ¿quién y cuándo? | Antes de Fase 4; Fases 1-3 no la necesitan y pueden salir ya |
| **D7** | IA: ¿tools de LECTURA sobre trayectoria/logros para el asistente? (escritura NO se propone) | Sí a lectura, solo datos del propio club — regla de la casa: se pregunta SIEMPRE |

## 11. Orden y esfuerzo

F1 (stints + backfill + pestaña) es pequeña y desbloquea todo. F2 revive trabajo ya
hecho. F3 es el valor USA real. F4 espera lo legal sin frenar al resto. Cada fase
aterriza valor usable por sí sola; ninguna deja piezas sin conectar.
