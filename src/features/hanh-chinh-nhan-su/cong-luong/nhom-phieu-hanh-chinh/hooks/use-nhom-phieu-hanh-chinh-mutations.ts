"use client"

import { createMutationHooks } from "@/lib/react-query"
import { nhomPhieuHanhChinhQueryKeys } from "@/lib/react-query/query-keys"
import { NhomPhieuHanhChinhAPI } from "../services/nhom-phieu-hanh-chinh.api"
import type { NhomPhieuHanhChinh } from "../schema"
import type { CreateNhomPhieuHanhChinhInput, UpdateNhomPhieuHanhChinhInput } from "../types"

/**
 * Mutation hooks for nhóm phiếu hành chính module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<NhomPhieuHanhChinh, CreateNhomPhieuHanhChinhInput, UpdateNhomPhieuHanhChinhInput>({
    queryKeys: nhomPhieuHanhChinhQueryKeys,
    api: NhomPhieuHanhChinhAPI,
    messages: {
        createSuccess: "Thêm mới nhóm phiếu hành chính thành công",
        updateSuccess: "Cập nhật nhóm phiếu hành chính thành công",
        deleteSuccess: "Xóa nhóm phiếu hành chính thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} nhóm phiếu hành chính thành công`,
    },
})

export const useCreateNhomPhieuHanhChinh = mutations.useCreate
export const useUpdateNhomPhieuHanhChinh = mutations.useUpdate
export const useDeleteNhomPhieuHanhChinh = mutations.useDelete
export const useBatchDeleteNhomPhieuHanhChinh = mutations.useBatchDelete

