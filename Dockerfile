# Single-container Dockerfile - Backend serves both API and frontend
FROM node:20-alpine

WORKDIR /app

# Create non-root user early
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Change ownership of app directory to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to nodejs user for all operations
USER nodejs

# Copy workspace configuration first (changes rarely)
COPY --chown=nodejs:nodejs package.json yarn.lock .yarnrc.yml ./
COPY --chown=nodejs:nodejs .yarn ./.yarn

# Copy all package.json files for workspace dependency resolution
COPY --chown=nodejs:nodejs packages/server/package.json ./packages/server/
COPY --chown=nodejs:nodejs packages/frontend/package.json ./packages/frontend/

# Install dependencies (this layer is cached unless package files change)
RUN yarn install --immutable --network-timeout 300000

# Copy source code for both packages
COPY --chown=nodejs:nodejs packages/frontend ./packages/frontend
COPY --chown=nodejs:nodejs packages/server ./packages/server

# Build frontend for production
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL
RUN yarn workspace frontend build

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV FRONTEND_URL=http://localhost:3001
ENV CORS_ORIGIN=http://localhost:3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["yarn", "workspace", "server", "start"]
