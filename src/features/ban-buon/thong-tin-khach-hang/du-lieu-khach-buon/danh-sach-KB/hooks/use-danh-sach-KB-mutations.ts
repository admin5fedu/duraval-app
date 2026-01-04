"use client"

import { createMutationHooks } from "@/lib/react-query"
import { danhSachKBQueryKeys } from "@/lib/react-query/query-keys"
import { DanhSachKBAPI } from "../services/danh-sach-KB.api"
import type { DanhSachKB, CreateDanhSachKBInput, UpdateDanhSachKBInput } from "../schema"

const mutations = createMutationHooks<DanhSachKB, CreateDanhSachKBInput, UpdateDanhSachKBInput>({
  queryKeys: danhSachKBQueryKeys,
  api: DanhSachKBAPI,
  messages: {
    createSuccess: "Thêm mới khách buôn thành công",
    updateSuccess: "Cập nhật khách buôn thành công",
    deleteSuccess: "Xóa khách buôn thành công",
    batchDeleteSuccess: (count) => `Đã xóa ${count} khách buôn thành công`,
  },
})

export const useCreateDanhSachKB = mutations.useCreate
export const useUpdateDanhSachKB = mutations.useUpdate
export const useDeleteDanhSachKB = mutations.useDelete
export const useBatchDeleteDanhSachKB = mutations.useBatchDelete

