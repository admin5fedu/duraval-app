/**
 * Toolbar Helper Utilities
 */

import { Table } from "@tanstack/react-table"

/**
 * Get row ID from row data
 * Supports common ID field patterns: id, ma_nhan_vien, etc.
 */
export function getRowId<TData>(row: TData): string | number | undefined {
  const data = row as Record<string, any>
  return data.id || data.ma_nhan_vien || data.ma_phong_ban || data.ma_chuc_vu || undefined
}

/**
 * Get all selected row IDs from table
 */
export function getSelectedRowIds<TData>(table: Table<TData>): Set<string | number> {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedIds = new Set<string | number>()
  
  selectedRows.forEach(row => {
    const id = getRowId(row.original)
    if (id !== undefined) {
      selectedIds.add(id)
    }
  })
  
  return selectedIds
}

/**
 * Check if table has active filters
 */
export function hasActiveFilters<TData>(table: Table<TData>): boolean {
  return table.getState().columnFilters.length > 0 || !!table.getState().globalFilter
}

/**
 * Get filter count
 */
export function getFilterCount<TData>(table: Table<TData>): number {
  return table.getState().columnFilters.length + (table.getState().globalFilter ? 1 : 0)
}

/**
 * Clear all filters from table
 */
export function clearAllFilters<TData>(table: Table<TData>, onClear?: () => void): void {
  table.resetColumnFilters()
  table.setGlobalFilter("")
  onClear?.()
}

