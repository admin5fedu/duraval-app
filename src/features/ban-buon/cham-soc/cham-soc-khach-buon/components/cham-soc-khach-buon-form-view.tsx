"use client"

import * as React from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components/forms/generic-form-view"
import { chamSocKhachBuonConfig } from "../config"
import { chamSocKhachBuonSchema, type CreateChamSocKhachBuonInput, type UpdateChamSocKhachBuonInput } from "../schema"
import { useChamSocKhachBuonById, useCreateChamSocKhachBuon, useUpdateChamSocKhachBuon } from "../hooks/use-cham-soc-khach-buon"
import { useFormNavigation } from "@/hooks/use-form-navigation"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { useAuthStore } from "@/shared/stores/auth-store"

interface ChamSocKhachBuonFormViewProps {
  id?: number
  onComplete?: () => void
  onCancel?: () => void
}

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ngay", label: "Ngày", type: "date" },
      {
        name: "nhan_vien_id",
        label: "Nhân Viên",
        type: "nhan-su-select",
      },
      {
        name: "khach_buon_id",
        label: "Khách Buôn",
        type: "khach-buon-select",
      },
      {
        name: "hinh_thuc",
        label: "Hình Thức",
        type: "toggle",
        required: true,
        options: [
          { label: "Thị trường", value: "Thị trường" },
          { label: "Chăm sóc Online", value: "Chăm sóc Online" },
        ],
      },
    ]
  },
  {
    title: "Nội Dung Chăm Sóc",
    fields: [
      { name: "muc_tieu", label: "Mục Tiêu", type: "textarea", colSpan: 2, required: true },
      { name: "ket_qua", label: "Kết Quả", type: "textarea", colSpan: 2, required: true },
      { name: "hanh_dong_tiep_theo", label: "Hành Động Tiếp Theo", type: "textarea", colSpan: 2 },
    ]
  },
  {
    title: "Thông Tin Bổ Sung",
    fields: [
      { name: "hen_cs_lai", label: "Hẹn CS Lại", type: "date" },
      {
        name: "gps",
        label: "GPS",
        type: "gps-location-input",
        required: (formValues: any) => formValues?.hinh_thuc === "Thị trường",
        hidden: (formValues: any) => formValues?.hinh_thuc !== "Thị trường",
      },
      {
        name: "hinh_anh",
        label: "Hình Ảnh",
        type: "image",
        colSpan: 2,
        required: (formValues: any) => formValues?.hinh_thuc === "Thị trường",
        hidden: (formValues: any) => formValues?.hinh_thuc !== "Thị trường",
      },
    ]
  },
]

export function ChamSocKhachBuonFormView({ id, onComplete, onCancel }: ChamSocKhachBuonFormViewProps) {
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const { employee } = useAuthStore()
  
  const formId = id ?? (params.id && params.id !== "moi" ? Number(params.id) : undefined)
  const isEditMode = !!formId

  // Fetch existing data if editing (hook will be disabled if formId is undefined/0)
  const query = useChamSocKhachBuonById(formId ?? 0, undefined)
  const viewState = useDetailViewStateFromQuery(query, undefined)
  const existingData = viewState.data

  const createMutation = useCreateChamSocKhachBuon()
  const updateMutation = useUpdateChamSocKhachBuon()

  // Get form schema
  const formSchema = chamSocKhachBuonSchema.omit({ 
    id: true, 
    tg_tao: true, 
    tg_cap_nhat: true,
    ten_nhan_vien: true,
    ma_nhan_vien: true,
    ten_khach_buon: true,
    ten_nguoi_tao: true,
    ma_nguoi_tao: true,
  })

  // Prepare default values
  const defaultValues = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    
    if (isEditMode && existingData && existingData !== null && typeof existingData === 'object') {
      return {
        ngay: existingData.ngay ? String(existingData.ngay) : today,
        nhan_vien_id: existingData.nhan_vien_id ? String(existingData.nhan_vien_id) : null,
        khach_buon_id: existingData.khach_buon_id ? String(existingData.khach_buon_id) : null,
        hinh_thuc: existingData.hinh_thuc ? String(existingData.hinh_thuc) : "Thị trường",
        muc_tieu: existingData.muc_tieu ? String(existingData.muc_tieu) : "",
        ket_qua: existingData.ket_qua ? String(existingData.ket_qua) : "",
        hanh_dong_tiep_theo: existingData.hanh_dong_tiep_theo ? String(existingData.hanh_dong_tiep_theo) : "",
        hen_cs_lai: existingData.hen_cs_lai ? String(existingData.hen_cs_lai) : null,
        gps: existingData.gps ? String(existingData.gps) : "",
        hinh_anh: existingData.hinh_anh ? String(existingData.hinh_anh) : null,
      }
    }

    return {
      ngay: today,
      nhan_vien_id: employee?.ma_nhan_vien ? String(employee.ma_nhan_vien) : null,
      khach_buon_id: null,
      hinh_thuc: "Thị trường",
      muc_tieu: "",
      ket_qua: "",
      hanh_dong_tiep_theo: "",
      hen_cs_lai: null,
      gps: "",
      hinh_anh: null,
    }
  }, [isEditMode, existingData, employee])

  const sections = getSections()

  const { handleCancel } = useFormNavigation({ onCancel })

  // Store created/updated ID for navigation
  const [createdId, setCreatedId] = React.useState<number | null>(null)

  const handleSubmit = async (data: any) => {
    // Transform form data to API format
    const submitData: CreateChamSocKhachBuonInput | UpdateChamSocKhachBuonInput = {
      ngay: data.ngay || null,
      nhan_vien_id: data.nhan_vien_id ? Number(data.nhan_vien_id) : null,
      khach_buon_id: data.khach_buon_id ? Number(data.khach_buon_id) : null,
      hinh_thuc: data.hinh_thuc || null,
      muc_tieu: data.muc_tieu || null,
      ket_qua: data.ket_qua || null,
      hanh_dong_tiep_theo: data.hanh_dong_tiep_theo || null,
      hen_cs_lai: data.hen_cs_lai || null,
      gps: data.gps || null,
      hinh_anh: data.hinh_anh || null,
      nguoi_tao_id: employee?.ma_nhan_vien || null,
    }

    if (isEditMode && formId) {
      await updateMutation.mutateAsync({ id: formId, input: submitData as UpdateChamSocKhachBuonInput })
      setCreatedId(formId)
    } else {
      const result = await createMutation.mutateAsync(submitData as CreateChamSocKhachBuonInput)
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
        navigate(`${chamSocKhachBuonConfig.routePath}/${targetId}`)
      } else {
        navigate(chamSocKhachBuonConfig.routePath)
      }
    }
  }

  if (isEditMode && viewState.isLoading) {
    return (
      <GenericFormView
        title={`Sửa ${chamSocKhachBuonConfig.moduleTitle}`}
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
      title={isEditMode ? `Sửa ${chamSocKhachBuonConfig.moduleTitle}` : `Thêm ${chamSocKhachBuonConfig.moduleTitle}`}
      schema={formSchema}
      defaultValues={defaultValues}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  )
}

