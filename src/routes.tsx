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

// Nhóm áp doanh số module routes
const NhomApDoanhSoListRoute = lazy(() => import('@/features/he-thong/so-do/nhom-ap-doanh-so/routes/nhom-ap-doanh-so-list-route'))
const NhomApDoanhSoDetailRoute = lazy(() => import('@/features/he-thong/so-do/nhom-ap-doanh-so/routes/nhom-ap-doanh-so-detail-route'))
const NhomApDoanhSoFormRoute = lazy(() => import('@/features/he-thong/so-do/nhom-ap-doanh-so/routes/nhom-ap-doanh-so-form-route'))

// Đăng ký doanh số module routes
const DangKyDoanhSoListRoute = lazy(() => import('@/features/he-thong/dang-ky/dang-ky-doanh-so/routes/dang-ky-doanh-so-list-route'))
const DangKyDoanhSoDetailRoute = lazy(() => import('@/features/he-thong/dang-ky/dang-ky-doanh-so/routes/dang-ky-doanh-so-detail-route'))
const DangKyDoanhSoFormRoute = lazy(() => import('@/features/he-thong/dang-ky/dang-ky-doanh-so/routes/dang-ky-doanh-so-form-route'))

// Phân quyền module routes
const PhanQuyenListRoute = lazy(() => import('@/features/he-thong/thiet-lap/phan-quyen/routes/phan-quyen-list-route'))

// Tỉnh thành trước sát nhập - Tỉnh thành TSN module routes
const TinhThanhTSNListRoute = lazy(() => import('@/features/he-thong/khac/tinh-thanh-truoc-sat-nhap/tinh-thanh-tsn/routes/tinh-thanh-tsn-list-route'))
const TinhThanhTSNDetailRoute = lazy(() => import('@/features/he-thong/khac/tinh-thanh-truoc-sat-nhap/tinh-thanh-tsn/routes/tinh-thanh-tsn-detail-route'))
const TinhThanhTSNFormRoute = lazy(() => import('@/features/he-thong/khac/tinh-thanh-truoc-sat-nhap/tinh-thanh-tsn/routes/tinh-thanh-tsn-form-route'))

// Quận huyện TSN module routes
const QuanHuyenTSNListRoute = lazy(() => import('@/features/he-thong/khac/tinh-thanh-truoc-sat-nhap/quan-huyen-tsn/routes/quan-huyen-tsn-list-route'))
const QuanHuyenTSNDetailRoute = lazy(() => import('@/features/he-thong/khac/tinh-thanh-truoc-sat-nhap/quan-huyen-tsn/routes/quan-huyen-tsn-detail-route'))
const QuanHuyenTSNFormRoute = lazy(() => import('@/features/he-thong/khac/tinh-thanh-truoc-sat-nhap/quan-huyen-tsn/routes/quan-huyen-tsn-form-route'))

// Phường Xã TSN module routes
const PhuongXaTSNListRoute = lazy(() => import('@/features/he-thong/khac/tinh-thanh-truoc-sat-nhap/phuong-xa-tsn/routes/phuong-xa-tsn-list-route'))
const PhuongXaTSNDetailRoute = lazy(() => import('@/features/he-thong/khac/tinh-thanh-truoc-sat-nhap/phuong-xa-tsn/routes/phuong-xa-tsn-detail-route'))
const PhuongXaTSNFormRoute = lazy(() => import('@/features/he-thong/khac/tinh-thanh-truoc-sat-nhap/phuong-xa-tsn/routes/phuong-xa-tsn-form-route'))

// Tỉnh thành sau sát nhập - Tỉnh thành SSN module routes
const TinhThanhSSNListRoute = lazy(() => import('@/features/he-thong/khac/tinh-thanh-sau-sat-nhap/tinh-thanh-ssn/routes/tinh-thanh-ssn-list-route'))
const TinhThanhSSNDetailRoute = lazy(() => import('@/features/he-thong/khac/tinh-thanh-sau-sat-nhap/tinh-thanh-ssn/routes/tinh-thanh-ssn-detail-route'))
const TinhThanhSSNFormRoute = lazy(() => import('@/features/he-thong/khac/tinh-thanh-sau-sat-nhap/tinh-thanh-ssn/routes/tinh-thanh-ssn-form-route'))

