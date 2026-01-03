"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { cauHoiSchema } from "../schema"
import type { CreateCauHoiInput, UpdateCauHoiInput } from "../schema"
import { useCreateCauHoi, useUpdateCauHoi } from "../hooks/use-cau-hoi-mutations"
import { useCauHoiById } from "../hooks/use-cau-hoi"
import { cauHoiConfig } from "../config"
import { useMemo } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useChuyenDe } from "../../chuyen-de/hooks"
import { z } from "zod"

const getSections = (chuyenDeOptions: Array<{ label: string; value: string }>): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { 
        name: "chuyen_de_id", 
        label: "Chuyên Đề", 
        type: "select",
        options: chuyenDeOptions,
        required: true 
      },
      { name: "cau_hoi", label: "Câu Hỏi", type: "textarea", required: true, colSpan: 2 },
      { 
        name: "hinh_anh", 
        label: "Hình Ảnh", 
        type: "image",
        imageMaxSize: 10,
        multiple: true,
        colSpan: 2,
        description: "Có thể tải lên nhiều hình ảnh. Hỗ trợ JPG, PNG, GIF, WebP, tối đa 10MB mỗi ảnh."
      },
    ]
  },
  {
    title: "Đáp Án",
    fields: [
      { name: "dap_an_1", label: "Đáp Án 1", required: true },
      { name: "dap_an_2", label: "Đáp Án 2", required: true },
      { name: "dap_an_3", label: "Đáp Án 3", required: true },
      { name: "dap_an_4", label: "Đáp Án 4", required: true },
      { 
        name: "dap_an_dung", 
        label: "Đáp Án Đúng", 
        type: "toggle",
        options: [
          { label: "Đáp án 1", value: "1" },
          { label: "Đáp án 2", value: "2" },
          { label: "Đáp án 3", value: "3" },
          { label: "Đáp án 4", value: "4" },
        ],
        required: true 
      },
    ]
  },
]

