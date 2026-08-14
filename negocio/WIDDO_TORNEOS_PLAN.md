# Plan: Widdo Torneos - Sistema de Gestión de Torneos Deportivos

---

## INSTRUCCIONES PARA CLAUDE

### Cómo usar este documento

Este es el plan maestro para implementar el módulo de Torneos de Widdo. Cuando el usuario pida trabajar en Widdo Torneos:

1. **Lee este archivo primero** para entender el contexto completo
2. **Identifica la fase actual** - pregunta al usuario en qué fase quiere trabajar
3. **Sigue los checkboxes** - cada fase tiene tareas específicas con checkboxes
4. **Respeta la arquitectura existente** - el proyecto usa Laravel 10 + React 18 con patrones específicos

### Por dónde empezar (Fase 1 - MVP)

```
ORDEN DE IMPLEMENTACIÓN FASE 1:

1. Migraciones (Backend)
   → Crear las 14 tablas SQL del plan
   → Archivo: database/migrations/2026_01_xx_create_pla_tournaments_*.php

2. Modelos Laravel (Backend)
   → Crear los 13 modelos en app/Models/Tournament/
   → Usar el patrón existente de PlaClubTeam.php como referencia

3. TournamentService (Backend)
   → CRUD básico de torneos
   → Usar PlayerService.php como referencia de patrón

4. API Endpoints (Backend)
   → Agregar rutas en routes/api.php
   → Crear controllers en app/Http/Controllers/Api/Tournament/

5. Frontend - Contexto
   → Crear src/context/TournamentContext.jsx
   → Usar UserContextProvider.jsx como referencia

6. Frontend - Páginas
   → Crear src/pages/tournaments/
   → Empezar con TournamentsListPage.jsx y TournamentCreatePage.jsx

7. Frontend - Servicios
   → Crear src/services/tournamentService.js
```

### Archivos de referencia en el proyecto existente

| Para crear... | Usa como referencia... |
|---------------|------------------------|
| Modelos Tournament | `saas_sport/app/Models/PlaClubTeam.php` |
| Services | `saas_sport/app/Services/PlayerService.php` |
| Controllers | `saas_sport/app/Http/Controllers/Api/PlaClubTeamPlayerController.php` |
| Contextos React | `frontend/src/context/UserContextProvider.jsx` |
| Páginas React | `frontend/src/pages/dashboard/players/PlayersPage.jsx` |
| Servicios API | `frontend/src/services/apiService.js` |

### Comandos útiles

```bash
# Backend - crear migración
docker compose exec saas_sport_app php artisan make:migration create_pla_tournaments_table

# Backend - crear modelo
docker compose exec saas_sport_app php artisan make:model Tournament/Tournament

# Backend - ejecutar migraciones
docker compose exec saas_sport_app php artisan migrate

# Frontend - iniciar dev
cd frontend && npm run dev
```

---

## Resumen Ejecutivo

Módulo integrado al SaaS existente de Widdo para gestionar torneos deportivos con:
- Creación de torneos multi-deporte (Fútbol, Baloncesto, Voleibol)
- Fixture automático y editable
- Planilla en tiempo real con WebSockets
- Estadísticas por jugador y equipo
- Vista pública para aficionados
- Asistente IA conversacional (fase futura)

---

## 1. ARQUITECTURA DE BASE DE DATOS

### 1.1 Nuevas Tablas Principales

