# Widdo Tournaments — Análisis Detallado por Sub-Fases + Simulación

> **Generado:** 2026-03-03
> **Base:** `TOURNAMENTS.md` (plan original) + análisis del código existente
> **Estado actual:** ~40% del sistema base construido (CRUD torneo, categorías, jugadores, docs, staff)
> **Falta:** 100% de la ejecución del torneo (brackets, partidos, scoring, en vivo, pagos cross-club)

---

## Resumen del Estado Actual

### YA EXISTE (no hay que tocar)
| Componente | Qué hace |
|------------|----------|
| 7 modelos backend | PlaTournament, Category, Player, PlayerDocument, RequiredDocument, RequiredField, Staff |
| 1 controller (25 endpoints) | CRUD completo de torneos, categorías, jugadores, docs, staff, budget, export, notificaciones |
| 11 migraciones | Tablas de torneos con campos completos |
| 6 páginas frontend | Lista, detalle, formulario, wizard 7 pasos |
| 10 hooks React | Queries y mutations para todo el CRUD |
| Sistema de roles | 5 roles (owner, trainer, player, parent, accountant) con switcher |
| Context switcher | Cambio entre clubs/roles con limpieza de cache |
| AI Assistant | ~40 tools (25 read + 15 write) con ClubAssistantToolExecutor |
| Pagos (Wompi + MercadoPago) | Gateway factory, webhooks, suscripciones |
| WebSockets (Reverb) | Canales privados por club, eventos broadcast |

### FALTA CONSTRUIR
| Componente | Fase |
|------------|------|
| Rol Organizador + multi-rol | 0 |
| Multi-deporte + config scoring | 1 |
| Inscripción cross-club (club externo se inscribe) | 2 |
| Motor de brackets/grupos/liga | 3 |
| Agente IA de torneos (25+ tools) | 3 |
| Portal público sin login | 4 |
| Resultados en vivo + planillas digitales | 5 |
| Pagos de inscripción cross-club | 6 |
| Estadísticas y rankings | 7 |
| Mobile optimizado | 8 |

---

# FASE 0: ROL ORGANIZADOR (Multi-Rol)

**Objetivo:** Un usuario puede ser owner de club Y organizador de torneos. Contexto nuevo en el switcher.

## Sub-fase 0.A — Modelo y Base de Datos

| # | Tarea | Detalle |
|---|-------|---------|
| 0.A.1 | Migración `create_pla_organizers_table` | user_id (FK), organization_name, logo_path, description, website, phone, email_contact, city_id (FK), social_media (JSON), verified (bool), status (active/suspended), timestamps, soft_deletes |
| 0.A.2 | Modelo `PlaOrganizer` | Relaciones: belongsTo User, belongsTo BasCity, hasMany PlaTournament. Scopes: active(), verified() |
| 0.A.3 | Migración `alter_pla_tournaments_add_organizer` | Agregar `organizer_id` (FK nullable) a `pla_club_teams_tournaments`. Hacer `club_id` nullable (torneos del organizador NO pertenecen a un club) |
| 0.A.4 | Seed de rol `tournament_organizer` en `bas_roles` | Nombre: "Organizador de Torneos", descripción, status ACT |

**Archivos a crear/modificar:**
- `database/migrations/xxxx_create_pla_organizers_table.php` (NUEVO)
- `database/migrations/xxxx_add_organizer_to_tournaments.php` (NUEVO)
- `app/Models/PlaOrganizer.php` (NUEVO)
- `app/Models/PlaTournament.php` (MODIFICAR — agregar relación organizer)
- `database/seeders/RolesSeeder.php` (MODIFICAR)

## Sub-fase 0.B — Backend Auth y Contextos

| # | Tarea | Detalle |
|---|-------|---------|
| 0.B.1 | Adaptar tabla `user_club_roles` o crear `user_organizer_roles` | Opción A: Agregar role='organizer' en user_club_roles con club_id=NULL. Opción B: Tabla nueva `user_organizer_roles` (user_id, organizer_id, role, status). **Recomendado: Opción A** — reusar la tabla existente haciendo club_id nullable para organizers |
| 0.B.2 | Adaptar `AuthController@login` | Al cargar contextos, incluir contextos de organizer (role='organizer', club_id=null, organizer_id=X) |
| 0.B.3 | Adaptar `ContextController` | `GET /api/contexts` debe retornar contextos de organizer. `POST /api/contexts/switch` debe manejar contexto organizer |
| 0.B.4 | Endpoint de activación | `POST /api/organizer/activate` — usuario existente activa perfil de organizador (crea PlaOrganizer + user_club_role con role='organizer') |
| 0.B.5 | Adaptar `AuthController@register` | Opción nueva "Quiero organizar torneos" → crea user + PlaOrganizer + contexto organizer |

**Archivos a modificar:**
- `app/Http/Controllers/AuthController.php`
- `app/Http/Controllers/ContextController.php` (o similar)
- Migración para hacer club_id nullable en user_club_roles

## Sub-fase 0.C — Controller y Rutas del Organizador

| # | Tarea | Detalle |
|---|-------|---------|
| 0.C.1 | `OrganizerController` | CRUD de perfil: show, update, uploadLogo. Dashboard stats (mis torneos, inscripciones pendientes, pagos) |
| 0.C.2 | Middleware `OrganizerMiddleware` | Verifica que el usuario tiene contexto activo de organizer. Inyecta organizer_id en request |
| 0.C.3 | Policy `OrganizerPolicy` | Solo el usuario dueño del organizer puede editarlo |
| 0.C.4 | Rutas protegidas | Grupo `/api/organizer/*` con middleware organizer |

**Archivos a crear:**
- `app/Http/Controllers/OrganizerController.php` (NUEVO)
- `app/Http/Middleware/OrganizerMiddleware.php` (NUEVO)
- `app/Policies/OrganizerPolicy.php` (NUEVO)
- `routes/api.php` (MODIFICAR — agregar grupo organizer)

## Sub-fase 0.D — Frontend Contexto y Navegación

| # | Tarea | Detalle |
|---|-------|---------|
| 0.D.1 | Adaptar `UserContextProvider` | Manejar contextos con role='organizer'. Agregar ícono 🏆 y label "Organizador de Torneos" |
| 0.D.2 | Adaptar `ContextSwitcher` | Mostrar contexto organizer en el dropdown. Si no tiene perfil organizer, mostrar "Activar Organizador de Torneos" como opción |
| 0.D.3 | Mini-onboarding de organizador | Al activar por primera vez: nombre de organización, logo, contacto (3 pasos rápidos) |
| 0.D.4 | Adaptar `MenuList` | Nuevo `menuConfigByRole.organizer` con secciones: Dashboard, Mis Torneos, Crear Torneo, Inscripciones, Pagos |
| 0.D.5 | Guard `OrganizerGuard` | Protege rutas de organizador |
| 0.D.6 | Dashboard del organizador | Página nueva: resumen de torneos activos, inscripciones pendientes, pagos recibidos, próximos partidos |

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
| 0.E.1 | Adaptar flujo de registro frontend | Paso 0 nuevo: "¿Qué quieres hacer?" → "Gestionar mi club" / "Organizar torneos" / "Ambos" |
| 0.E.2 | Adaptar registro backend | Si tipo='organizer': crear user + PlaOrganizer + contexto. No crear club |
| 0.E.3 | Onboarding específico de organizador | Nombre organización, logo, deportes preferidos, ubicación |

**Total Fase 0: 20 tareas | ~3-4 días**

---

# FASE 1: TORNEO MULTI-DEPORTE

**Objetivo:** Soportar cualquier deporte con configuración de scoring genérica.

## Sub-fase 1.A — Catálogo de Deportes

| # | Tarea | Detalle |
|---|-------|---------|
| 1.A.1 | Verificar/crear tabla `bas_sports` | id, name, name_en, icon, sport_type (team/individual/pair), is_active. Si ya existe, verificar campos |
| 1.A.2 | Seeder con ~30 deportes | Ver catálogo completo abajo |
| 1.A.3 | Endpoint `GET /api/sports` | Lista de deportes activos (público, para el wizard) |
| 1.A.4 | Campo `sport_modality` en `bas_sports` | Para deportes con modalidades: natación (50m, 100m, 200m...), atletismo (100m, salto alto, jabalina...), gimnasia (suelo, barras, viga...) |

### Catálogo Completo de Deportes Soportados

#### Deportes de Conjunto (equipos)

| # | Deporte | sport_type | panel_type | Particularidades |
|---|---------|-----------|------------|-----------------|
| 1 | Fútbol | team | goals | 2 tiempos, goles, tarjetas, cambios, penales, tiempo extra |
| 2 | Fútbol sala / Futsal | team | goals | 2 tiempos de 20min, faltas acumulativas, 5 jugadores |
| 3 | Baloncesto | team | points | 4 cuartos, +1/+2/+3, faltas personales/técnicas, overtime |
| 4 | Voleibol | team | sets_games | 5 sets a 25pts (5° a 15), tiebreak a 24-24 |
| 5 | Handball / Balonmano | team | goals | 2 tiempos de 30min, goles frecuentes, 7 jugadores |
| 6 | Hockey (césped/sala) | team | goals | 2/4 periodos, goles, tarjetas verde/amarilla/roja |
| 7 | Rugby | team | points | 2 tiempos de 40min, try(5) + conversión(2) + penal(3) + drop(3) |
| 8 | Béisbol | team | innings | 9 innings, carreras por entrada, outs, hits |
| 9 | Softball | team | innings | 7 innings, similar a béisbol |
| 10 | Cricket | team | innings | Overs, runs, wickets (complejo, V2) |
| 11 | Water polo | team | goals | 4 periodos de 8min, goles |
| 12 | Fútbol americano / Flag | team | points | 4 cuartos, TD(6) + EP(1/2) + FG(3) + Safety(2) |
| 13 | Lacrosse | team | goals | 4 cuartos, goles |
| 14 | Ultimate frisbee | team | points | A 15 puntos, cap en tiempo |

#### Deportes Individuales 1v1

| # | Deporte | sport_type | panel_type | Particularidades |
|---|---------|-----------|------------|-----------------|
| 15 | Tenis | individual | sets_games | 3 o 5 sets, games, tiebreak a 6-6 |
| 16 | Pádel | pair | sets_games | 3 sets, golden point o ventaja |
| 17 | Badminton | individual | sets_games | 3 sets a 21pts |
| 18 | Tenis de mesa | individual | sets_games | 5 o 7 sets a 11pts |
| 19 | Squash | individual | sets_games | 5 sets a 11pts |
| 20 | Boxeo | individual | rounds_points | 3-12 rounds, puntos, KO, TKO, decisión |
| 21 | Judo | individual | rounds_points | Ippon (gana directo), Waza-ari, penalizaciones (shido) |
| 22 | Karate | individual | rounds_points | Yuko(1pt), Waza-ari(2pts), Ippon(3pts), 3 min |
| 23 | Taekwondo | individual | rounds_points | 3 rounds de 2min, puntos por técnica, spinning = +bonus |
| 24 | Esgrima | individual | points | A 5 o 15 toques, 3 periodos de 3min |
| 25 | Lucha | individual | rounds_points | 2 periodos de 3min, puntos por técnica |
| 26 | MMA / Artes marciales mixtas | individual | rounds_points | 3-5 rounds, KO/TKO/sumisión/decisión |

#### Deportes Individuales contra Tiempo/Marca

| # | Deporte | sport_type | panel_type | Particularidades |
|---|---------|-----------|------------|-----------------|
| 27 | Natación | individual | times_marks | Heats/series, tiempos por carril, clasificación por mejor tiempo. Modalidades: 50m, 100m, 200m, 400m, 800m, 1500m, relevos |
| 28 | Atletismo (pista) | individual | times_marks | Series, tiempos, viento (+/-). Modalidades: 100m, 200m, 400m, 800m, 1500m, 5000m, vallas, relevos |
| 29 | Atletismo (campo) | individual | times_marks | 3-6 intentos, mejor marca. Modalidades: salto largo, salto alto, triple salto, lanzamiento de disco/jabalina/bala/martillo |
| 30 | Ciclismo | individual | times_marks | Etapas o contrarreloj, tiempos, clasificación general |
| 31 | Patinaje velocidad | individual | times_marks | Series, tiempos, clasificación |

#### Deportes con Puntaje de Jueces

| # | Deporte | sport_type | panel_type | Particularidades |
|---|---------|-----------|------------|-----------------|
| 32 | Gimnasia artística | individual | judges | Dificultad + ejecución, panel de jueces (3-6), nota final. Aparatos: suelo, barras, viga, salto, anillas, caballo |
| 33 | Gimnasia rítmica | individual | judges | Dificultad + artístico, aparatos: aro, pelota, cinta, mazas |
| 34 | Patinaje artístico | individual | judges | Score técnico + artístico, panel de jueces |
| 35 | Clavados / Saltos ornamentales | individual | judges | Grado de dificultad × promedio de jueces |
| 36 | Surf | individual | judges | 2 mejores olas de N intentos, panel de jueces |
| 37 | Skateboarding | individual | judges | Runs + best trick, panel de jueces |
| 38 | Breakdance | individual | judges | Battles 1v1, panel de jueces |

#### Deportes en Parejas

| # | Deporte | sport_type | panel_type | Particularidades |
|---|---------|-----------|------------|-----------------|
| 39 | Tenis dobles | pair | sets_games | Igual que singles, 2v2 |
| 40 | Badminton dobles | pair | sets_games | 2v2, 3 sets a 21 |
| 41 | Beach volley | pair | sets_games | 3 sets a 21 (3° a 15) |
| 42 | Pádel (ya listado arriba) | pair | sets_games | Siempre 2v2 |

**Total: 42 deportes soportados de base.** La IA puede generar config para cualquier deporte nuevo sin código.

## Sub-fase 1.B — Campos Nuevos en Torneo

| # | Tarea | Detalle |
|---|-------|---------|
| 1.B.1 | Migración `add_sport_fields_to_tournaments` | sport_id (FK), tournament_type ENUM('team','individual','pair'), competition_format ENUM('single_elimination','double_elimination','round_robin','groups_elimination','swiss','custom'), max_teams, min_teams, players_per_team, rules_url, rules_text, prizes (JSON), scoring_rules (JSON) |
| 1.B.2 | Actualizar modelo `PlaTournament` | Relación belongsTo BasSport, casts para JSON, accessors |
| 1.B.3 | Actualizar `PlaTournamentController@store/update` | Validar nuevos campos |
| 1.B.4 | Adaptar categorías | Para individuales: min/max_participants en vez de equipos. Para parejas: jugadores por pareja = 2 |

## Sub-fase 1.C — Motor de Scoring por Deporte (Config JSON)

| # | Tarea | Detalle |
|---|-------|---------|
| 1.C.1 | Migración `create_pla_sport_scoring_configs` | sport_id, config (JSON), panel_type ENUM('points','goals','sets_games','rounds_points','times_marks','innings','judges'), is_default (bool), created_by (nullable — null=sistema), name, description |
| 1.C.2 | Modelo `PlaSportScoringConfig` | Relación belongsTo BasSport |
| 1.C.3 | `SportConfigSeeder` con configs predefinidos para los 42 deportes | JSON con match_structure, scoring_events, scoring_rules. Se agrupan por panel_type — muchos deportes comparten estructura base |
| 1.C.4 | Endpoint `GET /api/sports/{id}/scoring-config` | Retorna config predefinida del deporte |
| 1.C.5 | Tool del agente IA: `configure_sport_scoring` | Genera o modifica config JSON para deportes nuevos o variantes personalizadas. El organizador describe las reglas en español, la IA genera el JSON |

### Configs JSON por tipo de panel (7 tipos)

#### 1. Panel `goals` — Fútbol, futsal, hockey, handball, water polo, lacrosse
```json
{
  "match_structure": {
    "periods": 2,
    "period_duration": 45,
    "half_time": 15,
    "extra_time": true,
    "extra_time_periods": 2,
    "extra_time_duration": 15,
    "penalties": true
  },
  "scoring_events": [
    { "type": "goal", "points": 1, "icon": "⚽", "label": "Gol", "requires_player": true },
    { "type": "own_goal", "points": 1, "icon": "⚽🔴", "label": "Autogol", "for_opponent": true, "requires_player": true },
    { "type": "penalty_goal", "points": 1, "icon": "⚽🎯", "label": "Penal", "requires_player": true },
    { "type": "yellow_card", "points": 0, "icon": "🟡", "label": "Amarilla", "requires_player": true, "accumulates": true, "max": 2 },
    { "type": "red_card", "points": 0, "icon": "🔴", "label": "Roja", "requires_player": true, "ejects": true },
    { "type": "substitution", "points": 0, "icon": "🔄", "label": "Cambio", "requires_player_in": true, "requires_player_out": true }
  ],
  "scoring_rules": {
    "win_points": 3,
    "draw_points": 1,
    "loss_points": 0,
    "tiebreakers": ["goal_difference", "goals_for", "head_to_head", "fair_play"],
    "walkover_score": "3-0"
  }
}
```

#### 2. Panel `points` — Baloncesto, fútbol americano, ultimate frisbee

```json
{
  "match_structure": {
    "periods": 4,
    "period_duration": 10,
    "period_name": "Cuarto",
    "half_time_after": 2,
    "half_time": 15,
    "overtime": true,
    "overtime_duration": 5,
    "overtime_unlimited": true
  },
  "scoring_events": [
    { "type": "free_throw", "points": 1, "icon": "🏀", "label": "+1", "requires_player": true },
    { "type": "field_goal_2", "points": 2, "icon": "🏀", "label": "+2", "requires_player": true },
    { "type": "field_goal_3", "points": 3, "icon": "🏀", "label": "+3", "requires_player": true },
    { "type": "personal_foul", "points": 0, "icon": "🤚", "label": "Falta", "requires_player": true, "accumulates": true, "max": 5, "ejects_at_max": true },
    { "type": "technical_foul", "points": 0, "icon": "🔴", "label": "Técnica", "requires_player": true },
    { "type": "timeout", "points": 0, "icon": "⏸️", "label": "Tiempo muerto", "per_team": true }
  ],
  "scoring_rules": {
    "win_points": 2,
    "loss_points": 1,
    "draw_points": 0,
    "allows_draw": false,
    "tiebreakers": ["head_to_head", "point_difference", "points_for"],
    "walkover_score": "20-0"
  }
}
```

#### 3. Panel `sets_games` — Tenis, pádel, volley, badminton, tenis de mesa

```json
{
  "match_structure": {
    "type": "sets",
    "max_sets": 3,
    "points_per_set": 6,
    "tiebreak_at": "6-6",
    "tiebreak_points": 7,
    "tiebreak_min_diff": 2,
    "deuce_rule": "advantage",
    "final_set_tiebreak": true,
    "final_set_tiebreak_points": 10,
    "point_sequence": ["0", "15", "30", "40", "AD"]
  },
  "scoring_events": [
    { "type": "ace", "icon": "💨", "label": "Ace", "requires_player": true },
    { "type": "double_fault", "icon": "❌", "label": "Doble falta", "requires_player": true },
    { "type": "winner", "icon": "🎯", "label": "Winner", "requires_player": true },
    { "type": "point", "icon": "✅", "label": "Punto" }
  ],
  "scoring_rules": {
    "win_by": "sets_won",
    "sets_to_win": 2
  }
}
```

