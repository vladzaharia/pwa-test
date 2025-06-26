import { type ClassValue } from 'clsx'
import { cn } from './utils'

/**
 * Utility for creating component variants with consistent patterns
 * Extends the existing cn utility with component-specific helpers
 */

/**
 * Creates a data-slot attribute for consistent component identification
 */
export function createDataSlot(slotName: string) {
  return { 'data-slot': slotName }
}

/**
 * Combines className with data-slot for consistent component styling
 */
export function createComponentProps(
  slotName: string,
  className?: ClassValue,
  additionalProps?: Record<string, unknown>
) {
  return {
    ...createDataSlot(slotName),
    className: cn(className),
    ...additionalProps,
  }
}

/**
 * Focus ring utility for consistent focus styling across components
 */
export const focusRing =
  'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none'

/**
 * Disabled state utility for consistent disabled styling
 */
export const disabledState =
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'

/**
 * Common transition utility
 */
export const transition = 'transition-all duration-200'

/**
 * Interactive element base styles
 */
export const interactiveBase = cn(focusRing, transition)

/**
 * Form element base styles
 */
export const formElementBase = cn(
  'border-input bg-transparent rounded-md border shadow-xs',
  focusRing,
  disabledState,
  transition
)

/**
 * Button base styles
 */
export const buttonBase = cn(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
  'transition-all [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 [&_svg]:shrink-0',
  focusRing,
  disabledState
)

/**
 * Card base styles
 */
export const cardBase =
  'bg-card text-card-foreground rounded-xl border shadow-sm'

/**
 * Status indicator colors
 */
export const statusColors = {
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  info: 'text-blue-500',
} as const

/**
 * Utility for creating consistent spacing
 */
export const spacing = {
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
} as const

/**
 * Utility for creating consistent gaps
 */
export const gaps = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
} as const

/**
 * Utility for creating consistent border radius
 */
export const borderRadius = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
} as const

/**
 * Helper for creating responsive classes
 */
export function responsive(
  mobile: string,
  desktop?: string,
  tablet?: string
): string {
  const classes = [mobile]
  if (tablet) classes.push(`md:${tablet}`)
  if (desktop) classes.push(`lg:${desktop}`)
  return cn(classes)
}

/**
 * Helper for conditional classes
 */
export function conditionalClass(
  condition: boolean,
  trueClass: string,
  falseClass?: string
): string {
  return condition ? trueClass : falseClass || ''
}
