"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, FolderPlus } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useDanhMucTaiLieuById, useDanhMucTaiLieu } from "../hooks"
import { DeleteDanhMucTaiLieuButton } from "./delete-danh-muc-tai-lieu-button"
import { danhMucTaiLieuConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { formatDateTime } from "@/shared/utils/date-format"
import { useMemo } from "react"
import { ChildrenCategoriesSection } from "./children-categories-section"
import { getHangMucBadgeColor, getCapBadgeColor } from "../constants/badge-colors"

interface DanhMucTaiLieuDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function DanhMucTaiLieuDetailView({ id, initialData, onEdit, onBack }: DanhMucTaiLieuDetailViewProps) {
  const navigate = useNavigate()
  const query = useDanhMucTaiLieuById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  const { data: allDanhMucTaiLieuList = [] } = useDanhMucTaiLieu()

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  const danhMucTaiLieu = viewState.data
  const isCap1 = danhMucTaiLieu?.cap === 1

  // Lấy danh sách danh mục con (cấp 2) của danh mục cha này
  // Phải đặt trước early returns để tránh lỗi hooks
  const childrenList = useMemo(() => {
    if (!isCap1 || !danhMucTaiLieu) return []
    return allDanhMucTaiLieuList.filter(
      item => item.cap === 2 && item.danh_muc_cha_id === id
    ).sort((a, b) => {
      // Sắp xếp theo tg_tao desc
      const tgTaoA = a.tg_tao ? new Date(a.tg_tao).getTime() : 0
      const tgTaoB = b.tg_tao ? new Date(b.tg_tao).getTime() : 0
      return tgTaoB - tgTaoA
    })
  }, [allDanhMucTaiLieuList, id, isCap1, danhMucTaiLieu])

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
        title="Không tìm thấy danh mục tài liệu"
        message="Danh mục tài liệu với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : danhMucTaiLieuConfig.routePath}
      />
    )
  }

  if (!danhMucTaiLieu) {
    return null
  }

  const displayTitle = danhMucTaiLieu.ten_danh_muc || danhMucTaiLieu.hang_muc || `ID: ${danhMucTaiLieu.id}`
  const displaySubtitle = danhMucTaiLieu.mo_ta || "Danh mục tài liệu"

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { 
          label: "Hạng Mục", 
          key: "hang_muc", 
          value: danhMucTaiLieu.hang_muc || "-",
          format: (val: any) => {
            if (!val || val === "-") return "-"
            const badgeClass = getHangMucBadgeColor(val)
            return (
              <Badge variant="outline" className={badgeClass}>
                {val}
              </Badge>
            )
          }
        },
        { label: "Tên Danh Mục", key: "ten_danh_muc", value: danhMucTaiLieu.ten_danh_muc || "-" },
        { label: "Loại Tài Liệu", key: "loai_tai_lieu", value: danhMucTaiLieu.loai_tai_lieu || "-" },
        { 
          label: "Cấp", 
          key: "cap", 
          value: danhMucTaiLieu.cap !== null && danhMucTaiLieu.cap !== undefined ? danhMucTaiLieu.cap.toString() : "-",
          format: (val: any) => {
            if (!val || val === "-") return "-"
            const cap = Number(val)
            if (isNaN(cap)) return val
            
            const badgeClass = getCapBadgeColor(cap)
            
            return (
              <Badge variant="outline" className={badgeClass}>
                Cấp {cap}
              </Badge>
            )
          }
        },
        { 
          label: "Danh Mục Cha", 
          key: "ten_danh_muc_cha", 
          value: danhMucTaiLieu.ten_danh_muc_cha || "-",
          format: (val: any) => {
            if (!val || val === "-") return "-"
            if (danhMucTaiLieu.danh_muc_cha_id) {
              return (
                <button
                  onClick={() => navigate(`${danhMucTaiLieuConfig.routePath}/${danhMucTaiLieu.danh_muc_cha_id}`)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {val}
                </button>
              )
            }
            return val
          }
        },
        { label: "Mô Tả", key: "mo_ta", value: danhMucTaiLieu.mo_ta || "-" },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { 
          label: "Người Tạo", 
          key: "nguoi_tao_id", 
          value: danhMucTaiLieu.nguoi_tao_id 
            ? `${danhMucTaiLieu.nguoi_tao_id}${danhMucTaiLieu.nguoi_tao_ten ? ` - ${danhMucTaiLieu.nguoi_tao_ten}` : ''}`
            : "-"
        },
        { label: "Thời Gian Tạo", key: "tg_tao", value: formatDateTime(danhMucTaiLieu.tg_tao) },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDateTime(danhMucTaiLieu.tg_cap_nhat) },
      ]
    }
  ]

  const actions = (
    <div className="flex items-center gap-2">
      {isCap1 && (
        <Button
          variant="outline"
          size="sm"
          className={actionButtonClass()}
          onClick={() => {
            const params = new URLSearchParams({
              danh_muc_cha_id: String(id),
              hang_muc: danhMucTaiLieu.hang_muc || "",
              loai_id: String(danhMucTaiLieu.loai_id || ""),
              returnTo: "detail"
            })
            navigate(`${danhMucTaiLieuConfig.routePath}/moi?${params.toString()}`)
          }}
          data-action="add-child"
        >
          <FolderPlus className="mr-2 h-4 w-4" /> Thêm danh mục con
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        className={actionButtonClass()}
        onClick={() => {
          if (onEdit) {
            onEdit()
          } else {
            navigate(`${danhMucTaiLieuConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteDanhMucTaiLieuButton id={id} name={displayTitle} />
    </div>
  )

  return (
    <>
      <GenericDetailViewSimple
        title={displayTitle}
        subtitle={displaySubtitle}
        sections={sections}
        backUrl={onBack ? undefined : danhMucTaiLieuConfig.routePath}
        onBack={onBack}
        actions={actions}
      />
      
      {/* Children Categories Section - Only for Level 1 */}
      {isCap1 && (
        <div className="mt-6">
          <ChildrenCategoriesSection
            parentId={id}
            parentHangMuc={danhMucTaiLieu.hang_muc || ""}
            parentLoaiId={danhMucTaiLieu.loai_id || 0}
            children={childrenList}
            isLoading={query.isLoading || !allDanhMucTaiLieuList}
          />
        </div>
      )}
    </>
  )
}

