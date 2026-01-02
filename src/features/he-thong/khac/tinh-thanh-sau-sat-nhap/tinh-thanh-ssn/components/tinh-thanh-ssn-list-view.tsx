"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { TinhThanhSSN } from "../schema"
import { useTinhThanhSSN, useBatchDeleteTinhThanhSSN, useDeleteTinhThanhSSN } from "../hooks"
import { tinhThanhSSNColumns } from "./tinh-thanh-ssn-columns"
import { tinhThanhSSNConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertTinhThanhSSN } from "../actions/tinh-thanh-ssn-excel-actions"
import { TinhThanhSSNImportDialog } from "./tinh-thanh-ssn-import-dialog"
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

interface TinhThanhSSNListViewProps {
    initialData?: TinhThanhSSN[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function TinhThanhSSNListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: TinhThanhSSNListViewProps = {}) {
    const { data: tinhThanhList, isLoading, isError, refetch } = useTinhThanhSSN(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteTinhThanhSSN()
    const deleteMutation = useDeleteTinhThanhSSN()
    const batchImportMutation = useBatchUpsertTinhThanhSSN()
    const module = tinhThanhSSNConfig.moduleName
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<TinhThanhSSN | null>(null)

    // Create columns
    const columns = React.useMemo(() => {
        return tinhThanhSSNColumns()
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

    // Build filters array from config
    const filters = React.useMemo(() => {
        return tinhThanhSSNConfig.filterColumns || []
    }, [])

    const handleAddNewClick = () => {
        if (onAddNew) {
            onAddNew()
        } else {
            navigate(`${tinhThanhSSNConfig.routePath}/moi`)
        }
    }

    const handleEditClick = (id: number) => {
        if (onEdit) {
            onEdit(id)
        } else {
            navigate(`${tinhThanhSSNConfig.routePath}/${id}/sua`)
        }
    }

    const handleViewClick = (id: number) => {
        if (onView) {
            onView(id)
        } else {
            navigate(`${tinhThanhSSNConfig.routePath}/${id}`)
        }
    }

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: TinhThanhSSN) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base text-foreground leading-tight truncate block">
                                {row.ten_tinh_thanh}
                            </span>
                            <span className="text-sm text-muted-foreground font-mono">
                                {row.ma_tinh_thanh}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.mien && (
                        <p className="leading-snug">
                            Miền: <span className="font-medium text-foreground">{row.mien}</span>
                        </p>
                    )}
                    {row.vung && (
                        <p className="leading-snug">
                            Vùng: <span className="font-medium text-foreground">{row.vung}</span>
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

    const getCellValue = React.useCallback((row: TinhThanhSSN, columnId: string) => {
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách tỉnh thành SSN</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
            <GenericListView
                data={tinhThanhList || []}
                columns={columns}
                filterColumn="ten_tinh_thanh"
                module={module}
                searchFields={tinhThanhSSNConfig.searchFields as (keyof TinhThanhSSN)[]}
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
                    itemName: "tỉnh thành SSN",
                    moduleName: tinhThanhSSNConfig.moduleTitle,
                    isLoading: batchDeleteMutation.isPending,
                    getItemLabel: (item: TinhThanhSSN) => item.ten_tinh_thanh || String(item.id),
                }}
                onImport={() => setImportDialogOpen(true)}
                isImporting={batchImportMutation.isPending}
                onAdd={handleAddNewClick}
                addHref={`${tinhThanhSSNConfig.routePath}/moi`}
                onBack={() => {
                    navigate(tinhThanhSSNConfig.parentPath)
                }}
                enableSuggestions={true}
                enableRangeSelection={true}
                enableLongPress={true}
                persistSelection={false}
                renderMobileCard={renderMobileCard}
                enableVirtualization={(tinhThanhList?.length || 0) > 100}
                virtualRowHeight={60}
                exportOptions={{
                    columns: columns,
                    totalCount: tinhThanhList?.length || 0,
                    moduleName: tinhThanhSSNConfig.moduleTitle,
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
                            Bạn có chắc chắn muốn xóa tỉnh thành SSN <strong>{rowToDelete?.ten_tinh_thanh || rowToDelete?.id || "này"}</strong>? Hành động này không thể hoàn tác.
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
            <TinhThanhSSNImportDialog
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

