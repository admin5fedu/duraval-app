/**
 * useElementHeight Hook
 * 
 * Custom hook để đo chiều cao động của một element sử dụng ResizeObserver
 * Tự động update khi element resize
 * 
 * @example
 * ```tsx
 * const { ref, height } = useElementHeight<HTMLDivElement>()
 * 
 * return <div ref={ref}>Content</div>
 * ```
 */

import * as React from "react"

export function useElementHeight<T extends HTMLElement = HTMLDivElement>() {
    const ref = React.useRef<T>(null)
    const [height, setHeight] = React.useState(0)

    React.useEffect(() => {
        const updateHeight = () => {
            if (ref.current) {
                setHeight(ref.current.offsetHeight)
            }
        }

        // Initial measurement với delay nhỏ để đảm bảo DOM đã render
        const timeoutId = setTimeout(updateHeight, 0)

        // Use ResizeObserver for accurate tracking
        let observer: ResizeObserver | null = null
        if (ref.current && typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(updateHeight)
            observer.observe(ref.current)
        }

        // Fallback: listen for window resize (sẽ được debounce ở level cao hơn nếu cần)
        window.addEventListener('resize', updateHeight)

        return () => {
            clearTimeout(timeoutId)
            window.removeEventListener('resize', updateHeight)
            if (observer && ref.current) {
                observer.unobserve(ref.current)
            }
        }
    }, [])

    return { ref, height }
}

