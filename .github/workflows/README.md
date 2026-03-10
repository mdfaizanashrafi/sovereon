# Sovereon CI/CD Pipeline Documentation

## Overview

This directory contains the comprehensive CI/CD pipeline configurations for the Sovereon project, designed to achieve a 10/10 DevOps score through automated testing, security scanning, and zero-downtime deployments.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CI/CD Pipeline                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   CI         │───▶│   PR Checks  │───▶│   CD-Staging │      │
│  │   (ci.yml)   │    │  (pr-checks) │    │ (cd-staging) │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                                           │           │
│         │                                           ▼           │
│         │                                    ┌──────────────┐   │
│         │                                    │   Staging    │   │
│         │                                    │  Environment │   │
│         │                                    └──────────────┘   │
│         │                                           │           │
│         ▼                                           ▼           │
│  ┌──────────────┐                          ┌──────────────┐    │
│  │   Reports    │                          │   Promote    │    │
│  │  (Codecov)   │                          │   to Prod    │    │
│  └──────────────┘                          └──────────────┘    │
│                                                     │           │
│                                                     ▼           │
│  ┌──────────────┐                          ┌──────────────┐    │
│  │  Production  │◀─────────────────────────│   CD-Prod    │    │
│  │  Environment │                          │(cd-production)│   │
│  └──────────────┘                          └──────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Workflows

### 1. CI - Continuous Integration (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs:**
| Job | Description | Parallel |
|-----|-------------|----------|
| `lint` | ESLint for frontend and backend | ✅ |
| `type-check` | TypeScript compilation check | ✅ |
| `test` | Unit tests with coverage | ✅ |
| `build` | Build both frontend and backend | ✅ |
| `security-scan` | npm audit and Trivy scanning | ✅ |
| `e2e-tests` | Playwright tests (PRs only) | ✅ |
| `ci-summary` | Aggregate all results | ❌ |

**Features:**
- Matrix builds for parallel execution
- Caching for `node_modules`
- Coverage reports uploaded to Codecov
- Security vulnerability scanning

### 2. CD - Staging Deployment (`cd-staging.yml`)

**Triggers:**
- Push to `develop` branch
- Manual workflow dispatch

**Jobs:**
1. `deploy-staging` - Build and push Docker images, deploy to staging
2. `migrate-database` - Run Prisma migrations
3. `health-check` - Verify deployment health
4. `rollback-on-failure` - Automatic rollback if health checks fail
5. `notify-success` - Slack notification on success

**Features:**
- Blue-green deployment support
- Database migrations with backup
- Automated rollback on failure
- Slack notifications

### 3. CD - Production Deployment (`cd-production.yml`)

**Triggers:**
- Tag push (e.g., `v1.2.3`)
- Manual workflow dispatch

**Jobs:**
1. `pre-deployment-checks` - Validate release version
2. `build-images` - Build and push production images
3. `backup-database` - Create database backup
4. `deploy-production` - Blue-green deployment
5. `migrate-production` - Run database migrations
6. `health-check-and-switch` - Verify and switch traffic
7. `rollback-on-failure` - Automatic rollback
8. `notify-success` - Slack notification and GitHub release

**Features:**
- Requires manual approval (environment protection)
- Database backup before migration
- Blue-green deployment for zero downtime
- Automatic rollback on health check failure
- GitHub release creation

### 4. PR Quality Gates (`pr-checks.yml`)

**Triggers:**
- Pull request events (opened, synchronize, reopened)

**Jobs:**
| Job | Description |
|-----|-------------|
| `pr-metadata` | Validate PR title and description |
| `code-quality` | Linting and formatting checks |
| `coverage-check` | 80% coverage threshold enforcement |
| `security-check` | npm audit, Trivy, TruffleHog |
| `build-check` | Build verification |
| `check-approvals` | Require 2 approvals |
| `pr-size-check` | Warn on large PRs |
| `pr-quality-gate` | Final gate check |

## Docker Configuration

### Backend Dockerfile
- **Multi-stage build:** Dependencies → Builder → Production
- **Security:** Non-root user (nodejs:1001)
- **Size:** Minimal final image (~100MB)
- **Health check:** `/api/health` endpoint

### Frontend Dockerfile
- **Multi-stage build:** Dependencies → Builder → Nginx
- **Security:** Non-root nginx user
- **Optimization:** Gzip compression, cache headers
- **Security headers:** X-Frame-Options, CSP, etc.

### Docker Compose (Production)
Services:
- `nginx` - Reverse proxy with SSL
- `frontend` - React static files
- `backend` - Node.js API
- `backend-blue/green` - Blue-green deployment
- `postgres` - PostgreSQL database
- `redis` - Redis cache
- `backup` - Database backup service

## Deployment Script

The `scripts/deploy.sh` script provides:
- Environment validation
- Database backup before migration
- Migration execution with Prisma
- Health check verification
- Smoke tests
- Automatic rollback capability

### Usage
```bash
# Deploy to staging
./scripts/deploy.sh --environment=staging --version=latest

# Deploy to production
./scripts/deploy.sh --environment=production --version=v1.2.3

# Rollback
./scripts/deploy.sh --rollback
```

## Required GitHub Secrets

### AWS
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

### Database
- `STAGING_DATABASE_URL`
- `PRODUCTION_DATABASE_URL`

### Cache
- `STAGING_REDIS_URL`
- `PRODUCTION_REDIS_URL`

### Security
- `STAGING_SESSION_SECRET`
- `PRODUCTION_SESSION_SECRET`

### Notifications
- `SLACK_WEBHOOK_URL`

### External Services
- `RESEND_API_KEY`
- `SENTRY_DSN`

### Deployment
- `STAGING_SSH_KEY`
- `STAGING_HOST`
- `STAGING_USER`
- `PRODUCTION_SSH_KEY`
- `PRODUCTION_HOST`
- `PRODUCTION_USER`

### Code Coverage
- `CODECOV_TOKEN`

## Environment Variables

### Application
- `NODE_ENV` - environment (development/staging/production)
- `PORT` - server port
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `SESSION_SECRET` - session encryption key

### External APIs
- `RESEND_API_KEY` - Email service
- `SENTRY_DSN` - Error tracking
- `FRONTEND_URL` - Frontend URL for CORS
- `API_URL` - API URL for CSP

## Performance Targets

| Metric | Target |
|--------|--------|
| CI Pipeline Duration | < 5 minutes |
| Deployment Duration | < 10 minutes |
| Rollback Time | < 2 minutes |
| Downtime | 0 (blue-green) |
| Test Coverage | ≥ 80% |

## Security Features

1. **Container Security**
   - Non-root users
   - Minimal base images (Alpine)
   - Security updates

2. **Dependency Scanning**
   - npm audit
   - Trivy vulnerability scanner
   - TruffleHog secrets detection

3. **Network Security**
   - Internal networks for database/cache
   - SSL/TLS encryption
   - Security headers (CSP, HSTS, etc.)

4. **Access Control**
   - Required approvals (2 for production)
   - Environment protection rules
   - SSH key authentication

## Monitoring & Observability

- Health check endpoints
- Structured logging
- Coverage reporting (Codecov)
- Slack notifications
- GitHub deployment status

## Best Practices Implemented

✅ **Fast builds** - Parallel jobs, caching
✅ **Zero-downtime deployments** - Blue-green strategy
✅ **Automatic rollback** - Health check failures
✅ **Security scanning** - Multi-layer scanning
✅ **Coverage reports** - Codecov integration
✅ **Secrets management** - GitHub secrets
✅ **Code quality gates** - PR validation
✅ **Documentation** - This README
