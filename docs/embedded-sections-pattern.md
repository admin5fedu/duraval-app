# Embedded Sections Pattern - Quy Định Chuẩn

## Tổng Quan

Có 2 loại embedded sections trong hệ thống, mỗi loại có pattern riêng:

## 1. Related Entities (Separate Tables) - Dùng `EmbeddedListSection`

### Đặc điểm
- Có **separate table** với CRUD operations đầy đủ
- Có **detail page riêng** cho từng entity
- Có **quan hệ foreign key** với parent entity
- Ví dụ: Người thân, Danh mục con, v.v.

### Pattern Chuẩn ERP (Bắt Buộc)

#### Flow Actions:
1. **Click dòng** → `GenericDetailDialog` (popup detail)
2. **Icon mắt** → `ConfirmDialog` → Navigate đến detail page module riêng
3. **Icon sửa** → `GenericFormDialog` (popup form edit)
4. **Icon xóa** → `GenericDeleteDialog` (popup xác nhận xóa)
5. **Nút thêm** → `GenericFormDialog` (popup form create)

#### Components Cần Có:
```typescript
import { EmbeddedListSection } from "@/shared/components/data-display/embedded-list-section"
import { GenericDetailDialog } from "@/shared/components/dialogs/generic-detail-dialog"
import { GenericFormDialog } from "@/shared/components/dialogs/generic-form-dialog"
import { GenericDeleteDialog } from "@/shared/components/dialogs/generic-delete-dialog"
import { ConfirmDialog } from "@/shared/components/dialogs/confirm-dialog"
```

#### State Management:
```typescript
const [detailDialogOpen, setDetailDialogOpen] = useState(false)
const [formDialogOpen, setFormDialogOpen] = useState(false)
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
const [selectedItem, setSelectedItem] = useState<EntityType | null>(null)
const [isEditMode, setIsEditMode] = useState(false)
const [itemToView, setItemToView] = useState<EntityType | null>(null)
```

#### Handlers Pattern:
```typescript
// Click dòng -> Popup detail
const handleRowClick = (item: EntityType) => {
    setSelectedItem(item)
    setDetailDialogOpen(true)
}

// Click mắt -> Confirm + Navigate
const handleEyeClick = (item: EntityType) => {
    if (!item.id) return
    setItemToView(item)
    setViewConfirmOpen(true)
}

// Click sửa -> Popup form
const handleEdit = (item: EntityType) => {
    setSelectedItem(item)
    setIsEditMode(true)
    setFormDialogOpen(true)
}

// Click xóa -> Popup confirm
const handleDelete = (item: EntityType) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
}

// Click thêm -> Popup form
const handleAdd = () => {
    setSelectedItem(null)
    setIsEditMode(false)
    setFormDialogOpen(true)
}
```

#### Example Implementation:
Xem `src/features/he-thong/nhan-su/danh-sach-nhan-su/components/relatives-section.tsx`

---

## 2. History/Log (JSONB) - Dùng `TraoDoiHistory`

### Đặc điểm
- Dữ liệu lưu trong **JSONB field** (array of objects)
- **Không có separate table**
- Chủ yếu **read-only** hoặc **append-only** (thêm mới)
- **Không có detail page riêng**
- Không edit/delete từng item (hoặc chỉ admin mới xóa)

### Pattern

#### Component:
```typescript
import { TraoDoiHistory } from "@/shared/components/data-display/trao-doi-history"
```

#### Usage trong Detail View:
```typescript
{
  title: "Lịch Sử Trao Đổi",
  fields: [{
    label: "Trao Đổi",
    key: "trao_doi",
    colSpan: 3,
    format: () => (
      <TraoDoiHistory 
        traoDoi={data.trao_doi}
        variant="table" // hoặc "list"
        onDelete={handleDelete} // optional
        canDelete={(index) => isAdmin} // optional
      />
    )
  }]
}
```

#### Thêm mới trao đổi:
- Thường qua button/dialog riêng (không dùng EmbeddedListSection)
- Append vào JSONB array
- Xem example: `src/features/marketing/ky-thuat-cskh/truc-hat/components/trao-doi-button.tsx`

---

## Checklist Khi Tạo Embedded Section

### ✅ Related Entities (EmbeddedListSection)
- [ ] Có separate table với CRUD
- [ ] Click dòng → GenericDetailDialog
- [ ] Icon mắt → ConfirmDialog → Navigate
- [ ] Icon sửa → GenericFormDialog
- [ ] Icon xóa → GenericDeleteDialog
- [ ] Nút thêm → GenericFormDialog
- [ ] Có state management đầy đủ
- [ ] Có getDetailSections() function
- [ ] Có getFormSections() function

### ✅ History/Log (TraoDoiHistory)
- [ ] Dữ liệu là JSONB field
- [ ] Dùng TraoDoiHistory component
- [ ] Read-only hoặc append-only
- [ ] Không có detail page riêng

---

## Lưu Ý Quan Trọng

1. **KHÔNG BAO GIỜ** navigate trực tiếp trong Related Entities
   - ❌ `navigate('/path')` trong handleRowClick
   - ✅ `setDetailDialogOpen(true)` trong handleRowClick

2. **LUÔN** dùng popup dialogs cho CRUD operations
   - ✅ GenericDetailDialog, GenericFormDialog, GenericDeleteDialog
   - ❌ Navigate trực tiếp đến form/detail page

3. **Icon mắt** chỉ dùng để navigate đến detail page module riêng (nếu có)
   - Phải có ConfirmDialog trước khi navigate
   - Có thể skip confirm nếu user đã chọn "Đừng hỏi lại"

4. **Tham khảo** `RelativesSection` làm template chuẩn

