"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { useQuery } from "@tanstack/react-query"
import type { ColumnFiltersState } from "@tanstack/react-table"
import { phuongXaSNN as phuongXaSNNQueryKeys } from "@/lib/react-query/query-keys/phuong-xa-snn"
import { PhuongXaSNNAPI } from "../services/phuong-xa-snn.api"
import type { PhuongXaSNN } from "../schema"
import type { PaginationResult } from "@/lib/supabase-utils"

/**
 * Hook to fetch list of phường xã SNN (all records - for backward compatibility)
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 * ⚠️ Note: For large datasets, consider using usePhuongXaSNNPaginated instead
 */
export const usePhuongXaSNN = createUseListQuery<PhuongXaSNN>({
    queryKeys: phuongXaSNNQueryKeys,
    api: { getAll: PhuongXaSNNAPI.getAll },
})

/**
 * Hook to fetch all phường xã SNN for reference data (dropdowns, filter options)
 * Uses longer cache time for better performance
 * ⚡ Use this for filter options and reference data, NOT for list views
 */
export const usePhuongXaSNNForReference = () => {
    return useQuery<PhuongXaSNN[], Error>({
        queryKey: [...phuongXaSNNQueryKeys.all(), 'reference'],
        queryFn: () => PhuongXaSNNAPI.getAll(),
        staleTime: 30 * 60 * 1000, // 30 minutes - longer cache for reference data
        gcTime: 60 * 60 * 1000, // 1 hour
    })
}

/**
 * Hook to fetch paginated phường xã SNN (for server-side pagination in list views)
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of records per page
 * @param filters - Optional column filters (server-side filtering)
 * @returns Query result with pagination data
 */
export const usePhuongXaSNNPaginated = (
    page: number = 1, 
    pageSize: number = 50,
    filters?: ColumnFiltersState
) => {
    return useQuery<PaginationResult<PhuongXaSNN>, Error>({
        queryKey: [...phuongXaSNNQueryKeys.all(), 'paginated', page, pageSize, filters],
        queryFn: () => PhuongXaSNNAPI.getPaginated(page, pageSize, filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    })
}

/**
 * Hook to search phường xã SNN (for async select/dropdown)
 * @param searchTerm - Search term
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of records per page
 * @param enabled - Whether the query is enabled
 * @param tinhThanhId - Optional: Filter by tỉnh thành ID (for cascade selects)
 * @param filters - Optional: Additional column filters (server-side filtering)
 * @returns Query result with search results
 */
export const usePhuongXaSNNSearch = (
    searchTerm: string,
    page: number = 1,
    pageSize: number = 20,
    enabled: boolean = true,
    tinhThanhId?: number | null,
    filters?: ColumnFiltersState
) => {
    return useQuery<PaginationResult<PhuongXaSNN>, Error>({
        queryKey: [...phuongXaSNNQueryKeys.all(), 'search', searchTerm, page, pageSize, tinhThanhId, filters],
        queryFn: () => PhuongXaSNNAPI.search(searchTerm, page, pageSize, tinhThanhId, filters),
        enabled: enabled && searchTerm.trim().length > 0,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}

/**
 * Hook to fetch single phường xã SNN by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const usePhuongXaSNNById = createUseDetailQuery<PhuongXaSNN>({
    queryKeys: phuongXaSNNQueryKeys,
    api: { getById: PhuongXaSNNAPI.getById },
})

/**
 * Hook to fetch all phường xã SNN for a specific tỉnh thành ID (for embedded lists)
 * @param tinhThanhId - The ID of the parent tỉnh thành
 * @returns Query result with all PhuongXaSNN records for the given tinhThanhId
 */
export const usePhuongXaSNNByTinhThanhId = (tinhThanhId?: number | null) => {
    return useQuery<PhuongXaSNN[], Error>({
        queryKey: [...phuongXaSNNQueryKeys.all(), 'byTinhThanhId', tinhThanhId],
        queryFn: () => PhuongXaSNNAPI.getByTinhThanhId(tinhThanhId!),
        enabled: !!tinhThanhId, // Only run query if tinhThanhId is provided
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
    })
}

