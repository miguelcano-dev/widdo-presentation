# Plan de Implementación: Sistema de Notificaciones Push - Widdo

**Fecha de creación:** 2026-01-24
**Estado:** Planificación
**Fase actual:** MVP (No iniciada)

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estado Actual del Sistema](#estado-actual-del-sistema)
3. [Arquitectura General](#arquitectura-general)
4. [Configuración de Firebase Cloud Messaging](#configuración-de-firebase-cloud-messaging)
5. [Service Worker para Web Push](#service-worker-para-web-push)
6. [Estructura de Base de Datos](#estructura-de-base-de-datos)
7. [Estructura de Código Backend](#estructura-de-código-backend)
8. [Estructura de Código Frontend](#estructura-de-código-frontend)
9. [APIs del Backend](#apis-del-backend)
10. [Fases de Implementación](#fases-de-implementación)
11. [Checklist de Configuración](#checklist-de-configuración)
12. [Progreso de Implementación](#progreso-de-implementación)

---

## Resumen Ejecutivo

### Objetivo
Implementar un sistema centralizado de notificaciones push que permita notificar a los usuarios a través de múltiples canales (email, push, in-app) de manera consistente y extensible.

### Decisiones Técnicas

| Aspecto | Decisión | Razón |
|---------|----------|-------|
| **Proveedor Push** | Firebase Cloud Messaging (FCM) | Gratis sin límites, estándar de la industria |
| **App Móvil** | Capacitor | Reutiliza código React existente (80-90%) |
| **Preferencias MVP** | Toggle global (push sí/no, email sí/no) | Simplicidad para MVP |
| **Notificaciones obligatorias** | Cancelaciones, convocatorias, cambios críticos | No se pueden desactivar |

### Servicios Externos

| Servicio | Propósito | Costo | Estado |
|----------|-----------|-------|--------|
| Firebase (FCM) | Enviar push notifications | Gratis | Por configurar |
| Resend | Emails | Ya configurado | ✅ Funcionando |
| DigitalOcean Droplet | Backend | Ya configurado | ✅ Funcionando |

---

## Estado Actual del Sistema

### Ya Implementado

- **32 Mailables** para diferentes eventos (pagos, eventos, invitaciones, etc.)
- **NotificationService** para notificaciones in-app
- **Modelo PlaNotification** con campo `channel` que soporta: `in_app`, `email`, `push`
- **Queue system** con database driver
- **Frontend** con `NotificationDropdown` y `NotificationCenter`

### Mailables Existentes

| Categoría | Mailables |
|-----------|-----------|
| Eventos | EventInvitationMail, EventReminderMail, EventCancellationMail |
| Pagos | PaymentConfirmationMail, PaymentReminderMail, PaymentProofUploadedMail |
| Sesiones | SessionModifiedNotification |
| Convocatorias | MatchCallupMail, TrainingCallupMail |
| Invitaciones | TrainerInvitationMail, PlayerInvitationMail, RoleInvitationMail |
| Sistema | WelcomeMail, PasswordResetMail, SuspiciousLoginMail |

---

## Arquitectura General

### Diagrama del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              WIDDO BACKEND (Laravel)                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      NotificationManager                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │
│  │  │ Notification │  │  Preference  │  │    ChannelDispatcher     │  │   │
│  │  │    Types     │  │   Resolver   │  │                          │  │   │
│  │  │  (Registry)  │  │              │  │  ┌─────┐ ┌─────┐ ┌─────┐ │  │   │
│  │  └──────────────┘  └──────────────┘  │  │Email│ │InApp│ │Push │ │  │   │
│  │                                       │  └─────┘ └─────┘ └─────┘ │  │   │
│  │                                       └──────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Laravel Queue (Jobs)                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
          │                    │                         │
          ▼                    ▼                         ▼
   ┌──────────────┐    ┌──────────────┐         ┌──────────────┐
   │    Resend    │    │   Database   │         │  Firebase    │
   │   (Email)    │    │  (In-App)    │         │  Cloud Msg   │
   │  YA EXISTE   │    │  YA EXISTE   │         │    (FCM)     │
   └──────────────┘    └──────────────┘         └──────────────┘
                                                       │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
       ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
       │  Web Browser │         │   iOS App    │         │ Android App  │
       │   (Service   │         │  (Capacitor) │         │  (Capacitor) │
       │   Worker)    │         │              │         │              │
       └──────────────┘         └──────────────┘         └──────────────┘
```

### Flujo de Envío

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. TRIGGER (Evento del sistema)                                    │
│     Ejemplo: Se cancela un entrenamiento                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. LLAMADA AL NOTIFICATION MANAGER                                 │
│                                                                     │
│  NotificationManager::send(                                         │
│      type: 'training_cancelled',                                    │
│      users: $affectedUsers,                                         │
│      data: ['training' => $training, 'reason' => 'Lluvia']          │
│  );                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. NOTIFICATION MANAGER (Orquestación)                             │
│                                                                     │
│  Para cada usuario:                                                 │
│    a) Obtener tipo de notificación (de BD o Registry)               │
│    b) Verificar si es mandatory                                     │
│    c) Si no es mandatory → consultar PreferenceResolver             │
│    d) Obtener canales habilitados para este usuario/tipo            │
│    e) Para cada canal → dispatch job                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              ┌──────────┐   ┌──────────┐   ┌──────────┐
              │ EmailJob │   │ InAppJob │   │ PushJob  │
              │ (Queue)  │   │ (Queue)  │   │ (Queue)  │
              └──────────┘   └──────────┘   └──────────┘
```

---

## Configuración de Firebase Cloud Messaging

### Paso 1: Crear Proyecto en Firebase

```
1. Ir a https://console.firebase.google.com/
2. Click "Crear proyecto" (o "Add project")
3. Nombre: "Widdo" o "Widdo-Production"
4. Deshabilitar Google Analytics (no necesario para push)
5. Click "Crear proyecto"
```

### Paso 2: Configurar App Web

```
1. En la consola de Firebase, click en el ícono </> (Web)
2. Nombre de la app: "Widdo Web"
3. NO marcar "Firebase Hosting"
4. Click "Registrar app"
5. Firebase te dará un objeto de configuración:

   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "widdo-xxxxx.firebaseapp.com",
     projectId: "widdo-xxxxx",
     storageBucket: "widdo-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };

6. GUARDAR estos valores (los necesitarás en el frontend)
```

### Paso 3: Obtener Server Key para Backend

```
1. En Firebase Console → Configuración del proyecto (ícono engranaje)
2. Pestaña "Cloud Messaging"
3. Si no existe, click "Generar par de claves" en Web Push certificates
4. Copiar la "VAPID Key" (para el frontend)
5. En "Cloud Messaging API (Legacy)" → Habilitar si está deshabilitado
6. Ir a "Service accounts" → "Generate new private key"
7. Descargar el archivo JSON (credenciales del servidor)
```

### Paso 4: Configurar Laravel

**Variables de entorno (.env):**
```env
# Firebase Cloud Messaging
FCM_CREDENTIALS_PATH=/path/to/firebase-credentials.json
# O alternativamente, el contenido JSON codificado en base64:
FCM_CREDENTIALS_BASE64=eyJ0eXBlIjoic2VydmljZ...
```

**Paquete recomendado:**
```bash
composer require laravel-notification-channels/fcm
```

**Archivo de credenciales:**
- Subir el JSON de Firebase a `/storage/app/firebase-credentials.json`
- O usar variable de entorno con el JSON en base64
- **NUNCA** commitear el archivo JSON al repositorio

---

## Service Worker para Web Push

### ¿Qué es y por qué se necesita?

El Service Worker es un script JavaScript que corre en segundo plano en el navegador, incluso cuando el usuario no tiene la pestaña abierta. Es **obligatorio** para recibir push en web.

### Ubicación del Archivo

```
frontend/
├── public/
│   ├── index.html
│   └── firebase-messaging-sw.js   ← NUEVO (obligatorio)
├── src/
└── ...
```

### Flujo del Service Worker

```
┌──────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR DEL USUARIO                      │
│                                                                   │
│  ┌─────────────┐    ┌─────────────────────┐    ┌──────────────┐ │
│  │  React App  │───▶│  Registra Service   │───▶│   Service    │ │
│  │             │    │  Worker + Pide      │    │   Worker     │ │
│  │             │    │  permiso push       │    │  (Escucha    │ │
│  └─────────────┘    └─────────────────────┘    │   mensajes)  │ │
│                              │                  └──────────────┘ │
│                              ▼                         ▲         │
│                     ┌─────────────────┐               │         │
│                     │  Obtiene FCM    │               │         │
│                     │  Token único    │               │         │
│                     └─────────────────┘               │         │
│                              │                        │         │
└──────────────────────────────│────────────────────────│─────────┘
                               │                        │
                               ▼                        │
                      ┌─────────────────┐               │
                      │  Backend guarda │               │
                      │  token en BD    │               │
                      └─────────────────┘               │
                               │                        │
                               ▼                        │
                      ┌─────────────────┐               │
                      │  Cuando hay     │───────────────┘
                      │  notificación,  │  (FCM envía al SW)
                      │  Backend envía  │
                      │  a FCM con token│
                      └─────────────────┘
```

### Configuración en el Servidor (Droplet)

**No se necesita configuración especial en el servidor**, pero hay requisitos:

| Requisito | Estado en Widdo | Notas |
|-----------|-----------------|-------|
| HTTPS | ✅ Ya tienes | Push SOLO funciona con HTTPS |
| Dominio válido | ✅ widdo.co | No funciona con IP directa |
| Puerto 443 | ✅ Estándar | Ya configurado |

**Header opcional para nginx (si hay problemas):**
```nginx
location /firebase-messaging-sw.js {
    add_header Service-Worker-Allowed /;
}
```

---

## Estructura de Base de Datos

### Nuevas Migraciones

#### Tabla 1: user_push_tokens

```sql
CREATE TABLE user_push_tokens (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(500) NOT NULL,           -- FCM token (pueden ser largos)
    platform ENUM('web', 'ios', 'android') NOT NULL DEFAULT 'web',
    device_name VARCHAR(255) NULL,         -- "Chrome en Windows", "iPhone 14", etc.
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at TIMESTAMP NULL,           -- Última vez que se usó
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_token (token),
    INDEX idx_user_active (user_id, is_active)
);
```

#### Tabla 2: user_notification_settings

```sql
CREATE TABLE user_notification_settings (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,

    -- Canales globales (MVP)
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,

    -- Preferencias por categoría (Post-MVP)
    events_push BOOLEAN NULL,
    events_email BOOLEAN NULL,
    payments_push BOOLEAN NULL,
    payments_email BOOLEAN NULL,
    training_push BOOLEAN NULL,
    training_email BOOLEAN NULL,
    club_announcements_push BOOLEAN NULL,
    club_announcements_email BOOLEAN NULL,

    -- Horarios de no molestar (Escala)
    quiet_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    quiet_hours_start TIME NULL,
    quiet_hours_end TIME NULL,
    timezone VARCHAR(50) DEFAULT 'America/Bogota',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user (user_id)
);
```

#### Tabla 3: notification_logs

```sql
CREATE TABLE notification_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    channel ENUM('email', 'push', 'in_app') NOT NULL,
    status ENUM('pending', 'sent', 'delivered', 'failed', 'clicked') NOT NULL DEFAULT 'pending',

    title VARCHAR(255) NULL,
    body TEXT NULL,
    data JSON NULL,

    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    clicked_at TIMESTAMP NULL,
    error_message TEXT NULL,

    related_type VARCHAR(100) NULL,
    related_id BIGINT UNSIGNED NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_type (user_id, notification_type),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);
```

#### Tabla 4: notification_types

```sql
CREATE TABLE notification_types (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    category VARCHAR(50) NOT NULL,

    supports_email BOOLEAN NOT NULL DEFAULT TRUE,
    supports_push BOOLEAN NOT NULL DEFAULT TRUE,
    supports_in_app BOOLEAN NOT NULL DEFAULT TRUE,

    is_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    default_push BOOLEAN NOT NULL DEFAULT TRUE,
    default_email BOOLEAN NOT NULL DEFAULT TRUE,

    email_template VARCHAR(255) NULL,
    push_title_template VARCHAR(255) NULL,
    push_body_template TEXT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Datos Iniciales (Seeder)

```sql
INSERT INTO notification_types (code, name, category, is_mandatory, default_push, default_email) VALUES
-- Eventos
('event_invitation', 'Invitación a evento', 'events', FALSE, TRUE, TRUE),
('event_reminder', 'Recordatorio de evento', 'events', FALSE, TRUE, TRUE),
('event_cancelled', 'Cancelación de evento', 'events', TRUE, TRUE, TRUE),
('event_modified', 'Cambio en evento', 'events', FALSE, TRUE, TRUE),

-- Pagos
('payment_reminder', 'Recordatorio de pago', 'payments', FALSE, TRUE, TRUE),
('payment_confirmed', 'Confirmación de pago', 'payments', FALSE, TRUE, TRUE),
('payment_overdue', 'Pago vencido', 'payments', TRUE, TRUE, TRUE),

-- Entrenamientos
('training_cancelled', 'Entrenamiento cancelado', 'training', TRUE, TRUE, TRUE),
('training_modified', 'Cambio de entrenamiento', 'training', TRUE, TRUE, TRUE),
('training_callup', 'Convocatoria entrenamiento', 'training', FALSE, TRUE, TRUE),

-- Partidos
('match_callup', 'Convocatoria a partido', 'matches', TRUE, TRUE, TRUE),
('match_reminder', 'Recordatorio de partido', 'matches', FALSE, TRUE, TRUE),

-- Club
('club_announcement', 'Anuncio del club', 'club', FALSE, TRUE, FALSE),

-- Sistema
('security_alert', 'Alerta de seguridad', 'system', TRUE, TRUE, TRUE);
```

---

## Estructura de Código Backend

### Árbol de Archivos Nuevos

```
app/
├── Enums/
│   └── NotificationChannel.php
│   └── NotificationTypeEnum.php
│
├── Services/
│   └── Notifications/
│       ├── NotificationManager.php       # Servicio principal
│       ├── PreferenceResolver.php        # Resuelve preferencias del usuario
│       ├── Channels/
│       │   ├── ChannelInterface.php      # Contrato para canales
│       │   ├── EmailChannel.php          # Usa Mailables existentes
│       │   ├── PushChannel.php           # Implementación FCM
│       │   └── InAppChannel.php          # Usa NotificationService existente
│       └── Types/
│           ├── NotificationTypeInterface.php
│           ├── EventReminderNotification.php
│           ├── PaymentReminderNotification.php
│           └── ...
│
├── Jobs/
│   └── SendPushNotificationJob.php
│
├── Models/
│   ├── UserPushToken.php
│   ├── UserNotificationSetting.php
│   ├── NotificationLog.php
│   └── NotificationType.php
│
├── Http/
│   └── Controllers/
│       └── Api/
│           ├── PushTokenController.php
│           └── NotificationSettingsController.php
│
config/
└── notifications.php
```

---

## Estructura de Código Frontend

### Árbol de Archivos Nuevos

```
frontend/src/
├── services/
│   └── pushNotifications.js              # Lógica de registro/permisos
│
├── contexts/
│   └── NotificationContext.jsx           # Context para estado
│
├── components/
│   └── notifications/
│       ├── NotificationDropdown.jsx      # YA EXISTE
│       ├── NotificationCenter.jsx        # YA EXISTE
│       ├── NotificationSettings.jsx      # NUEVO - configuración
│       ├── PushPermissionBanner.jsx      # NUEVO - pedir permiso
│       └── PushPermissionModal.jsx       # NUEVO - modal explicativo
│
├── hooks/
│   └── usePushNotifications.js
│
public/
├── firebase-messaging-sw.js              # Service Worker
└── manifest.json                         # Agregar gcm_sender_id
```

### Flujo de Registro de Push (Frontend)

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. USUARIO INICIA SESIÓN                                           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. CHECK SOPORTE Y PERMISO                                         │
│                                                                     │
│  - ¿El navegador soporta Service Workers?                           │
│  - ¿El navegador soporta Push API?                                  │
│  - ¿Ya tiene permiso concedido?                                     │
│                                                                     │
│  Si ya tiene permiso → Ir a paso 5                                  │
│  Si permiso denegado → No mostrar nada                              │
│  Si permiso "default" → Ir a paso 3                                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. MOSTRAR BANNER/MODAL EXPLICATIVO (No intrusivo)                 │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  🔔 ¿Quieres recibir notificaciones?                       │    │
│  │                                                             │    │
│  │  Te avisaremos cuando:                                      │    │
│  │  • Se cancele o modifique un entrenamiento                  │    │
│  │  • Tengas una convocatoria a partido                        │    │
│  │  • Se acerque la fecha de pago                              │    │
│  │                                                             │    │
│  │  [Ahora no]  [Activar notificaciones]                       │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  IMPORTANTE: NO pedir permiso inmediatamente al cargar.             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. USUARIO ACEPTA → PEDIR PERMISO NATIVO                           │
│                                                                     │
│  Notification.requestPermission()                                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. SI PERMISO CONCEDIDO                                            │
│                                                                     │
│  a) Registrar Service Worker                                        │
│  b) Obtener FCM Token del navegador                                 │
│  c) Enviar token al backend (POST /api/push-tokens)                 │
│  d) Backend guarda en user_push_tokens                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## APIs del Backend

### Endpoints Nuevos

```
# Tokens de dispositivo
POST   /api/push-tokens              # Registrar nuevo token
DELETE /api/push-tokens/{token}      # Eliminar token
GET    /api/push-tokens              # Listar tokens del usuario

# Configuración de notificaciones
GET    /api/notification-settings    # Obtener configuración
PUT    /api/notification-settings    # Actualizar configuración
GET    /api/notification-types       # Listar tipos disponibles

# Testing (solo desarrollo)
POST   /api/push-tokens/test         # Enviar push de prueba
```

### Ejemplos de Request/Response

**Registrar Token:**
```json
// POST /api/push-tokens
{
    "token": "fMz8g...",
    "platform": "web",
    "device_name": "Chrome en macOS"
}

// Response 201
{
    "success": true,
    "message": "Token registrado correctamente"
}
```

**Obtener Configuración:**
```json
// GET /api/notification-settings

// Response 200
{
    "push_enabled": true,
    "email_enabled": true,
    "categories": {
        "events": { "push": true, "email": true },
        "payments": { "push": true, "email": true },
        "training": { "push": true, "email": true },
        "club": { "push": true, "email": false }
    },
    "quiet_hours": {
        "enabled": false,
        "start": null,
        "end": null
    }
}
```

**Actualizar Configuración:**
```json
// PUT /api/notification-settings
{
    "push_enabled": true,
    "email_enabled": true,
    "categories": {
        "club": { "push": false, "email": false }
    }
}
```

---

## Fases de Implementación

### FASE MVP

**Objetivo:** Push funcionando en web para los tipos críticos

#### Backend MVP

| Tarea | Archivos | Estado |
|-------|----------|--------|
| Crear migraciones | `user_push_tokens`, `user_notification_settings`, `notification_types`, `notification_logs` | ✅ Completado |
| Instalar paquete FCM | Implementación nativa con cURL (sin paquete externo) | ✅ Completado |
| Configurar credenciales FCM | `.env`, `config/services.php` | ✅ Completado |
| Crear modelo `UserPushToken` | `app/Models/UserPushToken.php` | ✅ Completado |
| Crear `PushTokenController` | CRUD de tokens | ✅ Completado |
| Crear `SendPushNotificationJob` | Job que envía a FCM | ✅ Completado |
| Crear `NotificationManager` completo | Con canales y preferencias | ✅ Completado |
| Crear `NotificationSettingsController` | CRUD preferencias | ✅ Completado |
| Crear seeder de tipos | 18 tipos de notificación | ✅ Completado |
| Integrar en 5 flujos existentes | Cancelación, convocatoria, etc. | ⬜ Pendiente (configurar Firebase primero) |

#### Frontend MVP

| Tarea | Archivos | Estado |
|-------|----------|--------|
| Crear Service Worker | `public/firebase-messaging-sw.js` | ✅ Completado |
| Instalar Firebase SDK | `npm install firebase` | ⬜ Pendiente (ejecutar npm install) |
| Crear servicio push | `src/services/pushNotifications.js` | ✅ Completado |
| Crear hook `usePushNotifications` | Hook para componentes | ✅ Completado |
| Crear `PushPermissionBanner` | Banner no intrusivo | ✅ Completado |
| Crear `NotificationSettings` | UI de configuración | ✅ Completado |
| Crear `manifest.json` | PWA manifest con gcm_sender_id | ✅ Completado |
| Integrar en layout principal | Pedir permiso contextualmente | ⬜ Pendiente (agregar banner a layout) |
| Enviar token al backend | Al obtener permiso | ✅ Completado (en servicio) |

#### Tipos de Notificación MVP (5 críticos)

| Tipo | Trigger | Ya tiene email | Estado Push |
|------|---------|----------------|-------------|
| `training_cancelled` | Cancelar sesión | ✅ | ✅ Tipo creado |
| `training_modified` | Modificar sesión | ✅ | ✅ Tipo creado |
| `match_callup` | Crear convocatoria | ✅ | ✅ Tipo creado |
| `event_cancelled` | Cancelar evento | ✅ | ✅ Tipo creado |
| `payment_reminder` | Job diario | ✅ | ✅ Tipo creado |

---

### FASE POST-MVP

**Objetivo:** App Capacitor + más tipos + configuración básica

#### Capacitor

| Tarea | Descripción | Estado |
|-------|-------------|--------|
| Setup Capacitor | `npm install @capacitor/core @capacitor/cli` | ⬜ Pendiente |
| Inicializar | `npx cap init "Widdo" "co.widdo.app"` | ⬜ Pendiente |
| Agregar plataformas | `npx cap add ios && npx cap add android` | ⬜ Pendiente |
| Plugin push | `npm install @capacitor/push-notifications` | ⬜ Pendiente |
| Configurar iOS | Certificates en Apple Developer | ⬜ Pendiente |
| Configurar Android | `google-services.json` de Firebase | ⬜ Pendiente |
| Adaptar servicio push | Detectar plataforma | ⬜ Pendiente |

#### Backend Post-MVP

| Tarea | Descripción | Estado |
|-------|-------------|--------|
| Crear `UserNotificationSetting` | Modelo con preferencias | ✅ Completado (adelantado) |
| Crear `NotificationSettingsController` | CRUD preferencias | ✅ Completado (adelantado) |
| Migración `notification_types` | Tabla de configuración | ✅ Completado (adelantado) |
| Migración `notification_logs` | Auditoría | ✅ Completado (adelantado) |
| Agregar más tipos | 18 tipos de notificación | ✅ Completado (adelantado) |
| Mejorar `NotificationManager` | Preferencias por categoría | ✅ Completado (adelantado) |

#### Frontend Post-MVP

| Tarea | Descripción | Estado |
|-------|-------------|--------|
| Crear `NotificationSettings.jsx` | UI de configuración | ✅ Completado (adelantado) |
| Agregar a perfil de usuario | Sección de notificaciones | ⬜ Pendiente |
| Manejar múltiples tokens | Un usuario, varios dispositivos | ✅ Completado (en API)

#### Tipos Adicionales Post-MVP

| Tipo | Categoría | Estado |
|------|-----------|--------|
| `event_invitation` | events | ⬜ Pendiente |
| `event_reminder` | events | ⬜ Pendiente |
| `event_modified` | events | ⬜ Pendiente |
| `payment_confirmed` | payments | ⬜ Pendiente |
| `payment_overdue` | payments | ⬜ Pendiente |
| `training_callup` | training | ⬜ Pendiente |
| `match_reminder` | matches | ⬜ Pendiente |
| `club_announcement` | club | ⬜ Pendiente |

---

### FASE ESCALA

**Objetivo:** Sistema robusto, preferencias granulares, analytics

#### Features de Escala

| Feature | Descripción | Estado |
|---------|-------------|--------|
| Preferencias granulares | Por tipo específico | ⬜ Pendiente |
| Horarios de no molestar | Quiet hours configurable | ⬜ Pendiente |
| Notificaciones programadas | "Recordar en 1 hora" | ⬜ Pendiente |
| Analytics de engagement | Tasa de apertura, clicks | ⬜ Pendiente |
| A/B testing de mensajes | Optimizar copy | ⬜ Pendiente |
| Segmentación | Push a grupos específicos | ⬜ Pendiente |
| Rich notifications | Imágenes, acciones | ⬜ Pendiente |
| Deep linking | Abrir pantalla específica | ⬜ Pendiente |

#### Infraestructura Escala

| Mejora | Descripción | Estado |
|--------|-------------|--------|
| Redis para queue | Mayor rendimiento | ⬜ Pendiente |
| Worker dedicado | Proceso separado | ⬜ Pendiente |
| Webhooks FCM | Tracking de entregas | ⬜ Pendiente |
| Rate limiting | Evitar spam | ⬜ Pendiente |
| Batching | Agrupar notificaciones | ⬜ Pendiente |

---

## Checklist de Configuración

### Firebase Console

- [ ] Crear proyecto Firebase
- [ ] Registrar app Web
- [ ] Guardar `firebaseConfig` para frontend
- [ ] Generar VAPID key (Web Push certificates)
- [ ] Descargar Service Account JSON
- [ ] (Post-MVP) Registrar app iOS
- [ ] (Post-MVP) Registrar app Android y descargar `google-services.json`

### Backend (Laravel)

- [ ] `composer require laravel-notification-channels/fcm`
- [ ] Crear `config/fcm.php` o agregar a `config/services.php`
- [ ] Agregar credenciales a `.env`
- [ ] Subir JSON de credenciales a storage (no commitear)
- [ ] Ejecutar migraciones nuevas
- [ ] Registrar rutas de API
- [ ] Crear seeders para `notification_types`

### Frontend (React)

- [ ] `npm install firebase`
- [ ] Crear `firebase-messaging-sw.js` en public/
- [ ] Agregar `gcm_sender_id` a `manifest.json`
- [ ] Crear servicio de push notifications
- [ ] Implementar flujo de permisos
- [ ] Integrar envío de token al backend

### Servidor (Droplet)

- [ ] Verificar HTTPS funcionando
- [ ] Agregar header Service-Worker-Allowed (si necesario)
- [ ] Variables de entorno de producción
- [ ] Worker de queue corriendo (`php artisan queue:work`)

### iOS (Post-MVP)

- [ ] Apple Developer Account ($99/año)
- [ ] Crear App ID con Push Notifications capability
- [ ] Crear Push Notification Certificate o Key
- [ ] Subir a Firebase Console
- [ ] Configurar en Xcode

### Android (Post-MVP)

- [ ] Descargar `google-services.json` de Firebase
- [ ] Colocar en `android/app/`
- [ ] Configurar permisos en `AndroidManifest.xml`

---

## Progreso de Implementación

### Resumen por Fase

| Fase | Total Tareas | Completadas | Progreso |
|------|--------------|-------------|----------|
| MVP | 15 | 13 | 87% |
| Post-MVP | 14 | 2 | 14% |
| Escala | 13 | 0 | 0% |

### Historial de Cambios

| Fecha | Cambio | Fase |
|-------|--------|------|
| 2026-01-24 | Documento creado | Planificación |
| 2026-01-24 | Backend MVP implementado: migraciones, modelos, NotificationManager, canales, jobs, controllers, rutas | MVP |
| 2026-01-24 | Frontend MVP implementado: Service Worker, servicio push, hook, banner, NotificationSettings | MVP |
| 2026-01-24 | Seeder de tipos de notificación creado | MVP |
| 2026-01-24 | Configuración FCM en services.php | MVP |

### ⚠️ PENDIENTE: Configuración de Firebase

**Para completar la implementación se necesita:**

1. **Crear proyecto en Firebase Console** (https://console.firebase.google.com)
2. **Registrar app Web** y obtener firebaseConfig
3. **Generar VAPID Key** (Web Push certificates)
4. **Descargar Service Account JSON** (credenciales del servidor)
5. **Configurar variables de entorno:**

**Backend (.env):**
```env
FCM_PROJECT_ID=tu-proyecto-firebase
FCM_CREDENTIALS_PATH=/path/to/firebase-credentials.json
# O usar base64:
FCM_CREDENTIALS_BASE64=eyJ0eXBlIjoic2VydmljZ...
```

**Frontend (.env):**
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_VAPID_KEY=BPLz...
```

6. **Ejecutar migraciones:**
```bash
php artisan migrate
php artisan db:seed --class=NotificationTypesSeeder
```

---

## Resumen Visual

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                    WIDDO - SISTEMA DE NOTIFICACIONES                       ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   SERVICIOS EXTERNOS                     BACKEND LARAVEL                  ║
║   ┌─────────────┐                       ┌─────────────────────────────┐  ║
║   │   Firebase  │◄──────────────────────│   NotificationManager       │  ║
║   │    (FCM)    │   Envía push          │   ┌───────────────────────┐ │  ║
║   │   GRATIS    │                       │   │  PreferenceResolver   │ │  ║
║   └─────────────┘                       │   └───────────────────────┘ │  ║
║         │                               │   ┌───────────────────────┐ │  ║
║         │                               │   │  Channels:            │ │  ║
║   ┌─────────────┐                       │   │  - EmailChannel       │ │  ║
║   │   Resend    │◄──────────────────────│   │  - PushChannel        │ │  ║
║   │   (Email)   │   Envía email         │   │  - InAppChannel       │ │  ║
║   │ YA TIENES   │                       │   └───────────────────────┘ │  ║
║   └─────────────┘                       └─────────────────────────────┘  ║
║                                                      │                    ║
║                                                      ▼                    ║
║   DISPOSITIVOS                           ┌─────────────────────────────┐  ║
║   ┌─────────────┐                       │   Base de Datos             │  ║
║   │ Web Browser │  Service Worker       │   - user_push_tokens        │  ║
║   │   (PWA)     │  recibe push          │   - user_notification_      │  ║
║   └─────────────┘                       │     settings                │  ║
║   ┌─────────────┐                       │   - notification_logs       │  ║
║   │  iOS App    │  Capacitor plugin     │   - notification_types      │  ║
║   │ (Capacitor) │  recibe push          │   - pla_notifications       │  ║
║   └─────────────┘                       │     (ya existe)             │  ║
║   ┌─────────────┐                       └─────────────────────────────┘  ║
║   │ Android App │  Capacitor plugin                                      ║
║   │ (Capacitor) │  recibe push                                           ║
║   └─────────────┘                                                        ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  FASES:  [MVP: Web Push básico] → [Post-MVP: Capacitor + Config]         ║
║          → [Escala: Analytics + Segmentación + Optimización]              ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## Notas Adicionales

### Notificaciones Obligatorias (No se pueden desactivar)

| Tipo | Razón |
|------|-------|
| Cancelación de evento/entrenamiento | Urgente, afecta planes del usuario |
| Convocatoria a partido | Tiempo-sensible |
| Cambio de horario de entrenamiento | Evita que vayan en vano |
| Pago vencido | Impacto en negocio |
| Alertas de seguridad | Protección de cuenta |

### Mejores Prácticas para Pedir Permisos

1. **NO pedir permiso inmediatamente** al cargar la página
2. **Explicar el valor** antes de pedir permiso
3. **Momento contextual**: pedir después de una acción relevante
4. **Respetar el "No"**: si el usuario rechaza, no insistir
5. **Ofrecer configuración**: permitir desactivar tipos específicos después

### Comandos Útiles

```bash
# Backend - Ejecutar queue worker
php artisan queue:work --queue=notifications

# Backend - Probar envío de push (crear comando)
php artisan push:test {user_id}

# Frontend - Build para producción
npm run build

# Capacitor - Sincronizar cambios
npx cap sync

# Capacitor - Abrir en Xcode
npx cap open ios

# Capacitor - Abrir en Android Studio
npx cap open android
```
