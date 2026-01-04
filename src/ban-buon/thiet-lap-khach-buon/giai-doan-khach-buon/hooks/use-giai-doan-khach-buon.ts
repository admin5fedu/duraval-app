"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { giaiDoanKhachBuonQueryKeys } from "@/lib/react-query/query-keys"
import { GiaiDoanKhachBuonAPI } from "../services/giai-doan-khach-buon.api"
import type { GiaiDoanKhachBuon } from "../schema"

/**
 * Hook to fetch list of giai đoạn khách buôn
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useGiaiDoanKhachBuon = createUseListQuery<GiaiDoanKhachBuon>({
    queryKeys: giaiDoanKhachBuonQueryKeys,
    api: { getAll: GiaiDoanKhachBuonAPI.getAll },
})

/**
 * Hook to fetch single giai đoạn khách buôn by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useGiaiDoanKhachBuonById = createUseDetailQuery<GiaiDoanKhachBuon>({
    queryKeys: giaiDoanKhachBuonQueryKeys,
    api: { getById: GiaiDoanKhachBuonAPI.getById },
})

