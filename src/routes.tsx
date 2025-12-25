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
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'))
const ChangePasswordPage = lazy(() => import('@/pages/profile/ChangePasswordPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Nhân sự module - sử dụng orchestrator pattern
const DanhSachNhanSuModule = lazy(() => import('@/features/he-thong/nhan-su/danh-sach-nhan-su/index'))
// Module dashboard pages
const CongViecPage = lazy(() => import('@/pages/cong-viec/CongViecPage'))
const HeThongPage = lazy(() => import('@/pages/he-thong/HeThongPage'))

export interface RouteConfig {
  path: string
  element: React.ComponentType
  protected?: boolean
  layout?: boolean
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
  },
  {
    path: '/dashboard',
    element: DashboardPage,
    protected: true,
    layout: true,
  },
  {
    path: '/customers',
    element: CustomersPage,
    protected: true,
    layout: true,
  },
  {
    path: '/products',
    element: ProductsPage,
    protected: true,
    layout: true,
  },
  {
    path: '/inventory',
    element: InventoryPage,
    protected: true,
    layout: true,
  },
  {
    path: '/orders',
    element: OrdersPage,
    protected: true,
    layout: true,
  },
  {
    path: '/reports',
    element: ReportsPage,
    protected: true,
    layout: true,
  },
  {
    path: '/documents',
    element: DocumentsPage,
    protected: true,
    layout: true,
  },
  {
    path: '/settings',
    element: SettingsPage,
    protected: true,
    layout: true,
  },
  {
    path: '/ho-so',
    element: ProfilePage,
    protected: true,
    layout: true,
  },
  {
    path: '/doi-mat-khau',
    element: ChangePasswordPage,
    protected: true,
    layout: true,
  },
  // Nhân sự module routes - sử dụng wildcard để handle tất cả sub-routes
  {
    path: '/cong-viec',
    element: CongViecPage,
    protected: true,
    layout: true,
  },
  {
    path: '/he-thong',
    element: HeThongPage,
    protected: true,
    layout: true,
  },
  {
    path: '/he-thong/danh-sach-nhan-su/*',
    element: DanhSachNhanSuModule,
    protected: true,
    layout: true,
  },
  {
    path: '*',
    element: NotFoundPage,
    protected: false,
    layout: false,
  },
]

