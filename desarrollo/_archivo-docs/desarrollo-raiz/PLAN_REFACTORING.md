# Plan de Refactoring y Migración - Widdo

**Fecha de creación:** 29 de Enero de 2026
**Última actualización:** 29 de Enero de 2026
**Estado:** En progreso

---

## Resumen Ejecutivo

Este plan cubre la migración de Laravel 10 → 12 y el refactoring del backend/frontend del proyecto Widdo, siguiendo un enfoque incremental y seguro.

---

## Estado Inicial del Proyecto

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| **Laravel** | 10.10 | Necesita ir a 11 → 12 (no se puede saltar) |
| **PHP** | 8.2 (local) / 8.3 (prod) | Compatible con Laravel 12 |
| **Tests existentes** | 4 tests reales | `Authorization`, `Security`, `Payment`, `Player` |
| **CI/CD** | Solo deploy | No corre tests antes de desplegar |
| **Cobertura estimada** | ~5-10% | Solo endpoints críticos |

### Archivos de Tests Actuales
```
tests/
├── Unit/
│   └── ExampleTest.php
└── Feature/
    ├── ExampleTest.php
    ├── AuthorizationTest.php
    ├── SecurityViolationTest.php
    ├── PaymentScenariosTest.php
    └── PlayerManagementTest.php
```

---

## Fases del Plan

### FASE 0: Preparación y Tests de Regresión
**Estado:** ⬜ Pendiente
**Prioridad:** CRÍTICA
**Duración estimada:** 2-4 horas

> **Objetivo:** Capturar el comportamiento actual ANTES de tocar nada

#### Tareas
- [ ] Crear rama `feature/laravel-upgrade` desde `main`
- [ ] Expandir tests de API para cubrir endpoints críticos (~15 tests nuevos)
- [ ] Configurar workflow de CI para correr tests en PRs
- [ ] Documentar estado actual de la BD
- [ ] Verificar que todos los tests existentes pasan

#### Tests de Regresión a Crear
| Endpoint | Prioridad | Estado |
|----------|-----------|--------|
| `POST /api/login` | Alta | ⬜ |
| `GET /api/club-teams/{id}/players` | Alta | ⬜ |
| `POST /api/club-teams/{id}/players` | Alta | ⬜ |
| `GET /api/club-teams/{id}/payments` | Alta | ⬜ |
| `POST /api/club-teams/{id}/payments` | Alta | ⬜ |
| `GET /api/club-teams/{id}/sessions` | Media | ⬜ |
| `GET /api/club-teams/{id}/charges` | Media | ⬜ |
| `GET /api/club-teams/{id}/categories` | Media | ⬜ |
| `GET /api/events` | Media | ⬜ |
| `POST /api/events` | Media | ⬜ |

#### Criterio de Éxito
- [ ] Todos los tests pasan en Laravel 10
- [ ] CI configurado y funcionando
- [ ] Rama de trabajo creada

---

### FASE 1: Laravel 10 → 11
**Estado:** ⬜ Pendiente
**Prioridad:** Alta
**Duración estimada:** 4-8 horas
**Dependencias:** Fase 0 completada

> **Objetivo:** Actualizar a Laravel 11 de forma segura

#### Breaking Changes de Laravel 11
1. **Nueva estructura de bootstrap:**
   - `app/Http/Kernel.php` → `bootstrap/app.php`
   - `app/Console/Kernel.php` → `bootstrap/app.php`
   - `app/Exceptions/Handler.php` → `bootstrap/app.php`

2. **Configuración simplificada:**
   - Archivos de config reducidos
   - Nuevo archivo `.env` con menos variables

3. **Middleware:**
   - Middleware global en `bootstrap/app.php`
   - Grupos de middleware redefinidos

#### Tareas
- [ ] Actualizar `composer.json`:
  ```json
  "laravel/framework": "^11.0"
  ```
