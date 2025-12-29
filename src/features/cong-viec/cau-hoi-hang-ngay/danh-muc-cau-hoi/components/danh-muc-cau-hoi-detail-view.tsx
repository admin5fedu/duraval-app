"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useDanhMucCauHoiById } from "../hooks"
import { DeleteDanhMucCauHoiButton } from "./delete-danh-muc-cau-hoi-button"
import { danhMucCauHoiConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface DanhMucCauHoiDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function DanhMucCauHoiDetailView({ id, initialData, onEdit, onBack }: DanhMucCauHoiDetailViewProps) {
  const navigate = useNavigate()
  const query = useDanhMucCauHoiById(id, initialData)
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
        title="Không tìm thấy danh mục câu hỏi"
        message="Danh mục câu hỏi với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : danhMucCauHoiConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  const danhMucCauHoi = viewState.data
  if (!danhMucCauHoi) {
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

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { label: "Tên Nhóm", key: "ten_nhom", value: danhMucCauHoi.ten_nhom },
        { label: "Mô Tả", key: "mo_ta", value: danhMucCauHoi.mo_ta || "-" },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { label: "Thời Gian Tạo", key: "tg_tao", value: formatDateTime(danhMucCauHoi.tg_tao) },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDateTime(danhMucCauHoi.tg_cap_nhat) },
        { 
          label: "Người Tạo", 
          key: "nguoi_tao_id", 
          value: danhMucCauHoi.nguoi_tao_id 
            ? `${danhMucCauHoi.nguoi_tao_id}${danhMucCauHoi.nguoi_tao_ten ? ` - ${danhMucCauHoi.nguoi_tao_ten}` : ''}`
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
            navigate(`${danhMucCauHoiConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteDanhMucCauHoiButton id={id} name={danhMucCauHoi.ten_nhom} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={danhMucCauHoi.ten_nhom}
      subtitle={danhMucCauHoi.mo_ta || "Danh mục câu hỏi hàng ngày"}
      sections={sections}
      backUrl={onBack ? undefined : danhMucCauHoiConfig.routePath}
      onBack={onBack}
      actions={actions}
    />
  )
}

