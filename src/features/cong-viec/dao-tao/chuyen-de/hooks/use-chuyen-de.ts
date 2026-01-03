"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { chuyenDe as chuyenDeQueryKeys } from "@/lib/react-query/query-keys/chuyen-de"
import { ChuyenDeAPI } from "../services/chuyen-de.api"
import type { ChuyenDe } from "../schema"

/**
 * Hook to fetch list of chuyên đề
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useChuyenDe = createUseListQuery<ChuyenDe>({
    queryKeys: chuyenDeQueryKeys,
    api: { getAll: ChuyenDeAPI.getAll },
})

/**
 * Hook to fetch single chuyên đề by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useChuyenDeById = createUseDetailQuery<ChuyenDe>({
    queryKeys: chuyenDeQueryKeys,
    api: { getById: ChuyenDeAPI.getById },
})

