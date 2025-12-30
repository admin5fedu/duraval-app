"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { chamOleSchema } from "../schema"
import { useCreateChamOle, useUpdateChamOle } from "../hooks/use-cham-ole-mutations"
import { useChamOleById } from "../hooks/use-cham-ole"
import { chamOleConfig } from "../config"
import { useMemo } from "react"
import type { CreateChamOleInput, UpdateChamOleInput } from "../types"
import { useAuthStore } from "@/shared/stores/auth-store"
import { NhanVienSelectFormField } from "@/features/hanh-chinh-nhan-su/ole/diem-cong-tru/components/nhan-vien-select-form-field"
import { PhongBanSelectFormField } from "@/features/hanh-chinh-nhan-su/ole/diem-cong-tru/components/phong-ban-select-form-field"
import { ChucVuSelectFormField } from "./chuc-vu-select-form-field"
import { useFormContext } from "react-hook-form"
import { useEffect } from "react"
import * as React from "react"
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks/use-nhan-su"

// Component wrapper để watch nhan_vien_id và cập nhật phong_id, chuc_vu_id
function NhanVienWatcher() {
    const { data: employees } = useNhanSu()
    const form = useFormContext()
    const nhanVienId = form.watch("nhan_vien_id")
    
    useEffect(() => {
        if (nhanVienId && employees) {
            const selectedEmployee = employees.find(emp => emp.ma_nhan_vien === Number(nhanVienId))
            if (selectedEmployee) {
                // Tự động cập nhật phong_id từ var_nhan_su.phong_ban_id
                if (selectedEmployee.phong_ban_id) {
                    form.setValue("phong_id", selectedEmployee.phong_ban_id, { shouldValidate: false, shouldDirty: false })
                } else {
                    form.setValue("phong_id", null, { shouldValidate: false, shouldDirty: false })
                }
                
                // Tự động cập nhật chuc_vu_id từ var_nhan_su.chuc_vu_id
                if (selectedEmployee.chuc_vu_id) {
                    form.setValue("chuc_vu_id", selectedEmployee.chuc_vu_id, { shouldValidate: false, shouldDirty: false })
                } else {
                    form.setValue("chuc_vu_id", null, { shouldValidate: false, shouldDirty: false })
                }
                
                // Tự động cập nhật nhom_id từ var_nhan_su.nhom_id
                const nhomId = (selectedEmployee as any).nhom_id
                if (nhomId) {
                    form.setValue("nhom_id", Number(nhomId), { shouldValidate: false, shouldDirty: false })
                } else {
                    form.setValue("nhom_id", null, { shouldValidate: false, shouldDirty: false })
                }
            }
        }
    }, [nhanVienId, employees, form])
    
    return null
}

// Component wrapper để watch ole và tự động tính đánh giá
function OleWatcher() {
    const form = useFormContext()
    const ole = form.watch("ole")
    const danhGia = form.watch("danh_gia")
    const isInitialMount = React.useRef(true)
    
    useEffect(() => {
        // Skip lần đầu tiên khi component mount (để không ghi đè giá trị từ existingData)
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }
        
        if (ole !== null && ole !== undefined) {
            // Tự động tính đánh giá: >= 85 = Đạt, < 85 = Không đạt
            const newDanhGia = Number(ole) >= 85 ? "Đạt" : "Không đạt"
            // Chỉ cập nhật nếu giá trị thay đổi
            if (newDanhGia !== danhGia) {
                form.setValue("danh_gia", newDanhGia, { shouldValidate: false, shouldDirty: false })
            }
        }
    }, [ole, form, danhGia])
    
    return null
}

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { 
        name: "nhan_vien_id", 
        label: "Nhân Viên", 
        required: true,
        type: "custom",
        customComponent: NhanVienSelectFormField,
      },
      { 
        name: "nam", 
        label: "Năm", 
        type: "number",
        required: true
      },
      { 
        name: "thang", 
        label: "Tháng", 
        type: "number",
        required: true,
        min: 1,
        max: 12,
        description: "Tháng phải từ 1 đến 12",
      },
      { 
        name: "phong_id", 
        label: "Phòng", 
        type: "custom",
        customComponent: PhongBanSelectFormField,
        disabled: true,
      },
      { 
        name: "chuc_vu_id", 
        label: "Chức Vụ", 
        type: "custom",
        customComponent: ChucVuSelectFormField,
        disabled: true,
      },
    ]
  },
  {
    title: "Thông Tin Điểm",
    fields: [
      { 
        name: "danh_gia", 
        label: "Đánh Giá", 
        type: "textarea",
        disabled: true, // Tự động tính từ OLE
        description: "Tự động tính từ OLE (>=85: Đạt, <85: Không đạt)",
      },
      { 
        name: "ole", 
        label: "OLE", 
        type: "number",
      },
      { 
        name: "kpi", 
        label: "KPI", 
        type: "number",
      },
      { 
        name: "cong", 
        label: "Cộng", 
        type: "number",
      },
      { 
        name: "tru", 
        label: "Trừ", 
        type: "number",
      },
    ]
  },
  {
    title: "Thông Tin Bổ Sung",
    fields: [
      { 
        name: "ghi_chu", 
        label: "Ghi Chú", 
        type: "textarea",
      },
    ]
  },
]

