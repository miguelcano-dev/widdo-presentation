<!-- ARCHIVADO 13-ago-2026 — memoria congelada en feb-2026: da "App Móvil Capacitor ← SIGUIENTE" y apunta a `.claude/PROGRESS.md` (ya archivado) y a los docs de Capacitor de `frontend/.claude/` (también archivados); el móvil real es Flutter — sustituido por `desarrollo/CLAUDE.md`, `.claude/context.md` y las specs de `mobile_flutter/specs/` -->

# Memoria del Proyecto Widdo

Este archivo persiste contexto entre sesiones de Claude Code. Claude debe actualizarlo cuando tome decisiones importantes, observe preferencias del usuario, o encuentre problemas recurrentes.

---

## Decisiones Recientes

<!-- Claude debe actualizar esta seccion cuando tome decisiones importantes -->

| Fecha | Decision | Razon |
|-------|----------|-------|
| 2026-02-02 | **Pre-commit hooks configurados** | Pint (backend) + Husky/ESLint (frontend) para calidad |
| 2026-02-02 | **Fases 1-4 completadas y pusheadas** | Laravel 12, Módulos, Tablas, Referidos → main |
| 2026-02-01 | **Laravel 12 + Reverb instalados** | WebSockets nativos reemplazan Soketi/Firebase |
| 2026-02-01 | **Roadmap definido en PROGRESS.md** | Laravel 12 primero para notificaciones, luego módulos, capacitor, tablas, referidos |
| 2026-02-01 | **Capacitor elegido para app móvil** | Mantener sync web/móvil, mismo codebase React |
| 2026-02-01 | Documentacion multi-agente creada | Optimizar contexto entre sesiones |
| 2026-01-31 | Refresh tokens implementados (Gmail-style) | Sesiones de 30 dias sin re-login |
| 2026-01-25 | ProtectedModel trait en todos los modelos con club_id | Prevenir fugas de datos cross-tenant |
| 2026-01-25 | Indices de performance en 16 columnas | Reducir tiempos de consulta |
| 2026-01-24 | react-select para multi-select | Evitar loop infinito de Radix UI Checkbox + ScrollArea |

---

## Preferencias del Usuario

<!-- Preferencias observadas durante las sesiones -->

- **Idioma**: Espanol (documentacion y comentarios)
- **Estilo de codigo PHP**: PSR-12, type hints, return types
- **Estilo de codigo JS/React**: ESLint airbnb, hooks, functional components
- **Commits**: En espanol, descriptivos, sin emojis
- **Tests**: PHPUnit para backend, Playwright para E2E
- **Respuestas de Claude**: Directas, sin explicaciones excesivas
- **Formato de fechas**: dd/MM/yyyy (formato colombiano)

---

## Contexto Activo

<!-- Que se esta trabajando actualmente -->

### Sprint Actual
**Ver `.claude/PROGRESS.md` para roadmap completo**

Estado (2026-02-02):
1. ~~Laravel 10 → 12 + Reverb~~ ✅ COMPLETADO
2. ~~Sistema de Módulos y Planes~~ ✅ COMPLETADO
3. ~~Mejoras UI/UX Tablas~~ ✅ COMPLETADO (componentes creados)
4. ~~Sistema de Referidos~~ ✅ COMPLETADO
5. **App Móvil Capacitor** ← SIGUIENTE

### Ultimo Modulo Modificado
- **Backend**: Sistema de Referidos + Pre-commit hooks (Pint)
- **Frontend**: ReferralDashboardPage + Husky/ESLint configurado
- **Commits**: `c14e193` (backend), `8c1c054` (frontend)

### Ramas Activas
- `main`: Produccion
- `develop`: Desarrollo (si existe)

---

## Problemas Conocidos

<!-- Issues recurrentes para no repetir diagnosticos -->

### Timezone JavaScript (CRITICO)
- **Problema**: `new Date('2024-01-13')` interpreta UTC, pierde un dia en Colombia (UTC-5)
- **Solucion**: Usar `dateUtils.js` o agregar `'T00:00:00'` al crear Date desde string
- **Archivos afectados**: TrainersFormDialog, SessionForm, EditOccurrenceModal, ChargesSheetContent, PlayerPersonalInfoTab

### Radix UI Checkbox + ScrollArea
- **Problema**: Loop infinito cuando se combinan
- **Solucion**: Usar `react-select` para multi-select en lugar de Radix Checkbox dentro de ScrollArea

### Multi-tenancy
- **Problema**: Olvidar filtrar por club_id en queries manuales
- **Solucion**: Siempre usar modelos con `ProtectedModel` trait que aplica `ClubScope` automaticamente
- **Verificacion**: En tests, siempre probar que Club A no puede ver datos de Club B

### Migraciones de Base de Datos
- **Problema**: Columnas existentes al correr migraciones
- **Solucion**: Usar `Schema::hasColumn()` antes de agregar columnas

---

## Snippets Frecuentes

<!-- Codigo que el usuario pide repetidamente -->

### Test de Autorizacion (PHPUnit)
```php
/** @test */
public function rol_puede_acceder_a_endpoint()
{
    $club = PlaClubTeam::factory()->create();
    $user = User::factory()->create();
    $user->assignRole('rol');
    $user->clubs()->attach($club->id, ['role' => 'rol', 'status' => 'ACT']);

    Sanctum::actingAs($user);

    $response = $this->getJson("/api/club-teams/{$club->id}/endpoint");

    $response->assertStatus(200);
}
```

