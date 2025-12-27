"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { PhongBan } from "../schema"
import { usePhongBan, useBatchDeletePhongBan, useDeletePhongBan } from "../hooks"
import { phongBanColumns } from "./phong-ban-columns"
import { phongBanConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertPhongBan } from "../actions/phong-ban-excel-actions"
import { PhongBanImportDialog } from "./phong-ban-import-dialog"
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

interface PhongBanListViewProps {
    initialData?: PhongBan[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function PhongBanListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: PhongBanListViewProps = {}) {
    const { data: phongBanList, isLoading, isError, refetch } = usePhongBan(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeletePhongBan()
    const deleteMutation = useDeletePhongBan()
    const batchImportMutation = useBatchUpsertPhongBan()
    const module = phongBanConfig.moduleName
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<PhongBan | null>(null)
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)

    // Create columns with phongBanList for mapping truc_thuoc_id
    const columns = React.useMemo(() => {
        return phongBanColumns(phongBanList || [])
    }, [phongBanList])

    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, [{ id: "tg_tao", desc: true }])

    // Generate filter options for trực thuộc từ data
    const trucThuocOptions = React.useMemo(() => {
        if (!phongBanList) return []
        
        // Thêm option "Không có trực thuộc"
        const options: Array<{ label: string; value: string }> = [
            { label: "Không có trực thuộc", value: "null" },
        ]
        
        // Lấy danh sách các phòng ban có trực thuộc và tạo unique list
        const trucThuocIds = Array.from(
            new Set(
                phongBanList
                    .map((pb) => pb.truc_thuoc_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        )
        
        const trucThuocOptionsFromData = trucThuocIds.map((id) => {
            const phongBan = phongBanList.find((pb) => pb.id === id)
            if (phongBan) {
                return {
                    label: `${phongBan.ma_phong_ban} - ${phongBan.ten_phong_ban}`,
                    value: String(id),
                }
            }
            return { label: String(id), value: String(id) }
        }).sort((a, b) => a.label.localeCompare(b.label))
        
        return [...options, ...trucThuocOptionsFromData]
    }, [phongBanList])

    // Build filters array from config and dynamic options
    const filters = React.useMemo(() => {
        const filterConfigs = phongBanConfig.filterColumns || []
        return filterConfigs.map((filterConfig) => {
            if (filterConfig.columnId === "truc_thuoc_id") {
                return {
                    ...filterConfig,
                    options: trucThuocOptions,
                }
            }
            return filterConfig
        })
    }, [trucThuocOptions])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: PhongBan) => {
        // Find trực thuộc phòng ban name
        const trucThuocPhongBan = row.truc_thuoc_id 
            ? phongBanList?.find((pb) => pb.id === row.truc_thuoc_id)
            : null
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base text-foreground leading-tight truncate block">
                                {row.ten_phong_ban}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.ma_phong_ban && (
                        <p className="leading-snug">
                            Mã: <span className="font-medium text-foreground">{row.ma_phong_ban}</span>
                        </p>
                    )}
                    {row.cap_do && (
                        <p className="leading-snug">
                            Cấp độ: <span className="font-medium text-foreground">{row.cap_do}</span>
                        </p>
                    )}
                    {trucThuocPhongBan && (
                        <p className="leading-snug">
                            Trực thuộc: {trucThuocPhongBan.ma_phong_ban} - {trucThuocPhongBan.ten_phong_ban}
                        </p>
                    )}
                </div>
            </div>
        )
    }, [phongBanList])

    // Export utilities
    const getColumnTitle = React.useCallback((columnId: string) => {
        const column = columns.find((col) => {
            const id = (col as any).id
            const accessorKey = (col as any).accessorKey
            return id === columnId || accessorKey === columnId
        })
        return (column?.meta as any)?.title || columnId
    }, [columns])

    const getCellValue = React.useCallback((row: PhongBan, columnId: string) => {
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
            const value = (row as any)[columnId]
            if (!value) return ""
            return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
        }
        // Handle truc_thuoc_id - display mapped name
        if (columnId === "truc_thuoc_id") {
            const trucThuocId = (row as any)[columnId]
            if (!trucThuocId) return ""
            const trucThuocPhongBan = phongBanList?.find((pb) => pb.id === trucThuocId)
            return trucThuocPhongBan ? `${trucThuocPhongBan.ma_phong_ban} - ${trucThuocPhongBan.ten_phong_ban}` : String(trucThuocId)
        }
        return (row as any)[columnId] ?? ""
    }, [phongBanList])

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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách phòng ban</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
        <GenericListView
            columns={columns}
            data={phongBanList || []}
            filterColumn="ma_phong_ban"
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
                    navigate(`${phongBanConfig.routePath}/${row.id}`)
                }
            }}
            onAdd={() => {
                if (onAddNew) {
                    onAddNew()
                } else {
                    navigate(`${phongBanConfig.routePath}/moi`)
                }
            }}
            addHref={`${phongBanConfig.routePath}/moi`}
            onBack={() => {
                navigate(phongBanConfig.parentPath)
            }}
            onDeleteSelected={async (selectedRows) => {
                const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                await batchDeleteMutation.mutateAsync(ids)
            }}
            filters={filters}
            searchFields={phongBanConfig.searchFields as (keyof PhongBan)[]}
            module={module}
            enableSuggestions={true}
            enableRangeSelection={true}
            enableLongPress={true}
            persistSelection={false}
            renderMobileCard={renderMobileCard}
            enableVirtualization={(phongBanList?.length || 0) > 100}
            virtualRowHeight={60}
            exportOptions={{
                columns: columns,
                totalCount: phongBanList?.length || 0,
                moduleName: phongBanConfig.moduleTitle,
                getColumnTitle,
                getCellValue,
            }}
            onImport={() => setImportDialogOpen(true)}
            isImporting={batchImportMutation.isPending}
            onEdit={(row) => {
                if (onEdit) {
                    onEdit(row.id!)
                } else {
                    navigate(`${phongBanConfig.routePath}/${row.id}/sua`)
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
                            Bạn có chắc chắn muốn xóa phòng ban <strong>{rowToDelete?.ten_phong_ban}</strong>? Hành động này không thể hoàn tác.
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
            <PhongBanImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />
        </>
    )
}

