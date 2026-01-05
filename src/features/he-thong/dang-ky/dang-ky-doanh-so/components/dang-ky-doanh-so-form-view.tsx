"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection, AutoFillFields } from "@/shared/components"
import { dangKyDoanhSoSchema } from "../schema"
import type { CreateDangKyDoanhSoInput, UpdateDangKyDoanhSoInput } from "../schema"
import { useCreateDangKyDoanhSo, useUpdateDangKyDoanhSo } from "../hooks"
import { useDangKyDoanhSoById } from "../hooks"
import { dangKyDoanhSoConfig } from "../config"
import { useMemo } from "react"
import { useFormField } from "@/components/ui/form"
import { NhanSuSelect } from "@/components/ui/nhan-su-select"
import { NhomApDoanhSoSelect } from "@/components/ui/nhom-ap-doanh-so-select"
import { NumberInput } from "@/components/ui/number-input"
import { ToggleButtonGroup } from "../../../../hanh-chinh-nhan-su/cong-luong/phieu-hanh-chinh/components/toggle-button-group"
import { useNhanSu } from "../../../nhan-su/danh-sach-nhan-su/hooks"
import { useNhomApDoanhSo } from "../../../so-do/nhom-ap-doanh-so/hooks"
import { usePhongBan } from "../../../so-do/phong-ban/hooks"
import type { AutoFillRule } from "@/shared/hooks/use-auto-fill-fields"

// Custom component for Nhân Viên Select
function NhanVienSelectFormField({ value, onChange, disabled }: { value?: number | null; onChange: (value: number | null) => void; disabled?: boolean }) {
  const { formItemId } = useFormField()
  return (
    <div id={formItemId}>
      <NhanSuSelect 
        value={value || null} 
        onChange={onChange} 
        disabled={disabled}
        placeholder="Chọn nhân viên..."
      />
    </div>
  )
}

// Custom component for Nhóm Áp Doanh Số Select
function NhomApDoanhSoSelectFormField({ value, onChange, disabled }: { value?: number | null; onChange: (value: number | null) => void; disabled?: boolean }) {
  const { formItemId } = useFormField()
  return (
    <div id={formItemId}>
      <NhomApDoanhSoSelect 
        value={value || null} 
        onChange={onChange} 
        disabled={disabled}
        placeholder="Chọn nhóm áp doanh số..."
      />
    </div>
  )
}

// Custom component for Tháng (toggle buttons 1-12)
function ThangToggleButtons({ value, onChange, disabled }: { value?: number | string | null; onChange: (value: number | string | null) => void; disabled?: boolean }) {
  const { formItemId } = useFormField()
  const options = Array.from({ length: 12 }, (_, i) => ({
    label: `${i + 1}`,
    value: i + 1,
  }))
  
  const normalizedValue = value ? (typeof value === 'string' ? parseInt(value, 10) : value) : undefined
  
  const handleChange = (val: string | number) => {
    onChange(typeof val === 'number' ? val : parseInt(val, 10))
  }
  
  return (
    <div id={formItemId}>
      <ToggleButtonGroup value={normalizedValue} onChange={handleChange} options={options} disabled={disabled} />
    </div>
  )
}

// Generate Bậc DT options (B1-B30)
const bacDtOptions = Array.from({ length: 30 }, (_, i) => ({
  label: `B${i + 1}`,
  value: `B${i + 1}`,
}))

