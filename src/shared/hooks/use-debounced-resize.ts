/**
 * useDebouncedResize Hook
 * 
 * Custom hook để debounce resize events, giảm số lần callback được gọi
 * Hữu ích khi cần update state dựa trên window resize
 * 
 * @param callback - Function được gọi khi resize (đã debounced)
 * @param delay - Delay time trong milliseconds (default: 100ms)
 * 
 * @example
 * ```tsx
 * useDebouncedResize(() => {
 *   setIsMobile(window.innerWidth < 768)
 * }, 150)
 * ```
 */

import * as React from "react"

export function useDebouncedResize(
    callback: () => void,
    delay: number = 100
) {
    React.useEffect(() => {
        let timeoutId: NodeJS.Timeout

        const handleResize = () => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(callback, delay)
        }

        // Initial call
        callback()

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            clearTimeout(timeoutId)
        }
    }, [callback, delay])
}