```sql
-- =============================================
-- CONFIGURACIÓN DE DEPORTES PARA TORNEOS
-- =============================================

-- Configuración de reglas por deporte (extends bas_sports)
CREATE TABLE bas_sport_tournament_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sport_id BIGINT NOT NULL REFERENCES bas_sports(id),

    -- Sistema de puntuación
    points_win INT DEFAULT 3,
    points_draw INT DEFAULT 1,        -- NULL si no hay empates
    points_loss INT DEFAULT 0,

    -- Puntuación especial (voleibol)
    points_win_3_0 INT NULL,
    points_win_3_1 INT NULL,
    points_win_3_2 INT NULL,
    points_loss_2_3 INT NULL,

    -- Estructura del partido
    periods INT DEFAULT 2,            -- 2 tiempos fútbol, 4 cuartos basket
    period_duration_minutes INT,
    has_overtime BOOLEAN DEFAULT FALSE,
    has_penalty_shootout BOOLEAN DEFAULT FALSE,
    has_sets BOOLEAN DEFAULT FALSE,   -- voleibol
    max_sets INT NULL,

    -- Columnas tabla de posiciones (JSON array)
    standings_columns JSON,           -- ["PJ","PG","PE","PP","GF","GC","DIF","PTS"]

    -- Criterios de desempate (JSON array ordenado)
    tiebreaker_rules JSON,            -- ["points","goal_diff","goals_for","head_to_head","fair_play"]

    -- Campos de planilla (JSON schema)
    match_sheet_schema JSON,
    player_stats_schema JSON,

    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    UNIQUE(sport_id)
);

-- =============================================
-- TORNEOS
-- =============================================

CREATE TABLE pla_tournaments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    -- Organización
    organization_id BIGINT NULL REFERENCES pla_club_teams(id), -- NULL si es organizador independiente
    organizer_user_id BIGINT NOT NULL REFERENCES users(id),

    -- Información básica
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,         -- Para URL pública
    description TEXT,
    logo_path VARCHAR(500),
    banner_path VARCHAR(500),

    -- Deporte y categoría
    sport_id BIGINT NOT NULL REFERENCES bas_sports(id),
    category_name VARCHAR(100),       -- "Sub-15", "Senior", etc.
    gender_id BIGINT REFERENCES bas_gender(id),

    -- Configuración del torneo
    tournament_type ENUM('league', 'knockout', 'groups_knockout', 'swiss', 'custom') NOT NULL,
    max_teams INT NOT NULL,
    min_teams INT DEFAULT 2,

    -- Liga específico
    is_double_round BOOLEAN DEFAULT FALSE,  -- Ida y vuelta

    -- Fechas
    registration_start_date DATE,
    registration_end_date DATE,
    start_date DATE,
    end_date DATE,

    -- Estado
    status ENUM('draft', 'registration', 'in_progress', 'finished', 'cancelled') DEFAULT 'draft',

    -- Visibilidad
    is_public BOOLEAN DEFAULT TRUE,
    public_url VARCHAR(500),

    -- Configuración override (si difiere del deporte base)
    custom_config JSON,               -- Override de bas_sport_tournament_config

    -- Ubicación principal
    city_id BIGINT REFERENCES bas_cities(id),

    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    INDEX idx_tournaments_organizer (organizer_user_id),
    INDEX idx_tournaments_sport (sport_id),
    INDEX idx_tournaments_status (status),
    INDEX idx_tournaments_slug (slug)
);

-- =============================================
-- FASES DEL TORNEO
-- =============================================

CREATE TABLE pla_tournament_phases (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tournament_id BIGINT NOT NULL REFERENCES pla_tournaments(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,       -- "Fase de Grupos", "Cuartos de Final"
    phase_type ENUM('group', 'knockout', 'league', 'third_place', 'final') NOT NULL,
    phase_order INT NOT NULL,         -- 1, 2, 3...

    -- Configuración de fase
    settings JSON,                    -- {teams_per_group: 4, qualify_per_group: 2, etc.}

    -- Para knockout
    is_single_match BOOLEAN DEFAULT TRUE,  -- FALSE para series (Bo3, Bo5, Bo7)
    series_length INT DEFAULT 1,      -- 1, 3, 5, 7

    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',

    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    INDEX idx_phases_tournament (tournament_id),
    UNIQUE(tournament_id, phase_order)
);

-- =============================================
-- GRUPOS (para fase de grupos)
-- =============================================

CREATE TABLE pla_tournament_groups (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    phase_id BIGINT NOT NULL REFERENCES pla_tournament_phases(id) ON DELETE CASCADE,
    tournament_id BIGINT NOT NULL REFERENCES pla_tournaments(id) ON DELETE CASCADE,

    name VARCHAR(50) NOT NULL,        -- "Grupo A", "Grupo B"
    group_order INT NOT NULL,
    qualify_count INT DEFAULT 2,      -- Cuántos clasifican

    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    INDEX idx_groups_phase (phase_id),
    UNIQUE(phase_id, group_order)
);

-- =============================================
-- EQUIPOS EN TORNEO
-- =============================================

CREATE TABLE pla_tournament_teams (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tournament_id BIGINT NOT NULL REFERENCES pla_tournaments(id) ON DELETE CASCADE,

    -- Puede ser club registrado o equipo externo
    club_id BIGINT NULL REFERENCES pla_club_teams(id),

    -- Si es equipo externo (no registrado en Widdo)
    external_team_name VARCHAR(255),
    external_team_logo VARCHAR(500),
    external_contact_name VARCHAR(255),
    external_contact_email VARCHAR(255),
    external_contact_phone VARCHAR(50),

    -- Asignación a grupo (si aplica)
    group_id BIGINT NULL REFERENCES pla_tournament_groups(id),

    -- Sembrado/Posición inicial
    seed INT NULL,

    -- Estado
    status ENUM('registered', 'confirmed', 'active', 'withdrawn', 'disqualified') DEFAULT 'registered',
    withdrawal_reason TEXT,

    -- Metadata
    registration_date TIMESTAMP,
    confirmed_at TIMESTAMP,

    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    INDEX idx_teams_tournament (tournament_id),
    INDEX idx_teams_group (group_id),
    INDEX idx_teams_club (club_id)
);

-- =============================================
-- JUGADORES EN TORNEO (roster)
-- =============================================

CREATE TABLE pla_tournament_team_players (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tournament_team_id BIGINT NOT NULL REFERENCES pla_tournament_teams(id) ON DELETE CASCADE,

    -- Puede ser jugador registrado o externo
    player_id BIGINT NULL REFERENCES pla_club_teams_players(id),
    user_id BIGINT NULL REFERENCES users(id),

    -- Si es jugador externo
    external_name VARCHAR(255),
    external_document_number VARCHAR(50),
    external_jersey_number INT,
    external_position VARCHAR(100),

    -- Datos del torneo
    jersey_number INT NOT NULL,
    position VARCHAR(100),
    is_captain BOOLEAN DEFAULT FALSE,

    status ENUM('active', 'suspended', 'injured', 'removed') DEFAULT 'active',

    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    INDEX idx_roster_team (tournament_team_id),
    UNIQUE(tournament_team_id, jersey_number)
);

-- =============================================
-- JORNADAS/RONDAS
-- =============================================

CREATE TABLE pla_tournament_rounds (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tournament_id BIGINT NOT NULL REFERENCES pla_tournaments(id) ON DELETE CASCADE,
    phase_id BIGINT NOT NULL REFERENCES pla_tournament_phases(id) ON DELETE CASCADE,

    round_number INT NOT NULL,
    name VARCHAR(100),                -- "Jornada 1", "Semifinal 1"

    scheduled_date DATE,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',

    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    INDEX idx_rounds_tournament (tournament_id),
    INDEX idx_rounds_phase (phase_id),
    UNIQUE(phase_id, round_number)
);

-- =============================================
-- SEDES/CANCHAS DEL TORNEO
-- =============================================

CREATE TABLE pla_tournament_venues (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tournament_id BIGINT NOT NULL REFERENCES pla_tournaments(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    address TEXT,
    city_id BIGINT REFERENCES bas_cities(id),

    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    capacity INT,
    surface_type VARCHAR(100),        -- "Césped natural", "Sintético", "Parquet"

    -- Disponibilidad (JSON con horarios)
    availability JSON,

    status ENUM('active', 'inactive') DEFAULT 'active',

    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    INDEX idx_venues_tournament (tournament_id)
);

-- =============================================
-- PARTIDOS (CORAZÓN DEL SISTEMA)
-- =============================================

CREATE TABLE pla_tournament_matches (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tournament_id BIGINT NOT NULL REFERENCES pla_tournaments(id) ON DELETE CASCADE,
    phase_id BIGINT NOT NULL REFERENCES pla_tournament_phases(id),
    round_id BIGINT NULL REFERENCES pla_tournament_rounds(id),
    group_id BIGINT NULL REFERENCES pla_tournament_groups(id),

    -- Equipos
    home_team_id BIGINT REFERENCES pla_tournament_teams(id),
    away_team_id BIGINT REFERENCES pla_tournament_teams(id),

    -- Para brackets (cuando no se conoce el rival aún)
    home_team_placeholder VARCHAR(100),  -- "Ganador Grupo A", "Ganador Partido 5"
    away_team_placeholder VARCHAR(100),
    home_source_match_id BIGINT NULL REFERENCES pla_tournament_matches(id),
    away_source_match_id BIGINT NULL REFERENCES pla_tournament_matches(id),

    -- Programación
    venue_id BIGINT REFERENCES pla_tournament_venues(id),
    scheduled_at DATETIME,

    -- Estado del partido
    status ENUM(
        'scheduled',      -- Programado
        'confirmed',      -- Confirmado
        'live',           -- En vivo
        'halftime',       -- Entretiempo
        'finished',       -- Terminado
        'postponed',      -- Pospuesto
        'cancelled',      -- Cancelado
        'walkover',       -- W.O. (equipo no se presentó)
        'suspended'       -- Suspendido (lluvia, etc.)
    ) DEFAULT 'scheduled',

    -- Resultado final
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,

    -- Para voleibol (sets)
    home_sets INT DEFAULT 0,
    away_sets INT DEFAULT 0,

    -- Datos extendidos del partido (JSON)
    match_data JSON,                  -- Cuartos, sets, detalles específicos del deporte

    -- Resultado especial
    winner_team_id BIGINT NULL REFERENCES pla_tournament_teams(id),
    is_draw BOOLEAN DEFAULT FALSE,
    went_to_overtime BOOLEAN DEFAULT FALSE,
    went_to_penalties BOOLEAN DEFAULT FALSE,
    penalties_home INT NULL,
    penalties_away INT NULL,

    -- Tiempo real
    current_period INT DEFAULT 0,     -- 0=no iniciado, 1=primer tiempo, etc.
    period_time_seconds INT DEFAULT 0,
    is_clock_running BOOLEAN DEFAULT FALSE,

    -- Notas
    notes TEXT,
    postponed_reason TEXT,
    new_scheduled_at DATETIME NULL,

    -- Árbitros (JSON array)
    referees JSON,

    -- Timestamps reales
    started_at DATETIME NULL,
    finished_at DATETIME NULL,

    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    INDEX idx_matches_tournament (tournament_id),
    INDEX idx_matches_phase (phase_id),
    INDEX idx_matches_round (round_id),
    INDEX idx_matches_group (group_id),
    INDEX idx_matches_home_team (home_team_id),
    INDEX idx_matches_away_team (away_team_id),
    INDEX idx_matches_status (status),
    INDEX idx_matches_scheduled (scheduled_at)
);

-- =============================================
-- EVENTOS DEL PARTIDO (goles, tarjetas, puntos, etc.)
-- =============================================

CREATE TABLE pla_tournament_match_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    match_id BIGINT NOT NULL REFERENCES pla_tournament_matches(id) ON DELETE CASCADE,

    -- Tipo de evento
    event_type ENUM(
        -- Fútbol
        'goal', 'own_goal', 'penalty_goal', 'penalty_miss',
        'yellow_card', 'red_card', 'second_yellow',
        'substitution_in', 'substitution_out',
        'injury', 'var_review',

        -- Baloncesto
        'points_1', 'points_2', 'points_3',
        'free_throw_made', 'free_throw_miss',
        'personal_foul', 'technical_foul', 'flagrant_foul',
        'timeout',

        -- Voleibol
        'point', 'ace', 'block', 'spike',

        -- Generales
        'period_start', 'period_end',
        'match_start', 'match_end',
        'clock_stop', 'clock_start'
    ) NOT NULL,

    -- Contexto
    team_id BIGINT REFERENCES pla_tournament_teams(id),
    player_id BIGINT REFERENCES pla_tournament_team_players(id),

    -- Para sustituciones
    related_player_id BIGINT NULL REFERENCES pla_tournament_team_players(id),

    -- Tiempo del evento
    period INT NOT NULL,              -- Tiempo/Cuarto/Set
    minute INT,                       -- Minuto (fútbol)
    second INT,                       -- Segundo exacto
    clock_time VARCHAR(10),           -- "12:34" formato display

    -- Datos adicionales (JSON)
    event_data JSON,                  -- {assisted_by: player_id, distance: "3pt", etc.}

    -- Descripción
    description TEXT,

    -- Orden cronológico
    sequence_number INT NOT NULL,

    created_at TIMESTAMP,
    created_by BIGINT REFERENCES users(id),

    INDEX idx_events_match (match_id),
    INDEX idx_events_type (event_type),
    INDEX idx_events_team (team_id),
    INDEX idx_events_player (player_id),
    INDEX idx_events_sequence (match_id, sequence_number)
);

-- =============================================
-- ESTADÍSTICAS POR JUGADOR EN PARTIDO
-- =============================================

CREATE TABLE pla_tournament_match_player_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    match_id BIGINT NOT NULL REFERENCES pla_tournament_matches(id) ON DELETE CASCADE,
    player_id BIGINT NOT NULL REFERENCES pla_tournament_team_players(id),
    team_id BIGINT NOT NULL REFERENCES pla_tournament_teams(id),

    -- Tiempo de juego
    minutes_played INT DEFAULT 0,
    is_starter BOOLEAN DEFAULT FALSE,

    -- Fútbol
    goals INT DEFAULT 0,
    assists INT DEFAULT 0,
    yellow_cards INT DEFAULT 0,
    red_cards INT DEFAULT 0,
    shots INT DEFAULT 0,
    shots_on_target INT DEFAULT 0,

    -- Baloncesto
    points INT DEFAULT 0,
    field_goals_made INT DEFAULT 0,
    field_goals_attempted INT DEFAULT 0,
    three_pointers_made INT DEFAULT 0,
    three_pointers_attempted INT DEFAULT 0,
    free_throws_made INT DEFAULT 0,
    free_throws_attempted INT DEFAULT 0,
    rebounds_offensive INT DEFAULT 0,
    rebounds_defensive INT DEFAULT 0,
    assists_basketball INT DEFAULT 0,
    steals INT DEFAULT 0,
    blocks INT DEFAULT 0,
    turnovers INT DEFAULT 0,
    personal_fouls INT DEFAULT 0,
    technical_fouls INT DEFAULT 0,

    -- Voleibol
    aces INT DEFAULT 0,
    spikes INT DEFAULT 0,
    blocks_volleyball INT DEFAULT 0,
    digs INT DEFAULT 0,

    -- Stats adicionales (JSON para flexibilidad)
    extra_stats JSON,

    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    UNIQUE(match_id, player_id),
    INDEX idx_player_stats_match (match_id),
    INDEX idx_player_stats_player (player_id)
);

-- =============================================
-- TABLA DE POSICIONES (calculada/cacheada)
-- =============================================

CREATE TABLE pla_tournament_standings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tournament_id BIGINT NOT NULL REFERENCES pla_tournaments(id) ON DELETE CASCADE,
    phase_id BIGINT NULL REFERENCES pla_tournament_phases(id),
    group_id BIGINT NULL REFERENCES pla_tournament_groups(id),
    team_id BIGINT NOT NULL REFERENCES pla_tournament_teams(id),

    -- Posición actual
    position INT NOT NULL,

    -- Estadísticas generales
    played INT DEFAULT 0,
    won INT DEFAULT 0,
    drawn INT DEFAULT 0,
    lost INT DEFAULT 0,

    -- Puntos
    points INT DEFAULT 0,

    -- Goles/Puntos a favor y en contra
    goals_for INT DEFAULT 0,          -- O puntos en basket
    goals_against INT DEFAULT 0,
    goal_difference INT DEFAULT 0,

    -- Voleibol específico
    sets_won INT DEFAULT 0,
    sets_lost INT DEFAULT 0,
    sets_ratio DECIMAL(5, 3) DEFAULT 0,
    points_ratio DECIMAL(5, 3) DEFAULT 0,

    -- Fair play (tarjetas)
    yellow_cards INT DEFAULT 0,
    red_cards INT DEFAULT 0,
    fair_play_points INT DEFAULT 0,

    -- Estado de clasificación
    qualification_status ENUM('qualified', 'eliminated', 'pending') DEFAULT 'pending',

    -- Forma reciente (últimos 5 partidos: W, D, L)
    form VARCHAR(10),                 -- "WWDLW"

    last_calculated_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    UNIQUE(tournament_id, phase_id, group_id, team_id),
    INDEX idx_standings_tournament (tournament_id),
    INDEX idx_standings_group (group_id),
    INDEX idx_standings_position (tournament_id, group_id, position)
);

-- =============================================
-- ESTADÍSTICAS ACUMULADAS POR JUGADOR EN TORNEO
-- =============================================

CREATE TABLE pla_tournament_player_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tournament_id BIGINT NOT NULL REFERENCES pla_tournaments(id) ON DELETE CASCADE,
    player_id BIGINT NOT NULL REFERENCES pla_tournament_team_players(id),
    team_id BIGINT NOT NULL REFERENCES pla_tournament_teams(id),

    -- Partidos
    matches_played INT DEFAULT 0,
    matches_started INT DEFAULT 0,
    minutes_played INT DEFAULT 0,

    -- Stats acumulados (igual estructura que match_player_stats)
    goals INT DEFAULT 0,
    assists INT DEFAULT 0,
    yellow_cards INT DEFAULT 0,
    red_cards INT DEFAULT 0,

    -- Basket
    points INT DEFAULT 0,
    rebounds INT DEFAULT 0,
    assists_basketball INT DEFAULT 0,
    steals INT DEFAULT 0,
    blocks INT DEFAULT 0,

    -- Promedios calculados
    points_per_game DECIMAL(5, 2) DEFAULT 0,
    goals_per_game DECIMAL(5, 2) DEFAULT 0,

    -- Extra stats (JSON)
    extra_stats JSON,

    last_calculated_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    UNIQUE(tournament_id, player_id),
    INDEX idx_player_tournament_stats (tournament_id),
    INDEX idx_player_tournament_goals (tournament_id, goals DESC),
    INDEX idx_player_tournament_points (tournament_id, points DESC)
);

-- =============================================
-- HISTORIAL DE CAMBIOS EN FIXTURE
-- =============================================

CREATE TABLE pla_tournament_fixture_changes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tournament_id BIGINT NOT NULL REFERENCES pla_tournaments(id) ON DELETE CASCADE,
    match_id BIGINT NULL REFERENCES pla_tournament_matches(id),

    change_type ENUM(
        'match_created', 'match_rescheduled', 'match_cancelled',
        'team_added', 'team_removed', 'team_withdrew',
        'venue_changed', 'phase_modified', 'fixture_regenerated'
    ) NOT NULL,

    -- Datos del cambio
    old_value JSON,
    new_value JSON,
    reason TEXT,

    -- Quién hizo el cambio
    changed_by BIGINT NOT NULL REFERENCES users(id),

    created_at TIMESTAMP,

    INDEX idx_fixture_changes_tournament (tournament_id),
    INDEX idx_fixture_changes_match (match_id)
);
```

