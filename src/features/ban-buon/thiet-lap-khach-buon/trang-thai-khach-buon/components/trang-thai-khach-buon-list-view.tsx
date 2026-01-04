"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { TrangThaiKhachBuon } from "../schema"
import { useTrangThaiKhachBuon, useBatchDeleteTrangThaiKhachBuon, useDeleteTrangThaiKhachBuon } from "../hooks"
import { trangThaiKhachBuonColumns } from "./trang-thai-khach-buon-columns"
import { trangThaiKhachBuonConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertTrangThaiKhachBuon } from "../actions/trang-thai-khach-buon-excel-actions"
import { TrangThaiKhachBuonImportDialog } from "./trang-thai-khach-buon-import-dialog"
import { useGiaiDoanKhachBuon } from "../../giai-doan-khach-buon/hooks/use-giai-doan-khach-buon"
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

interface TrangThaiKhachBuonListViewProps {
    initialData?: TrangThaiKhachBuon[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function TrangThaiKhachBuonListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: TrangThaiKhachBuonListViewProps = {}) {
    const { data: trangThaiKhachBuonList, isLoading, isError, refetch } = useTrangThaiKhachBuon(initialData)
    const { data: giaiDoanList } = useGiaiDoanKhachBuon(undefined) // Fetch all giai doan for filter options
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteTrangThaiKhachBuon()
    const deleteMutation = useDeleteTrangThaiKhachBuon()
    const batchImportMutation = useBatchUpsertTrangThaiKhachBuon()
    const module = trangThaiKhachBuonConfig.moduleName
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<TrangThaiKhachBuon | null>(null)

    // Create columns
    const columns = React.useMemo(() => {
        return trangThaiKhachBuonColumns()
    }, [])

    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, [{ id: "tt", desc: false }])

    // Generate filter options from data
    const nguoiTaoOptions = React.useMemo(() => {
        if (!trangThaiKhachBuonList) return []
        const unique = new Map<number, { id: number; name: string }>()
        
        trangThaiKhachBuonList.forEach((item) => {
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
    }, [trangThaiKhachBuonList])

    // Build giai doan options from all giai doan (not just from existing trang thai)
    // This ensures all giai doan are available in filter, even if they don't have any trang thai yet
    const giaiDoanOptions = React.useMemo(() => {
        if (!giaiDoanList) return []
        return giaiDoanList
            .map(item => ({
                label: item.ten_giai_doan || `Giai đoạn ${item.id}`,
                value: String(item.id)
            }))
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [giaiDoanList])

    // Build filters array from config + dynamic options
    const filters = React.useMemo(() => {
        const baseFilters = trangThaiKhachBuonConfig.filterColumns || []
        
        const dynamicFilters = []
        
        // Add giai_doan filter if we have options
        // Note: columnId must match the column accessorKey ("ten_giai_doan")
        // but filterFn filters by giai_doan_id from row.original
        if (giaiDoanOptions.length > 0) {
            dynamicFilters.push({
                columnId: "ten_giai_doan",
                title: "Giai Đoạn",
                options: giaiDoanOptions,
            })
        }
        
        // Add nguoi_tao_id filter if we have options
        if (nguoiTaoOptions.length > 0) {
            dynamicFilters.push({
                columnId: "nguoi_tao_id",
                title: "Người Tạo",
                options: nguoiTaoOptions,
            })
        }
        
        return [...baseFilters, ...dynamicFilters]
    }, [giaiDoanOptions, nguoiTaoOptions])

    const handleAddNewClick = () => {
        if (onAddNew) {
            onAddNew()
        } else {
            navigate(`${trangThaiKhachBuonConfig.routePath}/moi`)
        }
    }

    const handleEditClick = (id: number) => {
        if (onEdit) {
            onEdit(id)
        } else {
            navigate(`${trangThaiKhachBuonConfig.routePath}/${id}/sua`)
        }
    }

    const handleViewClick = (id: number) => {
        if (onView) {
            onView(id)
        } else {
            navigate(`${trangThaiKhachBuonConfig.routePath}/${id}`)
        }
    }

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: TrangThaiKhachBuon) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base text-foreground leading-tight truncate block">
                                {row.ten_trang_thai}
                            </span>
                            {row.ma_trang_thai && (
                                <span className="text-sm text-muted-foreground mt-1 block">
                                    Mã: {row.ma_trang_thai}
                                </span>
                            )}
                            {row.ten_giai_doan && (
                                <span className="text-sm text-muted-foreground mt-1 block">
                                    Giai đoạn: {row.ten_giai_doan}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.mo_ta && (
                        <p className="leading-snug line-clamp-2">
                            {row.mo_ta}
                        </p>
                    )}
                    {row.mac_dinh_khoi_dau === "YES" && (
                        <p className="leading-snug">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Mặc định khởi đầu
                            </span>
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

    const getCellValue = React.useCallback((row: TrangThaiKhachBuon, columnId: string) => {
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
            const value = (row as any)[columnId]
            if (!value) return ""
            return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
        }
        if (columnId === "mac_dinh_khoi_dau") {
            return (row as any)[columnId] === "YES" ? "Có" : "Không"
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách trạng thái khách buôn</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
            <GenericListView
                data={trangThaiKhachBuonList || []}
                columns={columns}
                filterColumn="ten_trang_thai"
                module={module}
                searchFields={trangThaiKhachBuonConfig.searchFields as (keyof TrangThaiKhachBuon)[]}
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
                    itemName: "trạng thái khách buôn",
                    moduleName: trangThaiKhachBuonConfig.moduleTitle,
                    isLoading: batchDeleteMutation.isPending,
                    getItemLabel: (item: TrangThaiKhachBuon) => item.ten_trang_thai || String(item.id),
                }}
                onImport={() => setImportDialogOpen(true)}
                isImporting={batchImportMutation.isPending}
                onAdd={handleAddNewClick}
                addHref={`${trangThaiKhachBuonConfig.routePath}/moi`}
                onBack={() => {
                    navigate(trangThaiKhachBuonConfig.parentPath)
                }}
                enableSuggestions={true}
                enableRangeSelection={true}
                enableLongPress={true}
                persistSelection={false}
                renderMobileCard={renderMobileCard}
                enableVirtualization={(trangThaiKhachBuonList?.length || 0) > 100}
                virtualRowHeight={60}
                exportOptions={{
                    columns: columns,
                    totalCount: trangThaiKhachBuonList?.length || 0,
                    moduleName: trangThaiKhachBuonConfig.moduleTitle,
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
                            Bạn có chắc chắn muốn xóa trạng thái khách buôn <strong>{rowToDelete?.ten_trang_thai || rowToDelete?.id || "này"}</strong>? Hành động này không thể hoàn tác.
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
            <TrangThaiKhachBuonImportDialog
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

