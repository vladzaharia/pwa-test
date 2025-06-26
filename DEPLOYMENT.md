# PWA Demo Deployment Guide

This guide covers different deployment options for the PWA Demo app with its API server.

## 🚀 Quick Start

### Local Development
```bash
# Terminal 1: Start API server
cd server && npm start

# Terminal 2: Start frontend (in new terminal)
yarn dev
```

Or use the combined command:
```bash
yarn dev:full  # Starts both server and frontend
```

### Local Production
```bash
yarn build:full  # Build frontend + install server deps
yarn start       # Start production server
```

## 🌐 Cloud Deployment Options

### 1. Railway (Recommended - Easiest)

1. **Connect Repository**: Link your GitHub repo to Railway
2. **Auto-Deploy**: Railway will detect the Node.js app and deploy automatically
3. **Environment**: No additional config needed
4. **URL**: Railway provides a public URL

**Pros**: Zero configuration, automatic deployments, free tier
**Cons**: Limited free tier

### 2. Heroku

1. **Create App**: `heroku create your-pwa-demo`
2. **Deploy**: `git push heroku main`
3. **Environment**: Add `NODE_ENV=production`

**Heroku Setup**:
```bash
# Add Procfile
echo "web: cd server && npm start" > Procfile

# Deploy
git add .
git commit -m "Add Heroku config"
git push heroku main
```

### 3. Render

1. **Connect Repository**: Link GitHub repo
2. **Build Command**: `yarn build:full`
3. **Start Command**: `cd server && npm start`
4. **Environment**: Set `NODE_ENV=production`

### 4. Vercel (Serverless)

Requires adapting the Express server to serverless functions:

```javascript
// api/todos.js
export default function handler(req, res) {
  // Convert Express routes to serverless functions
}
```

### 5. Netlify (Serverless)

Similar to Vercel, requires serverless function adaptation:

```javascript
// netlify/functions/todos.js
exports.handler = async (event, context) => {
  // Convert Express routes
}
```

### 6. VPS/Docker

**Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
COPY server/ ./server/
COPY dist/ ./dist/

WORKDIR /app/server
RUN npm install --production

EXPOSE 3001
CMD ["npm", "start"]
```

**Deploy**:
```bash
# Build locally
yarn build:full

# Copy to server
scp -r server/ dist/ user@your-server:/app/

# On server
cd /app/server && npm start
```

## 📁 File Structure for Deployment

```
project/
├── dist/              # Built frontend (generated)
├── server/            # API server
│   ├── server.js      # Main server file
│   ├── package.json   # Server dependencies
│   └── node_modules/  # Server dependencies (generated)
├── src/               # Frontend source (not needed in production)
└── package.json       # Frontend build tools
```

## 🔧 Environment Variables

### Required
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Set to "production" for production builds

### Optional
- `CORS_ORIGIN`: Allowed CORS origins (default: all)

## 🌐 Domain Setup

### Custom Domain
1. **Point domain** to your deployment URL
2. **HTTPS**: Ensure SSL certificate is configured
3. **PWA Requirements**: PWAs require HTTPS in production

### Subdomain Example
- API: `api.yourapp.com`
- Frontend: `yourapp.com`

Update the frontend to use the API subdomain:
```typescript
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.yourapp.com' 
  : '/api'
```

## 📊 Production Considerations

### Performance
- **Gzip**: Enable compression (most platforms do this automatically)
- **CDN**: Use a CDN for static assets
- **Caching**: Set appropriate cache headers

### Security
- **HTTPS**: Required for PWA features
- **CORS**: Configure appropriate origins
- **Rate Limiting**: Add rate limiting to API endpoints

### Monitoring
- **Health Checks**: Use `/api/health` endpoint
- **Logging**: Add proper logging to server
- **Error Tracking**: Consider services like Sentry

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy PWA Demo
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: yarn install
      - run: yarn build:full
      - name: Deploy to Railway
        # Add deployment steps
```

## 🐛 Troubleshooting

### Common Issues

1. **API Not Found**: Check proxy configuration in `vite.config.ts`
2. **CORS Errors**: Verify server CORS settings
3. **PWA Not Installing**: Ensure HTTPS in production
4. **Service Worker Issues**: Check browser dev tools

### Debug Commands
```bash
# Check server health
curl https://your-app.com/api/health

# Test API endpoints
curl https://your-app.com/api/todos

# Check build output
yarn build && ls -la dist/
```

## 📝 Notes

- The server serves both API and static files
- In-memory storage resets on server restart
- For persistent data, add a database (PostgreSQL, MongoDB, etc.)
- PWA features require HTTPS in production
- Test offline functionality after deployment
