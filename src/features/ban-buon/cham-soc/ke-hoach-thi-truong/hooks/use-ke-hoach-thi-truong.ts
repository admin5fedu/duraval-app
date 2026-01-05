"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { keHoachThiTruongQueryKeys } from "@/lib/react-query/query-keys"
import { KeHoachThiTruongAPI } from "../services/ke-hoach-thi-truong.api"
import type { KeHoachThiTruong } from "../schema"

/**
 * Hook to fetch list of kế hoạch thị trường
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useKeHoachThiTruong = createUseListQuery<KeHoachThiTruong>({
  queryKeys: keHoachThiTruongQueryKeys,
  api: { getAll: KeHoachThiTruongAPI.getAll },
})

/**
 * Hook to fetch single kế hoạch thị trường by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useKeHoachThiTruongById = createUseDetailQuery<KeHoachThiTruong>({
  queryKeys: keHoachThiTruongQueryKeys,
  api: { getById: KeHoachThiTruongAPI.getById },
})

