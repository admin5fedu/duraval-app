"use client"

import { createMutationHooks } from "@/lib/react-query"
import { chucVuQueryKeys } from "@/lib/react-query/query-keys"
import { ChucVuAPI } from "../services/chuc-vu.api"
import type { ChucVu } from "../schema"
import type { CreateChucVuInput, UpdateChucVuInput } from "../types"

/**
 * Mutation hooks for chức vụ module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<ChucVu, CreateChucVuInput, UpdateChucVuInput>({
    queryKeys: chucVuQueryKeys,
    api: ChucVuAPI,
    messages: {
        createSuccess: "Thêm mới chức vụ thành công",
        updateSuccess: "Cập nhật chức vụ thành công",
        deleteSuccess: "Xóa chức vụ thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} chức vụ thành công`,
    },
})

export const useCreateChucVu = mutations.useCreate
export const useUpdateChucVu = mutations.useUpdate
export const useDeleteChucVu = mutations.useDelete
export const useBatchDeleteChucVu = mutations.useBatchDelete
