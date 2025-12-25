/**
 * Selection Utilities
 * 
 * Helper functions for row selection operations
 */

import { Table } from "@tanstack/react-table"

/**
 * Select a range of rows between two indices
 */
export function selectRange<TData>(
    table: Table<TData>,
    startIndex: number,
    endIndex: number
): void {
    const rows = table.getRowModel().rows
    const start = Math.min(startIndex, endIndex)
    const end = Math.max(startIndex, endIndex)
    
    // Get all rows in range
    const rowsInRange = rows.slice(start, end + 1)
    
    // Determine if we should select or deselect based on first row in range
    const shouldSelect = !rowsInRange[0]?.getIsSelected()
    
    // Select/deselect all rows in range
    rowsInRange.forEach((row) => {
        row.toggleSelected(shouldSelect)
    })
}

/**
 * Get row index from row ID
 */
export function getRowIndex<TData>(
    table: Table<TData>,
    rowId: string
): number | null {
    const rows = table.getRowModel().rows
    const index = rows.findIndex((row) => row.id === rowId)
    return index >= 0 ? index : null
}

/**
 * Select all visible rows (current page)
 */
export function selectAllVisible<TData>(table: Table<TData>): void {
    table.toggleAllPageRowsSelected(true)
}

/**
 * Deselect all rows
 */
export function deselectAll<TData>(table: Table<TData>): void {
    table.resetRowSelection()
}

/**
 * Get selected row IDs
 */
export function getSelectedRowIds<TData>(table: Table<TData>): string[] {
    return table.getFilteredSelectedRowModel().rows.map((row) => row.id)
}

/**
 * Get selected row data
 */
export function getSelectedRowData<TData>(table: Table<TData>): TData[] {
    return table.getFilteredSelectedRowModel().rows.map((row) => row.original)
}

/**
 * Check if any rows are selected
 */
export function hasSelection<TData>(table: Table<TData>): boolean {
    return table.getFilteredSelectedRowModel().rows.length > 0
}

/**
 * Get selection count
 */
export function getSelectionCount<TData>(table: Table<TData>): {
    selected: number
    total: number
} {
    return {
        selected: table.getFilteredSelectedRowModel().rows.length,
        total: table.getFilteredRowModel().rows.length
    }
}

