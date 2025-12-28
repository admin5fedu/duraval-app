"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { GenericDetailViewSimple, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { actionButtonClass } from "@/shared/utils/toolbar-styles"
import { useViecHangNgayById } from "../hooks"
import { DeleteViecHangNgayButton } from "./delete-viec-hang-ngay-button"
import { viecHangNgayConfig } from "../config"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"
import { DetailErrorState } from "@/shared/components/data-display/detail/detail-error-state"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ExternalLink } from "lucide-react"
import { CongViec } from "./chi-tiet-cong-viec-editor"
import { useNhanSu } from "@/features/he-thong/nhan-su/danh-sach-nhan-su/hooks/use-nhan-su"

interface ViecHangNgayDetailViewProps {
  id: number
  initialData?: any
  onEdit?: () => void
  onBack?: () => void
}

export function ViecHangNgayDetailView({ id, initialData, onEdit, onBack }: ViecHangNgayDetailViewProps) {
  const navigate = useNavigate()
  const query = useViecHangNgayById(id, initialData)
  const viewState = useDetailViewStateFromQuery(query, initialData)
  const { data: employees } = useNhanSu()

  // Get employee name for display
  const getEmployeeDisplay = React.useCallback((maNV: number) => {
    const employee = employees?.find(emp => emp.ma_nhan_vien === maNV)
    return employee ? `${employee.ma_nhan_vien} - ${employee.ho_ten}` : String(maNV)
  }, [employees])

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
        title="Không tìm thấy việc hàng ngày"
        message="Việc hàng ngày với ID này không tồn tại hoặc đã bị xóa."
        onBack={onBack}
        backUrl={onBack ? undefined : viecHangNgayConfig.routePath}
      />
    )
  }

  // ✅ TypeScript safety: viewState.data đã được đảm bảo tồn tại
  const viecHangNgay = viewState.data
  if (!viecHangNgay) {
    return null
  }

  // Format dates
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-"
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: vi })
    } catch {
      return dateStr
    }
  }

  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-"
    try {
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: vi })
    } catch {
      return dateStr
    }
  }

  // Format chi_tiet_cong_viec
  const renderChiTietCongViec = (): React.ReactNode => {
    const chiTiet = viecHangNgay.chi_tiet_cong_viec
    if (!chiTiet || (Array.isArray(chiTiet) && chiTiet.length === 0)) {
      return <span className="text-muted-foreground text-sm italic">Chưa có</span>
    }
    
    let items: CongViec[] = []
    if (Array.isArray(chiTiet)) {
      items = chiTiet.map((item: any, idx: number) => ({
        id: item.id || idx + 1,
        ke_hoach: item.ke_hoach || '',
        ket_qua: item.ket_qua || '',
        links: Array.isArray(item.links) ? item.links : []
      }))
    }
    
    // Filter items with data
    const itemsWithData = items.filter(item => {
      return !!(item.ke_hoach?.trim() || item.ket_qua?.trim() || (item.links && item.links.some(l => l.trim())))
    })
    
    if (itemsWithData.length === 0) {
      return <span className="text-muted-foreground text-sm italic">Chưa có</span>
    }
    
    return (
      <div className="border rounded-lg overflow-x-auto w-full">
        <Table className="w-full min-w-full">
          <TableBody>
            {itemsWithData.map((item, idx) => (
              <React.Fragment key={item.id || idx}>
                {/* Row 1: ID, Kế hoạch, Kết quả */}
                <TableRow>
                  <TableCell className="w-16 align-top pt-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      {item.id}
                    </span>
                  </TableCell>
                  <TableCell className="align-top pt-4 min-w-[300px]">
                    <div className="text-sm whitespace-pre-wrap break-words">{item.ke_hoach || <span className="text-muted-foreground italic">Chưa có kế hoạch</span>}</div>
                  </TableCell>
                  <TableCell className="align-top pt-4 min-w-[300px]">
                    <div className="text-sm whitespace-pre-wrap break-words">{item.ket_qua || <span className="text-muted-foreground italic">Chưa có kết quả</span>}</div>
                  </TableCell>
                </TableRow>
                
                {/* Row 2: Links */}
                {item.links && item.links.length > 0 && item.links.some(l => l.trim()) && (
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell colSpan={2} className="pt-0 pb-4">
                      <div className="space-y-1">
                        {item.links.filter(l => l.trim()).map((link, linkIdx) => {
                          const isValid = /^https?:\/\//.test(link)
                          return (
                            <div key={linkIdx} className="flex items-center gap-2">
                              {isValid ? (
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline flex items-center gap-1 truncate"
                                >
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{link.length > 50 ? link.substring(0, 50) + '...' : link}</span>
                                </a>
                              ) : (
                                <span className="text-sm text-muted-foreground truncate">{link}</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  const sections: DetailSection[] = [
    {
      title: "Thông Tin Cơ Bản",
      fields: [
        { label: "ID", key: "id", value: viecHangNgay.id, type: "number" },
        { 
          label: "Mã Nhân Viên", 
          key: "ma_nhan_vien", 
          value: getEmployeeDisplay(viecHangNgay.ma_nhan_vien),
          link: `/he-thong/danh-sach-nhan-su/${viecHangNgay.ma_nhan_vien}`
        },
        { label: "Ngày Báo Cáo", key: "ngay_bao_cao", value: formatDate(viecHangNgay.ngay_bao_cao), type: "date" },
        { label: "Mã Phòng", key: "ma_phong", value: viecHangNgay.ma_phong || "-" },
        { label: "Mã Nhóm", key: "ma_nhom", value: viecHangNgay.ma_nhom || "-" },
      ]
    },
    {
      title: "Chi Tiết Công Việc",
      fields: [
        { 
          label: "Danh Sách Công Việc", 
          key: "chi_tiet_cong_viec", 
          value: null,
          colSpan: 3,
          format: () => renderChiTietCongViec()
        },
      ]
    },
    {
      title: "Thông Tin Hệ Thống",
      fields: [
        { label: "Thời Gian Tạo", key: "tg_tao", value: formatDateTime(viecHangNgay.tg_tao) },
        { label: "Thời Gian Cập Nhật", key: "tg_cap_nhat", value: formatDateTime(viecHangNgay.tg_cap_nhat) },
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
            navigate(`${viecHangNgayConfig.routePath}/${id}/sua?returnTo=detail`)
          }
        }}
        data-action="edit"
      >
        <Edit className="mr-2 h-4 w-4" /> Sửa
      </Button>
      <DeleteViecHangNgayButton id={id} name={`#${id}`} />
    </div>
  )

  return (
    <GenericDetailViewSimple
      title={`Việc Hàng Ngày #${viecHangNgay.id}`}
      subtitle={`Nhân viên: ${getEmployeeDisplay(viecHangNgay.ma_nhan_vien)} - Ngày: ${formatDate(viecHangNgay.ngay_bao_cao)}`}
      sections={sections}
      backUrl={onBack ? undefined : viecHangNgayConfig.routePath}
      onBack={onBack}
      actions={actions}
      isLoading={query.isLoading && !initialData}
    />
  )
}

