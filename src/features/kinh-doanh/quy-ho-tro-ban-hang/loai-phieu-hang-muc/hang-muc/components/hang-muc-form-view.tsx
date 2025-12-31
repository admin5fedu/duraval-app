"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { hangMucSchema } from "../schema"
import type { CreateHangMucInput, UpdateHangMucInput } from "../schema"
import { useCreateHangMuc, useUpdateHangMuc } from "../hooks/use-hang-muc-mutations"
import { useHangMucById } from "../hooks/use-hang-muc"
import { hangMucConfig } from "../config"
import { useMemo } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { 
        name: "loai_phieu_id", 
        label: "Loại Phiếu", 
        type: "loai-phieu-select",
        placeholder: "Chọn loại phiếu...",
        description: "Tìm kiếm theo tên loại phiếu",
      },
      { name: "ten_hang_muc", label: "Tên Hạng Mục", required: true },
      { 
        name: "mo_ta", 
        label: "Mô Tả", 
        type: "textarea",
      },
    ]
  },
]

interface HangMucFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function HangMucFormView({ id, onComplete, onCancel }: HangMucFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateHangMuc()
  const updateMutation = useUpdateHangMuc()
  const { employee } = useAuthStore()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  // để đảm bảo thứ tự hooks nhất quán giữa các lần render
  
  // If id is provided, fetch existing data for edit mode
  // ✅ QUAN TRỌNG: Hook luôn được gọi với cùng signature để tránh "Rendered more hooks"
  const { data: existingData, isLoading } = useHangMucById(id ?? 0, undefined)
  
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
    return hangMucSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, nguoi_tao_ten: true, ten_loai_phieu: true })
  }, [])

  // Prepare default values
  // Phải được tạo TRƯỚC early return
  const defaultValues = useMemo(() => {
    if (id && existingData && existingData !== null && typeof existingData === 'object' && 'ten_hang_muc' in existingData && existingData.ten_hang_muc !== undefined) {
      return {
        loai_phieu_id: existingData.loai_phieu_id || null,
        ten_hang_muc: String(existingData.ten_hang_muc || ""),
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
    ? hangMucConfig.routePath
    : (id ? `${hangMucConfig.routePath}/${id}` : hangMucConfig.routePath)

  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: data as UpdateHangMucInput })
    } else {
      // Create mode - tự động thêm nguoi_tao_id từ employee hiện tại
      // nguoi_tao_id lưu ma_nhan_vien (mã nhân viên), không phải id
      const nguoiTaoId = employee?.ma_nhan_vien || null
      const createData: CreateHangMucInput = {
        ...data as CreateHangMucInput,
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
        navigate(hangMucConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${hangMucConfig.routePath}/${id}`)
      } else {
        navigate(hangMucConfig.routePath)
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
      title={isEditMode ? `Sửa Hạng Mục: ${existingData?.ten_hang_muc || ''}` : "Thêm Mới Hạng Mục"}
      subtitle={isEditMode ? "Cập nhật thông tin hạng mục." : "Thêm hạng mục mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật hạng mục thành công" : "Thêm mới hạng mục thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật hạng mục" : "Có lỗi xảy ra khi thêm mới hạng mục"}
      defaultValues={defaultValues}
    />
  )
}

