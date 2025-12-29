"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { usePhongBanById } from "../hooks/use-phong-ban"
import { DeletePhongBanButton } from "./delete-phong-ban-button"
import { phongBanConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { usePhongBan } from "../hooks/use-phong-ban"

interface PhongBanDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function PhongBanDetailView({ id, initialData, onEdit, onBack }: PhongBanDetailViewProps) {
  const navigate = useNavigate()
  const query = usePhongBanById(id, initialData)
  const { data: phongBanList } = usePhongBan()
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const phongBan = viewState.data

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
        title="Không tìm thấy phòng ban"
        message="Phòng ban với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : phongBanConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!phongBan) {
    return null
  }

  // Find trực thuộc phòng ban để hiển thị "mã - tên"
  const trucThuocPhongBan = phongBan.truc_thuoc_id 
    ? phongBanList?.find((pb) => pb.id === phongBan.truc_thuoc_id)
    : null

  const trucThuocDisplay = trucThuocPhongBan
    ? `${trucThuocPhongBan.ma_phong_ban} - ${trucThuocPhongBan.ten_phong_ban}`
    : (phongBan.truc_thuoc_phong_ban || "-")

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { label: "Số Thứ Tự", key: "tt", value: phongBan.tt ?? "-" },
        { label: "Mã Phòng Ban", key: "ma_phong_ban", value: phongBan.ma_phong_ban },
        { label: "Tên Phòng Ban", key: "ten_phong_ban", value: phongBan.ten_phong_ban },
        { label: "Cấp Độ", key: "cap_do", value: phongBan.cap_do },
      ]
    },
    {
      title: "Thông Tin Trực Thuộc",
      fields: [
        { 
          label: "Trực Thuộc Phòng Ban", 
          key: "truc_thuoc_phong_ban", 
          value: trucThuocDisplay,
          colSpan: 2,
        },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { label: "Thời Gian Tạo", key: "tg_tao", value: phongBan.tg_tao, type: "date" },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: phongBan.tg_cap_nhat, type: "date" },
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
            navigate(`${phongBanConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeletePhongBanButton id={id} name={phongBan.ten_phong_ban} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={phongBan.ten_phong_ban}
      subtitle={phongBan.ma_phong_ban}
      sections={sections}
      backUrl={onBack ? undefined : phongBanConfig.routePath}
      onBack={onBack}
      actions={actions}
      isLoading={query.isLoading && !initialData}
    />
  )
}

