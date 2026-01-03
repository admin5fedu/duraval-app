"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { nhomChuyenDeSchema } from "../schema"
import type { CreateNhomChuyenDeInput, UpdateNhomChuyenDeInput } from "../schema"
import { useCreateNhomChuyenDe, useUpdateNhomChuyenDe } from "../hooks/use-nhom-chuyen-de-mutations"
import { useNhomChuyenDeById } from "../hooks/use-nhom-chuyen-de"
import { nhomChuyenDeConfig } from "../config"
import { useMemo } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ten_nhom", label: "Tên Nhóm", required: true },
      { name: "mo_ta", label: "Mô Tả", type: "textarea", colSpan: 2 },
    ]
  },
]

interface NhomChuyenDeFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function NhomChuyenDeFormView({ id, onComplete, onCancel }: NhomChuyenDeFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateNhomChuyenDe()
  const updateMutation = useUpdateNhomChuyenDe()
  const { user } = useAuthStore()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const { data: existingData, isLoading } = useNhomChuyenDeById(id ?? 0, undefined)
  
  // Computed values
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  
  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])

  // ✅ QUAN TRỌNG: Tạo schema cho form (bỏ nguoi_tao_id vì sẽ tự động set)
  const formSchema = useMemo(() => {
    return nhomChuyenDeSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true })
  }, [])

  // Prepare default values
  const defaultValues = useMemo(() => {
    if (id && existingData && existingData !== null && typeof existingData === 'object' && 'ten_nhom' in existingData && existingData.ten_nhom !== undefined) {
      return {
        ten_nhom: String(existingData.ten_nhom || ""),
        mo_ta: existingData.mo_ta ? String(existingData.mo_ta) : "",
      }
    }
    // For new records
    return {
      ten_nhom: "",
      mo_ta: "",
    }
  }, [id, existingData])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  // Computed values
  const cancelUrl = returnTo === 'list' 
    ? nhomChuyenDeConfig.routePath
    : (id ? `${nhomChuyenDeConfig.routePath}/${id}` : nhomChuyenDeConfig.routePath)

  const handleSubmit = async (data: any) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, input: data as UpdateNhomChuyenDeInput })
      } else {
        // Tự động set nguoi_tao_id từ user hiện tại
        if (!user?.id) {
          throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
        }
        const createInput: CreateNhomChuyenDeInput = {
          ...data,
          ten_nhom: String(data.ten_nhom || "").trim(),
          mo_ta: data.mo_ta ? String(data.mo_ta).trim() : null,
          nguoi_tao_id: parseInt(user.id),
        }
        await createMutation.mutateAsync(createInput)
      }
    } catch (error: any) {
      // Error is handled by mutation, but we can add additional handling here if needed
      throw error
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      navigate(cancelUrl)
    }
  }

  const handleComplete = () => {
    if (onComplete) {
      onComplete()
    } else {
      if (returnTo === 'list') {
        navigate(nhomChuyenDeConfig.routePath)
      } else if (id) {
        navigate(`${nhomChuyenDeConfig.routePath}/${id}`)
      } else {
        navigate(nhomChuyenDeConfig.routePath)
      }
    }
  }

  return (
    <GenericFormView
      schema={formSchema}
      defaultValues={defaultValues}
      sections={sections}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onSuccess={handleComplete}
      title={isEditMode 
        ? `Sửa Nhóm Chuyên Đề: ${existingData?.ten_nhom || ''}` 
        : "Thêm Mới Nhóm Chuyên Đề"}
      submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
      successMessage={isEditMode ? "Cập nhật nhóm chuyên đề thành công" : "Thêm mới nhóm chuyên đề thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật nhóm chuyên đề" : "Có lỗi xảy ra khi thêm mới nhóm chuyên đề"}
    />
  )
}

