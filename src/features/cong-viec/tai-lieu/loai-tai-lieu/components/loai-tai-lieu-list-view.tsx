"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { LoaiTaiLieu } from "../schema"
import { useLoaiTaiLieu, useBatchDeleteLoaiTaiLieu, useDeleteLoaiTaiLieu } from "../hooks"
import { loaiTaiLieuColumns } from "./loai-tai-lieu-columns"
import { loaiTaiLieuConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { LoaiTaiLieuImportDialog } from "./loai-tai-lieu-import-dialog"
import { useBatchUpsertLoaiTaiLieu } from "../actions/loai-tai-lieu-excel-actions"

interface LoaiTaiLieuListViewProps {
    initialData?: LoaiTaiLieu[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function LoaiTaiLieuListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: LoaiTaiLieuListViewProps = {}) {
    const { data: loaiTaiLieuList, isLoading, isError, refetch } = useLoaiTaiLieu(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteLoaiTaiLieu()
    const deleteMutation = useDeleteLoaiTaiLieu()
    const batchImportMutation = useBatchUpsertLoaiTaiLieu()
    const module = loaiTaiLieuConfig.moduleName
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<LoaiTaiLieu | null>(null)

    // Create columns
    const columns = React.useMemo(() => {
        return loaiTaiLieuColumns
    }, [])

    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, [{ id: "tg_tao", desc: true }])

    // Generate filter options from data
    const nguoiTaoOptions = React.useMemo(() => {
        if (!loaiTaiLieuList) return []
        const unique = new Map<number, { id: number; name: string }>()
        
        loaiTaiLieuList.forEach((item) => {
            if (item.nguoi_tao_id && !unique.has(item.nguoi_tao_id)) {
                unique.set(item.nguoi_tao_id, {
                    id: item.nguoi_tao_id,
                    name: item.nguoi_tao_ten || `Mã ${item.nguoi_tao_id}`
                })
            }
        })
        
        return Array.from(unique.values())
            .map(item => ({
                label: `${item.id} - ${item.name}`,
                value: String(item.id)
            }))
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [loaiTaiLieuList])

    // Generate hang_muc filter options
    const hangMucOptions = React.useMemo(() => {
        return [
            { label: "Biểu mẫu & Kế hoạch", value: "Biểu mẫu & Kế hoạch" },
            { label: "Văn bản hệ thống", value: "Văn bản hệ thống" },
        ]
    }, [])

    // Build filters array
    const filters = React.useMemo(() => {
        return [
            {
                columnId: "hang_muc",
                title: "Hạng mục",
                options: hangMucOptions,
            },
            {
                columnId: "nguoi_tao_id",
                title: "Người tạo",
                options: nguoiTaoOptions,
            },
        ]
    }, [hangMucOptions, nguoiTaoOptions])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: LoaiTaiLieu) => {
        // Badge color mapping for hang_muc
        const badgeColorMap: Record<string, string> = {
            "Biểu mẫu & Kế hoạch": "bg-blue-50 text-blue-700 border-blue-200",
            "Văn bản hệ thống": "bg-purple-50 text-purple-700 border-purple-200",
        }
        const badgeClass = row.hang_muc ? badgeColorMap[row.hang_muc] || "bg-gray-50 text-gray-700 border-gray-200" : ""

        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Hạng mục / Loại */}
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                        {row.hang_muc ? (
                            <Badge variant="outline" className={cn(badgeClass, "text-xs")}>
                                {row.hang_muc}
                            </Badge>
                        ) : (
                            <span className="font-semibold text-base text-foreground leading-tight">
                                {row.loai || `ID: ${row.id}`}
                            </span>
                        )}
                        {row.loai && row.hang_muc && (
                            <p className="text-sm text-foreground mt-1 font-medium">
                                {row.loai}
                            </p>
                        )}
                    </div>
                </div>
                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.mo_ta && (
                        <p className="leading-snug line-clamp-2">
                            {row.mo_ta}
                        </p>
                    )}
                    {row.nguoi_tao_ten && (
                        <p className="leading-snug">
                            Người tạo: {row.nguoi_tao_id} - {row.nguoi_tao_ten}
                        </p>
                    )}
                    {row.tg_tao && (
                        <p className="leading-snug">
                            {format(new Date(row.tg_tao), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </p>
                    )}
                </div>
            </div>
        )
    }, [])

    // Export utilities
    const getColumnTitle = React.useCallback((columnId: string) => {
        const column = columns.find((col) => {
            const id = (col as any).id
            const accessorKey = (col as any).accessorKey
            return id === columnId || accessorKey === columnId
        })
        return (column?.meta as any)?.title || columnId
    }, [columns])

    const getCellValue = React.useCallback((row: LoaiTaiLieu, columnId: string) => {
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
            const value = (row as any)[columnId]
            if (!value) return ""
            return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
        }
        return (row as any)[columnId] ?? ""
    }, [])

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <p className="text-destructive mb-4">Lỗi khi tải danh sách loại tài liệu</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
        <GenericListView
            columns={columns}
            data={loaiTaiLieuList || []}
            filterColumn="hang_muc"
            initialSorting={initialSorting}
            initialFilters={initialFilters}
            initialSearch={initialSearch}
            onFiltersChange={handleFiltersChange}
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
            onRowClick={(row) => {
                if (onView) {
                    onView(row.id!)
                } else {
                    navigate(`${loaiTaiLieuConfig.routePath}/${row.id}`)
                }
            }}
            onAdd={() => {
                if (onAddNew) {
                    onAddNew()
                } else {
                    navigate(`${loaiTaiLieuConfig.routePath}/moi`)
                }
            }}
            addHref={`${loaiTaiLieuConfig.routePath}/moi`}
            onBack={() => {
                navigate(loaiTaiLieuConfig.parentPath)
            }}
            onDeleteSelected={async (selectedRows) => {
                const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                await batchDeleteMutation.mutateAsync(ids)
            }}
            batchDeleteConfig={{
                itemName: "loại tài liệu",
                moduleName: loaiTaiLieuConfig.moduleTitle,
                isLoading: batchDeleteMutation.isPending,
                getItemLabel: (item: LoaiTaiLieu) => item.hang_muc || item.loai || String(item.id),
            }}
            searchFields={loaiTaiLieuConfig.searchFields as (keyof LoaiTaiLieu)[]}
            module={module}
            enableSuggestions={true}
            enableRangeSelection={true}
            enableLongPress={true}
            persistSelection={false}
            renderMobileCard={renderMobileCard}
            enableVirtualization={(loaiTaiLieuList?.length || 0) > 100}
            virtualRowHeight={60}
            exportOptions={{
                columns: columns,
                totalCount: loaiTaiLieuList?.length || 0,
                moduleName: loaiTaiLieuConfig.moduleTitle,
                getColumnTitle,
                getCellValue,
            }}
            onEdit={(row) => {
                if (onEdit) {
                    onEdit(row.id!)
                } else {
                    navigate(`${loaiTaiLieuConfig.routePath}/${row.id}/sua?returnTo=list`)
                }
            }}
            onDelete={(row) => {
                setRowToDelete(row)
                setDeleteDialogOpen(true)
            }}
            filters={filters}
            onImport={() => setImportDialogOpen(true)}
            isImporting={batchImportMutation.isPending}
        />

            {/* Import Dialog */}
            <LoaiTaiLieuImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa loại tài liệu</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa loại tài liệu <strong>{rowToDelete?.hang_muc || rowToDelete?.loai || `ID: ${rowToDelete?.id}`}</strong>? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (rowToDelete?.id) {
                                    try {
                                        await deleteMutation.mutateAsync(rowToDelete.id)
                                        setDeleteDialogOpen(false)
                                        setRowToDelete(null)
                                    } catch (error) {
                                        // Error is handled by mutation
                                    }
                                }
                            }}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

