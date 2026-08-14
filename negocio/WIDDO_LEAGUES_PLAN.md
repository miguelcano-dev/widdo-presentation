# Widdo Leagues - Plan de Implementacion

Fecha: Febrero 2026
Estado: PLANIFICACION
Primer cliente objetivo: Liga Antioquena de Baloncesto (generico para cualquier deporte)

---

## Decision Arquitectonica

**Mismo codebase** que Widdo Clubs (saas_sport/ + frontend/).

Razones:
- Un solo developer. Dos proyectos = doble mantenimiento
- Comparten: users, auth, paises, ciudades, deportes, documentos
- Integracion Club↔Liga es trivial en la misma BD (JOIN directo)
- Asi lo hacen TeamSnap, SportsEngine, GotSport — UNA app, diferentes dashboards
- La separacion es logica (rutas, modelos, scopes), no fisica

Separacion logica:
- Rutas frontend: `/home/league/*` (liga) vs `/home/*` (club)
- Modelos backend: `PlaLeague*` con tablas `pla_leagues_*`
- Scope: `LeagueScope` para aislamiento por `league_id`
- Guard: `LeagueGuard` middleware
- Roles: `league_admin`, `league_selector`, `league_secretary`

---

## Resumen de Fases

| Fase | Nombre | Que entrega | Prioridad |
|------|--------|-------------|-----------|
| **0** | Registro unificado | widdo.co/register pregunta tipo de organizacion | P0 |
| **1** | Liga + Clubes afiliados | Crear liga, invitar clubes, dashboard basico | P0 |
| **2** | Registro de deportistas | Ver jugadores de clubes afiliados, verificar elegibilidad, emitir pases | P0 |
| **3A** | Catalogo de pruebas | Modulo compartido Clubs+Leagues: catalogo de pruebas, evaluaciones de jugadores en clubes, plantillas globales | P0 |
| **3B** | Convocatorias y selecciones | Convocatorias abiertas/cerradas, evaluacion, ranking, seleccion, autorizacion parental, PDF oficial | P0 |
| **4** | Calendario competitivo | Campeonatos entre clubes afiliados, fixtures, resultados, tablas | P1 |
| **5** | Cobros liga→club | Afiliaciones anuales, inscripcion torneos, multas, estado de cuenta | P1 |
| **6** | Transferencias | Solicitud de pase, verificacion, aprobacion, actualizacion rosters | P2 |
| **7** | Sistema disciplinario | Faltas, sanciones, tribunal, apelaciones, historial | P2 |
| **8** | Reportes Indeportes | Censo deportistas, estados financieros, actas, formatos oficiales | P2 |
| **9** | Comunicaciones oficiales | Circulares, convocatorias asamblea, resoluciones, notificaciones | P2 |

**MVP para piloto con Liga Antioquena: Fases 0-3B** (~15 semanas, lo minimo para demostrar valor)
**Bonus para Widdo Clubs existentes:** Fase 3A les da evaluaciones de jugadores como feature nueva

---

## FASE 0: Registro Unificado

**Objetivo:** Cuando alguien entra a widdo.co/register, puede elegir si va a gestionar un club, una liga, u organizar torneos.

### Backend

- [ ] Agregar campo `organization_type` a tabla `users` o a una tabla nueva `user_organizations`
  - Valores: `club`, `league`, `tournament_organizer`
  - Un usuario puede tener multiples tipos (es mama en un club Y directiva en una liga)
- [ ] Modificar `AuthController::register()` para aceptar `organization_type`
- [ ] Crear seeder para roles de liga: `league_admin`, `league_selector`, `league_secretary`
- [ ] Agregar roles de liga a tabla `roles` (Spatie) con permisos base

### Frontend

- [ ] Modificar flujo de registro en la landing (o crear pagina nueva `/register`)
  - Paso 1: "Que quieres hacer?" → Club / Liga / Organizar Torneos
  - Paso 2: Formulario de registro (nombre, email, password)
  - Paso 3: Segun tipo → onboarding especifico
- [ ] Crear `LeagueOnboarding` — datos basicos de la liga (nombre, deporte, departamento, logo)
- [ ] Modificar `PrivateLayout.jsx` para detectar si el usuario tiene contexto de liga y redirigir al dashboard correcto

### Archivos a modificar/crear

```
Backend:
  app/Http/Controllers/AuthController.php          (modificar)
  app/Models/UserClubRole.php                      (agregar constantes league_*)
  database/seeders/LeagueRolesSeeder.php            (crear)
  database/migrations/xxx_create_leagues_base.php   (crear)

Frontend:
  src/pages/auth/RegisterPage.jsx                   (modificar o crear nuevo)
  src/pages/league/LeagueOnboardingPage.jsx         (crear)
  src/layouts/PrivateLayout.jsx                     (modificar)
```

### Criterio de completado
- [ ] Un usuario puede registrarse eligiendo "Liga" como tipo
- [ ] Despues de registrarse, llega a un dashboard de liga (puede estar vacio)
- [ ] El mismo usuario puede tener rol de liga Y rol en un club

---

## FASE 1: Liga + Clubes Afiliados

**Objetivo:** Un directivo puede crear su liga, invitar clubes afiliados, y ver un dashboard con el estado de cada club.

### Backend - Migraciones

- [ ] Tabla `pla_leagues` — datos de la liga
  ```
  id, name, slug, sport_id, country_id, state_id, city_id,
  description, logo_path, founded_year,
  nit, legal_representative, legal_rep_document, legal_rep_email, legal_rep_phone,
  recognition_number, recognition_expiry,
  website, email, phone,
  address, timezone,
  status (active, suspended, inactive),
  created_by (user_id),
  created_at, updated_at, deleted_at
  ```

