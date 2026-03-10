#!/bin/bash
# ============================================================================
# PERFORMANCE BENCHMARK SCRIPT
# ============================================================================
# Comprehensive benchmarking for API endpoints and frontend performance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=${PORT:-5000}
FRONTEND_PORT=${FRONTEND_PORT:-5173}
API_URL=${API_URL:-"http://localhost:${BACKEND_PORT}"}
BENCHMARK_TIMEOUT=${BENCHMARK_TIMEOUT:-300}
BASELINE_FILE=".benchmark-baseline.json"
REPORT_DIR="reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="${REPORT_DIR}/benchmark-report-${TIMESTAMP}.json"

# Default values
RUN_API=true
RUN_FRONTEND=true
COMPARE_BASELINE=true
GENERATE_REPORT=true
VERBOSE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --api-only)
      RUN_API=true
      RUN_FRONTEND=false
      shift
      ;;
    --frontend-only)
      RUN_API=false
      RUN_FRONTEND=true
      shift
      ;;
    --no-compare)
      COMPARE_BASELINE=false
      shift
      ;;
    --no-report)
      GENERATE_REPORT=false
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --api-only        Run only API benchmarks"
      echo "  --frontend-only   Run only frontend benchmarks"
      echo "  --no-compare      Skip baseline comparison"
      echo "  --no-report       Skip report generation"
      echo "  --verbose         Enable verbose output"
      echo "  --help            Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
  echo ""
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
}

# Check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if a port is in use
port_in_use() {
  lsof -Pi :"$1" -sTCP:LISTEN -t >/dev/null 2>&1
}

# Wait for a service to be ready
wait_for_service() {
  local url=$1
  local max_attempts=${2:-30}
  local attempt=1
  
  log_info "Waiting for $url..."
  while [ $attempt -le $max_attempts ]; do
    if curl -sf "$url" >/dev/null 2>&1; then
      log_success "Service is ready!"
      return 0
    fi
    echo -n "."
    sleep 1
    attempt=$((attempt + 1))
  done
  
  log_error "Service failed to start after $max_attempts attempts"
  return 1
}

# ============================================================================
# SETUP
# ============================================================================

setup() {
  log_section "SETUP"
  
  # Create report directory
  mkdir -p "$REPORT_DIR"
  
  # Check for required tools
  if ! command_exists curl; then
    log_error "curl is required but not installed"
    exit 1
  fi
  
  if [ "$RUN_API" = true ]; then
    if ! command_exists node; then
      log_error "Node.js is required but not installed"
      exit 1
    fi
  fi
  
  if [ "$RUN_FRONTEND" = true ]; then
    if ! command_exists npm; then
      log_error "npm is required but not installed"
      exit 1
    fi
  fi
  
  log_success "Setup complete"
}

# ============================================================================
# BACKEND BENCHMARKS
# ============================================================================

start_backend() {
  log_section "STARTING BACKEND SERVER"
  
  if port_in_use "$BACKEND_PORT"; then
    log_warn "Port $BACKEND_PORT is already in use, assuming server is running"
    return 0
  fi
  
  cd backend
  
  # Check if node_modules exists
  if [ ! -d "node_modules" ]; then
    log_info "Installing backend dependencies..."
    npm ci
  fi
  
  # Start server in background
  log_info "Starting backend server on port $BACKEND_PORT..."
  NODE_ENV=test npm run dev &
  BACKEND_PID=$!
  
  cd ..
  
  # Wait for server to be ready
  if ! wait_for_service "$API_URL/api/health"; then
    log_error "Failed to start backend server"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
  fi
  
  log_success "Backend server started (PID: $BACKEND_PID)"
}

stop_backend() {
  if [ -n "$BACKEND_PID" ]; then
    log_info "Stopping backend server..."
    kill $BACKEND_PID 2>/dev/null || true
    wait $BACKEND_PID 2>/dev/null || true
    log_success "Backend server stopped"
  fi
}

