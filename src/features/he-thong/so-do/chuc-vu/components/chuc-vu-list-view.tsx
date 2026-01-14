"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { ChucVu } from "../schema"
import { useChucVu, useBatchDeleteChucVu, useDeleteChucVu } from "../hooks"
import { chucVuColumns } from "./chuc-vu-columns"
import { chucVuConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertChucVu } from "../actions/chuc-vu-excel-actions"
import { ChucVuImportDialog } from "./chuc-vu-import-dialog"
import { usePhongBan } from "../../phong-ban/hooks"
import { useCapBac } from "../../cap-bac/hooks"
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

interface ChucVuListViewProps {
    initialData?: ChucVu[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function ChucVuListView({
    initialData,
    onEdit,
    onAddNew,
    onView,
}: ChucVuListViewProps = {}) {
    const { data: chucVuList, isLoading, isError, refetch } = useChucVu(initialData)
    const { data: phongBanList } = usePhongBan() // Fetch phong ban list for mapping
    const { data: capBacList } = useCapBac() // Fetch cap bac list for mapping
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteChucVu()
    const deleteMutation = useDeleteChucVu()
    const batchImportMutation = useBatchUpsertChucVu()
    const module = chucVuConfig.moduleName
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<ChucVu | null>(null)
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)

    // Create columns
    const columns = React.useMemo(() => {
        return chucVuColumns()
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

    // Generate filter options for phòng ban từ data với mapping tên phòng ban
    const phongBanOptions = React.useMemo(() => {
        if (!chucVuList || !phongBanList) return []
        // Lấy danh sách các mã phòng ban unique từ chức vụ
        const uniqueMaPhongBan = Array.from(
            new Set(
                chucVuList
                    .map((cv) => cv.ma_phong_ban)
                    .filter((pb): pb is string => !!pb)
            )
        )

        // Map với phong ban list để lấy tên
        return uniqueMaPhongBan
            .map((maPb) => {
                const phongBan = phongBanList.find((pb) => pb.ma_phong_ban === maPb)
                if (phongBan) {
                    return {
                        label: `${phongBan.ma_phong_ban} - ${phongBan.ten_phong_ban}`,
                        value: maPb,
                    }
                }
                return {
                    label: maPb,
                    value: maPb,
                }
            })
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [chucVuList, phongBanList])

    // Generate filter options for cấp bậc từ data với mapping tên và bậc
    const capBacOptions = React.useMemo(() => {
        if (!chucVuList || !capBacList) return []
        // Lấy danh sách các số cấp bậc unique từ chức vụ
        const uniqueCapBac = Array.from(
            new Set(
                chucVuList
                    .map((cv) => cv.cap_bac)
                    .filter((cb): cb is number => cb !== null && cb !== undefined)
            )
        )

        // Map với cap bac list để lấy tên
        return uniqueCapBac
            .map((cbValue) => {
                const capBac = capBacList.find((cb) => cb.cap_bac === cbValue)
                if (capBac) {
                    return {
                        label: `Cấp ${capBac.cap_bac} - ${capBac.ten_cap_bac}`,
                        value: String(cbValue),
                    }
                }
                return {
                    label: `Cấp ${cbValue}`,
                    value: String(cbValue),
                }
            })
            .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }))
    }, [chucVuList, capBacList])

    // Generate filter options for ngạch lương từ data
    const ngachLuongOptions = React.useMemo(() => {
        if (!chucVuList) return []
        // Lấy danh sách các ngạch lương unique và sắp xếp
        const uniqueNgachLuong = Array.from(
            new Set(
                chucVuList
                    .map((cv) => cv.ngach_luong)
                    .filter((nl): nl is string => !!nl)
            )
        ).sort((a, b) => a.localeCompare(b))

        return uniqueNgachLuong.map((nl) => ({
            label: nl,
            value: nl,
        }))
    }, [chucVuList])

    // Generate filter options for mức đóng bảo hiểm từ data
    const mucDongBaoHiemOptions = React.useMemo(() => {
        if (!chucVuList) return []
        // Lấy danh sách các mức đóng bảo hiểm unique và sắp xếp
        const uniqueMucDong = Array.from(
            new Set(
                chucVuList
                    .map((cv) => cv.muc_dong_bao_hiem)
                    .filter((md): md is number => md !== null && md !== undefined)
            )
        ).sort((a, b) => a - b)

        return uniqueMucDong.map((md) => ({
            label: md.toLocaleString("vi-VN"),
            value: String(md),
        }))
    }, [chucVuList])

    // Generate filter options for số ngày nghỉ T7 từ data
    const soNgayNghiThu7Options = React.useMemo(() => {
        if (!chucVuList) return []
        // Lấy danh sách các số ngày nghỉ T7 unique và sắp xếp
        const uniqueSoNgay = Array.from(
            new Set(
                chucVuList
                    .map((cv) => cv.so_ngay_nghi_thu_7)
                    .filter((sn): sn is string => !!sn)
            )
        ).sort((a, b) => a.localeCompare(b))

        return uniqueSoNgay.map((sn) => ({
            label: sn,
            value: sn,
        }))
    }, [chucVuList])

    // Build filters array from config and dynamic options
    const filters = React.useMemo(() => {
        const filterConfigs = chucVuConfig.filterColumns || []
        return filterConfigs.map((filterConfig) => {
            if (filterConfig.columnId === "ma_phong_ban") {
                return {
                    ...filterConfig,
                    options: phongBanOptions,
                }
            }
            if (filterConfig.columnId === "cap_bac") {
                return {
                    ...filterConfig,
                    options: capBacOptions,
                }
            }
            if (filterConfig.columnId === "ngach_luong") {
                return {
                    ...filterConfig,
                    options: ngachLuongOptions,
                }
            }
            if (filterConfig.columnId === "muc_dong_bao_hiem") {
                return {
                    ...filterConfig,
                    options: mucDongBaoHiemOptions,
                }
            }
            if (filterConfig.columnId === "so_ngay_nghi_thu_7") {
                return {
                    ...filterConfig,
                    options: soNgayNghiThu7Options,
                }
            }
            return filterConfig
        })
    }, [phongBanOptions, capBacOptions, ngachLuongOptions, mucDongBaoHiemOptions, soNgayNghiThu7Options])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: ChucVu) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base text-foreground leading-tight truncate block">
                                {row.ten_chuc_vu}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.ma_chuc_vu && (
                        <p className="leading-snug">
                            Mã: <span className="font-medium text-foreground">{row.ma_chuc_vu}</span>
                        </p>
                    )}
                    {row.cap_bac !== null && row.cap_bac !== undefined && (
                        <p className="leading-snug">
                            Cấp bậc: <span className="font-medium text-foreground">{row.cap_bac}</span>
                        </p>
                    )}
                    {row.ma_phong_ban && (
                        <p className="leading-snug">
                            Mã phòng ban: <span className="font-medium text-foreground">{row.ma_phong_ban}</span>
                        </p>
                    )}
                    {row.ngach_luong && (
                        <p className="leading-snug">
                            Ngạch lương: <span className="font-medium text-foreground">{row.ngach_luong}</span>
                        </p>
                    )}
                    {row.muc_dong_bao_hiem !== null && row.muc_dong_bao_hiem !== undefined && (
                        <p className="leading-snug">
                            Mức đóng BH: <span className="font-medium text-foreground">{row.muc_dong_bao_hiem.toLocaleString("vi-VN")}</span>
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

    const getCellValue = React.useCallback((row: ChucVu, columnId: string) => {
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách chức vụ</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
            <GenericListView
                columns={columns}
                data={chucVuList || []}
                filterColumn="ma_chuc_vu"
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
                        navigate(`${chucVuConfig.routePath}/${row.id}`)
                    }
                }}
                onAdd={() => {
                    if (onAddNew) {
                        onAddNew()
                    } else {
                        navigate(`${chucVuConfig.routePath}/moi`)
                    }
                }}
                addHref={`${chucVuConfig.routePath}/moi`}
                onBack={() => {
                    navigate(chucVuConfig.parentPath)
                }}
                onDeleteSelected={async (selectedRows) => {
                    const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                    await batchDeleteMutation.mutateAsync(ids)
                }}
                batchDeleteConfig={{
                    itemName: "chức vụ",
                    moduleName: chucVuConfig.moduleTitle,
                    isLoading: batchDeleteMutation.isPending,
                    getItemLabel: (item: ChucVu) => item.ten_chuc_vu || String(item.id),
                }}
                filters={filters}
                searchFields={chucVuConfig.searchFields as (keyof ChucVu)[]}
                module={module}
                enableSuggestions={true}
                enableRangeSelection={true}
                enableLongPress={true}
                persistSelection={false}
                renderMobileCard={renderMobileCard}
                enableVirtualization={(chucVuList?.length || 0) > 100}
                virtualRowHeight={60}
                exportOptions={{
                    columns: columns,
                    totalCount: chucVuList?.length || 0,
                    moduleName: chucVuConfig.moduleTitle,
                    getColumnTitle,
                    getCellValue,
                }}
                onImport={() => setImportDialogOpen(true)}
                isImporting={batchImportMutation.isPending}
                onEdit={(row) => {
                    if (onEdit) {
                        onEdit(row.id!)
                    } else {
                        navigate(`${chucVuConfig.routePath}/${row.id}/sua`)
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
                            Bạn có chắc chắn muốn xóa chức vụ <strong>{rowToDelete?.ten_chuc_vu}</strong>? Hành động này không thể hoàn tác.
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
            <ChucVuImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />
        </>
    )
}
