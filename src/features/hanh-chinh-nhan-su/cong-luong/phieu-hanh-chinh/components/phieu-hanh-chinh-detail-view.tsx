"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { usePhieuHanhChinhById } from "../hooks/use-phieu-hanh-chinh"
import { DeletePhieuHanhChinhButton } from "./delete-phieu-hanh-chinh-button"
import { phieuHanhChinhConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { getLoaiPhieuBadgeClass } from "../utils/loai-phieu-colors"
import { getCaBadgeClass } from "../utils/ca-colors"
import { getComTruaBadgeClass } from "../utils/com-trua-colors"
import { getPhuongTienBadgeClass } from "../utils/phuong-tien-colors"

interface PhieuHanhChinhDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function PhieuHanhChinhDetailView({ id, initialData, onEdit, onBack }: PhieuHanhChinhDetailViewProps) {
  const navigate = useNavigate()
  const query = usePhieuHanhChinhById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const phieu = viewState.data

  // ✅ QUAN TRỌNG: Tất cả hooks phải được gọi TRƯỚC các early returns
  // Format mã phiếu display: "mã - tên" if ten_nhom_phieu exists
  // ✅ Sử dụng React.useMemo để đồng bộ với pattern của app (form view, ma-phieu-select)
  const maPhieuDisplay = React.useMemo(() => {
    if (!phieu?.ma_phieu) return "Phiếu hành chính"
    const maPhieu = phieu.ma_phieu
    const tenNhomPhieu = phieu.ten_nhom_phieu
    return tenNhomPhieu 
      ? `${maPhieu} - ${tenNhomPhieu}`
      : maPhieu
  }, [phieu?.ma_phieu, phieu?.ten_nhom_phieu])

  // Format header title: "Ngày + Tên người tạo"
  const headerTitle = React.useMemo(() => {
    if (!phieu) return "Phiếu hành chính"
    const parts: string[] = []
    
    // Format ngày
    if (phieu.ngay) {
      try {
        const dateObj = phieu.ngay instanceof Date ? phieu.ngay : new Date(phieu.ngay)
        const dateStr = format(dateObj, "dd/MM/yyyy", { locale: vi })
        parts.push(dateStr)
      } catch {
        parts.push(String(phieu.ngay))
      }
    }
    
    // Thêm tên người tạo
    if (phieu.nguoi_tao_ten) {
      parts.push(phieu.nguoi_tao_ten)
    } else if (phieu.nguoi_tao_id) {
      parts.push(String(phieu.nguoi_tao_id))
    }
    
    return parts.length > 0 ? parts.join(" - ") : "Phiếu hành chính"
  }, [phieu?.ngay, phieu?.nguoi_tao_id, phieu?.nguoi_tao_ten])

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
        title="Không tìm thấy phiếu hành chính"
        message="Phiếu hành chính với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : phieuHanhChinhConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!phieu) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { 
          label: "Ngày", 
          key: "ngay", 
          value: phieu.ngay ? (phieu.ngay instanceof Date ? phieu.ngay.toISOString() : String(phieu.ngay)) : "",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return format(new Date(val), "dd/MM/yyyy", { locale: vi })
            } catch {
              return String(val)
            }
          }
        },
        { 
          label: "Loại Phiếu", 
          key: "loai_phieu", 
          value: phieu.loai_phieu || "",
          format: (val: any) => {
            const loaiPhieu = val as string | null
            if (!loaiPhieu || loaiPhieu === "") return "-"
            
            const badgeClass = getLoaiPhieuBadgeClass(loaiPhieu)
            return (
              <Badge variant="outline" className={cn(badgeClass)}>
                {loaiPhieu}
              </Badge>
            )
          }
        },
        { 
          label: "Mã Phiếu", 
          key: "ma_phieu", 
          value: phieu.ma_phieu || "",
          format: (val: any) => {
            if (!val) return "-"
            const maPhieu = val as string
            const tenNhomPhieu = phieu.ten_nhom_phieu
            return tenNhomPhieu 
              ? `${maPhieu} - ${tenNhomPhieu}`
              : maPhieu
          }
        },
        { 
          label: "Ca", 
          key: "ca", 
          value: phieu.ca || "",
          format: (val: any) => {
            const ca = val as string | null
            if (!ca || ca === "") return "-"
            
            const badgeClass = getCaBadgeClass(ca)
            return (
              <Badge variant="outline" className={cn(badgeClass)}>
                {ca}
              </Badge>
            )
          }
        },
        { 
          label: "Số Giờ", 
          key: "so_gio", 
          value: phieu.so_gio?.toString() || "-" 
        },
        { label: "Lý Do", key: "ly_do", value: phieu.ly_do || "-" },
      ]
    },
    {
      title: "Thông Tin Bổ Sung",
      fields: [
        { 
          label: "Cơm Trưa", 
          key: "com_trua", 
          value: phieu.com_trua ?? false,
          format: (val: any) => {
            const comTrua = val as boolean | null
            if (comTrua === null || comTrua === undefined) return "-"
            const badgeClass = getComTruaBadgeClass(comTrua)
            return (
              <Badge variant="outline" className={cn(badgeClass, "gap-1")}>
                {comTrua ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Có
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    Không
                  </>
                )}
              </Badge>
            )
          }
        },
        { 
          label: "Phương Tiện", 
          key: "phuong_tien", 
          value: phieu.phuong_tien || "",
          format: (val: any) => {
            const phuongTien = val as string | null
            if (!phuongTien || phuongTien === "") return "-"
            
            const badgeClass = getPhuongTienBadgeClass(phuongTien)
            return (
              <Badge variant="outline" className={cn(badgeClass)}>
                {phuongTien}
              </Badge>
            )
          }
        },
        { 
          label: "Trạng Thái", 
          key: "trang_thai", 
          value: phieu.trang_thai || "Chờ duyệt",
          format: (val: any) => {
            const trangThai = val as string | null
            if (!trangThai || trangThai === "") return "-"
            const variant = trangThai === "Đã duyệt" ? "default" : trangThai === "Từ chối" ? "destructive" : "secondary"
            return (
              <Badge variant={variant}>
                {trangThai}
              </Badge>
            )
          }
        },
      ]
    },
    {
      title: "Duyệt Quản Lý",
      fields: [
        { 
          label: "Quản Lý Đã Duyệt", 
          key: "quan_ly_duyet", 
          value: phieu.quan_ly_duyet ?? false,
          format: (val: any) => {
            const duyet = val as boolean | null
            if (duyet === null || duyet === undefined) return "-"
            return (
              <Badge variant={duyet ? "default" : "secondary"} className="gap-1">
                {duyet ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Đã duyệt
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    Chưa duyệt
                  </>
                )}
              </Badge>
            )
          }
        },
        { label: "Tên Quản Lý", key: "ten_quan_ly", value: phieu.ten_quan_ly || "-" },
        { 
          label: "Thời Gian Quản Lý Duyệt", 
          key: "tg_quan_ly_duyet", 
          value: phieu.tg_quan_ly_duyet || "",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return format(new Date(val), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
              return String(val)
            }
          }
        },
      ]
    },
    {
      title: "Duyệt HCNS",
      fields: [
        { 
          label: "HCNS Đã Duyệt", 
          key: "hcns_duyet", 
          value: phieu.hcns_duyet ?? false,
          format: (val: any) => {
            const duyet = val as boolean | null
            if (duyet === null || duyet === undefined) return "-"
            return (
              <Badge variant={duyet ? "default" : "secondary"} className="gap-1">
                {duyet ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Đã duyệt
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    Chưa duyệt
                  </>
                )}
              </Badge>
            )
          }
        },
        { label: "Tên HCNS", key: "ten_hcns", value: phieu.ten_hcns || "-" },
        { 
          label: "Thời Gian HCNS Duyệt", 
          key: "tg_hcns_duyet", 
          value: phieu.tg_hcns_duyet || "",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return format(new Date(val), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
              return String(val)
            }
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
          value: (() => {
            const nguoiTaoId = phieu.nguoi_tao_id
            const nguoiTaoTen = phieu.nguoi_tao_ten
            if (!nguoiTaoId) return "-"
            return nguoiTaoTen 
              ? `${nguoiTaoId} - ${nguoiTaoTen}`
              : String(nguoiTaoId)
          })()
        },
        { 
          label: "Thời Gian Tạo", 
          key: "tg_tao", 
          value: phieu.tg_tao || "",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return format(new Date(val), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
              return String(val)
            }
          }
        },
        { 
          label: "Thời Gian Cập Nhật", 
          key: "tg_cap_nhat", 
          value: phieu.tg_cap_nhat || "",
          format: (val: any) => {
            if (!val) return "-"
            try {
              return format(new Date(val), "dd/MM/yyyy HH:mm", { locale: vi })
            } catch {
              return String(val)
            }
          }
        },
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
            navigate(`${phieuHanhChinhConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeletePhieuHanhChinhButton id={id} name={maPhieuDisplay || "Phiếu hành chính"} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={headerTitle}
      subtitle={maPhieuDisplay}
      sections={sections}
      backUrl={onBack ? undefined : phieuHanhChinhConfig.routePath}
      onBack={onBack}
      actions={actions}
      isLoading={query.isLoading && !initialData}
    />
  )
}

