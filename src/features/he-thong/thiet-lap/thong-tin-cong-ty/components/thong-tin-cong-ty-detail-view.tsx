"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useThongTinCongTyById } from "../hooks/use-thong-tin-cong-ty"
import { DeleteThongTinCongTyButton } from "./delete-thong-tin-cong-ty-button"
import { thongTinCongTyConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"

interface ThongTinCongTyDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function ThongTinCongTyDetailView({ id, initialData, onEdit, onBack }: ThongTinCongTyDetailViewProps) {
  const navigate = useNavigate()
  const query = useThongTinCongTyById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const thongTinCongTy = viewState.data

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
        title="Không tìm thấy thông tin công ty"
        message="Thông tin công ty với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : thongTinCongTyConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!thongTinCongTy) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { label: "Mã Công Ty", key: "ma_cong_ty", value: thongTinCongTy.ma_cong_ty },
        { label: "Tên Công Ty", key: "ten_cong_ty", value: thongTinCongTy.ten_cong_ty },
        { label: "Tên Đầy Đủ", key: "ten_day_du", value: thongTinCongTy.ten_day_du, colSpan: 2 },
        { 
          label: "Logo", 
          key: "link_logo", 
          value: thongTinCongTy.link_logo, 
          type: "image",
          colSpan: 2,
        },
      ]
    },
    {
      title: "Thông Tin Liên Hệ",
      fields: [
        { label: "Địa Chỉ", key: "dia_chi", value: thongTinCongTy.dia_chi, colSpan: 2 },
        { label: "Số Điện Thoại", key: "so_dien_thoai", value: thongTinCongTy.so_dien_thoai, type: "phone" },
        { label: "Email", key: "email", value: thongTinCongTy.email, type: "email" },
        { 
          label: "Website", 
          key: "website", 
          value: thongTinCongTy.website, 
          type: "url",
          link: thongTinCongTy.website.startsWith('http') ? thongTinCongTy.website : `https://${thongTinCongTy.website}`,
        },
      ]
    },
    {
      title: "Cài Đặt",
      fields: [
        { 
          label: "Áp Dụng", 
          key: "ap_dung", 
          value: thongTinCongTy.ap_dung ? "Có" : "Không", 
          type: "badge" 
        },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { label: "Thời Gian Tạo", key: "tg_tao", value: thongTinCongTy.tg_tao, type: "date" },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: thongTinCongTy.tg_cap_nhat, type: "date" },
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
          if (onEdit) {
            onEdit()
          } else {
            navigate(`${thongTinCongTyConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteThongTinCongTyButton id={id} name={thongTinCongTy.ten_cong_ty} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={thongTinCongTy.ten_cong_ty}
      subtitle={thongTinCongTy.ten_day_du}
      sections={sections}
      backUrl={onBack ? undefined : thongTinCongTyConfig.routePath}
      onBack={onBack}
      actions={actions}
      isLoading={query.isLoading && !initialData}
    />
  )
}

