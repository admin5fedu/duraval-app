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
            // ✅ QUAN TRỌNG: Invalidate và refetch tất cả queries (theo pattern app-tham-khao)
            // Sử dụng exact: false để invalidate tất cả queries con
            queryClient.invalidateQueries({ 
                queryKey: nguoiThanQueryKeys.all(),
                exact: false // Invalidate tất cả queries con
            })
            // Force refetch list query ngay lập tức
            queryClient.refetchQueries({ 
                queryKey: nguoiThanQueryKeys.list(),
                exact: true
            })
            // Set detail query data for instant navigation (nếu có id)
            if (data.id) {
                queryClient.setQueryData(nguoiThanQueryKeys.detail(data.id), data)
            }
            toast.success("Thêm mới người thân thành công")
        },
        onSettled: () => {
            // ✅ QUAN TRỌNG: Đảm bảo queries được sync sau khi mutation hoàn tất
            // (theo pattern app-tham-khao)
            queryClient.invalidateQueries({ 
                queryKey: nguoiThanQueryKeys.all(),
                exact: false
            })
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
            // ✅ QUAN TRỌNG: Invalidate và refetch tất cả queries (theo pattern app-tham-khao)
            queryClient.invalidateQueries({ 
                queryKey: nguoiThanQueryKeys.all(),
                exact: false // Invalidate tất cả queries con
            })
            // Force refetch list query ngay lập tức
            queryClient.refetchQueries({ 
                queryKey: nguoiThanQueryKeys.list(),
                exact: true
            })
            // Update detail query
            queryClient.setQueryData(nguoiThanQueryKeys.detail(variables.id), data)
            toast.success("Cập nhật thông tin người thân thành công")
        },
        onSettled: () => {
            // ✅ QUAN TRỌNG: Đảm bảo queries được sync sau khi mutation hoàn tất
            queryClient.invalidateQueries({ 
                queryKey: nguoiThanQueryKeys.all(),
                exact: false
            })
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
            // ✅ QUAN TRỌNG: Invalidate và refetch tất cả queries (theo pattern app-tham-khao)
            queryClient.invalidateQueries({ 
                queryKey: nguoiThanQueryKeys.all(),
                exact: false // Invalidate tất cả queries con
            })
            // Force refetch list query ngay lập tức
            queryClient.refetchQueries({ 
                queryKey: nguoiThanQueryKeys.list(),
                exact: true
            })
            // Remove detail query
            queryClient.removeQueries({ queryKey: nguoiThanQueryKeys.detail(id) })
            toast.success("Xóa người thân thành công")
        },
        onSettled: () => {
            // ✅ QUAN TRỌNG: Đảm bảo queries được sync sau khi mutation hoàn tất
            queryClient.invalidateQueries({ 
                queryKey: nguoiThanQueryKeys.all(),
                exact: false
            })
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
            // ✅ QUAN TRỌNG: Invalidate và refetch tất cả queries (theo pattern app-tham-khao)
            queryClient.invalidateQueries({ 
                queryKey: nguoiThanQueryKeys.all(),
                exact: false // Invalidate tất cả queries con
            })
            // Force refetch list query ngay lập tức
            queryClient.refetchQueries({ 
                queryKey: nguoiThanQueryKeys.list(),
                exact: true
            })
            // Remove detail queries
            ids.forEach((id) => {
                queryClient.removeQueries({ queryKey: nguoiThanQueryKeys.detail(id) })
            })
            toast.success(`Đã xóa ${ids.length} người thân thành công`)
        },
        onSettled: () => {
            // ✅ QUAN TRỌNG: Đảm bảo queries được sync sau khi mutation hoàn tất
            queryClient.invalidateQueries({ 
                queryKey: nguoiThanQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa người thân")
        },
    })
}

