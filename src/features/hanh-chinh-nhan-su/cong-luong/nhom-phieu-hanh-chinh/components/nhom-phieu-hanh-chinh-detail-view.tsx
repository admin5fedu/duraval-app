"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useNhomPhieuHanhChinhById } from "../hooks/use-nhom-phieu-hanh-chinh"
import { DeleteNhomPhieuHanhChinhButton } from "./delete-nhom-phieu-hanh-chinh-button"
import { nhomPhieuHanhChinhConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getLoaiPhieuBadgeClass } from "../utils/loai-phieu-colors"

interface NhomPhieuHanhChinhDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function NhomPhieuHanhChinhDetailView({ id, initialData, onEdit, onBack }: NhomPhieuHanhChinhDetailViewProps) {
  const navigate = useNavigate()
  const query = useNhomPhieuHanhChinhById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  
  const nhomPhieu = viewState.data

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
        title="Không tìm thấy nhóm phiếu hành chính"
        message="Nhóm phiếu hành chính với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : nhomPhieuHanhChinhConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  if (!nhomPhieu) {
    return null
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { 
          label: "Loại Phiếu", 
          key: "loai_phieu", 
          value: nhomPhieu.loai_phieu || "",
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
        { label: "Mã Nhóm Phiếu", key: "ma_nhom_phieu", value: nhomPhieu.ma_nhom_phieu },
        { label: "Tên Nhóm Phiếu", key: "ten_nhom_phieu", value: nhomPhieu.ten_nhom_phieu },
        { 
          label: "Số Lượng Cho Phép/Tháng", 
          key: "so_luong_cho_phep_thang", 
          value: nhomPhieu.so_luong_cho_phep_thang?.toString() || "0" 
        },
      ]
    },
    {
      title: "Cấu Hình",
      fields: [
        { 
          label: "Cần HCNS Duyệt", 
          key: "can_hcns_duyet", 
          value: nhomPhieu.can_hcns_duyet || "",
          format: (val: any) => {
            const canDuyet = val as string | null
            if (!canDuyet || canDuyet === "") return "-"
            const isCo = canDuyet === "Có"
            return (
              <Badge variant={isCo ? "default" : "secondary"} className="gap-1">
                {isCo ? (
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
          label: "Ca Tối", 
          key: "ca_toi", 
          value: nhomPhieu.ca_toi || "",
          format: (val: any) => {
            const caToi = val as string | null
            if (!caToi || caToi === "") return "-"
            const isCo = caToi === "Có"
            return (
              <Badge variant={isCo ? "default" : "secondary"} className="gap-1">
                {isCo ? (
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
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { 
          label: "Người Tạo", 
          key: "nguoi_tao_id", 
          value: (() => {
            const nguoiTaoId = nhomPhieu.nguoi_tao_id as number | null
            const nguoiTaoTen = nhomPhieu.nguoi_tao_ten as string | null
            const nguoiTaoMaNhanVien = (nhomPhieu as any).nguoi_tao?.ma_nhan_vien as number | null
            if (nguoiTaoId === null || nguoiTaoId === undefined) {
              return "-"
            }
            const maNhanVien = nguoiTaoMaNhanVien || nguoiTaoId
            return nguoiTaoTen 
              ? `${maNhanVien} - ${nguoiTaoTen}`
              : maNhanVien.toString()
          })(),
        },
        { label: "Thời Gian Tạo", key: "tg_tao", value: nhomPhieu.tg_tao, type: "date" },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: nhomPhieu.tg_cap_nhat, type: "date" },
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
            navigate(`${nhomPhieuHanhChinhConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteNhomPhieuHanhChinhButton id={id} name={nhomPhieu.ten_nhom_phieu} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={nhomPhieu.ten_nhom_phieu}
      subtitle={nhomPhieu.ma_nhom_phieu}
      sections={sections}
      backUrl={onBack ? undefined : nhomPhieuHanhChinhConfig.routePath}
      onBack={onBack}
      actions={actions}
      isLoading={query.isLoading && !initialData}
    />
  )
}

