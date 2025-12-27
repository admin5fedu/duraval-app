"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { thongTinCongTyQueryKeys } from "@/lib/react-query/query-keys"
import { ThongTinCongTyAPI } from "../services/thong-tin-cong-ty.api"
import type { CreateThongTinCongTyInput, UpdateThongTinCongTyInput } from "../schema"

/**
 * Hook to create new thông tin công ty
 */
export function useCreateThongTinCongTy() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: CreateThongTinCongTyInput) => {
            return await ThongTinCongTyAPI.create(input)
        },
        onSuccess: (data) => {
            // ✅ QUAN TRỌNG: Invalidate và refetch tất cả queries (theo pattern app-tham-khao)
            // Sử dụng exact: false để invalidate tất cả queries con
            queryClient.invalidateQueries({ 
                queryKey: thongTinCongTyQueryKeys.all(),
                exact: false // Invalidate tất cả queries con
            })
            // Force refetch list query ngay lập tức
            queryClient.refetchQueries({ 
                queryKey: thongTinCongTyQueryKeys.list(),
                exact: true
            })
            // Set detail query data for instant navigation (nếu có id)
            if (data.id) {
                queryClient.setQueryData(thongTinCongTyQueryKeys.detail(data.id), data)
            }
            toast.success("Thêm mới thông tin công ty thành công")
        },
        onSettled: () => {
            // ✅ QUAN TRỌNG: Đảm bảo queries được sync sau khi mutation hoàn tất
            // (theo pattern app-tham-khao)
            queryClient.invalidateQueries({ 
                queryKey: thongTinCongTyQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi thêm mới thông tin công ty")
        },
    })
}

/**
 * Hook to update thông tin công ty
 */
export function useUpdateThongTinCongTy() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateThongTinCongTyInput }) => {
            return await ThongTinCongTyAPI.update(id, data)
        },
        onSuccess: (data, variables) => {
            // ✅ QUAN TRỌNG: Invalidate và refetch tất cả queries (theo pattern app-tham-khao)
            queryClient.invalidateQueries({ 
                queryKey: thongTinCongTyQueryKeys.all(),
                exact: false // Invalidate tất cả queries con
            })
            // Force refetch list query ngay lập tức
            queryClient.refetchQueries({ 
                queryKey: thongTinCongTyQueryKeys.list(),
                exact: true
            })
            // Update detail query
            queryClient.setQueryData(thongTinCongTyQueryKeys.detail(variables.id), data)
            toast.success("Cập nhật thông tin công ty thành công")
        },
        onSettled: () => {
            // ✅ QUAN TRỌNG: Đảm bảo queries được sync sau khi mutation hoàn tất
            queryClient.invalidateQueries({ 
                queryKey: thongTinCongTyQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin công ty")
        },
    })
}

/**
 * Hook to delete thông tin công ty
 */
export function useDeleteThongTinCongTy() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            return await ThongTinCongTyAPI.delete(id)
        },
        onSuccess: (_, id) => {
            // ✅ QUAN TRỌNG: Invalidate và refetch tất cả queries (theo pattern app-tham-khao)
            queryClient.invalidateQueries({ 
                queryKey: thongTinCongTyQueryKeys.all(),
                exact: false // Invalidate tất cả queries con
            })
            // Force refetch list query ngay lập tức
            queryClient.refetchQueries({ 
                queryKey: thongTinCongTyQueryKeys.list(),
                exact: true
            })
            // Remove detail query
            queryClient.removeQueries({ queryKey: thongTinCongTyQueryKeys.detail(id) })
            toast.success("Xóa thông tin công ty thành công")
        },
        onSettled: () => {
            // ✅ QUAN TRỌNG: Đảm bảo queries được sync sau khi mutation hoàn tất
            queryClient.invalidateQueries({ 
                queryKey: thongTinCongTyQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa thông tin công ty")
        },
    })
}

/**
 * Hook to batch delete thông tin công ty
 */
export function useBatchDeleteThongTinCongTy() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (ids: number[]) => {
            return await ThongTinCongTyAPI.batchDelete(ids)
        },
        onSuccess: (_, ids) => {
            // ✅ QUAN TRỌNG: Invalidate và refetch tất cả queries (theo pattern app-tham-khao)
            queryClient.invalidateQueries({ 
                queryKey: thongTinCongTyQueryKeys.all(),
                exact: false // Invalidate tất cả queries con
            })
            // Force refetch list query ngay lập tức
            queryClient.refetchQueries({ 
                queryKey: thongTinCongTyQueryKeys.list(),
                exact: true
            })
            // Remove detail queries
            ids.forEach((id) => {
                queryClient.removeQueries({ queryKey: thongTinCongTyQueryKeys.detail(id) })
            })
            toast.success(`Đã xóa ${ids.length} thông tin công ty thành công`)
        },
        onSettled: () => {
            // ✅ QUAN TRỌNG: Đảm bảo queries được sync sau khi mutation hoàn tất
            queryClient.invalidateQueries({ 
                queryKey: thongTinCongTyQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa thông tin công ty")
        },
    })
}

