"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { NhomPhieuHanhChinh } from "../schema"
import { useNhomPhieuHanhChinh, useBatchDeleteNhomPhieuHanhChinh, useDeleteNhomPhieuHanhChinh } from "../hooks"
import { nhomPhieuHanhChinhColumns } from "./nhom-phieu-hanh-chinh-columns"
import { nhomPhieuHanhChinhConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertNhomPhieuHanhChinh } from "../actions/nhom-phieu-hanh-chinh-excel-actions"
import { NhomPhieuHanhChinhImportDialog } from "./nhom-phieu-hanh-chinh-import-dialog"
import { useQuery } from "@tanstack/react-query"
import { NhomPhieuHanhChinhAPI } from "../services/nhom-phieu-hanh-chinh.api"
import { nhomPhieuHanhChinhQueryKeys } from "@/lib/react-query/query-keys"
import { Badge } from "@/components/ui/badge"
import { getLoaiPhieuBadgeClass } from "../utils/loai-phieu-colors"
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

interface NhomPhieuHanhChinhListViewProps {
    initialData?: NhomPhieuHanhChinh[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function NhomPhieuHanhChinhListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: NhomPhieuHanhChinhListViewProps = {}) {
    const { data: nhomPhieuList, isLoading, isError, refetch } = useNhomPhieuHanhChinh(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteNhomPhieuHanhChinh()
    const deleteMutation = useDeleteNhomPhieuHanhChinh()
    const batchImportMutation = useBatchUpsertNhomPhieuHanhChinh()
    const module = nhomPhieuHanhChinhConfig.moduleName
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<NhomPhieuHanhChinh | null>(null)
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)

    // Create columns
    const columns = React.useMemo(() => {
        return nhomPhieuHanhChinhColumns
    }, [])

    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, nhomPhieuHanhChinhConfig.defaultSorting || [])

    // Fetch unique người tạo for filter
    const { data: nguoiTaoList } = useQuery({
        queryKey: [...nhomPhieuHanhChinhQueryKeys.all(), "nguoi-tao-filter"],
        queryFn: () => NhomPhieuHanhChinhAPI.getUniqueNguoiTaoIds(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    // Fetch unique loại phiếu for filter
    const { data: loaiPhieuList } = useQuery({
        queryKey: [...nhomPhieuHanhChinhQueryKeys.all(), "loai-phieu-filter"],
        queryFn: () => NhomPhieuHanhChinhAPI.getUniqueLoaiPhieu(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    // Build filters array from config with dynamic options
    const filters = React.useMemo(() => {
        const baseFilters = (nhomPhieuHanhChinhConfig.filterColumns || []).map((filter) => {
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
            return filter
        })
        
        // Add nguoi_tao_id filter with dynamic options
        const nguoiTaoFilter = {
            columnId: "nguoi_tao_id",
            title: "Người Tạo",
            options: (nguoiTaoList || [])
                .filter((item) => item.id != null) // Filter out null/undefined
                .map((item) => ({
                    label: item.ten && item.ten !== `ID: ${item.id}` ? `${item.id} - ${item.ten}` : String(item.id),
                    value: String(item.id),
                })),
        }

        return [...baseFilters, nguoiTaoFilter]
    }, [nguoiTaoList, loaiPhieuList])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: NhomPhieuHanhChinh) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <Badge variant="outline" className={getLoaiPhieuBadgeClass(row.loai_phieu || "")}>
                                <span className="font-semibold text-base text-foreground leading-tight truncate block">
                                    {row.loai_phieu || "-"}
                                </span>
                            </Badge>
                            <span className="font-semibold text-base text-foreground leading-tight truncate block mt-1">
                                {row.ten_nhom_phieu}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.ma_nhom_phieu && (
                        <p className="leading-snug">
                            Mã: <span className="font-medium text-foreground">{row.ma_nhom_phieu}</span>
                        </p>
                    )}
                    {row.so_luong_cho_phep_thang !== null && row.so_luong_cho_phep_thang !== undefined && (
                        <p className="leading-snug">
                            Số lượng/tháng: <span className="font-medium text-foreground">{row.so_luong_cho_phep_thang}</span>
                        </p>
                    )}
                    {row.can_hcns_duyet && (
                        <p className="leading-snug">
                            Cần HCNS Duyệt: <span className="font-medium text-foreground">{row.can_hcns_duyet}</span>
                        </p>
                    )}
                    {row.ca_toi && (
                        <p className="leading-snug">
                            Ca Tối: <span className="font-medium text-foreground">{row.ca_toi}</span>
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

    const getCellValue = React.useCallback((row: NhomPhieuHanhChinh, columnId: string) => {
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
            const value = (row as any)[columnId]
            if (!value) return ""
            return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
        }
        if (columnId === "can_hcns_duyet" || columnId === "ca_toi") {
            const value = (row as any)[columnId]
            if (value === "Có") return "Có"
            if (value === "Không") return "Không"
            return "" // null or empty
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách nhóm phiếu hành chính</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
        <GenericListView
            columns={columns}
            data={nhomPhieuList || []}
            filterColumn="ma_nhom_phieu"
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
                    navigate(`${nhomPhieuHanhChinhConfig.routePath}/${row.id}`)
                }
            }}
            onAdd={() => {
                if (onAddNew) {
                    onAddNew()
                } else {
                    navigate(`${nhomPhieuHanhChinhConfig.routePath}/moi`)
                }
            }}
            addHref={`${nhomPhieuHanhChinhConfig.routePath}/moi`}
            onBack={() => {
                navigate(nhomPhieuHanhChinhConfig.parentPath)
            }}
            onDeleteSelected={async (selectedRows) => {
                const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                await batchDeleteMutation.mutateAsync(ids)
            }}
            batchDeleteConfig={{
                itemName: "nhóm phiếu hành chính",
                moduleName: nhomPhieuHanhChinhConfig.moduleTitle,
                isLoading: batchDeleteMutation.isPending,
                getItemLabel: (item: NhomPhieuHanhChinh) => item.ma_nhom_phieu || item.ten_nhom_phieu || String(item.id),
            }}
            filters={filters}
            searchFields={nhomPhieuHanhChinhConfig.searchFields as (keyof NhomPhieuHanhChinh)[]}
            module={module}
            enableSuggestions={true}
            enableRangeSelection={true}
            enableLongPress={true}
            persistSelection={false}
            renderMobileCard={renderMobileCard}
            enableVirtualization={(nhomPhieuList?.length || 0) > 100}
            virtualRowHeight={60}
            exportOptions={{
                columns: columns,
                totalCount: nhomPhieuList?.length || 0,
                moduleName: nhomPhieuHanhChinhConfig.moduleTitle,
                getColumnTitle,
                getCellValue,
            }}
            onEdit={(row) => {
                if (onEdit) {
                    onEdit(row.id!)
                } else {
                    navigate(`${nhomPhieuHanhChinhConfig.routePath}/${row.id}/sua`)
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
            <NhomPhieuHanhChinhImportDialog
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
                            Bạn có chắc chắn muốn xóa nhóm phiếu hành chính <strong>{rowToDelete?.ten_nhom_phieu}</strong>? Hành động này không thể hoàn tác.
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

