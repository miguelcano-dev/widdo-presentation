# Widdo Mobile - Implementación Capacitor

## Decisión Técnica

**Tecnología elegida:** Capacitor
**Razón principal:** Sincronización total con web - mismo codebase React
**Fecha decisión:** Febrero 2026

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    CODEBASE UNIFICADO                       │
│                      (React + Vite)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────────┐    │
│  │    WEB (Browser)    │    │   MOBILE (Capacitor)    │    │
│  │                     │    │                         │    │
│  │  - Sidebar nav      │    │  - Bottom nav           │    │
│  │  - Todas features   │    │  - Features por rol     │    │
│  │  - Admin completo   │    │  - Acciones rápidas     │    │
│  │                     │    │                         │    │
│  └─────────────────────┘    └─────────────────────────┘    │
│           │                           │                     │
│           └───────────┬───────────────┘                     │
│                       │                                     │
│              ┌────────▼────────┐                           │
│              │  COMPONENTES    │                           │
│              │   COMPARTIDOS   │                           │
│              │                 │                           │
│              │  - Hooks        │                           │
│              │  - Services     │                           │
│              │  - Utils        │                           │
│              │  - UI Base      │                           │
│              └─────────────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuración Base

### capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.widdo.app',
  appName: 'Widdo',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Para desarrollo local, descomentar:
    // url: 'http://192.168.1.X:5173',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#16a34a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#16a34a',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
```

### package.json (scripts adicionales)

```json
{
  "scripts": {
    "build": "vite build",
    "cap:init": "cap init Widdo co.widdo.app --web-dir dist",
    "cap:add:ios": "cap add ios",
    "cap:add:android": "cap add android",
    "cap:sync": "cap sync",
    "cap:copy": "cap copy",
    "cap:open:ios": "cap open ios",
    "cap:open:android": "cap open android",
    "mobile:build": "npm run build && cap sync",
    "mobile:ios": "npm run build && cap sync ios && cap open ios",
    "mobile:android": "npm run build && cap sync android && cap open android"
  }
}
```

---

## Plugins Requeridos

### Core (Obligatorios)

```bash
npm install @capacitor/core @capacitor/cli

# Agregar plataformas
npx cap add ios
npx cap add android
```

### UI/UX

```bash
npm install @capacitor/status-bar      # Barra de estado nativa
npm install @capacitor/splash-screen   # Splash screen
npm install @capacitor/keyboard        # Manejo de teclado virtual
npm install @capacitor/haptics         # Vibración para feedback táctil
```

### Funcionalidades

```bash
npm install @capacitor/camera          # Cámara (subir comprobantes)
npm install @capacitor/push-notifications  # Notificaciones push
npm install @capacitor/app             # Ciclo de vida de la app
npm install @capacitor/network         # Estado de conexión
npm install @capacitor/storage         # Almacenamiento local
```

### Opcionales

```bash
npm install @capacitor/share           # Compartir contenido
npm install @capacitor/browser         # Abrir URLs externas
npm install @capacitor/device          # Info del dispositivo
```

---

## Hooks Personalizados

### usePlatform.js

```javascript
// src/hooks/usePlatform.js
import { Capacitor } from '@capacitor/core';

export function usePlatform() {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  return {
    isNative,
    isWeb: !isNative,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    platform,
  };
}
```

### useStatusBar.js

```javascript
// src/hooks/useStatusBar.js
import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { usePlatform } from './usePlatform';

export function useStatusBar(options = {}) {
  const { isNative } = usePlatform();
  const { style = Style.Light, backgroundColor = '#16a34a' } = options;

  useEffect(() => {
    if (!isNative) return;

    const setStatusBar = async () => {
      await StatusBar.setStyle({ style });
      await StatusBar.setBackgroundColor({ color: backgroundColor });
    };

    setStatusBar();
  }, [isNative, style, backgroundColor]);
}
```

### useKeyboard.js

```javascript
// src/hooks/useKeyboard.js
import { useEffect, useState } from 'react';
import { Keyboard } from '@capacitor/keyboard';
import { usePlatform } from './usePlatform';

