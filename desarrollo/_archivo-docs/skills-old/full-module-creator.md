# Skill: Full Module Creator

Crea módulos completos para Widdo incluyendo backend (Laravel) y frontend (React).

## Triggers

Usar cuando el usuario diga:
- "crear módulo de X"
- "nuevo módulo X"
- "crear funcionalidad X"
- "agregar módulo X al sistema"

## Proceso

### 1. Análisis de Requerimientos

Antes de crear código, preguntar:

```
¿Qué módulo deseas crear?

Necesito saber:
1. Nombre del módulo (ej: "inventario", "uniformes", "torneos")
2. ¿Pertenece a un club? (¿tiene club_id?)
3. ¿Qué campos principales tiene?
4. ¿Qué roles pueden acceder? (owner, trainer, player, parent, accountant)
5. ¿Necesita CRUD completo o solo lectura?
```

### 2. Archivos a Crear

#### Backend (saas_sport/)

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| Migración | `database/migrations/` | Tabla con campos, FK, índices |
| Modelo | `app/Models/Pla{Module}.php` | Con ProtectedModel trait si tiene club_id |
| Controller | `app/Http/Controllers/Pla{Module}Controller.php` | CRUD con HttpResponses trait |
| Service | `app/Services/{Module}Service.php` | Lógica de negocio |
| Policy | `app/Policies/Pla{Module}Policy.php` | Autorización por rol |
| Request | `app/Http/Requests/{Module}Request.php` | Validaciones |
| Routes | `routes/api.php` | Endpoints anidados bajo club |

#### Frontend (frontend/)

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| Página | `src/pages/dashboard/{Module}/` | Página principal con tabla |
| Service | `src/services/{module}Service.js` | Llamadas API |
| Componentes | `src/components/{module}/` | Dialog de crear/editar |
| Ruta | `src/App.jsx` | Agregar ruta con guard |

### 3. Templates de Código

#### Migración

```php
// database/migrations/YYYY_MM_DD_HHMMSS_create_pla_{module}_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pla_{module}', function (Blueprint $table) {
            $table->id();
            $table->foreignId('club_id')->constrained('pla_club_teams')->onDelete('cascade');
            // Campos específicos del módulo
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('status', ['ACT', 'INA'])->default('ACT');
            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index(['club_id', 'status']);
            $table->index(['club_id', 'deleted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pla_{module}');
    }
};
```

#### Modelo

```php
// app/Models/Pla{Module}.php
<?php

namespace App\Models;

use App\Models\Traits\ProtectedModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;

class Pla{Module} extends Model implements Auditable
{
    use HasFactory, SoftDeletes, ProtectedModel;
    use \OwenIt\Auditing\Auditable;

    protected $table = 'pla_{module}';

    protected $fillable = [
        'club_id',
        'name',
        'description',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function club()
    {
        return $this->belongsTo(PlaClubTeam::class, 'club_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'ACT');
    }
}
```

#### Controller

```php
// app/Http/Controllers/Pla{Module}Controller.php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\{Module}Request;
use App\Models\Pla{Module};
use App\Services\{Module}Service;
use App\Traits\HttpResponses;
use Illuminate\Http\Request;

class Pla{Module}Controller extends Controller
{
    use HttpResponses;

    public function __construct(
        protected {Module}Service $service
    ) {}

    public function index(Request $request, int $clubId)
    {
        $this->authorize('viewAny', [Pla{Module}::class, $clubId]);

        $items = Pla{Module}::where('club_id', $clubId)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return $this->success($items);
    }

    public function store({Module}Request $request, int $clubId)
    {
        $this->authorize('create', [Pla{Module}::class, $clubId]);

        $item = $this->service->create($clubId, $request->validated());

        return $this->success($item, 'Creado exitosamente', 201);
    }

    public function show(int $clubId, int $id)
    {
        $item = Pla{Module}::where('club_id', $clubId)->findOrFail($id);
        $this->authorize('view', $item);

        return $this->success($item);
    }

    public function update({Module}Request $request, int $clubId, int $id)
    {
        $item = Pla{Module}::where('club_id', $clubId)->findOrFail($id);
        $this->authorize('update', $item);

        $item = $this->service->update($item, $request->validated());

        return $this->success($item, 'Actualizado exitosamente');
    }

    public function destroy(int $clubId, int $id)
    {
        $item = Pla{Module}::where('club_id', $clubId)->findOrFail($id);
        $this->authorize('delete', $item);

        $item->delete();

        return $this->success(null, 'Eliminado exitosamente');
    }
}
```

#### Service

```php
// app/Services/{Module}Service.php
<?php

namespace App\Services;

use App\Models\Pla{Module};
use Illuminate\Support\Facades\DB;

class {Module}Service
{
    public function create(int $clubId, array $data): Pla{Module}
    {
        return DB::transaction(function () use ($clubId, $data) {
            return Pla{Module}::create([
                'club_id' => $clubId,
                ...$data,
            ]);
        });
    }

    public function update(Pla{Module} $item, array $data): Pla{Module}
    {
        return DB::transaction(function () use ($item, $data) {
            $item->update($data);
            return $item->fresh();
        });
    }
}
```

