# Widdo Tournaments — Discovery (Capa 2) + Social (Capa 3)

> Fases 10-13. Marketplace de torneos + red social deportiva.
> Índice general: ver `TOURNAMENTS-INDEX.md`
> Riesgo vs Clubes: 🟢 BAJO — 100% aditivo, sin contacto con código de clubs

---

# FASE 10: TOURNAMENT DIRECTORY + RATING + REVIEWS

**Objetivo:** Cualquier persona puede descubrir torneos cerca, ver rating, leer reviews de coaches/padres.

## Sub-fase 10.A — Backend Directory

| # | Tarea | Detalle |
|---|-------|---------|
| 10.A.1 | `PublicDirectoryController` (sin auth) | Directorio de torneos con búsqueda full-text y filtros |
| 10.A.2 | Filtros | sport_id, city_id, state_id, country_id, date_from, date_to, age_category, gender_id, status, price_range, min_rating, organizer_id |
| 10.A.3 | Ordenamiento | by: rating, date, distance (lat/lng), price, participants_count |
| 10.A.4 | Paginación | cursor-based (no offset) para performance con muchos torneos |
| 10.A.5 | SEO data | Cada torneo retorna: og:title, og:description, og:image (flyer_path), structured data (JSON-LD Event) |

**Endpoints públicos:**
```
GET /api/public/directory/tournaments              — Listado con filtros
GET /api/public/directory/tournaments/nearby        — Por lat/lng + radius
GET /api/public/directory/tournaments/featured      — Destacados (premium listing)
GET /api/public/directory/sports                     — Deportes con count de torneos
GET /api/public/directory/cities                     — Ciudades con count de torneos
```

## Sub-fase 10.B — Tournament Rating (Widdo Score)

| # | Tarea | Detalle |
|---|-------|---------|
| 10.B.1 | Migración `create_pla_tournament_ratings` | tournament_id (unique), overall_score (decimal 2,1 → 1.0-5.0), punctuality_score, organization_score, communication_score, venue_score, value_score, total_reviews, return_rate (% de equipos que vuelven), completeness (% de resultados registrados), calculated_at |
| 10.B.2 | Modelo `PlaTournamentRating` | Auto-calculado, NO editable por organizador |
| 10.B.3 | `TournamentRatingService` | Calcula Widdo Score basado en: reviews (60%) + datos objetivos (40%) |

**Fórmula del Widdo Score (1.0-5.0):**
```
REVIEWS (60% del score):
  punctuality_avg  × 0.15    ← ¿Empezó a tiempo?
  organization_avg × 0.15    ← ¿Bien organizado?
  communication_avg× 0.10    ← ¿Buena comunicación?
  venue_avg        × 0.10    ← ¿Buenas instalaciones?
  value_avg        × 0.10    ← ¿Vale lo que cuesta?

DATOS OBJETIVOS (40% del score):
  return_rate      × 0.15    ← % de clubes que participan en >1 edición
  completeness     × 0.10    ← % de partidos con resultado registrado
  participants     × 0.05    ← Normalizado: >20 equipos = max
  editions         × 0.05    ← Más ediciones = más confiable
  response_time    × 0.05    ← Tiempo promedio de respuesta a inscripciones

Minimum reviews para score visible: 3
Sin reviews suficientes: mostrar "Nuevo" badge
```

## Sub-fase 10.C — Post-Tournament Reviews

| # | Tarea | Detalle |
|---|-------|---------|
| 10.C.1 | Migración `create_pla_tournament_reviews` | tournament_id, user_id, registration_id (FK → verificar que SÍ participó), overall_rating (1-5), punctuality (1-5), organization (1-5), communication (1-5), venue (1-5), value (1-5), comment (text, max 1000), is_coach (bool), is_parent (bool), is_verified (bool — auto: participó), helpful_count, reported_count, status ('published','hidden','flagged'), created_at |
| 10.C.2 | Modelo `PlaTournamentReview` | Solo verificados (participaron). Un review por user por torneo |
| 10.C.3 | `TournamentReviewController` | CRUD reviews (solo post-torneo, status=completed) |
| 10.C.4 | Trigger: solicitar review | 24h después de que torneo termine → push notification a coaches/padres |
| 10.C.5 | Respuesta del organizador | Organizador puede responder reviews (1 respuesta por review) |
| 10.C.6 | Report/flag | Cualquier usuario puede reportar review inapropiado |

