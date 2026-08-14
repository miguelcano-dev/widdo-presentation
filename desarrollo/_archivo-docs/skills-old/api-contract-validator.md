# API Contract Validator

## Descripcion
Valida la consistencia entre los servicios del frontend y los controllers/routes del backend. Detecta endpoints huerfanos, payloads inconsistentes, y campos faltantes.

## Cuando Usar
- Despues de agregar nuevos endpoints
- Cuando hay errores de "campo no encontrado"
- Al refactorizar APIs
- Antes de releases

---

## Estructura de APIs en Widdo

### Frontend Services
**Ubicacion**: `frontend/src/services/`
```
api.js              # Configuracion Axios base
authService.js      # Login, registro, logout
clubService.js      # CRUD clubes
playerService.js    # CRUD jugadores
eventService.js     # CRUD eventos
paymentService.js   # Pagos y cobros
...
```

### Backend Routes
**Ubicacion**: `saas_sport/routes/api.php`

### Backend Controllers
**Ubicacion**: `saas_sport/app/Http/Controllers/Api/`

### Form Requests (Validaciones)
**Ubicacion**: `saas_sport/app/Http/Requests/`

### API Resources (Transformers)
**Ubicacion**: `saas_sport/app/Http/Resources/`

---

## Checklist de Validacion

### 1. Rutas Existentes

Comparar rutas definidas vs usadas:

```bash
# Backend - listar todas las rutas
cd saas_sport && php artisan route:list --json > routes.json

# Frontend - buscar llamadas a API
grep -rn "axios\.\(get\|post\|put\|patch\|delete\)" frontend/src/services/
```

**Verificar:**
```
[ ] Cada llamada del frontend tiene ruta en backend
[ ] No hay rutas backend sin uso en frontend
[ ] Metodos HTTP coinciden (GET, POST, PUT, DELETE)
[ ] Parametros de URL coinciden (:id, :clubId, etc)
```

### 2. Payloads de Request

Comparar campos enviados vs esperados:

**Frontend (ejemplo):**
```javascript
// playerService.js
export const createPlayer = (data) => {
  return api.post('/players', {
    first_name: data.firstName,
    last_name: data.lastName,
    birth_date: data.birthDate,
    document_number: data.documentNumber,
    // ...
  });
};
```

**Backend (Form Request):**
```php
// StorePlayerRequest.php
public function rules()
{
    return [
        'first_name' => 'required|string|max:100',
        'last_name' => 'required|string|max:100',
        'birth_date' => 'required|date',
        'document_number' => 'required|string',
        // ...
    ];
}
```

**Verificar:**
```
[ ] Nombres de campos coinciden (camelCase vs snake_case)
[ ] Campos requeridos son los mismos
[ ] Tipos de datos coinciden
[ ] Validaciones de formato coinciden
```

### 3. Responses de API

Comparar campos que backend envia vs frontend espera:

**Backend (Resource):**
```php
// PlayerResource.php
public function toArray($request)
{
    return [
        'id' => $this->id,
        'first_name' => $this->first_name,
        'full_name' => $this->full_name,
        'age' => $this->age,
        // ...
    ];
}
```

**Frontend (uso):**
```javascript
// PlayersPage.jsx
const columns = [
  { accessorKey: 'id' },
  { accessorKey: 'first_name' },
  { accessorKey: 'fullName' },  // ERROR: deberia ser full_name
  { accessorKey: 'age' },
];
```

### 4. Codigos de Estado HTTP

```
Backend retorna:    Frontend espera:
[ ] 200 OK          [ ] Procesa respuesta exitosa
[ ] 201 Created     [ ] Maneja creacion exitosa
[ ] 204 No Content  [ ] Maneja delete sin body
[ ] 400 Bad Request [ ] Muestra error generico
[ ] 401 Unauthorized[ ] Redirige a login
[ ] 403 Forbidden   [ ] Muestra "Sin permisos"
[ ] 404 Not Found   [ ] Muestra "No encontrado"
[ ] 422 Validation  [ ] Muestra errores por campo
[ ] 500 Server Error[ ] Muestra error generico
```

### 5. Paginacion

Si el endpoint es paginado:

**Backend:**
```php
return PlayerResource::collection(
    Player::paginate(15)
);
// Retorna: data, links, meta (current_page, last_page, total)
```

**Frontend:**
```javascript
const { data, meta } = response;
// Verificar que use meta.current_page, meta.last_page, etc
```

---

## Endpoints Criticos a Validar

### Autenticacion
```
POST /api/register
POST /api/login
POST /api/logout
POST /api/forgot-password
POST /api/reset-password
GET  /api/user
```

### Clubes
```
GET    /api/clubs
POST   /api/clubs
GET    /api/clubs/{id}
PUT    /api/clubs/{id}
DELETE /api/clubs/{id}
```

### Jugadores
```
GET    /api/clubs/{clubId}/players
POST   /api/clubs/{clubId}/players
GET    /api/players/{id}
PUT    /api/players/{id}
DELETE /api/players/{id}
POST   /api/players/{id}/documents
```

### Eventos
```
GET    /api/clubs/{clubId}/events
POST   /api/clubs/{clubId}/events
GET    /api/events/{id}
PUT    /api/events/{id}
DELETE /api/events/{id}
POST   /api/events/{id}/attendance
```

### Pagos
```
GET    /api/clubs/{clubId}/payments
POST   /api/clubs/{clubId}/charges
GET    /api/payments/{id}
POST   /api/payments/{id}/pay
POST   /api/webhooks/wompi/{country}
```

---

## Script de Validacion

```bash
#!/bin/bash
# validate-api-contracts.sh

echo "=== Validando contratos API ==="

# 1. Obtener rutas del backend
cd saas_sport
php artisan route:list --columns=method,uri,name --json > /tmp/backend-routes.json

# 2. Extraer llamadas del frontend
cd ../frontend
grep -rho "api\.\(get\|post\|put\|patch\|delete\)(['\"][^'\"]*" src/services/ | \
  sed "s/api\.\(get\|post\|put\|patch\|delete\)(['\"/\U\1 /" | \
  sort -u > /tmp/frontend-calls.txt

# 3. Comparar (manual review)
echo "Backend routes:"
cat /tmp/backend-routes.json | jq -r '.[] | "\(.method) \(.uri)"'

echo ""
echo "Frontend calls:"
cat /tmp/frontend-calls.txt

echo ""
echo "Review manually for mismatches"
```

---

## Errores Comunes

### 1. Nombres de campos inconsistentes
```
Frontend: firstName, lastName (camelCase)
Backend: first_name, last_name (snake_case)
Solucion: Transformar en api.js o usar Resources
```

### 2. Campos faltantes en Response
```
Frontend espera: player.category.name
Backend envia: player (sin eager load de category)
Solucion: Agregar with('category') en controller
```

### 3. Validaciones diferentes
```
Frontend: email opcional
Backend: email requerido
Solucion: Sincronizar Zod schema con Form Request
```

### 4. Paginacion ignorada
```
Backend: Retorna paginado con meta
Frontend: Espera array simple
Solucion: Usar response.data en lugar de response
```

---

## Reporte

Generar tabla de inconsistencias:

| Endpoint | Problema | Frontend | Backend | Severidad |
|----------|----------|----------|---------|-----------|
| POST /players | Campo faltante | sends `birthDate` | expects `birth_date` | Alta |
| GET /events | Sin paginacion | expects array | returns paginated | Media |
