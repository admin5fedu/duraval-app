"use client"

import { createMutationHooks } from "@/lib/react-query"
import { loaiDoanhThuQueryKeys } from "@/lib/react-query/query-keys"
import { LoaiDoanhThuAPI } from "../services/loai-doanh-thu.api"
import type { LoaiDoanhThu } from "../schema"
import type { CreateLoaiDoanhThuInput, UpdateLoaiDoanhThuInput } from "../schema"

/**
 * Mutation hooks for loại doanh thu module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<LoaiDoanhThu, CreateLoaiDoanhThuInput, UpdateLoaiDoanhThuInput>({
    queryKeys: loaiDoanhThuQueryKeys,
    api: LoaiDoanhThuAPI,
    messages: {
        createSuccess: "Thêm mới loại doanh thu thành công",
        updateSuccess: "Cập nhật loại doanh thu thành công",
        deleteSuccess: "Xóa loại doanh thu thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} loại doanh thu thành công`,
    },
})

export const useCreateLoaiDoanhThu = mutations.useCreate
export const useUpdateLoaiDoanhThu = mutations.useUpdate
export const useDeleteLoaiDoanhThu = mutations.useDelete
export const useBatchDeleteLoaiDoanhThu = mutations.useBatchDelete

