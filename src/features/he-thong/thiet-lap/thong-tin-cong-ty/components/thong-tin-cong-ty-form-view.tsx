"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { thongTinCongTySchema } from "../schema"
import type { CreateThongTinCongTyInput, UpdateThongTinCongTyInput } from "../schema"
import { useCreateThongTinCongTy, useUpdateThongTinCongTy } from "../hooks/use-thong-tin-cong-ty-mutations"
import { useThongTinCongTyById } from "../hooks/use-thong-tin-cong-ty"
import { thongTinCongTyConfig } from "../config"
import { useMemo } from "react"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ma_cong_ty", label: "Mã Công Ty", required: true },
      { name: "ten_cong_ty", label: "Tên Công Ty", required: true },
      { name: "ten_day_du", label: "Tên Đầy Đủ", required: true, colSpan: 2 },
      { 
        name: "link_logo", 
        label: "Link Logo", 
        type: "image", 
        imageFolder: "cong-ty/logos",
        imageMaxSize: 5,
        required: true,
        colSpan: 2,
      },
    ]
  },
  {
    title: "Thông Tin Liên Hệ",
    fields: [
      { name: "dia_chi", label: "Địa Chỉ", required: true, colSpan: 2 },
      { name: "so_dien_thoai", label: "Số Điện Thoại", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "website", label: "Website", required: true, colSpan: 2 },
    ]
  },
  {
    title: "Cài Đặt",
    fields: [
      { 
        name: "ap_dung", 
        label: "Áp Dụng", 
        type: "toggle",
        options: [
          { label: "Có", value: "true" },
          { label: "Không", value: "false" },
        ],
      },
    ]
  }
]

interface ThongTinCongTyFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function ThongTinCongTyFormView({ id, onComplete, onCancel }: ThongTinCongTyFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateThongTinCongTy()
  const updateMutation = useUpdateThongTinCongTy()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  // để đảm bảo thứ tự hooks nhất quán giữa các lần render
  
  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])
  
  // If id is provided, fetch existing data for edit mode
  // ✅ QUAN TRỌNG: Hook luôn được gọi với cùng signature để tránh "Rendered more hooks"
  const { data: existingData, isLoading } = useThongTinCongTyById(id ?? 0, undefined)

  // ✅ QUAN TRỌNG: Tạo schema cho form
  // Phải được tạo TRƯỚC early return
  const formSchema = useMemo(() => {
    return thongTinCongTySchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true })
  }, [])

  // Prepare default values
  // Phải được tạo TRƯỚC early return
  const defaultValues = useMemo(() => {
    if (id && existingData) {
      return {
        ...existingData,
        ap_dung: existingData.ap_dung ? "true" : "false"
      }
    }
    return {
      ap_dung: "false"
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
    ? thongTinCongTyConfig.routePath
    : (id ? `${thongTinCongTyConfig.routePath}/${id}` : thongTinCongTyConfig.routePath)

  const handleSubmit = async (data: any) => {
    // Convert ap_dung from string to boolean
    const submitData = {
      ...data,
      ap_dung: data.ap_dung === "true" || data.ap_dung === true
    }
    
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: submitData as UpdateThongTinCongTyInput })
    } else {
      await createMutation.mutateAsync(submitData as CreateThongTinCongTyInput)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Fallback to default navigation
      if (returnTo === 'list') {
        navigate(thongTinCongTyConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${thongTinCongTyConfig.routePath}/${id}`)
      } else {
        navigate(thongTinCongTyConfig.routePath)
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
      title={isEditMode ? `Sửa Thông Tin Công Ty: ${existingData?.ten_cong_ty || ''}` : "Thêm Mới Thông Tin Công Ty"}
      subtitle={isEditMode ? "Cập nhật thông tin công ty." : "Thêm thông tin công ty mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật thông tin công ty thành công" : "Thêm mới thông tin công ty thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật thông tin công ty" : "Có lỗi xảy ra khi thêm mới thông tin công ty"}
      defaultValues={defaultValues}
    />
  )
}

