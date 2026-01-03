"use client"

import { useNavigate } from "react-router-dom"
import { useRef } from "react"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit, HelpCircle } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useChuyenDeById } from "../hooks/use-chuyen-de"
import { DeleteChuyenDeButton } from "./delete-chuyen-de-button"
import { chuyenDeConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CauHoiSection, type CauHoiSectionRef } from "./cau-hoi-section"

interface ChuyenDeDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function ChuyenDeDetailView({ id, initialData, onEdit, onBack }: ChuyenDeDetailViewProps) {
  const navigate = useNavigate()
  const query = useChuyenDeById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  const cauHoiSectionRef = useRef<CauHoiSectionRef>(null)
  
  const chuyenDe = viewState.data

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
        title="Không tìm thấy chuyên đề"
        message="Chuyên đề với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : chuyenDeConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!chuyenDe) {
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
        { label: "Nhóm Chuyên Đề", key: "ten_nhom_chuyen_de", value: chuyenDe.ten_nhom_chuyen_de || "-" },
        { label: "Tên Chuyên Đề", key: "ten_chuyen_de", value: chuyenDe.ten_chuyen_de },
        { label: "Mô Tả", key: "mo_ta", value: chuyenDe.mo_ta || "-", colSpan: 2 as const },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { label: "Người Tạo ID", key: "nguoi_tao_id", value: chuyenDe.nguoi_tao_id?.toString() || "-" },
        { label: "Thời Gian Tạo", key: "tg_tao", value: formatDate(chuyenDe.tg_tao) },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDate(chuyenDe.tg_cap_nhat) },
      ]
    },
  ]

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      navigate(`${chuyenDeConfig.routePath}/${id}/sua?returnTo=detail`)
    }
  }

  const handleAddCauHoi = () => {
    cauHoiSectionRef.current?.handleAdd()
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(chuyenDeConfig.routePath)
    }
  }

  const title = chuyenDe.ten_chuyen_de || `Chuyên đề #${id}`
  const subtitle = chuyenDe.ten_nhom_chuyen_de || `ID: ${id}`

  return (
    <>
      <GenericDetailViewSimple
        title={title}
        subtitle={subtitle}
        sections={sections}
        backUrl={onBack ? undefined : chuyenDeConfig.routePath}
        onBack={handleBack}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className={actionButtonClass()}
              onClick={handleAddCauHoi}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Thêm Câu Hỏi
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={actionButtonClass()}
              onClick={handleEdit}
            >
              <Edit className="mr-2 h-4 w-4" />
              Sửa
            </Button>
            <DeleteChuyenDeButton 
              id={id} 
              name={chuyenDe.ten_chuyen_de} 
            />
          </>
        }
        isLoading={query.isLoading && !initialData}
      />
      
      {/* Câu Hỏi Section */}
      <div className="mt-6">
        <CauHoiSection ref={cauHoiSectionRef} chuyenDeId={id} />
      </div>
    </>
  )
}

