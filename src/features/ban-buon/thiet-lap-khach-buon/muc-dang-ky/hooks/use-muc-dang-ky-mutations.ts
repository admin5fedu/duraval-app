"use client"

import { createMutationHooks } from "@/lib/react-query"
import { mucDangKyQueryKeys } from "@/lib/react-query/query-keys"
import { MucDangKyAPI } from "../services/muc-dang-ky.api"
import type { MucDangKy, CreateMucDangKyInput, UpdateMucDangKyInput } from "../schema"

const mutations = createMutationHooks<MucDangKy, CreateMucDangKyInput, UpdateMucDangKyInput>({
  queryKeys: mucDangKyQueryKeys,
  api: MucDangKyAPI,
  messages: {
    createSuccess: "Thêm mới mức đăng ký thành công",
    updateSuccess: "Cập nhật mức đăng ký thành công",
    deleteSuccess: "Xóa mức đăng ký thành công",
    batchDeleteSuccess: (count) => `Đã xóa ${count} mức đăng ký thành công`,
  },
})

export const useCreateMucDangKy = mutations.useCreate
export const useUpdateMucDangKy = mutations.useUpdate
export const useDeleteMucDangKy = mutations.useDelete
export const useBatchDeleteMucDangKy = mutations.useBatchDelete

