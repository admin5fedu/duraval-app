"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { nhanSuSchema } from "../types"
import type { CreateNhanSuInput, UpdateNhanSuInput } from "../types"
import { useCreateNhanSu, useUpdateNhanSu } from "../hooks/use-nhan-su-mutations"
import { useNhanSuById } from "../hooks/use-nhan-su"
import { nhanSuConfig } from "../config"
import { useMemo } from "react"

const getSections = (displayName?: string): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ma_nhan_vien", label: "Mã Nhân Viên", type: "number", required: true },
      { name: "ho_ten", label: "Họ và Tên", required: true },
      { 
        name: "avatar_url", 
        label: "Ảnh Đại Diện", 
        type: "image", 
        imageFolder: "nhan-su/avatars",
        imageMaxSize: 10,
        colSpan: 2,
        displayName: displayName || "Nhân viên",
        description: "Tải lên ảnh đại diện cho nhân viên. Hỗ trợ JPG, PNG, GIF, WebP, tối đa 10MB."
      },
      { name: "gioi_tinh", label: "Giới Tính", type: "select", options: [{ label: "Nam", value: "Nam" }, { label: "Nữ", value: "Nữ" }, { label: "Khác", value: "Khác" }] },
      { name: "ngay_sinh", label: "Ngày Sinh", type: "date" },
      { name: "hon_nhan", label: "Hôn Nhân", type: "select", options: [{ label: "Độc thân", value: "Độc thân" }, { label: "Đã kết hôn", value: "Đã kết hôn" }, { label: "Ly dị", value: "Ly dị" }] },
      { name: "so_dien_thoai", label: "Số Điện Thoại" },
      { name: "email_ca_nhan", label: "Email Cá Nhân", type: "email" },
    ]
  },
  {
    title: "Công Việc & Chức Vụ",
    fields: [
      { name: "email_cong_ty", label: "Email Công Ty", type: "email", required: false },
      { name: "phong_ban", label: "Phòng Ban" },
      { name: "bo_phan", label: "Bộ Phận" },
      { name: "nhom", label: "Nhóm" },
      { name: "chuc_vu", label: "Chức Vụ" },
      { name: "ten_cap_bac", label: "Tên Cấp Bậc" },
      {
        name: "tinh_trang",
        label: "Tình Trạng",
        type: "select",
        options: [
          { label: "Thử việc", value: "Thử việc" },
          { label: "Chính thức", value: "Chính thức" },
          { label: "Nghỉ việc", value: "Nghỉ việc" },
          { label: "Tạm nghỉ", value: "Tạm nghỉ" }
        ],
        required: true
      },
    ]
  },
  {
    title: "Thời Gian",
    fields: [
      { name: "ngay_thu_viec", label: "Ngày Thử Việc", type: "date" },
      { name: "ngay_chinh_thuc", label: "Ngày Chính Thức", type: "date" },
      { name: "ngay_nghi_viec", label: "Ngày Nghỉ Việc", type: "date" },
    ]
  },
  {
    title: "Ghi Chú",
    fields: [
      { name: "ghi_chu", label: "Ghi Chú", type: "textarea", colSpan: 2 },
    ]
  }
]

interface NhanSuFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function NhanSuFormView({ id, onComplete, onCancel }: NhanSuFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateNhanSu()
  const updateMutation = useUpdateNhanSu()
  
  // If id is provided, fetch existing data for edit mode
  const { data: existingData, isLoading } = useNhanSuById(id || 0, undefined)
  
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id

  // Create sections with dynamic displayName for avatar
  const sections = useMemo(() => {
    return getSections(existingData?.ho_ten)
  }, [existingData?.ho_ten])

  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: data as UpdateNhanSuInput })
    } else {
      await createMutation.mutateAsync(data as CreateNhanSuInput)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Fallback to default navigation
      if (returnTo === 'list') {
        navigate(nhanSuConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${nhanSuConfig.routePath}/${id}`)
      } else {
        navigate(nhanSuConfig.routePath)
      }
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      // Fallback to default navigation
      const cancelUrl = returnTo === 'list' 
        ? nhanSuConfig.routePath
        : (id ? `${nhanSuConfig.routePath}/${id}` : nhanSuConfig.routePath)
      navigate(cancelUrl)
    }
  }

  const cancelUrl = returnTo === 'list' 
    ? nhanSuConfig.routePath
    : (id ? `${nhanSuConfig.routePath}/${id}` : nhanSuConfig.routePath)

  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  return (
    <GenericFormView
      title={isEditMode ? `Sửa Hồ Sơ: ${existingData?.ho_ten || ''}` : "Thêm Mới Nhân Sự"}
      subtitle={isEditMode ? "Cập nhật thông tin nhân sự." : "Thêm nhân sự mới vào hệ thống."}
      schema={nhanSuSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật nhân sự thành công" : "Thêm mới nhân sự thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật nhân sự" : "Có lỗi xảy ra khi thêm mới nhân sự"}
      defaultValues={isEditMode ? existingData : undefined}
    />
  )
}

