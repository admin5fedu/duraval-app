"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { nhomPhieuHanhChinhSchema } from "../schema"
import { useCreateNhomPhieuHanhChinh, useUpdateNhomPhieuHanhChinh } from "../hooks/use-nhom-phieu-hanh-chinh-mutations"
import { useNhomPhieuHanhChinhById } from "../hooks/use-nhom-phieu-hanh-chinh"
import { nhomPhieuHanhChinhConfig } from "../config"
import { useMemo } from "react"
import type { CreateNhomPhieuHanhChinhInput, UpdateNhomPhieuHanhChinhInput } from "../types"
import { LoaiPhieuAutocomplete } from "./loai-phieu-autocomplete"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { 
        name: "loai_phieu", 
        label: "Loại Phiếu", 
        required: true,
        type: "custom",
        customComponent: LoaiPhieuAutocomplete,
      },
      { name: "ma_nhom_phieu", label: "Mã Nhóm Phiếu", required: true },
      { name: "ten_nhom_phieu", label: "Tên Nhóm Phiếu", required: true },
      { 
        name: "so_luong_cho_phep_thang", 
        label: "Số Lượng Cho Phép/Tháng", 
        type: "number", 
        required: true,
        description: "Số lượng không được nhỏ hơn 0"
      },
    ]
  },
  {
    title: "Cấu Hình",
    fields: [
      { 
        name: "can_hcns_duyet", 
        label: "Cần HCNS Duyệt", 
        type: "toggle",
        options: [
          { label: "Có", value: "Có" },
          { label: "Không", value: "Không" },
        ]
      },
      { 
        name: "ca_toi", 
        label: "Ca Tối", 
        type: "toggle",
        options: [
          { label: "Có", value: "Có" },
          { label: "Không", value: "Không" },
        ]
      },
    ]
  }
]

interface NhomPhieuHanhChinhFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function NhomPhieuHanhChinhFormView({ id, onComplete, onCancel }: NhomPhieuHanhChinhFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateNhomPhieuHanhChinh()
  const updateMutation = useUpdateNhomPhieuHanhChinh()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  // để đảm bảo thứ tự hooks nhất quán giữa các lần render
  
  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])
  
  // If id is provided, fetch existing data for edit mode
  // ✅ QUAN TRỌNG: Hook luôn được gọi với cùng signature để tránh "Rendered more hooks"
  const { data: existingData, isLoading } = useNhomPhieuHanhChinhById(id ?? 0, undefined)

  // ✅ QUAN TRỌNG: Tạo schema cho form
  // Phải được tạo TRƯỚC early return
  const formSchema = useMemo(() => {
    // Schema already allows empty string for ca_toi, no need to extend
    return nhomPhieuHanhChinhSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true })
  }, [])

  // Prepare default values
  // Phải được tạo TRƯỚC early return
  const defaultValues = useMemo(() => {
    if (id && existingData) {
      return {
        ...existingData,
        // Ensure can_hcns_duyet is always "Có" or "Không"
        can_hcns_duyet: (existingData.can_hcns_duyet === "Có" || existingData.can_hcns_duyet === "Không") 
          ? existingData.can_hcns_duyet 
          : "Không",
        // ca_toi can be "Có", "Không", or null
        ca_toi: (existingData.ca_toi === "Có" || existingData.ca_toi === "Không") 
          ? existingData.ca_toi 
          : null,
      }
    }
    return {
      so_luong_cho_phep_thang: 0,
      can_hcns_duyet: "Không",
      ca_toi: null,
    }
  }, [id, existingData])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (id && isLoading) {
    return <div>Đang tải...</div>
  }

  // Computed values (không phải hooks, có thể đặt sau early return)
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  const cancelUrl = returnTo === 'list' 
    ? nhomPhieuHanhChinhConfig.routePath
    : (id ? `${nhomPhieuHanhChinhConfig.routePath}/${id}` : nhomPhieuHanhChinhConfig.routePath)

  const handleSubmit = async (data: any) => {
    // Toggle buttons return "Có"/"Không" - use directly
    const submitData = {
      ...data,
      can_hcns_duyet: data.can_hcns_duyet || "Không",
      ca_toi: data.ca_toi || null,
    }
    
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: submitData as UpdateNhomPhieuHanhChinhInput })
    } else {
      await createMutation.mutateAsync(submitData as CreateNhomPhieuHanhChinhInput)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Fallback to default navigation
      if (returnTo === 'list') {
        navigate(nhomPhieuHanhChinhConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${nhomPhieuHanhChinhConfig.routePath}/${id}`)
      } else {
        navigate(nhomPhieuHanhChinhConfig.routePath)
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
      title={isEditMode ? `Sửa Nhóm Phiếu Hành Chính: ${existingData?.ten_nhom_phieu || ''}` : "Thêm Mới Nhóm Phiếu Hành Chính"}
      subtitle={isEditMode ? "Cập nhật thông tin nhóm phiếu hành chính." : "Thêm nhóm phiếu hành chính mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật nhóm phiếu hành chính thành công" : "Thêm mới nhóm phiếu hành chính thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật nhóm phiếu hành chính" : "Có lỗi xảy ra khi thêm mới nhóm phiếu hành chính"}
      defaultValues={defaultValues}
    />
  )
}

