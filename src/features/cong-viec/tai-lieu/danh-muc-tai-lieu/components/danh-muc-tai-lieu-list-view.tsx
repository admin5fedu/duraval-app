"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { DanhMucTaiLieu } from "../schema"
import { useDanhMucTaiLieu, useBatchDeleteDanhMucTaiLieu, useDeleteDanhMucTaiLieu } from "../hooks"
import { danhMucTaiLieuColumns } from "./danh-muc-tai-lieu-columns"
import { danhMucTaiLieuConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
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
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { DanhMucTaiLieuImportDialog } from "./danh-muc-tai-lieu-import-dialog"
import { useBatchUpsertDanhMucTaiLieu } from "../actions/danh-muc-tai-lieu-excel-actions"

interface DanhMucTaiLieuListViewProps {
    initialData?: DanhMucTaiLieu[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function DanhMucTaiLieuListView({ 
    initialData,
    onEdit,
    onAddNew,
    onView,
}: DanhMucTaiLieuListViewProps = {}) {
    const { data: danhMucTaiLieuList, isLoading, isError, refetch } = useDanhMucTaiLieu(initialData)
    const navigate = useNavigate()
    const batchDeleteMutation = useBatchDeleteDanhMucTaiLieu()
    const deleteMutation = useDeleteDanhMucTaiLieu()
    const batchImportMutation = useBatchUpsertDanhMucTaiLieu()
    const module = danhMucTaiLieuConfig.moduleName
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<DanhMucTaiLieu | null>(null)

    // Create columns
    const columns = React.useMemo(() => {
        return danhMucTaiLieuColumns
    }, [])

    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    // Lưu ý: Không dùng initialSorting vì chúng ta có custom sorting logic
    const {
        initialFilters,
        initialSearch,
        initialSorting: _initialSorting,
        handleFiltersChange,
        handleSearchChange,
        handleSortChange: _handleSortChange,
    } = useListViewFilters(module, [{ id: "tg_tao", desc: true }])
    
    // Disable sorting của React Table vì chúng ta đã sắp xếp custom
    const initialSorting: never[] = []
    const handleSortChange = () => {
        // Không làm gì vì chúng ta không muốn React Table sắp xếp lại
    }

    // Generate filter options from data
    const nguoiTaoOptions = React.useMemo(() => {
        if (!danhMucTaiLieuList) return []
        const unique = new Map<number, { id: number; name: string }>()
        
        danhMucTaiLieuList.forEach((item) => {
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
    }, [danhMucTaiLieuList])

    // Generate hang_muc filter options
    const hangMucOptions = React.useMemo(() => {
        return [
            { label: "Biểu mẫu & Kế hoạch", value: "Biểu mẫu & Kế hoạch" },
            { label: "Văn bản hệ thống", value: "Văn bản hệ thống" },
        ]
    }, [])

    // Generate cap filter options
    const capOptions = React.useMemo(() => {
        return [
            { label: "Cấp 1", value: "1" },
            { label: "Cấp 2", value: "2" },
        ]
    }, [])

    // Build filters array
    const filters = React.useMemo(() => {
        return [
            {
                columnId: "hang_muc",
                title: "Hạng mục",
                options: hangMucOptions,
            },
            {
                columnId: "cap",
                title: "Cấp",
                options: capOptions,
            },
            {
                columnId: "nguoi_tao_id",
                title: "Người tạo",
                options: nguoiTaoOptions,
            },
        ]
    }, [hangMucOptions, capOptions, nguoiTaoOptions])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: DanhMucTaiLieu) => {
        // Badge color mapping for hang_muc
        const badgeColorMap: Record<string, string> = {
            "Biểu mẫu & Kế hoạch": "bg-blue-50 text-blue-700 border-blue-200",
            "Văn bản hệ thống": "bg-purple-50 text-purple-700 border-purple-200",
        }
        const badgeClass = row.hang_muc ? badgeColorMap[row.hang_muc] || "bg-gray-50 text-gray-700 border-gray-200" : ""

        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Hạng mục / Tên danh mục */}
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                        {row.hang_muc ? (
                            <Badge variant="outline" className={cn(badgeClass, "text-xs")}>
                                {row.hang_muc}
                            </Badge>
                        ) : null}
                        {row.ten_danh_muc && (
                            <p className="text-sm text-foreground mt-1 font-medium">
                                {row.ten_danh_muc}
                            </p>
                        )}
                        {!row.ten_danh_muc && !row.hang_muc && (
                            <span className="font-semibold text-base text-foreground leading-tight">
                                ID: {row.id}
                            </span>
                        )}
                    </div>
                </div>
                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.loai_tai_lieu && (
                        <p className="leading-snug">
                            Loại: {row.loai_tai_lieu}
                        </p>
                    )}
                    {row.cap !== null && row.cap !== undefined && (
                        <p className="leading-snug">
                            <Badge 
                                variant="outline" 
                                className={cn(
                                    "text-xs",
                                    row.cap === 1 
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : row.cap === 2
                                        ? "bg-orange-50 text-orange-700 border-orange-200"
                                        : "bg-gray-50 text-gray-700 border-gray-200"
                                )}
                            >
                                Cấp {row.cap}
                            </Badge>
                        </p>
                    )}
                    {row.mo_ta && (
                        <p className="leading-snug line-clamp-2">
                            {row.mo_ta}
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

    const getCellValue = React.useCallback((row: DanhMucTaiLieu, columnId: string) => {
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
            const value = (row as any)[columnId]
            if (!value) return ""
            return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
        }
        if (columnId === "cap") {
            const value = (row as any)[columnId]
            return value !== null && value !== undefined ? value.toString() : ""
        }
        return (row as any)[columnId] ?? ""
    }, [])

    // Sắp xếp data theo quy tắc:
    // 1. Hạng mục: "Văn bản hệ thống" > "Biểu mẫu & Kế hoạch" > các hạng mục khác (alphabetical)
    // 2. Trong cùng hạng mục: Cụm (Cấp 1 + Cấp 2) sắp xếp theo tg_tao của Cấp 1 (desc)
    // 3. Trong cụm: Cấp 1 ở đầu, Cấp 2 bên dưới sắp xếp theo tg_tao desc
    // 4. Orphans (Cấp 2 không có parent) được xử lý như Cấp 1 độc lập
    // Phải đặt trước early returns để tránh lỗi hooks
    const sortedData = React.useMemo(() => {
        if (!danhMucTaiLieuList) return []
        
        // Hàm so sánh tg_tao (tạo sau lên trước)
        const compareTgTao = (a: DanhMucTaiLieu, b: DanhMucTaiLieu): number => {
            const tgTaoA = a.tg_tao ? new Date(a.tg_tao).getTime() : 0
            const tgTaoB = b.tg_tao ? new Date(b.tg_tao).getTime() : 0
            return tgTaoB - tgTaoA // Desc: tạo sau lên trước
        }
        
        // Hàm lấy priority của hạng mục
        const getHangMucPriority = (hangMuc: string): number => {
            if (hangMuc === "Văn bản hệ thống") return 1
            if (hangMuc === "Biểu mẫu & Kế hoạch") return 2
            return 999 // Các hạng mục khác sẽ sắp xếp alphabetical sau
        }
        
        // Hàm so sánh hạng mục với đầy đủ logic
        const compareHangMuc = (a: string, b: string): number => {
            const priorityA = getHangMucPriority(a)
            const priorityB = getHangMucPriority(b)
            
            // Nếu cả hai đều là hạng mục đặc biệt
            if (priorityA < 999 && priorityB < 999) {
                return priorityA - priorityB
            }
            
            // Nếu một trong hai là hạng mục đặc biệt
            if (priorityA < 999) return -1
            if (priorityB < 999) return 1
            
            // Cả hai đều là hạng mục khác: sắp xếp alphabetical
            return a.localeCompare(b, 'vi')
        }
        
        // Tách cấp 1 và cấp 2 (đảm bảo so sánh chính xác)
        const cap1 = danhMucTaiLieuList.filter(item => Number(item.cap) === 1)
        const cap2 = danhMucTaiLieuList.filter(item => Number(item.cap) === 2)
        
        // Tạo các cụm: mỗi cụm = 1 cấp 1 + các cấp 2 của nó
        interface Cluster {
            parent: DanhMucTaiLieu
            children: DanhMucTaiLieu[]
        }
        
        const clusters: Cluster[] = cap1.map(parent => ({
            parent,
            children: cap2
                .filter(child => child.danh_muc_cha_id !== null && child.danh_muc_cha_id !== undefined && Number(child.danh_muc_cha_id) === Number(parent.id))
                .sort(compareTgTao) // Sắp xếp cấp 2 trong cụm theo tg_tao desc
        }))
        
        // Sắp xếp các cụm: theo hạng mục, sau đó theo tg_tao của cấp 1 (desc)
        clusters.sort((a, b) => {
            const hangMucCompare = compareHangMuc(a.parent.hang_muc || "", b.parent.hang_muc || "")
            if (hangMucCompare !== 0) return hangMucCompare
            return compareTgTao(a.parent, b.parent) // Sắp xếp theo tg_tao của cấp 1
        })
        
        // Ghép các cụm thành kết quả: cấp 1, sau đó các cấp 2 của nó
        const result: DanhMucTaiLieu[] = []
        clusters.forEach(cluster => {
            result.push(cluster.parent)
            result.push(...cluster.children)
        })
        
        // Xử lý orphans (Cấp 2 không có parent): xử lý như Cấp 1 độc lập
        const orphans = cap2.filter(child => {
            if (!child.danh_muc_cha_id) return true // Không có parent
            const hasParent = cap1.some(parent => Number(parent.id) === Number(child.danh_muc_cha_id))
            return !hasParent
        })
        
        // Sắp xếp orphans: theo hạng mục, sau đó theo tg_tao desc
        orphans.sort((a, b) => {
            const hangMucCompare = compareHangMuc(a.hang_muc || "", b.hang_muc || "")
            if (hangMucCompare !== 0) return hangMucCompare
            return compareTgTao(a, b)
        })
        
        // Thêm orphans vào result (xử lý như Cấp 1 độc lập)
        result.push(...orphans)
        
        return result
    }, [danhMucTaiLieuList])

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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách danh mục tài liệu</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
        <GenericListView
                    columns={columns}
                    data={sortedData}
                    filterColumn="ten_danh_muc"
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
                            navigate(`${danhMucTaiLieuConfig.routePath}/${row.id}`)
                        }
                    }}
                    onAdd={() => {
                        if (onAddNew) {
                            onAddNew()
                        } else {
                            navigate(`${danhMucTaiLieuConfig.routePath}/moi`)
                        }
                    }}
                    addHref={`${danhMucTaiLieuConfig.routePath}/moi`}
                    onBack={() => {
                        navigate(danhMucTaiLieuConfig.parentPath)
                    }}
                    onDeleteSelected={async (selectedRows) => {
                        const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                        await batchDeleteMutation.mutateAsync(ids)
                    }}
                    batchDeleteConfig={{
                        itemName: "danh mục tài liệu",
                        moduleName: danhMucTaiLieuConfig.moduleTitle,
                        isLoading: batchDeleteMutation.isPending,
                        getItemLabel: (item: DanhMucTaiLieu) => item.ten_danh_muc || item.hang_muc || String(item.id),
                    }}
                    searchFields={danhMucTaiLieuConfig.searchFields as (keyof DanhMucTaiLieu)[]}
                    module={module}
                    enableSuggestions={true}
                    enableRangeSelection={true}
                    enableLongPress={true}
                    persistSelection={false}
                    renderMobileCard={renderMobileCard}
                    enableVirtualization={(danhMucTaiLieuList?.length || 0) > 100}
                    virtualRowHeight={60}
                    exportOptions={{
                        columns: columns,
                        totalCount: sortedData.length,
                        moduleName: danhMucTaiLieuConfig.moduleTitle,
                        getColumnTitle,
                        getCellValue,
                    }}
                    onEdit={(row) => {
                        if (onEdit) {
                            onEdit(row.id!)
                        } else {
                            navigate(`${danhMucTaiLieuConfig.routePath}/${row.id}/sua?returnTo=list`)
                        }
                    }}
                    onDelete={(row) => {
                        setRowToDelete(row)
                        setDeleteDialogOpen(true)
                    }}
                    filters={filters}
                    onImport={() => setImportDialogOpen(true)}
                    isImporting={batchImportMutation.isPending}
        />

            {/* Import Dialog */}
            <DanhMucTaiLieuImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mutation={batchImportMutation}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa danh mục tài liệu</AlertDialogTitle>
                        <AlertDialogDescription>
                            {(() => {
                                const itemName = rowToDelete?.ten_danh_muc || rowToDelete?.hang_muc || `ID: ${rowToDelete?.id}`
                                const isCap1 = rowToDelete?.cap === 1
                                const childrenCount = isCap1 
                                    ? (danhMucTaiLieuList?.filter(item => item.danh_muc_cha_id === rowToDelete?.id).length || 0)
                                    : 0
                                
                                if (childrenCount > 0) {
                                    return (
                                        <>
                                            Bạn có chắc chắn muốn xóa danh mục tài liệu <strong>{itemName}</strong>?
                                            <br />
                                            <br />
                                            <strong className="text-destructive">Cảnh báo:</strong> Danh mục này có <strong>{childrenCount}</strong> danh mục con. 
                                            Tất cả các danh mục con sẽ bị xóa cùng với danh mục cha này.
                                            <br />
                                            <br />
                                            Hành động này không thể hoàn tác.
                                        </>
                                    )
                                }
                                return (
                                    <>
                                        Bạn có chắc chắn muốn xóa danh mục tài liệu <strong>{itemName}</strong>? Hành động này không thể hoàn tác.
                                    </>
                                )
                            })()}
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
        </>
    )
}

