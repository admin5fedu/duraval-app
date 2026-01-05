"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { ChamSocKhachBuon } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { chamSocKhachBuonConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { DeleteChamSocKhachBuonButton } from "./delete-cham-soc-khach-buon-button"

// Date cell component with navigation
function DateCell({ ngay, id }: { ngay: string | null | undefined; id: number }) {
  const navigate = useNavigate()
  
  return (
    <button
      onClick={() => navigate(`${chamSocKhachBuonConfig.routePath}/${id}`)}
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
          navigate(`${chamSocKhachBuonConfig.routePath}/${id}/sua?returnTo=list`)
        }}
      >
        <span className="sr-only">Edit</span>
        <Edit className="h-4 w-4" />
      </Button>
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <DeleteChamSocKhachBuonButton id={id} iconOnly />
      </div>
    </div>
  )
}

export const chamSocKhachBuonColumns = (): ColumnDef<ChamSocKhachBuon>[] => [
  createSelectColumn<ChamSocKhachBuon>(),
  {
    accessorKey: "ngay",
    header: ({ column }) => <SortableHeader column={column} title="Ngày" />,
    cell: ({ row }) => {
      const ngay = row.getValue("ngay") as string | null | undefined
      const chamSocKhachBuon = row.original
      return (
        <DateCell 
          ngay={ngay} 
          id={chamSocKhachBuon.id!} 
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
      order: 2,
      minWidth: 150,
    },
  },
  {
    accessorKey: "hinh_thuc",
    header: ({ column }) => <SortableHeader column={column} title="Hình Thức" />,
    cell: ({ row }) => {
      const hinhThuc = row.getValue("hinh_thuc") as string | null | undefined
      return (
        <div className="min-w-[120px]">
          {hinhThuc || "-"}
        </div>
      )
    },
    size: 150,
    minSize: 120,
    meta: {
      title: "Hình Thức",
      order: 3,
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
    accessorKey: "ket_qua",
    header: ({ column }) => <SortableHeader column={column} title="Kết Quả" />,
    cell: ({ row }) => {
      const ketQua = row.getValue("ket_qua") as string | null | undefined
      return (
        <div className="min-w-[200px]">
          {ketQua || "-"}
        </div>
      )
    },
    size: 250,
    minSize: 200,
    meta: {
      title: "Kết Quả",
      order: 5,
      minWidth: 200,
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Thao tác</div>,
    cell: ({ row }) => {
      const chamSocKhachBuon = row.original
      return <ActionsCell id={chamSocKhachBuon.id!} />
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

