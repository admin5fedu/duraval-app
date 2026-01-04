"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { danhSachKBQueryKeys } from "@/lib/react-query/query-keys"
import { DanhSachKBAPI } from "../services/danh-sach-KB.api"
import type { DanhSachKB } from "../schema"

/**
 * Hook to fetch list of khách buôn
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useDanhSachKB = createUseListQuery<DanhSachKB>({
  queryKeys: danhSachKBQueryKeys,
  api: { getAll: DanhSachKBAPI.getAll },
})

/**
 * Hook to fetch single khách buôn by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useDanhSachKBById = createUseDetailQuery<DanhSachKB>({
  queryKeys: danhSachKBQueryKeys,
  api: { getById: DanhSachKBAPI.getById },
})

