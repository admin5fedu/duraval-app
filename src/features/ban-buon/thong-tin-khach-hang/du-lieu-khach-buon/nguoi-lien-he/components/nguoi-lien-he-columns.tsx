"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { NguoiLienHe } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { nguoiLienHeConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { DeleteNguoiLienHeButton } from "./delete-nguoi-lien-he-button"

// Name cell component with navigation
function NameCell({ name, id }: { name: string | null; id: number }) {
  const navigate = useNavigate()
  
  return (
    <button
      onClick={() => navigate(`${nguoiLienHeConfig.routePath}/${id}`)}
      className="font-medium hover:underline truncate text-left w-full"
    >
      {name || "-"}
    </button>
  )
}

// Actions cell component
function ActionsCell({ id, name }: { id: number; name: string | null }) {
  const navigate = useNavigate()
  
  return (
    <div className="flex items-center gap-2 justify-end pr-4 min-w-[100px]">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:text-blue-600 shrink-0"
        onClick={(e) => {
          e.stopPropagation()
          navigate(`${nguoiLienHeConfig.routePath}/${id}/sua?returnTo=list`)
        }}
      >
        <span className="sr-only">Edit</span>
        <Edit className="h-4 w-4" />
      </Button>
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <DeleteNguoiLienHeButton id={id} name={name} iconOnly />
      </div>
    </div>
  )
}

export const nguoiLienHeColumns = (): ColumnDef<NguoiLienHe>[] => [
  createSelectColumn<NguoiLienHe>(),
  {
    accessorKey: "ten_lien_he",
    header: ({ column }) => <SortableHeader column={column} title="Tên Liên Hệ" />,
    cell: ({ row }) => {
      const nguoiLienHe = row.original
      return (
        <NameCell 
          name={nguoiLienHe.ten_lien_he} 
          id={nguoiLienHe.id!} 
        />
      )
    },
    size: 200,
    minSize: 150,
    meta: {
      title: "Tên Liên Hệ",
      order: 1,
      stickyLeft: true,
      stickyLeftOffset: 40,
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
    accessorKey: "vai_tro",
    header: ({ column }) => <SortableHeader column={column} title="Vai Trò" />,
    cell: ({ row }) => {
      const vaiTro = row.getValue("vai_tro") as string | null | undefined
      return (
        <div className="min-w-[100px]">
          {vaiTro || "-"}
        </div>
      )
    },
    size: 120,
    minSize: 100,
    meta: {
      title: "Vai Trò",
      order: 3,
      minWidth: 100,
    },
  },
  {
    accessorKey: "so_dien_thoai_1",
    header: ({ column }) => <SortableHeader column={column} title="Số Điện Thoại 1" />,
    cell: ({ row }) => {
      const soDienThoai = row.getValue("so_dien_thoai_1") as string | null | undefined
      return (
        <div className="min-w-[120px] font-mono text-sm">
          {soDienThoai || "-"}
        </div>
      )
    },
    size: 140,
    minSize: 120,
    meta: {
      title: "Số Điện Thoại 1",
      order: 4,
      minWidth: 120,
    },
  },
  {
    accessorKey: "so_dien_thoai_2",
    header: ({ column }) => <SortableHeader column={column} title="Số Điện Thoại 2" />,
    cell: ({ row }) => {
      const soDienThoai = row.getValue("so_dien_thoai_2") as string | null | undefined
      return (
        <div className="min-w-[120px] font-mono text-sm">
          {soDienThoai || "-"}
        </div>
      )
    },
    size: 140,
    minSize: 120,
    meta: {
      title: "Số Điện Thoại 2",
      order: 5,
      minWidth: 120,
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableHeader column={column} title="Email" />,
    cell: ({ row }) => {
      const email = row.getValue("email") as string | null | undefined
      return (
        <div className="min-w-[180px]">
          {email || "-"}
        </div>
      )
    },
    size: 200,
    minSize: 180,
    meta: {
      title: "Email",
      order: 6,
      minWidth: 180,
    },
  },
  {
    accessorKey: "gioi_tinh",
    header: ({ column }) => <SortableHeader column={column} title="Giới Tính" />,
    cell: ({ row }) => {
      const gioiTinh = row.getValue("gioi_tinh") as string | null | undefined
      return (
        <div className="min-w-[80px]">
          {gioiTinh || "-"}
        </div>
      )
    },
    size: 100,
    minSize: 80,
    meta: {
      title: "Giới Tính",
      order: 7,
      minWidth: 80,
    },
  },
  {
    accessorKey: "ngay_sinh",
    header: ({ column }) => <SortableHeader column={column} title="Ngày Sinh" />,
    cell: ({ row }) => {
      const ngaySinh = row.getValue("ngay_sinh") as string | null | undefined
      if (!ngaySinh) return <div className="min-w-[100px]">-</div>
      try {
        const date = new Date(ngaySinh)
        return (
          <div className="min-w-[100px]">
            {format(date, "dd/MM/yyyy", { locale: vi })}
          </div>
        )
      } catch {
        return <div className="min-w-[100px]">{ngaySinh}</div>
      }
    },
    size: 120,
    minSize: 100,
    meta: {
      title: "Ngày Sinh",
      order: 8,
      minWidth: 100,
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Thao Tác</div>,
    cell: ({ row }) => {
      const nguoiLienHe = row.original
      return (
        <ActionsCell 
          id={nguoiLienHe.id!} 
          name={nguoiLienHe.ten_lien_he} 
        />
      )
    },
    size: 100,
    minSize: 100,
    enableSorting: false,
    enableHiding: false,
    meta: {
      title: "Thao Tác",
      order: 999,
      stickyRight: true,
      minWidth: 100,
    },
  },
]

