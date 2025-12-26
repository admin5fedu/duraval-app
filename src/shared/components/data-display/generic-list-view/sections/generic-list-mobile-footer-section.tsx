"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useUserPreferencesStore } from "@/shared/stores/user-preferences-store"
import type { GenericListMobileFooterSectionProps } from "../types"

/**
 * Mobile footer section component for GenericListView
 * Provides enhanced pagination controls for mobile devices with:
 * - Selected count display
 * - Page size selector
 * - Page jump input
 * - Larger touch targets for better mobile UX
 */
export function GenericListMobileFooterSection({
    table,
    selectedRowCount,
    totalRowCount,
    pageInputRef,
    pageInputValue,
    setPageInputValue,
    handlePageInputBlur,
    handlePageInputFocus,
    handlePageInputKeyDown,
}: GenericListMobileFooterSectionProps) {
    const { setDefaultPageSize } = useUserPreferencesStore()
    const pageIndex = table.getState().pagination.pageIndex
    const pageCount = table.getPageCount() || 1
    const pageSize = table.getState().pagination.pageSize

    return (
        <div className="md:hidden fixed inset-x-0 bottom-16 z-50 bg-background/95 border-t py-2.5 px-3 flex items-center justify-between gap-2 text-xs backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg">
            {/* Left: Page size & total count */}
            <div className="flex items-center gap-2 min-w-0 shrink-0">
                <Select
                    value={`${pageSize}`}
                    onValueChange={(value) => {
                        const newPageSize = Number(value)
                        table.setPageSize(newPageSize)
                        setDefaultPageSize(newPageSize)
                    }}
                    name="table-page-size-mobile"
                >
                    <SelectTrigger
                        id="table-page-size-select-mobile"
                        className="h-8 w-[55px] text-xs border-muted"
                        aria-label="Số dòng hiển thị"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="top" align="start">
                        {[10, 20, 50].map((size) => (
                            <SelectItem key={size} value={`${size}`}>
                                {size}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                    {totalRowCount}
                </span>
            </div>

            {/* Right: Selected count & Page navigation */}
            <div className="flex items-center gap-2 min-w-0 shrink-0">
                {selectedRowCount > 0 && (
                    <span className="text-xs font-medium text-primary whitespace-nowrap">
                        {selectedRowCount} đã chọn
                    </span>
                )}
                
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 active:scale-95 transition-transform"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        aria-label="Trang trước"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1 px-1.5 min-w-0">
                        <Input
                            ref={pageInputRef}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="h-8 w-11 text-center text-xs border-muted p-0 font-medium"
                            value={pageInputValue}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value
                                if (value === "" || /^\d+$/.test(value)) {
                                    setPageInputValue(value)
                                }
                            }}
                            onFocus={handlePageInputFocus}
                            onBlur={handlePageInputBlur}
                            onKeyDown={handlePageInputKeyDown}
                            aria-label="Số trang"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                            /{pageCount}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 active:scale-95 transition-transform"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        aria-label="Trang sau"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

