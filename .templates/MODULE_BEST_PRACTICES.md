# Module Development Best Practices

Hướng dẫn này giúp tránh các lỗi phổ biến khi tạo module mới.

## 1. GenericListView Usage

### ✅ ĐÚNG - Để TypeScript tự infer types
```typescript
<GenericListView
    columns={columns}
    data={dataList || []}
    // ... other props
/>
```

### ❌ SAI - Chỉ truyền 1 type argument
```typescript
<GenericListView<MyType>  // ❌ Thiếu type argument thứ 2
    columns={columns}
    data={dataList || []}
/>
```

### ✅ ĐÚNG - Nếu cần chỉ định types, truyền đầy đủ 2 type arguments
```typescript
<GenericListView<MyType, unknown>
    columns={columns}
    data={dataList || []}
/>
```

**Lưu ý**: GenericListView đã có default type arguments (`TData = any, TValue = unknown`), nên không cần chỉ định types trong hầu hết trường hợp.

## 2. GenericFormView Props

### ❌ SAI - GenericFormView không có `isLoading` prop
```typescript
<GenericFormView
    title="Đang tải..."
    sections={[]}
    schema={formSchema}
    isLoading={true}  // ❌ Prop này không tồn tại
/>
```

### ✅ ĐÚNG - Sử dụng loading state riêng
```typescript
if (isLoading) {
    return (
        <div className="p-6 space-y-4">
            <div className="text-center py-12">
                <p className="text-muted-foreground">Đang tải...</p>
            </div>
        </div>
    )
}

return (
    <GenericFormView
        title="..."
        sections={sections}
        schema={formSchema}
        // ... other props
    />
)
```

## 3. Handler Functions Pattern

### Option 1: Inline Functions (Đơn giản, ít code hơn) - ✅ KHUYẾN NGHỊ
```typescript
<GenericListView
    onAdd={() => {
        if (onAddNew) {
            onAddNew()
        } else {
            navigate(`${config.routePath}/moi`)
        }
    }}
    onEdit={(row) => {
        if (onEdit) {
            onEdit(row.id!)
        } else {
            navigate(`${config.routePath}/${row.id}/sua`)
        }
    }}
/>
```

### Option 2: Handler Functions (Tốt cho logic phức tạp)
```typescript
const handleAdd = React.useCallback(() => {
    if (onAddNew) {
        onAddNew()
    } else {
        navigate(`${config.routePath}/moi`)
    }
}, [onAddNew, navigate])

<GenericListView
    onAdd={handleAdd}
/>
```

### ❌ SAI - Tạo handler functions nhưng không sử dụng
```typescript
const handleAdd = React.useCallback(() => {
    // ... logic
}, [dependencies])

<GenericListView
    onAdd={() => {  // ❌ Đang dùng inline function, handler không được dùng
        // ...
    }}
/>
```

**Quy tắc**: Nếu tạo handler function, phải sử dụng nó. Nếu dùng inline function, không cần tạo handler.

## 4. Unused Variables

### ❌ SAI - Destructure nhưng không sử dụng
```typescript
function MyComponent({ value, onChange, description }: Props) {
    // description không được sử dụng
    return <input value={value} onChange={onChange} />
}
```

### ✅ ĐÚNG - Xóa khỏi destructuring nếu không dùng
```typescript
function MyComponent({ value, onChange }: Props) {
    return <input value={value} onChange={onChange} />
}
```

### ✅ ĐÚNG - Nếu cần giữ trong interface (để tương thích), prefix với underscore
```typescript
function MyComponent({ value, onChange, description: _description }: Props) {
    // _description không được dùng nhưng TypeScript không báo lỗi
    return <input value={value} onChange={onChange} />
}
```

## 5. React Import

### ❌ SAI - Import React nhưng không sử dụng (khi không có JSX)
```typescript
import * as React from "react"  // ❌ Không được dùng

export function helperFunction() {
    return "value"
}
```

### ✅ ĐÚNG - Chỉ import khi cần
```typescript
// Không cần import React nếu không có JSX hoặc hooks
export function helperFunction() {
    return "value"
}

// Hoặc chỉ import hooks cần thiết
import { useCallback } from "react"
```

## 6. Type Assertions

### ❌ SAI - Type assertion không chính xác
```typescript
mapped.hang_muc = hangMuc  // ❌ Type mismatch
```

### ✅ ĐÚNG - Type assertion rõ ràng
```typescript
mapped.hang_muc = hangMuc as "Cộng" | "Trừ"
```

## 7. Function Parameters

### ❌ SAI - Parameter không được sử dụng
```typescript
format: (val: any) => {
    // val không được sử dụng
    return "some value"
}
```

### ✅ ĐÚNG - Xóa parameter nếu không dùng
```typescript
format: () => {
    return "some value"
}
```

## Checklist Khi Tạo Module Mới

- [ ] GenericListView không có type arguments (hoặc có đầy đủ 2 type arguments)
- [ ] GenericFormView không có `isLoading` prop
- [ ] Không có unused handler functions
- [ ] Không có unused variables trong destructuring
- [ ] Không có unused React imports
- [ ] Type assertions chính xác
- [ ] Function parameters đều được sử dụng

## Kiểm Tra Sau Khi Hoàn Thành

Chạy build để kiểm tra:
```bash
npm run build
```

Xem các lỗi TypeScript và sửa:
- `TS6133`: Unused variable/parameter/import
- `TS2322`: Type mismatch
- `TS2558`: Missing type arguments

