"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { danhSachKBBaseSchema } from "../schema"
import type { CreateDanhSachKBInput, UpdateDanhSachKBInput } from "../schema"
import { useCreateDanhSachKB, useUpdateDanhSachKB } from "../hooks/use-danh-sach-KB-mutations"
import { useDanhSachKBById } from "../hooks/use-danh-sach-KB"
import { danhSachKBConfig } from "../config"
import { useMemo } from "react"
import { useAuthStore } from "@/shared/stores/auth-store"
import { useGiaiDoanKhachBuon } from "@/features/ban-buon/thiet-lap-khach-buon/giai-doan-khach-buon/hooks/use-giai-doan-khach-buon"
import { GPSLocationFormField } from "@/components/ui/gps-location-form-field"
import {
  DanhSachKBFormAutoDefaults,
  DanhSachKBFormAutoUpdateTrangThai,
  DanhSachKBFormAutoAddressTSN,
  DanhSachKBFormAutoAddressSSN,
} from "./danh-sach-KB-form-helpers"
import { TrangThaiSelectDependent } from "./trang-thai-select-dependent"

const getSections = (
  giaiDoanOptions: Array<{ label: string; value: string }>
): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { name: "ma_so", label: "Mã Số" },
      { name: "ten_khach_buon", label: "Tên Khách Buôn", required: true },
      { 
        name: "loai_khach", 
        label: "Loại Khách",
        type: "toggle",
        required: true,
        options: [
          { label: "Đại lý", value: "Đại lý" },
          { label: "Showroom", value: "Showroom" },
          { label: "Nhà phân phối", value: "Nhà phân phối" },
          { label: "Khách sỉ", value: "Khách sỉ" },
          { label: "Xưởng", value: "Xưởng" },
        ]
      },
      { 
        name: "nguon", 
        label: "Nguồn",
        type: "toggle",
        required: true,
        options: [
          { label: "Thị trường", value: "Thị trường" },
          { label: "Facebook", value: "Facebook" },
          { label: "Tiktok", value: "Tiktok" },
          { label: "Zalo", value: "Zalo" },
          { label: "Youtube", value: "Youtube" },
          { label: "Khác", value: "Khác" },
        ]
      },
      { name: "hinh_anh", label: "Hình Ảnh", type: "image" },
    ]
  },
  {
    title: "Thông Tin Liên Hệ",
    fields: [
      { name: "so_dien_thoai_1", label: "Số Điện Thoại 1", required: true },
      { name: "so_dien_thoai_2", label: "Số Điện Thoại 2" },
      { 
        name: "nhom_nganh", 
        label: "Nhóm Ngành",
        type: "multiselect-combobox",
        required: true,
        options: [
          { label: "Phụ kiện tủ bếp", value: "Phụ kiện tủ bếp" },
          { label: "Dụng cụ mộc", value: "Dụng cụ mộc" },
          { label: "Khóa cửa", value: "Khóa cửa" },
          { label: "Chậu vòi", value: "Chậu vòi" },
          { label: "Phụ kiện nội thất", value: "Phụ kiện nội thất" },
        ]
      },
      { 
        name: "mien", 
        label: "Miền",
        type: "toggle",
        options: [
          { label: "Miền Bắc", value: "Miền Bắc" },
          { label: "Miền Trung", value: "Miền Trung" },
          { label: "Miền Nam", value: "Miền Nam" },
        ]
      },
    ]
  },
  {
    title: "Địa Chỉ TSN (Trước Sát Nhập)",
    fields: [
      {
        name: "tsn_tinh_thanh_id",
        label: "Tỉnh Thành",
        type: "tinh-thanh-tsn-select",
      },
      {
        name: "tsn_quan_huyen_id",
        label: "Quận Huyện",
        type: "quan-huyen-tsn-select",
      },
      {
        name: "tsn_phuong_xa_id",
        label: "Phường Xã",
        type: "phuong-xa-tsn-select",
      },
      { name: "tsn_so_nha", label: "Số Nhà" },
      {
        name: "tsn_dia_chi_day_du",
        label: "Địa Chỉ Đầy Đủ",
        type: "textarea",
        disabled: true,
      },
    ]
  },
  {
    title: "Địa Chỉ SSN (Sau Sát Nhập)",
    fields: [
      {
        name: "ssn_tinh_thanh_id",
        label: "Tỉnh Thành",
        type: "tinh-thanh-ssn-select",
      },
      {
        name: "ssn_phuong_xa_id",
        label: "Phường Xã",
        type: "phuong-xa-snn-select",
      },
      { name: "ssn_so_nha", label: "Số Nhà" },
      {
        name: "ssn_dia_chi_day_du",
        label: "Địa Chỉ Đầy Đủ",
        type: "textarea",
        disabled: true,
      },
    ]
  },
  {
    title: "Thông Tin Khác",
    fields: [
      { 
        name: "dinh_vi_gps", 
        label: "Định Vị GPS",
        type: "custom",
        customComponent: GPSLocationFormField,
      },
      {
        name: "nam_thanh_lap",
        label: "Năm Thành Lập",
        type: "number",
      },
      { name: "link_group_zalo", label: "Link Group Zalo" },
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
        type: "custom",
        required: true,
        customComponent: TrangThaiSelectDependent,
      },
      {
        name: "tele_sale_id",
        label: "Tele Sale",
        type: "nhan-su-select",
      },
      {
        name: "thi_truong_id",
        label: "Thị Trường",
        type: "nhan-su-select",
      },
      { name: "quy_mo", label: "Quy Mô" },
      { name: "ghi_chu", label: "Ghi Chú", type: "textarea", colSpan: 2 },
    ]
  },
]

