"use client"

import { createMutationHooks } from "@/lib/react-query"
import { loaiTaiLieuQueryKeys } from "@/lib/react-query/query-keys"
import { LoaiTaiLieuAPI } from "../services/loai-tai-lieu.api"
import type { LoaiTaiLieu } from "../schema"
import type { CreateLoaiTaiLieuInput, UpdateLoaiTaiLieuInput } from "../types"

/**
 * Mutation hooks for loại tài liệu module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<LoaiTaiLieu, CreateLoaiTaiLieuInput, UpdateLoaiTaiLieuInput>({
    queryKeys: loaiTaiLieuQueryKeys,
    api: LoaiTaiLieuAPI,
    messages: {
        createSuccess: "Thêm mới loại tài liệu thành công",
        updateSuccess: "Cập nhật thông tin loại tài liệu thành công",
        deleteSuccess: "Xóa loại tài liệu thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} loại tài liệu thành công`,
    },
})

export const useCreateLoaiTaiLieu = mutations.useCreate
export const useUpdateLoaiTaiLieu = mutations.useUpdate
export const useDeleteLoaiTaiLieu = mutations.useDelete
export const useBatchDeleteLoaiTaiLieu = mutations.useBatchDelete

