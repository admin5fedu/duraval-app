"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { QuyHTBHTheoThang } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteQuyHTBHTheoThangButton } from "./delete-quy-htbh-theo-thang-button"
import { quyHTBHTheoThangConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Format số tiền
function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value)
}

// ID cell component with navigation
function IdCell({ id }: { id: number }) {
  const navigate = useNavigate()
  
  return (
    <button
      onClick={() => navigate(`${quyHTBHTheoThangConfig.routePath}/${id}`)}
      className="font-medium hover:underline text-left"
    >
      {id}
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
          navigate(`${quyHTBHTheoThangConfig.routePath}/${id}/sua`)
        }}
      >
        <span className="sr-only">Sửa</span>
        <Edit className="h-4 w-4" />
      </Button>
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <DeleteQuyHTBHTheoThangButton id={id} iconOnly />
      </div>
    </div>
  )
}

export const quyHTBHTheoThangColumns: ColumnDef<QuyHTBHTheoThang>[] = [
  // ⚡ Professional: Use generic select column utility
  createSelectColumn<QuyHTBHTheoThang>(),
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} title="ID" />,
    cell: ({ row }) => {
      const id = row.getValue("id") as number
      return (
        <IdCell id={id} />
      )
    },
    size: 80,
    minSize: 70,
    meta: {
      title: "ID",
      order: 1,
      stickyLeft: true,
      stickyLeftOffset: 40,
      minWidth: 70,
    },
  },
  {
    accessorKey: "nam",
    header: ({ column }) => <SortableHeader column={column} title="Năm" />,
    cell: ({ row }) => {
      const nam = row.getValue("nam") as number | null
      return <div className="min-w-[60px]">{nam ?? "-"}</div>
    },
    size: 80,
    meta: {
      title: "Năm",
      order: 2,
    },
  },
  {
    accessorKey: "thang",
    header: ({ column }) => <SortableHeader column={column} title="Tháng" />,
    cell: ({ row }) => {
      const thang = row.getValue("thang") as number | null
      return <div className="min-w-[60px]">{thang ?? "-"}</div>
    },
    size: 80,
    meta: {
      title: "Tháng",
      order: 3,
    },
  },
  {
    accessorKey: "nhan_vien_id",
    header: ({ column }) => <SortableHeader column={column} title="ID Nhân viên" />,
    cell: ({ row }) => {
      const nhanVienId = row.getValue("nhan_vien_id") as number | null
      return <div className="min-w-[100px]">{nhanVienId ?? "-"}</div>
    },
    size: 120,
    meta: {
      title: "ID Nhân viên",
      order: 4,
    },
  },
  {
    accessorKey: "ten_nhan_vien",
    header: ({ column }) => <SortableHeader column={column} title="Nhân viên" />,
    cell: ({ row }) => {
      const tenNhanVien = row.getValue("ten_nhan_vien") as string | null
      return <div className="min-w-[150px]">{tenNhanVien ?? "-"}</div>
    },
    size: 200,
    meta: {
      title: "Nhân viên",
      order: 5,
    },
  },
  {
    accessorKey: "ma_phong",
    header: ({ column }) => <SortableHeader column={column} title="Mã phòng" />,
    cell: ({ row }) => {
      const maPhong = row.getValue("ma_phong") as string | null
      return <div className="min-w-[100px]">{maPhong ?? "-"}</div>
    },
    size: 120,
    meta: {
      title: "Mã phòng",
      order: 6,
    },
  },
  {
    accessorKey: "ma_nhom",
    header: ({ column }) => <SortableHeader column={column} title="Mã nhóm" />,
    cell: ({ row }) => {
      const maNhom = row.getValue("ma_nhom") as string | null
      return <div className="min-w-[100px]">{maNhom ?? "-"}</div>
    },
    size: 120,
    meta: {
      title: "Mã nhóm",
      order: 7,
    },
  },
  {
    accessorKey: "quy",
    header: ({ column }) => <SortableHeader column={column} title="Quỹ" />,
    cell: ({ row }) => {
      const quy = row.getValue("quy") as string | null
      return <div className="min-w-[120px]">{quy ?? "-"}</div>
    },
    size: 150,
    meta: {
      title: "Quỹ",
      order: 8,
    },
  },
  {
    accessorKey: "so_tien_quy",
    header: ({ column }) => <SortableHeader column={column} title="Số tiền quỹ" />,
    cell: ({ row }) => {
      const soTienQuy = row.getValue("so_tien_quy") as number | null
      return <div className="min-w-[120px] text-right">{formatCurrency(soTienQuy)}</div>
    },
    size: 150,
    meta: {
      title: "Số tiền quỹ",
      order: 9,
    },
  },
  {
    accessorKey: "da_dung",
    header: ({ column }) => <SortableHeader column={column} title="Đã dùng" />,
    cell: ({ row }) => {
      const daDung = row.getValue("da_dung") as number | null
      return <div className="min-w-[120px] text-right">{formatCurrency(daDung)}</div>
    },
    size: 150,
    meta: {
      title: "Đã dùng",
      order: 10,
    },
  },
  {
    accessorKey: "con_du",
    header: ({ column }) => <SortableHeader column={column} title="Còn dư" />,
    cell: ({ row }) => {
      const conDu = row.getValue("con_du") as number | null
      return <div className="min-w-[120px] text-right font-medium">{formatCurrency(conDu)}</div>
    },
    size: 150,
    meta: {
      title: "Còn dư",
      order: 11,
    },
  },
  {
    accessorKey: "tg_tao",
    header: ({ column }) => <SortableHeader column={column} title="Ngày tạo" />,
    cell: ({ row }) => {
      const tgTao = row.getValue("tg_tao") as string | null
      if (!tgTao) return <div className="min-w-[120px]">-</div>
      try {
        return (
          <div className="min-w-[120px]">
            {format(new Date(tgTao), "dd/MM/yyyy HH:mm", { locale: vi })}
          </div>
        )
      } catch {
        return <div className="min-w-[120px]">{tgTao}</div>
      }
    },
    size: 150,
    meta: {
      title: "Ngày tạo",
      order: 12,
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Thao tác</div>,
    cell: ({ row }) => <ActionsCell id={row.original.id} />,
    size: 100,
    enableSorting: false,
    enableHiding: false,
    meta: {
      title: "Thao tác",
      order: 999,
      stickyRight: true,
    },
  },
]

