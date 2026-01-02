"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useQuyHTBHTheoThangById } from "../hooks"
import { DeleteQuyHTBHTheoThangButton } from "./delete-quy-htbh-theo-thang-button"
import { quyHTBHTheoThangConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface QuyHTBHTheoThangDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function QuyHTBHTheoThangDetailView({ id, initialData, onEdit, onBack }: QuyHTBHTheoThangDetailViewProps) {
  const navigate = useNavigate()
  const query = useQuyHTBHTheoThangById(id, initialData)
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
        title="Không tìm thấy quỹ HTBH theo tháng"
        message="Quỹ HTBH theo tháng với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : quyHTBHTheoThangConfig.routePath}
      />
    )
  }

  const quyHTBH = viewState.data
  if (!quyHTBH) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { label: "ID", key: "id", value: quyHTBH.id, type: "number" },
        { label: "Năm", key: "nam", value: quyHTBH.nam, type: "number" },
        { label: "Tháng", key: "thang", value: quyHTBH.thang, type: "number" },
        { label: "ID Nhân viên", key: "nhan_vien_id", value: quyHTBH.nhan_vien_id, type: "number" },
      ]
    },
    {
      title: "Thông Tin Quỹ",
      fields: [
        { label: "Quỹ", key: "quy", value: quyHTBH.quy || "-" },
        { label: "Số tiền quỹ", key: "so_tien_quy", value: quyHTBH.so_tien_quy, type: "currency" },
        { label: "Đã dùng", key: "da_dung", value: quyHTBH.da_dung, type: "currency" },
        { label: "Còn dư", key: "con_du", value: quyHTBH.con_du, type: "currency" },
      ]
    },
    {
      title: "Ghi Chú & Khác",
      fields: [
        { label: "Ghi chú", key: "ghi_chu", value: quyHTBH.ghi_chu || "-", colSpan: 3 },
        { 
          label: "Ngày tạo", 
          key: "tg_tao", 
          value: quyHTBH.tg_tao ? format(new Date(quyHTBH.tg_tao), "dd/MM/yyyy HH:mm", { locale: vi }) : "-",
          type: "date"
        },
        { 
          label: "Ngày cập nhật", 
          key: "tg_cap_nhat", 
          value: quyHTBH.tg_cap_nhat ? format(new Date(quyHTBH.tg_cap_nhat), "dd/MM/yyyy HH:mm", { locale: vi }) : "-",
          type: "date"
        },
      ]
    }
  ]

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        size="sm"
        className={actionButtonClass()}
        onClick={() => {
          if (onEdit) {
            onEdit()
          } else {
            navigate(`${quyHTBHTheoThangConfig.routePath}/${id}/sua`)
          }
        }}
      >
        <Edit className="mr-2 h-4 w-4" />
        Sửa
      </Button>
      <DeleteQuyHTBHTheoThangButton id={id} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={`Quỹ HTBH theo tháng #${quyHTBH.id}`}
      subtitle={quyHTBH.ten_nhan_vien || ""}
      sections={sections}
      actions={actions}
      onBack={onBack}
      backUrl={onBack ? undefined : quyHTBHTheoThangConfig.routePath}
    />
  )
}

