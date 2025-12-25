/**
 * ExcelJS Utilities - Secure Excel Processing
 * 
 * Professional replacement for xlsx package using ExcelJS
 * Provides compatible API for easy migration
 */

import ExcelJS from 'exceljs'

/**
 * Parse Excel file from File object (browser)
 */
export async function parseExcelFile(file: File): Promise<{
  workbook: ExcelJS.Workbook
  firstSheet: ExcelJS.Worksheet
  sheetData: any[][]
}> {
  // Validate file size (10MB max)
  const MAX_FILE_SIZE = 10 * 1024 * 1024
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File quá lớn. Kích thước tối đa: ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  if (file.size === 0) {
    throw new Error('File không hợp lệ hoặc rỗng')
  }

  // Read file as buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Load workbook
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)

  // Validate workbook
  if (workbook.worksheets.length === 0) {
    throw new Error('File Excel không có sheet nào')
  }

  // Get first sheet
  const firstSheet = workbook.worksheets[0]
  
  // Validate sheet size
  const MAX_ROWS = 10000
  const MAX_COLS = 100
  
  if (firstSheet.rowCount > MAX_ROWS) {
    throw new Error(`Sheet có quá nhiều dòng (tối đa ${MAX_ROWS})`)
  }

  // Convert sheet to array of arrays
  const sheetData: any[][] = []
  firstSheet.eachRow((row, rowNumber) => {
    const rowData: any[] = []
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      let value: any = cell.value
      
      // Handle different cell value types
      if (cell.value === null || cell.value === undefined) {
        value = null
      } else if (typeof cell.value === 'object') {
        // Handle rich text, formula results, etc.
        if ('text' in cell.value) {
          value = (cell.value as any).text
        } else if ('result' in cell.value) {
          value = (cell.value as any).result
        } else {
          value = String(cell.value)
        }
      } else {
        value = cell.value
      }
      
      rowData[colNumber - 1] = value
    })
    
    // Fill empty cells at the end with null
    while (rowData.length < MAX_COLS) {
      rowData.push(null)
    }
    
    sheetData[rowNumber - 1] = rowData
  })

  return {
    workbook,
    firstSheet,
    sheetData
  }
}

/**
 * Parse Excel file from Buffer (server-side)
 */
export async function parseExcelBuffer(buffer: Buffer): Promise<{
  workbook: ExcelJS.Workbook
  firstSheet: ExcelJS.Worksheet
  sheetData: any[][]
}> {
  // Validate buffer size
  const MAX_FILE_SIZE = 10 * 1024 * 1024
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File quá lớn. Kích thước tối đa: ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Load workbook
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)

  // Validate workbook
  if (workbook.worksheets.length === 0) {
    throw new Error('File Excel không có sheet nào')
  }

  // Get first sheet
  const firstSheet = workbook.worksheets[0]
  
  // Convert sheet to array of arrays
  const sheetData: any[][] = []
  firstSheet.eachRow((row, rowNumber) => {
    const rowData: any[] = []
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      let value: any = cell.value
      
      if (cell.value === null || cell.value === undefined) {
        value = null
      } else if (typeof cell.value === 'object') {
        if ('text' in cell.value) {
          value = (cell.value as any).text
        } else if ('result' in cell.value) {
          value = (cell.value as any).result
        } else {
          value = String(cell.value)
        }
      } else {
        value = cell.value
      }
      
      rowData[colNumber - 1] = value
    })
    
    sheetData[rowNumber - 1] = rowData
  })

  return {
    workbook,
    firstSheet,
    sheetData
  }
}

/**
 * Create Excel workbook
 */
export function createWorkbook(sheetName: string = 'Sheet1'): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook()
  workbook.addWorksheet(sheetName)
  return workbook
}

/**
 * Add data to worksheet with formatting
 */
export function addDataToWorksheet(
  worksheet: ExcelJS.Worksheet,
  headers: string[],
  rows: any[][]
): void {
  // Add headers
  const headerRow = worksheet.addRow(headers)
  headerRow.font = { bold: true }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

  // Add data rows
  rows.forEach(row => {
    worksheet.addRow(row)
  })

  // Auto-fit columns
  worksheet.columns.forEach((column, index) => {
    let maxLength = headers[index]?.length || 10
    
    rows.forEach(row => {
      const cellValue = String(row[index] || '')
      if (cellValue.length > maxLength) {
        maxLength = cellValue.length
      }
    })
    
    column.width = Math.min(Math.max(maxLength + 2, 10), 50)
  })

  // Freeze first row
  worksheet.views = [{
    state: 'frozen',
    ySplit: 1
  }]
}

/**
 * Download workbook as file (browser)
 */
export async function downloadWorkbook(
  workbook: ExcelJS.Workbook,
  filename: string
): Promise<void> {
  // Sanitize filename
  const sanitizedFilename = filename
    .replace(/[\\\/\?\*\[\]:]/g, '_')
    .substring(0, 255)

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()

  // Create blob and download
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = sanitizedFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Convert workbook to buffer (server-side)
 */
export async function workbookToBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
  return await workbook.xlsx.writeBuffer() as Buffer
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string = 'export'): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  
  return `${prefix}_${year}${month}${day}_${hours}${minutes}${seconds}.xlsx`
}

/**
 * Helper aliases for compatibility
 */
export const createWorkbookExcelJS = createWorkbook
export const generateFilenameExcelJS = generateFilename

