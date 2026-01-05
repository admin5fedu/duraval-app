"use client"

import { XetDuyetCongNoAPI } from "../services/xet-duyet-cong-no.api"
import type { XetDuyetCongNo, CreateXetDuyetCongNoInput, UpdateXetDuyetCongNoInput } from "../schema"
import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { createMutationHooks } from "@/lib/react-query"

export const xetDuyetCongNoQueryKeys = {
  all: () => ["xet-duyet-cong-no"] as const,
  lists: () => [...xetDuyetCongNoQueryKeys.all(), "list"] as const,
  list: (filters?: string) => [...xetDuyetCongNoQueryKeys.lists(), { filters }] as const,
  details: () => [...xetDuyetCongNoQueryKeys.all(), "detail"] as const,
  detail: (id: string | number) => [...xetDuyetCongNoQueryKeys.details(), id] as const,
}

/**
 * Hook to get all xét duyệt công nợ
 */
export const useXetDuyetCongNo = createUseListQuery<XetDuyetCongNo>({
  queryKeys: xetDuyetCongNoQueryKeys,
  api: { getAll: XetDuyetCongNoAPI.getAll },
})

/**
 * Hook to get xét duyệt công nợ by ID
 */
export const useXetDuyetCongNoById = createUseDetailQuery<XetDuyetCongNo>({
  queryKeys: xetDuyetCongNoQueryKeys,
  api: { getById: XetDuyetCongNoAPI.getById },
})

/**
 * Mutation hooks for xét duyệt công nợ
 */
const mutations = createMutationHooks<XetDuyetCongNo, CreateXetDuyetCongNoInput, UpdateXetDuyetCongNoInput>({
  queryKeys: xetDuyetCongNoQueryKeys,
  api: XetDuyetCongNoAPI,
  messages: {
    createSuccess: "Thêm mới xét duyệt công nợ thành công",
    updateSuccess: "Cập nhật xét duyệt công nợ thành công",
    deleteSuccess: "Xóa xét duyệt công nợ thành công",
    batchDeleteSuccess: (count) => `Đã xóa ${count} xét duyệt công nợ thành công`,
  },
})

export const useCreateXetDuyetCongNo = mutations.useCreate
export const useUpdateXetDuyetCongNo = mutations.useUpdate
export const useDeleteXetDuyetCongNo = mutations.useDelete
export const useBatchDeleteXetDuyetCongNo = mutations.useBatchDelete

