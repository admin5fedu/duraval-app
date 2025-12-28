"use client"

import { useListQuery, useDetailQuery } from "@/lib/react-query/hooks"
import { viecHangNgayQueryKeys } from "@/lib/react-query/query-keys"
import { ViecHangNgayAPI } from "../services/viec-hang-ngay.api"
import type { ViecHangNgay } from "../schema"

/**
 * Hook to fetch list of việc hàng ngày
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export function useViecHangNgay(initialData?: ViecHangNgay[]) {
    return useListQuery({
        queryKey: viecHangNgayQueryKeys.list(),
        queryFn: async () => {
            return await ViecHangNgayAPI.getAll()
        },
        initialData: initialData,
    })
}

/**
 * Hook to fetch single việc hàng ngày by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export function useViecHangNgayById(id: number, initialData?: ViecHangNgay) {
    return useDetailQuery({
        queryKey: viecHangNgayQueryKeys.detail(id),
        queryFn: async () => {
            return await ViecHangNgayAPI.getById(id)
        },
        initialData: initialData,
        enabled: !!id,
    })
}

