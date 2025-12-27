"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { phanQuyenQueryKeys } from "@/lib/react-query/query-keys"
import { PhanQuyenAPI } from "../services/phan-quyen.api"
import type { CreatePhanQuyenInput, UpdatePhanQuyenInput } from "../schema"

/**
 * Hook to create new permission
 */
export function useCreatePhanQuyen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePhanQuyenInput) => {
      return await PhanQuyenAPI.create(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: phanQuyenQueryKeys.all(),
      })
      toast.success("Tạo phân quyền thành công")
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi tạo phân quyền: ${error.message}`)
    },
  })
}

/**
 * Hook to update permission
 */
export function useUpdatePhanQuyen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdatePhanQuyenInput }) => {
      return await PhanQuyenAPI.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: phanQuyenQueryKeys.all(),
      })
      toast.success("Cập nhật phân quyền thành công")
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi cập nhật phân quyền: ${error.message}`)
    },
  })
}

/**
 * Hook to delete permission
 */
export function useDeletePhanQuyen() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      return await PhanQuyenAPI.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: phanQuyenQueryKeys.all(),
      })
      toast.success("Xóa phân quyền thành công")
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi xóa phân quyền: ${error.message}`)
    },
  })
}

/**
 * Hook to batch upsert permissions
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