// Phường xã SNN module routes
const PhuongXaSNNListRoute = lazy(() => import('@/features/he-thong/khac/tinh-thanh-sau-sat-nhap/phuong-xa-snn/routes/phuong-xa-snn-list-route'))
const PhuongXaSNNDetailRoute = lazy(() => import('@/features/he-thong/khac/tinh-thanh-sau-sat-nhap/phuong-xa-snn/routes/phuong-xa-snn-detail-route'))
const PhuongXaSNNFormRoute = lazy(() => import('@/features/he-thong/khac/tinh-thanh-sau-sat-nhap/phuong-xa-snn/routes/phuong-xa-snn-form-route'))

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

// Nhóm chuyên đề module routes
const NhomChuyenDeListRoute = lazy(() => import('@/features/cong-viec/dao-tao/nhom-chuyen-de/routes/nhom-chuyen-de-list-route'))
const NhomChuyenDeDetailRoute = lazy(() => import('@/features/cong-viec/dao-tao/nhom-chuyen-de/routes/nhom-chuyen-de-detail-route'))
const NhomChuyenDeFormRoute = lazy(() => import('@/features/cong-viec/dao-tao/nhom-chuyen-de/routes/nhom-chuyen-de-form-route'))

// Chuyên đề module routes
const ChuyenDeListRoute = lazy(() => import('@/features/cong-viec/dao-tao/chuyen-de/routes/chuyen-de-list-route'))
const ChuyenDeDetailRoute = lazy(() => import('@/features/cong-viec/dao-tao/chuyen-de/routes/chuyen-de-detail-route'))
const ChuyenDeFormRoute = lazy(() => import('@/features/cong-viec/dao-tao/chuyen-de/routes/chuyen-de-form-route'))

// Câu hỏi module routes
const CauHoiListRoute = lazy(() => import('@/features/cong-viec/dao-tao/cau-hoi/routes/cau-hoi-list-route'))
const CauHoiDetailRoute = lazy(() => import('@/features/cong-viec/dao-tao/cau-hoi/routes/cau-hoi-detail-route'))
const CauHoiFormRoute = lazy(() => import('@/features/cong-viec/dao-tao/cau-hoi/routes/cau-hoi-form-route'))

// Kỳ thi module routes
const KyThiListRoute = lazy(() => import('@/features/cong-viec/dao-tao/ky-thi/routes/ky-thi-list-route'))
const KyThiDetailRoute = lazy(() => import('@/features/cong-viec/dao-tao/ky-thi/routes/ky-thi-detail-route'))
const KyThiFormRoute = lazy(() => import('@/features/cong-viec/dao-tao/ky-thi/routes/ky-thi-form-route'))

// Bài thi module routes
const BaiThiListRoute = lazy(() => import('@/features/cong-viec/dao-tao/bai-thi/routes/bai-thi-list-route'))
const BaiThiDetailRoute = lazy(() => import('@/features/cong-viec/dao-tao/bai-thi/routes/bai-thi-detail-route'))
const BaiThiFormRoute = lazy(() => import('@/features/cong-viec/dao-tao/bai-thi/routes/bai-thi-form-route'))

// Loại tài liệu module routes
const LoaiTaiLieuListRoute = lazy(() => import('@/features/cong-viec/tai-lieu/loai-tai-lieu/routes/loai-tai-lieu-list-route'))
const LoaiTaiLieuDetailRoute = lazy(() => import('@/features/cong-viec/tai-lieu/loai-tai-lieu/routes/loai-tai-lieu-detail-route'))
const LoaiTaiLieuFormRoute = lazy(() => import('@/features/cong-viec/tai-lieu/loai-tai-lieu/routes/loai-tai-lieu-form-route'))

