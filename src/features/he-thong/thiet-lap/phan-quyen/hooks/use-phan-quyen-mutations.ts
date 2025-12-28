"use client"

import { createMutationHooks } from "@/lib/react-query"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { phanQuyenQueryKeys } from "@/lib/react-query/query-keys"
import { PhanQuyenAPI } from "../services/phan-quyen.api"
import type { PhanQuyen } from "../schema"
import type { CreatePhanQuyenInput, UpdatePhanQuyenInput } from "../schema"

/**
 * Mutation hooks for phân quyền module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<PhanQuyen, CreatePhanQuyenInput, UpdatePhanQuyenInput>({
    queryKeys: phanQuyenQueryKeys,
    api: PhanQuyenAPI,
    messages: {
        createSuccess: "Tạo phân quyền thành công",
        updateSuccess: "Cập nhật phân quyền thành công",
        deleteSuccess: "Xóa phân quyền thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} phân quyền thành công`,
    },
})

export const useCreatePhanQuyen = mutations.useCreate
export const useUpdatePhanQuyen = mutations.useUpdate
export const useDeletePhanQuyen = mutations.useDelete

/**
 * Hook to batch upsert permissions (special case for PhanQuyen module)
 */
export function useBatchUpsertPhanQuyen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (permissions: Array<{ chuc_vu_id: number; module_id: string; quyen: any }>) => {
      return await PhanQuyenAPI.batchUpsert(permissions)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: phanQuyenQueryKeys.all(),
      })
      toast.success("Lưu phân quyền thành công")
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi lưu phân quyền: ${error.message}`)
    },
  })
}
