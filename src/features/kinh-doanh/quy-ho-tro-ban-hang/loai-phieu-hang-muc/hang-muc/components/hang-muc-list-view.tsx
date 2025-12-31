"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { HangMuc } from "../schema"
import { useHangMuc, useBatchDeleteHangMuc, useDeleteHangMuc } from "../hooks"
import { hangMucColumns } from "./hang-muc-columns"
import { hangMucConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertHangMuc } from "../actions/hang-muc-excel-actions"
import { HangMucImportDialog } from "./hang-muc-import-dialog"
import { useLoaiPhieu } from "../../loai-phieu/hooks"
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

interface HangMucListViewProps {
    initialData?: HangMuc[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function HangMucListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: HangMucListViewProps = {}) {
    const { data: hangMucList, isLoading, isError, refetch } = useHangMuc(initialData)
    const { data: loaiPhieuList } = useLoaiPhieu()
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteHangMuc()
    const deleteMutation = useDeleteHangMuc()
    const batchImportMutation = useBatchUpsertHangMuc()
    const module = hangMucConfig.moduleName
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<HangMuc | null>(null)

    // Create columns
    const columns = React.useMemo(() => {
        return hangMucColumns()
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
        if (!hangMucList) return []
        const unique = new Map<number, { id: number; name: string }>()
        
        hangMucList.forEach((item) => {
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
    }, [hangMucList])

    const loaiPhieuOptions = React.useMemo(() => {
        if (!loaiPhieuList) return []
        return loaiPhieuList.map(lp => ({
            label: lp.ten_loai_phieu,
            value: String(lp.id)
        })).sort((a, b) => a.label.localeCompare(b.label))
    }, [loaiPhieuList])

    // Build filters array from config + dynamic options
    const filters = React.useMemo(() => {
        const baseFilters = hangMucConfig.filterColumns || []
        
        const dynamicFilters = []
        if (nguoiTaoOptions.length > 0) {
            dynamicFilters.push({
                columnId: "nguoi_tao_id",
                title: "Người Tạo",
                options: nguoiTaoOptions,
            })
        }
        if (loaiPhieuOptions.length > 0) {
            dynamicFilters.push({
                columnId: "loai_phieu_id",
                title: "Loại Phiếu",
                options: loaiPhieuOptions,
            })
        }
        
        return [...baseFilters, ...dynamicFilters]
    }, [nguoiTaoOptions, loaiPhieuOptions])

    const handleAddNewClick = () => {
        if (onAddNew) {
            onAddNew()
        } else {
            navigate(`${hangMucConfig.routePath}/moi`)
        }
    }

    const handleEditClick = (id: number) => {
        if (onEdit) {
            onEdit(id)
        } else {
            navigate(`${hangMucConfig.routePath}/${id}/sua`)
        }
    }

    const handleViewClick = (id: number) => {
        if (onView) {
            onView(id)
        } else {
            navigate(`${hangMucConfig.routePath}/${id}`)
        }
    }

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: HangMuc) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base text-foreground leading-tight truncate block">
                                {row.ten_hang_muc}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.ten_loai_phieu && (
                        <p className="leading-snug">
                            Loại phiếu: <span className="font-medium text-foreground">{row.ten_loai_phieu}</span>
                        </p>
                    )}
                    {row.mo_ta && (
                        <p className="leading-snug line-clamp-2">
                            {row.mo_ta}
                        </p>
                    )}
                    {row.tg_tao && (
                        <p className="leading-snug">
                            Tạo: <span className="font-medium text-foreground">
                                {format(new Date(row.tg_tao), "dd/MM/yyyy HH:mm", { locale: vi })}
                            </span>
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

    const getCellValue = React.useCallback((row: HangMuc, columnId: string) => {
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
            const value = (row as any)[columnId]
            if (!value) return ""
            return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
        }
        if (columnId === "loai_phieu_id") {
            return row.ten_loai_phieu || ""
        }
        if (columnId === "nguoi_tao_id") {
            return row.nguoi_tao_ten ? `${row.nguoi_tao_id} - ${row.nguoi_tao_ten}` : String(row.nguoi_tao_id || "")
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách hạng mục</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
            <GenericListView
                data={hangMucList || []}
                columns={columns}
                filterColumn="ten_hang_muc"
                module={module}
                searchFields={hangMucConfig.searchFields as (keyof HangMuc)[]}
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
                    itemName: "hạng mục",
                    moduleName: hangMucConfig.moduleTitle,
                    isLoading: batchDeleteMutation.isPending,
                    getItemLabel: (item: HangMuc) => item.ten_hang_muc || String(item.id),
                }}
                onImport={() => setImportDialogOpen(true)}
                isImporting={batchImportMutation.isPending}
                onAdd={handleAddNewClick}
                addHref={`${hangMucConfig.routePath}/moi`}
                onBack={() => {
                    navigate(hangMucConfig.parentPath)
                }}
                enableSuggestions={true}
                enableRangeSelection={true}
                enableLongPress={true}
                persistSelection={false}
                renderMobileCard={renderMobileCard}
                enableVirtualization={(hangMucList?.length || 0) > 100}
                virtualRowHeight={60}
                exportOptions={{
                    columns: columns,
                    totalCount: hangMucList?.length || 0,
                    moduleName: hangMucConfig.moduleTitle,
                    getColumnTitle,
                    getCellValue,
                }}
                onEdit={(row) => handleEditClick(row.id!)}
                onDelete={(row) => {
                    setRowToDelete(row)
                    setDeleteDialogOpen(true)
                }}
                onRowClick={(row) => handleViewClick(row.id!)}
            />
            
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa hạng mục <strong>{rowToDelete?.ten_hang_muc || rowToDelete?.id || "này"}</strong>? Hành động này không thể hoàn tác.
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

            {/* Import Dialog */}
            <HangMucImportDialog
                open={importDialogOpen}
                onOpenChange={(open) => {
                    setImportDialogOpen(open)
                    if (!open) {
                        refetch()
                    }
                }}
                mutation={batchImportMutation}
            />
        </>
    )
}

