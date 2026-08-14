# Widdo Tournaments — Smart Scheduling Engine

> Fase 9. Asignación inteligente de horarios + canchas.
> Gap #1 vs Exposure Events (ellos tienen AI Scheduling Engine con 15 años de iteración).
> Índice general: ver `TOURNAMENTS-INDEX.md`
> Riesgo vs Clubes: 🟡 MEDIO — toca `routes/api.php` para nuevas rutas. No toca código de clubs.

---

# FASE 9: SMART SCHEDULING ENGINE

**Objetivo:** No solo generar brackets (quién vs quién), sino CUÁNDO y DÓNDE juega cada partido.
Exposure Events resuelve esto con AI. Widdo lo necesita para competir.

**Diferencia clave:**
```
Fase 3 (Brackets): Genera     quién vs quién  → Club A vs Club B
Fase 9 (Schedule): Asigna     cuándo + dónde  → Cancha 3, Sábado 10:00 AM
```

---

## Sub-fase 9.A — Venues y Canchas (DB)

| # | Tarea | Detalle |
|---|-------|---------|
| 9.A.1 | Migración `create_pla_tournament_venues` | tournament_id, name, address, city_id (FK → bas_cities), latitude (decimal 10,8), longitude (decimal 11,8), description, contact_phone, contact_email, parking_info, amenities (JSON: ['bathrooms','food','parking','wifi','medical']), status ENUM('active','inactive'), image_path |
| 9.A.2 | Migración `create_pla_tournament_courts` | venue_id (FK), name ("Cancha 1", "Court A"), sport_type (FK → bas_sports nullable), surface ENUM('grass','turf','hardwood','clay','concrete','indoor','sand','water','track','other'), dimensions (string nullable — "100x60m"), capacity_spectators (int nullable), has_lights (bool), has_scoreboard (bool), status ENUM('available','maintenance','reserved') |
| 9.A.3 | Migración `create_pla_tournament_schedule_slots` | court_id (FK), match_id (FK → pla_tournament_matches, nullable), slot_date (date), start_time (time), end_time (time), buffer_minutes (tinyint default 15), status ENUM('available','scheduled','blocked','maintenance'), blocked_reason (string nullable), created_by |
| 9.A.4 | Modelos | `PlaTournamentVenue`, `PlaTournamentCourt`, `PlaTournamentScheduleSlot` con relaciones |

**Relación con matches existentes (Fase 3):**
```
pla_tournament_matches (ya existe en Fase 3)
├── venue (string nullable)        ← campo actual: texto libre
├── scheduled_at (datetime nullable) ← campo actual: solo timestamp
│
│  AGREGAR en Fase 9:
├── court_id (FK → pla_tournament_courts, nullable)  ← cancha específica
├── schedule_slot_id (FK → pla_tournament_schedule_slots, nullable) ← slot asignado
```

## Sub-fase 9.B — Constraints (Restricciones)

| # | Tarea | Detalle |
|---|-------|---------|
| 9.B.1 | Migración `create_pla_tournament_schedule_constraints` | tournament_id, constraint_type ENUM (ver abajo), value (JSON), priority ENUM('hard','soft'), description |
| 9.B.2 | Constraint types | Ver tabla de restricciones abajo |

**Tipos de restricciones:**

| constraint_type | value (JSON) | Descripción |
|----------------|-------------|-------------|
| `min_rest_between_games` | `{"minutes": 90}` | Descanso mínimo entre partidos del mismo equipo |
| `max_games_per_day` | `{"count": 3}` | Máximo de partidos por equipo por día |
| `no_back_to_back` | `{"enabled": true}` | Prohibir partidos consecutivos sin descanso |
| `blackout_times` | `{"slots": [{"date":"2026-05-10","start":"12:00","end":"14:00","reason":"Almuerzo"}]}` | Horarios bloqueados |
| `team_venue_preference` | `{"registration_id": 45, "venue_id": 2}` | Equipo prefiere venue específico |
| `avoid_early_late` | `{"no_before": "08:00", "no_after": "20:00"}` | Rango horario permitido |
| `championship_primetime` | `{"finals_after": "16:00"}` | Finales en horario prime |
| `referee_availability` | `{"referee_id": 12, "available": [{"date":"2026-05-10","start":"08:00","end":"18:00"}]}` | Disponibilidad de árbitros |
| `travel_time_between_venues` | `{"venue_a": 1, "venue_b": 2, "minutes": 30}` | Tiempo de traslado entre venues |
| `balanced_am_pm` | `{"enabled": true}` | Distribución equitativa de horarios AM/PM |
| `stay_to_play` | `{"min_games_per_day": 2}` | Equipos viajeros juegan mínimo N partidos por día |

## Sub-fase 9.C — Scheduling Service

