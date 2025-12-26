/**
 * Generic List Toolbar - Refactored
 * 
 * Main component that orchestrates mobile/desktop layouts and all toolbar features
 */

"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/react-table"
import { ExportDialog } from "../export/export-dialog"
import type { BulkAction } from "../selection/bulk-actions-menu"
import { useSearchInput } from "./hooks/use-search-input"
import { useToolbarActions } from "./hooks/use-toolbar-actions"
import { MobileToolbar } from "./components/mobile-toolbar"
import { DesktopToolbar } from "./components/desktop-toolbar"
import { getSelectedRowIds } from "./utils/toolbar-helpers"

export interface GenericListToolbarProps<TData> {
  table: Table<TData>
  filterColumn?: string
  placeholder?: string
  onExport?: (exportInfo: {
    selectedRowIds: Set<string | number>
    filters: any[]
    search: string
    filteredCount: number
  }) => void
  onImport?: () => void
  isImporting?: boolean
  onDeleteSelected?: () => void
  onAdd?: () => void
  addHref?: string
  onBack?: () => void
  filters?: {
    columnId: string
    title: string
    options: { label: string; value: string }[]
  }[]
  customFilters?: React.ReactNode[]
  searchFields?: (keyof TData)[]
  module?: string
  enableSuggestions?: boolean
  bulkActions?: BulkAction<TData>[]
  exportOptions?: {
    columns: ColumnDef<TData>[]
    totalCount: number
    moduleName?: string
    getColumnTitle?: (columnId: string, columnDef: ColumnDef<TData> | undefined) => string
    getCellValue?: (row: TData, columnId: string, columnDef: ColumnDef<TData> | undefined) => any
  }
}

function GenericListToolbarComponent<TData>({
  table,
  filterColumn = "name",
  placeholder = "Tìm kiếm...",
  onExport,
  onImport,
  isImporting = false,
  onDeleteSelected,
  onAdd,
  addHref,
  onBack,
  filters = [],
  customFilters = [],
  searchFields,
  module,
  enableSuggestions = true,
  bulkActions,
  exportOptions,
}: GenericListToolbarProps<TData>) {
  // Hooks
  const search = useSearchInput({
    table,
    filterColumn,
    placeholder,
    searchFields,
    module,
    enableSuggestions,
  })

  const actions = useToolbarActions({
    table,
    onBack,
    onExport,
    exportOptions,
  })

  // Export dialog state
  const exportDialogOpen = actions.exportDialogOpen
  const setExportDialogOpen = actions.setExportDialogOpen

  return (
    <div className="flex flex-col space-y-2 py-2 md:py-2 w-full max-w-full min-w-0">
      {/* Mobile Layout */}
      <MobileToolbar
        table={table}
        search={search}
        onBack={actions.handleBack}
        placeholder={placeholder}
        filterColumn={filterColumn}
        searchFields={searchFields}
        module={module}
        enableSuggestions={enableSuggestions}
        onImport={onImport}
        isImporting={isImporting}
        onExport={onExport}
        onDeleteSelected={onDeleteSelected}
        onAdd={onAdd}
        addHref={addHref}
        exportOptions={exportOptions ? {
          onExportClick: () => setExportDialogOpen(true)
        } : undefined}
        bulkActions={bulkActions}
      />

      {/* Desktop Layout */}
      <DesktopToolbar
        table={table}
        search={search}
        onBack={actions.handleBack}
        placeholder={placeholder}
        filterColumn={filterColumn}
        searchFields={searchFields}
        module={module}
        enableSuggestions={enableSuggestions}
        filters={filters}
        customFilters={customFilters}
        onImport={onImport}
        isImporting={isImporting}
        onExport={onExport}
        onDeleteSelected={onDeleteSelected}
        onAdd={onAdd}
        addHref={addHref}
        exportOptions={exportOptions ? {
          onExportClick: () => setExportDialogOpen(true)
        } : undefined}
        bulkActions={bulkActions}
      />

      {/* Export Dialog */}
      {exportOptions && (
        <ExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          data={table.getRowModel().rows.map(row => row.original)}
          columns={exportOptions.columns}
          totalCount={exportOptions.totalCount}
          selectedRowIds={getSelectedRowIds(table)}
          currentFilters={table.getState().columnFilters}
          currentSearch={table.getState().globalFilter as string}
          moduleName={exportOptions.moduleName || module || 'export'}
          getColumnTitle={exportOptions.getColumnTitle}
          getCellValue={exportOptions.getCellValue}
        />
      )}
    </div>
  )
}

// Memoize component để tránh re-render không cần thiết
export const GenericListToolbar = React.memo(GenericListToolbarComponent) as typeof GenericListToolbarComponent

