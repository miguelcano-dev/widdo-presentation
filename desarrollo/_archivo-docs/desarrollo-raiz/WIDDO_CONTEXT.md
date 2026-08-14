# WIDDO - CONTEXTO DEL PROYECTO

> Este archivo contiene TODO el contexto necesario para desarrollar Widdo.
> Actualizar cada vez que se tome una decision importante.

---

## INFORMACION DEL PROYECTO

**Nombre:** Widdo - Sistema de Gestion de Clubes Deportivos
**Tipo:** SaaS Multi-tenant
**Mercado:** Colombia (inicial)
**Moneda:** COP (Pesos Colombianos)

---

## EQUIPO

- **CTO/Lead Developer:** Claude (AI)
- **Senior Fullstack Developer:** Miguel Cano
- **Metodologia:** Pair programming con Claude Code + Skills/MCPs

---

## TIMELINE

- **Deadline MVP:** Esta semana (antes del 28 de Diciembre 2025)
- **Beta Users:** 10 clubes iniciales
- **Prioridad:** Flujo funcional > Features extras

---

## MODELO DE NEGOCIO

### Planes Definidos:

| Plan | Precio/Mes | Target | Limites |
|------|------------|--------|---------|
| **Free** | $0 COP | Prueba | Limitado (definir) |
| **Basico** | $85,000 COP | Clubes pequenos | Estandar |
| **Premium** | $150,000 COP | Clubes grandes | Sin limites |

### Features por Plan (Por Definir):
- [ ] Definir limites del plan Free
- [ ] Definir diferencias Basico vs Premium
- [ ] Definir trial period

---

## STACK TECNOLOGICO (NO CAMBIAR)

### Backend
```
Framework:      Laravel 10.10 + PHP 8.2
Base de Datos:  MySQL 8.0
Autenticacion:  Laravel Sanctum
Autorizacion:   Spatie Permission + UserClubRole
Email:          Resend API
Colas:          Laravel Queue
Cache:          File (Redis post-MVP)
```

### Frontend
```
Framework:      React 18.2 + Vite 5.4
Estilos:        Tailwind CSS 3.4
UI Components:  Radix UI
Routing:        React Router v6
Forms:          React Hook Form
State:          Context API + React Query
```

### DevOps
```
Contenedores:   Docker + Docker Compose
Backend Port:   8010
MySQL Port:     3307
Frontend Port:  5173
```

---

## DECISION: NO REESCRIBIR

**Fecha:** 22 Diciembre 2025
**Razon:**
- 85% del codigo funcional existe
- Problemas son de flujo, no de arquitectura
- Reescribir = 3-6 meses perdidos
- Laravel + React es apropiado para SaaS B2B

---

## PROBLEMAS CRITICOS IDENTIFICADOS

### 1. Flujo de Usuario Roto
- Usuario nuevo se registra
- Va a onboarding SIN contextos (UserClubRole)
- OnboardingWizard falla porque requiere contextos
- Usuario queda perdido

### 2. Deuda Tecnica de Seguridad
- Tokens sin expiracion
- FormRequest authorize() = true siempre
- 100 console.logs en produccion
- Rate limiting incompleto

### 3. UX Deficiente
- Sin Setup Checklist
- Sin estados vacios guiados
- Sin feedback de progreso
- Loading states inconsistentes

---

## PRIORIDADES MVP (Esta Semana)

### P0 - CRITICO (Hacer Primero)
1. [x] Fix flujo: registro -> crear club -> dashboard
2. [x] Crear UserClubRole automaticamente al crear club
3. [x] Setup Checklist en dashboard
4. [x] Empty states con CTAs claros

### P1 - IMPORTANTE (Hacer Segundo)
5. [x] Eliminar console.logs (98 -> 33, 66% reduccion)
6. [x] Token expiration (60 min con expires_in)
7. [ ] Loading states unificados
8. [ ] Mobile responsive basico

### P2 - PUEDE ESPERAR (Post-MVP)
- Reportes PDF/Excel
- Modulo contador
- Pasarela de pagos online
- Notificaciones real-time
- App movil

---

## FLUJO DE USUARIO CORRECTO

