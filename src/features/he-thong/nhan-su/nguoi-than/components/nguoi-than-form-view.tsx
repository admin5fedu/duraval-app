"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { nguoiThanSchema } from "../schema"
import type { CreateNguoiThanInput, UpdateNguoiThanInput } from "../schema"
import { useCreateNguoiThan, useUpdateNguoiThan } from "../hooks/use-nguoi-than-mutations"
import { useNguoiThanById } from "../hooks/use-nguoi-than"
import { nguoiThanConfig } from "../config"
import { useMemo } from "react"
import { EmployeeComboboxField } from "@/shared/components/forms/employee-combobox-field"

const getSections = (): FormSection[] => [
  {
    title: "Người thân",
    fields: [
      { 
        name: "ma_nhan_vien", 
        label: "Nhân Viên", 
        type: "custom" as const,
        required: true,
        customComponent: EmployeeComboboxField,
      },
      { name: "ho_va_ten", label: "Họ và Tên", required: true },
      {
        name: "moi_quan_he",
        label: "Mối Quan Hệ",
        type: "toggle",
        required: true,
        options: [
          { label: "Cha", value: "Cha" },
          { label: "Mẹ", value: "Mẹ" },
          { label: "Vợ/Chồng", value: "Vợ/Chồng" },
          { label: "Con", value: "Con" },
          { label: "Anh/Chị/Em", value: "Anh/Chị/Em" },
          { label: "Khác", value: "Khác" },
        ],
      },
      { name: "ngay_sinh", label: "Ngày Sinh", type: "date" },
      { name: "so_dien_thoai", label: "Số Điện Thoại" },
    ]
  },
  {
    title: "Ghi Chú",
    fields: [
      { name: "ghi_chu", label: "Ghi Chú", type: "textarea", colSpan: 2 },
    ]
  }
]

interface NguoiThanFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function NguoiThanFormView({ id, onComplete, onCancel }: NguoiThanFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateNguoiThan()
  const updateMutation = useUpdateNguoiThan()
  
  // If id is provided, fetch existing data for edit mode
  const { data: existingData, isLoading } = useNguoiThanById(id || 0, undefined)
  
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id

  // Create sections - EmployeeComboboxField tự động load và sort employees
  const sections = useMemo(() => {
    return getSections()
  }, [])

  const handleSubmit = async (data: any) => {
    // Convert ma_nhan_vien from string to number
    const submitData = {
      ...data,
      ma_nhan_vien: Number(data.ma_nhan_vien)
    }
    
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, data: submitData as UpdateNguoiThanInput })
    } else {
      await createMutation.mutateAsync(submitData as CreateNguoiThanInput)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Fallback to default navigation
      if (returnTo === 'list') {
        navigate(nguoiThanConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${nguoiThanConfig.routePath}/${id}`)
      } else {
        navigate(nguoiThanConfig.routePath)
      }
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      // Fallback to default navigation
      const cancelUrl = returnTo === 'list' 
        ? nguoiThanConfig.routePath
        : (id ? `${nguoiThanConfig.routePath}/${id}` : nguoiThanConfig.routePath)
      navigate(cancelUrl)
    }
  }

  const cancelUrl = returnTo === 'list' 
    ? nguoiThanConfig.routePath
    : (id ? `${nguoiThanConfig.routePath}/${id}` : nguoiThanConfig.routePath)

  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  // Prepare default values - convert ma_nhan_vien to string for select
  const defaultValues = useMemo(() => {
    if (isEditMode && existingData) {
      return {
        ...existingData,
        ma_nhan_vien: String(existingData.ma_nhan_vien)
      }
    }
    return undefined
  }, [isEditMode, existingData])

  return (
    <GenericFormView
      title={isEditMode ? `Sửa Người Thân: ${existingData?.ho_va_ten || ''}` : "Thêm Mới Người Thân"}
      subtitle={isEditMode ? "Cập nhật thông tin người thân." : "Thêm người thân mới vào hệ thống."}
      schema={nguoiThanSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao: true })}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật người thân thành công" : "Thêm mới người thân thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật người thân" : "Có lỗi xảy ra khi thêm mới người thân"}
      defaultValues={defaultValues}
    />
  )
}

