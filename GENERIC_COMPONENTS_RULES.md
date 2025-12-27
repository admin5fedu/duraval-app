# Quy Định Generic Components

## 📋 Tổng Quan

Tài liệu này định nghĩa các quy tắc và best practices cho việc sử dụng generic components trong ứng dụng. Đảm bảo tính nhất quán và dễ dàng bảo trì.

## 🎯 Nguyên Tắc Chung

1. **Reusability**: Tất cả generic components phải có thể tái sử dụng
2. **Consistency**: Cùng một pattern cho cùng một use case
3. **Type Safety**: Sử dụng TypeScript đầy đủ
4. **Documentation**: Mỗi component phải có JSDoc comments

## 📦 Generic Components

### 1. GenericFormView

**Mục đích**: Form component chung cho tất cả các module.

**Quy tắc sử dụng**:
- ✅ **DO**: Sử dụng cho tất cả các form trong ứng dụng
- ❌ **DON'T**: Tạo form component riêng cho từng module

**Props quan trọng**:
- `hideHeader`: Ẩn header khi dùng trong dialog
- `hideFooter`: Ẩn footer khi dùng trong dialog (để tránh duplicate với DialogFooter)

**Khi dùng trong Dialog**:
```tsx
<GenericFormView
  hideHeader={true}
  hideFooter={true}  // ✅ Bắt buộc khi dùng trong GenericFormDialog
  // ... other props
/>
```

**Khi dùng trong Page**:
```tsx
<GenericFormView
  hideHeader={false}  // Mặc định
  hideFooter={false}  // Mặc định
  // ... other props
/>
```

### 2. GenericFormDialog

**Mục đích**: Dialog chứa form để thêm/sửa entity.

**Quy tắc sử dụng**:
- ✅ **DO**: Sử dụng cho tất cả các form dialog
- ✅ **DO**: Luôn set `hideFooter={true}` cho GenericFormView bên trong
- ❌ **DON'T**: Tạo DialogFooter riêng trong GenericFormView khi dùng trong dialog

**Pattern**:
```tsx
<GenericFormDialog>
  <GenericFormView hideHeader={true} hideFooter={true} />
  {/* DialogFooter được render bởi GenericFormDialog */}
</GenericFormDialog>
```

### 3. GenericDetailDialog

**Mục đích**: Dialog hiển thị chi tiết entity.

**Quy tắc sử dụng**:
- ✅ **DO**: Sử dụng GenericDetailViewSimple bên trong
- ✅ **DO**: Sử dụng cho popup detail khi click vào row trong embedded list

**Pattern**:
```tsx
<GenericDetailDialog
  open={open}
  onOpenChange={setOpen}
  title="Chi tiết"
  sections={sections}
  actions={<Button>Sửa</Button>}
/>
```

### 4. GenericDeleteDialog

**Mục đích**: Dialog xác nhận xóa entity.

**Quy tắc sử dụng**:
- ✅ **DO**: Sử dụng cho tất cả các confirm delete
- ✅ **DO**: Hiển thị tên entity trong description

**Pattern**:
```tsx
<GenericDeleteDialog
  open={open}
  onOpenChange={setOpen}
  title="Xác nhận xóa"
  description="Bạn có chắc chắn muốn xóa?"
  entityName={entity.name}
  onConfirm={handleDelete}
/>
```

### 5. ConfirmDialog

**Mục đích**: Dialog xác nhận chung cho các flow quan trọng.

**Quy tắc sử dụng**:
- ✅ **DO**: Sử dụng cho confirm redirect, chuyển trạng thái, v.v.
- ✅ **DO**: Sử dụng `skipConfirmStorageKey` để lưu trạng thái "đừng hỏi lại"

**Pattern với "đừng hỏi lại"**:
```tsx
<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="Mở trang chi tiết"
  description="Bạn có muốn mở trang chi tiết không?"
  skipConfirmStorageKey="view-detail-skip-confirm"
  skipConfirmLabel="Đừng hỏi lại lần sau"
  onConfirm={() => navigate('/detail')}
/>
```

### 6. EmbeddedListSection

**Mục đích**: Component hiển thị danh sách embedded trong detail view.

**Quy tắc sử dụng**:
- ✅ **DO**: Sử dụng cho các related entities trong detail view
- ✅ **DO**: Sử dụng GenericDetailDialog cho `onRowClick`
- ✅ **DO**: Sử dụng ConfirmDialog cho `onView` với skip confirm

