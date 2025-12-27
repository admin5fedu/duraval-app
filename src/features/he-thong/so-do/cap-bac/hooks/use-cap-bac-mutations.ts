"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { capBacQueryKeys } from "@/lib/react-query/query-keys"
import { CapBacAPI } from "../services/cap-bac.api"
import type { CapBac, CreateCapBacInput, UpdateCapBacInput } from "../schema"

/**
 * Hook to create new cấp bậc
 */
export function useCreateCapBac() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: CreateCapBacInput) => {
            return await CapBacAPI.create(input)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ 
                queryKey: capBacQueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: capBacQueryKeys.list(),
                exact: true
            })
            if (data.id) {
                queryClient.setQueryData(capBacQueryKeys.detail(data.id), data)
            }
            toast.success("Thêm mới cấp bậc thành công")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: capBacQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi thêm mới cấp bậc")
        },
    })
}

/**
 * Hook to update cấp bậc
 */
export function useUpdateCapBac() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateCapBacInput }) => {
            return await CapBacAPI.update(id, data)
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: capBacQueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: capBacQueryKeys.list(),
                exact: true
            })
            queryClient.setQueryData(capBacQueryKeys.detail(variables.id), data)
            toast.success("Cập nhật thông tin cấp bậc thành công")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: capBacQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin cấp bậc")
        },
    })
}

/**
 * Hook to delete cấp bậc
 */
export function useDeleteCapBac() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            return await CapBacAPI.delete(id)
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ 
                queryKey: capBacQueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: capBacQueryKeys.list(),
                exact: true
            })
            queryClient.removeQueries({ queryKey: capBacQueryKeys.detail(id) })
            toast.success("Xóa cấp bậc thành công")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: capBacQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa cấp bậc")
        },
    })
}

/**
 * Hook to batch delete cấp bậc
 */
export function useBatchDeleteCapBac() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (ids: number[]) => {
            return await CapBacAPI.batchDelete(ids)
        },
        onSuccess: (_, ids) => {
            queryClient.invalidateQueries({ 
                queryKey: capBacQueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: capBacQueryKeys.list(),
                exact: true
            })
            ids.forEach((id) => {
                queryClient.removeQueries({ queryKey: capBacQueryKeys.detail(id) })
            })
            toast.success(`Đã xóa ${ids.length} cấp bậc thành công`)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: capBacQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa cấp bậc")
        },
    })
}

