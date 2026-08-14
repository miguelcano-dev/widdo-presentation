<!-- ARCHIVADO 13-ago-2026 — índice de nov-2025 del "proyecto de optimización V1": su archivo central `PROGRESS.md` ya está archivado en `_archivo-docs/claude-root/`, y las 4 fases que describe se completaron en feb-2026 — sustituido por `desarrollo/CLAUDE.md` (guía viva de este repo) -->

# 📚 Directorio de Contexto de Desarrollo

Este directorio contiene toda la información necesaria para retomar el desarrollo en cualquier punto sin perder contexto.

---

## 📁 Archivos en Este Directorio

### 1. 📊 `PROGRESS.md` ⭐ **[ARCHIVO PRINCIPAL]**
**Propósito**: Tracking completo del proyecto de optimización V1

**Contiene**:
- Estado actual del progreso (X/16 tareas)
- Roadmap completo de 4 fases
- Detalle de cada tarea con subtareas
- Bugs encontrados
- Mejoras identificadas
- Próximos pasos
- Estrategia de branching y Git
- Métricas de progreso

**Cuándo consultar**:
- ✅ Al iniciar cada sesión de desarrollo
- ✅ Al completar cada tarea
- ✅ Cuando no sepas qué hacer después
- ✅ Antes de crear un Pull Request

**Actualizar**:
- Cada vez que completes una subtarea
- Al encontrar un bug
- Al identificar una mejora
- Al cambiar de fase

---

### 2. 📜 `RULES.md` ⭐ **[REGLAS Y ESTÁNDARES]**
**Propósito**: Guía de estándares de código y workflow

**Contiene**:
- ❌ Prohibiciones absolutas (referencias a IA, commits no profesionales)
- ✅ Estándares obligatorios (branches, commits, workflow)
- 🎯 Estándares de código (Frontend y Backend)
- 🔒 Reglas de seguridad
- 📊 Reglas de performance
- 🧪 Reglas de testing
- ⚠️ Errores comunes a evitar

**Cuándo consultar**:
- Al iniciar una nueva fase
- Antes de hacer un commit
- Cuando tengas duda sobre cómo nombrar algo
- Antes de crear un Pull Request

**NO actualizar** (a menos que se agreguen nuevas reglas del proyecto)

---

### 3. ⚡ `QUICK_START.md` ⭐ **[REFERENCIA RÁPIDA]**
**Propósito**: Guía ultra-rápida para retomar desarrollo

**Contiene**:
- Pasos para retomar sesión (2 minutos)
- Template para iniciar nueva fase
- Workflow durante desarrollo
- Checklist al completar fase
- Resolución rápida de problemas
- Comandos más usados
- Reglas de oro

**Cuándo consultar**:
- ✅ Al iniciar cada sesión (primero este, luego PROGRESS.md)
- ✅ Cuando olvidaste en qué estabas trabajando
- ✅ Cuando necesites comandos rápidos
- ✅ Cuando tengas un problema común

**NO actualizar** (contiene información estática)

---

### 4. 📝 Este archivo (`README.md`)
**Propósito**: Índice y guía de navegación de este directorio

---

## 🚀 Flujo de Trabajo Recomendado

### Al Iniciar Sesión:

```
1. Leer QUICK_START.md (1 min)
   └─ Sección "Para Retomar Sesión"

2. Leer PROGRESS.md (2 min)
   └─ Sección "PRÓXIMOS PASOS"
   └─ Sección "Estado General"
   └─ Ver última tarea marcada

3. Verificar entorno (1 min)
   └─ Git status
   └─ Docker running
   └─ Frontend compiling

4. Continuar desarrollo
```

---

### Durante Desarrollo:

```
1. Trabajar en la tarea actual

2. Commits frecuentes (cada hora o feature)
   └─ Seguir RULES.md para formato de commits

3. Actualizar PROGRESS.md al completar subtareas
   └─ Marcar checkboxes [x]
   └─ Agregar bugs encontrados
   └─ Agregar mejoras identificadas

4. Push regular a tu feature branch
```

---

### Al Completar Fase:

```
1. Verificar checklist en PROGRESS.md
   └─ Todas las tareas [x]
   └─ Sin TODOs críticos
   └─ Sin console.log olvidados

2. Actualizar métricas en PROGRESS.md
   └─ FASE X: ██████████ 4/4 (100%)

3. Commit final y push

4. Crear Pull Request
   └─ Seguir template de PROGRESS.md

5. Después de merge, limpiar y preparar siguiente fase
```

