/**
 * Typography Design Tokens
 * 
 * Hệ thống cỡ chữ thống nhất cho toàn bộ app ERP
 * Dựa trên quyết định: Toolbar buttons = text-xs, Section titles = text-base sm:text-lg
 */

export const TYPOGRAPHY = {
  // Font Sizes
  sizes: {
    xs: 'text-xs',      // 12px - Badges, small labels, toolbar buttons
    sm: 'text-sm',      // 14px - Body text, inputs, buttons (default)
    base: 'text-base',  // 16px - Section titles (mobile)
    lg: 'text-lg',      // 18px - Section titles (desktop)
    xl: 'text-xl',      // 20px - Page titles, dialog titles
    '2xl': 'text-2xl',  // 24px - Main headings (rare)
  },
  
  // Font Weights
  weights: {
    normal: 'font-normal',      // Body text
    medium: 'font-medium',      // Labels, buttons
    semibold: 'font-semibold',  // Titles, emphasized
    bold: 'font-bold',          // Rarely used
  },
  
  // Responsive Typography
  responsive: {
    // Section titles: text-base on mobile, text-lg on desktop
    sectionTitle: 'text-base sm:text-lg',
  },
} as const

/**
 * Button Typography Presets
 */
export const BUTTON_TYPOGRAPHY = {
  toolbar: {
    fontSize: TYPOGRAPHY.sizes.xs, // text-xs for toolbar buttons (compact)
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  default: {
    fontSize: TYPOGRAPHY.sizes.sm, // text-sm for default buttons
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  action: {
    fontSize: TYPOGRAPHY.sizes.sm, // text-sm for action buttons (Sửa, Xóa, Thêm mới, Lưu, Hủy)
    fontWeight: TYPOGRAPHY.weights.medium,
  },
} as const

/**
 * Badge Typography Presets
 */
export const BADGE_TYPOGRAPHY = {
  default: {
    fontSize: TYPOGRAPHY.sizes.xs, // text-xs - Minimum readable
    fontWeight: TYPOGRAPHY.weights.medium,
  },
} as const

/**
 * Table Typography Presets
 */
export const TABLE_TYPOGRAPHY = {
  header: {
    fontSize: 'text-xs md:text-sm', // Responsive
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  cell: {
    fontSize: 'text-xs md:text-sm', // Responsive
    fontWeight: TYPOGRAPHY.weights.normal,
  },
} as const

