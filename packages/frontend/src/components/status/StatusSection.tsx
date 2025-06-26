/**
 * StatusSection component - Groups related status items
 * Following 2025 TypeScript best practices
 */

import { forwardRef, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface StatusSectionProps {
  readonly title?: string
  readonly children: ReactNode
  readonly className?: string
}

export const StatusSection = forwardRef<HTMLDivElement, StatusSectionProps>(
  ({ title, children, className }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-1', className)}>
        {title && (
          <h3 className="text-xs font-medium text-muted-foreground px-2 py-1">
            {title}
          </h3>
        )}
        <div className="space-y-1">{children}</div>
      </div>
    )
  }
)

StatusSection.displayName = 'StatusSection'
