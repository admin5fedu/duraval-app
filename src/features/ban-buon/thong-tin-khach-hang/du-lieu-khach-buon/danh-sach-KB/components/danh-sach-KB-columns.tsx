"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { DanhSachKB } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteDanhSachKBButton } from "./delete-danh-sach-KB-button"
import { danhSachKBConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
  const navigate = useNavigate()
  
  return (
    <button
      onClick={() => navigate(`${danhSachKBConfig.routePath}/${id}`)}
      className="font-medium hover:underline truncate text-left w-full"
    >
      {name}
    </button>
  )
}

// Actions cell component
function ActionsCell({ id, name }: { id: number; name: string }) {
  const navigate = useNavigate()
  
  return (
    <div className="flex items-center gap-2 justify-end pr-4 min-w-[100px]">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:text-blue-600 shrink-0"
        onClick={(e) => {
          e.stopPropagation()
          navigate(`${danhSachKBConfig.routePath}/${id}/sua?returnTo=list`)
        }}
      >
        <span className="sr-only">Edit</span>
        <Edit className="h-4 w-4" />
      </Button>
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <DeleteDanhSachKBButton id={id} name={name} iconOnly />
      </div>
    </div>
  )
}

export const danhSachKBColumns = (): ColumnDef<DanhSachKB>[] => [
  createSelectColumn<DanhSachKB>(),
  {
    accessorKey: "ma_so",
    header: ({ column }) => <SortableHeader column={column} title="Mã Số" />,
    cell: ({ row }) => {
      const maSo = row.getValue("ma_so") as string | null | undefined
      return (
        <div className="min-w-[100px]">
          {maSo || "-"}
        </div>
      )
    },
    size: 120,
    minSize: 100,
    meta: {
      title: "Mã Số",
      order: 1,
      stickyLeft: true,
      stickyLeftOffset: 40, // After checkbox (40px)
      minWidth: 100,
    },
  },
  {
    accessorKey: "ten_khach_buon",
    header: ({ column }) => <SortableHeader column={column} title="Tên Khách Buôn" />,
    cell: ({ row }) => {
      const khachBuon = row.original
      return (
        <NameCell 
          name={khachBuon.ten_khach_buon} 
          id={khachBuon.id!} 
        />
      )
    },
    size: 250,
    minSize: 200,
    meta: {
      title: "Tên Khách Buôn",
      order: 2,
      stickyLeft: true,
      stickyLeftOffset: 160, // After checkbox (40) + ma_so (120)
      minWidth: 200,
    },
  },
  {
    accessorKey: "so_dien_thoai_1",
    header: ({ column }) => <SortableHeader column={column} title="SĐT 1" />,
    cell: ({ row }) => {
      const sdt = row.getValue("so_dien_thoai_1") as string | null | undefined
      return (
        <div className="min-w-[120px]">
          {sdt || "-"}
        </div>
      )
    },
    size: 140,
    minSize: 120,
    meta: {
      title: "SĐT 1",
      order: 3,
    },
  },
  {
    accessorKey: "so_dien_thoai_2",
    header: ({ column }) => <SortableHeader column={column} title="SĐT 2" />,
    cell: ({ row }) => {
      const sdt = row.getValue("so_dien_thoai_2") as string | null | undefined
      return (
        <div className="min-w-[120px]">
          {sdt || "-"}
        </div>
      )
    },
    size: 140,
    minSize: 120,
    meta: {
      title: "SĐT 2",
      order: 4,
    },
  },
  {
    accessorKey: "loai_khach",
    header: ({ column }) => <SortableHeader column={column} title="Loại Khách" />,
    cell: ({ row }) => {
      const loaiKhach = row.getValue("loai_khach") as string | null | undefined
      return (
        <div className="min-w-[120px]">
          {loaiKhach || "-"}
        </div>
      )
    },
    size: 140,
    minSize: 120,
    meta: {
      title: "Loại Khách",
      order: 5,
    },
  },
  {
    accessorKey: "ten_giai_doan",
    header: ({ column }) => <SortableHeader column={column} title="Giai Đoạn" />,
    filterFn: (row, _id, value) => {
      const giaiDoanId = row.original.giai_doan_id
      if (!giaiDoanId) {
        return value.includes("null") || value.includes("")
      }
      return value.includes(String(giaiDoanId))
    },
    cell: ({ row }) => {
      const tenGiaiDoan = row.original.ten_giai_doan
      const giaiDoanId = row.original.giai_doan_id
      if (!giaiDoanId) {
        return <span className="text-muted-foreground">-</span>
      }
      return (
        <div className="min-w-[150px]">
          {tenGiaiDoan 
            ? `${giaiDoanId} - ${tenGiaiDoan}`
            : String(giaiDoanId)
          }
        </div>
      )
    },
    size: 180,
    minSize: 150,
    meta: {
      title: "Giai Đoạn",
      order: 6,
    },
  },
  {
    accessorKey: "ten_trang_thai",
    header: ({ column }) => <SortableHeader column={column} title="Trạng Thái" />,
    filterFn: (row, _id, value) => {
      const trangThaiId = row.original.trang_thai_id
      if (!trangThaiId) {
        return value.includes("null") || value.includes("")
      }
      return value.includes(String(trangThaiId))
    },
    cell: ({ row }) => {
      const tenTrangThai = row.original.ten_trang_thai
      const trangThaiId = row.original.trang_thai_id
      if (!trangThaiId) {
        return <span className="text-muted-foreground">-</span>
      }
      return (
        <div className="min-w-[150px]">
          {tenTrangThai 
            ? `${trangThaiId} - ${tenTrangThai}`
            : String(trangThaiId)
          }
        </div>
      )
    },
    size: 180,
    minSize: 150,
    meta: {
      title: "Trạng Thái",
      order: 7,
    },
  },
  {
    accessorKey: "mien",
    header: ({ column }) => <SortableHeader column={column} title="Miền" />,
    cell: ({ row }) => {
      const mien = row.getValue("mien") as string | null | undefined
      return (
        <div className="min-w-[100px]">
          {mien || "-"}
        </div>
      )
    },
    size: 120,
    minSize: 100,
    meta: {
      title: "Miền",
      order: 8,
    },
  },
  {
    accessorKey: "tsn_dia_chi_day_du",
    header: ({ column }) => <SortableHeader column={column} title="Địa Chỉ TSN" />,
    cell: ({ row }) => {
      const diaChi = row.getValue("tsn_dia_chi_day_du") as string | null | undefined
      return (
        <div className="max-w-[300px] truncate" title={diaChi || undefined}>
          {diaChi || "-"}
        </div>
      )
    },
    size: 300,
    minSize: 200,
    meta: {
      title: "Địa Chỉ TSN",
      order: 9,
    },
  },
  {
    accessorKey: "ten_tele_sale",
    header: ({ column }) => <SortableHeader column={column} title="Tele Sale" />,
    cell: ({ row }) => {
      const tenTeleSale = row.original.ten_tele_sale
      const teleSaleId = row.original.tele_sale_id
      if (!teleSaleId) {
        return <span className="text-muted-foreground">-</span>
      }
      return (
        <div className="min-w-[150px]">
          {tenTeleSale 
            ? `${teleSaleId} - ${tenTeleSale}`
            : String(teleSaleId)
          }
        </div>
      )
    },
    size: 180,
    minSize: 150,
    meta: {
      title: "Tele Sale",
      order: 10,
    },
  },
  {
    accessorKey: "nguoi_tao_id",
    header: ({ column }) => <SortableHeader column={column} title="Người Tạo" />,
    filterFn: (row, id, value) => {
      const nguoiTaoId = row.getValue(id) as number | null | undefined
      if (!nguoiTaoId) {
        return value.includes("null") || value.includes("")
      }
      return value.includes(String(nguoiTaoId))
    },
    cell: ({ row }) => {
      const nguoiTaoTen = row.original.nguoi_tao_ten
      const nguoiTaoId = row.getValue("nguoi_tao_id") as number | null
      if (!nguoiTaoId) {
        return <span className="text-muted-foreground">-</span>
      }
      return (
        <div className="min-w-[150px]">
          {nguoiTaoTen 
            ? `${nguoiTaoId} - ${nguoiTaoTen}`
            : String(nguoiTaoId)
          }
        </div>
      )
    },
    size: 200,
    minSize: 150,
    meta: {
      title: "Người Tạo",
      order: 11,
    },
  },
  {
    accessorKey: "tg_tao",
    header: ({ column }) => <SortableHeader column={column} title="Thời Gian Tạo" />,
    cell: ({ row }) => {
      const tgTao = row.getValue("tg_tao") as string | null | undefined
      if (!tgTao) return <div className="text-muted-foreground">-</div>
      try {
        return (
          <div className="min-w-[150px]">
            {format(new Date(tgTao), "dd/MM/yyyy HH:mm", { locale: vi })}
          </div>
        )
      } catch {
        return <div className="text-muted-foreground">-</div>
      }
    },
    size: 180,
    minSize: 150,
    meta: {
      title: "Thời Gian Tạo",
      order: 12,
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Thao Tác</div>,
    cell: ({ row }) => {
      const khachBuon = row.original
      return (
        <ActionsCell 
          id={khachBuon.id!} 
          name={khachBuon.ten_khach_buon} 
        />
      )
    },
    size: 120,
    minSize: 100,
    enableSorting: false,
    enableHiding: false,
    meta: {
      title: "Thao Tác",
      order: 999,
      stickyRight: true,
    },
  },
]

