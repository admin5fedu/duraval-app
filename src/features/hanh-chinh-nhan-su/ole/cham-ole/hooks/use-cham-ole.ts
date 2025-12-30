"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { chamOleQueryKeys } from "@/lib/react-query/query-keys"
import { ChamOleAPI } from "../services/cham-ole.api"
import type { ChamOle } from "../schema"

/**
 * Hook to fetch list of chấm OLE
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useChamOle = createUseListQuery<ChamOle>({
    queryKeys: chamOleQueryKeys,
    api: { getAll: ChamOleAPI.getAll },
})

/**
 * Hook to fetch single chấm OLE by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useChamOleById = createUseDetailQuery<ChamOle>({
    queryKeys: chamOleQueryKeys,
    api: { getById: ChamOleAPI.getById },
})