- [ ] Actualizar paquetes de terceros:
  - [ ] `laravel/sanctum` → `^4.0`
  - [ ] `spatie/laravel-permission` → verificar compatibilidad
  - [ ] `owen-it/laravel-auditing` → verificar compatibilidad
  - [ ] Otros paquetes
- [ ] Migrar Kernel.php a bootstrap/app.php
- [ ] Migrar Exception Handler
- [ ] Actualizar middleware configuration
- [ ] Revisar y actualizar config files
- [ ] Correr `composer update`
- [ ] Correr tests - verificar que pasan
- [ ] Pruebas manuales de flujos críticos

#### Archivos a Modificar
| Archivo | Acción | Estado |
|---------|--------|--------|
| `composer.json` | Actualizar versiones | ⬜ |
| `bootstrap/app.php` | Crear/reconfigurar | ⬜ |
| `app/Http/Kernel.php` | Migrar y eliminar | ⬜ |
| `app/Console/Kernel.php` | Migrar y eliminar | ⬜ |
| `app/Exceptions/Handler.php` | Migrar y eliminar | ⬜ |
| `config/*.php` | Revisar cambios | ⬜ |

#### Criterio de Éxito
- [ ] `composer update` sin errores
- [ ] Todos los tests pasan
- [ ] Aplicación funciona en local
- [ ] Endpoints críticos responden correctamente

---

### FASE 2: Laravel 11 → 12
**Estado:** ⬜ Pendiente
**Prioridad:** Alta
**Duración estimada:** 2-4 horas
**Dependencias:** Fase 1 completada

> **Objetivo:** Actualizar a la última versión estable

#### Requisitos de Laravel 12
- PHP 8.2+ (ya cumplido)
- Cambios menores respecto a L11

#### Tareas
- [ ] Actualizar `composer.json`:
  ```json
  "laravel/framework": "^12.0"
  ```
- [ ] Revisar upgrade guide oficial
- [ ] Actualizar paquetes de terceros si es necesario
- [ ] Correr `composer update`
- [ ] Revisar deprecation warnings
- [ ] Correr tests - verificar que pasan
- [ ] Pruebas manuales

#### Criterio de Éxito
- [ ] `composer update` sin errores
- [ ] Sin deprecation warnings críticos
- [ ] Todos los tests pasan
- [ ] Listo para merge a main

---

### FASE 3: Refactoring Backend
**Estado:** ⬜ Pendiente
**Prioridad:** Media
**Duración estimada:** Gradual (semanas)
**Dependencias:** Fase 2 completada

> **Objetivo:** Mejorar arquitectura sin sobre-ingeniería

#### 3.1 ApiResponse Helper (Quick Win)
**Estimado:** 2 horas

- [ ] Crear `app/Helpers/ApiResponse.php`
- [ ] Métodos: `success()`, `error()`, `paginated()`
- [ ] Migrar 5 controllers como prueba
- [ ] Documentar uso en CLAUDE.md

#### 3.2 Dividir Fat Controllers
**Estimado:** 40 horas total (hacer gradualmente)

| Controller | Líneas | Prioridad | Estado |
|------------|--------|-----------|--------|
| `PlaTournamentController` | 1,518 | Media | ⬜ |
| `ParentChildController` | 1,391 | Alta | ⬜ |
| `PlaClubTeamPaymentController` | 1,318 | Alta | ⬜ |

**Estrategia de extracción:**
```
Controller (1500 líneas) →
├── Controller (300 líneas) - Solo HTTP handling
├── Service (500 líneas) - Lógica de negocio
├── Repository (opcional) - Queries complejas
└── Handlers (opcional) - Acciones específicas
```

#### 3.3 Centralizar Lógica Duplicada
**Estimado:** 10 horas

- [ ] `FileUrlHelper` - URLs temporales (usado en 7+ lugares)
- [ ] `AuthorizationService` unificado
- [ ] `PlayerTransformer` para respuestas consistentes

#### Criterio de Éxito
- [ ] Controllers < 500 líneas
- [ ] Lógica de negocio en Services
- [ ] Tests pasan después de cada cambio

