# Template: Embedded List Section Component

## Tổng quan

Đây là template chuẩn để tạo component hiển thị danh sách con (child records) trong detail view của parent record. Component này sử dụng `EmbeddedListSection` và các dialog chuẩn để cung cấp đầy đủ tính năng CRUD.

## Cấu trúc Component

### 1. Props Interface

```typescript
interface [Entity]SectionProps {
  parentId: number // ID của parent record
  childList: [Entity][] // Danh sách child records
  isLoading?: boolean
  parentName?: string // Tên parent để hiển thị trong dialog (optional)
}
```

### 2. State Management

```typescript
const [detailDialogOpen, setDetailDialogOpen] = useState(false)
const [formDialogOpen, setFormDialogOpen] = useState(false)
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [viewConfirmOpen, setViewConfirmOpen] = useState(false)
const [expandDialogOpen, setExpandDialogOpen] = useState(false)
const [selectedItem, setSelectedItem] = useState<[Entity] | null>(null)
const [itemToView, setItemToView] = useState<[Entity] | null>(null)
const [isEditMode, setIsEditMode] = useState(false)
```

### 3. Mutations & Queries

```typescript
const createMutation = useCreate[Entity]()
const updateMutation = useUpdate[Entity]()
const deleteMutation = useDelete[Entity]()

// Query for selected item detail
const itemQuery = use[Entity]ById(selectedItem?.id || 0, selectedItem || undefined)
const viewState = useDetailViewStateFromQuery(itemQuery, selectedItem || undefined)

// Load parent data để pre-fill form (nếu cần)
const { data: parentData } = use[Parent]ById(parentId, undefined)
```

### 4. Event Handlers

#### Click dòng -> Mở popup detail
```typescript
const handleRowClick = (item: [Entity]) => {
  setSelectedItem(item)
  setDetailDialogOpen(true)
}
```

#### Click icon mắt -> Confirm dialog -> Redirect đến page detail
```typescript
const handleEyeClick = (item: [Entity]) => {
  if (!item.id) return

  const skipConfirm =
    typeof window !== "undefined" &&
    window.localStorage.getItem(VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY) === "true"

  if (skipConfirm) {
    navigate(`${[Entity]Config.routePath}/${item.id}`)
    return
  }

  setItemToView(item)
  setViewConfirmOpen(true)
}
```

#### Handle Add/Edit/Delete
```typescript
const handleAdd = () => {
  setSelectedItem(null)
  setIsEditMode(false)
  setFormDialogOpen(true)
}

const handleEdit = (item: [Entity]) => {
  setSelectedItem(item)
  setIsEditMode(true)
  setFormDialogOpen(true)
}

const handleDelete = (item: [Entity]) => {
  setSelectedItem(item)
  setDeleteDialogOpen(true)
}
```

### 5. Form Submit Handler

**LƯU Ý**: Logic này cần được customize theo từng module:

```typescript
const handleFormSubmit = async (data: any) => {
  // TODO: Transform form data to match schema
  // - Parse các field phức tạp (nếu có)
  // - Map parent ID
  // - Validate và transform data

  const submitData = {
    // ... transformed data
  }

  if (isEditMode && selectedItem) {
    await updateMutation.mutateAsync({ 
      id: selectedItem.id!, 
      input: submitData as Update[Entity]Input
    })
  } else {
    await createMutation.mutateAsync(submitData as Create[Entity]Input)
  }
}
```

### 6. Detail Sections

```typescript
const getDetailSections = (item: [Entity]): DetailSection[] => {
  return [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        // TODO: Define fields based on entity schema
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { 
          label: "Thời Gian Tạo", 
          key: "tg_tao", 
          value: formatDate(item.tg_tao)
        },
        { 
          label: "Thời Gian Cập Nhật", 
          key: "tg_cap_nhat", 
          value: formatDate(item.tg_cap_nhat)
        },
      ]
    },
  ]
}
```

### 7. Form Sections

```typescript
const formSections: FormSection[] = useMemo(() => {
  return [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        // TODO: Define form fields
        // - Parent ID field (nếu cần, thường disable)
        // - Các field khác của entity
      ]
    },
  ]
}, [parentId]) // Dependencies
```

### 8. Columns Definition

```typescript
const columns: EmbeddedListColumn<[Entity]>[] = [
  {
    key: "[field_key]",
    header: "[Field Label]",
    sortable: true,
    stickyLeft: true, // Nếu là field quan trọng
    stickyMinWidth: 150,
    render: (item) => (
      <div className="font-mono text-sm">{item.[field_key] || "-"}</div>
    ),
  },
  // ... more columns
]
```

