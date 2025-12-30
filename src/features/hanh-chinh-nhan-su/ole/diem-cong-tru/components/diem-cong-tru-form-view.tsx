"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { diemCongTruSchema } from "../schema"
import { useCreateDiemCongTru, useUpdateDiemCongTru } from "../hooks/use-diem-cong-tru-mutations"
import { useDiemCongTruById } from "../hooks/use-diem-cong-tru"
import { diemCongTruConfig } from "../config"
import { useMemo } from "react"
import type { CreateDiemCongTruInput, UpdateDiemCongTruInput } from "../types"
import { useAuthStore } from "@/shared/stores/auth-store"
import { NhanVienSelectFormField } from "./nhan-vien-select-form-field"
import { PhongBanSelectFormField } from "./phong-ban-select-form-field"
import { DiemCongTruNhomLuongSelectFormField } from "./nhom-luong-select-form-field"
import { LoaiToggleFormField } from "./loai-toggle-form-field"
import { useFormContext } from "react-hook-form"
import { useEffect } from "react"
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks/use-nhan-su"
import { useNhomLuong } from "@/features/hanh-chinh-nhan-su/ole/nhom-luong/hooks/use-nhom-luong"

// Component wrapper để watch nhan_vien_id và cập nhật ho_va_ten, phong_ban_id, ma_phong_id, nhom
function NhanVienWatcher() {
    const { data: employees } = useNhanSu()
    const form = useFormContext()
    const nhanVienId = form.watch("nhan_vien_id")
    
    useEffect(() => {
        if (nhanVienId && employees) {
            const selectedEmployee = employees.find(emp => emp.ma_nhan_vien === Number(nhanVienId))
            if (selectedEmployee) {
                // Tự động cập nhật ho_va_ten
                form.setValue("ho_va_ten", selectedEmployee.ho_ten || "", { shouldValidate: false, shouldDirty: false })
                
                // Tự động cập nhật phong_ban_id từ var_nhan_su.phong_ban_id
                if (selectedEmployee.phong_ban_id) {
                    form.setValue("phong_ban_id", selectedEmployee.phong_ban_id, { shouldValidate: false, shouldDirty: false })
                } else {
                    form.setValue("phong_ban_id", null, { shouldValidate: false, shouldDirty: false })
                }
                
                // Tự động cập nhật ma_phong_id từ var_nhan_su.phong_id
                const phongId = (selectedEmployee as any).phong_id
                if (phongId) {
                    form.setValue("ma_phong_id", phongId, { shouldValidate: false, shouldDirty: false })
                } else {
                    form.setValue("ma_phong_id", null, { shouldValidate: false, shouldDirty: false })
                }
                
                // Tự động cập nhật nhom từ var_nhan_su
                form.setValue("nhom", selectedEmployee.nhom || "", { shouldValidate: false, shouldDirty: false })
            }
        }
    }, [nhanVienId, employees, form])
    
    return null
}

// Component wrapper để watch nhom_luong_id và cập nhật ten_nhom_luong
function NhomLuongWatcher() {
    const { data: nhomLuongList } = useNhomLuong()
    const form = useFormContext()
    const nhomLuongId = form.watch("nhom_luong_id")
    
    useEffect(() => {
        if (nhomLuongId && nhomLuongList) {
            const selectedNhomLuong = nhomLuongList.find(nl => nl.id === Number(nhomLuongId))
            if (selectedNhomLuong) {
                // Tự động cập nhật ten_nhom_luong
                form.setValue("ten_nhom_luong", selectedNhomLuong.ten_nhom || "", { shouldValidate: false, shouldDirty: false })
            }
        }
    }, [nhomLuongId, nhomLuongList, form])
    
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
        name: "ngay", 
        label: "Ngày", 
        type: "date",
        required: true
      },
      { 
        name: "phong_ban_id", 
        label: "Phòng Ban", 
        type: "custom",
        customComponent: PhongBanSelectFormField,
        disabled: true,
      },
      { 
        name: "loai", 
        label: "Loại", 
        type: "custom",
        customComponent: LoaiToggleFormField,
        required: true,
      },
      { 
        name: "nhom", 
        label: "Nhóm",
        disabled: true,
      },
    ]
  },
  {
    title: "Thông Tin Điểm và Tiền",
    fields: [
      { 
        name: "diem", 
        label: "Điểm", 
        type: "number",
        required: true,
      },
      { 
        name: "tien", 
        label: "Tiền", 
        type: "number",
        required: true,
      },
      { 
        name: "nhom_luong_id", 
        label: "Nhóm Lương", 
        type: "custom",
        customComponent: DiemCongTruNhomLuongSelectFormField,
      },
      { 
        name: "ten_nhom_luong", 
        label: "Tên Nhóm Lương", 
      },
    ]
  },
  {
    title: "Thông Tin Bổ Sung",
    fields: [
      { 
        name: "mo_ta", 
        label: "Mô Tả", 
        type: "textarea",
        required: true,
      },
      { 
        name: "trang_thai", 
        label: "Trạng Thái",
        disabled: true,
      },
    ]
  },
]

