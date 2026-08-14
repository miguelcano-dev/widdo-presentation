# Plan: Sistema de Módulos y Planes de Suscripción

**Fecha de creación:** 30 de Enero de 2026
**Estado:** Planificado para FASE 12 (Laravel 12)
**Prioridad:** Alta

---

## Objetivo

Implementar un sistema de módulos dinámicos por club que permita:
- Ofrecer planes gratuitos con funcionalidades limitadas
- Planes de pago con más módulos
- Control granular desde Super Admin
- Validación en frontend y backend

---

## 1. Estructura de Planes

### Plan Gratis ($0/mes)
```
Módulos incluidos:
├── players      - Gestión de jugadores (máx 30)
├── trainers     - Gestión de entrenadores (máx 3)
├── calendar     - Calendario básico
└── attendance   - Control de asistencia
```

### Plan Básico ($50,000 COP/mes)
```
Todo lo de Gratis +
├── categories   - Categorías ilimitadas
├── payments     - Registro de pagos
├── charges      - Configuración de cobros
├── notifications - Recordatorios por email
└── Sin límite de jugadores/entrenadores
```

### Plan Pro ($150,000 COP/mes)
```
Todo lo de Básico +
├── discounts    - Sistema de descuentos
├── documents    - Gestión de documentos
├── reports      - Reportes avanzados
├── tournaments  - Sistema de torneos
├── locations    - Múltiples sedes
└── Soporte prioritario
```

### Plan Enterprise (Precio personalizado)
```
Todo lo de Pro +
├── api_access   - Acceso a API
├── white_label  - Marca blanca
├── custom_domain - Dominio personalizado
├── sla          - SLA garantizado
└── Soporte dedicado
```

---

## 2. Base de Datos

### Modificar `pla_subscription_plans`
```sql
ALTER TABLE pla_subscription_plans
ADD COLUMN modules_included JSON COMMENT 'Array de module keys incluidos';

-- Ejemplo de datos:
UPDATE pla_subscription_plans SET modules_included = '["players", "trainers", "calendar", "attendance"]' WHERE slug = 'free';
UPDATE pla_subscription_plans SET modules_included = '["players", "trainers", "calendar", "attendance", "categories", "payments", "charges", "notifications"]' WHERE slug = 'basic';
UPDATE pla_subscription_plans SET modules_included = '["players", "trainers", "calendar", "attendance", "categories", "payments", "charges", "notifications", "discounts", "documents", "reports", "tournaments", "locations"]' WHERE slug = 'pro';
```

### Nueva tabla `club_module_settings`
```sql
CREATE TABLE club_module_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    club_id BIGINT UNSIGNED NOT NULL,
    module_key VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    enabled_by BIGINT UNSIGNED NULL COMMENT 'Super Admin que habilitó',
    enabled_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL COMMENT 'Para pruebas temporales',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_club_module (club_id, module_key),
    FOREIGN KEY (club_id) REFERENCES pla_club_teams(id) ON DELETE CASCADE,
    FOREIGN KEY (enabled_by) REFERENCES users(id) ON DELETE SET NULL
) COMMENT 'Overrides de módulos por club (Super Admin)';
```

### Agregar campos de límites a `pla_subscription_plans`
```sql
ALTER TABLE pla_subscription_plans
ADD COLUMN max_players INT NULL COMMENT 'NULL = ilimitado',
ADD COLUMN max_trainers INT NULL,
ADD COLUMN max_categories INT NULL,
ADD COLUMN max_storage_mb INT DEFAULT 500;
```

---

## 3. Lista de Módulos

