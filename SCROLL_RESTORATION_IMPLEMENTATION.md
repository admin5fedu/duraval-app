# Scroll Restoration Implementation Summary

## ✅ Đã Hoàn Thành

### 1. Core System

- ✅ **Scroll Behavior Types** (`src/shared/types/scroll-behavior.ts`)
  - Định nghĩa các loại scroll behavior: `'top'`, `'restore'`, `'preserve'`, `'auto'`
  - Route types: `'dashboard'`, `'list'`, `'detail'`, `'form'`, `'settings'`

- ✅ **ScrollManager Service** (`src/shared/utils/scroll-manager.ts`)
  - Quản lý scroll positions với sessionStorage
  - Tự động detect route type từ pathname
  - Logic quyết định scroll behavior dựa trên navigation context
  - LRU cache (tối đa 20 positions, expire sau 30 phút)

- ✅ **ScrollRestoration Component** (`src/shared/components/scroll-restoration.tsx`)
  - Tích hợp với React Router
  - Tự động tìm scroll container
  - Hỗ trợ smooth scrolling và delay
  - Lưu scroll position khi scroll (throttled)

### 2. Route Configuration

- ✅ **RouteConfig Interface** (`src/routes.tsx`)
  - Thêm `scrollBehavior?: ScrollBehavior` vào RouteConfig
  - Tất cả routes đã được cấu hình với scroll behavior phù hợp

- ✅ **Module Danh Sách Nhân Sự**
  - ListView: `scrollBehavior: 'restore'` ✅
  - DetailView: `scrollBehavior: 'top'` ✅
  - FormView: `scrollBehavior: 'top'` ✅

### 3. Auto-Generation Utilities

- ✅ **Route Scroll Behavior Helper** (`src/shared/utils/route-scroll-behavior-helper.ts`)
  - `getDefaultScrollBehavior()`: Tự động xác định scroll behavior
  - `detectRouteTypeFromPath()`: Detect route type từ path

- ✅ **Generate Explicit Routes** (`src/shared/utils/generate-explicit-routes.ts`)
  - Tự động thêm scroll behavior khi generate routes
  - ListView: `'restore'`
  - DetailView: `'top'`
  - FormView: `'top'`

- ✅ **Generate Routes From Config** (`src/shared/utils/generate-routes-from-config.ts`)
  - Tự động thêm scroll behavior cho splat routes (legacy)

### 4. Integration

- ✅ **Layout Component** (`src/components/layout/Layout.tsx`)
  - Thêm ref cho scroll container
  - Tích hợp `ScrollRestoration` component
  - Tự động lấy scroll behavior từ route config

- ✅ **Hook** (`src/shared/hooks/use-route-scroll-behavior.ts`)
  - Hook để lấy scroll behavior từ route config dựa trên pathname

### 5. Documentation

- ✅ **Scroll Restoration README** (`src/shared/components/scroll-restoration.README.md`)
- ✅ **Scroll Behavior Guide** (`.templates/SCROLL_BEHAVIOR_GUIDE.md`)
- ✅ **Updated Explicit Routes Guide** (`.templates/EXPLICIT_ROUTES_GUIDE.md`)

## 🎯 Tính Năng

### Scroll Behavior Matrix

| Route Type | Scroll Behavior | Khi Vào | Khi Quay Lại |
|------------|----------------|---------|--------------|
| ListView | `'restore'` | Scroll to top | Restore position |
| DetailView | `'top'` | Scroll to top | - |
| FormView | `'top'` | Scroll to top | - |
| Dashboard | `'top'` | Scroll to top | - |
| Settings | `'top'` | Scroll to top | - |

### Navigation Flow

```
Dashboard → ListView → DetailView → FormView
   ↓          ↓           ↓           ↓
  Top      Restore    Top        Top
```

- **ListView → DetailView**: Scroll to top ✅
- **DetailView → ListView** (back): Restore scroll position ✅
- **ListView → FormView**: Scroll to top ✅
- **FormView → ListView** (cancel): Restore scroll position ✅
- **FormView → DetailView** (save): Scroll to top ✅

## 🚀 Sử Dụng

### Cho Module Mới

**Option 1: Sử dụng generateModuleRoutes() (Khuyến nghị)**