- [ ] Tabla `pla_league_roles` — roles de usuario dentro de la liga
  ```
  id, user_id, league_id, role (league_admin, league_selector, league_secretary),
  status (ACT, INA), assigned_at, metadata JSON,
  created_at, updated_at
  ```

- [ ] Tabla `pla_league_affiliations` — relacion liga ↔ club
  ```
  id, league_id, club_id (nullable, si el club no usa Widdo Clubs),
  club_name, club_nit, club_representative, club_email, club_phone,
  club_recognition_number, club_recognition_expiry,
  status (pending, active, suspended, rejected, expired),
  invited_at, accepted_at, suspended_at, suspended_reason,
  affiliation_year, affiliation_fee_status (pending, paid, overdue),
  notes,
  created_at, updated_at, deleted_at
  ```
  Nota: `club_id` es nullable porque un club puede NO usar Widdo Clubs. En ese caso los datos se registran manualmente en los campos `club_name`, etc.

### Backend - Modelos

- [ ] `PlaLeague` — modelo principal con relaciones
- [ ] `PlaLeagueRole` — roles de usuario en la liga (similar a UserClubRole)
- [ ] `PlaLeagueAffiliation` — afiliacion liga ↔ club
- [ ] Trait `ProtectedLeagueModel` o reutilizar `ProtectedModel` con `LeagueScope`
- [ ] `LeagueScope` — scope global que filtra por `league_id` del usuario actual

### Backend - Controllers

- [ ] `PlaLeagueController` — CRUD de liga (crear, editar, ver, configurar)
- [ ] `PlaLeagueAffiliationController` — gestionar clubes afiliados
  - `POST /leagues/{id}/affiliations/invite` — invitar club (por email)
  - `POST /leagues/{id}/affiliations/{affId}/accept` — club acepta
  - `POST /leagues/{id}/affiliations/{affId}/suspend` — suspender club
  - `GET /leagues/{id}/affiliations` — listar clubes afiliados con estado

### Backend - Servicio de invitacion

- [ ] `LeagueInvitationService` — enviar invitacion al club
  - Si el club tiene cuenta en Widdo → notificacion in-app + email
  - Si NO tiene cuenta → email con link para registrarse
  - El owner del club acepta/rechaza la invitacion

### Frontend - Paginas

- [ ] `LeagueDashboardPage.jsx` — dashboard principal de la liga
  - Total clubes afiliados (activos, pendientes, suspendidos)
  - Total deportistas registrados
  - Proximos eventos/torneos
  - Estado de cobros
- [ ] `LeagueClubsPage.jsx` — lista de clubes afiliados
  - Filtros por estado (activo, pendiente, moroso)
  - Boton "Invitar Club"
  - Detalle de cada club (click → ver info)
- [ ] `LeagueClubDetailPage.jsx` — detalle de un club afiliado
  - Info del club
  - Roster de jugadores (si el club usa Widdo Clubs)
  - Estado de afiliacion y pagos
  - Cuerpo tecnico
- [ ] `LeagueSettingsPage.jsx` — configuracion de la liga
- [ ] Dialog de invitacion de club

### Frontend - Navegacion

- [ ] `LeagueMenuList.jsx` — sidebar para dashboard de liga (diferente al de club)
- [ ] `LeagueLayout.jsx` — layout con sidebar de liga
- [ ] Rutas en `App.jsx`:
  ```
  /home/league/dashboard
  /home/league/clubs
  /home/league/clubs/:id
  /home/league/settings
  ```

### Criterio de completado
- [ ] Un directivo puede crear una liga con datos basicos + logo
- [ ] Puede invitar clubes por email
- [ ] Un owner de club recibe la invitacion y puede aceptar/rechazar
- [ ] El dashboard muestra la lista de clubes afiliados con estado
- [ ] Si el club usa Widdo Clubs, la liga ve datos basicos automaticamente
- [ ] Si el club NO usa Widdo Clubs, la liga puede registrar datos manualmente

---

## FASE 2: Registro de Deportistas

**Objetivo:** La liga puede ver los jugadores de sus clubes afiliados, verificar elegibilidad, y emitir pases/carnets digitales.

### Backend - Migraciones

- [ ] Tabla `pla_league_player_registrations` — registro oficial de jugador en la liga
  ```
  id, league_id, affiliation_id, player_id (nullable si club no usa Widdo),
  player_name, player_document_type, player_document_number,
  player_dob, player_gender, player_photo_path,
  club_name, category_name,
  status (pending, registered, suspended, transferred),
  pass_number, pass_issued_at, pass_expires_at,
  verified_by (user_id), verified_at,
  rejection_reason,
  season, year,
  created_at, updated_at, deleted_at
  ```

- [ ] Tabla `pla_league_player_documents` — documentos verificados por la liga
  ```
  id, registration_id, document_type (birth_certificate, id_card, medical_cert, photo),
  file_path, verified, verified_by, verified_at,
  created_at, updated_at
  ```

### Backend - Logica clave

- [ ] Si club usa Widdo Clubs: `player_id` apunta al jugador real → datos siempre actualizados (read-only para la liga)
- [ ] Si club NO usa Widdo Clubs: la liga registra datos manualmente en `player_name`, `player_dob`, etc.
- [ ] Verificacion de no-duplicidad: un jugador no puede estar registrado en 2 clubes de la misma liga
- [ ] Generacion de numero de pase unico por liga+temporada

### Frontend - Paginas

- [ ] `LeaguePlayersPage.jsx` — lista de TODOS los deportistas de la liga
  - Filtros: por club, categoria, estado, genero
  - Busqueda por nombre o documento
  - Total de deportistas por categoria
  - Estado de registro (pendiente, registrado, suspendido)
- [ ] `LeaguePlayerDetailPage.jsx` — detalle de un deportista
  - Datos personales (read-only si viene de Widdo Clubs)
  - Documentos verificados
  - Historial de pases
  - Club actual
  - Historial de convocatorias (se llena en Fase 3)
