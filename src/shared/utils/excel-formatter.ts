/**
 * Excel Formatting Utilities
 * 
 * Professional Excel formatting for export functionality
 */

import ExcelJS from 'exceljs'

export interface ExcelFormatOptions {
  // Header formatting
  headerStyle?: {
    font?: {
      bold?: boolean
      size?: number
      color?: string // Hex color without #, e.g., 'FFFFFF' for white
      name?: string
    }
    fill?: {
      color?: string // Hex color without #, e.g., '4472C4' for blue
      pattern?: 'solid' | 'gray125' | 'darkGray' | 'lightGray'
    }
    alignment?: {
      horizontal?: 'left' | 'center' | 'right' | 'fill' | 'justify' | 'centerContinuous' | 'distributed'
      vertical?: 'top' | 'middle' | 'bottom' | 'distributed' | 'justify'
      wrapText?: boolean
    }
    border?: {
      style?: 'thin' | 'medium' | 'thick' | 'dotted' | 'hair' | 'dashed' | 'dashDot' | 'dashDotDot' | 'double'
      color?: string
    }
    height?: number
  }
  
  // Data formatting
  dataStyle?: {
    font?: {
      size?: number
      color?: string
      name?: string
    }
    alignment?: {
      horizontal?: 'left' | 'center' | 'right'
      vertical?: 'top' | 'middle' | 'bottom'
      wrapText?: boolean
    }
  }
  
  // Column-specific formatting
  columnFormats?: Record<string, {
    width?: number
    numberFormat?: string // Excel number format, e.g., '#,##0.00' for numbers, 'dd/mm/yyyy' for dates
    alignment?: {
      horizontal?: 'left' | 'center' | 'right'
      vertical?: 'top' | 'middle' | 'bottom'
    }
    dataType?: 'text' | 'number' | 'date' | 'currency' | 'percentage'
  }>
  
  // Global options
  autoFitColumns?: boolean
  freezeHeaderRow?: boolean
  freezeFirstColumn?: boolean
  minColumnWidth?: number
  maxColumnWidth?: number
}

/**
 * Default professional formatting options
 */
export const DEFAULT_EXCEL_FORMAT: ExcelFormatOptions = {
  headerStyle: {
    font: {
      bold: true,
      size: 11,
      color: 'FFFFFF', // White text
      name: 'Calibri',
    },
    fill: {
      color: '4472C4', // Blue background
      pattern: 'solid',
    },
    alignment: {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    },
    border: {
      style: 'thin',
      color: '000000',
    },
    height: 25,
  },
  dataStyle: {
    font: {
      size: 10,
      name: 'Calibri',
    },
    alignment: {
      horizontal: 'left',
      vertical: 'middle',
      wrapText: false,
    },
  },
  autoFitColumns: true,
  freezeHeaderRow: true,
  freezeFirstColumn: false,
  minColumnWidth: 10,
  maxColumnWidth: 50,
}

/**
 * Format worksheet with professional styling
 */
