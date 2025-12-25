"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ZoomableAvatar } from "@/components/ui/zoomable-avatar"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { NhanSu } from "../schema"
import { useNhanSu, useBatchDeleteNhanSu } from "../hooks"
import { nhanSuColumns } from "./nhan-su-columns"
import { nhanSuConfig } from "../config"
import { useFiltersStore } from "@/shared/stores/filters-store"
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table"
import { DataTableFacetedFilter } from "@/shared/components/data-display/data-table-faceted-filter"
import { NhanSuImportDialog } from "./nhan-su-import-dialog"

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
    const module = nhanSuConfig.moduleName
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)

    // Filters Store integration
    const {
        getModuleFilters,
        setFilter,
        getSearchQuery,
        setSearchQuery,
        getSortPreference,
        setSortPreference,
    } = useFiltersStore()

    // Load saved filters, search, and sort on mount
    const [initialFilters, setInitialFilters] = React.useState<ColumnFiltersState>([])
    const [initialSearch, setInitialSearch] = React.useState<string>("")
    const [initialSorting, setInitialSorting] = React.useState<SortingState>([
        { id: "ma_nhan_vien", desc: true },
    ])

    React.useEffect(() => {
        // Load saved filters
        const savedFilters = getModuleFilters(module)
        if (Object.keys(savedFilters).length > 0) {
            const filtersArray: ColumnFiltersState = Object.entries(savedFilters).map(([key, value]) => ({
                id: key,
                value: value,
            }))
            setInitialFilters(filtersArray)
        }

        // Load saved search query
        const savedSearch = getSearchQuery(module)
        if (savedSearch) {
            setInitialSearch(savedSearch)
        }

        // Load saved sort preference
        const savedSort = getSortPreference(module)
        if (savedSort) {
            setInitialSorting([{ id: savedSort.column, desc: savedSort.direction === "desc" }])
        }
    }, [module, getModuleFilters, getSearchQuery, getSortPreference])

    // Generate filter options from data
    const phongBanOptions = React.useMemo(() => {
        const unique = Array.from(
            new Set(nhanSuList?.map((e) => e.phong_ban).filter((d): d is string => !!d) || [])
        )
        return unique.map((d) => ({ label: d, value: d }))
    }, [nhanSuList])

    const chucVuOptions = React.useMemo(() => {
        const unique = Array.from(
            new Set(nhanSuList?.map((e) => e.chuc_vu).filter((d): d is string => !!d) || [])
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
                            {(row.chuc_vu || row.phong_ban || row.tinh_trang) && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    {(row.chuc_vu || row.phong_ban) && (
                                        <p className="text-sm text-muted-foreground leading-snug line-clamp-1">
                                            {row.chuc_vu}
                                            {row.chuc_vu && row.phong_ban && " · "}
                                            {row.phong_ban}
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
        const column = nhanSuColumns.find((col) => col.id === columnId || col.accessorKey === columnId)
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
            onFiltersChange={(filters) => {
                // Save filters to store
                filters.forEach((filter) => {
                    setFilter(module, filter.id, filter.value)
                })
            }}
            onSearchChange={(search) => {
                // Save search query to store
                setSearchQuery(module, search)
            }}
            onSortChange={(sorting) => {
                // Save sort preference to store
                if (sorting.length > 0) {
                    const sort = sorting[0]
                    setSortPreference(module, { column: sort.id, direction: sort.desc ? "desc" : "asc" })
                }
            }}
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
            filters={[
                {
                    columnId: "phong_ban",
                    title: "Phòng ban",
                    options: phongBanOptions,
                },
                {
                    columnId: "chuc_vu",
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
        />

            {/* Import Dialog */}
            <NhanSuImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
            />
        </>
    )
}
