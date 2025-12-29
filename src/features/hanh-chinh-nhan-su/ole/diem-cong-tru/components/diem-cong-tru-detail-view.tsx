"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useDiemCongTruById } from "../hooks/use-diem-cong-tru"
import { DeleteDiemCongTruButton } from "./delete-diem-cong-tru-button"
import { diemCongTruConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface DiemCongTruDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function DiemCongTruDetailView({ id, initialData, onEdit, onBack }: DiemCongTruDetailViewProps) {
  const navigate = useNavigate()
  const query = useDiemCongTruById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const diemCongTru = viewState.data

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
        title="Không tìm thấy điểm cộng trừ"
        message="Điểm cộng trừ với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : diemCongTruConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!diemCongTru) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { 
          label: "Nhân Viên", 
          key: "nhan_vien_id", 
          value: diemCongTru.nhan_vien_id?.toString() || "-",
          format: () => {
            const nhanVien = diemCongTru.nhan_vien
            if (!nhanVien) return "-"
            return `${nhanVien.ma_nhan_vien} - ${nhanVien.ho_ten}`
          }
        },
        { label: "Họ và Tên", key: "ho_va_ten", value: diemCongTru.ho_va_ten || "-" },
        { 
          label: "Ngày", 
          key: "ngay", 
          value: diemCongTru.ngay || "-",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return format(new Date(val), "dd/MM/yyyy", { locale: vi })
            } catch {
              return val
            }
          }
        },
        { 
          label: "Phòng Ban", 
          key: "phong_ban_id", 
          value: diemCongTru.phong_ban_id?.toString() || "-",
          format: () => {
            const phongBan = diemCongTru.phong_ban
            if (!phongBan) return "-"
            return `${phongBan.ma_phong_ban} - ${phongBan.ten_phong_ban}`
          }
        },
        { label: "Loại", key: "loai", value: diemCongTru.loai || "-" },
        { label: "Nhóm", key: "nhom", value: diemCongTru.nhom || "-" },
      ]
    },
    {
      title: "Thông Tin Điểm và Tiền",
      fields: [
        { label: "Điểm", key: "diem", value: diemCongTru.diem?.toString() || "0" },
        { 
          label: "Tiền", 
          key: "tien", 
          value: diemCongTru.tien?.toString() || "0",
          format: (val: any) => {
            if (!val && val !== 0) return "0"
            return Number(val).toLocaleString("vi-VN")
          }
        },
        { 
          label: "Nhóm Lương", 
          key: "nhom_luong_id", 
          value: diemCongTru.nhom_luong_id?.toString() || "-",
          format: () => {
            const nhomLuong = diemCongTru.nhom_luong
            if (!nhomLuong) return "-"
            return nhomLuong.ten_nhom
          }
        },
        { label: "Tên Nhóm Lương", key: "ten_nhom_luong", value: diemCongTru.ten_nhom_luong || "-" },
      ]
    },
    {
      title: "Thông Tin Bổ Sung",
      fields: [
        { label: "Mô Tả", key: "mo_ta", value: diemCongTru.mo_ta || "-" },
        { label: "Trạng Thái", key: "trang_thai", value: diemCongTru.trang_thai || "-" },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        {
          label: "Người Tạo",
          key: "nguoi_tao_id",
          value: diemCongTru.nguoi_tao_id?.toString() || "-",
          format: () => {
            const nguoiTao = diemCongTru.nguoi_tao
            if (!nguoiTao) return "-"
            return `${nguoiTao.ma_nhan_vien} - ${nguoiTao.ho_ten}`
          }
        },
        {
          label: "Thời gian tạo",
          key: "tg_tao",
          value: diemCongTru.tg_tao || "-",
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
          value: diemCongTru.tg_cap_nhat || "-",
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
    }
  ]

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      navigate(`${diemCongTruConfig.routePath}/${id}/sua?returnTo=detail`)
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(diemCongTruConfig.routePath)
    }
  }

  const handleDeleteSuccess = () => {
    // Navigate to list view after successful deletion
    navigate(diemCongTruConfig.routePath)
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
      <DeleteDiemCongTruButton
        id={diemCongTru.id!}
        name={diemCongTru.ho_va_ten || `ID: ${diemCongTru.id}`}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={diemCongTru.ho_va_ten || `Điểm Cộng Trừ #${diemCongTru.id}`}
      subtitle={diemCongTru.mo_ta || ""}
      sections={sections}
      actions={actions}
      backUrl={onBack ? undefined : diemCongTruConfig.routePath}
      onBack={handleBack}
    />
  )
}

