"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { taiLieuBieuMauQueryKeys } from "@/lib/react-query/query-keys"
import { TaiLieuBieuMauAPI } from "../services/tai-lieu-bieu-mau.api"
import type { TaiLieuBieuMau } from "../schema"

/**
 * Hook to fetch list of tài liệu & biểu mẫu
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useTaiLieuBieuMau = createUseListQuery<TaiLieuBieuMau>({
    queryKeys: taiLieuBieuMauQueryKeys,
    api: { getAll: TaiLieuBieuMauAPI.getAll },
})

/**
 * Hook to fetch single tài liệu & biểu mẫu by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useTaiLieuBieuMauById = createUseDetailQuery<TaiLieuBieuMau>({
    queryKeys: taiLieuBieuMauQueryKeys,
    api: { getById: TaiLieuBieuMauAPI.getById },
})