---

### FASE 4: Refactoring Frontend
**Estado:** ⬜ Pendiente
**Prioridad:** Media
**Duración estimada:** Gradual (semanas)
**Dependencias:** Puede hacerse en paralelo con Fase 3

> **Objetivo:** Mejorar mantenibilidad sin romper UX

#### 4.1 Migrar a React Query
**Estimado:** 50 horas

- [ ] Crear hooks base: `usePayments()`, `usePlayers()`, `useCharges()`
- [ ] Migrar componentes de alta prioridad
- [ ] Eliminar estados loading/error manuales
- [ ] Implementar cache y refetch automático

#### 4.2 Dividir Componentes Gigantes
**Estimado:** 60 horas

| Componente | Líneas | Prioridad | Estado |
|------------|--------|-----------|--------|
| `PublicEnrollmentPage.jsx` | 2,663 | Media | ⬜ |
| `PaymentsTable.jsx` | 2,535 | Alta | ⬜ |
| `PaymentSettingsPage.jsx` | 1,855 | Media | ⬜ |
| `RegisterPaymentDialog.jsx` | 1,431 | Alta | ⬜ |

#### 4.3 Estandarizar State Management
**Estimado:** 20 horas

- [ ] Documentar reglas: qué va en Context vs React Query vs useState
- [ ] Crear hooks reutilizables
- [ ] Reducir `AuthContext.jsx` (1,091 líneas)

---

### FASE 5: CI/CD con Tests
**Estado:** ⬜ Pendiente
**Prioridad:** Alta
**Duración estimada:** 2-3 horas
**Dependencias:** Fase 0 completada

> **Objetivo:** Proteger el código con automatización

#### Tareas
- [ ] Crear `.github/workflows/test.yml`
- [ ] Configurar job de tests antes del deploy
- [ ] Tests obligatorios para merge a main
- [ ] Badge de estado en README

#### Workflow Propuesto
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
      - name: Install dependencies
        run: composer install
      - name: Run tests
        run: php artisan test
```

---

## Registro de Sesiones de Trabajo

### Sesión 1 - [FECHA]
**Duración:**
**Fase trabajada:**
**Completado:**
-

**Pendiente para próxima sesión:**
-

**Notas:**


---

### Sesión 2 - [FECHA]
**Duración:**
**Fase trabajada:**
**Completado:**
-

**Pendiente para próxima sesión:**
-

**Notas:**


---

## Comandos Útiles

### Tests
```bash
# Correr todos los tests
cd saas_sport && php artisan test

# Correr tests específicos
php artisan test --filter=Authorization
php artisan test --filter=Payment

# Con cobertura
php artisan test --coverage
```

### Git
```bash
# Crear rama de trabajo
git checkout -b feature/laravel-upgrade

# Ver estado
git status

# Commit
git add . && git commit -m "mensaje"

# Volver a main si algo sale mal
git checkout main
```

### Composer
```bash
# Actualizar dependencias
composer update

# Ver paquetes desactualizados
composer outdated

# Limpiar cache de composer
composer clear-cache
```

### Laravel
```bash
# Limpiar caches
php artisan config:clear && php artisan cache:clear && php artisan route:clear

# Ver rutas
php artisan route:list

# Ver migraciones pendientes
php artisan migrate:status
```

---

## Referencias

- [Laravel 11 Upgrade Guide](https://laravel.com/docs/11.x/upgrade)
- [Laravel 12 Upgrade Guide](https://laravel.com/docs/12.x/upgrade)
- [Spatie Permission Docs](https://spatie.be/docs/laravel-permission)
- [React Query Docs](https://tanstack.com/query/latest)

---

## Notas Importantes

1. **No romper producción:** Siempre trabajar en rama separada
2. **Tests primero:** No hacer cambios sin tests que los respalden
3. **Incremental:** Pequeños commits, fáciles de revertir
4. **Documentar:** Actualizar este archivo después de cada sesión