**Variante voleibol:**
```json
{
  "match_structure": {
    "type": "sets",
    "max_sets": 5,
    "points_per_set": 25,
    "final_set_points": 15,
    "min_difference": 2,
    "point_sequence": "numeric"
  },
  "scoring_events": [
    { "type": "point", "icon": "🏐", "label": "Punto" },
    { "type": "timeout", "icon": "⏸️", "label": "Tiempo", "per_team": true, "max_per_set": 2 },
    { "type": "substitution", "icon": "🔄", "label": "Cambio", "max_per_set": 6 }
  ]
}
```

#### 4. Panel `rounds_points` — Judo, karate, taekwondo, boxeo, MMA, lucha, esgrima

```json
{
  "match_structure": {
    "rounds": 3,
    "round_duration": 120,
    "rest_between": 60,
    "early_finish": ["ippon", "knockout", "submission"]
  },
  "scoring_events": [
    { "type": "ippon", "points": 10, "icon": "🥇", "label": "Ippon", "ends_match": true, "requires_player": true },
    { "type": "waza_ari", "points": 7, "icon": "🥈", "label": "Waza-ari", "requires_player": true, "two_equals_ippon": true },
    { "type": "shido", "points": 0, "icon": "🟡", "label": "Shido (penalización)", "requires_player": true, "accumulates": true, "max": 3, "third_is_hansoku": true }
  ],
  "scoring_rules": {
    "win_by": "ippon_or_most_points",
    "tiebreak": "golden_score"
  }
}
```

**Variante boxeo:**
```json
{
  "match_structure": {
    "rounds": 3,
    "round_duration": 180,
    "rest_between": 60,
    "early_finish": ["knockout", "tko", "rscd"]
  },
  "scoring_events": [
    { "type": "punch", "points": 1, "icon": "🥊", "label": "Golpe", "requires_player": true },
    { "type": "knockdown", "points": 0, "icon": "⬇️", "label": "Knockdown", "requires_player": true, "triggers_count": true },
    { "type": "standing_count", "points": 0, "icon": "8️⃣", "label": "Conteo de 8" },
    { "type": "warning", "points": 0, "icon": "⚠️", "label": "Advertencia", "accumulates": true }
  ],
  "scoring_rules": {
    "win_by": "knockout_or_judges_decision",
    "judges": 3,
    "ten_point_must": true
  }
}
```

#### 5. Panel `times_marks` — Natación, atletismo, ciclismo, patinaje velocidad

```json
{
  "match_structure": {
    "type": "heats",
    "lanes": 6,
    "rounds": ["heats", "semifinals", "final"],
    "qualify_per_heat": 2,
    "qualify_by_time": 2,
    "measurement": "time",
    "precision": "hundredths"
  },
  "scoring_events": [
    { "type": "finish", "icon": "🏁", "label": "Llegada", "requires_time": true },
    { "type": "dns", "icon": "🚫", "label": "No Presentado" },
    { "type": "dnf", "icon": "❌", "label": "No Finalizó" },
    { "type": "dq", "icon": "🔴", "label": "Descalificado", "requires_reason": true },
    { "type": "personal_best", "icon": "⭐", "label": "Marca Personal", "auto_detect": true },
    { "type": "tournament_record", "icon": "🏆", "label": "Récord del Torneo", "auto_detect": true }
  ],
  "scoring_rules": {
    "rank_by": "best_time",
    "lower_is_better": true
  }
}
```

**Variante atletismo campo (salto/lanzamiento):**
```json
{
  "match_structure": {
    "type": "attempts",
    "max_attempts": 6,
    "qualify_attempts": 3,
    "final_attempts": 3,
    "measurement": "distance",
    "precision": "centimeters",
    "wind_tracking": true
  },
  "scoring_events": [
    { "type": "valid_attempt", "icon": "✅", "label": "Válido", "requires_mark": true },
    { "type": "foul", "icon": "❌", "label": "Nulo" },
    { "type": "pass", "icon": "⏭️", "label": "Pasa" }
  ],
  "scoring_rules": {
    "rank_by": "best_mark",
    "higher_is_better": true
  }
}
```

#### 6. Panel `innings` — Béisbol, softball

```json
{
  "match_structure": {
    "innings": 9,
    "half_innings": true,
    "outs_per_half": 3,
    "extra_innings": true,
    "mercy_rule": { "after_inning": 5, "run_difference": 10 }
  },
  "scoring_events": [
    { "type": "run", "points": 1, "icon": "🏃", "label": "Carrera", "requires_player": true },
    { "type": "hit", "icon": "🏏", "label": "Hit", "subtypes": ["single", "double", "triple", "home_run"] },
    { "type": "home_run", "icon": "💣", "label": "Home Run", "requires_player": true, "scores_all_on_base": true },
    { "type": "strikeout", "icon": "K", "label": "Strikeout" },
    { "type": "walk", "icon": "🚶", "label": "Base por bolas" },
    { "type": "out", "icon": "👎", "label": "Out", "subtypes": ["fly_out", "ground_out", "line_out", "caught_stealing"] },
    { "type": "error", "icon": "⚠️", "label": "Error" }
  ],
  "scoring_rules": {
    "win_by": "most_runs",
    "allows_draw": false
  }
}
```

#### 7. Panel `judges` — Gimnasia, patinaje artístico, clavados, surf, skateboarding

```json
{
  "match_structure": {
    "type": "routines",
    "rounds": 1,
    "apparatuses": ["floor", "vault", "bars", "beam"],
    "routines_per_apparatus": 1
  },
  "scoring_events": [
    { "type": "difficulty_score", "icon": "📊", "label": "Dificultad (D)", "range": [0, 10], "precision": 1 },
    { "type": "execution_score", "icon": "🎯", "label": "Ejecución (E)", "range": [0, 10], "precision": 3, "judges": 6, "drop_highest": 1, "drop_lowest": 1 },
    { "type": "penalty", "icon": "⬇️", "label": "Penalización", "range": [0, 2], "precision": 1 },
    { "type": "final_score", "icon": "🏆", "label": "Nota Final", "formula": "D + E - penalty", "auto_calculate": true }
  ],
  "scoring_rules": {
    "rank_by": "final_score",
    "higher_is_better": true,
    "all_around": { "sum_all_apparatuses": true }
  }
}
```

**Variante clavados:**
```json
{
  "match_structure": {
    "type": "dives",
    "rounds": 6,
    "dives_per_round": 1
  },
  "scoring_events": [
    { "type": "difficulty_degree", "icon": "📊", "label": "Grado dificultad (DD)", "range": [1.0, 4.1], "precision": 1, "fixed_per_dive": true },
    { "type": "judge_score", "icon": "🎯", "label": "Nota juez", "range": [0, 10], "precision": 2, "judges": 7, "drop_highest": 2, "drop_lowest": 2 },
    { "type": "dive_score", "icon": "🏊", "label": "Puntuación", "formula": "sum(middle_3_judges) * DD", "auto_calculate": true }
  ],
  "scoring_rules": {
    "rank_by": "total_score",
    "total": "sum_all_dives",
    "higher_is_better": true
  }
}
```

### Resumen de panel_types

| panel_type | Deportes | Complejidad | Prioridad |
|-----------|----------|-------------|-----------|
| `goals` | Fútbol, futsal, hockey, handball, water polo, lacrosse | Fácil | P0 (MVP) |
| `points` | Basquet, rugby, fútbol americano, ultimate | Fácil | P0 (MVP) |
| `sets_games` | Tenis, pádel, volley, badminton, tenis de mesa, squash, beach volley | Media | P1 |
| `rounds_points` | Judo, karate, taekwondo, boxeo, MMA, lucha, esgrima | Media | P1 |
| `times_marks` | Natación, atletismo, ciclismo, patinaje velocidad | Media | P2 |
| `innings` | Béisbol, softball | Media | P2 |
| `judges` | Gimnasia, patinaje artístico, clavados, surf, skateboarding, breakdance | Alta | P3 (V2) |

**Prioridad de implementación:**
- **P0 (MVP):** `goals` + `points` — cubren fútbol, basquet (80% de los torneos en LATAM)
- **P1:** `sets_games` + `rounds_points` — tenis, volley, artes marciales
- **P2:** `times_marks` + `innings` — natación, atletismo, béisbol
- **P3 (V2):** `judges` — gimnasia, clavados (requiere UI compleja con panel de jueces)

## Sub-fase 1.D — Frontend Wizard Adaptado

| # | Tarea | Detalle |
|---|-------|---------|
| 1.D.1 | Paso "Deporte y Tipo" en wizard | Selector de deporte (con búsqueda e íconos), tipo (equipo/individual/pareja), formato de competencia |
| 1.D.2 | Adaptar paso de categorías | Si individual: "Máx participantes" en vez de "Máx equipos". Si pareja: "Máx parejas" |
| 1.D.3 | Paso de premios | UI para configurar premios por posición (1°, 2°, 3°) con texto libre y monto |
| 1.D.4 | Paso de reglamento | Upload de PDF o texto libre |

**Total Fase 1: 15 tareas | ~2-3 días**

---

# FASE 2: INSCRIPCIÓN CROSS-CLUB

**Objetivo:** El organizador invita clubes. Los clubes gestionan su propia inscripción. Clubes externos se registran en Widdo.

## Sub-fase 2.A — Modelo de Invitaciones

| # | Tarea | Detalle |
|---|-------|---------|
| 2.A.1 | Migración `create_pla_tournament_invitations` | tournament_id, club_id (nullable), invited_email, invited_club_name, token (unique), status ENUM('pending','accepted','declined','expired'), sent_at, accepted_at, declined_at, sent_by, message, expires_at |
| 2.A.2 | Modelo `PlaTournamentInvitation` | Relaciones, scopes (pending, expired), método generateToken() |
| 2.A.3 | `TournamentInvitationController` | Endpoints del organizador: enviar, enviar masivo, listar, cancelar, reenviar |

**Endpoints:**
```
POST   /api/tournaments/{id}/invitations              — Enviar invitación
POST   /api/tournaments/{id}/invitations/bulk          — Enviar masivo
GET    /api/tournaments/{id}/invitations               — Listar invitaciones
DELETE /api/tournaments/{id}/invitations/{invId}        — Cancelar
POST   /api/tournaments/{id}/invitations/{invId}/resend — Reenviar
```

## Sub-fase 2.B — Modelo de Inscripciones (Registration)

| # | Tarea | Detalle |
|---|-------|---------|
| 2.B.1 | Migración `create_pla_tournament_registrations` | tournament_id, tournament_category_id, club_id, invitation_id (nullable), team_name, status ENUM('pending','approved','rejected','withdrawn','waitlisted'), registration_fee_paid (bool), payment_reference, registered_by, approved_by, approved_at, notes, waitlist_position (nullable) |
| 2.B.2 | Modelo `PlaTournamentRegistration` | Relaciones: belongsTo Tournament/Category/Club/Invitation. hasMany TournamentPlayers (jugadores asignados por el club) |
| 2.B.3 | Adaptar `PlaTournamentPlayer` | Agregar `tournament_registration_id` (FK) — vínculo con la inscripción del club |

## Sub-fase 2.C — Controller del Organizador (Gestión de Inscripciones)

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
| 2.D.1 | Endpoints de inscripción del club | Info pública del torneo, inscribir mi club, asignar MIS jugadores, quitar jugador, ver elegibles, retirar inscripción |

**Endpoints del club:**
```
GET    /api/tournaments/{id}/registration-info                         — Info pública
POST   /api/tournaments/{id}/register                                  — Inscribir mi club
POST   /api/tournaments/{id}/registrations/{regId}/players             — Asignar mis jugadores
DELETE /api/tournaments/{id}/registrations/{regId}/players/{playerId}  — Quitar jugador
GET    /api/tournaments/{id}/registrations/{regId}/eligible-players    — Mis jugadores elegibles
DELETE /api/tournaments/{id}/registrations/{regId}                     — Retirar inscripción
```

**Lógica de elegibilidad:**
```
Para cada jugador del club:
  ✓ Está activo en el club
  ✓ Su edad cae dentro del rango de la categoría (o es younger/older permitido)
  ✓ Su género coincide con la categoría
  ✓ No está inscrito en otra categoría del mismo torneo (o sí, si el torneo lo permite)
  ✓ Tiene documentos requeridos del torneo completos (o se suben después)
```

## Sub-fase 2.E — Flujo de Club Externo (URL Pública)

| # | Tarea | Detalle |
|---|-------|---------|
| 2.E.1 | Endpoint público `GET /api/public/tournaments/{token}` | Ver torneo por token de invitación (sin auth) |
| 2.E.2 | Flujo de registro simplificado | Club externo llega por URL → ve info del torneo → "Inscribir mi equipo" → Si no tiene cuenta: registro rápido → crea user + club (plan gratis) → onboarding mínimo → agrega jugadores → se inscribe |
| 2.E.3 | URL pública general `/inscribirse/{slug}` | Cualquiera ve el torneo y puede inscribirse (con o sin invitación) |

## Sub-fase 2.F — Notificaciones

| # | Tarea | Detalle |
|---|-------|---------|
| 2.F.1 | Email al club: invitación recibida | Asunto: "Te invitaron al torneo X". Incluye link de aceptación |
| 2.F.2 | Email al organizador: club aceptó/rechazó | "Club Y aceptó la invitación al torneo X" |
| 2.F.3 | Email al organizador: inscripción nueva (URL pública) | "Club Z se inscribió vía link público" |
| 2.F.4 | Email al club: inscripción aprobada/rechazada | "Tu inscripción al torneo X fue aprobada" |
| 2.F.5 | Email recordatorio: documentos pendientes | "Faltan documentos de 3 jugadores para completar tu inscripción" |
| 2.F.6 | Email recordatorio: pago pendiente | "Tu pago de inscripción está pendiente" |

## Sub-fase 2.G — Frontend Vista Organizador

| # | Tarea | Detalle |
|---|-------|---------|
| 2.G.1 | Tab "Invitaciones" en detalle del torneo | Buscar clubes Widdo, invitar por email, estado de invitaciones, reenviar, copiar link |
| 2.G.2 | Tab "Inscripciones" en detalle del torneo | Lista de clubes inscritos por categoría, estado, ver plantilla, aprobar/rechazar, compartir link público |
| 2.G.3 | Resumen visual de inscripciones | Barra de progreso por categoría: "Sub-15 Masc: 18/24 equipos (6 disponibles)" |

## Sub-fase 2.H — Frontend Vista Club

| # | Tarea | Detalle |
|---|-------|---------|
| 2.H.1 | Sección "Invitaciones a Torneos" en dashboard del club | Lista de invitaciones pendientes con info del torneo |
| 2.H.2 | Flujo de inscripción del club | Seleccionar categoría → filtrar y seleccionar jugadores elegibles → confirmar → ir a pago (si aplica) |
| 2.H.3 | Sección "Mis Torneos" en dashboard del club | Torneos donde el club está inscrito con estado |
| 2.H.4 | Página pública de inscripción `/inscribirse/{slug}` | Info del torneo, categorías, si logueado → inscripción rápida, si no → registro |

**Total Fase 2: 25 tareas | ~5-7 días**

---

# FASE 3: FORMATOS DE COMPETENCIA (Motor de Brackets)

**Objetivo:** Motor completo de brackets, grupos, liga. El corazón del sistema de torneos.

## Sub-fase 3.A — Tablas de Competencia (DB)

| # | Tarea | Detalle |
|---|-------|---------|
| 3.A.1 | Migración `create_pla_tournament_rounds` | tournament_id, tournament_category_id, round_number, round_name, round_type ENUM('group_stage','elimination','final','third_place','consolation','round_robin','repechage'), status ENUM('pending','in_progress','completed'), start_date, end_date |
| 3.A.2 | Migración `create_pla_tournament_groups` | tournament_id, tournament_category_id, name ("Grupo A"), teams_qualify (cuántos avanzan) |
| 3.A.3 | Migración `create_pla_tournament_group_teams` | group_id, registration_id (FK), seed_number (nullable — para seeding) |
| 3.A.4 | Migración `create_pla_tournament_matches` | tournament_id, round_id, group_id (nullable), match_number, home_registration_id/away_registration_id (nullable para BYE), home_player_id/away_player_id (individuales), home_score/away_score, home_sets/away_sets (JSON), home_penalty_score/away_penalty_score, winner_registration_id/winner_player_id, status ENUM('scheduled','in_progress','completed','postponed','cancelled','walkover','suspended'), venue, scheduled_at, started_at, ended_at, referee, notes, next_match_id, next_match_position ENUM('home','away'), scoring_config_id (FK nullable) |
| 3.A.5 | Migración `create_pla_tournament_standings` | tournament_id, tournament_category_id, group_id (nullable), registration_id/player_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, sets_won, sets_lost, points_for, points_against, points, position, bonus_points |
| 3.A.6 | Modelos para las 5 tablas | Con relaciones, scopes, accessors |

## Sub-fase 3.B — Servicio de Generación de Brackets

| # | Tarea | Detalle |
|---|-------|---------|
| 3.B.1 | `BracketGeneratorService` | Clase con métodos estáticos o inyectable |
| 3.B.2 | `generateSingleElimination(category, registrations, seeded?)` | Genera bracket de eliminación directa. Maneja BYEs si no es potencia de 2. Seeding opcional (mejores vs peores) |
| 3.B.3 | `generateDoubleElimination(category, registrations)` | Winners bracket + losers bracket + gran final |
| 3.B.4 | `generateGroupStage(category, registrations, groupCount, teamsQualify)` | Sorteo aleatorio o con seeding (cabezas de serie en grupos diferentes). Genera fixture round-robin dentro de cada grupo |
| 3.B.5 | `generateRoundRobin(category, registrations)` | Todos contra todos (ida o ida+vuelta). Algoritmo de Berger para fixture balanceado |
| 3.B.6 | `generateSwiss(category, registrations, rounds)` | Sistema suizo: emparejar por puntos similares cada ronda |
| 3.B.7 | `advanceWinner(match)` | Al finalizar un match en eliminación, mover ganador al next_match. Si es final, marcar campeón |
| 3.B.8 | `calculateStandings(category, groupId?)` | Recalcular tabla de posiciones completa aplicando reglas de puntuación del torneo |
| 3.B.9 | `advanceFromGroups(category)` | Clasificar equipos de fase de grupos a fase de eliminación. Crear matches de la siguiente ronda |
| 3.B.10 | Manejo de BYEs | Si hay 24 equipos en eliminación directa → 8 BYEs (32 - 24). Ronda 1: 16 partidos, 8 con BYE (clasificación directa). Ronda 2: 16 equipos |

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
| 3.C.1 | `MatchScoringService` | Reglas de puntuación configurables |
| 3.C.2 | Actualizar marcador | Recibir score, validar, guardar, recalcular standings si es fase de grupos |
| 3.C.3 | Criterios de desempate | Configurable: diferencia de gol → goles a favor → enfrentamiento directo → fair play → sorteo |
| 3.C.4 | Walkover | Marcar W.O. con score configurable (3-0 fútbol, 20-0 basquet) |
| 3.C.5 | Soporte para sets | Tenis/volley: guardar sets individuales, calcular ganador por sets ganados |
| 3.C.6 | Soporte para penales/overtime | Fútbol: guardar resultado regular + penales. Basquet: overtime(s) |

