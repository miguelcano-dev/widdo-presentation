# Plan de Testing PHPUnit — Widdo Backend

**Creado**: 21 de Marzo de 2026
**Estado**: Sesion 1 COMPLETADA — continuar con Sesion 2
**Objetivo**: Cobertura completa del backend Laravel (~320 tests)

---

## Como continuar en otra sesion de IA

Pegar esto como prompt:

```
Continua con la Sesion 2 del plan de testing PHPUnit.

Lee estos archivos para contexto:
- docs/TESTING-PLAN.md (plan completo con checkboxes)
- tests/Traits/CreatesClubWithRoles.php (trait base para todos los tests)
- tests/Traits/SeedsBaseData.php (seed de datos minimos)
- tests/Feature/AuthTest.php (ejemplo de test que funciona)
- tests/Feature/RBACTest.php (ejemplo de test con roles)
- bootstrap/testing.php (override de DB para Docker)
- config/database.php (linea del ternario db_testing)

La Sesion 2 incluye: PlayerTest, TrainerTest, CategoryTest,
SessionAttendanceTest, LocationTest, InvitationTest.

Reglas:
- Usar RefreshDatabase trait
- Usar CreatesClubWithRoles trait para setup
- Usar Sanctum::actingAs() para auth
- Login HTTP necesita header X-Mobile-Platform para evitar session errors
- La DB de testing es db_testing (MySQL en Docker, NO SQLite)
- Correr tests con: docker compose exec saas_sport_app php artisan test tests/Feature/NombreTest.php
- NO tocar datos de la DB principal (db)
- Verificar que tests pasan antes de marcarlos como completados en TESTING-PLAN.md
```

---

## Estado Actual

- **68 tests pasando**, 0 skipped, 0 fallos
- 9 factories (User, Club, Player, Charge, Payment, Installment, Country, State, City)
- 2 traits helper (SeedsBaseData, CreatesClubWithRoles)
- DB testing: MySQL `db_testing` en Docker
- Bootstrap: `bootstrap/testing.php` fuerza `DB_DATABASE=db_testing` antes del boot
- Config: `config/database.php` usa `app()->runningUnitTests()` como fallback

### Bugs corregidos durante testing:
- **card_color NOT NULL**: `PlaClubTeamController::store()` pasaba null, ahora default `#10B981`
- **Rutas admin sin proteccion**: Agregado `middleware('role:Super Admin')` en `routes/api.php`
- **Docker DB override**: `bootstrap/testing.php` sobreescribe env antes del boot de Laravel

### Decisiones tomadas:
- MySQL (no SQLite) para testing — identico a produccion
- `RefreshDatabase` es seguro — opera sobre `db_testing`, data de `db` intacta
- Tests HTTP usan header `X-Mobile-Platform: testing` para evitar session errors
- Factories nuevas se crean segun se necesiten (no todas de golpe)

---

## Sesion 1: Infraestructura + Base — COMPLETADA

### 1.1 Infraestructura de Testing — COMPLETADA

- [x] Crear trait `CreatesClubWithRoles` (club + owner + users por rol + permisos Spatie)
- [x] `CreatesSecondClub` integrado en CreatesClubWithRoles
- [x] Configurar base de datos de testing (MySQL db_testing en Docker)
- [x] Verificar que `php artisan test` pasa
- [x] `bootstrap/testing.php` para override de Docker env vars
- [x] `config/database.php` con `app()->runningUnitTests()` check
- [x] `phpunit.xml` apunta a `bootstrap/testing.php`
- [ ] Factories nuevas (se crean segun se necesiten en sesiones 2-4):
  - [ ] `PlaClubTeamTrainerFactory`
  - [ ] `PlaClubTeamCategoryFactory`
  - [ ] `PlaClubTeamLocationFactory`
  - [ ] `PlaClubTeamDiscountFactory`
  - [ ] `PlaClubTeamSessionFactory`
  - [ ] `PlaClubTeamSessionAttendanceFactory`
  - [ ] `PlaEventFactory`
  - [ ] `PlaTournamentFactory`
  - [ ] `PlaTournamentCategoryFactory`
  - [ ] `PlaNotificationFactory`
  - [ ] `BasSubscriptionPlanFactory`
  - [ ] `PlaClubTeamLateFeeTierFactory`
  - [ ] `PlaClubTeamExpenseFactory`

### 1.2 AuthTest.php — 17 tests, TODOS pasando

