# ⚽ Widdo - Sistema de Gestión de Clubes Deportivos

Sistema SaaS multi-tenant para gestión integral de clubes deportivos en Colombia.

---

## 📊 Estado verificado del proyecto

Última revisión basada en código y pruebas: **17 de julio de 2026**.
Los porcentajes históricos se retiraron porque mezclaban presencia de código,
cobertura de pruebas y preparación para producción.

| Área de Widdo Clubs | Estado verificable | Observación |
|----------------------|--------------------|-------------|
| Autenticación, contextos, RBAC y multi-tenant | ✅ Verificado | Cobertura funcional y de aislamiento en PHPUnit |
| Clubes, jugadores, categorías, entrenadores y sesiones | 🟡 Implementado, cobertura parcial | Faltan pruebas directas de varios CRUD completos |
| Cobros, pagos, descuentos y suscripciones | 🟡 Implementado, cobertura parcial | Suscripciones sólidas; escenarios legacy de pagos siguen omitidos |
| Documentos, consentimientos y credenciales | ✅ Verificado técnicamente | La habilitación legal depende de revisión jurídica por país |
| Gastos, inventario, enrollment e import/export | 🟡 Implementado sin certificación | Backend y UI existen; faltan pruebas funcionales directas |
| Reportes | ✅ Verificado | PDF/Excel reales; rutas legacy consolidadas por rol y cubiertas funcionalmente |
| Notificaciones y tiempo real | ✅ Verificado en Clubs | Preferencias, anuncios, Web Push y alertas familiares cubiertos funcionalmente |

Widdo Academy está en standby y queda fuera de este estado. El módulo de
Tournaments se mantiene fuera de esta revisión por decisión de alcance.

---

## 🚀 Quick Start

### Requisitos Previos
- Docker & Docker Compose
- Node.js 18+ (para frontend)
- Git

### Instalación

```bash
# Desde la raíz del workspace Widdo
./start.sh

# PHPUnit aislado en db_testing_b
./start.sh --test

# Smoke E2E aislado: backend 8020, frontend 5174 y db_e2e
./start.sh --e2e
```

### Acceder a la aplicación

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8010
- **Mailpit (emails):** http://localhost:8026

---

## 🔑 Credenciales de Prueba

### Super Administrator
- **Email:** admin@sportsclub.co
- **Password:** admin123
- **Documento:** 1000000000

### Backup Administrator
- **Email:** backup@sportsclub.co
- **Password:** backup123

### Usuarios de Clubes
- **Password por defecto:** password123
- Ver seeders para emails específicos

---

## 🏗️ Arquitectura

### Stack Tecnológico

**Backend:**
- Laravel 12 + PHP 8.2
- MySQL 8.0
- Laravel Sanctum (autenticación)
- Spatie Laravel Permission (RBAC)
- Docker

**Frontend:**
- React 18 + Vite
- Tailwind CSS + Radix UI
- React Router
- Axios
- React Hook Form

---

## 📦 Funcionalidades Principales

### ✅ Verificadas
- Sistema multi-tenant con aislamiento de datos por club
- Dashboards personalizados por rol
- Relaciones padre-hijo para menores
- Suscripciones y ciclo de vida de planes
- Consentimientos, credenciales y documentos firmados
- Suite PHPUnit aislada y smoke E2E reproducible

### 🟡 Implementadas con cierre pendiente
- Gestión de jugadores, entrenadores, categorías, sesiones y asistencia
- Pagos, cobros, descuentos, gastos e inventario
- Enrollment público e importación/exportación
- Reportes financieros PDF/Excel
- Jobs, push y notificaciones en tiempo real

El detalle y la evidencia por módulo se mantienen en
[MODULES_AND_ROLES.md](MODULES_AND_ROLES.md).

---

## 💳 Sistema de Suscripciones y Pagos

Widdo Inc cobra a los clubes su suscripción con tarjeta a través de **Stripe**, la única
pasarela del sistema.

**Doc completa (arquitectura, credenciales, webhooks, Connect, checklist de Gate 0):**
[`saas_sport/docs/PAYMENTS-STRIPE.md`](saas_sport/docs/PAYMENTS-STRIPE.md)

