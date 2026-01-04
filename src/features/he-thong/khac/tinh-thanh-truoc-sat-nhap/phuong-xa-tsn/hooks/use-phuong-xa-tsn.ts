"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { useQuery } from "@tanstack/react-query"
import type { ColumnFiltersState } from "@tanstack/react-table"
import { phuongXaTSN as phuongXaTSNQueryKeys } from "@/lib/react-query/query-keys/phuong-xa-tsn"
import { PhuongXaTSNAPI } from "../services/phuong-xa-tsn.api"
import type { PhuongXaTSN } from "../schema"
import type { PaginationResult } from "@/lib/supabase-utils"

/**
 * Hook to fetch list of phường xã TSN (all records - for backward compatibility)
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 * ⚠️ Note: For large datasets, consider using usePhuongXaTSNPaginated instead
 */
export const usePhuongXaTSN = createUseListQuery<PhuongXaTSN>({
    queryKeys: phuongXaTSNQueryKeys,
    api: { getAll: PhuongXaTSNAPI.getAll },
})

/**
 * Hook to fetch all phường xã TSN for reference data (dropdowns, filter options)
 * Uses longer cache time for better performance
 * ⚡ Use this for filter options and reference data, NOT for list views
 */
export const usePhuongXaTSNForReference = () => {
    return useQuery<PhuongXaTSN[], Error>({
        queryKey: [...phuongXaTSNQueryKeys.all(), 'reference'],
        queryFn: () => PhuongXaTSNAPI.getAll(),
        staleTime: 30 * 60 * 1000, // 30 minutes - longer cache for reference data
        gcTime: 60 * 60 * 1000, // 1 hour
    })
}

/**
 * Hook to fetch paginated phường xã TSN (for server-side pagination in list views)
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of records per page
 * @param filters - Optional column filters (server-side filtering)
 * @returns Query result with pagination data
 */
export const usePhuongXaTSNPaginated = (
    page: number = 1, 
    pageSize: number = 50,
    filters?: ColumnFiltersState
) => {
    return useQuery<PaginationResult<PhuongXaTSN>, Error>({
        queryKey: [...phuongXaTSNQueryKeys.all(), 'paginated', page, pageSize, filters],
        queryFn: () => PhuongXaTSNAPI.getPaginated(page, pageSize, filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    })
}

/**
 * Hook to search phường xã TSN (for async select/dropdown)
 * @param searchTerm - Search term
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of records per page
 * @param enabled - Whether the query is enabled
 * @param quanHuyenId - Optional: Filter by quận huyện ID (for cascade selects)
 * @param filters - Optional: Additional column filters (server-side filtering)
 * @returns Query result with search results
 */
export const usePhuongXaTSNSearch = (
    searchTerm: string,
    page: number = 1,
    pageSize: number = 20,
    enabled: boolean = true,
    quanHuyenId?: number | null,
    filters?: ColumnFiltersState
) => {
    return useQuery<PaginationResult<PhuongXaTSN>, Error>({
        queryKey: [...phuongXaTSNQueryKeys.all(), 'search', searchTerm, page, pageSize, quanHuyenId, filters],
        queryFn: () => PhuongXaTSNAPI.search(searchTerm, page, pageSize, quanHuyenId, filters),
        enabled: enabled && searchTerm.trim().length > 0,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}

/**
 * Hook to fetch single phường xã TSN by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const usePhuongXaTSNById = createUseDetailQuery<PhuongXaTSN>({
    queryKeys: phuongXaTSNQueryKeys,
    api: { getById: PhuongXaTSNAPI.getById },
})

/**
 * Hook to fetch all phường xã TSN for a specific quận huyện ID (for embedded lists)
 * @param quanHuyenId - The ID of the parent quận huyện
 * @returns Query result with all PhuongXaTSN records for the given quanHuyenId
 */
export const usePhuongXaTSNByQuanHuyenId = (quanHuyenId?: number | null) => {
    return useQuery<PhuongXaTSN[], Error>({
        queryKey: [...phuongXaTSNQueryKeys.all(), 'byQuanHuyenId', quanHuyenId],
        queryFn: () => PhuongXaTSNAPI.getByQuanHuyenId(quanHuyenId!),
        enabled: !!quanHuyenId, // Only run query if quanHuyenId is provided
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
    })
}

