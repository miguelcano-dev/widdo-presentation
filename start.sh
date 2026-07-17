#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directorios
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/desarrollo/saas_sport"
FRONTEND_DIR="$SCRIPT_DIR/desarrollo/frontend"

# Puertos configurados en Docker
BACKEND_PORT=8010
FRONTEND_PORT=5173
DB_PORT=3307
MAILPIT_UI_PORT=8026
E2E_BACKEND_PORT=8020
E2E_FRONTEND_PORT=5174
E2E_BACKEND_URL="http://localhost:$E2E_BACKEND_PORT"
E2E_FRONTEND_URL="http://localhost:$E2E_FRONTEND_PORT"

# PID del frontend
FRONTEND_PID=""

# PID del Stripe CLI listener (webhooks → localhost)
STRIPE_LISTENER_PID=""
E2E_FRONTEND_PID=""

# Función para limpiar al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}Deteniendo servicios...${NC}"

    # Detener frontend
    if [ -n "$FRONTEND_PID" ] && kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✓ Frontend detenido${NC}"
    fi

    # Matar procesos hijos de vite
    pkill -f "vite" 2>/dev/null

    # Detener Stripe listener
    if [ -n "$STRIPE_LISTENER_PID" ] && kill -0 $STRIPE_LISTENER_PID 2>/dev/null; then
        kill $STRIPE_LISTENER_PID 2>/dev/null
        echo -e "${GREEN}✓ Stripe listener detenido${NC}"
    fi
    pkill -f "stripe listen" 2>/dev/null

    # Preguntar si detener Docker
    echo ""
    echo -e "${YELLOW}¿Detener Docker (backend + base de datos)? (s/n)${NC}"
    read -t 10 -n 1 response
    echo ""

    if [ "$response" = "s" ] || [ "$response" = "S" ]; then
        cd "$BACKEND_DIR"
        docker compose down
        echo -e "${GREEN}✓ Docker detenido${NC}"
    else
        echo -e "${CYAN}Docker sigue corriendo en segundo plano${NC}"
    fi

    echo -e "${GREEN}¡Hasta pronto!${NC}"
    exit 0
}

# Función para mostrar banner
show_banner() {
    clear
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}                  ${GREEN}WIDDO - Sports SaaS${NC}                      ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}        ${YELLOW}Backend (Laravel + Docker) + Frontend (React)${NC}     ${CYAN}║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Función para verificar dependencias
check_dependencies() {
    echo -e "${BLUE}Verificando dependencias...${NC}"
    local errors=0

    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}✗ Docker no está instalado${NC}"
        errors=$((errors + 1))
    else
        echo -e "${GREEN}✓ Docker${NC}"
    fi

    # Verificar Docker Compose
    if ! docker compose version &> /dev/null; then
        echo -e "${RED}✗ Docker Compose no está disponible${NC}"
        errors=$((errors + 1))
    else
        echo -e "${GREEN}✓ Docker Compose${NC}"
    fi

    # Verificar Node/npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}✗ npm no está instalado${NC}"
        errors=$((errors + 1))
    else
        echo -e "${GREEN}✓ npm${NC}"
    fi

    # Verificar directorios
    if [ ! -d "$BACKEND_DIR" ]; then
        echo -e "${RED}✗ Directorio Backend no encontrado: $BACKEND_DIR${NC}"
        errors=$((errors + 1))
    else
        echo -e "${GREEN}✓ Backend directory${NC}"
    fi

    if [ ! -d "$FRONTEND_DIR" ]; then
        echo -e "${RED}✗ Directorio Frontend no encontrado: $FRONTEND_DIR${NC}"
        errors=$((errors + 1))
    else
        echo -e "${GREEN}✓ Frontend directory${NC}"
    fi

    if [ $errors -gt 0 ]; then
        echo ""
        echo -e "${RED}Error: Faltan $errors dependencias${NC}"
        exit 1
    fi

    echo -e "${GREEN}Todas las dependencias OK${NC}"
}

