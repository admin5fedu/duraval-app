"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { danhMucTaiLieuQueryKeys } from "@/lib/react-query/query-keys"
import { DanhMucTaiLieuAPI } from "../services/danh-muc-tai-lieu.api"
import type { DanhMucTaiLieu } from "../schema"

/**
 * Hook to fetch list of danh mục tài liệu
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useDanhMucTaiLieu = createUseListQuery<DanhMucTaiLieu>({
    queryKeys: danhMucTaiLieuQueryKeys,
    api: { getAll: DanhMucTaiLieuAPI.getAll },
})

/**
 * Hook to fetch single danh mục tài liệu by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useDanhMucTaiLieuById = createUseDetailQuery<DanhMucTaiLieu>({
    queryKeys: danhMucTaiLieuQueryKeys,
    api: { getById: DanhMucTaiLieuAPI.getById },
})

