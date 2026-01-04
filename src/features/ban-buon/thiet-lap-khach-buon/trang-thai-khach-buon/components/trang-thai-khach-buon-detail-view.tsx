"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useTrangThaiKhachBuonById } from "../hooks/use-trang-thai-khach-buon"
import { DeleteTrangThaiKhachBuonButton } from "./delete-trang-thai-khach-buon-button"
import { trangThaiKhachBuonConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface TrangThaiKhachBuonDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function TrangThaiKhachBuonDetailView({ id, initialData, onEdit, onBack }: TrangThaiKhachBuonDetailViewProps) {
  const navigate = useNavigate()
  const query = useTrangThaiKhachBuonById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const trangThai = viewState.data

  // ✅ Hiển thị loading state
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

  // ✅ Hiển thị error state
  if (viewState.isError) {
    return (
      <DetailErrorState
        title="Không tìm thấy trạng thái khách buôn"
        message="Trạng thái khách buôn với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : trangThaiKhachBuonConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!trangThai) {
    return null
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
    } catch {
      return "-"
    }
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { label: "Mã Trạng Thái", key: "ma_trang_thai", value: trangThai.ma_trang_thai || "-" },
        { label: "Tên Trạng Thái", key: "ten_trang_thai", value: trangThai.ten_trang_thai },
        { label: "Giai Đoạn", key: "ten_giai_doan", value: trangThai.ten_giai_doan || "-" },
        { label: "Thứ Tự", key: "tt", value: trangThai.tt?.toString() || "-" },
        { 
          label: "Mặc Định Khởi Đầu", 
          key: "mac_dinh_khoi_dau",
          value: trangThai.mac_dinh_khoi_dau === "YES" ? "Có" : "Không" 
        },
        { label: "Mô Tả", key: "mo_ta", value: trangThai.mo_ta || "-", colSpan: 2 },
      ],
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { 
          label: "Người Tạo", 
          key: "nguoi_tao_id",
          value: trangThai.nguoi_tao_id && trangThai.nguoi_tao_ten 
            ? `${trangThai.nguoi_tao_id} - ${trangThai.nguoi_tao_ten}`
            : trangThai.nguoi_tao_id?.toString() || "-"
        },
        { 
          label: "Thời Gian Tạo", 
          key: "tg_tao",
          value: formatDate(trangThai.tg_tao),
          type: "date"
        },
        { 
          label: "Thời Gian Cập Nhật", 
          key: "tg_cap_nhat",
          value: formatDate(trangThai.tg_cap_nhat),
          type: "date"
        },
      ],
    },
  ]

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className={actionButtonClass()}
        onClick={() => {
          if (onEdit) {
            onEdit()
          } else {
            navigate(`${trangThaiKhachBuonConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteTrangThaiKhachBuonButton
        id={id}
        name={trangThai.ten_trang_thai}
      />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={trangThai.ten_trang_thai}
      subtitle={trangThai.ma_trang_thai || "Chi tiết trạng thái khách buôn"}
      sections={sections}
      actions={actions}
      onBack={onBack}
      backUrl={onBack ? undefined : trangThaiKhachBuonConfig.routePath}
    />
  )
}

