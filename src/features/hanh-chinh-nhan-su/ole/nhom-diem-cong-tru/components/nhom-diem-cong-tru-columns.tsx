"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { NhomDiemCongTru } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteNhomDiemCongTruButton } from "./delete-nhom-diem-cong-tru-button"
import { nhomDiemCongTruConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { SortableHeader } from "@/shared/components"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${nhomDiemCongTruConfig.routePath}/${id}`)}
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
                    navigate(`${nhomDiemCongTruConfig.routePath}/${id}/sua`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteNhomDiemCongTruButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const nhomDiemCongTruColumns: ColumnDef<NhomDiemCongTru>[] = [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<NhomDiemCongTru>(),
    {
        accessorKey: "hang_muc",
        header: ({ column }) => <SortableHeader column={column} title="Hạng Mục" />,
        size: 200,
        minSize: 150,
        meta: {
            title: "Hạng Mục",
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 150,
        },
        cell: ({ row }) => {
            const hangMuc = row.getValue("hang_muc") as string
            const id = row.original.id!
            const navigate = useNavigate()
            
            // Style badge based on value
            const badgeClass = hangMuc === "Cộng" 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            
            return (
                <button
                    onClick={() => navigate(`${nhomDiemCongTruConfig.routePath}/${id}`)}
                    className="hover:underline truncate text-left w-full"
                >
                    <Badge variant="outline" className={cn(badgeClass, "font-medium")}>
                        {hangMuc}
                    </Badge>
                </button>
            )
        },
    },
    {
        accessorKey: "nhom",
        header: ({ column }) => <SortableHeader column={column} title="Nhóm" />,
        size: 200,
        minSize: 150,
        cell: ({ row }) => {
            const nhom = row.getValue("nhom") as string
            const id = row.original.id!
            return <NameCell name={nhom} id={id} />
        },
        meta: {
            title: "Nhóm",
            order: 2,
            minWidth: 150,
        },
    },
    {
        accessorKey: "min",
        header: ({ column }) => <SortableHeader column={column} title="Min" />,
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
            const min = row.getValue("min") as number | null
            if (min === null || min === undefined) return <span className="text-muted-foreground">-</span>
            return <span className="font-medium">{min}</span>
        },
        meta: {
            title: "Min",
            order: 3,
            minWidth: 80,
        },
    },
    {
        accessorKey: "max",
        header: ({ column }) => <SortableHeader column={column} title="Max" />,
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
            const max = row.getValue("max") as number | null
            if (max === null || max === undefined) return <span className="text-muted-foreground">-</span>
            return <span className="font-medium">{max}</span>
        },
        meta: {
            title: "Max",
            order: 4,
            minWidth: 80,
        },
    },
    {
        accessorKey: "mo_ta",
        header: ({ column }) => <SortableHeader column={column} title="Mô Tả" />,
        size: 250,
        minSize: 200,
        cell: ({ row }) => {
            const moTa = row.getValue("mo_ta") as string | null
            if (!moTa || moTa === "") return <span className="text-muted-foreground">-</span>
            return <span className="truncate">{moTa}</span>
        },
        meta: {
            title: "Mô Tả",
            order: 5,
            minWidth: 200,
        },
    },
    {
        accessorKey: "pb_ap_dung_ib",
        header: ({ column }) => <SortableHeader column={column} title="Phòng Ban Áp Dụng" />,
        size: 200,
        minSize: 150,
        cell: ({ row }) => {
            const pbApDung = row.getValue("pb_ap_dung_ib") as number[] | null
            if (!pbApDung || pbApDung.length === 0) {
                return <span className="text-muted-foreground">-</span>
            }
            return (
                <span className="text-sm">
                    {pbApDung.length} phòng ban
                </span>
            )
        },
        meta: {
            title: "Phòng Ban Áp Dụng",
            order: 6,
            minWidth: 150,
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
            order: 7,
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
            order: 8,
            minWidth: 140,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao tác</div>,
        cell: ({ row }) => {
            const nhomDiem = row.original
            return (
                <ActionsCell
                    id={nhomDiem.id!}
                    name={nhomDiem.hang_muc}
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

