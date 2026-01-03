"use client"

import { createMutationHooks } from "@/lib/react-query"
import { chuyenDe as chuyenDeQueryKeys } from "@/lib/react-query/query-keys/chuyen-de"
import { ChuyenDeAPI } from "../services/chuyen-de.api"
import type { ChuyenDe } from "../schema"
import type { CreateChuyenDeInput, UpdateChuyenDeInput } from "../schema"

/**
 * Mutation hooks for chuyên đề module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<ChuyenDe, CreateChuyenDeInput, UpdateChuyenDeInput>({
    queryKeys: chuyenDeQueryKeys,
    api: ChuyenDeAPI,
    messages: {
        createSuccess: "Thêm mới chuyên đề thành công",
        updateSuccess: "Cập nhật chuyên đề thành công",
        deleteSuccess: "Xóa chuyên đề thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} chuyên đề thành công`,
    },
})

export const useCreateChuyenDe = mutations.useCreate
export const useUpdateChuyenDe = mutations.useUpdate
export const useDeleteChuyenDe = mutations.useDelete
export const useBatchDeleteChuyenDe = mutations.useBatchDelete