export function useKeyboard() {
  const { isNative } = usePlatform();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!isNative) return;

    const showListener = Keyboard.addListener('keyboardWillShow', (info) => {
      setIsKeyboardOpen(true);
      setKeyboardHeight(info.keyboardHeight);
    });

    const hideListener = Keyboard.addListener('keyboardWillHide', () => {
      setIsKeyboardOpen(false);
      setKeyboardHeight(0);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [isNative]);

  return { isKeyboardOpen, keyboardHeight };
}
```

### usePushNotifications.js

```javascript
// src/hooks/usePushNotifications.js
import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { usePlatform } from './usePlatform';

export function usePushNotifications() {
  const { isNative } = usePlatform();
  const [token, setToken] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt');

  useEffect(() => {
    if (!isNative) return;

    const registerNotifications = async () => {
      // Verificar permisos
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      setPermissionStatus(permStatus.receive);

      if (permStatus.receive !== 'granted') {
        return;
      }

      // Registrar para push
      await PushNotifications.register();
    };

    // Listeners
    PushNotifications.addListener('registration', (token) => {
      setToken(token.value);
      // Enviar token al backend
      console.log('Push token:', token.value);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action:', notification);
      // Navegar según el tipo de notificación
    });

    registerNotifications();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [isNative]);

  return { token, permissionStatus };
}
```

### useCamera.js

```javascript
// src/hooks/useCamera.js
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { usePlatform } from './usePlatform';

export function useCamera() {
  const { isNative } = usePlatform();

  const takePhoto = async (options = {}) => {
    const defaultOptions = {
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt, // Pregunta: cámara o galería
      ...options,
    };

    try {
      const photo = await Camera.getPhoto(defaultOptions);
      return photo;
    } catch (error) {
      console.error('Camera error:', error);
      throw error;
    }
  };

  const pickFromGallery = async () => {
    return takePhoto({ source: CameraSource.Photos });
  };

  const takeFromCamera = async () => {
    return takePhoto({ source: CameraSource.Camera });
  };

  return { takePhoto, pickFromGallery, takeFromCamera, isNative };
}
```

### useHaptics.js

```javascript
// src/hooks/useHaptics.js
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { usePlatform } from './usePlatform';

export function useHaptics() {
  const { isNative } = usePlatform();

  const impact = async (style = ImpactStyle.Medium) => {
    if (!isNative) return;
    await Haptics.impact({ style });
  };

  const notification = async (type = NotificationType.Success) => {
    if (!isNative) return;
    await Haptics.notification({ type });
  };

  const vibrate = async (duration = 300) => {
    if (!isNative) return;
    await Haptics.vibrate({ duration });
  };

  return {
    impactLight: () => impact(ImpactStyle.Light),
    impactMedium: () => impact(ImpactStyle.Medium),
    impactHeavy: () => impact(ImpactStyle.Heavy),
    notificationSuccess: () => notification(NotificationType.Success),
    notificationWarning: () => notification(NotificationType.Warning),
    notificationError: () => notification(NotificationType.Error),
    vibrate,
  };
}
```

---

## Estructura de Carpetas

```
src/
├── App.jsx                    # Detecta plataforma, renderiza Web o Mobile
├── WebApp.jsx                 # App web completa (existente)
├── MobileApp.jsx              # App móvil simplificada (nuevo)
│
├── hooks/
│   ├── usePlatform.js         # Detección de plataforma
│   ├── useStatusBar.js        # Control de status bar
│   ├── useKeyboard.js         # Manejo de teclado
│   ├── usePushNotifications.js # Push notifications
│   ├── useCamera.js           # Cámara y galería
│   ├── useHaptics.js          # Vibración táctil
│   └── useMobileNavigation.js # Navegación por rol
│
├── layouts/
│   ├── WebLayout.jsx          # Sidebar + header (web)
│   └── MobileLayout.jsx       # Bottom nav + safe areas (móvil)
│
├── pages/
│   ├── dashboard/             # Páginas web completas (existentes)
│   └── mobile/                # Páginas móviles simplificadas
│       ├── home/
│       │   ├── TrainerHomePage.jsx
│       │   ├── ParentHomePage.jsx
│       │   └── PlayerHomePage.jsx
│       ├── attendance/
│       │   └── QuickAttendancePage.jsx
│       ├── children/
│       │   └── MyChildrenPage.jsx
│       ├── payments/
│       │   └── MobilePaymentsPage.jsx
│       └── shared/
│           ├── MobileCalendarPage.jsx
│           └── MobileProfilePage.jsx
│
├── components/
│   ├── mobile/                # Componentes solo móvil
│   │   ├── BottomNav.jsx
│   │   ├── MobileHeader.jsx
│   │   ├── SwipeableCard.jsx
│   │   ├── QuickAttendanceList.jsx
│   │   ├── ChildSwitcher.jsx
│   │   └── PaymentStatusCard.jsx
│   └── shared/                # Componentes web + móvil
│       └── ... (existentes)
│
└── styles/
    └── mobile.css             # Estilos específicos móvil
```

---

## App.jsx Principal

```jsx
// src/App.jsx
import { usePlatform } from '@/hooks/usePlatform';
import { useAuth } from '@/context/AuthContext';
import WebApp from './WebApp';
import MobileApp from './MobileApp';

function App() {
  const { isNative } = usePlatform();
  const { activeRole, isAuthenticated } = useAuth();

  // Roles que usan la app móvil simplificada
  const mobileRoles = ['trainer', 'parent', 'player'];

  // Si es app nativa Y es un rol móvil → MobileApp
  if (isNative && isAuthenticated && mobileRoles.includes(activeRole)) {
    return <MobileApp />;
  }

  // Web browser o roles admin (owner, accountant, super_admin) → WebApp completa
  return <WebApp />;
}

export default App;
```

---

## MobileLayout.jsx

```jsx
// src/layouts/MobileLayout.jsx
import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/mobile/BottomNav';
import MobileHeader from '@/components/mobile/MobileHeader';
import { useStatusBar } from '@/hooks/useStatusBar';

export default function MobileLayout() {
  useStatusBar();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header con safe area top */}
      <MobileHeader />

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation con safe area bottom */}
      <BottomNav />
    </div>
  );
}
```

---

## BottomNav.jsx

```jsx
// src/components/mobile/BottomNav.jsx
import { NavLink } from 'react-router-dom';
import { useMobileNavigation } from '@/hooks/useMobileNavigation';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const { navItems } = useMobileNavigation();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-border z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-full h-full gap-1',
                'text-muted hover:text-primary transition-colors',
                isActive && 'text-primary'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
