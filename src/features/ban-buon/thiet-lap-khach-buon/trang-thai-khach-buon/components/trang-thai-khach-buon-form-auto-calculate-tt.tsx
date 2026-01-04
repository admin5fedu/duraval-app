"use client"

import { useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { useTrangThaiKhachBuon } from "../hooks/use-trang-thai-khach-buon"

/**
 * Component tự động tính tt (thứ tự) dựa trên giai_doan_id đã chọn
 * Chỉ tính cho new record (không phải edit mode)
 */
export function TrangThaiKhachBuonFormAutoCalculateTt({ isEditMode }: { isEditMode: boolean }) {
  const { setValue } = useFormContext()
  const { data: allData } = useTrangThaiKhachBuon(undefined)
  const giaiDoanId = useWatch({ name: "giai_doan_id" })

  useEffect(() => {
    // Chỉ tính cho new record (không phải edit mode)
    if (isEditMode) return
    
    if (giaiDoanId && allData) {
      const giaiDoanIdNum = typeof giaiDoanId === 'string' ? parseFloat(giaiDoanId) : giaiDoanId
      if (!isNaN(giaiDoanIdNum)) {
        // Tính max tt cho giai_doan_id đã chọn
        const maxTt = allData
          ?.filter(item => item.giai_doan_id === giaiDoanIdNum)
          .reduce((max, item) => {
            const currentTt = item.tt ?? 0
            return currentTt > max ? currentTt : max
          }, 0) ?? 0
        
        // Set tt = max + 1
        setValue("tt", maxTt + 1, { shouldValidate: false })
      }
    }
  }, [giaiDoanId, allData, isEditMode, setValue])

  return null
}

