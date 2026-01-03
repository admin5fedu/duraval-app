"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { kyThiSchema } from "../schema"
import type { CreateKyThiInput, UpdateKyThiInput } from "../schema"
import { useCreateKyThi, useUpdateKyThi } from "../hooks/use-ky-thi-mutations"
import { useKyThiById } from "../hooks/use-ky-thi"
import { kyThiConfig } from "../config"
import { useMemo } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"
import { z } from "zod"
import { NhomChuyenDeToggleButtons } from "./nhom-chuyen-de-toggle-buttons"
import { ChuyenDeMultiSelectFiltered } from "./chuyen-de-multi-select-filtered"
import { ChucVuMultiSelectWrapper } from "./chuc-vu-multi-select-wrapper"
import { TrangThaiToggleButtons } from "./trang-thai-toggle-buttons"
import { supabase } from "@/lib/supabase"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ngay", label: "Ngày", type: "date", required: true },
      { name: "ten_ky_thi", label: "Tên Kỳ Thi", required: true, colSpan: 2 },
      { 
        name: "trang_thai", 
        label: "Trạng Thái", 
        type: "custom",
        customComponent: TrangThaiToggleButtons,
        required: true 
      },
      { name: "so_cau_hoi", label: "Số Câu Hỏi", type: "number", required: true },
      { name: "so_phut_lam_bai", label: "Số Phút Làm Bài", type: "number", required: true },
    ]
  },
  {
    title: "Phạm Vi Áp Dụng",
    fields: [
      { 
        name: "nhom_chuyen_de_ids", 
        label: "Nhóm Chuyên Đề", 
        type: "custom",
        customComponent: NhomChuyenDeToggleButtons,
        required: true,
        colSpan: 2 
      },
      { 
        name: "chuyen_de_ids", 
        label: "Chuyên Đề", 
        type: "custom",
        customComponent: ChuyenDeMultiSelectFiltered,
        required: true,
        colSpan: 2 
      },
      { 
        name: "chuc_vu_ids", 
        label: "Chức Vụ", 
        type: "custom",
        customComponent: ChucVuMultiSelectWrapper,
        colSpan: 2 
      },
    ]
  },
  {
    title: "Ghi Chú",
    fields: [
      { name: "ghi_chu", label: "Ghi Chú", type: "textarea", colSpan: 2 },
    ]
  },
]

