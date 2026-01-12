"use client"

import { useNavigate } from "react-router-dom"
import { GenericFormView, type FormSection } from "@/shared/components"
import { phanHoiKhachHangSchema } from "../schema"
import { useCreatePhanHoiKhachHang, useUpdatePhanHoiKhachHang } from "../hooks"
import { usePhanHoiKhachHangById } from "../hooks"
import { phanHoiKhachHangConfig } from "../config"
import { useMemo, useEffect } from "react"
import type { CreatePhanHoiKhachHangInput, UpdatePhanHoiKhachHangInput } from "../types"
import { useAuthStore } from "@/shared/stores/auth-store"
import { format } from "date-fns"
import { NhanVienSelectFormField } from "./nhan-vien-select-form-field"
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks/use-nhan-su"
import { useFormContext } from "react-hook-form"

// Helper to get current date in YYYY-MM-DD format
const getCurrentDate = () => format(new Date(), "yyyy-MM-dd")

// Component để tự động cập nhật nhom_id và phong_id khi nhan_vien_id thay đổi
function NhanVienIdWatcher() {
    const { data: employees } = useNhanSu()
    const form = useFormContext()
    const nhanVienId = form.watch("nhan_vien_id")
    
    useEffect(() => {
        if (nhanVienId && employees) {
            const selectedEmployee = employees.find(emp => emp.ma_nhan_vien === Number(nhanVienId))
            if (selectedEmployee) {
                // Tự động cập nhật nhom_id và phong_id từ var_nhan_su
                // Lấy từ phong_ban_id nếu có, hoặc từ các field khác tùy theo cấu trúc DB
                const phongId = (selectedEmployee as any).phong_id || (selectedEmployee as any).phong_ban_id || null
                const nhomId = (selectedEmployee as any).nhom_id || null
                
                form.setValue("phong_id", phongId, { shouldValidate: false, shouldDirty: false })
                form.setValue("nhom_id", nhomId, { shouldValidate: false, shouldDirty: false })
            }
        }
    }, [nhanVienId, employees, form])
    
    return null
}

const getSections = (isEditMode: boolean): FormSection[] => [
  {
    title: "Thông Tin Cơ Bản",
    fields: [
      { 
        name: "ngay", 
        label: "Ngày", 
        type: "date",
        required: true,
      },
      { 
        name: "nhan_vien_id", 
        label: "Nhân Viên", 
        type: "custom",
        customComponent: NhanVienSelectFormField,
        required: true,
        disabled: isEditMode, // Disabled khi edit, chỉ cho chọn khi tạo mới
      },
      { 
        name: "ma_san_pham", 
        label: "Mã Sản Phẩm", 
        type: "text",
        required: true,
      },
      { 
        name: "ten_san_pham", 
        label: "Tên Sản Phẩm", 
        type: "text",
        required: true,
      },
      { 
        name: "id_don_hang", 
        label: "ID Đơn Hàng", 
        type: "text",
        required: true,
      },
      { 
        name: "phong_id", 
        label: "Phòng ID", 
        type: "number",
        disabled: true, // Không cho sửa, tự động lấy từ var_nhan_su
      },
      { 
        name: "nhom_id", 
        label: "Nhóm ID", 
        type: "number",
        disabled: true, // Không cho sửa, tự động lấy từ var_nhan_su
      },
      { 
        name: "sdt_khach", 
        label: "SĐT Khách", 
        type: "text",
      },
      { 
        name: "ngay_ban", 
        label: "Ngày Bán", 
        type: "date",
      },
      { 
        name: "loai_loi", 
        label: "Loại", 
        type: "select",
        required: true,
        options: [
          { label: "Chất lượng SP", value: "Chất lượng SP" },
          { label: "Hỏng lỗi", value: "Hỏng lỗi" },
          { label: "Chăm sóc", value: "Chăm sóc" },
          { label: "Giao hàng", value: "Giao hàng" },
          { label: "Bảo hành / Bảo trì", value: "Bảo hành / Bảo trì" },
          { label: "Giá cả", value: "Giá cả" },
          { label: "Hóa đơn", value: "Hóa đơn" },
          { label: "Khác", value: "Khác" },
        ],
      },
    ]
  },
  {
    title: "Thông Tin Lỗi",
    fields: [
      { 
        name: "ten_loi", 
        label: "Tên Lỗi", 
        type: "text",
        required: true,
      },
      { 
        name: "mo_ta_loi", 
        label: "Mô Tả Lỗi", 
        type: "textarea",
        required: true,
      },
      { 
        name: "muc_do", 
        label: "Mức Độ", 
        type: "toggle",
        required: true,
        options: [
          { label: "Nghiêm trọng", value: "Nghiêm trọng" },
          { label: "Bình thường", value: "Bình thường" },
          { label: "Thấp", value: "Thấp" },
        ],
      },
      { 
        name: "yeu_cau_khach_hang", 
        label: "Yêu Cầu Khách Hàng", 
        type: "textarea",
        required: true,
      },
      { 
        name: "bien_phap_hien_tai", 
        label: "Biện Pháp Hiện Tại", 
        type: "textarea",
      },
      { 
        name: "bien_phap_de_xuat", 
        label: "Biện Pháp Đề Xuất", 
        type: "textarea",
      },
      { 
        name: "han_xu_ly", 
        label: "Hạn Xử Lý", 
        type: "date",
      },
      { 
        name: "hinh_anh", 
        label: "Hình Ảnh", 
        type: "multiple-image",
        imageFolder: "phan-hoi-khach-hang",
        imageMaxSize: 10,
        colSpan: 3,
      },
    ]
  },
]

