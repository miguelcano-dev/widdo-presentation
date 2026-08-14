# Test Automation Expert Skill - Widdo SaaS Sports Platform

## Descripción

Experto en automatización y generación de tests para la plataforma Widdo SaaS Sports, cubriendo backend (PHPUnit/Laravel) y frontend (Playwright/React). Este skill guía la creación de tests comprehensivos basados en roles, permisos y flujos críticos del negocio.

---

## Arquitectura del Proyecto

### Backend (saas_sport - Laravel 12)
- **100 Modelos Eloquent** (prefijos `Pla*` y `Bas*`)
- **54 Controladores** (Admin, Api, main)
- **36 Servicios** de lógica de negocio
- **16 Políticas** de autorización
- **20 Middlewares** de seguridad
- **10 Traits** reutilizables
- **Multi-tenancy** con ClubScope automático

### Frontend (React 18 + Vite)
- **32+ Páginas** con rutas protegidas
- **43+ Directorios de componentes**
- **7 Guards de autorización**
- **8 Contexts** para estado global
- **Page Object Model** para tests E2E

---

## Sistema de Roles y Permisos

### Jerarquía de Roles (6 niveles)

| Rol | Nivel | Backend | Frontend | Acceso Principal |
|-----|-------|---------|----------|------------------|
| **Super Admin** | 100 | `super_admin` | `superAdmin` | Sistema completo |
| **Propietario (Owner)** | 80 | `owner` | `owner` | Club completo + Finanzas |
| **Contador (Accountant)** | 60 | `accountant` | `accountant` | Solo módulos financieros |
| **Entrenador (Trainer)** | 40 | `trainer` | `trainer` | Sesiones + Asistencia |
| **Padre/Madre (Parent)** | 20 | `parent` | `parent` | Datos de sus hijos |
| **Jugador (Player)** | 10 | `player` | `player` | Solo sus propios datos |

### Módulos por Rol

```
OWNER/ADMIN: players, trainers, categories, charges, payments, sessions,
             locations, reports, club, settings, discounts, team-members

ACCOUNTANT:  payments, charges, discounts, financial-reports

TRAINER:     sessions, attendance, players (ver), categories (ver)

PARENT:      my-children, my-payments, my-documents, calendar

PLAYER:      my-payments, my-documents, calendar, my-profile
```

---

## Estructura de Tests Existentes

### Backend (PHPUnit)
```
tests/
├── Feature/
│   ├── AuthorizationTest.php      # Tests de autorización (30% cobertura)
│   ├── SecurityViolationTest.php  # Tests de seguridad (25% cobertura)
│   ├── PaymentScenariosTest.php   # Tests de pagos (20% cobertura)
│   ├── PlayerManagementTest.php   # Tests de jugadores (15% cobertura)
│   └── ExampleTest.php            # Template
├── Unit/
│   └── ExampleTest.php            # Template
├── Traits/
│   └── SeedsBaseData.php          # Helper para datos base
└── TestCase.php                   # Clase base
```

### Frontend (Playwright)
```
tests/e2e/
├── flows/
│   ├── new-user-registration-flow.spec.js
│   ├── owner-complete-flow.spec.js
│   ├── trainer-complete-flow.spec.js
│   ├── player-complete-flow.spec.js
│   └── parent-complete-flow.spec.js
├── fixtures/
│   ├── auth.js                    # Persistencia de auth
│   └── test-users.js              # Usuarios por rol
├── pages/                         # Page Object Model
│   ├── BasePage.js
│   ├── DashboardPage.js
│   ├── PlayersPage.js
│   └── PaymentsPage.js
├── helpers/
│   └── mailhog.js                 # Testing de emails
└── modules/
    ├── jugadores.spec.js
    ├── pagos.spec.js
    └── cobros.spec.js
```

---

## Matriz de Cobertura de Tests Requerida

### Backend - PHPUnit (Target: 85%+ en críticos)

