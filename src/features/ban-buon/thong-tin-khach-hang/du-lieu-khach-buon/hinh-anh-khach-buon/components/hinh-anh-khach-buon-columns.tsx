"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { HinhAnhKhachBuon } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { hinhAnhKhachBuonConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { DeleteHinhAnhKhachBuonButton } from "./delete-hinh-anh-khach-buon-button"

// Name cell component with navigation
function NameCell({ name, id }: { name: string | null; id: number }) {
  const navigate = useNavigate()
  
  return (
    <button
      onClick={() => navigate(`${hinhAnhKhachBuonConfig.routePath}/${id}`)}
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
          navigate(`${hinhAnhKhachBuonConfig.routePath}/${id}/sua?returnTo=list`)
        }}
      >
        <span className="sr-only">Edit</span>
        <Edit className="h-4 w-4" />
      </Button>
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <DeleteHinhAnhKhachBuonButton id={id} name={name} iconOnly />
      </div>
    </div>
  )
}

export const hinhAnhKhachBuonColumns = (): ColumnDef<HinhAnhKhachBuon>[] => [
  createSelectColumn<HinhAnhKhachBuon>(),
  {
    accessorKey: "hang_muc",
    header: ({ column }) => <SortableHeader column={column} title="Hạng Mục" />,
    cell: ({ row }) => {
      const hinhAnhKhachBuon = row.original
      return (
        <NameCell 
          name={hinhAnhKhachBuon.hang_muc} 
          id={hinhAnhKhachBuon.id!} 
        />
      )
    },
    size: 200,
    minSize: 150,
    meta: {
      title: "Hạng Mục",
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
    accessorKey: "hinh_anh",
    header: ({ column }) => <SortableHeader column={column} title="Hình Ảnh" />,
    cell: ({ row }) => {
      const hinhAnh = row.getValue("hinh_anh") as string | null | undefined
      return (
        <div className="min-w-[100px]">
          {hinhAnh ? (
            <img 
              src={hinhAnh} 
              alt="Hình ảnh" 
              className="h-12 w-12 object-cover rounded"
            />
          ) : (
            "-"
          )}
        </div>
      )
    },
    size: 120,
    minSize: 100,
    meta: {
      title: "Hình Ảnh",
      order: 3,
      minWidth: 100,
    },
  },
  {
    accessorKey: "mo_ta",
    header: ({ column }) => <SortableHeader column={column} title="Mô Tả" />,
    cell: ({ row }) => {
      const moTa = row.getValue("mo_ta") as string | null | undefined
      return (
        <div className="min-w-[200px] max-w-[400px]">
          <div className="line-clamp-2">{moTa || "-"}</div>
        </div>
      )
    },
    size: 300,
    minSize: 200,
    meta: {
      title: "Mô Tả",
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
        <div className="min-w-[200px] max-w-[400px]">
          <div className="line-clamp-2">{ghiChu || "-"}</div>
        </div>
      )
    },
    size: 300,
    minSize: 200,
    meta: {
      title: "Ghi Chú",
      order: 5,
      minWidth: 200,
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Thao Tác</div>,
    cell: ({ row }) => {
      const hinhAnhKhachBuon = row.original
      return (
        <ActionsCell 
          id={hinhAnhKhachBuon.id!} 
          name={hinhAnhKhachBuon.hang_muc} 
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
