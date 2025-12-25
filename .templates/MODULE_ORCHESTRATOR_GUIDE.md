# Hướng Dẫn Sử Dụng Orchestrator Pattern cho Module

## Tổng Quan

Orchestrator Pattern là cách tiếp cận để quản lý routing và state cho module bằng cách sử dụng một component điều phối (orchestrator) thay vì tạo các file page riêng cho mỗi route.

## Lợi Ích

✅ **Giảm số file**: Từ 7 file xuống 4 file  
✅ **Tập trung logic**: Routing logic ở một nơi  
✅ **Dễ bảo trì**: Dễ dàng thêm/sửa/xóa routes  
✅ **Consistent**: Tất cả modules dùng cùng pattern  

## Cấu Trúc Thư Mục

```
your-module/
├── index.tsx                    # Orchestrator (file này)
├── config.tsx                   # Module configuration
├── schema.ts                    # Zod schema
├── components/
│   ├── your-module-list-view.tsx
│   ├── your-module-form-view.tsx
│   └── your-module-detail-view.tsx
├── hooks/
│   ├── use-your-module.ts
│   └── use-your-module-mutations.ts
├── services/
│   └── your-module-service.ts
└── types/
    └── your-module-types.ts
```

## Các Bước Tạo Module Mới

### Bước 1: Tạo Cấu Trúc Thư Mục

```bash
mkdir -p src/features/your-category/your-module/{components,hooks,services,types}
```

### Bước 2: Tạo Config

```typescript
// config.tsx
export const yourModuleConfig = {
  moduleName: "your-module",
  moduleTitle: "Your Module",
  tableName: "your_table",
  primaryKey: "id",
  routePath: "/your-category/your-module",
  parentPath: "/your-category",
  searchFields: ["name", "email"],
  defaultSorting: [{ id: "id", desc: true }],
} as const
```

### Bước 3: Tạo Orchestrator (index.tsx)

Copy từ template `.templates/module-orchestrator-template.tsx` và thay thế:
- `YourModule` → tên module của bạn
- `yourModuleConfig` → config của bạn

### Bước 4: Tạo View Components

#### ListView Component

```typescript
// components/your-module-list-view.tsx
interface YourModuleListViewProps {
  onEdit?: (id: number) => void
  onAddNew?: () => void
  onView?: (id: number) => void
}

export function YourModuleListView({ 
  onEdit, 
  onAddNew, 
  onView 
}: YourModuleListViewProps) {
  // Implementation
}
```

#### FormView Component

```typescript
// components/your-module-form-view.tsx
interface YourModuleFormViewProps {
  id?: number
  onComplete?: () => void
  onCancel?: () => void
}

export function YourModuleFormView({ 
  id, 
  onComplete, 
  onCancel 
}: YourModuleFormViewProps) {
  // Implementation
}
```

#### DetailView Component

```typescript
// components/your-module-detail-view.tsx
interface YourModuleDetailViewProps {
  id: number
  onEdit?: () => void
  onBack?: () => void
}

export function YourModuleDetailView({ 
  id, 
  onEdit, 
  onBack 
}: YourModuleDetailViewProps) {
  // Implementation
}
```

### Bước 5: Cập Nhật Routes

```typescript
// src/routes.tsx
const YourModuleModule = lazy(() => import('@/features/your-category/your-module/index'))

export const routes: RouteConfig[] = [
  // ... other routes
  {
    path: '/your-category/your-module/*',
    element: YourModuleModule,
    protected: true,
    layout: true,
  },
]
```

## Migration từ Pattern Cũ

Nếu bạn đang có module với pattern cũ (có thư mục `pages/`):

### Bước 1: Tạo Orchestrator

Copy template và cập nhật tên module.

### Bước 2: Cập Nhật View Components

Thêm props callbacks vào các view components:
- `ListView`: `onEdit`, `onAddNew`, `onView`
- `FormView`: `onComplete`, `onCancel`, `id`
- `DetailView`: `onEdit`, `onBack`

### Bước 3: Xóa Thư Mục Pages

```bash
rm -rf src/features/your-category/your-module/pages
```

### Bước 4: Cập Nhật Routes

Thay thế nhiều routes bằng một route với wildcard:

```typescript
// Trước
{
  path: '/your-module',
  element: ListPage,
},
{
  path: '/your-module/moi',
  element: CreatePage,
},
{
  path: '/your-module/:id',
  element: DetailPage,
},
{
  path: '/your-module/:id/sua',
  element: EditPage,
},

// Sau
{
  path: '/your-module/*',
  element: YourModuleModule,
}
```

## Checklist

- [ ] Tạo cấu trúc thư mục
- [ ] Tạo config.tsx
- [ ] Tạo orchestrator (index.tsx)
- [ ] Tạo ListView component với callbacks
- [ ] Tạo FormView component với callbacks
- [ ] Tạo DetailView component với callbacks
- [ ] Cập nhật routes.tsx
- [ ] Test navigation flows
- [ ] Xóa thư mục pages/ (nếu có)

## Ví Dụ Thực Tế

Xem module `danh-sach-nhan-su` như reference implementation:
- `src/features/he-thong/nhan-su/danh-sach-nhan-su/index.tsx`
- `src/features/he-thong/nhan-su/danh-sach-nhan-su/components/`

## Lưu Ý

1. **URL Pattern**: Orchestrator tự động xử lý các routes:
   - `/basePath` → ListView
   - `/basePath/moi` → FormView (create)
   - `/basePath/:id` → DetailView
   - `/basePath/:id/sua` → FormView (edit)

2. **Query Params**: FormView tự động xử lý `?returnTo=list|detail`

3. **Navigation**: Sử dụng callbacks từ `useModuleNavigation` thay vì `navigate()` trực tiếp

4. **Error Handling**: Đảm bảo các view components có error boundaries

5. **Loading States**: Sử dụng loading states trong các view components

