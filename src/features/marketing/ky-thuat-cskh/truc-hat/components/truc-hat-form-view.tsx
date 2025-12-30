"use client"

import { useNavigate } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { trucHatSchema } from "../schema"
import { useCreateTrucHat, useUpdateTrucHat } from "../hooks"
import { useTrucHatById } from "../hooks"
import { trucHatConfig } from "../config"
import { useMemo, useEffect, useState } from "react"
import type { CreateTrucHatInput, UpdateTrucHatInput } from "../types"
import { useAuthStore } from "@/shared/stores/auth-store"
import { NhanVienSelectFormField } from "./nhan-vien-select-form-field"
import { TrucHatAPI } from "../services/truc-hat.api"
import { useQuery } from "@tanstack/react-query"
import { trucHatQueryKeys } from "@/lib/react-query/query-keys"

const getSections = (isEditMode: boolean): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { 
        name: "ngay", 
        label: "Ngày", 
        type: "date",
        required: false,
      },
      { 
        name: "ma_truc", 
        label: "Mã Trục", 
        type: "number",
        required: true,
        disabled: isEditMode, // Disabled khi edit, tự động tăng khi tạo mới
      },
      { 
        name: "nhan_vien_bh_id", 
        label: "Nhân Viên Bán Hàng", 
        type: "custom",
        customComponent: NhanVienSelectFormField,
        required: true,
      },
      { 
        name: "trang_thai", 
        label: "Trạng Thái", 
        type: "toggle",
        required: true,
        options: [
          { label: "Mới", value: "Mới" },
          { label: "Đang vẽ", value: "Đang vẽ" },
          { label: "Đã đặt", value: "Đã đặt" },
          { label: "Đang về", value: "Đang về" },
          { label: "Chờ kiểm tra", value: "Chờ kiểm tra" },
          { label: "Chờ sửa", value: "Chờ sửa" },
          { label: "Chờ giao", value: "Chờ giao" },
          { label: "Đã giao", value: "Đã giao" },
        ],
      },
      { 
        name: "khach_hang", 
        label: "Khách Hàng", 
        type: "text",
      },
      { 
        name: "anh_ban_ve", 
        label: "Ảnh Bản Vẽ", 
        type: "image",
        imageFolder: "truc-hat",
        imageMaxSize: 10,
      },
      { 
        name: "ghi_chu", 
        label: "Ghi Chú", 
        type: "textarea",
      },
    ]
  },
]

interface TrucHatFormViewProps {
  id?: number
  initialData?: any
  onComplete?: () => void
  onCancel?: () => void
}

export function TrucHatFormView({ id, initialData, onComplete, onCancel }: TrucHatFormViewProps) {
  const navigate = useNavigate()
  const { employee } = useAuthStore()
  const isEditMode = !!id
  const { data: trucHat, isLoading } = useTrucHatById(id!, initialData)
  const createMutation = useCreateTrucHat()
  const updateMutation = useUpdateTrucHat()
  const [maxMaTruc, setMaxMaTruc] = useState<number | null>(null)

  // Get max ma_truc for auto-increment when creating new
  const { data: maxMaTrucData } = useQuery({
    queryKey: [...trucHatQueryKeys.all(), "max-ma-truc"],
    queryFn: () => TrucHatAPI.getMaxMaTruc(),
    enabled: !isEditMode, // Only fetch when creating new
    staleTime: 0, // Always fetch fresh data
  })

  useEffect(() => {
    if (maxMaTrucData !== undefined) {
      setMaxMaTruc(maxMaTrucData)
    }
  }, [maxMaTrucData])

  const defaultValues = useMemo(() => {
    if (isEditMode && trucHat) {
      return {
        ngay: trucHat.ngay || null,
        ma_truc: trucHat.ma_truc || null,
        khach_hang: trucHat.khach_hang || "",
        nhan_vien_bh_id: trucHat.nhan_vien_bh_id || null,
        anh_ban_ve: trucHat.anh_ban_ve || "",
        ghi_chu: trucHat.ghi_chu || "",
        trang_thai: trucHat.trang_thai || "Mới",
      }
    }
    // Auto-increment ma_truc when creating new
    // Auto-set ngay to current date
    const nextMaTruc = maxMaTruc !== null ? maxMaTruc + 1 : 1
    const today = new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
    return {
      ngay: today,
      ma_truc: nextMaTruc,
      khach_hang: "",
      nhan_vien_bh_id: null,
      anh_ban_ve: "",
      ghi_chu: "",
      trang_thai: "Mới",
    }
  }, [isEditMode, trucHat, maxMaTruc])

  const sections = useMemo(() => getSections(isEditMode), [isEditMode])

  const handleSubmit = async (data: any) => {
    // Ensure nguoi_tao_id is set from current employee when creating
    if (!isEditMode) {
      data.nguoi_tao_id = employee?.ma_nhan_vien ? Number(employee.ma_nhan_vien) : null
    }
    
    if (isEditMode && id) {
      const updateInput: UpdateTrucHatInput = {
        ...data,
      }
      await updateMutation.mutateAsync({ id, input: updateInput })
    } else {
      const createInput: CreateTrucHatInput = {
        ...data,
        nguoi_tao_id: employee?.ma_nhan_vien ? Number(employee.ma_nhan_vien) : null,
      }
      await createMutation.mutateAsync(createInput)
    }

    if (onComplete) {
      onComplete()
    } else if (isEditMode && id) {
      navigate(`${trucHatConfig.routePath}/${id}`)
    } else {
      navigate(trucHatConfig.routePath)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else if (isEditMode && id) {
      navigate(`${trucHatConfig.routePath}/${id}`)
    } else {
      navigate(trucHatConfig.routePath)
    }
  }

  if (isEditMode && isLoading) {
    return <div>Loading...</div>
  }

  return (
    <GenericFormView
      title={isEditMode ? "Chỉnh Sửa Trục Hạt" : "Thêm Mới Trục Hạt"}
      schema={trucHatSchema.omit({ 
        id: true, 
        tg_tao: true, 
        tg_cap_nhat: true, 
        nhan_vien_bh: true,
        nguoi_tao: true,
        trao_doi: true,
      })}
      defaultValues={defaultValues}
      sections={sections}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  )
}

