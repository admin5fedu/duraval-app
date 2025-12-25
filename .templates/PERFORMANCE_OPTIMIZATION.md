# Performance Optimization Guide

## Tổng Quan

Tài liệu này mô tả các kỹ thuật tối ưu performance đã được áp dụng trong ứng dụng.

## 1. Code Splitting & Lazy Loading

### Routes Lazy Loading

Tất cả routes được lazy load để giảm initial bundle size:

```typescript
// src/routes.tsx
const DanhSachNhanSuModule = lazy(() => import('@/features/he-thong/nhan-su/danh-sach-nhan-su/index'))
```

### Dynamic Imports cho Dialogs

Các dialog components được import động khi cần:

```typescript
const ExportDialog = lazy(() => import('@/shared/components/data-display/export/export-dialog'))
```

## 2. Memoization

### React.memo cho Components

Các components lớn được memoize để tránh re-render không cần thiết:

```typescript
export const GenericListView = memo(GenericListViewComponent)
```

### useMemo cho Computed Values

Sử dụng `useMemo` cho các giá trị tính toán:

```typescript
const filteredRows = useMemo(() => rowModel.rows, [rowModel.rows])
const availableColumns = useMemo(() => {
  return columns.filter(/* ... */)
}, [columns, getColumnTitle])
```

### useCallback cho Event Handlers

Memoize callbacks để tránh re-render children:

```typescript
const handleRowClick = useCallback((row: TData) => {
  onRowClick?.(row)
}, [onRowClick])
```

## 3. Virtualization

### VirtualizedTableBody

Sử dụng `@tanstack/react-virtual` cho datasets lớn (>100 rows):

```typescript
{enableVirtualization && filteredRows.length > 100 ? (
  <VirtualizedTableBody
    table={table}
    virtualRowHeight={60}
    // ...
  />
) : (
  <TableBody>
    {/* Normal rendering */}
  </TableBody>
)}
```

## 4. Deferred Values

Sử dụng `useDeferredValue` cho search input để tránh blocking UI:

```typescript
const [globalFilter, setGlobalFilter] = useState("")
const deferredGlobalFilter = useDeferredValue(globalFilter)
```

## 5. Debouncing

### Search Input Debouncing

Debounce search queries để giảm số lần filter:

```typescript
React.useEffect(() => {
  const timer = setTimeout(() => {
    onSearchChange?.(globalFilter)
  }, 300)
  return () => clearTimeout(timer)
}, [globalFilter, onSearchChange])
```

### Filter Debouncing

Debounce column filters:

```typescript
React.useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedColumnFilters(columnFilters)
  }, 150)
  return () => clearTimeout(timer)
}, [columnFilters])
```

## 6. Optimistic Updates

Sử dụng optimistic updates cho mutations:

```typescript
const mutation = useMutation({
  mutationFn: updateData,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey })
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(queryKey)
    
    // Optimistically update
    queryClient.setQueryData(queryKey, newData)
    
    return { previous }
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(queryKey, context.previous)
  },
})
```

## 7. Query Optimization

### Select Specific Columns

Chỉ select columns cần thiết từ database:

```typescript
const { data } = useQuery({
  queryKey: ['nhan-su'],
  queryFn: () => supabase
    .from('var_nhan_su')
    .select('id, ho_ten, email_cong_ty') // Chỉ select cần thiết
    .order('id', { ascending: false })
})
```

### Pagination

Sử dụng pagination cho large datasets:

```typescript
const { data } = useQuery({
  queryKey: ['nhan-su', page],
  queryFn: () => supabase
    .from('var_nhan_su')
    .select('*')
    .range(page * pageSize, (page + 1) * pageSize - 1)
})
```

## 8. Bundle Size Optimization

### Tree Shaking

Đảm bảo imports được tree-shake:

```typescript
// ✅ Good - tree-shakeable
import { Button } from '@/components/ui/button'

// ❌ Bad - imports entire library
import * as UI from '@/components/ui'
```

### Dynamic Imports

Sử dụng dynamic imports cho heavy dependencies:

```typescript
const ExcelJS = await import('exceljs')
const jsPDF = await import('jspdf')
```

## 9. Image Optimization

### Lazy Loading Images

```typescript
<img
  src={imageUrl}
  loading="lazy"
  alt={alt}
/>
```

### Optimized Avatar Component

Sử dụng `ZoomableAvatar` với lazy loading:

```typescript
<ZoomableAvatar
  src={avatarUrl}
  alt={name}
  className="h-10 w-10"
  fallback={name?.charAt(0)}
/>
```

## 10. Form Optimization

### Validation Mode

Sử dụng `onBlur` mode thay vì `onChange`:

```typescript
const form = useForm({
  mode: "onBlur", // Validate on blur instead of every keystroke
  reValidateMode: "onChange", // Re-validate on change after first submit
})
```

### Conditional Updates

Chỉ update form values khi thực sự thay đổi:

```typescript
useEffect(() => {
  if (defaultValues) {
    Object.entries(defaultValues).forEach(([key, value]) => {
      const currentValue = form.getValues(key)
      if (currentValue?.toString() !== value?.toString()) {
        form.setValue(key, value, { shouldValidate: false })
      }
    })
  }
}, [defaultValues, form])
```

## Checklist Tối Ưu

- [ ] Routes được lazy load
- [ ] Components lớn được memoize
- [ ] Callbacks được memoize với useCallback
- [ ] Computed values sử dụng useMemo
- [ ] Virtualization cho datasets >100 rows
- [ ] Search input được debounce
- [ ] Filters được debounce
- [ ] Queries chỉ select columns cần thiết
- [ ] Images được lazy load
- [ ] Form validation mode = onBlur
- [ ] Dynamic imports cho heavy dependencies

## Monitoring Performance

Sử dụng React DevTools Profiler để monitor:
- Component render times
- Re-render frequency
- Bundle size

## Best Practices

1. **Measure First**: Sử dụng Profiler để xác định bottlenecks
2. **Optimize Incrementally**: Tối ưu từng phần một
3. **Test After**: Đảm bảo tối ưu không break functionality
4. **Document Changes**: Ghi lại các tối ưu đã thực hiện

