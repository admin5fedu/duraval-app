"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { nhomLuongQueryKeys } from "@/lib/react-query/query-keys"
import { NhomLuongAPI } from "../services/nhom-luong.api"
import type { NhomLuong } from "../schema"

/**
 * Hook to fetch list of nhóm lương
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useNhomLuong = createUseListQuery<NhomLuong>({
    queryKeys: nhomLuongQueryKeys,
    api: { getAll: NhomLuongAPI.getAll },
})

/**
 * Hook to fetch single nhóm lương by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useNhomLuongById = createUseDetailQuery<NhomLuong>({
    queryKeys: nhomLuongQueryKeys,
    api: { getById: NhomLuongAPI.getById },
})

