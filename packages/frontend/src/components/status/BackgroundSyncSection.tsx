/**
 * BackgroundSyncSection component - Handles background sync display and controls
 * Following 2025 TypeScript best practices
 */

import { forwardRef, useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { StatusIndicator } from './StatusIndicator'
import { type StatusItem, type SyncAction } from './types'
import { cn } from '../../lib/utils'

interface BackgroundSyncSectionProps {
  readonly syncActions: readonly SyncAction[]
  readonly onForcedSync: () => void // Manual sync trigger
  readonly className?: string
}

export const BackgroundSyncSection = forwardRef<
  HTMLDivElement,
  BackgroundSyncSectionProps
>(({ syncActions, onForcedSync, className }, ref) => {
  const syncItem = useMemo(
    (): StatusItem => ({
      id: 'sync',
      icon: RefreshCw,
      label: 'Sync Data',
      status: syncActions.length > 0 ? 'success' : 'info',
      tooltip: 'Sync data with the server', // Simple tooltip, no popover needed
      onClick: onForcedSync,
    }),
    [syncActions.length, onForcedSync]
  )

  return (
    <div ref={ref} className={cn('space-y-1', className)}>
      <StatusIndicator
        item={syncItem}
        showTooltip={false}
        hideIndicator={true}
      />
    </div>
  )
})

BackgroundSyncSection.displayName = 'BackgroundSyncSection'
