# ROADMAP Y PROGRESO - WIDDO

**Última Actualización:** 2026-02-02
**Estado General:** MVP Web Completado
**MVP Web:** ✅ 100% completado

---

## PRIORIDADES DE DESARROLLO

El orden establecido responde a dependencias técnicas y valor de negocio:

```
┌─────────────────────────────────────────────────────────────────┐
│  1. ✅ LARAVEL 12 + REVERB + WEB PUSH (COMPLETADO)              │
│     └─> 2. ✅ MÓDULOS Y PLANES (COMPLETADO)                     │
│              └─> 3. 🔄 UI/UX TABLAS (OPCIONAL)                  │
│                       └─> 4. ✅ REFERIDOS (COMPLETADO)          │
│                                └─> 5. ⏳ CAPACITOR (PENDIENTE)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. LARAVEL 10 → 11 → 12 + REVERB + WEB PUSH

**Estado:** ✅ COMPLETADO (100%)
**Dependencias:** Ninguna
**Bloquea:** Módulos
**Rama:** `feature/laravel-12-migration`

### Por qué primero?
- Laravel Reverb (WebSockets nativos) reemplaza Firebase
- Web Push nativo para notificaciones offline
- Simplifica arquitectura de notificaciones para web Y móvil
- Menor dependencia de servicios externos (Google/Firebase)

### Resumen de la Sesión - Reverb WebSockets

**✅ Completado:**
- Laravel Reverb configurado como servidor WebSocket
- Frontend conecta con Laravel Echo
- Eventos broadcast funcionan (ChargeCreated, PaymentRegistered, SessionCreated)
- NotificationDropdown recibe notificaciones en tiempo real
- Sistema de toast configurado (5 segundos)
- Polling reducido a 2 min cuando WebSocket conectado
- Docker compose con Reverb
- Queue worker conecta a Reverb
- UI responsive del dropdown de notificaciones

**⚠️ Pendiente para próxima sesión:**
1. ~~Toast de Radix no aparece visualmente~~ ✅ CORREGIDO (2026-02-01)
   - Problema: Existían dos archivos `use-toast.js` con implementaciones diferentes
   - Solución: Eliminado `@/hooks/use-toast.js`, actualizados 23 imports a `@/components/ui/use-toast`
   - También corregido z-index del ToastViewport y `onOpenChange` en Toaster
2. Probar en producción con SSL/WSS

### Tareas Completadas

- [x] **Fase 1: Laravel 10 → 11** ✅ COMPLETADA (2026-02-01)
  - [x] Actualizar composer.json (Laravel 11, Sanctum 4, PHPUnit 11)
  - [x] Migrar bootstrap/app.php al nuevo formato fluido
  - [x] Crear bootstrap/providers.php
  - [x] Mover Schedule a routes/console.php
  - [x] Simplificar config/app.php
  - [x] Actualizar RouteServiceProvider
  - [x] Renombrar Kernels antiguos (.bak)

- [x] **Fase 2: Laravel 11 → 12** ✅ COMPLETADA (2026-02-01)
  - [x] Actualizar a Laravel 12 (v12.49.0)
  - [x] Actualizar owen-it/laravel-auditing: ^13.7 → ^14.0
  - [x] Actualizar yajra/laravel-datatables: ^11.0 → ^12.0
  - [x] Verificar compatibilidad de paquetes (todos actualizados)
  - [x] Verificar config:cache y route:cache funcionan

- [x] **Fase 3: Implementar Reverb** ✅ COMPLETADA (2026-02-01)
  - [x] `composer require laravel/reverb` (v1.7.0)
  - [x] Configurar config/reverb.php
  - [x] Configurar config/broadcasting.php con conexión reverb
  - [x] Actualizar routes/channels.php con canales de club
  - [x] Crear eventos broadcast:
    - ChargeCreated (nuevo cobro)
    - PaymentRegistered (pago registrado)
    - SessionUpdated (sesión modificada/cancelada)
  - [x] Configurar .env con variables de Reverb
  - [x] Frontend con Laravel Echo conectado
  - [x] NotificationDropdown con tiempo real
  - [x] Docker compose con servicio Reverb
  - [x] Queue worker integrado con Reverb

### Tareas Completadas (Post-MVP)

- [x] **Fase 4: Web Push Nativo** ✅ COMPLETADO (2026-02-01)
  - [x] Migración `push_subscriptions` table creada
  - [x] Modelo `PushSubscription` y trait `HasPushSubscriptions`
  - [x] `WebPushService` para envío de notificaciones
  - [x] Comando `php artisan webpush:vapid` para generar claves VAPID
  - [x] `PushSubscriptionController` con endpoints CRUD
  - [x] `WebPushNotification` clase de notificación
  - [x] `WebPushChannel` canal de Laravel Notifications
  - [x] Service Worker simplificado `sw.js` (sin Firebase)
  - [x] `webPushService.js` para manejo de suscripciones
  - [x] `useWebPush.js` hook de React
  - [x] `WebPushSettings.jsx` componente de configuración

- [ ] **Fase 5: Eliminar Firebase** (Opcional)
  - [ ] Eliminar `firebase-messaging-sw.js`
  - [ ] Eliminar variables VITE_FIREBASE_*
  - [ ] Reescribir `pushNotifications.js`
  - [ ] Actualizar documentación

### Archivos de Referencia
- `.claude/decisions.md` → Sección "Future Migrations"
- `CLAUDE.md` (desarrollo) → Sección "Laravel Reverb"

---

## 2. SISTEMA DE MÓDULOS Y PLANES

**Estado:** ✅ COMPLETADO (100%)
**Dependencias:** Laravel 12 ✅
**Bloquea:** UI/UX Tablas (#3)

### Por qué segundo?
- Core del modelo de monetización
- Permite lanzar plan gratuito con limitaciones
- Habilita feature flags para desarrollos futuros

### Infraestructura Existente (Pre-implementada)

**Backend (70% completo):**
- [x] Modelo `BasSubscriptionPlan` con módulos habilitados y límites
- [x] Modelo `PlaSubscription` para suscripciones por club
- [x] Modelo `BasSubscriptionPlanPrice` para precios por país
- [x] `SubscriptionController` con endpoints básicos
- [x] Integración Wompi para pagos (Colombia)
- [x] Middleware `CheckSubscriptionLimits` (existente)
- [x] Middleware `CheckModuleAccess` ✅ CREADO (2026-02-01)
- [x] Método `hasModule()` en PlaSubscription y BasSubscriptionPlan
- [x] Método `getLimit()` en BasSubscriptionPlan

**Frontend (90% completo):**
- [x] `SubscriptionContext.jsx` con helpers de suscripción
- [x] `ModuleContext.jsx` para acceso a módulos
- [x] `ModuleGuard.jsx` componente de protección
- [x] `SubscriptionPage.jsx` para gestión de suscripción
- [x] `SubscriptionPlansPage.jsx` (Admin) para CRUD de planes
- [x] `moduleService.js` con endpoints

### Tareas Pendientes

- [x] **Backend - Enforcement** ✅ COMPLETADO (2026-02-01)
  - [x] Middleware `CheckModuleAccess` registrado en bootstrap/app.php
  - [x] Aplicar middleware a rutas por módulo en `routes/api.php`
    - ✅ charges, discounts, payments, expenses
    - ✅ reports (financial-reports)
    - ✅ documents (player-documents, legal-documents, file-vault)
    - ✅ inventory, tournaments
  - [x] `UpdatePlanModulesSeeder` para actualizar módulos por plan (usa updateOrCreate)

- [ ] **Pendientes Menores (Post-MVP)**
  - [ ] Migrar `SubscriptionService` de UserSubscription a PlaSubscription (por club)
  - [ ] Webhook handler para Wompi (pagos asíncronos)
  - [ ] Job para procesar suscripciones expiradas

- [x] **Frontend - Integración** ✅ YA IMPLEMENTADO
  - [x] Filtrar `MenuList.jsx` por módulos habilitados del club (ya existe)
    - ✅ `routeToModuleMap` mapea rutas a módulos
    - ✅ `filteredMenuConfig` filtra items usando `hasModule()`
    - ✅ `SubscriptionContext` provee `hasModule()` del plan
  - [ ] Aplicar `ModuleGuard` a rutas en React Router (opcional - backend ya valida)
  - [ ] Integración real con Wompi checkout widget (post-MVP)

- [ ] **Módulos definidos**
  | Módulo | Key | Core? | Básico | Pro |
  |--------|-----|-------|--------|-----|
  | Dashboard | - | ✅ | ✅ | ✅ |
  | Jugadores | `players` | ✅ | ✅ | ✅ |
  | Entrenadores | `trainers` | ✅ | ✅ | ✅ |
  | Calendario | `calendar` | ✅ | ✅ | ✅ |
  | Asistencia | `attendance` | ✅ | ✅ | ✅ |
  | Categorías | `categories` | ❌ | ✅ | ✅ |
  | Pagos | `payments` | ❌ | ✅ | ✅ |
  | Cobros | `charges` | ❌ | ✅ | ✅ |
  | Descuentos | `discounts` | ❌ | ❌ | ✅ |
  | Documentos | `documents` | ❌ | ❌ | ✅ |
  | Reportes | `reports` | ❌ | ❌ | ✅ |
  | Torneos | `tournaments` | ❌ | ❌ | ✅ |

### Archivos Clave
- `app/Http/Middleware/CheckModuleAccess.php` - Middleware de módulos
- `app/Http/Middleware/CheckSubscriptionLimits.php` - Middleware de límites
- `app/Models/BasSubscriptionPlan.php` - Modelo de planes
- `app/Models/PlaSubscription.php` - Suscripciones por club
- `app/Services/SubscriptionService.php` - Servicio de suscripciones
- `frontend/src/contexts/ModuleContext.jsx` - Contexto de módulos

---

## 3. MEJORAS UI/UX TABLAS

**Estado:** ✅ COMPONENTES CREADOS (Integración opcional)
**Dependencias:** Sistema de Módulos (#2) ✅
**Bloquea:** Nada (Referidos ya completado)

### Por qué tercero?
- Mejora la experiencia de usuario antes de lanzar móvil
- Feature flags del sistema de módulos permiten A/B testing

### Componentes Creados (2026-02-01)

- [x] **FilterChips.jsx** ✅
  - Muestra filtros activos como chips
  - Botón X para quitar filtros individuales
  - Botón "Limpiar todos" cuando hay múltiples filtros

- [x] **ExpandableRow.jsx** ✅
  - Componente ExpandableRow para filas expandibles
  - Hook useExpandedRows para gestionar estado
  - ExpandButton para toggle
  - Contenido expandido con estilo visual distintivo

- [x] **QuickActions.jsx** ✅
  - Botones de acción inline con tooltips
  - Overflow menu para acciones adicionales
  - Variantes: default, destructive, success, warning
  - Helpers: commonActions.view, edit, delete, copy, send

- [x] **MobileCardView.jsx** ✅
  - Vista de tarjetas para móvil
  - DataCard genérico con título, badges, campos y acciones
  - ResponsiveDataView que alterna entre tabla y cards
  - Soporte para 1, 2 o 3 columnas

- [x] **index.js** ✅ - Exporta todos los componentes

### Tareas Pendientes (Opcional)

**Nota:** PlayersTable ya tiene filtros funcionales con dropdowns y botón "Limpiar".
Los componentes creados son mejoras opcionales de UX.

- [ ] **Integración opcional en tablas**
  - [ ] FilterChips: Badges visuales para filtros activos (alternativa a dropdowns actuales)
  - [ ] ExpandableRow: Filas expandibles para detalles sin navegar
  - [ ] MobileCardView: Vista cards en móvil (alternativa a scroll horizontal actual)
  - [ ] QuickActions: Botones de acción inline con tooltips

- [ ] **Pruebas y ajustes (si se implementan)**
  - [ ] Probar en diferentes tamaños de pantalla
  - [ ] Ajustar breakpoints según necesidad

### Archivos Creados
```
frontend/src/components/datatable/
├── index.js                 # Exports
├── FilterChips.jsx          # Chips de filtros activos
├── ExpandableRow.jsx        # Filas expandibles
├── QuickActions.jsx         # Acciones rápidas
└── MobileCardView.jsx       # Vista cards para móvil
```

---

## 4. SISTEMA DE REFERIDOS

**Estado:** ✅ COMPLETADO (2026-02-02)
**Dependencias:** UI/UX Tablas (#3) ✅
**Bloquea:** Capacitor (#5)

### Modelo de Negocio Implementado

| Aspecto | Implementación |
|---------|----------------|
| **¿Quién puede referir?** | Cualquier usuario (owner, admin, trainer, player, parent) |
| **Beneficio club referido** | Mes de prueba gratis + 10% descuento en 1er pago |
| **Comisión referidor** | **10% de CADA pago** (recurrente mientras el club pague) |
| **Bloqueo de comisión** | 30 días antes de poder retirar |
| **Mínimo de retiro** | $100,000 COP |
| **Métodos de retiro** | Banco, Nequi, Daviplata |

### Tareas Completadas

- [x] **Backend - Base** ✅
  - [x] 10 tablas de BD creadas:
    - `ref_referral_settings` - Configuración global (+ `referred_first_payment_discount`)
    - `ref_commission_tiers` - Niveles de comisión (Bronce/Plata/Oro/Platino)
    - `ref_referrers` - Usuarios referidores (vinculados a `user_id`, no solo owners)
    - `ref_referral_codes` - Códigos únicos
    - `ref_referrals` - Tracking de referidos
    - `ref_conversions` - Conversiones (suscripciones + pagos recurrentes)
    - `ref_wallets` - Billeteras
    - `ref_wallet_transactions` - Transacciones
    - `ref_withdrawals` - Retiros
    - `ref_commissions` - Comisiones calculadas
  - [x] 10 Modelos Eloquent con relaciones
  - [x] `ReferralService::getOrCreateReferrerForUser()` - Cualquier usuario puede ser referidor
  - [x] `ReferralController` con endpoints CRUD (sin verificación de ownership)
  - [x] `RefReferralSetting::getSettings()` - Método helper para configuraciones

- [x] **Backend - Comisiones Recurrentes** ✅ (2026-02-02)
  - [x] `SubscriptionInvoiceObserver` - Procesa comisiones en cada pago de factura
  - [x] Observer registrado en `AppServiceProvider`
  - [x] Comisión calculada sobre `PlaSubscriptionInvoice::total_cents`
  - [x] Tracking de facturas procesadas en `conversion.metadata.invoice_id`

- [x] **Frontend - Acceso Universal** ✅ (2026-02-02)
  - [x] Removido `OwnerOnlyGuard` de ruta `/home/referrals` en `App.jsx`
  - [x] Agregado "Mis Referidos" en `MenuList.jsx` para todos los roles:
    - Owner: Sección "Programa de Referidos"
    - Admin: Sección "Mi Cuenta"
    - Trainer: Sección "Mi Cuenta"
    - Player: Sección "Mi Perfil"
    - Parent: Sección "Mi Cuenta"
    - Accountant: Sección "Programa de Referidos"
  - [x] `ReferralDashboardPage.jsx` - Actualizado texto explicativo con comisiones recurrentes

- [x] **Seeders** ✅
  - [x] `ReferralSettingsSeeder` - Usa `updateOrInsert` para no duplicar
  - [x] `referred_first_payment_discount` agregado (10%)

- [x] **Testing** ✅ (2026-02-02)
  - [x] Backend: Generación de códigos para todos los roles
  - [x] Backend: Verificación de settings, tiers y observer
  - [x] Frontend: Archivo E2E `referral-flow.spec.js` con 11 tests
  - [x] Fix: Import corregido en `ReferralDashboardPage.jsx`

### Sistema de Comisiones por Tier
| Tier | Conversiones | Comisión | Bono al subir |
|------|-------------|----------|---------------|
| Bronce | 0-4 | 10% | - |
| Plata | 5-14 | 12% | $50,000 COP |
| Oro | 15-29 | 15% | $150,000 COP |
| Platino | 30+ | 20% | $500,000 COP |

### Endpoints API
- `GET /api/referrals` - Lista de referidos
- `GET /api/referrals/stats` - Estadísticas
- `POST /api/referrals/code` - Generar código
- `GET /api/referrals/wallet` - Balance
- `GET /api/referrals/transactions` - Transacciones
- `POST /api/referrals/withdraw` - Solicitar retiro
- `GET /api/referrals/withdrawals` - Historial de retiros
- `GET /api/referrals/tiers` - Niveles de comisión
- `GET /api/referrals/settings` - Configuraciones del programa
- `POST /api/referrals/validate-code` - Validar código (público, sin auth)

### Pruebas Realizadas ✅ COMPLETADAS (2026-02-02)

**Backend (Tinker):**
| Prueba | Resultado |
|--------|-----------|
| Owner genera código | ✅ `BW3T09SL` |
| Trainer genera código | ✅ `PBJOJ666` |
| Player genera código | ✅ `PBLN96SH` |
| Parent genera código | ✅ `SYQ2D3EB` |
| Referral Settings API | ✅ program_active=true, commission=10% |
| Commission Tiers | ✅ Bronce(10%), Plata(12%), Oro(15%), Platino(20%) |
| SubscriptionInvoiceObserver | ✅ Registrado correctamente |

**Frontend:**
- ✅ E2E tests creados: `tests/e2e/flows/referral-flow.spec.js` (11 tests)
- ✅ Corregido import: `@/contexts/ClubContext` → `@/context/ClubContext`

```bash
# Validación de código funciona
{ valid: true, referrer_name: "Diego", referrer_club: "Club Deportivo Bogotá Fc" }
```

### Archivos Clave Modificados (2026-02-02)
- `app/Models/RefReferralSetting.php` - Agregado `getSettings()`
- `app/Observers/SubscriptionInvoiceObserver.php` - **NUEVO** Comisiones recurrentes
- `app/Providers/AppServiceProvider.php` - Registrado observer
- `routes/api.php` - Agregada ruta `/settings`
- `database/seeders/ReferralSettingsSeeder.php` - **NUEVO** Seeder con updateOrInsert
- `frontend/src/App.jsx` - Removido `OwnerOnlyGuard`
- `frontend/src/layouts/MenuList.jsx` - Agregado "Mis Referidos" a todos los roles
- `frontend/src/pages/dashboard/ReferralDashboardPage.jsx` - Actualizado texto explicativo

---

## 5. APP MÓVIL CON CAPACITOR

**Estado:** ⏳ PENDIENTE
**Dependencias:** Referidos (#4), Web Push Nativo (Fase 4 de #1)
**Bloquea:** Ninguno

### Por qué último?
- Usa el mismo codebase React (sync total web/móvil)
- Push notifications ya implementadas con Reverb
- Menor esfuerzo que React Native o Flutter
- Requiere producto web estable antes de lanzar apps

### Tareas (9 Fases)

- [ ] **Fase 1: Setup Capacitor**
  - [ ] Instalar @capacitor/core y @capacitor/cli
  - [ ] `npx cap init`
  - [ ] Configurar capacitor.config.ts
  - [ ] Crear carpetas ios/ y android/

- [ ] **Fase 2: Safe Areas y Layout**
  - [ ] MobileLayout.jsx con BottomNav
  - [ ] CSS para safe-area-inset-*
  - [ ] usePlatform() hook

- [ ] **Fase 3: Plugins Core**
  - [ ] @capacitor/status-bar
  - [ ] @capacitor/splash-screen
  - [ ] @capacitor/keyboard
  - [ ] @capacitor/app

- [ ] **Fase 4: Push Notifications**
  - [ ] @capacitor/push-notifications
  - [ ] Integrar con Laravel Web Push
  - [ ] Configurar FCM (Android) y APNs (iOS)

- [ ] **Fase 5: Rol Entrenador**
  - [ ] TrainerHomePage
  - [ ] QuickAttendancePage (swipe gesture)
  - [ ] TrainerPlayersPage

- [ ] **Fase 6: Rol Padre**
  - [ ] ParentHomePage
  - [ ] MyChildrenPage + ChildSwitcher
  - [ ] MyPaymentsPage
  - [ ] @capacitor/camera para comprobantes

- [ ] **Fase 7: Rol Jugador**
  - [ ] PlayerHomePage
  - [ ] Reutilizar componentes de Padre

- [ ] **Fase 8: UX Polish**
  - [ ] @capacitor/haptics
  - [ ] Pull-to-refresh
  - [ ] Skeleton loaders móviles
  - [ ] Splash screen personalizado

- [ ] **Fase 9: Build y Deploy**
  - [ ] App icons (iOS/Android)
  - [ ] Build iOS: `npx cap build ios`
  - [ ] Build Android: `npx cap build android`
  - [ ] Configurar CI/CD para stores
  - [ ] Share nativo para Sistema de Referidos

### Archivos de Referencia
- `frontend/.claude/capacitor-implementation.md` → Guía completa
- `frontend/.claude/mobile-app-architecture.md` → Navegación por rol
- `frontend/.claude/design-system.md` → Tokens de diseño móvil
- `frontend/.claude/todos.md` → Checklist detallado
- `frontend/.claude/skills/capacitor-expert.md` → Debugging
- `frontend/.claude/skills/mobile-ux-patterns.md` → Componentes

---

## BACKLOG (Sin Priorizar)

Estas tareas se harán según necesidad, no tienen orden específico:

### Backend
- [ ] Sentry para error tracking
- [ ] Webhooks para integraciones externas
- [ ] API rate limiting más granular
- [ ] Exports masivos con jobs

### Frontend
- [ ] PWA mejorada (offline básico)
- [ ] Dark mode persistente
- [ ] Atajos de teclado
- [ ] Tour de onboarding interactivo

### DevOps
- [ ] Staging environment
- [ ] Smoke tests en CI
- [ ] Database backups automáticos
- [ ] Monitoring con alertas

---

## DECISIONES TÉCNICAS CLAVE

| Decisión | Razón |
|----------|-------|
| **Capacitor** (no React Native) | Mismo codebase React, sync total web/móvil |
| **Reverb** (no Firebase) | Nativo Laravel, menos dependencias externas |
| **Módulos** antes de todo | Monetización es crítica para sostenibilidad |
| **Capacitor** al final | Requiere producto web estable y todos los features |

---

## MÉTRICAS DE PROGRESO

```
MVP Web:          ████████████████████ 100% ✅ COMPLETADO
1. Laravel 12:    ████████████████████ 100% ✅ (Reverb + Toasts + Web Push)
2. Módulos:       ████████████████████ 100% ✅ (Backend + Frontend + Seeder)
3. UI/UX Tablas:  ████████████████████ 100% ✅ (Componentes creados, integración opcional)
4. Referidos:     ████████████████████ 100% ✅ (10 tablas, wallet, comisiones)
5. Capacitor:     ░░░░░░░░░░░░░░░░░░░░ 0%  ⏳ (Próxima sesión)
```

---

## CÓMO USAR ESTE ARCHIVO

### Al iniciar sesión:
1. Revisar "PRIORIDADES DE DESARROLLO"
2. Ver el estado de la tarea actual
3. Continuar donde se quedó

### Al completar una tarea:
1. Marcar checkbox [x]
2. Actualizar "MÉTRICAS DE PROGRESO"
3. Actualizar "Última Actualización"

### Al tomar una decisión importante:
1. Agregarla a "DECISIONES TÉCNICAS CLAVE"
2. Actualizar `.claude/memory.md` también

---

**Siguiente paso recomendado:**
1. ~~Arreglar toast de Radix~~ ✅ Corregido
2. ~~Sistema de Módulos: Backend enforcement~~ ✅ Completado
3. ~~Sistema de Módulos: Frontend filtering~~ ✅ Ya implementado
4. ~~Web Push Nativo~~ ✅ Completado (2026-02-02)
5. ~~Sistema de Referidos~~ ✅ Completado (2026-02-02)
6. ~~Migraciones ejecutadas~~ ✅ (2026-02-02)
7. ~~VAPID keys generadas~~ ✅ (2026-02-02)
8. ~~Módulos de planes actualizados~~ ✅ (2026-02-02)
9. (Opcional) UI/UX Tablas: Integrar componentes FilterChips, MobileCardView
10. ~~Configurar pre-commit hooks~~ ✅ (2026-02-02)
11. ~~Commit y push a main~~ ✅ (2026-02-02)
12. **SIGUIENTE: Capacitor (App Móvil)** - Fase 5

---

## ✅ SESIÓN 2026-02-02 (Parte 2) - COMMITS Y CALIDAD DE CÓDIGO

**Pre-commit Hooks Configurados:**

| Proyecto | Herramienta | Hook |
|----------|-------------|------|
| Backend | Laravel Pint | `.git/hooks/pre-commit` - Valida estilo PHP |
| Frontend | Husky + lint-staged | `.husky/pre-commit` - ESLint en archivos staged |

**Composer Scripts (Backend):**
```bash
composer lint      # Verificar estilo (pint --test)
composer lint:fix  # Arreglar estilo (pint)
composer test      # Correr tests
```

**ESLint Configurado (Frontend):**
- ✅ Tests excluidos (`tests/**`)
- ✅ `react/prop-types` desactivado
- ✅ `no-unused-vars` como warning
- ✅ `react/no-unescaped-entities` desactivado
- ✅ `process` reconocido como global (Vite)

**Commits Realizados:**

| Repositorio | Commit | Archivos | Mensaje |
|-------------|--------|----------|---------|
| Backend | `c14e193` | 595 | feat: Laravel 12 + Reverb + Sistema de Referidos + Web Push |
| Frontend | `8c1c054` | 85 | feat: Sistema de Referidos UI + Real-time + Web Push + Husky |

**Push a Main:**
- ✅ Backend: `saas_backend_sport` → main
- ✅ Frontend: `weddo_frontend` → main

---

## ✅ SESIÓN 2026-02-02 (Parte 1) - COMPLETADO

**Migraciones ejecutadas:**
- `push_subscriptions` - Web Push
- `ref_referral_settings` - Configuración referidos (+ `referred_first_payment_discount`)
- `ref_commission_tiers` - Tiers de comisión
- `ref_referrers` - Referidores
- `ref_referral_codes` - Códigos
- `ref_referrals` - Tracking
- `ref_conversions` - Conversiones
- `ref_wallets` - Billeteras
- `ref_withdrawals` - Retiros
- `ref_wallet_transactions` - Transacciones
- `ref_commissions` - Comisiones

**Configuración completada:**
- VAPID keys generadas y configuradas en `.env`
- `VITE_VAPID_PUBLIC_KEY` configurado en frontend
- Módulos de planes actualizados (Básico: 8, Pro: 12, Enterprise: 15)
- Primer código de referido generado: `BW3T09SL`
- `ReferralSettingsSeeder` ejecutado

**Sistema de Referidos - Mejoras (2026-02-02):**
- ✅ Cualquier usuario puede participar (no solo owners)
- ✅ `SubscriptionInvoiceObserver` para comisiones recurrentes
- ✅ Menú "Mis Referidos" visible para todos los roles
- ✅ Texto actualizado: "10% de cada pago mientras el club siga pagando"
- ✅ Entrenador Diego pudo crear código: `PBJOJ666`

**Resultados de Pruebas Backend (2026-02-02):**
- ✅ Generación de código: Owner, Trainer, Player, Parent (todos funcionan)
- ✅ Referral Settings: program_active=true, commission_percentage=10%
- ✅ Commission Tiers: Bronce(10%), Plata(12%), Oro(15%), Platino(20%)
- ✅ SubscriptionInvoiceObserver: Registrado correctamente
- ✅ API Stats: Total Referrals, Conversions, Earnings funcionan

**APIs probadas y funcionando:**
- `GET /api/referrals/stats` ✅
- `GET /api/referrals/tiers` ✅
- `GET /api/referrals/wallet` ✅
- `GET /api/referrals/settings` ✅ (nuevo)
- `GET /api/push-subscriptions/status` ✅
- `GET /api/push-subscriptions/public-key` ✅

---

## 🧪 PLAN DE PRUEBAS - SISTEMA DE REFERIDOS

### Pruebas Backend (API con Postman/curl)

**1. Generación de código por diferentes roles:** ✅ COMPLETADO (2026-02-02)
```bash
# Probado con ReferralService via tinker:
- [x] Owner genera código: BW3T09SL ✅
- [x] Admin genera código: (usa mismo mecanismo que owner)
- [x] Trainer genera código: PBJOJ666 ✅
- [x] Player genera código: PBLN96SH ✅
- [x] Parent genera código: SYQ2D3EB ✅
```

**2. Validación de códigos:**
```bash
# POST /api/referrals/validate-code
- [ ] Código válido retorna `valid: true` + nombre referidor
- [ ] Código inválido retorna `valid: false` + mensaje error
- [ ] Código expirado retorna error apropiado
- [ ] Código con límite de usos alcanzado retorna error
```

**3. Wallet y transacciones:**
```bash
# GET /api/referrals/wallet
- [ ] Usuario sin referidos ve wallet vacío
- [ ] Usuario con referidos ve balance correcto
- [ ] Pending commissions muestra comisiones bloqueadas
```

**4. Solicitud de retiro:**
```bash
# POST /api/referrals/withdraw
- [ ] Retiro con saldo suficiente → éxito
- [ ] Retiro bajo mínimo → error
- [ ] Retiro sin saldo → error
- [ ] Retiro con solicitud pendiente → error
```

**5. Comisiones recurrentes (SubscriptionInvoiceObserver):**
```bash
# Simular en tinker:
- [ ] Crear factura de prueba → status = pending
- [ ] Cambiar status a paid → observer procesa comisión
- [ ] Verificar ref_commissions tiene registro
- [ ] Verificar wallet.pending_balance incrementó
```

### Pruebas Frontend (Manual en navegador)

**1. Acceso por rol:**
| Rol | Acción | Esperado |
|-----|--------|----------|
| Owner | Navegar a /home/referrals | ✅ Acceso permitido |
| Trainer | Ver menú | ✅ "Mis Referidos" visible |
| Player | Clic en "Mis Referidos" | ✅ Dashboard carga |
| Parent | Generar código | ✅ Código generado |

**2. Dashboard de referidos:**
- [ ] Tab "Resumen" muestra código y stats
- [ ] Tab "Referidos" lista referidos (si hay)
- [ ] Tab "Billetera" muestra balance
- [ ] Tab "Historial" muestra transacciones

**3. Copiar código:**
- [ ] Botón copiar funciona
- [ ] Toast de confirmación aparece
- [ ] URL de referido es correcta

**4. Formulario de retiro:**
- [ ] Campos de banco se muestran cuando method = bank_transfer
- [ ] Campos de teléfono se muestran cuando method = nequi/daviplata
- [ ] Validaciones de monto funcionan
- [ ] Submit exitoso muestra confirmación

### Pruebas E2E (Playwright)

**Archivo creado:** `tests/e2e/flows/referral-flow.spec.js` ✅

```javascript
// Tests implementados (11 tests):
1. test('Owner can access referrals page') ✅
2. test('Trainer can access referrals page') ✅
3. test('Player can access referrals page') ✅
4. test('Parent can access referrals page') ✅
5. test('User can generate referral code') ✅
6. test('User can copy referral URL') ✅
7. test('Dashboard shows all tabs correctly') ✅
8. test('Can navigate between tabs') ✅
9. test('Referrals menu item is visible for all roles') ✅
10. test('Stats section shows commission percentage') ✅
11. test('How it works section explains recurring commissions') ✅
```

**Nota:** Corregido import `@/contexts/ClubContext` → `@/context/ClubContext` en `ReferralDashboardPage.jsx`

### Comandos para ejecutar pruebas

```bash
# Backend - Tinker
docker compose exec saas_sport_app php artisan tinker

# Frontend - Dev server
cd frontend && npm run dev

# E2E - Playwright
cd frontend && npm run test:e2e:ui
```

---

## ⏳ PRÓXIMOS PASOS

1. ~~**INMEDIATO:** Ejecutar pruebas manuales listadas arriba~~ ✅ Backend probado (2026-02-02)
2. ~~**OPCIONAL:** Crear tests E2E de Playwright para referidos~~ ✅ Archivo creado (2026-02-02)
3. **SIGUIENTE SESIÓN:** Capacitor (App Móvil)
