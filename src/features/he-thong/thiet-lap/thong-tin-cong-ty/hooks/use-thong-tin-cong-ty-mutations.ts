"use client"

import { createMutationHooks } from "@/lib/react-query"
import { thongTinCongTyQueryKeys } from "@/lib/react-query/query-keys"
import { ThongTinCongTyAPI } from "../services/thong-tin-cong-ty.api"
import type { ThongTinCongTy } from "../schema"
import type { CreateThongTinCongTyInput, UpdateThongTinCongTyInput } from "../types"

/**
 * Mutation hooks for thông tin công ty module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<ThongTinCongTy, CreateThongTinCongTyInput, UpdateThongTinCongTyInput>({
    queryKeys: thongTinCongTyQueryKeys,
    api: ThongTinCongTyAPI,
    messages: {
        createSuccess: "Thêm mới thông tin công ty thành công",
        updateSuccess: "Cập nhật thông tin công ty thành công",
        deleteSuccess: "Xóa thông tin công ty thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} thông tin công ty thành công`,
    },
})

export const useCreateThongTinCongTy = mutations.useCreate
export const useUpdateThongTinCongTy = mutations.useUpdate
export const useDeleteThongTinCongTy = mutations.useDelete
export const useBatchDeleteThongTinCongTy = mutations.useBatchDelete
