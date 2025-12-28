"use client"

import { GenericFormView, type FormSection } from "@/shared/components"
import { viecHangNgaySchema, ViecHangNgay } from "../schema"
import type { CreateViecHangNgayInput, UpdateViecHangNgayInput } from "../types"
import { useCreateViecHangNgay, useUpdateViecHangNgay } from "../hooks"
import { useViecHangNgayById } from "../hooks"
import { viecHangNgayConfig } from "../config"
import { useMemo, useEffect } from "react"
import { ChiTietCongViecEditor, CongViec } from "./chi-tiet-cong-viec-editor"
import { EmployeeComboboxField } from "@/shared/components/forms/employee-combobox-field"
import { PhongBanDisplayField } from "./phong-ban-display-field"
import { NhomDisplayField } from "./nhom-display-field"
import { usePhongBan } from "@/features/he-thong/so-do/phong-ban/hooks/use-phong-ban"
import { useFormContext } from "react-hook-form"
import { ViecHangNgayAPI } from "../services/viec-hang-ngay.api"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks/use-nhan-su"

// Component wrapper để watch ma_nhan_vien và cập nhật ma_phong, ma_nhom, phong_ban_id
function EmployeeWatcher() {
    const { data: employees } = useNhanSu()
    const form = useFormContext()
    const maNhanVien = form.watch("ma_nhan_vien")
    
    useEffect(() => {
        if (maNhanVien && employees) {
            const selectedEmployee = employees.find(emp => emp.ma_nhan_vien?.toString() === String(maNhanVien))
            if (selectedEmployee) {
                // Tự động cập nhật ma_phong, ma_nhom và phong_ban_id
                form.setValue("ma_phong", selectedEmployee.phong_ban || null, { shouldValidate: false, shouldDirty: false })
                form.setValue("ma_nhom", selectedEmployee.nhom || null, { shouldValidate: false, shouldDirty: false })
                if (selectedEmployee.phong_ban_id) {
                    form.setValue("phong_ban_id", selectedEmployee.phong_ban_id.toString(), { shouldValidate: false, shouldDirty: false })
                } else {
                    form.setValue("phong_ban_id", null, { shouldValidate: false, shouldDirty: false })
                }
            }
        }
    }, [maNhanVien, employees, form])
    
    return null
}

// Component để check duplicate report
function DuplicateReportChecker({ excludeId }: { excludeId?: number }) {
    const form = useFormContext()
    const maNhanVien = form.watch("ma_nhan_vien")
    const ngayBaoCao = form.watch("ngay_bao_cao")

    useEffect(() => {
        const checkDuplicate = async () => {
            // Clear previous error
            form.clearErrors("ngay_bao_cao")
            form.clearErrors("ma_nhan_vien")

            // Only check if both fields have values
            if (!maNhanVien || !ngayBaoCao) {
                return
            }

            // Extract number from maNhanVien (could be string from combobox)
            let maNV: number
            if (typeof maNhanVien === 'string') {
                const match = maNhanVien.match(/^(\d+)/)
                if (match) {
                    maNV = Number(match[1])
                } else {
                    return
                }
            } else {
                maNV = Number(maNhanVien)
            }

            if (isNaN(maNV)) {
                return
            }

            try {
                const result = await ViecHangNgayAPI.checkDuplicateReport(maNV, ngayBaoCao, excludeId)
                if (result.exists) {
                    form.setError("ngay_bao_cao", {
                        type: "manual",
                        message: `Nhân viên này đã có báo cáo cho ngày ${ngayBaoCao}. Mỗi nhân viên chỉ được tạo 1 báo cáo cho 1 ngày.`
                    })
                    form.setError("ma_nhan_vien", {
                        type: "manual",
                        message: "Nhân viên này đã có báo cáo cho ngày đã chọn."
                    })
                }
            } catch (error) {
                console.error("Lỗi khi kiểm tra báo cáo trùng:", error)
            }
        }

        // Debounce check to avoid too many requests
        const timeoutId = setTimeout(checkDuplicate, 500)
        return () => clearTimeout(timeoutId)
    }, [maNhanVien, ngayBaoCao, excludeId, form])

    return null
}