// Custom component for Doanh Thu (NumberInput with formatThousands)
function DoanhThuFormField({ value, onChange, disabled }: { value?: number | null; onChange: (value: number | null) => void; disabled?: boolean }) {
  const { formItemId } = useFormField()
  return (
    <div id={formItemId}>
      <NumberInput
        value={value ?? undefined}
        onChange={onChange}
        disabled={disabled}
        placeholder="Nhập doanh thu..."
        formatThousands={true}
        min={0}
        allowDecimals={false}
        className="w-full"
      />
    </div>
  )
}

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { 
        name: "nhan_vien_id", 
        label: "Nhân Viên", 
        type: "custom",
        customComponent: NhanVienSelectFormField,
        required: true,
      },
      { 
        name: "nam", 
        label: "Năm", 
        type: "number",
        required: true,
      },
      { 
        name: "thang", 
        label: "Tháng", 
        type: "custom",
        customComponent: ThangToggleButtons,
        required: true,
      },
      { 
        name: "bac_dt", 
        label: "Bậc DT", 
        type: "select",
        options: bacDtOptions,
        required: true,
        placeholder: "Chọn bậc DT...",
      },
    ]
  },
  {
    title: "Thông Tin Doanh Thu",
    fields: [
      { 
        name: "doanh_thu", 
        label: "Doanh Thu", 
        type: "custom",
        customComponent: DoanhThuFormField,
        required: true,
      },
      { 
        name: "nhom_ap_doanh_thu_id", 
        label: "Nhóm Áp Doanh Thu", 
        type: "custom",
        customComponent: NhomApDoanhSoSelectFormField,
        required: true,
      },
      { name: "mo_ta", label: "Mô Tả", type: "textarea", colSpan: 2 },
    ]
  }
]

