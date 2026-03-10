#!/bin/bash

# =============================================================================
# Sovereon Deployment Script
# =============================================================================
# Usage: ./deploy.sh [options]
# Options:
#   --environment=<env>    Target environment (staging|production|blue|green)
#   --version=<version>    Version tag to deploy
#   --skip-migrations      Skip database migrations
#   --skip-health-check    Skip health check verification
#   --rollback             Perform rollback to previous version
#   --help                 Show this help message
# =============================================================================

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.prod.yml"
DEPLOYMENT_TIMEOUT=${DEPLOYMENT_TIMEOUT:-300}
HEALTH_CHECK_RETRIES=${HEALTH_CHECK_RETRIES:-30}
HEALTH_CHECK_INTERVAL=${HEALTH_CHECK_INTERVAL:-10}
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# Logging Functions
# =============================================================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =============================================================================
# Help Function
# =============================================================================
show_help() {
    head -n 15 "$0" | tail -n 13
}

# =============================================================================
# Parse Arguments
# =============================================================================
parse_arguments() {
    ENVIRONMENT="${DEPLOYMENT_ENV:-staging}"
    VERSION="${IMAGE_TAG:-latest}"
    SKIP_MIGRATIONS=false
    SKIP_HEALTH_CHECK=false
    ROLLBACK=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --environment=*)
                ENVIRONMENT="${1#*=}"
                shift
                ;;
            --version=*)
                VERSION="${1#*=}"
                shift
                ;;
            --skip-migrations)
                SKIP_MIGRATIONS=true
                shift
                ;;
            --skip-health-check)
                SKIP_HEALTH_CHECK=true
                shift
                ;;
            --rollback)
                ROLLBACK=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# =============================================================================
# Validate Environment
# =============================================================================
validate_environment() {
    log_info "Validating environment..."

    # Check required environment variables
    local required_vars=("DATABASE_URL" "REDIS_URL" "SESSION_SECRET")
    local missing_vars=()

    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done

    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing required environment variables: ${missing_vars[*]}"
        exit 1
    fi

    # Check Docker and Docker Compose
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi

    # Check compose file exists
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        log_error "Docker Compose file not found: $COMPOSE_FILE"
        exit 1
    fi

    log_success "Environment validation passed"
}

