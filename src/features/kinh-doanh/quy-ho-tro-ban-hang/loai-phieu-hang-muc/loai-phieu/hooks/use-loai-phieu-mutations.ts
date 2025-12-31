"use client"

import { createMutationHooks } from "@/lib/react-query"
import { loaiPhieuQueryKeys } from "@/lib/react-query/query-keys"
import { LoaiPhieuAPI } from "../services/loai-phieu.api"
import type { LoaiPhieu } from "../schema"
import type { CreateLoaiPhieuInput, UpdateLoaiPhieuInput } from "../schema"

/**
 * Mutation hooks for loại phiếu module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<LoaiPhieu, CreateLoaiPhieuInput, UpdateLoaiPhieuInput>({
    queryKeys: loaiPhieuQueryKeys,
    api: LoaiPhieuAPI,
    messages: {
        createSuccess: "Thêm mới loại phiếu thành công",
        updateSuccess: "Cập nhật loại phiếu thành công",
        deleteSuccess: "Xóa loại phiếu thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} loại phiếu thành công`,
    },
})

export const useCreateLoaiPhieu = mutations.useCreate
export const useUpdateLoaiPhieu = mutations.useUpdate
export const useDeleteLoaiPhieu = mutations.useDelete
export const useBatchDeleteLoaiPhieu = mutations.useBatchDelete