#### 1. Authorization & Security (PRIORIDAD CRÍTICA)
```php
// Tests obligatorios
- testCrossTenantDataAccessPrevention()      // Club A no puede ver datos de Club B
- testUnauthorizedFieldModification()         // Campos protegidos no modificables
- testSuperAdminBypassLogging()              // Bypass se registra en audit
- testClubScopeAutoFiltering()               // Queries filtradas por club_id
- testProtectedModelTrait()                  // secureUpdate() funciona
- testPolicyEnforcementOnAllModels()         // 16 policies activas
- testRateLimitingEffectiveness()            // Rate limit funciona
- testXSSProtectionMiddleware()              // XSS sanitizado
- testCSRFTokenValidation()                  // CSRF requerido
```

#### 2. RBAC Tests por Rol
```php
// Para CADA rol, verificar:
- testRoleCanAccessPermittedEndpoints()
- testRoleCannotAccessRestrictedEndpoints()
- testRolePermissionInheritance()
- testMultiContextRoleSwitching()
- testPermissionCachingCorrectness()
```

#### 3. Controladores API (54 controllers)
```php
// Para CADA controller:
- testIndexReturnsFilteredData()
- testShowReturnsOwnClubData()
- testStoreValidatesInput()
- testStoreRequiresPermission()
- testUpdateOnlyOwnClubData()
- testDestroyRequiresPermission()
- testPaginationWorks()
- testFilteringWorks()
- testSortingWorks()
```

#### 4. Modelos Críticos (17 protegidos)
```php
// Para modelos con ProtectedModel trait:
- testClubIdAutoAssigned()
- testProtectedFieldsNotMassAssignable()
- testSecureUpdateWorks()
- testAuditTrailCreated()
```

### Frontend - Playwright (Target: 90%+ flujos críticos)

#### 1. Flujos Completos por Rol
```javascript
// owner-complete-flow.spec.js
- test('Owner puede crear jugador completo')
- test('Owner puede crear cobro mensual')
- test('Owner puede registrar pago')
- test('Owner puede ver reportes financieros')
- test('Owner puede gestionar equipo')
- test('Owner puede configurar club')

// trainer-complete-flow.spec.js
- test('Trainer puede crear sesión de entrenamiento')
- test('Trainer puede pasar asistencia')
- test('Trainer puede ver sus jugadores asignados')
- test('Trainer NO puede acceder a finanzas')

// player-complete-flow.spec.js
- test('Player ve solo sus pagos')
- test('Player puede subir documentos')
- test('Player ve calendario de eventos')
- test('Player NO puede ver otros jugadores')

// parent-complete-flow.spec.js
- test('Parent ve solo datos de sus hijos')
- test('Parent puede ver pagos de sus hijos')
- test('Parent NO puede modificar datos del club')

// accountant-complete-flow.spec.js
- test('Accountant puede gestionar pagos')
- test('Accountant puede gestionar cobros')
- test('Accountant puede ver reportes')
- test('Accountant NO puede gestionar jugadores')
```

#### 2. Guards de Autorización
```javascript
// authorization-guards.spec.js
- test('AdminRouteGuard bloquea Player')
- test('FinancialRouteGuard bloquea Trainer')
- test('TrainerRouteGuard permite Owner')
- test('OwnerOnlyGuard bloquea Admin')
- test('ParentOnlyGuard bloquea Player')
- test('PlayerOrParentGuard permite ambos')
```

#### 3. Formularios Críticos
```javascript
// form-validation.spec.js
- test('Formulario jugador valida campos requeridos')
- test('Email valida formato correcto')
- test('Teléfono formatea correctamente')
- test('Moneda formatea sin decimales para COP')
- test('Fecha almacena en ISO 8601')
```

---

## Comandos de Ejecución

### Backend (PHPUnit)
```bash
# Desde saas_sport/
php artisan test                           # Todos los tests
php artisan test --filter=Authorization    # Solo autorización
php artisan test --filter=Security         # Solo seguridad
php artisan test --filter=Payment          # Solo pagos
php artisan test --coverage-html coverage  # Con reporte HTML
php artisan test --parallel                # Ejecución paralela
```

