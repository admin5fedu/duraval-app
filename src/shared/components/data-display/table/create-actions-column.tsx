"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CreateActionsColumnOptions<TData> {
  /**
   * Function to handle edit action
   * @param row - The row data
   */
  onEdit?: (row: TData) => void
  
  /**
   * Function to handle delete action
   * @param row - The row data
   */
  onDelete?: (row: TData) => void
  
  /**
   * Custom actions render function
   * @param row - The row data
   */
  renderActions?: (row: TData) => React.ReactNode
  
  /**
   * Column header text (default: "Thao tác")
   */
  header?: string
  
  /**
   * Column size (default: 120)
   */
  size?: number
  
  /**
   * Column min size (default: 100)
   */
  minSize?: number
  
  /**
   * Whether the column should be sticky on the right (default: true)
   */
  stickyRight?: boolean
}

/**
 * Creates a standardized actions column for table with Edit and Delete buttons
 * 
 * @example
 * ```tsx
 * const columns = [
 *   ...otherColumns,
 *   createActionsColumn<MyType>({
 *     onEdit: (row) => navigate(`/edit/${row.id}`),
 *     onDelete: (row) => handleDelete(row.id),
 *   })
 * ]
 * ```
 */
export function createActionsColumn<TData>({
  onEdit,
  onDelete,
  renderActions,
  header = "Thao tác",
  size = 120,
  minSize = 100,
  stickyRight = true,
}: CreateActionsColumnOptions<TData> = {}): ColumnDef<TData> {
  return {
    id: "actions",
    header: () => <div className="text-right pr-4">{header}</div>,
    cell: ({ row }) => {
      // Use custom render if provided
      if (renderActions) {
        return (
          <div className="flex items-center gap-2 justify-end pr-4 min-w-[100px]">
            {renderActions(row.original)}
          </div>
        )
      }

      // Default actions
      return (
        <div className="flex items-center gap-2 justify-end pr-4 min-w-[100px]">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-blue-600 shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(row.original)
              }}
              title="Sửa"
            >
              <span className="sr-only">Sửa</span>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(row.original)
              }}
              title="Xóa"
            >
              <span className="sr-only">Xóa</span>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
    size,
    minSize,
    meta: {
      title: header,
      stickyRight,
      minWidth: minSize,
    },
  }
}

