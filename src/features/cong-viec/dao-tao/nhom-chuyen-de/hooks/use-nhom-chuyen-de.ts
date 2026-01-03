"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { nhomChuyenDe as nhomChuyenDeQueryKeys } from "@/lib/react-query/query-keys/nhom-chuyen-de"
import { NhomChuyenDeAPI } from "../services/nhom-chuyen-de.api"
import type { NhomChuyenDe } from "../schema"

/**
 * Hook to fetch list of nhóm chuyên đề
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useNhomChuyenDe = createUseListQuery<NhomChuyenDe>({
    queryKeys: nhomChuyenDeQueryKeys,
    api: { getAll: NhomChuyenDeAPI.getAll },
})

/**
 * Hook to fetch single nhóm chuyên đề by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useNhomChuyenDeById = createUseDetailQuery<NhomChuyenDe>({
    queryKeys: nhomChuyenDeQueryKeys,
    api: { getById: NhomChuyenDeAPI.getById },
})

