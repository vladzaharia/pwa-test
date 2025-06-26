import { useState } from 'react'
import { Separator } from './components/ui/separator'
import { Button } from './components/ui/button'
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from './components/ui/sidebar'
import { PWAStatusSidebar } from './components/PWAStatusSidebar'
import { TodoDemo } from './components/TodoDemo'
import { usePWAInstallation } from './hooks/usePWAInstallation'
import { useNetworkStatus } from './hooks/useNetworkStatus'
import { useServiceWorker } from './hooks/useServiceWorker'
import { useNotifications } from './hooks/useNotifications'
import { useBackgroundSync } from './hooks/useBackgroundSync'
import { useAppStats } from './hooks/useAppStats'
import { useTodos } from './hooks/useTodos'
import { Trash2, RefreshCw, Activity } from 'lucide-react'
import { useServerConnection } from './hooks/useServerConnection'
import { useIsMobile } from './hooks/use-mobile'
import { TodoItem } from './types'

function App() {
  // Mobile detection
  const isMobile = useIsMobile()

  // Custom hooks for PWA functionality
  const { installPrompt, isInstalled, handleInstall } = usePWAInstallation()
  const { isOnline } = useNetworkStatus()
  const { swRegistration, updateAvailable, handleUpdate } = useServiceWorker()
  const { notificationsEnabled, requestNotifications } = useNotifications()
  const { visitCount, lastVisit, loadTime } = useAppStats()
  const { isServerConnected, lastChecked } = useServerConnection()

  // Initialize todos state first
  const [todos, setTodos] = useState<TodoItem[]>([])

  // Background sync hook
  const {
    backgroundSyncDemo,
    performSync,
    addPendingSync,
    // isSyncing,
    // pendingOperations,
    // syncConflicts,
  } = useBackgroundSync({
    todos,
    onTodosUpdate: setTodos,
    isServerConnected,
  })

  // Todo management with actual sync functions
  const { error, addTodo, toggleTodo, clearTodos } = useTodos({
    isOnline,
    addPendingSync,
    todos,
    setTodos,
  })

  // Manual sync handler with notifications
  const handleForcedSync = () => {
    performSync(true, notificationsEnabled) // true = manual sync
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen flex-1">
        <Sidebar
          collapsible={isMobile ? 'offcanvas' : 'none'}
          className="w-72 bg-sidebar border-r border-sidebar-border h-full flex flex-col"
        >
          <SidebarHeader className="border-b p-3 flex-shrink-0">
            <div className="flex items-center gap-2 h-10">
              <Activity className="h-5 w-5" />
              <h2 className="text-base font-semibold">PWA Status</h2>
            </div>
          </SidebarHeader>

          <SidebarContent className="flex-1 overflow-hidden">
            <PWAStatusSidebar
              visitCount={visitCount}
              lastVisit={lastVisit}
              loadTime={loadTime}
              isServerConnected={isServerConnected}
              lastServerCheck={lastChecked}
              isInstalled={isInstalled}
              installPrompt={installPrompt}
              handleInstall={handleInstall}
              isOnline={isOnline}
              swRegistration={swRegistration}
              updateAvailable={updateAvailable}
              handleUpdate={handleUpdate}
              notificationsEnabled={notificationsEnabled}
              requestNotifications={requestNotifications}
              backgroundSyncDemo={backgroundSyncDemo}
            />
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
            <div className="flex items-center gap-2">
              {isMobile && <SidebarTrigger className="-ml-1" />}
              {isMobile && (
                <Separator orientation="vertical" className="mr-2 h-4" />
              )}
              <h1 className="text-lg font-semibold">Todo List</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleForcedSync}
                size="sm"
                className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                onClick={clearTodos}
                size="sm"
                className="h-8 w-8 p-0 bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4">
            <TodoDemo
              todos={todos}
              error={error}
              isOnline={isOnline}
              addTodo={addTodo}
              toggleTodo={toggleTodo}
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default App
