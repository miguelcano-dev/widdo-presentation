# Plan: Reparar E2E legacy del vertical CLUBES

> **Para el agente que tome esto:** los flows E2E de clubes (Playwright) quedaron
> obsoletos tras rediseños de UI. La causa sistémica (contraseñas) ya fue
> corregida el 10-jul; quedan ~8 fallos de selectores viejos + 1 usuario
> faltante. Los flows de TORNEOS (organizer/public) están verdes — NO tocarlos.
>
> Contexto: `cd desarrollo/frontend`. Backend Docker arriba (:8010).
> Correr un flow: `npx playwright test tests/e2e/flows/<archivo> --project=chromium --reporter=list`
> Si un login falla: borrar sesiones cacheadas `rm tests/e2e/.auth/*.json`.

## Estado actual (16-jul-2026 — REPARADO, salvo registro)

| Flow | Estado | Notas |
|---|---|---|
| owner-complete-flow | ✅ 14/14 | fix: data-testid en grid/empty-state de Categorías |
| trainer-complete-flow | ✅ 8/8 | fix: selector Mi Perfil → `[data-testid="account-settings-page"]` |
| player-complete-flow | ✅ 8/8 | idem Mi Perfil |
| parent-complete-flow | ✅ 10/10 | idem Mi Perfil |
| referral-flow | ✅ 11/11 | fix: import fixture + logout real + acotar a roles de club |
| public-enrollment-demo | ✅ | — |
| organizer-tournament-flow | ✅ 5/5 | NO TOCAR |
| public-registration-flow | ✅ 7/7 | NO TOCAR |
| new-user-registration-flow | ✅ **2/2** | reescrito: wizard 4 pasos + verificación por código (Mailpit) |

### Fix estructural aplicado (raíz del problema de datos)
- **La BD dev (`db`) se había vaciado** (0 usuarios). Restaurada con `php artisan db:seed`.
- **`E2EClubUsersSeeder.php`** creado: garantiza los 6 usuarios del fixture con
  `password123`/ACT/verificado, idempotente, bloqueado en prod. Player/parent se
  "adoptan" de un menor sembrado (los emails del seed realista son `rand()` y
  drifteaban). Correr: `php artisan db:seed --class=E2EClubUsersSeeder`.
- **`referral-flow.spec.js`** ahora importa `TEST_USERS` del fixture compartido
  (antes hardcodeaba emails que ya no existían).

### Hallazgo de producto para revisar (NO es bug de test)
- La ruta `/home/referrals` y sus componentes existen y funcionan, pero
  **`src/layouts/MenuList.jsx` NO tiene enlace a "Referidos"** para ningún rol.
  El test lo advierte (`⚠️ ... not found in nav`) pero no falla. Decidir si el
  menú debe exponerse o si es intencional (soft-launch).

## new-user-registration-flow — REESCRITO ✅

Reescrito para el flujo real: wizard de 4 pasos + verificación por código.
2 tests: (1) landing→register, (2) wizard completo → `/verificar-email` → leer
código de 6 dígitos de Mailpit (:8026) → verificar → `/onboarding`.

Selectores del wizard (por si se rediseña de nuevo):
- Paso 1: `input[name=email|password|password_confirmation]`, `#termsAccepted`.
- Paso 2: `input[name=name|lastname]`, fecha `input[placeholder="dd/mm/aaaa"]` (máscara, tipeable).
- Paso 3: `input[name=telephone|document_number|residential_address|neighborhood]`,
  ciudad nacimiento `input[placeholder="Escribe tu ciudad de nacimiento..."]`,
  ciudad residencia `input[placeholder="Escribe tu ciudad de residencia..."]`.
  **El select de tipo de documento (react-select `[class*="-control"]`) solo
  aparece DESPUÉS de elegir la ciudad de nacimiento** (depende de su país).
- Paso 4: botón de tipo de club, luego `button[type="submit"]`.
- Verificación: `POST /api/register` NO crea usuario (manda código,
  `requires_verification:true`); `/verificar-email` toma el email de
  `location.state` (por eso registro+verificación van en el MISMO test); 6 inputs
  auto-avanzan; `POST /api/verify-email` crea el usuario → `/onboarding`.

## Causa raíz ya corregida (contexto, no repetir)

Las contraseñas de los usuarios de prueba en la BD local no coincidían con
`tests/e2e/fixtures/test-users.js` (usa `password123`). El 10-jul se resetearon
via tinker para director/diego.sanchez/alejandro.alvarez10/contador @bogotafc.

