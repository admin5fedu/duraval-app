# Phân Tích Cấu Trúc Table - GenericListView

## 🔍 Vấn Đề Chính

**Header và Body là 2 TABLE RIÊNG BIỆT**, không phải cùng một table!

## 📊 Cấu Trúc Hiện Tại

### 1. Header Table (dòng 105-165 trong `generic-list-table-section.tsx`)
```tsx
<div ref={headerScrollRef} className="overflow-x-auto ...">
  <Table containerClassName="..." style={{ minWidth: 'max-content' }}>
    <TableHeader>
      {headerGroups.map(...headerGroup.headers.map(...))}
        <StickyTableHeaderCell>
          {flexRender(header.column.columnDef.header, ...)}
        </StickyTableHeaderCell>
    </TableHeader>
  </Table>
</div>
```

### 2. Body Table (dòng 181-331)
```tsx
<div ref={bodyScrollRef} className="overflow-y-auto overflow-x-auto ...">
  <Table containerClassName="..." style={{ minWidth: 'max-content' }}>
    <TableBody>
      {filteredRows.map(...row.getVisibleCells().map(...))}
        <StickyTableCell>
          {flexRender(cell.column.columnDef.cell, ...)}
        </StickyTableCell>
    </TableBody>
  </Table>
</div>
```

## ⚠️ Vấn Đề

1. **2 Table riêng biệt** → Không có cơ chế tự động align columns
2. **Scroll synchronization** (dòng 62-87) chỉ đồng bộ scroll position, KHÔNG đảm bảo column alignment
3. **Width calculation**:
   - Header: `header.getSize()` (dòng 134)
   - Body: `cell.column.getSize()` (dòng 260)
   - Cả 2 đều dùng cùng column definition, nhưng vì là 2 table riêng nên có thể có padding/border khác nhau

4. **Text alignment trong header**:
   - Tôi đã wrap `SortableHeader` trong `<div className="text-right w-full">`
   - NHƯNG `SortableHeader` là một `Button` component, nên `text-right` trên div wrapper có thể không ảnh hưởng đến Button bên trong

## ✅ Giải Pháp Đề Xuất

### Option 1: Dùng chung một Table (Recommended)
- Gộp Header và Body vào cùng một `<Table>` element
- Header sticky với `position: sticky; top: 0`
- Body scroll bình thường
- Đảm bảo columns tự động align

### Option 2: Sửa Text Alignment trong Header
- Thêm `text-right` trực tiếp vào `StickyTableHeaderCell` style hoặc className
- Hoặc modify `SortableHeader` để nhận `className` prop và apply `text-right`

### Option 3: Đồng bộ Width chính xác hơn
- Tính toán width dựa trên thực tế rendered width
- Sử dụng ResizeObserver để sync width giữa header và body columns

## 📝 Code Hiện Tại Của Mức Đăng Ký

File: `muc-dang-ky-columns.tsx`

1. **Sticky columns**: ✅ Đã thêm đúng
   - `ma_hang`: stickyLeft: true, offset: 40
   - `ten_hang`: stickyLeft: true, offset: 160

2. **Text alignment cho doanh số**:
   - Body cells: ✅ `text-right` (đã có từ trước)
   - Header: ❌ Wrap `SortableHeader` trong div text-right (có thể không hoạt động vì Button component)

## 🎯 Khuyến Nghị

**Ngay lập tức**: Sửa text alignment trong header bằng cách:
- Thêm `textAlign: 'right'` vào style của `StickyTableHeaderCell` khi render header cho các cột doanh số
- Hoặc modify header render function để return element với className `text-right`

**Dài hạn**: Xem xét refactor để dùng chung một Table cho Header và Body

