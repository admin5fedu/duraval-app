"use client"

import { GenericFormView, type FormSection } from "@/shared/components"
import { danhMucTaiLieuSchema } from "../schema"
import type { CreateDanhMucTaiLieuInput, UpdateDanhMucTaiLieuInput } from "../types"
import { useCreateDanhMucTaiLieu, useUpdateDanhMucTaiLieu } from "../hooks"
import { useDanhMucTaiLieuById, useDanhMucTaiLieu } from "../hooks"
import { useMemo, useState, useEffect } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useLoaiTaiLieu } from "@/features/cong-viec/tai-lieu/loai-tai-lieu/hooks"
import { useFormContext } from "react-hook-form"
import { z } from "zod"
import { useSearchParams } from "react-router-dom"

interface DanhMucTaiLieuFormViewProps {
  id?: number
  onComplete?: () => void
  onCancel?: () => void
}

// Wrapper component để watch và update form fields
function FormFieldWatcherWrapper({
  loaiTaiLieuList,
  danhMucTaiLieuList,
  onHangMucChange,
  onLoaiIdChange,
}: {
  loaiTaiLieuList: any[]
  danhMucTaiLieuList: any[]
  onHangMucChange: (value: string | null) => void
  onLoaiIdChange: (value: number | null) => void
}) {
  const form = useFormContext()
  const { watch, setValue } = form
  const hangMuc = watch("hang_muc")
  const danhMucChaId = watch("danh_muc_cha_id")
  const loaiId = watch("loai_id")
  
  // Update state khi hang_muc thay đổi
  useEffect(() => {
    onHangMucChange(hangMuc || null)
  }, [hangMuc, onHangMucChange])
  
  // Update state khi loai_id thay đổi
  useEffect(() => {
    onLoaiIdChange(loaiId ? Number(loaiId) : null)
  }, [loaiId, onLoaiIdChange])
  
  // Tự động tính cap: nếu có danh_muc_cha_id thì cap = 2, không có thì cap = 1
  useEffect(() => {
    if (danhMucChaId) {
      setValue("cap", 2, { shouldValidate: true })
    } else {
      setValue("cap", 1, { shouldValidate: true })
    }
  }, [danhMucChaId, setValue])
  
  // Reset loai_id khi hang_muc thay đổi
  useEffect(() => {
    if (hangMuc && loaiId) {
      const selectedLoai = loaiTaiLieuList.find(item => item.id === Number(loaiId))
      if (selectedLoai && selectedLoai.hang_muc !== hangMuc) {
        setValue("loai_id", "", { shouldValidate: false })
        onLoaiIdChange(null)
      }
    }
  }, [hangMuc, loaiId, loaiTaiLieuList, setValue, onLoaiIdChange])
  
  // Reset danh_muc_cha_id khi hang_muc hoặc loai_id thay đổi
  useEffect(() => {
    if (danhMucChaId && (hangMuc || loaiId)) {
      const selectedDanhMucCha = danhMucTaiLieuList.find(item => item.id === Number(danhMucChaId))
      if (selectedDanhMucCha) {
        if (selectedDanhMucCha.hang_muc !== hangMuc || 
            (loaiId && selectedDanhMucCha.loai_id !== Number(loaiId))) {
          setValue("danh_muc_cha_id", "", { shouldValidate: false })
        }
      }
    }
  }, [hangMuc, loaiId, danhMucChaId, danhMucTaiLieuList, setValue])

  // Auto-complete: Tự động điền ten_danh_muc_cha khi chọn danh_muc_cha_id
  useEffect(() => {
    if (danhMucChaId) {
      const danhMucCha = danhMucTaiLieuList.find(item => item.id === Number(danhMucChaId))
      if (danhMucCha) {
        setValue("ten_danh_muc_cha", danhMucCha.ten_danh_muc || null, { shouldValidate: false, shouldDirty: false })
      }
    } else {
      setValue("ten_danh_muc_cha", null, { shouldValidate: false, shouldDirty: false })
    }
  }, [danhMucChaId, danhMucTaiLieuList, setValue])

  return null
}

