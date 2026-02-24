# CLAUDE.md - Widdo Desarrollo

## Documentacion del Proyecto

| Archivo | Proposito |
|---------|-----------|
| `ARCHITECTURE.md` | Vision general del sistema |
| `saas_sport/docs/PAYMENT-GATEWAYS.md` | Guia de configuracion de pasarelas de pago |
| `.claude/context.md` | Estado actual del proyecto |
| `.claude/decisions.md` | Decisiones arquitectonicas |
| `.claude/memory.md` | Contexto persistente entre sesiones |

### Por Proyecto

| Proyecto | Documentacion |
|----------|---------------|
| **Backend** | `saas_sport/BACKEND.md`, `saas_sport/DATABASE.md` |
| **Frontend** | `frontend/FRONTEND.md` |

### Archivos .claude/ por proyecto

| Archivo | Backend | Frontend | Proposito |
|---------|---------|----------|-----------|
| `instructions.md` | ✓ | ✓ | Comandos y convenciones |
| `context.md` | ✓ | ✓ | Features implementadas |
| `todos.md` | ✓ | ✓ | Pendientes |
| `patterns.md` | ✓ | ✓ | Patrones de codigo |
| `file-index.md` | ✓ | ✓ | Indice de archivos por modulo |
| `critical-files.md` | ✓ | ✓ | Resumenes de archivos clave |

---

## Repositorios Git

- **Frontend:** `frontend/` (React + Vite)
- **Backend:** `saas_sport/` (Laravel 12 + Reverb)

El directorio `desarrollo/` NO es un repo git.

---

## Laravel Reverb (WebSockets en Tiempo Real)

### Configuracion Completada

| Componente | Estado | Archivo |
|------------|--------|---------|
| Backend Reverb | ✅ | `config/reverb.php`, `config/broadcasting.php` |
| Canales privados | ✅ | `routes/channels.php` |
| Eventos broadcast | ✅ | `app/Events/ChargeCreated.php`, `PaymentRegistered.php`, `SessionUpdated.php` |
| Frontend Echo | ✅ | `frontend/src/services/echo.js` |
| Hooks real-time | ✅ | `useRealtimeNotifications.js`, `useClubRealtimeEvents.js` |

### Canales Disponibles

| Canal | Permisos | Eventos |
|-------|----------|---------|
| `notifications.{userId}` | Solo el usuario | notification.created, notification.read |
| `club.{clubId}` | Miembros activos del club | Eventos generales |
| `club.{clubId}.payments` | Owner, Admin, Accountant | charge.created, payment.registered |
| `club.{clubId}.sessions` | Todos los miembros | session.updated |

### Iniciar Reverb (Desarrollo)

```bash
# Terminal 1: Iniciar Reverb server
cd saas_sport
docker compose exec saas_sport_app php artisan reverb:start

# O sin Docker:
php artisan reverb:start
```

### Probar Eventos (Tinker)

```bash
docker compose exec saas_sport_app php artisan tinker

# Probar evento de cobro
$charge = App\Models\PlaClubTeamCharge::first();
event(new App\Events\ChargeCreated($charge));

# Probar evento de pago
$payment = App\Models\PlaClubTeamPayment::first();
event(new App\Events\PaymentRegistered($payment));
```

### Variables de Entorno

**Backend (.env):**
```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=widdo
REVERB_APP_KEY=widdo-key
REVERB_APP_SECRET=widdo-secret-dev
REVERB_HOST=localhost
REVERB_PORT=6001
REVERB_SCHEME=http
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=6001
```

**Frontend (.env):**
```env
VITE_REVERB_APP_KEY=widdo-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=6001
VITE_REVERB_SCHEME=http
```

### Uso en Componentes

Los eventos se invalidan automaticamente en React Query via `PrivateLayout.jsx`.
Para manejar eventos personalizados:

```javascript
import useClubRealtimeEvents from '@/hooks/useClubRealtimeEvents';

const MyComponent = () => {
  const { isConnected, lastEvent } = useClubRealtimeEvents({
    onChargeCreated: (charge) => console.log('Nuevo cobro:', charge),
    onPaymentRegistered: (payment) => console.log('Nuevo pago:', payment),
    enabled: true,
  });

  return <div>Conectado: {isConnected ? 'Si' : 'No'}</div>;
};
```

---

## Comandos Rapidos

