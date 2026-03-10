#!/bin/bash
# ============================================================================
# LOAD TEST RUNNER SCRIPT
# ============================================================================
# Usage: ./scripts/load-test.sh [smoke|load|stress|spike|endurance] [environment]
# Example: ./scripts/load-test.sh load staging
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_TYPE=${1:-smoke}
ENV=${2:-staging}
BASE_URL=${3:-}
RESULTS_DIR="load-testing/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Validate test type
case $TEST_TYPE in
  smoke|load|stress|spike|endurance)
    ;;
  *)
    echo -e "${RED}Error: Invalid test type '$TEST_TYPE'${NC}"
    echo "Valid types: smoke, load, stress, spike, endurance"
    exit 1
    ;;
esac

# Validate environment
case $ENV in
  local|development|staging|production)
    ;;
  *)
    echo -e "${RED}Error: Invalid environment '$ENV'${NC}"
    echo "Valid environments: local, development, staging, production"
    exit 1
    ;;
esac

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}Error: k6 is not installed${NC}"
    echo "Please install k6: https://k6.io/docs/get-started/installation/"
    exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Sovereon Load Test Runner${NC}"
echo -e "${BLUE}========================================${NC}"
echo "Test Type: $TEST_TYPE"
echo "Environment: $ENV"
echo "Timestamp: $TIMESTAMP"
echo ""

# Create results directory
mkdir -p "$RESULTS_DIR"

# Set base URL if provided
BASE_URL_ARG=""
if [ -n "$BASE_URL" ]; then
    BASE_URL_ARG="--env BASE_URL=$BASE_URL"
fi

# Load environment variables from .env file if it exists
if [ -f "load-testing/.env.$ENV" ]; then
    echo -e "${YELLOW}Loading environment variables from load-testing/.env.$ENV${NC}"
    export $(cat "load-testing/.env.$ENV" | xargs)
fi

# Determine the test file
TEST_FILE="load-testing/k6/scenarios/api-${TEST_TYPE}-test.js"

if [ ! -f "$TEST_FILE" ]; then
    echo -e "${RED}Error: Test file not found: $TEST_FILE${NC}"
    exit 1
fi

# Build k6 command
OUTPUT_FILE="$RESULTS_DIR/${TEST_TYPE}_${ENV}_${TIMESTAMP}"

echo -e "${BLUE}Starting $TEST_TYPE test...${NC}"
echo "Test file: $TEST_FILE"
echo ""

# Run k6 with appropriate output
k6 run \
    --env ENV="$ENV" \
    $BASE_URL_ARG \
    --out json="${OUTPUT_FILE}.json" \
    --out csv="${OUTPUT_FILE}.csv" \
    --summary-export="${OUTPUT_FILE}_summary.json" \
    "$TEST_FILE" 2>&1 | tee "${OUTPUT_FILE}.log"

EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo -e "${BLUE}========================================${NC}"

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}Load test completed successfully!${NC}"
else
    echo -e "${RED}Load test failed with exit code $EXIT_CODE${NC}"
fi

echo "Results saved to:"
echo "  - JSON: ${OUTPUT_FILE}.json"
echo "  - CSV: ${OUTPUT_FILE}.csv"
echo "  - Summary: ${OUTPUT_FILE}_summary.json"
echo "  - Log: ${OUTPUT_FILE}.log"
echo -e "${BLUE}========================================${NC}"

exit $EXIT_CODE
