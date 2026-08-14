# Sanctum Auth Flow Auditor

## Descripcion
Audita el flujo completo de autenticacion con Laravel Sanctum: generacion de tokens, refresh, logout, proteccion de rutas, y seguridad de sesiones.

## Cuando Usar
- Despues de cambios en autenticacion
- Cuando hay problemas de sesion expirada
- Auditorias de seguridad
- Debugging de errores 401

---

## Arquitectura de Auth en Widdo

### Stack
```
Frontend: AuthContext + Axios Interceptors
Backend: Laravel Sanctum (tokens de API)
Storage: localStorage (token)
```

### Flujo de Login
```
1. Usuario envia email/password
2. Backend valida credenciales
3. Backend genera token Sanctum (60 min)
4. Frontend guarda token en localStorage
5. Axios interceptor agrega token a headers
6. Requests autenticados usan Bearer token
```

### Flujo de Refresh
```
1. Token cerca de expirar (< 5 min)
2. Frontend detecta en interceptor
3. Llama endpoint /api/refresh-token
4. Backend genera nuevo token
5. Frontend actualiza localStorage
```

### Flujo de Logout
```
1. Usuario hace logout
2. Frontend llama /api/logout
3. Backend revoca token actual
4. Frontend limpia localStorage
5. Redirige a login
```

---

## Checklist de Auditoria

### 1. Configuracion de Sanctum

**Archivo:** `config/sanctum.php`

```php
return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost')),

    'guard' => ['web'],

    'expiration' => 60,  // minutos

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => AuthenticateSession::class,
        'encrypt_cookies' => EncryptCookies::class,
        'validate_csrf_token' => ValidateCsrfToken::class,
    ],
];
```

**Verificar:**
```
[ ] expiration configurado (60 min recomendado)
[ ] SANCTUM_STATEFUL_DOMAINS incluye dominios de frontend
[ ] Middleware apropiado para SPA
```

### 2. Generacion de Token

**Archivo:** `AuthController.php`

```php
public function login(LoginRequest $request)
{
    $credentials = $request->validated();

    if (!Auth::attempt($credentials)) {
        return response()->json([
            'message' => 'Credenciales invalidas'
        ], 401);
    }

    $user = Auth::user();

    // Revocar tokens anteriores (opcional pero recomendado)
    $user->tokens()->delete();

    // Crear nuevo token
    $token = $user->createToken(
        'auth-token',
        ['*'],  // abilities
        now()->addMinutes(60)  // expiracion
    );

    return response()->json([
        'token' => $token->plainTextToken,
        'user' => new UserResource($user),
        'expires_at' => $token->accessToken->expires_at,
    ]);
}
```

**Verificar:**
```
[ ] Credenciales se validan antes de crear token
[ ] Tokens anteriores se revocan (evita tokens huerfanos)
[ ] Token tiene expiracion explicita
[ ] Response incluye expires_at para frontend
[ ] No se expone informacion sensible en errores
```

### 3. Refresh Token

```php
public function refresh(Request $request)
{
    $user = $request->user();

    // Verificar que el token actual es valido
    $currentToken = $user->currentAccessToken();

    // Revocar token actual
    $currentToken->delete();

    // Crear nuevo token
    $newToken = $user->createToken(
        'auth-token',
        ['*'],
        now()->addMinutes(60)
    );

    return response()->json([
        'token' => $newToken->plainTextToken,
        'expires_at' => $newToken->accessToken->expires_at,
    ]);
}
```

**Verificar:**
```
[ ] Solo usuarios autenticados pueden refresh
[ ] Token anterior se revoca al refresh
[ ] Nuevo token tiene nueva expiracion
[ ] Endpoint esta protegido con auth:sanctum
```

### 4. Logout

```php
public function logout(Request $request)
{
    // Revocar token actual
    $request->user()->currentAccessToken()->delete();

    // Opcional: revocar todos los tokens
    // $request->user()->tokens()->delete();

    return response()->json([
        'message' => 'Logged out successfully'
    ]);
}
```

**Verificar:**
```
[ ] Token se revoca en backend
[ ] Response confirma logout exitoso
[ ] Frontend limpia localStorage
[ ] Usuario no puede usar token revocado
```

