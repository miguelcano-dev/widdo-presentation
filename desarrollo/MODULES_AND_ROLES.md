# MODULES_AND_ROLES.md - Widdo Platform

**Última actualización:** 25 de Enero de 2026
**Versión:** 1.0

Este documento contiene el mapeo completo de roles, módulos, permisos y funcionalidades de la plataforma Widdo.

---

## ROLES DEL SISTEMA (6 roles)

| Rol | Key | Prioridad | Icono | Descripción |
|-----|-----|-----------|-------|-------------|
| **Propietario del Club** | `owner` | 100 | Building2 | Dueño del club. Tiene TODOS los permisos sin restricción. Puede personalizar permisos de otros roles. |
| **Administrador** | `admin` | 80 | Shield | Segundo al mando del club. Acceso casi completo (crear, editar) excepto eliminar y suscripción. Puede ver configuración. |
| **Contador** | `accountant` | 60 | Calculator | Gestión financiera completa. Pagos, cobros, descuentos, gastos, reportes financieros. |
| **Entrenador** | `trainer` | 50 | GraduationCap | Gestión de sesiones y asistencia. Acceso limitado a jugadores (solo ver/editar). Calendario y comunicaciones. |
| **Padre/Acudiente** | `parent` | 20 | Heart | Ver información de sus hijos. Realizar pagos. Subir documentos. Ver calendario y sesiones. |
| **Jugador** | `player` | 10 | Users | Ver sus propias sesiones. Realizar pagos. Subir documentos personales. Ver calendario. |

### Archivos de Definición:
- **Frontend:** `/frontend/src/constants/roles.js`
- **Backend:** `/saas_sport/app/Models/UserClubRole.php`

---

## DETALLE POR ROL

### 🛡️ ADMINISTRADOR (`admin`)

**Prioridad:** 80 (segundo después del Owner)
**Icono:** Shield
**Descripción:** Segundo al mando del club. Acceso casi completo excepto eliminar y suscripción.

#### Resumen de Acceso por Módulo

| # | Módulo | Acceso | Puede hacer |
|---|--------|--------|-------------|
| 1 | **Club** | 🔵 Ver + Editar | Ver y editar información del club. NO gestionar (eliminar) |
| 2 | **Categorías** | 🔵 CRUD | Crear, editar categorías. NO eliminar |
| 3 | **Jugadores** | 🔵 CRUD + Export | Crear, editar, exportar jugadores. NO eliminar |
| 4 | **Entrenadores** | 🔵 Ver + Crear + Editar | Invitar, editar entrenadores. NO eliminar |
| 5 | **Ubicaciones** | 🔵 Ver + Crear + Editar | Crear, editar sedes. NO eliminar |
| 6 | **Sesiones** | 🔵 CRUD + Asistencia | Crear, editar sesiones, tomar asistencia. NO eliminar |
| 7 | **Cobros** | 🔵 CRUD | Crear, editar conceptos de cobro. NO eliminar |
| 8 | **Descuentos** | 🔵 CRUD | Crear, editar descuentos. NO eliminar |
| 9 | **Pagos** | 🔵 CRUD + Verificar | Registrar, editar, verificar pagos. NO eliminar |
| 10 | **Calendario** | 🔵 CRUD | Crear, editar eventos. NO eliminar |
| 11 | **Reportes** | ✅ Ver + Exportar | Ver reportes y exportar a PDF/Excel |
| 12 | **Documentos** | 🔵 CRUD + Verificar | Subir, editar, verificar documentos. NO eliminar |
| 13 | **Comunicaciones** | ✅ Enviar | Ver historial y enviar comunicaciones |
| 14 | **Configuración** | 🟡 Ver | Ver configuración. NO editar |
| 15 | **Inventario** | ✅ Full | Gestionar inventario y entregas |
| 16 | **Gastos** | ✅ Full | Registrar y editar gastos |
| 17 | **Torneos** | ✅ Full | Crear y gestionar torneos |
| 18 | **Equipo del Club** | 🟡 Ver | Ver lista del staff. NO invitar |
| 19 | **Links Inscripción** | ✅ Full | Crear y gestionar links públicos |
| 20 | **Permisos de Rol** | ✅ Full* | *Solo si el Owner lo permite |
| 21 | **Config. Pagos** | 🟡 Ver | Ver configuración. NO editar |
| 22 | **Docs Legales** | ✅ Full | Subir y gestionar reglamentos |
| 23 | **Consentimiento** | ✅ Full | Editar plantilla de consentimiento |
| 24 | **Reportes Financieros** | ✅ Full | Ver y exportar reportes financieros |
| 25 | **Asistencia** | ✅ Full | Ver y tomar asistencia |
| 26 | **Suscripción** | ❌ No | Sin acceso (solo Owner) |

#### Detalle de Capacidades

**✅ ACCESO COMPLETO (CRUD sin eliminar):**

- **Club:** Ver y editar información del club (nombre, logo, datos). NO eliminar/gestionar.
- **Entrenadores:** Ver, invitar y editar entrenadores. NO eliminar.
- **Ubicaciones:** Ver, crear y editar sedes. NO eliminar.
- **Jugadores:** Crear, editar, exportar. Ver perfil completo (médico, documentos, pagos). Subir foto. NO eliminar.
- **Pagos:** Registrar, editar, verificar comprobantes. Ver pendientes y morosos. Generar cuotas. NO eliminar.
- **Sesiones:** Crear, editar, tomar asistencia. Ver historial. NO eliminar.
- **Calendario:** Crear eventos (partidos, torneos, reuniones). Editar, invitar participantes. NO eliminar.
- **Cobros/Descuentos:** Crear y editar conceptos. NO eliminar.
- **Documentos:** Subir, editar, verificar (aprobar/rechazar). NO eliminar.
- **Reportes:** Ver dashboard, estadísticas y exportar a PDF/Excel.
- **Torneos:** Crear, editar, inscribir jugadores, gestionar brackets, registrar resultados.
- **Links Inscripción:** Crear enlaces públicos, configurar campos, ver inscritos.

**🟡 SOLO LECTURA:**

- **Configuración:** Ver ajustes del club. NO modificar.
- **Equipo del Club:** Ver miembros. NO invitar.
- **Config. Pagos:** Ver métodos configurados. NO modificar.

**❌ SIN ACCESO:**

- Suscripción/Plan (solo Owner)
- Eliminar cualquier registro (protección contra errores)

#### Rutas Accesibles

```
✅ /home/dashboard, /home/players, /home/player-create, /home/categories
✅ /home/trainers, /home/sessions, /home/attendance, /home/payments
✅ /home/chargers, /home/discounts, /home/expenses, /home/calendar
✅ /home/tournaments, /home/inventory, /home/enrollment-links
✅ /home/team-members, /home/legal-documents, /home/consent-template
✅ /home/financial-reports, /home/reports, /home/club-team
✅ /home/role-permissions (si Owner permite)

❌ /home/subscription, /home/settings
```

---

### 💰 CONTADOR (`accountant`)

**Prioridad:** 60
**Icono:** Calculator
**Descripción:** Gestión financiera completa del club.

#### Resumen de Acceso por Módulo

| # | Módulo | Acceso | Puede hacer |
|---|--------|--------|-------------|
| 1 | **Club** | 🟡 Ver | Ver información básica |
| 2 | **Categorías** | ❌ No | Sin acceso |
| 3 | **Jugadores** | 🟡 Ver + Export | Ver lista y exportar para cobros |
| 4 | **Entrenadores** | ❌ No | Sin acceso |
| 5 | **Ubicaciones** | ❌ No | Sin acceso |
| 6 | **Sesiones** | ❌ No | Sin acceso |
| 7 | **Cobros** | 🔵 CRUD | Crear, editar conceptos de cobro |
| 8 | **Descuentos** | 🔵 CRUD | Crear, editar descuentos |
| 9 | **Pagos** | 🔵 CRUD + Verificar | Registrar, editar, verificar pagos |
| 10 | **Calendario** | ❌ No | Sin acceso |
| 11 | **Reportes** | ✅ Ver + Export | Ver y exportar reportes |
| 12 | **Documentos** | 🟡 Ver | Solo ver documentos |
| 13 | **Comunicaciones** | 🟡 Ver | Solo ver historial |
| 14 | **Configuración** | ❌ No | Sin acceso |
| 15 | **Inventario** | 🟡 Ver | Ver para valorización |
| 16 | **Gastos** | ✅ Full | Gestión completa de gastos |
| 17 | **Torneos** | ❌ No | Sin acceso |
| 18 | **Equipo del Club** | ❌ No | Sin acceso |
| 19 | **Links Inscripción** | ❌ No | Sin acceso |
| 20 | **Permisos de Rol** | ❌ No | Sin acceso |
| 21 | **Config. Pagos** | ✅ Full | Configurar métodos de pago y mora |
| 22 | **Docs Legales** | ❌ No | Sin acceso |
| 23 | **Consentimiento** | ❌ No | Sin acceso |
| 24 | **Reportes Financieros** | ✅ Full | Ver y exportar todo |
| 25 | **Asistencia** | ❌ No | Sin acceso |
| 26 | **Suscripción** | ❌ No | Sin acceso |

