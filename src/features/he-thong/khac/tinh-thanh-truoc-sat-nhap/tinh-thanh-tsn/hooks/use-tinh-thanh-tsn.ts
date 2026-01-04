"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { useReferenceQuery } from "@/lib/react-query/hooks"
import { useQuery } from "@tanstack/react-query"
import type { ColumnFiltersState } from "@tanstack/react-table"
import { tinhThanhTSN as tinhThanhTSNQueryKeys } from "@/lib/react-query/query-keys/tinh-thanh-tsn"
import { TinhThanhTSNAPI } from "../services/tinh-thanh-tsn.api"
import type { TinhThanhTSN } from "../schema"
import type { PaginationResult } from "@/lib/supabase-utils"

/**
 * Hook to fetch list of tỉnh thành TSN (all records - for backward compatibility)
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 * ⚠️ Note: For large datasets, consider using useTinhThanhTSNPaginated instead
 */
export const useTinhThanhTSN = createUseListQuery<TinhThanhTSN>({
    queryKeys: tinhThanhTSNQueryKeys,
    api: { getAll: TinhThanhTSNAPI.getAll },
})

/**
 * Hook to fetch tỉnh thành TSN for dropdowns/reference data
 * ⚡ Performance: Uses useReferenceQuery with longer cache (30 min staleTime, 60 min gcTime)
 * Use this for dropdowns, selects, filters, etc.
 * Loads all records once and caches them.
 */
export const useTinhThanhTSNForReference = () => {
    return useReferenceQuery<TinhThanhTSN[]>({
        queryKey: [...tinhThanhTSNQueryKeys.all(), 'reference'],
        queryFn: () => TinhThanhTSNAPI.getAll(),
    })
}

/**
 * Hook to fetch paginated tỉnh thành TSN (for server-side pagination in list views)
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of records per page
 * @param filters - Optional column filters (server-side filtering)
 * @returns Query result with pagination data
 */
export const useTinhThanhTSNPaginated = (
    page: number = 1, 
    pageSize: number = 50,
    filters?: ColumnFiltersState
) => {
    return useQuery<PaginationResult<TinhThanhTSN>, Error>({
        queryKey: [...tinhThanhTSNQueryKeys.all(), 'paginated', page, pageSize, filters],
        queryFn: () => TinhThanhTSNAPI.getPaginated(page, pageSize, filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    })
}

/**
 * Hook to search tỉnh thành TSN (for async select/dropdown)
 * @param searchTerm - Search term
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of records per page
 * @param enabled - Whether the query is enabled
 * @param filters - Optional: Additional column filters (server-side filtering)
 * @returns Query result with search results
 */
export const useTinhThanhTSNSearch = (
    searchTerm: string,
    page: number = 1,
    pageSize: number = 20,
    enabled: boolean = true,
    filters?: ColumnFiltersState
) => {
    return useQuery<PaginationResult<TinhThanhTSN>, Error>({
        queryKey: [...tinhThanhTSNQueryKeys.all(), 'search', searchTerm, page, pageSize, filters],
        queryFn: () => TinhThanhTSNAPI.search(searchTerm, page, pageSize, filters),
        enabled: enabled && searchTerm.trim().length > 0,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}

/**
 * Hook to fetch single tỉnh thành TSN by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useTinhThanhTSNById = createUseDetailQuery<TinhThanhTSN>({
    queryKeys: tinhThanhTSNQueryKeys,
    api: { getById: TinhThanhTSNAPI.getById },
})

