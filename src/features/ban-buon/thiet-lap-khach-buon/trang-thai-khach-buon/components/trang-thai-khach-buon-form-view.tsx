"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { trangThaiKhachBuonSchema } from "../schema"
import type { CreateTrangThaiKhachBuonInput, UpdateTrangThaiKhachBuonInput } from "../schema"
import { useCreateTrangThaiKhachBuon, useUpdateTrangThaiKhachBuon } from "../hooks/use-trang-thai-khach-buon-mutations"
import { useTrangThaiKhachBuonById } from "../hooks/use-trang-thai-khach-buon"
import { trangThaiKhachBuonConfig } from "../config"
import { useMemo } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useGiaiDoanKhachBuon } from "../../giai-doan-khach-buon/hooks/use-giai-doan-khach-buon"
import { TrangThaiKhachBuonFormAutoCalculateTt } from "./trang-thai-khach-buon-form-auto-calculate-tt"

const getSections = (giaiDoanOptions: Array<{ label: string; value: string }>): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ma_trang_thai", label: "Mã Trạng Thái", required: true },
      { name: "ten_trang_thai", label: "Tên Trạng Thái", required: true },
      {
        name: "giai_doan_id",
        label: "Giai Đoạn",
        type: "select",
        options: giaiDoanOptions,
        required: true,
      },
      {
        name: "tt",
        label: "Thứ Tự",
        type: "number",
        required: true,
      },
      {
        name: "mac_dinh_khoi_dau",
        label: "Mặc Định Khởi Đầu",
        type: "toggle",
        options: [
          { label: "Có", value: "YES" },
          { label: "Không", value: "NO" },
        ],
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

interface TrangThaiKhachBuonFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function TrangThaiKhachBuonFormView({ id, onComplete, onCancel }: TrangThaiKhachBuonFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateTrangThaiKhachBuon()
  const updateMutation = useUpdateTrangThaiKhachBuon()
  const { employee } = useAuthStore()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const { data: existingData, isLoading } = useTrangThaiKhachBuonById(id ?? 0, undefined)
  // Get giai doan options for dropdown
  const { data: giaiDoanList } = useGiaiDoanKhachBuon(undefined)
  
  // Computed values
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  
  // Build giai doan options
  const giaiDoanOptions = useMemo(() => {
    if (!giaiDoanList) return []
    return giaiDoanList
      .map(item => ({
        label: item.ten_giai_doan,
        value: String(item.id),
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [giaiDoanList])
  
  // Create sections
  const sections = useMemo(() => {
    return getSections(giaiDoanOptions)
  }, [giaiDoanOptions])

  // ✅ QUAN TRỌNG: Tạo schema cho form
  const formSchema = useMemo(() => {
    return trangThaiKhachBuonSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, nguoi_tao_ten: true, ten_giai_doan: true })
  }, [])

  // ✅ QUAN TRỌNG: Prepare default values BEFORE early return
  const defaultValues = useMemo(() => {
    if (isEditMode && existingData && existingData !== null && typeof existingData === 'object' && 'ten_trang_thai' in existingData && existingData.ten_trang_thai !== undefined) {
      return {
        ma_trang_thai: existingData.ma_trang_thai ? String(existingData.ma_trang_thai) : "",
        ten_trang_thai: String(existingData.ten_trang_thai || ""),
        giai_doan_id: existingData.giai_doan_id ? String(existingData.giai_doan_id) : "",
        mo_ta: existingData.mo_ta ? String(existingData.mo_ta) : "",
        tt: existingData.tt ?? 1,
        mac_dinh_khoi_dau: existingData.mac_dinh_khoi_dau || "NO",
      }
    }
    
    // For new record, default values will be set after giai_doan_id is selected
    return {
      ma_trang_thai: "",
      ten_trang_thai: "",
      giai_doan_id: "",
      mo_ta: "",
      tt: 1,
      mac_dinh_khoi_dau: "NO",
    }
  }, [isEditMode, existingData])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  const cancelUrl = returnTo === 'list' 
    ? trangThaiKhachBuonConfig.routePath
    : (id ? `${trangThaiKhachBuonConfig.routePath}/${id}` : trangThaiKhachBuonConfig.routePath)

  const handleSubmit = async (data: any) => {
    // Ensure tt is a number
    const ttValue = typeof data.tt === 'string' ? parseFloat(data.tt) : data.tt
    const giaiDoanIdValue = typeof data.giai_doan_id === 'string' ? parseFloat(data.giai_doan_id) : data.giai_doan_id
    
    if (isEditMode && id) {
      const updateData: UpdateTrangThaiKhachBuonInput = {
        ma_trang_thai: data.ma_trang_thai || null,
        ten_trang_thai: data.ten_trang_thai,
        mo_ta: data.mo_ta || null,
        tt: ttValue ?? null,
        mac_dinh_khoi_dau: data.mac_dinh_khoi_dau || null,
        giai_doan_id: giaiDoanIdValue ?? null,
      }
      await updateMutation.mutateAsync({ id, input: updateData })
    } else {
      const createData: CreateTrangThaiKhachBuonInput = {
        ma_trang_thai: data.ma_trang_thai || null,
        ten_trang_thai: data.ten_trang_thai,
        mo_ta: data.mo_ta || null,
        tt: ttValue ?? null,
        mac_dinh_khoi_dau: data.mac_dinh_khoi_dau || null,
        giai_doan_id: giaiDoanIdValue ?? null,
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
        navigate(trangThaiKhachBuonConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${trangThaiKhachBuonConfig.routePath}/${id}`)
      } else {
        navigate(trangThaiKhachBuonConfig.routePath)
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
      title={isEditMode ? `Sửa Trạng Thái Khách Buôn: ${existingData?.ten_trang_thai || ''}` : "Thêm Mới Trạng Thái Khách Buôn"}
      subtitle={isEditMode ? "Cập nhật thông tin trạng thái khách buôn." : "Thêm trạng thái khách buôn mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật trạng thái khách buôn thành công" : "Thêm mới trạng thái khách buôn thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật trạng thái khách buôn" : "Có lỗi xảy ra khi thêm mới trạng thái khách buôn"}
      defaultValues={defaultValues}
    >
      <TrangThaiKhachBuonFormAutoCalculateTt isEditMode={isEditMode} />
    </GenericFormView>
  )
}