#### Enfoque Principal

El contador se enfoca **exclusivamente en finanzas**:
- ✅ Cobros, descuentos, pagos, gastos
- ✅ Configuración de métodos de pago y mora
- ✅ Reportes financieros con exportación
- ✅ Ver jugadores solo para gestión de cobros

#### Rutas Accesibles

```
✅ /home/dashboard, /home/payments, /home/chargers, /home/discounts
✅ /home/expenses, /home/financial-reports, /home/payment-settings
✅ /home/players (solo ver), /home/reports, /home/inventory (solo ver)

❌ /home/sessions, /home/categories, /home/trainers, /home/calendar
❌ /home/tournaments, /home/team-members, /home/enrollment-links
❌ /home/subscription, /home/settings
```

---

### 🎓 ENTRENADOR (`trainer`)

**Prioridad:** 50
**Icono:** GraduationCap
**Descripción:** Gestión de entrenamientos y asistencia de sus categorías.

#### Resumen de Acceso por Módulo

| # | Módulo | Acceso | Puede hacer |
|---|--------|--------|-------------|
| 1 | **Club** | 🟡 Ver | Ver información básica |
| 2 | **Categorías** | 🟡 Ver | Ver sus categorías asignadas |
| 3 | **Jugadores** | 🟡 Ver + Update | Ver y editar jugadores de sus categorías |
| 4 | **Entrenadores** | ❌ No | Sin acceso |
| 5 | **Ubicaciones** | 🟡 Ver | Ver sedes disponibles |
| 6 | **Sesiones** | ✅ Full | CRUD completo de sus sesiones |
| 7 | **Cobros** | ❌ No | Sin acceso |
| 8 | **Descuentos** | ❌ No | Sin acceso |
| 9 | **Pagos** | ❌ No | Sin acceso |
| 10 | **Calendario** | 🔵 CRUD | Crear eventos de su categoría |
| 11 | **Reportes** | 🟡 Ver | Ver reportes de asistencia |
| 12 | **Documentos** | 🟡 Ver | Ver documentos de sus jugadores |
| 13 | **Comunicaciones** | ✅ Enviar | Enviar a jugadores de sus categorías |
| 14 | **Configuración** | ❌ No | Sin acceso |
| 15 | **Inventario** | 🟡 Ver | Ver inventario disponible |
| 16 | **Gastos** | ❌ No | Sin acceso |
| 17 | **Torneos** | 🟡 Ver | Ver torneos y convocados |
| 18 | **Equipo del Club** | ❌ No | Sin acceso |
| 19 | **Links Inscripción** | ❌ No | Sin acceso |
| 20 | **Permisos de Rol** | ❌ No | Sin acceso |
| 21 | **Config. Pagos** | ❌ No | Sin acceso |
| 22 | **Docs Legales** | ❌ No | Sin acceso |
| 23 | **Consentimiento** | ❌ No | Sin acceso |
| 24 | **Reportes Financieros** | ❌ No | Sin acceso |
| 25 | **Asistencia** | ✅ Full | Tomar asistencia de sus sesiones |
| 26 | **Suscripción** | ❌ No | Sin acceso |

#### Enfoque Principal

El entrenador se enfoca en **entrenamientos y sus jugadores**:
- ✅ Crear y gestionar sesiones de entrenamiento
- ✅ Tomar asistencia
- ✅ Ver y editar datos de jugadores de sus categorías
- ✅ Crear eventos en calendario
- ✅ Comunicarse con sus jugadores

#### Rutas Accesibles

```
✅ /home/dashboard, /home/sessions, /home/attendance, /home/calendar
✅ /home/players (sus categorías), /home/categories (solo ver)
✅ /home/reports, /home/venues (solo ver), /home/inventory (solo ver)
✅ /home/tournaments (solo ver)

❌ /home/payments, /home/chargers, /home/discounts, /home/expenses
❌ /home/team-members, /home/enrollment-links, /home/settings
❌ /home/subscription, /home/financial-reports
```

---

### 💜 PADRE/ACUDIENTE (`parent`)

**Prioridad:** 20
**Icono:** Heart
**Descripción:** Ver información de sus hijos y gestionar pagos.

#### Resumen de Acceso por Módulo

| # | Módulo | Acceso | Puede hacer |
|---|--------|--------|-------------|
| 1 | **Club** | 🟡 Ver | Ver información básica del club |
| 2 | **Categorías** | ❌ No | Sin acceso |
| 3 | **Jugadores** | 🟡 Ver (hijos) | Solo ver perfil de sus hijos |
| 4 | **Entrenadores** | ❌ No | Sin acceso |
| 5 | **Ubicaciones** | 🟡 Ver | Ver sedes donde entrenan hijos |
| 6 | **Sesiones** | 🟡 Ver | Ver sesiones de sus hijos |
| 7 | **Cobros** | ❌ No | Sin acceso (ve en Mis Pagos) |
| 8 | **Descuentos** | ❌ No | Sin acceso |
| 9 | **Pagos** | 🟢 Ver + Crear | Ver estado de cuenta y registrar pagos de hijos |
| 10 | **Calendario** | 🟡 Ver | Ver eventos donde participan hijos |
| 11 | **Reportes** | ❌ No | Sin acceso |
| 12 | **Documentos** | 🟢 Ver + Crear | Subir documentos de sus hijos |
| 13 | **Comunicaciones** | 🟡 Ver | Ver mensajes recibidos |
| 14 | **Configuración** | ❌ No | Sin acceso |

#### Módulos Exclusivos para Padres

| Módulo | Acceso | Funcionalidad |
|--------|--------|---------------|
| **Mis Hijos** | ✅ Full | Ver lista de hijos, perfil, editar datos de contacto |
| **Mis Pagos** | ✅ Ver + Crear | Ver pendientes, registrar pagos, subir comprobantes |
| **Mis Documentos** | ✅ Ver + Crear | Ver y subir documentos de hijos |
| **Sesiones de Hijos** | 🟡 Ver | Ver calendario de entrenamientos de hijos |

#### Rutas Accesibles

```
✅ /home/dashboard, /home/my-children, /home/my-child-edit/:id
✅ /home/my-payments, /home/my-documents, /home/children-sessions
✅ /home/calendar (solo ver), /home/my-profile, /home/settings

❌ Todas las rutas administrativas
❌ /home/players, /home/sessions, /home/payments (admin)
```

---

### 👤 JUGADOR (`player`)

**Prioridad:** 10
**Icono:** Users
**Descripción:** Ver sus propias sesiones, pagos y documentos.

#### Resumen de Acceso por Módulo

| # | Módulo | Acceso | Puede hacer |
|---|--------|--------|-------------|
| 1 | **Club** | 🟡 Ver | Ver información básica |
| 2 | **Categorías** | ❌ No | Sin acceso |
| 3 | **Jugadores** | ❌ No | Sin acceso (ve su perfil en Mi Perfil) |
| 4 | **Entrenadores** | ❌ No | Sin acceso |
| 5 | **Ubicaciones** | 🟡 Ver | Ver sedes de sus entrenamientos |
| 6 | **Sesiones** | 🟡 Ver | Ver sus propias sesiones |
| 7 | **Cobros** | ❌ No | Sin acceso |
| 8 | **Descuentos** | ❌ No | Sin acceso |
| 9 | **Pagos** | 🟢 Ver + Crear | Ver estado de cuenta y registrar sus pagos |
| 10 | **Calendario** | 🟡 Ver | Ver eventos donde está invitado |
| 11 | **Reportes** | ❌ No | Sin acceso |
| 12 | **Documentos** | 🟢 Ver + Crear | Subir sus propios documentos |
| 13 | **Comunicaciones** | 🟡 Ver | Ver mensajes recibidos |
| 14 | **Configuración** | ❌ No | Sin acceso |

#### Módulos Exclusivos para Jugadores

| Módulo | Acceso | Funcionalidad |
|--------|--------|---------------|
| **Mi Perfil** | ✅ Ver | Ver sus datos personales, médicos, deportivos |
| **Mis Pagos** | ✅ Ver + Crear | Ver pendientes, registrar pagos, subir comprobantes |
| **Mis Documentos** | ✅ Ver + Crear | Ver y subir sus documentos |

#### Rutas Accesibles

```
✅ /home/dashboard, /home/my-profile, /home/my-payments
✅ /home/my-documents, /home/calendar (solo ver), /home/settings

❌ Todas las rutas administrativas
❌ /home/players, /home/sessions (admin), /home/payments (admin)
```

---

### 👑 PROPIETARIO (`owner`)

**Prioridad:** 100
**Icono:** Building2
**Descripción:** Dueño del club. Acceso total sin restricciones.