- [x] Login exitoso (con header X-Mobile-Platform para evitar session)
- [x] Login con credenciales incorrectas (401)
- [x] Login con email inexistente (401)
- [x] Login requiere email y password (422)
- [x] Login requiere formato email valido (422)
- [x] Register envia verificacion de email
- [x] Register con email duplicado (422)
- [x] Register con password debil (422)
- [x] Register requiere confirmacion de password
- [x] Register requiere aceptar terminos
- [x] Logout invalida token
- [x] Ruta protegida sin token (401)
- [x] Usuario autenticado accede a ruta protegida
- [x] Check email retorna exists para email registrado
- [x] Check email retorna not exists para email nuevo
- [x] Forgot password con email valido
- [x] Forgot password con email invalido (400)

### 1.3 ClubTest.php — 12 tests, TODOS pasando

- [x] Crear club (fix: card_color default)
- [x] Club creation asigna rol owner
- [x] Club creation requiere nombre (422)
- [x] Club creation requiere al menos un deporte (422)
- [x] Usuario no autenticado no puede crear club (401)
- [x] Owner puede ver su club
- [x] Owner NO puede ver club ajeno (403)
- [x] Owner puede listar sus clubes
- [x] Owner puede actualizar su club
- [x] Owner NO puede actualizar club ajeno (403)
- [x] Owner puede ver stats del club
- [x] Owner puede listar miembros del equipo

### 1.4 RBACTest.php — 24 tests, TODOS pasando

- [x] Owner puede acceder a jugadores
- [x] Owner puede acceder a entrenadores
- [x] Owner puede acceder a categorias
- [x] Owner puede acceder a cobros
- [x] Owner puede acceder a pagos
- [x] Owner puede acceder a sesiones
- [x] Trainer puede acceder a jugadores
- [x] Trainer puede acceder a sesiones
- [x] Trainer puede acceder a categorias
- [x] Trainer NO puede crear cobros (403)
- [x] Player puede acceder a su perfil
- [x] Player NO puede crear jugadores (403)
- [x] Player NO puede crear cobros (403)
- [x] Parent puede acceder a su perfil
- [x] Parent NO puede crear jugadores (403)
- [x] Parent NO puede crear cobros (403)
- [x] Accountant puede acceder a pagos
- [x] Accountant puede acceder a cobros
- [x] Accountant NO puede crear jugadores (403)
- [x] Super Admin puede acceder a rutas admin
- [x] Usuario normal NO accede a admin (403) — fix: middleware agregado
- [x] Usuario sin rol NO accede a rutas del club (403)
- [x] Usuario puede listar sus contextos
- [x] Usuario puede cambiar de contexto (model-level)
- [x] Usuario NO puede cambiar al contexto de otro (403)

### 1.5 MultiTenancyTest.php — 15 tests, TODOS pasando

- [x] 2 clubes con datos completos creados en setUp
- [x] Club A NO ve jugadores de Club B
- [x] Club B NO ve jugadores de Club A
- [x] Club A NO ve entrenadores de Club B
- [x] Club A NO ve categorias de Club B
- [x] Club A NO ve cobros de Club B
- [x] Club A NO ve pagos de Club B
- [x] Club A NO ve sesiones de Club B
- [x] Club A NO ve ubicaciones de Club B
- [x] Club A NO ve eventos de Club B
- [x] Club A NO ve descuentos de Club B
- [x] Owner A no puede acceder a rutas de Club B (data filtering verificado)
- [x] Owner A NO puede modificar Club B (403)
- [x] ProtectedModel previene cambio de club_id
- [x] Super Admin puede acceder a admin overview

**Total Sesion 1: 68 tests pasando**

---

## Sesion 2: Core Operativo del Club — PENDIENTE

### 2.1 PlayerTest.php (~18 tests)

- [ ] Listar jugadores del club
- [ ] Crear jugador adulto
- [ ] Crear jugador menor (con datos de acudiente)
- [ ] Actualizar jugador
- [ ] Soft delete jugador
- [ ] Reactivar jugador
- [ ] Asignar jugador a categoria
- [ ] Cambiar categoria de jugador
- [ ] Subir foto de perfil
- [ ] Subir documento de identidad (frente/reverso)
- [ ] Ver documentos del jugador
- [ ] Validaciones: campos requeridos (422)
- [ ] Validaciones: email duplicado en el club (422)
- [ ] Jugador no existe (404)
- [ ] Buscar jugadores por nombre
- [ ] Filtrar jugadores por categoria
- [ ] Filtrar jugadores por estado
- [ ] Historial del jugador (mediciones)

