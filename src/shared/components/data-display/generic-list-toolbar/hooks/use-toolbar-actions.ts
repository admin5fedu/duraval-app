/**
 * useToolbarActions Hook
 * 
 * Manages toolbar actions: back, export, import, add
 */

import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Table } from "@tanstack/react-table"
import { ColumnDef } from "@tanstack/react-table"
import { getParentRouteFromBreadcrumb } from "@/lib/utils"
import { getSelectedRowIds } from "../utils/toolbar-helpers"

export interface UseToolbarActionsOptions<TData> {
  table: Table<TData>
  onBack?: () => void
  onExport?: (exportInfo: {
    selectedRowIds: Set<string | number>
    filters: any[]
    search: string
    filteredCount: number
  }) => void
  exportOptions?: {
    columns: ColumnDef<TData>[]
    totalCount: number
    moduleName?: string
    getColumnTitle?: (columnId: string, columnDef: ColumnDef<TData> | undefined) => string
    getCellValue?: (row: TData, columnId: string, columnDef: ColumnDef<TData> | undefined) => any
  }
}

export interface UseToolbarActionsReturn {
  handleBack: () => void
  handleExportClick: () => void
  exportDialogOpen: boolean
  setExportDialogOpen: (open: boolean) => void
  getExportData: () => {
    selectedRowIds: Set<string | number>
    filters: any[]
    search: string
    filteredCount: number
  }
}

export function useToolbarActions<TData>({
  table,
  onBack,
  onExport,
  exportOptions,
}: UseToolbarActionsOptions<TData>): UseToolbarActionsReturn {
  const navigate = useNavigate()
  const location = useLocation()
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false)

  const handleBack = React.useCallback(() => {
    if (onBack) {
      onBack()
      return
    }
    
    const parentRoute = getParentRouteFromBreadcrumb(location.pathname)
    if (parentRoute) {
      navigate(parentRoute)
      return
    }
    
    navigate(-1)
  }, [onBack, location.pathname, navigate])

  const getExportData = React.useCallback(() => {
    const selectedRowIds = getSelectedRowIds(table)
    return {
      selectedRowIds,
      filters: table.getState().columnFilters,
      search: (table.getState().globalFilter as string) || '',
      filteredCount: table.getFilteredRowModel().rows.length,
    }
  }, [table])

  const handleExportClick = React.useCallback(() => {
    if (exportOptions) {
      setExportDialogOpen(true)
    } else if (onExport) {
      onExport(getExportData())
    }
  }, [exportOptions, onExport, getExportData])

  return {
    handleBack,
    handleExportClick,
    exportDialogOpen,
    setExportDialogOpen,
    getExportData,
  }
}

