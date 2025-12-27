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

    // ✅ Sử dụng custom hooks để đo chiều cao động của header và footer (cho tương lai nếu cần)
    const { ref: headerRef } = useElementHeight<HTMLDivElement>()
    const { ref: footerRef } = useElementHeight<HTMLDivElement>()

    // ✅ Ref để đồng bộ scroll giữa header và body
    const scrollContainerRef = React.useRef<HTMLDivElement>(null)
    const headerScrollRef = React.useRef<HTMLDivElement>(null)
    const bodyScrollRef = React.useRef<HTMLDivElement>(null)

    // ✅ Đồng bộ scroll ngang giữa header và body
    React.useEffect(() => {
        const headerElement = headerScrollRef.current
        const bodyElement = bodyScrollRef.current

        if (!headerElement || !bodyElement) return

        const handleBodyScroll = () => {
            if (headerElement.scrollLeft !== bodyElement.scrollLeft) {
                headerElement.scrollLeft = bodyElement.scrollLeft
            }
        }

        const handleHeaderScroll = () => {
            if (bodyElement.scrollLeft !== headerElement.scrollLeft) {
                bodyElement.scrollLeft = headerElement.scrollLeft
            }
        }

        bodyElement.addEventListener('scroll', handleBodyScroll, { passive: true })
        headerElement.addEventListener('scroll', handleHeaderScroll, { passive: true })

        return () => {
            bodyElement.removeEventListener('scroll', handleBodyScroll)
            headerElement.removeEventListener('scroll', handleHeaderScroll)
        }
    }, [])

    return (
        <div className="hidden md:flex rounded-md border flex-1 overflow-hidden flex-col w-full max-w-full min-w-0 isolate mt-2 min-h-0">
            {/* ✅ Table Header - Scrollable ngang để đồng bộ với body */}
            <div 
                ref={headerRef}
                className="flex-shrink-0 border-b bg-background"
                data-testid="list-view-table-header"
            >
                <div 
                    ref={headerScrollRef} 
                    className="overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
                    style={{ 
                        scrollbarWidth: 'none', // Firefox
                        msOverflowStyle: 'none', // IE/Edge
                    }}
                >
                    <Table containerClassName="w-full max-w-full min-w-0" style={{ minWidth: 'max-content' }}>
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
            </div>

            {/* ✅ Table Body - Scrollable với flex-1 để tự động mở rộng và đẩy footer xuống */}
            <div 
                ref={bodyScrollRef}
                className="flex-1 min-h-0 overflow-y-auto overflow-x-auto w-full max-w-full min-w-0 relative"
                style={{
                    scrollBehavior: 'smooth', // ✅ Smooth scrolling
                }}
                role="region"
                aria-label="Danh sách dữ liệu"
                aria-live="polite"
                data-testid="list-view-table-body"
            >
                <Table containerClassName="w-full max-w-full min-w-0" style={{ minWidth: 'max-content' }}>
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

            {/* ✅ Table Footer - Sticky bottom, luôn ở dưới cùng và sticky khi scroll */}
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

