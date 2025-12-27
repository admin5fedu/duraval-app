"use client"

import { useListQuery, useDetailQuery } from "@/lib/react-query/hooks"
import { phongBanQueryKeys } from "@/lib/react-query/query-keys"
import { PhongBanAPI } from "../services/phong-ban.api"
import type { PhongBan } from "../schema"

/**
 * Hook to fetch list of phòng ban
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export function usePhongBan(initialData?: PhongBan[]) {
    return useListQuery({
        queryKey: phongBanQueryKeys.list(),
        queryFn: async () => {
            return await PhongBanAPI.getAll()
        },
        initialData: initialData,
    })
}

/**
 * Hook to fetch single phòng ban by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export function usePhongBanById(id: number, initialData?: PhongBan) {
    return useDetailQuery({
        queryKey: phongBanQueryKeys.detail(id),
        queryFn: async () => {
            return await PhongBanAPI.getById(id)
        },
        initialData: initialData,
        enabled: !!id,
    })
}

