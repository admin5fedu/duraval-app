"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { KyThi } from "../schema"
import { useKyThi, useBatchDeleteKyThi, useDeleteKyThi } from "../hooks"
import { kyThiColumns } from "./ky-thi-columns"
import { kyThiConfig } from "../config"
import { useBaiThi } from "../../bai-thi/hooks/use-bai-thi"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertKyThi } from "../actions/ky-thi-excel-actions"
import { KyThiImportDialog } from "./ky-thi-import-dialog"
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
import { Badge } from "@/components/ui/badge"

interface KyThiListViewProps {
    initialData?: KyThi[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function KyThiListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: KyThiListViewProps = {}) {
    const { data: kyThiList, isLoading, isError, refetch } = useKyThi(initialData)
    const { data: baiThiList } = useBaiThi()
    const { employee } = useAuthStore()
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteKyThi()
    const deleteMutation = useDeleteKyThi()
    const batchImportMutation = useBatchUpsertKyThi()
    const module = kyThiConfig.moduleName
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<KyThi | null>(null)

    // Create map: kyThiId -> bài thi của user hiện tại (bài thi tốt nhất hoặc đang thi)
    const myBaiThiMap = React.useMemo(() => {
        if (!employee?.ma_nhan_vien || !baiThiList || !kyThiList) {
            return new Map<number, { status: string; diem_so?: number; tong_so_cau?: number }>()
        }

        const map = new Map<number, { status: string; diem_so?: number; tong_so_cau?: number }>()
        
        kyThiList.forEach((kyThi) => {
            if (!kyThi.id) return

            // Check if user can take this test
            const canTakeTest = !kyThi.chuc_vu_ids || kyThi.chuc_vu_ids.length === 0 || 
                (employee.chuc_vu_id && kyThi.chuc_vu_ids.includes(employee.chuc_vu_id))

            if (!canTakeTest) {
                // User không có quyền thi
                return
            }

            // Find all bài thi của user cho kỳ thi này
            const myTests = baiThiList.filter(
                (bt) => bt.ky_thi_id === kyThi.id && bt.nhan_vien_id === employee.ma_nhan_vien
            )

            if (myTests.length === 0) {
                // Chưa thi
                map.set(kyThi.id, { status: "Chưa thi" })
            } else {
                // Tìm bài thi đang thi (ưu tiên)
                const unfinishedTest = myTests.find(
                    (bt) => bt.trang_thai === "Chưa thi" || bt.trang_thai === "Đang thi"
                )

                if (unfinishedTest) {
                    map.set(kyThi.id, { 
                        status: unfinishedTest.trang_thai,
                        diem_so: unfinishedTest.diem_so || undefined,
                        tong_so_cau: unfinishedTest.tong_so_cau || undefined
                    })
                } else {
                    // Tìm bài thi tốt nhất (điểm cao nhất)
                    const bestTest = myTests.reduce((best, current) => {
                        const bestScore = best.diem_so || 0
                        const currentScore = current.diem_so || 0
                        return currentScore > bestScore ? current : best
                    })

                    map.set(kyThi.id, {
                        status: bestTest.trang_thai,
                        diem_so: bestTest.diem_so || undefined,
                        tong_so_cau: bestTest.tong_so_cau || undefined
                    })
                }
            }
        })

        return map
    }, [employee, baiThiList, kyThiList])

    // Create columns
    const columns = React.useMemo(() => {
        return kyThiColumns(myBaiThiMap, employee)
    }, [myBaiThiMap, employee])

    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, [{ id: "ngay", desc: true }])

    // Build filters array from config
    const filters = React.useMemo(() => {
        return kyThiConfig.filterColumns || []
    }, [])

    const handleAddNewClick = () => {
        if (onAddNew) {
            onAddNew()
        } else {
            navigate(`${kyThiConfig.routePath}/moi`)
        }
    }

    const handleEditClick = (id: number) => {
        if (onEdit) {
            onEdit(id)
        } else {
            navigate(`${kyThiConfig.routePath}/${id}/sua`)
        }
    }

