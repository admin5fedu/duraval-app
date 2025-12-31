"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { loaiDoanhThuQueryKeys } from "@/lib/react-query/query-keys"
import { LoaiDoanhThuAPI } from "../services/loai-doanh-thu.api"
import type { LoaiDoanhThu } from "../schema"

/**
 * Hook to fetch list of loại doanh thu
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useLoaiDoanhThu = createUseListQuery<LoaiDoanhThu>({
    queryKeys: loaiDoanhThuQueryKeys,
    api: { getAll: LoaiDoanhThuAPI.getAll },
})

/**
 * Hook to fetch single loại doanh thu by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useLoaiDoanhThuById = createUseDetailQuery<LoaiDoanhThu>({
    queryKeys: loaiDoanhThuQueryKeys,
    api: { getById: LoaiDoanhThuAPI.getById },
})

