# Widdo Mobile App - Arquitectura por Rol

App móvil simplificada para usuarios de campo (Capacitor).

## Filosofía

```
WEB = Administración completa (Owner, Admin, Accountant)
APP = Consumo y acciones rápidas (Trainer, Parent, Player)
```

La app móvil NO replica toda la web. Solo muestra lo que cada rol necesita en el día a día.

---

## Navegación por Rol

### Entrenador (Trainer)

**Bottom Navigation (5 items):**
```
[Inicio] [Sesiones] [Asistencia] [Jugadores] [Perfil]
```

| Módulo | Funcionalidad |
|--------|---------------|
| **Inicio** | Próximas sesiones, asistencia pendiente, avisos |
| **Sesiones** | Lista de sesiones (solo sus categorías) |
| **Asistencia** | Tomar asistencia con swipe/tap rápido |
| **Jugadores** | Ver jugadores de sus categorías (solo lectura) |
| **Perfil** | Mi perfil, notificaciones, cerrar sesión |

**Acciones rápidas:**
- Swipe en jugador → Presente/Ausente/Tarde
- Pull-to-refresh en sesiones
- Notificación push → "Sesión en 1 hora"

---

### Padre/Acudiente (Parent)

**Bottom Navigation (5 items):**
```
[Inicio] [Mis Hijos] [Pagos] [Calendario] [Perfil]
```

| Módulo | Funcionalidad |
|--------|---------------|
| **Inicio** | Próximos eventos, pagos pendientes, avisos |
| **Mis Hijos** | Ver perfil de cada hijo, documentos |
| **Pagos** | Estado de pagos, historial, comprobantes |
| **Calendario** | Eventos del club, sesiones de hijos |
| **Perfil** | Mi perfil, notificaciones, cerrar sesión |

**Acciones rápidas:**
- Ver comprobante de pago
- Descargar documento
- Confirmar asistencia a evento
- Notificación push → "Pago vence en 3 días"

---

### Jugador (Player)

**Bottom Navigation (4 items):**
```
[Inicio] [Mi Perfil] [Pagos] [Calendario]
```

| Módulo | Funcionalidad |
|--------|---------------|
| **Inicio** | Próximas sesiones, eventos, avisos |
| **Mi Perfil** | Ver/editar datos básicos, foto, documentos |
| **Pagos** | Mis pagos (solo lectura) |
| **Calendario** | Sesiones y eventos |

**Acciones rápidas:**
- Ver horario de entrenamiento
- Confirmar asistencia a evento
- Notificación push → "Mañana entreno a las 4pm"

---

## Comparación Web vs App

### Entrenador

| Funcionalidad | Web | App |
|---------------|-----|-----|
| Ver todas las categorías | ✅ | ❌ Solo las suyas |
| Crear sesiones | ✅ | ❌ |
| Editar sesiones | ✅ | ❌ |
| Tomar asistencia | ✅ | ✅ Optimizado |
| Ver jugadores | ✅ Completo | ✅ Básico |
| Reportes | ✅ | ❌ |

### Padre

| Funcionalidad | Web | App |
|---------------|-----|-----|
| Ver datos de hijos | ✅ | ✅ |
| Editar datos de hijos | ✅ | ❌ |
| Ver pagos | ✅ | ✅ |
| Subir comprobantes | ✅ | ✅ Cámara |
| Calendario | ✅ | ✅ |
| Documentos | ✅ | ✅ Solo ver |

### Jugador

| Funcionalidad | Web | App |
|---------------|-----|-----|
| Ver mi perfil | ✅ | ✅ |
| Editar mi perfil | ✅ | ✅ Básico |
| Ver mis pagos | ✅ | ✅ |
| Calendario | ✅ | ✅ |
| Documentos | ✅ | ✅ Solo ver |

---

## Componentes Móviles Específicos

### 1. QuickAttendance (Entrenador)

