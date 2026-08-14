# Widdo Tournaments - Plan de Implementacion

> **Arquitectura:** Dentro de `saas_sport/` (backend) y `frontend/` (UI) — reutilizando infra existente
> **Fecha inicio:** 2026-02-26
> **Estado:** En planificacion

---

## Vision del Producto

Widdo Tournaments es la **segunda vertical del ecosistema Widdo** — una plataforma donde organizadores independientes crean torneos deportivos y los clubes participan.

### Flujo Principal

```
ORGANIZADOR (tipo Copa T&E)
    │
    ├── Crea torneo en Widdo (deporte, categorias, fechas, lugar, reglas)
    │
    ├── Invita clubes
    │       │
    │       ├── Club YA en Widdo ──→ Recibe invitacion
    │       │                              │
    │       │                        Acepta desde su dashboard
    │       │                              │
    │       │                        Selecciona categoria
    │       │                        Asigna SUS jugadores
    │       │                              │
    │       └── Club NO en Widdo ──→ Recibe URL publica de inscripcion
    │                                      │
    │                                Se registra en Widdo (plan gratuito)
    │                                Crea su club + jugadores
    │                                      │
    │                                Selecciona categoria
    │                                Asigna SUS jugadores
    │                                      │
    │                                Se enamora de Widdo → upgrade a plan pago
    │
    ├── Organizador aprueba/rechaza inscripciones
    │
    ├── Genera brackets/fixture
    │
    ├── Gestiona partidos y resultados (en vivo)
    │
    └── Todo publico: cualquiera ve brackets, resultados, posiciones
```

### Reglas Clave

1. **El organizador NO toca jugadores** — solo crea torneo, categorias, invita y gestiona fixture
2. **El club gestiona su propia plantilla** — acepta invitacion, elige categoria, asigna jugadores
3. **Clubs externos = nuevos clubs Widdo** — se registran con plan gratis, acceden a lo basico, se enamoran y hacen upgrade
4. **Pagos opcionales** — el organizador decide si cobra inscripcion online o no
5. **Cualquier deporte** — individual (tenis, natacion, atletismo) o colectivo (futbol, basquet, volley)
6. **Todos los formatos** — eliminacion directa, grupos + eliminacion, liga, doble eliminacion
7. **Multi-rol** — un usuario puede ser owner de club Y organizador de torneos (misma cuenta, cambio de contexto)

### Modelo de Revenue (Widdo)

**Freemium + Comision:**
- Gratis hasta X torneos o X equipos inscritos
- Despues cobra suscripcion mensual al organizador o comision por inscripcion
- Los pagos de inscripcion de equipos van al organizador (Widdo cobra fee)
- Clubs nuevos que entran por torneos → potenciales suscriptores de Widdo Clubs

---

## Indice de Fases

| Fase | Nombre | Descripcion |
|------|--------|-------------|
| 0 | Rol Organizador | Nuevo tipo de usuario que organiza torneos sin tener club |
| 1 | Torneo multi-deporte | Soporte para cualquier deporte y formato de competencia |
| 2 | Inscripcion cross-club | Clubes Widdo aceptan invitacion + externos se registran via URL |
| 3 | Formatos de competencia | Motor de brackets, grupos, liga, eliminacion |
| 4 | Portal publico | Pagina publica por torneo, directorio de torneos |
| 5 | Resultados en vivo | WebSockets para marcadores en tiempo real |
| 6 | Pagos de inscripcion | Cobro opcional via Wompi/MercadoPago |
| 7 | Estadisticas y rankings | Goleadores, MVPs, stats por jugador y equipo |
| 8 | Mobile | App movil para organizadores, clubes y espectadores |

---

## Fase 0: Rol Organizador (Multi-rol)

### Objetivo
Agregar "Organizador de Torneos" como **rol adicional** dentro de la misma cuenta de usuario. Un usuario que ya es owner de un club, padre o jugador puede **tambien** ser organizador de torneos. Se cambia de contexto con el switcher que ya existe.

```
┌─────────────────────────────┐
│  Miguel Cano        ▼       │
│─────────────────────────────│
│  👤 Bogota FC (Owner)        │
│  👨‍👦 Club Hijo (Padre)        │
│  🏆 Organizador de Torneos   │  ← nuevo contexto
│─────────────────────────────│
│  Al seleccionar Organizador  │
│  el sidebar/dashboard cambia │
│  a la vista de organizador   │
└─────────────────────────────┘
```

Un usuario nuevo tambien puede registrarse **directamente** como organizador (sin tener club), y mas adelante agregar un club si quiere.

### Que ya existe
- Sistema de roles (owner, trainer, player, parent, accountant, super_admin)
- Switcher de contexto (cambiar entre clubs/roles)
- Registro y autenticacion completos
- Dashboard por rol

### Backend (saas_sport/)

- [ ] 0.1 Crear rol `tournament_organizer` en `bas_roles`
- [ ] 0.2 Crear modelo `PlaOrganizer` (perfil de organizador vinculado al user):
  - `user_id` (FK users — mismo usuario que puede tener otros roles)
  - `organization_name` (nombre de la organizacion/empresa, ej: "Copa T&E")
  - `logo_path`
  - `description`
  - `website`
  - `phone`
  - `email_contact`
  - `city_id` (FK bas_cities)
  - `social_media` (JSON: instagram, facebook, twitter)
  - `verified` (boolean — verificado por Widdo)
  - `status` (active, suspended)
- [ ] 0.3 Migracion `create_pla_organizers_table`
- [ ] 0.4 Adaptar `AuthController`:
  - Registro nuevo: opcion "Quiero organizar torneos" (crea user + perfil organizador)
  - Usuario existente: "Activar perfil de organizador" desde settings o switcher
- [ ] 0.5 Crear `OrganizerController` (CRUD perfil de organizador)
- [ ] 0.6 Middleware/policy para proteger rutas de organizador
- [ ] 0.7 Hacer `club_id` nullable en `pla_club_teams_tournaments` y agregar `organizer_id` — torneos del organizador NO pertenecen a un club
- [ ] 0.8 Adaptar endpoint de contextos del usuario para incluir "organizador" en la lista de roles disponibles

### Frontend (frontend/)

- [ ] 0.9 Agregar "Organizador de Torneos" al switcher de contexto existente
- [ ] 0.10 Flujo de activacion: si el usuario no tiene perfil de organizador, mostrar mini-onboarding (nombre organizacion, logo, contacto) al seleccionar "Organizador" por primera vez
- [ ] 0.11 En registro nuevo: opcion "Quiero organizar torneos" que lleva al onboarding de organizador
- [ ] 0.12 Dashboard de organizador (al cambiar contexto):
  - Mis Torneos (lista)
  - Crear Torneo
  - Inscripciones pendientes
  - Pagos recibidos
- [ ] 0.13 Sidebar/menu adaptado al contexto organizador

### Progreso: ░░░░░░░░░░░░░░░░░░░░ 0%

---

