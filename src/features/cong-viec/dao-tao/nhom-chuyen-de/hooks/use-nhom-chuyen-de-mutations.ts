"use client"

import { createMutationHooks } from "@/lib/react-query"
import { nhomChuyenDe as nhomChuyenDeQueryKeys } from "@/lib/react-query/query-keys/nhom-chuyen-de"
import { NhomChuyenDeAPI } from "../services/nhom-chuyen-de.api"
import type { NhomChuyenDe } from "../schema"
import type { CreateNhomChuyenDeInput, UpdateNhomChuyenDeInput } from "../schema"

/**
 * Mutation hooks for nhóm chuyên đề module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<NhomChuyenDe, CreateNhomChuyenDeInput, UpdateNhomChuyenDeInput>({
    queryKeys: nhomChuyenDeQueryKeys,
    api: NhomChuyenDeAPI,
    messages: {
        createSuccess: "Thêm mới nhóm chuyên đề thành công",
        updateSuccess: "Cập nhật nhóm chuyên đề thành công",
        deleteSuccess: "Xóa nhóm chuyên đề thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} nhóm chuyên đề thành công`,
    },
})

export const useCreateNhomChuyenDe = mutations.useCreate
export const useUpdateNhomChuyenDe = mutations.useUpdate
export const useDeleteNhomChuyenDe = mutations.useDelete
export const useBatchDeleteNhomChuyenDe = mutations.useBatchDelete