interface PhanHoiKhachHangFormViewProps {
  id?: number
  initialData?: any
  onComplete?: () => void
  onCancel?: () => void
}

export function PhanHoiKhachHangFormView({ id, initialData, onComplete, onCancel }: PhanHoiKhachHangFormViewProps) {
  const navigate = useNavigate()
  const { employee } = useAuthStore()
  const isEditMode = !!id
  const { data: phanHoi, isLoading } = usePhanHoiKhachHangById(id!, initialData)
  const createMutation = useCreatePhanHoiKhachHang()
  const updateMutation = useUpdatePhanHoiKhachHang()

  const defaultValues = useMemo(() => {
    if (isEditMode && phanHoi) {
      return {
        ngay: phanHoi.ngay || null,
        nhan_vien_id: phanHoi.nhan_vien_id || null,
        phong_id: phanHoi.phong_id || null,
        nhom_id: phanHoi.nhom_id || null,
        ma_san_pham: phanHoi.ma_san_pham || "",
        ten_san_pham: phanHoi.ten_san_pham || "",
        id_don_hang: phanHoi.id_don_hang || "",
        sdt_khach: phanHoi.sdt_khach || "",
        ngay_ban: phanHoi.ngay_ban || "",
        loai_loi: phanHoi.loai_loi || "",
        ten_loi: phanHoi.ten_loi || "",
        mo_ta_loi: phanHoi.mo_ta_loi || "",
        muc_do: phanHoi.muc_do || "",
        yeu_cau_khach_hang: phanHoi.yeu_cau_khach_hang || "",
        hinh_anh: Array.isArray(phanHoi.hinh_anh) 
          ? phanHoi.hinh_anh.join(", ") 
          : (phanHoi.hinh_anh || ""),
        bien_phap_hien_tai: phanHoi.bien_phap_hien_tai || "",
        bien_phap_de_xuat: phanHoi.bien_phap_de_xuat || "",
        han_xu_ly: phanHoi.han_xu_ly || "",
        trang_thai: phanHoi.trang_thai || "Mới",
        kt_mo_ta_loi: phanHoi.kt_mo_ta_loi || "",
        kt_phu_trach: phanHoi.kt_phu_trach || "",
        chi_phi: phanHoi.chi_phi || 0,
        id_don_hoan: phanHoi.id_don_hoan || "",
        trang_thai_don_hoan: phanHoi.trang_thai_don_hoan || "",
        bien_phap_don_hoan: phanHoi.bien_phap_don_hoan || "",
        ghi_chu_don_hoan: phanHoi.ghi_chu_don_hoan || "",
        ket_qua_cuoi_cung: phanHoi.ket_qua_cuoi_cung || "",
        ngay_hoan_thanh: phanHoi.ngay_hoan_thanh || "",
      }
        }
        return {
          ngay: getCurrentDate(),
          nhan_vien_id: employee?.ma_nhan_vien ? Number(employee.ma_nhan_vien) : null,
          phong_id: (employee as any)?.phong_id || (employee as any)?.phong_ban_id || null,
          nhom_id: (employee as any)?.nhom_id || null,
          ma_san_pham: "",
          ten_san_pham: "",
          id_don_hang: "",
          loai_loi: "Chất lượng SP",
          ten_loi: "",
          mo_ta_loi: "",
          muc_do: "Bình thường",
          yeu_cau_khach_hang: "",
          trang_thai: "Mới",
          chi_phi: 0,
          hinh_anh: [] as string[],
        }
  }, [isEditMode, phanHoi, employee])

  const sections = useMemo(() => getSections(isEditMode), [isEditMode])

  const handleSubmit = async (data: any) => {
    // Ensure hinh_anh is an array
    if (data.hinh_anh && !Array.isArray(data.hinh_anh)) {
      if (typeof data.hinh_anh === 'string') {
        // If it's a string, try to parse it (fallback for old data)
        data.hinh_anh = data.hinh_anh
          .split(/[,\n]/)
          .map((url: string) => url.trim())
          .filter((url: string) => url.length > 0)
      } else {
        data.hinh_anh = []
      }
    }
    if (!data.hinh_anh) {
      data.hinh_anh = []
    }
    
    // Ensure nhan_vien_id is set from current employee when creating
    // When editing, nhan_vien_id is disabled so it won't be changed
    if (!isEditMode && !data.nhan_vien_id) {
      data.nhan_vien_id = employee?.ma_nhan_vien ? Number(employee.ma_nhan_vien) : null
    }
    
    // Ensure nguoi_tao_id is set from current employee when creating
    if (!isEditMode) {
      data.nguoi_tao_id = employee?.ma_nhan_vien ? Number(employee.ma_nhan_vien) : null
    }
    
    if (isEditMode && id) {
      const updateInput: UpdatePhanHoiKhachHangInput = {
        ...data,
      }
      await updateMutation.mutateAsync({ id, input: updateInput })
    } else {
      const createInput: CreatePhanHoiKhachHangInput = {
        ...data,
        nguoi_tao_id: employee?.ma_nhan_vien ? Number(employee.ma_nhan_vien) : null,
      }
      await createMutation.mutateAsync(createInput)
    }

    if (onComplete) {
      onComplete()
    } else if (isEditMode && id) {
      navigate(`${phanHoiKhachHangConfig.routePath}/${id}`)
    } else {
      navigate(phanHoiKhachHangConfig.routePath)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else if (isEditMode && id) {
      navigate(`${phanHoiKhachHangConfig.routePath}/${id}`)
    } else {
      navigate(phanHoiKhachHangConfig.routePath)
    }
  }

  if (isEditMode && isLoading) {
    return <div>Loading...</div>
  }

  return (
    <GenericFormView
      title={isEditMode ? "Chỉnh Sửa Phản Hồi Khách Hàng" : "Thêm Mới Phản Hồi Khách Hàng"}
      schema={phanHoiKhachHangSchema.omit({ 
        id: true, 
        tg_tao: true, 
        tg_cap_nhat: true, 
        nhan_vien: true,
        nguoi_tao: true,
      })}
      defaultValues={defaultValues}
      sections={sections}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    >
      <NhanVienIdWatcher />
    </GenericFormView>
  )
}