### Frontend (Playwright)
```bash
# Desde frontend/
npm run test:e2e                    # Todos los tests
npm run test:e2e:flows              # Solo flujos por rol
npm run test:e2e:owner              # Solo flujo Owner
npm run test:e2e:trainer            # Solo flujo Trainer
npm run test:e2e:ui                 # Modo interactivo
npm run test:e2e:report             # Ver reporte HTML
npx playwright test --debug         # Modo debug
```

---

## Templates de Tests

### PHPUnit - Test de Autorización
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\PlaClubTeam;
use App\Models\PlaClubTeamPlayer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;

class RoleAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    }

    /** @test */
    public function owner_can_access_players_endpoint()
    {
        $club = PlaClubTeam::factory()->create();
        $owner = User::factory()->create();
        $owner->assignRole('owner');
        $owner->clubs()->attach($club->id, ['role' => 'owner', 'status' => 'ACT']);

        Sanctum::actingAs($owner);

        $response = $this->getJson("/api/club-teams/{$club->id}/players");

        $response->assertStatus(200);
    }

    /** @test */
    public function player_cannot_access_other_players_data()
    {
        $club = PlaClubTeam::factory()->create();
        $player = User::factory()->create();
        $player->assignRole('player');
        $player->clubs()->attach($club->id, ['role' => 'player', 'status' => 'ACT']);

        $otherPlayer = PlaClubTeamPlayer::factory()->create(['club_id' => $club->id]);

        Sanctum::actingAs($player);

        $response = $this->getJson("/api/club-teams/{$club->id}/players/{$otherPlayer->id}");

        $response->assertStatus(403);
    }

    /** @test */
    public function trainer_cannot_access_financial_endpoints()
    {
        $club = PlaClubTeam::factory()->create();
        $trainer = User::factory()->create();
        $trainer->assignRole('trainer');
        $trainer->clubs()->attach($club->id, ['role' => 'trainer', 'status' => 'ACT']);

        Sanctum::actingAs($trainer);

        $response = $this->getJson("/api/club-teams/{$club->id}/payments");

        $response->assertStatus(403);
    }

    /** @test */
    public function cross_tenant_access_is_blocked()
    {
        $clubA = PlaClubTeam::factory()->create();
        $clubB = PlaClubTeam::factory()->create();

        $ownerA = User::factory()->create();
        $ownerA->assignRole('owner');
        $ownerA->clubs()->attach($clubA->id, ['role' => 'owner', 'status' => 'ACT']);

        $playerB = PlaClubTeamPlayer::factory()->create(['club_id' => $clubB->id]);

        Sanctum::actingAs($ownerA);

        // Intentar acceder a datos del Club B
        $response = $this->getJson("/api/club-teams/{$clubB->id}/players/{$playerB->id}");

        $response->assertStatus(403);

        // Verificar que se registró en audit trail
        $this->assertDatabaseHas('audit_trails', [
            'user_id' => $ownerA->id,
            'action' => 'cross_tenant_access_attempt'
        ]);
    }
}
```

### PHPUnit - Test de Pagos
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\PlaClubTeam;
use App\Models\PlaClubTeamPlayer;
use App\Models\PlaClubTeamCharge;
use App\Models\PlaClubTeamPayment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class PaymentWorkflowTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function owner_can_create_charge()
    {
        $club = PlaClubTeam::factory()->create();
        $owner = $this->createOwnerForClub($club);

        Sanctum::actingAs($owner);

        $response = $this->postJson("/api/club-teams/{$club->id}/charges", [
            'name' => 'Mensualidad Enero 2026',
            'amount' => 150000,
            'type' => 'monthly',
            'due_date' => '2026-01-31',
            'applies_to' => 'all_players'
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['data' => ['id', 'name', 'amount']]);
    }

    /** @test */
    public function payment_applies_discount_correctly()
    {
        $club = PlaClubTeam::factory()->create();
        $owner = $this->createOwnerForClub($club);
        $player = PlaClubTeamPlayer::factory()->create(['club_id' => $club->id]);
        $charge = PlaClubTeamCharge::factory()->create([
            'club_id' => $club->id,
            'amount' => 200000
        ]);

        // Crear descuento del 10%
        $discount = $club->discounts()->create([
            'name' => 'Descuento hermanos',
            'type' => 'percentage',
            'value' => 10
        ]);

        Sanctum::actingAs($owner);

        $response = $this->postJson("/api/club-teams/{$club->id}/payments", [
            'player_id' => $player->id,
            'charge_id' => $charge->id,
            'discount_id' => $discount->id,
            'amount' => 180000,  // 200000 - 10%
            'payment_method' => 'transfer',
            'payment_date' => now()->toDateString()
        ]);

        $response->assertStatus(201);

        $payment = PlaClubTeamPayment::first();
        $this->assertEquals(180000, $payment->amount);
        $this->assertEquals($discount->id, $payment->discount_id);
    }

    /** @test */
    public function late_fee_is_calculated_correctly()
    {
        $club = PlaClubTeam::factory()->create();
        $owner = $this->createOwnerForClub($club);

        // Configurar mora: 5% después de 5 días
        $club->lateFeeTiers()->create([
            'days_after_due' => 5,
            'fee_type' => 'percentage',
            'fee_value' => 5
        ]);

        $charge = PlaClubTeamCharge::factory()->create([
            'club_id' => $club->id,
            'amount' => 100000,
            'due_date' => now()->subDays(10)  // 10 días vencido
        ]);

        Sanctum::actingAs($owner);

        $response = $this->getJson("/api/club-teams/{$club->id}/charges/{$charge->id}/calculate-late-fee");

        $response->assertStatus(200)
                 ->assertJson([
                     'original_amount' => 100000,
                     'late_fee' => 5000,
                     'total' => 105000
                 ]);
    }

    private function createOwnerForClub(PlaClubTeam $club): User
    {
        $owner = User::factory()->create();
        $owner->assignRole('owner');
        $owner->clubs()->attach($club->id, ['role' => 'owner', 'status' => 'ACT']);
        return $owner;
    }
}
```

