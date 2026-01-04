"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { useQuery } from "@tanstack/react-query"
import type { ColumnFiltersState } from "@tanstack/react-table"
import { quanHuyenTSN as quanHuyenTSNQueryKeys } from "@/lib/react-query/query-keys/quan-huyen-tsn"
import { QuanHuyenTSNAPI } from "../services/quan-huyen-tsn.api"
import type { QuanHuyenTSN } from "../schema"
import type { PaginationResult } from "@/lib/supabase-utils"

/**
 * Hook to fetch list of quận huyện TSN (all records - for backward compatibility)
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 * ⚠️ Note: For large datasets, consider using useQuanHuyenTSNPaginated instead
 */
export const useQuanHuyenTSN = createUseListQuery<QuanHuyenTSN>({
    queryKeys: quanHuyenTSNQueryKeys,
    api: { getAll: QuanHuyenTSNAPI.getAll },
})

/**
 * Hook to fetch all quận huyện TSN for reference data (dropdowns, filter options)
 * Uses longer cache time for better performance
 * ⚡ Use this for filter options and reference data, NOT for list views
 */
export const useQuanHuyenTSNForReference = () => {
    return useQuery<QuanHuyenTSN[], Error>({
        queryKey: [...quanHuyenTSNQueryKeys.all(), 'reference'],
        queryFn: () => QuanHuyenTSNAPI.getAll(),
        staleTime: 30 * 60 * 1000, // 30 minutes - longer cache for reference data
        gcTime: 60 * 60 * 1000, // 1 hour
    })
}

/**
 * Hook to fetch paginated quận huyện TSN (for server-side pagination in list views)
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of records per page
 * @param filters - Optional column filters (server-side filtering)
 * @returns Query result with pagination data
 */
export const useQuanHuyenTSNPaginated = (
    page: number = 1, 
    pageSize: number = 50,
    filters?: ColumnFiltersState
) => {
    return useQuery<PaginationResult<QuanHuyenTSN>, Error>({
        queryKey: [...quanHuyenTSNQueryKeys.all(), 'paginated', page, pageSize, filters],
        queryFn: () => QuanHuyenTSNAPI.getPaginated(page, pageSize, filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    })
}

/**
 * Hook to search quận huyện TSN (for async select/dropdown)
 * @param searchTerm - Search term
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of records per page
 * @param enabled - Whether the query is enabled
 * @param tinhThanhId - Optional: Filter by tỉnh thành ID (for cascade selects)
 * @param filters - Optional: Additional column filters (server-side filtering)
 * @returns Query result with search results
 */
export const useQuanHuyenTSNSearch = (
    searchTerm: string,
    page: number = 1,
    pageSize: number = 20,
    enabled: boolean = true,
    tinhThanhId?: number | null,
    filters?: ColumnFiltersState
) => {
    return useQuery<PaginationResult<QuanHuyenTSN>, Error>({
        queryKey: [...quanHuyenTSNQueryKeys.all(), 'search', searchTerm, page, pageSize, tinhThanhId, filters],
        queryFn: () => QuanHuyenTSNAPI.search(searchTerm, page, pageSize, tinhThanhId, filters),
        enabled: enabled && searchTerm.trim().length > 0,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}

/**
 * Hook to fetch single quận huyện TSN by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useQuanHuyenTSNById = createUseDetailQuery<QuanHuyenTSN>({
    queryKeys: quanHuyenTSNQueryKeys,
    api: { getById: QuanHuyenTSNAPI.getById },
})

/**
 * Hook to fetch quận huyện TSN by tỉnh thành ID
 * @param tinhThanhId - ID của tỉnh thành
 * @returns Query result with list of quận huyện TSN
 */
export const useQuanHuyenTSNByTinhThanhId = (tinhThanhId: number | null | undefined) => {
    return useQuery<QuanHuyenTSN[], Error>({
        queryKey: [...quanHuyenTSNQueryKeys.all(), 'byTinhThanhId', tinhThanhId],
        queryFn: () => {
            if (!tinhThanhId) return []
            return QuanHuyenTSNAPI.getByTinhThanhId(tinhThanhId)
        },
        enabled: !!tinhThanhId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    })
}