#### Acceso

| Módulo | Acceso |
|--------|--------|
| **TODOS** | ✅ Full |

El propietario tiene acceso **completo** a todas las funcionalidades:
- ✅ CRUD completo en todos los módulos (incluyendo eliminar)
- ✅ Configuración del club
- ✅ Gestión de suscripción
- ✅ Personalizar permisos de otros roles
- ✅ Invitar/remover cualquier miembro
- ✅ Acceso a todas las rutas

#### Rutas Exclusivas del Owner

```
✅ /home/subscription        → Gestionar plan de suscripción
✅ /home/settings            → Configuración avanzada del club
✅ /home/role-permissions    → Personalizar permisos por rol
✅ /home/create-club-team/:id → Editar datos del club
```

---

## MÓDULOS DEL SISTEMA

### Estado verificado de Widdo Clubs — 17 de julio de 2026

La clasificación exige correspondencia entre backend, frontend y pruebas. La
presencia de una ruta o pantalla por sí sola no se considera módulo terminado.
Academy y Tournaments no forman parte de esta revisión.

| Área | Backend | Frontend | Prueba directa | Estado |
|------|---------|----------|----------------|--------|
| Auth, contextos, RBAC y multi-tenant | ✅ | ✅ | ✅ | Verificado |
| Club y equipo de trabajo | ✅ | ✅ | ✅ parcial | Implementado |
| Jugadores | ✅ | ✅ | 🟡 CRUD legacy parcialmente omitido | Cobertura pendiente |
| Categorías y entrenadores | ✅ | ✅ | 🟡 acceso/aislamiento, no CRUD completo | Cobertura pendiente |
| Sesiones, calendario y asistencia | ✅ | ✅ | 🟡 store, QR y aislamiento | Cobertura pendiente |
| Cobros y descuentos | ✅ | ✅ | 🟡 permisos/aislamiento | Cobertura pendiente |
| Pagos | ✅ | ✅ | 🟡 estadísticas y suscripción; escenarios legacy omitidos | Cobertura pendiente |
| Suscripciones | ✅ | ✅ | ✅ | Verificado |
| Documentos, consentimientos y credenciales | ✅ | ✅ | ✅ | Verificado técnicamente |
| Gastos | ✅ | ✅ | ❌ | No certificado |
| Inventario | ✅ | ✅ | ❌ | No certificado |
| Enrollment público y links | ✅ | ✅ | ❌ directa | No certificado |
| Import/export | ✅ | ✅ | ❌ | No certificado |
| Reportes financieros | ✅ PDF/Excel | ✅ | ✅ roles y descargas | Verificado |
| Reportes generales | ✅ consolidados por rol | ✅ redirecciones legacy | ✅ contrato de rutas | Verificado |
| Notificaciones programadas | ✅ jobs/scheduler | ✅ | ✅ enfocada | Verificado en Clubs |
| Preferencias push/email | ✅ `/notification-settings` | ✅ contrato canónico | ✅ | Verificado |
| Alertas de asistencia a padres | ✅ eventos y entrenamientos | ✅ Web Push/FCM/Expo/email según preferencias | ✅ | Verificado |
| Comunicaciones WhatsApp automáticas | ❌ solo enlaces `wa.me` | N/A | ❌ | No implementado |
| IA de soporte/club | ✅ | ✅ | 🟡 tools con proveedores simulados | Implementado parcialmente |

Prioridad de cierre restante: cobertura de gastos/inventario/import-export/
enrollment; después CRUD faltantes.

### Módulos en Sistema de Permisos (14 módulos)

Estos módulos están definidos en `ClubRolePermission.php` y pueden ser personalizados por el propietario del club para cada rol.

| # | Módulo | Key | Descripción | Acciones | Icono |
|---|--------|-----|-------------|----------|-------|
| 1 | **Club/Equipo** | `club` | Configuración general del club, datos básicos, logo, información de contacto | view, update, manage | building |
| 2 | **Categorías** | `categories` | Grupos de edad/nivel para organizar jugadores (Sub-8, Sub-12, etc.) | view, create, update, delete | graduation-cap |
| 3 | **Jugadores** | `players` | Gestión completa de jugadores: datos personales, médicos, deportivos, documentos | view, create, update, delete, export | users |
| 4 | **Entrenadores** | `trainers` | Gestión de entrenadores del club: asignación a categorías, datos de contacto | view, create, update, delete | user-check |
| 5 | **Ubicaciones/Sedes** | `locations` | Lugares de entrenamiento: canchas, gimnasios, direcciones, horarios disponibles | view, create, update, delete | map-pin |
| 6 | **Sesiones** | `sessions` | Entrenamientos programados: horarios, categorías, ubicación, asistencia | view, create, update, delete | dumbbell |
| 7 | **Cobros** | `charges` | Conceptos de cobro: mensualidades, uniformes, torneos, inscripciones | view, create, update, delete | dollar-sign |
| 8 | **Descuentos** | `discounts` | Descuentos aplicables: hermanos, pronto pago, becas, porcentajes/montos fijos | view, create, update, delete | badge-dollar-sign |
| 9 | **Pagos** | `payments` | Registro y seguimiento de pagos: cuotas, comprobantes, estados, verificación | view, create, update, delete, verify | hand-coins |
| 10 | **Calendario** | `calendar` | Eventos del club: partidos, torneos, reuniones, actividades especiales | view, create, update, delete | calendar |
| 11 | **Reportes** | `reports` | Informes y estadísticas: asistencia, pagos, jugadores activos | view, export | file-text |
| 12 | **Documentos** | `documents` | Gestión de documentos: cédulas, EPS, certificados médicos, autorizaciones | view, create, update, delete, verify | folder-open |
| 13 | **Comunicaciones** | `communications` | Envío de mensajes: emails masivos, notificaciones, anuncios | view, send | mail |
| 14 | **Configuración** | `settings` | Ajustes del club: métodos de pago, plantillas, preferencias | view, update | settings |

### Archivos de Definición:
- **Frontend:** `/frontend/src/constants/modules.js`
- **Backend:** `/saas_sport/app/Models/ClubRolePermission.php`

---

### Módulos Adicionales (Páginas sin sistema de permisos granular)

Estos módulos existen como páginas pero no están integrados al sistema de permisos personalizables. Se controlan mediante Guards de ruta.

| # | Módulo | Key Sugerido | Ruta | Guard | Descripción |
|---|--------|--------------|------|-------|-------------|
| 15 | **Inventario** | `inventory` | `/home/inventory` | AdminRouteGuard | Gestión de uniformes, equipamiento, tallas. Control de stock y entregas a jugadores. |
| 16 | **Gastos** | `expenses` | `/home/expenses` | FinancialRouteGuard | Registro de gastos del club: alquiler canchas, materiales, transporte, otros. |
| 17 | **Torneos** | `tournaments` | `/home/tournaments/*` | AdminRouteGuard | Gestión de torneos y competencias: inscripción, brackets, resultados, jugadores convocados. |
| 18 | **Equipo del Club** | `team_members` | `/home/team-members` | AdminRouteGuard | Staff y miembros del club: administradores, entrenadores, contadores asignados. Invitaciones. |
| 19 | **Links de Inscripción** | `enrollment_links` | `/home/enrollment-links` | AdminRouteGuard | Generación de enlaces públicos para inscripción de nuevos jugadores sin cuenta. |
| 20 | **Permisos de Rol** | `role_permissions` | `/home/role-permissions` | OwnerOnlyGuard | Personalización de permisos por rol. Solo propietario (+ admin opcional). |
| 21 | **Config. de Pagos** | `payment_settings` | `/home/payment-settings` | FinancialRouteGuard | Métodos de pago aceptados, cuentas bancarias, configuración de mora. |
| 22 | **Documentos Legales** | `legal_documents` | `/home/legal-documents` | AdminRouteGuard | Documentos requeridos del club: reglamento, políticas, contratos tipo. |
| 23 | **Plantilla Consentimiento** | `consent_template` | `/home/consent-template` | AdminRouteGuard | Configuración del formulario de consentimiento para inscripción de jugadores. |
| 24 | **Reportes Financieros** | `financial_reports` | `/home/financial-reports` | FinancialRouteGuard | Reportes específicos de finanzas: ingresos, gastos, balance, proyecciones. |
| 25 | **Asistencia** | `attendance` | `/home/attendance` | TrainerRouteGuard | Control de asistencia a sesiones. Registro de presentes, ausentes, justificaciones. |
| 26 | **Suscripción** | `subscription` | `/home/subscription` | OwnerOnlyGuard | Gestión del plan de suscripción del club. Solo propietario. |
| 27 | **Mis Hijos** | `my_children` | `/home/my-children` | ParentOnlyGuard | Vista de padres para ver y gestionar información de sus hijos registrados. |
| 28 | **Mis Pagos** | `my_payments` | `/home/my-payments` | PlayerOrParentGuard | Historial y registro de pagos propios (jugador) o de hijos (padre). |
| 29 | **Mis Documentos** | `my_documents` | `/home/my-documents` | PlayerOrParentGuard | Documentos personales del jugador o de los hijos del padre. |
| 30 | **Sesiones de Hijos** | `children_sessions` | `/home/children-sessions` | ParentOnlyGuard | Calendario de sesiones donde participan los hijos del padre. |