```

---

## CSS Móvil

```css
/* src/styles/mobile.css */

/* Safe Areas */
.safe-area-top {
  padding-top: env(safe-area-inset-top, 0);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.safe-area-left {
  padding-left: env(safe-area-inset-left, 0);
}

.safe-area-right {
  padding-right: env(safe-area-inset-right, 0);
}

/* Evitar zoom en inputs iOS */
input, select, textarea {
  font-size: 16px !important;
}

/* Touch targets mínimos */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Ocultar scrollbar pero mantener funcionalidad */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Swipeable card */
.swipeable-card {
  touch-action: pan-x;
  user-select: none;
}

/* Pull to refresh indicator */
.pull-to-refresh {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  transition: transform 0.2s;
}

.pull-to-refresh.pulling {
  transform: translateX(-50%) translateY(50px);
}

/* Bottom nav active indicator */
.nav-active-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--primary);
}
```

---

## Skills Necesarios

### 1. Capacitor Expert (Nuevo)

```markdown
# Skill: Capacitor Expert

Experto en desarrollo móvil con Capacitor para Widdo.

## Triggers
- "configurar capacitor"
- "problema en iOS/Android"
- "plugin de capacitor"
- "build móvil"

## Conocimientos
- Configuración de capacitor.config.ts
- Plugins nativos (Camera, Push, Haptics, etc.)
- Safe areas y status bar
- Build y deploy a stores
- Debugging en dispositivos
- Manejo de permisos nativos
```

### 2. Mobile UX Patterns (Nuevo)

```markdown
# Skill: Mobile UX Patterns

