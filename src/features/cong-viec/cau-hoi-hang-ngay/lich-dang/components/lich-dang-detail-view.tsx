"use client"

import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit, Eye } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useLichDangById } from "../hooks"
import { DeleteLichDangButton } from "./delete-lich-dang-button"
import { lichDangConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { PreviewDialog } from "./preview-dialog"
import { LichDangAPI } from "../services/lich-dang.api"
import { useReferenceQuery } from "@/lib/react-query/hooks"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"

interface LichDangDetailViewProps {
  id: number
  initialData?: any
  initialDanhSachChucVu?: any[]
  onEdit?: () => void
  onBack?: () => void
}

export function LichDangDetailView({ 
  id, 
  initialData, 
  initialDanhSachChucVu,
  onEdit, 
  onBack 
}: LichDangDetailViewProps) {
  const navigate = useNavigate()
  const query = useLichDangById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)

  // Fetch danh sách chức vụ để map ID -> tên
  const { data: danhSachChucVu = initialDanhSachChucVu || [] } = useReferenceQuery({
    queryKey: ['chuc-vu-list'],
    queryFn: LichDangAPI.getDanhSachChucVu,
    initialData: initialDanhSachChucVu,
  })

  // Tạo map từ ID -> tên chức vụ
  const chucVuMap = useMemo(() => {
    const map = new Map<number, string>()
    danhSachChucVu.forEach((cv: any) => {
      if (cv.id && cv.ten_chuc_vu) {
        map.set(cv.id, cv.ten_chuc_vu)
      }
    })
    return map
  }, [danhSachChucVu])

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
        title="Không tìm thấy lịch đăng"
        message="Lịch đăng với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : lichDangConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  const lichDang = viewState.data
  if (!lichDang) {
    return null
  }

  // Format dates
  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-"
    try {
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: vi })
    } catch {
      return dateStr
    }
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-"
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: vi })
    } catch {
      return dateStr
    }
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { 
          label: "Ngày Đăng", 
          key: "ngay_dang", 
          value: formatDate(lichDang.ngay_dang)
        },
        { 
          label: "Giờ Đăng", 
          key: "gio_dang", 
          value: lichDang.gio_dang 
            ? (lichDang.gio_dang.length > 5 ? lichDang.gio_dang.substring(0, 5) : lichDang.gio_dang)
            : "-"
        },
        { 
          label: "Nhóm Câu Hỏi", 
          key: "nhom_cau_hoi_ten", 
          value: lichDang.nhom_cau_hoi_ten || "-"
        },
        { 
          label: "Câu Hỏi", 
          key: "cau_hoi", 
          value: lichDang.cau_hoi || "-",
          colSpan: 3
        },
        {
          label: "Hình Ảnh",
          key: "hinh_anh",
          value: lichDang.hinh_anh || null,
          format: (value) => {
            if (!value) return <span className="text-muted-foreground text-sm italic">Chưa có dữ liệu</span>
            return (
              <div className="relative w-full max-w-md h-64 rounded-lg border overflow-hidden bg-muted">
                <img
                  src={value as string}
                  alt="Câu hỏi"
                  className="w-full h-full object-contain"
                />
              </div>
            )
          },
          colSpan: 3
        },
      ]
    },
    {
      title: "Đáp Án",
      fields: [
        { label: "Đáp Án 1", key: "dap_an_1", value: lichDang.dap_an_1 || "-" },
        { label: "Đáp Án 2", key: "dap_an_2", value: lichDang.dap_an_2 || "-" },
        { label: "Đáp Án 3", key: "dap_an_3", value: lichDang.dap_an_3 || "-" },
        { label: "Đáp Án 4", key: "dap_an_4", value: lichDang.dap_an_4 || "-" },
        { 
          label: "Đáp Án Đúng", 
          key: "dap_an_dung", 
          value: lichDang.dap_an_dung 
            ? `Đáp án ${lichDang.dap_an_dung}`
            : "-",
          format: (value) => {
            if (!value || value === "-") return "-"
            return <Badge variant="secondary">{value}</Badge>
          }
        },
      ]
    },
    {
      title: "Áp Dụng",
      fields: [
        {
          label: "Chức Vụ Áp Dụng",
          key: "chuc_vu_ap_dung",
          value: (lichDang.chuc_vu_ap_dung || null) as any,
          format: (value: any) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
              return <Badge variant="outline">Tất cả chức vụ</Badge>
            }
            
            const MAX_DISPLAY = 3 // Số lượng chức vụ hiển thị tối đa
            const displayedItems = value.slice(0, MAX_DISPLAY)
            const remainingCount = value.length - MAX_DISPLAY
            
            return (
              <div className="flex flex-wrap items-center gap-2">
                {displayedItems.map((id: number, index: number) => {
                  const tenChucVu = chucVuMap.get(id) || `ID: ${id}`
                  return (
                    <Badge key={index} variant="secondary">
                      {tenChucVu}
                    </Badge>
                  )
                })}
                {remainingCount > 0 && (
                  <Badge variant="outline" className="font-medium">
                    + {remainingCount} chức vụ
                  </Badge>
                )}
              </div>
            )
          },
          colSpan: 3
        },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { label: "Thời Gian Tạo", key: "tg_tao", value: formatDateTime(lichDang.tg_tao) },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDateTime(lichDang.tg_cap_nhat) },
        { 
          label: "Người Tạo", 
          key: "nguoi_tao_id", 
          value: lichDang.nguoi_tao_id 
            ? `${lichDang.nguoi_tao_id}${lichDang.nguoi_tao_ten ? ` - ${lichDang.nguoi_tao_ten}` : ''}`
            : "-"
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
        onClick={() => setPreviewDialogOpen(true)}
      >
        <Eye className="mr-2 h-4 w-4" /> Preview
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={actionButtonClass()}
        onClick={() => {
          if (onEdit) {
            onEdit()
          } else {
            navigate(`${lichDangConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteLichDangButton id={id} name={lichDang.cau_hoi || "Lịch đăng"} />
    </div>
  )

  return (
    <>
      <GenericDetailViewSimple
        title={lichDang.cau_hoi || "Lịch đăng câu hỏi"}
        subtitle={lichDang.ngay_dang 
          ? `Ngày đăng: ${formatDate(lichDang.ngay_dang)}`
          : "Lịch đăng câu hỏi hàng ngày"
        }
        avatarUrl={lichDang.hinh_anh || null}
        sections={sections}
        backUrl={onBack ? undefined : lichDangConfig.routePath}
        onBack={onBack}
        actions={actions}
      />
      <PreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        data={lichDang}
      />
    </>
  )
}

