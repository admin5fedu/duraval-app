"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CapBac } from "../schema"
import { useCapBac, useBatchDeleteCapBac, useDeleteCapBac } from "../hooks"
import { capBacColumns } from "./cap-bac-columns"
import { capBacConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertCapBac } from "../actions/cap-bac-excel-actions"
import { CapBacImportDialog } from "./cap-bac-import-dialog"
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

interface CapBacListViewProps {
    initialData?: CapBac[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function CapBacListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: CapBacListViewProps = {}) {
    const { data: capBacList, isLoading, isError, refetch } = useCapBac(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteCapBac()
    const deleteMutation = useDeleteCapBac()
    const batchImportMutation = useBatchUpsertCapBac()
    const module = capBacConfig.moduleName
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<CapBac | null>(null)
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)

    // Create columns
    const columns = React.useMemo(() => {
        return capBacColumns
    }, [])

    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, [{ id: "bac", desc: false }])

    // Generate filter options for bậc từ data
    const bacOptions = React.useMemo(() => {
        if (!capBacList) return []
        // Lấy danh sách các bậc unique và sắp xếp
        const uniqueBacs = Array.from(
            new Set(
                capBacList
                    .map((cb) => cb.bac)
                    .filter((bac): bac is number => bac !== null && bac !== undefined)
            )
        ).sort((a, b) => a - b)
        
        return uniqueBacs.map((bac) => ({
            label: `Bậc ${bac}`,
            value: String(bac),
        }))
    }, [capBacList])

    // Build filters array from config and dynamic options
    const filters = React.useMemo(() => {
        const filterConfigs = capBacConfig.filterColumns || []
        return filterConfigs.map((filterConfig) => {
            if (filterConfig.columnId === "bac") {
                return {
                    ...filterConfig,
                    options: bacOptions,
                }
            }
            return filterConfig
        })
    }, [bacOptions])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: CapBac) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base text-foreground leading-tight truncate block">
                                {row.ten_cap_bac}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.ma_cap_bac && (
                        <p className="leading-snug">
                            Mã: <span className="font-medium text-foreground">{row.ma_cap_bac}</span>
                        </p>
                    )}
                    {row.bac && (
                        <p className="leading-snug">
                            Bậc: <span className="font-medium text-foreground">{row.bac}</span>
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

    const getCellValue = React.useCallback((row: CapBac, columnId: string) => {
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách cấp bậc</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
        <GenericListView
            columns={columns}
            data={capBacList || []}
            filterColumn="ma_cap_bac"
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
                    navigate(`${capBacConfig.routePath}/${row.id}`)
                }
            }}
            onAdd={() => {
                if (onAddNew) {
                    onAddNew()
                } else {
                    navigate(`${capBacConfig.routePath}/moi`)
                }
            }}
            addHref={`${capBacConfig.routePath}/moi`}
            onBack={() => {
                navigate(capBacConfig.parentPath)
            }}
            onDeleteSelected={async (selectedRows) => {
                const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                await batchDeleteMutation.mutateAsync(ids)
            }}
            batchDeleteConfig={{
                itemName: "cấp bậc",
                moduleName: capBacConfig.moduleTitle,
                isLoading: batchDeleteMutation.isPending,
                getItemLabel: (item: CapBac) => item.ten_cap_bac || String(item.id),
            }}
            filters={filters}
            searchFields={capBacConfig.searchFields as (keyof CapBac)[]}
            module={module}
            enableSuggestions={true}
            enableRangeSelection={true}
            enableLongPress={true}
            persistSelection={false}
            renderMobileCard={renderMobileCard}
            enableVirtualization={(capBacList?.length || 0) > 100}
            virtualRowHeight={60}
            exportOptions={{
                columns: columns,
                totalCount: capBacList?.length || 0,
                moduleName: capBacConfig.moduleTitle,
                getColumnTitle,
                getCellValue,
            }}
            onImport={() => setImportDialogOpen(true)}
            isImporting={batchImportMutation.isPending}
            onEdit={(row) => {
                if (onEdit) {
                    onEdit(row.id!)
                } else {
                    navigate(`${capBacConfig.routePath}/${row.id}/sua`)
                }
            }}
            onDelete={(row) => {
                setRowToDelete(row)
                setDeleteDialogOpen(true)
            }}
        />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa cấp bậc <strong>{rowToDelete?.ten_cap_bac}</strong>? Hành động này không thể hoàn tác.
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

            {/* Import Dialog */}
            <CapBacImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />
        </>
    )
}