### Fecha Segura en JavaScript
```javascript
// MAL - puede perder un dia
new Date('2024-01-13')

// BIEN - mantiene la fecha correcta
new Date('2024-01-13' + 'T00:00:00')

// MEJOR - usar dateUtils.js
import { parseDateString } from '@/helpers/dateUtils';
parseDateString('2024-01-13');
```

### Query con React Query
```javascript
const { data, isLoading, error } = useQuery({
    queryKey: ['recurso', clubId],
    queryFn: () => api.get(`/club-teams/${clubId}/recurso`),
    enabled: !!clubId
});
```

---

## Archivos Criticos

<!-- Archivos que NO deben modificarse sin cuidado -->

| Archivo | Razon |
|---------|-------|
| `app/Models/Traits/ProtectedModel.php` | Core de seguridad multi-tenant |
| `app/Models/Scopes/ClubScope.php` | Filtrado automatico por club |
| `config/auth_security.php` | Configuracion de refresh tokens |
| `src/context/AuthContext.jsx` | Estado de autenticacion global |
| `src/services/axiosInstance.js` | Interceptores HTTP y refresh silencioso |

### Archivos Móvil (Capacitor)

| Archivo | Proposito |
|---------|-----------|
| `frontend/.claude/capacitor-implementation.md` | Guía completa, config, hooks, fases |
| `frontend/.claude/mobile-app-architecture.md` | Navegación por rol, componentes |
| `frontend/.claude/design-system.md` | Tokens diseño, safe areas, breakpoints |
| `frontend/.claude/todos.md` | Checklist por fase (9 fases) |
| `frontend/.claude/skills/capacitor-expert.md` | Debugging, builds, problemas comunes |
| `frontend/.claude/skills/mobile-ux-patterns.md` | Componentes móviles, gestos |

---

## Notas de Produccion

- **Servidor**: 167.71.88.31 (Ubuntu 24.04, 2GB RAM)
- **Despliegue**: Push a main activa GitHub Actions
- **Logs**: `/var/log/laravel/widdo.log`
- **Colas**: Supervisor con 3 workers
- **Tareas programadas**: Cron cada minuto ejecuta `schedule:run`

---

## Historial de Sesiones

<!-- Resumen de sesiones recientes para contexto rapido -->

### 2026-02-02 (Sesión 5)
- **Fases 1-4 completadas y pusheadas a main**
- Pre-commit hooks configurados:
  - Backend: `.git/hooks/pre-commit` con Pint
  - Frontend: Husky + lint-staged con ESLint
- Commits realizados:
  - Backend `c14e193`: 595 archivos (Laravel 12, Reverb, Referidos, Web Push)
  - Frontend `8c1c054`: 85 archivos (Referidos UI, Real-time, Husky)
- ESLint optimizado:
  - Tests excluidos, prop-types off, no-unused-vars como warning
  - Reducido de 4,423 a 127 errores (manejables)
- Composer scripts agregados: `lint`, `lint:fix`, `test`
- **Siguiente paso:** Fase 5 - Capacitor (App Móvil)

### 2026-02-01 (Sesión 4)
- **Migración Laravel 11 → 12 + Reverb COMPLETADA**
- Rama: `feature/laravel-12-migration`
- Actualizaciones de paquetes:
  - `laravel/framework`: v11.48.0 → **v12.49.0**
  - `owen-it/laravel-auditing`: ^13.7 → ^14.0
  - `yajra/laravel-datatables`: ^11.0 → ^12.0
  - `livewire/livewire`: v3.7.6 → v4.1.0
  - `laravel/reverb`: v1.7.0 (nuevo)
- Archivos creados:
  - `config/reverb.php`
  - `app/Events/ChargeCreated.php`
  - `app/Events/PaymentRegistered.php`
  - `app/Events/SessionUpdated.php`
- Archivos modificados:
  - `config/broadcasting.php` (conexión reverb)
  - `routes/channels.php` (canales de club)
  - `.env` y `.env.example` (variables Reverb)
- **Siguiente paso:** Fase 4 - Web Push Nativo

### 2026-02-01 (Sesión 3)
- **Migración Laravel 10 → 11 completada**
- Rama: `feature/laravel-12-migration`
- Cambios principales:
  - composer.json actualizado (Laravel 11.48.0, Sanctum 4.3.0)
  - bootstrap/app.php nuevo formato fluido
  - bootstrap/providers.php creado
  - routes/console.php con Schedule
  - Kernels renombrados a .bak

### 2026-02-01 (Sesión 2)
- **Decisión: Capacitor para app móvil** (no React Native ni Flutter)
- Razón: Mantener sincronización total web/móvil, mismo codebase React
- Documentos creados:
  - `frontend/.claude/capacitor-implementation.md` - Guía completa implementación
  - `frontend/.claude/skills/capacitor-expert.md` - Skill debugging/builds
  - `frontend/.claude/skills/mobile-ux-patterns.md` - Skill componentes móviles
- Tracking actualizado en `todos.md` con 9 fases y checkboxes
- **Siguiente paso:** Fase 1 - Instalar Capacitor (después de Laravel 12)

### 2026-02-01 (Sesión 1)
- Creacion de sistema de documentacion multi-agente
- Archivos: memory.md, context.md, decisions.md, instructions.md
- Design system y arquitectura móvil documentados

### 2026-01-31
- Implementacion de refresh tokens (Gmail-style)
- Duracion: access token 60min, refresh token 30 dias
- Cookie httpOnly para refresh token

### 2026-01-25
- Auditoria de seguridad: ProtectedModel en todos los modelos
- Indices de performance agregados
- Tests de autorizacion por rol
