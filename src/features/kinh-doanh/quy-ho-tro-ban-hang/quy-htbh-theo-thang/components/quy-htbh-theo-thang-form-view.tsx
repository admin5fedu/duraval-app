"use client"

import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useMemo } from "react"
import { GenericFormView, type FormSection } from "@/shared/components"
import { quyHTBHTheoThangSchema, createQuyHTBHTheoThangSchema } from "../schema"
import type { CreateQuyHTBHTheoThangInput, UpdateQuyHTBHTheoThangInput } from "../schema"
import { useCreateQuyHTBHTheoThang, useUpdateQuyHTBHTheoThang } from "../hooks"
import { useQuyHTBHTheoThangById } from "../hooks"
import { quyHTBHTheoThangConfig } from "../config"
import { QuyHTBHTheoThangFormAutoCalculate } from "./quy-htbh-theo-thang-form-auto-calculate"
import { QuyHTBHTheoThangFormAutoFillNhanVien } from "./quy-htbh-theo-thang-form-auto-fill-nhan-vien"
import { NhanVienSelectFormField } from "./nhan-vien-select-form-field"

// Get năm hiện tại
const getCurrentYear = () => {
  return new Date().getFullYear()
}

// Get tháng hiện tại
const getCurrentMonth = () => {
  return new Date().getMonth() + 1 // getMonth() trả về 0-11, cần +1 để có 1-12
}

// Generate tháng toggle options (1-12)
const generateThangToggleOptions = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    label: (i + 1).toString(),
    value: (i + 1).toString()
  }))
}

// Generate quỹ toggle options
const generateQuyToggleOptions = () => {
  return [
    { label: "Chiết khấu", value: "Chiết khấu" },
    { label: "Hàng thanh lý", value: "Hàng thanh lý" }
  ]
}

// Wrapper component for NhanVienSelectFormField to work with form field
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

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { 
        name: "nam", 
        label: "Năm", 
        type: "number",
        required: true
      },
      { 
        name: "thang", 
        label: "Tháng", 
        type: "toggle",
        options: generateThangToggleOptions(),
        required: true
      },
      { 
        name: "nhan_vien_id", 
        label: "Nhân viên", 
        type: "custom",
        customComponent: NhanVienSelectWrapper,
        required: true
      },
      { 
        name: "phong_id", 
        label: "Phòng ban", 
        type: "phong-ban-select",
        disabled: true
      },
      { 
        name: "nhom_id", 
        label: "Nhóm", 
        type: "phong-ban-select",
        disabled: true
      },
    ]
  },
  {
    title: "Thông Tin Quỹ",
    fields: [
      { 
        name: "quy", 
        label: "Quỹ", 
        type: "toggle",
        options: generateQuyToggleOptions(),
        required: true
      },
      { 
        name: "so_tien_quy", 
        label: "Số tiền quỹ", 
        type: "number",
        formatThousands: true,
        required: true
      },
      { 
        name: "da_dung", 
        label: "Đã dùng", 
        type: "number",
        formatThousands: true,
        disabled: true
      },
      { 
        name: "con_du", 
        label: "Còn dư", 
        type: "number",
        formatThousands: true,
        disabled: true
      },
    ]
  },
  {
    title: "Ghi Chú",
    fields: [
      { name: "ghi_chu", label: "Ghi chú", type: "textarea", colSpan: 2 },
    ]
  }
]

interface QuyHTBHTheoThangFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function QuyHTBHTheoThangFormView({ id, onComplete, onCancel }: QuyHTBHTheoThangFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateQuyHTBHTheoThang()
  const updateMutation = useUpdateQuyHTBHTheoThang()
  
  // If id is provided, fetch existing data for edit mode
  const { data: existingData } = useQuyHTBHTheoThangById(id || 0, undefined)
  
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id

  // Set default values: năm và tháng hiện tại cho create mode
  const defaultValues = useMemo(() => {
    if (existingData) {
      return existingData
    }
    // Create mode: set năm và tháng hiện tại
    return {
      nam: getCurrentYear(),
      thang: getCurrentMonth(),
    }
  }, [existingData])

  // Tính toán còn dư tự động
  const calculateConDu = useMemo(() => {
    return (soTienQuy: number | null | undefined, daDung: number | null | undefined): number | null => {
      if (soTienQuy === null || soTienQuy === undefined || daDung === null || daDung === undefined) {
        return null
      }
      return soTienQuy - daDung
    }
  }, [])

  const sections = getSections()

  const handleSubmit = async (data: any) => {
    try {
      // Tự động tính còn dư trước khi submit
      const soTienQuy = data.so_tien_quy !== null && data.so_tien_quy !== undefined ? Number(data.so_tien_quy) : null
      const daDung = data.da_dung !== null && data.da_dung !== undefined ? Number(data.da_dung) : null
      
      if (soTienQuy !== null && daDung !== null) {
        data.con_du = calculateConDu(soTienQuy, daDung)
      } else {
        data.con_du = null
      }

      // Convert năm và tháng từ string sang number nếu có
      if (data.nam !== null && data.nam !== undefined) {
        data.nam = typeof data.nam === 'string' ? Number(data.nam) : data.nam
      }
      if (data.thang !== null && data.thang !== undefined) {
        data.thang = typeof data.thang === 'string' ? Number(data.thang) : data.thang
      }
      // Convert nhan_vien_id từ string sang number nếu có
      if (data.nhan_vien_id !== null && data.nhan_vien_id !== undefined) {
        data.nhan_vien_id = typeof data.nhan_vien_id === 'string' ? Number(data.nhan_vien_id) : data.nhan_vien_id
      }

      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, input: data as UpdateQuyHTBHTheoThangInput })
      } else {
        await createMutation.mutateAsync(data as CreateQuyHTBHTheoThangInput)
      }
    } catch (error) {
      // Re-throw error để GenericFormView xử lý và hiển thị toast
      throw error
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Navigate based on returnTo
      if (returnTo === 'detail' && id) {
        navigate(`${quyHTBHTheoThangConfig.routePath}/${id}`)
      } else {
        navigate(quyHTBHTheoThangConfig.routePath)
      }
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      if (returnTo === 'detail' && id) {
        navigate(`${quyHTBHTheoThangConfig.routePath}/${id}`)
      } else {
        navigate(quyHTBHTheoThangConfig.routePath)
      }
    }
  }

  return (
    <GenericFormView
      title={isEditMode ? "Sửa quỹ HTBH theo tháng" : "Thêm mới quỹ HTBH theo tháng"}
      subtitle={isEditMode ? `Cập nhật thông tin quỹ HTBH theo tháng #${id}` : "Nhập thông tin quỹ HTBH theo tháng mới"}
      schema={isEditMode ? quyHTBHTheoThangSchema : createQuyHTBHTheoThangSchema}
      defaultValues={defaultValues}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
    >
      <QuyHTBHTheoThangFormAutoCalculate />
      <QuyHTBHTheoThangFormAutoFillNhanVien />
    </GenericFormView>
  )
}

