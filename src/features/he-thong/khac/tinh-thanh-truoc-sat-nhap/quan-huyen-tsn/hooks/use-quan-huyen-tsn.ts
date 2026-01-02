"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { quanHuyenTSN as quanHuyenTSNQueryKeys } from "@/lib/react-query/query-keys/quan-huyen-tsn"
import { QuanHuyenTSNAPI } from "../services/quan-huyen-tsn.api"
import type { QuanHuyenTSN } from "../schema"

/**
 * Hook to fetch list of quận huyện TSN
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useQuanHuyenTSN = createUseListQuery<QuanHuyenTSN>({
    queryKeys: quanHuyenTSNQueryKeys,
    api: { getAll: QuanHuyenTSNAPI.getAll },
})

/**
 * Hook to fetch single quận huyện TSN by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useQuanHuyenTSNById = createUseDetailQuery<QuanHuyenTSN>({
    queryKeys: quanHuyenTSNQueryKeys,
    api: { getById: QuanHuyenTSNAPI.getById },
})

