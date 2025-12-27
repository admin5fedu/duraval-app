"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Eye, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export interface EmbeddedListColumn<T> {
    key: string
    header: string
    render: (item: T) => React.ReactNode
    className?: string
    /** Enable sorting cho column này. Default: false */
    sortable?: boolean
}

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

interface EmbeddedListSectionProps<T> {
    title: string
    description?: string
    titleIcon?: React.ComponentType<{ className?: string }>
    titleClassName?: string
    data: T[]
    columns: EmbeddedListColumn<T>[]
    isLoading?: boolean
    emptyMessage?: string
    emptyStateIcon?: React.ComponentType<{ className?: string }>
    onAdd?: () => void
    addLabel?: string
    addButtonVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
    /** Click vào cả hàng: chuẩn ERP = mở popup detail. */
    onRowClick?: (item: T) => void
    /** Click icon mắt: chuẩn ERP = chuyển sang trang detail module. */
    onView?: (item: T) => void
    onEdit?: (item: T) => void
    onDelete?: (item: T) => void
    showActions?: boolean
    getItemId?: (item: T) => string | number
    getItemName?: (item: T) => string
    className?: string
    /** Max height cho scroll container. Default: "400px" */
    maxHeight?: string
    /** Enable sticky header. Default: true */
    enableStickyHeader?: boolean
    /** Enable horizontal scroll. Default: true */
    enableHorizontalScroll?: boolean
    /** Field name để sort mặc định. Default: "tg_tao" */
    defaultSortField?: string
    /** Sort direction mặc định. Default: "desc" (mới nhất lên trước) */
    defaultSortDirection?: "asc" | "desc"
    /** Custom sort function. Nếu có thì sẽ override defaultSortField */
    customSort?: (a: T, b: T) => number
}

/**
 * Component hiển thị danh sách embedded trong detail view
 * Hỗ trợ CRUD operations với dialogs
 * Có thể tái sử dụng cho bất kỳ entity nào
 */
