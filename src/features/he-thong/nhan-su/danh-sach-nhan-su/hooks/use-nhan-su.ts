"use client"

import { useListQuery, useDetailQuery } from "@/lib/react-query/hooks"
import { nhanSuQueryKeys } from "@/lib/react-query/query-keys"
import { NhanSuAPI } from "../services/nhan-su.api"
import type { NhanSu } from "../schema"

/**
 * Hook to fetch list of employees
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export function useNhanSu(initialData?: NhanSu[]) {
    return useListQuery({
        queryKey: nhanSuQueryKeys.list(),
        queryFn: async () => {
            return await NhanSuAPI.getAll()
        },
        initialData: initialData,
    })
}

/**
 * Hook to fetch single employee by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export function useNhanSuById(id: number, initialData?: NhanSu) {
    return useDetailQuery({
        queryKey: nhanSuQueryKeys.detail(id),
        queryFn: async () => {
            return await NhanSuAPI.getById(id)
        },
        initialData: initialData,
        enabled: !!id,
    })
}

