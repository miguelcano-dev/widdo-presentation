<!-- ARCHIVADO 13-ago-2026 — guía de arranque de nov-2025 construida sobre `.claude/PROGRESS.md` (ya archivado) y sobre un flujo `develop` + fases 1-4 que terminó en feb-2026 — sustituido por `desarrollo/CLAUDE.md` -->

# ⚡ QUICK START - Retomar Desarrollo

## 🎯 Para Retomar Sesión de Desarrollo

### 1. Leer Contexto (2 minutos)
```bash
# Abrir archivo de progreso
cat .claude/PROGRESS.md

# Ver sección "PRÓXIMOS PASOS"
# Ver sección "ÚLTIMA ACTUALIZACIÓN"
# Ver "Estado General"
```

### 2. Verificar Estado de Git (30 segundos)
```bash
cd /Users/miguelcano/Desktop/todo/Widdo/desarrollo

# ¿En qué branch estoy?
git branch --show-current

# ¿Hay cambios sin commitear?
git status

# ¿Cuál fue el último commit?
git log -1 --oneline
```

### 3. Verificar Entorno (1 minuto)
```bash
# Backend Docker
cd saas_sport
docker-compose ps

# Si no está corriendo:
docker-compose up -d

# Frontend
cd ../frontend
npm run dev
# Verificar que corra en http://localhost:5173
```

### 4. Continuar Desarrollo
```bash
# Si estás en medio de una fase, continuar
# Si completaste una fase, ver PROGRESS.md para siguiente fase
```

---

## 📋 Inicio de Nueva Fase

### Template para Iniciar FASE X:
```bash
# 1. Asegurar que estás en develop
git checkout develop
git pull origin develop

# 2. Crear nueva rama
git checkout -b feature/fase-X-nombre-descriptivo

# 3. Abrir PROGRESS.md
code .claude/PROGRESS.md

# 4. Marcar primera tarea como "in_progress" en PROGRESS.md

# 5. Empezar desarrollo
```

---

## 📝 Durante Desarrollo

### Commits Frecuentes:
```bash
# Cada hora o feature completada
git add .
git commit -m "tipo: descripción clara"
git push origin feature/fase-X-nombre
```

### Actualizar Progreso:
```bash
# Cada vez que completes una subtarea
# Abrir .claude/PROGRESS.md
# Marcar checkbox [x] en la subtarea
# Actualizar "Última Actualización"
```

---

## ✅ Al Completar Fase

### Checklist Final:
```bash
# 1. Verificar que todas las tareas están [x]
cat .claude/PROGRESS.md | grep "FASE X"

# 2. Actualizar métricas en PROGRESS.md
# FASE X: ██████████ 4/4 (100%)

# 3. Commit final
git add .
git commit -m "feat: Complete Phase X - [nombre fase]"
git push origin feature/fase-X-nombre

# 4. Crear Pull Request
# Título: "FASE X: [Nombre Descriptivo]"
# Descripción: Copiar checklist de PROGRESS.md

# 5. Después de merge
git checkout develop
git pull origin develop
git branch -d feature/fase-X-nombre
```

---

## 🚨 Resolución Rápida de Problemas

### Frontend no compila:
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Backend no responde:
```bash
cd saas_sport
docker-compose down
docker-compose up -d
docker-compose logs -f
```

### Git conflicts:
```bash
git status  # Ver qué archivos tienen conflicto
# Abrir archivos, resolver conflictos manualmente
git add .
git rebase --continue
# O si es merge:
git commit -m "fix: Resolve merge conflicts"
```

### Olvidé en qué estaba trabajando:
```bash
# Ver último commit
git log -1

# Ver cambios no commiteados
git diff

# Leer PROGRESS.md sección "ÚLTIMA ACTUALIZACIÓN"
cat .claude/PROGRESS.md | grep -A 10 "Última Actualización"
```

---

## 📚 Archivos de Referencia

| Archivo | Para Qué |
|---------|----------|
| `.claude/PROGRESS.md` | Estado completo del proyecto, próximos pasos |
| `.claude/RULES.md` | Reglas de código, git, commits |
| `.claude/QUICK_START.md` | Este archivo - referencia rápida |
| `README.md` | Setup inicial del proyecto |
| `CLAUDE.md` | Documentación técnica del proyecto |

---

## 🎯 Fases del Proyecto

```
✅ FASE 1: Seguridad Crítica (4 tareas)
  └─ XSS, Error Boundaries, Validación, Manejo errores

✅ FASE 2: Performance y UX (4 tareas)
  └─ Loading states, Optimistic updates, Memoization, Lazy loading

✅ FASE 3: Testing Crítico (5 tareas)
  └─ Playwright setup, Auth tests, RBAC tests, CRUD tests, Multi-tenant

✅ FASE 4: Refinamiento (3 tareas)
  └─ Bug fixes, UX improvements, Documentation
```

---

## 🔑 Comandos Más Usados

```bash
# Estado del proyecto
git status
git log --oneline -5
docker-compose ps

# Desarrollo
npm run dev              # Frontend
docker-compose up -d     # Backend

# Git workflow
git checkout -b feature/fase-X-nombre
git add .
git commit -m "tipo: descripción"
git push origin feature/fase-X-nombre

# Ver progreso
cat .claude/PROGRESS.md | grep "PROGRESO GENERAL"
```

---

## 💡 Reglas de Oro

1. ✅ **Una rama por fase** (no por tarea)
2. ✅ **Commits frecuentes** con mensajes claros
3. ✅ **Actualizar PROGRESS.md** al completar cada tarea
4. ✅ **No incluir referencias a IA** en código/commits
5. ✅ **Checklist pre-merge** antes de crear PR

---

## 📞 Si Te Perdiste

1. Lee `.claude/PROGRESS.md` sección "PRÓXIMOS PASOS"
2. Lee último commit: `git log -1`
3. Lee "Última Actualización" en PROGRESS.md
4. Continúa desde ahí

---

**Mantén este archivo abierto mientras desarrollas**
