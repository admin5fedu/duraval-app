"use client"

import { createMutationHooks } from "@/lib/react-query"
import { kyThi as kyThiQueryKeys } from "@/lib/react-query/query-keys/ky-thi"
import { KyThiAPI } from "../services/ky-thi.api"
import type { KyThi } from "../schema"
import type { CreateKyThiInput, UpdateKyThiInput } from "../schema"

/**
 * Mutation hooks for kỳ thi module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<KyThi, CreateKyThiInput, UpdateKyThiInput>({
    queryKeys: kyThiQueryKeys,
    api: KyThiAPI,
    messages: {
        createSuccess: "Thêm mới kỳ thi thành công",
        updateSuccess: "Cập nhật kỳ thi thành công",
        deleteSuccess: "Xóa kỳ thi thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} kỳ thi thành công`,
    },
})

export const useCreateKyThi = mutations.useCreate
export const useUpdateKyThi = mutations.useUpdate
export const useDeleteKyThi = mutations.useDelete
export const useBatchDeleteKyThi = mutations.useBatchDelete

