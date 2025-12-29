"use client"

import { createMutationHooks } from "@/lib/react-query"
import { phieuHanhChinhQueryKeys } from "@/lib/react-query/query-keys"
import { PhieuHanhChinhAPI } from "../services/phieu-hanh-chinh.api"
import type { PhieuHanhChinh } from "../schema"
import type { CreatePhieuHanhChinhInput, UpdatePhieuHanhChinhInput } from "../types"

/**
 * Mutation hooks for phiếu hành chính module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<PhieuHanhChinh, CreatePhieuHanhChinhInput, UpdatePhieuHanhChinhInput>({
    queryKeys: phieuHanhChinhQueryKeys,
    api: PhieuHanhChinhAPI,
    messages: {
        createSuccess: "Thêm mới phiếu hành chính thành công",
        updateSuccess: "Cập nhật phiếu hành chính thành công",
        deleteSuccess: "Xóa phiếu hành chính thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} phiếu hành chính thành công`,
    },
})

export const useCreatePhieuHanhChinh = mutations.useCreate
export const useUpdatePhieuHanhChinh = mutations.useUpdate
export const useDeletePhieuHanhChinh = mutations.useDelete
export const useBatchDeletePhieuHanhChinh = mutations.useBatchDelete

