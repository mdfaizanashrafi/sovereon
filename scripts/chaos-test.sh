#!/bin/bash
# ============================================================================
# CHAOS ENGINEERING TEST RUNNER
# ============================================================================
# Automated chaos testing script for running experiments in sequence,
# verifying system resilience, and generating reports.
#
# Usage:
#   ./scripts/chaos-test.sh [options]
#
# Options:
#   -e, --environment   Target environment (default: staging)
#   -t, --tests         Comma-separated list of tests to run (default: all)
#   -d, --duration      Base duration for each experiment (default: 30s)
#   -o, --output        Output directory for reports (default: ./chaos-reports)
#   -s, --slack         Send notification to Slack webhook
#   --ci                CI mode (non-interactive, strict exit codes)
#   -h, --help          Show this help message
#
# Examples:
#   ./scripts/chaos-test.sh                                    # Run all tests
#   ./scripts/chaos-test.sh -t database,cache                  # Run specific tests
#   ./scripts/chaos-test.sh -e production --ci                 # CI mode
#   ./scripts/chaos-test.sh -s $SLACK_WEBHOOK_URL            # With Slack notifications
# ============================================================================

set -e

# Default configuration
ENVIRONMENT="staging"
TESTS="all"
DURATION="30s"
OUTPUT_DIR="./chaos-reports"
SLACK_WEBHOOK=""
CI_MODE=false
API_BASE_URL=""
VERBOSE=false

# Test results
declare -A TEST_RESULTS
declare -A TEST_DURATIONS
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
START_TIME=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_debug() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}[DEBUG]${NC} $1"
    fi
}

print_banner() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║              CHAOS ENGINEERING TEST RUNNER                   ║"
    echo "║                    Sovereon Inc.                             ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
}

show_help() {
    print_banner
    sed -n '/^# Usage:/,/^# \*\*\*/p' "$0" | sed 's/^# //' | sed 's/^#//'
    exit 0
}

# ============================================================================
# ARGUMENT PARSING
# ============================================================================

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -t|--tests)
                TESTS="$2"
                shift 2
                ;;
            -d|--duration)
                DURATION="$2"
                shift 2
                ;;
            -o|--output)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            -s|--slack)
                SLACK_WEBHOOK="$2"
                shift 2
                ;;
            --ci)
                CI_MODE=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                show_help
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
}

# ============================================================================
# ENVIRONMENT SETUP
# ============================================================================

setup_environment() {
    log_info "Setting up environment: $ENVIRONMENT"
    
    case $ENVIRONMENT in
        development|dev)
            API_BASE_URL="${CHAOS_API_URL:-http://localhost:5000}"
            ;;
        staging)
            API_BASE_URL="${CHAOS_API_URL:-https://api-staging.sovereon.com}"
            ;;
        production|prod)
            API_BASE_URL="${CHAOS_API_URL:-https://api.sovereon.com}"
            log_warn "WARNING: Running chaos tests in PRODUCTION!"
            if [ "$CI_MODE" = false ]; then
                read -p "Are you sure? (yes/no): " confirm
                if [ "$confirm" != "yes" ]; then
                    log_info "Aborted."
                    exit 0
                fi
            fi
            ;;
        *)
            API_BASE_URL="$ENVIRONMENT"
            ;;
    esac
    
    log_info "API Base URL: $API_BASE_URL"
    
    # Create output directory
    mkdir -p "$OUTPUT_DIR"
    
    # Generate report filename
    REPORT_FILE="$OUTPUT_DIR/chaos-report-$(date +%Y%m%d-%H%M%S).json"
    
    log_info "Report will be saved to: $REPORT_FILE"
}

# ============================================================================
# HEALTH CHECKS
# ============================================================================

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if curl is available
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed"
        exit 1
    fi
    
    # Check if jq is available (optional but recommended)
    if ! command -v jq &> /dev/null; then
        log_warn "jq not found. JSON parsing will be limited."
    fi
    
    # Check API connectivity
    log_info "Checking API connectivity..."
    if ! curl -sf "${API_BASE_URL}/api/health" > /dev/null 2>&1; then
        log_error "Cannot connect to API at $API_BASE_URL"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# ============================================================================
