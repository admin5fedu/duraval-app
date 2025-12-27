# Kế Hoạch Hoàn Thiện Module "Người thân"

## ✅ Đã Hoàn Thành

### 1. Đổi Tên Module
- ✅ Cập nhật `moduleTitle` và `breadcrumb.label` thành "Người thân" (thay vì "Thông Tin Người Thân")
- ✅ Cập nhật `routing-config.ts` để sử dụng "nguoi-than" thay vì "thong-tin-nguoi-than"
- ✅ Cập nhật các components (form-view, detail-view) để sử dụng tên mới

### 2. Đăng Ký Module
- ✅ Đăng ký module trong `module-registry.ts`
- ✅ Routes đã được đăng ký trong `routes.tsx`

## 🎯 Truy Cập Module

Module đã sẵn sàng để truy cập tại các route sau:

- **List View**: `/he-thong/nhan-su/nguoi-than`
- **Create Form**: `/he-thong/nhan-su/nguoi-than/moi`
- **Detail View**: `/he-thong/nhan-su/nguoi-than/:id`
- **Edit Form**: `/he-thong/nhan-su/nguoi-than/:id/sua`

## 📋 Các Bước Tiếp Theo (Nếu Cần)

### 1. Thêm vào Navigation Menu (Nếu Cần)
Nếu muốn module xuất hiện trong sidebar/navigation menu, cần:

- Kiểm tra file `src/components/layout/Sidebar.tsx` hoặc component navigation tương ứng
- Thêm menu item cho "Người thân" với route `/he-thong/nhan-su/nguoi-than`

### 2. Kiểm Tra Breadcrumb
Breadcrumb sẽ tự động hiển thị:
- **Trang Chủ > Hệ Thống > Người thân** (bỏ qua segment "nhan-su" vì nó trong BREADCRUMB_SKIP_SEGMENTS)

### 3. Test Module
Các tính năng cần test:
- ✅ List view với filters và search
- ✅ Create new người thân
- ✅ Edit người thân
- ✅ View detail người thân
- ✅ Delete người thân
- ✅ Link từ mã nhân viên đến detail nhân viên
- ✅ Navigation flows (back, cancel, success)

### 4. Kiểm Tra Database Connection
Đảm bảo:
- ✅ Table `var_nguoi_than` tồn tại trong Supabase
- ✅ Foreign key constraint từ `ma_nhan_vien` đến `var_nhan_su(ma_nhan_vien)` hoạt động đúng
- ✅ Permissions được set đúng cho table

## 🔍 Lưu Ý

1. **Route Path**: Module sử dụng route `/he-thong/nhan-su/nguoi-than` (không phải `/he-thong/nguoi-than` vì nằm trong subfolder nhan-su)

2. **Breadcrumb**: Segment "nhan-su" sẽ bị bỏ qua trong breadcrumb theo cấu hình `BREADCRUMB_SKIP_SEGMENTS`

3. **Module Name**: Module name là "nguoi-than" (kebab-case), không phải "thong-tin-nguoi-than"

4. **Navigation**: Module có thể được truy cập trực tiếp qua URL hoặc thêm vào navigation menu nếu cần

## ✅ Kết Luận

Module "Người thân" đã được hoàn thiện và sẵn sàng sử dụng:
- ✅ Đã đổi tên thành "Người thân"
- ✅ Đã đăng ký trong module registry
- ✅ Routes đã được cấu hình
- ✅ Breadcrumb sẽ hiển thị đúng
- ✅ Tất cả components đã được cập nhật

**Module có thể truy cập ngay tại**: `/he-thong/nhan-su/nguoi-than`

