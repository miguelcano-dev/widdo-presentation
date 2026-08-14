# Plan de Testing Completo - Widdo

## Resumen Ejecutivo

| Componente | Tests Actuales | Tests Necesarios | Cobertura |
|------------|----------------|------------------|-----------|
| **Backend (PHPUnit)** | ~15 | ~120 | 12% |
| **Frontend (Playwright)** | ~115 | ~200 | 58% |
| **TOTAL** | ~130 | ~320 | 40% |

---

## Estructura Propuesta (Mejores Prácticas)

```
proyecto/
├── saas_sport/tests/                    # BACKEND
│   ├── Unit/                            # Tests unitarios
│   │   ├── Services/
│   │   │   ├── PaymentServiceTest.php
│   │   │   ├── AuthorizationServiceTest.php
│   │   │   └── FileStorageServiceTest.php
│   │   └── Models/
│   │       ├── UserTest.php
│   │       └── PlaClubTeamTest.php
│   │
│   ├── Feature/                         # Tests de API/integración
│   │   ├── Auth/
│   │   │   ├── LoginTest.php
│   │   │   ├── RegisterTest.php
│   │   │   ├── PasswordResetTest.php
│   │   │   └── TokenExpirationTest.php
│   │   │
│   │   ├── Players/
│   │   │   ├── PlayerCrudTest.php
│   │   │   ├── PlayerDocumentsTest.php
│   │   │   ├── PlayerInvitationTest.php
│   │   │   └── PlayerFilterTest.php
│   │   │
│   │   ├── Payments/
│   │   │   ├── PaymentCrudTest.php
│   │   │   ├── PaymentVerificationTest.php
│   │   │   ├── PaymentInstallmentsTest.php
│   │   │   └── LateFeeTest.php
│   │   │
│   │   ├── Charges/
│   │   │   ├── ChargeCrudTest.php
│   │   │   └── ChargeAssignmentTest.php
│   │   │
│   │   ├── Categories/
│   │   │   ├── CategoryCrudTest.php
│   │   │   └── CategoryAssignmentTest.php
│   │   │
│   │   ├── Trainers/
│   │   │   ├── TrainerCrudTest.php
│   │   │   └── TrainerInvitationTest.php
│   │   │
│   │   ├── Sessions/
│   │   │   ├── SessionCrudTest.php
│   │   │   └── AttendanceTest.php
│   │   │
│   │   ├── Events/
│   │   │   ├── EventCrudTest.php
│   │   │   ├── EventParticipantsTest.php
│   │   │   └── EventNotificationsTest.php
│   │   │
│   │   ├── RBAC/
│   │   │   ├── RolePermissionsTest.php
│   │   │   ├── ClubAccessTest.php
│   │   │   └── MultiTenantTest.php
│   │   │
│   │   └── Onboarding/
│   │       ├── OwnerOnboardingTest.php
│   │       ├── TrainerOnboardingTest.php
│   │       └── InvitationFlowTest.php
│   │
│   └── Factories/                       # Factories para data
│       ├── UserFactory.php              # Ya existe
│       ├── PlaClubTeamFactory.php       # Ya existe
│       ├── PlaClubTeamPlayerFactory.php
│       ├── PlaClubTeamPaymentFactory.php
│       └── PlaClubTeamChargeFactory.php
│
│
├── frontend/tests/                      # FRONTEND
│   ├── e2e/
│   │   ├── setup/                       # Configuración
│   │   │   ├── global-setup.spec.js     # Auth global
│   │   │   └── test-users.js            # Credenciales
│   │   │
│   │   ├── auth/                        # Autenticación
│   │   │   ├── login.spec.js
│   │   │   ├── register.spec.js
│   │   │   ├── logout.spec.js
│   │   │   └── password-reset.spec.js
│   │   │
│   │   ├── modules/                     # Por módulo funcional
│   │   │   ├── players/
│   │   │   │   ├── list.spec.js
│   │   │   │   ├── create.spec.js
│   │   │   │   ├── edit.spec.js
│   │   │   │   ├── documents.spec.js
│   │   │   │   └── filters.spec.js
│   │   │   │
│   │   │   ├── payments/
│   │   │   │   ├── list.spec.js
│   │   │   │   ├── create.spec.js
│   │   │   │   ├── verify.spec.js
│   │   │   │   ├── filters.spec.js
│   │   │   │   └── receipt.spec.js
│   │   │   │
│   │   │   ├── charges/
│   │   │   │   ├── list.spec.js
│   │   │   │   ├── create.spec.js
│   │   │   │   └── assign.spec.js
│   │   │   │
│   │   │   ├── categories/
│   │   │   │   ├── list.spec.js
│   │   │   │   ├── create.spec.js
│   │   │   │   └── assign-trainer.spec.js
│   │   │   │
│   │   │   ├── trainers/
│   │   │   │   ├── list.spec.js
│   │   │   │   ├── invite.spec.js
│   │   │   │   └── profile.spec.js
│   │   │   │
│   │   │   ├── sessions/
│   │   │   │   ├── calendar.spec.js
│   │   │   │   ├── create.spec.js
│   │   │   │   └── attendance.spec.js
│   │   │   │
│   │   │   └── discounts/
│   │   │       ├── list.spec.js
│   │   │       ├── create.spec.js
│   │   │       └── assign.spec.js
│   │   │
│   │   ├── roles/                       # Por rol de usuario
│   │   │   ├── super-admin/
│   │   │   │   ├── dashboard.spec.js
│   │   │   │   ├── clubs.spec.js
│   │   │   │   └── analytics.spec.js
│   │   │   │
│   │   │   ├── owner/
│   │   │   │   ├── dashboard.spec.js
│   │   │   │   ├── club-settings.spec.js
│   │   │   │   └── reports.spec.js
│   │   │   │
│   │   │   ├── trainer/
│   │   │   │   ├── dashboard.spec.js
│   │   │   │   ├── my-players.spec.js
│   │   │   │   ├── sessions.spec.js
│   │   │   │   └── attendance.spec.js
│   │   │   │
│   │   │   ├── player/
│   │   │   │   ├── dashboard.spec.js
│   │   │   │   ├── my-profile.spec.js
│   │   │   │   ├── my-payments.spec.js
│   │   │   │   └── calendar.spec.js
│   │   │   │
│   │   │   └── parent/
│   │   │       ├── dashboard.spec.js
│   │   │       ├── my-children.spec.js
│   │   │       ├── payments.spec.js
│   │   │       └── calendar.spec.js
│   │   │
│   │   ├── flows/                       # Flujos completos E2E
│   │   │   ├── registration-flow.spec.js
│   │   │   ├── onboarding-flow.spec.js
│   │   │   ├── invitation-flow.spec.js
│   │   │   └── payment-cycle-flow.spec.js
│   │   │
│   │   ├── security/                    # Tests de seguridad
│   │   │   ├── rbac.spec.js
│   │   │   ├── multi-tenant.spec.js
│   │   │   └── xss-prevention.spec.js
│   │   │
│   │   └── README.md
│   │
│   └── unit/                            # Tests unitarios React (futuro)
│       └── components/
```

