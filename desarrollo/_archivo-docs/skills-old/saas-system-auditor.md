# SaaS System Auditor - Skill Experto General

## Descripcion
Agente experto en sistemas SaaS que realiza auditorias completas del sistema Widdo. Valida flujos de negocio, detecta bugs, inconsistencias entre frontend y backend, problemas de seguridad, y errores en logica de negocio.

## Cuando Usar
- Antes de releases importantes
- Despues de implementar features nuevas
- Para detectar bugs y regresiones
- Auditorias periodicas del sistema
- Cuando hay comportamientos inesperados

---

## Arquitectura del Sistema

### Frontend (React + Vite)
- **Ubicacion**: `/frontend/src/`
- **Componentes**: `/frontend/src/components/` (216 componentes)
- **Servicios API**: `/frontend/src/services/`
- **Contextos**: `/frontend/src/contexts/` (AuthContext, ClubContext, LoadingContext)
- **Paginas**: `/frontend/src/pages/`
- **Rutas**: `/frontend/src/App.jsx`

### Backend (Laravel 12)
- **Ubicacion**: `/saas_sport/`
- **Controllers**: `/saas_sport/app/Http/Controllers/`
- **Models**: `/saas_sport/app/Models/` (100 modelos)
- **Services**: `/saas_sport/app/Services/` (28 servicios)
- **Routes**: `/saas_sport/routes/api.php`
- **Policies**: `/saas_sport/app/Policies/`
- **Form Requests**: `/saas_sport/app/Http/Requests/`

---

## Checklist de Auditoria Completa

### 1. FLUJOS CRITICOS DE NEGOCIO

#### 1.1 Registro y Onboarding
```
Verificar:
[ ] Registro de usuario nuevo funciona
[ ] Verificacion de email se envia
[ ] Creacion de club (onboarding multi-step)
[ ] Asignacion automatica de rol OWNER
[ ] Redireccion correcta post-onboarding
[ ] Manejo de errores en cada paso
```

**Archivos clave:**
- Frontend: `src/pages/auth/Register.jsx`, `src/components/onboarding/`
- Backend: `AuthController.php`, `PlaClubTeamController@store`

#### 1.2 Autenticacion
```
Verificar:
[ ] Login con email/password
[ ] Login con documento (si aplica por pais)
[ ] Token Sanctum se genera correctamente (60 min)
[ ] Refresh token funciona antes de expiracion
[ ] Logout revoca tokens
[ ] Rutas protegidas redirigen a login
[ ] Remember me funciona
[ ] Reset password flow completo
```

**Archivos clave:**
- Frontend: `src/services/authService.js`, `src/contexts/AuthContext.jsx`
- Backend: `AuthController.php`, `config/sanctum.php`

#### 1.3 Gestion de Jugadores (CRUD completo)
```
Verificar:
[ ] Listar jugadores filtra por club actual
[ ] Crear jugador con todos los campos requeridos
[ ] Editar jugador preserva datos existentes
[ ] Eliminar jugador (soft delete)
[ ] Subir foto de jugador
[ ] Asignar a categoria/equipo
[ ] Invitacion a jugador genera codigo correcto
[ ] Jugador puede aceptar invitacion
```

**Archivos clave:**
- Frontend: `src/pages/dashboard/PlayersPage.jsx`, `src/services/playerService.js`
- Backend: `PlaClubTeamPlayerController.php`, `PlayerService.php`

#### 1.4 Sistema de Pagos
```
Verificar:
[ ] Crear cargo/cuota a jugador
[ ] Calcular descuentos correctamente
[ ] Generar cuotas (installments) si aplica
[ ] Iniciar pago con Wompi
[ ] Webhook recibe notificacion de Wompi
[ ] Estado de pago se actualiza correctamente
[ ] Recibos/comprobantes se generan
[ ] Late fees se aplican en fecha correcta
[ ] Reporte de pagos pendientes es correcto
```

**Archivos clave:**
- Frontend: `src/components/payments/`, `src/services/paymentService.js`
- Backend: `PaymentService.php`, `WompiWebhookController.php`

#### 1.5 Calendario y Eventos
```
Verificar:
[ ] Crear evento con fecha/hora correcta
[ ] Timezone se maneja correctamente
[ ] Participantes se asignan por rol/categoria
[ ] Notificaciones de evento se envian
[ ] Evento recurrente se crea correctamente
[ ] Asistencia se puede registrar
[ ] Eventos pasados no se pueden modificar (o si?)
```

**Archivos clave:**
- Frontend: `src/components/calendar/`, `src/services/eventService.js`
- Backend: `EventService.php`, `PlaEventController.php`

#### 1.6 Control de Asistencia
```
Verificar:
[ ] Crear sesion de entrenamiento
[ ] Listar jugadores de la categoria
[ ] Marcar presente/ausente/justificado
[ ] Guardar asistencia persiste correctamente
[ ] Reporte de asistencia por jugador
[ ] Reporte de asistencia por sesion
```

**Archivos clave:**
- Frontend: `src/components/attendance/`
- Backend: `AttendanceService.php`, `SessionAttendanceService.php`

---

### 2. AISLAMIENTO MULTI-TENANT

```
Verificar que NUNCA se pueda acceder a datos de otro club:
[ ] Todos los modelos Pla* tienen ClubScope aplicado
[ ] Queries manuales filtran por club_id
[ ] APIs validan que el recurso pertenece al club del usuario
[ ] No hay endpoints que expongan IDs de otros clubs
[ ] Busquedas no muestran resultados de otros clubs
[ ] Reportes solo incluyen datos del club actual
```

