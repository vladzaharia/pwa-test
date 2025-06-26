import {
  TodoItem,
  PendingSyncOperation,
  SyncConflict,
  SyncResult,
  SyncOperationType,
} from '../types'
import { todoApi, ApiError } from './apiService'

const STORAGE_KEYS = {
  PENDING_SYNC: 'pwa-pending-sync-operations',
  SYNC_CONFLICTS: 'pwa-sync-conflicts',
  LAST_SYNC: 'pwa-last-sync-timestamp',
} as const

export class SyncService {
  private static instance: SyncService

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService()
    }
    return SyncService.instance
  }

  // Generate unique operation ID
  private generateOperationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  }

  // Get pending sync operations from localStorage
  getPendingOperations(): PendingSyncOperation[] {
    const stored = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC)
    return stored ? JSON.parse(stored) : []
  }

  // Save pending sync operations to localStorage
  private savePendingOperations(operations: PendingSyncOperation[]): void {
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(operations))
  }

  // Add a new pending sync operation
  addPendingOperation(
    type: SyncOperationType,
    entityId: number,
    data: Partial<TodoItem>
  ): void {
    const operations = this.getPendingOperations()
    const operation: PendingSyncOperation = {
      id: this.generateOperationId(),
      type,
      entityType: 'todo',
      entityId,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    }

    // Remove any existing operations for the same entity to avoid duplicates
    const filteredOps = operations.filter(
      (op) => !(op.entityId === entityId && op.type === type)
    )

    filteredOps.push(operation)
    this.savePendingOperations(filteredOps)
  }

  // Remove completed sync operations
  private removeCompletedOperations(completedIds: string[]): void {
    const operations = this.getPendingOperations()
    const remaining = operations.filter((op) => !completedIds.includes(op.id))
    this.savePendingOperations(remaining)
  }

  // Get sync conflicts from localStorage
  getSyncConflicts(): SyncConflict[] {
    const stored = localStorage.getItem(STORAGE_KEYS.SYNC_CONFLICTS)
    return stored ? JSON.parse(stored) : []
  }

  // Save sync conflicts to localStorage
  private saveSyncConflicts(conflicts: SyncConflict[]): void {
    localStorage.setItem(STORAGE_KEYS.SYNC_CONFLICTS, JSON.stringify(conflicts))
  }

  // Fetch fresh data from server
  async fetchServerData(): Promise<TodoItem[]> {
    try {
      return await todoApi.getTodos()
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Failed to fetch server data: ${error.statusText}`)
      }
      throw error
    }
  }

  // Push a single operation to server
  private async pushOperation(
    operation: PendingSyncOperation
  ): Promise<boolean> {
    try {
      switch (operation.type) {
        case 'create':
          await todoApi.createTodo(operation.data)
          break

        case 'update':
          await todoApi.updateTodo(operation.entityId, operation.data)
          break

        case 'delete':
          await todoApi.deleteTodo(operation.entityId)
          break

        default:
          throw new Error(`Unknown operation type: ${operation.type}`)
      }

      return true
    } catch (error) {
      console.error('Failed to push operation:', error)
      return false
    }
  }

  // Reconcile local and server data
  private reconcileData(
    localTodos: TodoItem[],
    serverTodos: TodoItem[]
  ): { reconciled: TodoItem[]; conflicts: SyncConflict[] } {
    const reconciled: TodoItem[] = []
    const conflicts: SyncConflict[] = []
    const serverMap = new Map(serverTodos.map((todo) => [todo.id, todo]))
    const localMap = new Map(localTodos.map((todo) => [todo.id, todo]))

    // Process server todos
    for (const serverTodo of serverTodos) {
      const localTodo = localMap.get(serverTodo.id)

      if (!localTodo) {
        // Server has new data, add it
        reconciled.push({ ...serverTodo, syncStatus: 'synced' })
      } else if (
        localTodo.cached &&
        localTodo.lastModified &&
        serverTodo.lastModified
      ) {
        // Both have changes, check timestamps for conflict
        if (localTodo.lastModified > serverTodo.lastModified) {
          // Local is newer, keep local but mark as conflict for user review
          conflicts.push({
            id: this.generateOperationId(),
            entityType: 'todo',
            entityId: serverTodo.id,
            localData: localTodo,
            serverData: serverTodo,
            timestamp: Date.now(),
          })
          reconciled.push({ ...localTodo, syncStatus: 'conflict' })
        } else {
          // Server is newer, use server data
          reconciled.push({ ...serverTodo, syncStatus: 'synced' })
        }
      } else if (localTodo.cached) {
        // Local has changes, keep local
        reconciled.push({ ...localTodo, syncStatus: 'pending' })
      } else {
        // Use server data
        reconciled.push({ ...serverTodo, syncStatus: 'synced' })
      }
    }

    // Add local-only todos (new items created offline)
    for (const localTodo of localTodos) {
      if (!serverMap.has(localTodo.id)) {
        reconciled.push({ ...localTodo, syncStatus: 'pending' })
      }
    }

    return { reconciled, conflicts }
  }

  // Main sync function: fetch, reconcile, and push
  async performSync(localTodos: TodoItem[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      syncedOperations: [],
      failedOperations: [],
      conflicts: [],
    }

    try {
      // Step 1: Fetch server data
      const serverTodos = await this.fetchServerData()
      result.fetchedData = serverTodos

      // Step 2: Reconcile data
      const { reconciled, conflicts } = this.reconcileData(
        localTodos,
        serverTodos
      )
      result.conflicts = conflicts
      result.fetchedData = reconciled // Use reconciled data instead of raw server data

      // Save conflicts for user resolution
      if (conflicts.length > 0) {
        const existingConflicts = this.getSyncConflicts()
        this.saveSyncConflicts([...existingConflicts, ...conflicts])
      }

      // Step 3: Push pending operations
      const pendingOps = this.getPendingOperations()
      const syncedIds: string[] = []
      const failedOps: PendingSyncOperation[] = []

      for (const operation of pendingOps) {
        const success = await this.pushOperation(operation)
        if (success) {
          result.syncedOperations.push(operation)
          syncedIds.push(operation.id)
        } else {
          operation.retryCount++
          if (operation.retryCount < 3) {
            failedOps.push(operation)
          }
          result.failedOperations.push(operation)
        }
      }

      // Remove successfully synced operations
      this.removeCompletedOperations(syncedIds)

      // Update failed operations with retry count
      if (failedOps.length > 0) {
        this.savePendingOperations(failedOps)
      }

      // Update last sync timestamp
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString())

      result.success = true
      return result
    } catch (error) {
      result.error =
        error instanceof Error ? error.message : 'Unknown sync error'
      return result
    }
  }

  // Clear all sync data
  clearSyncData(): void {
    localStorage.removeItem(STORAGE_KEYS.PENDING_SYNC)
    localStorage.removeItem(STORAGE_KEYS.SYNC_CONFLICTS)
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC)
  }

  // Get last sync timestamp
  getLastSyncTimestamp(): number | null {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_SYNC)
    return stored ? parseInt(stored, 10) : null
  }
}

export const syncService = SyncService.getInstance()
