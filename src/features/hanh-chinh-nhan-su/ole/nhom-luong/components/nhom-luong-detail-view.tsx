"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useNhomLuongById } from "../hooks/use-nhom-luong"
import { DeleteNhomLuongButton } from "./delete-nhom-luong-button"
import { nhomLuongConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"

interface NhomLuongDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function NhomLuongDetailView({ id, initialData, onEdit, onBack }: NhomLuongDetailViewProps) {
  const navigate = useNavigate()
  const query = useNhomLuongById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const nhomLuong = viewState.data

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
        title="Không tìm thấy nhóm lương"
        message="Nhóm lương với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : nhomLuongConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!nhomLuong) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { label: "Tên Nhóm", key: "ten_nhom", value: nhomLuong.ten_nhom },
        { 
          label: "Mô Tả", 
          key: "mo_ta", 
          value: nhomLuong.mo_ta || "-" 
        },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        {
          label: "Người Tạo",
          key: "nguoi_tao_id",
          value: nhomLuong.nguoi_tao_id?.toString() || "-",
          format: () => {
            const nguoiTaoId = nhomLuong.nguoi_tao_id
            const nguoiTaoTen = nhomLuong.nguoi_tao_ten
            if (!nguoiTaoId) return "-"
            return nguoiTaoTen ? `${nguoiTaoId} - ${nguoiTaoTen}` : nguoiTaoId.toString()
          }
        },
        {
          label: "Thời gian tạo",
          key: "tg_tao",
          value: nhomLuong.tg_tao || "-",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return new Date(val).toLocaleString("vi-VN")
            } catch {
              return val
            }
          }
        },
        {
          label: "Thời gian cập nhật",
          key: "tg_cap_nhat",
          value: nhomLuong.tg_cap_nhat || "-",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return new Date(val).toLocaleString("vi-VN")
            } catch {
              return val
            }
          }
        },
      ]
    }
  ]

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      navigate(`${nhomLuongConfig.routePath}/${id}/sua?returnTo=detail`)
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(nhomLuongConfig.routePath)
    }
  }

  const handleDeleteSuccess = () => {
    // Navigate to list view after successful deletion
    navigate(nhomLuongConfig.routePath)
  }

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className={actionButtonClass()}
        onClick={handleEdit}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" />
        Sửa
      </Button>
      <DeleteNhomLuongButton
        id={nhomLuong.id!}
        name={nhomLuong.ten_nhom}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={nhomLuong.ten_nhom}
      subtitle={nhomLuong.mo_ta || ""}
      sections={sections}
      actions={actions}
      backUrl={onBack ? undefined : nhomLuongConfig.routePath}
      onBack={handleBack}
    />
  )
}

