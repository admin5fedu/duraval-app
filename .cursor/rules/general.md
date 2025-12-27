# General Rules - Quy Tắc Chung

## 🏗️ Project Context & Stack

### Tech Stack
- **Frontend Framework**: React 18.3.1 + TypeScript 5.6.2
- **Build Tool**: Vite 5.4.2
- **Routing**: React Router DOM 6.26.0
- **State Management**: Zustand 4.5.5 (client state) + TanStack React Query 5.56.2 (server state)
- **UI Library**: Radix UI + Tailwind CSS 3.4.14
- **Forms**: React Hook Form 7.53.0 + Zod 3.23.8
- **Tables**: TanStack React Table 8.20.5
- **Backend**: Supabase 2.46.1 (PostgreSQL, Auth, Realtime)
- **Styling**: Tailwind CSS + Class Variance Authority + clsx/tailwind-merge
- **Icons**: Lucide React
- **Date**: Day.js 1.11.13 + date-fns 3.6.0
- **PDF/Excel**: jsPDF + ExcelJS 4.4.0
- **Charts**: Recharts 3.6.0

### Project Type
ERP System (Hệ thống quản lý doanh nghiệp) với hỗ trợ PWA.

## 📁 Folder Structure

```
src/
├── components/        # React components
│   ├── auth/         # Authentication components
│   ├── layout/       # Layout components (Header, Sidebar, TopBar)
│   └── ui/           # Reusable UI components (Radix UI wrappers)
├── config/           # Configuration files
│   └── routes.tsx    # Route configuration
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries
│   ├── supabase.ts   # Supabase client
│   ├── utils.ts      # Utility functions
│   ├── format.ts     # Formatting functions
│   ├── constants.ts  # App constants
│   ├── validations.ts # Zod schemas
│   ├── excel/        # Excel utilities
│   └── pdf/          # PDF utilities
├── pages/            # Page components (route pages)
├── services/         # API services
├── shared/           # Shared components, utilities, stores
│   ├── components/   # Generic reusable components
│   ├── stores/       # Zustand stores
│   ├── hooks/        # Shared hooks
│   └── utils/        # Shared utilities
├── features/         # Feature-based modules
│   └── [category]/   # Feature categories
│       └── [module]/ # Individual modules
│           ├── components/
│           ├── hooks/
│           └── services/
└── types/            # TypeScript type definitions
```

## 📝 Coding Standards

### TypeScript
- **Strict mode**: Luôn bật strict TypeScript
- **Naming conventions**:
  - Components: PascalCase (`UserProfile.tsx`)
  - Functions/variables: camelCase (`getUserData`)
  - Types/Interfaces: PascalCase (`UserData`, `ApiResponse`)
  - Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
  - Files: kebab-case (`user-profile.tsx`, `use-user-data.ts`)

### Code Organization
- **One component per file**: Mỗi file chỉ export một component chính
- **Co-location**: Related files nên ở gần nhau (components, hooks, types của cùng feature)
- **Barrel exports**: Sử dụng `index.ts` để export từ thư mục khi cần

### Imports
- **Absolute imports**: Sử dụng `@/` alias cho imports từ `src/`
- **Order**: 
  1. External libraries
  2. Internal absolute imports (`@/...`)
  3. Relative imports (`./`, `../`)
- **Type imports**: Sử dụng `import type` cho type-only imports

### Comments & Documentation
- **JSDoc**: Thêm JSDoc cho public functions, components, và complex logic
- **Vietnamese**: Comments và docs có thể dùng tiếng Việt
- **TODO/FIXME**: Đánh dấu rõ ràng với TODO/FIXME comments

## 🎨 Design System

### Styling Approach
- **Tailwind CSS**: Primary styling method
- **Utility function**: Sử dụng `cn()` từ `@/lib/utils` để merge classes
- **Radix UI**: Base components, customize với Tailwind
- **Responsive**: Mobile-first approach

### Color System
- Sử dụng Tailwind theme colors
- Custom colors được định nghĩa trong `tailwind.config.js` và `src/index.css`

### Typography
- Font system được định nghĩa trong Tailwind config
- Sử dụng Tailwind typography utilities

### Spacing & Layout
- Sử dụng Tailwind spacing scale
- Consistent padding/margin patterns

## ⚠️ Quy Tắc Đặc Biệt

### Documentation Files
**KHÔNG được tự ý tạo file .md** (trừ README.md). Khi muốn tạo file documentation mới, PHẢI HỎI USER trước.

### File Organization
- Không tạo file trùng lặp chức năng
- Kiểm tra `shared/` trước khi tạo utility mới
- Follow existing patterns trong project

### Dependencies
- Không thêm dependency mới mà không được user yêu cầu
- Khi cần, đề xuất và giải thích lý do trước

