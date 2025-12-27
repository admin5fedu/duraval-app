"use client"

import { useListQuery, useDetailQuery } from "@/lib/react-query/hooks"
import { phanQuyenQueryKeys } from "@/lib/react-query/query-keys"
import { PhanQuyenAPI } from "../services/phan-quyen.api"
import type { PhanQuyen } from "../schema"

/**
 * Hook to fetch list of permissions
 */
export function usePhanQuyen(initialData?: PhanQuyen[]) {
  return useListQuery({
    queryKey: phanQuyenQueryKeys.list(),
    queryFn: async () => {
      return await PhanQuyenAPI.getAll()
    },
    initialData: initialData,
  })
}

/**
 * Hook to fetch permissions by chuc_vu_id
 */
export function usePhanQuyenByChucVu(chucVuId: number | null, initialData?: PhanQuyen[]) {
  return useListQuery({
    queryKey: phanQuyenQueryKeys.byChucVu(chucVuId || 0),
    queryFn: async () => {
      if (!chucVuId) return []
      return await PhanQuyenAPI.getByChucVuId(chucVuId)
    },
    initialData: initialData,
    enabled: !!chucVuId,
  })
}

/**
 * Hook to fetch single permission by ID
 */
export function usePhanQuyenById(id: number, initialData?: PhanQuyen) {
  return useDetailQuery({
    queryKey: phanQuyenQueryKeys.detail(id),
    queryFn: async () => {
      return await PhanQuyenAPI.getById(id)
    },
    initialData: initialData,
    enabled: !!id,
  })
}

