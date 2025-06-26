/**
 * Barrel export for all hooks
 * Provides clean imports and better organization
 */

// Core PWA hooks
export { useAppStats } from './useAppStats'
export { useBackgroundSync } from './useBackgroundSync'
export { useNetworkStatus } from './useNetworkStatus'
export { useNotifications } from './useNotifications'
export { usePWAInstallation } from './usePWAInstallation'
export { useServerConnection } from './useServerConnection'
export { useServiceWorker } from './useServiceWorker'
export { useStatusItems } from './useStatusItems'
export { useTodos } from './useTodos'

// UI hooks
export { useIsMobile } from './use-mobile'

// Utility hooks
export {
  useLocalStorage,
  useLocalStorageCounter,
  useLocalStorageTimestamp,
} from './useLocalStorage'
export {
  useEventListener,
  useOnlineStatus,
  useMediaQuery,
} from './useEventListener'
export { useApi, useServerHealth } from './useApi'

// Re-export types that might be needed
export type { ApiState, ApiOptions } from './useApi'
