"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { lichDangQueryKeys } from "@/lib/react-query/query-keys"
import { LichDangAPI } from "../services/lich-dang.api"
import type { CreateLichDangInput, UpdateLichDangInput } from "../types"

/**
 * Hook to create new lịch đăng
 */
export function useCreateLichDang() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: CreateLichDangInput) => {
            return await LichDangAPI.create(input)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ 
                queryKey: lichDangQueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: lichDangQueryKeys.list(),
                exact: true
            })
            queryClient.setQueryData(lichDangQueryKeys.detail(data.id!), data)
            toast.success("Thêm mới lịch đăng thành công")
        },
        onError: (error: Error) => {
            toast.error(`Lỗi khi thêm mới lịch đăng: ${error.message}`)
        }
    })
}

/**
 * Hook to update lịch đăng
 */
export function useUpdateLichDang() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, input }: { id: number; input: UpdateLichDangInput }) => {
            return await LichDangAPI.update(id, input)
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: lichDangQueryKeys.all(),
                exact: false
            })
            queryClient.setQueryData(lichDangQueryKeys.detail(variables.id), data)
            toast.success("Cập nhật lịch đăng thành công")
        },
        onError: (error: Error) => {
            toast.error(`Lỗi khi cập nhật lịch đăng: ${error.message}`)
        }
    })
}

/**
 * Hook to delete lịch đăng
 */
export function useDeleteLichDang() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            await LichDangAPI.delete(id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ 
                queryKey: lichDangQueryKeys.all(),
                exact: false
            })
            toast.success("Xóa lịch đăng thành công")
        },
        onError: (error: Error) => {
            toast.error(`Lỗi khi xóa lịch đăng: ${error.message}`)
        }
    })
}

/**
 * Hook to batch delete lịch đăng
 */
export function useBatchDeleteLichDang() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (ids: number[]) => {
            await LichDangAPI.batchDelete(ids)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ 
                queryKey: lichDangQueryKeys.all(),
                exact: false
            })
            toast.success("Xóa hàng loạt lịch đăng thành công")
        },
        onError: (error: Error) => {
            toast.error(`Lỗi khi xóa hàng loạt lịch đăng: ${error.message}`)
        }
    })
}

