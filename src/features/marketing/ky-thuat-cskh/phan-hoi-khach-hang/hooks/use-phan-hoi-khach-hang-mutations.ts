"use client"

import { createMutationHooks } from "@/lib/react-query"
import { phanHoiKhachHangQueryKeys } from "@/lib/react-query/query-keys"
import { PhanHoiKhachHangAPI } from "../services/phan-hoi-khach-hang.api"
import type { PhanHoiKhachHang } from "../schema"
import type { CreatePhanHoiKhachHangInput, UpdatePhanHoiKhachHangInput } from "../types"

/**
 * Mutation hooks for phản hồi khách hàng module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<PhanHoiKhachHang, CreatePhanHoiKhachHangInput, UpdatePhanHoiKhachHangInput>({
    queryKeys: phanHoiKhachHangQueryKeys,
    api: PhanHoiKhachHangAPI,
    messages: {
        createSuccess: "Thêm mới phản hồi khách hàng thành công",
        updateSuccess: "Cập nhật phản hồi khách hàng thành công",
        deleteSuccess: "Xóa phản hồi khách hàng thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} phản hồi khách hàng thành công`,
    },
})

export const useCreatePhanHoiKhachHang = mutations.useCreate
export const useUpdatePhanHoiKhachHang = mutations.useUpdate
export const useDeletePhanHoiKhachHang = mutations.useDelete
export const useBatchDeletePhanHoiKhachHang = mutations.useBatchDelete