| Pasarela | Flujo | Países | Estado |
|----------|-------|--------|--------|
| **Stripe** | Checkout (suscripciones) + Connect Express (torneos) | 🇺🇸 US, 🇨🇦 CA, 🇲🇽 MX | Integrada — **producción en sandbox** |
| Wompi | — | — | ❌ Descartada (código legacy en el repo) |
| MercadoPago | — | — | ❌ Descartada (código legacy en el repo) |

Wompi y MercadoPago se descartaron por **decisión de negocio**, no por un fallo técnico. Su
código sigue en `app/Services/Payments/` porque arrancarlo tocaría el histórico de pagos de los
clubes colombianos. No los configures ni los ofrezcas a un club.

> ⚠️ **Producción sigue en sandbox.** Ningún cobro real entra hasta cerrar el **Gate 0** del
> lanzamiento USA (llaves live + los dos webhooks). El entorno no se declara a mano: se deduce
> del prefijo de la llave secreta (`sk_live_` → producción, cualquier otra → sandbox).

### Precios

**USD 99 / 199 / 349 al mes** — Starter / Pro / Enterprise. La palanca es la **cantidad de
jugadores** (`max_members`: 80 / 200 / 500), **no los módulos**: todos los módulos van abiertos y
un club sube de plan porque crece, no porque quiera una función. Fuente de verdad:
`saas_sport/database/seeders/SubscriptionPlansSeeder.php`.

Ciclo anual: paga 12 meses, recibe 13.

### Dónde se configuran las credenciales

Están en **dos** lugares distintos, y poner la llave en el sitio equivocado no da error —
simplemente no cobra:

| Para qué | Dónde |
|----------|-------|
| Suscripciones de clubes | Admin UI → `/home/admin/payment-gateways`, una fila por país |
| Torneos y Stripe Connect | Variables `.env` del droplet (`config/stripe.php`) |

Los webhooks usan un **secret distinto por endpoint**: `/api/webhooks/stripe` para suscripciones
y `/api/webhooks/stripe-connect` para torneos. Verificar uno con el secret del otro falla la firma
y el evento se descarta en silencio.

### Flujo de suscripción (usuario final)

```
1. El propietario del club entra a "Mi Suscripción"
        ↓
2. Elige plan y período (mensual o anual)
        ↓
3. Se abre Stripe Checkout
        ↓
4. Paga con tarjeta de crédito o débito
        ↓
5. Stripe confirma por webhook y el sistema activa la suscripción
```

Los planes pueden incluir días de prueba gratis; durante el trial el club tiene acceso completo.
El propietario puede cancelar desde su panel y la suscripción sigue activa hasta el fin del
período pagado. El historial de pagos está en "Mi Suscripción → Historial", y el portal de
facturación de Stripe en `POST /api/subscriptions/billing-portal`.

**Pago manual:** para un club cuya tarjeta no pasa (habitual en tarjetas empresariales de LATAM
bloqueadas para compras internacionales) existe una válvula de escape interna: registrar el pago
por transferencia desde super admin. No es un método visible para el club. Diseño en
`saas_sport/docs/superpowers/specs/2026-07-28-pago-manual-suscripcion-design.md`.

---

## 🌍 Gestión de Países - Habilitar Nuevos Países

El sistema permite expandir la plataforma a nuevos países de forma controlada. Cada país tiene un **Readiness Score** (porcentaje de preparación) que indica qué tan listo está para ser activado.

### Acceso al Panel

- **Ruta:** `/home/admin/countries`
- **Sidebar:** Administración → Países
- **Rol requerido:** Super Admin

### Checklist de Preparación

Para activar un país, debe cumplir **100%** de los siguientes criterios (todos son obligatorios):

