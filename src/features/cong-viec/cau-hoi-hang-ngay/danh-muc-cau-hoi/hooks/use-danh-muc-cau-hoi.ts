"use client"

import { useListQuery, useDetailQuery } from "@/lib/react-query/hooks"
import { danhMucCauHoiQueryKeys } from "@/lib/react-query/query-keys"
import { DanhMucCauHoiAPI } from "../services/danh-muc-cau-hoi.api"
import type { DanhMucCauHoi } from "../schema"

/**
 * Hook to fetch list of danh mục câu hỏi
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export function useDanhMucCauHoi(initialData?: DanhMucCauHoi[]) {
    return useListQuery({
        queryKey: danhMucCauHoiQueryKeys.list(),
        queryFn: async () => {
            return await DanhMucCauHoiAPI.getAll()
        },
        initialData: initialData,
    })
}

/**
 * Hook to fetch single danh mục câu hỏi by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export function useDanhMucCauHoiById(id: number, initialData?: DanhMucCauHoi) {
    return useDetailQuery({
        queryKey: danhMucCauHoiQueryKeys.detail(id),
        queryFn: async () => {
            return await DanhMucCauHoiAPI.getById(id)
        },
        initialData: initialData,
        enabled: !!id,
    })
}

