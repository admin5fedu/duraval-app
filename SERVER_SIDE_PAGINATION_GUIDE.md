# Hướng dẫn áp dụng Server-side Pagination & Search

## Tổng quan

Tài liệu này hướng dẫn cách áp dụng Server-side Pagination và Search cho các module trong app.

## Các tính năng đã triển khai

1. **Server-side Pagination**: Dữ liệu được phân trang trên server, không load toàn bộ
2. **Server-side Search**: Tìm kiếm được thực hiện trên server với toàn bộ database
3. **URL Sync**: Đồng bộ page, pageSize, search, và filters vào URL
4. **Go Back mượt mà**: Giữ lại trạng thái khi navigate giữa List/Detail/Form

## Các bước triển khai

### Bước 1: Cập nhật API Service

Đảm bảo API service có các methods sau:

```typescript
// services/xxx.api.ts
export class XXXAPI {
  // 1. getAll() - Đã có sẵn (dùng fetchAllRecursive)
  static async getAll(): Promise<XXX[]> {
    const query = supabase
      .from(TABLE_NAME)
      .select("*")
      .order("tg_tao", { ascending: false })
    return fetchAllRecursive<XXX>(query)
  }

  // 2. getPaginated() - Thêm method này
  static async getPaginated(page: number = 1, pageSize: number = 50): Promise<PaginationResult<XXX>> {
    const query = supabase
      .from(TABLE_NAME)
      .select("*", { count: "exact" }) // ⚠️ QUAN TRỌNG: Phải có count: "exact"
      .order("tg_tao", { ascending: false })
    return fetchPaginated<XXX>(query, page, pageSize)
  }

  // 3. search() - Thêm method này
  static async search(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginationResult<XXX>> {
    const query = supabase
      .from(TABLE_NAME)
      .select("*", { count: "exact" })
      .order("ten_xxx", { ascending: true })
    
    // Search trên nhiều fields
    return searchRecords<XXX>(
      query, 
      searchTerm, 
      ["ten_xxx", "ma_xxx"], // Thay bằng các fields cần search
      page, 
      pageSize
    )
  }
}
```

### Bước 2: Cập nhật Hooks

Thêm các hooks sau vào `hooks/use-xxx.ts`:

```typescript
// hooks/use-xxx.ts
import { useQuery } from "@tanstack/react-query"
import type { PaginationResult } from "@/lib/supabase-utils"

// 1. Hook cho pagination
export const useXXXPaginated = (page: number = 1, pageSize: number = 50) => {
  return useQuery<PaginationResult<XXX>, Error>({
    queryKey: [...xxxQueryKeys.all, 'paginated', page, pageSize],
    queryFn: () => XXXAPI.getPaginated(page, pageSize),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

// 2. Hook cho search
export const useXXXSearch = (
  searchTerm: string,
  page: number = 1,
  pageSize: number = 20,
  enabled: boolean = true
) => {
  return useQuery<PaginationResult<XXX>, Error>({
    queryKey: [...xxxQueryKeys.all, 'search', searchTerm, page, pageSize],
    queryFn: () => XXXAPI.search(searchTerm, page, pageSize),
    enabled: enabled && searchTerm.trim().length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
```

### Bước 3: Cập nhật List View Component

Cập nhật `components/xxx-list-view.tsx`:

```typescript
import { useSearchParams } from "react-router-dom"
import { useXXXPaginated, useXXXSearch } from "../hooks"

export function XXXListView() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // 1. Lấy params từ URL
  const page = React.useMemo(() => {
    const pageParam = searchParams.get('page')
    return pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1
  }, [searchParams])
  
  const pageSize = React.useMemo(() => {
    const pageSizeParam = searchParams.get('pageSize')
    return pageSizeParam ? Math.max(10, parseInt(pageSizeParam, 10)) : 50
  }, [searchParams])
  
  const searchTerm = React.useMemo(() => {
    return searchParams.get('search') || ''
  }, [searchParams])
  
  // 2. Sử dụng hooks
  const paginatedQuery = useXXXPaginated(page, pageSize)
  const searchQuery = useXXXSearch(searchTerm, page, pageSize, !!searchTerm && searchTerm.trim().length > 0)
  
  const isSearchMode = !!searchTerm && searchTerm.trim().length > 0
  const activeQuery = isSearchMode ? searchQuery : paginatedQuery
  const { data: paginatedResult, isLoading, isError, refetch } = activeQuery
  
  const dataList = paginatedResult?.data || []
  
  // 3. Override handleSearchChange để sync URL
  const handleSearchChange = React.useCallback((newSearch: string) => {
    const newSearchParams = new URLSearchParams(searchParams)
    if (newSearch.trim()) {
      newSearchParams.set('search', newSearch.trim())
      newSearchParams.set('page', '1') // Reset về trang 1 khi search
    } else {
      newSearchParams.delete('search')
    }
    setSearchParams(newSearchParams, { replace: true })
  }, [searchParams, setSearchParams])
  
  // 4. Override handleFiltersChange để sync URL
  const handleFiltersChangeWithURL = React.useCallback((filters: any) => {
    handleFiltersChange(filters)
    const newSearchParams = new URLSearchParams(searchParams)
    if (filters.length > 0) {
      newSearchParams.set('filters', JSON.stringify(filters))
    } else {
      newSearchParams.delete('filters')
    }
    setSearchParams(newSearchParams, { replace: true })
  }, [searchParams, setSearchParams, handleFiltersChange])
  
  // 5. Lấy filters từ URL
  const initialFiltersFromURL = React.useMemo(() => {
    const filtersParam = searchParams.get('filters')
    if (filtersParam) {
      try {
        return JSON.parse(filtersParam)
      } catch {
        return initialFilters
      }
    }
    return initialFilters
  }, [searchParams, initialFilters])
  
  // 6. Handle pagination change
  const handlePaginationChange = React.useCallback((newPage: number, newPageSize: number) => {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('page', newPage.toString())
    newSearchParams.set('pageSize', newPageSize.toString())
    setSearchParams(newSearchParams, { replace: true })
  }, [searchParams, setSearchParams])
  
  // 7. Handle view click - preserve URL params
  const handleViewClick = (id: number) => {
    const queryParams = new URLSearchParams()
    queryParams.set('page', searchParams.get('page') || '1')
    queryParams.set('pageSize', searchParams.get('pageSize') || '50')
    const search = searchParams.get('search')
    const filters = searchParams.get('filters')
    if (search) queryParams.set('search', search)
    if (filters) queryParams.set('filters', filters)
    navigate(`${config.routePath}/${id}?${queryParams.toString()}`)
  }
  
  return (
    <GenericListView
      data={dataList}
      columns={columns}
      initialFilters={initialFiltersFromURL}
      initialSearch={searchTerm}
      onFiltersChange={handleFiltersChangeWithURL}
      onSearchChange={handleSearchChange}
      serverSidePagination={{
        enabled: true,
        pageCount: paginatedResult?.totalPages || 0,
        total: paginatedResult?.total || 0,
        isLoading: isLoading,
        onPaginationChange: handlePaginationChange,
      }}
      serverSideSearch={{
        enabled: true,
        onSearchChange: handleSearchChange,
        debounceMs: 300,
      }}
      // ... other props
    />
  )
}
```

### Bước 4: Cập nhật Detail Route

Cập nhật `routes/xxx-detail-route.tsx`:

```typescript
export default function XXXDetailRoute() {
  const [searchParams] = useSearchParams()
  
  // Preserve all URL params
  const buildReturnQuery = () => {
    const params = new URLSearchParams()
    params.set('page', searchParams.get('page') || '1')
    params.set('pageSize', searchParams.get('pageSize') || '50')
    const search = searchParams.get('search')
    const filters = searchParams.get('filters')
    if (search) params.set('search', search)
    if (filters) params.set('filters', filters)
    return `?${params.toString()}`
  }

  const handleBack = () => {
    navigate(`${config.routePath}${buildReturnQuery()}`)
  }
  
  // ... rest of component
}
```

### Bước 5: Cập nhật Form Route

Cập nhật `routes/xxx-form-route.tsx` tương tự Detail Route.

## Checklist

- [ ] API service có `getPaginated()` và `search()` methods
- [ ] Hooks có `useXXXPaginated()` và `useXXXSearch()`
- [ ] List View sync search và filters vào URL
- [ ] List View sử dụng server-side pagination và search
- [ ] Detail Route giữ lại URL params khi back
- [ ] Form Route giữ lại URL params khi complete/cancel

## Lưu ý quan trọng

1. **count: "exact"**: Phải có trong `select()` để đảm bảo count chính xác
2. **Reset page khi search**: Khi user search, reset về page 1
3. **URL encoding**: Sử dụng `URLSearchParams` để encode/decode đúng cách
4. **Error handling**: Xử lý lỗi khi parse JSON từ URL

## Ví dụ đã triển khai

Xem các file sau để tham khảo:
- `src/features/he-thong/khac/tinh-thanh-truoc-sat-nhap/tinh-thanh-tsn/`
- `src/features/he-thong/khac/tinh-thanh-sau-sat-nhap/tinh-thanh-ssn/`

