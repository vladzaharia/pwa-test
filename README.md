# PWA Demo App

A comprehensive Progressive Web App (PWA) demonstration showcasing modern web app capabilities, installation processes, offline functionality, and native app-like experiences.

## 🚀 Features

### PWA Core Features

- **📱 Installable**: Can be installed on desktop and mobile devices
- **🔄 Offline Support**: Works without internet connection using service workers
- **⚡ Fast Loading**: Cached resources for instant loading
- **🔔 Push Notifications**: Engage users even when app is closed
- **🌐 Responsive**: Works on all device sizes
- **🔄 Auto Updates**: Automatic updates when new versions are available

### Demo Capabilities

- **Online/Offline Todo Demo**: Interactive todo list showing data fetching, caching, and offline functionality
- **PWA Lifecycle Tracking**: Shows visit count, installation status, and service worker state
- **Installation Demo**: Custom install button and installation state management
- **Network Status**: Real-time online/offline detection with visual indicators
- **Background Sync**: Simulated background data synchronization with offline actions
- **Native Features**: Web Share API integration with clipboard fallback
- **Performance Metrics**: Load time tracking and caching status
- **Data Persistence**: Local storage with cache indicators (fresh vs cached data)

## 🛠 Tech Stack

- **Frontend**: React 19 with TypeScript
- **Backend**: Express.js API server with in-memory storage
- **Build Tool**: Vite 6 with API proxy
- **PWA Plugin**: vite-plugin-pwa with Workbox
- **Package Manager**: Yarn v4 with workspaces
- **Linting**: ESLint 9 with TypeScript support
- **Formatting**: Prettier
- **Service Worker**: Workbox for caching strategies
- **Development**: Concurrently runs both frontend and backend

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd pwa-test
```

2. Install dependencies:

```bash
yarn install
```

This will install dependencies for both the frontend and server packages using yarn workspaces.

## 📋 Workspace Commands

The project uses yarn workspaces with a unified command structure:

### Main Commands (All Packages)
- `yarn dev` - Start development servers for all packages
- `yarn build` - Build all packages
- `yarn test` - Run tests in all packages
- `yarn lint` - Lint all packages
- `yarn format` - Format code in all packages
- `yarn clean` - Clean build artifacts in all packages

### Package-Specific Commands
- `yarn dev:frontend` / `yarn dev:server` - Start individual packages
- `yarn build:frontend` / `yarn build:server` - Build individual packages
- `yarn lint:frontend` / `yarn lint:server` - Lint individual packages
- `yarn test:frontend` / `yarn test:server` - Test individual packages

Most of the time you'll use the main commands that operate on all packages.

## 🏃‍♂️ Development

### Full Stack Development (Recommended)

Start both API server and frontend with hot reload:

```bash
yarn dev
```

- Frontend: `http://localhost:5173`
- API Server: `http://localhost:3001`

### Individual Package Development

Start specific packages when needed:

```bash
yarn dev:frontend    # Frontend only
yarn dev:server      # API server only
```

### Development Features

- Hot Module Replacement (HMR)
- API proxy from frontend to backend
- Service Worker enabled in development
- PWA features work in development mode
- Real API endpoints with in-memory storage

## 🏗 Building

Build all packages for production:

```bash
yarn build
```

Build individual packages:

```bash
yarn build:frontend    # Frontend only
yarn build:server      # Server only (no-op, but consistent)
```

Preview/Start the production build:

```bash
yarn start:frontend    # Preview frontend build
yarn start             # Full stack (API + Frontend)
```

## 🧹 Code Quality

Run linting across all packages:

```bash
yarn lint           # Lint all packages
yarn lint:fix       # Auto-fix issues in all packages
```

Run linting on individual packages:

```bash
yarn lint:frontend     # Frontend only
yarn lint:server       # Server only
```

Format code across all packages:

```bash
yarn format            # Format all packages
yarn format:check      # Check formatting in all packages
```

Other quality commands:

```bash
yarn test              # Run tests in all packages
yarn clean             # Clean build artifacts in all packages
yarn check             # Run lint + format check + build
```

## 📱 PWA Testing

### Installation Testing

1. Open the app in a browser
2. Look for the install prompt or use the "Install App" button
3. Install the app to your home screen/desktop
4. Launch the installed app to see the standalone experience

### Offline Testing

1. Open the app and let it load completely
2. Disconnect from the internet
3. Refresh the page - it should still work
4. Try navigating around the app offline

### Features to Test

