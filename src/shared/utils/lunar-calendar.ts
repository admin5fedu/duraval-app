/**
 * Vietnamese Lunar Calendar Utility
 * Tích hợp thư viện @nghiavuive/lunar_date_vi để chuyển đổi ngày dương sang âm lịch Việt Nam
 */

export interface LunarDate {
  day: number
  month: number
  year: number
  isLeapMonth?: boolean
}

// Cache cho thư viện lunar calendar
let SolarDateClass: any = null
let isLunarLibraryLoaded = false
let isLunarLibraryAvailable = false

/**
 * Load lunar calendar library
 */
async function loadLunarLibrary() {
  if (isLunarLibraryLoaded) {
    return isLunarLibraryAvailable
  }

  try {
    // Sử dụng dynamic import cho ES modules
    const lunarModule = await import('@nghiavuive/lunar_date_vi')
    if (lunarModule && lunarModule.SolarDate) {
      SolarDateClass = lunarModule.SolarDate
      isLunarLibraryAvailable = true
      isLunarLibraryLoaded = true
      return true
    }
  } catch (error) {
    // Thư viện chưa được cài đặt hoặc có lỗi
    isLunarLibraryLoaded = true
    isLunarLibraryAvailable = false
    return false
  }

  isLunarLibraryLoaded = true
  isLunarLibraryAvailable = false
  return false
}

/**
 * Get lunar date info from solar date
 * Sử dụng thư viện @nghiavuive/lunar_date_vi
 */
export function getLunarDateInfo(date: Date): { day: number; month: number } | null {
  // Nếu library chưa available, return null
  if (!isLunarLibraryAvailable || !SolarDateClass) {
    return null
  }

  try {
    const solarDate = new SolarDateClass(date)
    const lunar = solarDate.toLunarDate()
    return {
      day: lunar.day,
      month: lunar.month,
    }
  } catch (error) {
    return null
  }
}

/**
 * Initialize lunar calendar library
 * Call this once when app starts
 */
export async function initLunarCalendar(): Promise<void> {
  await loadLunarLibrary()
}

/**
 * Format ngày âm lịch thành string
 * Ví dụ: "Mùng 5", "15", "Rằm"
 */
export function formatLunarDay(day: number): string {
  if (day === 1) return 'Mùng 1'
  if (day === 15) return 'Rằm'
  if (day <= 10) return `Mùng ${day}`
  return `${day}`
}

/**
 * Format ngày âm lịch đầy đủ
 * Ví dụ: "Mùng 5 tháng Giêng"
 */
export function formatLunarDate(lunar: LunarDate): string {
  const dayStr = formatLunarDay(lunar.day)
  const monthNames = [
    '',
    'Giêng',
    'Hai',
    'Ba',
    'Tư',
    'Năm',
    'Sáu',
    'Bảy',
    'Tám',
    'Chín',
    'Mười',
    'Mười Một',
    'Chạp',
  ]
  const monthStr = monthNames[lunar.month] || `${lunar.month}`
  return `${dayStr} tháng ${monthStr}`
}
