"use client"

import { DangKyDoanhSoAPI } from "../services/dang-ky-doanh-so.api"
import type { DangKyDoanhSo, CreateDangKyDoanhSoInput, UpdateDangKyDoanhSoInput } from "../schema"
import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { createMutationHooks } from "@/lib/react-query"

export const dangKyDoanhSoQueryKeys = {
  all: () => ["dang-ky-doanh-so"] as const,
  lists: () => [...dangKyDoanhSoQueryKeys.all(), "list"] as const,
  list: (filters?: string) => [...dangKyDoanhSoQueryKeys.lists(), { filters }] as const,
  details: () => [...dangKyDoanhSoQueryKeys.all(), "detail"] as const,
  detail: (id: string | number) => [...dangKyDoanhSoQueryKeys.details(), id] as const,
}

/**
 * Hook to get all đăng ký doanh số
 */
export const useDangKyDoanhSo = createUseListQuery<DangKyDoanhSo>({
  queryKeys: dangKyDoanhSoQueryKeys,
  api: { getAll: DangKyDoanhSoAPI.getAll },
})

/**
 * Hook to get đăng ký doanh số by ID
 */
export const useDangKyDoanhSoById = createUseDetailQuery<DangKyDoanhSo>({
  queryKeys: dangKyDoanhSoQueryKeys,
  api: { getById: DangKyDoanhSoAPI.getById },
})

/**
 * Mutation hooks for đăng ký doanh số
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

export const useCreateDangKyDoanhSo = mutations.useCreate
export const useUpdateDangKyDoanhSo = mutations.useUpdate
export const useDeleteDangKyDoanhSo = mutations.useDelete
export const useBatchDeleteDangKyDoanhSo = mutations.useBatchDelete