# SYSTEM HEALTH PROBES
# ============================================================================

run_health_probes() {
    log_info "Running system health probes..."
    
    local probes_url="${API_BASE_URL}/api/chaos/probes"
    local response
    
    response=$(curl -sf "$probes_url" 2>/dev/null || echo '{"success":false}')
    
    if echo "$response" | grep -q '"success":true'; then
        log_success "Health probes completed"
        echo "$response" > "$OUTPUT_DIR/health-probes-$(date +%Y%m%d-%H%M%S).json"
        return 0
    else
        log_error "Health probes failed"
        return 1
    fi
}

# ============================================================================
# CHAOS EXPERIMENT RUNNERS
# ============================================================================

run_experiment() {
    local experiment_name=$1
    local experiment_type=$2
    local duration=$3
    
    log_info "Running experiment: $experiment_name ($experiment_type)"
    
    local start_time
    local end_time
    local duration_ms
    local result
    local status
    
    start_time=$(date +%s%3N)
    
    # Call chaos API to start experiment
    local api_response
    api_response=$(curl -sf -X POST \
        -H "Content-Type: application/json" \
        -d "{\"experiment\":\"$experiment_type\",\"duration\":\"$duration\"}" \
        "${API_BASE_URL}/api/chaos/start" 2>/dev/null || echo '{"success":false}')
    
    if ! echo "$api_response" | grep -q '"success":true'; then
        log_error "Failed to start experiment: $experiment_name"
        TEST_RESULTS[$experiment_name]="FAILED"
        TEST_DURATIONS[$experiment_name]=0
        return 1
    fi
    
    log_info "Experiment started, waiting for completion..."
    
    # Wait for experiment duration plus some buffer
    local wait_seconds
    wait_seconds=$(echo "$duration" | sed 's/s//')
    sleep $((wait_seconds + 5))
    
    # Check experiment status
    local status_response
    status_response=$(curl -sf "${API_BASE_URL}/api/chaos/status" 2>/dev/null || echo '{"running":true}')
    
    # Wait until no experiments are running
    local max_wait=60
    local waited=0
    while echo "$status_response" | grep -q '"running":true' && [ $waited -lt $max_wait ]; do
        sleep 2
        waited=$((waited + 2))
        status_response=$(curl -sf "${API_BASE_URL}/api/chaos/status" 2>/dev/null || echo '{"running":true}')
    done
    
    end_time=$(date +%s%3N)
    duration_ms=$((end_time - start_time))
    
    # Get experiment history
    local history_response
    history_response=$(curl -sf "${API_BASE_URL}/api/chaos/history?limit=1" 2>/dev/null || echo '{"history":[]}')
    
    # Determine status based on history
    if echo "$history_response" | grep -q '"status":"completed"' || \
       echo "$history_response" | grep -q '"status":"rolled_back"'; then
        status="PASSED"
        log_success "Experiment completed: $experiment_name"
    else
        status="FAILED"
        log_error "Experiment failed: $experiment_name"
    fi
    
    TEST_RESULTS[$experiment_name]=$status
    TEST_DURATIONS[$experiment_name]=$duration_ms
    
    [ "$status" = "PASSED" ]
}

# ============================================================================
# TEST SUITES
# ============================================================================

run_database_tests() {
    log_info "========================================="
    log_info "Running Database Chaos Tests"
    log_info "========================================="
    
    TOTAL_TESTS=$((TOTAL_TESTS + 3))
    
    run_experiment "Database Connection Loss" "connectionLoss" "$DURATION" && PASSED_TESTS=$((PASSED_TESTS + 1)) || FAILED_TESTS=$((FAILED_TESTS + 1))
    sleep 5
    
    run_experiment "Database Timeout" "timeout" "$DURATION" && PASSED_TESTS=$((PASSED_TESTS + 1)) || FAILED_TESTS=$((FAILED_TESTS + 1))
    sleep 5
    
    run_experiment "Slow Query Simulation" "slowQuery" "$DURATION" && PASSED_TESTS=$((PASSED_TESTS + 1)) || FAILED_TESTS=$((FAILED_TESTS + 1))
    sleep 5
}

