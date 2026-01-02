"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { phuongXaTSNSchema } from "../schema"
import type { CreatePhuongXaTSNInput, UpdatePhuongXaTSNInput } from "../schema"
import { useCreatePhuongXaTSN, useUpdatePhuongXaTSN } from "../hooks/use-phuong-xa-tsn-mutations"
import { usePhuongXaTSNById } from "../hooks/use-phuong-xa-tsn"
import { phuongXaTSNConfig } from "../config"
import { useMemo } from "react"
import { z } from "zod"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { 
        name: "quan_huyen_id", 
        label: "Quận Huyện", 
        type: "quan-huyen-tsn-select",
        required: true,
        description: "Chọn quận huyện TSN",
      },
      { name: "ma_quan_huyen", label: "Mã - Tên Quận Huyện", required: true, disabled: true },
      { name: "ma_tinh_thanh", label: "Mã - Tên Tỉnh Thành", required: false, disabled: true },
      { name: "ma_phuong_xa", label: "Mã Phường Xã", required: true },
      { name: "ten_phuong_xa", label: "Tên Phường Xã", required: true },
    ]
  },
]

interface PhuongXaTSNFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function PhuongXaTSNFormView({ id, onComplete, onCancel }: PhuongXaTSNFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreatePhuongXaTSN()
  const updateMutation = useUpdatePhuongXaTSN()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const { data: existingData, isLoading } = usePhuongXaTSNById(id ?? 0, undefined)
  
  // Computed values
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  
  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])

  // ✅ QUAN TRỌNG: Tạo schema cho form - accept object cho quan_huyen_id
  const formSchema = useMemo(() => {
    return phuongXaTSNSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true })
      .extend({
        quan_huyen_id: z.union([
          z.number().min(1, "Quận huyện là bắt buộc"),
          z.object({
            quan_huyen_id: z.number().min(1),
            ma_quan_huyen: z.string(),
            ten_quan_huyen: z.string(),
            ma_tinh_thanh: z.string().optional(),
            ten_tinh_thanh: z.string().optional(),
          }),
        ]),
      })
  }, [])

  // Prepare default values
  const defaultValues = useMemo(() => {
    if (id && existingData && existingData !== null && typeof existingData === 'object' && 'ten_phuong_xa' in existingData && existingData.ten_phuong_xa !== undefined) {
      const maQuanHuyen = String(existingData.ma_quan_huyen || "")
      const tenQuanHuyen = String(existingData.ten_quan_huyen || "")
      const maTinhThanh = String(existingData.ma_tinh_thanh || "")
      const tenTinhThanh = String(existingData.ten_tinh_thanh || "")
      return {
        quan_huyen_id: existingData.quan_huyen_id ? {
          quan_huyen_id: existingData.quan_huyen_id,
          ma_quan_huyen: existingData.ma_quan_huyen,
          ten_quan_huyen: existingData.ten_quan_huyen,
          ma_tinh_thanh: existingData.ma_tinh_thanh || "",
          ten_tinh_thanh: existingData.ten_tinh_thanh || "",
        } : null,
        ma_quan_huyen: maQuanHuyen && tenQuanHuyen ? `${maQuanHuyen} - ${tenQuanHuyen}` : "",
        ma_tinh_thanh: maTinhThanh && tenTinhThanh ? `${maTinhThanh} - ${tenTinhThanh}` : "",
        ma_phuong_xa: String(existingData.ma_phuong_xa || ""),
        ten_phuong_xa: String(existingData.ten_phuong_xa || ""),
      }
    }
    // For new records
    return {
      quan_huyen_id: null,
      ma_quan_huyen: "",
      ma_tinh_thanh: "",
      ma_phuong_xa: "",
      ten_phuong_xa: "",
    }
  }, [id, existingData])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  // Computed values
  const cancelUrl = returnTo === 'list' 
    ? phuongXaTSNConfig.routePath
    : (id ? `${phuongXaTSNConfig.routePath}/${id}` : phuongXaTSNConfig.routePath)

  const handleSubmit = async (data: any) => {
    // Parse ma_quan_huyen from format "Mã - Tên" to just "Mã"
    let maQuanHuyen = data.ma_quan_huyen || ""
    let tenQuanHuyen = data.ten_quan_huyen || ""
    let maTinhThanh = data.ma_tinh_thanh || ""
    let tenTinhThanh = data.ten_tinh_thanh || ""
    
    if (data.quan_huyen_id?.ma_quan_huyen) {
      maQuanHuyen = data.quan_huyen_id.ma_quan_huyen
      tenQuanHuyen = data.quan_huyen_id.ten_quan_huyen
      maTinhThanh = data.quan_huyen_id.ma_tinh_thanh || ""
      tenTinhThanh = data.quan_huyen_id.ten_tinh_thanh || ""
    } else if (maQuanHuyen.includes(" - ")) {
      // Parse from "Mã - Tên" format
      const parts = maQuanHuyen.split(" - ")
      maQuanHuyen = parts[0] || ""
      tenQuanHuyen = parts[1] || ""
    }
    
    if (maTinhThanh.includes(" - ")) {
      const parts = maTinhThanh.split(" - ")
      maTinhThanh = parts[0] || ""
      tenTinhThanh = parts[1] || ""
    }
    
    // Transform form data to match schema
    const submitData = {
      quan_huyen_id: data.quan_huyen_id?.quan_huyen_id || data.quan_huyen_id,
      ma_quan_huyen: maQuanHuyen,
      ten_quan_huyen: tenQuanHuyen,
      ma_phuong_xa: data.ma_phuong_xa,
      ten_phuong_xa: data.ten_phuong_xa,
      tinh_thanh_id: data.quan_huyen_id?.tinh_thanh_id || data.tinh_thanh_id || null,
      ma_tinh_thanh: maTinhThanh || null,
      ten_tinh_thanh: tenTinhThanh || null,
    }

    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: submitData as UpdatePhuongXaTSNInput })
    } else {
      await createMutation.mutateAsync(submitData as CreatePhuongXaTSNInput)
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
        navigate(phuongXaTSNConfig.routePath)
      } else if (id) {
        navigate(`${phuongXaTSNConfig.routePath}/${id}`)
      } else {
        navigate(phuongXaTSNConfig.routePath)
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
        ? `Sửa Phường Xã TSN: ${existingData?.ten_phuong_xa || ''}` 
        : "Thêm Mới Phường Xã TSN"}
      submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
      successMessage={isEditMode ? "Cập nhật phường xã TSN thành công" : "Thêm mới phường xã TSN thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật phường xã TSN" : "Có lỗi xảy ra khi thêm mới phường xã TSN"}
    />
  )
}

