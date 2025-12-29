"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { PhieuHanhChinh } from "../schema"
import { usePhieuHanhChinh, useBatchDeletePhieuHanhChinh, useDeletePhieuHanhChinh } from "../hooks"
import { phieuHanhChinhColumns } from "./phieu-hanh-chinh-columns"
import { phieuHanhChinhConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useQuery } from "@tanstack/react-query"
import { PhieuHanhChinhAPI } from "../services/phieu-hanh-chinh.api"
import { phieuHanhChinhQueryKeys } from "@/lib/react-query/query-keys"
import { Badge } from "@/components/ui/badge"
import { useBatchUpsertPhieuHanhChinh } from "../actions/phieu-hanh-chinh-excel-actions"
import { PhieuHanhChinhImportDialog } from "./phieu-hanh-chinh-import-dialog"
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

interface PhieuHanhChinhListViewProps {
    initialData?: PhieuHanhChinh[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function PhieuHanhChinhListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: PhieuHanhChinhListViewProps = {}) {
    const { data: phieuList, isLoading, isError, refetch } = usePhieuHanhChinh(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeletePhieuHanhChinh()
    const deleteMutation = useDeletePhieuHanhChinh()
    const batchImportMutation = useBatchUpsertPhieuHanhChinh()
    const module = phieuHanhChinhConfig.moduleName
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<PhieuHanhChinh | null>(null)
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)

    // Create columns
    const columns = React.useMemo(() => {
        return phieuHanhChinhColumns
    }, [])

    // Set initial column visibility - chỉ hiển thị các cột quan trọng mặc định
    const initialColumnVisibility = React.useMemo(() => {
        // Các cột hiển thị mặc định: Ngày, Loại Phiếu, Mã Phiếu, Ca, Trạng Thái, Người Tạo, Thời gian tạo, Actions
        // Các cột ẩn mặc định: Số Giờ, Lý Do, Cơm Trưa, Phương Tiện, QL Duyệt, Tên Quản Lý, TG QL Duyệt, HCNS Duyệt, Tên HCNS, TG HCNS Duyệt, Thời gian cập nhật
        return {
            so_gio: false,
            ly_do: false,
            com_trua: false,
            phuong_tien: false,
            quan_ly_duyet: false,
            ten_quan_ly: false,
            tg_quan_ly_duyet: false,
            hcns_duyet: false,
            ten_hcns: false,
            tg_hcns_duyet: false,
            tg_cap_nhat: false,
        }
    }, [])

    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, phieuHanhChinhConfig.defaultSorting || [])