### 2.2 TrainerTest.php (~12 tests)

- [ ] Listar entrenadores
- [ ] Crear entrenador via invitacion
- [ ] Actualizar entrenador
- [ ] Eliminar entrenador
- [ ] Asignar entrenador a categoria
- [ ] Desasignar entrenador de categoria
- [ ] Invitacion: enviar, validar token, aceptar, rechazar
- [ ] Invitacion expirada (422)
- [ ] Reenviar invitacion
- [ ] Historial de entrenador
- [ ] Subir foto de entrenador
- [ ] Permisos: trainer no puede eliminar otro trainer

### 2.3 CategoryTest.php (~10 tests)

- [ ] Listar categorias del club
- [ ] Crear categoria por edad
- [ ] Crear categoria por nivel
- [ ] Crear categoria mixta (edad + nivel)
- [ ] Actualizar categoria
- [ ] Eliminar categoria
- [ ] Eliminar categoria con jugadores asignados (error o reasignar)
- [ ] Listar jugadores de una categoria
- [ ] Listar entrenadores de una categoria
- [ ] Validaciones: nombre duplicado (422)

### 2.4 SessionAttendanceTest.php (~15 tests)

- [ ] Crear sesion de entrenamiento
- [ ] Crear sesion recurrente
- [ ] Listar sesiones por fecha
- [ ] Listar sesiones por categoria
- [ ] Actualizar sesion
- [ ] Cancelar sesion
- [ ] Registrar asistencia (presente)
- [ ] Registrar asistencia (ausente)
- [ ] Registrar asistencia (tardanza)
- [ ] Listar asistencia de una sesion
- [ ] Estadisticas de asistencia por jugador
- [ ] Estadisticas de asistencia por categoria
- [ ] No puede registrar asistencia en sesion de otro club (403)
- [ ] Excepciones de sesion recurrente
- [ ] Check-in / Check-out de eventos

### 2.5 LocationTest.php (~6 tests)

- [ ] Crear ubicacion
- [ ] Listar ubicaciones del club
- [ ] Actualizar ubicacion
- [ ] Eliminar ubicacion
- [ ] Ubicacion con sesiones asociadas (no eliminar)
- [ ] Validaciones (422)

### 2.6 InvitationTest.php (~12 tests)

- [ ] Invitar jugador adulto (email enviado)
- [ ] Invitar jugador menor (email a padre)
- [ ] Invitar entrenador
- [ ] Invitar contador
- [ ] Validar token de invitacion
- [ ] Aceptar invitacion (crea usuario + asigna rol)
- [ ] Rechazar invitacion
- [ ] Invitacion expirada
- [ ] Cancelar invitacion pendiente
- [ ] Reenviar invitacion
- [ ] No puede invitar con email ya registrado en el club
- [ ] Listar invitaciones del club

**Subtotal Sesion 2: ~73 tests**

---

## Sesion 3: Sistema Financiero — PENDIENTE

### 3.1 ChargeTest.php (~12 tests)

- [ ] Crear cobro (mensualidad, uniforme, torneo, etc)
- [ ] Listar cobros del club
- [ ] Actualizar cobro
- [ ] Eliminar cobro sin pagos asociados
- [ ] No eliminar cobro con pagos (422)
- [ ] Despachar cobro a jugadores
- [ ] Despachar cobro a categoria completa
- [ ] Cobro recurrente (mensual)
- [ ] Historial de cambios del cobro
- [ ] Calcular monto con descuento (ChargeService)
- [ ] Calcular monto con descuento familiar
- [ ] Jugador exento del cobro

### 3.2 PaymentTest.php (~20 tests)

- [ ] Registrar pago completo (PEN → COM)
- [ ] Registrar pago parcial (PEN → PAR)
- [ ] Registrar segunda cuota de pago parcial
- [ ] Completar pago parcial (PAR → COM)
- [ ] Cancelar pago (→ CXL)
- [ ] Pago vencido (→ OVD)
- [ ] Listar pagos del club
- [ ] Filtrar pagos por estado
- [ ] Filtrar pagos por jugador
- [ ] Filtrar pagos por fecha
- [ ] Estadisticas de pagos (totales, pendientes, recaudado)
- [ ] Subir comprobante de pago
- [ ] Pago con descuento aplicado
- [ ] Pago con descuento familiar
- [ ] Pago de jugador exento (monto 0)
- [ ] Validaciones: monto mayor al debido (422)
- [ ] Validaciones: pago a cobro inexistente (404)
- [ ] Installments: crear cuota
- [ ] Installments: listar cuotas de un pago
- [ ] Installments: subir comprobante de cuota

