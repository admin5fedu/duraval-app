"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { NhomApDoanhSo } from "../schema"
import { useNhomApDoanhSo, useBatchDeleteNhomApDoanhSo } from "../hooks"
import { nhomApDoanhSoColumns } from "./nhom-ap-doanh-so-columns"
import { nhomApDoanhSoConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertNhomApDoanhSo } from "../actions/nhom-ap-doanh-so-excel-actions"
import { NhomApDoanhSoImportDialog } from "./nhom-ap-doanh-so-import-dialog"
import { useNhanSu } from "../../../nhan-su/danh-sach-nhan-su/hooks"

interface NhomApDoanhSoListViewProps {
    initialData?: NhomApDoanhSo[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function NhomApDoanhSoListView({ 
    initialData,
    onAddNew,
    onView,
}: NhomApDoanhSoListViewProps = {}) {
    const { data: nhomApDoanhSoList, isLoading, isError, refetch } = useNhomApDoanhSo(initialData)
    const { data: nhanSuList } = useNhanSu() // Fetch nhan su list for mapping nguoi_tao_id
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteNhomApDoanhSo()
    const batchImportMutation = useBatchUpsertNhomApDoanhSo()
    const module = nhomApDoanhSoConfig.moduleName
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)

    // Create columns with nhanSuList for mapping nguoi_tao_id
    const columns = React.useMemo(() => {
        return nhomApDoanhSoColumns(nhanSuList || [])
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

    // Export utilities
    const getColumnTitle = React.useCallback((columnId: string) => {
        const column = columns.find((col) => {
            const id = (col as any).id
            const accessorKey = (col as any).accessorKey
            return id === columnId || accessorKey === columnId
        })
        return (column?.meta as any)?.title || columnId
    }, [columns])

    const getCellValue = React.useCallback((row: NhomApDoanhSo, columnId: string) => {
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
        return (row as any)[columnId] ?? ""
    }, [nhanSuList])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: NhomApDoanhSo) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base text-foreground leading-tight truncate block">
                                {row.ten_nhom_ap || "Chưa có tên"}
                            </span>
                            {row.ma_nhom_ap && (
                                <span className="text-xs text-muted-foreground block mt-1">
                                    Mã: {row.ma_nhom_ap}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách nhóm áp doanh số</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
        <GenericListView
            columns={columns}
            data={nhomApDoanhSoList || []}
            filterColumn="ma_nhom_ap"
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
                    navigate(`${nhomApDoanhSoConfig.routePath}/${row.id}`)
                }
            }}
            onAdd={() => {
                if (onAddNew) {
                    onAddNew()
                } else {
                    navigate(`${nhomApDoanhSoConfig.routePath}/moi`)
                }
            }}
            addHref={`${nhomApDoanhSoConfig.routePath}/moi`}
            onBack={() => {
                navigate(nhomApDoanhSoConfig.parentPath)
            }}
            onDeleteSelected={async (selectedRows) => {
                const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                await batchDeleteMutation.mutateAsync(ids)
            }}
            batchDeleteConfig={{
                itemName: "nhóm áp doanh số",
                moduleName: nhomApDoanhSoConfig.moduleTitle,
                isLoading: batchDeleteMutation.isPending,
                getItemLabel: (item: NhomApDoanhSo) => item.ten_nhom_ap || String(item.id),
            }}
            filters={[]}
            searchFields={nhomApDoanhSoConfig.searchFields as (keyof NhomApDoanhSo)[]}
            module={module}
            enableSuggestions={true}
            enableRangeSelection={true}
            enableLongPress={true}
            persistSelection={false}
            renderMobileCard={renderMobileCard}
            enableVirtualization={(nhomApDoanhSoList?.length || 0) > 100}
            exportOptions={{
                columns: columns,
                totalCount: nhomApDoanhSoList?.length || 0,
                moduleName: nhomApDoanhSoConfig.moduleTitle,
                getColumnTitle,
                getCellValue,
            }}
            onImport={() => setImportDialogOpen(true)}
            isImporting={batchImportMutation.isPending}
        />
            {/* Import Dialog */}
            <NhomApDoanhSoImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />
        </>
    )
}