**Endpoints:**
```
POST   /api/tournaments/{id}/reviews               — Crear review (auth, post-torneo)
GET    /api/public/tournaments/{slug}/reviews       — Ver reviews (público)
POST   /api/tournaments/{id}/reviews/{rId}/helpful  — Marcar útil
POST   /api/tournaments/{id}/reviews/{rId}/report   — Reportar
POST   /api/organizer/reviews/{rId}/respond         — Responder (organizador)
```

## Sub-fase 10.D — Frontend Directory

| # | Tarea | Detalle |
|---|-------|---------|
| 10.D.1 | `/tournaments` — Directorio público | Grid de cards. Cada card: flyer, nombre, deporte icono, fecha, ciudad, Widdo Score (estrellas), precio, equipos inscritos |
| 10.D.2 | Filtros sidebar | Deporte (multi-select), ubicación (country→state→city), fecha (range), edad, género, precio, rating mínimo |
| 10.D.3 | Sort dropdown | Relevancia, Rating, Fecha (próximos), Precio, Cerca de mí |
| 10.D.4 | Tournament Profile Page | Hero con flyer, info completa, categorías, bracket en vivo, reviews con Widdo Score, historial de ediciones, organizer profile mini |
| 10.D.5 | Review form component | 5 estrellas por categoría + comment. Solo visible si torneo completado y user participó |
| 10.D.6 | Share buttons | WhatsApp, Instagram Stories, Facebook, X, copiar link. Open Graph optimizado |
| 10.D.7 | Widdo Score badge component | 1.0-5.0 con color (rojo→amarillo→verde), count de reviews, "Nuevo" si <3 reviews |

**Total Fase 10: 18 tareas | ~4-5 días**

---

# FASE 11: MAP VIEW + RECOMMENDATIONS + ALERTS

**Objetivo:** Descubrir torneos en mapa, recibir alertas de nuevos torneos, recomendaciones IA.

## Sub-fase 11.A — Map View

| # | Tarea | Detalle |
|---|-------|---------|
| 11.A.1 | Componente `TournamentMap.jsx` | Mapa interactivo (Mapbox o Google Maps). Pins por torneo. Cluster para zonas densas |
| 11.A.2 | Pin popup | Al click: mini-card con nombre, deporte, fecha, rating, precio, link |
| 11.A.3 | Filtros en mapa | Mismos filtros que directory pero aplicados al viewport del mapa |
| 11.A.4 | "Cerca de mí" | Geolocation API → centrar mapa + filtrar por radius (5mi, 10mi, 25mi, 50mi) |
| 11.A.5 | Toggle vista | Botón grid ↔ map (mantener filtros al cambiar) |

## Sub-fase 11.B — Alerts & Notifications

| # | Tarea | Detalle |
|---|-------|---------|
| 11.B.1 | `TournamentAlertPreference` | Tabla: user_id, sport_ids (JSON), city_id, state_id, age_range, max_distance_km, frequency ('instant','daily','weekly') |
| 11.B.2 | Job `SendTournamentAlerts` | Cuando se publica torneo nuevo → match con preferences → enviar push/email |
| 11.B.3 | UI de configuración | "Avísame cuando haya torneos de basketball Sub-14 en Florida" |

## Sub-fase 11.C — Recommendations

