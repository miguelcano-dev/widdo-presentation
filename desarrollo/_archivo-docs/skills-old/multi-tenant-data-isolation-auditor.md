# Multi-Tenant Data Isolation Auditor

## Descripcion
Audita el aislamiento de datos entre clubes en el sistema multi-tenant. Verifica que usuarios de un club NUNCA puedan acceder a datos de otro club.

## Cuando Usar
- Despues de agregar nuevos modelos o endpoints
- Antes de releases a produccion
- Cuando hay reportes de datos cruzados
- Auditorias de seguridad

---

## Arquitectura Multi-Tenant de Widdo

### Tabla Central
```sql
user_club_roles:
  - user_id (FK users)
  - club_id (FK pla_club_teams)
  - role (owner, trainer, player, parent, accountant)
  - status (ACT, BOR)
```

### ClubScope Global
**Ubicacion**: `saas_sport/app/Scopes/ClubScope.php`

Este scope se aplica automaticamente a todos los modelos que lo usen, filtrando por el club del usuario autenticado.

---

## Checklist de Auditoria

### 1. Modelos con ClubScope

Verificar que TODOS los modelos `Pla*` tengan el scope:

```php
// Debe existir en cada modelo Pla*
use App\Scopes\ClubScope;

protected static function booted()
{
    static::addGlobalScope(new ClubScope);
}
```

**Modelos criticos a verificar:**
```
[ ] PlaClubTeamPlayer
[ ] PlaClubTeamTrainer
[ ] PlaClubTeamSession
[ ] PlaClubTeamPayment
[ ] PlaClubTeamCharge
[ ] PlaClubTeamCategory
[ ] PlaClubTeamLocation
[ ] PlaEvent
[ ] PlaPlayerDocument
[ ] PlaClubTeamDiscount
[ ] PlaNotification
```

### 2. Queries sin Scope

Buscar queries que bypasean el scope:

```php
// PELIGROSO - bypasea scope
Model::withoutGlobalScopes()->get();
Model::withoutGlobalScope(ClubScope::class)->get();

// PELIGROSO - query raw sin filtro
DB::table('pla_club_team_players')->get();
```

**Comando para detectar:**
```bash
grep -rn "withoutGlobalScope\|withoutGlobalScopes" app/
grep -rn "DB::table.*pla_" app/
```

### 3. Endpoints API

Verificar cada endpoint en `routes/api.php`:

```
Para cada GET /api/resource/{id}:
[ ] Valida que el recurso pertenece al club del usuario
[ ] Retorna 403 si no tiene permiso
[ ] No expone datos de otros clubs en mensajes de error

Para cada POST/PUT/DELETE:
[ ] Valida ownership antes de modificar
[ ] No permite cambiar club_id del recurso
```

### 4. Policies de Autorizacion

Verificar que cada Policy valide el club:

```php
// Ejemplo correcto
public function view(User $user, PlaClubTeamPlayer $player)
{
    return $user->currentClubId() === $player->club_id;
}
```

**Policies a revisar:**
- `PlaClubTeamPlayerPolicy`
- `PlaClubTeamTrainerPolicy`
- `PlaEventPolicy`
- `PlaClubTeamPaymentPolicy`

### 5. Relaciones Eloquent

Verificar que relaciones no expongan datos cross-tenant:

```php
// PELIGROSO si user puede tener clubs de otros
public function players()
{
    return $this->hasMany(PlaClubTeamPlayer::class);
}

// SEGURO - filtra por club
public function players()
{
    return $this->hasMany(PlaClubTeamPlayer::class)
                ->where('club_id', $this->club_id);
}
```

### 6. Frontend - ClubContext

Verificar que el frontend envie siempre el club correcto:

**Archivo**: `src/contexts/ClubContext.jsx`

```javascript
// Verificar que currentClub se use en todas las llamadas API
const { currentClub } = useClub();

// Headers deben incluir X-Club-ID o similar
axios.defaults.headers.common['X-Club-ID'] = currentClub.id;
```

---

## Pruebas de Penetracion

### Test 1: Acceso directo por ID
```bash
# Usuario del Club A intenta acceder a jugador del Club B
curl -H "Authorization: Bearer {token_club_a}" \
     GET /api/players/{id_jugador_club_b}
# Esperado: 403 Forbidden
```

### Test 2: Modificacion de recurso ajeno
```bash
curl -H "Authorization: Bearer {token_club_a}" \
     -X PUT /api/players/{id_jugador_club_b} \
     -d '{"name": "Hackeado"}'
# Esperado: 403 Forbidden
```

### Test 3: Enumeracion de IDs
```bash
# Iterar IDs secuenciales buscando recursos de otros clubs
for id in {1..1000}; do
  curl -s -o /dev/null -w "%{http_code}" \
       -H "Authorization: Bearer {token}" \
       GET /api/players/$id
done
# Verificar: Solo retorna 200 para recursos del club del usuario
```

### Test 4: Busqueda/Filtros
```bash
# Buscar jugadores - no debe mostrar de otros clubs
curl -H "Authorization: Bearer {token}" \
     GET /api/players?search=Juan
# Verificar: Solo resultados del club actual
```

### Test 5: Reportes y Exports
```bash
# Exportar datos - solo del club actual
curl -H "Authorization: Bearer {token}" \
     GET /api/reports/players/export
# Verificar: PDF/Excel solo tiene datos del club
```

---

## Archivos Clave a Revisar

```
saas_sport/
├── app/
│   ├── Scopes/
│   │   └── ClubScope.php          # Scope global principal
│   ├── Models/
│   │   └── Pla*.php               # Todos deben usar ClubScope
│   ├── Policies/
│   │   └── *Policy.php            # Validar club_id
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/               # Verificar autorizacion
│   │   └── Middleware/
│   │       └── EnsureClubAccess.php  # Middleware de club
│   └── Services/
│       └── *.php                  # Queries deben respetar scope

frontend/
├── src/
│   ├── contexts/
│   │   └── ClubContext.jsx        # Club actual seleccionado
│   └── services/
│       └── api.js                 # Headers con club_id
```

---

## Reporte de Hallazgos

Clasificar por severidad:

### CRITICO (P0)
- Modelo sin ClubScope que expone datos
- Endpoint sin validacion de club
- Query raw sin filtro de club_id

### ALTO (P1)
- Policy incompleta
- Relacion que puede filtrar datos ajenos

### MEDIO (P2)
- Mensaje de error que revela existencia de recurso ajeno
- Log que expone club_id de otro tenant

### BAJO (P3)
- Inconsistencia en manejo de errores
- Falta de test de aislamiento
