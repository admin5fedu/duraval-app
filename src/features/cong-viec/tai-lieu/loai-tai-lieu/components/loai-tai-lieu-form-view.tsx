"use client"

import { GenericFormView, type FormSection } from "@/shared/components"
import { loaiTaiLieuSchema } from "../schema"
import type { CreateLoaiTaiLieuInput, UpdateLoaiTaiLieuInput } from "../types"
import { useCreateLoaiTaiLieu, useUpdateLoaiTaiLieu } from "../hooks"
import { useLoaiTaiLieuById } from "../hooks"
import { useMemo } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"

const getSections = (): FormSection[] => [
    {
        title: "Thông Tin Cơ Bản",
        fields: [
            { 
                name: "hang_muc", 
                label: "Hạng Mục", 
                type: "toggle",
                required: true,
                options: [
                    { label: "Biểu mẫu & Kế hoạch", value: "Biểu mẫu & Kế hoạch" },
                    { label: "Văn bản hệ thống", value: "Văn bản hệ thống" },
                ],
            },
            { 
                name: "loai", 
                label: "Loại", 
                required: true,
                placeholder: "Nhập loại tài liệu" 
            },
            { 
                name: "mo_ta", 
                label: "Mô Tả", 
                type: "textarea", 
                placeholder: "Nhập mô tả loại tài liệu (tùy chọn)" 
            },
        ]
    },
]

interface LoaiTaiLieuFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function LoaiTaiLieuFormView({ id, onComplete, onCancel }: LoaiTaiLieuFormViewProps) {
  const createMutation = useCreateLoaiTaiLieu()
  const updateMutation = useUpdateLoaiTaiLieu()
  const { employee: currentEmployee } = useAuthStore()
  
  // If id is provided, fetch existing data for edit mode
  const { data: existingData, isLoading } = useLoaiTaiLieuById(id || 0, undefined)
  
  const isEditMode = !!id

  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])

  // Prepare default values
  const formDefaultValues = useMemo(() => {
    if (isEditMode && existingData) {
      return {
        hang_muc: existingData.hang_muc || "",
        loai: existingData.loai || "",
        mo_ta: existingData.mo_ta || "",
      }
    }

    // Create mode - empty form
    return {
      hang_muc: "",
      loai: "",
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
      const updateData: UpdateLoaiTaiLieuInput = {
        hang_muc: data.hang_muc,
        loai: data.loai,
        mo_ta: data.mo_ta || null,
      }
      await updateMutation.mutateAsync({ id, input: updateData })
    } else {
      // Create mode
      const createData: CreateLoaiTaiLieuInput = {
        hang_muc: data.hang_muc,
        loai: data.loai,
        mo_ta: data.mo_ta || null,
        nguoi_tao_id: nguoiTaoId,
      }
      await createMutation.mutateAsync(createData)
    }
  }

  // Schema for form validation
  const formSchema = isEditMode
    ? loaiTaiLieuSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, nguoi_tao_ten: true })
    : loaiTaiLieuSchema.omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, nguoi_tao_ten: true })

  if (isEditMode && isLoading && !existingData) {
    return (
      <GenericFormView
        title="Đang tải..."
        subtitle=""
        schema={formSchema}
        sections={sections}
        defaultValues={{}}
        onSubmit={handleSubmit}
        onSuccess={onComplete}
        onCancel={onCancel}
      />
    )
  }

  return (
    <GenericFormView
      title={isEditMode ? "Sửa Loại Tài Liệu" : "Thêm Mới Loại Tài Liệu"}
      subtitle={isEditMode ? "Cập nhật thông tin loại tài liệu" : "Tạo loại tài liệu mới vào hệ thống"}
      schema={formSchema}
      sections={sections}
      defaultValues={formDefaultValues}
      onSubmit={handleSubmit}
      onSuccess={onComplete}
      onCancel={onCancel}
      successMessage={isEditMode ? "Cập nhật loại tài liệu thành công" : "Thêm mới loại tài liệu thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật loại tài liệu" : "Có lỗi xảy ra khi thêm mới loại tài liệu"}
    />
  )
}

