"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useDangKyDoanhSoById } from "../hooks"
import { DeleteDangKyDoanhSoButton } from "./delete-dang-ky-doanh-so-button"
import { dangKyDoanhSoConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { useNhanSu } from "../../../nhan-su/danh-sach-nhan-su/hooks"
import { useNhomApDoanhSo } from "../../../so-do/nhom-ap-doanh-so/hooks"
import { TraoDoiHistory } from "@/shared/components/data-display/trao-doi-history"
import { TraoDoiButton } from "./trao-doi-button"

interface DangKyDoanhSoDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function DangKyDoanhSoDetailView({ id, initialData, onEdit, onBack }: DangKyDoanhSoDetailViewProps) {
  const navigate = useNavigate()
  const query = useDangKyDoanhSoById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  const { data: nhanSuList } = useNhanSu() // Fetch nhan su list for mapping nguoi_tao_id
  const { data: nhomApDoanhSoList } = useNhomApDoanhSo() // Fetch nhom ap doanh so list for mapping nhom_ap_doanh_thu_id
  
  const dangKyDoanhSo = viewState.data

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
        onBack={onBack}
        backUrl={onBack ? undefined : dangKyDoanhSoConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!dangKyDoanhSo) {
    return null
  }

  // Map nguoi_tao_id với nhanSuList để hiển thị tên
  const nguoiTaoDisplay = dangKyDoanhSo.nguoi_tao_id && nhanSuList
    ? nhanSuList.find((ns) => ns.ma_nhan_vien === dangKyDoanhSo.nguoi_tao_id)
    : null

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { label: "Nhân Viên", key: "nhan_vien_id", value: nhanSuList?.find((ns) => ns.ma_nhan_vien === dangKyDoanhSo.nhan_vien_id)?.ho_ten || dangKyDoanhSo.nhan_vien_id?.toString() || "-" },
        { label: "Phòng", key: "phong_id", value: dangKyDoanhSo.ma_phong || (dangKyDoanhSo.phong_id?.toString() || "-") },
        { label: "Nhóm", key: "nhom_id", value: dangKyDoanhSo.ma_nhom || (dangKyDoanhSo.nhom_id?.toString() || "-") },
        { label: "Năm", key: "nam", value: dangKyDoanhSo.nam ?? null, type: "number" },
        { label: "Tháng", key: "thang", value: dangKyDoanhSo.thang ?? null, type: "number" },
        { label: "Bậc DT", key: "bac_dt", value: dangKyDoanhSo.bac_dt || "-" },
        { label: "Doanh Thu", key: "doanh_thu", value: dangKyDoanhSo.doanh_thu ?? null, type: "currency" },
        { label: "Nhóm Áp Doanh Thu", key: "nhom_ap_doanh_thu_id", value: nhomApDoanhSoList?.find((item) => item.id === dangKyDoanhSo.nhom_ap_doanh_thu_id)?.ten_nhom_ap || dangKyDoanhSo.nhom_ap_doanh_thu_id?.toString() || "-" },
        { label: "Mô Tả", key: "mo_ta", value: dangKyDoanhSo.mo_ta || "-", colSpan: 2 },
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
            : (dangKyDoanhSo.nguoi_tao_id?.toString() || "-") 
        },
        { label: "Thời Gian Tạo", key: "tg_tao", value: dangKyDoanhSo.tg_tao, type: "date" },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: dangKyDoanhSo.tg_cap_nhat, type: "date" },
      ]
    },
    {
      title: "Lịch Sử Trao Đổi",
      fields: [
        {
          label: "Trao Đổi",
          key: "trao_doi",
          value: dangKyDoanhSo.trao_doi ? JSON.stringify(dangKyDoanhSo.trao_doi) : "-",
          colSpan: 3, // Full width
          format: () => {
            return <TraoDoiHistory traoDoi={dangKyDoanhSo.trao_doi} />
          }
        },
      ],
      actions: (
        <TraoDoiButton
          dangKyDoanhSo={dangKyDoanhSo}
          variant="primary"
          onSuccess={() => {
            query.refetch()
          }}
        />
      )
    }
  ]

  const actions = (
    <div className="flex items-center gap-2">
      <TraoDoiButton
        dangKyDoanhSo={dangKyDoanhSo}
        variant="default"
        onSuccess={() => {
          query.refetch()
        }}
      />
      <Button
        variant="outline"
        size="sm"
        className={actionButtonClass()}
        onClick={() => {
          if (onEdit) {
            onEdit()
          } else {
            navigate(`${dangKyDoanhSoConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteDangKyDoanhSoButton 
        id={id} 
        name={nhanSuList?.find((ns) => ns.ma_nhan_vien === dangKyDoanhSo.nhan_vien_id)?.ho_ten || `Đăng ký #${id}`} 
      />
    </div>
  )

  const nhanVienDisplay = nhanSuList?.find((ns) => ns.ma_nhan_vien === dangKyDoanhSo.nhan_vien_id)
  const title = nhanVienDisplay?.ho_ten || `Đăng ký #${id}`
  const subtitle = (dangKyDoanhSo.nam && dangKyDoanhSo.thang) 
    ? `${dangKyDoanhSo.thang}/${dangKyDoanhSo.nam}` 
    : dangKyDoanhSo.nam 
      ? `Năm: ${dangKyDoanhSo.nam}` 
      : ""

  return (
    <GenericDetailViewSimple
      title={title}
      subtitle={subtitle}
      sections={sections}
      backUrl={onBack ? undefined : dangKyDoanhSoConfig.routePath}
      onBack={onBack}
      actions={actions}
      isLoading={query.isLoading && !initialData}
    />
  )
}

