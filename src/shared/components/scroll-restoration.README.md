# Scroll Restoration System

Hệ thống scroll restoration tự động quản lý scroll behavior khi chuyển route trong ứng dụng.

## Tổng quan

Hệ thống này tự động:
- Scroll to top khi vào route mới (DetailView, FormView, Dashboard)
- Restore scroll position khi quay lại ListView từ DetailView/FormView
- Lưu scroll positions vào sessionStorage
- Tự động detect route type và áp dụng behavior phù hợp

## Cấu trúc

```
src/shared/
├── types/
│   └── scroll-behavior.ts      # Types và interfaces
├── utils/
│   └── scroll-manager.ts       # ScrollManager service
├── hooks/
│   └── use-route-scroll-behavior.ts  # Hook để lấy scroll behavior từ route config
└── components/
    └── scroll-restoration.tsx   # Component chính
```

## Cách sử dụng

### 1. Cấu hình route với scroll behavior

Trong `routes.tsx`, thêm `scrollBehavior` vào route config:

```typescript
{
  path: '/he-thong/danh-sach-nhan-su',
  element: NhanSuListRoute,
  scrollBehavior: 'restore', // ListView - restore scroll khi quay lại
}
```

### 2. Scroll Behavior Options

- **`'top'`**: Luôn scroll to top khi vào route
  - Dùng cho: Dashboard, DetailView, FormView, Settings

- **`'restore'`**: Restore scroll position từ sessionStorage
  - Dùng cho: ListView (khi quay lại từ DetailView/FormView)

- **`'preserve'`**: Giữ nguyên scroll position
  - Dùng cho: Khi chỉ query params thay đổi (filter, search, pagination)

- **`'auto'`**: Tự động quyết định dựa trên route pattern
  - Mặc định, tự động detect route type và áp dụng behavior phù hợp

### 3. Tích hợp vào Layout

Component `ScrollRestoration` đã được tích hợp vào `Layout.tsx`:

```typescript
<ScrollRestoration 
  scrollContainerRef={scrollContainerRef}
  scrollBehavior="auto"  // Tự động từ route config
  scrollDelay={0}
  smooth={false}
/>
```

## Logic tự động

### Route Type Detection

Hệ thống tự động detect route type:

- **Dashboard**: `/`, `/dashboard`, `/home`
- **ListView**: Các route không có pattern `/:id`, không có `/moi`, `/sua`
- **DetailView**: Route có pattern `/:id` ở cuối (số hoặc UUID)
- **FormView**: Route có `/moi` hoặc `/sua` ở cuối
- **Settings**: Route có `/settings`, `/ho-so`, `/doi-mat-khau`

### Navigation Flow

```
Dashboard → ListView → DetailView → FormView
   ↓          ↓           ↓           ↓
  Top      Restore    Top        Top
```

- **ListView → DetailView**: Scroll to top
- **DetailView → ListView** (back): Restore scroll position
- **ListView → FormView**: Scroll to top
- **FormView → ListView** (cancel): Restore scroll position
- **FormView → DetailView** (save): Scroll to top

## API

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

### useRouteScrollBehavior Hook

```typescript
import { useRouteScrollBehavior } from '@/shared/hooks/use-route-scroll-behavior'

function MyComponent() {
  const scrollBehavior = useRouteScrollBehavior()
  // Returns: 'top' | 'restore' | 'preserve' | 'auto'
}
```

## Tùy chỉnh

### Custom Scroll Container

Nếu scroll container không phải là element mặc định trong Layout:

```typescript
const customScrollRef = useRef<HTMLDivElement>(null)

<ScrollRestoration scrollContainerRef={customScrollRef} />
```

### Smooth Scrolling

Bật smooth scrolling:

```typescript
<ScrollRestoration smooth={true} />
```

### Scroll Delay

Thêm delay nếu content lazy load:

```typescript
<ScrollRestoration scrollDelay={100} />
```

## Best Practices

1. **ListView routes**: Sử dụng `scrollBehavior: 'restore'`
2. **DetailView/FormView routes**: Sử dụng `scrollBehavior: 'top'`
3. **Dashboard routes**: Sử dụng `scrollBehavior: 'top'`
4. **Unknown routes**: Để `scrollBehavior: 'auto'` để tự động detect

## Lưu ý

- Scroll positions được lưu trong `sessionStorage` (tự động clear khi đóng tab)
- Tối đa 20 positions được lưu (LRU cache)
- Positions expire sau 30 phút
- Chỉ ListView routes mới lưu scroll position

