"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { nhomDiemCongTruSchema } from "../schema"
import { useCreateNhomDiemCongTru, useUpdateNhomDiemCongTru } from "../hooks/use-nhom-diem-cong-tru-mutations"
import { useNhomDiemCongTruById } from "../hooks/use-nhom-diem-cong-tru"
import { nhomDiemCongTruConfig } from "../config"
import { useMemo } from "react"
import type { CreateNhomDiemCongTruInput, UpdateNhomDiemCongTruInput } from "../types"
import { useFormField } from "@/components/ui/form"
import { ToggleButtonGroup } from "./toggle-button-group"
import { PhongMultiSelect } from "@/shared/components/forms/phong-multi-select"
import * as React from "react"

// Custom component for Hạng mục toggle buttons
function HangMucToggleButtons({ value, onChange, disabled }: { value?: string; onChange: (value: string) => void; disabled?: boolean }) {
  // Get id from FormControl context - FormControl passes id via Slot
  // Slot will merge props including id, but we should use useFormField() to get the correct id
  let formItemId: string | undefined
  try {
    const formField = useFormField()
    formItemId = formField.formItemId
  } catch {
    // Not in FormControl context, generate a unique id
    formItemId = React.useId()
  }
  
  const options = [
    { label: "Cộng", value: "Cộng" },
    { label: "Trừ", value: "Trừ" },
  ]
  
  const handleChange = (val: string | number) => {
    onChange(String(val))
  }
  
  const { name } = useFormField()
  return <ToggleButtonGroup id={formItemId} name={name} value={value} onChange={handleChange} options={options} disabled={disabled} />
}

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { 
        name: "hang_muc", 
        label: "Hạng Mục", 
        required: true,
        type: "custom",
        customComponent: HangMucToggleButtons,
      },
      { name: "nhom", label: "Nhóm", required: true },
      { 
        name: "min", 
        label: "Min", 
        type: "number", 
        required: true,
        description: "Giá trị tối thiểu"
      },
      { 
        name: "max", 
        label: "Max", 
        type: "number", 
        required: true,
        description: "Giá trị tối đa"
      },
      { 
        name: "mo_ta", 
        label: "Mô Tả", 
        type: "textarea",
        description: "Mô tả chi tiết về nhóm điểm cộng trừ"
      },
    ]
  },
  {
    title: "Cấu Hình Áp Dụng",
    fields: [
      { 
        name: "pb_ap_dung_ib", 
        label: "Phòng Ban Áp Dụng", 
        type: "custom",
        customComponent: PhongMultiSelect,
        description: "Chọn các phòng áp dụng cho nhóm điểm cộng trừ này (chỉ các phòng có cấp bậc là Phòng)"
      },
    ]
  }
]

interface NhomDiemCongTruFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function NhomDiemCongTruFormView({ id, onComplete, onCancel }: NhomDiemCongTruFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateNhomDiemCongTru()
  const updateMutation = useUpdateNhomDiemCongTru()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  // để đảm bảo thứ tự hooks nhất quán giữa các lần render
  
  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])
  
  // If id is provided, fetch existing data for edit mode
  // ✅ QUAN TRỌNG: Hook luôn được gọi với cùng signature để tránh "Rendered more hooks"
  const { data: existingData, isLoading } = useNhomDiemCongTruById(id ?? 0, undefined)

  // ✅ QUAN TRỌNG: Tạo schema cho form
  // Phải được tạo TRƯỚC early return
  const formSchema = useMemo(() => {
    return nhomDiemCongTruSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, nguoi_tao_ten: true, nguoi_tao: true })
  }, [])

  // Prepare default values
  // Phải được tạo TRƯỚC early return
  const defaultValues = useMemo(() => {
    if (id && existingData) {
      return {
        hang_muc: (existingData.hang_muc === "Cộng" || existingData.hang_muc === "Trừ") 
          ? existingData.hang_muc 
          : "Cộng", // Default to "Cộng" if invalid
        nhom: existingData.nhom || "",
        min: existingData.min ?? 0,
        max: existingData.max ?? 0,
        mo_ta: existingData.mo_ta || "",
        pb_ap_dung_ib: existingData.pb_ap_dung_ib || null,
      }
    }
    return {
      hang_muc: "Cộng", // Default value
      nhom: "",
      min: 0,
      max: 0,
      mo_ta: "",
      pb_ap_dung_ib: null,
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
    ? nhomDiemCongTruConfig.routePath
    : (id ? `${nhomDiemCongTruConfig.routePath}/${id}` : nhomDiemCongTruConfig.routePath)

  const handleSubmit = async (data: any) => {
    // Ensure hang_muc is "Cộng" or "Trừ"
    const submitData = {
      ...data,
      hang_muc: (data.hang_muc === "Cộng" || data.hang_muc === "Trừ") ? data.hang_muc : "Cộng",
    }
    
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: submitData as UpdateNhomDiemCongTruInput })
    } else {
      await createMutation.mutateAsync(submitData as CreateNhomDiemCongTruInput)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Fallback to default navigation
      if (returnTo === 'list') {
        navigate(nhomDiemCongTruConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${nhomDiemCongTruConfig.routePath}/${id}`)
      } else {
        navigate(nhomDiemCongTruConfig.routePath)
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
      title={isEditMode ? `Sửa Nhóm Điểm Cộng Trừ: ${existingData?.hang_muc || ''}` : "Thêm Mới Nhóm Điểm Cộng Trừ"}
      subtitle={isEditMode ? "Cập nhật thông tin nhóm điểm cộng trừ." : "Thêm nhóm điểm cộng trừ mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật nhóm điểm cộng trừ thành công" : "Thêm mới nhóm điểm cộng trừ thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật nhóm điểm cộng trừ" : "Có lỗi xảy ra khi thêm mới nhóm điểm cộng trừ"}
      defaultValues={defaultValues}
    />
  )
}

