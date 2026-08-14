# Problema de Acceso de Usuarios - Diagnóstico y Solución

## 📋 Resumen del Problema

Los usuarios que son propietarios de clubs (tienen registros en `pla_club_teams` con su `user_id`) no pueden acceder al sistema porque les falta el registro correspondiente en la tabla `user_club_roles` con rol `owner`.

### ¿Por qué está pasando esto?

El sistema ha migrado a usar la tabla `user_club_roles` para gestionar todos los roles de usuarios en diferentes clubs. Durante el login:

1. `AuthController::login` llama a `$user->getContexts()`
2. `getContexts()` busca roles activos en `user_club_roles`
3. Si no encuentra contextos, intenta crear desde datos legacy con `createContextsFromLegacy()`
4. **PROBLEMA**: Si `createContextsFromLegacy()` falla o no se ejecuta correctamente, el usuario queda sin acceso

### Usuario Afectado Reportado

- **Email**: `javi@mail.com`
- **Síntoma**: Tenía acceso ayer, hoy no puede entrar
- **Causa probable**: Cambio en migraciones o seeders que eliminó/no creó el registro en `user_club_roles`

---

## 🔧 Soluciones

### Solución 1: Comando de Diagnóstico y Corrección Automática (RECOMENDADA)

He creado un comando artisan que diagnostica y corrige el problema automáticamente:

```bash
cd saas_sport
./vendor/bin/sail artisan user:diagnose javi@mail.com
```

Este comando:
- ✅ Muestra toda la información del usuario
- ✅ Detecta clubs donde es propietario
- ✅ Identifica registros faltantes en `user_club_roles`
- ✅ Propone correcciones automáticas
- ✅ Pregunta si deseas aplicar las correcciones

También puedes usar el script simplificado:

```bash
./fix-user-access.sh javi@mail.com
```

---

### Solución 2: Seeder de Corrección Masiva

Si hay múltiples usuarios afectados, ejecuta el seeder que corrige TODOS los propietarios:

```bash
cd saas_sport
./vendor/bin/sail artisan db:seed --class=FixClubOwnersUserClubRolesSeeder
```

Este seeder:
- ✅ Encuentra todos los clubs con `user_id` asignado
- ✅ Verifica si existe el rol `owner` en `user_club_roles`
- ✅ Crea el registro si no existe
- ✅ Actualiza `current_club_id` del usuario

---

### Solución 3: Corrección Manual con Tinker

Si prefieres hacerlo manualmente:

```bash
cd saas_sport
./vendor/bin/sail artisan tinker
```

Luego ejecuta:

```php
use App\Models\User;
use App\Models\UserClubRole;

// Buscar el usuario
$user = User::where('email', 'javi@mail.com')->first();

// Ver sus clubs
$user->teams;

// Crear el rol owner para cada club
foreach ($user->teams as $club) {
    UserClubRole::firstOrCreate([
        'user_id' => $user->id,
        'club_id' => $club->id,
        'role' => 'owner',
    ], [
        'status' => 'ACT',
        'onboarding_completed' => true,
        'onboarding_step' => 4,
        'onboarding_completed_at' => now(),
        'assigned_at' => now(),
    ]);
}

// Actualizar current_club_id si no lo tiene
if (!$user->current_club_id) {
    $user->update(['current_club_id' => $user->teams->first()->id]);
}

echo "✅ Usuario corregido";
```

---

## 🔍 Verificación Post-Corrección

Después de aplicar cualquier solución, verifica que el usuario pueda hacer login:

```bash
./vendor/bin/sail artisan tinker
```

```php
$user = User::where('email', 'javi@mail.com')->first();

// Verificar contextos (lo que ve el login)
$contexts = $user->getContexts();
print_r($contexts);

// Debe retornar un array con al menos un contexto owner
```

---

## 📊 Prevención Futura

Para evitar que esto vuelva a pasar:

### 1. Incluir el seeder en DatabaseSeeder

Agregar en `DatabaseSeeder.php`:

```php
if (!$isProduction) {
    $this->call([
        RealisticDataSeeder::class,
        FixClubOwnersUserClubRolesSeeder::class, // ← AGREGAR AQUÍ
        MigrateToUserClubRolesSeeder::class,
        FixAllUsersCurrentClubSeeder::class,
    ]);
}
```

### 2. Observer para PlaClubTeam

Crear un observer que automáticamente cree el rol owner cuando se crea un club:

```php
// app/Observers/PlaClubTeamObserver.php
class PlaClubTeamObserver
{
    public function created(PlaClubTeam $club)
    {
        if ($club->user_id) {
            UserClubRole::firstOrCreate([
                'user_id' => $club->user_id,
                'club_id' => $club->id,
                'role' => 'owner',
            ], [
                'status' => 'ACT',
                'assigned_at' => now(),
            ]);
        }
    }
}
```

Registrar en `AppServiceProvider`:

```php
use App\Models\PlaClubTeam;
use App\Observers\PlaClubTeamObserver;

public function boot()
{
    PlaClubTeam::observe(PlaClubTeamObserver::class);
}
```

---

## 🐛 Causas Comunes del Problema

1. **Migraciones ejecutadas sin seeders**: Si se ejecutó `migrate:fresh` sin ejecutar los seeders de corrección
2. **Datos legacy inconsistentes**: Clubs creados antes de implementar `user_club_roles`
3. **Fallo en `createContextsFromLegacy()`**: La función del login no pudo crear los contextos automáticamente
4. **Seeder incompleto**: `MigrateToUserClubRolesSeeder` no se ejecutó o falló

---

## 📝 Checklist de Corrección

- [ ] Verificar que Docker esté corriendo: `docker ps`
- [ ] Ejecutar comando de diagnóstico: `./vendor/bin/sail artisan user:diagnose javi@mail.com`
- [ ] Aplicar correcciones automáticas cuando el comando lo ofrezca
- [ ] Verificar que el usuario pueda hacer login
- [ ] Si hay más usuarios afectados, ejecutar el seeder masivo
- [ ] Considerar implementar el observer para prevenir futuros problemas

---

## 🆘 Si Nada Funciona

1. Verificar que Docker esté corriendo:
   ```bash
   cd saas_sport
   ./vendor/bin/sail up -d
   ```

2. Verificar conexión a la base de datos:
   ```bash
   ./vendor/bin/sail artisan tinker
   DB::connection()->getPdo();
   ```

3. Ejecutar migraciones y seeders desde cero:
   ```bash
   ./vendor/bin/sail artisan migrate:fresh --seed
   ```
   ⚠️ **ADVERTENCIA**: Esto borrará TODOS los datos

4. Contactar al desarrollador con los logs de error

---

## 📞 Contacto

Si necesitas ayuda adicional, por favor proporciona:
- Email del usuario afectado
- Output del comando `user:diagnose`
- Logs de error si los hay
