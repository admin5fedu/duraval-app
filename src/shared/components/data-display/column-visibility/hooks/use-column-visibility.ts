/**
 * useColumnVisibility Hook
 * 
 * Manages column visibility state and provides utilities for resetting to default
 */

import * as React from "react"
import { Table, Column } from "@tanstack/react-table"
import { isColumnHideable, getColumnDisplayName, getColumnOrder } from "../utils/column-helpers"

export interface UseColumnVisibilityReturn<TData> {
  hideableColumns: Column<TData, unknown>[]
  defaultVisibility: Record<string, boolean>
  handleResetToDefault: () => void
}

/**
 * Hook to manage column visibility
 */
export function useColumnVisibility<TData>(
  table: Table<TData>,
  storageKey?: string
): UseColumnVisibilityReturn<TData> {
  // Store default visibility state on mount (before loading from localStorage)
  const defaultVisibilityRef = React.useRef<Record<string, boolean> | null>(null)
  
  // Initialize default visibility state immediately (before any effects)
  // Store the initial visibility state of all hideable columns
  if (defaultVisibilityRef.current === null) {
    const defaultVisibility: Record<string, boolean> = {}
    table.getAllColumns().forEach(column => {
      if (isColumnHideable(column)) {
        defaultVisibility[column.id] = column.getIsVisible()
      }
    })
    defaultVisibilityRef.current = defaultVisibility
  }
  
  // Get all hideable columns
  const hideableColumns = React.useMemo(() => {
    return table
      .getAllColumns()
      .filter(isColumnHideable)
      .sort((a, b) => {
        // Sort by order first (from meta.order), then by display name
        const orderDiff = getColumnOrder(a) - getColumnOrder(b)
        if (orderDiff !== 0) return orderDiff
        return getColumnDisplayName(a).localeCompare(getColumnDisplayName(b), 'vi')
      })
  }, [table])

  // Reset to default visibility
  const handleResetToDefault = React.useCallback(() => {
    if (defaultVisibilityRef.current) {
      table.getAllColumns().forEach(column => {
        if (isColumnHideable(column)) {
          const defaultVisible = defaultVisibilityRef.current![column.id] ?? true
          column.toggleVisibility(defaultVisible)
        }
      })
      // Clear localStorage
      if (typeof window !== 'undefined' && storageKey) {
        try {
          localStorage.removeItem(storageKey)
        } catch (error) {
          console.warn('Failed to clear column visibility preferences:', error)
        }
      }
    }
  }, [table, storageKey])

  return {
    hideableColumns,
    defaultVisibility: defaultVisibilityRef.current || {},
    handleResetToDefault,
  }
}

