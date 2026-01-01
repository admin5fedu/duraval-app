"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { DangKyDoanhSo } from "../schema"
import { useDangKyDoanhSo, useBatchDeleteDangKyDoanhSo } from "../hooks"
import { dangKyDoanhSoColumns } from "./dang-ky-doanh-so-columns"
import { dangKyDoanhSoConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useNhanSu } from "../../../nhan-su/danh-sach-nhan-su/hooks"
import { useBatchUpsertDangKyDoanhSo } from "../actions/dang-ky-doanh-so-excel-actions"
import { DangKyDoanhSoImportDialog } from "./dang-ky-doanh-so-import-dialog"

interface DangKyDoanhSoListViewProps {
    initialData?: DangKyDoanhSo[]
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function DangKyDoanhSoListView({ 
    initialData,
    onAddNew,
    onView,
}: DangKyDoanhSoListViewProps = {}) {
    const { data: dangKyDoanhSoList, isLoading, isError, refetch } = useDangKyDoanhSo(initialData)
    const { data: nhanSuList } = useNhanSu() // Fetch nhan su list for mapping nguoi_tao_id
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteDangKyDoanhSo()
    const batchImportMutation = useBatchUpsertDangKyDoanhSo()
    const module = dangKyDoanhSoConfig.moduleName
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)

    // Create columns with nhanSuList for mapping nguoi_tao_id
    const columns = React.useMemo(() => {
        return dangKyDoanhSoColumns(nhanSuList || [])
    }, [nhanSuList])

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
    const namOptions = React.useMemo(() => {
        const unique = Array.from(
            new Set(dangKyDoanhSoList?.map((e) => e.nam).filter((d): d is number => d !== null && d !== undefined) || [])
        ).sort((a, b) => b - a) // Sort descending (newest first)
        return unique.map((d) => ({ label: String(d), value: String(d) }))
    }, [dangKyDoanhSoList])

    const thangOptions = React.useMemo(() => {
        const unique = Array.from(
            new Set(dangKyDoanhSoList?.map((e) => e.thang).filter((d): d is number => d !== null && d !== undefined) || [])
        ).sort((a, b) => a - b) // Sort ascending (1-12)
        return unique.map((d) => ({ label: String(d), value: String(d) }))
    }, [dangKyDoanhSoList])

    const bacDtOptions = React.useMemo(() => {
        const unique = Array.from(
            new Set(dangKyDoanhSoList?.map((e) => e.bac_dt).filter((d): d is string => !!d) || [])
        ).sort() // Sort alphabetically
        return unique.map((d) => ({ label: d, value: d }))
    }, [dangKyDoanhSoList])

    const nhomApDoanhThuOptions = React.useMemo(() => {
        const unique = Array.from(
            new Set(dangKyDoanhSoList?.map((e) => e.ten_nhom_ap_doanh_thu).filter((d): d is string => !!d) || [])
        ).sort() // Sort alphabetically
        return unique.map((d) => ({ label: d, value: d }))
    }, [dangKyDoanhSoList])

    const phongOptions = React.useMemo(() => {
        const unique = Array.from(
            new Set(dangKyDoanhSoList?.map((e) => e.ma_phong).filter((d): d is string => !!d) || [])
        ).sort() // Sort alphabetically
        return unique.map((d) => ({ label: d, value: d }))
    }, [dangKyDoanhSoList])

    const nhomOptions = React.useMemo(() => {
        const unique = Array.from(
            new Set(dangKyDoanhSoList?.map((e) => e.ma_nhom).filter((d): d is string => !!d) || [])
        ).sort() // Sort alphabetically
        return unique.map((d) => ({ label: d, value: d }))
    }, [dangKyDoanhSoList])

    // Export utilities
    const getColumnTitle = React.useCallback((columnId: string) => {
        const column = columns.find((col) => {
            const id = (col as any).id
            const accessorKey = (col as any).accessorKey
            return id === columnId || accessorKey === columnId
        })
        return (column?.meta as any)?.title || columnId
    }, [columns])

