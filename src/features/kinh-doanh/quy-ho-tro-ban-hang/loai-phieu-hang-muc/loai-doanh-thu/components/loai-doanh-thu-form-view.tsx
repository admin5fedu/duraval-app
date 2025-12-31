"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { loaiDoanhThuSchema } from "../schema"
import type { CreateLoaiDoanhThuInput, UpdateLoaiDoanhThuInput } from "../schema"
import { useCreateLoaiDoanhThu, useUpdateLoaiDoanhThu } from "../hooks/use-loai-doanh-thu-mutations"
import { useLoaiDoanhThuById } from "../hooks/use-loai-doanh-thu"
import { loaiDoanhThuConfig } from "../config"
import { useMemo } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ten_doanh_thu", label: "Tên Doanh Thu", required: true },
      { 
        name: "mo_ta", 
        label: "Mô Tả", 
        type: "textarea",
      },
    ]
  },
]

interface LoaiDoanhThuFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function LoaiDoanhThuFormView({ id, onComplete, onCancel }: LoaiDoanhThuFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateLoaiDoanhThu()
  const updateMutation = useUpdateLoaiDoanhThu()
  const { employee } = useAuthStore()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  // để đảm bảo thứ tự hooks nhất quán giữa các lần render
  
  // If id is provided, fetch existing data for edit mode
  // ✅ QUAN TRỌNG: Hook luôn được gọi với cùng signature để tránh "Rendered more hooks"
  const { data: existingData, isLoading } = useLoaiDoanhThuById(id ?? 0, undefined)
  
  // Computed values (không phải hooks, có thể đặt sau hooks nhưng trước early return)
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  
  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])

  // ✅ QUAN TRỌNG: Tạo schema cho form
  // Phải được tạo TRƯỚC early return
  const formSchema = useMemo(() => {
    return loaiDoanhThuSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, nguoi_tao_ten: true })
  }, [])

  // Prepare default values
  // Phải được tạo TRƯỚC early return
  const defaultValues = useMemo(() => {
    if (id && existingData && existingData !== null && typeof existingData === 'object' && 'ten_doanh_thu' in existingData && existingData.ten_doanh_thu !== undefined) {
      return {
        ten_doanh_thu: String(existingData.ten_doanh_thu || ""),
        mo_ta: existingData.mo_ta ? String(existingData.mo_ta) : "",
      }
    }
    // For new records or when data is not yet loaded - return undefined (GenericFormView will handle it)
    return undefined
  }, [id, existingData])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  // Computed values (không phải hooks, có thể đặt sau early return)
  const cancelUrl = returnTo === 'list' 
    ? loaiDoanhThuConfig.routePath
    : (id ? `${loaiDoanhThuConfig.routePath}/${id}` : loaiDoanhThuConfig.routePath)

  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: data as UpdateLoaiDoanhThuInput })
    } else {
      // Create mode - tự động thêm nguoi_tao_id từ employee hiện tại
      // nguoi_tao_id lưu ma_nhan_vien (mã nhân viên), không phải id
      const nguoiTaoId = employee?.ma_nhan_vien || null
      const createData: CreateLoaiDoanhThuInput = {
        ...data as CreateLoaiDoanhThuInput,
        nguoi_tao_id: nguoiTaoId,
      }
      await createMutation.mutateAsync(createData)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Fallback to default navigation
      if (returnTo === 'list') {
        navigate(loaiDoanhThuConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${loaiDoanhThuConfig.routePath}/${id}`)
      } else {
        navigate(loaiDoanhThuConfig.routePath)
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
      title={isEditMode ? `Sửa Loại Doanh Thu: ${existingData?.ten_doanh_thu || ''}` : "Thêm Mới Loại Doanh Thu"}
      subtitle={isEditMode ? "Cập nhật thông tin loại doanh thu." : "Thêm loại doanh thu mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật loại doanh thu thành công" : "Thêm mới loại doanh thu thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật loại doanh thu" : "Có lỗi xảy ra khi thêm mới loại doanh thu"}
      defaultValues={defaultValues}
    />
  )
}

