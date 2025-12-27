# Kế Hoạch Xây Dựng Module "Thông Tin Người Thân"

## 📋 Tổng Quan

Module quản lý thông tin người thân của nhân viên, kết nối với bảng `var_nguoi_than` trên Supabase.

**Đường dẫn module**: `src/features/he-thong/nhan-su/nguoi-than`

**Bảng database**: `var_nguoi_than`

**Primary Key**: `id` (bigint)

**Foreign Key**: `ma_nhan_vien` -> `var_nhan_su(ma_nhan_vien)`

---

## 📁 Cấu Trúc Thư Mục

```
src/features/he-thong/nhan-su/nguoi-than/
├── config.tsx                    # Module configuration
├── schema.ts                     # Zod schema và types
├── types/
│   └── nguoi-than-types.ts       # TypeScript types (nếu tách riêng)
│   └── index.ts                  # Export types
├── services/
│   ├── index.ts                  # Export services
│   ├── nguoi-than-service.ts     # Domain service (validation, business logic)
│   └── nguoi-than.api.ts         # Supabase API service
├── hooks/
│   ├── index.ts                  # Export hooks
│   ├── use-nguoi-than.ts         # Query hooks (useList, useDetail)
│   └── use-nguoi-than-mutations.ts # Mutation hooks (create, update, delete)
├── components/
│   ├── index.ts                  # Export components
│   ├── nguoi-than-list-view.tsx  # Danh sách người thân
│   ├── nguoi-than-form-view.tsx  # Form thêm/sửa
│   ├── nguoi-than-detail-view.tsx # Chi tiết người thân
│   ├── nguoi-than-columns.tsx    # Table columns definition
│   └── delete-nguoi-than-button.tsx # Delete button component
├── routes/
│   ├── index.ts                  # Export routes
│   ├── nguoi-than-list-route.tsx # List route
│   ├── nguoi-than-form-route.tsx # Form route (create/edit)
│   └── nguoi-than-detail-route.tsx # Detail route
└── index.tsx                     # Module entry (optional, deprecated pattern)
```

---

## 🗄️ Schema Database

| Tên Cột       | Kiểu Dữ liệu             | NULL  | Default | FK                    |
| ------------- | ------------------------ | ----- | ------- | --------------------- |
| id            | bigint                   | NO    | null    | -                     |
| ma_nhan_vien  | bigint                   | NO    | null    | var_nhan_su(ma_nhan_vien) |
| ho_va_ten     | text                     | NO    | null    | -                     |
| moi_quan_he   | text                     | NO    | null    | -                     |
| ngay_sinh     | date                     | YES   | null    | -                     |
| so_dien_thoai | text                     | YES   | null    | -                     |
| ghi_chu       | text                     | YES   | null    | -                     |
| nguoi_tao     | bigint                   | YES   | null    | -                     |
| tg_tao        | timestamp with time zone | YES   | now()   | -                     |
| tg_cap_nhat   | timestamp with time zone | YES   | now()   | -                     |

---

## 📝 Chi Tiết Implementation

### 1. **config.tsx** - Module Configuration

```typescript
import { ModuleConfig } from "@/shared/types/module-config"

export const nguoiThanConfig: ModuleConfig = {
  moduleName: "nguoi-than",
  moduleTitle: "Thông Tin Người Thân",
  moduleDescription: "Quản lý thông tin người thân của nhân viên",
  
  routePath: "/he-thong/nhan-su/nguoi-than",
  parentPath: "/he-thong/nhan-su",
  
  breadcrumb: {
    label: "Thông Tin Người Thân",
    parentLabel: "Nhân Sự",
  },
  
  tableName: "var_nguoi_than",
  primaryKey: "id",
  
  filterColumns: [
    {
      columnId: "moi_quan_he",
      title: "Mối Quan Hệ",
      options: [
        { label: "Cha", value: "Cha" },
        { label: "Mẹ", value: "Mẹ" },
        { label: "Vợ/Chồng", value: "Vợ/Chồng" },
        { label: "Con", value: "Con" },
        { label: "Anh/Chị/Em", value: "Anh/Chị/Em" },
        { label: "Khác", value: "Khác" },
      ],
    },
  ],
  searchFields: ["ho_va_ten", "so_dien_thoai", "ghi_chu"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}
```

### 2. **schema.ts** - Zod Schema

