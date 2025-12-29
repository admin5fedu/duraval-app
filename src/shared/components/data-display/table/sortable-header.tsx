"use client"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

interface SortableHeaderProps {
    column: {
        getIsSorted: () => false | "asc" | "desc"
        toggleSorting: (desc?: boolean) => void
    }
    title: string
}

/**
 * Generic SortableHeader component
 * 
 * Renders a sortable table header with consistent styling.
 * Removed -ml-2 to ensure proper alignment with body cells.
 * 
 * @example
 * ```tsx
 * <SortableHeader column={column} title="Nhân viên" />
 * ```
 */
export function SortableHeader({
    column,
    title,
}: SortableHeaderProps) {
    const sorted = column.getIsSorted()

    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 hover:bg-muted/50"
        >
            <span>{title}</span>
            {sorted === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
            ) : sorted === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
        </Button>
    )
}

