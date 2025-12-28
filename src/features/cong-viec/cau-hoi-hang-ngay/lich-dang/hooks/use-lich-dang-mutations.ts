"use client"

import { createMutationHooks } from "@/lib/react-query"
import { lichDangQueryKeys } from "@/lib/react-query/query-keys"
import { LichDangAPI } from "../services/lich-dang.api"
import type { LichDang } from "../schema"
import type { CreateLichDangInput, UpdateLichDangInput } from "../types"

/**
 * Mutation hooks for lịch đăng module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<LichDang, CreateLichDangInput, UpdateLichDangInput>({
    queryKeys: lichDangQueryKeys,
    api: LichDangAPI,
    messages: {
        createSuccess: "Thêm mới lịch đăng thành công",
        updateSuccess: "Cập nhật lịch đăng thành công",
        deleteSuccess: "Xóa lịch đăng thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} lịch đăng thành công`,
    },
})

export const useCreateLichDang = mutations.useCreate
export const useUpdateLichDang = mutations.useUpdate
export const useDeleteLichDang = mutations.useDelete
export const useBatchDeleteLichDang = mutations.useBatchDelete
