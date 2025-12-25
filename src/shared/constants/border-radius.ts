/**
 * Border Radius Design Tokens
 * 
 * Hệ thống border radius thống nhất cho toàn bộ app ERP
 * Sử dụng Tailwind's default radius scale
 */

export const BORDER_RADIUS = {
  // Standard radius values
  none: 'rounded-none',      // 0px
  sm: 'rounded-sm',          // 2px - Small elements
  base: 'rounded',           // 4px - Default
  md: 'rounded-md',          // 6px - Medium elements
  lg: 'rounded-lg',          // 8px - Cards, containers
  xl: 'rounded-xl',          // 12px - Large cards
  '2xl': 'rounded-2xl',      // 16px - Extra large
  '3xl': 'rounded-3xl',      // 24px - Very large
  full: 'rounded-full',      // 9999px - Pills, avatars
  
  // Component-specific presets
  button: 'rounded-md',      // Buttons
  card: 'rounded-lg',        // Cards
  input: 'rounded-md',       // Input fields
  badge: 'rounded-sm',       // Badges
  avatar: 'rounded-full',    // Avatars
  tooltip: 'rounded-md',     // Tooltips
  popover: 'rounded-lg',     // Popovers
  dialog: 'rounded-lg',       // Dialogs
} as const

/**
 * Border Radius Presets for specific components
 */
export const RADIUS_PRESETS = {
  button: BORDER_RADIUS.button,
  card: BORDER_RADIUS.card,
  input: BORDER_RADIUS.input,
  badge: BORDER_RADIUS.badge,
  avatar: BORDER_RADIUS.avatar,
  tooltip: BORDER_RADIUS.tooltip,
  popover: BORDER_RADIUS.popover,
  dialog: BORDER_RADIUS.dialog,
} as const

