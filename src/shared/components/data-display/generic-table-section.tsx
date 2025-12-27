"use client"

import * as React from "react"
import { flexRender, type Table as TanstackTable } from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TableRowWithHover } from "./table/table-row-with-hover"
import { StickyTableHeaderCell } from "./table/sticky-table-header-cell"
import { StickyTableCell } from "./table/sticky-table-cell"
import { VirtualizedTableBody } from "./table/virtualized-table-body"
import { getStickyCellStyles } from "@/hooks/use-sticky-cell-styles"
import { cn } from "@/lib/utils"

const DEFAULT_MAX_COLUMN_WIDTH = 360

interface GenericTableSectionProps<TData> {
    table: TanstackTable<TData>
    columns: any[]
    filteredRows: any[]
    onRowClick?: (row: TData) => void
    onRowHover?: (row: TData) => void
    handleRowSelect?: (rowId: string, event: React.MouseEvent | React.PointerEvent) => void
    handleRowPointerDown?: (rowId: string, event: React.PointerEvent) => void
    handleRowPointerUp?: (rowId: string, event: React.PointerEvent) => void
    isSelectionMode?: boolean
    enableRangeSelection?: boolean
    rangeStartIndex?: number | null
    rangeEndIndex?: number | null
    enableVirtualization?: boolean
    virtualRowHeight?: number
    /** Max height cho scroll container. Default: "400px" */
    maxHeight?: string
    /** Enable sticky header. Default: true */
    enableStickyHeader?: boolean
    /** Enable horizontal scroll. Default: true */
    enableHorizontalScroll?: boolean
    /** Custom className */
    className?: string
    /** Empty state message */
    emptyMessage?: string
}

/**
 * Generic Table Section Component
 * 
 * Reusable table component với:
 * - Sticky header
 * - Scrollable body (vertical & horizontal)
 * - Sticky columns support
 * - Virtualization support
 * - Không có pagination footer (dùng cho embedded lists)
 * 
 * @example
 * ```tsx
 * <GenericTableSection
 *   table={table}
 *   columns={columns}
 *   filteredRows={rows}
 *   maxHeight="400px"
 *   onRowClick={(row) => handleClick(row)}
 * />
 * ```
 */
