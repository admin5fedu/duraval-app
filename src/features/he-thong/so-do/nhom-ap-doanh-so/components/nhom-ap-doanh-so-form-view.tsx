"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { nhomApDoanhSoSchema } from "../schema"
import type { CreateNhomApDoanhSoInput, UpdateNhomApDoanhSoInput } from "../schema"
import { useCreateNhomApDoanhSo, useUpdateNhomApDoanhSo } from "../hooks/use-nhom-ap-doanh-so-mutations"
import { useNhomApDoanhSoById } from "../hooks/use-nhom-ap-doanh-so"
import { nhomApDoanhSoConfig } from "../config"
import { useMemo } from "react"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ma_nhom_ap", label: "Mã Nhóm Áp", required: true },
      { name: "ten_nhom_ap", label: "Tên Nhóm Áp", required: true },
      { name: "mo_ta", label: "Mô Tả", type: "textarea", colSpan: 2 },
    ]
  }
]

interface NhomApDoanhSoFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function NhomApDoanhSoFormView({ id, onComplete, onCancel }: NhomApDoanhSoFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateNhomApDoanhSo()
  const updateMutation = useUpdateNhomApDoanhSo()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  // để đảm bảo thứ tự hooks nhất quán giữa các lần render
  
  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])
  
  // If id is provided, fetch existing data for edit mode
  // ✅ QUAN TRỌNG: Hook luôn được gọi với cùng signature để tránh "Rendered more hooks"
  const { data: existingData, isLoading } = useNhomApDoanhSoById(id ?? 0, undefined)

  // ✅ QUAN TRỌNG: Tạo schema cho form
  // Phải được tạo TRƯỚC early return
  const formSchema = useMemo(() => {
    return nhomApDoanhSoSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true })
  }, [])

  // Prepare default values
  // Phải được tạo TRƯỚC early return
  const defaultValues = useMemo(() => {
    if (id && existingData) {
      return {
        ...existingData,
      }
    }
    return {}
  }, [id, existingData])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (id && isLoading) {
    return <div>Đang tải...</div>
  }

  // Computed values (không phải hooks, có thể đặt sau early return)
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  const cancelUrl = returnTo === 'list' 
    ? nhomApDoanhSoConfig.routePath
    : (id ? `${nhomApDoanhSoConfig.routePath}/${id}` : nhomApDoanhSoConfig.routePath)

  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: data as UpdateNhomApDoanhSoInput })
    } else {
      await createMutation.mutateAsync(data as CreateNhomApDoanhSoInput)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Fallback to default navigation
      if (returnTo === 'list') {
        navigate(nhomApDoanhSoConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${nhomApDoanhSoConfig.routePath}/${id}`)
      } else {
        navigate(nhomApDoanhSoConfig.routePath)
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
      title={isEditMode ? `Sửa Nhóm Áp Doanh Số: ${existingData?.ten_nhom_ap || ''}` : "Thêm Mới Nhóm Áp Doanh Số"}
      subtitle={isEditMode ? "Cập nhật thông tin nhóm áp doanh số." : "Thêm nhóm áp doanh số mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật nhóm áp doanh số thành công" : "Thêm mới nhóm áp doanh số thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật nhóm áp doanh số" : "Có lỗi xảy ra khi thêm mới nhóm áp doanh số"}
      defaultValues={defaultValues}
    />
  )
}

