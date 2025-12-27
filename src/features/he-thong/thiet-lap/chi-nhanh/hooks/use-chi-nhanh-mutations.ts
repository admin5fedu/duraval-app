"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { chiNhanhQueryKeys } from "@/lib/react-query/query-keys"
import { ChiNhanhAPI } from "../services/chi-nhanh.api"
import type { CreateChiNhanhInput, UpdateChiNhanhInput } from "../schema"

/**
 * Hook to create new chi nhánh
 */
export function useCreateChiNhanh() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: CreateChiNhanhInput) => {
            return await ChiNhanhAPI.create(input)
        },
        onSuccess: (data) => {
            // ✅ QUAN TRỌNG: Invalidate và refetch tất cả queries (theo pattern app-tham-khao)
            // Sử dụng exact: false để invalidate tất cả queries con
            queryClient.invalidateQueries({ 
                queryKey: chiNhanhQueryKeys.all(),
                exact: false // Invalidate tất cả queries con
            })
            // Force refetch list query ngay lập tức
            queryClient.refetchQueries({ 
                queryKey: chiNhanhQueryKeys.list(),
                exact: true
            })
            // Set detail query data for instant navigation (nếu có id)
            if (data.id) {
                queryClient.setQueryData(chiNhanhQueryKeys.detail(data.id), data)
            }
            toast.success("Thêm mới chi nhánh thành công")
        },
        onSettled: () => {
            // ✅ QUAN TRỌNG: Đảm bảo queries được sync sau khi mutation hoàn tất
            // (theo pattern app-tham-khao)
            queryClient.invalidateQueries({ 
                queryKey: chiNhanhQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi thêm mới chi nhánh")
        },
    })
}

/**
 * Hook to update chi nhánh
 */
export function useUpdateChiNhanh() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateChiNhanhInput }) => {
            return await ChiNhanhAPI.update(id, data)
        },
        onSuccess: (data, variables) => {
            // ✅ QUAN TRỌNG: Invalidate và refetch tất cả queries (theo pattern app-tham-khao)
            queryClient.invalidateQueries({ 
                queryKey: chiNhanhQueryKeys.all(),
                exact: false // Invalidate tất cả queries con
            })
            // Force refetch list query ngay lập tức
            queryClient.refetchQueries({ 
                queryKey: chiNhanhQueryKeys.list(),
                exact: true
            })
            // Update detail query
            queryClient.setQueryData(chiNhanhQueryKeys.detail(variables.id), data)
            toast.success("Cập nhật thông tin chi nhánh thành công")
        },
        onSettled: () => {
            // ✅ QUAN TRỌNG: Đảm bảo queries được sync sau khi mutation hoàn tất
            queryClient.invalidateQueries({ 
                queryKey: chiNhanhQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin chi nhánh")
        },
    })
}

/**
 * Hook to delete chi nhánh
 */
export function useDeleteChiNhanh() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            return await ChiNhanhAPI.delete(id)
        },
        onSuccess: (_, id) => {
            // ✅ QUAN TRỌNG: Invalidate và refetch tất cả queries (theo pattern app-tham-khao)
            queryClient.invalidateQueries({ 
                queryKey: chiNhanhQueryKeys.all(),
                exact: false // Invalidate tất cả queries con
            })
            // Force refetch list query ngay lập tức
            queryClient.refetchQueries({ 
                queryKey: chiNhanhQueryKeys.list(),
                exact: true
            })
            // Remove detail query
            queryClient.removeQueries({ queryKey: chiNhanhQueryKeys.detail(id) })
            toast.success("Xóa chi nhánh thành công")
        },
        onSettled: () => {
            // ✅ QUAN TRỌNG: Đảm bảo queries được sync sau khi mutation hoàn tất
            queryClient.invalidateQueries({ 
                queryKey: chiNhanhQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa chi nhánh")
        },
    })
}

/**
 * Hook to batch delete chi nhánh
 */
export function useBatchDeleteChiNhanh() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (ids: number[]) => {
            return await ChiNhanhAPI.batchDelete(ids)
        },
        onSuccess: (_, ids) => {
            // ✅ QUAN TRỌNG: Invalidate và refetch tất cả queries (theo pattern app-tham-khao)
            queryClient.invalidateQueries({ 
                queryKey: chiNhanhQueryKeys.all(),
                exact: false // Invalidate tất cả queries con
            })
            // Force refetch list query ngay lập tức
            queryClient.refetchQueries({ 
                queryKey: chiNhanhQueryKeys.list(),
                exact: true
            })
            // Remove detail queries
            ids.forEach((id) => {
                queryClient.removeQueries({ queryKey: chiNhanhQueryKeys.detail(id) })
            })
            toast.success(`Đã xóa ${ids.length} chi nhánh thành công`)
        },
        onSettled: () => {
            // ✅ QUAN TRỌNG: Đảm bảo queries được sync sau khi mutation hoàn tất
            queryClient.invalidateQueries({ 
                queryKey: chiNhanhQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa chi nhánh")
        },
    })
}

