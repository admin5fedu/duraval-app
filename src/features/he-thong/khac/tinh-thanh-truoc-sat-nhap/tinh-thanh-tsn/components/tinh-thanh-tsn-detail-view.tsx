"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit, Plus } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useTinhThanhTSNById } from "../hooks/use-tinh-thanh-tsn"
import { DeleteTinhThanhTSNButton } from "./delete-tinh-thanh-tsn-button"
import { tinhThanhTSNConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface TinhThanhTSNDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function TinhThanhTSNDetailView({ id, initialData, onEdit, onBack }: TinhThanhTSNDetailViewProps) {
  const navigate = useNavigate()
  const query = useTinhThanhTSNById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const tinhThanh = viewState.data

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
        title="Không tìm thấy tỉnh thành TSN"
        message="Tỉnh thành TSN với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : tinhThanhTSNConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!tinhThanh) {
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
        { label: "Mã Tỉnh Thành", key: "ma_tinh_thanh", value: tinhThanh.ma_tinh_thanh, type: "text" },
        { label: "Tên Tỉnh Thành", key: "ten_tinh_thanh", value: tinhThanh.ten_tinh_thanh },
        { label: "Miền", key: "mien", value: tinhThanh.mien || "-" },
        { label: "Vùng", key: "vung", value: tinhThanh.vung || "-", colSpan: 2 },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { label: "Thời Gian Tạo", key: "tg_tao", value: formatDate(tinhThanh.tg_tao) },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDate(tinhThanh.tg_cap_nhat) },
      ]
    },
  ]

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      navigate(`${tinhThanhTSNConfig.routePath}/${id}/sua?returnTo=detail`)
    }
  }

  const handleAddNew = () => {
    navigate(`${tinhThanhTSNConfig.routePath}/moi`)
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(tinhThanhTSNConfig.routePath)
    }
  }

  const title = tinhThanh.ten_tinh_thanh || `Tỉnh thành #${id}`
  const subtitle = tinhThanh.ma_tinh_thanh

  return (
    <GenericDetailViewSimple
      title={title}
      subtitle={subtitle}
      sections={sections}
      onBack={handleBack}
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            className={actionButtonClass()}
            onClick={handleAddNew}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm Mới
          </Button>
          <Button
            variant="default"
            size="sm"
            className={actionButtonClass()}
            onClick={handleEdit}
          >
            <Edit className="mr-2 h-4 w-4" />
            Sửa
          </Button>
          <DeleteTinhThanhTSNButton 
            id={id} 
            name={tinhThanh.ten_tinh_thanh} 
          />
        </>
      }
    />
  )
}

