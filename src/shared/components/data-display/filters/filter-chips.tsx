"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import type { ColumnFiltersState } from "@tanstack/react-table"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { smallTextClass } from "@/shared/utils/text-styles"
import { filterGapClass } from "@/shared/utils/spacing-styles"
import { BADGE_TYPOGRAPHY } from "@/shared/constants/typography"

interface FilterChipsProps<TData> {
  table: Table<TData>
  onClearFilter?: (columnId: string) => void
  onClearSearch?: () => void
  className?: string
}

/**
 * Filter Chips Component
 * 
 * Displays active filters as removable chips/badges
 * Each chip shows the filter label and value, with an X button to remove it
 * 
 * @example
 * ```tsx
 * <FilterChips table={table} />
 * ```
 */
export function FilterChips<TData>({
  table,
  onClearFilter,
  onClearSearch,
  className,
}: FilterChipsProps<TData>) {
  const columnFilters = table.getState().columnFilters
  // ⚡ Note: Không hiển thị globalFilter (search) chip vì đã có nút "Bỏ lọc" bên cạnh search box
  
  // Get column definitions for labels
  const columns = table.getAllColumns()
  
  // Don't render if no filters active (chỉ check column filters, không check globalFilter)
  const hasFilters = columnFilters.length > 0
  if (!hasFilters) {
    return null
  }

  const handleRemoveFilter = (columnId: string) => {
    if (onClearFilter) {
      onClearFilter(columnId)
    } else {
      const column = table.getColumn(columnId)
      column?.setFilterValue(undefined)
    }
  }

  const handleRemoveSearch = () => {
    if (onClearSearch) {
      onClearSearch()
    } else {
      table.setGlobalFilter("")
    }
  }

  const getFilterLabel = (columnId: string): string => {
    const column = columns.find(col => col.id === columnId)
    const meta = column?.columnDef?.meta as { title?: string } | undefined
    return meta?.title || columnId
  }

  const formatFilterValue = (filter: { id: string; value: any }): string => {
    const { id, value } = filter
    
    // Handle array values (multi-select filters)
    if (Array.isArray(value)) {
      if (value.length === 0) return ""
      if (value.length <= 2) {
        return value.join(", ")
      }
      return `${value.length} đã chọn`
    }
    
    // Handle object values (range filters, etc.)
    if (typeof value === "object" && value !== null) {
      if ("from" in value && "to" in value) {
        return `${value.from} - ${value.to}`
      }
      return JSON.stringify(value)
    }
    
    // Handle string/number values
    return String(value)
  }

  return (
    <div className={cn("flex flex-wrap items-center min-w-0", filterGapClass(), className)}>
      {/* ⚡ Note: Không hiển thị globalFilter (search) chip - đã có nút "Bỏ lọc" bên cạnh search box */}
      
      {/* Column filter chips */}
      {columnFilters.map((filter) => {
        const filterValue = formatFilterValue(filter)
        if (!filterValue) return null

        const filterLabel = getFilterLabel(filter.id)

        return (
          <Badge
            key={filter.id}
            variant="secondary"
            className={cn("h-6 px-2 gap-1.5 shrink-0", smallTextClass(), BADGE_TYPOGRAPHY.default.fontWeight)}
          >
            <span className="truncate max-w-[150px]">
              {filterLabel}: {filterValue}
            </span>
            <button
              onClick={() => handleRemoveFilter(filter.id)}
              className="ml-0.5 rounded-full hover:bg-secondary-foreground/20 p-0.5 transition-colors"
              title={`Xóa bộ lọc ${filterLabel}`}
              aria-label={`Xóa bộ lọc ${filterLabel}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )
      })}
    </div>
  )
}

