"use client"

import { createMutationHooks } from "@/lib/react-query"
import { nhomLuongQueryKeys } from "@/lib/react-query/query-keys"
import { NhomLuongAPI } from "../services/nhom-luong.api"
import type { NhomLuong, CreateNhomLuongInput, UpdateNhomLuongInput } from "../types"

/**
 * Mutation hooks for nhóm lương module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<NhomLuong, CreateNhomLuongInput, UpdateNhomLuongInput>({
    queryKeys: nhomLuongQueryKeys,
    api: NhomLuongAPI,
    messages: {
        createSuccess: "Thêm mới nhóm lương thành công",
        updateSuccess: "Cập nhật nhóm lương thành công",
        deleteSuccess: "Xóa nhóm lương thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} nhóm lương thành công`,
    },
})

export const useCreateNhomLuong = mutations.useCreate
export const useUpdateNhomLuong = mutations.useUpdate
export const useDeleteNhomLuong = mutations.useDelete
export const useBatchDeleteNhomLuong = mutations.useBatchDelete

