"use client"

import { createUseListQuery, createUseDetailQuery, useListQuery } from "@/lib/react-query"
import { phanQuyenQueryKeys } from "@/lib/react-query/query-keys"
import { PhanQuyenAPI } from "../services/phan-quyen.api"
import type { PhanQuyen } from "../schema"

/**
 * Hook to fetch list of permissions
 */
export const usePhanQuyen = createUseListQuery<PhanQuyen>({
    queryKeys: phanQuyenQueryKeys,
    api: { getAll: PhanQuyenAPI.getAll },
})

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
export const usePhanQuyenById = createUseDetailQuery<PhanQuyen>({
    queryKeys: phanQuyenQueryKeys,
    api: { getById: PhanQuyenAPI.getById },
})