## Fase 1: Torneo Multi-Deporte

### Objetivo
Soportar **cualquier deporte** — individuales y colectivos — con todos los formatos de competencia posibles.

### Que ya existe
- Modelo `PlaTournament` con CRUD completo (7 modelos, 31 endpoints)
- Categorias por edad y nivel
- Documentos requeridos, staff, presupuesto
- Frontend: wizard 6 pasos + pagina detalle 7 tabs

### Backend

- [ ] 1.1 Agregar campo `sport_id` a torneos (FK → `bas_sports`)
- [ ] 1.2 Agregar `tournament_type` ENUM: `team`, `individual`, `pair`
- [ ] 1.3 Agregar `competition_format` ENUM: `single_elimination`, `double_elimination`, `round_robin`, `groups_elimination`, `swiss`, `custom`
- [ ] 1.4 Crear/verificar tabla `bas_sports` (futbol, basquet, tenis, natacion, atletismo, artes marciales, volley, etc.)
- [ ] 1.5 Adaptar categorias para manejar **atletas individuales** o **parejas** (dobles) ademas de equipos
- [ ] 1.6 Agregar campos de configuracion:
  - `max_teams` / `max_participants`
  - `min_teams` / `min_participants`
  - `players_per_team` (colectivos)
  - `rules_url` o `rules_text` (reglamento)
  - `prizes` (JSON — premios por posicion)
- [ ] 1.7 Adaptar `PlaTournamentController` para nuevos campos
- [ ] 1.8 Crear tabla `pla_sport_scoring_configs` — configuracion JSON por deporte:
  - `sport_id` (FK → bas_sports)
  - `config` (JSON — match_structure, scoring_events, scoring_rules)
  - `panel_type` ENUM: `points`, `goals`, `sets_games`, `rounds_points`, `times_marks`
  - `is_default` (boolean — config predeterminada del deporte)
  - `created_by` (nullable — null = sistema, user_id = custom del organizador)
- [ ] 1.9 Crear `SportConfigSeeder` con ~20 configs predefinidos (fútbol, basquet, tenis, pádel, volley, handball, futsal, hockey, béisbol, natación, atletismo, judo, karate, taekwondo, boxeo, badminton, rugby, cricket, gimnasia, patinaje)

### Frontend

- [ ] 1.10 Paso "Tipo de torneo" en wizard: deporte, individual/colectivo, formato
- [ ] 1.11 Adaptar UI de categorias segun tipo (equipos vs atletas vs parejas)
- [ ] 1.12 Seccion de premios y reglamento en formulario

### Progreso: ░░░░░░░░░░░░░░░░░░░░ 0%

---

## Fase 2: Inscripcion Cross-Club

### Objetivo
El organizador invita clubes. **Los clubes gestionan su propia participacion**: aceptan la invitacion, eligen categoria y asignan sus jugadores. Clubs externos se registran en Widdo (plan gratis) via URL publica.

### Que ya existe
- Inscripcion de jugadores del **mismo club** (modulo actual)
- Documentos requeridos y aprobacion
- Export de jugadores

### Backend

- [ ] 2.1 Crear modelo `PlaTournamentInvitation` (invitacion del organizador al club):
  - `tournament_id`
  - `club_id` (FK — nullable si es invitacion por email a club externo)
  - `invited_email` (email del contacto si no es club Widdo)
  - `invited_club_name` (nombre del club invitado)
  - `token` (token unico para URL de inscripcion)
  - `status` ENUM: `pending`, `accepted`, `declined`, `expired`
  - `sent_at`, `accepted_at`, `declined_at`
  - `sent_by` (user_id del organizador)
  - `message` (mensaje personalizado del organizador)
- [ ] 2.2 Crear modelo `PlaTournamentRegistration` (inscripcion del club al torneo):
  - `tournament_id`
  - `tournament_category_id`
  - `club_id` (FK — el club que se inscribe)
  - `invitation_id` (FK nullable — si vino de invitacion)
  - `team_name` (nombre del equipo para el torneo, puede diferir del club)
  - `status` ENUM: `pending`, `approved`, `rejected`, `withdrawn`
  - `registration_fee_paid` (boolean)
  - `payment_reference`
  - `registered_by` (user_id — el owner/admin del club)
  - `approved_by` (user_id — el organizador)
  - `approved_at`
  - `notes`
- [ ] 2.3 Migraciones para ambas tablas
- [ ] 2.4 Adaptar `PlaTournamentPlayer` para incluir `tournament_registration_id` — vincular jugadores a la inscripcion del club
- [ ] 2.5 Crear `TournamentInvitationController` (para el organizador):
  - `POST /api/tournaments/{id}/invitations` — enviar invitacion (a club Widdo o email externo)
  - `POST /api/tournaments/{id}/invitations/bulk` — invitar multiples clubes
  - `GET /api/tournaments/{id}/invitations` — listar invitaciones enviadas
  - `DELETE /api/tournaments/{id}/invitations/{invitationId}` — cancelar invitacion
  - `POST /api/tournaments/{id}/invitations/{invitationId}/resend` — reenviar
- [ ] 2.6 Crear `TournamentRegistrationController` (para el club que se inscribe):
  - `GET /api/tournaments/{id}/registration-info` — info publica del torneo (categorias, requisitos)
  - `POST /api/tournaments/{id}/register` — inscribir mi club a una categoria
  - `POST /api/tournaments/{id}/registrations/{regId}/players` — asignar jugadores de MI club
  - `DELETE /api/tournaments/{id}/registrations/{regId}/players/{playerId}` — quitar jugador
  - `GET /api/tournaments/{id}/registrations/{regId}/eligible-players` — ver jugadores de mi club elegibles
  - `DELETE /api/tournaments/{id}/registrations/{regId}` — retirar inscripcion
- [ ] 2.7 Endpoints del organizador para gestionar inscripciones:
  - `GET /api/tournaments/{id}/registrations` — todas las inscripciones
  - `PATCH /api/tournaments/{id}/registrations/{regId}/status` — aprobar/rechazar
  - `GET /api/tournaments/{id}/registrations/{regId}/players` — ver plantilla del club
- [ ] 2.8 Flujo de club externo (URL publica):
  - `GET /api/public/tournaments/{token}` — ver torneo por token de invitacion
  - El club externo se registra en Widdo (plan gratis) → crea club → agrega jugadores → se inscribe al torneo
  - Reutilizar flujo de registro existente + onboarding simplificado
- [ ] 2.9 Notificaciones email:
  - Al club: invitacion recibida (con link para aceptar)
  - Al organizador: club acepto/rechazo invitacion
  - Al organizador: nuevo club se inscribio (via URL publica)
  - Al club: inscripcion aprobada/rechazada por el organizador
- [ ] 2.10 Agregar URL publica del torneo: `/inscribirse/{slug}` — cualquiera puede ver info e inscribirse

### Frontend — Vista del Organizador

