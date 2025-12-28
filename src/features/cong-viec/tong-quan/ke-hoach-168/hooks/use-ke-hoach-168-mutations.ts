"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { keHoach168QueryKeys } from "@/lib/react-query/query-keys"
import { KeHoach168API } from "../services/ke-hoach-168.api"
import type { KeHoach168, CreateKeHoach168Input, UpdateKeHoach168Input } from "../schema"

/**
 * Hook to create new kế hoạch 168
 */
export function useCreateKeHoach168() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: CreateKeHoach168Input) => {
            return await KeHoach168API.create(input)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ 
                queryKey: keHoach168QueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: keHoach168QueryKeys.list(),
                exact: true
            })
            if (data.id) {
                queryClient.setQueryData(keHoach168QueryKeys.detail(data.id), data)
            }
            toast.success("Thêm mới kế hoạch 168 thành công")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: keHoach168QueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi thêm mới kế hoạch 168")
        },
    })
}

/**
 * Hook to update kế hoạch 168
 */
export function useUpdateKeHoach168() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateKeHoach168Input }) => {
            return await KeHoach168API.update(id, data)
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: keHoach168QueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: keHoach168QueryKeys.list(),
                exact: true
            })
            queryClient.setQueryData(keHoach168QueryKeys.detail(variables.id), data)
            toast.success("Cập nhật thông tin kế hoạch 168 thành công")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: keHoach168QueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin kế hoạch 168")
        },
    })
}

/**
 * Hook to delete kế hoạch 168
 */
export function useDeleteKeHoach168() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            return await KeHoach168API.delete(id)
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ 
                queryKey: keHoach168QueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: keHoach168QueryKeys.list(),
                exact: true
            })
            queryClient.removeQueries({ queryKey: keHoach168QueryKeys.detail(id) })
            toast.success("Xóa kế hoạch 168 thành công")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: keHoach168QueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa kế hoạch 168")
        },
    })
}

/**
 * Hook to batch delete kế hoạch 168
 */
export function useBatchDeleteKeHoach168() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (ids: number[]) => {
            return await KeHoach168API.batchDelete(ids)
        },
        onSuccess: (_, ids) => {
            queryClient.invalidateQueries({ 
                queryKey: keHoach168QueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: keHoach168QueryKeys.list(),
                exact: true
            })
            ids.forEach((id) => {
                queryClient.removeQueries({ queryKey: keHoach168QueryKeys.detail(id) })
            })
            toast.success(`Đã xóa ${ids.length} kế hoạch 168 thành công`)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: keHoach168QueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa kế hoạch 168")
        },
    })
}

