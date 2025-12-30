"use client"

import { createMutationHooks } from "@/lib/react-query"
import { trucHatQueryKeys } from "@/lib/react-query/query-keys"
import { TrucHatAPI } from "../services/truc-hat.api"
import type { TrucHat } from "../schema"
import type { CreateTrucHatInput, UpdateTrucHatInput } from "../types"

/**
 * Mutation hooks for trục hạt module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<TrucHat, CreateTrucHatInput, UpdateTrucHatInput>({
    queryKeys: trucHatQueryKeys,
    api: TrucHatAPI,
    messages: {
        createSuccess: "Thêm mới trục hạt thành công",
        updateSuccess: "Cập nhật trục hạt thành công",
        deleteSuccess: "Xóa trục hạt thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} trục hạt thành công`,
    },
})

export const useCreateTrucHat = mutations.useCreate
export const useUpdateTrucHat = mutations.useUpdate
export const useDeleteTrucHat = mutations.useDelete
export const useBatchDeleteTrucHat = mutations.useBatchDelete

