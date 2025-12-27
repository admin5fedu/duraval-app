"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { ThongTinCongTy } from "../schema"
import { useThongTinCongTy, useBatchDeleteThongTinCongTy, useDeleteThongTinCongTy } from "../hooks"
import { thongTinCongTyColumns } from "./thong-tin-cong-ty-columns"
import { thongTinCongTyConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertThongTinCongTy } from "../actions/thong-tin-cong-ty-excel-actions"
import { ThongTinCongTyImportDialog } from "./thong-tin-cong-ty-import-dialog"
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

interface ThongTinCongTyListViewProps {
    initialData?: ThongTinCongTy[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function ThongTinCongTyListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: ThongTinCongTyListViewProps = {}) {
    const { data: thongTinCongTyList, isLoading, isError, refetch } = useThongTinCongTy(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteThongTinCongTy()
    const deleteMutation = useDeleteThongTinCongTy()
    const batchImportMutation = useBatchUpsertThongTinCongTy()
    const module = thongTinCongTyConfig.moduleName
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<ThongTinCongTy | null>(null)
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)

    // Create columns
    const columns = React.useMemo(() => {
        return thongTinCongTyColumns()
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
    const apDungOptions = React.useMemo(() => {
        return [
            { label: "Có", value: "true" },
            { label: "Không", value: "false" },
        ]
    }, [])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: ThongTinCongTy) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base text-foreground leading-tight truncate block">
                                {row.ten_cong_ty}
                            </span>
                            {row.ap_dung !== null && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Badge variant={row.ap_dung ? "default" : "secondary"} className="shrink-0 text-[11px] px-2 py-0">
                                        {row.ap_dung ? "Áp dụng" : "Không áp dụng"}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.ma_cong_ty && (
                        <p className="leading-snug">
                            Mã: <span className="font-medium text-foreground">{row.ma_cong_ty}</span>
                        </p>
                    )}
                    {row.email && (
                        <p className="leading-snug">Email: {row.email}</p>
                    )}
                    {row.so_dien_thoai && (
                        <p className="leading-snug">SĐT: {row.so_dien_thoai}</p>
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

    const getCellValue = React.useCallback((row: ThongTinCongTy, columnId: string) => {
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
            const value = (row as any)[columnId]
            if (!value) return ""
            return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
        }
        if (columnId === "ap_dung") {
            return (row as any)[columnId] ? "Có" : "Không"
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách thông tin công ty</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
        <GenericListView
            columns={columns}
            data={thongTinCongTyList || []}
            filterColumn="ma_cong_ty"
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
                    navigate(`${thongTinCongTyConfig.routePath}/${row.id}`)
                }
            }}
            onAdd={() => {
                if (onAddNew) {
                    onAddNew()
                } else {
                    navigate(`${thongTinCongTyConfig.routePath}/moi`)
                }
            }}
            addHref={`${thongTinCongTyConfig.routePath}/moi`}
            onBack={() => {
                navigate(thongTinCongTyConfig.parentPath)
            }}
            onDeleteSelected={async (selectedRows) => {
                const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                await batchDeleteMutation.mutateAsync(ids)
            }}
            filters={[
                {
                    columnId: "ap_dung",
                    title: "Áp dụng",
                    options: apDungOptions,
                },
            ]}
            searchFields={thongTinCongTyConfig.searchFields as (keyof ThongTinCongTy)[]}
            module={module}
            enableSuggestions={true}
            enableRangeSelection={true}
            enableLongPress={true}
            persistSelection={false}
            renderMobileCard={renderMobileCard}
            enableVirtualization={(thongTinCongTyList?.length || 0) > 100}
            virtualRowHeight={60}
            exportOptions={{
                columns: columns,
                totalCount: thongTinCongTyList?.length || 0,
                moduleName: thongTinCongTyConfig.moduleTitle,
                getColumnTitle,
                getCellValue,
            }}
            onImport={() => setImportDialogOpen(true)}
            isImporting={batchImportMutation.isPending}
            onEdit={(row) => {
                if (onEdit) {
                    onEdit(row.id!)
                } else {
                    navigate(`${thongTinCongTyConfig.routePath}/${row.id}/sua`)
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
                            Bạn có chắc chắn muốn xóa thông tin công ty <strong>{rowToDelete?.ten_cong_ty}</strong>? Hành động này không thể hoàn tác.
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
            <ThongTinCongTyImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />
        </>
    )
}

