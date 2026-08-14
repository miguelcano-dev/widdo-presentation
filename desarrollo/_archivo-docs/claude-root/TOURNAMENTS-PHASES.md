# Widdo Tournaments — Fases de Implementacion (Core)

> Fases 0, 2, 3, 4, 6, 8. Para las demas:
> - Fase 1 (Multi-Deporte): ver `TOURNAMENTS-SPORTS.md`
> - Fase 5 (Resultados en Vivo): ver `TOURNAMENTS-LIVE.md`
> - Fase 7 (Estadisticas): ver `TOURNAMENTS-STATS.md`
> - Indice general: ver `TOURNAMENTS-INDEX.md`

---

# FASE 0: ROL ORGANIZADOR (Multi-Rol)

**Objetivo:** Un usuario puede ser owner de club Y organizador de torneos. Contexto nuevo en el switcher.

### ⚠️ PRECAUCIONES — FASE MÁS DELICADA (toca el corazón del multi-tenancy)

> **Esta fase toca 5 archivos compartidos con Clubes.** Si algo se rompe aquí, TODO el sistema falla.
> Ejecutar tests de regresión COMPLETOS al terminar CADA sub-fase.

**Reglas de implementación:**

1. **Context Switcher** — NO hacer `club_id` simplemente nullable en el código existente.
   Agregar campo `context_type ENUM('club','tournament')` a la respuesta de contextos.
   Todo código downstream hace branch: `if (context_type === 'club') { ...lógica actual... } else { ...lógica organizer... }`
   El flujo de club NUNCA se toca, solo se agrega un branch nuevo.

2. **ProtectedModel trait** — NO quitar el filtro por `club_id`.
   Agregar lógica condicional: si `context_type=tournament`, usar `organizer_id` en vez de `club_id`.
   Los modelos de club siguen usando `club_id` como siempre.

3. **UserClubRole** — NO modificar las constantes ni permisos de roles existentes.
   Solo AGREGAR `ROLE_ORGANIZER` y sus permisos. Los 5 roles anteriores quedan idénticos.

4. **Frontend hooks** — NO modificar `useTournaments(clubId)` existente.
   Crear `useOrganizerTournaments(organizerId)` NUEVO con query keys distintas.

5. **Guards** — NO modificar `AdminRouteGuard` ni ningún guard existente.
   Crear `OrganizerGuard` NUEVO.

6. **Tests obligatorios al terminar Fase 0:**
   - Login como owner → ve dashboard club ✓
   - Login como trainer → ve su dashboard ✓
   - Login como player/parent → ve su dashboard ✓
   - Cambio de contexto club→club funciona ✓
   - Cambio de contexto club→organizer funciona ✓
   - Cambio de contexto organizer→club funciona ✓
   - Owner de Club A NO ve datos de Club B ✓
   - Pagos de suscripción siguen funcionando ✓
   - AI chat de club funciona ✓

## Sub-fase 0.A — Modelo y Base de Datos

| # | Tarea | Detalle |
|---|-------|---------|
| 0.A.1 | Migracion `create_pla_organizers_table` | user_id (FK), organization_name, logo_path, description, website, phone, email_contact, city_id (FK), social_media (JSON), verified (bool), status (active/suspended), timestamps, soft_deletes |
| 0.A.2 | Modelo `PlaOrganizer` | Relaciones: belongsTo User, belongsTo BasCity, hasMany PlaTournament. Scopes: active(), verified() |
| 0.A.3 | Migracion `alter_pla_tournaments_add_organizer` | Agregar `organizer_id` (FK nullable) a `pla_club_teams_tournaments`. Hacer `club_id` nullable (torneos del organizador NO pertenecen a un club) |
| 0.A.4 | Seed de rol `tournament_organizer` en `bas_roles` | Nombre: "Organizador de Torneos", descripcion, status ACT |

**Archivos a crear/modificar:**
- `database/migrations/xxxx_create_pla_organizers_table.php` (NUEVO)
- `database/migrations/xxxx_add_organizer_to_tournaments.php` (NUEVO)
- `app/Models/PlaOrganizer.php` (NUEVO)
- `app/Models/PlaTournament.php` (MODIFICAR — agregar relacion organizer)
- `database/seeders/RolesSeeder.php` (MODIFICAR)

## Sub-fase 0.B — Backend Auth y Contextos

