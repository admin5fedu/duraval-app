"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { lichDangQueryKeys } from "@/lib/react-query/query-keys"
import { LichDangAPI } from "../services/lich-dang.api"
import type { LichDang } from "../schema"

/**
 * Hook to fetch list of lịch đăng
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useLichDang = createUseListQuery<LichDang>({
    queryKeys: lichDangQueryKeys,
    api: { getAll: LichDangAPI.getAll },
})

/**
 * Hook to fetch single lịch đăng by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useLichDangById = createUseDetailQuery<LichDang>({
    queryKeys: lichDangQueryKeys,
    api: { getById: LichDangAPI.getById },
})

