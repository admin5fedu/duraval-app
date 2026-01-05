"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { XetDuyetCongNo } from "../schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"
import { xetDuyetCongNoConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { formatNumber } from "@/shared/utils/detail-utils"
import { DeleteXetDuyetCongNoButton } from "./delete-xet-duyet-cong-no-button"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Number cell component
function NumberCell({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) return <span>-</span>
  return <span>{formatNumber(value)}</span>
}

// Loại hình badge class
function getLoaiHinhBadgeClass(loaiHinh: string | null | undefined): string {
  if (!loaiHinh) return "bg-muted text-muted-foreground border-transparent"
  
  const normalized = loaiHinh.trim()
  if (normalized === "Nợ gối đầu") {
    return "bg-blue-50 text-blue-700 border-blue-200"
  }
  if (normalized === "TT cuối tháng") {
    return "bg-green-50 text-green-700 border-green-200"
  }
  if (normalized === "Nợ gối đơn") {
    return "bg-purple-50 text-purple-700 border-purple-200"
  }
  return "bg-muted text-muted-foreground border-transparent"
}

// Trạng thái badge class
function getTrangThaiBadgeClass(trangThai: string | null | undefined): string {
  if (!trangThai) return "bg-muted text-muted-foreground border-transparent"
  
  const normalized = trangThai.trim()
  if (normalized === "Chờ kiểm tra") {
    return "bg-yellow-50 text-yellow-700 border-yellow-200"
  }
  if (normalized === "Chờ duyệt") {
    return "bg-blue-50 text-blue-700 border-blue-200"
  }
  if (normalized === "Đã duyệt") {
    return "bg-green-50 text-green-700 border-green-200"
  }
  if (normalized === "Từ chối") {
    return "bg-red-50 text-red-700 border-red-200"
  }
  if (normalized === "Đã hủy") {
    return "bg-gray-100 text-gray-600 border-gray-300"
  }
  if (normalized === "Yêu cầu bổ sung") {
    return "bg-orange-50 text-orange-700 border-orange-200"
  }
  return "bg-muted text-muted-foreground border-transparent"
}

// Actions cell component
function ActionsCell({ id }: { id: number }) {
  const navigate = useNavigate()
  
  return (
    <div className="flex items-center gap-2 justify-end pr-4 min-w-[100px]">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:text-blue-600 shrink-0"
        onClick={(e) => {
          e.stopPropagation()
          navigate(`${xetDuyetCongNoConfig.routePath}/${id}/sua?returnTo=list`)
        }}
      >
        <span className="sr-only">Edit</span>
        <Edit className="h-4 w-4" />
      </Button>
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <DeleteXetDuyetCongNoButton id={id} iconOnly />
      </div>
    </div>
  )
}

export const xetDuyetCongNoColumns = (): ColumnDef<XetDuyetCongNo>[] => [
  createSelectColumn<XetDuyetCongNo>(),
  {
    accessorKey: "nguoi_tao_id",
    header: () => null,
    cell: () => null,
    enableHiding: true,
    filterFn: (row, id, value) => {
      if (!value) return true
      const rowValue = row.getValue(id) as number | null | undefined
      return rowValue === value
    },
    meta: {
      title: "Người Tạo ID",
    },
  },
  {
    accessorKey: "ten_khach_buon",
    header: ({ column }) => <SortableHeader column={column} title="Khách Buôn" />,
    cell: ({ row }) => {
      const tenKhachBuon = row.getValue("ten_khach_buon") as string | null | undefined
      return (
        <div className="min-w-[200px]">
          {tenKhachBuon || "-"}
        </div>
      )
    },
    size: 250,
    minSize: 200,
    meta: {
      title: "Khách Buôn",
      order: 1,
      minWidth: 200,
      stickyLeft: true,
    },
  },
  {
    accessorKey: "loai_hinh",
    header: ({ column }) => <SortableHeader column={column} title="Loại Hình" />,
    cell: ({ row }) => {
      const loaiHinh = row.getValue("loai_hinh") as string | null | undefined
      const badgeClass = getLoaiHinhBadgeClass(loaiHinh)
      return (
        <div className="min-w-[150px]">
          {loaiHinh ? (
            <Badge variant="outline" className={badgeClass}>
              {loaiHinh}
            </Badge>
          ) : (
            <span>-</span>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 200,
    minSize: 150,
    meta: {
      title: "Loại Hình",
      order: 2,
      minWidth: 150,
    },
  },
  {
    accessorKey: "muc_cong_no",
    header: ({ column }) => <SortableHeader column={column} title="Mức Công Nợ" />,
    cell: ({ row }) => {
      const value = row.getValue("muc_cong_no") as number | null | undefined
      return (
        <div className="min-w-[120px] text-right">
          <NumberCell value={value} />
        </div>
      )
    },
    size: 150,
    minSize: 120,
    meta: {
      title: "Mức Công Nợ",
      order: 3,
      minWidth: 120,
    },
  },
  {
    accessorKey: "tg_tao",
    header: ({ column }) => <SortableHeader column={column} title="Thời Gian Tạo" />,
    cell: ({ row }) => {
      const date = row.getValue("tg_tao") as string | null | undefined
      return (
        <div className="min-w-[120px]">
          {date ? format(new Date(date), "dd/MM/yyyy HH:mm", { locale: vi }) : "-"}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      if (!value || (!value.from && !value.to)) return true
      const rowDate = new Date(row.getValue(id) as string)
      if (value.from && rowDate < value.from) return false
      if (value.to) {
        const toDate = new Date(value.to)
        toDate.setHours(23, 59, 59, 999)
        if (rowDate > toDate) return false
      }
      return true
    },
    size: 180,
    minSize: 120,
    meta: {
      title: "Thời Gian Tạo",
      order: 4,
      minWidth: 120,
    },
  },
  {
    accessorKey: "de_xuat_ngay_ap_dung",
    header: ({ column }) => <SortableHeader column={column} title="Đề Xuất Ngày Áp Dụng" />,
    cell: ({ row }) => {
      const date = row.getValue("de_xuat_ngay_ap_dung") as string | null | undefined
      return (
        <div className="min-w-[120px]">
          {date || "-"}
        </div>
      )
    },
    size: 180,
    minSize: 120,
    meta: {
      title: "Đề Xuất Ngày Áp Dụng",
      order: 5,
      minWidth: 120,
    },
  },
  {
    accessorKey: "ngay_ap_dung",
    header: ({ column }) => <SortableHeader column={column} title="Ngày Áp Dụng" />,
    cell: ({ row }) => {
      const date = row.getValue("ngay_ap_dung") as string | null | undefined
      return (
        <div className="min-w-[120px]">
          {date || "-"}
        </div>
      )
    },
    size: 150,
    minSize: 120,
    meta: {
      title: "Ngày Áp Dụng",
      order: 6,
      minWidth: 120,
    },
  },
  {
    accessorKey: "trang_thai",
    header: ({ column }) => <SortableHeader column={column} title="Trạng Thái" />,
    cell: ({ row }) => {
      const trangThai = row.getValue("trang_thai") as string | null | undefined
      const badgeClass = getTrangThaiBadgeClass(trangThai)
      return (
        <div className="min-w-[120px]">
          {trangThai ? (
            <Badge variant="outline" className={badgeClass}>
              {trangThai}
            </Badge>
          ) : (
            <span>-</span>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 150,
    minSize: 120,
      meta: {
      title: "Trạng Thái",
      order: 7,
      minWidth: 120,
    },
  },
  {
    accessorKey: "quan_ly_id",
    header: ({ column }) => <SortableHeader column={column} title="Quản Lý ID" />,
    cell: ({ row }) => {
      const quanLyId = row.getValue("quan_ly_id") as number | null | undefined
      return (
        <div className="min-w-[100px]">
          {quanLyId || "-"}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      if (!value) return true
      const rowValue = row.getValue(id) as number | null | undefined
      return rowValue === value
    },
    size: 120,
    minSize: 100,
    meta: {
      title: "Quản Lý ID",
      order: 8,
      minWidth: 100,
    },
  },
  {
    accessorKey: "quan_ly_duyet",
    header: ({ column }) => <SortableHeader column={column} title="Quản Lý Duyệt" />,
    cell: ({ row }) => {
      const quanLyDuyet = row.getValue("quan_ly_duyet") as string | null | undefined
      return (
        <div className="min-w-[120px]">
          {quanLyDuyet || "-"}
        </div>
      )
    },
    size: 150,
    minSize: 120,
    meta: {
      title: "Quản Lý Duyệt",
      order: 9,
      minWidth: 120,
    },
  },
  {
    accessorKey: "bgd_id",
    header: ({ column }) => <SortableHeader column={column} title="BGD ID" />,
    cell: ({ row }) => {
      const bgdId = row.getValue("bgd_id") as number | null | undefined
      return (
        <div className="min-w-[100px]">
          {bgdId || "-"}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      if (!value) return true
      const rowValue = row.getValue(id) as number | null | undefined
      return rowValue === value
    },
    size: 120,
    minSize: 100,
    meta: {
      title: "BGD ID",
      order: 10,
      minWidth: 100,
    },
  },
  {
    accessorKey: "bgd_duyet",
    header: ({ column }) => <SortableHeader column={column} title="BGD Duyệt" />,
    cell: ({ row }) => {
      const bgdDuyet = row.getValue("bgd_duyet") as string | null | undefined
      return (
        <div className="min-w-[120px]">
          {bgdDuyet || "-"}
        </div>
      )
    },
    size: 150,
    minSize: 120,
    meta: {
      title: "BGD Duyệt",
      order: 11,
      minWidth: 120,
    },
  },
  {
    accessorKey: "ghi_chu",
    header: ({ column }) => <SortableHeader column={column} title="Ghi Chú" />,
    cell: ({ row }) => {
      const ghiChu = row.getValue("ghi_chu") as string | null | undefined
      return (
        <div className="min-w-[200px]">
          {ghiChu || "-"}
        </div>
      )
    },
    size: 250,
    minSize: 200,
    meta: {
      title: "Ghi Chú",
      order: 12,
      minWidth: 200,
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Thao tác</div>,
    cell: ({ row }) => {
      const xetDuyetCongNo = row.original
      return <ActionsCell id={xetDuyetCongNo.id!} />
    },
    size: 100,
    minSize: 100,
    enableSorting: false,
    enableHiding: false,
    meta: {
      title: "Thao tác",
      order: 999,
      stickyRight: true,
      minWidth: 100,
    },
  },
]

