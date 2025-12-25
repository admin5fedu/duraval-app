"use client"

import * as React from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { TableBody } from "@/components/ui/table"
import { Table } from "@tanstack/react-table"
import { flexRender } from "@tanstack/react-table"
import { TableRowWithHover } from "./table-row-with-hover"
import { StickyTableCell } from "./sticky-table-cell"
import { getStickyCellStyles } from "@/hooks/use-sticky-cell-styles"

interface VirtualizedTableBodyProps<TData> {
    table: Table<TData>
    onRowClick?: (row: TData) => void
    onRowHover?: (row: TData) => void
    onRowSelect?: (rowId: string, event: React.MouseEvent | React.PointerEvent) => void
    onRowPointerDown?: (rowId: string, event: React.PointerEvent) => void
    onRowPointerUp?: (rowId: string, event: React.PointerEvent) => void
    isSelectionMode?: boolean
    enableRangeSelection?: boolean
    rangeStartIndex?: number | null
    rangeEndIndex?: number | null
    virtualRowHeight?: number
}

/**
 * Virtualized Table Body Component
 * 
 * Sử dụng @tanstack/react-virtual để render chỉ các rows visible
 * Giảm DOM nodes và cải thiện performance cho large datasets (> 100 rows)
 */
export function VirtualizedTableBody<TData>({
    table,
    onRowClick,
    onRowHover,
    onRowSelect,
    onRowPointerDown,
    onRowPointerUp,
    isSelectionMode = false,
    enableRangeSelection = true,
    rangeStartIndex = null,
    rangeEndIndex = null,
    virtualRowHeight = 50,
}: VirtualizedTableBodyProps<TData>) {
    const { rows } = table.getRowModel()
    const parentRef = React.useRef<HTMLDivElement>(null)

    // Virtual scrolling configuration
    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => virtualRowHeight,
        overscan: 5, // Render 5 extra rows above and below viewport
    })

    // Calculate if a row is in range for visual highlight
    const getIsInRange = React.useCallback((rowIndex: number) => {
        if (!enableRangeSelection || rangeStartIndex === null || rangeEndIndex === null) {
            return false
        }
        const start = Math.min(rangeStartIndex, rangeEndIndex)
        const end = Math.max(rangeStartIndex, rangeEndIndex)
        return rowIndex >= start && rowIndex <= end
    }, [enableRangeSelection, rangeStartIndex, rangeEndIndex])

    return (
        <div
            ref={parentRef}
            className="h-full overflow-auto"
            style={{
                contain: "strict", // Performance optimization
            }}
        >
            <TableBody
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                }}
            >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index]
                    if (!row) return null

                    const isSelected = row.getIsSelected()
                    const isInRange = getIsInRange(virtualRow.index)

                    return (
                        <TableRowWithHover
                            key={row.id}
                            rowId={row.id}
                            isSelected={isSelected}
                            onRowClick={() => onRowClick?.(row.original)}
                            onRowHover={() => onRowHover?.(row.original)}
                            onRowSelect={onRowSelect}
                            onRowPointerDown={onRowPointerDown}
                            onRowPointerUp={onRowPointerUp}
                            isSelectionMode={isSelectionMode}
                            isInRange={isInRange}
                            showRangeHighlight={enableRangeSelection && rangeStartIndex !== null && rangeEndIndex !== null}
                            renderCells={(bgColor) =>
                                row.getVisibleCells().map((cell) => {
                                    const meta = cell.column.columnDef.meta as {
                                        stickyLeft?: boolean
                                        stickyLeftOffset?: number
                                        stickyRight?: boolean
                                        minWidth?: number
                                        maxWidth?: number
                                    } | undefined

                                    const minWidth = meta?.minWidth || cell.column.getSize()
                                    const { cellStyle, isSticky } = getStickyCellStyles(
                                        meta,
                                        minWidth,
                                        cell.column.getSize()
                                    )

                                    return (
                                        <StickyTableCell
                                            key={cell.id}
                                            isSticky={isSticky}
                                            bgColor={bgColor || ""} // ✅ Truyền bgColor để hover effect hoạt động (màu xám nhạt)
                                            style={{
                                                ...cellStyle,
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: cell.column.getSize(),
                                                height: `${virtualRow.size}px`,
                                                transform: `translateY(${virtualRow.start}px)`,
                                            }}
                                        >
                                            <div className="max-w-[360px] truncate">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </div>
                                        </StickyTableCell>
                                    )
                                })
                            }
                        />
                    )
                })}
            </TableBody>
        </div>
    )
}

