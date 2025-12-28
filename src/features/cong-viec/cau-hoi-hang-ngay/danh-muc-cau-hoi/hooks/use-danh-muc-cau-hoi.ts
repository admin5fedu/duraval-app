"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { danhMucCauHoiQueryKeys } from "@/lib/react-query/query-keys"
import { DanhMucCauHoiAPI } from "../services/danh-muc-cau-hoi.api"
import type { DanhMucCauHoi } from "../schema"

/**
 * Hook to fetch list of danh mục câu hỏi
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useDanhMucCauHoi = createUseListQuery<DanhMucCauHoi>({
    queryKeys: danhMucCauHoiQueryKeys,
    api: { getAll: DanhMucCauHoiAPI.getAll },
})

/**
 * Hook to fetch single danh mục câu hỏi by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useDanhMucCauHoiById = createUseDetailQuery<DanhMucCauHoi>({
    queryKeys: danhMucCauHoiQueryKeys,
    api: { getById: DanhMucCauHoiAPI.getById },
})

