"use client"

import * as React from "react"
import { useMemo } from "react"
import { GenericFormView, type FormSection } from "@/shared/components"
import { phieuDeXuatBanHangSchema, createPhieuDeXuatBanHangSchema } from "../schema"
import type { CreatePhieuDeXuatBanHangInput, UpdatePhieuDeXuatBanHangInput } from "../schema"
import { useCreatePhieuDeXuatBanHang, useUpdatePhieuDeXuatBanHang } from "../hooks"
import { usePhieuDeXuatBanHangById } from "../hooks"
import { NhanVienSelectFormField } from "./nhan-vien-select-form-field"
import { PhieuDeXuatBanHangFormAutoFillNhanVien } from "./phieu-de-xuat-ban-hang-form-auto-fill-nhan-vien"
import { PhieuDeXuatBanHangFormAutoCalculate } from "./phieu-de-xuat-ban-hang-form-auto-calculate"
import { useFormContext } from "react-hook-form"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useLoaiPhieu } from "@/features/kinh-doanh/quy-ho-tro-ban-hang/loai-phieu-hang-muc/loai-phieu/hooks"
import { useHangMucByLoaiPhieuId } from "@/features/kinh-doanh/quy-ho-tro-ban-hang/loai-phieu-hang-muc/hang-muc/hooks/use-hang-muc"
import { HangMucToggleFormField } from "./hang-muc-toggle-form-field"

// Wrapper component for NhanVienSelectFormField
const NhanVienSelectWrapper = React.forwardRef<HTMLButtonElement, { 
  value?: number | null; 
  onChange: (value: number | null) => void; 
  disabled?: boolean;
  id?: string;
  name?: string;
  onBlur?: () => void;
}>(({ value, onChange, disabled, id, name, onBlur }, ref) => {
  return (
    <NhanVienSelectFormField 
      ref={ref}
      name={name || "nhan_vien_id"}
      value={value || null} 
      onChange={onChange} 
      disabled={disabled}
      id={id}
      onBlur={onBlur}
      placeholder="Chọn nhân viên..."
    />
  )
})
NhanVienSelectWrapper.displayName = "NhanVienSelectWrapper"

// Wrapper component for HangMucToggleFormField
const HangMucToggleWrapper = React.forwardRef<HTMLDivElement, { 
  value?: string | null; 
  onChange: (value: string | null) => void; 
  disabled?: boolean;
  id?: string;
  name?: string;
  onBlur?: () => void;
}>(({ value, onChange, disabled, id, onBlur }) => {
  return (
    <HangMucToggleFormField
      value={value || null}
      onChange={onChange}
      disabled={disabled}
      id={id}
      onBlur={onBlur}
    />
  )
})
HangMucToggleWrapper.displayName = "HangMucToggleWrapper"

// Component để auto-fill ten_loai_phieu và ten_hang_muc (ẩn fields nhưng vẫn cần fill data)
function PhieuDeXuatBanHangFormAutoFillLoaiPhieuHangMuc() {
  const { setValue, watch } = useFormContext()
  const loaiPhieuId = watch("loai_phieu_id")
  const hangMucId = watch("hang_muc_id")
  const { data: loaiPhieuList } = useLoaiPhieu()
  
  // Convert string to number for API call
  const loaiPhieuIdNum = useMemo(() => {
    if (!loaiPhieuId) return 0
    return typeof loaiPhieuId === 'string' ? Number(loaiPhieuId) : loaiPhieuId
  }, [loaiPhieuId])
  
  const { data: hangMucList } = useHangMucByLoaiPhieuId(loaiPhieuIdNum)

  React.useEffect(() => {
    if (loaiPhieuIdNum && loaiPhieuList) {
      const loaiPhieu = loaiPhieuList.find(lp => lp.id === loaiPhieuIdNum)
      if (loaiPhieu?.ten_loai_phieu) {
        setValue("ten_loai_phieu", loaiPhieu.ten_loai_phieu, { shouldValidate: false, shouldDirty: false })
      }
    } else {
      setValue("ten_loai_phieu", null, { shouldValidate: false, shouldDirty: false })
    }
  }, [loaiPhieuIdNum, loaiPhieuList, setValue])

  React.useEffect(() => {
    const hangMucIdNum = hangMucId ? (typeof hangMucId === 'string' ? Number(hangMucId) : hangMucId) : null
    if (hangMucIdNum && hangMucList) {
      const hangMuc = hangMucList.find(hm => hm.id === hangMucIdNum)
      if (hangMuc?.ten_hang_muc) {
        setValue("ten_hang_muc", hangMuc.ten_hang_muc, { shouldValidate: false, shouldDirty: false })
      }
    } else {
      setValue("ten_hang_muc", null, { shouldValidate: false, shouldDirty: false })
    }
  }, [hangMucId, hangMucList, setValue])

  return null
}

// Get ngày hiện tại (YYYY-MM-DD format)
const getToday = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface PhieuDeXuatBanHangFormViewProps {
  id?: number
  onComplete?: () => void
  onCancel?: () => void
}

