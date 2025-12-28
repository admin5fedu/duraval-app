"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { phongBanQueryKeys } from "@/lib/react-query/query-keys"
import { PhongBanAPI } from "../services/phong-ban.api"
import type { PhongBan } from "../schema"

/**
 * Hook to fetch list of phòng ban
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const usePhongBan = createUseListQuery<PhongBan>({
    queryKeys: phongBanQueryKeys,
    api: { getAll: PhongBanAPI.getAll },
})

/**
 * Hook to fetch single phòng ban by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const usePhongBanById = createUseDetailQuery<PhongBan>({
    queryKeys: phongBanQueryKeys,
    api: { getById: PhongBanAPI.getById },
})
