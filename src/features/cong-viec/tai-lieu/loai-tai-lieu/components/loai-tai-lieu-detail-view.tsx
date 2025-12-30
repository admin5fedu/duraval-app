"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useLoaiTaiLieuById } from "../hooks"
import { DeleteLoaiTaiLieuButton } from "./delete-loai-tai-lieu-button"
import { loaiTaiLieuConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface LoaiTaiLieuDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function LoaiTaiLieuDetailView({ id, initialData, onEdit, onBack }: LoaiTaiLieuDetailViewProps) {
  const navigate = useNavigate()
  const query = useLoaiTaiLieuById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)

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
        title="Không tìm thấy loại tài liệu"
        message="Loại tài liệu với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : loaiTaiLieuConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  const loaiTaiLieu = viewState.data
  if (!loaiTaiLieu) {
    return null
  }

  // Format dates
  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-"
    try {
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: vi })
    } catch {
      return dateStr
    }
  }

  const displayTitle = loaiTaiLieu.hang_muc || loaiTaiLieu.loai || `ID: ${loaiTaiLieu.id}`
  const displaySubtitle = loaiTaiLieu.mo_ta || "Loại tài liệu"

  // Badge color mapping for hang_muc
  const badgeColorMap: Record<string, string> = {
    "Biểu mẫu & Kế hoạch": "bg-blue-50 text-blue-700 border-blue-200",
    "Văn bản hệ thống": "bg-purple-50 text-purple-700 border-purple-200",
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { 
          label: "Hạng Mục", 
          key: "hang_muc", 
          value: loaiTaiLieu.hang_muc || "-",
          format: (val: any) => {
            if (!val || val === "-") return "-"
            const badgeClass = badgeColorMap[val] || "bg-gray-50 text-gray-700 border-gray-200"
            return (
              <Badge variant="outline" className={badgeClass}>
                {val}
              </Badge>
            )
          }
        },
        { label: "Loại", key: "loai", value: loaiTaiLieu.loai || "-" },
        { label: "Mô Tả", key: "mo_ta", value: loaiTaiLieu.mo_ta || "-" },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { label: "Thời Gian Tạo", key: "tg_tao", value: formatDateTime(loaiTaiLieu.tg_tao) },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDateTime(loaiTaiLieu.tg_cap_nhat) },
        { 
          label: "Người Tạo", 
          key: "nguoi_tao_id", 
          value: loaiTaiLieu.nguoi_tao_id 
            ? `${loaiTaiLieu.nguoi_tao_id}${loaiTaiLieu.nguoi_tao_ten ? ` - ${loaiTaiLieu.nguoi_tao_ten}` : ''}`
            : "-"
        },
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
            navigate(`${loaiTaiLieuConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteLoaiTaiLieuButton id={id} name={displayTitle} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={displayTitle}
      subtitle={displaySubtitle}
      sections={sections}
      backUrl={onBack ? undefined : loaiTaiLieuConfig.routePath}
      onBack={onBack}
      actions={actions}
    />
  )
}

