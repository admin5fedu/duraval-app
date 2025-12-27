"use client"

import { useListQuery, useDetailQuery } from "@/lib/react-query/hooks"
import { thongTinCongTyQueryKeys } from "@/lib/react-query/query-keys"
import { ThongTinCongTyAPI } from "../services/thong-tin-cong-ty.api"
import type { ThongTinCongTy } from "../schema"

/**
 * Hook to fetch list of thông tin công ty
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export function useThongTinCongTy(initialData?: ThongTinCongTy[]) {
    return useListQuery({
        queryKey: thongTinCongTyQueryKeys.list(),
        queryFn: async () => {
            return await ThongTinCongTyAPI.getAll()
        },
        initialData: initialData,
    })
}

/**
 * Hook to fetch single thông tin công ty by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export function useThongTinCongTyById(id: number, initialData?: ThongTinCongTy) {
    return useDetailQuery({
        queryKey: thongTinCongTyQueryKeys.detail(id),
        queryFn: async () => {
            return await ThongTinCongTyAPI.getById(id)
        },
        initialData: initialData,
        enabled: !!id,
    })
}

