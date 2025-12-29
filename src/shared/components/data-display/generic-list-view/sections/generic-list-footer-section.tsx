"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"
import { useUserPreferencesStore } from "@/shared/stores/user-preferences-store"
import type { GenericListFooterSectionProps } from "../types"

/**
 * Footer section component for GenericListView
 * Provides pagination controls and page size selector for desktop
 */
export function GenericListFooterSection({
    table,
    selectedRowCount,
    totalRowCount,
    pageInputRef,
    pageInputValue,
    setPageInputValue,
    handlePageInputBlur,
    handlePageInputFocus,
    handlePageInputKeyDown,
}: GenericListFooterSectionProps) {
    const { setDefaultPageSize } = useUserPreferencesStore()

    return (
        <div className="hidden md:flex shrink-0 bg-background py-2.5 px-3 md:px-4 flex-row items-center justify-between gap-2 md:gap-0">
            <div className="flex items-center gap-2 md:gap-6 text-xs md:text-sm text-muted-foreground min-w-0 shrink">
                <span className="tabular-nums whitespace-nowrap shrink-0">
                    {selectedRowCount > 0 ? (
                        <>
                            <span className="font-medium text-foreground">
                                {selectedRowCount}
                            </span>
                            <span className="hidden sm:inline"> / </span>
                            <span className="font-medium text-foreground">
                                {totalRowCount}
                            </span>
                            <span className="hidden md:inline"> đã chọn</span>
                        </>
                    ) : (
                        <span className="font-medium text-foreground">
                            {totalRowCount}
                        </span>
                    )}
                </span>
                <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground hidden md:inline">
                        Hiển thị
                    </span>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            const pageSize = Number(value)
                            table.setPageSize(pageSize)
                            setDefaultPageSize(pageSize)
                        }}
                        name="table-page-size"
                    >
                        <SelectTrigger
                            id="table-page-size-select"
                            className="h-7 md:h-8 w-[65px] md:w-[75px] text-xs border-muted"
                            aria-label="Số dòng hiển thị"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="top" align="start">
                            {[20, 50, 100].map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size} dòng
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center gap-0.5 md:gap-1 justify-end shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 md:h-8 md:w-8 hidden lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                >
                    <ChevronsLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 md:h-8 md:w-8"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <ChevronLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>

                <div className="flex items-center gap-0.5 md:gap-1 px-1 md:px-2 min-w-[70px] md:min-w-[100px] justify-center">
                    <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">
                        Trang
                    </span>
                    <Input
                        ref={pageInputRef}
                        id="table-page-number-input"
                        name="table-page-number"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="h-7 md:h-8 w-10 md:w-14 text-center text-xs md:text-sm border-muted p-0"
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
                    <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                        / {table.getPageCount() || 1}
                    </span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 md:h-8 md:w-8"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 md:h-8 md:w-8 hidden lg:flex"
                    onClick={() =>
                        table.setPageIndex(table.getPageCount() - 1)
                    }
                    disabled={!table.getCanNextPage()}
                >
                    <ChevronsRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
            </div>
        </div>
    )
}