interface CauHoiFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function CauHoiFormView({ id, onComplete, onCancel }: CauHoiFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateCauHoi()
  const updateMutation = useUpdateCauHoi()
  const { user } = useAuthStore()
  const { data: chuyenDeList } = useChuyenDe()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const { data: existingData, isLoading } = useCauHoiById(id ?? 0, undefined)
  
  // Computed values
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  const prefillChuyenDeId = searchParams.get('chuyen_de_id')
  
  // Generate chuyen de options
  const chuyenDeOptions = useMemo(() => {
    if (!chuyenDeList || chuyenDeList.length === 0) {
      return [{ label: "Chưa có chuyên đề", value: "", disabled: true }]
    }
    return chuyenDeList
      .filter(chuyenDe => chuyenDe.id !== undefined)
      .map(chuyenDe => ({
        label: chuyenDe.ten_chuyen_de || `ID: ${chuyenDe.id}`,
        value: String(chuyenDe.id)
      }))
  }, [chuyenDeList])
  
  // Create sections
  const sections = useMemo(() => {
    return getSections(chuyenDeOptions)
  }, [chuyenDeOptions])

  // ✅ QUAN TRỌNG: Tạo schema cho form (bỏ nguoi_tao_id vì sẽ tự động set)
  // Accept string từ select dropdown và convert thành number
  const formSchema = useMemo(() => {
    return cauHoiSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, ten_chuyen_de: true })
      .extend({
        chuyen_de_id: z.union([
          z.number().int().positive("Chuyên đề là bắt buộc"),
          z.string().min(1, "Chuyên đề là bắt buộc").transform((val) => {
            const num = parseInt(val, 10)
            if (isNaN(num) || num <= 0) {
              throw new Error("Chuyên đề không hợp lệ")
            }
            return num
          }),
        ]),
        dap_an_dung: z.union([
          z.number().int().min(1).max(4),
          z.string().min(1).transform((val) => {
            const num = parseInt(val, 10)
            if (isNaN(num) || num < 1 || num > 4) {
              throw new Error("Đáp án đúng phải từ 1 đến 4")
            }
            return num
          }),
        ]),
      })
  }, [])

  // Prepare default values
  const defaultValues = useMemo(() => {
    if (id && existingData && existingData !== null && typeof existingData === 'object' && 'cau_hoi' in existingData && existingData.cau_hoi !== undefined) {
      return {
        chuyen_de_id: existingData.chuyen_de_id ? String(existingData.chuyen_de_id) : "",
        cau_hoi: String(existingData.cau_hoi || ""),
        hinh_anh: existingData.hinh_anh && Array.isArray(existingData.hinh_anh) ? existingData.hinh_anh : [],
        dap_an_1: String(existingData.dap_an_1 || ""),
        dap_an_2: String(existingData.dap_an_2 || ""),
        dap_an_3: String(existingData.dap_an_3 || ""),
        dap_an_4: String(existingData.dap_an_4 || ""),
        dap_an_dung: existingData.dap_an_dung ? String(existingData.dap_an_dung) : "1",
      }
    }
    // For new records - check if there are any chuyen de available
    // Pre-fill chuyen_de_id if provided in query params
    let defaultChuyenDeId = ""
    if (prefillChuyenDeId) {
      defaultChuyenDeId = String(prefillChuyenDeId)
    } else if (chuyenDeOptions.length > 0 && !('disabled' in chuyenDeOptions[0] && chuyenDeOptions[0].disabled)) {
      defaultChuyenDeId = chuyenDeOptions[0].value
    }
    return {
      chuyen_de_id: defaultChuyenDeId,
      cau_hoi: "",
      hinh_anh: [],
      dap_an_1: "",
      dap_an_2: "",
      dap_an_3: "",
      dap_an_4: "",
      dap_an_dung: "1",
    }
  }, [id, existingData, chuyenDeOptions, prefillChuyenDeId])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  // Computed values
  const cancelUrl = returnTo === 'list' 
    ? cauHoiConfig.routePath
    : (id ? `${cauHoiConfig.routePath}/${id}` : cauHoiConfig.routePath)

  const handleSubmit = async (data: any) => {
    try {
      // Schema đã transform string thành number, nhưng để an toàn xử lý cả 2 trường hợp
      const getChuyenDeId = (value: any): number | undefined => {
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

      const getDapAnDung = (value: any): number => {
        if (typeof value === "number") {
          return value >= 1 && value <= 4 ? value : 1
        }
        if (typeof value === "string") {
          const num = parseInt(value, 10)
          return !isNaN(num) && num >= 1 && num <= 4 ? num : 1
        }
        return 1
      }

      if (isEditMode && id) {
        const updateInput: UpdateCauHoiInput = {
          cau_hoi: data.cau_hoi ? String(data.cau_hoi).trim() : undefined,
          dap_an_1: data.dap_an_1 ? String(data.dap_an_1).trim() : undefined,
          dap_an_2: data.dap_an_2 ? String(data.dap_an_2).trim() : undefined,
          dap_an_3: data.dap_an_3 ? String(data.dap_an_3).trim() : undefined,
          dap_an_4: data.dap_an_4 ? String(data.dap_an_4).trim() : undefined,
          dap_an_dung: getDapAnDung(data.dap_an_dung),
          hinh_anh: Array.isArray(data.hinh_anh) ? data.hinh_anh.filter((url: string) => url && url.trim()) : undefined,
        }
        // Only update chuyen_de_id if it's provided and valid
        const chuyenDeId = getChuyenDeId(data.chuyen_de_id)
        if (chuyenDeId !== undefined) {
          updateInput.chuyen_de_id = chuyenDeId
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
        const chuyenDeId = getChuyenDeId(data.chuyen_de_id)
        if (chuyenDeId === undefined) {
          throw new Error("Vui lòng chọn chuyên đề")
        }
        const createInput: CreateCauHoiInput = {
          chuyen_de_id: chuyenDeId,
          cau_hoi: String(data.cau_hoi || "").trim(),
          dap_an_1: String(data.dap_an_1 || "").trim(),
          dap_an_2: String(data.dap_an_2 || "").trim(),
          dap_an_3: String(data.dap_an_3 || "").trim(),
          dap_an_4: String(data.dap_an_4 || "").trim(),
          dap_an_dung: getDapAnDung(data.dap_an_dung),
          hinh_anh: Array.isArray(data.hinh_anh) ? data.hinh_anh.filter((url: string) => url && url.trim()) : null,
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
        navigate(cauHoiConfig.routePath)
      } else if (id) {
        navigate(`${cauHoiConfig.routePath}/${id}`)
      } else {
        navigate(cauHoiConfig.routePath)
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
        ? `Sửa Câu Hỏi: ${existingData?.cau_hoi?.substring(0, 50) || ''}...` 
        : "Thêm Mới Câu Hỏi"}
      submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
      successMessage={isEditMode ? "Cập nhật câu hỏi thành công" : "Thêm mới câu hỏi thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật câu hỏi" : "Có lỗi xảy ra khi thêm mới câu hỏi"}
    />
  )
}

