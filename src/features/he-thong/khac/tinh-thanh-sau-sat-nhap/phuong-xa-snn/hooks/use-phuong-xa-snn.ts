"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { phuongXaSNN as phuongXaSNNQueryKeys } from "@/lib/react-query/query-keys/phuong-xa-snn"
import { PhuongXaSNNAPI } from "../services/phuong-xa-snn.api"
import type { PhuongXaSNN } from "../schema"

/**
 * Hook to fetch list of phường xã SNN
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const usePhuongXaSNN = createUseListQuery<PhuongXaSNN>({
    queryKeys: phuongXaSNNQueryKeys,
    api: { getAll: PhuongXaSNNAPI.getAll },
})

/**
 * Hook to fetch single phường xã SNN by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const usePhuongXaSNNById = createUseDetailQuery<PhuongXaSNN>({
    queryKeys: phuongXaSNNQueryKeys,
    api: { getById: PhuongXaSNNAPI.getById },
})

