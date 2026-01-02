"use client"

import { createMutationHooks } from "@/lib/react-query"
import { phieuDeXuatBanHang as phieuDeXuatBanHangQueryKeys } from "@/lib/react-query/query-keys/phieu-de-xuat-ban-hang"
import { PhieuDeXuatBanHangAPI } from "../services/phieu-de-xuat-ban-hang.api"
import type { PhieuDeXuatBanHang } from "../schema"
import type { CreatePhieuDeXuatBanHangInput, UpdatePhieuDeXuatBanHangInput } from "../schema"

/**
 * Mutation hooks for phiếu đề xuất bán hàng module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<PhieuDeXuatBanHang & { id?: number }, CreatePhieuDeXuatBanHangInput, UpdatePhieuDeXuatBanHangInput>({
  queryKeys: phieuDeXuatBanHangQueryKeys,
  api: PhieuDeXuatBanHangAPI,
  messages: {
    createSuccess: "Thêm mới phiếu đề xuất bán hàng thành công",
    updateSuccess: "Cập nhật phiếu đề xuất bán hàng thành công",
    deleteSuccess: "Xóa phiếu đề xuất bán hàng thành công",
    batchDeleteSuccess: (count) => `Đã xóa ${count} phiếu đề xuất bán hàng thành công`,
  },
})

export const useCreatePhieuDeXuatBanHang = mutations.useCreate
export const useUpdatePhieuDeXuatBanHang = mutations.useUpdate
export const useDeletePhieuDeXuatBanHang = mutations.useDelete
export const useBatchDeletePhieuDeXuatBanHang = mutations.useBatchDelete

