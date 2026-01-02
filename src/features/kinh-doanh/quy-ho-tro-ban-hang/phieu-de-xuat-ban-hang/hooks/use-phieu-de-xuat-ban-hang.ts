"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { phieuDeXuatBanHang as phieuDeXuatBanHangQueryKeys } from "@/lib/react-query/query-keys/phieu-de-xuat-ban-hang"
import { PhieuDeXuatBanHangAPI } from "../services/phieu-de-xuat-ban-hang.api"
import type { PhieuDeXuatBanHang } from "../schema"

/**
 * Hook to fetch list of records
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const usePhieuDeXuatBanHang = createUseListQuery<PhieuDeXuatBanHang>({
  queryKeys: phieuDeXuatBanHangQueryKeys,
  api: { getAll: PhieuDeXuatBanHangAPI.getAll },
})

/**
 * Hook to fetch single record by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const usePhieuDeXuatBanHangById = createUseDetailQuery<PhieuDeXuatBanHang>({
  queryKeys: phieuDeXuatBanHangQueryKeys,
  api: { getById: PhieuDeXuatBanHangAPI.getById },
})

