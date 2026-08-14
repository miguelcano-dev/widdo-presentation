# Frontend-Backend Sync Validator

## Descripcion
Detecta inconsistencias entre el codigo del frontend (React) y backend (Laravel): enums, constantes, validaciones, tipos de datos, y estructuras de respuesta.

## Cuando Usar
- Despues de cambios en modelos o APIs
- Cuando hay errores de "campo no encontrado"
- Al agregar nuevas features
- Code reviews de PRs grandes

---

## Areas de Sincronizacion

### 1. Enums y Constantes
### 2. Validaciones (Zod vs Form Request)
### 3. Estructura de Respuestas (API Resources)
### 4. Rutas y Endpoints
### 5. Tipos de Datos
### 6. Mensajes de Error

---

## Checklist de Validacion

### 1. Enums y Constantes

**Backend (PHP):**
```php
// app/Enums/PlayerStatus.php
enum PlayerStatus: string
{
    case ACTIVE = 'ACT';
    case INACTIVE = 'INA';
    case BLOCKED = 'BOR';
}

// app/Enums/EventType.php
enum EventType: string
{
    case TRAINING = 'training';
    case MATCH = 'match';
    case MEETING = 'meeting';
    case MEDICAL = 'medical';
}
```

**Frontend (JS):**
```javascript
// src/constants/enums.js
export const PLAYER_STATUS = {
  ACTIVE: 'ACT',
  INACTIVE: 'INA',
  BLOCKED: 'BOR',
};

export const EVENT_TYPE = {
  TRAINING: 'training',
  MATCH: 'match',
  MEETING: 'meeting',
  MEDICAL: 'medical',
};
```

**Verificar:**
```
[ ] Mismos valores en ambos lados
[ ] Misma cantidad de opciones
[ ] Nombres de keys consistentes
[ ] Actualizar ambos al agregar opcion
```

**Script de comparacion:**
```bash
# Extraer enums de backend
grep -rh "case.*=" app/Enums/ | sort

# Extraer constantes de frontend
grep -rh "export const" src/constants/ | sort
```

### 2. Validaciones

**Backend (Form Request):**
```php
// StorePlayerRequest.php
public function rules()
{
    return [
        'first_name' => 'required|string|min:2|max:100',
        'last_name' => 'required|string|min:2|max:100',
        'email' => 'required|email|unique:users,email',
        'birth_date' => 'required|date|before:today',
        'document_number' => 'required|string|min:5|max:20',
        'gender' => 'required|in:M,F,O',
        'phone' => 'nullable|string|max:20',
    ];
}
```

**Frontend (Zod):**
```javascript
// src/schemas/playerSchema.js
export const playerSchema = z.object({
  firstName: z.string()
    .min(2, 'Minimo 2 caracteres')
    .max(100, 'Maximo 100 caracteres'),
  lastName: z.string()
    .min(2, 'Minimo 2 caracteres')
    .max(100, 'Maximo 100 caracteres'),
  email: z.string()
    .email('Email invalido'),
  birthDate: z.date()
    .max(new Date(), 'Fecha no puede ser futura'),
  documentNumber: z.string()
    .min(5, 'Minimo 5 caracteres')
    .max(20, 'Maximo 20 caracteres'),
  gender: z.enum(['M', 'F', 'O'], {
    errorMap: () => ({ message: 'Seleccione genero' })
  }),
  phone: z.string().max(20).optional(),
});
```

**Tabla de comparacion:**

| Campo | Backend | Frontend | Match |
|-------|---------|----------|-------|
| first_name | required, min:2, max:100 | required, min:2, max:100 | OK |
| email | required, email, unique | required, email | WARN: falta unique |
| birth_date | required, date, before:today | required, max:today | OK |
| gender | required, in:M,F,O | required, enum:M,F,O | OK |
| phone | nullable, max:20 | optional, max:20 | OK |

**Verificar:**
```
[ ] Campos requeridos coinciden
[ ] Min/max lengths coinciden
[ ] Formatos (email, date) coinciden
[ ] Enums/opciones coinciden
[ ] Campos opcionales marcados igual
```

### 3. Estructura de Respuestas

**Backend (API Resource):**
```php
// PlayerResource.php
public function toArray($request)
{
    return [
        'id' => $this->id,
        'first_name' => $this->first_name,
        'last_name' => $this->last_name,
        'full_name' => $this->full_name,  // Accessor
        'email' => $this->email,
        'birth_date' => $this->birth_date?->format('Y-m-d'),
        'age' => $this->age,  // Accessor
        'category' => new CategoryResource($this->whenLoaded('category')),
        'created_at' => $this->created_at->toISOString(),
    ];
}
```

**Frontend (uso):**
```javascript
// PlayersPage.jsx
const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'first_name', header: 'Nombre' },
  { accessorKey: 'last_name', header: 'Apellido' },
  { accessorKey: 'full_name', header: 'Nombre Completo' },  // OK
  { accessorKey: 'fullName', header: 'Nombre' },  // ERROR: deberia ser full_name
  { accessorKey: 'category.name', header: 'Categoria' },
  { accessorKey: 'createdAt', header: 'Creado' },  // ERROR: deberia ser created_at
];
```