| Key | Nombre UI | Descripción | Rutas Frontend | Rutas API |
|-----|-----------|-------------|----------------|-----------|
| `players` | Jugadores | CRUD de jugadores | `/home/players/*` | `/api/players/*` |
| `trainers` | Entrenadores | CRUD de entrenadores | `/home/trainers/*` | `/api/trainers/*` |
| `categories` | Categorías | Categorías por edad/nivel | `/home/categories/*` | `/api/categories/*` |
| `calendar` | Calendario | Eventos y calendario | `/home/calendar` | `/api/events/*` |
| `attendance` | Asistencia | Control de asistencia | `/home/attendance/*` | `/api/attendance/*` |
| `payments` | Pagos | Registro de pagos | `/home/payments/*` | `/api/payments/*` |
| `charges` | Cobros | Configuración de cobros | `/home/chargers/*` | `/api/charges/*` |
| `discounts` | Descuentos | Descuentos y promociones | `/home/discounts/*` | `/api/discounts/*` |
| `documents` | Documentos | Gestión documental | `/home/documents/*` | `/api/documents/*` |
| `reports` | Reportes | Reportes avanzados | `/home/reports/*` | `/api/reports/*` |
| `tournaments` | Torneos | Sistema de torneos | `/home/tournaments/*` | `/api/tournaments/*` |
| `locations` | Sedes | Múltiples ubicaciones | `/home/venues/*` | `/api/locations/*` |
| `notifications` | Notificaciones | Sistema de notificaciones | `/home/notification-settings` | `/api/notifications/*` |

---

## 4. Backend - Implementación

### Middleware `CheckModuleAccess`
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckModuleAccess
{
    public function handle(Request $request, Closure $next, string $module)
    {
        $user = $request->user();
        $club = $user?->currentClub;

        if (!$club) {
            return response()->json([
                'error' => 'no_club_selected',
                'message' => 'No hay club seleccionado',
            ], 400);
        }

        if (!$club->hasModule($module)) {
            return response()->json([
                'error' => 'module_not_enabled',
                'message' => 'Este módulo no está disponible en tu plan',
                'module' => $module,
                'current_plan' => $club->subscription?->plan?->name ?? 'Sin plan',
                'upgrade_url' => config('app.frontend_url') . '/home/subscription',
            ], 403);
        }

        return $next($request);
    }
}
```

### Método `hasModule()` en PlaClubTeam
```php
public function hasModule(string $moduleKey): bool
{
    // 1. Verificar override manual del Super Admin
    $override = $this->moduleSettings()
        ->where('module_key', $moduleKey)
        ->first();

    if ($override) {
        // Verificar si ha expirado
        if ($override->expires_at && $override->expires_at->isPast()) {
            return false;
        }
        return $override->enabled;
    }

    // 2. Verificar módulos del plan de suscripción
    $plan = $this->subscription?->plan;

    if (!$plan) {
        // Sin plan = solo módulos gratis
        $freeModules = ['players', 'trainers', 'calendar', 'attendance'];
        return in_array($moduleKey, $freeModules);
    }

    $includedModules = $plan->modules_included ?? [];
    return in_array($moduleKey, $includedModules);
}

public function getEnabledModules(): array
{
    $plan = $this->subscription?->plan;
    $planModules = $plan?->modules_included ?? ['players', 'trainers', 'calendar', 'attendance'];

    // Aplicar overrides
    $overrides = $this->moduleSettings()->get();

    foreach ($overrides as $override) {
        if ($override->expires_at && $override->expires_at->isPast()) {
            continue;
        }

        if ($override->enabled && !in_array($override->module_key, $planModules)) {
            $planModules[] = $override->module_key;
        } elseif (!$override->enabled) {
            $planModules = array_filter($planModules, fn($m) => $m !== $override->module_key);
        }
    }

    return array_values($planModules);
}

public function moduleSettings()
{
    return $this->hasMany(ClubModuleSetting::class, 'club_id');
}
```

### Registrar Middleware en `Kernel.php`
```php
protected $middlewareAliases = [
    // ... otros middlewares
    'module' => \App\Http\Middleware\CheckModuleAccess::class,
];
```

### Uso en Rutas
```php
// routes/api.php

Route::middleware(['auth:sanctum', 'module:payments'])->group(function () {
    Route::apiResource('payments', PaymentController::class);
});

Route::middleware(['auth:sanctum', 'module:tournaments'])->group(function () {
    Route::apiResource('tournaments', TournamentController::class);
});

Route::middleware(['auth:sanctum', 'module:reports'])->group(function () {
    Route::get('reports/income', [ReportController::class, 'income']);
    Route::get('reports/attendance', [ReportController::class, 'attendance']);
});
```

---

## 5. Frontend - Implementación

### Guard de Módulos
```jsx
// components/guards/ModuleGuard.jsx
import { useClub } from '@/contexts/ClubContext';
import { Navigate } from 'react-router-dom';

