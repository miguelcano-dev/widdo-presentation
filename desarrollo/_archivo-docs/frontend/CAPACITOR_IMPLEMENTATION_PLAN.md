# Plan de Implementación - Capacitor para Widdo

**Fecha de creación:** 24 de Enero de 2026
**Estado:** Pendiente
**Objetivo:** Convertir la app web React en apps nativas iOS y Android

---

## Resumen Ejecutivo

Capacitor permitirá publicar Widdo en App Store y Google Play reutilizando el código React existente. El proceso incluye configuración inicial, ajustes de UI para móvil, testing y publicación.

---

## Fase 1: Configuración Inicial

### 1.1 Instalar Dependencias Base
- [ ] **Instalar Capacitor core y CLI**
  ```bash
  cd /Users/miguelcano/Desktop/todo/Widdo/desarrollo/frontend
  npm install @capacitor/core @capacitor/cli
  ```

- [ ] **Inicializar Capacitor**
  ```bash
  npx cap init "Widdo" "co.widdo.app" --web-dir=dist
  ```
  > Esto crea `capacitor.config.ts` en la raíz del frontend

### 1.2 Agregar Plataformas
- [ ] **Agregar iOS** (requiere Mac con Xcode)
  ```bash
  npm install @capacitor/ios
  npx cap add ios
  ```

- [ ] **Agregar Android** (requiere Android Studio)
  ```bash
  npm install @capacitor/android
  npx cap add android
  ```

### 1.3 Instalar Plugins Esenciales
- [ ] **Plugins de UI/UX**
  ```bash
  npm install @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard @capacitor/app @capacitor/haptics
  ```

- [ ] **Plugins de funcionalidad** (según necesites)
  ```bash
  npm install @capacitor/push-notifications  # Notificaciones
  npm install @capacitor/camera              # Fotos de jugadores
  npm install @capacitor/filesystem          # Documentos
  npm install @capacitor/preferences         # Storage seguro (reemplaza localStorage)
  npm install @capacitor/network             # Detectar conexión
  npm install @capacitor/share               # Compartir contenido
  ```

### 1.4 Generador de Assets
- [ ] **Instalar generador**
  ```bash
  npm install @capacitor/assets --save-dev
  ```

---

## Fase 2: Configuración de Capacitor

### 2.1 Archivo de Configuración
- [ ] **Crear/editar `capacitor.config.ts`**

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.widdo.app',
  appName: 'Widdo',
  webDir: 'dist',

  // ⚠️ DESARROLLO: Descomentar para live reload
  // server: {
  //   url: 'http://192.168.1.XXX:5173',  // Tu IP local
  //   cleartext: true
  // },

  ios: {
    contentInset: 'automatic',
    scheme: 'Widdo',
    preferredContentMode: 'mobile'
  },

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false  // true solo en desarrollo
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',        // Color de fondo del splash
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'dark',                     // 'dark' o 'light'
      backgroundColor: '#ffffff'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
