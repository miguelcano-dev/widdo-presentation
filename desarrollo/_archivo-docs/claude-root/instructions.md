<!-- ARCHIVADO 13-ago-2026 — enrutador de docs de feb-2026 que ya nadie carga: apunta a `frontend/.claude/instructions.md`, que NO EXISTE, y su función (decir qué leer por tipo de tarea) la cumple hoy el CLAUDE.md que Claude Code carga solo — sustituido por `desarrollo/CLAUDE.md` -->

# Widdo Development - Claude Instructions

## Context-Aware Documentation

When working on this project, Claude should read the appropriate documentation based on the task:

### Backend Tasks (Laravel/PHP)
Read: `saas_sport/.claude/instructions.md`
- API development, controllers, services
- Database migrations, models, seeders
- Authentication, authorization, policies
- Queue jobs, scheduled tasks
- Testing with PHPUnit

### Frontend Tasks (React/Vite)
Read: `frontend/.claude/instructions.md`
- React components, pages, hooks
- Styling with Tailwind CSS
- Forms with React Hook Form
- API integration with Axios
- E2E testing with Playwright

### Full-Stack Tasks
Read both instruction files above, plus:
- `ARCHITECTURE.md` for system overview
- `.claude/context.md` for current project state
- `.claude/decisions.md` for architectural decisions

## Quick Reference

- **Backend root**: `saas_sport/`
- **Frontend root**: `frontend/`
- **API URL (dev)**: `http://localhost:8010/api`
- **Frontend URL (dev)**: `http://localhost:5173`
