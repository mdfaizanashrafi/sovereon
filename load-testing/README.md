# Sovereon Load Testing Suite

This directory contains a comprehensive k6-based load testing infrastructure for the Sovereon API.

## Quick Start

```bash
# Install k6 first: https://k6.io/docs/get-started/installation/

# Run smoke test
./scripts/load-test.sh smoke staging

# Run load test
./scripts/load-test.sh load staging

# Run with custom URL
./scripts/load-test.sh smoke local http://localhost:3000
```

## Directory Structure

```
load-testing/
├── k6/
│   ├── config.js              # Central configuration
│   ├── scenarios/             # Load test scenarios
│   │   ├── api-smoke-test.js       # Quick health check
│   │   ├── api-load-test.js        # Sustained load
│   │   ├── api-stress-test.js      # Find breaking point
│   │   ├── api-spike-test.js       # Sudden traffic spike
│   │   └── api-endurance-test.js   # Long-running stability
│   ├── utils/                 # Test utilities
│   │   ├── auth.js            # Authentication helpers
│   │   ├── data.js            # Test data generation
│   │   ├── checks.js          # Common check functions
│   │   └── metrics.js         # Custom metrics
│   └── tests/                 # Endpoint-specific tests
│       ├── public-endpoints.test.js
│       ├── admin-endpoints.test.js
│       ├── crud-operations.test.js
│       └── search-queries.test.js
├── grafana/
│   └── dashboard.json         # Grafana dashboard
└── results/                   # Test results (generated)
```

## Test Types

| Test | Duration | VUs | Purpose |
|------|----------|-----|---------|
| Smoke | 30s | 10 | Quick health check |
| Load | 16m | 100 | Sustained performance |
| Stress | 17m | 500+ | Find breaking point |
| Spike | 12m | 1000 | Auto-scaling test |
| Endurance | 65m | 50 | Stability & memory leaks |

## Running Tests

### Using the Runner Script

```bash
./scripts/load-test.sh [test-type] [environment] [base-url]
```

### Using k6 Directly

```bash
# Basic run
k6 run load-testing/k6/scenarios/api-smoke-test.js

# With environment variables
k6 run --env ENV=staging --env BASE_URL=https://api.example.com load-testing/k6/scenarios/api-load-test.js

# With InfluxDB output
k6 run --out influxdb=http://localhost:8086/k6 load-testing/k6/scenarios/api-load-test.js
```

## Environment Variables

Copy `.env.example` to `.env.staging` or `.env.local` and configure:

```bash
cp load-testing/.env.example load-testing/.env.staging
```

Required variables:
- `ADMIN_USERNAME` - Admin username for authenticated tests
- `ADMIN_PASSWORD` - Admin password

## CI/CD Integration

Tests run automatically via GitHub Actions:
- **Smoke tests** on every PR
- **Load tests** before releases
- **Stress tests** weekly

See `.github/workflows/load-test.yml`

## Documentation

For detailed documentation, see:
- [Load Testing Guide](../docs/LOAD_TESTING.md)
- [k6 Documentation](https://k6.io/docs/)

## Metrics

The suite tracks:
- Response times (P50, P95, P99)
- Request rates
- Error rates
- Custom business metrics
- Database connection metrics
- Cache hit rates

## Grafana Dashboard

Import `grafana/dashboard.json` into Grafana to visualize:
- Response time trends
- Request rates
- Error rates
- Virtual user scaling
- Baseline comparisons
