"use client"

import { createMutationHooks } from "@/lib/react-query"
import { nhanSuQueryKeys } from "@/lib/react-query/query-keys"
import { NhanSuAPI } from "../services/nhan-su.api"
import type { NhanSu } from "../schema"
import type { CreateNhanSuInput, UpdateNhanSuInput } from "../schema"

/**
 * Mutation hooks for nhân sự module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<NhanSu, CreateNhanSuInput, UpdateNhanSuInput>({
    queryKeys: nhanSuQueryKeys,
    api: NhanSuAPI,
    messages: {
        createSuccess: "Thêm mới nhân viên thành công",
        updateSuccess: "Cập nhật thông tin nhân viên thành công",
        deleteSuccess: "Xóa nhân viên thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} nhân viên thành công`,
    },
})

export const useCreateNhanSu = mutations.useCreate
export const useUpdateNhanSu = mutations.useUpdate
export const useDeleteNhanSu = mutations.useDelete
export const useBatchDeleteNhanSu = mutations.useBatchDelete
