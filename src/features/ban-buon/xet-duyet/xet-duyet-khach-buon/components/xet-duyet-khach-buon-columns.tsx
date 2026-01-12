"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { XetDuyetKhachBuon } from "../schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"
import { xetDuyetKhachBuonConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { formatNumber } from "@/shared/utils/detail-utils"
import { DeleteXetDuyetKhachBuonButton } from "./delete-xet-duyet-khach-buon-button"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Number cell component
function NumberCell({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) return <span>-</span>
  return <span>{formatNumber(value)}</span>
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
          navigate(`${xetDuyetKhachBuonConfig.routePath}/${id}/sua?returnTo=list`)
        }}
      >
        <span className="sr-only">Edit</span>
        <Edit className="h-4 w-4" />
      </Button>
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <DeleteXetDuyetKhachBuonButton id={id} iconOnly />
      </div>
    </div>
  )
}

export const xetDuyetKhachBuonColumns = (): ColumnDef<XetDuyetKhachBuon>[] => [
  createSelectColumn<XetDuyetKhachBuon>(),
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
    accessorKey: "ten_muc_dang_ky",
    header: ({ column }) => <SortableHeader column={column} title="Mức Đăng Ký" />,
    cell: ({ row }) => {
      const tenMucDangKy = row.getValue("ten_muc_dang_ky") as string | null | undefined
      return (
        <div className="min-w-[150px]">
          {tenMucDangKy || "-"}
        </div>
      )
    },
    size: 200,
    minSize: 150,
    meta: {
      title: "Mức Đăng Ký",
      order: 2,
      minWidth: 150,
    },
  },
  {
    accessorKey: "doanh_so_min_quy",
    header: ({ column }) => <SortableHeader column={column} title="DS Min Quý" />,
    cell: ({ row }) => {
      const value = row.getValue("doanh_so_min_quy") as number | null | undefined
      return (
        <div className="min-w-[120px] text-right">
          <NumberCell value={value} />
        </div>
      )
    },
    size: 150,
    minSize: 120,
    meta: {
      title: "Doanh Số Min Quý",
      order: 3,
      minWidth: 120,
    },
  },
  {
    accessorKey: "doanh_so_max_quy",
    header: ({ column }) => <SortableHeader column={column} title="DS Max Quý" />,
    cell: ({ row }) => {
      const value = row.getValue("doanh_so_max_quy") as number | null | undefined
      return (
        <div className="min-w-[120px] text-right">
          <NumberCell value={value} />
        </div>
      )
    },
    size: 150,
    minSize: 120,
    meta: {
      title: "Doanh Số Max Quý",
      order: 4,
      minWidth: 120,
    },
  },
  {
    accessorKey: "doanh_so_min_nam",
    header: ({ column }) => <SortableHeader column={column} title="DS Min Năm" />,
    cell: ({ row }) => {
      const value = row.getValue("doanh_so_min_nam") as number | null | undefined
      return (
        <div className="min-w-[120px] text-right">
          <NumberCell value={value} />
        </div>
      )
    },
    size: 150,
    minSize: 120,
    meta: {
      title: "Doanh Số Min Năm",
      order: 5,
      minWidth: 120,
    },
  },
  {
    accessorKey: "doanh_so_max_nam",
    header: ({ column }) => <SortableHeader column={column} title="DS Max Năm" />,
    cell: ({ row }) => {
      const value = row.getValue("doanh_so_max_nam") as number | null | undefined
      return (
        <div className="min-w-[120px] text-right">
          <NumberCell value={value} />
        </div>
      )
    },
    size: 150,
    minSize: 120,
    meta: {
      title: "Doanh Số Max Năm",
      order: 6,
      minWidth: 120,
    },
  },
  {
    accessorKey: "ngay",
    header: ({ column }) => <SortableHeader column={column} title="Ngày" />,
    cell: ({ row }) => {
      const date = row.getValue("ngay") as string | null | undefined
      return (
        <div className="min-w-[120px]">
          {date || "-"}
        </div>
      )
    },
    size: 150,
    minSize: 120,
    meta: {
      title: "Ngày",
      order: 7,
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
      order: 8,
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
      order: 9,
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
      order: 10,
      minWidth: 120,
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Thao tác</div>,
    cell: ({ row }) => {
      const xetDuyetKhachBuon = row.original
      return <ActionsCell id={xetDuyetKhachBuon.id!} />
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

