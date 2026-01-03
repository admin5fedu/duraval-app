"use client"

import { useNavigate } from "react-router-dom"
import { useRef } from "react"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit, BookOpen } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useNhomChuyenDeById } from "../hooks/use-nhom-chuyen-de"
import { DeleteNhomChuyenDeButton } from "./delete-nhom-chuyen-de-button"
import { nhomChuyenDeConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { ChuyenDeSection, type ChuyenDeSectionRef } from "./chuyen-de-section"

interface NhomChuyenDeDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function NhomChuyenDeDetailView({ id, initialData, onEdit, onBack }: NhomChuyenDeDetailViewProps) {
  const navigate = useNavigate()
  const query = useNhomChuyenDeById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  const chuyenDeSectionRef = useRef<ChuyenDeSectionRef>(null)
  
  const nhomChuyenDe = viewState.data

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
        title="Không tìm thấy nhóm chuyên đề"
        message="Nhóm chuyên đề với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : nhomChuyenDeConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!nhomChuyenDe) {
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
        { label: "Tên Nhóm", key: "ten_nhom", value: nhomChuyenDe.ten_nhom },
        { label: "Mô Tả", key: "mo_ta", value: nhomChuyenDe.mo_ta || "-", colSpan: 2 as const },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { label: "Người Tạo ID", key: "nguoi_tao_id", value: nhomChuyenDe.nguoi_tao_id?.toString() || "-" },
        { label: "Thời Gian Tạo", key: "tg_tao", value: formatDate(nhomChuyenDe.tg_tao) },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDate(nhomChuyenDe.tg_cap_nhat) },
      ]
    },
  ]

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      navigate(`${nhomChuyenDeConfig.routePath}/${id}/sua?returnTo=detail`)
    }
  }

  const handleAddChuyenDe = () => {
    chuyenDeSectionRef.current?.handleAdd()
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(nhomChuyenDeConfig.routePath)
    }
  }

  const title = nhomChuyenDe.ten_nhom || `Nhóm chuyên đề #${id}`
  const subtitle = `ID: ${id}`

  return (
    <>
      <GenericDetailViewSimple
        title={title}
        subtitle={subtitle}
        sections={sections}
        backUrl={onBack ? undefined : nhomChuyenDeConfig.routePath}
        onBack={handleBack}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className={actionButtonClass()}
              onClick={handleAddChuyenDe}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Thêm Chuyên Đề
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
            <DeleteNhomChuyenDeButton 
              id={id} 
              name={nhomChuyenDe.ten_nhom} 
            />
          </>
        }
        isLoading={query.isLoading && !initialData}
      />
      
      {/* Chuyên Đề Section */}
      <div className="mt-6">
        <ChuyenDeSection ref={chuyenDeSectionRef} nhomChuyenDeId={id} />
      </div>
    </>
  )
}

