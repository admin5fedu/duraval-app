"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { capBacQueryKeys } from "@/lib/react-query/query-keys"
import { CapBacAPI } from "../services/cap-bac.api"
import type { CapBac } from "../schema"

/**
 * Hook to fetch list of cấp bậc
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useCapBac = createUseListQuery<CapBac>({
    queryKeys: capBacQueryKeys,
    api: { getAll: CapBacAPI.getAll },
})

/**
 * Hook to fetch single cấp bậc by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useCapBacById = createUseDetailQuery<CapBac>({
    queryKeys: capBacQueryKeys,
    api: { getById: CapBacAPI.getById },
})