- [ ] 2.11 Tab "Invitaciones" en detalle del torneo:
  - Buscar clubes Widdo por nombre y enviar invitacion
  - Invitar por email (club externo)
  - Estado de cada invitacion (pendiente, aceptada, rechazada)
  - Reenviar invitacion
- [ ] 2.12 Tab "Inscripciones" en detalle del torneo:
  - Lista de clubes inscritos con estado por categoria
  - Ver plantilla de jugadores de cada club
  - Aprobar/rechazar inscripciones
  - Compartir link de inscripcion publica (copiar, WhatsApp)

### Frontend — Vista del Club (owner/admin del club)

- [ ] 2.13 Seccion "Invitaciones a Torneos" en el dashboard del club:
  - Lista de invitaciones pendientes
  - Ver detalle del torneo (info, categorias, fechas, requisitos)
  - Boton "Aceptar" → flujo de inscripcion
- [ ] 2.14 Flujo de inscripcion del club:
  - Seleccionar categoria
  - Seleccionar jugadores de SU club (con filtro de elegibilidad por edad/nivel)
  - Confirmar inscripcion
  - Si hay pago → ir a pantalla de pago
- [ ] 2.15 Seccion "Mis Torneos" en dashboard del club:
  - Torneos donde el club esta inscrito
  - Estado de inscripcion (pendiente, aprobada)
  - Ver fixture/bracket cuando este disponible
- [ ] 2.16 Pagina publica de inscripcion `/inscribirse/{slug}`:
  - Info del torneo
  - Si logueado con club → inscripcion rapida
  - Si no logueado → registro en Widdo (plan gratis) → crear club → inscripcion

### Progreso: ░░░░░░░░░░░░░░░░░░░░ 0%

---

## Fase 3: Formatos de Competencia (Brackets, Grupos, Liga)

### Objetivo
Motor de competencia: **eliminacion directa**, **doble eliminacion**, **fase de grupos + eliminacion**, **todos contra todos (liga)**, **swiss**, y soporte para **deportes individuales**.

### Que ya existe
- Nada de brackets/fixtures. El torneo es solo contenedor de categorias y jugadores.

### Backend

- [ ] 3.1 Crear modelo `PlaTournamentRound` (ronda/jornada):
  - `tournament_id`
  - `tournament_category_id`
  - `round_number`
  - `round_name` (ej: "Cuartos de Final", "Jornada 3", "Grupo A - Fecha 2")
  - `round_type` ENUM: `group_stage`, `elimination`, `final`, `third_place`, `consolation`, `round_robin`
  - `status` ENUM: `pending`, `in_progress`, `completed`
  - `start_date`, `end_date`
- [ ] 3.2 Crear modelo `PlaTournamentGroup` (para fase de grupos):
  - `tournament_id`
  - `tournament_category_id`
  - `name` (ej: "Grupo A", "Grupo B")
  - `teams_qualify` (cuantos avanzan a eliminacion)
- [ ] 3.3 Crear modelo `PlaTournamentGroupTeam` (equipos asignados a grupo):
  - `group_id`
  - `registration_id` (FK tournament_registrations — el equipo)
- [ ] 3.4 Crear modelo `PlaTournamentMatch` (partido/enfrentamiento):
  - `tournament_id`
  - `round_id`
  - `group_id` (nullable — si es fase de grupos)
  - `match_number` (orden)
  - `home_registration_id` / `away_registration_id` (FK tournament_registrations) — nullable para BYE
  - Para individuales: `home_player_id`, `away_player_id`
  - `home_score`, `away_score`
  - `home_sets` / `away_sets` (JSON — para tenis, volley: [6,3,7] vs [4,6,5])
  - `home_penalty_score`, `away_penalty_score`
  - `winner_registration_id` / `winner_player_id`
  - `status` ENUM: `scheduled`, `in_progress`, `completed`, `postponed`, `cancelled`, `walkover`
  - `venue` (lugar/cancha)
  - `scheduled_at` (datetime)
  - `started_at`, `ended_at`
  - `referee`
  - `notes`
  - `next_match_id` (FK — a que match pasa el ganador en eliminacion)
  - `next_match_position` ENUM: `home`, `away` — posicion en el siguiente match
- [ ] 3.5 Crear modelo `PlaTournamentStanding` (tabla de posiciones):
  - `tournament_id`
  - `tournament_category_id`
  - `group_id` (nullable)
  - `registration_id` / `player_id`
  - `played`, `won`, `drawn`, `lost`
  - `goals_for`, `goals_against`, `goal_difference` (deportes colectivos)
  - `sets_won`, `sets_lost` (deportes con sets)
  - `points_for`, `points_against` (deportes con puntos como basquet)
  - `points` (puntos en la tabla)
  - `position`
  - `bonus_points` (puntos extra: fairplay, etc.)
- [ ] 3.6 Migraciones para las 5 tablas
- [ ] 3.7 Servicio `BracketGeneratorService`:
  - `generateSingleElimination(category, registrations, seeded?)` — bracket con seeding opcional
  - `generateDoubleElimination(category, registrations)` — winners + losers bracket
  - `generateGroupStage(category, registrations, groupCount, teamsQualify)` — sorteo de grupos + fixture dentro de cada grupo
  - `generateRoundRobin(category, registrations)` — fixture todos contra todos
  - `generateSwiss(category, registrations, rounds)` — sistema suizo
  - `advanceWinner(match)` — mover ganador al siguiente match en eliminacion
  - `calculateStandings(category, groupId?)` — recalcular tabla de posiciones
  - `advanceFromGroups(category)` — clasificar equipos de grupos a eliminacion
- [ ] 3.8 Servicio `MatchScoringService`:
  - Reglas de puntuacion configurables por torneo (3 pts victoria, 1 empate, 0 derrota — o custom)
  - Criterios de desempate configurables (diferencia de gol, enfrentamiento directo, etc.)
  - Soporte para formatos por sets (tenis, volley), por puntos (basquet), por tiempo (atletismo)
- [ ] 3.9 Crear `TournamentBracketController`:
  - `POST /api/tournaments/{id}/categories/{catId}/generate-bracket` — generar fixture
  - `GET /api/tournaments/{id}/categories/{catId}/bracket` — bracket completo
  - `GET /api/tournaments/{id}/categories/{catId}/groups` — grupos y posiciones
  - `GET /api/tournaments/{id}/categories/{catId}/standings` — tabla de posiciones
  - `GET /api/tournaments/{id}/categories/{catId}/matches` — todos los partidos
  - `GET /api/tournaments/{id}/matches/{matchId}` — detalle de un partido
  - `PATCH /api/tournaments/{id}/matches/{matchId}/score` — actualizar resultado
  - `POST /api/tournaments/{id}/matches/{matchId}/start` — iniciar partido
  - `POST /api/tournaments/{id}/matches/{matchId}/end` — finalizar partido (auto-avanza ganador)
  - `POST /api/tournaments/{id}/categories/{catId}/advance-from-groups` — clasificar de grupos a eliminacion
- [ ] 3.10 Configuracion de reglas de puntuacion por torneo

