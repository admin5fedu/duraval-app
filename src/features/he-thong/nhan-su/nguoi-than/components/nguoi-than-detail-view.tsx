"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useNguoiThanById } from "../hooks/use-nguoi-than"
import { DeleteNguoiThanButton } from "./delete-nguoi-than-button"
import { nguoiThanConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { useNhanSuById } from "../../danh-sach-nhan-su/hooks/use-nhan-su"

interface NguoiThanDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function NguoiThanDetailView({ id, initialData, onEdit, onBack }: NguoiThanDetailViewProps) {
  const navigate = useNavigate()
  const query = useNguoiThanById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)

  // Fetch employee info if ma_nhan_vien is available
  const nguoiThan = viewState.data
  const { data: nhanSu } = useNhanSuById(nguoiThan?.ma_nhan_vien || 0, undefined)

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
        title="Không tìm thấy người thân"
        message="Người thân với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : nguoiThanConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!nguoiThan) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Người thân",
      fields: [
        { label: "Họ và Tên", key: "ho_va_ten", value: nguoiThan.ho_va_ten },
        { label: "Mối Quan Hệ", key: "moi_quan_he", value: nguoiThan.moi_quan_he, type: "badge" },
        { label: "Ngày Sinh", key: "ngay_sinh", value: nguoiThan.ngay_sinh, type: "date" },
        { label: "Số Điện Thoại", key: "so_dien_thoai", value: nguoiThan.so_dien_thoai, type: "phone" },
      ]
    },
    {
      title: "Thông Tin Nhân Viên",
      fields: [
        {
          label: "Mã Nhân Viên",
          key: "ma_nhan_vien",
          value: nguoiThan.ma_nhan_vien,
          type: "url",
          link: `/he-thong/danh-sach-nhan-su/${nguoiThan.ma_nhan_vien}`
        },
        { label: "Họ và Tên", key: "ho_ten", value: nhanSu?.ho_ten || "-" },
        { label: "Email", key: "email_cong_ty", value: nhanSu?.email_cong_ty || "-", type: "email" },
        { label: "Phòng Ban", key: "ma_phong", value: nhanSu?.ma_phong || "-" },
        { label: "Chức Vụ", key: "ma_chuc_vu", value: nhanSu?.ma_chuc_vu || "-" },
      ]
    },
    {
      title: "Ghi Chú",
      fields: [
        { label: "Ghi Chú", key: "ghi_chu", value: nguoiThan.ghi_chu || "-", colSpan: 3 },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { label: "Thời Gian Tạo", key: "tg_tao", value: nguoiThan.tg_tao, type: "date" },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: nguoiThan.tg_cap_nhat, type: "date" },
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
            navigate(`${nguoiThanConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteNguoiThanButton id={id} name={nguoiThan.ho_va_ten} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={nguoiThan.ho_va_ten}
      subtitle={`Mối quan hệ: ${nguoiThan.moi_quan_he}`}
      sections={sections}
      backUrl={onBack ? undefined : nguoiThanConfig.routePath}
      onBack={onBack}
      actions={actions}
      isLoading={query.isLoading && !initialData}
    />
  )
}