    // Fetch unique loại phiếu for filter
    const { data: loaiPhieuList } = useQuery({
        queryKey: [...phieuHanhChinhQueryKeys.all(), "loai-phieu-filter"],
        queryFn: () => PhieuHanhChinhAPI.getUniqueLoaiPhieu(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    // Fetch unique người tạo for filter
    const { data: nguoiTaoList } = useQuery({
        queryKey: [...phieuHanhChinhQueryKeys.all(), "nguoi-tao-filter"],
        queryFn: () => PhieuHanhChinhAPI.getUniqueNguoiTao(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    // Generate filter options for ngày from data (similar to ngay_bao_cao in viec-hang-ngay)
    const ngayOptions = React.useMemo(() => {
        if (!phieuList) return []
        const uniqueDates = new Set<string>()
        for (const item of phieuList) {
            if (item.ngay) {
                try {
                    const dateObj = new Date(item.ngay)
                    const dateStr = format(dateObj, "dd/MM/yyyy", { locale: vi })
                    uniqueDates.add(dateStr)
                } catch {
                    // If date parsing fails, use original string
                    uniqueDates.add(String(item.ngay))
                }
            }
        }
        return Array.from(uniqueDates).sort((a, b) => {
            // Sort dates in descending order (newest first)
            try {
                const dateA = new Date(a.split('/').reverse().join('-'))
                const dateB = new Date(b.split('/').reverse().join('-'))
                return dateB.getTime() - dateA.getTime()
            } catch {
                return b.localeCompare(a)
            }
        }).map(d => ({ label: d, value: d }))
    }, [phieuList])

    // Generate filter options for mã phiếu from data
    const maPhieuOptions = React.useMemo(() => {
        if (!phieuList) return []
        const uniqueMaPhieu = new Map<string, string>() // ma_phieu -> display text (mã - tên)
        for (const item of phieuList) {
            if (item.ma_phieu && !uniqueMaPhieu.has(item.ma_phieu)) {
                const maPhieu = item.ma_phieu
                const tenNhomPhieu = item.ten_nhom_phieu
                const displayText = tenNhomPhieu 
                    ? `${maPhieu} - ${tenNhomPhieu}`
                    : maPhieu
                uniqueMaPhieu.set(maPhieu, displayText)
            }
        }
        return Array.from(uniqueMaPhieu.entries())
            .sort((a, b) => a[0].localeCompare(b[0])) // Sort by ma_phieu
            .map(([maPhieu, displayText]) => ({ 
                label: displayText, 
                value: maPhieu 
            }))
    }, [phieuList])

    // Build filters array from config with dynamic options
    const filters = React.useMemo(() => {
        const baseFilters = (phieuHanhChinhConfig.filterColumns || []).map((filter) => {
            // Populate loai_phieu filter with dynamic options
            if (filter.columnId === "loai_phieu") {
                return {
                    ...filter,
                    options: (loaiPhieuList || []).map((loai) => ({
                        label: loai,
                        value: loai,
                    })),
                }
            }
            // Populate nguoi_tao_id filter with dynamic options
            if (filter.columnId === "nguoi_tao_id") {
                return {
                    ...filter,
                    options: (nguoiTaoList || []).map((nguoiTao) => ({
                        label: `${nguoiTao.id} - ${nguoiTao.ten}`,
                        value: String(nguoiTao.id),
                    })),
                }
            }
            // Populate ngay filter with dynamic options from data
            if (filter.columnId === "ngay") {
                return {
                    ...filter,
                    options: ngayOptions,
                }
            }
            // Populate ma_phieu filter with dynamic options from data
            if (filter.columnId === "ma_phieu") {
                return {
                    ...filter,
                    options: maPhieuOptions,
                }
            }
            return filter
        })

        return baseFilters
    }, [loaiPhieuList, nguoiTaoList, ngayOptions, maPhieuOptions])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: PhieuHanhChinh) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            {row.ngay && (
                                <span className="font-semibold text-base text-foreground leading-tight truncate block">
                                    {format(new Date(row.ngay), "dd/MM/yyyy", { locale: vi })}
                                </span>
                            )}
                            <Badge variant="outline" className="mt-1">
                                {row.loai_phieu || "-"}
                            </Badge>
                            <span className="font-semibold text-base text-foreground leading-tight truncate block mt-1">
                                {row.ma_phieu}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.ca && (
                        <p className="leading-snug">
                            Ca: <span className="font-medium text-foreground">{row.ca}</span>
                        </p>
                    )}
                    {row.so_gio !== null && row.so_gio !== undefined && (
                        <p className="leading-snug">
                            Số giờ: <span className="font-medium text-foreground">{row.so_gio}</span>
                        </p>
                    )}
                    {row.ly_do && (
                        <p className="leading-snug">
                            Lý do: <span className="font-medium text-foreground">{row.ly_do}</span>
                        </p>
                    )}
                    {row.trang_thai && (
                        <p className="leading-snug">
                            Trạng thái: <span className="font-medium text-foreground">{row.trang_thai}</span>
                        </p>
                    )}
                    {row.nguoi_tao_id && (
                        <p className="leading-snug">
                            Người Tạo: <span className="font-medium text-foreground">{row.nguoi_tao_ten || String(row.nguoi_tao_id)}</span>
                        </p>
                    )}
                    {row.tg_tao && (
                        <p className="leading-snug">
                            Ngày tạo: <span className="font-medium text-foreground">{format(new Date(row.tg_tao), "dd/MM/yyyy HH:mm", { locale: vi })}</span>
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

    const getCellValue = React.useCallback((row: PhieuHanhChinh, columnId: string) => {
        if (columnId === "ngay") {
            const value = (row as any)[columnId]
            if (!value) return ""
            try {
                return format(new Date(value), "dd/MM/yyyy", { locale: vi })
            } catch {
                return String(value)
            }
        }
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat" || columnId === "tg_quan_ly_duyet" || columnId === "tg_hcns_duyet") {
            const value = (row as any)[columnId]
            if (!value) return ""
            try {
                return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
                return String(value)
            }
        }
        if (columnId === "com_trua" || columnId === "quan_ly_duyet" || columnId === "hcns_duyet") {
            const value = (row as any)[columnId]
            if (value === true) return "Có"
            if (value === false) return "Không"
            return ""
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách phiếu hành chính</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
        <GenericListView
            columns={columns}
            data={phieuList || []}
            filterColumn="ma_phieu"
            initialSorting={initialSorting}
            initialFilters={initialFilters}
            initialSearch={initialSearch}
            initialColumnVisibility={initialColumnVisibility}
            onFiltersChange={handleFiltersChange}
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
            onRowClick={(row) => {
                if (onView) {
                    onView(row.id!)
                } else {
                    navigate(`${phieuHanhChinhConfig.routePath}/${row.id}`)
                }
            }}
            onAdd={() => {
                if (onAddNew) {
                    onAddNew()
                } else {
                    navigate(`${phieuHanhChinhConfig.routePath}/moi`)
                }
            }}
            addHref={`${phieuHanhChinhConfig.routePath}/moi`}
            onBack={() => {
                navigate(phieuHanhChinhConfig.parentPath)
            }}
            onDeleteSelected={async (selectedRows) => {
                const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                await batchDeleteMutation.mutateAsync(ids)
            }}
            batchDeleteConfig={{
                itemName: "phiếu hành chính",
                moduleName: phieuHanhChinhConfig.moduleTitle,
                isLoading: batchDeleteMutation.isPending,
                getItemLabel: (item: PhieuHanhChinh) => item.ma_phieu || String(item.id),
            }}
            filters={filters}
            searchFields={phieuHanhChinhConfig.searchFields as (keyof PhieuHanhChinh)[]}
            module={module}
            enableSuggestions={true}
            enableRangeSelection={true}
            enableLongPress={true}
            persistSelection={false}
            renderMobileCard={renderMobileCard}
            enableVirtualization={(phieuList?.length || 0) > 100}
            virtualRowHeight={60}
            exportOptions={{
                columns: columns,
                totalCount: phieuList?.length || 0,
                moduleName: phieuHanhChinhConfig.moduleTitle,
                getColumnTitle,
                getCellValue,
            }}
            onEdit={(row) => {
                if (onEdit) {
                    onEdit(row.id!)
                } else {
                    navigate(`${phieuHanhChinhConfig.routePath}/${row.id}/sua`)
                }
            }}
            onDelete={(row) => {
                setRowToDelete(row)
                setDeleteDialogOpen(true)
            }}
            onImport={() => setImportDialogOpen(true)}
            isImporting={batchImportMutation.isPending}
        />

            {/* Import Dialog */}
            <PhieuHanhChinhImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa phiếu hành chính <strong>{rowToDelete?.ma_phieu}</strong>? Hành động này không thể hoàn tác.
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

