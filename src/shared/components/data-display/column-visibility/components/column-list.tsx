/**
 * Column List Component
 */

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { bodyTextClass, smallTextClass } from "@/shared/utils/text-styles"
import { getColumnDisplayName } from "../utils/column-helpers"

interface ColumnListProps<TData> {
  columns: Column<TData, unknown>[]
  emptyMessage?: string
  emptySearchMessage?: string
  hasSearchQuery: boolean
}

export function ColumnList<TData>({
  columns,
  emptyMessage = "Không có cột nào",
  emptySearchMessage = "Không tìm thấy cột nào",
  hasSearchQuery,
}: ColumnListProps<TData>) {
  if (columns.length === 0) {
    return (
      <div className={cn("px-2 py-6 text-center text-muted-foreground", smallTextClass())}>
        {hasSearchQuery ? emptySearchMessage : emptyMessage}
      </div>
    )
  }

  return (
    <>
      {columns.map((column) => {
        const displayName = getColumnDisplayName(column)
        return (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
            onSelect={(e) => {
              e.preventDefault() // Prevent dropdown from closing when clicking checkbox
            }}
            className={cn("px-2 py-1.5 cursor-pointer pl-7", bodyTextClass())}
          >
            <span className="truncate">{displayName}</span>
          </DropdownMenuCheckboxItem>
        )
      })}
    </>
  )
}

