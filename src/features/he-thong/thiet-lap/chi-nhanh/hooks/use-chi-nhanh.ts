"use client"

import { useListQuery, useDetailQuery } from "@/lib/react-query/hooks"
import { chiNhanhQueryKeys } from "@/lib/react-query/query-keys"
import { ChiNhanhAPI } from "../services/chi-nhanh.api"
import type { ChiNhanh } from "../schema"

/**
 * Hook to fetch list of chi nhánh
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export function useChiNhanh(initialData?: ChiNhanh[]) {
    return useListQuery({
        queryKey: chiNhanhQueryKeys.list(),
        queryFn: async () => {
            return await ChiNhanhAPI.getAll()
        },
        initialData: initialData,
    })
}

/**
 * Hook to fetch single chi nhánh by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export function useChiNhanhById(id: number, initialData?: ChiNhanh) {
    return useDetailQuery({
        queryKey: chiNhanhQueryKeys.detail(id),
        queryFn: async () => {
            return await ChiNhanhAPI.getById(id)
        },
        initialData: initialData,
        enabled: !!id,
    })
}

