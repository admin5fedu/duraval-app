"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { MoreHorizontal, Trash2, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toolbarButtonOutlineClass } from "@/shared/utils/toolbar-styles"

export interface BulkAction<TData> {
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick: (selectedRows: TData[]) => void | Promise<void>
    variant?: "default" | "destructive"
}

interface BulkActionsMenuProps<TData> {
    table: Table<TData>
    actions?: BulkAction<TData>[]
    onDelete?: () => void
    onExport?: () => void
}

export function BulkActionsMenu<TData>({
    table,
    actions = [],
    onDelete,
    onExport,
}: BulkActionsMenuProps<TData>) {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedData = selectedRows.map(row => row.original)

    if (selectedRows.length === 0) {
        return null
    }

    const hasActions = actions.length > 0 || onDelete || onExport

    if (!hasActions) {
        return null
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={toolbarButtonOutlineClass()}>
                    <MoreHorizontal className="mr-1.5 h-3.5 w-3.5" />
                    <span>Thao tác</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Thao tác hàng loạt</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onExport && (
                    <DropdownMenuItem onClick={onExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Xuất dữ liệu
                    </DropdownMenuItem>
                )}
                {actions.map((action, index) => {
                    const Icon = action.icon
                    return (
                        <DropdownMenuItem
                            key={index}
                            onClick={async () => {
                                try {
                                    await action.onClick(selectedData)
                                } catch (error: any) {
                                    console.error(`Bulk action error (${action.label}):`, error)
                                    // Error handling is done in the action handler
                                }
                            }}
                            className={action.variant === "destructive" ? "text-destructive" : ""}
                        >
                            {Icon && <Icon className="mr-2 h-4 w-4" />}
                            {action.label}
                        </DropdownMenuItem>
                    )
                })}
                {onDelete && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={async () => {
                                try {
                                    await onDelete()
                                } catch (error: any) {
                                    console.error('Bulk delete error:', error)
                                    // Error handling is done in the parent component
                                }
                            }}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa đã chọn
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

