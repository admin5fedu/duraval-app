"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { trucHatQueryKeys } from "@/lib/react-query/query-keys"
import { TrucHatAPI } from "../services/truc-hat.api"
import type { TrucHat } from "../schema"

/**
 * Hook to fetch list of trục hạt
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useTrucHat = createUseListQuery<TrucHat>({
    queryKeys: trucHatQueryKeys,
    api: { getAll: TrucHatAPI.getAll },
})

/**
 * Hook to fetch single trục hạt by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useTrucHatById = createUseDetailQuery<TrucHat>({
    queryKeys: trucHatQueryKeys,
    api: { getById: TrucHatAPI.getById },
})

