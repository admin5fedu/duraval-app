"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useTaiLieuBieuMauById, useTaiLieuBieuMau } from "../hooks"
import { DeleteTaiLieuBieuMauButton } from "./delete-tai-lieu-bieu-mau-button"
import { TraoDoiButton } from "./trao-doi-button"
import { taiLieuBieuMauConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { formatDateTime } from "@/shared/utils/date-format"
import { getHangMucBadgeColor } from "../constants/badge-colors"
import { ChildrenTaiLieuSection } from "./children-tai-lieu-section"
import { useMemo } from "react"

interface TaiLieuBieuMauDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function TaiLieuBieuMauDetailView({ id, initialData, onEdit, onBack }: TaiLieuBieuMauDetailViewProps) {
  const navigate = useNavigate()
  const query = useTaiLieuBieuMauById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  const { data: allTaiLieuBieuMauList = [] } = useTaiLieuBieuMau()

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  const taiLieuBieuMau = viewState.data

  // Lấy danh sách tài liệu con (có tai_lieu_cha_id = id)
  const childrenList = useMemo(() => {
    if (!taiLieuBieuMau) return []
    return allTaiLieuBieuMauList.filter(
      item => item.tai_lieu_cha_id === id
    ).sort((a, b) => {
      // Sắp xếp theo tg_tao desc
      const tgTaoA = a.tg_tao ? new Date(a.tg_tao).getTime() : 0
      const tgTaoB = b.tg_tao ? new Date(b.tg_tao).getTime() : 0
      return tgTaoB - tgTaoA
    })
  }, [allTaiLieuBieuMauList, id, taiLieuBieuMau])

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
        title="Không tìm thấy tài liệu & biểu mẫu"
        message="Tài liệu & biểu mẫu với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : taiLieuBieuMauConfig.routePath}
      />
    )
  }

  if (!taiLieuBieuMau) {
    return null
  }

  const displayTitle = taiLieuBieuMau.ten_tai_lieu || taiLieuBieuMau.ma_tai_lieu || `ID: ${taiLieuBieuMau.id}`
  const displaySubtitle = taiLieuBieuMau.ghi_chu || "Tài liệu & biểu mẫu"

  // Badge color mapping for hang_muc
  const hangMucBadgeClass = getHangMucBadgeColor(taiLieuBieuMau.hang_muc)

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { 
          label: "Mã Tài Liệu", 
          key: "ma_tai_lieu", 
          value: taiLieuBieuMau.ma_tai_lieu || "-" 
        },
        { 
          label: "Tên Tài Liệu", 
          key: "ten_tai_lieu", 
          value: taiLieuBieuMau.ten_tai_lieu || "-" 
        },
        { 
          label: "Mô Tả", 
          key: "mo_ta", 
          value: taiLieuBieuMau.mo_ta || "-" 
        },
        { 
          label: "Hạng Mục", 
          key: "hang_muc", 
          value: taiLieuBieuMau.hang_muc || "-",
          format: (val: any) => {
            if (!val || val === "-") return "-"
            return (
              <Badge variant="outline" className={hangMucBadgeClass}>
                {val}
              </Badge>
            )
          }
        },
        { 
          label: "Danh Mục Cha", 
          key: "ten_danh_muc_cha", 
          value: taiLieuBieuMau.ten_danh_muc_cha || "-" 
        },
        { 
          label: "Trạng Thái", 
          key: "trang_thai", 
          value: taiLieuBieuMau.trang_thai || "-",
          format: (val: any) => {
            if (!val || val === "-") return "-"
            return <Badge variant="outline">{val}</Badge>
          }
        },
      ]
    },
    {
      title: "Liên Kết",
      fields: [
        { 
          label: "Link Dự Thảo", 
          key: "link_du_thao", 
          value: taiLieuBieuMau.link_du_thao || "-",
          format: (val: any) => {
            if (!val || val === "-") return "-"
            return (
              <a 
                href={val} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {val}
              </a>
            )
          }
        },
        { 
          label: "Link Áp Dụng", 
          key: "link_ap_dung", 
          value: taiLieuBieuMau.link_ap_dung || "-",
          format: (val: any) => {
            if (!val || val === "-") return "-"
            return (
              <a 
                href={val} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {val}
              </a>
            )
          }
        },
      ]
    },
    {
      title: "Thông Tin Bổ Sung",
      fields: [
        { 
          label: "Ghi Chú", 
          key: "ghi_chu", 
          value: taiLieuBieuMau.ghi_chu || "-",
          type: "text"
        },
        { 
          label: "Phân Phối Phòng Ban ID", 
          key: "phan_phoi_pb_id", 
          value: taiLieuBieuMau.phan_phoi_pb_id?.toString() || "-" 
        },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { 
          label: "Người Tạo", 
          key: "nguoi_tao_id", 
          value: taiLieuBieuMau.nguoi_tao_id 
            ? `${taiLieuBieuMau.nguoi_tao_id}${taiLieuBieuMau.nguoi_tao_ten ? ` - ${taiLieuBieuMau.nguoi_tao_ten}` : ''}`
            : "-" 
        },
        { 
          label: "Thời Gian Tạo", 
          key: "tg_tao", 
          value: formatDateTime(taiLieuBieuMau.tg_tao)
        },
        { 
          label: "Thời Gian Cập Nhật", 
          key: "tg_cap_nhat", 
          value: formatDateTime(taiLieuBieuMau.tg_cap_nhat)
        },
      ]
    },
  ]

  const actions = (
    <div className="flex items-center gap-2">
      <TraoDoiButton taiLieuBieuMau={taiLieuBieuMau} />
      <Button
        variant="outline"
        size="sm"
        className={actionButtonClass()}
        onClick={() => {
          if (onEdit) {
            onEdit()
          } else {
            navigate(`${taiLieuBieuMauConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteTaiLieuBieuMauButton id={id} name={displayTitle} />
    </div>
  )

  return (
    <>
      <GenericDetailViewSimple
        title={displayTitle}
        subtitle={displaySubtitle}
        sections={sections}
        backUrl={onBack ? undefined : taiLieuBieuMauConfig.routePath}
        onBack={onBack}
        actions={actions}
      />
      
      {/* Children Tai Lieu Section */}
      <div className="mt-6">
        <ChildrenTaiLieuSection
          parentId={id}
          parentHangMuc={taiLieuBieuMau.hang_muc}
          parentLoaiId={taiLieuBieuMau.loai_id}
          children={childrenList}
          isLoading={query.isLoading || !allTaiLieuBieuMauList}
        />
      </div>
    </>
  )
}

