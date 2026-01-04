"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useMucDangKyById } from "../hooks/use-muc-dang-ky"
import { DeleteMucDangKyButton } from "./delete-muc-dang-ky-button"
import { mucDangKyConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { formatNumber } from "@/shared/utils/detail-utils"

interface MucDangKyDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function MucDangKyDetailView({ id, initialData, onEdit, onBack }: MucDangKyDetailViewProps) {
  const navigate = useNavigate()
  const query = useMucDangKyById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const mucDangKy = viewState.data

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
        title="Không tìm thấy mức đăng ký"
        message="Mức đăng ký với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : mucDangKyConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!mucDangKy) {
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
        { 
          key: "ma_hang",
          label: "Mã Hạng", 
          value: mucDangKy.ma_hang || "-" 
        },
        { 
          key: "ten_hang",
          label: "Tên Hạng", 
          value: mucDangKy.ten_hang 
        },
        {
          key: "doanh_so_min_quy",
          label: "Doanh Số Min (Quý)",
          value: mucDangKy.doanh_so_min_quy !== null && mucDangKy.doanh_so_min_quy !== undefined 
            ? formatNumber(mucDangKy.doanh_so_min_quy) 
            : "-",
        },
        {
          key: "doanh_so_max_quy",
          label: "Doanh Số Max (Quý)",
          value: mucDangKy.doanh_so_max_quy !== null && mucDangKy.doanh_so_max_quy !== undefined 
            ? formatNumber(mucDangKy.doanh_so_max_quy) 
            : "-",
        },
        {
          key: "doanh_so_min_nam",
          label: "Doanh Số Min (Năm)",
          value: mucDangKy.doanh_so_min_nam !== null && mucDangKy.doanh_so_min_nam !== undefined 
            ? formatNumber(mucDangKy.doanh_so_min_nam) 
            : "-",
        },
        {
          key: "doanh_so_max_nam",
          label: "Doanh Số Max (Năm)",
          value: mucDangKy.doanh_so_max_nam !== null && mucDangKy.doanh_so_max_nam !== undefined 
            ? formatNumber(mucDangKy.doanh_so_max_nam) 
            : "-",
        },
        { 
          key: "ghi_chu",
          label: "Ghi Chú", 
          value: mucDangKy.ghi_chu || "-", 
          colSpan: 2 
        },
      ],
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { 
          label: "Người Tạo", 
          key: "nguoi_tao_id", 
          value: mucDangKy.nguoi_tao_id 
            ? `${mucDangKy.nguoi_tao_id}${mucDangKy.nguoi_tao_ten ? ` - ${mucDangKy.nguoi_tao_ten}` : ''}`
            : "-" 
        },
        { 
          label: "Thời Gian Tạo", 
          key: "tg_tao", 
          value: formatDate(mucDangKy.tg_tao), 
          type: "date" 
        },
        { 
          label: "Thời Gian Cập Nhật", 
          key: "tg_cap_nhat", 
          value: formatDate(mucDangKy.tg_cap_nhat), 
          type: "date" 
        },
      ],
    },
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
            navigate(`${mucDangKyConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteMucDangKyButton id={id} name={mucDangKy.ten_hang} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={mucDangKy.ten_hang}
      subtitle={mucDangKy.ma_hang ? `Mã: ${mucDangKy.ma_hang}` : "Chi tiết mức đăng ký"}
      sections={sections}
      actions={actions}
      onBack={onBack}
      backUrl={onBack ? undefined : mucDangKyConfig.routePath}
    />
  )
}