export function GenericTableSection<TData>({
    table,
    columns,
    filteredRows,
    onRowClick,
    onRowHover,
    handleRowSelect,
    handleRowPointerDown,
    handleRowPointerUp,
    isSelectionMode = false,
    enableRangeSelection = true,
    rangeStartIndex = null,
    rangeEndIndex = null,
    enableVirtualization = false,
    virtualRowHeight = 50,
    maxHeight = "400px",
    enableStickyHeader = true,
    enableHorizontalScroll = true,
    className,
    emptyMessage = "Không tìm thấy kết quả.",
}: GenericTableSectionProps<TData>) {
    const headerGroups = table.getHeaderGroups()

    return (
        <div className={cn(
            "rounded-md border flex flex-col w-full max-w-full min-w-0 overflow-hidden",
            className
        )}>
            {/* ✅ Table Header - Sticky */}
            <div className="flex-shrink-0 border-b bg-background">
                <div className={cn(
                    "overflow-x-auto",
                    !enableHorizontalScroll && "overflow-x-hidden"
                )}>
                    <Table containerClassName="w-full max-w-full min-w-0">
                        <TableHeader
                            className={cn(
                                "bg-background",
                                enableStickyHeader && "sticky top-0 z-20 shadow-sm"
                            )}
                            style={enableStickyHeader ? {
                                boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                            } : undefined}
                        >
                            {headerGroups.map((headerGroup: any) => (
                                <TableRow
                                    key={headerGroup.id}
                                    className="hover:bg-transparent"
                                >
                                    {headerGroup.headers.map((header: any) => {
                                        const meta = header.column.columnDef.meta as
                                            | {
                                                  stickyLeft?: boolean
                                                  stickyLeftOffset?: number
                                                  stickyRight?: boolean
                                                  minWidth?: number
                                                  maxWidth?: number
                                              }
                                            | undefined

                                        const isStickyLeft = meta?.stickyLeft
                                        const isStickyRight = meta?.stickyRight

                                        const rawWidth = header.getSize()
                                        const maxWidth =
                                            meta?.maxWidth ?? DEFAULT_MAX_COLUMN_WIDTH
                                        const minWidth = Math.min(
                                            meta?.minWidth || rawWidth,
                                            maxWidth
                                        )
                                        const width = Math.min(rawWidth, maxWidth)

                                        return (
                                            <StickyTableHeaderCell
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                isStickyLeft={isStickyLeft}
                                                isStickyRight={isStickyRight}
                                                stickyLeftOffset={meta?.stickyLeftOffset}
                                                minWidth={minWidth}
                                                width={width}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext()
                                                      )}
                                            </StickyTableHeaderCell>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                    </Table>
                </div>
            </div>

            {/* ✅ Table Body - Scrollable */}
            <ScrollArea
                className={cn(
                    "flex-1 w-full",
                    enableHorizontalScroll && "overflow-x-auto"
                )}
                style={{
                    maxHeight,
                }}
            >
                <div className={cn(
                    enableHorizontalScroll && "min-w-full"
                )}>
                    <Table containerClassName="w-full max-w-full min-w-0">
                        {enableVirtualization && filteredRows.length > 100 ? (
                            <VirtualizedTableBody
                                table={table}
                                onRowClick={onRowClick}
                                onRowHover={onRowHover}
                                onRowSelect={handleRowSelect}
                                onRowPointerDown={handleRowPointerDown}
                                onRowPointerUp={handleRowPointerUp}
                                isSelectionMode={isSelectionMode}
                                enableRangeSelection={enableRangeSelection}
                                rangeStartIndex={rangeStartIndex}
                                rangeEndIndex={rangeEndIndex}
                                virtualRowHeight={virtualRowHeight}
                            />
                        ) : (
                            <TableBody>
                                {filteredRows?.length ? (
                                    filteredRows.map((row: any, rowIndex: number) => {
                                        const isSelected = row.getIsSelected()

                                        const isInRange =
                                            rangeStartIndex !== null &&
                                            rangeEndIndex !== null &&
                                            (() => {
                                                const start = Math.min(
                                                    rangeStartIndex,
                                                    rangeEndIndex
                                                )
                                                const end = Math.max(
                                                    rangeStartIndex,
                                                    rangeEndIndex
                                                )
                                                return (
                                                    rowIndex >= start &&
                                                    rowIndex <= end
                                                )
                                            })()

                                        return (
                                            <TableRowWithHover
                                                key={row.id}
                                                rowId={row.id}
                                                isSelected={isSelected}
                                                onRowClick={() =>
                                                    onRowClick?.(row.original)
                                                }
                                                onRowHover={() =>
                                                    onRowHover?.(row.original)
                                                }
                                                onRowSelect={handleRowSelect}
                                                onRowPointerDown={
                                                    handleRowPointerDown
                                                }
                                                onRowPointerUp={handleRowPointerUp}
                                                isSelectionMode={isSelectionMode}
                                                isInRange={isInRange}
                                                showRangeHighlight={
                                                    enableRangeSelection &&
                                                    rangeStartIndex !== null &&
                                                    rangeEndIndex !== null
                                                }
                                                renderCells={(bgColor) =>
                                                    row
                                                        .getVisibleCells()
                                                        .map((cell: any) => {
                                                            const meta = cell.column
                                                                .columnDef
                                                                .meta as
                                                                | {
                                                                      stickyLeft?: boolean
                                                                      stickyLeftOffset?: number
                                                                      stickyRight?: boolean
                                                                      minWidth?: number
                                                                      maxWidth?: number
                                                                  }
                                                                | undefined

                                                            const rawWidth =
                                                                cell.column.getSize()
                                                            const maxWidth =
                                                                meta?.maxWidth ??
                                                                DEFAULT_MAX_COLUMN_WIDTH
                                                            const minWidth = Math.min(
                                                                meta?.minWidth ||
                                                                    rawWidth,
                                                                maxWidth
                                                            )
                                                            const width = Math.min(
                                                                rawWidth,
                                                                maxWidth
                                                            )

                                                            const {
                                                                cellStyle,
                                                                isSticky,
                                                            } = getStickyCellStyles(
                                                                meta,
                                                                minWidth,
                                                                width
                                                            )

                                                            return (
                                                                <StickyTableCell
                                                                    key={cell.id}
                                                                    isSticky={
                                                                        isSticky
                                                                    }
                                                                    bgColor={
                                                                        bgColor ||
                                                                        ""
                                                                    }
                                                                    style={
                                                                        cellStyle
                                                                    }
                                                                >
                                                                    <div className="max-w-[360px] truncate">
                                                                        {flexRender(
                                                                            cell
                                                                                .column
                                                                                .columnDef
                                                                                .cell,
                                                                            cell.getContext()
                                                                        )}
                                                                    </div>
                                                                </StickyTableCell>
                                                            )
                                                        })
                                                }
                                            />
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            {emptyMessage}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        )}
                    </Table>
                </div>
            </ScrollArea>
        </div>
    )
}

