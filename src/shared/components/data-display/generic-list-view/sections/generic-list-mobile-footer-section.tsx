"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { GenericListMobileFooterSectionProps } from "../types"

/**
 * Mobile footer section component for GenericListView
 * Provides pagination controls for mobile devices
 */
export function GenericListMobileFooterSection({
    table,
    totalRowCount,
}: GenericListMobileFooterSectionProps) {
    const pageIndex = table.getState().pagination.pageIndex
    const pageCount = table.getPageCount() || 1

    return (
        <div className="md:hidden fixed inset-x-0 bottom-16 z-50 bg-background/95 border-t py-2 px-3 flex items-center justify-between text-xs text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <span className="tabular-nums">
                Trang{" "}
                <span className="font-medium text-foreground">
                    {pageIndex + 1}
                </span>
                /{pageCount} ·{" "}
                <span className="font-medium text-foreground">
                    {totalRowCount}
                </span>{" "}
                dòng
            </span>
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Trang trước"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Trang sau"
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    )
}

