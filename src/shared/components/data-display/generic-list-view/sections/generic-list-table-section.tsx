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
import { GenericListFooterSection } from "./generic-list-footer-section"
import { useElementHeight } from "@/shared/hooks/use-element-height"
import { LAYOUT_CONSTANTS } from "@/shared/constants"
import type { GenericListTableSectionProps } from "../types"

const DEFAULT_MAX_COLUMN_WIDTH = 360

/**
 * Table section component for GenericListView
 * Renders the desktop table with sticky headers, scrollable body, and sticky footer
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
    selectedRowCount,
    totalRowCount,
    pageInputRef,
    pageInputValue,
    setPageInputValue,
    handlePageInputBlur,
    handlePageInputFocus,
    handlePageInputKeyDown,
}: GenericListTableSectionProps<TData, TValue>) {
    const headerGroups = table.getHeaderGroups()

    // ✅ Sử dụng custom hooks để đo chiều cao động của header và footer
    const { ref: headerRef, height: headerHeight } = useElementHeight<HTMLDivElement>()
    const { ref: footerRef, height: footerHeight } = useElementHeight<HTMLDivElement>()

    // ✅ Tính toán max-height cho table body với error handling
    const bodyMaxHeight = React.useMemo(() => {
        const { ESTIMATED_HEADER_HEIGHT, ESTIMATED_FOOTER_HEIGHT, MIN_TABLE_HEIGHT } = LAYOUT_CONSTANTS
        
        // Fallback khi chưa đo được (initial render)
        if (headerHeight === 0 && footerHeight === 0) {
            const estimated = `calc(100% - ${ESTIMATED_HEADER_HEIGHT}px - ${ESTIMATED_FOOTER_HEIGHT}px)`
            return `max(${estimated}, ${MIN_TABLE_HEIGHT}px)`
        }
        
        // Tính toán chính xác khi đã có measurements
        const calculated = `calc(100% - ${headerHeight}px - ${footerHeight}px)`
        // ✅ Ensure minimum height để table vẫn usable trên màn hình nhỏ
        return `max(${calculated}, ${MIN_TABLE_HEIGHT}px)`
    }, [headerHeight, footerHeight])

    return (
        <div className="hidden md:flex rounded-md border flex-1 overflow-hidden flex-col w-full max-w-full min-w-0 isolate mt-2">
            {/* ✅ Table Header - Fixed với z-20 */}
            <div 
                ref={headerRef}
                className="flex-shrink-0 border-b bg-background"
                data-testid="list-view-table-header"
            >
                <Table containerClassName="w-full max-w-full min-w-0">
                    <TableHeader
                        className="sticky top-0 bg-background shadow-sm"
                        style={{
                            boxShadow:
                                "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                            zIndex: 20, // ✅ Giảm từ 120 xuống 20 (thấp hơn toolbar z-30)
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
                </Table>
            </div>

            {/* ✅ Table Body - Scrollable với max-height được tính toán động */}
            <div 
                className="flex-1 overflow-y-auto overflow-x-auto w-full max-w-full min-w-0 relative"
                style={{
                    maxHeight: bodyMaxHeight,
                    scrollBehavior: 'smooth', // ✅ Smooth scrolling
                }}
                role="region"
                aria-label="Danh sách dữ liệu"
                aria-live="polite"
                data-testid="list-view-table-body"
            >
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
                                        Không tìm thấy kết quả.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    )}
                </Table>
            </div>

            {/* ✅ Table Footer - Fixed với z-20, sticky bottom */}
            <div 
                ref={footerRef}
                className="flex-shrink-0 border-t bg-background sticky bottom-0 z-20"
                data-testid="list-view-table-footer"
            >
                <GenericListFooterSection
                    table={table}
                    selectedRowCount={selectedRowCount}
                    totalRowCount={totalRowCount}
                    pageInputRef={pageInputRef}
                    pageInputValue={pageInputValue}
                    setPageInputValue={setPageInputValue}
                    handlePageInputBlur={handlePageInputBlur}
                    handlePageInputFocus={handlePageInputFocus}
                    handlePageInputKeyDown={handlePageInputKeyDown}
                />
            </div>
        </div>
    )
}