const getSections = (isEditMode: boolean): FormSection[] => [
    {
        title: "Thông Tin Cơ Bản",
        fields: [
            { 
                name: "ma_nhan_vien", 
                label: "Mã Nhân Viên", 
                type: "custom",
                customComponent: EmployeeComboboxField,
                required: true, 
                placeholder: "Tìm kiếm nhân viên..."
            },
            { 
                name: "ngay_bao_cao", 
                label: "Ngày Báo Cáo", 
                type: "date", 
                required: true
            },
            { 
                name: "phong_ban_id", 
                label: "Phòng Ban", 
                type: "select",
                placeholder: isEditMode ? "Chọn phòng ban" : "Tự động điền từ nhân viên",
                disabled: !isEditMode
            },
            { 
                name: "ma_phong", 
                label: "Mã Phòng", 
                type: "custom",
                customComponent: PhongBanDisplayField,
                placeholder: "Tự động điền từ nhân viên",
                disabled: !isEditMode
            },
            { 
                name: "ma_nhom", 
                label: "Mã Nhóm", 
                type: "custom",
                customComponent: NhomDisplayField,
                placeholder: "Tự động điền từ nhân viên",
                disabled: !isEditMode
            },
        ]
    },
    {
        title: "Chi Tiết Công Việc",
        fields: [
            { 
                name: "chi_tiet_cong_viec", 
                label: "Chi Tiết Công Việc", 
                type: "custom",
                customComponent: ChiTietCongViecEditor,
                description: "Thêm và quản lý các công việc đã thực hiện. Mỗi công việc có kế hoạch, kết quả và tối đa 3 links.",
                colSpan: 3
            },
        ]
    },
]

interface ViecHangNgayFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function ViecHangNgayFormView({ id, onComplete, onCancel }: ViecHangNgayFormViewProps) {
  const createMutation = useCreateViecHangNgay()
  const updateMutation = useUpdateViecHangNgay()
  const { data: phongBans } = usePhongBan()
  const { employee: currentEmployee } = useAuthStore()
  const { data: employees } = useNhanSu()
  
  // If id is provided, fetch existing data for edit mode
  const { data: existingData, isLoading } = useViecHangNgayById(id || 0, undefined)
  
  const isEditMode = !!id

  // Create sections
  const sections = useMemo(() => {
    const baseSections = getSections(isEditMode)
    
    // Update phong_ban_id field with options if in edit mode
    if (isEditMode && phongBans) {
      return baseSections.map(section => ({
        ...section,
        fields: section.fields.map(field => {
          if (field.name === "phong_ban_id") {
            return {
              ...field,
              options: [
                { label: "Không có", value: "none" },
                ...phongBans.map(pb => ({
                  label: `${pb.ma_phong_ban} - ${pb.ten_phong_ban}`,
                  value: pb.id?.toString() || ""
                })).filter(opt => opt.value)
              ],
            }
          }
          return field
        })
      }))
    }
    
    return baseSections
  }, [isEditMode, phongBans])

