"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { danhMucCauHoiQueryKeys } from "@/lib/react-query/query-keys"
import { DanhMucCauHoiAPI } from "../services/danh-muc-cau-hoi.api"
import type { DanhMucCauHoi } from "../schema"
import type { CreateDanhMucCauHoiInput, UpdateDanhMucCauHoiInput } from "../types"

/**
 * Hook to create new danh mục câu hỏi
 */
export function useCreateDanhMucCauHoi() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: CreateDanhMucCauHoiInput) => {
            return await DanhMucCauHoiAPI.create(input)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ 
                queryKey: danhMucCauHoiQueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: danhMucCauHoiQueryKeys.list(),
                exact: true
            })
            if (data.id) {
                queryClient.setQueryData(danhMucCauHoiQueryKeys.detail(data.id), data)
            }
            toast.success("Thêm mới danh mục câu hỏi thành công")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: danhMucCauHoiQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi thêm mới danh mục câu hỏi")
        },
    })
}

/**
 * Hook to update danh mục câu hỏi
 */
export function useUpdateDanhMucCauHoi() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateDanhMucCauHoiInput }) => {
            return await DanhMucCauHoiAPI.update(id, data)
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: danhMucCauHoiQueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: danhMucCauHoiQueryKeys.list(),
                exact: true
            })
            queryClient.setQueryData(danhMucCauHoiQueryKeys.detail(variables.id), data)
            toast.success("Cập nhật thông tin danh mục câu hỏi thành công")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: danhMucCauHoiQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật thông tin danh mục câu hỏi")
        },
    })
}

/**
 * Hook to delete danh mục câu hỏi
 */
export function useDeleteDanhMucCauHoi() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            return await DanhMucCauHoiAPI.delete(id)
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ 
                queryKey: danhMucCauHoiQueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: danhMucCauHoiQueryKeys.list(),
                exact: true
            })
            queryClient.removeQueries({ queryKey: danhMucCauHoiQueryKeys.detail(id) })
            toast.success("Xóa danh mục câu hỏi thành công")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: danhMucCauHoiQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa danh mục câu hỏi")
        },
    })
}

/**
 * Hook to batch delete danh mục câu hỏi
 */
export function useBatchDeleteDanhMucCauHoi() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (ids: number[]) => {
            return await DanhMucCauHoiAPI.batchDelete(ids)
        },
        onSuccess: (_, ids) => {
            queryClient.invalidateQueries({ 
                queryKey: danhMucCauHoiQueryKeys.all(),
                exact: false
            })
            queryClient.refetchQueries({ 
                queryKey: danhMucCauHoiQueryKeys.list(),
                exact: true
            })
            ids.forEach((id) => {
                queryClient.removeQueries({ queryKey: danhMucCauHoiQueryKeys.detail(id) })
            })
            toast.success(`Đã xóa ${ids.length} danh mục câu hỏi thành công`)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ 
                queryKey: danhMucCauHoiQueryKeys.all(),
                exact: false
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi xóa danh mục câu hỏi")
        },
    })
}

