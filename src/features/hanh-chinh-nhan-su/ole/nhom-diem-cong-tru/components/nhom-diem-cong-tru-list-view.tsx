"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { GenericListView } from "@/shared/components"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { NhomDiemCongTru } from "../schema"
import { useNhomDiemCongTru, useBatchDeleteNhomDiemCongTru, useDeleteNhomDiemCongTru } from "../hooks"
import { nhomDiemCongTruColumns } from "./nhom-diem-cong-tru-columns"
import { nhomDiemCongTruConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertNhomDiemCongTru } from "../actions/nhom-diem-cong-tru-excel-actions"
import { NhomDiemCongTruImportDialog } from "./nhom-diem-cong-tru-import-dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { NhomDiemCongTruAPI } from "../services/nhom-diem-cong-tru.api"
import { nhomDiemCongTruQueryKeys } from "@/lib/react-query/query-keys"
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

interface NhomDiemCongTruListViewProps {
    initialData?: NhomDiemCongTru[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function NhomDiemCongTruListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: NhomDiemCongTruListViewProps = {}) {
    const { data: nhomDiemList, isLoading, isError, refetch } = useNhomDiemCongTru(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteNhomDiemCongTru()
    const deleteMutation = useDeleteNhomDiemCongTru()
    const batchImportMutation = useBatchUpsertNhomDiemCongTru()
    const module = nhomDiemCongTruConfig.moduleName
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<NhomDiemCongTru | null>(null)
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)

    // Create columns
    const columns = React.useMemo(() => {
        return nhomDiemCongTruColumns
    }, [])

    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, nhomDiemCongTruConfig.defaultSorting || [])

    // Fetch unique người tạo for filter
    const { data: nguoiTaoList } = useQuery({
        queryKey: [...nhomDiemCongTruQueryKeys.all(), "nguoi-tao-filter"],
        queryFn: () => NhomDiemCongTruAPI.getUniqueNguoiTaoIds(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    // Fetch unique hạng mục for filter
    const { data: hangMucList } = useQuery({
        queryKey: [...nhomDiemCongTruQueryKeys.all(), "hang-muc-filter"],
        queryFn: () => NhomDiemCongTruAPI.getUniqueHangMuc(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    // Fetch unique nhóm for filter
    const { data: nhomList } = useQuery({
        queryKey: [...nhomDiemCongTruQueryKeys.all(), "nhom-filter"],
        queryFn: () => NhomDiemCongTruAPI.getUniqueNhom(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    // Build filters array from config with dynamic options
    const filters = React.useMemo(() => {
        const baseFilters: any[] = []
        
        // Add hang_muc filter
        if (hangMucList && hangMucList.length > 0) {
            baseFilters.push({
                columnId: "hang_muc",
                title: "Hạng Mục",
                options: hangMucList.map((hangMuc) => ({
                    label: hangMuc,
                    value: hangMuc,
                })),
            })
        }
        
        // Add nhom filter
        if (nhomList && nhomList.length > 0) {
            baseFilters.push({
                columnId: "nhom",
                title: "Nhóm",
                options: nhomList.map((nhom) => ({
                    label: nhom,
                    value: nhom,
                })),
            })
        }
        
        // Add nguoi_tao_id filter
        if (nguoiTaoList && nguoiTaoList.length > 0) {
            baseFilters.push({
                columnId: "nguoi_tao_id",
                title: "Người Tạo",
                options: nguoiTaoList
                    .filter((item) => item.id != null)
                    .map((item) => ({
                        label: item.ten && item.ten !== `ID: ${item.id}` ? `${item.id} - ${item.ten}` : String(item.id),
                        value: String(item.id),
                    })),
            })
        }
        
        return baseFilters
    }, [hangMucList, nhomList, nguoiTaoList])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: NhomDiemCongTru) => {
        const hangMuc = row.hang_muc
        const badgeClass = hangMuc === "Cộng" 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-red-50 text-red-700 border-red-200"
        
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <Badge variant="outline" className={cn(badgeClass, "font-semibold text-base")}>
                                {hangMuc}
                            </Badge>
                            <span className="text-sm text-muted-foreground leading-tight truncate block mt-1">
                                Nhóm: {row.nhom}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.min !== null && row.min !== undefined && (
                        <p className="leading-snug">
                            Min: <span className="font-medium text-foreground">{row.min}</span>
                        </p>
                    )}
                    {row.max !== null && row.max !== undefined && (
                        <p className="leading-snug">
                            Max: <span className="font-medium text-foreground">{row.max}</span>
                        </p>
                    )}
                    {row.mo_ta && (
                        <p className="leading-snug">
                            Mô tả: <span className="font-medium text-foreground">{row.mo_ta}</span>
                        </p>
                    )}
                    {row.pb_ap_dung_ib && row.pb_ap_dung_ib.length > 0 && (
                        <p className="leading-snug">
                            Phòng ban: <span className="font-medium text-foreground">{row.pb_ap_dung_ib.length} phòng ban</span>
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

    const getCellValue = React.useCallback((row: NhomDiemCongTru, columnId: string) => {
        // Skip select and actions columns
        if (columnId === "select" || columnId === "actions") {
            return ""
        }
        
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
            const value = (row as any)[columnId]
            if (!value) return ""
            return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
        }
        if (columnId === "pb_ap_dung_ib") {
            const value = (row as any)[columnId]
            if (!value || !Array.isArray(value) || value.length === 0) return ""
            return `${value.length} phòng ban`
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
                data={nhomDiemList || []}
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
                        navigate(`${nhomDiemCongTruConfig.routePath}/${row.id}`)
                    }
                }}
                onAdd={() => {
                    if (onAddNew) {
                        onAddNew()
                    } else {
                        navigate(`${nhomDiemCongTruConfig.routePath}/moi`)
                    }
                }}
                addHref={`${nhomDiemCongTruConfig.routePath}/moi`}
                onBack={() => {
                    navigate(nhomDiemCongTruConfig.parentPath)
                }}
                onDeleteSelected={async (selectedRows) => {
                    const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                    await batchDeleteMutation.mutateAsync(ids)
                }}
                batchDeleteConfig={{
                    itemName: "nhóm điểm cộng trừ",
                    moduleName: nhomDiemCongTruConfig.moduleTitle,
                    isLoading: batchDeleteMutation.isPending,
                    getItemLabel: (item: NhomDiemCongTru) => item.hang_muc || item.nhom || String(item.id),
                }}
                filters={filters}
                searchFields={nhomDiemCongTruConfig.searchFields as (keyof NhomDiemCongTru)[]}
                module={module}
                enableSuggestions={true}
                enableRangeSelection={true}
                enableLongPress={true}
                persistSelection={false}
                renderMobileCard={renderMobileCard}
                enableVirtualization={(nhomDiemList?.length || 0) > 100}
                virtualRowHeight={60}
                exportOptions={{
                    columns: columns,
                    totalCount: nhomDiemList?.length || 0,
                    moduleName: nhomDiemCongTruConfig.moduleTitle,
                    getColumnTitle,
                    getCellValue,
                }}
                onEdit={(row) => {
                    if (onEdit) {
                        onEdit(row.id!)
                    } else {
                        navigate(`${nhomDiemCongTruConfig.routePath}/${row.id}/sua`)
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
            <NhomDiemCongTruImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />
            
            {/* Delete confirmation dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa nhóm điểm cộng trừ <strong>{rowToDelete?.hang_muc}</strong>? Hành động này không thể hoàn tác.
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
        </>
    )
}

