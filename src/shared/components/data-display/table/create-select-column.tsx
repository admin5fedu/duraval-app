"use client"
import { type ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

/**
 * Creates a reusable select column for TanStack Table
 * 
 * This utility function creates a standardized checkbox column that can be used
 * across all modules to ensure consistency and reduce code duplication.
 * 
 * Features:
 * - Select All checkbox in header
 * - Individual row checkboxes
 * - Sticky left positioning
 * - Consistent styling and behavior
 * 
 * @example
 * ```tsx
 * const columns = [
 *   createSelectColumn<MyDataType>(),
 *   ...otherColumns
 * ]
 * ```
 */
export function createSelectColumn<TData>(): ColumnDef<TData> {
    return {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center w-full h-full">
                <Checkbox
                    id="table-select-all-checkbox"
                    name="table-select-all"
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    data-slot="checkbox"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div 
                className="flex items-center justify-center w-full h-full py-1"
                onClick={(e) => {
                    e.stopPropagation()
                }}
                onMouseDown={(e) => {
                    e.stopPropagation()
                }}
            >
                <Checkbox
                    id={`table-row-checkbox-${row.id}`}
                    name={`table-row-${row.id}`}
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => {
                        row.toggleSelected(!!value)
                    }}
                    aria-label="Select row"
                    data-slot="checkbox"
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                    onMouseDown={(e) => {
                        e.stopPropagation()
                    }}
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
        minSize: 40,
        maxSize: 40,
        meta: {
            stickyLeft: true,
            stickyLeftOffset: 0,
            minWidth: 40
        }
    }
}

