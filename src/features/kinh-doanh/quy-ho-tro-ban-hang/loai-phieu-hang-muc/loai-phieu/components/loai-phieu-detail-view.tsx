"use client"

import { useNavigate } from "react-router-dom"
import { useRef } from "react"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit, Plus } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useLoaiPhieuById } from "../hooks/use-loai-phieu"
import { DeleteLoaiPhieuButton } from "./delete-loai-phieu-button"
import { loaiPhieuConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { HangMucSection, type HangMucSectionRef } from "./hang-muc-section"

interface LoaiPhieuDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function LoaiPhieuDetailView({ id, initialData, onEdit, onBack }: LoaiPhieuDetailViewProps) {
  const navigate = useNavigate()
  const query = useLoaiPhieuById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  const hangMucSectionRef = useRef<HangMucSectionRef>(null)
  
  const loaiPhieu = viewState.data

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
        title="Không tìm thấy loại phiếu"
        message="Loại phiếu với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : loaiPhieuConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!loaiPhieu) {
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
        { label: "Tên Loại Phiếu", key: "ten_loai_phieu", value: loaiPhieu.ten_loai_phieu },
        { label: "Mô Tả", key: "mo_ta", value: loaiPhieu.mo_ta || "-", colSpan: 2 },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { 
          label: "Người Tạo", 
          key: "nguoi_tao_id", 
          value: loaiPhieu.nguoi_tao_id 
            ? `${loaiPhieu.nguoi_tao_id}${loaiPhieu.nguoi_tao_ten ? ` - ${loaiPhieu.nguoi_tao_ten}` : ''}`
            : "-" 
        },
        { label: "Thời Gian Tạo", key: "tg_tao", value: formatDate(loaiPhieu.tg_tao), type: "date" },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDate(loaiPhieu.tg_cap_nhat), type: "date" },
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
          hangMucSectionRef.current?.openAddDialog()
        }}
        data-action="add-hang-muc"
      >
        <Plus className="mr-2 h-4 w-4" /> Thêm Hạng Mục
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={actionButtonClass()}
        onClick={() => {
          if (onEdit) {
            onEdit()
          } else {
            navigate(`${loaiPhieuConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteLoaiPhieuButton id={id} name={loaiPhieu.ten_loai_phieu} />
    </div>
  )

  return (
    <>
      <GenericDetailViewSimple
        title={loaiPhieu.ten_loai_phieu}
        subtitle="Chi tiết loại phiếu"
        sections={sections}
        actions={actions}
        onBack={onBack}
        backUrl={onBack ? undefined : loaiPhieuConfig.routePath}
      />
      
      {/* Hạng Mục Section */}
      <div className="mt-6">
        <HangMucSection ref={hangMucSectionRef} loaiPhieuId={id} />
      </div>
    </>
  )
}

