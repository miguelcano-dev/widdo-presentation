# Análisis de Arquitectura y Reestructuración - Widdo

**Fecha:** 27 de febrero de 2026  
**Alcance:** Frontend (`frontend/`) y Backend (`saas_sport/`)

---

## 1. Qué hace el proyecto

**Widdo** es un SaaS multi-tenant para la gestión de clubes deportivos (academias, ligas, escuelas). Incluye:

- **Gestión de clubes:** configuración, logos, equipos, sedes.
- **Personas:** jugadores, entrenadores, padres/acudientes, contadores; roles por club.
- **Operación:** categorías, sesiones de entrenamiento, asistencia, eventos en calendario, torneos.
- **Finanzas:** cobros, descuentos, pagos, cuotas, exenciones, reportes.
- **Documentos:** consentimientos, documentos legales, bóveda de archivos, documentos por jugador.
- **Plataforma:** planes de suscripción, pasarelas (Wompi, MercadoPago), Super Admin (analytics, blog, países, pasarelas).
- **Multi-contexto:** un usuario puede ser, por ejemplo, dueño en un club y entrenador en otro; el frontend permite cambiar de “contexto” (club + rol).

La arquitectura es **API REST (Laravel) + SPA (React)** con autenticación por sesión (cookies httpOnly, refresh tokens) y multi-tenancy por `club_id` con scopes globales en el backend.

---

## 2. Visión general de la arquitectura

| Capa        | Backend (saas_sport)     | Frontend (frontend)           |
|------------|---------------------------|--------------------------------|
| **Framework** | Laravel 10 (objetivo 12) | React 18 + Vite 5              |
| **Auth**   | Sanctum + refresh tokens (cookie) | Context + axios interceptors |
| **Estado servidor** | —                    | React Query 5                  |
| **Estado global** | —                    | Context (Auth, Club, etc.)     |
| **UI**     | —                        | Tailwind + Radix UI            |
| **Validación** | Form Requests          | React Hook Form + Zod          |
| **Permisos** | Spatie + Policies + Middleware | Guards por ruta + hooks       |

**Puntos fuertes ya presentes:**

- Documentación clara: `ARCHITECTURE.md`, `CLAUDE.md`, `patterns.md`, `critical-files.md`.
- Multi-tenancy consistente: `ProtectedModel`, `ClubScope`, middleware de contexto.
- Patrones definidos: eager loading, FormRequests, Policies, React Query, Guards.
- Plan de refactoring y migración ya definido en `PLAN_REFACTORING.md`.

---

## 3. Backend (saas_sport) – Reestructuración y buenas prácticas

### 3.1 Controllers demasiado grandes (prioridad alta)

| Archivo | Líneas aprox. | Recomendación |
|---------|----------------|----------------|
| `PlaClubTeamPaymentController` | ~1.754 | Extraer lógica a `PaymentService` / `PaymentWriteService`; controller solo HTTP y validación. |
| `ParentChildController`        | ~1.441 | Extraer a `ParentChildService` (invitaciones, autorizaciones, vinculación). |
| `PlaTournamentController`      | ~1.500+ (según plan) | Igual: servicio de torneos y controller delgado. |

**Buena práctica:** Controllers por debajo de ~300–400 líneas; lógica de negocio en Services; transacciones y reglas en el Service, no en el controller.

### 3.2 Respuestas API homogéneas

- **Problema:** Respuestas no siguen un formato único (a veces `data`, a veces anidado distinto).
- **Recomendación:** Centralizar en un helper (ej. `App\Helpers\ApiResponse` o trait `HttpResponses`) con:
  - `success($data, $message, $code)`
  - `error($message, $code, $errors)`
  - `paginated($paginator)`  
  Y migrar controllers de forma gradual a este contrato.

### 3.3 Servicios y duplicación

- **FileStorageService / URLs temporales:** Ya existen; revisar que todo uso de “URL temporal” pase por ahí (evitar lógica repetida en 7+ sitios).
- **ChargeService:** Ya centraliza cálculo de montos y descuentos; mantener como única fuente de verdad para reglas de cobro/descuento.
- **AuthorizationService:** Usar de forma consistente en Policies y, si aplica, en middleware; evitar chequeos ad hoc duplicados.

### 3.4 Estructura de carpetas (app/)

La estructura actual (Controllers, Models, Services, Policies, etc.) es estándar Laravel y está bien. Opcional a medio plazo:

- **Actions o Handlers** para casos de uso muy concretos (ej. “Registrar pago con cuotas”) si un Service crece demasiado.
- Mantener **Requests** por operación para validación explícita.

### 3.5 Migración Laravel 10 → 12

Seguir el **PLAN_REFACTORING.md** (Fase 0: tests de regresión, luego 10→11→12). No reestructurar fuerte al mismo tiempo que la migración; primero upgrade, luego refactor de controllers/services.

---

## 4. Frontend (frontend) – Reestructuración y buenas prácticas

### 4.1 Componentes y páginas demasiado grandes (prioridad alta)

| Archivo | Líneas aprox. | Recomendación |
|---------|----------------|----------------|
| `PublicEnrollmentPage.jsx`      | ~3.774 | Dividir en: pasos/wizard por componente, hooks (`useEnrollmentSteps`, `useEnrollmentSubmit`), subpáginas o secciones por archivo. |
| `PlayerDataAuthorizationSection.jsx` | ~1.354 | Extraer subsecciones a componentes (consentimientos, autorizaciones, firmas) y hooks de datos. |
| `AuthContext.jsx`                | ~1.153 | Extraer: lógica de login/refresh a un hook o servicio; mantener en Context solo estado y métodos que expongan. Opcional: dividir en AuthContext + PermissionsContext. |
| `PaymentsTable.jsx`              | ~1.039 | Extraer: filas/celdas a componentes, filtros a un hook (`usePaymentFilters` ya existe), acciones masivas a componente/hook dedicado. |

