"use client"

import * as React from "react"
import { flexRender } from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { TableRowWithHover } from "../../table/table-row-with-hover"
import { StickyTableHeaderCell } from "../../table/sticky-table-header-cell"
import { StickyTableCell } from "../../table/sticky-table-cell"
import { VirtualizedTableBody } from "../../table/virtualized-table-body"
import { getStickyCellStyles } from "@/hooks/use-sticky-cell-styles"
import type { GenericListTableSectionProps } from "../types"

const DEFAULT_MAX_COLUMN_WIDTH = 360

/**
 * Table section component for GenericListView
 * Renders the desktop table with sticky headers and virtualization support
 */
export function GenericListTableSection<TData, TValue>({
    table,
    columns,
    filteredRows,
    onRowClick,
    onRowHover,
    handleRowSelect,
    handleRowPointerDown,
    handleRowPointerUp,
    isSelectionMode,
    enableRangeSelection,
    rangeStartIndex,
    rangeEndIndex,
    enableVirtualization,
    virtualRowHeight,
}: GenericListTableSectionProps<TData, TValue>) {
    const headerGroups = table.getHeaderGroups()

    return (
        <div className="hidden md:flex rounded-md border flex-1 overflow-hidden flex-col w-full max-w-full min-w-0 isolate mt-2">
            <div className="flex-1 overflow-auto w-full max-w-full min-w-0 relative">
                <Table containerClassName="w-full max-w-full min-w-0">
                    <TableHeader
                        className="sticky top-0 bg-background shadow-sm"
                        style={{
                            boxShadow:
                                "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                            zIndex: 120,
                        }}
                    >
                        {headerGroups.map((headerGroup: any) => (
                            <TableRow
                                key={headerGroup.id}
                                className="hover:bg-transparent"
                            >
                                {headerGroup.headers.map((header: any) => {
                                    const meta = header.column
                                        .columnDef.meta as
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
                                        Không tìm thấy kết quả.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    )}
                </Table>
            </div>
        </div>
    )
}

