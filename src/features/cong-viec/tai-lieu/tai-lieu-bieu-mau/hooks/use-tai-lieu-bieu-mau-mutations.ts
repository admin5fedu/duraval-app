"use client"

import { createMutationHooks } from "@/lib/react-query"
import { taiLieuBieuMauQueryKeys } from "@/lib/react-query/query-keys"
import { TaiLieuBieuMauAPI } from "../services/tai-lieu-bieu-mau.api"
import type { TaiLieuBieuMau } from "../schema"
import type { CreateTaiLieuBieuMauInput, UpdateTaiLieuBieuMauInput } from "../types"

/**
 * Mutation hooks for tài liệu & biểu mẫu module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<TaiLieuBieuMau, CreateTaiLieuBieuMauInput, UpdateTaiLieuBieuMauInput>({
    queryKeys: taiLieuBieuMauQueryKeys,
    api: TaiLieuBieuMauAPI,
    messages: {
        createSuccess: "Thêm mới tài liệu & biểu mẫu thành công",
        updateSuccess: "Cập nhật thông tin tài liệu & biểu mẫu thành công",
        deleteSuccess: "Xóa tài liệu & biểu mẫu thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} tài liệu & biểu mẫu thành công`,
    },
})

export const useCreateTaiLieuBieuMau = mutations.useCreate
export const useUpdateTaiLieuBieuMau = mutations.useUpdate
export const useDeleteTaiLieuBieuMau = mutations.useDelete
export const useBatchDeleteTaiLieuBieuMau = mutations.useBatchDelete

