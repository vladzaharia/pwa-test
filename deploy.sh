#!/bin/bash

# PWA Demo App Deployment Script
echo "🚀 Building PWA Demo App with API Server..."

# Clean previous builds
yarn clean

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Run linting
echo "🔍 Running linting..."
yarn lint

# Run formatting check
echo "✨ Checking code formatting..."
yarn format:check

# Build for production
echo "🏗 Building for production..."
yarn build

echo "✅ Build complete!"
echo ""
echo "📁 Files generated:"
echo "  - packages/frontend/dist/  (Frontend build)"
echo "  - packages/server/         (API server)"
echo ""
echo "🚀 To run locally:"
echo "  yarn start       (Production server with API)"
echo "  yarn dev         (Development with hot reload)"
echo ""
echo "🌐 To deploy:"
echo "  1. Upload 'packages/server/' directory to your server"
echo "  2. Copy 'packages/frontend/dist/' contents to server/dist/"
echo "  3. Run 'yarn start' in the server directory"
echo ""
echo "📱 PWA Features:"
echo "  - Service Worker for offline functionality"
echo "  - Web App Manifest for installation"
echo "  - Push notification support (requires HTTPS)"
echo "  - Background sync capabilities"
echo "  - Real API server with in-memory storage"
echo ""
echo "🌐 For best PWA experience, serve over HTTPS in production."
