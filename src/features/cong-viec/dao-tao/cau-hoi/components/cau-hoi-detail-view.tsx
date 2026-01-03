"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useCauHoiById } from "../hooks/use-cau-hoi"
import { DeleteCauHoiButton } from "./delete-cau-hoi-button"
import { cauHoiConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

interface CauHoiDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function CauHoiDetailView({ id, initialData, onEdit, onBack }: CauHoiDetailViewProps) {
  const navigate = useNavigate()
  const query = useCauHoiById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const cauHoi = viewState.data

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
        title="Không tìm thấy câu hỏi"
        message="Câu hỏi với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : cauHoiConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!cauHoi) {
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
        { label: "Chuyên Đề", key: "ten_chuyen_de", value: cauHoi.ten_chuyen_de || "-" },
        { label: "Câu Hỏi", key: "cau_hoi", value: cauHoi.cau_hoi, colSpan: 2 as const },
      ]
    },
    ...(cauHoi.hinh_anh && Array.isArray(cauHoi.hinh_anh) && cauHoi.hinh_anh.length > 0 ? [{
      title: "Hình Ảnh",
      fields: [
        { 
          label: "Hình Ảnh", 
          key: "hinh_anh", 
          value: cauHoi.hinh_anh[0] || "",
          type: "image" as const,
          format: () => (
            <div className="space-y-2">
              {cauHoi.hinh_anh.map((url: string, index: number) => (
                <div key={index} className="mb-2">
                  <img 
                    src={url} 
                    alt={`Hình ${index + 1}`}
                    className="max-w-full h-auto rounded-md border"
                    style={{ maxHeight: "300px" }}
                  />
                </div>
              ))}
            </div>
          ),
          colSpan: 2 as const,
        },
      ]
    }] : []),
    {
      title: "Đáp Án",
      fields: [
        { 
          label: "Đáp Án 1", 
          key: "dap_an_1", 
          value: cauHoi.dap_an_1 || "",
          format: () => (
            <div className="flex items-center gap-2">
              <span>{cauHoi.dap_an_1}</span>
              {cauHoi.dap_an_dung === 1 && (
                <Badge variant="default" className="bg-green-600">Đúng</Badge>
              )}
            </div>
          ),
        },
        { 
          label: "Đáp Án 2", 
          key: "dap_an_2", 
          value: cauHoi.dap_an_2 || "",
          format: () => (
            <div className="flex items-center gap-2">
              <span>{cauHoi.dap_an_2}</span>
              {cauHoi.dap_an_dung === 2 && (
                <Badge variant="default" className="bg-green-600">Đúng</Badge>
              )}
            </div>
          ),
        },
        { 
          label: "Đáp Án 3", 
          key: "dap_an_3", 
          value: cauHoi.dap_an_3 || "",
          format: () => (
            <div className="flex items-center gap-2">
              <span>{cauHoi.dap_an_3}</span>
              {cauHoi.dap_an_dung === 3 && (
                <Badge variant="default" className="bg-green-600">Đúng</Badge>
              )}
            </div>
          ),
        },
        { 
          label: "Đáp Án 4", 
          key: "dap_an_4", 
          value: cauHoi.dap_an_4 || "",
          format: () => (
            <div className="flex items-center gap-2">
              <span>{cauHoi.dap_an_4}</span>
              {cauHoi.dap_an_dung === 4 && (
                <Badge variant="default" className="bg-green-600">Đúng</Badge>
              )}
            </div>
          ),
        },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { label: "Người Tạo ID", key: "nguoi_tao_id", value: cauHoi.nguoi_tao_id?.toString() || "-" },
        { label: "Thời Gian Tạo", key: "tg_tao", value: formatDate(cauHoi.tg_tao) },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDate(cauHoi.tg_cap_nhat) },
      ]
    },
  ]

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      navigate(`${cauHoiConfig.routePath}/${id}/sua?returnTo=detail`)
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(cauHoiConfig.routePath)
    }
  }

  const title = cauHoi.cau_hoi?.substring(0, 50) || `Câu hỏi #${id}`
  const subtitle = cauHoi.ten_chuyen_de || `ID: ${id}`

  return (
    <GenericDetailViewSimple
      title={title}
      subtitle={subtitle}
      sections={sections}
      backUrl={onBack ? undefined : cauHoiConfig.routePath}
      onBack={handleBack}
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            className={actionButtonClass()}
            onClick={handleEdit}
          >
            <Edit className="mr-2 h-4 w-4" />
            Sửa
          </Button>
          <DeleteCauHoiButton 
            id={id} 
            name={cauHoi.cau_hoi?.substring(0, 50) || ""} 
          />
        </>
      }
      isLoading={query.isLoading && !initialData}
    />
  )
}

