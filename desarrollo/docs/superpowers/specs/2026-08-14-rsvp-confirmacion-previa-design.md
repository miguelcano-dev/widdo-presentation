# RSVP — confirmación previa a entrenamientos y partidos

**Fecha:** 14 ago 2026 · **Estado:** diseño, nada implementado
**Origen:** dolor #1 del coach en el research USA (`adquisicion-usa/TAREAS-REPETITIVAS-RESEARCH.md`).
En tres hilos distintos de Reddit los entrenadores lo nombran solos como su peor tarea; un team
manager con 6 años: la parte de RSVP de su app *"is by far the most annoying"*. TeamSnap lo cobra
como feature de pago (está detrás del paywall). El feature más celebrado de PlayMetrics en el hilo
de recomendaciones es el botón de recordar **solo a quien no ha respondido**.

---

## 0. El punto que hay que entender antes de tocar nada

Son dos cosas distintas que suenan igual:

| | Mira | Quién actúa | Estado hoy |
|---|---|---|---|
| **Asistencia** | al PASADO | el entrenador pasa lista después | ✅ existe y funciona |
| **RSVP** | al FUTURO | la familia responde antes | ⚠️ a medias (ver abajo) |

La asistencia ya está resuelta: `PlaClubTeamSessionAttendance` y `PlaEventAttendance` con estados
`present` / `absent` / `late` / `excused`, y `AttendanceAlertService` avisa a la familia cuando el
jugador falta (con `excused` silenciado a propósito). **Esto no se toca.**

---

## 1. Lo que YA existe (verificado en código, 14 ago 2026)

**Los EVENTOS ya tienen RSVP de punta a punta.** No hay que inventarlo:

- `PlaEventParticipant` (tabla `pla_club_teams_event_participants`) ya tiene las columnas exactas:
  `status`, `confirmed_at`, `declined_at`, `decline_reason`, `notified_at`, `reminder_sent_at`
- Rutas vivas: `POST /api/events/{event}/confirm` y `POST /api/events/{event}/decline`
  (`routes/api.php:417-418` → `EventController::confirmParticipation` / `declineParticipation`)
- El frontend las llama: `frontend/src/components/calendar/EventsCalendar.jsx:468,496` y
  `components/widgets/UpcomingEventsWidget.jsx:181,208`
- `SendEventInvitations` ya filtra a los `status = 'pending'`
- `event_type` distingue `training` / `match` / `meeting` / `tournament` / `social`

**Lo que NO existe:**

1. **El botón de recordatorio a los pendientes.** `SendEventInvitations` tiene
   `whereNull('notified_at')` (`app/Jobs/SendEventInvitations.php:70`): correcto para no duplicar
   la invitación inicial, pero es justo lo que impide reenviar. Hoy no hay forma de decir
   "recuérdale solo a los 6 que no han contestado".
2. **RSVP en entrenamientos recurrentes.** `PlaClubTeamSession` (tabla `pla_club_teams_sessions`)
   con `is_recurring`, `recurrence_days`, `recurrence_start_date`… **no tiene participantes ni
   confirmación**. Solo asistencia posterior. Aquí no hay nada que reusar.
3. **El conteo para el entrenador**: "12 confirmados, 3 no vienen, 6 sin responder".

---

## 2. Alcance por fases

### Fase 1 — Recordatorio a pendientes en eventos (barata, alto impacto)

Toda la estructura existe. Es el 80% del valor con el 20% del trabajo.

- `POST /api/events/{event}/remind-pending` — encola aviso **solo** a `status = 'pending'`,
  ignorando `notified_at` pero respetando `reminder_sent_at` (esa columna existe y no se usa:
  sirve para el anti-spam).
  - Permiso: entrenador/admin del club, con `authorize()` explícito (regla del proyecto).
  - Anti-spam: máximo 1 recordatorio cada N horas por participante; si no hay pendientes,
    responder 200 con `reminded: 0`, no un error.
  - Idempotencia: doble tap no debe mandar dos veces (mismo patrón que
    `AttendanceAlertService`, que ya hashea una clave por destinatario+estado).