### 9. Component Structure

```typescript
return (
  <>
    {/* Main Section */}
    <div className="space-y-3 sm:space-y-4 print:space-y-2 print:break-inside-avoid scroll-mt-28">
      <div className="flex items-center justify-between gap-2 sm:gap-2.5 px-1">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="p-1.5 rounded-md bg-primary/10 print:bg-transparent print:border print:border-primary">
            <[Icon] className="h-4 w-4 text-primary shrink-0" />
          </div>
          <h3 className={sectionTitleClass("font-semibold tracking-tight text-primary")}>
            Danh Sách [Entity Name]
          </h3>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          {childList.length > 0 && (
            <Button
              onClick={() => setExpandDialogOpen(true)}
              size="sm"
              variant="outline"
            >
              Xem tất cả
            </Button>
          )}
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Thêm [Entity Name]
          </Button>
        </div>
      </div>
      <EmbeddedListSection
        title=""
        data={childList}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có [entity name] nào"
        onRowClick={handleRowClick}
        onView={handleEyeClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showActions={true}
        getItemId={(item) => item.id!}
        getItemName={(item) => item.[nameField] || `[Entity] #${item.id}`}
        compactMode={true}
        compactRowCount={5}
        showMoreIndicator={true}
        enableExpandView={false} // Disable default expand, use custom
        showItemCount={true}
        totalCount={childList.length}
        defaultSortField="[default_sort_field]"
        defaultSortDirection="asc"
      />
    </div>
    
    {/* Custom Expand Dialog */}
    {expandDialogOpen && (
      <EmbeddedListFullViewDialog
        open={expandDialogOpen}
        onOpenChange={setExpandDialogOpen}
        title={parentName 
          ? `Danh Sách Đầy Đủ [Entity Name] - ${parentName}`
          : "Danh Sách Đầy Đủ [Entity Name]"}
        data={childList}
        columns={columns}
        onRowClick={handleRowClick}
        onView={handleEyeClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showActions={true}
        getItemId={(item) => item.id!}
        defaultSortField="[default_sort_field]"
        defaultSortDirection="asc"
        enableSearch={true}
        searchPlaceholder="Tìm kiếm theo [search fields]..."
        searchFields={["[field1]", "[field2]"]}
      />
    )}

    {/* Detail Dialog */}
    {selectedItem && (
      <GenericDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        title={selectedItem.[nameField] || `[Entity] #${selectedItem.id}`}
        subtitle={selectedItem.[subtitleField] || undefined}
        sections={getDetailSections(selectedItem)}
        isLoading={viewState.isLoading}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDetailDialogOpen(false)
                handleEdit(selectedItem)
              }}
            >
              Sửa
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setDetailDialogOpen(false)
                handleDelete(selectedItem)
              }}
            >
              Xóa
            </Button>
          </>
        }
      />
    )}

    {/* Form Dialog */}
    <GenericFormDialog
      open={formDialogOpen}
      onOpenChange={(open) => {
        setFormDialogOpen(open)
        if (!open) {
          setSelectedItem(null)
          setIsEditMode(false)
        }
      }}
      title={isEditMode ? `Sửa [Entity]: #${selectedItem?.id}` : "Thêm Mới [Entity]"}
      subtitle={isEditMode ? "Cập nhật thông tin [entity]" : "Thêm [entity] mới cho [parent] này"}
      schema={[Entity]Schema.omit({ 
        id: true, 
        tg_tao: true, 
        tg_cap_nhat: true
      }).extend({
        // TODO: Extend schema nếu cần (ví dụ: parent_id field)
      })}
      defaultValues={isEditMode && selectedItem 
        ? {
            // TODO: Map selectedItem to form default values
          }
        : {
            // TODO: Map parent data to form default values
          }
      }
      sections={formSections}
      onSubmit={handleFormSubmit}
      submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
      successMessage={isEditMode ? "Cập nhật [entity] thành công" : "Thêm mới [entity] thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật [entity]" : "Có lỗi xảy ra khi thêm mới [entity]"}
      isLoading={createMutation.isPending || updateMutation.isPending}
    />

    {/* Delete Dialog */}
    {selectedItem && (
      <GenericDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xác nhận xóa [entity]"
        description="Bạn có chắc chắn muốn xóa [entity] này không?"
        entityName={selectedItem.[nameField] || `[Entity] #${selectedItem.id}`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    )}

    {/* View Detail Confirm Dialog */}
    <ConfirmDialog
      open={viewConfirmOpen}
      onOpenChange={setViewConfirmOpen}
      title="Mở trang chi tiết [entity]"
      description="Bạn có muốn mở trang chi tiết [entity] trong module [Entity] không?"
      confirmLabel="Mở trang chi tiết"
      cancelLabel="Hủy"
      skipConfirmStorageKey={VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY}
      skipConfirmLabel="Đừng hỏi lại lần sau"
      onConfirm={() => {
        if (!itemToView?.id) return
        navigate(`${[Entity]Config.routePath}/${itemToView.id}`)
      }}
    />
  </>
)
```

## Checklist khi tạo Component mới

### 1. Imports cần thiết
- [ ] `EmbeddedListSection`, `EmbeddedListColumn`, `EmbeddedListFullViewDialog`
- [ ] `GenericDetailDialog`, `GenericFormDialog`, `GenericDeleteDialog`, `ConfirmDialog`
- [ ] `DetailSection`, `FormSection`
- [ ] Hooks: `use[Entity]ById`, `useCreate[Entity]`, `useUpdate[Entity]`, `useDelete[Entity]`
- [ ] Schema: `[Entity]Schema`, `Create[Entity]Input`, `Update[Entity]Input`
- [ ] Config: `[Entity]Config`
- [ ] Icons: `FileText` hoặc icon phù hợp, `Plus`
- [ ] Utilities: `formatDate`, `sectionTitleClass`

### 2. Constants
- [ ] `VIEW_DETAIL_SKIP_CONFIRM_STORAGE_KEY` - Tên unique cho module

### 3. Props Interface
- [ ] `parentId: number`
- [ ] `childList: [Entity][]`
- [ ] `isLoading?: boolean`
- [ ] `parentName?: string` (optional)

### 4. State Management
- [ ] Tất cả state cần thiết đã được khai báo

### 5. Event Handlers
- [ ] `handleRowClick` - Mở detail dialog
- [ ] `handleEyeClick` - Confirm và navigate
- [ ] `handleAdd` - Mở form dialog (create mode)
- [ ] `handleEdit` - Mở form dialog (edit mode)
- [ ] `handleDelete` - Mở delete dialog
- [ ] `handleFormSubmit` - Transform và submit data
- [ ] `handleDeleteConfirm` - Confirm delete

### 6. Data Transformations
- [ ] `getDetailSections` - Map entity to DetailSection[]
- [ ] `formSections` - Define form fields
- [ ] `columns` - Define table columns
- [ ] `handleFormSubmit` - Transform form data to API format

### 7. Dialogs
- [ ] Expand Dialog - Với search và sort
- [ ] Detail Dialog - Không có header (để giống detail view)
- [ ] Form Dialog - Với schema extension và default values
- [ ] Delete Dialog - Với confirmation
- [ ] View Confirm Dialog - Với skip option

### 8. Customization Points

#### A. Form Submit Logic
- Parse các field phức tạp (nếu có format đặc biệt)
- Map parent ID vào child entity
- Transform data theo yêu cầu API

#### B. Schema Extension
- Extend schema nếu cần support object cho parent_id field
- Hoặc các field đặc biệt khác

#### C. Default Values
- Edit mode: Map từ `selectedItem`
- Create mode: Map từ `parentData` và set parent_id

#### D. Columns
- Chọn field nào sticky (thường là mã hoặc tên chính)
- Define render function cho từng column
- Set sortable cho các column cần sort

#### E. Detail Sections
- Group fields theo logic nghiệp vụ
- Format dates, numbers, etc.

#### F. Form Sections
- Disable parent field nếu đã chọn từ parent
- Set required fields
- Add descriptions nếu cần

## Ví dụ: QuanHuyenSection

Xem file: `src/features/he-thong/khac/tinh-thanh-truoc-sat-nhap/tinh-thanh-tsn/components/quan-huyen-section.tsx`

## Lưu ý quan trọng

1. **Không hardcode text**: Tất cả text nên được parameterize hoặc dùng constants
2. **Icon**: Cho phép customize icon thay vì hardcode `FileText`
3. **Storage Key**: Phải unique cho mỗi module
4. **Form Submit**: Logic transform data là phần quan trọng nhất, cần customize cẩn thận
5. **Default Values**: Đảm bảo pre-fill đúng parent data khi create
6. **Error Handling**: Đảm bảo có error handling cho mutations
7. **Loading States**: Hiển thị loading state cho tất cả async operations

## Cải tiến có thể làm

1. **Generic Component**: Có thể tạo một generic component nhận config object, nhưng sẽ phức tạp hơn
2. **Template Generator**: Có thể tạo script để generate component từ template
3. **Type Safety**: Đảm bảo type safety cho tất cả transformations