```

---

## Fase 3: Assets (Splash Screen e Iconos)

### 3.1 Preparar Imágenes Fuente
- [ ] **Crear carpeta `resources/` en frontend**
  ```
  frontend/
  └── resources/
      ├── icon-only.png          # 1024x1024 - Ícono sin fondo
      ├── icon-foreground.png    # 1024x1024 - Ícono (Android adaptive)
      ├── icon-background.png    # 1024x1024 - Fondo del ícono
      ├── splash.png             # 2732x2732 - Splash screen
      └── splash-dark.png        # 2732x2732 - Splash modo oscuro (opcional)
  ```

  > **Especificaciones:**
  > - Formato: PNG con transparencia (excepto background)
  > - El ícono debe tener padding interno (~20%) para que no se corte
  > - Splash: logo centrado, fondo sólido o gradiente simple

### 3.2 Generar Assets
- [ ] **Ejecutar generador**
  ```bash
  npx capacitor-assets generate
  ```
  > Esto genera automáticamente todos los tamaños para iOS y Android

---

## Fase 4: Ajustes de UI para Móvil

### 4.1 Viewport y Meta Tags
- [ ] **Actualizar `index.html`**
  ```html
  <head>
    <!-- Viewport optimizado para móvil -->
    <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">

    <!-- iOS specific -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Widdo">

    <!-- Android specific -->
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="#ffffff">

    <!-- Prevent phone number detection -->
    <meta name="format-detection" content="telephone=no">
  </head>
  ```

### 4.2 Safe Areas CSS
- [ ] **Agregar variables CSS en `index.css`**
  ```css
  :root {
    --safe-area-top: env(safe-area-inset-top);
    --safe-area-bottom: env(safe-area-inset-bottom);
    --safe-area-left: env(safe-area-inset-left);
    --safe-area-right: env(safe-area-inset-right);
  }

  /* Contenedor principal de la app */
  #root {
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height */
    padding-top: var(--safe-area-top);
    padding-bottom: var(--safe-area-bottom);
  }

  /* Para elementos fixed en bottom (ej: bottom nav) */
  .fixed-bottom-safe {
    padding-bottom: var(--safe-area-bottom);
  }

  /* Para headers fixed */
  .fixed-top-safe {
    padding-top: var(--safe-area-top);
  }

  /* Prevenir selección de texto en elementos interactivos */
  button, a, [role="button"] {
    -webkit-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  /* Smooth scrolling nativo */
  .scroll-container {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }
  ```

### 4.3 Tailwind Config para Safe Areas
- [ ] **Actualizar `tailwind.config.js`**
  ```javascript
  module.exports = {
    theme: {
      extend: {
        padding: {
          'safe-top': 'env(safe-area-inset-top)',
          'safe-bottom': 'env(safe-area-inset-bottom)',
          'safe-left': 'env(safe-area-inset-left)',
          'safe-right': 'env(safe-area-inset-right)',
        },
        margin: {
          'safe-top': 'env(safe-area-inset-top)',
          'safe-bottom': 'env(safe-area-inset-bottom)',
        },
        height: {
          'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
          'screen-dvh': '100dvh',
        },
        minHeight: {
          'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
          'screen-dvh': '100dvh',
        },
      },
    },
  }
  ```

---

## Fase 5: Menú Móvil Diferenciado

### 5.1 Hook para Detectar Plataforma
- [ ] **Crear `src/hooks/usePlatform.js`**
  ```javascript
  import { useState, useEffect } from 'react';
  import { Capacitor } from '@capacitor/core';

  export const usePlatform = () => {
    const [platform, setPlatform] = useState({
      isNative: false,
      isIOS: false,
      isAndroid: false,
      isWeb: true,
      platform: 'web'
    });

    useEffect(() => {
      const isNative = Capacitor.isNativePlatform();
      const currentPlatform = Capacitor.getPlatform();

      setPlatform({
        isNative,
        isIOS: currentPlatform === 'ios',
        isAndroid: currentPlatform === 'android',
        isWeb: currentPlatform === 'web',
        platform: currentPlatform
      });
    }, []);

    return platform;
  };

  export default usePlatform;
  ```

### 5.2 Componente Bottom Navigation (Móvil)
- [ ] **Crear `src/components/navigation/MobileBottomNav.jsx`**
  ```jsx
  import { NavLink, useLocation } from 'react-router-dom';
  import { Home, Users, Calendar, CreditCard, Menu } from 'lucide-react';
  import { Haptics, ImpactStyle } from '@capacitor/haptics';
  import { usePlatform } from '@/hooks/usePlatform';

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Inicio' },
    { path: '/dashboard/players', icon: Users, label: 'Jugadores' },
    { path: '/dashboard/calendar', icon: Calendar, label: 'Calendario' },
    { path: '/dashboard/payments', icon: CreditCard, label: 'Pagos' },
    { path: '/dashboard/more', icon: Menu, label: 'Más' },
  ];

  const MobileBottomNav = () => {
    const location = useLocation();
    const { isNative } = usePlatform();

    const handlePress = async () => {
      if (isNative) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    };

    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 z-50 pb-safe-bottom">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
                            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handlePress}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    );
  };

  export default MobileBottomNav;
  ```

### 5.3 Integrar Navegación Condicional
- [ ] **Modificar layout principal para usar navegación condicional**

  Ejemplo en tu componente de layout:
  ```jsx
  import { usePlatform } from '@/hooks/usePlatform';
  import MobileBottomNav from '@/components/navigation/MobileBottomNav';
  import DesktopSidebar from '@/components/navigation/DesktopSidebar';

  const DashboardLayout = ({ children }) => {
    const { isNative } = usePlatform();

    return (
      <div className="min-h-screen-dvh">
        {/* Sidebar solo en web */}
        {!isNative && <DesktopSidebar />}

        {/* Contenido principal */}
        <main className={`
          ${!isNative ? 'ml-64' : ''}
          ${isNative ? 'pb-20' : ''}
        `}>
          {children}
        </main>

        {/* Bottom nav solo en móvil nativo */}
        {isNative && <MobileBottomNav />}
      </div>
    );
  };
  ```

### 5.4 Página "Más" para Opciones Adicionales
- [ ] **Crear página de menú expandido para móvil**

  Como el bottom nav tiene espacio limitado (4-5 items), crear una página "Más" que muestre las demás opciones:
  - Configuración
  - Mi Perfil
  - Entrenadores
  - Categorías
  - Reportes
  - Ayuda
  - Cerrar Sesión

---

## Fase 6: Inicialización de la App

### 6.1 Componente de Inicialización
- [ ] **Crear `src/components/app/AppInitializer.jsx`**
  ```jsx
  import { useEffect, useState } from 'react';
  import { Capacitor } from '@capacitor/core';
  import { SplashScreen } from '@capacitor/splash-screen';
  import { StatusBar, Style } from '@capacitor/status-bar';
  import { App as CapApp } from '@capacitor/app';
  import { Network } from '@capacitor/network';

  const AppInitializer = ({ children, onReady }) => {
    const [isReady, setIsReady] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
      const initializeApp = async () => {
        if (Capacitor.isNativePlatform()) {
          try {
            // Configurar Status Bar
            await StatusBar.setStyle({ style: Style.Dark });

            if (Capacitor.getPlatform() === 'android') {
              await StatusBar.setBackgroundColor({ color: '#ffffff' });
            }

            // Manejar botón atrás en Android
            CapApp.addListener('backButton', ({ canGoBack }) => {
              if (canGoBack) {
                window.history.back();
              } else {
                CapApp.exitApp();
              }
            });

            // Detectar cambios de conexión
            Network.addListener('networkStatusChange', (status) => {
              setIsOffline(!status.connected);
            });

            // Verificar conexión inicial
            const status = await Network.getStatus();
            setIsOffline(!status.connected);

            // Ocultar splash screen
            await SplashScreen.hide();

          } catch (error) {
            console.error('Error initializing app:', error);
            await SplashScreen.hide();
          }
        }

        setIsReady(true);
        onReady?.();
      };

      initializeApp();

      // Cleanup
      return () => {
        if (Capacitor.isNativePlatform()) {
          CapApp.removeAllListeners();
          Network.removeAllListeners();
        }
      };
    }, [onReady]);

    if (!isReady) {
      return null; // O un loading spinner
    }

    return (
      <>
        {isOffline && (
          <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-center py-2 text-sm z-[9999] pt-safe-top">
            Sin conexión a internet
          </div>
        )}
        {children}
      </>
    );
  };

  export default AppInitializer;
  ```

### 6.2 Integrar en main.jsx o App.jsx
- [ ] **Envolver la app con AppInitializer**
  ```jsx
  import AppInitializer from '@/components/app/AppInitializer';

  function App() {
    return (
      <AppInitializer>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </AppInitializer>
    );
  }
  ```

---

## Fase 7: Ajustes Específicos

### 7.1 Storage Seguro (Reemplazar localStorage)
- [ ] **Crear `src/utils/storage.js`**
  ```javascript
  import { Capacitor } from '@capacitor/core';
  import { Preferences } from '@capacitor/preferences';

  export const storage = {
    async get(key) {
      if (Capacitor.isNativePlatform()) {
        const { value } = await Preferences.get({ key });
        return value ? JSON.parse(value) : null;
      }
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    },

    async set(key, value) {
      const stringValue = JSON.stringify(value);
      if (Capacitor.isNativePlatform()) {
        await Preferences.set({ key, value: stringValue });
      } else {
        localStorage.setItem(key, stringValue);
      }
    },

    async remove(key) {
      if (Capacitor.isNativePlatform()) {
        await Preferences.remove({ key });
      } else {
        localStorage.removeItem(key);
      }
    },

    async clear() {
      if (Capacitor.isNativePlatform()) {
        await Preferences.clear();
      } else {
        localStorage.clear();
      }
    }
  };
  ```

### 7.2 Abrir Links Externos
- [ ] **Crear helper para links externos**
  ```javascript
  import { Capacitor } from '@capacitor/core';
  import { Browser } from '@capacitor/browser';

  export const openExternalLink = async (url) => {
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url });
    } else {
      window.open(url, '_blank');
    }
  };
  ```

### 7.3 Variables de Entorno
- [ ] **Crear `.env.production` para producción**
  ```bash
  VITE_API_URL=https://api.widdo.co/api
  VITE_APP_ENV=production
  ```

- [ ] **Asegurar que la API URL funcione en móvil**
  > En desarrollo móvil, `localhost` no funciona. Usar IP local o URL de staging.

---

## Fase 8: Scripts de Build

### 8.1 Actualizar package.json
- [ ] **Agregar scripts de Capacitor**
  ```json
  {
    "scripts": {
      "dev": "vite --host",
      "build": "vite build",
      "preview": "vite preview",

      "cap:sync": "npx cap sync",
      "cap:build": "npm run build && npm run cap:sync",
      "cap:ios": "npm run cap:build && npx cap open ios",
      "cap:android": "npm run cap:build && npx cap open android",
      "cap:assets": "npx capacitor-assets generate",
      "cap:live:ios": "npx cap run ios --livereload --external",
      "cap:live:android": "npx cap run android --livereload --external"
    }
  }
  ```

---

## Fase 9: Testing

### 9.1 Testing en Simulador/Emulador
- [ ] **iOS Simulator** (requiere Mac)
  ```bash
  npm run cap:build
  npx cap open ios
  # En Xcode: Seleccionar simulador → Run
  ```

- [ ] **Android Emulator**
  ```bash
  npm run cap:build
  npx cap open android
  # En Android Studio: Seleccionar emulador → Run
  ```

### 9.2 Testing en Dispositivo Físico
- [ ] **iOS** (requiere Apple Developer Account o cable USB)
- [ ] **Android** (habilitar Developer Options → USB Debugging)

### 9.3 Checklist de Testing

#### Funcionalidad
- [ ] Login/logout funciona
- [ ] Navegación entre pantallas
- [ ] Botón "atrás" de Android
- [ ] Formularios y teclado
- [ ] Carga de imágenes
- [ ] Upload de documentos
- [ ] Pull-to-refresh (si aplica)
- [ ] Push notifications (si aplica)
- [ ] Deep links (si aplica)
- [ ] Modo offline (mensaje de error)

#### Visual
- [ ] Splash screen correcto
- [ ] Ícono de app correcto
- [ ] Safe areas (notch, home indicator)
- [ ] Status bar visible
- [ ] Bottom navigation funcional
- [ ] Fuentes cargan bien
- [ ] Imágenes no se cortan
- [ ] Dark mode (si aplica)
- [ ] Orientación portrait bloqueada (si aplica)

#### Performance
- [ ] Tiempo de carga < 3 segundos
- [ ] Scroll suave
- [ ] Sin crashes
- [ ] Memoria estable

---

## Fase 10: Preparación para Stores

### 10.1 Información Requerida (ambas stores)
- [ ] **Nombre de la app:** Widdo
- [ ] **Descripción corta:** (máx 80 caracteres)
- [ ] **Descripción larga:** (máx 4000 caracteres)
- [ ] **Categoría:** Deportes / Productividad
- [ ] **Keywords/Tags**
- [ ] **URL de política de privacidad** (OBLIGATORIO)
- [ ] **URL de términos de servicio**
- [ ] **Email de soporte**

### 10.2 Screenshots Requeridos

#### iOS (App Store)
- [ ] iPhone 6.7" (1290 x 2796) - iPhone 14 Pro Max
- [ ] iPhone 6.5" (1284 x 2778) - iPhone 14 Plus
- [ ] iPhone 5.5" (1242 x 2208) - iPhone 8 Plus
- [ ] iPad Pro 12.9" (2048 x 2732)
- [ ] iPad Pro 11" (1668 x 2388)

#### Android (Google Play)
- [ ] Phone (1080 x 1920 mínimo)
- [ ] 7" Tablet (1200 x 1920)
- [ ] 10" Tablet (1800 x 2560)

### 10.3 Assets de Marketing
- [ ] Feature graphic (1024 x 500) - Solo Android
- [ ] Promo video (opcional)

---

## Fase 11: Publicación iOS (App Store)

### 11.1 Requisitos
- [ ] Mac con Xcode instalado
- [ ] Apple Developer Account ($99/año)
- [ ] Certificados configurados en Xcode

### 11.2 Pasos de Publicación

1. **Build de Release**
   ```bash
   npm run build
   npx cap sync ios
   npx cap open ios
   ```

2. **En Xcode:**
   - [ ] Signing & Capabilities → Seleccionar Team
   - [ ] General → Ajustar Version (ej: 1.0.0) y Build (ej: 1)
   - [ ] Product → Archive
   - [ ] Window → Organizer → Distribute App → App Store Connect

3. **En App Store Connect:**
   - [ ] Crear nueva app
   - [ ] Completar información de la app
   - [ ] Subir screenshots
   - [ ] Configurar precios (Gratis)
   - [ ] Submit for Review

### 11.3 Tiempos Estimados
- Review inicial: 24-48 horas
- Rechazos comunes: Descripciones incompletas, crashes, contenido inapropiado

---

## Fase 12: Publicación Android (Google Play)

### 12.1 Requisitos
- [ ] Google Play Console Account ($25 una sola vez)
- [ ] Keystore para firmar la app

### 12.2 Crear Keystore
```bash
cd /Users/miguelcano/Desktop/todo/Widdo/desarrollo/frontend/android

