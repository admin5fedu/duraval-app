"use client"

import { createMutationHooks } from "@/lib/react-query"
import { viecHangNgayQueryKeys } from "@/lib/react-query/query-keys"
import { ViecHangNgayAPI } from "../services/viec-hang-ngay.api"
import type { ViecHangNgay } from "../schema"
import type { CreateViecHangNgayInput, UpdateViecHangNgayInput } from "../types"

/**
 * Mutation hooks for việc hàng ngày module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<ViecHangNgay, CreateViecHangNgayInput, UpdateViecHangNgayInput>({
    queryKeys: viecHangNgayQueryKeys,
    api: ViecHangNgayAPI,
    messages: {
        createSuccess: "Thêm mới việc hàng ngày thành công",
        updateSuccess: "Cập nhật việc hàng ngày thành công",
        deleteSuccess: "Xóa việc hàng ngày thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} việc hàng ngày thành công`,
    },
})

export const useCreateViecHangNgay = mutations.useCreate
export const useUpdateViecHangNgay = mutations.useUpdate
export const useDeleteViecHangNgay = mutations.useDelete
export const useBatchDeleteViecHangNgay = mutations.useBatchDelete