**Verificar:**
```
[ ] Nombres de campos coinciden (snake_case vs camelCase)
[ ] Relaciones anidadas tienen estructura correcta
[ ] Campos computados (accessors) estan disponibles
[ ] Fechas tienen formato esperado
```

### 4. Transformacion de Datos

Si hay transformacion automatica:

**Axios interceptor:**
```javascript
// api.js
import { camelizeKeys, decamelizeKeys } from 'humps';

api.interceptors.response.use((response) => {
  response.data = camelizeKeys(response.data);
  return response;
});

api.interceptors.request.use((config) => {
  config.data = decamelizeKeys(config.data);
  return config;
});
```

**Verificar:**
```
[ ] Si hay transformacion, aplicar consistentemente
[ ] Verificar que nested objects se transforman
[ ] Verificar arrays de objetos
```

### 5. Tipos de Datos

| Campo | Backend (PHP) | Frontend (JS) | Transformacion |
|-------|---------------|---------------|----------------|
| id | int | number | Ninguna |
| amount | decimal(10,2) | number | Ninguna |
| birth_date | Carbon | Date o string | parse con dayjs |
| is_active | boolean | boolean | Ninguna |
| metadata | json | object | JSON.parse si es string |
| status | enum | string | Ninguna |

**Errores comunes:**
```javascript
// Backend envia: "2024-01-15"
// Frontend espera: Date object

// Solucion
const birthDate = data.birth_date ? new Date(data.birth_date) : null;

// O con dayjs
const birthDate = data.birth_date ? dayjs(data.birth_date) : null;
```

### 6. Mensajes de Error

**Backend:**
```php
// messages en Form Request
public function messages()
{
    return [
        'email.required' => 'El email es obligatorio',
        'email.email' => 'El email no es valido',
        'email.unique' => 'Este email ya esta registrado',
    ];
}
```

**Frontend:**
```javascript
// Zod messages
const schema = z.object({
  email: z.string()
    .min(1, 'El email es obligatorio')  // Match con backend
    .email('El email no es valido'),    // Match con backend
});

// Mostrar errores del servidor
if (error.response?.status === 422) {
  const serverErrors = error.response.data.errors;
  Object.entries(serverErrors).forEach(([field, messages]) => {
    form.setError(field, { message: messages[0] });
  });
}
```

**Verificar:**
```
[ ] Mensajes en mismo idioma (espanol)
[ ] Mismos mensajes para mismas validaciones
[ ] Frontend muestra errores del servidor
```

---

## Script de Validacion

```bash
#!/bin/bash
# sync-validator.sh

echo "=== Validando sincronizacion Frontend-Backend ==="

# 1. Comparar enums
echo "\n--- Enums ---"
echo "Backend:"
grep -rh "case.*=" saas_sport/app/Enums/ 2>/dev/null | sort
echo "\nFrontend:"
grep -rh "export const.*{" frontend/src/constants/ 2>/dev/null | head -20

# 2. Comparar campos de modelos vs schemas
echo "\n--- Player fields ---"
echo "Backend (fillable):"
grep -A20 "fillable" saas_sport/app/Models/PlaClubTeamPlayer.php | grep "'"
echo "\nFrontend (schema):"
grep -A20 "playerSchema" frontend/src/schemas/ 2>/dev/null | grep ":"

# 3. Buscar posibles inconsistencias de naming
echo "\n--- Posibles inconsistencias camelCase/snake_case ---"
grep -rn "accessorKey:" frontend/src/ | grep -v "snake_case_field"
```

---

## Patrones de Sincronizacion

### Opcion 1: Transformacion automatica
```javascript
// Usar humps para transformar automaticamente
import { camelizeKeys, decamelizeKeys } from 'humps';
```

### Opcion 2: Mantener snake_case en frontend
```javascript
// Usar snake_case en todo el frontend
const player = {
  first_name: 'Juan',
  last_name: 'Perez',
};
```

### Opcion 3: Mapeo explicito
```javascript
// Mapear campos al recibir/enviar
const toBackend = (data) => ({
  first_name: data.firstName,
  last_name: data.lastName,
});

const fromBackend = (data) => ({
  firstName: data.first_name,
  lastName: data.last_name,
});
```

---

## Reporte de Inconsistencias

| Area | Backend | Frontend | Tipo | Severidad |
|------|---------|----------|------|-----------|
| Player.status | enum ACT/INA/BOR | ACTIVE/INACTIVE/BLOCKED | Valor diferente | Alta |
| birth_date | Y-m-d string | Date object | Tipo diferente | Media |
| full_name | snake_case | fullName camelCase | Naming | Media |
| email unique | Validado | No validado | Validacion faltante | Baja |

### Acciones Requeridas
1. Unificar valores de enum de status
2. Agregar transformacion de fechas
3. Definir convencion de naming (snake o camel)
4. Agregar validacion de unique en frontend (warning)
