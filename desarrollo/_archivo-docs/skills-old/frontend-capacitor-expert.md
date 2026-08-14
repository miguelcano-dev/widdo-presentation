# Skill: Capacitor Expert

Experto en desarrollo móvil con Capacitor para Widdo.

## Triggers

Usar cuando el usuario diga:
- "configurar capacitor"
- "problema en iOS/Android"
- "plugin de capacitor"
- "build móvil"
- "notificaciones push"
- "cámara en app"
- "safe areas"
- "status bar"
- "teclado móvil"
- "vibración/haptics"

---

## Referencia Rápida

### Hooks Disponibles

| Hook | Propósito | Ubicación |
|------|-----------|-----------|
| `usePlatform` | Detectar plataforma (web/ios/android) | `hooks/usePlatform.js` |
| `useStatusBar` | Controlar barra de estado | `hooks/useStatusBar.js` |
| `useKeyboard` | Detectar teclado virtual | `hooks/useKeyboard.js` |
| `usePushNotifications` | Manejar push | `hooks/usePushNotifications.js` |
| `useCamera` | Cámara y galería | `hooks/useCamera.js` |
| `useHaptics` | Vibración táctil | `hooks/useHaptics.js` |

### Plugins Instalados

```bash
@capacitor/core           # Core
@capacitor/cli            # CLI
@capacitor/status-bar     # Barra de estado
@capacitor/splash-screen  # Splash
@capacitor/keyboard       # Teclado
@capacitor/haptics        # Vibración
@capacitor/camera         # Cámara
@capacitor/push-notifications  # Push
@capacitor/app            # Ciclo de vida
@capacitor/network        # Conexión
@capacitor/storage        # Storage local
```

---

## Configuración Común

### capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.widdo.app',
  appName: 'Widdo',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#16a34a',
      showSpinner: false,
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
};

export default config;
```

---

## Solución de Problemas Comunes

### 1. Safe Areas no funcionan

**Problema:** Contenido se mete debajo del notch o home indicator.

**Solución:**
```css
/* Agregar a index.css */
.safe-area-top {
  padding-top: env(safe-area-inset-top, 0);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* En el contenedor principal */
html {
  --sat: env(safe-area-inset-top);
  --sab: env(safe-area-inset-bottom);
}
```

```jsx
// En MobileLayout.jsx
<div className="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
  {children}
</div>
```

### 2. Zoom en inputs iOS

**Problema:** iOS hace zoom cuando el usuario toca un input con font-size < 16px.

**Solución:**
```css
/* En index.css - OBLIGATORIO */
input, select, textarea {
  font-size: 16px !important;
}

/* O usar clases Tailwind */
<Input className="text-base" /> /* 16px */
```

### 3. Teclado cubre el input

**Problema:** Al abrir el teclado, el input queda tapado.

**Solución:**
```jsx
// Usar hook useKeyboard
import { useKeyboard } from '@/hooks/useKeyboard';

function MyForm() {
  const { isKeyboardOpen, keyboardHeight } = useKeyboard();

  return (
    <div style={{ paddingBottom: isKeyboardOpen ? keyboardHeight : 0 }}>
      <Input />
    </div>
  );
}
```

### 4. Status bar transparente en iOS

**Problema:** La barra de estado se ve transparente o con color incorrecto.

**Solución:**
```jsx
// Al montar la app
import { StatusBar, Style } from '@capacitor/status-bar';

useEffect(() => {
  if (Capacitor.isNativePlatform()) {
    StatusBar.setStyle({ style: Style.Light });
    StatusBar.setBackgroundColor({ color: '#16a34a' });
  }
}, []);
```

### 5. Push notifications no llegan

**Problema:** Las notificaciones push no se reciben.

**Checklist:**
1. ¿Permisos concedidos?
   ```jsx
   const status = await PushNotifications.checkPermissions();
   console.log('Permission status:', status.receive);
   ```

2. ¿Token registrado en backend?
   ```jsx
   PushNotifications.addListener('registration', (token) => {
     console.log('Token:', token.value);
     // Enviar al backend
   });
   ```

3. ¿Certificados configurados?
   - iOS: APNs certificate en Apple Developer
   - Android: google-services.json configurado

### 6. Cámara no abre

**Problema:** La cámara no se abre o da error de permisos.

**Solución iOS:**
```xml
<!-- ios/App/App/Info.plist -->
<key>NSCameraUsageDescription</key>
<string>Necesitamos acceso a la cámara para subir comprobantes de pago</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Necesitamos acceso a fotos para subir comprobantes</string>
```

**Solución Android:**
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### 7. App se congela al volver del background

**Problema:** La app se congela cuando vuelve del background.

**Solución:**
```jsx
import { App } from '@capacitor/app';

useEffect(() => {
  const listener = App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      // App volvió al foreground - refetch datos si es necesario
      queryClient.invalidateQueries();
    }
  });

  return () => listener.remove();
}, []);
```

---

## Comandos de Desarrollo

```bash
# Build y sincronizar
npm run build && npx cap sync