```
1. Landing (/)
   └── CTA "Empieza gratis"
            ↓
2. Registro (/register)
   └── 3 pasos: Email -> Datos -> Ubicacion
            ↓
3. Crear Club (/home/create-club-team) <- OBLIGATORIO
   └── Nombre, deporte, ciudad (minimo)
            ↓
4. Dashboard (/home/dashboard)
   └── Setup Checklist visible:
       ┌─────────────────────────────┐
       │ ✅ Club creado              │
       │ ⬚ Crear primera categoria  │ <- Click va ahi
       │ ⬚ Configurar cobro mensual │
       │ ⬚ Agregar entrenador       │
       │ ⬚ Registrar jugadores      │
       └─────────────────────────────┘
            ↓
5. Usuario completa pasos a su ritmo
   └── Checklist se actualiza en tiempo real
```

---

## ROLES DEL SISTEMA

| Rol | Descripcion | Flujo de Entrada |
|-----|-------------|------------------|
| **owner** | Propietario del club | Auto-registro |
| **trainer** | Entrenador | Invitacion por email |
| **player** | Jugador adulto | Invitacion o registro por owner |
| **parent** | Padre/acudiente | Invitacion cuando hijo es menor |
| **accountant** | Contador | Invitacion por owner |

---

## PERMISOS POR ROL

```
Owner:      TODO en su club
Trainer:    Sesiones, asistencia, jugadores (ver/editar)
Player:     Su perfil, calendario, sus pagos
Parent:     Perfil del hijo, pagos del hijo
Accountant: Pagos, cobros, reportes financieros
```

---

## ARCHIVOS CLAVE DEL PROYECTO

### Backend
```
saas_sport/
├── app/Http/Controllers/AuthController.php    # Login/registro
├── app/Http/Controllers/PlaClubTeamController.php  # CRUD clubs
├── app/Models/UserClubRole.php                # Sistema multi-rol
├── app/Models/User.php                        # Usuario
├── routes/api.php                             # Rutas API
```

### Frontend
```
frontend/src/
├── App.jsx                                    # Rutas principales
├── pages/auth/RegisterPage.jsx                # Registro
├── pages/dashboard/DashboardPage.jsx          # Dashboard
├── pages/dashboard/ClubTeam/ClubTeamCreateEditPage.jsx  # Crear club
├── components/onboarding/OnboardingWizard.jsx # Onboarding (ROTO)
├── components/auth/PrivateRoute.jsx           # Proteccion rutas
├── context/AuthContext.jsx                    # Estado auth
├── context/UserContextProvider.jsx            # Contextos multi-rol
```

---

## ENDPOINTS API PRINCIPALES

```
POST /api/register          # Crear cuenta
POST /api/login             # Iniciar sesion
GET  /api/user              # Usuario actual
GET  /api/contexts          # Contextos del usuario
POST /api/contexts/switch   # Cambiar contexto activo

GET  /api/pla_club_teams           # Listar clubs
POST /api/pla_club_teams           # Crear club
GET  /api/pla_club_teams/{id}      # Ver club

GET  /api/pla_club_teams/{club}/categories  # Categorias
GET  /api/pla_club_teams/{club}/players     # Jugadores
GET  /api/pla_club_teams/{club}/trainers    # Entrenadores
GET  /api/pla_club_teams/{club}/charges     # Cobros
```

---

## DECISIONES TOMADAS

| Fecha | Decision | Razon |
|-------|----------|-------|
| 22/12/2025 | No migrar a Next.js | Problemas son de flujo, no framework |
| 22/12/2025 | Eliminar onboarding wizard actual | Esta roto, reemplazar con checklist |
| 22/12/2025 | Reportes pueden esperar | No critico para MVP |
| 22/12/2025 | Pasarela de pagos post-MVP | Pagos manuales por ahora |

---

## METODOLOGIA DE DESARROLLO CON SUBAGENTES

### Flujo de Implementacion (4 Fases)

