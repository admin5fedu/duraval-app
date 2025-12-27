"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { phongBanQueryKeys } from "@/lib/react-query/query-keys"
import { PhongBanAPI } from "../services/phong-ban.api"
import type { CreatePhongBanInput, UpdatePhongBanInput } from "../schema"

/**
 * Hook to create new phòng ban
 */
export function useCreatePhongBan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: CreatePhongBanInput) => {
            return await PhongBanAPI.create(input)
        },
        onSuccess: (data) => {
            // ✅ QUAN TRỌNG: Invalidate và refetch tất cả queries (theo pattern app-tham-khao)
            // Sử dụng exact: false để invalidate tất cả queries con
            queryClient.invalidateQueries({ 
                queryKey: phongBanQueryKeys.all(),
                exact: false // Invalidate tất cả queries con
            })
            // Force refetch list query ngay lập tức
            queryClient.refetchQueries({ 
                queryKey: phongBanQueryKeys.list(),
                exact: true
            })
            // Set detail query data for instant navigation (nếu có id)
            if (data.id) {
                queryClient.setQueryData(phongBanQueryKeys.detail(data.id), data)
            }
            toast.success("Thêm mới phòng ban thành công")
        },
        onSettled: () => {
            // ✅ QUAN TRỌNG: Đảm bảo queries được sync sau khi mutation hoàn tất
            // (theo pattern app-tham-khao)
            queryClient.invalidateQueries({ 
                queryKey: phongBanQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi thêm mới phòng ban")
        },
    })
}

/**
 * Hook to update phòng ban
 */
export function useUpdatePhongBan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdatePhongBanInput }) => {
            return await PhongBanAPI.update(id, data)
        },
        onSuccess: (data, variables) => {
            // ✅ QUAN TRỌNG: Invalidate và refetch tất cả queries (theo pattern app-tham-khao)
            queryClient.invalidateQueries({ 
                queryKey: phongBanQueryKeys.all(),
                exact: false // Invalidate tất cả queries con
            })
            // Force refetch list query ngay lập tức
            queryClient.refetchQueries({ 
                queryKey: phongBanQueryKeys.list(),
                exact: true
            })
            // Update detail query
            queryClient.setQueryData(phongBanQueryKeys.detail(variables.id), data)
            toast.success("Cập nhật thông tin phòng ban thành công")
        },
        onSettled: () => {
            // ✅ QUAN TRỌNG: Đảm bảo queries được sync sau khi mutation hoàn tất
            queryClient.invalidateQueries({ 
                queryKey: phongBanQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin phòng ban")
        },
    })
}

/**
 * Hook to delete phòng ban
 */
export function useDeletePhongBan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            return await PhongBanAPI.delete(id)
        },
        onSuccess: (_, id) => {
            // ✅ QUAN TRỌNG: Invalidate và refetch tất cả queries (theo pattern app-tham-khao)
            queryClient.invalidateQueries({ 
                queryKey: phongBanQueryKeys.all(),
                exact: false // Invalidate tất cả queries con
            })
            // Force refetch list query ngay lập tức
            queryClient.refetchQueries({ 
                queryKey: phongBanQueryKeys.list(),
                exact: true
            })
            // Remove detail query
            queryClient.removeQueries({ queryKey: phongBanQueryKeys.detail(id) })
            toast.success("Xóa phòng ban thành công")
        },
        onSettled: () => {
            // ✅ QUAN TRỌNG: Đảm bảo queries được sync sau khi mutation hoàn tất
            queryClient.invalidateQueries({ 
                queryKey: phongBanQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa phòng ban")
        },
    })
}

/**
 * Hook to batch delete phòng ban
 */
export function useBatchDeletePhongBan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (ids: number[]) => {
            return await PhongBanAPI.batchDelete(ids)
        },
        onSuccess: (_, ids) => {
            // ✅ QUAN TRỌNG: Invalidate và refetch tất cả queries (theo pattern app-tham-khao)
            queryClient.invalidateQueries({ 
                queryKey: phongBanQueryKeys.all(),
                exact: false // Invalidate tất cả queries con
            })
            // Force refetch list query ngay lập tức
            queryClient.refetchQueries({ 
                queryKey: phongBanQueryKeys.list(),
                exact: true
            })
            // Remove detail queries
            ids.forEach((id) => {
                queryClient.removeQueries({ queryKey: phongBanQueryKeys.detail(id) })
            })
            toast.success(`Đã xóa ${ids.length} phòng ban thành công`)
        },
        onSettled: () => {
            // ✅ QUAN TRỌNG: Đảm bảo queries được sync sau khi mutation hoàn tất
            queryClient.invalidateQueries({ 
                queryKey: phongBanQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa phòng ban")
        },
    })
}

