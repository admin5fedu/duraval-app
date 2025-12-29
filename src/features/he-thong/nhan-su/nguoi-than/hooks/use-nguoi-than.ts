"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { nguoiThanQueryKeys } from "@/lib/react-query/query-keys"
import { useRelatedQuery } from "@/lib/react-query/hooks"
import { NguoiThanAPI } from "../services/nguoi-than.api"
import type { NguoiThan } from "../schema"

/**
 * Hook to fetch list of người thân
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export const useNguoiThan = createUseListQuery<NguoiThan>({
    queryKeys: nguoiThanQueryKeys,
    api: { getAll: NguoiThanAPI.getAll },
})

/**
 * Hook to fetch single người thân by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export const useNguoiThanById = createUseDetailQuery<NguoiThan>({
    queryKeys: nguoiThanQueryKeys,
    api: { getById: NguoiThanAPI.getById },
})

/**
 * Hook to fetch list of người thân by mã nhân viên
 * ⚡ Performance: Uses useRelatedQuery with automatic cache strategy
 */
export function useNguoiThanByMaNhanVien(ma_nhan_vien: number) {
    return useRelatedQuery<NguoiThan[]>({
        queryKey: nguoiThanQueryKeys?.byMaNhanVien?.(ma_nhan_vien) ?? ['nguoi-than', 'by-ma-nhan-vien', ma_nhan_vien],
        queryFn: async () => {
            const data = await NguoiThanAPI.getByMaNhanVien(ma_nhan_vien)
            return data
        },
        enabled: !!ma_nhan_vien,
    })
}
