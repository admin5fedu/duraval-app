"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useChiNhanhById } from "../hooks/use-chi-nhanh"
import { DeleteChiNhanhButton } from "./delete-chi-nhanh-button"
import { chiNhanhConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"

interface ChiNhanhDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function ChiNhanhDetailView({ id, initialData, onEdit, onBack }: ChiNhanhDetailViewProps) {
  const navigate = useNavigate()
  const query = useChiNhanhById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const chiNhanh = viewState.data

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
        title="Không tìm thấy chi nhánh"
        message="Chi nhánh với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : chiNhanhConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!chiNhanh) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { label: "Mã Chi Nhánh", key: "ma_chi_nhanh", value: chiNhanh.ma_chi_nhanh },
        { label: "Tên Chi Nhánh", key: "ten_chi_nhanh", value: chiNhanh.ten_chi_nhanh },
        { label: "Địa Chỉ", key: "dia_chi", value: chiNhanh.dia_chi || "-", colSpan: 2 },
      ]
    },
    {
      title: "Thông Tin Bổ Sung",
      fields: [
        { 
          label: "Hình Ảnh", 
          key: "hinh_anh", 
          value: chiNhanh.hinh_anh, 
          type: "image",
          colSpan: 2,
        },
        { 
          label: "Định Vị", 
          key: "dinh_vi", 
          value: chiNhanh.dinh_vi ? "Xem vị trí" : "-", 
          type: "url",
          link: chiNhanh.dinh_vi ? (chiNhanh.dinh_vi.startsWith('http') ? chiNhanh.dinh_vi : `https://${chiNhanh.dinh_vi}`) : undefined,
          colSpan: 2,
        },
        { label: "Mô Tả", key: "mo_ta", value: chiNhanh.mo_ta || "-", colSpan: 2 },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { label: "Thời Gian Tạo", key: "tg_tao", value: chiNhanh.tg_tao, type: "date" },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: chiNhanh.tg_cap_nhat, type: "date" },
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
            navigate(`${chiNhanhConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteChiNhanhButton id={id} name={chiNhanh.ten_chi_nhanh} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={chiNhanh.ten_chi_nhanh}
      subtitle={chiNhanh.ma_chi_nhanh}
      sections={sections}
      backUrl={onBack ? undefined : chiNhanhConfig.routePath}
      onBack={onBack}
      actions={actions}
      isLoading={query.isLoading && !initialData}
    />
  )
}

