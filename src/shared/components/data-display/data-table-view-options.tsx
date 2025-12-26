"use client"

import * as React from "react"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Columns3, Search, RotateCcw } from "lucide-react"
import { Table, Column } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { mediumTextClass, smallTextClass, bodyTextClass } from "@/shared/utils/text-styles"
import { compactPaddingClass, standardPaddingClass } from "@/shared/utils/spacing-styles"

interface DataTableViewOptionsProps<TData> {
    table: Table<TData>
    storageKey?: string // Optional key for localStorage
}

/**
 * Helper function to get display name for a column
 * Priority: meta.title > header (if string) > column.id (formatted)
 */
function getColumnDisplayName<TData>(column: Column<TData, unknown>): string {
    // 1. Try to get from meta.title if defined (preferred - Vietnamese with diacritics)
    const meta = column.columnDef.meta as { title?: string } | undefined
    if (meta?.title) {
        return meta.title
    }

    // 2. Try to get from columnDef.header if it's a string
    const header = column.columnDef.header
    if (typeof header === "string") {
        return header
    }

    // 3. Try to extract text from React element header (if it contains text)
    if (React.isValidElement(header)) {
        // Try to find text in children
        const extractText = (element: React.ReactElement | string | number | null | undefined): string => {
            if (typeof element === 'string' || typeof element === 'number') {
                return String(element)
            }
            if (React.isValidElement(element)) {
                if (element.props?.title) {
                    return String(element.props.title)
                }
                if (element.props?.children) {
                    return extractText(element.props.children)
                }
            }
            return ''
        }
        const extracted = extractText(header)
        if (extracted) {
            return extracted
        }
    }

    // 4. Fall back to column id (convert snake_case to readable format)
    return column.id
        .split(/[_-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

// Helper to get column order from meta (for logical sorting)
function getColumnOrder<TData>(column: Column<TData, unknown>): number {
    const meta = column.columnDef.meta as { order?: number } | undefined
    return meta?.order ?? 999 // Default to end if no order specified
}

export function DataTableViewOptions<TData>({
    table,
    storageKey = "table-column-visibility"
}: DataTableViewOptionsProps<TData>) {
    const [searchQuery, setSearchQuery] = React.useState("")
    
    // Store default visibility state on mount (before loading from localStorage)
    const defaultVisibilityRef = React.useRef<Record<string, boolean> | null>(null)
    
    // Initialize default visibility state immediately (before any effects)
    // Store the initial visibility state of all hideable columns
    if (defaultVisibilityRef.current === null) {
        const defaultVisibility: Record<string, boolean> = {}
        table.getAllColumns().forEach(column => {
            const hasAccessor = column.accessorKey || column.accessorFn
            const canHide = column.getCanHide()
            const isSelectionColumn = column.id === 'select'
            const hidingDisabled = column.columnDef.enableHiding === false
            
            if (hasAccessor && canHide && !isSelectionColumn && !hidingDisabled) {
                defaultVisibility[column.id] = column.getIsVisible()
            }
        })
        defaultVisibilityRef.current = defaultVisibility
    }
    
    // Reset to default visibility
    const handleResetToDefault = React.useCallback(() => {
        if (defaultVisibilityRef.current) {
            table.getAllColumns().forEach(column => {
                const hasAccessor = column.accessorKey || column.accessorFn
                const canHide = column.getCanHide()
                const isSelectionColumn = column.id === 'select'
                const hidingDisabled = column.columnDef.enableHiding === false
                
                if (hasAccessor && canHide && !isSelectionColumn && !hidingDisabled) {
                    const defaultVisible = defaultVisibilityRef.current![column.id] ?? true
                    column.toggleVisibility(defaultVisible)
                }
            })
            // Clear localStorage
            if (typeof window !== 'undefined' && storageKey) {
                try {
                    localStorage.removeItem(storageKey)
                } catch (error) {
                    console.warn('Failed to clear column visibility preferences:', error)
                }
            }
        }
    }, [table, storageKey])
    
    /**
     * Get all hideable columns
     * A column is hideable if:
     * 1. It has an accessor (accessorKey or accessorFn)
     * 2. It's not explicitly disabled (enableHiding !== false)
     * 3. It's not a selection column (id !== 'select')
     * 4. It's not an actions column (typically has enableHiding: false)
     */
    const hideableColumns = React.useMemo(() => {
        return table
            .getAllColumns()
            .filter((column) => {
                // Must have accessor (either accessorKey or accessorFn)
                const hasAccessor = column.accessorKey || column.accessorFn
                
                // Must be able to hide (getCanHide() checks enableHiding)
                const canHide = column.getCanHide()
                
                // Exclude selection column
                const isSelectionColumn = column.id === 'select'
                
                // Exclude columns with enableHiding explicitly set to false
                const hidingDisabled = column.columnDef.enableHiding === false
                
                return hasAccessor && canHide && !isSelectionColumn && !hidingDisabled
            })
            .sort((a, b) => {
                // Sort by order first (from meta.order), then by display name
                const orderDiff = getColumnOrder(a) - getColumnOrder(b)
                if (orderDiff !== 0) return orderDiff
                return getColumnDisplayName(a).localeCompare(getColumnDisplayName(b), 'vi')
            })
    }, [table])

    // Filter columns based on search query
    const filteredColumns = React.useMemo(() => {
        if (!searchQuery.trim()) return hideableColumns
        
        const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        return hideableColumns.filter(column => {
            const displayName = getColumnDisplayName(column)
            const normalized = displayName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            return normalized.includes(query)
        })
    }, [hideableColumns, searchQuery])

    // Load preferences from localStorage on mount (only once)
    const hasLoadedPreferences = React.useRef(false)
    React.useEffect(() => {
        if (typeof window === 'undefined' || !storageKey || hasLoadedPreferences.current) return

        try {
            const saved = localStorage.getItem(storageKey)
            if (saved) {
                const visibility: Record<string, boolean> = JSON.parse(saved)
                hideableColumns.forEach(column => {
                    if (visibility[column.id] !== undefined) {
                        column.toggleVisibility(visibility[column.id])
                    }
                })
                hasLoadedPreferences.current = true
            }
        } catch (error) {
            console.warn('Failed to load column visibility preferences:', error)
        }
    }, [storageKey]) // Only depend on storageKey, not hideableColumns to avoid re-loading

    // Save preferences to localStorage when visibility changes
    React.useEffect(() => {
        if (typeof window === 'undefined' || !storageKey) return

        try {
            const visibility: Record<string, boolean> = {}
            hideableColumns.forEach(column => {
                visibility[column.id] = column.getIsVisible()
            })
            localStorage.setItem(storageKey, JSON.stringify(visibility))
        } catch (error) {
            console.warn('Failed to save column visibility preferences:', error)
        }
    }, [table.getState().columnVisibility, storageKey, hideableColumns])

    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                        >
                            <Columns3 className="h-4 w-4" />
                            <span className="sr-only">Tùy chọn cột hiển thị</span>
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Tùy chọn cột</p>
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-[240px] p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
                <div className={cn(standardPaddingClass(), "space-y-2")}>
                    <DropdownMenuLabel className={cn("px-0", mediumTextClass())}>
                        Chọn cột hiển thị
                    </DropdownMenuLabel>
                    
                    {/* Search input */}
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm cột..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn("h-8 pl-7 pr-2", smallTextClass())}
                        />
                    </div>
                    
                    {/* Reset to default button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResetToDefault}
                        className={cn("w-full justify-start h-8 px-2", smallTextClass())}
                    >
                        <RotateCcw className="mr-2 h-3.5 w-3.5" />
                        Mặc định
                    </Button>
                </div>

                <DropdownMenuSeparator />

                {/* Column list */}
                <ScrollArea className="h-[200px]">
                    <div className="p-1">
                        {filteredColumns.length === 0 ? (
                            <div className={cn("px-2 py-6 text-center text-muted-foreground", smallTextClass())}>
                                {searchQuery ? "Không tìm thấy cột nào" : "Không có cột nào"}
                            </div>
                        ) : (
                            filteredColumns.map((column) => {
                                const displayName = getColumnDisplayName(column)
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        onSelect={(e) => {
                                            e.preventDefault() // Prevent dropdown from closing when clicking checkbox
                                        }}
                                        className={cn("px-2 py-1.5 cursor-pointer pl-7", bodyTextClass())}
                                    >
                                        <span className="truncate">{displayName}</span>
                                    </DropdownMenuCheckboxItem>
                                )
                            })
                        )}
                    </div>
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

