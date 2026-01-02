"use client"

import { useEffect, useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { useNhanSuById } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks/use-nhan-su"

/**
 * Component tự động điền thông tin nhân viên khi nhan_vien_id thay đổi
 * Tự động set: ten_nhan_vien, phong_id, ma_phong, nhom_id, ma_nhom
 */
export function PhieuDeXuatBanHangFormAutoFillNhanVien() {
  const { setValue } = useFormContext()
  const nhanVienId = useWatch({ name: "nhan_vien_id" })

  // Convert nhan_vien_id to number
  const nhanVienIdNumber = useMemo(() => {
    if (!nhanVienId) return 0
    if (typeof nhanVienId === 'number') return nhanVienId
    if (typeof nhanVienId === 'string') {
      const num = parseInt(nhanVienId, 10)
      return isNaN(num) ? 0 : num
    }
    return 0
  }, [nhanVienId])

  // Fetch nhân viên khi có nhan_vien_id
  const { data: nhanVien } = useNhanSuById(
    nhanVienIdNumber > 0 ? nhanVienIdNumber : 0,
    undefined
  )

  useEffect(() => {
    if (nhanVien) {
      // Tự động điền thông tin nhân viên
      // ten_nhan_vien = ho_ten
      if (nhanVien.ho_ten) {
        setValue("ten_nhan_vien", nhanVien.ho_ten, { shouldValidate: false, shouldDirty: false })
      }
      
      // phong_id và ma_phong từ phong_ban_id và phong_ban
      if (nhanVien.phong_ban_id) {
        setValue("phong_id", nhanVien.phong_ban_id, { shouldValidate: false, shouldDirty: false })
      }
      if (nhanVien.phong_ban) {
        setValue("ma_phong", nhanVien.phong_ban, { shouldValidate: false, shouldDirty: false })
      }
      
      // nhom_id và ma_nhom từ nhom_id và nhom trong var_nhan_su
      const nhomId = (nhanVien as any).nhom_id
      if (nhomId !== null && nhomId !== undefined) {
        setValue("nhom_id", typeof nhomId === 'number' ? nhomId : Number(nhomId), { shouldValidate: false, shouldDirty: false })
      } else {
        setValue("nhom_id", null, { shouldValidate: false, shouldDirty: false })
      }
      
      // ma_nhom từ nhom (tên nhóm)
      if (nhanVien.nhom) {
        setValue("ma_nhom", nhanVien.nhom, { shouldValidate: false, shouldDirty: false })
      }
    } else if (!nhanVienId || nhanVienId === null || nhanVienId === undefined || nhanVienId === 0) {
      // Clear các field khi không có nhan_vien_id
      setValue("ten_nhan_vien", null, { shouldValidate: false, shouldDirty: false })
      setValue("ma_phong", null, { shouldValidate: false, shouldDirty: false })
      setValue("ma_nhom", null, { shouldValidate: false, shouldDirty: false })
      setValue("phong_id", null, { shouldValidate: false, shouldDirty: false })
      setValue("nhom_id", null, { shouldValidate: false, shouldDirty: false })
    }
  }, [nhanVien, nhanVienId, setValue])

  return null
}

