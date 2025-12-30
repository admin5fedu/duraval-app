"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { usePhanHoiKhachHangById } from "../hooks"
import { DeletePhanHoiKhachHangButton } from "./delete-phan-hoi-khach-hang-button"
import { TraoDoiButton } from "./trao-doi-button"
import { phanHoiKhachHangConfig } from "../config"
import { TraoDoiHistory } from "@/shared/components/data-display/generic-detail-view"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

interface PhanHoiKhachHangDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function PhanHoiKhachHangDetailView({ id, initialData, onEdit, onBack }: PhanHoiKhachHangDetailViewProps) {
  const navigate = useNavigate()
  const query = usePhanHoiKhachHangById(id, initialData)
  const { data: phanHoi, isLoading, isError } = query

  // ✅ Hiển thị loading state
  if (isLoading) {
    return (
      <GenericDetailViewSimple
        title=""
        subtitle=""
        sections={[]}
        isLoading={true}
      />
    )
  }

  // ✅ Hiển thị error state
  if (isError || !phanHoi) {
    return (
      <DetailErrorState
        title="Không tìm thấy phản hồi khách hàng"
        message="Phản hồi khách hàng với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : phanHoiKhachHangConfig.routePath}
      />
    )
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { 
          label: "Ngày", 
          key: "ngay", 
          value: phanHoi.ngay || "-",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return format(new Date(val), "dd/MM/yyyy", { locale: vi })
            } catch {
              return val
            }
          }
        },
        { 
          label: "Nhân Viên", 
          key: "nhan_vien_id", 
          value: phanHoi.nhan_vien_id || "-",
          format: () => {
            const nhanVien = phanHoi.nhan_vien
            if (!nhanVien) {
              const nhanVienId = phanHoi.nhan_vien_id
              return nhanVienId ? String(nhanVienId) : "-"
            }
            return `${nhanVien.ma_nhan_vien} - ${nhanVien.ho_ten}`
          }
        },
        { 
          label: "Tên Sản Phẩm", 
          key: "ten_san_pham", 
          value: phanHoi.ten_san_pham || "-",
        },
        { 
          label: "ID Đơn Hàng", 
          key: "id_don_hang", 
          value: phanHoi.id_don_hang || "-",
        },
        { 
          label: "SĐT Khách", 
          key: "sdt_khach", 
          value: phanHoi.sdt_khach || "-",
        },
        { 
          label: "Ngày Bán", 
          key: "ngay_ban", 
          value: phanHoi.ngay_ban || "-",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return format(new Date(val), "dd/MM/yyyy", { locale: vi })
            } catch {
              return val
            }
          }
        },
        { 
          label: "Phòng", 
          key: "phong_id", 
          value: phanHoi.phong_id || "-",
          format: () => {
            const phongBan = phanHoi.phong_ban
            const phongId = phanHoi.phong_id
            if (!phongBan) {
              return phongId ? String(phongId) : "-"
            }
            return `${phongBan.ma_phong_ban} - ${phongBan.ten_phong_ban}`
          }
        },
        { 
          label: "Nhóm", 
          key: "nhom_id", 
          value: phanHoi.nhom_id || "-",
          format: () => {
            const nhom = phanHoi.nhom
            const nhomId = phanHoi.nhom_id
            if (!nhom) {
              return nhomId ? String(nhomId) : "-"
            }
            return nhom.ten_nhom
          }
        },
        { 
          label: "Loại", 
          key: "loai_loi", 
          value: phanHoi.loai_loi || "-",
        },
        { 
          label: "Trạng Thái", 
          key: "trang_thai", 
          value: phanHoi.trang_thai || "-",
          format: (val: any) => {
            if (!val) return "-"
            const colorMap: Record<string, string> = {
              "Mới": "bg-blue-500",
              "Đang xử lý": "bg-yellow-500",
              "Hoàn thành": "bg-green-500",
              "Đã hủy": "bg-red-500",
            }
            return <Badge variant="outline" className={colorMap[val] || ""}>{val}</Badge>
          }
        },
      ]
    },
    {
      title: "Thông Tin Lỗi",
      fields: [
        { 
          label: "Tên Lỗi", 
          key: "ten_loi", 
          value: phanHoi.ten_loi || "-",
        },
        { 
          label: "Mô Tả Lỗi", 
          key: "mo_ta_loi", 
          value: phanHoi.mo_ta_loi || "-",
          colSpan: 3,
          format: (val: any) => {
            if (!val) return "-"
            return <div className="whitespace-pre-wrap">{val}</div>
          }
        },
        { 
          label: "Mức Độ", 
          key: "muc_do", 
          value: phanHoi.muc_do || "-",
        },
        { 
          label: "Yêu Cầu Khách Hàng", 
          key: "yeu_cau_khach_hang", 
          value: phanHoi.yeu_cau_khach_hang || "-",
          colSpan: 3,
          format: (val: any) => {
            if (!val) return "-"
            return <div className="whitespace-pre-wrap">{val}</div>
          }
        },
        { 
          label: "KT Mô Tả Lỗi", 
          key: "kt_mo_ta_loi", 
          value: phanHoi.kt_mo_ta_loi || "-",
        },
        { 
          label: "Hình Ảnh", 
          key: "hinh_anh", 
          value: phanHoi.hinh_anh && Array.isArray(phanHoi.hinh_anh) && phanHoi.hinh_anh.length > 0 ? phanHoi.hinh_anh.join(", ") : "-",
          colSpan: 3,
          format: () => {
            const hinhAnh = phanHoi.hinh_anh
            if (!hinhAnh || !Array.isArray(hinhAnh) || hinhAnh.length === 0) return "-"
            return (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                {hinhAnh.map((url: string, index: number) => (
                  <div key={index} className="relative group">
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                    >
                      <img 
                        src={url} 
                        alt={`Hình ảnh ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-muted">
                                <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                              </div>
                            `
                          }
                        }}
                      />
                    </a>
                  </div>
                ))}
              </div>
            )
          }
        },
      ]
    },
    {
      title: "Xử Lý",
      fields: [
        { 
          label: "Biện Pháp Hiện Tại", 
          key: "bien_phap_hien_tai", 
          value: phanHoi.bien_phap_hien_tai || "-",
        },
        { 
          label: "Hạn Xử Lý", 
          key: "han_xu_ly", 
          value: phanHoi.han_xu_ly || "-",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return format(new Date(val), "dd/MM/yyyy", { locale: vi })
            } catch {
              return val
            }
          }
        },
        { 
          label: "KT Phụ Trách", 
          key: "kt_phu_trach", 
          value: phanHoi.kt_phu_trach || "-",
        },
        { 
          label: "Chi Phí", 
          key: "chi_phi", 
          value: phanHoi.chi_phi?.toString() || "0",
          format: (val: any) => {
            if (!val) return "0"
            return new Intl.NumberFormat('vi-VN').format(Number(val))
          }
        },
      ]
    },
    {
      title: "Đơn Hoàn",
      fields: [
        { 
          label: "ID Đơn Hoàn", 
          key: "id_don_hoan", 
          value: phanHoi.id_don_hoan || "-",
        },
        { 
          label: "Trạng Thái Đơn Hoàn", 
          key: "trang_thai_don_hoan", 
          value: phanHoi.trang_thai_don_hoan || "-",
        },
        { 
          label: "Biện Pháp Đơn Hoàn", 
          key: "bien_phap_don_hoan", 
          value: phanHoi.bien_phap_don_hoan || "-",
        },
        { 
          label: "Ghi Chú Đơn Hoàn", 
          key: "ghi_chu_don_hoan", 
          value: phanHoi.ghi_chu_don_hoan || "-",
        },
      ]
    },
    {
      title: "Kết Quả",
      fields: [
        { 
          label: "Kết Quả Cuối Cùng", 
          key: "ket_qua_cuoi_cung", 
          value: phanHoi.ket_qua_cuoi_cung || "-",
        },
        { 
          label: "Ngày Hoàn Thành", 
          key: "ngay_hoan_thanh", 
          value: phanHoi.ngay_hoan_thanh || "-",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return format(new Date(val), "dd/MM/yyyy", { locale: vi })
            } catch {
              return val
            }
          }
        },
      ]
    },
    {
      title: "Thông Tin Khác",
      fields: [
        { 
          label: "Người Tạo", 
          key: "nguoi_tao_id", 
          value: phanHoi.nguoi_tao_id?.toString() || "-",
          format: () => {
            const nguoiTao = phanHoi.nguoi_tao
            if (!nguoiTao) return "-"
            return `${nguoiTao.ma_nhan_vien} - ${nguoiTao.ho_ten}`
          }
        },
        { 
          label: "Thời Gian Tạo", 
          key: "tg_tao", 
          value: phanHoi.tg_tao || "-",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return format(new Date(val), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
              return val
            }
          }
        },
        { 
          label: "Thời Gian Cập Nhật", 
          key: "tg_cap_nhat", 
          value: phanHoi.tg_cap_nhat || "-",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return format(new Date(val), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
              return val
            }
          }
        },
      ]
    },
    {
      title: "Lịch Sử Trao Đổi",
      fields: [
        {
          label: "Trao Đổi",
          key: "trao_doi",
          value: phanHoi.trao_doi ? JSON.stringify(phanHoi.trao_doi) : "-",
          colSpan: 3,
          format: () => {
            return <TraoDoiHistory traoDoi={phanHoi.trao_doi} />
          }
        },
      ],
      actions: (
        <TraoDoiButton
          phanHoi={phanHoi}
          variant="primary"
          onSuccess={() => {
            query.refetch()
          }}
        />
      )
    },
  ]

  const handleBack = onBack || (() => navigate(phanHoiKhachHangConfig.routePath))

  return (
    <GenericDetailViewSimple
      title={`Phản Hồi Khách Hàng #${phanHoi.id}`}
      subtitle={phanHoi.ten_san_pham || ""}
      sections={sections}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={actionButtonClass()}
            onClick={onEdit || (() => navigate(`${phanHoiKhachHangConfig.routePath}/${id}/sua`))}
          >
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh Sửa
          </Button>
          <DeletePhanHoiKhachHangButton
            id={id}
            name={phanHoi.ten_san_pham || `ID: ${id}`}
            onDeleteSuccess={() => navigate(phanHoiKhachHangConfig.routePath)}
          />
        </div>
      }
      onBack={handleBack}
      backUrl={onBack ? undefined : phanHoiKhachHangConfig.routePath}
    />
  )
}

