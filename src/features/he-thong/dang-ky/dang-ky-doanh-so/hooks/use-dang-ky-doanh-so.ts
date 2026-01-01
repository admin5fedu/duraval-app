"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { dangKyDoanhSoQueryKeys } from "@/lib/react-query/query-keys"
import { DangKyDoanhSoAPI } from "../services/dang-ky-doanh-so.api"
import type { DangKyDoanhSo } from "../schema"

/**
 * Hook to fetch list of đăng ký doanh số
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useDangKyDoanhSo = createUseListQuery<DangKyDoanhSo>({
    queryKeys: dangKyDoanhSoQueryKeys,
    api: { getAll: DangKyDoanhSoAPI.getAll },
})

/**
 * Hook to fetch single đăng ký doanh số by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useDangKyDoanhSoById = createUseDetailQuery<DangKyDoanhSo>({
    queryKeys: dangKyDoanhSoQueryKeys,
    api: { getById: DangKyDoanhSoAPI.getById },
})

