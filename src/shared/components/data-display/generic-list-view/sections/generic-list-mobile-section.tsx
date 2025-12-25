"use client"

import * as React from "react"
import type { GenericListMobileSectionProps } from "../types"

/**
 * Mobile section component for GenericListView
 * Renders mobile cards when renderMobileCard prop is provided
 */
export function GenericListMobileSection<TData>({
    filteredRows,
    renderMobileCard,
    onRowClick,
}: GenericListMobileSectionProps<TData>) {
    return (
        <div className="md:hidden flex-1 min-h-0 w-full max-w-full min-w-0 overflow-y-auto">
            {renderMobileCard ? (
                <div className="space-y-3 pb-24 pt-1">
                    {filteredRows.map((row: any) => (
                        <div
                            key={row.id}
                            onClick={() => onRowClick?.(row.original)}
                            className="bg-card border border-border rounded-lg p-4 shadow-sm active:bg-muted/50 transition-colors cursor-pointer min-h-[80px] flex items-center"
                        >
                            {renderMobileCard(row.original)}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-4 text-center text-muted-foreground">
                    Vui lòng cung cấp 'renderMobileCard' để hiển thị giao diện
                    điện thoại.
                </div>
            )}
        </div>
    )
}

