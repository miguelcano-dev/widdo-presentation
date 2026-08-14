# Widdo Verified Stats — Estadísticas Multi-Deporte, Transparency Score y Perfil College-Ready

> Fase 7: 48 tareas, 7 sub-fases. Stats verificables para 42 deportes.
> Incluye: mercado actual, Transparency Score, métricas avanzadas por deporte,
> Verified Standards Database, recruiting profiles, IA anti-inflación, NCAA 2025-26.
> Índice general: ver `TOURNAMENTS-INDEX.md`
> Fuentes completas: ver `memory/verified-stats.md`
>
> ### ✅ Riesgo vs Clubes: BAJO
> Esta fase es 100% aditiva. Crea ~5 tablas nuevas, 8 services nuevos, 13 endpoints nuevos.
> NO modifica ningún archivo existente de clubes. Los únicos archivos existentes que se tocan
> son `routes/api.php` (nuevas rutas) y `TournamentDetailPage.jsx` (nuevo tab "Estadísticas").
> Los tools del AI para stats van en `TournamentAgentToolExecutor` (creado en Fase 3), NO en `ClubAssistantToolExecutor`.

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
