export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export interface TodoItem {
  id: number
  title: string
  completed: boolean
  cached?: boolean
  lastModified?: number // Timestamp for conflict resolution
  syncStatus?: 'synced' | 'pending' | 'conflict' | 'error'
}

// Sync operation types
export type SyncOperationType = 'create' | 'update' | 'delete'

export interface PendingSyncOperation {
  id: string // Unique operation ID
  type: SyncOperationType
  entityType: 'todo'
  entityId: number
  data: Partial<TodoItem>
  timestamp: number
  retryCount: number
}

export interface SyncConflict {
  id: string
  entityType: 'todo'
  entityId: number
  localData: TodoItem
  serverData: TodoItem
  timestamp: number
}

export interface SyncResult {
  success: boolean
  syncedOperations: PendingSyncOperation[]
  failedOperations: PendingSyncOperation[]
  conflicts: SyncConflict[]
  fetchedData?: TodoItem[]
  error?: string
}
