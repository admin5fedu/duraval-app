"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Edit } from "lucide-react"
import { usePhieuDeXuatBanHangById } from "../hooks"
import { DeletePhieuDeXuatBanHangButton } from "./delete-phieu-de-xuat-ban-hang-button"
import { phieuDeXuatBanHangConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { TraoDoiHistory } from "@/shared/components/data-display/trao-doi-history"
import { TraoDoiButton } from "./trao-doi-button"
import { QuanLyDuyetButton } from "./quan-ly-duyet-button"
import { BGDDuyetButton } from "./bgd-duyet-button"
import { Button } from "@/components/ui/button"
import { getActionVariant, getActionSize } from "@/shared/utils/action-styles"

interface PhieuDeXuatBanHangDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function PhieuDeXuatBanHangDetailView({ id, initialData, onEdit, onBack }: PhieuDeXuatBanHangDetailViewProps) {
  const navigate = useNavigate()
  const query = usePhieuDeXuatBanHangById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)

  if (viewState.isLoading) {
    return (
      <GenericDetailViewSimple
        title=""
        subtitle=""
        sections={[]}
        isLoading={true}
      />
    )
  }

  if (viewState.isError) {
    return (
      <DetailErrorState
        title="Không tìm thấy phiếu đề xuất bán hàng"
        message="Phiếu đề xuất bán hàng với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : phieuDeXuatBanHangConfig.routePath}
      />
    )
  }

  const phieu = viewState.data
  if (!phieu) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { label: "ID", key: "id", value: phieu.id, type: "number" },
        { label: "Ngày", key: "ngay", value: phieu.ngay, type: "date" },
        { label: "Nhân viên", key: "ten_nhan_vien", value: phieu.ten_nhan_vien || "-" },
        { 
          label: "Phòng", 
          key: "phong", 
          value: phieu.ma_phong && phieu.ten_phong_ban 
            ? `${phieu.ma_phong} - ${phieu.ten_phong_ban}` 
            : phieu.ma_phong || phieu.ten_phong_ban || "-" 
        },
        { 
          label: "Nhóm", 
          key: "nhom", 
          value: phieu.ma_nhom && phieu.ten_nhom 
            ? `${phieu.ma_nhom} - ${phieu.ten_nhom}` 
            : phieu.ma_nhom || phieu.ten_nhom || "-" 
        },
      ]
    },
    {
      title: "Thông Tin Phiếu",
      fields: [
        { label: "Loại phiếu", key: "ten_loai_phieu", value: phieu.ten_loai_phieu || "-" },
        { label: "Hạng mục", key: "ten_hang_muc", value: phieu.ten_hang_muc || "-" },
        { label: "Số hóa đơn", key: "so_hoa_don", value: phieu.so_hoa_don || "-" },
        { label: "Mô tả", key: "mo_ta", value: phieu.mo_ta || "-", colSpan: 3 },
      ]
    },
    {
      title: "Thông Tin Tài Chính",
      fields: [
        { label: "Tiền đơn hàng", key: "tien_don_hang", value: phieu.tien_don_hang, type: "currency" },
        { label: "Tổng chiết khấu", key: "tong_ck", value: phieu.tong_ck, type: "currency" },
        { 
          label: "Tỷ lệ", 
          key: "ty_le", 
          value: phieu.ty_le, 
          type: "number",
          format: (val: number | null | undefined) => {
            if (val === null || val === undefined) return "-"
            return `${Number(val).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
          }
        },
      ]
    },
    {
      title: "Hình ảnh",
      fields: [
        { 
          label: "Hình ảnh", 
          key: "hinh_anh", 
          value: phieu.hinh_anh, 
          type: "image",
          displayName: phieu.ten_nhan_vien || "Phiếu đề xuất bán hàng"
        },
      ]
    },
    {
      title: "Thông Tin Duyệt",
      fields: [
        { label: "Trạng thái", key: "trang_thai", value: phieu.trang_thai || "-" },
        { label: "Quản lý duyệt", key: "quan_ly_duyet", value: phieu.quan_ly_duyet || "-" },
        { 
          label: "TG quản lý duyệt", 
          key: "tg_quan_ly_duyet", 
          value: phieu.tg_quan_ly_duyet ? format(new Date(phieu.tg_quan_ly_duyet), "dd/MM/yyyy HH:mm", { locale: vi }) : "-",
          type: "date"
        },
        { label: "BGD duyệt", key: "bgd_duyet", value: phieu.bgd_duyet || "-" },
        { 
          label: "TG BGD duyệt", 
          key: "tg_bgd_duyet", 
          value: phieu.tg_bgd_duyet ? format(new Date(phieu.tg_bgd_duyet), "dd/MM/yyyy HH:mm", { locale: vi }) : "-",
          type: "date"
        },
        { label: "Trạng thái chi tiền", key: "trang_thai_chi_tien", value: phieu.trang_thai_chi_tien || "-" },
      ]
    },
    {
      title: "Thông Tin Khác",
      fields: [
        { label: "Người nhận quỹ", key: "ten_nguoi_nhan_quy", value: phieu.ten_nguoi_nhan_quy || "-" },
        { label: "Loại doanh thu", key: "ten_loai_doanh_thu", value: phieu.ten_loai_doanh_thu || "-" },
        { label: "Mã COMBO", key: "ma_com_bo", value: phieu.ma_com_bo || "-" },
        { 
          label: "Ngày tạo", 
          key: "tg_tao", 
          value: phieu.tg_tao ? format(new Date(phieu.tg_tao), "dd/MM/yyyy HH:mm", { locale: vi }) : "-",
          type: "date"
        },
        { 
          label: "Ngày cập nhật", 
          key: "tg_cap_nhat", 
          value: phieu.tg_cap_nhat ? format(new Date(phieu.tg_cap_nhat), "dd/MM/yyyy HH:mm", { locale: vi }) : "-",
          type: "date"
        },
      ]
    },
    {
      title: "Lịch Sử Trao Đổi",
      fields: [
        {
          label: "Trao Đổi",
          key: "trao_doi",
          value: phieu.trao_doi ? JSON.stringify(phieu.trao_doi) : "-",
          colSpan: 3, // Full width
          format: () => {
            return <TraoDoiHistory traoDoi={phieu.trao_doi} />
          }
        },
      ],
      actions: (
        <TraoDoiButton
          phieuDeXuatBanHang={phieu}
          onSuccess={() => {
            query.refetch()
          }}
        />
      )
    }
  ]

  // Secondary actions: Approval buttons (Quản lý duyệt, BGD duyệt)
  // Default action: Trao đổi
  const quanLyDuyetElement = (
      <QuanLyDuyetButton
      key="quan-ly-duyet"
        phieuDeXuatBanHang={phieu}
        onSuccess={() => {
          query.refetch()
        }}
      />
  )
  const bgdDuyetElement = (
      <BGDDuyetButton
      key="bgd-duyet"
        phieuDeXuatBanHang={phieu}
        onSuccess={() => {
          query.refetch()
        }}
      />
  )
  const traoDoiElement = (
      <TraoDoiButton
      key="trao-doi"
        phieuDeXuatBanHang={phieu}
        onSuccess={() => {
          query.refetch()
        }}
      />
  )

  // Secondary action: Sửa (nằm cạnh nút Xóa)
  const editButton = (
      <Button
      key="edit"
      variant={getActionVariant("secondary")}
      size={getActionSize("secondary")}
        onClick={() => {
          if (onEdit) {
            onEdit()
          } else {
            navigate(`${phieuDeXuatBanHangConfig.routePath}/${id}/sua`)
          }
        }}
      >
        <Edit className="mr-2 h-4 w-4" />
        Sửa
      </Button>
  )

  const deleteElement = <DeletePhieuDeXuatBanHangButton key="delete" id={id} />

  // Actions layout: Duyệt buttons -> Trao đổi -> Sửa & Xóa (cạnh nhau)
  const actionElements = (
    <div className="flex items-center gap-2">
      {quanLyDuyetElement}
      {bgdDuyetElement}
      {traoDoiElement}
      {editButton}
      {deleteElement}
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={`Phiếu đề xuất bán hàng #${phieu.id}`}
      subtitle={phieu.ten_nhan_vien || ""}
      sections={sections}
      actions={actionElements}
      onBack={onBack}
      backUrl={onBack ? undefined : phieuDeXuatBanHangConfig.routePath}
    />
  )
}

