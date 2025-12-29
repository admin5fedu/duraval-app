"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection, type FormFieldConfig, DynamicSections } from "@/shared/components"
import { phieuHanhChinhSchema } from "../schema"
import { z } from "zod"
import { useCreatePhieuHanhChinh, useUpdatePhieuHanhChinh } from "../hooks/use-phieu-hanh-chinh-mutations"
import { usePhieuHanhChinhById } from "../hooks/use-phieu-hanh-chinh"
import { phieuHanhChinhConfig } from "../config"
import { useMemo } from "react"
import * as React from "react"
import type { CreatePhieuHanhChinhInput, UpdatePhieuHanhChinhInput } from "../types"
import { LoaiPhieuSelect } from "./loai-phieu-select"
import { MaPhieuSelect } from "./ma-phieu-select"
import { ToggleButtonGroup } from "./toggle-button-group"
import { useFormContext } from "react-hook-form"
import { useFormField } from "@/components/ui/form"
import { useAuthStore } from "@/shared/stores/auth-store"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Custom component for Loại Phiếu
function LoaiPhieuFormField({ value, onChange, disabled }: { value?: string; onChange: (value: string) => void; disabled?: boolean }) {
  const { formItemId } = useFormField()
  return (
    <div id={formItemId}>
      <LoaiPhieuSelect value={value} onChange={onChange} disabled={disabled} />
    </div>
  )
}

// Custom component for Mã Phiếu (phụ thuộc loại phiếu)
function MaPhieuFormField({ value, onChange, disabled }: { value?: string; onChange: (value: string) => void; disabled?: boolean }) {
  const form = useFormContext()
  const loaiPhieu = form.watch("loai_phieu")
  const { formItemId } = useFormField()
  const prevLoaiPhieuRef = React.useRef<string | undefined>(loaiPhieu)
  
  // ✅ Reset mã phiếu khi loại phiếu thay đổi
  React.useEffect(() => {
    if (prevLoaiPhieuRef.current !== undefined && prevLoaiPhieuRef.current !== loaiPhieu) {
      // Loại phiếu đã thay đổi, reset mã phiếu
      onChange("")
      form.setValue("ma_phieu", "", { shouldValidate: false })
    }
    prevLoaiPhieuRef.current = loaiPhieu
  }, [loaiPhieu, onChange, form])
  
  return (
    <div id={formItemId}>
      <MaPhieuSelect loaiPhieu={loaiPhieu} value={value} onChange={onChange} disabled={disabled} />
    </div>
  )
}

// Custom component for Ca toggle buttons
function CaToggleButtons({ value, onChange, disabled }: { value?: string; onChange: (value: string) => void; disabled?: boolean }) {
  const { formItemId } = useFormField()
  const options = [
    { label: "Sáng", value: "Sáng" },
    { label: "Chiều", value: "Chiều" },
    { label: "Tối", value: "Tối" },
    { label: "Cả ngày", value: "Cả ngày" },
  ]
  
  const handleChange = (val: string | number) => {
    onChange(String(val))
  }
  
  return (
    <div id={formItemId}>
      <ToggleButtonGroup value={value} onChange={handleChange} options={options} disabled={disabled} />
    </div>
  )
}

// Custom component for Số Giờ toggle buttons
function SoGioToggleButtons({ value, onChange, disabled }: { value?: number | string; onChange: (value: number | string) => void; disabled?: boolean }) {
  const options = [
    { label: "1.5", value: 1.5 },
    { label: "2", value: 2 },
    { label: "2.5", value: 2.5 },
    { label: "3", value: 3 },
    { label: "3.5", value: 3.5 },
    { label: "4", value: 4 },
    { label: "4.5", value: 4.5 },
    { label: "5", value: 5 },
    { label: "5.5", value: 5.5 },
    { label: "6", value: 6 },
    { label: "6.5", value: 6.5 },
    { label: "7", value: 7 },
    { label: "7.5", value: 7.5 },
    { label: "8", value: 8 },
  ]
  
  // Normalize value for comparison
  const normalizedValue = value ? (typeof value === 'string' ? parseFloat(value) : value) : undefined
  
  return <ToggleButtonGroup value={normalizedValue} onChange={onChange} options={options} disabled={disabled} />
}

