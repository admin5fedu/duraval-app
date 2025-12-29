"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { nhomLuongSchema } from "../schema"
import { useCreateNhomLuong, useUpdateNhomLuong } from "../hooks/use-nhom-luong-mutations"
import { useNhomLuongById } from "../hooks/use-nhom-luong"
import { nhomLuongConfig } from "../config"
import { useMemo } from "react"
import type { CreateNhomLuongInput, UpdateNhomLuongInput } from "../types"
import { useAuthStore } from "@/shared/stores/auth-store"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { 
        name: "ten_nhom", 
        label: "Tên Nhóm", 
        required: true,
        description: "Tên của nhóm lương"
      },
      { 
        name: "mo_ta", 
        label: "Mô Tả", 
        type: "textarea",
        description: "Mô tả chi tiết về nhóm lương"
      },
    ]
  },
]

interface NhomLuongFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function NhomLuongFormView({ id, onComplete, onCancel }: NhomLuongFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateNhomLuong()
  const updateMutation = useUpdateNhomLuong()
  const { employee } = useAuthStore()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  // để đảm bảo thứ tự hooks nhất quán giữa các lần render
  
  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])
  
  // If id is provided, fetch existing data for edit mode
  // ✅ QUAN TRỌNG: Hook luôn được gọi với cùng signature để tránh "Rendered more hooks"
  const { data: existingData, isLoading } = useNhomLuongById(id ?? 0, undefined)

  // ✅ QUAN TRỌNG: Tạo schema cho form
  // Phải được tạo TRƯỚC early return
  const formSchema = useMemo(() => {
    return nhomLuongSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, nguoi_tao_ten: true, nguoi_tao: true })
  }, [])

  // Prepare default values
  // Phải được tạo TRƯỚC early return
  const defaultValues = useMemo(() => {
    if (id && existingData) {
      return {
        ten_nhom: existingData.ten_nhom || "",
        mo_ta: existingData.mo_ta || "",
      }
    }
    return {
      ten_nhom: "",
      mo_ta: "",
    }
  }, [id, existingData])

  // Early return after all hooks
  if (id && isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  // Computed values (không phải hooks, có thể đặt sau early return)
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  const cancelUrl = returnTo === 'list' 
    ? nhomLuongConfig.routePath
    : (id ? `${nhomLuongConfig.routePath}/${id}` : nhomLuongConfig.routePath)

  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: data as UpdateNhomLuongInput })
    } else {
      // ✅ Set nguoi_tao_id từ employee hiện tại khi tạo mới
      await createMutation.mutateAsync({
        ...data,
        nguoi_tao_id: employee?.ma_nhan_vien || null,
      } as CreateNhomLuongInput)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Fallback to default navigation
      if (returnTo === 'list') {
        navigate(nhomLuongConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${nhomLuongConfig.routePath}/${id}`)
      } else {
        navigate(nhomLuongConfig.routePath)
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
      title={isEditMode ? `Sửa Nhóm Lương: ${existingData?.ten_nhom || ''}` : "Thêm Mới Nhóm Lương"}
      subtitle={isEditMode ? "Cập nhật thông tin nhóm lương." : "Thêm nhóm lương mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật nhóm lương thành công" : "Thêm mới nhóm lương thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật nhóm lương" : "Có lỗi xảy ra khi thêm mới nhóm lương"}
      defaultValues={defaultValues}
    />
  )
}

