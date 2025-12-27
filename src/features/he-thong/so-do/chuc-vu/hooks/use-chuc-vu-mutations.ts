"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { chucVuQueryKeys } from "@/lib/react-query/query-keys"
import { ChucVuAPI } from "../services/chuc-vu.api"
import type { CreateChucVuInput, UpdateChucVuInput } from "../schema"

/**
 * Hook to create new chức vụ
 */
export function useCreateChucVu() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: CreateChucVuInput) => {
            return await ChucVuAPI.create(input)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ 
                queryKey: chucVuQueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: chucVuQueryKeys.list(),
                exact: true
            })
            if (data.id) {
                queryClient.setQueryData(chucVuQueryKeys.detail(data.id), data)
            }
            toast.success("Thêm mới chức vụ thành công")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: chucVuQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi thêm mới chức vụ")
        },
    })
}

/**
 * Hook to update chức vụ
 */
export function useUpdateChucVu() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateChucVuInput }) => {
            return await ChucVuAPI.update(id, data)
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: chucVuQueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: chucVuQueryKeys.list(),
                exact: true
            })
            queryClient.setQueryData(chucVuQueryKeys.detail(variables.id), data)
            toast.success("Cập nhật thông tin chức vụ thành công")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: chucVuQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin chức vụ")
        },
    })
}

/**
 * Hook to delete chức vụ
 */
export function useDeleteChucVu() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            return await ChucVuAPI.delete(id)
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ 
                queryKey: chucVuQueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: chucVuQueryKeys.list(),
                exact: true
            })
            queryClient.removeQueries({ queryKey: chucVuQueryKeys.detail(id) })
            toast.success("Xóa chức vụ thành công")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: chucVuQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa chức vụ")
        },
    })
}

/**
 * Hook to batch delete chức vụ
 */
export function useBatchDeleteChucVu() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (ids: number[]) => {
            return await ChucVuAPI.batchDelete(ids)
        },
        onSuccess: (_, ids) => {
            queryClient.invalidateQueries({ 
                queryKey: chucVuQueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: chucVuQueryKeys.list(),
                exact: true
            })
            ids.forEach((id) => {
                queryClient.removeQueries({ queryKey: chucVuQueryKeys.detail(id) })
            })
            toast.success(`Đã xóa ${ids.length} chức vụ thành công`)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: chucVuQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa chức vụ")
        },
    })
}

