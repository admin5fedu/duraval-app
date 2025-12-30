"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChamOle } from "../schema"
import { useChamOle, useBatchDeleteChamOle, useDeleteChamOle } from "../hooks"
import { chamOleColumns } from "./cham-ole-columns"
import { chamOleConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { ChamOleAPI } from "../services/cham-ole.api"
import { chamOleQueryKeys } from "@/lib/react-query/query-keys"
import { useBatchUpsertChamOle } from "../actions/cham-ole-excel-actions"
import { ChamOleImportDialog } from "./cham-ole-import-dialog"
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

interface ChamOleListViewProps {
    initialData?: ChamOle[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function ChamOleListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: ChamOleListViewProps = {}) {
    const { data: chamOleList, isLoading, isError, refetch } = useChamOle(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteChamOle()
    const deleteMutation = useDeleteChamOle()
    const batchImportMutation = useBatchUpsertChamOle()
    const module = chamOleConfig.moduleName
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<ChamOle | null>(null)
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)

    const columns = React.useMemo(() => {
        return chamOleColumns
    }, [])

    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, chamOleConfig.defaultSorting || [])

    const { data: phongList } = useQuery({
        queryKey: [...chamOleQueryKeys.all(), "phong-filter"],
        queryFn: () => ChamOleAPI.getUniquePhongIds(),
        staleTime: 10 * 60 * 1000,
    })

    const { data: namList } = useQuery({
        queryKey: [...chamOleQueryKeys.all(), "nam-filter"],
        queryFn: () => ChamOleAPI.getUniqueNam(),
        staleTime: 10 * 60 * 1000,
    })

    const { data: thangList } = useQuery({
        queryKey: [...chamOleQueryKeys.all(), "thang-filter"],
        queryFn: () => ChamOleAPI.getUniqueThang(),
        staleTime: 10 * 60 * 1000,
    })

    const { data: chucVuList } = useQuery({
        queryKey: [...chamOleQueryKeys.all(), "chuc-vu-filter"],
        queryFn: () => ChamOleAPI.getUniqueChucVuIds(),
        staleTime: 10 * 60 * 1000,
    })

    const { data: danhGiaList } = useQuery({
        queryKey: [...chamOleQueryKeys.all(), "danh-gia-filter"],
        queryFn: () => ChamOleAPI.getUniqueDanhGia(),
        staleTime: 10 * 60 * 1000,
    })

    const { data: nhanVienList } = useQuery({
        queryKey: [...chamOleQueryKeys.all(), "nhan-vien-filter"],
        queryFn: () => ChamOleAPI.getUniqueNhanVienIds(),
        staleTime: 10 * 60 * 1000,
    })

    const filters = React.useMemo(() => {
        const baseFilters = (chamOleConfig.filterColumns || []).map((filter) => {
            // Populate nhan_vien_id filter with dynamic options
            if (filter.columnId === "nhan_vien_id") {
                return {
                    ...filter,
                    options: (nhanVienList || [])
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
                }
            }
            if (filter.columnId === "phong_id") {
                return {
                    ...filter,
                    options: (phongList || [])
                        .filter((item) => item.id != null)
                        .map((item) => {
                            const label = item.ma_phong_ban && item.ten !== `ID: ${item.id}` 
                                ? `${item.ma_phong_ban} - ${item.ten}` 
                                : (item.ten || String(item.id))
                            return {
                                label,
                                value: String(item.id),
                            }
                        }),
                }
            }
            if (filter.columnId === "nam") {
                return {
                    ...filter,
                    options: (namList || []).map((nam) => ({
                        label: String(nam),
                        value: String(nam),
                    })),
                }
            }
            if (filter.columnId === "thang") {
                return {
                    ...filter,
                    options: (thangList || []).map((thang) => ({
                        label: String(thang),
                        value: String(thang),
                    })),
                }
            }
            // Populate chuc_vu_id filter with dynamic options
            if (filter.columnId === "chuc_vu_id") {
                return {
                    ...filter,
                    options: (chucVuList || [])
                        .filter((item) => item.id != null)
                        .map((item) => ({
                            label: item.ten || String(item.id),
                            value: String(item.id),
                        })),
                }
            }
            // danh_gia filter already has static options in config
            return filter
        })
        
        return baseFilters
    }, [nhanVienList, phongList, namList, thangList, chucVuList, danhGiaList])

    const renderMobileCard = React.useCallback((row: ChamOle) => {
        const nhanVien = row.nhan_vien
        return (
            <div className="flex flex-col gap-3 w-full">
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base">
                                {nhanVien ? `${nhanVien.ma_nhan_vien} - ${nhanVien.ho_ten}` : `ID: ${row.id}`}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.nam && (
                        <p className="leading-snug">
                            Năm: <span className="font-medium text-foreground">{row.nam}</span>
                        </p>
                    )}
                    {row.thang && (
                        <p className="leading-snug">
                            Tháng: <span className="font-medium text-foreground">{row.thang}</span>
                        </p>
                    )}
                    {row.phong_ban && (
                        <p className="leading-snug">
                            Phòng: <span className="font-medium text-foreground">{row.phong_ban.ma_phong_ban} - {row.phong_ban.ten_phong_ban}</span>
                        </p>
                    )}
                    {row.chuc_vu && (
                        <p className="leading-snug">
                            Chức Vụ: <span className="font-medium text-foreground">{row.chuc_vu.ten_chuc_vu}</span>
                        </p>
                    )}
                    {row.danh_gia && (
                        <p className="leading-snug">
                            Đánh Giá: <span className="font-medium text-foreground">{row.danh_gia}</span>
                        </p>
                    )}
                    {row.ole !== null && row.ole !== undefined && (
                        <p className="leading-snug">
                            OLE: <span className="font-medium text-foreground">{row.ole}</span>
                        </p>
                    )}
                </div>
            </div>
        )
    }, [])

    const getColumnTitle = React.useCallback((columnId: string) => {
        const column = columns.find((col) => {
            const id = (col as any).id
            const accessorKey = (col as any).accessorKey
            return id === columnId || accessorKey === columnId
        })
        return (column?.meta as any)?.title || columnId
    }, [columns])

    const getCellValue = React.useCallback((row: ChamOle, columnId: string) => {
        if (columnId === "select" || columnId === "actions") {
            return ""
        }
        
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
            const value = (row as any)[columnId]
            if (!value) return ""
            const { format } = require("date-fns")
            const { vi } = require("date-fns/locale")
            return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
        }
        if (columnId === "nhan_vien_id") {
            const nhanVien = row.nhan_vien
            if (!nhanVien) return ""
            return `${nhanVien.ma_nhan_vien} - ${nhanVien.ho_ten}`
        }
        if (columnId === "phong_id") {
            const phongBan = row.phong_ban
            if (!phongBan) return ""
            return `${phongBan.ma_phong_ban} - ${phongBan.ten_phong_ban}`
        }
        if (columnId === "chuc_vu_id") {
            const chucVu = row.chuc_vu
            if (!chucVu) return ""
            return chucVu.ten_chuc_vu
        }
        if (columnId === "danh_gia") {
            return row.danh_gia || ""
        }
        if (columnId === "ole" || columnId === "kpi" || columnId === "cong" || columnId === "tru") {
            const value = (row as any)[columnId]
            if (value === null || value === undefined) return "0"
            return Number(value).toLocaleString("vi-VN")
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
                data={chamOleList || []}
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
                        navigate(`${chamOleConfig.routePath}/${row.id}`)
                    }
                }}
                onAdd={() => {
                    if (onAddNew) {
                        onAddNew()
                    } else {
                        navigate(`${chamOleConfig.routePath}/moi`)
                    }
                }}
                addHref={`${chamOleConfig.routePath}/moi`}
                onBack={() => {
                    navigate(chamOleConfig.parentPath)
                }}
                onDeleteSelected={async (selectedRows) => {
                    const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                    await batchDeleteMutation.mutateAsync(ids)
                }}
                batchDeleteConfig={{
                    itemName: "chấm OLE",
                    moduleName: chamOleConfig.moduleTitle,
                    isLoading: batchDeleteMutation.isPending,
                    getItemLabel: (item: ChamOle) => {
                        const nhanVien = item.nhan_vien
                        return nhanVien ? `${nhanVien.ma_nhan_vien} - ${nhanVien.ho_ten}` : String(item.id)
                    },
                }}
                filters={filters}
                searchFields={chamOleConfig.searchFields as (keyof ChamOle)[]}
                module={module}
                enableSuggestions={true}
                enableRangeSelection={true}
                enableLongPress={true}
                persistSelection={false}
                renderMobileCard={renderMobileCard}
                enableVirtualization={(chamOleList?.length || 0) > 100}
                virtualRowHeight={60}
                exportOptions={{
                    columns: columns,
                    totalCount: chamOleList?.length || 0,
                    moduleName: chamOleConfig.moduleTitle,
                    getColumnTitle,
                    getCellValue,
                }}
                onEdit={(row) => {
                    if (onEdit) {
                        onEdit(row.id!)
                    } else {
                        navigate(`${chamOleConfig.routePath}/${row.id}/sua`)
                    }
                }}
                onDelete={(row) => {
                    setRowToDelete(row)
                    setDeleteDialogOpen(true)
                }}
                onImport={() => setImportDialogOpen(true)}
                isImporting={batchImportMutation.isPending}
            />
            
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa chấm OLE <strong>
                                {rowToDelete?.nhan_vien 
                                    ? `${rowToDelete.nhan_vien.ma_nhan_vien} - ${rowToDelete.nhan_vien.ho_ten}`
                                    : `ID: ${rowToDelete?.id}`
                                }
                            </strong>? Hành động này không thể hoàn tác.
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
            <ChamOleImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />
        </>
    )
}

