"use client"

import * as React from "react"
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components/forms/generic-form-view"
import { xetDuyetCongNoConfig } from "../config"
import { xetDuyetCongNoSchema, type CreateXetDuyetCongNoInput, type UpdateXetDuyetCongNoInput } from "../schema"
import { useXetDuyetCongNoById, useCreateXetDuyetCongNo, useUpdateXetDuyetCongNo } from "../hooks/use-xet-duyet-cong-no"
import { useFormNavigation } from "@/hooks/use-form-navigation"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { useAuthStore } from "@/shared/stores/auth-store"
import { createAuditLogEntry, type AuditLog } from "../utils/trang-thai-utils"

interface XetDuyetCongNoFormViewProps {
  id?: number
  onComplete?: () => void
  onCancel?: () => void
}

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
        name: "loai_hinh",
        label: "Loại Hình",
        type: "toggle",
        required: true,
        options: [
          { value: "Nợ gối đầu", label: "Nợ gối đầu" },
          { value: "TT cuối tháng", label: "TT cuối tháng" },
          { value: "Nợ gối đơn", label: "Nợ gối đơn" },
        ],
      },
      {
        name: "muc_cong_no",
        label: "Mức Công Nợ",
        type: "number",
        required: true,
        formatThousands: true,
      },
      {
        name: "de_xuat_ngay_ap_dung",
        label: "Đề Xuất Ngày Áp Dụng",
        type: "date",
        required: true,
      },
    ]
  },
  {
    title: "Thông Tin Bổ Sung",
    fields: [
      { name: "ghi_chu", label: "Ghi Chú", type: "textarea", colSpan: 2 },
    ]
  },
]

export function XetDuyetCongNoFormView({ id, onComplete, onCancel }: XetDuyetCongNoFormViewProps) {
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { employee } = useAuthStore()
  
  // Lấy copiedData từ state (nếu có)
  const copiedData = (location.state as any)?.copiedData
  
  const formId = id ?? (params.id && params.id !== "moi" ? Number(params.id) : undefined)
  const isEditMode = !!formId

  // Fetch existing data if editing (hook will be disabled if formId is undefined/0)
  const query = useXetDuyetCongNoById(formId ?? 0, undefined)
  const viewState = useDetailViewStateFromQuery(query, undefined)
  const existingData = viewState.data

  const createMutation = useCreateXetDuyetCongNo()
  const updateMutation = useUpdateXetDuyetCongNo()

  // Get form schema - ẩn các field không cần trong form
  const formSchema = xetDuyetCongNoSchema.omit({ 
    id: true, 
    tg_tao: true, 
    tg_cap_nhat: true,
    tg_quan_ly_duyet: true,
    tg_bgd_duyet: true,
    ten_khach_buon: true,
    ten_quan_ly: true,
    ten_bgd: true,
    ten_nguoi_tao: true,
    ma_nguoi_tao: true,
    ngay_ap_dung: true, // Ẩn trong form, chỉnh bằng action sau
    trang_thai: true, // Ẩn trong form
    quan_ly_duyet: true, // Ẩn trong form
    quan_ly_id: true, // Ẩn trong form
    bgd_duyet: true, // Ẩn trong form
    bgd_id: true, // Ẩn trong form
  })

  // Helper function to get first day of current month
  const getFirstDayOfMonth = (): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}-01`
  }

  // Prepare default values
  const defaultValues = React.useMemo(() => {
    // Nếu có copiedData (sao chép từ yêu cầu đã hủy)
    if (copiedData && !isEditMode) {
      return {
        khach_buon_id: copiedData.khach_buon_id ? String(copiedData.khach_buon_id) : null,
        loai_hinh: copiedData.loai_hinh ? String(copiedData.loai_hinh) : "Nợ gối đầu",
        muc_cong_no: copiedData.muc_cong_no !== null && copiedData.muc_cong_no !== undefined ? String(copiedData.muc_cong_no) : "",
        de_xuat_ngay_ap_dung: copiedData.de_xuat_ngay_ap_dung ? String(copiedData.de_xuat_ngay_ap_dung) : getFirstDayOfMonth(),
        ghi_chu: copiedData.ghi_chu ? String(copiedData.ghi_chu) : "",
      }
    }

    if (isEditMode && existingData && existingData !== null && typeof existingData === 'object') {
      return {
        khach_buon_id: existingData.khach_buon_id ? String(existingData.khach_buon_id) : null,
        loai_hinh: existingData.loai_hinh ? String(existingData.loai_hinh) : "Nợ gối đầu",
        muc_cong_no: existingData.muc_cong_no !== null && existingData.muc_cong_no !== undefined ? String(existingData.muc_cong_no) : "",
        de_xuat_ngay_ap_dung: existingData.de_xuat_ngay_ap_dung ? String(existingData.de_xuat_ngay_ap_dung) : getFirstDayOfMonth(),
        ghi_chu: existingData.ghi_chu ? String(existingData.ghi_chu) : "",
      }
    }

    return {
      khach_buon_id: null,
      loai_hinh: "Nợ gối đầu", // Default là "Nợ gối đầu"
      muc_cong_no: "",
      de_xuat_ngay_ap_dung: getFirstDayOfMonth(), // Default là ngày đầu tháng
      ghi_chu: "",
    }
  }, [isEditMode, existingData, copiedData])

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
    const submitData: CreateXetDuyetCongNoInput | UpdateXetDuyetCongNoInput = {
      khach_buon_id: data.khach_buon_id ? Number(data.khach_buon_id) : undefined,
      loai_hinh: data.loai_hinh || undefined,
      muc_cong_no: parseNumber(data.muc_cong_no) ?? undefined,
      de_xuat_ngay_ap_dung: data.de_xuat_ngay_ap_dung || undefined,
      // Không gửi các field đã ẩn trong form
      ghi_chu: data.ghi_chu || null,
      nguoi_tao_id: employee?.ma_nhan_vien || null,
      trang_thai: isEditMode ? undefined : "Chờ kiểm tra", // Mặc định khi tạo mới
    }

    // Tạo audit log khi tạo mới
    if (!isEditMode && employee) {
      const auditEntry = createAuditLogEntry(
        "Tạo mới",
        employee.ma_nhan_vien || null,
        employee.ho_ten || "",
        "Tạo yêu cầu xét duyệt công nợ mới"
      )
      ;(submitData as any).audit_log = {
        history: [auditEntry]
      } as AuditLog
    }

    if (isEditMode && formId) {
      await updateMutation.mutateAsync({ id: formId, input: submitData as UpdateXetDuyetCongNoInput })
      setCreatedId(formId)
    } else {
      const result = await createMutation.mutateAsync(submitData as CreateXetDuyetCongNoInput)
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
        navigate(`${xetDuyetCongNoConfig.routePath}/${targetId}`)
      } else {
        navigate(xetDuyetCongNoConfig.routePath)
      }
    }
  }

  if (isEditMode && viewState.isLoading) {
    return (
      <GenericFormView
        title={`Sửa ${xetDuyetCongNoConfig.moduleTitle}`}
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
      title={isEditMode ? `Sửa ${xetDuyetCongNoConfig.moduleTitle}` : `Thêm ${xetDuyetCongNoConfig.moduleTitle}`}
      schema={formSchema}
      defaultValues={defaultValues}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  )
}

