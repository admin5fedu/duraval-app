"use client"

import * as React from "react"
import { useSearchParams } from "react-router-dom"
import type { ColumnFiltersState } from "@tanstack/react-table"
import type { PaginationResult } from "@/lib/supabase-utils"
import type { UseQueryResult } from "@tanstack/react-query"

/**
 * Configuration for server-side list view hook
 */
export interface UseServerSideListViewConfig<TData> {
    /**
     * Hook to fetch paginated data
     */
    usePaginated: (page: number, pageSize: number, filters?: ColumnFiltersState) => UseQueryResult<PaginationResult<TData>, Error>
    
    /**
     * Hook to search data
     */
    useSearch: (
        searchTerm: string,
        page: number,
        pageSize: number,
        enabled: boolean,
        ...additionalParams: any[]
    ) => UseQueryResult<PaginationResult<TData>, Error>
    
    /**
     * Optional: Hook to fetch all data for filter options (reference data)
     * If provided, filter options will be generated from all data, not just current page
     */
    useForReference?: () => UseQueryResult<TData[], Error>
    
    /**
     * Optional: Additional parameters to pass to useSearch hook
     * (e.g., parentId for cascade selects)
     */
    searchAdditionalParams?: any[]
}

/**
 * Return type for useServerSideListView hook
 */
export interface UseServerSideListViewReturn<TData> {
    // Data
    data: TData[]
    isLoading: boolean
    isError: boolean
    refetch: () => void
    
    // Pagination
    page: number
    pageSize: number
    total: number
    totalPages: number
    handlePaginationChange: (newPage: number, newPageSize: number) => void
    
    // Search
    searchTerm: string
    handleSearchChange: (newSearch: string) => void
    
    // Filters
    filters: ColumnFiltersState
    handleFiltersChange: (newFilters: ColumnFiltersState) => void
    initialFiltersFromURL: ColumnFiltersState
    
    // Reference data for filter options
    allData?: TData[]
}

/**
 * Generic hook for server-side pagination, search, and filtering
 * 
 * Handles:
 * - URL synchronization (page, pageSize, search, filters)
 * - Server-side filtering
 * - Loading reference data for filter options
 * - Resetting to page 1 when filters/search change
 * 
 * @example
 * ```ts
 * const {
 *   data,
 *   isLoading,
 *   page,
 *   handlePaginationChange,
 *   handleSearchChange,
 *   handleFiltersChange,
 *   allData
 * } = useServerSideListView({
 *   usePaginated: usePhuongXaTSNPaginated,
 *   useSearch: usePhuongXaTSNSearch,
 *   useForReference: usePhuongXaTSNForReference,
 * })
 * ```
 */
export function useServerSideListView<TData>(
    config: UseServerSideListViewConfig<TData>
): UseServerSideListViewReturn<TData> {
    const [searchParams, setSearchParams] = useSearchParams()
    
    // Get page, pageSize, search, and filters from URL
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
    
    // Load reference data for filter options (if hook provided)
    const referenceQuery = config.useForReference?.()
    const allData = referenceQuery?.data
    
    // Server-side pagination/search hooks with filters
    const paginatedQuery = config.usePaginated(page, pageSize, filtersFromURL)
    const searchQuery = config.useSearch(
        searchTerm,
        page,
        pageSize,
        !!searchTerm && searchTerm.trim().length > 0,
        ...(config.searchAdditionalParams || [])
    )
    
    // Use search results if search term exists, otherwise use paginated results
    const isSearchMode = !!searchTerm && searchTerm.trim().length > 0
    const activeQuery = isSearchMode ? searchQuery : paginatedQuery
    
    const { data: paginatedResult, isLoading, isError, refetch } = activeQuery
    const data = paginatedResult?.data || []
    const total = paginatedResult?.total || 0
    const totalPages = paginatedResult?.totalPages || 1
    
    // Handle pagination change - update URL
    const handlePaginationChange = React.useCallback((newPage: number, newPageSize: number) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('page', newPage.toString())
        newSearchParams.set('pageSize', newPageSize.toString())
        setSearchParams(newSearchParams, { replace: true })
    }, [searchParams, setSearchParams])
    
    // Handle search change - update URL and reset to page 1
    const handleSearchChange = React.useCallback((newSearch: string) => {
        const newSearchParams = new URLSearchParams(searchParams)
        if (newSearch.trim()) {
            newSearchParams.set('search', newSearch.trim())
        } else {
            newSearchParams.delete('search')
        }
        // Reset to page 1 when searching
        newSearchParams.set('page', '1')
        setSearchParams(newSearchParams, { replace: true })
    }, [searchParams, setSearchParams])
    
    // Handle filters change - update URL and reset to page 1
    const handleFiltersChange = React.useCallback((newFilters: ColumnFiltersState) => {
        const newSearchParams = new URLSearchParams(searchParams)
        if (newFilters.length > 0) {
            newSearchParams.set('filters', JSON.stringify(newFilters))
        } else {
            newSearchParams.delete('filters')
        }
        // Reset to page 1 when filters change
        newSearchParams.set('page', '1')
        setSearchParams(newSearchParams, { replace: true })
    }, [searchParams, setSearchParams])
    
    return {
        data,
        isLoading,
        isError,
        refetch,
        page,
        pageSize,
        total,
        totalPages,
        handlePaginationChange,
        searchTerm,
        handleSearchChange,
        filters: filtersFromURL,
        handleFiltersChange,
        initialFiltersFromURL: filtersFromURL,
        allData,
    }
}