    const getCellValue = React.useCallback((row: DangKyDoanhSo, columnId: string) => {
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
            const value = (row as any)[columnId]
            if (!value) return ""
            return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
        }
        if (columnId === "nguoi_tao_id") {
            const nguoiTaoId = (row as any)[columnId] as number | null | undefined
            if (!nguoiTaoId) return ""
            const nguoiTao = nhanSuList?.find((ns) => ns.ma_nhan_vien === nguoiTaoId)
            return nguoiTao ? `${nguoiTao.ma_nhan_vien} - ${nguoiTao.ho_ten}` : String(nguoiTaoId)
        }
        if (columnId === "doanh_thu") {
            const value = (row as any)[columnId] as number | null | undefined
            return value ? value.toLocaleString("vi-VN") : ""
        }
        return (row as any)[columnId] ?? ""
    }, [nhanSuList])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: DangKyDoanhSo) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base text-foreground leading-tight truncate block">
                                {row.ten_nhan_vien || "Chưa có tên"}
                            </span>
                            {(row.nam || row.thang) && (
                                <span className="text-xs text-muted-foreground block mt-1">
                                    {row.nam && row.thang ? `${row.thang}/${row.nam}` : row.nam ? `Năm: ${row.nam}` : `Tháng: ${row.thang}`}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                {(row.ten_nhom_ap_doanh_thu || row.doanh_thu) && (
                    <div className="space-y-1 text-xs text-muted-foreground">
                        {row.ten_nhom_ap_doanh_thu && (
                            <p className="leading-snug">
                                Nhóm: {row.ten_nhom_ap_doanh_thu}
                            </p>
                        )}
                        {row.doanh_thu !== null && row.doanh_thu !== undefined && (
                            <p className="leading-snug">
                                Doanh thu: {row.doanh_thu.toLocaleString("vi-VN")}
                            </p>
                        )}
                    </div>
                )}
                {row.mo_ta && (
                    <div className="space-y-1 text-xs text-muted-foreground">
                        <p className="leading-snug">
                            {row.mo_ta}
                        </p>
                    </div>
                )}
            </div>
        )
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách đăng ký doanh số</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
        <GenericListView
            columns={columns}
            data={dangKyDoanhSoList || []}
            filterColumn="ten_nhan_vien"
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
                    navigate(`${dangKyDoanhSoConfig.routePath}/${row.id}`)
                }
            }}
            onAdd={() => {
                if (onAddNew) {
                    onAddNew()
                } else {
                    navigate(`${dangKyDoanhSoConfig.routePath}/moi`)
                }
            }}
            addHref={`${dangKyDoanhSoConfig.routePath}/moi`}
            onBack={() => {
                navigate(dangKyDoanhSoConfig.parentPath)
            }}
            onDeleteSelected={async (selectedRows) => {
                const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                await batchDeleteMutation.mutateAsync(ids)
            }}
            batchDeleteConfig={{
                itemName: "đăng ký doanh số",
                moduleName: dangKyDoanhSoConfig.moduleTitle,
                isLoading: batchDeleteMutation.isPending,
                getItemLabel: (item: DangKyDoanhSo) => item.ten_nhan_vien || String(item.id),
            }}
            filters={[
                {
                    columnId: "nam",
                    title: "Năm",
                    options: namOptions,
                },
                {
                    columnId: "thang",
                    title: "Tháng",
                    options: thangOptions,
                },
                {
                    columnId: "ma_phong",
                    title: "Phòng",
                    options: phongOptions,
                },
                {
                    columnId: "ma_nhom",
                    title: "Nhóm",
                    options: nhomOptions,
                },
                {
                    columnId: "bac_dt",
                    title: "Bậc DT",
                    options: bacDtOptions,
                },
                {
                    columnId: "ten_nhom_ap_doanh_thu",
                    title: "Nhóm Áp Doanh Thu",
                    options: nhomApDoanhThuOptions,
                },
            ]}
            searchFields={dangKyDoanhSoConfig.searchFields as (keyof DangKyDoanhSo)[]}
            module={module}
            enableSuggestions={true}
            enableRangeSelection={true}
            enableLongPress={true}
            persistSelection={false}
            renderMobileCard={renderMobileCard}
            enableVirtualization={(dangKyDoanhSoList?.length || 0) > 100}
            exportOptions={{
                columns: columns,
                totalCount: dangKyDoanhSoList?.length || 0,
                moduleName: dangKyDoanhSoConfig.moduleTitle,
                getColumnTitle,
                getCellValue,
            }}
            onImport={() => setImportDialogOpen(true)}
            isImporting={batchImportMutation.isPending}
        />
            {/* Import Dialog */}
            <DangKyDoanhSoImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />
        </>
    )
}

