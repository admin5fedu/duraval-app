"use client"

import { createMutationHooks } from "@/lib/react-query"
import { dangKyDoanhSoQueryKeys } from "@/lib/react-query/query-keys"
import { DangKyDoanhSoAPI } from "../services/dang-ky-doanh-so.api"
import type { DangKyDoanhSo } from "../schema"
import type { CreateDangKyDoanhSoInput, UpdateDangKyDoanhSoInput } from "../types"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

/**
 * Mutation hooks for đăng ký doanh số module
 * ✅ Generated using createMutationHooks factory
 */
const mutations = createMutationHooks<DangKyDoanhSo, CreateDangKyDoanhSoInput, UpdateDangKyDoanhSoInput>({
    queryKeys: dangKyDoanhSoQueryKeys,
    api: DangKyDoanhSoAPI,
    messages: {
        createSuccess: "Thêm mới đăng ký doanh số thành công",
        updateSuccess: "Cập nhật đăng ký doanh số thành công",
        deleteSuccess: "Xóa đăng ký doanh số thành công",
        batchDeleteSuccess: (count) => `Đã xóa ${count} đăng ký doanh số thành công`,
    },
})

/**
 * Custom create hook that automatically sets nguoi_tao_id from auth store
 */
export function useCreateDangKyDoanhSo() {
    const queryClient = useQueryClient()
    const { employee } = useAuthStore()

    return useMutation({
        mutationFn: async (input: CreateDangKyDoanhSoInput) => {
            // Automatically set nguoi_tao_id from auth store
            const inputWithNguoiTao = {
                ...input,
                nguoi_tao_id: employee?.ma_nhan_vien || null,
            }
            return await DangKyDoanhSoAPI.create(inputWithNguoiTao)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: dangKyDoanhSoQueryKeys.all(),
                exact: false,
            })
            queryClient.refetchQueries({
                queryKey: dangKyDoanhSoQueryKeys.list(),
                exact: true,
            })
            if (data.id) {
                queryClient.setQueryData(dangKyDoanhSoQueryKeys.detail(data.id), data)
            }
            toast.success("Thêm mới đăng ký doanh số thành công")
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: dangKyDoanhSoQueryKeys.all(),
                exact: false,
            })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Có lỗi xảy ra khi thêm mới đăng ký doanh số")
        },
    })
}

export const useUpdateDangKyDoanhSo = mutations.useUpdate
export const useDeleteDangKyDoanhSo = mutations.useDelete
export const useBatchDeleteDangKyDoanhSo = mutations.useBatchDelete