// Custom component for Phương Tiện toggle buttons
function PhuongTienToggleButtons({ value, onChange, disabled }: { value?: string; onChange: (value: string) => void; disabled?: boolean }) {
  const options = [
    { label: "Xe máy cá nhân", value: "Xe máy cá nhân" },
    { label: "Xe ô tô cá nhân", value: "Xe ô tô cá nhân" },
    { label: "Xe máy công ty", value: "Xe máy công ty" },
    { label: "Xe ô tô công ty", value: "Xe ô tô công ty" },
  ]
  
  const handleChange = (val: string | number) => {
    onChange(String(val))
  }
  
  return <ToggleButtonGroup value={value} onChange={handleChange} options={options} disabled={disabled} />
}

// Custom component for Cơm Trưa toggle buttons
function ComTruaToggleButtons({ value, onChange, disabled }: { value?: boolean | string | null; onChange: (value: boolean | string | null) => void; disabled?: boolean }) {
  // Convert boolean to string for ToggleButtonGroup
  const options = [
    { label: "Có", value: "true" },
    { label: "Không", value: "false" },
  ]
  
  // Normalize value for comparison - handle null as undefined, convert boolean to string
  const normalizedValue = React.useMemo(() => {
    if (value === undefined || value === null) return undefined
    if (typeof value === 'boolean') return value ? "true" : "false"
    if (typeof value === 'string') {
      if (value === "true" || value === "Có") return "true"
      if (value === "false" || value === "Không") return "false"
    }
    return undefined
  }, [value])
  
  const handleChange = (selectedValue: string | number) => {
    // Convert to boolean (null will be handled as undefined which means not selected)
    const stringValue = String(selectedValue)
    if (stringValue === "true") {
      onChange(true)
    } else if (stringValue === "false") {
      onChange(false)
    } else {
      onChange(null)
    }
  }
  
  return <ToggleButtonGroup value={normalizedValue} onChange={handleChange} options={options} disabled={disabled} />
}

// Function to get sections based on loai_phieu
const getSections = (loaiPhieu?: string, nguoiTaoDisplay?: string, tgTaoDisplay?: string): FormSection[] => {
  const baseFields: FormFieldConfig[] = [
    { 
      name: "ngay", 
      label: "Ngày", 
      required: true,
      type: "date",
    },
    { 
      name: "loai_phieu", 
      label: "Loại Phiếu", 
      required: true,
      type: "custom",
      customComponent: LoaiPhieuFormField,
    },
    { 
      name: "ma_phieu", 
      label: "Mã Phiếu", 
      required: true,
      type: "custom",
      customComponent: MaPhieuFormField,
    },
    { 
      name: "ca", 
      label: "Ca", 
      required: true,
      type: "custom",
      customComponent: CaToggleButtons,
    },
    { 
      name: "ly_do", 
      label: "Lý Do", 
      type: "textarea",
      required: true,
    },
  ]

  const additionalFields: FormFieldConfig[] = []
  
  // Số Giờ: chỉ hiển thị và bắt buộc cho "Tăng ca"
  if (loaiPhieu === "Tăng ca") {
    additionalFields.push({
      name: "so_gio", 
      label: "Số Giờ", 
      required: true,
      type: "custom",
      customComponent: SoGioToggleButtons,
    })
  }
  
  // Cơm Trưa: chỉ hiển thị và bắt buộc cho "Công tác" và "Xin nghỉ"
  if (loaiPhieu === "Công tác" || loaiPhieu === "Xin nghỉ") {
    additionalFields.push({
      name: "com_trua", 
      label: "Cơm Trưa", 
      type: "custom",
      customComponent: ComTruaToggleButtons,
      required: true,
    })
  }
  
  // Phương Tiện: chỉ hiển thị và bắt buộc cho "Công tác"
  if (loaiPhieu === "Công tác") {
    additionalFields.push({
      name: "phuong_tien", 
      label: "Phương Tiện", 
      required: true,
      type: "custom",
      customComponent: PhuongTienToggleButtons,
    })
  }

  // Thêm các trường read-only: Người tạo và Thời gian tạo
  if (nguoiTaoDisplay || tgTaoDisplay) {
    if (nguoiTaoDisplay) {
      additionalFields.push({
        name: "nguoi_tao_display", 
        label: "Người Tạo", 
        type: "text",
        disabled: true,
      })
    }
    if (tgTaoDisplay) {
      additionalFields.push({
        name: "tg_tao_display", 
        label: "Thời Gian Tạo", 
        type: "text",
        disabled: true,
      })
    }
  }

  return [
    {
      title: "Thông Tin Cơ Bản",
      fields: baseFields,
    },
    {
      title: "Thông Tin Bổ Sung",
      fields: additionalFields,
    },
  ]
}

