# 📞 Sistema de Validación de Teléfono por País

## Resumen de Implementación

Se ha implementado un sistema de validación telefónica dinámico que **almacena las reglas en la base de datos** en lugar de usar constantes hardcodeadas.

---

## 🗄️ Cambios en Base de Datos

### Nueva Migración
**Archivo:** `database/migrations/2026_01_23_000000_add_phone_validation_to_bas_countries_table.php`

**Campos agregados a `bas_countries`:**
- `phone_code` (string): Código de país (ej: +57, +1, +52)
- `phone_min_length` (int): Longitud mínima del número local
- `phone_max_length` (int): Longitud máxima del número local
- `phone_format_example` (string): Ejemplo de formato (ej: 300 123 4567)

---

## 📦 Modelo Actualizado

**Archivo:** `app/Models/BasCountry.php`

Se agregaron los nuevos campos al array `$fillable`:
- `phone_code`
- `phone_min_length`
- `phone_max_length`
- `phone_format_example`

---

## 🌱 Seeder de Datos

**Archivo:** `database/seeders/PhoneValidationSeeder.php`

Actualiza automáticamente las reglas de validación para **60+ países**, incluyendo:

### América Latina (20 países):
- 🇨🇴 Colombia: +57 (10 dígitos)
- 🇲🇽 México: +52 (10 dígitos)
- 🇦🇷 Argentina: +54 (10-11 dígitos)
- 🇧🇷 Brasil: +55 (10-11 dígitos)
- 🇨🇱 Chile: +56 (9 dígitos)
- 🇵🇪 Perú: +51 (9 dígitos)
- Y más...

### América del Norte (2 países):
- 🇺🇸 USA: +1 (10 dígitos)
- 🇨🇦 Canadá: +1 (10 dígitos)

### Europa (12 países):
- 🇪🇸 España: +34 (9 dígitos)
- 🇫🇷 Francia: +33 (9 dígitos)
- 🇮🇹 Italia: +39 (9-10 dígitos)
- 🇩🇪 Alemania: +49 (10-11 dígitos)
- Y más...

### Otros (6 países):
- 🇨🇳 China, 🇯🇵 Japón, 🇮🇳 India, 🇦🇺 Australia, 🇿🇦 Sudáfrica

---

## 🚀 Comandos para Ejecutar

### Desarrollo Local (Docker)

```bash
# 1. Ejecutar la migración
docker compose exec saas_sport_app php artisan migrate

# 2. Poblar los datos de validación telefónica
docker compose exec saas_sport_app php artisan db:seed --class=Database\\Seeders\\PhoneValidationSeeder
```

### Desarrollo Sin Docker

```bash
# 1. Ejecutar la migración
php artisan migrate

# 2. Poblar los datos
php artisan db:seed --class=Database\\Seeders\\PhoneValidationSeeder
```

### Producción

```bash
# Conectar al servidor
ssh root@167.71.88.31

# Navegar al directorio
cd /var/www/widdo

# Ejecutar migración
php artisan migrate --force

# Ejecutar seeder
php artisan db:seed --class=Database\\Seeders\\PhoneValidationSeeder --force
```

---

## 📡 Respuesta de la API

El endpoint `/api/location/countries` ahora retornará:

```json
[
  {
    "id": 48,
    "name": "Colombia",
    "currency": "COP",
    "simbol_currency": "$",
    "country_phone_code": "+57",
    "phone_code": "+57",
    "phone_min_length": 10,
    "phone_max_length": 10,
    "phone_format_example": "300 123 4567",
    "flag": "🇨🇴",
    "status": "ACT"
  },
  {
    "id": 143,
    "name": "Mexico",
    "currency": "MXN",
    "simbol_currency": "$",
    "country_phone_code": "+52",
    "phone_code": "+52",
    "phone_min_length": 10,
    "phone_max_length": 10,
    "phone_format_example": "55 1234 5678",
    "flag": "🇲🇽",
    "status": "ACT"
  }
]
```

---

## 🎨 Uso en Frontend

### Hook de Datos Geográficos (ya existe)

```javascript
// useGeographicData.js
const [countriesList, setCountriesList] = useState([]);
const [phoneRules, setPhoneRules] = useState({}); // NUEVO

useEffect(() => {
  const fetchCountries = async () => {
    const response = await api.get('/location/countries');
    const countries = response.data;

    setCountriesList(countries);

    // Crear mapa de reglas de teléfono
    const rules = {};
    countries.forEach(country => {
      if (country.phone_code) {
        rules[country.phone_code] = {
          min: country.phone_min_length,
          max: country.phone_max_length,
          name: country.name,
          example: country.phone_format_example
        };
      }
    });
    setPhoneRules(rules);
  };

  fetchCountries();
}, []);
```

