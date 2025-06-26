/**
 * VisitStats component - Displays visit statistics
 * Following 2025 TypeScript best practices
 */

import { forwardRef } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '../../lib/utils'

interface VisitStatsProps {
  readonly visitCount: number
  readonly lastVisit: string | null
  readonly className?: string
}

export const VisitStats = forwardRef<HTMLDivElement, VisitStatsProps>(
  ({ visitCount, lastVisit, className }, ref) => {
    const getVisitMessage = () => {
      if (visitCount === 1) {
        return 'Welcome! This is your first visit.'
      }

      if (lastVisit && visitCount > 1) {
        return `Last visit: ${new Date(lastVisit).toLocaleString()}`
      }

      return `You've visited ${visitCount} times.`
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2 p-2 rounded-md', className)}
      >
        <Clock className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">Visit #{visitCount}</div>
          <div className="text-xs text-muted-foreground">
            {getVisitMessage()}
          </div>
        </div>
      </div>
    )
  }
)

VisitStats.displayName = 'VisitStats'
