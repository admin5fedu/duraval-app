"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { loaiTaiLieuQueryKeys } from "@/lib/react-query/query-keys"
import { LoaiTaiLieuAPI } from "../services/loai-tai-lieu.api"
import type { LoaiTaiLieu } from "../schema"

/**
 * Hook to fetch list of loại tài liệu
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useLoaiTaiLieu = createUseListQuery<LoaiTaiLieu>({
    queryKeys: loaiTaiLieuQueryKeys,
    api: { getAll: LoaiTaiLieuAPI.getAll },
})

/**
 * Hook to fetch single loại tài liệu by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useLoaiTaiLieuById = createUseDetailQuery<LoaiTaiLieu>({
    queryKeys: loaiTaiLieuQueryKeys,
    api: { getById: LoaiTaiLieuAPI.getById },
})

