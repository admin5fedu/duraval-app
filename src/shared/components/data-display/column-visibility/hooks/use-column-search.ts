/**
 * useColumnSearch Hook
 * 
 * Manages search/filter functionality for columns
 */

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { getColumnDisplayName } from "../utils/column-helpers"

export interface UseColumnSearchReturn<TData> {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredColumns: Column<TData, unknown>[]
}

/**
 * Hook to manage column search/filter
 */
export function useColumnSearch<TData>(
  columns: Column<TData, unknown>[]
): UseColumnSearchReturn<TData> {
  const [searchQuery, setSearchQuery] = React.useState("")

  // Filter columns based on search query
  const filteredColumns = React.useMemo(() => {
    if (!searchQuery.trim()) return columns
    
    const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return columns.filter(column => {
      const displayName = getColumnDisplayName(column)
      const normalized = displayName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      return normalized.includes(query)
    })
  }, [columns, searchQuery])

  return {
    searchQuery,
    setSearchQuery,
    filteredColumns,
  }
}

