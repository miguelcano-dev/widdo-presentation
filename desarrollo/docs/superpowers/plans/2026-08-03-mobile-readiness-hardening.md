# Mobile Readiness Hardening Implementation Plan

> ## ✅ EJECUTADO (estado al 13-ago-2026)
>
> - **Tasks 1-5:** hechas y **en producción**.
> - **Task 6 (sincronizar la documentación de Flutter):** ejecutada el **13-ago-2026** por
>   otro agente en esta misma tanda de depuración.
>
> **Los `- [ ]` de abajo NO son pendientes**: el plan nunca se fue marcando. No lo ejecutes.


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar los huecos confirmados de idempotencia, atomicidad, paginación y verificación de contratos antes de iniciar Flutter.

**Architecture:** Laravel conserva compatibilidad web, pero endurece escrituras financieras con claves acotadas por endpoint, recuperación de operaciones abandonadas y poda. La cancelación de cobros se ejecuta en una transacción y procesa filas sin cargar todo en memoria. El extractor web se convierte en una unidad testeable que entiende `fetch` y ofrece un modo de verificación reproducible.

**Tech Stack:** Laravel 12, PHPUnit 11, MySQL 8, React/Vite, Node test runner, GitHub Actions, OpenAPI 3.0.

## Global Constraints

- No cambiar respuestas exitosas existentes salvo códigos de error nuevos ya documentados.
- Flutter exigirá `Idempotency-Key`; la web puede omitirla durante la migración.
- Trabajar en worktrees y ramas `codex/*`; no commit, merge ni deploy sin autorización de Miguel.
- Cada bug se reproduce en rojo antes de modificar producción.
- Bases de prueba aisladas `db_testing_b` o `db_testing_c`.

---

### Task 1: Idempotencia financiera recuperable y acotada

**Files:**
- Modify: `saas_sport/app/Http/Middleware/EnsureIdempotency.php`
- Create: `saas_sport/database/migrations/2026_08_03_000100_scope_idempotency_keys_by_endpoint.php`
- Create/Modify: `saas_sport/tests/Feature/PaymentIdempotencyTest.php`
- Modify: `saas_sport/routes/console.php`

**Interfaces:**
- Consumes: `Idempotency-Key`, usuario autenticado, método y path de la petición.
- Produces: replay por `user_id + endpoint + key`, `409 idempotency_in_progress`, recuperación de filas abandonadas y poda diaria.

- [ ] Escribir tests que demuestren replay cruzado entre endpoints, fila abandonada y excepción sin limpieza.
- [ ] Ejecutarlos y confirmar fallos por el comportamiento actual.
- [ ] Cambiar índice/lookup para incluir endpoint y limpiar la reserva si `$next` lanza.
- [ ] Recuperar reservas sin respuesta después del TTL y podar respuestas expiradas.
- [ ] Ejecutar tests específicos y suite financiera relacionada.

### Task 2: Cancelación de cobro atómica y acotada en memoria

**Files:**
- Modify: `saas_sport/app/Http/Controllers/PlaClubTeamChargeController.php`
- Modify: `saas_sport/tests/Feature/ChargeDeactivationCancelsPaymentsTest.php`

**Interfaces:**
- Consumes: petición de alternar estado de un cobro.
- Produces: cobro y pagos coherentes todos-o-ninguno, manteniendo auditoría por modelo.

- [ ] Escribir test que lance en la segunda actualización y compruebe rollback total.
- [ ] Ejecutar y confirmar que hoy deja estado parcial.
- [ ] Envolver cambio de cobro y pagos en `DB::transaction` y recorrer por `lazyById`.
- [ ] Ejecutar tests de cancelación, auditoría y FK.

### Task 3: Límite de paginación del historial

**Files:**
- Modify: `saas_sport/app/Http/Controllers/PlaClubTeamPaymentController.php`
- Modify: `saas_sport/tests/Feature/PlayerPaymentHistoryTest.php`

**Interfaces:**
- Consumes: `per_page` opcional.
- Produces: paginación entre 1 y 100, default 50.

- [ ] Escribir tests para `per_page=10000`, cero y negativo.
- [ ] Confirmar fallo actual.
- [ ] Aplicar clamp explícito.
- [ ] Ejecutar pruebas de historial y autorización.

### Task 4: Extractor de llamadas API testeable

**Files:**
- Create: `frontend/scripts/api-contract/extractor-lib.mjs`
- Modify: `frontend/scripts/api-contract/extract.mjs`
- Create: `frontend/tests/unit/api-contract-extractor.test.mjs`
- Modify: `frontend/package.json`

**Interfaces:**
- Consumes: texto JS/JSX con axios o `fetch`.
- Produces: método/ruta correctos o conteo dinámico; modo `--check` que no escribe y falla si el manifiesto está desactualizado.

- [ ] Escribir tests para `fetch` POST, URL base+constante, query y opciones multilínea.
- [ ] Confirmar que hoy se registran como GET o desaparecen.
- [ ] Extraer funciones puras e implementar parsing mínimo explícito.
- [ ] Añadir `api:contract:check` y ejecutar tests/lint.
- [ ] Regenerar el manifiesto y ejecutar el detector Laravel.

### Task 5: Compatibilidad OpenAPI entre commits

**Files:**
- Modify: `saas_sport/.github/workflows/tests.yml`
- Modify: `saas_sport/openapi/README.md`

**Interfaces:**
- Consumes: `openapi/mobile-v1.yaml` de base y rama.
- Produces: CI rojo ante cambios incompatibles, además de conformidad de respuesta.

- [ ] Verificar la integración oficial vigente de `oasdiff`.
- [ ] Añadir gate para pull requests y comportamiento explícito en primer commit/base inexistente.
- [ ] Validar sintaxis del workflow y documentar el comando equivalente.

### Task 6: Sincronizar documentación operativa

**Files:**
- Modify: `mobile_flutter/specs/ARRANQUE.md`
- Modify: `PLAN-FLUTTER-BACKEND-READINESS.md`

**Interfaces:**
- Produces: estado real de A1/A2/A3, sin referencias a ramas ya integradas ni conteos viejos.

- [ ] Marcar `exclude-case` y detector como integrados, conservando riesgos pendientes reales.
- [ ] Registrar los gates nuevos y la limitación de CI entre repos.
- [ ] Buscar contradicciones y verificar enlaces/rutas.