export function DanhMucTaiLieuFormView({ id, onComplete, onCancel }: DanhMucTaiLieuFormViewProps) {
  const createMutation = useCreateDanhMucTaiLieu()
  const updateMutation = useUpdateDanhMucTaiLieu()
  const { employee: currentEmployee } = useAuthStore()
  
  const isEditMode = !!id
  const { data: existingData, isLoading } = useDanhMucTaiLieuById(id || 0, undefined)
  
  // Load loai tài liệu và danh mục tài liệu
  const { data: loaiTaiLieuList = [] } = useLoaiTaiLieu()
  const { data: danhMucTaiLieuList = [] } = useDanhMucTaiLieu()
  
  // Đọc query params để pre-fill form khi thêm danh mục con
  const [searchParams] = useSearchParams()
  const parentIdFromQuery = searchParams.get("danh_muc_cha_id")
  const hangMucFromQuery = searchParams.get("hang_muc")
  const loaiIdFromQuery = searchParams.get("loai_id")

  // State để track hang_muc được chọn (để filter loai_id)
  const [selectedHangMuc, setSelectedHangMuc] = useState<string | null>(
    existingData?.hang_muc || hangMucFromQuery || null
  )
  const [selectedLoaiId, setSelectedLoaiId] = useState<number | null>(
    existingData?.loai_id || (loaiIdFromQuery ? Number(loaiIdFromQuery) : null)
  )
  
  // Filter loai tài liệu theo hang_muc
  const loaiTaiLieuOptions = useMemo(() => {
    if (!selectedHangMuc) return []
    
    return loaiTaiLieuList
      .filter(item => item.id && item.hang_muc === selectedHangMuc)
      .map(item => ({
        label: item.loai || item.hang_muc || `ID: ${item.id}`,
        value: item.id!.toString()
      }))
  }, [loaiTaiLieuList, selectedHangMuc])
  
  // Danh mục cha options (chỉ cấp 1, cùng hang_muc và loai_id, không phải chính nó)
  const danhMucChaOptions = useMemo(() => {
    if (!selectedHangMuc || !selectedLoaiId) return []
    
    return danhMucTaiLieuList
      .filter(item => 
        item.id && 
        item.cap === 1 && 
        item.hang_muc === selectedHangMuc &&
        item.loai_id === selectedLoaiId &&
        (isEditMode ? item.id !== id : true) // Validation: không cho chọn chính nó
      )
      .map(item => ({
        label: item.ten_danh_muc || `ID: ${item.id}`,
        value: item.id!.toString()
      }))
  }, [danhMucTaiLieuList, selectedHangMuc, selectedLoaiId, isEditMode, id])

  const getSections = (): FormSection[] => [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { 
          name: "hang_muc", 
          label: "Hạng Mục", 
          type: "toggle",
          required: true,
          options: [
            { label: "Biểu mẫu & Kế hoạch", value: "Biểu mẫu & Kế hoạch" },
            { label: "Văn bản hệ thống", value: "Văn bản hệ thống" },
          ],
        },
        { 
          name: "loai_id", 
          label: "Loại Tài Liệu", 
          type: "select",
          options: loaiTaiLieuOptions,
          required: true,
          placeholder: "Chọn loại tài liệu",
          disabled: !selectedHangMuc,
        },
        { 
          name: "ten_danh_muc", 
          label: "Tên Danh Mục", 
          required: true,
          placeholder: "Nhập tên danh mục" 
        },
        { 
          name: "danh_muc_cha_id", 
          label: "Danh Mục Cha", 
          type: "select",
          options: danhMucChaOptions,
          placeholder: "Chọn danh mục cha",
          disabled: !selectedHangMuc || !selectedLoaiId,
        },
        { 
          name: "mo_ta", 
          label: "Mô Tả", 
          type: "textarea", 
          placeholder: "Nhập mô tả" 
        },
      ]
    },
  ]

  const sections = useMemo(() => getSections(), [loaiTaiLieuOptions, danhMucChaOptions, selectedHangMuc, selectedLoaiId])

  const formDefaultValues = useMemo(() => {
    if (isEditMode && existingData) {
      return {
        hang_muc: existingData.hang_muc || "",
        loai_id: existingData.loai_id ? existingData.loai_id.toString() : "",
        danh_muc_cha_id: existingData.danh_muc_cha_id ? existingData.danh_muc_cha_id.toString() : "",
        cap: existingData.cap !== null && existingData.cap !== undefined ? existingData.cap.toString() : "1",
        ten_danh_muc: existingData.ten_danh_muc || "",
        mo_ta: existingData.mo_ta || "",
      }
    }

    // Pre-fill từ query params khi thêm danh mục con
    if (parentIdFromQuery && hangMucFromQuery && loaiIdFromQuery) {
      return {
        hang_muc: hangMucFromQuery,
        loai_id: loaiIdFromQuery,
        danh_muc_cha_id: parentIdFromQuery,
        cap: "2", // Tự động là cấp 2 khi có danh mục cha
        ten_danh_muc: "",
        mo_ta: "",
      }
    }

    return {
      hang_muc: "",
      loai_id: "",
      danh_muc_cha_id: "",
      cap: "1",
      ten_danh_muc: "",
      mo_ta: "",
    }
  }, [isEditMode, existingData, parentIdFromQuery, hangMucFromQuery, loaiIdFromQuery])

  const handleSubmit = async (data: any) => {
    const nguoiTaoId = currentEmployee?.ma_nhan_vien
    if (!nguoiTaoId) {
      throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
    }

    // Tìm ten_danh_muc_cha từ danh_muc_cha_id
    let tenDanhMucCha: string | null = null
    if (data.danh_muc_cha_id) {
      const danhMucCha = danhMucTaiLieuList.find(
        item => item.id === Number(data.danh_muc_cha_id)
      )
      tenDanhMucCha = danhMucCha?.ten_danh_muc || null
    }

    // Tự động tính cap
    const cap = data.danh_muc_cha_id ? 2 : 1

    // Data đã được transform từ formSchema, nên loai_id và danh_muc_cha_id đã là number
    if (isEditMode && id) {
      const updateData: UpdateDanhMucTaiLieuInput = {
        hang_muc: data.hang_muc,
        loai_id: data.loai_id as number,
        cap: cap,
        danh_muc_cha_id: (data.danh_muc_cha_id as number | null) || null,
        ten_danh_muc_cha: tenDanhMucCha,
        ten_danh_muc: data.ten_danh_muc, // Bắt buộc, không được null
        mo_ta: data.mo_ta || null,
      }
      await updateMutation.mutateAsync({ id, input: updateData })
    } else {
      const createData: CreateDanhMucTaiLieuInput = {
        hang_muc: data.hang_muc,
        loai_id: data.loai_id as number,
        cap: cap,
        danh_muc_cha_id: (data.danh_muc_cha_id as number | null) || null,
        ten_danh_muc_cha: tenDanhMucCha,
        ten_danh_muc: data.ten_danh_muc, // Bắt buộc, không được null
        mo_ta: data.mo_ta || null,
        nguoi_tao_id: nguoiTaoId,
      }
      await createMutation.mutateAsync(createData)
    }
  }

  // Form schema: chấp nhận string từ select và tự động convert sang number
  const formSchema = useMemo(() => {
    const baseSchema = danhMucTaiLieuSchema.omit({ 
      id: true, 
      tg_tao: true, 
      tg_cap_nhat: true, 
      nguoi_tao_id: true, 
      nguoi_tao_ten: true, 
      loai_tai_lieu: true 
    })

    return baseSchema.extend({
      loai_id: z.union([z.string().min(1, "Loại tài liệu là bắt buộc"), z.number()]).transform((val: string | number) => {
        if (typeof val === "string") {
          const num = Number(val)
          if (isNaN(num) || num < 1) {
            throw new Error("Loại tài liệu không hợp lệ")
          }
          return num
        }
        return val
      }),
      danh_muc_cha_id: z.union([z.string(), z.number(), z.null()]).optional().nullable().transform((val: string | number | null | undefined) => {
        if (val === "" || val === null || val === undefined) return null
        if (typeof val === "string") {
          const num = Number(val)
          return isNaN(num) ? null : num
        }
        return val
      }),
      cap: z.union([z.string(), z.number()]).transform((val: string | number) => {
        const num = typeof val === "string" ? Number(val) : val
        if (isNaN(num) || num < 1 || num > 2) {
          throw new Error("Cấp chỉ có thể là 1 hoặc 2")
        }
        return num
      }),
    })
  }, [])

  if (isEditMode && isLoading && !existingData) {
    return (
      <GenericFormView
        title="Đang tải..."
        subtitle=""
        schema={formSchema}
        sections={sections}
        defaultValues={{}}
        onSubmit={handleSubmit}
        onSuccess={onComplete}
        onCancel={onCancel}
      />
    )
  }

  return (
    <GenericFormView
      title={isEditMode ? "Sửa Danh Mục Tài Liệu" : "Thêm Mới Danh Mục Tài Liệu"}
      subtitle={isEditMode ? "Cập nhật thông tin danh mục tài liệu" : "Tạo danh mục tài liệu mới vào hệ thống"}
      schema={formSchema}
      sections={sections}
      defaultValues={formDefaultValues}
      onSubmit={handleSubmit}
      onSuccess={onComplete}
      onCancel={onCancel}
      successMessage={isEditMode ? "Cập nhật danh mục tài liệu thành công" : "Thêm mới danh mục tài liệu thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật danh mục tài liệu" : "Có lỗi xảy ra khi thêm mới danh mục tài liệu"}
    >
      <FormFieldWatcherWrapper
        loaiTaiLieuList={loaiTaiLieuList}
        danhMucTaiLieuList={danhMucTaiLieuList}
        onHangMucChange={setSelectedHangMuc}
        onLoaiIdChange={setSelectedLoaiId}
      />
    </GenericFormView>
  )
}

