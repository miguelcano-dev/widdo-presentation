<!-- ARCHIVADO 13-ago-2026 — plan EJECUTADO y en produccion; se archiva para que sus 'checkboxes sin marcar' no se confundan con trabajo pendiente. Verificado contra el codigo. -->

# Start Script Test Modes Implementation Plan

> ## ✅ EJECUTADO — plan cerrado (archivado 13-ago-2026)
>
> Verificado: `Widdo/start.sh` existe con los tres modos (`./start.sh`, `--test`, `--e2e`) y
> su arnés `Widdo/tests/start-script-modes.test.sh`. Commits `ce69be6` (docs) y `b92272c`
> (feat) en el repo raíz de Widdo.
>
> **Los `- [ ]` de abajo NO son pendientes**: el plan nunca se fue marcando. No lo ejecutes.
>
> Diseño: `docs/superpowers/specs/2026-07-17-start-script-test-modes-design.md`.


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the root `start.sh` into one safe entry point for normal development, isolated PHPUnit, and curated Playwright smoke tests.

**Architecture:** Keep the current development path unchanged and add an explicit mode dispatcher. Test mode reuses the base Docker stack but forces `db_testing_b`; E2E mode uses the existing E2E compose service, verifies `db_e2e` at runtime, starts its own Vite process on 5174, runs only the smoke suite, and cleans up only that Vite process.

**Tech Stack:** Bash, Docker Compose, Laravel/PHPUnit, MySQL, Vite, Playwright, Node.js built-in test runner.

## Global Constraints

- Preserve the current `./start.sh` development behavior and ports.
- Never run PHPUnit against `db` or Playwright against the normal backend on 8010.
- Never include the quarantined legacy E2E suite implicitly.
- Never start a second MySQL container; reuse `saas_sport_db` and create isolated databases inside it.
- Do not stop shared Docker services after tests; only stop processes started directly by the selected mode.
- Propagate the real PHPUnit or Playwright exit status.
- Keep Widdo Academy out of scope while it remains on standby.

---

## Task 1: Add a testable command dispatcher

**Files:**

- Create: `/Users/miguelcano/Desktop/todo/Widdo/tests/start-script-modes.test.sh`
- Modify: `/Users/miguelcano/Desktop/todo/Widdo/start.sh`

- [ ] Add a Bash test harness that sources `start.sh`, verifies the default mode, `--test`, `--e2e`, `--help`, and rejects unknown or multiple mode arguments.

The harness must use temporary stub functions, fail on any unexpected return code, and finish with `All start.sh mode tests passed`.

- [ ] Run the new test and confirm it fails because the current script executes immediately when sourced:

```bash
cd /Users/miguelcano/Desktop/todo/Widdo
bash tests/start-script-modes.test.sh
```

- [ ] Refactor the existing body into `run_development_mode`, then add these public functions:

```bash
show_usage() {
    cat <<'USAGE'
Usage: ./start.sh [--test | --e2e | --help]

  no option  Start the normal development environment
  --test     Run PHPUnit inside Docker using db_testing_b
  --e2e      Run the curated Playwright smoke suite using db_e2e
USAGE
}

parse_mode() {
    [ "$#" -le 1 ] || return 64
    case "${1:-}" in
        "") printf '%s\n' development ;;
        --test) printf '%s\n' test ;;
        --e2e) printf '%s\n' e2e ;;
        --help|-h) printf '%s\n' help ;;
        *) return 64 ;;
    esac
}

dispatch_mode() {
    case "$1" in
        development) run_development_mode ;;
        test) run_backend_test_mode ;;
        e2e) run_e2e_mode ;;
        help) show_usage ;;
        *) return 64 ;;
    esac
}

main() {
    local mode
    if ! mode="$(parse_mode "$@")"; then
        show_usage >&2
        return 64
    fi
    dispatch_mode "$mode"
}

if [ "${BASH_SOURCE[0]}" = "$0" ]; then
    main "$@"
fi
```

Initially, `run_backend_test_mode` and `run_e2e_mode` may return 70 with a clear not-yet-implemented message so parsing can be tested independently.

- [ ] Run the harness again and verify it passes.

- [ ] Run `bash -n start.sh tests/start-script-modes.test.sh`.

---

## Task 2: Implement isolated PHPUnit mode

**Files:**

- Modify: `/Users/miguelcano/Desktop/todo/Widdo/start.sh`
- Modify: `/Users/miguelcano/Desktop/todo/Widdo/tests/start-script-modes.test.sh`

- [ ] Extend the shell harness with stubbed `docker` and `curl` commands. Assert that `--test` starts or reuses the base services, creates only an allowlisted database, and executes exactly:

```bash
docker compose exec -T \
  -e TEST_DB_DATABASE=db_testing_b \
  saas_sport_app php artisan test
```

Also assert that a fake test exit code such as 17 becomes the script exit code.