## Sub-fase 3.D — Controller de Brackets

| # | Tarea | Detalle |
|---|-------|---------|
| 3.D.1 | `TournamentBracketController` | Todos los endpoints de generación, consulta y actualización |

**Endpoints:**
```
# Generación
POST   /api/tournaments/{id}/categories/{catId}/generate-bracket    — Generar fixture
POST   /api/tournaments/{id}/categories/{catId}/advance-from-groups — Clasificar de grupos a eliminación
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
| 3.E.2 | Refactorizar `ClubAssistantService` → `AgentService` | Constructor recibe ToolExecutor según contexto. System prompt según contexto. Mismo flujo de chat |
| 3.E.3 | System prompt de torneos | Contexto: datos del torneo activo, categorías, inscripciones, estado del bracket. Instrucciones de cómo manejar cada situación |
| 3.E.4 | Definir tools (30+) | generate_bracket, update_score, walkover, disqualify_team, move_team_group, postpone_match, start_match, end_match, calculate_standings, advance_from_groups, send_notification, get_standings, get_bracket, get_matches, configure_sport_scoring, **register_match_result** (ingreso manual retroactivo), **register_match_events** (goles/tarjetas después del hecho), **suspend_match** (guardar parcial), **resume_match** (reanudar suspendido), **sync_offline_events** (procesar cola offline), etc. |
| 3.E.5 | Confirmaciones para acciones write | El agente devuelve preview + botón "Confirmar" antes de ejecutar acciones destructivas |
| 3.E.6 | Historial de acciones | Log de cada instrucción del organizador + qué ejecutó el agente. Timeline exportable |
| 3.E.7 | Adaptar `AgentConversation` | Campo `context_type` ENUM('club','tournament'). Filtrar conversaciones por contexto |

## Sub-fase 3.F — Frontend Visualización de Brackets

| # | Tarea | Detalle |
|---|-------|---------|
| 3.F.1 | `BracketView.jsx` | Árbol de eliminación (cuartos → semis → final). Responsive. Colores por estado. Solo lectura |
| 3.F.2 | `GroupStageView.jsx` | Tabla de posiciones por grupo (PJ, PG, PE, PP, GF, GC, DG, Pts). Fixture por grupo. Zona de clasificación (verde/roja) |
| 3.F.3 | `LeagueTableView.jsx` | Tabla global formato liga |
| 3.F.4 | `MatchCard.jsx` | Escudos + nombres, marcador, fecha/hora/cancha, estado, para sets: mostrar individuales |
| 3.F.5 | Tab "Fixture" en detalle del torneo | Vista bracket/grupos/liga. Calendario de partidos. Chat IA flotante |
| 3.F.6 | Adaptar `AssistantChatBubble.jsx` | Detectar contexto tournament. Sugerencias rápidas cambian. UI de confirmación para writes |

**Total Fase 3: 30 tareas | ~8-12 días** (la fase más grande)

---

# FASE 4: PORTAL PÚBLICO

**Objetivo:** Páginas accesibles sin login. SEO. Compartir en redes.

## Sub-fase 4.A — Backend Público

| # | Tarea | Detalle |
|---|-------|---------|
| 4.A.1 | `PublicTournamentController` (sin auth) | Directorio, detalle, bracket, standings, matches, teams |
| 4.A.2 | Agregar `is_public` y `slug` a torneos | Migración + generación automática de slug |
| 4.A.3 | SEO meta tags | Open Graph por torneo (título, descripción, imagen del flyer) |
| 4.A.4 | Cache de consultas públicas | Cache de 60s para standings y bracket (alto tráfico durante partidos en vivo) |

**Endpoints públicos (sin auth):**
```
GET /api/public/tournaments                          — Directorio
GET /api/public/tournaments/{slug}                   — Detalle
GET /api/public/tournaments/{slug}/bracket/{catId}   — Bracket
GET /api/public/tournaments/{slug}/standings/{catId}  — Posiciones
GET /api/public/tournaments/{slug}/matches            — Partidos (filtros)
GET /api/public/tournaments/{slug}/teams              — Equipos
```

## Sub-fase 4.B — Frontend Público

| # | Tarea | Detalle |
|---|-------|---------|
| 4.B.1 | `/torneo/{slug}` — Página del torneo | Hero con flyer, info, categorías, bracket/posiciones, equipos, partidos, CTA inscripción, compartir |
| 4.B.2 | `/torneos` — Directorio público | Grid de torneos, filtros (deporte, ciudad, fecha, estado), búsqueda |
| 4.B.3 | `/torneo/{slug}/categoria/{catId}` | Bracket o posiciones de una categoría específica |
| 4.B.4 | Widget embebible (iframe) | Código para que organizadores pongan bracket en su web |
| 4.B.5 | Compartir en redes | Botones WhatsApp, Instagram, Facebook, X. Preview con Open Graph |

**Total Fase 4: 9 tareas | ~2-3 días**

---

# FASE 5: RESULTADOS EN VIVO

**Objetivo:** Marcadores en tiempo real + planillas digitales genéricas.

## Sub-fase 5.A — WebSockets Backend

| # | Tarea | Detalle |
|---|-------|---------|
| 5.A.1 | Canal público `tournament.{tournamentId}` | Sin auth — cualquiera escucha |
| 5.A.2 | Eventos broadcast | MatchStarted, ScoreUpdated, MatchEnded, StandingsUpdated, BracketAdvanced, MatchEventRegistered |
| 5.A.3 | Disparar eventos al actualizar score | En TournamentBracketController, después de cada PATCH /score |
| 5.A.4 | Bitácora de eventos (`pla_tournament_match_events`) | match_id, event_type, minute, player_id, registration_id, description, created_by |

## Sub-fase 5.B — Planilla Digital Genérica (Motor de Scoring)

| # | Tarea | Detalle |
|---|-------|---------|
| 5.B.1 | `AdaptiveScorePanel.jsx` (componente principal) | Lee SportConfig JSON del torneo y renderiza la UI de scoring adaptada al deporte |
| 5.B.2 | Adaptador `GoalsAdapter.jsx` | Fútbol, hockey, futsal. Botón +1 gol por equipo. Registro de goleador. Tarjetas. Cambios |
| 5.B.3 | Adaptador `PointsAdapter.jsx` | Basquet, handball. Botones +1, +2, +3. Faltas personales/técnicas |
| 5.B.4 | Adaptador `SetsGamesAdapter.jsx` | Tenis, pádel, volley. Sets con puntos dentro. Tiebreak |
| 5.B.5 | Adaptador `RoundsPointsAdapter.jsx` | Artes marciales, boxeo. Rounds con puntos/técnicas |
| 5.B.6 | Adaptador `TimesMarksAdapter.jsx` | Natación, atletismo. Cronómetro, marcas, heats, series/carriles |
| 5.B.7 | Adaptador `InningsAdapter.jsx` | Béisbol, softball. Entradas, carreras, outs, hits, cambio de turno |
| 5.B.8 | Adaptador `JudgesAdapter.jsx` | Gimnasia, clavados, surf. Panel de N jueces, dificultad, cálculo automático. Prioridad P3 (V2) |
| 5.B.9 | `PlayerQuickSelect.jsx` | Al registrar evento, selección rápida del jugador (tap en nombre/número) |
| 5.B.10 | Botón "Deshacer último" | Revertir última acción. API: DELETE último match_event + recalcular score |

### Interfaz de cada adaptador

**GoalsAdapter (fútbol):**
```
┌──────────────────────────────────────┐
│  🟢 Equipo A    vs    Equipo B 🔵   │
│         2              1             │
│  ⏱️ 2T — 67:23                       │
│  [⚽ GOL]           [⚽ GOL]          │
│  [🟡 Amarilla] [🔴 Roja] [🔄 Cambio]│
│  [◀️ Deshacer] [Fin 2T] [Fin Partido]│
└──────────────────────────────────────┘
```

**PointsAdapter (basquet):**
```
┌──────────────────────────────────────┐
│  🟢 Equipo A    vs    Equipo B 🔵   │
│        45             38             │
│  ⏱️ Q3 — 5:23                        │
│  [+1] [+2] [+3]   [+1] [+2] [+3]   │
│  [🤚 Falta]          [🤚 Falta]      │
│  [⏸️ Timeout]      [⏸️ Timeout]     │
│  [◀️ Deshacer] [Fin Q3] [Fin Partido]│
└──────────────────────────────────────┘
```

**SetsGamesAdapter (tenis):**
```
┌──────────────────────────────────────┐
│  Pérez    vs    Gómez                │
│  Sets: 1        1                    │
│                                      │
│  Set 3:  3  -  2                     │
│  Game:  30  -  15                    │
│                                      │
│  Sirviendo: Pérez 🎾                 │
│                                      │
│  [Punto Pérez]    [Punto Gómez]      │
│  [💨 Ace] [❌ Doble falta]           │
│  Sets: 6-4, 6-7(5), 3-2             │
│  [◀️ Deshacer]                       │
└──────────────────────────────────────┘
```

**RoundsPointsAdapter (judo):**
```
┌──────────────────────────────────────┐
│  García    vs    López               │
│  Waza-ari: 1      0                  │
│  Shidos:   0      1                  │
│  ⏱️ 2:45 / 4:00                      │
│                                      │
│  García:                 López:      │
│  [🥇 Ippon]             [🥇 Ippon]   │
│  [🥈 Waza-ari]          [🥈 Waza-ari]│
│  [🟡 Shido]             [🟡 Shido]   │
│                                      │
│  [◀️ Deshacer] [Fin Round] [Fin]     │
└──────────────────────────────────────┘
```

**TimesMarksAdapter (natación):**
```
┌──────────────────────────────────────┐
│  🏊 50m Libre — Serie 3 de 7         │
│                                      │
│  Carril 1: García      [  :  .  ]    │
│  Carril 2: López       [ 27.82 ] ✅  │
│  Carril 3: Pérez       [  :  .  ]    │
│  Carril 4: Ríos        [ 28.03 ] ✅  │
│  Carril 5: Torres      [  :  .  ]    │
│  Carril 6: Gómez       [ 27.15 ] ⭐  │
│                                      │
│  [🏁 Registrar tiempo] [🚫 DNS]      │
│  [❌ DNF] [🔴 DQ]                    │
│                                      │
│  Ranking parcial: Gómez 27.15 (1°)   │
└──────────────────────────────────────┘
```

**InningsAdapter (béisbol):**
```
┌──────────────────────────────────────┐
│  ⚾ Equipo A  vs  Equipo B           │
│                                      │
│  Entrada: 5ta (alta)                 │
│  Outs: ●●○                           │
│  Bases: 1B ● 2B ○ 3B ○              │
│                                      │
│     1  2  3  4  5  6  7  8  9  R H E │
│  A  2  0  1  0  _              3 5 1 │
│  B  0  1  0  1                 2 4 0 │
│                                      │
│  [🏃 Carrera] [K Strikeout] [👎 Out] │
│  [🏏 Hit] [💣 HR] [🚶 Walk] [⚠️ Err]│
│  [◀️ Deshacer] [Cambio turno]        │
└──────────────────────────────────────┘
```

**JudgesAdapter (gimnasia) — V2:**
```
┌──────────────────────────────────────┐
│  🤸 Gimnasia — Suelo — García        │
│                                      │
│  Dificultad (D): [ 5.2 ]            │
│                                      │
│  Jueces de Ejecución:                │
│  J1: [ 8.5 ]  J2: [ 8.3 ]           │
│  J3: [ 8.7 ]  J4: [ 8.4 ]           │
│  J5: [ 8.6 ]  J6: [ 8.2 ]           │
│                                      │
│  Eliminar: max (8.7) y min (8.2)     │
│  Promedio E: 8.45                    │
│  Penalización: [ 0.0 ]              │
│                                      │
│  NOTA FINAL: 13.65                   │
│  [Confirmar] [Corregir]              │
└──────────────────────────────────────┘
```

**Interfaz de la planilla de fútbol:**
```
┌──────────────────────────────────────┐
│  🟢 Siempre Fuertes  vs  Club Itagüí│
│                                      │
│         2              1             │
│                                      │
│  ⏱️ 2T — 67:23                       │
│                                      │
│  ┌────────────┐   ┌────────────┐    │
│  │  ⚽ GOL    │   │  ⚽ GOL    │    │
│  └────────────┘   └────────────┘    │
│                                      │
│  [🟡 Amarilla] [🔴 Roja] [🔄 Cambio]│
│                                      │
│  Eventos:                            │
│  23' ⚽ Juan Pérez (SF)              │
│  45' ⚽ Carlos López (IT)            │
│  67' ⚽ Pedro Gómez (SF)             │
│                                      │
│  [◀️ Deshacer]                       │
│  [Fin 2T]  [Fin Partido]            │
└──────────────────────────────────────┘
```

## Sub-fase 5.C — Frontend En Vivo (Espectador)

| # | Tarea | Detalle |
|---|-------|---------|
| 5.C.1 | `useTournamentLive(tournamentId)` hook | Escucha canal WebSocket, actualiza datos en tiempo real |
| 5.C.2 | `LiveScoreboard.jsx` | Marcador con indicador "EN VIVO" parpadeante. Timeline de eventos |
| 5.C.3 | Auto-refresh de bracket/standings | Cuando un match termina, refrescar automáticamente |
| 5.C.4 | Contador de espectadores online | "47 personas viendo ahora" |

## Sub-fase 5.D — Resiliencia: Offline, Batería, Recuperación

**Esta sub-fase es CRÍTICA.** Un torneo se juega en canchas, coliseos, piscinas — lugares donde el internet es inestable y los dispositivos se descargan. El sistema DEBE funcionar en estas condiciones.

### Arquitectura de resiliencia (3 capas)

```
CAPA 1 — OFFLINE-FIRST (sin internet)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cada evento (gol, falta, punto, tiempo) se guarda PRIMERO
en almacenamiento local del dispositivo. El envío al servidor
es secundario y asíncrono.

  Toque "⚽ Gol" →
    1. Guardar en IndexedDB/SQLite (INMEDIATO, <5ms)
    2. Actualizar UI local (INMEDIATO)
    3. Intentar enviar al servidor (ASÍNCRONO)
       ├── Si hay internet → envía → servidor procesa → WebSocket a espectadores
       └── Si NO hay internet → encola → reintenta cada 10s
           └── Cuando vuelve internet → envía cola completa en orden

  El delegado NUNCA nota diferencia entre online y offline.
  La planilla funciona 100% local.

CAPA 2 — PERSISTENCIA (batería/crash)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IndexedDB (web) y SQLite (app Capacitor) persisten
incluso si:
  - Se cierra el browser/app
  - Se apaga el celular
  - Se descarga la batería
  - La app crashea
  - Se reinicia el dispositivo

Al reabrir la app, detecta partidos sin terminar y ofrece:
  A) Continuar desde donde iba (con marcador y minuto guardados)
  B) Ingresar resultado final manualmente
  C) Descartar (si ya se ingresó por otro medio)

CAPA 3 — MULTI-DISPOSITIVO (respaldo humano)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
El mismo partido puede estar abierto en N dispositivos.
  - El organizador en su tablet
  - Un co-organizador en su celular
  - Un delegado de cancha en otro celular

