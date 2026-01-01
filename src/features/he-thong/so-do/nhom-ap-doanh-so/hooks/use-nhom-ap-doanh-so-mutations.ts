"use client"

import { createMutationHooks } from "@/lib/react-query"
import { nhomApDoanhSoQueryKeys } from "@/lib/react-query/query-keys"
import { NhomApDoanhSoAPI } from "../services/nhom-ap-doanh-so.api"
import type { NhomApDoanhSo } from "../schema"
import type { CreateNhomApDoanhSoInput, UpdateNhomApDoanhSoInput } from "../types"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

/**
 * Mutation hooks for nhóm áp doanh số module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<NhomApDoanhSo, CreateNhomApDoanhSoInput, UpdateNhomApDoanhSoInput>({
    queryKeys: nhomApDoanhSoQueryKeys,
    api: NhomApDoanhSoAPI,
    messages: {
        createSuccess: "Thêm mới nhóm áp doanh số thành công",
        updateSuccess: "Cập nhật nhóm áp doanh số thành công",
        deleteSuccess: "Xóa nhóm áp doanh số thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} nhóm áp doanh số thành công`,
    },
})

/**
 * Custom create hook that automatically sets nguoi_tao_id from auth store
 */
export function useCreateNhomApDoanhSo() {
    const queryClient = useQueryClient()
    const { employee } = useAuthStore()

    return useMutation({
        mutationFn: async (input: CreateNhomApDoanhSoInput) => {
            // Automatically set nguoi_tao_id from auth store
            const inputWithNguoiTao = {
                ...input,
                nguoi_tao_id: employee?.ma_nhan_vien || null,
            }
            return await NhomApDoanhSoAPI.create(inputWithNguoiTao)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: nhomApDoanhSoQueryKeys.all(),
                exact: false,
            })
            queryClient.refetchQueries({
                queryKey: nhomApDoanhSoQueryKeys.list(),
                exact: true,
            })
            if (data.id) {
                queryClient.setQueryData(nhomApDoanhSoQueryKeys.detail(data.id), data)
            }
            toast.success("Thêm mới nhóm áp doanh số thành công")
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: nhomApDoanhSoQueryKeys.all(),
                exact: false,
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi thêm mới nhóm áp doanh số")
        },
    })
}

export const useUpdateNhomApDoanhSo = mutations.useUpdate
export const useDeleteNhomApDoanhSo = mutations.useDelete
export const useBatchDeleteNhomApDoanhSo = mutations.useBatchDelete

