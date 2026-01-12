"use client"

import * as React from "react"
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components/forms/generic-form-view"
import { xetDuyetKhachBuonConfig } from "../config"
import { xetDuyetKhachBuonSchema, type CreateXetDuyetKhachBuonInput, type UpdateXetDuyetKhachBuonInput } from "../schema"
import { useXetDuyetKhachBuonById, useCreateXetDuyetKhachBuon, useUpdateXetDuyetKhachBuon } from "../hooks/use-xet-duyet-khach-buon"
import { useFormNavigation } from "@/hooks/use-form-navigation"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useGiaiDoanKhachBuon } from "@/features/ban-buon/thiet-lap-khach-buon/giai-doan-khach-buon/hooks/use-giai-doan-khach-buon"
import { useTrangThaiKhachBuon } from "@/features/ban-buon/thiet-lap-khach-buon/trang-thai-khach-buon/hooks/use-trang-thai-khach-buon"
import { useDanhSachKBById } from "@/features/ban-buon/thong-tin-khach-hang/du-lieu-khach-buon/danh-sach-KB/hooks/use-danh-sach-KB"
import { useWatch, useFormContext } from "react-hook-form"

interface XetDuyetKhachBuonFormViewProps {
  id?: number
  onComplete?: () => void
  onCancel?: () => void
}

const getSections = (
  giaiDoanOptions: Array<{ label: string; value: string }>,
  trangThaiOptions: Array<{ label: string; value: string }>
): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      {
        name: "khach_buon_id",
        label: "Khách Buôn",
        type: "khach-buon-select",
        required: true,
      },
      {
        name: "ngay",
        label: "Ngày",
        type: "date",
        required: true,
      },
      {
        name: "muc_dang_ky_id",
        label: "Mức Đăng Ký",
        type: "muc-dang-ky-select",
        required: true,
      },
      {
        name: "giai_doan_id",
        label: "Giai Đoạn",
        type: "select",
        required: true,
        options: giaiDoanOptions,
      },
      {
        name: "trang_thai_id",
        label: "Trạng Thái",
        type: "select",
        required: true,
        options: trangThaiOptions,
      },
    ]
  },
  {
    title: "Thông Tin Địa Lý",
    fields: [
      {
        name: "tsn_tinh_thanh_id",
        label: "Tỉnh Thành TSN",
        type: "tinh-thanh-tsn-select",
        // Cho phép sửa, tự động lấy từ khách buôn khi tạo mới
      },
      {
        name: "ssn_tinh_thanh_id",
        label: "Tỉnh Thành SSN",
        type: "tinh-thanh-ssn-select",
        // Cho phép sửa, tự động lấy từ khách buôn khi tạo mới
      },
    ]
  },
  {
    title: "Thông Tin Doanh Số",
    fields: [
      {
        name: "doanh_so_min_quy",
        label: "Doanh Số Min Quý",
        type: "number",
        required: true,
        formatThousands: false,
      },
      {
        name: "doanh_so_max_quy",
        label: "Doanh Số Max Quý",
        type: "number",
        required: true,
        formatThousands: false,
      },
      {
        name: "doanh_so_min_nam",
        label: "Doanh Số Min Năm",
        type: "number",
        required: true,
        formatThousands: false,
      },
      {
        name: "doanh_so_max_nam",
        label: "Doanh Số Max Năm",
        type: "number",
        required: true,
        formatThousands: false,
      },
    ]
  },
  {
    title: "Thông Tin Bổ Sung",
    fields: [
      {
        name: "ngay_ap_dung",
        label: "Ngày Áp Dụng",
        type: "date",
        required: true,
      },
      {
        name: "link_hop_dong",
        label: "Link Hợp Đồng",
        type: "text",
      },
      {
        name: "file_hop_dong",
        label: "File Hợp Đồng",
        type: "text",
      },
      { name: "ghi_chu", label: "Ghi Chú", type: "textarea", colSpan: 2 },
    ]
  },
]

