"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components"
import { LichDang } from "../schema"
import { useLichDang, useBatchDeleteLichDang } from "../hooks"
import { createColumns } from "./lich-dang-columns"
import { lichDangConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { DeleteLichDangButton } from "./delete-lich-dang-button"
import { PreviewDialog } from "./preview-dialog"
import { LichDangImportDialog } from "./lich-dang-import-dialog"
import { LichDangAPI } from "../services/lich-dang.api"
import { useReferenceQuery } from "@/lib/react-query/hooks"
import { useMemo, useState, useCallback } from "react"
import { useBatchUpsertLichDang } from "../actions/lich-dang-excel-actions"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface LichDangListViewProps {
    initialData?: LichDang[]
    initialDanhSachChucVu?: any[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function LichDangListView({ 
    initialData,
    initialDanhSachChucVu,
    onEdit,
    onAddNew,
    onView,
}: LichDangListViewProps = {}) {
    const { data: lichDangList, isLoading, isError, refetch } = useLichDang(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteLichDang()
    const batchImportMutation = useBatchUpsertLichDang()
    const module = lichDangConfig.moduleName
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
    const [previewData, setPreviewData] = useState<LichDang | null>(null)
    const [importDialogOpen, setImportDialogOpen] = useState(false)
    
    // ⚡ Performance: Sử dụng initial data từ server component để tránh client-side fetch
    const { data: danhSachChucVu = initialDanhSachChucVu || [] } = useReferenceQuery({
        queryKey: ['chuc-vu-list-for-filter'],
        queryFn: LichDangAPI.getDanhSachChucVu,
        initialData: initialDanhSachChucVu,
    })
    
    // Tạo map từ ID -> tên chức vụ
    const chucVuMap = useMemo(() => {
        const map = new Map<number, string>()
        danhSachChucVu.forEach((cv: any) => {
            if (cv.id && cv.ten_chuc_vu) {
                map.set(cv.id, cv.ten_chuc_vu)
            }
        })
        return map
    }, [danhSachChucVu])
    
    // Handler để mở preview dialog
    const handlePreview = useCallback((data: LichDang) => {
        setPreviewData(data)
        setPreviewDialogOpen(true)
    }, [])

    // Tạo columns với chucVuMap và onPreview callback
    const columns = useMemo(() => createColumns(chucVuMap, handlePreview), [chucVuMap, handlePreview])

    // Export utilities
    const getColumnTitle = React.useCallback((columnId: string) => {
        const column = columns.find((col) => {
            const id = (col as any).id
            const accessorKey = (col as any).accessorKey
            return id === columnId || accessorKey === columnId
        })
        return (column?.meta as any)?.title || columnId
    }, [columns])

    const getCellValue = React.useCallback((row: LichDang, columnId: string) => {
        if (columnId === "ngay_dang") {
            const value = (row as any)[columnId]
            if (!value) return ""
            try {
                return format(new Date(value), "dd/MM/yyyy", { locale: vi })
            } catch {
                return value
            }
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
        if (columnId === "chuc_vu_ap_dung") {
            const value = (row as any)[columnId]
            if (Array.isArray(value) && value.length > 0) {
                return value.map((id: number) => chucVuMap.get(id) || `ID: ${id}`).join(", ")
            }
            return "Tất cả"
        }
        return (row as any)[columnId] ?? ""
    }, [chucVuMap])
    
    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    const {
        initialFilters,
        initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, [{ id: "ngay_dang", desc: true }])

    // Generate filter options from data
    const filterOptions = React.useMemo(() => {
        if (!lichDangList || lichDangList.length === 0) {
            return {
                nhomCauHoi: [],
                ngayDang: [],
                nguoiTao: [],
                chucVu: [],
            }
        }

        // Nhóm câu hỏi options
        const nhomCauHoiSet = new Set<string>()
        lichDangList.forEach(item => {
            if (item.nhom_cau_hoi_ten) {
                nhomCauHoiSet.add(item.nhom_cau_hoi_ten)
            }
        })
        const nhomCauHoiOptions = Array.from(nhomCauHoiSet)
            .map(value => ({ label: value, value }))
            .sort((a, b) => a.label.localeCompare(b.label))

        // Ngày đăng options
        const ngayDangSet = new Set<string>()
        lichDangList.forEach(item => {
            if (item.ngay_dang) {
                const date = new Date(item.ngay_dang)
                const dateStr = date.toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                })
                ngayDangSet.add(dateStr)
            }
        })
        const ngayDangOptions = Array.from(ngayDangSet)
            .map(value => ({ label: value, value }))
            .sort((a, b) => b.label.localeCompare(a.label)) // Sort descending

        // Người tạo options
        const nguoiTaoSet = new Set<string>()
        lichDangList.forEach(item => {
            if (item.nguoi_tao_ten) {
                nguoiTaoSet.add(item.nguoi_tao_ten)
            }
        })
        const nguoiTaoOptions = Array.from(nguoiTaoSet)
            .map(value => ({ label: value, value }))
            .sort((a, b) => a.label.localeCompare(b.label))

        // Chức vụ options (from danhSachChucVu)
        const chucVuOptions = danhSachChucVu.map((cv: any) => ({
            label: cv.ten_chuc_vu || `ID: ${cv.id}`,
            value: String(cv.id)
        })).sort((a, b) => a.label.localeCompare(b.label))

        return {
            nhomCauHoi: nhomCauHoiOptions,
            ngayDang: ngayDangOptions,
            nguoiTao: nguoiTaoOptions,
            chucVu: chucVuOptions,
        }
    }, [lichDangList, danhSachChucVu])

    // Build filters array
    const filters = React.useMemo(() => {
        return [
            {
                columnId: "nhom_cau_hoi_ten",
                title: "Nhóm Câu Hỏi",
                options: filterOptions.nhomCauHoi,
            },
            {
                columnId: "ngay_dang",
                title: "Ngày Đăng",
                options: filterOptions.ngayDang,
            },
            {
                columnId: "chuc_vu_ap_dung",
                title: "Chức Vụ Áp Dụng",
                options: filterOptions.chucVu,
            },
            {
                columnId: "nguoi_tao_ten",
                title: "Người Tạo",
                options: filterOptions.nguoiTao,
            },
        ]
    }, [filterOptions])

    // Handle batch delete
    const handleBatchDelete = React.useCallback(async (ids: number[]) => {
        try {
            await batchDeleteMutation.mutateAsync(ids)
        } catch (error) {
            // Error is handled by mutation
        }
    }, [batchDeleteMutation])

    // Handle edit
    const handleEdit = React.useCallback((id: number) => {
        if (onEdit) {
            onEdit(id)
        } else {
            navigate(`${lichDangConfig.routePath}/${id}/sua?returnTo=list`)
        }
    }, [navigate, onEdit])

    // Handle add new
    const handleAddNew = React.useCallback(() => {
        if (onAddNew) {
            onAddNew()
        } else {
            navigate(`${lichDangConfig.routePath}/moi`)
        }
    }, [navigate, onAddNew])

    // Handle view
    const handleView = React.useCallback((id: number) => {
        if (onView) {
            onView(id)
        } else {
            navigate(`${lichDangConfig.routePath}/${id}`)
        }
    }, [navigate, onView])

    return (
        <>
            <GenericListView
                columns={columns}
                data={lichDangList || []}
                filterColumn="cau_hoi"
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
                        navigate(`${lichDangConfig.routePath}/${row.id}`)
                    }
                }}
                onAdd={() => {
                    if (onAddNew) {
                        onAddNew()
                    } else {
                        navigate(`${lichDangConfig.routePath}/moi`)
                    }
                }}
                addHref={`${lichDangConfig.routePath}/moi`}
                onBack={() => {
                    navigate(lichDangConfig.parentPath)
                }}
                onDeleteSelected={async (selectedRows) => {
                    const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                    await batchDeleteMutation.mutateAsync(ids)
                }}
                searchFields={lichDangConfig.searchFields as (keyof LichDang)[]}
                module={module}
                enableSuggestions={true}
                enableRangeSelection={true}
                enableLongPress={true}
                persistSelection={false}
                filters={filters}
                onEdit={(row) => {
                    if (onEdit) {
                        onEdit(row.id!)
                    } else {
                        navigate(`${lichDangConfig.routePath}/${row.id}/sua?returnTo=list`)
                    }
                }}
                onImport={() => setImportDialogOpen(true)}
                isImporting={batchImportMutation.isPending}
                exportOptions={{
                    columns: columns,
                    totalCount: lichDangList?.length || 0,
                    moduleName: lichDangConfig.moduleTitle,
                    getColumnTitle,
                    getCellValue,
                }}
            />
            
            <PreviewDialog
                open={previewDialogOpen}
                onOpenChange={setPreviewDialogOpen}
                data={previewData}
            />

            {/* Import Dialog */}
            <LichDangImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />
        </>
    )
}

