"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { BaiThi } from "../schema"
import { useBaiThi, useBatchDeleteBaiThi, useDeleteBaiThi } from "../hooks"
import { useBatchUpsertBaiThi } from "../actions/bai-thi-excel-actions"
import { BaiThiImportDialog } from "./bai-thi-import-dialog"
import { baiThiColumns } from "./bai-thi-columns"
import { baiThiConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import type { SortingState } from "@tanstack/react-table"
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
import { useKyThi } from "../../ky-thi/hooks"
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks"
import { usePhongBan } from "@/features/he-thong/so-do/phong-ban/hooks"
import { useNhomChuyenDe } from "../../nhom-chuyen-de/hooks"

interface BaiThiListViewProps {
    initialData?: BaiThi[]
    onEdit?: (id: number) => void
    onView?: (id: number) => void
}

export function BaiThiListView({ 
    initialData,
    onEdit,
    onView,
}: BaiThiListViewProps = {}) {
    const { data: baiThiList, isLoading, isError, refetch } = useBaiThi(initialData)
    const { data: kyThiList } = useKyThi()
    const { data: nhanSuList } = useNhanSu()
    const { data: phongBanList } = usePhongBan()
    const { data: nhomChuyenDeList } = useNhomChuyenDe()
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteBaiThi()
    const deleteMutation = useDeleteBaiThi()
    const batchImportMutation = useBatchUpsertBaiThi()
    const module = baiThiConfig.moduleName || "bai-thi"
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<BaiThi | null>(null)

    // Create columns - pass data as params to pure function
    const columns = React.useMemo(() => {
        try {
            const cols = baiThiColumns(kyThiList, nhanSuList, phongBanList, nhomChuyenDeList)
            return Array.isArray(cols) ? cols : []
        } catch (error) {
            console.error("Error creating columns:", error)
            return []
        }
    }, [kyThiList, nhanSuList, phongBanList, nhomChuyenDeList]) // Safe: no hooks inside baiThiColumns anymore

    // Ensure defaultSorting is a valid array - define before passing to useListViewFilters
    const defaultSorting = React.useMemo<SortingState>(() => [{ id: "ngay_lam_bai", desc: true }], [])

    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, defaultSorting)

    const filters = React.useMemo(() => {
        const filterCols = baiThiConfig?.filterColumns || []
        
        // Add phong_id filter with options from phongBanList
        const phongFilter = phongBanList && phongBanList.length > 0 ? {
            columnId: "phong_id",
            title: "Phòng",
            options: phongBanList
                .filter(pb => pb.id !== undefined)
                .map(pb => ({
                    label: `${pb.ma_phong_ban} - ${pb.ten_phong_ban}`,
                    value: String(pb.id),
                })),
        } : null

        // Add nhom_id filter with options from nhomChuyenDeList
        const nhomFilter = nhomChuyenDeList && nhomChuyenDeList.length > 0 ? {
            columnId: "nhom_id",
            title: "Nhóm",
            options: nhomChuyenDeList
                .filter(nhom => nhom.id !== undefined)
                .map(nhom => ({
                    label: nhom.ten_nhom || `ID: ${nhom.id}`,
                    value: String(nhom.id),
                })),
        } : null

        // Combine static filters with dynamic filters
        const allFilters = [...filterCols]
        if (phongFilter) allFilters.push(phongFilter)
        if (nhomFilter) allFilters.push(nhomFilter)
        
        return allFilters
    }, [phongBanList, nhomChuyenDeList])

    const handleEditClick = (id: number) => {
        if (onEdit) {
            onEdit(id)
        } else {
            navigate(`${baiThiConfig.routePath}/${id}/sua`)
        }
    }

    const handleViewClick = (id: number) => {
        if (onView) {
            onView(id)
        } else {
            navigate(`${baiThiConfig.routePath}/${id}`)
        }
    }

    const handleAddNewClick = () => {
        navigate(`${baiThiConfig.routePath}/moi`)
    }

    const renderMobileCard = React.useCallback((row: BaiThi) => {
        const kyThi = kyThiList?.find(kt => kt.id === row.ky_thi_id)
        const nhanVien = nhanSuList?.find(ns => ns.ma_nhan_vien === row.nhan_vien_id)
        
        let trangThaiVariant: "default" | "secondary" | "destructive" | "outline" = "secondary"
        if (row.trang_thai === "Đạt") {
            trangThaiVariant = "default"
        } else if (row.trang_thai === "Không đạt") {
            trangThaiVariant = "destructive"
        } else if (row.trang_thai === "Đang thi") {
            trangThaiVariant = "outline"
        }

        return (
            <div className="flex flex-col gap-3 w-full">
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base text-foreground leading-tight line-clamp-2 block">
                                {kyThi?.ten_ky_thi || `Kỳ thi #${row.ky_thi_id}`}
                            </span>
                            {nhanVien && (
                                <span className="text-sm text-muted-foreground">
                                    {nhanVien.ma_nhan_vien} - {nhanVien.ho_ten}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Badge variant={trangThaiVariant}>
                            {row.trang_thai}
                        </Badge>
                        {row.diem_so !== null && row.diem_so !== undefined && (
                            <span className="font-medium text-foreground">
                                {row.diem_so}/{row.tong_so_cau || 0} điểm
                            </span>
                        )}
                    </div>
                    {row.ngay_lam_bai && (
                        <p className="leading-snug">
                            Ngày làm bài: <span className="font-medium text-foreground">
                                {format(new Date(row.ngay_lam_bai), "dd/MM/yyyy", { locale: vi })}
                            </span>
                        </p>
                    )}
                    {row.thoi_gian_bat_dau && (
                        <p className="leading-snug">
                            Bắt đầu: <span className="font-medium text-foreground">
                                {format(new Date(row.thoi_gian_bat_dau), "dd/MM/yyyy HH:mm", { locale: vi })}
                            </span>
                        </p>
                    )}
                    {row.thoi_gian_ket_thuc && (
                        <p className="leading-snug">
                            Kết thúc: <span className="font-medium text-foreground">
                                {format(new Date(row.thoi_gian_ket_thuc), "dd/MM/yyyy HH:mm", { locale: vi })}
                            </span>
                        </p>
                    )}
                </div>
            </div>
        )
    }, [kyThiList, nhanSuList])

    const getColumnTitle = React.useCallback((columnId: string) => {
        const column = columns.find((col) => {
            const id = (col as any).id
            const accessorKey = (col as any).accessorKey
            return id === columnId || accessorKey === columnId
        })
        return (column?.meta as any)?.title || columnId
    }, [columns])

    const getCellValue = React.useCallback((row: BaiThi, columnId: string) => {
        if (columnId === "ngay_lam_bai") {
            return format(new Date(row.ngay_lam_bai), "dd/MM/yyyy", { locale: vi })
        }
        if (columnId === "thoi_gian_bat_dau" || columnId === "thoi_gian_ket_thuc" || columnId === "tg_tao" || columnId === "tg_cap_nhat") {
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách bài thi</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
            <GenericListView
                data={baiThiList || []}
                columns={columns}
                filterColumn=""
                module={module}
                searchFields={baiThiConfig.searchFields as (keyof BaiThi)[]}
                filters={filters}
                initialFilters={initialFilters}
                initialSearch={initialSearch}
                initialSorting={initialSorting}
                onFiltersChange={handleFiltersChange}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                onDeleteSelected={async (selectedRows) => {
                    const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                    await batchDeleteMutation.mutateAsync(ids)
                    refetch()
                }}
                batchDeleteConfig={{
                    itemName: "bài thi",
                    moduleName: baiThiConfig.moduleTitle,
                    isLoading: batchDeleteMutation.isPending,
                    getItemLabel: (item: BaiThi) => `Bài thi #${item.id}`,
                }}
                onBack={() => {
                    navigate(baiThiConfig.parentPath)
                }}
                enableSuggestions={true}
                enableRangeSelection={true}
                enableLongPress={true}
                persistSelection={false}
                renderMobileCard={renderMobileCard}
                enableVirtualization={(baiThiList?.length || 0) > 100}
                virtualRowHeight={60}
                exportOptions={{
                    columns: columns,
                    totalCount: baiThiList?.length || 0,
                    moduleName: baiThiConfig.moduleTitle,
                    getColumnTitle,
                    getCellValue,
                }}
                onAdd={handleAddNewClick}
                addHref={`${baiThiConfig.routePath}/moi`}
                onEdit={(row) => handleEditClick(row.id!)}
                onDelete={(row) => {
                    setRowToDelete(row)
                    setDeleteDialogOpen(true)
                }}
                onRowClick={(row) => handleViewClick(row.id!)}
                onImport={() => setImportDialogOpen(true)}
                isImporting={batchImportMutation.isPending}
            />

            {/* Import Dialog */}
            <BaiThiImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa bài thi <strong>#{rowToDelete?.id || "này"}</strong>? Hành động này không thể hoàn tác.
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
                                        refetch()
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

