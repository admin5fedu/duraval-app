"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { viecHangNgayQueryKeys } from "@/lib/react-query/query-keys"
import { ViecHangNgayAPI } from "../services/viec-hang-ngay.api"
import type { ViecHangNgay, CreateViecHangNgayInput, UpdateViecHangNgayInput } from "../schema"

/**
 * Hook to create new việc hàng ngày
 */
export function useCreateViecHangNgay() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: CreateViecHangNgayInput) => {
            return await ViecHangNgayAPI.create(input)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ 
                queryKey: viecHangNgayQueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: viecHangNgayQueryKeys.list(),
                exact: true
            })
            if (data.id) {
                queryClient.setQueryData(viecHangNgayQueryKeys.detail(data.id), data)
            }
            toast.success("Thêm mới việc hàng ngày thành công")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: viecHangNgayQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi thêm mới việc hàng ngày")
        },
    })
}

/**
 * Hook to update việc hàng ngày
 */
export function useUpdateViecHangNgay() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateViecHangNgayInput }) => {
            return await ViecHangNgayAPI.update(id, data)
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: viecHangNgayQueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: viecHangNgayQueryKeys.list(),
                exact: true
            })
            queryClient.setQueryData(viecHangNgayQueryKeys.detail(variables.id), data)
            toast.success("Cập nhật thông tin việc hàng ngày thành công")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: viecHangNgayQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin việc hàng ngày")
        },
    })
}

/**
 * Hook to delete việc hàng ngày
 */
export function useDeleteViecHangNgay() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            return await ViecHangNgayAPI.delete(id)
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ 
                queryKey: viecHangNgayQueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: viecHangNgayQueryKeys.list(),
                exact: true
            })
            queryClient.removeQueries({ queryKey: viecHangNgayQueryKeys.detail(id) })
            toast.success("Xóa việc hàng ngày thành công")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: viecHangNgayQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa việc hàng ngày")
        },
    })
}

/**
 * Hook to batch delete việc hàng ngày
 */
export function useBatchDeleteViecHangNgay() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (ids: number[]) => {
            return await ViecHangNgayAPI.batchDelete(ids)
        },
        onSuccess: (_, ids) => {
            queryClient.invalidateQueries({ 
                queryKey: viecHangNgayQueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: viecHangNgayQueryKeys.list(),
                exact: true
            })
            ids.forEach((id) => {
                queryClient.removeQueries({ queryKey: viecHangNgayQueryKeys.detail(id) })
            })
            toast.success(`Đã xóa ${ids.length} việc hàng ngày thành công`)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: viecHangNgayQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa việc hàng ngày")
        },
    })
}

