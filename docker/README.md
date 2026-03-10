# Docker Configuration

This directory contains Docker configurations for building production-ready images for the Sovereon platform.

## Images

### Backend (`Dockerfile.backend`)

Multi-stage build process:
1. **Dependencies** - Install and cache npm packages
2. **Builder** - Compile TypeScript
3. **Production** - Minimal runtime image

**Features:**
- Based on `node:20-alpine`
- Non-root user (nodejs:1001)
- Health check on `/api/health`
- Automatic database migrations on startup

**Build:**
```bash
docker build -f docker/Dockerfile.backend -t sovereon-backend:latest .
```

**Run:**
```bash
docker run -p 5000:5000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  -e SESSION_SECRET=... \
  sovereon-backend:latest
```

### Frontend (`Dockerfile.frontend`)

Multi-stage build process:
1. **Dependencies** - Install npm packages
2. **Builder** - Build React app with Vite
3. **Production** - Nginx static server

**Features:**
- Based on `nginx:1.25-alpine`
- Gzip compression enabled
- Security headers configured
- Optimized static asset serving

**Build:**
```bash
docker build -f docker/Dockerfile.frontend -t sovereon-frontend:latest .
```

**Run:**
```bash
docker run -p 80:80 sovereon-frontend:latest
```

## Production Deployment

See `docker-compose.prod.yml` for the complete production stack configuration.

### Quick Start

```bash
# Set environment variables
export DATABASE_URL="postgresql://..."
export REDIS_URL="redis://..."
export SESSION_SECRET="..."
export IMAGE_TAG="latest"

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Services

| Service | Description | Port |
|---------|-------------|------|
| nginx | Reverse proxy | 80, 443 |
| frontend | React static files | 80 (internal) |
| backend | Node.js API | 5000 (internal) |
| postgres | PostgreSQL | 5432 (internal) |
| redis | Redis cache | 6379 (internal) |

### Blue-Green Deployment

```bash
# Deploy to blue environment
export BLUE_PORT=3001
docker-compose -f docker-compose.prod.yml --profile blue-green up -d backend-blue

# Verify health
curl http://localhost:3001/api/health

# Switch traffic (update nginx config)
# ... nginx reload ...

# Stop green environment
docker-compose -f docker-compose.prod.yml stop backend-green
```
