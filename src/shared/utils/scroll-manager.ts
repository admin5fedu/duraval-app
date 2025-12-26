/**
 * Scroll Manager Service
 * 
 * Quản lý scroll positions và scroll behavior cho routes
 */

import type { ScrollPosition, ScrollBehavior, NavigationContext, RouteType } from '../types/scroll-behavior'

const SCROLL_STORAGE_PREFIX = 'scroll:'
const MAX_STORED_POSITIONS = 20 // Giới hạn số lượng positions lưu trữ
const POSITION_EXPIRY_MS = 30 * 60 * 1000 // 30 phút

/**
 * Scroll Manager Class
 */
class ScrollManager {
  private positions: Map<string, ScrollPosition> = new Map()

  constructor() {
    this.loadPositions()
  }

  /**
   * Lưu scroll position vào sessionStorage
   */
  saveScrollPosition(pathname: string, scrollTop: number): void {
    const position: ScrollPosition = {
      pathname,
      scrollTop,
      timestamp: Date.now(),
    }

    this.positions.set(pathname, position)
    this.persistPositions()
  }

  /**
   * Lấy scroll position từ sessionStorage
   */
  getScrollPosition(pathname: string): number | null {
    const position = this.positions.get(pathname)
    
    if (!position) {
      return null
    }

    // Kiểm tra expiry
    const age = Date.now() - position.timestamp
    if (age > POSITION_EXPIRY_MS) {
      this.positions.delete(pathname)
      this.persistPositions()
      return null
    }

    return position.scrollTop
  }

  /**
   * Xóa scroll position
   */
  clearScrollPosition(pathname: string): void {
    this.positions.delete(pathname)
    this.persistPositions()
  }

  /**
   * Xóa tất cả scroll positions
   */
  clearAllPositions(): void {
    this.positions.clear()
    this.persistPositions()
  }

  /**
   * Xác định route type từ pathname
   */
  detectRouteType(pathname: string): RouteType {
    // FormView: có /moi hoặc /sua ở cuối
    if (pathname.endsWith('/moi') || pathname.endsWith('/sua')) {
      return 'form'
    }
    
    // DetailView: có pattern /:id (số hoặc UUID) ở cuối, không phải form
    // Pattern: /path/to/:id (id là số hoặc UUID-like string)
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1]
      // Kiểm tra nếu last part là số (ID)
      if (/^\d+$/.test(lastPart)) {
        // Kiểm tra xem có phải form không (đã check ở trên)
        return 'detail'
      }
      // Kiểm tra nếu last part trông giống UUID hoặc ID string
      // (không phải "moi", "sua", và không phải route keyword)
      const routeKeywords = ['moi', 'sua', 'settings', 'dashboard', 'home']
      if (!routeKeywords.includes(lastPart) && lastPart.length > 5) {
        // Có thể là detail với string ID
        return 'detail'
      }
    }

    // Settings/Profile
    if (pathname.includes('/settings') || pathname.includes('/ho-so') || pathname.includes('/doi-mat-khau')) {
      return 'settings'
    }

    // Dashboard/Home
    if (pathname === '/' || pathname === '/dashboard' || pathname === '/home') {
      return 'dashboard'
    }

    // ListView: mặc định cho các route không match pattern trên
    // (các route như /customers, /products, /he-thong/danh-sach-nhan-su)
    return 'list'
  }

  /**
   * Xác định scroll behavior dựa trên navigation context
   */
  determineScrollBehavior(
    behavior: ScrollBehavior,
    context: NavigationContext
  ): 'top' | 'restore' | 'preserve' {
    // Nếu là 'top' hoặc 'preserve', trả về trực tiếp
    if (behavior === 'top') return 'top'
    if (behavior === 'preserve') return 'preserve'

    // Nếu là 'restore', kiểm tra context
    if (behavior === 'restore') {
      // Chỉ restore nếu quay lại từ detail/form về list
      if (context.isBack) {
        const fromType = this.detectRouteType(context.from)
        const toType = this.detectRouteType(context.to)
        
        // Restore nếu: detail/form → list
        if ((fromType === 'detail' || fromType === 'form') && toType === 'list') {
          return 'restore'
        }
      }
      // Nếu không phải back navigation, scroll to top
      return 'top'
    }

    // Nếu là 'auto', tự động quyết định
    if (behavior === 'auto') {
      const fromType = this.detectRouteType(context.from)
      const toType = this.detectRouteType(context.to)

      // Dashboard/Home: luôn top
      if (toType === 'dashboard') {
        return 'top'
      }

      // Form/Detail: luôn top
      if (toType === 'form' || toType === 'detail') {
        return 'top'
      }

      // Settings: luôn top
      if (toType === 'settings') {
        return 'top'
      }

      // ListView: restore nếu quay lại từ detail/form
      if (toType === 'list') {
        if (context.isBack && (fromType === 'detail' || fromType === 'form')) {
          return 'restore'
        }
        return 'top'
      }

      // Mặc định: top
      return 'top'
    }

    // Fallback: top
    return 'top'
  }

  /**
   * Kiểm tra xem có nên restore scroll không
   */
  shouldRestoreScroll(
    behavior: ScrollBehavior,
    context: NavigationContext
  ): boolean {
    const finalBehavior = this.determineScrollBehavior(behavior, context)
    return finalBehavior === 'restore'
  }

  /**
   * Load positions từ sessionStorage
   */
  private loadPositions(): void {
    try {
      const stored = sessionStorage.getItem(`${SCROLL_STORAGE_PREFIX}positions`)
      if (stored) {
        const data = JSON.parse(stored) as ScrollPosition[]
        const now = Date.now()
        
        // Filter expired positions
        const valid = data.filter(pos => {
          const age = now - pos.timestamp
          return age <= POSITION_EXPIRY_MS
        })

        // Limit to MAX_STORED_POSITIONS (LRU)
        const sorted = valid.sort((a, b) => b.timestamp - a.timestamp)
        const limited = sorted.slice(0, MAX_STORED_POSITIONS)

        this.positions = new Map(limited.map(pos => [pos.pathname, pos]))
      }
    } catch (error) {
      console.warn('Failed to load scroll positions:', error)
      this.positions.clear()
    }
  }

  /**
   * Persist positions vào sessionStorage
   */
  private persistPositions(): void {
    try {
      const positions = Array.from(this.positions.values())
      sessionStorage.setItem(`${SCROLL_STORAGE_PREFIX}positions`, JSON.stringify(positions))
    } catch (error) {
      console.warn('Failed to save scroll positions:', error)
    }
  }
}

// Singleton instance
export const scrollManager = new ScrollManager()

