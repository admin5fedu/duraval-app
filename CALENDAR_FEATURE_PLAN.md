# Kế Hoạch Tính Năng Calendar với Âm Lịch

## ✅ Đã Hoàn Thành

1. **Component DateTimeCalendarPopover**
   - ✅ Popover mở phía trên (top) khi click vào datetime
   - ✅ Hiển thị calendar với navigation tháng
   - ✅ Highlight ngày hôm nay
   - ✅ Highlight ngày lễ quốc gia (theo dương lịch)
   - ✅ Legend giải thích ký hiệu

2. **Utilities**
   - ✅ `vietnamese-holidays.ts` - Danh sách ngày lễ Việt Nam
   - ✅ `lunar-calendar.ts` - Placeholder cho utility âm lịch

3. **Integration**
   - ✅ DateTimeDisplay được wrap trong Popover trigger
   - ✅ Có hover effect khi hover vào datetime

## 📋 Kế Hoạch Tiếp Theo

### Bước 1: Tích hợp Thư Viện Âm Lịch (Ưu tiên cao)

**Mục tiêu**: Hiển thị chính xác ngày âm lịch và các lễ truyền thống

**Các lựa chọn thư viện**:
1. **@lunar-date/vietnam** (nếu có)
2. **vietnamese-lunar-date** 
3. **lunar-date** (của NghiaCaNgao)
4. Hoặc tạo utility riêng dựa trên thuật toán âm lịch

**Công việc**:
- [ ] Nghiên cứu và chọn thư viện phù hợp
- [ ] Cài đặt thư viện: `npm install <library-name>`
- [ ] Cập nhật `src/shared/utils/lunar-calendar.ts` để sử dụng thư viện
- [ ] Test chuyển đổi ngày dương → âm lịch
- [ ] Cập nhật `DateTimeCalendarPopover` để hiển thị âm lịch trên mỗi ngày
- [ ] Thêm tính năng highlight lễ truyền thống (theo âm lịch)

**File cần sửa**:
- `src/shared/utils/lunar-calendar.ts`
- `src/components/layout/DateTimeCalendarPopover.tsx`

### Bước 2: Cải Thiện Hiển Thị Ngày Lễ (Ưu tiên trung bình)

**Mục tiêu**: Hiển thị icon và màu sắc khác nhau cho từng loại lễ

**Công việc**:
- [ ] Thêm icon cho từng ngày lễ trong calendar cell
- [ ] Sử dụng màu sắc khác nhau cho từng loại lễ (quốc gia, truyền thống, tôn giáo)
- [ ] Thêm tooltip hiển thị tên ngày lễ khi hover
- [ ] Cải thiện legend để hiển thị đầy đủ các loại lễ

**File cần sửa**:
- `src/components/layout/DateTimeCalendarPopover.tsx`
- Có thể cần tạo custom Day component với react-day-picker

### Bước 3: Hiển Thị Âm Lịch Song Song (Ưu tiên cao)

**Mục tiêu**: Hiển thị "dd/mm/yyyy (Mùng X tháng Y)" trong calendar

**Công việc**:
- [ ] Customize Day component để hiển thị cả dương và âm lịch
- [ ] Format: "15 (Mùng 5)" - số dương lịch và âm lịch nhỏ bên dưới
- [ ] Đảm bảo hiển thị đẹp trên các kích thước màn hình

**File cần sửa**:
- `src/components/layout/DateTimeCalendarPopover.tsx`

### Bước 4: Tối Ưu và Polish (Ưu tiên thấp)

**Công việc**:
- [ ] Tối ưu performance khi render nhiều tháng
- [ ] Thêm animation khi mở/đóng popover
- [ ] Responsive trên các kích thước màn hình
- [ ] Thêm keyboard navigation
- [ ] Test trên các trình duyệt khác nhau

## 📝 Ghi Chú Quan Trọng

1. **Âm Lịch**: Hiện tại `getLunarDateInfo()` trả về `null` - cần tích hợp thư viện thực tế
2. **Lễ Truyền Thống**: Các lễ theo âm lịch chưa được highlight vì chưa có utility chuyển đổi
3. **Custom Day Component**: react-day-picker v9 hỗ trợ `components.Day` để customize, nhưng cần xử lý cẩn thận

## 🔗 Tài Liệu Tham Khảo

- [react-day-picker v9 docs](https://react-day-picker.js.org/)
- [Vietnamese Lunar Calendar libraries](https://www.npmjs.com/search?q=vietnamese%20lunar)
- Shadcn UI Popover component đã có sẵn

## ⚠️ Lưu Ý

- Hiện tại chỉ hiển thị lễ quốc gia (theo dương lịch)
- Lễ truyền thống sẽ hoạt động sau khi tích hợp thư viện âm lịch
- Component đã hoạt động cơ bản, chỉ cần tích hợp thư viện âm lịch là có thể dùng được

