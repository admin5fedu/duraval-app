/**
 * Xét Duyệt Công Nợ Section Component
 * 
 * Component hiển thị danh sách xét duyệt công nợ trong detail view khách buôn.
 * Sử dụng EmbeddedListSection để chuẩn hóa theo quy tắc ERP.
 */

"use client"

import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { EmbeddedListSection, type EmbeddedListColumn, EmbeddedListFullViewDialog, GenericDetailDialog, type DetailSection } from "@/shared/components"
import { Button } from "@/components/ui/button"
import { FileCheck } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { formatNumber } from "@/shared/utils/detail-utils"
import type { XetDuyetCongNo } from "@/features/ban-buon/xet-duyet/xet-duyet-cong-no/schema"
import { xetDuyetCongNoConfig } from "@/features/ban-buon/xet-duyet/xet-duyet-cong-no/config"
import { useXetDuyetCongNoById } from "@/features/ban-buon/xet-duyet/xet-duyet-cong-no/hooks/use-xet-duyet-cong-no"
import { useDetailViewStateFromQuery } from "@/hooks/use-detail-view-state"


interface XetDuyetCongNoSectionProps {
  khachBuonId: number
  xetDuyetCongNoList: XetDuyetCongNo[]
  isLoading?: boolean
  khachBuonName?: string
}

