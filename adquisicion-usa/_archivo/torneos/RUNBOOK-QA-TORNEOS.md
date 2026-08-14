<!-- ARCHIVADO 13-ago-2026 — QA de torneos YA EJECUTADO; el doc era plan/instrucción de ejecución — pendientes vivos extraídos a torneos/PENDIENTES-PERFORMANCE.md -->
> ⚠️ **ARCHIVADO (13-ago-2026).** El QA del módulo de torneos **ya se ejecutó**; este documento era el plan/instrucción para ejecutarlo.
> **Lo único que sigue abierto (performance del scheduling) está extraído en `../../torneos/PENDIENTES-PERFORMANCE.md`.** Los escenarios de prueba siguen vivos en `../../torneos/GUIA-PRUEBAS-TORNEOS.md`.

# Runbook — Ejecutar todos los escenarios de torneos (para widdo-qa)

> **Cómo usarlo:** dile a un agente: *"usa widdo-qa y ejecuta el RUNBOOK-QA-TORNEOS.md"* — o pega el bloque PROMPT de abajo. El agente ejecuta los 20 escenarios de `GUIA-PRUEBAS-TORNEOS.md` como **tests automáticos** y devuelve un reporte por escenario.
> Este runbook es una **instancia rellenada** de la plantilla genérica reutilizable: `~/Desktop/todo/RUNBOOK-QA-GENERICO.md`.

---

## PROMPT (pégalo a un agente)

Eres el agente de QA de Widdo. Ejecuta los **20 escenarios de `adquisicion-usa/torneos/GUIA-PRUEBAS-TORNEOS.md`** contra el módulo de torneos (`desarrollo/saas_sport/`). Los ejecutas como **tests automáticos** (PHPUnit/feature), NO clicando la UI.

### Cómo ejecutar
- Todo corre **dentro de Docker**: `docker exec saas_sport-saas_sport_app-1 php artisan test <ruta>`.
- **De una suite a la vez** (la BD de test `db_testing` NO soporta correr suites en paralelo → colisiona migraciones).
- Reutiliza y extiende lo que ya existe: `tests/Feature/TournamentEngineMatrixTest.php`, `TournamentScaleTest.php`, `SchedulingServiceTest.php`, trait `SimulatesTournaments`, y las factories creadas. Añade los casos que falten para cubrir los 20 escenarios.

### Mapeo escenario → capa de test (no uses navegador para lo combinatorio)
- **Niveles 0-3 y 5** (formatos, byes, seeding, multi-división): tests de **motor/property** (extiende `TournamentEngineMatrixTest`/`TournamentScaleTest`). Afirma los invariantes de la guía.
- **Nivel 4** (scheduling/constraints): `SchedulingServiceTest`.
- **Niveles 6-7** (pagos, check-in, live scoring): tests **feature/API** (Stripe en modo test/mock; broadcast en `log`).
- **Nivel 8** (gaps de riesgo): tests que **documentan el comportamiento actual** (volleyball sets, empate en eliminación, RR-32 lento). Se ESPERA fricción — no es bug nuevo, es gap conocido.
- **Nivel 9** (escala 500): test `@group scale` con dataset sintético.

### Reglas (no negociables)
- **NO arregles código de producción.** Si un test revela un bug (Niveles 0-7), déjalo como test rojo documentado y repórtalo (archivo:línea, esperado vs real) → lo arregla widdo-tech.
- **NUNCA debilites/saltees un test para forzar verde.**
- **No inventes resultados.** Si el entorno no deja correr algo, dilo.
- Solo tocas `tests/` y factories/seeders de test. No toques `app/`.

### Salida (reporte)
Tabla con una fila por escenario (0-20): **config · ✅ pasa / ❌ bug / ⚠️ gap conocido · evidencia**. Luego: bugs reales encontrados (para widdo-tech), y qué escenarios no se pudieron correr y por qué. Tu respuesta final ES el reporte.

---

## Notas
- Muchos escenarios ya están parcial o totalmente cubiertos (Niveles 0-4 por los tests de P0). El runbook cierra los que faltan (5, 6, 7, 8, 9) y consolida el reporte único.
- Esto equivale a ejecutar **P1+P2+P3** del `PLAN-TESTS-TORNEOS.md`, mapeado a escenarios entendibles.
- **Aíslalo en un git worktree** si va a escribir muchos tests, para no mezclar con WIP.
