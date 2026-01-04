"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { useHinhAnhKhachBuonById } from "../hooks/use-hinh-anh-khach-buon"
import { hinhAnhKhachBuonConfig } from "../config"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteHinhAnhKhachBuonButton } from "./delete-hinh-anh-khach-buon-button"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { formatDate } from "@/shared/utils/date-format"

interface HinhAnhKhachBuonDetailViewProps {
  id: number
  onBack?: () => void
  backUrl?: string
}

export function HinhAnhKhachBuonDetailView({ id, onBack, backUrl }: HinhAnhKhachBuonDetailViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const query = useHinhAnhKhachBuonById(id, undefined)
  const viewState = useDetailViewStateFromQuery(query, undefined)
  
  const hinhAnhKhachBuon = viewState.data

  const returnTo = searchParams.get('returnTo') || 'list'

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backUrl) {
      navigate(backUrl)
    } else if (returnTo === 'list') {
      navigate(hinhAnhKhachBuonConfig.routePath)
    } else {
      navigate(hinhAnhKhachBuonConfig.routePath)
    }
  }

  const handleEdit = () => {
    navigate(`${hinhAnhKhachBuonConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleDeleteSuccess = () => {
    navigate(hinhAnhKhachBuonConfig.routePath)
  }

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
        title="Không tìm thấy hình ảnh khách buôn"
        message="Hình ảnh khách buôn với ID này không tồn tại hoặc đã bị xóa."
        onBack={handleBack}
        backUrl={backUrl || hinhAnhKhachBuonConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!hinhAnhKhachBuon) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { 
          key: "ten_khach_buon", 
          label: "Khách Buôn", 
          value: hinhAnhKhachBuon.ten_khach_buon || "-",
          colSpan: 2 as const
        },
        { key: "hang_muc", label: "Hạng Mục", value: hinhAnhKhachBuon.hang_muc || "-" },
        { 
          key: "hinh_anh", 
          label: "Hình Ảnh", 
          value: hinhAnhKhachBuon.hinh_anh || "-",
          colSpan: 3 as const
        },
      ]
    },
    {
      title: "Thông Tin Khác",
      fields: [
        { 
          key: "mo_ta", 
          label: "Mô Tả", 
          value: hinhAnhKhachBuon.mo_ta || "-",
          colSpan: 2 as const
        },
        { 
          key: "ghi_chu", 
          label: "Ghi Chú", 
          value: hinhAnhKhachBuon.ghi_chu || "-",
          colSpan: 2 as const
        },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { 
          key: "nguoi_tao_id",
          label: "Người Tạo", 
          value: hinhAnhKhachBuon.nguoi_tao_id ? String(hinhAnhKhachBuon.nguoi_tao_id) : "-"
        },
        { 
          key: "tg_tao",
          label: "Thời Gian Tạo", 
          value: formatDate(hinhAnhKhachBuon.tg_tao),
          type: "date"
        },
        { 
          key: "tg_cap_nhat",
          label: "Thời Gian Cập Nhật", 
          value: formatDate(hinhAnhKhachBuon.tg_cap_nhat),
          type: "date"
        },
      ]
    },
  ]

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleEdit}
        className={actionButtonClass()}
      >
        <Edit className="mr-2 h-4 w-4" />
        Sửa
      </Button>
      <DeleteHinhAnhKhachBuonButton 
        id={id} 
        name={hinhAnhKhachBuon.hang_muc || `Hình ảnh #${id}`}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={hinhAnhKhachBuon.hang_muc || `Hình ảnh #${id}`}
      subtitle={hinhAnhKhachBuon.ten_khach_buon || "Chi tiết hình ảnh khách buôn"}
      sections={sections}
      actions={actions}
      onBack={handleBack}
      backUrl={backUrl || (returnTo === 'list' ? hinhAnhKhachBuonConfig.routePath : undefined)}
    />
  )
}

