# Skills de Auditoria - Widdo

Coleccion de skills especializados para auditar y validar el sistema SaaS de Widdo.

## Skill Principal

### saas-system-auditor.md
**Experto general en SaaS** - Audita todo el sistema de forma integral:
- Flujos criticos de negocio (registro, login, pagos, etc)
- Aislamiento multi-tenant
- Roles y permisos
- Validaciones frontend/backend
- Manejo de errores
- Seguridad general
- Performance

**Uso recomendado:** Auditorias completas antes de releases importantes.

---

## Skills Especializados

### Seguridad

| Skill | Descripcion |
|-------|-------------|
| `multi-tenant-data-isolation-auditor.md` | Verifica aislamiento de datos entre clubes |
| `rbac-permission-auditor.md` | Audita roles, permisos y policies |
| `sanctum-auth-flow-auditor.md` | Verifica flujo de autenticacion con tokens |
| `file-upload-security-auditor.md` | Seguridad en subida y acceso a archivos |

### Integridad de Datos

| Skill | Descripcion |
|-------|-------------|
| `payment-system-auditor.md` | Audita flujos de pago, webhooks, calculos |
| `database-migration-auditor.md` | Verifica migraciones, FK, indices, seeders |
| `frontend-backend-sync-validator.md` | Detecta inconsistencias entre React y Laravel |
| `api-contract-validator.md` | Valida endpoints, payloads, respuestas |

### Performance y Calidad

| Skill | Descripcion |
|-------|-------------|
| `eloquent-query-optimizer.md` | Detecta N+1, optimiza queries, indices |
| `react-component-quality-checker.md` | Verifica calidad de componentes React |

---

## Como Usar

### 1. Auditoria Completa
```
Usar: saas-system-auditor.md
Cuando: Antes de releases, auditorias periodicas
```

### 2. Despues de Cambios Especificos

| Cambio | Skill a usar |
|--------|--------------|
| Nuevo endpoint API | api-contract-validator.md |
| Nuevo modelo/tabla | database-migration-auditor.md, multi-tenant-data-isolation-auditor.md |
| Cambios en pagos | payment-system-auditor.md |
| Nuevo rol o permiso | rbac-permission-auditor.md |
| Cambios en auth | sanctum-auth-flow-auditor.md |
| Nuevo upload de archivos | file-upload-security-auditor.md |
| Componentes React | react-component-quality-checker.md |
| Queries lentos | eloquent-query-optimizer.md |

### 3. Problemas Reportados

| Problema | Skill a usar |
|----------|--------------|
| "No puedo ver mis datos" | rbac-permission-auditor.md |
| "Veo datos de otro club" | multi-tenant-data-isolation-auditor.md |
| "Sesion expira muy rapido" | sanctum-auth-flow-auditor.md |
| "Pago no se registro" | payment-system-auditor.md |
| "Pagina muy lenta" | eloquent-query-optimizer.md |
| "Campo no encontrado" | frontend-backend-sync-validator.md |

---

## Estructura de Cada Skill

Cada skill contiene:

1. **Descripcion** - Que hace el skill
2. **Cuando Usar** - Escenarios de uso
3. **Arquitectura** - Como funciona esa parte del sistema
4. **Checklist** - Items a verificar
5. **Pruebas** - Tests manuales o automatizados
6. **Comandos** - Comandos utiles de debug
7. **Errores Comunes** - Problemas tipicos y soluciones
8. **Reporte** - Clasificacion de hallazgos (Critico/Alto/Medio/Bajo)

---

## Ejemplo de Uso con Claude

```
Usuario: "Audita el sistema de pagos"

Claude:
1. Lee payment-system-auditor.md
2. Sigue el checklist de auditoria
3. Lee archivos relevantes (PaymentService.php, etc)
4. Ejecuta pruebas sugeridas
5. Genera reporte de hallazgos
```

---

## Severidades

| Nivel | Descripcion | Accion |
|-------|-------------|--------|
| **CRITICO** | Bloquea funcionalidad o expone datos | Corregir inmediatamente |
| **ALTO** | Afecta seguridad o UX significativamente | Corregir antes de release |
| **MEDIO** | Problema menor con workaround | Planificar correccion |
| **BAJO** | Cosmetico o mejora menor | Backlog |

---

## Mantenimiento de Skills

Actualizar skills cuando:
- Se agreguen nuevas features al sistema
- Cambien patrones de arquitectura
- Se descubran nuevos tipos de bugs
- Cambien tecnologias (versiones de Laravel, React, etc)
