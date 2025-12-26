# Module Configuration Guide

Hướng dẫn tạo và cấu hình module mới sử dụng Module Config System.

## Tổng quan

Module Config System giúp:
- ✅ **Tự động breadcrumb** - Không cần config thủ công
- ✅ **Tự động routing** - Route được quản lý tập trung
- ✅ **Type-safe** - TypeScript đảm bảo consistency
- ✅ **Single source of truth** - Config ở một nơi

## Bước 1: Tạo Module Config

Tạo file `config.tsx` trong module folder:

```typescript
// src/features/your-module/config.tsx
import { ModuleConfig } from "@/shared/types/module-config"

export const yourModuleConfig: ModuleConfig = {
  moduleName: "your-module-name",
  moduleTitle: "Your Module Title",
  routePath: "/parent/your-module",
  parentPath: "/parent",
  routePattern: "/parent/your-module/*",
  breadcrumb: {
    label: "Your Module Title",
    parentLabel: "Parent Module",
  },
  // ... other config
}
```

## Bước 2: Register Module

Thêm vào `src/shared/config/module-registry.ts`:

```typescript
import { yourModuleConfig } from "@/features/your-module/config"

// Register all modules
moduleRegistry.register(nhanSuConfig)
moduleRegistry.register(yourModuleConfig) // ← Add this
```

## Bước 3: Add Route

### Option 1: Manual (Recommended for now)

Thêm vào `src/routes.tsx`:

```typescript
const YourModule = lazy(() => import('@/features/your-module/index'))

export const routes: RouteConfig[] = [
  // ... existing routes
  {
    path: '/parent/your-module/*',
    element: YourModule,
    protected: true,
    layout: true,
  },
]
```

### Option 2: Auto-generate (Future)

Sử dụng `generateRoutesFromConfig()` từ `src/shared/utils/generate-routes-from-config.ts`

## Bước 4: Add Module Path Mapping

Nếu dùng auto-generation, thêm vào `generate-routes-from-config.ts`:

```typescript
const modulePathMap: Record<string, string> = {
  "danh-sach-nhan-su": "@/features/he-thong/nhan-su/danh-sach-nhan-su/index",
  "your-module-name": "@/features/your-module/index", // ← Add this
}
```

## Checklist

- [ ] Tạo `config.tsx` với `ModuleConfig`
- [ ] Register trong `module-registry.ts`
- [ ] Thêm route vào `routes.tsx`
- [ ] Thêm path mapping nếu dùng auto-generation
- [ ] Test breadcrumb hiển thị đúng
- [ ] Test navigation flows

## Ví dụ: Module "Danh Sách Nhân Sự"

Xem `src/features/he-thong/nhan-su/danh-sach-nhan-su/config.tsx` như reference implementation.

## Lợi ích

1. **Breadcrumb tự động**: Không cần thêm vào `PATH_LABELS` thủ công
2. **Consistent**: Tất cả modules theo cùng pattern
3. **Type-safe**: TypeScript đảm bảo config đúng
4. **Maintainable**: Dễ thêm/sửa module

## Troubleshooting

### Breadcrumb không hiển thị đúng?

1. Kiểm tra `breadcrumb.label` trong config
2. Kiểm tra `routePath` có đúng không
3. Kiểm tra module đã được register chưa

### Route không hoạt động?

1. Kiểm tra `routePattern` có đúng không
2. Kiểm tra route đã được thêm vào `routes.tsx` chưa
3. Kiểm tra module import path có đúng không

