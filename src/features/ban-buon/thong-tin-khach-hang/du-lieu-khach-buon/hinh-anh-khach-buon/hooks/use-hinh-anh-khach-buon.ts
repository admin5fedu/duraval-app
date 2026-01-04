"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { useQuery } from "@tanstack/react-query"
import { hinhAnhKhachBuonQueryKeys } from "@/lib/react-query/query-keys"
import { HinhAnhKhachBuonAPI } from "../services/hinh-anh-khach-buon.api"
import type { HinhAnhKhachBuon } from "../schema"

/**
 * Hook to fetch list of hình ảnh khách buôn
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useHinhAnhKhachBuon = createUseListQuery<HinhAnhKhachBuon>({
  queryKeys: hinhAnhKhachBuonQueryKeys,
  api: { getAll: HinhAnhKhachBuonAPI.getAll },
})

/**
 * Hook to fetch single hình ảnh khách buôn by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useHinhAnhKhachBuonById = createUseDetailQuery<HinhAnhKhachBuon>({
  queryKeys: hinhAnhKhachBuonQueryKeys,
  api: { getById: HinhAnhKhachBuonAPI.getById },
})

/**
 * Hook to fetch hình ảnh khách buôn by khach_buon_id
 */
export const useHinhAnhKhachBuonByKhachBuonId = (khachBuonId: number | null | undefined) => {
  return useQuery<HinhAnhKhachBuon[], Error>({
    queryKey: [...hinhAnhKhachBuonQueryKeys.all(), 'byKhachBuonId', khachBuonId],
    queryFn: () => {
      if (!khachBuonId) return []
      return HinhAnhKhachBuonAPI.getByKhachBuonId(khachBuonId)
    },
    enabled: !!khachBuonId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

