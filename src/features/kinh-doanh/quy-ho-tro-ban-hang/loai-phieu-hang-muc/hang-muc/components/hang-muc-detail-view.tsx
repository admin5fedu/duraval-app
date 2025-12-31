"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useHangMucById } from "../hooks/use-hang-muc"
import { DeleteHangMucButton } from "./delete-hang-muc-button"
import { hangMucConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface HangMucDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function HangMucDetailView({ id, initialData, onEdit, onBack }: HangMucDetailViewProps) {
  const navigate = useNavigate()
  const query = useHangMucById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const hangMuc = viewState.data

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
        title="Không tìm thấy hạng mục"
        message="Hạng mục với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : hangMucConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!hangMuc) {
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
        { label: "Loại Phiếu", key: "ten_loai_phieu", value: hangMuc.ten_loai_phieu || "-" },
        { label: "Tên Hạng Mục", key: "ten_hang_muc", value: hangMuc.ten_hang_muc },
        { label: "Mô Tả", key: "mo_ta", value: hangMuc.mo_ta || "-", colSpan: 2 },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { 
          label: "Người Tạo", 
          key: "nguoi_tao_id", 
          value: hangMuc.nguoi_tao_id 
            ? `${hangMuc.nguoi_tao_id}${hangMuc.nguoi_tao_ten ? ` - ${hangMuc.nguoi_tao_ten}` : ''}`
            : "-" 
        },
        { label: "Thời Gian Tạo", key: "tg_tao", value: formatDate(hangMuc.tg_tao), type: "date" },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDate(hangMuc.tg_cap_nhat), type: "date" },
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
            navigate(`${hangMucConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteHangMucButton id={id} name={hangMuc.ten_hang_muc} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={hangMuc.ten_hang_muc}
      subtitle={hangMuc.ten_loai_phieu ? `Loại phiếu: ${hangMuc.ten_loai_phieu}` : "Chi tiết hạng mục"}
      sections={sections}
      actions={actions}
      onBack={onBack}
      backUrl={onBack ? undefined : hangMucConfig.routePath}
    />
  )
}

