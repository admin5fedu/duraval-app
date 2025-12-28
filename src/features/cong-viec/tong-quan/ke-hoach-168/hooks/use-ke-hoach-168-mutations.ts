"use client"

import { createMutationHooks } from "@/lib/react-query"
import { keHoach168QueryKeys } from "@/lib/react-query/query-keys"
import { KeHoach168API } from "../services/ke-hoach-168.api"
import type { KeHoach168 } from "../schema"
import type { CreateKeHoach168Input, UpdateKeHoach168Input } from "../types"

/**
 * Mutation hooks for kế hoạch 168 module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<KeHoach168, CreateKeHoach168Input, UpdateKeHoach168Input>({
    queryKeys: keHoach168QueryKeys,
    api: KeHoach168API,
    messages: {
        createSuccess: "Thêm mới kế hoạch 168 thành công",
        updateSuccess: "Cập nhật thông tin kế hoạch 168 thành công",
        deleteSuccess: "Xóa kế hoạch 168 thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} kế hoạch 168 thành công`,
    },
})

export const useCreateKeHoach168 = mutations.useCreate
export const useUpdateKeHoach168 = mutations.useUpdate
export const useDeleteKeHoach168 = mutations.useDelete
export const useBatchDeleteKeHoach168 = mutations.useBatchDelete