```typescript
import { z } from "zod"

export const nguoiThanSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  ma_nhan_vien: z.number({ required_error: "Mã nhân viên là bắt buộc" }),
  ho_va_ten: z.string().min(1, "Họ và tên là bắt buộc"),
  moi_quan_he: z.string().min(1, "Mối quan hệ là bắt buộc"),
  ngay_sinh: z.string().optional().nullable(),
  so_dien_thoai: z.string().optional().nullable(),
  ghi_chu: z.string().optional().nullable(),
  nguoi_tao: z.number().optional().nullable(),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
})

export type NguoiThan = z.infer<typeof nguoiThanSchema>

export type CreateNguoiThanInput = Omit<NguoiThan, "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao">
export type UpdateNguoiThanInput = Partial<Omit<NguoiThan, "id" | "ma_nhan_vien" | "tg_tao" | "nguoi_tao">>
```

### 3. **services/nguoi-than.api.ts** - Supabase API

Methods cần implement:
- `getAll()` - Lấy tất cả người thân
- `getById(id: number)` - Lấy theo ID
- `getByMaNhanVien(maNhanVien: number)` - Lấy theo mã nhân viên (quan trọng!)
- `create(input: CreateNguoiThanInput)` - Tạo mới
- `update(id: number, input: UpdateNguoiThanInput)` - Cập nhật
- `delete(id: number)` - Xóa
- `batchDelete(ids: number[])` - Xóa hàng loạt

### 4. **services/nguoi-than-service.ts** - Domain Service

- `validateCreateInput()` - Validate dữ liệu tạo mới
- `buildUpdatePayload()` - Chuẩn hóa payload update

### 5. **hooks/use-nguoi-than.ts** - Query Hooks

- `useNguoiThan(initialData?)` - Lấy danh sách
- `useNguoiThanById(id, initialData?)` - Lấy chi tiết
- `useNguoiThanByMaNhanVien(maNhanVien)` - Lấy theo mã nhân viên

### 6. **hooks/use-nguoi-than-mutations.ts** - Mutation Hooks

- `useCreateNguoiThan()` - Tạo mới
- `useUpdateNguoiThan()` - Cập nhật
- `useDeleteNguoiThan()` - Xóa
- `useBatchDeleteNguoiThan()` - Xóa hàng loạt

### 7. **components/nguoi-than-list-view.tsx** - List View

- Sử dụng `GenericListView`
- Filter theo `moi_quan_he`
- Search theo `ho_va_ten`, `so_dien_thoai`, `ghi_chu`
- Hiển thị: Mã NV, Họ tên, Mối quan hệ, Ngày sinh, SĐT
- Actions: Xem, Sửa, Xóa

### 8. **components/nguoi-than-form-view.tsx** - Form View

Form sections:
1. **Thông Tin Người Thân**
   - Mã nhân viên (required, có thể là select/dropdown từ danh sách nhân viên)
   - Họ và tên (required)
   - Mối quan hệ (required, select: Cha, Mẹ, Vợ/Chồng, Con, Anh/Chị/Em, Khác)
   - Ngày sinh (date)
   - Số điện thoại (text)

2. **Ghi Chú**
   - Ghi chú (textarea)

### 9. **components/nguoi-than-detail-view.tsx** - Detail View

Sử dụng `GenericDetailViewSimple` với sections:
- Thông tin người thân
- Thông tin nhân viên (join từ var_nhan_su)
- Ghi chú

### 10. **components/nguoi-than-columns.tsx** - Table Columns

Columns:
- Checkbox (select)
- ID
- Mã nhân viên (clickable, link to nhan su detail)
- Họ và tên (sticky left)
- Mối quan hệ
- Ngày sinh (format date)
- Số điện thoại
- Thời gian tạo
- Actions (sticky right)

### 11. **routes/** - Route Components

- `nguoi-than-list-route.tsx` - `/he-thong/nhan-su/nguoi-than`
- `nguoi-than-form-route.tsx` - `/he-thong/nhan-su/nguoi-than/moi` và `/he-thong/nhan-su/nguoi-than/:id/sua`
- `nguoi-than-detail-route.tsx` - `/he-thong/nhan-su/nguoi-than/:id`

### 12. **Query Keys** - React Query

Thêm vào `src/lib/react-query/query-keys/nguoi-than.ts`:

```typescript
export const nguoiThan: QueryKeyFactory = {
  all: () => ["nguoi-than"] as const,
  list: () => ["nguoi-than", "list"] as const,
  detail: (id: number) => ["nguoi-than", "detail", id] as const,
  byMaNhanVien: (maNhanVien: number) => ["nguoi-than", "byMaNhanVien", maNhanVien] as const,
}
```

Export trong `src/lib/react-query/query-keys/index.ts`

### 13. **Routes Registration**

Thêm vào `src/routes.tsx`:

```typescript
const NguoiThanListRoute = lazy(() => import('@/features/he-thong/nhan-su/nguoi-than/routes/nguoi-than-list-route'))
const NguoiThanDetailRoute = lazy(() => import('@/features/he-thong/nhan-su/nguoi-than/routes/nguoi-than-detail-route'))
const NguoiThanFormRoute = lazy(() => import('@/features/he-thong/nhan-su/nguoi-than/routes/nguoi-than-form-route'))

// Thêm vào routes array (order matters):
{
  path: '/he-thong/nhan-su/nguoi-than/moi',
  element: NguoiThanFormRoute,
  protected: true,
  layout: true,
  scrollBehavior: 'top',
},
{
  path: '/he-thong/nhan-su/nguoi-than/:id/sua',
  element: NguoiThanFormRoute,
  protected: true,
  layout: true,
  scrollBehavior: 'top',
},
{
  path: '/he-thong/nhan-su/nguoi-than/:id',
  element: NguoiThanDetailRoute,
  protected: true,
  layout: true,
  scrollBehavior: 'top',
},
{
  path: '/he-thong/nhan-su/nguoi-than',
  element: NguoiThanListRoute,
  protected: true,
  layout: true,
  scrollBehavior: 'restore',
},
```

---

## ✅ Checklist Implementation

### Phase 1: Core Setup
- [ ] Tạo cấu trúc thư mục
- [ ] Tạo `config.tsx`
- [ ] Tạo `schema.ts` với Zod validation
- [ ] Tạo types exports

### Phase 2: Services Layer
- [ ] Implement `nguoi-than.api.ts` (CRUD operations)
- [ ] Implement `nguoi-than-service.ts` (business logic)

### Phase 3: React Query Integration
- [ ] Tạo query keys (`nguoi-than.ts`)
- [ ] Export query keys trong index
- [ ] Implement `use-nguoi-than.ts` hooks
- [ ] Implement `use-nguoi-than-mutations.ts` hooks

### Phase 4: UI Components
- [ ] Implement `nguoi-than-columns.tsx`
- [ ] Implement `delete-nguoi-than-button.tsx`
- [ ] Implement `nguoi-than-list-view.tsx`
- [ ] Implement `nguoi-than-form-view.tsx`
- [ ] Implement `nguoi-than-detail-view.tsx`

### Phase 5: Routes
- [ ] Implement `nguoi-than-list-route.tsx`
- [ ] Implement `nguoi-than-form-route.tsx`
- [ ] Implement `nguoi-than-detail-route.tsx`
- [ ] Export routes

### Phase 6: Integration
- [ ] Đăng ký routes trong `src/routes.tsx`
- [ ] Test CRUD operations
- [ ] Test navigation flows
- [ ] Test filters và search

### Phase 7: Optional Enhancements
- [ ] Thêm import Excel (nếu cần)
- [ ] Thêm export Excel (nếu cần)
- [ ] Thêm bulk operations
- [ ] Thêm link từ nhan su detail -> danh sách người thân

---

## 🔗 Mối Quan Hệ với Module Khác

### Liên kết với Nhân Sự (var_nhan_su)
- `ma_nhan_vien` là foreign key
- Có thể hiển thị thông tin nhân viên trong detail view
- Có thể filter theo nhân viên
- Trong form, có thể cần dropdown chọn nhân viên (hoặc tự động từ context)

---

## 📌 Notes

1. **Primary Key**: Sử dụng `id` (bigint) thay vì `ma_nhan_vien` vì một nhân viên có thể có nhiều người thân.

2. **Foreign Key**: `ma_nhan_vien` là required, cần validate tồn tại trong `var_nhan_su`.

3. **Mối Quan Hệ**: Nên có dropdown với các giá trị: Cha, Mẹ, Vợ/Chồng, Con, Anh/Chị/Em, Khác.

4. **Tự Động Set**: 
   - `nguoi_tao`: Set từ user hiện tại (nếu có auth)
   - `tg_tao`: Auto set khi create
   - `tg_cap_nhat`: Auto set khi update

5. **Optional Fields**: `ngay_sinh`, `so_dien_thoai`, `ghi_chu` có thể null.

---

## 🚀 Thứ Tự Implementation Khuyến Nghị

1. **Bắt đầu với Core**: config, schema, types
2. **API Layer**: services để test kết nối database
3. **React Query**: hooks để test data fetching
4. **UI Components**: List view trước, sau đó form và detail
5. **Routes**: Kết nối tất cả lại
6. **Integration**: Đăng ký routes và test end-to-end

---

*Kế hoạch này tuân theo pattern và quy tắc từ module `danh-sach-nhan-su` để đảm bảo consistency.*

