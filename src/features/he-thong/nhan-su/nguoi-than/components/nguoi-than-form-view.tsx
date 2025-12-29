"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { nguoiThanSchema } from "../schema"
import type { CreateNguoiThanInput, UpdateNguoiThanInput } from "../schema"
import { useCreateNguoiThan, useUpdateNguoiThan } from "../hooks/use-nguoi-than-mutations"
import { useNguoiThanById } from "../hooks/use-nguoi-than"
import { nguoiThanConfig } from "../config"
import { useMemo } from "react"
import { z } from "zod"
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
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  // để đảm bảo thứ tự hooks nhất quán giữa các lần render
  
  // Create sections - EmployeeComboboxField tự động load và sort employees
  const sections = useMemo(() => {
    return getSections()
  }, [])
  
  // If id is provided, fetch existing data for edit mode
  // ✅ QUAN TRỌNG: Hook luôn được gọi với cùng signature để tránh "Rendered more hooks"
  const { data: existingData, isLoading } = useNguoiThanById(id ?? 0, undefined)

  // ✅ QUAN TRỌNG: Tạo schema cho form chấp nhận string cho ma_nhan_vien
  // vì EmployeeComboboxField trả về string, sau đó transform trong handleSubmit
  // Phải được tạo TRƯỚC early return
  const formSchema = useMemo(() => {
    return nguoiThanSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao: true })
      .extend({
        ma_nhan_vien: z.union([
          z.number({ required_error: "Mã nhân viên là bắt buộc" }),
          z.string().min(1, "Mã nhân viên là bắt buộc")
        ])
      })
  }, [])

  // Prepare default values - convert ma_nhan_vien to string for select
  // Phải được tạo TRƯỚC early return
  const defaultValues = useMemo(() => {
    if (id && existingData) {
      return {
        ...existingData,
        ma_nhan_vien: String(existingData.ma_nhan_vien)
      }
    }
    return undefined
  }, [id, existingData])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (id && isLoading) {
    return <div>Đang tải...</div>
  }

  // Computed values (không phải hooks, có thể đặt sau early return)
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  const cancelUrl = returnTo === 'list' 
    ? nguoiThanConfig.routePath
    : (id ? `${nguoiThanConfig.routePath}/${id}` : nguoiThanConfig.routePath)

  const handleSubmit = async (data: any) => {
    // Convert ma_nhan_vien from string to number
    // ✅ QUAN TRỌNG: EmployeeComboboxField trả về string, cần convert sang number
    const maNhanVien = data.ma_nhan_vien
    if (!maNhanVien || maNhanVien === '') {
      throw new Error("Mã nhân viên là bắt buộc")
    }
    
    const maNhanVienNumber = Number(maNhanVien)
    if (isNaN(maNhanVienNumber) || maNhanVienNumber <= 0) {
      throw new Error("Mã nhân viên phải là số nguyên dương")
    }
    
    const submitData = {
      ...data,
      ma_nhan_vien: maNhanVienNumber
    }
    
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: submitData as UpdateNguoiThanInput })
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
      navigate(cancelUrl)
    }
  }

  return (
    <GenericFormView
      title={isEditMode ? `Sửa Người Thân: ${existingData?.ho_va_ten || ''}` : "Thêm Mới Người Thân"}
      subtitle={isEditMode ? "Cập nhật thông tin người thân." : "Thêm người thân mới vào hệ thống."}
      schema={formSchema}
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

