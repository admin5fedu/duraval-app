/**
 * Toolbar Actions Component
 * 
 * Action buttons: Import, Export, Add
 */

"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Download, Plus, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { Table } from "@tanstack/react-table"
import { DataTableViewOptions } from "../../column-visibility"
import { SelectionToolbar } from "../../selection/selection-toolbar"
import type { BulkAction } from "../../selection/bulk-actions-menu"
import { getSelectedRowIds } from "../utils/toolbar-helpers"

interface ToolbarActionsProps<TData> {
  table: Table<TData>
  onImport?: () => void
  isImporting?: boolean
  onExport?: (exportInfo: {
    selectedRowIds: Set<string | number>
    filters: any[]
    search: string
    filteredCount: number
  }) => void
  onDeleteSelected?: () => void
  onAdd?: () => void
  addHref?: string
  exportOptions?: {
    onExportClick: () => void
  }
  bulkActions?: BulkAction<TData>[]
  variant?: "mobile" | "desktop"
}

export function ToolbarActions<TData>({
  table,
  onImport,
  isImporting = false,
  onExport,
  onDeleteSelected,
  onAdd,
  addHref,
  exportOptions,
  bulkActions,
  variant = "desktop",
}: ToolbarActionsProps<TData>) {
  const navigate = useNavigate()
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const hasSelection = selectedCount > 0

  const handleExport = React.useCallback(() => {
    if (exportOptions) {
      exportOptions.onExportClick()
    } else if (onExport) {
      const selectedRowIds = getSelectedRowIds(table)
      onExport({
        selectedRowIds,
        filters: table.getState().columnFilters,
        search: (table.getState().globalFilter as string) || '',
        filteredCount: table.getFilteredRowModel().rows.length,
      })
    }
  }, [table, onExport, exportOptions])

  return (
    <div className={cn(
      variant === "mobile" 
        ? "flex items-center justify-end gap-2 w-full max-w-full min-w-0"
        : "flex items-center gap-2 shrink-0 min-w-0"
    )}>
      {/* Selection toolbar */}
      <SelectionToolbar
        table={table}
        bulkActions={bulkActions}
        onDelete={onDeleteSelected}
        onExport={onExport || exportOptions ? handleExport : undefined}
        showCount={variant === "desktop" ? false : false}
      />

      {/* Column Options */}
      <div className="shrink-0">
        <DataTableViewOptions table={table} />
      </div>

      {/* Import */}
      {onImport && !hasSelection && (
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("h-8 shrink-0", variant === "desktop" && "hidden lg:flex")} 
          onClick={onImport}
          title="Nhập dữ liệu từ Excel"
          disabled={isImporting}
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              <span>Đang nhập...</span>
            </>
          ) : (
            <>
              <Upload className={cn("mr-1.5 h-3.5 w-3.5", variant === "desktop" && "lg:mr-2 lg:h-4 lg:w-4")} />
              <span>{variant === "desktop" ? "Nhập" : "Nhập"}</span>
            </>
          )}
        </Button>
      )}

      {/* Export */}
      {(onExport || exportOptions) && !hasSelection && (
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("h-8 shrink-0", variant === "desktop" && "hidden lg:flex")} 
          onClick={handleExport}
          title="Xuất dữ liệu"
        >
          <Download className={cn("mr-1.5 h-3.5 w-3.5", variant === "desktop" && "lg:mr-2 lg:h-4 lg:w-4")} />
          <span className={variant === "desktop" ? "hidden xl:inline" : ""}>Xuất</span>
        </Button>
      )}

      {/* Add */}
      {(onAdd || addHref) && (
        addHref ? (
          <Button 
            size="sm" 
            className={cn("h-8 shrink-0", variant === "desktop" && actionButtonClass())} 
            onClick={() => navigate(addHref)}
          >
            <Plus className={cn("mr-1.5 h-3.5 w-3.5", variant === "desktop" && "mr-2 h-4 w-4")} />
            <span>Thêm mới</span>
          </Button>
        ) : (
          <Button 
            size="sm" 
            className={cn("h-8 shrink-0", variant === "desktop" && actionButtonClass())} 
            onClick={onAdd}
          >
            <Plus className={cn("mr-1.5 h-3.5 w-3.5", variant === "desktop" && "mr-2 h-4 w-4")} />
            <span>Thêm mới</span>
          </Button>
        )
      )}
    </div>
  )
}

