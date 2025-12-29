"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { useDataTable } from "@/shared/hooks/use-data-table"
import { LichDang } from "../schema"
import { useBatchDeleteLichDang, useDeleteLichDang } from "../hooks"
import { createColumns } from "./lich-dang-columns"
import { lichDangConfig } from "../config"
import { PreviewDialog } from "./preview-dialog"
import { LichDangImportDialog } from "./lich-dang-import-dialog"
import { LichDangAPI } from "../services/lich-dang.api"
import { lichDangQueryKeys } from "@/lib/react-query/query-keys"
import { useReferenceQuery } from "@/lib/react-query"
import { useMemo, useState, useCallback } from "react"
import { useBatchUpsertLichDang } from "../actions/lich-dang-excel-actions"
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
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteLichDang()
    const deleteMutation = useDeleteLichDang()
    const batchImportMutation = useBatchUpsertLichDang()
    const module = lichDangConfig.moduleName
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
    const [previewData, setPreviewData] = useState<LichDang | null>(null)
    const [importDialogOpen, setImportDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [rowToDelete, setRowToDelete] = useState<LichDang | null>(null)
    
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
        if (columnId === "gio_dang") {
            const value = (row as any)[columnId]
            if (!value) return ""
            // Chỉ lấy hh:mm, bỏ phần :ss nếu có
            return value.length > 5 ? value.substring(0, 5) : value
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
        if (columnId === "nguoi_tao_ten") {
            const nguoiTaoTen = (row as any)[columnId]
            const nguoiTaoId = row.nguoi_tao_id
            if (!nguoiTaoId) return ""
            return nguoiTaoTen ? `${nguoiTaoId} - ${nguoiTaoTen}` : String(nguoiTaoId)
        }
        return (row as any)[columnId] ?? ""
    }, [chucVuMap])

    // ✅ Use useDataTable hook to get all props for GenericListView
    const dataTableProps = useDataTable<LichDang>({
        queryKeys: lichDangQueryKeys,
        queryFn: LichDangAPI.getAll,
        initialData: initialData,
        module: module,
        columns: columns,
        defaultSorting: [{ id: "ngay_dang", desc: true }],
        filterColumn: "cau_hoi",
        searchFields: lichDangConfig.searchFields as (keyof LichDang)[],
        onRowClick: (row) => {
            if (onView) {
                onView(row.id!)
            } else {
                navigate(`${lichDangConfig.routePath}/${row.id}`)
            }
        },
        onEdit: (row) => {
            if (onEdit) {
                onEdit(row.id!)
            } else {
                navigate(`${lichDangConfig.routePath}/${row.id}/sua?returnTo=list`)
            }
        },
        onDelete: (row) => {
            setRowToDelete(row)
            setDeleteDialogOpen(true)
        },
        onAdd: () => {
            if (onAddNew) {
                onAddNew()
            } else {
                navigate(`${lichDangConfig.routePath}/moi`)
            }
        },
        onBack: () => {
            navigate(lichDangConfig.parentPath)
        },
        onDeleteSelected: async (selectedRows) => {
            const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
            await batchDeleteMutation.mutateAsync(ids)
        },
        batchDeleteConfig: {
            itemName: "lịch đăng",
            moduleName: lichDangConfig.moduleTitle,
            isLoading: batchDeleteMutation.isPending,
            getItemLabel: (item: LichDang) => String(item.id),
        },
        onImport: () => setImportDialogOpen(true),
        isImporting: batchImportMutation.isPending,
        enableSuggestions: true,
        enableRangeSelection: true,
        enableLongPress: true,
        persistSelection: false,
    })

    // Generate filter options from data
    const filterOptions = React.useMemo(() => {
        const data = dataTableProps.data || []
        if (!data || data.length === 0) {
            return {
                nhomCauHoi: [],
                ngayDang: [],
                nguoiTao: [],
                chucVu: [],
            }
        }

        // Nhóm câu hỏi options
        const nhomCauHoiSet = new Set<string>()
        data.forEach(item => {
            if (item.nhom_cau_hoi_ten) {
                nhomCauHoiSet.add(item.nhom_cau_hoi_ten)
            }
        })
        const nhomCauHoiOptions = Array.from(nhomCauHoiSet)
            .map(value => ({ label: value, value }))
            .sort((a, b) => a.label.localeCompare(b.label))

        // Ngày đăng options
        const ngayDangSet = new Set<string>()
        data.forEach(item => {
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

        // Người tạo options - Format: "id - ten"
        const nguoiTaoMap = new Map<number, string>()
        data.forEach(item => {
            if (item.nguoi_tao_id && item.nguoi_tao_ten) {
                nguoiTaoMap.set(item.nguoi_tao_id, item.nguoi_tao_ten)
            }
        })
        const nguoiTaoOptions = Array.from(nguoiTaoMap.entries())
            .map(([id, ten]) => ({
                label: `${id} - ${ten}`,
                value: `${id} - ${ten}` // Value để match với display text
            }))
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
    }, [dataTableProps.data, danhSachChucVu])

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

    // Update exportOptions with correct totalCount (use dataTableProps.data)
    const exportOptionsWithCount = React.useMemo(() => ({
        columns: columns,
        totalCount: dataTableProps.data?.length || 0,
        moduleName: lichDangConfig.moduleTitle,
        getColumnTitle,
        getCellValue,
    }), [columns, dataTableProps.data, getColumnTitle, getCellValue])

    return (
        <>
            <GenericListView
                {...dataTableProps}
                filters={filters}
                addHref={`${lichDangConfig.routePath}/moi`}
                exportOptions={exportOptionsWithCount}
            />
            
            <PreviewDialog
                open={previewDialogOpen}
                onOpenChange={setPreviewDialogOpen}
                data={previewData}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa lịch đăng <strong>{rowToDelete?.cau_hoi}</strong>? Hành động này không thể hoàn tác.
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
            <LichDangImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />
        </>
    )
}

