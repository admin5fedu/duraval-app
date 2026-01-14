"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection, AutoFillFields } from "@/shared/components"
import { chucVuSchema } from "../schema"
import type { CreateChucVuInput, UpdateChucVuInput } from "../schema"
import { useCreateChucVu, useUpdateChucVu } from "../hooks/use-chuc-vu-mutations"
import { useChucVuById } from "../hooks/use-chuc-vu"
import { chucVuConfig } from "../config"
import { useMemo } from "react"
import { usePhongBan } from "../../phong-ban/hooks"
import { useCapBac } from "../../cap-bac/hooks"
import type { AutoFillRule } from "@/shared/hooks/use-auto-fill-fields"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ma_chuc_vu", label: "Mã Chức Vụ", required: true },
      { name: "ten_chuc_vu", label: "Tên Chức Vụ", required: true },
      {
        name: "cap_bac_id",
        label: "Cấp Bậc",
        required: true,
        type: "cap-bac-select",
        placeholder: "Chọn cấp bậc...",
        description: "Tìm kiếm theo tên cấp bậc",
      },
      { name: "cap_bac", label: "Cấp Bậc", placeholder: "Tự động điền từ cấp bậc", disabled: true },
      { name: "ten_cap_bac", label: "Tên Cấp Bậc", placeholder: "Tự động điền từ cấp bậc", disabled: true, colSpan: 2 },
    ]
  },
  {
    title: "Thông Tin Phòng Ban",
    fields: [
      {
        name: "phong_ban_id",
        label: "Phòng Ban",
        required: true,
        type: "phong-ban-select",
        placeholder: "Chọn phòng ban...",
        description: "Tìm kiếm theo tên hoặc mã phòng ban",
      },
      { name: "ma_phong_ban", label: "Mã Phòng Ban", placeholder: "Tự động điền từ phòng ban", disabled: true, colSpan: 2 },
    ]
  },
  {
    title: "Thông Tin Lương và Phúc Lợi",
    fields: [
      { name: "ngach_luong", label: "Ngạch Lương" },
      { name: "muc_dong_bao_hiem", label: "Mức Đóng Bảo Hiểm", type: "number" },
      { name: "so_ngay_nghi_thu_7", label: "Số Ngày Nghỉ Thứ 7" },
      { name: "nhom_thuong", label: "Nhóm Thưởng" },
      { name: "diem_thuong", label: "Điểm Thưởng", type: "number", colSpan: 2 },
    ]
  }
]

interface ChucVuFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function ChucVuFormView({ id, onComplete, onCancel }: ChucVuFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateChucVu()
  const updateMutation = useUpdateChucVu()

  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  // để đảm bảo thứ tự hooks nhất quán giữa các lần render

  // Fetch data for mapping
  const { data: capBacList } = useCapBac()
  const { data: phongBanList } = usePhongBan()

  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])

  // If id is provided, fetch existing data for edit mode
  // ✅ QUAN TRỌNG: Hook luôn được gọi với cùng signature để tránh "Rendered more hooks"
  const { data: existingData, isLoading } = useChucVuById(id ?? 0, undefined)

  // ✅ QUAN TRỌNG: Tạo schema cho form
  // Phải được tạo TRƯỚC early return
  const formSchema = useMemo(() => {
    return chucVuSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true })
  }, [])

  // Prepare default values
  // Phải được tạo TRƯỚC early return
  const defaultValues = useMemo(() => {
    if (id && existingData) {
      return {
        ...existingData,
        cap_bac_id: existingData.cap_bac_id || null,
        phong_ban_id: existingData.phong_ban_id || null,
      }
    }
    return {
      cap_bac_id: null,
      phong_ban_id: null,
    }
  }, [id, existingData])

  // Auto-fill rules: Tự động điền ma_cap_bac, ten_cap_bac, ma_phong_ban khi chọn cap_bac_id hoặc phong_ban_id
  const autoFillRules = useMemo<AutoFillRule[]>(() => [
    {
      watchField: "cap_bac_id",
      targetFields: [
        {
          fieldName: "cap_bac",
          mapper: (capBacId) => {
            if (!capBacId || !capBacList) return null
            const selectedCapBac = capBacList.find((cb) => cb.id === capBacId)
            return selectedCapBac?.cap_bac || null
          }
        },
        {
          fieldName: "ten_cap_bac",
          mapper: (capBacId) => {
            if (!capBacId || !capBacList) return null
            const selectedCapBac = capBacList.find((cb) => cb.id === capBacId)
            return selectedCapBac?.ten_cap_bac || null
          }
        }
      ],
      dependencies: [capBacList]
    },
    {
      watchField: "phong_ban_id",
      targetFields: [
        {
          fieldName: "ma_phong_ban",
          mapper: (phongBanId) => {
            if (!phongBanId || !phongBanList) return ""
            const selectedPhongBan = phongBanList.find((pb) => pb.id === phongBanId)
            return selectedPhongBan?.ma_phong_ban || ""
          }
        }
      ],
      dependencies: [phongBanList]
    }
  ], [capBacList, phongBanList])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (id && isLoading) {
    return <div>Đang tải...</div>
  }

  // Computed values (không phải hooks, có thể đặt sau early return)
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id
  const cancelUrl = returnTo === 'list'
    ? chucVuConfig.routePath
    : (id ? `${chucVuConfig.routePath}/${id}` : chucVuConfig.routePath)


  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      await updateMutation.mutateAsync({ id, input: data as UpdateChucVuInput })
    } else {
      await createMutation.mutateAsync(data as CreateChucVuInput)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Fallback to default navigation
      if (returnTo === 'list') {
        navigate(chucVuConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${chucVuConfig.routePath}/${id}`)
      } else {
        navigate(chucVuConfig.routePath)
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
      title={isEditMode ? `Sửa Chức Vụ: ${existingData?.ten_chuc_vu || ''}` : "Thêm Mới Chức Vụ"}
      subtitle={isEditMode ? "Cập nhật thông tin chức vụ." : "Thêm chức vụ mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật chức vụ thành công" : "Thêm mới chức vụ thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật chức vụ" : "Có lỗi xảy ra khi thêm mới chức vụ"}
      defaultValues={defaultValues}
    >
      {/* ⚡ Auto-fill Fields: Sử dụng useWatch + useEffect pattern (Imperative cho data mutation) */}
      <AutoFillFields rules={autoFillRules} />
    </GenericFormView>
  )
}

