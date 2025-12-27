/**
 * Vietnamese Holidays & Traditional Events
 * Quản lý danh sách ngày lễ quốc gia và lễ truyền thống Việt Nam
 */

export type HolidayType = 'national' | 'traditional' | 'religious'

export interface Holiday {
  name: string
  type: HolidayType
  date: {
    solar?: {
      month: number // 1-12
      day: number // 1-31
    }
    lunar?: {
      month: number // 1-12
      day: number // 1-30
    }
  }
  icon?: string
  color?: string
}

/**
 * Ngày lễ quốc gia (cố định theo dương lịch)
 */
const nationalHolidays: Holiday[] = [
  {
    name: 'Tết Dương Lịch',
    type: 'national',
    date: { solar: { month: 1, day: 1 } },
    icon: '🎉',
    color: 'text-red-600',
  },
  {
    name: 'Ngày Giải Phóng Miền Nam',
    type: 'national',
    date: { solar: { month: 4, day: 30 } },
    icon: '🇻🇳',
    color: 'text-red-600',
  },
  {
    name: 'Ngày Quốc Tế Lao Động',
    type: 'national',
    date: { solar: { month: 5, day: 1 } },
    icon: '👷',
    color: 'text-red-600',
  },
  {
    name: 'Quốc Khánh',
    type: 'national',
    date: { solar: { month: 9, day: 2 } },
    icon: '🇻🇳',
    color: 'text-red-600',
  },
]

/**
 * Lễ truyền thống (theo âm lịch)
 */
const traditionalHolidays: Holiday[] = [
  {
    name: 'Tết Nguyên Đán',
    type: 'traditional',
    date: { lunar: { month: 1, day: 1 } },
    icon: '🧧',
    color: 'text-red-500',
  },
  {
    name: 'Tết Nguyên Tiêu (Rằm tháng Giêng)',
    type: 'traditional',
    date: { lunar: { month: 1, day: 15 } },
    icon: '🏮',
    color: 'text-orange-500',
  },
  {
    name: 'Giỗ Tổ Hùng Vương',
    type: 'traditional',
    date: { lunar: { month: 3, day: 10 } },
    icon: '🛕',
    color: 'text-amber-600',
  },
  {
    name: 'Lễ Phật Đản (Rằm tháng 4)',
    type: 'religious',
    date: { lunar: { month: 4, day: 15 } },
    icon: '🪷',
    color: 'text-purple-500',
  },
  {
    name: 'Tết Đoan Ngọ (Mùng 5 tháng 5)',
    type: 'traditional',
    date: { lunar: { month: 5, day: 5 } },
    icon: '🍙',
    color: 'text-green-600',
  },
  {
    name: 'Rằm tháng 7 (Vu Lan)',
    type: 'religious',
    date: { lunar: { month: 7, day: 15 } },
    icon: '🌸',
    color: 'text-pink-500',
  },
  {
    name: 'Tết Trung Thu (Rằm tháng 8)',
    type: 'traditional',
    date: { lunar: { month: 8, day: 15 } },
    icon: '🌕',
    color: 'text-yellow-500',
  },
  {
    name: 'Tết Hạ Nguyên (Rằm tháng 10)',
    type: 'traditional',
    date: { lunar: { month: 10, day: 15 } },
    icon: '🕯️',
    color: 'text-orange-500',
  },
  {
    name: 'Ông Táo chầu trời (23 tháng Chạp)',
    type: 'traditional',
    date: { lunar: { month: 12, day: 23 } },
    icon: '🔥',
    color: 'text-red-400',
  },
]

/**
 * Tất cả ngày lễ
 */
export const allHolidays: Holiday[] = [...nationalHolidays, ...traditionalHolidays]

/**
 * Lấy ngày lễ theo ngày dương lịch
 */
export function getHolidayBySolarDate(month: number, day: number): Holiday | undefined {
  return allHolidays.find(
    (holiday) =>
      holiday.date.solar?.month === month && holiday.date.solar?.day === day
  )
}

/**
 * Lấy ngày lễ theo ngày âm lịch
 */
export function getHolidayByLunarDate(month: number, day: number): Holiday | undefined {
  return allHolidays.find(
    (holiday) =>
      holiday.date.lunar?.month === month && holiday.date.lunar?.day === day
  )
}

/**
 * Kiểm tra xem ngày có phải là ngày lễ không
 */
export function isHoliday(
  solarMonth: number,
  solarDay: number,
  lunarMonth?: number,
  lunarDay?: number
): Holiday | undefined {
  // Kiểm tra lễ quốc gia (theo dương lịch)
  const nationalHoliday = getHolidayBySolarDate(solarMonth, solarDay)
  if (nationalHoliday) return nationalHoliday

  // Kiểm tra lễ truyền thống (theo âm lịch)
  if (lunarMonth && lunarDay) {
    return getHolidayByLunarDate(lunarMonth, lunarDay)
  }

  return undefined
}

