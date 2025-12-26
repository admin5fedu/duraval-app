# Enum Color System - Hệ thống Bôi Màu Enum Tự Động

## Tổng quan

Hệ thống enum color tự động nhận diện và bôi màu cho các trường enum trong app. Hệ thống hỗ trợ:

- ✅ **Tự động nhận diện enum** từ form fields (options array)
- ✅ **Pattern-based detection** (_status, _type, _state, etc.)
- ✅ **Tự động bôi màu** cho detail view và list view
- ✅ **Generic và reusable** - áp dụng tự động cho tất cả modules
- ✅ **Backward compatible** - giữ nguyên các hàm cũ

## Cấu trúc Files

```
src/shared/utils/
├── enum-color-registry.ts      # Core registry system
├── enum-detection.ts            # Auto-detection logic
├── enum-patterns.ts             # Pattern matching
├── enum-cell-renderer.tsx       # List view renderer
├── create-enum-column.ts        # Column helper
├── initialize-enum-system.ts    # Initialization
└── ENUM_SYSTEM_README.md        # Documentation

src/shared/stores/
└── enum-metadata-store.ts       # Metadata store
```

## Cách sử dụng

### 1. Detail View - Tự động

Enum sẽ tự động được nhận diện và bôi màu trong detail view:

```tsx
// Trong GenericDetailView config
const config: GenericDetailConfig = {
  fieldMappings: {
    tinh_trang: {
      label: "Tình Trạng",
      type: "badge", // hoặc "enum" hoặc "status"
    },
    // Hoặc không cần type, hệ thống sẽ tự detect
    gioi_tinh: {
      label: "Giới Tính",
    },
  },
}
```

### 2. List View - Sử dụng Helper

```tsx
import { createEnumColumn } from "@/shared/utils/create-enum-column"

const columns: ColumnDef<NhanSu>[] = [
  // Cách 1: Sử dụng helper (khuyến nghị)
  createEnumColumn<NhanSu>({
    accessorKey: "tinh_trang",
    header: "Tình Trạng",
    size: 130,
    meta: {
      title: "Tình Trạng",
      order: 7,
    },
  }),

  // Cách 2: Manual với EnumCellRenderer
  {
    accessorKey: "gioi_tinh",
    header: "Giới Tính",
    cell: ({ row, column }) => (
      <EnumCellRenderer
        value={row.getValue("gioi_tinh")}
        fieldKey="gioi_tinh"
        row={row.original}
        columnDef={column.columnDef}
      />
    ),
  },
]
```

### 3. Register Enum Mới

#### Cách 1: Tự động từ Form Field

Enum sẽ tự động được register khi form có `options`:

```tsx
const formSections: FormSection[] = [
  {
    fields: [
      {
        name: "trang_thai_don_hang",
        label: "Trạng Thái Đơn Hàng",
        type: "select",
        options: [
          { label: "Mới", value: "Mới" },
          { label: "Đang xử lý", value: "Đang xử lý" },
          { label: "Hoàn thành", value: "Hoàn thành" },
        ],
      },
    ],
  },
]
```

#### Cách 2: Manual Registration

```tsx
import { registerEnumColors } from "@/shared/utils/enum-color-registry"

registerEnumColors("trang_thai_don_hang", {
  "Mới": "bg-blue-50 text-blue-700 border-blue-200",
  "Đang xử lý": "bg-amber-50 text-amber-700 border-amber-200",
  "Hoàn thành": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Hủy": "bg-red-50 text-red-700 border-red-200",
})
```

### 4. Pattern-Based Auto-Detection

Hệ thống tự động nhận diện enum dựa trên field key patterns:

- `_status`, `_trang_thai` → Status colors
- `_type`, `_loai` → Type colors
- `_state`, `_tinh_trang` → State colors
- `_result`, `_ket_qua` → Result colors
- `is_`, `has_`, `can_`, `ap_dung` → Boolean colors

Ví dụ: Field `don_hang_status` sẽ tự động được nhận diện là enum.

## API Reference

### `getEnumBadgeClass(fieldKey, value)`

Lấy color class cho enum value:

```tsx
const className = getEnumBadgeClass("tinh_trang", "Chính thức")
// Returns: "bg-emerald-50 text-emerald-700 border-emerald-200"
```

### `registerEnumColors(fieldKey, config)`

Đăng ký enum colors:

```tsx
registerEnumColors("my_enum", {
  "Value 1": "bg-blue-50 text-blue-700 border-blue-200",
  "Value 2": "bg-red-50 text-red-700 border-red-200",
})
```

### `isEnumField(options)`

Kiểm tra xem field có phải enum không:

```tsx
const isEnum = isEnumField({
  fieldKey: "tinh_trang",
  type: "badge",
  formFieldConfig: formField,
})
```

### `createEnumColumn(options)`

Tạo column definition cho enum:

```tsx
const column = createEnumColumn<NhanSu>({
  accessorKey: "tinh_trang",
  header: "Tình Trạng",
  size: 130,
})
```

## Default Enum Colors

Hệ thống đã có sẵn các enum colors:

- **tinh_trang**: Tình trạng nhân sự (Chính thức, Thử việc, Nghỉ việc, Tạm nghỉ)
- **moi_quan_he**: Mối quan hệ (Bố, Mẹ, Vợ/Chồng, Con, Người thân)
- **gioi_tinh**: Giới tính (Nam, Nữ, Khác)
- **hon_nhan**: Hôn nhân (Độc thân, Đã kết hôn, Ly dị)
- **ket_qua**: Kết quả (Đúng, Sai, Chưa chấm)
- **ap_dung**: Boolean (true/false, có/không, yes/no)

## Migration Guide

### Từ code cũ sang mới

**Trước:**
```tsx
import { getEmployeeStatusBadgeClass } from "@/components/ui/status-badge"

const className = getEmployeeStatusBadgeClass(status)
```

**Sau (tự động):**
```tsx
// Không cần import, hệ thống tự động detect
// Chỉ cần set type: "badge" hoặc "enum" trong DetailField
```

**Hoặc manual:**
```tsx
import { getEnumBadgeClass } from "@/shared/utils/enum-color-registry"

const className = getEnumBadgeClass("tinh_trang", status)
```

## Best Practices

1. **Sử dụng type "badge" hoặc "enum"** trong DetailField để tự động bôi màu
2. **Sử dụng `createEnumColumn`** cho list view columns
3. **Register enum colors** khi tạo module mới với enum
4. **Sử dụng pattern naming** (_status, _type) để tự động detect
5. **Giữ backward compatibility** - các hàm cũ vẫn hoạt động

## Troubleshooting

### Enum không được bôi màu?

1. Kiểm tra xem enum đã được register chưa:
   ```tsx
   import { hasEnumColorConfig } from "@/shared/utils/enum-color-registry"
   console.log(hasEnumColorConfig("field_key"))
   ```

2. Kiểm tra xem field có match pattern không:
   ```tsx
   import { matchesEnumPattern } from "@/shared/utils/enum-patterns"
   console.log(matchesEnumPattern("field_key"))
   ```

3. Manual register nếu cần:
   ```tsx
   registerEnumColors("field_key", { /* colors */ })
   ```

## Examples

Xem các file sau để tham khảo:
- `src/features/he-thong/nhan-su/danh-sach-nhan-su/components/nhan-su-columns.tsx`
- `src/shared/components/data-display/detail/detail-field-renderer.tsx`

