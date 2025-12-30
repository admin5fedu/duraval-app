"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { DiemCongTru } from "../schema"
import { useDiemCongTru, useBatchDeleteDiemCongTru, useDeleteDiemCongTru } from "../hooks"
import { diemCongTruColumns } from "./diem-cong-tru-columns"
import { diemCongTruConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { DiemCongTruAPI } from "../services/diem-cong-tru.api"
import { diemCongTruQueryKeys } from "@/lib/react-query/query-keys"
import { useBatchUpsertDiemCongTru } from "../actions/diem-cong-tru-excel-actions"
import { DiemCongTruImportDialog } from "./diem-cong-tru-import-dialog"
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

interface DiemCongTruListViewProps {
    initialData?: DiemCongTru[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function DiemCongTruListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: DiemCongTruListViewProps = {}) {
    const { data: diemCongTruList, isLoading, isError, refetch } = useDiemCongTru(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteDiemCongTru()
    const deleteMutation = useDeleteDiemCongTru()
    const batchImportMutation = useBatchUpsertDiemCongTru()
    const module = diemCongTruConfig.moduleName
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<DiemCongTru | null>(null)
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)

    // Create columns
    const columns = React.useMemo(() => {
        return diemCongTruColumns
    }, [])

    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, diemCongTruConfig.defaultSorting || [])

    // Fetch unique values for filters
    const { data: nhanVienList } = useQuery({
        queryKey: [...diemCongTruQueryKeys.all(), "nhan-vien-filter"],
        queryFn: () => DiemCongTruAPI.getUniqueNhanVienIds(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    const { data: phongBanList } = useQuery({
        queryKey: [...diemCongTruQueryKeys.all(), "phong-ban-filter"],
        queryFn: () => DiemCongTruAPI.getUniquePhongBanIds(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    const { data: nguoiTaoList } = useQuery({
        queryKey: [...diemCongTruQueryKeys.all(), "nguoi-tao-filter"],
        queryFn: () => DiemCongTruAPI.getUniqueNguoiTaoIds(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    const { data: loaiList } = useQuery({
        queryKey: [...diemCongTruQueryKeys.all(), "loai-filter"],
        queryFn: () => DiemCongTruAPI.getUniqueLoai(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    const { data: ngayList } = useQuery({
        queryKey: [...diemCongTruQueryKeys.all(), "ngay-filter"],
        queryFn: () => DiemCongTruAPI.getUniqueNgay(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    // Build filters array from config with dynamic options
    const filters = React.useMemo(() => {
        const baseFilters = (diemCongTruConfig.filterColumns || []).map((filter) => {
            // Populate phong_ban_id filter with dynamic options
            if (filter.columnId === "phong_ban_id") {
                return {
                    ...filter,
                    options: (phongBanList || [])
                        .filter((item) => item.id != null)
                        .map((item) => ({
                            label: item.ten || `ID: ${item.id}`,
                            value: String(item.id),
                        })),
                }
            }
            // Populate loai filter with dynamic options
            if (filter.columnId === "loai") {
                return {
                    ...filter,
                    options: (loaiList || []).map((loai) => ({
                        label: loai,
                        value: loai,
                    })),
                }
            }
            // Populate ngay filter with dynamic options
            if (filter.columnId === "ngay") {
                return {
                    ...filter,
                    options: (ngayList || []).map((ngay) => ({
                        label: ngay,
                        value: ngay,
                    })),
                }
            }
            return filter
        })

        // Add additional filters that are not in filterColumns
        const additionalFilters: any[] = []
        
        // Add nhan_vien_id filter
        if (nhanVienList && nhanVienList.length > 0) {
            additionalFilters.push({
                columnId: "nhan_vien_id",
                title: "Nhân Viên",
                options: nhanVienList
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
        
        // Add nguoi_tao_id filter
        if (nguoiTaoList && nguoiTaoList.length > 0) {
            additionalFilters.push({
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
        
        return [...baseFilters, ...additionalFilters]
    }, [nhanVienList, phongBanList, nguoiTaoList, loaiList, ngayList])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: DiemCongTru) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base">{row.ho_va_ten || "-"}</span>
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.ngay && (
                        <p className="leading-snug">
                            Ngày: <span className="font-medium text-foreground">{format(new Date(row.ngay), "dd/MM/yyyy", { locale: vi })}</span>
                        </p>
                    )}
                    {row.phong_ban && (
                        <p className="leading-snug">
                            Phòng Ban: <span className="font-medium text-foreground">{row.phong_ban.ma_phong_ban} - {row.phong_ban.ten_phong_ban}</span>
                        </p>
                    )}
                    {row.loai && (
                        <p className="leading-snug">
                            Loại: <span className="font-medium text-foreground">{row.loai}</span>
                        </p>
                    )}
                    {row.diem !== null && row.diem !== undefined && (
                        <p className="leading-snug">
                            Điểm: <span className="font-medium text-foreground">{row.diem}</span>
                        </p>
                    )}
                    {row.tien !== null && row.tien !== undefined && (
                        <p className="leading-snug">
                            Tiền: <span className="font-medium text-foreground">{row.tien.toLocaleString("vi-VN")}</span>
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

    const getCellValue = React.useCallback((row: DiemCongTru, columnId: string) => {
        // Skip select and actions columns
        if (columnId === "select" || columnId === "actions") {
            return ""
        }
        
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
            const value = (row as any)[columnId]
            if (!value) return ""
            return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
        }
        if (columnId === "ngay") {
            const value = (row as any)[columnId]
            if (!value) return ""
            return format(new Date(value), "dd/MM/yyyy", { locale: vi })
        }
        if (columnId === "nhan_vien_id") {
            const nhanVien = row.nhan_vien
            if (!nhanVien) return ""
            return `${nhanVien.ma_nhan_vien} - ${nhanVien.ho_ten}`
        }
        if (columnId === "phong_ban_id") {
            const phongBan = row.phong_ban
            if (!phongBan) return ""
            return `${phongBan.ma_phong_ban} - ${phongBan.ten_phong_ban}`
        }
        if (columnId === "nhom_luong_id") {
            const nhomLuong = row.nhom_luong
            if (!nhomLuong) return ""
            return nhomLuong.ten_nhom
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
                data={diemCongTruList || []}
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
                        navigate(`${diemCongTruConfig.routePath}/${row.id}`)
                    }
                }}
                onAdd={() => {
                    if (onAddNew) {
                        onAddNew()
                    } else {
                        navigate(`${diemCongTruConfig.routePath}/moi`)
                    }
                }}
                addHref={`${diemCongTruConfig.routePath}/moi`}
                onBack={() => {
                    navigate(diemCongTruConfig.parentPath)
                }}
                onDeleteSelected={async (selectedRows) => {
                    const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                    await batchDeleteMutation.mutateAsync(ids)
                }}
                batchDeleteConfig={{
                    itemName: "điểm cộng trừ",
                    moduleName: diemCongTruConfig.moduleTitle,
                    isLoading: batchDeleteMutation.isPending,
                    getItemLabel: (item: DiemCongTru) => item.ho_va_ten || String(item.id),
                }}
                filters={filters}
                searchFields={diemCongTruConfig.searchFields as (keyof DiemCongTru)[]}
                module={module}
                enableSuggestions={true}
                enableRangeSelection={true}
                enableLongPress={true}
                persistSelection={false}
                renderMobileCard={renderMobileCard}
                enableVirtualization={(diemCongTruList?.length || 0) > 100}
                virtualRowHeight={60}
                exportOptions={{
                    columns: columns,
                    totalCount: diemCongTruList?.length || 0,
                    moduleName: diemCongTruConfig.moduleTitle,
                    getColumnTitle,
                    getCellValue,
                }}
                onEdit={(row) => {
                    if (onEdit) {
                        onEdit(row.id!)
                    } else {
                        navigate(`${diemCongTruConfig.routePath}/${row.id}/sua`)
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
                            Bạn có chắc chắn muốn xóa điểm cộng trừ <strong>{rowToDelete?.ho_va_ten || `ID: ${rowToDelete?.id}`}</strong>? Hành động này không thể hoàn tác.
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
            <DiemCongTruImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />
        </>
    )
}

