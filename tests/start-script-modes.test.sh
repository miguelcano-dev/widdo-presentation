#!/usr/bin/env bash

set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
START_SCRIPT="$ROOT_DIR/start.sh"

fail() {
    echo "FAIL: $*" >&2
    exit 1
}

assert_eq() {
    local expected="$1"
    local actual="$2"
    local message="$3"
    [ "$expected" = "$actual" ] || fail "$message (expected '$expected', got '$actual')"
}

grep -Fq 'if [ "${BASH_SOURCE[0]}" = "$0" ]; then' "$START_SCRIPT" || \
    fail "start.sh must be safe to source"
grep -Fq -- '--strictPort' "$START_SCRIPT" || \
    fail "the E2E frontend must refuse an occupied port"

# shellcheck source=/dev/null
source "$START_SCRIPT"

assert_eq development "$(parse_mode)" "no option selects development"
assert_eq test "$(parse_mode --test)" "--test selects PHPUnit mode"
assert_eq e2e "$(parse_mode --e2e)" "--e2e selects Playwright mode"
assert_eq help "$(parse_mode --help)" "--help selects help"

parse_mode --unknown >/dev/null 2>&1 && fail "unknown options must fail"
parse_mode --test --e2e >/dev/null 2>&1 && fail "multiple modes must fail"

(
    CALLED=""
    run_development_mode() { CALLED="development"; }
    run_backend_test_mode() { CALLED="test"; }
    run_e2e_mode() { CALLED="e2e"; }
    show_usage() { CALLED="help"; }

    dispatch_mode development
    assert_eq development "$CALLED" "development dispatch"
    dispatch_mode test
    assert_eq test "$CALLED" "test dispatch"
    dispatch_mode e2e
    assert_eq e2e "$CALLED" "e2e dispatch"
    dispatch_mode help
    assert_eq help "$CALLED" "help dispatch"
) || exit $?

DOCKER_LOG="$(mktemp)"
trap 'rm -f "$DOCKER_LOG"' EXIT

docker() {
    printf '%s\n' "$*" >> "$DOCKER_LOG"
    if [ "$*" = "compose exec -T -e TEST_DB_DATABASE=db_testing_b saas_sport_app php artisan test" ]; then
        return 17
    fi
    if [[ "$*" = *"TARGET_TEST_DATABASE=db_testing_b"* ]] && \
       [[ "$*" != *'"$MYSQL_ROOT_PASSWORD" "$MYSQL_PASSWORD"'* ]]; then
        return 23
    fi
    return 0
}

run_backend_test_mode >/dev/null 2>&1
test_status=$?
assert_eq 17 "$test_status" "--test propagates the PHPUnit exit code"
grep -Fq "compose up -d saas_sport_db saas_sport_app" "$DOCKER_LOG" || \
    fail "--test must ensure the base database and application services"
grep -Fq "compose exec -T -e TEST_DB_DATABASE=db_testing_b saas_sport_app php artisan test" "$DOCKER_LOG" || \
    fail "--test must force db_testing_b"

(
    E2E_LOG="$(mktemp)"
    trap 'rm -f "$E2E_LOG"' EXIT

    start_e2e_database() { echo "database-service" >> "$E2E_LOG"; }
    ensure_database() { echo "database:$1" >> "$E2E_LOG"; }
    start_e2e_backend() { echo "backend" >> "$E2E_LOG"; }
    wait_for_e2e_backend() { echo "health" >> "$E2E_LOG"; }
    verify_e2e_database() { echo "verify" >> "$E2E_LOG"; }
    prepare_e2e_database() { echo "seed" >> "$E2E_LOG"; }
    ensure_e2e_frontend_port_available() { echo "port" >> "$E2E_LOG"; }
    start_e2e_frontend() { echo "frontend" >> "$E2E_LOG"; E2E_FRONTEND_PID=4242; }
    wait_for_e2e_frontend() { echo "frontend-health" >> "$E2E_LOG"; }
    run_e2e_smoke() { echo "smoke" >> "$E2E_LOG"; return 19; }
    cleanup_e2e_frontend() { echo "cleanup:$E2E_FRONTEND_PID" >> "$E2E_LOG"; }

    run_e2e_mode >/dev/null 2>&1
    e2e_status=$?
    assert_eq 19 "$e2e_status" "--e2e propagates the Playwright exit code"
    assert_eq "$(cat <<'EXPECTED'
database-service
database:db_e2e
backend
health
verify
port
seed
frontend
frontend-health
smoke
cleanup:4242
EXPECTED
)" "$(cat "$E2E_LOG")" "--e2e runs guarded setup and cleanup in order"
) || exit $?

(
    e2e_compose() { printf 'db\n'; }
    if verify_e2e_database >/dev/null 2>&1; then
        fail "--e2e must reject a runtime database other than db_e2e"
    fi
) || exit $?

(
    ARTISAN_LOG="$(mktemp)"
    trap 'rm -f "$ARTISAN_LOG"' EXIT
    e2e_artisan() { printf '%s\n' "$*" >> "$ARTISAN_LOG"; }

    prepare_e2e_database
    assert_eq "$(cat <<'EXPECTED'
migrate --force
db:seed --class=ProductionSeeder --force
db:seed --class=ClubsRealisticsSeeder --force
db:seed --class=E2EClubUsersSeeder --force
db:seed --class=TournamentDemoSeeder --force
EXPECTED
)" "$(cat "$ARTISAN_LOG")" "--e2e seeds base clubs before fixture users"
) || exit $?

echo "All start.sh mode tests passed"
