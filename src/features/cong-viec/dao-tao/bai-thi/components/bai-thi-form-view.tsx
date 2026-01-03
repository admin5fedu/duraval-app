"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { baiThiSchema } from "../schema"
import type { CreateBaiThiInput, UpdateBaiThiInput } from "../schema"
import { useCreateBaiThi, useUpdateBaiThi } from "../hooks/use-bai-thi-mutations"
import { useBaiThiById } from "../hooks/use-bai-thi"
import { baiThiConfig } from "../config"
import { useMemo } from "react"
import { z } from "zod"
import { useKyThi } from "../../ky-thi/hooks"
import { useAuthStore } from "@/shared/stores/auth-store"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

const getSections = (kyThiOptions: Array<{ label: string; value: string }>): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { 
        name: "ky_thi_id", 
        label: "Kỳ Thi", 
        type: "select", 
        options: kyThiOptions,
        required: true 
      },
      { name: "ngay_lam_bai", label: "Ngày Làm Bài", type: "date", required: true },
      { name: "tong_so_cau", label: "Tổng Số Câu", type: "number", min: 0 },
    ]
  },
  {
    title: "Trao Đổi",
    fields: [
      { name: "trao_doi", label: "Trao Đổi", type: "textarea", colSpan: 2 },
    ]
  },
]

interface BaiThiFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function BaiThiFormView({ id, onComplete, onCancel }: BaiThiFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateBaiThi()
  const updateMutation = useUpdateBaiThi()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const { data: existingData, isLoading } = useBaiThiById(id ?? 0, undefined)
  const { data: kyThiList } = useKyThi()
  const { employee } = useAuthStore()
  
  // Computed values
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  
  // Prepare options for select fields - hiển thị "ngày - tên kỳ thi"
  const kyThiOptions = useMemo(() => {
    if (!kyThiList) return []
    return kyThiList
      .filter(kt => kt.id !== undefined)
      .map(kt => {
        let label = kt.ten_ky_thi || `Kỳ thi #${kt.id}`
        if (kt.ngay) {
          try {
            const ngayFormatted = format(new Date(kt.ngay), "dd/MM/yyyy", { locale: vi })
            label = `${ngayFormatted} - ${label}`
          } catch {
            // Nếu không parse được ngày, giữ nguyên label
          }
        }
        return {
          label,
          value: String(kt.id),
        }
      })
  }, [kyThiList])
  
  // Create sections
  const sections = useMemo(() => {
    return getSections(kyThiOptions)
  }, [kyThiOptions])

  // ✅ QUAN TRỌNG: Tạo schema cho form (bỏ nhan_vien_id vì sẽ tự động set từ user hiện tại)
  const formSchema = useMemo(() => {
    return baiThiSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, chi_tiet_bai_lam: true, nhan_vien_id: true })
      .extend({
        ngay_lam_bai: z.union([
          z.string().min(1, "Ngày làm bài là bắt buộc"),
          z.date().transform((val) => val.toISOString().split('T')[0]),
        ]),
        ky_thi_id: z.union([
          z.number().int().positive("Kỳ thi là bắt buộc"),
          z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val > 0, "Kỳ thi là bắt buộc"),
        ]),
        tong_so_cau: z.number().int().min(0).optional().nullable(),
        trao_doi: z.union([
          z.string(),
          z.any(), // For JSONB
        ]).optional().nullable(),
      })
  }, [])

  // Prepare default values
  const defaultValues = useMemo(() => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]
    
    if (id && existingData && existingData !== null && typeof existingData === 'object' && 'ky_thi_id' in existingData) {
      return {
        ky_thi_id: existingData.ky_thi_id ? String(existingData.ky_thi_id) : "",
        ngay_lam_bai: existingData.ngay_lam_bai || today,
        tong_so_cau: existingData.tong_so_cau ?? null,
        trao_doi: existingData.trao_doi ? (typeof existingData.trao_doi === 'string' ? existingData.trao_doi : JSON.stringify(existingData.trao_doi, null, 2)) : "",
      }
    }
    // For new records - default to today
    return {
      ky_thi_id: "",
      ngay_lam_bai: today,
      tong_so_cau: null,
      trao_doi: "",
    }
  }, [id, existingData])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  // Computed values
  const cancelUrl = returnTo === 'list' 
    ? baiThiConfig.routePath
    : (id ? `${baiThiConfig.routePath}/${id}` : baiThiConfig.routePath)

  const handleSubmit = async (data: any) => {
    try {
      // Parse trao_doi if it's a JSON string
      let traoDoiValue: any = null
      if (data.trao_doi && typeof data.trao_doi === 'string' && data.trao_doi.trim()) {
        try {
          traoDoiValue = JSON.parse(data.trao_doi)
        } catch {
          // If not valid JSON, treat as plain string
          traoDoiValue = data.trao_doi
        }
      }

      // Tự động set nhan_vien_id từ user hiện tại
      if (!employee?.ma_nhan_vien) {
        throw new Error("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.")
      }

      if (isEditMode && id) {
        const updateInput: UpdateBaiThiInput = {
          ky_thi_id: data.ky_thi_id ? (typeof data.ky_thi_id === 'string' ? parseInt(data.ky_thi_id, 10) : data.ky_thi_id) : undefined,
          ngay_lam_bai: data.ngay_lam_bai ? String(data.ngay_lam_bai).trim() : undefined,
          tong_so_cau: data.tong_so_cau !== null && data.tong_so_cau !== undefined ? Number(data.tong_so_cau) : undefined,
          trao_doi: traoDoiValue,
          // Các trường sau sẽ được xử lý tự động (không hiển thị trong form):
          // - trang_thai
          // - thoi_gian_bat_dau
          // - thoi_gian_ket_thuc
          // - diem_so
        }
        await updateMutation.mutateAsync({ 
          id, 
          input: updateInput
        })
      } else {
        const createInput: CreateBaiThiInput = {
          ky_thi_id: typeof data.ky_thi_id === 'string' ? parseInt(data.ky_thi_id, 10) : data.ky_thi_id,
          nhan_vien_id: employee.ma_nhan_vien, // Tự động set từ user hiện tại
          ngay_lam_bai: String(data.ngay_lam_bai || "").trim(),
          trang_thai: "Chưa thi", // Default value - sẽ được xử lý tự động sau
          tong_so_cau: data.tong_so_cau !== null && data.tong_so_cau !== undefined ? Number(data.tong_so_cau) : null,
          trao_doi: traoDoiValue,
          // Các trường sau sẽ được xử lý tự động (không hiển thị trong form):
          // - thoi_gian_bat_dau
          // - thoi_gian_ket_thuc
          // - diem_so
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
        navigate(baiThiConfig.routePath)
      } else if (id) {
        navigate(`${baiThiConfig.routePath}/${id}`)
      } else {
        navigate(baiThiConfig.routePath)
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
        ? `Sửa Bài Thi: #${id}`
        : "Thêm Mới Bài Thi"}
      submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
      successMessage={isEditMode ? "Cập nhật bài thi thành công" : "Thêm mới bài thi thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật bài thi" : "Có lỗi xảy ra khi thêm mới bài thi"}
    />
  )
}

