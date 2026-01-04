"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { trangThaiKhachBuonQueryKeys } from "@/lib/react-query/query-keys"
import { TrangThaiKhachBuonAPI } from "../services/trang-thai-khach-buon.api"
import type { TrangThaiKhachBuon } from "../schema"

/**
 * Hook to fetch list of trạng thái khách buôn
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useTrangThaiKhachBuon = createUseListQuery<TrangThaiKhachBuon>({
    queryKeys: trangThaiKhachBuonQueryKeys,
    api: { getAll: TrangThaiKhachBuonAPI.getAll },
})

/**
 * Hook to fetch single trạng thái khách buôn by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useTrangThaiKhachBuonById = createUseDetailQuery<TrangThaiKhachBuon>({
    queryKeys: trangThaiKhachBuonQueryKeys,
    api: { getById: TrangThaiKhachBuonAPI.getById },
})

