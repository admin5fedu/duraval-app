"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { tinhThanhTSN as tinhThanhTSNQueryKeys } from "@/lib/react-query/query-keys/tinh-thanh-tsn"
import { TinhThanhTSNAPI } from "../services/tinh-thanh-tsn.api"
import type { TinhThanhTSN } from "../schema"

/**
 * Hook to fetch list of tỉnh thành TSN
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useTinhThanhTSN = createUseListQuery<TinhThanhTSN>({
    queryKeys: tinhThanhTSNQueryKeys,
    api: { getAll: TinhThanhTSNAPI.getAll },
})

/**
 * Hook to fetch single tỉnh thành TSN by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useTinhThanhTSNById = createUseDetailQuery<TinhThanhTSN>({
    queryKeys: tinhThanhTSNQueryKeys,
    api: { getById: TinhThanhTSNAPI.getById },
})

