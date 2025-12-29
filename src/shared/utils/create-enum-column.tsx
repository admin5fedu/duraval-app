/**
 * Create Enum Column Helper
 * 
 * Utility to create column definitions for enum fields with automatic
 * color detection and rendering
 */

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { EnumColorConfig, registerEnumColors } from "./enum-color-registry"
import { EnumCellRenderer } from "./enum-cell-renderer"
import { autoDetectAndRegisterEnum } from "./enum-detection"

/**
 * Options for creating an enum column
 */
export interface CreateEnumColumnOptions {
  accessorKey: string
  header: string | ((props: any) => React.ReactNode)
  size?: number
  minSize?: number
  filterFn?: (row: any, id: string, value: any) => boolean
  meta?: {
    title?: string
    order?: number
    minWidth?: number
    enumConfig?: EnumColorConfig // Optional explicit enum config
  }
  enableSorting?: boolean
  enableFiltering?: boolean
}

/**
 * Create a column definition for an enum field
 * Automatically detects enum and applies color rendering
 * 
 * @example
 * ```ts
 * createEnumColumn<NhanSu>({
 *   accessorKey: "tinh_trang",
 *   header: "Tình Trạng",
 *   size: 130,
 *   meta: {
 *     title: "Tình Trạng",
 *     order: 7,
 *   }
 * })
 * ```
 */
export function createEnumColumn<TData>(
  options: CreateEnumColumnOptions
): ColumnDef<TData> {
  const {
    accessorKey,
    header,
    size,
    minSize,
    filterFn,
    meta,
    enableSorting = true,
  } = options

  // Auto-register enum if explicit config provided
  if (meta?.enumConfig) {
    registerEnumColors(accessorKey, meta.enumConfig)
  } else {
    // Try auto-detection
    autoDetectAndRegisterEnum({
      fieldKey: accessorKey,
      columnDef: {
        meta: meta as any,
      } as ColumnDef<TData>,
    })
  }

  const columnDef: ColumnDef<TData> = {
    accessorKey,
    header,
    size: size || 150,
    minSize: minSize || 120,
    enableSorting,
    filterFn: filterFn || ((row, id, value) => {
      return value.includes(row.getValue(id))
    }),
    cell: ({ row, column }) => {
      const value = row.getValue(accessorKey) as string | number | boolean | null | undefined
      return (
        <EnumCellRenderer<TData>
          value={value}
          fieldKey={accessorKey}
          row={row.original}
          columnDef={column.columnDef}
        />
      )
    },
    meta: {
      ...meta,
      enumConfig: meta?.enumConfig, // Preserve enum config in meta
    },
  }

  return columnDef
}

/**
 * Create multiple enum columns at once
 */
export function createEnumColumns<TData>(
  columns: CreateEnumColumnOptions[]
): ColumnDef<TData>[] {
  return columns.map(col => createEnumColumn(col))
}
