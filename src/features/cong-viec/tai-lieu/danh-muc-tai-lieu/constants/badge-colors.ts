/**
 * Badge Color Constants
 * 
 * Centralized badge color mappings for Danh Mục Tài Liệu module
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

/**
 * Badge colors for Cấp (Level)
 */
export const CAP_BADGE_COLORS: Record<number, string> = {
    1: "bg-green-50 text-green-700 border-green-200",
    2: "bg-orange-50 text-orange-700 border-orange-200",
}

/**
 * Default badge color for unknown Cấp
 */
export const CAP_DEFAULT_BADGE_COLOR = "bg-gray-50 text-gray-700 border-gray-200"

/**
 * Get badge color class for Cấp
 * 
 * @param cap - Cấp value (1 or 2)
 * @returns Badge color class string
 */
export function getCapBadgeColor(cap: number | null | undefined): string {
    if (cap === null || cap === undefined) return CAP_DEFAULT_BADGE_COLOR
    return CAP_BADGE_COLORS[cap] || CAP_DEFAULT_BADGE_COLOR
}

