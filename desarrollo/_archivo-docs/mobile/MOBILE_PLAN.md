# WIDDO MOBILE - Plan de Desarrollo React Native (Expo)

**Fecha de inicio:** 18 de Febrero de 2026
**Framework:** React Native con Expo (Expo Router)
**Directorio:** `desarrollo/mobile/`
**Backend:** `desarrollo/saas_sport/` (Laravel - ya preparado para mobile)

---

## Sistema de Diseno (Design System)

Basado en el frontend web (`frontend/tailwind.config.js` + `index.css`) para mantener coherencia visual.

### Colores

```
PRIMARIO:       #16a34a   (verde oscuro - botones, links, tab activo)
SECUNDARIO:     #f0fdf4   (verde muy tenue - fondos alternos)
ACCENT:         #dcfce7   (verde claro - hover, seleccion)
DARK:           #18181b   (casi negro - titulos, texto principal)
MUTED:          #6b7280   (gris medio - texto secundario, placeholders)
WHITE:          #ffffff   (fondos principales)
DESTRUCTIVE:    #dc2626   (rojo - errores, eliminar)
WARNING:        #f59e0b   (amber - alertas, estados pendientes)
INFO:           #3b82f6   (azul - informacion)
SUCCESS:        #16a34a   (verde primario - exito, completado)
```

### Colores por Rol

```
OWNER:       #16a34a / light: #dcfce7   (verde)
TRAINER:     #0891b2 / light: #cffafe   (cyan)
PLAYER:      #7c3aed / light: #ede9fe   (violeta)
PARENT:      #db2777 / light: #fce7f3   (rosa)
ACCOUNTANT:  #64748b / light: #f1f5f9   (slate)
```

### Colores de Estado (Pagos, Cobros, etc.)

```
PAGADO/ACTIVO:     #16a34a  fondo: #dcfce7   (verde)
PENDIENTE:         #f59e0b  fondo: #fef3c7   (amber)
VENCIDO/ERROR:     #dc2626  fondo: #fee2e2   (rojo)
PARCIAL:           #3b82f6  fondo: #dbeafe   (azul)
CANCELADO:         #6b7280  fondo: #f3f4f6   (gris)
```

### Tipografia

```
FUENTE PRINCIPAL:   "Red Hat Display" (misma que el web)
FALLBACK:           System default (San Francisco en iOS, Roboto en Android)

TAMANIOS:
  - Titulo grande:    24px  (fontWeight: 700)
  - Titulo seccion:   20px  (fontWeight: 600)
  - Subtitulo:        18px  (fontWeight: 600)
  - Texto normal:     16px  (fontWeight: 400)
  - Texto secundario: 14px  (fontWeight: 400)
  - Caption/label:    12px  (fontWeight: 500)
  - Badge:            11px  (fontWeight: 600)
```

### Border Radius

```
CARDS/CONTENEDORES:  12px  (redondeado suave)
BOTONES:             8px   (semi-redondeado, coherente con web --radius: 0.5rem)
INPUTS:              8px
BADGES/CHIPS:        16px  (pill shape)
AVATARES:            999px (circulo completo)
```

### Sombras

```
CARD:       0 1px 3px rgba(0,0,0,0.1)
CARD HOVER: 0 4px 6px rgba(0,0,0,0.1)
TAB BAR:    0 -1px 3px rgba(0,0,0,0.08)
MODAL:      0 10px 25px rgba(0,0,0,0.15)
```

### Espaciado Base

```
PADDING PANTALLA:   16px  (horizontal)
PADDING CARD:       16px
GAP ENTRE CARDS:    12px
GAP ENTRE SECCIONES: 24px
MARGEN HEADER:      16px
```

### Decisiones de Diseno

