/**
 * Formatting utilities for consistent data display
 */

/**
 * Formats load time in milliseconds to a human-readable string
 * Shows seconds if over 1000ms, otherwise shows milliseconds
 */
export function formatLoadTime(loadTimeMs: number | null): string {
  if (loadTimeMs === null) return '...'

  if (loadTimeMs >= 1000) {
    return `${(loadTimeMs / 1000).toFixed(2)}s`
  }

  return `${Math.round(loadTimeMs)}ms`
}

/**
 * Formats load time for tooltip with additional context
 */
export function formatLoadTimeTooltip(loadTimeMs: number | null): string {
  if (loadTimeMs === null) return 'Performance metrics loading...'

  const formattedTime = formatLoadTime(loadTimeMs)
  const performanceLevel =
    loadTimeMs < 100
      ? 'Excellent'
      : loadTimeMs < 500
        ? 'Good'
        : loadTimeMs < 1000
          ? 'Fair'
          : 'Slow'

  return `App loaded in ${formattedTime} - ${performanceLevel} performance!`
}

/**
 * Formats file sizes in bytes to human-readable strings
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Formats duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000)
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`

  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}

/**
 * Formats numbers with appropriate suffixes (K, M, B)
 */
export function formatNumber(num: number): string {
  if (num < 1000) return num.toString()
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`
  return `${(num / 1000000000).toFixed(1)}B`
}
