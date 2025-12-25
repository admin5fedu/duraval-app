"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { nhanSuQueryKeys } from "@/lib/react-query/query-keys"
import { NhanSuAPI } from "../services/nhan-su.api"
import type { CreateNhanSuInput, UpdateNhanSuInput } from "../schema"

/**
 * Hook to create new employee
 */
export function useCreateNhanSu() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: CreateNhanSuInput) => {
            return await NhanSuAPI.create(input)
        },
        onSuccess: (data) => {
            // Invalidate list query
            queryClient.invalidateQueries({ queryKey: nhanSuQueryKeys.list() })
            // Set detail query data for instant navigation
            queryClient.setQueryData(nhanSuQueryKeys.detail(data.ma_nhan_vien), data)
            toast.success("Thêm mới nhân viên thành công")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi thêm mới nhân viên")
        },
    })
}

/**
 * Hook to update employee
 */
export function useUpdateNhanSu() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateNhanSuInput }) => {
            return await NhanSuAPI.update(id, data)
        },
        onSuccess: (data, variables) => {
            // Invalidate list query
            queryClient.invalidateQueries({ queryKey: nhanSuQueryKeys.list() })
            // Update detail query
            queryClient.setQueryData(nhanSuQueryKeys.detail(variables.id), data)
            toast.success("Cập nhật thông tin nhân viên thành công")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin nhân viên")
        },
    })
}

/**
 * Hook to delete employee
 */
export function useDeleteNhanSu() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            return await NhanSuAPI.delete(id)
        },
        onSuccess: (_, id) => {
            // Invalidate list query
            queryClient.invalidateQueries({ queryKey: nhanSuQueryKeys.list() })
            // Remove detail query
            queryClient.removeQueries({ queryKey: nhanSuQueryKeys.detail(id) })
            toast.success("Xóa nhân viên thành công")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa nhân viên")
        },
    })
}

/**
 * Hook to batch delete employees
 */
export function useBatchDeleteNhanSu() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (ids: number[]) => {
            return await NhanSuAPI.batchDelete(ids)
        },
        onSuccess: (_, ids) => {
            // Invalidate list query
            queryClient.invalidateQueries({ queryKey: nhanSuQueryKeys.list() })
            // Remove detail queries
            ids.forEach((id) => {
                queryClient.removeQueries({ queryKey: nhanSuQueryKeys.detail(id) })
            })
            toast.success(`Đã xóa ${ids.length} nhân viên thành công`)
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa nhân viên")
        },
    })
}

