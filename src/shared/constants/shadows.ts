/**
 * Shadow Design Tokens
 * 
 * Hệ thống shadow thống nhất cho toàn bộ app ERP
 * Sử dụng Tailwind's default shadow scale
 */

export const SHADOWS = {
  // Standard shadow values
  none: 'shadow-none',       // No shadow
  sm: 'shadow-sm',           // Small shadow - Subtle elevation
  base: 'shadow',            // Default shadow - Cards, containers
  md: 'shadow-md',           // Medium shadow - Elevated cards
  lg: 'shadow-lg',           // Large shadow - Modals, dialogs
  xl: 'shadow-xl',           // Extra large shadow - Dropdowns
  '2xl': 'shadow-2xl',       // 2XL shadow - Very elevated
  inner: 'shadow-inner',     // Inner shadow - Inputs, insets
  
  // Component-specific presets
  card: 'shadow-sm',         // Cards - Subtle elevation
  button: 'shadow-sm',        // Buttons - Subtle on hover
  dropdown: 'shadow-lg',     // Dropdowns - Elevated
  dialog: 'shadow-xl',        // Dialogs - Very elevated
  tooltip: 'shadow-md',      // Tooltips - Medium elevation
  popover: 'shadow-lg',      // Popovers - Elevated
  toolbar: 'shadow-sm',      // Toolbar - Subtle border effect
} as const

/**
 * Shadow Presets for specific components
 */
export const SHADOW_PRESETS = {
  card: SHADOWS.card,
  button: SHADOWS.button,
  dropdown: SHADOWS.dropdown,
  dialog: SHADOWS.dialog,
  tooltip: SHADOWS.tooltip,
  popover: SHADOWS.popover,
  toolbar: SHADOWS.toolbar,
} as const

