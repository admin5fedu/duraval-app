"use client"

import { useNavigate, useSearchParams } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { useDangKyDoanhSoById } from "../hooks/use-dang-ky-doanh-so"
import { dangKyDoanhSoConfig } from "../config"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { formatDate } from "@/shared/utils/date-format"
import { formatNumber } from "@/shared/utils/detail-utils"
import { DeleteDangKyDoanhSoButton } from "./delete-dang-ky-doanh-so-button"

interface DangKyDoanhSoDetailViewProps {
  id: number
  onBack?: () => void
  backUrl?: string
}

export function DangKyDoanhSoDetailView({ id, onBack, backUrl }: DangKyDoanhSoDetailViewProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const query = useDangKyDoanhSoById(id, undefined)
  const viewState = useDetailViewStateFromQuery(query, undefined)
  
  const dangKyDoanhSo = viewState.data

  const returnTo = searchParams.get('returnTo') || 'list'

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backUrl) {
      navigate(backUrl)
    } else if (returnTo === 'list') {
      navigate(dangKyDoanhSoConfig.routePath)
    } else {
      navigate(dangKyDoanhSoConfig.routePath)
    }
  }

  const handleEdit = () => {
    navigate(`${dangKyDoanhSoConfig.routePath}/${id}/sua?returnTo=detail`)
  }

  const handleDeleteSuccess = () => {
    // Navigate back to list after successful delete
    navigate(dangKyDoanhSoConfig.routePath)
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
        title="Không tìm thấy đăng ký doanh số"
        message="Đăng ký doanh số với ID này không tồn tại hoặc đã bị xóa."
        onBack={handleBack}
        backUrl={backUrl || dangKyDoanhSoConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!dangKyDoanhSo) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { key: "nam", label: "Năm", value: dangKyDoanhSo.nam ? String(dangKyDoanhSo.nam) : "-" },
        { key: "ten_khach_buon", label: "Khách Buôn", value: dangKyDoanhSo.ten_khach_buon || "-" },
        { key: "ten_muc_dang_ky", label: "Mức Đăng Ký", value: dangKyDoanhSo.ten_muc_dang_ky || "-" },
      ]
    },
    {
      title: "Doanh Số",
      fields: [
        { 
          key: "doanh_so_min_quy", 
          label: "Doanh Số Min Quý", 
          value: dangKyDoanhSo.doanh_so_min_quy !== null && dangKyDoanhSo.doanh_so_min_quy !== undefined 
            ? formatNumber(dangKyDoanhSo.doanh_so_min_quy) 
            : "-" 
        },
        { 
          key: "doanh_so_max_quy", 
          label: "Doanh Số Max Quý", 
          value: dangKyDoanhSo.doanh_so_max_quy !== null && dangKyDoanhSo.doanh_so_max_quy !== undefined 
            ? formatNumber(dangKyDoanhSo.doanh_so_max_quy) 
            : "-" 
        },
        { 
          key: "doanh_so_min_nam", 
          label: "Doanh Số Min Năm", 
          value: dangKyDoanhSo.doanh_so_min_nam !== null && dangKyDoanhSo.doanh_so_min_nam !== undefined 
            ? formatNumber(dangKyDoanhSo.doanh_so_min_nam) 
            : "-" 
        },
        { 
          key: "doanh_so_max_nam", 
          label: "Doanh Số Max Năm", 
          value: dangKyDoanhSo.doanh_so_max_nam !== null && dangKyDoanhSo.doanh_so_max_nam !== undefined 
            ? formatNumber(dangKyDoanhSo.doanh_so_max_nam) 
            : "-" 
        },
      ]
    },
    {
      title: "Thông Tin Bổ Sung",
      fields: [
        { key: "ghi_chu", label: "Ghi Chú", value: dangKyDoanhSo.ghi_chu || "-" },
      ]
    },
    {
      title: "Hợp Đồng",
      fields: [
        { 
          key: "link_hop_dong", 
          label: "Link Hợp Đồng", 
          value: dangKyDoanhSo.link_hop_dong || "-",
          ...(dangKyDoanhSo.link_hop_dong ? { type: "url" as const } : {})
        },
        { 
          key: "file_hop_dong", 
          label: "File Hợp Đồng", 
          value: dangKyDoanhSo.file_hop_dong || "-",
          ...(dangKyDoanhSo.file_hop_dong ? { type: "url" as const } : {})
        },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { key: "ten_nguoi_tao", label: "Người Tạo", value: dangKyDoanhSo.ten_nguoi_tao || "-" },
        { key: "tg_tao", label: "Thời Gian Tạo", value: dangKyDoanhSo.tg_tao ? formatDate(dangKyDoanhSo.tg_tao) : "-" },
        { key: "tg_cap_nhat", label: "Thời Gian Cập Nhật", value: dangKyDoanhSo.tg_cap_nhat ? formatDate(dangKyDoanhSo.tg_cap_nhat) : "-" },
      ]
    },
  ]

  return (
    <GenericDetailViewSimple
      title={`${dangKyDoanhSoConfig.moduleTitle} - ID ${dangKyDoanhSo.id}`}
      subtitle={dangKyDoanhSo.ten_khach_buon || ""}
      sections={sections}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
          >
            <Edit className="mr-2 h-4 w-4" />
            Sửa
          </Button>
          <DeleteDangKyDoanhSoButton
            id={id}
            onSuccess={handleDeleteSuccess}
          />
        </div>
      }
      onBack={handleBack}
    />
  )
}

