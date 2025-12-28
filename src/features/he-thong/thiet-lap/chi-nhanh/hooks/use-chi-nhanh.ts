"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { chiNhanhQueryKeys } from "@/lib/react-query/query-keys"
import { ChiNhanhAPI } from "../services/chi-nhanh.api"
import type { ChiNhanh } from "../schema"

/**
 * Hook to fetch list of chi nhánh
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useChiNhanh = createUseListQuery<ChiNhanh>({
    queryKeys: chiNhanhQueryKeys,
    api: { getAll: ChiNhanhAPI.getAll },
})

/**
 * Hook to fetch single chi nhánh by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useChiNhanhById = createUseDetailQuery<ChiNhanh>({
    queryKeys: chiNhanhQueryKeys,
    api: { getById: ChiNhanhAPI.getById },
})