### Agente IA — El organizador habla, el agente ejecuta

**Filosofia:** No hay botones manuales complejos. El organizador le habla al agente (chat o voz) y el agente ejecuta las acciones llamando a los endpoints del backend. El frontend solo muestra el estado actual (brackets, posiciones, partidos).

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  ORGANIZADOR (chat o voz)                                │
│  "Genera el fixture con 6 grupos de 4, clasifican 2"    │
│           │                                              │
│           ▼                                              │
│  AGENTE IA                                               │
│  Entiende la instruccion → llama endpoints del API       │
│  → genera fixture → confirma al organizador              │
│           │                                              │
│           ▼                                              │
│  BACKEND (endpoints = herramientas del agente)           │
│  Ejecuta la accion → recalcula posiciones → broadcast    │
│           │                                              │
│           ▼                                              │
│  FRONTEND (solo visualizacion)                           │
│  Bracket, posiciones, partidos se actualizan en vivo     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### Ejemplos de conversacion con el agente

**Generacion:**
```
Organizador: "Genera el fixture. 6 grupos de 4, clasifican los 2 primeros,
              despues eliminacion directa hasta la final"
Agente:      "Listo. Generé 6 grupos con sorteo aleatorio.
              Fase de grupos: 3 jornadas (18 partidos).
              Octavos de final: 6 partidos.
              Cuartos, semis y final.
              Total: 35 partidos. ¿Quieres que programe horarios?"
```

**Imprevistos:**
```
Organizador: "El Club Itagüí no llego al partido de las 4pm"
Agente:      "Marqué Siempre Fuertes vs Club Itagüí como W.O.
              Siempre Fuertes gana 20-0. Tabla del Grupo A actualizada.
              ¿Quieres notificar a los equipos?"

Organizador: "Descalifica a Club Barbosa del torneo, no trajeron documentos"
Agente:      "Club Barbosa descalificado. Sus 2 partidos pendientes son W.O.
              para los rivales. El partido que ya jugaron (vs Copacabana,
              perdieron 45-60) se mantiene en la tabla. ¿Correcto o prefieres
              anular todos sus resultados?"

Organizador: "Mueve a Club Bello al Grupo A y a Club Caldas al Grupo C"
Agente:      "Listo. Moví los equipos. Regeneré los partidos pendientes
              de los 3 grupos afectados. Los partidos ya jugados se mantienen.
              Grupo A ahora: Siempre Fuertes, Itagüí, Copacabana, Club Bello."
```

**Formatos raros:**
```
Organizador: "Quiero que los terceros de cada grupo jueguen un repechaje
              entre ellos, y los 3 mejores tambien clasifiquen a octavos"
Agente:      "Entendido. Creé ronda de repechaje con 6 equipos (terceros
              de cada grupo). Round-robin entre ellos, clasifican 3.
              Octavos quedan con 15 equipos... necesitas 16 para el bracket.
              ¿Quieres agregar el mejor 4to como wild card?"

Organizador: "Si, que entre el mejor cuarto"
Agente:      "Listo. Octavos con 16 equipos: 12 de grupos + 3 de repechaje
              + 1 wild card (mejor 4to). Bracket generado."
```

**Dia del torneo:**
```
Organizador: "Empezó el partido de la cancha 2, Siempre Fuertes vs Itagüí"
Agente:      "Partido iniciado. Cronómetro corriendo. Resultado en vivo
              visible en widdo.co/torneo/departamental-sub15. ¿Marcador?"

Organizador: "Gol de Siempre Fuertes, minuto 12, Juan Pérez"
Agente:      "Siempre Fuertes 1 - 0 Itagüí. Gol registrado: Juan Pérez (12').
              Actualizado en vivo."

Organizador: "Terminó el partido 3 a 1"
Agente:      "Partido finalizado. Siempre Fuertes 3 - 1 Club Itagüí.
              Tabla del Grupo A actualizada. Próximo partido en cancha 2:
              Copacabana vs Barbosa a las 5:30pm."
```

#### Integracion con Widdo AI existente

El agente de torneos **no es un chat separado**. Es el mismo `AssistantChatBubble.jsx` que ya existe, pero que carga tools y system prompt diferentes segun el contexto del usuario:

```
Usuario en contexto "Mi Club (Owner)"
  → ClubAssistantToolExecutor (11 tools read-only)
  → System prompt de club

Usuario en contexto "Organizador de Torneos"
  → TournamentAgentToolExecutor (25+ tools read + write)
  → System prompt de torneos
```

**Se reutiliza:**
- `LLMProviderInterface` (Anthropic/OpenAI) → tal cual
- `AgentConversation` → agregar campo `context_type` (club/tournament/organizer)
- `AIConfig` → extender para config de organizador
- `agent_logs` → tal cual
- ElevenLabs TTS → tal cual (voz desde la cancha)
- Flujo de chat con tool-calling loop (max 5 iteraciones) → tal cual

**Se crea nuevo:**
- `TournamentAgentToolExecutor` — tools especificos de torneo
- System prompt de torneos (contexto del organizador + torneo activo)
- Confirmaciones para acciones destructivas (write tools)

**Diferencia clave con el agente de club:**
El agente de club es read-only. El de torneos es **read + write** — ejecuta acciones reales.
Para acciones write, el agente pide confirmacion antes de ejecutar.

- [ ] 3.11 Crear `TournamentAgentToolExecutor` (misma interfaz que ClubAssistantToolExecutor):
  - Recibe tool name + input + tournamentId
  - Ejecuta la accion llamando Services/Controllers existentes
  - Devuelve resultado al agente
- [ ] 3.12 Refactorizar `ClubAssistantService` → `AgentService` genérico:
  - El constructor recibe el ToolExecutor segun contexto
  - System prompt se construye segun contexto (club vs tournament)
  - Mismo flujo de chat, misma persistencia, mismos providers
- [ ] 3.13 Adaptar `AssistantChatBubble.jsx`:
  - Detectar contexto actual del usuario (club owner vs organizador)
  - Enviar `context_type: 'tournament'` en la peticion al API
  - Agregar UI de confirmacion para acciones write
  - Sugerencias rapidas segun contexto
- [ ] 3.14 Definir las **herramientas (tools)** del agente de torneos:
  - `generate_bracket` — generar fixture
  - `create_match` — crear partido
  - `update_score` — actualizar marcador
  - `walkover` — dar W.O.
  - `disqualify_team` — descalificar equipo
  - `replace_team` — reemplazar equipo
  - `move_team_group` — mover equipo entre grupos
  - `postpone_match` — reprogramar partido
  - `cancel_match` — cancelar partido
  - `start_match` / `end_match` — iniciar/finalizar partido
  - `add_round` — agregar ronda extra
  - `regenerate_bracket` — regenerar fixture preservando resultados
  - `calculate_standings` — recalcular posiciones
  - `advance_from_groups` — clasificar de grupos a eliminacion
  - `send_notification` — notificar equipos
  - `get_standings` / `get_bracket` / `get_matches` — consultar estado
  - `configure_sport_scoring` — generar/modificar config JSON de planilla por deporte
  - `get_sport_config` — consultar config actual del deporte del torneo