| Criterio | Peso | Descripción |
|----------|------|-------------|
| Datos básicos | 10% | Moneda, símbolo, código telefónico |
| Formato de fecha | 5% | DD/MM/YYYY o similar configurado |
| Estados/Departamentos | 15% | Mínimo 5 estados cargados |
| Ciudades | 15% | Mínimo 20 ciudades cargadas |
| Tipos de documento | 20% | Mínimo 2 tipos (adulto + menor) |
| Métodos de pago | 20% | Mínimo 2 métodos disponibles |
| Impuestos | 10% | Tasa y nombre del impuesto |
| Timezone | 5% | Zona horaria configurada |

### Proceso para Habilitar un País

#### 1. Ir al Panel de Países
Navegar a **Administración → Países** en el sidebar.

#### 2. Seleccionar el País a Configurar
Click en **"Configurar"** en el país deseado para abrir el modal de configuración.

#### 3. Configurar Datos Regionales (Tab: Configuración)
- **Zona Horaria:** Ej: `America/Mexico_City`
- **Inicio de Semana:** Lunes o Domingo
- **Formato de Fecha:** DD/MM/YYYY (LATAM), MM/DD/YYYY (USA)
- **Moneda:** Decimales (0 para COP, 2 para MXN), separadores
- **Impuestos:** Nombre (IVA) y tasa (16%, 19%, etc.)

#### 4. Agregar Tipos de Documento (Tab: Documentos)
Agregar los documentos de identidad del país:

| País | Ejemplos |
|------|----------|
| 🇨🇴 Colombia | CC, TI, CE, Pasaporte |
| 🇲🇽 México | INE, CURP, Pasaporte |
| 🇪🇸 España | DNI, NIE, Pasaporte |
| 🇦🇷 Argentina | DNI, CUIT, Pasaporte |

#### 5. Agregar Métodos de Pago Locales (Tab: Pagos)
Los métodos globales (Efectivo, Transferencia, Tarjeta) ya existen. Agregar métodos específicos:

| País | Métodos Locales |
|------|-----------------|
| 🇨🇴 Colombia | Nequi, Daviplata, PSE |
| 🇲🇽 México | SPEI, OXXO |
| 🇪🇸 España | Bizum |
| 🇦🇷 Argentina | Mercado Pago |

#### 6. Verificar Readiness Score
El sistema calcula automáticamente el porcentaje. Ver el checklist en la pestaña **"Resumen"**.

#### 7. Activar el País
Una vez que el score sea **100%**, activar el switch en la tabla principal de países.

### Indicadores de Estado

```
🟢 ████████████████████ 100%  → Listo para activar
🟡 ███████████████████░ 95%   → Casi listo (falta poco)
🟡 █████████████░░░░░░░ 65%   → Faltan configuraciones
🔴 ████░░░░░░░░░░░░░░░░ 20%   → Requiere trabajo significativo
```

### API Endpoints (Referencia Técnica)

```
GET  /api/admin/countries               # Lista países con readiness
GET  /api/admin/countries/{id}          # Detalle con checklist
PUT  /api/admin/countries/{id}          # Actualizar configuración
POST /api/admin/countries/{id}/toggle   # Activar/desactivar
POST /api/admin/countries/{id}/document-types    # Crear tipo doc
POST /api/admin/countries/{id}/payment-methods   # Crear método pago
```

> **Documentación técnica completa:** Ver `saas_sport/CLAUDE.md` sección "Gestión de Países"

---

## 📚 Documentación Completa

### 📁 Estructura de Documentación del Proyecto

Este proyecto mantiene documentación **separada** para backend y frontend:

#### 🔷 Backend (Laravel API):
👉 **[saas_sport/CLAUDE.md](saas_sport/CLAUDE.md)** - Documentación completa del backend
- Comandos Laravel y Docker
- Estructura de base de datos
- Seeders colombianos
- Sistema de autenticación
- Políticas y permisos
- Funcionalidades pendientes

**Recursos adicionales:**
- [PERMISSIONS.md](saas_sport/PERMISSIONS.md) - Sistema de permisos RBAC
- [TESTING_STRATEGY.md](saas_sport/TESTING_STRATEGY.md) - Estrategia de testing

#### 🔶 Frontend (React + Vite):
👉 **[frontend/CLAUDE.md](frontend/CLAUDE.md)** - Documentación completa del frontend
- Arquitectura de componentes
- Sistema de routing
- Hooks personalizados
- Servicios de API
- Testing E2E con Playwright
- Convenciones de código