- [ ] Confirm the new assertions fail before implementation.

- [ ] Add a reusable database readiness function that reads credentials from the MySQL container environment instead of hardcoding them:

```bash
wait_for_mysql() {
    local attempts=60
    until (cd "$BACKEND_DIR" && docker compose exec -T saas_sport_db sh -lc \
        'mysqladmin ping -uroot -p"$MYSQL_ROOT_PASSWORD" --silent') >/dev/null 2>&1; do
        attempts=$((attempts - 1))
        [ "$attempts" -gt 0 ] || return 1
        sleep 1
    done
}
```

- [ ] Add `ensure_database` with a strict allowlist:

```bash
ensure_database() {
    local database="$1"
    case "$database" in
        db_testing|db_testing_b|db_e2e) ;;
        *) echo "Refusing unsafe database: $database" >&2; return 64 ;;
    esac

    (cd "$BACKEND_DIR" && docker compose exec -T \
        -e TARGET_TEST_DATABASE="$database" saas_sport_db sh -lc '
          mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e \
            "CREATE DATABASE IF NOT EXISTS \`$TARGET_TEST_DATABASE\`; GRANT ALL PRIVILEGES ON \`$TARGET_TEST_DATABASE\`.* TO '\''$MYSQL_USER'\''@'\''%'\''; FLUSH PRIVILEGES;"
        ')
}
```

- [ ] Implement `run_backend_test_mode` to check Docker, start the base `saas_sport_db` and `saas_sport_app` services if needed, wait for MySQL, ensure `db_testing_b`, and invoke PHPUnit with `TEST_DB_DATABASE=db_testing_b`.

- [ ] Run the shell harness, syntax check, and then the real mode:

```bash
cd /Users/miguelcano/Desktop/todo/Widdo
bash tests/start-script-modes.test.sh
bash -n start.sh tests/start-script-modes.test.sh
./start.sh --test
```

Expected: infrastructure connects only to `db_testing_b`; the command returns PHPUnit's genuine result. Existing application-test failures may remain visible but must not be masked as infrastructure success.

---

## Task 3: Make Playwright configurable without changing developer defaults

**Files:**

- Create: `/Users/miguelcano/Desktop/todo/Widdo/desarrollo/frontend/tests/config/playwright-environment.test.mjs`
- Modify: `/Users/miguelcano/Desktop/todo/Widdo/desarrollo/frontend/playwright.config.js`
- Modify: `/Users/miguelcano/Desktop/todo/Widdo/desarrollo/frontend/tests/e2e/smoke/login.smoke.spec.js`
- Modify: `/Users/miguelcano/Desktop/todo/Widdo/desarrollo/frontend/package.json`
- Modify: `/Users/miguelcano/Desktop/todo/Widdo/desarrollo/frontend/tests/e2e/README.md`

- [ ] Add a Node built-in test that imports the Playwright configuration twice and verifies:

  - Defaults remain frontend 5173 and backend 8010.
  - `PLAYWRIGHT_BASE_URL=http://localhost:5174` and `E2E_BACKEND_URL=http://localhost:8020` override both values.
  - The web-server command uses the port derived from the selected frontend URL.

- [ ] Add the package script:

```json
"test:config": "node --test tests/config/playwright-environment.test.mjs"
```

- [ ] Confirm `npm run test:config` fails before configuration changes.

- [ ] Parameterize `playwright.config.js`:

```js
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
const backendURL = process.env.E2E_BACKEND_URL || 'http://localhost:8010';
const frontendPort = new URL(baseURL).port || '5173';
```

Use `baseURL` in `use.baseURL`, `frontendPort` in the Vite command, and set `webServer.env.VITE_API_URL_ALIAS` to `backendURL`.

- [ ] Parameterize smoke credentials while preserving current defaults:

```js
const ownerEmail = process.env.E2E_OWNER_EMAIL || 'academy_owner@theacademycfl.com';
const ownerPassword = process.env.E2E_OWNER_PASSWORD || 'Password123!';
const organizerEmail = process.env.E2E_ORGANIZER_EMAIL || 'demo.organizer@widdo.co';
const organizerPassword = process.env.E2E_ORGANIZER_PASSWORD || 'Password123!';
```

- [ ] Document the four environment variables and state explicitly that `npm run test:e2e:smoke` is the curated suite while the legacy suite remains quarantined.

- [ ] Run:

```bash
cd /Users/miguelcano/Desktop/todo/Widdo/desarrollo/frontend
npm run test:config
npx playwright test --list tests/e2e/smoke
```

---

## Task 4: Implement safe E2E orchestration

**Files:**

- Modify: `/Users/miguelcano/Desktop/todo/Widdo/start.sh`
- Modify: `/Users/miguelcano/Desktop/todo/Widdo/tests/start-script-modes.test.sh`

