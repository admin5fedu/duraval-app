"use client"

import { useQuery } from "@tanstack/react-query"
import { mucDangKyQueryKeys } from "@/lib/react-query/query-keys"
import { MucDangKyAPI } from "../services/muc-dang-ky.api"
import type { MucDangKy } from "../schema"

/**
 * Hook to fetch list of mức đăng ký
 */
export function useMucDangKy(initialData?: MucDangKy[]) {
  return useQuery({
    queryKey: mucDangKyQueryKeys.list(),
    queryFn: () => MucDangKyAPI.getAll(),
    initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch single mức đăng ký by ID
 */
export function useMucDangKyById(id: number, initialData?: MucDangKy | null) {
  return useQuery({
    queryKey: mucDangKyQueryKeys.detail(id),
    queryFn: () => MucDangKyAPI.getById(id),
    enabled: !!id && id > 0,
    initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

