/**
 * Data Row Formatter
 * 
 * Handles formatting of Excel worksheet data rows
 */

import ExcelJS from 'exceljs'
import type { ExcelFormatOptions } from './types'

/**
 * Format data rows with styling
 */
export function formatDataRows(
  worksheet: ExcelJS.Worksheet,
  dataStyle: ExcelFormatOptions['dataStyle']
): void {
  if (worksheet.rowCount <= 1 || !dataStyle) return
  
  // Format all data rows (starting from row 2)
  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i)
    
    if (dataStyle.font) {
      row.font = {
        size: dataStyle.font.size ?? 10,
        color: dataStyle.font.color ? { argb: `FF${dataStyle.font.color}` } : undefined,
        name: dataStyle.font.name ?? 'Calibri',
      }
    }
    
    if (dataStyle.alignment) {
      row.alignment = {
        horizontal: dataStyle.alignment.horizontal ?? 'left',
        vertical: dataStyle.alignment.vertical ?? 'middle',
        wrapText: dataStyle.alignment.wrapText ?? false,
      }
    }
  }
}

