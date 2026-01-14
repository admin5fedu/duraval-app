"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ZoomableAvatar } from "@/components/ui/zoomable-avatar"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { NhanSu } from "../schema"
import { useNhanSu, useBatchDeleteNhanSu, useDeleteNhanSu } from "../hooks"
import { nhanSuColumns } from "./nhan-su-columns"
import { nhanSuConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { NhanSuImportDialog } from "./nhan-su-import-dialog"
import { useBatchUpsertNhanSu } from "../actions/nhan-su-excel-actions"
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

interface NhanSuListViewProps {
    initialData?: NhanSu[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function NhanSuListView({
    initialData,
    onEdit,
    onAddNew,
    onView,
}: NhanSuListViewProps = {}) {
    const { data: nhanSuList, isLoading, isError, refetch } = useNhanSu(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteNhanSu()
    const deleteMutation = useDeleteNhanSu()
    const batchImportMutation = useBatchUpsertNhanSu()
    const module = nhanSuConfig.moduleName
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<NhanSu | null>(null)

    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    // Filters KHÔNG persist qua page reload (fresh start)
    // Filters được maintain khi navigate trong cùng session
    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, [{ id: "ma_nhan_vien", desc: true }])

    // Generate filter options from data
    const phongBanOptions = React.useMemo(() => {
        const unique = Array.from(
            new Set(nhanSuList?.map((e) => e.ma_phong).filter((d): d is string => !!d) || [])
        )
        return unique.map((d) => ({ label: d, value: d }))
    }, [nhanSuList])

    const chucVuOptions = React.useMemo(() => {
        const unique = Array.from(
            new Set(nhanSuList?.map((e) => e.ma_chuc_vu).filter((d): d is string => !!d) || [])
        )
        return unique.map((d) => ({ label: d, value: d }))
    }, [nhanSuList])

    const capBacOptions = React.useMemo(() => {
        const unique = Array.from(
            new Set(nhanSuList?.map((e) => e.ten_cap_bac).filter((d): d is string => !!d) || [])
        )
        return unique.map((d) => ({ label: d, value: d }))
    }, [nhanSuList])

    const statusOptions = [
        { label: "Chính thức", value: "Chính thức" },
        { label: "Thử việc", value: "Thử việc" },
        { label: "Nghỉ việc", value: "Nghỉ việc" },
        { label: "Tạm nghỉ", value: "Tạm nghỉ" },
    ]

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: NhanSu) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Avatar + thông tin chính */}
                <div className="flex gap-3 items-center">
                    <ZoomableAvatar
                        src={row.avatar_url}
                        alt={row.ho_ten}
                        className="h-10 w-10 rounded-full shrink-0"
                        fallback={row.ho_ten?.charAt(0) ?? "?"}
                    />
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base text-foreground leading-tight truncate block">
                                {row.ho_ten}
                            </span>
                            {(row.ma_chuc_vu || row.ma_phong || row.tinh_trang) && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    {(row.ma_chuc_vu || row.ma_phong) && (
                                        <p className="text-sm text-muted-foreground leading-snug line-clamp-1">
                                            {row.ma_chuc_vu}
                                            {row.ma_chuc_vu && row.ma_phong && " · "}
                                            {row.ma_phong}
                                        </p>
                                    )}
                                    {row.tinh_trang && (
                                        <Badge
                                            variant={row.tinh_trang === "Chính thức" ? "default" : "secondary"}
                                            className="shrink-0 text-[11px] px-2 py-0"
                                        >
                                            {row.tinh_trang}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Góc phải: Giới tính + Ngày sinh */}
                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                            {row.gioi_tinh && (
                                <Badge variant="outline" className="shrink-0 text-[11px] px-2 py-0">
                                    {row.gioi_tinh}
                                </Badge>
                            )}
                            {row.ngay_sinh && (
                                <span className="text-[11px] text-muted-foreground">
                                    {format(new Date(row.ngay_sinh), "dd/MM/yyyy", { locale: vi })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.ma_nhan_vien && (
                        <p className="leading-snug">
                            Mã NV: <span className="font-medium text-foreground">{row.ma_nhan_vien}</span>
                        </p>
                    )}
                    {row.email_cong_ty && (
                        <p className="leading-snug break-all">Email: {row.email_cong_ty}</p>
                    )}
                </div>
            </div>
        )
    }, [])

    // Export utilities
    const getColumnTitle = React.useCallback((columnId: string) => {
        const column = nhanSuColumns.find((col) => {
            if (col.id === columnId) return true
            if ('accessorKey' in col && col.accessorKey === columnId) return true
            return false
        })
        return (column?.meta as any)?.title || columnId
    }, [])

    const getCellValue = React.useCallback((row: NhanSu, columnId: string) => {
        if (columnId === "ngay_sinh" || columnId === "ngay_thu_viec" || columnId === "ngay_chinh_thuc" || columnId === "ngay_nghi_viec") {
            const value = (row as any)[columnId]
            if (!value) return ""
            return format(new Date(value), "dd/MM/yyyy", { locale: vi })
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách nhân sự</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
            <GenericListView
                columns={nhanSuColumns}
                data={nhanSuList || []}
                filterColumn="ho_ten"
                initialSorting={initialSorting}
                initialFilters={initialFilters}
                initialSearch={initialSearch}
                onFiltersChange={handleFiltersChange}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                onRowClick={(row) => {
                    if (onView) {
                        onView(row.ma_nhan_vien)
                    } else {
                        navigate(`${nhanSuConfig.routePath}/${row.ma_nhan_vien}`)
                    }
                }}
                onAdd={() => {
                    if (onAddNew) {
                        onAddNew()
                    } else {
                        navigate(`${nhanSuConfig.routePath}/moi`)
                    }
                }}
                addHref={`${nhanSuConfig.routePath}/moi`}
                onBack={() => {
                    navigate(nhanSuConfig.parentPath)
                }}
                onDeleteSelected={async (selectedRows) => {
                    const ids = selectedRows.map((row) => row.ma_nhan_vien)
                    await batchDeleteMutation.mutateAsync(ids)
                }}
                batchDeleteConfig={{
                    itemName: "nhân sự",
                    moduleName: nhanSuConfig.moduleTitle,
                    isLoading: batchDeleteMutation.isPending,
                    getItemLabel: (item: NhanSu) => `${item.ma_nhan_vien} - ${item.ho_ten || ""}`,
                }}
                filters={[
                    {
                        columnId: "ma_phong",
                        title: "Phòng ban",
                        options: phongBanOptions,
                    },
                    {
                        columnId: "ma_chuc_vu",
                        title: "Chức vụ",
                        options: chucVuOptions,
                    },
                    {
                        columnId: "ten_cap_bac",
                        title: "Cấp bậc",
                        options: capBacOptions,
                    },
                    {
                        columnId: "tinh_trang",
                        title: "Tình trạng",
                        options: statusOptions,
                    },
                ]}
                searchFields={nhanSuConfig.searchFields as (keyof NhanSu)[]}
                module={module}
                enableSuggestions={true}
                enableRangeSelection={true}
                enableLongPress={true}
                persistSelection={false}
                renderMobileCard={renderMobileCard}
                enableVirtualization={(nhanSuList || []).length > 100}
                virtualRowHeight={60}
                exportOptions={{
                    columns: nhanSuColumns,
                    totalCount: nhanSuList?.length || 0,
                    moduleName: nhanSuConfig.moduleTitle,
                    getColumnTitle,
                    getCellValue,
                }}
                onImport={() => setImportDialogOpen(true)}
                isImporting={batchImportMutation.isPending}
                onEdit={(row) => {
                    if (onEdit) {
                        onEdit(row.ma_nhan_vien)
                    } else {
                        navigate(`${nhanSuConfig.routePath}/${row.ma_nhan_vien}/sua`)
                    }
                }}
                onDelete={(row) => {
                    setRowToDelete(row)
                    setDeleteDialogOpen(true)
                }}
            />

            {/* Import Dialog */}
            <NhanSuImportDialog
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
                            Bạn có chắc chắn muốn xóa nhân sự <strong>{rowToDelete?.ho_ten}</strong>? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (rowToDelete?.ma_nhan_vien) {
                                    try {
                                        await deleteMutation.mutateAsync(rowToDelete.ma_nhan_vien)
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