**Pruebas de penetracion:**
```bash
# Intentar acceder a jugador de otro club
GET /api/players/{id_de_otro_club}
# Debe retornar 403 Forbidden

# Intentar modificar recurso de otro club
PUT /api/players/{id_de_otro_club}
# Debe retornar 403 Forbidden
```

**Archivos clave:**
- Backend: `app/Scopes/ClubScope.php`, todas las Policies

---

### 3. ROLES Y PERMISOS (RBAC)

```
Verificar por cada rol:

OWNER (Propietario):
[ ] Acceso total a configuracion del club
[ ] Puede crear/editar/eliminar entrenadores
[ ] Puede ver reportes financieros
[ ] Puede cambiar plan de suscripcion

TRAINER (Entrenador):
[ ] Solo ve jugadores de sus categorias asignadas
[ ] Puede registrar asistencia
[ ] NO puede ver informacion financiera
[ ] NO puede eliminar jugadores

PLAYER (Jugador):
[ ] Solo ve sus propios datos
[ ] Puede ver calendario de eventos
[ ] NO puede ver datos de otros jugadores
[ ] NO puede modificar nada

PARENT (Padre):
[ ] Ve datos de sus hijos
[ ] Puede pagar cuotas
[ ] NO ve datos de otros jugadores

ACCOUNTANT (Contador):
[ ] Ve reportes financieros
[ ] NO puede modificar jugadores
[ ] Puede registrar pagos manuales
```

**Archivos clave:**
- Frontend: `src/components/guards/`, `PermissionGuard.jsx`
- Backend: `app/Policies/`, middleware `role`, `permission`

---

### 4. VALIDACIONES FRONTEND vs BACKEND

```
Verificar que las validaciones coincidan:
[ ] Campos requeridos son los mismos
[ ] Formatos (email, telefono, documento) coinciden
[ ] Longitudes maximas/minimas coinciden
[ ] Tipos de datos coinciden
[ ] Mensajes de error son consistentes
```

**Comparar:**
- Frontend: Schemas Zod en `src/components/form/`
- Backend: Form Requests en `app/Http/Requests/`

---

### 5. MANEJO DE ERRORES

```
Frontend:
[ ] Todos los llamados API tienen try/catch
[ ] Errores de red muestran mensaje amigable
[ ] Errores 401 redirigen a login
[ ] Errores 403 muestran "Sin permisos"
[ ] Errores 404 muestran "No encontrado"
[ ] Errores 422 muestran errores de validacion
[ ] Errores 500 muestran "Error del servidor"

Backend:
[ ] Excepciones no exponen stack traces en produccion
[ ] Errores se loguean correctamente
[ ] Respuestas de error tienen formato consistente
```

---

### 6. SEGURIDAD

```
[ ] No hay SQL injection (usar Eloquent, no raw queries)
[ ] No hay XSS (inputs sanitizados)
[ ] CSRF token en formularios
[ ] Passwords hasheados con bcrypt
[ ] Tokens tienen expiracion
[ ] Rate limiting en login (max 5 intentos)
[ ] Archivos sensibles no son accesibles publicamente
[ ] URLs de documentos privados son signed y expiran
[ ] No se exponen IDs secuenciales sensibles
[ ] Headers de seguridad configurados (HSTS, X-Frame-Options)
```

---

### 7. PERFORMANCE

```
[ ] No hay N+1 queries (usar eager loading)
[ ] Indices en columnas frecuentemente filtradas
[ ] Paginacion en listados grandes
[ ] Imagenes optimizadas antes de guardar
[ ] Cache de datos estaticos (paises, deportes)
[ ] Lazy loading de componentes React pesados
```

---

### 8. CONSISTENCIA DE DATOS

```
[ ] Foreign keys tienen ON DELETE correcto
[ ] Soft deletes no rompen relaciones
[ ] Estados (ACT, INA, BOR) son consistentes
[ ] Fechas usan timezone correcto
[ ] Montos usan precision decimal correcta
[ ] Enums del frontend coinciden con backend
```

---

## Comandos Utiles para Auditoria

### Backend (Laravel)
```bash
# Ver rutas registradas
php artisan route:list

# Ver modelos sin scope de club
grep -r "class Pla" app/Models/ | xargs -I {} grep -L "ClubScope" {}

# Buscar queries raw (potencial SQL injection)
grep -r "DB::raw\|DB::select\|DB::statement" app/

# Ver migraciones pendientes
php artisan migrate:status

# Buscar TODO/FIXME
grep -rn "TODO\|FIXME\|HACK" app/
```

### Frontend (React)
```bash
# Buscar console.log olvidados
grep -rn "console.log" src/ --include="*.jsx" --include="*.js"

# Buscar TODO/FIXME
grep -rn "TODO\|FIXME" src/

# Verificar imports no usados
npx eslint src/ --rule "no-unused-vars: error"

# Buscar llamadas API sin manejo de error
grep -rn "await.*Service\." src/ | grep -v "try\|catch"
```

---

## Reporte de Auditoria

Al finalizar, generar reporte con:

1. **Bugs Criticos** (bloquean funcionalidad)
2. **Bugs Medios** (afectan UX pero hay workaround)
3. **Bugs Menores** (cosmeticos, typos)
4. **Vulnerabilidades de Seguridad**
5. **Problemas de Performance**
6. **Inconsistencias Frontend/Backend**
7. **Deuda Tecnica**
8. **Recomendaciones de Mejora**

---

## Ejemplo de Uso

```
Usuario: "Audita el flujo de pagos completo"

Agente:
1. Lee PaymentService.php y paymentService.js
2. Traza el flujo desde UI hasta webhook
3. Verifica calculos de descuentos
4. Prueba edge cases (pago parcial, rechazo, timeout)
5. Revisa manejo de errores
6. Genera reporte de hallazgos
```
