"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { NguoiThan } from "../schema"
import { useNguoiThan, useBatchDeleteNguoiThan, useDeleteNguoiThan } from "../hooks"
import { nguoiThanColumns } from "./nguoi-than-columns"
import { nguoiThanConfig } from "../config"
import { useNhanSu } from "../../danh-sach-nhan-su/hooks/use-nhan-su"
import type { NhanSu } from "../../danh-sach-nhan-su/schema"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertNguoiThan } from "../actions/nguoi-than-excel-actions"
import { NguoiThanImportDialog } from "./nguoi-than-import-dialog"
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

interface NguoiThanListViewProps {
    initialData?: NguoiThan[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function NguoiThanListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: NguoiThanListViewProps = {} as NguoiThanListViewProps) {
    const { data: nguoiThanList, isLoading, isError, refetch } = useNguoiThan(initialData)
    const { data: employees } = useNhanSu() // Load employees to map names
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteNguoiThan()
    const deleteMutation = useDeleteNguoiThan()
    const batchImportMutation = useBatchUpsertNguoiThan()
    const module = nguoiThanConfig.moduleName
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<NguoiThan | null>(null)
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)

    // Create employee map for quick lookup
    const employeeMap = React.useMemo(() => {
        const map = new Map<number, { ma_nhan_vien: number; ho_ten: string }>()
        employees?.forEach((emp: NhanSu) => {
            map.set(emp.ma_nhan_vien, { ma_nhan_vien: emp.ma_nhan_vien, ho_ten: emp.ho_ten })
        })
        return map
    }, [employees])

    // ✅ Thêm trường ảo ten_nhan_vien vào data để hỗ trợ tìm kiếm theo tên nhân viên
    const enrichedData = React.useMemo(() => {
        if (!nguoiThanList) return []
        return nguoiThanList.map((item: NguoiThan) => ({
            ...item,
            ten_nhan_vien: employeeMap.get(item.ma_nhan_vien)?.ho_ten || "",
        }))
    }, [nguoiThanList, employeeMap])

    // Create columns with employee map
    const columnsWithEmployeeMap = React.useMemo(() => {
        return nguoiThanColumns(employeeMap)
    }, [employeeMap])

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
    const moiQuanHeOptions = React.useMemo(() => {
        const unique = Array.from(
            new Set(nguoiThanList?.map((e: NguoiThan) => e.moi_quan_he).filter((d: string | null | undefined): d is string => !!d) || [])
        ) as string[]
        return unique.map((d: string) => ({ label: d, value: d }))
    }, [nguoiThanList])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: NguoiThan) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base text-foreground leading-tight truncate block">
                                {row.ho_va_ten}
                            </span>
                            {row.moi_quan_he && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Badge variant="secondary" className="shrink-0 text-[11px] px-2 py-0">
                                        {row.moi_quan_he}
                                    </Badge>
                                </div>
                            )}
                        </div>
                        {/* Góc phải: Ngày sinh */}
                        <div className="flex flex-col items-end gap-0.5 shrink-0">
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
                    {row.so_dien_thoai && (
                        <p className="leading-snug">SĐT: {row.so_dien_thoai}</p>
                    )}
                </div>
            </div>
        )
    }, [])

    // Export utilities
    const getColumnTitle = React.useCallback((columnId: string) => {
        const column = columnsWithEmployeeMap.find((col) => {
            const id = (col as any).id
            const accessorKey = (col as any).accessorKey
            return id === columnId || accessorKey === columnId
        })
        return (column?.meta as any)?.title || columnId
    }, [columnsWithEmployeeMap])

    const getCellValue = React.useCallback((row: NguoiThan, columnId: string) => {
        if (columnId === "ngay_sinh") {
            const value = (row as any)[columnId]
            if (!value) return ""
            return format(new Date(value), "dd/MM/yyyy", { locale: vi })
        }
        if (columnId === "tg_tao") {
            const value = (row as any)[columnId]
            if (!value) return ""
            return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
        }
        if (columnId === "ma_nhan_vien") {
            const maNhanVien = row.ma_nhan_vien
            const employee = employeeMap.get(maNhanVien)
            if (employee) {
                return `${employee.ma_nhan_vien} - ${employee.ho_ten}`
            }
            return String(maNhanVien)
        }
        return (row as any)[columnId] ?? ""
    }, [employeeMap])

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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách người thân</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
        <GenericListView
            columns={columnsWithEmployeeMap}
            data={enrichedData}
            filterColumn="ho_va_ten"
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
                    navigate(`${nguoiThanConfig.routePath}/${row.id}`)
                }
            }}
            onAdd={() => {
                if (onAddNew) {
                    onAddNew()
                } else {
                    navigate(`${nguoiThanConfig.routePath}/moi`)
                }
            }}
            addHref={`${nguoiThanConfig.routePath}/moi`}
            onBack={() => {
                navigate(nguoiThanConfig.parentPath)
            }}
            onDeleteSelected={async (selectedRows) => {
                const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                await batchDeleteMutation.mutateAsync(ids)
            }}
            batchDeleteConfig={{
                itemName: "người thân",
                moduleName: nguoiThanConfig.moduleTitle,
                isLoading: batchDeleteMutation.isPending,
                getItemLabel: (item: NguoiThan) => item.ho_va_ten || String(item.id),
            }}
            filters={[
                {
                    columnId: "moi_quan_he",
                    title: "Mối quan hệ",
                    options: moiQuanHeOptions,
                },
            ]}
            searchFields={nguoiThanConfig.searchFields as (keyof NguoiThan)[]}
            module={module}
            enableSuggestions={true}
            enableRangeSelection={true}
            enableLongPress={true}
            persistSelection={false}
            renderMobileCard={renderMobileCard}
            enableVirtualization={enrichedData.length > 100}
            virtualRowHeight={60}
            exportOptions={{
                columns: columnsWithEmployeeMap,
                totalCount: enrichedData.length,
                moduleName: nguoiThanConfig.moduleTitle,
                getColumnTitle,
                getCellValue,
            }}
            onImport={() => setImportDialogOpen(true)}
            isImporting={batchImportMutation.isPending}
            onEdit={(row) => {
                if (onEdit) {
                    onEdit(row.id!)
                } else {
                    navigate(`${nguoiThanConfig.routePath}/${row.id}/sua`)
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
                            Bạn có chắc chắn muốn xóa người thân <strong>{rowToDelete?.ho_va_ten}</strong>? Hành động này không thể hoàn tác.
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
            <NguoiThanImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />
        </>
    )
}

