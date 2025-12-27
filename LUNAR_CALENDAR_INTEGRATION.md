# Hướng Dẫn Tích Hợp Thư Viện Âm Lịch Việt Nam

## 📚 Các Thư Viện Khuyến Nghị

### 1. @nghiavuive/lunar_date_vi (Khuyến nghị)

**Cài đặt:**
```bash
npm install @nghiavuive/lunar_date_vi
```

**Sử dụng:**
```typescript
import { SolarDate } from '@nghiavuive/lunar_date_vi'

// Chuyển đổi dương lịch sang âm lịch
const solarDate = new SolarDate(new Date(2025, 0, 15)) // 15/01/2025
const lunarDate = solarDate.toLunarDate()

console.log(lunarDate.day)    // Ngày âm
console.log(lunarDate.month)  // Tháng âm
console.log(lunarDate.year)   // Năm âm
```

**Ưu điểm:**
- ✅ Dễ sử dụng
- ✅ API đơn giản
- ✅ Hỗ trợ tốt cho Việt Nam
- ✅ Dựa trên thuật toán của Hồ Ngọc Đức

**Link:** https://www.npmjs.com/package/@nghiavuive/lunar_date_vi

---

### 2. lunar-date (của NghiaCaNgao)

**Cài đặt:**
```bash
npm install lunar-date
```

**Sử dụng:**
```typescript
import { solarToLunar } from 'lunar-date'

const lunar = solarToLunar(2025, 1, 15)
console.log(lunar.day, lunar.month, lunar.year)
```

**Link:** https://github.com/NghiaCaNgao/LunarDate

---

### 3. vietnamese-lunar-date

**Cài đặt:**
```bash
npm install vietnamese-lunar-date
```

---

## 🔧 Cách Tích Hợp Vào DateTimeCalendarPopover

### Bước 1: Cài đặt thư viện

```bash
npm install @nghiavuive/lunar_date_vi
```

### Bước 2: Cập nhật `src/shared/utils/lunar-calendar.ts`

```typescript
import { SolarDate } from '@nghiavuive/lunar_date_vi'

export function getLunarDateInfo(date: Date): { day: number; month: number } | null {
  try {
    const solarDate = new SolarDate(date)
    const lunar = solarDate.toLunarDate()
    return {
      day: lunar.day,
      month: lunar.month,
    }
  } catch (error) {
    console.error('Error converting to lunar date:', error)
    return null
  }
}
```

### Bước 3: Cập nhật CustomDay Component

Sau khi có `getLunarDateInfo` hoạt động, bạn có thể:

1. **Bật Switch "Hiện âm lịch"** - bỏ `disabled`
2. **Hiển thị âm lịch trong day cell** - thêm vào CustomDay component
3. **Highlight lễ truyền thống** - dựa trên ngày âm lịch

### Bước 4: Ví dụ CustomDay với âm lịch

```typescript
function CustomDay({ date, displayMonth, showLunar, ...props }) {
  const lunarInfo = showLunar ? getLunarDateInfo(date) : null
  const holiday = isHoliday(
    date.getMonth() + 1,
    date.getDate(),
    lunarInfo?.month,
    lunarInfo?.day
  )

  return (
    <button {...props}>
      {/* Dương lịch */}
      <span className="text-sm font-medium">{date.getDate()}</span>
      
      {/* Âm lịch */}
      {showLunar && lunarInfo && (
        <span className="text-[9px] text-muted-foreground">
          {lunarInfo.day}/{lunarInfo.month}
        </span>
      )}
      
      {/* Dot indicator cho ngày lễ */}
      {holiday && (
        <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-red-600" />
      )}
    </button>
  )
}
```

## 📝 Lưu Ý

1. **Kiểm tra tính chính xác**: Test kỹ với các ngày lễ quan trọng (Tết, Rằm)
2. **Performance**: Cache kết quả chuyển đổi nếu cần
3. **Error handling**: Luôn có try-catch khi chuyển đổi
4. **Testing**: Test với nhiều năm khác nhau để đảm bảo tính chính xác

## 🎯 Kế Hoạch Triển Khai

1. ✅ Cài đặt thư viện
2. ✅ Cập nhật `lunar-calendar.ts`
3. ✅ Test chuyển đổi với các ngày quan trọng
4. ✅ Cập nhật CustomDay component
5. ✅ Bật Switch "Hiện âm lịch"
6. ✅ Test hiển thị lễ truyền thống (theo âm lịch)