Si un dispositivo muere, cualquier otro puede continuar.
El servidor reconcilia eventos por timestamp (última escritura gana
si hay conflicto en el mismo evento).
```

| # | Tarea | Detalle |
|---|-------|---------|
| 5.D.1 | `OfflineEventStore` (servicio JS) | Almacén local con IndexedDB (web) o SQLite (Capacitor). Guarda: match_id, event_type, timestamp_local, payload, synced (bool), sync_attempts |
| 5.D.2 | Cola de sincronización | Al detectar conexión (`navigator.onLine` + heartbeat cada 10s), envía eventos pendientes al servidor en orden de timestamp. Retry con backoff exponencial (10s, 20s, 40s, max 5min) |
| 5.D.3 | Indicador de estado de conexión en la planilla | Banner sutil: 🟢 "Conectado" / 🟡 "Sin conexión — datos guardados localmente" / 🔴 "Error de sincronización (X eventos pendientes)". NO bloquear la UI nunca |
| 5.D.4 | Endpoint `POST /api/tournaments/{id}/matches/{matchId}/sync-events` | Recibe array de eventos offline con timestamps. Servidor los procesa en orden, ignora duplicados (por evento_id local), recalcula score y standings |
| 5.D.5 | Reconciliación multi-dispositivo | Si 2 dispositivos reportan eventos para el mismo partido, el servidor usa timestamp como orden. Si hay conflicto exacto (mismo segundo, mismo tipo), mantiene el primero recibido |
| 5.D.6 | Detección de partido sin terminar al abrir app | Al cargar la app/página, revisar IndexedDB por partidos con status='in_progress'. Mostrar modal de recuperación |
| 5.D.7 | Modal de recuperación | "Tienes un partido sin terminar: SF 2-1 Sabaneta (min 55). ¿Continuar / Ingresar resultado final / Descartar?" |
| 5.D.8 | Ingreso manual retroactivo (fallback total) | Si se pierden todos los datos locales, el organizador puede ingresar resultado completo desde el dashboard o por chat con el agente IA: "El resultado fue 3-1, goles de Pérez min 12 y 58, López min 55. Gol de Ríos min 47 para Sabaneta" |
| 5.D.9 | Indicador de batería baja | Cuando batería < 20%: "⚠️ Batería baja. Conecta el cargador o [Abrir en otro dispositivo →]". A < 10%: forzar sincronización inmediata de todo lo pendiente |
| 5.D.10 | "Abrir en otro dispositivo" (handoff) | Genera QR/link corto que abre el mismo partido en la planilla de otro dispositivo. El estado actual (marcador, minuto, eventos) se transfiere via servidor o se reconstruye desde los eventos sincronizados |
| 5.D.11 | Service Worker para PWA (web) | Cachea assets de la planilla para que funcione incluso sin conexión completa. La planilla se puede "instalar" como PWA en el celular |
| 5.D.12 | Test de resiliencia automatizado | Test E2E que simula: abrir partido → registrar eventos → cortar internet → seguir registrando → restaurar internet → verificar sincronización. Test de crash: registrar eventos → matar proceso → reabrir → verificar recuperación |

### Escenarios de fallo y cómo se resuelven

| Escenario | Qué pasa | Solución |
|-----------|----------|----------|
| **Se va el internet 5 min** | Planilla sigue funcionando. Eventos se acumulan en cola local. Al volver, sincroniza. | 5.D.1 + 5.D.2 |
| **Se va el internet todo el partido** | Planilla funciona 100% local. Al terminar, conecta WiFi y sincroniza todo de golpe. Portal público se actualiza. | 5.D.1 + 5.D.2 + 5.D.3 |
| **Se descarga la tablet al minuto 45** | Datos persisten en IndexedDB/SQLite. Al cargar y reabrir: "¿Continuar desde min 45?" | 5.D.6 + 5.D.7 |
| **Se descarga Y no se guardó nada** | (Extremadamente raro — IndexedDB persiste) Fallback: ingreso manual por agente IA o formulario | 5.D.8 |
| **La app crashea** | Igual que descarga — IndexedDB persiste. Al reabrir, recupera | 5.D.6 + 5.D.7 |
| **El celular del delegado se pierde/rompe** | Otro dispositivo abierto en el mismo partido toma el control. Si nadie más tenía abierto: ingreso manual | 5.D.5 + 5.D.10 |
| **Dos dispositivos reportan al mismo tiempo** | Servidor reconcilia por timestamp. No hay conflicto si cada dispositivo reporta canchas diferentes. Si reportan el MISMO partido, usa timestamps | 5.D.5 |
| **Internet intermitente (va y viene)** | La cola de sincronización maneja esto automáticamente. Envía cuando hay conexión, encola cuando no. Sin intervención del usuario | 5.D.2 + 5.D.3 |
| **Se cae el SERVIDOR de Widdo** | La planilla sigue funcionando local. Los eventos se encolan. Cuando el servidor vuelve, sincroniza. El partido NO se detiene por un problema de servidor | 5.D.1 + 5.D.2 |

### Datos que se guardan localmente por partido

```javascript
// IndexedDB / SQLite
{
  match_id: 123,
  tournament_id: 45,
  status: 'in_progress',          // scheduled, in_progress, completed
  current_period: 2,              // periodo actual
  current_minute: 67,             // minuto aproximado (o null si no se lleva)
  home_score: 2,                  // marcador local
  away_score: 1,
  home_team: { id: 1, name: 'Siempre Fuertes', players: [...] },
  away_team: { id: 2, name: 'Club Sabaneta', players: [...] },
  sport_config: { ... },           // config JSON del deporte (cacheada)
  events: [                        // todos los eventos del partido
    { id: 'evt_abc123', type: 'goal', minute: 12, team: 'home', player_id: 7,
      timestamp: '2026-03-15T08:12:00Z', synced: true },
    { id: 'evt_def456', type: 'yellow_card', minute: 23, team: 'away', player_id: 6,
      timestamp: '2026-03-15T08:23:00Z', synced: true },
    { id: 'evt_ghi789', type: 'goal', minute: 55, team: 'home', player_id: 10,
      timestamp: '2026-03-15T08:55:00Z', synced: false },  // ← pendiente de sync
  ],
  last_synced_at: '2026-03-15T08:23:00Z',
  offline_since: '2026-03-15T08:50:00Z',   // null si está online
}
```

## Sub-fase 5.E — Speech-to-Text + Multi-cancha

| # | Tarea | Detalle |
|---|-------|---------|
| 5.E.1 | Speech-to-Text en el chat | Web Speech API (gratis, nativo del browser). Botón de micrófono en el chat de Widdo AI. Para instrucciones complejas al agente desde la cancha sin escribir |
| 5.E.2 | Multi-cancha simultánea | El organizador puede tener N planillas abiertas (una por pestaña/ventana). Cada cancha independiente. Lista de partidos del día con estado en tiempo real |
| 5.E.3 | Delegado por cancha | El organizador puede asignar co-organizadores con permisos de scoring. Cada delegado abre SU cancha en SU celular. El organizador ve todo desde el dashboard |
| 5.E.4 | Vista "Centro de Control" del organizador | Pantalla dividida que muestra marcadores de TODAS las canchas en vivo. Sin necesidad de estar en cada planilla individual. Para el organizador que supervisa desde un punto central |

```
┌──────────────────────────────────────────────────┐
│  📊 CENTRO DE CONTROL — Copa Antioquia Sub-15     │
│  Sábado 15 de marzo — Jornada 1                  │
│                                                  │
│  🟢 Cancha 1: SF 2-1 Sabaneta (2T, 67')          │
│     Delegado: Carlos (📱 online)                  │
│                                                  │
│  🟢 Cancha 2: Rionegro 1-1 Caldas (2T, 52')      │
│     Delegado: María (📱 online)                   │
│                                                  │
│  ⏸️ Cancha 3: La Estrella vs Santa Rosa (10:30)   │
│     Delegado: Pedro (📱 sin asignar)              │
│                                                  │
│  ✅ Terminados hoy: 0                             │
│  🔜 Pendientes: 4                                 │
│                                                  │
│  [💬 Chat IA]  [📋 Fixture del día]              │
└──────────────────────────────────────────────────┘
```

**Total Fase 5: 26 tareas | ~8-10 días** (subió por resiliencia y adaptadores nuevos)

---

# FASE 6: PAGOS DE INSCRIPCIÓN

**Objetivo:** Cobro opcional. El organizador decide si cobra. Comisión Widdo.

## Sub-fase 6.A — Backend de Pagos

| # | Tarea | Detalle |
|---|-------|---------|
| 6.A.1 | Migración `create_pla_tournament_payments` | tournament_id, registration_id, amount, currency, gateway, external_reference, status ENUM('pending','approved','rejected','refunded'), paid_at, paid_by, manual_note, widdo_fee, widdo_fee_amount |
| 6.A.2 | Modelo `PlaTournamentPayment` | Relaciones, scopes |
| 6.A.3 | Campos de fee en torneo | registration_fee_enabled, registration_fee_amount, registration_fee_currency. Migración |
| 6.A.4 | `TournamentPaymentController` | Iniciar pago, listar pagos (organizador), marcar pagado manual |
| 6.A.5 | Webhook handlers | Wompi y MercadoPago adaptados para pagos de torneo (no de suscripción) |
| 6.A.6 | Auto-aprobar inscripción al confirmar pago | Configurable por torneo |
| 6.A.7 | Fee de Widdo | Comisión % sobre cada pago. Configurable por super_admin. Ejemplo: 5% |
| 6.A.8 | Reembolsos | Endpoint para reembolsar si club se retira |

## Sub-fase 6.B — Frontend de Pagos

| # | Tarea | Detalle |
|---|-------|---------|
| 6.B.1 | Pantalla de pago en flujo de inscripción | Si hay fee → después de inscribir, ir a pago (Wompi widget o MercadoPago redirect) |
| 6.B.2 | Tab "Pagos" del organizador | Estado de pagos por club, marcar manual, total recaudado, comisión Widdo vs neto |
| 6.B.3 | Configuración de fee en wizard del torneo | Toggle activar/desactivar, monto, moneda |

**Total Fase 6: 11 tareas | ~2-3 días**

---

# FASE 7: ESTADÍSTICAS, ANALYTICS Y PERFIL COLLEGE-READY

> **Objetivo:** Sistema de estadísticas verificables con trazabilidad total, métricas avanzadas por deporte,
> Transparency Score anti-inflación, perfiles públicos para recruiting, y IA para detección de anomalías.
> **Diferenciador clave:** Las stats nacen DENTRO del sistema durante el partido (no las sube alguien después).
> Cada stat tiene timestamp, quién la registró, contexto del partido, y hash de integridad.

---

## Análisis del Mercado Actual (Contexto USA)

### Plataformas existentes y sus problemas

| Plataforma | Qué hace | Precio | Problema principal |
|------------|----------|--------|--------------------|
| **MaxPreps** | Rankings, stats, schedules HS | Gratis (CBS Sports) | Stats las sube el coach — sin verificación, fácil inflar |
| **Hudl** | Video análisis + highlights | $200-$800/año | Solo video, no stats verificables. Ya NO sincroniza con MaxPreps (desde ene 2025) |
| **NCSA** | Perfil de recruiting, contacto con coaches | $800-$4,000/año | El atleta llena su perfil — sesgo obvio. Es un LinkedIn deportivo |
| **247Sports / On3 / Rivals** | Rankings de recruiting | Gratis/premium | Solo top prospects (Top 300). El 99% de jugadores NO aparecen |
| **Prep Hoops** | Stats y rankings por estado | Premium | Scouts humanos, subjetivo |
| **SportsVisio** | IA + video análisis automático | $$$$ | Pensado para pro/college, no para youth leagues |
| **Hoopsalytics** | Stats avanzadas | Gratis/básico | Solo NBA/college, no youth |
| **EvanMiya** | Analytics avanzados CBB | Premium | Solo college, no HS |
| **QwikCut** | Video + analytics | ~$500/año | Enfocado en video, no en stats verificadas |

### Problema central: NADIE verifica las estadísticas

1. **El coach sube las stats a MaxPreps** → puede inflar números
2. **El jugador llena su perfil en NCSA** → puede exagerar
3. **Los rankings son subjetivos** → scouts humanos con sesgos (favorecen colegios prestigiosos, zonas urbanas)
4. **No hay trazabilidad** → no puedes ver "de dónde salieron esos 25 puntos por partido"
5. **El 99% de jugadores son invisibles** → solo los top 300 nacionales aparecen en 247/On3

> **Referencia:** Harvard Science Review (Nov 2025) confirmó que modelos IA en deportes
> favorecen prestigio del colegio, afectando desproporcionadamente a jugadores latinos y programas pequeños.

### Cambios NCAA 2025-26 que afectan

- NCAA eliminó límites de becas D1 → ahora coaches pueden dividir becas parciales (equivalency sport)
- D1 men's basketball: 15 becas, roster limit 15
- Revenue sharing: atletas reciben hasta 22% del revenue promedio de Power Conferences ($20.5M cap 2025-26)
- Becas garantizadas = errores cuestan más → coaches necesitan datos CONFIABLES

---

## Sub-fase 7.A — Base de Datos y Modelos

| # | Tarea | Detalle |
|---|-------|---------|
| 7.A.1 | Migración `create_pla_tournament_player_stats` | match_id (FK), player_id (FK), registration_id (FK). **Universales:** minutes_played, started (bool). **Por deporte (JSON `sport_stats`):** goals, assists, yellow_cards, red_cards, points, rebounds, steals, blocks, turnovers, fouls, fg_made, fg_attempted, three_made, three_attempted, ft_made, ft_attempted, aces, double_faults, winners, errors, ippon, wazari, yuko, pins, submissions, times (array), distances (array), heights (array), scores (array, para gimnasia/diving). **Metadata:** recorded_by_user_id, recorded_at (timestamp exacto), recording_method (enum: live_panel, manual_post, imported, corrected), correction_of_id (FK self-ref, para audit trail), hash_integrity (SHA-256 del registro original) |
| 7.A.2 | Migración `create_pla_tournament_team_stats` | match_id, team/registration_id. Agregados por equipo: total_points, total_fouls, possession_time, timeouts_used, etc. Calculados automáticamente al agregar player_stats |
| 7.A.3 | Migración `create_pla_player_profiles` | player_id (FK), sport_type, position, height_cm, weight_kg, dominant_hand/foot, academic_info (JSON: gpa, sat_score, graduation_year, school_name), medical_clearances (JSON), guardian_consent (bool), profile_visibility (enum: private, club_only, public, recruiting). **Importante:** NO duplica datos de `pla_club_team_players`, los extiende |
| 7.A.4 | Migración `create_pla_transparency_scores` | player_id, sport_type, total_score (0-100), breakdown (JSON con cada factor y su puntaje), games_count, verified_games_count, has_video_count, last_calculated_at, calculation_version |
| 7.A.5 | Migración `create_pla_stat_corrections` | original_stat_id, corrected_stat_id, corrected_by_user_id, reason, approved_by_user_id, approved_at. **Audit trail completo** — nunca se borra un stat, se crea una corrección |
| 7.A.6 | Modelo `PlaTournamentPlayerStat` | Relaciones (match, player, recorder, correction). Scopes: `verified()`, `byRecordingMethod()`, `bySport()`. Mutators: auto-calcula hash_integrity al crear. Cast `sport_stats` a array |
| 7.A.7 | Modelo `PlaTournamentTeamStat` | Calculado automáticamente al guardar player_stats. Observer pattern |
| 7.A.8 | Modelo `PlaPlayerProfile` | Relaciones con player, stats, transparency_score. Scope `recruiting()` para perfiles públicos |
| 7.A.9 | Modelo `PlaTransparencyScore` | Cálculo automático (ver fórmula abajo). Se recalcula después de cada partido |
| 7.A.10 | Migración `add_stats_config_to_sport_configs` | Agregar columna `stats_fields` (JSON) a tabla de sport_configs — define qué campos estadísticos aplican por deporte |
| 7.A.11 | Seeder `StatsFieldsSeeder` | Poblar stats_fields para cada deporte del catálogo de 42 deportes |

### Fórmula del Transparency Score

```
TRANSPARENCY SCORE (0-100) = suma de factores:

  ✓ Stats registradas en vivo (no post-partido)           +20 pts
  ✓ Registradas por oficial certificado                    +15 pts
  ✓ Partido en torneo/liga oficial Widdo                   +15 pts
  ✓ Video del partido disponible                           +10 pts
  ✓ Stats verificadas por equipo contrario                 +10 pts
  ✓ Consistencia estadística (sin picos sospechosos)       +15 pts
  ✓ Nivel de competencia del rival                         +10 pts
  ✓ Tamaño de muestra (>10 partidos = full, <3 = mínimo)  +5 pts

Ejemplo:
  Juan: 22 PPG, Transparency Score: 92/100 ✅
    → 20 partidos en vivo, torneo oficial, registrado por árbitro, video en 15 partidos
  Pedro: 25 PPG, Transparency Score: 34/100 ⚠️
    → 3 partidos subidos manualmente, sin video, amistosos
```

### Stats avanzadas por deporte (se calculan automáticamente)

**Baloncesto:**
| Métrica | Fórmula | Por qué importa para becas |
|---------|---------|---------------------------|
| PER (Player Efficiency Rating) | (PTS + REB + AST + STL + BLK - TO - Missed FG - Missed FT) / MIN | Número único que resume al jugador |
| TS% (True Shooting) | PTS / (2 × (FGA + 0.44 × FTA)) | Mejor que FG% porque incluye 3PT y FT |
| USG% (Usage Rate) | 100 × (FGA + 0.44 × FTA + TO) × (Team MIN / 5) / (MIN × Team Poss) | Contexto: ¿es bueno porque tira mucho o porque es eficiente? |
| AST/TO | AST / TO | Control del balón — crucial para point guards |
| REB% | (REB × Team MIN / 5) / (MIN × (Team REB + Opp REB)) | Mejor que total rebounds |
| +/- (Plus/Minus) | Team PTS - Opp PTS cuando el jugador está en cancha | Impacto real en el equipo |
| PIR (Performance Index Rating) | Fórmula FIBA estándar | Más usado internacionalmente |
| Game Score | PTS + 0.4×FGM - 0.7×FGA - 0.4×(FTA-FTM) + 0.7×OREB + 0.3×DREB + STL + 0.7×AST + 0.7×BLK - 0.4×PF - TO | Fácil de comparar partido a partido |

**Fútbol/Soccer:**
| Métrica | Fórmula | Para recruiting |
|---------|---------|----------------|
| G+A (Goles + Asistencias) | Goles + Asistencias | Producción ofensiva — stat #1 |
| G/90 (Goles por 90 min) | (Goles / Minutos) × 90 | Normalizado por minutaje |
| xG (Expected Goals) | Probabilidad basada en posición del tiro (simplificado) | Soccer IQ |
| Pass% | Pases completados / Pases intentados | Técnica bajo presión |
| Duels Won% | Duelos ganados / Total duelos | Intensidad física |
| Defensive Actions/90 | (Intercepciones + tackles + clearances) / 90 min | Para defensas y mediocampistas |
| **Físicas** | 40yd dash, Beep test, Vertical jump | D1 busca velocidad + técnica |

**Volleyball:**
| Métrica | Fórmula | Para recruiting |
|---------|---------|----------------|
| Kills/Set | Kills / Sets jugados | Eficiencia ofensiva |
| Hitting % | (Kills - Errors) / Attempts | Eficiencia total — stat #1 |
| Assists/Set | Assists / Sets jugados | Productividad (setters) |
| Digs/Set | Digs / Sets jugados | Rol defensivo (liberos) |
| Blocks/Set | Blocks / Sets jugados | Presencia en red |
| Aces/Set | Aces / Sets jugados | Servicio |
| Service Errors/Set | Errors / Sets jugados | Consistencia |
| **Físicas** | Standing reach, Approach jump, Block jump | D1 pide reach + jump touch |

**Baseball/Softball:**
| Métrica | Fórmula | Para recruiting |
|---------|---------|----------------|
| BA (Batting Average) | Hits / At-Bats | Contacto |
| OBP (On-Base %) | (H + BB + HBP) / PA | Disciplina en el plato |
| SLG (Slugging %) | Total bases / At-Bats | Poder |
| OPS (OBP + SLG) | Combinada | Métrica #1 moderna para bateo |
| ERA (pitchers) | Earned Runs / 9 innings | Efectividad |
| WHIP (pitchers) | (Walks + Hits) / IP | Control |
| K/9 (pitchers) | Strikeouts / 9 innings | Dominancia |
| **Velo** (pitchers) | Velocidad en mph | **Dato #1 que piden coaches de pitchers** |
| Pop time (catchers) | Tiempo de lanzamiento a 2da base | Específico de catcher |
| 60-yard dash | Tiempo en 60 yardas | Velocidad en las bases |
| Exit velocity | Velocidad pelota al salir del bate (mph) | Poder real |

**Tenis:**
| Métrica | Fórmula | Para recruiting |
|---------|---------|----------------|
| UTR (Universal Tennis Rating) | Algoritmo global | **EL número** que coaches miran |
| W-L Record | Ganados-Perdidos | Volumen competitivo |
| 1st Serve % | 1st serves in / Total serves | Consistencia |
| Break Point Conversion | BP won / BP opportunities | Clutch performance |
| Winners/UE Ratio | Winners / Unforced Errors | Agresividad controlada |
| Dominance Ratio | Winners / (Winners + UE) | Eficiencia ofensiva |

**Natación/Diving:**
| Métrica | Cálculo | Para recruiting |
|---------|---------|----------------|
| **Best Time por evento** | Mejor tiempo en cada prueba (50/100/200 Free, Back, Breast, Fly, IM) | **LO ÚNICO que importa** — coaches tienen tablas de tiempos mínimos |
| Season Best | Mejor del año actual | Forma actual |
| Improvement Rate | (Tiempo anterior - actual) / anterior × 100 | Potencial de desarrollo |
| Relay splits | Tiempo individual dentro del relay | Coaches necesitan nadadores para relays |
| **Estándares** | Futures cuts = D1, Sectional = D2, debajo = D3 | Widdo muestra en qué rango cae el atleta |

**Track & Field:**
| Métrica | Cálculo | Para recruiting |
|---------|---------|----------------|
| **PR (Personal Record)** | Mejor marca por evento | Lo más importante |
| Season Best | Mejor del año | Forma actual |
| Consistency (σ) | Desviación estándar de resultados | ¿Consistente o suerte? |
| Wind-legal marks | Marcas con viento <2.0 m/s | Solo estas cuentan oficialmente |
| Multi-event scoring | Puntos totales (decathlon/heptathlon) | Para multi-atletas |
| **Referencia:** | Tiempos/marcas D1/D2/D3 por evento | Similar a natación |

> **Track pasó de 12.6 → 62 becas posibles (5x). Natación de 9.9 → 30 (3x). Coaches de estos deportes ahora NECESITAN herramientas de scouting.**

**Wrestling:**
| Métrica | Cálculo | Para recruiting |
|---------|---------|----------------|
| W-L Record | Ganados-perdidos | Lo primero que ven |
| Win % | Victorias / Total combates | Eficiencia |
| Pin % | % victorias por pin | Dominancia |
| Tech Fall % | % victorias por superioridad técnica | Agresividad |
| Takedowns/match | Derribos por combate | Capacidad ofensiva |
| Escapes/match | Escapes de posición inferior | Habilidad defensiva |
| Tournament placements | Posiciones en torneos estatales/nacionales | Nivel de competencia |
| **Peso certificado** | Historial de pesaje verificado | Prevención de weight cutting extremo |

**Judo/Artes Marciales:**
| Métrica | Cálculo | Para recruiting |
|---------|---------|----------------|
| Ippon % | % victorias por ippon | Técnica dominante |
| Win method breakdown | Ippon/Wazari/Decision/Penalty | Estilo de lucha |
| Golden Score record | Victorias en tiempo extra | Resistencia mental |

**Gimnasia:**
| Métrica | Cálculo | Para recruiting |
|---------|---------|----------------|
| D-Score (Difficulty) | Valor de dificultad de la rutina | Nivel de elementos |
| E-Score (Execution) | Calidad de ejecución | Limpieza técnica |
| All-Around total | Suma de aparatos | Versatilidad |
| Best scores por aparato | Mejor nota en vault, bars, beam, floor | Especialización |
| Consistency (σ) | Variabilidad de puntuaciones | Confiabilidad |

**Diving:**
| Métrica | Cálculo | Para recruiting |
|---------|---------|----------------|
| DD promedio | Degree of Difficulty promedio de clavados | Ambición/nivel |
| Average score per dive | Puntuación media | Consistencia |
| Best 6-dive total | Total de 6 clavados (1m, 3m) | Para qualifying |

**Football:**
| Métrica | Cálculo | Para recruiting |
|---------|---------|----------------|
| Passing: yards/TDs/INTs/Comp% | Stats de QB | Eficiencia |
| Rushing: yards/TDs/YPC | Stats de RB/WR | Producción terrestre |
| Receiving: yards/TDs/catches | Stats de WR/TE | Producción aérea |
| Defensive: tackles/sacks/INTs | Stats defensivas | Impacto defensivo |
| **Físicas:** 40yd, Bench, Vertical, Broad jump, 3-cone | Combine metrics | Athleticism medible |

### Verified Standards Database (para deportes de tiempo/marca)

Para natación, track & field y cualquier deporte con estándares publicados por división,
Widdo incluye una base de datos que muestra DÓNDE cae el atleta:

```
WIDDO VERIFIED STANDARDS — Natación 100m Freestyle (Men)

Tu tiempo:    51.23s  ✅ Verified (Transparency: 94)

┌──────────────────────────────────────────────┐
│ D1 Power 5:  44.0 - 46.0  ██░░░░░░░░ Lejos  │
│ D1 Mid-Major: 46.0 - 48.5  ████░░░░░░        │
│ D2 Top:       48.5 - 50.5  ██████░░░░        │
│ D2:           50.5 - 52.0  ████████░░ ← TÚ   │
│ D3 Top:       52.0 - 54.0  ██████████        │
│ D3:           54.0 - 57.0  ██████████        │
└──────────────────────────────────────────────┘

Mejora último año: -2.1s (3.9%)
Para D2 Top necesitas: -0.73s más
Proyección si mantienes ritmo: D2 Top en ~8 meses

⚠️ Proyección estadística, NO garantía
```

### Cambios NCAA 2025-26 (House Settlement) — Contexto

| Deporte | Becas antes | Roster Limit nuevo | Becas posibles ahora |
|---------|-------------|-------------------|---------------------|
| Basketball (M) | 13 | 15 | 15 |
| Soccer (M) | 9.9 | 28 | **28** (3x) |
| Baseball | 11.7 | 34 | **34** (3x) |
| Volleyball (W) | 12 | 18 | 18 |
| Swimming | 9.9 (M) / 14 (W) | 30 / 30 | **30** (3x) |
| Track & Field | 12.6 | 45+45 | **62** (5x!!) |
| Wrestling | 9.9 | 30 | **30** (3x) |
| Softball | 12 | 25 | **25** (2x) |
| Gymnastics (W) | 12 | 20 | 20 |
| Football (FBS) | 85 | 105 | 105 |

> ~790 becas nuevas across 40+ deportes. Revenue sharing: $20.5M cap 2025-26.
> Becas garantizadas → errores cuestan más → coaches NECESITAN datos confiables.

### Revenue adicional del módulo de stats

| Fuente | Modelo | Estimado |
|--------|--------|----------|
| Perfil premium atleta | Padres pagan boost visibilidad + analytics | $29-99/atleta/año |
| API para scouts/agencias | Acceso a DB verificada, rate limited | $199-499/mes/licencia |
| Showcases/Combines | Eventos con mediciones físicas Widdo | $50-100/atleta/evento |
| College coach dashboard | Herramienta scouting para coaches | $99-299/mes/coach |
| Reportes liga/torneo | PDF analytics para organizadores | Incluido en plan Pro+ |

---

## Sub-fase 7.B — Services y Cálculos

| # | Tarea | Detalle |
|---|-------|---------|
| 7.B.1 | `StatsCalculatorService` | Servicio principal. Métodos: `calculatePlayerGameStats()`, `calculateTeamGameStats()`, `calculateTournamentStats()`, `calculateAdvancedStats()`. Usa SportConfig para saber qué calcular por deporte |
| 7.B.2 | `TransparencyScoreService` | Calcula Transparency Score de un jugador. Se ejecuta después de cada partido. Factores: recording_method, recorder role, tournament type, video availability, opponent strength, consistency check, sample size |
| 7.B.3 | `AnomalyDetectionService` | **IA anti-inflación.** Detecta: picos sospechosos (>2σ del promedio), inconsistencias equipo vs individuo (suma de puntos individuales ≠ total equipo), stats irreales (e.g., 50 pts en 10 min), correlación con nivel del rival. Genera flags automáticos |
| 7.B.4 | `PlayerComparisonService` | Compara jugadores normalizando por: minutos, nivel de competencia, ritmo de juego, edad, posición. NO compara rec league con AAU elite sin ajustar |
| 7.B.5 | `ProjectionService` | **IA de proyección con disclaimers.** Basado en curvas de desarrollo (percentiles por edad). Output: rango (D3/D2/D1/NAIA), probabilidad, áreas de mejora. SIEMPRE con disclaimer: "Proyección estadística, NO garantía" |
| 7.B.6 | `CollegeReadyProfileService` | Genera perfil PDF verificado con sello Widdo. Incluye: stats, Transparency Score, video highlights (links), info académica, QR code al perfil público. El coach college escanea QR → ve toda la trazabilidad |
| 7.B.7 | `StatsIntegrityService` | Calcula hash SHA-256 de cada registro. Detecta si alguien modificó un stat sin usar el flujo de corrección. Logs de auditoría |
| 7.B.8 | `BiasMonitorService` | **IA de equidad.** Monitorea: ¿el sistema da más visibilidad a jugadores de ciertas zonas/escuelas/etnias? Dashboard interno, alertas automáticas, auditoría trimestral. Inspirado en recomendaciones Harvard Science Review |

---

## Sub-fase 7.C — Endpoints API

| # | Tarea | Detalle |
|---|-------|---------|
| 7.C.1 | `GET /tournaments/{id}/stats/leaders` | Líderes por categoría estadística (goleadores, asistidores, reboteadores, etc.). Filtros: category_id, sport_type, stat_field, limit |
| 7.C.2 | `GET /tournaments/{id}/stats/players/{playerId}` | Stats completas de un jugador en el torneo. Incluye: básicas, avanzadas, por partido, acumuladas |
| 7.C.3 | `GET /tournaments/{id}/stats/teams/{teamId}` | Stats agregadas del equipo |
| 7.C.4 | `GET /tournaments/{id}/stats/matches/{matchId}` | Box score completo del partido con audit trail |
| 7.C.5 | `GET /players/{id}/profile` | Perfil público del jugador. Incluye: stats de TODOS los torneos/ligas, Transparency Score, info académica (si habilitado), verified badge |
| 7.C.6 | `GET /players/{id}/profile/pdf` | Genera College-Ready PDF con QR verificable |
| 7.C.7 | `GET /players/{id}/transparency-score` | Detalle del Transparency Score con breakdown por factor |
| 7.C.8 | `POST /players/{id}/profile` | Crear/actualizar perfil recruiting (posición, altura, peso, académico, visibilidad) |
| 7.C.9 | `GET /stats/compare` | Comparar 2-5 jugadores. Params: player_ids[], normalize (bool), context_adjust (bool) |
| 7.C.10 | `GET /stats/scout` | **Scout endpoint.** Query: sport, position, state, min_transparency_score, stat_filters (e.g., ts_pct > 55), gpa_min, graduation_year. Para coaches college |
| 7.C.11 | `POST /stats/{id}/corrections` | Solicitar corrección de un stat. Requiere reason. Necesita aprobación del organizador |
| 7.C.12 | `GET /stats/anomalies` | Dashboard de anomalías detectadas (solo organizador/admin) |
| 7.C.13 | `GET /stats/public/leaders` | Stats públicas sin auth — para portal público (Fase 4) |

---

## Sub-fase 7.D — Frontend: Dashboard de Stats

| # | Tarea | Detalle |
|---|-------|---------|
| 7.D.1 | Tab "Estadísticas" en TournamentDetailPage | Sub-tabs: Líderes, Por Equipo, Por Partido, Anomalías (si organizador) |
| 7.D.2 | Componente `StatsLeaderboard` | Tabla de líderes con filtros por stat. Columnas dinámicas según deporte (SportConfig). Sorting, pagination |
| 7.D.3 | Componente `PlayerStatsCard` | Card con foto, stats principales, Transparency Score badge (verde >80, amarillo 50-80, rojo <50), trend arrows |
| 7.D.4 | Componente `BoxScore` | Vista de partido estilo ESPN: lineup, stats por jugador, totales por equipo, cuarto por cuarto (basket) o tiempo por tiempo (fútbol) |
| 7.D.5 | Componente `TeamStatsPanel` | Stats agregadas del equipo en el torneo: W-L, puntos a favor/contra, diferencial, racha |
| 7.D.6 | Componente `TransparencyBadge` | Badge visual: ✅ Verified (>80), ⚠️ Partial (50-80), ❌ Unverified (<50). Tooltip con breakdown |
| 7.D.7 | Stats en portal público | Mismos componentes pero sin auth, sin info privada. SEO-friendly para que coaches college encuentren jugadores via Google |

---

## Sub-fase 7.E — Frontend: Perfil Recruiting y College-Ready

| # | Tarea | Detalle |
|---|-------|---------|
| 7.E.1 | Página `PlayerProfilePage` | Perfil público del jugador: foto, bio, posición, stats career, Transparency Score, highlights, académico (si público). URL: `/players/{slug}` |
| 7.E.2 | Componente `PlayerProfileEditor` | Formulario para que el jugador (o padre) edite: posición, altura, peso, mano/pie dominante, info académica (GPA, SAT, año graduación, escuela), visibilidad (privado/club/público/recruiting) |
| 7.E.3 | Componente `StatsTimeline` | Gráfico de evolución: PER, PPG, TS% a lo largo del tiempo. Muestra tendencia de mejora (o caída) |
| 7.E.4 | Componente `PlayerComparison` | Side-by-side de 2-5 jugadores: radar chart con stats normalizadas, Transparency Score, contexto (nivel de competencia) |
| 7.E.5 | Componente `ProjectionCard` | Rango proyectado (D1/D2/D3/NAIA/JUCO) con probabilidad visual (barra). **SIEMPRE** con disclaimer. Áreas de mejora con targets numéricos |
| 7.E.6 | Botón "Descargar College-Ready PDF" | Genera y descarga PDF verificado con QR. Incluye: stats, Transparency Score, highlights (si hay), académico, sello Widdo |
| 7.E.7 | Componente `QRVerification` | Página destino del QR: muestra perfil verificado con audit trail completo. Coach college ve exactamente de dónde salió cada número |

---

## Sub-fase 7.F — IA: Detección de Anomalías y Asistente

| # | Tarea | Detalle |
|---|-------|---------|
| 7.F.1 | Anomaly detection rules | Reglas configurables: pico >2σ del promedio, inconsistencia equipo vs suma individual, stats imposibles por minutos jugados, correlación negativa con nivel del rival |
| 7.F.2 | Dashboard de anomalías (organizador) | Lista de flags con: jugador, stat, razón del flag, severity (warning/alert/critical), acción sugerida |
| 7.F.3 | Tools del agente IA para stats | `get_player_stats`, `get_tournament_leaders`, `compare_players`, `get_transparency_score`, `get_anomalies`, `generate_college_profile`. Ejemplo conversación: "¿Quién es el mejor point guard del torneo?" → muestra stats + Transparency Score |
| 7.F.4 | Tool `project_player_level` | "¿A qué nivel podría jugar este jugador en college?" → usa ProjectionService, SIEMPRE con disclaimer |
| 7.F.5 | Tool `scout_players` | "Muéstrame shooting guards en Florida con TS% > 55%, Transparency > 80, GPA > 3.0" → usa Scout endpoint |
| 7.F.6 | Bias monitoring dashboard (admin) | Métricas de equidad: distribución de visibilidad por zona/escuela/etnia, alertas si el modelo favorece consistentemente cierto tipo de jugador. Auditoría trimestral automática |

---

## Sub-fase 7.G — Integraciones y Exportación

| # | Tarea | Detalle |
|---|-------|---------|
| 7.G.1 | Export CSV/Excel de stats | Organizador puede exportar todas las stats del torneo. Formato compatible con MaxPreps (para clubes que aún lo usen) |
| 7.G.2 | API pública de stats (read-only) | Endpoint público con rate limiting para que terceros (medios, scouts) consulten stats verificadas. OAuth2 o API key |
| 7.G.3 | Embed widget | `<iframe>` o Web Component para que clubes/ligas pongan stats en su web. Incluye Transparency Badge |
| 7.G.4 | Share social | Compartir stat cards en redes: imagen generada con stats + Transparency Score + QR al perfil |

---

### Widdo vs Competencia en Estadísticas

| Feature | MaxPreps | Hudl | NCSA | **Widdo** |
|---------|----------|------|------|-----------|
| Stats en vivo (durante partido) | ❌ | ❌ | ❌ | ✅ |
| Stats verificables con audit trail | ❌ | Solo video | ❌ | ✅ Hash + trazabilidad |
| Transparency Score | ❌ | ❌ | ❌ | ✅ 0-100 por jugador |
| Métricas avanzadas (PER, TS%, +/-) | Básicas | ❌ | ❌ | ✅ Auto-calculadas |
| Detección de inflación con IA | ❌ | ❌ | ❌ | ✅ Anomaly detection |
| College-Ready Profile verificado | ❌ | Parcial | ✅ ($$$) | ✅ Incluido gratis |
| Costo para el atleta | Gratis | $200-800/año | $800-4,000/año | **$0** (lo paga el club) |
| Multi-deporte | ❌ Solo HS | ✅ | ✅ | ✅ 42 deportes |
| IA analytics | ❌ | ❌ | ❌ | ✅ Proyección + scout |
| Detección de sesgo | ❌ | ❌ | ❌ | ✅ Bias monitoring |
| Portal público SEO | ✅ | ❌ | ❌ | ✅ |
| QR verificable | ❌ | ❌ | ❌ | ✅ |

---

**Total Fase 7: 48 tareas | ~8-12 días**

> **Nota estratégica USA:** NCSA cobra $800-$4,000/año por un perfil que el jugador llena él mismo.
> Widdo genera el perfil GRATIS a partir de datos reales del torneo/liga. El club ya paga Widdo ($99-$349/mes).
> Los padres ven valor inmediato: "Mi hijo tiene perfil verificado para college".
> Los coaches college prefieren datos verificados vs auto-reportados.
> El Transparency Score es un concepto nuevo que Widdo puede proteger como propiedad intelectual.

---

# FASE 8: MOBILE

## Sub-fase 8.A — Prioridad Alta

| # | Tarea | Detalle |
|---|-------|---------|
| 8.A.1 | Scoring panel mobile-first | El AdaptiveScorePanel ya es mobile-first. Verificar en Capacitor |
| 8.A.2 | Push notifications | "¡Final! Siempre Fuertes 3-1 Itagüí". Usar Firebase/OneSignal |
| 8.A.3 | Vista de bracket mobile | Scroll horizontal para brackets grandes. Zoom pinch |

## Sub-fase 8.B — Prioridad Media

| # | Tarea | Detalle |
|---|-------|---------|
| 8.B.1 | Dashboard organizador mobile | Resumen rápido: torneos activos, partidos de hoy, inscripciones pendientes |
| 8.B.2 | Inscripción de club desde mobile | Flujo simplificado para inscribirse desde el celular |
| 8.B.3 | Vista pública en app | Ver torneo, bracket, en vivo desde la app |

**Total Fase 8: 6 tareas | ~2-3 días**

---

# RESUMEN DE ESFUERZO

| Fase | Sub-fases | Tareas | Días estimados | Dependencias |
|------|-----------|--------|---------------|--------------|
| 0 — Rol Organizador | 5 (A-E) | 20 | 3-4 | Ninguna |
| 1 — Multi-Deporte | 4 (A-D) | 18 | 3-4 | Fase 0 |
| 2 — Inscripción Cross-Club | 8 (A-H) | 25 | 5-7 | Fase 0, 1 |
| 3 — Motor de Brackets + Agente IA | 6 (A-F) | 32 | 8-12 | Fase 2 |
| 4 — Portal Público | 2 (A-B) | 9 | 2-3 | Fase 3 |
| 5 — Resultados en Vivo + Resiliencia | 5 (A-E) | 26 | 8-10 | Fase 3 |
| 6 — Pagos Inscripción | 2 (A-B) | 11 | 2-3 | Fase 2 |
| 7 — Estadísticas, Analytics y Perfil College-Ready | 7 (A-G) | 48 | 8-12 | Fase 5 |
| 8 — Mobile | 2 (A-B) | 6 | 2-3 | Fase 5 |
| **TOTAL** | **41** | **195** | **~44-59 días** | |

### Paralelización posible

```
Ronda 1 (semana 1):
  └─ Fase 0 — Rol Organizador (fundamento de todo)

Ronda 2 (semanas 2-3):
  ├─ Fase 1 — Multi-Deporte + Config Scoring (en paralelo)
  └─ Fase 2A-2F — Inscripción backend (en paralelo)

Ronda 3 (semanas 3-5):
  ├─ Fase 3A-3D — Motor de Brackets backend (en paralelo con...)
  ├─ Fase 2G-2H — Inscripción frontend
  └─ Fase 6 — Pagos de Inscripción

Ronda 4 (semanas 5-7):
  ├─ Fase 3E-3F — Agente IA + Frontend brackets
  ├─ Fase 4 — Portal Público
  └─ Fase 5A-5C — WebSockets + Planillas digitales

Ronda 5 (semanas 7-9):
  ├─ Fase 5D — Resiliencia/Offline (CRÍTICA)
  ├─ Fase 5E — Multi-cancha + Centro de Control
  ├─ Fase 7A-7D — Stats Backend + Dashboard (en paralelo)
  └─ Fase 8 — Mobile

Ronda 6 (semanas 9-11):
  ├─ Fase 7E-7F — Perfil Recruiting + IA Analytics
  └─ Fase 7G — Integraciones y exportación
```

**Con paralelización: ~25-32 días**

### Prioridades de adaptadores (panel_type)

```
MVP (Fases 0-5, P0):
  ✅ GoalsAdapter (fútbol, futsal) — 80% de torneos LATAM
  ✅ PointsAdapter (basquet)

Extensión 1 (P1):
  ✅ SetsGamesAdapter (tenis, volley, pádel)
  ✅ RoundsPointsAdapter (judo, karate, taekwondo, boxeo)

Extensión 2 (P2):
  ✅ TimesMarksAdapter (natación, atletismo)
  ✅ InningsAdapter (béisbol, softball)

V2 (P3):
  ✅ JudgesAdapter (gimnasia, clavados, surf)
```

### Lo que hace único a Widdo Tournaments (diferenciadores)

| Feature | TeamSnap | SportsEngine | Jersey Watch | **Widdo** |
|---------|----------|-------------|-------------|-----------|
| Planilla digital en vivo | ❌ | ❌ | ❌ | **✅ genérica, cualquier deporte** |
| Agente IA que gestiona el torneo | ❌ | ❌ | ❌ | **✅ 30+ tools, voz** |
| Offline-first (funciona sin internet) | ❌ | ❌ | ❌ | **✅ 100% local** |
| Recuperación automática (crash/batería) | ❌ | ❌ | ❌ | **✅ IndexedDB + modal** |
| Multi-cancha con delegados | ❌ | Parcial | ❌ | **✅ N dispositivos** |
| Centro de control del organizador | ❌ | ❌ | ❌ | **✅ vista global** |
| Club externo se registra gratis | ❌ | ❌ | ❌ | **✅ canal de adquisición $0** |
| 42 deportes con config JSON | ❌ | ~10 | ~5 | **✅ extensible por IA** |
| Portal público sin login | Parcial | Parcial | ❌ | **✅ con SEO y OG** |
| Deportes con jueces (gimnasia) | ❌ | ❌ | ❌ | **✅ V2** |

### Mapa de dependencias entre fases

```
Fase 0 (Rol Organizador)
  │
  ├──→ Fase 1 (Multi-Deporte)
  │      │
  │      └──→ Fase 2 (Inscripción Cross-Club)
  │             │
  │             ├──→ Fase 3 (Motor de Brackets + Agente IA)
  │             │      │
  │             │      ├──→ Fase 4 (Portal Público)
  │             │      │
  │             │      └──→ Fase 5 (Resultados en Vivo + Resiliencia)
  │             │             │
  │             │             ├──→ Fase 7 (Estadísticas)
  │             │             │
  │             │             └──→ Fase 8 (Mobile)
  │             │
  │             └──→ Fase 6 (Pagos de Inscripción) — independiente de 3,4,5
  │
  (Fase 6 puede empezar al terminar Fase 2, no necesita esperar a Fase 3)
```

---

# SIMULACIÓN COMPLETA: TORNEO DE FÚTBOL SUB-15

## 🏟️ "Copa Antioquia Sub-15 Masculino 2026"

Simulación paso a paso de cómo un organizador usa Widdo Tournaments para crear y gestionar un torneo de fútbol. Cada paso indica qué fase/sub-fase lo habilita.

---

### CAPÍTULO 1: REGISTRO Y CONFIGURACIÓN

#### 1.1 — Juan Martínez se registra como organizador (Fase 0)

Juan Martínez dirige "Copa T&E", una empresa que organiza torneos departamentales. Entra a widdo.co/register.

```
Pantalla de registro:
┌──────────────────────────────────────────────────┐
│  Bienvenido a Widdo                              │
│                                                  │
│  ¿Qué quieres hacer?                            │
│                                                  │
│  ┌──────────────────┐  ┌──────────────────┐     │
│  │  🏟️ Gestionar     │  │  🏆 Organizar    │     │
│  │  mi club          │  │  torneos         │     │
│  └──────────────────┘  └──────────────────┘     │
│                                                  │
│  [Ambos]                                         │
└──────────────────────────────────────────────────┘
```

Juan selecciona "Organizar torneos". Llena:
- Nombre: Juan Martínez
- Email: juan@copate.co
- Contraseña: ****
- Organización: "Copa T&E"

**Backend crea:** User + PlaOrganizer + user_club_role (role='organizer', club_id=NULL)

Juan entra al dashboard de organizador:
```
┌──────────────────────────────────────────────────┐
│  🏆 Copa T&E — Dashboard Organizador             │
│                                                  │
│  📊 Resumen                                      │
│  Torneos activos: 0                              │
│  Inscripciones pendientes: 0                     │
│  Pagos recibidos: $0                             │
│                                                  │
│  [+ Crear Torneo]                                │
└──────────────────────────────────────────────────┘
```

#### 1.2 — Crear torneo (Fase 1)

Juan hace clic en "Crear Torneo". Se abre el wizard:

**Paso 1: Deporte y Tipo** (Fase 1)
```
Deporte: ⚽ Fútbol
Tipo: Equipos
Formato: Fase de grupos + Eliminación directa
```

**Paso 2: Información Básica** (ya existe)
```
Nombre: Copa Antioquia Sub-15 Masculino 2026
Descripción: Torneo departamental de fútbol...
Fecha inicio: 15 de marzo 2026
Fecha fin: 26 de abril 2026
Ubicación: Canchas Sintéticas del Estadio, Medellín
Fecha límite inscripción: 5 de marzo 2026
```

**Paso 3: Categorías** (ya existe + adaptado Fase 1)
```
Categoría 1:
  Nombre: Sub-15 Masculino
  Género: Masculino
  Año nacimiento: 2011-2012
  Permite menores: Sí (máx 2 por equipo, nacidos 2013)
  Máx equipos: 24
  Mín equipos: 8
  Jugadores por equipo: 18 (mín 11)
```

**Paso 4: Documentos Requeridos** (ya existe)
```
✅ Registro Civil / TI (obligatorio)
✅ Certificado EPS vigente (obligatorio)
✅ Foto tipo documento (obligatorio)
✅ Autorización de padres (obligatorio, menores de 14)
```

**Paso 5: Staff** (ya existe)
```
Director del torneo: Juan Martínez
Comité disciplinario: María López
```

**Paso 6: Inscripción y Pagos** (Fase 6)
```
Cobrar inscripción: ✅ Sí
Monto: $200.000 COP por equipo
Moneda: COP
Auto-aprobar al pagar: Sí
```

**Paso 7: Premios** (Fase 1)
```
🥇 1°: Trofeo + $2.000.000 COP
🥈 2°: Trofeo + $1.000.000 COP
🥉 3°: Medallas
🏆 Goleador: Balón de oro + guayos
```

**Paso 8: Reglamento** (Fase 1)
```
Formato: PDF subido
Reglas especiales:
  - 2 tiempos de 30 minutos (fase grupos)
  - 2 tiempos de 35 minutos (eliminación)
  - Penales en eliminación si empate
  - Máximo 5 cambios por partido
  - Tarjeta roja = suspensión 1 partido mínimo
```

**Paso 9: Revisión y Publicar**

Juan revisa todo y hace clic en "Crear Torneo". Estado: **Borrador**.

---

### CAPÍTULO 2: CONVOCATORIA E INSCRIPCIONES

#### 2.1 — Invitar clubes (Fase 2)

Juan abre el torneo y va al tab "Invitaciones".

**Invitar clubes de Widdo:**
Juan busca "Antioquia" y aparecen 20 clubes registrados en Widdo en el departamento:
```
┌──────────────────────────────────────────────────┐
│  Buscar clubes Widdo: [Antioquia          ] 🔍   │
│                                                  │
│  ✅ Club Siempre Fuertes (Medellín) — 45 jugadores│
│  ✅ Independiente Medellín Sub (Medellín) — 60     │
│  ✅ Academia Envigado (Envigado) — 38              │
│  ✅ Club Deportivo Itagüí (Itagüí) — 32           │
│  ... 16 más                                      │
│                                                  │
│  [Invitar 20 seleccionados]                      │
└──────────────────────────────────────────────────┘
```

Backend envía 20 emails con link personalizado + botón "Ver Torneo".

**Invitar clubes externos (no están en Widdo):**
Juan pega una lista de 10 emails de clubes que conoce:
```
contacto@clubrionegro.com, info@academiacaldas.co, ...
```

Backend envía 10 emails con link de inscripción pública: `widdo.co/inscribirse/copa-antioquia-sub15-2026?token=abc123`

Juan también copia el link público y lo comparte en WhatsApp/Instagram.

**Estado del torneo cambia a: Abierto (inscripciones abiertas).**

#### 2.2 — Los clubes se inscriben (Fase 2)

**Club Widdo (Club Siempre Fuertes):**

El owner del club, Diego, ve la invitación en su dashboard:
```
┌──────────────────────────────────────────────────┐
│  📩 Invitaciones a Torneos                        │
│                                                  │
│  Copa Antioquia Sub-15 Masculino 2026            │
│  ⚽ Fútbol — 15 mar al 26 abr — Medellín         │
│  Inscripción: $200.000 COP                       │
│  Plazas: 24 equipos                              │
│                                                  │
│  [Ver Detalle]  [Inscribir mi Equipo]            │
└──────────────────────────────────────────────────┘
```

Diego hace clic en "Inscribir mi Equipo":

```
Paso 1: Seleccionar categoría
→ Sub-15 Masculino (nacidos 2011-2012)

Paso 2: Nombre del equipo para el torneo
→ "Siempre Fuertes FC" (puede ser diferente al nombre del club)

Paso 3: Seleccionar jugadores
┌──────────────────────────────────────────────────┐
│  Jugadores elegibles de tu club:                  │
│                                                  │
│  ✅ Juan Pérez — 12/03/2011 (14 años) ✓ en rango │
│  ✅ Carlos López — 08/07/2011 (14 años) ✓         │
│  ✅ Pedro Gómez — 22/11/2012 (13 años) ✓          │
│  ✅ Santiago Torres — 15/03/2013 (12 años) ⚠️ menor│
│  ... 14 más                                      │
│                                                  │
│  18 / 18 seleccionados (2 menores de 18 permitidos)│
│                                                  │
│  [Confirmar Plantilla]                           │
└──────────────────────────────────────────────────┘
```

Paso 4: Pago
→ Wompi widget se carga → Diego paga $200.000 COP
→ Pago confirmado → Inscripción automáticamente aprobada

```
✅ ¡Inscripción completada!
Tu equipo "Siempre Fuertes FC" está inscrito en la Copa Antioquia Sub-15.
Documentos pendientes: 3 jugadores (EPS)
Te notificaremos cuando el fixture esté listo.
```

**Club externo (Club Rionegro — no está en Widdo):**

El contacto del Club Rionegro recibe email con link. Hace clic:
```
widdo.co/inscribirse/copa-antioquia-sub15-2026?token=xyz789
```

Ve la página pública del torneo:
```
┌──────────────────────────────────────────────────┐
│  🏆 Copa Antioquia Sub-15 Masculino 2026          │
│  ⚽ Fútbol — 15 mar al 26 abr — Medellín          │
│  Organiza: Copa T&E                               │
│                                                  │
│  Categoría: Sub-15 Masculino                      │
│  Equipos inscritos: 8 / 24                        │
│  Inscripción: $200.000 COP                        │
│                                                  │
│  [Inscribir mi Equipo →]                          │
└──────────────────────────────────────────────────┘
```

Hace clic y como no tiene cuenta:
```
1. Registro rápido → Crea cuenta en Widdo (plan gratis)
2. Crear club → "Club Deportivo Rionegro", ciudad, logo
3. Agregar jugadores → Nombre, documento, fecha nacimiento (18 jugadores)
4. Seleccionar categoría → Sub-15 Masculino
5. Pagar → $200.000 COP
6. ✅ Inscrito
```

**El Club Rionegro ahora está en Widdo con plan gratis.** Puede usar Widdo para gestionar su club. Si le gusta → upgrade a plan pago. **Canal de adquisición a costo $0.**

#### 2.3 — El organizador gestiona inscripciones (Fase 2 + Agente IA Fase 3)

Después de 2 semanas, Juan abre su dashboard:

```
📋 Inscripciones — Copa Antioquia Sub-15
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sub-15 Masculino: 22 / 24 equipos

✅ Aprobados (20):
  Club Siempre Fuertes — pagado, docs 15/18 ✅
  Independiente Medellín Sub — pagado, docs 18/18 ✅
  Academia Envigado — pagado, docs 16/18 ⚠️
  Club Deportivo Itagüí — pagado, docs 18/18 ✅
  ... 16 más

⏳ Pendientes (2):
  Club Caldas — pago pendiente
  Club Girardota — docs incompletos (4/18)

📊 Recaudado: $4.000.000 COP
📊 Pendiente: $400.000 COP
```

**Juan habla con el agente IA:**
```
Juan:    "¿Cuántos clubes tienen documentos pendientes?"

Agente:  "8 clubes tienen documentos incompletos:
          • Club Siempre Fuertes: 3 EPS faltantes
          • Academia Envigado: 2 fotos faltantes
          ... (6 más)

          ¿Quieres que envíe recordatorio masivo?"

Juan:    "Sí, envía recordatorio a todos los que les faltan docs"

Agente:  "✅ Enviados 8 emails de recordatorio con detalle de
          documentos faltantes por jugador."
```

```
Juan:    "Dale plazo hasta mañana a Club Caldas. Si no pagan, quedan fuera."

Agente:  "✅ Envié ultimátum a Club Caldas:
          'Tienen hasta viernes 6 de marzo a las 6pm para
          completar el pago. De lo contrario, su inscripción
          será cancelada.'

          Te aviso mañana a las 6pm."
```

Al día siguiente:
```
Agente:  "⏰ Resultado del ultimátum:
          ✅ Club Caldas pagó ($200.000)

          22 equipos confirmados. ¿Cierro inscripciones?"

Juan:    "Sí, cierra."

Agente:  "✅ Inscripciones cerradas. 22 equipos confirmados.
          Total recaudado: $4.400.000 COP
          Comisión Widdo (5%): $220.000
          Neto para ti: $4.180.000 COP

          ¿Quieres que genere el fixture?"
```

---

### CAPÍTULO 3: GENERACIÓN DEL FIXTURE

#### 3.1 — Generar fase de grupos (Fase 3)

```
Juan:    "Genera el fixture. Quiero fase de grupos con clasificación
          a eliminación. Los mejores clasifican a cuartos."

Agente:  "Con 22 equipos, opciones para fase de grupos:

          A) 4 grupos de 5 + 1 grupo de 2
             → Desbalanceado (un grupo juega 1 partido, otros juegan 10)

          B) 6 grupos: 4 de 4 + 2 de 3
             → Clasifican 12 (2 por grupo) → octavos
             ⚠️ Grupos de 3 tienen menos partidos

          C) 4 grupos de 5 + descartar 2 equipos en waitlist
             → 20 equipos, 4 grupos de 5 perfectos

          D) 5 grupos de 4 + 1 grupo de 2 (22 equipos)
             → Clasifican 10 + 2 mejores terceros = 12 → octavos

          Recomiendo B: 6 grupos (4 de 4 + 2 de 3).
          Clasifican los 2 primeros = 12 equipos → octavos.
          ¿O prefieres otra opción?"

