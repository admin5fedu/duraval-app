"use client"

import { GenericFormView, type FormSection } from "@/shared/components"
import { taiLieuBieuMauSchema } from "../schema"
import type { CreateTaiLieuBieuMauInput, UpdateTaiLieuBieuMauInput } from "../types"
import { useCreateTaiLieuBieuMau, useUpdateTaiLieuBieuMau } from "../hooks"
import { useTaiLieuBieuMauById } from "../hooks"
import { taiLieuBieuMauConfig } from "../config"
import { useMemo, useState, useEffect } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useLoaiTaiLieu } from "@/features/cong-viec/tai-lieu/loai-tai-lieu/hooks"
import { useDanhMucTaiLieu } from "@/features/cong-viec/tai-lieu/danh-muc-tai-lieu/hooks"
import { useFormContext } from "react-hook-form"
import { z } from "zod"
import { useSearchParams, useNavigate } from "react-router-dom"

interface TaiLieuBieuMauFormViewProps {
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
  onDanhMucIdChange,
}: {
  loaiTaiLieuList: any[]
  danhMucTaiLieuList: any[]
  onHangMucChange: (value: string | null) => void
  onLoaiIdChange: (value: number | null) => void
  onDanhMucIdChange: (value: number | null) => void
}) {
  const form = useFormContext()
  const { watch, setValue } = form
  const hangMuc = watch("hang_muc")
  const loaiId = watch("loai_id")
  const danhMucId = watch("danh_muc_id")
  const danhMucChaId = watch("danh_muc_cha_id")
  
  // Update state khi hang_muc thay đổi
  useEffect(() => {
    onHangMucChange(hangMuc || null)
  }, [hangMuc, onHangMucChange])
  
  // Update state khi loai_id thay đổi
  useEffect(() => {
    onLoaiIdChange(loaiId ? Number(loaiId) : null)
  }, [loaiId, onLoaiIdChange])
  
  // Update state khi danh_muc_id thay đổi
  useEffect(() => {
    onDanhMucIdChange(danhMucId ? Number(danhMucId) : null)
  }, [danhMucId, onDanhMucIdChange])
  
  // Reset loai_id khi hang_muc thay đổi
  useEffect(() => {
    if (hangMuc && loaiId) {
      const selectedLoai = loaiTaiLieuList.find(item => item.id === Number(loaiId))
      if (selectedLoai && selectedLoai.hang_muc !== hangMuc) {
        setValue("loai_id", "", { shouldValidate: false })
        setValue("ten_loai", null, { shouldValidate: false, shouldDirty: false })
        setValue("danh_muc_id", "", { shouldValidate: false })
        setValue("ten_danh_muc", "", { shouldValidate: false, shouldDirty: false })
        setValue("danh_muc_cha_id", "", { shouldValidate: false })
        setValue("ten_danh_muc_cha", null, { shouldValidate: false, shouldDirty: false })
      }
    }
  }, [hangMuc, loaiId, loaiTaiLieuList, setValue])
  
  // Reset danh_muc_id khi hang_muc hoặc loai_id thay đổi
  useEffect(() => {
    if (danhMucId && (hangMuc || loaiId)) {
      const selectedDanhMuc = danhMucTaiLieuList.find(item => item.id === Number(danhMucId))
      if (selectedDanhMuc) {
        if (selectedDanhMuc.hang_muc !== hangMuc || 
            (loaiId && selectedDanhMuc.loai_id !== Number(loaiId))) {
          setValue("danh_muc_id", "", { shouldValidate: false })
          setValue("ten_danh_muc", "", { shouldValidate: false, shouldDirty: false })
          setValue("danh_muc_cha_id", "", { shouldValidate: false })
          setValue("ten_danh_muc_cha", null, { shouldValidate: false, shouldDirty: false })
        }
      }
    }
  }, [hangMuc, loaiId, danhMucId, danhMucTaiLieuList, setValue])
  
  // Auto-complete: Tự động điền ten_loai khi chọn loai_id
  useEffect(() => {
    if (loaiId) {
      const loai = loaiTaiLieuList.find(item => item.id === Number(loaiId))
      if (loai) {
        setValue("ten_loai", loai.loai || null, { shouldValidate: false, shouldDirty: false })
      }
    } else {
      setValue("ten_loai", null, { shouldValidate: false, shouldDirty: false })
    }
  }, [loaiId, loaiTaiLieuList, setValue])
  
  // Auto-complete: ten_danh_muc là text (tên danh mục), lấy từ danh_muc_id
  useEffect(() => {
    if (danhMucId) {
      const danhMuc = danhMucTaiLieuList.find(item => item.id === Number(danhMucId))
      if (danhMuc) {
        // ten_danh_muc là text, lấy ten_danh_muc từ danh mục tài liệu
        setValue("ten_danh_muc", danhMuc.ten_danh_muc || null, { shouldValidate: false, shouldDirty: false })
        // Also set danh_muc_cha_id and ten_danh_muc_cha if available
        if (danhMuc.danh_muc_cha_id) {
          setValue("danh_muc_cha_id", danhMuc.danh_muc_cha_id, { shouldValidate: false, shouldDirty: false })
          setValue("ten_danh_muc_cha", danhMuc.ten_danh_muc_cha || null, { shouldValidate: false, shouldDirty: false })
        }
      }
    } else {
      setValue("ten_danh_muc", null, { shouldValidate: false, shouldDirty: false })
    }
  }, [danhMucId, danhMucTaiLieuList, setValue])
  
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

export function TaiLieuBieuMauFormView({ id, onComplete, onCancel }: TaiLieuBieuMauFormViewProps) {
  const createMutation = useCreateTaiLieuBieuMau()
  const updateMutation = useUpdateTaiLieuBieuMau()
  const { employee: currentEmployee } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get("returnTo") || "list"
  
  const isEditMode = !!id
  const { data: existingData, isLoading } = useTaiLieuBieuMauById(id || 0, undefined)
  
  // Load loai tài liệu và danh mục tài liệu
  const { data: loaiTaiLieuList = [] } = useLoaiTaiLieu()
  const { data: danhMucTaiLieuList = [] } = useDanhMucTaiLieu()
  
  // State để track hang_muc được chọn (để filter loai_id và danh_muc_id)
  const [selectedHangMuc, setSelectedHangMuc] = useState<string | null>(
    existingData?.hang_muc || null
  )
  const [selectedLoaiId, setSelectedLoaiId] = useState<number | null>(
    existingData?.loai_id || null
  )
  const [_selectedDanhMucId, setSelectedDanhMucId] = useState<number | null>(
    existingData?.danh_muc_id || null
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
  
  // Filter danh mục tài liệu theo hang_muc và loai_id
  const danhMucOptions = useMemo(() => {
    if (!selectedHangMuc || !selectedLoaiId) return []
    
    return danhMucTaiLieuList
      .filter(item => 
        item.id && 
        item.hang_muc === selectedHangMuc &&
        item.loai_id === selectedLoaiId
      )
      .map(item => ({
        label: item.ten_danh_muc || `ID: ${item.id}`,
        value: item.id!.toString()
      }))
  }, [danhMucTaiLieuList, selectedHangMuc, selectedLoaiId])
  
  // Danh mục cha options (chỉ cấp 1, cùng hang_muc và loai_id)
  const danhMucChaOptions = useMemo(() => {
    if (!selectedHangMuc || !selectedLoaiId) return []
    
    return danhMucTaiLieuList
      .filter(item => 
        item.id && 
        item.cap === 1 && 
        item.hang_muc === selectedHangMuc &&
        item.loai_id === selectedLoaiId
      )
      .map(item => ({
        label: item.ten_danh_muc || `ID: ${item.id}`,
        value: item.id!.toString()
      }))
  }, [danhMucTaiLieuList, selectedHangMuc, selectedLoaiId])

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
          required: true,
          options: loaiTaiLieuOptions,
          placeholder: "Chọn loại tài liệu",
          disabled: !selectedHangMuc,
        },
        { 
          name: "danh_muc_id", 
          label: "Danh Mục", 
          type: "select",
          required: true,
          options: danhMucOptions,
          placeholder: "Chọn danh mục",
          disabled: !selectedHangMuc || !selectedLoaiId,
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
          name: "ma_tai_lieu", 
          label: "Mã Tài Liệu", 
          placeholder: "Nhập mã tài liệu" 
        },
        { 
          name: "ten_tai_lieu", 
          label: "Tên Tài Liệu", 
          placeholder: "Nhập tên tài liệu",
          required: true
        },
        { 
          name: "mo_ta", 
          label: "Mô Tả", 
          type: "textarea",
          placeholder: "Nhập mô tả tài liệu" 
        },
        { 
          name: "tai_lieu_cha_id", 
          label: "Tài Liệu Cha ID", 
          type: "number",
          placeholder: "Nhập ID tài liệu cha" 
        },
        { 
          name: "trang_thai", 
          label: "Trạng Thái", 
          type: "toggle",
          required: true,
          options: [
            { label: "Dự thảo", value: "Dự thảo" },
            { label: "Chờ duyệt", value: "Chờ duyệt" },
            { label: "Hiệu lực", value: "Hiệu lực" },
            { label: "Từ chối", value: "Từ chối" },
            { label: "Lỗi thời", value: "Lỗi thời" },
            { label: "Đang sửa", value: "Đang sửa" },
            { label: "Hủy", value: "Hủy" },
          ],
        },
      ]
    },
    {
      title: "Liên Kết",
      fields: [
        { 
          name: "link_du_thao", 
          label: "Link Dự Thảo", 
          type: "text",
          placeholder: "Nhập link dự thảo" 
        },
        { 
          name: "link_ap_dung", 
          label: "Link Áp Dụng", 
          type: "text",
          placeholder: "Nhập link áp dụng" 
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
          placeholder: "Nhập ghi chú" 
        },
        { 
          name: "phan_phoi_pb_id", 
          label: "Phân Phối Phòng Ban ID", 
          type: "number",
          placeholder: "Nhập ID phân phối phòng ban" 
        },
      ]
    },
  ]

  const sections = useMemo(() => getSections(), [loaiTaiLieuOptions, danhMucOptions, danhMucChaOptions, selectedHangMuc, selectedLoaiId])

  const formDefaultValues = useMemo(() => {
    if (isEditMode && existingData) {
      return {
        hang_muc: existingData.hang_muc || "",
        loai_id: existingData.loai_id ? existingData.loai_id.toString() : "",
        danh_muc_id: existingData.danh_muc_id ? existingData.danh_muc_id.toString() : "",
        danh_muc_cha_id: existingData.danh_muc_cha_id ? existingData.danh_muc_cha_id.toString() : "",
        ma_tai_lieu: existingData.ma_tai_lieu || "",
        ten_tai_lieu: existingData.ten_tai_lieu || "",
        mo_ta: existingData.mo_ta || "",
        link_du_thao: existingData.link_du_thao || "",
        link_ap_dung: existingData.link_ap_dung || "",
        ghi_chu: existingData.ghi_chu || "",
        trang_thai: existingData.trang_thai || "Dự thảo",
        tai_lieu_cha_id: existingData.tai_lieu_cha_id ? existingData.tai_lieu_cha_id.toString() : "",
        phan_phoi_pb_id: existingData.phan_phoi_pb_id ? existingData.phan_phoi_pb_id.toString() : "",
      }
    }

    return {
      hang_muc: "",
      loai_id: "",
      danh_muc_id: "",
      danh_muc_cha_id: "",
      ma_tai_lieu: "",
      ten_tai_lieu: "",
      mo_ta: "",
      link_du_thao: "",
      link_ap_dung: "",
      ghi_chu: "",
      trang_thai: "Dự thảo",
      phan_phoi_pb_id: "",
      tai_lieu_cha_id: "",
    }
  }, [isEditMode, existingData])

  const handleSubmit = async (data: any) => {
    const nguoiTaoId = currentEmployee?.ma_nhan_vien
    if (!nguoiTaoId) {
      throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.")
    }

    // Tìm ten_loai từ loai_id
    let tenLoai: string | null = null
    if (data.loai_id) {
      const loai = loaiTaiLieuList.find(
        item => item.id === Number(data.loai_id)
      )
      tenLoai = loai?.loai || null
    }

    // ten_danh_muc là text (tên danh mục), lấy từ danh_muc_id
    let tenDanhMuc: string | null = null
    if (data.danh_muc_id) {
      const danhMuc = danhMucTaiLieuList.find(item => item.id === Number(data.danh_muc_id))
      tenDanhMuc = danhMuc?.ten_danh_muc || null
    }

    // Tìm ten_danh_muc_cha từ danh_muc_cha_id
    let tenDanhMucCha: string | null = null
    if (data.danh_muc_cha_id) {
      const danhMucCha = danhMucTaiLieuList.find(
        item => item.id === Number(data.danh_muc_cha_id)
      )
      tenDanhMucCha = danhMucCha?.ten_danh_muc || null
    }

    // Data đã được transform từ formSchema, nên các ID đã là number
    if (isEditMode && id) {
      const updateData: UpdateTaiLieuBieuMauInput = {
        hang_muc: data.hang_muc || null,
        loai_id: data.loai_id ? (data.loai_id as number) : undefined,
        ten_loai: tenLoai,
        danh_muc_id: data.danh_muc_id ? (data.danh_muc_id as number) : undefined,
        ten_danh_muc: tenDanhMuc,
        danh_muc_cha_id: data.danh_muc_cha_id ? (data.danh_muc_cha_id as number) : null,
        ten_danh_muc_cha: tenDanhMucCha,
        ma_tai_lieu: data.ma_tai_lieu || null,
        ten_tai_lieu: data.ten_tai_lieu || null,
        mo_ta: data.mo_ta || null,
        link_du_thao: data.link_du_thao || null,
        link_ap_dung: data.link_ap_dung || null,
        ghi_chu: data.ghi_chu || null,
        trang_thai: data.trang_thai || null,
        phan_phoi_pb_id: data.phan_phoi_pb_id ? Number(data.phan_phoi_pb_id) : undefined,
        tai_lieu_cha_id: data.tai_lieu_cha_id ? Number(data.tai_lieu_cha_id) : undefined,
      }
      await updateMutation.mutateAsync({ id, input: updateData })
    } else {
      const createData: CreateTaiLieuBieuMauInput = {
        hang_muc: data.hang_muc || null,
        loai_id: (data.loai_id as number),
        ten_loai: tenLoai,
        danh_muc_id: (data.danh_muc_id as number),
        ten_danh_muc: tenDanhMuc,
        danh_muc_cha_id: data.danh_muc_cha_id ? (data.danh_muc_cha_id as number) : null,
        ten_danh_muc_cha: tenDanhMucCha,
        ma_tai_lieu: data.ma_tai_lieu || null,
        ten_tai_lieu: data.ten_tai_lieu || null,
        mo_ta: data.mo_ta || null,
        link_du_thao: data.link_du_thao || null,
        link_ap_dung: data.link_ap_dung || null,
        ghi_chu: data.ghi_chu || null,
        trang_thai: data.trang_thai || null,
        phan_phoi_pb_id: data.phan_phoi_pb_id ? Number(data.phan_phoi_pb_id) : undefined,
        tai_lieu_cha_id: data.tai_lieu_cha_id ? Number(data.tai_lieu_cha_id) : undefined,
        nguoi_tao_id: nguoiTaoId,
      }
      await createMutation.mutateAsync(createData)
    }
  }

  // Form schema: chấp nhận string từ select và tự động convert sang number
  const formSchema = useMemo(() => {
    const baseSchema = taiLieuBieuMauSchema.omit({ 
      id: true, 
      tg_tao: true, 
      tg_cap_nhat: true, 
      nguoi_tao_id: true, 
      nguoi_tao_ten: true,
      ten_loai: true,
      ten_danh_muc: true,
      ten_danh_muc_cha: true,
      trao_doi: true,
    })

    return baseSchema.extend({
      hang_muc: z.string().min(1, "Hạng mục là bắt buộc"),
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
      danh_muc_id: z.union([z.string().min(1, "Danh mục là bắt buộc"), z.number()]).transform((val: string | number) => {
        if (typeof val === "string") {
          const num = Number(val)
          if (isNaN(num) || num < 1) {
            throw new Error("Danh mục không hợp lệ")
          }
          return num
        }
        return val
      }),
      trang_thai: z.string().min(1, "Trạng thái là bắt buộc"),
      // URL validation: cho phép empty string hoặc valid URL
      link_du_thao: z.union([
        z.string().url("Link dự thảo phải là URL hợp lệ (ví dụ: https://example.com)"),
        z.literal(""),
        z.null()
      ]).optional().nullable().transform((val) => val === "" ? null : val),
      link_ap_dung: z.union([
        z.string().url("Link áp dụng phải là URL hợp lệ (ví dụ: https://example.com)"),
        z.literal(""),
        z.null()
      ]).optional().nullable().transform((val) => val === "" ? null : val),
      danh_muc_cha_id: z.union([z.string(), z.number(), z.null()]).optional().nullable().transform((val: string | number | null | undefined) => {
        if (val === "" || val === null || val === undefined) return null
        if (typeof val === "string") {
          const num = Number(val)
          return isNaN(num) ? null : num
        }
        return val
      }),
      phan_phoi_pb_id: z.union([z.string(), z.number(), z.null()]).optional().nullable().transform((val: string | number | null | undefined) => {
        if (val === "" || val === null || val === undefined) return null
        if (typeof val === "string") {
          const num = Number(val)
          return isNaN(num) ? null : num
        }
        return val
      }),
      tai_lieu_cha_id: z.union([z.string(), z.number(), z.null()]).optional().nullable().transform((val: string | number | null | undefined) => {
        if (val === "" || val === null || val === undefined) return null
        if (typeof val === "string") {
          const num = Number(val)
          return isNaN(num) ? null : num
        }
        return val
      }),
      ma_tai_lieu: z.string().optional().nullable(),
      ten_tai_lieu: z.string().min(1, "Tên tài liệu là bắt buộc").nullable(),
      mo_ta: z.string().optional().nullable(),
      ghi_chu: z.string().optional().nullable(),
    })
  }, [])

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      // Fallback to default navigation
      const cancelUrl = returnTo === 'list' 
        ? taiLieuBieuMauConfig.routePath
        : (id ? `${taiLieuBieuMauConfig.routePath}/${id}` : taiLieuBieuMauConfig.routePath)
      navigate(cancelUrl)
    }
  }

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
        onCancel={handleCancel}
      />
    )
  }

  return (
    <GenericFormView
      title={isEditMode ? "Sửa Tài Liệu & Biểu Mẫu" : "Thêm Mới Tài Liệu & Biểu Mẫu"}
      subtitle={isEditMode ? "Cập nhật thông tin tài liệu & biểu mẫu" : "Tạo tài liệu & biểu mẫu mới vào hệ thống"}
      schema={formSchema}
      sections={sections}
      defaultValues={formDefaultValues}
      onSubmit={handleSubmit}
      onSuccess={onComplete}
      onCancel={handleCancel}
      successMessage={isEditMode ? "Cập nhật tài liệu & biểu mẫu thành công" : "Thêm mới tài liệu & biểu mẫu thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật tài liệu & biểu mẫu" : "Có lỗi xảy ra khi thêm mới tài liệu & biểu mẫu"}
    >
      <FormFieldWatcherWrapper
        loaiTaiLieuList={loaiTaiLieuList}
        danhMucTaiLieuList={danhMucTaiLieuList}
        onHangMucChange={setSelectedHangMuc}
        onLoaiIdChange={setSelectedLoaiId}
        onDanhMucIdChange={setSelectedDanhMucId}
      />
    </GenericFormView>
  )
}

