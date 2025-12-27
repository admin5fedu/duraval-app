"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { phongBanSchema } from "../schema"
import type { CreatePhongBanInput, UpdatePhongBanInput } from "../schema"
import { useCreatePhongBan, useUpdatePhongBan } from "../hooks/use-phong-ban-mutations"
import { usePhongBanById } from "../hooks/use-phong-ban"
import { phongBanConfig } from "../config"
import { useMemo } from "react"
import { usePhongBan } from "../hooks/use-phong-ban"

const getSections = (phongBanList: any[] = [], excludeId?: number): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "tt", label: "Số Thứ Tự", type: "number" },
      { name: "ma_phong_ban", label: "Mã Phòng Ban", required: true },
      { name: "ten_phong_ban", label: "Tên Phòng Ban", required: true },
      { 
        name: "cap_do", 
        label: "Cấp Độ", 
        required: true,
        type: "toggle",
        options: [
          { label: "Phòng", value: "Phòng" },
          { label: "Bộ phận", value: "Bộ phận" },
          { label: "Nhóm", value: "Nhóm" },
        ],
      },
    ]
  },
  {
    title: "Thông Tin Trực Thuộc",
    fields: [
      { 
        name: "truc_thuoc_id", 
        label: "Trực Thuộc Phòng Ban", 
        type: "phong-ban-select",
        placeholder: "Chọn phòng ban trực thuộc...",
        description: "Tìm kiếm theo tên hoặc mã phòng ban",
        excludeIds: excludeId ? [excludeId] : [],
        colSpan: 2,
      },
    ]
  }
]

interface PhongBanFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function PhongBanFormView({ id, onComplete, onCancel }: PhongBanFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreatePhongBan()
  const updateMutation = useUpdatePhongBan()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  // để đảm bảo thứ tự hooks nhất quán giữa các lần render
  
  // Fetch list of phòng ban for dropdown
  const { data: phongBanList } = usePhongBan()
  
  // Create sections with phòng ban list, exclude current ID when editing
  const sections = useMemo(() => {
    return getSections(phongBanList || [], id || undefined)
  }, [phongBanList, id])
  
  // If id is provided, fetch existing data for edit mode
  // ✅ QUAN TRỌNG: Hook luôn được gọi với cùng signature để tránh "Rendered more hooks"
  const { data: existingData, isLoading } = usePhongBanById(id ?? 0, undefined)

  // ✅ QUAN TRỌNG: Tạo schema cho form
  // Phải được tạo TRƯỚC early return
  const formSchema = useMemo(() => {
    return phongBanSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao: true })
  }, [])

  // Calculate max tt + 1 for new records
  const maxTt = useMemo(() => {
    if (!phongBanList || phongBanList.length === 0) return 1
    const maxValue = Math.max(...phongBanList.map((pb) => pb.tt || 0).filter((tt) => tt !== null && tt !== undefined))
    return maxValue + 1
  }, [phongBanList])

  // Prepare default values
  // Phải được tạo TRƯỚC early return
  const defaultValues = useMemo(() => {
    if (id && existingData) {
      return {
        ...existingData,
        truc_thuoc_id: existingData.truc_thuoc_id || null,
      }
    }
    // For new records, auto-fill tt with max + 1
    return {
      tt: maxTt,
      truc_thuoc_id: null,
    }
  }, [id, existingData, maxTt])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (id && isLoading) {
    return <div>Đang tải...</div>
  }

  // Computed values (không phải hooks, có thể đặt sau early return)
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  const cancelUrl = returnTo === 'list' 
    ? phongBanConfig.routePath
    : (id ? `${phongBanConfig.routePath}/${id}` : phongBanConfig.routePath)

  const handleSubmit = async (data: any) => {
    // truc_thuoc_id is already a number from PhongBanSelect
    const submitData = {
      ...data,
      truc_thuoc_id: data.truc_thuoc_id || null,
      // Auto-fill truc_thuoc_phong_ban from selected truc_thuoc_id
      truc_thuoc_phong_ban: data.truc_thuoc_id 
        ? phongBanList?.find((pb) => pb.id === data.truc_thuoc_id)?.ten_phong_ban || null
        : null,
    }
    
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, data: submitData as UpdatePhongBanInput })
    } else {
      await createMutation.mutateAsync(submitData as CreatePhongBanInput)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Fallback to default navigation
      if (returnTo === 'list') {
        navigate(phongBanConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${phongBanConfig.routePath}/${id}`)
      } else {
        navigate(phongBanConfig.routePath)
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
      title={isEditMode ? `Sửa Phòng Ban: ${existingData?.ten_phong_ban || ''}` : "Thêm Mới Phòng Ban"}
      subtitle={isEditMode ? "Cập nhật thông tin phòng ban." : "Thêm phòng ban mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật phòng ban thành công" : "Thêm mới phòng ban thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật phòng ban" : "Có lỗi xảy ra khi thêm mới phòng ban"}
      defaultValues={defaultValues}
    />
  )
}