---

### Módulos de Backend (Sin página directa)

Funcionalidades que existen en el backend pero no tienen página dedicada en el frontend (se usan como parte de otros módulos):

| # | Módulo | Controller | Descripción |
|---|--------|------------|-------------|
| 31 | **Cuotas de Pago** | `PlaClubTeamPaymentInstallmentController` | Gestión de pagos en cuotas. Parte del módulo de pagos. |
| 32 | **Niveles de Mora** | `PlaClubTeamLateFeeTierController` | Configuración de porcentajes de mora escalonados. |
| 33 | **Descuentos Familiares** | `PlaClubTeamFamilyDiscountController` | Descuentos automáticos por hermanos inscritos. |
| 34 | **Exenciones de Jugador** | `PlaClubTeamPlayerExemptionController` | Exenciones de cobros específicos para jugadores (becas). |
| 35 | **Invitaciones** | `InvitationController` | Sistema de invitaciones a jugadores, entrenadores, padres. |
| 36 | **Carnet de Jugador** | `PlayerCardController` | Generación de carnets/credenciales de jugadores. |
| 37 | **Notificaciones** | `NotificationController` | Sistema de notificaciones push y en app. |
| 38 | **Eventos** | `EventController` | API de eventos del calendario con participantes. |
| 39 | **Autorizaciones de Datos** | `DataTreatmentAuthorizationController` | Consentimientos y autorizaciones GDPR/Habeas Data. |
| 40 | **Relación Padre-Hijo** | `ParentChildController` | Vinculación de padres con jugadores menores. |

---

## DETALLE DE FUNCIONALIDADES POR MÓDULO Y ROL

### 1. CLUB/EQUIPO (`club`)

**Descripción:** Configuración general del club deportivo.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Ver información del club | Nombre, logo, deporte, país, ciudad, datos de contacto |
| Editar datos básicos | Modificar nombre, descripción, teléfono, email, redes sociales |
| Cambiar logo | Subir/actualizar imagen del club |
| Gestionar deportes | Agregar o cambiar deportes que maneja el club |
| Ver estadísticas | Total jugadores, entrenadores, categorías activas |

**Acceso por rol:**
| Rol | Ver | Editar | Gestionar | Qué puede hacer específicamente |
|-----|-----|--------|-----------|--------------------------------|
| Owner | ✅ | ✅ | ✅ | Todo: editar datos, logo, deportes, eliminar club |
| Admin | ✅ | ✅ | ❌ | Ver y editar información del club. NO eliminar |
| Accountant | ✅ | ❌ | ❌ | Solo ver información del club |
| Trainer | ✅ | ❌ | ❌ | Solo ver información del club |
| Parent | ✅ | ❌ | ❌ | Solo ver información básica |
| Player | ✅ | ❌ | ❌ | Solo ver información básica |

---

### 2. CATEGORÍAS (`categories`)

**Descripción:** Grupos para organizar jugadores por edad o nivel.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Listar categorías | Ver todas las categorías del club (Sub-8, Sub-12, Adultos, etc.) |
| Crear categoría | Nueva categoría con nombre, rango de edad, nivel, color |
| Editar categoría | Modificar nombre, edades, entrenadores asignados |
| Eliminar categoría | Borrar categoría (solo si no tiene jugadores) |
| Asignar entrenadores | Vincular entrenadores a cada categoría |
| Ver jugadores | Lista de jugadores en cada categoría |

**Acceso por rol:**
| Rol | Ver | Crear | Editar | Eliminar | Qué puede hacer específicamente |
|-----|-----|-------|--------|----------|--------------------------------|
| Owner | ✅ | ✅ | ✅ | ✅ | Todo: crear, editar, eliminar categorías |
| Admin | ✅ | ✅ | ✅ | ❌ | Crear y editar categorías, no eliminar |
| Accountant | ❌ | ❌ | ❌ | ❌ | Sin acceso |
| Trainer | ✅ | ❌ | ❌ | ❌ | Solo ver categorías asignadas |
| Parent | ❌ | ❌ | ❌ | ❌ | Sin acceso |
| Player | ❌ | ❌ | ❌ | ❌ | Sin acceso |

---

### 3. JUGADORES (`players`)

**Descripción:** Gestión completa de deportistas del club.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Listar jugadores | Tabla con todos los jugadores, filtros por categoría, estado |
| Crear jugador | Formulario completo: datos personales, médicos, deportivos |
| Editar jugador | Modificar cualquier información del jugador |
| Ver perfil completo | Datos personales, médicos, documentos, pagos, asistencia |
| Eliminar jugador | Dar de baja (soft delete) |
| Exportar listado | Descargar Excel/PDF con lista de jugadores |
| Subir foto | Agregar foto de perfil del jugador |
| Ver documentos | Cédula, EPS, certificados médicos |
| Ver historial de pagos | Pagos realizados y pendientes del jugador |
| Ver asistencia | Porcentaje y detalle de asistencias |

**Acceso por rol:**
| Rol | Ver | Crear | Editar | Eliminar | Exportar | Qué puede hacer específicamente |
|-----|-----|-------|--------|----------|----------|--------------------------------|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ | Todo: CRUD completo + exportar |
| Admin | ✅ | ✅ | ✅ | ❌ | ✅ | Crear, editar, exportar. No eliminar |
| Accountant | ✅ | ❌ | ❌ | ❌ | ✅ | Solo ver lista y exportar para cobros |
| Trainer | ✅ | ❌ | ✅ | ❌ | ❌ | Ver jugadores de sus categorías, editar asistencia |
| Parent | ✅* | ❌ | ❌ | ❌ | ❌ | *Solo ver perfil de sus hijos |
| Player | ❌ | ❌ | ❌ | ❌ | ❌ | Sin acceso a lista (ve su perfil en Mi Perfil) |

---

### 4. ENTRENADORES (`trainers`)

**Descripción:** Gestión del cuerpo técnico del club.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Listar entrenadores | Tabla con entrenadores activos |
| Crear entrenador | Invitar nuevo entrenador por email |
| Editar entrenador | Modificar datos, categorías asignadas |
| Eliminar entrenador | Remover del club |
| Asignar categorías | Vincular entrenador a categorías |
| Ver estadísticas | Sesiones dirigidas, asistencia de sus grupos |

**Acceso por rol:**
| Rol | Ver | Crear | Editar | Eliminar | Qué puede hacer específicamente |
|-----|-----|-------|--------|----------|--------------------------------|
| Owner | ✅ | ✅ | ✅ | ✅ | Todo: invitar, editar, remover entrenadores |
| Admin | ✅ | ✅ | ✅ | ❌ | Ver, invitar y editar entrenadores. NO eliminar |
| Accountant | ❌ | ❌ | ❌ | ❌ | Sin acceso |
| Trainer | ❌ | ❌ | ❌ | ❌ | Sin acceso (ve su perfil propio) |
| Parent | ❌ | ❌ | ❌ | ❌ | Sin acceso |
| Player | ❌ | ❌ | ❌ | ❌ | Sin acceso |

---

### 5. UBICACIONES/SEDES (`locations`)

**Descripción:** Lugares de entrenamiento y competencia.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Listar sedes | Canchas, gimnasios, instalaciones |
| Crear sede | Nueva ubicación con dirección, capacidad, horarios |
| Editar sede | Modificar datos, disponibilidad |
| Eliminar sede | Borrar ubicación |
| Ver en mapa | Geolocalización de la sede |
| Asignar a sesiones | Vincular sede a entrenamientos |

**Acceso por rol:**
| Rol | Ver | Crear | Editar | Eliminar | Qué puede hacer específicamente |
|-----|-----|-------|--------|----------|--------------------------------|
| Owner | ✅ | ✅ | ✅ | ✅ | Todo: CRUD completo de sedes |
| Admin | ✅ | ✅ | ✅ | ❌ | Ver, crear y editar sedes. NO eliminar |
| Accountant | ❌ | ❌ | ❌ | ❌ | Sin acceso |
| Trainer | ✅ | ❌ | ❌ | ❌ | Solo ver sedes disponibles |
| Parent | ✅ | ❌ | ❌ | ❌ | Ver sedes donde entrenan sus hijos |
| Player | ✅ | ❌ | ❌ | ❌ | Ver sedes de sus entrenamientos |

---

### 6. SESIONES (`sessions`)

**Descripción:** Entrenamientos programados del club.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Listar sesiones | Calendario de entrenamientos |
| Crear sesión | Nueva sesión: fecha, hora, categoría, ubicación, entrenador |
| Editar sesión | Modificar datos, reagendar |
| Eliminar sesión | Cancelar entrenamiento |
| Tomar asistencia | Marcar presentes/ausentes |
| Ver asistencia histórica | Registro de asistencias pasadas |
| Duplicar sesión | Crear sesión recurrente |