## Tareas

### 1. [ ] Seeder de usuarios E2E (fix estructural de las contraseñas)
Crear `saas_sport/database/seeders/E2EClubUsersSeeder.php` que garantice
(firstOrCreate + update de password) los usuarios de `test-users.js` con
`password123`, `status=ACT`, `email_verified_at` seteado, y sus roles/clubes.
Espejo del patrón `TournamentDemoSeeder` (re-ejecutable, bloqueado en prod).
Luego, en cada flow legacy, agregar en `beforeAll` la ejecución del seeder
(patrón exacto en `organizer-tournament-flow.spec.js::reseedDemoTournaments`).
Así los E2E dejan de depender del estado manual de la BD.

### 2. [ ] Mi Perfil rediseñado — 3 tests con el mismo selector muerto
La página `/home/my-profile` ahora son tarjetas de solo-lectura ("Datos
personales", "Contacto", "Ajustes de cuenta") — NO hay `input`/`form` visibles
(evidencia: screenshot `test-results/flows-trainer-*/test-failed-1.png`).
Reemplazar la aserción `locator('input, form').first().isVisible()` por
contenido real (p.ej. `getByText('Datos personales')` o el nombre del usuario) en:
- `trainer-complete-flow.spec.js` paso "6. Mi Perfil" (~línea 133)
- `player-complete-flow.spec.js` paso "2. Mi Perfil"
- `parent-complete-flow.spec.js` paso "7. Mi Perfil"

### 3. [ ] Owner paso 8 — Categorías
Espera `locator('table, [data-testid="empty-state"]')` visible en
`/home/categories` (owner-complete-flow.spec.js:~242). Abrir el screenshot del
fallo y la página real: o la vista pasó a cards (ajustar selector a contenido)
o el empty-state perdió el `data-testid` (si es así, AGREGARLO en el componente
es mejor fix que aflojar el test).

### 4. [ ] Referral flow (~4 tests)
`referral-flow.spec.js`: "menu item visible for all roles", "can access
referrals page", "navigate between tabs". Diagnóstico probable: el menú
Referidos quedó detrás del sistema de módulos/plan o cambió de nombre/sección
en `MenuList.jsx`. Investigar primero SI la feature sigue expuesta para el plan
trial del club de prueba:
- Si es gating de módulo → el test debe preparar el módulo (seeder/override) o
  testear solo roles/planes que lo tienen.
- Si cambió el selector → actualizarlo.
NO aflojar el test si la feature realmente desapareció del plan: eso sería
ocultar una regresión de producto — reportarlo.

### 5. [ ] Usuario parent faltante
`test-users.js` referencia `luzm@h.com` (club 7) que NO existe en BD local.
Incluirlo en el seeder de la tarea 1 (crear user + rol parent en un club con
hijo vinculado — mirar `MultiRoleUserSeeder` como referencia de relaciones
parent/child) o actualizar el fixture a un parent real y documentarlo.

### 6. [ ] new-user-registration-flow — verificar
No se corrió en la última tanda. Requiere Mailpit (helper `mailhog.js` ya
apunta a :8026). Correrlo; si falla por selectores de registro/onboarding
rediseñados, mismo tratamiento que tarea 2.

### 7. [ ] Corrida final completa
`npx playwright test tests/e2e/flows/ --project=chromium --reporter=list`
Meta: 0 fallos (47+ tests). Los flows de torneos re-siembran su propia data;
no interfieren.

## Gotchas aprendidos (ahórrate los tropiezos)

- **Strict mode**: los toasts de Radix duplican el texto en la región aria-live
  → usar `.first()`. El banner de cookies también expone `role="dialog"` →
  filtrar por nombre. (Ambos ya resueltos en los flows de torneos — copiar patrón.)
- **Banner de cookies** tapa botones en móvil: `click('button:has-text("Aceptar")')`
  con try/catch al inicio (helper `dismissCookies` en public-registration-flow).
- La UI corre en ESPAÑOL por defecto en local → regex bilingües `/pending|pendientes/i`.
- Tests que consumen estado (aprobar, registrar) deben re-sembrar en `beforeAll`.
- NO commits/push — todo queda en working tree (regla del repo).
- Si corres tests de BACKEND en paralelo con otra sesión: `-e TEST_DB_DATABASE=db_testing_b`.
