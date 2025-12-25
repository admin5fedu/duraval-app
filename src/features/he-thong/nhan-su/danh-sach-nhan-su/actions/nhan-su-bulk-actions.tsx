"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { NhanSu } from "../types"
import type { CreateNhanSuInput, UpdateNhanSuInput } from "../types"
import { NhanSuService } from "../services"
import { nhanSuQueryKeys } from "@/lib/react-query/query-keys"

const TABLE_NAME = "var_nhan_su"
const service = new NhanSuService()

/**
 * Hook for creating a new employee
 */
export function useCreateNhanSu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateNhanSuInput) => {
      const validData = service.validateCreateInput(data)

      const { data: insertedData, error } = await supabase
        .from(TABLE_NAME)
        .insert([validData])
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return insertedData as NhanSu
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nhanSuQueryKeys.all() })
      toast.success("Thêm mới nhân sự thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Có lỗi xảy ra khi thêm mới nhân sự")
    },
  })
}

/**
 * Hook for updating an employee
 */
export function useUpdateNhanSu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateNhanSuInput }) => {
      const updateData = service.buildUpdatePayload(data)

      const { data: updatedData, error } = await supabase
        .from(TABLE_NAME)
        .update(updateData)
        .eq("ma_nhan_vien", id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return updatedData as NhanSu
    },
    onSuccess: (data, variables) => {
      // Update detail query
      queryClient.setQueryData(nhanSuQueryKeys.detail(variables.id), data)
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: nhanSuQueryKeys.list() })
      toast.success("Cập nhật thông tin nhân sự thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin nhân sự")
    },
  })
}

/**
 * Hook for deleting a single employee
 */
export function useDeleteNhanSu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq("ma_nhan_vien", id)

      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: (_, id) => {
      // Remove detail query
      queryClient.removeQueries({ queryKey: nhanSuQueryKeys.detail(id) })
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: nhanSuQueryKeys.list() })
      toast.success("Xóa nhân sự thành công")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Có lỗi xảy ra khi xóa nhân sự")
    },
  })
}

/**
 * Hook for batch deleting employees
 */
export function useBatchDeleteNhanSu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      if (ids.length === 0) return

      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .in("ma_nhan_vien", ids)

      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: (_, ids) => {
      // Remove detail queries
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: nhanSuQueryKeys.detail(id) })
      })
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: nhanSuQueryKeys.list() })
      toast.success(`Đã xóa ${ids.length} nhân sự thành công`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Có lỗi xảy ra khi xóa nhân sự")
    },
  })
}