- [ ] `LeaguePlayerRegistrationPage.jsx` — registrar jugador manualmente (si club no usa Widdo)
- [ ] Generacion de pase/carnet digital (PDF o imagen)

### Criterio de completado
- [ ] Liga ve automaticamente los jugadores de clubes que usan Widdo Clubs
- [ ] Liga puede registrar jugadores manualmente para clubes que NO usan Widdo
- [ ] Sistema verifica que un jugador no este en 2 clubes de la misma liga
- [ ] Liga puede aprobar/rechazar registros
- [ ] Se genera pase/carnet digital con numero unico
- [ ] Filtros y busqueda funcionan correctamente

---

## FASE 3: Convocatorias y Selecciones

**Objetivo:** La liga puede crear convocatorias para selecciones departamentales, evaluar jugadores con pruebas fisicas/psicologicas/tecnicas, y publicar la lista final. Incluye un catalogo reutilizable de pruebas y soporte para convocatorias abiertas y cerradas.

### 3A. Modulo de Catalogo de Pruebas (compartido Clubs + Leagues)

El catalogo de pruebas es un **modulo transversal** que usan tanto clubes como ligas. La tabla es compartida con relacion polimorfica: un club crea sus pruebas para evaluar jugadores internamente, una liga las usa para convocatorias a seleccion. Widdo provee plantillas globales como sugerencias para ambos.

**Casos de uso por producto:**
- **Widdo Clubs:** Evaluaciones periodicas de jugadores (pretemporada, mitad de temporada, tryouts de nuevos jugadores), seguimiento de desarrollo fisico/tecnico
- **Widdo Leagues:** Convocatorias a seleccion departamental con pruebas fisicas/psicologicas/tecnicas

#### Backend - Migracion

- [ ] Tabla `pla_test_catalog` — catalogo compartido de pruebas (polimorfico)
  ```
  id,
  organization_type ENUM('club', 'league') NULL, — NULL = plantilla global de Widdo
  organization_id BIGINT UNSIGNED NULL,           — club_id o league_id, NULL = global
  name VARCHAR(255) (ej: "Sprint 20m", "Salto vertical", "Test de Cooper"),
  category ENUM('physical', 'technical', 'psychological', 'custom'),
  sport_id BIGINT UNSIGNED NULL (NULL = aplica a cualquier deporte),
  description TEXT (como se ejecuta la prueba, instrucciones),
  unit ENUM('seconds', 'meters', 'centimeters', 'level', 'scale_1_5', 'scale_1_10', 'count', 'percentage'),
  higher_is_better BOOLEAN DEFAULT true,
  min_value DECIMAL(10,2) NULL,
  max_value DECIMAL(10,2) NULL,
  is_template BOOLEAN DEFAULT false, — true = plantilla global visible para todos
  created_by BIGINT UNSIGNED (user_id),
  created_at, updated_at, deleted_at
  ```
  Index: `(organization_type, organization_id)` — para filtrar por club o liga
  Constraint: `organization_type` y `organization_id` son NULL juntos (plantilla global) o ambos tienen valor

- [ ] Tabla `pla_club_evaluations` — sesiones de evaluacion de un club
  ```
  id, club_id,
  name VARCHAR(255) (ej: "Evaluacion Pretemporada 2026", "Tryout Marzo"),
  evaluation_type ENUM('preseason', 'midseason', 'endseason', 'tryout', 'periodic', 'custom'),
  description TEXT NULL,
  category_id BIGINT UNSIGNED NULL (categoria del club, NULL = todas),
  evaluation_date DATE,
  location VARCHAR NULL,
  status ENUM('draft', 'in_progress', 'completed') DEFAULT 'draft',
  created_by BIGINT UNSIGNED (user_id),
  created_at, updated_at, deleted_at
  ```

- [ ] Tabla `pla_club_evaluation_tests` — tests asignados a una evaluacion de club
  ```
  id, evaluation_id,
  test_catalog_id (FK a pla_test_catalog),
  order INT,
  created_at, updated_at
  ```

- [ ] Tabla `pla_club_evaluation_results` — resultados por jugador por test
  ```
  id, evaluation_test_id, player_id (FK a pla_club_team_players),
  value DECIMAL(10,2), — el resultado medido
  notes TEXT NULL,
  evaluated_by BIGINT UNSIGNED (user_id), evaluated_at DATETIME,
  created_at, updated_at
  ```

#### Backend - Modelo y Controller

- [ ] Modelo `PlaTestCatalog` (polimorfico, scope por organization_type + organization_id)
  - Relacion polimorfica: `organization()` → morphTo (PlaClubTeam o PlaLeague)
  - Scopes: `scopeForClub($clubId)`, `scopeForLeague($leagueId)`, `scopeGlobalTemplates()`
- [ ] Modelo `PlaClubEvaluation` con ClubScope (evaluaciones del club)
- [ ] Modelo `PlaClubEvaluationTest` (tests asignados a la evaluacion)
- [ ] Modelo `PlaClubEvaluationResult` (resultados por jugador)
- [ ] `PlaTestCatalogController` — compartido, detecta contexto (club o liga)
  - `GET /test-catalog` — listar pruebas de MI organizacion + plantillas globales
  - `POST /test-catalog` — crear prueba nueva (se asocia a mi club o mi liga)
  - `PUT /test-catalog/{testId}` — editar prueba (solo si es mia)
  - `DELETE /test-catalog/{testId}` — eliminar (solo si no esta en uso)
  - `POST /test-catalog/from-template/{templateId}` — copiar plantilla global a mi catalogo