### Playwright - Flujo Completo de Owner
```javascript
// tests/e2e/flows/owner-complete-flow.spec.js
import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/test-users';
import { DashboardPage } from '../pages/DashboardPage';
import { PlayersPage } from '../pages/PlayersPage';
import { PaymentsPage } from '../pages/PaymentsPage';

test.describe('Owner Complete Flow', () => {
  let dashboardPage;
  let playersPage;
  let paymentsPage;

  test.beforeEach(async ({ page }) => {
    // Login como Owner
    await page.goto('/login');
    await page.fill('[data-testid="email"]', testUsers.owner.email);
    await page.fill('[data-testid="password"]', testUsers.owner.password);
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL(/.*dashboard/);

    dashboardPage = new DashboardPage(page);
    playersPage = new PlayersPage(page);
    paymentsPage = new PaymentsPage(page);
  });

  test('Owner ve dashboard con métricas del club', async ({ page }) => {
    await expect(dashboardPage.welcomeMessage).toBeVisible();
    await expect(dashboardPage.totalPlayersCard).toBeVisible();
    await expect(dashboardPage.pendingPaymentsCard).toBeVisible();
    await expect(dashboardPage.upcomingSessionsCard).toBeVisible();
  });

  test('Owner puede crear jugador completo', async ({ page }) => {
    await playersPage.navigateToPlayers();
    await playersPage.clickCreatePlayer();

    // Datos personales
    await playersPage.fillPersonalData({
      firstName: 'Test',
      lastName: 'Player',
      documentType: 'CC',
      documentNumber: '1234567890',
      birthDate: '2010-05-15',
      gender: 'M',
      email: `test${Date.now()}@player.co`,
      phone: '3001234567'
    });

    // Datos médicos
    await playersPage.fillMedicalData({
      bloodType: 'O+',
      eps: 'Sura',
      allergies: 'Ninguna'
    });

    // Categoría
    await playersPage.selectCategory('Sub-12');

    await playersPage.savePlayer();

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('Owner puede registrar pago', async ({ page }) => {
    await paymentsPage.navigateToPayments();
    await paymentsPage.clickCreatePayment();

    await paymentsPage.selectPlayer('Test Player');
    await paymentsPage.selectCharge('Mensualidad Enero');
    await paymentsPage.fillAmount('150000');
    await paymentsPage.selectPaymentMethod('Transferencia');

    await paymentsPage.savePayment();

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('Owner puede ver reportes financieros', async ({ page }) => {
    await page.click('[data-testid="nav-reports"]');

    await expect(page.locator('[data-testid="financial-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="payments-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="pending-amounts"]')).toBeVisible();
  });
});
```

