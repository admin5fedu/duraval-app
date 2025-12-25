"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { SquareX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getSelectionCount } from "./selection-utils"
import { BulkActionsMenu } from "./bulk-actions-menu"
import type { BulkAction } from "./bulk-actions-menu"
import { toolbarButtonOutlineClass, toolbarGapClass, toolbarContainerClass } from "@/shared/utils/toolbar-styles"
import { smallMediumTextClass } from "@/shared/utils/text-styles"
import { cn } from "@/lib/utils"

interface SelectionToolbarProps<TData> {
    table: Table<TData>
    bulkActions?: BulkAction<TData>[]
    onDelete?: () => void
    onExport?: () => void
    showCount?: boolean
    formatCount?: (selected: number, total: number) => string
}

/**
 * Selection Toolbar Component
 * 
 * Hiển thị khi có rows được chọn, cung cấp:
 * - Selection count
 * - Bulk actions menu
 * - Clear selection button
 */
export type { BulkAction } from "./bulk-actions-menu"

export function SelectionToolbar<TData>({
    table,
    bulkActions,
    onDelete,
    onExport,
    showCount = true,
    formatCount,
}: SelectionToolbarProps<TData>) {
    const { selected, total } = getSelectionCount(table)

    if (selected === 0) {
        return null
    }

    const countLabel = formatCount
        ? formatCount(selected, total)
        : `${selected} / ${total} đã chọn`

    return (
        <div className={cn("flex items-center px-2 py-1.5 bg-background", toolbarGapClass())}>
            {showCount && (
                <span className={cn(smallMediumTextClass(), "text-foreground tabular-nums")}>
                    {countLabel}
                </span>
            )}
            <div className={cn(toolbarContainerClass(), "ml-auto")}>
                <BulkActionsMenu
                    table={table}
                    actions={bulkActions}
                    onDelete={onDelete}
                    onExport={onExport}
                />
                <Button
                    variant="outline"
                    size="sm"
                    className={toolbarButtonOutlineClass()}
                    onClick={() => table.resetRowSelection()}
                    title="Hủy chọn tất cả (ESC)"
                >
                    <SquareX className="mr-1 h-3.5 w-3.5" />
                    <span>Hủy chọn</span>
                </Button>
            </div>
        </div>
    )
}