- [ ] `PlaClubEvaluationController` — evaluaciones de jugadores del club
  - `GET /clubs/{id}/evaluations` — listar evaluaciones
  - `POST /clubs/{id}/evaluations` — crear evaluacion
  - `GET /clubs/{id}/evaluations/{evalId}` — detalle con resultados
  - `POST /clubs/{id}/evaluations/{evalId}/results` — registrar resultados
  - `POST /clubs/{id}/evaluations/{evalId}/results/bulk` — resultados masivos
  - `GET /clubs/{id}/players/{playerId}/evaluation-history` — historial de un jugador

#### Backend - Seeder de plantillas globales

- [ ] `TestCatalogSeeder` — plantillas sugeridas por Widdo (organization_type = NULL, is_template = true)
  ```
  Fisicas:
    Sprint 20m (seconds, lower is better)
    Sprint 40m (seconds, lower is better)
    Test de Cooper 12min (meters, higher is better)
    Salto vertical (centimeters, higher is better)
    Salto horizontal (meters, higher is better)
    Flexibilidad sit-and-reach (centimeters, higher is better)
    Agilidad T-Test (seconds, lower is better)
    Resistencia Yo-Yo (level, higher is better)
    Fuerza de agarre (count, higher is better)

  Tecnicas (por deporte):
    Precision de tiro libre [baloncesto] (percentage, higher is better)
    Dribling con obstaculos [futbol] (seconds, lower is better)
    Saque efectivo [voleibol] (percentage, higher is better)

  Psicologicas:
    Liderazgo (scale_1_10, higher is better)
    Trabajo en equipo (scale_1_10, higher is better)
    Tolerancia a la presion (scale_1_10, higher is better)
    Disciplina tactica (scale_1_10, higher is better)
  ```

#### Frontend - Paginas (compartidas + especificas por producto)

**Compartido (misma UI, diferente contexto):**
- [ ] `TestCatalogPage.jsx` — catalogo de pruebas (se usa tanto en club como en liga)
  - Tab 1: "Mis Pruebas" — pruebas creadas por mi organizacion (CRUD completo)
  - Tab 2: "Plantillas Widdo" — plantillas globales (boton "Agregar a mi catalogo")
  - Filtros por categoria (fisica, tecnica, psicologica, custom) y deporte
  - Indicador de uso: "Usada en X evaluaciones" (club) o "Usada en X convocatorias" (liga)
- [ ] Dialog `CreateTestDialog.jsx` — crear/editar prueba
  - Nombre, categoria, deporte (opcional), descripcion/instrucciones
  - Unidad de medida, si mayor es mejor, valores min/max opcionales
- [ ] Rutas:
  - Club: `/home/test-catalog`
  - Liga: `/home/league/test-catalog`

**Especifico de Widdo Clubs:**
- [ ] `ClubEvaluationsPage.jsx` — lista de evaluaciones del club
  - Filtros por tipo (pretemporada, mitad, tryout), categoria, estado
  - Boton "Nueva Evaluacion"
- [ ] `ClubEvaluationCreatePage.jsx` — crear evaluacion
  - Paso 1: Datos (nombre, tipo, categoria, fecha, lugar)
  - Paso 2: Seleccionar pruebas del catalogo del club
  - Paso 3: Seleccionar jugadores a evaluar (por categoria o manual)
- [ ] `ClubEvaluationDetailPage.jsx` — detalle con resultados
  - Tabla: jugadores x tests con resultados
  - **Optimizado para movil** (entrenador en cancha con tablet/celular)
  - Modo rapido: seleccionar test → llenar valor por cada jugador → siguiente test
- [ ] `ClubPlayerEvaluationHistoryPage.jsx` — historial de un jugador
  - Todas las evaluaciones en las que participo
  - Graficas de evolucion por test entre evaluaciones
  - Spider chart comparativo entre periodos
- [ ] Rutas:
  - `/home/evaluations` — lista de evaluaciones
  - `/home/evaluations/create` — crear
  - `/home/evaluations/:id` — detalle
  - `/home/players/:id/evaluations` — historial del jugador
- [ ] Menu: agregar "Evaluaciones" al sidebar del club (debajo de Asistencia o en seccion Deportivo)

#### UX Flow

```
=== CLUB ===
Club nuevo → va a Catalogo de Pruebas → ve "Tu catalogo esta vacio"
→ Puede: "Crear prueba" (desde cero) o "Ver plantillas Widdo" (copiar)
→ Arma su catalogo
→ Va a Evaluaciones → "Nueva Evaluacion" → tipo Pretemporada
→ Selecciona pruebas de SU catalogo → selecciona jugadores
→ En cancha: entrenador abre la evaluacion en tablet → llena resultados
→ Despues: ve graficas de evolucion por jugador

=== LIGA ===
Liga nueva → va a Catalogo de Pruebas → ve "Tu catalogo esta vacio"
→ Puede: "Crear prueba" (desde cero) o "Ver plantillas Widdo" (copiar)
→ Arma su catalogo
→ Al crear convocatoria, selecciona pruebas de SU catalogo
→ Puede ajustar peso (%) de cada prueba por convocatoria
```

---

### 3B. Convocatorias

#### Tipos de convocatoria

La liga configura cada convocatoria como:
- **Cerrada:** Solo los clubes nominan jugadores. El club recibe la notificacion y envia a sus jugadores.
- **Abierta:** Cualquier jugador registrado en la liga puede auto-inscribirse. Permite tambien que clubes que NO usan Widdo envien jugadores via formulario publico.

#### Backend - Migraciones

- [ ] Tabla `pla_league_convocations` — convocatoria
  ```
  id, league_id, name (ej: "Seleccion Antioquia Sub-15 Masculino"),
  description, sport_id, category_name,
  gender (M, F, mixed), min_age, max_age,
  year_born_from, year_born_to,
  purpose (ej: "Juegos Nacionales 2026"),
  convocation_type ENUM('open', 'closed') DEFAULT 'closed',
  requires_parental_auth BOOLEAN DEFAULT true, — para menores de 18
  status (draft, open, evaluation, closed, completed),
  registration_start, registration_end,
  evaluation_date, evaluation_end_date,
  evaluation_location, evaluation_address,
  max_candidates, max_selected,
  public_form_enabled BOOLEAN DEFAULT false, — formulario para clubes sin Widdo
  public_form_url VARCHAR NULL, — slug unico para formulario publico
  created_by (user_id),
  created_at, updated_at, deleted_at
  ```