const ModuleGuard = ({ module, children, fallback = null }) => {
  const { club } = useClub();
  const enabledModules = club?.enabled_modules || [];

  if (!enabledModules.includes(module)) {
    if (fallback) return fallback;
    return <Navigate to="/home/upgrade" state={{ requiredModule: module }} />;
  }

  return children;
};

export default ModuleGuard;
```

### Uso en App.jsx
```jsx
<Route
  path="/home/tournaments/*"
  element={
    <ModuleGuard module="tournaments">
      <TournamentsPage />
    </ModuleGuard>
  }
/>
```

### Sidebar Dinámico (MenuList.jsx)
```jsx
const menuItems = [
  { to: '/home/dashboard', icon: Home, label: 'Dashboard' }, // Siempre visible
  { to: '/home/players', icon: Users, label: 'Jugadores', moduleKey: 'players' },
  { to: '/home/trainers', icon: UserCheck, label: 'Entrenadores', moduleKey: 'trainers' },
  { to: '/home/categories', icon: Layers, label: 'Categorías', moduleKey: 'categories' },
  { to: '/home/payments', icon: CreditCard, label: 'Pagos', moduleKey: 'payments' },
  { to: '/home/tournaments', icon: Trophy, label: 'Torneos', moduleKey: 'tournaments' },
  // ...
];

const enabledModules = club?.enabled_modules || [];

const visibleItems = menuItems.filter(item => {
  if (!item.moduleKey) return true; // Sin moduleKey = siempre visible
  return enabledModules.includes(item.moduleKey);
});
```

### Página de Upgrade
```jsx
// pages/UpgradePage.jsx
const UpgradePage = () => {
  const location = useLocation();
  const requiredModule = location.state?.requiredModule;

  return (
    <div className="text-center py-12">
      <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">Módulo no disponible</h1>
      <p className="text-muted-foreground mb-6">
        {requiredModule
          ? `El módulo "${requiredModule}" no está incluido en tu plan actual.`
          : 'Esta funcionalidad requiere un plan superior.'
        }
      </p>
      <Button asChild>
        <Link to="/home/subscription">Ver planes disponibles</Link>
      </Button>
    </div>
  );
};
```

---

## 6. Configuración de Notificaciones por Club

### Campos en `pla_club_teams`
```sql
ALTER TABLE pla_club_teams ADD COLUMN (
    -- Control global
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications_enabled BOOLEAN DEFAULT true,
    push_notifications_enabled BOOLEAN DEFAULT true,
    in_app_notifications_enabled BOOLEAN DEFAULT true,

    -- Horario de no molestar (hora Colombia)
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME DEFAULT '21:00',
    quiet_hours_end TIME DEFAULT '08:00',

    -- Recordatorios de entrenamientos
    training_reminder_enabled BOOLEAN DEFAULT true,
    training_reminder_hours_before INT DEFAULT 12,

    -- Recordatorios de eventos
    event_reminder_enabled BOOLEAN DEFAULT true,
    event_reminder_hours_before INT DEFAULT 24,
    event_second_reminder_enabled BOOLEAN DEFAULT true,
    event_second_reminder_hours INT DEFAULT 2,

    -- Cumpleaños
    birthday_notifications_enabled BOOLEAN DEFAULT true,

    -- Pagos (ya existen algunos, agregar faltantes)
    payment_reminder_enabled BOOLEAN DEFAULT true
);
```

### Página de Configuración (Owner)
```
/home/notification-settings

Secciones:
├── Control General
│   ├── Toggle: Activar notificaciones del club
│   ├── Toggle: Emails
│   ├── Toggle: Push
│   └── Toggle: In-App
│
├── Horario de No Molestar
│   ├── Toggle: Activar
│   ├── Hora inicio: 21:00
│   └── Hora fin: 08:00
│
├── Entrenamientos
│   ├── Toggle: Enviar recordatorios
│   └── Input: Horas antes (default: 12)
│
├── Eventos
│   ├── Toggle: Primer recordatorio
│   ├── Input: Horas antes (default: 24)
│   ├── Toggle: Segundo recordatorio
│   └── Input: Horas antes (default: 2)
│
├── Pagos
│   ├── Toggle: Recordatorios de pago
│   ├── Input: Días antes del vencimiento
│   ├── Toggle: El día del vencimiento
│   └── Input: Días después (mora)
│
└── Cumpleaños
    └── Toggle: Enviar felicitaciones
