"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { capBacSchema } from "../schema"
import { useCreateCapBac, useUpdateCapBac } from "../hooks/use-cap-bac-mutations"
import { useCapBacById } from "../hooks/use-cap-bac"
import { capBacConfig } from "../config"
import { useMemo } from "react"
import type { CreateCapBacInput, UpdateCapBacInput } from "../types"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ten_cap_bac", label: "Tên Cấp Bậc", required: true },
      { name: "cap_bac", label: "Cấp Bậc", type: "number", required: true },
    ]
  }
]

interface CapBacFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function CapBacFormView({ id, onComplete, onCancel }: CapBacFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateCapBac()
  const updateMutation = useUpdateCapBac()

  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  // để đảm bảo thứ tự hooks nhất quán giữa các lần render

  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])

  // If id is provided, fetch existing data for edit mode
  // ✅ QUAN TRỌNG: Hook luôn được gọi với cùng signature để tránh "Rendered more hooks"
  const { data: existingData, isLoading } = useCapBacById(id ?? 0, undefined)

  // ✅ QUAN TRỌNG: Tạo schema cho form
  // Phải được tạo TRƯỚC early return
  const formSchema = useMemo(() => {
    return capBacSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true })
  }, [])

  // Prepare default values
  // Phải được tạo TRƯỚC early return
  const defaultValues = useMemo(() => {
    if (id && existingData) {
      return existingData
    }
    return undefined
  }, [id, existingData])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (id && isLoading) {
    return <div>Đang tải...</div>
  }

  // Computed values (không phải hooks, có thể đặt sau early return)
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  const cancelUrl = returnTo === 'list'
    ? capBacConfig.routePath
    : (id ? `${capBacConfig.routePath}/${id}` : capBacConfig.routePath)

  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: data as UpdateCapBacInput })
    } else {
      await createMutation.mutateAsync(data as CreateCapBacInput)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Fallback to default navigation
      if (returnTo === 'list') {
        navigate(capBacConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${capBacConfig.routePath}/${id}`)
      } else {
        navigate(capBacConfig.routePath)
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
      title={isEditMode ? `Sửa Cấp Bậc: ${existingData?.ten_cap_bac || ''}` : "Thêm Mới Cấp Bậc"}
      subtitle={isEditMode ? "Cập nhật thông tin cấp bậc." : "Thêm cấp bậc mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật cấp bậc thành công" : "Thêm mới cấp bậc thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật cấp bậc" : "Có lỗi xảy ra khi thêm mới cấp bậc"}
      defaultValues={defaultValues}
    />
  )
}

