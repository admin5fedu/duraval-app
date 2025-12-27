"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { nguoiThanQueryKeys } from "@/lib/react-query/query-keys"
import { NguoiThanAPI } from "../services/nguoi-than.api"
import type { CreateNguoiThanInput, UpdateNguoiThanInput } from "../schema"

/**
 * Hook to create new người thân
 */
export function useCreateNguoiThan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: CreateNguoiThanInput) => {
            return await NguoiThanAPI.create(input)
        },
        onSuccess: (data) => {
            // Invalidate list query
            queryClient.invalidateQueries({ queryKey: nguoiThanQueryKeys.list() })
            // Invalidate byMaNhanVien query
            queryClient.invalidateQueries({ queryKey: nguoiThanQueryKeys.byMaNhanVien(data.ma_nhan_vien) })
            // Set detail query data for instant navigation
            queryClient.setQueryData(nguoiThanQueryKeys.detail(data.id!), data)
            toast.success("Thêm mới người thân thành công")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi thêm mới người thân")
        },
    })
}

/**
 * Hook to update người thân
 */
export function useUpdateNguoiThan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateNguoiThanInput }) => {
            return await NguoiThanAPI.update(id, data)
        },
        onSuccess: (data, variables) => {
            // Invalidate list query
            queryClient.invalidateQueries({ queryKey: nguoiThanQueryKeys.list() })
            // Invalidate byMaNhanVien query
            queryClient.invalidateQueries({ queryKey: nguoiThanQueryKeys.byMaNhanVien(data.ma_nhan_vien) })
            // Update detail query
            queryClient.setQueryData(nguoiThanQueryKeys.detail(variables.id), data)
            toast.success("Cập nhật thông tin người thân thành công")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin người thân")
        },
    })
}

/**
 * Hook to delete người thân
 */
export function useDeleteNguoiThan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            return await NguoiThanAPI.delete(id)
        },
        onSuccess: (_, id) => {
            // Invalidate list query
            queryClient.invalidateQueries({ queryKey: nguoiThanQueryKeys.list() })
            // Remove detail query
            queryClient.removeQueries({ queryKey: nguoiThanQueryKeys.detail(id) })
            // We don't know ma_nhan_vien here, so invalidate all byMaNhanVien queries
            queryClient.invalidateQueries({ queryKey: ["nguoi-than", "byMaNhanVien"] })
            toast.success("Xóa người thân thành công")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa người thân")
        },
    })
}

/**
 * Hook to batch delete người thân
 */
export function useBatchDeleteNguoiThan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (ids: number[]) => {
            return await NguoiThanAPI.batchDelete(ids)
        },
        onSuccess: (_, ids) => {
            // Invalidate list query
            queryClient.invalidateQueries({ queryKey: nguoiThanQueryKeys.list() })
            // Remove detail queries
            ids.forEach((id) => {
                queryClient.removeQueries({ queryKey: nguoiThanQueryKeys.detail(id) })
            })
            // Invalidate all byMaNhanVien queries
            queryClient.invalidateQueries({ queryKey: ["nguoi-than", "byMaNhanVien"] })
            toast.success(`Đã xóa ${ids.length} người thân thành công`)
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa người thân")
        },
    })
}

