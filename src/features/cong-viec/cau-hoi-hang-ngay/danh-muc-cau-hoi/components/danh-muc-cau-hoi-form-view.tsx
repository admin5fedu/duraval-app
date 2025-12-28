"use client"

import { GenericFormView, type FormSection } from "@/shared/components"
import { danhMucCauHoiSchema } from "../schema"
import type { CreateDanhMucCauHoiInput, UpdateDanhMucCauHoiInput } from "../types"
import { useCreateDanhMucCauHoi, useUpdateDanhMucCauHoi } from "../hooks"
import { useDanhMucCauHoiById } from "../hooks"
import { danhMucCauHoiConfig } from "../config"
import { useMemo } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"

const getSections = (): FormSection[] => [
    {
        title: "Thông Tin Cơ Bản",
        fields: [
            { 
                name: "ten_nhom", 
                label: "Tên Nhóm", 
                required: true, 
                placeholder: "Nhập tên nhóm câu hỏi" 
            },
            { 
                name: "mo_ta", 
                label: "Mô Tả", 
                type: "textarea", 
                placeholder: "Nhập mô tả nhóm câu hỏi (tùy chọn)" 
            },
        ]
    },
]

interface DanhMucCauHoiFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function DanhMucCauHoiFormView({ id, onComplete, onCancel }: DanhMucCauHoiFormViewProps) {
  const createMutation = useCreateDanhMucCauHoi()
  const updateMutation = useUpdateDanhMucCauHoi()
  const { employee: currentEmployee } = useAuthStore()
  
  // If id is provided, fetch existing data for edit mode
  const { data: existingData, isLoading } = useDanhMucCauHoiById(id || 0, undefined)
  
  const isEditMode = !!id

  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])

  // Prepare default values
  const formDefaultValues = useMemo(() => {
    if (isEditMode && existingData) {
      return {
        ten_nhom: existingData.ten_nhom || "",
        mo_ta: existingData.mo_ta || "",
      }
    }

    // Create mode - empty form
    return {
      ten_nhom: "",
      mo_ta: "",
    }
  }, [isEditMode, existingData])

  const handleSubmit = async (data: any) => {
    // Lấy ma_nhan_vien từ employee context
    const nguoiTaoId = currentEmployee?.ma_nhan_vien
    if (!nguoiTaoId) {
      throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
    }

    if (isEditMode && id) {
      // Update mode
      const updateData: UpdateDanhMucCauHoiInput = {
        ten_nhom: data.ten_nhom,
        mo_ta: data.mo_ta || null,
      }
      await updateMutation.mutateAsync({ id, data: updateData })
    } else {
      // Create mode
      const createData: CreateDanhMucCauHoiInput = {
        ten_nhom: data.ten_nhom,
        mo_ta: data.mo_ta || null,
        nguoi_tao_id: nguoiTaoId,
      }
      await createMutation.mutateAsync(createData)
    }
  }

  // Schema for form validation
  const formSchema = isEditMode
    ? danhMucCauHoiSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, nguoi_tao_ten: true })
    : danhMucCauHoiSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, nguoi_tao_ten: true })

  if (isEditMode && isLoading && !existingData) {
    return (
      <GenericFormView
        title="Đang tải..."
        subtitle=""
        schema={formSchema}
        sections={sections}
        defaultValues={{}}
        onSubmit={handleSubmit}
        onComplete={handleComplete}
        onCancel={handleCancel}
        isLoading={true}
      />
    )
  }

  return (
    <GenericFormView
      title={isEditMode ? "Sửa Danh Mục Câu Hỏi" : "Thêm Mới Danh Mục Câu Hỏi"}
      subtitle={isEditMode ? "Cập nhật thông tin danh mục câu hỏi" : "Tạo danh mục câu hỏi mới vào hệ thống"}
      schema={formSchema}
      sections={sections}
      defaultValues={formDefaultValues}
      onSubmit={handleSubmit}
      onSuccess={onComplete}
      onCancel={onCancel}
      successMessage={isEditMode ? "Cập nhật danh mục câu hỏi thành công" : "Thêm mới danh mục câu hỏi thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật danh mục câu hỏi" : "Có lỗi xảy ra khi thêm mới danh mục câu hỏi"}
      isLoading={createMutation.isPending || updateMutation.isPending}
    />
  )
}