export function XetDuyetKhachBuonFormView({ id, onComplete, onCancel }: XetDuyetKhachBuonFormViewProps) {
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { employee } = useAuthStore()
  
  // Lấy copiedData từ state (nếu có)
  const copiedData = (location.state as any)?.copiedData
  
  const formId = id ?? (params.id && params.id !== "moi" ? Number(params.id) : undefined)
  const isEditMode = !!formId

  // Fetch existing data if editing (hook will be disabled if formId is undefined/0)
  const query = useXetDuyetKhachBuonById(formId ?? 0, undefined)
  const viewState = useDetailViewStateFromQuery(query, undefined)
  const existingData = viewState.data

  const createMutation = useCreateXetDuyetKhachBuon()
  const updateMutation = useUpdateXetDuyetKhachBuon()

  // Fetch giai doan and trang thai data
  const { data: giaiDoanList } = useGiaiDoanKhachBuon()
  const { data: trangThaiList } = useTrangThaiKhachBuon()

  // Create options for select fields
  const giaiDoanOptions = React.useMemo(() => {
    if (!giaiDoanList) return []
    return giaiDoanList.map(item => ({
      label: `${item.ma_giai_doan} - ${item.ten_giai_doan}`,
      value: String(item.id),
    }))
  }, [giaiDoanList])

  // Trang thai options sẽ được filter theo giai_doan_id được chọn
  // Sẽ được cập nhật trong component KhachBuonWatcher
  const [filteredTrangThaiOptions, setFilteredTrangThaiOptions] = React.useState<Array<{ label: string; value: string }>>([])

  // Initialize trang thai options (tất cả hoặc filter theo giai_doan_id nếu có)
  React.useEffect(() => {
    if (!trangThaiList) {
      setFilteredTrangThaiOptions([])
      return
    }
    // Ban đầu hiển thị tất cả, sẽ được filter khi có giai_doan_id
    setFilteredTrangThaiOptions(
      trangThaiList.map(item => ({
        label: `${item.ma_trang_thai} - ${item.ten_trang_thai}`,
        value: String(item.id),
      }))
    )
  }, [trangThaiList])

  // Get form schema - ẩn các field không cần trong form
  const formSchema = xetDuyetKhachBuonSchema.omit({ 
    id: true, 
    tg_tao: true, 
    tg_cap_nhat: true,
    tg_quan_ly_duyet: true,
    tg_bgd_duyet: true,
    ten_khach_buon: true,
    ten_quan_ly: true,
    ten_bgd: true,
    ten_nguoi_tao: true,
    ma_nguoi_tao: true,
    tsn_ten_tinh_thanh: true,
    ssn_ten_tinh_thanh: true,
    ten_muc_dang_ky: true,
    ten_giai_doan: true,
    ten_trang_thai: true,
    trang_thai: true, // Ẩn trong form
    quan_ly_duyet: true, // Ẩn trong form
    quan_ly_id: true, // Ẩn trong form
    bgd_duyet: true, // Ẩn trong form
    bgd_id: true, // Ẩn trong form
  })

  // Helper function to get today's date
  const getTodayDate = (): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Helper function to get first day of current month
  const getFirstDayOfMonth = (): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}-01`
  }

  // Prepare default values
  const defaultValues = React.useMemo(() => {
    // Nếu có copiedData
    if (copiedData && !isEditMode) {
      return {
        khach_buon_id: copiedData.khach_buon_id ? String(copiedData.khach_buon_id) : null,
        ngay: copiedData.ngay ? String(copiedData.ngay) : getTodayDate(),
        muc_dang_ky_id: copiedData.muc_dang_ky_id ? String(copiedData.muc_dang_ky_id) : null,
        tsn_tinh_thanh_id: copiedData.tsn_tinh_thanh_id ? String(copiedData.tsn_tinh_thanh_id) : null,
        ssn_tinh_thanh_id: copiedData.ssn_tinh_thanh_id ? String(copiedData.ssn_tinh_thanh_id) : null,
        doanh_so_min_quy: copiedData.doanh_so_min_quy !== null && copiedData.doanh_so_min_quy !== undefined ? String(copiedData.doanh_so_min_quy) : "",
        doanh_so_max_quy: copiedData.doanh_so_max_quy !== null && copiedData.doanh_so_max_quy !== undefined ? String(copiedData.doanh_so_max_quy) : "",
        doanh_so_min_nam: copiedData.doanh_so_min_nam !== null && copiedData.doanh_so_min_nam !== undefined ? String(copiedData.doanh_so_min_nam) : "",
        doanh_so_max_nam: copiedData.doanh_so_max_nam !== null && copiedData.doanh_so_max_nam !== undefined ? String(copiedData.doanh_so_max_nam) : "",
        ngay_ap_dung: copiedData.ngay_ap_dung ? String(copiedData.ngay_ap_dung) : getFirstDayOfMonth(),
        giai_doan_id: copiedData.giai_doan_id ? String(copiedData.giai_doan_id) : null,
        trang_thai_id: copiedData.trang_thai_id ? String(copiedData.trang_thai_id) : null,
        link_hop_dong: copiedData.link_hop_dong ? String(copiedData.link_hop_dong) : "",
        file_hop_dong: copiedData.file_hop_dong ? String(copiedData.file_hop_dong) : "",
        ghi_chu: copiedData.ghi_chu ? String(copiedData.ghi_chu) : "",
      }
    }

    if (isEditMode && existingData && existingData !== null && typeof existingData === 'object') {
      return {
        khach_buon_id: existingData.khach_buon_id ? String(existingData.khach_buon_id) : null,
        ngay: existingData.ngay ? String(existingData.ngay) : getTodayDate(),
        muc_dang_ky_id: existingData.muc_dang_ky_id ? String(existingData.muc_dang_ky_id) : null,
        tsn_tinh_thanh_id: existingData.tsn_tinh_thanh_id ? String(existingData.tsn_tinh_thanh_id) : null,
        ssn_tinh_thanh_id: existingData.ssn_tinh_thanh_id ? String(existingData.ssn_tinh_thanh_id) : null,
        doanh_so_min_quy: existingData.doanh_so_min_quy !== null && existingData.doanh_so_min_quy !== undefined ? String(existingData.doanh_so_min_quy) : "",
        doanh_so_max_quy: existingData.doanh_so_max_quy !== null && existingData.doanh_so_max_quy !== undefined ? String(existingData.doanh_so_max_quy) : "",
        doanh_so_min_nam: existingData.doanh_so_min_nam !== null && existingData.doanh_so_min_nam !== undefined ? String(existingData.doanh_so_min_nam) : "",
        doanh_so_max_nam: existingData.doanh_so_max_nam !== null && existingData.doanh_so_max_nam !== undefined ? String(existingData.doanh_so_max_nam) : "",
        ngay_ap_dung: existingData.ngay_ap_dung ? String(existingData.ngay_ap_dung) : getFirstDayOfMonth(),
        giai_doan_id: existingData.giai_doan_id ? String(existingData.giai_doan_id) : null,
        trang_thai_id: existingData.trang_thai_id ? String(existingData.trang_thai_id) : null,
        link_hop_dong: existingData.link_hop_dong ? String(existingData.link_hop_dong) : "",
        file_hop_dong: existingData.file_hop_dong ? String(existingData.file_hop_dong) : "",
        ghi_chu: existingData.ghi_chu ? String(existingData.ghi_chu) : "",
      }
    }

    return {
      khach_buon_id: null,
      ngay: getTodayDate(),
      muc_dang_ky_id: null,
      tsn_tinh_thanh_id: null,
      ssn_tinh_thanh_id: null,
      doanh_so_min_quy: "",
      doanh_so_max_quy: "",
      doanh_so_min_nam: "",
      doanh_so_max_nam: "",
      ngay_ap_dung: getFirstDayOfMonth(),
      giai_doan_id: null,
      trang_thai_id: null,
      link_hop_dong: "",
      file_hop_dong: "",
      ghi_chu: "",
    }
  }, [isEditMode, existingData, copiedData])

  const sections = React.useMemo(() => 
    getSections(giaiDoanOptions, filteredTrangThaiOptions),
    [giaiDoanOptions, filteredTrangThaiOptions]
  )

  const { handleCancel } = useFormNavigation({ onCancel })

  // Store created/updated ID for navigation
  const [createdId, setCreatedId] = React.useState<number | null>(null)

  // Watch giai_doan_id để filter trang_thai options - sẽ được cập nhật trong KhachBuonWatcher
  const [giaiDoanIdForFilter, setGiaiDoanIdForFilter] = React.useState<string | null>(null)

  // Filter trang_thai options theo giai_doan_id được chọn
  React.useEffect(() => {
    if (!trangThaiList) {
      setFilteredTrangThaiOptions([])
      return
    }

    if (giaiDoanIdForFilter) {
      const giaiDoanIdNumber = Number(giaiDoanIdForFilter)
      // Filter trang thai theo giai_doan_id
      const filtered = trangThaiList
        .filter(item => item.giai_doan_id === giaiDoanIdNumber)
        .map(item => ({
          label: `${item.ma_trang_thai} - ${item.ten_trang_thai}`,
          value: String(item.id),
        }))
      setFilteredTrangThaiOptions(filtered)
    } else {
      // Nếu chưa chọn giai_doan_id, hiển thị tất cả
      setFilteredTrangThaiOptions(
        trangThaiList.map(item => ({
          label: `${item.ma_trang_thai} - ${item.ten_trang_thai}`,
          value: String(item.id),
        }))
      )
    }
  }, [giaiDoanIdForFilter, trangThaiList])

  // Component to watch khach_buon_id, giai_doan_id and auto-fill fields
  const KhachBuonWatcher = () => {
    const form = useFormContext()
    const khachBuonId = useWatch({ control: form.control, name: "khach_buon_id" })
    const giaiDoanId = useWatch({ control: form.control, name: "giai_doan_id" })
    const [lastKhachBuonId, setLastKhachBuonId] = React.useState<number | null>(null)
    
    // Update giaiDoanIdForFilter khi giai_doan_id thay đổi
    React.useEffect(() => {
      setGiaiDoanIdForFilter(giaiDoanId || null)
    }, [giaiDoanId])
    
    // Fetch khach buon data when khach_buon_id changes
    const khachBuonIdNumber = khachBuonId ? Number(khachBuonId) : null
    const shouldFetchKhachBuon = !!khachBuonIdNumber && khachBuonIdNumber !== lastKhachBuonId
    const { data: khachBuonData } = useDanhSachKBById(
      shouldFetchKhachBuon ? khachBuonIdNumber : 0
    )

    // Auto-fill fields when khach buon data is loaded
    React.useEffect(() => {
      if (khachBuonData && khachBuonIdNumber && khachBuonIdNumber !== lastKhachBuonId) {
        // Chỉ auto-fill khi tạo mới (không phải edit mode)
        if (!isEditMode) {
          // Auto-fill giai_doan_id từ khách buôn hiện tại
          if (khachBuonData.giai_doan_id) {
            const giaiDoanIdString = String(khachBuonData.giai_doan_id)
            form.setValue("giai_doan_id", giaiDoanIdString, { 
              shouldValidate: false,
              shouldDirty: false 
            })
            // Cập nhật filter ngay lập tức
            setGiaiDoanIdForFilter(giaiDoanIdString)
          }
          
          // Auto-fill tỉnh thành TSN và SSN từ khách buôn
          if (khachBuonData.tsn_tinh_thanh_id) {
            form.setValue("tsn_tinh_thanh_id", String(khachBuonData.tsn_tinh_thanh_id), { 
              shouldValidate: false,
              shouldDirty: false 
            })
          }
          if (khachBuonData.ssn_tinh_thanh_id) {
            form.setValue("ssn_tinh_thanh_id", String(khachBuonData.ssn_tinh_thanh_id), { 
              shouldValidate: false,
              shouldDirty: false 
            })
          }
        }
        setLastKhachBuonId(khachBuonIdNumber)
      }
    }, [khachBuonData, khachBuonIdNumber, form, isEditMode, lastKhachBuonId])

    // Auto-fill trang_thai_id sau khi giai_doan_id đã được set và filteredTrangThaiOptions đã được cập nhật
    React.useEffect(() => {
      if (khachBuonData && !isEditMode && khachBuonIdNumber && khachBuonIdNumber === lastKhachBuonId) {
        // Chỉ auto-fill khi đã có giai_doan_id và trang_thai_id từ khách buôn
        if (khachBuonData.trang_thai_id && khachBuonData.giai_doan_id && giaiDoanIdForFilter) {
          const giaiDoanIdNumber = Number(giaiDoanIdForFilter)
          const trangThaiIdString = String(khachBuonData.trang_thai_id)
          
          // Kiểm tra xem trang_thai_id có thuộc giai_doan_id không
          if (trangThaiList) {
            const trangThai = trangThaiList.find(
              item => String(item.id) === trangThaiIdString && 
              item.giai_doan_id === giaiDoanIdNumber
            )
            if (trangThai) {
              const currentTrangThaiId = form.getValues("trang_thai_id")
              // Chỉ set nếu chưa có giá trị hoặc giá trị hiện tại khác
              if (!currentTrangThaiId || currentTrangThaiId !== trangThaiIdString) {
                form.setValue("trang_thai_id", trangThaiIdString, { 
                  shouldValidate: false,
                  shouldDirty: false 
                })
              }
            }
          }
        }
      }
    }, [khachBuonData, giaiDoanIdForFilter, trangThaiList, form, isEditMode, khachBuonIdNumber, lastKhachBuonId])

    // Reset trang_thai_id nếu không thuộc giai_doan_id mới
    React.useEffect(() => {
      if (giaiDoanId && trangThaiList) {
        const giaiDoanIdNumber = Number(giaiDoanId)
        const currentTrangThaiId = form.getValues("trang_thai_id")
        if (currentTrangThaiId) {
          const currentTrangThai = trangThaiList.find(
            item => String(item.id) === currentTrangThaiId && item.giai_doan_id === giaiDoanIdNumber
          )
          if (!currentTrangThai) {
            form.setValue("trang_thai_id", "", { shouldValidate: false, shouldDirty: false })
          }
        }
      }
    }, [giaiDoanId, trangThaiList, form])

    // Reset lastKhachBuonId when khach_buon_id is cleared
    React.useEffect(() => {
      if (!khachBuonIdNumber) {
        setLastKhachBuonId(null)
      }
    }, [khachBuonIdNumber])

    return null
  }

  const handleSubmit = async (data: any) => {
    // Helper function to parse number from formatted string (removes commas)
    const parseNumber = (value: any): number | undefined => {
      if (value === null || value === undefined || value === "") return undefined
      if (typeof value === 'number') return value
      // Remove commas (thousand separators) and spaces, then parse
      const cleaned = String(value).replace(/[,\s]/g, '')
      const num = parseFloat(cleaned)
      return isNaN(num) ? undefined : num
    }

    // Transform form data to API format
    const submitData: CreateXetDuyetKhachBuonInput | UpdateXetDuyetKhachBuonInput = {
      khach_buon_id: data.khach_buon_id ? Number(data.khach_buon_id) : undefined,
      ngay: data.ngay || null,
      muc_dang_ky_id: data.muc_dang_ky_id ? Number(data.muc_dang_ky_id) : undefined,
      tsn_tinh_thanh_id: data.tsn_tinh_thanh_id ? Number(data.tsn_tinh_thanh_id) : null,
      ssn_tinh_thanh_id: data.ssn_tinh_thanh_id ? Number(data.ssn_tinh_thanh_id) : null,
      doanh_so_min_quy: parseNumber(data.doanh_so_min_quy),
      doanh_so_max_quy: parseNumber(data.doanh_so_max_quy),
      doanh_so_min_nam: parseNumber(data.doanh_so_min_nam),
      doanh_so_max_nam: parseNumber(data.doanh_so_max_nam),
      ngay_ap_dung: data.ngay_ap_dung || undefined,
      giai_doan_id: data.giai_doan_id ? Number(data.giai_doan_id) : undefined,
      trang_thai_id: data.trang_thai_id ? Number(data.trang_thai_id) : undefined,
      link_hop_dong: data.link_hop_dong || null,
      file_hop_dong: data.file_hop_dong || null,
      ghi_chu: data.ghi_chu || null,
      nguoi_tao_id: employee?.ma_nhan_vien || null,
      trang_thai: isEditMode ? undefined : "Chờ kiểm tra", // Mặc định khi tạo mới
    }

    if (isEditMode && formId) {
      await updateMutation.mutateAsync({ id: formId, input: submitData as UpdateXetDuyetKhachBuonInput })
      setCreatedId(formId)
    } else {
      const result = await createMutation.mutateAsync(submitData as CreateXetDuyetKhachBuonInput)
      // Store the ID of the newly created record
      if (result?.id) {
        setCreatedId(result.id)
      }
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      const returnTo = searchParams.get('returnTo') || 'list'
      // Use createdId for new records, formId for edited records
      const targetId = createdId || formId
      
      if (returnTo === 'detail' && targetId) {
        navigate(`${xetDuyetKhachBuonConfig.routePath}/${targetId}`)
      } else {
        navigate(xetDuyetKhachBuonConfig.routePath)
      }
    }
  }

  if (isEditMode && viewState.isLoading) {
    return (
      <GenericFormView
        title={`Sửa ${xetDuyetKhachBuonConfig.moduleTitle}`}
        schema={formSchema}
        defaultValues={{}}
        sections={[]}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <GenericFormView
      title={isEditMode ? `Sửa ${xetDuyetKhachBuonConfig.moduleTitle}` : `Thêm ${xetDuyetKhachBuonConfig.moduleTitle}`}
      schema={formSchema}
      defaultValues={defaultValues}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    >
      <KhachBuonWatcher />
    </GenericFormView>
  )
}

