"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { HinhAnhKhachBuonAPI } from "../services/hinh-anh-khach-buon.api"
import type { CreateHinhAnhKhachBuonInput, UpdateHinhAnhKhachBuonInput } from "../schema"
import { hinhAnhKhachBuonQueryKeys } from "@/lib/react-query/query-keys"

/**
 * Hook for creating a new hình ảnh khách buôn
 */
export function useCreateHinhAnhKhachBuon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateHinhAnhKhachBuonInput) => {
      return await HinhAnhKhachBuonAPI.create(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hinhAnhKhachBuonQueryKeys.all() })
      toast.success("Thêm mới hình ảnh khách buôn thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Có lỗi xảy ra khi thêm mới hình ảnh khách buôn")
    },
  })
}

/**
 * Hook for updating hình ảnh khách buôn
 */
export function useUpdateHinhAnhKhachBuon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: UpdateHinhAnhKhachBuonInput }) => {
      return await HinhAnhKhachBuonAPI.update(id, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hinhAnhKhachBuonQueryKeys.all() })
      toast.success("Cập nhật hình ảnh khách buôn thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật hình ảnh khách buôn")
    },
  })
}

/**
 * Hook for deleting hình ảnh khách buôn
 */
export function useDeleteHinhAnhKhachBuon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await HinhAnhKhachBuonAPI.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hinhAnhKhachBuonQueryKeys.all() })
      toast.success("Xóa hình ảnh khách buôn thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Có lỗi xảy ra khi xóa hình ảnh khách buôn")
    },
  })
}

/**
 * Hook for batch deleting hình ảnh khách buôn
 */
export function useBatchDeleteHinhAnhKhachBuon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      await HinhAnhKhachBuonAPI.batchDelete(ids)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hinhAnhKhachBuonQueryKeys.all() })
      toast.success("Xóa hình ảnh khách buôn thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Có lỗi xảy ra khi xóa hình ảnh khách buôn")
    },
  })
}

