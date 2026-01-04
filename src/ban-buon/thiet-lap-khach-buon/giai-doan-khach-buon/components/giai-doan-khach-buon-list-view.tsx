"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { GiaiDoanKhachBuon } from "../schema"
import { useGiaiDoanKhachBuon, useBatchDeleteGiaiDoanKhachBuon } from "../hooks"
import { giaiDoanKhachBuonColumns } from "./giai-doan-khach-buon-columns"
import { giaiDoanKhachBuonConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"

interface GiaiDoanKhachBuonListViewProps {
    initialData?: GiaiDoanKhachBuon[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function GiaiDoanKhachBuonListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: GiaiDoanKhachBuonListViewProps = {}) {
    const { data: giaiDoanKhachBuonList, isLoading, isError, refetch } = useGiaiDoanKhachBuon(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteGiaiDoanKhachBuon()
    const module = giaiDoanKhachBuonConfig.moduleName

    // Create columns
    const columns = React.useMemo(() => {
        return giaiDoanKhachBuonColumns()
    }, [])

    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, [{ id: "tt", desc: false }])

    // Generate filter options from data
    const nguoiTaoOptions = React.useMemo(() => {
        if (!giaiDoanKhachBuonList) return []
        const unique = new Map<number, { id: number; name: string }>()
        
        giaiDoanKhachBuonList.forEach((item) => {
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
    }, [giaiDoanKhachBuonList])

    // Build filters array from config + dynamic options
    const filters = React.useMemo(() => {
        const baseFilters = giaiDoanKhachBuonConfig.filterColumns || []
        
        // Add nguoi_tao_id filter if we have options
        if (nguoiTaoOptions.length > 0) {
            return [
                ...baseFilters,
                {
                    columnId: "nguoi_tao_id",
                    title: "Người Tạo",
                    options: nguoiTaoOptions,
                },
            ]
        }
        
        return baseFilters
    }, [nguoiTaoOptions])

    const handleAddNewClick = () => {
        if (onAddNew) {
            onAddNew()
        } else {
            navigate(`${giaiDoanKhachBuonConfig.routePath}/moi`)
        }
    }

    const handleEditClick = (id: number) => {
        if (onEdit) {
            onEdit(id)
        } else {
            navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}/sua`)
        }
    }

    const handleViewClick = (id: number) => {
        if (onView) {
            onView(id)
        } else {
            navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}`)
        }
    }

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: GiaiDoanKhachBuon) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base text-foreground leading-tight truncate block">
                                {row.ten_giai_doan}
                            </span>
                            {row.ma_giai_doan && (
                                <span className="text-sm text-muted-foreground mt-1 block">
                                    Mã: {row.ma_giai_doan}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.mo_ta && (
                        <p className="leading-snug line-clamp-2">
                            {row.mo_ta}
                        </p>
                    )}
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

    const getCellValue = React.useCallback((row: GiaiDoanKhachBuon, columnId: string) => {
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách giai đoạn khách buôn</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <GenericListView
            data={giaiDoanKhachBuonList || []}
            columns={columns}
            filterColumn="ten_giai_doan"
            module={module}
            searchFields={giaiDoanKhachBuonConfig.searchFields as (keyof GiaiDoanKhachBuon)[]}
            filters={filters}
            initialFilters={initialFilters}
            initialSearch={initialSearch}
            initialSorting={initialSorting}
            onFiltersChange={handleFiltersChange}
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
            onAdd={handleAddNewClick}
            onEdit={(row) => handleEditClick(row.id!)}
            onRowClick={(row) => handleViewClick(row.id!)}
            onDeleteSelected={async (selectedRows) => {
                const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                await batchDeleteMutation.mutateAsync(ids)
            }}
            renderMobileCard={renderMobileCard}
            exportOptions={{
                getColumnTitle,
                getCellValue,
            }}
        />
    )
}