**Recursos adicionales:**
- [TESTING_ROUTES.md](frontend/TESTING_ROUTES.md) - Guía de testing XSS

---

### 🔄 Flujo de Sincronización Backend ↔ Frontend

#### 1️⃣ Autenticación (Laravel Sanctum)
```
Frontend (React)              Backend (Laravel)
     │                              │
     ├─ POST /api/login ──────────→ AuthController
     │                              ├─ Valida credenciales
     │                              ├─ Crea token Sanctum
     │                              └─ Retorna { token, user }
     │                              │
     ←──────────────────────────────┤
     │                              │
     ├─ Guarda token en localStorage
     ├─ Actualiza AuthContext
     └─ Redirect a dashboard
```

#### 2️⃣ Requests Autenticados
```
Frontend                      Backend
     │                              │
     ├─ GET /api/clubs/1/players ──→ Middleware: auth:sanctum
     │  Headers:                     │
     │  - Authorization: Bearer {token}
     │  - Accept: application/json   │
     │                              ├─ Valida token
     │                              ├─ Valida permisos
     │                              ├─ Policy: viewAny(Player)
     │                              └─ Retorna JSON
     │                              │
     ←──────────────────────────────┤
     │                              │
     ├─ Actualiza estado local
     └─ Renderiza UI
```

#### 3️⃣ Multi-Tenancy (Aislamiento por Club)
```
Frontend                      Backend
     │                              │
     ├─ clubId = 1 (AuthContext)   │
     │                              │
     ├─ GET /api/clubs/1/players ──→ Global Scope: ClubScope
     │                              ├─ WHERE club_id = 1
     │                              └─ Solo datos del club 1
     │                              │
     ←──────────────────────────────┤
     │                              │
     └─ Recibe solo jugadores del club actual
```

#### 4️⃣ Sistema de Permisos (RBAC)
```
Frontend                      Backend
     │                              │
hasPermission('players.create')    Policy: create(Player)
     │                              │
     ├─ SI tiene permiso:          ├─ Valida:
     │  └─ Muestra botón "Crear"   │  ├─ Usuario tiene rol correcto
     │                              │  ├─ Usuario pertenece al club
     │                              │  └─ Permiso 'players.create'
     ├─ NO tiene permiso:          │
     │  └─ Oculta botón            └─ Retorna 403 si no autorizado
```

#### 5️⃣ Upload de Archivos (Documentos, Fotos)
```
Frontend                      Backend
     │                              │
     ├─ FormData con archivo ──────→ Request validation
     │  - file: [binary]            │  - max:10MB
     │  - document_type: 'cedula'   │  - mimes:pdf,jpg,png
     │                              │
     │                              ├─ Storage::putFile()
     │                              ├─ Guarda en DB
     │                              └─ Retorna { file_path, url }
     │                              │
     ←──────────────────────────────┤
     │                              │
     └─ Actualiza preview del archivo
```

---

### 🗂️ Convención de URLs (API REST)

```
Patrón: /api/{resource}/{id}/{subresource}

Ejemplos:
├─ /api/clubs                        → Listar clubes
├─ /api/clubs/1                      → Ver club #1
├─ /api/clubs/1/players              → Jugadores del club #1
├─ /api/clubs/1/players/5            → Jugador #5 del club #1
├─ /api/clubs/1/players/5/documents  → Documentos del jugador #5
└─ /api/clubs/1/events               → Eventos del club #1
```

---

### 🔐 Headers Requeridos en Requests

```javascript
// Todas las requests deben incluir:
{
  'Authorization': 'Bearer {token}',
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest'
}
```

---

### 📊 Formato de Respuestas

