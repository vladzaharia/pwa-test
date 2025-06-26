import { useState, useEffect, useCallback } from 'react'
import { syncService } from '../services/syncService'
import { TodoItem } from '../types'

interface UseBackgroundSyncProps {
  todos: TodoItem[]
  onTodosUpdate: (todos: TodoItem[]) => void
  isServerConnected: boolean | null
}

export function useBackgroundSync({
  todos,
  onTodosUpdate,
  isServerConnected,
}: UseBackgroundSyncProps) {
  const [backgroundSyncDemo, setBackgroundSyncDemo] = useState<string[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [hasRunInitialSync, setHasRunInitialSync] = useState(false)

  // Add sync action to log - stable function with no dependencies
  const addSyncAction = useCallback((action: string) => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    const timestampedAction = `${timestamp}: ${action}`
    setBackgroundSyncDemo((prev: string[]) => {
      // Keep only the last 10 entries to prevent unlimited growth
      const newSyncData = [...prev, timestampedAction].slice(-10)
      localStorage.setItem('pwa-sync-demo', JSON.stringify(newSyncData))
      return newSyncData
    })
  }, [])

  // Perform actual sync operation
  const performActualSync = useCallback(
    async (isManual: boolean, isInitial: boolean = false) => {
      if (isSyncing) return // Prevent concurrent syncs

      setIsSyncing(true)

      try {
        const result = await syncService.performSync(todos)

        const syncTypePrefix = isManual
          ? 'Manual'
          : isInitial
            ? 'Initial'
            : 'Background'

        if (result.success) {
          // Update todos with reconciled data
          if (result.fetchedData) {
            const reconciledTodos = result.fetchedData.map((todo) => ({
              ...todo,
              syncStatus: 'synced' as const,
            }))
            onTodosUpdate(reconciledTodos)
          }

          // Determine what happened in the sync
          const syncedCount = result.syncedOperations.length
          const hasConflicts = result.conflicts.length > 0
          const hasFailed = result.failedOperations.length > 0

          if (syncedCount > 0 || hasConflicts || hasFailed) {
            // Log final success result with details
            const details = []
            if (syncedCount > 0) details.push(`${syncedCount} synced`)
            if (hasConflicts)
              details.push(`${result.conflicts.length} conflicts`)
            if (hasFailed)
              details.push(`${result.failedOperations.length} failed`)
            addSyncAction(
              `${syncTypePrefix}: succeeded (${details.join(', ')})`
            )
          } else {
            // Log simple success
            addSyncAction(`${syncTypePrefix}: succeeded`)
          }
        } else {
          // Log final failure result
          addSyncAction(`${syncTypePrefix}: failed`)
        }
      } catch {
        const syncTypePrefix = isManual
          ? 'Manual'
          : isInitial
            ? 'Initial'
            : 'Background'
        addSyncAction(`${syncTypePrefix}: failed`)
      } finally {
        setIsSyncing(false)
      }
    },
    [isSyncing, todos, onTodosUpdate, addSyncAction]
  )

  // One-time setup effect - runs only once on mount
  useEffect(() => {
    // Load background sync demo data
    const syncData = JSON.parse(localStorage.getItem('pwa-sync-demo') || '[]')
    setBackgroundSyncDemo(syncData)

    // Listen for service worker messages about background sync
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'BACKGROUND_SYNC') {
        const action = `SW Sync: ${event.data.action || 'Background sync completed'}`
        addSyncAction(action)
      }
    }

    navigator.serviceWorker?.addEventListener('message', handleMessage)

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage)
    }
  }, [addSyncAction])

  // Separate effect for online/offline and sync operations
  useEffect(() => {
    // Listen for online/offline events to trigger actual sync
    const handleOnline = () => {
      // When coming back online, perform actual sync (will log result)
      performActualSync(false)
    }

    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [performActualSync])

  // Separate effect for initial sync - runs immediately when online and server is available
  useEffect(() => {
    // Trigger initial sync immediately if we're online and server is connected
    if (!hasRunInitialSync && navigator.onLine && isServerConnected === true) {
      setHasRunInitialSync(true)
      performActualSync(false, true) // true = isInitial
    }
  }, [hasRunInitialSync, isServerConnected, performActualSync])

  // Separate effect for periodic background sync
  useEffect(() => {
    // Periodic background sync (every 30 seconds)
    // For demo purposes, we always sync to show activity
    const backgroundSyncInterval = setInterval(() => {
      if (navigator.onLine) {
        performActualSync(false, false) // false = isManual, false = isInitial (so it's Background)
      }
    }, 30000)

    return () => {
      clearInterval(backgroundSyncInterval)
    }
  }, [performActualSync])

  const performSync = useCallback(
    async (isManual: boolean, notificationsEnabled: boolean) => {
      await performActualSync(isManual)

      // Show notification if enabled
      if (notificationsEnabled) {
        const notificationConfig = isManual
          ? {
              title: 'Sync Complete',
              body: 'Manual sync completed successfully!',
              delay: 1000,
            }
          : {
              title: 'Background Sync Complete',
              body: 'Your data has been synchronized in the background!',
              delay: 2000,
            }

        setTimeout(() => {
          new Notification(notificationConfig.title, {
            body: notificationConfig.body,
            icon: '/pwa-192x192.png',
          })
        }, notificationConfig.delay)
      }
    },
    [performActualSync]
  )

  const clearSyncData = useCallback(() => {
    setBackgroundSyncDemo([])
    localStorage.removeItem('pwa-sync-demo')
    syncService.clearSyncData()
  }, [])

  const addPendingSync = useCallback(
    (action: string) => {
      // This is now handled by the sync service, but we keep the interface for compatibility
      addSyncAction(`Queued: ${action}`)
    },
    [addSyncAction]
  )

  return {
    backgroundSyncDemo,
    performSync,
    clearSyncData,
    addSyncAction,
    addPendingSync,
    isSyncing,
    pendingOperations: syncService.getPendingOperations(),
    syncConflicts: syncService.getSyncConflicts(),
  }
}
