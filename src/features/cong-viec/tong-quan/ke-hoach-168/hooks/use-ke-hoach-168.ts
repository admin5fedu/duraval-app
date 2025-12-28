"use client"

import { useListQuery, useDetailQuery } from "@/lib/react-query/hooks"
import { keHoach168QueryKeys } from "@/lib/react-query/query-keys"
import { KeHoach168API } from "../services/ke-hoach-168.api"
import type { KeHoach168 } from "../schema"

/**
 * Hook to fetch list of kế hoạch 168
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export function useKeHoach168(initialData?: KeHoach168[]) {
    return useListQuery({
        queryKey: keHoach168QueryKeys.list(),
        queryFn: async () => {
            return await KeHoach168API.getAll()
        },
        initialData: initialData,
    })
}

/**
 * Hook to fetch single kế hoạch 168 by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export function useKeHoach168ById(id: number, initialData?: KeHoach168) {
    return useDetailQuery({
        queryKey: keHoach168QueryKeys.detail(id),
        queryFn: async () => {
            return await KeHoach168API.getById(id)
        },
        initialData: initialData,
        enabled: !!id,
    })
}

