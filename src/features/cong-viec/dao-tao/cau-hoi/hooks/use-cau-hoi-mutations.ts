"use client"

import { createMutationHooks } from "@/lib/react-query"
import { cauHoi as cauHoiQueryKeys } from "@/lib/react-query/query-keys/cau-hoi"
import { CauHoiAPI } from "../services/cau-hoi.api"
import type { CauHoi } from "../schema"
import type { CreateCauHoiInput, UpdateCauHoiInput } from "../schema"

/**
 * Mutation hooks for câu hỏi module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<CauHoi, CreateCauHoiInput, UpdateCauHoiInput>({
    queryKeys: cauHoiQueryKeys,
    api: CauHoiAPI,
    messages: {
        createSuccess: "Thêm mới câu hỏi thành công",
        updateSuccess: "Cập nhật câu hỏi thành công",
        deleteSuccess: "Xóa câu hỏi thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} câu hỏi thành công`,
    },
})

export const useCreateCauHoi = mutations.useCreate
export const useUpdateCauHoi = mutations.useUpdate
export const useDeleteCauHoi = mutations.useDelete
export const useBatchDeleteCauHoi = mutations.useBatchDelete

