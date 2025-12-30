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

// Kế hoạch 168 module routes - Dashboard
const KeHoach168DashboardRoute = lazy(() => import('@/features/cong-viec/tong-quan/ke-hoach-168/routes/ke-hoach-168-dashboard-route'))

// Việc hàng ngày module routes
const ViecHangNgayListRoute = lazy(() => import('@/features/cong-viec/tong-quan/viec-hang-ngay/routes/viec-hang-ngay-list-route'))
const ViecHangNgayDetailRoute = lazy(() => import('@/features/cong-viec/tong-quan/viec-hang-ngay/routes/viec-hang-ngay-detail-route'))
const ViecHangNgayFormRoute = lazy(() => import('@/features/cong-viec/tong-quan/viec-hang-ngay/routes/viec-hang-ngay-form-route'))

// Danh mục câu hỏi module routes
const DanhMucCauHoiListRoute = lazy(() => import('@/features/cong-viec/cau-hoi-hang-ngay/danh-muc-cau-hoi/routes/danh-muc-cau-hoi-list-route'))
const DanhMucCauHoiDetailRoute = lazy(() => import('@/features/cong-viec/cau-hoi-hang-ngay/danh-muc-cau-hoi/routes/danh-muc-cau-hoi-detail-route'))
const DanhMucCauHoiFormRoute = lazy(() => import('@/features/cong-viec/cau-hoi-hang-ngay/danh-muc-cau-hoi/routes/danh-muc-cau-hoi-form-route'))

// Lịch đăng module routes
const LichDangListRoute = lazy(() => import('@/features/cong-viec/cau-hoi-hang-ngay/lich-dang/routes/lich-dang-list-route'))
const LichDangDetailRoute = lazy(() => import('@/features/cong-viec/cau-hoi-hang-ngay/lich-dang/routes/lich-dang-detail-route'))
const LichDangFormRoute = lazy(() => import('@/features/cong-viec/cau-hoi-hang-ngay/lich-dang/routes/lich-dang-form-route'))

// Câu trả lời module routes
const CauTraLoiListRoute = lazy(() => import('@/features/cong-viec/cau-hoi-hang-ngay/cau-tra-loi/routes/cau-tra-loi-list-route'))
const CauTraLoiDetailRoute = lazy(() => import('@/features/cong-viec/cau-hoi-hang-ngay/cau-tra-loi/routes/cau-tra-loi-detail-route'))
const CauTraLoiFormRoute = lazy(() => import('@/features/cong-viec/cau-hoi-hang-ngay/cau-tra-loi/routes/cau-tra-loi-form-route'))

// Loại tài liệu module routes
const LoaiTaiLieuListRoute = lazy(() => import('@/features/cong-viec/tai-lieu/loai-tai-lieu/routes/loai-tai-lieu-list-route'))
const LoaiTaiLieuDetailRoute = lazy(() => import('@/features/cong-viec/tai-lieu/loai-tai-lieu/routes/loai-tai-lieu-detail-route'))
const LoaiTaiLieuFormRoute = lazy(() => import('@/features/cong-viec/tai-lieu/loai-tai-lieu/routes/loai-tai-lieu-form-route'))

// Danh mục tài liệu module routes
const DanhMucTaiLieuListRoute = lazy(() => import('@/features/cong-viec/tai-lieu/danh-muc-tai-lieu/routes/danh-muc-tai-lieu-list-route'))
const DanhMucTaiLieuDetailRoute = lazy(() => import('@/features/cong-viec/tai-lieu/danh-muc-tai-lieu/routes/danh-muc-tai-lieu-detail-route'))
const DanhMucTaiLieuFormRoute = lazy(() => import('@/features/cong-viec/tai-lieu/danh-muc-tai-lieu/routes/danh-muc-tai-lieu-form-route'))

// Hành chính nhân sự - Công lương module routes
const PhieuHanhChinhListRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/cong-luong/phieu-hanh-chinh/routes/phieu-hanh-chinh-list-route'))
const PhieuHanhChinhDetailRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/cong-luong/phieu-hanh-chinh/routes/phieu-hanh-chinh-detail-route'))
const PhieuHanhChinhFormRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/cong-luong/phieu-hanh-chinh/routes/phieu-hanh-chinh-form-route'))

const NhomPhieuHanhChinhListRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/cong-luong/nhom-phieu-hanh-chinh/routes/nhom-phieu-hanh-chinh-list-route'))
const NhomPhieuHanhChinhDetailRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/cong-luong/nhom-phieu-hanh-chinh/routes/nhom-phieu-hanh-chinh-detail-route'))
const NhomPhieuHanhChinhFormRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/cong-luong/nhom-phieu-hanh-chinh/routes/nhom-phieu-hanh-chinh-form-route'))

const BangCongListRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/cong-luong/bang-cong/routes/bang-cong-list-route'))
const BangCongDetailRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/cong-luong/bang-cong/routes/bang-cong-detail-route'))
const BangCongFormRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/cong-luong/bang-cong/routes/bang-cong-form-route'))

const BangLuongListRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/cong-luong/bang-luong/routes/bang-luong-list-route'))
const BangLuongDetailRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/cong-luong/bang-luong/routes/bang-luong-detail-route'))
const BangLuongFormRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/cong-luong/bang-luong/routes/bang-luong-form-route'))

// Hành chính nhân sự - OLE module routes
const ChamOleListRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/ole/cham-ole/routes/cham-ole-list-route'))
const ChamOleDetailRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/ole/cham-ole/routes/cham-ole-detail-route'))
const ChamOleFormRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/ole/cham-ole/routes/cham-ole-form-route'))

const DiemCongTruListRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/ole/diem-cong-tru/routes/diem-cong-tru-list-route'))
const DiemCongTruDetailRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/ole/diem-cong-tru/routes/diem-cong-tru-detail-route'))
const DiemCongTruFormRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/ole/diem-cong-tru/routes/diem-cong-tru-form-route'))

const NhomDiemCongTruListRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/ole/nhom-diem-cong-tru/routes/nhom-diem-cong-tru-list-route'))
const NhomDiemCongTruDetailRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/ole/nhom-diem-cong-tru/routes/nhom-diem-cong-tru-detail-route'))
const NhomDiemCongTruFormRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/ole/nhom-diem-cong-tru/routes/nhom-diem-cong-tru-form-route'))

const NhomLuongListRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/ole/nhom-luong/routes/nhom-luong-list-route'))
const NhomLuongDetailRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/ole/nhom-luong/routes/nhom-luong-detail-route'))
const NhomLuongFormRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/ole/nhom-luong/routes/nhom-luong-form-route'))

// Hành chính nhân sự - Tuyển dụng module routes
const DeXuatTuyenDungListRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/tuyen-dung/de-xuat-tuyen-dung/routes/de-xuat-tuyen-dung-list-route'))
const DeXuatTuyenDungDetailRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/tuyen-dung/de-xuat-tuyen-dung/routes/de-xuat-tuyen-dung-detail-route'))
const DeXuatTuyenDungFormRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/tuyen-dung/de-xuat-tuyen-dung/routes/de-xuat-tuyen-dung-form-route'))

const UngVienListRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/tuyen-dung/ung-vien/routes/ung-vien-list-route'))
const UngVienDetailRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/tuyen-dung/ung-vien/routes/ung-vien-detail-route'))
const UngVienFormRoute = lazy(() => import('@/features/hanh-chinh-nhan-su/tuyen-dung/ung-vien/routes/ung-vien-form-route'))

// Marketing - Phản hồi khách hàng module routes
const PhanHoiKhachHangListRoute = lazy(() => import('@/features/marketing/ky-thuat-cskh/phan-hoi-khach-hang/routes/phan-hoi-khach-hang-list-route'))
const PhanHoiKhachHangDetailRoute = lazy(() => import('@/features/marketing/ky-thuat-cskh/phan-hoi-khach-hang/routes/phan-hoi-khach-hang-detail-route'))
const PhanHoiKhachHangFormRoute = lazy(() => import('@/features/marketing/ky-thuat-cskh/phan-hoi-khach-hang/routes/phan-hoi-khach-hang-form-route'))