---

## Estado Actual por Módulo

### BACKEND (saas_sport/tests/)

| Archivo | Tests | Qué cubre |
|---------|-------|-----------|
| `AuthorizationTest.php` | 11 | Multi-tenant, ClubScope, permisos |
| `PlayerManagementTest.php` | 1 | Crear jugador (incompleto) |
| `PaymentScenariosTest.php` | ~10 | Escenarios de pagos |
| `SecurityViolationTest.php` | ? | Violaciones de seguridad |
| **TOTAL Backend** | **~22** | - |

### FRONTEND (frontend/tests/e2e/)

| Categoría | Archivos | Tests | Estado |
|-----------|----------|-------|--------|
| Auth | auth.spec.js | 7 | OK |
| Registro | registration-flow.spec.js | 12 | OK |
| RBAC | rbac.spec.js | 8 | OK |
| Multi-tenant | multi-tenant.spec.js | 7 | OK |
| Roles | roles-dashboard.spec.js | 15+ | Falta data |
| Jugadores | players-crud.spec.js, modules/jugadores.spec.js | 16 | OK |
| Pagos | payments-flow.spec.js, modules/pagos.spec.js | 24 | OK |
| Cobros | modules/cobros.spec.js | 8 | OK |
| Onboarding | onboarding-flow.spec.js | 20+ | OK |
| Invitaciones | invitation-flow.spec.js | 12 | OK |
| Owner Flow | club-owner-flow.spec.js (y 4 duplicados) | 12 | Duplicados |
| Context Switch | context-switch.spec.js | 2 | OK |
| **TOTAL Frontend** | **~25 archivos** | **~115** | - |

---

## Lo que Falta por Módulo

### BACKEND - Tests Faltantes (~100 tests)