---

## 📊 Estado Actual del Proyecto

Ver siempre en `PROGRESS.md` sección "PROGRESO TOTAL"

**Ejemplo**:
```
PROGRESO GENERAL: ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 2/16 (12.5%)
```

---

## 🎯 Fases del Proyecto (Referencia Rápida)

```
FASE 1: Seguridad Crítica (4 tareas)
├── Sanitización XSS
├── Error Boundaries
├── Validación backend
└── Manejo de errores API

FASE 2: Performance y UX (4 tareas)
├── Loading states
├── Optimistic updates
├── Memoización Context
└── Lazy loading imágenes

FASE 3: Testing Crítico (5 tareas)
├── Setup Playwright
├── Tests Autenticación
├── Tests RBAC
├── Tests CRUD
└── Tests Multi-tenant

FASE 4: Refinamiento (3 tareas)
├── Bug fixes
├── UX improvements
└── Documentation
```

---

## 🔑 Archivos Clave del Proyecto

Fuera de `.claude/`:

```
desarrollo/
├── .claude/                    # ← Estás aquí
├── saas_sport/                 # Backend Laravel
│   ├── app/
│   ├── database/
│   └── docker-compose.yml
├── frontend/                   # Frontend React
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── README.md                   # Setup inicial
└── CLAUDE.md                   # Documentación técnica
```

---

## 🆘 Si Te Perdiste Completamente

1. **Lee este archivo** (estás aquí) ✅
2. **Lee QUICK_START.md** → Sección "Si Te Perdiste"
3. **Lee PROGRESS.md** → Sección "PRÓXIMOS PASOS"
4. **Verifica git**: `git log -1` y `git status`
5. **Continúa desde ahí**

---

## 📞 Preguntas Frecuentes

### ❓ ¿En qué orden leo los archivos?

**Sesión nueva**:
1. QUICK_START.md (1 min)
2. PROGRESS.md sección "PRÓXIMOS PASOS" (2 min)
3. Empezar a desarrollar

**Primera vez**:
1. Este README.md (estás aquí)
2. RULES.md completo (10 min)
3. PROGRESS.md completo (15 min)
4. QUICK_START.md (5 min)

---

### ❓ ¿Qué archivo actualizo más?

**PROGRESS.md** es el único que actualizas constantemente:
- Cada tarea completada
- Cada bug encontrado
- Cada mejora identificada
- Al cambiar de fase

Los otros archivos son referencia estática.

---

### ❓ ¿Qué pasa si pierdo contexto?

Lee **PROGRESS.md** sección:
1. "Estado General"
2. "PRÓXIMOS PASOS"
3. "Última Actualización"
4. Última tarea con checkbox [x]

Eso te dice exactamente dónde quedaste.

---

### ❓ ¿Cómo sé qué comando ejecutar?

**QUICK_START.md** tiene:
- Sección "Comandos Más Usados"
- Sección "Resolución Rápida de Problemas"

---

### ❓ ¿Cómo hago un commit correcto?

**RULES.md** sección:
- "Convención de Commits"
- "Checklist Pre-Commit"

Formato: `tipo: descripción`

Ejemplos:
```bash
fix: Sanitize HTML to prevent XSS
feat: Add error boundary to dashboard
refactor: Memoize context values
test: Add authentication tests
```

---

### ❓ ¿Cuándo creo un Pull Request?

Al completar una **FASE completa** (no por tarea individual).

Ver **PROGRESS.md** sección:
- "Estrategia de Branching"
- "Checklist Pre-PR"

---

## 🎯 Objetivos de Este Directorio

✅ **Retomar desarrollo** en cualquier momento sin pérdida de contexto
✅ **Mantener consistencia** en código, commits y workflow
✅ **Evitar errores comunes** con reglas claras
✅ **Trackear progreso** de forma cuantificable
✅ **Documentar decisiones** y hallazgos importantes

---

## 💡 Tips

1. **Mantén PROGRESS.md abierto** mientras desarrollas
2. **Actualiza checkboxes** inmediatamente al completar
3. **Lee PRÓXIMOS PASOS** al iniciar cada sesión
4. **Sigue RULES.md** para commits y código
5. **Usa QUICK_START.md** cuando tengas prisa

---

**Este directorio es tu fuente de verdad para el proyecto de optimización V1**
