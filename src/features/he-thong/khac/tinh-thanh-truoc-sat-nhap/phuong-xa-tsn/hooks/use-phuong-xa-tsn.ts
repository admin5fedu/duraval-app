"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { phuongXaTSN as phuongXaTSNQueryKeys } from "@/lib/react-query/query-keys/phuong-xa-tsn"
import { PhuongXaTSNAPI } from "../services/phuong-xa-tsn.api"
import type { PhuongXaTSN } from "../schema"

/**
 * Hook to fetch list of phường xã TSN
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const usePhuongXaTSN = createUseListQuery<PhuongXaTSN>({
    queryKeys: phuongXaTSNQueryKeys,
    api: { getAll: PhuongXaTSNAPI.getAll },
})

/**
 * Hook to fetch single phường xã TSN by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const usePhuongXaTSNById = createUseDetailQuery<PhuongXaTSN>({
    queryKeys: phuongXaTSNQueryKeys,
    api: { getById: PhuongXaTSNAPI.getById },
})