- [ ] 3.13 Historial de acciones del agente:
  - Log de cada instruccion del organizador y que ejecuto el agente
  - Transparencia total (evita reclamos)
  - El organizador puede ver "¿que hice?" y el agente muestra historial

#### Endpoints del backend (herramientas del agente)

Los endpoints son las mismas acciones de antes, pero ahora el "usuario" es el agente IA:

```
# Generacion
POST   /api/tournaments/{id}/categories/{catId}/generate-bracket
POST   /api/tournaments/{id}/categories/{catId}/advance-from-groups
POST   /api/tournaments/{id}/categories/{catId}/regenerate
POST   /api/tournaments/{id}/categories/{catId}/add-round

# Partidos
POST   /api/tournaments/{id}/matches
GET    /api/tournaments/{id}/matches
GET    /api/tournaments/{id}/matches/{matchId}
PUT    /api/tournaments/{id}/matches/{matchId}
DELETE /api/tournaments/{id}/matches/{matchId}
PATCH  /api/tournaments/{id}/matches/{matchId}/score
PATCH  /api/tournaments/{id}/matches/{matchId}/walkover
PATCH  /api/tournaments/{id}/matches/{matchId}/postpone
POST   /api/tournaments/{id}/matches/{matchId}/start
POST   /api/tournaments/{id}/matches/{matchId}/end

# Equipos
PATCH  /api/tournaments/{id}/registrations/{regId}/disqualify
PATCH  /api/tournaments/{id}/registrations/{regId}/replace
PATCH  /api/tournaments/{id}/groups/{groupId}/move-team

# Consultas
GET    /api/tournaments/{id}/categories/{catId}/bracket
GET    /api/tournaments/{id}/categories/{catId}/standings
GET    /api/tournaments/{id}/categories/{catId}/groups
```

### Frontend

El frontend se simplifica enormemente — es **visualizacion + chat**:

- [ ] 3.14 Componente `BracketView` (arbol de eliminacion):
  - Visualizacion de llaves (cuartos → semis → final)
  - Responsive mobile
  - Colores por estado (programado, en juego, finalizado, W.O.)
  - Solo lectura — las modificaciones se hacen por chat con el agente
- [ ] 3.15 Componente `GroupStageView`:
  - Tabla de posiciones por grupo (PJ, PG, PE, PP, GF, GC, DG, Pts)
  - Fixture de partidos por grupo
  - Indicador de "clasificados" (zona verde/roja)
- [ ] 3.16 Componente `LeagueTableView`:
  - Tabla de posiciones global (formato liga)
- [ ] 3.17 Componente `MatchCard`:
  - Escudos + nombres de equipos/jugadores
  - Marcador
  - Fecha, hora, cancha, arbitro
  - Estado (programado, EN VIVO, finalizado, W.O., suspendido)
  - Para sets: mostrar sets individuales (6-4, 3-6, 7-5)
- [ ] 3.18 Tab "Fixture" en detalle del torneo:
  - Vista del bracket/grupos/liga (solo visualizacion)
  - Calendario de partidos (vista por dia/semana)
  - El chat de Widdo AI (AssistantChatBubble) siempre disponible flotante
- [ ] 3.19 Adaptar `AssistantChatBubble.jsx` para contexto organizador:
  - Detecta que el usuario esta en contexto "Organizador de Torneos"
  - Envia `context_type: 'tournament'` al API
  - Sugerencias rapidas cambian: "Generar fixture", "Ver posiciones", "Programar horarios", "Dar walkover"
  - Agrega UI de confirmacion para acciones write (modal "¿Confirmas?")
  - Input de voz (ya existe TTS con ElevenLabs, agregar speech-to-text)
  - Historial de conversacion persistente (ya existe AgentConversation)
- [ ] 3.20 Historial de acciones:
  - Timeline de todo lo que el agente ejecuto
  - Cada accion con timestamp, descripcion y quien la pidio
  - Exportable (para actas del torneo)

### Progreso: ░░░░░░░░░░░░░░░░░░░░ 0%

---

## Fase 4: Portal Publico

### Objetivo
Paginas publicas accesibles **sin login** para que cualquiera vea torneos, brackets, resultados y se inscriba.

### Que ya existe
- Nada publico. Todo requiere autenticacion.

### Backend

- [ ] 4.1 Crear `PublicTournamentController` (sin auth):
  - `GET /api/public/tournaments` — directorio de torneos abiertos
  - `GET /api/public/tournaments/{slug}` — detalle del torneo
  - `GET /api/public/tournaments/{slug}/bracket/{categoryId}` — bracket publico
  - `GET /api/public/tournaments/{slug}/standings/{categoryId}` — posiciones
  - `GET /api/public/tournaments/{slug}/matches` — partidos (filtro por estado, fecha)
  - `GET /api/public/tournaments/{slug}/teams` — equipos participantes
- [ ] 4.2 Agregar `is_public` (boolean) y `slug` (unique) a torneos
- [ ] 4.3 SEO: Open Graph meta tags por torneo (para compartir en redes)

### Frontend

- [ ] 4.4 Pagina `/torneo/{slug}` — pagina publica del torneo:
  - Hero con flyer
  - Info: nombre, fechas, lugar, deporte, organizador, categorias
  - Bracket/posiciones por categoria
  - Equipos inscritos
  - Partidos proximos y resultados
  - Boton CTA "Inscribir mi equipo"
  - Compartir: WhatsApp, Instagram, Facebook, X (con preview OG)
- [ ] 4.5 Pagina `/torneos` — directorio publico:
  - Lista/grid de torneos publicos
  - Filtros: deporte, ciudad, fecha, estado (abierto, en curso, finalizado)
  - Busqueda por nombre
  - Tarjetas con flyer, nombre, fecha, lugar, plazas disponibles
- [ ] 4.6 Pagina `/torneo/{slug}/categoria/{catId}` — bracket/posiciones de una categoria
- [ ] 4.7 Widget embebible (iframe) para que organizadores pongan bracket en su web/redes

### Progreso: ░░░░░░░░░░░░░░░░░░░░ 0%

---

## Fase 5: Resultados en Vivo

### Objetivo
Marcadores en **tiempo real** via WebSockets. Cualquiera con el link ve los resultados actualizandose.

### Que ya existe
- Laravel Reverb configurado y funcionando
- Canales privados por club
- Frontend con Echo.js

### Backend

- [ ] 5.1 Canal publico `tournament.{tournamentId}` (sin auth — cualquiera escucha)
- [ ] 5.2 Crear eventos broadcast:
  - `MatchStarted`
  - `ScoreUpdated`
  - `MatchEnded`
  - `StandingsUpdated`
  - `BracketAdvanced`
