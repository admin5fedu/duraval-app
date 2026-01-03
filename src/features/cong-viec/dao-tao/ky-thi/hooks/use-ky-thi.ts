"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { kyThi as kyThiQueryKeys } from "@/lib/react-query/query-keys/ky-thi"
import { KyThiAPI } from "../services/ky-thi.api"
import type { KyThi } from "../schema"

/**
 * Hook to fetch list of kỳ thi
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useKyThi = createUseListQuery<KyThi>({
    queryKeys: kyThiQueryKeys,
    api: { getAll: KyThiAPI.getAll },
})

/**
 * Hook to fetch single kỳ thi by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useKyThiById = createUseDetailQuery<KyThi>({
    queryKeys: kyThiQueryKeys,
    api: { getById: KyThiAPI.getById },
})

