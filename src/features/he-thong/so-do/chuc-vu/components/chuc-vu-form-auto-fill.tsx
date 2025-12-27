"use client"

import { useEffect } from "react"
import { useWatch, useFormContext } from "react-hook-form"

interface ChucVuFormAutoFillProps {
  capBacList?: Array<{ id?: number; ma_cap_bac: string; ten_cap_bac: string }>
  phongBanList?: Array<{ id?: number; ma_phong_ban: string }>
}

/**
 * Component để tự động điền các trường liên quan khi chọn cap_bac_id hoặc phong_ban_id
 */
export function ChucVuFormAutoFill({ capBacList, phongBanList }: ChucVuFormAutoFillProps) {
  const { setValue } = useFormContext()
  
  // Watch các trường cần theo dõi
  const capBacId = useWatch({ name: "cap_bac_id" })
  const phongBanId = useWatch({ name: "phong_ban_id" })
  
  // Tự động điền ma_cap_bac và ten_cap_bac khi chọn cap_bac_id
  useEffect(() => {
    if (capBacId && capBacList) {
      const selectedCapBac = capBacList.find((cb) => cb.id === capBacId)
      if (selectedCapBac) {
        setValue("ma_cap_bac", selectedCapBac.ma_cap_bac, { shouldValidate: false, shouldDirty: false })
        setValue("ten_cap_bac", selectedCapBac.ten_cap_bac, { shouldValidate: false, shouldDirty: false })
      }
    } else if (!capBacId) {
      // Clear khi không chọn
      setValue("ma_cap_bac", "", { shouldValidate: false, shouldDirty: false })
      setValue("ten_cap_bac", null, { shouldValidate: false, shouldDirty: false })
    }
  }, [capBacId, capBacList, setValue])
  
  // Tự động điền ma_phong_ban khi chọn phong_ban_id
  useEffect(() => {
    if (phongBanId && phongBanList) {
      const selectedPhongBan = phongBanList.find((pb) => pb.id === phongBanId)
      if (selectedPhongBan) {
        setValue("ma_phong_ban", selectedPhongBan.ma_phong_ban, { shouldValidate: false, shouldDirty: false })
      }
    } else if (!phongBanId) {
      // Clear khi không chọn
      setValue("ma_phong_ban", "", { shouldValidate: false, shouldDirty: false })
    }
  }, [phongBanId, phongBanList, setValue])
  
  return null
}