### 1.2 Modificaciones a Tablas Existentes

```sql
-- Agregar rol de organizador de torneos
ALTER TABLE user_club_roles
MODIFY COLUMN role ENUM('owner', 'trainer', 'player', 'parent', 'accountant', 'tournament_organizer');

-- Agregar flag en users para tipo de cuenta
ALTER TABLE users
ADD COLUMN account_type ENUM('club', 'tournament_organizer', 'both') DEFAULT 'club' AFTER email;
```

---

## 2. MODELOS LARAVEL

### 2.1 Lista de Modelos a Crear

```
app/Models/
├── Tournament/
│   ├── Tournament.php
│   ├── TournamentPhase.php
│   ├── TournamentGroup.php
│   ├── TournamentTeam.php
│   ├── TournamentTeamPlayer.php
│   ├── TournamentRound.php
│   ├── TournamentVenue.php
│   ├── TournamentMatch.php
│   ├── TournamentMatchEvent.php
│   ├── TournamentMatchPlayerStats.php
│   ├── TournamentStanding.php
│   ├── TournamentPlayerStats.php
│   └── TournamentFixtureChange.php
└── BasSportTournamentConfig.php
```

### 2.2 Ejemplo de Modelo Principal (Tournament.php)

```php
<?php

namespace App\Models\Tournament;

use App\Models\User;
use App\Models\PlaClubTeam;
use App\Models\BasSport;
use App\Traits\ProtectedModel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tournament extends Model
{
    use SoftDeletes;

    protected $table = 'pla_tournaments';

    protected $fillable = [
        'organization_id', 'organizer_user_id', 'name', 'slug', 'description',
        'logo_path', 'banner_path', 'sport_id', 'category_name', 'gender_id',
        'tournament_type', 'max_teams', 'min_teams', 'is_double_round',
        'registration_start_date', 'registration_end_date', 'start_date', 'end_date',
        'status', 'is_public', 'public_url', 'custom_config', 'city_id'
    ];

    protected $casts = [
        'custom_config' => 'array',
        'is_double_round' => 'boolean',
        'is_public' => 'boolean',
        'registration_start_date' => 'date',
        'registration_end_date' => 'date',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    // Relaciones
    public function organizer() { return $this->belongsTo(User::class, 'organizer_user_id'); }
    public function organization() { return $this->belongsTo(PlaClubTeam::class, 'organization_id'); }
    public function sport() { return $this->belongsTo(BasSport::class); }
    public function phases() { return $this->hasMany(TournamentPhase::class)->orderBy('phase_order'); }
    public function groups() { return $this->hasMany(TournamentGroup::class); }
    public function teams() { return $this->hasMany(TournamentTeam::class); }
    public function matches() { return $this->hasMany(TournamentMatch::class); }
    public function venues() { return $this->hasMany(TournamentVenue::class); }
    public function standings() { return $this->hasMany(TournamentStanding::class); }

    // Scopes
    public function scopePublic($query) { return $query->where('is_public', true); }
    public function scopeActive($query) { return $query->where('status', 'in_progress'); }
    public function scopeBySport($query, $sportId) { return $query->where('sport_id', $sportId); }

    // Helpers
    public function getSportConfig(): array
    {
        $baseConfig = $this->sport->tournamentConfig?->toArray() ?? [];
        return array_merge($baseConfig, $this->custom_config ?? []);
    }

    public function isRegistrationOpen(): bool
    {
        $now = now();
        return $this->status === 'registration'
            && $now >= $this->registration_start_date
            && $now <= $this->registration_end_date;
    }

    public function canAddTeams(): bool
    {
        return in_array($this->status, ['draft', 'registration'])
            && $this->teams()->count() < $this->max_teams;
    }
}
```

