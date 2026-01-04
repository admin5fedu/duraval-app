"use client"

import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { PhuongXaTSN } from "../schema"
import { usePhuongXaTSNPaginated, usePhuongXaTSNSearch, usePhuongXaTSNForReference, useBatchDeletePhuongXaTSN, useDeletePhuongXaTSN } from "../hooks"
import { phuongXaTSNColumns } from "./phuong-xa-tsn-columns"
import { phuongXaTSNConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertPhuongXaTSN } from "../actions/phuong-xa-tsn-excel-actions"
import { PhuongXaTSNImportDialog } from "./phuong-xa-tsn-import-dialog"
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

interface PhuongXaTSNListViewProps {
    initialData?: PhuongXaTSN[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function PhuongXaTSNListView({
    onEdit,
    onAddNew,
    onView,
}: PhuongXaTSNListViewProps = {}) {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    
    // URL Sync: Get page, pageSize, and search from URL
    const page = React.useMemo(() => {
        const pageParam = searchParams.get('page')
        return pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1
    }, [searchParams])
    
    const pageSize = React.useMemo(() => {
        const pageSizeParam = searchParams.get('pageSize')
        return pageSizeParam ? Math.max(10, parseInt(pageSizeParam, 10)) : 50
    }, [searchParams])
    
    const searchTerm = React.useMemo(() => {
        return searchParams.get('search') || ''
    }, [searchParams])
    
    // Get filters from URL
    const filtersFromURL = React.useMemo(() => {
        const filtersParam = searchParams.get('filters')
        if (filtersParam) {
            try {
                return JSON.parse(filtersParam)
            } catch {
                return []
            }
        }
        return []
    }, [searchParams])
    
    // Server-side pagination/search hooks with filters
    const paginatedQuery = usePhuongXaTSNPaginated(page, pageSize, filtersFromURL)
    const searchQuery = usePhuongXaTSNSearch(
        searchTerm, 
        page, 
        pageSize, 
        !!searchTerm && searchTerm.trim().length > 0,
        undefined, // quanHuyenId - not used in list view
        filtersFromURL
    )
    
    // Use search results if search term exists, otherwise use paginated results
    const isSearchMode = !!searchTerm && searchTerm.trim().length > 0
    const activeQuery = isSearchMode ? searchQuery : paginatedQuery
    const { data: paginatedResult, isLoading, isError, refetch } = activeQuery
    
    // Load ALL data for filter options (reference data)
    const { data: allPhuongXa } = usePhuongXaTSNForReference()
    
    const batchDeleteMutation = useBatchDeletePhuongXaTSN()
    const deleteMutation = useDeletePhuongXaTSN()
    const batchImportMutation = useBatchUpsertPhuongXaTSN()
    const module = phuongXaTSNConfig.moduleName
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<PhuongXaTSN | null>(null)
    
    // Extract data from paginated result
    const phuongXaList = paginatedResult?.data || []

    const columns = React.useMemo(() => phuongXaTSNColumns(), [])

    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    // Note: For server-side search, we sync search to URL instead of session storage
    const {
        initialFilters,
        initialSearch: _initialSearch,
        initialSorting,
        handleFiltersChange,
        handleSearchChange: _handleSearchChange,
        handleSortChange,
    } = useListViewFilters(module, [{ id: "tg_tao", desc: true }])
    
    // Override handleSearchChange to sync to URL
    const handleSearchChange = React.useCallback((newSearch: string) => {
        const newSearchParams = new URLSearchParams(searchParams)
        if (newSearch.trim()) {
            newSearchParams.set('search', newSearch.trim())
            newSearchParams.set('page', '1') // Reset to page 1 when searching
        } else {
            newSearchParams.delete('search')
        }
        setSearchParams(newSearchParams, { replace: true })
    }, [searchParams, setSearchParams])
    
    // Override handleFiltersChange to sync to URL and reset to page 1
    const handleFiltersChangeWithURL = React.useCallback((filters: any) => {
        handleFiltersChange(filters)
        const newSearchParams = new URLSearchParams(searchParams)
        if (filters.length > 0) {
            newSearchParams.set('filters', JSON.stringify(filters))
        } else {
            newSearchParams.delete('filters')
        }
        // Reset to page 1 when filters change
        newSearchParams.set('page', '1')
        setSearchParams(newSearchParams, { replace: true })
    }, [searchParams, setSearchParams, handleFiltersChange])
    
    // Get initial filters from URL if available
    const initialFiltersFromURL = React.useMemo(() => {
        const filtersParam = searchParams.get('filters')
        if (filtersParam) {
            try {
                return JSON.parse(filtersParam)
            } catch {
                return initialFilters
            }
        }
        return initialFilters
    }, [searchParams, initialFilters])
    
    // Use search term from URL as initial search
    const initialSearch = searchTerm

    // Generate filter options from ALL data (reference data), not just current page
    // This ensures filter options show all possible values from entire database
    const tinhThanhOptions = React.useMemo(() => {
        if (!allPhuongXa) return []
        const uniquePairs = new Map<string, { ma: string; ten: string }>()
        allPhuongXa.forEach((e) => {
            const ma = e.ma_tinh_thanh || ""
            const ten = e.ten_tinh_thanh || ""
            if (ma || ten) {
                const key = `${ma} - ${ten}`.trim()
                if (!uniquePairs.has(key)) {
                    uniquePairs.set(key, { ma, ten })
                }
            }
        })
        return Array.from(uniquePairs.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([combined]) => ({
                label: combined,
                value: combined,
            }))
    }, [allPhuongXa])

    const quanHuyenOptions = React.useMemo(() => {
        if (!allPhuongXa) return []
        const uniquePairs = new Map<string, { ma: string; ten: string }>()
        allPhuongXa.forEach((e) => {
            const ma = e.ma_quan_huyen || ""
            const ten = e.ten_quan_huyen || ""
            if (ma || ten) {
                const key = `${ma} - ${ten}`.trim()
                if (!uniquePairs.has(key)) {
                    uniquePairs.set(key, { ma, ten })
                }
            }
        })
        return Array.from(uniquePairs.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([combined]) => ({
                label: combined,
                value: combined,
            }))
    }, [allPhuongXa])

    // Build filters array with combined filters
    const filters = React.useMemo(() => {
        return [
            {
                columnId: "tinh_thanh",
                title: "Tỉnh Thành",
                options: tinhThanhOptions,
            },
            {
                columnId: "quan_huyen",
                title: "Quận Huyện",
                options: quanHuyenOptions,
            },
        ]
    }, [tinhThanhOptions, quanHuyenOptions])

    const handleAddNewClick = () => {
        if (onAddNew) {
            onAddNew()
        } else {
            navigate(`${phuongXaTSNConfig.routePath}/moi`)
        }
    }

    const handleEditClick = (id: number) => {
        if (onEdit) {
            onEdit(id)
        } else {
            navigate(`${phuongXaTSNConfig.routePath}/${id}/sua?returnTo=list`)
        }
    }

    const handleViewClick = (id: number) => {
        if (onView) {
            onView(id)
        } else {
            // Preserve page and pageSize in URL when navigating to detail
            const currentPage = searchParams.get('page') || '1'
            const currentPageSize = searchParams.get('pageSize') || '50'
            navigate(`${phuongXaTSNConfig.routePath}/${id}?page=${currentPage}&pageSize=${currentPageSize}`)
        }
    }
    
    // Handle pagination change - update URL
    const handlePaginationChange = React.useCallback((newPage: number, newPageSize: number) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('page', newPage.toString())
        newSearchParams.set('pageSize', newPageSize.toString())
        setSearchParams(newSearchParams, { replace: true })
    }, [searchParams, setSearchParams])

    const renderMobileCard = React.useCallback((row: PhuongXaTSN) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base text-foreground leading-tight truncate block">
                                {row.ten_phuong_xa}
                            </span>
                            <span className="text-sm text-muted-foreground font-mono">
                                {row.ma_phuong_xa}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.ten_quan_huyen && (
                        <p className="leading-snug">
                            Quận huyện: <span className="font-medium text-foreground">{row.ten_quan_huyen}</span>
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

    const getColumnTitle = React.useCallback((columnId: string) => {
        const column = columns.find((col) => {
            if (col.id === columnId) return true
            if ('accessorKey' in col && col.accessorKey === columnId) return true
            return false
        })
        return (column?.meta as { title?: string } | undefined)?.title || columnId
    }, [columns])

    const getCellValue = React.useCallback((row: PhuongXaTSN, columnId: string) => {
        const value = (row as any)[columnId]
        if (value === null || value === undefined) return "-"
        if (columnId === "tg_tao" || columnId === "tg_cap_nhat") {
            try {
                return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
                return "-"
            }
        }
        return String(value)
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
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-destructive mb-4">Có lỗi xảy ra khi tải danh sách phường xã TSN</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
            <GenericListView
                data={phuongXaList || []}
                columns={columns}
                module={module}
                onAdd={handleAddNewClick}
                addHref={`${phuongXaTSNConfig.routePath}/moi`}
                onEdit={(row: PhuongXaTSN) => handleEditClick(row.id!)}
                onDeleteSelected={async (selectedRows) => {
                    const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                    await batchDeleteMutation.mutateAsync(ids)
                    refetch()
                }}
                batchDeleteConfig={{
                    itemName: "phường xã TSN",
                    moduleName: phuongXaTSNConfig.moduleTitle,
                    isLoading: batchDeleteMutation.isPending,
                    getItemLabel: (item: PhuongXaTSN) => item.ten_phuong_xa || String(item.id),
                }}
                onImport={() => setImportDialogOpen(true)}
                isImporting={batchImportMutation.isPending}
                filters={filters}
                initialFilters={initialFiltersFromURL}
                initialSearch={initialSearch}
                initialSorting={initialSorting}
                onFiltersChange={handleFiltersChangeWithURL}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                serverSideSearch={{
                    enabled: true,
                    onSearchChange: handleSearchChange,
                    debounceMs: 300,
                }}
                renderMobileCard={renderMobileCard}
                searchFields={phuongXaTSNConfig.searchFields as (keyof PhuongXaTSN)[]}
                enableSuggestions={true}
                enableRangeSelection={true}
                enableLongPress={true}
                persistSelection={false}
                enableVirtualization={(phuongXaList?.length || 0) > 100}
                virtualRowHeight={60}
                exportOptions={{
                    columns: columns,
                    totalCount: phuongXaList?.length || 0,
                    moduleName: phuongXaTSNConfig.moduleTitle,
                    getColumnTitle,
                    getCellValue,
                }}
                onDelete={(row) => {
                    setRowToDelete(row)
                    setDeleteDialogOpen(true)
                }}
                onRowClick={(row) => handleViewClick(row.id!)}
                serverSidePagination={{
                    enabled: true,
                    pageCount: paginatedResult?.totalPages || 0,
                    total: paginatedResult?.total || 0,
                    isLoading: isLoading,
                    onPaginationChange: handlePaginationChange,
                }}
            />

            {/* Delete Confirmation Dialog for single row */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa phường xã TSN <strong>{rowToDelete?.ten_phuong_xa || rowToDelete?.id || "này"}</strong>? Hành động này không thể hoàn tác.
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
                                        refetch()
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
            <PhuongXaTSNImportDialog
                open={importDialogOpen}
                onOpenChange={(open) => {
                    setImportDialogOpen(open)
                    if (!open) {
                        refetch()
                    }
                }}
                mutation={batchImportMutation}
            />
        </>
    )
}