interface DanhSachKBFormViewProps {
  id?: number // If provided, this is edit mode
  onComplete?: () => void
  onCancel?: () => void
}

export function DanhSachKBFormView({ id, onComplete, onCancel }: DanhSachKBFormViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreateDanhSachKB()
  const updateMutation = useUpdateDanhSachKB()
  const { employee } = useAuthStore()

  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC bất kỳ early return nào
  const { data: existingData, isLoading } = useDanhSachKBById(id ?? 0, undefined)
  const { data: giaiDoanList } = useGiaiDoanKhachBuon(undefined)

  // Computed values
  const returnTo = searchParams.get('returnTo') || (id ? 'detail' : 'list')
  const isEditMode = !!id

  // Build options
  const giaiDoanOptions = useMemo(() => {
    if (!giaiDoanList) return []
    return giaiDoanList
      .map((item: any) => ({
        label: item.ten_giai_doan || `Giai đoạn ${item.id}`,
        value: String(item.id)
      }))
      .sort((a: any, b: any) => a.label.localeCompare(b.label))
  }, [giaiDoanList])

  // Create sections
  const sections = useMemo(() => {
    return getSections(giaiDoanOptions)
  }, [giaiDoanOptions])

  // ✅ QUAN TRỌNG: Tạo schema cho form
  const formSchema = useMemo(() => {
    return danhSachKBBaseSchema
      .omit({ id: true, tg_tao: true, tg_cap_nhat: true, nguoi_tao_id: true, nguoi_tao_ten: true, ten_giai_doan: true, ten_trang_thai: true, ten_tele_sale: true, ten_thi_truong: true, tsn_ten_tinh_thanh: true, tsn_ten_quan_huyen: true, tsn_ten_phuong_xa: true, ssn_ten_tinh_thanh: true, ssn_ten_phuong_xa: true })
      .refine(data => data.tele_sale_id !== null || data.thi_truong_id !== null, {
        message: "Phải điền ít nhất một trong hai trường: Tele Sale hoặc Thị Trường",
        path: ["tele_sale_id"],
      })
  }, [])

  // ✅ QUAN TRỌNG: Prepare default values BEFORE early return
  const defaultValues = useMemo(() => {
    if (isEditMode && existingData && existingData !== null && typeof existingData === 'object' && 'ten_khach_buon' in existingData && existingData.ten_khach_buon !== undefined) {
      return {
        ma_so: existingData.ma_so ? String(existingData.ma_so) : "",
        ten_khach_buon: String(existingData.ten_khach_buon || ""),
        loai_khach: existingData.loai_khach ? String(existingData.loai_khach) : "",
        nguon: existingData.nguon ? String(existingData.nguon) : "",
        nam_thanh_lap: existingData.nam_thanh_lap ?? null,
        hinh_anh: existingData.hinh_anh ? String(existingData.hinh_anh) : "",
        so_dien_thoai_1: String(existingData.so_dien_thoai_1 || ""),
        so_dien_thoai_2: existingData.so_dien_thoai_2 ? String(existingData.so_dien_thoai_2) : "",
        nhom_nganh: existingData.nhom_nganh ? String(existingData.nhom_nganh) : "",
        link_group_zalo: existingData.link_group_zalo ? String(existingData.link_group_zalo) : "",
        mien: existingData.mien ? String(existingData.mien) : "",
        tsn_tinh_thanh_id: existingData.tsn_tinh_thanh_id ?? null,
        tsn_ten_tinh_thanh: existingData.tsn_ten_tinh_thanh ? String(existingData.tsn_ten_tinh_thanh) : "",
        tsn_quan_huyen_id: existingData.tsn_quan_huyen_id ?? null,
        tsn_ten_quan_huyen: existingData.tsn_ten_quan_huyen ? String(existingData.tsn_ten_quan_huyen) : "",
        tsn_phuong_xa_id: existingData.tsn_phuong_xa_id ?? null,
        tsn_ten_phuong_xa: existingData.tsn_ten_phuong_xa ? String(existingData.tsn_ten_phuong_xa) : "",
        tsn_so_nha: existingData.tsn_so_nha ? String(existingData.tsn_so_nha) : "",
        tsn_dia_chi_day_du: existingData.tsn_dia_chi_day_du ? String(existingData.tsn_dia_chi_day_du) : "",
        ssn_tinh_thanh_id: existingData.ssn_tinh_thanh_id ?? null,
        ssn_ten_tinh_thanh: existingData.ssn_ten_tinh_thanh ? String(existingData.ssn_ten_tinh_thanh) : "",
        ssn_phuong_xa_id: existingData.ssn_phuong_xa_id ?? null,
        ssn_ten_phuong_xa: existingData.ssn_ten_phuong_xa ? String(existingData.ssn_ten_phuong_xa) : "",
        ssn_so_nha: existingData.ssn_so_nha ? String(existingData.ssn_so_nha) : "",
        ssn_dia_chi_day_du: existingData.ssn_dia_chi_day_du ? String(existingData.ssn_dia_chi_day_du) : "",
        dinh_vi_gps: existingData.dinh_vi_gps ? String(existingData.dinh_vi_gps) : "",
        giai_doan_id: existingData.giai_doan_id ? String(existingData.giai_doan_id) : "",
        trang_thai_id: existingData.trang_thai_id ? String(existingData.trang_thai_id) : "",
        tele_sale_id: existingData.tele_sale_id ?? null,
        thi_truong_id: existingData.thi_truong_id ?? null,
        quy_mo: existingData.quy_mo ? String(existingData.quy_mo) : "",
        ghi_chu: existingData.ghi_chu ? String(existingData.ghi_chu) : "",
      }
    }

    // For new record
    return {
      ma_so: "",
      ten_khach_buon: "",
      loai_khach: "Đại lý",
      nguon: "Thị trường",
      nam_thanh_lap: null,
      hinh_anh: "",
      so_dien_thoai_1: "",
      so_dien_thoai_2: "",
      nhom_nganh: ["Phụ kiện tủ bếp"],
      link_group_zalo: "",
      mien: "Miền Bắc",
      tsn_tinh_thanh_id: null,
      tsn_ten_tinh_thanh: "",
      tsn_quan_huyen_id: null,
      tsn_ten_quan_huyen: "",
      tsn_phuong_xa_id: null,
      tsn_ten_phuong_xa: "",
      tsn_so_nha: "",
      tsn_dia_chi_day_du: "",
      ssn_tinh_thanh_id: null,
      ssn_ten_tinh_thanh: "",
      ssn_phuong_xa_id: null,
      ssn_ten_phuong_xa: "",
      ssn_so_nha: "",
      ssn_dia_chi_day_du: "",
      dinh_vi_gps: "",
      giai_doan_id: "",
      trang_thai_id: "",
      tele_sale_id: null,
      thi_truong_id: null,
      quy_mo: "",
      ghi_chu: "",
    }
  }, [isEditMode, existingData])

  // ✅ QUAN TRỌNG: Early return PHẢI ở sau tất cả hooks
  if (isEditMode && isLoading) {
    return <div>Đang tải...</div>
  }

  const cancelUrl = returnTo === 'list'
    ? danhSachKBConfig.routePath
    : (id ? `${danhSachKBConfig.routePath}/${id}` : danhSachKBConfig.routePath)

  const handleSubmit = async (data: any) => {
    if (isEditMode && id) {
      const updateData: UpdateDanhSachKBInput = {
        ma_so: data.ma_so || null,
        ten_khach_buon: data.ten_khach_buon || null,
        loai_khach: data.loai_khach || null,
        nguon: data.nguon || null,
        nam_thanh_lap: data.nam_thanh_lap ?? null,
        hinh_anh: data.hinh_anh || null,
        so_dien_thoai_1: data.so_dien_thoai_1 || null,
        so_dien_thoai_2: data.so_dien_thoai_2 || null,
        nhom_nganh: data.nhom_nganh || null,
        link_group_zalo: data.link_group_zalo || null,
        mien: data.mien || null,
        tsn_tinh_thanh_id: data.tsn_tinh_thanh_id ? parseFloat(data.tsn_tinh_thanh_id) : null,
        tsn_quan_huyen_id: data.tsn_quan_huyen_id ? parseFloat(data.tsn_quan_huyen_id) : null,
        tsn_phuong_xa_id: data.tsn_phuong_xa_id ? parseFloat(data.tsn_phuong_xa_id) : null,
        tsn_so_nha: data.tsn_so_nha || null,
        tsn_dia_chi_day_du: data.tsn_dia_chi_day_du || null,
        ssn_tinh_thanh_id: data.ssn_tinh_thanh_id ? parseFloat(data.ssn_tinh_thanh_id) : null,
        ssn_phuong_xa_id: data.ssn_phuong_xa_id ? parseFloat(data.ssn_phuong_xa_id) : null,
        ssn_so_nha: data.ssn_so_nha || null,
        ssn_dia_chi_day_du: data.ssn_dia_chi_day_du || null,
        dinh_vi_gps: data.dinh_vi_gps || null,
        giai_doan_id: data.giai_doan_id ? Number(data.giai_doan_id) : undefined,
        trang_thai_id: data.trang_thai_id ? Number(data.trang_thai_id) : undefined,
        tele_sale_id: data.tele_sale_id ?? null,
        thi_truong_id: data.thi_truong_id ?? null,
      }
      await updateMutation.mutateAsync({ id, input: updateData })
    } else {
      const giaiDoanId = data.giai_doan_id ? Number(data.giai_doan_id) : 0
      const trangThaiId = data.trang_thai_id ? Number(data.trang_thai_id) : 0
      const createData: CreateDanhSachKBInput = {
        ma_so: data.ma_so || null,
        ten_khach_buon: data.ten_khach_buon || null,
        loai_khach: data.loai_khach || null,
        nguon: data.nguon || null,
        nam_thanh_lap: data.nam_thanh_lap ?? null,
        hinh_anh: data.hinh_anh || null,
        so_dien_thoai_1: data.so_dien_thoai_1 || null,
        so_dien_thoai_2: data.so_dien_thoai_2 || null,
        nhom_nganh: data.nhom_nganh || null,
        link_group_zalo: data.link_group_zalo || null,
        mien: data.mien || null,
        tsn_tinh_thanh_id: data.tsn_tinh_thanh_id ? parseFloat(data.tsn_tinh_thanh_id) : null,
        tsn_quan_huyen_id: data.tsn_quan_huyen_id ? parseFloat(data.tsn_quan_huyen_id) : null,
        tsn_phuong_xa_id: data.tsn_phuong_xa_id ? parseFloat(data.tsn_phuong_xa_id) : null,
        tsn_so_nha: data.tsn_so_nha || null,
        tsn_dia_chi_day_du: data.tsn_dia_chi_day_du || null,
        ssn_tinh_thanh_id: data.ssn_tinh_thanh_id ? parseFloat(data.ssn_tinh_thanh_id) : null,
        ssn_phuong_xa_id: data.ssn_phuong_xa_id ? parseFloat(data.ssn_phuong_xa_id) : null,
        ssn_so_nha: data.ssn_so_nha || null,
        ssn_dia_chi_day_du: data.ssn_dia_chi_day_du || null,
        dinh_vi_gps: data.dinh_vi_gps || null,
        giai_doan_id: giaiDoanId,
        trang_thai_id: trangThaiId,
        tele_sale_id: data.tele_sale_id ?? null,
        thi_truong_id: data.thi_truong_id ?? null,
        quy_mo: data.quy_mo || null,
        ghi_chu: data.ghi_chu || null,
        nguoi_tao_id: employee?.ma_nhan_vien || null,
      }
      await createMutation.mutateAsync(createData)
    }
  }

  const handleSuccess = () => {
    if (onComplete) {
      onComplete()
    } else {
      // Fallback to default navigation
      if (returnTo === 'list') {
        navigate(danhSachKBConfig.routePath)
      } else if (returnTo === 'detail' && id) {
        navigate(`${danhSachKBConfig.routePath}/${id}`)
      } else {
        navigate(danhSachKBConfig.routePath)
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
      title={isEditMode ? `Sửa Khách Buôn: ${existingData?.ten_khach_buon || ''}` : "Thêm Mới Khách Buôn"}
      subtitle={isEditMode ? "Cập nhật thông tin khách buôn." : "Thêm khách buôn mới vào hệ thống."}
      schema={formSchema}
      sections={sections}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      cancelUrl={cancelUrl}
      successMessage={isEditMode ? "Cập nhật khách buôn thành công" : "Thêm mới khách buôn thành công"}
      errorMessage={isEditMode ? "Có lỗi xảy ra khi cập nhật khách buôn" : "Có lỗi xảy ra khi thêm mới khách buôn"}
      defaultValues={defaultValues}
    >
      <DanhSachKBFormAutoDefaults isEditMode={isEditMode} />
      <DanhSachKBFormAutoUpdateTrangThai isEditMode={isEditMode} />
      <DanhSachKBFormAutoAddressTSN />
      <DanhSachKBFormAutoAddressSSN />
    </GenericFormView>
  )
}

