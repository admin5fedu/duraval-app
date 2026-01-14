"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useNhanSuById } from "../hooks/use-nhan-su"
import { DeleteNhanSuButton } from "./delete-nhan-su-button"
import { nhanSuConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { RelativesSection } from "./relatives-section"

interface NhanSuDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function NhanSuDetailView({ id, initialData, onEdit, onBack }: NhanSuDetailViewProps) {
  const navigate = useNavigate()
  const query = useNhanSuById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)

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
        title="Không tìm thấy nhân sự"
        message="Nhân sự với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : nhanSuConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  const nhanSu = viewState.data
  if (!nhanSu) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { label: "Mã Nhân Viên", key: "ma_nhan_vien", value: nhanSu.ma_nhan_vien, type: "number" },
        { label: "Họ và Tên", key: "ho_ten", value: nhanSu.ho_ten },
        { label: "Email Công Ty", key: "email_cong_ty", value: nhanSu.email_cong_ty, type: "email" },
        { label: "Email Cá Nhân", key: "email_ca_nhan", value: nhanSu.email_ca_nhan, type: "email" },
        { label: "Số Điện Thoại", key: "so_dien_thoai", value: nhanSu.so_dien_thoai, type: "phone" },
        { label: "Giới Tính", key: "gioi_tinh", value: nhanSu.gioi_tinh, type: "badge" },
        { label: "Ngày Sinh", key: "ngay_sinh", value: nhanSu.ngay_sinh, type: "date" },
        { label: "Hôn Nhân", key: "hon_nhan", value: nhanSu.hon_nhan, type: "badge" },
      ]
    },
    {
      title: "Công Việc & Chức Vụ",
      fields: [
        { label: "Phòng Ban", key: "ma_phong", value: nhanSu.ma_phong || "-" },
        { label: "Bộ Phận", key: "ma_bo_phan", value: nhanSu.ma_bo_phan || "-" },
        { label: "Nhóm", key: "ma_nhom", value: nhanSu.ma_nhom || "-" },
        { label: "Chức Vụ", key: "ma_chuc_vu", value: nhanSu.ma_chuc_vu || "-" },
        { label: "Cấp Bậc", key: "ten_cap_bac", value: nhanSu.ten_cap_bac || "-" },
        { label: "Tình Trạng", key: "tinh_trang", value: nhanSu.tinh_trang, type: "status" },
      ]
    },
    {
      title: "Thời Gian Làm Việc",
      fields: [
        { label: "Ngày Thử Việc", key: "ngay_thu_viec", value: nhanSu.ngay_thu_viec, type: "date" },
        { label: "Ngày Chính Thức", key: "ngay_chinh_thuc", value: nhanSu.ngay_chinh_thuc, type: "date" },
        { label: "Ngày Nghỉ Việc", key: "ngay_nghi_viec", value: nhanSu.ngay_nghi_viec, type: "date" },
      ]
    },
    {
      title: "Ghi Chú & Khác",
      fields: [
        { label: "Ghi Chú", key: "ghi_chu", value: nhanSu.ghi_chu, colSpan: 3 },
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
            navigate(`${nhanSuConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteNhanSuButton id={id} name={nhanSu.ho_ten} />
    </div>
  )

  return (
    <>
      <GenericDetailViewSimple
        title={nhanSu.ho_ten}
        subtitle={nhanSu.ma_chuc_vu || undefined}
        avatarUrl={nhanSu.avatar_url}
        sections={sections}
        backUrl={onBack ? undefined : nhanSuConfig.routePath}
        onBack={onBack}
        actions={actions}
        isLoading={query.isLoading && !initialData}
      />

      {/* Người Thân Section */}
      <div className="mt-6">
        <RelativesSection maNhanVien={nhanSu.ma_nhan_vien} />
      </div>
    </>
  )
}