- [ ] Extend the shell harness to prove these invariants:

  - E2E backend is started from `docker-compose.e2e.yml` on 8020.
  - Runtime database verification must equal `db_e2e`; any other value aborts before migrations or tests.
  - Seed order is `ProductionSeeder`, `ClubsRealisticsSeeder`, `E2EClubUsersSeeder`, then `TournamentDemoSeeder`.
  - Vite runs on 5174 with API URL 8020.
  - Only `npm run test:e2e:smoke` is invoked.
  - The exact Vite PID is terminated on normal completion, failure, and signal.
  - Docker services are left running.

- [ ] Confirm the assertions fail before implementation.

- [ ] Add constants for E2E ports, compose file, frontend PID, and URLs. Add helpers to start the E2E compose service, wait for `http://localhost:8020/api/health`, and verify the runtime database using Laravel:

```bash
verify_e2e_database() {
    local actual
    actual="$(cd "$BACKEND_DIR" && docker compose \
        -f docker-compose.yml -f docker-compose.e2e.yml exec -T saas_sport_e2e \
        php artisan tinker --execute='echo DB::connection()->getDatabaseName();' | tr -d '\r\n ')"
    [ "$actual" = "db_e2e" ] || {
        echo "Unsafe E2E database: expected db_e2e, got ${actual:-empty}" >&2
        return 1
    }
}
```

- [ ] Prepare deterministic E2E data only after the runtime guard succeeds:

```bash
php artisan migrate --force
php artisan db:seed --class=ProductionSeeder --force
php artisan db:seed --class=ClubsRealisticsSeeder --force
php artisan db:seed --class=E2EClubUsersSeeder --force
php artisan db:seed --class=TournamentDemoSeeder --force
```

Each command must execute inside `saas_sport_e2e` through the combined compose files.

- [ ] Start Vite directly from the frontend directory and capture `$!`; do not use a broad `pkill`:

```bash
VITE_API_URL_ALIAS=http://localhost:8020 \
  ./node_modules/.bin/vite --host 0.0.0.0 --port 5174 --strictPort &
E2E_FRONTEND_PID=$!
```

Reject an already occupied port 5174 before seeding or launching Vite. Install an E2E-specific trap that kills and waits for `E2E_FRONTEND_PID` only. Restore or exit cleanly after the smoke command.

- [ ] Invoke the curated suite with seeded credentials:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:5174 \
E2E_BACKEND_URL=http://localhost:8020 \
E2E_OWNER_EMAIL=director@bogotafc.co \
E2E_OWNER_PASSWORD=password123 \
E2E_ORGANIZER_EMAIL=demo.organizer@widdo.co \
E2E_ORGANIZER_PASSWORD='Password123!' \
npm run test:e2e:smoke
```

Capture the exit status, clean up Vite, and return that same status.

- [ ] Run the shell harness and syntax checks.

- [ ] Run the real E2E mode twice to prove idempotent migrations/seeders and cleanup:

```bash
cd /Users/miguelcano/Desktop/todo/Widdo
./start.sh --e2e
./start.sh --e2e
```

Expected: backend remains available on 8020, no Vite listener remains on 5174 after either run, and both runs execute only the five smoke tests.

---

## Task 5: Final regression verification and handoff

**Files:**

- Verify: `/Users/miguelcano/Desktop/todo/Widdo/start.sh`
- Verify: `/Users/miguelcano/Desktop/todo/Widdo/tests/start-script-modes.test.sh`
- Verify: `/Users/miguelcano/Desktop/todo/Widdo/desarrollo/frontend/playwright.config.js`
- Verify: `/Users/miguelcano/Desktop/todo/Widdo/desarrollo/frontend/tests/e2e/smoke/login.smoke.spec.js`

- [ ] Run all static and focused tests:

```bash
cd /Users/miguelcano/Desktop/todo/Widdo
bash -n start.sh tests/start-script-modes.test.sh
bash tests/start-script-modes.test.sh

cd /Users/miguelcano/Desktop/todo/Widdo/desarrollo/frontend
npm run test:config
npx playwright test --list tests/e2e/smoke
```

- [ ] Verify each real entry point:

```bash
cd /Users/miguelcano/Desktop/todo/Widdo
./start.sh --help
./start.sh --test
./start.sh --e2e
```

- [ ] Start normal development once and confirm the existing services remain on backend 8010 and frontend 5173. Stop it with Ctrl+C and confirm its existing cleanup prompt still behaves as before.

- [ ] Inspect listeners and Docker state to confirm there is no orphan Vite process on 5174 and the E2E container still targets `db_e2e`.

- [ ] Run `git diff --check` independently in the root, backend, and frontend repositories and review the final diffs without staging unrelated existing work.

- [ ] Report separately:

  - Automation/infrastructure tests that pass.
  - PHPUnit application failures, if any, with their real count.
  - Playwright smoke result.
  - Confirmation that normal development behavior was preserved.