---

## 3. SERVICIOS BACKEND

### 3.1 Estructura de Servicios

```
app/Services/Tournament/
├── TournamentService.php           # CRUD principal
├── FixtureGeneratorService.php     # Generación de fixtures
├── LiveMatchService.php            # Manejo de partidos en vivo
├── StandingsService.php            # Cálculo de tabla de posiciones
├── StatisticsService.php           # Estadísticas de jugadores/equipos
├── BracketService.php              # Generación de brackets eliminatorios
└── TournamentNotificationService.php
```

### 3.2 FixtureGeneratorService (Algoritmos clave)

```php
<?php

namespace App\Services\Tournament;

class FixtureGeneratorService
{
    /**
     * Genera fixture para liga (todos contra todos)
     * Algoritmo: Round-robin con rotación de Berger
     */
    public function generateLeagueFixture(Tournament $tournament): array
    {
        $teams = $tournament->teams->pluck('id')->toArray();
        $numTeams = count($teams);

        // Si es impar, agregar BYE
        if ($numTeams % 2 !== 0) {
            $teams[] = null; // BYE
            $numTeams++;
        }

        $rounds = [];
        $totalRounds = $numTeams - 1;

        // Algoritmo de rotación
        for ($round = 0; $round < $totalRounds; $round++) {
            $roundMatches = [];

            for ($match = 0; $match < $numTeams / 2; $match++) {
                $home = $teams[$match];
                $away = $teams[$numTeams - 1 - $match];

                if ($home !== null && $away !== null) {
                    // Alternar local/visitante por ronda
                    if ($round % 2 === 0) {
                        $roundMatches[] = ['home' => $home, 'away' => $away];
                    } else {
                        $roundMatches[] = ['home' => $away, 'away' => $home];
                    }
                }
            }

            $rounds[] = $roundMatches;

            // Rotar equipos (el primero queda fijo)
            $teams = $this->rotateTeams($teams);
        }

        // Si es ida y vuelta, duplicar con equipos invertidos
        if ($tournament->is_double_round) {
            $returnRounds = [];
            foreach ($rounds as $round) {
                $returnRound = [];
                foreach ($round as $match) {
                    $returnRound[] = [
                        'home' => $match['away'],
                        'away' => $match['home']
                    ];
                }
                $returnRounds[] = $returnRound;
            }
            $rounds = array_merge($rounds, $returnRounds);
        }

        return $rounds;
    }

    /**
     * Genera brackets para eliminación directa
     */
    public function generateKnockoutBracket(Tournament $tournament, array $teamIds): array
    {
        $numTeams = count($teamIds);
        $bracketSize = $this->getNextPowerOfTwo($numTeams);
        $byes = $bracketSize - $numTeams;

        // Ordenar por sembrado
        $seededTeams = $this->seedTeams($teamIds, $tournament);

        // Crear bracket
        $bracket = [];
        $matchNumber = 1;

        for ($i = 0; $i < $bracketSize / 2; $i++) {
            $homeIndex = $i;
            $awayIndex = $bracketSize - 1 - $i;

            $home = $seededTeams[$homeIndex] ?? null;
            $away = $seededTeams[$awayIndex] ?? null;

            $bracket[] = [
                'match_number' => $matchNumber++,
                'home_team_id' => $home,
                'away_team_id' => $away,
                'round' => 1,
                'is_bye' => ($home === null || $away === null)
            ];
        }

        return $bracket;
    }

    /**
     * Genera grupos equilibrados
     */
    public function generateGroups(Tournament $tournament, int $numGroups): array
    {
        $teams = $tournament->teams()
            ->orderBy('seed')
            ->pluck('id')
            ->toArray();

        $groups = array_fill(0, $numGroups, []);

        // Distribución serpentina para equilibrio
        $direction = 1;
        $groupIndex = 0;

        foreach ($teams as $teamId) {
            $groups[$groupIndex][] = $teamId;

            $groupIndex += $direction;

            if ($groupIndex >= $numGroups || $groupIndex < 0) {
                $direction *= -1;
                $groupIndex += $direction;
            }
        }

        return $groups;
    }
}
```

