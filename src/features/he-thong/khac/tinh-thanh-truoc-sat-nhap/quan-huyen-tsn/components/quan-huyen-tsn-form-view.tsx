"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { quanHuyenTSNSchema } from "../schema"
import type { CreateQuanHuyenTSNInput, UpdateQuanHuyenTSNInput } from "../schema"
import { useCreateQuanHuyenTSN, useUpdateQuanHuyenTSN } from "../hooks/use-quan-huyen-tsn-mutations"
import { useQuanHuyenTSNById } from "../hooks/use-quan-huyen-tsn"
import { quanHuyenTSNConfig } from "../config"
import { useMemo } from "react"
import { z } from "zod"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { 
        name: "tinh_thanh_id", 
        label: "Tỉnh Thành", 
        type: "tinh-thanh-tsn-select",
        required: true,
        description: "Chọn tỉnh thành TSN",
      },
      { name: "ma_tinh_thanh", label: "Mã - Tên Tỉnh Thành", required: true, disabled: true },
      { name: "ma_quan_huyen", label: "Mã Quận Huyện", required: true },
      { name: "ten_quan_huyen", label: "Tên Quận Huyện", required: true },
    ]
  },
]

interface QuanHuyenTSNFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function QuanHuyenTSNFormView({ id, onComplete, onCancel }: QuanHuyenTSNFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateQuanHuyenTSN()
  const updateMutation = useUpdateQuanHuyenTSN()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const { data: existingData, isLoading } = useQuanHuyenTSNById(id ?? 0, undefined)
  
  // Computed values
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  
  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])

  // ✅ QUAN TRỌNG: Tạo schema cho form - accept object cho tinh_thanh_id
  const formSchema = useMemo(() => {
    return quanHuyenTSNSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true })
      .extend({
        tinh_thanh_id: z.union([
          z.number().min(1, "Tỉnh thành là bắt buộc"),
          z.object({
            tinh_thanh_id: z.number().min(1),
            ma_tinh_thanh: z.string(),
            ten_tinh_thanh: z.string(),
          }),
        ]),
      })
  }, [])

  // Prepare default values
  const defaultValues = useMemo(() => {
    if (id && existingData && existingData !== null && typeof existingData === 'object' && 'ten_quan_huyen' in existingData && existingData.ten_quan_huyen !== undefined) {
      const maTinhThanh = String(existingData.ma_tinh_thanh || "")
      const tenTinhThanh = String(existingData.ten_tinh_thanh || "")
      return {
        tinh_thanh_id: existingData.tinh_thanh_id ? {
          tinh_thanh_id: existingData.tinh_thanh_id,
          ma_tinh_thanh: existingData.ma_tinh_thanh,
          ten_tinh_thanh: existingData.ten_tinh_thanh,
        } : null,
        ma_tinh_thanh: maTinhThanh && tenTinhThanh ? `${maTinhThanh} - ${tenTinhThanh}` : "",
        ma_quan_huyen: String(existingData.ma_quan_huyen || ""),
        ten_quan_huyen: String(existingData.ten_quan_huyen || ""),
      }
    }
    // For new records
    return {
      tinh_thanh_id: null,
      ma_tinh_thanh: "",
      ma_quan_huyen: "",
      ten_quan_huyen: "",
    }
  }, [id, existingData])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  // Computed values
  const cancelUrl = returnTo === 'list' 
    ? quanHuyenTSNConfig.routePath
    : (id ? `${quanHuyenTSNConfig.routePath}/${id}` : quanHuyenTSNConfig.routePath)

  const handleSubmit = async (data: any) => {
    // Parse ma_tinh_thanh from format "Mã - Tên" to just "Mã"
    let maTinhThanh = data.ma_tinh_thanh || ""
    let tenTinhThanh = data.ten_tinh_thanh || ""
    
    if (data.tinh_thanh_id?.ma_tinh_thanh) {
      maTinhThanh = data.tinh_thanh_id.ma_tinh_thanh
      tenTinhThanh = data.tinh_thanh_id.ten_tinh_thanh
    } else if (maTinhThanh.includes(" - ")) {
      // Parse from "Mã - Tên" format
      const parts = maTinhThanh.split(" - ")
      maTinhThanh = parts[0] || ""
      tenTinhThanh = parts[1] || ""
    }
    
    // Transform form data to match schema
    const submitData = {
      tinh_thanh_id: data.tinh_thanh_id?.tinh_thanh_id || data.tinh_thanh_id,
      ma_tinh_thanh: maTinhThanh,
      ten_tinh_thanh: tenTinhThanh,
      ma_quan_huyen: data.ma_quan_huyen,
      ten_quan_huyen: data.ten_quan_huyen,
    }

    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: submitData as UpdateQuanHuyenTSNInput })
    } else {
      await createMutation.mutateAsync(submitData as CreateQuanHuyenTSNInput)
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
        navigate(quanHuyenTSNConfig.routePath)
      } else if (id) {
        navigate(`${quanHuyenTSNConfig.routePath}/${id}`)
      } else {
        navigate(quanHuyenTSNConfig.routePath)
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
        ? `Sửa Quận Huyện TSN: ${existingData?.ten_quan_huyen || ''}` 
        : "Thêm Mới Quận Huyện TSN"}
      submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
      successMessage={isEditMode ? "Cập nhật quận huyện TSN thành công" : "Thêm mới quận huyện TSN thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật quận huyện TSN" : "Có lỗi xảy ra khi thêm mới quận huyện TSN"}
    />
  )
}

