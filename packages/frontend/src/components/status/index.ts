/**
 * Status components barrel export
 * Following 2025 TypeScript best practices with explicit exports
 */

export { StatusIndicator } from './StatusIndicator'
export { StatusSection } from './StatusSection'
export { VisitStats } from './VisitStats'
export { SyncHistory } from './SyncHistory'
export { BackgroundSyncSection } from './BackgroundSyncSection'

export type {
  StatusType,
  StatusItem,
  BaseStatusItem,
  ClickableStatusItem,
  SyncType,
  SyncAction,
} from './types'

export {
  STATUS_TYPES,
  STATUS_CONFIG,
  SYNC_TYPES,
  SYNC_CONFIG,
  isClickableStatusItem,
} from './types'
