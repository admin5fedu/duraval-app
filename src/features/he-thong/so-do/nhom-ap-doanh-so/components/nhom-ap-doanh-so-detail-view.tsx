"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useNhomApDoanhSoById } from "../hooks/use-nhom-ap-doanh-so"
import { DeleteNhomApDoanhSoButton } from "./delete-nhom-ap-doanh-so-button"
import { nhomApDoanhSoConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { useNhanSu } from "../../../nhan-su/danh-sach-nhan-su/hooks"

interface NhomApDoanhSoDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function NhomApDoanhSoDetailView({ id, initialData, onEdit, onBack }: NhomApDoanhSoDetailViewProps) {
  const navigate = useNavigate()
  const query = useNhomApDoanhSoById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  const { data: nhanSuList } = useNhanSu() // Fetch nhan su list for mapping nguoi_tao_id
  
  const nhomApDoanhSo = viewState.data

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
        title="Không tìm thấy nhóm áp doanh số"
        message="Nhóm áp doanh số với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : nhomApDoanhSoConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!nhomApDoanhSo) {
    return null
  }

  // Map nguoi_tao_id với nhanSuList để hiển thị tên
  const nguoiTaoDisplay = nhomApDoanhSo.nguoi_tao_id && nhanSuList
    ? nhanSuList.find((ns) => ns.ma_nhan_vien === nhomApDoanhSo.nguoi_tao_id)
    : null

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { label: "Mã Nhóm Áp", key: "ma_nhom_ap", value: nhomApDoanhSo.ma_nhom_ap || "-" },
        { label: "Tên Nhóm Áp", key: "ten_nhom_ap", value: nhomApDoanhSo.ten_nhom_ap || "-" },
        { label: "Mô Tả", key: "mo_ta", value: nhomApDoanhSo.mo_ta || "-", colSpan: 2 },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { 
          label: "Người Tạo", 
          key: "nguoi_tao_id", 
          value: nguoiTaoDisplay 
            ? `${nguoiTaoDisplay.ma_nhan_vien} - ${nguoiTaoDisplay.ho_ten}` 
            : (nhomApDoanhSo.nguoi_tao_id?.toString() || "-") 
        },
        { label: "Thời Gian Tạo", key: "tg_tao", value: nhomApDoanhSo.tg_tao, type: "date" },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: nhomApDoanhSo.tg_cap_nhat, type: "date" },
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
            navigate(`${nhomApDoanhSoConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteNhomApDoanhSoButton id={id} name={nhomApDoanhSo.ten_nhom_ap || "Chưa có tên"} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={nhomApDoanhSo.ten_nhom_ap || "Chưa có tên"}
      subtitle={nhomApDoanhSo.ma_nhom_ap || ""}
      sections={sections}
      backUrl={onBack ? undefined : nhomApDoanhSoConfig.routePath}
      onBack={onBack}
      actions={actions}
      isLoading={query.isLoading && !initialData}
    />
  )
}