---

## Migration Guide

Nếu module hiện tại đang dùng navigate trực tiếp:

1. Thêm state management cho dialogs
2. Thay `navigate()` bằng `setDialogOpen(true)`
3. Thêm GenericDetailDialog, GenericFormDialog, GenericDeleteDialog
4. Thêm ConfirmDialog cho onView (nếu cần)
5. Update handlers theo pattern trên

---

## Tools & Templates

### Hook: `useEmbeddedListSection`

Hook để quản lý state và handlers, giảm duplicate code:

```typescript
import { useEmbeddedListSection } from "@/shared/hooks/use-embedded-list-section"

const {
    detailDialogOpen,
    formDialogOpen,
    deleteDialogOpen,
    viewConfirmOpen,
    selectedItem,
    isEditMode,
    handleRowClick,
    handleEyeClick,
    handleAdd,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    detailSections,
    formSections,
    formDefaultValues,
} = useEmbeddedListSection({
    moduleConfig: { routePath: "/your-path" },
    getDetailSections: (item) => [...],
    getFormSections: (item, isEdit) => [...],
    formSchema: yourSchema,
    getFormDefaultValues: (item, isEdit, parent) => {...},
    handleFormSubmit: async (data, item, isEdit) => {...},
    getItemId: (item) => item.id,
    getItemName: (item) => item.name,
})
```

### Template Component

Copy `src/shared/components/data-display/embedded-list-section-template.tsx` và customize:

1. Rename component và file
2. Update imports (entity type, schema, config, hooks)
3. Customize `getDetailSections()`
4. Customize `getFormSections()`
5. Customize `getFormDefaultValues()`
6. Customize `handleFormSubmit()`
7. Customize `columns` array
8. Update all TODO comments

Xem template file để biết chi tiết.

---

## Tính Năng Nâng Cao: Compact Mode & Expand View

### Compact Mode

Hiển thị giới hạn số dòng, phù hợp cho listview thu nhỏ:

```typescript
<EmbeddedListSection
  title="Danh Mục Con"
  data={children}
  columns={columns}
  // Compact mode: chỉ hiển thị 5 dòng đầu
  compactMode={true}
  compactRowCount={5}
  showMoreIndicator={true}
  // Item count
  showItemCount={true}
  totalCount={children.length}
/>
```

### Sticky Columns

Cố định cột khi scroll ngang:

```typescript
const columns: EmbeddedListColumn<Entity>[] = [
  {
    key: "ten",
    header: "Tên",
    stickyLeft: true,        // Cố định cột này
    stickyMinWidth: 200,     // Min width
    render: (item) => item.ten
  },
  {
    key: "mo_ta",
    header: "Mô Tả",
    // Không sticky, scroll bình thường
    render: (item) => item.mo_ta
  }
]
```

### Expand to Full View

Mở dialog fullscreen để xem toàn bộ dữ liệu:

```typescript
<EmbeddedListSection
  title="Danh Mục Con"
  data={children}
  columns={columns}
  // Enable expand view
  enableExpandView={true}
  expandDialogTitle="Danh Sách Đầy Đủ Danh Mục Con"
  expandDialogMaxWidth="90vw"
  expandDialogMaxHeight="90vh"
  onExpand={() => console.log("Expanded!")}
/>
```

### Kết Hợp Tất Cả

```typescript
<EmbeddedListSection
  title="Danh Mục Con"
  data={children}
  columns={columns}
  // Compact mode
  compactMode={true}
  compactRowCount={5}
  showMoreIndicator={true}
  // Expand view
  enableExpandView={true}
  expandDialogTitle="Danh Sách Đầy Đủ"
  // Item count
  showItemCount={true}
  // Sticky columns (định nghĩa trong columns array)
  // ...
/>
```

### Props Mới

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `compactMode` | `boolean` | `false` | Chỉ hiển thị N dòng đầu |
| `compactRowCount` | `number` | `5` | Số dòng hiển thị trong compact mode |
| `showMoreIndicator` | `boolean` | `true` | Hiển thị "Xem thêm N items" |
| `enableExpandView` | `boolean` | `false` | Enable nút "Xem tất cả" |
| `expandDialogTitle` | `string` | `title` | Title cho expand dialog |
| `expandDialogMaxWidth` | `string` | `"90vw"` | Max width của dialog |
| `expandDialogMaxHeight` | `string` | `"90vh"` | Max height của dialog |
| `showItemCount` | `boolean` | `false` | Hiển thị số lượng items |
| `totalCount` | `number` | `data.length` | Total count (cho pagination) |
| `countFormat` | `function` | - | Custom format cho count text |

### Column Props Mới

| Prop | Type | Mô tả |
|------|------|-------|
| `stickyLeft` | `boolean` | Cố định cột khi scroll ngang |
| `stickyLeftOffset` | `number` | Offset từ trái (cho cột sticky thứ 2, 3...) |
| `stickyMinWidth` | `number` | Min width cho cột sticky |
| `hideInCompact` | `boolean` | Ẩn cột trong compact mode, chỉ hiện trong expand view |

### Quick Search trong Expand Dialog

Tự động có search box trong expand dialog:

```typescript
<EmbeddedListSection
  // ... other props
  enableExpandView={true}
  // Search options
  enableSearch={true}                    // Default: true
  searchPlaceholder="Tìm kiếm..."       // Custom placeholder
  searchFields={["ten", "mo_ta"]}       // Chỉ search trong các fields này (optional)
/>
```

**Lưu ý:**
- Nếu không có `searchFields`, sẽ search tất cả columns
- Search real-time, không cần debounce
- Hiển thị "Tìm thấy: X / Y mục" khi có search query