- [ ] 5.3 Disparar eventos al actualizar resultado en `TournamentBracketController`
- [ ] 5.4 Crear modelo `PlaTournamentMatchEvent` (bitacora en vivo):
  - `match_id`
  - `event_type` ENUM: `goal`, `own_goal`, `penalty_goal`, `yellow_card`, `red_card`, `substitution`, `timeout`, `injury`, `var_review`, `period_start`, `period_end`
  - `minute` (minuto del partido)
  - `player_id` (nullable)
  - `registration_id` (equipo)
  - `description`
  - `created_by` (quien registro el evento)

### Frontend

- [ ] 5.5 Hook `useTournamentLive(tournamentId)` — escucha canal WebSocket
- [ ] 5.6 Componente `LiveScoreboard`:
  - Marcador actualizado en tiempo real
  - Indicador "EN VIVO" parpadeante
  - Timeline de eventos (goles, tarjetas)
  - Minuto actual
### Dos interfaces diferentes para dos contextos diferentes

El scoring en vivo y la gestion del torneo son cosas distintas. Cada una necesita su interfaz:

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  SCORING EN VIVO (durante el partido)                          │
│  UI de botones rapidos — tap instantaneo, cero espera          │
│  Para: sumar puntos, registrar faltas, iniciar/parar periodos  │
│                                                                │
│  GESTION DEL TORNEO (antes, entre y despues de partidos)       │
│  Agente IA por chat/voz — instrucciones complejas              │
│  Para: reestructurar brackets, consultar pagos, walkovers,     │
│  mover equipos, generar fixtures, reportes                     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

#### A) Scoring en vivo — UI de botones (NO agente)

- [ ] 5.7 Componente `MatchScorePanel` (mobile-first, pantalla completa):
  ```
  ┌──────────────────────────────────────┐
  │  Siempre Fuertes  vs  Club Itagüí   │
  │                                      │
  │       45          38                 │
  │                                      │
  │  ⏱️ Q3 — 5:23          [Pausa ⏸️]   │
  │                                      │
  │  ┌──────────┐     ┌──────────┐      │
  │  │   +1     │     │    +1    │      │
  │  ├──────────┤     ├──────────┤      │
  │  │   +2     │     │    +2    │      │
  │  ├──────────┤     ├──────────┤      │
  │  │   +3     │     │    +3    │      │
  │  └──────────┘     └──────────┘      │
  │                                      │
  │  [🟡 Falta] [🔴 Falta] [🔄 Cambio] │
  │                                      │
  │  [◀️ Deshacer ultimo]                │
  │                                      │
  │  [Fin periodo]  [Fin partido]        │
  └──────────────────────────────────────┘
  ```
  - Botones grandes, tap instantaneo (no hay procesamiento IA)
  - Llamada directa al API: `PATCH /matches/{id}/score` → inmediato
  - WebSocket dispara `ScoreUpdated` en tiempo real al portal publico
  - Boton "Deshacer ultimo" por si toca mal
  - Funciona sin conexion (offline-first, sincroniza cuando vuelva la red)
  - Cronometro opcional (el organizador decide si lo usa o lleva el tiempo aparte)

- [ ] 5.8 **Motor genérico de planillas digitales (SportConfig JSON):**
  El MatchScorePanel NO se codea por deporte. Se usa un motor genérico con configuración JSON.
  La IA genera la config del deporte, el motor la lee, el panel se adapta.

  Cada config tiene 3 capas:
  ```json
  {
    "match_structure": {
      "periods": 4,
      "period_duration": 10,
      "overtime": true,
      "tiebreak_rule": "overtime_5min"
    },
    "scoring_events": [
      { "type": "basket_2pt", "points": 2, "icon": "🏀", "label": "+2" },
      { "type": "basket_3pt", "points": 3, "icon": "🏀", "label": "+3" },
      { "type": "free_throw", "points": 1, "icon": "🏀", "label": "+1" },
      { "type": "personal_foul", "card": false, "label": "Falta" },
      { "type": "technical_foul", "card": true, "label": "Técnica" }
    ],
    "scoring_rules": {
      "win_by": "most_points",
      "tiebreak": "overtime"
    }
  }
  ```

  5 adaptadores visuales del panel:
  - `points` — Basquet, handball (botones +1, +2, +3)
  - `goals` — Fútbol, hockey, futsal (botón +1 gol)
  - `sets_games` — Tenis, pádel, volley, badminton (sets con puntos dentro)
  - `rounds_points` — Artes marciales, boxeo (rounds con puntos/técnicas)
  - `times_marks` — Natación, atletismo (cronómetro, marcas, heats)

  Complejidad por deporte:
  - **Fácil:** Fútbol, futsal, hockey, handball, baloncesto, voleibol
  - **Medio:** Tenis, pádel, badminton, béisbol, natación, atletismo, artes marciales (judo, karate, taekwondo)
  - **Complejo:** Cricket, gimnasia, patinaje artístico (puntajes de jueces)

  Deportes nuevos SIN código — el agente IA genera la config:
  ```
  Organizador: "Quiero un torneo de pádel"
  Agente: "Configuré scoring de pádel:
           • Sets: mejor de 3
           • Games por set: 6 (tiebreak a 6-6)
           • Puntos: 15-30-40-game, con ventaja
           • Golden point en deuce (o ventaja, ¿cuál prefieres?)
           La planilla digital ya está lista."
  ```

  Sub-tareas:
  - [ ] 5.8.1 Crear `SportConfigSchema` (JSON Schema que valida configs)
  - [ ] 5.8.2 Crear `SportConfigSeeder` con ~20 configs predefinidos
  - [ ] 5.8.3 Crear componente `AdaptiveScorePanel` que lee config y renderiza botones
  - [ ] 5.8.4 Adaptador visual `points` (basquet, handball)
  - [ ] 5.8.5 Adaptador visual `goals` (fútbol, hockey)
  - [ ] 5.8.6 Adaptador visual `sets_games` (tenis, pádel, volley)
  - [ ] 5.8.7 Adaptador visual `rounds_points` (artes marciales, boxeo)
  - [ ] 5.8.8 Adaptador visual `times_marks` (natación, atletismo)
  - [ ] 5.8.9 Tool del agente: `configure_sport_scoring` — genera/modifica config JSON
  - [ ] 5.8.10 Estimado: ~10-12 días total

  **Diferenciador competitivo:** TeamSnap, SportsEngine NO tienen planillas digitales en vivo.
  Esto es único en el mercado.

- [ ] 5.9 Seleccion de jugador (opcional por evento):
  - Al tocar +2, opcionalmente aparece lista rapida de jugadores del equipo
  - Tap en nombre → registra quien anoto
  - Skip si no importa (solo sumar puntos)
  - Para estadisticas detalladas (goleadores, MVP)

- [ ] 5.10 Multi-cancha: el organizador puede tener N paneles abiertos
  - Cada cancha en una pestaña del browser
  - O un delegado por cancha con su propio celular (co-organizador con permisos)

#### B) Gestion del torneo — Agente IA por chat/voz