// Danh mục tài liệu module routes
const DanhMucTaiLieuListRoute = lazy(() => import('@/features/cong-viec/tai-lieu/danh-muc-tai-lieu/routes/danh-muc-tai-lieu-list-route'))
const DanhMucTaiLieuDetailRoute = lazy(() => import('@/features/cong-viec/tai-lieu/danh-muc-tai-lieu/routes/danh-muc-tai-lieu-detail-route'))
const DanhMucTaiLieuFormRoute = lazy(() => import('@/features/cong-viec/tai-lieu/danh-muc-tai-lieu/routes/danh-muc-tai-lieu-form-route'))

// Tài liệu & Biểu mẫu module routes
const TaiLieuBieuMauListRoute = lazy(() => import('@/features/cong-viec/tai-lieu/tai-lieu-bieu-mau/routes/tai-lieu-bieu-mau-list-route'))
const TaiLieuBieuMauDetailRoute = lazy(() => import('@/features/cong-viec/tai-lieu/tai-lieu-bieu-mau/routes/tai-lieu-bieu-mau-detail-route'))
const TaiLieuBieuMauFormRoute = lazy(() => import('@/features/cong-viec/tai-lieu/tai-lieu-bieu-mau/routes/tai-lieu-bieu-mau-form-route'))

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

// Kinh doanh - Quỹ hỗ trợ bán hàng module pages
const PhieuDeXuatBanHangListRoute = lazy(() => import('@/features/kinh-doanh/quy-ho-tro-ban-hang/phieu-de-xuat-ban-hang/routes/phieu-de-xuat-ban-hang-list-route'))
const PhieuDeXuatBanHangDetailRoute = lazy(() => import('@/features/kinh-doanh/quy-ho-tro-ban-hang/phieu-de-xuat-ban-hang/routes/phieu-de-xuat-ban-hang-detail-route'))
const PhieuDeXuatBanHangFormRoute = lazy(() => import('@/features/kinh-doanh/quy-ho-tro-ban-hang/phieu-de-xuat-ban-hang/routes/phieu-de-xuat-ban-hang-form-route'))
const QuyHoTroBanHangPage = lazy(() => import('@/features/kinh-doanh/quy-ho-tro-ban-hang/quy-ho-tro-ban-hang'))

// Quỹ HTBH theo tháng module routes
const QuyHTBHTheoThangListRoute = lazy(() => import('@/features/kinh-doanh/quy-ho-tro-ban-hang/quy-htbh-theo-thang/routes/quy-htbh-theo-thang-list-route'))
const QuyHTBHTheoThangDetailRoute = lazy(() => import('@/features/kinh-doanh/quy-ho-tro-ban-hang/quy-htbh-theo-thang/routes/quy-htbh-theo-thang-detail-route'))
const QuyHTBHTheoThangFormRoute = lazy(() => import('@/features/kinh-doanh/quy-ho-tro-ban-hang/quy-htbh-theo-thang/routes/quy-htbh-theo-thang-form-route'))

// Loại phiếu module routes
const LoaiPhieuListRoute = lazy(() => import('@/features/kinh-doanh/quy-ho-tro-ban-hang/loai-phieu-hang-muc/loai-phieu/routes/loai-phieu-list-route'))
const LoaiPhieuDetailRoute = lazy(() => import('@/features/kinh-doanh/quy-ho-tro-ban-hang/loai-phieu-hang-muc/loai-phieu/routes/loai-phieu-detail-route'))
const LoaiPhieuFormRoute = lazy(() => import('@/features/kinh-doanh/quy-ho-tro-ban-hang/loai-phieu-hang-muc/loai-phieu/routes/loai-phieu-form-route'))
const HangMucListRoute = lazy(() => import('@/features/kinh-doanh/quy-ho-tro-ban-hang/loai-phieu-hang-muc/hang-muc/routes/hang-muc-list-route'))
const HangMucDetailRoute = lazy(() => import('@/features/kinh-doanh/quy-ho-tro-ban-hang/loai-phieu-hang-muc/hang-muc/routes/hang-muc-detail-route'))
const HangMucFormRoute = lazy(() => import('@/features/kinh-doanh/quy-ho-tro-ban-hang/loai-phieu-hang-muc/hang-muc/routes/hang-muc-form-route'))
const LoaiDoanhThuListRoute = lazy(() => import('@/features/kinh-doanh/quy-ho-tro-ban-hang/loai-phieu-hang-muc/loai-doanh-thu/routes/loai-doanh-thu-list-route'))
const LoaiDoanhThuDetailRoute = lazy(() => import('@/features/kinh-doanh/quy-ho-tro-ban-hang/loai-phieu-hang-muc/loai-doanh-thu/routes/loai-doanh-thu-detail-route'))
const LoaiDoanhThuFormRoute = lazy(() => import('@/features/kinh-doanh/quy-ho-tro-ban-hang/loai-phieu-hang-muc/loai-doanh-thu/routes/loai-doanh-thu-form-route'))

