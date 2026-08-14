# RBAC Permission Auditor

## Descripcion
Audita el sistema de roles y permisos (RBAC) implementado con Spatie Laravel Permission. Verifica que cada rol tenga los permisos correctos y que las rutas esten protegidas adecuadamente.

## Cuando Usar
- Al agregar nuevos roles o permisos
- Cuando usuarios reportan acceso denegado incorrecto
- Cuando usuarios acceden a funciones no permitidas
- Auditorias de seguridad

---

## Arquitectura RBAC en Widdo

### Roles del Sistema
```
super_admin    - Administrador de la plataforma
owner          - Propietario del club
trainer        - Entrenador
player         - Jugador
parent         - Padre/Acudiente
accountant     - Contador
```

### Tabla de Relacion Usuario-Club-Rol
```sql
user_club_roles:
  - user_id
  - club_id
  - role (owner, trainer, player, parent, accountant)
  - status (ACT, INA, BOR)
```

### Paquete Spatie
```php
// Permisos granulares
'players.view', 'players.create', 'players.edit', 'players.delete'
'payments.view', 'payments.create', 'payments.manage'
'events.view', 'events.create', 'events.edit'
// etc.
```

---

## Matriz de Permisos por Rol

### OWNER (Propietario)
```
[x] Acceso total al club
[x] Crear/editar/eliminar entrenadores
[x] Crear/editar/eliminar jugadores
[x] Gestionar categorias
[x] Gestionar pagos y finanzas
[x] Ver reportes completos
[x] Configurar club
[x] Gestionar suscripcion
[x] Invitar usuarios
```

### TRAINER (Entrenador)
```
[x] Ver jugadores de sus categorias
[x] Crear/editar jugadores (limitado)
[ ] Eliminar jugadores
[x] Registrar asistencia
[x] Crear eventos de entrenamiento
[ ] Ver informacion financiera
[ ] Gestionar otros entrenadores
[x] Ver calendario
```

### PLAYER (Jugador)
```
[x] Ver su propio perfil
[x] Ver calendario de eventos
[x] Ver sus documentos
[x] Ver sus pagos pendientes
[ ] Ver datos de otros jugadores
[ ] Crear/editar cualquier dato
[ ] Ver informacion financiera del club
```

### PARENT (Padre)
```
[x] Ver perfiles de sus hijos
[x] Ver pagos de sus hijos
[x] Realizar pagos
[x] Ver calendario de eventos
[x] Subir documentos de hijos
[ ] Ver otros jugadores
[ ] Editar datos del club
```

### ACCOUNTANT (Contador)
```
[x] Ver reportes financieros
[x] Ver todos los pagos
[x] Registrar pagos manuales
[x] Exportar datos financieros
[ ] Editar jugadores
[ ] Gestionar eventos
[ ] Configurar club
```

---

## Checklist de Auditoria

### 1. Middleware de Rutas

Verificar que cada ruta tenga middleware apropiado:

```php
// routes/api.php

// CORRECTO - ruta protegida
Route::middleware(['auth:sanctum', 'role:owner,trainer'])
    ->get('/players', [PlayerController::class, 'index']);

// INCORRECTO - sin middleware
Route::get('/players', [PlayerController::class, 'index']);
```

**Comando para verificar:**
```bash
php artisan route:list | grep -v "middleware"
# Rutas sin middleware son sospechosas
```

### 2. Policies de Modelos

Verificar que cada modelo tenga Policy:

```php
// app/Policies/PlaClubTeamPlayerPolicy.php

public function view(User $user, PlaClubTeamPlayer $player)
{
    // Owner ve todo
    if ($user->hasRole('owner')) {
        return $user->currentClubId() === $player->club_id;
    }

    // Trainer ve su categoria
    if ($user->hasRole('trainer')) {
        return $user->trainerCategories()->contains($player->category_id);
    }

    // Player ve solo su perfil
    if ($user->hasRole('player')) {
        return $user->player_id === $player->id;
    }

    return false;
}
```

**Modelos que DEBEN tener Policy:**
```
[ ] PlaClubTeamPlayer
[ ] PlaClubTeamTrainer
[ ] PlaClubTeamPayment
[ ] PlaEvent
[ ] PlaClubTeamSession
[ ] PlaClubTeamCharge
[ ] PlaClubTeamCategory
[ ] PlaPlayerDocument
```

### 3. Gates Personalizados

```php
// app/Providers/AuthServiceProvider.php

Gate::define('manage-club', function (User $user) {
    return $user->hasRole(['owner', 'super_admin']);
});

Gate::define('view-finances', function (User $user) {
    return $user->hasRole(['owner', 'accountant']);
});
```

### 4. Frontend Guards

Verificar que React valide permisos antes de mostrar UI:

