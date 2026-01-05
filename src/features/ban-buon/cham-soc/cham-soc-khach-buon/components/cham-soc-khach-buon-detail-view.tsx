"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { useChamSocKhachBuonById } from "../hooks/use-cham-soc-khach-buon"
import { chamSocKhachBuonConfig } from "../config"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { formatDate } from "@/shared/utils/date-format"
import { DeleteChamSocKhachBuonButton } from "./delete-cham-soc-khach-buon-button"

interface ChamSocKhachBuonDetailViewProps {
  id: number
  onBack?: () => void
  backUrl?: string
}

export function ChamSocKhachBuonDetailView({ id, onBack, backUrl }: ChamSocKhachBuonDetailViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const query = useChamSocKhachBuonById(id, undefined)
  const viewState = useDetailViewStateFromQuery(query, undefined)
  
  const chamSocKhachBuon = viewState.data

  const returnTo = searchParams.get('returnTo') || 'list'

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backUrl) {
      navigate(backUrl)
    } else if (returnTo === 'list') {
      navigate(chamSocKhachBuonConfig.routePath)
    } else {
      navigate(chamSocKhachBuonConfig.routePath)
    }
  }

  const handleEdit = () => {
    navigate(`${chamSocKhachBuonConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleDeleteSuccess = () => {
    // Navigate back to list after successful delete
    navigate(chamSocKhachBuonConfig.routePath)
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
        title="Không tìm thấy chăm sóc khách buôn"
        message="Chăm sóc khách buôn với ID này không tồn tại hoặc đã bị xóa."
        onBack={handleBack}
        backUrl={backUrl || chamSocKhachBuonConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!chamSocKhachBuon) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { key: "ngay", label: "Ngày", value: chamSocKhachBuon.ngay ? formatDate(chamSocKhachBuon.ngay) : "-" },
        { key: "ten_nhan_vien", label: "Nhân Viên", value: chamSocKhachBuon.ten_nhan_vien || "-" },
        { key: "ten_khach_buon", label: "Khách Buôn", value: chamSocKhachBuon.ten_khach_buon || "-" },
        { key: "hinh_thuc", label: "Hình Thức", value: chamSocKhachBuon.hinh_thuc || "-" },
      ]
    },
    {
      title: "Nội Dung Chăm Sóc",
      fields: [
        { key: "muc_tieu", label: "Mục Tiêu", value: chamSocKhachBuon.muc_tieu || "-" },
        { key: "ket_qua", label: "Kết Quả", value: chamSocKhachBuon.ket_qua || "-" },
        { key: "hanh_dong_tiep_theo", label: "Hành Động Tiếp Theo", value: chamSocKhachBuon.hanh_dong_tiep_theo || "-" },
      ]
    },
    {
      title: "Thông Tin Bổ Sung",
      fields: [
        { key: "hen_cs_lai", label: "Hẹn CS Lại", value: chamSocKhachBuon.hen_cs_lai ? formatDate(chamSocKhachBuon.hen_cs_lai) : "-" },
        { key: "gps", label: "GPS", value: chamSocKhachBuon.gps || "-" },
        { key: "hinh_anh", label: "Hình Ảnh", value: chamSocKhachBuon.hinh_anh || "-", type: "image" },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { key: "ten_nguoi_tao", label: "Người Tạo", value: chamSocKhachBuon.ten_nguoi_tao || "-" },
        { key: "tg_tao", label: "Thời Gian Tạo", value: chamSocKhachBuon.tg_tao ? formatDate(chamSocKhachBuon.tg_tao) : "-" },
        { key: "tg_cap_nhat", label: "Thời Gian Cập Nhật", value: chamSocKhachBuon.tg_cap_nhat ? formatDate(chamSocKhachBuon.tg_cap_nhat) : "-" },
      ]
    },
  ]

  return (
    <GenericDetailViewSimple
      title="Chăm Sóc Khách Buôn"
      subtitle={`ID: ${id}`}
      sections={sections}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Sửa
          </Button>
          <DeleteChamSocKhachBuonButton 
            id={id}
            onSuccess={handleDeleteSuccess}
          />
        </div>
      }
      onBack={handleBack}
      backUrl={backUrl || chamSocKhachBuonConfig.routePath}
    />
  )
}