// Giai đoạn khách buôn module routes
const GiaiDoanKhachBuonListRoute = lazy(() => import('@/features/ban-buon/thiet-lap-khach-buon/giai-doan-khach-buon/routes/giai-doan-khach-buon-list-route'))
const GiaiDoanKhachBuonDetailRoute = lazy(() => import('@/features/ban-buon/thiet-lap-khach-buon/giai-doan-khach-buon/routes/giai-doan-khach-buon-detail-route'))
const GiaiDoanKhachBuonFormRoute = lazy(() => import('@/features/ban-buon/thiet-lap-khach-buon/giai-doan-khach-buon/routes/giai-doan-khach-buon-form-route'))

// Trạng thái khách buôn module routes
const TrangThaiKhachBuonListRoute = lazy(() => import('@/features/ban-buon/thiet-lap-khach-buon/trang-thai-khach-buon/routes/trang-thai-khach-buon-list-route'))
const TrangThaiKhachBuonDetailRoute = lazy(() => import('@/features/ban-buon/thiet-lap-khach-buon/trang-thai-khach-buon/routes/trang-thai-khach-buon-detail-route'))
const TrangThaiKhachBuonFormRoute = lazy(() => import('@/features/ban-buon/thiet-lap-khach-buon/trang-thai-khach-buon/routes/trang-thai-khach-buon-form-route'))

// Mức đăng ký module routes
const MucDangKyListRoute = lazy(() => import('@/features/ban-buon/thiet-lap-khach-buon/muc-dang-ky/routes/muc-dang-ky-list-route'))
const MucDangKyDetailRoute = lazy(() => import('@/features/ban-buon/thiet-lap-khach-buon/muc-dang-ky/routes/muc-dang-ky-detail-route'))
const MucDangKyFormRoute = lazy(() => import('@/features/ban-buon/thiet-lap-khach-buon/muc-dang-ky/routes/muc-dang-ky-form-route'))

// Danh sách KB module routes
const DanhSachKBListRoute = lazy(() => import('@/features/ban-buon/thong-tin-khach-hang/du-lieu-khach-buon/danh-sach-KB/routes/danh-sach-KB-list-route'))
const DanhSachKBDetailRoute = lazy(() => import('@/features/ban-buon/thong-tin-khach-hang/du-lieu-khach-buon/danh-sach-KB/routes/danh-sach-KB-detail-route'))
const DanhSachKBFormRoute = lazy(() => import('@/features/ban-buon/thong-tin-khach-hang/du-lieu-khach-buon/danh-sach-KB/routes/danh-sach-KB-form-route'))

// Người liên hệ module routes
const NguoiLienHeListRoute = lazy(() => import('@/features/ban-buon/thong-tin-khach-hang/du-lieu-khach-buon/nguoi-lien-he/routes/nguoi-lien-he-list-route'))
const NguoiLienHeDetailRoute = lazy(() => import('@/features/ban-buon/thong-tin-khach-hang/du-lieu-khach-buon/nguoi-lien-he/routes/nguoi-lien-he-detail-route'))
const NguoiLienHeFormRoute = lazy(() => import('@/features/ban-buon/thong-tin-khach-hang/du-lieu-khach-buon/nguoi-lien-he/routes/nguoi-lien-he-form-route'))

