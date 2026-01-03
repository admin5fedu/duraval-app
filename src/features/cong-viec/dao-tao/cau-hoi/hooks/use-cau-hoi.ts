"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { cauHoi as cauHoiQueryKeys } from "@/lib/react-query/query-keys/cau-hoi"
import { CauHoiAPI } from "../services/cau-hoi.api"
import type { CauHoi } from "../schema"

/**
 * Hook to fetch list of câu hỏi
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useCauHoi = createUseListQuery<CauHoi>({
    queryKeys: cauHoiQueryKeys,
    api: { getAll: CauHoiAPI.getAll },
})

/**
 * Hook to fetch single câu hỏi by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useCauHoiById = createUseDetailQuery<CauHoi>({
    queryKeys: cauHoiQueryKeys,
    api: { getById: CauHoiAPI.getById },
})

