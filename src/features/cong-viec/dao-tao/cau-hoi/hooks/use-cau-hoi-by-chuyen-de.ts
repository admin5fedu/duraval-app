"use client"

import { useQuery } from "@tanstack/react-query"
import { cauHoi as cauHoiQueryKeys } from "@/lib/react-query/query-keys/cau-hoi"
import { CauHoiAPI } from "../services/cau-hoi.api"
import type { CauHoi } from "../schema"

/**
 * Hook to fetch câu hỏi by chuyen_de_id
 */
export function useCauHoiByChuyenDeId(chuyenDeId: number | undefined) {
  return useQuery<CauHoi[]>({
    queryKey: [...cauHoiQueryKeys.all(), "by-chuyen-de", chuyenDeId],
    queryFn: () => {
      if (!chuyenDeId) {
        return Promise.resolve([])
      }
      return CauHoiAPI.getByChuyenDeId(chuyenDeId)
    },
    enabled: !!chuyenDeId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

