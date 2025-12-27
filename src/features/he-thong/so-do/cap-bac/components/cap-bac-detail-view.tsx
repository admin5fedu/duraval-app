"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useCapBacById } from "../hooks/use-cap-bac"
import { DeleteCapBacButton } from "./delete-cap-bac-button"
import { capBacConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"

interface CapBacDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function CapBacDetailView({ id, initialData, onEdit, onBack }: CapBacDetailViewProps) {
  const navigate = useNavigate()
  const query = useCapBacById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const capBac = viewState.data

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
        title="Không tìm thấy cấp bậc"
        message="Cấp bậc với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : capBacConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!capBac) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { label: "Mã Cấp Bậc", key: "ma_cap_bac", value: capBac.ma_cap_bac },
        { label: "Tên Cấp Bậc", key: "ten_cap_bac", value: capBac.ten_cap_bac },
        { label: "Bậc", key: "bac", value: capBac.bac?.toString() || "-" },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { label: "Thời Gian Tạo", key: "tg_tao", value: capBac.tg_tao, type: "datetime" },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: capBac.tg_cap_nhat, type: "datetime" },
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
            navigate(`${capBacConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteCapBacButton id={id} name={capBac.ten_cap_bac} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={capBac.ten_cap_bac}
      subtitle={capBac.ma_cap_bac}
      sections={sections}
      backUrl={onBack ? undefined : capBacConfig.routePath}
      onBack={onBack}
      actions={actions}
      isLoading={query.isLoading && !initialData}
    />
  )
}

