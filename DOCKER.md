# Docker Deployment Guide

This PWA application can be deployed using Docker with a two-container setup:
- **Frontend**: Nginx serving the React build with API proxying
- **Backend**: Node.js Express API server

## Quick Start

1. **Clone and setup environment**:
   ```bash
   git clone <repository>
   cd pwa-test
   cp .env.example .env
   ```

2. **Build and run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

## Environment Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
# Port configuration
FRONTEND_PORT=3000    # Port for frontend (nginx)
BACKEND_PORT=3001     # Port for backend API

# Backend runtime environment
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Frontend build-time environment
VITE_API_URL=http://localhost:3001
```

### Production Deployment

For production, update the environment variables:

```bash
# Production example
FRONTEND_PORT=80
BACKEND_PORT=3001
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
VITE_API_URL=https://your-domain.com
```

## Docker Commands

### Development
```bash
# Build and run in foreground
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Production
```bash
# Build for production
docker-compose -f docker-compose.yml up --build -d

# Update containers
docker-compose pull
docker-compose up -d --build

# Clean up
docker-compose down --volumes --remove-orphans
```

### Individual Container Management
```bash
# Build backend only
docker build -f Dockerfile.backend -t pwa-backend .

# Build frontend only
docker build -f Dockerfile.frontend -t pwa-frontend .

# Run backend manually
docker run -p 3001:3001 -e NODE_ENV=production pwa-backend

# Run frontend manually
docker run -p 3000:80 pwa-frontend
```

## Architecture

### Frontend Container (Nginx)
- Serves static React build files
- Proxies `/api/*` requests to backend
- Handles client-side routing
- Includes security headers and caching

### Backend Container (Node.js)
- Express API server
- CORS configured for frontend
- Health check endpoint at `/api/health`
- Environment-based configuration

### Networking
- Containers communicate via Docker network
- Frontend proxies API requests to backend
- External access via exposed ports

## Health Checks

Both containers include health checks:
- **Frontend**: HTTP check on nginx
- **Backend**: HTTP check on `/api/health` endpoint

## Security Features

- Non-root user in backend container
- Security headers in nginx
- CORS properly configured
- No sensitive data in images

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `.env` file
2. **CORS errors**: Update `CORS_ORIGIN` environment variable
3. **API not accessible**: Check `VITE_API_URL` build-time variable

### Debugging
```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend

# Execute into containers
docker-compose exec backend sh
docker-compose exec frontend sh

# Check container health
docker-compose ps
```