keytool -genkey -v -keystore widdo-release.keystore -alias widdo -keyalg RSA -keysize 2048 -validity 10000
```

**⚠️ IMPORTANTE: Guarda el keystore y la contraseña de forma segura. Si los pierdes, no podrás actualizar la app.**

### 12.3 Configurar Firma

- [ ] **Editar `android/app/build.gradle`**
  ```gradle
  android {
      ...
      signingConfigs {
          release {
              storeFile file('widdo-release.keystore')
              storePassword 'TU_PASSWORD_AQUI'
              keyAlias 'widdo'
              keyPassword 'TU_PASSWORD_AQUI'
          }
      }
      buildTypes {
          release {
              signingConfig signingConfigs.release
              minifyEnabled true
              proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
          }
      }
  }
  ```

### 12.4 Generar AAB (Android App Bundle)

1. **Build**
   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```

2. **En Android Studio:**
   - [ ] Build → Generate Signed Bundle / APK
   - [ ] Seleccionar Android App Bundle
   - [ ] Seleccionar keystore
   - [ ] Build release

### 12.5 En Google Play Console

- [ ] Crear aplicación
- [ ] Completar información (ficha de Play Store)
- [ ] Subir AAB
- [ ] Completar cuestionario de clasificación de contenido
- [ ] Configurar precios (Gratis)
- [ ] Subir screenshots
- [ ] Enviar a revisión

