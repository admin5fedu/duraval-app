"use client"

import { useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"

/**
 * Component tự động tính "Tỷ lệ" = (tổng_ck / tien_don_hang) * 100
 * Sử dụng useWatch để theo dõi thay đổi của tien_don_hang và tong_ck
 */
export function PhieuDeXuatBanHangFormAutoCalculate() {
  const { setValue } = useFormContext()
  const tienDonHang = useWatch({ name: "tien_don_hang" })
  const tongCk = useWatch({ name: "tong_ck" })

  useEffect(() => {
    // Tính toán tỷ lệ khi có cả tiền đơn hàng và tổng chiết khấu
    if (tienDonHang !== null && tienDonHang !== undefined && 
        tongCk !== null && tongCk !== undefined) {
      const tienDonHangNum = typeof tienDonHang === 'string' 
        ? parseFloat(tienDonHang.replace(/[,\s]/g, '')) 
        : Number(tienDonHang)
      const tongCkNum = typeof tongCk === 'string' 
        ? parseFloat(tongCk.replace(/[,\s]/g, '')) 
        : Number(tongCk)
      
      if (!isNaN(tienDonHangNum) && !isNaN(tongCkNum) && tienDonHangNum > 0) {
        const tyLe = (tongCkNum / tienDonHangNum) * 100
        setValue("ty_le", tyLe, { shouldValidate: false, shouldDirty: false })
      } else {
        setValue("ty_le", null, { shouldValidate: false, shouldDirty: false })
      }
    } else {
      setValue("ty_le", null, { shouldValidate: false, shouldDirty: false })
    }
  }, [tienDonHang, tongCk, setValue])

  return null
}