**Acceso por rol:**
| Rol | Ver | Crear | Editar | Eliminar | Asistencia | Qué puede hacer específicamente |
|-----|-----|-------|--------|----------|------------|--------------------------------|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ | Todo: CRUD + tomar asistencia |
| Admin | ✅ | ✅ | ✅ | ❌ | ✅ | Crear, editar sesiones, tomar asistencia |
| Accountant | ❌ | ❌ | ❌ | ❌ | ❌ | Sin acceso |
| Trainer | ✅ | ✅ | ✅ | ✅ | ✅ | CRUD de sus sesiones + asistencia |
| Parent | ✅ | ❌ | ❌ | ❌ | ❌ | Ver sesiones de sus hijos |
| Player | ✅ | ❌ | ❌ | ❌ | ❌ | Ver sus propias sesiones |

---

### 7. COBROS (`charges`)

**Descripción:** Conceptos de cobro del club (qué se cobra).

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Listar cobros | Mensualidad, uniforme, inscripción, torneo, etc. |
| Crear cobro | Nuevo concepto con monto, frecuencia, aplica a quién |
| Editar cobro | Modificar monto, nombre, configuración |
| Eliminar cobro | Desactivar concepto |
| Configurar recurrencia | Cobro mensual, único, anual |
| Asignar a categorías | Cobros específicos por categoría |

**Acceso por rol:**
| Rol | Ver | Crear | Editar | Eliminar | Qué puede hacer específicamente |
|-----|-----|-------|--------|----------|--------------------------------|
| Owner | ✅ | ✅ | ✅ | ✅ | Todo: crear y gestionar conceptos de cobro |
| Admin | ✅ | ✅ | ✅ | ❌ | Crear y editar cobros |
| Accountant | ✅ | ✅ | ✅ | ❌ | Crear y editar cobros |
| Trainer | ❌ | ❌ | ❌ | ❌ | Sin acceso |
| Parent | ❌ | ❌ | ❌ | ❌ | Sin acceso (ve cobros en Mis Pagos) |
| Player | ❌ | ❌ | ❌ | ❌ | Sin acceso (ve cobros en Mis Pagos) |

---

### 8. DESCUENTOS (`discounts`)

**Descripción:** Descuentos aplicables a pagos.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Listar descuentos | Hermanos, pronto pago, becas, promociones |
| Crear descuento | Nuevo descuento: porcentaje o monto fijo |
| Editar descuento | Modificar valor, vigencia |
| Eliminar descuento | Desactivar descuento |
| Configurar condiciones | Automático o manual, fechas de vigencia |
| Asignar a jugadores | Descuentos específicos por jugador |

**Acceso por rol:**
| Rol | Ver | Crear | Editar | Eliminar | Qué puede hacer específicamente |
|-----|-----|-------|--------|----------|--------------------------------|
| Owner | ✅ | ✅ | ✅ | ✅ | Todo: gestionar descuentos |
| Admin | ✅ | ✅ | ✅ | ❌ | Crear y editar descuentos |
| Accountant | ✅ | ✅ | ✅ | ❌ | Crear y editar descuentos |
| Trainer | ❌ | ❌ | ❌ | ❌ | Sin acceso |
| Parent | ❌ | ❌ | ❌ | ❌ | Sin acceso |
| Player | ❌ | ❌ | ❌ | ❌ | Sin acceso |

---

### 9. PAGOS (`payments`)

**Descripción:** Registro y seguimiento de pagos.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Listar pagos | Todos los pagos del club con filtros |
| Registrar pago | Nuevo pago: jugador, monto, concepto, comprobante |
| Editar pago | Modificar datos del pago |
| Eliminar pago | Anular pago |
| Verificar pago | Aprobar/rechazar comprobante |
| Ver pendientes | Pagos vencidos o por cobrar |
| Generar cuotas | Dividir pago en installments |
| Subir comprobante | Adjuntar recibo de pago |
| Enviar recordatorio | Notificar pago pendiente |

**Acceso por rol:**
| Rol | Ver | Crear | Editar | Eliminar | Verificar | Qué puede hacer específicamente |
|-----|-----|-------|--------|----------|-----------|--------------------------------|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ | Todo: CRUD + verificar pagos |
| Admin | ✅ | ✅ | ✅ | ❌ | ✅ | Registrar, editar, verificar pagos |
| Accountant | ✅ | ✅ | ✅ | ❌ | ✅ | Registrar, editar, verificar pagos |
| Trainer | ❌ | ❌ | ❌ | ❌ | ❌ | Sin acceso |
| Parent | ✅* | ✅* | ❌ | ❌ | ❌ | *Ver y registrar pagos de sus hijos |
| Player | ✅* | ✅* | ❌ | ❌ | ❌ | *Ver y registrar sus propios pagos |

---

### 10. CALENDARIO/EVENTOS (`calendar`)

**Descripción:** Eventos del club más allá de entrenamientos.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Ver calendario | Vista mensual/semanal de eventos |
| Crear evento | Partido, torneo, reunión, actividad especial |
| Editar evento | Modificar fecha, hora, descripción |
| Eliminar evento | Cancelar evento |
| Invitar participantes | Seleccionar quién está invitado |
| Subir imagen/flyer | Adjuntar material visual |
| Agregar video | Link de YouTube/Vimeo |
| Enviar invitaciones | Notificar a participantes |
| Confirmar asistencia | RSVP de invitados |

**Acceso por rol:**
| Rol | Ver | Crear | Editar | Eliminar | Qué puede hacer específicamente |
|-----|-----|-------|--------|----------|--------------------------------|
| Owner | ✅ | ✅ | ✅ | ✅ | Todo: CRUD de eventos |
| Admin | ✅ | ✅ | ✅ | ❌ | Crear y editar eventos |
| Accountant | ❌ | ❌ | ❌ | ❌ | Sin acceso |
| Trainer | ✅ | ✅ | ✅ | ❌ | Crear eventos de su categoría |
| Parent | ✅ | ❌ | ❌ | ❌ | Ver eventos donde participan sus hijos |
| Player | ✅ | ❌ | ❌ | ❌ | Ver eventos donde está invitado |

---

### 11. REPORTES (`reports`)

**Descripción:** Informes y estadísticas del club.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Ver dashboard | Métricas principales del club |
| Reporte de asistencia | Porcentajes por jugador, categoría, período |
| Reporte de pagos | Ingresos, pendientes, morosos |
| Reporte de jugadores | Activos, nuevos, bajas |
| Exportar PDF | Descargar reporte en PDF |
| Exportar Excel | Descargar datos en hoja de cálculo |
| Filtrar por fechas | Rango de tiempo personalizado |

**Acceso por rol:**
| Rol | Ver | Exportar | Qué puede hacer específicamente |
|-----|-----|----------|--------------------------------|
| Owner | ✅ | ✅ | Todos los reportes + exportar |
| Admin | ✅ | ✅ | Todos los reportes + exportar |
| Accountant | ✅ | ✅ | Reportes financieros + exportar |
| Trainer | ✅ | ❌ | Reportes de asistencia de sus categorías |
| Parent | ❌ | ❌ | Sin acceso |
| Player | ❌ | ❌ | Sin acceso |

---

### 12. DOCUMENTOS (`documents`)

**Descripción:** Archivos y documentación de jugadores.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Ver documentos | Lista de documentos por jugador |
| Subir documento | Cargar cédula, EPS, certificado médico |
| Editar documento | Reemplazar archivo |
| Eliminar documento | Borrar documento |
| Verificar documento | Aprobar/rechazar documento subido |
| Descargar documento | Bajar archivo original |
| Ver estado | Pendiente, verificado, rechazado |

**Acceso por rol:**
| Rol | Ver | Subir | Editar | Eliminar | Verificar | Qué puede hacer específicamente |
|-----|-----|-------|--------|----------|-----------|--------------------------------|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ | Todo: CRUD + verificar |
| Admin | ✅ | ✅ | ✅ | ❌ | ✅ | Subir, editar, verificar |
| Accountant | ✅ | ❌ | ❌ | ❌ | ❌ | Solo ver documentos |
| Trainer | ✅ | ❌ | ❌ | ❌ | ❌ | Ver documentos de sus jugadores |
| Parent | ✅* | ✅* | ❌ | ❌ | ❌ | *Subir documentos de sus hijos |
| Player | ✅* | ✅* | ❌ | ❌ | ❌ | *Subir sus propios documentos |

---

### 13. COMUNICACIONES (`communications`)

**Descripción:** Mensajería y notificaciones del club.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Ver bandeja | Historial de comunicaciones enviadas |
| Enviar email masivo | Mensaje a todos o grupo específico |
| Enviar notificación | Push notification a la app |
| Seleccionar destinatarios | Por categoría, rol, individual |
| Usar plantillas | Mensajes predefinidos |
| Ver estadísticas | Abiertos, clicks, entregas |