```
┌─────────────────────────────────────────────────────────────────────┐
│  FASE 1: PLANNING AGENT                                              │
│  ─────────────────────                                               │
│  • Analiza requerimiento                                             │
│  • Explora codebase existente                                        │
│  • Genera plan en archivo .md                                        │
│  • Lista archivos a modificar/crear                                  │
│  • Define criterios de aceptacion                                    │
│  Output: /plans/PLAN-{feature}.md                                    │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  FASE 2: IMPLEMENTATION AGENTS (Paralelos)                           │
│  ─────────────────────────────────────────                           │
│  • Backend Agent: Controllers, Models, Migrations                    │
│  • Frontend Agent: Components, Pages, Services                       │
│  • Pueden ejecutarse en paralelo si son independientes               │
│  • Cada uno sigue su seccion del plan                                │
│  Output: Codigo implementado                                         │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  FASE 3: EVALUATION AGENT                                            │
│  ────────────────────────                                            │
│  • Compara codigo vs plan original                                   │
│  • Verifica criterios de aceptacion                                  │
│  • Busca TODOs pendientes                                            │
│  • Verifica tests existentes                                         │
│  • Revisa N+1 queries                                                │
│  • Da score 1-100                                                    │
│  Output: Score + lista de issues                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│  FASE 4: ITERATION (si score < 100)                                  │
│  ─────────────────────────────────                                   │
│  • Main agent recibe feedback                                        │
│  • Corrige issues identificados                                      │
│  • Re-evalua hasta score = 100                                       │
│  Output: Codigo listo para merge                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Estructura de Archivos de Plan

```
desarrollo/
├── plans/                          # Directorio de planes
│   ├── PLAN-fix-n1-queries.md     # Ejemplo de plan
│   ├── PLAN-token-expiration.md
│   └── PLAN-mobile-responsive.md
├── WIDDO_CONTEXT.md                # Este archivo (contexto global)
└── evaluation/                     # Reportes de evaluacion
    └── EVAL-{fecha}-{feature}.md
```

### Formato de Plan (.md)

```markdown
# PLAN: {Nombre del Feature}

## Contexto
- Por que se necesita
- Estado actual del codigo

## Criterios de Aceptacion
- [ ] Criterio 1
- [ ] Criterio 2

## Archivos a Modificar
### Backend
- path/to/file.php - Descripcion del cambio

### Frontend
- path/to/file.jsx - Descripcion del cambio

## Implementacion Detallada
### Paso 1: ...
### Paso 2: ...

## Tests Requeridos
- Test 1
- Test 2

## Rollback Plan
- Como revertir si algo falla
```

### Comandos para Subagentes

```bash
# Usar Task tool con subagent_type apropiado:
- subagent_type="Plan"           # Para planificacion
- subagent_type="Explore"        # Para exploracion rapida
- subagent_type="general-purpose" # Para implementacion compleja
```

---

## PROBLEMAS TECNICOS IDENTIFICADOS

### N+1 Queries - RESUELTO (22 Dic 2025)

| Modulo | Archivo | Estado | Score |
|--------|---------|--------|-------|
| Players | `PlaClubTeamPlayerController.php` | RESUELTO | 98/100 |
| Sessions | `PlaClubTeamSessionController.php` | RESUELTO | 100/100 |
| Categories | `PlaClubTeamCategoryController.php` | RESUELTO | 100/100 |

**Ver:** `evaluation/EVAL-2025-12-22-fix-n1-queries.md` para detalles completos.

### Soluciones Propuestas:
```php
// ANTES (N+1):
$players = PlaClubTeamPlayer::all();
foreach ($players as $player) {
    $player->category; // Query por cada player
}

// DESPUES (Eager Loading):
$players = PlaClubTeamPlayer::with(['category', 'user', 'eps'])->get();
```

### Validaciones Faltantes

| Endpoint | Problema | Estado |
|----------|----------|--------|
| POST /register | Email no valida unicidad correctamente | Pendiente |
| POST /sessions | day_of_week frontend envia 0-6, backend valida 1-7 | RESUELTO |
| POST /players | Falta validacion de edad vs categoria | Pendiente |

---

## SISTEMA DE INVITACIONES

### Flujo Actual (InvitationService)

```
1. Owner invita (email, tipo, categorias)
           ↓
2. Se crea registro en tabla `invitations`
   - token: 64 caracteres aleatorios
   - expires_at: 7 dias
   - status: 'pending'
   - NO se crea cuenta de usuario
           ↓
3. Se envia email con link de invitacion
           ↓
4. Invitado hace click en link
           ↓
5. Frontend muestra formulario de registro/aceptacion
           ↓
6. Al aceptar:
   - Se crea cuenta de usuario (si no existe)
   - Se asigna rol segun tipo de invitacion
   - Se vincula con club y categorias
   - invitation.status = 'accepted'
