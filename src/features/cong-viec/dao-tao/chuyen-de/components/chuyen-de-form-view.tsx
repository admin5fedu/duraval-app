"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { chuyenDeSchema } from "../schema"
import type { CreateChuyenDeInput, UpdateChuyenDeInput } from "../schema"
import { useCreateChuyenDe, useUpdateChuyenDe } from "../hooks/use-chuyen-de-mutations"
import { useChuyenDeById } from "../hooks/use-chuyen-de"
import { chuyenDeConfig } from "../config"
import { useMemo } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useNhomChuyenDe } from "../../nhom-chuyen-de/hooks"
import { z } from "zod"

const getSections = (nhomChuyenDeOptions: Array<{ label: string; value: string }>): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { 
        name: "nhom_chuyen_de_id", 
        label: "Nhóm Chuyên Đề", 
        type: "select",
        options: nhomChuyenDeOptions,
        required: true 
      },
      { name: "ten_chuyen_de", label: "Tên Chuyên Đề", required: true },
      { name: "mo_ta", label: "Mô Tả", type: "textarea", colSpan: 2 },
    ]
  },
]

interface ChuyenDeFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function ChuyenDeFormView({ id, onComplete, onCancel }: ChuyenDeFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateChuyenDe()
  const updateMutation = useUpdateChuyenDe()
  const { user } = useAuthStore()
  const { data: nhomChuyenDeList } = useNhomChuyenDe()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const { data: existingData, isLoading } = useChuyenDeById(id ?? 0, undefined)
  
  // Computed values
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  const prefillNhomChuyenDeId = searchParams.get('nhom_chuyen_de_id')
  
  // Generate nhom chuyen de options
  const nhomChuyenDeOptions = useMemo(() => {
    if (!nhomChuyenDeList || nhomChuyenDeList.length === 0) {
      return [{ label: "Chưa có nhóm chuyên đề", value: "", disabled: true }]
    }
    return nhomChuyenDeList
      .filter(nhom => nhom.id !== undefined)
      .map(nhom => ({
        label: nhom.ten_nhom || `ID: ${nhom.id}`,
        value: String(nhom.id)
      }))
  }, [nhomChuyenDeList])
  
  // Create sections
  const sections = useMemo(() => {
    return getSections(nhomChuyenDeOptions)
  }, [nhomChuyenDeOptions])

  // ✅ QUAN TRỌNG: Tạo schema cho form (bỏ nguoi_tao_id vì sẽ tự động set)
  // Accept string từ select dropdown và convert thành number
  const formSchema = useMemo(() => {
    return chuyenDeSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, ten_nhom_chuyen_de: true })
      .extend({
        nhom_chuyen_de_id: z.union([
          z.number().int().positive("Nhóm chuyên đề là bắt buộc"),
          z.string().min(1, "Nhóm chuyên đề là bắt buộc").transform((val) => {
            const num = parseInt(val, 10)
            if (isNaN(num) || num <= 0) {
              throw new Error("Nhóm chuyên đề không hợp lệ")
            }
            return num
          }),
        ]),
      })
  }, [])

  // Prepare default values
  const defaultValues = useMemo(() => {
    if (id && existingData && existingData !== null && typeof existingData === 'object' && 'ten_chuyen_de' in existingData && existingData.ten_chuyen_de !== undefined) {
      return {
        nhom_chuyen_de_id: existingData.nhom_chuyen_de_id ? String(existingData.nhom_chuyen_de_id) : "",
        ten_chuyen_de: String(existingData.ten_chuyen_de || ""),
        mo_ta: existingData.mo_ta ? String(existingData.mo_ta) : "",
      }
    }
    // For new records - check if there are any nhom chuyen de available
    // Pre-fill nhom_chuyen_de_id if provided in query params
    let defaultNhomId = ""
    if (prefillNhomChuyenDeId) {
      defaultNhomId = String(prefillNhomChuyenDeId)
    } else if (nhomChuyenDeOptions.length > 0 && !('disabled' in nhomChuyenDeOptions[0] && nhomChuyenDeOptions[0].disabled)) {
      defaultNhomId = nhomChuyenDeOptions[0].value
    }
    return {
      nhom_chuyen_de_id: defaultNhomId,
      ten_chuyen_de: "",
      mo_ta: "",
    }
  }, [id, existingData, nhomChuyenDeOptions, prefillNhomChuyenDeId])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  // Computed values
  const cancelUrl = returnTo === 'list' 
    ? chuyenDeConfig.routePath
    : (id ? `${chuyenDeConfig.routePath}/${id}` : chuyenDeConfig.routePath)

  const handleSubmit = async (data: any) => {
    try {
      // Schema đã transform string thành number, nhưng để an toàn xử lý cả 2 trường hợp
      const getNhomChuyenDeId = (value: any): number | undefined => {
        if (value === null || value === undefined || value === "") {
          return undefined
        }
        if (typeof value === "number") {
          return value > 0 ? value : undefined
        }
        if (typeof value === "string") {
          const num = parseInt(value, 10)
          return !isNaN(num) && num > 0 ? num : undefined
        }
        return undefined
      }

      if (isEditMode && id) {
        const updateInput: UpdateChuyenDeInput = {
          ten_chuyen_de: data.ten_chuyen_de ? String(data.ten_chuyen_de).trim() : undefined,
          mo_ta: data.mo_ta ? String(data.mo_ta).trim() : null,
        }
        // Only update nhom_chuyen_de_id if it's provided and valid
        const nhomChuyenDeId = getNhomChuyenDeId(data.nhom_chuyen_de_id)
        if (nhomChuyenDeId !== undefined) {
          updateInput.nhom_chuyen_de_id = nhomChuyenDeId
        }
        await updateMutation.mutateAsync({ 
          id, 
          input: updateInput
        })
      } else {
        // Tự động set nguoi_tao_id từ user hiện tại
        if (!user?.id) {
          throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
        }
        const nhomChuyenDeId = getNhomChuyenDeId(data.nhom_chuyen_de_id)
        if (nhomChuyenDeId === undefined) {
          throw new Error("Vui lòng chọn nhóm chuyên đề")
        }
        const createInput: CreateChuyenDeInput = {
          nhom_chuyen_de_id: nhomChuyenDeId,
          ten_chuyen_de: String(data.ten_chuyen_de || "").trim(),
          mo_ta: data.mo_ta ? String(data.mo_ta).trim() : null,
          nguoi_tao_id: parseInt(user.id),
        }
        await createMutation.mutateAsync(createInput)
      }
    } catch (error: any) {
      // Error is handled by mutation, but we can add additional handling here if needed
      throw error
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
        navigate(chuyenDeConfig.routePath)
      } else if (id) {
        navigate(`${chuyenDeConfig.routePath}/${id}`)
      } else {
        navigate(chuyenDeConfig.routePath)
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
        ? `Sửa Chuyên Đề: ${existingData?.ten_chuyen_de || ''}` 
        : "Thêm Mới Chuyên Đề"}
      submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
      successMessage={isEditMode ? "Cập nhật chuyên đề thành công" : "Thêm mới chuyên đề thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật chuyên đề" : "Có lỗi xảy ra khi thêm mới chuyên đề"}
    />
  )
}

