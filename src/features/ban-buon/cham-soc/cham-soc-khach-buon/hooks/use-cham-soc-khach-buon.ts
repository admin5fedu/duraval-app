"use client"

import { useQuery } from "@tanstack/react-query"
import { ChamSocKhachBuonAPI } from "../services/cham-soc-khach-buon.api"
import type { ChamSocKhachBuon, CreateChamSocKhachBuonInput, UpdateChamSocKhachBuonInput } from "../schema"
import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { createMutationHooks } from "@/lib/react-query"

export const chamSocKhachBuonQueryKeys = {
  all: () => ["cham-soc-khach-buon"] as const,
  lists: () => [...chamSocKhachBuonQueryKeys.all(), "list"] as const,
  list: (filters?: string) => [...chamSocKhachBuonQueryKeys.lists(), { filters }] as const,
  details: () => [...chamSocKhachBuonQueryKeys.all(), "detail"] as const,
  detail: (id: string | number) => [...chamSocKhachBuonQueryKeys.details(), id] as const,
}

/**
 * Hook to get all chăm sóc khách buôn
 */
export const useChamSocKhachBuon = createUseListQuery<ChamSocKhachBuon>({
  queryKeys: chamSocKhachBuonQueryKeys,
  api: { getAll: ChamSocKhachBuonAPI.getAll },
})

/**
 * Hook to get chăm sóc khách buôn by ID
 */
export const useChamSocKhachBuonById = createUseDetailQuery<ChamSocKhachBuon>({
  queryKeys: chamSocKhachBuonQueryKeys,
  api: { getById: ChamSocKhachBuonAPI.getById },
})

/**
 * Hook to get chăm sóc khách buôn by khach_buon_id
 */
export function useChamSocKhachBuonByKhachBuonId(khachBuonId: number | null | undefined) {
  return useQuery({
    queryKey: [...chamSocKhachBuonQueryKeys.all(), "by-khach-buon", khachBuonId],
    queryFn: () => {
      if (!khachBuonId) return Promise.resolve([])
      return ChamSocKhachBuonAPI.getByKhachBuonId(khachBuonId)
    },
    enabled: !!khachBuonId,
  })
}

/**
 * Mutation hooks for chăm sóc khách buôn
 */
const mutations = createMutationHooks<ChamSocKhachBuon, CreateChamSocKhachBuonInput, UpdateChamSocKhachBuonInput>({
  queryKeys: chamSocKhachBuonQueryKeys,
  api: ChamSocKhachBuonAPI,
  messages: {
    createSuccess: "Thêm mới chăm sóc khách buôn thành công",
    updateSuccess: "Cập nhật chăm sóc khách buôn thành công",
    deleteSuccess: "Xóa chăm sóc khách buôn thành công",
    batchDeleteSuccess: (count) => `Đã xóa ${count} chăm sóc khách buôn thành công`,
  },
})

export const useCreateChamSocKhachBuon = mutations.useCreate
export const useUpdateChamSocKhachBuon = mutations.useUpdate
export const useDeleteChamSocKhachBuon = mutations.useDelete
export const useBatchDeleteChamSocKhachBuon = mutations.useBatchDelete

