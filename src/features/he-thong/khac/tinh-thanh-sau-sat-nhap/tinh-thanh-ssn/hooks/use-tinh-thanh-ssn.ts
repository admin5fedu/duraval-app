"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { useReferenceQuery } from "@/lib/react-query/hooks"
import { useQuery } from "@tanstack/react-query"
import type { ColumnFiltersState } from "@tanstack/react-table"
import { tinhThanhSSN as tinhThanhSSNQueryKeys } from "@/lib/react-query/query-keys/tinh-thanh-ssn"
import { TinhThanhSSNAPI } from "../services/tinh-thanh-ssn.api"
import type { TinhThanhSSN } from "../schema"
import type { PaginationResult } from "@/lib/supabase-utils"

/**
 * Hook to fetch list of tỉnh thành SSN (all records - for backward compatibility)
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 * ⚠️ Note: For large datasets, consider using useTinhThanhSSNPaginated instead
 */
export const useTinhThanhSSN = createUseListQuery<TinhThanhSSN>({
    queryKeys: tinhThanhSSNQueryKeys,
    api: { getAll: TinhThanhSSNAPI.getAll },
})

/**
 * Hook to fetch tỉnh thành SSN for dropdowns/reference data
 * ⚡ Performance: Uses useReferenceQuery with longer cache (30 min staleTime, 60 min gcTime)
 * Use this for dropdowns, selects, filters, etc.
 * Loads all records once and caches them.
 */
export const useTinhThanhSSNForReference = () => {
    return useReferenceQuery<TinhThanhSSN[]>({
        queryKey: [...tinhThanhSSNQueryKeys.all(), 'reference'],
        queryFn: () => TinhThanhSSNAPI.getAll(),
    })
}

/**
 * Hook to fetch paginated tỉnh thành SSN (for server-side pagination in list views)
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of records per page
 * @param filters - Optional column filters (server-side filtering)
 * @returns Query result with pagination data
 */
export const useTinhThanhSSNPaginated = (
    page: number = 1, 
    pageSize: number = 50,
    filters?: ColumnFiltersState
) => {
    return useQuery<PaginationResult<TinhThanhSSN>, Error>({
        queryKey: [...tinhThanhSSNQueryKeys.all(), 'paginated', page, pageSize, filters],
        queryFn: () => TinhThanhSSNAPI.getPaginated(page, pageSize, filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    })
}

/**
 * Hook to search tỉnh thành SSN (for async select/dropdown)
 * @param searchTerm - Search term
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of records per page
 * @param enabled - Whether the query is enabled
 * @param filters - Optional: Additional column filters (server-side filtering)
 * @returns Query result with search results
 */
export const useTinhThanhSSNSearch = (
    searchTerm: string,
    page: number = 1,
    pageSize: number = 20,
    enabled: boolean = true,
    filters?: ColumnFiltersState
) => {
    return useQuery<PaginationResult<TinhThanhSSN>, Error>({
        queryKey: [...tinhThanhSSNQueryKeys.all(), 'search', searchTerm, page, pageSize, filters],
        queryFn: () => TinhThanhSSNAPI.search(searchTerm, page, pageSize, filters),
        enabled: enabled && searchTerm.trim().length > 0,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
}

/**
 * Hook to fetch single tỉnh thành SSN by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useTinhThanhSSNById = createUseDetailQuery<TinhThanhSSN>({
    queryKeys: tinhThanhSSNQueryKeys,
    api: { getById: TinhThanhSSNAPI.getById },
})