### Playwright - Test de Guards de Autorización
```javascript
// tests/e2e/authorization/guards.spec.js
import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/test-users';

test.describe('Authorization Guards', () => {

  test('Player NO puede acceder a gestión de jugadores', async ({ page }) => {
    // Login como Player
    await page.goto('/login');
    await page.fill('[data-testid="email"]', testUsers.player.email);
    await page.fill('[data-testid="password"]', testUsers.player.password);
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/.*dashboard/);

    // Intentar acceso directo a /home/players
    await page.goto('/home/players');

    // Debe redirigir o mostrar acceso denegado
    await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
  });

  test('Trainer NO puede acceder a pagos', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', testUsers.trainer.email);
    await page.fill('[data-testid="password"]', testUsers.trainer.password);
    await page.click('[data-testid="login-button"]');

    // Intentar acceso a pagos
    await page.goto('/home/payments');

    await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
  });

  test('Accountant puede acceder a pagos pero NO a jugadores', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', testUsers.accountant.email);
    await page.fill('[data-testid="password"]', testUsers.accountant.password);
    await page.click('[data-testid="login-button"]');

    // Puede acceder a pagos
    await page.goto('/home/payments');
    await expect(page.locator('[data-testid="payments-table"]')).toBeVisible();

    // NO puede acceder a jugadores
    await page.goto('/home/players');
    await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
  });

  test('Parent solo ve datos de sus hijos', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', testUsers.parent.email);
    await page.fill('[data-testid="password"]', testUsers.parent.password);
    await page.click('[data-testid="login-button"]');

    // Navega a mis hijos
    await page.click('[data-testid="nav-my-children"]');

    // Debe ver solo sus hijos registrados
    const childrenCards = page.locator('[data-testid="child-card"]');
    await expect(childrenCards).toHaveCount(await childrenCards.count());

    // NO puede ver otros jugadores
    await page.goto('/home/players');
    await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
  });
});
```

### Playwright - Test de Validación de Formularios
```javascript
// tests/e2e/forms/validation.spec.js
import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/test-users';

test.describe('Form Validation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', testUsers.owner.email);
    await page.fill('[data-testid="password"]', testUsers.owner.password);
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('Formulario de jugador muestra errores de validación', async ({ page }) => {
    await page.goto('/home/player-create');

    // Intentar guardar sin datos
    await page.click('[data-testid="save-button"]');

    // Verificar errores
    await expect(page.locator('[data-testid="error-firstName"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-lastName"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-documentNumber"]')).toBeVisible();
  });

  test('Email valida formato correcto', async ({ page }) => {
    await page.goto('/home/player-create');

    await page.fill('[data-testid="email"]', 'email-invalido');
    await page.click('[data-testid="save-button"]');

    await expect(page.locator('[data-testid="error-email"]'))
      .toContainText('formato de correo');

    // Corregir el email
    await page.fill('[data-testid="email"]', 'correo@valido.co');
    await expect(page.locator('[data-testid="error-email"]')).not.toBeVisible();
  });

  test('Campo de moneda formatea correctamente para COP', async ({ page }) => {
    await page.goto('/home/chargers/create');

    const amountInput = page.locator('[data-testid="amount"]');

    // Escribir monto
    await amountInput.fill('150000');
    await amountInput.blur();

    // Debe mostrar formateado: 150.000
    await expect(amountInput).toHaveValue('150.000');

    // Al enfocar, debe mostrar sin formato
    await amountInput.focus();
    await expect(amountInput).toHaveValue('150000');
  });

  test('Teléfono acepta solo números', async ({ page }) => {
    await page.goto('/home/player-create');

    const phoneInput = page.locator('[data-testid="phone"]');

    await phoneInput.fill('abc123def456');

    // Debe tener solo números
    await expect(phoneInput).toHaveValue('123456');
  });
});
```