# Función para verificar si Docker está corriendo
check_docker_running() {
    if ! docker info &> /dev/null; then
        echo -e "${RED}Error: Docker no está corriendo. Por favor inicia Docker Desktop.${NC}"
        exit 1
    fi
}

# Función para iniciar el backend con Docker
start_backend() {
    echo ""
    echo -e "${BLUE}Iniciando Backend (Docker)...${NC}"

    cd "$BACKEND_DIR"

    # Verificar si ya está corriendo
    if docker compose ps --format json 2>/dev/null | grep -q '"State":"running"'; then
        echo -e "${YELLOW}Backend ya está corriendo${NC}"
        # Verificar si la app está caída (Exited) y solo levantar lo necesario
        if docker compose ps --format json 2>/dev/null | grep -q '"State":"exited"'; then
            echo -e "${YELLOW}Algunos servicios están caídos, levantándolos...${NC}"
            docker compose up -d
        fi
    else
        docker compose up -d
    fi

    # Esperar a que MySQL acepte conexiones
    echo -e "${YELLOW}Esperando a que MySQL esté listo...${NC}"

    local max_db_attempts=30
    local db_attempt=0

    while [ $db_attempt -lt $max_db_attempts ]; do
        if docker compose exec -T saas_sport_db mysqladmin ping -h localhost -uroot -ppassword 2>/dev/null | grep -q "alive"; then
            echo ""
            echo -e "${GREEN}✓ MySQL listo${NC}"
            break
        fi
        db_attempt=$((db_attempt + 1))
        echo -n "."
        sleep 2
    done

    if [ $db_attempt -ge $max_db_attempts ]; then
        echo ""
        echo -e "${RED}Error: MySQL no respondió a tiempo${NC}"
        echo -e "${YELLOW}Revisa los logs con: docker compose logs saas_sport_db${NC}"
        return 1
    fi

    # Esperar a que la API esté lista (migraciones, seeders, nginx)
    echo -e "${YELLOW}Esperando a que la API esté lista...${NC}"

    local max_attempts=45
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT/api/health 2>/dev/null)
        if [ "$http_code" = "200" ] || [ "$http_code" = "401" ]; then
            echo ""
            echo -e "${GREEN}✓ Backend listo${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 3
    done

    echo ""
    echo -e "${RED}Error: Backend no respondió a tiempo${NC}"
    echo -e "${YELLOW}Revisa los logs con: docker compose logs -f saas_sport_app${NC}"
    return 1
}

# Función para iniciar el frontend
start_frontend() {
    echo ""
    echo -e "${BLUE}Iniciando Frontend (React + Vite)...${NC}"

    cd "$FRONTEND_DIR"

    # Verificar si hay node_modules
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Instalando dependencias del frontend...${NC}"
        npm install
    fi

    # Iniciar en el puerto especificado
    npm run dev -- --port $FRONTEND_PORT &
    FRONTEND_PID=$!

    # Esperar a que inicie
    sleep 3

    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}Error: Frontend no pudo iniciar${NC}"
        return 1
    fi

    echo -e "${GREEN}✓ Frontend iniciado (PID: $FRONTEND_PID)${NC}"
    return 0
}