interface ChamOleFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function ChamOleFormView({ id, onComplete, onCancel }: ChamOleFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateChamOle()
  const updateMutation = useUpdateChamOle()
  const { employee } = useAuthStore()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const sections = useMemo(() => {
    return getSections()
  }, [])
  
  const { data: existingData, isLoading } = useChamOleById(id ?? 0, undefined)

  const formSchema = useMemo(() => {
    return chamOleSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, nhan_vien: true, phong_ban: true, chuc_vu: true, nguoi_tao: true })
  }, [])

  const defaultValues = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    
    if (id && existingData) {
      return {
        nhan_vien_id: existingData.nhan_vien_id || null,
        nam: existingData.nam || currentYear,
        thang: existingData.thang || currentMonth,
        phong_id: existingData.phong_id || null,
        nhom_id: existingData.nhom_id || null,
        chuc_vu_id: existingData.chuc_vu_id || null,
        danh_gia: existingData.danh_gia || "",
        ole: existingData.ole ?? null,
        kpi: existingData.kpi ?? null,
        cong: existingData.cong ?? null,
        tru: existingData.tru ?? null,
        ghi_chu: existingData.ghi_chu || "",
      }
    }
    return {
      nhan_vien_id: null,
      nam: currentYear,
      thang: currentMonth,
      phong_id: null,
      nhom_id: null,
      chuc_vu_id: null,
      danh_gia: "",
      ole: null,
      kpi: null,
      cong: null,
      tru: null,
      ghi_chu: "",
    }
  }, [id, existingData])

  // Early return after all hooks
  if (id && isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  const cancelUrl = returnTo === 'list' 
    ? chamOleConfig.routePath
    : (id ? `${chamOleConfig.routePath}/${id}` : chamOleConfig.routePath)

  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: data as UpdateChamOleInput })
    } else {
      await createMutation.mutateAsync({
        ...data,
        nguoi_tao_id: employee?.ma_nhan_vien || null,
      } as CreateChamOleInput)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      if (returnTo === 'list') {
        navigate(chamOleConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${chamOleConfig.routePath}/${id}`)
      } else {
        navigate(chamOleConfig.routePath)
      }
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      navigate(cancelUrl)
    }
  }

  const nhanVienName = existingData?.nhan_vien 
    ? `${existingData.nhan_vien.ma_nhan_vien} - ${existingData.nhan_vien.ho_ten}`
    : ''

  return (
    <GenericFormView
      title={isEditMode ? `Sửa Chấm OLE: ${nhanVienName}` : "Thêm Mới Chấm OLE"}
      subtitle={isEditMode ? "Cập nhật thông tin chấm OLE." : "Thêm chấm OLE mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật chấm OLE thành công" : "Thêm mới chấm OLE thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật chấm OLE" : "Có lỗi xảy ra khi thêm mới chấm OLE"}
      defaultValues={defaultValues}
    >
      <NhanVienWatcher />
      <OleWatcher />
    </GenericFormView>
  )
}