---

## Priorización de Tests

### Fase 1: Seguridad y Autorización (Crítico)
1. Tests de cross-tenant isolation
2. Tests de RBAC por cada rol
3. Tests de políticas de autorización
4. Tests de middlewares de seguridad

### Fase 2: Flujos Principales por Rol (Alta)
1. Owner: Gestión completa de club
2. Trainer: Sesiones y asistencia
3. Accountant: Pagos y cobros
4. Player/Parent: Visualización de datos propios

### Fase 3: Funcionalidades Core (Media)
1. CRUD de jugadores
2. Sistema de pagos completo
3. Gestión de sesiones
4. Calendario y eventos

### Fase 4: Edge Cases y Error Handling (Normal)
1. Validaciones de formularios
2. Manejo de errores de red
3. Estados vacíos
4. Paginación y filtros

---

## Usuarios de Prueba

### Backend (Sanctum)
```php
// Tests\Traits\CreatesTestUsers
$superAdmin = User::factory()->create(['email' => 'admin@test.co']);
$superAdmin->assignRole('super_admin');

$owner = User::factory()->create(['email' => 'owner@test.co']);
$owner->assignRole('owner');
$owner->clubs()->attach($club->id, ['role' => 'owner', 'status' => 'ACT']);

$trainer = User::factory()->create(['email' => 'trainer@test.co']);
$trainer->assignRole('trainer');

$accountant = User::factory()->create(['email' => 'accountant@test.co']);
$accountant->assignRole('accountant');

$player = User::factory()->create(['email' => 'player@test.co']);
$player->assignRole('player');

$parent = User::factory()->create(['email' => 'parent@test.co']);
$parent->assignRole('parent');
```

### Frontend (Playwright fixtures)
```javascript
// tests/e2e/fixtures/test-users.js
export const testUsers = {
  owner: {
    email: 'director@bogotafc.co',
    password: 'Password123!',
    clubId: 1,
    role: 'owner'
  },
  trainer: {
    email: 'diego.sanchez@bogotafc.co',
    password: 'Password123!',
    clubId: 1,
    role: 'trainer'
  },
  player: {
    email: 'alejandro.álvarez10@player.co',
    password: 'Password123!',
    clubId: 1,
    role: 'player'
  },
  parent: {
    email: 'luzm@h.com',
    password: 'Password123!',
    clubId: 7,
    role: 'parent'
  },
  accountant: {
    email: 'contador@bogotafc.co',
    password: 'Password123!',
    clubId: 1,
    role: 'accountant'
  },
  superAdmin: {
    email: 'admin@sportsclub.co',
    password: 'AdminPassword123!',
    role: 'super_admin'
  }
};
```

---

## Métricas de Calidad

### Cobertura Mínima Requerida
- **Authorization/Security**: 95%
- **API Controllers**: 85%
- **Core Business Logic**: 80%
- **Frontend E2E Flows**: 90%
- **Form Validation**: 100%

### Criterios de Aceptación
- Zero tests fallando en CI/CD
- Tiempo de ejecución < 10 minutos para suite completa
- Screenshots en cada fallo
- Videos para flujos E2E

---

## Buenas Prácticas

### PHPUnit
1. Usar `RefreshDatabase` para aislamiento
2. Crear factories para todos los modelos
3. No depender de datos de producción
4. Usar `Sanctum::actingAs()` para auth
5. Verificar audit trails en tests de seguridad

### Playwright
1. Usar Page Object Model
2. Persistir sesiones para optimizar tiempo
3. Screenshots en cada paso crítico
4. data-testid para selectores estables
5. Timeouts generosos para operaciones de red

---

## Invocación

Cuando el usuario solicite:
- "Crear tests de [módulo]"
- "Verificar cobertura de [funcionalidad]"
- "Agregar tests de autorización"
- "Tests E2E para [flujo]"

Utilizar este skill para:
1. Identificar los tests necesarios según el módulo
2. Generar código de tests siguiendo los templates
3. Verificar que cubren todos los roles afectados
4. Incluir casos edge y errores esperados