### 3.3 LiveMatchService (Tiempo Real)

```php
<?php

namespace App\Services\Tournament;

use App\Events\Tournament\MatchUpdated;
use App\Events\Tournament\MatchEventCreated;
use App\Events\Tournament\ScoreChanged;

class LiveMatchService
{
    /**
     * Registra un evento en el partido (gol, punto, falta, etc.)
     */
    public function recordEvent(
        TournamentMatch $match,
        string $eventType,
        ?int $teamId,
        ?int $playerId,
        array $eventData = []
    ): TournamentMatchEvent {

        $event = DB::transaction(function () use ($match, $eventType, $teamId, $playerId, $eventData) {
            // Crear evento
            $event = TournamentMatchEvent::create([
                'match_id' => $match->id,
                'event_type' => $eventType,
                'team_id' => $teamId,
                'player_id' => $playerId,
                'period' => $match->current_period,
                'minute' => $eventData['minute'] ?? null,
                'second' => $eventData['second'] ?? null,
                'clock_time' => $eventData['clock_time'] ?? null,
                'event_data' => $eventData,
                'sequence_number' => $match->events()->max('sequence_number') + 1,
                'created_by' => auth()->id(),
            ]);

            // Actualizar marcador si es necesario
            $this->updateScoreIfNeeded($match, $event);

            // Actualizar stats del jugador
            if ($playerId) {
                $this->updatePlayerStats($match, $playerId, $eventType, $eventData);
            }

            return $event;
        });

        // Broadcast a WebSocket
        broadcast(new MatchEventCreated($match, $event))->toOthers();
        broadcast(new ScoreChanged($match))->toOthers();

        return $event;
    }

    /**
     * Inicia un período del partido
     */
    public function startPeriod(TournamentMatch $match, int $period): TournamentMatch
    {
        $match->update([
            'current_period' => $period,
            'is_clock_running' => true,
            'status' => 'live',
            'started_at' => $match->started_at ?? now(),
        ]);

        $this->recordEvent($match, 'period_start', null, null, ['period' => $period]);

        broadcast(new MatchUpdated($match))->toOthers();

        return $match;
    }

    /**
     * Finaliza el partido
     */
    public function finishMatch(TournamentMatch $match): TournamentMatch
    {
        $match->update([
            'status' => 'finished',
            'is_clock_running' => false,
            'finished_at' => now(),
            'winner_team_id' => $this->determineWinner($match),
            'is_draw' => $match->home_score === $match->away_score,
        ]);

        $this->recordEvent($match, 'match_end', null, null);

        // Recalcular tabla de posiciones
        app(StandingsService::class)->recalculate($match->tournament_id, $match->group_id);

        broadcast(new MatchUpdated($match))->toOthers();

        return $match;
    }
}
```

