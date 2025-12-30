"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { phanHoiKhachHangQueryKeys } from "@/lib/react-query/query-keys"
import { PhanHoiKhachHangAPI } from "../services/phan-hoi-khach-hang.api"
import type { PhanHoiKhachHang } from "../schema"

/**
 * Hook to fetch list of phản hồi khách hàng
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const usePhanHoiKhachHang = createUseListQuery<PhanHoiKhachHang>({
    queryKeys: phanHoiKhachHangQueryKeys,
    api: { getAll: PhanHoiKhachHangAPI.getAll },
})

/**
 * Hook to fetch single phản hồi khách hàng by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const usePhanHoiKhachHangById = createUseDetailQuery<PhanHoiKhachHang>({
    queryKeys: phanHoiKhachHangQueryKeys,
    api: { getById: PhanHoiKhachHangAPI.getById },
})