#### Policy

```php
// app/Policies/Pla{Module}Policy.php
<?php

namespace App\Policies;

use App\Models\Pla{Module};
use App\Models\User;
use App\Traits\AuditTrail;

class Pla{Module}Policy
{
    use AuditTrail;

    public function viewAny(User $user, int $clubId): bool
    {
        return $user->hasClubPermission($clubId, '{module}.view');
    }

    public function view(User $user, Pla{Module} $item): bool
    {
        return $user->hasClubPermission($item->club_id, '{module}.view');
    }

    public function create(User $user, int $clubId): bool
    {
        return $user->hasClubPermission($clubId, '{module}.create');
    }

    public function update(User $user, Pla{Module} $item): bool
    {
        return $user->hasClubPermission($item->club_id, '{module}.update');
    }

    public function delete(User $user, Pla{Module} $item): bool
    {
        return $user->hasClubPermission($item->club_id, '{module}.delete');
    }
}
```

#### Request

```php
// app/Http/Requests/{Module}Request.php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class {Module}Request extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Autorización en Policy
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'status' => 'sometimes|in:ACT,INA',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio',
            'name.max' => 'El nombre no puede exceder 255 caracteres',
        ];
    }
}
```

#### Routes

```php
// routes/api.php (agregar dentro del grupo de clubs)
Route::prefix('pla_club_teams/{clubId}')->group(function () {
    // ... rutas existentes ...

    // {Module}
    Route::apiResource('{module}', Pla{Module}Controller::class);
});
```

#### Frontend Service

```javascript
// src/services/{module}Service.js
import api from './api';

const {module}Service = {
  getAll: async (clubId, params = {}) => {
    const response = await api.get(`/pla_club_teams/${clubId}/{module}`, { params });
    return response.data;
  },

  getById: async (clubId, id) => {
    const response = await api.get(`/pla_club_teams/${clubId}/{module}/${id}`);
    return response.data;
  },

  create: async (clubId, data) => {
    const response = await api.post(`/pla_club_teams/${clubId}/{module}`, data);
    return response.data;
  },

  update: async (clubId, id, data) => {
    const response = await api.put(`/pla_club_teams/${clubId}/{module}/${id}`, data);
    return response.data;
  },

  delete: async (clubId, id) => {
    const response = await api.delete(`/pla_club_teams/${clubId}/{module}/${id}`);
    return response.data;
  },
};

export default {module}Service;
```

#### Frontend Page

```jsx
// src/pages/dashboard/{Module}/{Module}Page.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useClub } from '@/hooks/useClub';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/datatable/DataTable';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import {module}Service from '@/services/{module}Service';
import {Module}FormDialog from './{Module}FormDialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function {Module}Page() {
  const { currentClub } = useClub();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['{module}', currentClub?.id],
    queryFn: () => {module}Service.getAll(currentClub.id),
    enabled: !!currentClub?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {module}Service.delete(currentClub.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries(['{module}']);
      toast.success('Eliminado exitosamente');
    },
  });

  if (isLoading) return <LoadingSpinner variant="centered" />;
  if (error) return <div>Error al cargar datos</div>;

  const columns = [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'description', header: 'Descripción' },
    { accessorKey: 'status', header: 'Estado' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{Module}</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Crear
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        onEdit={(item) => {
          setEditingItem(item);
          setDialogOpen(true);
        }}
        onDelete={(item) => deleteMutation.mutate(item.id)}
      />

      <{Module}FormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
      />
    </div>
  );
}
```

### 4. Checklist Post-Creación

```
Backend:
[ ] Migración creada y ejecutada
[ ] Modelo con ProtectedModel trait
[ ] Controller con HttpResponses trait
[ ] Service con transacciones
[ ] Policy registrada en AuthServiceProvider
[ ] Request con validaciones
[ ] Rutas agregadas a api.php
[ ] Permisos agregados al seeder

Frontend:
[ ] Página creada en pages/dashboard/
[ ] Service creado en services/
[ ] Ruta agregada a App.jsx con guard correcto
[ ] Formulario con react-hook-form + Zod

Tests:
[ ] Test de autorización en PHPUnit
[ ] Test E2E en Playwright (opcional)
```

### 5. Ejemplo de Uso

```
Usuario: "Crear módulo de uniformes"

Respuesta esperada:
1. Preguntar campos necesarios
2. Crear todos los archivos listados
3. Mostrar checklist de verificación
4. Indicar comandos para ejecutar migración
```

## Notas

- Siempre usar `ProtectedModel` trait para modelos con `club_id`
- Siempre usar `HttpResponses` trait en controllers
- Siempre usar transacciones en services
- Siempre registrar la Policy en `AuthServiceProvider`
- Usar el guard apropiado según los roles permitidos
