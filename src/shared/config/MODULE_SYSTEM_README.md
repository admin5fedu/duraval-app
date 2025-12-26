# Module Configuration System

> **⚠️ Important**: Orchestrator pattern với splat routes (`/*`) đã được deprecated.
> 
> **👉 Sử dụng [Explicit Routes Pattern](../../.templates/EXPLICIT_ROUTES_GUIDE.md) thay thế** để loại bỏ React Router warnings và sẵn sàng cho v7.

Hệ thống cấu hình module tập trung cho toàn bộ ứng dụng.

## Tổng quan

Module Config System cung cấp:
- ✅ **Breadcrumb tự động** - Tự động populate từ module config
- ✅ **Route management** - Quản lý routes tập trung
- ✅ **Type-safe** - TypeScript đảm bảo consistency
- ✅ **Single source of truth** - Config ở một nơi

## Cấu trúc Files

```
src/
├── shared/
│   ├── types/
│   │   └── module-config.ts          # ModuleConfig type definition
│   ├── config/
│   │   ├── module-registry.ts        # Module registry (singleton)
│   │   └── MODULE_SYSTEM_README.md   # This file
│   └── utils/
│       └── generate-routes-from-config.ts  # Route generation utility
├── lib/
│   └── routing-config.ts             # Routing config (auto-populated)
└── features/
    └── [module]/
        └── config.tsx                # Module config file
```

## Module Config Structure

```typescript
interface ModuleConfig {
  // Basic info
  moduleName: string
  moduleTitle: string
  moduleDescription?: string
  
  // Routing
  routePath: string
  parentPath: string
  routePattern?: string // ⚠️ Deprecated - Use explicit routes instead
  
  // Breadcrumb
  breadcrumb?: {
    label: string
    parentLabel?: string
    skipSegments?: string[]
  }
  
  // Database
  tableName?: string
  primaryKey?: string
  
  // List view
  filterColumns?: FilterColumnConfig[]
  searchFields?: string[]
  defaultSorting?: Array<{ id: string; desc: boolean }>
  
  // Permissions
  permissions?: PermissionsConfig
}
```

## Cách sử dụng

### 1. Tạo Module Config

```typescript
// src/features/your-module/config.tsx
import { ModuleConfig } from "@/shared/types/module-config"

export const yourModuleConfig: ModuleConfig = {
  moduleName: "your-module",
  moduleTitle: "Your Module",
  routePath: "/parent/your-module",
  parentPath: "/parent",
  routePattern: "/parent/your-module/*",
  breadcrumb: {
    label: "Your Module",
    parentLabel: "Parent",
  },
}
```

### 2. Register Module

```typescript
// src/shared/config/module-registry.ts
import { yourModuleConfig } from "@/features/your-module/config"

moduleRegistry.register(yourModuleConfig)
```

### 3. Add Route

```typescript
// src/routes.tsx
const YourModule = lazy(() => import('@/features/your-module/index'))

{
  path: '/parent/your-module/*',
  element: YourModule,
  protected: true,
  layout: true,
}
```

## Auto-Population

### Breadcrumb Labels

Breadcrumb labels tự động được populate từ module config:

```typescript
// routing-config.ts automatically includes:
PATH_LABELS = {
  ...BASE_PATH_LABELS,
  ...populatePathLabelsFromModules(), // ← Auto from registry
}
```

### Skip Segments

Module có thể specify skip segments:

```typescript
breadcrumb: {
  skipSegments: ["intermediate-segment"],
}
```

## API Reference

### `moduleRegistry.get(moduleName)`

Get module config by name.

### `moduleRegistry.getByRoutePath(routePath)`

Get module config by route path.

### `moduleRegistry.getAll()`

Get all registered modules.

### `getModuleConfig(moduleName)`

Helper function to get module config.

## Examples

### Example: Danh Sách Nhân Sự

```typescript
// config.tsx
export const nhanSuConfig: ModuleConfig = {
  moduleName: "danh-sach-nhan-su",
  moduleTitle: "Danh Sách Nhân Sự",
  routePath: "/he-thong/danh-sach-nhan-su",
  parentPath: "/he-thong",
  routePattern: "/he-thong/danh-sach-nhan-su/*",
  breadcrumb: {
    label: "Danh Sách Nhân Sự",
    parentLabel: "Hệ Thống",
  },
  // ...
}
```

## Best Practices

1. **Always use ModuleConfig type** - Đảm bảo type safety
2. **Register in module-registry.ts** - Centralized management
3. **Use breadcrumb config** - Tự động populate labels
4. **Keep routePattern consistent** - Follow pattern: `/parent/module/*`
5. **Document module purpose** - Use moduleDescription

## Migration Guide

### From Manual Config

**Before:**
```typescript
// Manual PATH_LABELS
PATH_LABELS["danh-sach-nhan-su"] = "Danh Sách Nhân Sự"
```

**After:**
```typescript
// Auto from module config
breadcrumb: {
  label: "Danh Sách Nhân Sự",
}
```

## Troubleshooting

### Breadcrumb không hiển thị?

1. Kiểm tra module đã register chưa
2. Kiểm tra `breadcrumb.label` có đúng không
3. Kiểm tra `routePath` có match với URL không

### Route không hoạt động?

1. Kiểm tra route đã thêm vào `routes.tsx` chưa
2. Kiểm tra `routePattern` có đúng không
3. Kiểm tra module import path

## Future Enhancements

- [ ] Auto-generate routes from config
- [ ] Module permissions integration
- [ ] Module metadata API
- [ ] Module dependency management

