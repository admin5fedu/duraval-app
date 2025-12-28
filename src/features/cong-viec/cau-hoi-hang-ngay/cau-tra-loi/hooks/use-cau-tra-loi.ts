"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { cauTraLoiQueryKeys } from "@/lib/react-query/query-keys"
import { CauTraLoiAPI } from "../services/cau-tra-loi.api"
import type { CauTraLoi } from "../schema"

/**
 * Hook to fetch list of câu trả lời
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useCauTraLoi = createUseListQuery<CauTraLoi>({
    queryKeys: cauTraLoiQueryKeys,
    api: { getAll: CauTraLoiAPI.getAll },
})

/**
 * Hook to fetch single câu trả lời by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useCauTraLoiById = createUseDetailQuery<CauTraLoi>({
    queryKeys: cauTraLoiQueryKeys,
    api: { getById: CauTraLoiAPI.getById },
})