Juan:    "Vamos con la B. 6 grupos, clasifican los 2 primeros."

Agente:  "Sorteo realizado:

          GRUPO A (4 equipos):
          1. Siempre Fuertes FC
          2. Club Sabaneta
          3. Club Rionegro ⭐ (nuevo en Widdo)
          4. Academia Caldas

          GRUPO B (4 equipos):
          1. Independiente Medellín Sub
          2. Club Deportivo Bello
          3. Club Copacabana
          4. Club Yarumal

          GRUPO C (4 equipos):
          1. Academia Envigado
          2. Club Deportivo Itagüí
          3. Club La Estrella
          4. Club Santa Rosa

          GRUPO D (4 equipos):
          1. Club Turbo
          2. Club Apartadó
          3. Club Caucasia
          4. Club Carmen de Viboral

          GRUPO E (3 equipos):
          1. Club Marinilla
          2. Club Andes
          3. Club Jericó

          GRUPO F (3 equipos):
          1. Club Girardota
          2. Club Barbosa
          3. Club San Juan

          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          Fase de grupos: 33 partidos
          Grupos de 4: 6 partidos c/u (3 jornadas) × 4 = 24
          Grupos de 3: 3 partidos c/u (3 jornadas) × 2 = 6
          Más: 3 partidos de jornada libre

          Clasifican 12 equipos → Octavos (12 no es potencia de 2)
          → 4 equipos van directo a cuartos (1°s de los 4 mejores grupos)
          → 8 equipos juegan octavos (4 partidos)
          → Cuartos con 8 equipos

          ¿Quieres que programe horarios y canchas?"
