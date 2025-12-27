import { lazy } from 'react'

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const HomePage = lazy(() => import('@/pages/home/HomePage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const CustomersPage = lazy(() => import('@/pages/customers/CustomersPage'))
const ProductsPage = lazy(() => import('@/pages/products/ProductsPage'))
const InventoryPage = lazy(() => import('@/pages/inventory/InventoryPage'))
const OrdersPage = lazy(() => import('@/pages/orders/OrdersPage'))
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'))
const DocumentsPage = lazy(() => import('@/pages/documents/DocumentsPage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const HoSoDetailView = lazy(() => import('@/pages/profile/HoSoDetailView'))
const HoSoFormView = lazy(() => import('@/pages/profile/HoSoFormView'))
const ChangePasswordPage = lazy(() => import('@/pages/profile/ChangePasswordPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Module imports
// Note: Module routes can be auto-generated from module-registry.ts
// For now, we keep manual imports for explicit control

// Nhân sự module routes - explicit routes (no splat pattern)
const NhanSuListRoute = lazy(() => import('@/features/he-thong/nhan-su/danh-sach-nhan-su/routes/nhan-su-list-route'))
const NhanSuDetailRoute = lazy(() => import('@/features/he-thong/nhan-su/danh-sach-nhan-su/routes/nhan-su-detail-route'))
const NhanSuFormRoute = lazy(() => import('@/features/he-thong/nhan-su/danh-sach-nhan-su/routes/nhan-su-form-route'))

// Người thân module routes
const NguoiThanListRoute = lazy(() => import('@/features/he-thong/nhan-su/nguoi-than/routes/nguoi-than-list-route'))
const NguoiThanDetailRoute = lazy(() => import('@/features/he-thong/nhan-su/nguoi-than/routes/nguoi-than-detail-route'))
const NguoiThanFormRoute = lazy(() => import('@/features/he-thong/nhan-su/nguoi-than/routes/nguoi-than-form-route'))

// Thông tin công ty module routes
const ThongTinCongTyListRoute = lazy(() => import('@/features/he-thong/thiet-lap/thong-tin-cong-ty/routes/thong-tin-cong-ty-list-route'))
const ThongTinCongTyDetailRoute = lazy(() => import('@/features/he-thong/thiet-lap/thong-tin-cong-ty/routes/thong-tin-cong-ty-detail-route'))
const ThongTinCongTyFormRoute = lazy(() => import('@/features/he-thong/thiet-lap/thong-tin-cong-ty/routes/thong-tin-cong-ty-form-route'))

// Module dashboard pages
const CongViecPage = lazy(() => import('@/pages/cong-viec/CongViecPage'))
const HeThongPage = lazy(() => import('@/pages/he-thong/HeThongPage'))

import type { ScrollBehavior } from './shared/types/scroll-behavior'

export interface RouteConfig {
  path: string
  element: React.ComponentType
  protected?: boolean
  layout?: boolean
  /**
   * Scroll behavior cho route này
   * - 'top': Luôn scroll to top khi vào route
   * - 'preserve': Giữ nguyên scroll position (chỉ dùng cho query params changes)
   * - 'restore': Restore scroll position từ sessionStorage (cho ListView)
   * - 'auto': Tự động quyết định dựa trên route pattern (mặc định)
   */
  scrollBehavior?: ScrollBehavior
}

export const routes: RouteConfig[] = [
  {
    path: '/login',
    element: LoginPage,
    protected: false,
    layout: false,
  },
  {
    path: '/',
    element: HomePage,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/dashboard',
    element: DashboardPage,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/customers',
    element: CustomersPage,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại
  },
  {
    path: '/products',
    element: ProductsPage,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView
  },
  {
    path: '/inventory',
    element: InventoryPage,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView
  },
  {
    path: '/orders',
    element: OrdersPage,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView
  },
  {
    path: '/reports',
    element: ReportsPage,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/documents',
    element: DocumentsPage,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView
  },
  {
    path: '/settings',
    element: SettingsPage,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/ho-so',
    element: HoSoDetailView,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/ho-so/sua',
    element: HoSoFormView,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/doi-mat-khau',
    element: ChangePasswordPage,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  // Nhân sự module routes - sử dụng wildcard để handle tất cả sub-routes
  {
    path: '/cong-viec',
    element: CongViecPage,
    protected: true,
    layout: true,
    scrollBehavior: 'auto',
  },
  {
    path: '/he-thong',
    element: HeThongPage,
    protected: true,
    layout: true,
    scrollBehavior: 'auto',
  },
  // Nhân sự module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/he-thong/danh-sach-nhan-su/moi',
    element: NhanSuFormRoute, // Direct to form route, no redirect needed
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/danh-sach-nhan-su/:id/sua',
    element: NhanSuFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/danh-sach-nhan-su/:id',
    element: NhanSuDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/he-thong/danh-sach-nhan-su',
    element: NhanSuListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Người thân module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/he-thong/nguoi-than/moi',
    element: NguoiThanFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/nguoi-than/:id/sua',
    element: NguoiThanFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/nguoi-than/:id',
    element: NguoiThanDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/he-thong/nguoi-than',
    element: NguoiThanListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Thông tin công ty module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/he-thong/thong-tin-cong-ty/moi',
    element: ThongTinCongTyFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/thong-tin-cong-ty/:id/sua',
    element: ThongTinCongTyFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/thong-tin-cong-ty/:id',
    element: ThongTinCongTyDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/he-thong/thong-tin-cong-ty',
    element: ThongTinCongTyListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Add more module routes here or use generateRoutesFromConfig()
  {
    path: '*',
    element: NotFoundPage,
    protected: false,
    layout: false,
  },
]