---

## 4. SISTEMA DE TIEMPO REAL (WebSockets)

### 4.1 Configuración Laravel WebSockets

```php
// config/broadcasting.php
'connections' => [
    'pusher' => [
        'driver' => 'pusher',
        'key' => env('PUSHER_APP_KEY'),
        'secret' => env('PUSHER_APP_SECRET'),
        'app_id' => env('PUSHER_APP_ID'),
        'options' => [
            'cluster' => env('PUSHER_APP_CLUSTER'),
            'host' => env('WEBSOCKET_HOST', '127.0.0.1'),
            'port' => env('WEBSOCKET_PORT', 6001),
            'scheme' => 'http',
            'encrypted' => false,
        ],
    ],
],
```

### 4.2 Eventos WebSocket

```php
// app/Events/Tournament/MatchUpdated.php
class MatchUpdated implements ShouldBroadcast
{
    public function __construct(public TournamentMatch $match) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('tournament.' . $this->match->tournament_id),
            new Channel('match.' . $this->match->id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'match_id' => $this->match->id,
            'home_score' => $this->match->home_score,
            'away_score' => $this->match->away_score,
            'status' => $this->match->status,
            'current_period' => $this->match->current_period,
        ];
    }
}

// app/Events/Tournament/MatchEventCreated.php
class MatchEventCreated implements ShouldBroadcast
{
    public function __construct(
        public TournamentMatch $match,
        public TournamentMatchEvent $event
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('match.' . $this->match->id)];
    }
}
```

### 4.3 Canales (routes/channels.php)

```php
// Canal público para partidos (cualquiera puede ver)
Broadcast::channel('match.{matchId}', function () {
    return true; // Público
});

// Canal público para torneos
Broadcast::channel('tournament.{tournamentId}', function () {
    return true; // Público
});

// Canal privado para administración
Broadcast::channel('tournament.{tournamentId}.admin', function ($user, $tournamentId) {
    $tournament = Tournament::find($tournamentId);
    return $tournament && $tournament->organizer_user_id === $user->id;
});
```

---

## 5. API ENDPOINTS

### 5.1 Rutas (routes/api.php)

```php
// =============================================
// TORNEOS - CRUD
// =============================================
Route::prefix('tournaments')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [TournamentController::class, 'index']);
    Route::post('/', [TournamentController::class, 'store']);
    Route::get('/{tournament}', [TournamentController::class, 'show']);
    Route::put('/{tournament}', [TournamentController::class, 'update']);
    Route::delete('/{tournament}', [TournamentController::class, 'destroy']);

    // Equipos
    Route::get('/{tournament}/teams', [TournamentTeamController::class, 'index']);
    Route::post('/{tournament}/teams', [TournamentTeamController::class, 'store']);
    Route::put('/{tournament}/teams/{team}', [TournamentTeamController::class, 'update']);
    Route::delete('/{tournament}/teams/{team}', [TournamentTeamController::class, 'destroy']);
    Route::post('/{tournament}/teams/{team}/roster', [TournamentTeamController::class, 'updateRoster']);

    // Fixture
    Route::get('/{tournament}/fixture', [FixtureController::class, 'index']);
    Route::post('/{tournament}/fixture/generate', [FixtureController::class, 'generate']);
    Route::put('/{tournament}/fixture', [FixtureController::class, 'update']);
    Route::post('/{tournament}/fixture/reschedule/{match}', [FixtureController::class, 'reschedule']);

    // Partidos
    Route::get('/{tournament}/matches', [TournamentMatchController::class, 'index']);
    Route::get('/{tournament}/matches/{match}', [TournamentMatchController::class, 'show']);
    Route::put('/{tournament}/matches/{match}', [TournamentMatchController::class, 'update']);

    // Tabla de posiciones
    Route::get('/{tournament}/standings', [StandingsController::class, 'index']);
    Route::post('/{tournament}/standings/recalculate', [StandingsController::class, 'recalculate']);

    // Estadísticas
    Route::get('/{tournament}/stats/scorers', [StatisticsController::class, 'topScorers']);
    Route::get('/{tournament}/stats/players', [StatisticsController::class, 'playerStats']);
    Route::get('/{tournament}/stats/teams', [StatisticsController::class, 'teamStats']);
});

// =============================================
// PARTIDOS EN VIVO
// =============================================
Route::prefix('matches')->middleware('auth:sanctum')->group(function () {
    Route::post('/{match}/start', [LiveMatchController::class, 'startMatch']);
    Route::post('/{match}/period/start', [LiveMatchController::class, 'startPeriod']);
    Route::post('/{match}/period/end', [LiveMatchController::class, 'endPeriod']);
    Route::post('/{match}/finish', [LiveMatchController::class, 'finishMatch']);

    // Eventos del partido
    Route::post('/{match}/events', [LiveMatchController::class, 'recordEvent']);
    Route::delete('/{match}/events/{event}', [LiveMatchController::class, 'deleteEvent']);

    // Planilla
    Route::get('/{match}/sheet', [MatchSheetController::class, 'show']);
    Route::put('/{match}/sheet', [MatchSheetController::class, 'update']);
});

// =============================================
// PÚBLICO (sin autenticación)
// =============================================
Route::prefix('public/tournaments')->group(function () {
    Route::get('/', [PublicTournamentController::class, 'index']);
    Route::get('/{slug}', [PublicTournamentController::class, 'show']);
    Route::get('/{slug}/standings', [PublicTournamentController::class, 'standings']);
    Route::get('/{slug}/fixture', [PublicTournamentController::class, 'fixture']);
    Route::get('/{slug}/matches/{match}', [PublicTournamentController::class, 'match']);
    Route::get('/{slug}/stats', [PublicTournamentController::class, 'stats']);
});
```

---

## 6. FRONTEND - ESTRUCTURA

### 6.1 Nuevos Contextos

```
src/context/
├── TournamentContext.jsx        # Estado del torneo actual
├── LiveMatchContext.jsx         # Estado del partido en vivo
└── PublicTournamentContext.jsx  # Para vista pública
```

### 6.2 Nuevas Páginas

```
src/pages/
├── tournaments/
│   ├── TournamentsListPage.jsx       # Lista de mis torneos
│   ├── TournamentCreatePage.jsx      # Crear torneo (wizard)
│   ├── TournamentDashboardPage.jsx   # Dashboard del torneo
│   ├── TournamentTeamsPage.jsx       # Gestión de equipos
│   ├── TournamentFixturePage.jsx     # Fixture editable
│   ├── TournamentStandingsPage.jsx   # Tabla de posiciones
│   ├── TournamentStatsPage.jsx       # Estadísticas
│   └── TournamentSettingsPage.jsx    # Configuración
│
├── matches/
│   ├── MatchLivePage.jsx             # Planilla en vivo
│   ├── MatchSheetPage.jsx            # Vista de planilla
│   └── MatchEditPage.jsx             # Editar partido
│
└── public/
    ├── PublicTournamentPage.jsx      # Vista pública torneo
    ├── PublicStandingsPage.jsx       # Posiciones públicas
    ├── PublicFixturePage.jsx         # Fixture público
    └── PublicMatchLivePage.jsx       # Partido en vivo público
```

