/**
 * Badge Color Constants
 * 
 * Centralized badge color mappings for Tài Liệu & Biểu Mẫu module
 */

/**
 * Badge colors for Hạng Mục (Category)
 */
export const HANG_MUC_BADGE_COLORS: Record<string, string> = {
    "Biểu mẫu & Kế hoạch": "bg-blue-50 text-blue-700 border-blue-200",
    "Văn bản hệ thống": "bg-purple-50 text-purple-700 border-purple-200",
}

/**
 * Default badge color for unknown Hạng Mục
 */
export const HANG_MUC_DEFAULT_BADGE_COLOR = "bg-gray-50 text-gray-700 border-gray-200"

/**
 * Get badge color class for Hạng Mục
 * 
 * @param hangMuc - Hạng mục value
 * @returns Badge color class string
 */
export function getHangMucBadgeColor(hangMuc: string | null | undefined): string {
    if (!hangMuc) return HANG_MUC_DEFAULT_BADGE_COLOR
    return HANG_MUC_BADGE_COLORS[hangMuc] || HANG_MUC_DEFAULT_BADGE_COLOR
}

