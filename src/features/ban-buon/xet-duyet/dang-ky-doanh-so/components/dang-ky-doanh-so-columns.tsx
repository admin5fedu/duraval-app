"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { DangKyDoanhSo } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { dangKyDoanhSoConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { formatNumber } from "@/shared/utils/detail-utils"
import { DeleteDangKyDoanhSoButton } from "./delete-dang-ky-doanh-so-button"

// Number cell component
function NumberCell({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) return <span>-</span>
  return <span>{formatNumber(value)}</span>
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
          navigate(`${dangKyDoanhSoConfig.routePath}/${id}/sua?returnTo=list`)
        }}
      >
        <span className="sr-only">Edit</span>
        <Edit className="h-4 w-4" />
      </Button>
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <DeleteDangKyDoanhSoButton id={id} iconOnly />
      </div>
    </div>
  )
}

export const dangKyDoanhSoColumns = (): ColumnDef<DangKyDoanhSo>[] => [
  createSelectColumn<DangKyDoanhSo>(),
  {
    accessorKey: "nam",
    header: ({ column }) => <SortableHeader column={column} title="Năm" />,
    cell: ({ row }) => {
      const nam = row.getValue("nam") as number | null | undefined
      return (
        <div className="min-w-[80px]">
          {nam ?? "-"}
        </div>
      )
    },
    size: 100,
    minSize: 80,
      meta: {
        title: "Năm",
        order: 1,
        minWidth: 80,
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
        order: 2,
        minWidth: 200,
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
        order: 3,
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
        order: 4,
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
        order: 5,
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
        order: 6,
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
        order: 7,
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
        order: 8,
        minWidth: 200,
      },
  },
  {
    accessorKey: "link_hop_dong",
    header: ({ column }) => <SortableHeader column={column} title="Link Hợp Đồng" />,
    cell: ({ row }) => {
      const linkHopDong = row.getValue("link_hop_dong") as string | null | undefined
      if (!linkHopDong) return <div className="min-w-[150px]">-</div>
      return (
        <div className="min-w-[150px]">
          <a 
            href={linkHopDong} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline truncate block"
            onClick={(e) => e.stopPropagation()}
          >
            {linkHopDong.length > 30 ? `${linkHopDong.substring(0, 30)}...` : linkHopDong}
          </a>
        </div>
      )
    },
    size: 200,
    minSize: 150,
      meta: {
        title: "Link Hợp Đồng",
        order: 9,
        minWidth: 150,
      },
  },
  {
    accessorKey: "file_hop_dong",
    header: ({ column }) => <SortableHeader column={column} title="File Hợp Đồng" />,
    cell: ({ row }) => {
      const fileHopDong = row.getValue("file_hop_dong") as string | null | undefined
      if (!fileHopDong) return <div className="min-w-[150px]">-</div>
      return (
        <div className="min-w-[150px]">
          <a 
            href={fileHopDong} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline truncate block"
            onClick={(e) => e.stopPropagation()}
          >
            Xem file
          </a>
        </div>
      )
    },
    size: 150,
    minSize: 120,
      meta: {
        title: "File Hợp Đồng",
        order: 10,
        minWidth: 120,
      },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Thao tác</div>,
    cell: ({ row }) => {
      const dangKyDoanhSo = row.original
      return <ActionsCell id={dangKyDoanhSo.id!} />
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

