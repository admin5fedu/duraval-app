"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { ThongTinCongTy } from "../schema"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { DeleteThongTinCongTyButton } from "./delete-thong-tin-cong-ty-button"
import { thongTinCongTyConfig } from "../config"
import { createSelectColumn } from "@/shared/components/data-display/table/create-select-column"
import { Badge } from "@/components/ui/badge"
import { SortableHeader } from "@/shared/components"

// Name cell component with navigation
function NameCell({ name, id }: { name: string; id: number }) {
    const navigate = useNavigate()
    
    return (
        <button
            onClick={() => navigate(`${thongTinCongTyConfig.routePath}/${id}`)}
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
                    navigate(`${thongTinCongTyConfig.routePath}/${id}/sua`)
                }}
            >
                <span className="sr-only">Edit</span>
                <Edit className="h-4 w-4" />
            </Button>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DeleteThongTinCongTyButton id={id} name={name} iconOnly />
            </div>
        </div>
    )
}

export const thongTinCongTyColumns = (): ColumnDef<ThongTinCongTy>[] => [
    // ⚡ Professional: Use generic select column utility
    createSelectColumn<ThongTinCongTy>(),
    {
        accessorKey: "id",
        header: ({ column }) => <SortableHeader column={column} title="ID" />,
        cell: ({ row }) => <div className="min-w-[70px]">{row.getValue("id")}</div>,
        size: 80,
        minSize: 70,
        meta: {
            title: "ID",
            order: 1,
            stickyLeft: true,
            stickyLeftOffset: 40, // After checkbox column
            minWidth: 70,
        },
    },
    {
        accessorKey: "ma_cong_ty",
        header: ({ column }) => <SortableHeader column={column} title="Mã Công Ty" />,
        size: 150,
        minSize: 120,
        meta: {
            title: "Mã Công Ty",
            order: 2,
            stickyLeft: true,
            stickyLeftOffset: 110, // After checkbox (40) + id (70)
            minWidth: 120,
        },
        cell: ({ row }) => {
            const maCongTy = row.getValue("ma_cong_ty") as string
            const id = row.original.id!
            return (
                <NameCell name={maCongTy} id={id} />
            )
        },
    },
    {
        accessorKey: "ten_cong_ty",
        header: ({ column }) => <SortableHeader column={column} title="Tên Công Ty" />,
        size: 200,
        minSize: 180,
        meta: {
            title: "Tên Công Ty",
            order: 3,
            minWidth: 180,
        },
    },
    {
        accessorKey: "ten_day_du",
        header: ({ column }) => <SortableHeader column={column} title="Tên Đầy Đủ" />,
        size: 250,
        minSize: 200,
        meta: {
            title: "Tên Đầy Đủ",
            order: 4,
            minWidth: 200,
        },
    },
    {
        accessorKey: "email",
        header: ({ column }) => <SortableHeader column={column} title="Email" />,
        size: 200,
        minSize: 180,
        meta: {
            title: "Email",
            order: 5,
            minWidth: 180,
        },
        cell: ({ row }) => {
            const email = row.getValue("email") as string
            return (
                <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
                    {email}
                </a>
            )
        },
    },
    {
        accessorKey: "so_dien_thoai",
        header: ({ column }) => <SortableHeader column={column} title="Số Điện Thoại" />,
        size: 150,
        minSize: 130,
        meta: {
            title: "Số Điện Thoại",
            order: 6,
            minWidth: 130,
        },
    },
    {
        accessorKey: "website",
        header: ({ column }) => <SortableHeader column={column} title="Website" />,
        size: 200,
        minSize: 180,
        meta: {
            title: "Website",
            order: 7,
            minWidth: 180,
        },
        cell: ({ row }) => {
            const website = row.getValue("website") as string
            if (!website) return <span className="text-muted-foreground">-</span>
            return (
                <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {website}
                </a>
            )
        },
    },
    {
        accessorKey: "ap_dung",
        header: ({ column }) => <SortableHeader column={column} title="Áp Dụng" />,
        size: 120,
        minSize: 100,
        filterFn: (row, id, value) => {
            const apDung = row.getValue(id) as boolean | null
            const apDungStr = apDung ? "true" : "false"
            return value.includes(apDungStr)
        },
        cell: ({ row }) => {
            const apDung = row.getValue("ap_dung") as boolean | null
            return (
                <Badge variant={apDung ? "default" : "secondary"}>
                    {apDung ? "Có" : "Không"}
                </Badge>
            )
        },
        meta: {
            title: "Áp Dụng",
            order: 8,
            minWidth: 100,
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
            order: 9,
            minWidth: 140,
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-4">Thao tác</div>,
        cell: ({ row }) => {
            return (
                <ActionsCell
                    id={row.original.id!}
                    name={row.original.ten_cong_ty}
                />
            )
        },
        enableSorting: false,
        enableHiding: false,
        size: 120,
        minSize: 100,
        meta: {
            title: "Thao tác",
            stickyRight: true,
            minWidth: 100,
        },
    },
]

