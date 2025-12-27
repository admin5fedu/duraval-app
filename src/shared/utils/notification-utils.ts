/**
 * Notification utility functions
 * Centralized logic for notification formatting and styling
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

/**
 * Get emoji icon for notification type
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'success':
      return '✅'
    case 'error':
      return '❌'
    case 'warning':
      return '⚠️'
    default:
      return 'ℹ️'
  }
}

/**
 * Get border color class for notification type
 */
export function getNotificationColorClass(type: NotificationType): string {
  switch (type) {
    case 'success':
      return 'border-l-primary'
    case 'error':
      return 'border-l-destructive'
    case 'warning':
      return 'border-l-[var(--warning)]'
    default:
      return 'border-l-secondary'
  }
}