**Acceso por rol:**
| Rol | Ver | Enviar | Qué puede hacer específicamente |
|-----|-----|--------|--------------------------------|
| Owner | ✅ | ✅ | Enviar a cualquier miembro del club |
| Admin | ✅ | ✅ | Enviar comunicaciones |
| Accountant | ✅ | ❌ | Solo ver historial |
| Trainer | ✅ | ✅ | Enviar a jugadores de sus categorías |
| Parent | ✅ | ❌ | Solo ver mensajes recibidos |
| Player | ✅ | ❌ | Solo ver mensajes recibidos |

---

### 14. CONFIGURACIÓN (`settings`)

**Descripción:** Ajustes avanzados del club.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Métodos de pago | Configurar cuentas bancarias, Nequi, efectivo |
| Configuración de mora | Porcentajes y días de gracia |
| Plantillas de email | Personalizar mensajes automáticos |
| Zona horaria | Configurar timezone del club |
| Moneda | Seleccionar moneda (COP, USD, etc.) |
| Preferencias de notificación | Qué notificaciones enviar |

**Acceso por rol:**
| Rol | Ver | Editar | Qué puede hacer específicamente |
|-----|-----|--------|--------------------------------|
| Owner | ✅ | ✅ | Acceso total a configuración |
| Admin | ✅ | ❌ | Solo ver configuración. NO editar |
| Accountant | ❌ | ❌ | Sin acceso |
| Trainer | ❌ | ❌ | Sin acceso |
| Parent | ❌ | ❌ | Sin acceso |
| Player | ❌ | ❌ | Sin acceso |

---

### 15. INVENTARIO (`inventory`)

**Descripción:** Control de uniformes y equipamiento.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Listar inventario | Uniformes, balones, conos, etc. |
| Agregar ítem | Nuevo artículo con stock |
| Editar ítem | Modificar cantidad, precio |
| Registrar entrega | Marcar entrega a jugador |
| Control de tallas | Stock por talla (S, M, L, XL) |
| Historial de entregas | Quién recibió qué |

**Acceso por rol:**
| Rol | Acceso | Qué puede hacer específicamente |
|-----|--------|--------------------------------|
| Owner | ✅ Full | Todo: CRUD de inventario |
| Admin | ✅ Full | Gestionar inventario y entregas |
| Accountant | ✅ Ver | Ver inventario para valorización |
| Trainer | ✅ Ver | Ver inventario disponible |
| Parent | ❌ | Sin acceso |
| Player | ❌ | Sin acceso |

---

### 16. GASTOS (`expenses`)

**Descripción:** Egresos y gastos del club.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Listar gastos | Todos los egresos del club |
| Registrar gasto | Nuevo gasto: concepto, monto, fecha, comprobante |
| Editar gasto | Modificar información |
| Eliminar gasto | Anular registro |
| Categorizar | Tipo: alquiler, materiales, transporte, etc. |
| Adjuntar factura | Subir comprobante |
| Ver balance | Ingresos vs gastos |

**Acceso por rol:**
| Rol | Acceso | Qué puede hacer específicamente |
|-----|--------|--------------------------------|
| Owner | ✅ Full | Todo: CRUD de gastos |
| Admin | ✅ Full | Registrar y editar gastos |
| Accountant | ✅ Full | Gestión completa de gastos |
| Trainer | ❌ | Sin acceso |
| Parent | ❌ | Sin acceso |
| Player | ❌ | Sin acceso |

---

### 17. TORNEOS (`tournaments`)

**Descripción:** Competencias y eventos deportivos.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Listar torneos | Competencias activas y pasadas |
| Crear torneo | Nuevo torneo: nombre, fechas, categorías, sede |
| Editar torneo | Modificar información |
| Eliminar torneo | Cancelar torneo |
| Inscribir jugadores | Convocar jugadores al torneo |
| Gestionar brackets | Llaves y enfrentamientos |
| Registrar resultados | Marcadores de partidos |
| Documentos requeridos | Configurar qué documentos pedir |

**Acceso por rol:**
| Rol | Acceso | Qué puede hacer específicamente |
|-----|--------|--------------------------------|
| Owner | ✅ Full | Todo: CRUD de torneos |
| Admin | ✅ Full | Crear y gestionar torneos |
| Accountant | ❌ | Sin acceso |
| Trainer | ✅ Ver | Ver torneos y convocados |
| Parent | ✅ Ver | Ver torneos donde participan hijos |
| Player | ✅ Ver | Ver torneos donde está convocado |

---

### 18. EQUIPO DEL CLUB (`team_members`)

**Descripción:** Staff y miembros administrativos.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Ver miembros | Lista de administradores, entrenadores, contadores |
| Invitar miembro | Enviar invitación por email |
| Asignar rol | Definir permisos del nuevo miembro |
| Editar rol | Cambiar rol de un miembro |
| Remover miembro | Quitar acceso al club |
| Ver estado invitación | Pendiente, aceptada, expirada |

**Acceso por rol:**
| Rol | Acceso | Qué puede hacer específicamente |
|-----|--------|--------------------------------|
| Owner | ✅ Full | Invitar, editar roles, remover |
| Admin | ✅ Ver | Ver lista del equipo |
| Accountant | ❌ | Sin acceso |
| Trainer | ❌ | Sin acceso |
| Parent | ❌ | Sin acceso |
| Player | ❌ | Sin acceso |

---

### 19. LINKS DE INSCRIPCIÓN (`enrollment_links`)

**Descripción:** Enlaces públicos para registro de jugadores.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Listar links | Enlaces activos y expirados |
| Crear link | Nuevo link para categoría específica |
| Configurar campos | Qué datos pedir en el formulario |
| Configurar pagos | Si requiere pago inicial |
| Copiar link | Obtener URL para compartir |
| Desactivar link | Pausar inscripciones |
| Ver inscritos | Jugadores que usaron el link |

**Acceso por rol:**
| Rol | Acceso | Qué puede hacer específicamente |
|-----|--------|--------------------------------|
| Owner | ✅ Full | Crear y gestionar links |
| Admin | ✅ Full | Crear y gestionar links |
| Accountant | ❌ | Sin acceso |
| Trainer | ❌ | Sin acceso |
| Parent | ❌ | Sin acceso |
| Player | ❌ | Sin acceso |

---

### 20. PERMISOS DE ROL (`role_permissions`)

**Descripción:** Personalización de permisos por rol.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Ver permisos actuales | Matriz de permisos por rol |
| Editar permisos | Activar/desactivar permisos específicos |
| Habilitar módulos | Mostrar/ocultar módulos por rol |
| Restaurar default | Volver a permisos predeterminados |

**Acceso por rol:**
| Rol | Acceso | Qué puede hacer específicamente |
|-----|--------|--------------------------------|
| Owner | ✅ Full | Personalizar todos los permisos |
| Admin | ✅ Full* | *Si el owner lo permite |
| Accountant | ❌ | Sin acceso |
| Trainer | ❌ | Sin acceso |
| Parent | ❌ | Sin acceso |
| Player | ❌ | Sin acceso |

---

### 21. CONFIG. DE PAGOS (`payment_settings`)

**Descripción:** Métodos de pago y configuración financiera.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Agregar cuenta bancaria | Datos para transferencias |
| Configurar Nequi/Daviplata | Números para pagos móviles |
| Habilitar efectivo | Permitir pagos en efectivo |
| Configurar mora | Porcentaje y días de gracia |
| Niveles de mora | Escalonamiento de recargos |
| Recordatorios automáticos | Días antes de vencimiento |

**Acceso por rol:**
| Rol | Acceso | Qué puede hacer específicamente |
|-----|--------|--------------------------------|
| Owner | ✅ Full | Configurar todos los métodos |
| Admin | ✅ Ver | Ver configuración |
| Accountant | ✅ Full | Configurar métodos de pago |
| Trainer | ❌ | Sin acceso |
| Parent | ❌ | Sin acceso |
| Player | ❌ | Sin acceso |

---

### 22. DOCUMENTOS LEGALES (`legal_documents`)

**Descripción:** Reglamentos y políticas del club.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Listar documentos | Reglamento, políticas, contratos |
| Subir documento | Cargar PDF de reglamento |
| Editar documento | Reemplazar versión |
| Eliminar documento | Borrar documento |
| Requerir firma | Marcar como obligatorio |
| Ver firmantes | Quién ha aceptado |

**Acceso por rol:**
| Rol | Acceso | Qué puede hacer específicamente |
|-----|--------|--------------------------------|
| Owner | ✅ Full | Gestionar documentos legales |
| Admin | ✅ Full | Subir y gestionar documentos |
| Accountant | ❌ | Sin acceso |
| Trainer | ❌ | Sin acceso |
| Parent | ❌ | Sin acceso (acepta al inscribir) |
| Player | ❌ | Sin acceso (acepta al inscribir) |

