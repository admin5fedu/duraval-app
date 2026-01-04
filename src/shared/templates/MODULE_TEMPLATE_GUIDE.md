# Hướng Dẫn Tạo Module Mới (Generic Pattern)

Tài liệu này hướng dẫn cách tạo một module mới dựa trên pattern của module "Giai Đoạn Khách Buôn" và "Loại Phiếu".

## Cấu Trúc Thư Mục

```
features/{domain}/{parent-module}/{module-name}/
├── actions/
│   ├── {module-name}-excel-actions.tsx
│   └── index.ts
├── components/
│   ├── {module-name}-columns.tsx
│   ├── {module-name}-detail-view.tsx
│   ├── {module-name}-form-view.tsx
│   ├── {module-name}-import-dialog.tsx
│   ├── {module-name}-list-view.tsx
│   ├── delete-{module-name}-button.tsx
│   └── index.ts
├── hooks/
│   ├── index.ts
│   ├── use-{module-name}.ts
│   └── use-{module-name}-mutations.ts
├── routes/
│   ├── {module-name}-detail-route.tsx
│   ├── {module-name}-form-route.tsx
│   ├── {module-name}-list-route.tsx
│   └── index.ts
├── services/
│   └── {module-name}.api.ts
├── config.tsx
└── schema.ts
```

## Các Bước Thực Hiện

### Bước 1: Tạo Schema (schema.ts)

Định nghĩa Zod schema cho table:

```typescript
import { z } from "zod"

export const giaiDoanKhachBuonSchema = z.object({
  id: z.number().optional(),
  ma_giai_doan: z.string().min(1, "Mã giai đoạn là bắt buộc"),
  ten_giai_doan: z.string().nullable(),
  tt: z.number().min(1, "Thứ tự là bắt buộc"),
  mo_ta: z.string().nullable(),
  nguoi_tao_id: z.number().nullable(),
  tg_tao: z.string().nullable(),
  tg_cap_nhat: z.string().nullable(),
})

export type GiaiDoanKhachBuon = z.infer<typeof giaiDoanKhachBuonSchema>
```

### Bước 2: Tạo Config (config.tsx)

Định nghĩa cấu hình module:

```typescript
import { ModuleConfig } from "@/shared/types/module-config"

export const giaiDoanKhachBuonConfig: ModuleConfig = {
  moduleName: "giai-doan-khach-buon",
  moduleTitle: "Giai Đoạn Khách Buôn",
  moduleDescription: "Quản lý giai đoạn khách buôn",
  routePath: "/ban-buon/giai-doan-khach-buon",
  parentPath: "/ban-buon",
  breadcrumb: {
    label: "Giai Đoạn Khách Buôn",
    parentLabel: "Bán Buôn",
  },
  tableName: "bb_giai_doan",
  primaryKey: "id",
  filterColumns: [],
  searchFields: ["ma_giai_doan", "ten_giai_doan", "mo_ta"],
  defaultSorting: [{ id: "tt", desc: false }],
}
```

### Bước 3: Tạo Query Keys (lib/react-query/query-keys/{module-name}.ts)

```typescript
export const giaiDoanKhachBuonKeys = {
  all: ["giai-doan-khach-buon"] as const,
  lists: () => [...giaiDoanKhachBuonKeys.all, "list"] as const,
  list: (filters?: string) => [...giaiDoanKhachBuonKeys.lists(), { filters }] as const,
  details: () => [...giaiDoanKhachBuonKeys.all, "detail"] as const,
  detail: (id: number) => [...giaiDoanKhachBuonKeys.details(), id] as const,
}
```

### Bước 4: Tạo API Service (services/{module-name}.api.ts)

Tạo service để tương tác với Supabase:

```typescript
import { supabase } from "@/lib/supabase/client"
import { GiaiDoanKhachBuon } from "../schema"

export const giaiDoanKhachBuonApi = {
  getAll: async (): Promise<GiaiDoanKhachBuon[]> => {
    const { data, error } = await supabase
      .from("bb_giai_doan")
      .select("*")
      .order("tt", { ascending: true })
    
    if (error) throw error
    return data || []
  },
  
  getById: async (id: number): Promise<GiaiDoanKhachBuon> => {
    const { data, error } = await supabase
      .from("bb_giai_doan")
      .select("*")
      .eq("id", id)
      .single()
    
    if (error) throw error
    return data
  },
  
  create: async (item: Partial<GiaiDoanKhachBuon>): Promise<GiaiDoanKhachBuon> => {
    const { data, error } = await supabase
      .from("bb_giai_doan")
      .insert(item)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  update: async (id: number, item: Partial<GiaiDoanKhachBuon>): Promise<GiaiDoanKhachBuon> => {
    const { data, error } = await supabase
      .from("bb_giai_doan")
      .update(item)
      .eq("id", id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from("bb_giai_doan")
      .delete()
      .eq("id", id)
    
    if (error) throw error
  },
  
  batchDelete: async (ids: number[]): Promise<void> => {
    const { error } = await supabase
      .from("bb_giai_doan")
      .delete()
      .in("id", ids)
    
    if (error) throw error
  },
}
```

