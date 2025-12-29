"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useNhomDiemCongTruById } from "../hooks/use-nhom-diem-cong-tru"
import { DeleteNhomDiemCongTruButton } from "./delete-nhom-diem-cong-tru-button"
import { nhomDiemCongTruConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { Badge } from "@/components/ui/badge"
import { usePhongBan } from "@/features/he-thong/so-do/phong-ban/hooks"

interface NhomDiemCongTruDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function NhomDiemCongTruDetailView({ id, initialData, onEdit, onBack }: NhomDiemCongTruDetailViewProps) {
  const navigate = useNavigate()
  const query = useNhomDiemCongTruById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  const { data: phongBanList } = usePhongBan() // Fetch all phong ban upfront
  
  const nhomDiem = viewState.data

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
        title="Không tìm thấy nhóm điểm cộng trừ"
        message="Nhóm điểm cộng trừ với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : nhomDiemCongTruConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!nhomDiem) {
    return null
  }

  // Helper function to display phong ban list
  const renderPhongBanList = (ids: number[] | null) => {
    if (!ids || ids.length === 0) {
      return <span className="text-muted-foreground">-</span>
    }
    
    const selectedPhongBans = phongBanList?.filter(pb => ids.includes(pb.id!)) || []
    
    if (selectedPhongBans.length === 0) {
      return (
        <div className="flex flex-wrap gap-2">
          {ids.map((pbId) => (
            <Badge key={pbId} variant="outline">{pbId}</Badge>
          ))}
        </div>
      )
    }
    
    return (
      <div className="flex flex-wrap gap-2">
        {selectedPhongBans.map((pb) => (
          <Badge key={pb.id} variant="outline">
            {pb.ma_phong_ban} - {pb.ten_phong_ban}
          </Badge>
        ))}
      </div>
    )
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { 
          label: "Hạng Mục", 
          key: "hang_muc", 
          value: nhomDiem.hang_muc,
          format: (val: any) => {
            const hangMuc = val as string | null
            if (!hangMuc || (hangMuc !== "Cộng" && hangMuc !== "Trừ")) return "-"
            const badgeClass = hangMuc === "Cộng" 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
            return (
              <Badge variant="outline" className={badgeClass}>
                {hangMuc}
              </Badge>
            )
          }
        },
        { label: "Nhóm", key: "nhom", value: nhomDiem.nhom },
        { 
          label: "Min", 
          key: "min", 
          value: nhomDiem.min?.toString() || "0" 
        },
        { 
          label: "Max", 
          key: "max", 
          value: nhomDiem.max?.toString() || "0" 
        },
        { 
          label: "Mô Tả", 
          key: "mo_ta", 
          value: nhomDiem.mo_ta || "-" 
        },
      ]
    },
    {
      title: "Cấu Hình Áp Dụng",
      fields: [
        { 
          label: "Phòng Ban Áp Dụng", 
          key: "pb_ap_dung_ib", 
          value: nhomDiem.pb_ap_dung_ib || null,
          format: (val: any) => {
            const ids = val as number[] | null
            return renderPhongBanList(ids)
          }
        },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        {
          label: "Người Tạo",
          key: "nguoi_tao_id",
          value: nhomDiem.nguoi_tao_id?.toString() || "-",
          format: () => {
            const nguoiTaoId = nhomDiem.nguoi_tao_id
            const nguoiTaoTen = nhomDiem.nguoi_tao_ten
            if (!nguoiTaoId) return "-"
            return nguoiTaoTen ? `${nguoiTaoId} - ${nguoiTaoTen}` : nguoiTaoId.toString()
          }
        },
        {
          label: "Thời gian tạo",
          key: "tg_tao",
          value: nhomDiem.tg_tao || "-",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return new Date(val).toLocaleString("vi-VN")
            } catch {
              return val
            }
          }
        },
        {
          label: "Thời gian cập nhật",
          key: "tg_cap_nhat",
          value: nhomDiem.tg_cap_nhat || "-",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return new Date(val).toLocaleString("vi-VN")
            } catch {
              return val
            }
          }
        },
      ]
    }
  ]

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      navigate(`${nhomDiemCongTruConfig.routePath}/${id}/sua?returnTo=detail`)
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(nhomDiemCongTruConfig.routePath)
    }
  }

  const handleDeleteSuccess = () => {
    // Navigate to list view after successful deletion
    navigate(nhomDiemCongTruConfig.routePath)
  }

  const actions = (
    <div className="flex items-center gap-2">
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
      <DeleteNhomDiemCongTruButton
        id={nhomDiem.id!}
        name={nhomDiem.hang_muc}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={nhomDiem.hang_muc}
      subtitle={`Nhóm: ${nhomDiem.nhom}`}
      sections={sections}
      actions={actions}
      backUrl={onBack ? undefined : nhomDiemCongTruConfig.routePath}
      onBack={handleBack}
    />
  )
}

