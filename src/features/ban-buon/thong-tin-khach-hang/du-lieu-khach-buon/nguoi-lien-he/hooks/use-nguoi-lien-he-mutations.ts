"use client"

import { createMutationHooks } from "@/lib/react-query"
import { nguoiLienHeQueryKeys } from "@/lib/react-query/query-keys"
import { NguoiLienHeAPI } from "../services/nguoi-lien-he.api"
import type { NguoiLienHe, CreateNguoiLienHeInput, UpdateNguoiLienHeInput } from "../schema"

const mutations = createMutationHooks<NguoiLienHe, CreateNguoiLienHeInput, UpdateNguoiLienHeInput>({
  queryKeys: nguoiLienHeQueryKeys,
  api: NguoiLienHeAPI,
  messages: {
    createSuccess: "Thêm mới người liên hệ thành công",
    updateSuccess: "Cập nhật người liên hệ thành công",
    deleteSuccess: "Xóa người liên hệ thành công",
    batchDeleteSuccess: (count) => `Đã xóa ${count} người liên hệ thành công`,
  },
})

export const useCreateNguoiLienHe = mutations.useCreate
export const useUpdateNguoiLienHe = mutations.useUpdate
export const useDeleteNguoiLienHe = mutations.useDelete
export const useBatchDeleteNguoiLienHe = mutations.useBatchDelete

