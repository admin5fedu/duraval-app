/**
 * useColumnStorage Hook
 * 
 * Manages localStorage persistence for column visibility preferences
 */

import * as React from "react"
import { Table, Column } from "@tanstack/react-table"

/**
 * Hook to manage column visibility storage
 */
export function useColumnStorage<TData>(
  table: Table<TData>,
  columns: Column<TData, unknown>[],
  storageKey?: string
): void {
  // Load preferences from localStorage on mount (only once)
  const hasLoadedPreferences = React.useRef(false)
  
  React.useEffect(() => {
    if (typeof window === 'undefined' || !storageKey || hasLoadedPreferences.current) return

    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const visibility: Record<string, boolean> = JSON.parse(saved)
        columns.forEach(column => {
          if (visibility[column.id] !== undefined) {
            column.toggleVisibility(visibility[column.id])
          }
        })
        hasLoadedPreferences.current = true
      }
    } catch (error) {
      console.warn('Failed to load column visibility preferences:', error)
    }
  }, [storageKey, columns]) // Only depend on storageKey and columns

  // Save preferences to localStorage when visibility changes
  React.useEffect(() => {
    if (typeof window === 'undefined' || !storageKey) return

    try {
      const visibility: Record<string, boolean> = {}
      columns.forEach(column => {
        visibility[column.id] = column.getIsVisible()
      })
      localStorage.setItem(storageKey, JSON.stringify(visibility))
    } catch (error) {
      console.warn('Failed to save column visibility preferences:', error)
    }
  }, [table.getState().columnVisibility, storageKey, columns])
}