Objetivo razonable: archivos por debajo de ~300–400 líneas; componentes que hagan una cosa clara.

### 4.2 Rutas y App.jsx

- **Problema:** `App.jsx` concentra muchas rutas y lazy imports (cientos de líneas).
- **Recomendación:**
  - Definir rutas por dominio en módulos, por ejemplo:
    - `routes/authRoutes.jsx`
    - `routes/dashboardRoutes.jsx`
    - `routes/adminRoutes.jsx`
  - Un único `routes/index.jsx` que los combine y use `createBrowserRouter` o la estructura actual de `<Route>`.
  - Los lazy imports pueden vivir en cada archivo de rutas para que `App.jsx` solo monte `<Routes>` y los wrappers (PrivateRoute, guards).

### 4.3 Estructura de carpetas (src/)

Estructura actual por “tipo” (components, pages, hooks, services) es válida. Para escalar sin mezclar demasiado:

- **Opción A (feature-first por módulo):**  
  `src/features/players/` con `PlayersPage.jsx`, `components/`, `hooks/`, `utils/` locales.  
  `src/features/payments/`, `src/features/auth/`, etc.  
  Mantener `components/ui/`, `layouts/`, `context/`, `services/` globales.

- **Opción B (híbrido):**  
  Mantener `pages/dashboard/Players/`, `pages/dashboard/Payments/`, etc., pero que cada uno tenga su propia carpeta `components/` y `hooks/` internos (ya se hace en parte). Estandarizar que lo específico de una página viva dentro de su carpeta.

Ambas son buenas prácticas; la B es menos invasiva y ya encaja con el proyecto.

### 4.4 Estado: Context vs React Query vs estado local

- **Regla sugerida (documentar en CLAUDE.md o patterns):**
  - **React Query:** Todo lo que venga del API (listados, detalle, mutaciones). Evitar duplicar en Context lo que es “caché del servidor”.
  - **Context:** Solo estado global de sesión/UI: usuario, club actual, permisos derivados, tema, sidebar abierto/cerrado.
  - **useState/useReducer:** Estado local de formularios, modales, tabs, filtros de una sola página.
- **AuthContext:** Reducir responsabilidades: que provea `user`, `club`, `login`, `logout`, `refreshUser`; permisos pueden derivarse con un hook `usePermissions()` que lea `user`/roles y no guarde estado duplicado.

### 4.5 Hooks y servicios

- **Hooks por recurso:** Ya existen (`usePlayerData`, `usePaymentData`, etc.); seguir el patrón para nuevos recursos (queryKey, queryFn, invalidaciones).
- **Servicios:** Mantener `apiService`, `axiosInstance` como capa de red; no poner lógica de negocio en servicios del frontend, solo llamadas API y transformación mínima (ej. fechas).

### 4.6 Accesibilidad y UI

- Radix ya da buena base de a11y; seguir usándolo para modales, selects y formularios.
- En formularios largos (p. ej. inscripción pública), asegurar labels, agrupación por fieldset y mensajes de error asociados (patrones ya descritos en `patterns.md`).

---

## 5. Priorización sugerida

| Prioridad | Área | Acción | Esfuerzo aprox. |
|-----------|------|--------|------------------|
| 1 | Backend | Tests de regresión (Fase 0) y CI que ejecute tests antes de deploy | 2–4 h |
| 2 | Backend | Extraer lógica de `PlaClubTeamPaymentController` a Service(s) | 1–2 días |
| 3 | Frontend | Dividir `PublicEnrollmentPage.jsx` en pasos + hooks | 1–2 días |
| 4 | Frontend | Reducir `AuthContext.jsx` (extraer lógica/hooks) | 4–8 h |
| 5 | Frontend | Dividir `PlayerDataAuthorizationSection.jsx` y `PaymentsTable.jsx` | 1 día |
| 6 | Backend | ApiResponse centralizado y migrar 5–10 controllers | 2–4 h |
| 7 | Backend | Extraer `ParentChildController` a Service | 1 día |
| 8 | Frontend | Rutas por módulo en `App.jsx` | 2–4 h |
| 9 | Ambos | Documentar reglas Context vs React Query vs estado local | 1 h |
| 10 | Backend | Laravel 11 → 12 (según PLAN_REFACTORING) | 4–8 h |

---

## 6. Resumen

- **Arquitectura general:** Sólida y bien documentada; no hace falta un cambio de paradigma, sino refinar y dividir responsabilidades.
- **Backend:** Principal mejora es adelgazar controllers (1.400–1.700 líneas) moviendo lógica a Services y unificar respuestas API.
- **Frontend:** Principal mejora es dividir páginas/componentes de 1.000–3.700 líneas en componentes más pequeños y hooks, y organizar rutas por módulo.
- **Reestructuración “física” de carpetas:** Opcional; la estructura actual es válida. Si se hace, el enfoque híbrido (features o páginas con sus `components/` y `hooks/` internos) es suficiente.
- El **PLAN_REFACTORING.md** sigue siendo la referencia para el orden de trabajo (tests, Laravel upgrade, refactors); este documento alinea reestructuración y buenas prácticas con ese plan.

Si quieres, el siguiente paso puede ser bajar al detalle en un solo archivo (por ejemplo `PublicEnrollmentPage.jsx` o `PlaClubTeamPaymentController`) y proponer un desglose concreto de componentes/hooks o métodos a mover a servicios.
