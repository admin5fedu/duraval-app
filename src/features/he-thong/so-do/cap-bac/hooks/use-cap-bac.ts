"use client"

import { useListQuery, useDetailQuery } from "@/lib/react-query/hooks"
import { capBacQueryKeys } from "@/lib/react-query/query-keys"
import { CapBacAPI } from "../services/cap-bac.api"
import type { CapBac } from "../schema"

/**
 * Hook to fetch list of cấp bậc
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export function useCapBac(initialData?: CapBac[]) {
    return useListQuery({
        queryKey: capBacQueryKeys.list(),
        queryFn: async () => {
            return await CapBacAPI.getAll()
        },
        initialData: initialData,
    })
}

/**
 * Hook to fetch single cấp bậc by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export function useCapBacById(id: number, initialData?: CapBac) {
    return useDetailQuery({
        queryKey: capBacQueryKeys.detail(id),
        queryFn: async () => {
            return await CapBacAPI.getById(id)
        },
        initialData: initialData,
        enabled: !!id,
    })
}

