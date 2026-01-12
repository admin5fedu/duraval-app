"use client"

import { useQuery } from "@tanstack/react-query"
import { XetDuyetKhachBuonAPI } from "../services/xet-duyet-khach-buon.api"
import type { XetDuyetKhachBuon, CreateXetDuyetKhachBuonInput, UpdateXetDuyetKhachBuonInput } from "../schema"
import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { createMutationHooks } from "@/lib/react-query"

export const xetDuyetKhachBuonQueryKeys = {
  all: () => ["xet-duyet-khach-buon"] as const,
  lists: () => [...xetDuyetKhachBuonQueryKeys.all(), "list"] as const,
  list: (filters?: string) => [...xetDuyetKhachBuonQueryKeys.lists(), { filters }] as const,
  details: () => [...xetDuyetKhachBuonQueryKeys.all(), "detail"] as const,
  detail: (id: string | number) => [...xetDuyetKhachBuonQueryKeys.details(), id] as const,
}

/**
 * Hook to get all xét duyệt khách buôn
 */
export const useXetDuyetKhachBuon = createUseListQuery<XetDuyetKhachBuon>({
  queryKeys: xetDuyetKhachBuonQueryKeys,
  api: { getAll: XetDuyetKhachBuonAPI.getAll },
})

/**
 * Hook to get xét duyệt khách buôn by ID
 */
export const useXetDuyetKhachBuonById = createUseDetailQuery<XetDuyetKhachBuon>({
  queryKeys: xetDuyetKhachBuonQueryKeys,
  api: { getById: XetDuyetKhachBuonAPI.getById },
})

/**
 * Hook to get xét duyệt khách buôn by khach_buon_id
 */
export function useXetDuyetKhachBuonByKhachBuonId(khachBuonId: number | null | undefined) {
  return useQuery({
    queryKey: [...xetDuyetKhachBuonQueryKeys.all(), "by-khach-buon", khachBuonId],
    queryFn: () => {
      if (!khachBuonId) return Promise.resolve([])
      return XetDuyetKhachBuonAPI.getByKhachBuonId(khachBuonId)
    },
    enabled: !!khachBuonId,
  })
}

/**
 * Mutation hooks for xét duyệt khách buôn
 */
const mutations = createMutationHooks<XetDuyetKhachBuon, CreateXetDuyetKhachBuonInput, UpdateXetDuyetKhachBuonInput>({
  queryKeys: xetDuyetKhachBuonQueryKeys,
  api: XetDuyetKhachBuonAPI,
  messages: {
    createSuccess: "Thêm mới xét duyệt khách buôn thành công",
    updateSuccess: "Cập nhật xét duyệt khách buôn thành công",
    deleteSuccess: "Xóa xét duyệt khách buôn thành công",
    batchDeleteSuccess: (count) => `Đã xóa ${count} xét duyệt khách buôn thành công`,
  },
})

export const useCreateXetDuyetKhachBuon = mutations.useCreate
export const useUpdateXetDuyetKhachBuon = mutations.useUpdate
export const useDeleteXetDuyetKhachBuon = mutations.useDelete
export const useBatchDeleteXetDuyetKhachBuon = mutations.useBatchDelete