---

### 23. PLANTILLA CONSENTIMIENTO (`consent_template`)

**Descripción:** Formulario de autorización para inscripciones.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Ver plantilla actual | Contenido del consentimiento |
| Editar texto | Modificar términos y condiciones |
| Configurar secciones | Tratamiento de datos, imagen, responsabilidad |
| Vista previa | Ver cómo se mostrará |
| Historial de versiones | Cambios realizados |

**Acceso por rol:**
| Rol | Acceso | Qué puede hacer específicamente |
|-----|--------|--------------------------------|
| Owner | ✅ Full | Editar plantilla completa |
| Admin | ✅ Full | Editar plantilla |
| Accountant | ❌ | Sin acceso |
| Trainer | ❌ | Sin acceso |
| Parent | ❌ | Sin acceso |
| Player | ❌ | Sin acceso |

---

### 24. REPORTES FINANCIEROS (`financial_reports`)

**Descripción:** Informes específicos de finanzas.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Reporte de ingresos | Pagos recibidos por período |
| Reporte de gastos | Egresos por categoría |
| Balance general | Ingresos vs gastos |
| Cartera morosa | Pagos pendientes vencidos |
| Proyección de ingresos | Cobros futuros esperados |
| Exportar a Excel | Descargar datos |
| Exportar a PDF | Reporte imprimible |

**Acceso por rol:**
| Rol | Acceso | Qué puede hacer específicamente |
|-----|--------|--------------------------------|
| Owner | ✅ Full | Todos los reportes + exportar |
| Admin | ✅ Full | Todos los reportes + exportar |
| Accountant | ✅ Full | Todos los reportes + exportar |
| Trainer | ❌ | Sin acceso |
| Parent | ❌ | Sin acceso |
| Player | ❌ | Sin acceso |

---

### 25. ASISTENCIA (`attendance`)

**Descripción:** Control de asistencia a entrenamientos.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Ver lista de asistencia | Por sesión y fecha |
| Tomar asistencia | Marcar presente/ausente/justificado |
| Ver historial | Asistencias pasadas |
| Reporte por jugador | Porcentaje de asistencia individual |
| Reporte por categoría | Promedio de asistencia del grupo |
| Justificar ausencia | Agregar motivo |

**Acceso por rol:**
| Rol | Acceso | Qué puede hacer específicamente |
|-----|--------|--------------------------------|
| Owner | ✅ Full | Ver y tomar asistencia de todas las sesiones |
| Admin | ✅ Full | Ver y tomar asistencia |
| Accountant | ❌ | Sin acceso |
| Trainer | ✅ Full | Tomar asistencia de sus sesiones |
| Parent | ✅ Ver | Ver asistencia de sus hijos |
| Player | ✅ Ver | Ver su propia asistencia |

---

### 26. SUSCRIPCIÓN (`subscription`)

**Descripción:** Plan de suscripción de la plataforma.

**Funcionalidades disponibles:**
| Funcionalidad | Descripción |
|---------------|-------------|
| Ver plan actual | Nombre, precio, vencimiento |
| Ver límites | Jugadores, entrenadores, almacenamiento |
| Cambiar plan | Upgrade o downgrade |
| Ver historial de pagos | Facturas de suscripción |
| Cancelar suscripción | Dar de baja el plan |
| Ver facturación | Datos de facturación |

**Acceso por rol:**
| Rol | Acceso | Qué puede hacer específicamente |
|-----|--------|--------------------------------|
| Owner | ✅ Full | Gestionar suscripción completa |
| Admin | ❌ | Sin acceso |
| Accountant | ❌ | Sin acceso |
| Trainer | ❌ | Sin acceso |
| Parent | ❌ | Sin acceso |
| Player | ❌ | Sin acceso |

---

### 27-30. MÓDULOS DE PADRES Y JUGADORES

#### MIS HIJOS (`my_children`) - Solo Parent
| Funcionalidad | Descripción |
|---------------|-------------|
| Ver lista de hijos | Jugadores vinculados al padre |
| Ver perfil del hijo | Datos personales, médicos, deportivos |
| Editar datos básicos | Actualizar teléfono, email de contacto |
| Ver pagos del hijo | Estado de cuenta |
| Ver asistencia | Historial de asistencias |
| Ver documentos | Documentos subidos |

#### MIS PAGOS (`my_payments`) - Parent y Player
| Funcionalidad | Descripción |
|---------------|-------------|
| Ver estado de cuenta | Pagos pendientes y realizados |
| Registrar pago | Subir comprobante de pago |
| Ver historial | Pagos anteriores |
| Ver conceptos | Qué se está cobrando |
| Descargar recibos | Comprobantes de pago |

#### MIS DOCUMENTOS (`my_documents`) - Parent y Player
| Funcionalidad | Descripción |
|---------------|-------------|
| Ver documentos | Lista de documentos subidos |
| Subir documento | Cargar cédula, EPS, certificados |
| Ver estado | Pendiente, aprobado, rechazado |
| Resubir documento | Corregir documento rechazado |

#### SESIONES DE HIJOS (`children_sessions`) - Solo Parent
| Funcionalidad | Descripción |
|---------------|-------------|
| Ver calendario | Sesiones donde participan los hijos |
| Ver horarios | Día, hora, ubicación |
| Ver entrenador | Quién dirige la sesión |

---

## ACCIONES DE PERMISOS

| Acción | Key | Descripción | Módulos que la usan |
|--------|-----|-------------|---------------------|
| **Ver** | `view` | Listar y ver detalles | Todos los módulos |
| **Crear** | `create` | Agregar nuevos registros | categories, players, trainers, locations, sessions, charges, discounts, payments, calendar, documents |
| **Editar** | `update` | Modificar registros existentes | club, categories, players, trainers, locations, sessions, charges, discounts, payments, calendar, documents, settings |
| **Eliminar** | `delete` | Borrar registros | categories, players, trainers, locations, sessions, charges, discounts, payments, calendar, documents |
| **Gestionar** | `manage` | Control total del módulo | club |
| **Exportar** | `export` | Descargar datos en Excel/PDF | players, reports |
| **Verificar** | `verify` | Aprobar/rechazar registros | payments, documents |
| **Enviar** | `send` | Enviar comunicaciones | communications |

---

## MATRIZ DE PERMISOS POR ROL (Configuración por defecto)

### Leyenda:
- ✅ = Todos los permisos
- 🔵 = view, create, update (sin delete)
- 🟡 = Solo view
- 🟢 = view + create
- ❌ = Sin acceso

| Módulo | Owner | Admin | Accountant | Trainer | Parent | Player |
|--------|-------|-------|------------|---------|--------|--------|
| club | ✅ | 🔵 (view+update) | 🟡 | 🟡 | 🟡 | 🟡 |
| categories | ✅ | 🔵 | ❌ | 🟡 | ❌ | ❌ |
| players | ✅ | 🔵+export | 🟡+export | 🟡+update | 🟡 (hijos) | ❌ |
| trainers | ✅ | 🔵 (view+create+update) | ❌ | ❌ | ❌ | ❌ |
| locations | ✅ | 🔵 (view+create+update) | ❌ | 🟡 | 🟡 | 🟡 |
| sessions | ✅ | 🔵 | ❌ | ✅ | 🟡 | 🟡 |
| charges | ✅ | 🔵 | 🔵 | ❌ | ❌ | ❌ |
| discounts | ✅ | 🔵 | 🔵 | ❌ | ❌ | ❌ |
| payments | ✅ | 🔵+verify | 🔵+verify | ❌ | 🟢 | 🟢 |
| calendar | ✅ | 🔵 | ❌ | 🔵 | 🟡 | 🟡 |
| reports | ✅ | 🟡+export | 🟡+export | 🟡 | ❌ | ❌ |
| documents | ✅ | 🔵+verify | 🟡 | 🟡 | 🟢 | 🟢 |
| communications | ✅ | 🟡+send | 🟡 | 🟡+send | 🟡 | 🟡 |
| settings | ✅ | 🟡 (view only) | ❌ | ❌ | ❌ | ❌ |

---

## GUARDS DE PROTECCIÓN (Frontend)