### 6.3 Componentes Principales

```
src/components/tournaments/
├── TournamentWizard/
│   ├── StepSport.jsx
│   ├── StepFormat.jsx
│   ├── StepTeams.jsx
│   └── StepSchedule.jsx
│
├── Fixture/
│   ├── FixtureCalendar.jsx
│   ├── FixtureList.jsx
│   ├── MatchCard.jsx
│   ├── BracketView.jsx
│   └── FixtureEditor.jsx
│
├── Standings/
│   ├── StandingsTable.jsx
│   ├── GroupStandings.jsx
│   └── StandingsLegend.jsx
│
├── LiveMatch/
│   ├── LiveScoreboard.jsx
│   ├── EventTimeline.jsx
│   ├── PlayerStatsPanel.jsx
│   │
│   ├── Football/
│   │   ├── FootballScoreboard.jsx
│   │   ├── FootballEventButtons.jsx
│   │   └── FootballLineup.jsx
│   │
│   ├── Basketball/
│   │   ├── BasketballScoreboard.jsx
│   │   ├── BasketballShotButtons.jsx
│   │   ├── BasketballFoulPanel.jsx
│   │   ├── BasketballSubstitution.jsx
│   │   └── BasketballBoxScore.jsx
│   │
│   └── Volleyball/
│       ├── VolleyballScoreboard.jsx
│       └── VolleyballSetTracker.jsx
│
└── Public/
    ├── PublicScoreboard.jsx
    ├── PublicStandings.jsx
    └── EmbeddableWidget.jsx
```

---

## 7. CONFIGURACIÓN POR DEPORTE (JSON)

### 7.1 Fútbol

```json
{
  "sport": "football",
  "scoring": {
    "win": 3,
    "draw": 1,
    "loss": 0
  },
  "periods": 2,
  "period_duration_minutes": 45,
  "has_overtime": true,
  "overtime_duration_minutes": 15,
  "has_penalties": true,
  "standings_columns": ["PJ", "PG", "PE", "PP", "GF", "GC", "DIF", "PTS"],
  "tiebreaker_rules": [
    "points",
    "goal_difference",
    "goals_for",
    "head_to_head",
    "fair_play",
    "draw"
  ],
  "match_events": [
    "goal", "own_goal", "penalty_goal", "penalty_miss",
    "yellow_card", "red_card", "second_yellow",
    "substitution", "injury"
  ],
  "player_stats": [
    "goals", "assists", "yellow_cards", "red_cards",
    "minutes_played", "shots", "shots_on_target"
  ],
  "fair_play_calculation": {
    "yellow_card": -1,
    "red_card": -3,
    "second_yellow": -3
  }
}
```

### 7.2 Baloncesto

```json
{
  "sport": "basketball",
  "scoring": {
    "win": 2,
    "loss": 1
  },
  "periods": 4,
  "period_duration_minutes": 10,
  "has_overtime": true,
  "overtime_duration_minutes": 5,
  "has_series": true,
  "series_options": [1, 3, 5, 7],
  "standings_columns": ["PJ", "PG", "PP", "PF", "PC", "DIF", "%"],
  "tiebreaker_rules": [
    "wins",
    "head_to_head",
    "point_difference",
    "points_for"
  ],
  "match_events": [
    "points_1", "points_2", "points_3",
    "free_throw_made", "free_throw_miss",
    "personal_foul", "technical_foul", "flagrant_foul",
    "timeout", "substitution"
  ],
  "player_stats": [
    "points", "field_goals_made", "field_goals_attempted",
    "three_pointers_made", "three_pointers_attempted",
    "free_throws_made", "free_throws_attempted",
    "rebounds_offensive", "rebounds_defensive",
    "assists", "steals", "blocks", "turnovers",
    "personal_fouls", "technical_fouls", "minutes_played"
  ],
  "foul_limit": 5,
  "technical_limit": 2
}
```

### 7.3 Voleibol

```json
{
  "sport": "volleyball",
  "scoring": {
    "win_3_0": 3,
    "win_3_1": 3,
    "win_3_2": 2,
    "loss_2_3": 1,
    "loss_1_3": 0,
    "loss_0_3": 0
  },
  "max_sets": 5,
  "points_per_set": 25,
  "points_fifth_set": 15,
  "min_advantage": 2,
  "standings_columns": ["PJ", "PG", "PP", "SF", "SC", "RS", "PF", "PC", "RP", "PTS"],
  "tiebreaker_rules": [
    "points",
    "sets_ratio",
    "points_ratio",
    "head_to_head"
  ],
  "match_events": [
    "point", "ace", "block", "spike", "error",
    "substitution", "timeout"
  ],
  "player_stats": [
    "points", "aces", "spikes", "blocks", "digs",
    "errors", "sets_played"
  ]
}
```

---

## 8. FASES DE IMPLEMENTACIÓN

### FASE 1: MVP (4-6 semanas)
**Objetivo:** Torneo de fútbol básico funcional

- [ ] Migraciones de base de datos (tablas principales)
- [ ] Modelos Laravel básicos (Tournament, Team, Match)
- [ ] TournamentService (CRUD)
- [ ] FixtureGeneratorService (solo liga)
- [ ] API endpoints básicos
- [ ] Frontend: Lista de torneos, crear torneo
- [ ] Frontend: Gestión de equipos
- [ ] Frontend: Fixture básico (solo vista)
- [ ] Frontend: Tabla de posiciones
- [ ] Registro con tipo de cuenta (club/organizador)

### FASE 2: Fixture Editable (2-3 semanas)
**Objetivo:** Fixture flexible y editable

- [ ] Reprogramar partidos
- [ ] Agregar/quitar equipos
- [ ] Manejar W.O. (walkovers)
- [ ] Partidos adicionales
- [ ] Historial de cambios
- [ ] UI de edición de fixture
- [ ] Notificaciones de cambios

### FASE 3: Eliminación Directa (2-3 semanas)
**Objetivo:** Brackets y grupos + eliminación

- [ ] BracketService
- [ ] Generación de grupos
- [ ] Vista de brackets
- [ ] Avance automático de ganadores
- [ ] Partido por 3er lugar
- [ ] Series (Bo3, Bo5, Bo7)

### FASE 4: Planilla en Tiempo Real - Fútbol (3-4 semanas)
**Objetivo:** Planilla en vivo para fútbol

