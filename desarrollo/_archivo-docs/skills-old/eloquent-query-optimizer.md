# Eloquent Query Optimizer

## Descripcion
Detecta y corrige problemas de rendimiento en queries de Eloquent: N+1 queries, falta de indices, queries lentos, y optimizaciones de base de datos.

## Cuando Usar
- La aplicacion esta lenta
- Hay timeouts en endpoints
- Antes de optimizar performance
- Al agregar nuevas relaciones

---

## Problemas Comunes

### 1. N+1 Queries

**Problema:**
```php
// MALO - N+1 queries
$players = Player::all();
foreach ($players as $player) {
    echo $player->category->name;  // Query por cada player
}
// Si hay 100 players = 101 queries
```

**Solucion:**
```php
// BUENO - Eager loading
$players = Player::with('category')->get();
foreach ($players as $player) {
    echo $player->category->name;  // Sin query adicional
}
// Total: 2 queries
```

### 2. Eager Loading Anidado

```php
// Cargar relaciones anidadas
$players = Player::with([
    'category',
    'category.sport',
    'documents',
    'payments.installments'
])->get();
```

### 3. Seleccion de Columnas

```php
// MALO - trae todas las columnas
$players = Player::all();

// BUENO - solo columnas necesarias
$players = Player::select('id', 'first_name', 'last_name', 'category_id')
    ->with('category:id,name')
    ->get();
```

---

## Checklist de Auditoria

### Controllers a Revisar

```
[ ] PlaClubTeamPlayerController - Listado de jugadores
[ ] PlaEventController - Eventos con participantes
[ ] PlaClubTeamPaymentController - Pagos con cuotas
[ ] PlaClubTeamSessionController - Sesiones con asistencia
[ ] DashboardController - Multiples consultas
```

### Buscar N+1 en Codigo

```bash
# Buscar foreach que acceden a relaciones
grep -rn "foreach.*->.*->" app/Http/Controllers/

# Buscar acceso a relaciones sin with()
grep -B5 "->category\|->player\|->club\|->user" app/Http/Controllers/ | grep -v "with("
```

### Indices de Base de Datos

Verificar indices en columnas frecuentemente filtradas:

```sql
-- Columnas que DEBEN tener indice
SHOW INDEX FROM pla_club_team_players;

-- Indices recomendados:
CREATE INDEX idx_players_club ON pla_club_team_players(club_id);
CREATE INDEX idx_players_category ON pla_club_team_players(category_id);
CREATE INDEX idx_players_status ON pla_club_team_players(status);
CREATE INDEX idx_payments_player ON pla_club_team_payments(player_id);
CREATE INDEX idx_payments_status ON pla_club_team_payments(status);
CREATE INDEX idx_events_club_date ON pla_events(club_id, start_date);
```

---

## Herramientas de Debug

### Laravel Debugbar
```php
// config/debugbar.php - solo en local
'enabled' => env('DEBUGBAR_ENABLED', false),
```

Muestra:
- Numero de queries por request
- Tiempo de cada query
- Queries duplicados

### Query Log Manual
```php
// En controller para debug
DB::enableQueryLog();

$players = Player::with('category')->get();

dd(DB::getQueryLog());
```

### Telescope
```bash
composer require laravel/telescope --dev
php artisan telescope:install
```

---

## Optimizaciones por Modelo

### PlaClubTeamPlayer
```php
// Relaciones comunes a eager load
Player::with([
    'category:id,name',
    'documents',
    'eps:id,name',
    'user:id,email'
])->get();

// Indices necesarios
Schema::table('pla_club_team_players', function (Blueprint $table) {
    $table->index('club_id');
    $table->index('category_id');
    $table->index(['club_id', 'status']);
    $table->index('document_number');
});
```

### PlaEvent
```php
// Eventos con participantes
Event::with([
    'participants:id,event_id,player_id',
    'participants.player:id,first_name,last_name',
    'location:id,name',
    'creator:id,name'
])->get();

// Indices
Schema::table('pla_events', function (Blueprint $table) {
    $table->index(['club_id', 'start_date']);
    $table->index('event_type');
    $table->index(['club_id', 'status']);
});
```

### PlaClubTeamPayment
```php
// Pagos con detalles
Payment::with([
    'player:id,first_name,last_name',
    'installments',
    'charge:id,name,amount'
])->get();

// Indices
Schema::table('pla_club_team_payments', function (Blueprint $table) {
    $table->index(['club_id', 'status']);
    $table->index('player_id');
    $table->index('due_date');
});
```

---

## Queries Lentos Comunes

### Dashboard con Multiples Conteos
```php
// MALO - multiples queries
$totalPlayers = Player::count();
$activePlayers = Player::where('status', 'ACT')->count();
$pendingPayments = Payment::where('status', 'pending')->count();

// MEJOR - una query con subqueries
$stats = DB::table('pla_club_team_players')
    ->selectRaw('COUNT(*) as total')
    ->selectRaw('SUM(CASE WHEN status = "ACT" THEN 1 ELSE 0 END) as active')
    ->first();
```

### Busqueda con LIKE
```php
// MALO - LIKE al inicio no usa indice
Player::where('name', 'LIKE', '%juan%')->get();

// MEJOR - Full text search o LIKE al final
Player::where('name', 'LIKE', 'juan%')->get();

// OPTIMO - Full text index
Player::whereRaw('MATCH(first_name, last_name) AGAINST(?)', [$search])->get();
```

### Ordenamiento de Relaciones
```php
// MALO - ordena en PHP
$players = Player::with('payments')->get();
$players->each(function ($player) {
    $player->payments = $player->payments->sortByDesc('created_at');
});

// BUENO - ordena en query
$players = Player::with(['payments' => function ($query) {
    $query->orderByDesc('created_at');
}])->get();
```

---

## Cache de Queries Frecuentes

```php
// Datos que cambian poco
$countries = Cache::remember('countries', 3600, function () {
    return BasCountry::all();
});

$sports = Cache::remember('sports', 3600, function () {
    return BasSport::with('positions')->get();
});

// Invalidar cache cuando cambia
BasCountry::observe(new CacheInvalidationObserver('countries'));
```

---

## Paginacion Eficiente

```php
// Para listados grandes
$players = Player::with('category')
    ->select('id', 'first_name', 'last_name', 'category_id', 'status')
    ->orderBy('created_at', 'desc')
    ->paginate(25);  // No usar get() para listados grandes

// Cursor pagination para datasets muy grandes
$players = Player::orderBy('id')->cursorPaginate(100);
```

---

## Reporte de Optimizacion

| Endpoint | Queries Antes | Queries Despues | Mejora |
|----------|---------------|-----------------|--------|
| GET /players | 102 | 3 | 97% |
| GET /dashboard | 15 | 4 | 73% |
| GET /events | 50 | 5 | 90% |

### Indices Agregados
```sql
ALTER TABLE pla_club_team_players ADD INDEX idx_club_status (club_id, status);
ALTER TABLE pla_events ADD INDEX idx_club_date (club_id, start_date);
```

### Tiempo de Respuesta
- Antes: 2.5s promedio
- Despues: 180ms promedio