export function XetDuyetCongNoSection({
  khachBuonId,
  xetDuyetCongNoList,
  isLoading = false,
  khachBuonName,
}: XetDuyetCongNoSectionProps) {
  const navigate = useNavigate()
  
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [expandDialogOpen, setExpandDialogOpen] = useState(false)
  const [selectedXetDuyetCongNo, setSelectedXetDuyetCongNo] = useState<XetDuyetCongNo | null>(null)

  // Query for selected xét duyệt công nợ detail
  const xetDuyetCongNoQuery = useXetDuyetCongNoById(selectedXetDuyetCongNo?.id || 0, selectedXetDuyetCongNo || undefined)
  const viewState = useDetailViewStateFromQuery(xetDuyetCongNoQuery, selectedXetDuyetCongNo || undefined)

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-"
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi })
    } catch {
      return "-"
    }
  }

  const getTrangThaiBadgeClass = (trangThai: string | null | undefined) => {
    const colorMap: Record<string, string> = {
      "Chờ kiểm tra": "bg-yellow-50 text-yellow-700 border-yellow-200",
      "Chờ duyệt": "bg-blue-50 text-blue-700 border-blue-200",
      "Đã duyệt": "bg-green-50 text-green-700 border-green-200",
      "Từ chối": "bg-red-50 text-red-700 border-red-200",
      "Đã hủy": "bg-gray-100 text-gray-600 border-gray-200",
      "Yêu cầu bổ sung": "bg-orange-50 text-orange-700 border-orange-200",
    }
    return colorMap[trangThai || ""] || "bg-gray-100 text-gray-600 border-gray-200"
  }

  const getLoaiHinhBadgeClass = (loaiHinh: string | null | undefined) => {
    const colorMap: Record<string, string> = {
      "Nợ gối đầu": "bg-blue-50 text-blue-700 border-blue-200",
      "TT cuối tháng": "bg-green-50 text-green-700 border-green-200",
      "Nợ gối đơn": "bg-purple-50 text-purple-700 border-purple-200",
    }
    return colorMap[loaiHinh || ""] || "bg-gray-100 text-gray-600 border-gray-200"
  }

  // Click dòng -> Mở popup detail
  const handleRowClick = (xetDuyetCongNo: XetDuyetCongNo) => {
    setSelectedXetDuyetCongNo(xetDuyetCongNo)
    setDetailDialogOpen(true)
  }

  // Click icon mắt -> Redirect đến page detail
  const handleEyeClick = (xetDuyetCongNo: XetDuyetCongNo) => {
    if (!xetDuyetCongNo.id) return
    navigate(`${xetDuyetCongNoConfig.routePath}/${xetDuyetCongNo.id}`)
  }

  // Handle add new
  const handleAdd = () => {
    navigate(`${xetDuyetCongNoConfig.routePath}/moi?khach_buon_id=${khachBuonId}`)
  }

  // Columns definition
  const columns: EmbeddedListColumn<XetDuyetCongNo>[] = useMemo(() => [
    {
      key: "loai_hinh",
      header: "Loại Hình",
      render: (item) => (
        <Badge variant="outline" className={getLoaiHinhBadgeClass(item.loai_hinh)}>
          {item.loai_hinh || "-"}
        </Badge>
      ),
    },
    {
      key: "muc_cong_no",
      header: "Mức Công Nợ",
      render: (item) => item.muc_cong_no !== null && item.muc_cong_no !== undefined 
        ? formatNumber(item.muc_cong_no) 
        : "-",
    },
    {
      key: "de_xuat_ngay_ap_dung",
      header: "Đề Xuất Ngày",
      render: (item) => formatDate(item.de_xuat_ngay_ap_dung),
    },
    {
      key: "trang_thai",
      header: "Trạng Thái",
      render: (item) => (
        <Badge variant="outline" className={getTrangThaiBadgeClass(item.trang_thai)}>
          {item.trang_thai || "-"}
        </Badge>
      ),
    },
    {
      key: "tg_tao",
      header: "Thời Gian Tạo",
      render: (item) => item.tg_tao 
        ? format(new Date(item.tg_tao), "dd/MM/yyyy HH:mm", { locale: vi })
        : "-",
    },
  ], [])

  // Detail sections for dialog
  const detailSections: DetailSection[] = useMemo(() => {
    if (!selectedXetDuyetCongNo) return []
    
    return [
      {
        title: "Thông Tin Cơ Bản",
        fields: [
          { key: "ten_khach_buon", label: "Khách Buôn", value: selectedXetDuyetCongNo.ten_khach_buon || "-" },
          { key: "loai_hinh", label: "Loại Hình", value: selectedXetDuyetCongNo.loai_hinh || "-" },
          { 
            key: "muc_cong_no", 
            label: "Mức Công Nợ", 
            value: selectedXetDuyetCongNo.muc_cong_no !== null && selectedXetDuyetCongNo.muc_cong_no !== undefined
              ? formatNumber(selectedXetDuyetCongNo.muc_cong_no)
              : "-"
          },
          { key: "de_xuat_ngay_ap_dung", label: "Đề Xuất Ngày Áp Dụng", value: formatDate(selectedXetDuyetCongNo.de_xuat_ngay_ap_dung) },
          { key: "trang_thai", label: "Trạng Thái", value: selectedXetDuyetCongNo.trang_thai || "-" },
          { key: "ghi_chu", label: "Ghi Chú", value: selectedXetDuyetCongNo.ghi_chu || "-", colSpan: 2 },
        ]
      },
      {
        title: "Thông Tin Duyệt",
        fields: [
          { key: "quan_ly_duyet", label: "Quản Lý Duyệt", value: selectedXetDuyetCongNo.quan_ly_duyet || "-" },
          { key: "ten_quan_ly", label: "Quản Lý", value: selectedXetDuyetCongNo.ten_quan_ly || "-" },
          { key: "tg_quan_ly_duyet", label: "TG Quản Lý Duyệt", value: formatDate(selectedXetDuyetCongNo.tg_quan_ly_duyet) },
          { key: "bgd_duyet", label: "BGD Duyệt", value: selectedXetDuyetCongNo.bgd_duyet || "-" },
          { key: "ten_bgd", label: "BGD", value: selectedXetDuyetCongNo.ten_bgd || "-" },
          { key: "tg_bgd_duyet", label: "TG BGD Duyệt", value: formatDate(selectedXetDuyetCongNo.tg_bgd_duyet) },
        ]
      },
    ]
  }, [selectedXetDuyetCongNo])

  return (
    <>
      <div className="space-y-3 sm:space-y-4 print:space-y-2 print:break-inside-avoid scroll-mt-28">
        <div className="flex items-center justify-between gap-2 sm:gap-2.5 px-1">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 rounded-md bg-primary/10 print:bg-transparent print:border print:border-primary">
              <FileCheck className="h-4 w-4 text-primary shrink-0" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold tracking-tight text-primary">
              Xét Duyệt Công Nợ
            </h3>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            {xetDuyetCongNoList.length > 0 && (
              <Button
                onClick={() => setExpandDialogOpen(true)}
                size="sm"
                variant="outline"
              >
                Xem tất cả
              </Button>
            )}
            <Button onClick={handleAdd} size="sm">
              Thêm Yêu Cầu
            </Button>
          </div>
        </div>
        <EmbeddedListSection
          title=""
          data={xetDuyetCongNoList}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Chưa có yêu cầu xét duyệt công nợ nào"
          onRowClick={handleRowClick}
          onView={handleEyeClick}
          enableExpandView={false}
        />
      </div>

      {/* Detail Dialog */}
      <GenericDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        title={`Xét Duyệt Công Nợ #${selectedXetDuyetCongNo?.id || ""}`}
        subtitle={selectedXetDuyetCongNo?.ten_khach_buon || ""}
        sections={detailSections}
        isLoading={viewState.isLoading}
        actions={
          selectedXetDuyetCongNo?.id ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigate(`${xetDuyetCongNoConfig.routePath}/${selectedXetDuyetCongNo.id}`)
                setDetailDialogOpen(false)
              }}
            >
              Xem chi tiết đầy đủ
            </Button>
          ) : undefined
        }
      />

      {/* Expand Dialog */}
      <EmbeddedListFullViewDialog
        open={expandDialogOpen}
        onOpenChange={setExpandDialogOpen}
        title={khachBuonName ? `Xét Duyệt Công Nợ - ${khachBuonName}` : "Xét Duyệt Công Nợ"}
        data={xetDuyetCongNoList}
        columns={columns}
        onRowClick={handleRowClick}
        onView={handleEyeClick}
      />
    </>
  )
}

