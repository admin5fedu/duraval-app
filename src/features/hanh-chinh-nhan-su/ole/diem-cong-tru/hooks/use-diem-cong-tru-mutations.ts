"use client"

import { createMutationHooks } from "@/lib/react-query"
import { diemCongTruQueryKeys } from "@/lib/react-query/query-keys"
import { DiemCongTruAPI } from "../services/diem-cong-tru.api"
import type { DiemCongTru } from "../schema"
import type { CreateDiemCongTruInput, UpdateDiemCongTruInput } from "../types"

/**
 * Mutation hooks for điểm cộng trừ module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<DiemCongTru, CreateDiemCongTruInput, UpdateDiemCongTruInput>({
    queryKeys: diemCongTruQueryKeys,
    api: DiemCongTruAPI,
    messages: {
        createSuccess: "Thêm mới điểm cộng trừ thành công",
        updateSuccess: "Cập nhật điểm cộng trừ thành công",
        deleteSuccess: "Xóa điểm cộng trừ thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} điểm cộng trừ thành công`,
    },
})

export const useCreateDiemCongTru = mutations.useCreate
export const useUpdateDiemCongTru = mutations.useUpdate
export const useDeleteDiemCongTru = mutations.useDelete
export const useBatchDeleteDiemCongTru = mutations.useBatchDelete

