/**
 * Scroll Restoration Component
 * 
 * Component tích hợp với React Router để tự động quản lý scroll behavior
 * khi chuyển route
 */

import { useEffect, useRef, useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { scrollManager } from '../utils/scroll-manager'
import { useRouteScrollBehavior } from '../hooks/use-route-scroll-behavior'
import type { ScrollBehavior, NavigationContext } from '../types/scroll-behavior'

interface ScrollRestorationProps {
  /**
   * Scroll container ref - element sẽ được scroll
   * Nếu không cung cấp, sẽ tự động tìm scroll container trong Layout
   */
  scrollContainerRef?: React.RefObject<HTMLElement>
  
  /**
   * Scroll behavior cho route hiện tại
   * Nếu không cung cấp, sẽ tự động detect từ route config
   */
  scrollBehavior?: ScrollBehavior
  
  /**
   * Delay trước khi scroll (ms)
   * Hữu ích khi content lazy load
   */
  scrollDelay?: number
  
  /**
   * Enable smooth scrolling
   */
  smooth?: boolean
}

/**
 * Tìm scroll container trong DOM
 */
function findScrollContainer(element: HTMLElement | null): HTMLElement | null {
  if (!element) return null
  
  // Kiểm tra element hiện tại
  const style = window.getComputedStyle(element)
  const overflowY = style.overflowY || style.overflow
  
  if (overflowY === 'auto' || overflowY === 'scroll') {
    return element
  }
  
  // Tìm parent có scroll
  let parent = element.parentElement
  while (parent && parent !== document.body) {
    const parentStyle = window.getComputedStyle(parent)
    const parentOverflowY = parentStyle.overflowY || parentStyle.overflow
    
    if (parentOverflowY === 'auto' || parentOverflowY === 'scroll') {
      return parent
    }
    
    parent = parent.parentElement
  }
  
  // Fallback: window
  return null
}

/**
 * Scroll Restoration Component
 */
export function ScrollRestoration({
  scrollContainerRef,
  scrollBehavior: propScrollBehavior,
  scrollDelay = 0,
  smooth = false,
}: ScrollRestorationProps) {
  const location = useLocation()
  const navigationType = useNavigationType()
  const routeScrollBehavior = useRouteScrollBehavior()
  const previousPathnameRef = useRef<string>(location.pathname)
  const containerRef = useRef<HTMLElement | null>(null)
  const isInitialMountRef = useRef(true)
  
  // Ưu tiên prop, sau đó route config, cuối cùng là 'auto'
  const scrollBehavior = propScrollBehavior ?? routeScrollBehavior

  // Tìm scroll container
  useEffect(() => {
    if (scrollContainerRef?.current) {
      containerRef.current = scrollContainerRef.current
    } else {
      // Tìm scroll container trong Layout
      // Layout có class "flex-1 overflow-y-auto"
      const layoutContainer = document.querySelector('.flex-1.overflow-y-auto') as HTMLElement
      if (layoutContainer) {
        containerRef.current = layoutContainer
      } else {
        // Fallback: tìm scroll container từ body hoặc window
        const found = findScrollContainer(document.body)
        containerRef.current = found || (window as any)
      }
    }
  }, [scrollContainerRef])

  // Scroll handler
  useLayoutEffect(() => {
    // Skip initial mount (chỉ xử lý khi route thay đổi)
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
      previousPathnameRef.current = location.pathname
      return
    }

    const currentPathname = location.pathname
    const previousPathname = previousPathnameRef.current

    // Chỉ xử lý khi pathname thay đổi (không phải query params)
    if (currentPathname === previousPathname) {
      return
    }

    const container = containerRef.current
    if (!container) return

    // Tạo navigation context
    const isBack = navigationType === 'POP'
    const isDirect = navigationType === 'POP' && !previousPathname

    const context: NavigationContext = {
      from: previousPathname,
      to: currentPathname,
      isBack,
      isDirect,
    }

    // Xác định scroll behavior
    const shouldRestore = scrollManager.shouldRestoreScroll(scrollBehavior, context)
    const finalBehavior = scrollManager.determineScrollBehavior(scrollBehavior, context)

    const performScroll = () => {
      if (finalBehavior === 'restore' && shouldRestore) {
        // Restore scroll position
        const savedPosition = scrollManager.getScrollPosition(currentPathname)
        if (savedPosition !== null) {
          if (container === window) {
            window.scrollTo({
              top: savedPosition,
              behavior: smooth ? 'smooth' : 'auto',
            })
          } else {
            container.scrollTo({
              top: savedPosition,
              behavior: smooth ? 'smooth' : 'auto',
            })
          }
        } else {
          // Fallback to top nếu không có saved position
          if (container === window) {
            window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
          } else {
            container.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
          }
        }
      } else {
        // Scroll to top
        if (container === window) {
          window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
        } else {
          container.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
        }
      }
    }

    // Delay nếu cần
    if (scrollDelay > 0) {
      const timeoutId = setTimeout(performScroll, scrollDelay)
      return () => clearTimeout(timeoutId)
    } else {
      // Sử dụng requestAnimationFrame để đảm bảo DOM đã render
      requestAnimationFrame(() => {
        requestAnimationFrame(performScroll)
      })
    }

    // Update previous pathname
    previousPathnameRef.current = currentPathname
  }, [location.pathname, navigationType, scrollBehavior, scrollDelay, smooth])

  // Lưu scroll position khi scroll (throttle)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = container === window 
            ? window.scrollY 
            : (container as HTMLElement).scrollTop

          // Chỉ lưu nếu scroll behavior là 'restore' hoặc 'auto' và route type là 'list'
          const routeType = scrollManager.detectRouteType(location.pathname)
          if (routeType === 'list') {
            scrollManager.saveScrollPosition(location.pathname, scrollTop)
          }

          ticking = false
        })
        ticking = true
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [location.pathname])

  return null
}

