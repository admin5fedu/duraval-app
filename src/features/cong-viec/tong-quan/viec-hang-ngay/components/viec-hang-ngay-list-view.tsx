"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ViecHangNgay } from "../schema"
import { useViecHangNgay, useBatchDeleteViecHangNgay, useDeleteViecHangNgay } from "../hooks"
import { createColumns } from "./viec-hang-ngay-columns"
import { viecHangNgayConfig } from "../config"
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
import { DeleteViecHangNgayButton } from "./delete-viec-hang-ngay-button"
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks/use-nhan-su"
import { usePhongBan } from "@/features/he-thong/so-do/phong-ban/hooks/use-phong-ban"
import { MobileCardActionBar } from "@/shared/components/data-display/mobile-card-action-bar"
import { Edit } from "lucide-react"
import { ViecHangNgayImportDialog } from "./viec-hang-ngay-import-dialog"
import { useBatchUpsertViecHangNgay } from "../actions/viec-hang-ngay-excel-actions"

interface ViecHangNgayListViewProps {
    initialData?: ViecHangNgay[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function ViecHangNgayListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: ViecHangNgayListViewProps = {}) {
    const { data: viecHangNgayList, isLoading, isError, refetch } = useViecHangNgay(initialData)
    const { data: employees } = useNhanSu()
    const { data: phongBans } = usePhongBan()
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteViecHangNgay()
    const deleteMutation = useDeleteViecHangNgay()
    const batchImportMutation = useBatchUpsertViecHangNgay()
    const module = viecHangNgayConfig.moduleName
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<ViecHangNgay | null>(null)

    // Create columns with employee data and phong ban data
    const columns = React.useMemo(() => {
        // Pass employees with nhom field for nhom mapping
        return createColumns(
            employees?.map(emp => ({
                ma_nhan_vien: emp.ma_nhan_vien,
                ho_ten: emp.ho_ten,
                nhom: emp.nhom
            })),
            (row) => {
                if (onEdit) {
                    onEdit(row.id!)
                } else {
                    navigate(`${viecHangNgayConfig.routePath}/${row.id}/sua?returnTo=list`)
                }
            },
            phongBans
        )
    }, [employees, navigate, onEdit, phongBans])

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
    const nhanVienOptions = React.useMemo(() => {
        if (!employees) return []
        return employees
            .filter(emp => emp.ma_nhan_vien && emp.ho_ten)
            .map(emp => ({
                label: `${emp.ma_nhan_vien} - ${emp.ho_ten}`,
                value: String(emp.ma_nhan_vien)
            }))
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [employees])

    const ngayBaoCaoOptions = React.useMemo(() => {
        if (!viecHangNgayList) return []
        const uniqueDates = new Set<string>()
        for (const item of viecHangNgayList) {
            if (item.ngay_bao_cao) {
                try {
                    const dateObj = new Date(item.ngay_bao_cao)
                    const dateStr = format(dateObj, "dd/MM/yyyy", { locale: vi })
                    uniqueDates.add(dateStr)
                } catch {
                    // If date parsing fails, use original string
                    uniqueDates.add(String(item.ngay_bao_cao))
                }
            }
        }
        return Array.from(uniqueDates).sort((a, b) => {
            // Sort dates in descending order (newest first)
            try {
                const dateA = new Date(a.split('/').reverse().join('-'))
                const dateB = new Date(b.split('/').reverse().join('-'))
                return dateB.getTime() - dateA.getTime()
            } catch {
                return b.localeCompare(a)
            }
        }).map(d => ({ label: d, value: d }))
    }, [viecHangNgayList])

    const phongBanIdOptions = React.useMemo(() => {
        if (!viecHangNgayList || !phongBans) return []
        const uniqueIds = new Set<number>()
        
        // Collect unique phong_ban_id from data
        for (const item of viecHangNgayList) {
            if (item.phong_ban_id) {
                uniqueIds.add(item.phong_ban_id)
            }
        }
        
        return Array.from(uniqueIds)
            .map(id => {
                const pb = phongBans.find(p => p.id === id)
                return pb ? {
                    label: `${pb.ma_phong_ban || String(id)} - ${pb.ten_phong_ban}`,
                    value: String(id)
                } : null
            })
            .filter((opt): opt is { label: string; value: string } => opt !== null)
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [viecHangNgayList, phongBans])

    const maPhongOptions = React.useMemo(() => {
        if (!viecHangNgayList || !phongBans) return []
        const uniqueValues = new Map<string, string>() // ma_phong -> ten_phong_ban
        
        // Create phong ban map
        const pbMap = new Map<string, string>()
        phongBans.forEach(pb => {
            if (pb.ma_phong_ban) {
                pbMap.set(pb.ma_phong_ban, pb.ten_phong_ban || pb.ma_phong_ban)
            }
        })
        
        for (const item of viecHangNgayList) {
            if (item.ma_phong && !uniqueValues.has(item.ma_phong)) {
                const tenPhong = pbMap.get(item.ma_phong) || item.ma_phong
                uniqueValues.set(item.ma_phong, tenPhong)
            }
        }
        
        return Array.from(uniqueValues.entries())
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([maPhong, tenPhong]) => ({ 
                label: `${maPhong} - ${tenPhong}`, 
                value: maPhong 
            }))
    }, [viecHangNgayList, phongBans])

    const maNhomOptions = React.useMemo(() => {
        if (!viecHangNgayList || !employees) return []
        const uniqueValues = new Map<string, string>() // ma_nhom -> ten_nhom
        
        // Create nhom map from employees (ma_nhom in viec_hang_ngay corresponds to nhom in nhan_su)
        const nhomMap = new Map<string, string>()
        employees.forEach(emp => {
            if (emp.nhom) {
                // Use nhom as both key and value for now, or we can use a different mapping
                // Since ma_nhom in viec_hang_ngay might match nhom in nhan_su
                nhomMap.set(emp.nhom, emp.nhom)
            }
        })
        
        for (const item of viecHangNgayList) {
            if (item.ma_nhom && !uniqueValues.has(item.ma_nhom)) {
                // Try to find matching nhom from employees
                const tenNhom = nhomMap.get(item.ma_nhom) || item.ma_nhom
                uniqueValues.set(item.ma_nhom, tenNhom)
            }
        }
        
        return Array.from(uniqueValues.entries())
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([maNhom, tenNhom]) => ({ 
                label: `${maNhom} - ${tenNhom}`, 
                value: maNhom 
            }))
    }, [viecHangNgayList, employees])

    // Build filters array from config and dynamic options
    const filters = React.useMemo(() => {
        const filterConfigs = viecHangNgayConfig.filterColumns || []
        return filterConfigs.map((filterConfig) => {
            if (filterConfig.columnId === "ma_nhan_vien") {
                return {
                    ...filterConfig,
                    options: nhanVienOptions,
                }
            }
            if (filterConfig.columnId === "ngay_bao_cao") {
                return {
                    ...filterConfig,
                    options: ngayBaoCaoOptions,
                }
            }
            if (filterConfig.columnId === "phong_ban_id") {
                return {
                    ...filterConfig,
                    options: phongBanIdOptions,
                }
            }
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
    }, [nhanVienOptions, ngayBaoCaoOptions, phongBanIdOptions, maPhongOptions, maNhomOptions])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: ViecHangNgay) => {
        const employee = employees?.find(emp => emp.ma_nhan_vien === row.ma_nhan_vien)
        const displayText = employee 
            ? `${employee.ma_nhan_vien} - ${employee.ho_ten}`
            : String(row.ma_nhan_vien)

        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <span className="font-semibold text-base text-foreground leading-tight block">
                            {displayText}
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

                <MobileCardActionBar
                    rightActions={
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (!row.id) return
                                    if (onEdit) {
                                        onEdit(row.id)
                                    } else {
                                        navigate(`${viecHangNgayConfig.routePath}/${row.id}/sua?returnTo=list`)
                                    }
                                }}
                            >
                                <Edit className="h-3 w-3 mr-1" />
                                Sửa
                            </Button>
                            {row.id && (
                                <DeleteViecHangNgayButton
                                    id={row.id}
                                    name={displayText}
                                    iconOnly
                                />
                            )}
                        </>
                    }
                />
            </div>
        )
    }, [employees, navigate, onEdit])

    // Export utilities
    const getColumnTitle = React.useCallback((columnId: string) => {
        const column = columns.find((col) => {
            const id = (col as any).id
            const accessorKey = (col as any).accessorKey
            return id === columnId || accessorKey === columnId
        })
        return (column?.meta as any)?.title || columnId
    }, [columns])

    const getCellValue = React.useCallback((row: ViecHangNgay, columnId: string) => {
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách việc hàng ngày</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
        <GenericListView
            columns={columns}
            data={viecHangNgayList || []}
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
                    navigate(`${viecHangNgayConfig.routePath}/${row.id}`)
                }
            }}
            onAdd={() => {
                if (onAddNew) {
                    onAddNew()
                } else {
                    navigate(`${viecHangNgayConfig.routePath}/moi`)
                }
            }}
            addHref={`${viecHangNgayConfig.routePath}/moi`}
            onBack={() => {
                navigate(viecHangNgayConfig.parentPath)
            }}
            onDeleteSelected={async (selectedRows) => {
                const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                await batchDeleteMutation.mutateAsync(ids)
            }}
            batchDeleteConfig={{
                itemName: "việc hàng ngày",
                moduleName: viecHangNgayConfig.moduleTitle,
                isLoading: batchDeleteMutation.isPending,
                getItemLabel: (item: ViecHangNgay) => {
                    const employee = employees?.find(emp => emp.ma_nhan_vien === item.ma_nhan_vien)
                    return employee 
                        ? `${employee.ma_nhan_vien} - ${employee.ho_ten}`
                        : String(item.ma_nhan_vien)
                },
            }}
            filters={filters}
            searchFields={viecHangNgayConfig.searchFields as (keyof ViecHangNgay)[]}
            module={module}
            enableSuggestions={true}
            enableRangeSelection={true}
            enableLongPress={true}
            persistSelection={false}
            renderMobileCard={renderMobileCard}
            enableVirtualization={(viecHangNgayList?.length || 0) > 100}
            virtualRowHeight={60}
            exportOptions={{
                columns: columns,
                totalCount: viecHangNgayList?.length || 0,
                moduleName: viecHangNgayConfig.moduleTitle,
                getColumnTitle,
                getCellValue,
            }}
            onEdit={(row) => {
                if (onEdit) {
                    onEdit(row.id!)
                } else {
                    navigate(`${viecHangNgayConfig.routePath}/${row.id}/sua?returnTo=list`)
                }
            }}
            onDelete={(row) => {
                setRowToDelete(row)
                setDeleteDialogOpen(true)
            }}
            onImport={() => setImportDialogOpen(true)}
            isImporting={batchImportMutation.isPending}
        />

            {/* Import Dialog */}
            <ViecHangNgayImportDialog
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
                            Bạn có chắc chắn muốn xóa việc hàng ngày <strong>{rowToDelete?.ma_nhan_vien}</strong>? Hành động này không thể hoàn tác.
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

