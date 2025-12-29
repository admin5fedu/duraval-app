/**
 * Column Helper Utilities
 * 
 * Helper functions for working with table columns
 */

import * as React from "react"
import { Column } from "@tanstack/react-table"

/**
 * Get display name for a column
 * Priority: meta.title > header (if string) > column.id (formatted)
 */
export function getColumnDisplayName<TData>(column: Column<TData, unknown>): string {
  // 1. Try to get from meta.title if defined (preferred - Vietnamese with diacritics)
  const meta = column.columnDef.meta as { title?: string } | undefined
  if (meta?.title) {
    return meta.title
  }

  // 2. Try to get from columnDef.header if it's a string
  const header = column.columnDef.header
  if (typeof header === "string") {
    return header
  }

  // 3. Try to extract text from React element header (if it contains text)
  if (React.isValidElement(header)) {
    // Try to find text in children
    const extractText = (element: React.ReactElement | string | number | null | undefined | React.ReactNode): string => {
      if (typeof element === 'string' || typeof element === 'number') {
        return String(element)
      }
      if (React.isValidElement(element)) {
        const props = element.props as { title?: string; children?: React.ReactNode }
        if (props?.title) {
          return String(props.title)
        }
        if (props?.children) {
          return extractText(props.children as React.ReactElement | string | number | null | undefined)
        }
      }
      return ''
    }
    const extracted = extractText(header)
    if (extracted) {
      return extracted
    }
  }

  // 4. Fall back to column id (convert snake_case to readable format)
  return column.id
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Get column order from meta (for logical sorting)
 */
export function getColumnOrder<TData>(column: Column<TData, unknown>): number {
  const meta = column.columnDef.meta as { order?: number } | undefined
  return meta?.order ?? 999 // Default to end if no order specified
}

/**
 * Check if a column is hideable
 * A column is hideable if:
 * 1. It has an accessor (accessorKey or accessorFn)
 * 2. It's not explicitly disabled (enableHiding !== false)
 * 3. It's not a selection column (id !== 'select')
 * 4. It's not an actions column (typically has enableHiding: false)
 */
export function isColumnHideable<TData>(column: Column<TData, unknown>): boolean {
  const def = column.columnDef as any
  const hasAccessor = def.accessorKey || def.accessorFn || column.accessorFn
  const canHide = column.getCanHide()
  const isSelectionColumn = column.id === 'select'
  const hidingDisabled = column.columnDef.enableHiding === false
  
  return hasAccessor && canHide && !isSelectionColumn && !hidingDisabled
}