| # | Tarea | Detalle |
|---|-------|---------|
| 0.B.1 | Adaptar tabla `user_club_roles` o crear `user_organizer_roles` | Opcion A: Agregar role='organizer' en user_club_roles con club_id=NULL. Opcion B: Tabla nueva `user_organizer_roles` (user_id, organizer_id, role, status). **Recomendado: Opcion A** — reusar la tabla existente haciendo club_id nullable para organizers |
| 0.B.2 | Adaptar `AuthController@login` | Al cargar contextos, incluir contextos de organizer (role='organizer', club_id=null, organizer_id=X) |
| 0.B.3 | Adaptar `ContextController` | `GET /api/contexts` debe retornar contextos de organizer. `POST /api/contexts/switch` debe manejar contexto organizer |
| 0.B.4 | Endpoint de activacion | `POST /api/organizer/activate` — usuario existente activa perfil de organizador (crea PlaOrganizer + user_club_role con role='organizer') |
| 0.B.5 | Adaptar `AuthController@register` | Opcion nueva "Quiero organizar torneos" → crea user + PlaOrganizer + contexto organizer |

**Archivos a modificar:**
- `app/Http/Controllers/AuthController.php`
- `app/Http/Controllers/ContextController.php` (o similar)
- Migracion para hacer club_id nullable en user_club_roles

## Sub-fase 0.C — Controller y Rutas del Organizador

| # | Tarea | Detalle |
|---|-------|---------|
| 0.C.1 | `OrganizerController` | CRUD de perfil: show, update, uploadLogo. Dashboard stats (mis torneos, inscripciones pendientes, pagos) |
| 0.C.2 | Middleware `OrganizerMiddleware` | Verifica que el usuario tiene contexto activo de organizer. Inyecta organizer_id en request |
| 0.C.3 | Policy `OrganizerPolicy` | Solo el usuario dueno del organizer puede editarlo |
| 0.C.4 | Rutas protegidas | Grupo `/api/organizer/*` con middleware organizer |

**Archivos a crear:**
- `app/Http/Controllers/OrganizerController.php` (NUEVO)
- `app/Http/Middleware/OrganizerMiddleware.php` (NUEVO)
- `app/Policies/OrganizerPolicy.php` (NUEVO)
- `routes/api.php` (MODIFICAR — agregar grupo organizer)

## Sub-fase 0.D — Frontend Contexto y Navegacion

| # | Tarea | Detalle |
|---|-------|---------|
| 0.D.1 | Adaptar `UserContextProvider` | Manejar contextos con role='organizer'. Agregar icono y label "Organizador de Torneos" |
| 0.D.2 | Adaptar `ContextSwitcher` | Mostrar contexto organizer en el dropdown. Si no tiene perfil organizer, mostrar "Activar Organizador de Torneos" como opcion |
| 0.D.3 | Mini-onboarding de organizador | Al activar por primera vez: nombre de organizacion, logo, contacto (3 pasos rapidos) |
| 0.D.4 | Adaptar `MenuList` | Nuevo `menuConfigByRole.organizer` con secciones: Dashboard, Mis Torneos, Crear Torneo, Inscripciones, Pagos |
| 0.D.5 | Guard `OrganizerGuard` | Protege rutas de organizador |
| 0.D.6 | Dashboard del organizador | Pagina nueva: resumen de torneos activos, inscripciones pendientes, pagos recibidos, proximos partidos |