```jsx
// Asistencia rápida con swipe
<SwipeablePlayerCard
  player={player}
  onSwipeLeft={() => markAbsent(player.id)}   // Rojo
  onSwipeRight={() => markPresent(player.id)} // Verde
  onTap={() => markLate(player.id)}           // Amarillo
/>
```

### 2. PaymentStatusCard (Padre)

```jsx
// Card de estado de pago con acción rápida
<PaymentCard
  charge={charge}
  status={payment.status}
  dueDate={charge.due_date}
  onViewReceipt={() => openReceipt(payment)}
  onUploadProof={() => openCamera()}  // Capacitor Camera
/>
```

### 3. SessionCard (Todos)

```jsx
// Card de sesión con información compacta
<SessionCard
  session={session}
  showCategory={role !== 'trainer'}  // Trainer ya sabe su categoría
  showLocation={true}
  onTap={() => navigate(`/session/${session.id}`)}
/>
```

### 4. ChildSwitcher (Padre con múltiples hijos)

```jsx
// Selector de hijo activo
<ChildSwitcher
  children={myChildren}
  activeChild={activeChild}
  onSwitch={(child) => setActiveChild(child)}
/>
```

---

## Navegación Condicional

```jsx
// hooks/useMobileNavigation.js
export function useMobileNavigation() {
  const { user, activeRole } = useAuth();

  const getNavItems = () => {
    switch (activeRole) {
      case 'trainer':
        return [
          { icon: Home, label: 'Inicio', path: '/app/home' },
          { icon: Calendar, label: 'Sesiones', path: '/app/sessions' },
          { icon: ClipboardCheck, label: 'Asistencia', path: '/app/attendance' },
          { icon: Users, label: 'Jugadores', path: '/app/players' },
          { icon: User, label: 'Perfil', path: '/app/profile' },
        ];

      case 'parent':
        return [
          { icon: Home, label: 'Inicio', path: '/app/home' },
          { icon: Users, label: 'Mis Hijos', path: '/app/children' },
          { icon: CreditCard, label: 'Pagos', path: '/app/payments' },
          { icon: Calendar, label: 'Calendario', path: '/app/calendar' },
          { icon: User, label: 'Perfil', path: '/app/profile' },
        ];

      case 'player':
        return [
          { icon: Home, label: 'Inicio', path: '/app/home' },
          { icon: User, label: 'Mi Perfil', path: '/app/profile' },
          { icon: CreditCard, label: 'Pagos', path: '/app/payments' },
          { icon: Calendar, label: 'Calendario', path: '/app/calendar' },
        ];

      default:
        return [];
    }
  };

  return { navItems: getNavItems(), activeRole };
}
```

---

## Rutas de la App Móvil

```jsx
// Solo rutas necesarias para móvil
const mobileRoutes = [
  // Comunes
  { path: '/app/home', component: MobileHomePage },
  { path: '/app/profile', component: MobileProfilePage },
  { path: '/app/calendar', component: MobileCalendarPage },
  { path: '/app/notifications', component: NotificationsPage },

  // Trainer
  { path: '/app/sessions', component: TrainerSessionsPage, roles: ['trainer'] },
  { path: '/app/attendance', component: QuickAttendancePage, roles: ['trainer'] },
  { path: '/app/attendance/:sessionId', component: SessionAttendancePage, roles: ['trainer'] },
  { path: '/app/players', component: TrainerPlayersPage, roles: ['trainer'] },

  // Parent
  { path: '/app/children', component: MyChildrenPage, roles: ['parent'] },
  { path: '/app/children/:childId', component: ChildDetailPage, roles: ['parent'] },
  { path: '/app/payments', component: MyPaymentsPage, roles: ['parent', 'player'] },
  { path: '/app/payments/:paymentId', component: PaymentDetailPage, roles: ['parent', 'player'] },

  // Player
  { path: '/app/my-sessions', component: PlayerSessionsPage, roles: ['player'] },
];
```

---

## Detección Web vs App

