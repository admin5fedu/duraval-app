"use client"

import { createMutationHooks } from "@/lib/react-query"
import { keHoachThiTruongQueryKeys } from "@/lib/react-query/query-keys"
import { KeHoachThiTruongAPI } from "../services/ke-hoach-thi-truong.api"
import type { KeHoachThiTruong, CreateKeHoachThiTruongInput, UpdateKeHoachThiTruongInput } from "../schema"

const mutations = createMutationHooks<KeHoachThiTruong, CreateKeHoachThiTruongInput, UpdateKeHoachThiTruongInput>({
  queryKeys: keHoachThiTruongQueryKeys,
  api: KeHoachThiTruongAPI,
  messages: {
    createSuccess: "Thêm mới kế hoạch thị trường thành công",
    updateSuccess: "Cập nhật kế hoạch thị trường thành công",
    deleteSuccess: "Xóa kế hoạch thị trường thành công",
    batchDeleteSuccess: (count) => `Đã xóa ${count} kế hoạch thị trường thành công`,
  },
})

export const useCreateKeHoachThiTruong = mutations.useCreate
export const useUpdateKeHoachThiTruong = mutations.useUpdate
export const useDeleteKeHoachThiTruong = mutations.useDelete
export const useBatchDeleteKeHoachThiTruong = mutations.useBatchDelete

