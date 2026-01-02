"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit, Plus } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { usePhuongXaTSNById } from "../hooks/use-phuong-xa-tsn"
import { DeletePhuongXaTSNButton } from "./delete-phuong-xa-tsn-button"
import { phuongXaTSNConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface PhuongXaTSNDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function PhuongXaTSNDetailView({ id, initialData, onEdit, onBack }: PhuongXaTSNDetailViewProps) {
  const navigate = useNavigate()
  const query = usePhuongXaTSNById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const phuongXa = viewState.data

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
        title="Không tìm thấy phường xã TSN"
        message="Phường xã TSN với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : phuongXaTSNConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!phuongXa) {
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
        { label: "Mã - Tên Quận Huyện", key: "quan_huyen", value: `${phuongXa.ma_quan_huyen} - ${phuongXa.ten_quan_huyen}`, colSpan: 2 },
        { label: "Mã - Tên Tỉnh Thành", key: "tinh_thanh", value: phuongXa.ma_tinh_thanh && phuongXa.ten_tinh_thanh ? `${phuongXa.ma_tinh_thanh} - ${phuongXa.ten_tinh_thanh}` : "-", colSpan: 2 },
        { label: "Mã Phường Xã", key: "ma_phuong_xa", value: phuongXa.ma_phuong_xa, type: "text" },
        { label: "Tên Phường Xã", key: "ten_phuong_xa", value: phuongXa.ten_phuong_xa },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { label: "Thời Gian Tạo", key: "tg_tao", value: formatDate(phuongXa.tg_tao) },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDate(phuongXa.tg_cap_nhat) },
      ]
    },
  ]

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      navigate(`${phuongXaTSNConfig.routePath}/${id}/sua?returnTo=detail`)
    }
  }

  const handleAddNew = () => {
    navigate(`${phuongXaTSNConfig.routePath}/moi`)
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(phuongXaTSNConfig.routePath)
    }
  }

  const title = phuongXa.ten_phuong_xa || `Phường xã #${id}`
  const subtitle = phuongXa.ma_phuong_xa

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
          <DeletePhuongXaTSNButton 
            id={id} 
            name={phuongXa.ten_phuong_xa} 
          />
        </>
      }
    />
  )
}

