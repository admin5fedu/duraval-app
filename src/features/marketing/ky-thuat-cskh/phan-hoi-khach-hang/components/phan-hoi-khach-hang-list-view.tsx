"use client"

import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { PhanHoiKhachHang } from "../schema"
import { usePhanHoiKhachHang, useBatchDeletePhanHoiKhachHang, useDeletePhanHoiKhachHang } from "../hooks"
import { phanHoiKhachHangColumns } from "./phan-hoi-khach-hang-columns"
import { phanHoiKhachHangConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { phanHoiKhachHangQueryKeys } from "@/lib/react-query/query-keys"
import { PhanHoiKhachHangAPI } from "../services/phan-hoi-khach-hang.api"
import { PhanHoiKhachHangImportDialog } from "./phan-hoi-khach-hang-import-dialog"
import { useBatchUpsertPhanHoiKhachHang } from "../actions/phan-hoi-khach-hang-excel-actions"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
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

interface PhanHoiKhachHangListViewProps {
    initialData?: PhanHoiKhachHang[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function PhanHoiKhachHangListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: PhanHoiKhachHangListViewProps = {}) {
    const { data: phanHoiList, isLoading, isError, refetch } = usePhanHoiKhachHang(initialData)
    const navigate = useNavigate()
    const location = useLocation()
    const batchDeleteMutation = useBatchDeletePhanHoiKhachHang()
    const deleteMutation = useDeletePhanHoiKhachHang()
    const batchImportMutation = useBatchUpsertPhanHoiKhachHang()
    const module = phanHoiKhachHangConfig.moduleName
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<PhanHoiKhachHang | null>(null)
    
    // Refetch khi navigate về từ form page (sử dụng location.state hoặc pathname change)
    const prevPathnameRef = React.useRef<string | null>(null)
    React.useEffect(() => {
        const currentPath = location.pathname
        const isListPage = currentPath === phanHoiKhachHangConfig.routePath
        
        // Nếu đang ở list page và pathname thay đổi từ form/detail page, refetch
        if (isListPage && prevPathnameRef.current && prevPathnameRef.current !== currentPath) {
            const wasFormPage = prevPathnameRef.current.includes('/moi') || 
                               prevPathnameRef.current.includes('/sua') ||
                               prevPathnameRef.current.match(/\/\d+$/) // detail page
            
            if (wasFormPage) {
                // Refetch để cập nhật danh sách mới nhất
                refetch()
            }
        }
        
        prevPathnameRef.current = currentPath
    }, [location.pathname, refetch])
    
    // Refetch sau khi delete mutation thành công
    React.useEffect(() => {
        if (deleteMutation.isSuccess) {
            refetch()
            // Reset mutation state
            deleteMutation.reset()
        }
    }, [deleteMutation.isSuccess, refetch, deleteMutation])
    
    // Refetch sau khi batch delete mutation thành công
    React.useEffect(() => {
        if (batchDeleteMutation.isSuccess) {
            refetch()
            // Reset mutation state
            batchDeleteMutation.reset()
        }
    }, [batchDeleteMutation.isSuccess, refetch, batchDeleteMutation])
    
    // Refetch sau khi import mutation thành công
    React.useEffect(() => {
        if (batchImportMutation.isSuccess) {
            refetch()
            // Reset mutation state
            batchImportMutation.reset()
        }
    }, [batchImportMutation.isSuccess, refetch, batchImportMutation])

    // Create columns
    const columns = React.useMemo(() => {
        return phanHoiKhachHangColumns
    }, [])

    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, phanHoiKhachHangConfig.defaultSorting || [])

    // Fetch unique values for filters
    const { data: nhanVienList } = useQuery({
        queryKey: [...phanHoiKhachHangQueryKeys.all(), "nhan-vien-filter"],
        queryFn: () => PhanHoiKhachHangAPI.getUniqueNhanVienIds(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    const { data: nguoiTaoList } = useQuery({
        queryKey: [...phanHoiKhachHangQueryKeys.all(), "nguoi-tao-filter"],
        queryFn: () => PhanHoiKhachHangAPI.getUniqueNguoiTaoIds(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    const { data: ngayList } = useQuery({
        queryKey: [...phanHoiKhachHangQueryKeys.all(), "ngay-filter"],
        queryFn: () => PhanHoiKhachHangAPI.getUniqueNgay(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    const { data: ktPhuTrachList } = useQuery({
        queryKey: [...phanHoiKhachHangQueryKeys.all(), "kt-phu-trach-filter"],
        queryFn: () => PhanHoiKhachHangAPI.getUniqueKtPhuTrach(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    const { data: trangThaiDonHoanList } = useQuery({
        queryKey: [...phanHoiKhachHangQueryKeys.all(), "trang-thai-don-hoan-filter"],
        queryFn: () => PhanHoiKhachHangAPI.getUniqueTrangThaiDonHoan(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    const { data: phongList } = useQuery({
        queryKey: [...phanHoiKhachHangQueryKeys.all(), "phong-filter"],
        queryFn: () => PhanHoiKhachHangAPI.getUniquePhongIds(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })

    // Build filters array from config with dynamic options
    const filters = React.useMemo(() => {
        const baseFilters = (phanHoiKhachHangConfig.filterColumns || []).map((filterConfig) => {
            let options = filterConfig.options || []
            
            // Populate ngay filter with dynamic options
            if (filterConfig.columnId === "ngay" && ngayList) {
                options = ngayList.map((ngay) => ({
                    label: ngay,
                    value: ngay,
                }))
            }
            
            // Populate nguoi_tao_id filter with dynamic options
            if (filterConfig.columnId === "nguoi_tao_id" && nguoiTaoList) {
                options = nguoiTaoList
                    .filter((item) => item.id != null)
                    .map((item) => {
                        const maNhanVien = item.ma_nhan_vien || item.id
                        const label = item.ten && item.ten !== `ID: ${item.id}` 
                            ? `${maNhanVien} - ${item.ten}` 
                            : String(maNhanVien)
                        return {
                            label,
                            value: String(item.id),
                        }
                    })
            }
            
            // Populate kt_phu_trach filter with dynamic options
            if (filterConfig.columnId === "kt_phu_trach" && ktPhuTrachList) {
                options = ktPhuTrachList.map((value) => ({
                    label: value,
                    value: value,
                }))
            }
            
            // Populate trang_thai_don_hoan filter with dynamic options
            if (filterConfig.columnId === "trang_thai_don_hoan" && trangThaiDonHoanList) {
                options = trangThaiDonHoanList.map((value) => ({
                    label: value,
                    value: value,
                }))
            }
            
            return {
                columnId: filterConfig.columnId,
                title: filterConfig.title,
                options,
            }
        })

        // Add additional filters
        const additionalFilters: any[] = []
        
        // Add nhan_vien_id filter
        if (nhanVienList && nhanVienList.length > 0) {
            additionalFilters.push({
                columnId: "nhan_vien_id",
                title: "Nhân Viên",
                options: nhanVienList
                    .filter((item) => item.id != null)
                    .map((item) => {
                        const maNhanVien = item.ma_nhan_vien || item.id
                        const label = item.ten && item.ten !== `ID: ${item.id}` 
                            ? `${maNhanVien} - ${item.ten}` 
                            : String(maNhanVien)
                        return {
                            label,
                            value: String(item.id),
                        }
                    }),
            })
        }
        
        // Add phong_id filter
        if (phongList && phongList.length > 0) {
            additionalFilters.push({
                columnId: "phong_id",
                title: "Phòng",
                options: phongList
                    .filter((item) => item.id != null)
                    .map((item) => ({
                        label: item.ten || `ID: ${item.id}`,
                        value: String(item.id),
                    })),
            })
        }
        
        return [...baseFilters, ...additionalFilters]
    }, [nhanVienList, nguoiTaoList, ngayList, ktPhuTrachList, trangThaiDonHoanList, phongList])

    // Handle delete selected
    const handleDeleteSelected = async (selectedRows: PhanHoiKhachHang[]) => {
        const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
        if (ids.length > 0) {
            await batchDeleteMutation.mutateAsync(ids)
            // Refetch để cập nhật danh sách ngay lập tức
            await refetch()
        }
    }

    // Export utilities
    const getColumnTitle = React.useCallback((columnId: string) => {
        const column = columns.find((col) => {
            const id = (col as any).id
            const accessorKey = (col as any).accessorKey
            return id === columnId || accessorKey === columnId
        })
        return (column?.meta as any)?.title || columnId
    }, [columns])

    const getCellValue = React.useCallback((row: PhanHoiKhachHang, columnId: string) => {
        // Skip select and actions columns
        if (columnId === "select" || columnId === "actions") {
            return ""
        }
        
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
            const value = (row as any)[columnId]
            if (!value) return ""
            try {
                return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
                return value
            }
        }
        if (columnId === "ngay" || columnId === "ngay_ban" || columnId === "han_xu_ly" || columnId === "ngay_hoan_thanh") {
            const value = (row as any)[columnId]
            if (!value) return ""
            try {
                return format(new Date(value), "dd/MM/yyyy", { locale: vi })
            } catch {
                return value
            }
        }
        if (columnId === "nhan_vien_id") {
            const nhanVien = row.nhan_vien
            if (!nhanVien) return ""
            return `${nhanVien.ma_nhan_vien} - ${nhanVien.ho_ten}`
        }
        if (columnId === "nguoi_tao_id") {
            const nguoiTao = row.nguoi_tao
            if (!nguoiTao) return ""
            return `${nguoiTao.ma_nhan_vien} - ${nguoiTao.ho_ten}`
        }
        if (columnId === "phong_id") {
            const phongBan = row.phong_ban
            if (!phongBan) return row.phong_id ? String(row.phong_id) : ""
            return `${phongBan.ma_phong_ban} - ${phongBan.ten_phong_ban}`
        }
        if (columnId === "kt_phu_trach") {
            const ktPhuTrachNhanVien = (row as any).kt_phu_trach_nhan_vien
            if (ktPhuTrachNhanVien) {
                return `${ktPhuTrachNhanVien.ma_nhan_vien} - ${ktPhuTrachNhanVien.ho_ten}`
            }
            return row.kt_phu_trach || ""
        }
        if (columnId === "id") {
            return row.id?.toString() || ""
        }
        if (columnId === "hinh_anh") {
            const hinhAnh = (row as any)[columnId]
            if (!hinhAnh || !Array.isArray(hinhAnh)) return ""
            return hinhAnh.join(", ")
        }
        return (row as any)[columnId] ?? ""
    }, [])

    // Mobile card rendering
    const renderMobileCard = React.useCallback((row: PhanHoiKhachHang) => {
        return (
            <div className="p-4 border-b space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">
                            {row.ten_nhan_vien || `ID: ${row.id}`}
                        </h3>
                        {row.ten_san_pham && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                                {row.ten_san_pham}
                            </p>
                        )}
                    </div>
                    {row.trang_thai && (
                        <Badge variant="outline" className="shrink-0">
                            {row.trang_thai}
                        </Badge>
                    )}
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.id_don_hang && (
                        <p className="leading-snug">
                            ID Đơn Hàng: <span className="font-medium text-foreground">{row.id_don_hang}</span>
                        </p>
                    )}
                    {row.sdt_khach && (
                        <p className="leading-snug">
                            SĐT: <span className="font-medium text-foreground">{row.sdt_khach}</span>
                        </p>
                    )}
                    {row.ngay_ban && (
                        <p className="leading-snug">
                            Ngày Bán: <span className="font-medium text-foreground">
                                {format(new Date(row.ngay_ban), "dd/MM/yyyy", { locale: vi })}
                            </span>
                        </p>
                    )}
                    {row.loai_loi && (
                        <p className="leading-snug">
                            Loại: <span className="font-medium text-foreground">{row.loai_loi}</span>
                        </p>
                    )}
                </div>
            </div>
        )
    }, [])

    if (isLoading) {
        return (
            <div className="space-y-4 p-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="p-6">
                <div className="text-center text-destructive">
                    <p>Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</p>
                    <Button onClick={() => refetch()} className="mt-4">
                        Thử lại
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <>
            <GenericListView<PhanHoiKhachHang>
                module={module}
                columns={columns}
                data={phanHoiList || []}
                filters={filters}
                searchFields={phanHoiKhachHangConfig.searchFields as (keyof PhanHoiKhachHang)[]}
                initialFilters={initialFilters}
                initialSearch={initialSearch}
                initialSorting={initialSorting}
                onFiltersChange={handleFiltersChange}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                onAdd={() => {
                    if (onAddNew) {
                        onAddNew()
                    } else {
                        navigate(`${phanHoiKhachHangConfig.routePath}/moi`)
                    }
                }}
                addHref={`${phanHoiKhachHangConfig.routePath}/moi`}
                onEdit={(row) => {
                    if (onEdit) {
                        onEdit(row.id!)
                    } else {
                        navigate(`${phanHoiKhachHangConfig.routePath}/${row.id}/sua`)
                    }
                }}
                onDelete={(row) => {
                    setRowToDelete(row)
                    setDeleteDialogOpen(true)
                }}
                onRowClick={(row) => {
                    if (onView) {
                        onView(row.id!)
                    } else {
                        navigate(`${phanHoiKhachHangConfig.routePath}/${row.id}`)
                    }
                }}
                onDeleteSelected={handleDeleteSelected}
                onImport={() => setImportDialogOpen(true)}
                isImporting={batchImportMutation.isPending}
                batchDeleteConfig={{
                    itemName: "phản hồi khách hàng",
                    moduleName: phanHoiKhachHangConfig.moduleTitle,
                    isLoading: batchDeleteMutation.isPending,
                    getItemLabel: (item: PhanHoiKhachHang) => item.ten_san_pham || `ID: ${item.id}`,
                }}
                enableSuggestions={true}
                enableRangeSelection={true}
                enableLongPress={true}
                persistSelection={false}
                renderMobileCard={renderMobileCard}
                enableVirtualization={(phanHoiList?.length || 0) > 100}
                virtualRowHeight={60}
                initialColumnVisibility={{
                    loai_loi: false,
                    ten_loi: false,
                    mo_ta_loi: false,
                    ma_san_pham: false,
                    phong_id: false,
                    nhom_id: false,
                    ngay_ban: false,
                    yeu_cau_khach_hang: false,
                    nguoi_tao_id: false,
                    tg_tao: false,
                    muc_do: false,
                }}
                exportOptions={{
                    columns: columns,
                    totalCount: phanHoiList?.length || 0,
                    moduleName: phanHoiKhachHangConfig.moduleTitle,
                    getColumnTitle,
                    getCellValue,
                }}
            />
            
            {/* Delete confirmation dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa phản hồi khách hàng <strong>{rowToDelete?.ten_san_pham || `ID: ${rowToDelete?.id}`}</strong>? Hành động này không thể hoàn tác.
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
                                        // Refetch để cập nhật danh sách ngay lập tức
                                        await refetch()
                                    } catch (error) {
                                        // Error handled by mutation
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
            <PhanHoiKhachHangImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />
        </>
    )
}

