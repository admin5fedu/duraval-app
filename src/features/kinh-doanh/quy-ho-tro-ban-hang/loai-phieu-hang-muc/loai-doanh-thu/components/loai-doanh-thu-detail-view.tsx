"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useLoaiDoanhThuById } from "../hooks/use-loai-doanh-thu"
import { DeleteLoaiDoanhThuButton } from "./delete-loai-doanh-thu-button"
import { loaiDoanhThuConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface LoaiDoanhThuDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function LoaiDoanhThuDetailView({ id, initialData, onEdit, onBack }: LoaiDoanhThuDetailViewProps) {
  const navigate = useNavigate()
  const query = useLoaiDoanhThuById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const loaiDoanhThu = viewState.data

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
        title="Không tìm thấy loại doanh thu"
        message="Loại doanh thu với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : loaiDoanhThuConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!loaiDoanhThu) {
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
        { label: "Tên Doanh Thu", key: "ten_doanh_thu", value: loaiDoanhThu.ten_doanh_thu },
        { label: "Mô Tả", key: "mo_ta", value: loaiDoanhThu.mo_ta || "-", colSpan: 2 },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { 
          label: "Người Tạo", 
          key: "nguoi_tao_id", 
          value: loaiDoanhThu.nguoi_tao_id 
            ? `${loaiDoanhThu.nguoi_tao_id}${loaiDoanhThu.nguoi_tao_ten ? ` - ${loaiDoanhThu.nguoi_tao_ten}` : ''}`
            : "-" 
        },
        { label: "Thời Gian Tạo", key: "tg_tao", value: formatDate(loaiDoanhThu.tg_tao), type: "date" },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDate(loaiDoanhThu.tg_cap_nhat), type: "date" },
      ]
    }
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
            navigate(`${loaiDoanhThuConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteLoaiDoanhThuButton id={id} name={loaiDoanhThu.ten_doanh_thu} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={loaiDoanhThu.ten_doanh_thu}
      subtitle="Chi tiết loại doanh thu"
      sections={sections}
      actions={actions}
      onBack={onBack}
      backUrl={onBack ? undefined : loaiDoanhThuConfig.routePath}
    />
  )
}