interface PhieuHanhChinhFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function PhieuHanhChinhFormView({ id, onComplete, onCancel }: PhieuHanhChinhFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreatePhieuHanhChinh()
  const updateMutation = useUpdatePhieuHanhChinh()
  const { employee } = useAuthStore()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  // để đảm bảo thứ tự hooks nhất quán giữa các lần render
  
  // If id is provided, fetch existing data for edit mode
  // ✅ QUAN TRỌNG: Hook luôn được gọi với cùng signature để tránh "Rendered more hooks"
  const { data: existingData, isLoading } = usePhieuHanhChinhById(id ?? 0, undefined)

  // ✅ QUAN TRỌNG: Tạo schema cho form với conditional validation
  // Phải được tạo TRƯỚC early return
  const formSchema = useMemo(() => {
    return phieuHanhChinhSchema
      .omit({ 
        id: true, 
        tg_tao: true, 
        tg_cap_nhat: true, 
        nguoi_tao_id: true, 
        nguoi_tao_ten: true, 
        trao_doi: true,
        trang_thai: true,
        quan_ly_duyet: true,
        ten_quan_ly: true,
        tg_quan_ly_duyet: true,
        hcns_duyet: true,
        ten_hcns: true,
        tg_hcns_duyet: true,
      })
      .superRefine((data, ctx) => {
        // Validate ca: bắt buộc
        if (!data.ca || data.ca.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ca là bắt buộc",
            path: ["ca"],
          })
        }
        
        // Validate so_gio: bắt buộc cho "Tăng ca"
        if (data.loai_phieu === "Tăng ca") {
          if (!data.so_gio || data.so_gio === null || data.so_gio === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Số giờ là bắt buộc",
              path: ["so_gio"],
            })
          }
        }
        
        // Validate com_trua: bắt buộc cho "Công tác" và "Xin nghỉ"
        if (data.loai_phieu === "Công tác" || data.loai_phieu === "Xin nghỉ") {
          if (data.com_trua === null || data.com_trua === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Cơm trưa là bắt buộc",
              path: ["com_trua"],
            })
          }
        }
        
        // Validate phuong_tien: bắt buộc cho "Công tác"
        if (data.loai_phieu === "Công tác") {
          if (!data.phuong_tien || data.phuong_tien.trim() === "") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Phương tiện là bắt buộc",
              path: ["phuong_tien"],
            })
          }
        }
      })
  }, [])

  // Prepare default values
  // Phải được tạo TRƯỚC early return
  const defaultValues = useMemo(() => {
    if (id && existingData) {
      // Format người tạo: mã - tên
      const nguoiTaoDisplay = existingData.nguoi_tao_id && existingData.nguoi_tao_ten
        ? `${existingData.nguoi_tao_id} - ${existingData.nguoi_tao_ten}`
        : existingData.nguoi_tao_id
          ? String(existingData.nguoi_tao_id)
          : existingData.nguoi_tao_ten || ""
      
      // Format thời gian tạo
      const tgTaoDisplay = existingData.tg_tao
        ? format(new Date(existingData.tg_tao), "dd/MM/yyyy HH:mm", { locale: vi })
        : ""
      
      return {
        ...existingData,
        // Ensure boolean fields are properly handled - keep null if null
        com_trua: existingData.com_trua ?? null,
        // Convert date strings to date format for form
        ngay: existingData.ngay ? (existingData.ngay instanceof Date ? existingData.ngay : new Date(existingData.ngay).toISOString().split('T')[0]) : undefined,
        // Convert so_gio to number if it's a string
        so_gio: existingData.so_gio ? (typeof existingData.so_gio === 'string' ? parseFloat(existingData.so_gio) : existingData.so_gio) : undefined,
        // Display fields for read-only
        nguoi_tao_display: nguoiTaoDisplay,
        tg_tao_display: tgTaoDisplay,
      }
    }
    return {
      ngay: new Date().toISOString().split('T')[0], // Default to today
      com_trua: null, // Default to null (not selected)
    }
  }, [id, existingData])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (id && isLoading) {
    return <div>Đang tải...</div>
  }

  // Computed values (không phải hooks, có thể đặt sau early return)
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  const cancelUrl = returnTo === 'list' 
    ? phieuHanhChinhConfig.routePath
    : (id ? `${phieuHanhChinhConfig.routePath}/${id}` : phieuHanhChinhConfig.routePath)

  // Function để generate sections dựa trên loai_phieu (sẽ được dùng bởi DynamicSections)
  const getSectionsForForm = useMemo(() => {
    return (formValues: Record<string, any>): FormSection[] => {
      // Lấy giá trị display từ form values hoặc defaultValues
      const nguoiTaoDisplay = formValues.nguoi_tao_display || (defaultValues as any).nguoi_tao_display || ""
      const tgTaoDisplay = formValues.tg_tao_display || (defaultValues as any).tg_tao_display || ""
      return getSections(formValues.loai_phieu, nguoiTaoDisplay, tgTaoDisplay)
    }
  }, [defaultValues])

  const handleSubmit = async (data: any) => {
    // ✅ Validate và normalize ca
    const allowedCaValues = ["Sáng", "Chiều", "Tối", "Cả ngày"]
    let normalizedCa: string | null = null
    
    if (data.ca) {
      const trimmedCa = String(data.ca).trim()
      if (trimmedCa !== "") {
        // Kiểm tra giá trị có hợp lệ không
        if (!allowedCaValues.includes(trimmedCa)) {
          throw new Error(
            `Giá trị ca "${trimmedCa}" không hợp lệ. Chỉ chấp nhận các giá trị: ${allowedCaValues.join(", ")}.`
          )
        }
        normalizedCa = trimmedCa
      }
    }
    
    // Convert toggle values
    const submitData = {
      ...data,
      // ✅ Set nguoi_tao_id từ employee hiện tại
      nguoi_tao_id: employee?.ma_nhan_vien || null,
      // ✅ Sử dụng giá trị ca đã được validate và normalize
      ca: normalizedCa,
      // com_trua: keep boolean if selected, null if not required or not selected
      com_trua: data.com_trua === true || data.com_trua === "true" ? true : 
                data.com_trua === false || data.com_trua === "false" ? false : null,
      // Convert so_gio to number if it's a string
      so_gio: data.so_gio ? (typeof data.so_gio === 'string' ? parseFloat(data.so_gio) : data.so_gio) : null,
      // Convert date strings to proper format
      ngay: data.ngay instanceof Date ? data.ngay.toISOString().split('T')[0] : data.ngay,
      // Set default values for fields not in form
      trang_thai: "Chờ duyệt",
      quan_ly_duyet: false,
      hcns_duyet: false,
    }
    
    // Log để debug
    console.log("Form submit - ca value:", data.ca, "→ normalized:", normalizedCa)
    
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: submitData as UpdatePhieuHanhChinhInput })
    } else {
      await createMutation.mutateAsync(submitData as CreatePhieuHanhChinhInput)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Fallback to default navigation
      if (returnTo === 'list') {
        navigate(phieuHanhChinhConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${phieuHanhChinhConfig.routePath}/${id}`)
      } else {
        navigate(phieuHanhChinhConfig.routePath)
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

  // Empty sections array - sections sẽ được render bởi DynamicSections component
  const emptySections: FormSection[] = []

  // Format mã phiếu display: "mã - tên" if ten_nhom_phieu exists
  const maPhieuDisplay = React.useMemo(() => {
    if (!existingData?.ma_phieu) return ''
    const maPhieu = existingData.ma_phieu
    const tenNhomPhieu = existingData.ten_nhom_phieu
    return tenNhomPhieu 
      ? `${maPhieu} - ${tenNhomPhieu}`
      : maPhieu
  }, [existingData])

  return (
    <GenericFormView
      title={isEditMode ? `Sửa Phiếu Hành Chính: ${maPhieuDisplay}` : "Thêm Mới Phiếu Hành Chính"}
      subtitle={isEditMode ? "Cập nhật thông tin phiếu hành chính." : "Thêm phiếu hành chính mới vào hệ thống."}
      schema={formSchema}
      sections={emptySections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật phiếu hành chính thành công" : "Thêm mới phiếu hành chính thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật phiếu hành chính" : "Có lỗi xảy ra khi thêm mới phiếu hành chính"}
      defaultValues={defaultValues}
    >
      {/* ⚡ Dynamic Sections: Sử dụng useWatch + useMemo pattern (Declarative) */}
      <DynamicSections 
        getSections={getSectionsForForm}
        watchFields={["loai_phieu"]} // Chỉ watch loai_phieu field để optimize performance
      />
    </GenericFormView>
  )
}