Patrones de UX específicos para la app móvil.

## Triggers
- "diseñar pantalla móvil"
- "componente móvil"
- "navegación móvil"
- "gestos táctiles"

## Conocimientos
- Bottom navigation
- Swipe gestures
- Pull to refresh
- Touch targets (44px mínimo)
- Haptic feedback
- Loading states móviles
```

### 3. Design Patterns (Existente - Actualizar)

Ya existe en `frontend/.claude/skills/design-patterns.md`. Necesita incluir:
- Safe areas CSS
- Bottom navigation patterns
- Swipeable components
- Mobile-specific breakpoints

---

## Fases de Implementación

### Fase 1: Infraestructura Base (2-3 días)

**Tareas:**
- [ ] Instalar Capacitor y plugins core
- [ ] Crear `capacitor.config.ts`
- [ ] Configurar scripts en `package.json`
- [ ] Crear hooks base (`usePlatform`, `useStatusBar`, `useKeyboard`)
- [ ] Crear `MobileLayout.jsx` con safe areas
- [ ] Crear `BottomNav.jsx` básico
- [ ] Modificar `App.jsx` para detectar plataforma
- [ ] Agregar CSS de safe areas

**Entregable:** App detecta plataforma y muestra layout diferente

---

### Fase 2: Navegación por Rol (2-3 días)

**Tareas:**
- [ ] Implementar `useMobileNavigation.js` con items por rol
- [ ] Crear rutas móviles en router
- [ ] Crear páginas Home por rol (Trainer, Parent, Player)
- [ ] Implementar guards de navegación móvil
- [ ] Probar navegación en cada rol

**Entregable:** Cada rol ve su navegación específica

---

### Fase 3: Entrenador (3-4 días)

**Tareas:**
- [ ] `TrainerHomePage` - Dashboard con próximas sesiones
- [ ] `QuickAttendancePage` - Lista de sesiones pendientes
- [ ] `SessionAttendancePage` - Toma de asistencia con swipe
- [ ] `SwipeableCard` - Componente para swipe presente/ausente
- [ ] `TrainerPlayersPage` - Lista de jugadores (solo lectura)
- [ ] Integrar haptics en acciones de asistencia

**Entregable:** Entrenador puede tomar asistencia rápida

---

### Fase 4: Padre/Acudiente (3-4 días)

**Tareas:**
- [ ] `ParentHomePage` - Dashboard con hijos, pagos pendientes
- [ ] `MyChildrenPage` - Lista de hijos con selector
- [ ] `ChildSwitcher` - Componente para cambiar hijo activo
- [ ] `ChildDetailPage` - Perfil del hijo (solo lectura)
- [ ] `MobilePaymentsPage` - Estado de pagos
- [ ] `PaymentDetailPage` - Detalle con opción de subir comprobante
- [ ] Integrar cámara para comprobantes

**Entregable:** Padre ve info de hijos y puede subir comprobantes

---

### Fase 5: Jugador (2-3 días)

**Tareas:**
- [ ] `PlayerHomePage` - Dashboard personal
- [ ] Reutilizar calendario de sesiones
- [ ] Reutilizar vista de pagos (solo lectura)
- [ ] `MobileProfilePage` - Edición básica de perfil

**Entregable:** Jugador ve sus sesiones y pagos

---

### Fase 6: Compartidos (2-3 días)

**Tareas:**
- [ ] `MobileCalendarPage` - Calendario adaptado a móvil
- [ ] `MobileProfilePage` - Perfil y configuración
- [ ] `NotificationsPage` - Centro de notificaciones
- [ ] Pull-to-refresh en todas las listas
- [ ] Estados vacíos móviles
- [ ] Loading skeletons móviles

**Entregable:** Componentes compartidos funcionando

---

### Fase 7: Push Notifications (2-3 días)

**Tareas:**
- [ ] Configurar Firebase Cloud Messaging (o alternativa)
- [ ] Implementar `usePushNotifications`
- [ ] Backend: Endpoint para guardar tokens
- [ ] Backend: Jobs para enviar notificaciones
- [ ] Notificaciones por rol (ver mobile-app-architecture.md)
- [ ] Deep linking desde notificaciones

**Entregable:** Push notifications funcionando

---

### Fase 8: Polish y Testing (3-4 días)

**Tareas:**
- [ ] Splash screen con logo y colores
- [ ] App icons para iOS y Android
- [ ] Testing en dispositivos reales
- [ ] Optimización de performance
- [ ] Manejo de errores y estados offline
- [ ] Revisión de UX en cada flujo

**Entregable:** App pulida lista para stores

---

### Fase 9: Deploy a Stores (3-5 días)

**Tareas:**
- [ ] Crear cuenta Apple Developer ($99/año)
- [ ] Crear cuenta Google Play Developer ($25 única vez)
- [ ] Preparar screenshots y descripciones
- [ ] Generar builds de producción
- [ ] Subir a App Store Connect
- [ ] Subir a Google Play Console
- [ ] Proceso de revisión (1-7 días)

**Entregable:** App publicada en stores

---

## Timeline Estimado

| Fase | Duración | Acumulado |
|------|----------|-----------|
| 1. Infraestructura | 2-3 días | 3 días |
| 2. Navegación por Rol | 2-3 días | 6 días |
| 3. Entrenador | 3-4 días | 10 días |
| 4. Padre | 3-4 días | 14 días |
| 5. Jugador | 2-3 días | 17 días |
| 6. Compartidos | 2-3 días | 20 días |
| 7. Push Notifications | 2-3 días | 23 días |
| 8. Polish | 3-4 días | 27 días |
| 9. Deploy | 3-5 días | 32 días |

**Total: ~5-6 semanas** para app completa en stores

---

## Checklist Pre-Lanzamiento

### Funcional
- [ ] Login funciona en móvil
- [ ] Cada rol ve su navegación correcta
- [ ] Todas las acciones rápidas funcionan
- [ ] Cámara funciona para comprobantes
- [ ] Push notifications llegan
- [ ] Deep links funcionan

### UX/UI
- [ ] Safe areas respetadas (notch, home indicator)
- [ ] Touch targets >= 44px
- [ ] Font size >= 16px en inputs
- [ ] Haptic feedback en acciones
- [ ] Estados de carga claros
- [ ] Estados vacíos informativos

### Performance
- [ ] App carga en < 3 segundos
- [ ] Navegación fluida (60fps)
- [ ] Sin memory leaks
- [ ] Imágenes optimizadas

### Stores
- [ ] Íconos en todas las resoluciones
- [ ] Screenshots para cada tamaño
- [ ] Descripción y keywords
- [ ] Política de privacidad URL
- [ ] Categoría correcta (Sports)

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Web local
npm run mobile:ios            # Build + abrir Xcode
npm run mobile:android        # Build + abrir Android Studio

# Sincronizar cambios
npm run cap:sync              # Sincroniza web → nativo

# Debug
npx cap run ios --livereload  # Live reload en iOS
npx cap run android --livereload  # Live reload en Android

# Build producción
npm run build
npx cap sync
# Luego abrir en Xcode/Android Studio y Archive/Build Release
```