#### Auth (10 tests)
- [ ] Login exitoso retorna token y user
- [ ] Login con credenciales inválidas retorna 401
- [ ] Registro de owner completo (3 pasos)
- [ ] Token expira después de 60 minutos
- [ ] Refresh token funciona
- [ ] Logout invalida token
- [ ] Reset password envía email
- [ ] Reset password con token válido
- [ ] Reset password con token inválido
- [ ] Validación de campos en registro

#### Players (15 tests)
- [ ] Listar jugadores del club
- [ ] Listar jugadores filtrando por categoría
- [ ] Listar jugadores filtrando por estado
- [ ] Crear jugador con datos válidos
- [ ] Crear jugador valida campos requeridos
- [ ] Ver detalle de jugador
- [ ] Actualizar jugador
- [ ] Desactivar jugador
- [ ] Subir documento de jugador
- [ ] Ver documentos de jugador
- [ ] Owner no puede ver jugadores de otro club
- [ ] Trainer solo ve jugadores de sus categorías
- [ ] Invitar jugador envía email
- [ ] Aceptar invitación crea jugador
- [ ] Buscar jugador por nombre

#### Payments (20 tests)
- [ ] Listar pagos del club
- [ ] Filtrar pagos por estado (PEN, PEV, COM, etc.)
- [ ] Filtrar pagos por mes/año
- [ ] Filtrar pagos por factura
- [ ] Crear pago completo
- [ ] Crear pago parcial (cuotas)
- [ ] Ver detalle de pago
- [ ] Aprobar pago pendiente de verificación
- [ ] Rechazar pago con motivo
- [ ] Cancelar pago pendiente
- [ ] Actualizar código de factura
- [ ] Subir comprobante de pago
- [ ] Ver comprobante de pago
- [ ] Generar recibo de pago
- [ ] Aplicar mora automática
- [ ] Calcular mora por días
- [ ] Pago con descuento aplicado
- [ ] Owner no puede ver pagos de otro club
- [ ] Player solo ve sus pagos
- [ ] Parent ve pagos de sus hijos

#### Charges (10 tests)
- [ ] Listar cobros del club
- [ ] Crear cobro único
- [ ] Crear cobro recurrente
- [ ] Actualizar cobro
- [ ] Desactivar cobro
- [ ] Asignar cobro a jugador
- [ ] Asignar cobro a categoría
- [ ] Cobro genera pagos pendientes
- [ ] Owner no puede ver cobros de otro club
- [ ] Validar campos requeridos

#### Categories (8 tests)
- [ ] Listar categorías del club
- [ ] Crear categoría
- [ ] Actualizar categoría
- [ ] Desactivar categoría
- [ ] Asignar entrenador a categoría
- [ ] Remover entrenador de categoría
- [ ] Categoría con jugadores no se puede eliminar
- [ ] Owner no puede ver categorías de otro club

#### Trainers (8 tests)
- [ ] Listar entrenadores del club
- [ ] Ver perfil de entrenador
- [ ] Invitar entrenador envía email
- [ ] Aceptar invitación de entrenador
- [ ] Asignar categorías a entrenador
- [ ] Desactivar entrenador
- [ ] Owner no puede ver entrenadores de otro club
- [ ] Entrenador ve sus categorías asignadas

#### Sessions (10 tests)
- [ ] Listar sesiones del club
- [ ] Crear sesión de entrenamiento
- [ ] Actualizar sesión
- [ ] Cancelar sesión
- [ ] Registrar asistencia
- [ ] Ver asistencia de sesión
- [ ] Trainer solo ve sus sesiones
- [ ] Player ve sesiones de su categoría
- [ ] Notificar participantes de sesión
- [ ] Sesión recurrente crea múltiples

#### Events (10 tests)
- [ ] Listar eventos del club
- [ ] Crear evento
- [ ] Actualizar evento
- [ ] Cancelar evento
- [ ] Subir imagen a evento
- [ ] Agregar video URL a evento
- [ ] Invitar participantes
- [ ] Confirmar asistencia
- [ ] Enviar notificaciones de evento
- [ ] Owner no puede ver eventos de otro club

#### Discounts (6 tests)
- [ ] Listar descuentos del club
- [ ] Crear descuento porcentual
- [ ] Crear descuento fijo
- [ ] Asignar descuento a jugador
- [ ] Descuento se aplica en pago
- [ ] Desactivar descuento

#### RBAC/Multi-tenant (10 tests) - Ya parcialmente cubiertos
- [x] Super Admin accede a todos los clubes
- [x] Owner solo accede a su club
- [x] ClubScope filtra datos automáticamente
- [ ] Trainer no accede a finanzas
- [ ] Player no accede a gestión
- [ ] Parent solo ve datos de hijos
- [ ] Contador ve reportes financieros
- [ ] Cambio de contexto funciona
- [ ] Usuario multi-rol cambia permisos
- [ ] Audit trail registra accesos

