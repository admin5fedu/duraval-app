"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import type { GenericListMobileSectionProps } from "../types"
import { cn } from "@/lib/utils"

/**
 * Mobile section component for GenericListView
 * Renders mobile cards when renderMobileCard prop is provided
 * Improved mobile UX with better spacing, ripple effects, and visual feedback
 */
export function GenericListMobileSection<TData>({
    filteredRows,
    renderMobileCard,
    onRowClick,
}: GenericListMobileSectionProps<TData>) {
    return (
        <div className="md:hidden flex-1 min-h-0 w-full max-w-full min-w-0 overflow-y-auto">
            {renderMobileCard ? (
                <div className="space-y-2.5 pb-24 pt-2 px-1">
                    {filteredRows.map((row: any) => (
                        <div
                            key={row.id}
                            onClick={() => onRowClick?.(row.original)}
                            className={cn(
                                "group relative",
                                "bg-card border border-border rounded-xl",
                                "p-4 shadow-sm",
                                "active:bg-muted/50 active:scale-[0.98]",
                                "transition-all duration-150",
                                "cursor-pointer",
                                "min-h-[100px]",
                                "flex items-center gap-3",
                                // Hover effect cho desktop touch
                                "hover:shadow-md hover:border-primary/20",
                                // Ripple effect
                                "overflow-hidden"
                            )}
                        >
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                {renderMobileCard(row.original)}
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
                    ))}
                </div>
            ) : (
                <div className="p-4 text-center text-muted-foreground">
                    <p className="text-sm">Vui lòng cung cấp 'renderMobileCard' để hiển thị giao diện điện thoại.</p>
                </div>
            )}
        </div>
    )
}

