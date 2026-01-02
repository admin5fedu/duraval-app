"use client"

import { useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"

/**
 * Component tự động tính "Còn dư" = "Số tiền quỹ" - "Đã dùng"
 * Sử dụng useWatch để theo dõi thay đổi của so_tien_quy và da_dung
 */
export function QuyHTBHTheoThangFormAutoCalculate() {
  const { setValue } = useFormContext()
  const soTienQuy = useWatch({ name: "so_tien_quy" })
  const daDung = useWatch({ name: "da_dung" })

  useEffect(() => {
    // Tính toán còn dư khi có cả số tiền quỹ và đã dùng
    if (soTienQuy !== null && soTienQuy !== undefined && 
        daDung !== null && daDung !== undefined) {
      const soTienQuyNum = typeof soTienQuy === 'string' ? parseFloat(soTienQuy.replace(/[,\s]/g, '')) : Number(soTienQuy)
      const daDungNum = typeof daDung === 'string' ? parseFloat(daDung.replace(/[,\s]/g, '')) : Number(daDung)
      
      if (!isNaN(soTienQuyNum) && !isNaN(daDungNum)) {
        const conDu = soTienQuyNum - daDungNum
        setValue("con_du", conDu, { shouldValidate: false, shouldDirty: false })
      }
    } else {
      setValue("con_du", null, { shouldValidate: false, shouldDirty: false })
    }
  }, [soTienQuy, daDung, setValue])

  return null
}

