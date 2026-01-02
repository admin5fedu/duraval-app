"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit, Plus } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useQuanHuyenTSNById } from "../hooks/use-quan-huyen-tsn"
import { DeleteQuanHuyenTSNButton } from "./delete-quan-huyen-tsn-button"
import { quanHuyenTSNConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface QuanHuyenTSNDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function QuanHuyenTSNDetailView({ id, initialData, onEdit, onBack }: QuanHuyenTSNDetailViewProps) {
  const navigate = useNavigate()
  const query = useQuanHuyenTSNById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const quanHuyen = viewState.data

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
        title="Không tìm thấy quận huyện TSN"
        message="Quận huyện TSN với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : quanHuyenTSNConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!quanHuyen) {
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
        { label: "Mã - Tên Tỉnh Thành", key: "tinh_thanh", value: `${quanHuyen.ma_tinh_thanh} - ${quanHuyen.ten_tinh_thanh}`, colSpan: 2 },
        { label: "Mã Quận Huyện", key: "ma_quan_huyen", value: quanHuyen.ma_quan_huyen, type: "text" },
        { label: "Tên Quận Huyện", key: "ten_quan_huyen", value: quanHuyen.ten_quan_huyen },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { label: "Thời Gian Tạo", key: "tg_tao", value: formatDate(quanHuyen.tg_tao) },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDate(quanHuyen.tg_cap_nhat) },
      ]
    },
  ]

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      navigate(`${quanHuyenTSNConfig.routePath}/${id}/sua?returnTo=detail`)
    }
  }

  const handleAddNew = () => {
    navigate(`${quanHuyenTSNConfig.routePath}/moi`)
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(quanHuyenTSNConfig.routePath)
    }
  }

  const title = quanHuyen.ten_quan_huyen || `Quận huyện #${id}`
  const subtitle = quanHuyen.ma_quan_huyen

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
          <DeleteQuanHuyenTSNButton 
            id={id} 
            name={quanHuyen.ten_quan_huyen} 
          />
        </>
      }
    />
  )
}

