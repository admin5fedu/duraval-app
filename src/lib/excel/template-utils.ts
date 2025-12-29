/**
 * Excel Template Utilities
 * 
 * Professional Excel template generation for import
 */

import { createWorkbook, addDataToWorksheet, downloadWorkbook } from './exceljs-utils'
import type { ExcelColumnType } from '@/shared/types/excel'

export interface TemplateColumn {
  header: string
  description?: string
  required?: boolean
  example?: string | number
  type?: ExcelColumnType
}

/**
 * Generate Excel template file for import
 */
export async function generateImportTemplate(
  columns: TemplateColumn[],
  moduleName: string = 'template'
): Promise<void> {
  const workbook = createWorkbook(moduleName)
  const worksheet = workbook.getWorksheet(1)
  
  if (!worksheet) {
    throw new Error('Không thể tạo worksheet')
  }

  // Prepare headers
  const headers: string[] = []
  const descriptions: string[] = []
  const examples: (string | number)[] = []
  
  columns.forEach(col => {
    const header = col.required ? `${col.header} *` : col.header
    headers.push(header)
    descriptions.push(col.description || '')
    examples.push(col.example || '')
  })

  // Add header row with styling
  const headerRow = worksheet.addRow(headers)
  headerRow.font = { bold: true, size: 11 }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' } // Blue header
  }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
  headerRow.height = 30

  // Add description row (optional)
  const hasDescriptions = descriptions.some(d => d)
  if (hasDescriptions) {
    const descRow = worksheet.addRow(descriptions)
    descRow.font = { italic: true, size: 9, color: { argb: 'FF666666' } }
    descRow.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
    descRow.height = 20
  }

  // Add example row
  const exampleRow = worksheet.addRow(examples)
  exampleRow.font = { size: 10, color: { argb: 'FF999999' } }
  exampleRow.alignment = { vertical: 'middle', horizontal: 'left' }
  exampleRow.height = 20

  // Add empty row for user data
  worksheet.addRow([])

  // Style columns
  worksheet.columns.forEach((column, index) => {
    const col = columns[index]
    let maxLength = headers[index]?.length || 10
    
    if (hasDescriptions && descriptions[index]) {
      maxLength = Math.max(maxLength, descriptions[index].length)
    }
    if (examples[index]) {
      maxLength = Math.max(maxLength, String(examples[index]).length)
    }
    
    column.width = Math.min(Math.max(maxLength + 2, 12), 50)
    
    // Add data validation for required columns
    if (col?.required) {
      const headerRowIndex = 1
      
      // Add note/comment for required columns
      const headerCell = worksheet.getCell(headerRowIndex, index + 1)
      headerCell.note = 'Cột bắt buộc - không được để trống'
    }
  })

  // Freeze header rows
  worksheet.views = [{
    state: 'frozen',
    ySplit: hasDescriptions ? 3 : 2
  }]

  // Add instructions sheet
  const instructionsSheet = workbook.addWorksheet('Hướng dẫn')
  instructionsSheet.columns = [
    { width: 80 }
  ]

  const instructions = [
    'HƯỚNG DẪN NHẬP DỮ LIỆU',
    '',
    '1. Điền thông tin vào các cột tương ứng',
    '2. Các cột có dấu * là bắt buộc',
    '3. Xóa dòng ví dụ trước khi nhập dữ liệu',
    '4. Đảm bảo định dạng dữ liệu đúng:',
    '   - Ngày tháng: dd/mm/yyyy',
    '   - Số: chỉ nhập số, không có ký tự đặc biệt',
    '   - Email: định dạng email hợp lệ',
    '   - Số điện thoại: 10-11 chữ số',
    '',
    '5. Lưu file và tải lên để nhập dữ liệu',
    '',
    'LƯU Ý:',
    '- Không thay đổi tên cột',
    '- Không xóa các cột bắt buộc',
    '- Kiểm tra dữ liệu trước khi tải lên',
  ]

  instructions.forEach((instruction, index) => {
    const row = instructionsSheet.getRow(index + 1)
    row.getCell(1).value = instruction
    if (index === 0) {
      row.getCell(1).font = { bold: true, size: 14 }
    } else if (instruction.startsWith('LƯU Ý:')) {
      row.getCell(1).font = { bold: true, size: 11 }
    }
    row.height = 20
  })

  // Download template
  const filename = `${moduleName}_template_${new Date().toISOString().split('T')[0]}.xlsx`
  await downloadWorkbook(workbook, filename)
}

/**
 * Export import errors to Excel file
 */
export async function exportImportErrors(
  errors: Array<{ rowNumber: number; errors: string[] }>,
  moduleName: string = 'import_errors'
): Promise<void> {
  const workbook = createWorkbook(moduleName)
  const worksheet = workbook.getWorksheet(1)
  
  if (!worksheet) {
    throw new Error('Không thể tạo worksheet')
  }

  const headers = ['Dòng', 'Lỗi']
  const rows: any[][] = errors.map(err => [
    err.rowNumber,
    err.errors.join('; ')
  ])

  addDataToWorksheet(worksheet, headers, rows)

  // Style error column
  worksheet.getColumn(2).width = 80
  worksheet.getColumn(2).alignment = { wrapText: true }

  const filename = `${moduleName}_${new Date().toISOString().split('T')[0]}.xlsx`
  await downloadWorkbook(workbook, filename)
}

