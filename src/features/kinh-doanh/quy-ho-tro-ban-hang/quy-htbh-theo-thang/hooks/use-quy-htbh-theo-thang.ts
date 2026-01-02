"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { quyHTBHTheoThang as quyHTBHTheoThangQueryKeys } from "@/lib/react-query/query-keys/quy-htbh-theo-thang"
import { QuyHTBHTheoThangAPI } from "../services/quy-htbh-theo-thang.api"
import type { QuyHTBHTheoThang } from "../schema"

/**
 * Hook to fetch list of records
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useQuyHTBHTheoThang = createUseListQuery<QuyHTBHTheoThang>({
  queryKeys: quyHTBHTheoThangQueryKeys,
  api: { getAll: QuyHTBHTheoThangAPI.getAll },
})

/**
 * Hook to fetch single record by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useQuyHTBHTheoThangById = createUseDetailQuery<QuyHTBHTheoThang>({
  queryKeys: quyHTBHTheoThangQueryKeys,
  api: { getById: QuyHTBHTheoThangAPI.getById },
})

