"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { nguoiLienHeBaseSchema } from "../schema"
import type { CreateNguoiLienHeInput, UpdateNguoiLienHeInput } from "../schema"
import { useCreateNguoiLienHe, useUpdateNguoiLienHe } from "../hooks/use-nguoi-lien-he-mutations"
import { useNguoiLienHeById } from "../hooks/use-nguoi-lien-he"
import { nguoiLienHeConfig } from "../config"
import { useMemo } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"

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
      { name: "ten_lien_he", label: "Tên Liên Hệ", required: true },
      { 
        name: "vai_tro", 
        label: "Vai Trò",
        type: "combobox",
        required: true,
        options: [
          { label: "Chủ", value: "Chủ" },
          { label: "Con", value: "Con" },
          { label: "Vợ/chồng", value: "Vợ/chồng" },
          { label: "Người thân", value: "Người thân" },
          { label: "Nhân viên", value: "Nhân viên" },
        ],
        allowCustom: true,
      },
      { name: "hinh_anh", label: "Hình Ảnh", type: "image" },
      { 
        name: "gioi_tinh", 
        label: "Giới Tính",
        type: "toggle",
        required: true,
        options: [
          { label: "Nam", value: "Nam" },
          { label: "Nữ", value: "Nữ" },
          { label: "Khác", value: "Khác" },
        ]
      },
      { name: "ngay_sinh", label: "Ngày Sinh", type: "date" },
    ]
  },
  {
    title: "Thông Tin Liên Hệ",
    fields: [
      { name: "so_dien_thoai_1", label: "Số Điện Thoại 1" },
      { name: "so_dien_thoai_2", label: "Số Điện Thoại 2" },
      { name: "email", label: "Email", type: "email" },
    ]
  },
  {
    title: "Thông Tin Khác",
    fields: [
      { name: "tinh_cach", label: "Tính Cách", type: "textarea" },
      { name: "so_thich", label: "Sở Thích", type: "textarea" },
      { name: "luu_y_khi_lam_viec", label: "Lưu Ý Khi Làm Việc", type: "textarea" },
      { name: "ghi_chu_khac", label: "Ghi Chú Khác", type: "textarea", colSpan: 2 },
    ]
  },
]

interface NguoiLienHeFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function NguoiLienHeFormView({ id, onComplete, onCancel }: NguoiLienHeFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateNguoiLienHe()
  const updateMutation = useUpdateNguoiLienHe()
  const { employee } = useAuthStore()

  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const { data: existingData, isLoading } = useNguoiLienHeById(id ?? 0, undefined)

  // Computed values
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id

  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])

  // ✅ QUAN TRỌNG: Tạo schema cho form
  const formSchema = useMemo(() => {
    return nguoiLienHeBaseSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, ten_khach_buon: true })
  }, [])

  // ✅ QUAN TRỌNG: Prepare default values BEFORE early return
  const defaultValues = useMemo(() => {
    if (isEditMode && existingData && existingData !== null && typeof existingData === 'object' && 'ten_lien_he' in existingData) {
      return {
        khach_buon_id: existingData.khach_buon_id ? String(existingData.khach_buon_id) : null,
        vai_tro: existingData.vai_tro ? String(existingData.vai_tro) : "",
        ten_lien_he: existingData.ten_lien_he ? String(existingData.ten_lien_he) : "",
        hinh_anh: existingData.hinh_anh ? String(existingData.hinh_anh) : "",
        gioi_tinh: existingData.gioi_tinh ? String(existingData.gioi_tinh) : "",
        ngay_sinh: existingData.ngay_sinh ? String(existingData.ngay_sinh) : "",
        so_dien_thoai_1: existingData.so_dien_thoai_1 ? String(existingData.so_dien_thoai_1) : "",
        so_dien_thoai_2: existingData.so_dien_thoai_2 ? String(existingData.so_dien_thoai_2) : "",
        email: existingData.email ? String(existingData.email) : "",
        tinh_cach: existingData.tinh_cach ? String(existingData.tinh_cach) : "",
        so_thich: existingData.so_thich ? String(existingData.so_thich) : "",
        luu_y_khi_lam_viec: existingData.luu_y_khi_lam_viec ? String(existingData.luu_y_khi_lam_viec) : "",
        ghi_chu_khac: existingData.ghi_chu_khac ? String(existingData.ghi_chu_khac) : "",
      }
    }

    // For new record
    return {
      khach_buon_id: null,
      vai_tro: "",
      ten_lien_he: "",
      hinh_anh: "",
      gioi_tinh: "",
      ngay_sinh: "",
      so_dien_thoai_1: "",
      so_dien_thoai_2: "",
      email: "",
      tinh_cach: "",
      so_thich: "",
      luu_y_khi_lam_viec: "",
      ghi_chu_khac: "",
    }
  }, [isEditMode, existingData])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  const cancelUrl = returnTo === 'list'
    ? nguoiLienHeConfig.routePath
    : (id ? `${nguoiLienHeConfig.routePath}/${id}` : nguoiLienHeConfig.routePath)

  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      const updateData: UpdateNguoiLienHeInput = {
        khach_buon_id: data.khach_buon_id ? Number(data.khach_buon_id) : undefined,
        vai_tro: data.vai_tro || null,
        ten_lien_he: data.ten_lien_he || null,
        hinh_anh: data.hinh_anh || null,
        gioi_tinh: data.gioi_tinh || null,
        ngay_sinh: data.ngay_sinh || null,
        so_dien_thoai_1: data.so_dien_thoai_1 || null,
        so_dien_thoai_2: data.so_dien_thoai_2 || null,
        email: data.email || null,
        tinh_cach: data.tinh_cach || null,
        so_thich: data.so_thich || null,
        luu_y_khi_lam_viec: data.luu_y_khi_lam_viec || null,
        ghi_chu_khac: data.ghi_chu_khac || null,
      }
      await updateMutation.mutateAsync({ id, input: updateData })
    } else {
      const createData: CreateNguoiLienHeInput = {
        khach_buon_id: data.khach_buon_id ? Number(data.khach_buon_id) : 0, // Required field, default to 0 if not provided
        vai_tro: data.vai_tro || null,
        ten_lien_he: data.ten_lien_he || null,
        hinh_anh: data.hinh_anh || null,
        gioi_tinh: data.gioi_tinh || null,
        ngay_sinh: data.ngay_sinh || null,
        so_dien_thoai_1: data.so_dien_thoai_1 || null,
        so_dien_thoai_2: data.so_dien_thoai_2 || null,
        email: data.email || null,
        tinh_cach: data.tinh_cach || null,
        so_thich: data.so_thich || null,
        luu_y_khi_lam_viec: data.luu_y_khi_lam_viec || null,
        ghi_chu_khac: data.ghi_chu_khac || null,
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
        navigate(nguoiLienHeConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${nguoiLienHeConfig.routePath}/${id}`)
      } else {
        navigate(nguoiLienHeConfig.routePath)
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
      title={isEditMode ? `Sửa Người Liên Hệ: ${existingData?.ten_lien_he || ''}` : "Thêm Mới Người Liên Hệ"}
      subtitle={isEditMode ? "Cập nhật thông tin người liên hệ." : "Thêm người liên hệ mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật người liên hệ thành công" : "Thêm mới người liên hệ thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật người liên hệ" : "Có lỗi xảy ra khi thêm mới người liên hệ"}
      defaultValues={defaultValues}
    />
  )
}

