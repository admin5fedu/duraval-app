/**
 * Mobile Toolbar Layout Component
 * 
 * Layout:
 * - Row 1: Back button + Search input
 * - Row 2: Filter icon + More menu (Nhập, Xuất, Tùy chọn cột) + Thêm button
 * - Selection Toolbar: Thay thế Row 2 khi có selection
 */

"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Plus, MoreVertical, Upload, Download, Loader2, Columns3, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { toolbarGapClass, actionButtonClass } from "@/shared/utils/toolbar-styles"
import { SearchInput } from "./search-input"
import { MobileFilterDropdown } from "./mobile-filter-dropdown"
import { SelectionToolbar } from "../../selection/selection-toolbar"
import { ColumnOptionsPopover } from "./column-options-popover"
import type { UseSearchInputReturn } from "../hooks/use-search-input"
import { Table } from "@tanstack/react-table"
import type { BulkAction } from "../../selection/bulk-actions-menu"
import { getSelectedRowIds, hasActiveFilters, clearAllFilters } from "../utils/toolbar-helpers"
import { useFiltersStore } from "@/shared/stores/filters-store"

// Component để trigger ColumnOptionsPopover từ DropdownMenuItem
function ColumnOptionsMenuItem<TData>({ table }: { table: Table<TData> }) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault()
          setIsOpen(true)
        }}
      >
        <Columns3 className="mr-2 h-4 w-4" />
        Tùy chọn cột
      </DropdownMenuItem>
      <ColumnOptionsPopover
        table={table}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  )
}

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
  filters?: {
    columnId: string
    title: string
    options: { label: string; value: string }[]
  }[]
  customFilters?: React.ReactNode[]
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
  filters = [],
  customFilters = [],
}: MobileToolbarProps<TData>) {
  const navigate = useNavigate()
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const hasSelection = selectedCount > 0
  const { clearModuleFilters, clearSearchQuery } = useFiltersStore()
  const isFiltered = hasActiveFilters(table)

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

  const handleAdd = React.useCallback(() => {
    if (addHref) {
      navigate(addHref)
    } else if (onAdd) {
      onAdd()
    }
  }, [addHref, onAdd, navigate])

  const handleClearFilters = React.useCallback(() => {
    clearAllFilters(table, () => {
      search.setInputValue("")
    })
    
    if (module) {
      clearModuleFilters(module)
      clearSearchQuery(module)
    }
  }, [table, module, search, clearModuleFilters, clearSearchQuery])

  return (
    <div className={cn("md:hidden flex flex-col w-full max-w-full min-w-0 gap-2.5")}>
      {/* Row 1: Back + Search */}
      <div className={cn("flex items-center w-full max-w-full min-w-0 gap-2")}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 shrink-0" 
          onClick={onBack} 
          title="Quay lại"
        >
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

      {/* Row 2: Filter + Bỏ lọc (nếu có filter) + More + Thêm (hoặc Selection Toolbar nếu có selection) */}
      {hasSelection ? (
        <SelectionToolbar
          table={table}
          bulkActions={bulkActions}
          onDelete={onDeleteSelected}
          onExport={onExport || exportOptions ? handleExport : undefined}
          showCount={true}
        />
      ) : (
        <div className={cn("flex items-center justify-between w-full max-w-full min-w-0 gap-2")}>
          {/* Left: Filter + Bỏ lọc (nếu có filter active) */}
          <div className="flex items-center gap-2">
            <MobileFilterDropdown
              table={table}
              filters={filters}
              customFilters={customFilters}
            />
            
            {/* Nút Bỏ lọc - chỉ hiển thị khi có filter active */}
            {isFiltered && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 shrink-0"
                onClick={handleClearFilters}
                title="Bỏ lọc"
              >
                <X className="mr-1.5 h-4 w-4" />
                <span>Bỏ lọc</span>
              </Button>
            )}
          </div>

          {/* Right: More Menu + Thêm */}
          <div className="flex items-center gap-2 shrink-0">
            {/* More Menu - Luôn hiển thị nếu có ít nhất 1 trong: Import, Export, hoặc luôn có Tùy chọn cột */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 w-9 p-0 shrink-0"
                  title="Thêm tùy chọn"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Thêm tùy chọn</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* Nhập */}
                {onImport && (
                  <DropdownMenuItem
                    onClick={onImport}
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang nhập...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Nhập
                      </>
                    )}
                  </DropdownMenuItem>
                )}

                {/* Xuất */}
                {(onExport || exportOptions) && (
                  <DropdownMenuItem onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Xuất
                  </DropdownMenuItem>
                )}

                {/* Separator - Chỉ hiển thị nếu có Nhập hoặc Xuất */}
                {(onImport || onExport || exportOptions) && (
                  <DropdownMenuSeparator />
                )}

                {/* Tùy chọn cột - Luôn có trong More menu */}
                <ColumnOptionsMenuItem table={table} />
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Thêm Button */}
            {(onAdd || addHref) && (
              <Button 
                size="sm" 
                className={cn("h-9 shrink-0", actionButtonClass())}
                onClick={handleAdd}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                <span>Thêm</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

