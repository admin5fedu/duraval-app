"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { nhanSuQueryKeys } from "@/lib/react-query/query-keys"
import { NhanSuAPI } from "../services/nhan-su.api"
import type { NhanSu } from "../schema"

/**
 * Hook to fetch list of employees
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useNhanSu = createUseListQuery<NhanSu>({
    queryKeys: nhanSuQueryKeys,
    api: { getAll: NhanSuAPI.getAll },
})

/**
 * Hook to fetch single employee by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useNhanSuById = createUseDetailQuery<NhanSu>({
    queryKeys: nhanSuQueryKeys,
    api: { getById: NhanSuAPI.getById },
})
