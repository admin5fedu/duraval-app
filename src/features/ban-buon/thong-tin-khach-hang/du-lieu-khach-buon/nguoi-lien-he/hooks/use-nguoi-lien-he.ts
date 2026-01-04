"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { useQuery } from "@tanstack/react-query"
import { nguoiLienHeQueryKeys } from "@/lib/react-query/query-keys"
import { NguoiLienHeAPI } from "../services/nguoi-lien-he.api"
import type { NguoiLienHe } from "../schema"

/**
 * Hook to fetch list of người liên hệ
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useNguoiLienHe = createUseListQuery<NguoiLienHe>({
  queryKeys: nguoiLienHeQueryKeys,
  api: { getAll: NguoiLienHeAPI.getAll },
})

/**
 * Hook to fetch single người liên hệ by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useNguoiLienHeById = createUseDetailQuery<NguoiLienHe>({
  queryKeys: nguoiLienHeQueryKeys,
  api: { getById: NguoiLienHeAPI.getById },
})

/**
 * Hook to fetch người liên hệ by khach_buon_id
 */
export const useNguoiLienHeByKhachBuonId = (khachBuonId: number | null | undefined) => {
  return useQuery<NguoiLienHe[], Error>({
    queryKey: [...nguoiLienHeQueryKeys.all(), 'byKhachBuonId', khachBuonId],
    queryFn: () => {
      if (!khachBuonId) return []
      return NguoiLienHeAPI.getByKhachBuonId(khachBuonId)
    },
    enabled: !!khachBuonId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

