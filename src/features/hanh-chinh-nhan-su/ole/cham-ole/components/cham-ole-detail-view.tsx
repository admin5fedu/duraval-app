"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useChamOleById } from "../hooks/use-cham-ole"
import { DeleteChamOleButton } from "./delete-cham-ole-button"
import { TraoDoiButton } from "./trao-doi-button"
import { chamOleConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { TraoDoiHistory } from "@/shared/components"
import { Badge } from "@/components/ui/badge"

interface ChamOleDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function ChamOleDetailView({ id, initialData, onEdit, onBack }: ChamOleDetailViewProps) {
  const navigate = useNavigate()
  const query = useChamOleById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const chamOle = viewState.data

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

  if (viewState.isError) {
    return (
      <DetailErrorState
        title="Không tìm thấy chấm OLE"
        message="Chấm OLE với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : chamOleConfig.routePath}
      />
    )
  }

  if (!chamOle) {
    return null
  }

  const nhanVienName = chamOle.nhan_vien 
    ? `${chamOle.nhan_vien.ma_nhan_vien} - ${chamOle.nhan_vien.ho_ten}`
    : `ID: ${chamOle.id}`

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { 
          label: "Nhân Viên", 
          key: "nhan_vien_id", 
          value: chamOle.nhan_vien_id?.toString() || "-",
          format: () => {
            const nhanVien = chamOle.nhan_vien
            if (!nhanVien) return "-"
            return `${nhanVien.ma_nhan_vien} - ${nhanVien.ho_ten}`
          }
        },
        { 
          label: "Năm", 
          key: "nam", 
          value: chamOle.nam?.toString() || "-",
        },
        { 
          label: "Tháng", 
          key: "thang", 
          value: chamOle.thang?.toString() || "-",
        },
        { 
          label: "Phòng", 
          key: "phong_id", 
          value: chamOle.phong_id?.toString() || "-",
          format: () => {
            const phongBan = chamOle.phong_ban
            if (!phongBan) return "-"
            return `${phongBan.ma_phong_ban} - ${phongBan.ten_phong_ban}`
          }
        },
        { 
          label: "Chức Vụ", 
          key: "chuc_vu_id", 
          value: chamOle.chuc_vu_id?.toString() || "-",
          format: () => {
            const chucVu = chamOle.chuc_vu
            if (!chucVu) return "-"
            return chucVu.ten_chuc_vu
          }
        },
        { 
          label: "Nhóm", 
          key: "nhom_id", 
          value: chamOle.nhom_id?.toString() || "-",
          format: () => {
            const nhom = chamOle.nhom
            if (!nhom) return chamOle.nhom_id ? String(chamOle.nhom_id) : "-"
            return nhom.ten_nhom
          }
        },
      ]
    },
    {
      title: "Thông Tin Điểm",
      fields: [
        { 
          label: "Đánh Giá", 
          key: "danh_gia", 
          value: chamOle.danh_gia || "-",
          format: (val: any) => {
            if (!val) return "-"
            
            // Format rules cho đánh giá
            const isDat = val === "Đạt"
            const badgeClassName = isDat
              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            
            return (
              <Badge variant="outline" className={badgeClassName}>
                {val}
              </Badge>
            )
          }
        },
        { 
          label: "OLE", 
          key: "ole", 
          value: chamOle.ole?.toString() || "0",
          format: (val: any) => {
            if (!val && val !== 0) return "0"
            return Number(val).toLocaleString("vi-VN")
          }
        },
        { 
          label: "KPI", 
          key: "kpi", 
          value: chamOle.kpi?.toString() || "0",
          format: (val: any) => {
            if (!val && val !== 0) return "0"
            return Number(val).toLocaleString("vi-VN")
          }
        },
        { 
          label: "Cộng", 
          key: "cong", 
          value: chamOle.cong?.toString() || "0",
          format: (val: any) => {
            if (!val && val !== 0) return "0"
            return Number(val).toLocaleString("vi-VN")
          }
        },
        { 
          label: "Trừ", 
          key: "tru", 
          value: chamOle.tru?.toString() || "0",
          format: (val: any) => {
            if (!val && val !== 0) return "0"
            return Number(val).toLocaleString("vi-VN")
          }
        },
      ]
    },
    {
      title: "Thông Tin Bổ Sung",
      fields: [
        { label: "Ghi Chú", key: "ghi_chu", value: chamOle.ghi_chu || "-" },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        {
          label: "Người Tạo",
          key: "nguoi_tao_id",
          value: chamOle.nguoi_tao_id?.toString() || "-",
          format: () => {
            const nguoiTao = chamOle.nguoi_tao
            if (!nguoiTao) return "-"
            return `${nguoiTao.ma_nhan_vien} - ${nguoiTao.ho_ten}`
          }
        },
        {
          label: "Thời gian tạo",
          key: "tg_tao",
          value: chamOle.tg_tao || "-",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return format(new Date(val), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
              return val
            }
          }
        },
        {
          label: "Thời gian cập nhật",
          key: "tg_cap_nhat",
          value: chamOle.tg_cap_nhat || "-",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return format(new Date(val), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
              return val
            }
          }
        },
      ]
    },
    {
      title: "Lịch Sử Trao Đổi",
      fields: [
        {
          label: "Trao Đổi",
          key: "trao_doi",
          value: chamOle.trao_doi ? JSON.stringify(chamOle.trao_doi) : "-",
          colSpan: 3, // Full width
          format: () => {
            return <TraoDoiHistory traoDoi={chamOle.trao_doi} />
          }
        },
      ],
      actions: (
        <TraoDoiButton
          chamOle={chamOle}
          variant="primary"
          onSuccess={() => {
            query.refetch()
          }}
        />
      )
    }
  ]

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      navigate(`${chamOleConfig.routePath}/${id}/sua?returnTo=detail`)
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(chamOleConfig.routePath)
    }
  }

  const handleDeleteSuccess = () => {
    navigate(chamOleConfig.routePath)
  }

  const actions = (
    <div className="flex items-center gap-2">
      <TraoDoiButton
        chamOle={chamOle}
        onSuccess={() => {
          // Refresh data after successful comment
          query.refetch()
        }}
      />
      <Button
        variant="outline"
        size="sm"
        className={actionButtonClass()}
        onClick={handleEdit}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" />
        Sửa
      </Button>
      <DeleteChamOleButton
        id={chamOle.id!}
        name={nhanVienName}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={nhanVienName}
      subtitle={`Năm ${chamOle.nam || ''} - Tháng ${chamOle.thang || ''}`}
      sections={sections}
      actions={actions}
      backUrl={onBack ? undefined : chamOleConfig.routePath}
      onBack={handleBack}
    />
  )
}