interface DiemCongTruFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function DiemCongTruFormView({ id, onComplete, onCancel }: DiemCongTruFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateDiemCongTru()
  const updateMutation = useUpdateDiemCongTru()
  const { employee } = useAuthStore()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  // để đảm bảo thứ tự hooks nhất quán giữa các lần render
  
  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])
  
  // If id is provided, fetch existing data for edit mode
  // ✅ QUAN TRỌNG: Hook luôn được gọi với cùng signature để tránh "Rendered more hooks"
  const { data: existingData, isLoading } = useDiemCongTruById(id ?? 0, undefined)

  // ✅ QUAN TRỌNG: Tạo schema cho form
  // Phải được tạo TRƯỚC early return
  const formSchema = useMemo(() => {
    return diemCongTruSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, nhan_vien: true, phong_ban: true, nhom_luong: true, nguoi_tao: true })
  }, [])

  // Prepare default values
  // Phải được tạo TRƯỚC early return
  const defaultValues = useMemo(() => {
    // Lấy ngày hôm nay theo format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0]
    
    if (id && existingData) {
      return {
        nhan_vien_id: existingData.nhan_vien_id || null,
        ho_va_ten: existingData.ho_va_ten || "",
        ngay: existingData.ngay || "",
        ma_phong_id: existingData.ma_phong_id || null,
        phong_ban_id: existingData.phong_ban_id || null,
        loai: existingData.loai || "",
        nhom: existingData.nhom || "",
        diem: existingData.diem ?? 0,
        tien: existingData.tien ?? 0,
        nhom_luong_id: existingData.nhom_luong_id || null,
        ten_nhom_luong: existingData.ten_nhom_luong || "",
        mo_ta: existingData.mo_ta || "",
        trang_thai: existingData.trang_thai || "",
      }
    }
    return {
      nhan_vien_id: null,
      ho_va_ten: "",
      ngay: today,
      ma_phong_id: null,
      phong_ban_id: null,
      loai: "",
      nhom: "",
      diem: 0,
      tien: 0,
      nhom_luong_id: null,
      ten_nhom_luong: "",
      mo_ta: "",
      trang_thai: "Chờ xác nhận",
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

  // Computed values (không phải hooks, có thể đặt sau early return)
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  const cancelUrl = returnTo === 'list' 
    ? diemCongTruConfig.routePath
    : (id ? `${diemCongTruConfig.routePath}/${id}` : diemCongTruConfig.routePath)

  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: data as UpdateDiemCongTruInput })
    } else {
      // ✅ Set nguoi_tao_id từ employee hiện tại khi tạo mới
      await createMutation.mutateAsync({
        ...data,
        nguoi_tao_id: employee?.ma_nhan_vien || null,
      } as CreateDiemCongTruInput)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Fallback to default navigation
      if (returnTo === 'list') {
        navigate(diemCongTruConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${diemCongTruConfig.routePath}/${id}`)
      } else {
        navigate(diemCongTruConfig.routePath)
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
      title={isEditMode ? `Sửa Điểm Cộng Trừ: ${existingData?.ho_va_ten || ''}` : "Thêm Mới Điểm Cộng Trừ"}
      subtitle={isEditMode ? "Cập nhật thông tin điểm cộng trừ." : "Thêm điểm cộng trừ mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật điểm cộng trừ thành công" : "Thêm mới điểm cộng trừ thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật điểm cộng trừ" : "Có lỗi xảy ra khi thêm mới điểm cộng trừ"}
      defaultValues={defaultValues}
    >
      <NhanVienWatcher />
      <NhomLuongWatcher />
    </GenericFormView>
  )
}

