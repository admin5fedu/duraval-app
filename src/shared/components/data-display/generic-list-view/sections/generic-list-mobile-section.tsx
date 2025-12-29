"use client"
import { ChevronRight, Edit, Trash2 } from "lucide-react"
import type { GenericListMobileSectionProps } from "../types"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { MobileCardActionBar } from "../../mobile-card-action-bar"

/**
 * Mobile section component for GenericListView
 * Renders mobile cards when renderMobileCard prop is provided
 * Improved mobile UX with better spacing, ripple effects, and visual feedback
 * Includes checkbox selection and action section
 */
export function GenericListMobileSection<TData>({
    filteredRows,
    renderMobileCard,
    onRowClick,
    table,
    handleRowPointerDown,
    handleRowPointerUp,
    onEdit,
    onDelete,
    renderLeftActions,
}: GenericListMobileSectionProps<TData>) {
    return (
        <div 
            className="md:hidden flex-1 min-h-0 w-full max-w-full min-w-0 overflow-y-auto"
            data-testid="list-view-mobile-cards"
        >
            {renderMobileCard ? (
                <div className="space-y-2.5 pb-20 pt-2 px-1">
                    {filteredRows.map((row: any) => {
                        const rowData = row.original as TData
                        const isSelected = row.getIsSelected?.() ?? false
                        const hasActions = onEdit || onDelete || renderLeftActions

                        return (
                        <div
                            key={row.id}
                            className={cn(
                                "group relative",
                                "bg-card border border-border rounded-xl",
                                    "shadow-sm",
                                    "transition-all duration-150",
                                    "overflow-hidden",
                                    "flex flex-col",
                                    "hover:shadow-md hover:border-primary/20"
                                )}
                                onPointerDown={(e) => {
                                    // Don't trigger long press on checkbox or action buttons
                                    const target = e.target as HTMLElement
                                    if (target.closest('[data-slot="checkbox"]') !== null ||
                                        target.closest('[data-slot="action-button"]') !== null) {
                                        return
                                    }
                                    handleRowPointerDown(row.id, e)
                                }}
                                onPointerUp={(e) => {
                                    handleRowPointerUp(row.id, e)
                                }}
                            >
                                {/* Main content area - clickable */}
                                <div
                                    onClick={() => onRowClick?.(rowData)}
                                    className={cn(
                                        "p-4",
                                        "active:bg-muted/50 active:scale-[0.98]",
                                        "cursor-pointer",
                                        "min-h-[100px]",
                                        "flex items-center gap-3"
                                    )}
                                >
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                        {renderMobileCard(rowData)}
                            </div>
                            
                            {/* Chevron indicator */}
                            <ChevronRight 
                                className={cn(
                                    "h-5 w-5 text-muted-foreground",
                                    "shrink-0",
                                    "transition-transform group-active:translate-x-0.5"
                                )}
                            />
                            
                            {/* Ripple effect overlay */}
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-active:opacity-100 transition-opacity pointer-events-none" />
                        </div>

                                {/* Action section - always shown with checkbox */}
                                <div
                                    className="px-4 pb-4 pt-2 mt-1 border-t"
                                    onClick={(e) => e.stopPropagation()}
                                    onPointerDown={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        {/* Checkbox - leftmost */}
                                        <div
                                            className="shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                            }}
                                            onPointerDown={(e) => {
                                                e.stopPropagation()
                                            }}
                                        >
                                            <Checkbox
                                                id={`mobile-row-checkbox-${row.id}`}
                                                name={`mobile-row-${row.id}`}
                                                checked={isSelected}
                                                onCheckedChange={(checked) => {
                                                    // Find the row in table and toggle selection
                                                    const tableRow = table.getRowModel().rows.find((r: any) => r.id === row.id)
                                                    if (tableRow) {
                                                        tableRow.toggleSelected(!!checked)
                                                    }
                                                }}
                                                aria-label="Select row"
                                                data-slot="checkbox"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                }}
                                                onPointerDown={(e) => {
                                                    e.stopPropagation()
                                                }}
                                            />
                                        </div>

                                        {/* Actions */}
                                        {hasActions && (
                                            <div className="flex-1">
                                                <MobileCardActionBar
                                                    leftActions={
                                                        renderLeftActions ? (
                                                            <div className="flex gap-1.5">
                                                                {renderLeftActions(rowData)}
                                                            </div>
                                                        ) : undefined
                                                    }
                                                    rightActions={
                                                        (onEdit || onDelete) ? (
                                                            <div className="flex gap-2">
                                                                {onEdit && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            onEdit(rowData)
                                                                        }}
                                                                        data-slot="action-button"
                                                                        className="h-8 gap-1.5"
                                                                    >
                                                                        <Edit className="h-3.5 w-3.5" />
                                                                        <span className="text-xs">Sửa</span>
                                                                    </Button>
                                                                )}
                                                                {onDelete && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            onDelete(rowData)
                                                                        }}
                                                                        data-slot="action-button"
                                                                        className="h-8 gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                        <span className="text-xs">Xóa</span>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        ) : undefined
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="p-4 text-center text-muted-foreground">
                    <p className="text-sm">Vui lòng cung cấp 'renderMobileCard' để hiển thị giao diện điện thoại.</p>
                </div>
            )}
        </div>
    )
}