- [ ] Tabla `pla_league_convocation_candidates` — candidatos inscritos
  ```
  id, convocation_id, registration_id (liga player registration, nullable),
  player_name, player_document, player_dob, player_club_name, — para candidatos sin Widdo
  inscription_source ENUM('club_nomination', 'self_inscription', 'public_form'),
  nominated_by_club_id (affiliation_id, nullable),
  parental_auth_status ENUM('not_required', 'pending', 'authorized', 'rejected') DEFAULT 'not_required',
  parental_auth_document_path VARCHAR NULL,
  parental_auth_name VARCHAR NULL,
  parental_auth_document_number VARCHAR NULL,
  attendance_status ENUM('pending', 'present', 'absent', 'late') DEFAULT 'pending',
  attendance_marked_at DATETIME NULL,
  status (registered, evaluated, selected, alternate, not_selected),
  overall_score DECIMAL NULL,
  overall_rank INT NULL,
  discretionary_selected BOOLEAN DEFAULT false, — seleccion por criterio tecnico, no por ranking
  discretionary_reason TEXT NULL,
  general_notes TEXT NULL, — notas generales del candidato
  evaluated_by (user_id),
  created_at, updated_at
  ```

- [ ] Tabla `pla_league_convocation_tests` — tests asignados a la convocatoria (desde el catalogo)
  ```
  id, convocation_id,
  test_catalog_id (FK a pla_test_catalog),
  weight DECIMAL(5,2), — porcentaje en el score global (todos deben sumar 100)
  order INT,
  is_eliminatory BOOLEAN DEFAULT false, — si no pasa minimo, queda eliminado
  min_passing_value DECIMAL NULL, — valor minimo para no ser eliminado
  created_at, updated_at
  ```

- [ ] Tabla `pla_league_convocation_results` — resultados por candidato por test
  ```
  id, candidate_id, test_id,
  value DECIMAL, — el resultado medido
  score DECIMAL, — puntaje normalizado 0-100 (calculado)
  notes TEXT, — notas especificas de este candidato en esta prueba
  evaluated_by (user_id), evaluated_at DATETIME,
  created_at, updated_at
  ```

- [ ] Tabla `pla_league_selection_roster` — lista final de seleccionados
  ```
  id, convocation_id, candidate_id,
  position ENUM('selected', 'alternate', 'staff'),
  jersey_number INT NULL,
  role_in_team VARCHAR NULL (ej: "base", "pivot", "central"),
  notes TEXT,
  created_at, updated_at
  ```

- [ ] Tabla `pla_league_parental_authorizations` — autorizaciones de padres (Ley 1098/2006 Colombia)
  ```
  id, candidate_id,
  parent_name, parent_document_type, parent_document_number,
  parent_phone, parent_email,
  relationship ENUM('father', 'mother', 'legal_guardian'),
  authorization_text TEXT, — texto legal aceptado
  authorized_at DATETIME,
  signature_path VARCHAR NULL, — firma digital o foto de firma
  ip_address VARCHAR NULL,
  created_at, updated_at
  ```

### Backend - Servicios

- [ ] `ConvocationService`
  - Crear convocatoria seleccionando pruebas del catalogo de la liga
  - Validar que los pesos de las pruebas sumen 100%
  - Inscribir candidatos por 3 vias: nominacion de club, auto-inscripcion, formulario publico
  - Verificar edad del candidato vs rango de la convocatoria
  - Para menores de 18: exigir autorizacion parental antes de evaluar
  - Registrar asistencia el dia de evaluacion
  - Registrar resultados de pruebas test por test
  - Calcular score normalizado por test (0-100 segun min/max del test)
  - Calcular score global ponderado por peso de cada test
  - Aplicar eliminatoria: si un test es eliminatorio y el candidato no pasa minimo, score = 0
  - Generar ranking automatico por score global
  - Permitir seleccion discrecional (director tecnico elige por criterio propio, no por ranking)
  - Publicar lista final de seleccionados + suplentes
  - Generar PDF oficial de seleccion con membrete de la liga
- [ ] `ParentalAuthorizationService`
  - Generar formulario de autorizacion con texto legal (Ley 1098/2006)
  - Enviar al padre/acudiente por email/WhatsApp
  - Verificar autorizacion antes de permitir evaluacion
  - Almacenar evidencia digital de la autorizacion
- [ ] Notificaciones
  - A clubes: "La liga abrio convocatoria [nombre]" (con link a detalle)
  - A club: "Nomine jugadores para la convocatoria [nombre]" (cerrada)
  - A jugador/padre: "Has sido nominado/inscrito en la convocatoria [nombre]"
  - A padre/acudiente de menor: "Se requiere su autorizacion para [nombre]"
  - Post-seleccion: "Su jugador [nombre] fue seleccionado/no seleccionado para [nombre]"
  - A seleccionados: "Ha sido seleccionado. Proximos pasos: [detalles]"

### Backend - Controllers

- [ ] `PlaLeagueConvocationController`
  - CRUD de convocatorias
  - `POST /convocations/{id}/candidates` — inscribir candidato
  - `POST /convocations/{id}/candidates/bulk` — inscripcion masiva (club nomina varios)
  - `PATCH /convocations/{id}/candidates/{cId}/attendance` — marcar asistencia
  - `POST /convocations/{id}/results` — registrar resultado de un test para un candidato
  - `POST /convocations/{id}/results/bulk` — registrar resultados masivos (un test, todos los candidatos)
  - `GET /convocations/{id}/ranking` — obtener ranking calculado
  - `POST /convocations/{id}/select` — marcar seleccionados y suplentes
  - `GET /convocations/{id}/pdf` — generar PDF oficial
  - `GET /convocations/{id}/compare?candidates=1,2,3` — comparar candidatos lado a lado