interface KyThiFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function KyThiFormView({ id, onComplete, onCancel }: KyThiFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateKyThi()
  const updateMutation = useUpdateKyThi()
  const { employee } = useAuthStore()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const { data: existingData, isLoading } = useKyThiById(id ?? 0, undefined)
  
  // Computed values
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  
  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])

  // ✅ QUAN TRỌNG: Tạo schema cho form (bỏ nguoi_tao_id vì sẽ tự động set)
  const formSchema = useMemo(() => {
    return kyThiSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true })
      .extend({
        ngay: z.union([
          z.string().min(1, "Ngày là bắt buộc"),
          z.date().transform((val) => val.toISOString().split('T')[0]),
        ]),
        nhom_chuyen_de_ids: z.union([
          z.array(z.number()).min(1, "Phải chọn ít nhất một nhóm chuyên đề"),
          z.array(z.string()).transform((val) => val.map(id => parseInt(String(id), 10)).filter(id => !isNaN(id) && id > 0)).refine((val) => val.length > 0, "Phải chọn ít nhất một nhóm chuyên đề"),
        ]),
        chuyen_de_ids: z.union([
          z.array(z.number()).min(1, "Phải chọn ít nhất một chuyên đề"),
          z.array(z.string()).transform((val) => val.map(id => parseInt(String(id), 10)).filter(id => !isNaN(id) && id > 0)).refine((val) => val.length > 0, "Phải chọn ít nhất một chuyên đề"),
        ]),
        chuc_vu_ids: z.union([
          z.array(z.number()),
          z.array(z.string()).transform((val) => val.map(id => parseInt(String(id), 10)).filter(id => !isNaN(id) && id > 0)),
          z.null(),
        ]).optional().nullable(),
        so_cau_hoi: z.number().int().min(1, "Số câu hỏi phải lớn hơn 0").superRefine(async () => {
          // This will be validated in handleSubmit with actual chuyen_de_ids
          // We can't access other fields here in superRefine easily, so we'll validate in handleSubmit
        }),
      })
  }, [])

  // Prepare default values
  const defaultValues = useMemo(() => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]
    
    if (id && existingData && existingData !== null && typeof existingData === 'object' && 'ten_ky_thi' in existingData && existingData.ten_ky_thi !== undefined) {
      return {
        ngay: existingData.ngay || today,
        ten_ky_thi: String(existingData.ten_ky_thi || ""),
        trang_thai: existingData.trang_thai || "Mở",
        so_cau_hoi: existingData.so_cau_hoi || 10,
        so_phut_lam_bai: existingData.so_phut_lam_bai || 15,
        nhom_chuyen_de_ids: Array.isArray(existingData.nhom_chuyen_de_ids) && existingData.nhom_chuyen_de_ids.length > 0
          ? existingData.nhom_chuyen_de_ids
          : [],
        chuyen_de_ids: Array.isArray(existingData.chuyen_de_ids) && existingData.chuyen_de_ids.length > 0
          ? existingData.chuyen_de_ids
          : [],
        chuc_vu_ids: Array.isArray(existingData.chuc_vu_ids) && existingData.chuc_vu_ids.length > 0
          ? existingData.chuc_vu_ids
          : null,
        ghi_chu: existingData.ghi_chu ? String(existingData.ghi_chu) : "",
      }
    }
    // For new records - default to today
    return {
      ngay: today,
      ten_ky_thi: "",
      trang_thai: "Mở",
      so_cau_hoi: 10,
      so_phut_lam_bai: 15,
      nhom_chuyen_de_ids: [],
      chuyen_de_ids: [],
      chuc_vu_ids: null,
      ghi_chu: "",
    }
  }, [id, existingData])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  // Computed values
  const cancelUrl = returnTo === 'list' 
    ? kyThiConfig.routePath
    : (id ? `${kyThiConfig.routePath}/${id}` : kyThiConfig.routePath)

  const handleSubmit = async (data: any) => {
    try {
      // Normalize array values
      const normalizeArray = (value: any): number[] | null => {
        if (value === null || value === undefined) {
          return null
        }
        if (Array.isArray(value)) {
          const normalized = value.map(id => typeof id === 'string' ? parseInt(id, 10) : id).filter(id => !isNaN(id) && id > 0)
          return normalized.length > 0 ? normalized : null
        }
        return null
      }

      // Validate số câu hỏi: tổng số câu hỏi trong chuyên đề đã chọn phải >= so_cau_hoi
      const chuyenDeIds = normalizeArray(data.chuyen_de_ids) || []
      const soCauHoi = Number(data.so_cau_hoi || 10)
      
      if (chuyenDeIds.length > 0 && soCauHoi > 0) {
        // Count total questions from selected chuyên đề
        const { count, error } = await supabase
          .from("dao_tao_cau_hoi")
          .select("*", { count: "exact", head: true })
          .in("chuyen_de_id", chuyenDeIds)

        if (error) {
          console.error("Lỗi khi đếm số câu hỏi:", error)
          throw new Error("Không thể kiểm tra số câu hỏi. Vui lòng thử lại.")
        }

        const totalCauHoi = count || 0

        if (totalCauHoi < soCauHoi) {
          throw new Error(`Số câu hỏi không đủ. Tổng số câu hỏi trong các chuyên đề đã chọn là ${totalCauHoi}, nhưng yêu cầu ${soCauHoi} câu hỏi.`)
        }
      }

      if (isEditMode && id) {
        const updateInput: UpdateKyThiInput = {
          ngay: data.ngay ? String(data.ngay).trim() : undefined,
          ten_ky_thi: data.ten_ky_thi ? String(data.ten_ky_thi).trim() : undefined,
          trang_thai: data.trang_thai ? String(data.trang_thai).trim() : undefined,
          so_cau_hoi: data.so_cau_hoi ? Number(data.so_cau_hoi) : undefined,
          so_phut_lam_bai: data.so_phut_lam_bai ? Number(data.so_phut_lam_bai) : undefined,
          nhom_chuyen_de_ids: normalizeArray(data.nhom_chuyen_de_ids) || [],
          chuyen_de_ids: normalizeArray(data.chuyen_de_ids) || [],
          chuc_vu_ids: normalizeArray(data.chuc_vu_ids),
          ghi_chu: data.ghi_chu ? String(data.ghi_chu).trim() : null,
        }
        await updateMutation.mutateAsync({ 
          id, 
          input: updateInput
        })
      } else {
        // Tự động set nguoi_tao_id từ employee hiện tại (ma_nhan_vien)
        if (!employee?.ma_nhan_vien) {
          throw new Error("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.")
        }
        const createInput: CreateKyThiInput = {
          ngay: String(data.ngay || "").trim(),
          ten_ky_thi: String(data.ten_ky_thi || "").trim(),
          trang_thai: String(data.trang_thai || "Mở").trim(),
          so_cau_hoi: Number(data.so_cau_hoi || 10),
          so_phut_lam_bai: Number(data.so_phut_lam_bai || 15),
          nhom_chuyen_de_ids: normalizeArray(data.nhom_chuyen_de_ids) || [],
          chuyen_de_ids: normalizeArray(data.chuyen_de_ids) || [],
          chuc_vu_ids: normalizeArray(data.chuc_vu_ids),
          ghi_chu: data.ghi_chu ? String(data.ghi_chu).trim() : null,
          nguoi_tao_id: employee.ma_nhan_vien,
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
        navigate(kyThiConfig.routePath)
      } else if (id) {
        navigate(`${kyThiConfig.routePath}/${id}`)
      } else {
        navigate(kyThiConfig.routePath)
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
        ? `Sửa Kỳ Thi: ${existingData?.ten_ky_thi || ''}` 
        : "Thêm Mới Kỳ Thi"}
      submitLabel={isEditMode ? "Cập nhật" : "Thêm mới"}
      successMessage={isEditMode ? "Cập nhật kỳ thi thành công" : "Thêm mới kỳ thi thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật kỳ thi" : "Có lỗi xảy ra khi thêm mới kỳ thi"}
    />
  )
}

