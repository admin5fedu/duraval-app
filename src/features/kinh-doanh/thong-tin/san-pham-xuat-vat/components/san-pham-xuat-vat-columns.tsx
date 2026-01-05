"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { SanPhamXuatVat } from "../types"
import { sanPhamXuatVatConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Format số tiền VND
function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return "-"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value)
}

// Format phần trăm
function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-"
  return `${value}%`
}

// Get badge color for loại sản phẩm
function getLoaiSanPhamBadgeClass(loai: string | null | undefined): string {
  if (!loai) return "bg-muted text-muted-foreground border-transparent"
  
  // Map loại sản phẩm to colors
  const colorMap: Record<string, string> = {
    "8": "bg-blue-50 text-blue-700 border-blue-200",
    "10": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "": "bg-slate-50 text-slate-700 border-slate-200",
  }
  
  return colorMap[loai] ?? "bg-slate-50 text-slate-700 border-slate-200"
}

// Format loại sản phẩm with prefix
function formatLoaiSanPham(loai: string | null | undefined): string {
  if (!loai || loai === "") return "-"
  return `Loại ${loai}`
}

// Index cell component with navigation
function IndexCell({ index }: { index: number }) {
  const navigate = useNavigate()
  
  return (
    <button
      onClick={() => navigate(`${sanPhamXuatVatConfig.routePath}/${index}`)}
      className="font-medium hover:underline text-left"
    >
      {index}
    </button>
  )
}

export const sanPhamXuatVatColumns: ColumnDef<SanPhamXuatVat>[] = [
  // Select column
  createSelectColumn<SanPhamXuatVat>(),
  {
    accessorKey: "index",
    header: ({ column }) => <SortableHeader column={column} title="STT" />,
    cell: ({ row }) => {
      const index = row.getValue("index") as number
      return <IndexCell index={index} />
    },
    size: 80,
    minSize: 70,
    meta: {
      title: "STT",
      order: 1,
      stickyLeft: true,
      stickyLeftOffset: 40,
      minWidth: 70,
    },
  },
  {
    accessorKey: "ma_hang",
    header: ({ column }) => <SortableHeader column={column} title="Mã hàng" />,
    cell: ({ row }) => {
      const maHang = row.getValue("ma_hang") as string
      return <div className="w-full font-medium whitespace-nowrap px-2">{maHang || "-"}</div>
    },
    size: 180,
    minSize: 150,
    meta: {
      title: "Mã hàng",
      order: 2,
      minWidth: 150,
    },
  },
  {
    accessorKey: "ten_hang_hoa",
    header: ({ column }) => <SortableHeader column={column} title="Tên hàng hóa" />,
    cell: ({ row }) => {
      const tenHangHoa = row.getValue("ten_hang_hoa") as string
      return <div className="min-w-[300px]">{tenHangHoa || "-"}</div>
    },
    size: 400,
    meta: {
      title: "Tên hàng hóa",
      order: 3,
    },
  },
  {
    accessorKey: "dvt",
    header: ({ column }) => <SortableHeader column={column} title="ĐVT" />,
    cell: ({ row }) => {
      const dvt = row.getValue("dvt") as string
      return <div className="min-w-[80px]">{dvt || "-"}</div>
    },
    size: 100,
    meta: {
      title: "ĐVT",
      order: 4,
    },
  },
  {
    accessorKey: "so_luong_ton",
    header: ({ column }) => <SortableHeader column={column} title="Số lượng tồn" />,
    cell: ({ row }) => {
      const soLuongTon = row.getValue("so_luong_ton") as number
      const isZero = soLuongTon === 0
      return (
        <div
          className={cn(
            "w-full text-right whitespace-nowrap px-3",
            isZero && "text-red-600 font-semibold"
          )}
        >
          {soLuongTon.toLocaleString("vi-VN")}
        </div>
      )
    },
    size: 160,
    minSize: 150,
    meta: {
      title: "Số lượng tồn",
      order: 5,
      minWidth: 150,
    },
  },
  {
    accessorKey: "gia_xuat",
    header: ({ column }) => <SortableHeader column={column} title="Giá xuất" />,
    cell: ({ row }) => {
      const giaXuat = row.getValue("gia_xuat") as number
      return <div className="w-full text-right whitespace-nowrap px-3">{formatCurrency(giaXuat)}</div>
    },
    filterFn: (row, id, value) => {
      if (!value || (typeof value !== 'object')) return true
      const { min, max } = value as { min?: number; max?: number }
      const rowValue = row.getValue(id) as number | null | undefined
      
      if (rowValue === null || rowValue === undefined) return false
      
      if (min !== undefined && max !== undefined) {
        return rowValue >= min && rowValue <= max
      } else if (min !== undefined) {
        return rowValue >= min
      } else if (max !== undefined) {
        return rowValue <= max
      }
      
      return true
    },
    size: 180,
    minSize: 160,
    meta: {
      title: "Giá xuất",
      order: 6,
      minWidth: 160,
    },
  },
  {
    accessorKey: "thue_suat",
    header: ({ column }) => <SortableHeader column={column} title="Thuế suất" />,
    cell: ({ row }) => {
      const thueSuat = row.getValue("thue_suat") as number | null
      return <div className="min-w-[100px] text-right">{formatPercentage(thueSuat)}</div>
    },
    filterFn: (row, id, value) => {
      if (!value || (typeof value !== 'object')) return true
      const { min, max } = value as { min?: number; max?: number }
      const rowValue = row.getValue(id) as number | null | undefined
      
      // Handle null values - exclude them from range filters
      if (rowValue === null || rowValue === undefined) return false
      
      if (min !== undefined && max !== undefined) {
        return rowValue >= min && rowValue <= max
      } else if (min !== undefined) {
        return rowValue >= min
      } else if (max !== undefined) {
        return rowValue <= max
      }
      
      return true
    },
    size: 120,
    meta: {
      title: "Thuế suất",
      order: 7,
    },
  },
  {
    accessorKey: "loai_san_pham",
    header: ({ column }) => <SortableHeader column={column} title="Loại sản phẩm" />,
    cell: ({ row }) => {
      const loaiSanPham = row.getValue("loai_san_pham") as string | null
      return (
        <div className="min-w-[150px]">
          {loaiSanPham ? (
            <Badge
              variant="outline"
              className={cn("text-xs", getLoaiSanPhamBadgeClass(loaiSanPham))}
            >
              {formatLoaiSanPham(loaiSanPham)}
            </Badge>
          ) : (
            "-"
          )}
        </div>
      )
    },
    size: 160,
    meta: {
      title: "Loại sản phẩm",
      order: 8,
    },
  },
]

