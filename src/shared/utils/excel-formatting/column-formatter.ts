/**
 * Column Formatter
 * 
 * Handles column width, auto-fit, and freeze panes
 */

import ExcelJS from 'exceljs'
import type { ExcelFormatOptions } from './types'

/**
 * Format columns with width, alignment, and number formats
 */
export function formatColumns(
  worksheet: ExcelJS.Worksheet,
  options: ExcelFormatOptions
): void {
  worksheet.columns.forEach((column, index) => {
    const columnLetter = String.fromCharCode(65 + index) // A, B, C, ...
    const columnKey = columnLetter
    
    // Column-specific formatting
    if (options.columnFormats && options.columnFormats[columnKey]) {
      const colFormat = options.columnFormats[columnKey]
      
      if (colFormat.width) {
        column.width = colFormat.width
      }
      
      if (colFormat.numberFormat) {
        column.numFmt = colFormat.numberFormat
      }
      
      if (colFormat.alignment) {
        column.alignment = {
          horizontal: colFormat.alignment.horizontal ?? 'left',
          vertical: colFormat.alignment.vertical ?? 'middle',
        }
      }
    } else {
      // Auto-fit columns
      if (options.autoFitColumns) {
        let maxLength = 10
        
        // Check header
        const headerCell = worksheet.getCell(1, index + 1)
        if (headerCell.value) {
          maxLength = Math.max(maxLength, String(headerCell.value).length)
        }
        
        // Check data rows
        for (let i = 2; i <= worksheet.rowCount; i++) {
          const cell = worksheet.getCell(i, index + 1)
          if (cell.value) {
            const cellValue = String(cell.value)
            maxLength = Math.max(maxLength, cellValue.length)
          }
        }
        
        const width = Math.max(
          options.minColumnWidth ?? 10,
          Math.min(maxLength + 2, options.maxColumnWidth ?? 50)
        )
        column.width = width
      }
    }
  })
}

/**
 * Apply freeze panes to worksheet
 */
export function applyFreezePanes(
  worksheet: ExcelJS.Worksheet,
  freezeHeaderRow: boolean,
  freezeFirstColumn: boolean
): void {
  if (!freezeHeaderRow && !freezeFirstColumn) return
  
  worksheet.views = [{
    state: 'frozen',
    xSplit: freezeFirstColumn ? 1 : 0,
    ySplit: freezeHeaderRow ? 1 : 0,
    topLeftCell: freezeFirstColumn && freezeHeaderRow ? 'B2' : freezeHeaderRow ? 'A2' : 'B1',
    activeCell: freezeFirstColumn && freezeHeaderRow ? 'B2' : freezeHeaderRow ? 'A2' : 'B1',
  }]
}

/**
 * Add auto-filter to header row
 */
export function applyAutoFilter(worksheet: ExcelJS.Worksheet): void {
  if (worksheet.rowCount === 0) return
  
  const lastColumn = worksheet.columnCount
  if (lastColumn > 0) {
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: lastColumn },
    }
  }
}

