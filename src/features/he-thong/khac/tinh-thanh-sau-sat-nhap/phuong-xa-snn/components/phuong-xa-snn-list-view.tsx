"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { PhuongXaSNN } from "../schema"
import { usePhuongXaSNN, useBatchDeletePhuongXaSNN, useDeletePhuongXaSNN } from "../hooks"
import { phuongXaSNNColumns } from "./phuong-xa-snn-columns"
import { phuongXaSNNConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertPhuongXaSNN } from "../actions/phuong-xa-snn-excel-actions"
import { PhuongXaSNNImportDialog } from "./phuong-xa-snn-import-dialog"
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

interface PhuongXaSNNListViewProps {
    initialData?: PhuongXaSNN[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function PhuongXaSNNListView({
    initialData,
    onEdit,
    onAddNew,
    onView,
}: PhuongXaSNNListViewProps = {}) {
    const { data: phuongXaList, isLoading, isError, refetch } = usePhuongXaSNN(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeletePhuongXaSNN()
    const deleteMutation = useDeletePhuongXaSNN()
    const batchImportMutation = useBatchUpsertPhuongXaSNN()
    const module = phuongXaSNNConfig.moduleName
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<PhuongXaSNN | null>(null)

    const columns = React.useMemo(() => phuongXaSNNColumns(), [])

    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, [{ id: "tg_tao", desc: true }])

    // Generate filter options from data (combine ma and ten)
    const tinhThanhOptions = React.useMemo(() => {
        const uniquePairs = new Map<string, { ma: string; ten: string }>()
        phuongXaList?.forEach((e) => {
            const ma = e.ma_tinh_thanh || ""
            const ten = e.ten_tinh_thanh || ""
            if (ma || ten) {
                const key = `${ma} - ${ten}`.trim()
                if (!uniquePairs.has(key)) {
                    uniquePairs.set(key, { ma, ten })
                }
            }
        })
        return Array.from(uniquePairs.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([combined]) => ({
                label: combined,
                value: combined,
            }))
    }, [phuongXaList])

    // Build filters array with combined filter
    const filters = React.useMemo(() => {
        return [
            {
                columnId: "tinh_thanh",
                title: "Tỉnh Thành",
                options: tinhThanhOptions,
            },
        ]
    }, [tinhThanhOptions])

    const handleAddNewClick = () => {
        if (onAddNew) {
            onAddNew()
        } else {
            navigate(`${phuongXaSNNConfig.routePath}/moi`)
        }
    }

    const handleEditClick = (id: number) => {
        if (onEdit) {
            onEdit(id)
        } else {
            navigate(`${phuongXaSNNConfig.routePath}/${id}/sua?returnTo=list`)
        }
    }

    const handleViewClick = (id: number) => {
        if (onView) {
            onView(id)
        } else {
            navigate(`${phuongXaSNNConfig.routePath}/${id}`)
        }
    }

    const renderMobileCard = React.useCallback((row: PhuongXaSNN) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base text-foreground leading-tight truncate block">
                                {row.ten_phuong_xa}
                            </span>
                            <span className="text-sm text-muted-foreground font-mono">
                                {row.ma_phuong_xa}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.ma_tinh_thanh && (
                        <p className="leading-snug">
                            Tỉnh thành: <span className="font-medium text-foreground">
                                {row.ten_tinh_thanh ? `${row.ma_tinh_thanh} - ${row.ten_tinh_thanh}` : row.ma_tinh_thanh}
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
            if (col.id === columnId) return true
            if ('accessorKey' in col && col.accessorKey === columnId) return true
            return false
        })
        return (column?.meta as { title?: string } | undefined)?.title || columnId
    }, [columns])

    const getCellValue = React.useCallback((row: PhuongXaSNN, columnId: string) => {
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách phường xã SNN</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
            <GenericListView
                data={phuongXaList || []}
                columns={columns}
                filterColumn="ten_phuong_xa"
                module={module}
                searchFields={phuongXaSNNConfig.searchFields as (keyof PhuongXaSNN)[]}
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
                    itemName: "phường xã SNN",
                    moduleName: phuongXaSNNConfig.moduleTitle,
                    isLoading: batchDeleteMutation.isPending,
                    getItemLabel: (item: PhuongXaSNN) => item.ten_phuong_xa || String(item.id),
                }}
                onImport={() => setImportDialogOpen(true)}
                isImporting={batchImportMutation.isPending}
                onAdd={handleAddNewClick}
                addHref={`${phuongXaSNNConfig.routePath}/moi`}
                onBack={() => {
                    navigate(phuongXaSNNConfig.parentPath)
                }}
                enableSuggestions={true}
                enableRangeSelection={true}
                enableLongPress={true}
                persistSelection={false}
                renderMobileCard={renderMobileCard}
                enableVirtualization={(phuongXaList?.length || 0) > 100}
                virtualRowHeight={60}
                exportOptions={{
                    columns: columns,
                    totalCount: phuongXaList?.length || 0,
                    moduleName: phuongXaSNNConfig.moduleTitle,
                    getColumnTitle,
                    getCellValue,
                }}
                onEdit={(row: PhuongXaSNN) => handleEditClick(row.id!)}
                onDelete={(row) => {
                    setRowToDelete(row)
                    setDeleteDialogOpen(true)
                }}
                onRowClick={(row: PhuongXaSNN) => handleViewClick(row.id!)}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa phường xã SNN <strong>{rowToDelete?.ten_phuong_xa || rowToDelete?.id || "này"}</strong>? Hành động này không thể hoàn tác.
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
            <PhuongXaSNNImportDialog
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

