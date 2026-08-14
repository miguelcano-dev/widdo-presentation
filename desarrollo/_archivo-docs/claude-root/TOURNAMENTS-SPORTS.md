# Widdo Tournaments — Catálogo Multi-Deporte y Configuración de Scoring

> 42 deportes, 7 tipos de panel (goals, points, sets_games, rounds_points, times_marks, innings, judges)
> 13 configs JSON predefinidas (7 base + 6 variantes)
> Índice general: ver `TOURNAMENTS-INDEX.md`

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
