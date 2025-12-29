/**
 * Metadata Formatter
 * 
 * Adds metadata information to Excel worksheets
 */

import ExcelJS from 'exceljs'

export interface MetadataOptions {
  moduleName?: string
  exportDate?: string
  exportedBy?: string
  filters?: string[]
  searchQuery?: string
  recordCount?: number
  totalCount?: number
}

/**
 * Add metadata to worksheet (as comments or in first row)
 */
export function addMetadataToWorksheet(
  worksheet: ExcelJS.Worksheet,
  metadata: MetadataOptions
): void {
  // Insert metadata as first row (will be merged)
  if (worksheet.rowCount === 0) return
  
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
    const view = worksheet.views[0] as any
    if (view.ySplit !== undefined) {
      view.ySplit = (view.ySplit ?? 0) + 1
      if (view.topLeftCell) {
        view.topLeftCell = view.topLeftCell.replace(/^A/, 'A')?.replace(/^(\d+)/, (match: string) => String(Number(match) + 1))
      }
    }
  }
}