    const handleViewClick = (id: number) => {
        if (onView) {
            onView(id)
        } else {
            navigate(`${kyThiConfig.routePath}/${id}`)
        }
    }

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: KyThi) => {
        // Check if user can take this test
        const canTakeTest = !row.chuc_vu_ids || row.chuc_vu_ids.length === 0 || 
            (employee?.chuc_vu_id && row.chuc_vu_ids.includes(employee.chuc_vu_id))
        
        const myBaiThi = row.id ? myBaiThiMap.get(row.id) : null

        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base text-foreground leading-tight line-clamp-2 block">
                                {row.ten_ky_thi}
                            </span>
                            {row.ngay && (
                                <span className="text-sm text-muted-foreground">
                                    {format(new Date(row.ngay), "dd/MM/yyyy", { locale: vi })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={row.trang_thai === "Mở" ? "default" : "secondary"}>
                            {row.trang_thai}
                        </Badge>
                        {canTakeTest && myBaiThi && (
                            <Badge
                                variant={
                                    myBaiThi.status === "Đạt"
                                        ? "default"
                                        : myBaiThi.status === "Không đạt"
                                        ? "destructive"
                                        : myBaiThi.status === "Đang thi"
                                        ? "outline"
                                        : "secondary"
                                }
                            >
                                {myBaiThi.status}
                                {myBaiThi.diem_so !== undefined && myBaiThi.tong_so_cau !== undefined
                                    ? ` (${myBaiThi.diem_so}/${myBaiThi.tong_so_cau})`
                                    : ""}
                            </Badge>
                        )}
                        {canTakeTest && !myBaiThi && (
                            <Badge variant="outline" className="bg-muted text-muted-foreground">
                                Chưa thi
                            </Badge>
                        )}
                        <span className="font-medium text-foreground">
                            {row.so_cau_hoi} câu • {row.so_phut_lam_bai} phút
                        </span>
                        {(row.nhom_chuyen_de_ids?.length || 0) > 0 && (
                            <span className="text-muted-foreground">
                                • {row.nhom_chuyen_de_ids.length} nhóm
                            </span>
                        )}
                        {(row.chuyen_de_ids?.length || 0) > 0 && (
                            <span className="text-muted-foreground">
                                • {row.chuyen_de_ids.length} chuyên đề
                            </span>
                        )}
                        {row.chuc_vu_ids && row.chuc_vu_ids.length > 0 && (
                            <span className="text-muted-foreground">
                                • {row.chuc_vu_ids.length} chức vụ
                            </span>
                        )}
                    </div>
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
    }, [myBaiThiMap, employee])

    // Export utilities
    const getColumnTitle = React.useCallback((columnId: string) => {
        const column = columns.find((col) => {
            const id = (col as any).id
            const accessorKey = (col as any).accessorKey
            return id === columnId || accessorKey === columnId
        })
        return (column?.meta as any)?.title || columnId
    }, [columns])

    const getCellValue = React.useCallback((row: KyThi, columnId: string) => {
        if (columnId === "ngay") {
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách kỳ thi</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
            <GenericListView
                data={kyThiList || []}
                columns={columns}
                filterColumn="ten_ky_thi"
                module={module}
                searchFields={kyThiConfig.searchFields as (keyof KyThi)[]}
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
                    itemName: "kỳ thi",
                    moduleName: kyThiConfig.moduleTitle,
                    isLoading: batchDeleteMutation.isPending,
                    getItemLabel: (item: KyThi) => item.ten_ky_thi?.substring(0, 50) || String(item.id),
                }}
                onAdd={handleAddNewClick}
                addHref={`${kyThiConfig.routePath}/moi`}
                onBack={() => {
                    navigate(kyThiConfig.parentPath)
                }}
                enableSuggestions={true}
                enableRangeSelection={true}
                enableLongPress={true}
                persistSelection={false}
                renderMobileCard={renderMobileCard}
                enableVirtualization={(kyThiList?.length || 0) > 100}
                virtualRowHeight={60}
                exportOptions={{
                    columns: columns,
                    totalCount: kyThiList?.length || 0,
                    moduleName: kyThiConfig.moduleTitle,
                    getColumnTitle,
                    getCellValue,
                }}
                onEdit={(row) => handleEditClick(row.id!)}
                onDelete={(row) => {
                    setRowToDelete(row)
                    setDeleteDialogOpen(true)
                }}
                onRowClick={(row) => handleViewClick(row.id!)}
                onImport={() => setImportDialogOpen(true)}
                isImporting={batchImportMutation.isPending}
            />

            {/* Import Dialog */}
            <KyThiImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa kỳ thi <strong>{rowToDelete?.ten_ky_thi?.substring(0, 50) || rowToDelete?.id || "này"}</strong>? Hành động này không thể hoàn tác.
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
        </>
    )
}