### Backend
```bash
cd saas_sport
php artisan test                    # Todos los tests
php artisan test --filter=Auth      # Tests especificos
php artisan test --parallel         # Ejecucion paralela
```

### Frontend
```bash
cd frontend
npm run dev                         # Servidor desarrollo
npm run test:e2e                    # Tests Playwright
npm run test:e2e:ui                 # Modo interactivo
```

---

## Usuarios de Prueba (Tests E2E)

| Rol | Email | Password | Club |
|-----|-------|----------|------|
| Owner | director@bogotafc.co | Password123! | 1 |
| Trainer | diego.sanchez@bogotafc.co | Password123! | 1 |
| Player | alejandro.alvarez10@player.co | Password123! | 1 |
| Parent | luzm@h.com | Password123! | 7 |
| Accountant | contador@bogotafc.co | Password123! | 1 |
| Super Admin | admin@sportsclub.co | AdminPassword123! | - |

---

## Pasarelas de Pago (Multi-Gateway)

**Doc completa:** `saas_sport/docs/PAYMENT-GATEWAYS.md`

### Pasarelas Implementadas

| Pasarela | Flujo | Paises | Estado |
|----------|-------|--------|--------|
| Wompi | Widget embebido | CO | ✅ Activa |
| MercadoPago | Redirect (Checkout Pro) | AR, BR, CL, CO, MX, PE, UY | ✅ Activa |

### Configurar desde Admin

1. Login como Super Admin → Menu → Plataforma → **Pasarelas** (`/home/admin/payment-gateways`)
2. Toggle global para activar/desactivar pasarela
3. Clic "Configurar" → "Agregar Pais" → credenciales + ambiente + default

### Credenciales

**Wompi:** Public Key, Private Key, Events Secret, Integrity Secret
- Panel: https://comercios.wompi.co → Configuracion → Llaves
- Webhook: `https://api.widdo.co/api/webhooks/wompi/CO`

**MercadoPago:** Public Key, Access Token, Webhook Secret
- Panel: https://www.mercadopago.com/developers → Tus integraciones → Credenciales
- Webhook: `https://api.widdo.co/api/webhooks/mercadopago`
- Eventos a registrar: `payment` (todos)

### Arquitectura

```
app/Services/Payments/
├── PaymentGatewayInterface.php   ← Interface base
├── PaymentGatewayFactory.php     ← Resuelve gateway por pais
├── PaymentService.php            ← Pagos y suscripciones
├── WompiGateway.php              ← checkout_type: 'widget'
└── MercadoPagoGateway.php        ← checkout_type: 'redirect'
```

### Frontend

- `SubscriptionPage.jsx` — Detecta checkout_type: redirect → window.location.href, widget → carga script Wompi
- `PaymentGatewaysPage.jsx` — Admin UI (SuperAdminGuard)
- Menu: `MenuList.jsx` → seccion Plataforma → "Pasarelas"

### Agregar nueva pasarela

1. Crear `NuevaGateway.php` implementando `PaymentGatewayInterface`
2. Registrar en `PaymentGatewayFactory::GATEWAY_CLASSES`
3. Agregar en `PaymentGatewaysSeeder`
4. Agregar `handleNueva()` en `WebhookController`
5. Agregar ruta webhook en `routes/api.php`
6. Agregar case en `PaymentService::extractExternalEventId()`
7. `php artisan db:seed --class=PaymentGatewaysSeeder`

---

## Problemas Conocidos (Evitar Re-diagnostico)

| Problema | Solucion | Archivo |
|----------|----------|---------|
| Fechas pierden 1 dia | Usar `dateUtils.js` | `frontend/src/helpers/dateUtils.js` |
| Radix Select loop infinito | Usar `react-select` en dialogs | `patterns.md` |
| Multi-tenancy bypass | Verificar `ProtectedModel` trait | `critical-files.md` |

---

## Referencias Detalladas

Para informacion completa, ver:

- **Roles y permisos** → `ARCHITECTURE.md`
- **Patrones de codigo** → `saas_sport/.claude/patterns.md`, `frontend/.claude/patterns.md`
- **Archivos criticos** → `saas_sport/.claude/critical-files.md`, `frontend/.claude/critical-files.md`
- **Auth y refresh tokens** → `critical-files.md` (AuthController, axiosInstance)
- **Pasarelas de pago** → `saas_sport/docs/PAYMENT-GATEWAYS.md`
- **Migracion Laravel 12** → `.claude/decisions.md`
