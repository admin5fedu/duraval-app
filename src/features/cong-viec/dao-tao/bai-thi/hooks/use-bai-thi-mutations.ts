"use client"

import { createMutationHooks } from "@/lib/react-query"
import { baiThi as baiThiQueryKeys } from "@/lib/react-query/query-keys/bai-thi"
import { BaiThiAPI } from "../services/bai-thi.api"
import type { BaiThi } from "../schema"
import type { CreateBaiThiInput, UpdateBaiThiInput } from "../schema"

/**
 * Mutation hooks for bài thi module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<BaiThi, CreateBaiThiInput, UpdateBaiThiInput>({
    queryKeys: baiThiQueryKeys,
    api: BaiThiAPI,
    messages: {
        createSuccess: "Thêm mới bài thi thành công",
        updateSuccess: "Cập nhật bài thi thành công",
        deleteSuccess: "Xóa bài thi thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} bài thi thành công`,
    },
})

export const useCreateBaiThi = mutations.useCreate
export const useUpdateBaiThi = mutations.useUpdate
export const useDeleteBaiThi = mutations.useDelete
export const useBatchDeleteBaiThi = mutations.useBatchDelete

