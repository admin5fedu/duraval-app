"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { KeHoach168 } from "../schema"
import { useKeHoach168, useBatchDeleteKeHoach168, useDeleteKeHoach168 } from "../hooks"
import { createColumns } from "./ke-hoach-168-columns"
import { keHoach168Config } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
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
import { DeleteKeHoach168Button } from "./delete-ke-hoach-168-button"

interface KeHoach168ListViewProps {
    initialData?: KeHoach168[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function KeHoach168ListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: KeHoach168ListViewProps = {}) {
    const { data: keHoach168List, isLoading, isError, refetch } = useKeHoach168(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteKeHoach168()
    const deleteMutation = useDeleteKeHoach168()
    const module = keHoach168Config.moduleName
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<KeHoach168 | null>(null)

    // Create columns - TODO: Add employee data support
    const columns = React.useMemo(() => {
        return createColumns()
    }, [])

    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, [{ id: "ngay_bao_cao", desc: true }])

    // Generate filter options from data
    const maPhongOptions = React.useMemo(() => {
        if (!keHoach168List) return []
        const uniqueValues = new Set<string>()
        for (const item of keHoach168List) {
            if (item.ma_phong) uniqueValues.add(item.ma_phong)
        }
        return Array.from(uniqueValues).sort().map(d => ({ label: d, value: d }))
    }, [keHoach168List])

    const maNhomOptions = React.useMemo(() => {
        if (!keHoach168List) return []
        const uniqueValues = new Set<string>()
        for (const item of keHoach168List) {
            if (item.ma_nhom) uniqueValues.add(item.ma_nhom)
        }
        return Array.from(uniqueValues).sort().map(d => ({ label: d, value: d }))
    }, [keHoach168List])

    // Build filters array from config and dynamic options
    const filters = React.useMemo(() => {
        const filterConfigs = keHoach168Config.filterColumns || []
        return filterConfigs.map((filterConfig) => {
            if (filterConfig.columnId === "ma_phong") {
                return {
                    ...filterConfig,
                    options: maPhongOptions,
                }
            }
            if (filterConfig.columnId === "ma_nhom") {
                return {
                    ...filterConfig,
                    options: maNhomOptions,
                }
            }
            return filterConfig
        })
    }, [maPhongOptions, maNhomOptions])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: KeHoach168) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <span className="font-semibold text-base text-foreground leading-tight block">
                            Mã NV: {row.ma_nhan_vien}
                        </span>
                        {(row.ma_phong || row.ma_nhom) && (
                            <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                                {row.ma_phong && `Phòng: ${row.ma_phong}`}
                                {row.ma_phong && row.ma_nhom && " · "}
                                {row.ma_nhom && `Nhóm: ${row.ma_nhom}`}
                            </p>
                        )}
                    </div>
                    {row.ngay_bao_cao && (
                        <span className="text-xs text-muted-foreground shrink-0">
                            {format(new Date(row.ngay_bao_cao), "dd/MM/yyyy", { locale: vi })}
                        </span>
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

    const getCellValue = React.useCallback((row: KeHoach168, columnId: string) => {
        if (columnId === "ngay_bao_cao") {
            const value = (row as any)[columnId]
            if (!value) return ""
            return format(new Date(value), "dd/MM/yyyy", { locale: vi })
        }
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách kế hoạch 168</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
        <GenericListView
            columns={columns}
            data={keHoach168List || []}
            filterColumn="ma_nhan_vien"
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
                    navigate(`${keHoach168Config.routePath}/${row.id}`)
                }
            }}
            onAdd={() => {
                if (onAddNew) {
                    onAddNew()
                } else {
                    navigate(`${keHoach168Config.routePath}/moi`)
                }
            }}
            addHref={`${keHoach168Config.routePath}/moi`}
            onBack={() => {
                navigate(keHoach168Config.parentPath)
            }}
            onDeleteSelected={async (selectedRows) => {
                const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                await batchDeleteMutation.mutateAsync(ids)
            }}
            filters={filters}
            searchFields={keHoach168Config.searchFields as (keyof KeHoach168)[]}
            module={module}
            enableSuggestions={true}
            enableRangeSelection={true}
            enableLongPress={true}
            persistSelection={false}
            renderMobileCard={renderMobileCard}
            enableVirtualization={(keHoach168List?.length || 0) > 100}
            virtualRowHeight={60}
            exportOptions={{
                columns: columns,
                totalCount: keHoach168List?.length || 0,
                moduleName: keHoach168Config.moduleTitle,
                getColumnTitle,
                getCellValue,
            }}
            onEdit={(row) => {
                if (onEdit) {
                    onEdit(row.id!)
                } else {
                    navigate(`${keHoach168Config.routePath}/${row.id}/sua`)
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
                            Bạn có chắc chắn muốn xóa kế hoạch 168 <strong>{rowToDelete?.ma_nhan_vien}</strong>? Hành động này không thể hoàn tác.
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

