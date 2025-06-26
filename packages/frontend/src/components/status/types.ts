/**
 * Status types and configurations for PWA status components
 * Following 2025 TypeScript best practices with const assertions and satisfies operator
 */

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

// Status types with const assertion for better type inference
export const STATUS_TYPES = ['success', 'warning', 'error', 'info'] as const
export type StatusType = (typeof STATUS_TYPES)[number]

// Status configuration with satisfies operator for type safety
export const STATUS_CONFIG = {
  success: {
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  warning: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  error: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  info: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
} as const satisfies Record<StatusType, { color: string; bgColor: string }>

// Base status item interface
export interface BaseStatusItem {
  readonly id: string
  readonly icon: LucideIcon | ReactNode
  readonly label: string
  readonly status: StatusType
  readonly tooltip: string
  readonly hideIndicator?: boolean // Optional flag to hide status indicator
}

// Clickable status item interface
export interface ClickableStatusItem extends BaseStatusItem {
  readonly onClick: () => void
  readonly disabled?: boolean
}

// Status item union type
export type StatusItem = BaseStatusItem | ClickableStatusItem

// Type guard for clickable items
export const isClickableStatusItem = (
  item: StatusItem
): item is ClickableStatusItem => {
  return 'onClick' in item
}

// Sync action types
export const SYNC_TYPES = [
  'background',
  'forced',
  'service-worker',
  'synced',
  'initial',
  'manual',
  'nothing',
] as const
export type SyncType = (typeof SYNC_TYPES)[number]

export interface SyncAction {
  readonly id: string
  readonly type: SyncType
  readonly message: string
  readonly timestamp: Date
}

// Sync configuration
export const SYNC_CONFIG = {
  background: {
    color: 'text-green-500', // Green for successful background sync
    label: 'Background',
  },
  forced: {
    color: 'text-red-500', // Red for failed sync
    label: 'Failed',
  },
  'service-worker': {
    color: 'text-purple-400',
    label: 'Service Worker',
  },
  synced: {
    color: 'text-green-400',
    label: 'Synced',
  },
  initial: {
    color: 'text-blue-500', // Blue for initial sync
    label: 'Initial',
  },
  manual: {
    color: 'text-green-500', // Green for successful manual sync
    label: 'Manual',
  },
  nothing: {
    color: 'text-cyan-500', // Cyan for nothing to sync
    label: 'Nothing',
  },
} as const satisfies Record<SyncType, { color: string; label: string }>
