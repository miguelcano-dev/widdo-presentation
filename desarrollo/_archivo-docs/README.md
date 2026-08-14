# _archivo-docs — Cementerio de documentación

Depuración del 2026-07-16, con una 2ª tanda el 2026-08-13 (docs de contexto de `.claude/`).
Cada archivo movido lleva una primera línea `<!-- ARCHIVADO ... -->` con su razón y su sustituto.
Aquí viven docs que **ya no reflejan el estado actual** del sistema
(planes ya construidos, fixes ya aplicados, estrategias abandonadas). **Nada se borró de verdad** —
todo es recuperable. En los repos git (`frontend/`, `saas_sport/`, `mobile/`) además queda en el historial.

Criterio: se sacó lo 🔴 MUERTO (obsoleto / contradice la realidad) y lo 🟡 HISTÓRICO (plan o fix ya ejecutado).
Se conservó en su sitio todo lo 🟢 VIGENTE (referencia viva del sistema hoy).

## Qué hay aquí

### `desarrollo-raiz/` (18)
Planes y logs de sesión de la raíz de `desarrollo/` (que NO es repo git, por eso se archivan sí o sí).
- **Muertos:** `NOTIFICACIONES-LARAVEL-11.md` (ya en L12), `WIDDO_CONTEXT.md` (contexto dic-2025),
  `TEST-LOGIN-DEBUG.md`, `revisar5.md`.
- **Históricos:** `AGENTE-IA-SPEC.md`, `ARQUITECTURA_Y_REESTRUCTURACION.md`, `PLAN_REFACTORING.md`
  (migración L10→L12 ya hecha), `plan-gratuito-modulos.md`, `PUSH_NOTIFICATIONS_PLAN.md`,
  `referidos_cursor.md`, `SUPER_ADMIN_PAGES_PLAN.md`, `TESTING_COMPLETO.md`,
  `FIX-ONBOARDING-REDIRECT.md`, `FIX-USER-ACCESS-PROBLEM.md`, `revisar1-4.md`.

### `claude-root/` (20)
Planes y docs de contexto de `desarrollo/.claude/` previos a implementaciones
**que ya están en producción** (jul 2026). Este era el mayor peso de tokens (~530KB).
- Suscripciones (completado jul 15-16): `SUBSCRIPTIONS-FIX-PLAN.md`, `SUBSCRIPTIONS-FIX-PROGRESS.md`.
- Clubes E2E (reparado jul 16): `E2E-CLUBES-FIX-PLAN.md`.
- Roadmap V1 (feb 2026): `PROGRESS.md`.
- Torneos (motor construido/pusheado jul 8-13): `TOURNAMENTS.md`, `TOURNAMENTS-DETAILED.md`,
  `TOURNAMENTS-PHASES.md`, `TOURNAMENTS-FLOW.md`, `TOURNAMENTS-SIMULATIONS.md`, `TOURNAMENTS-STATS.md`,
  `TOURNAMENTS-SPORTS.md`, `TOURNAMENTS-LIVE.md`, `TOURNAMENTS-SCHEDULING.md`,
  `TOURNAMENTS-DISCOVERY.md`, `TOURNAMENTS-GAPS.md`.
- **2ª tanda (13-ago-2026)** — los 5 docs de contexto que orbitaban `PROGRESS.md`, ya archivado:
  - `README.md` + `QUICK_START.md` (nov-2025): índice y guía de arranque del "proyecto de
    optimización V1"; sus 4 fases se cerraron en feb-2026.
  - `RULES.md` (nov-2025): reglas atadas a `PROGRESS.md` y a un flujo `develop` + "una rama
    por fase" ya abandonado. Además **prohibía `Co-Authored-By: Claude`**, que contradice
    la convención de commits vigente — la razón principal para sacarlo de en medio.
  - `memory.md` (feb-2026): memoria congelada; daba "App Móvil Capacitor ← SIGUIENTE" cuando
    el móvil real es Flutter (`widdo-mobile-flutter`, specs en `desarrollo/mobile_flutter/`).
  - `instructions.md` (feb-2026): enrutador de docs que apuntaba a
    `frontend/.claude/instructions.md`, **archivo que no existe**; su función la cumple hoy
    el `CLAUDE.md` que Claude Code carga solo.

- **Siguen vivos en `.claude/`:** `context.md` y `decisions.md` (actualizados el 13-ago-2026:
  Stripe como única pasarela, móvil = Flutter, y Laravel 12 + Reverb marcado como ejecutado),
  `TOURNAMENTS-INDEX.md`, `TOURNAMENTS-QR-CHECKIN-PLAN.md` (por implementar),
  `STRIPE-E2E-TEST-RUNBOOK.md` (prueba pendiente), `E2E-AI-AGENT-PLAN.md`, `LIGAS.md`,
  `TOURNAMENT-E2E-HARNESS-PLAN.md`.

