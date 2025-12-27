"use client"

import { useListQuery, useDetailQuery } from "@/lib/react-query/hooks"
import { nguoiThanQueryKeys } from "@/lib/react-query/query-keys"
import { NguoiThanAPI } from "../services/nguoi-than.api"
import type { NguoiThan } from "../schema"

/**
 * Hook to fetch list of người thân
 * ⚡ Performance: Uses useListQuery with automatic cache strategy
 */
export function useNguoiThan(initialData?: NguoiThan[]) {
    return useListQuery({
        queryKey: nguoiThanQueryKeys.list(),
        queryFn: async () => {
            return await NguoiThanAPI.getAll()
        },
        initialData: initialData,
    })
}

/**
 * Hook to fetch single người thân by ID
 * ⚡ Performance: Uses cached data for instant navigation
 */
export function useNguoiThanById(id: number, initialData?: NguoiThan) {
    return useDetailQuery({
        queryKey: nguoiThanQueryKeys.detail(id),
        queryFn: async () => {
            return await NguoiThanAPI.getById(id)
        },
        initialData: initialData,
        enabled: !!id,
    })
}

/**
 * Hook to fetch người thân by mã nhân viên
 */
export function useNguoiThanByMaNhanVien(ma_nhan_vien: number, initialData?: NguoiThan[]) {
    return useListQuery({
        queryKey: nguoiThanQueryKeys.byMaNhanVien(ma_nhan_vien),
        queryFn: async () => {
            return await NguoiThanAPI.getByMaNhanVien(ma_nhan_vien)
        },
        initialData: initialData,
        enabled: !!ma_nhan_vien,
    })
}

