"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { keHoach168QueryKeys } from "@/lib/react-query/query-keys"
import { KeHoach168API } from "../services/ke-hoach-168.api"
import type { KeHoach168 } from "../schema"

/**
 * Hook to fetch list of kế hoạch 168
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useKeHoach168 = createUseListQuery<KeHoach168>({
    queryKeys: keHoach168QueryKeys,
    api: { getAll: KeHoach168API.getAll },
})

/**
 * Hook to fetch single kế hoạch 168 by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useKeHoach168ById = createUseDetailQuery<KeHoach168>({
    queryKeys: keHoach168QueryKeys,
    api: { getById: KeHoach168API.getById },
})