**Flow chuẩn**:
- **Click dòng** → `onRowClick` → Mở `GenericDetailDialog` (popup detail)
- **Click icon mắt** → `onView` → Mở `ConfirmDialog` → Redirect đến page detail
- **Click icon sửa** → `onEdit` → Mở `GenericFormDialog` (popup form)
- **Click icon xóa** → `onDelete` → Mở `GenericDeleteDialog` (confirm delete)

**Pattern**:
```tsx
<EmbeddedListSection
  title="Danh Sách Người Thân"
  data={relatives}
  columns={columns}
  onRowClick={(item) => {
    setSelectedItem(item)
    setDetailDialogOpen(true)
  }}
  onView={(item) => {
    setItemToView(item)
    setViewConfirmOpen(true)
  }}
  onEdit={(item) => {
    setSelectedItem(item)
    setIsEditMode(true)
    setFormDialogOpen(true)
  }}
  onDelete={(item) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }}
/>
```

### 7. EmployeeComboboxField

**Mục đích**: Component tái sử dụng để chọn nhân viên.

**Quy tắc sử dụng**:
- ✅ **DO**: Sử dụng cho tất cả các form cần chọn nhân viên
- ✅ **DO**: Tự động sort theo mã giảm dần (quy tắc chung)
- ✅ **DO**: Sử dụng `type: "custom"` với `customComponent: EmployeeComboboxField`

**Pattern**:
```tsx
{
  name: "ma_nhan_vien",
  label: "Nhân Viên",
  type: "custom",
  required: true,
  customComponent: EmployeeComboboxField,
}
```

### 8. ToggleButtonFormField

**Mục đích**: Component toggle buttons cho enum values.

**Quy tắc sử dụng**:
- ✅ **DO**: Sử dụng cho enum values với ít options (< 8)
- ✅ **DO**: Áp dụng màu sắc từ enum color registry
- ✅ **DO**: Có border cho dễ nhìn

**Pattern**:
```tsx
{
  name: "moi_quan_he",
  label: "Mối Quan Hệ",
  type: "toggle",
  required: true,
  options: [
    { label: "Cha", value: "Cha" },
    { label: "Mẹ", value: "Mẹ" },
    // ...
  ]
}
```

## 🔄 Flow Patterns

### Pattern 1: Embedded List với CRUD

```tsx
// 1. State management
const [detailDialogOpen, setDetailDialogOpen] = useState(false)
const [formDialogOpen, setFormDialogOpen] = useState(false)
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
const [selectedItem, setSelectedItem] = useState<Entity | null>(null)
const [isEditMode, setIsEditMode] = useState(false)
const [itemToView, setItemToView] = useState<Entity | null>(null)

// 2. Handlers
const handleRowClick = (item: Entity) => {
  setSelectedItem(item)
  setDetailDialogOpen(true)
}

const handleEyeClick = (item: Entity) => {
  if (!item.id) return
  const skipConfirm = localStorage.getItem(SKIP_CONFIRM_KEY) === "true"
  if (skipConfirm) {
    navigate(`/module/${item.id}`)
    return
  }
  setItemToView(item)
  setViewConfirmOpen(true)
}

const handleAdd = () => {
  setSelectedItem(null)
  setIsEditMode(false)
  setFormDialogOpen(true)
}

const handleEdit = (item: Entity) => {
  setSelectedItem(item)
  setIsEditMode(true)
  setFormDialogOpen(true)
}

const handleDelete = (item: Entity) => {
  setSelectedItem(item)
  setDeleteDialogOpen(true)
}

// 3. Render
<>
  <EmbeddedListSection
    onRowClick={handleRowClick}
    onView={handleEyeClick}
    onEdit={handleEdit}
    onDelete={handleDelete}
    onAdd={handleAdd}
  />
  
  {selectedItem && (
    <GenericDetailDialog
      open={detailDialogOpen}
      onOpenChange={setDetailDialogOpen}
      sections={getDetailSections(selectedItem)}
    />
  )}
  
  <GenericFormDialog
    open={formDialogOpen}
    onOpenChange={setFormDialogOpen}
    // ...
  />
  
  {selectedItem && (
    <GenericDeleteDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      entityName={selectedItem.name}
      onConfirm={handleDeleteConfirm}
    />
  )}
  
  <ConfirmDialog
    open={viewConfirmOpen}
    onOpenChange={setViewConfirmOpen}
    skipConfirmStorageKey={SKIP_CONFIRM_KEY}
    onConfirm={() => navigate(`/module/${itemToView?.id}`)}
  />
</>
```