### FRONTEND - Tests Faltantes (~85 tests)

#### Roles - Trainer (15 tests)
- [ ] Dashboard de entrenador muestra sus categorías
- [ ] Ver lista de sus jugadores
- [ ] Ver calendario de sesiones
- [ ] Crear sesión de entrenamiento
- [ ] Tomar asistencia
- [ ] Ver estadísticas de asistencia
- [ ] NO puede acceder a cobros
- [ ] NO puede acceder a descuentos
- [ ] NO puede crear jugadores
- [ ] Puede ver perfil de jugador
- [ ] NO puede ver pagos
- [ ] Ve eventos de su club
- [ ] Puede confirmar asistencia a eventos
- [ ] Menú lateral tiene opciones correctas
- [ ] Onboarding de entrenador completo

#### Roles - Player (12 tests)
- [ ] Dashboard de jugador muestra su info
- [ ] Ver su perfil
- [ ] Editar datos personales
- [ ] Ver sus pagos
- [ ] Ver calendario personal
- [ ] NO puede acceder a gestión
- [ ] NO puede ver otros jugadores
- [ ] Puede confirmar asistencia a eventos
- [ ] Ve notificaciones personales
- [ ] Menú lateral tiene opciones correctas
- [ ] Onboarding de jugador completo
- [ ] Subir documentos propios

#### Roles - Parent (12 tests)
- [ ] Dashboard de padre muestra sus hijos
- [ ] Ver lista de hijos
- [ ] Ver perfil de cada hijo
- [ ] Ver pagos de hijos
- [ ] Realizar pago de hijo
- [ ] Ver calendario de hijos
- [ ] NO puede acceder a gestión
- [ ] Puede confirmar asistencia de hijo
- [ ] Ve notificaciones de hijos
- [ ] Menú lateral tiene opciones correctas
- [ ] Onboarding de padre completo
- [ ] Subir documentos de hijo

#### Módulos Faltantes

**Categorías (8 tests)**
- [ ] Ver lista de categorías
- [ ] Crear categoría
- [ ] Editar categoría
- [ ] Ver jugadores de categoría
- [ ] Asignar entrenador
- [ ] Filtrar por deporte
- [ ] Desactivar categoría
- [ ] Validaciones de formulario

**Entrenadores (8 tests)**
- [ ] Ver lista de entrenadores
- [ ] Ver perfil de entrenador
- [ ] Invitar entrenador (modal)
- [ ] Asignar a categoría
- [ ] Ver categorías asignadas
- [ ] Desactivar entrenador
- [ ] Filtrar por categoría
- [ ] Buscar por nombre

**Sesiones/Calendario (12 tests)**
- [ ] Ver calendario mensual
- [ ] Ver calendario semanal
- [ ] Crear sesión desde calendario
- [ ] Ver detalle de sesión
- [ ] Editar sesión
- [ ] Cancelar sesión
- [ ] Tomar asistencia (modal)
- [ ] Ver historial de asistencia
- [ ] Filtrar por categoría
- [ ] Filtrar por entrenador
- [ ] Navegación entre meses
- [ ] Sesiones recurrentes

**Descuentos (8 tests)**
- [ ] Ver lista de descuentos
- [ ] Crear descuento porcentual
- [ ] Crear descuento fijo
- [ ] Editar descuento
- [ ] Asignar a jugador
- [ ] Ver jugadores con descuento
- [ ] Desactivar descuento
- [ ] Validaciones de formulario

**Acciones de Pagos Faltantes (10 tests)**
- [ ] Aprobar pago (botón funciona)
- [ ] Rechazar pago con motivo
- [ ] Cancelar pago
- [ ] Ver recibo generado
- [ ] Descargar recibo PDF
- [ ] Reenviar recibo por email
- [ ] Editar cuotas de pago
- [ ] Marcar cuota como pagada
- [ ] Ver historial de cambios
- [ ] Filtro combinado (estado + mes + factura)

---

## Usuarios de Prueba Necesarios