export function PhieuDeXuatBanHangFormView({ 
  id, 
  onComplete, 
  onCancel 
}: PhieuDeXuatBanHangFormViewProps) {
  const { data: existingData, isLoading: isLoadingData } = usePhieuDeXuatBanHangById(id || 0)
  const createMutation = useCreatePhieuDeXuatBanHang()
  const updateMutation = useUpdatePhieuDeXuatBanHang()
  const { employee } = useAuthStore()
  const { data: loaiPhieuList } = useLoaiPhieu()

  const isEditMode = !!id

  // Generate loai phieu toggle options
  const loaiPhieuOptions = useMemo(() => {
    if (!loaiPhieuList) return []
    return loaiPhieuList
      .filter(lp => lp.id !== undefined)
      .map(lp => ({
        label: lp.ten_loai_phieu || `ID: ${lp.id}`,
        value: String(lp.id)
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [loaiPhieuList])

  // Set default values
  const defaultValues = useMemo(() => {
    if (existingData) {
      return {
        ...existingData,
        // Convert number IDs to string for toggle buttons
        loai_phieu_id: existingData.loai_phieu_id ? String(existingData.loai_phieu_id) : null,
        hang_muc_id: existingData.hang_muc_id ? String(existingData.hang_muc_id) : null,
      }
    }
    // Create mode: set ngày, nhan_vien_id và loai_phieu_id = 8 (hỗ trợ bán hàng)
    return {
      ngay: getToday(),
      nhan_vien_id: employee?.ma_nhan_vien || null,
      loai_phieu_id: "8", // Mặc định chọn loại phiếu ID 8 (hỗ trợ bán hàng)
    }
  }, [existingData, employee])

  const handleSubmit = async (data: CreatePhieuDeXuatBanHangInput | UpdatePhieuDeXuatBanHangInput) => {
    // Convert string IDs back to numbers for submission
    const submitData = { ...data }
    if ((submitData as any).loai_phieu_id) {
      (submitData as any).loai_phieu_id = typeof (submitData as any).loai_phieu_id === 'string' 
        ? Number((submitData as any).loai_phieu_id) 
        : (submitData as any).loai_phieu_id
    }
    if ((submitData as any).hang_muc_id) {
      (submitData as any).hang_muc_id = typeof (submitData as any).hang_muc_id === 'string' 
        ? Number((submitData as any).hang_muc_id) 
        : (submitData as any).hang_muc_id
    }
    
    // Ensure ngay is set to today for create mode
    if (!isEditMode) {
      (submitData as any).ngay = getToday()
    }
    // Ensure nhan_vien_id is set from employee
    if (!isEditMode && employee?.ma_nhan_vien) {
      (submitData as any).nhan_vien_id = employee.ma_nhan_vien
    }
    
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: submitData as UpdatePhieuDeXuatBanHangInput })
    } else {
      await createMutation.mutateAsync(submitData as CreatePhieuDeXuatBanHangInput)
    }
    onComplete?.()
  }

  if (isLoadingData) {
    return <div>Đang tải...</div>
  }

  const sections: FormSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { 
          name: "ngay", 
          label: "Ngày", 
          type: "date",
          disabled: true,
          required: true
        },
        { 
          name: "nhan_vien_id", 
          label: "Nhân viên", 
          type: "custom",
          customComponent: NhanVienSelectWrapper,
          required: true,
          disabled: true
        },
      ]
    },
    {
      title: "Thông Tin Phiếu",
      fields: [
        { 
          name: "loai_phieu_id", 
          label: "Loại phiếu", 
          type: "toggle",
          options: loaiPhieuOptions,
          required: true
        },
        { 
          name: "hang_muc_id", 
          label: "Hạng mục", 
          type: "custom",
          customComponent: HangMucToggleWrapper,
          required: true
        },
        { 
          name: "mo_ta", 
          label: "Mô tả", 
          type: "textarea",
          required: true
        },
        { 
          name: "so_hoa_don", 
          label: "Số hóa đơn", 
          type: "text"
        },
        { 
          name: "tien_don_hang", 
          label: "Tiền đơn hàng", 
          type: "number",
          formatThousands: true,
          required: true
        },
        { 
          name: "tong_ck", 
          label: "Tổng chiết khấu", 
          type: "number",
          formatThousands: true,
          required: true
        },
        { 
          name: "ty_le", 
          label: "Tỷ lệ", 
          type: "number",
          disabled: true,
          suffix: "%",
          allowDecimals: true,
          formatThousands: true
        },
        { 
          name: "hinh_anh", 
          label: "Hình ảnh", 
          type: "image",
          imageFolder: "phieu-de-xuat-ban-hang",
          imageMaxSize: 10
        },
      ]
    },
  ]

  return (
    <GenericFormView
      schema={isEditMode ? phieuDeXuatBanHangSchema : createPhieuDeXuatBanHangSchema}
      defaultValues={defaultValues}
      sections={sections}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      title={isEditMode ? "Sửa phiếu đề xuất bán hàng" : "Thêm mới phiếu đề xuất bán hàng"}
      submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
    >
      <PhieuDeXuatBanHangFormAutoFillNhanVien />
      <PhieuDeXuatBanHangFormAutoCalculate />
      <PhieuDeXuatBanHangFormAutoFillLoaiPhieuHangMuc />
    </GenericFormView>
  )
}
