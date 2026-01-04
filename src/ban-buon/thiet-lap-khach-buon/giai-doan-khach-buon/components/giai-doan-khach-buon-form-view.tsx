"use client"
import { GenericFormView, type FormSection } from "@/shared/components"
import { giaiDoanKhachBuonSchema } from "../schema"
import type { CreateGiaiDoanKhachBuonInput, UpdateGiaiDoanKhachBuonInput } from "../schema"
import { useCreateGiaiDoanKhachBuon, useUpdateGiaiDoanKhachBuon } from "../hooks/use-giai-doan-khach-buon-mutations"
import { useGiaiDoanKhachBuonById } from "../hooks/use-giai-doan-khach-buon"
import { useMemo } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"

const getSections = (): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ma_giai_doan", label: "Mã Giai Đoạn" },
      { name: "ten_giai_doan", label: "Tên Giai Đoạn", required: true },
      { 
        name: "mo_ta", 
        label: "Mô Tả", 
        type: "textarea",
      },
      {
        name: "tt",
        label: "Thứ Tự",
        type: "number",
      },
    ]
  },
]

interface GiaiDoanKhachBuonFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function GiaiDoanKhachBuonFormView({ id, onComplete, onCancel }: GiaiDoanKhachBuonFormViewProps) {
  const createMutation = useCreateGiaiDoanKhachBuon()
  const updateMutation = useUpdateGiaiDoanKhachBuon()
  const { employee } = useAuthStore()
  
  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const { data: existingData, isLoading } = useGiaiDoanKhachBuonById(id ?? 0, undefined)
  
  // Computed values
  const isEditMode = !!id
  
  // Create sections
  const sections = useMemo(() => {
    return getSections()
  }, [])

  // ✅ QUAN TRỌNG: Tạo schema cho form
  const formSchema = useMemo(() => {
    return giaiDoanKhachBuonSchema
  }, [])

  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      // Update mode
      const updateData: UpdateGiaiDoanKhachBuonInput = {
        ma_giai_doan: data.ma_giai_doan || null,
        ten_giai_doan: data.ten_giai_doan,
        mo_ta: data.mo_ta || null,
        tt: data.tt ?? null,
      }

      await updateMutation.mutateAsync({ id, input: updateData })
    } else {
      // Create mode
      const createData: CreateGiaiDoanKhachBuonInput = {
        ma_giai_doan: data.ma_giai_doan || null,
        ten_giai_doan: data.ten_giai_doan,
        mo_ta: data.mo_ta || null,
        tt: data.tt ?? null,
        nguoi_tao_id: employee?.ma_nhan_vien || null,
      }

      await createMutation.mutateAsync(createData)
    }

    if (onComplete) {
      onComplete()
    }
  }

  // Loading state
  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  // Default values
  const defaultValues = useMemo(() => {
    if (isEditMode && existingData) {
      return {
        ma_giai_doan: existingData.ma_giai_doan || "",
        ten_giai_doan: existingData.ten_giai_doan || "",
        mo_ta: existingData.mo_ta || "",
        tt: existingData.tt ?? "",
      }
    }
    return {
      ma_giai_doan: "",
      ten_giai_doan: "",
      mo_ta: "",
      tt: "",
    }
  }, [isEditMode, existingData])

  return (
    <GenericFormView
      title={isEditMode ? "Sửa Giai Đoạn Khách Buôn" : "Thêm Mới Giai Đoạn Khách Buôn"}
      schema={formSchema}
      sections={sections}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  )
}

