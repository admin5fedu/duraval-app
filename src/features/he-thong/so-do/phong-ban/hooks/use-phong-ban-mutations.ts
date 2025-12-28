"use client"

import { createMutationHooks } from "@/lib/react-query"
import { phongBanQueryKeys } from "@/lib/react-query/query-keys"
import { PhongBanAPI } from "../services/phong-ban.api"
import type { PhongBan } from "../schema"
import type { CreatePhongBanInput, UpdatePhongBanInput } from "../types"

/**
 * Mutation hooks for phòng ban module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<PhongBan, CreatePhongBanInput, UpdatePhongBanInput>({
    queryKeys: phongBanQueryKeys,
    api: PhongBanAPI,
    messages: {
        createSuccess: "Thêm mới phòng ban thành công",
        updateSuccess: "Cập nhật phòng ban thành công",
        deleteSuccess: "Xóa phòng ban thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} phòng ban thành công`,
    },
})

export const useCreatePhongBan = mutations.useCreate
export const useUpdatePhongBan = mutations.useUpdate
export const useDeletePhongBan = mutations.useDelete
export const useBatchDeletePhongBan = mutations.useBatchDelete