```

#### 3.2 — Programar horarios (Fase 3)

```
Juan:    "Tenemos 3 canchas. Sábados de 8am a 6pm. Domingos de 8am a 1pm.
          Partidos de 60 minutos + 15 de descanso."

Agente:  "Con 3 canchas y partidos de 75 min (60 + 15 descanso):

          Por sábado: 8 partidos × 3 canchas = 24 partidos
          Por domingo mañana: 4 partidos × 3 canchas = 12 partidos

          JORNADA 1 — Sábado 15 de marzo
          ─────────────────────────────────
          Cancha 1:
            8:00  Siempre Fuertes vs Club Sabaneta (Grupo A)
            9:15  Indep. Medellín vs Club Bello (Grupo B)
            10:30 Acad. Envigado vs Club Itagüí (Grupo C)
            11:45 Club Turbo vs Club Apartadó (Grupo D)
            13:00 Club Marinilla vs Club Andes (Grupo E)
            14:15 Club Girardota vs Club Barbosa (Grupo F)

          Cancha 2:
            8:00  Club Rionegro vs Acad. Caldas (Grupo A)
            9:15  Club Copacabana vs Club Yarumal (Grupo B)
            10:30 Club La Estrella vs Club Santa Rosa (Grupo C)
            11:45 Club Caucasia vs Club Carmen (Grupo D)
            13:00 Club Jericó vs Libre (Grupo E — no juega)
            14:15 Club San Juan vs Libre (Grupo F — no juega)

          Cancha 3: (reserva para partidos aplazados)

          JORNADA 2 — Sábado 22 de marzo
          [... fixture completo ...]

          JORNADA 3 — Sábado 29 de marzo
          [... fixture completo ...]

          Total fase de grupos: 33 partidos en 3 sábados

          ¿Publico el fixture?"

