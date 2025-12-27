/**
 * Header Row Formatter
 * 
 * Handles formatting of Excel worksheet header rows
 */

import ExcelJS from 'exceljs'
import type { ExcelFormatOptions } from './types'

/**
 * Format header row (row 1) with professional styling
 */
export function formatHeaderRow(
  worksheet: ExcelJS.Worksheet,
  headerStyle: ExcelFormatOptions['headerStyle']
): void {
  if (worksheet.rowCount === 0 || !headerStyle) return
  
  const headerRow = worksheet.getRow(1)
  
  // Font
  if (headerStyle.font) {
    headerRow.font = {
      bold: headerStyle.font.bold ?? true,
      size: headerStyle.font.size ?? 11,
      color: headerStyle.font.color ? { argb: `FF${headerStyle.font.color}` } : undefined,
      name: headerStyle.font.name ?? 'Calibri',
    }
  }
  
  // Fill
  if (headerStyle.fill) {
    headerRow.fill = {
      type: 'pattern',
      pattern: headerStyle.fill.pattern ?? 'solid',
      fgColor: headerStyle.fill.color ? { argb: `FF${headerStyle.fill.color}` } : undefined,
    }
  }
  
  // Alignment
  if (headerStyle.alignment) {
    headerRow.alignment = {
      horizontal: headerStyle.alignment.horizontal ?? 'center',
      vertical: headerStyle.alignment.vertical ?? 'middle',
      wrapText: headerStyle.alignment.wrapText ?? true,
    }
  }
  
  // Border
  if (headerStyle.border) {
    const borderStyle = headerStyle.border.style ?? 'thin'
    const borderColor = headerStyle.border.color ? { argb: `FF${headerStyle.border.color}` } : undefined
    
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: borderStyle, color: borderColor },
        left: { style: borderStyle, color: borderColor },
        bottom: { style: borderStyle, color: borderColor },
        right: { style: borderStyle, color: borderColor },
      }
    })
  }
  
  // Height
  if (headerStyle.height) {
    headerRow.height = headerStyle.height
  }
}

