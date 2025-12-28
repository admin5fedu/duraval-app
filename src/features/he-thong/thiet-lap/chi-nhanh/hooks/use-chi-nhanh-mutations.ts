"use client"

import { createMutationHooks } from "@/lib/react-query"
import { chiNhanhQueryKeys } from "@/lib/react-query/query-keys"
import { ChiNhanhAPI } from "../services/chi-nhanh.api"
import type { ChiNhanh } from "../schema"
import type { CreateChiNhanhInput, UpdateChiNhanhInput } from "../types"

/**
 * Mutation hooks for chi nhánh module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<ChiNhanh, CreateChiNhanhInput, UpdateChiNhanhInput>({
    queryKeys: chiNhanhQueryKeys,
    api: ChiNhanhAPI,
    messages: {
        createSuccess: "Thêm mới chi nhánh thành công",
        updateSuccess: "Cập nhật chi nhánh thành công",
        deleteSuccess: "Xóa chi nhánh thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} chi nhánh thành công`,
    },
})

export const useCreateChiNhanh = mutations.useCreate
export const useUpdateChiNhanh = mutations.useUpdate
export const useDeleteChiNhanh = mutations.useDelete
export const useBatchDeleteChiNhanh = mutations.useBatchDelete
