"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { chucVuQueryKeys } from "@/lib/react-query/query-keys"
import { ChucVuAPI } from "../services/chuc-vu.api"
import type { ChucVu } from "../schema"

/**
 * Hook to fetch list of chức vụ
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useChucVu = createUseListQuery<ChucVu>({
    queryKeys: chucVuQueryKeys,
    api: { getAll: ChucVuAPI.getAll },
})

/**
 * Hook to fetch single chức vụ by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useChucVuById = createUseDetailQuery<ChucVu>({
    queryKeys: chucVuQueryKeys,
    api: { getById: ChucVuAPI.getById },
})