Juan:    "Sí, publica y manda a todos los clubes."

Agente:  "✅ Publicado en widdo.co/torneo/copa-antioquia-sub15-2026
          📧 22 emails enviados. Cada club recibió SUS partidos
          con fechas, horas y canchas.
          📱 Link para compartir en redes generado."
```

---

### CAPÍTULO 4: DÍA DEL TORNEO — JORNADA 1

#### 4.1 — Mañana del sábado 15 de marzo (Fase 5)

```
Agente:  "📋 Buenos días Juan. Hoy: Jornada 1 — Copa Antioquia Sub-15

          12 partidos programados (2 canchas, 8:00-15:30)

          Estado de equipos:
          ✅ 20/22 equipos confirmaron asistencia
          ⚠️ 1 sin confirmar: Club Yarumal
          ❌ 1 avisó que no viene: Club Jericó (bus se dañó)

          Club Jericó tiene libre en Jornada 1 (Grupo E).
          Su primer partido real es Jornada 2.
          Pero avisaron que no vienen AL TORNEO COMPLETO.

          ¿Qué hacemos con Club Jericó?"

Juan:    "Si no vienen a ningún partido, retíralos del torneo.
          Sus partidos son walkover para los rivales."

Agente:  "✅ Club Jericó retirado del torneo.

          Grupo E queda con 2 equipos:
          Club Marinilla vs Club Andes (1 solo partido)
          Los otros 2 partidos son W.O.:
          • Marinilla vs Jericó → W.O. Marinilla (3-0)
          • Andes vs Jericó → W.O. Andes (3-0)

          El Grupo E tiene poco sentido con 2 equipos.
          ¿Quieres:
          A) Dejar así (2 equipos, 1 partido real + 2 W.O.)
          B) Pasar al mejor equipo de espera al Grupo E
          C) Fusionar Grupo E y F (5 equipos, un super-grupo)

          Recomiendo A: ya está publicado el fixture."

Juan:    "Sí, déjalo así. Es lo más simple."
```

#### 4.2 — Primer partido: Scoring en vivo (Fase 5)

Juan abre su celular y va al partido de las 8:00, Cancha 1:

**Siempre Fuertes FC vs Club Sabaneta**

Juan (o un delegado) abre la planilla digital:

```
┌──────────────────────────────────────────────────┐
│  ⚽ PLANILLA EN VIVO — Cancha 1                   │
│                                                  │
│  🟢 Siempre Fuertes    vs    Club Sabaneta 🔵    │
│                                                  │
│         0                    0                   │
│                                                  │
│  ⏱️ 1T — 00:00                    [▶️ Iniciar]   │
│                                                  │
│  ┌──────────────┐      ┌──────────────┐         │
│  │   ⚽ GOL     │      │   ⚽ GOL     │         │
│  └──────────────┘      └──────────────┘         │
│                                                  │
│  [🟡 Amarilla] [🔴 Roja] [🔄 Cambio]            │
│                                                  │
│  Eventos: (vacío)                                │
│                                                  │
│  [◀️ Deshacer]                                    │
│  [Fin 1T]  [Fin Partido]                        │
└──────────────────────────────────────────────────┘
```

Juan toca [▶️ Iniciar]. Cronómetro empieza.

**Minuto 12 — Gol de Siempre Fuertes:**
Juan toca [⚽ GOL] del lado izquierdo. Aparece selección rápida de jugadores:
```
¿Quién anotó?
[#7 Juan Pérez] [#10 Carlos López] [#9 Pedro Gómez]
[#4 Andrés M.] [#11 Diego S.] [Skip — solo sumar gol]
```
Toca [#7 Juan Pérez].

```
⏱️ 12' ⚽ Juan Pérez (#7) — Siempre Fuertes 1 - 0 Club Sabaneta
```

**WebSocket dispara `ScoreUpdated` → Portal público se actualiza en tiempo real.**

En `widdo.co/torneo/copa-antioquia-sub15-2026/vivo`:
```
🔴 EN VIVO

Cancha 1: Siempre Fuertes 1 - 0 Club Sabaneta (12')
Cancha 2: Club Rionegro 0 - 0 Acad. Caldas (15')
```

**Minuto 23 — Tarjeta amarilla:**
Juan toca [🟡 Amarilla] → selecciona equipo "Club Sabaneta" → jugador #6 Luis Gómez.
```
⏱️ 23' 🟡 Luis Gómez (#6) — Club Sabaneta
```

**Minuto 30 — Fin del primer tiempo:**
Juan toca [Fin 1T].
```
Fin del primer tiempo.
Siempre Fuertes 1 - 0 Club Sabaneta

Resumen 1T:
⚽ 12' Juan Pérez (SF)
🟡 23' Luis Gómez (SAB)

[Iniciar 2T]
```

**Segundo tiempo — Minuto 47:**
Gol de Club Sabaneta. Juan toca [⚽ GOL] → #9 Mateo Ríos.
```
Siempre Fuertes 1 - 1 Club Sabaneta
```

**Minuto 55:**
Gol de Siempre Fuertes. Juan toca [⚽ GOL] → #10 Carlos López.
```
Siempre Fuertes 2 - 1 Club Sabaneta
```

**Minuto 58:**
Otro gol de Siempre Fuertes. → #7 Juan Pérez (doblete).
```
Siempre Fuertes 3 - 1 Club Sabaneta
```

**Minuto 60 — Fin del partido:**
Juan toca [Fin Partido].

```
✅ PARTIDO FINALIZADO

Siempre Fuertes FC 3 - 1 Club Sabaneta

⚽ 12' Juan Pérez (SF)
⚽ 47' Mateo Ríos (SAB)
⚽ 55' Carlos López (SF)
⚽ 58' Juan Pérez (SF)
🟡 23' Luis Gómez (SAB)

Tabla Grupo A actualizada:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                PJ  PG  PE  PP  GF  GC  DG  PTS
Siempre Fuertes  1   1   0   0   3   1  +2   3
Rionegro         0   0   0   0   0   0   0   0
Acad. Caldas     0   0   0   0   0   0   0   0
Club Sabaneta    1   0   0   1   1   3  -2   0

Siguiente partido Cancha 1: 9:15
Indep. Medellín vs Club Bello (Grupo B)
```

#### 4.3 — Imprevistos durante la jornada (Fase 3 + 5)

**Situación 1: Club Yarumal no llega**
```
Juan:    "Club Yarumal no llegó al partido de las 9:15.
          Ya pasaron 15 minutos."

Agente:  "Según el reglamento, tolerancia de 15 minutos superada.

          Opciones:
          A) W.O. para Club Copacabana (3-0)
          B) Esperar 15 min más
          C) Reprogramar

          ¿Qué prefieres?"

Juan:    "Walkover."

Agente:  "✅ W.O. registrado. Copacabana gana 3-0.
          Tabla Grupo B actualizada.
          Club Yarumal notificado."
```

**Situación 2: Lluvia fuerte**
```
Juan:    "Empezó a llover muy fuerte. La cancha 2 se inundó.
          Suspende los partidos de cancha 2."

Agente:  "Partidos suspendidos en Cancha 2:

          Rionegro vs Acad. Caldas — 2T, minuto 52, va 1-1
          (Guardé marcador parcial y minuto)

          Próximos en cancha 2:
          La Estrella vs Santa Rosa (10:30) — no empezó
          Caucasia vs Carmen (11:45) — no empezó

          Opciones:
          A) Mover partidos pendientes a Cancha 3 (está libre)
          B) Reprogramar para mañana domingo
          C) Esperar que pare la lluvia

          El partido Rionegro vs Caldas se debe completar
          desde donde iba (minuto 52, 1-1)."

Juan:    "Mueve todo a Cancha 3. El partido suspendido
          lo completan en Cancha 3 cuando termine de llover."

Agente:  "✅ Movidos a Cancha 3:
          • 10:30 La Estrella vs Santa Rosa (confirmado)
          • 11:45 Caucasia vs Carmen (confirmado)
          • Rionegro vs Caldas: pendiente de reanudación
            (se reanuda desde min 52, 1-1)

          Equipos notificados del cambio de cancha."
```

#### 4.4 — Mientras tanto, el público ve en vivo (Fase 4 + 5)

Un padre de un jugador de Siempre Fuertes abre en su celular:
```
widdo.co/torneo/copa-antioquia-sub15-2026/vivo
```

Ve:
```
🔴 EN VIVO — Copa Antioquia Sub-15

Cancha 1: Indep. Medellín 2 - 0 Club Bello (38')
Cancha 3: La Estrella 0 - 1 Santa Rosa (22')

Resultados de hoy:
✅ Siempre Fuertes 3 - 1 Club Sabaneta
✅ Club Copacabana 3 - 0 Club Yarumal (W.O.)
⏸️ Club Rionegro 1 - 1 Acad. Caldas (suspendido min 52)

👥 127 personas viendo ahora
```

Sin login, sin app, solo el link.

---

### CAPÍTULO 5: DESPUÉS DE LA FASE DE GRUPOS

#### 5.1 — 3 jornadas completadas (Fase 3 + 7)

Después de 3 sábados, todos los partidos de grupos se jugaron.

```
Agente:  "📋 Fase de grupos completada. Resultados finales:

          GRUPO A          PJ  PG  PE  PP  GF  GC  DG  PTS
          Siempre Fuertes   3   3   0   0   9   2  +7   9  🟢
          Club Rionegro     3   2   0   1   5   3  +2   6  🟢
          Acad. Caldas      3   1   0   2   3   5  -2   3
          Club Sabaneta     3   0   0   3   1   8  -7   0

          GRUPO B          PJ  PG  PE  PP  GF  GC  DG  PTS
          Indep. Medellín   3   3   0   0   8   1  +7   9  🟢
          Club Copacabana   3   2   0   1   6   3  +3   6  🟢
          Club Bello        3   1   0   2   4   6  -2   3
          Club Yarumal      3   0   0   3   0   8  -8   0

          GRUPO C          PJ  PG  PE  PP  GF  GC  DG  PTS
          Acad. Envigado    3   2   1   0   6   2  +4   7  🟢
          Club Itagüí       3   2   0   1   5   3  +2   6  🟢
          Club La Estrella  3   1   0   2   3   5  -2   3
          Club Santa Rosa   3   0   1   2   2   6  -4   1

          GRUPO D          PJ  PG  PE  PP  GF  GC  DG  PTS
          Club Turbo        3   2   1   0   5   1  +4   7  🟢
          Club Apartadó     3   1   2   0   4   3  +1   5  🟢
          Club Caucasia     3   1   1   1   3   3   0   4
          Club Carmen       3   0   0   3   1   6  -5   0

          GRUPO E          PJ  PG  PE  PP  GF  GC  DG  PTS
          Club Marinilla    2   2   0   0   6   1  +5   6  🟢
          Club Andes        2   1   0   1   2   3  -1   3  🟢
          Club Jericó       RETIRADO

          GRUPO F          PJ  PG  PE  PP  GF  GC  DG  PTS
          Club Girardota    2   2   0   0   4   1  +3   6  🟢
          Club Barbosa      2   1   0   1   3   3   0   3  🟢
          Club San Juan     2   0   0   2   1   4  -3   0

          CLASIFICADOS (12 equipos):
          2 primeros de cada grupo = 12 equipos

          12 no es potencia de 2 para eliminación directa.
          Opciones:
          A) 4 mejores 1°s van directo a cuartos + 8 restantes juegan octavos
          B) 12 equipos: 4 BYEs (1°s de los 4 mejores grupos pasan directo)
          C) Sorteo octavos: 4 partidos → 8 cuartos... no, 12 no funciona limpio

          Recomiendo A:
          • Top 4 (mejores 1°s): directo a cuartos
          • Los otros 8 juegan octavos (4 partidos)
          • Cuartos: 4 + 4 ganadores = 8 equipos (perfecto)

          ¿Vamos con A?"

Juan:    "Sí, con la opción A. Los 4 mejores primeros directo
          a cuartos."

Agente:  "Ranking de primeros de grupo:
          1. Siempre Fuertes (9pts, +7 DG) → DIRECTO A CUARTOS
          2. Indep. Medellín (9pts, +7 DG) → DIRECTO A CUARTOS
          3. Acad. Envigado (7pts, +4 DG) → DIRECTO A CUARTOS
          4. Club Turbo (7pts, +4 DG) → DIRECTO A CUARTOS

          Octavos (8 equipos):
          5. Marinilla (1° Grupo E)
          6. Girardota (1° Grupo F)
          7. Rionegro (2° Grupo A)
          8. Copacabana (2° Grupo B)
          9. Itagüí (2° Grupo C)
          10. Apartadó (2° Grupo D)
          11. Andes (2° Grupo E)
          12. Barbosa (2° Grupo F)

          Cruces de octavos (1° vs 2° de diferente grupo):
          OCT-1: Marinilla vs Barbosa
          OCT-2: Girardota vs Andes
          OCT-3: Rionegro vs Itagüí
          OCT-4: Copacabana vs Apartadó

          Cuartos:
          CF-1: Siempre Fuertes vs Ganador OCT-1
          CF-2: Indep. Medellín vs Ganador OCT-2
          CF-3: Acad. Envigado vs Ganador OCT-3
          CF-4: Club Turbo vs Ganador OCT-4

          Semis → Final → 3er puesto

          ¿Programo para el sábado 5 de abril (octavos) y
          sábado 12 (cuartos)?
          Semis el 19, final el 26."

Juan:    "Perfecto, programa así. La final a las 4pm."

Agente:  "✅ Fixture de eliminación generado y publicado.

          SÁB 5 ABR — OCTAVOS DE FINAL
          8:00 C1: Marinilla vs Barbosa
          8:00 C2: Girardota vs Andes
          9:30 C1: Rionegro vs Itagüí
          9:30 C2: Copacabana vs Apartadó

          SÁB 12 ABR — CUARTOS DE FINAL
          8:00 C1: Siempre Fuertes vs Gan. OCT-1
          8:00 C2: Indep. Medellín vs Gan. OCT-2
          10:00 C1: Acad. Envigado vs Gan. OCT-3
          10:00 C2: Club Turbo vs Gan. OCT-4

          SÁB 19 ABR — SEMIFINALES
          10:00 C1: Gan. CF-1 vs Gan. CF-4
          12:00 C1: Gan. CF-2 vs Gan. CF-3

          SÁB 26 ABR — FINAL
          14:00 C1: 3er y 4to puesto
          16:00 C1: GRAN FINAL 🏆

          22 clubes notificados."
```

---

### CAPÍTULO 6: ELIMINACIÓN DIRECTA

#### 6.1 — Octavos de final (Fase 3 + 5)

Los partidos de eliminación se juegan igual que en fase de grupos, con la planilla digital.

**Pero hay un empate en el minuto 60:**
```
Cancha 1: Club Rionegro 1 - 1 Club Itagüí — 60'

Juan toca [Fin Partido].

Agente:  "⚠️ Empate 1-1 en eliminación directa.
          Según la configuración del torneo:
          → Penales directos (no hay tiempo extra configurado)

          ¿Inicio tanda de penales?"

Juan:    "Sí."
```

La planilla cambia a modo penales:
```
┌──────────────────────────────────────────────────┐
│  ⚽ PENALES — Rionegro vs Itagüí                  │
│                                                  │
│  Rionegro        Itagüí                          │
│  ──────────      ──────────                      │
│  1. ✅ Gol       1. ✅ Gol                        │
│  2. ✅ Gol       2. ❌ Fallo                      │
│  3. ❌ Fallo     3. ✅ Gol                        │
│  4. ✅ Gol       4. ✅ Gol                        │
│  5. ✅ Gol       5. (por patear)                  │
│                                                  │
│  Rionegro 4 - 3 Itagüí                           │
│                                                  │
│  [⚽ Gol] [❌ Fallo]  ← Itagüí patea el 5to      │
└──────────────────────────────────────────────────┘
```

Itagüí mete el 5to: 4-4. Van a muerte súbita.

```
│  6. (por patear)  6. (por patear)                │
```

Rionegro mete, Itagüí falla:
```
✅ Club Rionegro gana por penales 5-4
(Partido: 1-1 — Penales: 5-4)

Rionegro avanza a Cuartos de Final.
→ CF-3: Acad. Envigado vs Club Rionegro (sáb 12 abr, 10:00)
```

#### 6.2 — Hasta la final (Fase 3)

Semanas pasan. Los cuartos, semis y la final se juegan con la misma dinámica.

**Gran Final:**
```
✅ GRAN FINAL — Sábado 26 de abril, 4:00pm

Siempre Fuertes FC  2 - 1  Independiente Medellín Sub

⚽ 22' Juan Pérez (SF)
⚽ 38' Santiago Restrepo (IM)
⚽ 72' Carlos López (SF)
🟡 45' Luis Herrera (IM)
🟡 68' Diego Sánchez (SF)

🏆 CAMPEÓN: SIEMPRE FUERTES FC
```

---

### CAPÍTULO 7: POST-TORNEO

#### 7.1 — Resultados y estadísticas (Fase 7)

```
Agente:  "🏆 COPA ANTIOQUIA SUB-15 2026 — FINALIZADO

          🥇 Campeón: Siempre Fuertes FC
          🥈 Subcampeón: Independiente Medellín Sub
          🥉 3er puesto: Academia Envigado

          📊 ESTADÍSTICAS DEL TORNEO:
          • 37 partidos jugados (34 regulares + 3 W.O.)
          • 22 equipos participantes (1 retirado)
          • 396 jugadores
          • 89 goles anotados (2.4 goles/partido)
          • 45 tarjetas amarillas, 3 rojas

          ⚽ GOLEADOR: Juan Pérez (Siempre Fuertes) — 8 goles
          ⚽ 2°: Santiago Restrepo (Indep. Med.) — 6 goles
          ⚽ 3°: Mateo Ríos (Club Sabaneta) — 5 goles

          🏆 MVP: Juan Pérez — 8 goles + 3 asistencias en 9 partidos

          🛡️ Mejor defensa: Club Turbo — 3 goles recibidos en 6 partidos

          💰 FINANCIERO:
          • Recaudado: $4.200.000 COP (21 equipos pagaron, 1 retirado sin reembolso)
          • Comisión Widdo (5%): $210.000 COP
          • Neto organizador: $3.990.000 COP

          ¿Qué quieres hacer?"
