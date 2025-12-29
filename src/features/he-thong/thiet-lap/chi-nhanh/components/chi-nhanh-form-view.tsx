"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { chiNhanhSchema } from "../schema"
import type { CreateChiNhanhInput, UpdateChiNhanhInput } from "../schema"
import { useCreateChiNhanh, useUpdateChiNhanh } from "../hooks/use-chi-nhanh-mutations"
import { useChiNhanhById } from "../hooks/use-chi-nhanh"
import { chiNhanhConfig } from "../config"
import { useMemo } from "react"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ma_chi_nhanh", label: "Mã Chi Nhánh", required: true },
      { name: "ten_chi_nhanh", label: "Tên Chi Nhánh", required: true },
      { name: "dia_chi", label: "Địa Chỉ", colSpan: 2 },
    ]
  },
  {
    title: "Thông Tin Bổ Sung",
    fields: [
      { 
        name: "hinh_anh", 
        label: "Hình Ảnh", 
        type: "image", 
        imageFolder: "chi-nhanh/images",
        imageMaxSize: 5,
        colSpan: 2,
      },
      { name: "dinh_vi", label: "Định Vị (Link bản đồ)", colSpan: 2 },
      { name: "mo_ta", label: "Mô Tả", type: "textarea", colSpan: 2 },
    ]
  }
]

interface ChiNhanhFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function ChiNhanhFormView({ id, onComplete, onCancel }: ChiNhanhFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateChiNhanh()
  const updateMutation = useUpdateChiNhanh()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  // để đảm bảo thứ tự hooks nhất quán giữa các lần render
  
  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])
  
  // If id is provided, fetch existing data for edit mode
  // ✅ QUAN TRỌNG: Hook luôn được gọi với cùng signature để tránh "Rendered more hooks"
  const { data: existingData, isLoading } = useChiNhanhById(id ?? 0, undefined)

  // ✅ QUAN TRỌNG: Tạo schema cho form
  // Phải được tạo TRƯỚC early return
  const formSchema = useMemo(() => {
    return chiNhanhSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true })
  }, [])

  // Prepare default values
  // Phải được tạo TRƯỚC early return
  const defaultValues = useMemo(() => {
    if (id && existingData) {
      return existingData
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
    ? chiNhanhConfig.routePath
    : (id ? `${chiNhanhConfig.routePath}/${id}` : chiNhanhConfig.routePath)

  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: data as UpdateChiNhanhInput })
    } else {
      await createMutation.mutateAsync(data as CreateChiNhanhInput)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Fallback to default navigation
      if (returnTo === 'list') {
        navigate(chiNhanhConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${chiNhanhConfig.routePath}/${id}`)
      } else {
        navigate(chiNhanhConfig.routePath)
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
      title={isEditMode ? `Sửa Chi Nhánh: ${existingData?.ten_chi_nhanh || ''}` : "Thêm Mới Chi Nhánh"}
      subtitle={isEditMode ? "Cập nhật thông tin chi nhánh." : "Thêm chi nhánh mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật chi nhánh thành công" : "Thêm mới chi nhánh thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật chi nhánh" : "Có lỗi xảy ra khi thêm mới chi nhánh"}
      defaultValues={defaultValues}
    />
  )
}