run_cache_tests() {
    log_info "========================================="
    log_info "Running Cache Chaos Tests"
    log_info "========================================="
    
    TOTAL_TESTS=$((TOTAL_TESTS + 3))
    
    run_experiment "Redis Connection Failure" "connectionFailure" "$DURATION" && PASSED_TESTS=$((PASSED_TESTS + 1)) || FAILED_TESTS=$((FAILED_TESTS + 1))
    sleep 5
    
    run_experiment "Cache Timeout" "timeout" "$DURATION" && PASSED_TESTS=$((PASSED_TESTS + 1)) || FAILED_TESTS=$((FAILED_TESTS + 1))
    sleep 5
    
    run_experiment "Cache Stampede" "stampede" "$DURATION" && PASSED_TESTS=$((PASSED_TESTS + 1)) || FAILED_TESTS=$((FAILED_TESTS + 1))
    sleep 5
}

run_network_tests() {
    log_info "========================================="
    log_info "Running Network Chaos Tests"
    log_info "========================================="
    
    TOTAL_TESTS=$((TOTAL_TESTS + 2))
    
    run_experiment "API Latency Injection" "apiLatency" "$DURATION" && PASSED_TESTS=$((PASSED_TESTS + 1)) || FAILED_TESTS=$((FAILED_TESTS + 1))
    sleep 5
    
    run_experiment "External Service Timeout" "externalTimeout" "$DURATION" && PASSED_TESTS=$((PASSED_TESTS + 1)) || FAILED_TESTS=$((FAILED_TESTS + 1))
    sleep 5
}

run_memory_tests() {
    log_info "========================================="
    log_info "Running Memory Chaos Tests"
    log_info "========================================="
    
    TOTAL_TESTS=$((TOTAL_TESTS + 2))
    
    run_experiment "GC Pressure" "gcPressure" "$DURATION" && PASSED_TESTS=$((PASSED_TESTS + 1)) || FAILED_TESTS=$((FAILED_TESTS + 1))
    sleep 5
    
    run_experiment "Large Payload Handling" "largePayload" "$DURATION" && PASSED_TESTS=$((PASSED_TESTS + 1)) || FAILED_TESTS=$((FAILED_TESTS + 1))
    sleep 5
}

# ============================================================================
# REPORT GENERATION
# ============================================================================

generate_report() {
    log_info "Generating report..."
    
    local end_time
    local total_duration
    end_time=$(date +%s%3N)
    total_duration=$((end_time - START_TIME))
    
    local pass_rate=0
    if [ $TOTAL_TESTS -gt 0 ]; then
        pass_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    fi
    
    # Build JSON report
    cat > "$REPORT_FILE" << EOF
{
  "reportType": "chaos-engineering",
  "environment": "$ENVIRONMENT",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "summary": {
    "totalTests": $TOTAL_TESTS,
    "passed": $PASSED_TESTS,
    "failed": $FAILED_TESTS,
    "passRate": $pass_rate,
    "totalDurationMs": $total_duration
  },
  "results": {
EOF

    # Add individual test results
    local first=true
    for test_name in "${!TEST_RESULTS[@]}"; do
        if [ "$first" = true ]; then
            first=false
        else
            echo "," >> "$REPORT_FILE"
        fi
        
        local status="${TEST_RESULTS[$test_name]}"
        local duration="${TEST_DURATIONS[$test_name]}"
        
        cat >> "$REPORT_FILE" << EOF
    "$test_name": {
      "status": "$status",
      "durationMs": $duration
    }
EOF
    done
    
    cat >> "$REPORT_FILE" << EOF

  },
  "resilienceScore": $pass_rate,
  "recommendations": [
$(generate_recommendations)
  ]
}
EOF

    log_success "Report saved to: $REPORT_FILE"
}

