"use client"

import { createMutationHooks } from "@/lib/react-query"
import { nguoiThanQueryKeys } from "@/lib/react-query/query-keys"
import { NguoiThanAPI } from "../services/nguoi-than.api"
import type { NguoiThan } from "../schema"
import type { CreateNguoiThanInput, UpdateNguoiThanInput } from "../types"

/**
 * Mutation hooks for người thân module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<NguoiThan, CreateNguoiThanInput, UpdateNguoiThanInput>({
    queryKeys: nguoiThanQueryKeys,
    api: NguoiThanAPI,
    messages: {
        createSuccess: "Thêm mới người thân thành công",
        updateSuccess: "Cập nhật người thân thành công",
        deleteSuccess: "Xóa người thân thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} người thân thành công`,
    },
})

export const useCreateNguoiThan = mutations.useCreate
export const useUpdateNguoiThan = mutations.useUpdate
export const useDeleteNguoiThan = mutations.useDelete
export const useBatchDeleteNguoiThan = mutations.useBatchDelete
