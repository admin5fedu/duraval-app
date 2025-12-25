# Duraval - ERP System

Hệ thống quản lý doanh nghiệp toàn diện với hỗ trợ PWA.

## 🚀 Tech Stack

### Frontend Framework & Core
- **React** 18.3.1
- **TypeScript** 5.6.2
- **Vite** 5.4.2
- **React Router DOM** 6.26.0

### State Management & Data Fetching
- **Zustand** 4.5.5 - Quản lý state
- **TanStack React Query** 5.56.2 - Server state, caching
- **TanStack React Query DevTools** - Development tools

### UI & Styling
- **Tailwind CSS** 3.4.14
- **Tailwind CSS Animate** 1.0.7
- **Radix UI** - Alert Dialog, Dialog, Popover, Tabs
- **Framer Motion** 11.3.15
- **Lucide React** 0.447.0
- **Class Variance Authority** 0.7.0
- **clsx & tailwind-merge**

### Form Management & Validation
- **React Hook Form** 7.53.0
- **Zod** 3.23.8
- **@hookform/resolvers** 3.9.0

### Data Tables & Visualization
- **TanStack React Table** 8.20.5
- **Recharts** 3.6.0

### Backend & Database
- **Supabase** 2.46.1 (PostgreSQL, Auth, Realtime)

### Utilities & Libraries
- **Day.js** 1.11.13
- **Sonner** 1.7.0
- **jsPDF** 2.5.2 + jsPDF AutoTable 3.8.3
- **XLSX** 0.18.5
- **React Medium Image Zoom** 5.1.3
- **cmdk** 1.0.0

## 📁 Cấu trúc thư mục

```
duraval-app/
├── public/                 # Static files
│   └── manifest.json      # PWA manifest
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── layout/       # Layout components (Header, Sidebar)
│   │   └── ui/           # Reusable UI components
│   ├── config/           # Configuration files
│   │   └── routes.tsx    # Route configuration
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   │   ├── supabase.ts   # Supabase client
│   │   ├── utils.ts      # Utility functions
│   │   ├── format.ts     # Formatting functions
│   │   ├── constants.ts  # App constants
│   │   └── validations.ts # Zod schemas
│   ├── pages/            # Page components
│   │   ├── auth/         # Auth pages
│   │   └── dashboard/    # Dashboard pages
│   ├── services/         # API services
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main App component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── .eslintrc.cjs         # ESLint configuration
├── .gitignore           # Git ignore rules
├── index.html           # HTML template
├── package.json         # Dependencies
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## 🛠️ Cài đặt

### Yêu cầu
- Node.js >= 18.x
- npm hoặc yarn hoặc pnpm

### Bước 1: Cài đặt dependencies

```bash
npm install
```

### Bước 2: Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường trong file `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Bước 3: Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 📜 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run lint` - Chạy ESLint

## 🏗️ Tính năng chính

### Đã triển khai
- ✅ Authentication với Supabase
- ✅ Protected routes
- ✅ Layout với Sidebar và Header
- ✅ Routing structure
- ✅ State management với Zustand
- ✅ React Query setup
- ✅ UI components cơ bản
- ✅ Form validation với Zod
- ✅ TypeScript configuration
- ✅ Tailwind CSS với theme system
- ✅ PWA support

### Sắp triển khai
- 📋 Quản lý khách hàng
- 📦 Quản lý sản phẩm
- 📊 Quản lý kho hàng
- 🛒 Quản lý đơn hàng
- 📈 Báo cáo và thống kê
- 📄 Quản lý tài liệu
- ⚙️ Cài đặt hệ thống

## 🔐 Authentication

Ứng dụng sử dụng Supabase Auth để quản lý xác thực. Các route được bảo vệ bằng component `ProtectedRoute`.

## 🎨 Styling

Ứng dụng sử dụng Tailwind CSS với hệ thống theme tùy chỉnh. Các màu sắc và biến được định nghĩa trong `src/index.css`.

## 📝 Lưu ý

- Đảm bảo đã cấu hình Supabase project trước khi chạy ứng dụng
- Cần tạo các bảng trong Supabase database theo schema trong `src/types/index.ts`
- PWA icons cần được thêm vào thư mục `public/`

## 📄 License

MIT

