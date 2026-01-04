"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { hinhAnhKhachBuonBaseSchema } from "../schema"
import type { CreateHinhAnhKhachBuonInput, UpdateHinhAnhKhachBuonInput } from "../schema"
import { useCreateHinhAnhKhachBuon, useUpdateHinhAnhKhachBuon } from "../hooks/use-hinh-anh-khach-buon-mutations"
import { useHinhAnhKhachBuonById } from "../hooks/use-hinh-anh-khach-buon"
import { hinhAnhKhachBuonConfig } from "../config"
import { useMemo } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      {
        name: "khach_buon_id",
        label: "Khách Buôn",
        type: "khach-buon-select",
        required: true,
      },
      { 
        name: "hang_muc", 
        label: "Hạng Mục",
        type: "toggle",
        required: true,
        options: [
          { label: "Sản phẩm", value: "Sản phẩm" },
          { label: "Khác", value: "Khác" },
        ],
      },
      { name: "hinh_anh", label: "Hình Ảnh", type: "image", required: true },
    ]
  },
  {
    title: "Thông Tin Khác",
    fields: [
      { name: "mo_ta", label: "Mô Tả", type: "textarea" },
      { name: "ghi_chu", label: "Ghi Chú", type: "textarea", colSpan: 2 },
    ]
  },
]

interface HinhAnhKhachBuonFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function HinhAnhKhachBuonFormView({ id, onComplete, onCancel }: HinhAnhKhachBuonFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateHinhAnhKhachBuon()
  const updateMutation = useUpdateHinhAnhKhachBuon()
  const { employee } = useAuthStore()

  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const { data: existingData, isLoading } = useHinhAnhKhachBuonById(id ?? 0, undefined)

  // Computed values
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')

  const handleSubmit = async (data: any) => {
    const submitData: CreateHinhAnhKhachBuonInput | UpdateHinhAnhKhachBuonInput = {
      khach_buon_id: data.khach_buon_id?.id || data.khach_buon_id,
      hang_muc: data.hang_muc || "Sản phẩm",
      hinh_anh: data.hinh_anh || "",
      mo_ta: data.mo_ta || null,
      ghi_chu: data.ghi_chu || null,
      nguoi_tao_id: employee?.ma_nhan_vien || null,
    }

    if (id) {
      await updateMutation.mutateAsync({ 
        id, 
        input: submitData as UpdateHinhAnhKhachBuonInput 
      })
    } else {
      await createMutation.mutateAsync(submitData as CreateHinhAnhKhachBuonInput)
    }

    if (onComplete) {
      onComplete()
    } else if (returnTo === 'detail' && id) {
      navigate(`${hinhAnhKhachBuonConfig.routePath}/${id}`)
    } else {
      navigate(hinhAnhKhachBuonConfig.routePath)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else if (returnTo === 'detail' && id) {
      navigate(`${hinhAnhKhachBuonConfig.routePath}/${id}`)
    } else {
      navigate(hinhAnhKhachBuonConfig.routePath)
    }
  }

  const sections = useMemo(() => getSections(), [])

  const defaultValues = useMemo(() => {
    if (id && existingData) {
      return {
        khach_buon_id: existingData.khach_buon_id,
        hang_muc: existingData.hang_muc || "Sản phẩm",
        hinh_anh: existingData.hinh_anh || "",
        mo_ta: existingData.mo_ta || "",
        ghi_chu: existingData.ghi_chu || "",
      }
    }
    return {
      khach_buon_id: null,
      hang_muc: "Sản phẩm",
      hinh_anh: "",
      mo_ta: "",
      ghi_chu: "",
    }
  }, [id, existingData])

  if (isLoading) {
    return <div>Đang tải...</div>
  }

  return (
    <GenericFormView
      title={id ? "Sửa Hình Ảnh Khách Buôn" : "Thêm Mới Hình Ảnh Khách Buôn"}
      subtitle={id ? `Cập nhật thông tin hình ảnh khách buôn` : "Thêm hình ảnh khách buôn mới"}
      sections={sections}
      schema={hinhAnhKhachBuonBaseSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  )
}

