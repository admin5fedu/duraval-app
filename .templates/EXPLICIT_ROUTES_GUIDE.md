# Hướng Dẫn Sử Dụng Explicit Routes Pattern

## Tổng Quan

Explicit Routes Pattern là cách tiếp cận mới để quản lý routing cho module bằng cách tạo các route components riêng biệt thay vì sử dụng splat routes (`/*`) và orchestrator pattern.

## Lợi Ích

✅ **Loại bỏ React Router warnings** - Không còn warning về splat routes  
✅ **Type-safe routing** - Sử dụng `useParams` với TypeScript  
✅ **Rõ ràng hơn** - Mỗi route có component riêng, dễ debug  
✅ **Sẵn sàng cho v7** - Tương thích với React Router v7  
✅ **Dễ test** - Có thể test từng route riêng biệt  

## Cấu Trúc Thư Mục

```
your-module/
├── routes/                          # Route components (NEW)
│   ├── index.ts                     # Exports
│   ├── {module-name}-list-route.tsx # List route
│   ├── {module-name}-detail-route.tsx # Detail route
│   └── {module-name}-form-route.tsx  # Form route (new/edit)
├── components/                       # View components (unchanged)
│   ├── {module-name}-list-view.tsx
│   ├── {module-name}-form-view.tsx
│   └── {module-name}-detail-view.tsx
├── config.tsx                        # Module configuration
└── index.tsx                         # Old orchestrator (can be removed)
```

## Route Structure

Mỗi module có 4 routes với thứ tự quan trọng:

1. `/basePath/moi` → Form route (new mode)
2. `/basePath/:id/sua` → Form route (edit mode)
3. `/basePath/:id` → Detail route
4. `/basePath` → List route

**Lưu ý**: Thứ tự routes rất quan trọng! Routes cụ thể phải đứng trước routes generic.

## Các Bước Tạo Module Mới

### Bước 1: Tạo Cấu Trúc Thư Mục

```bash
mkdir -p src/features/your-category/your-module/{routes,components,hooks,services,types}
```

### Bước 2: Tạo Config

```typescript
// config.tsx
import { ModuleConfig } from "@/shared/types/module-config"

export const yourModuleConfig: ModuleConfig = {
  moduleName: "your-module",
  moduleTitle: "Your Module",
  routePath: "/your-category/your-module",
  parentPath: "/your-category",
  // routePattern removed - using explicit routes
  // ... other config
}
```

### Bước 3: Tạo Route Components

Copy từ template `.templates/module-routes-template/` và thay thế:
- `{ModuleName}` → Tên module (PascalCase)
- `{module-name}` → Tên module (kebab-case)
- `{moduleName}` → Tên module (camelCase)

#### List Route

```typescript
// routes/your-module-list-route.tsx
import { useNavigate } from "react-router-dom"
import { YourModuleListView } from "../components/your-module-list-view"
import { yourModuleConfig } from "../config"

export default function YourModuleListRoute() {
  const navigate = useNavigate()
  // ... handlers
  return <YourModuleListView onEdit={...} onAddNew={...} onView={...} />
}
```

#### Detail Route

```typescript
// routes/your-module-detail-route.tsx
import { useParams, useNavigate } from "react-router-dom"
import { YourModuleDetailView } from "../components/your-module-detail-view"
import { yourModuleConfig } from "../config"

export default function YourModuleDetailRoute() {
  const { id } = useParams<{ id: string }>()
  // ... validation and handlers
  return <YourModuleDetailView id={...} onEdit={...} onBack={...} />
}
```

#### Form Route

```typescript
// routes/your-module-form-route.tsx
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { YourModuleFormView } from "../components/your-module-form-view"
import { yourModuleConfig } from "../config"

export default function YourModuleFormRoute() {
  const { id } = useParams<{ id?: string }>()
  const location = useLocation()
  const isNewMode = location.pathname.endsWith('/moi')
  // ... handlers
  return <YourModuleFormView id={...} onComplete={...} onCancel={...} />
}
```

### Bước 4: Cập Nhật Routes

```typescript
// src/routes.tsx
import { lazy } from 'react'

// Import route components
const YourModuleListRoute = lazy(() => import('@/features/your-category/your-module/routes/your-module-list-route'))
const YourModuleDetailRoute = lazy(() => import('@/features/your-category/your-module/routes/your-module-detail-route'))
const YourModuleFormRoute = lazy(() => import('@/features/your-category/your-module/routes/your-module-form-route'))

export const routes: RouteConfig[] = [
  // ... other routes
  // Order matters: more specific routes must come before generic ones
  {
    path: '/your-category/your-module/moi',
    element: YourModuleFormRoute,
    protected: true,
    layout: true,
  },
  {
    path: '/your-category/your-module/:id/sua',
    element: YourModuleFormRoute,
    protected: true,
    layout: true,
  },
  {
    path: '/your-category/your-module/:id',
    element: YourModuleDetailRoute,
    protected: true,
    layout: true,
  },
  {
    path: '/your-category/your-module',
    element: YourModuleListRoute,
    protected: true,
    layout: true,
  },
]
```

## Migration từ Orchestrator Pattern

Nếu bạn đang có module với orchestrator pattern:

### Bước 1: Tạo Route Components

Copy từ template và cập nhật tên module.

### Bước 2: Cập Nhật Routes

Thay thế splat route bằng explicit routes:

```typescript
// Trước
{
  path: '/your-module/*',
  element: YourModuleModule,
}

// Sau
{
  path: '/your-module/moi',
  element: YourModuleFormRoute,
},
{
  path: '/your-module/:id/sua',
  element: YourModuleFormRoute,
},
{
  path: '/your-module/:id',
  element: YourModuleDetailRoute,
},
{
  path: '/your-module',
  element: YourModuleListRoute,
},
```

### Bước 3: Xóa Orchestrator (Optional)

Nếu không cần nữa, có thể xóa `index.tsx` orchestrator component.

## Utility Functions

### Generate Routes Tự Động

```typescript
import { generateModuleRoutes } from "@/shared/utils/generate-explicit-routes"
import { yourModuleConfig } from "./config"

const routes = generateModuleRoutes(yourModuleConfig)
// Returns array of 4 RouteConfig objects
```

### Generate All Routes

```typescript
import { generateAllExplicitRoutes } from "@/shared/utils/generate-explicit-routes"

const allModuleRoutes = generateAllExplicitRoutes()
// Returns routes for all registered modules
```

## Checklist

- [ ] Tạo cấu trúc thư mục với `routes/`
- [ ] Tạo config.tsx (remove routePattern)
- [ ] Tạo 3 route components (list, detail, form)
- [ ] Cập nhật routes.tsx với explicit routes
- [ ] Test navigation flows
- [ ] Xóa orchestrator component (nếu có)

## Ví Dụ Thực Tế

Xem module `danh-sach-nhan-su` như reference implementation:
- `src/features/he-thong/nhan-su/danh-sach-nhan-su/routes/`
- `src/routes.tsx` (lines 128-150)

## Lưu Ý

1. **Route Order**: Routes cụ thể (`/moi`) phải đứng trước routes generic (`/:id`)
2. **ID Validation**: Luôn validate ID trong detail và form routes
3. **Navigation**: Sử dụng `navigate()` với config.routePath thay vì hardcode
4. **Query Params**: Form route tự động xử lý `?returnTo=detail`
5. **Error Handling**: Redirect về list nếu ID invalid