### 3.3 DiscountTest.php (~8 tests)

- [ ] Crear descuento
- [ ] Listar descuentos
- [ ] Asignar descuento a jugador
- [ ] Asignar descuento a cobro
- [ ] Descuento familiar (automatico por numero de hijos)
- [ ] Actualizar descuento
- [ ] Eliminar descuento
- [ ] Exencion de jugador

### 3.4 ExpenseTest.php (~8 tests)

- [ ] Crear gasto
- [ ] Listar gastos del club
- [ ] Actualizar gasto
- [ ] Eliminar gasto
- [ ] Categorias de gastos
- [ ] Filtrar por categoria
- [ ] Filtrar por fecha
- [ ] Aprobar/rechazar gasto

### 3.5 SubscriptionTest.php (~10 tests)

- [ ] Listar planes disponibles
- [ ] Iniciar periodo de prueba
- [ ] Iniciar pago de suscripcion
- [ ] Verificar estado del pago
- [ ] Suscripcion activa: limites respetados
- [ ] Suscripcion activa: modulos habilitados
- [ ] Exceder limite de jugadores (403)
- [ ] Exceder limite de entrenadores (403)
- [ ] Cancelar suscripcion
- [ ] Historial de pagos de suscripcion

### 3.6 LateFeeTierTest.php (~5 tests)

- [ ] Crear nivel de mora
- [ ] Listar niveles de mora
- [ ] Actualizar nivel de mora
- [ ] Eliminar nivel de mora
- [ ] Job ApplyLateFees aplica mora correctamente

### 3.7 ExportTest.php (~6 tests)

- [ ] Exportar jugadores a XLS
- [ ] Exportar por categoria
- [ ] Exportar pagos
- [ ] Exportar asistencias
- [ ] Exportar ZIP de documentos
- [ ] Export con club sin datos (archivo vacio valido)

**Subtotal Sesion 3: ~69 tests**

---

## Sesion 4: Eventos, Torneos, Notificaciones — PENDIENTE

### 4.1 CalendarEventTest.php (~15 tests)

- [ ] Crear evento (training, match, meeting, social, etc)
- [ ] Listar eventos del club
- [ ] Listar eventos por rango de fechas
- [ ] Actualizar evento
- [ ] Cancelar evento
- [ ] Agregar participantes
- [ ] Confirmar participacion
- [ ] Rechazar participacion
- [ ] Subir imagen al evento
- [ ] Agregar video URL (YouTube/Vimeo)
- [ ] Invitar por categoria
- [ ] Invitar a todo el club
- [ ] Estadisticas de participacion
- [ ] Evento pasado: no se puede confirmar
- [ ] Calendario integrado (eventos + pagos + gastos + cumpleanos)

### 4.2 TournamentCRUDTest.php (~10 tests)

- [ ] Crear torneo
- [ ] Listar torneos del club
- [ ] Ver detalle del torneo
- [ ] Actualizar torneo
- [ ] Eliminar torneo (solo si no tiene jugadores)
- [ ] Crear categorias del torneo
- [ ] Configurar documentos requeridos
- [ ] Configurar campos requeridos
- [ ] Agregar staff al torneo
- [ ] Configurar presupuesto

### 4.3 TournamentPlayersTest.php (~12 tests)

- [ ] Listar jugadores elegibles
- [ ] Convocar jugadores al torneo
- [ ] Confirmar asistencia del jugador
- [ ] Rechazar convocatoria
- [ ] Subir documentos requeridos
- [ ] Verificar estado de documentos
- [ ] Enviar encuesta pre-torneo
- [ ] Responder encuesta
- [ ] Cambiar respuesta de encuesta
- [ ] Generar cobros del torneo
- [ ] Verificar estado de pagos
- [ ] Crear equipos y asignar jugadores

### 4.4 TournamentWaiversTest.php (~8 tests)

