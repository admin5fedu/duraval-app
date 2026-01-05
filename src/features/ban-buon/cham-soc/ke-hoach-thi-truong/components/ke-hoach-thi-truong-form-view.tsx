"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { keHoachThiTruongBaseSchema } from "../schema"
import type { CreateKeHoachThiTruongInput, UpdateKeHoachThiTruongInput } from "../schema"
import { useCreateKeHoachThiTruong, useUpdateKeHoachThiTruong } from "../hooks/use-ke-hoach-thi-truong-mutations"
import { useKeHoachThiTruongById } from "../hooks/use-ke-hoach-thi-truong"
import { keHoachThiTruongConfig } from "../config"
import { useMemo } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"
import { KeHoachThiTruongFormAutoTinhThanh } from "./ke-hoach-thi-truong-form-auto"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ngay", label: "Ngày", type: "date", required: true },
      {
        name: "nhan_vien_id",
        label: "Nhân Viên",
        type: "nhan-su-select",
        required: true,
      },
      {
        name: "buoi",
        label: "Buổi",
        type: "toggle",
        required: true,
        options: [
          { label: "Sáng", value: "Sáng" },
          { label: "Chiều", value: "Chiều" },
        ],
      },
      {
        name: "hanh_dong",
        label: "Hành Động",
        type: "toggle",
        required: true,
        options: [
          { label: "Đi thị trường", value: "Đi thị trường" },
          { label: "Làm văn phòng", value: "Làm văn phòng" },
        ],
      },
      {
        name: "khach_buon_id",
        label: "Khách Buôn",
        type: "khach-buon-select",
        required: true,
        hidden: (formValues: any) => formValues?.hanh_dong === "Làm văn phòng",
      },
      {
        name: "tsn_tinh_thanh_id",
        label: "Tỉnh Thành",
        type: "tinh-thanh-tsn-select",
        disabled: true,
        hidden: (formValues: any) => formValues?.hanh_dong === "Làm văn phòng",
      },
      {
        name: "trang_thai",
        label: "Trạng Thái",
        type: "toggle",
        options: [
          { label: "Chưa thực hiện", value: "Chưa thực hiện" },
          { label: "Đã thực hiện", value: "Đã thực hiện" },
          { label: "Hủy", value: "Hủy" },
        ],
      },
    ]
  },
  {
    title: "Nội Dung Kế Hoạch",
    fields: [
      { name: "muc_tieu", label: "Mục Tiêu", type: "textarea", required: true },
      { name: "ghi_chu", label: "Ghi Chú", type: "textarea", colSpan: 2 },
    ]
  },
]

interface KeHoachThiTruongFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function KeHoachThiTruongFormView({ id, onComplete, onCancel }: KeHoachThiTruongFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateKeHoachThiTruong()
  const updateMutation = useUpdateKeHoachThiTruong()
  const { employee } = useAuthStore()

  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const { data: existingData, isLoading } = useKeHoachThiTruongById(id ?? 0, undefined)

  // Computed values
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id

  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])

  // ✅ QUAN TRỌNG: Tạo schema cho form
  const formSchema = useMemo(() => {
    return keHoachThiTruongBaseSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true })
  }, [])

  // ✅ QUAN TRỌNG: Prepare default values BEFORE early return
  const defaultValues = useMemo(() => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]
    
    if (isEditMode && existingData && existingData !== null && typeof existingData === 'object') {
      return {
        ngay: existingData.ngay ? String(existingData.ngay) : today,
        nhan_vien_id: existingData.nhan_vien_id ? String(existingData.nhan_vien_id) : (employee?.ma_nhan_vien ? String(employee.ma_nhan_vien) : null),
        buoi: existingData.buoi ? String(existingData.buoi) : "",
        khach_buon_id: existingData.khach_buon_id ? String(existingData.khach_buon_id) : null,
        tsn_tinh_thanh_id: existingData.tsn_tinh_thanh_id ? String(existingData.tsn_tinh_thanh_id) : null,
        trang_thai: existingData.trang_thai ? String(existingData.trang_thai) : "",
        hanh_dong: existingData.hanh_dong ? String(existingData.hanh_dong) : "",
        muc_tieu: existingData.muc_tieu ? String(existingData.muc_tieu) : "",
        ghi_chu: existingData.ghi_chu ? String(existingData.ghi_chu) : "",
      }
    }

    // For new record - set defaults
    return {
      ngay: today,
      nhan_vien_id: employee?.ma_nhan_vien ? String(employee.ma_nhan_vien) : null,
      buoi: "Sáng",
      khach_buon_id: null,
      tsn_tinh_thanh_id: null,
      trang_thai: "",
      hanh_dong: "Đi thị trường",
      muc_tieu: "",
      ghi_chu: "",
    }
  }, [isEditMode, existingData, employee])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  const cancelUrl = returnTo === 'list'
    ? keHoachThiTruongConfig.routePath
    : (id ? `${keHoachThiTruongConfig.routePath}/${id}` : keHoachThiTruongConfig.routePath)

  const handleSubmit = async (data: any) => {
    try {
      const payload: CreateKeHoachThiTruongInput | UpdateKeHoachThiTruongInput = {
        ngay: data.ngay || null,
        nhan_vien_id: data.nhan_vien_id ? Number(data.nhan_vien_id) : undefined,
        buoi: data.buoi || null,
        khach_buon_id: data.khach_buon_id ? Number(data.khach_buon_id) : null,
        tsn_tinh_thanh_id: data.tsn_tinh_thanh_id ? Number(data.tsn_tinh_thanh_id) : null,
        trang_thai: data.trang_thai || null,
        hanh_dong: data.hanh_dong || null,
        muc_tieu: data.muc_tieu || null,
        ghi_chu: data.ghi_chu || null,
        nguoi_tao_id: employee?.ma_nhan_vien || null,
      }

      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, input: payload })
      } else {
        await createMutation.mutateAsync(payload as CreateKeHoachThiTruongInput)
      }

      if (onComplete) {
        onComplete()
      } else {
        if (returnTo === 'list') {
          navigate(keHoachThiTruongConfig.routePath)
        } else if (isEditMode && id) {
          navigate(`${keHoachThiTruongConfig.routePath}/${id}`)
        } else {
          navigate(keHoachThiTruongConfig.routePath)
        }
      }
    } catch (error) {
      // Error is handled by mutation hook (toast)
      console.error("Error submitting form:", error)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      navigate(cancelUrl)
    }
  }

  return (
    <GenericFormView
      title={isEditMode ? "Sửa Kế Hoạch Thị Trường" : "Thêm Mới Kế Hoạch Thị Trường"}
      schema={formSchema}
      defaultValues={defaultValues}
      sections={sections}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    >
      <KeHoachThiTruongFormAutoTinhThanh isEditMode={isEditMode} />
    </GenericFormView>
  )
}