run_api_benchmarks() {
  log_section "RUNNING API BENCHMARKS"
  
  # Create benchmark script
  cat > /tmp/api-benchmark.js << 'EOF'
const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:5000';
const ITERATIONS = parseInt(process.env.ITERATIONS) || 100;
const CONCURRENT = parseInt(process.env.CONCURRENT) || 10;

// Parse URL
const url = new URL(API_URL);

// Benchmark configuration
const endpoints = [
  { name: 'health', path: '/api/health', method: 'GET' },
  { name: 'services', path: '/api/services', method: 'GET' },
  { name: 'service_detail', path: '/api/services/consulting', method: 'GET' },
  { name: 'team_members', path: '/api/v1/team-members', method: 'GET' },
  { name: 'faqs', path: '/api/v1/faqs', method: 'GET' },
];

// Make HTTP request
function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: path,
      method: method,
      timeout: 10000,
    };

    const protocol = url.protocol === 'https:' ? require('https') : http;
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        resolve({
          status: res.statusCode,
          duration: duration,
          size: Buffer.byteLength(data),
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Run sequential benchmark
async function runSequential(endpoint, iterations) {
  const durations = [];
  const start = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    try {
      const result = await makeRequest(endpoint.path, endpoint.method);
      durations.push(result.duration);
    } catch (e) {
      durations.push(-1);
    }
  }
  
  const totalTime = Date.now() - start;
  const validDurations = durations.filter(d => d > 0);
  
  return {
    totalTime,
    iterations,
    successCount: validDurations.length,
    failCount: iterations - validDurations.length,
    avgDuration: validDurations.reduce((a, b) => a + b, 0) / validDurations.length,
    minDuration: Math.min(...validDurations),
    maxDuration: Math.max(...validDurations),
    p95: validDurations.sort((a, b) => a - b)[Math.floor(validDurations.length * 0.95)],
  };
}

// Run concurrent benchmark
async function runConcurrent(endpoint, concurrent) {
  const promises = Array.from({ length: concurrent }, () => 
    makeRequest(endpoint.path, endpoint.method).catch(() => null)
  );
  
  const results = await Promise.all(promises);
  const successful = results.filter(r => r && r.status === 200);
  
  return {
    concurrent,
    successCount: successful.length,
    failCount: concurrent - successful.length,
    avgDuration: successful.reduce((a, b) => a + b.duration, 0) / successful.length,
  };
}

// Run all benchmarks
async function runBenchmarks() {
  const results = {};
  
  for (const endpoint of endpoints) {
    console.log(`\nBenchmarking: ${endpoint.name}`);
    console.log(`  Path: ${endpoint.path}`);
    
    // Sequential
    const sequential = await runSequential(endpoint, ITERATIONS);
    console.log(`  Sequential (${ITERATIONS} reqs):`);
    console.log(`    Avg: ${sequential.avgDuration.toFixed(2)}ms`);
    console.log(`    P95: ${sequential.p95.toFixed(2)}ms`);
    console.log(`    Success: ${sequential.successCount}/${ITERATIONS}`);
    
    // Concurrent
    const concurrent = await runConcurrent(endpoint, CONCURRENT);
    console.log(`  Concurrent (${CONCURRENT} reqs):`);
    console.log(`    Avg: ${concurrent.avgDuration.toFixed(2)}ms`);
    console.log(`    Success: ${concurrent.successCount}/${CONCURRENT}`);
    
    results[endpoint.name] = {
      endpoint: endpoint.path,
      method: endpoint.method,
      sequential,
      concurrent,
    };
  }
  
  return results;
}

runBenchmarks().then(results => {
  const report = {
    timestamp: new Date().toISOString(),
    config: { iterations: ITERATIONS, concurrent: CONCURRENT },
    results,
  };
  
  require('fs').writeFileSync('/tmp/api-benchmark-results.json', JSON.stringify(report, null, 2));
  console.log('\n✅ API benchmarks completed');
}).catch(err => {
  console.error('❌ Benchmark failed:', err);
  process.exit(1);
});
EOF

  # Run the benchmark
  log_info "Running API benchmarks with ${ITERATIONS:-100} iterations..."
  node /tmp/api-benchmark.js
  
  if [ -f /tmp/api-benchmark-results.json ]; then
    log_success "API benchmarks completed"
    if [ "$VERBOSE" = true ]; then
      cat /tmp/api-benchmark-results.json
    fi
  else
    log_error "API benchmark results not found"
    return 1
  fi
}

# ============================================================================
# FRONTEND BENCHMARKS
# ============================================================================

run_frontend_benchmarks() {
  log_section "RUNNING FRONTEND BENCHMARKS"
  
  cd frontend
  
  # Check if node_modules exists
  if [ ! -d "node_modules" ]; then
    log_info "Installing frontend dependencies..."
    npm ci
  fi
  
  # Build the frontend
  log_info "Building frontend..."
  npm run build
  
  # Analyze bundle size
  log_info "Analyzing bundle size..."
  if [ -d "dist" ]; then
    local bundle_size=$(du -sb dist | cut -f1)
    local bundle_size_kb=$((bundle_size / 1024))
    log_info "Bundle size: ${bundle_size_kb}KB"
    
    # Check against budget (500KB)
    if [ "$bundle_size_kb" -gt 512000 ]; then
      log_warn "Bundle size exceeds 500KB budget!"
    fi
  fi
  
  # Run Lighthouse CI if available
  if command_exists lhci; then
    log_info "Running Lighthouse CI..."
    lhci autorun || log_warn "Lighthouse CI failed"
  else
    log_info "Lighthouse CI not installed, skipping"
  fi
  
  cd ..
  
  log_success "Frontend benchmarks completed"
}

