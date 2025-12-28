"use client"

import { createMutationHooks } from "@/lib/react-query"
import { capBacQueryKeys } from "@/lib/react-query/query-keys"
import { CapBacAPI } from "../services/cap-bac.api"
import type { CapBac } from "../schema"
import type { CreateCapBacInput, UpdateCapBacInput } from "../types"

/**
 * Mutation hooks for cấp bậc module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<CapBac, CreateCapBacInput, UpdateCapBacInput>({
    queryKeys: capBacQueryKeys,
    api: CapBacAPI,
    messages: {
        createSuccess: "Thêm mới cấp bậc thành công",
        updateSuccess: "Cập nhật cấp bậc thành công",
        deleteSuccess: "Xóa cấp bậc thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} cấp bậc thành công`,
    },
})

export const useCreateCapBac = mutations.useCreate
export const useUpdateCapBac = mutations.useUpdate
export const useDeleteCapBac = mutations.useDelete
export const useBatchDeleteCapBac = mutations.useBatchDelete
