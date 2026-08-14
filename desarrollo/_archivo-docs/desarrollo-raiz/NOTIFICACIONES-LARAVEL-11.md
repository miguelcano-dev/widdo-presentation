# Notificaciones en Tiempo Real - Laravel 11 con Reverb

## Resumen

Este documento describe los pasos para activar las notificaciones en tiempo real cuando se actualice a Laravel 11 usando **Laravel Reverb** (el servidor WebSocket nativo de Laravel).

**Estado actual:** El código del frontend y los eventos del backend ya están preparados. Solo falta instalar Reverb y configurar las variables de entorno.

---

## Archivos Ya Preparados

### Backend (Laravel)

| Archivo | Descripción |
|---------|-------------|
| `app/Events/NotificationCreated.php` | Evento broadcast cuando se crea una notificación |
| `app/Events/NotificationRead.php` | Evento broadcast cuando se marca como leída |
| `app/Services/Notifications/Channels/InAppChannel.php` | Dispara el evento NotificationCreated |
| `app/Services/NotificationService.php` | Dispara el evento NotificationRead |
| `routes/channels.php` | Canal privado `notifications.{userId}` |
| `app/Providers/BroadcastServiceProvider.php` | Configurado con auth:sanctum |
| `config/app.php` | BroadcastServiceProvider habilitado |

### Frontend (React)

| Archivo | Descripción |
|---------|-------------|
| `src/services/echo.js` | Servicio Laravel Echo |
| `src/hooks/useRealtimeNotifications.js` | Hook para WebSocket |
| `src/components/notifications/NotificationDropdown.jsx` | Integrado con real-time |
| `package.json` | Incluye `laravel-echo` y `pusher-js` |

---

## Pasos para Activar en Laravel 11

### 1. Instalar Laravel Reverb

```bash
cd saas_sport
composer require laravel/reverb
php artisan reverb:install
```

Esto creará:
- `config/reverb.php`
- Variables en `.env`

### 2. Configurar Backend (.env)

```env
BROADCAST_DRIVER=reverb

REVERB_APP_ID=widdo-app
REVERB_APP_KEY=widdo-key
REVERB_APP_SECRET=tu-secret-seguro-aqui
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

# Para producción
# REVERB_HOST=api.widdo.co
# REVERB_PORT=443
# REVERB_SCHEME=https
```

### 3. Configurar Frontend (.env)

Descomentar las variables en `frontend/.env`:

```env
# Desarrollo
VITE_PUSHER_APP_KEY=widdo-key
VITE_PUSHER_HOST=localhost
VITE_PUSHER_PORT=8080
VITE_PUSHER_SCHEME=http
VITE_PUSHER_APP_CLUSTER=mt1

# Producción
# VITE_PUSHER_APP_KEY=widdo-key
# VITE_PUSHER_HOST=api.widdo.co
# VITE_PUSHER_PORT=443
# VITE_PUSHER_SCHEME=https
# VITE_PUSHER_APP_CLUSTER=mt1
```

### 4. Iniciar Reverb (Desarrollo)

```bash
php artisan reverb:start
```

O con opciones:
```bash
php artisan reverb:start --host=0.0.0.0 --port=8080 --debug
```

### 5. Verificar Conexión

1. Abrir la app en el navegador
2. Verificar en consola que aparezca: `[Echo] Connected to WebSocket server`
3. El indicador verde aparecerá junto a la campana de notificaciones

---

## Configuración de Producción

### Nginx (Proxy WebSocket)

Agregar al archivo de configuración de Nginx:

```nginx
# WebSocket proxy para Reverb
location /app {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
}
```

### Supervisor (Proceso Reverb)

Crear `/etc/supervisor/conf.d/widdo-reverb.conf`:

```ini
[program:widdo-reverb]
command=php /var/www/widdo/artisan reverb:start --host=127.0.0.1 --port=8080
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/widdo/storage/logs/reverb.log
stopwaitsecs=3600
```

Luego:
```bash
supervisorctl reread
supervisorctl update
supervisorctl start widdo-reverb
```

---

## Pruebas

### Verificar que funciona:

1. **Conexión WebSocket:**
   - Abrir DevTools > Network > WS
   - Debería ver una conexión a `/app/...`

2. **Recibir notificación:**
   - Crear una notificación desde otro tab/usuario
   - Debería aparecer instantáneamente sin recargar

3. **Sincronización entre tabs:**
   - Abrir la app en 2 tabs
   - Marcar una notificación como leída en un tab
   - El badge debería actualizarse en el otro tab

---

## Rollback

Si hay problemas, volver a polling:

```env
# Backend .env
BROADCAST_DRIVER=log

# Frontend .env (comentar las variables)
# VITE_PUSHER_APP_KEY=...
```

El sistema usará polling cada 30 segundos automáticamente.

---

## Recursos

- [Laravel Reverb Documentation](https://laravel.com/docs/11.x/reverb)
- [Laravel Broadcasting](https://laravel.com/docs/11.x/broadcasting)
- [Laravel Echo](https://laravel.com/docs/11.x/broadcasting#client-side-installation)

---

**Última actualización:** 25 de Enero de 2026