# Función para iniciar el Stripe CLI listener (webhooks → localhost)
# Solo necesario para PROBAR pagos/suscripciones Stripe en local.
# Se omite de forma silenciosa si no está el CLI o no hay STRIPE_SECRET en .env,
# así el arranque nunca se rompe para desarrollo general.
start_stripe_listener() {
    echo ""

    # ¿Está instalado el Stripe CLI?
    if ! command -v stripe &> /dev/null; then
        echo -e "${YELLOW}⊘ Stripe CLI no instalado — listener de webhooks omitido${NC}"
        echo -e "${YELLOW}  (para pagos Stripe en local: brew install stripe/stripe-cli/stripe)${NC}"
        return 0
    fi

    # ¿Hay una key de Stripe en el .env del backend?
    local sk
    sk=$(grep -E "^STRIPE_SECRET=" "$BACKEND_DIR/.env" 2>/dev/null | cut -d= -f2- | tr -d "\"'\r")
    if [ -z "$sk" ]; then
        echo -e "${YELLOW}⊘ STRIPE_SECRET no configurado en .env — Stripe listener omitido${NC}"
        return 0
    fi

    echo -e "${BLUE}Iniciando Stripe CLI listener (webhooks → localhost)...${NC}"

    # Evitar listeners duplicados de sesiones previas
    pkill -f "stripe listen" 2>/dev/null
    sleep 1

    stripe listen --api-key "$sk" \
        --forward-to "localhost:$BACKEND_PORT/api/webhooks/stripe" \
        > /tmp/widdo-stripe-listen.log 2>&1 &
    STRIPE_LISTENER_PID=$!

    sleep 2
    if kill -0 $STRIPE_LISTENER_PID 2>/dev/null; then
        echo -e "${GREEN}✓ Stripe listener corriendo (PID: $STRIPE_LISTENER_PID)${NC}"
    else
        echo -e "${YELLOW}⊘ Stripe listener no arrancó (ver /tmp/widdo-stripe-listen.log)${NC}"
        STRIPE_LISTENER_PID=""
    fi
    return 0
}

# Función para mostrar información de servicios
show_services_info() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}             Servicios corriendo correctamente              ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}Frontend:${NC}     http://localhost:$FRONTEND_PORT"
    echo -e "  ${CYAN}Backend API:${NC}  http://localhost:$BACKEND_PORT"
    echo -e "  ${CYAN}Mailpit UI:${NC}   http://localhost:$MAILPIT_UI_PORT"
    echo -e "  ${CYAN}MySQL:${NC}        localhost:$DB_PORT"
    if [ -n "$STRIPE_LISTENER_PID" ]; then
        echo -e "  ${CYAN}Stripe webhooks:${NC} listener activo → /api/webhooks/stripe (log: /tmp/widdo-stripe-listen.log)"
    fi
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  Credenciales de prueba:${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${CYAN}Super Admin:${NC}  admin@sportsclub.co / admin123"
    echo -e "  ${CYAN}Club Owner:${NC}   director@bogotafc.co / password123"
    echo ""
    echo -e "${YELLOW}Presiona Ctrl+C para detener los servicios${NC}"
    echo ""
}

# Desarrollo normal: conserva el comportamiento histórico del script.
run_development_mode() {
    trap cleanup SIGINT SIGTERM
    show_banner
    check_docker_running
    check_dependencies

    # Iniciar backend
    start_backend
    if [ $? -ne 0 ]; then
        echo -e "${RED}Fallo al iniciar el backend${NC}"
        exit 1
    fi

    # Iniciar Stripe listener (opcional, para probar pagos en local)
    start_stripe_listener

    # Iniciar frontend
    start_frontend
    if [ $? -ne 0 ]; then
        echo -e "${RED}Fallo al iniciar el frontend${NC}"
        cleanup
        exit 1
    fi

    # Mostrar info
    show_services_info

    # Mantener el script corriendo - loop infinito que verifica si el frontend sigue vivo
    while true; do
        # Verificar si el proceso del frontend sigue corriendo
        if ! kill -0 $FRONTEND_PID 2>/dev/null; then
            echo ""
            echo -e "${YELLOW}El frontend se detuvo. Reiniciando...${NC}"
            start_frontend
            if [ $? -ne 0 ]; then
                echo -e "${RED}No se pudo reiniciar el frontend${NC}"
                cleanup
                exit 1
            fi
        fi
        sleep 5
    done
}

wait_for_mysql() {
    local attempts=60
    until (cd "$BACKEND_DIR" && docker compose exec -T saas_sport_db sh -lc \
        'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -Nse "SELECT 1"') >/dev/null 2>&1; do
        attempts=$((attempts - 1))
        if [ "$attempts" -le 0 ]; then
            echo -e "${RED}Error: MySQL no respondió a tiempo${NC}" >&2
            return 1
        fi
        sleep 1
    done
}

