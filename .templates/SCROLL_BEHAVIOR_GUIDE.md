# Scroll Behavior Guide cho Modules

## Tổng Quan

Tất cả modules trong ứng dụng tự động có scroll restoration được tích hợp. Hệ thống sẽ:
- **Scroll to top** khi vào DetailView, FormView, Dashboard
- **Restore scroll position** khi quay lại ListView từ DetailView/FormView
- **Tự động detect** route type và áp dụng behavior phù hợp

## Scroll Behavior cho Module Routes

### 1. ListView Routes

```typescript
{
  path: '/your-module',
  element: YourModuleListRoute,
  scrollBehavior: 'restore', // ✅ Restore scroll khi quay lại
}
```

**Behavior:**
- Scroll to top khi vào lần đầu
- Restore scroll position khi quay lại từ DetailView/FormView
- Lưu scroll position vào sessionStorage khi scroll

### 2. DetailView Routes

```typescript
{
  path: '/your-module/:id',
  element: YourModuleDetailRoute,
  scrollBehavior: 'top', // ✅ Luôn scroll to top
}
```

**Behavior:**
- Luôn scroll to top khi vào
- Không lưu scroll position

### 3. FormView Routes

```typescript
{
  path: '/your-module/moi',
  element: YourModuleFormRoute,
  scrollBehavior: 'top', // ✅ Luôn scroll to top
},
{
  path: '/your-module/:id/sua',
  element: YourModuleFormRoute,
  scrollBehavior: 'top', // ✅ Luôn scroll to top
}
```

**Behavior:**
- Luôn scroll to top khi vào (create hoặc edit)
- Không lưu scroll position

## Tự Động với generateModuleRoutes()

Khi sử dụng `generateModuleRoutes()`, scroll behavior sẽ được tự động thêm:

```typescript
import { generateModuleRoutes } from "@/shared/utils/generate-explicit-routes"
import { yourModuleConfig } from "./config"

const routes = generateModuleRoutes(yourModuleConfig)
// ✅ Tự động có scroll behavior:
// - ListView: 'restore'
// - DetailView: 'top'
// - FormView: 'top'
```

## Manual Configuration

Nếu muốn tự cấu hình, sử dụng các options sau:

### Scroll Behavior Options

- **`'top'`**: Luôn scroll to top khi vào route
  - Dùng cho: DetailView, FormView, Dashboard, Settings

- **`'restore'`**: Restore scroll position từ sessionStorage
  - Dùng cho: ListView (khi quay lại từ DetailView/FormView)

- **`'preserve'`**: Giữ nguyên scroll position
  - Dùng cho: Khi chỉ query params thay đổi (filter, search, pagination)

- **`'auto'`**: Tự động quyết định dựa trên route pattern
  - Mặc định, tự động detect route type

### Helper Function

```typescript
import { getDefaultScrollBehavior } from "@/shared/utils/route-scroll-behavior-helper"

// Tự động detect từ path
const behavior = getDefaultScrollBehavior('/your-module/:id', 'detail')
// Returns: 'top'

// Hoặc chỉ từ path
const behavior = getDefaultScrollBehavior('/your-module')
// Returns: 'restore' (detected as ListView)
```

## Module Danh Sách Nhân Sự

Module `danh-sach-nhan-su` đã được cấu hình với scroll behavior:

```typescript
// src/routes.tsx
{
  path: '/he-thong/danh-sach-nhan-su/moi',
  element: NhanSuFormRoute,
  scrollBehavior: 'top', // ✅ FormView
},
{
  path: '/he-thong/danh-sach-nhan-su/:id/sua',
  element: NhanSuFormRoute,
  scrollBehavior: 'top', // ✅ FormView
},
{
  path: '/he-thong/danh-sach-nhan-su/:id',
  element: NhanSuDetailRoute,
  scrollBehavior: 'top', // ✅ DetailView
},
{
  path: '/he-thong/danh-sach-nhan-su',
  element: NhanSuListRoute,
  scrollBehavior: 'restore', // ✅ ListView - restore scroll
}
```

## Checklist cho Module Mới

Khi tạo module mới:

- [ ] Sử dụng `generateModuleRoutes()` để tự động có scroll behavior
- [ ] Hoặc thêm `scrollBehavior` vào từng route trong `routes.tsx`:
  - ListView: `'restore'`
  - DetailView: `'top'`
  - FormView: `'top'`
- [ ] Test navigation flow:
  - ListView → DetailView: scroll to top ✅
  - DetailView → ListView (back): restore scroll ✅
  - ListView → FormView: scroll to top ✅
  - FormView → ListView (cancel): restore scroll ✅

## Troubleshooting

### Scroll không restore khi quay lại ListView

**Nguyên nhân:**
- Scroll behavior không được set là `'restore'` cho ListView route
- Scroll position chưa được lưu (chưa scroll trong ListView)

**Giải pháp:**
- Đảm bảo ListView route có `scrollBehavior: 'restore'`
- Scroll trong ListView trước khi navigate để lưu position

### Scroll không to top khi vào DetailView/FormView

**Nguyên nhân:**
- Scroll behavior không được set là `'top'`

**Giải pháp:**
- Đảm bảo DetailView/FormView routes có `scrollBehavior: 'top'`

## Tài Liệu Tham Khảo

- [Scroll Restoration System README](../src/shared/components/scroll-restoration.README.md)
- [Explicit Routes Guide](./EXPLICIT_ROUTES_GUIDE.md)

