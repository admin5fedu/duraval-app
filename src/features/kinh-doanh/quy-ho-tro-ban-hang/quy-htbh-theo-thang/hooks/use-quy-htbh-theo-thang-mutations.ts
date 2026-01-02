"use client"

import { createMutationHooks } from "@/lib/react-query"
import { quyHTBHTheoThang as quyHTBHTheoThangQueryKeys } from "@/lib/react-query/query-keys/quy-htbh-theo-thang"
import { QuyHTBHTheoThangAPI } from "../services/quy-htbh-theo-thang.api"
import type { QuyHTBHTheoThang } from "../schema"
import type { CreateQuyHTBHTheoThangInput, UpdateQuyHTBHTheoThangInput } from "../schema"

/**
 * Mutation hooks for quỹ HTBH theo tháng module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<QuyHTBHTheoThang & { id?: number }, CreateQuyHTBHTheoThangInput, UpdateQuyHTBHTheoThangInput>({
  queryKeys: quyHTBHTheoThangQueryKeys,
  api: QuyHTBHTheoThangAPI,
  messages: {
    createSuccess: "Thêm mới quỹ HTBH theo tháng thành công",
    updateSuccess: "Cập nhật quỹ HTBH theo tháng thành công",
    deleteSuccess: "Xóa quỹ HTBH theo tháng thành công",
    batchDeleteSuccess: (count) => `Đã xóa ${count} quỹ HTBH theo tháng thành công`,
  },
})

export const useCreateQuyHTBHTheoThang = mutations.useCreate
export const useUpdateQuyHTBHTheoThang = mutations.useUpdate
export const useDeleteQuyHTBHTheoThang = mutations.useDelete
export const useBatchDeleteQuyHTBHTheoThang = mutations.useBatchDelete