// Trục hạt module routes
const TrucHatListRoute = lazy(() => import('@/features/marketing/ky-thuat-cskh/truc-hat/routes/truc-hat-list-route'))
const TrucHatDetailRoute = lazy(() => import('@/features/marketing/ky-thuat-cskh/truc-hat/routes/truc-hat-detail-route'))
const TrucHatFormRoute = lazy(() => import('@/features/marketing/ky-thuat-cskh/truc-hat/routes/truc-hat-form-route'))

// Module dashboard pages
const CongViecPage = lazy(() => import('@/pages/cong-viec/CongViecPage'))
const HeThongPage = lazy(() => import('@/pages/he-thong/HeThongPage'))
const HanhChinhNhanSuPage = lazy(() => import('@/pages/hanh-chinh-nhan-su/HanhChinhNhanSuPage'))
const MarketingPage = lazy(() => import('@/pages/marketing/MarketingPage'))

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
  {
    path: '/hanh-chinh-nhan-su',
    element: HanhChinhNhanSuPage,
    protected: true,
    layout: true,
    scrollBehavior: 'auto',
  },
  {
    path: '/marketing',
    element: MarketingPage,
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
    element: KeHoach168DashboardRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // Dashboard - always scroll to top
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
  // Danh mục câu hỏi module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/cong-viec/danh-muc-cau-hoi/moi',
    element: DanhMucCauHoiFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/danh-muc-cau-hoi/:id/sua',
    element: DanhMucCauHoiFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/danh-muc-cau-hoi/:id',
    element: DanhMucCauHoiDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/cong-viec/danh-muc-cau-hoi',
    element: DanhMucCauHoiListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Loại tài liệu module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/cong-viec/loai-tai-lieu/moi',
    element: LoaiTaiLieuFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/loai-tai-lieu/:id/sua',
    element: LoaiTaiLieuFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/loai-tai-lieu/:id',
    element: LoaiTaiLieuDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/cong-viec/loai-tai-lieu',
    element: LoaiTaiLieuListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Danh mục tài liệu module routes - explicit routes (no splat pattern)
  {
    path: '/cong-viec/danh-muc-tai-lieu/moi',
    element: DanhMucTaiLieuFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/danh-muc-tai-lieu/:id/sua',
    element: DanhMucTaiLieuFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/danh-muc-tai-lieu/:id',
    element: DanhMucTaiLieuDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/cong-viec/danh-muc-tai-lieu',
    element: DanhMucTaiLieuListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Lịch đăng module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/cong-viec/lich-dang/moi',
    element: LichDangFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/lich-dang/:id/sua',
    element: LichDangFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/lich-dang/:id',
    element: LichDangDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/cong-viec/lich-dang',
    element: LichDangListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Câu trả lời module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "them-moi" route must come before ":id" route to avoid conflict
  {
    path: '/cong-viec/cau-tra-loi/them-moi',
    element: CauTraLoiFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/cau-tra-loi/:id/sua',
    element: CauTraLoiFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/cau-tra-loi/:id',
    element: CauTraLoiDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/cong-viec/cau-tra-loi',
    element: CauTraLoiListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Hành chính nhân sự - Công lương module routes
  // Phiếu hành chính
  {
    path: '/hanh-chinh-nhan-su/phieu-hanh-chinh/moi',
    element: PhieuHanhChinhFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/phieu-hanh-chinh/:id/sua',
    element: PhieuHanhChinhFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/phieu-hanh-chinh/:id',
    element: PhieuHanhChinhDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/phieu-hanh-chinh',
    element: PhieuHanhChinhListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore',
  },
  // Nhóm phiếu hành chính
  {
    path: '/hanh-chinh-nhan-su/nhom-phieu-hanh-chinh/moi',
    element: NhomPhieuHanhChinhFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/nhom-phieu-hanh-chinh/:id/sua',
    element: NhomPhieuHanhChinhFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/nhom-phieu-hanh-chinh/:id',
    element: NhomPhieuHanhChinhDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/nhom-phieu-hanh-chinh',
    element: NhomPhieuHanhChinhListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore',
  },
  // Bảng công
  {
    path: '/hanh-chinh-nhan-su/bang-cong/moi',
    element: BangCongFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/bang-cong/:id/sua',
    element: BangCongFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/bang-cong/:id',
    element: BangCongDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/bang-cong',
    element: BangCongListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore',
  },
  // Bảng lương
  {
    path: '/hanh-chinh-nhan-su/bang-luong/moi',
    element: BangLuongFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/bang-luong/:id/sua',
    element: BangLuongFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/bang-luong/:id',
    element: BangLuongDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/bang-luong',
    element: BangLuongListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore',
  },
  // Hành chính nhân sự - OLE module routes
  // Chấm OLE
  {
    path: '/hanh-chinh-nhan-su/cham-ole/moi',
    element: ChamOleFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/cham-ole/:id/sua',
    element: ChamOleFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/cham-ole/:id',
    element: ChamOleDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/cham-ole/moi',
    element: ChamOleFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/cham-ole/:id/sua',
    element: ChamOleFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/cham-ole/:id',
    element: ChamOleDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/cham-ole',
    element: ChamOleListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore',
  },
  // Điểm cộng trừ
  {
    path: '/hanh-chinh-nhan-su/diem-cong-tru/moi',
    element: DiemCongTruFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/diem-cong-tru/:id/sua',
    element: DiemCongTruFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/diem-cong-tru/:id',
    element: DiemCongTruDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/diem-cong-tru',
    element: DiemCongTruListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore',
  },
  // Nhóm điểm cộng trừ
  {
    path: '/hanh-chinh-nhan-su/nhom-diem-cong-tru/moi',
    element: NhomDiemCongTruFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/nhom-diem-cong-tru/:id/sua',
    element: NhomDiemCongTruFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/nhom-diem-cong-tru/:id',
    element: NhomDiemCongTruDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/nhom-diem-cong-tru',
    element: NhomDiemCongTruListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore',
  },
  // Nhóm lương
  {
    path: '/hanh-chinh-nhan-su/nhom-luong/moi',
    element: NhomLuongFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/nhom-luong/:id/sua',
    element: NhomLuongFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/nhom-luong/:id',
    element: NhomLuongDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/nhom-luong',
    element: NhomLuongListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore',
  },
  // Hành chính nhân sự - Tuyển dụng module routes
  // Đề xuất tuyển dụng
  {
    path: '/hanh-chinh-nhan-su/de-xuat-tuyen-dung/moi',
    element: DeXuatTuyenDungFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/de-xuat-tuyen-dung/:id/sua',
    element: DeXuatTuyenDungFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/de-xuat-tuyen-dung/:id',
    element: DeXuatTuyenDungDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/de-xuat-tuyen-dung',
    element: DeXuatTuyenDungListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore',
  },
  // Ứng viên
  {
    path: '/hanh-chinh-nhan-su/ung-vien/moi',
    element: UngVienFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/ung-vien/:id/sua',
    element: UngVienFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/ung-vien/:id',
    element: UngVienDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/hanh-chinh-nhan-su/ung-vien',
    element: UngVienListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore',
  },
  // Marketing - Phản hồi khách hàng module routes
  {
    path: '/marketing/phan-hoi-khach-hang/moi',
    element: PhanHoiKhachHangFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/marketing/phan-hoi-khach-hang/:id/sua',
    element: PhanHoiKhachHangFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/marketing/phan-hoi-khach-hang/:id',
    element: PhanHoiKhachHangDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/marketing/phan-hoi-khach-hang',
    element: PhanHoiKhachHangListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore',
  },
  // Marketing - Trục hạt module routes
  {
    path: '/marketing/truc-hat/moi',
    element: TrucHatFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/marketing/truc-hat/:id/sua',
    element: TrucHatFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/marketing/truc-hat/:id',
    element: TrucHatDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/marketing/truc-hat',
    element: TrucHatListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore',
  },
  // Add more module routes here or use generateRoutesFromConfig()
  {
    path: '*',
    element: NotFoundPage,
    protected: false,
    layout: false,
  },
]

