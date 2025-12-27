# Đề Xuất Cải Thiện Format Rules

## 📋 Tổng Quan

Tài liệu này đề xuất các cải thiện cho format rules trong ứng dụng, đặc biệt tập trung vào:
- Màu sắc cho các enum values (mối quan hệ, trạng thái, v.v.)
- Toggle button groups cho selection
- Consistency trong UI/UX

## ✅ Đã Hoàn Thành

### 1. Toggle Button Group cho Mối Quan Hệ
- ✅ Tạo component `ToggleButtonFormField` 
- ✅ Tích hợp vào `FormFieldRenderer`
- ✅ Áp dụng màu sắc từ enum color registry
- ✅ Cập nhật form người thân để sử dụng toggle button

### 2. Màu Sắc cho Mối Quan Hệ
- ✅ Cập nhật enum color registry với đầy đủ các giá trị:
  - Cha/Bố: `bg-blue-50 text-blue-700 border-blue-200`
  - Mẹ: `bg-pink-50 text-pink-700 border-pink-200`
  - Vợ/Chồng: `bg-purple-50 text-purple-700 border-purple-200`
  - Con: `bg-emerald-50 text-emerald-700 border-emerald-200`
  - Anh/Chị/Em: `bg-amber-50 text-amber-700 border-amber-200`
  - Khác: `bg-slate-50 text-slate-700 border-slate-200`
- ✅ Hiển thị màu sắc trong list view (columns)
- ✅ Hiển thị màu sắc trong toggle buttons

## 🎯 Format Rules Đề Xuất

### 1. Enum Color Rules

#### Rule 1.1: Consistent Color Mapping
```typescript
// ✅ DO: Sử dụng enum color registry
const colorClass = getEnumBadgeClass("moi_quan_he", value)

// ❌ DON'T: Hardcode colors
const colorClass = "bg-blue-50 text-blue-700"
```

#### Rule 1.2: Color Semantics
- **Blue**: Cha/Bố (masculine, authority)
- **Pink**: Mẹ (feminine, nurturing)
- **Purple**: Vợ/Chồng (partnership, relationship)
- **Emerald/Green**: Con, Chính thức, Đúng (positive, growth)
- **Amber/Yellow**: Anh/Chị/Em, Thử việc (warning, intermediate)
- **Red**: Nghỉ việc, Sai (negative, danger)
- **Slate/Gray**: Khác, Tạm nghỉ, Chưa chấm (neutral, undefined)

#### Rule 1.3: Badge Format
```typescript
// Standard badge format
<Badge variant="outline" className={colorClass}>
  {value}
</Badge>
```

### 2. Toggle Button Rules

#### Rule 2.1: When to Use Toggle Buttons
- ✅ Use for: Enum values với ít options (< 8), cần visual feedback
- ❌ Don't use for: Nhiều options (> 8), cần search/filter

#### Rule 2.2: Toggle Button Styling
```typescript
// Selected state: Apply enum color
isSelected && colorClass

// Unselected state: Subtle hover
!isSelected && "hover:bg-muted/50"
```

#### Rule 2.3: Layout
- Use `flex-wrap` để responsive
- Gap: `gap-2` (8px)
- Padding: `px-4 py-2` cho buttons
- Full width container: `w-full`

### 3. Form Field Type Rules

#### Rule 3.1: Field Type Selection
- **text**: Text input đơn giản
- **number**: Số
- **email**: Email với validation
- **date**: Date picker
- **select**: Dropdown với ít options (< 5), không cần search
- **combobox**: Dropdown với nhiều options, cần search
- **toggle**: Enum values với ít options, cần visual feedback
- **textarea**: Text dài
- **image**: Upload ảnh
- **custom**: Component tùy chỉnh

#### Rule 3.2: Required Field Indicator
- Dấu sao đỏ (*) ngay sau tên field
- Format: `<Label>Field Name <span className="text-destructive">*</span></Label>`

### 4. Color Consistency Rules

#### Rule 4.1: Use Enum Registry
```typescript
// ✅ DO: Centralized registry
registerEnumColors("moi_quan_he", {
  "Cha": "bg-blue-50 text-blue-700 border-blue-200",
  // ...
})

// ❌ DON'T: Scattered color definitions
const colors = { "Cha": "bg-blue-50..." }
```

#### Rule 4.2: Alias Support
```typescript
// Support multiple values for same color
"Cha": "bg-blue-50...",
"Bố": "bg-blue-50...", // Alias
```

### 5. List View Format Rules

#### Rule 5.1: Enum Column Display
```typescript
cell: ({ row }) => {
  const value = row.getValue("field")
  const colorClass = getEnumBadgeClass("field_key", value)
  return (
    <Badge variant="outline" className={colorClass}>
      {value}
    </Badge>
  )
}
```

#### Rule 5.2: Empty Value Handling
```typescript
if (!value) return <span className="text-muted-foreground">-</span>
```

## 📝 Implementation Checklist

### Phase 1: Core Components ✅
- [x] ToggleButtonFormField component
- [x] Enum color registry updates
- [x] FormFieldRenderer integration
- [x] FieldType type update

### Phase 2: Module Updates ✅
- [x] Người thân form: Toggle button cho mối quan hệ
- [x] Người thân columns: Badge với màu sắc
- [x] Enum color registry: Đầy đủ aliases

### Phase 3: Documentation
- [x] Format rules documentation
- [ ] Component usage examples
- [ ] Migration guide cho modules khác

### Phase 4: Apply to Other Modules
- [ ] Nhân sự: Tình trạng, Giới tính, Hôn nhân
- [ ] Công việc: Trạng thái, Kết quả
- [ ] Other enum fields

## 🔄 Migration Guide

### Migrating from Select to Toggle

**Before:**
```typescript
{
  name: "moi_quan_he",
  type: "select",
  options: [...]
}
```

**After:**
```typescript
{
  name: "moi_quan_he",
  type: "toggle",
  options: [...]
}
```

### Adding Colors to Enum

1. Update enum color registry:
```typescript
registerEnumColors("field_key", {
  "Value1": "bg-color-50 text-color-700 border-color-200",
  // ...
})
```

2. Use in components:
```typescript
const colorClass = getEnumBadgeClass("field_key", value)
```

## 🎨 Color Palette Reference

### Primary Colors
- **Blue**: `bg-blue-50 text-blue-700 border-blue-200`
- **Pink**: `bg-pink-50 text-pink-700 border-pink-200`
- **Purple**: `bg-purple-50 text-purple-700 border-purple-200`
- **Emerald**: `bg-emerald-50 text-emerald-700 border-emerald-200`
- **Amber**: `bg-amber-50 text-amber-700 border-amber-200`
- **Red**: `bg-red-50 text-red-700 border-red-200`
- **Slate**: `bg-slate-50 text-slate-700 border-slate-200`

### Usage Guidelines
- Light background (50): For badges và selected states
- Dark text (700): For readability
- Border (200): For subtle definition

## 📊 Best Practices

1. **Consistency**: Luôn sử dụng enum color registry
2. **Accessibility**: Đảm bảo contrast ratio đủ
3. **Responsive**: Toggle buttons wrap trên mobile
4. **Performance**: Memoize color calculations
5. **Type Safety**: Sử dụng TypeScript cho field types

## 🚀 Next Steps

1. Apply toggle buttons cho các enum fields khác
2. Create reusable toggle button components cho common enums
3. Add unit tests cho color registry
4. Create Storybook stories cho components
5. Document trong component library