```jsx
// hooks/usePlatform.js
import { Capacitor } from '@capacitor/core';

export function usePlatform() {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  return {
    isNative,        // true en iOS/Android app
    isWeb: !isNative,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    platform,
  };
}

// Uso en App.jsx
function App() {
  const { isNative } = usePlatform();
  const { activeRole } = useAuth();

  // App nativa → Rutas móviles simplificadas
  if (isNative && ['trainer', 'parent', 'player'].includes(activeRole)) {
    return <MobileApp />;
  }

  // Web o roles admin → App completa
  return <WebApp />;
}
```

---

## Push Notifications por Rol

### Entrenador
- "Sesión en 1 hora: Sub-15 en Cancha Principal"
- "Faltan 3 jugadores por confirmar asistencia"
- "Nueva sesión asignada para mañana"

### Padre
- "Pago de Juan vence en 3 días"
- "Mañana: Entrenamiento de María 4:00 PM"
- "Nuevo documento disponible para descargar"
- "Evento cancelado: Partido amistoso"

### Jugador
- "Mañana tienes entrenamiento a las 4:00 PM"
- "Nuevo evento: Torneo Regional"
- "Tu asistencia del mes: 85%"

---

## Capacitor Plugins Necesarios

```bash
# Core
npm install @capacitor/core @capacitor/cli

# UI/UX
npm install @capacitor/status-bar      # Color de barra de estado
npm install @capacitor/splash-screen   # Splash screen
npm install @capacitor/keyboard        # Manejo de teclado

# Funcionalidades
npm install @capacitor/camera          # Subir comprobantes (Padre)
npm install @capacitor/push-notifications  # Notificaciones
npm install @capacitor/haptics         # Vibración en acciones

# Opcional
npm install @capacitor/share           # Compartir documentos
npm install @capacitor/app             # Ciclo de vida
```

---

## Estructura de Carpetas

```
src/
├── pages/
│   ├── dashboard/          # Web - páginas completas
│   └── mobile/             # App - páginas simplificadas
│       ├── home/
│       │   ├── TrainerHomePage.jsx
│       │   ├── ParentHomePage.jsx
│       │   └── PlayerHomePage.jsx
│       ├── attendance/
│       │   └── QuickAttendancePage.jsx
│       ├── children/
│       │   └── MyChildrenPage.jsx
│       └── shared/
│           ├── MobileCalendarPage.jsx
│           └── MobileProfilePage.jsx
│
├── components/
│   ├── mobile/             # Componentes solo para app
│   │   ├── BottomNav.jsx
│   │   ├── SwipeableCard.jsx
│   │   ├── QuickAttendanceList.jsx
│   │   ├── ChildSwitcher.jsx
│   │   └── PaymentStatusCard.jsx
│   └── shared/             # Componentes compartidos web/app
│
├── layouts/
│   ├── WebLayout.jsx       # Sidebar + header (web)
│   └── MobileLayout.jsx    # Bottom nav + safe areas (app)
│
└── App.jsx                 # Detecta plataforma y renderiza layout correcto
```

---

## Timeline de Desarrollo

### Fase 1: Infraestructura (1-2 días)
- [ ] Configurar Capacitor
- [ ] MobileLayout con bottom nav
- [ ] usePlatform hook
- [ ] Safe areas CSS

### Fase 2: Entrenador (2-3 días)
- [ ] TrainerHomePage
- [ ] QuickAttendancePage (swipe para asistencia)
- [ ] TrainerPlayersPage (lista simple)
- [ ] Push notifications de sesiones

### Fase 3: Padre (2-3 días)
- [ ] ParentHomePage
- [ ] MyChildrenPage + ChildSwitcher
- [ ] MyPaymentsPage
- [ ] Cámara para comprobantes
- [ ] Push notifications de pagos

### Fase 4: Jugador (1-2 días)
- [ ] PlayerHomePage
- [ ] Reutilizar calendario y pagos de padre
- [ ] Push notifications

### Fase 5: Polish (1-2 días)
- [ ] Splash screen
- [ ] App icons
- [ ] Testing en dispositivos
- [ ] Build para stores

**Total estimado: 8-12 días de desarrollo**
