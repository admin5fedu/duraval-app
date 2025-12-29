"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useChucVuById } from "../hooks/use-chuc-vu"
import { DeleteChucVuButton } from "./delete-chuc-vu-button"
import { chucVuConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { usePhongBan } from "../../phong-ban/hooks"
import { useCapBac } from "../../cap-bac/hooks"
import { useNhanSu } from "../../../nhan-su/danh-sach-nhan-su/hooks"

interface ChucVuDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function ChucVuDetailView({ id, initialData, onEdit, onBack }: ChucVuDetailViewProps) {
  const navigate = useNavigate()
  const query = useChucVuById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  const { data: phongBanList } = usePhongBan()
  const { data: capBacList } = useCapBac()
  const { data: nhanSuList } = useNhanSu()
  
  const chucVu = viewState.data

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
        title="Không tìm thấy chức vụ"
        message="Chức vụ với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : chucVuConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!chucVu) {
    return null
  }

  // Map phong_ban_id và cap_bac_id để hiển thị tên
  const phongBanDisplay = chucVu.phong_ban_id && phongBanList
    ? phongBanList.find((pb) => pb.id === chucVu.phong_ban_id)
    : null
  
  const capBacDisplay = chucVu.cap_bac_id && capBacList
    ? capBacList.find((cb) => cb.id === chucVu.cap_bac_id)
    : null
  
  // Map nguoi_tao với nhanSuList để hiển thị tên
  const nguoiTaoDisplay = chucVu.nguoi_tao && nhanSuList
    ? nhanSuList.find((ns) => ns.ma_nhan_vien === chucVu.nguoi_tao)
    : null

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { label: "Mã Chức Vụ", key: "ma_chuc_vu", value: chucVu.ma_chuc_vu },
        { label: "Tên Chức Vụ", key: "ten_chuc_vu", value: chucVu.ten_chuc_vu },
        { label: "Mã Cấp Bậc", key: "ma_cap_bac", value: chucVu.ma_cap_bac },
        { label: "Tên Cấp Bậc", key: "ten_cap_bac", value: chucVu.ten_cap_bac || "-" },
        { 
          label: "Cấp Bậc (ID)", 
          key: "cap_bac_id", 
          value: capBacDisplay 
            ? `${chucVu.cap_bac_id} - ${capBacDisplay.ma_cap_bac} - ${capBacDisplay.ten_cap_bac}${capBacDisplay.bac ? ` (Bậc ${capBacDisplay.bac})` : ''}` 
            : (chucVu.cap_bac_id?.toString() || "-") 
        },
      ]
    },
    {
      title: "Thông Tin Phòng Ban",
      fields: [
        { label: "Mã Phòng Ban", key: "ma_phong_ban", value: chucVu.ma_phong_ban },
        { 
          label: "Phòng Ban (ID)", 
          key: "phong_ban_id", 
          value: phongBanDisplay 
            ? `${chucVu.phong_ban_id} - ${phongBanDisplay.ma_phong_ban} - ${phongBanDisplay.ten_phong_ban}` 
            : (chucVu.phong_ban_id?.toString() || "-") 
        },
        { label: "Mã Nhóm", key: "ma_nhom", value: chucVu.ma_nhom || "-" },
        { label: "Mã Bộ Phận", key: "ma_bo_phan", value: chucVu.ma_bo_phan || "-" },
        { label: "Mã Phòng", key: "ma_phong", value: chucVu.ma_phong || "-" },
      ]
    },
    {
      title: "Thông Tin Lương và Phúc Lợi",
      fields: [
        { label: "Ngạch Lương", key: "ngach_luong", value: chucVu.ngach_luong || "-" },
        { label: "Mức Đóng Bảo Hiểm", key: "muc_dong_bao_hiem", value: chucVu.muc_dong_bao_hiem?.toString() || "-" },
        { label: "Số Ngày Nghỉ Thứ 7", key: "so_ngay_nghi_thu_7", value: chucVu.so_ngay_nghi_thu_7 || "-" },
        { label: "Nhóm Thưởng", key: "nhom_thuong", value: chucVu.nhom_thuong || "-" },
        { label: "Điểm Thưởng", key: "diem_thuong", value: chucVu.diem_thuong?.toString() || "-", colSpan: 2 },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { 
          label: "Người Tạo", 
          key: "nguoi_tao", 
          value: nguoiTaoDisplay 
            ? `${nguoiTaoDisplay.ma_nhan_vien} - ${nguoiTaoDisplay.ho_ten}` 
            : (chucVu.nguoi_tao?.toString() || "-") 
        },
        { label: "Thời Gian Tạo", key: "tg_tao", value: chucVu.tg_tao, type: "date" },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: chucVu.tg_cap_nhat, type: "date" },
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
            navigate(`${chucVuConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteChucVuButton id={id} name={chucVu.ten_chuc_vu} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={chucVu.ten_chuc_vu}
      subtitle={chucVu.ma_chuc_vu}
      sections={sections}
      backUrl={onBack ? undefined : chucVuConfig.routePath}
      onBack={onBack}
      actions={actions}
      isLoading={query.isLoading && !initialData}
    />
  )
}