#### ✅ Success Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com"
  },
  "message": "Jugador creado exitosamente"
}
```

#### ❌ Error Response:
```json
{
  "success": false,
  "message": "No tienes permisos para esta acción",
  "errors": {
    "permission": ["Requiere permiso 'players.create'"]
  }
}
```

---

### 🔄 Estado Sincronizado Entre Backend y Frontend

| Concepto | Backend | Frontend |
|----------|---------|----------|
| **Usuario actual** | `Auth::user()` | `AuthContext.user` |
| **Club actual** | `$user->current_club_id` | `ClubContext.currentClub` |
| **Permisos** | `$user->can('players.view')` | `hasPermission('players.view')` |
| **Roles** | `$user->hasRole('Propietario')` | `hasRole('Propietario del Club')` |
| **Token** | Sanctum token (BD) | localStorage.getItem('token') |

---

### 📋 Regla de Documentación del Proyecto

**IMPORTANTE:** Este proyecto sigue una regla estricta de documentación para evitar duplicados.

#### ✅ Archivos de Documentación Permitidos:

**Nivel Raíz:**
- ✅ `README.md` (este archivo) - Overview general y sincronización

**Backend:**
- ✅ `saas_sport/CLAUDE.md` - Documentación completa del backend
- ✅ `saas_sport/PERMISSIONS.md` - Solo permisos RBAC
- ✅ `saas_sport/TESTING_STRATEGY.md` - Solo testing

**Frontend:**
- ✅ `frontend/CLAUDE.md` - Documentación completa del frontend
- ✅ `frontend/TESTING_ROUTES.md` - Solo testing XSS

#### ❌ NO Crear:
- ❌ ROADMAP.md, STATUS.md, PENDING.md separados
- ❌ Múltiples archivos .md con información duplicada
- ❌ Archivos .md temporales de análisis

#### 📝 Regla de Oro:
- **Backend** → Documenta en `saas_sport/CLAUDE.md`
- **Frontend** → Documenta en `frontend/CLAUDE.md`
- **General** → Actualiza `README.md` raíz
- **Si crece** → Reorganiza secciones, NO crees archivos nuevos

---

## 🇨🇴 Datos Colombianos

El sistema incluye seeders con datos realistas de Colombia:

- 5 clubes deportivos en ciudades principales
- 150+ usuarios con roles apropiados
- Precios en pesos colombianos (COP)
- Métodos de pago colombianos (PSE, Nequi, Daviplata)
- Documentos colombianos (CC, TI, CE)
- EPS colombianas

---

## 🐳 Comandos Docker Útiles

```bash
# Ver logs
docker-compose logs -f

# Acceder al contenedor
docker compose exec saas_sport_app bash

# Ejecutar migraciones
docker compose exec saas_sport_app php artisan migrate

# Ejecutar tests
docker compose exec saas_sport_app php artisan test

# Limpiar cache
docker compose exec saas_sport_app php artisan config:clear
docker compose exec saas_sport_app php artisan cache:clear

# Detener servicios
docker-compose down
```

---

## 📊 Estadísticas del Proyecto

- **Líneas de código:** ~51,000
- **Backend:** ~30,000 líneas
- **Frontend:** ~18,000 líneas
- **Tests:** ~3,000 líneas
- **Modelos:** 50+
- **Controllers:** 40+
- **Componentes React:** 100+

---

## 🚧 Próximos pasos del alcance Clubs

1. ✅ Contrato de preferencias y autorización de anuncios corregidos.
2. ✅ Alertas familiares de asistencia y canales push conectados.
3. ✅ Experiencias de reportes consolidadas y acciones simuladas retiradas.
4. Añadir cobertura funcional a gastos, inventario, enrollment e import/export.
5. Completar los escenarios CRUD y financieros actualmente omitidos.

---

## 📝 Notas Importantes

- **No usar referencias a IA en commits** - Commits limpios y profesionales
- **Mantener documentación actualizada** - Actualizar CLAUDE.md cuando sea necesario
- **Testing obligatorio** - Nuevas features requieren tests
- **Multi-tenancy siempre** - Considerar aislamiento de datos en todo desarrollo

---

## 📄 Licencia

Proyecto privado - Widdo SaaS

---

**Última actualización:** 17 de julio de 2026
**Versión:** Estado de Clubs basado en evidencia
**Cliente:** Miguel Cano - Widdo SaaS
