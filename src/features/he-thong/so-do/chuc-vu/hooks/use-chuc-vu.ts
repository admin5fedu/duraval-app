"use client"

import { useListQuery, useDetailQuery } from "@/lib/react-query/hooks"
import { chucVuQueryKeys } from "@/lib/react-query/query-keys"
import { ChucVuAPI } from "../services/chuc-vu.api"
import type { ChucVu } from "../schema"

/**
 * Hook to fetch list of chức vụ
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export function useChucVu(initialData?: ChucVu[]) {
    return useListQuery({
        queryKey: chucVuQueryKeys.list(),
        queryFn: async () => {
            return await ChucVuAPI.getAll()
        },
        initialData: initialData,
    })
}

/**
 * Hook to fetch single chức vụ by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export function useChucVuById(id: number, initialData?: ChucVu) {
    return useDetailQuery({
        queryKey: chucVuQueryKeys.detail(id),
        queryFn: async () => {
            return await ChucVuAPI.getById(id)
        },
        initialData: initialData,
        enabled: !!id,
    })
}