- [ ] `PlaLeagueParentalAuthController`
  - `POST /candidates/{id}/parental-auth/send` — enviar solicitud al padre
  - `POST /parental-auth/{token}/authorize` — padre autoriza (ruta publica con token)
  - `GET /candidates/{id}/parental-auth/status` — estado de autorizacion
- [ ] Formulario publico (ruta publica, sin auth)
  - `GET /leagues/{slug}/convocations/{id}/public-form` — formulario para clubes sin Widdo
  - `POST /leagues/{slug}/convocations/{id}/public-form` — enviar inscripcion

### Frontend - Paginas

- [ ] `LeagueConvocationsPage.jsx` — lista de convocatorias
  - Filtros por estado (borrador, abierta, en evaluacion, cerrada, completada)
  - Filtros por deporte, categoria, tipo (abierta/cerrada)
  - Boton "Nueva Convocatoria"
  - Cards con: nombre, categoria, fechas, # candidatos inscritos, estado
- [ ] `LeagueConvocationCreatePage.jsx` — wizard para crear convocatoria
  - Paso 1: Datos basicos (nombre, deporte, categoria, edades, genero, proposito)
  - Paso 2: Tipo de convocatoria (abierta vs cerrada) + autorizacion parental (on/off)
  - Paso 3: Seleccionar pruebas del catalogo + asignar pesos (%) + marcar eliminatorias
  - Paso 4: Fechas de inscripcion, fecha de evaluacion, lugar, max candidatos, max seleccionados
  - Paso 5: Revisar resumen y publicar (o guardar como borrador)
- [ ] `LeagueConvocationDetailPage.jsx` — detalle de una convocatoria
  - Tabs: Informacion | Candidatos | Evaluacion | Ranking | Seleccion | PDF
  - Estado actual con timeline visual (borrador → abierta → evaluacion → cerrada → completada)
  - Resumen: # inscritos, # evaluados, # pendientes de autorizacion parental
- [ ] `LeagueConvocationCandidatesPage.jsx` — gestionar candidatos
  - Lista de candidatos con fuente (club, auto, publico)
  - Estado de autorizacion parental (icono verde/amarillo/rojo)
  - Estado de asistencia (dia de evaluacion)
  - Boton "Agregar candidato" / "Invitar clubes a nominar"
  - Para abiertas: link compartible para auto-inscripcion
- [ ] `LeagueConvocationAttendancePage.jsx` — control de asistencia dia de evaluacion
  - Lista rapida: nombre + foto + boton Presente/Ausente/Tarde
  - **Optimizada para movil** (tablet/celular en cancha)
  - Resumen: X presentes de Y inscritos
- [ ] `LeagueConvocationEvaluationPage.jsx` — registrar resultados
  - Dos modos:
    - **Por candidato:** Seleccionar candidato → llenar todos sus tests
    - **Por test:** Seleccionar test → llenar resultado de todos los candidatos
  - **Optimizada para movil** (evaluador en cancha con tablet/celular)
  - Input numerico grande, facil de tocar
  - Campo de notas por candidato por test
  - Score se calcula en tiempo real
  - Indicador visual si el candidato no paso un test eliminatorio
- [ ] `LeagueConvocationRankingPage.jsx` — ranking en tiempo real
  - Tabla con: posicion, nombre, club, score por test, score total
  - Ordenable por cualquier columna
  - Highlight de eliminados (no pasaron test eliminatorio)
  - Boton "Comparar" para seleccionar 2-3 candidatos y ver lado a lado
- [ ] `LeagueConvocationComparePage.jsx` — comparar candidatos lado a lado
  - Grafica de radar (spider chart) con scores por test
  - Tabla comparativa con valores y notas
  - Util para decision final entre candidatos cercanos
- [ ] `LeagueConvocationSelectionPage.jsx` — seleccion final
  - Ranking con checkboxes para marcar: Seleccionado / Suplente / No seleccionado
  - Seleccion discrecional: boton "Seleccionar por criterio tecnico" con campo de justificacion
  - Asignar numero de camiseta y posicion/rol
  - Resumen: X seleccionados de Y maximo
  - Boton "Publicar seleccion" → genera notificaciones a todos
- [ ] `LeagueConvocationPDFPage.jsx` — generar PDF oficial
  - Vista previa del documento con membrete de la liga
  - Lista de seleccionados + suplentes + cuerpo tecnico
  - Opcion de incluir o no los scores
  - Descargar PDF / Compartir link
- [ ] `LeaguePlayerHistoryPage.jsx` — historial de convocatorias de un jugador
  - Todas las convocatorias en las que participo
  - Resultados por test en cada una
  - Graficas de evolucion entre temporadas (como ha mejorado en cada test)
  - Comparacion consigo mismo entre convocatorias (spider chart temporal)
- [ ] `PublicConvocationFormPage.jsx` — formulario publico (sin auth)
  - Para clubes que NO usan Widdo
  - Campos: nombre jugador, documento, fecha nacimiento, club, categoria
  - Upload de foto y documentos
  - Autorizacion parental integrada (si es menor)
  - Ruta publica: `/convocations/{slug}/inscripcion`

