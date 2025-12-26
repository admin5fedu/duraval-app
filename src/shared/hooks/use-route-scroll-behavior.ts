/**
 * Hook để lấy scroll behavior từ route config dựa trên pathname hiện tại
 */

import { useMemo } from 'react'
import { useLocation, matchPath } from 'react-router-dom'
import { routes } from '@/routes'
import type { ScrollBehavior } from '../types/scroll-behavior'

/**
 * Hook để lấy scroll behavior cho route hiện tại
 */
export function useRouteScrollBehavior(): ScrollBehavior {
  const location = useLocation()

  const scrollBehavior = useMemo(() => {
    // Sắp xếp routes theo độ ưu tiên: specific routes trước, wildcard sau
    // Routes có pattern params (/:id) nên được match sau routes exact
    const sortedRoutes = [...routes].sort((a, b) => {
      const aHasParams = a.path.includes(':')
      const bHasParams = b.path.includes(':')
      if (aHasParams && !bHasParams) return 1
      if (!aHasParams && bHasParams) return -1
      return 0
    })

    // Tìm route match với pathname hiện tại
    for (const route of sortedRoutes) {
      // Match path (không cần exact vì có thể có params)
      const match = matchPath(
        { path: route.path },
        location.pathname
      )

      if (match) {
        return route.scrollBehavior || 'auto'
      }
    }

    // Fallback: auto
    return 'auto'
  }, [location.pathname])

  return scrollBehavior
}

