"use client"

import { Button } from "@/components/ui/button"
import { Plus, Eye, Edit, Trash2 } from "lucide-react"
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

export interface EmbeddedListColumn<T> {
    key: string
    header: string
    render: (item: T) => React.ReactNode
    className?: string
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
    className
}: EmbeddedListSectionProps<T>) {
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
            <CardContent>
                {data.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        {emptyStateIcon && (() => {
                            const EmptyIcon = emptyStateIcon
                            return <EmptyIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        })()}
                        <p>{emptyMessage}</p>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableHead key={column.key} className={column.className}>
                                            {column.header}
                                        </TableHead>
                                    ))}
                                    {hasActions && (
                                        <TableHead className="text-right w-[120px]">Thao tác</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, index) => (
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
                                            <TableCell className="text-right">
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
                )}
            </CardContent>
        </Card>
    )
}

