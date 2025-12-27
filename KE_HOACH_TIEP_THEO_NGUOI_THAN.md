# Kế Hoạch Tiếp Theo - Module Người Thân

## ✅ Đã Hoàn Thành

### 1. Cập nhật tên module và routing
- ✅ Đổi tên từ "Thông tin người thân" → "Người thân"
- ✅ Cập nhật URL từ `/he-thong/nhan-su/nguoi-than` → `/he-thong/nguoi-than`
- ✅ Sửa breadcrumb để bỏ qua segment "nhan-su"
- ✅ Cập nhật menu trong HeThongPage

### 2. Cải thiện hiển thị listview
- ✅ Cột nhân viên hiển thị đầy đủ "Mã nhân viên - Họ và tên"
- ✅ Load và map dữ liệu nhân viên trong listview
- ✅ Tăng kích thước cột để hiển thị đầy đủ

### 3. Cải thiện form nhập liệu
- ✅ Chuyển từ select → combobox với tìm kiếm
- ✅ Tìm kiếm theo mã hoặc tên nhân viên
- ✅ Sắp xếp nhân viên theo mã từ lớn xuống nhỏ (descending)

### 4. Cải thiện UI/UX form
- ✅ Dấu sao đỏ (*) hiển thị ngay sau tên cột (không phải bên phải)
- ✅ Áp dụng cho tất cả modules thông qua GenericFormView

---

## 📋 Kế Hoạch Tiếp Theo

### Phase 1: Cải Thiện UX/UI (Ưu tiên cao)

#### 1.1. Cải thiện Detail View
- [ ] **Hiển thị đầy đủ thông tin nhân viên trong detail view**
  - Hiện tại đã có section "Thông Tin Nhân Viên" nhưng có thể cải thiện
  - Thêm avatar nhân viên nếu có
  - Thêm link trực tiếp đến trang detail nhân viên
  - Hiển thị thông tin liên hệ khẩn cấp nổi bật hơn

- [ ] **Cải thiện mobile view cho detail**
  - Tối ưu layout cho màn hình nhỏ
  - Collapsible sections nếu quá nhiều thông tin
  - Better spacing và typography

#### 1.2. Cải thiện List View
- [ ] **Thêm quick actions**
  - Quick view (preview trong popover)
  - Quick edit (inline edit cho một số trường)
  - Duplicate record

- [ ] **Cải thiện filter và search**
  - Filter theo nhân viên (combobox với search)
  - Filter theo phòng ban của nhân viên
  - Advanced filters (date range, multiple selections)

- [ ] **Thêm bulk actions**
  - Export selected
  - Delete selected (đã có)
  - Bulk update mối quan hệ
  - Bulk assign to employee

#### 1.3. Cải thiện Form
- [ ] **Validation improvements**
  - Real-time validation
  - Better error messages
  - Field-level hints và examples

- [ ] **Auto-complete và suggestions**
  - Auto-complete cho số điện thoại (format)
  - Suggestions cho mối quan hệ dựa trên giới tính nhân viên
  - Date picker với validation (không được lớn hơn ngày hiện tại)

- [ ] **Form enhancements**
  - Save as draft
  - Auto-save (localStorage)
  - Form templates (quick add common relationships)

---

### Phase 2: Tính Năng Mới (Ưu tiên trung bình)

#### 2.1. Quản lý liên hệ khẩn cấp
- [ ] **Đánh dấu liên hệ khẩn cấp**
  - Thêm field `la_lien_he_khan_cap` (boolean)
  - Filter và highlight các liên hệ khẩn cấp
  - Badge/icon trong list view

- [ ] **Thông báo và reminders**
  - Thông báo khi nhân viên chưa có liên hệ khẩn cấp
  - Reminder để cập nhật thông tin định kỳ
  - Alert khi số điện thoại không hợp lệ

#### 2.2. Tích hợp với module Nhân Sự
- [ ] **Link từ Nhân Sự → Người Thân**
  - Tab "Người Thân" trong detail view nhân sự
  - Quick add từ trang nhân sự
  - Hiển thị số lượng người thân trong list view nhân sự

