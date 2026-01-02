"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { tinhThanhTSNSchema } from "../schema"
import type { CreateTinhThanhTSNInput, UpdateTinhThanhTSNInput } from "../schema"
import { useCreateTinhThanhTSN, useUpdateTinhThanhTSN } from "../hooks/use-tinh-thanh-tsn-mutations"
import { useTinhThanhTSNById } from "../hooks/use-tinh-thanh-tsn"
import { tinhThanhTSNConfig } from "../config"
import { useMemo } from "react"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ma_tinh_thanh", label: "Mã Tỉnh Thành", required: true },
      { name: "ten_tinh_thanh", label: "Tên Tỉnh Thành", required: true },
      { 
        name: "mien", 
        label: "Miền", 
        type: "toggle",
        required: true,
        options: [
          { label: "Miền Bắc", value: "Miền Bắc" },
          { label: "Miền Trung", value: "Miền Trung" },
          { label: "Miền Nam", value: "Miền Nam" },
        ],
      },
      {
        name: "vung",
        label: "Vùng",
        type: "select",
        required: true,
        options: [
          { label: "Đồng bằng sông Hồng", value: "Đồng bằng sông Hồng" },
          { label: "Trung du và miền núi phía Bắc", value: "Trung du và miền núi phía Bắc" },
          { label: "Bắc Trung Bộ", value: "Bắc Trung Bộ" },
          { label: "Duyên hải Nam Trung Bộ", value: "Duyên hải Nam Trung Bộ" },
          { label: "Tây Nguyên", value: "Tây Nguyên" },
          { label: "Đông Nam Bộ", value: "Đông Nam Bộ" },
          { label: "Đồng bằng sông Cửu Long", value: "Đồng bằng sông Cửu Long" },
        ],
      },
    ]
  },
]

interface TinhThanhTSNFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function TinhThanhTSNFormView({ id, onComplete, onCancel }: TinhThanhTSNFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateTinhThanhTSN()
  const updateMutation = useUpdateTinhThanhTSN()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const { data: existingData, isLoading } = useTinhThanhTSNById(id ?? 0, undefined)
  
  // Computed values
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  
  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])

  // ✅ QUAN TRỌNG: Tạo schema cho form
  const formSchema = useMemo(() => {
    return tinhThanhTSNSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true })
  }, [])

  // Prepare default values
  const defaultValues = useMemo(() => {
    if (id && existingData && existingData !== null && typeof existingData === 'object' && 'ten_tinh_thanh' in existingData && existingData.ten_tinh_thanh !== undefined) {
      return {
        ma_tinh_thanh: String(existingData.ma_tinh_thanh || ""),
        ten_tinh_thanh: String(existingData.ten_tinh_thanh || ""),
        mien: existingData.mien ? String(existingData.mien) : null,
        vung: existingData.vung ? String(existingData.vung) : null,
      }
    }
    // For new records
    return {
      ma_tinh_thanh: "",
      ten_tinh_thanh: "",
      mien: null,
      vung: null,
    }
  }, [id, existingData])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  // Computed values
  const cancelUrl = returnTo === 'list' 
    ? tinhThanhTSNConfig.routePath
    : (id ? `${tinhThanhTSNConfig.routePath}/${id}` : tinhThanhTSNConfig.routePath)

  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: data as UpdateTinhThanhTSNInput })
    } else {
      await createMutation.mutateAsync(data as CreateTinhThanhTSNInput)
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
        navigate(tinhThanhTSNConfig.routePath)
      } else if (id) {
        navigate(`${tinhThanhTSNConfig.routePath}/${id}`)
      } else {
        navigate(tinhThanhTSNConfig.routePath)
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
        ? `Sửa Tỉnh Thành TSN: ${existingData?.ten_tinh_thanh || ''}` 
        : "Thêm Mới Tỉnh Thành TSN"}
      submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
      successMessage={isEditMode ? "Cập nhật tỉnh thành TSN thành công" : "Thêm mới tỉnh thành TSN thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật tỉnh thành TSN" : "Có lỗi xảy ra khi thêm mới tỉnh thành TSN"}
    />
  )
}

