"use client"

import { useFormContext, useWatch } from "react-hook-form"
import { useEffect } from "react"
import { useTrangThaiKhachBuon } from "@/features/ban-buon/thiet-lap-khach-buon/trang-thai-khach-buon/hooks/use-trang-thai-khach-buon"
import { useGiaiDoanKhachBuon } from "@/features/ban-buon/thiet-lap-khach-buon/giai-doan-khach-buon/hooks/use-giai-doan-khach-buon"
import { useLocalStorage } from "@/shared/hooks/useLocalStorage"
import { useAuthStore } from "@/shared/stores/auth-store"

/**
 * Component để tự động set các giá trị mặc định khi tạo mới:
 * - giai_doan_id: "chưa hợp tác"
 * - trang_thai_id: trạng thái mặc định khởi đầu (mac_dinh_khoi_dau = YES) của giai đoạn
 * - nguon: "Thị trường"
 * - nhom_nganh: "Phụ kiện tủ bếp"
 * - mien: "Miền Bắc"
 */
export function DanhSachKBFormAutoDefaults({ isEditMode }: { isEditMode: boolean }) {
  const { setValue } = useFormContext()
  const { data: giaiDoanList } = useGiaiDoanKhachBuon(undefined)
  const { data: trangThaiList } = useTrangThaiKhachBuon(undefined)
  const giaiDoanId = useWatch({ name: "giai_doan_id" })
  const nguon = useWatch({ name: "nguon" })
  const nhomNganh = useWatch({ name: "nhom_nganh" })
  const mien = useWatch({ name: "mien" })

  useEffect(() => {
    if (isEditMode) return

    // Set nguon mặc định
    if (!nguon) {
      setValue("nguon", "Thị trường", { shouldValidate: false })
    }

    // Set nhom_nganh mặc định (handle array for multiselect)
    if (!nhomNganh || (Array.isArray(nhomNganh) && nhomNganh.length === 0)) {
      setValue("nhom_nganh", ["Phụ kiện tủ bếp"], { shouldValidate: false })
    }

    // Set mien mặc định
    if (!mien) {
      setValue("mien", "Miền Bắc", { shouldValidate: false })
    }

    // Tìm giai đoạn "chưa hợp tác"
    if (giaiDoanList && !giaiDoanId) {
      const chuaHopTac = giaiDoanList.find((gd: any) => 
        gd.ten_giai_doan?.toLowerCase().includes("chưa hợp tác") ||
        gd.ten_giai_doan?.toLowerCase().includes("chua hop tac")
      )
      if (chuaHopTac) {
        setValue("giai_doan_id", String(chuaHopTac.id), { shouldValidate: false })
      }
    }
  }, [isEditMode, giaiDoanList, giaiDoanId, nguon, nhomNganh, mien, setValue])

  useEffect(() => {
    if (isEditMode) return

    // Tìm trạng thái mặc định khởi đầu (mac_dinh_khoi_dau = YES) theo giai_doan_id
    if (giaiDoanId && trangThaiList) {
      const giaiDoanIdNum = typeof giaiDoanId === 'string' ? parseFloat(giaiDoanId) : giaiDoanId
      if (!isNaN(giaiDoanIdNum)) {
        const defaultTrangThai = trangThaiList.find((tt: any) => 
          tt.giai_doan_id === giaiDoanIdNum && tt.mac_dinh_khoi_dau === "YES"
        )
        if (defaultTrangThai) {
          setValue("trang_thai_id", String(defaultTrangThai.id), { shouldValidate: false })
        }
      }
    }
  }, [isEditMode, giaiDoanId, trangThaiList, setValue])

  return null
}

/**
 * Component để tự động cập nhật trạng thái khi giai đoạn thay đổi
 */
