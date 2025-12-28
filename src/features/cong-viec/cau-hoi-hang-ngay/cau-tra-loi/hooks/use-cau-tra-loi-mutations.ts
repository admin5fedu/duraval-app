"use client"

import { createMutationHooks } from "@/lib/react-query"
import { cauTraLoiQueryKeys } from "@/lib/react-query/query-keys"
import { CauTraLoiAPI } from "../services/cau-tra-loi.api"
import type { CauTraLoi } from "../schema"
import type { CreateCauTraLoiInput, UpdateCauTraLoiInput } from "../types"

/**
 * Mutation hooks for câu trả lời module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<CauTraLoi, CreateCauTraLoiInput, UpdateCauTraLoiInput>({
    queryKeys: cauTraLoiQueryKeys,
    api: CauTraLoiAPI,
    messages: {
        createSuccess: "Thêm mới câu trả lời thành công",
        updateSuccess: "Cập nhật câu trả lời thành công",
        deleteSuccess: "Xóa câu trả lời thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} câu trả lời thành công`,
    },
})

export const useCreateCauTraLoi = mutations.useCreate
export const useUpdateCauTraLoi = mutations.useUpdate
export const useDeleteCauTraLoi = mutations.useDelete
export const useBatchDeleteCauTraLoi = mutations.useBatchDelete

