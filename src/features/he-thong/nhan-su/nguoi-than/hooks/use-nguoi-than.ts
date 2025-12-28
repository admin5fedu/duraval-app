"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { nguoiThanQueryKeys } from "@/lib/react-query/query-keys"
import { NguoiThanAPI } from "../services/nguoi-than.api"
import type { NguoiThan } from "../schema"

/**
 * Hook to fetch list of người thân
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useNguoiThan = createUseListQuery<NguoiThan>({
    queryKeys: nguoiThanQueryKeys,
    api: { getAll: NguoiThanAPI.getAll },
})

/**
 * Hook to fetch single người thân by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useNguoiThanById = createUseDetailQuery<NguoiThan>({
    queryKeys: nguoiThanQueryKeys,
    api: { getById: NguoiThanAPI.getById },
})
