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

// Chi nhánh module routes
const ChiNhanhListRoute = lazy(() => import('@/features/he-thong/thiet-lap/chi-nhanh/routes/chi-nhanh-list-route'))
const ChiNhanhDetailRoute = lazy(() => import('@/features/he-thong/thiet-lap/chi-nhanh/routes/chi-nhanh-detail-route'))
const ChiNhanhFormRoute = lazy(() => import('@/features/he-thong/thiet-lap/chi-nhanh/routes/chi-nhanh-form-route'))

// Phòng ban module routes
const PhongBanListRoute = lazy(() => import('@/features/he-thong/so-do/phong-ban/routes/phong-ban-list-route'))
const PhongBanDetailRoute = lazy(() => import('@/features/he-thong/so-do/phong-ban/routes/phong-ban-detail-route'))
const PhongBanFormRoute = lazy(() => import('@/features/he-thong/so-do/phong-ban/routes/phong-ban-form-route'))

// Cấp bậc module routes
const CapBacListRoute = lazy(() => import('@/features/he-thong/so-do/cap-bac/routes/cap-bac-list-route'))
const CapBacDetailRoute = lazy(() => import('@/features/he-thong/so-do/cap-bac/routes/cap-bac-detail-route'))
const CapBacFormRoute = lazy(() => import('@/features/he-thong/so-do/cap-bac/routes/cap-bac-form-route'))

// Chức vụ module routes
const ChucVuListRoute = lazy(() => import('@/features/he-thong/so-do/chuc-vu/routes/chuc-vu-list-route'))
const ChucVuDetailRoute = lazy(() => import('@/features/he-thong/so-do/chuc-vu/routes/chuc-vu-detail-route'))
const ChucVuFormRoute = lazy(() => import('@/features/he-thong/so-do/chuc-vu/routes/chuc-vu-form-route'))

// Phân quyền module routes
const PhanQuyenListRoute = lazy(() => import('@/features/he-thong/thiet-lap/phan-quyen/routes/phan-quyen-list-route'))

// Kế hoạch 168 module routes
const KeHoach168ListRoute = lazy(() => import('@/features/cong-viec/tong-quan/ke-hoach-168/routes/ke-hoach-168-list-route'))

// Việc hàng ngày module routes
const ViecHangNgayListRoute = lazy(() => import('@/features/cong-viec/tong-quan/viec-hang-ngay/routes/viec-hang-ngay-list-route'))
const ViecHangNgayDetailRoute = lazy(() => import('@/features/cong-viec/tong-quan/viec-hang-ngay/routes/viec-hang-ngay-detail-route'))
const ViecHangNgayFormRoute = lazy(() => import('@/features/cong-viec/tong-quan/viec-hang-ngay/routes/viec-hang-ngay-form-route'))

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
  // Chi nhánh module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/he-thong/chi-nhanh/moi',
    element: ChiNhanhFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/chi-nhanh/:id/sua',
    element: ChiNhanhFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/chi-nhanh/:id',
    element: ChiNhanhDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/he-thong/chi-nhanh',
    element: ChiNhanhListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Phòng ban module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/he-thong/phong-ban/moi',
    element: PhongBanFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/phong-ban/:id/sua',
    element: PhongBanFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/phong-ban/:id',
    element: PhongBanDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/he-thong/phong-ban',
    element: PhongBanListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Cấp bậc module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/he-thong/cap-bac/moi',
    element: CapBacFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/cap-bac/:id/sua',
    element: CapBacFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/cap-bac/:id',
    element: CapBacDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/he-thong/cap-bac',
    element: CapBacListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Chức vụ module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/he-thong/chuc-vu/moi',
    element: ChucVuFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/chuc-vu/:id/sua',
    element: ChucVuFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/chuc-vu/:id',
    element: ChucVuDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/he-thong/chuc-vu',
    element: ChucVuListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Phân quyền module routes
  {
    path: '/he-thong/phan-quyen',
    element: PhanQuyenListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore',
  },
  // Kế hoạch 168 module routes
  {
    path: '/cong-viec/ke-hoach-168',
    element: KeHoach168ListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Việc hàng ngày module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/cong-viec/viec-hang-ngay/moi',
    element: ViecHangNgayFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/viec-hang-ngay/:id/sua',
    element: ViecHangNgayFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/viec-hang-ngay/:id',
    element: ViecHangNgayDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/cong-viec/viec-hang-ngay',
    element: ViecHangNgayListRoute,
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

