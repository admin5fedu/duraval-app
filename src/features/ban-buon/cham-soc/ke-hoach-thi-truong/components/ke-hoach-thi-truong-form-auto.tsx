"use client"

import { useFormContext, useWatch } from "react-hook-form"
import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { danhSachKBQueryKeys } from "@/lib/react-query/query-keys"
import { DanhSachKBAPI } from "@/features/ban-buon/thong-tin-khach-hang/du-lieu-khach-buon/danh-sach-KB/services/danh-sach-KB.api"

/**
 * Component để tự động set tsn_tinh_thanh_id từ khách buôn được chọn
 */
export function KeHoachThiTruongFormAutoTinhThanh({ isEditMode: _isEditMode }: { isEditMode: boolean }) {
  const { setValue } = useFormContext()
  const khachBuonId = useWatch({ name: "khach_buon_id" })
  
  // Fetch khách buôn data để lấy tsn_tinh_thanh_id
  const khachBuonIdNum = khachBuonId ? (typeof khachBuonId === 'string' ? parseFloat(khachBuonId) : khachBuonId) : null
  const { data: khachBuonData } = useQuery({
    queryKey: [...danhSachKBQueryKeys.detail(khachBuonIdNum ?? 0)],
    queryFn: () => DanhSachKBAPI.getById(khachBuonIdNum!),
    enabled: !!khachBuonIdNum && !isNaN(khachBuonIdNum!)
  })

  useEffect(() => {
    if (!khachBuonData || !khachBuonData.tsn_tinh_thanh_id) return
    
    // Set tsn_tinh_thanh_id từ khách buôn
    setValue("tsn_tinh_thanh_id", String(khachBuonData.tsn_tinh_thanh_id), { shouldValidate: false })
  }, [khachBuonData, setValue])

  return null
}

