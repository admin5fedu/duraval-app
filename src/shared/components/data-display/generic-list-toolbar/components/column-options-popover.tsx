/**
 * Column Options Popover Component
 * 
 * Hiển thị column visibility options trong Popover
 * Sử dụng khi trigger từ DropdownMenuItem trong More menu
 */

"use client"

import * as React from "react"
import { Table, Column } from "@tanstack/react-table"
import { Search, RotateCcw, Columns3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { mediumTextClass, smallTextClass, bodyTextClass } from "@/shared/utils/text-styles"
import { standardPaddingClass } from "@/shared/utils/spacing-styles"

interface ColumnOptionsPopoverProps<TData> {
  table: Table<TData>
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Helper function to get display name for a column (needs table context)
function getColumnDisplayNameWithTable<TData>(column: Column<TData, unknown>, table: Table<TData>): string {
  const meta = column.columnDef.meta as { title?: string } | undefined
  if (meta?.title) {
    return meta.title
  }
  
  const header = column.columnDef.header
  if (typeof header === 'string') {
    return header
  }
  
  if (typeof header === 'function') {
    try {
      const result = header({ column, header: column.id as any, table })
      if (typeof result === 'string') {
        return result
      }
    } catch {
      // If header function throws, fall back to column.id
    }
  }
  
  return column.id
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function ColumnOptionsPopover<TData>({
  table,
  open,
  onOpenChange,
}: ColumnOptionsPopoverProps<TData>) {
  const [searchQuery, setSearchQuery] = React.useState("")
  
  // Get all hideable columns
  const hideableColumns = React.useMemo(() => {
    return table.getAllColumns()
      .filter(column => typeof column.accessorFn !== "undefined" && column.getCanHide())
      .sort((a, b) => {
        const aOrder = (a.columnDef.meta as { order?: number } | undefined)?.order ?? 999
        const bOrder = (b.columnDef.meta as { order?: number } | undefined)?.order ?? 999
        return aOrder - bOrder
      })
  }, [table])

  // Filter columns based on search query
  const filteredColumns = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return hideableColumns
    }
    const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return hideableColumns.filter(column => {
      const displayName = getColumnDisplayNameWithTable(column, table)
      const normalized = displayName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      return normalized.includes(query) || column.id.toLowerCase().includes(query)
    })
  }, [hideableColumns, searchQuery])

  // Reset search when popover closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery("")
    }
  }, [open])

  // Reset to default visibility
  const handleResetToDefault = () => {
    hideableColumns.forEach(column => {
      column.toggleVisibility(true)
    })
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverContent 
        align="end" 
        className="w-[280px] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className={cn(standardPaddingClass(), "space-y-2 border-b")}>
            <div className="flex items-center gap-2">
              <Columns3 className="h-4 w-4 text-muted-foreground" />
              <p className={mediumTextClass()}>Chọn cột hiển thị</p>
            </div>
            
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm cột..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("h-8 pl-7 pr-2", smallTextClass())}
              />
            </div>
            
            {/* Reset button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetToDefault}
              className={cn("w-full justify-start h-8 px-2", smallTextClass())}
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Mặc định
            </Button>
          </div>

          {/* Column list */}
          <ScrollArea className="h-[200px]">
            <div className="p-1">
              {filteredColumns.length === 0 ? (
                <div className={cn("px-2 py-6 text-center text-muted-foreground", smallTextClass())}>
                  {searchQuery ? "Không tìm thấy cột nào" : "Không có cột nào"}
                </div>
              ) : (
                filteredColumns.map((column) => {
                  const displayName = getColumnDisplayNameWithTable(column, table)
                  return (
                    <div
                      key={column.id}
                      className={cn(
                        "flex items-center space-x-2 rounded-md px-2 py-1.5 cursor-pointer hover:bg-accent",
                        column.getIsVisible() && "bg-accent"
                      )}
                      onClick={() => column.toggleVisibility(!column.getIsVisible())}
                    >
                      <Checkbox
                        id={`column-${column.id}`}
                        checked={column.getIsVisible()}
                        className="pointer-events-none"
                      />
                      <label
                        htmlFor={`column-${column.id}`}
                        className={cn("flex-1 cursor-pointer truncate", bodyTextClass())}
                      >
                        {displayName}
                      </label>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
