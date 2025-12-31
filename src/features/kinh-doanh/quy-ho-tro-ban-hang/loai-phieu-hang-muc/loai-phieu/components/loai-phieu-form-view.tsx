"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { loaiPhieuSchema } from "../schema"
import type { CreateLoaiPhieuInput, UpdateLoaiPhieuInput } from "../schema"
import { useCreateLoaiPhieu, useUpdateLoaiPhieu } from "../hooks/use-loai-phieu-mutations"
import { useLoaiPhieuById } from "../hooks/use-loai-phieu"
import { loaiPhieuConfig } from "../config"
import { useMemo } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ten_loai_phieu", label: "Tên Loại Phiếu", required: true },
      { 
        name: "mo_ta", 
        label: "Mô Tả", 
        type: "textarea",
      },
    ]
  },
]

interface LoaiPhieuFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function LoaiPhieuFormView({ id, onComplete, onCancel }: LoaiPhieuFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateLoaiPhieu()
  const updateMutation = useUpdateLoaiPhieu()
  const { employee } = useAuthStore()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  // để đảm bảo thứ tự hooks nhất quán giữa các lần render
  
  // If id is provided, fetch existing data for edit mode
  // ✅ QUAN TRỌNG: Hook luôn được gọi với cùng signature để tránh "Rendered more hooks"
  const { data: existingData, isLoading } = useLoaiPhieuById(id ?? 0, undefined)
  
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
    return loaiPhieuSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, nguoi_tao_ten: true })
  }, [])

  // Prepare default values
  // Phải được tạo TRƯỚC early return
  const defaultValues = useMemo(() => {
    if (id && existingData && existingData !== null && typeof existingData === 'object' && 'ten_loai_phieu' in existingData && existingData.ten_loai_phieu !== undefined) {
      return {
        ten_loai_phieu: String(existingData.ten_loai_phieu || ""),
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
    ? loaiPhieuConfig.routePath
    : (id ? `${loaiPhieuConfig.routePath}/${id}` : loaiPhieuConfig.routePath)

  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: data as UpdateLoaiPhieuInput })
    } else {
      // Create mode - tự động thêm nguoi_tao_id từ employee hiện tại
      // nguoi_tao_id lưu ma_nhan_vien (mã nhân viên), không phải id
      const nguoiTaoId = employee?.ma_nhan_vien || null
      const createData: CreateLoaiPhieuInput = {
        ...data as CreateLoaiPhieuInput,
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
        navigate(loaiPhieuConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${loaiPhieuConfig.routePath}/${id}`)
      } else {
        navigate(loaiPhieuConfig.routePath)
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
      title={isEditMode ? `Sửa Loại Phiếu: ${existingData?.ten_loai_phieu || ''}` : "Thêm Mới Loại Phiếu"}
      subtitle={isEditMode ? "Cập nhật thông tin loại phiếu." : "Thêm loại phiếu mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật loại phiếu thành công" : "Thêm mới loại phiếu thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật loại phiếu" : "Có lỗi xảy ra khi thêm mới loại phiếu"}
      defaultValues={defaultValues}
    />
  )
}