- [ ] Configurar Laravel WebSockets
- [ ] LiveMatchService
- [ ] Eventos de partido (goles, tarjetas, cambios)
- [ ] Frontend: Planilla de fútbol
- [ ] WebSocket integration en React
- [ ] Vista pública en tiempo real
- [ ] Estadísticas de jugadores

### FASE 4.5: PWA y Offline (2 semanas)
**Objetivo:** Funcionar sin conexión

- [ ] Configurar Service Worker
- [ ] Implementar IndexedDB para eventos
- [ ] Cola de sincronización
- [ ] Detección de conexión
- [ ] Resolución de conflictos
- [ ] Manifest.json para instalación

### FASE 5: Baloncesto (3-4 semanas)
**Objetivo:** Soporte completo para baloncesto

- [ ] Configuración de baloncesto
- [ ] Planilla específica (puntos 1/2/3, faltas)
- [ ] Box score
- [ ] Tiempos muertos
- [ ] Cambios con tiempo de juego
- [ ] Cuartos y overtime
- [ ] Estadísticas de basket

### FASE 6: Voleibol (2-3 semanas)
**Objetivo:** Soporte completo para voleibol

- [ ] Configuración de voleibol
- [ ] Sistema de sets y puntos
- [ ] Ratio de sets/puntos
- [ ] Planilla específica

### FASE 7: Vista Pública y Widget (2 semanas)
**Objetivo:** Compartir torneos públicamente

- [ ] URL pública por torneo (subdominio torneos.widdo.co)
- [ ] Landing de torneo público
- [ ] Widget embebible (iframe)
- [ ] Compartir en redes sociales
- [ ] SEO para torneos públicos

### FASE 7.5: WhatsApp Integration (2 semanas)
**Objetivo:** Notificaciones por WhatsApp

- [ ] Configurar WhatsApp Business API
- [ ] Crear templates de mensajes
- [ ] Servicio de notificaciones WhatsApp
- [ ] Opt-in de usuarios para WhatsApp
- [ ] Cola de mensajes (rate limiting)

### FASE 8: Asistente IA (4-6 semanas)
**Objetivo:** Crear torneos conversacionalmente

- [ ] Integración con Claude API
- [ ] Parser de intención
- [ ] Generación de configuración
- [ ] UI conversacional
- [ ] Sugerencias inteligentes

---

## 9. ARCHIVOS CRÍTICOS A CREAR/MODIFICAR

### Backend (Laravel)
```
database/migrations/
├── 2026_01_xx_create_bas_sport_tournament_config_table.php
├── 2026_01_xx_create_pla_tournaments_table.php
├── 2026_01_xx_create_pla_tournament_phases_table.php
├── 2026_01_xx_create_pla_tournament_groups_table.php
├── 2026_01_xx_create_pla_tournament_teams_table.php
├── 2026_01_xx_create_pla_tournament_team_players_table.php
├── 2026_01_xx_create_pla_tournament_rounds_table.php
├── 2026_01_xx_create_pla_tournament_venues_table.php
├── 2026_01_xx_create_pla_tournament_matches_table.php
├── 2026_01_xx_create_pla_tournament_match_events_table.php
├── 2026_01_xx_create_pla_tournament_match_player_stats_table.php
├── 2026_01_xx_create_pla_tournament_standings_table.php
├── 2026_01_xx_create_pla_tournament_player_stats_table.php
└── 2026_01_xx_create_pla_tournament_fixture_changes_table.php

app/Models/Tournament/
├── Tournament.php
├── TournamentPhase.php
├── TournamentGroup.php
├── TournamentTeam.php
├── TournamentTeamPlayer.php
├── TournamentRound.php
├── TournamentVenue.php
├── TournamentMatch.php
├── TournamentMatchEvent.php
├── TournamentMatchPlayerStats.php
├── TournamentStanding.php
├── TournamentPlayerStats.php
└── TournamentFixtureChange.php

app/Services/Tournament/
├── TournamentService.php
├── FixtureGeneratorService.php
├── LiveMatchService.php
├── StandingsService.php
├── StatisticsService.php
└── BracketService.php

app/Http/Controllers/Api/Tournament/
├── TournamentController.php
├── TournamentTeamController.php
├── FixtureController.php
├── TournamentMatchController.php
├── LiveMatchController.php
├── MatchSheetController.php
├── StandingsController.php
├── StatisticsController.php
└── PublicTournamentController.php

app/Events/Tournament/
├── MatchUpdated.php
├── MatchEventCreated.php
├── ScoreChanged.php
└── StandingsUpdated.php

app/Policies/
└── TournamentPolicy.php

routes/api.php (modificar)
routes/channels.php (modificar)
```

### Frontend (React)
```
src/context/
├── TournamentContext.jsx
├── LiveMatchContext.jsx
└── PublicTournamentContext.jsx

src/services/
├── tournamentService.js
├── fixtureService.js
├── liveMatchService.js
└── publicTournamentService.js

src/pages/tournaments/ (todos nuevos)
src/pages/matches/ (todos nuevos)
src/pages/public/ (todos nuevos)

src/components/tournaments/ (todos nuevos)

src/hooks/
├── useTournament.js
├── useLiveMatch.js
└── useWebSocket.js
```

---

## 10. ESTIMACIÓN TOTAL

| Fase | Duración | Prioridad |
|------|----------|-----------|
| Fase 1: MVP Fútbol | 4-6 semanas | P0 |
| Fase 2: Fixture Editable | 2-3 semanas | P0 |
| Fase 3: Eliminación | 2-3 semanas | P1 |
| Fase 4: Tiempo Real Fútbol | 3-4 semanas | P1 |
| Fase 4.5: PWA Offline | 2 semanas | P1 |
| Fase 5: Baloncesto | 3-4 semanas | P1 |
| Fase 6: Voleibol | 2-3 semanas | P2 |
| Fase 7: Vista Pública | 2 semanas | P1 |
| Fase 7.5: WhatsApp | 2 semanas | P2 |
| Fase 8: IA | 4-6 semanas | P3 |
| **TOTAL** | **26-36 semanas** | |

---

## 11. DECISIONES DE DISEÑO CONFIRMADAS

| Aspecto | Decisión | Implicación técnica |
|---------|----------|---------------------|
| **Modo Offline** | PWA con sincronización | IndexedDB + Service Workers + cola de sincronización |
| **Equipos** | Clubes registrados + externos | `club_id` nullable + campos `external_*` en `pla_tournament_teams` |
| **URL Pública** | Subdominio (torneo.widdo.co) | Configuración DNS wildcard + routing por subdominio |
| **Notificaciones** | Email + WhatsApp | Integración WhatsApp Business API + templates |

---

**Fecha de creación:** 14 de Enero de 2026
**Última actualización:** 14 de Enero de 2026