### 12.6 Tiempos Estimados
- Review inicial: 3-7 días (primera vez puede ser más)
- Actualizaciones: 1-3 días

---

## Fase 13: Monitoreo con Firebase

Firebase incluye **Crashlytics** (errores), **Analytics** (uso) y **Push Notifications** en un solo SDK gratuito.

### 13.1 Crear Proyecto en Firebase
- [ ] Ir a [Firebase Console](https://console.firebase.google.com)
- [ ] Click en "Agregar proyecto"
- [ ] Nombre: "Widdo"
- [ ] Habilitar Google Analytics (recomendado)
- [ ] Crear proyecto

### 13.2 Registrar Apps en Firebase

#### iOS:
- [ ] En Firebase Console → Agregar app → iOS
- [ ] Bundle ID: `co.widdo.app`
- [ ] Descargar `GoogleService-Info.plist`
- [ ] **Guardar archivo para después** (se copia a `ios/App/App/`)

#### Android:
- [ ] En Firebase Console → Agregar app → Android
- [ ] Package name: `co.widdo.app`
- [ ] Descargar `google-services.json`
- [ ] **Guardar archivo para después** (se copia a `android/app/`)

### 13.3 Instalar Plugins de Firebase
- [ ] **Instalar dependencias**
  ```bash
  npm install @capacitor-firebase/crashlytics @capacitor-firebase/analytics @capacitor-firebase/messaging
  ```

### 13.4 Configurar iOS
- [ ] **Copiar archivo de configuración**
  ```bash
  cp GoogleService-Info.plist ios/App/App/
  ```

- [ ] **Abrir Xcode y agregar el archivo al proyecto**
  ```bash
  npx cap open ios
  ```
  En Xcode: Click derecho en `App/App` → Add Files → Seleccionar `GoogleService-Info.plist`

- [ ] **Editar `ios/App/App/AppDelegate.swift`** - Agregar import y configuración:
  ```swift
  import UIKit
  import Capacitor
  import FirebaseCore  // ← Agregar

  @UIApplicationMain
  class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
      FirebaseApp.configure()  // ← Agregar
      return true
    }
    // ... resto del código
  }
  ```

### 13.5 Configurar Android
- [ ] **Copiar archivo de configuración**
  ```bash
  cp google-services.json android/app/
  ```

- [ ] **Editar `android/build.gradle`** (nivel proyecto) - Agregar classpath:
  ```gradle
  buildscript {
      repositories {
          google()
          mavenCentral()
      }
      dependencies {
          classpath 'com.android.tools.build:gradle:8.0.0'
          classpath 'com.google.gms:google-services:4.4.0'  // ← Agregar
      }
  }
  ```

- [ ] **Editar `android/app/build.gradle`** (nivel app) - Agregar plugin:
  ```gradle
  plugins {
      id 'com.android.application'
      id 'com.google.gms.google-services'  // ← Agregar
  }

  // Al final del archivo, agregar dependencias de Firebase:
  dependencies {
      implementation platform('com.google.firebase:firebase-bom:32.7.0')
      implementation 'com.google.firebase:firebase-crashlytics'
      implementation 'com.google.firebase:firebase-analytics'
      implementation 'com.google.firebase:firebase-messaging'
  }
  ```

- [ ] **Para Crashlytics, agregar en `android/build.gradle` (nivel proyecto):**
  ```gradle
  dependencies {
      // ... existentes
      classpath 'com.google.firebase:firebase-crashlytics-gradle:2.9.9'  // ← Agregar
  }
  ```

- [ ] **Y en `android/app/build.gradle` (nivel app):**
  ```gradle
  plugins {
      id 'com.android.application'
      id 'com.google.gms.google-services'
      id 'com.google.firebase.crashlytics'  // ← Agregar
  }
  ```

### 13.6 Crear Utilidad de Firebase
- [ ] **Crear `src/utils/firebase.js`**
  ```javascript
  import { Capacitor } from '@capacitor/core';
  import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
  import { FirebaseAnalytics } from '@capacitor-firebase/analytics';

  export const firebase = {
    // Inicializar Firebase
    async init() {
      if (!Capacitor.isNativePlatform()) {
        console.log('Firebase: Solo disponible en plataformas nativas');
        return;
      }

      try {
        // Habilitar Crashlytics
        await FirebaseCrashlytics.setEnabled({ enabled: true });
        console.log('Firebase Crashlytics iniciado');

        // Habilitar Analytics
        await FirebaseAnalytics.setEnabled({ enabled: true });
        console.log('Firebase Analytics iniciado');
      } catch (error) {
        console.error('Error inicializando Firebase:', error);
      }
    },

    // Identificar usuario (llamar después del login)
    async setUser(user) {
      if (!Capacitor.isNativePlatform()) return;

      try {
        if (user) {
          await FirebaseCrashlytics.setUserId({ userId: String(user.id) });
          await FirebaseAnalytics.setUserId({ userId: String(user.id) });

          // Propiedades adicionales del usuario
          await FirebaseAnalytics.setUserProperty({
            key: 'user_role',
            value: user.role || 'unknown',
          });
          await FirebaseAnalytics.setUserProperty({
            key: 'club_id',
            value: String(user.club_id || ''),
          });
        } else {
          await FirebaseCrashlytics.setUserId({ userId: '' });
          await FirebaseAnalytics.setUserId({ userId: null });
        }
      } catch (error) {
        console.error('Error setting user:', error);
      }
    },

    // Registrar error manualmente (en catch blocks)
    async logError(error, context = {}) {
      if (!Capacitor.isNativePlatform()) {
        console.error('Error:', error, context);
        return;
      }

      try {
        // Agregar contexto como custom keys
        for (const [key, value] of Object.entries(context)) {
          await FirebaseCrashlytics.setCustomKey({
            key,
            value: String(value),
            type: 'string',
          });
        }

        // Registrar el error
        await FirebaseCrashlytics.recordException({
          message: error.message || String(error),
        });

        // También registrar en Analytics
        await FirebaseAnalytics.logEvent({
          name: 'app_error',
          params: {
            error_message: error.message || String(error),
            ...context,
          },
        });
      } catch (e) {
        console.error('Error logging to Firebase:', e);
      }
    },

    // Registrar evento de analytics
    async logEvent(eventName, params = {}) {
      if (!Capacitor.isNativePlatform()) {
        console.log('Analytics event:', eventName, params);
        return;
      }

      try {
        await FirebaseAnalytics.logEvent({
          name: eventName,
          params,
        });
      } catch (error) {
        console.error('Error logging event:', error);
      }
    },

    // Registrar pantalla vista
    async logScreen(screenName, screenClass = null) {
      if (!Capacitor.isNativePlatform()) {
        console.log('Screen view:', screenName);
        return;
      }

      try {
        await FirebaseAnalytics.setCurrentScreen({
          screenName,
          screenClassOverride: screenClass || screenName,
        });
      } catch (error) {
        console.error('Error logging screen:', error);
      }
    },

    // Log personalizado (aparece en Crashlytics como breadcrumb)
    async log(message) {
      if (!Capacitor.isNativePlatform()) {
        console.log('Firebase log:', message);
        return;
      }

      try {
        await FirebaseCrashlytics.log({ message });
      } catch (error) {
        console.error('Error logging:', error);
      }
    },
  };

  export default firebase;
  ```

### 13.7 Integrar en la App
- [ ] **Modificar `src/components/app/AppInitializer.jsx`** - Agregar inicialización de Firebase:
  ```jsx
  import { useEffect, useState } from 'react';
  import { Capacitor } from '@capacitor/core';
  import { SplashScreen } from '@capacitor/splash-screen';
  import { StatusBar, Style } from '@capacitor/status-bar';
  import { App as CapApp } from '@capacitor/app';
  import { Network } from '@capacitor/network';
  import firebase from '@/utils/firebase';  // ← Agregar

  const AppInitializer = ({ children, onReady }) => {
    const [isReady, setIsReady] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
      const initializeApp = async () => {
        if (Capacitor.isNativePlatform()) {
          try {
            // Inicializar Firebase
            await firebase.init();  // ← Agregar

            // ... resto del código existente (StatusBar, backButton, etc.)
          } catch (error) {
            console.error('Error initializing app:', error);
          }
        }
        // ... resto
      };
      initializeApp();
    }, []);
    // ... resto del componente
  };
  ```

### 13.8 Identificar Usuario en Login/Logout
- [ ] **En AuthContext o donde manejes autenticación**
  ```javascript
  import firebase from '@/utils/firebase';

  // Después de login exitoso
  const handleLoginSuccess = async (user) => {
    await firebase.setUser(user);
    await firebase.logEvent('login', { method: 'email' });
    // ... resto del código
  };

  // En logout
  const handleLogout = async () => {
    await firebase.logEvent('logout');
    await firebase.setUser(null);
    // ... resto del código
  };
  ```

### 13.9 Registrar Eventos Importantes
- [ ] **Agregar tracking en acciones clave**
  ```javascript
  import firebase from '@/utils/firebase';

  // Ejemplo: Crear jugador
  const createPlayer = async (data) => {
    try {
      const result = await playerService.create(data);
      await firebase.logEvent('player_created', {
        category_id: data.category_id,
      });
      return result;
    } catch (error) {
      await firebase.logError(error, { action: 'create_player' });
      throw error;
    }
  };

  // Ejemplo: Registrar pago
  const recordPayment = async (data) => {
    try {
      const result = await paymentService.create(data);
      await firebase.logEvent('payment_recorded', {
        amount: data.amount,
        method: data.payment_method,
      });
      return result;
    } catch (error) {
      await firebase.logError(error, { action: 'record_payment' });
      throw error;
    }
  };
  ```

### 13.10 Registrar Pantallas Vistas
- [ ] **Crear hook para tracking automático de pantallas**
  ```javascript
  // src/hooks/useScreenTracking.js
  import { useEffect } from 'react';
  import { useLocation } from 'react-router-dom';
  import firebase from '@/utils/firebase';

  export const useScreenTracking = () => {
    const location = useLocation();

    useEffect(() => {
      // Convertir path a nombre legible
      const screenName = location.pathname
        .replace(/^\//, '')
        .replace(/\//g, '_')
        .replace(/-/g, '_')
        || 'home';

      firebase.logScreen(screenName);
    }, [location]);
  };

  export default useScreenTracking;
  ```

- [ ] **Usar en App.jsx o layout principal**
  ```jsx
  import useScreenTracking from '@/hooks/useScreenTracking';

  const AppContent = () => {
    useScreenTracking(); // ← Agregar

    return (
      // ... tu contenido
    );
  };
  ```

### 13.11 Capturar Errores de API
- [ ] **En interceptor de Axios**
  ```javascript
  import firebase from '@/utils/firebase';

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      // No reportar 401 (sesión expirada) o 422 (validación)
      if (![401, 422].includes(error.response?.status)) {
        await firebase.logError(error, {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
        });
      }
      return Promise.reject(error);
    }
  );
  ```

### 13.12 Dashboard de Firebase - Qué Ver

Después de publicar, en Firebase Console verás:

| Sección | Qué muestra |
|---------|-------------|
| **Crashlytics** | Errores, crashes, usuarios afectados |
| **Analytics → Events** | Eventos personalizados (login, player_created, etc.) |
| **Analytics → Users** | Usuarios activos, nuevos, retención |
| **Analytics → Screens** | Pantallas más vistas |
| **Analytics → Demographics** | País, idioma, dispositivo |
| **Cloud Messaging** | Push notifications enviadas/abiertas |

### 13.13 Eventos Recomendados para Widdo

| Evento | Cuándo | Parámetros |
|--------|--------|------------|
| `login` | Usuario inicia sesión | `method` |
| `logout` | Usuario cierra sesión | - |
| `player_created` | Nuevo jugador | `category_id` |
| `player_updated` | Jugador editado | `player_id` |
| `payment_recorded` | Pago registrado | `amount`, `method` |
| `event_created` | Evento de calendario | `event_type` |
| `attendance_marked` | Asistencia marcada | `status`, `player_count` |
| `document_uploaded` | Documento subido | `document_type` |
| `share_content` | Contenido compartido | `content_type` |

### 13.14 Testing de Crashlytics
- [ ] **Forzar un crash de prueba** (solo para verificar que funciona)
  ```javascript
  // Botón temporal solo en desarrollo
  const testCrash = async () => {
    await FirebaseCrashlytics.crash();
  };
  ```
  > Después de testear, el crash aparece en Firebase Console en ~5 minutos

---

## Fase 14: Post-Lanzamiento

### 14.1 Monitoreo Continuo
- [ ] Revisar Sentry diariamente la primera semana
- [ ] Configurar alertas de Slack/Email para errores críticos
- [ ] Monitorear reviews en App Store y Google Play
- [ ] Responder reviews negativas

### 14.2 Actualizaciones
```bash
# Para cada actualización:
# 1. Incrementar version en package.json
# 2. Incrementar version/build en Xcode y Android Studio
npm run build
npx cap sync
# 3. Generar nuevo build y subir a stores
```

---

## Costos Totales

| Concepto | Costo | Frecuencia |
|----------|-------|------------|
| Apple Developer Program | $99 USD | Anual |
| Google Play Console | $25 USD | Una vez |
| **Total primer año** | **$124 USD** | - |
| **Total años siguientes** | **$99 USD** | Anual |

---

## Recursos y Referencias

- [Capacitor Docs](https://capacitorjs.com/docs)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)

---

## Notas Adicionales

### Menú Móvil vs Web
La app detectará automáticamente si está corriendo en modo nativo y mostrará:
- **Web:** Sidebar lateral tradicional
- **Móvil nativo:** Bottom navigation con 5 items + página "Más"

### Modo Desarrollo
Para probar cambios en tiempo real en el móvil:
1. Descomentar `server.url` en `capacitor.config.ts`
2. Poner tu IP local (obtener con `ipconfig getifaddr en0`)
3. Ejecutar `npm run dev` en terminal
4. Ejecutar `npx cap run ios --livereload --external`

### Archivos a NO versionar (agregar a .gitignore)
```gitignore
# Capacitor (opcional - depende del flujo)
# ios/
# android/

# Keystore (NUNCA versionar)
*.keystore
*.jks
```

---

**Última actualización:** 24 de Enero de 2026
**Autor:** Documentación generada con Claude Code
