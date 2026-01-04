"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { MucDangKy } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteMucDangKyButton } from "./delete-muc-dang-ky-button"
import { mucDangKyConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { formatNumber } from "@/shared/utils/detail-utils"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
  const navigate = useNavigate()
  
  return (
    <button
      onClick={() => navigate(`${mucDangKyConfig.routePath}/${id}`)}
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
          navigate(`${mucDangKyConfig.routePath}/${id}/sua?returnTo=list`)
        }}
      >
        <span className="sr-only">Edit</span>
        <Edit className="h-4 w-4" />
      </Button>
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <DeleteMucDangKyButton id={id} name={name} iconOnly />
      </div>
    </div>
  )
}

export const mucDangKyColumns = (): ColumnDef<MucDangKy>[] => [
  createSelectColumn<MucDangKy>(),
  {
    accessorKey: "ma_hang",
    header: ({ column }) => <SortableHeader column={column} title="Mã Hạng" />,
    cell: ({ row }) => {
      const maHang = row.getValue("ma_hang") as string | null | undefined
      return (
        <div className="min-w-[100px]">
          {maHang || "-"}
        </div>
      )
    },
    size: 120,
    minSize: 100,
    meta: {
      title: "Mã Hạng",
      order: 1,
      stickyLeft: true,
      stickyLeftOffset: 40, // After checkbox column (40px)
      minWidth: 100,
    },
  },
  {
    accessorKey: "ten_hang",
    header: ({ column }) => <SortableHeader column={column} title="Tên Hạng" />,
    cell: ({ row }) => {
      const mucDangKy = row.original
      return (
        <NameCell 
          name={mucDangKy.ten_hang} 
          id={mucDangKy.id!} 
        />
      )
    },
    size: 200,
    minSize: 150,
    meta: {
      title: "Tên Hạng",
      order: 2,
      stickyLeft: true,
      stickyLeftOffset: 160, // After checkbox (40) + ma_hang (120)
      minWidth: 150,
    },
  },
  {
    accessorKey: "doanh_so_min_quy",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <SortableHeader column={column} title="Doanh Số Min (Quý)" />
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("doanh_so_min_quy") as number | null | undefined
      return (
        <div className="text-center min-w-[150px]">
          {value !== null && value !== undefined ? formatNumber(value) : "-"}
        </div>
      )
    },
    size: 180,
    minSize: 150,
    meta: {
      title: "Doanh Số Min (Quý)",
      order: 3,
    },
  },
  {
    accessorKey: "doanh_so_max_quy",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <SortableHeader column={column} title="Doanh Số Max (Quý)" />
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("doanh_so_max_quy") as number | null | undefined
      return (
        <div className="text-center min-w-[150px]">
          {value !== null && value !== undefined ? formatNumber(value) : "-"}
        </div>
      )
    },
    size: 180,
    minSize: 150,
    meta: {
      title: "Doanh Số Max (Quý)",
      order: 4,
    },
  },
  {
    accessorKey: "doanh_so_min_nam",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <SortableHeader column={column} title="Doanh Số Min (Năm)" />
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("doanh_so_min_nam") as number | null | undefined
      return (
        <div className="text-center min-w-[150px]">
          {value !== null && value !== undefined ? formatNumber(value) : "-"}
        </div>
      )
    },
    size: 180,
    minSize: 150,
    meta: {
      title: "Doanh Số Min (Năm)",
      order: 5,
    },
  },
  {
    accessorKey: "doanh_so_max_nam",
    header: ({ column }) => (
      <div className="flex justify-center w-full">
        <SortableHeader column={column} title="Doanh Số Max (Năm)" />
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("doanh_so_max_nam") as number | null | undefined
      return (
        <div className="text-center min-w-[150px]">
          {value !== null && value !== undefined ? formatNumber(value) : "-"}
        </div>
      )
    },
    size: 180,
    minSize: 150,
    meta: {
      title: "Doanh Số Max (Năm)",
      order: 6,
    },
  },
  {
    accessorKey: "ghi_chu",
    header: ({ column }) => <SortableHeader column={column} title="Ghi Chú" />,
    cell: ({ row }) => {
      const ghiChu = row.getValue("ghi_chu") as string | null | undefined
      return (
        <div className="max-w-[300px] truncate" title={ghiChu || undefined}>
          {ghiChu || "-"}
        </div>
      )
    },
    size: 300,
    minSize: 200,
    meta: {
      title: "Ghi Chú",
      order: 7,
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
      order: 8,
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
      order: 9,
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Thao Tác</div>,
    cell: ({ row }) => {
      const mucDangKy = row.original
      return (
        <ActionsCell 
          id={mucDangKy.id!} 
          name={mucDangKy.ten_hang} 
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
