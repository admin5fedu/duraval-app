/**
 * Spacing Design Tokens
 * 
 * Hệ thống spacing thống nhất cho toàn bộ app ERP
 * Dựa trên quyết định: Toolbar gap-2, Form gap-4, Card p-4
 */

/**
 * Base spacing values - defined first to avoid circular reference
 */
const GAP_VALUES = {
  xs: 'gap-1',      // 4px - Very tight spacing
  sm: 'gap-2',      // 8px - Toolbar spacing (compact)
  md: 'gap-3',      // 12px - Medium spacing
  base: 'gap-4',    // 16px - Form section gap (compact)
  lg: 'gap-6',      // 24px - Large spacing
  xl: 'gap-8',      // 32px - Extra large spacing
} as const

const PADDING_VALUES = {
  xs: 'p-1',        // 4px
  sm: 'p-2',        // 8px
  md: 'p-3',        // 12px
  base: 'p-4',      // 16px - Card padding (compact)
  lg: 'p-6',        // 24px
  xl: 'p-8',        // 32px
} as const

const PADDING_X_VALUES = {
  xs: 'px-1',       // 4px
  sm: 'px-2',       // 8px
  md: 'px-3',       // 12px
  base: 'px-4',     // 16px
  lg: 'px-6',       // 24px
} as const

const PADDING_Y_VALUES = {
  xs: 'py-1',       // 4px
  sm: 'py-2',       // 8px
  md: 'py-3',       // 12px
  base: 'py-4',     // 16px
  lg: 'py-6',       // 24px
} as const

/**
 * Main spacing design tokens
 */
export const SPACING = {
  gap: GAP_VALUES,
  padding: PADDING_VALUES,
  paddingX: PADDING_X_VALUES,
  paddingY: PADDING_Y_VALUES,
  // Component-specific spacing (using direct values to avoid circular reference)
  toolbar: {
    gap: GAP_VALUES.sm, // gap-2 (8px) - Compact
  },
  form: {
    sectionGap: GAP_VALUES.base, // gap-4 (16px) - Compact
  },
  card: {
    padding: PADDING_VALUES.base, // p-4 (16px) - Compact
  },
} as const

/**
 * Toolbar spacing presets
 */
export const TOOLBAR_SPACING = {
  gap: GAP_VALUES.sm, // gap-2 (8px)
  paddingY: 'py-2',
  paddingX: 'px-2',
} as const

/**
 * Form spacing presets
 */
export const FORM_SPACING = {
  sectionGap: GAP_VALUES.base, // gap-4 (16px)
  containerSpaceY: 'space-y-4', // space-y-4 (16px)
} as const

/**
 * Card spacing presets
 */
export const CARD_SPACING = {
  padding: PADDING_VALUES.base, // p-4 (16px)
} as const