- Endpoint o campo de conteo: `{confirmed, declined, pending}` por evento.
- UI: en el detalle del evento, los tres números + botón "Recordar a los que faltan (6)".
  Deshabilitado cuando `pending = 0`.
- i18n EN/ES/PT obligatorio, **default inglés** (regla del proyecto).

### Fase 2 — RSVP en entrenamientos recurrentes (la pieza que falta de verdad)

**El problema de diseño:** una sesión recurrente NO tiene una fila por ocurrencia. Un martes
concreto no existe como registro; se calcula desde `recurrence_days`. Por eso el RSVP **no puede**
colgar de `session_id` a secas: hay que llevar la fecha, igual que ya hace
`PlaClubTeamSessionAttendance` con su columna `attendance_date`.

- Tabla nueva `pla_club_teams_session_rsvps`:
  `session_id`, `player_id`, `occurrence_date`, `status` (`pending`/`confirmed`/`declined`),
  `responded_by` (el acudiente que respondió), `responded_at`, `decline_reason`, `reminder_sent_at`
  - **Índice único `(session_id, player_id, occurrence_date)`** — sin él, dos toques crean dos filas
  - `club_id` + trait `ProtectedModel`/`HasClubIsolation`: sin `ClubScope` es fuga cross-tenant
- Las filas se crean **perezosamente**: no pre-generar RSVPs de todas las ocurrencias futuras de
  todas las sesiones (explota en filas). Se materializa al pedir la lista de una fecha o al
  responder. Un jugador sin fila = `pending` implícito.
- Respetar `PlaClubTeamSessionException`: si la ocurrencia está cancelada, no se pide RSVP.
- Endpoints simétricos a los de eventos: confirmar, declinar, recordar a pendientes, conteo.
- Quién responde: el **acudiente** (reusar `AttendanceGuardianResolver`, que ya resuelve quién es
  la familia de un jugador en un club) y el jugador adulto. Cuidado con la puerta adulto/menor
  que ya existe en móvil.

### Fase 3 — Cierre del círculo (opcional)
Precargar la planilla de asistencia con lo que la familia respondió: quien dijo "no viene" entra
como `absent` sugerido, y el entrenador solo corrige las excepciones. Convierte el RSVP en ahorro
de tiempo real, no en un dato más que mantener.

---

## 3. Decisiones abiertas (de Miguel, antes de implementar)

| # | Decisión | Recomendación |
|---|---|---|
| D1 | ¿Fase 1 sola primero, o 1+2 juntas? | Fase 1 sola: se entrega en días y ya se puede demostrar |
| D2 | ¿RSVP obligatorio u opcional por club? | Opcional, flag por club — un club rec no lo quiere |
| D3 | ¿Cuánta antelación pide el recordatorio automático? | Manual primero (botón). Automático = cron + otra decisión |
| D4 | ¿El "no viene" cuenta en la tasa de asistencia? | NO. Mismo criterio que `excused` (`statusCountsInRate`) |
| D5 | ¿Se muestra a las otras familias quién viene? | No por defecto: son menores |

---

## 4. Reglas del proyecto que aplican aquí

- **Módulo nuevo → preguntar a Miguel si se agregan tools de lectura/escritura al chat IA**
  (agente de voz NO). Aquí encaja natural: "¿quién falta por confirmar el sábado?"
- Endpoints nuevos con `authorize()` explícito; modelo con `club_id` sin `ClubScope` = fuga
- i18n EN/ES/PT, default inglés, nada de español hardcodeado
- TDD: la prueba primero. Verificar quitando el filtro y viendo caer los tests
- Push a `saas_sport/main` = **deploy a producción automático**

---

## 5. Qué NO prometer en demos mientras no exista

Hoy se puede decir: "el club registra asistencia y la familia recibe aviso automático si el
jugador falta". **No** decir "los padres confirman antes" ni "el coach ve quién viene el sábado"
para entrenamientos. Para eventos/partidos sí existe confirmación, pero **sin** botón de
recordatorio a los pendientes: no demostrar ese botón hasta la Fase 1.