| # | Tarea | Detalle |
|---|-------|---------|
| 9.C.1 | `SchedulingService` | Motor principal de asignación de horarios |
| 9.C.2 | `generateSchedule(tournament, category, constraints)` | Algoritmo de asignación |
| 9.C.3 | `validateSchedule(schedule)` | Verificar que NO viola restricciones hard |
| 9.C.4 | `optimizeSchedule(schedule)` | Mejorar schedule minimizando violaciones soft |
| 9.C.5 | `rescheduleMatch(match, newSlot)` | Mover un partido. Recalcular cascada |
| 9.C.6 | `fillOpenSlots(tournament)` | Asignar partidos sin slot a slots disponibles |

**Algoritmo de scheduling:**
```
INPUT:
  - matches[] (generados por BracketGeneratorService en Fase 3)
  - courts[] (configurados por organizador)
  - constraints[] (restricciones configuradas)
  - available_dates[] (días del torneo)

ALGORITMO:
  1. Generar todos los time slots disponibles por court
     → Cada court tiene: fecha, hora inicio, hora fin, duración partido + buffer

  2. Priorizar matches:
     → Finals/semifinals last day
     → Group stage first days
     → Round-robin distributed evenly

  3. Para cada match (en orden de prioridad):
     a. Filtrar slots válidos:
        - Court disponible
        - Ningún equipo tiene otro match en conflicto
        - Respeta min_rest_between_games
        - Respeta max_games_per_day
        - No está en blackout_times
        - Respeta no_back_to_back
     b. Rankear slots por soft constraints:
        - Balanced AM/PM
        - Team venue preference
        - Championship primetime
        - Travel time minimization
     c. Asignar mejor slot

  4. Verificar schedule completo:
     - Todos los matches tienen slot
     - No hay conflictos
     - Score de calidad (0-100)

  5. Si hay matches sin slot:
     - Intentar swap optimization
     - Reportar conflictos al organizador

OUTPUT:
  - schedule[] con match_id → slot_id asignaciones
  - quality_score (0-100)
  - warnings[] (soft constraint violations)
  - errors[] (matches sin asignar)
```

## Sub-fase 9.D — Controller

| # | Tarea | Detalle |
|---|-------|---------|
| 9.D.1 | `TournamentVenueController` | CRUD venues y courts |
| 9.D.2 | `TournamentScheduleController` | Generate, view, edit schedule |

**Endpoints:**
```
# Venues
POST   /api/tournaments/{id}/venues                        — Crear venue
GET    /api/tournaments/{id}/venues                        — Listar venues
PUT    /api/tournaments/{id}/venues/{vId}                  — Editar venue
POST   /api/tournaments/{id}/venues/{vId}/courts            — Crear court
GET    /api/tournaments/{id}/venues/{vId}/courts            — Listar courts

# Schedule
POST   /api/tournaments/{id}/categories/{catId}/schedule/generate  — Generar schedule
GET    /api/tournaments/{id}/schedule                              — Schedule completo
GET    /api/tournaments/{id}/schedule/by-court                     — Vista por cancha
GET    /api/tournaments/{id}/schedule/by-team/{regId}              — Vista por equipo
PATCH  /api/tournaments/{id}/schedule/move-match                    — Mover partido
POST   /api/tournaments/{id}/schedule/validate                      — Validar schedule
GET    /api/tournaments/{id}/schedule/quality                       — Score de calidad

# Constraints
POST   /api/tournaments/{id}/constraints                   — Agregar restricción
GET    /api/tournaments/{id}/constraints                   — Listar restricciones
DELETE /api/tournaments/{id}/constraints/{cId}              — Eliminar restricción

# Slots
GET    /api/tournaments/{id}/courts/{cId}/slots             — Slots de una cancha
PATCH  /api/tournaments/{id}/slots/{sId}/block              — Bloquear slot
PATCH  /api/tournaments/{id}/slots/{sId}/unblock            — Desbloquear slot
```

## Sub-fase 9.E — Frontend

| # | Tarea | Detalle |
|---|-------|---------|
| 9.E.1 | Tab "Sedes" en wizard/detalle del torneo | Agregar venues, courts, mapa con pins |
| 9.E.2 | Vista de schedule por cancha (Grid) | Eje X: horas, Eje Y: canchas. Cada celda = partido. Drag & drop para mover |
| 9.E.3 | Vista de schedule por equipo | Timeline de partidos de un equipo con gaps entre ellos |
| 9.E.4 | Constraints UI | Formulario para agregar restricciones. Sliders para tiempos |
| 9.E.5 | Quality score indicator | Barra de calidad: "Schedule Quality: 87/100. 2 warnings" |
| 9.E.6 | Conflict resolution | Si schedule tiene conflictos: mostrar cuáles, sugerir swaps |

**Total Fase 9: 15 tareas | ~3-5 días**
