"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { useNguoiLienHeById } from "../hooks/use-nguoi-lien-he"
import { nguoiLienHeConfig } from "../config"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { formatDate } from "@/shared/utils/date-format"
import { DeleteNguoiLienHeButton } from "./delete-nguoi-lien-he-button"

interface NguoiLienHeDetailViewProps {
  id: number
  onBack?: () => void
  backUrl?: string
}

export function NguoiLienHeDetailView({ id, onBack, backUrl }: NguoiLienHeDetailViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const query = useNguoiLienHeById(id, undefined)
  const viewState = useDetailViewStateFromQuery(query, undefined)
  
  const nguoiLienHe = viewState.data

  const returnTo = searchParams.get('returnTo') || 'list'

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backUrl) {
      navigate(backUrl)
    } else if (returnTo === 'list') {
      navigate(nguoiLienHeConfig.routePath)
    } else {
      navigate(nguoiLienHeConfig.routePath)
    }
  }

  const handleEdit = () => {
    navigate(`${nguoiLienHeConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleDeleteSuccess = () => {
    // Navigate back to list after successful delete
    navigate(nguoiLienHeConfig.routePath)
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
        title="Không tìm thấy người liên hệ"
        message="Người liên hệ với ID này không tồn tại hoặc đã bị xóa."
        onBack={handleBack}
        backUrl={backUrl || nguoiLienHeConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!nguoiLienHe) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { key: "ten_lien_he", label: "Tên Liên Hệ", value: nguoiLienHe.ten_lien_he || "-" },
        { key: "ten_khach_buon", label: "Khách Buôn", value: nguoiLienHe.ten_khach_buon || "-" },
        { key: "vai_tro", label: "Vai Trò", value: nguoiLienHe.vai_tro || "-" },
        { key: "gioi_tinh", label: "Giới Tính", value: nguoiLienHe.gioi_tinh || "-" },
        { key: "ngay_sinh", label: "Ngày Sinh", value: nguoiLienHe.ngay_sinh ? formatDate(nguoiLienHe.ngay_sinh) : "-" },
        { key: "hinh_anh", label: "Hình Ảnh", value: nguoiLienHe.hinh_anh || "-", type: "image" },
      ]
    },
    {
      title: "Thông Tin Liên Hệ",
      fields: [
        { key: "so_dien_thoai_1", label: "Số Điện Thoại 1", value: nguoiLienHe.so_dien_thoai_1 || "-" },
        { key: "so_dien_thoai_2", label: "Số Điện Thoại 2", value: nguoiLienHe.so_dien_thoai_2 || "-" },
        { key: "email", label: "Email", value: nguoiLienHe.email || "-" },
      ]
    },
    {
      title: "Thông Tin Khác",
      fields: [
        { key: "tinh_cach", label: "Tính Cách", value: nguoiLienHe.tinh_cach || "-" },
        { key: "so_thich", label: "Sở Thích", value: nguoiLienHe.so_thich || "-" },
        { key: "luu_y_khi_lam_viec", label: "Lưu Ý Khi Làm Việc", value: nguoiLienHe.luu_y_khi_lam_viec || "-" },
        { key: "ghi_chu_khac", label: "Ghi Chú Khác", value: nguoiLienHe.ghi_chu_khac || "-" },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { key: "nguoi_tao_id", label: "Người Tạo ID", value: nguoiLienHe.nguoi_tao_id ? String(nguoiLienHe.nguoi_tao_id) : "-" },
        { key: "tg_tao", label: "Thời Gian Tạo", value: nguoiLienHe.tg_tao ? formatDate(nguoiLienHe.tg_tao) : "-" },
        { key: "tg_cap_nhat", label: "Thời Gian Cập Nhật", value: nguoiLienHe.tg_cap_nhat ? formatDate(nguoiLienHe.tg_cap_nhat) : "-" },
      ]
    },
  ]

  return (
    <GenericDetailViewSimple
      title={nguoiLienHe.ten_lien_he || "Người Liên Hệ"}
      subtitle="Chi tiết thông tin người liên hệ"
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
          <DeleteNguoiLienHeButton 
            id={id} 
            name={nguoiLienHe.ten_lien_he}
            onSuccess={handleDeleteSuccess}
          />
        </div>
      }
      onBack={handleBack}
      backUrl={backUrl || nguoiLienHeConfig.routePath}
    />
  )
}