# =============================================================================
# Database Backup
# =============================================================================
backup_database() {
    log_info "Creating database backup..."

    local backup_file="backup-$(date +%Y%m%d-%H%M%S).sql"
    local backup_dir="/opt/sovereon/backups"

    mkdir -p "$backup_dir"

    # Extract database connection details from DATABASE_URL
    # Expected format: postgresql://user:password@host:port/database
    if [[ "$DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+) ]]; then
        local db_user="${BASH_REMATCH[1]}"
        local db_pass="${BASH_REMATCH[2]}"
        local db_host="${BASH_REMATCH[3]}"
        local db_port="${BASH_REMATCH[4]}"
        local db_name="${BASH_REMATCH[5]}"

        PGPASSWORD="$db_pass" pg_dump \
            -h "$db_host" \
            -p "$db_port" \
            -U "$db_user" \
            -d "$db_name" \
            -F c \
            -f "${backup_dir}/${backup_file}"

        log_success "Database backup created: ${backup_dir}/${backup_file}"

        # Cleanup old backups
        find "$backup_dir" -name "backup-*.sql" -mtime +$BACKUP_RETENTION_DAYS -delete
    else
        log_warning "Could not parse DATABASE_URL, skipping backup"
    fi
}

# =============================================================================
# Run Database Migrations
# =============================================================================
run_migrations() {
    log_info "Running database migrations..."

    local migration_container="sovereon-migration-$(date +%s)"

    # Run migrations using a temporary container
    docker run --rm \
        --name "$migration_container" \
        -e DATABASE_URL="$DATABASE_URL" \
        -e NODE_ENV="$ENVIRONMENT" \
        "${ECR_REGISTRY:-}${ECR_REGISTRY:+/}sovereon-backend:${VERSION}" \
        sh -c "npx prisma migrate deploy"

    if [[ $? -eq 0 ]]; then
        log_success "Database migrations completed"
    else
        log_error "Database migrations failed"
        exit 1
    fi
}

# =============================================================================
# Deploy Application
# =============================================================================
deploy_application() {
    log_info "Deploying application (environment: $ENVIRONMENT, version: $VERSION)..."

    export IMAGE_TAG="$VERSION"
    export DEPLOYMENT_ENV="$ENVIRONMENT"

    # Pull latest images
    log_info "Pulling latest images..."
    docker-compose -f "$COMPOSE_FILE" pull

    # Stop and remove old containers gracefully
    log_info "Stopping old containers..."
    docker-compose -f "$COMPOSE_FILE" down --timeout 30

    # Start new containers
    log_info "Starting new containers..."
    docker-compose -f "$COMPOSE_FILE" up -d

    # Wait for containers to start
    sleep 10

    log_success "Application deployed"
}

# =============================================================================
# Health Check
# =============================================================================
health_check() {
    log_info "Performing health checks..."

    local backend_port="${APP_PORT:-5000}"
    local health_endpoint="http://localhost:${backend_port}/api/health"
    local retries=0

    while [[ $retries -lt $HEALTH_CHECK_RETRIES ]]; do
        log_info "Health check attempt $((retries + 1))/$HEALTH_CHECK_RETRIES..."

        if curl -sf "$health_endpoint" > /dev/null 2>&1; then
            log_success "Backend health check passed"
            break
        fi

        retries=$((retries + 1))
        sleep $HEALTH_CHECK_INTERVAL
    done

    if [[ $retries -eq $HEALTH_CHECK_RETRIES ]]; then
        log_error "Health check failed after $HEALTH_CHECK_RETRIES attempts"
        return 1
    fi

    # Check frontend if applicable
    if [[ "$ENVIRONMENT" != "backend" ]]; then
        if curl -sf "http://localhost:80" > /dev/null 2>&1 || \
           curl -sf "http://localhost:3000" > /dev/null 2>&1; then
            log_success "Frontend health check passed"
        else
            log_warning "Frontend health check inconclusive (may be behind nginx)"
        fi
    fi

    log_success "All health checks passed"
    return 0
}

# =============================================================================
# Smoke Tests
# =============================================================================
run_smoke_tests() {
    log_info "Running smoke tests..."

    local base_url="${FRONTEND_URL:-http://localhost}"
    local api_url="${API_URL:-http://localhost:5000}"

    # Test API health
    if ! curl -sf "${api_url}/api/health" > /dev/null 2>&1; then
        log_error "API health check failed"
        return 1
    fi
    log_success "API smoke test passed"

    # Test frontend (if not backend-only deployment)
    if [[ "$ENVIRONMENT" != "backend" ]]; then
        local response
        response=$(curl -sf "$base_url" 2>/dev/null || echo "")
        if [[ -n "$response" ]] && echo "$response" | grep -q "Sovereon\|<!DOCTYPE html\|<html"; then
            log_success "Frontend smoke test passed"
        else
            log_warning "Frontend smoke test inconclusive"
        fi
    fi

    log_success "Smoke tests completed"
}

# =============================================================================
# Rollback
# =============================================================================
rollback() {
    log_warning "Initiating rollback..."

    local rollback_file="${PROJECT_ROOT}/.last_successful_deployment"

    if [[ ! -f "$rollback_file" ]]; then
        log_error "No rollback information found"
        exit 1
    fi

    local previous_version
    previous_version=$(cat "$rollback_file")

    log_info "Rolling back to version: $previous_version"

    export IMAGE_TAG="$previous_version"

    # Stop current deployment
    docker-compose -f "$COMPOSE_FILE" down

    # Deploy previous version
    docker-compose -f "$COMPOSE_FILE" up -d

    # Health check
    if health_check; then
        log_success "Rollback completed successfully"
    else
        log_error "Rollback failed - manual intervention required"
        exit 1
    fi
}

# =============================================================================
# Cleanup
# =============================================================================
cleanup() {
    log_info "Cleaning up..."

    # Remove unused images
    docker image prune -f

    # Remove old containers
    docker container prune -f

    # Clean up volumes (optional, keep for data persistence)
    # docker volume prune -f

    log_success "Cleanup completed"
}

# =============================================================================
# Save Deployment Info
# =============================================================================
save_deployment_info() {
    local info_file="${PROJECT_ROOT}/.last_deployment"
    local rollback_file="${PROJECT_ROOT}/.last_successful_deployment"

    # Save current deployment info
    echo "${ENVIRONMENT}:${VERSION}:$(date -Iseconds)" > "$info_file"

    # Save successful deployment for potential rollback
    if [[ -f "$rollback_file" ]]; then
        cp "$rollback_file" "${rollback_file}.backup"
    fi
    echo "$VERSION" > "$rollback_file"

    log_info "Deployment info saved"
}

# =============================================================================
# Main
# =============================================================================
main() {
    log_info "Starting Sovereon deployment script..."

    parse_arguments "$@"

    if [[ "$ROLLBACK" == true ]]; then
        rollback
        exit 0
    fi

    validate_environment

    if [[ "$SKIP_MIGRATIONS" == false ]]; then
        backup_database
        run_migrations
    fi

    deploy_application

    if [[ "$SKIP_HEALTH_CHECK" == false ]]; then
        if ! health_check; then
            log_error "Deployment failed health checks - initiating rollback"
            rollback
            exit 1
        fi

        run_smoke_tests
    fi

    save_deployment_info
    cleanup

    log_success "Deployment completed successfully!"
    log_info "Environment: $ENVIRONMENT"
    log_info "Version: $VERSION"
}

# Run main function
main "$@"