- [ ] **Sync data**
  - Auto-update khi nhân viên thay đổi thông tin
  - Validation khi xóa nhân viên (cảnh báo nếu có người thân)

#### 2.3. Import/Export
- [ ] **Import từ Excel**
  - Template Excel với validation
  - Batch import với preview
  - Error handling và rollback

- [ ] **Export enhancements**
  - Export với thông tin nhân viên đầy đủ
  - Export theo filter
  - Export template cho import

---

### Phase 3: Performance & Optimization (Ưu tiên thấp)

#### 3.1. Performance
- [ ] **Optimize queries**
  - Chỉ select columns cần thiết trong list view
  - Prefetch nhân viên data trong server component
  - Cache employee map để tránh re-fetch

- [ ] **Virtual scrolling**
  - Đã có nhưng có thể tối ưu thêm
  - Lazy load images/avatars
  - Pagination hoặc infinite scroll

#### 3.2. Caching Strategy
- [ ] **React Query optimization**
  - Stale time configuration
  - Cache invalidation strategy
  - Optimistic updates

---

### Phase 4: Testing & Quality Assurance

#### 4.1. Unit Tests
- [ ] **Component tests**
  - Form validation tests
  - List view rendering tests
  - Detail view tests

- [ ] **Hook tests**
  - useNguoiThan tests
  - Mutation tests
  - Query tests

#### 4.2. Integration Tests
- [ ] **E2E tests**
  - Full CRUD flow
  - Search và filter
  - Bulk operations

#### 4.3. Accessibility
- [ ] **A11y improvements**
  - Keyboard navigation
  - Screen reader support
  - ARIA labels
  - Focus management

---

### Phase 5: Documentation

#### 5.1. Code Documentation
- [ ] **JSDoc comments**
  - Document all functions và components
  - Type definitions
  - Usage examples

#### 5.2. User Documentation
- [ ] **User guide**
  - How to add/edit người thân
  - How to use search và filters
  - Best practices

---

## 🎯 Ưu Tiên Thực Hiện

### Ngay lập tức (Sprint 1)
1. ✅ Cải thiện hiển thị dấu sao đỏ trong form (ĐÃ HOÀN THÀNH)
2. Cải thiện detail view với thông tin nhân viên đầy đủ hơn
3. Thêm filter theo nhân viên trong list view

### Ngắn hạn (Sprint 2-3)
1. Thêm tính năng đánh dấu liên hệ khẩn cấp
2. Tích hợp với module Nhân Sự (tab người thân)
3. Cải thiện validation và error messages

### Trung hạn (Sprint 4-6)
1. Import/Export từ Excel
2. Bulk actions nâng cao
3. Performance optimization

### Dài hạn (Sprint 7+)
1. Advanced features (reminders, notifications)
2. Full test coverage
3. Documentation hoàn chỉnh

---

## 📊 Metrics & Success Criteria

### UX Metrics
- [ ] Form completion rate > 95%
- [ ] Average time to add người thân < 2 minutes
- [ ] Search success rate > 90%

### Performance Metrics
- [ ] List view load time < 500ms
- [ ] Form render time < 200ms
- [ ] Search response time < 300ms

### Quality Metrics
- [ ] Test coverage > 80%
- [ ] Zero critical bugs
- [ ] Accessibility score > 90

---

## 🔄 Đồng Bộ Với Các Module Khác

### Patterns cần áp dụng cho tất cả modules
- [ ] Dấu sao đỏ ngay sau tên cột (✅ ĐÃ ÁP DỤNG)
- [ ] Combobox với search cho các field reference
- [ ] Hiển thị đầy đủ thông tin trong list view
- [ ] Consistent error handling
- [ ] Mobile-first responsive design

---

## 📝 Notes

### Technical Debt
- Cần refactor một số components để tái sử dụng tốt hơn
- Cần standardize error messages across modules
- Cần improve TypeScript types cho better type safety

### Future Considerations
- Có thể thêm tính năng "Family tree" visualization
- Có thể tích hợp với hệ thống notification
- Có thể thêm tính năng "Emergency contact verification"

