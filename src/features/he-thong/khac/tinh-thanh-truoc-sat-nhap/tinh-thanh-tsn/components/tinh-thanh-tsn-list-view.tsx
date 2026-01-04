"use client"

import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericListView } from "@/shared/components/data-display/generic-list-view/generic-list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { TinhThanhTSN } from "../schema"
import { useTinhThanhTSNPaginated, useTinhThanhTSNSearch, useBatchDeleteTinhThanhTSN, useDeleteTinhThanhTSN } from "../hooks"
import { tinhThanhTSNColumns } from "./tinh-thanh-tsn-columns"
import { tinhThanhTSNConfig } from "../config"
import { useListViewFilters } from "@/shared/hooks/use-list-view-filters"
import { useBatchUpsertTinhThanhTSN } from "../actions/tinh-thanh-tsn-excel-actions"
import { TinhThanhTSNImportDialog } from "./tinh-thanh-tsn-import-dialog"
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

interface TinhThanhTSNListViewProps {
    initialData?: TinhThanhTSN[]
    onEdit?: (id: number) => void
    onAddNew?: () => void
    onView?: (id: number) => void
}

export function TinhThanhTSNListView({ 
    onEdit,
    onAddNew,
    onView,
}: TinhThanhTSNListViewProps = {}) {
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
    const paginatedQuery = useTinhThanhTSNPaginated(page, pageSize, filtersFromURL)
    const searchQuery = useTinhThanhTSNSearch(
        searchTerm, 
        page, 
        pageSize, 
        !!searchTerm && searchTerm.trim().length > 0,
        filtersFromURL
    )
    
    // Use search results if search term exists, otherwise use paginated results
    const isSearchMode = !!searchTerm && searchTerm.trim().length > 0
    const activeQuery = isSearchMode ? searchQuery : paginatedQuery
    const { data: paginatedResult, isLoading, isError, refetch } = activeQuery
    
    const batchDeleteMutation = useBatchDeleteTinhThanhTSN()
    const deleteMutation = useDeleteTinhThanhTSN()
    const batchImportMutation = useBatchUpsertTinhThanhTSN()
    const module = tinhThanhTSNConfig.moduleName
    const [importDialogOpen, setImportDialogOpen] = React.useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [rowToDelete, setRowToDelete] = React.useState<TinhThanhTSN | null>(null)
    
    // Extract data from paginated result
    const tinhThanhList = paginatedResult?.data || []

    // Create columns
    const columns = React.useMemo(() => {
        return tinhThanhTSNColumns()
    }, [])

    // ✅ Session Storage Pattern: Sử dụng custom hook để quản lý filters
    // Note: For server-side search, we sync search to URL instead of session storage
    const {
        initialFilters,
        initialSearch: _initialSearch, // Ignore session storage search, use URL instead
        initialSorting,
        handleFiltersChange,
        handleSearchChange: _handleSearchChange, // We'll override this
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
    
    // Get initial filters from URL if available, otherwise use session storage
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

    // Build filters array from config
    const filters = React.useMemo(() => {
        return tinhThanhTSNConfig.filterColumns || []
    }, [])

    const handleAddNewClick = () => {
        if (onAddNew) {
            onAddNew()
        } else {
            navigate(`${tinhThanhTSNConfig.routePath}/moi`)
        }
    }

    const handleEditClick = (id: number) => {
        if (onEdit) {
            onEdit(id)
        } else {
            navigate(`${tinhThanhTSNConfig.routePath}/${id}/sua`)
        }
    }

    const handleViewClick = (id: number) => {
        if (onView) {
            onView(id)
        } else {
            // Preserve page, pageSize, search, and filters in URL when navigating to detail
            const currentPage = searchParams.get('page') || '1'
            const currentPageSize = searchParams.get('pageSize') || '50'
            const currentSearch = searchParams.get('search') || ''
            const currentFilters = searchParams.get('filters') || ''
            
            const queryParams = new URLSearchParams()
            queryParams.set('page', currentPage)
            queryParams.set('pageSize', currentPageSize)
            if (currentSearch) queryParams.set('search', currentSearch)
            if (currentFilters) queryParams.set('filters', currentFilters)
            
            navigate(`${tinhThanhTSNConfig.routePath}/${id}?${queryParams.toString()}`)
        }
    }
    
    // Handle pagination change - update URL
    const handlePaginationChange = React.useCallback((newPage: number, newPageSize: number) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('page', newPage.toString())
        newSearchParams.set('pageSize', newPageSize.toString())
        setSearchParams(newSearchParams, { replace: true })
    }, [searchParams, setSearchParams])

    // Mobile card renderer
    const renderMobileCard = React.useCallback((row: TinhThanhTSN) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                {/* Thông tin chính */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0 flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-base text-foreground leading-tight truncate block">
                                {row.ten_tinh_thanh}
                            </span>
                            <span className="text-sm text-muted-foreground font-mono">
                                {row.ma_tinh_thanh}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Thông tin phụ */}
                <div className="space-y-1 text-xs text-muted-foreground">
                    {row.mien && (
                        <p className="leading-snug">
                            Miền: <span className="font-medium text-foreground">{row.mien}</span>
                        </p>
                    )}
                    {row.vung && (
                        <p className="leading-snug">
                            Vùng: <span className="font-medium text-foreground">{row.vung}</span>
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

    const getCellValue = React.useCallback((row: TinhThanhTSN, columnId: string) => {
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
                <p className="text-destructive mb-4">Lỗi khi tải danh sách tỉnh thành TSN</p>
                <Button onClick={() => refetch()}>Thử lại</Button>
            </div>
        )
    }

    return (
        <>
            <GenericListView
                data={tinhThanhList || []}
                columns={columns}
                filterColumn="ten_tinh_thanh"
                module={module}
                searchFields={tinhThanhTSNConfig.searchFields as (keyof TinhThanhTSN)[]}
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
                onDeleteSelected={async (selectedRows) => {
                    const ids = selectedRows.map((row) => row.id!).filter((id): id is number => id !== undefined)
                    await batchDeleteMutation.mutateAsync(ids)
                    refetch()
                }}
                batchDeleteConfig={{
                    itemName: "tỉnh thành TSN",
                    moduleName: tinhThanhTSNConfig.moduleTitle,
                    isLoading: batchDeleteMutation.isPending,
                    getItemLabel: (item: TinhThanhTSN) => item.ten_tinh_thanh || String(item.id),
                }}
                onImport={() => setImportDialogOpen(true)}
                isImporting={batchImportMutation.isPending}
                onAdd={handleAddNewClick}
                addHref={`${tinhThanhTSNConfig.routePath}/moi`}
                onBack={() => {
                    navigate(tinhThanhTSNConfig.parentPath)
                }}
                enableSuggestions={true}
                enableRangeSelection={true}
                enableLongPress={true}
                persistSelection={false}
                renderMobileCard={renderMobileCard}
                enableVirtualization={(tinhThanhList?.length || 0) > 100}
                virtualRowHeight={60}
                exportOptions={{
                    columns: columns,
                    totalCount: tinhThanhList?.length || 0,
                    moduleName: tinhThanhTSNConfig.moduleTitle,
                    getColumnTitle,
                    getCellValue,
                }}
                onEdit={(row) => handleEditClick(row.id!)}
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa tỉnh thành TSN <strong>{rowToDelete?.ten_tinh_thanh || rowToDelete?.id || "này"}</strong>? Hành động này không thể hoàn tác.
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
            <TinhThanhTSNImportDialog
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