```jsx
// PermissionGuard.jsx
<PermissionGuard permission="players.delete">
  <DeleteButton />
</PermissionGuard>

// RoleGuard.jsx
<RoleGuard roles={['owner', 'trainer']}>
  <CreatePlayerForm />
</RoleGuard>
```

**Archivos a revisar:**
```
src/components/guards/PermissionGuard.jsx
src/components/guards/RoleGuard.jsx
src/components/guards/AdminRouteGuard.jsx
src/components/guards/FinancialRouteGuard.jsx
```

### 5. Sincronizacion Frontend-Backend

```
Frontend (React)              Backend (Laravel)
--------------------          --------------------
PermissionGuard               Policy / Gate
  permission="x"                $this->authorize('x')

RoleGuard                     Middleware
  roles={['owner']}             ->middleware('role:owner')

AuthContext.user.permissions  User->getAllPermissions()
```

---

## Pruebas por Rol

### Test como OWNER
```bash
# Debe tener acceso a todo en su club
GET /api/clubs/{id}/players      # 200 OK
POST /api/clubs/{id}/players     # 201 Created
DELETE /api/players/{id}         # 200 OK
GET /api/clubs/{id}/payments     # 200 OK
GET /api/clubs/{id}/reports      # 200 OK
```

### Test como TRAINER
```bash
# Solo su categoria
GET /api/clubs/{id}/players?category={su_categoria}  # 200 OK
GET /api/clubs/{id}/players?category={otra}          # 403 o vacio

# No puede eliminar
DELETE /api/players/{id}                             # 403 Forbidden

# No puede ver finanzas
GET /api/clubs/{id}/payments                         # 403 Forbidden
```

### Test como PLAYER
```bash
# Solo su perfil
GET /api/players/{su_id}         # 200 OK
GET /api/players/{otro_id}       # 403 Forbidden

# No puede modificar
PUT /api/players/{su_id}         # 403 Forbidden
POST /api/events                 # 403 Forbidden
```

### Test como PARENT
```bash
# Puede ver hijos
GET /api/players/{hijo_id}       # 200 OK
GET /api/players/{otro_id}       # 403 Forbidden

# Puede pagar
POST /api/payments/{hijo}/pay    # 200 OK
```

---

## Comandos Utiles

```bash
# Listar permisos de un rol
php artisan permission:show owner

# Ver permisos de un usuario
php artisan tinker
>>> User::find(1)->getAllPermissions()->pluck('name')

# Asignar permiso a rol
php artisan permission:create-permission "players.export"
php artisan permission:assign-permission owner "players.export"

# Ver roles de usuario en un club
SELECT * FROM user_club_roles WHERE user_id = 1;
```

---

## Errores Comunes

### 1. Ruta sin proteccion
```php
// MALO
Route::get('/sensitive-data', [Controller::class, 'index']);

// BUENO
Route::middleware(['auth:sanctum', 'permission:view-sensitive'])
    ->get('/sensitive-data', [Controller::class, 'index']);
```

### 2. Policy no registrada
```php
// app/Providers/AuthServiceProvider.php
protected $policies = [
    PlaClubTeamPlayer::class => PlaClubTeamPlayerPolicy::class,
    // Falta registrar otras policies
];
```

### 3. Frontend muestra boton pero backend rechaza
```jsx
// Frontend muestra sin verificar permiso
<DeleteButton />  // Se muestra a todos

// Pero backend rechaza
// 403 Forbidden

// SOLUCION
<PermissionGuard permission="players.delete">
  <DeleteButton />
</PermissionGuard>
```

### 4. Super Admin no puede acceder a clubs
```php
// El super_admin no tiene user_club_role
// Necesita logica especial
if ($user->hasRole('super_admin')) {
    return true; // Acceso total
}
```

---

## Permisos Recomendados

```php
// Modulo Players
'players.view'
'players.create'
'players.edit'
'players.delete'
'players.export'
'players.invite'

// Modulo Trainers
'trainers.view'
'trainers.create'
'trainers.edit'
'trainers.delete'

// Modulo Payments
'payments.view'
'payments.create'
'payments.edit'
'payments.refund'
'payments.export'

// Modulo Events
'events.view'
'events.create'
'events.edit'
'events.delete'

// Modulo Reports
'reports.view'
'reports.financial'
'reports.attendance'
'reports.export'

// Modulo Settings
'settings.view'
'settings.edit'
'settings.subscription'
```

---

## Reporte de Hallazgos

### CRITICO
- Ruta de pagos sin autenticacion
- Super admin no tiene acceso implementado
- Policy faltante en modelo sensible

### ALTO
- Trainer puede ver finanzas (deberia estar bloqueado)
- Frontend no oculta botones segun permisos
- Gate no valida club_id

### MEDIO
- Permisos inconsistentes entre roles
- Mensaje de error expone informacion
- Cache de permisos no se invalida

### BAJO
- Permisos huerfanos no usados
- Documentacion de permisos incompleta
