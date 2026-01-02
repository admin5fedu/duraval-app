"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { PhieuDeXuatBanHang } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeletePhieuDeXuatBanHangButton } from "./delete-phieu-de-xuat-ban-hang-button"
import { phieuDeXuatBanHangConfig } from "../config"
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

// Format ngày
function formatDate(value: string | null | undefined): string {
  if (!value) return "-"
  try {
    return format(new Date(value), "dd/MM/yyyy", { locale: vi })
  } catch {
    return value
  }
}

// ID cell component with navigation
function IdCell({ id }: { id: number }) {
  const navigate = useNavigate()
  
  return (
    <button
      onClick={() => navigate(`${phieuDeXuatBanHangConfig.routePath}/${id}`)}
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
          navigate(`${phieuDeXuatBanHangConfig.routePath}/${id}/sua`)
        }}
      >
        <span className="sr-only">Sửa</span>
        <Edit className="h-4 w-4" />
      </Button>
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <DeletePhieuDeXuatBanHangButton id={id} iconOnly />
      </div>
    </div>
  )
}

export const phieuDeXuatBanHangColumns: ColumnDef<PhieuDeXuatBanHang>[] = [
  // ⚡ Professional: Use generic select column utility
  createSelectColumn<PhieuDeXuatBanHang>(),
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} title="ID" />,
    cell: ({ row }) => {
      const id = row.getValue("id") as number
      return <IdCell id={id} />
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
    accessorKey: "ngay",
    header: ({ column }) => <SortableHeader column={column} title="Ngày" />,
    cell: ({ row }) => {
      const ngay = row.getValue("ngay") as string | null
      return <div className="min-w-[100px]">{formatDate(ngay)}</div>
    },
    size: 120,
    meta: {
      title: "Ngày",
      order: 2,
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
      order: 3,
    },
  },
  {
    accessorKey: "ma_phong",
    header: ({ column }) => <SortableHeader column={column} title="Phòng" />,
    cell: ({ row }) => {
      const rowData = row.original
      const maPhong = rowData.ma_phong as string | null
      const tenPhongBan = rowData.ten_phong_ban as string | null
      const displayValue = maPhong && tenPhongBan 
        ? `${maPhong} - ${tenPhongBan}` 
        : maPhong || tenPhongBan || "-"
      return <div className="min-w-[150px]">{displayValue}</div>
    },
    size: 180,
    meta: {
      title: "Phòng",
      order: 4,
    },
  },
  {
    accessorKey: "ma_nhom",
    header: ({ column }) => <SortableHeader column={column} title="Nhóm" />,
    cell: ({ row }) => {
      const rowData = row.original
      const maNhom = rowData.ma_nhom as string | null
      const tenNhom = rowData.ten_nhom as string | null
      const displayValue = maNhom && tenNhom 
        ? `${maNhom} - ${tenNhom}` 
        : maNhom || tenNhom || "-"
      return <div className="min-w-[150px]">{displayValue}</div>
    },
    size: 180,
    meta: {
      title: "Nhóm",
      order: 5,
    },
  },
  {
    accessorKey: "loai_quy",
    header: ({ column }) => <SortableHeader column={column} title="Loại quỹ" />,
    cell: ({ row }) => {
      const loaiQuy = row.getValue("loai_quy") as string | null
      return <div className="min-w-[120px]">{loaiQuy ?? "-"}</div>
    },
    size: 150,
    meta: {
      title: "Loại quỹ",
      order: 6,
    },
  },
  {
    accessorKey: "ten_loai_phieu",
    header: ({ column }) => <SortableHeader column={column} title="Loại phiếu" />,
    cell: ({ row }) => {
      const tenLoaiPhieu = row.getValue("ten_loai_phieu") as string | null
      return <div className="min-w-[120px]">{tenLoaiPhieu ?? "-"}</div>
    },
    size: 150,
    meta: {
      title: "Loại phiếu",
      order: 7,
    },
  },
  {
    accessorKey: "ten_hang_muc",
    header: ({ column }) => <SortableHeader column={column} title="Hạng mục" />,
    cell: ({ row }) => {
      const tenHangMuc = row.getValue("ten_hang_muc") as string | null
      return <div className="min-w-[120px]">{tenHangMuc ?? "-"}</div>
    },
    size: 150,
    meta: {
      title: "Hạng mục",
      order: 8,
    },
  },
  {
    accessorKey: "so_hoa_don",
    header: ({ column }) => <SortableHeader column={column} title="Số hóa đơn" />,
    cell: ({ row }) => {
      const soHoaDon = row.getValue("so_hoa_don") as string | null
      return <div className="min-w-[120px]">{soHoaDon ?? "-"}</div>
    },
    size: 150,
    meta: {
      title: "Số hóa đơn",
      order: 9,
    },
  },
  {
    accessorKey: "tien_don_hang",
    header: ({ column }) => <SortableHeader column={column} title="Tiền đơn hàng" />,
    cell: ({ row }) => {
      const tienDonHang = row.getValue("tien_don_hang") as number | null
      return <div className="min-w-[130px] text-right">{formatCurrency(tienDonHang)}</div>
    },
    size: 150,
    meta: {
      title: "Tiền đơn hàng",
      order: 10,
    },
  },
  {
    accessorKey: "tong_ck",
    header: ({ column }) => <SortableHeader column={column} title="Tổng CK" />,
    cell: ({ row }) => {
      const tongCk = row.getValue("tong_ck") as number | null
      return <div className="min-w-[120px] text-right">{formatCurrency(tongCk)}</div>
    },
    size: 150,
    meta: {
      title: "Tổng CK",
      order: 11,
    },
  },
  {
    accessorKey: "trang_thai",
    header: ({ column }) => <SortableHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => {
      const trangThai = row.getValue("trang_thai") as string | null
      return <div className="min-w-[100px]">{trangThai ?? "-"}</div>
    },
    size: 120,
    meta: {
      title: "Trạng thái",
      order: 12,
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
      order: 13,
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

