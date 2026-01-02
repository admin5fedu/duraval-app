"use client"

import { createMutationHooks } from "@/lib/react-query"
import { phuongXaTSN as phuongXaTSNQueryKeys } from "@/lib/react-query/query-keys/phuong-xa-tsn"
import { PhuongXaTSNAPI } from "../services/phuong-xa-tsn.api"
import type { PhuongXaTSN } from "../schema"
import type { CreatePhuongXaTSNInput, UpdatePhuongXaTSNInput } from "../schema"

/**
 * Mutation hooks for phường xã TSN module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<PhuongXaTSN, CreatePhuongXaTSNInput, UpdatePhuongXaTSNInput>({
    queryKeys: phuongXaTSNQueryKeys,
    api: PhuongXaTSNAPI,
    messages: {
        createSuccess: "Thêm mới phường xã TSN thành công",
        updateSuccess: "Cập nhật phường xã TSN thành công",
        deleteSuccess: "Xóa phường xã TSN thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} phường xã TSN thành công`,
    },
})

export const useCreatePhuongXaTSN = mutations.useCreate
export const useUpdatePhuongXaTSN = mutations.useUpdate
export const useDeletePhuongXaTSN = mutations.useDelete
export const useBatchDeletePhuongXaTSN = mutations.useBatchDelete