## 📝 Best Practices

### 1. Dialog Management
- ✅ Luôn sử dụng state riêng cho mỗi dialog
- ✅ Reset state khi đóng dialog
- ✅ Sử dụng `onOpenChange` để handle close

### 2. Form Handling
- ✅ Luôn set `hideFooter={true}` khi dùng trong dialog
- ✅ Sử dụng `hideHeader={true}` khi dùng trong dialog
- ✅ Validation với Zod schema

### 3. Employee Display
- ✅ Luôn hiển thị "mã - tên" trong detail view
- ✅ Sử dụng EmployeeComboboxField trong form
- ✅ Fetch employee data khi cần hiển thị

### 4. Enum Colors
- ✅ Sử dụng enum color registry
- ✅ Áp dụng màu sắc nhất quán
- ✅ Sử dụng Badge component cho enum values

### 5. Confirm Dialogs
- ✅ Sử dụng ConfirmDialog với skip confirm cho redirect
- ✅ Sử dụng GenericDeleteDialog cho delete
- ✅ Lưu skip confirm state trong localStorage

## 🚫 Anti-Patterns

### ❌ DON'T: Duplicate Action Bars
```tsx
// ❌ WRONG
<GenericFormDialog>
  <GenericFormView hideHeader={true} />  // Missing hideFooter
  {/* GenericFormView sẽ render FormFooterSection */}
  {/* GenericFormDialog cũng render DialogFooter */}
  {/* => Duplicate! */}
</GenericFormDialog>

// ✅ CORRECT
<GenericFormDialog>
  <GenericFormView hideHeader={true} hideFooter={true} />
</GenericFormDialog>
```

### ❌ DON'T: Custom Form Components
```tsx
// ❌ WRONG
function CustomForm() {
  return <form>...</form>
}

// ✅ CORRECT
function CustomForm() {
  return (
    <GenericFormView
      schema={schema}
      sections={sections}
      onSubmit={handleSubmit}
    />
  )
}
```

### ❌ DON'T: Hardcode Employee Display
```tsx
// ❌ WRONG
<span>{relative.ma_nhan_vien}</span>

// ✅ CORRECT
const employee = employeeMap.get(relative.ma_nhan_vien)
const display = employee 
  ? `${employee.ma_nhan_vien} - ${employee.ho_ten}`
  : String(relative.ma_nhan_vien)
<span>{display}</span>
```

## 📚 Related Documents

- `FORMAT_RULES_IMPROVEMENTS.md`: Format rules và color guidelines
- Component documentation trong code comments

## 🔄 Migration Guide

### Migrating to Generic Components

1. **Replace custom forms**:
   - Tìm tất cả custom form components
   - Thay thế bằng GenericFormView
   - Đảm bảo schema và sections đúng format

2. **Replace custom dialogs**:
   - Tìm tất cả custom dialog components
   - Thay thế bằng GenericFormDialog, GenericDetailDialog, etc.
   - Đảm bảo flow đúng pattern

3. **Update employee fields**:
   - Tìm tất cả employee select/combobox
   - Thay thế bằng EmployeeComboboxField
   - Update detail view để hiển thị "mã - tên"

4. **Add skip confirm**:
   - Tìm tất cả confirm dialogs cho redirect
   - Thay thế bằng ConfirmDialog với skip confirm
   - Thêm storage key constants

## ✅ Checklist

Khi tạo module mới, đảm bảo:
- [ ] Sử dụng GenericFormView cho forms
- [ ] Sử dụng GenericFormDialog cho form dialogs
- [ ] Set `hideFooter={true}` khi dùng trong dialog
- [ ] Sử dụng EmployeeComboboxField cho employee fields
- [ ] Hiển thị "mã - tên" trong detail view
- [ ] Sử dụng ConfirmDialog với skip confirm cho redirect
- [ ] Sử dụng EmbeddedListSection cho related entities
- [ ] Áp dụng enum colors từ registry
- [ ] Follow flow patterns chuẩn

