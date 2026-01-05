/**
 * Mobile Filter Dropdown Component
 * 
 * Hiển thị danh sách filters trong dropdown để chọn (như DataTableFacetedFilter)
 * Có nút "Xóa tất cả filters"
 */

"use client"

import * as React from "react"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DataTableFacetedFilter } from "../../data-table-faceted-filter"
import { clearAllFilters } from "../utils/toolbar-helpers"
import { Table } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { compactPaddingClass } from "@/shared/utils/spacing-styles"
import { mediumTextClass } from "@/shared/utils/text-styles"

interface MobileFilterDropdownProps<TData> {
  table: Table<TData>
  filters?: {
    columnId: string
    title: string
    options: { label: string; value: string }[]
  }[]
  customFilters?: React.ReactNode[]
}

export function MobileFilterDropdown<TData>({
  table,
  filters = [],
  customFilters = [],
}: MobileFilterDropdownProps<TData>) {
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const [isOpen, setIsOpen] = React.useState(false)
  
  const handleClearAll = React.useCallback(() => {
    clearAllFilters(table)
    setIsOpen(false)
  }, [table])

  const hasActiveFilters = table.getState().columnFilters.length > 0
  
  // ✅ Đảm bảo filters luôn là array
  const safeFilters = React.useMemo(() => Array.isArray(filters) ? filters : [], [filters])
  const safeCustomFilters = React.useMemo(() => Array.isArray(customFilters) ? customFilters : [], [customFilters])
  
  // Chỉ hiển thị nếu có filters (sau khi đã gọi tất cả hooks)
  const hasFilters = safeFilters.length > 0 || safeCustomFilters.length > 0
  if (!hasFilters) {
    return null
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 shrink-0"
          title="Bộ lọc"
        >
          <Filter className="h-4 w-4" />
          <span className="sr-only">Bộ lọc</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="start" 
        className="w-[280px] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className={cn(compactPaddingClass(), "border-b flex items-center justify-between")}>
            <p className={mediumTextClass()}>Bộ lọc</p>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleClearAll}
              >
                <X className="mr-1 h-3 w-3" />
                Xóa tất cả
              </Button>
            )}
          </div>

          {/* Filters List */}
          <ScrollArea className="max-h-[400px]">
            <div className={cn(compactPaddingClass(), "space-y-2 py-2")}>
              {/* Custom Filters */}
              {safeCustomFilters.map((filter, index) => {
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
                      <div key={`custom-filter-${index}-${config.columnId}`} className="space-y-1">
                        <FilterComponent
                          column={column}
                          {...(config.props || {})}
                        />
                      </div>
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

              {/* Standard Filters */}
              {safeFilters.map(filter => {
                const column = table.getColumn(filter.columnId)
                if (!column) return null
                
                return (
                  <div key={filter.columnId} className="space-y-1">
                    <DataTableFacetedFilter
                      column={column}
                      title={filter.title}
                      options={filter.options}
                    />
                  </div>
                )
              })}

              {safeFilters.length === 0 && safeCustomFilters.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Không có bộ lọc
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
