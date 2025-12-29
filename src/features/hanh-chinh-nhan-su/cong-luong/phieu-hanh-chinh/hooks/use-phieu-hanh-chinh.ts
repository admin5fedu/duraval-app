"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { phieuHanhChinhQueryKeys } from "@/lib/react-query/query-keys"
import { PhieuHanhChinhAPI } from "../services/phieu-hanh-chinh.api"
import type { PhieuHanhChinh } from "../schema"

/**
 * Hook to fetch list of phiếu hành chính
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const usePhieuHanhChinh = createUseListQuery<PhieuHanhChinh>({
    queryKeys: phieuHanhChinhQueryKeys,
    api: { getAll: PhieuHanhChinhAPI.getAll },
})

/**
 * Hook to fetch single phiếu hành chính by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const usePhieuHanhChinhById = createUseDetailQuery<PhieuHanhChinh>({
    queryKeys: phieuHanhChinhQueryKeys,
    api: { getById: PhieuHanhChinhAPI.getById },
})

