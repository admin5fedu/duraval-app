/**
 * Type Detector
 * 
 * Detects data types and returns appropriate Excel formatting
 */

/**
 * Detect data type and apply appropriate formatting
 */
export function detectAndFormatColumn(
  columnData: any[],
  columnIndex: number,
  dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd' | 'auto' = 'dd/mm/yyyy'
): {
  numberFormat?: string
  dataType?: 'text' | 'number' | 'date' | 'currency' | 'percentage'
} {
  if (columnData.length === 0) return {}
  
  // Filter out null/empty values for detection
  const nonEmptyValues = columnData.filter(val => 
    val !== null && val !== undefined && val !== ''
  )
  
  if (nonEmptyValues.length === 0) return { dataType: 'text' }
  
  // Check if all values are numbers
  const allNumbers = nonEmptyValues.every(val => {
    if (typeof val === 'number') return true
    const num = Number(val)
    return !isNaN(num) && val !== ''
  })
  
  if (allNumbers) {
    // Check if it's a percentage (values between 0-1 or contain %)
    const hasPercentage = nonEmptyValues.some(val => {
      if (typeof val === 'number') {
        return val <= 1 && val >= 0 && val < 1
      }
      const str = String(val)
      return str.includes('%')
    })
    
    if (hasPercentage) {
      return {
        numberFormat: '0.00%',
        dataType: 'percentage',
      }
    }
    
    // Check if it's currency (contains currency symbols)
    const hasCurrency = nonEmptyValues.some(val => {
      const str = String(val)
      return str.includes('₫') || str.includes('VND') || str.includes('vnđ') || 
             str.includes('$') || str.includes('USD')
    })
    
    if (hasCurrency) {
      return {
        numberFormat: '#,##0',
        dataType: 'currency',
      }
    }
    
    // Regular number - check for decimals
    const hasDecimals = nonEmptyValues.some(val => {
      const num = typeof val === 'number' ? val : Number(val)
      return num % 1 !== 0
    })
    
    return {
      numberFormat: hasDecimals ? '#,##0.00' : '#,##0',
      dataType: 'number',
    }
  }
  
  // Check if values are dates
  const dateFormats = [
    /^\d{1,2}\/\d{1,2}\/\d{4}$/, // dd/mm/yyyy
    /^\d{4}-\d{1,2}-\d{1,2}$/, // yyyy-mm-dd
    /^\d{1,2}-\d{1,2}-\d{4}$/, // mm-dd-yyyy
  ]
  
  const allDates = nonEmptyValues.every(val => {
    if (val instanceof Date) return true
    const str = String(val)
    // Check date format patterns
    if (dateFormats.some(pattern => pattern.test(str))) return true
    // Try parsing as date
    const date = new Date(str)
    return !isNaN(date.getTime()) && date.getFullYear() >= 1900 && date.getFullYear() <= 2100
  })
  
  if (allDates) {
    const formatMap: Record<string, string> = {
      'dd/mm/yyyy': 'dd/mm/yyyy',
      'mm/dd/yyyy': 'mm/dd/yyyy',
      'yyyy-mm-dd': 'yyyy-mm-dd',
    }
    
    return {
      numberFormat: formatMap[dateFormat] || 'dd/mm/yyyy',
      dataType: 'date',
    }
  }
  
  // Default to text
  return {
    dataType: 'text',
  }
}

