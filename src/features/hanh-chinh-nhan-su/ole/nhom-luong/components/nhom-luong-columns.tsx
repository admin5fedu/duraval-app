"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { NhomLuong } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteNhomLuongButton } from "./delete-nhom-luong-button"
import { nhomLuongConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${nhomLuongConfig.routePath}/${id}`)}
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
                    navigate(`${nhomLuongConfig.routePath}/${id}/sua`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteNhomLuongButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const nhomLuongColumns: ColumnDef<NhomLuong>[] = [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<NhomLuong>(),
    {
        accessorKey: "ten_nhom",
        header: ({ column }) => <SortableHeader column={column} title="Tên Nhóm" />,
        size: 250,
        minSize: 200,
        cell: ({ row }) => {
            const tenNhom = row.getValue("ten_nhom") as string
            const id = row.original.id!
            return <NameCell name={tenNhom} id={id} />
        },
        meta: {
            title: "Tên Nhóm",
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 200,
        },
    },
    {
        accessorKey: "mo_ta",
        header: ({ column }) => <SortableHeader column={column} title="Mô Tả" />,
        size: 300,
        minSize: 250,
        cell: ({ row }) => {
            const moTa = row.getValue("mo_ta") as string | null
            if (!moTa || moTa === "") return <span className="text-muted-foreground">-</span>
            return <span className="truncate">{moTa}</span>
        },
        meta: {
            title: "Mô Tả",
            order: 2,
            minWidth: 250,
        },
    },
    {
        accessorKey: "nguoi_tao_id",
        header: ({ column }) => <SortableHeader column={column} title="Người Tạo" />,
        size: 180,
        minSize: 150,
        cell: ({ row }) => {
            const nguoiTaoId = row.getValue("nguoi_tao_id") as number | null
            const nguoiTaoTen = row.original.nguoi_tao_ten as string | null
            const nguoiTaoMaNhanVien = (row.original as any).nguoi_tao?.ma_nhan_vien as number | null
            if (nguoiTaoId === null || nguoiTaoId === undefined) {
                return <span className="text-muted-foreground">-</span>
            }
            // Use ma_nhan_vien from joined data if available, otherwise use nguoi_tao_id
            const maNhanVien = nguoiTaoMaNhanVien || nguoiTaoId
            return (
                <div className="min-w-[150px]">
                    {nguoiTaoTen 
                        ? `${maNhanVien} - ${nguoiTaoTen}`
                        : maNhanVien.toString()
                    }
                </div>
            )
        },
        meta: {
            title: "Người Tạo",
            order: 3,
            minWidth: 150,
        },
    },
    {
        accessorKey: "tg_tao",
        header: ({ column }) => <SortableHeader column={column} title="Thời gian tạo" />,
        size: 160,
        minSize: 140,
        cell: ({ row }) => {
            const date = row.getValue("tg_tao") as string | null | undefined
            if (!date) return <span className="text-muted-foreground">-</span>
            try {
                return new Date(date).toLocaleString("vi-VN")
            } catch {
                return date
            }
        },
        meta: {
            title: "Thời gian tạo",
            order: 4,
            minWidth: 140,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao tác</div>,
        cell: ({ row }) => {
            const nhomLuong = row.original
            return (
                <ActionsCell
                    id={nhomLuong.id!}
                    name={nhomLuong.ten_nhom}
                />
            )
        },
        enableSorting: false,
        enableHiding: false,
        size: 120,
        minSize: 100,
        meta: {
            title: "Thao tác",
            order: 99,
            stickyRight: true,
            minWidth: 100,
        },
    },
]