### 5. Frontend - AuthContext

**Archivo:** `src/contexts/AuthContext.jsx`

```jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar token al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    localStorage.setItem('token', response.token);
    localStorage.setItem('tokenExpires', response.expires_at);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpires');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Verificar:**
```
[ ] Token se guarda en localStorage
[ ] expires_at se guarda para refresh proactivo
[ ] logout limpia localStorage incluso si API falla
[ ] loading state evita flash de contenido
```

### 6. Axios Interceptors

**Archivo:** `src/services/api.js`

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor - agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expirado - intentar refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await authService.refresh();
        localStorage.setItem('token', response.token);
        originalRequest.headers.Authorization = `Bearer ${response.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh fallo - logout
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

**Verificar:**
```
[ ] Token se agrega a todas las requests
[ ] 401 triggers refresh automatico
[ ] Refresh fallido redirige a login
[ ] _retry evita loops infinitos
[ ] Errores se propagan correctamente
```

### 7. Proteccion de Rutas Backend

```php
// routes/api.php

// Rutas publicas
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh-token', [AuthController::class, 'refresh']);

    // Resto de rutas protegidas
    Route::apiResource('players', PlayerController::class);
    // ...
});
```

**Verificar:**
```
[ ] Solo login/register/forgot son publicas
[ ] Todas las demas rutas tienen auth:sanctum
[ ] Webhooks tienen su propia autenticacion (firma)
```

### 8. Frontend Route Guards

**Archivo:** `src/components/guards/PrivateRoute.jsx`

```jsx
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
```

**Verificar:**
```
[ ] Loading evita redirect prematuro
[ ] Guarda location para redirect post-login
[ ] Rutas sensibles usan PrivateRoute
```

---

## Pruebas de Seguridad

### Test 1: Token Invalido
```bash
curl -H "Authorization: Bearer invalid_token" \
     GET /api/user
# Esperado: 401 Unauthorized
```

### Test 2: Token Expirado
```bash
# Esperar a que token expire
curl -H "Authorization: Bearer expired_token" \
     GET /api/user
# Esperado: 401 Unauthorized
```

### Test 3: Token Revocado
```bash
# Hacer logout
curl -H "Authorization: Bearer valid_token" \
     POST /api/logout

# Intentar usar mismo token
curl -H "Authorization: Bearer valid_token" \
     GET /api/user
# Esperado: 401 Unauthorized
```

### Test 4: Sin Token
```bash
curl GET /api/user
# Esperado: 401 Unauthorized
```

### Test 5: CSRF (si aplica)
```bash
# Verificar que SPA requests no necesitan CSRF
# pero web routes si lo requieren
```

---

## Comandos de Debug

```bash
# Ver tokens de un usuario
php artisan tinker
>>> User::find(1)->tokens

# Limpiar tokens expirados
php artisan sanctum:prune-expired

# Ver configuracion de Sanctum
php artisan config:show sanctum
```

---

## Errores Comunes

### 1. Token no se envia
```javascript
// Verificar que api.js tiene interceptor
// Verificar que token esta en localStorage
console.log(localStorage.getItem('token'));
```

### 2. CORS bloquea requests
```php
// config/cors.php
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
'supports_credentials' => true,
```

### 3. Token expira muy rapido
```php
// config/sanctum.php
'expiration' => 60,  // aumentar si es necesario
```

### 4. Refresh loop infinito
```javascript
// Verificar _retry flag en interceptor
if (!originalRequest._retry) {
  originalRequest._retry = true;
  // ...
}
```

---

## Reporte de Auditoria

### CRITICO
- Rutas sensibles sin auth:sanctum
- Token no se revoca en logout
- Credenciales en localStorage (deben ser solo token)

### ALTO
- No hay refresh token implementado
- Expiracion muy larga (> 24h)
- Tokens anteriores no se revocan en login

### MEDIO
- No hay rate limiting en login
- Errores exponen informacion de usuario
- Loading state faltante en AuthContext

### BAJO
- expires_at no se usa para refresh proactivo
- Logs no registran logouts