# Abrir en Xcode
npx cap open ios

# Abrir en Android Studio
npx cap open android

# Live reload (desarrollo)
npx cap run ios --livereload --external
npx cap run android --livereload --external

# Solo copiar cambios web
npx cap copy

# Ver logs iOS
npx cap run ios --target="iPhone 15"

# Ver logs Android
npx cap run android --target="Pixel_7_API_34"
```

---

## Debugging

### iOS Simulator

1. Abrir Xcode: `npx cap open ios`
2. Seleccionar simulador
3. Run (Cmd + R)
4. Ver logs en la consola de Xcode

### Android Emulator

1. Abrir Android Studio: `npx cap open android`
2. Seleccionar emulador
3. Run (Shift + F10)
4. Ver logs: `adb logcat | grep -i "capacitor"`

### Safari Web Inspector (iOS)

1. En iPhone/Simulator: Settings > Safari > Advanced > Web Inspector ON
2. En Mac: Safari > Develop > [tu dispositivo] > widdo.co

### Chrome DevTools (Android)

1. En dispositivo: Habilitar USB debugging
2. En Chrome: `chrome://inspect/#devices`
3. Click "inspect" en tu app

---

## Build para Producción

### iOS

```bash
# 1. Build web
npm run build

# 2. Sync a native
npx cap sync ios

# 3. Abrir Xcode
npx cap open ios

# 4. En Xcode:
#    - Seleccionar "Any iOS Device (arm64)"
#    - Product > Archive
#    - Distribute App > App Store Connect
```

### Android

```bash
# 1. Build web
npm run build

# 2. Sync a native
npx cap sync android

# 3. Abrir Android Studio
npx cap open android

# 4. En Android Studio:
#    - Build > Generate Signed Bundle/APK
#    - Seleccionar Android App Bundle
#    - Firmar con keystore
```

---

## Checklist Pre-Build

### iOS
- [ ] Bundle ID correcto (`co.widdo.app`)
- [ ] Version y Build number actualizados
- [ ] Iconos en todas las resoluciones
- [ ] Launch screen configurado
- [ ] Info.plist con permisos correctos
- [ ] Certificados de firma válidos
- [ ] Capabilities habilitados (Push, etc.)

### Android
- [ ] applicationId correcto
- [ ] versionCode y versionName actualizados
- [ ] Iconos en todas las densidades
- [ ] Splash screen configurado
- [ ] Permisos en AndroidManifest.xml
- [ ] google-services.json (si usa FCM)
- [ ] Keystore para firma

---

## Permisos por Plataforma

### iOS (Info.plist)

```xml
<!-- Cámara -->
<key>NSCameraUsageDescription</key>
<string>Para subir comprobantes de pago</string>

<!-- Galería -->
<key>NSPhotoLibraryUsageDescription</key>
<string>Para seleccionar fotos de comprobantes</string>

<!-- Push -->
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>

<!-- Ubicación (si se necesita) -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Para mostrar canchas cercanas</string>
```

### Android (AndroidManifest.xml)

```xml
<!-- Internet (ya viene) -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Cámara -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Galería -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- Push (FCM) -->
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

<!-- Vibración -->
<uses-permission android:name="android.permission.VIBRATE" />

<!-- Red -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

---

## Referencia de Documentación

- [Capacitor Docs](https://capacitorjs.com/docs)
- [iOS Deployment](https://capacitorjs.com/docs/ios/deploying-to-app-store)
- [Android Deployment](https://capacitorjs.com/docs/android/deploying-to-google-play)
- [Plugins List](https://capacitorjs.com/docs/plugins)
