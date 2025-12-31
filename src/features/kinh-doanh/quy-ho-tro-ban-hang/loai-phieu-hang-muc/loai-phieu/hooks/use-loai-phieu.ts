"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { loaiPhieuQueryKeys } from "@/lib/react-query/query-keys"
import { LoaiPhieuAPI } from "../services/loai-phieu.api"
import type { LoaiPhieu } from "../schema"

/**
 * Hook to fetch list of loại phiếu
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useLoaiPhieu = createUseListQuery<LoaiPhieu>({
    queryKeys: loaiPhieuQueryKeys,
    api: { getAll: LoaiPhieuAPI.getAll },
})

/**
 * Hook to fetch single loại phiếu by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useLoaiPhieuById = createUseDetailQuery<LoaiPhieu>({
    queryKeys: loaiPhieuQueryKeys,
    api: { getById: LoaiPhieuAPI.getById },
})