- **Online/Offline Demo**:
  - Click "Fetch Data" to load todos from server (online)
  - Add your own todos (stored locally)
  - Go offline and refresh - see cached data persist
  - Add todos while offline - they queue for background sync
- **Network Status**: Toggle airplane mode to see online/offline status indicators
- **Push Notifications**: Click "Enable Notifications" to test notification API
- **Background Sync**: Use "Simulate Sync" to see background sync demo
- **Sharing**: Test the share functionality (native or clipboard fallback)
- **Updates**: The app will show update prompts when new versions are available

## 🎯 PWA Demonstration Guide

This app is designed to showcase the complete PWA experience:

### 1. First Visit (Browser Experience)

- Shows as a regular web app
- Install prompt may appear
- Service worker registers and caches resources
- All features work in browser

### 2. Installation Process

- Custom install button appears when installation is available
- Native browser install prompt
- App gets added to home screen/desktop

### 3. Installed Experience

- Launches in standalone mode (no browser UI)
- App-like experience with native feel
- Faster loading due to cached resources
- Push notifications work when app is closed

### 4. Offline Capabilities

- App works completely offline after first visit
- Cached resources ensure functionality
- Background sync queues actions for when online

### 5. Update Lifecycle

- Automatic detection of new versions
- User-friendly update prompts
- Seamless updates without losing data

## 🔧 Configuration

### PWA Manifest

The app manifest is configured in `vite.config.ts` with:

- App name and description
- Icons for different sizes
- Theme colors
- Display mode (standalone)
- Start URL and scope

### Service Worker

Workbox configuration includes:

- Precaching of all app assets
- Runtime caching strategies
- Automatic updates
- Offline fallbacks

## 📊 Performance

The app demonstrates PWA performance benefits:

- **Fast First Load**: Optimized bundle size
- **Instant Subsequent Loads**: Service worker caching
- **Offline Functionality**: Complete offline experience
- **Background Updates**: Seamless update process

## 🌐 Browser Support

PWA features are supported in:

- Chrome/Chromium browsers (full support)
- Firefox (most features)
- Safari (iOS 11.3+, limited support)
- Edge (full support)

## 📝 Notes

- Icons are currently placeholder SVGs - replace with proper PNG icons for production
- Push notifications require HTTPS in production
- Some PWA features may not work in all browsers
- Service worker updates may require page refresh in some cases

## 🤝 Contributing

This is a demonstration project. Feel free to:

- Fork and modify for your own PWA demos
- Add new PWA features
- Improve the UI/UX
- Add more comprehensive testing

## 💡 Online/Offline Demo Guide

The main demo showcases how PWAs handle data in different network conditions:

### 🌐 Online Mode

- Click "Fetch Data" to load todos from JSONPlaceholder API
- Notice the "🌐 Fresh" badges on server data
- Add your own todos (they get "💾 Cached" badges)
- All data is automatically cached for offline use

### ✈️ Offline Mode

- Disconnect from internet (airplane mode)
- Refresh the page - all data persists!
- Add new todos - they're stored locally
- Background sync queues offline actions
- Error messages show when using cached data

### 🔄 Back Online

- Reconnect to internet
- See background sync notifications
- Fresh data loads while cached data remains available
- Seamless transition between online and offline states

This demonstrates the core PWA benefit: **reliable functionality regardless of network conditions**.

## 🔌 API Endpoints

The demo includes a simple Express.js API server with the following endpoints:

### Todos API

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
  ```json
  { "title": "Todo title" }
  ```
- `PUT /api/todos/:id` - Update a todo
  ```json
  { "title": "Updated title", "completed": true }
  ```
- `DELETE /api/todos/:id` - Delete a specific todo
- `DELETE /api/todos` - Clear all todos

### Health Check

- `GET /api/health` - Server health and status

### Features

- **In-memory storage**: Data persists during server session
- **CORS enabled**: Works with frontend development server
- **Simulated delays**: Realistic network latency (300-500ms)
- **Error handling**: Proper HTTP status codes and error messages
- **Static serving**: Serves built frontend in production

## 🚀 Deployment

### Local Production

```bash
yarn build:full
yarn start
```

### Cloud Deployment

1. **Heroku/Railway/Render**: Upload the entire project
2. **Vercel/Netlify**: Use serverless functions (requires adaptation)
3. **VPS/Docker**: Copy `server/` directory and `dist/` build

The server serves both the API and the built frontend, making deployment simple.

## 📄 License

This project is for demonstration purposes. Use freely for learning and teaching PWA concepts.
