/**
 * Route Scroll Behavior Helper
 * 
 * Utility functions để tự động xác định scroll behavior cho routes
 */

import type { ScrollBehavior } from '../types/scroll-behavior'

/**
 * Tự động xác định scroll behavior dựa trên route path
 * 
 * @param path - Route path (e.g., '/he-thong/danh-sach-nhan-su', '/he-thong/danh-sach-nhan-su/:id')
 * @param routeType - Loại route: 'list' | 'detail' | 'form' | 'dashboard' | 'settings'
 * @returns ScrollBehavior phù hợp
 */
export function getDefaultScrollBehavior(
  path: string,
  routeType?: 'list' | 'detail' | 'form' | 'dashboard' | 'settings'
): ScrollBehavior {
  // Nếu có routeType, sử dụng nó
  if (routeType) {
    switch (routeType) {
      case 'list':
        return 'restore' // ListView - restore scroll khi quay lại
      case 'detail':
        return 'top' // DetailView - luôn scroll to top
      case 'form':
        return 'top' // FormView - luôn scroll to top
      case 'dashboard':
        return 'top' // Dashboard - luôn scroll to top
      case 'settings':
        return 'top' // Settings - luôn scroll to top
      default:
        return 'auto'
    }
  }

  // Tự động detect từ path
  // FormView: có /moi hoặc /sua ở cuối
  if (path.endsWith('/moi') || path.endsWith('/sua')) {
    return 'top'
  }

  // DetailView: có pattern /:id ở cuối (không phải form)
  if (path.includes('/:id') && !path.endsWith('/sua')) {
    return 'top'
  }

  // Settings/Profile
  if (path.includes('/settings') || path.includes('/ho-so') || path.includes('/doi-mat-khau')) {
    return 'top'
  }

  // Dashboard/Home
  if (path === '/' || path === '/dashboard' || path === '/home') {
    return 'top'
  }

  // ListView: mặc định
  return 'restore'
}

/**
 * Xác định route type từ route path
 * 
 * @param path - Route path
 * @returns Route type
 */
export function detectRouteTypeFromPath(path: string): 'list' | 'detail' | 'form' | 'dashboard' | 'settings' | undefined {
  if (path.endsWith('/moi') || path.endsWith('/sua')) {
    return 'form'
  }
  
  if (path.includes('/:id') && !path.endsWith('/sua')) {
    return 'detail'
  }
  
  if (path.includes('/settings') || path.includes('/ho-so') || path.includes('/doi-mat-khau')) {
    return 'settings'
  }
  
  if (path === '/' || path === '/dashboard' || path === '/home') {
    return 'dashboard'
  }
  
  return 'list'
}

