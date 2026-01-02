"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { phuongXaSNNSchema } from "../schema"
import type { CreatePhuongXaSNNInput, UpdatePhuongXaSNNInput } from "../schema"
import { useCreatePhuongXaSNN, useUpdatePhuongXaSNN } from "../hooks/use-phuong-xa-snn-mutations"
import { usePhuongXaSNNById } from "../hooks/use-phuong-xa-snn"
import { phuongXaSNNConfig } from "../config"
import { useMemo } from "react"
import { z } from "zod"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { 
        name: "tinh_thanh_id", 
        label: "Tỉnh Thành", 
        type: "tinh-thanh-ssn-select",
        required: true,
        description: "Chọn tỉnh thành SSN",
      },
      { name: "ma_tinh_thanh", label: "Mã - Tên Tỉnh Thành", required: false, disabled: true },
      { name: "ma_phuong_xa", label: "Mã Phường Xã", required: true },
      { name: "ten_phuong_xa", label: "Tên Phường Xã", required: true },
    ]
  },
]

interface PhuongXaSNNFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function PhuongXaSNNFormView({ id, onComplete, onCancel }: PhuongXaSNNFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreatePhuongXaSNN()
  const updateMutation = useUpdatePhuongXaSNN()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const { data: existingData, isLoading } = usePhuongXaSNNById(id ?? 0, undefined)
  
  // Computed values
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  
  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])

  // ✅ QUAN TRỌNG: Tạo schema cho form - accept object cho tinh_thanh_id
  const formSchema = useMemo(() => {
    return phuongXaSNNSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true })
      .extend({
        tinh_thanh_id: z.union([
          z.number().min(1, "Tỉnh thành là bắt buộc"),
          z.object({
            tinh_thanh_id: z.number().min(1),
            ma_tinh_thanh: z.string(),
            ten_tinh_thanh: z.string().optional(),
          }),
        ]),
      })
  }, [])

  // Prepare default values
  const defaultValues = useMemo(() => {
    if (id && existingData && existingData !== null && typeof existingData === 'object' && 'ten_phuong_xa' in existingData && existingData.ten_phuong_xa !== undefined) {
      const maTinhThanh = String(existingData.ma_tinh_thanh || "")
      const tenTinhThanh = String(existingData.ten_tinh_thanh || "")
      return {
        tinh_thanh_id: existingData.tinh_thanh_id ? {
          tinh_thanh_id: existingData.tinh_thanh_id,
          ma_tinh_thanh: existingData.ma_tinh_thanh,
          ten_tinh_thanh: existingData.ten_tinh_thanh || "",
        } : null,
        ma_tinh_thanh: maTinhThanh && tenTinhThanh ? `${maTinhThanh} - ${tenTinhThanh}` : "",
        ma_phuong_xa: String(existingData.ma_phuong_xa || ""),
        ten_phuong_xa: String(existingData.ten_phuong_xa || ""),
      }
    }
    // For new records
    return {
      tinh_thanh_id: null,
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
    ? phuongXaSNNConfig.routePath
    : (id ? `${phuongXaSNNConfig.routePath}/${id}` : phuongXaSNNConfig.routePath)

  const handleSubmit = async (data: any) => {
    // Parse tinh_thanh_id từ object hoặc number
    let tinhThanhId: number
    if (typeof data.tinh_thanh_id === 'object' && data.tinh_thanh_id !== null) {
      tinhThanhId = data.tinh_thanh_id.tinh_thanh_id
    } else {
      tinhThanhId = data.tinh_thanh_id
    }

    const submitData: CreatePhuongXaSNNInput | UpdatePhuongXaSNNInput = {
      tinh_thanh_id: tinhThanhId,
      ma_tinh_thanh: data.ma_tinh_thanh?.split(' - ')[0] || data.ma_tinh_thanh || "",
      ten_tinh_thanh: data.ma_tinh_thanh?.includes(' - ') ? data.ma_tinh_thanh.split(' - ')[1] : data.ten_tinh_thanh || null,
      ma_phuong_xa: data.ma_phuong_xa,
      ten_phuong_xa: data.ten_phuong_xa,
    }

    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: submitData as UpdatePhuongXaSNNInput })
    } else {
      await createMutation.mutateAsync(submitData as CreatePhuongXaSNNInput)
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
        navigate(phuongXaSNNConfig.routePath)
      } else if (id) {
        navigate(`${phuongXaSNNConfig.routePath}/${id}`)
      } else {
        navigate(phuongXaSNNConfig.routePath)
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
        ? `Sửa Phường Xã SNN: ${existingData?.ten_phuong_xa || ''}` 
        : "Thêm Mới Phường Xã SNN"}
      submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
      successMessage={isEditMode ? "Cập nhật phường xã SNN thành công" : "Thêm mới phường xã SNN thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật phường xã SNN" : "Có lỗi xảy ra khi thêm mới phường xã SNN"}
    />
  )
}

