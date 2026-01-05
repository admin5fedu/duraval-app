"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { KeHoachThiTruong } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { keHoachThiTruongConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { DeleteKeHoachThiTruongButton } from "./delete-ke-hoach-thi-truong-button"
import { Badge } from "@/components/ui/badge"
import { getEnumBadgeClass, registerEnumColors } from "@/shared/utils/enum-color-registry"

// Date cell component with navigation
function DateCell({ ngay, id }: { ngay: string | null | undefined; id: number }) {
  const navigate = useNavigate()
  
  return (
    <button
      onClick={() => navigate(`${keHoachThiTruongConfig.routePath}/${id}`)}
      className="font-medium hover:underline truncate text-left w-full min-w-[120px]"
    >
      {ngay ? format(new Date(ngay), "dd/MM/yyyy", { locale: vi }) : "-"}
    </button>
  )
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
          navigate(`${keHoachThiTruongConfig.routePath}/${id}/sua?returnTo=list`)
        }}
      >
        <span className="sr-only">Edit</span>
        <Edit className="h-4 w-4" />
      </Button>
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <DeleteKeHoachThiTruongButton id={id} iconOnly />
      </div>
    </div>
  )
}

// Register enum colors for badge formatting
registerEnumColors("buoi", {
  "Sáng": "bg-blue-50 text-blue-700 border-blue-200",
  "Chiều": "bg-orange-50 text-orange-700 border-orange-200",
})

registerEnumColors("hanh_dong", {
  "Đi thị trường": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Làm văn phòng": "bg-purple-50 text-purple-700 border-purple-200",
})

registerEnumColors("trang_thai", {
  "Chưa thực hiện": "bg-slate-50 text-slate-700 border-slate-200",
  "Đã thực hiện": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Hủy": "bg-red-50 text-red-700 border-red-200",
})

export const keHoachThiTruongColumns = (): ColumnDef<KeHoachThiTruong>[] => [
  createSelectColumn<KeHoachThiTruong>(),
  {
    accessorKey: "ngay",
    header: ({ column }) => <SortableHeader column={column} title="Ngày" />,
    cell: ({ row }) => {
      const ngay = row.getValue("ngay") as string | null | undefined
      const keHoachThiTruong = row.original
      return (
        <DateCell 
          ngay={ngay} 
          id={keHoachThiTruong.id!} 
        />
      )
    },
    size: 120,
    minSize: 120,
    meta: {
      title: "Ngày",
      order: 1,
      stickyLeft: true,
      stickyLeftOffset: 40,
      minWidth: 120,
    },
  },
  {
    accessorKey: "ten_nhan_vien",
    header: ({ column }) => <SortableHeader column={column} title="Nhân Viên" />,
    cell: ({ row }) => {
      const tenNhanVien = row.getValue("ten_nhan_vien") as string | null | undefined
      return (
        <div className="min-w-[150px]">
          {tenNhanVien || "-"}
        </div>
      )
    },
    size: 180,
    minSize: 150,
    meta: {
      title: "Nhân Viên",
      order: 1.5,
      minWidth: 150,
    },
  },
  {
    accessorKey: "buoi",
    header: ({ column }) => <SortableHeader column={column} title="Buổi" />,
    cell: ({ row }) => {
      const buoi = row.getValue("buoi") as string | null | undefined
      if (!buoi) return <div className="min-w-[100px]">-</div>
      const badgeClass = getEnumBadgeClass("buoi", buoi)
      return (
        <div className="min-w-[100px]">
          <Badge variant="outline" className={badgeClass}>
            {buoi}
          </Badge>
        </div>
      )
    },
    size: 120,
    minSize: 100,
    meta: {
      title: "Buổi",
      order: 2,
      minWidth: 100,
    },
  },
  {
    accessorKey: "hanh_dong",
    header: ({ column }) => <SortableHeader column={column} title="Hành Động" />,
    cell: ({ row }) => {
      const hanhDong = row.getValue("hanh_dong") as string | null | undefined
      if (!hanhDong) return <div className="min-w-[200px]">-</div>
      const badgeClass = getEnumBadgeClass("hanh_dong", hanhDong)
      return (
        <div className="min-w-[200px]">
          <Badge variant="outline" className={badgeClass}>
            {hanhDong}
          </Badge>
        </div>
      )
    },
    size: 250,
    minSize: 200,
    meta: {
      title: "Hành Động",
      order: 3,
      minWidth: 200,
    },
  },
  {
    accessorKey: "ten_khach_buon",
    header: ({ column }) => <SortableHeader column={column} title="Khách Buôn" />,
    cell: ({ row }) => {
      const tenKhachBuon = row.getValue("ten_khach_buon") as string | null | undefined
      return (
        <div className="min-w-[150px]">
          {tenKhachBuon || "-"}
        </div>
      )
    },
    size: 200,
    minSize: 150,
    meta: {
      title: "Khách Buôn",
      order: 3.5,
      minWidth: 150,
    },
  },
  {
    accessorKey: "ten_tinh_thanh",
    header: ({ column }) => <SortableHeader column={column} title="Tỉnh Thành" />,
    cell: ({ row }) => {
      const tenTinhThanh = row.getValue("ten_tinh_thanh") as string | null | undefined
      return (
        <div className="min-w-[120px]">
          {tenTinhThanh || "-"}
        </div>
      )
    },
    size: 150,
    minSize: 120,
    meta: {
      title: "Tỉnh Thành",
      order: 3.7,
      minWidth: 120,
    },
  },
  {
    accessorKey: "muc_tieu",
    header: ({ column }) => <SortableHeader column={column} title="Mục Tiêu" />,
    cell: ({ row }) => {
      const mucTieu = row.getValue("muc_tieu") as string | null | undefined
      return (
        <div className="min-w-[200px]">
          {mucTieu || "-"}
        </div>
      )
    },
    size: 250,
    minSize: 200,
    meta: {
      title: "Mục Tiêu",
      order: 4,
      minWidth: 200,
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
      order: 5,
      minWidth: 200,
    },
  },
  {
    accessorKey: "trang_thai",
    header: ({ column }) => <SortableHeader column={column} title="Trạng Thái" />,
    cell: ({ row }) => {
      const trangThai = row.getValue("trang_thai") as string | null | undefined
      if (!trangThai) return <div className="min-w-[120px]">-</div>
      const badgeClass = getEnumBadgeClass("trang_thai", trangThai)
      return (
        <div className="min-w-[120px]">
          <Badge variant="outline" className={badgeClass}>
            {trangThai}
          </Badge>
        </div>
      )
    },
    size: 150,
    minSize: 120,
    meta: {
      title: "Trạng Thái",
      order: 6,
      minWidth: 120,
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Thao tác</div>,
    cell: ({ row }) => {
      const keHoachThiTruong = row.original
      return <ActionsCell id={keHoachThiTruong.id!} />
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

