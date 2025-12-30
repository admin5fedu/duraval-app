"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { TrucHat } from "../schema"
import { useTrucHat, useBatchDeleteTrucHat, useDeleteTrucHat } from "../hooks"
import { trucHatColumns } from "./truc-hat-columns"
import { trucHatConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { trucHatQueryKeys } from "@/lib/react-query/query-keys"
import { TrucHatAPI } from "../services/truc-hat.api"
import { TrucHatImportDialog } from "./truc-hat-import-dialog"
import { useBatchUpsertTrucHat } from "../actions/truc-hat-excel-actions"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
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

interface TrucHatListViewProps {
    initialData?: TrucHat[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function TrucHatListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: TrucHatListViewProps = {}) {
    const { data: trucHatList, isLoading, isError, refetch } = useTrucHat(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteTrucHat()
    const deleteMutation = useDeleteTrucHat()
    const module = trucHatConfig.moduleName
    const batchImportMutation = useBatchUpsertTrucHat()
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<TrucHat | null>(null)

    const columns = React.useMemo(() => {
        return trucHatColumns
    }, [])

    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, trucHatConfig.defaultSorting || [])

    const { data: nguoiTaoList } = useQuery({
        queryKey: [...trucHatQueryKeys.all(), "nguoi-tao-filter"],
        queryFn: () => TrucHatAPI.getUniqueNguoiTaoIds(),
        staleTime: 10 * 60 * 1000,
    })

    const { data: nhanVienBhList } = useQuery({
        queryKey: [...trucHatQueryKeys.all(), "nhan-vien-bh-filter"],
        queryFn: () => TrucHatAPI.getUniqueNhanVienBhIds(),
        staleTime: 10 * 60 * 1000,
    })

    const { data: ngayList } = useQuery({
        queryKey: [...trucHatQueryKeys.all(), "ngay-filter"],
        queryFn: () => TrucHatAPI.getUniqueNgay(),
        staleTime: 10 * 60 * 1000,
    })

    const filters = React.useMemo(() => {
        return (trucHatConfig.filterColumns || []).map((filterConfig) => {
            let options = filterConfig.options || []
            
            if (filterConfig.columnId === "ngay" && ngayList) {
                options = ngayList.map((ngay) => {
                    try {
                        const formattedDate = format(new Date(ngay), "dd/MM/yyyy", { locale: vi })
                        return {
                            label: formattedDate,
                            value: formattedDate,
                        }
                    } catch {
                        return {
                            label: ngay,
                            value: ngay,
                        }
                    }
                })
            } else if (filterConfig.columnId === "nhan_vien_bh_id" && nhanVienBhList) {
                options = nhanVienBhList
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
                    })
            } else if (filterConfig.columnId === "nguoi_tao_id" && nguoiTaoList) {
                options = nguoiTaoList
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
                    })
            }
            
            return {
                columnId: filterConfig.columnId,
                title: filterConfig.title,
                options,
            }
        })
    }, [nguoiTaoList, nhanVienBhList, ngayList])

    const handleDeleteSelected = async (selectedRows: TrucHat[]) => {
        const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
        if (ids.length > 0) {
            await batchDeleteMutation.mutateAsync(ids)
        }
    }

    const getColumnTitle = React.useCallback((columnId: string) => {
        const column = columns.find((col) => {
            const id = (col as any).id
            const accessorKey = (col as any).accessorKey
            return id === columnId || accessorKey === columnId
        })
        return (column?.meta as any)?.title || columnId
    }, [columns])

    const getCellValue = React.useCallback((row: TrucHat, columnId: string) => {
        if (columnId === "select" || columnId === "actions") {
            return ""
        }
        
        if (columnId === "ngay") {
            const value = (row as any)[columnId]
            if (!value) return ""
            try {
                return format(new Date(value), "dd/MM/yyyy", { locale: vi })
            } catch {
                return value
            }
        }
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
            const value = (row as any)[columnId]
            if (!value) return ""
            try {
                return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
                return value
            }
        }
        if (columnId === "nhan_vien_bh_id") {
            const nhanVienBh = row.nhan_vien_bh
            if (!nhanVienBh) return ""
            return `${nhanVienBh.ma_nhan_vien} - ${nhanVienBh.ho_ten}`
        }
        if (columnId === "nguoi_tao_id") {
            const nguoiTao = row.nguoi_tao
            if (!nguoiTao) return ""
            return `${nguoiTao.ma_nhan_vien} - ${nguoiTao.ho_ten}`
        }
        if (columnId === "id") {
            return row.id?.toString() || ""
        }
        return (row as any)[columnId] ?? ""
    }, [])

    const renderMobileCard = React.useCallback((row: TrucHat) => {
        return (
            <div className="p-4 border-b space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">
                            {row.khach_hang || `Trục hạt #${row.id}`}
                        </h3>
                        {row.ma_truc && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                                Mã trục: {row.ma_truc}
                            </p>
                        )}
                    </div>
                    {row.trang_thai && (
                        <Badge variant="outline" className="shrink-0">
                            {row.trang_thai}
                        </Badge>
                    )}
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.nhan_vien_bh && (
                        <p className="leading-snug">
                            Nhân viên BH: <span className="font-medium text-foreground">
                                {row.nhan_vien_bh.ma_nhan_vien} - {row.nhan_vien_bh.ho_ten}
                            </span>
                        </p>
                    )}
                    {row.ghi_chu && (
                        <p className="leading-snug">
                            Ghi chú: <span className="font-medium text-foreground">{row.ghi_chu}</span>
                        </p>
                    )}
                </div>
            </div>
        )
    }, [])

    if (isLoading) {
        return (
            <div className="space-y-4 p-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="p-6">
                <div className="text-center text-destructive">
                    <p>Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</p>
                    <Button onClick={() => refetch()} className="mt-4">
                        Thử lại
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <>
            <GenericListView<TrucHat>
                module={module}
                columns={columns}
                data={trucHatList || []}
                filters={filters}
                searchFields={trucHatConfig.searchFields as (keyof TrucHat)[]}
                initialFilters={initialFilters}
                initialSearch={initialSearch}
                initialSorting={initialSorting}
                onFiltersChange={handleFiltersChange}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                onAdd={() => {
                    if (onAddNew) {
                        onAddNew()
                    } else {
                        navigate(`${trucHatConfig.routePath}/moi`)
                    }
                }}
                addHref={`${trucHatConfig.routePath}/moi`}
                onEdit={(row) => {
                    if (onEdit) {
                        onEdit(row.id!)
                    } else {
                        navigate(`${trucHatConfig.routePath}/${row.id}/sua`)
                    }
                }}
                onDelete={(row) => {
                    setRowToDelete(row)
                    setDeleteDialogOpen(true)
                }}
                onRowClick={(row) => {
                    if (onView) {
                        onView(row.id!)
                    } else {
                        navigate(`${trucHatConfig.routePath}/${row.id}`)
                    }
                }}
                onDeleteSelected={handleDeleteSelected}
                onImport={() => setImportDialogOpen(true)}
                isImporting={batchImportMutation.isPending}
                batchDeleteConfig={{
                    itemName: "trục hạt",
                    moduleName: trucHatConfig.moduleTitle,
                    isLoading: batchDeleteMutation.isPending,
                    getItemLabel: (item: TrucHat) => item.khach_hang || `ID: ${item.id}`,
                }}
                enableSuggestions={true}
                enableRangeSelection={true}
                enableLongPress={true}
                persistSelection={false}
                renderMobileCard={renderMobileCard}
                enableVirtualization={(trucHatList?.length || 0) > 100}
                virtualRowHeight={60}
                initialColumnVisibility={{
                    ghi_chu: false,
                    nguoi_tao_id: false,
                    tg_tao: false,
                }}
                exportOptions={{
                    columns: columns,
                    totalCount: trucHatList?.length || 0,
                    moduleName: trucHatConfig.moduleTitle,
                    getColumnTitle,
                    getCellValue,
                }}
            />
            
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa trục hạt <strong>{rowToDelete?.khach_hang || `ID: ${rowToDelete?.id}`}</strong>? Hành động này không thể hoàn tác.
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

            <TrucHatImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />
        </>
    )
}

