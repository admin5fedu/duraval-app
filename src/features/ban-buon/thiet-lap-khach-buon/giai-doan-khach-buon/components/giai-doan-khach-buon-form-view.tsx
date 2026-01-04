"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { giaiDoanKhachBuonSchema } from "../schema"
import type { CreateGiaiDoanKhachBuonInput, UpdateGiaiDoanKhachBuonInput } from "../schema"
import { useCreateGiaiDoanKhachBuon, useUpdateGiaiDoanKhachBuon } from "../hooks/use-giai-doan-khach-buon-mutations"
import { useGiaiDoanKhachBuonById, useGiaiDoanKhachBuon } from "../hooks/use-giai-doan-khach-buon"
import { giaiDoanKhachBuonConfig } from "../config"
import { useMemo } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ma_giai_doan", label: "Mã Giai Đoạn", required: true },
      { name: "ten_giai_doan", label: "Tên Giai Đoạn", required: true },
      {
        name: "tt",
        label: "Thứ Tự",
        type: "number",
        required: true,
      },
      { 
        name: "mo_ta", 
        label: "Mô Tả", 
        type: "textarea",
      },
    ]
  },
]

interface GiaiDoanKhachBuonFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function GiaiDoanKhachBuonFormView({ id, onComplete, onCancel }: GiaiDoanKhachBuonFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateGiaiDoanKhachBuon()
  const updateMutation = useUpdateGiaiDoanKhachBuon()
  const { employee } = useAuthStore()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const { data: existingData, isLoading } = useGiaiDoanKhachBuonById(id ?? 0, undefined)
  // Get all data to calculate max tt for default value
  const { data: allData } = useGiaiDoanKhachBuon(undefined)
  
  // Computed values
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  
  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])

  // ✅ QUAN TRỌNG: Tạo schema cho form
  const formSchema = useMemo(() => {
    return giaiDoanKhachBuonSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, nguoi_tao_ten: true })
  }, [])

  // ✅ QUAN TRỌNG: Prepare default values BEFORE early return
  const defaultValues = useMemo(() => {
    if (isEditMode && existingData && existingData !== null && typeof existingData === 'object' && 'ten_giai_doan' in existingData && existingData.ten_giai_doan !== undefined) {
      return {
        ma_giai_doan: existingData.ma_giai_doan ? String(existingData.ma_giai_doan) : "",
        ten_giai_doan: String(existingData.ten_giai_doan || ""),
        mo_ta: existingData.mo_ta ? String(existingData.mo_ta) : "",
        tt: existingData.tt ?? undefined,
      }
    }
    
    // Calculate max tt for new record
    const maxTt = allData?.reduce((max, item) => {
      const currentTt = item.tt ?? 0
      return currentTt > max ? currentTt : max
    }, 0) ?? 0
    
    return {
      ma_giai_doan: "",
      ten_giai_doan: "",
      mo_ta: "",
      tt: maxTt + 1,
    }
  }, [isEditMode, existingData, allData])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  const cancelUrl = returnTo === 'list' 
    ? giaiDoanKhachBuonConfig.routePath
    : (id ? `${giaiDoanKhachBuonConfig.routePath}/${id}` : giaiDoanKhachBuonConfig.routePath)

  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: data as UpdateGiaiDoanKhachBuonInput })
    } else {
      // Create mode - tự động thêm nguoi_tao_id từ employee hiện tại
      const nguoiTaoId = employee?.ma_nhan_vien || null
      const createData: CreateGiaiDoanKhachBuonInput = {
        ...data as CreateGiaiDoanKhachBuonInput,
        nguoi_tao_id: nguoiTaoId,
      }
      await createMutation.mutateAsync(createData)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Fallback to default navigation
      if (returnTo === 'list') {
        navigate(giaiDoanKhachBuonConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}`)
      } else {
        navigate(giaiDoanKhachBuonConfig.routePath)
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
      title={isEditMode ? `Sửa Giai Đoạn Khách Buôn: ${existingData?.ten_giai_doan || ''}` : "Thêm Mới Giai Đoạn Khách Buôn"}
      subtitle={isEditMode ? "Cập nhật thông tin giai đoạn khách buôn." : "Thêm giai đoạn khách buôn mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật giai đoạn khách buôn thành công" : "Thêm mới giai đoạn khách buôn thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật giai đoạn khách buôn" : "Có lỗi xảy ra khi thêm mới giai đoạn khách buôn"}
      defaultValues={defaultValues}
    />
  )
}

