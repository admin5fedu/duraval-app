"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { useKeHoachThiTruongById } from "../hooks/use-ke-hoach-thi-truong"
import { keHoachThiTruongConfig } from "../config"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { formatDate } from "@/shared/utils/date-format"
import { DeleteKeHoachThiTruongButton } from "./delete-ke-hoach-thi-truong-button"
import { registerEnumColors } from "@/shared/utils/enum-color-registry"

// Register enum colors for badge formatting in detail view
registerEnumColors("buoi", {
  "Sáng": "bg-blue-50 text-blue-700 border-blue-200",
  "Chiều": "bg-orange-50 text-orange-700 border-orange-200",
})

registerEnumColors("hanh_dong", {
  "Đi thị trường": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Làm văn phòng": "bg-purple-50 text-purple-700 border-purple-200",
})

registerEnumColors("trang_thai", {
  "Chưa thực hiện": "bg-slate-50 text-slate-700 border-slate-200",
  "Đã thực hiện": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Hủy": "bg-red-50 text-red-700 border-red-200",
})

interface KeHoachThiTruongDetailViewProps {
  id: number
  onBack?: () => void
  backUrl?: string
}

export function KeHoachThiTruongDetailView({ id, onBack, backUrl }: KeHoachThiTruongDetailViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const query = useKeHoachThiTruongById(id, undefined)
  const viewState = useDetailViewStateFromQuery(query, undefined)
  
  const keHoachThiTruong = viewState.data

  const returnTo = searchParams.get('returnTo') || 'list'

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backUrl) {
      navigate(backUrl)
    } else if (returnTo === 'list') {
      navigate(keHoachThiTruongConfig.routePath)
    } else {
      navigate(keHoachThiTruongConfig.routePath)
    }
  }

  const handleEdit = () => {
    navigate(`${keHoachThiTruongConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleDeleteSuccess = () => {
    // Navigate back to list after successful delete
    navigate(keHoachThiTruongConfig.routePath)
  }

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
        title="Không tìm thấy kế hoạch thị trường"
        message="Kế hoạch thị trường với ID này không tồn tại hoặc đã bị xóa."
        onBack={handleBack}
        backUrl={backUrl || keHoachThiTruongConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!keHoachThiTruong) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { key: "ngay", label: "Ngày", value: keHoachThiTruong.ngay ? formatDate(keHoachThiTruong.ngay) : "-" },
        { key: "ten_nhan_vien", label: "Nhân Viên", value: keHoachThiTruong.ten_nhan_vien || "-" },
        { key: "buoi", label: "Buổi", value: keHoachThiTruong.buoi || "-", type: "badge" },
        { key: "ten_khach_buon", label: "Khách Buôn", value: keHoachThiTruong.ten_khach_buon || "-" },
        { key: "ten_tinh_thanh", label: "Tỉnh Thành", value: keHoachThiTruong.ten_tinh_thanh || "-" },
        { key: "trang_thai", label: "Trạng Thái", value: keHoachThiTruong.trang_thai || "-", type: "badge" },
      ]
    },
    {
      title: "Nội Dung Kế Hoạch",
      fields: [
        { key: "hanh_dong", label: "Hành Động", value: keHoachThiTruong.hanh_dong || "-", type: "badge" },
        { key: "muc_tieu", label: "Mục Tiêu", value: keHoachThiTruong.muc_tieu || "-" },
        { key: "ghi_chu", label: "Ghi Chú", value: keHoachThiTruong.ghi_chu || "-" },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { key: "ten_nguoi_tao", label: "Người Tạo", value: keHoachThiTruong.ten_nguoi_tao || "-" },
        { key: "tg_tao", label: "Thời Gian Tạo", value: keHoachThiTruong.tg_tao ? formatDate(keHoachThiTruong.tg_tao) : "-" },
        { key: "tg_cap_nhat", label: "Thời Gian Cập Nhật", value: keHoachThiTruong.tg_cap_nhat ? formatDate(keHoachThiTruong.tg_cap_nhat) : "-" },
      ]
    },
  ]

  return (
    <GenericDetailViewSimple
      title="Kế Hoạch Thị Trường"
      subtitle={`ID: ${id}`}
      sections={sections}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className={actionButtonClass()}
          >
            <Edit className="h-4 w-4 mr-2" />
            Sửa
          </Button>
          <DeleteKeHoachThiTruongButton 
            id={id}
            onSuccess={handleDeleteSuccess}
          />
        </div>
      }
      onBack={handleBack}
      backUrl={backUrl || keHoachThiTruongConfig.routePath}
    />
  )
}

