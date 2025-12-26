# Pagination Scroll to Top

## Tổng Quan

Khi user chuyển trang trong ListView (click next/previous hoặc nhập số trang), hệ thống sẽ tự động scroll to top để user thấy nội dung mới ngay lập tức.

## Implementation

### Location

Logic scroll to top được implement trong:
- `src/shared/components/data-display/generic-list-view/hooks/use-generic-list-table-state.ts`

### Cách Hoạt Động

1. **Trigger**: Khi `pagination.pageIndex` thay đổi (chuyển trang)
2. **Scroll Containers**:
   - **Layout Container**: Scroll container chính trong Layout (`.flex-1.overflow-y-auto`)
   - **Table Body**: Table body nếu có scroll riêng (`[data-testid="list-view-table-body"]`)
3. **Behavior**: Smooth scroll to top

### Code

```typescript
// Scroll to top khi pagination thay đổi (chuyển trang)
React.useEffect(() => {
    // Tìm scroll containers
    const layoutContainer = document.querySelector('.flex-1.overflow-y-auto') as HTMLElement
    const tableBody = document.querySelector('[data-testid="list-view-table-body"]') as HTMLElement

    // Scroll Layout container (main page scroll)
    if (layoutContainer) {
        layoutContainer.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Scroll table body nếu có
    if (tableBody) {
        tableBody.scrollTo({ top: 0, behavior: 'smooth' })
    }
}, [pagination.pageIndex]) // Chỉ scroll khi pageIndex thay đổi
```

## Khi Nào Scroll

✅ **Scroll khi:**
- Click "Next Page" button
- Click "Previous Page" button
- Click "First Page" button
- Click "Last Page" button
- Nhập số trang và blur (Enter hoặc click outside)

❌ **Không scroll khi:**
- Chỉ thay đổi page size (số items per page)
- Focus/blur input mà không thay đổi trang
- Chỉ thay đổi filters/search/sort

## Tích Hợp với Scroll Restoration

Pagination scroll to top hoạt động độc lập với scroll restoration system:
- **Scroll Restoration**: Xử lý scroll khi chuyển route (ListView → DetailView → ListView)
- **Pagination Scroll**: Xử lý scroll khi chuyển trang trong cùng ListView

## Customization

Nếu muốn tắt smooth scroll hoặc thay đổi behavior:

```typescript
// Trong use-generic-list-table-state.ts
layoutContainer.scrollTo({ top: 0, behavior: 'auto' }) // Instant scroll
```

## Testing

Để test pagination scroll:
1. Mở ListView (ví dụ: Danh sách nhân sự)
2. Scroll xuống giữa trang
3. Click "Next Page" hoặc nhập số trang khác
4. ✅ Page sẽ scroll to top với smooth animation