**Archivos a crear/modificar:**
- `frontend/src/context/UserContextProvider.jsx` (MODIFICAR)
- `frontend/src/components/header/ContextSwitcher.jsx` (MODIFICAR)
- `frontend/src/layouts/MenuList.jsx` (MODIFICAR)
- `frontend/src/pages/dashboard/Organizer/OrganizerDashboard.jsx` (NUEVO)
- `frontend/src/pages/dashboard/Organizer/OrganizerOnboarding.jsx` (NUEVO)
- `frontend/src/components/guards/OrganizerGuard.jsx` (NUEVO)
- Router (MODIFICAR — agregar rutas /home/organizer/*)

## Sub-fase 0.E — Registro Directo como Organizador

| # | Tarea | Detalle |
|---|-------|---------|
| 0.E.1 | Adaptar flujo de registro frontend | Paso 0 nuevo: "Que quieres hacer?" → "Gestionar mi club" / "Organizar torneos" / "Ambos" |
| 0.E.2 | Adaptar registro backend | Si tipo='organizer': crear user + PlaOrganizer + contexto. No crear club |
| 0.E.3 | Onboarding especifico de organizador | Nombre organizacion, logo, deportes preferidos, ubicacion |

**Total Fase 0: 20 tareas | ~3-4 dias**

---

# FASE 2: INSCRIPCION CROSS-CLUB

**Objetivo:** El organizador invita clubes. Los clubes gestionan su propia inscripcion. Clubes externos se registran en Widdo.

### ⚠️ PRECAUCIONES — Registro externo toca AuthController

> Sub-fases 2.E (club externo) y 2.F (notificaciones) tocan `AuthController.php`.

**Reglas:**
1. **AuthController** — NO modificar el flujo de registro existente (`type=club`, `type=player`).
   Agregar un NUEVO case `type=external_club` que crea user + club gratis + inscripción.
   Los flujos existentes quedan idénticos. Solo se agrega un nuevo path.

2. **Rutas públicas** — `/api/public/tournaments/*` son NUEVAS rutas sin auth.
   NO afectan rutas privadas existentes. Verificar que no haya colisión de nombres.

3. **ProtectedModel** — Los modelos `PlaTournamentInvitation` y `PlaTournamentRegistration`
   usan `tournament_id` como scope principal, NO `club_id`. Son modelos NUEVOS.

## Sub-fase 2.A — Modelo de Invitaciones

| # | Tarea | Detalle |
|---|-------|---------|
| 2.A.1 | Migracion `create_pla_tournament_invitations` | tournament_id, club_id (nullable), invited_email, invited_club_name, token (unique), status ENUM('pending','accepted','declined','expired'), sent_at, accepted_at, declined_at, sent_by, message, expires_at |
| 2.A.2 | Modelo `PlaTournamentInvitation` | Relaciones, scopes (pending, expired), metodo generateToken() |
| 2.A.3 | `TournamentInvitationController` | Endpoints del organizador: enviar, enviar masivo, listar, cancelar, reenviar |

**Endpoints:**
```
POST   /api/tournaments/{id}/invitations              — Enviar invitacion
POST   /api/tournaments/{id}/invitations/bulk          — Enviar masivo
GET    /api/tournaments/{id}/invitations               — Listar invitaciones
DELETE /api/tournaments/{id}/invitations/{invId}        — Cancelar
POST   /api/tournaments/{id}/invitations/{invId}/resend — Reenviar
```

## Sub-fase 2.B — Modelo de Inscripciones (Registration)

| # | Tarea | Detalle |
|---|-------|---------|
| 2.B.1 | Migracion `create_pla_tournament_registrations` | tournament_id, tournament_category_id, club_id, invitation_id (nullable), team_name, status ENUM('pending','approved','rejected','withdrawn','waitlisted'), registration_fee_paid (bool), payment_reference, registered_by, approved_by, approved_at, notes, waitlist_position (nullable) |
| 2.B.2 | Modelo `PlaTournamentRegistration` | Relaciones: belongsTo Tournament/Category/Club/Invitation. hasMany TournamentPlayers (jugadores asignados por el club) |
| 2.B.3 | Adaptar `PlaTournamentPlayer` | Agregar `tournament_registration_id` (FK) — vinculo con la inscripcion del club |

## Sub-fase 2.C — Controller del Organizador (Gestion de Inscripciones)

| # | Tarea | Detalle |
|---|-------|---------|
| 2.C.1 | `TournamentRegistrationController` (vista organizador) | Listar inscripciones, aprobar/rechazar, ver plantilla del club, gestionar waitlist |

**Endpoints del organizador:**
```
GET    /api/tournaments/{id}/registrations                    — Todas las inscripciones
PATCH  /api/tournaments/{id}/registrations/{regId}/status     — Aprobar/rechazar
GET    /api/tournaments/{id}/registrations/{regId}/players    — Ver plantilla del club
POST   /api/tournaments/{id}/registrations/{regId}/mark-paid  — Marcar pago manual
```

## Sub-fase 2.D — Controller del Club (Inscribirse al Torneo)

| # | Tarea | Detalle |
|---|-------|---------|
| 2.D.1 | Endpoints de inscripcion del club | Info publica del torneo, inscribir mi club, asignar MIS jugadores, quitar jugador, ver elegibles, retirar inscripcion |

**Endpoints del club:**
```
GET    /api/tournaments/{id}/registration-info                         — Info publica
POST   /api/tournaments/{id}/register                                  — Inscribir mi club
POST   /api/tournaments/{id}/registrations/{regId}/players             — Asignar mis jugadores
DELETE /api/tournaments/{id}/registrations/{regId}/players/{playerId}  — Quitar jugador
GET    /api/tournaments/{id}/registrations/{regId}/eligible-players    — Mis jugadores elegibles
DELETE /api/tournaments/{id}/registrations/{regId}                     — Retirar inscripcion
```

**Logica de elegibilidad:**
```
Para cada jugador del club:
  ✓ Esta activo en el club
  ✓ Su edad cae dentro del rango de la categoria (o es younger/older permitido)
  ✓ Su genero coincide con la categoria
  ✓ No esta inscrito en otra categoria del mismo torneo (o si, si el torneo lo permite)
  ✓ Tiene documentos requeridos del torneo completos (o se suben despues)
```

## Sub-fase 2.E — Flujo de Club Externo (URL Publica)

| # | Tarea | Detalle |
|---|-------|---------|
| 2.E.1 | Endpoint publico `GET /api/public/tournaments/{token}` | Ver torneo por token de invitacion (sin auth) |
| 2.E.2 | Flujo de registro simplificado | Club externo llega por URL → ve info del torneo → "Inscribir mi equipo" → Si no tiene cuenta: registro rapido → crea user + club (plan gratis) → onboarding minimo → agrega jugadores → se inscribe |
| 2.E.3 | URL publica general `/inscribirse/{slug}` | Cualquiera ve el torneo y puede inscribirse (con o sin invitacion) |

## Sub-fase 2.F — Notificaciones

| # | Tarea | Detalle |
|---|-------|---------|
| 2.F.1 | Email al club: invitacion recibida | Asunto: "Te invitaron al torneo X". Incluye link de aceptacion |
| 2.F.2 | Email al organizador: club acepto/rechazo | "Club Y acepto la invitacion al torneo X" |
| 2.F.3 | Email al organizador: inscripcion nueva (URL publica) | "Club Z se inscribio via link publico" |
| 2.F.4 | Email al club: inscripcion aprobada/rechazada | "Tu inscripcion al torneo X fue aprobada" |
| 2.F.5 | Email recordatorio: documentos pendientes | "Faltan documentos de 3 jugadores para completar tu inscripcion" |
| 2.F.6 | Email recordatorio: pago pendiente | "Tu pago de inscripcion esta pendiente" |

## Sub-fase 2.G — Frontend Vista Organizador

| # | Tarea | Detalle |
|---|-------|---------|
| 2.G.1 | Tab "Invitaciones" en detalle del torneo | Buscar clubes Widdo, invitar por email, estado de invitaciones, reenviar, copiar link |
| 2.G.2 | Tab "Inscripciones" en detalle del torneo | Lista de clubes inscritos por categoria, estado, ver plantilla, aprobar/rechazar, compartir link publico |
| 2.G.3 | Resumen visual de inscripciones | Barra de progreso por categoria: "Sub-15 Masc: 18/24 equipos (6 disponibles)" |

## Sub-fase 2.H — Frontend Vista Club

| # | Tarea | Detalle |
|---|-------|---------|
| 2.H.1 | Seccion "Invitaciones a Torneos" en dashboard del club | Lista de invitaciones pendientes con info del torneo |
| 2.H.2 | Flujo de inscripcion del club | Seleccionar categoria → filtrar y seleccionar jugadores elegibles → confirmar → ir a pago (si aplica) |
| 2.H.3 | Seccion "Mis Torneos" en dashboard del club | Torneos donde el club esta inscrito con estado |
| 2.H.4 | Pagina publica de inscripcion `/inscribirse/{slug}` | Info del torneo, categorias, si logueado → inscripcion rapida, si no → registro |

**Total Fase 2: 25 tareas | ~5-7 dias**

---

# FASE 3: FORMATOS DE COMPETENCIA (Motor de Brackets)

**Objetivo:** Motor completo de brackets, grupos, liga. El corazon del sistema de torneos.

### ⚠️ PRECAUCIONES — Sub-fase 3.E (Agente IA) es ALTO RIESGO

> El refactor del AI Assistant es el cambio más peligroso de TODAS las fases de torneos.
> Si se hace mal, el chat de clubes deja de funcionar.

**Patrón obligatorio: CREAR EN PARALELO, NO REFACTOREAR**

```
PASO 1: Escribir tests para los 25 club tools ANTES de tocar nada
PASO 2: Crear interface AgentToolExecutor (NUEVO archivo)
PASO 3: Crear TournamentAgentToolExecutor (NUEVO archivo)
PASO 4: Crear AgentService (NUEVO archivo) que acepta cualquier executor
PASO 5: Probar AgentService + ClubAssistantToolExecutor → DEBE pasar los 25 tests
PASO 6: Probar AgentService + TournamentAgentToolExecutor → tools de torneo
PASO 7: SOLO ENTONCES migrar ClubAssistantService a usar AgentService internamente
PASO 8: Tests de regresión completos del chat de club
```

**Archivos que NO se tocan hasta el Paso 7:**
- `ClubAssistantService.php` — se deja intacto
- `ClubAssistantToolExecutor.php` — se deja intacto

**Archivos NUEVOS (seguros):**
- `app/Contracts/AgentToolExecutor.php` (interface)
- `app/Services/AgentService.php` (nuevo servicio)
- `app/Services/TournamentAgentToolExecutor.php` (executor de torneos)
- `app/Http/Controllers/TournamentAgentController.php` (endpoints)

**Tests obligatorios al terminar Sub-fase 3.E:**
- Chat de club: las 25 read tools devuelven datos correctos ✓
- Chat de club: las 15 write tools ejecutan correctamente ✓
- Chat de torneo: tools de torneo funcionan ✓
- Cambio de contexto club→torneo: chat cambia de contexto ✓
- Historial de conversaciones: filtra por context_type ✓

## Sub-fase 3.A — Tablas de Competencia (DB)

| # | Tarea | Detalle |
|---|-------|---------|
| 3.A.1 | Migracion `create_pla_tournament_rounds` | tournament_id, tournament_category_id, round_number, round_name, round_type ENUM('group_stage','elimination','final','third_place','consolation','round_robin','repechage'), status ENUM('pending','in_progress','completed'), start_date, end_date |
| 3.A.2 | Migracion `create_pla_tournament_groups` | tournament_id, tournament_category_id, name ("Grupo A"), teams_qualify (cuantos avanzan) |
| 3.A.3 | Migracion `create_pla_tournament_group_teams` | group_id, registration_id (FK), seed_number (nullable — para seeding) |
| 3.A.4 | Migracion `create_pla_tournament_matches` | tournament_id, round_id, group_id (nullable), match_number, home_registration_id/away_registration_id (nullable para BYE), home_player_id/away_player_id (individuales), home_score/away_score, home_sets/away_sets (JSON), home_penalty_score/away_penalty_score, winner_registration_id/winner_player_id, status ENUM('scheduled','in_progress','completed','postponed','cancelled','walkover','suspended'), venue, scheduled_at, started_at, ended_at, referee, notes, next_match_id, next_match_position ENUM('home','away'), scoring_config_id (FK nullable) |
| 3.A.5 | Migracion `create_pla_tournament_standings` | tournament_id, tournament_category_id, group_id (nullable), registration_id/player_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, sets_won, sets_lost, points_for, points_against, points, position, bonus_points |
| 3.A.6 | Modelos para las 5 tablas | Con relaciones, scopes, accessors |

## Sub-fase 3.B — Servicio de Generacion de Brackets

| # | Tarea | Detalle |
|---|-------|---------|
| 3.B.1 | `BracketGeneratorService` | Clase con metodos estaticos o inyectable |
| 3.B.2 | `generateSingleElimination(category, registrations, seeded?)` | Genera bracket de eliminacion directa. Maneja BYEs si no es potencia de 2. Seeding opcional (mejores vs peores) |
| 3.B.3 | `generateDoubleElimination(category, registrations)` | Winners bracket + losers bracket + gran final |
| 3.B.4 | `generateGroupStage(category, registrations, groupCount, teamsQualify)` | Sorteo aleatorio o con seeding (cabezas de serie en grupos diferentes). Genera fixture round-robin dentro de cada grupo |
| 3.B.5 | `generateRoundRobin(category, registrations)` | Todos contra todos (ida o ida+vuelta). Algoritmo de Berger para fixture balanceado |
| 3.B.6 | `generateSwiss(category, registrations, rounds)` | Sistema suizo: emparejar por puntos similares cada ronda |
| 3.B.7 | `advanceWinner(match)` | Al finalizar un match en eliminacion, mover ganador al next_match. Si es final, marcar campeon |
| 3.B.8 | `calculateStandings(category, groupId?)` | Recalcular tabla de posiciones completa aplicando reglas de puntuacion del torneo |
| 3.B.9 | `advanceFromGroups(category)` | Clasificar equipos de fase de grupos a fase de eliminacion. Crear matches de la siguiente ronda |
| 3.B.10 | Manejo de BYEs | Si hay 24 equipos en eliminacion directa → 8 BYEs (32 - 24). Ronda 1: 16 partidos, 8 con BYE (clasificacion directa). Ronda 2: 16 equipos |

**Algoritmo de sorteo para fase de grupos:**
```
Entrada: 24 equipos, 6 grupos de 4
1. Si hay seeding: separar en potes (Pot 1 = cabezas de serie, Pot 2 = siguientes, etc.)
2. Distribuir uno de cada pote por grupo
3. Si NO hay seeding: sorteo aleatorio
4. Generar fixture dentro de cada grupo (round-robin)
   Grupo de 4 = 6 partidos (3 jornadas)
   Grupo de 5 = 10 partidos (5 jornadas)
```

## Sub-fase 3.C — Servicio de Scoring

| # | Tarea | Detalle |
|---|-------|---------|
| 3.C.1 | `MatchScoringService` | Reglas de puntuacion configurables |
| 3.C.2 | Actualizar marcador | Recibir score, validar, guardar, recalcular standings si es fase de grupos |
| 3.C.3 | Criterios de desempate | Configurable: diferencia de gol → goles a favor → enfrentamiento directo → fair play → sorteo |
| 3.C.4 | Walkover | Marcar W.O. con score configurable (3-0 futbol, 20-0 basquet) |
| 3.C.5 | Soporte para sets | Tenis/volley: guardar sets individuales, calcular ganador por sets ganados |
| 3.C.6 | Soporte para penales/overtime | Futbol: guardar resultado regular + penales. Basquet: overtime(s) |

## Sub-fase 3.D — Controller de Brackets

| # | Tarea | Detalle |
|---|-------|---------|
| 3.D.1 | `TournamentBracketController` | Todos los endpoints de generacion, consulta y actualizacion |

**Endpoints:**
```
# Generacion
POST   /api/tournaments/{id}/categories/{catId}/generate-bracket    — Generar fixture
POST   /api/tournaments/{id}/categories/{catId}/advance-from-groups — Clasificar de grupos a eliminacion
POST   /api/tournaments/{id}/categories/{catId}/regenerate          — Regenerar (preservando resultados)
POST   /api/tournaments/{id}/categories/{catId}/add-round           — Agregar ronda extra

# Consulta
GET    /api/tournaments/{id}/categories/{catId}/bracket             — Bracket completo
GET    /api/tournaments/{id}/categories/{catId}/groups              — Grupos y posiciones
GET    /api/tournaments/{id}/categories/{catId}/standings           — Tabla de posiciones
GET    /api/tournaments/{id}/categories/{catId}/matches             — Todos los partidos

# Partidos
GET    /api/tournaments/{id}/matches/{matchId}                      — Detalle de un partido
PATCH  /api/tournaments/{id}/matches/{matchId}/score                — Actualizar resultado
POST   /api/tournaments/{id}/matches/{matchId}/start                — Iniciar partido
POST   /api/tournaments/{id}/matches/{matchId}/end                  — Finalizar (auto-avanza)
PATCH  /api/tournaments/{id}/matches/{matchId}/walkover             — Dar W.O.
PATCH  /api/tournaments/{id}/matches/{matchId}/postpone             — Posponer
PATCH  /api/tournaments/{id}/matches/{matchId}/suspend              — Suspender (guarda parcial)
PATCH  /api/tournaments/{id}/matches/{matchId}/resume               — Reanudar

# Equipos en bracket
PATCH  /api/tournaments/{id}/registrations/{regId}/disqualify       — Descalificar
PATCH  /api/tournaments/{id}/groups/{groupId}/move-team             — Mover equipo entre grupos
```

## Sub-fase 3.E — Agente IA de Torneos

| # | Tarea | Detalle |
|---|-------|---------|
| 3.E.1 | `TournamentAgentToolExecutor` | Clase que ejecuta tools llamando a los controllers/services |
| 3.E.2 | Refactorizar `ClubAssistantService` → `AgentService` | Constructor recibe ToolExecutor segun contexto. System prompt segun contexto. Mismo flujo de chat |
| 3.E.3 | System prompt de torneos | Contexto: datos del torneo activo, categorias, inscripciones, estado del bracket. Instrucciones de como manejar cada situacion |
| 3.E.4 | Definir tools (30+) | generate_bracket, update_score, walkover, disqualify_team, move_team_group, postpone_match, start_match, end_match, calculate_standings, advance_from_groups, send_notification, get_standings, get_bracket, get_matches, configure_sport_scoring, **register_match_result** (ingreso manual retroactivo), **register_match_events** (goles/tarjetas despues del hecho), **suspend_match** (guardar parcial), **resume_match** (reanudar suspendido), **sync_offline_events** (procesar cola offline), etc. |
| 3.E.5 | Confirmaciones para acciones write | El agente devuelve preview + boton "Confirmar" antes de ejecutar acciones destructivas |
| 3.E.6 | Historial de acciones | Log de cada instruccion del organizador + que ejecuto el agente. Timeline exportable |
| 3.E.7 | Adaptar `AgentConversation` | Campo `context_type` ENUM('club','tournament'). Filtrar conversaciones por contexto |

## Sub-fase 3.F — Frontend Visualizacion de Brackets

| # | Tarea | Detalle |
|---|-------|---------|
| 3.F.1 | `BracketView.jsx` | Arbol de eliminacion (cuartos → semis → final). Responsive. Colores por estado. Solo lectura |
| 3.F.2 | `GroupStageView.jsx` | Tabla de posiciones por grupo (PJ, PG, PE, PP, GF, GC, DG, Pts). Fixture por grupo. Zona de clasificacion (verde/roja) |
| 3.F.3 | `LeagueTableView.jsx` | Tabla global formato liga |
| 3.F.4 | `MatchCard.jsx` | Escudos + nombres, marcador, fecha/hora/cancha, estado, para sets: mostrar individuales |
| 3.F.5 | Tab "Fixture" en detalle del torneo | Vista bracket/grupos/liga. Calendario de partidos. Chat IA flotante |
| 3.F.6 | Adaptar `AssistantChatBubble.jsx` | Detectar contexto tournament. Sugerencias rapidas cambian. UI de confirmacion para writes |

**Total Fase 3: 30 tareas | ~8-12 dias** (la fase mas grande)

---

# FASE 4: PORTAL PUBLICO

**Objetivo:** Paginas accesibles sin login. SEO. Compartir en redes.

## Sub-fase 4.A — Backend Publico

| # | Tarea | Detalle |
|---|-------|---------|
| 4.A.1 | `PublicTournamentController` (sin auth) | Directorio, detalle, bracket, standings, matches, teams |
| 4.A.2 | Agregar `is_public` y `slug` a torneos | Migracion + generacion automatica de slug |
| 4.A.3 | SEO meta tags | Open Graph por torneo (titulo, descripcion, imagen del flyer) |
| 4.A.4 | Cache de consultas publicas | Cache de 60s para standings y bracket (alto trafico durante partidos en vivo) |

**Endpoints publicos (sin auth):**
```
GET /api/public/tournaments                          — Directorio
GET /api/public/tournaments/{slug}                   — Detalle
GET /api/public/tournaments/{slug}/bracket/{catId}   — Bracket
GET /api/public/tournaments/{slug}/standings/{catId}  — Posiciones
GET /api/public/tournaments/{slug}/matches            — Partidos (filtros)
GET /api/public/tournaments/{slug}/teams              — Equipos
```

## Sub-fase 4.B — Frontend Publico

| # | Tarea | Detalle |
|---|-------|---------|
| 4.B.1 | `/torneo/{slug}` — Pagina del torneo | Hero con flyer, info, categorias, bracket/posiciones, equipos, partidos, CTA inscripcion, compartir |
| 4.B.2 | `/torneos` — Directorio publico | Grid de torneos, filtros (deporte, ciudad, fecha, estado), busqueda |
| 4.B.3 | `/torneo/{slug}/categoria/{catId}` | Bracket o posiciones de una categoria especifica |
| 4.B.4 | Widget embebible (iframe) | Codigo para que organizadores pongan bracket en su web |
| 4.B.5 | Compartir en redes | Botones WhatsApp, Instagram, Facebook, X. Preview con Open Graph |

**Total Fase 4: 9 tareas | ~2-3 dias**

---

# FASE 6: PAGOS DE INSCRIPCION

**Objetivo:** Cobro opcional. El organizador decide si cobra. Comision Widdo.

### ⚠️ PRECAUCIONES — PaymentService y webhooks compartidos

> Los pagos de inscripción de torneos usan las MISMAS pasarelas (Wompi, MercadoPago)
> que las suscripciones de clubes. Si los webhooks se cruzan, pagos de club fallan.

**Reglas:**

1. **Tabla separada** — `pla_tournament_payments` es tabla NUEVA, completamente separada de
   `pla_club_teams_payments`. NO mezclar pagos de torneo con pagos de suscripción.

2. **Controller separado** — `TournamentPaymentController` es NUEVO. NO agregar lógica
   de torneos a los controllers de pago de club existentes.

3. **Webhooks** — Agregar campo `payment_type` ENUM('subscription','tournament_registration')
   al webhook handler. El handler existente de suscripciones no se toca, solo se agrega
   un branch para tournament_registration que va al nuevo controller.

4. **PaymentService** — ANTES de usar, verificar si hardcodea `club_id`.
   Si sí → crear `TournamentPaymentService` separado que reutilice `PaymentGatewayFactory`
   pero con su propia lógica de procesamiento.
   Si no → reutilizar con parámetro `payment_type`.

5. **Tests obligatorios al terminar Fase 6:**
   - Pago de suscripción Wompi sigue funcionando ✓
   - Pago de suscripción MercadoPago sigue funcionando ✓
   - Webhook de suscripción procesa correctamente ✓
   - Webhook de torneo procesa correctamente ✓
   - Un webhook de torneo NO crea pago de suscripción ✓
   - Un webhook de suscripción NO crea pago de torneo ✓

## Sub-fase 6.A — Backend de Pagos

| # | Tarea | Detalle |
|---|-------|---------|
| 6.A.1 | Migracion `create_pla_tournament_payments` | tournament_id, registration_id, amount, currency, gateway, external_reference, status ENUM('pending','approved','rejected','refunded'), paid_at, paid_by, manual_note, widdo_fee, widdo_fee_amount |
| 6.A.2 | Modelo `PlaTournamentPayment` | Relaciones, scopes |
| 6.A.3 | Campos de fee en torneo | registration_fee_enabled, registration_fee_amount, registration_fee_currency. Migracion |
| 6.A.4 | `TournamentPaymentController` | Iniciar pago, listar pagos (organizador), marcar pagado manual |
| 6.A.5 | Webhook handlers | Wompi y MercadoPago adaptados para pagos de torneo (no de suscripcion) |
| 6.A.6 | Auto-aprobar inscripcion al confirmar pago | Configurable por torneo |
| 6.A.7 | Fee de Widdo | Comision % sobre cada pago. Configurable por super_admin. Ejemplo: 5% |
| 6.A.8 | Reembolsos | Endpoint para reembolsar si club se retira |

## Sub-fase 6.B — Frontend de Pagos

| # | Tarea | Detalle |
|---|-------|---------|
| 6.B.1 | Pantalla de pago en flujo de inscripcion | Si hay fee → despues de inscribir, ir a pago (Wompi widget o MercadoPago redirect) |
| 6.B.2 | Tab "Pagos" del organizador | Estado de pagos por club, marcar manual, total recaudado, comision Widdo vs neto |
| 6.B.3 | Configuracion de fee en wizard del torneo | Toggle activar/desactivar, monto, moneda |

**Total Fase 6: 11 tareas | ~2-3 dias**

---

# FASE 8: MOBILE

## Sub-fase 8.A — Prioridad Alta

| # | Tarea | Detalle |
|---|-------|---------|
| 8.A.1 | Scoring panel mobile-first | El AdaptiveScorePanel ya es mobile-first. Verificar en Capacitor |
| 8.A.2 | Push notifications | "Final! Siempre Fuertes 3-1 Itagui". Usar Firebase/OneSignal |
| 8.A.3 | Vista de bracket mobile | Scroll horizontal para brackets grandes. Zoom pinch |

## Sub-fase 8.B — Prioridad Media

| # | Tarea | Detalle |
|---|-------|---------|
| 8.B.1 | Dashboard organizador mobile | Resumen rapido: torneos activos, partidos de hoy, inscripciones pendientes |
| 8.B.2 | Inscripcion de club desde mobile | Flujo simplificado para inscribirse desde el celular |
| 8.B.3 | Vista publica en app | Ver torneo, bracket, en vivo desde la app |

**Total Fase 8: 6 tareas | ~2-3 dias**
