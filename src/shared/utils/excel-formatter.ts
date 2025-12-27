/**
 * Excel Formatting Utilities
 * 
 * Professional Excel formatting for export functionality
 * 
 * This is the main entry point that orchestrates all formatting operations.
 * Individual formatters are split into separate modules for better maintainability.
 */

import type ExcelJS from 'exceljs'
import { DEFAULT_EXCEL_FORMAT, type ExcelFormatOptions } from './excel-formatting/types'
import { formatHeaderRow } from './excel-formatting/header-formatter'
import { formatDataRows } from './excel-formatting/data-formatter'
import { formatColumns, applyFreezePanes, applyAutoFilter } from './excel-formatting/column-formatter'
import { detectAndFormatColumn } from './excel-formatting/type-detector'
import { addMetadataToWorksheet } from './excel-formatting/metadata-formatter'

// Re-export types and constants for backward compatibility
export type { ExcelFormatOptions } from './excel-formatting/types'
export { DEFAULT_EXCEL_FORMAT } from './excel-formatting/types'

// Re-export functions for backward compatibility
export { detectAndFormatColumn, addMetadataToWorksheet }

/**
 * Format worksheet with professional styling
 * 
 * This is the main formatting function that orchestrates all formatting operations:
 * - Header row formatting
 * - Data rows formatting
 * - Column width and formatting
 * - Freeze panes
 * - Auto-filter
 */
export function formatWorksheet(
  worksheet: ExcelJS.Worksheet,
  options: ExcelFormatOptions = DEFAULT_EXCEL_FORMAT
): void {
  const opts = { ...DEFAULT_EXCEL_FORMAT, ...options }
  
  // Format header row (row 1)
  if (worksheet.rowCount > 0 && opts.headerStyle) {
    formatHeaderRow(worksheet, opts.headerStyle)
  }
  
  // Format data rows
  if (opts.dataStyle) {
    formatDataRows(worksheet, opts.dataStyle)
  }
  
  // Format columns (width, auto-fit, etc.)
  formatColumns(worksheet, opts)
  
  // Freeze panes
  if (opts.freezeHeaderRow || opts.freezeFirstColumn) {
    applyFreezePanes(worksheet, opts.freezeHeaderRow ?? false, opts.freezeFirstColumn ?? false)
  }
  
  // Add auto-filter to header row
  if (worksheet.rowCount > 0) {
    applyAutoFilter(worksheet)
  }
}
