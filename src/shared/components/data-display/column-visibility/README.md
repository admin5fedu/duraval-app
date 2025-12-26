# Column Visibility Module

Module quản lý hiển thị cột trong data tables. Đã được refactor thành cấu trúc modular để dễ maintain và extend.

## Cấu trúc

```
column-visibility/
├── index.ts                          # Main exports
├── column-visibility-dropdown.tsx    # Main component (clean & simple)
├── hooks/
│   ├── use-column-visibility.ts      # Visibility state management
│   ├── use-column-search.ts          # Search/filter logic
│   └── use-column-storage.ts         # localStorage persistence
├── utils/
│   └── column-helpers.ts             # Helper functions
└── components/
    ├── column-search-input.tsx       # Search input component
    ├── column-list.tsx               # Column list with checkboxes
    └── reset-button.tsx              # Reset to default button
```

## Sử dụng

### Basic Usage

```tsx
import { DataTableViewOptions } from "@/shared/components/data-display/column-visibility"

<DataTableViewOptions table={table} storageKey="my-table-columns" />
```

### Advanced Usage

```tsx
import { 
  ColumnVisibilityDropdown,
  useColumnVisibility,
  useColumnSearch 
} from "@/shared/components/data-display/column-visibility"

// Custom implementation
const { hideableColumns } = useColumnVisibility(table)
const { filteredColumns } = useColumnSearch(hideableColumns)
```

## Components

### `ColumnVisibilityDropdown`

Main component cho column visibility dropdown.

**Props:**
- `table: Table<TData>` - TanStack Table instance
- `storageKey?: string` - localStorage key (default: "table-column-visibility")

### `useColumnVisibility`

Hook quản lý column visibility state.

**Returns:**
- `hideableColumns: Column[]` - Danh sách columns có thể hide
- `defaultVisibility: Record<string, boolean>` - Default visibility state
- `handleResetToDefault: () => void` - Reset về default

### `useColumnSearch`

Hook quản lý search/filter cho columns.

**Returns:**
- `searchQuery: string` - Search query
- `setSearchQuery: (query: string) => void` - Set search query
- `filteredColumns: Column[]` - Filtered columns

### `useColumnStorage`

Hook quản lý localStorage persistence.

**Usage:**
```tsx
useColumnStorage(table, columns, storageKey)
```

## Utilities

### `getColumnDisplayName(column)`

Lấy display name cho column (priority: meta.title > header > id).

### `getColumnOrder(column)`

Lấy order từ meta (default: 999).

### `isColumnHideable(column)`

Kiểm tra column có thể hide không.

## Backward Compatibility

Module vẫn export `DataTableViewOptions` để backward compatibility:

```tsx
// Old way (still works)
import { DataTableViewOptions } from "./data-table-view-options"

// New way (recommended)
import { DataTableViewOptions } from "./column-visibility"
```

## Lợi ích của Refactor

1. **Modular** - Mỗi file có một trách nhiệm rõ ràng
2. **Testable** - Dễ test từng hook/component riêng
3. **Reusable** - Hooks có thể dùng ở nơi khác
4. **Maintainable** - Dễ maintain và extend
5. **Clean** - Main component chỉ ~80 dòng (so với 294 dòng trước)

## Migration

Nếu bạn đang dùng `DataTableViewOptions` từ `data-table-view-options.tsx`, chỉ cần update import:

```tsx
// Before
import { DataTableViewOptions } from "./data-table-view-options"

// After
import { DataTableViewOptions } from "./column-visibility"
```

API không thay đổi, chỉ cấu trúc code được cải thiện.