generate_recommendations() {
    local recommendations=()
    
    if [ $FAILED_TESTS -gt 0 ]; then
        recommendations+=("    \"Review failed experiments and improve fault tolerance\"")
    fi
    
    if [ ${#TEST_RESULTS[@]} -eq 0 ]; then
        recommendations+=("    \"No tests were executed - check configuration\"")
    fi
    
    if [ ${#recommendations[@]} -eq 0 ]; then
        recommendations+=("    \"All tests passed - system shows good resilience\"")
    fi
    
    printf '%s,\n' "${recommendations[@]}" | sed '$ s/,$//'
}

print_summary() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                      TEST SUMMARY                            ║"
    echo "╠══════════════════════════════════════════════════════════════╣"
    printf "║  Environment:     %-42s ║\n" "$ENVIRONMENT"
    printf "║  Total Tests:     %-42s ║\n" "$TOTAL_TESTS"
    printf "║  Passed:          %-42s ║\n" "$PASSED_TESTS"
    printf "║  Failed:          %-42s ║\n" "$FAILED_TESTS"
    printf "║  Pass Rate:       %-42s ║\n" "${PASSED_TESTS}*100/$TOTAL_TESTS%"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Print individual results
    if [ ${#TEST_RESULTS[@]} -gt 0 ]; then
        echo "Detailed Results:"
        echo "─────────────────"
        for test_name in "${!TEST_RESULTS[@]}"; do
            local status="${TEST_RESULTS[$test_name]}"
            if [ "$status" = "PASSED" ]; then
                log_success "$test_name"
            else
                log_error "$test_name"
            fi
        done
        echo ""
    fi
}

# ============================================================================
# SLACK NOTIFICATION
# ============================================================================

send_slack_notification() {
    if [ -z "$SLACK_WEBHOOK" ]; then
        return 0
    fi
    
    log_info "Sending Slack notification..."
    
    local pass_rate=0
    if [ $TOTAL_TESTS -gt 0 ]; then
        pass_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    fi
    
    local color="danger"
    if [ $pass_rate -ge 80 ]; then
        color="good"
    elif [ $pass_rate -ge 50 ]; then
        color="warning"
    fi
    
    local message
    message=$(cat <<EOF
{
  "attachments": [
    {
      "color": "$color",
      "title": "Chaos Engineering Test Results",
      "fields": [
        {"title": "Environment", "value": "$ENVIRONMENT", "short": true},
        {"title": "Pass Rate", "value": "$pass_rate%", "short": true},
        {"title": "Total Tests", "value": "$TOTAL_TESTS", "short": true},
        {"title": "Passed", "value": "$PASSED_TESTS", "short": true},
        {"title": "Failed", "value": "$FAILED_TESTS", "short": true}
      ],
      "footer": "Sovereon Chaos Engineering",
      "ts": $(date +%s)
    }
  ]
}
EOF
)
    
    curl -sf -X POST -H "Content-Type: application/json" \
        -d "$message" \
        "$SLACK_WEBHOOK" > /dev/null 2>&1 || log_warn "Failed to send Slack notification"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    parse_args "$@"
    print_banner
    
    START_TIME=$(date +%s%3N)
    
    setup_environment
    check_prerequisites
    run_health_probes
    
    # Run selected tests
    if [ "$TESTS" = "all" ]; then
        run_database_tests
        run_cache_tests
        run_network_tests
        run_memory_tests
    else
        IFS=',' read -ra TEST_ARRAY <<< "$TESTS"
        for test in "${TEST_ARRAY[@]}"; do
            case $test in
                database) run_database_tests ;;
                cache) run_cache_tests ;;
                network) run_network_tests ;;
                memory) run_memory_tests ;;
                *) log_warn "Unknown test type: $test" ;;
            esac
        done
    fi
    
    # Final health check
    run_health_probes || true
    
    generate_report
    print_summary
    send_slack_notification
    
    # Exit with appropriate code
    if [ $FAILED_TESTS -gt 0 ] && [ "$CI_MODE" = true ]; then
        exit 1
    fi
    
    exit 0
}

# Run main function
main "$@"
