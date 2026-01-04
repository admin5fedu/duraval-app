"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useGiaiDoanKhachBuonById } from "../hooks/use-giai-doan-khach-buon"
import { DeleteGiaiDoanKhachBuonButton } from "./delete-giai-doan-khach-buon-button"
import { giaiDoanKhachBuonConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface GiaiDoanKhachBuonDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function GiaiDoanKhachBuonDetailView({ id, initialData, onEdit, onBack }: GiaiDoanKhachBuonDetailViewProps) {
  const navigate = useNavigate()
  const query = useGiaiDoanKhachBuonById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const giaiDoan = viewState.data

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
        title="Không tìm thấy giai đoạn khách buôn"
        message="Giai đoạn khách buôn với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : giaiDoanKhachBuonConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!giaiDoan) {
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
        { label: "Mã Giai Đoạn", key: "ma_giai_doan", value: giaiDoan.ma_giai_doan || "-" },
        { label: "Tên Giai Đoạn", key: "ten_giai_doan", value: giaiDoan.ten_giai_doan },
        { label: "Thứ Tự", key: "tt", value: giaiDoan.tt ?? "-" },
        { label: "Mô Tả", key: "mo_ta", value: giaiDoan.mo_ta || "-", colSpan: 2 },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { 
          label: "Người Tạo", 
          key: "nguoi_tao_id", 
          value: giaiDoan.nguoi_tao_id 
            ? `${giaiDoan.nguoi_tao_id}${giaiDoan.nguoi_tao_ten ? ` - ${giaiDoan.nguoi_tao_ten}` : ''}`
            : "-" 
        },
        { label: "Thời Gian Tạo", key: "tg_tao", value: formatDate(giaiDoan.tg_tao), type: "date" },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDate(giaiDoan.tg_cap_nhat), type: "date" },
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
            navigate(`${giaiDoanKhachBuonConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteGiaiDoanKhachBuonButton id={id} name={giaiDoan.ten_giai_doan} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={giaiDoan.ten_giai_doan}
      subtitle="Chi tiết giai đoạn khách buôn"
      sections={sections}
      actions={actions}
      onBack={onBack}
      backUrl={onBack ? undefined : giaiDoanKhachBuonConfig.routePath}
    />
  )
}