### Criterio de completado
- [ ] Liga puede crear convocatoria seleccionando pruebas de su catalogo
- [ ] Soporta convocatorias abiertas (auto-inscripcion) y cerradas (solo nominacion de club)
- [ ] Formulario publico funciona para clubes que no usan Widdo
- [ ] Autorizacion parental funciona para menores de 18 (Ley 1098/2006)
- [ ] Control de asistencia el dia de evaluacion (optimizado para movil)
- [ ] Evaluadores pueden registrar resultados test por test (optimizado para movil)
- [ ] El sistema calcula scores normalizados, ponderados, y ranking automatico
- [ ] Tests eliminatorios funcionan correctamente
- [ ] Liga puede seleccionar por ranking O por criterio tecnico discrecional
- [ ] Comparacion lado a lado entre candidatos con graficas radar
- [ ] Se genera PDF oficial con membrete de la liga
- [ ] Notificaciones post-seleccion a clubes, jugadores y padres
- [ ] Historial de convocatorias por jugador con graficas de evolucion entre temporadas

---

## FASE 4: Calendario Competitivo

**Objetivo:** La liga puede organizar campeonatos entre sus clubes afiliados con fixtures, resultados y tablas de posiciones.

### Backend - Migraciones

- [ ] Tabla `pla_league_competitions` — campeonato/torneo de liga
  ```
  id, league_id, name, description, sport_id,
  season, year, category_name, gender,
  format (league, knockout, group_stage, hybrid),
  status (planning, registration, in_progress, completed, cancelled),
  start_date, end_date,
  rules JSON,
  created_by, created_at, updated_at, deleted_at
  ```

- [ ] Tabla `pla_league_competition_teams` — equipos participantes
  ```
  id, competition_id, affiliation_id,
  team_name, group_name,
  points, wins, draws, losses, goals_for, goals_against, goal_diff,
  created_at, updated_at
  ```

- [ ] Tabla `pla_league_matches` — partidos
  ```
  id, competition_id, home_team_id, away_team_id,
  matchday, group_name, round,
  venue, date, time,
  home_score, away_score, status (scheduled, in_progress, completed, postponed, cancelled),
  referee_name,
  notes,
  created_at, updated_at
  ```

### Frontend

- [ ] `LeagueCompetitionsPage.jsx` — lista de campeonatos
- [ ] `LeagueCompetitionDetailPage.jsx` — detalle con tabla de posiciones, fixtures, resultados
- [ ] `LeagueCompetitionCreatePage.jsx` — wizard para crear campeonato
- [ ] `LeagueMatchPage.jsx` — registrar resultado de un partido
- [ ] Tabla de posiciones automatica (calculada desde resultados)

### Criterio de completado
- [ ] Liga puede crear campeonato con formato (liga, eliminacion, grupos)
- [ ] Inscribir equipos de clubes afiliados
- [ ] Generar fixtures automaticos o manuales
- [ ] Registrar resultados de partidos
- [ ] Tabla de posiciones se calcula automaticamente
- [ ] Ver calendario de partidos por fecha

---

## FASE 5: Cobros Liga → Club

**Objetivo:** La liga puede crear cobros a sus clubes afiliados (afiliaciones, inscripciones, multas) y llevar estado de cuenta.

### Backend

- [ ] Tabla `pla_league_charges` — tipos de cobro
  ```
  id, league_id, name (ej: "Afiliacion 2026", "Inscripcion Torneo Sub-15"),
  amount, currency, due_date,
  charge_type (affiliation, tournament_inscription, fine, extraordinary),
  applies_to (all_clubs, specific_clubs),
  status (active, cancelled),
  created_at, updated_at
  ```

- [ ] Tabla `pla_league_payments` — pagos de clubes
  ```
  id, charge_id, affiliation_id,
  amount, payment_date, payment_method,
  receipt_path, notes,
  status (pending, paid, overdue, cancelled),
  registered_by, verified_by, verified_at,
  created_at, updated_at
  ```

### Frontend

- [ ] `LeagueChargesPage.jsx` — cobros creados
- [ ] `LeaguePaymentsPage.jsx` — estado de cuenta por club
- [ ] Vista del club: "Mis cobros con la liga" (desde su dashboard de Widdo Clubs)

### Criterio de completado
- [ ] Liga puede crear cobros para todos o algunos clubes
- [ ] Clubes ven sus cobros pendientes (en su dashboard de Widdo Clubs si lo usan)
- [ ] Liga puede registrar pagos manuales
- [ ] Estado de cuenta por club (al dia, moroso)
- [ ] Bloqueo: club moroso no puede inscribir equipos en torneos

---

## FASE 6: Transferencias

**Objetivo:** Gestionar el movimiento de jugadores entre clubes afiliados.

### Backend

- [ ] Tabla `pla_league_transfers`
  ```
  id, league_id, player_registration_id,
  from_club_affiliation_id, to_club_affiliation_id,
  status (requested, club_approved, club_rejected, league_approved, league_rejected, completed, cancelled),
  requested_at, club_responded_at, league_responded_at, completed_at,
  transfer_window_id, reason, notes,
  requested_by, approved_by,
  created_at, updated_at
  ```

- [ ] Tabla `pla_league_transfer_windows` — ventanas de transferencia
  ```
  id, league_id, name, start_date, end_date, status,
  created_at, updated_at
  ```

### Frontend

- [ ] `LeagueTransfersPage.jsx` — lista de transferencias con estados
- [ ] Wizard de solicitud de transferencia
- [ ] Vista del club: aprobar/rechazar solicitud desde su dashboard

### Criterio de completado
- [ ] Club puede solicitar transferencia de un jugador
- [ ] Club origen aprueba/rechaza
- [ ] Liga aprueba/rechaza
- [ ] Al completarse, el jugador cambia de club automaticamente
- [ ] Ventanas de transferencia configurables

---

## FASE 7: Sistema Disciplinario

**Objetivo:** Registrar faltas, aplicar sanciones, y gestionar expedientes disciplinarios.

### Backend