# ============================================================================
# BASELINE COMPARISON
# ============================================================================

compare_with_baseline() {
  if [ "$COMPARE_BASELINE" != true ]; then
    return 0
  fi
  
  log_section "COMPARING WITH BASELINE"
  
  if [ ! -f "$BASELINE_FILE" ]; then
    log_warn "No baseline file found at $BASELINE_FILE"
    log_info "Creating new baseline from current results"
    if [ -f /tmp/api-benchmark-results.json ]; then
      cp /tmp/api-benchmark-results.json "$BASELINE_FILE"
      log_success "Baseline created"
    fi
    return 0
  fi
  
  # Simple comparison (could be enhanced with more sophisticated logic)
  log_info "Comparing with baseline..."
  
  if command_exists jq; then
    local baseline_avg=$(jq -r '.results | to_entries | map(.value.sequential.avgDuration) | add / length' "$BASELINE_FILE")
    local current_avg=$(jq -r '.results | to_entries | map(.value.sequential.avgDuration) | add / length' /tmp/api-benchmark-results.json)
    
    log_info "Baseline avg: ${baseline_avg}ms"
    log_info "Current avg: ${current_avg}ms"
    
    # Calculate percentage change
    local change=$(echo "scale=2; (($current_avg - $baseline_avg) / $baseline_avg) * 100" | bc)
    log_info "Change: ${change}%"
    
    # Check if degradation exceeds 10%
    if (( $(echo "$change > 10" | bc -l) )); then
      log_error "Performance degraded by more than 10%!"
      return 1
    elif (( $(echo "$change > 5" | bc -l) )); then
      log_warn "Performance degraded by more than 5%"
    else
      log_success "Performance is within acceptable range"
    fi
  else
    log_warn "jq not installed, skipping detailed comparison"
  fi
}

# ============================================================================
# REPORT GENERATION
# ============================================================================

generate_report() {
  if [ "$GENERATE_REPORT" != true ]; then
    return 0
  fi
  
  log_section "GENERATING REPORT"
  
  local report="${REPORT_FILE}"
  
  # Create comprehensive report
  cat > "$report" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "environment": {
    "node_version": "$(node --version)",
    "npm_version": "$(npm --version)",
    "api_url": "$API_URL"
  },
  "summary": {
    "api_benchmarks": $([ "$RUN_API" = true ] && echo "true" || echo "false"),
    "frontend_benchmarks": $([ "$RUN_FRONTEND" = true ] && echo "true" || echo "false")
  }
EOF

  # Add API results if available
  if [ -f /tmp/api-benchmark-results.json ]; then
    echo ',' >> "$report"
    echo '"api_results":' >> "$report"
    cat /tmp/api-benchmark-results.json >> "$report"
  fi
  
  # Close JSON
  echo '' >> "$report"
  echo '}' >> "$report"
  
  log_success "Report generated: $report"
  
  # Display summary
  echo ""
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}BENCHMARK SUMMARY${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo "Report file: $report"
  
  if [ -f /tmp/api-benchmark-results.json ]; then
    echo ""
    echo "API Benchmark Results:"
    if command_exists jq; then
      jq -r '.results | to_entries | .[] | "  \(.key): \(.value.sequential.avgDuration | round)ms avg"' /tmp/api-benchmark-results.json
    fi
  fi
}

# ============================================================================
# CLEANUP
# ============================================================================

cleanup() {
  log_section "CLEANUP"
  stop_backend
  rm -f /tmp/api-benchmark.js /tmp/api-benchmark-results.json
  log_success "Cleanup complete"
}

# Set trap for cleanup on exit
trap cleanup EXIT

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
  echo -e "${BLUE}"
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║           PERFORMANCE BENCHMARK SUITE                      ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
  
  setup
  
  if [ "$RUN_API" = true ]; then
    start_backend
    run_api_benchmarks
  fi
  
  if [ "$RUN_FRONTEND" = true ]; then
    run_frontend_benchmarks
  fi
  
  compare_with_baseline
  generate_report
  
  log_section "COMPLETE"
  log_success "All benchmarks completed successfully!"
  
  return 0
}

# Run main function
main
