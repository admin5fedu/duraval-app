"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { baiThi as baiThiQueryKeys } from "@/lib/react-query/query-keys/bai-thi"
import { BaiThiAPI } from "../services/bai-thi.api"
import type { BaiThi } from "../schema"

/**
 * Hook to fetch list of bài thi
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useBaiThi = createUseListQuery<BaiThi>({
    queryKeys: baiThiQueryKeys,
    api: { getAll: BaiThiAPI.getAll },
})

/**
 * Hook to fetch single bài thi by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useBaiThiById = createUseDetailQuery<BaiThi>({
    queryKeys: baiThiQueryKeys,
    api: { getById: BaiThiAPI.getById },
})