- [ ] 5.11 Speech-to-Text (STT) para instrucciones de gestion:
  - Web Speech API (nativo del browser, gratis)
  - Boton de microfono en el chat de Widdo AI
  - Para cuando el organizador necesita hacer algo complejo:
    - "¿Cuantos equipos tienen documentos pendientes?"
    - "Club Barbosa no llego, sus 2 partidos que faltan ponlos como walkover"
    - "Reprograma los partidos de la cancha 2 para mañana"
    - "Genera el cuadro de semifinales con los clasificados"
    - "Mandales email a todos los clubes con los resultados de hoy"
  - Estas son acciones que requieren pensar, consultar datos, y ejecutar multiples pasos
  - El agente procesa, pide confirmacion si es destructivo, y ejecuta

- [ ] 5.12 El agente puede referenciar datos del scoring en vivo:
  - "¿Como va el partido de cancha 1?" → consulta marcador actual
  - "¿Quien va ganando el grupo A?" → consulta standings en vivo
  - "Si Siempre Fuertes gana, ¿clasifican?" → calcula escenarios

- [ ] 5.13 Auto-refresh de bracket/posiciones cuando un match termina
- [ ] 5.14 Notificaciones push: "Final! Siempre Fuertes 45-38 Itagüí"

### Progreso: ░░░░░░░░░░░░░░░░░░░░ 0%

---

## Fase 6: Pagos de Inscripcion (Opcional por torneo)

### Objetivo
El organizador **decide** si cobra inscripcion online. Si activa pagos, los clubes pagan via Wompi/MercadoPago. Si no, se gestiona por fuera.

### Que ya existe
- Wompi y MercadoPago implementados y funcionando
- `PaymentGatewayFactory`, `PaymentService`, webhooks

### Backend

- [ ] 6.1 Crear modelo `PlaTournamentPayment`:
  - `tournament_id`
  - `registration_id` (FK tournament_registrations)
  - `amount`, `currency`
  - `gateway` (wompi, mercadopago, manual)
  - `external_reference`
  - `status` ENUM: `pending`, `approved`, `rejected`, `refunded`
  - `paid_at`, `paid_by`
  - `manual_note` (si fue pago manual: "Transferencia Bancolombia ref 123")
- [ ] 6.2 Migracion
- [ ] 6.3 Agregar a torneo: `registration_fee_enabled` (boolean), `registration_fee_amount`, `registration_fee_currency`
- [ ] 6.4 Crear `TournamentPaymentController`:
  - `POST /api/tournaments/{id}/registrations/{regId}/pay` — iniciar pago
  - `GET /api/tournaments/{id}/payments` — listar pagos (organizador)
  - `POST /api/tournaments/{id}/registrations/{regId}/mark-paid` — marcar como pagado manual
  - Webhook handlers
- [ ] 6.5 Auto-aprobar inscripcion cuando el pago se confirma (configurable)
- [ ] 6.6 Fee de Widdo: comision % sobre cada pago procesado (configurable por super_admin)

### Frontend

- [ ] 6.7 En inscripcion: si hay fee → pantalla de pago despues de inscribir
- [ ] 6.8 Tab "Pagos" del organizador:
  - Equipos con estado de pago (pagado, pendiente)
  - Marcar pago manual
  - Total recaudado
  - Comision Widdo vs neto organizador
- [ ] 6.9 Configuracion en wizard del torneo: activar/desactivar cobro, monto, moneda

### Progreso: ░░░░░░░░░░░░░░░░░░░░ 0%

---

## Fase 7: Estadisticas y Rankings

### Objetivo
Tabla de goleadores, MVPs, estadisticas por jugador y equipo, historicos.

### Backend

- [ ] 7.1 Crear modelo `PlaTournamentPlayerStat`:
  - `match_id`, `player_id`, `registration_id`
  - Campos universales: `goals`, `assists`, `yellow_cards`, `red_cards`, `minutes_played`
  - Campo flexible: `extra_stats` (JSON — para deportes variados: puntos, rebotes, aces, etc.)
- [ ] 7.2 Endpoints:
  - `GET /api/tournaments/{id}/stats/scorers` — tabla de goleadores
  - `GET /api/tournaments/{id}/stats/players/{playerId}` — stats del jugador
  - `GET /api/tournaments/{id}/stats/teams` — stats por equipo
  - `GET /api/public/tournaments/{slug}/stats` — stats publicas
- [ ] 7.3 Calculo automatico al registrar eventos de partido

### Frontend

- [ ] 7.4 Tab "Estadisticas" en detalle del torneo
- [ ] 7.5 Tabla de goleadores / mejores jugadores
- [ ] 7.6 Perfil de rendimiento por jugador
- [ ] 7.7 Stats por equipo
- [ ] 7.8 Stats en portal publico

### Progreso: ░░░░░░░░░░░░░░░░░░░░ 0%

---

## Fase 8: Mobile

### Objetivo
App movil para organizadores (centro de control desde la cancha), clubes (gestionar inscripcion) y espectadores (ver en vivo).

- [ ] 8.1 Dashboard organizador mobile
- [ ] 8.2 Centro de control mobile (actualizar marcadores en cancha) — **prioridad**
- [ ] 8.3 Bracket mobile-optimized
- [ ] 8.4 Push notifications de resultados
- [ ] 8.5 Inscripcion de club desde mobile
- [ ] 8.6 Vista publica de torneo en app

### Progreso: ░░░░░░░░░░░░░░░░░░░░ 0%

---

## Arquitectura Tecnica

### Controllers nuevos

```
saas_sport/app/Http/Controllers/
├── PlaTournamentController.php              ← YA EXISTE (gestion base del torneo)
├── OrganizerController.php                  ← NUEVO (Fase 0 — perfil organizador)
├── TournamentInvitationController.php       ← NUEVO (Fase 2 — invitar clubes)
├── TournamentRegistrationController.php     ← NUEVO (Fase 2 — inscripcion del club)
├── TournamentBracketController.php          ← NUEVO (Fase 3 — fixture/resultados)
├── PublicTournamentController.php           ← NUEVO (Fase 4 — portal publico)
├── TournamentPaymentController.php          ← NUEVO (Fase 6 — pagos)
```

### Modelos nuevos

```
saas_sport/app/Models/
├── PlaTournament.php                        ← EXTENDER (nuevos campos)
├── PlaOrganizer.php                         ← NUEVO (Fase 0)
├── PlaTournamentInvitation.php              ← NUEVO (Fase 2)
├── PlaTournamentRegistration.php            ← NUEVO (Fase 2)
├── PlaTournamentRound.php                   ← NUEVO (Fase 3)
├── PlaTournamentGroup.php                   ← NUEVO (Fase 3)
├── PlaTournamentGroupTeam.php               ← NUEVO (Fase 3)
├── PlaTournamentMatch.php                   ← NUEVO (Fase 3)
├── PlaTournamentStanding.php                ← NUEVO (Fase 3)
├── PlaTournamentMatchEvent.php              ← NUEVO (Fase 5)
├── PlaTournamentPayment.php                 ← NUEVO (Fase 6)
├── PlaTournamentPlayerStat.php              ← NUEVO (Fase 7)
```