```

#### 7.2 — Publicar y compartir (Fase 4)

```
Juan:    "Publica los resultados finales."

Agente:  "✅ Publicado en widdo.co/torneo/copa-antioquia-sub15-2026

          La página ahora muestra:
          ✅ Podio (campeón, sub, tercero)
          ✅ Bracket completo con todos los resultados
          ✅ Tabla de posiciones final por grupo
          ✅ Goleadores y estadísticas
          ✅ Todos los partidos con resultados

          📧 Email enviado a los 22 clubes con resumen.
          📱 Link listo para compartir en redes."
```

#### 7.3 — Informe oficial (Fase 7)

```
Juan:    "Necesito un informe para Indeportes Antioquia."

Agente:  "📋 Generé informe completo:

          • Acta del torneo (datos generales, fechas, sedes)
          • Listado de 22 equipos y 396 jugadores
          • Resultados de los 37 partidos
          • Tablas de posiciones
          • Bracket de eliminación
          • Estadísticas individuales y por equipo
          • Incidencias (1 retiro, 1 suspensión por lluvia, 3 W.O.)
          • Informe financiero
          • Sanciones disciplinarias (3 rojas)

          📄 Disponible en PDF. ¿Lo envío a algún email?"

Juan:    "Sí, a indeportes@antioquia.gov.co"

Agente:  "✅ Enviado."
```

#### 7.4 — Efecto de red (Resultado para Widdo)

Resultado del torneo para el negocio de Widdo:

```
ANTES del torneo:
  20 clubes en Widdo Antioquia

DESPUÉS del torneo:
  20 clubes originales
  + 2 clubes nuevos que se registraron para participar (plan gratis)
  = 22 clubes en Widdo

  De los 2 nuevos:
  • Club Rionegro: llegó a cuartos, sus jugadores y padres usaron Widdo
    para ver resultados en vivo. El owner vio las funcionalidades →
    "Esto es mejor que mi Excel" → UPGRADE a plan pago ($129K/mes)
  • Club Jericó: se retiró, probablemente no se queda.
    Pero su cuenta sigue ahí para el próximo torneo.

REVENUE GENERADO:
  • Comisión Widdo: $210.000 COP (~$50 USD)
  • 1 nuevo suscriptor: $129.000 COP/mes recurrente
  • Exposición: 127 personas vieron en vivo → conocen Widdo
  • El organizador Juan crea otro torneo el próximo mes → más clubes entran
```

**Cada torneo es un canal de adquisición a costo $0.**

---

---

# SIMULACIONES ADICIONALES: DEPORTES INDIVIDUALES Y ESPECIALES

## Simulación 2: Torneo de Tenis — Eliminación Directa

### Creación (Fase 0 + 1)
```
Organizador: "Quiero un torneo de tenis. Abierto masculino y femenino.
              32 jugadores por categoría. Eliminación directa.
              Mejor de 3 sets. Canchas de tierra batida."

Agente:      "Creé torneo de tenis:
              🎾 Tipo: Individual
              🏆 Formato: Eliminación directa
              📊 Sets: Mejor de 3 (tiebreak a 6-6)

              2 categorías:
              • Abierto Masculino: 32 jugadores → 31 partidos
              • Abierto Femenino: 32 jugadoras → 31 partidos
              Total: 62 partidos

              ¿Inscripción individual (sin club) o por club?"

Organizador: "Individual. Cada jugador se inscribe solo."
```

### Inscripción individual (Fase 2 — adaptación)

Los jugadores se inscriben directamente, sin necesidad de club:
```
widdo.co/inscribirse/torneo-tenis-abierto-2026

┌──────────────────────────────────────────────────┐
│  🎾 Torneo Abierto de Tenis 2026                 │
│  Categoría: Abierto Masculino (28/32 plazas)     │
│                                                  │
│  Nombre: [____________]                          │
│  Documento: [____________]                       │
│  Fecha nacimiento: [__/__/____]                  │
│  Ranking (opcional): [____]                      │
│  Club/Academia (opcional): [____________]        │
│  Foto: [Subir]                                   │
│                                                  │
│  Inscripción: $50.000 COP                        │
│  [Inscribirme]                                   │
└──────────────────────────────────────────────────┘
```

### Bracket con seeding (Fase 3)
```
Organizador: "Genera el bracket. Los 8 mejores rankeados son cabezas de serie."

Agente:      "Bracket generado con seeding:
              [1] Pérez vs [32] González    ← 1° seed vs último
              [16] Morales vs [17] Ríos
              ...
              [2] López vs [31] Torres      ← 2° seed en la otra mitad

              1° y 2° seed en lados opuestos del bracket.
              No se cruzan hasta la final.

              5 rondas: R32 → R16 → QF → SF → F
              ¿Programo horarios?"
```

### Scoring en vivo — SetsGamesAdapter (Fase 5)
```
Organizador: "Empezó el partido Pérez vs González. Cancha 1."

Planilla digital:
┌──────────────────────────────────────┐
│  🎾 [1] Pérez  vs  [32] González    │
│                                      │
│  Sets:  0        0                   │
│  Game:  0   -    0                   │
│  Pts:   0   -    0                   │
│                                      │
│  Sirviendo: Pérez 🎾                 │
│                                      │
│  [Punto Pérez]    [Punto González]   │
│  [💨 Ace] [❌ Doble falta]           │
│                                      │
│  [◀️ Deshacer]                       │
└──────────────────────────────────────┘

Toque "Punto Pérez" → 15-0
Toque "Punto Pérez" → 30-0
Toque "Punto González" → 30-15
Toque "💨 Ace" (Pérez) → 40-15
Toque "Punto Pérez" → Game Pérez. 1-0, cambio de servicio.

[... partido continúa ...]

Resultado final:
Pérez def. González: 6-4, 6-7(5), 6-2

Pérez avanza a R16.
Bracket actualizado automáticamente.
```

### Escenarios especiales de tenis
```
Organizador: "El partido de cancha 3 se suspendió por lluvia.
              Van en el segundo set, Morales gana 6-3, 4-4."

Agente:      "Partido suspendido. Guardé:
              Morales 6-3, 4-4 Ríos (sirviendo Ríos)
              Se reanuda mañana desde 4-4 en el 2° set."

Organizador: "López se retiró del torneo por lesión antes de cuartos."

Agente:      "López se retira. Su rival (Torres) avanza a semis
              por W.O. Bracket actualizado."
```

---

## Simulación 3: Torneo de Judo — Por Categorías de Peso

### Creación (Fase 0 + 1)
```
Organizador: "Torneo departamental de judo sub-18. 5 categorías de peso.
              Eliminación directa. Combates de 4 minutos."

Agente:      "Creé torneo de judo:
              🥋 Tipo: Individual
              5 categorías de peso:
              • -60 kg Masculino
              • -66 kg Masculino
              • -73 kg Masculino
              • -81 kg Masculino
              • +81 kg Masculino

              Formato: Eliminación directa por categoría
              ¿Quieres agregar categorías femeninas?"

Organizador: "Sí, las mismas 5 pero en femenino."

Agente:      "10 categorías total (5 masc + 5 fem).
              ¿Inscripción por club o individual?"

Organizador: "Por club. Cada club inscribe a sus judokas."
```

### Scoring en vivo — RoundsPointsAdapter (Fase 5)
```
Planilla digital (combate de judo):
┌──────────────────────────────────────┐
│  🥋 -66kg Masc — Cuartos de Final   │
│                                      │
│  García         vs        López      │
│  Waza-ari: 1              0          │
│  Shidos:   0              1          │
│                                      │
│  ⏱️ 2:45 / 4:00                      │
│                                      │
│  García:            López:           │
│  [🥇 Ippon]        [🥇 Ippon]        │
│  [🥈 Waza-ari]     [🥈 Waza-ari]     │
│  [🟡 Shido]        [🟡 Shido]        │
│                                      │
│  [◀️ Deshacer] [Fin Combate]         │
└──────────────────────────────────────┘

Toque [🥇 Ippon] para García →
  "¡IPPON! García gana el combate.
   García avanza a semifinal."

--- O si no hay ippon al terminar el tiempo: ---

⏱️ Tiempo agotado.
García: 1 Waza-ari, 0 Shidos
López: 0 Waza-ari, 1 Shido

García gana por decisión (más técnicas de scoring, menos penalizaciones).

--- O si hay empate: ---

"Empate. Se va a Golden Score (tiempo extra ilimitado).
 El primero que anote cualquier técnica, gana."
```

---

## Simulación 4: Torneo de Natación — Series y Tiempos

### Creación (Fase 0 + 1)
```
Organizador: "Torneo de natación infantil. 50m libre, 100m libre,
              200m libre. Categorías: 10-11 años, 12-13 años, 14-15 años.
              Masculino y femenino. 50 nadadores inscritos."

Agente:      "Creé torneo de natación:
              🏊 Tipo: Individual contra tiempo
              9 pruebas (3 distancias × 3 categorías de edad)
              × 2 géneros = 18 eventos

              Formato: Series clasificatorias → Final (8 mejores tiempos)
              ¿Cuántos carriles tiene la piscina?"

Organizador: "6 carriles"

Agente:      "Con ~50 nadadores por género y 6 carriles:

              Ejemplo para 50m Libre Masc 12-13 (18 nadadores):
              • 3 series de 6 nadadores
              • Los 8 mejores tiempos van a la final

              Total estimado: ~54 series + 18 finales = 72 carreras
              ¿Programo horarios? ¿Cuántos minutos entre series?"

Organizador: "3 minutos entre series, 10 minutos entre pruebas."
```

### Scoring — TimesMarksAdapter (Fase 5)
```
Planilla digital (serie de natación):
┌──────────────────────────────────────┐
│  🏊 50m Libre Masc 12-13 — Serie 2/3│
│                                      │
│  Carril 1: García, M.    [  :  .  ] │
│  Carril 2: López, J.     [  :  .  ] │
│  Carril 3: Pérez, A.     [  :  .  ] │
│  Carril 4: Ríos, D.      [  :  .  ] │
│  Carril 5: Torres, S.    [  :  .  ] │
│  Carril 6: Gómez, C.     [  :  .  ] │
│                                      │
│  [🏁 Registrar llegada]              │
│  [🚫 DNS] [❌ DNF] [🔴 DQ]          │
└──────────────────────────────────────┘

Toque [🏁 Registrar llegada] para Carril 3:
→ Se abre teclado numérico: [ 0:27.82 ]
→ Confirmar

Resultado después de registrar todos:
┌──────────────────────────────────────┐
│  Serie 2/3 — Resultados:             │
│                                      │
│  1° Carril 6: Gómez     27.15 ⭐ MP │
│  2° Carril 2: López     27.82       │
│  3° Carril 4: Ríos      28.03       │
│  4° Carril 1: García    28.45       │
│  5° Carril 3: Pérez     29.11       │
│  6° Carril 5: Torres    30.22       │
│                                      │
│  ⭐ MP = Marca Personal              │
│                                      │
│  Ranking general 50m Libre 12-13:    │
│  1° Gómez     27.15 (Serie 2) 🏆     │
│  2° Martínez  27.45 (Serie 1)        │
│  3° López     27.82 (Serie 2)        │
│  ... 15 más                          │
│  Top 8 van a la final.               │
└──────────────────────────────────────┘
```

### El agente maneja la logística
```
Organizador: "El nadador del carril 4 de la serie 3 fue descalificado
              por salida en falso."

Agente:      "Ríos descalificado (DQ) en Serie 3 de 50m Libre.
              Motivo: salida en falso.
              Su tiempo se invalida. El 9° mejor tiempo ahora
              entra a la final como 8°.
              Ranking actualizado."

Organizador: "¿Cómo van los resultados generales del torneo?"

Agente:      "Medallero por club:
              🥇🥈🥉
              Club Acuático Medellín:   3  2  1
              Academia Natación ENV:    2  1  3
              Club Rionegro Natación:   1  2  0
              ...

              Récords del torneo establecidos:
              • 50m Libre Masc 14-15: Gómez 25.03 (nuevo récord)
              • 100m Libre Fem 12-13: Pérez 1:05.22 (nuevo récord)"
```

---

## Simulación 5: Torneo de Baloncesto — Con Overtime

### Scoring — PointsAdapter (Fase 5)
```
Planilla digital (baloncesto):
┌──────────────────────────────────────┐
│  🏀 Final — Liga Antioqueña Sub-17   │
│                                      │
│  🟢 Panthers    vs    Águilas 🔵     │
│        68              68            │
│                                      │
│  ⏱️ Q4 — 0:00  EMPATE               │
│                                      │
│  Se va a OVERTIME (5 min)            │
│  [Iniciar OT]                        │
└──────────────────────────────────────┘

[Overtime]
┌──────────────────────────────────────┐
│  ⏱️ OT1 — 3:15                       │
│        72              70            │
│                                      │
│  Panthers:          Águilas:          │
│  [+1] [+2] [+3]   [+1] [+2] [+3]   │
│  [🤚 Falta]        [🤚 Falta]        │
│                                      │
│  Faltas equipo: Panthers 3 | Águilas 4│
│                                      │
│  Parciales: Q1:18-15 Q2:14-20       │
│             Q3:18-15 Q4:18-18       │
│             OT1: 4-2                 │
│                                      │
│  [◀️ Deshacer] [Fin OT]             │
└──────────────────────────────────────┘

Resultado final: Panthers 75 - 72 Águilas (OT)
Parciales: 18-15, 14-20, 18-15, 18-18, 7-4
MVP: Juan Pérez — 28pts, 8reb, 5ast
```

---

## Simulación 6: Escenario de Fallo Completo (Offline + Crash)

### La peor pesadilla: todo falla durante la final

```
Situación: Final de fútbol. Min 35, va 1-0.
El delegado está en un coliseo rural sin WiFi.
Solo tiene datos móviles que van y vienen.

PASO 1 — Sin internet desde el minuto 20
┌──────────────────────────────────────┐
│  🟡 Sin conexión — datos guardados   │
│  ⚽ Siempre Fuertes 1 - 0 Itagüí    │
│  ⏱️ 1T — 35:22                       │
│                                      │
│  Todo funciona normal.               │
│  El delegado ni se entera.           │
│  12 eventos pendientes de sync.      │
└──────────────────────────────────────┘

PASO 2 — Gol en el minuto 38 (sin internet)
  Delegado toca [⚽ GOL] → se guarda local
  UI muestra: Siempre Fuertes 2 - 0 Itagüí
  13 eventos pendientes de sync.

PASO 3 — Fin del primer tiempo (sin internet)
  Delegado toca [Fin 1T]
  Estado guardado localmente: 2-0, 5 eventos del 1T

PASO 4 — Descanso. El delegado va a buscar señal.
  Conecta WiFi del vestidor 📶
  → Cola de sync: 13 eventos enviados al servidor en 2 segundos
  → Portal público se actualiza: "SF 2-0 Itagüí (Descanso)"
  → WebSocket a 200 espectadores online

PASO 5 — Segundo tiempo. Vuelve a la cancha. Sin señal otra vez.
  Sigue registrando normalmente (offline)
  Minuto 55: Gol de Itagüí → 2-1 (guardado local)
  Minuto 70: Amarilla para SF #4 (guardado local)
  Minuto 85: Gol de SF → 3-1 (guardado local)

PASO 6 — ¡SE DESCARGA EL CELULAR! Minuto 88.
  La pantalla se apaga.
  Pero los datos del minuto 0 al 85 están en IndexedDB.
  Los 3 eventos sin sync (gol 55', amarilla 70', gol 85')
  están guardados localmente.

PASO 7 — El organizador (Juan) está en el centro de control.
  Ve que la planilla de Cancha 1 se desconectó.

  Centro de Control:
  🔴 Cancha 1: SF 2-0 Itagüí (último sync: min 45)
       Delegado: Carlos (📱 DESCONECTADO hace 43 min)
       ⚠️ Partido sin actualizar

  Juan tiene 3 opciones:

  A) Esperar a que Carlos cargue el celular
  B) Abrir la planilla en SU celular y continuar
  C) Ingresar resultado por chat con el agente

  Juan elige C (el partido ya casi termina):

Juan:    "El resultado final de cancha 1 fue Siempre Fuertes 3,
          Itagüí 1. Goles de Pérez minuto 12 y 85, López minuto 38
          para Siempre Fuertes. Gol de Ríos minuto 55 para Itagüí.
          Amarilla para el 4 de Siempre Fuertes minuto 70."

Agente:  "Registré el resultado completo:

          Siempre Fuertes 3 - 1 Club Itagüí
          ⚽ 12' Pérez (SF)
          ⚽ 38' López (SF)
          ⚽ 55' Ríos (IT)
          🟡 70' #4 (SF)
          ⚽ 85' Pérez (SF)

          ¿Confirmas?"

Juan:    "Confirmado."

Agente:  "✅ Resultado registrado. Bracket actualizado.
          Portal público actualizado."

PASO 8 — Carlos carga el celular 2 horas después.
  Abre la app. Ve el modal:

  "Tienes un partido sin terminar:
   SF 3-1 Itagüí (min 85)

   ⚠️ Este partido ya fue finalizado por el organizador.

   [Descartar datos locales]  [Ver diferencias]"

  Carlos toca "Descartar" — los datos locales se eliminan.
  (Si hubiera tocado "Ver diferencias", vería que los eventos
   coinciden con lo que Juan ingresó manualmente.)
```

**Resultado:** El partido NO se perdió. El peor caso fue perder la transmisión en vivo a los espectadores durante 43 minutos, pero el resultado final se registró correctamente.

---

## RESUMEN FINAL: ORDEN DE IMPLEMENTACIÓN

```
RONDA 1 (semana 1):
  └─ Fase 0 — Rol Organizador (fundamento de todo)

RONDA 2 (semanas 2-3):
  ├─ Fase 1 — Multi-Deporte + Config Scoring (en paralelo)
  └─ Fase 2 — Inscripción Cross-Club (en paralelo)

RONDA 3 (semanas 3-5):
  ├─ Fase 3 — Motor de Brackets + Agente IA (la más grande)
  └─ Fase 6 — Pagos de Inscripción (en paralelo con Fase 3)

RONDA 4 (semanas 5-7):
  ├─ Fase 4 — Portal Público (en paralelo)
  └─ Fase 5 — Resultados en Vivo + Planillas + Resiliencia (en paralelo)

RONDA 5 (semanas 7-9):
  ├─ Fase 7 — Estadísticas y Rankings (en paralelo)
  └─ Fase 8 — Mobile (en paralelo)

MVP MÍNIMO: Fases 0+1+2+3+4 + GoalsAdapter + PointsAdapter (~20-25 días)
PRODUCTO COMPLETO: Las 9 fases + todos los adaptadores (~35-45 días)
```
