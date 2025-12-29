"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { nhomDiemCongTruQueryKeys } from "@/lib/react-query/query-keys"
import { NhomDiemCongTruAPI } from "../services/nhom-diem-cong-tru.api"
import type { NhomDiemCongTru } from "../schema"

/**
 * Hook to fetch list of nhóm điểm cộng trừ
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useNhomDiemCongTru = createUseListQuery<NhomDiemCongTru>({
    queryKeys: nhomDiemCongTruQueryKeys,
    api: { getAll: NhomDiemCongTruAPI.getAll },
})

/**
 * Hook to fetch single nhóm điểm cộng trừ by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useNhomDiemCongTruById = createUseDetailQuery<NhomDiemCongTru>({
    queryKeys: nhomDiemCongTruQueryKeys,
    api: { getById: NhomDiemCongTruAPI.getById },
})