### Services nuevos y refactorizados

```
saas_sport/app/Services/
├── AgentService.php                         ← REFACTORIZAR (antes ClubAssistantService — ahora generico)
├── ClubAssistantToolExecutor.php            ← YA EXISTE (11 tools read-only para clubs)
├── TournamentAgentToolExecutor.php          ← NUEVO (Fase 3 — 25+ tools read+write para torneos)
├── BracketGeneratorService.php              ← NUEVO (Fase 3 — motor de brackets)
├── MatchScoringService.php                  ← NUEVO (Fase 3 — reglas de puntuacion)
```

### Integracion con Widdo AI existente

```
                    AssistantChatBubble.jsx (MISMA burbuja)
                              │
                    POST /api/v1/assistant/chat
                    + context_type: 'club' | 'tournament'
                              │
                    AgentService (REFACTORIZADO, antes ClubAssistantService)
                    ├── buildSystemPrompt() → segun context_type
                    ├── getToolDefinitions() → segun context_type
                    └── resolveToolExecutor() → segun context_type
                              │
                ┌─────────────┴─────────────┐
                │                           │
    ClubAssistantToolExecutor    TournamentAgentToolExecutor
    (11 tools, READ-ONLY)       (25+ tools, READ + WRITE)
    ✅ YA EXISTE                ❌ NUEVO
                │                           │
        LLMProviderInterface         LLMProviderInterface
        (Anthropic / OpenAI)         (MISMO)
                │                           │
        AgentConversation            AgentConversation
        (MISMA tabla, campo           (context_type = 'tournament')
         context_type = 'club')
```

### Frontend — Paginas nuevas

```
frontend/src/
├── pages/
│   ├── dashboard/
│   │   ├── Organizer/                       ← NUEVO (Fase 0 — dashboard organizador)
│   │   ├── Tournaments/                     ← EXTENDER (tabs nuevos)
│   │   └── ClubTournaments/                 ← NUEVO (Fase 2 — torneos del club como participante)
│   └── public/
│       ├── TournamentPage.jsx               ← NUEVO (Fase 4 — /torneo/{slug})
│       ├── TournamentsDirectory.jsx          ← NUEVO (Fase 4 — /torneos)
│       └── TournamentRegistration.jsx        ← NUEVO (Fase 2 — /inscribirse/{slug})
├── components/tournaments/
│   ├── BracketView.jsx                      ← NUEVO (Fase 3 — solo visualizacion)
│   ├── GroupStageView.jsx                   ← NUEVO (Fase 3 — solo visualizacion)
│   ├── LeagueTableView.jsx                  ← NUEVO (Fase 3 — solo visualizacion)
│   ├── MatchCard.jsx                        ← NUEVO (Fase 3 — solo visualizacion)
│   ├── LiveScoreboard.jsx                   ← NUEVO (Fase 5 — marcador en vivo)
│   └── scoring/
│       ├── AdaptiveScorePanel.jsx           ← NUEVO (Fase 5 — lee SportConfig JSON)
│       ├── adapters/
│       │   ├── PointsAdapter.jsx            ← basquet, handball (+1, +2, +3)
│       │   ├── GoalsAdapter.jsx             ← fútbol, hockey (+1 gol)
│       │   ├── SetsGamesAdapter.jsx         ← tenis, pádel, volley (sets)
│       │   ├── RoundsPointsAdapter.jsx      ← artes marciales, boxeo (rounds)
│       │   └── TimesMarksAdapter.jsx        ← natación, atletismo (cronómetro)
│       └── PlayerQuickSelect.jsx            ← seleccion rápida de jugador
│
│   (AssistantChatBubble.jsx ya existe — se adapta para contexto tournament)
```

### Tablas nuevas (base de datos)

| Tabla | Fase | Proposito |
|-------|------|-----------|
| `pla_organizers` | 0 | Perfil de organizador |
| `pla_tournament_invitations` | 2 | Invitaciones a clubes |
| `pla_tournament_registrations` | 2 | Inscripciones de clubes al torneo |
| `pla_tournament_rounds` | 3 | Rondas/jornadas |
| `pla_tournament_groups` | 3 | Grupos (fase de grupos) |
| `pla_tournament_group_teams` | 3 | Equipos dentro de cada grupo |
| `pla_tournament_matches` | 3 | Partidos/enfrentamientos |
| `pla_tournament_standings` | 3 | Tablas de posiciones |
| `pla_tournament_match_events` | 5 | Bitacora en vivo (goles, tarjetas) |
| `pla_sport_scoring_configs` | 1 | Config JSON de scoring por deporte (motor genérico de planillas) |
| `pla_tournament_payments` | 6 | Pagos de inscripcion |
| `pla_tournament_player_stats` | 7 | Estadisticas por jugador |

### Campos nuevos en tabla existente `pla_club_teams_tournaments`

| Campo | Fase | Tipo |
|-------|------|------|
| `organizer_id` | 0 | BIGINT nullable FK |
| `club_id` | 0 | Cambia a nullable |
| `sport_id` | 1 | BIGINT FK |
| `tournament_type` | 1 | ENUM (team, individual, pair) |
| `competition_format` | 1 | ENUM (single_elimination, double_elimination, round_robin, groups_elimination, swiss, custom) |
| `max_teams` | 1 | INT |
| `min_teams` | 1 | INT |
| `players_per_team` | 1 | INT |
| `rules_url` | 1 | VARCHAR |
| `rules_text` | 1 | TEXT |
| `prizes` | 1 | JSON |
| `is_public` | 4 | BOOLEAN default true |
| `slug` | 4 | VARCHAR unique |
| `registration_fee_enabled` | 6 | BOOLEAN default false |
| `registration_fee_amount` | 6 | DECIMAL(12,2) |
| `registration_fee_currency` | 6 | VARCHAR(3) |
| `scoring_rules` | 3 | JSON (puntos por victoria/empate/derrota, criterios desempate) |

---

## Efecto de Red

```
Organizador crea torneo en Widdo
         │
         ├── Invita 20 clubes
         │       │
         │       ├── 8 ya estan en Widdo → participan directo
         │       │
         │       └── 12 no estan en Widdo → se registran (plan gratis)
         │               │
         │               └── 12 clubes nuevos en Widdo
         │                       │
         │                       ├── Usan Widdo gratis para el torneo
         │                       ├── Ven las funciones (pagos, asistencia, calendario...)
         │                       ├── Se enamoran → upgrade a plan pago
         │                       └── REVENUE RECURRENTE para Widdo Clubs
         │
         └── Torneo publico se comparte en redes
                 │
                 └── Mas clubes ven Widdo → mas inscripciones → mas torneos
```

**Cada torneo es un canal de adquisicion de clubes a costo $0.**
