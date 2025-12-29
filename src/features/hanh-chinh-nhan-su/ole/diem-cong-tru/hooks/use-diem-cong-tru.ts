"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { diemCongTruQueryKeys } from "@/lib/react-query/query-keys"
import { DiemCongTruAPI } from "../services/diem-cong-tru.api"
import type { DiemCongTru } from "../schema"

/**
 * Hook to fetch list of điểm cộng trừ
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useDiemCongTru = createUseListQuery<DiemCongTru>({
    queryKeys: diemCongTruQueryKeys,
    api: { getAll: DiemCongTruAPI.getAll },
})

/**
 * Hook to fetch single điểm cộng trừ by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useDiemCongTruById = createUseDetailQuery<DiemCongTru>({
    queryKeys: diemCongTruQueryKeys,
    api: { getById: DiemCongTruAPI.getById },
})