ensure_database() {
    local database="$1"
    case "$database" in
        db_testing|db_testing_b|db_e2e) ;;
        *)
            echo -e "${RED}Base de datos no permitida: $database${NC}" >&2
            return 64
            ;;
    esac

    (cd "$BACKEND_DIR" && docker compose exec -T \
        -e TARGET_TEST_DATABASE="$database" saas_sport_db sh -lc '
          if mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$TARGET_TEST_DATABASE" -Nse "SELECT 1" >/dev/null 2>&1; then
            exit 0
          fi

          for root_password in "$MYSQL_ROOT_PASSWORD" "$MYSQL_PASSWORD"; do
            if mysql -uroot -p"$root_password" -e \
              "CREATE DATABASE IF NOT EXISTS \`$TARGET_TEST_DATABASE\`; GRANT ALL PRIVILEGES ON \`$TARGET_TEST_DATABASE\`.* TO \`$MYSQL_USER\`@\`%\`; FLUSH PRIVILEGES;"; then
              exit 0
            fi
          done

          echo "No fue posible crear $TARGET_TEST_DATABASE con las credenciales locales de MySQL" >&2
          exit 1
        ')
}

run_backend_test_mode() {
    echo -e "${BLUE}Ejecutando PHPUnit con db_testing_b...${NC}"

    command -v docker >/dev/null 2>&1 || {
        echo -e "${RED}Docker no está instalado${NC}" >&2
        return 1
    }
    docker info >/dev/null 2>&1 || {
        echo -e "${RED}Docker no está corriendo${NC}" >&2
        return 1
    }

    (cd "$BACKEND_DIR" && docker compose up -d saas_sport_db saas_sport_app) || return $?
    wait_for_mysql || return $?
    ensure_database db_testing_b || return $?

    (cd "$BACKEND_DIR" && docker compose exec -T \
        -e TEST_DB_DATABASE=db_testing_b \
        saas_sport_app php artisan test)
}

e2e_compose() {
    (cd "$BACKEND_DIR" && docker compose \
        -f docker-compose.yml -f docker-compose.e2e.yml "$@")
}

start_e2e_database() {
    e2e_compose up -d saas_sport_db || return $?
    wait_for_mysql
}

start_e2e_backend() {
    e2e_compose up -d saas_sport_e2e
}

wait_for_url() {
    local url="$1"
    local label="$2"
    local attempts=60

    until curl -fsS "$url" >/dev/null 2>&1; do
        attempts=$((attempts - 1))
        if [ "$attempts" -le 0 ]; then
            echo -e "${RED}$label no respondió en $url${NC}" >&2
            return 1
        fi
        sleep 1
    done
}

wait_for_e2e_backend() {
    wait_for_url "$E2E_BACKEND_URL/api/health" "Backend E2E"
}

verify_e2e_database() {
    local actual
    actual="$(e2e_compose exec -T saas_sport_e2e php artisan tinker \
        --execute='echo DB::connection()->getDatabaseName();' 2>/dev/null | tr -d '\r\n ')"

    if [ "$actual" != "db_e2e" ]; then
        echo -e "${RED}Base E2E insegura: se esperaba db_e2e y se obtuvo ${actual:-vacío}${NC}" >&2
        return 1
    fi
}

e2e_artisan() {
    e2e_compose exec -T saas_sport_e2e php artisan "$@"
}

prepare_e2e_database() {
    e2e_artisan migrate --force || return $?
    e2e_artisan db:seed --class=ProductionSeeder --force || return $?
    e2e_artisan db:seed --class=ClubsRealisticsSeeder --force || return $?
    e2e_artisan db:seed --class=E2EClubUsersSeeder --force || return $?
    e2e_artisan db:seed --class=TournamentDemoSeeder --force
}

