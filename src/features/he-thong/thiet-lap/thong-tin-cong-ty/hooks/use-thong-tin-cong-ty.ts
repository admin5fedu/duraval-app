"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { thongTinCongTyQueryKeys } from "@/lib/react-query/query-keys"
import { ThongTinCongTyAPI } from "../services/thong-tin-cong-ty.api"
import type { ThongTinCongTy } from "../schema"

/**
 * Hook to fetch list of thông tin công ty
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useThongTinCongTy = createUseListQuery<ThongTinCongTy>({
    queryKeys: thongTinCongTyQueryKeys,
    api: { getAll: ThongTinCongTyAPI.getAll },
})

/**
 * Hook to fetch single thông tin công ty by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useThongTinCongTyById = createUseDetailQuery<ThongTinCongTy>({
    queryKeys: thongTinCongTyQueryKeys,
    api: { getById: ThongTinCongTyAPI.getById },
})