interface DangKyDoanhSoFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function DangKyDoanhSoFormView({ id, onComplete, onCancel }: DangKyDoanhSoFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateDangKyDoanhSo()
  const updateMutation = useUpdateDangKyDoanhSo()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  // để đảm bảo thứ tự hooks nhất quán giữa các lần render
  
  // Fetch data for mapping
  const { data: nhanSuList } = useNhanSu()
  const { data: nhomApDoanhSoList } = useNhomApDoanhSo()
  const { data: phongBanList } = usePhongBan()
  
  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])
  
  // If id is provided, fetch existing data for edit mode
  // ✅ QUAN TRỌNG: Hook luôn được gọi với cùng signature để tránh "Rendered more hooks"
  const { data: existingData, isLoading } = useDangKyDoanhSoById(id ?? 0, undefined)

  // ✅ QUAN TRỌNG: Tạo schema cho form (với required fields)
  // Phải được tạo TRƯỚC early return
  // All required fields are mandatory for both create and edit
  const formSchema = useMemo(() => {
    return dangKyDoanhSoSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true })
  }, [])

  // Get current year and month
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1 // getMonth() returns 0-11

  // Get query params for pre-filling form (from year view)
  const namFromQuery = searchParams.get('nam') ? Number(searchParams.get('nam')) : null
  const thangFromQuery = searchParams.get('thang') ? Number(searchParams.get('thang')) : null
  const nhanVienIdFromQuery = searchParams.get('nhan_vien_id') ? Number(searchParams.get('nhan_vien_id')) : null

  // Prepare default values
  // Phải được tạo TRƯỚC early return
  const defaultValues = useMemo(() => {
    if (id && existingData) {
      return {
        ...existingData,
        nhan_vien_id: existingData.nhan_vien_id || null,
        nhom_ap_doanh_thu_id: existingData.nhom_ap_doanh_thu_id || null,
        nam: existingData.nam || currentYear,
        thang: existingData.thang || currentMonth,
      }
    }
    return {
      nhan_vien_id: nhanVienIdFromQuery || null,
      nhom_ap_doanh_thu_id: null,
      nam: namFromQuery || currentYear,
      thang: thangFromQuery || currentMonth,
      bac_dt: null,
      doanh_thu: null,
      phong_id: null,
      ma_phong: null,
      nhom_id: null,
      ma_nhom: null,
    }
  }, [id, existingData, currentYear, currentMonth, namFromQuery, thangFromQuery, nhanVienIdFromQuery])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (id && isLoading) {
    return <div>Đang tải...</div>
  }

  // Computed values (không phải hooks, có thể đặt sau early return)
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  const cancelUrl = returnTo === 'list' 
    ? dangKyDoanhSoConfig.routePath
    : (id ? `${dangKyDoanhSoConfig.routePath}/${id}` : dangKyDoanhSoConfig.routePath)

  // Auto-fill rules: Tự động điền ten_nhan_vien, phong_id, ma_phong, nhom_id, ma_nhom khi chọn ID
  const autoFillRules = useMemo<AutoFillRule[]>(() => [
    {
      watchField: "nhan_vien_id",
      targetFields: [
        {
          fieldName: "ten_nhan_vien",
          mapper: (nhanVienId) => {
            if (!nhanVienId || !nhanSuList) return null
            const selectedNhanSu = nhanSuList.find((ns) => ns.ma_nhan_vien === nhanVienId)
            return selectedNhanSu?.ho_ten || null
          }
        },
        {
          fieldName: "phong_id",
          mapper: (nhanVienId) => {
            if (!nhanVienId || !nhanSuList) return null
            const selectedNhanSu = nhanSuList.find((ns) => ns.ma_nhan_vien === nhanVienId)
            // Lấy phong_id từ nhanSu (có thể có trong DB nhưng chưa có trong TypeScript schema)
            return (selectedNhanSu as any)?.phong_id ?? (selectedNhanSu as any)?.phong_ban_id ?? null
          }
        },
        {
          fieldName: "ma_phong",
          mapper: (nhanVienId) => {
            if (!nhanVienId || !nhanSuList || !phongBanList) return null
            const selectedNhanSu = nhanSuList.find((ns) => ns.ma_nhan_vien === nhanVienId)
            const phongId = (selectedNhanSu as any)?.phong_id ?? (selectedNhanSu as any)?.phong_ban_id ?? null
            if (!phongId) return null
            const phongBan = phongBanList.find((pb) => pb.id === phongId)
            // Lấy ma_phong_ban từ phòng ban (có thể được map thành ma_phong trong DB)
            return phongBan?.ma_phong_ban ?? null
          }
        },
        {
          fieldName: "nhom_id",
          mapper: (nhanVienId) => {
            if (!nhanVienId || !nhanSuList) return null
            const selectedNhanSu = nhanSuList.find((ns) => ns.ma_nhan_vien === nhanVienId)
            return (selectedNhanSu as any)?.nhom_id ?? null
          }
        },
        {
          fieldName: "ma_nhom",
          mapper: (nhanVienId) => {
            if (!nhanVienId || !nhanSuList) return null
            const selectedNhanSu = nhanSuList.find((ns) => ns.ma_nhan_vien === nhanVienId)
            // Nếu có sẵn ma_nhom trong nhanSu thì lấy trực tiếp, nếu không thì lấy từ nhom field (string)
            // Có thể cần lấy từ bảng nhóm nếu có, nhưng hiện tại lấy từ field nhom (string) của nhân viên
            return (selectedNhanSu as any)?.ma_nhom ?? selectedNhanSu?.nhom ?? null
          }
        }
      ],
      dependencies: [nhanSuList, phongBanList]
    },
    {
      watchField: "nhom_ap_doanh_thu_id",
      targetFields: [
        {
          fieldName: "ten_nhom_ap_doanh_thu",
          mapper: (nhomApDoanhThuId) => {
            if (!nhomApDoanhThuId || !nhomApDoanhSoList) return null
            const selectedNhomAp = nhomApDoanhSoList.find((item) => item.id === nhomApDoanhThuId)
            return selectedNhomAp?.ten_nhom_ap || null
          }
        }
      ],
      dependencies: [nhomApDoanhSoList]
    }
  ], [nhanSuList, nhomApDoanhSoList])

  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: data as UpdateDangKyDoanhSoInput })
    } else {
      await createMutation.mutateAsync(data as CreateDangKyDoanhSoInput)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Fallback to default navigation
      if (returnTo === 'list') {
        navigate(dangKyDoanhSoConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${dangKyDoanhSoConfig.routePath}/${id}`)
      } else {
        navigate(dangKyDoanhSoConfig.routePath)
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

  const title = isEditMode 
    ? `Sửa Đăng Ký Doanh Số: ${existingData?.ten_nhan_vien || ''}` 
    : "Thêm Mới Đăng Ký Doanh Số"
  const subtitle = isEditMode 
    ? "Cập nhật thông tin đăng ký doanh số." 
    : "Thêm đăng ký doanh số mới vào hệ thống."

  return (
    <GenericFormView
      title={title}
      subtitle={subtitle}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật đăng ký doanh số thành công" : "Thêm mới đăng ký doanh số thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật đăng ký doanh số" : "Có lỗi xảy ra khi thêm mới đăng ký doanh số"}
      defaultValues={defaultValues}
    >
      <AutoFillFields rules={autoFillRules} />
    </GenericFormView>
  )
}
