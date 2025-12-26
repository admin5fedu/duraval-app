/**
 * Enum Cell Renderer for List Views
 * 
 * Generic cell renderer component for enum columns in data tables
 */

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { getEnumBadgeClass, hasEnumColorConfig } from "./enum-color-registry"
import { isEnumField, autoDetectAndRegisterEnum } from "./enum-detection"
import { ColumnDef } from "@tanstack/react-table"
import { EnumColorConfig } from "./enum-color-registry"

/**
 * Props for EnumCellRenderer
 */
export interface EnumCellRendererProps<TData> {
  value: string | number | boolean | null | undefined
  fieldKey: string
  row: TData
  columnDef?: ColumnDef<TData>
}

/**
 * Render enum value as a colored badge in table cells
 * 
 * @example
 * ```tsx
 * {
 *   accessorKey: "tinh_trang",
 *   cell: ({ row, column }) => (
 *     <EnumCellRenderer
 *       value={row.getValue("tinh_trang")}
 *       fieldKey="tinh_trang"
 *       row={row.original}
 *       columnDef={column.columnDef}
 *     />
 *   )
 * }
 * ```
 */
export function EnumCellRenderer<TData>({
  value,
  fieldKey,
  row,
  columnDef,
}: EnumCellRendererProps<TData>): React.ReactNode {
  // Handle null/undefined/empty
  if (value === null || value === undefined || value === "") {
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground border-transparent">
        -
      </Badge>
    )
  }

  const valueStr = String(value)

  // Auto-detect and register enum if not already registered
  if (!hasEnumColorConfig(fieldKey)) {
    const meta = columnDef?.meta as { enumConfig?: EnumColorConfig } | undefined
    autoDetectAndRegisterEnum({
      fieldKey,
      value,
      columnDef,
      explicitEnumConfig: meta?.enumConfig,
    })
  }

  // Get color class from registry
  const className = getEnumBadgeClass(fieldKey, value)

  return (
    <Badge variant="outline" className={className}>
      {valueStr}
    </Badge>
  )
}

/**
 * Helper to check if a column should use enum rendering
 */
export function shouldUseEnumRenderer<TData>(
  fieldKey: string,
  columnDef?: ColumnDef<TData>
): boolean {
  return isEnumField({
    fieldKey,
    columnDef,
  })
}