### `frontend/` (5)
Estrategia móvil **Capacitor** (nunca se ejecutó; el móvil pasó a React Native/Expo en `mobile/`):
`CAPACITOR_IMPLEMENTATION_PLAN.md`, `.claude/capacitor-implementation.md`,
`.claude/mobile-app-architecture.md`. Mejoras UI ya aplicadas: `mejora_vista.md`, `.claude/RESUMEN_MEJORAS.md`.

### `saas_sport/` (5)
`README.md` (boilerplate Laravel), `PHONE_VALIDATION_IMPLEMENTATION.md` (cambio ya hecho),
`docs/TESTING-PLAN.md`, `docs/referidos_antigravity.md`, `.claude/todos.md` (Ronda 0 ya completada).

### `mobile/` (1)
`MOBILE_PLAN.md` — plan de 15 fases; fases 0-13 al 100%.

⚠️ **Actualización 13-ago-2026: la app React Native ya no está "pausada", está ABANDONADA.**
Miguel lo decidió ese día. El directorio entero pasó de `desarrollo/mobile/` a
**`desarrollo/_archivo-mobile-rn/`** (fuera de este cementerio, por tamaño: ~1,5 GB con
`node_modules` y `ios/Pods`). Ver su `LEEME.md`, que incluye el aviso de **no ejecutar `eas build`
desde ahí** (comparte el bundle `co.widdo.app` con la app Flutter que está en TestFlight).

## Pendiente opcional (2ª pasada — no ejecutado)
Correcciones menores en docs que se MANTUVIERON pero traen datos viejos:
`context.md` / `TOURNAMENTS-INDEX.md` (dicen "0% / 90% MVP"), `BACKEND.md` / `ARCHITECTURE.md`
("Laravel 10" → 12), y `DATABASE.md` duplicado en `saas_sport/` (raíz vs `docs/`).

---

# Segunda tanda — 13-ago-2026 (specs, plans y docs de E2E)

Depuración de `docs/superpowers/` y de la documentación de tests. Criterio nuevo: **a los
specs y planes NO se les reescribe el contenido**, se les pone una cabecera de estado
verificada contra el código. Solo se archiva lo que ya no debe leerse como trabajo vivo.

### `plans/` (6) — planes EJECUTADOS
Sus 351 checkboxes `- [ ]` nunca se fueron marcando, así que un lector los tomaba por
backlog pendiente cuando el código ya estaba en producción. Se archivan con cabecera ✅:

- `2026-04-20-consent-agent-{1,2,3,4}-*.md` — los 4 planes del sistema de consentimientos.
  Verificado: 7 modelos (`DataConsent`, `PlaClubConsentTemplate`, `PlaClubTeamConsentForm`,
  `PlaClubTeamSignedConsent`, `PlaClubTeamExternalConsentDoc` + `…Signature`,
  `BasCountryConsentConfig`), 3 seeders y el middleware `check-consent` en `routes/api.php`.
- `2026-07-17-start-script-test-modes.md` — `Widdo/start.sh` existe con los 3 modos
  (`./start.sh`, `--test`, `--e2e`) + su arnés (`ce69be6`, `b92272c`).
- `2026-07-29-incapacidades-asistencia-mobile.md` — 54 archivos tocan incapacidades
  (`IncapacityAdjustmentService`, `IncapacityAdjustmentDialog.jsx`…).

**Siguen vivos en `plans/` (3):** `2026-07-29-acuerdos-de-pago.md` (implementado pero 🔴 con
fallos vistos en QA), `2026-07-29-document-review-v2.md` (🟡 parcial, código sin plan
cerrado) y `2026-08-03-mobile-readiness-hardening.md` (Tasks 1-6 hechas).

### `frontend/tests-e2e/` (1)
`README-registro.md` — no era un README sino el **ticket de un bug de mar-2026** (botón
«Crear club» siempre disabled desde Playwright). Su comando usa `--project=public`, un
proyecto que no existe en `playwright.config.js`, así que ni arranca. ⚠️ El bug de fondo
**no se ha verificado como arreglado**: si reaparece, el diagnóstico sigue siendo válido.

### `frontend/components-loading/` (2)
`README.md` + `INTEGRATION.md` — 959 líneas para 6 componentes, muy solapadas entre sí y
con ejemplos que apuntan a un `LoadingDemo.jsx` **que no existe**. Fusionadas en un README
corto en `frontend/src/components/loading/README.md`. Además `frontend/CLAUDE.md` solo
admite `README.md` como documento suelto: `INTEGRATION.md` no debía existir.

## Lo que NO se archivó, solo se le puso cabecera de estado
Los ~20 specs de `docs/superpowers/specs/` se quedan donde están. Dos correcciones que
conviene conocer:

- **`2026-08-12-historial-deportivo-design.md`** — tenía 12 tareas en `✅` y **nada estaba
  implementado** (`pla_player_club_stints`, `pla_player_achievements` y
  `pla_player_profile_grants` no aparecen en ningún archivo). Desmarcadas.
- **`2026-05-19-tournaments-design.md`** — decía «Implementation status: 0%» con el motor
  de torneos **construido y desplegado**. El estado real vive en su gemelo,
  `saas_sport/docs/superpowers/specs/2026-05-21-tournament-engine-design.md`.

---

# Tercera tanda — 13-ago-2026 (purga de React Native/Capacitor: frontend, landing, móvil)

Detonante: **Miguel abandonó React Native/Capacitor** ese día. Se eliminó su documentación activa,
extrayendo antes lo que el frente Flutter necesitaba.

### `frontend/` — 5 archivos nuevos en esta carpeta
Los nombres llevan el prefijo `.claude-` cuando venían de `frontend/.claude/`.

| Archivo | Por qué |
|---|---|
| `FRONTEND.md` | Duplicaba 13 de sus 20 secciones con `frontend/CLAUDE.md` y traía una **tabla de credenciales E2E falsa**. Lo único y correcto se migró a `CLAUDE.md`; las credenciales tienen una sola fuente: `frontend/tests/e2e/fixtures/test-users.js` |
| `.claude-instructions.md` | Solapaba con `CLAUDE.md` e **inventaba una jerarquía numérica de roles** (Super Admin 100 / Owner 80 / … / Player 10) que no existe ni en `frontend/src/constants/roles.js` ni en `UserClubRole.php` |
| `.claude-context.md` | Estado congelado en feb-2026 ("82% completo") y, en L150-195, un **plan Capacitor ejecutable** (`npx cap init`, `npx cap add ios/android`) — una bomba para cualquier agente que lo leyera |
| `.claude-file-index.md` | ~25% de rutas muertas. El árbol vive en `CLAUDE.md` y lo demás se busca con Glob |
| `.claude-TESTING_GUIDE.md` | Describía 31 tests en 4 spec files y un CI de GitHub Actions **que no existen**; usuarios y contraseñas falsos |

**Amputaciones en lugar de archivado** (el resto del documento valía):
- `frontend/.claude/design-system.md` — se quitó la sección "Capacitor · Configuración"
  (`capacitor.config.ts` + `npm install @capacitor/*`) y se corrigió la cabecera: es el sistema de
  diseño **web**, no "web y móvil".
- `frontend/.claude/todos.md` — se quitó el bloque de la app móvil y se corrigió la cabecera
  "🚨 RONDA 0 (BLOCKER)": las suscripciones están hechas, y se hicieron **sin** el `ModuleGuard.jsx`
  que pedía el plan.
- `frontend/.claude/critical-files.md` — su tabla de guards listaba un **`ModuleGuard` que no existe**.

`frontend/CLAUDE.md` ganó lo que le faltaba: i18n (default inglés, EN/ES/PT, registro de namespaces
en `i18n/index.js`), Reverb/`echo.js` con la invalidación en `PrivateLayout.jsx`, Stripe como única
pasarela, build/rendimiento (react-snap, `lazyWithRetry`, `chunkErrorBoundary`) y dos reglas
operativas: push a `main` = deploy Netlify, y tests en local antes de pushear.
`frontend/README.md` era boilerplate de Vite: reescrito.

### `landing/` (1)
`LANDING-REFACTOR-PLAN.md` (mar-2026) — sus fases ya están en producción (next-intl, `[locale]` con
en/es/pt, ~18 páginas por idioma) y seguía pidiendo crear un `middleware.ts` que **Next 16 sustituyó
por `proxy.ts`**, que ya existe. `landing/README.md` reescrito con las rutas reales y el locale.

### La app React Native
No está aquí: se movió entera a **`desarrollo/_archivo-mobile-rn/`** (ver arriba, sección `mobile/`).
Antes de moverla se extrajo a `desarrollo/mobile_flutter/` lo que seguía vivo:
`specs/HALLAZGOS-HEREDADOS-RN.md` (5 hallazgos), `specs/contrato/CONTRATOS-MODULOS.md` (897 líneas de
contrato del backend) y `store-assets/`.

### `mobile_flutter/specs/_archivo/` (20) — cementerio propio del repo Flutter
No viven aquí porque `mobile_flutter/` es un repo git independiente. Son handoffs cerrados, planes
completados y el sistema visual v1/v2 que Miguel rechazó. Índice y, sobre todo, **la lista de lo que
NO se archivó y por qué**, en `mobile_flutter/specs/_archivo/README.md`.