// Hình ảnh khách buôn module routes
const HinhAnhKhachBuonListRoute = lazy(() => import('@/features/ban-buon/thong-tin-khach-hang/du-lieu-khach-buon/hinh-anh-khach-buon/routes/hinh-anh-khach-buon-list-route'))
const HinhAnhKhachBuonDetailRoute = lazy(() => import('@/features/ban-buon/thong-tin-khach-hang/du-lieu-khach-buon/hinh-anh-khach-buon/routes/hinh-anh-khach-buon-detail-route'))
const HinhAnhKhachBuonFormRoute = lazy(() => import('@/features/ban-buon/thong-tin-khach-hang/du-lieu-khach-buon/hinh-anh-khach-buon/routes/hinh-anh-khach-buon-form-route'))

// Kinh doanh - Sale Ads module pages
const BangChiaDataPage = lazy(() => import('@/features/kinh-doanh/sale-ads/bang-chia-data'))
const QuyDinhTyLePage = lazy(() => import('@/features/kinh-doanh/sale-ads/quy-dinh-ty-le'))

// Module dashboard pages
const CongViecPage = lazy(() => import('@/pages/cong-viec/CongViecPage'))
const HeThongPage = lazy(() => import('@/pages/he-thong/HeThongPage'))
const HanhChinhNhanSuPage = lazy(() => import('@/pages/hanh-chinh-nhan-su/HanhChinhNhanSuPage'))
const MarketingPage = lazy(() => import('@/pages/marketing/MarketingPage'))
const KinhDoanhPage = lazy(() => import('@/pages/kinh-doanh/KinhDoanhPage'))
const BanBuonPage = lazy(() => import('@/pages/ban-buon/BanBuonPage'))

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
  {
    path: '/kinh-doanh',
    element: KinhDoanhPage,
    protected: true,
    layout: true,
    scrollBehavior: 'auto',
  },
  {
    path: '/ban-buon',
    element: BanBuonPage,
    protected: true,
    layout: true,
    scrollBehavior: 'auto',
  },
  // Giai đoạn khách buôn module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/ban-buon/giai-doan-khach-buon/moi',
    element: GiaiDoanKhachBuonFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/ban-buon/giai-doan-khach-buon/:id/sua',
    element: GiaiDoanKhachBuonFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/ban-buon/giai-doan-khach-buon/:id',
    element: GiaiDoanKhachBuonDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/ban-buon/giai-doan-khach-buon',
    element: GiaiDoanKhachBuonListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Trạng thái khách buôn module routes
  {
    path: '/ban-buon/trang-thai-khach-buon/moi',
    element: TrangThaiKhachBuonFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/ban-buon/trang-thai-khach-buon/:id/sua',
    element: TrangThaiKhachBuonFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/ban-buon/trang-thai-khach-buon/:id',
    element: TrangThaiKhachBuonDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/ban-buon/trang-thai-khach-buon',
    element: TrangThaiKhachBuonListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Mức đăng ký module routes
  {
    path: '/ban-buon/muc-dang-ky/moi',
    element: MucDangKyFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/ban-buon/muc-dang-ky/:id/sua',
    element: MucDangKyFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/ban-buon/muc-dang-ky/:id',
    element: MucDangKyDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/ban-buon/muc-dang-ky',
    element: MucDangKyListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Danh sách KB module routes
  {
    path: '/ban-buon/danh-sach-kb/moi',
    element: DanhSachKBFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/ban-buon/danh-sach-kb/:id/sua',
    element: DanhSachKBFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/ban-buon/danh-sach-kb/:id',
    element: DanhSachKBDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/ban-buon/danh-sach-kb',
    element: DanhSachKBListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Người liên hệ module routes
  {
    path: '/ban-buon/nguoi-lien-he/moi',
    element: NguoiLienHeFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/ban-buon/nguoi-lien-he/:id/sua',
    element: NguoiLienHeFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/ban-buon/nguoi-lien-he/:id',
    element: NguoiLienHeDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/ban-buon/nguoi-lien-he',
    element: NguoiLienHeListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Hình ảnh khách buôn module routes
  {
    path: '/ban-buon/hinh-anh-khach-buon/moi',
    element: HinhAnhKhachBuonFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/ban-buon/hinh-anh-khach-buon/:id/sua',
    element: HinhAnhKhachBuonFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/ban-buon/hinh-anh-khach-buon/:id',
    element: HinhAnhKhachBuonDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/ban-buon/hinh-anh-khach-buon',
    element: HinhAnhKhachBuonListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
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
  // Nhóm áp doanh số module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/he-thong/nhom-ap-doanh-so/moi',
    element: NhomApDoanhSoFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/nhom-ap-doanh-so/:id/sua',
    element: NhomApDoanhSoFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/nhom-ap-doanh-so/:id',
    element: NhomApDoanhSoDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/he-thong/nhom-ap-doanh-so',
    element: NhomApDoanhSoListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Đăng ký doanh số module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/he-thong/dang-ky-doanh-so/moi',
    element: DangKyDoanhSoFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/dang-ky-doanh-so/:id/sua',
    element: DangKyDoanhSoFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/dang-ky-doanh-so/:id',
    element: DangKyDoanhSoDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/he-thong/dang-ky-doanh-so',
    element: DangKyDoanhSoListRoute,
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
  // Tỉnh thành trước sát nhập - Tỉnh thành TSN routes
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/he-thong/tinh-thanh-tsn/moi',
    element: TinhThanhTSNFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/tinh-thanh-tsn/:id/sua',
    element: TinhThanhTSNFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/he-thong/tinh-thanh-tsn/:id',
    element: TinhThanhTSNDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/he-thong/tinh-thanh-tsn',
    element: TinhThanhTSNListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Quận huyện TSN routes
  {
    path: '/he-thong/quan-huyen-tsn/moi',
    element: QuanHuyenTSNFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/he-thong/quan-huyen-tsn/:id/sua',
    element: QuanHuyenTSNFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/he-thong/quan-huyen-tsn/:id',
    element: QuanHuyenTSNDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/he-thong/quan-huyen-tsn',
    element: QuanHuyenTSNListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore',
  },
  // Phường Xã TSN routes
  {
    path: '/he-thong/phuong-xa-tsn/moi',
    element: PhuongXaTSNFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/he-thong/phuong-xa-tsn/:id/sua',
    element: PhuongXaTSNFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/he-thong/phuong-xa-tsn/:id',
    element: PhuongXaTSNDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/he-thong/phuong-xa-tsn',
    element: PhuongXaTSNListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore',
  },
  // Tỉnh thành sau sát nhập - Tỉnh thành SSN module routes
  {
    path: '/he-thong/tinh-thanh-ssn/:id/sua',
    element: TinhThanhSSNFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/he-thong/tinh-thanh-ssn/moi',
    element: TinhThanhSSNFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/he-thong/tinh-thanh-ssn/:id',
    element: TinhThanhSSNDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/he-thong/tinh-thanh-ssn',
    element: TinhThanhSSNListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore',
  },
  // Phường xã SNN module routes
  {
    path: '/he-thong/phuong-xa-snn/:id/sua',
    element: PhuongXaSNNFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/he-thong/phuong-xa-snn/moi',
    element: PhuongXaSNNFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/he-thong/phuong-xa-snn/:id',
    element: PhuongXaSNNDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/he-thong/phuong-xa-snn',
    element: PhuongXaSNNListRoute,
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
  // Tài liệu & Biểu mẫu module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/cong-viec/tai-lieu-bieu-mau/moi',
    element: TaiLieuBieuMauFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/tai-lieu-bieu-mau/:id/sua',
    element: TaiLieuBieuMauFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/tai-lieu-bieu-mau/:id',
    element: TaiLieuBieuMauDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/cong-viec/tai-lieu-bieu-mau',
    element: TaiLieuBieuMauListRoute,
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
  // Nhóm chuyên đề module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/cong-viec/nhom-chuyen-de/moi',
    element: NhomChuyenDeFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/nhom-chuyen-de/:id/sua',
    element: NhomChuyenDeFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/nhom-chuyen-de/:id',
    element: NhomChuyenDeDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/cong-viec/nhom-chuyen-de',
    element: NhomChuyenDeListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Chuyên đề module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/cong-viec/chuyen-de/moi',
    element: ChuyenDeFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/chuyen-de/:id/sua',
    element: ChuyenDeFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/chuyen-de/:id',
    element: ChuyenDeDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/cong-viec/chuyen-de',
    element: ChuyenDeListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Câu hỏi module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/cong-viec/cau-hoi/moi',
    element: CauHoiFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/cau-hoi/:id/sua',
    element: CauHoiFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/cau-hoi/:id',
    element: CauHoiDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/cong-viec/cau-hoi',
    element: CauHoiListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Kỳ thi routes
  {
    path: '/cong-viec/ky-thi/moi',
    element: KyThiFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/ky-thi/:id/sua',
    element: KyThiFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/ky-thi/:id',
    element: KyThiDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/cong-viec/ky-thi',
    element: KyThiListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Bài thi module routes
  {
    path: '/cong-viec/bai-thi/moi',
    element: BaiThiFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/bai-thi/:id/sua',
    element: BaiThiFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/cong-viec/bai-thi/:id',
    element: BaiThiDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/cong-viec/bai-thi',
    element: BaiThiListRoute,
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
  // Kinh doanh - Quỹ hỗ trợ bán hàng module routes
  {
    path: '/kinh-doanh/phieu-de-xuat-ban-hang',
    element: PhieuDeXuatBanHangListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore',
  },
  {
    path: '/kinh-doanh/phieu-de-xuat-ban-hang/moi',
    element: PhieuDeXuatBanHangFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/kinh-doanh/phieu-de-xuat-ban-hang/:id',
    element: PhieuDeXuatBanHangDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/kinh-doanh/phieu-de-xuat-ban-hang/:id/sua',
    element: PhieuDeXuatBanHangFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/kinh-doanh/tong-quan-quy-htbh',
    element: QuyHoTroBanHangPage,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  // Quỹ HTBH theo tháng module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/kinh-doanh/quy-htbh-theo-thang/moi',
    element: QuyHTBHTheoThangFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/kinh-doanh/quy-htbh-theo-thang/:id/sua',
    element: QuyHTBHTheoThangFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/kinh-doanh/quy-htbh-theo-thang/:id',
    element: QuyHTBHTheoThangDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/kinh-doanh/quy-htbh-theo-thang',
    element: QuyHTBHTheoThangListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // ListView
  },
  // Loại phiếu module routes - explicit routes (no splat pattern)
  // Order matters: more specific routes must come before generic ones
  // Note: "moi" route must come before ":id" route to avoid conflict
  {
    path: '/kinh-doanh/loai-phieu/moi',
    element: LoaiPhieuFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/kinh-doanh/loai-phieu/:id/sua',
    element: LoaiPhieuFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/kinh-doanh/loai-phieu/:id',
    element: LoaiPhieuDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/kinh-doanh/loai-phieu',
    element: LoaiPhieuListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Hạng mục routes
  {
    path: '/kinh-doanh/hang-muc/moi',
    element: HangMucFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/kinh-doanh/hang-muc/:id/sua',
    element: HangMucFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/kinh-doanh/hang-muc/:id',
    element: HangMucDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/kinh-doanh/hang-muc',
    element: HangMucListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Loại doanh thu routes
  {
    path: '/kinh-doanh/loai-doanh-thu/moi',
    element: LoaiDoanhThuFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/kinh-doanh/loai-doanh-thu/:id/sua',
    element: LoaiDoanhThuFormRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // FormView
  },
  {
    path: '/kinh-doanh/loai-doanh-thu/:id',
    element: LoaiDoanhThuDetailRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'top', // DetailView
  },
  {
    path: '/kinh-doanh/loai-doanh-thu',
    element: LoaiDoanhThuListRoute,
    protected: true,
    layout: true,
    scrollBehavior: 'restore', // ListView - restore scroll khi quay lại từ detail/form
  },
  // Kinh doanh - Sale Ads module routes
  {
    path: '/kinh-doanh/sale-ads/bang-chia-data',
    element: BangChiaDataPage,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  {
    path: '/kinh-doanh/sale-ads/quy-dinh-ty-le',
    element: QuyDinhTyLePage,
    protected: true,
    layout: true,
    scrollBehavior: 'top',
  },
  // Add more module routes here or use generateRoutesFromConfig()
  {
    path: '*',
    element: NotFoundPage,
    protected: false,
    layout: false,
  },
]