### Bước 5: Tạo Hooks (hooks/)

#### use-{module-name}.ts (Query hooks)

```typescript
import { useQuery } from "@tanstack/react-query"
import { giaiDoanKhachBuonApi } from "../services/giai-doan-khach-buon.api"
import { giaiDoanKhachBuonKeys } from "@/lib/react-query/query-keys/giai-doan-khach-buon"
import { GiaiDoanKhachBuon } from "../schema"

export function useGiaiDoanKhachBuon(initialData?: GiaiDoanKhachBuon[]) {
  return useQuery({
    queryKey: giaiDoanKhachBuonKeys.list(),
    queryFn: () => giaiDoanKhachBuonApi.getAll(),
    initialData,
  })
}

export function useGiaiDoanKhachBuonById(id: number | undefined) {
  return useQuery({
    queryKey: giaiDoanKhachBuonKeys.detail(id!),
    queryFn: () => giaiDoanKhachBuonApi.getById(id!),
    enabled: !!id,
  })
}
```

#### use-{module-name}-mutations.ts (Mutation hooks)

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { giaiDoanKhachBuonApi } from "../services/giai-doan-khach-buon.api"
import { giaiDoanKhachBuonKeys } from "@/lib/react-query/query-keys/giai-doan-khach-buon"
import { createMutationHooks } from "@/shared/hooks/create-mutation-hooks"
import { GiaiDoanKhachBuon } from "../schema"

export const {
  useCreateGiaiDoanKhachBuon,
  useUpdateGiaiDoanKhachBuon,
  useDeleteGiaiDoanKhachBuon,
  useBatchDeleteGiaiDoanKhachBuon,
} = createMutationHooks({
  keys: giaiDoanKhachBuonKeys,
  api: giaiDoanKhachBuonApi,
})
```

### Bước 6: Tạo Components

#### {module-name}-columns.tsx

Định nghĩa columns cho data table:

```typescript
import { ColumnDef } from "@tanstack/react-table"
import { GiaiDoanKhachBuon } from "../schema"
import { giaiDoanKhachBuonConfig } from "../config"
// ... (tham khảo file thực tế)
```

#### {module-name}-list-view.tsx

Component hiển thị danh sách:

```typescript
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
// ... (tham khảo file thực tế)
```

#### {module-name}-form-view.tsx

Component form create/edit:

```typescript
import { GenericFormView } from "@/shared/components/data-entry/generic-form-view/generic-form-view"
// ... (tham khảo file thực tế)
```

#### {module-name}-detail-view.tsx

Component detail view:

```typescript
import { GenericDetailViewSimple } from "@/shared/components/data-display/generic-detail-view-simple/generic-detail-view-simple"
// ... (tham khảo file thực tế)
```

### Bước 7: Tạo Routes

#### {module-name}-list-route.tsx

```typescript
"use client"

import { useNavigate } from "react-router-dom"
import { GiaiDoanKhachBuonListView } from "../components/giai-doan-khach-buon-list-view"
import { giaiDoanKhachBuonConfig } from "../config"
// Nếu có tabs group, import tabs component
// import { ThietLapKhachBuonTabs } from "../../components/thiet-lap-khach-buon-tabs"

export default function GiaiDoanKhachBuonListRoute() {
  const navigate = useNavigate()

  const handleEdit = (id: number) => {
    navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}/sua?returnTo=list`)
  }

  const handleAddNew = () => {
    navigate(`${giaiDoanKhachBuonConfig.routePath}/moi`)
  }

  const handleView = (id: number) => {
    navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}`)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Nếu có tabs group, thêm ở đây */}
      {/* <ThietLapKhachBuonTabs /> */}
      <div className="flex-1 overflow-hidden">
        <GiaiDoanKhachBuonListView
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          onView={handleView}
        />
      </div>
    </div>
  )
}
```

#### {module-name}-form-route.tsx

```typescript
"use client"

import { useParams, useNavigate, useLocation } from "react-router-dom"
import { GiaiDoanKhachBuonFormView } from "../components/giai-doan-khach-buon-form-view"
import { giaiDoanKhachBuonConfig } from "../config"