export function DanhSachKBFormAutoUpdateTrangThai({ isEditMode }: { isEditMode: boolean }) {
  const { setValue } = useFormContext()
  const { data: trangThaiList } = useTrangThaiKhachBuon(undefined)
  const giaiDoanId = useWatch({ name: "giai_doan_id" })
  const trangThaiId = useWatch({ name: "trang_thai_id" })

  useEffect(() => {
    if (isEditMode) return // Chỉ auto-update khi tạo mới

    if (giaiDoanId && trangThaiList) {
      const giaiDoanIdNum = typeof giaiDoanId === 'string' ? parseFloat(giaiDoanId) : giaiDoanId
      if (!isNaN(giaiDoanIdNum)) {
        // Tìm trạng thái mặc định khởi đầu (mac_dinh_khoi_dau = YES) của giai đoạn mới
        const defaultTrangThai = trangThaiList.find((tt: any) => 
          tt.giai_doan_id === giaiDoanIdNum && tt.mac_dinh_khoi_dau === "YES"
        )
        
        if (defaultTrangThai) {
          // Chỉ update nếu trạng thái hiện tại không thuộc giai đoạn mới
          const trangThaiIdNum = typeof trangThaiId === 'string' ? parseFloat(trangThaiId) : trangThaiId
          const currentTrangThai = trangThaiList.find((tt: any) => tt.id === trangThaiIdNum)
          if (!currentTrangThai || currentTrangThai.giai_doan_id !== giaiDoanIdNum) {
            setValue("trang_thai_id", String(defaultTrangThai.id), { shouldValidate: false })
          }
        }
      }
    }
  }, [isEditMode, giaiDoanId, trangThaiList, trangThaiId, setValue])

  return null
}

/**
 * Component để tự động nối địa chỉ TSN khi các field địa chỉ thay đổi
 */
export function DanhSachKBFormAutoAddressTSN() {
  const { setValue } = useFormContext()
  const tsnSoNha = useWatch({ name: "tsn_so_nha" })
  const tsnTenTinhThanh = useWatch({ name: "tsn_ten_tinh_thanh" })
  const tsnTenQuanHuyen = useWatch({ name: "tsn_ten_quan_huyen" })
  const tsnTenPhuongXa = useWatch({ name: "tsn_ten_phuong_xa" })

  useEffect(() => {
    const parts: string[] = []
    
    if (tsnSoNha) parts.push(String(tsnSoNha))
    if (tsnTenPhuongXa) parts.push(String(tsnTenPhuongXa))
    if (tsnTenQuanHuyen) parts.push(String(tsnTenQuanHuyen))
    if (tsnTenTinhThanh) parts.push(String(tsnTenTinhThanh))

    const diaChiDayDu = parts.length > 0 ? parts.join(", ") : ""
    setValue("tsn_dia_chi_day_du", diaChiDayDu, { shouldValidate: false })
  }, [tsnSoNha, tsnTenPhuongXa, tsnTenQuanHuyen, tsnTenTinhThanh, setValue])

  return null
}

/**
 * Component để tự động nối địa chỉ SSN khi các field địa chỉ thay đổi
 */
export function DanhSachKBFormAutoAddressSSN() {
  const { setValue } = useFormContext()
  const ssnSoNha = useWatch({ name: "ssn_so_nha" })
  const ssnTenTinhThanh = useWatch({ name: "ssn_ten_tinh_thanh" })
  const ssnTenPhuongXa = useWatch({ name: "ssn_ten_phuong_xa" })

  useEffect(() => {
    const parts: string[] = []
    
    if (ssnSoNha) parts.push(String(ssnSoNha))
    if (ssnTenPhuongXa) parts.push(String(ssnTenPhuongXa))
    if (ssnTenTinhThanh) parts.push(String(ssnTenTinhThanh))

    const diaChiDayDu = parts.length > 0 ? parts.join(", ") : ""
    setValue("ssn_dia_chi_day_du", diaChiDayDu, { shouldValidate: false })
  }, [ssnSoNha, ssnTenPhuongXa, ssnTenTinhThanh, setValue])

  return null
}

/**
 * Component để tự động điền giá trị Tele Sale và Thị Trường từ localStorage
 * dựa trên bản ghi gần nhất mà user đã tạo.
 */
/**
 * Component để tự động điền giá trị Tele Sale và Thị Trường từ localStorage
 * dựa trên bản ghi gần nhất mà user đã tạo.
 */
export function DanhSachKBFormAutoFillLastValues({ isEditMode }: { isEditMode: boolean }) {
  const { setValue } = useFormContext()
  const { employee } = useAuthStore()
  const [lastTeleSaleId] = useLocalStorage<number | null>(`last_tele_sale_id_${employee?.ma_nhan_vien}`, null)
  const [lastThiTruongId] = useLocalStorage<number | null>(`last_thi_truong_id_${employee?.ma_nhan_vien}`, null)

  useEffect(() => {
    if (isEditMode) return

    if (lastTeleSaleId !== null) {
      setValue("tele_sale_id", lastTeleSaleId, { shouldValidate: false })
    }
    if (lastThiTruongId !== null) {
      setValue("thi_truong_id", lastThiTruongId, { shouldValidate: false })
    }
  }, [isEditMode, lastTeleSaleId, lastThiTruongId, setValue])

  return null
}
