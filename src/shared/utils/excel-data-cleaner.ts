/**
 * Excel Data Cleaning Utilities
 * 
 * Remove empty rows, trim whitespace, normalize data
 */

/**
 * Check if a row is empty (all cells are empty/null/whitespace)
 */
export function isEmptyRow(row: any[]): boolean {
  if (!row || row.length === 0) return true

  return row.every(cell => {
    if (cell === null || cell === undefined) return true
    if (typeof cell === 'string' && cell.trim() === '') return true
    if (typeof cell === 'number' && isNaN(cell)) return true
    return false
  })
}

/**
 * Check if a row has meaningful data (at least one non-empty cell)
 */
export function hasData(row: any[]): boolean {
  if (!row || row.length === 0) return false

  return row.some(cell => {
    if (cell === null || cell === undefined) return false
    if (typeof cell === 'string') {
      const trimmed = cell.trim()
      // Ignore common "empty" values
      if (trimmed === '' || trimmed === '-' || trimmed === 'N/A' || trimmed === 'n/a') {
        return false
      }
      return true
    }
    if (typeof cell === 'number' && !isNaN(cell)) return true
    if (typeof cell === 'boolean') return true
    return false
  })
}

/**
 * Filter out empty rows from Excel data
 */
export function filterEmptyRows(rows: any[][]): {
  filtered: any[][]
  removedCount: number
  removedIndices: number[]
} {
  const filtered: any[][] = []
  const removedIndices: number[] = []

  rows.forEach((row, index) => {
    if (hasData(row)) {
      filtered.push(row)
    } else {
      removedIndices.push(index)
    }
  })

  return {
    filtered,
    removedCount: removedIndices.length,
    removedIndices,
  }
}

/**
 * Clean cell value (trim, normalize)
 */
export function cleanCellValue(value: any): any {
  if (value === null || value === undefined) return null

  if (typeof value === 'string') {
    const trimmed = value.trim()
    // Convert empty strings to null
    if (trimmed === '' || trimmed === '-' || trimmed === 'N/A' || trimmed === 'n/a') {
      return null
    }
    return trimmed
  }

  if (typeof value === 'number') {
    return isNaN(value) ? null : value
  }

  return value
}

/**
 * Clean entire row (clean all cells)
 */
export function cleanRow(row: any[]): any[] {
  return row.map(cell => cleanCellValue(cell))
}

/**
 * Clean entire dataset
 */
export function cleanDataset(rows: any[][]): {
  cleaned: any[][]
  emptyRowsRemoved: number
} {
  const cleaned: any[][] = []
  let emptyRowsRemoved = 0

  rows.forEach(row => {
    const cleanedRow = cleanRow(row)
    if (hasData(cleanedRow)) {
      cleaned.push(cleanedRow)
    } else {
      emptyRowsRemoved++
    }
  })

  return {
    cleaned,
    emptyRowsRemoved,
  }
}

/**
 * Check if a value should be skipped (empty/null)
 */
export function shouldSkipValue(value: any, skipEmpty: boolean = true): boolean {
  if (!skipEmpty) return false

  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  return false
}

