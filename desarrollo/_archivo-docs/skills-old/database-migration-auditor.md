# Database Migration Auditor

## Descripcion
Audita la integridad de migraciones de base de datos, indices, foreign keys, y seeders. Detecta problemas de schema que pueden causar errores o degradar performance.

## Cuando Usar
- Antes de deployar migraciones nuevas
- Cuando hay errores de integridad referencial
- Optimizacion de queries lentos
- Auditorias de base de datos

---

## Arquitectura de BD en Widdo

### Motor
```
MySQL 8.0 (DigitalOcean Managed Database)
```

### Estructura de Tablas
```
Prefijo "bas_" - Datos de referencia (paises, deportes, etc)
Prefijo "pla_" - Datos de plataforma (clubs, jugadores, etc)
Sin prefijo   - Tablas de Laravel (users, migrations, etc)
```

### Ubicacion de Migraciones
```
saas_sport/database/migrations/
```

---

## Checklist de Auditoria

### 1. Estado de Migraciones

```bash
# Ver estado actual
php artisan migrate:status

# Verificar que no hay pendientes
php artisan migrate:status | grep "No"
```

**Verificar:**
```
[ ] Todas las migraciones estan ejecutadas
[ ] No hay migraciones fallidas
[ ] Orden de migraciones es correcto
```

### 2. Foreign Keys

**Verificar que existen:**
```sql
-- Listar foreign keys de una tabla
SELECT
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'pla_club_team_players'
AND REFERENCED_TABLE_NAME IS NOT NULL;
```

**Foreign keys criticas:**
```
[ ] pla_club_team_players.club_id -> pla_club_teams.id
[ ] pla_club_team_players.category_id -> pla_club_team_categories.id
[ ] pla_club_team_players.user_id -> users.id
[ ] pla_club_team_payments.player_id -> pla_club_team_players.id
[ ] pla_events.club_id -> pla_club_teams.id
[ ] user_club_roles.user_id -> users.id
[ ] user_club_roles.club_id -> pla_club_teams.id
```

**Migracion correcta:**
```php
Schema::table('pla_club_team_players', function (Blueprint $table) {
    $table->foreignId('club_id')
          ->constrained('pla_club_teams')
          ->onDelete('cascade');  // o 'restrict'

    $table->foreignId('category_id')
          ->nullable()
          ->constrained('pla_club_team_categories')
          ->onDelete('set null');
});
```

### 3. ON DELETE Actions

| Relacion | Accion Correcta | Razon |
|----------|-----------------|-------|
| club -> players | CASCADE | Borrar club borra jugadores |
| player -> payments | RESTRICT | No borrar jugador con pagos |
| player -> documents | CASCADE | Borrar jugador borra docs |
| category -> players | SET NULL | Borrar categoria no borra jugadores |
| user -> club_roles | CASCADE | Borrar user borra sus roles |

**Verificar:**
```sql
SELECT
    CONSTRAINT_NAME,
    DELETE_RULE
FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
WHERE TABLE_NAME = 'pla_club_team_players';
```

### 4. Indices

**Indices recomendados:**

```php
// pla_club_team_players
$table->index('club_id');
$table->index('category_id');
$table->index('status');
$table->index(['club_id', 'status']);
$table->index('document_number');
$table->index('email');

// pla_events
$table->index(['club_id', 'start_date']);
$table->index('event_type');
$table->index('status');

// pla_club_team_payments
$table->index(['club_id', 'status']);
$table->index('player_id');
$table->index('due_date');
$table->index(['status', 'due_date']);

// user_club_roles
$table->index(['user_id', 'club_id']);
$table->index(['club_id', 'role']);
$table->unique(['user_id', 'club_id', 'role']);
```

**Verificar indices existentes:**
```sql
SHOW INDEX FROM pla_club_team_players;
```

**Detectar indices faltantes (queries lentos):**
```sql
-- Activar slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Ver queries lentos
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

### 5. Tipos de Datos

**Verificar consistencia:**

| Campo | Tipo Correcto | Incorrecto |
|-------|---------------|------------|
| IDs | BIGINT UNSIGNED | INT |
| Montos | DECIMAL(10,2) | FLOAT |
| Fechas | DATE o DATETIME | VARCHAR |
| Status | VARCHAR(10) o ENUM | TEXT |
| Booleanos | TINYINT(1) | VARCHAR |
| JSON | JSON | TEXT |

```php
// Correcto
$table->decimal('amount', 10, 2);
$table->date('birth_date');
$table->string('status', 10)->default('ACT');
$table->boolean('is_active')->default(true);
$table->json('metadata')->nullable();
```

### 6. Nullable y Defaults

```php
// Campos que DEBEN ser NOT NULL
$table->string('first_name');        // Requerido
$table->foreignId('club_id');        // Siempre tiene club
$table->string('status')->default('ACT');  // Default

