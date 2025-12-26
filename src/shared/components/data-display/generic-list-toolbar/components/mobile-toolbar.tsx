/**
 * Mobile Toolbar Layout Component
 */

"use client"

import * as React from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toolbarGapClass } from "@/shared/utils/toolbar-styles"
import { SearchInput } from "./search-input"
import { ToolbarActions } from "./toolbar-actions"
import type { UseSearchInputReturn } from "../hooks/use-search-input"
import { Table } from "@tanstack/react-table"
import type { BulkAction } from "../../selection/bulk-actions-menu"
import type { ColumnDef } from "@tanstack/react-table"

interface MobileToolbarProps<TData> {
  table: Table<TData>
  search: UseSearchInputReturn
  onBack: () => void
  placeholder?: string
  filterColumn?: string
  searchFields?: (keyof TData)[]
  module?: string
  enableSuggestions?: boolean
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
}

export function MobileToolbar<TData>({
  table,
  search,
  onBack,
  placeholder,
  filterColumn,
  searchFields,
  module,
  enableSuggestions,
  onImport,
  isImporting,
  onExport,
  onDeleteSelected,
  onAdd,
  addHref,
  exportOptions,
  bulkActions,
}: MobileToolbarProps<TData>) {
  return (
    <div className={cn("md:hidden flex flex-col w-full max-w-full min-w-0", toolbarGapClass())}>
      {/* Row 1: Search + View Options */}
      <div className={cn("flex items-center w-full max-w-full min-w-0", toolbarGapClass())}>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onBack} title="Quay lại">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <SearchInput
          search={search}
          placeholder={placeholder}
          filterColumn={filterColumn}
          searchFields={searchFields}
          module={module}
          enableSuggestions={enableSuggestions}
          data={table.getRowModel().rows.map(row => row.original) as Record<string, any>[]}
          variant="mobile"
          containerClassName="flex-1 min-w-0"
        />
      </div>

      {/* Row 2: Column Options, Import, Export, Add */}
      <ToolbarActions
        table={table}
        onImport={onImport}
        isImporting={isImporting}
        onExport={onExport}
        onDeleteSelected={onDeleteSelected}
        onAdd={onAdd}
        addHref={addHref}
        exportOptions={exportOptions}
        bulkActions={bulkActions}
        variant="mobile"
      />
    </div>
  )
}

