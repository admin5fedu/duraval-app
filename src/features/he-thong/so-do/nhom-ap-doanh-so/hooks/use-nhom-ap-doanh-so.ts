"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { nhomApDoanhSoQueryKeys } from "@/lib/react-query/query-keys"
import { NhomApDoanhSoAPI } from "../services/nhom-ap-doanh-so.api"
import type { NhomApDoanhSo } from "../schema"

/**
 * Hook to fetch list of nhóm áp doanh số
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useNhomApDoanhSo = createUseListQuery<NhomApDoanhSo>({
    queryKeys: nhomApDoanhSoQueryKeys,
    api: { getAll: NhomApDoanhSoAPI.getAll },
})

/**
 * Hook to fetch single nhóm áp doanh số by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useNhomApDoanhSoById = createUseDetailQuery<NhomApDoanhSo>({
    queryKeys: nhomApDoanhSoQueryKeys,
    api: { getById: NhomApDoanhSoAPI.getById },
})

