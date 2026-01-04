"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { mucDangKySchema } from "../schema"
import type { CreateMucDangKyInput, UpdateMucDangKyInput } from "../schema"
import { useCreateMucDangKy, useUpdateMucDangKy } from "../hooks/use-muc-dang-ky-mutations"
import { useMucDangKyById } from "../hooks/use-muc-dang-ky"
import { mucDangKyConfig } from "../config"
import { useMemo } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ma_hang", label: "Mã Hạng" },
      { name: "ten_hang", label: "Tên Hạng", required: true },
      {
        name: "doanh_so_min_quy",
        label: "Doanh Số Min (Quý)",
        type: "number",
        formatThousands: true,
      },
      {
        name: "doanh_so_max_quy",
        label: "Doanh Số Max (Quý)",
        type: "number",
        formatThousands: true,
      },
      {
        name: "doanh_so_min_nam",
        label: "Doanh Số Min (Năm)",
        type: "number",
        formatThousands: true,
      },
      {
        name: "doanh_so_max_nam",
        label: "Doanh Số Max (Năm)",
        type: "number",
        formatThousands: true,
      },
      {
        name: "ghi_chu",
        label: "Ghi Chú",
        type: "textarea",
      },
    ]
  },
]

interface MucDangKyFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function MucDangKyFormView({ id, onComplete, onCancel }: MucDangKyFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateMucDangKy()
  const updateMutation = useUpdateMucDangKy()
  const { employee } = useAuthStore()

  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const { data: existingData, isLoading } = useMucDangKyById(id ?? 0, undefined)

  // Computed values
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id

  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])

  // ✅ QUAN TRỌNG: Tạo schema cho form
  const formSchema = useMemo(() => {
    return mucDangKySchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, nguoi_tao_ten: true })
  }, [])

  // ✅ QUAN TRỌNG: Prepare default values BEFORE early return
  const defaultValues = useMemo(() => {
    if (isEditMode && existingData && existingData !== null && typeof existingData === 'object' && 'ten_hang' in existingData && existingData.ten_hang !== undefined) {
      return {
        ma_hang: existingData.ma_hang ? String(existingData.ma_hang) : "",
        ten_hang: String(existingData.ten_hang || ""),
        doanh_so_min_quy: existingData.doanh_so_min_quy ?? null,
        doanh_so_max_quy: existingData.doanh_so_max_quy ?? null,
        doanh_so_min_nam: existingData.doanh_so_min_nam ?? null,
        doanh_so_max_nam: existingData.doanh_so_max_nam ?? null,
        ghi_chu: existingData.ghi_chu ? String(existingData.ghi_chu) : "",
      }
    }

    // For new record
    return {
      ma_hang: "",
      ten_hang: "",
      doanh_so_min_quy: null,
      doanh_so_max_quy: null,
      doanh_so_min_nam: null,
      doanh_so_max_nam: null,
      ghi_chu: "",
    }
  }, [isEditMode, existingData])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  const cancelUrl = returnTo === 'list'
    ? mucDangKyConfig.routePath
    : (id ? `${mucDangKyConfig.routePath}/${id}` : mucDangKyConfig.routePath)

  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      const updateData: UpdateMucDangKyInput = {
        ma_hang: data.ma_hang || null,
        ten_hang: data.ten_hang || null,
        doanh_so_min_quy: data.doanh_so_min_quy ?? null,
        doanh_so_max_quy: data.doanh_so_max_quy ?? null,
        doanh_so_min_nam: data.doanh_so_min_nam ?? null,
        doanh_so_max_nam: data.doanh_so_max_nam ?? null,
        ghi_chu: data.ghi_chu || null,
      }
      await updateMutation.mutateAsync({ id, input: updateData })
    } else {
      const createData: CreateMucDangKyInput = {
        ma_hang: data.ma_hang || null,
        ten_hang: data.ten_hang || null,
        doanh_so_min_quy: data.doanh_so_min_quy ?? null,
        doanh_so_max_quy: data.doanh_so_max_quy ?? null,
        doanh_so_min_nam: data.doanh_so_min_nam ?? null,
        doanh_so_max_nam: data.doanh_so_max_nam ?? null,
        ghi_chu: data.ghi_chu || null,
        nguoi_tao_id: employee?.ma_nhan_vien || null,
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
        navigate(mucDangKyConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${mucDangKyConfig.routePath}/${id}`)
      } else {
        navigate(mucDangKyConfig.routePath)
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
      title={isEditMode ? `Sửa Mức Đăng Ký: ${existingData?.ten_hang || ''}` : "Thêm Mới Mức Đăng Ký"}
      subtitle={isEditMode ? "Cập nhật thông tin mức đăng ký." : "Thêm mức đăng ký mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật mức đăng ký thành công" : "Thêm mới mức đăng ký thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật mức đăng ký" : "Có lỗi xảy ra khi thêm mới mức đăng ký"}
      defaultValues={defaultValues}
    />
  )
}