export function formatWorksheet(
  worksheet: ExcelJS.Worksheet,
  options: ExcelFormatOptions = DEFAULT_EXCEL_FORMAT
): void {
  const opts = { ...DEFAULT_EXCEL_FORMAT, ...options }
  
  // Format header row (row 1)
  if (worksheet.rowCount > 0) {
    const headerRow = worksheet.getRow(1)
    
    if (opts.headerStyle) {
      // Font
      if (opts.headerStyle.font) {
        headerRow.font = {
          bold: opts.headerStyle.font.bold ?? true,
          size: opts.headerStyle.font.size ?? 11,
          color: opts.headerStyle.font.color ? { argb: `FF${opts.headerStyle.font.color}` } : undefined,
          name: opts.headerStyle.font.name ?? 'Calibri',
        }
      }
      
      // Fill
      if (opts.headerStyle.fill) {
        headerRow.fill = {
          type: 'pattern',
          pattern: opts.headerStyle.fill.pattern ?? 'solid',
          fgColor: opts.headerStyle.fill.color ? { argb: `FF${opts.headerStyle.fill.color}` } : undefined,
        }
      }
      
      // Alignment
      if (opts.headerStyle.alignment) {
        headerRow.alignment = {
          horizontal: opts.headerStyle.alignment.horizontal ?? 'center',
          vertical: opts.headerStyle.alignment.vertical ?? 'middle',
          wrapText: opts.headerStyle.alignment.wrapText ?? true,
        }
      }
      
      // Border
      if (opts.headerStyle.border) {
        const borderStyle = opts.headerStyle.border.style ?? 'thin'
        const borderColor = opts.headerStyle.border.color ? { argb: `FF${opts.headerStyle.border.color}` } : undefined
        
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
      if (opts.headerStyle.height) {
        headerRow.height = opts.headerStyle.height
      }
    }
    
    // Format data rows
    if (opts.dataStyle && worksheet.rowCount > 1) {
      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i)
        
        if (opts.dataStyle.font) {
          row.font = {
            size: opts.dataStyle.font.size ?? 10,
            color: opts.dataStyle.font.color ? { argb: `FF${opts.dataStyle.font.color}` } : undefined,
            name: opts.dataStyle.font.name ?? 'Calibri',
          }
        }
        
        if (opts.dataStyle.alignment) {
          row.alignment = {
            horizontal: opts.dataStyle.alignment.horizontal ?? 'left',
            vertical: opts.dataStyle.alignment.vertical ?? 'middle',
            wrapText: opts.dataStyle.alignment.wrapText ?? false,
          }
        }
      }
    }
  }
  
  // Format columns
  worksheet.columns.forEach((column, index) => {
    const columnLetter = String.fromCharCode(65 + index) // A, B, C, ...
    const columnKey = columnLetter
    
    // Column-specific formatting
    if (opts.columnFormats && opts.columnFormats[columnKey]) {
      const colFormat = opts.columnFormats[columnKey]
      
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
      if (opts.autoFitColumns) {
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
          opts.minColumnWidth ?? 10,
          Math.min(maxLength + 2, opts.maxColumnWidth ?? 50)
        )
        column.width = width
      }
    }
  })
  
  // Freeze panes
  if (opts.freezeHeaderRow || opts.freezeFirstColumn) {
    worksheet.views = [{
      state: 'frozen',
      xSplit: opts.freezeFirstColumn ? 1 : 0,
      ySplit: opts.freezeHeaderRow ? 1 : 0,
      topLeftCell: opts.freezeFirstColumn && opts.freezeHeaderRow ? 'B2' : opts.freezeHeaderRow ? 'A2' : 'B1',
      activeCell: opts.freezeFirstColumn && opts.freezeHeaderRow ? 'B2' : opts.freezeHeaderRow ? 'A2' : 'B1',
    }]
  }
  
  // Add auto-filter to header row
  if (worksheet.rowCount > 0) {
    const headerRow = worksheet.getRow(1)
    const lastColumn = worksheet.columnCount
    if (lastColumn > 0) {
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: lastColumn },
      }
    }
  }
}

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

/**
 * Add metadata to worksheet (as comments or in first row)
 */
export function addMetadataToWorksheet(
  worksheet: ExcelJS.Worksheet,
  metadata: {
    moduleName?: string
    exportDate?: string
    exportedBy?: string
    filters?: string[]
    searchQuery?: string
    recordCount?: number
    totalCount?: number
  }
): void {
  // Insert metadata as first row (will be merged)
  if (worksheet.rowCount > 0) {
    // Add metadata row before header
    worksheet.spliceRows(1, 0, [])
    const metadataRow = worksheet.getRow(1)
    
    const metadataText = [
      metadata.moduleName && `Module: ${metadata.moduleName}`,
      metadata.exportDate && `Ngày xuất: ${metadata.exportDate}`,
      metadata.exportedBy && `Người xuất: ${metadata.exportedBy}`,
      metadata.filters && metadata.filters.length > 0 && `Filters: ${metadata.filters.join(', ')}`,
      metadata.searchQuery && `Tìm kiếm: ${metadata.searchQuery}`,
      metadata.recordCount !== undefined && `Số bản ghi: ${metadata.recordCount}`,
      metadata.totalCount !== undefined && `Tổng số: ${metadata.totalCount}`,
    ]
      .filter(Boolean)
      .join(' | ')
    
    const metadataCell = metadataRow.getCell(1)
    metadataCell.value = metadataText
    metadataCell.font = { size: 9, italic: true, color: { argb: 'FF666666' } }
    metadataCell.alignment = { horizontal: 'left', vertical: 'middle' }
    
    // Merge cells for metadata
    if (worksheet.columnCount > 1) {
      worksheet.mergeCells(1, 1, 1, worksheet.columnCount)
    }
    
    // Adjust freeze panes to account for metadata row
    if (worksheet.views && worksheet.views.length > 0) {
      const view = worksheet.views[0]
      if (view.ySplit !== undefined) {
        view.ySplit = (view.ySplit ?? 0) + 1
        view.topLeftCell = view.topLeftCell?.replace(/^A/, 'A')?.replace(/^(\d+)/, (match) => String(Number(match) + 1))
      }
    }
  }
}

