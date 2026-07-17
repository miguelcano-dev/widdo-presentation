# Widdo Start Script Test Modes Design

**Date:** 2026-07-17

## Goal

Extend the root `start.sh` so one command can run normal development, the isolated Laravel test suite, or the safe browser E2E suite without touching the development database.

## Scope

The script will support exactly three public modes:

```bash
./start.sh
./start.sh --test
./start.sh --e2e
```

AI tests, real Stripe tests, interactive Playwright UI, automatic selection based on changed files, and deployment CI are outside this change.

## Mode: Development

`./start.sh` preserves the current behavior:

- Reuse or start the base Docker Compose services.
- Serve Laravel at `http://localhost:8010` against `db`.
- Start the Stripe listener only when the CLI and a configured test secret are available.
- Start Vite at `http://localhost:5173` against the development API.
- Keep running until interrupted.

No existing development URL or credential behavior changes in this mode.

## Mode: Backend Tests

`./start.sh --test` will:

1. Verify Docker, Docker Compose, and the backend directory.
2. Reuse or start `saas_sport_db` and `saas_sport_app`.
3. Wait for MySQL to become healthy.
4. Execute PHPUnit inside `saas_sport_app` with `TEST_DB_DATABASE=db_testing_b`.
5. Avoid starting Vite, Stripe, Reverb, or an additional MySQL service solely for the test command.
6. Exit with the exact PHPUnit exit code.

`phpunit.xml`, `tests/TestCase.php`, and `tests/CreatesApplication.php` remain the safety locks that force the isolated test database. The script must never execute PHPUnit against `db`.

## Mode: Safe E2E

`./start.sh --e2e` will orchestrate the full safe browser-test lifecycle:

1. Reuse the existing MySQL service.
2. Start or reuse `saas_sport_e2e` with `docker-compose.yml` plus `docker-compose.e2e.yml`.
3. Wait for `http://localhost:8020/api/health`.
4. Ask Laravel which database is active and abort unless the exact answer is `db_e2e`.
5. Run migrations and deterministic E2E seeders inside `saas_sport_e2e`.
6. Start Vite at `http://localhost:5174` with `VITE_API_URL_ALIAS=http://localhost:8020`.
7. Wait for the E2E frontend to respond.
8. Run the curated Playwright smoke suite automatically.
9. Preserve Playwright reports, screenshots, traces, and videos.
10. Stop only the Vite E2E process started by this invocation.
11. Leave Docker services running for inspection and return Playwright's exit code.

The default E2E suite will not invoke real LLM calls, live Stripe calls, destructive production operations, or the quarantined legacy Playwright suite.

## Deterministic E2E Data

Before Playwright starts, the E2E backend will run the production-safe base seeding followed by the test-specific seeders required by the curated smoke suite. At minimum, the isolated database must contain:

- A known club owner from `E2EClubUsersSeeder`.
- The demo organizer from `TournamentDemoSeeder`.
- The catalog and subscription data required for login and navigation.

Seed commands are permitted only after the runtime database-name guard confirms `db_e2e`.

## Playwright Configuration

The Playwright configuration will accept environment variables while preserving existing defaults:

```text
PLAYWRIGHT_BASE_URL=http://localhost:5174
E2E_BACKEND_URL=http://localhost:8020
```

The curated smoke test will read credentials from environment variables with deterministic E2E defaults. It will not depend on users that exist only in the developer's `db` database.

The `webServer` configuration will use the supplied base URL and reuse the Vite process already started by `start.sh --e2e`.

## Process and Signal Handling

The script will track development and E2E frontend PIDs separately. Cleanup rules are mode-aware:

- Development mode retains the existing interactive shutdown behavior.
- Test mode has no long-running child process and exits after PHPUnit.
- E2E mode always stops its own Vite child process on success, failure, `SIGINT`, or `SIGTERM`.
- No test mode automatically runs `docker compose down`.

An error in dependency checks, health checks, database isolation, migrations, seeding, frontend startup, or Playwright must produce a non-zero exit status.

## Test Strategy

A shell-level regression test will verify argument parsing and orchestration without calling real Docker or npm. Commands will be intercepted through temporary fake executables placed first in `PATH`.

Required cases:

- No argument selects development mode.
- `--test` invokes PHPUnit with `TEST_DB_DATABASE=db_testing_b` and returns its status.
- `--e2e` uses both Compose files, verifies `db_e2e`, starts Vite on 5174, and runs only the curated smoke suite.
- An unknown option exits non-zero and prints usage.
- A database name other than `db_e2e` aborts before migrations or seeders.
- E2E cleanup stops only the Vite process created by the script.

After the shell tests pass, verification will run:

```bash
bash -n start.sh
./start.sh --test
./start.sh --e2e
```

The full commands are considered successful only when they connect to the intended isolated databases and return the underlying test runner's status.

## Acceptance Criteria

- Development behavior remains compatible with the current command.
- Backend tests never use `db`.
- Browser tests never use port 8010 or `db`.
- No additional MySQL container is created.
- `--test` and `--e2e` require one terminal command each.
- E2E failures leave artifacts and return a failing exit code.
- AI and real Stripe tests do not run implicitly.
