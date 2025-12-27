/**
 * Excel Formatting Types and Constants
 * 
 * Types and default configuration for Excel formatting
 */

/**
 * Options for Excel formatting
 */
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