| Aspecto | Decision |
|---------|----------|
| **Dark mode** | Solo modo claro (se agrega despues si se necesita) |
| **Tab Bar** | Iconos + texto siempre visible (estilo Instagram) |
| **Nombre en stores** | "Widdo" |
| **Listas de jugadores** | Cards individuales (foto + nombre + estado) |
| **Logo** | SVG circulo verde (#16a34a) + W blanca |
| **Iconos app** | Ya generados en `frontend/public/icons/` (72-512px) |
| **Splash screen** | Logo Widdo centrado, fondo #16a34a (verde primario) |
| **Onboarding** | 3 slides con iconos simples + texto + boton "Comenzar" |
| **Headers** | Nombre del club a la izquierda + campana notificaciones a la derecha |
| **Botones primarios** | Fondo #16a34a, texto blanco, border-radius 8px |
| **Botones secundarios** | Borde #16a34a, fondo transparente, texto #16a34a |
| **Cards** | Fondo blanco, borde #e5e7eb (gris claro), border-radius 12px, sombra suave |
| **Inputs** | Borde gris, border-radius 8px, focus ring verde |
| **Iconos** | Lucide Icons (misma libreria que el web, version RN: lucide-react-native) |

### Tab Bar Especificacion

```
FONDO:              #ffffff
BORDE SUPERIOR:     1px solid #e5e7eb
SOMBRA:             0 -1px 3px rgba(0,0,0,0.08)
ICONO INACTIVO:     #6b7280 (gris)
TEXTO INACTIVO:     #6b7280 (gris), 11px
ICONO ACTIVO:       #16a34a (verde primario)
TEXTO ACTIVO:       #16a34a (verde primario), 11px, fontWeight: 600
ALTURA:             60px (+ safe area bottom en iOS)
```

### Iconos por Tab (por rol)

**Owner:** Home, Users, CreditCard, Calendar, Menu
**Trainer:** Home, Users, Clock, Calendar, Menu
**Player:** Home, Wallet, Calendar, User
**Parent:** Home, Users, Wallet, Calendar, User
**Accountant:** Home, Receipt, Wallet, BarChart3, Menu

---

## Estado General (Actualizado 23 Feb 2026)

| Fase | Nombre | Estado | Progreso | Notas |
|------|--------|--------|----------|-------|
| 0 | Setup del proyecto Expo | ✅ | 100% | Todo listo |
| 1 | Autenticacion | ✅ | 100% | Registro wizard 3 pasos + verify email + auto-login |
| 2 | Splash Screen y Onboarding | ✅ | 95% | Falta app icons finales |
| 3 | Navegacion por roles (Tab Bars) | ✅ | 100% | Tab activo con dot indicator, labels renombrados |
| 4 | Dashboards por rol | ✅ | 100% | Skeleton loaders animados, FAB acciones reales, scroll-to-top |
| 5 | Modulo de Jugadores | ✅ | 100% | Lista + detalle + documentos upload/delete + filtros categoria/estado |
| 6 | Modulo Financiero | ✅ | 100% | Cobros CRUD, pagos, comprobantes, aprobar/rechazar, abonos |
| 7 | Calendario y Asistencia | ✅ | 100% | Calendario mensual, sesiones, asistencia real con % y historial |
| 8 | Modulos Secundarios | ✅ | 100% | 7 modulos CRUD completo: inventario, torneos, reportes, config pagos, file vault, mis docs, entrenamientos |
| 9 | Push Notifications | ✅ | 100% | Deep linking, preferencias UI, projectId corregido |
| 10 | Real-time (WebSockets) | ✅ | 100% | Indicador WS en header, fallback polling 30s |
| 11 | Perfil y Configuracion | ✅ | 100% | Prefs notificaciones, eliminar cuenta con confirmacion |
| 12 | Inscripcion Publica | ✅ | 100% | Upload foto/doc en formulario, compartir link |
| 13 | Features Nativas | ✅ | 100% | QR scanner (manual+clipboard), share API, haptic feedback |
| 14 | Testing y QA | ⏳ | 0% | No se ha probado en dispositivo real |
| 15 | Build y Publicacion | ⏳ | 20% | eas.json listo. Falta conectar stores |

**Progreso real:** ~98% del desarrollo. Fases 0-13 completas. Solo falta testing en dispositivo real (Fase 14) y publicacion en stores (Fase 15).

**Ver `STATUS.md` para el checklist detallado de stores, archivos creados, y proximos pasos.**

---

## Preparacion del Backend (Ya completado)

Estos cambios ya estan hechos en `saas_sport/`:

- [x] Login retorna `access_token` cuando detecta header `X-Capacitor-Platform`
- [x] Register (verifyEmail) tambien soporta tokens Bearer para nativo
- [x] Logout revoca tokens de Sanctum
- [x] `POST /api/auth/refresh-mobile` - Rota token Bearer (no afecta web)
- [x] PushChannel detecta `ExponentPushToken[...]` y envia via Expo Push API
- [x] Todas las rutas protegidas aceptan Bearer token via `auth:sanctum`

---

## FASE 0: Setup del Proyecto Expo ✅

**Objetivo:** Crear la estructura base del proyecto con todas las dependencias.

**Estado:** COMPLETADA (18 Feb 2026)

### Tareas

- [x] Crear proyecto Expo con `npx create-expo-app`
- [x] Configurar Expo Router (file-based routing)
- [x] Instalar dependencias core (expo packages + npm packages)
- [x] JavaScript (no TypeScript para mantener coherencia con frontend web)
- [x] Configurar variables de entorno (.env con EXPO_PUBLIC_API_URL)
- [x] Crear estructura de carpetas (app/, src/components, contexts, hooks, services, helpers, constants, assets)
- [x] Configurar babel.config.js con alias (@/ -> src/)
- [x] Descargar fuentes Red Hat Display (4 pesos)
- [x] Crear theme.js (design system completo)
- [x] Crear api.js (axios con Bearer + auto-refresh + queue)
- [x] Crear secureStorage.js (wrapper expo-secure-store)
- [x] Crear apiService.js (endpoints organizados por modulo)
- [x] Crear AuthContext.jsx (login, logout, switchContext, onboarding)
- [x] Crear dateUtils.js y formatUtils.js (copiados del web)
- [x] Crear layouts: root, auth, onboarding, app (tabs)
- [x] Crear pantallas placeholder: login, onboarding, home, team, payments, calendar, settings
- [x] Crear CLAUDE.md del proyecto mobile
- [x] Verificar que compila correctamente (expo export OK, 3095 modulos)

### Estructura de carpetas

```
mobile/
├── app/                          # Expo Router (pantallas)
│   ├── _layout.jsx               # Root layout
│   ├── index.jsx                 # Entry point (redirect)
│   ├── (auth)/                   # Grupo: pantallas sin auth
│   │   ├── _layout.jsx
│   │   ├── login.jsx
│   │   ├── register.jsx
│   │   ├── forgot-password.jsx
│   │   └── verify-email.jsx
│   ├── (onboarding)/             # Grupo: flujo de onboarding
│   │   ├── _layout.jsx
│   │   └── [step].jsx
│   └── (app)/                    # Grupo: app principal (requiere auth)
│       ├── _layout.jsx           # Tab navigation por rol
│       ├── (owner)/              # Tabs del propietario
│       ├── (trainer)/            # Tabs del entrenador
│       ├── (player)/             # Tabs del jugador
│       ├── (parent)/             # Tabs del padre
│       └── (accountant)/         # Tabs del contador
├── src/
│   ├── components/               # Componentes reutilizables
│   │   ├── ui/                   # Botones, inputs, cards, etc.
│   │   └── shared/               # Componentes de negocio compartidos
│   ├── contexts/                 # React Context (Auth, Club, Theme)
│   ├── hooks/                    # Custom hooks (reutilizar logica del web)
│   ├── services/                 # API service, storage, etc.
│   │   ├── api.js                # Axios instance con Bearer token
│   │   ├── apiService.js         # Endpoints (copiar del web)
│   │   └── secureStorage.js      # Wrapper de SecureStore
│   ├── helpers/                  # Utilidades (copiar del web)
│   ├── constants/                # Colores, tamanios, config
│   └── assets/                   # Imagenes, fuentes, iconos
├── app.json                      # Configuracion de Expo
├── eas.json                      # Configuracion de EAS Build
├── package.json
└── babel.config.js
```

### Dependencias a instalar

```bash
# Core
npx expo install expo-router expo-linking expo-constants expo-status-bar

# Navegacion
npx expo install @react-navigation/native @react-navigation/bottom-tabs

# Almacenamiento seguro
npx expo install expo-secure-store

# HTTP client
npm install axios

# Estado y data fetching (mismo que web)
npm install @tanstack/react-query

# Formularios (mismo que web)
npm install react-hook-form zod @hookform/resolvers

# UI
npx expo install expo-image react-native-svg
npm install nativewind tailwindcss

# Splash y iconos
npx expo install expo-splash-screen expo-font

# Notificaciones
npx expo install expo-notifications expo-device

# Camara y media
npx expo install expo-camera expo-image-picker expo-document-picker

# Biometria
npx expo install expo-local-authentication

# Otros
npx expo install expo-haptics expo-clipboard expo-sharing
```

### Criterio de completado
- La app abre sin errores en iOS Simulator
- La app abre sin errores en Android Emulator
- Expo Router navega entre pantallas de prueba
- Las variables de entorno cargan correctamente

---

## FASE 1: Autenticacion y Almacenamiento Seguro ✅

**Objetivo:** Login, registro, verificacion de email, refresh token automatico.

**Estado:** COMPLETADA (18 Feb 2026)

### Tareas

- [x] Crear `secureStorage.js` (wrapper de expo-secure-store)
- [x] Crear `api.js` (axios instance con interceptores)
  - Header `Authorization: Bearer <token>` automatico
  - Header `X-Capacitor-Platform: ios/android` automatico
  - Interceptor de respuesta para 401 (token expirado)
  - Auto-refresh del token antes de que expire
- [x] Crear `apiService.js` (copiar endpoints del web, adaptar)
- [x] Crear `AuthContext.jsx`
  - Estado: user, token, isLoading, isAuthenticated
  - Metodos: login, logout, switchContext, markOnboardingSeen
  - Persistencia del token en SecureStore
  - Auto-login al abrir la app (verificar token guardado)
- [x] Pantalla de Login
  - Campos: email, password con react-hook-form + Controller
  - Manejo de errores (401, 429, network, otros)
  - Boton "Olvidaste tu contrasena?"
- [ ] Pantalla de Registro
  - Pendiente para siguiente iteracion (registro completo con wizard 3 pasos)
- [ ] Pantalla de Verificacion de Email (pendiente, con registro)
- [x] Pantalla de Forgot Password
- [x] Flujo de auto-refresh token (interceptor automatico en api.js)
- [x] Componentes UI base: Input.jsx, Button.jsx, AlertBox.jsx

### Que reutilizar del web

| Archivo web | Uso en mobile |
|-------------|---------------|
| `services/apiService.js` | Copiar funciones de endpoints, cambiar base |
| `helpers/dateUtils.js` | Copiar tal cual |
| `helpers/formatUtils.js` | Copiar tal cual |

### Criterio de completado
- Login funciona y guarda token en SecureStore
- Al reabrir la app, el usuario sigue logueado
- El token se renueva automaticamente
- Registro completo con verificacion de email
- Logout limpia token y redirige a login
- Error 401 redirige a login automaticamente

---

## FASE 2: Splash Screen y Onboarding

**Objetivo:** Primera impresion profesional y flujo de bienvenida.

**Estado:** COMPLETADA (18 Feb 2026)

### Tareas

- [x] Configurar Splash Screen nativa (expo-splash-screen)
  - Logo de Widdo centrado, fondo verde #16a34a
  - Duracion controlada (mientras carga auth state en _layout.jsx)
- [x] Crear flujo de onboarding (4 slides con carrusel FlatList animado)
  - Slide 1: "Gestiona tu club" (Shield icon)
  - Slide 2: "Control de pagos" (DollarSign icon)
  - Slide 3: "Asistencia en tiempo real" (ClipboardCheck icon)
  - Slide 4: "Comienza ahora" (Rocket icon + boton)
  - Paginacion animada con dots interpolados (escala + opacidad)
  - Botones: "Omitir" + "Siguiente" / "Comenzar" en ultimo slide
  - Flag guardado en SecureStore (persistente entre sesiones)
- [ ] Configurar App Icon (ios + android) - pendiente assets finales
- [ ] Configurar Adaptive Icon (android) - pendiente assets finales

### Criterio de completado
- [x] Splash screen aparece al abrir la app (sin flash blanco)
- [x] Onboarding se muestra solo la primera vez
- [x] Al terminar onboarding, va a Login
- [x] Si ya hizo onboarding, va directo a Login (o al app si esta logueado)

---

## FASE 3: Navegacion por Roles (Tab Bars)

**Objetivo:** Navegacion principal diferente segun el rol del usuario.

**Estado:** COMPLETADA (18 Feb 2026)

### Tareas

- [x] Contexto de club via AuthContext (activeContext con club_id, role, club_name)
- [x] ContextSwitcher (modal para cambiar entre clubs/roles si tiene multiples)
- [x] AppHeader reutilizable (context switcher + notificaciones)
- [x] Tab Bar dinamico por rol con href:null para ocultar tabs
- [x] Tab Bar para Owner: Dashboard | Equipo | Pagos | Calendario | Ajustes
- [x] Tab Bar para Trainer: Dashboard | Jugadores | Sesiones | Calendario | Ajustes
- [x] Tab Bar para Player: Dashboard | Mis Pagos | Calendario | Ajustes
- [x] Tab Bar para Parent: Dashboard | Mis Hijos | Mis Pagos | Calendario | Ajustes
- [x] Tab Bar para Accountant: Dashboard | Cobros | Pagos | Calendario | Ajustes
- [x] Pantallas placeholder: sessions, my-payments, children, charges

### Tabs por rol (implementados)

| Tab | Owner | Trainer | Player | Parent | Accountant |
|-----|-------|---------|--------|--------|------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Equipo/Jugadores | ✅ | ✅ | - | - | - |
| Mis Hijos | - | - | - | ✅ | - |
| Cobros | - | - | - | - | ✅ |
| Pagos | ✅ | - | - | - | ✅ |
| Mis Pagos | - | - | ✅ | ✅ | - |
| Sesiones | - | ✅ | - | - | - |
| Calendario | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ajustes | ✅ | ✅ | ✅ | ✅ | ✅ |

### Criterio de completado
- [x] Tabs dinamicos segun el rol (ocultados con href:null)
- [x] ContextSwitcher permite cambiar entre clubs/roles
- [x] La navegacion compila sin errores
- [x] Labels personalizados por rol (Equipo vs Jugadores)
- [x] Tab activo con dot indicator verde y strokeWidth diferenciado
- [x] Color inactivo mas claro para mejor contraste
- [x] "Equipo" renombrado a "Jugadores" para owner/admin

---

## FASE 4: Dashboards por Rol

**Objetivo:** Pantalla principal con metricas relevantes para cada rol.

**Estado:** COMPLETADA (18 Feb 2026)

### Tareas

- [x] Dashboard Owner (OwnerDashboard.jsx)
  - Stats grid 2x2: jugadores, entrenadores, categorias, sesiones
  - Tarjeta financiera: recaudado, cambio %, pendiente, por verificar, tasa recaudo
  - Pagos recientes (ultimos 5 con timeAgo)
  - Jugadores con deudas (condicional)
- [x] Dashboard Trainer (TrainerDashboard.jsx)
  - Stats: jugadores, categorias, sesiones
  - Proximos eventos con badges de tipo (training/tournament)
  - Asistencia reciente con barras de progreso
  - Categorias en chips horizontales
- [x] Dashboard Player (PlayerDashboard.jsx)
  - Pagos pendientes (border ambar/rojo, estado vacio verde)
  - Mis entrenamientos (dia, hora, categoria, ubicacion)
  - Historial de pagos (ultimos 5 con status badge)
- [x] Dashboard Parent (ParentDashboard.jsx)
  - Summary card: total pendiente, asistencia, clubes
  - Tarjeta por hijo: avatar, categorias, asistencia, pagos, proxima sesion
- [x] Dashboard Accountant (AccountantDashboard.jsx)
  - Stats: total cobros, completados, pendientes
  - Tasa de completitud con barra de progreso
  - Tipos de cobro con montos
- [x] useDashboard hook (detecta rol, llama endpoint correcto)
- [x] Pull-to-refresh via onRefresh prop en todos los dashboards
- [ ] Skeleton loaders mientras carga (pendiente, usa ActivityIndicator por ahora)

### Hooks implementados

| Hook | Descripcion |
|------|-------------|
| `useDashboard` | Hook unico que detecta rol y llama el endpoint correcto |

### apiService actualizado

| Endpoint | Ruta |
|----------|------|
| dashboard.owner(clubId) | GET /dashboard/club-owner?club_id=X |
| dashboard.trainer() | GET /dashboard/trainer |
| dashboard.player() | GET /dashboard/player |
| dashboard.parent() | GET /dashboard/parent |
| dashboard.accountant() | GET /dashboard/accountant |

### Criterio de completado
- [x] Cada rol ve su dashboard con datos reales del API
- [x] Pull-to-refresh funciona (RefreshControl)
- [ ] Skeleton loaders (usa ActivityIndicator como placeholder)
- [x] Pantalla principal detecta rol y renderiza componente correcto
- [x] Header verde gradiente con context switcher (club + rol) en todas las pantallas
- [x] FAB quick actions navegan a pantallas reales (0 alerts "Proximamente")
- [x] Scroll-to-top automatico al cambiar de tab (useFocusEffect + scrollRef)

---

## FASE 5: Modulo de Jugadores

**Objetivo:** CRUD de jugadores, detalle, foto, documentos.

**Estado:** COMPLETADA (18 Feb 2026) - Lectura implementada, escritura pendiente

### Tareas

- [x] Lista de jugadores (con busqueda y filtros) - team.jsx
- [x] Detalle de jugador (datos personales, contacto, medico) - player-detail.jsx
- [x] Hook usePlayers (list + detail)
- [ ] Crear jugador (formulario completo)
- [ ] Editar jugador
- [ ] Subir foto de perfil (desde camara o galeria)
- [ ] Documentos del jugador (ver, subir)
- [ ] Ficha del jugador (vista resumida)
- [ ] Cambiar categoria/estado del jugador
- [ ] Vista especial para entrenadores (solo sus categorias)
- [ ] Vista especial para padres (solo sus hijos)

### Criterio de completado
- CRUD completo de jugadores funciona
- Fotos se suben desde camara y galeria
- Los filtros y busqueda funcionan
- Cada rol ve solo lo que le corresponde

---

## FASE 6: Modulo Financiero (Pagos y Cobros)

**Objetivo:** Gestion de cobros, pagos, comprobantes.

**Estado:** COMPLETADA (23 Feb 2026) - 100% funcional

### Tareas

**Cobros (charges.jsx):**
- [x] Lista de cobros activos con tarjetas (status dot, monto, frecuencia, jugadores, categorias)
- [x] ChargeDetailModal - Detalle completo con info + 4 acciones (dispatch, editar, toggle, eliminar)
- [x] ChargeFormModal - Crear/editar cobro (nombre, monto, frecuencia, aplicar a, categorias, estado)
- [x] Generar pagos (dispatch con confirmacion + conteo creados/omitidos)
- [x] Toggle estado cobro ACT↔BOR
- [x] Eliminar cobro (con confirmacion)

**Pagos owner/accountant (payments.jsx):**
- [x] Lista de pagos con filtros por estado (Todos, Pendientes, Parciales, Completados, Por Verificar)
- [x] PaymentDetailModal - Info jugador, resumen montos (total/pagado/pendiente), abonos expandibles
- [x] Ver comprobante de abono (imagen)
- [x] Aprobar comprobante (con confirmacion)
- [x] Rechazar comprobante (con razon obligatoria)
- [x] RegisterPaymentModal - Registrar pago manual (monto, metodo, referencia, fecha)

**Mis pagos player/parent (my-payments.jsx):**
- [x] Vista jugador: pagos pendientes (border ambar/rojo) + historial
- [x] Vista padre: resumen total + pagos agrupados por hijo
- [x] PaymentProofModal - Subir comprobante (camara/galeria, notas opcionales)

**Hooks completos:**
- [x] useCharges, usePayments, useMyPayments, useChildrenPayments
- [x] useCreateCharge, useUpdateCharge, useDeleteCharge
- [x] useDispatchCharge, useToggleChargeStatus, useChargeFrequencies
- [x] useRegisterPayment, useUploadPaymentProof
- [x] useApproveInstallment, useRejectInstallment, usePendingVerification

### Criterio de completado
- [x] Cobros se crean, editan, eliminan y se ven correctamente
- [x] Cobros se pueden despachar (generar pagos) y cambiar estado
- [x] Pagos se registran manualmente con metodo de pago y referencia
- [x] Comprobantes se suben desde camara/galeria con notas
- [x] Comprobantes se aprueban/rechazan con razon
- [x] Abonos se ven en lista expandible con detalle
- [x] Jugadores ven sus deudas y pagos + suben comprobante
- [x] Padres ven pagos de sus hijos agrupados + suben comprobante

---

## FASE 7: Calendario y Asistencia

**Objetivo:** Calendario de eventos, sesiones de entrenamiento, control de asistencia.

**Estado:** COMPLETADA (18 Feb 2026)

### Tareas

- [x] Calendario mensual con eventos y sesiones - calendar.jsx
- [x] Grilla de 42 dias con puntos de colores por tipo de evento
- [x] Lista de eventos del dia seleccionado con tarjetas
- [x] Merge de eventos regulares + ocurrencias de sesiones
- [x] Hook useCalendarEvents + useSessionOccurrences
- [x] Lista de sesiones de entrenamiento - sessions.jsx
- [x] Control de asistencia con modal (present/late/absent)
- [x] Hook useSessionPlayers + useSessionAttendance + useMarkAttendance
- [x] Hooks: useConfirmEvent, useDeclineEvent, useMyAttendance
- [ ] Detalle de evento (modal con info completa)
- [ ] Crear/editar evento (owner/trainer)
- [ ] Confirmar/rechazar participacion (UI)
- [ ] Historial de asistencia por categoria

### Criterio de completado
- Calendario muestra eventos del club
- Se puede crear y editar eventos
- Asistencia se registra correctamente
- Jugadores confirman participacion en eventos

---

## FASE 8: Modulos Secundarios

**Objetivo:** Funcionalidades adicionales que completan la app.

**Estado:** AVANZADA (22 Feb 2026) - Todas las pantallas creadas, falta CRUD en nuevas

### Tareas

- [x] Pantalla "Mis Hijos" para padres - children.jsx
- [x] Hook useChildren + useChildrenSessions
- [x] apiService actualizado con endpoints parent-child
- [x] Pantalla de Ajustes completa - settings.jsx (perfil, logout, menu por rol, iconos tintados)
- [x] Categorias (ver, crear, editar) - categories.jsx + hook + modal
- [x] Entrenadores (ver, crear, editar) - trainers.jsx + hook + modal
- [x] Ubicaciones del club (ver, crear) - venues.jsx + hook + modal
- [x] Descuentos (ver, crear) - discounts.jsx + hook + modal
- [x] Gastos (ver, crear) - expenses.jsx + hook + modal
- [x] Perfil del club (ver, editar) - club-profile.jsx + hook + modal
- [x] Equipo/Miembros (ver) - team-members.jsx + hook
- [x] Links de inscripcion (ver, crear) - enrollment-links.jsx + hook + modal
- [x] Inventario (UI placeholder) - inventory.jsx
- [x] Torneos (UI placeholder) - tournaments.jsx
- [x] Reportes (UI placeholder) - reports.jsx
- [x] Config. Pagos (UI placeholder) - payment-config.jsx
- [x] Archivos (UI placeholder) - files.jsx
- [x] Privacidad (contenido estatico) - privacy.jsx
- [x] Ayuda y Soporte (FAQ + contacto) - help.jsx
- [x] Mis Documentos (UI placeholder) - my-documents.jsx
- [x] Asistencia (UI placeholder) - attendance.jsx
- [x] Entrenamientos (UI placeholder) - training.jsx
- [x] Todas las rutas conectadas en settings.jsx (0 items "Proximamente")
- [x] Todas las pantallas registradas en _layout.jsx
- [x] API venues corregido: /venues → /locations (match backend)
- [ ] CRUD real en: inventario, torneos, reportes, config pagos, archivos, documentos, asistencia, entrenamientos

### Criterio de completado
- [x] Todas las funcionalidades secundarias accesibles desde menu "Mas"
- [ ] CRUD conectado al backend en pantallas nuevas (solo UI placeholder por ahora)
- [ ] Datos consistentes con la web

---

## FASE 9: Push Notifications (iOS + Android)

**Objetivo:** Notificaciones push nativas con Expo.

**Estado:** COMPLETADA (18 Feb 2026)

### Tareas

- [x] Configurar expo-notifications (app.json plugin + handler)
- [x] Solicitar permisos al usuario (registerForPushNotificationsAsync)
- [x] Obtener Expo Push Token
- [x] Registrar token en backend (POST /api/push-tokens via apiService)
- [x] Manejar notificaciones recibidas (foreground - setNotificationHandler)
- [x] Manejar notificaciones tocadas (addNotificationResponseReceivedListener)
- [x] Configurar notification channels (Android - canal 'default' con color verde)
- [x] Pantalla de notificaciones (NotificationsScreen.jsx con lista, read, mark all)
- [x] Badge de no leidas en AppHeader (useUnreadCount hook)
- [x] Registro automatico de push token despues de login (AuthContext)
- [ ] Deep linking desde notificaciones (navegar a pantalla especifica)
- [ ] Probar en dispositivo real iOS
- [ ] Probar en dispositivo real Android

### Requisitos para iOS
- Apple Developer Account ($99/anio)
- Configurar APNs Key en Expo (EAS)
- El backend ya soporta Expo Push Token (implementado)

### Criterio de completado
- Push llegan a iOS y Android
- Al tocar la notificacion, abre la pantalla correcta
- Funciona con app en background y cerrada

---

## FASE 10: Real-time (WebSockets)

**Objetivo:** Eventos en tiempo real (pagos, notificaciones, sesiones).

**Estado:** COMPLETADA (18 Feb 2026)

### Tareas

- [x] Instalar pusher-js (^8.4.0) y laravel-echo (^1.19.0)
- [x] Crear echo.js (Bearer token auth, singleton, backoff exponencial)
- [x] Suscribirse a canal notifications.{userId} (useRealtimeNotifications)
- [x] Suscribirse a canal club.{clubId}.payments (useClubRealtimeEvents)
- [x] Suscribirse a canal club.{clubId}.sessions (useClubRealtimeEvents)
- [x] Invalidar React Query cache automaticamente por tipo de evento
- [x] Reconexion automatica con AppState (foreground/background)
- [x] Backoff exponencial hasta 5 reintentos (max 30s)
- [x] Variables de entorno Reverb en .env
- [ ] Indicador visual de conexion WebSocket en UI
- [ ] Fallback a polling cuando WebSocket no esta disponible

### Criterio de completado
- [x] Eventos en tiempo real llegan al mobile
- [x] Datos se actualizan sin hacer pull-to-refresh
- [x] Reconexion automatica si se pierde la conexion

---

## FASE 11: Perfil y Configuracion

**Objetivo:** Gestion del perfil personal y configuraciones de la app.

**Estado:** COMPLETADA (18 Feb 2026)

### Tareas

- [x] Ver perfil (datos personales) - settings.jsx con profile card
- [x] Editar perfil (nombre, apellido, telefonos) - edit-profile.jsx
- [x] Cambiar contrasena (con validacion de requisitos) - change-password.jsx
- [x] apiService actualizado con endpoints /account/*
- [x] useProfile hooks (useProfile, useUpdatePersonal, useUpdateContact, useChangePassword, useUploadPhoto)
- [x] Navegacion settings -> edit-profile y change-password
- [x] Informacion de la app (version) - settings.jsx
- [x] Cerrar sesion con confirmacion - settings.jsx
- [x] Cambiar foto de perfil (subir desde camara/galeria con useImagePicker + useUploadPhoto)
- [ ] Preferencias de notificaciones
- [ ] Eliminar cuenta

### Criterio de completado
- [x] Perfil editable (nombre, apellido, telefonos)
- [x] Cambio de contrasena funciona con validacion
- [x] Logout funciona correctamente

---

## FASE 12: Inscripcion Publica (Deep Links)

**Objetivo:** Permitir inscripcion de jugadores via link compartido.

**Estado:** COMPLETADA (18 Feb 2026)

### Tareas

- [x] Configurar deep links (expo-linking + Expo Router dynamic routes)
- [x] Pantalla de inscripcion publica (app/enrollment/[clubName]/[token].jsx)
- [x] Layout de enrollment (app/enrollment/_layout.jsx + [clubName]/_layout.jsx)
- [x] Formulario de inscripcion 6 campos (nombre, apellido, DOB, documento, telefono, email)
- [x] Hook useEnrollment (useEnrollmentClubInfo, useGetCategoryByBirthdate, useCheckDocument, useSubmitEnrollment)
- [x] apiService actualizado con endpoints publicEnrollment
- [x] Root _layout.jsx actualizado con ruta enrollment
- [ ] Subir documentos y foto en inscripcion
- [ ] Enlace compartible desde la app (boton share)

### Criterio de completado
- Un padre puede inscribir a su hijo desde un link
- El formulario funciona sin estar logueado
- Los datos se guardan correctamente en el backend

---

## FASE 13: Features Nativas (Camara, Biometria)

**Objetivo:** Aprovechar capacidades del dispositivo.

**Estado:** COMPLETADA (18 Feb 2026)

### Tareas

- [x] Hook useBiometrics (Face ID / Touch ID / Fingerprint con SecureStore)
- [x] Toggle biometrico en settings.jsx (Switch + tipo de biometria)
- [x] Hook useImagePicker (camara + galeria, configurable maxSize/aspect/quality)
- [x] expo-local-authentication instalado y configurado en app.json (NSFaceIDUsageDescription)
- [x] expo-image-picker instalado
- [x] secureStorage.js actualizado con get/set genericos
- [x] @react-native-community/netinfo instalado (dependencia de pusher-js)
- [x] Login con biometria (integrado en login.jsx + AuthContext con loginWithBiometrics)
- [x] Guardado automatico de credenciales en SecureStore al login con biometrics habilitado
- [x] Boton biometrico en login: Face ID (ScanFace) o Huella Digital (Fingerprint)
- [x] Manejo de credenciales invalidas (limpia y muestra mensaje)
- [ ] Escanear QR para asistencia rapida
- [ ] Compartir contenido (link de inscripcion, carnet)
- [ ] Haptic feedback en acciones importantes

### Criterio de completado
- Biometria funciona como alternativa al login
- QR scanner lee codigos de asistencia
- Compartir funciona en ambas plataformas

---

## FASE 14: Testing y QA

**Objetivo:** Garantizar calidad antes de publicar.

**Estado:** Pendiente

### Tareas

- [ ] Testing manual en iOS (dispositivo real)
- [ ] Testing manual en Android (dispositivo real)
- [ ] Probar todos los flujos de cada rol
- [ ] Probar offline behavior (sin conexion)
- [ ] Probar con datos reales de produccion (staging)
- [ ] Fix de bugs encontrados
- [ ] Optimizar rendimiento (listas largas, imagenes)
- [ ] Revisar memoria y crashes
- [ ] Test de accesibilidad basico
- [ ] Beta testing con usuarios reales (TestFlight + Internal Testing)

### Criterio de completado
- No hay crashes en flujos principales
- La app funciona en iOS 15+ y Android 10+
- Beta testers aprueban la experiencia
- Performance aceptable (scroll suave, carga < 3s)

---

## FASE 15: Build y Publicacion

**Objetivo:** Publicar la app en App Store y Google Play.

**Estado:** COMPLETADA (18 Feb 2026) - Configuracion lista, pending cuentas de stores

### Tareas

- [x] Crear eas.json (perfiles: development, preview, production)
- [x] Configurar app.json para produccion (owner, runtimeVersion, updates, OTA)
- [x] iOS config: buildNumber, usesNonExemptEncryption, NSFaceIDUsageDescription
- [x] Android config: versionCode, permissions (INTERNET, VIBRATE, RECEIVE_BOOT_COMPLETED)
- [x] Scripts de build en package.json (build:dev, build:preview, build:ios, build:android, build:all)
- [x] Scripts de submit (submit:ios, submit:android)
- [x] Scripts de OTA updates (update, update:preview, update:production)
- [x] Perfiles de submit configurados (placeholders para Apple ID, Team ID, Service Account)
- [ ] Crear perfiles de provision (iOS) - requiere Apple Developer Account
- [ ] Configurar App Store Connect - requiere Apple Developer Account
- [ ] Configurar Google Play Console - requiere cuenta de Google Play
- [ ] Preparar screenshots para ambas stores
- [ ] Escribir descripcion de la app
- [ ] Configurar metadata (categoria, palabras clave)
- [ ] Build de produccion iOS
- [ ] Build de produccion Android
- [ ] Submit a App Store Review
- [ ] Submit a Google Play Review

### Requisitos

| Requisito | iOS | Android |
|-----------|-----|---------|
| Cuenta de desarrollador | Apple Developer ($99/anio) | Google Play Console ($25 una vez) |
| Certificados | APNs Key + Distribution Certificate | Keystore (.jks) |
| Screenshots | 6.7", 6.5", 5.5" (3 tamanios) | Phone + Tablet (opcional) |
| Privacy Policy | URL obligatoria | URL obligatoria |

### Criterio de completado
- App publicada en App Store
- App publicada en Google Play
- Usuarios pueden descargar e instalar
- Actualizaciones OTA configuradas (Expo Updates)

---

## Que se reutiliza del frontend web

### 100% reutilizable (copiar directo)

| Archivo/Carpeta | Descripcion |
|-----------------|-------------|
| `services/apiService.js` | Todos los endpoints del API (~100 funciones) |
| `helpers/dateUtils.js` | Utilidades de fechas |
| `helpers/formatUtils.js` | Formato de moneda, numeros |
| `hooks/use*.js` | Hooks de React Query (~70 hooks) |

### ~30% adaptacion

| Archivo/Carpeta | Que cambia |
|-----------------|------------|
| `contexts/AuthContext.jsx` | Cambiar cookies por SecureStore + Bearer |
| `contexts/ClubContext.jsx` | Adaptar para navegacion nativa |
| `services/axiosInstance.js` | Cambiar interceptores para Bearer token |

### Reescribir completamente (UI)

| Componente web | Equivalente mobile |
|----------------|-------------------|
| Componentes Radix UI | React Native components |
| TailwindCSS classes | NativeWind o StyleSheet |
| React Router | Expo Router |
| HTML forms | React Native TextInput/Picker |
| Tables | FlatList con cards |

---

## Orden recomendado de ejecucion

```
FASE 0  →  FASE 1  →  FASE 2  →  FASE 3  →  FASE 4
(Setup)    (Auth)     (Splash)   (Nav)      (Dashboards)
                                               ↓
FASE 9  ←  FASE 8  ←  FASE 7  ←  FASE 6  ←  FASE 5
(Push)     (Otros)    (Calendar)  (Pagos)    (Jugadores)
   ↓
FASE 10 →  FASE 11 →  FASE 12 →  FASE 13 →  FASE 14  →  FASE 15
(WS)       (Perfil)   (Deep)     (Nativas)   (QA)        (Publish)
```

**MVP minimo para beta testing:** Fases 0-7 (auth + dashboards + jugadores + pagos + calendario)

**MVP completo para tiendas:** Fases 0-11 (todo excepto deep links y features nativas avanzadas)

---

## Notas tecnicas importantes

1. **No duplicar frontend web** - El proyecto mobile es independiente. No es un fork del frontend web.

2. **API compartida** - Mobile y web usan el mismo backend. La unica diferencia es Bearer token vs cookies.

3. **React Query es clave** - Los hooks de data fetching del web se reutilizan casi tal cual. Esto ahorra muchisimo tiempo.

4. **NativeWind vs StyleSheet** - NativeWind (Tailwind para RN) permite reutilizar conocimiento de Tailwind. Evaluar en Fase 0.

5. **Expo Go vs Development Build** - Para Fases 0-8 se puede usar Expo Go. Para Fases 9+ (push notifications, biometria) se necesita Development Build.

6. **iOS requiere dispositivo real** - Para probar push notifications y biometria, se necesita iPhone fisico + Apple Developer Account.