| Guard | Archivo | Roles Permitidos | Descripción |
|-------|---------|------------------|-------------|
| **PrivateRoute** | `components/auth/PrivateRoute.jsx` | Cualquier autenticado | Requiere estar logueado |
| **PublicRoute** | `components/auth/PublicRoute.jsx` | No autenticados | Redirige a dashboard si está logueado |
| **AdminRouteGuard** | `components/guards/AdminRouteGuard.jsx` | owner, admin, trainer, accountant | Rutas administrativas generales |
| **FinancialRouteGuard** | `components/guards/FinancialRouteGuard.jsx` | owner, admin, accountant | Rutas de gestión financiera |
| **TrainerRouteGuard** | `components/guards/TrainerRouteGuard.jsx` | owner, admin, trainer, accountant | Rutas de entrenamiento |
| **OwnerOnlyGuard** | `components/guards/OwnerOnlyGuard.jsx` | owner (+ admin opcional) | Solo propietario |
| **ParentOnlyGuard** | `components/guards/ParentOnlyGuard.jsx` | parent | Solo padres/acudientes |
| **PlayerOrParentGuard** | `components/guards/PlayerOrParentGuard.jsx` | player, parent | Jugadores o padres |
| **SuperAdminGuard** | `components/guards/SuperAdminGuard.jsx` | super_admin | Solo Super Admin de plataforma |
| **RoleGuard** | `components/guards/RoleGuard.jsx` | Configurable | Roles específicos pasados por prop |
| **PermissionGuard** | `components/guards/PermissionGuard.jsx` | Configurable | Permiso específico (module.action) |
| **ModuleGuard** | `components/guards/ModuleGuard.jsx` | Configurable | Módulo habilitado en suscripción |

---

## RUTAS POR GUARD

### AdminRouteGuard
```
/home/enrollment-links     → Links de inscripción
/home/club-team            → Configuración del club
/home/team-members         → Equipo del club
/home/categories           → Categorías
/home/trainers             → Entrenadores
/home/players              → Jugadores
/home/player-create/:id?   → Crear/Editar jugador
/home/player-view/:id      → Ver jugador (solo lectura)
/home/venues               → Sedes/Ubicaciones
/home/inventory            → Inventario
/home/tournaments          → Lista de torneos
/home/tournaments/new      → Crear torneo
/home/tournaments/:id      → Detalle torneo
/home/tournaments/:id/edit → Editar torneo
/home/legal-documents      → Documentos legales
/home/consent-template     → Plantilla consentimiento
```

### FinancialRouteGuard
```
/home/payments             → Gestión de pagos
/home/chargers             → Conceptos de cobro
/home/discounts            → Descuentos
/home/expenses             → Gastos
/home/financial-reports    → Reportes financieros
/home/payment-settings     → Configuración de pagos
/home/reports/income       → Redirección legacy a reportes financieros
/home/reports/pending      → Redirección legacy a reportes financieros
```

### TrainerRouteGuard
```
/home/sessions             → Sesiones de entrenamiento
/home/attendance           → Control de asistencia
/home/reports              → Redirección por rol: financiero o asistencia
/home/trainings            → Entrenamientos (placeholder)
```

### OwnerOnlyGuard
```
/home/subscription              → Plan de suscripción
/home/create-club-team/:id      → Editar club existente
/home/role-permissions          → Permisos por rol (+ Admin)
/home/admin/payment_methods     → Métodos de pago (+ Admin)
/home/admin/roles               → Gestión de roles (+ Admin)
/home/admin/users-roles         → Asignación usuarios-roles (+ Admin)
```

### ParentOnlyGuard
```
/home/my-children          → Mis hijos
/home/my-child-edit/:id    → Editar hijo
/home/children-sessions    → Sesiones de mis hijos
```

### PlayerOrParentGuard
```
/home/my-payments          → Mis pagos
/home/my-documents         → Mis documentos
```

### Sin Guard (Todos autenticados)
```
/home/dashboard            → Dashboard principal
/home/calendar             → Calendario
/home/settings             → Configuración personal
/home/my-profile           → Mi perfil
/home/context-selector     → Selector de club/rol
/home/access-denied        → Página de acceso denegado
/home/create-club-team     → Crear nuevo club (primer club)
```

### SuperAdminGuard (Super Admin de plataforma)
```
/home/admin/clubs              → Administrar clubes
/home/admin/analytics          → Analíticas globales
/home/admin/blog               → Gestión de blog
/home/admin/blog/new           → Crear post
/home/admin/blog/edit/:id      → Editar post
/home/admin/system             → Sistema
/home/admin/system-diagnostics → Diagnósticos
/home/admin/communications     → Comunicaciones masivas
/home/admin/reports            → Reportes globales
/home/admin/subscription-plans → Planes de suscripción
/home/admin/system-settings    → Configuración del sistema
/home/admin/sports             → Gestión de deportes
/home/admin/countries          → Gestión de países
/home/admin/audit-logs         → Logs de auditoría
```

---

## CONTROLADORES DEL BACKEND

### Controladores de Módulos Principales

| Controlador | Módulo | Descripción |
|-------------|--------|-------------|
| `PlaClubTeamController` | club | CRUD de clubes/equipos |
| `PlaClubTeamCategoryController` | categories | CRUD de categorías |
| `PlaClubTeamPlayerController` | players | CRUD de jugadores |
| `PlaClubTeamTrainerController` | trainers | CRUD de entrenadores |
| `PlaClubTeamLocationController` | locations | CRUD de ubicaciones |
| `PlaClubTeamSessionController` | sessions | CRUD de sesiones |
| `PlaClubTeamChargeController` | charges | CRUD de cobros |
| `PlaClubTeamDiscountController` | discounts | CRUD de descuentos |
| `PlaClubTeamPaymentController` | payments | CRUD de pagos |
| `EventController` | calendar | CRUD de eventos |
| `PlayerDocumentController` | documents | CRUD de documentos |

### Controladores Adicionales

| Controlador | Funcionalidad |
|-------------|---------------|
| `PlaClubTeamInventoryController` | Inventario de uniformes/equipos |
| `PlaClubTeamExpenseController` | Gastos del club |
| `PlaTournamentController` | Torneos y competencias |
| `AttendanceController` | Control de asistencia |
| `SessionAttendanceController` | Asistencia por sesión |
| `ConsentTemplateController` | Plantillas de consentimiento |
| `ClubLegalDocumentController` | Documentos legales |
| `PublicEnrollmentLinkController` | Links de inscripción |
| `FinancialReportController` | Reportes financieros |
| `PlaClubTeamPaymentMethodController` | Métodos de pago del club |
| `PlaClubTeamPaymentConfigController` | Configuración de pagos |
| `PlaClubTeamLateFeeTierController` | Niveles de mora |
| `PlaClubTeamFamilyDiscountController` | Descuentos familiares |
| `PlaClubTeamPlayerExemptionController` | Exenciones de jugadores |
| `InvitationController` | Sistema de invitaciones |
| `ParentChildController` | Relación padre-hijo |
| `ClubRolePermissionController` | Permisos por rol |
| `NotificationController` | Notificaciones |
| `DataTreatmentAuthorizationController` | Autorizaciones de datos |
| `PlayerCardController` | Carnets de jugadores |

---

## HOOK DE PERMISOS (Frontend)

Archivo: `/frontend/src/hooks/usePermissions.js`

### Métodos disponibles:

```javascript
const {
  // Verificación básica
  can('module.action'),           // Ej: can('players.create')
  cannot('module.action'),
  canAny(['perm1', 'perm2']),     // OR
  canAll(['perm1', 'perm2']),     // AND

  // Por módulo
  canInModule('players', 'create'),
  canAnyInModule('players', ['create', 'update']),
  canAllInModule('players', ['view', 'update']),
  isModuleEnabled('players'),
  getModulePermissions('players'),

  // Roles
  hasRole('owner'),
  hasAnyRole(['owner', 'admin']),
  hasAllRoles(['owner', 'admin']),

  // Helpers por acción
  canView('players'),
  canCreate('players'),
  canUpdate('players'),
  canDelete('players'),
  canManage('club'),
  canVerify('payments'),
  canExport('reports'),

  // Estado
  isSuperAdmin,
  isAuthenticated,
  isLoading,
  contextInfo,
} = usePermissions();
```

---

## NOTAS IMPORTANTES

1. **Permisos Personalizables**: El propietario puede modificar los permisos por defecto de cada rol desde `/home/role-permissions`.

2. **Prioridad de Permisos**: Los permisos personalizados del club tienen prioridad sobre los permisos globales.

3. **Owner siempre tiene acceso**: El rol `owner` siempre tiene todos los permisos, sin importar la configuración.

4. **Super Admin**: Es un flag especial (`is_super_admin`) que da acceso a la administración de la plataforma, no del club.

5. **Multi-contexto**: Un usuario puede tener diferentes roles en diferentes clubes.

---

## HISTORIAL DE CAMBIOS

| Fecha | Cambio |
|-------|--------|
| 2026-01-25 | Creación inicial del documento con 40 módulos identificados |
| 2026-01-25 | **Actualización de permisos del Administrador**: Ahora es "segundo al mando" con más capacidades. Nuevos permisos: club (update), trainers (create, update), locations (create, update), reports (export), settings (view) |

---

## PENDIENTES DE IMPLEMENTAR

- [ ] Agregar módulos faltantes al sistema de permisos (`inventory`, `expenses`, `tournaments`, etc.)
- [ ] Crear acciones específicas para nuevos módulos
- [ ] Sincronizar `ClubRolePermission.php` con nuevos módulos
- [ ] Actualizar `modules.js` en frontend
