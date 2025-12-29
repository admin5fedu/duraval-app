"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { useDataTable } from "@/shared/hooks/use-data-table"
import { CauTraLoi } from "../schema"
import { useBatchDeleteCauTraLoi, useDeleteCauTraLoi } from "../hooks"
import { createColumns } from "./cau-tra-loi-columns"
import { cauTraLoiConfig } from "../config"
import { CauTraLoiAPI } from "../services/cau-tra-loi.api"
import { cauTraLoiQueryKeys } from "@/lib/react-query/query-keys"
import { useMemo, useState, useCallback } from "react"
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
import { CauTraLoiImportDialog } from "./cau-tra-loi-import-dialog"
import { useBatchUpsertCauTraLoi } from "../actions/cau-tra-loi-excel-actions"

interface CauTraLoiListViewProps {
    initialData?: CauTraLoi[]
    initialDanhSachLichDangBai?: any[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function CauTraLoiListView({ 
    initialData,
}: CauTraLoiListViewProps = {}) {
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteCauTraLoi()
    const deleteMutation = useDeleteCauTraLoi()
    const batchImportMutation = useBatchUpsertCauTraLoi()
    const module = cauTraLoiConfig.moduleName
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [rowToDelete, setRowToDelete] = useState<CauTraLoi | null>(null)
    const [importDialogOpen, setImportDialogOpen] = useState(false)
    
    // Tạo columns
    const columns = useMemo(() => createColumns(), [])

    // Export utilities
    const getColumnTitle = React.useCallback((columnId: string) => {
        const column = columns.find((col) => {
            const id = (col as any).id
            const accessorKey = (col as any).accessorKey
            return id === columnId || accessorKey === columnId
        })
        return (column?.meta as any)?.title || columnId
    }, [columns])

    const getCellValue = React.useCallback((row: CauTraLoi, columnId: string) => {
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
            const value = (row as any)[columnId]
            if (!value) return ""
            try {
                return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
                return value
            }
        }
        if (columnId === "nguoi_tao_ten") {
            const nguoiTaoTen = (row as any)[columnId]
            const nguoiTaoId = row.nguoi_tao_id
            if (!nguoiTaoId) return ""
            return nguoiTaoTen ? `${nguoiTaoId} - ${nguoiTaoTen}` : String(nguoiTaoId)
        }
        return (row as any)[columnId] ?? ""
    }, [])

    // ✅ Use useDataTable hook to get all props for GenericListView
    const dataTableProps = useDataTable<CauTraLoi>({
        queryKeys: cauTraLoiQueryKeys,
        queryFn: CauTraLoiAPI.getAll,
        initialData: initialData,
        module: module,
        columns: columns,
        defaultSorting: [{ id: "tg_tao", desc: true }],
        filterColumn: "cau_tra_loi",
        searchFields: cauTraLoiConfig.searchFields as (keyof CauTraLoi)[],
        onRowClick: (row) => {
            navigate(`${cauTraLoiConfig.routePath}/${row.id}`)
        },
        onDelete: (row) => {
            setRowToDelete(row)
            setDeleteDialogOpen(true)
        },
        onDeleteSelected: async (selectedRows) => {
            const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
            await batchDeleteMutation.mutateAsync(ids)
        },
        batchDeleteConfig: {
            itemName: "câu trả lời",
            moduleName: cauTraLoiConfig.moduleTitle,
            isLoading: batchDeleteMutation.isPending,
            getItemLabel: (item: CauTraLoi) => String(item.id),
        },
        onImport: () => setImportDialogOpen(true),
        isImporting: batchImportMutation.isPending,
        exportOptions: {
            getColumnTitle,
            getCellValue,
        },
    })

    // Handle individual delete
    const handleDelete = useCallback(async () => {
        if (!rowToDelete?.id) return
        try {
            await deleteMutation.mutateAsync(rowToDelete.id)
            setDeleteDialogOpen(false)
            setRowToDelete(null)
        } catch (error) {
            // Error handled by mutation
        }
    }, [rowToDelete, deleteMutation])

    // Filter options
    const filterOptions = React.useMemo(() => {
        const data = dataTableProps.data || []
        if (data.length === 0) {
            return {
                lichDang: [],
                ketQua: [],
                nguoiTao: []
            }
        }
        
        const lichDangSet = new Set<string>()
        const ketQuaSet = new Set<string>()
        const nguoiTaoMap = new Map<number, string>()
        
        for (const item of data) {
            if (item.lich_dang_cau_hoi) {
                lichDangSet.add(item.lich_dang_cau_hoi)
            }
            if (item.ket_qua) {
                ketQuaSet.add(item.ket_qua)
            }
            if (item.nguoi_tao_id && item.nguoi_tao_ten) {
                nguoiTaoMap.set(item.nguoi_tao_id, item.nguoi_tao_ten)
            }
        }
        
        const lichDangOptions = Array.from(lichDangSet)
            .map(value => ({ label: value, value }))
            .sort((a, b) => a.label.localeCompare(b.label))
        
        const ketQuaOptions = Array.from(ketQuaSet)
            .map(value => ({ label: value, value }))
            .sort((a, b) => a.label.localeCompare(b.label))
        
        const nguoiTaoOptions = Array.from(nguoiTaoMap.entries())
            .map(([id, ten]) => ({
                label: `${id} - ${ten}`,
                value: `${id} - ${ten}`
            }))
            .sort((a, b) => a.label.localeCompare(b.label))

        return {
            lichDang: lichDangOptions,
            ketQua: ketQuaOptions,
            nguoiTao: nguoiTaoOptions,
        }
    }, [dataTableProps.data])

    // Build filters array
    const filters = React.useMemo(() => {
        return [
            {
                columnId: "lich_dang_cau_hoi",
                title: "Lịch Đăng",
                options: filterOptions.lichDang,
            },
            {
                columnId: "ket_qua",
                title: "Kết Quả",
                options: filterOptions.ketQua,
            },
            {
                columnId: "nguoi_tao_ten",
                title: "Người Tạo",
                options: filterOptions.nguoiTao,
            },
        ]
    }, [filterOptions])

    // Export options
    const exportOptionsWithCount = React.useMemo(() => ({
        columns: columns,
        totalCount: dataTableProps.data?.length || 0,
        moduleName: cauTraLoiConfig.moduleTitle,
        getColumnTitle,
        getCellValue,
    }), [columns, dataTableProps.data, getColumnTitle, getCellValue])

    return (
        <>
            <GenericListView
                {...dataTableProps}
                filters={filters}
                addHref={`${cauTraLoiConfig.routePath}/them-moi`}
                exportOptions={exportOptionsWithCount}
            />
            
            {/* Delete confirmation dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa câu trả lời này?
                            {rowToDelete?.cau_tra_loi && (
                                <>
                                    <br />
                                    <strong>{rowToDelete.cau_tra_loi}</strong>
                                </>
                            )}
                            <br />
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Import Dialog */}
            <CauTraLoiImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />
        </>
    )
}

