"use client"

import { useQuery } from "@tanstack/react-query"
import { chuyenDe as chuyenDeQueryKeys } from "@/lib/react-query/query-keys/chuyen-de"
import { ChuyenDeAPI } from "../services/chuyen-de.api"
import type { ChuyenDe } from "../schema"

/**
 * Hook to fetch chuyên đề by nhom_chuyen_de_id
 */
export function useChuyenDeByNhomChuyenDeId(nhomChuyenDeId: number | undefined) {
  return useQuery<ChuyenDe[]>({
    queryKey: [...chuyenDeQueryKeys.all(), "by-nhom", nhomChuyenDeId],
    queryFn: () => {
      if (!nhomChuyenDeId) {
        return Promise.resolve([])
      }
      return ChuyenDeAPI.getByNhomChuyenDeId(nhomChuyenDeId)
    },
    enabled: !!nhomChuyenDeId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