- [ ] Tabla `pla_league_disciplinary_cases` — expedientes
- [ ] Tabla `pla_league_sanctions` — sanciones aplicadas
- [ ] Tabla `pla_league_hearings` — audiencias del tribunal

### Frontend

- [ ] `LeagueDisciplinaryPage.jsx` — expedientes activos
- [ ] `LeagueSanctionDetailPage.jsx` — detalle de sancion
- [ ] Historial disciplinario por jugador y por club
- [ ] Verificacion automatica: jugador sancionado no puede ser convocado/inscrito

### Criterio de completado
- [ ] Liga puede crear expediente disciplinario
- [ ] Aplicar sanciones (partidos, temporales, economicas)
- [ ] Jugador sancionado queda bloqueado automaticamente
- [ ] Historial visible en perfil del jugador

---

## FASE 8: Reportes para Indeportes

**Objetivo:** Generar automaticamente los reportes obligatorios para el ente deportivo departamental.

### Backend

- [ ] Servicio `IndeportesReportService` que genera:
  - Censo de deportistas (por modalidad, genero, edad, municipio)
  - Lista de clubes afiliados con reconocimiento deportivo
  - Estadisticas agregadas
  - Formatos en PDF y Excel

### Frontend

- [ ] `LeagueReportsPage.jsx` — generar y descargar reportes
- [ ] Previsualizacion antes de exportar
- [ ] Formatos: PDF (oficial) y Excel (editable)

### Criterio de completado
- [ ] Liga puede generar censo de deportistas en formato Indeportes
- [ ] Lista de clubes afiliados con estados
- [ ] Exportar en PDF y Excel
- [ ] Datos se llenan automaticamente desde el sistema

---

## FASE 9: Comunicaciones Oficiales

**Objetivo:** La liga puede enviar circulares, convocatorias a asamblea, y resoluciones a todos los clubes afiliados.

### Backend

- [ ] Tabla `pla_league_communications` — circulares y resoluciones
- [ ] Sistema de envio (email + notificacion in-app)
- [ ] Acuse de recibo (club confirma que leyo)

### Frontend

- [ ] `LeagueCommunicationsPage.jsx` — lista de comunicaciones
- [ ] Editor de circular con destinatarios
- [ ] Estado de lectura por club

### Criterio de completado
- [ ] Liga puede enviar circular a todos los clubes o a clubes especificos
- [ ] Clubes reciben email + notificacion in-app
- [ ] Liga ve quien leyo y quien no

---

## Orden de Implementacion Sugerido

```
AHORA (MVP para piloto Liga Antioquena):
├── Fase 0: Registro unificado                    (~2 semanas)
├── Fase 1: Liga + Clubes afiliados               (~3 semanas)
├── Fase 2: Registro de deportistas               (~3 semanas)
├── Fase 3A: Catalogo de pruebas + evaluaciones    (~2 semanas) ← compartido Clubs+Leagues
└── Fase 3B: Convocatorias y selecciones          (~5 semanas)
                                                   ──────────
                                                   ~15 semanas total

DESPUES DEL PILOTO (iterar con feedback real):
├── Fase 4: Calendario competitivo                (~3 semanas)
├── Fase 5: Cobros liga→club                      (~2 semanas)
└── Fase 9: Comunicaciones oficiales              (~2 semanas)

MAS ADELANTE:
├── Fase 6: Transferencias                        (~3 semanas)
├── Fase 7: Sistema disciplinario                 (~3 semanas)
└── Fase 8: Reportes Indeportes                   (~2 semanas)
```

---

## Notas Importantes

### Privacidad: Que ve la liga vs que NO ve

```
Liga VE:
├── Club: nombre, NIT, representante, contacto, reconocimiento
├── Roster: nombre, DOB, documento, foto, categoria, estado
├── Staff: entrenadores con credenciales
└── Estado financiero: cuotas de afiliacion pagadas/pendientes

Liga NO VE:
├── Pagos del jugador al club (cuotas, uniformes)
├── Asistencia a entrenamientos
├── Datos medicos detallados (solo apto/no apto)
├── Comunicaciones internas del club
└── Finanzas internas del club
```

### Clubes que NO usan Widdo Clubs

Para la Liga Antioquena con 66 clubes, es probable que muchos NO usen Widdo Clubs al inicio. El sistema debe permitir:
1. La liga registra el club manualmente (nombre, NIT, representante)
2. La liga registra jugadores manualmente (nombre, DOB, documento, foto)
3. Si el club DESPUES adopta Widdo Clubs, se vincula automaticamente

### Tablas y naming convention

Tablas nuevas:
```
=== COMPARTIDAS (Clubs + Leagues) ===
pla_test_catalog                         ← Polimorfica (club/league/global)
pla_club_evaluations                     ← Evaluaciones de jugadores del club
pla_club_evaluation_tests                ← Tests asignados a evaluacion
pla_club_evaluation_results              ← Resultados por jugador por test

=== EXCLUSIVAS DE LEAGUES ===
pla_leagues
pla_league_roles
pla_league_affiliations
pla_league_player_registrations
pla_league_player_documents
pla_league_convocations
pla_league_convocation_candidates
pla_league_convocation_tests
pla_league_convocation_results
pla_league_selection_roster
pla_league_parental_authorizations
pla_league_competitions
pla_league_competition_teams
pla_league_matches
pla_league_charges
pla_league_payments
pla_league_transfers
pla_league_transfer_windows
pla_league_disciplinary_cases
pla_league_sanctions
pla_league_hearings
pla_league_communications
```

### Documentacion de referencia

- Investigacion de producto: `negocio/WIDDO_LEAGUES_RESEARCH.md`
- Plan de torneos: `negocio/WIDDO_TORNEOS_PLAN.md`
- Arquitectura actual: `desarrollo/ARCHITECTURE.md`
- Modulos y roles actuales: `desarrollo/MODULES_AND_ROLES.md`