```

---

## 7. Super Admin - Gestión de Módulos

### Página `/admin/clubs/{id}/modules`
```
Club: Bogotá FC
Plan actual: Básico
Suscripción válida hasta: 15/02/2026

Módulos del Plan Básico:
☑ Jugadores (incluido)
☑ Entrenadores (incluido)
☑ Categorías (incluido)
☑ Calendario (incluido)
☑ Asistencia (incluido)
☑ Pagos (incluido)
☑ Cobros (incluido)
☑ Notificaciones (incluido)

Módulos Adicionales (no incluidos en el plan):
☐ Descuentos [Habilitar] [30 días prueba]
☐ Documentos [Habilitar] [30 días prueba]
☐ Reportes [Habilitar] [30 días prueba]
☑ Torneos ⭐ Override activo
   └── Habilitado por: admin@widdo.co el 15/01/2026
   └── Expira: Nunca
   └── [Deshabilitar]

[Guardar cambios]
```

---

## 8. API Endpoints

### Para el Club (Owner)
```
GET  /api/club/modules              → Lista módulos habilitados
GET  /api/club/notification-settings → Config actual
PUT  /api/club/notification-settings → Actualizar config
```

### Para Super Admin
```
GET  /api/admin/clubs/{id}/modules           → Módulos del club
POST /api/admin/clubs/{id}/modules           → Habilitar módulo
DELETE /api/admin/clubs/{id}/modules/{key}   → Deshabilitar módulo
POST /api/admin/clubs/{id}/modules/{key}/trial → Habilitar prueba temporal
```

---

## 9. Checklist de Implementación

### Base de Datos
- [ ] Migración: `modules_included` en `pla_subscription_plans`
- [ ] Migración: Crear tabla `club_module_settings`
- [ ] Migración: Campos de límites en planes
- [ ] Migración: Campos de notificaciones en `pla_club_teams`
- [ ] Seeder: Configurar módulos por plan existente

### Backend
- [ ] Modelo: `ClubModuleSetting`
- [ ] Middleware: `CheckModuleAccess`
- [ ] Métodos: `hasModule()`, `getEnabledModules()` en `PlaClubTeam`
- [ ] Controller: `ClubModuleController` (Super Admin)
- [ ] Controller: `NotificationSettingsController` (Owner)
- [ ] Actualizar rutas con middleware `module:`
- [ ] Actualizar Jobs para respetar config de notificaciones
- [ ] Tests: Acceso por módulo

### Frontend
- [ ] Componente: `ModuleGuard.jsx`
- [ ] Página: `UpgradePage.jsx`
- [ ] Actualizar: `MenuList.jsx` (sidebar dinámico)
- [ ] Página: `/admin/clubs/{id}/modules`
- [ ] Página: `/home/notification-settings`
- [ ] Actualizar: `ClubContext` para incluir `enabled_modules`
- [ ] Tests E2E: Verificar acceso por módulo

---

## 10. Consideraciones de UX

### Para usuarios de Plan Gratis
- Mostrar módulos bloqueados con candado en el sidebar (opcional)
- "Prueba gratis por 7 días" para módulos Pro
- Mensajes claros de qué incluye cada plan

### Para el Owner
- Notificar cuando un módulo de prueba está por vencer
- Mostrar banner si se acerca el límite de jugadores
- Facilitar el upgrade desde cualquier bloqueo

### Para Super Admin
- Log de cambios de módulos por club
- Alertas de clubs con pruebas por vencer
- Dashboard de uso de módulos

---

## Notas Finales

Este sistema permite:
1. **Monetización flexible** - Diferentes planes para diferentes necesidades
2. **Pruebas gratuitas** - Habilitar módulos temporalmente para demos
3. **Control total** - Super Admin puede hacer excepciones
4. **Seguridad** - Validación en 3 capas evita bypass
5. **Escalabilidad** - Fácil agregar nuevos módulos

**Implementar junto con migración a Laravel 12** para aprovechar las nuevas características del framework.
