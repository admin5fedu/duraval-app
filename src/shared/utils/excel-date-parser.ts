/**
 * Excel Date Parser Utilities
 * 
 * Professional date parsing with support for multiple formats
 * Primary format: dd/mm/yyyy
 */

export type DateFormat = 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd' | 'auto'

/**
 * Parse date string with primary format dd/mm/yyyy
 * Falls back to other formats if primary fails
 */
export function parseDate(
  dateStr: string | null | undefined,
  format: DateFormat = 'dd/mm/yyyy'
): string | null {
  if (!dateStr) return null

  const trimmed = String(dateStr).trim()
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
    return null
  }

  // Try dd/mm/yyyy first (primary format)
  const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  const match = trimmed.match(ddmmyyyy)

  if (match) {
    const [, day, month, year] = match
    const dayNum = parseInt(day, 10)
    const monthNum = parseInt(month, 10)
    const yearNum = parseInt(year, 10)

    // Validate date
    if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
      const date = new Date(yearNum, monthNum - 1, dayNum)

      // Verify date is valid (handles invalid dates like 31/02/2024)
      if (
        date.getFullYear() === yearNum &&
        date.getMonth() === monthNum - 1 &&
        date.getDate() === dayNum
      ) {
        return formatDateToISO(date)
      }
    }
  }

  // Try other formats if auto mode or primary failed
  if (format === 'auto' || format !== 'dd/mm/yyyy') {
    // Try mm/dd/yyyy
    const mmddyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    const match2 = trimmed.match(mmddyyyy)
    if (match2) {
      const [, month, day, year] = match2
      const monthNum = parseInt(month, 10)
      const dayNum = parseInt(day, 10)
      const yearNum = parseInt(year, 10)

      if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
        const date = new Date(yearNum, monthNum - 1, dayNum)
        if (
          date.getFullYear() === yearNum &&
          date.getMonth() === monthNum - 1 &&
          date.getDate() === dayNum
        ) {
          return formatDateToISO(date)
        }
      }
    }

    // Try yyyy-mm-dd
    const yyyymmdd = /^(\d{4})-(\d{1,2})-(\d{1,2})$/
    const match3 = trimmed.match(yyyymmdd)
    if (match3) {
      const [, year, month, day] = match3
      const yearNum = parseInt(year, 10)
      const monthNum = parseInt(month, 10)
      const dayNum = parseInt(day, 10)

      if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
        const date = new Date(yearNum, monthNum - 1, dayNum)
        if (
          date.getFullYear() === yearNum &&
          date.getMonth() === monthNum - 1 &&
          date.getDate() === dayNum
        ) {
          return formatDateToISO(date)
        }
      }
    }
  }

  // Fallback: try standard Date parse (for Excel date numbers or other formats)
  try {
    // Handle Excel date serial number
    if (/^\d+\.?\d*$/.test(trimmed)) {
      const excelDate = parseFloat(trimmed)
      // Excel epoch starts from 1900-01-01, but has a bug (treats 1900 as leap year)
      // JavaScript Date uses 1970-01-01, so we need to adjust
      // For simplicity, if it's a reasonable date number, try parsing
      if (excelDate > 0 && excelDate < 100000) {
        // This is likely an Excel serial date
        // Excel serial date: days since 1900-01-01
        const excelEpoch = new Date(1899, 11, 30) // Dec 30, 1899 (Excel's epoch)
        const date = new Date(excelEpoch.getTime() + excelDate * 24 * 60 * 60 * 1000)
        if (!isNaN(date.getTime())) {
          return formatDateToISO(date)
        }
      }
    }

    // Try standard Date parse
    const date = new Date(trimmed)
    if (!isNaN(date.getTime())) {
      // Validate reasonable date range (1900-2100)
      const year = date.getFullYear()
      if (year >= 1900 && year <= 2100) {
        return formatDateToISO(date)
      }
    }
  } catch {
    // Ignore parse errors
  }

  return null
}

/**
 * Format Date object to ISO string (YYYY-MM-DD)
 */
function formatDateToISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Validate date string format
 */
export function isValidDateString(dateStr: string, format: DateFormat = 'dd/mm/yyyy'): boolean {
  return parseDate(dateStr, format) !== null
}

