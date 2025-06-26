/**
 * Barrel export for all services
 * Provides clean imports and better organization
 */

// API services
export {
  ApiService,
  ApiError,
  apiService,
  TodoApiService,
  todoApi,
} from './apiService'
export type { ApiConfig, ApiResponse } from './apiService'

// Sync service
export { SyncService, syncService } from './syncService'

// Re-export types that might be needed
export type {
  PendingSyncOperation,
  SyncConflict,
  SyncResult,
  SyncOperationType,
} from '../types'
