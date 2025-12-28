"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { DanhMucCauHoi } from "../schema"
import { useDanhMucCauHoi, useBatchDeleteDanhMucCauHoi, useDeleteDanhMucCauHoi } from "../hooks"
import { danhMucCauHoiColumns } from "./danh-muc-cau-hoi-columns"
import { danhMucCauHoiConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
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
import { DeleteDanhMucCauHoiButton } from "./delete-danh-muc-cau-hoi-button"
import { MobileCardActionBar } from "@/shared/components/data-display/mobile-card-action-bar"
import { Edit } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { DanhMucCauHoiImportDialog } from "./danh-muc-cau-hoi-import-dialog"
import { useBatchUpsertDanhMucCauHoi } from "../actions/danh-muc-cau-hoi-excel-actions"

interface DanhMucCauHoiListViewProps {
    initialData?: DanhMucCauHoi[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function DanhMucCauHoiListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: DanhMucCauHoiListViewProps = {}) {
    const { data: danhMucCauHoiList, isLoading, isError, refetch } = useDanhMucCauHoi(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteDanhMucCauHoi()
    const deleteMutation = useDeleteDanhMucCauHoi()
    const batchImportMutation = useBatchUpsertDanhMucCauHoi()
    const module = danhMucCauHoiConfig.moduleName
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<DanhMucCauHoi | null>(null)

    // Create columns
    const columns = React.useMemo(() => {
        return danhMucCauHoiColumns
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
        if (!danhMucCauHoiList) return []
        const unique = new Map<number, { id: number; name: string }>()
        
        danhMucCauHoiList.forEach((item) => {
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
    }, [danhMucCauHoiList])

    // Build filters array
    const filters = React.useMemo(() => {
        return [
            {
                columnId: "nguoi_tao_id",
                title: "Người tạo",
                options: nguoiTaoOptions,
            },
        ]
    }, [nguoiTaoOptions])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: DanhMucCauHoi) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Tên nhóm */}
                <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-base text-foreground leading-tight flex-1">
                        {row.ten_nhom}
                    </span>
                </div>
                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.mo_ta && (
                        <p className="leading-snug line-clamp-2">
                            {row.mo_ta}
                        </p>
                    )}
                    {row.nguoi_tao_ten && (
                        <p className="leading-snug">
                            Người tạo: {row.nguoi_tao_id} - {row.nguoi_tao_ten}
                        </p>
                    )}
                    {row.tg_tao && (
                        <p className="leading-snug">
                            {format(new Date(row.tg_tao), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </p>
                    )}
                </div>

                <MobileCardActionBar
                    rightActions={
                        <>
                            <Button
                                size="xs"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (!row.id) return
                                    if (onEdit) {
                                        onEdit(row.id)
                                    } else {
                                        navigate(`${danhMucCauHoiConfig.routePath}/${row.id}/sua?returnTo=list`)
                                    }
                                }}
                            >
                                <Edit className="h-3 w-3 mr-1" />
                                Sửa
                            </Button>
                            {row.id && (
                                <DeleteDanhMucCauHoiButton
                                    id={row.id}
                                    name={row.ten_nhom}
                                    iconOnly
                                />
                            )}
                        </>
                    }
                />
            </div>
        )
    }, [navigate, onEdit])

    // Export utilities
    const getColumnTitle = React.useCallback((columnId: string) => {
        const column = columns.find((col) => {
            const id = (col as any).id
            const accessorKey = (col as any).accessorKey
            return id === columnId || accessorKey === columnId
        })
        return (column?.meta as any)?.title || columnId
    }, [columns])

    const getCellValue = React.useCallback((row: DanhMucCauHoi, columnId: string) => {
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách danh mục câu hỏi</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
        <GenericListView
            columns={columns}
            data={danhMucCauHoiList || []}
            filterColumn="ten_nhom"
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
                    navigate(`${danhMucCauHoiConfig.routePath}/${row.id}`)
                }
            }}
            onAdd={() => {
                if (onAddNew) {
                    onAddNew()
                } else {
                    navigate(`${danhMucCauHoiConfig.routePath}/moi`)
                }
            }}
            addHref={`${danhMucCauHoiConfig.routePath}/moi`}
            onBack={() => {
                navigate(danhMucCauHoiConfig.parentPath)
            }}
            onDeleteSelected={async (selectedRows) => {
                const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                await batchDeleteMutation.mutateAsync(ids)
            }}
            searchFields={danhMucCauHoiConfig.searchFields as (keyof DanhMucCauHoi)[]}
            module={module}
            enableSuggestions={true}
            enableRangeSelection={true}
            enableLongPress={true}
            persistSelection={false}
            renderMobileCard={renderMobileCard}
            enableVirtualization={(danhMucCauHoiList?.length || 0) > 100}
            virtualRowHeight={60}
            exportOptions={{
                columns: columns,
                totalCount: danhMucCauHoiList?.length || 0,
                moduleName: danhMucCauHoiConfig.moduleTitle,
                getColumnTitle,
                getCellValue,
            }}
            onEdit={(row) => {
                if (onEdit) {
                    onEdit(row.id!)
                } else {
                    navigate(`${danhMucCauHoiConfig.routePath}/${row.id}/sua?returnTo=list`)
                }
            }}
            onDelete={(row) => {
                setRowToDelete(row)
                setDeleteDialogOpen(true)
            }}
            filters={filters}
            onImport={() => setImportDialogOpen(true)}
            isImporting={batchImportMutation.isPending}
        />

            {/* Import Dialog */}
            <DanhMucCauHoiImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa danh mục câu hỏi</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa danh mục câu hỏi <strong>{rowToDelete?.ten_nhom}</strong>? Hành động này không thể hoàn tác.
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

