"use client"

import * as React from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components/forms/generic-form-view"
import { dangKyDoanhSoConfig } from "../config"
import { dangKyDoanhSoSchema, type CreateDangKyDoanhSoInput, type UpdateDangKyDoanhSoInput } from "../schema"
import { useDangKyDoanhSoById, useCreateDangKyDoanhSo, useUpdateDangKyDoanhSo } from "../hooks/use-dang-ky-doanh-so"
import { useFormNavigation } from "@/hooks/use-form-navigation"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { useAuthStore } from "@/shared/stores/auth-store"

interface DangKyDoanhSoFormViewProps {
  id?: number
  onComplete?: () => void
  onCancel?: () => void
}

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "nam", label: "Năm", type: "number", required: true, formatThousands: true },
      {
        name: "khach_buon_id",
        label: "Khách Buôn",
        type: "khach-buon-select",
        required: true,
      },
      {
        name: "muc_dang_ky_id",
        label: "Mức Đăng Ký",
        type: "muc-dang-ky-select",
        required: true,
      },
    ]
  },
  {
    title: "Doanh Số",
    fields: [
      { name: "doanh_so_min_quy", label: "Doanh Số Min Quý", type: "number", required: true, formatThousands: true },
      { name: "doanh_so_max_quy", label: "Doanh Số Max Quý", type: "number", required: true, formatThousands: true },
      { name: "doanh_so_min_nam", label: "Doanh Số Min Năm", type: "number", required: true, formatThousands: true },
      { name: "doanh_so_max_nam", label: "Doanh Số Max Năm", type: "number", required: true, formatThousands: true },
    ]
  },
  {
    title: "Thông Tin Bổ Sung",
    fields: [
      { name: "ghi_chu", label: "Ghi Chú", type: "textarea", colSpan: 2 },
    ]
  },
]

export function DangKyDoanhSoFormView({ id, onComplete, onCancel }: DangKyDoanhSoFormViewProps) {
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const { employee } = useAuthStore()
  
  const formId = id ?? (params.id && params.id !== "moi" ? Number(params.id) : undefined)
  const isEditMode = !!formId

  // Fetch existing data if editing (hook will be disabled if formId is undefined/0)
  const query = useDangKyDoanhSoById(formId ?? 0, undefined)
  const viewState = useDetailViewStateFromQuery(query, undefined)
  const existingData = viewState.data

  const createMutation = useCreateDangKyDoanhSo()
  const updateMutation = useUpdateDangKyDoanhSo()

  // Get form schema
  const formSchema = dangKyDoanhSoSchema.omit({ 
    id: true, 
    tg_tao: true, 
    tg_cap_nhat: true,
    ten_khach_buon: true,
    ten_muc_dang_ky: true,
    ten_nguoi_tao: true,
    ma_nguoi_tao: true,
  })

  // Prepare default values
  const defaultValues = React.useMemo(() => {
    const currentYear = new Date().getFullYear()
    
    if (isEditMode && existingData && existingData !== null && typeof existingData === 'object') {
      return {
        nam: existingData.nam ? String(existingData.nam) : String(currentYear),
        khach_buon_id: existingData.khach_buon_id ? String(existingData.khach_buon_id) : null,
        muc_dang_ky_id: existingData.muc_dang_ky_id ? String(existingData.muc_dang_ky_id) : null,
        doanh_so_min_quy: existingData.doanh_so_min_quy !== null && existingData.doanh_so_min_quy !== undefined ? String(existingData.doanh_so_min_quy) : "",
        doanh_so_max_quy: existingData.doanh_so_max_quy !== null && existingData.doanh_so_max_quy !== undefined ? String(existingData.doanh_so_max_quy) : "",
        doanh_so_min_nam: existingData.doanh_so_min_nam !== null && existingData.doanh_so_min_nam !== undefined ? String(existingData.doanh_so_min_nam) : "",
        doanh_so_max_nam: existingData.doanh_so_max_nam !== null && existingData.doanh_so_max_nam !== undefined ? String(existingData.doanh_so_max_nam) : "",
        ghi_chu: existingData.ghi_chu ? String(existingData.ghi_chu) : "",
      }
    }

    return {
      nam: String(currentYear),
      khach_buon_id: null,
      muc_dang_ky_id: null,
      doanh_so_min_quy: "",
      doanh_so_max_quy: "",
      doanh_so_min_nam: "",
      doanh_so_max_nam: "",
      ghi_chu: "",
    }
  }, [isEditMode, existingData])

  const sections = getSections()

  const { handleCancel } = useFormNavigation({ onCancel })

  // Store created/updated ID for navigation
  const [createdId, setCreatedId] = React.useState<number | null>(null)

  const handleSubmit = async (data: any) => {
    // Helper function to parse number from formatted string (removes commas)
    const parseNumber = (value: any): number | null => {
      if (value === null || value === undefined || value === "") return null
      if (typeof value === 'number') return value
      // Remove commas (thousand separators) and spaces, then parse
      const cleaned = String(value).replace(/[,\s]/g, '')
      const num = parseFloat(cleaned)
      return isNaN(num) ? null : num
    }

    // Transform form data to API format
    const submitData: CreateDangKyDoanhSoInput | UpdateDangKyDoanhSoInput = {
      nam: parseNumber(data.nam) ?? undefined,
      khach_buon_id: data.khach_buon_id ? Number(data.khach_buon_id) : undefined,
      muc_dang_ky_id: data.muc_dang_ky_id ? Number(data.muc_dang_ky_id) : undefined,
      doanh_so_min_quy: parseNumber(data.doanh_so_min_quy) ?? undefined,
      doanh_so_max_quy: parseNumber(data.doanh_so_max_quy) ?? undefined,
      doanh_so_min_nam: parseNumber(data.doanh_so_min_nam) ?? undefined,
      doanh_so_max_nam: parseNumber(data.doanh_so_max_nam) ?? undefined,
      ghi_chu: data.ghi_chu || null,
      nguoi_tao_id: employee?.ma_nhan_vien || null,
    }

    if (isEditMode && formId) {
      await updateMutation.mutateAsync({ id: formId, input: submitData as UpdateDangKyDoanhSoInput })
      setCreatedId(formId)
    } else {
      const result = await createMutation.mutateAsync(submitData as CreateDangKyDoanhSoInput)
      // Store the ID of the newly created record
      if (result?.id) {
        setCreatedId(result.id)
      }
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      const returnTo = searchParams.get('returnTo') || 'list'
      // Use createdId for new records, formId for edited records
      const targetId = createdId || formId
      
      if (returnTo === 'detail' && targetId) {
        navigate(`${dangKyDoanhSoConfig.routePath}/${targetId}`)
      } else {
        navigate(dangKyDoanhSoConfig.routePath)
      }
    }
  }

  if (isEditMode && viewState.isLoading) {
    return (
      <GenericFormView
        title={`Sửa ${dangKyDoanhSoConfig.moduleTitle}`}
        schema={formSchema}
        defaultValues={{}}
        sections={[]}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <GenericFormView
      title={isEditMode ? `Sửa ${dangKyDoanhSoConfig.moduleTitle}` : `Thêm ${dangKyDoanhSoConfig.moduleTitle}`}
      schema={formSchema}
      defaultValues={defaultValues}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  )
}

