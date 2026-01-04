"use client"

import { useState, useMemo } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search, X } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { EmbeddedListColumn } from "./embedded-list-section"

// Sortable Header Component
function SortableHeader({
    title,
    sorted,
    onSort,
}: {
    title: string
    sorted: false | "asc" | "desc"
    onSort: () => void
}) {
    return (
        <Button
            variant="ghost"
            onClick={onSort}
            className="h-8 px-2 hover:bg-muted/50 -ml-2"
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

interface EmbeddedListFullViewDialogProps<T> {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    data: T[]
    columns: EmbeddedListColumn<T>[]
    onRowClick?: (item: T) => void
    onView?: (item: T) => void
    onEdit?: (item: T) => void
    onDelete?: (item: T) => void
    showActions?: boolean
    getItemId?: (item: T) => string | number
    defaultSortField?: string
    defaultSortDirection?: "asc" | "desc"
    customSort?: (a: T, b: T) => number
    maxWidth?: string
    maxHeight?: string
    /** Enable search trong dialog */
    enableSearch?: boolean
    /** Search placeholder */
    searchPlaceholder?: string
    /** Fields để search (nếu không có thì search tất cả columns) */
    searchFields?: string[]
}

export function EmbeddedListFullViewDialog<T>({
    open,
    onOpenChange,
    title,
    data,
    columns,
    onRowClick,
    onView,
    onEdit,
    onDelete,
    showActions = true,
    getItemId,
    defaultSortField = "tg_tao",
    defaultSortDirection = "desc",
    customSort,
    maxWidth: _maxWidth = "1200px",
    maxHeight = "95vh",
    enableSearch = true,
    searchPlaceholder = "Tìm kiếm...",
    searchFields,
}: EmbeddedListFullViewDialogProps<T>) {
    const [sortField, setSortField] = useState<string | null>(defaultSortField)
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDirection)
    const [searchQuery, setSearchQuery] = useState("")

    // Handle sort click
    const handleSort = (field: string) => {
        if (sortField === field) {
            if (sortDirection === "desc") {
                setSortDirection("asc")
            } else if (sortDirection === "asc") {
                setSortField(defaultSortField)
                setSortDirection(defaultSortDirection)
            }
        } else {
            setSortField(field)
            setSortDirection("desc")
        }
    }

    // Get sort state for a column
    const getSortState = (field: string): false | "asc" | "desc" => {
        if (sortField !== field) return false
        return sortDirection
    }

    // Filter data by search query
    const filteredData = useMemo(() => {
        if (!enableSearch || !searchQuery.trim()) return data
        
        const query = searchQuery.toLowerCase().trim()
        const fieldsToSearch = searchFields || columns.map(col => col.key)
        
        return data.filter((item) => {
            return fieldsToSearch.some((field) => {
                const value = (item as any)[field]
                if (value == null) return false
                return String(value).toLowerCase().includes(query)
            })
        })
    }, [data, searchQuery, enableSearch, searchFields, columns])

    // Sort data
    const sortedData = useMemo(() => {
        const dataToSort = filteredData
        if (!dataToSort || dataToSort.length === 0) return dataToSort
        
        const sorted = [...dataToSort]
        
        if (customSort) {
            return sorted.sort(customSort)
        }
        
        const currentSortField = sortField || defaultSortField
        const currentSortDirection = sortField ? sortDirection : defaultSortDirection
        
        return sorted.sort((a, b) => {
            const aValue = (a as any)[currentSortField]
            const bValue = (b as any)[currentSortField]
            
            if (aValue == null && bValue == null) return 0
            if (aValue == null) return 1
            if (bValue == null) return -1
            
            if (typeof aValue === "string" && typeof bValue === "string") {
                const aDate = new Date(aValue).getTime()
                const bDate = new Date(bValue).getTime()
                if (!isNaN(aDate) && !isNaN(bDate)) {
                    return currentSortDirection === "desc" 
                        ? bDate - aDate 
                        : aDate - bDate
                }
            }
            
            if (typeof aValue === "number" && typeof bValue === "number") {
                return currentSortDirection === "desc" 
                    ? bValue - aValue 
                    : aValue - bValue
            }
            
            if (typeof aValue === "string" && typeof bValue === "string") {
                return currentSortDirection === "desc"
                    ? bValue.localeCompare(aValue)
                    : aValue.localeCompare(bValue)
            }
            
            const aStr = String(aValue)
            const bStr = String(bValue)
            return currentSortDirection === "desc"
                ? bStr.localeCompare(aStr)
                : aStr.localeCompare(bStr)
        })
    }, [filteredData, sortField, sortDirection, defaultSortField, defaultSortDirection, customSort])

    // Reset search when dialog closes
    const handleDialogOpenChange = (open: boolean) => {
        if (!open) {
            setSearchQuery("")
        }
        onOpenChange(open)
    }

    // Filter columns (show all in full view - ignore hideInCompact)
    const visibleColumns = useMemo(() => {
        // Trong full view, hiển thị tất cả columns (bỏ qua hideInCompact)
        return columns
    }, [columns])

    // Calculate sticky left offsets
    const stickyLeftOffsets = useMemo(() => {
        const offsets: number[] = []
        let currentOffset = 0
        visibleColumns.forEach((col) => {
            if (col.stickyLeft) {
                offsets.push(currentOffset)
                currentOffset += col.stickyMinWidth || 150
            } else {
                offsets.push(0)
            }
        })
        return offsets
    }, [visibleColumns])

    const hasActions = showActions && (onView || onEdit || onDelete)

    return (
        <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogContent
                className="!max-w-[1200px] !w-[90vw] !min-w-[90vw] max-w-[90vw] max-h-[95vh] p-0 flex flex-col"
                style={{
                    maxHeight: maxHeight,
                    minWidth: "90vw",
                }}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="px-6 pt-6 pb-4 pr-12 border-b flex-shrink-0">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <DialogTitle className="text-xl flex-1 min-w-0">{title}</DialogTitle>
                            {enableSearch && (
                                <div className="relative w-full max-w-sm flex-shrink-0">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                                    <Input
                                        type="text"
                                        placeholder={searchPlaceholder}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 pr-9"
                                    />
                                    {searchQuery && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 z-10"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setSearchQuery("")
                                            }}
                                            onMouseDown={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                            }}
                                            title="Xóa tìm kiếm"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {searchQuery.trim() 
                                ? `Tìm thấy: ${sortedData.length} / ${data.length} mục`
                                : `Tổng cộng: ${sortedData.length} mục`}
                        </p>
                    </div>
                </DialogHeader>
                
                <div className="flex-1 overflow-hidden min-h-0">
                    <ScrollArea className="h-full">
                        <div className="p-6 w-full">
                            <div className="relative overflow-hidden border rounded-lg w-full">
                                <ScrollArea
                                    className="w-full"
                                    style={{
                                        maxHeight: `calc(${maxHeight} - 220px)`,
                                    }}
                                >
                                    <div className="w-full min-w-full">
                                        <Table>
                                            <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                                                <TableRow>
                                                    {visibleColumns.map((column, colIndex) => (
                                                        <TableHead
                                                            key={column.key}
                                                            className={cn(
                                                                column.className,
                                                                column.stickyLeft && "sticky bg-background z-20",
                                                                hasActions && colIndex === visibleColumns.length - 1 && "border-r"
                                                            )}
                                                            style={column.stickyLeft ? {
                                                                left: stickyLeftOffsets[colIndex],
                                                                minWidth: column.stickyMinWidth || "150px",
                                                                boxShadow: colIndex > 0 ? "2px 0 6px -2px rgba(0,0,0,0.1)" : undefined,
                                                            } : undefined}
                                                        >
                                                            {column.sortable ? (
                                                                <SortableHeader
                                                                    title={column.header}
                                                                    sorted={getSortState(column.key)}
                                                                    onSort={() => handleSort(column.key)}
                                                                />
                                                            ) : (
                                                                column.header
                                                            )}
                                                        </TableHead>
                                                    ))}
                                                    {hasActions && (
                                                        <TableHead className="text-right w-[120px] sticky right-0 bg-background z-20">
                                                            Thao tác
                                                        </TableHead>
                                                    )}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sortedData.map((item, index) => (
                                                    <TableRow
                                                        key={getItemId ? String(getItemId(item)) : index}
                                                        className={onRowClick || onView ? "cursor-pointer" : ""}
                                                        onClick={() => (onRowClick ?? onView)?.(item)}
                                                    >
                                                        {visibleColumns.map((column, colIndex) => (
                                                            <TableCell
                                                                key={column.key}
                                                                className={cn(
                                                                    column.className,
                                                                    column.stickyLeft && "sticky bg-background z-10"
                                                                )}
                                                                style={column.stickyLeft ? {
                                                                    left: stickyLeftOffsets[colIndex],
                                                                    minWidth: column.stickyMinWidth || "150px",
                                                                    boxShadow: colIndex > 0 ? "2px 0 6px -2px rgba(0,0,0,0.1)" : undefined,
                                                                } : undefined}
                                                            >
                                                                {column.render(item)}
                                                            </TableCell>
                                                        ))}
                                                        {hasActions && (
                                                            <TableCell className="text-right sticky right-0 bg-background z-10">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    {onView && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                onView(item)
                                                                            }}
                                                                            title="Xem chi tiết"
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                    {onEdit && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                onEdit(item)
                                                                            }}
                                                                            title="Sửa"
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                    {onDelete && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                onDelete(item)
                                                                            }}
                                                                            title="Xóa"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}