```

### Tipos de Invitacion

| Tipo | Rol Asignado | Accion Adicional |
|------|--------------|------------------|
| `trainer` | Entrenador | Vincula a categorias |
| `player_adult` | Jugador | Vincula user_id a player |
| `player_minor` | Padre/Acudiente | Crea relacion padre-hijo |

### Tabla `invitations`
```sql
id, token, type, club_id, invited_by, email,
category_ids (JSON), player_id, message,
status (pending/accepted/rejected/expired),
expires_at, accepted_at, created_at, updated_at
```

---

## NOTAS DE DESARROLLO

### Para Claude:
- Siempre leer este archivo antes de trabajar
- Actualizar cuando se tome una decision
- No sobre-ingenierizar
- Priorizar flujo funcional sobre features
- Usar metodologia de subagentes para features complejos
- Documentar problemas tecnicos encontrados aqui

### Para Miguel:
- Revisar cambios antes de merge
- Probar flujo completo despues de cada fix
- Reportar bugs encontrados

---

## LOG DE CAMBIOS

### 22 Diciembre 2025
- Creado PRD.md con analisis completo
- Creado WIDDO_CONTEXT.md (este archivo)
- Identificado flujo roto de onboarding
- Definido plan de 4 dias para MVP
- **FIX P0.1:** RegisterPage.jsx ahora redirige a /home/create-club-team (no a /onboarding)
- **FIX P0.2:** PlaClubTeamController.store() ya crea UserClubRole automaticamente (confirmado)
- **FIX P0.3:** Creado SetupChecklist.jsx en ClubOwnerDashboard
- **FIX P0.4:** Empty states agregados en CategoriesTable y TrainersTable
- Eliminados console.logs de RegisterPage.jsx
- Backend: Agregado total_charges al endpoint /dashboard/club-owner
- **ANALISIS:** Revision completa de todos los modulos (registro, clubs, categorias, entrenadores, jugadores, sesiones)
- **DOCUMENTADO:** Problemas N+1 queries identificados (severidad critica en players)
- **DOCUMENTADO:** Flujo de invitaciones (InvitationService)
- **METODOLOGIA:** Agregada metodologia de desarrollo con subagentes (4 fases)
- **ESTRUCTURA:** Creados directorios /plans y /evaluation
- **PLAN:** Creado PLAN-fix-n1-queries.md como ejemplo
- **IMPLEMENTADO:** Fix N+1 queries usando metodologia de subagentes
- **EVALUACION:** Score 99/100 - Ver evaluation/EVAL-2025-12-22-fix-n1-queries.md
- **IMPLEMENTADO:** Fix day_of_week (frontend 0-6 -> backend 1-7)
- **IMPLEMENTADO:** Token expiration (60 min + expires_in en response)
- **IMPLEMENTADO:** Reduccion console.logs (98 -> 33)
- **EVALUACION:** Score 88/100 - Ver evaluation/EVAL-2025-12-22-all-fixes.md
- **COMPLETADO:** Console.logs reducidos a 14 (86% reduccion total)
- **COMPLETADO:** Verificacion expires_in en AuthContext (ya implementado correctamente)
- **COMPLETADO:** Loading states unificados - Sistema completo con:
  - LoadingSpinner.jsx (4 variantes: inline, centered, fullscreen, overlay)
  - Skeleton loaders (DataTableSkeleton, CardSkeleton, FormSkeleton)
  - LoadingContext + useLoading hook
  - Documentacion completa (README.md + INTEGRATION.md)
- **COMPLETADO:** Mobile responsive basico - 9 componentes mejorados:
  - ClubOwnerDashboard.jsx, SetupChecklist.jsx
  - LoginPage.jsx, RegisterPage.jsx
  - Sidebar.jsx, QuickActions.jsx, MetricCard.jsx
  - DataTableContent.jsx, DataTablePagination.jsx
- **COMPLETADO:** Fix validacion email unico en registro:
  - Backend: RegisterUserRequest.php con unique:users,email
  - Frontend: RegisterPage.jsx maneja HTTP 422 correctamente
  - Step1.jsx muestra errores visuales mejorados
- **FIX:** Typo CSS corregido (heigth -> height) en index.css
- **FIX:** Relacion sport en PlaClubTeamCategory - Error 500 en /categories:
  - Problema: `sport()` usaba hasOneThrough incorrecto
  - Solucion: Usar accessor `getSportAttribute()` + relacion `clubSport.sport`
  - Controller actualizado para usar `with('clubSport.sport')`
  - Datos corregidos: categorias apuntaban a sport_id de otros clubs
- **BUILD:** Verificado exitoso (npm run build)

---

**Ultima actualizacion:** 22 de Diciembre 2025