```typescript
import { generateModuleRoutes } from "@/shared/utils/generate-explicit-routes"
import { yourModuleConfig } from "./config"

const routes = generateModuleRoutes(yourModuleConfig)
// ✅ Tự động có scroll behavior:
// - ListView: 'restore'
// - DetailView: 'top'
// - FormView: 'top'
```

**Option 2: Manual Configuration**

```typescript
// src/routes.tsx
{
  path: '/your-module',
  element: YourModuleListRoute,
  scrollBehavior: 'restore', // ✅ ListView
},
{
  path: '/your-module/:id',
  element: YourModuleDetailRoute,
  scrollBehavior: 'top', // ✅ DetailView
},
{
  path: '/your-module/moi',
  element: YourModuleFormRoute,
  scrollBehavior: 'top', // ✅ FormView
}
```

### Module Danh Sách Nhân Sự

Module đã được cấu hình đầy đủ:

```typescript
// src/routes.tsx (lines 158-180)
{
  path: '/he-thong/danh-sach-nhan-su/moi',
  scrollBehavior: 'top', // ✅ FormView
},
{
  path: '/he-thong/danh-sach-nhan-su/:id/sua',
  scrollBehavior: 'top', // ✅ FormView
},
{
  path: '/he-thong/danh-sach-nhan-su/:id',
  scrollBehavior: 'top', // ✅ DetailView
},
{
  path: '/he-thong/danh-sach-nhan-su',
  scrollBehavior: 'restore', // ✅ ListView
}
```

## 📁 File Structure

```
src/
├── shared/
│   ├── types/
│   │   └── scroll-behavior.ts          # Types & interfaces
│   ├── utils/
│   │   ├── scroll-manager.ts            # ScrollManager service
│   │   └── route-scroll-behavior-helper.ts  # Helper functions
│   ├── hooks/
│   │   └── use-route-scroll-behavior.ts   # Hook
│   └── components/
│       └── scroll-restoration.tsx       # Main component
├── components/
│   └── layout/
│       └── Layout.tsx                   # Integrated ScrollRestoration
└── routes.tsx                           # Route configs with scroll behavior
```

## 🔧 API Reference

### ScrollManager

```typescript
import { scrollManager } from '@/shared/utils/scroll-manager'

// Lưu scroll position
scrollManager.saveScrollPosition(pathname, scrollTop)

// Lấy scroll position
const position = scrollManager.getScrollPosition(pathname)

// Xóa scroll position
scrollManager.clearScrollPosition(pathname)
```

### Helper Functions

```typescript
import { getDefaultScrollBehavior } from '@/shared/utils/route-scroll-behavior-helper'

// Tự động detect
const behavior = getDefaultScrollBehavior('/your-module', 'list')
// Returns: 'restore'
```

### Hook

```typescript
import { useRouteScrollBehavior } from '@/shared/hooks/use-route-scroll-behavior'

function MyComponent() {
  const scrollBehavior = useRouteScrollBehavior()
  // Returns: 'top' | 'restore' | 'preserve' | 'auto'
}
```

## ✅ Checklist cho Module Mới

- [ ] Sử dụng `generateModuleRoutes()` để tự động có scroll behavior
- [ ] Hoặc thêm `scrollBehavior` vào từng route trong `routes.tsx`
- [ ] Test navigation flow:
  - [ ] ListView → DetailView: scroll to top
  - [ ] DetailView → ListView (back): restore scroll
  - [ ] ListView → FormView: scroll to top
  - [ ] FormView → ListView (cancel): restore scroll

## 📚 Tài Liệu

- [Scroll Restoration README](src/shared/components/scroll-restoration.README.md)
- [Scroll Behavior Guide](.templates/SCROLL_BEHAVIOR_GUIDE.md)
- [Explicit Routes Guide](.templates/EXPLICIT_ROUTES_GUIDE.md)

## 🎉 Kết Quả

✅ **Module danh sách nhân sự** đã được áp dụng scroll restoration đầy đủ  
✅ **Tất cả module mới** sẽ tự động có scroll behavior khi sử dụng `generateModuleRoutes()`  
✅ **Hệ thống tự động** detect và áp dụng behavior phù hợp  
✅ **Documentation đầy đủ** cho developers

