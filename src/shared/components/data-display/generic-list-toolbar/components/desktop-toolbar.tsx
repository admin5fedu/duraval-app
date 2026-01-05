/**
 * Desktop Toolbar Layout Component
 */

"use client"

import * as React from "react"
import { ChevronLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toolbarGapClass, toolbarContainerClass, toolbarButtonOutlineClass } from "@/shared/utils/toolbar-styles"
import { BADGE_TYPOGRAPHY } from "@/shared/constants/typography"
import { useFiltersStore } from "@/shared/stores/filters-store"
import { SearchInput } from "./search-input"
import { ToolbarActions } from "./toolbar-actions"
import { DataTableFacetedFilter } from "../../data-table-faceted-filter"
import type { UseSearchInputReturn } from "../hooks/use-search-input"
import { hasActiveFilters, getFilterCount, clearAllFilters } from "../utils/toolbar-helpers"
import { Table } from "@tanstack/react-table"
import type { BulkAction } from "../../selection/bulk-actions-menu"

interface DesktopToolbarProps<TData> {
  table: Table<TData>
  search: UseSearchInputReturn
  onBack: () => void
  placeholder?: string
  filterColumn?: string
  searchFields?: (keyof TData)[]
  module?: string
  enableSuggestions?: boolean
  filters?: {
    columnId: string
    title: string
    options: { label: string; value: string }[]
  }[]
  customFilters?: React.ReactNode[]
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

export function DesktopToolbar<TData>({
  table,
  search,
  onBack,
  placeholder,
  filterColumn,
  searchFields,
  module,
  enableSuggestions,
  filters = [],
  customFilters = [],
  onImport,
  isImporting,
  onExport,
  onDeleteSelected,
  onAdd,
  addHref,
  exportOptions,
  bulkActions,
}: DesktopToolbarProps<TData>) {
  const { clearModuleFilters, clearSearchQuery } = useFiltersStore()
  const isFiltered = hasActiveFilters(table)
  const filterCount = getFilterCount(table)

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
    <>
      <div className={cn("hidden md:flex flex-row items-center justify-between w-full max-w-full min-w-0", toolbarGapClass())}>
        <div className={cn("flex flex-1 items-center min-w-0 max-w-full", toolbarGapClass())}>
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
            variant="desktop"
            showKeyboardHint={true}
          />
          {isFiltered && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className={toolbarButtonOutlineClass("px-2.5 lg:px-3")}
            >
              <X className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1.5" />
              <span>Bỏ lọc</span>
              {filterCount > 1 && (
                <Badge variant="secondary" className={cn("ml-1.5 h-4 px-1", BADGE_TYPOGRAPHY.default.fontSize, BADGE_TYPOGRAPHY.default.fontWeight)}>
                  {filterCount}
                </Badge>
              )}
            </Button>
          )}
        </div>

        <div className={toolbarContainerClass("shrink-0 min-w-0")}>
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
            variant="desktop"
          />
        </div>
      </div>

      {/* Quick Filters Row - Chỉ hiển thị trên desktop */}
      {(filters.length > 0 || customFilters.length > 0) && (
        <div className="hidden md:flex items-center gap-2 overflow-x-auto w-full max-w-full min-w-0 pb-1 -mx-1 px-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded">
          {customFilters.map((filter, index) => {
            // Handle React element
            if (React.isValidElement(filter)) {
              const filterProps = filter.props as Record<string, any>
              if (filterProps.column === undefined) {
                const columnId = filterProps.columnId || filter.key
                if (columnId && typeof columnId === 'string') {
                  const column = table.getColumn(columnId)
                  if (column) {
                    return React.cloneElement(filter as React.ReactElement, {
                      key: `custom-filter-${index}`,
                      column
                    })
                  }
                }
              }
              return (
                <React.Fragment key={`custom-filter-${index}`}>
                  {filter}
                </React.Fragment>
              )
            }
            
            // Handle object config: {columnId, component, props}
            if (filter && typeof filter === 'object' && 'component' in filter && 'columnId' in filter) {
              const config = filter as { columnId: string; component: React.ComponentType<any>; props?: Record<string, any> }
              const column = table.getColumn(config.columnId)
              if (column && config.component) {
                const FilterComponent = config.component
                return (
                  <FilterComponent
                    key={`custom-filter-${index}-${config.columnId}`}
                    column={column}
                    {...(config.props || {})}
                  />
                )
              }
              return null
            }
            
            // Fallback: Don't render if it's not a valid React element or config object
            // This prevents "Objects are not valid as a React child" error
            if (filter && typeof filter === 'object') {
              console.warn('Invalid customFilter format:', filter)
              return null
            }
            
            return null
          })}
          {filters.map(filter => (
            table.getColumn(filter.columnId) && (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={table.getColumn(filter.columnId)}
                title={filter.title}
                options={filter.options}
              />
            )
          ))}
        </div>
      )}
    </>
  )
}