export function EmbeddedListSection<T>({
    title,
    description,
    titleIcon,
    titleClassName,
    data,
    columns,
    isLoading = false,
    emptyMessage = "Không có dữ liệu",
    emptyStateIcon,
    onAdd,
    addLabel = "Thêm mới",
    addButtonVariant = "default",
    onRowClick,
    onView,
    onEdit,
    onDelete,
    showActions = true,
    getItemId,
    getItemName,
    className,
    maxHeight = "400px",
    enableStickyHeader = true,
    enableHorizontalScroll = true,
    defaultSortField = "tg_tao",
    defaultSortDirection = "desc",
    customSort,
}: EmbeddedListSectionProps<T>) {
    // Sort state: track current sort field and direction
    const [sortField, setSortField] = useState<string | null>(defaultSortField)
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDirection)

    // Handle sort click
    const handleSort = (field: string) => {
        if (sortField === field) {
            // Toggle direction: desc -> asc -> null (reset to default)
            if (sortDirection === "desc") {
                setSortDirection("asc")
            } else if (sortDirection === "asc") {
                // Reset to default
                setSortField(defaultSortField)
                setSortDirection(defaultSortDirection)
            }
        } else {
            // New field: start with desc
            setSortField(field)
            setSortDirection("desc")
        }
    }

    // Get sort state for a column
    const getSortState = (field: string): false | "asc" | "desc" => {
        if (sortField !== field) return false
        return sortDirection
    }

    // Sort data
    const sortedData = useMemo(() => {
        if (!data || data.length === 0) return data
        
        const sorted = [...data]
        
        if (customSort) {
            return sorted.sort(customSort)
        }
        
        const currentSortField = sortField || defaultSortField
        const currentSortDirection = sortField ? sortDirection : defaultSortDirection
        
        return sorted.sort((a, b) => {
            const aValue = (a as any)[currentSortField]
            const bValue = (b as any)[currentSortField]
            
            // Handle null/undefined values
            if (aValue == null && bValue == null) return 0
            if (aValue == null) return 1 // null values go to end
            if (bValue == null) return -1
            
            // Handle date strings
            if (typeof aValue === "string" && typeof bValue === "string") {
                const aDate = new Date(aValue).getTime()
                const bDate = new Date(bValue).getTime()
                if (!isNaN(aDate) && !isNaN(bDate)) {
                    return currentSortDirection === "desc" 
                        ? bDate - aDate 
                        : aDate - bDate
                }
            }
            
            // Handle numbers
            if (typeof aValue === "number" && typeof bValue === "number") {
                return currentSortDirection === "desc" 
                    ? bValue - aValue 
                    : aValue - bValue
            }
            
            // Handle strings
            if (typeof aValue === "string" && typeof bValue === "string") {
                return currentSortDirection === "desc"
                    ? bValue.localeCompare(aValue)
                    : aValue.localeCompare(bValue)
            }
            
            // Fallback: compare as strings
            const aStr = String(aValue)
            const bStr = String(bValue)
            return currentSortDirection === "desc"
                ? bStr.localeCompare(aStr)
                : aStr.localeCompare(bStr)
        })
    }, [data, sortField, sortDirection, defaultSortField, defaultSortDirection, customSort])

    if (isLoading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            {description && <Skeleton className="h-4 w-96" />}
                        </div>
                        {onAdd && <Skeleton className="h-9 w-32" />}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    const hasActions = showActions && (onView || onEdit || onDelete)
    void getItemName

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className={titleClassName || ""}>
                            {titleIcon && (() => {
                                const IconComponent = titleIcon
                                return <IconComponent className="mr-2 h-5 w-5 inline-block" />
                            })()}
                            <span>{title}</span>
                        </CardTitle>
                        {description && (
                            <CardDescription className="mt-1">{description}</CardDescription>
                        )}
                    </div>
                    {onAdd && (
                        <Button onClick={onAdd} size="sm" variant={addButtonVariant}>
                            <Plus className="mr-2 h-4 w-4" />
                            {addLabel}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {sortedData.length === 0 ? (
                    <div className="text-center py-8 px-6 text-muted-foreground">
                        {emptyStateIcon && (() => {
                            const EmptyIcon = emptyStateIcon
                            return <EmptyIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        })()}
                        <p>{emptyMessage}</p>
                    </div>
                ) : (
                    <div className="relative overflow-hidden">
                        {/* Header - Sticky */}
                        <div className={cn(
                            "flex-shrink-0 border-b bg-background",
                            enableStickyHeader && "sticky top-0 z-10"
                        )}>
                            <div className={cn(
                                "overflow-x-auto",
                                !enableHorizontalScroll && "overflow-x-hidden"
                            )}>
                                <Table>
                                    <TableHeader className={cn(
                                        "bg-background",
                                        enableStickyHeader && "shadow-sm"
                                    )} style={enableStickyHeader ? {
                                        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                                    } : undefined}>
                                        <TableRow>
                                            {columns.map((column) => (
                                                <TableHead key={column.key} className={column.className}>
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
                                                <TableHead className="text-right w-[120px] sticky right-0 bg-background">Thao tác</TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                </Table>
                            </div>
                        </div>

                        {/* Body - Scrollable */}
                        <ScrollArea
                            className={cn(
                                "w-full",
                                enableHorizontalScroll && "overflow-x-auto"
                            )}
                            style={{
                                maxHeight,
                            }}
                        >
                            <div className={cn(
                                enableHorizontalScroll && "min-w-full"
                            )}>
                                <Table>
                                    <TableBody>
                                        {sortedData.map((item, index) => (
                                            <TableRow
                                                key={getItemId ? String(getItemId(item)) : index}
                                                className={onRowClick || onView ? "cursor-pointer" : ""}
                                                onClick={() => (onRowClick ?? onView)?.(item)}
                                            >
                                                {columns.map((column) => (
                                                    <TableCell key={column.key} className={column.className}>
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
                )}
            </CardContent>
        </Card>
    )
}