```javascript
// frontend/tests/e2e/setup/test-users.js

export const TEST_USERS = {
  superAdmin: {
    email: 'admin@sportsclub.co',
    password: 'admin123',
    role: 'Super Admin'
  },
  owner: {
    email: 'director@bogotafc.co',
    password: 'password123',
    role: 'Propietario del Club',
    club: 'Club Deportivo Bogotá FC'
  },
  trainer: {
    email: 'diego.sanchez@bogotafc.co',
    password: 'password123',
    role: 'Entrenador',
    club: 'Club Deportivo Bogotá FC'
  },
  player: {
    email: 'santiago.mendoza10@player.co',
    password: 'password123',
    role: 'Jugador',
    club: 'Club Deportivo Bogotá FC'
  },
  parent: {
    email: 'padre.kevin.mendoza1@parent.co',
    password: 'password123',
    role: 'Padre/Acudiente',
    club: 'Club Deportivo Bogotá FC'
  },
  multiRole: {
    email: 'juan.multiple@test.co',
    password: 'password123',
    roles: ['owner', 'trainer', 'player', 'parent'],
    clubs: ['Bogotá FC', 'Medellín', 'Cali', 'Barranquilla']
  }
};
```

---

## Prioridades de Implementación

### Fase 1: Fundamentos (Semana 1)
**Objetivo:** Tests funcionen correctamente

1. [ ] Arreglar seeder `CategoriesAndTrainersSeeder` (gender_id null)
2. [ ] Arreglar selector de login en `global-setup.spec.js`
3. [ ] Crear usuarios de prueba con seeders dedicados
4. [ ] Eliminar 5 archivos duplicados de club-owner
5. [ ] Verificar que tests existentes pasen

### Fase 2: Backend Core (Semana 2-3)
**Objetivo:** API bien testeada

1. [ ] Tests de Auth completos (10 tests)
2. [ ] Tests de Players completos (15 tests)
3. [ ] Tests de Payments completos (20 tests)
4. [ ] Tests de RBAC adicionales (10 tests)

### Fase 3: Frontend por Rol (Semana 4-5)
**Objetivo:** Cada rol testeado

1. [ ] Tests de Trainer (15 tests)
2. [ ] Tests de Player (12 tests)
3. [ ] Tests de Parent (12 tests)

### Fase 4: Módulos Faltantes (Semana 6-7)
**Objetivo:** Cobertura completa

1. [ ] Tests de Categorías (8 tests)
2. [ ] Tests de Entrenadores (8 tests)
3. [ ] Tests de Sesiones (12 tests)
4. [ ] Tests de Descuentos (8 tests)

### Fase 5: Flujos E2E (Semana 8)
**Objetivo:** Flujos críticos validados

1. [ ] Flujo completo de registro → onboarding → uso
2. [ ] Flujo de invitación completo
3. [ ] Flujo de pago completo (crear cobro → pagar → verificar → aprobar)

---

## Comandos de Ejecución

### Backend (PHPUnit)

```bash
# Todos los tests
docker compose exec saas_sport_app php artisan test

# Tests de un directorio
docker compose exec saas_sport_app php artisan test --filter=Feature/Auth

# Un test específico
docker compose exec saas_sport_app php artisan test --filter=AuthorizationTest

# Con cobertura (requiere Xdebug)
docker compose exec saas_sport_app php artisan test --coverage
```

### Frontend (Playwright)

```bash
cd frontend

# Todos los tests
npm run test:e2e

# Con UI visual (RECOMENDADO)
npm run test:e2e:ui

# Solo un módulo
npm run test:e2e -- tests/e2e/modules/pagos.spec.js

# Solo tests de un rol
npm run test:e2e -- tests/e2e/roles/trainer/

# Con patrón
npm run test:e2e -- --grep "Pagos"

# Ver reporte HTML
npm run test:e2e:report

# Debug mode
npm run test:e2e:debug
```

---

## Checklist de Validación

### Antes de cada release verificar:

- [ ] `npm run test:e2e` pasa sin errores
- [ ] `php artisan test` pasa sin errores
- [ ] Login funciona para todos los roles
- [ ] CRUD de jugadores funciona
- [ ] Sistema de pagos funciona
- [ ] Permisos RBAC funcionan
- [ ] Multi-tenant aísla datos correctamente

---

## Métricas de Calidad

### Objetivo de Cobertura

| Componente | Actual | Objetivo |
|------------|--------|----------|
| Backend Unit | 0% | 60% |
| Backend Feature | 15% | 80% |
| Frontend E2E | 58% | 85% |
| **Promedio** | **~25%** | **75%** |

### Tiempo de Ejecución Objetivo

| Suite | Tiempo Actual | Objetivo |
|-------|---------------|----------|
| Backend | ~30s | <2 min |
| Frontend E2E | ~5 min | <10 min |
| **Total CI** | - | <15 min |