ensure_e2e_frontend_port_available() {
    if command -v lsof >/dev/null 2>&1 && \
       lsof -nP -iTCP:"$E2E_FRONTEND_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
        echo -e "${RED}El puerto $E2E_FRONTEND_PORT ya está ocupado; no se reutilizará un frontend ajeno${NC}" >&2
        return 1
    fi
}

start_e2e_frontend() {
    if [ ! -x "$FRONTEND_DIR/node_modules/.bin/vite" ]; then
        echo -e "${YELLOW}Instalando dependencias del frontend...${NC}"
        (cd "$FRONTEND_DIR" && npm install) || return $?
    fi

    (
        cd "$FRONTEND_DIR" || exit 1
        exec env VITE_API_URL_ALIAS="$E2E_BACKEND_URL" \
            ./node_modules/.bin/vite --host 0.0.0.0 \
            --port "$E2E_FRONTEND_PORT" --strictPort
    ) > /tmp/widdo-e2e-vite.log 2>&1 &
    E2E_FRONTEND_PID=$!

    sleep 1
    if ! kill -0 "$E2E_FRONTEND_PID" 2>/dev/null; then
        echo -e "${RED}Frontend E2E no pudo iniciar; revisa /tmp/widdo-e2e-vite.log${NC}" >&2
        wait "$E2E_FRONTEND_PID" 2>/dev/null || true
        E2E_FRONTEND_PID=""
        return 1
    fi
}

wait_for_e2e_frontend() {
    wait_for_url "$E2E_FRONTEND_URL/login" "Frontend E2E"
}

cleanup_e2e_frontend() {
    if [ -n "$E2E_FRONTEND_PID" ]; then
        if kill -0 "$E2E_FRONTEND_PID" 2>/dev/null; then
            kill "$E2E_FRONTEND_PID" 2>/dev/null
        fi
        wait "$E2E_FRONTEND_PID" 2>/dev/null || true
        E2E_FRONTEND_PID=""
    fi
}

run_e2e_smoke() {
    (cd "$FRONTEND_DIR" && \
        PLAYWRIGHT_BASE_URL="$E2E_FRONTEND_URL" \
        E2E_BACKEND_URL="$E2E_BACKEND_URL" \
        E2E_OWNER_EMAIL="director@bogotafc.co" \
        E2E_OWNER_PASSWORD="password123" \
        E2E_ORGANIZER_EMAIL="demo.organizer@widdo.co" \
        E2E_ORGANIZER_PASSWORD="Password123!" \
        npm run test:e2e:smoke)
}

run_e2e_mode() {
    echo -e "${BLUE}Ejecutando smoke E2E con db_e2e...${NC}"

    command -v docker >/dev/null 2>&1 && command -v npm >/dev/null 2>&1 && \
        command -v curl >/dev/null 2>&1 || {
            echo -e "${RED}El modo --e2e requiere Docker, npm y curl${NC}" >&2
            return 1
        }
    docker info >/dev/null 2>&1 || {
        echo -e "${RED}Docker no está corriendo${NC}" >&2
        return 1
    }

    start_e2e_database || return $?
    ensure_database db_e2e || return $?
    start_e2e_backend || return $?
    wait_for_e2e_backend || return $?
    verify_e2e_database || return $?
    ensure_e2e_frontend_port_available || return $?
    prepare_e2e_database || return $?
    start_e2e_frontend || return $?

    trap 'cleanup_e2e_frontend; exit 130' SIGINT SIGTERM
    if ! wait_for_e2e_frontend; then
        cleanup_e2e_frontend
        trap - SIGINT SIGTERM
        return 1
    fi

    run_e2e_smoke
    local smoke_status=$?
    cleanup_e2e_frontend
    trap - SIGINT SIGTERM

    echo -e "${CYAN}Docker E2E permanece activo en $E2E_BACKEND_URL${NC}"
    return "$smoke_status"
}

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