// Campos que PUEDEN ser NULL
$table->string('phone')->nullable();
$table->date('birth_date')->nullable();
$table->foreignId('category_id')->nullable();
$table->text('notes')->nullable();
```

**Verificar:**
```sql
SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'pla_club_team_players';
```

### 7. Soft Deletes

**Tablas que DEBEN tener soft delete:**
```
[ ] pla_club_team_players (jugadores)
[ ] pla_club_teams (clubs)
[ ] pla_events (eventos)
[ ] pla_club_team_payments (pagos)
```

**Migracion:**
```php
$table->softDeletes();  // Agrega deleted_at
```

**Verificar:**
```sql
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'pla_club_team_players'
AND COLUMN_NAME = 'deleted_at';
```

### 8. Timestamps

**Todas las tablas deben tener:**
```php
$table->timestamps();  // created_at, updated_at
```

**Verificar:**
```sql
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'widdo'
AND TABLE_NAME NOT IN (
    SELECT DISTINCT TABLE_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE COLUMN_NAME = 'created_at'
);
```

---

## Seeders

### Datos de Referencia (Requeridos)

```
[ ] BasCountry - Paises
[ ] BasState - Estados/Departamentos
[ ] BasCity - Ciudades
[ ] BasSport - Deportes
[ ] BasPosition - Posiciones por deporte
[ ] BasGender - Generos
[ ] BasTypeDocumentByCountry - Tipos de documento
[ ] BasPaymentMethod - Metodos de pago
[ ] BasSubscriptionPlan - Planes de suscripcion
```

**Verificar que estan pobladas:**
```sql
SELECT TABLE_NAME, TABLE_ROWS
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE 'bas_%';
```

### Seeders de Prueba (Solo Desarrollo)

```bash
# Ejecutar seeders
php artisan db:seed

# Ejecutar seeder especifico
php artisan db:seed --class=CountrySeeder
```

---

## Comandos de Diagnostico

```bash
# Ver estructura de tabla
php artisan schema:dump
# o
DESCRIBE pla_club_team_players;

# Ver foreign keys
php artisan db:show --tables

# Verificar integridad
mysqlcheck -u user -p --check widdo

# Ver tamano de tablas
SELECT
    TABLE_NAME,
    ROUND(DATA_LENGTH / 1024 / 1024, 2) AS 'Data (MB)',
    ROUND(INDEX_LENGTH / 1024 / 1024, 2) AS 'Index (MB)',
    TABLE_ROWS
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'widdo'
ORDER BY DATA_LENGTH DESC;
```

---

## Problemas Comunes

### 1. Foreign key a tabla inexistente
```
Error: Cannot add foreign key constraint
Solucion: Verificar orden de migraciones
```

### 2. Tipo de dato diferente en FK
```
Error: Foreign key constraint is incorrectly formed
Solucion: Ambas columnas deben ser BIGINT UNSIGNED
```

### 3. Indice duplicado
```
Error: Duplicate key name
Solucion: Verificar que no existe antes de crear
```

### 4. Columna muy larga para indice
```
Error: Specified key was too long
Solucion: Usar $table->string('field', 191) o cambiar charset
```

---

## Migracion Segura

```php
// Verificar antes de modificar
if (Schema::hasColumn('pla_club_team_players', 'old_column')) {
    Schema::table('pla_club_team_players', function (Blueprint $table) {
        $table->dropColumn('old_column');
    });
}

// Agregar columna si no existe
if (!Schema::hasColumn('pla_club_team_players', 'new_column')) {
    Schema::table('pla_club_team_players', function (Blueprint $table) {
        $table->string('new_column')->nullable();
    });
}

// Modificar columna existente
Schema::table('pla_club_team_players', function (Blueprint $table) {
    $table->string('status', 20)->default('ACT')->change();
});
```

---

## Reporte de Auditoria

### CRITICO
- Foreign key faltante en relacion principal
- Tipo de dato incorrecto para montos (FLOAT en vez de DECIMAL)
- Sin indice en columna de filtro frecuente

### ALTO
- ON DELETE incorrecto (CASCADE donde deberia ser RESTRICT)
- Soft delete faltante en tabla importante
- Sin unique constraint en campo que debe ser unico

### MEDIO
- Indice no optimizado (columnas en orden incorrecto)
- Campo nullable que deberia tener default
- Timestamps faltantes

### BAJO
- Nombre de indice no estandarizado
- Comentarios faltantes en columnas
- Seeder de prueba incluido en produccion
