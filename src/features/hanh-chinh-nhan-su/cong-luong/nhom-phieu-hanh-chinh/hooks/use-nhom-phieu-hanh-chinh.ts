"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { nhomPhieuHanhChinhQueryKeys } from "@/lib/react-query/query-keys"
import { NhomPhieuHanhChinhAPI } from "../services/nhom-phieu-hanh-chinh.api"
import type { NhomPhieuHanhChinh } from "../schema"

/**
 * Hook to fetch list of nhóm phiếu hành chính
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useNhomPhieuHanhChinh = createUseListQuery<NhomPhieuHanhChinh>({
    queryKeys: nhomPhieuHanhChinhQueryKeys,
    api: { getAll: NhomPhieuHanhChinhAPI.getAll },
})

/**
 * Hook to fetch single nhóm phiếu hành chính by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useNhomPhieuHanhChinhById = createUseDetailQuery<NhomPhieuHanhChinh>({
    queryKeys: nhomPhieuHanhChinhQueryKeys,
    api: { getById: NhomPhieuHanhChinhAPI.getById },
})

