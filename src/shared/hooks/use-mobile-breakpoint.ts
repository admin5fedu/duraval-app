/**
 * useMobileBreakpoint Hook
 * 
 * Custom hook để detect mobile/desktop breakpoint
 * Sử dụng ResizeObserver và debounce để optimize performance
 * 
 * @param breakpoint - Breakpoint value in pixels (default: 768px)
 * @returns { isMobile, width } - Current breakpoint state and window width
 * 
 * @example
 * ```tsx
 * const { isMobile } = useMobileBreakpoint()
 * 
 * return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>
 * ```
 */

import * as React from "react"
import { LAYOUT_CONSTANTS } from "@/shared/constants"

export function useMobileBreakpoint(breakpoint: number = LAYOUT_CONSTANTS.MOBILE_BREAKPOINT) {
    const [isMobile, setIsMobile] = React.useState(false)
    const [width, setWidth] = React.useState(0)

    React.useEffect(() => {
        const checkBreakpoint = () => {
            const currentWidth = window.innerWidth
            setWidth(currentWidth)
            setIsMobile(currentWidth < breakpoint)
        }

        // Initial check
        checkBreakpoint()

        // Debounced resize handler
        let timeoutId: NodeJS.Timeout
        const handleResize = () => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(checkBreakpoint, 100)
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            clearTimeout(timeoutId)
        }
    }, [breakpoint])

    return { isMobile, width }
}

