"use client"

import { useListQuery, useDetailQuery } from "@/lib/react-query/hooks"
import { lichDangQueryKeys } from "@/lib/react-query/query-keys"
import { LichDangAPI } from "../services/lich-dang.api"
import type { LichDang } from "../schema"

/**
 * Hook to fetch list of lịch đăng
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export function useLichDang(initialData?: LichDang[]) {
    return useListQuery({
        queryKey: lichDangQueryKeys.list(),
        queryFn: async () => {
            return await LichDangAPI.getAll()
        },
        initialData: initialData,
    })
}

/**
 * Hook to fetch single lịch đăng by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export function useLichDangById(id: number, initialData?: LichDang) {
    return useDetailQuery({
        queryKey: lichDangQueryKeys.detail(id),
        queryFn: async () => {
            return await LichDangAPI.getById(id)
        },
        enabled: !!id,
        initialData: initialData,
    })
}