- [ ] Crear waiver para el torneo
- [ ] Listar waivers pendientes
- [ ] Firmar waiver (padre)
- [ ] Descargar PDF del waiver firmado
- [ ] Waiver con variables renderizadas
- [ ] Estado de firmas por jugador
- [ ] No puede participar sin waiver firmado
- [ ] Video de confirmacion (si aplica)

### 4.5 TournamentResultsTest.php (~8 tests)

- [ ] Registrar resultado de partido
- [ ] Registrar estadisticas de jugador
- [ ] Listar resultados por categoria
- [ ] Tabla de posiciones
- [ ] Historial de resultados del jugador
- [ ] Exportar resultados
- [ ] Completar torneo
- [ ] Estadisticas custom del torneo

### 4.6 TournamentParentTest.php (~8 tests)

- [ ] Padre ve torneos de su hijo
- [ ] Padre responde encuesta por su hijo
- [ ] Padre cambia respuesta de encuesta
- [ ] Padre sube documentos del hijo
- [ ] Padre firma waiver
- [ ] Padre ve estado de pagos del torneo
- [ ] Padre NO puede convocar jugadores (403)
- [ ] Padre NO puede registrar resultados (403)

### 4.7 DocumentTest.php (~10 tests)

- [ ] Subir documento de jugador
- [ ] Listar documentos del jugador
- [ ] Verificar documento (admin)
- [ ] Rechazar documento con motivo
- [ ] Tipos de documento por pais
- [ ] File vault: subir archivo al club
- [ ] File vault: crear carpeta
- [ ] File vault: compartir archivo
- [ ] Documentos legales del club
- [ ] Consentimiento de datos

### 4.8 NotificationTest.php (~12 tests)

- [ ] Crear notificacion in-app
- [ ] Listar notificaciones del usuario
- [ ] Marcar como leida
- [ ] Marcar todas como leidas
- [ ] Preferencias de notificacion
- [ ] Job SendEventReminders se ejecuta correctamente
- [ ] Job SendPaymentReminders se ejecuta correctamente
- [ ] Job SendBirthdayNotifications se ejecuta correctamente
- [ ] Deduplicacion: no enviar recordatorio duplicado
- [ ] Respetar quiet hours
- [ ] Respetar preferencia de canal (email/push/in-app)
- [ ] Usuario inactivo no recibe notificaciones

**Subtotal Sesion 4: ~83 tests**

---

## Extras (post-sesiones) — PENDIENTE

### CI/CD

- [ ] Crear `.github/workflows/test.yml` para correr tests en PRs
- [ ] Pre-push hook: `php artisan test --stop-on-failure`
- [ ] Configurar cobertura minima 80% con PCOV

### Limpieza de Codigo Muerto

- [ ] Identificar controllers sin rutas
- [ ] Identificar services sin importaciones
- [ ] Identificar modelos sin referencias
- [ ] Eliminar codigo muerto confirmado

### Admin Tests (adicional)

- [ ] AdminAnalyticsTest — metricas de plataforma
- [ ] AdminBlogTest — CRUD de blog
- [ ] AdminCountryTest — gestion de paises
- [ ] AdminSystemTest — health checks, jobs, logs
- [ ] AdminSportTest — gestion de deportes

---

## Resumen

| Sesion | Tests | Suites | Estado |
|--------|-------|--------|--------|
| 1 | 68 | 5 | COMPLETADA |
| 2 | ~73 | 6 | Pendiente |
| 3 | ~69 | 7 | Pendiente |
| 4 | ~83 | 8 | Pendiente |
| Extra | ~25 | 5 | Pendiente |
| **Total** | **~320** | **31** | **21% completado** |

---

## Archivos clave para testing

| Archivo | Proposito |
|---------|-----------|
| `bootstrap/testing.php` | Override de DB para Docker (carga antes del autoload) |
| `config/database.php` | Ternario `app()->runningUnitTests()` para db_testing |
| `phpunit.xml` | Config PHPUnit, bootstrap apunta a `bootstrap/testing.php` |
| `tests/TestCase.php` | Base class, fuerza db_testing en setUp |
| `tests/CreatesApplication.php` | Bootstrap de la app para tests |
| `tests/Traits/SeedsBaseData.php` | Seed minimo: Colombia, Bogota, 3 generos |
| `tests/Traits/CreatesClubWithRoles.php` | Club + owner + trainer + player + parent + accountant + superadmin + permisos Spatie + suscripcion trial |
| `.env.testing` | Variables de entorno para testing |
