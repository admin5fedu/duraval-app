"use client"

import { useQuery } from "@tanstack/react-query"
import { viecHangNgayQueryKeys } from "@/lib/react-query/query-keys"
import { ViecHangNgayAPI } from "../../viec-hang-ngay/services/viec-hang-ngay.api"
import type { ViecHangNgay } from "../../viec-hang-ngay/schema"

/**
 * Hook to fetch việc hàng ngày by date and employee
 */
export function useViecHangNgayByDateAndEmployee(
    ma_nhan_vien: number | undefined,
    ngay_bao_cao: string | undefined,
    enabled: boolean = true
) {
    return useQuery({
        queryKey: viecHangNgayQueryKeys.byDateAndEmployee(
            ma_nhan_vien || 0,
            ngay_bao_cao || ""
        ),
        queryFn: async (): Promise<ViecHangNgay | null> => {
            if (!ma_nhan_vien || !ngay_bao_cao) {
                return null
            }
            return await ViecHangNgayAPI.getByDateAndEmployee(ma_nhan_vien, ngay_bao_cao)
        },
        enabled: enabled && !!ma_nhan_vien && !!ngay_bao_cao,
        staleTime: 1000 * 60, // 1 minute - data can be stale for a bit
        gcTime: 1000 * 60 * 5, // 5 minutes
    })
}

