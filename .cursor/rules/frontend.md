# Frontend Rules - Quy Tắc Frontend

## ⚛️ React Patterns

### Component Structure
- **Functional components**: Chỉ sử dụng functional components với hooks
- **"use client" directive**: Thêm `"use client"` ở đầu file cho client components
- **Default exports**: Components chính dùng default export
- **Named exports**: Utilities, types, constants dùng named exports

**Template chuẩn:**
```typescript
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ComponentProps {
  // props
}

export default function ComponentName({ ...props }: ComponentProps) {
  // component logic
  return (
    // JSX
  )
}
```

### Hooks Usage
- **Custom hooks**: Tạo custom hooks trong `src/hooks/` hoặc `src/shared/hooks/`
- **Naming**: Custom hooks bắt đầu với `use` (`useUserData`, `useDebounce`)
- **Co-location**: Hooks liên quan đến feature nên ở trong feature folder

### State Management
- **Local state**: `useState`, `useReducer` cho component-level state
- **Zustand**: Cho global client state (auth, preferences, UI state)
- **React Query**: Cho server state (data fetching, caching, mutations)
- **Context**: Chỉ dùng khi thực sự cần (tránh prop drilling)

### Performance Optimization
- **Dynamic imports**: Sử dụng `React.lazy()` và `Suspense` cho code splitting
- **Memoization**: `useMemo`, `useCallback` khi cần thiết, không overuse
- **Virtual scrolling**: Sử dụng `@tanstack/react-virtual` cho lists dài
- **Image optimization**: Lazy loading cho images

## 🧩 Component Patterns

### Component Organization
- **Atomic design**: Components trong `components/ui/` là atomic, reusable
- **Feature components**: Components specific cho feature ở trong feature folder
- **Shared components**: Generic components ở `src/shared/components/`

### Component Props
- **Interface cho props**: Luôn định nghĩa interface/type cho component props
- **Default props**: Sử dụng default parameters thay vì defaultProps
- **Props destructuring**: Destructure props trong function signature

### Component Composition
- **Composition over inheritance**: Ưu tiên composition
- **Render props**: Có thể dùng khi phù hợp
- **Children pattern**: Sử dụng `children` prop khi cần flexibility

## 🛣️ Routing & Navigation

### Routing Conventions
- **React Router DOM**: Sử dụng React Router v6
- **Route structure**: Flatten structure, không có cấp trung gian
- **Route paths**: Kebab-case (`/he-thong/danh-sach-nhan-su`)
- **Nested routes**: Sử dụng `Outlet` cho nested routes

### Navigation Helpers
- **useNavigate**: Hook chính cho navigation
- **getParentRouteFromBreadcrumb**: Utility function để tính parent route
- **Absolute paths**: Luôn dùng absolute paths, không dùng relative
- **Query params**: Sử dụng cho filter, pagination, return navigation (`?returnTo=list`)

### Route Configuration
- Route config được định nghĩa trong `src/config/routes.tsx`
- Path labels được map trong `src/lib/routing-config.ts` (nếu có)

## 🎨 UI Components

### Radix UI
- **Base components**: Sử dụng Radix UI primitives từ `@/components/ui/`
- **Customization**: Customize với Tailwind, không override Radix styles trực tiếp
- **Accessibility**: Radix đã handle a11y, không cần tự implement

### Tailwind CSS
- **Utility classes**: Ưu tiên utility classes
- **cn() helper**: Sử dụng `cn()` để merge classes conditionally
- **Responsive**: Mobile-first breakpoints
- **Custom classes**: Khi cần reuse, tạo component thay vì custom class

### Component Library Structure
```
components/ui/
├── button.tsx
├── dialog.tsx
├── input.tsx
└── ...
```
Mỗi component:
- Import từ Radix UI
- Customize với Tailwind
- Export interface cho props
- Có variants nếu cần (dùng CVA)

## 📋 Forms

### React Hook Form
- **Primary form library**: React Hook Form cho tất cả forms
- **FormProvider**: Sử dụng cho complex forms với nested fields
- **Form validation**: Zod schemas với `@hookform/resolvers/zod`

### Form Patterns
- **Generic form view**: Sử dụng `GenericFormView` từ `src/shared/components/forms/`
- **Field renderer**: Sử dụng `FormFieldRenderer` cho dynamic fields
- **Form sections**: Group fields vào sections với `FormSectionCard`

### Validation
- **Zod schemas**: Định nghĩa trong `src/lib/validations.ts` hoặc feature-specific
- **Error messages**: Tiếng Việt, user-friendly
- **Async validation**: Hỗ trợ async validation khi cần

## 📊 Tables & Data Display

### TanStack React Table
- **Primary table library**: TanStack React Table v8
- **Column definitions**: Tách ra file `Columns.tsx` riêng
- **Generic table**: Sử dụng `GenericListView` từ `src/shared/components/`

### Table Patterns
- **Virtual scrolling**: Cho large datasets
- **Sorting, filtering, pagination**: Built-in support từ GenericListView
- **Column visibility**: Sử dụng column visibility controls
- **Export functionality**: Excel export với ExcelJS

### Data Display
- **Detail view**: Sử dụng `GenericDetailView` từ shared components
- **List view**: Sử dụng `GenericListView` với toolbar, filters
- **Mobile responsive**: Card view cho mobile, table view cho desktop

## 🔄 Data Fetching

### React Query
- **Server state**: Tất cả server data fetching qua React Query
- **Query keys**: Tổ chức query keys trong `src/lib/react-query/query-keys/`
- **Custom hooks**: Tạo custom hooks cho queries (`useUserData`, `useUserList`)
- **Mutations**: Separate hooks cho mutations (`useCreateUser`, `useUpdateUser`)

### Query Patterns
- **Optimistic updates**: Sử dụng khi phù hợp
- **Cache invalidation**: Invalidate queries sau mutations
- **Error handling**: Centralized error handling
- **Loading states**: Sử dụng `isLoading`, `isFetching` phù hợp

## 📱 Responsive Design

### Mobile-First
- **Breakpoints**: Tailwind default breakpoints
- **Mobile cards**: Card layout cho mobile, table cho desktop
- **Touch-friendly**: Button sizes, spacing phù hợp cho mobile
- **Navigation**: Mobile footer nav, sidebar cho desktop

### Breakpoint Strategy
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px
- `2xl:` 1536px

## 🎯 Performance Best Practices

### Code Splitting
- **Route-based splitting**: Dynamic imports cho routes
- **Component lazy loading**: React.lazy() cho heavy components
- **Library splitting**: Chia nhỏ large libraries nếu cần

### Rendering Optimization
- **Avoid unnecessary re-renders**: useMemo, useCallback khi cần
- **List virtualization**: Cho lists dài
- **Image lazy loading**: Native lazy loading hoặc library

### Bundle Size
- **Tree shaking**: Đảm bảo imports được tree-shake được
- **Analyze bundle**: Kiểm tra bundle size thường xuyên
- **Avoid large dependencies**: Cân nhắc alternatives nhẹ hơn

