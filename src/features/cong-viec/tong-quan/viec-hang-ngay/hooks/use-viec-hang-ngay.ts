"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { viecHangNgayQueryKeys } from "@/lib/react-query/query-keys"
import { ViecHangNgayAPI } from "../services/viec-hang-ngay.api"
import type { ViecHangNgay } from "../schema"

/**
 * Hook to fetch list of việc hàng ngày
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useViecHangNgay = createUseListQuery<ViecHangNgay>({
    queryKeys: viecHangNgayQueryKeys,
    api: { getAll: ViecHangNgayAPI.getAll },
})

/**
 * Hook to fetch single việc hàng ngày by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useViecHangNgayById = createUseDetailQuery<ViecHangNgay>({
    queryKeys: viecHangNgayQueryKeys,
    api: { getById: ViecHangNgayAPI.getById },
})