| # | Tarea | Detalle |
|---|-------|---------|
| 11.C.1 | `TournamentRecommendationService` | IA sugiere torneos basado en: historial del club, deporte, ubicación, nivel, presupuesto, rating |
| 11.C.2 | Endpoint | `GET /api/tournaments/recommended` (auth) |
| 11.C.3 | Widget en dashboard del club | "Torneos recomendados para tu club" con 3-5 sugerencias |
| 11.C.4 | Compare tournaments | Side-by-side de 2-3 torneos (precio, rating, distancia, nivel, categorías) |

**Total Fase 11: 12 tareas | ~3-4 días**

---

# FASE 12: PERFILES PÚBLICOS + RANKINGS + FOLLOW

**Objetivo:** Cada jugador, club y organizador tiene perfil público. Rankings verificados. Sistema de follow.

## Sub-fase 12.A — Player Public Profile

| # | Tarea | Detalle |
|---|-------|---------|
| 12.A.1 | Migración `create_pla_player_profiles` | user_id (unique), slug (unique), sport_ids (JSON), primary_position, secondary_position, height_cm, weight_kg, dominant_hand, gpa (decimal 3,2), school_name, graduation_year, city_id, state_id, country_id, bio (text 500), highlight_video_url, profile_views, visibility ENUM('public','club_only','private'), is_verified, verified_at |
| 12.A.2 | Modelo `PlaPlayerProfile` | Relación: belongsTo User, hasMany PlaTournamentPlayerStat, hasOne PlaTransparencyScore |
| 12.A.3 | `PublicPlayerController` | Perfil público sin auth. Stats agregadas de TODOS los torneos Widdo |
| 12.A.4 | Auto-create | Al inscribir jugador en primer torneo → crear perfil con datos de `pla_club_teams_players` + `users` |
| 12.A.5 | Slug generation | `{firstname}-{lastname}-{city}` o `{firstname}-{lastname}-{N}` si duplicado |

**Endpoints:**
```
GET    /api/public/players/{slug}                  — Perfil público
GET    /api/public/players/{slug}/stats             — Stats agregadas
GET    /api/public/players/{slug}/tournaments       — Historial de torneos
GET    /api/public/players/{slug}/transparency      — Transparency Score breakdown
PATCH  /api/players/me/profile                      — Editar mi perfil (auth)
POST   /api/players/me/profile/photo                — Subir foto (auth)
```

## Sub-fase 12.B — Club Public Profile

| # | Tarea | Detalle |
|---|-------|---------|
| 12.B.1 | Agregar slug a `pla_club_teams` | Migración: add `slug` (unique, nullable) |
| 12.B.2 | `PublicClubController` | Perfil público del club: info, W-L record en torneos, jugadores destacados, torneos participados |
| 12.B.3 | Auto-generate slug | `{club_name}-{city}` |

**Endpoints:**
```
GET    /api/public/clubs/{slug}                    — Perfil público
GET    /api/public/clubs/{slug}/tournaments        — Torneos participados
GET    /api/public/clubs/{slug}/players             — Roster público (solo jugadores con perfil público)
GET    /api/public/clubs/{slug}/stats               — W-L record, goals, etc.
```

## Sub-fase 12.C — Organizer Public Profile

| # | Tarea | Detalle |
|---|-------|---------|
| 12.C.1 | Agregar slug a `pla_organizers` | Migración: add `slug` (unique, nullable) |
| 12.C.2 | `PublicOrganizerController` | Torneos organizados, rating promedio, años activo, deportes |

## Sub-fase 12.D — Rankings

| # | Tarea | Detalle |
|---|-------|---------|
| 12.D.1 | `RankingService` | Calcula rankings de jugadores y clubes por deporte, región, categoría |
| 12.D.2 | Player rankings | Top jugadores por: deporte + posición + región. Solo stats con Transparency Score > 60 |
| 12.D.3 | Club rankings | Basado en resultados en torneos Widdo. W-L record ponderado por nivel del torneo |
| 12.D.4 | Tournament leaderboards | All-time acumulado entre TODOS los torneos: goleadores, asistencias, puntos |
| 12.D.5 | Recalculation job | `RecalculateRankings` — corre diario o post-torneo |

