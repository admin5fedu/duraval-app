"use client"

import { createMutationHooks } from "@/lib/react-query"
import { nhomDiemCongTruQueryKeys } from "@/lib/react-query/query-keys"
import { NhomDiemCongTruAPI } from "../services/nhom-diem-cong-tru.api"
import type { NhomDiemCongTru } from "../schema"
import type { CreateNhomDiemCongTruInput, UpdateNhomDiemCongTruInput } from "../types"

/**
 * Mutation hooks for nhóm điểm cộng trừ module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<NhomDiemCongTru, CreateNhomDiemCongTruInput, UpdateNhomDiemCongTruInput>({
    queryKeys: nhomDiemCongTruQueryKeys,
    api: NhomDiemCongTruAPI,
    messages: {
        createSuccess: "Thêm mới nhóm điểm cộng trừ thành công",
        updateSuccess: "Cập nhật nhóm điểm cộng trừ thành công",
        deleteSuccess: "Xóa nhóm điểm cộng trừ thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} nhóm điểm cộng trừ thành công`,
    },
})

export const useCreateNhomDiemCongTru = mutations.useCreate
export const useUpdateNhomDiemCongTru = mutations.useUpdate
export const useDeleteNhomDiemCongTru = mutations.useDelete
export const useBatchDeleteNhomDiemCongTru = mutations.useBatchDelete

