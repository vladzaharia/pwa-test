/**
 * SyncHistory component - Displays background sync history
 * Following 2025 TypeScript best practices
 */

import { forwardRef } from 'react'
import { Circle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { SYNC_CONFIG, type SyncAction } from './types'
import { cn } from '../../lib/utils'

interface SyncHistoryProps {
  readonly actions: readonly SyncAction[]
  readonly maxEntries?: number
  readonly className?: string
}

export const SyncHistory = forwardRef<HTMLDivElement, SyncHistoryProps>(
  ({ actions, maxEntries = 4, className }, ref) => {
    if (actions.length === 0) {
      return null
    }

    const recentActions = actions.slice(-maxEntries).reverse()
    const remainingCount = Math.max(0, actions.length - maxEntries)

    return (
      <div ref={ref} className={cn('mx-2 space-y-1', className)}>
        <div className="space-y-0.5 max-h-20 overflow-y-auto">
          {recentActions.map((action) => {
            const syncConfig = SYNC_CONFIG[action.type]

            return (
              <div
                key={action.id}
                className="text-xs text-muted-foreground flex items-start gap-2"
              >
                <Circle
                  className={cn(
                    'h-1.5 w-1.5 mt-1 flex-shrink-0',
                    syncConfig.color
                  )}
                />
                <span className="truncate flex-1">{action.message}</span>
                <span className="text-muted-foreground/70 text-[10px] mt-0.5 flex-shrink-0">
                  {formatDistanceToNow(action.timestamp, { addSuffix: true })}
                </span>
              </div>
            )
          })}
          {remainingCount > 0 && (
            <div className="text-xs text-muted-foreground/60 italic">
              ... and {remainingCount} more
            </div>
          )}
        </div>
      </div>
    )
  }
)

SyncHistory.displayName = 'SyncHistory'