### Validación Dinámica

```javascript
// phoneValidation.js
const validatePhoneLength = (countryCode, localNumber, phoneRules) => {
  const rules = phoneRules[countryCode];

  if (!rules) {
    return true; // Permitir si no hay regla
  }

  const length = localNumber.replace(/\D/g, '').length;

  if (length < rules.min) {
    return `El número debe tener al menos ${rules.min} dígitos para ${rules.name}`;
  }

  if (length > rules.max) {
    return `El número no puede exceder ${rules.max} dígitos para ${rules.name}`;
  }

  return true;
};
```

### FormPhoneInput Mejorado

```jsx
// FormPhoneInput.jsx
const [countryCode, setCountryCode] = useState('+57');
const [localNumber, setLocalNumber] = useState('');
const [error, setError] = useState('');

const handleChange = (value) => {
  setLocalNumber(value);

  // Validar longitud dinámicamente
  const validationResult = validatePhoneLength(
    countryCode,
    value,
    phoneRules
  );

  if (validationResult !== true) {
    setError(validationResult);
  } else {
    setError('');
  }
};

// Feedback en tiempo real
{error && (
  <p className="text-sm text-red-500 mt-1">
    {error}
  </p>
)}

{!error && phoneRules[countryCode] && (
  <p className="text-xs text-gray-500 mt-1">
    Ejemplo: {phoneRules[countryCode].example}
  </p>
)}
```

---

## 🧪 Verificación

### Ver países con validación configurada

```bash
docker compose exec saas_sport_app php artisan tinker --execute="
\App\Models\BasCountry::whereNotNull('phone_code')
  ->select('name', 'phone_code', 'phone_min_length', 'phone_max_length', 'phone_format_example')
  ->orderBy('name')
  ->get()
  ->each(fn(\$c) => echo sprintf('%s: %s (%d-%d dígitos) Ej: %s',
    \$c->name,
    \$c->phone_code,
    \$c->phone_min_length,
    \$c->phone_max_length,
    \$c->phone_format_example
  ) . PHP_EOL);
"
```

### Agregar más países manualmente

```bash
docker compose exec saas_sport_app php artisan tinker --execute="
\$country = \App\Models\BasCountry::where('name', 'Rusia')->first();
if (\$country) {
  \$country->update([
    'phone_code' => '+7',
    'phone_min_length' => 10,
    'phone_max_length' => 10,
    'phone_format_example' => '900 123 45 67'
  ]);
  echo 'Rusia actualizado correctamente';
}
"
```

---

## ✅ Ventajas de esta Implementación

1. **Sin código hardcodeado**: No hay constantes PHP/JS que mantener
2. **Escalable**: Agregar nuevos países desde SQL o Admin Panel
3. **Un solo endpoint**: Frontend obtiene todo con una llamada
4. **Consistencia**: Backend y frontend usan la misma fuente de verdad
5. **Fácil mantenimiento**: Actualizar reglas desde base de datos
6. **Flexible**: Cada país puede tener sus propias reglas únicas

---

## 🔧 Troubleshooting

### País no tiene reglas de validación
```bash
# Agregar manualmente
docker compose exec saas_sport_app php artisan tinker --execute="
\App\Models\BasCountry::where('name', 'NombrePaís')->update([
  'phone_code' => '+XX',
  'phone_min_length' => 9,
  'phone_max_length' => 10,
  'phone_format_example' => '123 456 789'
]);
"
```

### Re-ejecutar seeder
```bash
# Si se agregaron nuevos países o se corrigieron reglas
docker compose exec saas_sport_app php artisan db:seed --class=Database\\Seeders\\PhoneValidationSeeder
```

---

## 📝 Próximos Pasos

1. ✅ **Actualizar FormPhoneInput** para usar reglas dinámicas
2. ✅ **Auto-completar datos del menor** desde acudiente
3. ✅ **Restricción de tab Deportivo** solo para Owner/Admin
4. ⬜ **Panel de Admin** para gestionar reglas por país
5. ⬜ **Tests unitarios** para validación telefónica

---

**Creado:** 23 de Enero de 2026
**Mantenedor:** Sistema Widdo Backend
