# Backend Rules - Quy Tắc Backend

## 🗄️ Supabase Patterns

### Supabase Client
- **Client setup**: Supabase client được setup trong `src/lib/supabase.ts`
- **Single instance**: Sử dụng singleton pattern cho Supabase client
- **Environment variables**: `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`

### Database Patterns
- **PostgreSQL**: Supabase sử dụng PostgreSQL
- **Row Level Security (RLS)**: Đảm bảo RLS policies được set up đúng
- **Schema naming**: Follow PostgreSQL naming conventions
- **Migrations**: Sử dụng Supabase migrations cho schema changes

### Query Patterns
- **TypeScript types**: Generate types từ Supabase schema khi có thể
- **Error handling**: Proper error handling cho database queries
- **Transactions**: Sử dụng transactions khi cần atomic operations

## 🔌 API Structure

### Service Layer
- **Service files**: API calls được tổ chức trong service files
- **Location**: Services ở `src/services/` hoặc trong feature folders
- **Naming**: `[resource]-service.ts` (ví dụ: `user-service.ts`)

### API Patterns
```typescript
// Service structure example
export async function getUserById(id: string) {
  // implementation
}

export async function createUser(data: UserCreateInput) {
  // implementation
}

export async function updateUser(id: string, data: UserUpdateInput) {
  // implementation
}

export async function deleteUser(id: string) {
  // implementation
}
```

### Error Handling
- **Try-catch**: Wrap API calls trong try-catch
- **Error types**: Define error types cho different error scenarios
- **User-friendly messages**: Convert technical errors thành user-friendly messages
- **Logging**: Log errors để debug (không log sensitive data)

## 🔐 Authentication & Authorization

### Supabase Auth
- **Auth methods**: Sử dụng Supabase Auth cho authentication
- **Session management**: Supabase handle session, không cần custom logic
- **Auth state**: Sử dụng Zustand store (`auth-store`) để manage auth state

### Authorization
- **RLS policies**: Database-level authorization qua RLS
- **Client-side checks**: UI-level checks cho UX (không phải security)
- **Server-side validation**: RLS là source of truth cho authorization

## 📊 Database Conventions

### Table Naming
- **Singular nouns**: Table names dùng singular (`user`, `product`, không phải `users`, `products`)
- **Snake_case**: Column names dùng snake_case (`user_name`, `created_at`)
- **Primary keys**: `id` (UUID hoặc serial)
- **Timestamps**: `created_at`, `updated_at` (timestamptz)

### Schema Patterns
- **Soft deletes**: Có thể sử dụng `deleted_at` thay vì hard delete
- **Audit fields**: `created_at`, `updated_at`, `created_by`, `updated_by` khi cần
- **Foreign keys**: Proper foreign key constraints
- **Indexes**: Indexes cho frequently queried columns

### Data Types
- **UUIDs**: Cho primary keys khi cần distributed systems
- **Text vs VARCHAR**: Sử dụng `text` cho flexibility
- **JSONB**: Cho flexible schema khi cần
- **Enums**: PostgreSQL enums cho fixed sets of values

## 🔄 React Query Integration

### Query Hooks
- **Custom hooks**: Tạo custom hooks cho data fetching
- **Location**: Query hooks trong feature folders hoặc `src/lib/react-query/`
- **Naming**: `use[Resource]` cho queries, `use[Action][Resource]` cho mutations

### Mutation Patterns
```typescript
// Mutation hook example
export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UserCreateInput) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

### Cache Management
- **Query keys**: Consistent query key structure
- **Invalidation**: Invalidate related queries sau mutations
- **Optimistic updates**: Khi phù hợp cho better UX

## 📤 File Handling

### Cloudinary Integration
- **Image uploads**: Cloudinary cho image storage (nếu có)
- **Configuration**: Config trong `src/lib/cloudinary.ts`
- **Upload patterns**: Consistent upload patterns

### File Operations
- **Excel import/export**: ExcelJS cho Excel operations
- **PDF generation**: jsPDF cho PDF generation
- **File validation**: Validate file types, sizes trước khi upload

## 🔍 Search & Filtering

### Database Queries
- **Full-text search**: PostgreSQL full-text search khi cần
- **Filtering**: Build dynamic queries dựa trên filters
- **Pagination**: Implement pagination cho large datasets

### Client-side Filtering
- **Small datasets**: Client-side filtering cho small datasets
- **Large datasets**: Server-side filtering cho large datasets
- **Debouncing**: Debounce search inputs để tránh excessive queries

## 🚨 Error Handling

### Error Types
- **Network errors**: Handle network failures gracefully
- **Validation errors**: Show field-specific validation errors
- **Permission errors**: Clear messages cho permission issues
- **Generic errors**: Fallback error messages

### Error Display
- **Toast notifications**: Sử dụng Sonner cho error notifications
- **Form errors**: Field-level errors trong forms
- **Page errors**: Error boundaries cho page-level errors

## 📈 Performance

### Query Optimization
- **Select only needed fields**: Không select `*` nếu không cần
- **Efficient joins**: Optimize joins để tránh N+1 queries
- **Pagination**: Luôn paginate large datasets
- **Caching**: Leverage React Query caching

### Data Fetching
- **Batch requests**: Batch multiple requests khi có thể
- **Parallel queries**: Fetch independent data in parallel
- **Prefetching**: Prefetch data khi có thể anticipate needs