**Endpoints:**
```
GET    /api/public/rankings/players                — Rankings de jugadores (filtros: sport, position, region)
GET    /api/public/rankings/clubs                  — Rankings de clubes
GET    /api/public/rankings/leaderboards/{sport}   — Líderes all-time
```

## Sub-fase 12.E — Follow System

| # | Tarea | Detalle |
|---|-------|---------|
| 12.E.1 | Migración `create_pla_follows` | user_id, followable_type ENUM('player','club','tournament','organizer'), followable_id, created_at |
| 12.E.2 | Modelo `PlaFollow` | Morphable. Unique: (user_id, followable_type, followable_id) |
| 12.E.3 | `FollowController` | Follow/unfollow/list following |
| 12.E.4 | Feed personalizado | `GET /api/feed` — resultados recientes de torneos/jugadores/clubes que sigo |
| 12.E.5 | Push on follow | "Club Siempre Fuertes ganó 3-1 vs Itagüí FC" → push a followers |

**Endpoints:**
```
POST   /api/follow                                 — { followable_type, followable_id }
DELETE /api/follow                                 — Unfollow
GET    /api/following                               — Lista de follows
GET    /api/feed                                    — Feed personalizado
```

**Total Fase 12: 20 tareas | ~5-7 días**

---

# FASE 13: ACHIEVEMENTS + HEAD-TO-HEAD + HIGHLIGHTS

**Objetivo:** Gamificación, historial entre equipos, clips de momentos.

## Sub-fase 13.A — Achievements/Badges

| # | Tarea | Detalle |
|---|-------|---------|
| 13.A.1 | Migración `create_pla_achievements` | user_id OR club_id, achievement_type ENUM('champion','mvp','top_scorer','100_goals','10_tournaments','first_tournament','clean_sheet','streak'), tournament_id (nullable), season (string nullable), sport_id, data (JSON — stats contextuales), earned_at |
| 13.A.2 | `AchievementService` | Auto-detect: al terminar torneo → check si jugador/club earned badges |
| 13.A.3 | Badge display | Íconos en perfil público. Tooltip con contexto |
| 13.A.4 | Achievement types | Campeón, Subcampeón, MVP, Goleador, Mejor Portero, Fair Play, 100 Goles, 10 Torneos, Primer Torneo, Racha Invicta, Clean Sheet |

## Sub-fase 13.B — Head-to-Head History

| # | Tarea | Detalle |
|---|-------|---------|
| 13.B.1 | `HeadToHeadService` | Consulta todos los `pla_tournament_matches` entre dos clubes/jugadores |
| 13.B.2 | Endpoint | `GET /api/public/h2h?club_a={id}&club_b={id}` |
| 13.B.3 | Response | Total partidos, W-D-L, goles, último enfrentamiento, torneos donde jugaron |
| 13.B.4 | UI component | `HeadToHeadCard.jsx` — escudos, stats comparativas, timeline de enfrentamientos |

## Sub-fase 13.C — Highlights/Moments

| # | Tarea | Detalle |
|---|-------|---------|
| 13.C.1 | Agregar campos a `pla_tournament_match_events` | `media_url` (string nullable), `media_type ENUM('photo','video','clip')`, `is_highlight (bool)` |
| 13.C.2 | Upload endpoint | `POST /api/tournaments/{id}/matches/{mId}/events/{eId}/media` |
| 13.C.3 | Highlight feed | `GET /api/public/tournaments/{slug}/highlights` — clips/fotos marcados como highlight |
| 13.C.4 | "Gol del torneo" voting | Al terminar torneo → nominar goles → votación → badge |
| 13.C.5 | Share highlight | WhatsApp/Instagram Stories con preview: "⚽ Gol de Juan Pérez min 78 — Copa Navidad 2026" |
| 13.C.6 | Photo/video feed | Timeline de media por torneo. Tagear jugadores. Padres suben fotos |

**Total Fase 13: 14 tareas | ~3-4 días**
