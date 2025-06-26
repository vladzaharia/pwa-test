/**
 * StatusIndicator component - Reusable status display component
 * Following 2025 TypeScript best practices
 */

import React, { type FC } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { CheckCircle, AlertCircle, XCircle, Circle } from 'lucide-react'
import {
  STATUS_CONFIG,
  type StatusType,
  type StatusItem,
  isClickableStatusItem,
} from './types'
import { cn } from '../../lib/utils'

// Status icon mapping with const assertion
const STATUS_ICONS = {
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
  info: Circle,
} as const satisfies Record<StatusType, typeof CheckCircle>

interface StatusIndicatorProps {
  readonly item: StatusItem
  readonly className?: string
  readonly displayValue?: string | number // Optional value to display instead of status badge
  readonly showTooltip?: boolean // Whether to show tooltip (default: true)
  readonly hideIndicator?: boolean // Whether to hide the status indicator (default: false)
}

export const StatusIndicator: FC<StatusIndicatorProps> = ({
  item,
  className,
  displayValue,
  showTooltip = true,
  hideIndicator = false,
}) => {
  const isClickable = isClickableStatusItem(item)
  const StatusIcon = STATUS_ICONS[item.status]
  const statusConfig = STATUS_CONFIG[item.status]

  const sharedClassName = cn(
    'flex items-center justify-between p-2 rounded-md transition-colors w-full min-h-[2.5rem]',
    isClickable && !item.disabled && 'hover:bg-sidebar-accent cursor-pointer',
    isClickable && item.disabled && 'cursor-not-allowed hover:bg-transparent',
    !isClickable && 'cursor-default',
    className
  )

  const content = (
    <div
      className={sharedClassName}
      onClick={isClickable && !item.disabled ? item.onClick : undefined}
      onKeyDown={
        isClickable && !item.disabled
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                item.onClick?.()
              }
            }
          : undefined
      }
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable && !item.disabled ? 0 : -1}
      aria-disabled={isClickable && item.disabled}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {React.isValidElement(item.icon)
          ? item.icon
          : React.createElement(
              item.icon as React.ComponentType<{ className?: string }>,
              {
                className: cn(
                  'h-4 w-4',
                  isClickable && item.disabled && 'text-muted-foreground'
                ),
              }
            )}
        <span
          className={cn(
            'text-sm font-medium truncate',
            isClickable && item.disabled && 'text-muted-foreground'
          )}
        >
          {item.label}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {displayValue !== undefined ? (
          <span
            className={cn(
              'text-sm font-medium',
              isClickable && item.disabled
                ? 'text-muted-foreground'
                : 'text-muted-foreground'
            )}
          >
            {displayValue}
          </span>
        ) : hideIndicator || item.hideIndicator ? null : isClickable && // No indicator for items like Share or when hideIndicator prop is true
          item.disabled ? (
          <Circle className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
        ) : (
          <StatusIcon
            className={cn(
              'h-3 w-3 flex-shrink-0',
              isClickable && item.disabled
                ? 'text-muted-foreground'
                : statusConfig.color
            )}
          />
        )}
      </div>
    </div>
  )

  // Only show tooltip if showTooltip is true and tooltip provides additional info
  if (!showTooltip) {
    return content
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <p>{item.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
