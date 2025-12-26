/**
 * Scroll Behavior Types
 * 
 * Định nghĩa các loại scroll behavior cho routes trong ứng dụng
 */

/**
 * Scroll behavior options cho routes
 */
export type ScrollBehavior = 
  | 'top'           // Luôn scroll to top khi vào route
  | 'preserve'       // Giữ nguyên scroll position (chỉ dùng cho query params changes)
  | 'restore'        // Restore scroll position từ sessionStorage (cho ListView)
  | 'auto'           // Tự động quyết định dựa trên route pattern

/**
 * Route type để tự động xác định scroll behavior
 */
export type RouteType = 
  | 'dashboard'     // Dashboard/Home pages
  | 'list'          // ListView pages
  | 'detail'        // DetailView pages
  | 'form'          // FormView pages (create/edit)
  | 'settings'      // Settings/Profile pages
  | 'other'         // Other pages

/**
 * Scroll position data được lưu trong sessionStorage
 */
export interface ScrollPosition {
  pathname: string
  scrollTop: number
  timestamp: number
}

/**
 * Navigation context để quyết định scroll behavior
 */
export interface NavigationContext {
  from: string      // Pathname trước đó
  to: string        // Pathname hiện tại
  isBack: boolean   // Có phải browser back/forward không
  isDirect: boolean // Có phải direct navigation (URL trực tiếp) không
}

