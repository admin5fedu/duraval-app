"use client"
import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useCauTraLoiById } from "../hooks"
import { DeleteCauTraLoiButton } from "./delete-cau-tra-loi-button"
import { cauTraLoiConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { getResultBadgeClass } from "@/components/ui/status-badge"

interface CauTraLoiDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function CauTraLoiDetailView({ 
  id, 
  initialData, 
  onEdit, 
  onBack 
}: CauTraLoiDetailViewProps) {
  const navigate = useNavigate()
  const query = useCauTraLoiById(id, initialData)
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
        title="Không tìm thấy câu trả lời"
        message="Câu trả lời với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : cauTraLoiConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  const cauTraLoi = viewState.data
  if (!cauTraLoi) {
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
        { 
          label: "Lịch Đăng", 
          key: "lich_dang_cau_hoi", 
          value: cauTraLoi.lich_dang_cau_hoi || "-",
        },
        { 
          label: "Câu Trả Lời", 
          key: "cau_tra_loi", 
          value: cauTraLoi.cau_tra_loi || "-",
          colSpan: 3
        },
        { 
          label: "Kết Quả", 
          key: "ket_qua", 
          value: cauTraLoi.ket_qua || "-",
          type: "badge",
          format: (value) => {
            if (!value) return <span className="text-muted-foreground text-sm italic">Chưa có dữ liệu</span>
            const className = getResultBadgeClass(value as string)
            return (
              <Badge variant="outline" className={className}>
                {value as string}
              </Badge>
            )
          }
        },
        { 
          label: "Người Tạo", 
          key: "nguoi_tao_ten", 
          value: cauTraLoi.nguoi_tao_id 
            ? `${cauTraLoi.nguoi_tao_id}${cauTraLoi.nguoi_tao_ten ? ` - ${cauTraLoi.nguoi_tao_ten}` : ''}`
            : "-"
        },
        { 
          label: "Thời Gian Tạo", 
          key: "tg_tao", 
          value: formatDateTime(cauTraLoi.tg_tao)
        },
        { 
          label: "Thời Gian Cập Nhật", 
          key: "tg_cap_nhat", 
          value: formatDateTime(cauTraLoi.tg_cap_nhat)
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
            navigate(`${cauTraLoiConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteCauTraLoiButton id={id} name={cauTraLoi.cau_tra_loi || "Câu trả lời"} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={`Câu Trả Lời #${cauTraLoi.id}`}
      subtitle={cauTraLoi.lich_dang_cau_hoi || "Chi tiết câu trả lời"}
      sections={sections}
      backUrl={onBack ? undefined : cauTraLoiConfig.routePath}
      onBack={onBack}
      actions={actions}
    />
  )
}

