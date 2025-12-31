"use client"

import { createUseListQuery, createUseDetailQuery } from "@/lib/react-query"
import { useRelatedQuery } from "@/lib/react-query/hooks"
import { hangMucQueryKeys } from "@/lib/react-query/query-keys"
import { HangMucAPI } from "../services/hang-muc.api"
import type { HangMuc } from "../schema"

export const useHangMuc = createUseListQuery<HangMuc>({
    queryKeys: hangMucQueryKeys,
    api: { getAll: HangMucAPI.getAll },
})

export const useHangMucById = createUseDetailQuery<HangMuc>({
    queryKeys: hangMucQueryKeys,
    api: { getById: HangMucAPI.getById },
})

/**
 * Hook to fetch list of hạng mục by loai_phieu_id
 * ⚡ Performance: Uses useRelatedQuery with automatic cache strategy
 */
export function useHangMucByLoaiPhieuId(loaiPhieuId: number) {
    return useRelatedQuery<HangMuc[]>({
        queryKey: hangMucQueryKeys?.byLoaiPhieuId?.(loaiPhieuId) ?? ['hang-muc', 'by-loai-phieu-id', loaiPhieuId],
        queryFn: async () => {
            const data = await HangMucAPI.getByLoaiPhieuId(loaiPhieuId)
            return data
        },
        enabled: !!loaiPhieuId,
    })
}