export default function GiaiDoanKhachBuonFormRoute() {
  const params = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  
  const isNewMode = location.pathname.endsWith('/moi')
  const isEditMode = !isNewMode && !!params.id
  const id = params.id ? parseInt(params.id, 10) : undefined

  if (isEditMode && (!id || isNaN(id))) {
    navigate(giaiDoanKhachBuonConfig.routePath)
    return null
  }

  const handleComplete = () => {
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'list') {
      navigate(giaiDoanKhachBuonConfig.routePath)
    } else if (returnTo === 'detail' && isEditMode && id) {
      navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}`)
    } else if (isEditMode && id) {
      navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}`)
    } else {
      navigate(giaiDoanKhachBuonConfig.routePath)
    }
  }

  const handleCancel = () => {
    const searchParams = new URLSearchParams(location.search)
    const returnTo = searchParams.get('returnTo')

    if (returnTo === 'detail' && isEditMode && id) {
      navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}`)
    } else {
      navigate(giaiDoanKhachBuonConfig.routePath)
    }
  }

  return (
    <GiaiDoanKhachBuonFormView
      id={isEditMode ? id : undefined}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  )
}
```

#### {module-name}-detail-route.tsx

```typescript
"use client"

import { useParams, useNavigate } from "react-router-dom"
import { GiaiDoanKhachBuonDetailView } from "../components/giai-doan-khach-buon-detail-view"
import { giaiDoanKhachBuonConfig } from "../config"

export default function GiaiDoanKhachBuonDetailRoute() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const id = params.id ? parseInt(params.id, 10) : undefined

  if (!id || isNaN(id)) {
    navigate(giaiDoanKhachBuonConfig.routePath)
    return null
  }

  const handleEdit = () => {
    navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleBack = () => {
    navigate(giaiDoanKhachBuonConfig.routePath)
  }

  return (
    <GiaiDoanKhachBuonDetailView
      id={id}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  )
}
```

### Bước 8: Thêm Routes vào routes.tsx

```typescript
// Import routes
const GiaiDoanKhachBuonListRoute = lazy(() => import('@/features/ban-buon/thiet-lap-khach-buon/giai-doan-khach-buon/routes/giai-doan-khach-buon-list-route'))
const GiaiDoanKhachBuonDetailRoute = lazy(() => import('@/features/ban-buon/thiet-lap-khach-buon/giai-doan-khach-buon/routes/giai-doan-khach-buon-detail-route'))
const GiaiDoanKhachBuonFormRoute = lazy(() => import('@/features/ban-buon/thiet-lap-khach-buon/giai-doan-khach-buon/routes/giai-doan-khach-buon-form-route'))

// Thêm vào routes array (theo thứ tự: /moi trước, /:id/sua, /:id, cuối cùng là /)
{
  path: '/ban-buon/giai-doan-khach-buon/moi',
  element: GiaiDoanKhachBuonFormRoute,
  protected: true,
  layout: true,
  scrollBehavior: 'top',
},
{
  path: '/ban-buon/giai-doan-khach-buon/:id/sua',
  element: GiaiDoanKhachBuonFormRoute,
  protected: true,
  layout: true,
  scrollBehavior: 'top',
},
{
  path: '/ban-buon/giai-doan-khach-buon/:id',
  element: GiaiDoanKhachBuonDetailRoute,
  protected: true,
  layout: true,
  scrollBehavior: 'top',
},
{
  path: '/ban-buon/giai-doan-khach-buon',
  element: GiaiDoanKhachBuonListRoute,
  protected: true,
  layout: true,
  scrollBehavior: 'restore',
},
```

### Bước 9: Export Query Keys (lib/react-query/query-keys/index.ts)

```typescript
export * from './giai-doan-khach-buon'
```

## Lưu Ý Quan Trọng

1. **Thứ tự routes**: Routes phải được sắp xếp theo thứ tự từ cụ thể đến chung (`/moi` → `/:id/sua` → `/:id` → `/`)

2. **Tabs Group**: Nếu module nằm trong một nhóm có tabs (như "Giai Đoạn", "Trạng Thái", "Mức Đăng Ký"), cần:
   - Tạo tabs component trong thư mục `components/` của parent module
   - Import và sử dụng tabs component trong list-route

3. **Excel Import/Export**: 
   - Tạo file `actions/{module-name}-excel-actions.tsx` cho batch operations
   - Tạo component `{module-name}-import-dialog.tsx` cho import dialog
   - Integrate vào list-view

4. **Required Fields**: Nếu có fields bắt buộc, cần:
   - Đánh dấu trong schema với `.min(1, "message")`
   - Validate trong API service
   - Đánh dấu `required: true` trong form-view

5. **Default Values**: Nếu có default values (ví dụ: `max(tt) + 1`), xử lý trong form-view với `defaultValues`

## Module Reference

Tham khảo module hoàn chỉnh:
- `src/features/ban-buon/thiet-lap-khach-buon/giai-doan-khach-buon/`
- `src/features/kinh-doanh/quy-ho-tro-ban-hang/loai-phieu-hang-muc/loai-phieu/`

