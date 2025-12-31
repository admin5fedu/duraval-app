"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TaiLieuBieuMau } from "../schema"
import { useTaiLieuBieuMau, useBatchDeleteTaiLieuBieuMau } from "../hooks"
import { taiLieuBieuMauColumns } from "./tai-lieu-bieu-mau-columns"
import { taiLieuBieuMauConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { TaiLieuBieuMauImportDialog } from "./tai-lieu-bieu-mau-import-dialog"
import { useBatchUpsertTaiLieuBieuMau } from "../actions/tai-lieu-bieu-mau-excel-actions"
import { getHangMucBadgeColor } from "../constants/badge-colors"
import { useLoaiTaiLieu } from "@/features/cong-viec/tai-lieu/loai-tai-lieu/hooks"
import { useDanhMucTaiLieu } from "@/features/cong-viec/tai-lieu/danh-muc-tai-lieu/hooks"

interface TaiLieuBieuMauListViewProps {
    initialData?: TaiLieuBieuMau[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function TaiLieuBieuMauListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: TaiLieuBieuMauListViewProps = {}) {
    const { data: taiLieuBieuMauList, isLoading, isError, refetch } = useTaiLieuBieuMau(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteTaiLieuBieuMau()
    const batchImportMutation = useBatchUpsertTaiLieuBieuMau()
    const module = taiLieuBieuMauConfig.moduleName
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)

    // Create columns
    const columns = React.useMemo(() => {
        return taiLieuBieuMauColumns
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

    // Hide filter columns in table view
    const initialColumnVisibility = React.useMemo(() => ({
        loai_id: false,
        danh_muc_id: false,
    }), [])

    // Generate filter options from data
    const nguoiTaoOptions = React.useMemo(() => {
        if (!taiLieuBieuMauList) return []
        const unique = new Map<number, { id: number; name: string }>()
        
        taiLieuBieuMauList.forEach((item) => {
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
    }, [taiLieuBieuMauList])

    // Generate hang_muc filter options
    const hangMucOptions = React.useMemo(() => {
        return [
            { label: "Biểu mẫu & Kế hoạch", value: "Biểu mẫu & Kế hoạch" },
            { label: "Văn bản hệ thống", value: "Văn bản hệ thống" },
        ]
    }, [])

    // Generate trang_thai filter options from data
    const trangThaiOptions = React.useMemo(() => {
        if (!taiLieuBieuMauList) return []
        const unique = new Set<string>()
        
        taiLieuBieuMauList.forEach((item) => {
            if (item.trang_thai) {
                unique.add(item.trang_thai)
            }
        })
        
        return Array.from(unique)
            .map(value => ({
                label: value,
                value: value
            }))
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [taiLieuBieuMauList])

    // Load loai tài liệu và danh mục tài liệu for filters
    const { data: loaiTaiLieuList = [] } = useLoaiTaiLieu()
    const { data: danhMucTaiLieuList = [] } = useDanhMucTaiLieu()

    // Generate loai_id filter options from loai_tai_lieu data
    const loaiIdOptions = React.useMemo(() => {
        return loaiTaiLieuList
            .filter(item => item.id)
            .map(item => ({
                label: item.loai || `ID: ${item.id}`,
                value: item.id!.toString()
            }))
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [loaiTaiLieuList])

    // Generate danh_muc_id filter options from danh_muc_tai_lieu data
    const danhMucIdOptions = React.useMemo(() => {
        return danhMucTaiLieuList
            .filter(item => item.id && item.ten_danh_muc)
            .map(item => ({
                label: item.ten_danh_muc || `ID: ${item.id}`,
                value: item.id!.toString()
            }))
            .sort((a, b) => a.label.localeCompare(b.label))
    }, [danhMucTaiLieuList])

    // Build filters array
    const filters = React.useMemo(() => {
        return [
            {
                columnId: "hang_muc",
                title: "Hạng mục",
                options: hangMucOptions,
            },
            {
                columnId: "loai_id",
                title: "Loại tài liệu",
                options: loaiIdOptions,
            },
            {
                columnId: "danh_muc_id",
                title: "Danh mục",
                options: danhMucIdOptions,
            },
            {
                columnId: "trang_thai",
                title: "Trạng thái",
                options: trangThaiOptions,
            },
            {
                columnId: "nguoi_tao_id",
                title: "Người tạo",
                options: nguoiTaoOptions,
            },
        ]
    }, [hangMucOptions, loaiIdOptions, danhMucIdOptions, trangThaiOptions, nguoiTaoOptions])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: TaiLieuBieuMau) => {
        // Badge color mapping for hang_muc
        const badgeClass = getHangMucBadgeColor(row.hang_muc)

        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Mã / Tên tài liệu */}
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                        {row.ma_tai_lieu && (
                            <p className="text-sm text-muted-foreground">
                                {row.ma_tai_lieu}
                            </p>
                        )}
                        {row.ten_tai_lieu && (
                            <p className="text-sm text-foreground mt-1 font-medium">
                                {row.ten_tai_lieu}
                            </p>
                        )}
                        {!row.ten_tai_lieu && !row.ma_tai_lieu && (
                            <span className="font-semibold text-base text-foreground leading-tight">
                                ID: {row.id}
                            </span>
                        )}
                    </div>
                    {row.hang_muc && (
                        <Badge variant="outline" className={cn(badgeClass, "text-xs")}>
                            {row.hang_muc}
                        </Badge>
                    )}
                </div>
                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.trang_thai && (
                        <p className="leading-snug">
                            <Badge variant="outline" className="text-xs">
                                {row.trang_thai}
                            </Badge>
                        </p>
                    )}
                    {row.ghi_chu && (
                        <p className="leading-snug line-clamp-2">
                            {row.ghi_chu}
                        </p>
                    )}
                    {row.nguoi_tao_id && (
                        <p className="leading-snug">
                            Người tạo: {row.nguoi_tao_id}{row.nguoi_tao_ten ? ` - ${row.nguoi_tao_ten}` : ''}
                        </p>
                    )}
                    {row.tg_tao && (
                        <p className="leading-snug">
                            {format(new Date(row.tg_tao), "dd/MM/yyyy HH:mm", { locale: vi })}
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

    const getCellValue = React.useCallback((row: TaiLieuBieuMau, columnId: string) => {
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách tài liệu & biểu mẫu</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
        <GenericListView
            columns={columns}
            data={taiLieuBieuMauList || []}
            filterColumn="ten_tai_lieu"
            initialSorting={initialSorting}
            initialFilters={initialFilters}
            initialSearch={initialSearch}
            initialColumnVisibility={initialColumnVisibility}
            onFiltersChange={handleFiltersChange}
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
            onRowClick={(row) => {
                if (onView) {
                    onView(row.id!)
                } else {
                    navigate(`${taiLieuBieuMauConfig.routePath}/${row.id}`)
                }
            }}
            onAdd={() => {
                if (onAddNew) {
                    onAddNew()
                } else {
                    navigate(`${taiLieuBieuMauConfig.routePath}/moi`)
                }
            }}
            addHref={`${taiLieuBieuMauConfig.routePath}/moi`}
            onBack={() => {
                navigate(taiLieuBieuMauConfig.parentPath)
            }}
            onDeleteSelected={async (selectedRows) => {
                const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                await batchDeleteMutation.mutateAsync(ids)
            }}
            batchDeleteConfig={{
                itemName: "tài liệu & biểu mẫu",
                moduleName: taiLieuBieuMauConfig.moduleTitle,
                isLoading: batchDeleteMutation.isPending,
                getItemLabel: (item: TaiLieuBieuMau) => item.ten_tai_lieu || item.ma_tai_lieu || String(item.id),
            }}
            searchFields={taiLieuBieuMauConfig.searchFields as (keyof TaiLieuBieuMau)[]}
            module={module}
            enableSuggestions={true}
            enableRangeSelection={true}
            enableLongPress={true}
            persistSelection={false}
            renderMobileCard={renderMobileCard}
            enableVirtualization={(taiLieuBieuMauList?.length || 0) > 100}
            virtualRowHeight={60}
            exportOptions={{
                columns: columns,
                totalCount: taiLieuBieuMauList?.length || 0,
                moduleName: taiLieuBieuMauConfig.moduleTitle,
                getColumnTitle,
                getCellValue,
            }}
            onEdit={(row) => {
                if (onEdit) {
                    onEdit(row.id!)
                } else {
                    navigate(`${taiLieuBieuMauConfig.routePath}/${row.id}/sua`)
                }
            }}
            onImport={() => setImportDialogOpen(true)}
            isImporting={batchImportMutation.isPending}
            filters={filters}
        />
        <TaiLieuBieuMauImportDialog
            open={importDialogOpen}
            onOpenChange={setImportDialogOpen}
            mutation={batchImportMutation}
        />
        </>
    )
}

