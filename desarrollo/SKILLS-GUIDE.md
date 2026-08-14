# Guia de Skills de Auditoria - Widdo

## Skills Disponibles

### 1. saas-system-auditor.md
**Auditor General del Sistema SaaS**

Audita el sistema completo de forma integral. Valida flujos de negocio, detecta bugs, inconsistencias y problemas de seguridad.

| Usar cuando | No usar cuando |
|-------------|----------------|
| Auditorias completas antes de releases | Solo necesitas revisar un area especifica |
| Revisiones periodicas del sistema | Debugging de un bug puntual |
| Validar que todo funciona correctamente | |

---

### 2. multi-tenant-data-isolation-auditor.md
**Auditor de Aislamiento Multi-Tenant**

Verifica que los datos de un club NUNCA sean accesibles por usuarios de otro club.

| Usar cuando | No usar cuando |
|-------------|----------------|
| Agregas nuevos modelos Pla* | Cambios solo en frontend |
| Creas nuevos endpoints de API | Modificas datos de referencia (Bas*) |
| Reportan "veo datos de otro club" | |
| Auditorias de seguridad | |

---

### 3. api-contract-validator.md
**Validador de Contratos de API**

Verifica consistencia entre servicios del frontend y controllers/routes del backend.

| Usar cuando | No usar cuando |
|-------------|----------------|
| Agregas nuevos endpoints | Cambios solo de estilos CSS |
| Error "campo no encontrado" | Cambios en logica interna sin afectar API |
| Refactorizas APIs | |
| Frontend no recibe datos esperados | |

---

### 4. eloquent-query-optimizer.md
**Optimizador de Queries Eloquent**

Detecta N+1 queries, indices faltantes y problemas de performance en base de datos.

| Usar cuando | No usar cuando |
|-------------|----------------|
| Paginas cargan lento | Problemas de red/servidor |
| Timeouts en endpoints | Errores de logica de negocio |
| Agregas relaciones nuevas | |
| Antes de optimizar performance | |

---

### 5. payment-system-auditor.md
**Auditor del Sistema de Pagos**

Audita flujos de cobro, integracion con Wompi, webhooks, descuentos y reportes financieros.

| Usar cuando | No usar cuando |
|-------------|----------------|
| Antes de habilitar pagos en produccion | Cambios no relacionados con dinero |
| Discrepancias en montos | |
| Pagos no se registran | |
| Cambios en logica de descuentos/cuotas | |

---

### 6. rbac-permission-auditor.md
**Auditor de Roles y Permisos**

Verifica que cada rol tenga los permisos correctos y las rutas esten protegidas.

| Usar cuando | No usar cuando |
|-------------|----------------|
| Agregas nuevos roles o permisos | Cambios sin impacto en autorizacion |
| Usuario reporta "acceso denegado" | |
| Usuario accede a funciones no permitidas | |
| Creas nuevos endpoints protegidos | |

---

### 7. react-component-quality-checker.md
**Verificador de Calidad de Componentes React**

Verifica calidad de componentes: estados loading/error, hooks, accesibilidad, performance.

| Usar cuando | No usar cuando |
|-------------|----------------|
| Code review de componentes nuevos | Cambios solo en backend |
| Refactoring de componentes | Ajustes menores de estilos |
| Problemas de UX/UI | |
| Componentes no manejan errores bien | |

---

### 8. sanctum-auth-flow-auditor.md
**Auditor de Flujo de Autenticacion**

Audita generacion de tokens, refresh, logout y proteccion de rutas con Sanctum.

| Usar cuando | No usar cuando |
|-------------|----------------|
| Cambios en autenticacion | Cambios sin impacto en auth |
| Sesiones expiran inesperadamente | |
| Errores 401 frecuentes | |
| Implementas "remember me" o refresh | |

---

### 9. file-upload-security-auditor.md
**Auditor de Seguridad de Archivos**

Audita subida de archivos: validacion de tipos, URLs firmadas, permisos de acceso.

| Usar cuando | No usar cuando |
|-------------|----------------|
| Implementas nuevo tipo de upload | Cambios sin archivos |
| Archivos privados accesibles sin permiso | |
| Cambios en storage (local/Spaces) | |
| Documentos de menores | |

---

### 10. frontend-backend-sync-validator.md
**Validador de Sincronizacion Frontend-Backend**

Detecta inconsistencias: enums, constantes, validaciones, tipos de datos.

| Usar cuando | No usar cuando |
|-------------|----------------|
| Errores de "campo no encontrado" | Cambios solo en un lado |
| Agregas nuevos enums/constantes | |
| Validaciones funcionan diferente | |
| Actualizas modelos en ambos lados | |

---

### 11. database-migration-auditor.md
**Auditor de Migraciones de Base de Datos**

Audita migraciones, foreign keys, indices, tipos de datos y seeders.

| Usar cuando | No usar cuando |
|-------------|----------------|
| Antes de deployar migraciones | Cambios sin impacto en BD |
| Errores de integridad referencial | |
| Queries muy lentos | |
| Agregas nuevas tablas/columnas | |

---

## Como Usar los Skills

### Opcion 1: Auditoria Completa (Recomendado para primera vez)

Ejecutar en este orden:

```
1. saas-system-auditor.md          <- Vision general, detecta problemas principales
2. multi-tenant-data-isolation-auditor.md  <- Seguridad critica
3. rbac-permission-auditor.md      <- Seguridad de acceso
4. payment-system-auditor.md       <- Sistema de dinero
5. sanctum-auth-flow-auditor.md    <- Autenticacion
6. api-contract-validator.md       <- Consistencia API
7. database-migration-auditor.md   <- Integridad de BD
8. eloquent-query-optimizer.md     <- Performance
9. react-component-quality-checker.md  <- Calidad frontend
10. file-upload-security-auditor.md    <- Seguridad archivos
11. frontend-backend-sync-validator.md <- Sincronizacion
```

### Opcion 2: Por Area de Problema

| Problema | Skills a usar |
|----------|---------------|
| **Seguridad** | multi-tenant, rbac, sanctum, file-upload |
| **Performance** | eloquent-query, database-migration |
| **Bugs de datos** | api-contract, frontend-backend-sync |
| **Pagos** | payment-system |
| **UI/UX** | react-component-quality |

### Opcion 3: Antes de Release

```
1. saas-system-auditor.md (completo)
2. payment-system-auditor.md (si hay cambios en pagos)
3. multi-tenant-data-isolation-auditor.md (siempre)
```

---

## Comandos para Probar

### Iniciar Auditoria Completa

Pedir a Claude:
```
"Ejecuta una auditoria completa del sistema usando el skill saas-system-auditor.md
ubicado en /Users/miguelcano/Desktop/todo/Widdo/desarrollo/skills/"
```

### Auditar Area Especifica

```
"Audita el sistema de pagos usando el skill payment-system-auditor.md"
```

### Auditar Despues de Cambios

```
"Acabo de agregar un nuevo modelo PlaClubTeamTournament.
Usa los skills multi-tenant-data-isolation-auditor.md y database-migration-auditor.md
para verificar que esta bien implementado."
```

---

## Formato de Reporte

Cada auditoria genera hallazgos clasificados:

| Severidad | Significado | Accion |
|-----------|-------------|--------|
| **CRITICO** | Bloquea funcionalidad o expone datos | Corregir YA |
| **ALTO** | Afecta seguridad o UX significativamente | Corregir antes de release |
| **MEDIO** | Problema menor con workaround | Planificar correccion |
| **BAJO** | Cosmetico o mejora menor | Agregar a backlog |