  // Generate 10 default công việc
  const defaultCongViec = useMemo(() => {
    return Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      ke_hoach: '',
      ket_qua: '',
      links: [] as string[]
    }))
  }, [])

  // Prepare default values
  const formDefaultValues = useMemo(() => {
    if (isEditMode && existingData) {
      // Format chi_tiet_cong_viec for form - convert to array format with id
      const formatChiTietForForm = (chiTiet: any): CongViec[] => {
        if (!chiTiet) return []
        if (typeof chiTiet === 'string') {
          try {
            chiTiet = JSON.parse(chiTiet)
          } catch {
            return []
          }
        }
        if (!Array.isArray(chiTiet)) return []
        
        // Ensure each item has id field
        return chiTiet.map((item: any, index: number) => ({
          id: item.id || index + 1,
          ke_hoach: item.ke_hoach || '',
          ket_qua: item.ket_qua || '',
          links: Array.isArray(item.links) ? item.links : []
        }))
      }

      return {
        ma_nhan_vien: existingData.ma_nhan_vien?.toString() || "",
        ngay_bao_cao: existingData.ngay_bao_cao ? (typeof existingData.ngay_bao_cao === 'string' ? existingData.ngay_bao_cao.split('T')[0] : new Date(existingData.ngay_bao_cao).toISOString().split('T')[0]) : undefined,
        chi_tiet_cong_viec: formatChiTietForForm(existingData.chi_tiet_cong_viec),
        phong_ban_id: existingData.phong_ban_id?.toString() || "none",
        ma_phong: existingData.ma_phong || undefined,
        ma_nhom: existingData.ma_nhom || undefined,
      }
    }

    // Create mode - use current employee and today's date
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]
    
    const defaults: any = {
      chi_tiet_cong_viec: defaultCongViec,
      ngay_bao_cao: todayString
    }
    
    if (currentEmployee && currentEmployee.ma_nhan_vien) {
      defaults.ma_nhan_vien = currentEmployee.ma_nhan_vien.toString()
      defaults.ma_phong = currentEmployee.phong_ban || null
      defaults.ma_nhom = currentEmployee.nhom || null
      
      if (currentEmployee.phong_ban_id && phongBans) {
        defaults.phong_ban_id = currentEmployee.phong_ban_id.toString()
      }
    }
    
    return defaults
  }, [isEditMode, existingData, currentEmployee, phongBans, defaultCongViec])

  const handleSubmit = async (data: any) => {
    // Xử lý ma_nhan_vien
    if (!data.ma_nhan_vien) {
      throw new Error("Vui lòng chọn nhân viên")
    }
    
    let maNhanVienValue = data.ma_nhan_vien
    if (typeof maNhanVienValue === 'string') {
      const match = maNhanVienValue.match(/^(\d+)/)
      if (match) {
        maNhanVienValue = match[1]
      }
    }
    
    const maNhanVien = Number(maNhanVienValue)
    if (isNaN(maNhanVien)) {
      throw new Error("Mã nhân viên không hợp lệ")
    }

    // Xử lý phong_ban_id, ma_phong, ma_nhom
    let phongBanId: number | null = null
    let maPhong: string | null = null
    let maNhom: string | null = null

    if (isEditMode) {
      // Edit mode: lấy từ form hoặc phòng ban được chọn
      if (data.phong_ban_id && data.phong_ban_id !== "" && data.phong_ban_id !== "none") {
        phongBanId = Number(data.phong_ban_id)
        const selectedPhongBan = phongBans?.find(pb => pb.id === phongBanId)
        if (selectedPhongBan) {
          maPhong = selectedPhongBan.ma_phong_ban || null
        }
      }
      maPhong = data.ma_phong || maPhong || null
      maNhom = data.ma_nhom || null
    } else {
      // Create mode: tự động lấy từ nhân viên được chọn
      const selectedEmployee = employees?.find(emp => emp.ma_nhan_vien === maNhanVien)
      if (selectedEmployee) {
        maPhong = selectedEmployee.phong_ban || null
        maNhom = selectedEmployee.nhom || null
        if (selectedEmployee.phong_ban_id !== undefined && selectedEmployee.phong_ban_id !== null) {
          phongBanId = typeof selectedEmployee.phong_ban_id === 'number' 
            ? selectedEmployee.phong_ban_id 
            : Number(selectedEmployee.phong_ban_id)
          if (isNaN(phongBanId)) {
            phongBanId = null
          }
        }
        // Nếu có phong_ban_id, lấy ma_phong từ phòng ban
        if (phongBanId !== null && phongBans) {
          const selectedPhongBan = phongBans.find(pb => pb.id === phongBanId)
          if (selectedPhongBan) {
            maPhong = selectedPhongBan.ma_phong_ban || maPhong
          }
        }
      }
    }

    // Xử lý chi_tiet_cong_viec
    let chiTietCongViec: any[] = []
    if (data.chi_tiet_cong_viec) {
      if (Array.isArray(data.chi_tiet_cong_viec)) {
        // Filter out items with no data
        chiTietCongViec = data.chi_tiet_cong_viec.filter((item: any) => {
          return !!(item.ke_hoach?.trim() || item.ket_qua?.trim() || (item.links && item.links.some((l: string) => l.trim())))
        })
      }
    }

    if (isEditMode && id) {
      const submitData: UpdateViecHangNgayInput = {
        ma_nhan_vien: maNhanVien,
        ngay_bao_cao: data.ngay_bao_cao,
        chi_tiet_cong_viec: chiTietCongViec,
        phong_ban_id: phongBanId,
        ma_phong: maPhong,
        ma_nhom: maNhom,
      }
      await updateMutation.mutateAsync({ id, data: submitData })
    } else {
      const submitData: CreateViecHangNgayInput = {
        ma_nhan_vien: maNhanVien,
        ngay_bao_cao: data.ngay_bao_cao,
        chi_tiet_cong_viec: chiTietCongViec,
        phong_ban_id: phongBanId,
        ma_phong: maPhong,
        ma_nhom: maNhom,
      }
      await createMutation.mutateAsync(submitData)
    }
  }



  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  return (
    <GenericFormView
      title={isEditMode ? `Sửa Việc Hàng Ngày #${id}` : "Thêm Mới Việc Hàng Ngày"}
      subtitle={isEditMode ? "Cập nhật thông tin việc hàng ngày." : "Tạo báo cáo công việc hàng ngày mới."}
      schema={viecHangNgaySchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={onComplete}
      onCancel={onCancel}
      successMessage={isEditMode ? "Cập nhật việc hàng ngày thành công" : "Thêm mới việc hàng ngày thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật việc hàng ngày" : "Có lỗi xảy ra khi thêm mới việc hàng ngày"}
      defaultValues={formDefaultValues}
    >
      {!isEditMode && <EmployeeWatcher />}
      <DuplicateReportChecker excludeId={id} />
    </GenericFormView>
  )
}

