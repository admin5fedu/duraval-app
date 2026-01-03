"use client"

import { useQuery } from "@tanstack/react-query"
import { viecHangNgayQueryKeys } from "@/lib/react-query/query-keys"
import { ViecHangNgayAPI } from "../../viec-hang-ngay/services/viec-hang-ngay.api"
import type { ViecHangNgay } from "../../viec-hang-ngay/schema"

/**
 * Hook to fetch việc hàng ngày by date and employee
 * 
 * ✅ Tối ưu hóa cho widget nhập liệu:
 * - staleTime: 0 để luôn lấy dữ liệu mới nhất khi queryKey (ngày) thay đổi
 * - refetchOnMount: true để đảm bảo refetch khi mount với query key mới
 * - queryKey bao gồm đầy đủ ma_nhan_vien và ngay_bao_cao để cache chính xác
 */
export function useViecHangNgayByDateAndEmployee(
    ma_nhan_vien: number | undefined,
    ngay_bao_cao: string | undefined,
    enabled: boolean = true
) {
    return useQuery({
        queryKey: viecHangNgayQueryKeys?.byDateAndEmployee?.(
            ma_nhan_vien ?? 0,
            ngay_bao_cao ?? ""
        ) ?? ['viec-hang-ngay', ma_nhan_vien ?? 0, ngay_bao_cao ?? ""],
        queryFn: async (): Promise<ViecHangNgay | null> => {
            if (!ma_nhan_vien || !ngay_bao_cao) {
                return null
            }
            return await ViecHangNgayAPI.getByDateAndEmployee(ma_nhan_vien, ngay_bao_cao)
        },
        enabled: enabled && !!ma_nhan_vien && !!ngay_bao_cao,
        staleTime: 0, // ✅ Luôn refetch khi query key thay đổi (ngày thay đổi)
        gcTime: 1000 * 60 * 5, // 5 minutes - giữ cache để tối ưu performance
        refetchOnMount: true, // ✅ Luôn refetch khi mount với query key mới
        refetchOnWindowFocus: false, // Không refetch khi focus window để tránh refetch không cần thiết
    })
}

