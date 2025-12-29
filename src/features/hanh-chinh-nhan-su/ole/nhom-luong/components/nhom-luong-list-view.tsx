"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { NhomLuong } from "../schema"
import { useNhomLuong, useBatchDeleteNhomLuong, useDeleteNhomLuong } from "../hooks"
import { nhomLuongColumns } from "./nhom-luong-columns"
import { nhomLuongConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { NhomLuongAPI } from "../services/nhom-luong.api"
import { nhomLuongQueryKeys } from "@/lib/react-query/query-keys"
import { useBatchUpsertNhomLuong } from "../actions/nhom-luong-excel-actions"
import { NhomLuongImportDialog } from "./nhom-luong-import-dialog"
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

interface NhomLuongListViewProps {
    initialData?: NhomLuong[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function NhomLuongListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: NhomLuongListViewProps = {}) {
    const { data: nhomLuongList, isLoading, isError, refetch } = useNhomLuong(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteNhomLuong()
    const deleteMutation = useDeleteNhomLuong()
    const batchImportMutation = useBatchUpsertNhomLuong()
    const module = nhomLuongConfig.moduleName
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<NhomLuong | null>(null)
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)

    // Create columns
    const columns = React.useMemo(() => {
        return nhomLuongColumns
    }, [])

    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, nhomLuongConfig.defaultSorting || [])

    // Fetch unique người tạo for filter
    const { data: nguoiTaoList } = useQuery({
        queryKey: [...nhomLuongQueryKeys.all(), "nguoi-tao-filter"],
        queryFn: () => NhomLuongAPI.getUniqueNguoiTaoIds(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    // Build filters array from config with dynamic options
    const filters = React.useMemo(() => {
        const baseFilters: any[] = []
        
        // Add nguoi_tao_id filter
        if (nguoiTaoList && nguoiTaoList.length > 0) {
            baseFilters.push({
                columnId: "nguoi_tao_id",
                title: "Người Tạo",
                options: nguoiTaoList
                    .filter((item) => item.id != null)
                    .map((item) => {
                        const maNhanVien = item.ma_nhan_vien || item.id
                        const label = item.ten && item.ten !== `ID: ${item.id}` 
                            ? `${maNhanVien} - ${item.ten}` 
                            : String(maNhanVien)
                        return {
                            label,
                            value: String(item.id),
                        }
                    }),
            })
        }
        
        return baseFilters
    }, [nguoiTaoList])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: NhomLuong) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base">{row.ten_nhom}</span>
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.mo_ta && (
                        <p className="leading-snug">
                            Mô tả: <span className="font-medium text-foreground">{row.mo_ta}</span>
                        </p>
                    )}
                    {row.nguoi_tao_id && (
                        <p className="leading-snug">
                            Người Tạo: <span className="font-medium text-foreground">{row.nguoi_tao_ten ? `${row.nguoi_tao_id} - ${row.nguoi_tao_ten}` : row.nguoi_tao_id}</span>
                        </p>
                    )}
                    {row.tg_tao && (
                        <p className="leading-snug">
                            Ngày tạo: <span className="font-medium text-foreground">{format(new Date(row.tg_tao), "dd/MM/yyyy", { locale: vi })}</span>
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

    const getCellValue = React.useCallback((row: NhomLuong, columnId: string) => {
        // Skip select and actions columns
        if (columnId === "select" || columnId === "actions") {
            return ""
        }
        
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
            const value = (row as any)[columnId]
            if (!value) return ""
            return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
        }
        if (columnId === "nguoi_tao_id") {
            const nguoiTaoId = row.nguoi_tao_id
            const nguoiTaoTen = row.nguoi_tao_ten
            const nguoiTaoMaNhanVien = (row as any).nguoi_tao?.ma_nhan_vien as number | null
            if (!nguoiTaoId) return ""
            const maNhanVien = nguoiTaoMaNhanVien || nguoiTaoId
            return nguoiTaoTen ? `${maNhanVien} - ${nguoiTaoTen}` : maNhanVien.toString()
        }
        if (columnId === "id") {
            return row.id?.toString() || ""
        }
        return (row as any)[columnId] ?? ""
    }, [])

    if (isLoading && !initialData) {
        return (
            <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Có lỗi xảy ra khi tải dữ liệu</p>
                    <Button onClick={() => refetch()}>Thử lại</Button>
                </div>
            </div>
        )
    }

    return (
        <>
            <GenericListView
                columns={columns}
                data={nhomLuongList || []}
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
                        navigate(`${nhomLuongConfig.routePath}/${row.id}`)
                    }
                }}
                onAdd={() => {
                    if (onAddNew) {
                        onAddNew()
                    } else {
                        navigate(`${nhomLuongConfig.routePath}/moi`)
                    }
                }}
                addHref={`${nhomLuongConfig.routePath}/moi`}
                onBack={() => {
                    navigate(nhomLuongConfig.parentPath)
                }}
                onDeleteSelected={async (selectedRows) => {
                    const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                    await batchDeleteMutation.mutateAsync(ids)
                }}
                batchDeleteConfig={{
                    itemName: "nhóm lương",
                    moduleName: nhomLuongConfig.moduleTitle,
                    isLoading: batchDeleteMutation.isPending,
                    getItemLabel: (item: NhomLuong) => item.ten_nhom || String(item.id),
                }}
                filters={filters}
                searchFields={nhomLuongConfig.searchFields as (keyof NhomLuong)[]}
                module={module}
                enableSuggestions={true}
                enableRangeSelection={true}
                enableLongPress={true}
                persistSelection={false}
                renderMobileCard={renderMobileCard}
                enableVirtualization={(nhomLuongList?.length || 0) > 100}
                virtualRowHeight={60}
                exportOptions={{
                    columns: columns,
                    totalCount: nhomLuongList?.length || 0,
                    moduleName: nhomLuongConfig.moduleTitle,
                    getColumnTitle,
                    getCellValue,
                }}
                onEdit={(row) => {
                    if (onEdit) {
                        onEdit(row.id!)
                    } else {
                        navigate(`${nhomLuongConfig.routePath}/${row.id}/sua`)
                    }
                }}
                onDelete={(row) => {
                    setRowToDelete(row)
                    setDeleteDialogOpen(true)
                }}
                onImport={() => setImportDialogOpen(true)}
                isImporting={batchImportMutation.isPending}
            />
            
            {/* Delete confirmation dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa nhóm lương <strong>{rowToDelete?.ten_nhom}</strong>? Hành động này không thể hoàn tác.
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
                                        // Error handled by mutation
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

            {/* Import Dialog */}
            <NhomLuongImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />
        </>
    )
}

