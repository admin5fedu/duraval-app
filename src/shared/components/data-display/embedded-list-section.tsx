"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Eye, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Maximize2, ChevronRight } from "lucide-react"
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
import { EmbeddedListFullViewDialog } from "./embedded-list-full-view-dialog"

export interface EmbeddedListColumn<T> {
    key: string
    header: string
    render: (item: T) => React.ReactNode
    className?: string
    /** Enable sorting cho column này. Default: false */
    sortable?: boolean
    /** Cố định cột này khi scroll ngang (sticky left) */
    stickyLeft?: boolean
    /** Offset từ trái (cho cột sticky thứ 2, 3...) */
    stickyLeftOffset?: number
    /** Min width cho cột sticky */
    stickyMinWidth?: number
    /** Ẩn cột này trong compact mode, chỉ hiện trong expand view */
    hideInCompact?: boolean
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
    /** Compact mode: chỉ hiển thị N dòng đầu, còn lại scroll */
    compactMode?: boolean
    /** Số dòng hiển thị trong compact mode. Default: 5 */
    compactRowCount?: number
    /** Hiển thị indicator "Xem thêm N items" */
    showMoreIndicator?: boolean
    /** Enable nút "Xem tất cả" để mở full view dialog */
    enableExpandView?: boolean
    /** Custom title cho expand dialog */
    expandDialogTitle?: string
    /** Max width của expand dialog. Default: "1200px" (giống GenericFormDialog/GenericDetailDialog) */
    expandDialogMaxWidth?: string
    /** Max height của expand dialog. Default: "95vh" (giống GenericFormDialog/GenericDetailDialog) */
    expandDialogMaxHeight?: string
    /** Callback khi mở expand dialog */
    onExpand?: () => void
    /** Hiển thị số lượng items */
    showItemCount?: boolean
    /** Total count (nếu có pagination) */
    totalCount?: number
    /** Format: "Hiển thị 5 / 20 items" */
    countFormat?: (visible: number, total: number) => string
    /** Enable search trong expand dialog */
    enableSearch?: boolean
    /** Search placeholder */
    searchPlaceholder?: string
    /** Fields để search (nếu không có thì search tất cả columns) */
    searchFields?: string[]
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
    compactMode = false,
    compactRowCount = 5,
    showMoreIndicator = true,
    enableExpandView = false,
    expandDialogTitle,
    expandDialogMaxWidth = "1200px",
    expandDialogMaxHeight = "95vh",
    onExpand,
    showItemCount = false,
    totalCount,
    countFormat,
    enableSearch = true,
    searchPlaceholder = "Tìm kiếm...",
    searchFields,
}: EmbeddedListSectionProps<T>) {
    // Sort state: track current sort field and direction
    const [sortField, setSortField] = useState<string | null>(defaultSortField)
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDirection)
    const [expandDialogOpen, setExpandDialogOpen] = useState(false)

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

    // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
    // để đảm bảo thứ tự hooks nhất quán giữa các lần render

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

    // Filter columns based on compact mode
    const visibleColumns = useMemo(() => {
        if (!compactMode) return columns
        return columns.filter(col => !col.hideInCompact)
    }, [columns, compactMode])

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

    // Get data to display (compact mode limits rows)
    const displayData = useMemo(() => {
        if (!compactMode) return sortedData
        return sortedData.slice(0, compactRowCount)
    }, [sortedData, compactMode, compactRowCount])

    const remainingCount = compactMode && sortedData.length > compactRowCount 
        ? sortedData.length - compactRowCount 
        : 0

    // Format count display
    const countText = useMemo(() => {
        if (!showItemCount) return null
        const total = totalCount ?? sortedData.length
        const visible = displayData.length
        if (countFormat) {
            return countFormat(visible, total)
        }
        return total > visible ? `Hiển thị ${visible} / ${total} mục` : `${total} mục`
    }, [showItemCount, totalCount, sortedData.length, displayData.length, countFormat])

    // Early return AFTER all hooks
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

    // Handle expand
    const handleExpand = () => {
        setExpandDialogOpen(true)
        onExpand?.()
    }

    return (
        <>
            <Card className={className}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <CardTitle className={titleClassName || ""}>
                                    {titleIcon && (() => {
                                        const IconComponent = titleIcon
                                        return <IconComponent className="mr-2 h-5 w-5 inline-block" />
                                    })()}
                                    <span>{title}</span>
                                </CardTitle>
                                {showItemCount && countText && (
                                    <span className="text-sm text-muted-foreground font-normal">
                                        ({countText})
                                    </span>
                                )}
                            </div>
                            {description && (
                                <CardDescription className="mt-1">{description}</CardDescription>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {enableExpandView && sortedData.length > 0 && (
                                <Button 
                                    onClick={handleExpand} 
                                    size="sm" 
                                    variant="outline"
                                    title="Xem tất cả"
                                >
                                    <Maximize2 className="mr-2 h-4 w-4" />
                                    Xem tất cả
                                </Button>
                            )}
                            {onAdd && (
                                <Button onClick={onAdd} size="sm" variant={addButtonVariant}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {addLabel}
                                </Button>
                            )}
                        </div>
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
                    <>
                        <div className="relative overflow-hidden">
                            <ScrollArea
                                className={cn(
                                    "w-full",
                                    enableHorizontalScroll && "overflow-x-auto"
                                )}
                                style={{
                                    maxHeight: compactMode ? "auto" : maxHeight,
                                }}
                            >
                                <div className={cn(
                                    enableHorizontalScroll && "min-w-full"
                                )}>
                                    <Table>
                                        {/* Header - Sticky */}
                                        <TableHeader 
                                            className={cn(
                                                "bg-background",
                                                enableStickyHeader && "sticky top-0 z-10 shadow-sm"
                                            )}
                                            style={enableStickyHeader ? {
                                                boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                                            } : undefined}
                                        >
                                            <TableRow>
                                                {visibleColumns.map((column, colIndex) => (
                                                    <TableHead
                                                        key={column.key}
                                                        className={cn(
                                                            column.className,
                                                            column.stickyLeft && "sticky bg-background z-20"
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
                                        {/* Body - Scrollable */}
                                        <TableBody>
                                            {displayData.map((item, index) => (
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
                        {/* Compact mode: Show more indicator */}
                        {compactMode && remainingCount > 0 && showMoreIndicator && (
                            <div className="border-t bg-muted/30 px-4 py-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleExpand}
                                    className="w-full justify-between"
                                >
                                    <span className="text-sm text-muted-foreground">
                                        Xem thêm {remainingCount} mục
                                    </span>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
        {/* Expand Dialog */}
        {enableExpandView && (
            <EmbeddedListFullViewDialog
                open={expandDialogOpen}
                onOpenChange={setExpandDialogOpen}
                title={expandDialogTitle || title}
                data={sortedData}
                columns={columns}
                onRowClick={onRowClick}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                showActions={showActions}
                getItemId={getItemId}
                defaultSortField={defaultSortField}
                defaultSortDirection={defaultSortDirection}
                customSort={customSort}
                maxWidth={expandDialogMaxWidth}
                maxHeight={expandDialogMaxHeight}
                enableSearch={enableSearch}
                searchPlaceholder={searchPlaceholder}
                searchFields={searchFields}
            />
        )}
        </>
    )
}

