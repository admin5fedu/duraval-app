/**
 * Layout Constants
 * 
 * Centralized constants for layout measurements and breakpoints
 * Used for calculating responsive heights and spacing
 */

export const LAYOUT_CONSTANTS = {
    /** TopBar height in pixels (h-16 = 64px) */
    TOP_BAR_HEIGHT: 64,
    
    /** Mobile footer navigation height in pixels (h-16 = 64px) */
    MOBILE_FOOTER_HEIGHT: 64,
    
    /** Mobile padding (p-3 = 12px * 2 = 24px total) */
    MOBILE_PADDING: 12 * 2,
    
    /** Desktop padding (p-4 = 16px * 2 = 32px total) */
    DESKTOP_PADDING: 16 * 2,
    
    /** Mobile breakpoint in pixels (md breakpoint = 768px) */
    MOBILE_BREAKPOINT: 768,
    
    /** Estimated header height for fallback calculations */
    ESTIMATED_HEADER_HEIGHT: 48,
    
    /** Estimated footer height for fallback calculations */
    ESTIMATED_FOOTER_HEIGHT: 48,
    
    /** Minimum table height to ensure usability on very small screens */
    MIN_TABLE_HEIGHT: 200,
} as const

/**
 * Calculate container height for list view
 * @param isMobile - Whether current viewport is mobile
 * @returns CSS calc string for container height
 */
export function getListViewContainerHeight(isMobile: boolean): string {
    const { TOP_BAR_HEIGHT, MOBILE_FOOTER_HEIGHT, MOBILE_PADDING, DESKTOP_PADDING } = LAYOUT_CONSTANTS
    
    if (isMobile) {
        return `calc(100vh - ${TOP_BAR_HEIGHT}px - ${MOBILE_FOOTER_HEIGHT}px - ${MOBILE_PADDING}px)`
    } else {
        return `calc(100vh - ${TOP_BAR_HEIGHT}px - ${DESKTOP_PADDING}px)`
    }
}

